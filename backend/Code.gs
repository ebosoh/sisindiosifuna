// ================================================================
// SISI NDIO SIFUNA — Google Apps Script Backend (Code.gs)
// Deploy as: Extensions → Apps Script → Deploy → Web App
// Access: Anyone (no sign-in required)
// ================================================================

// ══ CONFIGURATION ══════════════════════════════════════════════
// Paste your Google Sheet ID here after creating the sheet
const SHEET_ID        = '1SLf_iNq1XM1ORffEnOQmggvVTRfFGAp3QxD0_BUPBUg';
const VOLUNTEERS_TAB  = 'Volunteers';
const EVENTS_TAB      = 'Events';
const RESOURCES_TAB   = 'Resources';
const STATS_TAB       = 'SiteStats';
const OPINIONS_TAB    = 'Opinions';


// ══ MAIN ROUTER ═════════════════════════════════════════════════
function doGet(e) {
  const action = e.parameter.action || '';
  let result;

  try {
    switch (action) {
      case 'getCount':   result = getCount();    break;
      case 'logVisit':   result = logVisit();    break;
      case 'getEvents':  result = getEvents();   break;
      case 'getResources': result = getResources(); break;
      case 'getCountyStats': result = getCountyStats(); break;
      case 'getTikTokThumbnail': result = getTikTokThumbnail(e.parameter.url); break;
      case 'getOpinionsSummary': result = getOpinionsSummary(); break;
      default:           result = { status: 'error', message: 'Unknown action' };
    }
  } catch (err) {
    result = { status: 'error', message: err.message };
  }

  return jsonResponse(result);
}

function doPost(e) {
  const action = e.parameter.action || '';
  let result;

  try {
    switch (action) {
      case 'register':    result = registerVolunteer(e.parameter); break;
      case 'submitTask':  result = submitTask(e.parameter);        break;
      case 'submitOpinion': result = submitOpinion(e.parameter);     break;
      case 'broadcast':   result = triggerBroadcast(e.parameter);  break;
      default:            result = { status: 'error', message: 'Unknown action' };
    }
  } catch (err) {
    result = { status: 'error', message: err.message };
  }

  return jsonResponse(result);
}

// ══ HELPERS ═════════════════════════════════════════════════════
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(tabName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    initSheet(sheet, tabName);
  }
  return sheet;
}

function initSheet(sheet, tabName) {
  const headers = {
    [VOLUNTEERS_TAB]: [
      'Timestamp','Full Name','Phone','Email','WhatsApp',
      'County','Constituency','Ward','Role','IP'
    ],
    [EVENTS_TAB]: [
      'ID','Title','County','Venue','Date','Time','MapURL','Status','Description'
    ],
    [RESOURCES_TAB]: [
      'ID','Category','Title','Format','Size','Url','ThumbnailUrl','Description'
    ],
    [STATS_TAB]: [
      'Metric','Value','LastUpdated'
    ],
    [OPINIONS_TAB]: [
      'Timestamp', 'County', 'Opinion'
    ]
  };
  if (headers[tabName]) {
    sheet.appendRow(headers[tabName]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers[tabName].length)
      .setBackground('#000000')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
      
    // Seed demo data for certain tabs
    if (tabName === OPINIONS_TAB) seedDemoOpinions();
  }
}

// ══ ACTION: Get Volunteer Count + Visitor Count ══════════════════
function getCount() {
  const volSheet  = getSheet(VOLUNTEERS_TAB);
  const statSheet = getSheet(STATS_TAB);

  // Volunteer count = rows minus header
  const volunteers = Math.max(0, volSheet.getLastRow() - 1);

  // Visitor count from SiteStats
  const data = statSheet.getDataRange().getValues();
  let visitors = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'TotalVisitors') {
      visitors = parseInt(data[i][1]) || 0;
      break;
    }
  }

  return { status: 'success', volunteers, visitors };
}

// ══ ACTION: Log a visitor hit ════════════════════════════════════
function logVisit() {
  const sheet = getSheet(STATS_TAB);
  const data  = sheet.getDataRange().getValues();

  let found = false;
  let newCount = 1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'TotalVisitors') {
      newCount = (parseInt(data[i][1]) || 0) + 1;
      sheet.getRange(i + 1, 2).setValue(newCount);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow(['TotalVisitors', 1, new Date().toISOString()]);
  }

  return { status: 'success', visitors: newCount };
}

// ══ ACTION: Register Volunteer ════════════════════════════════════
function registerVolunteer(params) {
  const sheet = getSheet(VOLUNTEERS_TAB);
  // Honeypot check
  if (params.website_hp) {
    Logger.log('Bot submission blocked: ' + params.phone);
    return { status: 'error', message: 'Spam detected' };
  }

  // Basic validation
  const phone = (params.phone || '').replace(/\D/g, '');
  const nationalId = (params.national_id || '').replace(/\D/g, '');
  
  if (phone.length < 9) {
    return { status: 'error', message: 'Invalid phone number format' };
  }

  // Duplicate check — phone (col 3) and email (col 4)
  const data  = sheet.getDataRange().getValues();
  const email = (params.email || '').trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const rowPhone = String(data[i][2] || '').replace(/\s/g, '');
    const rowEmail = String(data[i][3] || '').trim().toLowerCase();

    if (phone && rowPhone === phone) {
      return { status: 'duplicate', message: 'This phone number is already registered. You may already be a volunteer!' };
    }
    if (email && rowEmail === email) {
      return { status: 'duplicate', message: 'This email address is already registered. You may already be a volunteer!' };
    }
  }

  // Sanitize helper
  const clean = (val) => String(val || '').trim().slice(0, 255);

  sheet.appendRow([
    new Date().toISOString(),
    clean(params.fullName),
    phone,
    email,
    clean(params.whatsapp) || phone,
    clean(params.county),
    clean(params.constituency),
    clean(params.ward),
    clean(params.role) || 'general',
    ''  // IP - left blank for privacy
  ]);

  // Clear map cache since a new volunteer joined
  try {
    CacheService.getScriptCache().remove('volunteer_county_stats');
  } catch (e) {
    Logger.log('Cache clear failed: ' + e.message);
  }

  return { status: 'success', result: 'success', message: 'Welcome to SISI NDIO SIFUNA!' };
}

// ══ ACTION: Get Events ════════════════════════════════════════════
function getEvents() {
  const sheet  = getSheet(EVENTS_TAB);
  const data   = sheet.getDataRange().getValues();
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const events = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // skip empty rows
    events.push({
      id:          row[0],
      title:       row[1],
      county:      row[2],
      venue:       row[3],
      date:        row[4],
      time:        row[5],
      mapUrl:      row[6],
      status:      row[7],
      description: row[8]
    });
  }

  // Sort upcoming events first (nearest to furthest), then past events (most recent to oldest)
  events.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const isPastA = dateA < today;
    const isPastB = dateB < today;
    
    if (isPastA !== isPastB) {
      return isPastA ? 1 : -1;
    }
    return isPastA ? (dateB - dateA) : (dateA - dateB);
  });
  
  return events;
}

// ══ ACTION: Get Resources ══════════════════════════════════════════
function getResources() {
  const sheet = getSheet(RESOURCES_TAB);
  const data  = sheet.getDataRange().getValues();
  const resources = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    resources.push({
      id:           row[0],
      category:     row[1],
      title:        row[2],
      format:       row[3],
      size:         row[4],
      url:          row[5],
      thumbnailUrl: row[6],
      description:  row[7]
    });
  }
  return resources;
}

// ══ ACTION: Get Volunteer Distribution by County ═══════════════
function getCountyStats() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('volunteer_county_stats');

  if (cached) {
    return JSON.parse(cached);
  }

  const sheet = getSheet(VOLUNTEERS_TAB);
  const data = sheet.getDataRange().getValues();
  const stats = {};

  // County is at Col 6 (index 5)
  for (let i = 1; i < data.length; i++) {
    const county = data[i][5];
    if (county) {
      stats[county] = (stats[county] || 0) + 1;
    }
  }

  const result = { status: 'success', stats };

  // Cache result for 300 seconds (5 minutes)
  try {
    cache.put('volunteer_county_stats', JSON.stringify(result), 300);
  } catch (e) {
    Logger.log('Caching failed: ' + e.message);
  }

  return result;
}

// ══ ACTION: Get TikTok Thumbnail (Proxy to oEmbed) ══════════════════
function getTikTokThumbnail(url) {
  if (!url) return { status: 'error', message: 'No URL provided' };
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = UrlFetchApp.fetch(oembedUrl);
    const data = JSON.parse(response.getContentText());
    return { status: 'success', thumbnail_url: data.thumbnail_url };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

// ══ ACTION: Submit Task Completion ════════════════════════════════
function submitTask(params) {
  // Future feature: log task completions server-side
  // for leaderboard and admin tracking
  Logger.log('Task submitted: ' + JSON.stringify(params));
  return { status: 'success', message: 'Task logged' };
}

// ══ ACTION: Trigger Broadcast (Twilio / WhatsApp stub) ═══════════
function triggerBroadcast(params) {
  // ── Twilio SMS stub ───────────────────────────────────────────
  // const TWILIO_SID   = PropertiesService.getScriptProperties().getProperty('TWILIO_SID');
  // const TWILIO_TOKEN = PropertiesService.getScriptProperties().getProperty('TWILIO_TOKEN');
  // const TWILIO_FROM  = PropertiesService.getScriptProperties().getProperty('TWILIO_FROM');
  //
  // const volSheet = getSheet(VOLUNTEERS_TAB);
  // const data = volSheet.getDataRange().getValues();
  // data.slice(1).forEach(row => {
  //   const phone = row[2];
  //   if (!phone) return;
  //   const payload = `account_sid=${TWILIO_SID}&From=${TWILIO_FROM}&To=${phone}&Body=${encodeURIComponent(params.message)}`;
  //   UrlFetchApp.fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
  //     method: 'post', payload, headers: {
  //       Authorization: 'Basic ' + Utilities.base64Encode(`${TWILIO_SID}:${TWILIO_TOKEN}`)
  //     }
  //   });
  // });

  Logger.log('Broadcast triggered: ' + params.message);
  return { status: 'success', message: 'Broadcast sent (stub)' };
}

// ══ SEED: Add demo events to the Events sheet ═════════════════════
// Run this function ONCE manually from the Apps Script editor to seed events
function seedDemoEvents() {
  const sheet = getSheet(EVENTS_TAB);
  const events = [
    [1,'Nairobi Uhuru Park Grand Rally','Nairobi','Uhuru Park Grounds','2026-03-14','10:00 AM','https://maps.google.com/?q=Uhuru+Park+Nairobi','confirmed','Grand opening rally'],
    [2,'Mombasa Tononoka Youth Rally','Mombasa','Tononoka Social Hall','2026-03-21','2:00 PM','https://maps.google.com/?q=Tononoka+Mombasa','confirmed','Youth-focused event'],
    [3,'Kisumu Jomo Kenyatta Grounds','Kisumu','Jomo Kenyatta Grounds','2026-03-28','11:00 AM','https://maps.google.com/?q=Kisumu+Grounds','confirmed','Nyanza region rally'],
    [4,'Nakuru Afraha Stadium Meet','Nakuru','Afraha Stadium','2026-04-04','9:00 AM','https://maps.google.com/?q=Afraha+Stadium','confirmed','Rift Valley rally'],
    [5,'Eldoret Town Centre Rally','Uasin Gishu','Eldoret Town Centre','2026-04-11','1:00 PM','https://maps.google.com/?q=Eldoret+Town','upcoming','North Rift rally'],
    [6,'Garissa County Mobilisation','Garissa','Garissa Township Centre','2026-04-18','10:00 AM','https://maps.google.com/?q=Garissa','upcoming','North Eastern rally']
  ];
  events.forEach(r => sheet.appendRow(r));
  Logger.log('Demo events seeded successfully!');
}

function seedDemoResources() {
  const sheet = getSheet(RESOURCES_TAB);
  const resources = [
    [101, 'Posters', 'Official Campaign Poster 1', 'PNG', '~55 KB', 'Poster 1.png', 'Poster 1.png', 'High-quality visibility poster'],
    [102, 'Posters', 'Official Campaign Poster 2', 'PNG', '~70 KB', 'Poster 2.png', 'Poster 2.png', 'Secondary campaign theme poster'],
    [103, 'Stickers', 'SISI NDIO SIFUNA Sticker Pack', 'WhatsApp', '18 Stickers', '#', '', 'Official WhatsApp stickers'],
    [104, 'Talking Points', 'Door-to-Door Canvassing Guide', 'PDF', '~350 KB', '#', '', 'Step-by-step guide for volunteers'],
    [105, 'Videos', 'Main Campaign Ad (30s)', 'Video', '~4 MB', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '', 'High energy campaign video'],
    [106, 'Videos', 'Youth Rally TikTok', 'Video', 'TikTok', 'https://www.tiktok.com/@user/video/123', '', 'Viral youth mobilisation video'],
    [107, 'Videos', 'Principal Message FB', 'Video', 'FB Live', 'https://www.facebook.com/watch/?v=456', '', 'Principal address to the nation']
  ];
  resources.forEach(r => sheet.appendRow(r));
  Logger.log('Demo resources seeded successfully!');
}

/**
 * ACTION: Submit Anonymous Opinion
 */
function submitOpinion(params) {
  const sheet = getSheet(OPINIONS_TAB);
  const clean = (val) => String(val || '').trim().slice(0, 5000); // 5k limit for opinions
  
  sheet.appendRow([
    new Date().toISOString(),
    clean(params.county) || 'Anonymous',
    clean(params.opinion)
  ]);
  
  return { status: 'success', message: 'Your opinion has been received. Thank you for your strategy!' };
}

/**
 * ACTION: Get Top 20 Opinions Summary (Frequency Analysis)
 */
function getOpinionsSummary() {
  const sheet = getSheet(OPINIONS_TAB);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const STOP_WORDS = null; // unused — we now show full statements

  // Collect all opinion texts (column 3, index 2)
  const opinions = [];
  for (let i = 1; i < data.length; i++) {
    const text = (data[i][2] || '').trim();
    if (text.length > 5) opinions.push(text);
  }
  if (opinions.length === 0) return [];

  // Normalize for grouping: lowercase, strip punctuation, collapse spaces
  const normalize = (t) => t.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Group opinions by their normalized text (same wording = same point)
  const groups = {};
  opinions.forEach(opinion => {
    const key = normalize(opinion);
    if (!groups[key]) {
      groups[key] = { statement: opinion, count: 0 };
    }
    groups[key].count++;
  });

  // Sort by submission count descending, take top 10
  const sorted = Object.values(groups)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalCount = sorted.reduce((sum, i) => sum + i.count, 0);

  return sorted.map(item => ({
    point: item.statement.charAt(0).toUpperCase() + item.statement.slice(1)
  }));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function seedDemoOpinions() {
  const sheet = getSheet(OPINIONS_TAB);
  if (sheet.getLastRow() > 1) return; // Only seed if empty

  const now = new Date().toISOString();
  const demo = [
    [now, 'Nairobi', 'Champion the "Niko Kadi" Movement to ensure every volunteer is registered and ready.'],
    [now, 'Mombasa', 'We must embrace Door to Door Canvassing in every ward to reach the grassroots.'],
    [now, 'Kisumu', 'Digital Mobilisation is key for 2027. Let us use social media to spread the truth.'],
    [now, 'Nairobi', 'Champion the "Niko Kadi" Movement because identity is our power.'],
    [now, 'Nakuru', 'Door to Door Canvassing will help us understand local grievances better.'],
    [now, 'Eldoret', 'Youth Empowerment should be the pillar of our economic strategy.'],
    [now, 'Kiambu', 'Digital Mobilisation training for all group admins is necessary.'],
    [now, 'Nairobi', 'Champion the "Niko Kadi" Movement in all universities.'],
    [now, 'Mombasa', 'Door to Door Canvassing in informal settlements is working well.'],
    [now, 'Bungoma', 'Food Security policies should be prioritized in our manifesto.'],
    [now, 'Nairobi', 'Champion the "Niko Kadi" Movement for 100% voter turnout.'],
    [now, 'Mombasa', 'Door to Door Canvassing should be done every weekend.'],
    [now, 'Kisumu', 'Digital Mobilisation effort needs more visual content like posters.'],
    [now, 'Nairobi', 'Champion the "Niko Kadi" Movement everywhere.'],
    [now, 'Kisumu', 'Digital Mobilisation is winning the online debate.'],
    [now, 'Nakuru', 'Door to Door Canvassing is the only way to win.'],
    [now, 'Eldoret', 'Youth Empowerment is our future.'],
    [now, 'Bungoma', 'Food Security is a right for every Kenyan.']
  ];
  
  demo.forEach(r => sheet.appendRow(r));
  Logger.log('Demo opinions seeded successfully!');
}
