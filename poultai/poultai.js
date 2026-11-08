// Cobb 500 Official 2022 Performance Objectives Standard (As-hatched, Metric)
// Source: Cobb 500 Broiler Performance & Nutrition Supplement (2022)
const cobbStandardMap = {
    1: 42,
    7: 202,
    14: 512,
    21: 1116,
    28: 1782,
    35: 2521,
    42: 3278
};

// 2022 Cobb 500 Phase-Feeding Target Specifications (Grower / Baseline)
// Starter (0-10d): CP 21.5%, Dig Lys 1.22%, Dig Met 0.90%, ME 3000 kcal/kg
// Grower (11-22d): CP 19.5%, Dig Lys 1.10%, Dig Met 0.82%, ME 3050 kcal/kg
// Finisher (23-35d): CP 18.0%, Dig Lys 1.00%, Dig Met 0.76%, ME 3150 kcal/kg
function getCobbTarget(day) {
    if (cobbStandardMap[day]) return cobbStandardMap[day];
    const days = [1, 7, 14, 21, 28, 35, 42];
    for (let i = 0; i < days.length - 1; i++) {
        if (day >= days[i] && day <= days[i+1]) {
            const d1 = days[i], d2 = days[i+1];
            const w1 = cobbStandardMap[d1], w2 = cobbStandardMap[d2];
            return Math.round(w1 + ((day - d1) / (d2 - d1)) * (w2 - w1));
        }
    }
    return 1116;
}

function getPhaseTargetNutrients(day) {
    if (day <= 10) {
        return { energy: 3000, protein: 21.5, lysine: 1.22, methionine: 0.90 };
    } else if (day <= 22) {
        return { energy: 3050, protein: 19.5, lysine: 1.10, methionine: 0.82 };
    } else {
        return { energy: 3150, protein: 18.0, lysine: 1.00, methionine: 0.76 };
    }
}

function readLabInputs() {
    return {
        age: parseInt(document.getElementById('birdAge').value),
        energy: parseFloat(document.getElementById('energy').value),
        protein: parseFloat(document.getElementById('protein').value),
        lysine: parseFloat(document.getElementById('lysine').value),
        methionine: parseFloat(document.getElementById('methionine').value),
        temp: parseFloat(document.getElementById('temperature').value)
    };
}

function calculateModelResults(inputs) {
    const targetWeight = getCobbTarget(inputs.age);
    const phaseTargets = getPhaseTargetNutrients(inputs.age);

    const energyRatio = inputs.energy / phaseTargets.energy;
    const proteinRatio = inputs.protein / phaseTargets.protein;
    const lysineRatio = inputs.lysine / phaseTargets.lysine;
    const metRatio = inputs.methionine / phaseTargets.methionine;

    let tempIndex = 1.0;
    if (inputs.temp > 25) {
        tempIndex = 1.0 - ((inputs.temp - 25) * 0.018);
    }

    const performanceCoeff = (
        (energyRatio * 0.35) + 
        (proteinRatio * 0.28) + 
        (lysineRatio * 0.22) + 
        (metRatio * 0.15)
    ) * tempIndex;

    const predictedWeight = Math.round(targetWeight * performanceCoeff);
    const variance = predictedWeight - targetWeight;
    const variancePct = ((variance / targetWeight) * 100).toFixed(1);

    // 2022 Cobb 500 Feed Conversion Ratio estimation
    const fcr = (1.18 * (targetWeight / (predictedWeight || 1))).toFixed(2);

    return {
        predictedWeight,
        targetWeight,
        variance,
        variancePct,
        fcr,
        coeff: performanceCoeff,
        phaseTargets
    };
}

function updateChickenPhenotype(inputs, results) {
    const wrapper = document.getElementById('chickenAvatarWrapper');
    const morphBadge = document.getElementById('morphBadge');
    const relativeMassPercent = document.getElementById('relativeMassPercent');
    const physicalScaleTag = document.getElementById('physicalScaleTag');

    const bodyPath = document.getElementById('chickBody');
    const combPath = document.getElementById('chickComb');

    const ageScale = 0.45 + (inputs.age / 42) * 0.75;
    const nutrientScale = Math.min(1.25, Math.max(0.7, results.coeff));
    const totalScale = (ageScale * nutrientScale).toFixed(2);

    wrapper.style.transform = `scale(${totalScale})`;

    const massPct = Math.round(results.coeff * 100);
    relativeMassPercent.textContent = `${massPct}%`;
    physicalScaleTag.textContent = `${totalScale}x`;

    if (results.coeff < 0.85) {
        morphBadge.textContent = "Deficient Rations (Sub-Optimal)";
        morphBadge.style.color = "#ef4444";
        morphBadge.style.borderColor = "#ef4444";
        bodyPath.setAttribute('stroke', '#ef4444');
        combPath.setAttribute('fill', '#f87171');
    } else if (results.coeff > 1.08) {
        morphBadge.textContent = "High-Density Feed Performance";
        morphBadge.style.color = "#f59e0b";
        morphBadge.style.borderColor = "#f59e0b";
        bodyPath.setAttribute('stroke', '#f59e0b');
        combPath.setAttribute('fill', '#dc2626');
    } else {
        morphBadge.textContent = "Optimal Cobb 500 Phenotype";
        morphBadge.style.color = "#00f0ff";
        morphBadge.style.borderColor = "#00f0ff";
        bodyPath.setAttribute('stroke', '#10b981');
        combPath.setAttribute('fill', '#ef4444');
    }
}

function renderLabChart(inputs) {
    const stage = document.getElementById('labChartStage');
    const width = stage.clientWidth || 550;
    const height = stage.clientHeight || 250;
    const padding = 40;

    const dataPoints = [];
    for (let day = 1; day <= 42; day += 2) {
        const subInputs = { ...inputs, age: day };
        const res = calculateModelResults(subInputs);
        dataPoints.push({ day, predicted: res.predictedWeight, target: res.targetWeight });
    }

    const maxX = 42;
    const maxY = 3600;

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

    let grid = '';
    for (let w = 500; w <= 3500; w += 500) {
        const y = getY(w);
        grid += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#1f2d3d" stroke-width="1"/>
                 <text x="${padding - 6}" y="${y + 4}" font-size="9" fill="#64748b" text-anchor="end" font-family="Chakra Petch">${w}g</text>`;
    }

    for (let d = 7; d <= 42; d += 7) {
        const x = getX(d);
        grid += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="#1f2d3d" stroke-width="1"/>
                 <text x="${x}" y="${height - padding + 15}" font-size="9" fill="#64748b" text-anchor="middle" font-family="Chakra Petch">D${d}</text>`;
    }

    const activeRes = calculateModelResults(inputs);
    const highlightX = getX(inputs.age);
    const highlightY = getY(activeRes.predictedWeight);

    const svg = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
            ${grid}
            <!-- Reference 2022 Cobb 500 Curve -->
            <path d="${refD}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
            <!-- Predicted Dynamic Curve -->
            <path d="${curD}" fill="none" stroke="#00f0ff" stroke-width="3" filter="drop-shadow(0 0 6px rgba(0,240,255,0.4))"/>
            <!-- Active Node Dot -->
            <circle cx="${highlightX}" cy="${highlightY}" r="6" fill="#00f0ff" stroke="#fff" stroke-width="2"/>
        </svg>
    `;

    stage.innerHTML = svg;
}

function updateMatrixTable(inputs, results) {
    const tbody = document.getElementById('labMatrixBody');
    const target = results.phaseTargets;
    const items = [
        { name: 'Metabolizable Energy', val: `${inputs.energy} kcal/kg`, target: `${target.energy} kcal/kg`, std: inputs.energy >= target.energy ? 'optimal' : 'deficient' },
        { name: 'Crude Protein', val: `${inputs.protein}%`, target: `${target.protein}%`, std: inputs.protein >= target.protein ? 'optimal' : 'deficient' },
        { name: 'Digestible Lysine', val: `${inputs.lysine}%`, target: `${target.lysine}%`, std: inputs.lysine >= target.lysine ? 'optimal' : 'deficient' },
        { name: 'Dig. Methionine + Cys', val: `${inputs.methionine}%`, target: `${target.methionine}%`, std: inputs.methionine >= target.methionine ? 'optimal' : 'deficient' }
    ];

    tbody.innerHTML = items.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td style="color: var(--primary-teal); font-family: var(--font-lab);">${i.val}</td>
            <td style="color: var(--text-secondary);">${i.target}</td>
            <td><span class="status-badge ${i.std}">${i.std.toUpperCase()}</span></td>
        </tr>
    `).join('');
}

function updateLabSimulation() {
    const inputs = readLabInputs();
    
    document.getElementById('ageValDisplay').textContent = `${inputs.age} Days`;
    document.getElementById('energyValDisplay').textContent = `${inputs.energy} kcal`;
    document.getElementById('proteinValDisplay').textContent = `${inputs.protein}%`;
    document.getElementById('lysineValDisplay').textContent = `${inputs.lysine}%`;
    document.getElementById('methionineValDisplay').textContent = `${inputs.methionine}%`;
    document.getElementById('tempValDisplay').textContent = `${inputs.temp}°C`;

    const res = calculateModelResults(inputs);

    document.getElementById('labPredictedWeight').innerHTML = `${res.predictedWeight.toLocaleString()} <span class="unit">g</span>`;
    document.getElementById('labTargetWeight').innerHTML = `${res.targetWeight.toLocaleString()} <span class="unit">g</span>`;
    
    const varNumEl = document.getElementById('labVarianceNum');
    varNumEl.innerHTML = `${res.variance >= 0 ? '+' : ''}${res.variance} <span class="unit">g</span>`;
    varNumEl.style.color = res.variance >= 0 ? 'var(--emerald-accent)' : 'var(--danger-red)';

    document.getElementById('labVariancePercent').textContent = `${res.variancePct}% vs 2022 Cobb 500 Standard`;
    document.getElementById('labFCRNum').textContent = res.fcr;
    document.getElementById('labAgeTag').textContent = `Day ${inputs.age} Growth`;

    updateChickenPhenotype(inputs, res);
    renderLabChart(inputs);
    updateMatrixTable(inputs, res);
}

function resetLabParams() {
    document.getElementById('birdAge').value = 21;
    document.getElementById('energy').value = 3050;
    document.getElementById('protein').value = 19.5;
    document.getElementById('lysine').value = 1.10;
    document.getElementById('methionine').value = 0.82;
    document.getElementById('temperature').value = 22;
    updateLabSimulation();
}

function loadLowProteinScenario() {
    document.getElementById('birdAge').value = 21;
    document.getElementById('energy').value = 2700;
    document.getElementById('protein').value = 16.5;
    document.getElementById('lysine').value = 0.85;
    document.getElementById('methionine').value = 0.60;
    document.getElementById('temperature').value = 28;
    updateLabSimulation();
}

window.addEventListener('resize', () => {
    renderLabChart(readLabInputs());
});

window.onload = function() {
    updateLabSimulation();
};
