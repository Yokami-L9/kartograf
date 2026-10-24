# Kartograf developer guide

Purpose: a local-first sandbox to build tabletop RPG locations. No city economy, resource progression or mandatory simulation.

- Edit `src/`, not the generated root `index.html`.
- Run `npm run build` after source changes and commit the regenerated HTML too.
- `npm run dev` starts http://localhost:5173 with source watching / live reload.
- Run `npm run check` and `npm test` before committing.
- Browser regression tests are in `qa/`; install their Python dependencies separately if needed. Tooling CI is not equivalent to browser QA.
- Maintain old JSON project compatibility and atomic import validation.
- Do not replace the rendering engine or introduce a framework without explaining the migration.
- Never commit credentials, private user maps, browser storage, screenshots or QA exports.
- This is 2D/2.5D, not full 3D. Do not claim untested Safari or Foundry compatibility.
- Make feature changes in branches, submit a PR, and keep `main` usable.
