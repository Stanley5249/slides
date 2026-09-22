/**
 * Closes a dialog when a pointer gesture starts and ends on blank space, so every view inside it
 * dismisses the same way instead of each one reimplementing the rule.
 *
 * Escape is left to the native `<dialog>` cancel behavior and is not handled here.
 *
 * `blankSelector` matches the empty surfaces exactly, never their children, so anything placed
 * inside the dialog is safe from dismissal by default.
 */
export function dismissable(blankSelector: string) {
  return (dialog: HTMLDialogElement) => {
    let candidate = false;
    let startX = 0;
    let startY = 0;

    function isBlank(target: EventTarget | null) {
      return (
        target === dialog ||
        (target instanceof Element && target.matches(blankSelector))
      );
    }

    function down(event: PointerEvent) {
      candidate = event.button === 0 && isBlank(event.target);
      startX = event.clientX;
      startY = event.clientY;
    }

    function up(event: PointerEvent) {
      const dragged =
        Math.abs(event.clientX - startX) > 3 ||
        Math.abs(event.clientY - startY) > 3;
      if (candidate && !dragged) dialog.close();
      candidate = false;
    }

    // Capture phase: inner handlers stop propagation to keep Reveal from seeing these events,
    // and pointer capture retargets the release, so bubbling cannot be relied on here.
    dialog.addEventListener("pointerdown", down, true);
    dialog.addEventListener("pointerup", up, true);

    return () => {
      dialog.removeEventListener("pointerdown", down, true);
      dialog.removeEventListener("pointerup", up, true);
    };
  };
}
