# Vuddy PDF Direct Download Design

## Goal

Add a persistent PDF download control near the upper-right corner of the Vuddy Reveal.js presentation. Clicking it downloads a pre-generated PDF immediately, with one 16:9 slide per PDF page.

## Scope

- Modify `pages/service-introduction-materials/vuddy/index.html`.
- Modify `scripts/build-pages.mjs` so colocated PDF files are copied to `_site`.
- Add `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`.
- Add a repeatable local export script under `scripts/`.
- Add only the minimum project metadata needed to run the export script if the repository does not already provide it.
- Do not add server-side PDF generation or generate a PDF in the visitor's browser.

## User Experience

- Show a fixed upper-right button containing a download icon and the label `PDF`.
- Use a white background, dark icon/text, a subtle border, rounded corners, and a shadow.
- Keep the control visible while navigating between slides.
- Provide a Japanese accessible label describing the PDF download.
- Hide the control from the generated PDF and other print output.
- Use an HTML download link so activation starts a direct file download instead of opening a print dialog.
- Use `vuddy-service-introduction.pdf` as the downloaded filename.

## PDF Output

- Generate the PDF from the existing Reveal.js presentation in Chromium.
- Preserve the configured `1280 x 720` slide size, giving each page a 16:9 aspect ratio.
- Produce exactly one PDF page per top-level slide.
- Set Reveal.js `pdfMaxPagesPerSlide` to `1`.
- Print backgrounds and use no PDF margins.
- Wait for Reveal.js initialization and document fonts before export.
- Wait for Reveal.js, document fonts, stylesheets, and local images before capture.
- Treat the cross-origin interactive-video iframe as best effort: allow time for it to render, but do not fail the complete PDF export when the remote embed is unavailable.
- The export must fail with a non-zero exit code when the presentation cannot load or the PDF cannot be written.

## Components

### Presentation UI

`pages/service-introduction-materials/vuddy/index.html` owns the fixed download link and its responsive, hover, focus, and print-hidden styles. The link points to the colocated PDF using a relative URL.

### PDF Export Script

A Node.js script under `scripts/` owns local HTTP serving, Chromium launch, navigation to the presentation's print view, readiness checks, PDF creation, and cleanup. It provides one command that can be rerun after future HTML changes.

### Site Build

`scripts/build-pages.mjs` copies the generated PDF beside the copied static `index.html`. The build continues to copy only explicitly supported static presentation files rather than recursively copying arbitrary source files.

### Generated PDF

`pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf` is a committed distribution artifact. The web page never generates or mutates it at runtime.

## Error Handling

- The export script logs a concise failure reason and exits non-zero if Chromium is unavailable, navigation fails, Reveal.js does not initialize, required first-party resources time out, or PDF creation fails.
- A failure of the cross-origin iframe alone does not fail export.
- Temporary local server and browser processes are closed in success and failure paths.
- The download link remains valid in both the source tree and the repository's generated site because the PDF is colocated with the HTML page.

## Verification

- A structural test verifies that the HTML contains a direct download link, the expected PDF filename, an accessible label, and print-hidden styling.
- An export test runs the PDF generator and verifies that the output file exists.
- PDF inspection verifies 16:9 page dimensions and that the page count equals the number of top-level Reveal.js slides.
- Browser verification checks the fixed upper-right position, hover/focus behavior, slide navigation, and successful direct download.
- The existing site build command, `node scripts/build-pages.mjs`, must continue to succeed and copy the PDF to the generated site.

## Maintenance

The HTML presentation is expected to change rarely. When it changes, rerun the documented export command and commit the regenerated PDF alongside the HTML change.
