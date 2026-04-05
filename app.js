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

// ─── GA4 Analytics Helper ────────────────────────────────────────
// Fires a Custom Event to Google Analytics 4. Safe-fails if GA not loaded.
function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
        console.log(`GA4: Tracked event "${eventName}"`, params);
    }
}

/**
 * Share the App URL
 */
async function shareApp() {
    const shareData = {
        title: 'SISI NDIO SIFUNA 🇰🇪',
        text: 'Join Kenya\'s fastest-growing volunteer movement! ✊',
        url: window.location.origin + window.location.pathname.replace(/index\.html$/, '')
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            console.log('A2HS: App shared successfully');
            trackEvent('share_movement', { method: 'native_share' });
        } else {
            // Fallback for desktop: Copy to clipboard or open a simple link
            const shareUrl = shareData.url;
            await navigator.clipboard.writeText(shareUrl);
            showToast('✅ Link copied to clipboard! Share it with your friends.', 'success');
            trackEvent('share_movement', { method: 'clipboard' });
        }
    } catch (err) {
        console.error('A2HS: Share failed:', err);
    }
}

// ─── DOM Helpers ─────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const esc = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

/**
 * Converts Google Drive share links to direct direct download/view links.
 * @param {string} url - The original Drive URL.
 * @param {boolean} isThumb - If true, returns a high-performing thumbnail URL for <img> tags.
 */
function getDirectDriveUrl(url, isThumb = false) {
    if (!url || typeof url !== 'string') return url;
    const cleanUrl = url.trim();
    if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
        // Robust ID extraction for /file/d/ID, /id=ID, /uc?id=ID, /open?id=ID
        const match = cleanUrl.match(/(?:\/d\/|id=|\/uc\?|folders\/)([-\w]{20,})/);
        if (match) {
            const id = match[1];
            if (cleanUrl.includes('folders/')) {
                console.warn('A2HS: Drive Folder link detected — folders cannot be thumbnails.');
                return cleanUrl;
            }
            if (isThumb) {
                // Return a primary and a fallback URL to try in <img> tag
                // But for a single string return, we'll use the most compatible one
                return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            }
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
    }
    return cleanUrl;
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

// 4. Success Screen Personalization

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
        const formDataObj = Object.fromEntries(formData);
        if (formDataObj.website_hp) { // Honeypot check
            console.warn('Bot detected via honeypot');
            return;
        }
        delete formDataObj.website_hp;

        const params = new URLSearchParams({ action: 'register', ...formDataObj });
        const res = await fetch(GAS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });
        const data = await res.json();
        if (data.status === 'success' || data.result === 'success') {
            const fullName = formData.get('fullName');
            if (fullName) localStorage.setItem('sisi_volunteer_name', fullName);
            // ─── GA4: Track Volunteer Registration ─────────────────
            trackEvent('volunteer_registered', {
                county: formData.get('county') || 'unknown',
                constituency: formData.get('constituency') || 'unknown',
                ward: formData.get('ward') || 'unknown',
                role: formData.get('role') || 'general'
            });
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
    // ─── GA4: Track Rally Page Views ──────────────────────────────
    trackEvent('rallies_viewed', { event_count: events.length });
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evStatus = (ev.status || '').toLowerCase();

    let statusBadge = '';
    if (d < today) {
        statusBadge = `<span class="badge" style="background:#e0e0e0;color:#555">🔙 Past</span>`;
    } else if (evStatus === 'confirmed') {
        statusBadge = `<span class="badge badge-green">✔ Confirmed</span>`;
    } else if (evStatus === 'tentative') {
        statusBadge = `<span class="badge" style="background:#f39c12;color:#fff">❓ Tentative</span>`;
    } else {
        statusBadge = `<span class="badge badge-gold">⏳ Upcoming</span>`;
    }

    return `
    <div class="event-card reveal">
      <div class="event-card__date"><div class="day">${esc(day)}</div><div class="month">${esc(month)}</div></div>
      <div class="event-card__info">
        <div class="event-card__title">${esc(ev.title)}</div>
        <div class="event-card__meta">
          <span>📍 ${esc(ev.venue)}</span>
          <span>🕐 ${esc(ev.time)}</span>
          <span>🗺️ ${esc(ev.county)}</span>
        </div>
      </div>
      <div class="event-card__actions">
        ${statusBadge}
        <a href="${esc(ev.mapUrl)}" target="_blank" rel="noopener" class="btn btn-outline-red btn-sm">📍 Map</a>
      </div>
    </div>`;
}

// ─── Resource Toolkit Loader ─────────────────────────────────────
const DEMO_RESOURCES = [
    { id: 101, category: 'Posters', title: 'Main Campaign Poster A4', format: 'WebP', size: '~120 KB', url: 'Poster 1.png', thumbnailUrl: 'Poster 1.png', description: 'Main visibility poster — print A4' },
    { id: 102, category: 'Posters', title: 'Campaign Story Poster', format: 'WebP', size: '~80 KB', url: 'Poster 2.png', thumbnailUrl: 'Poster 2.png', description: 'Optimised for mobile sharing' },
    { id: 103, category: 'Stickers', title: 'SISI NDIO SIFUNA Sticker Pack', format: 'WhatsApp', size: '18 Stickers', url: 'https://wa.me/message/XXXXXXXXXXXXXXX', thumbnailUrl: '', description: 'Official WhatsApp stickers — tap to add' },
    { id: 104, category: 'Talking Points', title: 'Door-to-Door Canvassing Guide', format: 'PDF', size: '~350 KB', url: '#', thumbnailUrl: '', description: 'Step-by-step guide for volunteers' },
    { id: 105, category: 'Videos', title: 'Main Campaign Ad (30s)', format: 'Video', size: '~4 MB', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '', description: 'High energy campaign video' },
    { id: 106, category: 'Videos', title: 'Youth Rally TikTok', format: 'Video', size: 'TikTok', url: 'https://www.tiktok.com/@user/video/123', thumbnailUrl: '', description: 'Viral youth mobilisation video' },
    { id: 107, category: 'Videos', title: 'Principal Message FB', format: 'Video', size: 'FB Live', url: 'https://www.facebook.com/watch/?v=456', thumbnailUrl: '', description: 'Principal address to the nation' }
];

/**
 * Universal Sharing System
 * Attempts native file sharing on mobile, falls back to text/link sharing.
 */
async function shareSticker(title, url, type = 'sticker') {
    const isDriveUrl = url.includes('drive.google.com') || url.includes('docs.google.com');
    const directUrl = isDriveUrl ? getDirectDriveUrl(url) : url;
    const domain = window.location.origin;
    // For local files, resolve against current path
    const fullUrl = url.startsWith('http') ? directUrl : `${domain}${window.location.pathname.replace('resources.html', '')}${url.startsWith('/') ? url.slice(1) : url}`;

    // 1. Try Native File Share (Mobile/Supported)
    if (navigator.canShare && navigator.share) {
        try {
            console.log('A2HS: Attempting to fetch image for sharing:', fullUrl);
            const response = await fetch(fullUrl, { mode: 'cors' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const blob = await response.blob();
            const file = new File([blob], `${title.replace(/\s+/g, '_')}.png`, { type: blob.type });

            if (navigator.canShare({ files: [file] })) {
                console.log('A2HS: Native sharing started with file.');
                await navigator.share({
                    files: [file],
                    title: title,
                    text: `Check out this ${type} from SISI NDIO SIFUNA! \u270a\ud83c\uddf0\ud83c\uddea\nhttps://sisindiosifuna.org`
                });
                // ─── GA4: Track sticker share ───────────────────────────────
                trackEvent('sticker_shared', { method: 'native_file', sticker_title: title });
                return;
            } else {
                console.warn('A2HS: Browser says it cannot share this specific file object.');
            }
        } catch (err) {
            console.error('A2HS: Share-as-file failed:', err);
            if (err.message.toLocaleLowerCase().includes('fetch') || err.name === 'TypeError') {
                showToast('ℹ️ Sharing as link (the image source is protected by security)', 'info', 3000);
            }
        }
    }

    // 2. Fallback: Text Share (WhatsApp Web / Other)
    const shareText = `Check out this ${type} from SISI NDIO SIFUNA! ✊🇰🇪\nView/Download: ${fullUrl}\nhttps://sisindiosifuna.org`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
    // ─── GA4: Track fallback WhatsApp share ───────────────────────
    trackEvent('sticker_shared', { method: 'whatsapp_link', sticker_title: title });
}

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

    // Case-insensitive, trimmed grouping
    const getGroup = (cat) => resources.filter(r => {
        const rCat = (r.category || '').toLowerCase().trim();
        const target = cat.toLowerCase();
        if (target === 'talking points') return rCat === 'talking points' || rCat === 'talking point' || rCat === 'script';
        return rCat === target || rCat === target.slice(0, -1); // matches 'Posters' and 'Poster'
    });

    const groups = {
        'Posters': getGroup('Posters'),
        'Stickers': getGroup('Stickers'),
        'Talking Points': getGroup('Talking Points'),
        'Videos': getGroup('Videos')
    };

    // Diagnostic Logs for Resource Counts
    console.log('A2HS: Resource Groups Loaded:', {
        Posters: groups['Posters'].length,
        Stickers: groups['Stickers'].length,
        TalkingPoints: groups['Talking Points'].length,
        Videos: groups['Videos'].length
    });

    if (posterGrid) {
        const posters = groups['Posters'];
        if (posters.length) {
            posterGrid.innerHTML = posters.map(r => {
                const isDriveUrl = r.url && (r.url.includes('drive.google.com') || r.url.includes('docs.google.com') || r.url.includes('googleusercontent.com'));
                const isLocalUrl = r.url && !r.url.startsWith('http') && r.url !== '#';
                const isImageUrl = r.url && (r.url.toLowerCase().trim().endsWith('.png') || r.url.toLowerCase().trim().endsWith('.jpg') || r.url.toLowerCase().trim().endsWith('.jpeg') || r.url.toLowerCase().trim().endsWith('.webp') || isDriveUrl || isLocalUrl);
                const hasThumb = (r.thumbnailUrl && r.thumbnailUrl !== '#' && r.thumbnailUrl !== '') || isImageUrl;
                const rawThumb = (r.thumbnailUrl && r.thumbnailUrl !== '#' && r.thumbnailUrl !== '') ? r.thumbnailUrl : (isImageUrl ? r.url : '');
                const thumbSrc = (isDriveUrl || (r.thumbnailUrl && r.thumbnailUrl.includes('drive.google.com'))) ? getDirectDriveUrl(rawThumb, true) : rawThumb;
                const dlUrl = isDriveUrl ? getDirectDriveUrl((r.url && r.url !== '#') ? r.url : (hasThumb ? r.thumbnailUrl : null), false) : ((r.url && r.url !== '#') ? r.url : (hasThumb ? r.thumbnailUrl : null));
                const dlAttr = dlUrl ? `href="${dlUrl}" download` : `href="#" onclick="event.preventDefault();"`;

                if (hasThumb) {
                    return `
                    <div class="resource-card reveal" style="overflow:hidden;flex-direction:column">
                        <div style="position:relative;width:100%;height:200px;overflow:hidden;background:#111;border-radius:12px 12px 0 0">
                             <img src="${esc(thumbSrc)}" alt="${esc(r.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
                             <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)"></div>
                             <div style="position:absolute;inset:0;padding:10px;display:flex;flex-direction:row;align-items:flex-end;justify-content:flex-end;gap:8px;">
                                 <button onclick="shareSticker('${esc(r.title.replace(/'/g, "\\'"))}', '${esc((r.url && r.url !== '#') ? r.url : (r.thumbnailUrl || ''))}', 'Campaign poster')" class="btn btn-green btn-xs" style="border-radius:8px;padding:.4rem .9rem;font-size:.8rem;border:none;">💬 Share</button>
                                 <a ${dlAttr} class="resource-card__dl" style="position:static;border-radius:8px;padding:.4rem .9rem;font-size:.8rem;margin:0;">⬇ Download</a>
                             </div>
                        </div>
                        <div class="resource-card__body" style="border-radius:0 0 12px 12px">
                            <div class="resource-card__title">${esc(r.title)}</div>
                            <div class="resource-card__size">${esc(r.format)} · ${esc(r.size)}</div>
                        </div>
                    </div>`;
                }
                return `
                <div class="resource-card reveal">
                    <div class="resource-card__thumb" style="background:var(--kenya-red)">📌</div>
                    <div class="resource-card__body">
                        <div class="resource-card__title">${esc(r.title)}</div>
                        <div class="resource-card__size">${esc(r.format)} · ${esc(r.size)}</div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:0.5rem;justify-content:center;padding-right:1rem;">
                        <button onclick="shareSticker('${esc(r.title.replace(/'/g, "\\'"))}', '${esc((r.url && r.url !== '#') ? r.url : '')}', 'Campaign poster')" class="btn btn-green btn-xs">💬 Share</button>
                        <a ${dlAttr} class="resource-card__dl" style="position:static;margin:0;">⬇ Download</a>
                    </div>
                </div>`;
            }).join('');
        } else {
            posterGrid.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--grey-500);padding:2rem">No posters available.</p>';
        }
    }
    if (stickersGrid) {
        const stickers = groups['Stickers'];
        if (stickers.length) {
            stickersGrid.innerHTML = stickers.map(r => {
                const isDriveUrl = r.url && (r.url.includes('drive.google.com') || r.url.includes('docs.google.com') || r.url.includes('googleusercontent.com'));
                const isImageUrl = r.url && (r.url.toLowerCase().trim().endsWith('.png') || r.url.toLowerCase().trim().endsWith('.jpg') || r.url.toLowerCase().trim().endsWith('.jpeg') || r.url.toLowerCase().trim().endsWith('.webp') || isDriveUrl);
                const hasThumb = (r.thumbnailUrl && r.thumbnailUrl !== '#' && r.thumbnailUrl !== '') || isImageUrl;
                const rawThumb = (r.thumbnailUrl && r.thumbnailUrl !== '#' && r.thumbnailUrl !== '') ? r.thumbnailUrl : (isImageUrl ? r.url : '');
                const thumbSrc = getDirectDriveUrl(rawThumb, true);

                const thumbHtml = hasThumb
                    ? `<img src="${thumbSrc}" alt="${r.title}" style="object-fit:contain;border-radius:8px;background:#f0f0f0">`
                    : `<div style="font-size:3.5rem;line-height:1;display:flex;align-items:center;justify-content:center">🇰🇪</div>`;

                return `
                <div class="card reveal sticker-card" style="display:flex;flex-direction:column">
                    <div class="card__body" style="padding:var(--sp-3);flex:1">
                        <div class="sticker-card__content">
                            <div class="sticker-card__preview">${thumbHtml}</div>
                            <div class="sticker-card__info">
                                <h4 class="sticker-card__title">${esc(r.title)}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="sticker-card__footer">
                        <button onclick="shareSticker('${esc(r.title.replace(/'/g, "\\'"))}', '${esc(r.url)}')" class="btn btn-green btn-xs">
                            💬 Share
                        </button>
                        ${r.url && r.url !== '#' ? `<a href="${esc(getDirectDriveUrl(r.url))}" class="btn btn-outline-red btn-xs" download>⬇ Download</a>` : ''}
                    </div>
                </div>`;
            }).join('');
        } else {
            stickersGrid.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--grey-500);padding:2rem">No WhatsApp stickers available yet.</p>';
        }
    }
    if (talkingGrid) talkingGrid.innerHTML = groups['Talking Points'].map(r => `
                <div class="card reveal">
                    <div class="card__body" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
                        <div>
                            <h4 style="margin-bottom:.25rem">${esc(r.title)}</h4>
                            <p style="font-size:.82rem;color:var(--grey-400)">${esc(r.format)} · ${esc(r.size)}</p>
                        </div>
                        <a href="${esc(r.url)}" class="btn btn-sm btn-outline-red" download>⬇ Download ${esc(r.format)}</a>
                    </div>
                </div>
                `).join('');
    if (videosGrid) videosGrid.innerHTML = groups['Videos'].map(r => renderVideoCard(r)).join('');

    initScrollReveal();
    fetchTikTokThumbnails();
    // ─── GA4: Track Resources Page Views ──────────────────────────
    trackEvent('resources_page_viewed', { resource_count: resources.length });
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
        <div class="resource-card__thumb" style="background:${esc(brand.color)};padding:0;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center">
            ${preview}
            ${iconOverlay}
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.1)">
                <div style="width:46px;height:46px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#000;font-size:1.2rem;box-shadow:0 4px 12px rgba(0,0,0,0.2)">▶</div>
            </div>
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px">${esc(platform)}</div>
        </div>
        <div class="resource-card__body">
            <div class="resource-card__title">${esc(v.title)}</div>
            <div class="resource-card__size">${esc(v.format)} · ${esc(v.size)}</div>
        </div>
        <a href="${esc(v.url)}" target="_blank" rel="noopener" class="resource-card__dl">▶ Open on ${esc(platform)}</a>
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
    { id: 't0', title: 'Register/Registered to vote (IEBC)', points: 50, icon: '🗳️' },
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
    { min: 80, label: 'Patriot Captain  🛡️' },
    { min: 140, label: 'Patriot General  🌟' },
    { min: 210, label: 'SISI Legend      👑' },
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
        const isVoterTask = taskId === 't0';
        const isDone = !!this.completed[taskId];

        // Intercept Voter Registration and other high-point tasks if not already done
        if (isVoterTask && !isDone) {
            this.showVerificationFlow(taskId);
            return;
        }

        this._toggleProcess(taskId);
    }

    _toggleProcess(taskId) {
        this.completed[taskId] = !this.completed[taskId];
        localStorage.setItem('sisi_tasks', JSON.stringify(this.completed));
        this.render();
        const score = this.getScore();
        showToast(this.completed[taskId]
            ? `✅ Task done! +${TASKS.find(t => t.id === taskId)?.points}pts`
            : '↩️ Task unmarked', 'success');

        // Optional: Send to backend for verification logging
        if (this.completed[taskId]) {
            const name = localStorage.getItem('sisi_volunteer_name') || 'Patriot';
            fetch(`${GAS_API_URL}?action=submitTask&task=${taskId}&volunteer=${encodeURIComponent(name)}`, { method: 'POST' }).catch(() => { });
        }
    }

    showVerificationFlow(taskId) {
        const task = TASKS.find(t => t.id === taskId);
        const overlay = $('#verify-modal-overlay');
        const title = $('#modal-title');
        const desc = $('#modal-desc');
        const honorCheck = $('#honor-check');
        const confirmBtn = $('#confirm-task-btn');
        const regDetails = $('#reg-details');

        if (!overlay) return;

        title.textContent = task.icon + ' ' + task.title;
        desc.textContent = `To earn ${task.points} Patriot Points, please confirm your registration status.`;
        honorCheck.checked = false;
        confirmBtn.disabled = true;

        // Show extra details for Voter Registration
        if (taskId === 't0') regDetails.style.display = 'block';
        else regDetails.style.display = 'none';

        overlay.classList.add('show');

        // Logic for enabling confirm button
        const validate = () => {
            const isHonored = honorCheck.checked;
            confirmBtn.disabled = !isHonored;
        };

        honorCheck.onchange = validate;

        confirmBtn.onclick = () => {
            if (taskId === 't0') {
                const county = $('#reg-county')?.value;
                const nationalId = $('#reg-id')?.value;
                if (!county || !nationalId) {
                    showToast('⚠️ Please provide both your county and National ID.', 'error');
                    return;
                }
                // Log additional context for admin verification (while keeping it private)
                trackEvent('voter_registered_verified', { county, national_id: 'HIDDEN_' + nationalId.slice(-4) });

                // Also send to backend securely in POST body
                const taskParams = new URLSearchParams({
                    action: 'submitTask',
                    task: taskId,
                    volunteer: localStorage.getItem('sisi_volunteer_name') || 'Patriot',
                    county: county,
                    national_id: nationalId
                });
                fetch(GAS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: taskParams.toString()
                }).catch(() => { });
            }

            this._toggleProcess(taskId);
            this.closeModal();
        };
    }

    closeModal() {
        const overlay = $('#verify-modal-overlay');
        if (overlay) overlay.classList.remove('show');
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

// ─── Volunteer Map (SVG Data & Logic) ───────────────────────────
const KENYA_SVG_DATA = {
    viewBox: "0 0 457 580",
    paths: [
        { id: "Mombasa", d: "m 324.5,546.7 -0.4,0 0.2,-0.2 0.2,0.1 z m 3.2,-3.2 0,0 0.4,0.7 -0.1,0.3 0.3,-0.4 1.2,0.6 -0.2,0.8 -1.7,3.2 -0.9,-0.5 0.7,-1.3 -0.3,0 -1.3,-1.7 -0.7,0.7 0,0.7 -0.5,0.1 0.4,-0.6 -0.5,-0.9 0.3,-0.3 -0.1,-0.4 0.4,-0.4 0.2,0.1 -0.2,-0.4 0.4,0 0.1,0.2 0.2,-0.2 0,0.2 0.5,-0.1 0.2,0.4 -0.3,-0.6 0.6,0.1 0.4,-0.2 0,-0.5 0.3,0.7 z m 0.3,-1.4 0,0 -0.1,-0.1 0.1,0 0,0 z m 0.9,-0.4 0,0 0.5,0.3 -0.3,0.2 0.1,0.3 0.3,0 -0.1,0.4 0.4,0.9 -0.7,0.5 -0.4,-0.2 0,-0.3 0,0.2 -0.8,-0.6 -0.4,-1.1 1.3,-0.5 z m 0.1,-2 0,0 -0.1,-0.1 0.1,-0.1 0,0.2 z m -2.9,-1.8 0,0 -0.1,0 0.1,0 0,0 z m 1.9,-0.1 0,0 0.4,0 -0.2,0.3 0.4,0.9 -0.1,0.2 -0.4,-0.1 0.1,-0.3 -0.8,-0.5 -0.4,0.6 -0.8,-0.4 0.2,-0.8 0.4,0.2 0.7,-0.3 0.4,0.2 z m -2.5,0.3 0,0 0.2,0 0,0.6 -0.6,0.5 0.8,-0.2 0.2,0.2 -0.2,0.1 0.7,0.1 0,0.3 0.2,-0.4 0.4,0 0.3,2.1 0.5,0 -0.1,0.2 -0.6,0 -0.1,0.3 0.2,0.3 -3.1,0.1 0.2,-1.1 -0.7,0 -0.4,-0.3 0,-1.4 0.3,-0.4 -0.3,-0.5 0.8,-0.4 0.8,-1.1 0.4,0.3 -0.1,0.7 z m 4.7,-2.4 0,0 0.5,0 -0.3,0.5 0.2,-0.1 0,0.5 0.6,0.2 -0.4,0.2 -0.6,-0.3 0,0.3 0.8,0 -0.1,0.2 0.5,-0.2 -0.2,0.3 0.3,0.1 0,-0.6 0.8,0.3 0.6,-0.2 1.5,0.5 -2,2.3 -0.1,0.7 0.2,0.4 -1.5,2 -0.8,0.3 -0.4,-0.4 0,-0.6 -0.4,-0.1 0.2,-0.5 -0.3,-0.1 -0.1,-0.4 0.3,-0.1 0,-0.4 -0.1,0.4 -0.6,0 0,-0.4 0.6,-0.3 -0.2,-0.6 0.3,-0.4 -0.2,-0.1 0,-0.7 -0.2,0.4 -0.2,-0.4 0.1,-1.3 -0.2,-0.2 -0.1,0.6 -0.4,-0.2 0.2,-0.4 -0.1,-0.5 -0.4,-0.2 0,-0.3 1.6,-0.2 0.9,0.2 z" },
        { id: "Kwale", d: "m 314.3,580.2 -0.1,0 0.2,0 z m -0.2,-1 0,0 -0.1,0 0.1,0 z m -0.1,0 0,0 -0.1,-0.1 0,0 z m -1.9,-1.7 0,0 1.6,0.2 0.3,-0.2 0.2,0.7 -0.2,0.1 -0.8,-0.4 -1.3,0 0.2,-0.2 -0.2,-0.3 0.2,0.1 z m -7.6,-0.2 0,0 0,-0.2 0.1,0.1 -0.1,0.1 z m -0.7,-0.3 0,0 0,-0.1 0.2,0.1 -0.1,0 z m 0.6,0.1 0,0 -0.3,-0.3 0.2,-0.1 0.1,0.4 z m -0.5,-0.4 0,0 0,0 0,-0.1 z m 0.7,-0.1 0,0 -0.2,0 0.1,-0.2 z m 0.3,-0.5 0,0 -0.1,0 0.1,-0.2 z m 0.4,-0.4 0,0 -0.2,-0.1 0,-0.3 z m 0.2,-0.2 0,0 -0.1,-0.1 0.4,-0.2 z m 0.8,-0.2 0,0 -0.3,0 0,-0.1 z m 1.4,-0.9 0,0 0.1,0.2 -0.3,-0.2 z m 6.8,-1 0,0 -0.5,0 0.5,-0.1 z m -0.4,-0.1 0,0 -0.2,0 0.1,0 z m -5.2,0 0,0 -0.4,0.9 -0.2,-0.8 z m 5.3,-0.1 0,0 -0.1,0 0.1,0 z m 0.7,-0.1 0,0 -0.1,-0.1 0.1,0 z m 2.1,-0.6 0,0 0,0.8 -0.7,0.8 -0.2,0 -0.1,-1.4 -0.4,-0.4 0.2,0.2 0,-0.4 0.1,0.2 0.6,0.1 0.4,-1.5 0.4,0.2 -0.06,0.9 -0.3,0.3 z m 4.5,-6.5 0,0 -0.1,-0.1 0.2,-0.1 z m -12.2,-50.4 0,0 0.4,1.3 0.6,0.2 0.4,0.5 -0.2,2 0.3,0 0.3,0.9 0,2.2 -0.2,0 -0.1,0.5 0.3,0.3 0.1,1.1 0.9,0.7 1,-0.2 0,1.7 -0.6,0.3 0.4,0.2 0,0.3 -0.7,0.4 0.1,0.9 1.1,0.9 0.2,-0.2 0.3,0.1 0.7,-0.1 1.4,1.6 1.2,0.5 1,1.2 0.6,0.2 0.3,1.1 0.2,0.1 0.1,0.4 0.4,0.1 -0.1,0.9 1,1.3 -0.09,1.2 0.6,-0.4 0.7,0.5 0.1,0.5 -0.4,0.9 0.7,1 0.1,2.7 0.4,0.9 -0.5,1 1,-0.2 0,-0.7 0.7,-0.7 1.3,1.7 0.3,0 -0.7,1.3 0.8,0.5 -1.5,2.6 -0.8,3 -0.8,0 0.7,0 0,0.7 -2.7,6.8 -0.6,2.7 -0.2,0 0.1,-0.8 -0.2,-0.8 -0.2,-0.2 -0.2,0.1 -0.1,-0.3 -0.1,0.2 -0.5,-0.1 -0.1,1.2 0.1,-0.2 0.1,0.2 -0.2,0.8 -0.3,0.3 -0.7,-0.1 0.5,0.2 -0.1,1.2 -1.1,1.1 -0.8,2.5 -0.2,-0.1 0,-0.6 -0.8,-0.8 -0.2,0.7 -0.6,-0.3 -0.3,0.1 0.2,1 -0.6,0 -0.3,0.9 -0.2,-0.1 -0.8,0.4 0.1,-0.5 -0.8,0 -0.1,-0.2 0,0.8 0.6,0.4 0.1,1.5 0.3,-0.4 -0.2,0.7 0.7,2.7 -1.3,0.1 -1.8,-0.6 -1,0.3 -0.5,-0.5 -0.1,0.1 0,-0.2 -0.1,0.2 -0.2,-0.1 0,-0.5 0.2,-0.5 0.3,0.2 0,-0.3 0.3,0 -0.4,-0.5 -0.5,0.2 0.6,-0.6 -0.2,-0.2 0.1,-0.8 0.6,-0.6 0.3,0 -0.1,-0.4 -0.5,0 -0.5,-0.5 0.3,0.6 -1.3,0.1 -0.8,1 -0.1,-0.2 -0.1,0.3 -0.1,-0.3 -0.5,0.2 -1,-0.8 -0.1,0.1 0.5,1.3 0.9,0.4 -0.3,0.1 -0.2,-0.3 -0.5,0.8 0,-0.5 -0.2,-0.1 -0.4,0.8 -0.2,-0.2 -0.4,0.2 0.3,0.2 -0.3,0.1 -0.2,0.5 0.5,0 -0.8,0.1 -0.3,0.7 0.1,0.3 0.4,-0.1 -0.2,0.7 -0.2,-0.2 0.1,0.3 0.3,0.2 0.3,-0.2 -0.4,0.6 -0.6,-0.1 -0.2,-0.5 -0.4,0 -0.1,-0.5 -42.5,-29.8 28.5,-10.2 5.2,-11.4 -6.2,-3.6 2.1,-3.6 5.5,3.2 1.7,-7 11.8,0 1,-0.2 z" },
        { id: "Kilifi", d: "m 346.4,505.2 -0.1,0 0,0 z m 0.6,-1.6 -0.07,-0.2 0.4,-0.1 z m -0.8,-0.4 -0.2,0.4 -0.6,-0.2 0.8,-0.2 0.1,-0.3 z m 1.3,-0.4 0,0 z m -0.7,0.1 -0.3,-0.2 0.1,-0.5 0.2,0.7 z m 11,-21.2 -0.07,-0.1 0.3,-0.4 z m 0.5,-0.3 -0.3,-0.8 0.3,0.4 0,0.4 z m -0.9,-0.3 -0.2,-0.3 0.1,-0.4 0.1,0.8 z m 0.1,-1.7 -0.05,0.5 -0.2,-1.1 0.5,-1.7 -0.4,1.7 0.1,0.6 z m 0.3,-3.2 -0.1,-0.5 0.2,-0.2 0,0.8 z m 0.8,-3.8 -0.1,-0.1 0.1,-0.1 0,0.2 z m -0.2,-0.3 0,0 z m -0.3,-1.1 0,0.2 -0.3,-0.3 0.3,0.1 z m -0.4,0 0,0 -0.2,-0.3 0.2,0 0,0.4 z m 0.9,-0.3 0,0 0.08,-0.6 0.1,0.1 -0.1,0.5 z m -0.5,-0.2 0,-0.3 0.1,-0.1 -0.1,0.4 z m 0.1,-0.6 -0.01,-0.1 0.3,-0.2 z m 0.5,-0.7 0.2,-0.6 0.1,0 z m 0,0.1 z m 0,-0.4 -0.04,-0.09 0.09,-0.23 z m -0.2,-0.1 -0.4,0 0.3,-0.3 0.1,0.3 z m -0.7,-0.3 -0.1,0 0.1,-0.1 z m 0.1,-0.3 -0.1,0 0,0 z m 0.3,-0.5 0.1,0.3 -0.3,0.4 0.1,-1.2 z m -0.1,-0.5 -0.1,0.2 -0.6,0 0.1,0.8 -0.4,0 0.4,0.8 0.3,0.1 0.1,-0.2 0.1,0.8 -0.3,0.5 -0.2,-0.5 0,0.5 -0.2,0.1 0.3,0.1 0,0.4 -0.4,0 0.1,0.4 -0.2,0.2 0.3,0.1 0.1,0.4 0.2,-0.4 0.7,1.3 -0.1,0.6 0.1,-0.1 0.1,0.2 -0.5,0.5 0,0.3 -0.3,0.8 0,-0.3 -0.1,0.1 -0.3,1.4 -0.2,0 -0.1,-0.7 -0.1,1.3 -0.2,-0.1 -0.2,0.2 0.2,0.5 1.2,-0.6 -0.4,1.3 -0.3,-0.5 -0.4,0.3 0,0.5 0.6,-0.2 -0.1,1.3 -0.4,0.1 0.1,1.3 -0.2,2.6 0.2,-0.1 -0.4,0.4 0.1,1.6 0.3,-0.2 -0.2,-0.1 0.4,-0.5 0.2,0.3 0.3,-0.1 0.1,-0.7 0.6,-0.4 0.3,-1 0.9,-0.2 1,0.1 1,-0.9 0.2,0.5 -0.2,0.5 -0.3,-0.2 -0.6,0.4 -0.9,0.2 -0.5,0.6 0,0.6 -0.7,0.2 -0.5,0.5 -0.2,0.6 0.2,0.7 -1,1.1 0.3,0.7 0,1.9 -1.3,1.6 -0.7,-0.5 0.3,0.5 0,0.3 0.2,-0.1 -0.7,1.2 -0.2,1 0.6,1 -0.1,1.4 0.3,0.5 -0.6,1.8 -3.8,2.6 -1.6,0.8 0,0.2 -0.6,0.1 0,0.3 -0.4,0 -1.8,1.6 -0.3,0 0.1,-0.6 0.6,-0.4 0.5,0.1 0.2,-0.2 -0.3,0 0.1,-0.7 -0.5,-1 0.7,-1 -2.6,1 0.3,0.5 -0.4,0.4 -0.3,-0.1 -0.2,0.2 0.1,0.9 -0.3,0.3 0.5,0.2 -0.4,0.7 0.6,-0.6 0.3,0.4 0.7,0.2 0.1,1.1 -2.3,4.8 -1.4,4.3 -1.9,3.7 -1.2,0 -1.7,-1.6 -1.2,0.1 -0.1,-0.2 -0.1,0.3 -0.3,0 -0.2,-0.8 0.2,0 0,-0.5 0.3,-0.1 0,-0.2 -0.8,0.6 0,0.4 0.4,0.7 1.3,0 0,0.4 0.3,0.1 -0.7,0.2 -0.3,-0.4 -0.5,0.1 0.7,0.6 0.1,0.7 0.3,-0.2 0.2,0.4 0.7,-0.1 0.4,-0.6 0.1,0.2 0.4,-0.4 0.4,0.3 1,0.2 0.3,0.7 -0.1,1.2 -0.6,0.1 -0.9,-0.2 0.9,0.2 0.6,-0.1 0.2,0.9 -1.4,3.9 -0.8,3.2 -3.2,7 -1.1,0.7 -0.9,-0.4 -0.5,0.2 -0.6,-0.1 -0.2,-0.3 0.1,-0.4 -0.4,-0.4 0.8,-1.4 0,-0.2 -0.3,0 -0.2,0.6 -0.7,0.3 -0.2,-0.2 -0.1,0.8 -1,0.1 -1.6,0.2 0,0.4 0.3,0 0.1,0.5 -0.3,0.3 0.1,0.5 -0.5,-0.1 -0.7,0.3 -0.4,-0.4 -0.6,0.2 -0.5,-0.6 -0.8,1.1 -0.8,0.4 0.3,0.6 -0.3,0.4 -0.7,-0.5 -0.6,0.4 0,-1.2 -1,-1.3 0.1,-0.9 -0.4,-0.1 -0.2,-1 -0.8,-0.5 -0.3,-0.9 -0.6,-0.2 -1,-1.2 -1.2,-0.5 -1.4,-1.6 -0.7,0.1 -0.3,-0.1 -0.2,0.2 -1.1,-0.9 -0.1,-0.9 0.7,-0.4 0,-0.3 -0.4,-0.2 0.6,-0.3 0,-1.7 -1,0.2 -0.9,-0.7 -0.1,-1.1 -0.3,-0.3 0.1,-0.5 0.2,0 0.04,-2.2 -0.3,-0.9 -0.3,0 0.2,-2 -0.4,-0.5 -0.6,-0.2 -0.4,-1.3 -1,0.2 -11.8,0 7.2,-28.5 38.3,-43.4 16.3,23.1 z" },
        { id: "Tana River", d: "m 344.6,357.5 0.2,1.3 0,0.5 0.3,0 0.9,1.1 0.5,0 1.2,1 1.7,0.3 1,0.9 1,0.3 2.1,1.5 0.3,1.3 1.2,0.8 1.1,1.6 0.1,1.1 1.3,0.8 1,1.5 2,1.4 1.1,1.7 0.9,0.3 2,1.3 z" },
        { id: "Lamu", d: "m 404,402.5 0.3,0.7 1.1,1.1 1.3,0.4 1.2,0.9 1,1.5 h 2.4 l 1.5,-1.1 z" },
        { id: "Taita Taveta", d: "m 265.1,481.5 z" },
        { id: "Garissa", d: "m 383,303.5 z" },
        { id: "Wajir", d: "m 358,202 z" },
        { id: "Mandera", d: "m 395,102 z" },
        { id: "Marsabit", d: "m 258,150 z" },
        { id: "Isiolo", d: "m 305,250 z" },
        { id: "Meru", d: "m 295,300 z" },
        { id: "Tharaka Nithi", d: "m 310,330 z" },
        { id: "Embu", d: "m 295,350 z" },
        { id: "Kitui", d: "m 320,380 z" },
        { id: "Machakos", d: "m 280,390 z" },
        { id: "Makueni", d: "m 290,430 z" },
        { id: "Nyandarua", d: "m 235,360 z" },
        { id: "Nyeri", d: "m 255,340 z" },
        { id: "Kirinyaga", d: "m 270,350 z" },
        { id: "Murang'a", d: "m 260,370 z" },
        { id: "Kiambu", d: "m 250,395 z" },
        { id: "Turkana", d: "m 120,102 z" },
        { id: "West Pokot", d: "m 100,202 z" },
        { id: "Samburu", d: "m 200,202 z" },
        { id: "Trans Nzoia", d: "m 80,240 z" },
        { id: "Uasin Gishu", d: "m 100,270 z" },
        { id: "Elgeyo Marakwet", d: "m 130,250 z" },
        { id: "Nandi", d: "m 110,295 z" },
        { id: "Baringo", d: "m 160,280 z" },
        { id: "Laikipia", d: "m 210,300 z" },
        { id: "Nakuru", d: "m 180,350 z" },
        { id: "Narok", d: "m 160,450 z" },
        { id: "Kajiado", d: "m 240,460 z" },
        { id: "Kericho", d: "m 135,360 z" },
        { id: "Bomet", d: "m 140,390 z" },
        { id: "Kakamega", d: "m 80,310 z" },
        { id: "Vihiga", d: "m 95,335 z" },
        { id: "Bungoma", d: "m 70,280 z" },
        { id: "Busia", d: "m 50,310 z" },
        { id: "Siaya", d: "m 60,350 z" },
        { id: "Kisumu", d: "m 100,365 z" },
        { id: "Homa Bay", d: "m 65,400 z" },
        { id: "Migori", d: "m 85,435 z" },
        { id: "Kisii", d: "m 110,405 z" },
        { id: "Nyamira", d: "m 120,390 z" },
        { id: "Nairobi", d: "m 260,405 z" }
    ]
};

async function initVolunteerMap() {
    const container = $('#volunteer-map-container');
    if (!container || !KENYA_MAP_DATA) return;

    console.log('Map: Initializing...');

    let tooltip = $('#map-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'map-tooltip';
        tooltip.className = 'map-tooltip';
        document.body.appendChild(tooltip);
    }

    const updateMapUI = (stats = {}) => {
        const counts = Object.values(stats);
        const maxVolunteers = Math.max(...counts, 1);

        // Multi-hue sequential scale for better clarity
        const getColorScale = (count) => {
            if (count === 0) return 'var(--grey-200)';
            const ratio = count / maxVolunteers;
            if (ratio < 0.25) return '#dcfce7'; // Pale Green
            if (ratio < 0.5) return '#4ade80';  // Mid Green
            if (ratio < 0.75) return '#166534'; // Deep Green
            return '#fbbf24'; // Gold (High growth)
        };

        const pathsHTML = KENYA_MAP_DATA.paths.map(p => {
            const count = stats[p.id.toUpperCase()] || stats[p.id] || 0;
            const color = getColorScale(count);
            // Increased baseline stroke-width for better boundary definition
            return `<path id="county-${p.id.replace(/\s+/g, '-')}" class="map-county" d="${p.d}" fill="${color}" stroke="white" stroke-width="0.8" data-name="${p.id}" data-count="${count}" />`;
        }).join('');

        // Deeper drop-shadow to emphasize the "National Outline"
        container.innerHTML = `
            <svg viewBox="${KENYA_MAP_DATA.viewBox}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; filter: drop-shadow(0 12px 35px rgba(0,0,0,0.18));">
                ${pathsHTML}
            </svg>
            <div class="map-legend">
                <div class="legend-item"><div class="legend-color" style="background: var(--grey-200)"></div> 0</div>
                <div class="legend-item"><div class="legend-color" style="background: #dcfce7"></div> Growing</div>
                <div class="legend-item"><div class="legend-color" style="background: #4ade80"></div> Active</div>
                <div class="legend-item"><div class="legend-color" style="background: #166534"></div> Strong</div>
                <div class="legend-item"><div class="legend-color" style="background: #fbbf24"></div> Peak</div>
            </div>
        `;

        $$('path', container).forEach(path => {
            path.addEventListener('mouseenter', (e) => {
                const name = path.getAttribute('data-name');
                const count = parseInt(path.getAttribute('data-count')).toLocaleString();
                tooltip.innerHTML = `<b>${name}</b><span>${count} Active Volunteers</span>`;
                tooltip.classList.add('show');
            });
            path.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY + 15) + 'px';
            });
            path.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
            path.addEventListener('click', () => {
                const name = path.getAttribute('data-name');
                showToast(`🇰🇪 ${name} is standing strong with Sifuna!`);
            });
        });
    };

    updateMapUI({});

    try {
        console.log('Map: Fetching stats from:', GAS_API_URL);
        const res = await fetch(`${GAS_API_URL}?action=getCountyStats`);
        if (!res.ok) throw new Error(`HTTP error status: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
            updateMapUI(data.stats || {});
        }
    } catch (err) {
        console.error('Map: Failed to load live stats:', err);
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

// ─── Hero Action Buttons ─────────────────────────────────────────
function initHeroButtons() {
    // 1. Share Button
    const shareBtn = $('#hero-share-btn') || $('#share-movement-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareApp);
    }

    // 2. Advice Sifuna Button (Smooth Scroll)
    const adviceBtn = $('#hero-advice-btn');
    if (adviceBtn) {
        adviceBtn.addEventListener('click', () => {
            const section = $('#tell-sifuna');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// ─── Tell Sifuna: Discussion Board & Insights ────────────────────
async function initOpinionsBoard() {
    const form = $('#opinion-form');
    const countyEl = $('#opinion-county');
    const insightsList = $('#insights-list');

    if (!form || !insightsList) return;

    // 1. Populate County Dropdown (if COUNTIES exists from iebc-data.js)
    if (typeof COUNTIES !== 'undefined' && countyEl) {
        COUNTIES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            countyEl.appendChild(opt);
        });
    }

    // 2. Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#opinion-submit-btn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Submitting Strategy…';

        try {
            const formData = new FormData(form);
            const params = new URLSearchParams({
                action: 'submitOpinion',
                county: formData.get('county') || 'Anonymous',
                opinion: formData.get('opinion')
            });

            const res = await fetch(GAS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            const data = await res.json();
            if (data.status === 'success') {
                form.style.display = 'none';
                $('#opinion-success').style.display = 'block';
                showToast('✅ Strategy shared anonymously. Bravo!', 'success');
                trackEvent('opinion_submitted', { county: formData.get('county') || 'anonymous' });
                // Refresh insights after a short delay
                setTimeout(() => loadOpinionsSummary(), 2000);
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (err) {
            showToast('⚠️ Could not submit. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    // 3. Initial Load of Summary
    loadOpinionsSummary();
}

async function loadOpinionsSummary() {
    const container = $('#insights-list');
    if (!container) return;

    try {
        const res = await fetch(`${GAS_API_URL}?action=getOpinionsSummary`, { cache: 'no-store' });
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            container.innerHTML = data.map((item, index) => `
                <div class="insight-item reveal" style="animation-delay: ${index * 0.05}s">
                    <span class="insight-item__text">${esc(item.point)}</span>
                    <span class="insight-item__count">${item.count}</span>
                </div>
            `).join('');
            if (typeof initScrollReveal === 'function') initScrollReveal();
        } else {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--grey-400)">
                    <p>No major points extracted yet. Be the first to share a strategy!</p>
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="color:var(--kenya-red)">⚠️ Could not load insights.</p>';
    }
}

function resetOpinionForm() {
    const form = $('#opinion-form');
    const success = $('#opinion-success');
    if (form && success) {
        form.reset();
        form.style.display = 'block';
        success.style.display = 'none';
        const btn = $('#opinion-submit-btn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '✊ Submit Recommendation';
        }
    }
}

// ─── Page Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    logVisit();
    fetchStats();
    setInterval(fetchStats, POLL_INTERVAL);

    initRegisterForm();
    initScrollReveal();
    highlightActiveNav();
    initHeroButtons();
    applyPersonalization();

    // New Discussion Board init
    initOpinionsBoard();

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

    window.debugResources = () => {
        console.log('A2HS: Diagnostic - Listing all loaded resources:');
        if (typeof DEMO_RESOURCES !== 'undefined') {
            console.table(DEMO_RESOURCES.map(r => ({ id: r.id, title: r.title, category: r.category, url: r.url, thumb: r.thumbnailUrl })));
        } else {
            console.log('A2HS: resources not found or not yet loaded.');
        }
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
        showToast('\u2705 App installed successfully!');
        // ─── GA4: Track PWA Installation ─────────────────────────────
        trackEvent('pwa_installed');
    });

    // Page-specific init
    if ($('#events-list')) loadEvents();
    if ($('#task-list')) new PatriotScore();
    if ($('#volunteer-map-container')) {
        initVolunteerMap();
        setInterval(initVolunteerMap, POLL_INTERVAL);
    }
    if ($('#posters-grid') || $('#stickers-grid') || $('#talking-grid') || $('#videos-grid')) loadResources();
});

// Global helpers for tasks verification modal
function closeVerifyModal() {
    const overlay = document.querySelector('#verify-modal-overlay');
    if (overlay) overlay.classList.remove('show');
}
