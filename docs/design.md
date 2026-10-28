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
root-level custom properties on another flavor.

## Color roles

### Rule

Components use semantic roles from `src/styles/theme.css`. They do not use
Catppuccin palette tokens directly.

| Role                                     | Use                                       |
| ---------------------------------------- | ----------------------------------------- |
| `--deck-canvas`                          | Slide background                          |
| `--deck-panel`                           | Dialogs and error reports                 |
| `--deck-veil`                            | Modal backdrop                            |
| `--deck-hover`                           | Interactive hover state                   |
| `--deck-scrim`                           | Words set over a full-bleed picture       |
| `--deck-ink`                             | Body text and table values                |
| `--deck-ink-quiet`                       | Captions, list markers, slide counter     |
| `--deck-mark`                            | Bullets, chevrons, and diagram lines      |
| `--deck-rule`, `--deck-rule-strong`      | Separators and table structure            |
| `--deck-primary`, `--deck-secondary`     | The two accents styles draw from          |
| `--deck-heading`                         | Slide titles                              |
| `--deck-icon`                            | Icons beside words                        |
| `--deck-link`                            | Links and the current state               |
| `--deck-strong`, `--deck-em`             | Emphasis in prose                         |
| `--deck-code`, `--deck-code-ground`      | Code, inline and in blocks, and its plate |
| `--deck-focus`                           | Focus ring                                |
| `--deck-ok`, `--deck-warn`, `--deck-bad` | Meaning attached to the underlying data   |

### Reason

A palette color changes meaning between light and dark flavors. A semantic role
keeps the component's intent stable. Color should support information already
present in text or structure instead of carrying meaning alone.

### Implementation

Roles come in two layers. The palette roles pick Catppuccin colors; the style
roles point at palette roles. A deck recolors one kind of text by pointing its
style at another palette role.

Text takes two accents: mauve as the primary and peach as the secondary. Purple
and orange sit across the wheel from each other, so the pair gives a clear
hierarchy, and every further accent would dilute it. The dark flavors swap the
primary for lavender, which carries a title on a dark canvas better than mauve.

Latte is used as shipped, not darkened. Against its base, mauve measures 4.79
and peach 2.64, which is under the 3:1 WCAG asks of large text. Peach therefore
only marks words that also carry weight. Ink, marks and rules carry the reading
in every flavor. Check a latte deck on the projector before a talk and take a
dark flavor if the room defeats it.

## Typography

### Rule

Use Fredoka for titles, Atkinson Hyperlegible Next for prose, and Atkinson
Hyperlegible Mono for code and inline identifiers. Choose sizes and spacing from
the scales in `src/styles/overrides.css`.

### Reason

Atkinson was drawn for low vision readers, and its monospace shares the prose
face's proportions, so an identifier sits in a line of prose at its height. A
short type and spacing scale keeps slides consistent and prevents local
adjustments from becoming a second design system.

### Implementation

Reveal renders a fixed stage and scales it to the window, so stage pixels remain
proportional when projected. Titles and prose use limited line widths to reduce
eye movement across a wide screen. Inline identifiers and code blocks sit on the
same `--deck-code-ground` plate. A monospace from the prose family is hard to
tell from italics, and a plated block keeps its edge beside prose.

## Layout

### Rule

A slide has a title followed by one content area. Use `column` for stacked
content, a `cols` variant for two columns, and an `ol` with `steps` for a
process whose order matters. Use `pairs` for names beside what they name, and
`chain` for parts in one line with an arrow drawn between each two that connect.
Split a four-cell comparison across slides when the cells do not have an obvious
reading order.

Title a deck slide with a noun phrase that names its topic, and state the claim
as a sentence in the content. The template's titles are imperatives instead,
because each of its slides teaches a technique.

When content does not fit, trim words and blank lines first, then move the rest
to a vertical child slide. Never shrink the type to make room.

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
`column` and `cols`, not to individual children. Content that is shorter than
its area leaves empty space below it instead of stretching tables or diagrams.

The one line that names what a step changed takes the `caption` class, the voice
of a `figcaption` on the left edge.

A listing taller than the stage uses `CodeBlock` from `#lib`, which wraps long
lines and scrolls inside its own area, so the listing stays on one slide.

## Slide text

### Rule

- Nothing sits between the title and the content area. A subtitle, a source
  path, or an API version goes in the notes or in a code comment.
- Label each element once, where it is drawn. Leave out sublabels that restate a
  label, role suffixes on headers, and a legend for marks that can be labeled in
  place.
- Caveats go in the notes: what an excerpt leaves out, a version difference, or
  that a diagram or timeline is illustrative rather than measured. Mark an
  omission inside code with `// ...`.
- Break a long call between its arguments by hand, so a listing never wraps
  inside an identifier.

### Reason

The room reads every word on the stage as content. A caveat footer or a second
label adds a text layer to the slide and takes reading time from its claim,
while the presenter can say the caveat when it matters.

### Implementation

The style requirements in a deck's brief take precedence over the template
examples. Check a finished slide by counting its text runs outside the title,
the body, and the code: each one needs a reason the visual cannot give.

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

An interactive viewer shows its state through its pressed control and its
drawing. It takes no title row or instruction line of its own, and at most one
line in caption style that names what the last step changed.

## Diagrams

### Rule

A component that recurs across slides keeps one drawing, one tool, and one
scale. Mute or leave out the parts that play no role in the slide's operation.
Show an official figure only at a size where its text is legible, or crop it to
the part the slide discusses.

### Reason

The room recognizes a component by its shape. Redrawing it in another tool or at
another scale makes the room read it again as something new. A figure too small
to read is decoration, not evidence.

### Implementation

Choose Mermaid or a Svelte SVG component for a concept once per deck. Draw a
reused SVG component with props that mute its idle parts instead of copying it
per slide.

## Motion

### Rule

Motion starts with a presenter action and explains one state change. Use an
immediate undo when replaying the change backward adds no information. Respect
`prefers-reduced-motion`. An element that appears as part of a step holds its
space while hidden, so its arrival does not move the content around it. A
stepped listing carries a one-line caption that names what the step changes.

### Reason

The presenter controls the speaking pace. Replaying an explanation while moving
back delays navigation without adding information. The caption tells the room
what changed before it reads the code.

### Implementation

Reveal owns slide navigation. Animotion owns actions and view transitions. Name
a duration when more than one part of an animation uses it, and record why that
duration was chosen beside the value.

Reveal shows fragments in document order, and an `Action` is a fragment too. An
element that must appear after a later step toggles `invisible` from that step's
state instead of taking `fragment`, which would show it before the step.

`Code` ignores `update` until its highlighter has loaded. Opening a stepped
slide from a URL or a reload can run its actions before then, so the step
advances while the code stays on its first state. The first render reads the
`code` prop after the highlighter loads, so pass the current step's source as
`code`.

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

`Mermaid.svelte` maps the semantic color roles onto Pele's `--pele-*`
properties, which the SVG resolves at paint time, so a diagram follows the deck
flavor without a redraw.

### Shiki

`codeTheme` in `src/lib/theme.ts` derives the Shiki theme from the same flavor
constant that selects the deck's palette, so code blocks match the deck.

An excerpt from a real file may be trimmed so the room can read it. The slide's
notes say what was left out, so the presenter can answer for the full source.

### Screenshots

Screenshots keep the colors produced by the source application. Capture them at
the contrast needed for projection instead of recoloring them in the deck.

### Embedded sites

A live site goes one slide below an intro slide that links to it, so the room is
told before the stage becomes someone else's page. Many sites refuse to load in
a frame, and the browser shows its own error page without telling the deck. Run
`just check-embeds` before a talk: it builds the deck and checks each embedded
site's `X-Frame-Options` and `frame-ancestors` headers. The intro slide's link
is the way out when a site still fails on the venue's network.

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
