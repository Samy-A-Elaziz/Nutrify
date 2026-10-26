# NUTRIFY website

## Open locally
Double-click `index.html`. No build step or installation is needed.

## Publish with GitHub Pages
Create a GitHub repository, upload everything in this folder (keeping the structure), then go to Settings > Pages, choose the `main` branch and `/ (root)`, and save. The site appears at the address GitHub shows.

## Change text and colors
- Page text: edit `index.html`.
- Colors, fonts, spacing: edit the `:root` block at the top of `css/style.css` (and `poultai/poultai.css`).

## Edit founders
Open `js/main.js` and edit the `FOUNDERS` list. Change only the text between quotes. Add or remove a block `{ ... },` to add or remove a person.

## Add references
In `js/main.js`, copy one block in `REFERENCES`, paste it after a comma, and fill in organization, title, year, type, url, accessed, note. Leave unknown fields as `""`. Never add a source you have not verified.

## PoultAI model
- The model is `runPredictionModel()` in `poultai/poultai.js`, section 1, with no interface code.
- To replace it, keep the same input object (energy, protein, lysine, methcys, fiber, phosphorus, calcium, age, startWeight) and return `{ points:[{age, weight}], factor, deviations:[{key, relative}] }`.
- Reference weights: fill `MODEL_INFO.referenceWeights` (`{ 42: grams }`) only from the official Cobb source, noting sex and management assumptions here.

## What is illustrative vs validated
- **Illustrative (everything the model outputs):** the growth curve, nutrient targets, weights and factor are arbitrary demonstration values. They are not Cobb 500 objectives or established nutrition science.
- **Validated:** nothing yet. No Cobb 500 reference values are included.
- Temperature and feed intake inputs exist but are not used in calculations.
- Not a substitute for veterinary assessment or professional feed formulation.
