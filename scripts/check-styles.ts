/// <reference types="bun-types" />

// Flags slide CSS that chooses its own layout values instead of the shared
// ones.
//
// The layout classes and the spacing and type scales decide most geometry,
// so a slide that writes its own gap, font size, or column width is where
// slides start to drift apart. Only those properties are checked: a border
// width, a stroke, or the size of an SVG is a drawing's own measure.
//
// A declaration the slide needs anyway takes a comment, with the reason after
// `allow`, either on its own line above the declaration or after it on the
// same line:
//
//   /* check-styles: allow the marker rides along a timeline track */
//   position: absolute;
//
// Markup has no such comment, so a `style` attribute or `style:` directive
// that needs an exception moves into the `<style>` block.
//
// Debt a deck carries from before a rule existed goes in the baseline file,
// written with `--update`, so only new violations fail. An entry names the
// rule it sits in, so the same declaration added elsewhere is new, and an
// entry nothing matches any more fails too, so the baseline only shrinks.

import { Glob } from "bun";

const sources = "src/**/slides/**/*.{svelte,css}";
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
      property === "grid-template-columns" && fixedLength.test(value),
    advice: "use pairs, a cols variant, or max-content",
  },
];

// The reason has to start with a word, so a bare `allow */` does not pass.
const allow = /check-styles:\s*allow\s+\w/;

export type Violation = {
  path: string;
  line: number;
  context: string;
  text: string;
  advice: string;
};

type Declaration = {
  offset: number;
  context: string;
  property: string;
  value: string;
  allowed: boolean;
};

// Replaces a range with spaces but keeps its newlines, so offsets and line
// numbers in the rest of the source stay where they were.
function blank(text: string) {
  return text.replace(/[^\n]/g, " ");
}

// Reads the declarations of a stretch of CSS that starts at `base` in the
// file. A declaration ends at `;` or at the `}` that closes its rule, so a
// value may run over several lines. Comments are blanked before the split,
// and an allow comment excuses the declaration it sits on or the next one.
function declarations(css: string, base: number, outer: string) {
  const allows: { offset: number; ownLine: boolean }[] = [];
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, (comment, index: number) => {
    if (allow.test(comment)) {
      const before = css.slice(css.lastIndexOf("\n", index) + 1, index);
      allows.push({ offset: index, ownLine: before.trim() === "" });
    }
    return blank(comment);
  });

  const found: Declaration[] = [];
  const selectors: string[] = [];
  for (const { 0: segment, index } of bare.matchAll(/[^{};]*[{};]?/g)) {
    if (segment === "") continue;
    const body = segment.replace(/[{};]$/, "");
    if (segment.endsWith("{")) {
      selectors.push(body.trim().replace(/\s+/g, " "));
      continue;
    }
    const match = /^(\s*)([a-z-]+)\s*:([\s\S]*)$/.exec(body);
    if (match?.[3].trim()) {
      found.push({
        offset: index + match[1].length,
        context: selectors.at(-1) ?? outer,
        property: match[2],
        value: match[3].trim().replace(/\s+/g, " "),
        allowed: false,
      });
    }
    if (segment.endsWith("}")) selectors.pop();
  }

  for (const { offset, ownLine } of allows) {
    const target = ownLine
      ? found.find((item) => item.offset > offset)
      : found.findLast(
          (item) =>
            item.offset < offset &&
            !bare.slice(item.offset, offset).includes("\n"),
        );
    if (target) target.allowed = true;
  }

  return found.map((item) => ({ ...item, offset: base + item.offset }));
}

// Reads the `style` attributes and `style:` directives of a component's
// markup. A directive's value in braces is read as written, so a literal
// such as `{"12px"}` is caught and a computed one is left alone.
function inlineDeclarations(markup: string) {
  const found: Declaration[] = [];
  for (const match of markup.matchAll(/\sstyle=(["'])([\s\S]*?)\1/g)) {
    const start = match.index + match[0].indexOf(match[2]);
    found.push(...declarations(match[2], start, "style"));
  }
  for (const match of markup.matchAll(
    /\sstyle:([a-z-]+)(?:\|important)?=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g,
  )) {
    found.push({
      offset: match.index + 1,
      context: "style:",
      property: match[1],
      // Only one of the three quoting forms matched.
      value: match
        .slice(2)
        .join("")
        .trim()
        .replace(/^(["'`])(.*)\1$/, "$2"),
      allowed: false,
    });
  }
  return found;
}

// Checks a stylesheet, or a component's `<style>` blocks and inline styles.
// Line numbers count from 1 in the file.
export function check(path: string, source: string) {
  let found: Declaration[];
  if (path.endsWith(".css")) {
    found = declarations(source, 0, "");
  } else {
    found = [];
    // Scripts and comments can hold text that looks like a style, so the
    // markup is read with them blanked out, along with the style blocks.
    const markup = source.replace(
      /<(script|style)\b[^>]*>([\s\S]*?)<\/\1>|<!--[\s\S]*?-->/g,
      (whole: string, tag: string | undefined, body: string, index: number) => {
        if (tag === "style") {
          const start = index + whole.indexOf(">") + 1;
          found.push(...declarations(body, start, ""));
        }
        return blank(whole);
      },
    );
    found.push(...inlineDeclarations(markup));
  }

  const violations: Violation[] = [];
  for (const { offset, context, property, value, allowed } of found) {
    const rule = rules.find((rule) => rule.test(property, value));
    if (!rule || allowed) continue;
    violations.push({
      path,
      line: source.slice(0, offset).split("\n").length,
      context,
      text: `${property}: ${value}`,
      advice: rule.advice,
    });
  }
  return violations.sort((a, b) => a.line - b.line);
}

// A baseline entry is the file, the rule, and the declaration, without the
// line, so it survives edits elsewhere in the file but not a move to another
// rule. Repeated entries count separately.
function key({ path, context, text }: Violation) {
  return `${path}\t${context}\t${text}`;
}

// Splits the violations into those the baseline does not cover, and returns
// the baseline entries that nothing matched.
export function subtract(violations: Violation[], baseline: string[]) {
  const remaining = new Map<string, number>();
  for (const entry of baseline) {
    remaining.set(entry, (remaining.get(entry) ?? 0) + 1);
  }
  const fresh = violations.filter((violation) => {
    const count = remaining.get(key(violation)) ?? 0;
    if (count === 0) return true;
    remaining.set(key(violation), count - 1);
    return false;
  });
  const stale = [...remaining].flatMap(([entry, count]) =>
    Array<string>(count).fill(entry),
  );
  return { fresh, stale };
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
  const { fresh, stale } = subtract(violations, baseline);

  for (const { path, line, text, advice } of fresh) {
    console.log(`${path}:${line}  ${text}  (${advice})`);
  }
  for (const entry of stale) {
    console.log(`stale baseline entry, run --update: ${entry}`);
  }
  process.exit(fresh.length + stale.length > 0 ? 1 : 0);
}
