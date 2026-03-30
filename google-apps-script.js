/**
 * Google Apps Script — Feedback API voor Campagne Presentatie Tool
 *
 * SETUP:
 * 1. Ga naar https://script.google.com en maak een nieuw project
 * 2. Plak deze code in het script-bestand (vervang de standaardcode)
 * 3. Maak een Google Sheet aan en kopieer het Sheet-ID uit de URL
 *    (het lange stuk tussen /d/ en /edit in de URL)
 * 4. Vul het SPREADSHEET_ID hieronder in
 * 5. Klik Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Kopieer de URL en plak die in campaign.json als "feedback_url"
 *
 * De sheet krijgt automatisch headers bij het eerste gebruik.
 */

const SPREADSHEET_ID = 'VERVANG_MET_JE_SHEET_ID';
const SHEET_NAME = 'Feedback';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'timestamp',
      'client',
      'ad_id',
      'status',
      'comment',
      'reviewer_name'
    ]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * POST — Feedback opslaan
 * Body: { client, ad_id, status, comment, reviewer_name }
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    const timestamp = new Date().toISOString();
    sheet.appendRow([
      timestamp,
      data.client || '',
      data.ad_id || '',
      data.status || '',
      data.comment || '',
      data.reviewer_name || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: timestamp }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET — Alle feedback voor een client ophalen
 * Parameter: ?client=uaf
 */
function doGet(e) {
  try {
    const clientFilter = (e.parameter && e.parameter.client) ? e.parameter.client.toLowerCase() : '';
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, feedback: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows = data.slice(1);
    const feedback = [];

    rows.forEach(function(row) {
      const obj = {};
      headers.forEach(function(header, i) {
        obj[header] = row[i];
      });
      // Filter op client als meegegeven
      if (!clientFilter || (obj.client && obj.client.toLowerCase() === clientFilter)) {
        // Zorg dat timestamp een string is
        if (obj.timestamp instanceof Date) {
          obj.timestamp = obj.timestamp.toISOString();
        }
        feedback.push(obj);
      }
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, feedback: feedback }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
