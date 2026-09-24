/**
 * Replays a stepped slide's first state whenever the slide opens before any step is taken.
 *
 * A slide keeps its state after the deck moves on, so coming back forward would show the last
 * step with none of its fragments. Coming back from the next slide opens it with every fragment
 * shown, and Animotion replays the last step itself, so that direction is left alone.
 *
 * Attach it to any element inside the slide.
 */
export function restart(first: () => unknown) {
  return (node: HTMLElement) => {
    const slide = node.closest("section");
    if (!slide) return;

    const open = () => {
      if (!slide.querySelector(".fragment.visible")) void first();
    };
    slide.addEventListener("in", open);
    return () => {
      slide.removeEventListener("in", open);
    };
  };
}
