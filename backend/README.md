# SISI NDIO SIFUNA — Google Apps Script Backend Setup

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **"SISI NDIO SIFUNA Database"**
3. Copy the Sheet ID from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SHEET_ID`**`/edit`

## Step 2: Set Up Apps Script

1. In the spreadsheet, click **Extensions → Apps Script**
2. Delete the default `function myFunction()` placeholder
3. Copy the entire contents of `Code.gs` (from this folder) and paste it in
4. Replace `'YOUR_GOOGLE_SHEET_ID_HERE'` on Line 8 with your actual Sheet ID

## Step 3: Seed Demo Events (Optional)

1. In the Apps Script editor, select the function `seedDemoEvents` from the dropdown
2. Click **▶ Run** — this populates 6 demo rally events into the Events sheet

## Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear ⚙️ next to "Type" and select **Web app**
3. Set:
   - **Description:** SISI NDIO SIFUNA API v1
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:  
   `https://script.google.com/macros/s/XXXXXXXX/exec`

## Step 5: Connect to the Frontend

1. Open `app.js` in the project
2. Find line 5:  
   ```js
   const GAS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
3. Replace `YOUR_SCRIPT_ID` with the actual script ID from the Web App URL

## API Reference

| Method | Action | Description |
|--------|--------|-------------|
| GET | `?action=getCount` | Returns `{ volunteers: N, visitors: N }` |
| GET | `?action=logVisit` | Increments visitor counter |
| GET | `?action=getEvents` | Returns JSON array of upcoming events |
| POST | `?action=register` | Registers a new volunteer |
| POST | `?action=broadcast` | Triggers SMS/WhatsApp broadcast (stub) |

## Google Sheet Tab Structure

| Tab Name | Purpose |
|----------|---------|
| `Volunteers` | All registered volunteer records |
| `Events` | Upcoming rally events |
| `SiteStats` | Visitor counter and other metrics |

## Twilio SMS / WhatsApp Broadcasts

To enable real SMS/WhatsApp alerts:
1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Get your Account SID, Auth Token, and sender number
3. In Apps Script editor: **Project Settings → Script Properties** → Add:
   - `TWILIO_SID` = your Account SID
   - `TWILIO_TOKEN` = your Auth Token
   - `TWILIO_FROM` = your Twilio phone number (e.g. `+12025551234`)
4. Uncomment the Twilio code in the `triggerBroadcast()` function in `Code.gs`

## Enterprise Migration Path

When volunteer numbers grow beyond Google Sheets capacity (~50k rows):
- Export Sheets data to **PostgreSQL** or **Firebase Firestore**
- Replace `Code.gs` with a **Node.js / FastAPI** server on **Google Cloud Run** or **AWS Lambda**
- The frontend `app.js` only needs the `GAS_API_URL` constant updated — zero frontend changes needed
