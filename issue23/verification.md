# CSV confirmation verification

Implementation revision: `0ce83296506284e39549277fbf6441135442ce4c`.
Only disposable local synthetic accounts and records were used. No hosted migration or deployment was performed.

- Lint, TypeScript, 173 unit/UI tests, production webpack build and diff checks passed. Default Turbopack failed when its CSS worker attempted a prohibited local port bind; webpack production compilation completed.
- Local migration upgrade and clean replay passed; two-owner business RLS checks passed.
- 14 pgTAP assertions passed, including an induced failure on the second row: zero businesses and zero receipts remained; the same request succeeded once after removing the trigger.
- HTTP integration: eight simultaneous confirmations returned 1 and inserted one batch. Discarding a response and retrying returned the original count. Changed payload was rejected. Owner two could not read owner one's receipt or alter its business. Direct receipt writes were denied. Retry after editing/deleting a business did not recreate it.
- Browser: mixed CSV reviewed two valid, one invalid and one duplicate. Cancel cleared the review, with no inserted synthetic rows. A temporary database trigger forced confirmation failure: synthetic rows stayed at 0 and total receipts stayed at 2 (the existing HTTP test receipts). The UI showed a pending outcome and retained the same request for retry. Removing the trigger and retrying reported 2 inserted, 1 invalid and 1 duplicate skipped. The business list still showed exactly those two imports after reload; the preexisting demo business remained. Zero-valid review disabled confirmation.
- Auth, changed bytes, oversized/invalid files, tampered tokens, forged owner/count fields, stale review responses and uncertain response behavior are covered in application tests. Live expired authentication was observed after a disposable database reset; the user was required to sign in again.

Screenshots: review before confirmation; uncertain result and same-request retry; business list after successful retry and reload. Final validation tightening and retained-file cleanup were followed by the full application checks and clean database replay/integration suite.
