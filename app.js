// ================================================================
// SISI NDIO SIFUNA — Core Application Logic
// Mobile-First Volunteer Web App
// ================================================================

// ─── Configuration ──────────────────────────────────────────────
// TODO: Replace with your deployed Google Apps Script Web App URL
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzgs828l0ZAlubq1envxuYrhECyYjUn8g-RE-Wfq5C93f5AyBAmJwVRq4SdQ_dwxo9jHA/exec';

// Polling interval for live stats (30 seconds)
const POLL_INTERVAL = 30000;

// ─── DOM Helpers ─────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Toast Notification ──────────────────────────────────────────
function showToast(msg, type = 'success', duration = 3500) {
    let toast = $('#toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── Number Counter Animation ────────────────────────────────────
function animateCounter(el, from, to, duration = 900) {
    if (!el) return;
    const start = performance.now();
    const range = to - from;
    const update = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - elapsed, 3);
        el.textContent = Math.round(from + range * eased).toLocaleString('en-KE');
        if (elapsed < 1) requestAnimationFrame(update);
        else el.textContent = to.toLocaleString('en-KE');
    };
    requestAnimationFrame(update);
}

// ─── Live Stats (Volunteers + Visitors) ─────────────────────────
let prevStats = { volunteers: 0, visitors: 0 };

async function fetchStats() {
    const volEl = $('#stat-volunteers');
    const visEl = $('#stat-visitors');
    try {
        const res = await fetch(`${GAS_API_URL}?action=getCount`, { cache: 'no-store' });
        const data = await res.json();
        const newVol = parseInt(data.volunteers) || 0;
        const newVis = parseInt(data.visitors) || 0;

        // Animate if values changed
        if (volEl && newVol !== prevStats.volunteers) {
            animateCounter(volEl, prevStats.volunteers, newVol);
            volEl.classList.add('updated');
            setTimeout(() => volEl.classList.remove('updated'), 700);
        }
        if (visEl && newVis !== prevStats.visitors) {
            animateCounter(visEl, prevStats.visitors, newVis);
        }
        prevStats = { volunteers: newVol, visitors: newVis };
    } catch (err) {
        // Silently fail — show cached/placeholder values
        if (volEl && volEl.textContent === '…') volEl.textContent = '—';
        if (visEl && visEl.textContent === '…') visEl.textContent = '—';
    }
}

// ─── Log Page Visit ──────────────────────────────────────────────
async function logVisit() {
    try {
        await fetch(`${GAS_API_URL}?action=logVisit`, { cache: 'no-store' });
    } catch (_) { /* silent fail */ }
}

// ─── IEBC Cascading Dropdowns ────────────────────────────────────
function initLocationDropdowns() {
    const countyEl = $('#county');
    const constituencyEl = $('#constituency');
    const wardEl = $('#ward');
    if (!countyEl) return;

    // Populate counties
    COUNTIES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        countyEl.appendChild(opt);
    });

    countyEl.addEventListener('change', () => {
        const county = countyEl.value;
        // Reset downstream
        constituencyEl.innerHTML = '<option value="">Select Constituency</option>';
        wardEl.innerHTML = '<option value="">Select Ward</option>';
        constituencyEl.disabled = true;
        wardEl.disabled = true;

        if (!county) return;
        getConstituencies(county).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            constituencyEl.appendChild(opt);
        });
        constituencyEl.disabled = false;
    });

    constituencyEl.addEventListener('change', () => {
        const county = countyEl.value;
        const constituency = constituencyEl.value;
        wardEl.innerHTML = '<option value="">Select Ward</option>';
        wardEl.disabled = true;
        if (!constituency) return;
        getWards(county, constituency).forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            wardEl.appendChild(opt);
        });
        wardEl.disabled = false;
    });
}

// ─── Volunteer Registration ──────────────────────────────────────
async function registerVolunteer(formData) {
    const btn = $('#register-btn');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

    try {
        const params = new URLSearchParams({ action: 'register', ...Object.fromEntries(formData) });
        const res = await fetch(GAS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });
        const data = await res.json();
        if (data.status === 'success' || data.result === 'success') {
            showSuccessScreen();
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (err) {
        // If GAS not yet configured, simulate success for demo
        if (GAS_API_URL.includes('YOUR_SCRIPT_ID')) {
            showSuccessScreen();
        } else {
            showToast('⚠️ ' + (err.message || 'Please try again.'), 'error');
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
    }
}

function showSuccessScreen() {
    const form = $('#register-form');
    const success = $('#success-screen');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
    // Update local counter immediately for optimistic UI
    const volEl = $('#stat-volunteers');
    if (volEl && prevStats.volunteers > 0) {
        animateCounter(volEl, prevStats.volunteers, prevStats.volunteers + 1);
        prevStats.volunteers += 1;
    }
}

// ─── Rally Events Loader ─────────────────────────────────────────
const DEMO_EVENTS = [
    { id: 1, title: 'Nairobi Uhuru Park Grand Rally', county: 'Nairobi', venue: 'Uhuru Park Grounds', date: '2026-03-14', time: '10:00 AM', mapUrl: 'https://maps.google.com/?q=Uhuru+Park+Nairobi', status: 'confirmed' },
    { id: 2, title: 'Mombasa Tononoka Youth Rally', county: 'Mombasa', venue: 'Tononoka Social Hall', date: '2026-03-21', time: '2:00 PM', mapUrl: 'https://maps.google.com/?q=Tononoka+Mombasa', status: 'confirmed' },
    { id: 3, title: 'Kisumu Jomo Kenyatta Grounds', county: 'Kisumu', venue: 'Jomo Kenyatta Grounds', date: '2026-03-28', time: '11:00 AM', mapUrl: 'https://maps.google.com/?q=Kisumu+Grounds', status: 'confirmed' },
    { id: 4, title: 'Nakuru Afraha Stadium Meet', county: 'Nakuru', venue: 'Afraha Stadium', date: '2026-04-04', time: '9:00 AM', mapUrl: 'https://maps.google.com/?q=Afraha+Stadium', status: 'confirmed' },
    { id: 5, title: 'Eldoret Vocational Village Rally', county: 'Uasin Gishu', venue: 'Eldoret Town Centre', date: '2026-04-11', time: '1:00 PM', mapUrl: 'https://maps.google.com/?q=Eldoret+Town', status: 'upcoming' },
    { id: 6, title: 'Garissa County Mobilisation Drive', county: 'Garissa', venue: 'Garissa Township Centre', date: '2026-04-18', time: '10:00 AM', mapUrl: 'https://maps.google.com/?q=Garissa', status: 'upcoming' },
];

async function loadEvents(containerId = 'events-list') {
    const container = $(`#${containerId}`);
    if (!container) return;

    let events = DEMO_EVENTS;
    try {
        if (!GAS_API_URL.includes('YOUR_SCRIPT_ID')) {
            const res = await fetch(`${GAS_API_URL}?action=getEvents`);
            const data = await res.json();
            if (Array.isArray(data) && data.length) events = data;
        }
    } catch (_) { /* use demo events */ }

    container.innerHTML = events.map(ev => renderEventCard(ev)).join('');
    window.dispatchEvent(new CustomEvent('eventsLoaded'));
}

function renderEventCard(ev) {
    const d = new Date(ev.date);
    const day = d.getDate();
    const month = d.toLocaleString('en-KE', { month: 'short' }).toUpperCase();
    const statusBadge = ev.status === 'confirmed'
        ? `<span class="badge badge-green">✔ Confirmed</span>`
        : `<span class="badge badge-gold">⏳ Upcoming</span>`;
    return `
    <div class="event-card reveal">
      <div class="event-card__date"><div class="day">${day}</div><div class="month">${month}</div></div>
      <div class="event-card__info">
        <div class="event-card__title">${ev.title}</div>
        <div class="event-card__meta">
          <span>📍 ${ev.venue}</span>
          <span>🕐 ${ev.time}</span>
          <span>🗺️ ${ev.county}</span>
        </div>
      </div>
      <div class="event-card__actions">
        ${statusBadge}
        <a href="${ev.mapUrl}" target="_blank" rel="noopener" class="btn btn-outline-red btn-sm">📍 Map</a>
      </div>
    </div>`;
}

// ─── Patriot Score (Task Board) ──────────────────────────────────
const TASKS = [
    { id: 't1', title: 'Share SISI NDIO SIFUNA on WhatsApp', points: 10, icon: '📱' },
    { id: 't2', title: 'Talk to 5 friends about the campaign', points: 20, icon: '🗣️' },
    { id: 't3', title: 'Post a campaign poster in your area', points: 15, icon: '📌' },
    { id: 't4', title: 'Attend a grassroot rally in your ward', points: 30, icon: '🏟️' },
    { id: 't5', title: 'Register 3 new volunteers', points: 40, icon: '👥' },
    { id: 't6', title: 'Share a campaign video on social media', points: 10, icon: '🎥' },
    { id: 't7', title: 'Wear campaign branded attire publicly', points: 10, icon: '👕' },
    { id: 't8', title: 'Volunteer as a rally marshal', points: 25, icon: '🦺' },
];

const LEVELS = [
    { min: 0, label: 'Patriot Recruit 🇰🇪' },
    { min: 30, label: 'Patriot Soldier  ⚔️' },
    { min: 70, label: 'Patriot Captain  🛡️' },
    { min: 120, label: 'Patriot General  🌟' },
    { min: 160, label: 'SISI Legend      👑' },
];

class PatriotScore {
    constructor() {
        this.completed = JSON.parse(localStorage.getItem('sisi_tasks') || '{}');
        this.render();
    }

    getScore() {
        return Object.keys(this.completed)
            .filter(id => this.completed[id])
            .reduce((sum, id) => {
                const t = TASKS.find(t => t.id === id);
                return sum + (t ? t.points : 0);
            }, 0);
    }

    getLevel(score) {
        let level = LEVELS[0];
        LEVELS.forEach(l => { if (score >= l.min) level = l; });
        return level;
    }

    toggle(taskId) {
        this.completed[taskId] = !this.completed[taskId];
        localStorage.setItem('sisi_tasks', JSON.stringify(this.completed));
        this.render();
        const score = this.getScore();
        showToast(this.completed[taskId]
            ? `✅ Task done! +${TASKS.find(t => t.id === taskId)?.points}pts`
            : '↩️ Task unmarked', 'success');
    }

    render() {
        const score = this.getScore();
        const level = this.getLevel(score);
        const scoreEl = $('#patriot-score');
        const levelEl = $('#patriot-level');
        const listEl = $('#task-list');
        if (scoreEl) scoreEl.textContent = score;
        if (levelEl) levelEl.textContent = level.label;
        if (!listEl) return;
        listEl.innerHTML = TASKS.map(t => {
            const done = !!this.completed[t.id];
            return `
        <div class="task-item ${done ? 'completed' : ''}" data-task="${t.id}" role="button" tabindex="0"
             aria-label="${t.title}" aria-pressed="${done}">
          <div class="task-check">${done ? '✓' : ''}</div>
          <div class="task-info">
            <div class="task-title">${t.icon} ${t.title}</div>
          </div>
          <div class="task-pts">+${t.points} pts</div>
        </div>`;
        }).join('');
        // Bind click/keyboard
        $$('.task-item', listEl).forEach(el => {
            el.addEventListener('click', () => this.toggle(el.dataset.task));
            el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(el.dataset.task); } });
        });
    }
}

// ─── Scroll Reveal ────────────────────────────────────────────────
function initScrollReveal() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    $$('.reveal').forEach(el => io.observe(el));
}

// ─── Active Nav Highlighting ─────────────────────────────────────
function highlightActiveNav() {
    const path = window.location.pathname;
    $$('.bottom-nav__item, .desktop-nav a').forEach(a => {
        const href = a.getAttribute('href') || '';
        // Mark active if href matches current page filename
        if ((path.endsWith(href) || (path === '/' && href === 'index.html') || (path.endsWith('index.html') && href === 'index.html'))) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });
}

// ─── Service Worker Registration (Silent) ─────────────────────────
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    }
}

// ─── Registration Form ────────────────────────────────────────────
function initRegisterForm() {
    const form = $('#register-form');
    if (!form) return;
    initLocationDropdowns();
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        // Basic validation
        const required = ['fullName', 'phone', 'county', 'constituency', 'ward'];
        for (const f of required) {
            if (!data.get(f)?.trim()) {
                showToast(`⚠️ Please fill in: ${f.replace(/([A-Z])/g, ' $1')}`, 'error');
                return;
            }
        }
        await registerVolunteer(data);
    });
}

// ─── Share Button ─────────────────────────────────────────────────
function initShare() {
    const btn = $('#share-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const shareData = {
            title: 'SISI NDIO SIFUNA 🇰🇪',
            text: 'I just joined the SISI NDIO SIFUNA volunteer movement! Join the movement at:',
            url: window.location.origin
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (_) { }
        } else {
            await navigator.clipboard.writeText(window.location.origin);
            showToast('🔗 Link copied to clipboard!');
        }
    });
}

// ─── Page Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    logVisit();
    fetchStats();
    setInterval(fetchStats, POLL_INTERVAL);

    initRegisterForm();
    initScrollReveal();
    highlightActiveNav();
    initShare();

    // Page-specific init
    if ($('#events-list')) loadEvents();
    if ($('#task-list')) new PatriotScore();
});
