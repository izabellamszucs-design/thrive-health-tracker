# QA Findings

The live preview opens successfully and shows the Organic Modernism design direction: a warm ivory hero, pine-green typography, generated botanical dashboard image, and four destination cards for the requested windows. Visual contrast on the homepage is readable, and the layout fits the desktop viewport with responsive cards visible below the hero.

The Metabolic Health Assessment page opens from the home screen and shows the required subtitle and five biomarker sections. A test case with triglycerides 90, HDL 45, fasting glucose 86, blood pressure 125/82, male South Asian waist 36 generated a results page showing 0 of 5 biomarkers within range. Each out-of-range biomarker displayed red status, an x icon, the target criteria, and the calculated distance from the requested acceptable range.

Build status: `pnpm build` completed successfully. Vite reported only a standard bundle-size warning, not a build failure.

The save panel opened from the metabolic results page, accepted an assessment date and optional notes, and saved the record successfully. After saving, the panel closed and the results page remained available, indicating the save flow did not disrupt the user's review context.

The Assessment Records page shows the expected privacy and storage notice, print/export/import controls, and the saved May 6, 2026 metabolic assessment under the correct category. The home summary also updated to show the latest metabolic record.

The Triglyceride-to-HDL Ratio Assessment opens from the home card and presents two numeric fields, explanatory copy, and a clear calculation button. Navigation back to the home screen remains visible.

The ratio calculator accepted test values of triglycerides 160 and HDL 40, calculated a ratio of 4, and classified the result as outside range with an expandable guidance area. The result page provides edit, home, and save actions as intended.

The ratio save flow opened correctly, accepted optional notes, and saved the ratio assessment record without leaving the results page. This confirms both assessment types can be persisted locally.

The Progress Tracker recognizes both saved assessment types and displays the latest metabolic and ratio records side by side. It includes the generated runner/trail image, simple milestone graphics, and expandable result details.

Final validation completed successfully. `pnpm build` completed without errors, with only the standard Vite chunk-size advisory for the generated bundle. `pnpm check` completed successfully with no TypeScript errors.
