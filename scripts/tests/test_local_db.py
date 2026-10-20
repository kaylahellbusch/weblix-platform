"""Safety checks for local environment targeting; no Docker or hosted access."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('local_db', Path(__file__).parents[1] / 'local-db.py')
local_db = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local_db)
REAL_CLI = local_db.cli


class LocalTargetTests(unittest.TestCase):
    def test_hosted_api_is_rejected(self):
        with patch.object(local_db, 'cli', return_value=json.dumps({'API_URL': 'https://example.supabase.co'})):
            with self.assertRaisesRegex(RuntimeError, 'non-local'):
                local_db.status()

    def test_existing_environment_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            env = root / 'apps/web/.env.local'
            env.parent.mkdir(parents=True)
            original = 'NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co\n'
            env.write_text(original)
            with patch.object(local_db, 'ROOT', root):
                with self.assertRaisesRegex(RuntimeError, 'preserved'):
                    local_db.environment({'API_URL': 'http://127.0.0.1:55001', 'ANON_KEY': 'test'})
            self.assertEqual(env.read_text(), original)

    def test_generated_environment_contains_only_public_local_key(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'apps/web').mkdir(parents=True)
            with patch.object(local_db, 'ROOT', root):
                local_db.environment({'API_URL': 'http://127.0.0.1:55001', 'ANON_KEY': 'public-test', 'SERVICE_ROLE_KEY': 'must-not-copy'})
            content = (root / 'apps/web/.env.local').read_text()
            self.assertIn('http://127.0.0.1:55001', content)
            self.assertNotIn('must-not-copy', content)


class FeatureTestTests(unittest.TestCase):
    def setUp(self):
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.root = Path(self.stack.enter_context(tempfile.TemporaryDirectory()))
        self.runtime = self.root / '.supabase-local'
        self.config = self.runtime / 'supabase/config.toml'
        self.config.parent.mkdir(parents=True)
        self.config.write_text('test runtime')
        for name, value in [('ROOT', self.root), ('RUNTIME', self.runtime), ('CONFIG', self.config)]:
            self.stack.enter_context(patch.object(local_db, name, value))
        self.source = self.root / 'supabase/tests/content.test.sql'
        self.source.parent.mkdir(parents=True)
        self.source.write_text('select plan(1);')
        self.discovery = subprocess.CompletedProcess([], 0, 'supabase/tests/content.test.sql\0', '')
        self.runner = self.stack.enter_context(patch.object(local_db.subprocess, 'run', return_value=self.discovery))
        self.cli = self.stack.enter_context(patch.object(local_db, 'cli', return_value=
            'All tests successful.\nFiles=1, Tests=29, 0 wallclock secs\nResult: PASS\n'))

    def test_refreshes_only_tracked_suites_and_removes_stale_copies(self):
        local_db.feature_tests()
        target = self.runtime / 'supabase/tests/content.test.sql'
        self.assertEqual(target.read_text(), self.source.read_text())
        (target.parent / 'stale.sql').write_text('stale')
        (self.source.parent / 'untracked.sql').write_text('not tracked')
        self.source.write_text('changed assertion')
        local_db.feature_tests()
        self.assertEqual(target.read_text(), 'changed assertion')
        self.assertEqual(list(target.parent.iterdir()), [target])
        self.cli.assert_called_with('test', 'db', '--local', 'supabase/tests/content.test.sql', include_stderr=True)
        self.assertEqual(self.runner.call_args.args[0],
                         ['git', '-C', str(self.root), 'ls-files', '-z', '--', 'supabase/tests'])

    def test_missing_or_empty_suites_fail_before_runner(self):
        for output in ['', 'supabase/tests/missing.sql\0']:
            with self.subTest(output=output):
                self.discovery.stdout = output
                with self.assertRaises(RuntimeError):
                    local_db.feature_tests()
        self.cli.assert_not_called()

    def test_nested_suites_and_neighbor_worktree_are_preserved(self):
        nested = self.source.parent / 'nested/extra.sql'
        nested.parent.mkdir()
        nested.write_text('extra assertions')
        neighbor = self.root / 'other-worktree/.supabase-local/supabase/tests/other.sql'
        neighbor.parent.mkdir(parents=True)
        neighbor.write_text('other owner')
        env = self.root / 'apps/web/.env.local'
        env.parent.mkdir(parents=True)
        env.write_text('existing environment')
        self.discovery.stdout += 'supabase/tests/nested/extra.sql\0'
        self.cli.return_value = 'All tests successful.\nFiles=2, Tests=30\nResult: PASS\n'
        local_db.feature_tests()
        self.assertEqual((self.runtime / 'supabase/tests/nested/extra.sql').read_text(), 'extra assertions')
        self.assertEqual(neighbor.read_text(), 'other owner')
        self.assertEqual(env.read_text(), 'existing environment')

    def test_zero_exit_without_positive_complete_summary_fails(self):
        for output in ['', 'No tests found', 'Result: FAIL',
                       'All tests successful.\nFiles=1, Tests=0\nResult: PASS\n',
                       'not ok 1 - fails\nAll tests successful.\nFiles=1, Tests=29\nResult: PASS\n',
                       'All tests successful.\nFiles=2, Tests=29\nResult: PASS\n']:
            with self.subTest(output=output):
                self.cli.return_value = output
                with self.assertRaisesRegex(RuntimeError, 'complete passing run'):
                    local_db.feature_tests()
                self.assertEqual((self.runtime / 'last-error.log').stat().st_mode & 0o777, 0o600)

    def test_cli_failure_propagates(self):
        self.cli.side_effect = RuntimeError('runner failed')
        with self.assertRaisesRegex(RuntimeError, 'runner failed'):
            local_db.feature_tests()

    def test_main_checks_stack_before_tests_without_mutating_environment(self):
        with patch.object(sys, 'argv', ['local-db.py', 'test']), \
                patch.object(local_db, 'status', side_effect=RuntimeError('stack unavailable')), \
                patch.object(local_db, 'feature_tests') as tests, \
                patch.object(local_db, 'environment') as environment:
            with self.assertRaisesRegex(RuntimeError, 'stack unavailable'):
                local_db.main()
            tests.assert_not_called()
            environment.assert_not_called()

    def test_cli_uses_assigned_runtime_and_keeps_failure_diagnostics_private(self):
        self.runner.return_value = subprocess.CompletedProcess([], 1, 'secret stdout', 'secret stderr')
        with self.assertRaisesRegex(RuntimeError, 'inspect') as error:
            REAL_CLI('test', 'db', '--local')
        self.assertNotIn('secret', str(error.exception))
        self.assertEqual(self.runner.call_args.args[0],
                         ['supabase', '--workdir', str(self.runtime), 'test', 'db', '--local'])
        self.assertEqual((self.runtime / 'last-error.log').read_text(), 'secret stdoutsecret stderr')

    def test_missing_cli_fails(self):
        self.runner.side_effect = FileNotFoundError()
        with self.assertRaisesRegex(RuntimeError, 'CLI is required'):
            REAL_CLI('test', 'db', '--local')

    def test_runner_summary_on_stderr_is_retained(self):
        self.runner.return_value = subprocess.CompletedProcess([], 0, '', 'runner summary')
        self.assertEqual(REAL_CLI('test', 'db', '--local', include_stderr=True), 'runner summary')

if __name__ == '__main__':
    unittest.main()
