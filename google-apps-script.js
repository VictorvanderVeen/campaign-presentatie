const SPREADSHEET_ID = '1kxH59g-5r6iGHQf13OqjMP_nCpljKMYGGbI5sauP9Vs';
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
      if (!clientFilter || (obj.client && obj.client.toLowerCase() === clientFilter)) {
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
