"""Safety checks for local environment targeting; no Docker or hosted access."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('local_db', Path(__file__).parents[1] / 'local-db.py')
local_db = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local_db)


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


if __name__ == '__main__':
    unittest.main()
