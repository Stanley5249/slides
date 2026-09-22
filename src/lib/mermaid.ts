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
  };
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

    return svg;
  });
}
