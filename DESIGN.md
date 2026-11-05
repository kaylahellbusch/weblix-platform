---
name: Weblix homepage experiment
description: The local directory, made clear
colors:
  primary: "#3566d6"
  primary-hover: "#2854b7"
  apricot: "#e99855"
  ground: "#f7f7f5"
  surface: "#ffffff"
  ink: "#202734"
  muted: "#566171"
  border: "#d8dce2"
  control-border: "#78818e"
typography:
  display:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.75rem, 5.25vw, 4.75rem)"
    fontWeight: 750
    lineHeight: 1.13
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
rounded:
  control: "8px"
  record: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "48px"
  wide: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  record:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.record}"
  illustrated-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
---

# Design System: Weblix homepage experiment

## Overview

**Creative North Star: "The local directory, made clear"**

This document records only the finished public-homepage experiment in apps/web/app/page.tsx and apps/web/app/home/home.css. It does not establish a redesign of the application. The approved docs/design/ui-design-brief.md remains authoritative; homepage display sizing and composition are local to this surface.

Professional, legible and spacious, this system organizes related information as flat white records on a neutral ground. Blue identifies actions and orientation; restrained apricot numbers mark the real workflow. The existing vector Weblix logo is retained.

**Key Characteristics:**
- Connected, bordered records
- Clean self-hosted Manrope
- Blue actions and restrained apricot markers
- Responsive, content-driven spacing

## Colors

### Primary

Primary blue carries filled actions, the emphasized hero line, active illustrated tabs and focus. Its deeper hover variant strengthens filled actions.

### Secondary

Apricot supplies workflow sequence markers with ink text; it is not a second action color.

### Neutral

Ground is neutral off-white; surface is white. Ink carries headings and main text, muted slate supports explanations, border separates records, and control-border strengthens outlined actions and the mobile menu.

**The Blue Action Rule.** Use blue for primary actions and keyboard orientation; keep apricot markers subordinate.

## Typography

Display and body use self-hosted Manrope with Segoe UI and sans-serif fallbacks. Firm headings and clear supporting text share one clean voice. The frontmatter records the desktop display, headline, title, example body and label roles. Lead copy uses 1.125rem with 1.65 line height; actions use 0.875rem at weight 700. At 700px and below, the hero uses clamp(2.2rem, 9.5vw, 3.5rem) and 1.14 line height, while lead copy becomes 1rem. Supporting labels remain sentence case.

## Layout

The centered shell has a maximum width of 1440px. Horizontal margins step from 64px to 40px at 1100px, then 20px at 700px. Common intervals follow an 8px rhythm, with 12px supporting gaps. Broad section bands and aligned columns establish order.

Desktop records use divided columns. At 701–1100px the gallery becomes three horizontal records, each with two internal columns; the business record does not span rows. At 700px and below, records and workflow stack, navigation becomes a labeled menu, and the editor illustration follows its explanation. Desktop editor spacing is 96px vertically, reduced to 56px on phones. These compositions describe the homepage rather than general application templates.

## Elevation & Depth

No box shadows are used. White surfaces, neutral borders, separators and a dark final action band create hierarchy without simulated elevation.

**The Flat Record Rule.** Use borders and tonal separation to organize related information rather than decorative lift.

## Shapes

Records use softly rounded corners; actions and illustrated fields use the smaller control radius. Thin neutral borders divide information. Workflow numbers are circular 32px markers; the small outlined window motif identifies synthetic app examples.

## Components

### Buttons

Firm, compact actions use primary blue with white text or a white secondary surface with ink and a visible control border. Both have a minimum height of 48px. Hover adds an underline; primary hover also deepens the fill. Visible focus uses a 3px blue outline with 5px offset; the final dark band uses a white outline. Phone hero actions reduce horizontal padding to 16px.

### Records / Containers

Flat white records collect related information using neutral borders and internal separators. Gallery records use 32px padding, reduced to 24px on phones. The connected hero strip uses a header and three information columns, becoming a vertical record on phones. Workflow is a white band with circular apricot sequence markers.

### Illustrated Fields

Off-white fields have a neutral border, persistent adjacent labels and the control radius. They are paragraph elements in explicitly synthetic illustrations, not inputs. No editable, validation, disabled or save state is established by this surface.

### Navigation

Sentence-case links use 0.875rem semibold type and a 44px minimum height. Hover reveals an underline through a 180ms cubic-bezier(.16,1,.3,1) transition. Reduced motion removes the transition. At 700px and below a labeled menu reveals a white bordered navigation panel. Keyboard focus remains explicit.

## Do's and Don'ts

### Do:
- **Do** retain the approved palette and existing vector logo.
- **Do** label synthetic examples and distinguish illustrations from interactive controls.
- **Do** retain visible keyboard focus and readable stacked records on narrow screens.

### Don't:
- **Don't** imply website rendering, live preview or publishing is available.
- **Don't** introduce unrelated decoration, gradients or decorative shadows.
- **Don't** apply this homepage experiment as an application-wide redesign.
