# Sales Vuddy Presentation Design

## Goal

Create a sales-content presentation at
`pages/service-introduction-materials/sales-vuddy/index.html` using the same
Reveal.js structure and visual language as the existing Vuddy service
introduction presentation.

## Scope

- Create `pages/service-introduction-materials/sales-vuddy/index.html`.
- Reuse the existing Vuddy presentation's layout, responsive behavior, colors,
  typography, navigation, and shared image assets.
- Replace the business-card-specific story with the sales-content use case from
  `pages/service-materials/index.md`.
- Keep `pages/service-introduction-materials/vuddy/index.html` unchanged.
- Do not create or link a PDF because the requested deliverable is the HTML
  presentation and no sales presentation PDF exists.
- Do not embed an unrelated Vuddy demo. Show the sales branching experience as
  an HTML mockup inside the presentation instead.

## Audience And Story

The presentation is for B2B sales teams that send the same materials to
prospects whose concerns and buying stages differ.

The story follows two roles from the source material:

- A salesperson at a 150-person business-management SaaS company who handles
  about 50 prospects per month and wants to understand interests before the
  first meeting.
- An information-systems manager at a 300-person manufacturer who is comparing
  services and wants to review features, implementation effort, security, and
  relevant case studies.

The presentation moves from the limits of uniform sales materials to a
self-directed interactive experience, then explains how viewing data improves
follow-up and meeting quality.

## Presentation Structure

Retain the existing 17-slide sequence:

1. Cover
2. Introduction
3. Problem
4. Solution
5. Overview
6. Viewer Experience
7. Features
8. Analytics
9. Use Cases
10. Benefits
11. Comparison
12. Example
13. Price
14. Implementation
15. FAQ
16. Company
17. Next Action

Every slide keeps the existing VARISTA footer logo. The cover uses the Vuddy
logo and identifies the document as a sales-content introduction.

## Content Adaptation

The sales version uses these source concepts throughout:

- Distribution through sales email, post-event follow-up, and service sites.
- Prospect-selected paths based on current challenges and desired information.
- Branches for features, case studies, pricing, security, and implementation.
- Calls to action for detailed materials, demos, inquiries, and sales
  consultations.
- Sales follow-up informed by viewing, selection, completion, drop-off, and CTA
  data.
- Outcomes focused on shorter basic explanations, better meetings, and improved
  opportunity conversion.
- KPIs including viewing rate, meeting-booking rate, opportunity rate, and
  close rate.

The education-oriented sentence accidentally present in the source use case is
corrected to describe prospects selecting information according to their own
challenges and interests.

## Viewer Experience

The Viewer Experience slide uses a phone-shaped HTML mockup rather than an
iframe. It presents the branching sequence from the source material:

1. Select a current challenge.
2. Select the information to review.
3. Choose a next action.

This avoids loading an unrelated business-card demo and keeps the new page
self-contained apart from the existing CDN and shared logo assets.

## Technical Structure

The page remains a single static HTML file:

- Reveal.js 5 CSS and JavaScript load from the same CDN URLs as the reference
  presentation.
- Existing inline CSS is reused so the slide dimensions, scaling, typography,
  card styles, footer treatment, and print behavior remain consistent.
- Shared Vuddy and VARISTA logos use the same relative asset paths.
- Reveal.js initialization keeps the current hash navigation, slide numbers,
  keyboard controls, touch controls, and `1280 x 720` dimensions.
- The page does not require new JavaScript behavior or new image assets.

## Error Handling

- Shared logos retain the existing `onerror` fallback that hides a missing
  image.
- The presentation remains readable if external fonts fail because the existing
  system-font fallbacks are retained.
- The sales experience mockup has no network dependency.
- No dead PDF link or unrelated remote iframe is included.

## Verification

- A Node structural test checks that the new file exists, contains exactly 17
  top-level slides, initializes Reveal.js, references the shared logos, and does
  not include the business-card copy, PDF link, or remote iframe.
- The test checks for representative sales terms from the source material,
  including prospect challenges, features, case studies, pricing, security,
  demo booking, and the four KPI names.
- Existing Vuddy presentation tests continue to pass, proving the source page
  was not regressed.
- The site build succeeds and emits
  `_site/service-introduction-materials/sales-vuddy/index.html`.
- Browser verification checks the cover, sales mockup, representative content
  slides, slide navigation, footer logo placement, and responsive rendering.

## Maintenance

The sales presentation intentionally follows the existing Vuddy presentation's
single-file pattern. Future visual changes shared by both presentations must be
applied to each file unless the repository later introduces a presentation
template system.
