# Website content destination contract

`websiteContentSchema` validates unknown input; `WebsiteContent` is its inferred
normalized type. Objects reject unknown fields. Headline (max 160) and introduction
(max 2000) are trimmed; missing/blank text becomes undefined. Arrays default to
empty: services allows 20 ordered title/description pairs (1–120/1–1000 trimmed
characters); serviceAreas allows 50 ordered strings (1–120 trimmed characters).
Nulls, wrong types, blank entries and excess lengths/counts fail with Zod issues.
Strings are literal plain text, including markup characters. Consumers must render
text safely and never interpret these values as HTML.

`toWebsitePreview(business, content?)` validates optional content and returns a fresh
`WebsitePreview`. Business facts reuse a Pick of the existing Business type and
are copied unchanged; content cannot override them. Missing headline falls back
to the business name. Missing introduction and empty arrays omit their section
keys. Missing or invalid contacts omit their action keys. Phones allow digits,
an optional leading plus and common formatting. Emails validate and are URI
encoded. Websites require HTTP(S). Invalid contact values remain in business facts.
No claims are generated. There is no persistence, renderer, UI, AI or publishing.

Synthetic fixtures are in `fixtures.ts`. Reproduce runtime examples from apps/web:

```sh
npx vite-node lib/website-content/example.ts
```
