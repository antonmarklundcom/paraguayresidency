# `private/`

Files served **only** through a signed, counted download endpoint
(`/api/download/[token]`). Nothing in here is reachable by URL: it is outside
`public/`, so Next never serves it as a static asset.

`products.file_key` names a file in this directory. The endpoint resolves the
key with `resolvePrivateFile()` in `src/lib/download-policy.ts`, which refuses
absolute paths and anything containing `..`, so a key can never escape here.

Set `GUIDE_FILE_URL` instead to serve the file from an object store; the
endpoint then redirects to that URL and this directory is unused.

The real guide PDF is never committed (plan §12). `guide-placeholder.pdf` is a
stand-in so the download path can be tested end to end; phase S5 replaces it
with the outline placeholder, and Anton supplies the real file (plan §7).
