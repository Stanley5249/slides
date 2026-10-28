/// <reference types="bun-types" />

// Flags slide CSS that chooses its own layout values instead of the shared
// ones.
//
// The layout classes and the spacing and type scales decide most geometry,
// so a slide that writes its own gap, font size, or column width is where
// slides start to drift apart. Only those properties are checked: a border
// width, a stroke, or the size of an SVG is a drawing's own measure.
//
// A declaration the slide needs anyway takes a comment on the line above or
// on its own line, with the reason after the colon:
//
//   /* check-styles: allow the marker rides along a timeline track */
//   position: absolute;
//
// Debt a deck carries from before a rule existed goes in the baseline file,
// written with `--update`, so only new violations fail.

import { Glob } from "bun";

const sources = "src/**/slides/**/*.svelte";
const baselinePath = "check-styles.baseline";

// A length in px or rem, but not one in em, which follows the type, and not 0.
const fixedLength = /(?<![\w.-])(?:\d*\.)?\d+(?:px|rem)\b/;
const spacing =
  /^(?:gap|row-gap|column-gap|(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?)$/;

const rules: {
  test: (property: string, value: string) => boolean;
  advice: string;
}[] = [
  {
    test: (property, value) =>
      property === "position" && /^(?:absolute|fixed)\b/.test(value),
    advice: "place it with a layout class, or draw it in SVG",
  },
  {
    test: (property, value) =>
      property === "font-size" &&
      !/var\(--deck-text-|^(?:inherit|[\d.]+em)$/.test(value),
    advice: "take a --deck-text-* size",
  },
  {
    test: (property, value) =>
      spacing.test(property) && fixedLength.test(value),
    advice: "take a --deck-gap-* step",
  },
  {
    test: (property, value) =>
      /^grid-template-columns$/.test(property) && fixedLength.test(value),
    advice: "use pairs, a cols variant, or max-content",
  },
];

// The reason has to start with a word, so a bare `allow */` does not pass.
const allow = /check-styles:\s*allow\s+\w/;
const declaration = /^\s*([a-z-]+)\s*:\s*([^;{}]+?)\s*;?\s*$/;

export type Violation = {
  path: string;
  line: number;
  text: string;
  advice: string;
};

// Checks the declarations of every `<style>` block and `style` attribute.
// Line numbers count from 1 in the whole file.
export function check(path: string, source: string) {
  const lines = source.split("\n");
  const found: Violation[] = [];
  let inStyle = false;

  lines.forEach((line, index) => {
    if (/<style\b/.test(line)) inStyle = true;
    if (line.includes("</style>")) {
      inStyle = false;
      return;
    }

    const candidates = inStyle
      ? [line]
      : Array.from(line.matchAll(/\bstyle="([^"]*)"/g), (match) =>
          match[1].split(";"),
        ).flat();

    for (const candidate of candidates) {
      const match = declaration.exec(candidate);
      if (!match) continue;
      const [, property, value] = match;
      const rule = rules.find((rule) => rule.test(property, value));
      if (!rule) continue;
      if (inStyle && (allow.test(line) || allow.test(lines[index - 1] ?? "")))
        continue;
      found.push({
        path,
        line: index + 1,
        text: `${property}: ${value}`,
        advice: rule.advice,
      });
    }
  });

  return found;
}

// A baseline entry is the file and the declaration, without the line, so it
// survives edits elsewhere in the file. Repeated entries count separately.
function key({ path, text }: Violation) {
  return `${path}\t${text}`;
}

// Returns the violations the baseline does not cover.
export function subtract(violations: Violation[], baseline: string[]) {
  const remaining = new Map<string, number>();
  for (const entry of baseline) {
    remaining.set(entry, (remaining.get(entry) ?? 0) + 1);
  }
  return violations.filter((violation) => {
    const count = remaining.get(key(violation)) ?? 0;
    if (count === 0) return true;
    remaining.set(key(violation), count - 1);
    return false;
  });
}

if (import.meta.main) {
  const violations: Violation[] = [];
  for await (const path of new Glob(sources).scan()) {
    const posix = path.replaceAll("\\", "/");
    violations.push(...check(posix, await Bun.file(path).text()));
  }
  violations.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);

  if (process.argv.includes("--update")) {
    const entries = violations.map(key);
    await Bun.write(
      baselinePath,
      entries.map((entry) => `${entry}\n`).join(""),
    );
    console.log(`Wrote ${entries.length} entries to ${baselinePath}.`);
    process.exit(0);
  }

  const baselineFile = Bun.file(baselinePath);
  const baseline = (await baselineFile.exists())
    ? (await baselineFile.text()).split("\n").filter(Boolean)
    : [];
  const fresh = subtract(violations, baseline);

  for (const { path, line, text, advice } of fresh) {
    console.log(`${path}:${line}  ${text}  (${advice})`);
  }
  process.exit(fresh.length > 0 ? 1 : 0);
}
