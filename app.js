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
    // Re-trigger reveal for new cards
    initScrollReveal();
    window.dispatchEvent(new CustomEvent('eventsLoaded'));
}

function renderEventCard(ev) {
    // Robust date parsing to avoid timezone shifts (e.g. from YYYY-MM-DD)
    const dateStr = ev.date?.includes('T') ? ev.date : `${ev.date}T00:00:00`;
    const d = new Date(dateStr);
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

// ─── Resource Toolkit Loader ─────────────────────────────────────
const DEMO_RESOURCES = [
    { id: 101, category: 'Posters', title: 'Main Campaign Poster A4', format: 'WebP', size: '~120 KB', url: '#', thumbnailUrl: '', description: 'Main visibility poster' },
    { id: 102, category: 'Posters', title: 'WhatsApp Story Poster', format: 'WebP', size: '~80 KB', url: '#', thumbnailUrl: '', description: 'Optimised for mobile sharing' },
    { id: 103, category: 'Stickers', title: 'SISI NDIO SIFUNA Sticker Pack', format: 'WhatsApp', size: '18 Stickers', url: '#', thumbnailUrl: '', description: 'Official WhatsApp stickers' },
    { id: 104, category: 'Talking Points', title: 'Door-to-Door Canvassing Guide', format: 'PDF', size: '~350 KB', url: '#', thumbnailUrl: '', description: 'Step-by-step guide for volunteers' },
    { id: 105, category: 'Videos', title: 'Main Campaign Ad (30s)', format: 'Video', size: '~4 MB', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '', description: 'High energy campaign video' },
    { id: 106, category: 'Videos', title: 'Youth Rally TikTok', format: 'Video', size: 'TikTok', url: 'https://www.tiktok.com/@user/video/123', thumbnailUrl: '', description: 'Viral youth mobilisation video' },
    { id: 107, category: 'Videos', title: 'Principal Message FB', format: 'Video', size: 'FB Live', url: 'https://www.facebook.com/watch/?v=456', thumbnailUrl: '', description: 'Principal address to the nation' }
];

async function loadResources() {
    const posterGrid = $('#posters-grid');
    const stickersGrid = $('#stickers-grid');
    const talkingGrid = $('#talking-grid');
    const videosGrid = $('#videos-grid');

    if (!posterGrid && !stickersGrid && !talkingGrid && !videosGrid) return;

    let resources = DEMO_RESOURCES;
    try {
        if (!GAS_API_URL.includes('YOUR_SCRIPT_ID')) {
            const res = await fetch(`${GAS_API_URL}?action=getResources`);
            const data = await res.json();
            if (Array.isArray(data) && data.length) resources = data;
        }
    } catch (_) { /* use demo resources */ }

    // Grouping
    const groups = {
        'Posters': resources.filter(r => r.category === 'Posters' || r.category === 'Poster'),
        'Stickers': resources.filter(r => r.category === 'Stickers' || r.category === 'Sticker'),
        'Talking Points': resources.filter(r => r.category === 'Talking Points' || r.category === 'Talking Point' || r.category === 'Script'),
        'Videos': resources.filter(r => r.category === 'Videos' || r.category === 'Video')
    };

    if (posterGrid) posterGrid.innerHTML = groups['Posters'].map(r => renderResourceCard(r)).join('');
    if (stickersGrid) {
        const stickers = groups['Stickers'];
        if (stickers.length) {
            stickersGrid.innerHTML = stickers.map(r => `
                <div class="card reveal">
                    <div class="card__body">
                        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
                            <div style="font-size:3rem;line-height:1">🎉🇰🇪✊🌟💪🗳️</div>
                            <div>
                                <h4 style="margin-bottom:.5rem">${r.title}</h4>
                                <p style="font-size:.85rem;color:var(--grey-600);margin-bottom:1rem">${r.description || ''}</p>
                                <a href="${r.url}" class="btn btn-primary">💬 Add to WhatsApp</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    if (talkingGrid) talkingGrid.innerHTML = groups['Talking Points'].map(r => `
        <div class="card reveal">
            <div class="card__body" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
                <div>
                    <h4 style="margin-bottom:.25rem">${r.title}</h4>
                    <p style="font-size:.82rem;color:var(--grey-400)">${r.format} · ${r.size}</p>
                </div>
                <a href="${r.url}" class="btn btn-sm btn-outline-red" download>⬇ Download ${r.format}</a>
            </div>
        </div>
    `).join('');
    if (videosGrid) videosGrid.innerHTML = groups['Videos'].map(r => renderVideoCard(r)).join('');

    initScrollReveal();
}

function renderResourceCard(r) {
    let icon = '📌';
    let gradient = 'linear-gradient(135deg,#000,#CE1126)';
    if (r.title.toLowerCase().includes('whatsapp')) { icon = '📱'; gradient = 'linear-gradient(135deg,#006600,#CE1126)'; }
    if (r.title.toLowerCase().includes('youth')) { icon = '🛡️'; gradient = 'linear-gradient(135deg,#CE1126,#000)'; }
    if (r.title.toLowerCase().includes('women')) { icon = '👩'; gradient = 'linear-gradient(135deg,#000,#006600)'; }

    return `
    <div class="resource-card reveal">
        <div class="resource-card__thumb" style="background:${gradient}">${icon}</div>
        <div class="resource-card__body">
            <div class="resource-card__title">${r.title}</div>
            <div class="resource-card__size">${r.format} · ${r.size}</div>
        </div>
        <a href="${r.url}" class="resource-card__dl" download>⬇ Download</a>
    </div>`;
}

function renderVideoCard(v) {
    let thumb = v.thumbnailUrl;
    let platform = 'video';
    const url = v.url.toLowerCase();

    // Platform detection
    if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
    else if (url.includes('tiktok.com')) platform = 'tiktok';
    else if (url.includes('facebook.com') || url.includes('fb.watch')) platform = 'facebook';
    else if (url.includes('instagram.com')) platform = 'instagram';
    else if (url.includes('t.co') || url.includes('x.com') || url.includes('twitter.com')) platform = 'x';

    // Auto YouTube Thumbnail
    if (!thumb && platform === 'youtube') {
        const id = v.url.split('v=')[1]?.split('&')[0] || v.url.split('be/')[1]?.split('?')[0];
        if (id) thumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }

    // Platform Branding
    const brands = {
        'youtube': { icon: '🎬', color: '#FF0000' },
        'tiktok': { icon: '🎵', color: '#000000' },
        'facebook': { icon: '👥', color: '#1877F2' },
        'instagram': { icon: '📸', color: '#E4405F' },
        'x': { icon: '🐦', color: '#000000' },
        'video': { icon: '▶', color: 'var(--kenya-red)' }
    };
    const brand = brands[platform];

    const preview = thumb
        ? `<img src="${thumb}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;">`
        : `<div style="font-size:2.5rem">${brand.icon}</div>`;

    return `
    <div class="resource-card reveal">
        <div class="resource-card__thumb" style="background:${brand.color};padding:0;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center">
            ${preview}
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.1)">
                <div style="width:46px;height:46px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#000;font-size:1.2rem;box-shadow:0 4px 12px rgba(0,0,0,0.2)">▶</div>
            </div>
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px">${platform}</div>
        </div>
        <div class="resource-card__body">
            <div class="resource-card__title">${v.title}</div>
            <div class="resource-card__size">${v.format} · ${v.size}</div>
        </div>
        <a href="${v.url}" target="_blank" rel="noopener" class="resource-card__dl">▶ Open on ${platform}</a>
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
    if ($('#posters-grid') || $('#stickers-grid') || $('#talking-grid') || $('#videos-grid')) loadResources();
});
