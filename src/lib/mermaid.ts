import type { MermaidConfig } from "mermaid";

type MermaidApi = (typeof import("mermaid"))["default"];

// The flavor is pinned on `<html>`, which is the element these properties are declared against.
function token(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function createConfig(): MermaidConfig {
  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      // A diagram is drawn in the deck's own roles, so it reads as part of the slide rather than
      // as a picture pasted onto it.
      fontFamily: `${token("--r-main-font")}, sans-serif`,
      // The preview is drawn at its natural size, so Mermaid's own 16px would
      // put labels below the smallest step of the deck's type scale.
      fontSize: token("--deck-text-content"),
      background: token("--deck-canvas"),
      primaryColor: token("--deck-panel"),
      primaryBorderColor: token("--deck-rule-strong"),
      primaryTextColor: token("--deck-ink"),
      lineColor: token("--deck-mark"),
      secondaryColor: token("--deck-hover"),
      tertiaryColor: token("--deck-panel"),
      clusterBkg: token("--deck-canvas"),
      clusterBorder: token("--deck-rule"),
      titleColor: token("--deck-ink"),
      edgeLabelBackground: token("--deck-canvas"),
      errorBkgColor: token("--deck-hover"),
      errorTextColor: token("--deck-bad"),
    },
    // Mermaid draws edges and borders at 1px, which a projector loses.
    themeCSS: `
      .flowchart-link { stroke-width: 2px; }
      .node rect, .node polygon, .node circle { stroke-width: 1.5px; }
    `,
  };
}

// Arrowheads are sized in user space, so they keep their size when the edge
// gets heavier. Their box is an attribute rather than a style, so the markup
// is scaled directly. The viewBox is untouched, so the tip stays on the node.
const markerScale = 1.5;

function enlargeMarkers(svg: string) {
  return svg.replace(
    /(<marker\s[^>]*?)markerWidth="([\d.]+)" markerHeight="([\d.]+)"/g,
    (_, head: string, width: string, height: string) =>
      `${head}markerWidth="${Number(width) * markerScale}" markerHeight="${Number(height) * markerScale}"`,
  );
}

let mermaidPromise: Promise<MermaidApi> | undefined;
let renderQueue = Promise.resolve();

async function getMermaid() {
  mermaidPromise ??= import("mermaid").then(({ default: mermaid }) => mermaid);

  return mermaidPromise;
}

function enqueue<T>(work: () => Promise<T>) {
  const job = renderQueue.then(work);
  renderQueue = job.then(
    () => undefined,
    () => undefined,
  );

  return job;
}

export async function renderMermaid(source: string, id: string) {
  return enqueue(async () => {
    const mermaid = await getMermaid();
    // Read the computed role tokens for each render instead of caching a second
    // copy of the deck's color configuration.
    mermaid.initialize(createConfig());
    const { svg } = await mermaid.render(id, source);

    return enlargeMarkers(svg);
  });
}
