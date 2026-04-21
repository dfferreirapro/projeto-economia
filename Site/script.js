/* ============================================================
   EduMetrics Dashboard — Script
   ============================================================ */

'use strict';

(function () {

    // ── State ──────────────────────────────────────────────────
    let allData = [];
    let filtered = [];
    let sortCol = 'ranking';
    let sortDir = 'asc';

    // ── Chart instances ────────────────────────────────────────
    const charts = {};

    // ── Colour palette (consistent, dark-theme friendly) ──────
    const PALETTE = [
        'rgba(110,231,183,.75)',
        'rgba(147,197,253,.75)',
        'rgba(252,211,77,.75)',
        'rgba(249,168,212,.75)',
        'rgba(167,139,250,.75)',
        'rgba(251,146,60,.75)',
        'rgba(94,234,212,.75)',
        'rgba(253,186,116,.75)',
    ];

    const BORDER_PALETTE = PALETTE.map(c => c.replace('.75', '1'));

    Chart.defaults.color = '#7a8099';
    Chart.defaults.borderColor = '#242836';
    Chart.defaults.font.family = "'DM Sans', sans-serif";

    // ── Infrastructure labels ──────────────────────────────────
    const INFRA_KEYS = [
        { key: 'biblioteca',    label: '📚 Biblioteca' },
        { key: 'lab_ciencias',  label: '🔬 Lab. Ciências' },
        { key: 'lab_info',      label: '💻 Lab. Info' },
        { key: 'internet',      label: '🌐 Internet' },
        { key: 'wifi',          label: '📶 Wi-Fi' },
        { key: 'quadra',        label: '🏀 Quadra' },
        { key: 'refeitorio',    label: '🍽️ Refeitório' },
        { key: 'acessibilidade',label: '♿ Acessibilidade' },
    ];

    // ── DOM refs ───────────────────────────────────────────────
    const $ = id => document.getElementById(id);
    const cityFilter    = $('cityFilter');
    const typeFilter    = $('typeFilter');
    const networkFilter = $('networkFilter');
    const searchInput   = $('searchInput');
    const sortSelect    = $('sortSelect');
    const tableBody     = $('tableBody');
    const toast         = $('toast');
    const menuToggle    = $('menuToggle');
    const sidebar       = document.querySelector('.sidebar');

    // ── Bootstrap ─────────────────────────────────────────────
    fetch('base_escolas.json')
        .then(r => { if (!r.ok) throw new Error('Fetch error'); return r.json(); })
        .then(data => {
            allData = data;
            filtered = [...allData];
            initFilters();
            applyFilters();
            showToast(`${data.length} escolas carregadas ✓`);
        })
        .catch(() => {
            showToast('Erro ao carregar dados.', true);
        });

    // ── Sidebar mobile toggle ──────────────────────────────────
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('open');
        }
    });

    // ── Nav tabs ───────────────────────────────────────────────
    const ALL_SECTIONS = ['kpi-grid','infra-section','view-charts','view-table','view-compare'];

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const view = link.dataset.view;
            const sections = {
                overview: ['kpi-grid', 'infra-section'],
                charts:   ['view-charts'],
                table:    ['view-table'],
                compare:  ['view-compare'],
            };
            ALL_SECTIONS.forEach(id => {
                const el = $(id);
                if (el) el.style.display = 'none';
            });
            (sections[view] || ALL_SECTIONS).forEach(id => {
                const el = $(id);
                if (el) el.style.display = '';
            });
            // Render compare when switching to it
            if (view === 'compare') renderCompare();
        });
    });

    // ── Filters ────────────────────────────────────────────────
    function initFilters() {
        const uniq = (key) => [...new Set(allData.map(s => s[key]))].sort();

        uniq('cidade').forEach(v => cityFilter.appendChild(opt(v)));
        uniq('tipo').forEach(v => typeFilter.appendChild(opt(v)));
        uniq('rede').forEach(v => networkFilter.appendChild(opt(v)));

        // Populate compare dropdowns
        const cities = uniq('cidade');
        ['compareCity1','compareCity2','compareCity3'].forEach(id => {
            const sel = $(id);
            cities.forEach(c => sel.appendChild(opt(c)));
        });

        // Pre-select Sorocaba and Votorantim as defaults
        if ($('compareCity1')) $('compareCity1').value = cities.find(c => c === 'Sorocaba') || cities[0] || '';
        if ($('compareCity2')) $('compareCity2').value = cities.find(c => c === 'Votorantim') || cities[1] || '';

        ['compareCity1','compareCity2','compareCity3'].forEach(id => {
            $(id)?.addEventListener('change', renderCompare);
        });
    }

    function opt(val) {
        const o = document.createElement('option');
        o.value = o.textContent = val;
        return o;
    }

    function applyFilters() {
        const city    = cityFilter.value;
        const type    = typeFilter.value;
        const network = networkFilter.value;
        const search  = searchInput.value.trim().toLowerCase();

        filtered = allData.filter(s =>
            (!city    || s.cidade === city) &&
            (!type    || s.tipo   === type) &&
            (!network || s.rede   === network) &&
            (!search  || s.escola.toLowerCase().includes(search))
        );

        sortFiltered();
        render();
    }

    function sortFiltered() {
        filtered.sort((a, b) => {
            let av = a[sortCol], bv = b[sortCol];
            if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
            return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });
    }

    // ── Clear filters ──────────────────────────────────────────
    $('clearFilters').addEventListener('click', () => {
        cityFilter.value = typeFilter.value = networkFilter.value = '';
        searchInput.value = '';
        applyFilters();
    });

    // ── Event listeners ────────────────────────────────────────
    [cityFilter, typeFilter, networkFilter].forEach(el =>
        el.addEventListener('change', applyFilters));
    searchInput.addEventListener('input', debounce(applyFilters, 200));
    sortSelect.addEventListener('change', () => {
        sortCol = sortSelect.value;
        sortDir = 'asc';
        sortFiltered();
        renderTable();
    });

    // ── Column header sort ─────────────────────────────────────
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            document.querySelectorAll('th.sortable').forEach(t => t.classList.remove('asc','desc'));
            th.classList.add(sortDir);
            sortSelect.value = col;
            sortFiltered();
            renderTable();
        });
    });

    // ── Render all ─────────────────────────────────────────────
    function render() {
        renderKPIs();
        renderInfra();
        renderCharts();
        renderTable();
        $('schoolCount').textContent = `${filtered.length} escola${filtered.length !== 1 ? 's' : ''}`;
        $('resultCount').textContent = `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`;
    }

    // ── KPIs ───────────────────────────────────────────────────
    function renderKPIs() {
        const n = filtered.length;
        if (!n) {
            ['idebAverage','saebAverage','approvalAverage','totalStudents','totalTeachers','avgClassSize']
                .forEach(id => $(id).textContent = '—');
            return;
        }

        const avg = key => filtered.reduce((s,x) => s + (x[key]||0), 0) / n;

        const ideb = avg('ideb').toFixed(2);
        const saeb = ((avg('saeb_lp') + avg('saeb_mat')) / 2).toFixed(0);
        const appr = (avg('taxa_aprovacao') * 100).toFixed(1) + '%';
        const alunos = filtered.reduce((s,x) => s + x.alunos_total, 0).toLocaleString('pt-BR');
        const profs  = filtered.reduce((s,x) => s + (x.professores||0), 0).toLocaleString('pt-BR');
        const turma  = avg('alunos_turma').toFixed(1);

        animateCount($('idebAverage'),    ideb);
        animateCount($('saebAverage'),    saeb);
        $('approvalAverage').textContent = appr;
        animateCount($('totalStudents'),  alunos);
        animateCount($('totalTeachers'),  profs);
        $('avgClassSize').textContent    = turma;
    }

    function animateCount(el, val) {
        el.textContent = val;
    }

    // ── Infrastructure ─────────────────────────────────────────
    function renderInfra() {
        const n = filtered.length;
        $('infra-count').textContent = n ? `(${n} escolas)` : '';

        const bars = $('infraBars');
        bars.innerHTML = '';
        INFRA_KEYS.forEach(({ key, label }) => {
            const count = filtered.filter(s => s[key] === 1).length;
            const pct   = n ? Math.round((count / n) * 100) : 0;

            bars.insertAdjacentHTML('beforeend', `
                <div class="infra-item">
                    <div class="infra-row">
                        <span class="infra-name">${label}</span>
                        <span class="infra-pct">${pct}%</span>
                    </div>
                    <div class="infra-bar-bg">
                        <div class="infra-bar-fill" style="width:${pct}%"></div>
                    </div>
                </div>
            `);
        });
    }

    // ── Charts ─────────────────────────────────────────────────
    // Cores fixas por grupo
    const GROUP_COLOR = {
        TOP10:      { bg: 'rgba(110,231,183,.75)', border: 'rgba(110,231,183,1)' },
        SOROCABA:   { bg: 'rgba(147,197,253,.75)', border: 'rgba(147,197,253,1)' },
        VOTORANTIM: { bg: 'rgba(252,211,77,.75)',  border: 'rgba(252,211,77,1)'  },
    };
    const GROUPS = ['TOP10', 'SOROCABA', 'VOTORANTIM'];
    const GROUP_LABEL = { TOP10: 'TOP 10 Brasil', SOROCABA: 'Sorocaba', VOTORANTIM: 'Votorantim' };

    function groupAvg(data, tipo, key) {
        const grp = data.filter(s => s.tipo === tipo);
        if (!grp.length) return null;
        return grp.reduce((s, x) => s + (x[key] || 0), 0) / grp.length;
    }

    function renderCharts() {
        renderIdebBar();
        renderIdebGroup();
        renderSaebGroup();
        renderApprovalGroup();
        renderScatter();
    }

    function destroyChart(name) {
        if (charts[name]) { charts[name].destroy(); delete charts[name]; }
    }

    function ctx(id) { return $(id).getContext('2d'); }

    // ── 1. IDEB por escola — barra colorida por grupo + linha de média TOP10 ──
    function renderIdebBar() {
        destroyChart('ideb');
        const sorted = [...filtered].sort((a, b) => b.ideb - a.ideb);
        const labels = sorted.map(s => truncate(s.escola, 20));
        const values = sorted.map(s => s.ideb);
        const colors = sorted.map(s => GROUP_COLOR[s.tipo]?.bg || 'rgba(200,200,200,.5)');
        const borders= sorted.map(s => GROUP_COLOR[s.tipo]?.border || '#aaa');
        const top10Avg = groupAvg(allData, 'TOP10', 'ideb');

        charts.ideb = new Chart(ctx('idebBarChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'IDEB',
                        data: values,
                        backgroundColor: colors,
                        borderColor: borders,
                        borderWidth: 1,
                        borderRadius: 5,
                    },
                    {
                        label: `Média TOP 10 Brasil (${top10Avg?.toFixed(1)})`,
                        data: Array(sorted.length).fill(top10Avg),
                        type: 'line',
                        borderColor: 'rgba(110,231,183,.7)',
                        borderWidth: 1.5,
                        borderDash: [6, 3],
                        pointRadius: 0,
                        fill: false,
                        tension: 0,
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 14, filter: i => i.datasetIndex === 1 } },
                    tooltip: {
                        callbacks: {
                            title: items => sorted[items[0].dataIndex]?.escola,
                            label: item => item.datasetIndex === 0
                                ? `IDEB: ${item.raw} — ${GROUP_LABEL[sorted[item.dataIndex]?.tipo] || ''}`
                                : `Referência TOP 10: ${top10Avg?.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: { min: 0, max: 10, grid: { color: '#1a1e2a' }, ticks: { color: '#4a5068' } },
                    x: { grid: { display: false }, ticks: { maxRotation: 45, color: '#4a5068', font: { size: 10 } } }
                }
            }
        });
    }

    // ── 2. Média IDEB por grupo — barras horizontais ──────────
    function renderIdebGroup() {
        destroyChart('idebGroup');
        const active = GROUPS.filter(g => filtered.some(s => s.tipo === g));
        const labels = active.map(g => GROUP_LABEL[g]);
        const values = active.map(g => +(groupAvg(filtered, g, 'ideb') || 0).toFixed(2));

        charts.idebGroup = new Chart(ctx('idebGroupChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Média IDEB',
                    data: values,
                    backgroundColor: active.map(g => GROUP_COLOR[g].bg),
                    borderColor: active.map(g => GROUP_COLOR[g].border),
                    borderWidth: 1,
                    borderRadius: 8,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: i => `Média IDEB: ${i.raw}` } }
                },
                scales: {
                    x: { min: 0, max: 10, grid: { color: '#1a1e2a' }, ticks: { color: '#4a5068' } },
                    y: { grid: { display: false }, ticks: { color: '#7a8099', font: { size: 12 } } }
                }
            }
        });
    }

    // ── 3. SAEB LP e Mat — média por grupo ────────────────────
    function renderSaebGroup() {
        destroyChart('saeb');
        const active = GROUPS.filter(g => filtered.some(s => s.tipo === g));
        const labels = active.map(g => GROUP_LABEL[g]);

        charts.saeb = new Chart(ctx('saebGroupChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'SAEB LP',
                        data: active.map(g => +(groupAvg(filtered, g, 'saeb_lp') || 0).toFixed(1)),
                        backgroundColor: active.map(g => GROUP_COLOR[g].bg),
                        borderColor: active.map(g => GROUP_COLOR[g].border),
                        borderWidth: 1,
                        borderRadius: 5,
                    },
                    {
                        label: 'SAEB Matemática',
                        data: active.map(g => +(groupAvg(filtered, g, 'saeb_mat') || 0).toFixed(1)),
                        backgroundColor: active.map(g => GROUP_COLOR[g].bg.replace('.75', '.35')),
                        borderColor: active.map(g => GROUP_COLOR[g].border),
                        borderWidth: 1,
                        borderRadius: 5,
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                scales: {
                    y: { min: 220, grid: { color: '#1a1e2a' }, ticks: { color: '#4a5068' } },
                    x: { grid: { display: false }, ticks: { color: '#7a8099' } }
                }
            }
        });
    }

    // ── 4. Taxa de aprovação média por grupo ──────────────────
    function renderApprovalGroup() {
        destroyChart('approval');
        const active = GROUPS.filter(g => filtered.some(s => s.tipo === g));
        const labels = active.map(g => GROUP_LABEL[g]);
        const values = active.map(g => +((groupAvg(filtered, g, 'taxa_aprovacao') || 0) * 100).toFixed(1));

        charts.approval = new Chart(ctx('approvalGroupChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Aprovação (%)',
                    data: values,
                    backgroundColor: active.map(g => GROUP_COLOR[g].bg),
                    borderColor: active.map(g => GROUP_COLOR[g].border),
                    borderWidth: 1,
                    borderRadius: 8,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: i => `Aprovação média: ${i.raw}%` } }
                },
                scales: {
                    y: { min: 80, max: 100, grid: { color: '#1a1e2a' }, ticks: { color: '#4a5068', callback: v => v + '%' } },
                    x: { grid: { display: false }, ticks: { color: '#7a8099' } }
                }
            }
        });
    }

    // ── 5. Dispersão IDEB × Aprovação colorida por grupo ─────
    function renderScatter() {
        destroyChart('scatter');
        const active = GROUPS.filter(g => filtered.some(s => s.tipo === g));

        const datasets = active.map(g => ({
            label: GROUP_LABEL[g],
            data: filtered
                .filter(s => s.tipo === g)
                .map(s => ({ x: s.ideb, y: +(s.taxa_aprovacao * 100).toFixed(1), escola: s.escola })),
            backgroundColor: GROUP_COLOR[g].bg,
            borderColor: GROUP_COLOR[g].border,
            borderWidth: 1,
            pointRadius: 7,
            pointHoverRadius: 10,
        }));

        charts.scatter = new Chart(ctx('scatterChart'), {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12 } },
                    tooltip: {
                        callbacks: {
                            label: i => `${i.raw.escola} — IDEB ${i.raw.x}, Aprov. ${i.raw.y}%`
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'IDEB', color: '#4a5068' }, grid: { color: '#1a1e2a' }, ticks: { color: '#4a5068' } },
                    y: { title: { display: true, text: 'Aprovação (%)', color: '#4a5068' }, min: 80, grid: { color: '#1a1e2a' }, ticks: { color: '#4a5068', callback: v => v + '%' } }
                }
            }
        });
    }

    // ── Table ──────────────────────────────────────────────────
    function renderTable() {
        tableBody.innerHTML = '';

        if (!filtered.length) {
            tableBody.innerHTML = `
                <tr><td colspan="11">
                    <div class="empty-state">
                        <div class="empty-icon">◌</div>
                        <p>Nenhuma escola encontrada com os filtros selecionados.</p>
                    </div>
                </td></tr>`;
            return;
        }

        const frag = document.createDocumentFragment();

        filtered.forEach(s => {
            const tr = document.createElement('tr');
            if (s.ideb > 8) tr.classList.add('highlight-row');

            const idebClass = s.ideb > 8 ? 'ideb-high' : s.ideb >= 7 ? 'ideb-mid' : 'ideb-low';
            const apprPct = (s.taxa_aprovacao * 100).toFixed(1);
            const infraHTML = INFRA_KEYS.map(({key, label}) =>
                `<span class="infra-icon ${s[key]===1?'on':''}" title="${label.split(' ').slice(1).join(' ')}">${label.split(' ')[0]}</span>`
            ).join('');

            tr.innerHTML = `
                <td><span class="rank-badge">${s.ranking}</span></td>
                <td><span class="school-name" title="${s.escola}">${s.escola}</span></td>
                <td>${s.cidade}</td>
                <td><span class="type-pill type-${s.tipo}">${s.tipo}</span></td>
                <td><span class="rede-pill rede-${s.rede}">${s.rede}</span></td>
                <td><span class="ideb-val ${idebClass}">${s.ideb}</span></td>
                <td style="font-family:var(--font-mono)">${s.saeb_lp}</td>
                <td style="font-family:var(--font-mono)">${s.saeb_mat}</td>
                <td>
                    <div class="approval-bar">
                        <div class="approval-bg">
                            <div class="approval-fill" style="width:${apprPct}%"></div>
                        </div>
                        <span style="font-family:var(--font-mono);font-size:.78rem">${apprPct}%</span>
                    </div>
                </td>
                <td style="font-family:var(--font-mono)">${s.alunos_total.toLocaleString('pt-BR')}</td>
                <td><div class="infra-icons">${infraHTML}</div></td>
            `;

            frag.appendChild(tr);
        });

        tableBody.appendChild(frag);
    }

    // ════════════════════════════════════════════════════════════
    //  COMPARATIVO DE CIDADES
    // ════════════════════════════════════════════════════════════

    // Paleta de cores por posição de cidade selecionada
    const CMP_COLORS = [
        { bg: 'rgba(110,231,183,.7)', border: 'rgba(110,231,183,1)', hex: '#6ee7b7' },
        { bg: 'rgba(147,197,253,.7)', border: 'rgba(147,197,253,1)', hex: '#93c5fd' },
        { bg: 'rgba(252,211,77,.7)',  border: 'rgba(252,211,77,1)',  hex: '#fcd34d' },
    ];

    // Calcula a "nota de infraestrutura" como % média dos campos booleanos
    function calcInfraScore(schools) {
        if (!schools.length) return 0;
        const keys = INFRA_KEYS.map(i => i.key);
        const total = schools.reduce((sum, s) => {
            const score = keys.reduce((ks, k) => ks + (s[k] === 1 ? 1 : 0), 0);
            return sum + score / keys.length;
        }, 0);
        return (total / schools.length) * 100;
    }

    // Agrega dados por cidade
    function aggregateCity(city) {
        const schools = allData.filter(s => s.cidade === city);
        if (!schools.length) return null;
        const avg = key => schools.reduce((s, x) => s + (x[key] || 0), 0) / schools.length;
        return {
            city,
            n: schools.length,
            ideb:      +avg('ideb').toFixed(2),
            saeb_lp:   +avg('saeb_lp').toFixed(1),
            saeb_mat:  +avg('saeb_mat').toFixed(1),
            aprovacao: +(avg('taxa_aprovacao') * 100).toFixed(1),
            infra:     +calcInfraScore(schools).toFixed(1),
            alunos:    schools.reduce((s, x) => s + x.alunos_total, 0),
            schools,
        };
    }

    function renderCompare() {
        const c1 = $('compareCity1')?.value;
        const c2 = $('compareCity2')?.value;
        const c3 = $('compareCity3')?.value;

        const selected = [c1, c2, c3].filter(Boolean);
        const valid = selected.filter((v, i, a) => a.indexOf(v) === i); // remove duplicatas

        const empty  = $('compareEmpty');
        const body   = $('compareBody');

        if (valid.length < 2) {
            empty.style.display = '';
            body.style.display  = 'none';
            return;
        }

        empty.style.display = 'none';
        body.style.display  = 'flex';

        const groups = valid.map((city, i) => ({ ...aggregateCity(city), color: CMP_COLORS[i] }))
                            .filter(g => g.n > 0);

        if (groups.length < 2) {
            empty.style.display = '';
            body.style.display  = 'none';
            return;
        }

        renderVersusCards(groups);
        renderRadar(groups);
        renderInfraTable(groups);
    }

    // ── Cards Versus ──────────────────────────────────────────
    const VERSUS_METRICS = [
        { key: 'ideb',      label: 'IDEB Médio',          format: v => v.toFixed(2), max: 10 },
        { key: 'saeb_lp',   label: 'SAEB — Língua Port.', format: v => v.toFixed(1), max: 350 },
        { key: 'saeb_mat',  label: 'SAEB — Matemática',   format: v => v.toFixed(1), max: 350 },
        { key: 'aprovacao', label: 'Taxa de Aprovação',    format: v => v.toFixed(1) + '%', max: 100 },
        { key: 'infra',     label: 'Nota de Infraestrutura', format: v => v.toFixed(1) + '%', max: 100 },
    ];

    function renderVersusCards(groups) {
        const grid = $('versusGrid');
        grid.innerHTML = '';

        VERSUS_METRICS.forEach(metric => {
            const values  = groups.map(g => g[metric.key]);
            const maxVal  = Math.max(...values);
            const minVal  = Math.min(...values);
            const isAllEqual = maxVal === minVal;

            const card = document.createElement('div');
            card.className = 'versus-card' + (!isAllEqual ? ' has-leader' : '');

            const rows = groups.map((g, i) => {
                const val    = g[metric.key];
                const pct    = metric.max ? (val / metric.max) * 100 : (val / maxVal) * 100;
                const isLeader = !isAllEqual && val === maxVal;
                const leaderBadge = isLeader
                    ? `<span class="leader-badge">★ Líder</span>`
                    : '';

                return `
                    <div class="versus-row">
                        <div>
                            <div class="versus-city-name" style="color:${g.color.hex}">${g.city}</div>
                            ${leaderBadge}
                        </div>
                        <div class="versus-bar-wrap" style="flex-direction:column;align-items:center;gap:2px">
                            <span class="versus-val ${isLeader ? 'leader' : ''}" style="color:${g.color.hex}">
                                ${metric.format(val)}
                            </span>
                            <div class="vbar-track" style="width:80px">
                                <div class="vbar-fill" style="width:${pct}%;background:${g.color.bg};border:1px solid ${g.color.border}"></div>
                            </div>
                        </div>
                        <div style="font-size:.72rem;color:var(--text-dim);text-align:right">${g.n} escola${g.n !== 1 ? 's' : ''}</div>
                    </div>`;
            }).join('');

            card.innerHTML = `
                <div class="versus-card-title">${metric.label}</div>
                <div class="versus-rows">${rows}</div>`;

            grid.appendChild(card);
        });
    }

    // ── Radar Chart ───────────────────────────────────────────
    function renderRadar(groups) {
        if (charts.radar) { charts.radar.destroy(); delete charts.radar; }

        // Normaliza os valores para escala 0–100 para o radar ser legível
        const RADAR_MAX = { ideb: 10, saeb_lp: 350, saeb_mat: 350, aprovacao: 100, infra: 100 };
        const RADAR_MIN = { ideb: 0,  saeb_lp: 220, saeb_mat: 220, aprovacao: 80,  infra: 0  };

        function normalize(val, key) {
            const mn = RADAR_MIN[key], mx = RADAR_MAX[key];
            return Math.min(100, Math.max(0, ((val - mn) / (mx - mn)) * 100));
        }

        const labels = ['IDEB', 'SAEB LP', 'SAEB Mat', '% Aprovação', '% Infraestrutura'];
        const keys   = ['ideb', 'saeb_lp', 'saeb_mat', 'aprovacao', 'infra'];

        charts.radar = new Chart($('radarChart').getContext('2d'), {
            type: 'radar',
            data: {
                labels,
                datasets: groups.map(g => ({
                    label: g.city,
                    data: keys.map(k => normalize(g[k], k)),
                    backgroundColor: g.color.bg.replace('.7)', '.15)'),
                    borderColor: g.color.border,
                    borderWidth: 2,
                    pointBackgroundColor: g.color.border,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, color: '#7a8099' } },
                    tooltip: {
                        callbacks: {
                            label: item => {
                                const g   = groups[item.datasetIndex];
                                const key = keys[item.dataIndex];
                                const raw = g[key];
                                const fmt = VERSUS_METRICS.find(m => m.key === key)?.format;
                                return ` ${g.city}: ${fmt ? fmt(raw) : raw}`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0, max: 100,
                        ticks: { display: false },
                        grid:  { color: '#1a1e2a' },
                        pointLabels: { color: '#7a8099', font: { size: 11, family: "'DM Sans', sans-serif" } },
                        angleLines: { color: '#242836' },
                    }
                }
            }
        });
    }

    // ── Infraestrutura Table ──────────────────────────────────
    function renderInfraTable(groups) {
        const head = $('infraCompareHead');
        const body = $('infraCompareBody');

        // Cabeçalho
        head.innerHTML = `<tr>
            <th>Recurso</th>
            ${groups.map(g => `<th style="color:${g.color.hex}">${g.city}</th>`).join('')}
        </tr>`;

        // Linhas por item de infra + linha de total
        body.innerHTML = '';

        INFRA_KEYS.forEach(({ key, label }) => {
            const values = groups.map(g => {
                const pct = g.schools.length
                    ? (g.schools.filter(s => s[key] === 1).length / g.schools.length) * 100
                    : 0;
                return +pct.toFixed(0);
            });
            const maxV = Math.max(...values);

            const cells = groups.map((g, i) => {
                const pct = values[i];
                const isLeader = pct === maxV && maxV > 0;
                return `<td>
                    <div class="infra-pct-cell">
                        <div class="infra-dot-bar">
                            <div class="infra-dot-fill" style="width:${pct}%;background:${g.color.hex}"></div>
                        </div>
                        <span class="${isLeader ? 'infra-cell-leader' : ''}" style="${isLeader ? `color:${g.color.hex}` : ''}">
                            ${pct}%
                        </span>
                    </div>
                </td>`;
            }).join('');

            body.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${label}</td>
                    ${cells}
                </tr>`);
        });

        // Linha de média geral de infra
        const infraCells = groups.map(g => `
            <td style="font-family:var(--font-mono);color:${g.color.hex};font-weight:600">
                ${g.infra.toFixed(1)}%
            </td>`).join('');

        body.insertAdjacentHTML('beforeend', `
            <tr style="border-top:1px solid var(--border2)">
                <td style="color:var(--text);font-weight:600">Nota Geral</td>
                ${infraCells}
            </tr>`);
    }

    // ── Helpers ────────────────────────────────────────────────
    function truncate(str, n) {
        return str.length > n ? str.substring(0, n) + '…' : str;
    }

    function debounce(fn, ms) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    }

    function showToast(msg, err = false) {
        toast.textContent = msg;
        toast.style.borderColor = err ? '#f87171' : '#6ee7b7';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

})();
