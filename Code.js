/**
 * Get the current Sheet details and format Sheet as needed
 */
Logger.log("Getting Spreadsheet");
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("Queue");
if (!sheet) {
  Logger.log("Queue sheet not found! Creating...");
  ss.insertSheet("Queue", 0);
  sheet = ss.getSheetByName("Queue");
  sheet.deleteRows(2, (sheet.getMaxRows() - 2)).deleteColumns(5, (sheet.getMaxColumns() - 4));
}
var tracker = ss.getSheetByName("Tracker");
if (!tracker) {
  Logger.log("Tracker sheet not found! Creating...");
  ss.insertSheet("Tracker");
  tracker = ss.getSheetByName("Tracker");
  var trackerRange = tracker.getRange(1, 1, 2);
  trackerRange.setValues([["EventId"],["1"]]);
  tracker.deleteRows(2, (tracker.getMaxRows() - 2)).deleteColumns(2, (tracker.getMaxColumns() - 1));
}
var sheetOne = ss.getSheetByName("Sheet1");
if (sheetOne) {
  Logger.log("Default sheet1 found! Deleting...");
  ss.deleteSheet(sheetOne);
}
if (sheet.getRange(1,2).getValue() != "Event") {
  Logger.log("Inserting new row 1 for Header");
  sheet.insertRowBefore(1);
}
else {
  Logger.log("Header row already set");
}
Logger.log("Setting Initial Queue Sheet headers");
var values = [["Id", "Event", "Acked", "Method"]];
var range = sheet.getRange("A1:D1");
range.setValues(values);

Logger.log("Setting format for Queue Header row");
range.setHorizontalAlignment("center").setFontWeight("bold");

Logger.log("Setting format for Tracker Sheet");
tracker.getRange("A1").setHorizontalAlignment("center").setFontWeight("bold");
tracker.getRange("A2").setHorizontalAlignment("center");

Logger.log("Setting Event column to auto-wrap");
sheet.getRange("B:B").setWrap(true).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

Logger.log("Setting Sheet tab colors");
sheet.setTabColor("41f4d9");
tracker.setTabColor("f4df41");

/**
 * Cleans up the Sheet and removes any Acked or empty rows
 */
function cleanupSheet() {  
  var toDelete = [];
  var rows = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getValues();
  sheet.autoResizeColumns(1, 4);
  for (var c = 0; c < sheet.getMaxRows(); c++) {
    Logger.log("Checking row: " + c);
    if (rows[c][2] == "") {
      Logger.log("Deleting EMPTY row: " + (c + 1));
      toDelete.push(rows[c][0]);
    }
    else if (rows[c][2] == "Yes") {
      Logger.log("Deleting ACKED row: " + (c + 1));
      toDelete.push(rows[c][0]);
    }
  }
  if (toDelete.length > 0) {
    var deleteCount = 0;
    rows = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getValues();
    for (var i = 0; i < sheet.getMaxRows(); i++) {
      if (rows[i][0] != "Id") {
        for (var d = 0; d < toDelete.length; d++) {
          if (rows[i][0] == toDelete[d]) {
            var rowToDelete = i + 1 - deleteCount;
            Logger.log("Deleting row '" + rowToDelete + "'/ ID: " + toDelete[d]);
            sheet.deleteRow(rowToDelete);
            deleteCount += 1;
            break;
          }
        }
      }
    }
    Logger.log("Cleaned up " + deleteCount + " rows.");
  }
}

/**
 * Adds the event to the message queue
 *
 * @param {Object} event the event object from Hangouts Chat
 * 
 * @param {String} method the method ran signifying the event
 */
function addEventToSheet(event, method) {
    Logger.log("Event token matches deployment token! Adding event to Sheets MQ");
    var idRange = tracker.getRange(2, 1);
    var nextId = idRange.getValue() + 1;
    idRange.setValue(nextId);
    sheet.appendRow([nextId, JSON.stringify(event), "No", method]);
    Logger.log(event);
}

/**
 * Responds to a MESSAGE event in Hangouts Chat.
 * 
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {
    addEventToSheet(event, "onMessage");
  }


/**
 * Responds to a CARD_CLICKED event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onCardClick(event) {
  addEventToSheet(event, "onCardClick");
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  addEventToSheet(event, "onAddToSpace");
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onRemoveFromSpace(event) {
  addEventToSheet(event, "onRemoveFromSpace");
}
