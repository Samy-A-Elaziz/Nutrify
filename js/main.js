/* ==========================================================================
   NUTRIFY MAIN SITE SCRIPT
   --------------------------------------------------------------------------
   FILE MAP
     1. Small helpers ............ escaping text, building filter chips
     2. Tab navigation ........... #home / #founders / #tips / #papers ...
     3. Mobile menu .............. hamburger open / close behaviour
     4. Tips + Papers renderers .. build cards from js/content.js
     5. Start-up
   To ADD a tip or a paper, edit js/content.js (not this file).
   ========================================================================== */


/* ==========================================================================
   1. SMALL HELPERS
   ========================================================================== */

/** Makes text safe to place inside HTML (all list text goes through this). */
function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

/**
 * Builds a row of filter chips ("All" + one per category) and calls
 * onPick(category) when one is pressed.  category === 'All' means no filter.
 */
function buildChips(container, categories, onPick) {
    const names = ['All', ...categories];
    container.innerHTML = names.map((name, i) =>
        `<button type="button" class="chip${i === 0 ? ' active' : ''}" data-cat="${esc(name)}" aria-pressed="${i === 0}">${esc(name)}</button>`
    ).join('');

    container.addEventListener('click', event => {
        const chip = event.target.closest('.chip');
        if (!chip) return;
        container.querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', c === chip);
            c.setAttribute('aria-pressed', c === chip);
        });
        onPick(chip.dataset.cat);
    });
}

/** Unique values of one field, in the order they first appear. */
function uniqueValues(list, field) {
    return [...new Set(list.map(item => item[field]))];
}


/* ==========================================================================
   2. TAB NAVIGATION
   Every section on the page has id="view-NAME". A link with href="#NAME"
   (or the page address ending in #NAME) shows that section.
   ========================================================================== */

/** Shows one view and highlights its menu link. Unknown names fall back to home. */
function navigateTo(viewId) {
    if (!document.getElementById(`view-${viewId}`)) viewId = 'home';

    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    document.getElementById(`view-${viewId}`).classList.add('active');
    const navLink = document.getElementById(`nav-${viewId}`);
    if (navLink) navLink.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileMenu();
}

/** Reads the #name part of the address bar and shows that view. */
function showViewFromHash() {
    navigateTo(window.location.hash.replace('#', '') || 'home');
}


/* ==========================================================================
   3. MOBILE MENU
   ========================================================================== */
const menuButton = document.getElementById('mobileMenuBtn');
const menuList = document.getElementById('navLinks');

function openMobileMenu() {
    menuList.classList.add('show');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.innerHTML = '&#10005;';                 /* X icon */
}

function closeMobileMenu() {
    menuList.classList.remove('show');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '&#9776;';                  /* hamburger icon */
}

menuButton.addEventListener('click', () => {
    menuList.classList.contains('show') ? closeMobileMenu() : openMobileMenu();
});

/* tapping anywhere outside the menu, or pressing Escape, closes it */
document.addEventListener('click', event => {
    if (!event.target.closest('.nav-container')) closeMobileMenu();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobileMenu();
});

/* leaving the phone layout (rotating, resizing) must not leave the menu stuck open */
window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMobileMenu();
});


/* ==========================================================================
   4. TIPS AND PAPERS RENDERERS  (data comes from js/content.js)
   ========================================================================== */

/** HTML of one tip card. */
function tipCardHTML(tip) {
    return `
        <article class="card tip-card" data-cat="${esc(tip.category)}">
            <div class="tip-icon" aria-hidden="true">${esc(tip.icon)}</div>
            <span class="badge">${esc(tip.category)}</span>
            <h3 class="card-title">${esc(tip.title)}</h3>
            <p class="card-text">${esc(tip.text)}</p>
            <p class="tip-basis">Basis: ${esc(tip.basis)}</p>
        </article>`;
}

/** Fills the Tips tab and wires its filter chips. */
function renderTips() {
    const grid = document.getElementById('tipsGrid');
    const filters = document.getElementById('tipsFilters');
    if (!grid || typeof TIPS === 'undefined') return;

    const draw = category => {
        const shown = TIPS.filter(t => category === 'All' || t.category === category);
        grid.innerHTML = shown.map(tipCardHTML).join('') || '<p class="empty-note">No tips here yet.</p>';
    };
    buildChips(filters, uniqueValues(TIPS, 'category'), draw);
    draw('All');
}

/** Plain-text citation used by the "Copy citation" button. */
function citationText(paper) {
    const doi = paper.doi ? ` https://doi.org/${paper.doi}` : '';
    return `${paper.authors}. ${paper.title}. ${paper.source}.${doi}`;
}

/** HTML of one paper card (summary bullets, takeaway, caution, links). */
function paperCardHTML(paper) {
    const bullets = paper.brief.map(b => `<li>${esc(b)}</li>`).join('');
    const extra = (paper.extraLinks || [])
        .map(l => `<a class="btn btn-outline btn-sm" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`)
        .join('');
    const caution = paper.caution
        ? `<p class="paper-caution"><strong>Keep in mind:</strong> ${esc(paper.caution)}</p>` : '';

    return `
        <article class="reference-card paper-card" data-cat="${esc(paper.topic)}" id="paper-${esc(paper.id)}">
            <span class="badge">${esc(paper.tag)}</span>
            <span class="badge badge-topic">${esc(paper.topic)}</span>
            <h3 class="reference-title">${esc(paper.title)}</h3>
            <div class="reference-meta">${esc(paper.authors)} &middot; ${esc(paper.source)}${paper.doi ? ` &middot; DOI ${esc(paper.doi)}` : ''}</div>

            <h4 class="paper-subhead">Quick brief</h4>
            <ul class="paper-bullets">${bullets}</ul>

            <p class="paper-takeaway"><strong>Why it matters for NUTRIFY:</strong> ${esc(paper.takeaway)}</p>
            ${caution}

            <div class="paper-actions">
                <a class="btn btn-primary btn-sm" href="${esc(paper.url)}" target="_blank" rel="noopener noreferrer">Open original source &rarr;</a>
                ${extra}
                <button type="button" class="btn btn-outline btn-sm copy-citation" data-id="${esc(paper.id)}">Copy citation</button>
            </div>
            ${paper.verified ? `<p class="paper-verified">Source check: ${esc(paper.verified)}</p>` : ''}
        </article>`;
}

/** Fills the Papers tab, wires filter chips and the copy-citation buttons. */
function renderPapers() {
    const list = document.getElementById('papersList');
    const filters = document.getElementById('papersFilters');
    if (!list || typeof PAPERS === 'undefined') return;

    const draw = topic => {
        const shown = PAPERS.filter(p => topic === 'All' || p.topic === topic);
        list.innerHTML = shown.map(paperCardHTML).join('') || '<p class="empty-note">No papers here yet.</p>';
    };
    buildChips(filters, uniqueValues(PAPERS, 'topic'), draw);
    draw('All');

    /* one listener handles every copy button, even after re-drawing */
    list.addEventListener('click', event => {
        const btn = event.target.closest('.copy-citation');
        if (!btn) return;
        const paper = PAPERS.find(p => p.id === btn.dataset.id);
        navigator.clipboard.writeText(citationText(paper)).then(() => {
            const old = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = old; }, 1600);
        }).catch(() => { window.prompt('Copy this citation:', citationText(paper)); });
    });
}


/* ==========================================================================
   5. START-UP
   ========================================================================== */
document.getElementById('currentYear').textContent = new Date().getFullYear();
renderTips();
renderPapers();
window.addEventListener('hashchange', showViewFromHash);
showViewFromHash();
