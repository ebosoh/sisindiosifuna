// ================================================================
// SISI NDIO SIFUNA — Core Application Logic
// Mobile-First Volunteer Web App
// ================================================================

// ─── Configuration ──────────────────────────────────────────────
// TODO: Replace with your deployed Google Apps Script Web App URL
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzgs828l0ZAlubq1envxuYrhECyYjUn8g-RE-Wfq5C93f5AyBAmJwVRq4SdQ_dwxo9jHA/exec';

// Polling interval for live stats (30 seconds)
const POLL_INTERVAL = 30000;

// PWA Install Prompt state
let deferredPrompt = null;
console.log('A2HS: app.js loaded version 3.0 ( диагностика)');

// ─── DOM Helpers ─────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Converts Google Drive share links to direct direct download/view links.
 * @param {string} url - The original Drive URL.
 * @param {boolean} isThumb - If true, returns a high-performing thumbnail URL for <img> tags.
 */
function getDirectDriveUrl(url, isThumb = false) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('drive.google.com')) {
        const match = url.match(/[-\w]{25,}/); // Extracts the file ID
        if (match) {
            const id = match[0];
            if (isThumb) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            return `https://drive.google.com/uc?export=download&id=${id}`;
        }
    }
    return url;
}

/**
 * Identity & Personalization System
 * Remembers the volunteer and recognizes their contribution across the platform.
 */
function applyPersonalization() {
    const name = localStorage.getItem('sisi_volunteer_name');
    if (!name) return;

    // 1. Update Header Call-to-Action
    const desktopJoin = $('.desktop-nav .btn-primary');
    if (desktopJoin) {
        desktopJoin.textContent = `Salute, ${name.split(' ')[0]} 🇰🇪`;
        desktopJoin.href = 'tasks.html';
        desktopJoin.style.background = 'transparent';
        desktopJoin.style.border = '2px solid var(--kenya-red)';
        desktopJoin.style.color = 'var(--kenya-red)';
    }

    const mobileJoin = $('.bottom-nav__item--join');
    if (mobileJoin) {
        const label = $('.bottom-nav__label', mobileJoin);
        const icon = $('.bottom-nav__icon', mobileJoin);
        if (label) label.textContent = 'Patriot';
        if (icon) icon.textContent = '🫡';
        if (icon) icon.textContent = '🫡';
        mobileJoin.href = 'tasks.html';
    }

    // 1.1 Support for "Install App" prompt for recognizing volunteers
    const installBadge = $('#install-badge');
    if (deferredPrompt && !installBadge) {
        const heroBadgeContainer = $('.hero__content');
        if (heroBadgeContainer) {
            const badge = document.createElement('button');
            badge.id = 'install-badge';
            badge.className = 'patriot-badge patriot-badge--gold reveal';
            badge.innerHTML = '📲 Install Official App';
            badge.style.marginTop = 'var(--sp-2)';
            badge.onclick = async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') deferredPrompt = null;
                badge.remove();
            };
            heroBadgeContainer.insertBefore(badge, heroBadgeContainer.querySelector('.hero__badge').nextSibling);
        }
    }

    // 2. Personalize Hero Sections (Home & Others)
    const heroTitle = $('.page-hero h1, .hero__title');
    const heroDesc = $('.page-hero p, .hero__sub');
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.includes('index');

    if (heroTitle && isHome) {
        heroTitle.innerHTML = `Karibu Sana, <span style="color:var(--kenya-red-bright)">${name.split(' ')[0]}</span>! 🇰🇪`;
        if (heroDesc) heroDesc.innerHTML = `You are a <strong>Certified Patriot</strong>. Thank you for standing for this noble cause.`;

        // Add a badge if it doesn't exist
        const heroBadge = $('.hero__badge');
        if (heroBadge) {
            heroBadge.innerHTML = `<span class="dot" aria-hidden="true"></span> CERTIFIED PATRIOT — VOLUNTEER ID: #${Math.floor(Math.random() * 9000) + 1000}`;
            heroBadge.classList.add('patriot-badge--gold');
        }
    }

    // 3. Page specific hero sub-text / Hiding Join elements
    if (isHome) {
        const heroJoinBtn = $('#hero-join-btn');
        if (heroJoinBtn) heroJoinBtn.style.display = 'none';

        // Hide the big bottom Join CTA section
        const bottomJoinSec = $('section[aria-labelledby="join-cta-heading"]');
        if (bottomJoinSec) bottomJoinSec.style.display = 'none';

        // Hide other join links in cards
        $$('a[href="join.html"]').forEach(el => {
            if (!el.closest('.app-bar') && !el.closest('.bottom-nav')) {
                el.style.display = 'none';
            }
        });
    }

    if (window.location.pathname.includes('resources.html')) {
        const resHero = $('.page-hero p');
        if (resHero) resHero.textContent = `Patriot ${name.split(' ')[0]}, use these tools to spread the movement.`;
    }
    if (window.location.pathname.includes('tasks.html')) {
        const taskHero = $('.page-hero p');
        if (taskHero) taskHero.textContent = `Salute Patriot ${name.split(' ')[0]}! Complete tasks to earn your Legend status.`;
    }

    // 4. Success Screen Personalization
    const successTitle = $('#success-screen h2');
    const successMsg = $('#success-screen p');
    if (successTitle) {
        successTitle.textContent = `Salute, Patriot ${name.split(' ')[0]}!`;
    }
    if (successMsg) {
        successMsg.innerHTML = `You are now a registered volunteer in the <strong>SISI NDIO SIFUNA</strong> movement. Your commitment to this noble cause is what will move Kenya forward. <br><br> <span class="noble-cause-msg">"Pamoja Tunajenga Taifa Letu!"</span>`;
    }
}

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
            const fullName = formData.get('fullName');
            if (fullName) localStorage.setItem('sisi_volunteer_name', fullName);
            showSuccessScreen();
        } else if (data.status === 'duplicate') {
            // Already registered — warn the user and let them fix their details
            showToast('⚠️ ' + (data.message || 'You are already registered.'), 'error', 5000);
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (err) {
        // If GAS not yet configured, simulate success for demo
        if (GAS_API_URL.includes('YOUR_SCRIPT_ID')) {
            const fullName = formData.get('fullName');
            if (fullName) localStorage.setItem('sisi_volunteer_name', fullName);
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
    applyPersonalization();
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
    { id: 101, category: 'Posters', title: 'Main Campaign Poster A4', format: 'WebP', size: '~120 KB', url: 'poster_main_a4.png', thumbnailUrl: 'poster_main_a4.png', description: 'Main visibility poster — print A4' },
    { id: 102, category: 'Posters', title: 'WhatsApp Story Poster', format: 'WebP', size: '~80 KB', url: 'https://drive.google.com/file/d/1BfS_i3L2X8_SAMPLE_ID/view?usp=sharing', thumbnailUrl: 'https://drive.google.com/file/d/1BfS_i3L2X8_SAMPLE_ID/view?usp=sharing', description: 'Optimised for mobile sharing — Powered by Google Drive' },
    { id: 103, category: 'Stickers', title: 'SISI NDIO SIFUNA Sticker Pack', format: 'WhatsApp', size: '18 Stickers', url: 'https://wa.me/message/XXXXXXXXXXXXXXX', thumbnailUrl: '', description: 'Official WhatsApp stickers — tap to add' },
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
                                <a href="${r.url}" class="btn btn-primary wa-sticker-btn"
                                   target="_blank" rel="noopener noreferrer"
                                   data-url="${r.url}">💬 Add to WhatsApp</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Handle placeholder URLs gracefully
            stickersGrid.querySelectorAll('.wa-sticker-btn').forEach(btn => {
                const url = btn.dataset.url || '';
                if (!url || url === '#' || url.includes('XXXXXXX')) {
                    btn.addEventListener('click', e => {
                        e.preventDefault();
                        showToast('⏳ Sticker pack coming soon — check back shortly!', 'success', 4000);
                    });
                }
            });
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
    fetchTikTokThumbnails();
}

function renderResourceCard(r) {
    let icon = '📌';
    let gradient = 'linear-gradient(135deg,#000,#CE1126)';
    if (r.title.toLowerCase().includes('whatsapp')) { icon = '📱'; gradient = 'linear-gradient(135deg,#006600,#CE1126)'; }
    if (r.title.toLowerCase().includes('youth')) { icon = '🛡️'; gradient = 'linear-gradient(135deg,#CE1126,#000)'; }
    if (r.title.toLowerCase().includes('women')) { icon = '👩'; gradient = 'linear-gradient(135deg,#000,#006600)'; }

    const isImageUrl = r.url && (r.url.toLowerCase().endsWith('.png') || r.url.toLowerCase().endsWith('.jpg') || r.url.toLowerCase().endsWith('.jpeg') || r.url.toLowerCase().endsWith('.webp'));
    const hasThumb = (r.thumbnailUrl && r.thumbnailUrl !== '#' && r.thumbnailUrl !== '') || isImageUrl;
    const rawThumb = (r.thumbnailUrl && r.thumbnailUrl !== '#' && r.thumbnailUrl !== '') ? r.thumbnailUrl : (isImageUrl ? r.url : '');
    const thumbSrc = getDirectDriveUrl(rawThumb, true);
    const dlUrl = getDirectDriveUrl((r.url && r.url !== '#') ? r.url : (hasThumb ? r.thumbnailUrl : null), false);
    const dlAttr = dlUrl ? `href="${dlUrl}" download` : `href="#" onclick="event.preventDefault();"`;

    if (hasThumb) {
        // ── Image-preview card ──────────────────────────────────
        return `
        <div class="resource-card reveal" style="overflow:hidden;flex-direction:column">
            <div style="position:relative;width:100%;height:200px;overflow:hidden;background:#111;border-radius:12px 12px 0 0">
                <img src="${thumbSrc}" alt="${r.title}"
                     loading="lazy"
                     style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease"
                     onmouseover="this.style.transform='scale(1.05)'"
                     onmouseout="this.style.transform='scale(1)'"
                     onerror="this.style.display='none';this.parentElement.querySelector('.img-fallback').style.display='flex'">
                <div class="img-fallback" style="display:none;position:absolute;inset:0;background:${gradient};align-items:center;justify-content:center;font-size:3rem">${icon}</div>
                <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)"></div>
                <a ${dlAttr} class="resource-card__dl"
                   style="position:absolute;bottom:10px;right:10px;border-radius:8px;padding:.4rem .9rem;font-size:.8rem">
                    ⬇ Download
                </a>
            </div>
            <div class="resource-card__body" style="border-radius:0 0 12px 12px">
                <div class="resource-card__title">${r.title}</div>
                <div class="resource-card__size">${r.format} · ${r.size}</div>
            </div>
        </div>`;
    }

    // ── Fallback gradient card (no thumbnail) ───────────────────
    return `
    <div class="resource-card reveal">
        <div class="resource-card__thumb" style="background:${gradient}">${icon}</div>
        <div class="resource-card__body">
            <div class="resource-card__title">${r.title}</div>
            <div class="resource-card__size">${r.format} · ${r.size}</div>
        </div>
        <a ${dlAttr} class="resource-card__dl">⬇ Download</a>
    </div>`;
}

function renderVideoCard(v) {
    let thumb = getDirectDriveUrl(v.thumbnailUrl, true);
    let platform = 'video';
    const url = v.url.trim();
    const urlLower = url.toLowerCase();

    // Platform detection
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) platform = 'youtube';
    else if (urlLower.includes('tiktok.com')) platform = 'tiktok';
    else if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) platform = 'facebook';
    else if (urlLower.includes('instagram.com')) platform = 'instagram';
    else if (urlLower.includes('t.co') || urlLower.includes('x.com') || urlLower.includes('twitter.com')) platform = 'x';

    // Auto YouTube Thumbnail
    if (!thumb && platform === 'youtube') {
        const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.match(ytRegex);
        const id = (match && match[2].length === 11) ? match[2] : null;
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
        ? `<img src="${thumb}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.parentElement.querySelector('.fallback-icon').style.display='block'">`
        : `<div class="fallback-icon" style="font-size:2.5rem">${brand.icon}</div>`;

    const iconOverlay = thumb ? `<div class="fallback-icon" style="font-size:2.5rem;display:none">${brand.icon}</div>` : '';

    // If it's TikTok and has no thumb, mark it for async loading
    const asyncAttr = (!thumb && platform === 'tiktok') ? `data-async-tiktok="${url}"` : '';

    return `
    <div class="resource-card reveal" ${asyncAttr}>
        <div class="resource-card__thumb" style="background:${brand.color};padding:0;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center">
            ${preview}
            ${iconOverlay}
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

/**
 * Async TikTok Thumbnail Fetching
 * Calls the backend proxy to get real thumbnails for TikTok videos.
 */
async function fetchTikTokThumbnails() {
    const targets = $$('[data-async-tiktok]');
    if (!targets.length) return;

    for (const card of targets) {
        const url = card.dataset.asyncTiktok;
        try {
            const res = await fetch(`${GAS_API_URL}?action=getTikTokThumbnail&url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.status === 'success' && data.thumbnail_url) {
                const thumbEl = $('.resource-card__thumb', card);
                if (thumbEl) {
                    thumbEl.innerHTML = `
                        <img src="${data.thumbnail_url}" alt="TikTok Preview" style="width:100%;height:100%;object-fit:cover;">
                        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.1)">
                            <div style="width:46px;height:46px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#000;font-size:1.2rem;box-shadow:0 4px 12px rgba(0,0,0,0.2)">▶</div>
                        </div>
                        <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px">tiktok</div>
                    `;
                }
            }
        } catch (_) { /* skip failed ones */ }
    }
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
        const CAMPAIGN_URL = 'https://www.sisindiosifuna.org';
        const shareData = {
            title: 'SISI NDIO SIFUNA 🇰🇪',
            text: 'I just joined the SISI NDIO SIFUNA volunteer movement! Join the movement at:',
            url: CAMPAIGN_URL
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (_) { }
        } else {
            await navigator.clipboard.writeText(CAMPAIGN_URL);
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
    applyPersonalization();

    // ─── Service Worker & PWA Installation ───────────────────────
    if ('serviceWorker' in navigator) {
        console.log('A2HS: Attempting to register SW...');
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('A2HS: SW Registered successfully:', reg.scope);
            })
            .catch(err => console.error('A2HS: SW Registration Failed:', err));
    }

    /**
     * PWA Install Popup Implementation
     */
    function showInstallPopup() {
        console.log('A2HS: showInstallPopup called. URL:', window.location.href);
        if (!deferredPrompt) {
            console.log('A2HS: deferredPrompt is null, skipping.');
            return;
        }

        const path = window.location.pathname.toLowerCase();
        // More robust homepage check for GitHub Pages subdirectories
        const otherPages = ['about.html', 'join.html', 'rallies.html', 'tasks.html', 'resources.html'];
        const isOtherPage = otherPages.some(p => path.includes(p));
        const isHomepage = !isOtherPage;

        console.log('A2HS: Page check:', { path, isHomepage });

        if (!isHomepage) return;

        // Check both session and local storage for dismissal
        const sessionDismissed = sessionStorage.getItem('sisi_install_dismissed');
        const localDismissed = localStorage.getItem('sisi_install_dismissed');
        console.log('A2HS: Dismissal check:', { sessionDismissed, localDismissed });

        if (sessionDismissed || localDismissed) return;

        let popup = $('#install-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'install-popup';
            popup.className = 'install-popup';

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const actionText = isMobile ? 'your mobile screen' : 'your desktop';

            popup.innerHTML = `
                <div class="install-popup__content">
                    <div class="install-popup__icon">📲</div>
                    <div class="install-popup__text">
                        <h4>SISI NDIO SIFUNA</h4>
                        <p>Add SISI NDIO SIFUNA on ${actionText} for faster access.</p>
                    </div>
                </div>
                <div class="install-popup__actions">
                    <button id="install-close" class="btn btn-secondary btn-sm">Later</button>
                    <button id="install-confirm" class="btn btn-primary btn-sm">Add Now</button>
                </div>
            `;
            document.body.appendChild(popup);

            $('#install-confirm').onclick = async () => {
                popup.classList.remove('visible');
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                deferredPrompt = null;
            };

            $('#install-close').onclick = () => {
                popup.classList.remove('visible');
                // Store in sessionStorage so it doesn't show again this session
                sessionStorage.setItem('sisi_install_dismissed', 'true');
            };
        }

        setTimeout(() => popup.classList.add('visible'), 1000);
    }

    // ─── Debug Helper ───────────────────────────────────────────
    // Call debugShowBanner() from the console to test visibility
    window.debugShowBanner = () => {
        console.log('A2HS: Manually triggering banner for UI testing...');
        // Force homepage flag so we can test anywhere
        const originalPrompt = deferredPrompt;
        if (!deferredPrompt) {
            deferredPrompt = { prompt: () => console.log('Mock Prompt Triggered'), userChoice: Promise.resolve({ outcome: 'accepted' }) };
        }

        // Temporarily bypass homepage check for debug
        const oldLog = console.log;
        console.log('A2HS: DEBUG MODE - Bypassing homepage check for next 5 seconds');

        showInstallPopup();

        // Reset if we mocked it
        setTimeout(() => {
            if (!originalPrompt) deferredPrompt = null;
        }, 6000);
    };

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('A2HS: beforeinstallprompt event fired!');
        e.preventDefault();
        deferredPrompt = e;
        // Show popup after a delay
        showInstallPopup();
        // Also update existing hero badges if any
        applyPersonalization();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        const popup = $('#install-popup');
        if (popup) popup.classList.remove('visible');
        const installBadge = $('#install-badge');
        if (installBadge) installBadge.remove();
        showToast('✅ App installed successfully!');
    });

    // Page-specific init
    if ($('#events-list')) loadEvents();
    if ($('#task-list')) new PatriotScore();
    if ($('#posters-grid') || $('#stickers-grid') || $('#talking-grid') || $('#videos-grid')) loadResources();
});
