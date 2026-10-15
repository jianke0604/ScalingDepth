# Contributing to ScalingDepth

Thanks for helping map the residual design space! 🎉

## Add a method

1. Fork the repo.
2. Append an object to `SD.methods` in `assets/js/data.js`:

```js
{
  id: "my-residual",              // unique, kebab-case (used as anchor)
  name: "MyResidual",
  family: "aggregation",          // classic | norm | scaling | aggregation | multistream
  year: 2026,
  authors: "Doe, Smith",
  venue: "NeurIPS 2026",          // or "arXiv 2026"
  arxiv: "2610.00000",            // or link: "https://openreview.net/...", linkLabel: "OpenReview"
  code: "https://github.com/...", // optional
  formula: "x_{l+1} = x_l + F_l(x_l)",  // KaTeX; escape backslashes ("\\alpha")
  desc: "One or two sentences on the core idea.",
  tags: ["dynamic weights"]
}
```

3. Preview with `python3 -m http.server`, then open a PR.

## Add a paper

Append to `SD.papers` with `title`, `authors`, `year`, `arxiv`, and `topic`
(`analysis` | `theory` | `benchmark` | `systems`).

## Add a tutorial or blog post

- **Tutorial**: append to `SD.tutorials` with `group` (section heading, e.g. `"Learning Resources"`),
  `type` (`Video` | `Article` | `Course` | `Notebook`), `title`, `source`, `link`, and optionally
  `linkLabel`, `desc`, and `extra` (a list of `{ label, url }` for slides, code, etc.).
- **Blog post**: append to `SD.blogs` with `title`, `authors`, `date` (`"YYYY-MM"`), `link`, and optionally `note` and `tag`.

## Guidelines

- Use the shared notation: `x_l` = residual stream entering layer *l*, `F_l` = attention or MLP branch, `H_l` = multi-stream state.
- Keep formulas schematic but faithful. Mark simplified forms with "(Schematic form.)" in `desc`.
- Please double-check arXiv IDs.
- For a new family, open an issue first.
