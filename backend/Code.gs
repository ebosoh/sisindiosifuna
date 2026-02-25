// ================================================================
// SISI NDIO SIFUNA — Google Apps Script Backend (Code.gs)
// Deploy as: Extensions → Apps Script → Deploy → Web App
// Access: Anyone (no sign-in required)
// ================================================================

// ══ CONFIGURATION ══════════════════════════════════════════════
// Paste your Google Sheet ID here after creating the sheet
const SHEET_ID        = 'YOUR_GOOGLE_SHEET_ID_HERE';
const VOLUNTEERS_TAB  = 'Volunteers';
const EVENTS_TAB      = 'Events';
const STATS_TAB       = 'SiteStats';

// ══ MAIN ROUTER ═════════════════════════════════════════════════
function doGet(e) {
  const action = e.parameter.action || '';
  let result;

  try {
    switch (action) {
      case 'getCount':   result = getCount();    break;
      case 'logVisit':   result = logVisit();    break;
      case 'getEvents':  result = getEvents();   break;
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
    [STATS_TAB]: [
      'Metric','Value','LastUpdated'
    ]
  };
  if (headers[tabName]) {
    sheet.appendRow(headers[tabName]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers[tabName].length)
      .setBackground('#000000')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
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

  // Duplicate check by phone number
  const data  = sheet.getDataRange().getValues();
  const phone = (params.phone || '').replace(/\s/g, '');
  for (let i = 1; i < data.length; i++) {
    if ((data[i][2] || '').replace(/\s/g, '') === phone) {
      return { status: 'duplicate', message: 'This phone number is already registered.' };
    }
  }

  sheet.appendRow([
    new Date().toISOString(),
    params.fullName    || '',
    params.phone       || '',
    params.email       || '',
    params.whatsapp    || params.phone || '',
    params.county      || '',
    params.constituency|| '',
    params.ward        || '',
    params.role        || 'general',
    ''  // IP - left blank for privacy
  ]);

  return { status: 'success', result: 'success', message: 'Welcome to SISI NDIO SIFUNA!' };
}

// ══ ACTION: Get Events ════════════════════════════════════════════
function getEvents() {
  const sheet  = getSheet(EVENTS_TAB);
  const data   = sheet.getDataRange().getValues();
  const today  = new Date();
  const events = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // skip empty rows
    const eventDate = new Date(row[4]);
    if (eventDate >= today) {
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
  }

  // Sort ascending by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return events;
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
