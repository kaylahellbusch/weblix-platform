---
name: Weblix Public Homepage
description: A studio job jacket for client details and website words.
colors:
  ink: "#153f3b"
  teal: "#124c48"
  muted: "#49635e"
  mint: "#e3f1eb"
  accent: "#d8ea69"
  paper: "#ffffff"
  sheet: "#f7fbf8"
  pale-text: "#d7e9dc"
  record-rule: "#b5cec3"
  divider: "#ceded6"
  focus: "#93b127"
  teal-hover: "#0b3835"
  accent-hover: "#e7f49b"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2.625rem, 5.25vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.16
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2rem, 3.2vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  lead:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.7
  label:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
rounded:
  tag: "4px"
  action: "6px"
  record: "12px"
spacing:
  compact: "12px"
  control: "16px"
  inset: "20px"
  standard: "24px"
  broad: "28px"
  group: "32px"
  section-heading: "44px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.action}"
    padding: "11px 24px"
  button-primary-hover:
    backgroundColor: "{colors.teal-hover}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
    padding: "11px 24px"
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
  record:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.record}"
  jacket:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.record}"
---

# Design System: Weblix Public Homepage

## Overview

**Creative North Star: "The Studio Job Jacket"**

The Studio Job Jacket gives the public homepage the character of a working client file: a deep teal sleeve, pale mint sheets, white records, and restrained citron actions. Literata lends the headings an editorial warmth while plain sans text keeps the records direct and readable.

This system describes the public homepage only. Authenticated screens retain their existing design; the illustrated client records here are synthetic examples, not redesigned application components.

**Key Characteristics:**
- Broad editorial headings and plain operational text.
- Continuous record surfaces divided by crisp rules.
- Color separates the sleeve, sheets, and actions.

## Colors

Deep teal anchors the sleeve; light green papers carry readable client records and citron locates actions.

### Primary
- **Studio Teal:** Header, hero, closing invitation, and actions on light ground.
- **Citron:** Log-in actions on teal and text selection.

### Neutral
- **Ink:** Primary text on light paper.
- **Muted Green:** Supporting copy and field labels.
- **Mint:** Client jacket and workflow ground.
- **Paper / Sheet:** White record panels and the lighter content sheet inside the jacket.
- **Pale Text:** Supporting hero copy and the second line of the display title.
- **Record Rule / Divider:** Structural boundaries inside examples and between feature rows.
- **Focus:** Visible keyboard outline.

**The Sleeve and Sheet Rule.** Use tonal ground changes and rules to distinguish records; keep the record plane flat.

## Typography

**Display Font:** Literata with Georgia and serif fallbacks.
**Body Font:** Segoe UI with Helvetica Neue, Arial, and sans-serif fallbacks.

Literata supplies warmth without ornament; the sans face carries practical information. The frontmatter defines the desktop hierarchy. Display is reserved for the main title, headline for section titles, title for feature headings, and label for record metadata. Lead copy stays within 58ch, with a narrower hero measure.

On phones, display becomes `clamp(2.25rem, 9.5vw, 3.5rem)` with line-height 1.2; section headlines become 2rem and leads become 1rem. The jacket's website words also use Literata, connecting content to the editorial voice.

## Layout

A centered shell caps at 1800px. Sections share horizontal padding of `max(6vw, 24px)`. Broad headings precede ruled feature rows; each desktop feature pairs copy with one illustration in equal columns. Workflow uses three columns, and the editor explanation uses two.

At 1000px the jacket reduces to two visible columns and drops its import summary. At 700px, navigation becomes a disclosure menu, records and feature rows stack, workflow becomes an indexed vertical sequence, and the closing invitation stacks. The jacket remains one continuous readable surface. Desktop sections use generous 72–100px vertical space; phone sections reduce to 48–56px.

## Elevation & Depth

Records are flat, with color changes and thin rules supplying depth. Only the opened mobile navigation floats, using `0 12px 28px rgb(7 39 34 / 18%)` to separate it from the page beneath.

The jacket settles downward into place from a 12px offset over 800ms with `cubic-bezier(.16,1,.3,1)`. Its text remains visible throughout. Reduced-motion preferences disable this entry animation.

## Shapes

Soft rectangular records use the record radius; actions use the smaller action radius; valid-row badges use the compact tag radius. Straight one-pixel rules index the interior. Avoid turning each field into a detached card.

## Components

### Buttons

Confident, compact links with centered text, semibold weight, and a minimum 48px height. Citron actions sit on teal; teal actions sit on light ground. The hero secondary action is transparent with white text and a muted green outline, becoming lighter teal on hover. Links underline on hover. Keyboard focus uses a three-pixel focus outline with a five-pixel offset. Phone action padding contracts to 20px horizontally.

### Cards / Containers

Records use thin record-rule borders, mint heading bars, and standard interior padding. On phones, interior padding contracts to the inset step. The signature jacket combines business details, website words, and an import summary inside one clipped mint container.

### Chips

The static Valid badge uses mint ground, deep green text, compact horizontal padding, and the tag radius. It communicates an illustrated row status; it is not an interactive filter.

### Navigation

Desktop links use small sans text and at least 44px hit areas. The phone menu retains the same destinations in a pale disclosure panel. Navigation anchors share visible keyboard outlines and hover underlines.

### Illustrated Fields

Labels and bottom rules suggest saved website content. These are static paragraphs, not form controls. Captions explicitly identify synthetic records and the non-interactive editor illustration.

## Do's and Don'ts

### Do:
- **Do** preserve the teal sleeve, pale sheets, and readable white records.
- **Do** keep synthetic examples and non-interactive illustrations explicitly labeled.
- **Do** keep the jacket readable during its entry movement and honor reduced motion.

### Don't:
- **Don't** apply this homepage record automatically to authenticated screens.
- **Don't** give static illustrated fields the appearance or behavior of working inputs.
- **Don't** introduce decorative shadows on the flat record surfaces.
