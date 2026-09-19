# Reference and legibility correction — acceptance criteria

Recorded before implementation on 2026-09-19 against baseline `09d5778fd9c906c424ce14cfc3c462e57f5b0e52`.

## Evidence

All three exact public Dribbble images were recovered and visually inspected; see the separate exact-reference evidence record. The liquid-glass reference shows a continuous curved transparent rail, bright rim, recognizable background transmission and a frosted active pill. The two casino references show scene-led artwork, varied tile sizes, and normal-width body/navigation type. None establishes a globally condensed editorial type system. Exact typeface names and responsive/motion specifications are undisclosed.

- https://dribbble.com/shots/26138509--Liquid-Glass-Effect-Sidebar-UI
- https://dribbble.com/shots/26710647-Casino-Website-Design-in-Chinese-Style
- https://dribbble.com/shots/26768357-Casino-Website-Gambling
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- https://design-system.service.gov.uk/components/summary-list/
- https://design-system.service.gov.uk/patterns/check-answers/

## Observed failures

The baseline screenshots have globally condensed large headings, flat SVG motifs in otherwise empty game tiles, the same slot cabinet around six different simulations, financial labels as small as 7px, 30px Edit targets, and an exit receipt with a large forced blank area. The modal/source audit also found missing keyboard containment and focused edits that rewrite unrelated financial data.

## Criteria

1. Home uses normal-width sans navigation/body/headings, substantial original scene artwork for all six games and a clearly separated text/illustration hero. Preserve the approved espresso/oxblood/bronze/cream identity, six direct mobile choices and existing routes. No commercial reference assets are shipped.
2. The desktop rail transmits recognizable environmental imagery and has a continuous curved rim and nested active pill. It remains readable against the transmitted image.
3. Supporting home labels are at least11px; primary choices at least13px. All text names remain HTML and visible without hover or horizontal scrolling. No horizontal overflow at320,390,430,768,1024,1440px.
4. Each game has an appropriate distinct stage. Roulette/poker use tables, sportsbook an event board and Scratch a ticket; retain the slot cabinet for slots/other. The DOM HUD remains the authoritative readable balance, stake and action count. Preserve game math and controls.
5. My Reality is summary first. Financial labels/dates are at least12px, readable values are subordinate to context, Edit/Close have44px targets, and focused edits preserve unrelated fields. Blank money remains unknown; explicit zero remains zero; unrelated edits do not refresh financial freshness.
6. Both My Reality and Run10,000 contain keyboard focus, make background inert, close on Escape and restore the opener. Existing modal semantics stay truthful.
7. Run10,000 retains a clear sample/expectation pair and model-limit sentence. Receipt height follows its content; conclusion follows its supporting evidence without a forced dead area.
8. Inspect actual settled renders after changes, including all six games at320/390/430px and all principal surfaces. Use existing functional checks plus focused regressions; do not claim exact pixel matching, known typeface identity, human validation or measured gambling outcomes.
