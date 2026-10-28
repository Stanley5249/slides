/// <reference types="bun-types" />

import { expect, test } from "bun:test";
import { check, subtract } from "./check-styles.ts";

function lines(path: string, source: string) {
  return check(path, source).map(({ line, text }) => [line, text]);
}

const slide = `<div style="gap: 12px; color: red"></div>

<style>
  .grid {
    grid-template-columns: 130px minmax(0, 1fr);
    gap: var(--deck-gap-tight);
    padding: 0.08em 0;
    border: 2px solid var(--deck-rule);
  }

  .label {
    font-size: 21px;
  }

  .marker {
    /* check-styles: allow the marker rides along a timeline track */
    position: absolute;
    top: 4px;
  }

  .bare {
    /* check-styles: allow */
    position: absolute;
  }
</style>
`;

test("flags fixed layout values and keeps drawing measures", () => {
  expect(lines("a.svelte", slide)).toEqual([
    [1, "gap: 12px"],
    [5, "grid-template-columns: 130px minmax(0, 1fr)"],
    [12, "font-size: 21px"],
    [23, "position: absolute"],
  ]);
});

test("a value may run over several lines", () => {
  const sheet = ".grid {\n  grid-template-columns:\n    130px\n    1fr;\n}\n";
  expect(lines("a.css", sheet)).toEqual([
    [2, "grid-template-columns: 130px 1fr"],
  ]);
});

test("declarations share a line, and the last needs no semicolon", () => {
  expect(lines("a.css", "a { gap: 4px; padding: 2px }\n")).toEqual([
    [1, "gap: 4px"],
    [1, "padding: 2px"],
  ]);
});

test("style directives and multiline attributes are checked", () => {
  const markup = `<div
  style:gap="12px"
  style:position={"absolute"}
  style:font-size|important="21px"
  style:grid-row="1"
  style:left={x}
></div>
<p style="
  color: red;
  margin: 4px
"></p>
`;
  expect(lines("a.svelte", markup)).toEqual([
    [2, "gap: 12px"],
    [3, "position: absolute"],
    [4, "font-size: 21px"],
    [10, "margin: 4px"],
  ]);
});

test("scripts and markup comments are not styles", () => {
  const source = `<script>
  const css = 'x style="gap: 12px"';
</script>
<!-- <div style="gap: 12px"></div> -->
`;
  expect(lines("a.svelte", source)).toEqual([]);
});

test("a trailing comment neither hides nor excuses a declaration", () => {
  const sheet =
    "a {\n  gap: 10px; /* tighter */\n  gap: 9px; /* check-styles: allow drawn */\n  gap: 8px;\n}\n";
  expect(lines("a.css", sheet)).toEqual([
    [2, "gap: 10px"],
    [4, "gap: 8px"],
  ]);
});

test("an allow comment over several lines excuses the next declaration", () => {
  const sheet =
    "a {\n  /* check-styles: allow the arrow is drawn\n     on the axis */\n  position: absolute;\n  gap: 8px;\n}\n";
  expect(lines("a.css", sheet)).toEqual([[5, "gap: 8px"]]);
});

test("the baseline covers each recorded declaration once, in its rule", () => {
  const sheet = ".a {\n  gap: 12px;\n  gap: 12px;\n}\n.b {\n  gap: 12px;\n}\n";
  const { fresh, stale } = subtract(check("a.css", sheet), [
    "a.css\t.a\tgap: 12px",
    "a.css\t.c\tgap: 12px",
  ]);
  expect(fresh.map(({ line }) => line)).toEqual([3, 6]);
  expect(stale).toEqual(["a.css\t.c\tgap: 12px"]);
});
