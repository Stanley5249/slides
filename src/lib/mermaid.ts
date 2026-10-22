// The flavor is pinned on `<html>`, which is the element these properties are declared against.
function token(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export async function renderMermaid(source: string, idPrefix: string) {
  // Pele sizes each node from labels it measures on a canvas, so the deck's
  // web fonts have to be loaded first or every box is cut for the fallback.
  const [{ renderAsync }] = await Promise.all([
    import("pele/lazy"),
    document.fonts.ready,
  ]);

  return renderAsync(source, {
    idPrefix,
    fontFamily: `${token("--r-main-font")}, sans-serif`,
    // The preview is drawn at its natural size, so Pele's own 16px would put
    // labels below the smallest step of the deck's type scale.
    fontSize: Number.parseFloat(token("--deck-text-content")),
  });
}
