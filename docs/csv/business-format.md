# Business CSV validation

Signed-in users can open **Review CSV** from the business list, or visit
`/admin/businesses/import`, to download this sample and review an upload. The
server authenticates before reading file bytes, checks size and logical record
limits before full parsing, and returns normalized valid rows, field errors,
duplicate references and counts. Files are processed in memory; there is no
upload storage. Review and cancel write no business records. Explicit confirmation
saves only valid unique rows atomically, skipping invalid rows and within-file
duplicates. The result reports inserted and skipped counts; open the business list
and reload to verify persistence. Existing businesses are not matched or updated.
Replacing a file, cancelling, leaving the page, or refreshing clears the review.
File errors also clear previous results. CSV values are displayed as text.

If confirmation reports an unknown outcome, keep the page open and retry the same
request. A fresh review creates a new request and can create additional businesses
from the same file. See [confirmation setup and retry guarantees](confirmation.md)
for the required migration and stable server-only signing secret.

The action transport allows 2 MiB including multipart overhead so files at the
1 MiB boundary reach application validation. Larger transport failures show a
safe retry error; the application file limit remains 1 MiB.

`parseBusinessCsv(bytes: Uint8Array)` in `apps/web/lib/business-csv/parser.ts`
validates bytes only. It has no database, authentication, upload, or network operations.

Use UTF-8 (an initial UTF-8 BOM is allowed), comma delimiters and LF or CRLF record
endings. Quote fields containing commas, newlines or double quotes; escape a quote
as `""` within a quoted field. Quotes must surround the entire field. Bare CR record
endings and text after a closing quote are rejected.

Headers are exact and case-sensitive, in any order. `name` and `industry` are
required. `phone`, `email`, `website`, `city`, and `state` are optional. Unknown,
duplicate, padded, or missing required headers fail, including `owner_id`.
See the [synthetic sample](../../apps/web/lib/business-csv/fixtures/sample.csv).

The input limit is 1 MiB (1,048,576 bytes, including any BOM). At most 500 nonblank
data records are allowed, including invalid rows and duplicates. Records whose
fields are all empty or whitespace are ignored, including before the header.
Ignored data records still occupy record numbers. The first record after the
header is 1; a newline inside quotes does not start another record. Nonblank
records must have exactly the header's field count.

All fields remain text, including phone numbers with leading zeroes. Existing
business validation trims values, converts empty optional values to undefined,
and validates lengths, email and website without changing those shared rules.
Invalid rows report field errors and are excluded from valid rows. Exact duplicates
of all seven normalized fields keep the first valid occurrence and report the
skipped record and its first record number. Comparisons are case-sensitive;
there is no fuzzy matching or database lookup.

Success returns normalized `rows` with record numbers, `invalidRows` with field
errors, `duplicates`, and `counts` (`valid`, `invalid`, `duplicate`). File failure
returns only `{ ok: false, error }`, with no partial rows or raw input. Error codes
are `too_large`, `invalid_utf8`, `empty`, `malformed_csv`, `invalid_headers`,
`field_count`, and `too_many_records`. Empty and header-only files fail.
The parser never logs input.

Run the focused fixtures and boundary checks from `apps/web`:

```sh
npm run test -- lib/business-csv/parser.test.ts
```

For explicit import confirmation, retry guarantees and server setup, see
[Confirming CSV imports](confirmation.md).
