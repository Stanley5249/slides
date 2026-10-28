/// <reference types="bun-types" />

import { expect, test } from "bun:test";
import { check, subtract } from "./check-styles.ts";

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
  expect(
    check("a.svelte", slide).map(({ line, text }) => [line, text]),
  ).toEqual([
    [1, "gap: 12px"],
    [5, "grid-template-columns: 130px minmax(0, 1fr)"],
    [12, "font-size: 21px"],
    [23, "position: absolute"],
  ]);
});

test("the baseline covers each recorded declaration once", () => {
  const violations = check("a.svelte", slide);
  const fresh = subtract(violations, [
    "a.svelte\tgap: 12px",
    "a.svelte\tfont-size: 21px",
    "a.svelte\tfont-size: 21px",
  ]);
  expect(fresh.map(({ text }) => text)).toEqual([
    "grid-template-columns: 130px minmax(0, 1fr)",
    "position: absolute",
  ]);
});
