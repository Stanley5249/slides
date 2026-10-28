// Flags slide CSS that chooses its own layout values instead of the shared
// ones. The layout classes and the spacing and type scales decide most
// geometry, so a slide that writes its own gap, font size, or column width is
// where slides drift apart. A border, a stroke, or the size of a drawing is
// the drawing's own measure and stays unchecked.
//
// A declaration a slide needs anyway takes a disable comment with a reason:
//
//   /* stylelint-disable-next-line declaration-property-value-disallowed-list -- the marker rides along a track */

/** @type {import("stylelint").Config} */
export default {
  customSyntax: "postcss-html",
  // An exception without a reason, or one that no longer excuses anything,
  // fails like a violation.
  reportDescriptionlessDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "declaration-property-value-disallowed-list": {
      position: ["absolute", "fixed"],
    },
    // em follows the type and var() takes a scale step, so only the units
    // that fix a length are refused.
    "declaration-property-unit-disallowed-list": {
      "/^(gap|row-gap|column-gap|margin|padding)/": ["px", "rem"],
      "font-size": ["px", "rem"],
      "grid-template-columns": ["px", "rem"],
    },
  },
};
