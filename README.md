# NUTRIFY website

Veterinary nutrition science site with two broiler growth labs (**PoultAI** and **PoultSynapse**), tips and a papers library.
No build step: double-click `index.html`.

## Folder map
| Path | What it is |
|---|---|
| `index.html` | Main site: Home, Founders, Tips, Papers, References (tabs switch with `#home`, `#tips`, `#papers` ...) |
| `css/style.css` | Main site design. Colours and fonts live in the `:root` block at the top. |
| `js/main.js` | Tab navigation, mobile menu, and the code that builds Tips and Papers cards. |
| `js/content.js` | **The file you edit to add papers and tips** (see below). |
| `poultai/` | PoultAI lab (v1, dark neon, 4-nutrient model). |
| `poultsynapse/` | PoultSynapse lab (v2, light Van Gogh mad-scientist look, 32 nutrient factors). Renamed from `poultai-2`. |
| `docs/PoultAI_PoultSynapse_Documentation.pdf` | Every equation with worked examples, discussion and limits. |

## Add a paper or a tip (no HTML or CSS needed)
Open `js/content.js`, copy one block in `PAPERS` or `TIPS`, paste it after a comma and change the text.
The card, filter chip and "Copy citation" button appear automatically and inherit the shared CSS classes
(`.reference-card`, `.paper-card`, `.tip-card`, `.badge`, `.chip`, `.btn`). Same `topic` / `category` spelling = same filter chip.
Write the brief in your own words, give the real link and DOI, and never add a source you have not verified.

## Restyle
- Main site: `:root` in `css/style.css`.
- PoultSynapse: `:root` in `poultsynapse/poultsynapse.css` (colours, fonts, shapes, `--chart-*` colours used by the chart). Backdrop: `poultsynapse/assets/swirls.svg`.
- Dr. Synapse's remarks: `DOCTOR_LINES` at the end of `poultsynapse/poultsynapse.js`.

## Change the models
- PoultSynapse: reference data is section 1 of `poultsynapse.js`. To add a nutrient add one block to `NUTRIENTS`; slider, table row and score appear automatically. Tunable numbers: `NUTRIENT_GROUPS` and `MODEL_CONSTANTS`.
- PoultAI: constants are inside `calculateModelResults()` in `poultai/poultai.js`.
- All equations: `docs/PoultAI_PoultSynapse_Documentation.pdf`.

## Mobile and tablet
Both labs and the main site use responsive CSS (breakpoints 1024 / 980 / 760 / 560 / 360 px). Headers wrap, panels shrink instead of overflowing,
the main menu collapses below 980 px and closes on tap, outside click or Escape. PoultSynapse shows a live result bar at the bottom on small screens.

## Publish with GitHub Pages
Upload everything keeping the structure, then Settings > Pages > branch `main`, folder `/ (root)`.

## What is validated and what is illustrative
- **From Cobb (2022 supplement):** target weights, FCR, feed intake, feeding phases, nutrient targets, amino acid ratios.
- **Modelling assumptions:** how strongly a shortfall reduces weight, group weights, the heat factor, the chicken drawing. Not validated against trial data.
- Not a substitute for veterinary assessment or professional feed formulation.
