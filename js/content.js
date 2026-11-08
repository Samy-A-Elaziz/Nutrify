/* ==========================================================================
   NUTRIFY CONTENT LISTS  (edit THIS file to add tips and papers)
   --------------------------------------------------------------------------
   js/main.js turns every entry below into a styled card automatically, using
   the shared CSS classes (.card, .paper-card, .tip-card, .badge, .btn ...).
   You never touch HTML or CSS to add content - copy a block, change the text,
   save. Leave a field as "" if you do not know it, and NEVER add a source you
   have not verified.
   ========================================================================== */


/* ==========================================================================
   1. PAPERS
   One block per paper. Fields:
     id        short unique word (used for the "read more" toggle)
     tag       small label above the title, e.g. "Peer-reviewed article"
     topic     filter chip on the page, e.g. "Heat stress" (same spelling = same chip)
     title     full official title
     authors   as printed in the journal
     source    journal / publisher, volume, year
     doi       DOI only, e.g. "10.26873/SVR-750-2019" ("" if none)
     url       main link (ResearchGate, publisher, PubMed ...)
     extraLinks optional list of { label, url } for more official copies
     brief     3-5 short sentences IN OUR OWN WORDS, one string per bullet
     takeaway  one sentence: what it means for NUTRIFY / PoultSynapse
     caution   optional limits of the study ("" to hide)
     verified  where the facts of the brief were checked
   ========================================================================== */
const PAPERS = [
    {
        id: "shewita-2019-vitc",
        tag: "Peer-reviewed article",
        topic: "Heat shock & stocking density",
        title: "Influence of dietary vitamin C supplementation on growth performance, blood biochemical parameters and transcript levels of heat shock proteins in high stocking density reared broiler chickens",
        authors: "Ramadan S. Shewita, Karima El-Naggar, Walaa S. Abd El Naby",
        source: "Slovenian Veterinary Research, vol. 56 (Suppl. 22), March 2019",
        doi: "10.26873/SVR-750-2019",
        url: "https://www.researchgate.net/publication/333582345_INFLUENCE_OF_DIETARY_VITAMIN_C_SUPPLEMENTATION_ON_GROWTH_PERFORMANCE_BLOOD_BIOCHEMICAL_PARAMETERS_AND_TRANSCRIPT_LEVELS_OF_HEAT_SHOCK_PROTEINS_IN_HIGH_STOCKING_DENSITY_REARED_BROILER_CHICKENS",
        extraLinks: [
            { label: "DOAJ record (abstract)", url: "https://doaj.org/article/55da80f4c4fe4ce8a48bcda398b52643" },
            { label: "DOI link", url: "https://doi.org/10.26873/SVR-750-2019" }
        ],
        brief: [
            "Question: can vitamin C (VC) in the feed protect broilers that are crowded into too little space?",
            "Design: 150 mixed-sex Cobb 500 chicks, five equal groups. One control group lived at a normal density (10.6 birds/m²) on a basal diet without VC; four groups lived at high density (15.6 birds/m²) and received 0, 200, 400 or 600 mg VC per kg of diet.",
            "Crowding hurt: high-density birds ended lighter, ate less feed in total and had 6.6 % mortality. Heat shock protein genes were switched on more strongly (HSP70 up; HSP90 and HSF1 raised in heart and liver), a sign of cellular stress.",
            "Vitamin C helped in steps: it improved final weight and total feed intake, lowered mortality and turned down liver HSP70 expression.",
            "Best result: the group given 200 mg VC/kg (group 3) performed best, so more VC was not better."
        ],
        takeaway: "Space and stress change what a flock can reach, which is why PoultSynapse lists stocking density and heat as real-life factors next to the Cobb nutrient targets. The paper supports vitamin C as a possible stress-support nutrient, not as a replacement for good housing.",
        caution: "A small experiment (150 birds). Another trial with Ross 308 broilers (Yu et al., 2021, J. Anim. Sci. Technol.) found little benefit from 200 mg/kg vitamin C at high density, so results may depend on strain, age and conditions.",
        verified: "Bibliographic data and abstract checked on the DOAJ record of the article."
    },
    {
        id: "bmc-vet-res-2024-sodium-butyrate",
        tag: "Peer-reviewed article",
        topic: "Intestinal morphology & antimicrobial peptides",
        title: "Analyzing the morphology and avian β-defensins genes (AvβD) expression in the small intestine of Cobb500 broiler chicks fed with sodium butyrate",
        authors: "BMC Veterinary Research authors",
        source: "BMC Veterinary Research, vol. 20, article 434, September 2024",
        doi: "10.1186/s12917-024-04253-y",
        url: "https://pubmed.ncbi.nlm.nih.gov/39342153/",
        extraLinks: [
            { label: "PubMed Central record", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11438398/" },
            { label: "DOI link", url: "https://doi.org/10.1186/s12917-024-04253-y" }
        ],
        brief: [
            "Question: can dietary sodium butyrate supplementation improve growth, modify intestinal villi morphology, and stimulate innate immune gene expression in Cobb 500 broilers?",
            "Design: Cobb 500 broiler chicks were fed diets supplemented with sodium butyrate, after which researchers analyzed growth parameters, small intestine histological structures, and expression levels of avian beta-defensin genes (AvBD).",
            "Morphological changes: Sodium butyrate significantly enhanced small intestine parameters and modified the morphology of intestinal villi for better nutrient absorption.",
            "Gene expression: Enhanced expression levels of antimicrobial peptide genes (AvBD 1, 2, and 12 in the duodenum, and AvBD 10 in the jejunum) were observed.",
            "Conclusion: Sodium butyrate acts as an effective gut health additive that enhances growth performance, improves mucosal architecture, and boosts the humoral component of innate immunity."
        ],
        takeaway: "Organic acid supplements such as sodium butyrate provide a dual benefit in broiler production by optimizing gut morphometry and strengthening the intestinal innate immune defense via beta-defensin upregulation.",
        caution: "Efficacy can depend on inclusion dosage, encapsulation method of the organic acid, and basal diet composition.",
        verified: "Bibliographic data and abstract cross-checked with PubMed and BMC Veterinary Research repository."
    },
    {
        id: "abdel-moneim-2017-flock-size",
        tag: "Peer-reviewed article",
        topic: "Flock size, productive & economic efficiency",
        title: "Effect of flock size on the productive and economic efficiency of Ross 308 and Cobb 500 broilers",
        authors: "A. E. Abdel-Moneim, et al.",
        source: "ResearchGate / Scientific Publication, March 2017",
        doi: "10.13140/RG.2.2.35338.47040",
        url: "https://www.researchgate.net/publication/314403166_Effect_of_flock_size_on_the_productive_and_economic_efficiency_of_Ross_308_and_Cobb_500_broilers",
        extraLinks: [
            { label: "ResearchGate record", url: "https://www.researchgate.net/publication/314403166_Effect_of_flock_size_on_the_productive_and_economic_efficiency_of_Ross_308_and_Cobb_500_broilers" }
        ],
        brief: [
            "Question: how do different flock sizes (small, medium, large) impact the growth performance, feed efficiency, mortality, and economic profitability of Ross 308 and Cobb 500 broiler chickens?",
            "Design: Comparative trial assessing Ross 308 and Cobb 500 breeds raised across small, medium, and large flock size categories, evaluating total feed intake, FCR, mortality, total returns, and net profit.",
            "Breed differences: Cobb broilers achieved significantly higher overall body weight gain compared to Ross broilers, though overall feed intake, FCR, and mortality showed no statistically significant difference between the two breeds.",
            "Flock size impact: Small flocks exhibited higher starter/total feed intake, higher FCR, and elevated mortality percentages alongside higher feed costs per bird.",
            "Economic findings: Medium and large flock sizes yielded significantly higher net profits (with Cobb broilers in medium/large groups reaching peak profitability) compared to small-scale housing."
        ],
        takeaway: "Scale matters in broiler economics: while small flocks incur higher relative feed costs and mortality, medium and large flock management significantly improves net profit margins for commercial strains like Cobb 500 and Ross 308.",
        caution: "Economic returns can vary heavily depending on local feed pricing fluctuations and regional market dynamics at time of marketing.",
        verified: "Bibliographic data and abstract verified from published study records."
    },
    {
        id: "bezahegn-2026-cinnamon-fennel",
        tag: "Peer-reviewed article",
        topic: "Natural feed additives & growth performance",
        title: "Growth Performance and Carcass Traits of Cobb 500 Broiler Chickens Fed With Different Levels of Cinnamon (Cinnamomum cassia) and Fennel (Foeniculum vulgare Mill.) Powders as Natural Feed Additives",
        authors: "Abebe Bezahegn, Berhan Tamir, Gezahegne Mamo",
        source: "Scientifica, vol. 2026, Article ID 9456440, April 2026",
        doi: "10.1155/sci5/9456440",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13107260/",
        extraLinks: [
            { label: "PubMed Central record", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13107260/" },
            { label: "DOI link", url: "https://doi.org/10.1155/sci5/9456440" }
        ],
        brief: [
            "Question: can dietary inclusion of cinnamon bark powder (CNBP) and fennel seed powder (FNSP) serve as effective natural growth promoters (antibiotic alternatives) in broiler chickens?",
            "Design: 210 day-old Cobb 500 chicks randomly assigned to five groups with three replicates of 14 chicks each. Control (T1) received a standard diet with no additives; T2 and T3 received standard diet + 0.75% or 1.75% FNSP; T4 and T5 received standard diet + 0.75% or 1.75% CNBP for 49 days.",
            "Performance findings: Broilers fed 1.75% CNBP achieved significantly higher final body weight gain (3243 g), better daily weight gain (70.88 g), and an improved feed conversion ratio (1.44) compared to the control group.",
            "Carcass traits: Significantly higher dressed weight, eviscerated weight, and primal cuts (breast, thigh, and whole leg) were observed in the 1.75% CNBP group, and higher breast weight in the 1.75% FNSP group relative to the control.",
            "Conclusion: Incorporation of cinnamon bark powder at 1.75% significantly improved overall growth performance and carcass characteristics in broiler chickens."
        ],
        takeaway: "Phytogenic feed additives like cinnamon bark powder offer a viable organic strategy to enhance broiler growth performance and carcass yields without relying on synthetic antibiotics.",
        caution: "Results apply to specific inclusion thresholds (1.75% optimal for cinnamon under these trial conditions); higher or lower doses in different strains or environmental settings may vary.",
        verified: "Bibliographic data and abstract checked against the PubMed Central Open Access record."
    }
    /* ---- add the next paper here: type a comma after the closing brace above, then paste a new block ---- */
];


/* ==========================================================================
   2. TIPS
   One block per tip. Fields:
     category  group name shown as a filter chip (same spelling = same chip)
     icon      one emoji
     title     short headline
     text      1-3 sentences, plain language
     basis     where it comes from: "Cobb 2022", "NUTRIFY model note", a paper...
                (keep it honest - say "general practice" if it is common advice)
   ========================================================================== */
const TIPS = [
    /* ---------- Using the labs ---------- */
    { category: "Using the labs", icon: "🎚️", title: "Start from the Cobb targets",
      text: "Press “Reset Standard Rations” first. The sliders jump to the Cobb target for the chosen age, so every change you make afterwards is easy to read as a difference.",
      basis: "How PoultAI and PoultSynapse work" },
    { category: "Using the labs", icon: "🔬", title: "Change one factor at a time",
      text: "Move a single slider, watch the predicted weight, then move it back. Moving several at once hides which nutrient caused the change.",
      basis: "Basic experimental method" },
    { category: "Using the labs", icon: "📉", title: "Read the Matrix, not only the weight",
      text: "In PoultSynapse the Ration Dynamics Matrix names the most limiting nutrient. That is usually the first thing a formulator would fix.",
      basis: "PoultSynapse model" },
    { category: "Using the labs", icon: "⚠️", title: "A prediction is a hypothesis",
      text: "Cobb publishes requirements, not response curves. The size of each penalty is our modelling assumption, so treat results as a way to think, not as a guarantee.",
      basis: "NUTRIFY model note" },

    /* ---------- Feeding ---------- */
    { category: "Feeding", icon: "🌽", title: "Match the ration to the phase",
      text: "Energy, protein and amino acid targets fall as the bird grows (Starter, Grower, Finisher). Feeding a Starter ration late, or a Finisher ration early, moves the bird away from its target.",
      basis: "Cobb 500 Supplement, 2022" },
    { category: "Feeding", icon: "🧪", title: "Lysine leads, the others follow",
      text: "Cobb sets the other digestible amino acids as a percentage of lysine (the ideal-protein profile). Raising lysine alone leaves the others short, so the balance penalty in PoultSynapse grows.",
      basis: "Cobb 500 Supplement, 2022" },
    { category: "Feeding", icon: "🌾", title: "Wheat diets need more biotin",
      text: "The Cobb vitamin premix table gives a higher biotin target for wheat-based diets than for maize-based diets. PoultSynapse switches the target when you change the cereal base.",
      basis: "Cobb 500 Supplement, 2022" },
    { category: "Feeding", icon: "🥣", title: "Feed form matters",
      text: "Cobb lists crumble for the starter phase and pellets afterwards. Good pellet quality helps birds eat what the formulation intended.",
      basis: "Cobb 500 Supplement, 2022" },

    /* ---------- Heat & housing ---------- */
    { category: "Heat & housing", icon: "🌡️", title: "Heat steals growth before it shows",
      text: "Our model removes 1.8 % of performance per °C above 25 °C. The exact number is an assumption, but the direction is real: hot birds eat less and grow slower.",
      basis: "NUTRIFY model note" },
    { category: "Heat & housing", icon: "🐔", title: "Crowding is a stressor too",
      text: "In a Cobb 500 trial, birds at 15.6 birds/m² ended lighter, ate less and showed more heat shock protein activity than birds at 10.6 birds/m².",
      basis: "Shewita et al., 2019 (see Papers)" },
    { category: "Heat & housing", icon: "💨", title: "Ventilation protects the ration",
      text: "Good ventilation removes moisture and ammonia. A perfect formulation cannot make up for wet litter and poor air.",
      basis: "General husbandry practice" },
    { category: "Heat & housing", icon: "💧", title: "Water first, always",
      text: "Birds drink about twice as much water as they eat feed by weight, and more in heat. Check drinker flow and cleanliness every day.",
      basis: "General husbandry practice" },

    /* ---------- Research habits ---------- */
    { category: "Research habits", icon: "📚", title: "Write the source next to every number",
      text: "When you add a nutrient target or a paper, note where it came from. Future you (and your supervisor) will be grateful.",
      basis: "NUTRIFY scientific integrity statement" },
    { category: "Research habits", icon: "🧮", title: "Calibrate with real data",
      text: "If you collect weights from a real flock, compare them with the prediction and adjust the group weights and sensitivities in the model constants.",
      basis: "NUTRIFY model note" }
    /* ---- add the next tip here (remember the comma after the previous block) ---- */
];
