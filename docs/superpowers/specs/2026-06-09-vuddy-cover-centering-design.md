# Vuddy cover centering design

## Goal

Center `Vuddy_logo-01.png` vertically within the 1280x720 slide frame and
position the cover title directly below it without moving the VARISTA footer.

## Design

- Position the Vuddy logo independently at `top: 50%` of the cover slide.
- Offset the logo by half its own height with `translateY(-50%)`.
- Keep the current 980px maximum logo width and left alignment.
- Position the title 34px below the logo on desktop and 24px below it on narrow
  screens.
- Avoid relying on the cover section's display mode because Reveal.js applies
  an inline `display: block` style to the active slide.
- Keep the VARISTA footer at its existing 24px bottom offset.

## Verification

- A static regression test checks the logo and title positioning rules.
- Browser geometry at 1280x720 confirms the Vuddy logo center matches the slide
  center and the title remains below the logo without overlapping the footer.
- PDF export confirms print geometry matches the browser layout.
