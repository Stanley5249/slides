# Design

This template makes technical talks. The audience is in a room, reading from a
distance, once, without the option to scroll back. Everything below follows from
that: a slide holds one claim, the type is large, and nothing is drawn that the
claim does not need.

The system has one rule that the rest hangs off. Color is named by the job it
does, never by the hue it happens to be, so a deck can be presented light or
dark without anyone rereading it.

## Flavor

The deck is presented in one of the four Catppuccin flavors, named once in
`src/lib/theme.ts` and committed with the deck. Latte is the default because a
lit room beats a dark slide, and most rooms are lit.

There is no theme switch in the interface, and nothing follows
`prefers-color-scheme`. A talk is projected into a room whose lighting the
speaker knows in advance and the presenting machine does not, so the choice
belongs to whoever writes the deck, at the time they write it.

The flavor class goes on `<html>`. Catppuccin declares its palette against
`:root`, which is that element and nothing else, so a class anywhere lower
leaves every property resolved at `:root` on a different flavor from the slides.
A server hook writes the class as the page is served, which keeps the
stylesheet, the Shiki theme and the Mermaid palette reading from one constant.

## Color

`src/styles/theme.css` holds the roles. Deck and component CSS asks for a role
and never for `--catppuccin-color-*` directly, because a Catppuccin token means
a different thing in latte than it does in mocha.

| Role                                     | What it is for                                        |
| ---------------------------------------- | ----------------------------------------------------- |
| `--deck-canvas`                          | The slide itself.                                     |
| `--deck-panel`                           | The one step up a dialog or an error report may take. |
| `--deck-veil`                            | What covers the deck behind a modal.                  |
| `--deck-hover`                           | A pointer resting on something that responds.         |
| `--deck-ink`                             | Body text, table values, anything read word by word.  |
| `--deck-ink-quiet`                       | The second weight: ledes, captions, notes, labels.    |
| `--deck-mark`                            | Bullets, chevrons, diagram lines. Never a word.       |
| `--deck-rule`, `--deck-rule-strong`      | A hairline, and the rule that structures a table.     |
| `--deck-heading`                         | Titles.                                               |
| `--deck-accent`                          | Links, and the one state the viewer is currently on.  |
| `--deck-focus`                           | The focus ring.                                       |
| `--deck-ok`, `--deck-warn`, `--deck-bad` | A claim about the data underneath.                    |

Text clears 4.5:1 against the canvas; marks, rules and focus rings clear 3:1.
Latte is the binding case: its accents are too pale at full strength, so the
light map takes each one from the darkest palette step that clears the
threshold. The Catppuccin style guide asks for exactly this judgement:
legibility comes first. The measured ratios are in `src/styles/theme.css`,
beside the values they justify.

The thresholds are not bureaucracy. A projector in a lit room loses perhaps a
third of the contrast a monitor shows, and the back row is four times further
from the screen than you are.

Two further rules. Color on a slide is never decoration, so anything tinted is
making a claim that the text also makes. And an accent means one thing per deck:
if sky is "the step you are on" in a table, it cannot also be a link.

Tones are a vocabulary, not a palette. A component that keys a row to a claim
emits `data-tone` and stops there; the deck maps that attribute onto
`--deck-ok`, `--deck-warn` or `--deck-bad`, because only the deck knows whether
a row is good news.

## Type

Three faces, each with one job.

- Fredoka sets titles. It is the web-served stand-in for the face
  `catppuccin/powerpoint-slides` uses, and it is the only place the deck has a
  voice rather than a style.
- Atkinson Hyperlegible sets everything read as prose. It was drawn for low
  vision, which is what a projector gives everybody.
- Monaspace Neon sets identifiers, measurements and anything in a column.
  Tabular figures, so digits line up between rows.

Sizes are pixels on Reveal's fixed stage, which Reveal scales to the window, so
a pixel here is a fixed fraction of the projected slide. Prose stops at 62
characters a line and titles at 26, both well under the 80 that print would
allow, because a line the eye has to track across a wall is longer than the same
line on a desk.

Identifiers get a weight and color shift, never a pill or a plate. At slide
scale that is enough.

## Layout

Every slide is the same shape: a label saying which movement of the talk this
is, a title, then rows. The header is a fixed height whether or not the title
fills it, so the title sits on the same baseline on every slide and the deck
does not jump as it advances.

```
+--------------------------------------------------+
|  ACT LABEL                                       |
|  Title, up to two lines, reserved either way      |
|                                                  |
|  +----------------------+  +------------------+  |
|  |                      |  |                  |  |
|  |  content             |  |  content         |  |
|  |                      |  |                  |  |
|  +----------------------+  +------------------+  |
+--------------------------------------------------+
```

Three column splits and no others: 2.2fr to 1fr, even halves, and 1fr to 2.2fr.
Fractions rather than fixed widths, so a change of stage size does not rewrite
the deck. There is deliberately no two-by-two grid, because a four-cell layout
has no reading order and the fourth cell always ends up padded with something.

Spacing lives on the elements, the way a document does it, so a slide never
places its own gaps. Author order decides the rhythm.

## Structure

Content carries no plates, no cards, no borders and no shadows. A screenshot is
evidence and a diagram is a drawing; framing either one makes it read as a
widget the audience is meant to operate.

Chrome is the opposite case, and it has one shape. A surface that really is
operated, a viewer or a report, sits on the canvas with a hairline and a soft
shadow, one step above its ground. Every such surface uses that same shape, so
the audience can tell at a glance what is evidence and what is apparatus.

The only rules on a slide are a table's own, set the way every paper in this
field already sets them: one rule above the head, one below it, one under the
last row, nothing vertical.

Structural devices carry information or they are cut. Numbered markers mean the
content is a sequence. An eyebrow label means there is a hierarchy above the
title. If neither is true, neither appears.

A failure is the one thing that must never be quiet. A diagram that did not
render must not be mistaken for a diagram that did, so the error takes a panel,
a heading in the tone that says it failed, and the message in full.

## Motion

Reveal owns the transitions and Animotion owns the slide runtime. The deck does
not replace either.

Motion that answers a keypress is welcome, because it shows what changed. Motion
that plays by itself is not, because the audience is listening to a person, not
watching a page. View transitions run at one duration with one easing curve, and
every one of them is switched off under `prefers-reduced-motion`.

## Accessibility floor

Not a checklist to pass but the condition the room is actually in.

- Focus is always visible, in `--deck-focus`, at 3:1 against whatever it sits
  on.
- Anything reachable by pointer is reachable by keyboard, and a pan-and-zoom
  surface says what its keys do.
- Reveal listens on `document`, so any widget that takes the arrow keys stops
  propagation while it is open.
- Figures carry alt text that states what the picture shows, not that it is a
  picture.

## Surfaces that must follow the flavor

Three things draw themselves and have to be told which flavor they are in.

Mermaid is told the deck's roles in `src/lib/mermaid.ts`, read live from the
document each time it renders, so a diagram is drawn in the deck's own colors
rather than in its library's. A diagram already on screen is not redrawn, which
is one reason the flavor is a build-time constant and not a runtime switch.

Shiki needs a theme by name. `codeTheme` in `src/lib/theme.ts` derives it from
the flavor, so a code block cannot stay dark on a light deck.

Screenshots follow nothing. A dark capture on a latte slide stays dark, and that
is correct: the evidence is what the tool actually showed. Recoloring it would
be editing the evidence, and giving it a light frame would turn it into a
widget. Capture at the contrast you want to project.

## Template or deck

The template owns the system. Decks own what they are about.

| Template                                  | Deck                                            |
| ----------------------------------------- | ----------------------------------------------- |
| Role tokens and the flavor constant       | Which flavor, named in `src/lib/theme.ts`       |
| Type scale, prose, lists, tables, figures | The act labels, the one big figure, the ledgers |
| Column splits and vertical rhythm         | What goes in the columns                        |
| Reveal chrome, focus rules                | Tone mappings for `data-tone`                   |
| Components under `src/lib` and their docs | Slide content under `src/slides`                |

A pattern earns its way into the template when a second deck needs it, not when
the first one invents it. Until then it lives on the deck branch where it was
written.
