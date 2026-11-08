/* ==========================================================================
   POULTSYNAPSE — BROILER GROWTH PREDICTION ENGINE (Cobb 500)
   (the mad-scientist edition of the NUTRIFY prediction laboratory)
   --------------------------------------------------------------------------
   Source of every reference value in this file:
   "Cobb500 Broiler Performance & Nutrition Supplement (2022)", Cobb-Vantress.

   FILE MAP
     1. REFERENCE DATA ...... Cobb tables, feeding programmes, nutrient list
     2. LOOKUP HELPERS ...... day -> target weight, day -> feeding phase, etc.
     3. PREDICTION MODEL .... pure maths, NO document/DOM access
     4. INTERFACE BUILDERS .. creates the sliders and reads them back
     5. DISPLAY UPDATERS .... chicken, chart, table, metric boxes
     6. SCENARIOS & EVENTS .. reset / deficient buttons, page start-up
     7. DR. SYNAPSE ......... the lab-notebook comments (all wording lives in one list)

   HOW THE MODEL WORKS (one paragraph)
     For the chosen bird age, sex and market, the code looks up the official
     Cobb target weight and the Cobb nutrient specification of the feeding
     phase that age falls in. Every nutrient the user sets is compared with
     its Cobb target and turned into a score (1.00 = on target). Scores are
     combined into one "performance coefficient". Predicted weight =
     Cobb target weight x coefficient. See docs/PoultAI_PoultSynapse_Documentation.pdf for
     every equation.
   ========================================================================== */


/* ==========================================================================
   0. THEME COLOURS
   Colours used by the drawing code (chart, chicken) are READ FROM THE CSS
   variables in poultsynapse.css, so restyling the page never needs a JS edit.
   ========================================================================== */
function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ==========================================================================
   1. REFERENCE DATA
   ========================================================================== */

/* --------------------------------------------------------------------------
   1.1  COBB 500 PERFORMANCE OBJECTIVES (METRIC), DAYS 0-56
   Each array is indexed by bird age in days (index 0 = day 0).
     weight : live body weight in grams
     fcr    : cumulative feed conversion ratio (not available before day 7)
     dfi    : daily feed intake in grams (not available before day 8)
   `null` means the Cobb table has no value for that day.
   -------------------------------------------------------------------------- */
const COBB_PERFORMANCE = {
    // As hatched (mixed sex)
    hatched: {
        weight: [
            42, 55, 71, 90, 112, 138, 168, 202, 240, 283,
            330, 382, 440, 503, 570, 639, 711, 786, 864, 945,
            1029, 1116, 1205, 1296, 1390, 1486, 1583, 1682, 1783, 1886,
            1989, 2094, 2200, 2306, 2413, 2521, 2629, 2738, 2846, 2954,
            3062, 3170, 3278, 3384, 3490, 3595, 3699, 3801, 3902, 4001,
            4099, 4195, 4289, 4380, 4470, 4557, 4641
        ],
        fcr: [
            null, null, null, null, null, null, null, 0.891, 0.917, 0.933,
            0.952, 0.971, 0.991, 1.012, 1.029, 1.05, 1.072, 1.094, 1.116, 1.138,
            1.16, 1.182, 1.203, 1.224, 1.245, 1.265, 1.284, 1.303, 1.322, 1.34,
            1.358, 1.375, 1.392, 1.409, 1.425, 1.441, 1.457, 1.474, 1.49, 1.506,
            1.522, 1.539, 1.555, 1.573, 1.59, 1.608, 1.627, 1.646, 1.666, 1.686,
            1.707, 1.728, 1.75, 1.772, 1.795, 1.818, 1.842
        ],
        dfi: [
            null, null, null, null, null, null, null, null, 40, 44,
            50, 57, 64, 73, 80, 84, 91, 98, 105, 111,
            118, 125, 131, 137, 143, 149, 154, 160, 165, 169,
            174, 178, 183, 187, 191, 194, 198, 202, 206, 209,
            213, 217, 220, 224, 228, 232, 236, 239, 243, 247,
            250, 253, 256, 258, 260, 261, 262
        ]
    },
    // Male
    male: {
        weight: [
            42, 56, 72, 92, 114, 141, 171, 205, 244, 289,
            339, 395, 457, 525, 603, 677, 754, 834, 918, 1005,
            1095, 1188, 1284, 1382, 1482, 1585, 1690, 1796, 1904, 2014,
            2125, 2237, 2350, 2464, 2579, 2694, 2810, 2926, 3042, 3158,
            3274, 3389, 3503, 3617, 3730, 3842, 3952, 4062, 4169, 4275,
            4379, 4481, 4580, 4677, 4772, 4864, 4953
        ],
        fcr: [
            null, null, null, null, null, null, null, 0.883, 0.906, 0.92,
            0.938, 0.957, 0.976, 0.998, 1.018, 1.039, 1.06, 1.081, 1.102, 1.124,
            1.145, 1.166, 1.186, 1.206, 1.226, 1.246, 1.265, 1.283, 1.301, 1.319,
            1.336, 1.353, 1.369, 1.386, 1.402, 1.417, 1.433, 1.449, 1.464, 1.48,
            1.496, 1.512, 1.528, 1.544, 1.561, 1.579, 1.597, 1.615, 1.633, 1.653,
            1.672, 1.693, 1.713, 1.734, 1.755, 1.777, 1.799
        ],
        dfi: [
            null, null, null, null, null, null, null, null, 40, 45,
            52, 60, 68, 78, 90, 89, 96, 103, 110, 117,
            124, 131, 138, 144, 151, 157, 162, 168, 173, 178,
            183, 188, 192, 196, 200, 204, 208, 212, 215, 219,
            223, 226, 230, 234, 237, 241, 245, 248, 252, 255,
            258, 261, 263, 265, 266, 266, 266
        ]
    },
    // Female
    female: {
        weight: [
            42, 54, 70, 88, 110, 135, 165, 199, 236, 276,
            320, 369, 421, 478, 537, 601, 667, 737, 810, 885,
            963, 1043, 1126, 1210, 1297, 1386, 1477, 1569, 1662, 1757,
            1853, 1951, 2049, 2148, 2248, 2348, 2448, 2549, 2650, 2751,
            2852, 2952, 3052, 3151, 3250, 3348, 3445, 3540, 3635, 3728,
            3819, 3909, 3997, 4083, 4167, 4249, 4329
        ],
        fcr: [
            null, null, null, null, null, null, null, 0.884, 0.915, 0.935,
            0.956, 0.976, 0.998, 1.019, 1.041, 1.063, 1.086, 1.109, 1.132, 1.155,
            1.178, 1.2, 1.222, 1.244, 1.265, 1.286, 1.306, 1.326, 1.346, 1.364,
            1.383, 1.4, 1.418, 1.435, 1.452, 1.469, 1.486, 1.502, 1.519, 1.535,
            1.552, 1.57, 1.587, 1.605, 1.623, 1.642, 1.662, 1.682, 1.703, 1.724,
            1.746, 1.769, 1.792, 1.816, 1.84, 1.865, 1.89
        ],
        dfi: [
            null, null, null, null, null, null, null, null, 40, 42,
            48, 54, 60, 67, 72, 80, 86, 93, 99, 106,
            112, 118, 124, 130, 136, 141, 146, 151, 156, 161,
            165, 169, 173, 177, 181, 185, 188, 192, 196, 199,
            203, 207, 210, 214, 218, 222, 226, 230, 234, 238,
            242, 245, 249, 252, 254, 256, 257
        ]
    }
};

/* Display names for the three Cobb tables (used by the sex selector). */
const SEX_LABELS = {
    hatched: 'As Hatched',
    male: 'Male',
    female: 'Female'
};

/* --------------------------------------------------------------------------
   1.2  FEEDING PROGRAMMES
   Two programmes exist in the Cobb supplement:
     medium : "Medium and Large Broilers"  (5 phases)
     small  : "Small Broilers"             (4 phases)
   For each phase:
     from / to : first and last day of the phase (to = null -> open ended)
     structure : physical feed form
     feedG     : recommended feed per bird for the phase, grams (null = until sale)
     premix    : column used in the vitamin / trace element table
                 (0 = Starter, 1 = Grower, 2 = Finisher)
   -------------------------------------------------------------------------- */
const FEEDING_PROGRAMS = {
    medium: {
        label: 'Medium / Large Birds',
        phases: [
            { name: 'Starter',    from: 0,  to: 12,   structure: 'Crumble', feedG: 455,  premix: 0 },
            { name: 'Grower 1',   from: 13, to: 28,   structure: 'Pellet',  feedG: 2100, premix: 1 },
            { name: 'Grower 2',   from: 29, to: 39,   structure: 'Pellet',  feedG: 2100, premix: 1 },
            { name: 'Finisher 1', from: 40, to: 49,   structure: 'Pellet',  feedG: 2100, premix: 2 },
            { name: 'Finisher 2', from: 50, to: null, structure: 'Pellet',  feedG: null, premix: 2 }
        ]
    },
    small: {
        label: 'Small Birds',
        phases: [
            { name: 'Starter',  from: 0,  to: 8,    structure: 'Crumble',          feedG: 250,  premix: 0 },
            { name: 'Grower 1', from: 9,  to: 18,   structure: 'Crumble / Pellet', feedG: 750,  premix: 1 },
            { name: 'Grower 2', from: 19, to: 28,   structure: 'Pellet',           feedG: 1350, premix: 1 },
            { name: 'Finisher', from: 29, to: null, structure: 'Pellet',           feedG: null, premix: 2 }
        ]
    }
};

/* --------------------------------------------------------------------------
   1.3  NUTRIENT GROUPS (model parameters)
   Every nutrient belongs to one group. A group has:
     label     : heading shown in the interface and table
     weight    : share of the final performance coefficient (all weights add up to 1.00)
     sens      : penalty per unit of relative shortfall below the target
     bonus     : largest gain for feeding ABOVE target (reached at +8 %, the
                 figure Cobb quotes for raising amino acids / protein)
     excessAt  : relative excess above the target where a harmful-excess penalty starts
     excessSens: penalty per unit of relative excess beyond `excessAt`
   NOTE: Cobb publishes requirements (targets), not response curves. The
   weights and sensitivities below are modelling assumptions and are the
   knobs to calibrate if you get trial data.
   -------------------------------------------------------------------------- */
const NUTRIENT_GROUPS = {
    energy:     { label: 'Energy',                   weight: 0.25, sens: 1.0, bonus: 0.04, excessAt: 0.15, excessSens: 0.5 },
    protein:    { label: 'Crude Protein',            weight: 0.15, sens: 1.0, bonus: 0.04, excessAt: 0.25, excessSens: 0.4 },
    aminoacids: { label: 'Digestible Amino Acids',   weight: 0.30, sens: 1.0, bonus: 0.04, excessAt: 0.30, excessSens: 0.3 },
    minerals:   { label: 'Minerals & Electrolytes',  weight: 0.12, sens: 0.8, bonus: 0.00, excessAt: 0.20, excessSens: 0.8 },
    fattyacid:  { label: 'Essential Fatty Acid',     weight: 0.03, sens: 0.5, bonus: 0.00, excessAt: 0.50, excessSens: 0.2 },
    vitamins:   { label: 'Supplementary Vitamins (per tonne)',     weight: 0.08, sens: 0.4, bonus: 0.00, excessAt: 0.50, excessSens: 0.2 },
    traces:     { label: 'Supplementary Trace Elements (per tonne)', weight: 0.07, sens: 0.4, bonus: 0.00, excessAt: 0.50, excessSens: 0.4 }
};

/* --------------------------------------------------------------------------
   1.4  NUTRIENT CATALOGUE  (every nutrient factor in the Cobb supplement)
   Fields:
     id      : key used in the inputs object AND the slider's HTML id
     label   : name shown to the user
     unit    : unit of the slider value
     group   : key of NUTRIENT_GROUPS
     core    : true -> slider is shown in the always-open "Core" section
     min/max/step : slider limits
     weight  : importance inside its group (default 1)
     targets : phase-by-phase target for the macro nutrients
               { medium: [5 phases], small: [4 phases] }
               a value is either a number or a [low, high] range
     premix  : target for vitamins / trace elements, [Starter, Grower, Finisher]
               or { maize:[...], wheat:[...] } when the cereal base matters (biotin)
     (any group parameter, e.g. excessAt, can be overridden per nutrient)
   -------------------------------------------------------------------------- */
const NUTRIENTS = [
    /* ---- Energy (AMEn, apparent metabolizable energy corrected for nitrogen) ---- */
    { id: 'energy', label: 'Metabolizable Energy (AMEn)', unit: 'kcal/kg', group: 'energy', core: true,
      min: 2500, max: 3500, step: 10,
      targets: { medium: [2900, 2950, 3050, 3100, 3150], small: [2900, 2950, 3020, 3100] } },

    /* ---- Crude protein (Cobb gives a range per phase) ---- */
    { id: 'protein', label: 'Crude Protein', unit: '%', group: 'protein', core: true,
      min: 15.0, max: 26.0, step: 0.1,
      targets: {
          medium: [[21, 22], [19, 20], [18, 19], [17, 18], [17, 18]],
          small:  [[21, 22], [19, 20], [18, 19], [17, 18]] } },

    /* ---- Digestible amino acids (lysine is the reference amino acid) ---- */
    { id: 'lysine', label: 'Digestible Lysine', unit: '%', group: 'aminoacids', core: true, weight: 3,
      min: 0.80, max: 1.60, step: 0.01,
      targets: { medium: [1.26, 1.16, 1.06, 0.96, 0.86], small: [1.26, 1.16, 1.08, 1.04] } },
    { id: 'methcys', label: 'Dig. Methionine + Cystine', unit: '%', group: 'aminoacids', core: true, weight: 2,
      min: 0.50, max: 1.20, step: 0.01,
      targets: { medium: [0.94, 0.88, 0.82, 0.74, 0.66], small: [0.94, 0.88, 0.83, 0.80] } },
    { id: 'methionine', label: 'Dig. Methionine', unit: '%', group: 'aminoacids', weight: 1.5,
      min: 0.25, max: 0.75, step: 0.01,
      targets: { medium: [0.48, 0.47, 0.44, 0.40, 0.35], small: [0.48, 0.47, 0.44, 0.43] } },
    { id: 'tryptophan', label: 'Dig. Tryptophan', unit: '%', group: 'aminoacids',
      min: 0.10, max: 0.30, step: 0.01,
      targets: { medium: [0.21, 0.18, 0.19, 0.17, 0.15], small: [0.21, 0.18, 0.19, 0.18] } },
    { id: 'threonine', label: 'Dig. Threonine', unit: '%', group: 'aminoacids', weight: 2,
      min: 0.40, max: 1.10, step: 0.01,
      targets: { medium: [0.86, 0.78, 0.70, 0.62, 0.56], small: [0.86, 0.78, 0.71, 0.67] } },
    { id: 'arginine', label: 'Dig. Arginine', unit: '%', group: 'aminoacids',
      min: 0.60, max: 1.80, step: 0.01,
      targets: { medium: [1.36, 1.25, 1.16, 1.05, 0.95], small: [1.36, 1.25, 1.18, 1.13] } },
    { id: 'valine', label: 'Dig. Valine', unit: '%', group: 'aminoacids',
      min: 0.40, max: 1.30, step: 0.01,
      targets: { medium: [0.96, 0.88, 0.81, 0.74, 0.67], small: [0.96, 0.88, 0.82, 0.80] } },
    { id: 'isoleucine', label: 'Dig. Isoleucine', unit: '%', group: 'aminoacids',
      min: 0.40, max: 1.10, step: 0.01,
      targets: { medium: [0.81, 0.75, 0.69, 0.63, 0.57], small: [0.81, 0.75, 0.70, 0.69] } },
    { id: 'leucine', label: 'Dig. Leucine', unit: '%', group: 'aminoacids',
      min: 0.60, max: 1.80, step: 0.01,
      targets: { medium: [1.39, 1.28, 1.17, 1.06, 0.95], small: [1.39, 1.28, 1.19, 1.14] } },

    /* ---- Minerals (sodium, chloride, potassium are ranges, so excess starts earlier) ---- */
    { id: 'calcium', label: 'Calcium', unit: '%', group: 'minerals', weight: 2,
      min: 0.40, max: 1.40, step: 0.01,
      targets: { medium: [0.96, 0.80, 0.74, 0.72, 0.68], small: [0.96, 0.80, 0.74, 0.72] } },
    { id: 'avp', label: 'Available Phosphorus', unit: '%', group: 'minerals', weight: 2,
      min: 0.20, max: 0.80, step: 0.01,
      targets: { medium: [0.58, 0.40, 0.37, 0.36, 0.34], small: [0.54, 0.40, 0.37, 0.36] } },
    { id: 'sodium', label: 'Sodium', unit: '%', group: 'minerals', excessAt: 0.10, excessSens: 1.0,
      min: 0.05, max: 0.40, step: 0.01,
      targets: { medium: [[0.16, 0.23], [0.16, 0.23], [0.16, 0.23], [0.16, 0.23], [0.16, 0.23]],
                 small:  [[0.16, 0.23], [0.16, 0.23], [0.16, 0.23], [0.16, 0.23]] } },
    { id: 'chloride', label: 'Chloride', unit: '%', group: 'minerals', excessAt: 0.10, excessSens: 1.0,
      min: 0.05, max: 0.60, step: 0.01,
      targets: { medium: [[0.16, 0.30], [0.16, 0.30], [0.16, 0.30], [0.16, 0.30], [0.16, 0.30]],
                 small:  [[0.16, 0.30], [0.16, 0.30], [0.16, 0.30], [0.16, 0.30]] } },
    { id: 'potassium', label: 'Potassium', unit: '%', group: 'minerals', excessAt: 0.10, excessSens: 1.0,
      min: 0.30, max: 1.30, step: 0.01,
      targets: { medium: [[0.60, 0.95], [0.60, 0.95], [0.60, 0.95], [0.60, 0.95], [0.60, 0.95]],
                 small:  [[0.60, 0.95], [0.60, 0.95], [0.60, 0.95], [0.60, 0.95]] } },

    /* ---- Essential fatty acid ---- */
    { id: 'linoleic', label: 'Linoleic Acid', unit: '%', group: 'fattyacid',
      min: 0.50, max: 2.00, step: 0.05,
      targets: { medium: [1.20, 1.20, 1.00, 1.00, 1.00], small: [1.20, 1.20, 1.00, 1.00] } },

    /* ---- Supplementary vitamins (per tonne of feed): [Starter, Grower, Finisher 1 and 2] ---- */
    { id: 'vitA',  label: 'Vitamin A',  unit: 'MIU/t', group: 'vitamins', min: 0, max: 26,  step: 0.5, premix: [[10, 13], 10, 10] },
    { id: 'vitD3', label: 'Vitamin D3', unit: 'MIU/t', group: 'vitamins', min: 0, max: 10,  step: 0.5, premix: [5, 5, 5] },
    { id: 'vitE',  label: 'Vitamin E',  unit: 'KIU/t', group: 'vitamins', min: 0, max: 160, step: 5,   premix: [80, 50, 50] },
    { id: 'vitK',  label: 'Vitamin K',  unit: 'g/t',   group: 'vitamins', min: 0, max: 6,   step: 0.5, premix: [3, 3, 3] },
    { id: 'vitB1', label: 'Vitamin B1 (thiamine)',    unit: 'g/t',  group: 'vitamins', min: 0, max: 6,   step: 0.5, premix: [3, 2, 2] },
    { id: 'vitB2', label: 'Vitamin B2 (riboflavin)',  unit: 'g/t',  group: 'vitamins', min: 0, max: 18,  step: 0.5, premix: [9, 8, 6] },
    { id: 'vitB6', label: 'Vitamin B6 (pyridoxine)',  unit: 'g/t',  group: 'vitamins', min: 0, max: 8,   step: 0.5, premix: [4, 3, 3] },
    { id: 'vitB12', label: 'Vitamin B12',             unit: 'mg/t', group: 'vitamins', min: 0, max: 40,  step: 1,   premix: [20, 15, 15] },
    { id: 'biotin', label: 'Biotin',                  unit: 'mg/t', group: 'vitamins', min: 0, max: 400, step: 5,
      premix: { maize: [150, 120, 120], wheat: [200, 180, 180] } },   /* depends on cereal base */
    { id: 'choline', label: 'Choline',                unit: 'g/t',  group: 'vitamins', min: 0, max: 1000, step: 10, premix: [500, 400, 350] },
    { id: 'folic', label: 'Folic Acid',               unit: 'g/t',  group: 'vitamins', min: 0, max: 4,   step: 0.1, premix: [2, 2, 1.5] },
    { id: 'nicotinic', label: 'Nicotinic Acid',       unit: 'g/t',  group: 'vitamins', min: 0, max: 120, step: 5,   premix: [60, 50, 50] },
    { id: 'pantothenic', label: 'Pantothenic Acid',   unit: 'g/t',  group: 'vitamins', min: 0, max: 30,  step: 1,   premix: [15, 12, 10] },

    /* ---- Supplementary trace elements (per tonne of feed) ---- */
    { id: 'manganese', label: 'Manganese', unit: 'g/t', group: 'traces', min: 0, max: 200, step: 5,    premix: [100, 100, 100] },
    { id: 'zinc',      label: 'Zinc',      unit: 'g/t', group: 'traces', min: 0, max: 200, step: 5,    premix: [100, 100, 100] },
    { id: 'iron',      label: 'Iron',      unit: 'g/t', group: 'traces', min: 0, max: 80,  step: 5,    premix: [40, 40, 40] },
    { id: 'copper',    label: 'Copper',    unit: 'g/t', group: 'traces', min: 0, max: 30,  step: 1,    premix: [15, 15, 15] },
    { id: 'iodine',    label: 'Iodine',    unit: 'g/t', group: 'traces', min: 0, max: 2,   step: 0.1,  premix: [1, 1, 1] },
    { id: 'selenium',  label: 'Selenium',  unit: 'g/t', group: 'traces', min: 0, max: 0.7, step: 0.05, premix: [0.35, 0.35, 0.35] }
];

/* --------------------------------------------------------------------------
   1.5  BALANCED DIGESTIBLE AMINO ACID RATIOS (% of lysine)
   Official Cobb "ideal protein" profile. Order = phases of the feeding
   programme; the small-bird programme uses the first four entries.
   -------------------------------------------------------------------------- */
const AMINO_ACID_RATIOS = {
    methionine: [38, 40, 41, 41, 41],
    methcys:    [75, 76, 77, 77, 77],
    tryptophan: [16, 16, 18, 18, 18],
    threonine:  [68, 67, 66, 65, 65],
    arginine:   [108, 108, 109, 109, 110],
    valine:     [76, 76, 76, 77, 78],
    isoleucine: [64, 64, 65, 66, 66],
    leucine:    [110, 110, 110, 110, 110]
};

/* --------------------------------------------------------------------------
   1.6  MODEL CONSTANTS (every tunable number in one place)
   -------------------------------------------------------------------------- */
const MODEL_CONSTANTS = {
    MAX_AGE: 56,               /* last day in the Cobb tables */
    BONUS_REACHED_AT: 0.08,    /* +8 % above target = full "bonus" (Cobb yield section) */
    LIMITING_SHARE: 0.20,      /* share of the coefficient given to the worst nutrient */
    BALANCE_TOLERANCE: 0.05,   /* average amino acid ratio error allowed before a penalty */
    BALANCE_SENS: 0.25,        /* penalty per unit of error beyond the tolerance */
    BALANCE_MAX_PENALTY: 0.06, /* the imbalance penalty can never exceed 6 % */
    STATUS_TOLERANCE: 0.02,    /* +/-2 % around a target still counts as "optimal" */
    HEAT_START: 25,            /* deg C where heat stress begins (original PoultSynapse value) */
    HEAT_PENALTY: 0.018,       /* performance lost per deg C above HEAT_START */
    DEFICIENT_COEFF: 0.85,     /* coefficient below this -> "Deficient" chicken */
    HIGH_DENSITY_COEFF: 1.015  /* coefficient above this -> "High-Density" chicken */
};

/* Energy unit conversion: Cobb lists energy in kcal/kg and MJ/kg (kcal x 0.004184 = MJ). */
const MJ_PER_KCAL = 0.004184;


/* ==========================================================================
   2. LOOKUP HELPERS
   ========================================================================== */

/**
 * Returns the Cobb 500 target live weight (grams) for a given age and sex.
 * Replaces the old 7-point interpolation: the supplement has a value for
 * every day, so the lookup is exact.
 * @param {number} day  bird age, 0-56
 * @param {string} sex  'hatched' | 'male' | 'female'
 */
function getCobbTarget(day, sex = 'hatched') {
    const d = Math.min(MODEL_CONSTANTS.MAX_AGE, Math.max(0, day));
    return COBB_PERFORMANCE[sex].weight[d];
}

/**
 * Returns the Cobb cumulative feed conversion for the day. Cobb publishes
 * FCR from day 7, so younger ages use the day-7 value.
 */
function getCobbFCR(day, sex = 'hatched') {
    const d = Math.min(MODEL_CONSTANTS.MAX_AGE, Math.max(7, day));
    return COBB_PERFORMANCE[sex].fcr[d];
}

/**
 * Returns the Cobb daily feed intake (g/bird/day), or null before day 8.
 */
function getCobbDailyIntake(day, sex = 'hatched') {
    const d = Math.min(MODEL_CONSTANTS.MAX_AGE, Math.max(0, day));
    return COBB_PERFORMANCE[sex].dfi[d];
}

/**
 * Finds the feeding phase (Starter, Grower 1, ...) a bird of this age is in.
 * @returns {{index:number, name:string, from:number, to:(number|null), structure:string, feedG:(number|null), premix:number}}
 */
function getFeedingPhase(day, market = 'medium') {
    const phases = FEEDING_PROGRAMS[market].phases;
    for (let i = 0; i < phases.length; i++) {
        if (phases[i].to === null || day <= phases[i].to) {
            return { index: i, ...phases[i] };
        }
    }
    return { index: phases.length - 1, ...phases[phases.length - 1] };
}

/**
 * Normalises a Cobb target (number or [low, high]) to {lo, hi, mid}.
 */
function toTargetRange(raw) {
    if (Array.isArray(raw)) {
        return { lo: raw[0], hi: raw[1], mid: (raw[0] + raw[1]) / 2 };
    }
    return { lo: raw, hi: raw, mid: raw };
}

/**
 * Returns the Cobb target of ONE nutrient for a given phase.
 * Macro nutrients read `targets[market][phaseIndex]`; vitamins and trace
 * elements read `premix[phase.premix]` (cereal-dependent for biotin).
 */
function getNutrientTarget(nutrient, phase, market, grain) {
    let raw;
    if (nutrient.targets) {
        raw = nutrient.targets[market][phase.index];
    } else {
        const table = Array.isArray(nutrient.premix) ? nutrient.premix : nutrient.premix[grain];
        raw = table[phase.premix];
    }
    return toTargetRange(raw);
}

/**
 * Returns the full Cobb nutrient specification (all factors) for an age.
 * Same name and role as the original function, now complete.
 * @returns {Object} { [nutrientId]: {lo, hi, mid} }
 */
function getPhaseTargetNutrients(day, market = 'medium', grain = 'maize') {
    const phase = getFeedingPhase(day, market);
    const targets = {};
    NUTRIENTS.forEach(n => {
        targets[n.id] = getNutrientTarget(n, phase, market, grain);
    });
    return targets;
}

/** Number of decimals needed to display a slider step (0.01 -> 2). */
function decimalsOf(step) {
    const s = String(step);
    return s.includes('.') ? s.split('.')[1].length : 0;
}

/** Rounds a value to the slider step so it can be placed on a slider. */
function roundToStep(value, step) {
    return (Math.round(value / step) * step).toFixed(decimalsOf(step));
}

/** Formats a value or a range for display, e.g. "1.26" or "0.16-0.23". */
function formatTarget(nutrient, t) {
    const dec = decimalsOf(nutrient.step);
    if (t.lo === t.hi) return `${t.lo.toFixed(dec)} ${nutrient.unit}`;
    return `${t.lo.toFixed(dec)}-${t.hi.toFixed(dec)} ${nutrient.unit}`;
}


/* ==========================================================================
   3. PREDICTION MODEL  (pure calculation, no DOM access)
   ========================================================================== */

/**
 * Turns one nutrient level into a score. 1.00 = on target.
 *   below the target range -> loses `sens` x relative shortfall
 *   inside the range       -> exactly 1.00
 *   above the range        -> small gain (up to `bonus`, reached at +8 %),
 *                             then a penalty once excess passes `excessAt`
 * @param {number} value   level chosen by the user
 * @param {{lo:number,hi:number}} target  Cobb target range
 * @param {Object} p       {sens, bonus, excessAt, excessSens}
 */
function scoreNutrient(value, target, p) {
    if (value < target.lo) {
        return Math.max(0, 1 - p.sens * (target.lo - value) / target.lo);
    }
    if (value <= target.hi) {
        return 1;
    }
    const rel = (value - target.hi) / target.hi;                       /* relative excess */
    const gain = p.bonus * Math.min(rel, MODEL_CONSTANTS.BONUS_REACHED_AT) / MODEL_CONSTANTS.BONUS_REACHED_AT;
    const penalty = p.excessSens * Math.max(0, rel - p.excessAt);
    return Math.max(0, 1 + gain - penalty);
}

/**
 * Scores every nutrient and combines them group by group.
 * @returns {{scores:Object, groupScores:Object, weighted:number, worst:{id:string, score:number}}}
 */
function calculateNutrientScores(inputs, targets) {
    const scores = {};
    const sums = {};           /* group -> sum(weight x score) */
    const weights = {};        /* group -> sum(weight) */
    let worst = { id: null, score: Infinity };

    NUTRIENTS.forEach(n => {
        const params = { ...NUTRIENT_GROUPS[n.group], ...n };          /* nutrient overrides group */
        const s = scoreNutrient(inputs[n.id], targets[n.id], params);
        const w = n.weight || 1;
        scores[n.id] = s;
        sums[n.group] = (sums[n.group] || 0) + w * s;
        weights[n.group] = (weights[n.group] || 0) + w;
        if (s < worst.score) worst = { id: n.id, score: s };
    });

    /* weighted mean inside each group, then weighted sum across groups */
    const groupScores = {};
    let weighted = 0;
    Object.keys(NUTRIENT_GROUPS).forEach(g => {
        groupScores[g] = sums[g] / weights[g];
        weighted += NUTRIENT_GROUPS[g].weight * groupScores[g];
    });

    return { scores, groupScores, weighted, worst };
}

/**
 * Amino acid balance: compares each amino acid's ratio to lysine with the
 * Cobb ideal-protein ratio and returns the average relative error and the
 * resulting growth penalty (0 inside the tolerance).
 */
function calculateAminoAcidBalance(inputs, phase) {
    const ids = Object.keys(AMINO_ACID_RATIOS);
    let totalError = 0;
    ids.forEach(id => {
        const actual = (inputs[id] / inputs.lysine) * 100;             /* % of lysine */
        const ideal = AMINO_ACID_RATIOS[id][phase.index];
        totalError += Math.abs(actual - ideal) / ideal;
    });
    const avgError = totalError / ids.length;
    const C = MODEL_CONSTANTS;
    const penalty = Math.min(C.BALANCE_MAX_PENALTY, C.BALANCE_SENS * Math.max(0, avgError - C.BALANCE_TOLERANCE));
    return { avgError, penalty };
}

/**
 * Heat stress multiplier (kept from the original PoultSynapse model).
 * 1.00 up to 25 deg C, then -1.8 % per degree. Not a Cobb value.
 */
function calculateTemperatureIndex(temp) {
    const C = MODEL_CONSTANTS;
    if (temp <= C.HEAT_START) return 1.0;
    return Math.max(0.5, 1.0 - (temp - C.HEAT_START) * C.HEAT_PENALTY);
}

/**
 * MAIN MODEL. Takes the inputs object and returns every computed result.
 * inputs = { age, sex, market, grain, temp, energy, protein, lysine, ... }
 */
function calculateModelResults(inputs) {
    const C = MODEL_CONSTANTS;
    const phase = getFeedingPhase(inputs.age, inputs.market);
    const phaseTargets = getPhaseTargetNutrients(inputs.age, inputs.market, inputs.grain);
    const targetWeight = getCobbTarget(inputs.age, inputs.sex);

    /* 1. score every nutrient against its Cobb target */
    const nutrientScores = calculateNutrientScores(inputs, phaseTargets);

    /* 2. amino acid balance penalty and heat stress index */
    const balance = calculateAminoAcidBalance(inputs, phase);
    const tempIndex = calculateTemperatureIndex(inputs.temp);

    /* 3. coefficient = weighted score (80 %) + limiting nutrient (20 %),
          then reduced by imbalance and heat stress */
    const limiting = Math.min(1, nutrientScores.worst.score);
    const nutrientCoeff = (1 - C.LIMITING_SHARE) * nutrientScores.weighted + C.LIMITING_SHARE * limiting;
    const performanceCoeff = nutrientCoeff * (1 - balance.penalty) * tempIndex;

    /* 4. predicted weight and variance against the Cobb standard */
    const predictedWeight = Math.round(targetWeight * performanceCoeff);
    const variance = predictedWeight - targetWeight;
    const variancePct = ((variance / targetWeight) * 100).toFixed(1);

    /* 5. Cobb FCR for the day, worsened in proportion to the weight shortfall */
    const fcrTarget = getCobbFCR(inputs.age, inputs.sex);
    const fcr = (fcrTarget * (targetWeight / (predictedWeight || 1))).toFixed(3);

    return {
        predictedWeight,
        targetWeight,
        variance,
        variancePct,
        fcr,
        fcrTarget: fcrTarget.toFixed(3),
        coeff: performanceCoeff,
        phase,
        phaseTargets,
        scores: nutrientScores.scores,
        groupScores: nutrientScores.groupScores,
        worst: nutrientScores.worst,
        balance,
        tempIndex
    };
}

/**
 * Classifies one nutrient for the table: 'optimal', 'deficient' or 'surplus'
 * (within +/-2 % of the Cobb range counts as optimal).
 */
function classifyNutrient(value, target) {
    const tol = MODEL_CONSTANTS.STATUS_TOLERANCE;
    if (value < target.lo * (1 - tol)) return 'deficient';
    if (value > target.hi * (1 + tol)) return 'surplus';
    return 'optimal';
}


/* ==========================================================================
   4. INTERFACE BUILDERS AND INPUT READING
   ========================================================================== */

/** Builds the markup of one slider (same structure as the original static HTML). */
function buildSliderMarkup(n) {
    return `
        <div class="param-group">
            <label for="${n.id}">
                <span>${n.label} (${n.unit})</span>
                <span class="val-display" id="${n.id}ValDisplay"></span>
            </label>
            <input type="range" id="${n.id}" min="${n.min}" max="${n.max}" step="${n.step}" value="${n.min}" class="lab-slider" oninput="updateLabSimulation()">
        </div>`;
}

/**
 * Creates all nutrient sliders:
 *  - "core" nutrients go in the always-open section (#coreNutrientSliders)
 *  - every other group goes in its own collapsible section (#extendedNutrientSliders)
 */
function buildNutrientControls() {
    const core = document.getElementById('coreNutrientSliders');
    const extended = document.getElementById('extendedNutrientSliders');

    core.innerHTML = NUTRIENTS.filter(n => n.core).map(buildSliderMarkup).join('');

    extended.innerHTML = Object.keys(NUTRIENT_GROUPS).map(groupKey => {
        const members = NUTRIENTS.filter(n => n.group === groupKey && !n.core);
        if (members.length === 0) return '';
        const title = groupKey === 'aminoacids' ? 'Other Digestible Amino Acids' : NUTRIENT_GROUPS[groupKey].label;
        return `
            <details class="param-details">
                <summary class="param-section-title">${title} (${members.length})</summary>
                ${members.map(buildSliderMarkup).join('')}
            </details>`;
    }).join('');
}

/** Reads every control into one flat inputs object. */
function readLabInputs() {
    const inputs = {
        age: parseInt(document.getElementById('birdAge').value),
        sex: document.getElementById('birdSex').value,
        market: document.getElementById('feedMarket').value,
        grain: document.getElementById('dietGrain').value,
        temp: parseFloat(document.getElementById('temperature').value)
    };
    NUTRIENTS.forEach(n => {
        inputs[n.id] = parseFloat(document.getElementById(n.id).value);
    });
    return inputs;
}

/**
 * Writes a set of nutrient levels into the sliders.
 * @param {Object} levels  { [nutrientId]: value }
 */
function setNutrientSliders(levels) {
    NUTRIENTS.forEach(n => {
        const slider = document.getElementById(n.id);
        slider.value = roundToStep(levels[n.id], n.step);
    });
}


/* ==========================================================================
   5. DISPLAY UPDATERS
   ========================================================================== */

/**
 * Resizes and recolours the chicken. Two things scale it:
 *   ageScale      : grows with age (0.55 at day 0 -> 1.20 at day 56)
 *   nutrientScale : follows the performance coefficient (clamped 0.70-1.25)
 * The maximum possible scale is 1.2 x 1.25 = 1.5, and the viewport is sized
 * so the chicken still fits and stays centred at that maximum.
 */
function updateChickenPhenotype(inputs, results) {
    const wrapper = document.getElementById('chickenAvatarWrapper');
    const morphBadge = document.getElementById('morphBadge');
    const relativeMassPercent = document.getElementById('relativeMassPercent');
    const physicalScaleTag = document.getElementById('physicalScaleTag');

    const bodyPath = document.getElementById('chickBody');
    const combPath = document.getElementById('chickComb');

    const ageScale = 0.55 + (inputs.age / MODEL_CONSTANTS.MAX_AGE) * 0.65;
    const nutrientScale = Math.min(1.25, Math.max(0.7, results.coeff));
    const totalScale = (ageScale * nutrientScale).toFixed(2);

    wrapper.style.transform = `scale(${totalScale})`;

    const massPct = Math.round(results.coeff * 100);
    relativeMassPercent.textContent = `${massPct}%`;
    physicalScaleTag.textContent = `${totalScale}x`;

    /* The badge colour comes from the CSS class (state-deficient / state-high / state-optimal) */
    let state = 'optimal';
    if (results.coeff < MODEL_CONSTANTS.DEFICIENT_COEFF) state = 'deficient';
    else if (results.coeff > MODEL_CONSTANTS.HIGH_DENSITY_COEFF) state = 'high';

    const look = {
        deficient: { text: 'Deficient Rations (Sub-Optimal)', stroke: '--danger-red',    comb: '#f87171' },
        high:      { text: 'High-Density Feed Performance',   stroke: '--warning-amber', comb: '#dc2626' },
        optimal:   { text: 'Optimal Cobb 500 Phenotype',      stroke: '--emerald-accent', comb: '#ef4444' }
    }[state];

    morphBadge.textContent = look.text;
    morphBadge.className = `morph-badge state-${state}`;
    bodyPath.setAttribute('stroke', cssVar(look.stroke));
    combPath.setAttribute('fill', look.comb);
}

/**
 * Draws the growth chart (days 1-56): dashed grey = Cobb standard for the
 * selected sex, solid cyan = prediction if the CURRENT ration were fed on
 * every day, dot = the selected age.
 */
function renderLabChart(inputs) {
    const stage = document.getElementById('labChartStage');
    const width = stage.clientWidth || 550;
    const height = stage.clientHeight || 250;
    const padding = width < 420 ? 30 : 40;            /* tighter margins on phones */
    const fontSize = width < 420 ? 8 : 9;
    const gridColor = cssVar('--chart-grid'), textColor = cssVar('--chart-text');
    const refColor = cssVar('--chart-ref'), curColor = cssVar('--chart-cur');

    /* one point per day, 1 to 56 */
    const dataPoints = [];
    for (let day = 1; day <= MODEL_CONSTANTS.MAX_AGE; day++) {
        const subInputs = { ...inputs, age: day };
        const res = calculateModelResults(subInputs);
        dataPoints.push({ day, predicted: res.predictedWeight, target: res.targetWeight });
    }

    const maxX = MODEL_CONSTANTS.MAX_AGE;
    const maxY = 5000;     /* highest Cobb target is 4953 g (male, day 56) */

    function getX(d) { return padding + (d / maxX) * (width - padding * 2); }
    function getY(w) { return height - padding - (w / maxY) * (height - padding * 2); }

    let curD = '', refD = '';
    dataPoints.forEach((pt, i) => {
        const x = getX(pt.day);
        const yCur = getY(pt.predicted);
        const yRef = getY(pt.target);
        curD += `${i === 0 ? 'M' : 'L'} ${x} ${yCur} `;
        refD += `${i === 0 ? 'M' : 'L'} ${x} ${yRef} `;
    });

    /* horizontal weight lines every 1000 g, vertical day lines every 7 days */
    let grid = '';
    for (let w = 1000; w <= 5000; w += 1000) {
        const y = getY(w);
        grid += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${gridColor}" stroke-width="1"/>
                 <text x="${padding - 6}" y="${y + 4}" font-size="${fontSize}" fill="${textColor}" text-anchor="end" font-family="Space Mono, monospace">${w}g</text>`;
    }

    for (let d = 7; d <= maxX; d += 7) {
        const x = getX(d);
        grid += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="${gridColor}" stroke-width="1"/>
                 <text x="${x}" y="${height - padding + 15}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" font-family="Space Mono, monospace">D${d}</text>`;
    }

    const activeRes = calculateModelResults(inputs);
    const highlightX = getX(inputs.age);
    const highlightY = getY(activeRes.predictedWeight);

    const svg = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
            ${grid}
            <!-- Reference Cobb 500 curve (2022 supplement) -->
            <path d="${refD}" fill="none" stroke="${refColor}" stroke-width="2.5" stroke-dasharray="6,5"/>
            <!-- Predicted Dynamic Curve -->
            <path d="${curD}" fill="none" stroke="${curColor}" stroke-width="3.5" stroke-linecap="round"/>
            <!-- Active Node Dot -->
            <circle cx="${highlightX}" cy="${highlightY}" r="6" fill="${curColor}" stroke="#2b1d0e" stroke-width="2"/>
        </svg>
    `;

    stage.innerHTML = svg;
}

/**
 * Fills the "Ration Dynamics Matrix": one row per nutrient factor, grouped
 * by nutrient group, plus an amino acid balance row.
 */
function updateMatrixTable(inputs, results) {
    const tbody = document.getElementById('labMatrixBody');
    const targets = results.phaseTargets;
    let html = '';
    let currentGroup = null;

    NUTRIENTS.forEach(n => {
        /* group heading row whenever the group changes */
        if (n.group !== currentGroup) {
            currentGroup = n.group;
            html += `<tr class="matrix-group-row"><td colspan="5">${NUTRIENT_GROUPS[n.group].label}</td></tr>`;
        }

        const value = inputs[n.id];
        const t = targets[n.id];
        const dec = decimalsOf(n.step);
        const std = classifyNutrient(value, t);

        /* deviation: 0 inside the range, otherwise distance to the nearest bound */
        let dev = 0;
        if (value < t.lo) dev = (value - t.lo) / t.lo * 100;
        if (value > t.hi) dev = (value - t.hi) / t.hi * 100;

        /* energy also shows MJ/kg, the second unit Cobb uses */
        let targetText = formatTarget(n, t);
        if (n.id === 'energy') {
            targetText += ` (${(t.mid * MJ_PER_KCAL).toFixed(2)} MJ/kg)`;
        }

        html += `
        <tr>
            <td><strong>${n.label}</strong></td>
            <td class="cell-value">${value.toFixed(dec)} ${n.unit}</td>
            <td class="cell-muted">${targetText}</td>
            <td class="cell-muted cell-mono">${dev > 0 ? '+' : ''}${dev.toFixed(1)}%</td>
            <td><span class="status-badge ${std}">${std.toUpperCase()}</span></td>
        </tr>`;
    });

    /* amino acid balance row (ratio-to-lysine check) */
    const balanced = results.balance.avgError <= MODEL_CONSTANTS.BALANCE_TOLERANCE;
    html += `<tr class="matrix-group-row"><td colspan="5">Amino Acid Balance (ratios to lysine)</td></tr>
        <tr>
            <td><strong>Avg. ratio error vs Cobb ideal profile</strong></td>
            <td class="cell-value">${(results.balance.avgError * 100).toFixed(1)}%</td>
            <td class="cell-muted">&le; ${(MODEL_CONSTANTS.BALANCE_TOLERANCE * 100).toFixed(1)}%</td>
            <td class="cell-muted cell-mono">-${(results.balance.penalty * 100).toFixed(1)}% growth</td>
            <td><span class="status-badge ${balanced ? 'optimal' : 'surplus'}">${balanced ? 'BALANCED' : 'IMBALANCED'}</span></td>
        </tr>`;

    tbody.innerHTML = html;
}

/** Shows the feeding phase details and the most limiting nutrient. */
function updatePhaseInfo(inputs, results) {
    const phase = results.phase;
    const period = phase.to === null ? `day ${phase.from}+` : `days ${phase.from}-${phase.to}`;
    const feed = phase.feedG === null ? 'feed until sale' : `${phase.feedG} g feed/bird in phase`;
    const dfi = getCobbDailyIntake(inputs.age, inputs.sex);
    const dfiText = dfi === null ? '' : ` &middot; Cobb intake ${dfi} g/bird/day`;
    const worstNutrient = NUTRIENTS.find(n => n.id === results.worst.id);
    const limiting = results.worst.score >= 1
        ? 'No limiting nutrient'
        : `Most limiting: ${worstNutrient.label} (score ${results.worst.score.toFixed(2)})`;

    document.getElementById('labPhaseInfo').innerHTML =
        `<strong>${phase.name}</strong> (${period}) &middot; ${phase.structure} &middot; ${feed}${dfiText}<br>${limiting}`;
}

/** Master refresh: reads inputs, runs the model, updates every display. */
function updateLabSimulation() {
    const inputs = readLabInputs();

    /* live values next to each slider */
    document.getElementById('ageValDisplay').textContent = `${inputs.age} Days`;
    document.getElementById('tempValDisplay').textContent = `${inputs.temp}°C`;
    NUTRIENTS.forEach(n => {
        const dec = decimalsOf(n.step);
        const unit = n.id === 'energy' ? 'kcal' : n.unit;
        document.getElementById(`${n.id}ValDisplay`).textContent = `${inputs[n.id].toFixed(dec)} ${unit}`;
    });

    const res = calculateModelResults(inputs);

    document.getElementById('labPredictedWeight').innerHTML = `${res.predictedWeight.toLocaleString()} <span class="unit">g</span>`;
    document.getElementById('labTargetWeight').innerHTML = `${res.targetWeight.toLocaleString()} <span class="unit">g</span>`;
    document.getElementById('labTargetSub').textContent = `Cobb 2022 · ${SEX_LABELS[inputs.sex]}`;

    const varNumEl = document.getElementById('labVarianceNum');
    varNumEl.innerHTML = `${res.variance >= 0 ? '+' : ''}${res.variance} <span class="unit">g</span>`;
    varNumEl.className = `metric-num ${res.variance >= 0 ? 'variance-up' : 'variance-down'}`;   /* colour set in CSS */

    document.getElementById('labVariancePercent').textContent = `${res.variancePct}% vs 2022 Cobb 500 Standard`;
    document.getElementById('labFCRNum').textContent = res.fcr;
    document.getElementById('labFCRSub').textContent = `Cobb target: ${res.fcrTarget}`;
    document.getElementById('labAgeTag').textContent = `Day ${inputs.age} Growth`;

    updateChickenPhenotype(inputs, res);
    renderLabChart(inputs);
    updateMatrixTable(inputs, res);
    updatePhaseInfo(inputs, res);
    updateDoctorNote(inputs, res);
    updateLiveChip(res);
}


/* ==========================================================================
   6. SCENARIOS AND EVENTS
   ========================================================================== */

/**
 * Sets every nutrient slider to the Cobb target of the current age/market/
 * cereal (midpoint for ranges). Reset button and page start-up use this.
 */
function setRationToCobbTargets() {
    const age = parseInt(document.getElementById('birdAge').value);
    const market = document.getElementById('feedMarket').value;
    const grain = document.getElementById('dietGrain').value;
    const targets = getPhaseTargetNutrients(age, market, grain);
    const levels = {};
    NUTRIENTS.forEach(n => { levels[n.id] = targets[n.id].mid; });
    setNutrientSliders(levels);
}

/** "Reset Standard Rations": Cobb targets for the chosen age, 22 deg C. */
function resetLabParams() {
    setRationToCobbTargets();
    document.getElementById('temperature').value = 22;
    updateLabSimulation();
}

/**
 * "Deficient Scenario": day 21 bird, energy and protein cut as in the original
 * scenario (2700 kcal, 16.5 % CP), amino acids at 78 % of target, minerals at
 * 90 %, vitamins / trace elements at 70 %, and 28 deg C heat.
 */
function loadLowProteinScenario() {
    document.getElementById('birdAge').value = 21;
    setRationToCobbTargets();

    const targets = getPhaseTargetNutrients(21, document.getElementById('feedMarket').value, document.getElementById('dietGrain').value);
    const factorByGroup = { aminoacids: 0.78, minerals: 0.90, fattyacid: 0.90, vitamins: 0.70, traces: 0.70 };
    const levels = {};
    NUTRIENTS.forEach(n => {
        levels[n.id] = targets[n.id].mid * (factorByGroup[n.group] || 1);
    });
    levels.energy = 2700;
    levels.protein = 16.5;

    setNutrientSliders(levels);
    document.getElementById('temperature').value = 28;
    updateLabSimulation();
}

/** Redraw the chart when the window size changes. */
window.addEventListener('resize', () => {
    renderLabChart(readLabInputs());
});

/** Page start-up: build the sliders, load Cobb targets, draw everything. */
window.onload = function() {
    buildNutrientControls();
    resetLabParams();
};


/* ==========================================================================
   7. DR. SYNAPSE  (the scribbled lab-notebook comment)
   All wording is in DOCTOR_LINES. Each entry has a `when` test; the first
   one that returns true wins, so put specific cases at the top. To add a
   new remark, add one line to the list - nothing else needs to change.
   ========================================================================== */
const DOCTOR_LINES = [
    { when: (i, r) => r.tempIndex < 0.93,
      say: 'Sacré bleu, it is HOT in here! Heat is stealing growth - cool the shed, or give the birds electrolytes!' },
    { when: (i, r) => r.coeff < 0.70,
      say: 'Catastrophe! The poor bird is starving for something. Look at the most limiting nutrient below!' },
    { when: (i, r) => r.coeff < MODEL_CONSTANTS.DEFICIENT_COEFF,
      say: 'Hmm... the curve is sagging below Cobb. Somewhere a nutrient is crying out - find it in the matrix!' },
    { when: (i, r) => r.balance.penalty > 0.01,
      say: 'The amino acids are out of tune! Lysine must conduct the whole orchestra - check the ratios.' },
    { when: (i, r) => r.coeff > MODEL_CONSTANTS.HIGH_DENSITY_COEFF,
      say: 'Magnifique! Above the Cobb line! But remember: a model is a dream, only a real trial is the truth.' },
    { when: () => true,
      say: 'Eureka! Right on the Cobb 500 curve. Now touch a slider and watch what mischief you cause...' }
];

/** Writes the first matching Dr. Synapse remark into the speech bubble. */
function updateDoctorNote(inputs, results) {
    const line = DOCTOR_LINES.find(l => l.when(inputs, results));
    document.getElementById('doctorNote').textContent = line.say;
}

/** Updates the small bottom bar shown on phones/tablets (hidden on desktop by CSS). */
function updateLiveChip(results) {
    const sign = results.variance >= 0 ? '+' : '';
    document.getElementById('chipWeight').textContent = `${results.predictedWeight.toLocaleString()} g`;
    const v = document.getElementById('chipVariance');
    v.textContent = `${sign}${results.variance} g (${results.variancePct}%)`;
    v.className = results.variance >= 0 ? 'variance-up' : 'variance-down';
}
