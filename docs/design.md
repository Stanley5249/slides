# Design

This template is for technical talks presented in a room. The audience reads
from a distance and cannot scroll back. Each slide should make one claim and
show only the information needed to support it.

## Theme

### Rule

Choose one Catppuccin flavor in `src/lib/theme.ts` and commit that choice with
the deck. Do not add a runtime theme switch or follow `prefers-color-scheme`.

### Reason

The presenter knows the room lighting before the talk. A runtime preference
cannot account for the projector or the room.

### Implementation

The server hook writes the selected flavor class on `<html>`. Catppuccin defines
its palette on `:root`, so placing the class lower in the document would leave
root-level custom properties on another flavor. The same flavor constant selects
the Shiki theme and supplies the colors Mermaid reads.

## Color roles

### Rule

Components use semantic roles from `src/styles/theme.css`. They do not use
Catppuccin palette tokens directly.

| Role                                     | Use                                     |
| ---------------------------------------- | --------------------------------------- |
| `--deck-canvas`                          | Slide background                        |
| `--deck-panel`                           | Dialogs and error reports               |
| `--deck-veil`                            | Modal backdrop                          |
| `--deck-hover`                           | Interactive hover state                 |
| `--deck-scrim`                           | Words set over a full-bleed picture     |
| `--deck-ink`                             | Body text and table values              |
| `--deck-ink-quiet`                       | Captions, table headings, slide counter |
| `--deck-mark`                            | Bullets, chevrons, and diagram lines    |
| `--deck-rule`, `--deck-rule-strong`      | Separators and table structure          |
| `--deck-heading`                         | Slide titles                            |
| `--deck-accent`                          | Links and the current state             |
| `--deck-focus`                           | Focus ring                              |
| `--deck-ok`, `--deck-warn`, `--deck-bad` | Meaning attached to the underlying data |

### Reason

A palette color changes meaning between light and dark flavors. A semantic role
keeps the component's intent stable. Color should support information already
present in text or structure instead of carrying meaning alone.

### Implementation

Every accent is the palette color itself, darkened by the smallest percentage
that meets its contrast bar and left at full strength where it already clears
one. Only the bare name is Catppuccin, so the percentage beside each role in
`src/styles/theme.css` is the exact size of the concession. Latte needs it
because its accents are drawn as marks on a light surface rather than as text on
one; the three dark flavors take every accent unaided.

The bar is 3:1. Every type size on a slide except the 18px label is WCAG large
text, where AA asks for 3:1 rather than 4.5:1. The one accent that appears at
label size is a link in a figcaption, so the accent alone answers to 4.5:1.

Latte measures mauve 4.79, red 4.80, accent 4.55, ok 3.10, the identifier role
3.08 and warn 3.02. Ink, marks and rules carry the reading in every flavor, so
an accent is never the only thing saying what a slide says. Check a latte deck
on the projector before a talk and take a dark flavor if the room defeats it.

A component that reports status sets `data-tone`. The deck maps that attribute
to the appropriate semantic role.

## Typography

### Rule

Use Fredoka for titles, Atkinson Hyperlegible Next for prose, and Iosevka for
code and inline identifiers. Choose sizes and spacing from the scales in
`src/styles/overrides.css`.

### Reason

Each face has one responsibility. Atkinson was drawn for low vision readers.
Iosevka is narrow, so a line of code fits a wide stage without shrinking. A
short type and spacing scale keeps slides consistent and prevents local
adjustments from becoming a second design system.

### Implementation

Reveal renders a fixed stage and scales it to the window, so stage pixels remain
proportional when projected. Titles and prose use limited line widths to reduce
eye movement across a wide screen. Inline identifiers use weight and color
instead of badges or filled backgrounds.

## Layout

### Rule

A slide has a title followed by one content area. Use `row` for stacked content,
a `cols` variant for two columns, and an `ol` with `steps` for a process whose
order matters. Split a four-cell comparison across slides when the cells do not
have an obvious reading order.

```text
+----------------------------------------------------+
| Title                                              |
|                                                    |
| +------------------------------------------------+ |
| | One content area                               | |
| +------------------------------------------------+ |
+----------------------------------------------------+
```

### Reason

A stable frame reduces layout decisions and gives the audience a predictable
reading order. Fractional columns adapt to the stage without fixed component
widths.

### Implementation

The shared classes live in `src/styles/layouts.css`. Content hangs from the
title at the wide gap, so every slide starts its content at the same height. A
sparse slide, such as a figure beside a short paragraph, takes the `middle`
class to center its content in the room under the title instead. Gaps belong to
`row` and `cols`, not to individual children. Content that is shorter than its
area leaves empty space below it instead of stretching tables or diagrams.

## Archetypes

### Rule

A slide without a title row takes an archetype class on its section through
`defineProps({ class })`. Use `divider` to open a section, `statement` for one
claim, `metric` for one figure, and `bleed` for a picture that fills the stage.
The title slide keeps the plain frame and takes a `byline` paragraph: one link
to the talk under the speaker's handle. The template deck shows every archetype
and layout in the order a talk tends to use them.

```text
divider                 statement               metric
+-------------------+   +-------------------+   +-------------------+
|  ##               |   |                   |   |                   |
|   #  Section name |   |  One claim, set   |   |  1280 x 720       |
|   #  One line     |   |  large.           |   |  What it means    |
|  ###              |   |  Support          |   |                   |
+-------------------+   +-------------------+   +-------------------+
```

### Reason

Pacing slides carry no evidence, so the title-and-content frame gives them a
heading they do not need. A section number is the only oversized mark in the
template because the sections of a talk are a sequence.

### Implementation

The classes live in `src/styles/archetypes.css`. Each one centers its content on
the stage and styles the first paragraph as the subject.

## CSS ownership

### Rule

Use the shared slide classes when they cover the layout. Add a rule to
`src/styles/overrides.css` when Animotion or Reveal already controls the same
property. Use a Tailwind utility only when upstream CSS does not compete with
it.

### Reason

Animotion's unlayered stylesheet can outrank layered utilities. Reveal also uses
descendant selectors that a single utility class may not override.

### Implementation

`tabular-nums` works on a table cell because upstream CSS does not set
`font-variant-numeric`. `text-right` does not work there because Reveal sets
`text-align` with a stronger selector. The shared `numeric` class provides the
required specificity.

## Content and interface surfaces

### Rule

Show screenshots and diagrams without decorative cards. Give interactive viewers
and error reports a consistent panel, border, and shadow.

### Reason

A screenshot or diagram is evidence. A viewer is an interface. Their visual
treatment should make that difference clear.

### Implementation

Tables use horizontal rules only. Sequence markers and labels appear only when
they communicate order or hierarchy. Rendering failures display a visible panel
and the complete error message instead of leaving an empty area.

## Motion

### Rule

Motion starts with a presenter action and explains one state change. Use an
immediate undo when replaying the change backward adds no information. Respect
`prefers-reduced-motion`.

### Reason

The presenter controls the speaking pace. Replaying an explanation while moving
back delays navigation without adding information.

### Implementation

Reveal owns slide navigation. Animotion owns actions and view transitions. Name
a duration when more than one part of an animation uses it, and record why that
duration was chosen beside the value.

## Accessibility

### Rule

- Keep keyboard focus visible.
- Make every pointer action available from the keyboard.
- State pan and zoom controls in accessible text.
- Stop keyboard events inside a viewer before Reveal handles them.
- Describe what an image shows instead of stating that it is an image.

### Reason

The presentation runtime and interactive viewers share the same keyboard.
Without explicit event and focus handling, an action inside a viewer can also
navigate the deck.

### Implementation

Use `--deck-focus` and `--deck-focus-ring` for focus indicators. Components that
capture navigation keys stop propagation while open. Dialogs keep native Escape
behavior.

## Rendered content

### Mermaid

`src/lib/mermaid.ts` reads the current semantic color roles before each render.
Existing diagrams are not redrawn because the deck flavor does not change at
runtime.

### Shiki

`codeTheme` in `src/lib/theme.ts` derives the Shiki theme from the deck flavor.
Code blocks therefore match the selected light or dark presentation.

### Screenshots

Screenshots keep the colors produced by the source application. Capture them at
the contrast needed for projection instead of recoloring them in the deck.

### Embedded sites

A live site goes one slide below an intro slide that links to it, so the room is
told before the stage becomes someone else's page. Many sites refuse to load in
a frame, and the browser shows its own error page without telling the deck. Run
`just embeds` before a talk: it builds the deck and checks each embedded site's
`X-Frame-Options` and `frame-ancestors` headers. The intro slide's link is the
way out when a site still fails on the venue's network.

## Ownership

| Template                         | Deck                                    |
| -------------------------------- | --------------------------------------- |
| Color roles and flavor mechanism | Selected flavor                         |
| Type and spacing scales          | Slide copy                              |
| Layout classes                   | Content placed in each layout           |
| Reveal chrome and focus behavior | Tone assignments for deck-specific data |
| Components under `src/lib`       | Slides under `src/slides`               |

Add a pattern to the template when more than one deck needs it. Until then, keep
it on the deck branch that introduced it.
