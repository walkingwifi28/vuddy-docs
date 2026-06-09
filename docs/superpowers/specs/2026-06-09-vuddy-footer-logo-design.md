# Vuddy footer logo alignment design

## Goal

Place every `VARISTA_logo.png` inside the Reveal.js 16:9 slide frame, aligned
consistently near the bottom with 24px of logical slide-space below it.

## Design

- Make each top-level Reveal.js slide section fill the configured 1280x720
  logical slide height.
- Keep the existing absolutely positioned `.slide-footer-logo` element centered
  horizontally.
- Change its vertical offset to `bottom: 24px`.
- Preserve the current logo sizes for desktop and narrow-screen layouts.
- Keep print/PDF output at 1280x720 so browser and exported placement match.
- Preserve the captured 720px section height when the PDF exporter recreates
  the browser layout for printing.

## Verification

- A static regression test checks that top-level sections use the full 720px
  logical height and that the footer logo uses a 24px bottom offset.
- Browser inspection at 1280x720 confirms the rendered logo remains within the
  16:9 frame and retains the requested lower margin.
- The existing page build and PDF export checks are run where available.
