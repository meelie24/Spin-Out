# Spin Out synthetic panel method

This tooling executes 500 scripted product journeys and applies 300 deterministic review lenses to actual supplied screenshot observations. It does not create human-equivalent testers. Browser behavior and stored data are measured; profile motives and action policies are assumptions. Recall, satisfaction, irritation, trust and future use remain unmeasured.

## Frozen scenarios

The committed generator defines exactly 500 product profiles and 300 reviewer-lens profiles using seed `spin-out-panel-2026-09-19-v1`. The reviewed frozen manifest hashes to:

`2cbaef58ba5a817e26765ed52faf4aebb6f153c75a66b90e42c31e0f85c3cdb3`

The profile manifest was generated before running this panel's browser journeys. Its authors had already seen code and earlier QA screenshots. This is a prospective execution freeze, not a blinded study. Preserve the same manifest for baseline and candidate; changing the generator does not authorize changing the frozen manifest midway through comparison.

A pre-execution protocol audit found that the original `patience === 1` abandonment branch was unreachable under the declared correlation formulas. Before any panel browser execution, schema version 2 changed that threshold to `patience <= 2`, creating 46 predetermined limited-entry scenarios. The original unexecuted manifest (`c9263920…`) was preserved separately and superseded. No candidate outcome informed this correction. Use only the version 2 hash above for both comparison runs.

Profiles vary gambling motive, urge, financial pressure, readiness, patience, trust, privacy sensitivity, digital literacy, reading behavior, attention, skepticism, impulsivity, completion tendency, viewport, game, return status, prior knowledge and available context. Pressure influences assigned urge; urge influences patience; skepticism influences trust and privacy sensitivity; patience influences assigned attention and completion tendency. These correlations are explicit stress-test assumptions. They are not estimates of human psychology or demographic stereotypes.

The first 42 profiles are coverage sentinels: six games at seven widths (320, 375, 390, 430, 768, 1024 and 1440). They receive enough entry actions to reach the game. They are not a representative population sample. All other action budgets, optional refusal, hidden-choice selection, reopening, play limits and reload policies are fixed before execution. No coefficient is tuned after reading candidate results.

The 300 reviewer profiles comprise 25 lenses for each of 12 specialties. A lens filters existing observations by its declared criteria and viewport. It does not inspect an image itself. Its count must never be reported as an independent vote, a real designer, or a separate visual inspection.

## What research establishes here

The original brief references [WebChain](https://arxiv.org/abs/2603.05295) (2026), [WebLINX](https://mcgill-nlp.github.io/weblinx/) (2024) and [Mind2Web](https://osu-nlp-group.github.io/Mind2Web/) (2023). Their primary project or paper pages were reviewed on 19 September 2026. WebChain aligns human browser trajectories with visual and structural state; WebLINX grounds dialogue-based web actions in page context and history; Mind2Web pairs website tasks with target elements and operations. These are task/action datasets, not validated models of gambling urge or willingness to disclose financial information.

The tooling borrows the action/observation discipline: execute actions, capture state and preserve failures before explaining them. No dataset-derived estimates of abandonment, privacy attitudes, recall or repeat-use intent were supplied or fitted. Therefore these scripts must not be described as research-calibrated human simulators. A calibration claim would require a documented human comparison dataset, fitting method, held-out validation and uncertainty estimates.

## Files and execution

The scripts use Node core modules and the repository's existing Playwright dependency. Run from the existing repository checkout against its local production test server, with no production credentials. No branch creation, cloning or deployment is part of these scripts.

Freeze the manifest once:

```sh
node qa/synthetic/panel-config.mjs --out qa-artifacts/synthetic/frozen-panel.json
```

Before a 500-profile run, run a small integration check in a separate output directory. Existing artifact files are never overwritten.

```sh
node qa/synthetic/product-panel.mjs --panel qa-artifacts/synthetic/frozen-panel.json --base http://127.0.0.1:3000 --label smoke --revision CURRENT_SHA --limit 2 --workers 1 --out qa-artifacts/synthetic-smoke
```

Run the full candidate:

```sh
node qa/synthetic/product-panel.mjs --panel qa-artifacts/synthetic/frozen-panel.json --base http://127.0.0.1:3000 --label candidate --revision CURRENT_SHA --workers 4 --out qa-artifacts/synthetic
```

The runner checks `git rev-parse HEAD` against the requested revision. It creates a new isolated browser context per profile and executes actual UI clicks/fills. It records DOM measurements, runtime page errors, saved values, action traces and 42 coverage screenshots. Each completed profile receives an individual JSON checkpoint. The 500-profile execution may take several minutes on CI. An interrupted run must be reported as incomplete; existing checkpoints do not prove unexecuted profiles passed.

The baseline designated for this continuation is `09d5778`, overriding the older `a9fbf0e…` reference in Task 6. Run that exact baseline build with the same frozen manifest and tooling. Obtain/build the baseline only through the root agent's authorized existing-repository workflow. The scripts themselves never check out, fetch, clone, commit or deploy code.

```sh
node qa/synthetic/product-panel.mjs --panel PATH_TO_SAME_FROZEN_MANIFEST --base http://127.0.0.1:3000 --label baseline --revision 09d5778 --workers 4 --out qa-artifacts/synthetic
```

Collect both reports and compare:

```sh
node qa/synthetic/product-panel.mjs --baseline qa-artifacts/synthetic/baseline-product-report.json --candidate qa-artifacts/synthetic/candidate-product-report.json --out qa-artifacts/synthetic
```

Comparison rejects different panel hashes or incomplete profile counts. Game outcomes use the product's own randomness, and CI elapsed times vary. Same-profile comparison is useful for implementation regressions; it cannot establish an intervention's psychological effect.

Existing browser observation JSON can be summarized without launching a browser:

```sh
node qa/synthetic/product-panel.mjs --panel qa-artifacts/synthetic/frozen-panel.json --observations PATH_TO_PRODUCT_OBSERVATIONS --out NEW_REPORT_DIRECTORY
```

The root agent may add package scripts, without changing existing scripts:

```json
{
  "qa:synthetic:product": "node qa/synthetic/product-panel.mjs",
  "qa:synthetic:uiux": "node qa/synthetic/uiux-panel.mjs --observations qa-artifacts/synthetic/uiux-observations.json",
  "qa:synthetic": "npm run qa:synthetic:product && npm run qa:synthetic:uiux"
}
```

These commands deliberately require a preexisting frozen manifest and real UI observations. Do not silently generate assessments merely to make an npm command green. CI should upload artifacts with an always-run step, including failures. Output locations must be fresh for repeat runs.

## Actual browser measurements

The product runner records whether the canvas became ready, required answer actions plus Start, automation elapsed time, submitted optional answers, storage accuracy against the selected answer and synthetic fixture truth, completion markers, actual Not now/reopen clicks, reload persistence, observed Ping text/classes and scripted strong-Ping exit clicks when encountered.

Returning profiles are explicitly seeded local fixtures. They are not natural returning users. Privacy refusal, early abandonment and intentionally choosing a visible inaccurate option are model-selected actions, even though the resulting click/storage behavior is measured. Technical failures and page errors are not relabeled as abandonment.

Optional context completeness means no optional dock remains at the end of the bounded scripted answer budget. It is not eventual human completion. No context-supplied percentage implies better therapeutic outcomes. A visible Ping does not establish attention or recall. The contextual-Ping metric remains unmeasured until a validated mapping to actual personal-context use is supplied; raw exposures remain inspectable.

Geometry records identify page overflow, clipped question text, dock contents that are clipped without vertical scrolling, and docks above 140px. A 140px dock with intentional vertical scrolling is allowed. Overlap with controls at the captured scroll position is retained as a review note rather than an automatic failure; subsequent actual clicks exercise scroll reachability. No universal design score is produced. Technical failures and blocking geometry findings yield a nonzero exit status for investigation.

Network isolation permits only GET requests to the loopback origin and blocks all `/api/`, foreign-origin and non-GET requests. Every blocked request is counted. This intentionally excludes auth, payment, production presence and sync integration from panel coverage. Those features remain the responsibility of the existing integration/security suite. Run the local server without production credentials; browser request interception cannot govern server-side outbound requests.

## UI/UX observation contract

Supply actual reviewer observations for each available screenshot/surface:

```json
{
  "revision": "FULL_COMMIT_SHA",
  "surfaces": [{
    "id": "home",
    "screenshot": "qa-artifacts/home-mobile-390.png",
    "width": 390,
    "observerId": "actual-reviewer-identifier",
    "loudest": "The specific element that dominates this render",
    "criteria": {
      "hierarchy": {
        "status": "issue",
        "finding": "Specific observed problem",
        "severity": "medium",
        "evidence": "Observable detail tied to this screenshot"
      }
    }
  }]
}
```

The abbreviated example must be expanded to all 18 criteria: hierarchy, density, typography, spacing, mobile ergonomics, tap clarity, discoverability, action clarity, content clarity, accessibility, visual coherence, motion appropriateness, restraint, perceived quality, brand distinctiveness, trust, consistency and cognitive load. Each entry requires `status` (`pass`, `issue` or `not-assessed`) and `evidence`. Issues also require a finding and severity (`critical`, `high`, `medium`, `low`). Mark gaps `not-assessed` with the reason. Motion requires actual browser observation (`evidenceType: "browser observation"`) or remains not assessed. Static PNGs alone do not establish animation behavior or full accessibility.

```sh
node qa/synthetic/uiux-panel.mjs --panel qa-artifacts/synthetic/frozen-panel.json --observations qa-artifacts/synthetic/uiux-observations.json --screenshot-root . --label candidate --out qa-artifacts/synthetic
```

The UI tool verifies actual PNG bytes, viewport width and screenshot hash. Duplicate observer/surface records are rejected. It reports source-observer counts separately from lens-coverage counts, records rubric and loudest-element disagreement, and lists missing viewport evidence. If only one person or agent inspected a render, it remains one inspection after all 300 lenses run. High or critical observed findings cause a nonzero exit status. A zero status is not a claim that unassessed surfaces passed.

## Verification performed on the tooling

All four modules passed Node syntax checks. Local executable checks verified deterministic hash reproduction, seed sensitivity, exactly 500/300 profiles, 25 profiles per specialty, complete 42-cell coverage, unsafe-origin rejection, missing-metric handling, mismatched-manifest rejection and incomplete-comparison rejection. UI checks verified actual PNG hashing/width checks, one real observation staying one observation after 300 lenses, and rejection of a motion claim based only on a static image.

Before the CI execution described in the final report, no full product journeys had been executed in the staging workspace. A local browser check could not start because the scratch runtime has no installed Chromium executable; the repository's CI browser installation is the primary execution environment. ESM dependency resolution is also tied to the repository's installed node_modules. These are explicit verification limits, not product test results. The root agent must run the small browser integration check and then the full panels in CI before claiming execution complete.
