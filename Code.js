/**
 * Get the current Sheet details
 */

Logger.log("Getting Spreadsheet");
ss = SpreadsheetApp.getActiveSpreadsheet();
sheet = ss.getSheetByName("Queue");
if (!sheet) {
  Logger.log("Queue sheet not found! Creating...");
  ss.insertSheet("Queue", 0);
  sheet = ss.getSheetByName("Queue");
  sheet.deleteRows(2, (sheet.getMaxRows() - 2));
  sheet.deleteColumns(5, (sheet.getMaxColumns() - 4));
}
tracker = ss.getSheetByName("Tracker");
if (!tracker) {
  Logger.log("Tracker sheet not found! Creating...");
  ss.insertSheet("Tracker");
  tracker = ss.getSheetByName("Tracker");
  trackerRange = tracker.getRange(1, 1, 2);
  trackerRange.setValues([["EventId"],["1"]]);
  tracker.deleteRows(2, (tracker.getMaxRows() - 2));
  tracker.deleteColumns(2, (tracker.getMaxColumns() - 1));
}
sheetOne = ss.getSheetByName("Sheet1");
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
    };
  };
  if (toDelete.length > 0) {
    var deleteCount = 0;
    var rows = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getValues();
    for (var i = 0; i < sheet.getMaxRows(); i++) {
      if (rows[i][0] != "Id") {
        for (var d = 0; d < toDelete.length; d++) {
          if (rows[i][0] == toDelete[d]) {
            var rowToDelete = i + 1 - deleteCount;
            Logger.log("Deleting row '" + rowToDelete + "'/ ID: " + toDelete[d]);
            sheet.deleteRow(rowToDelete);
            deleteCount += 1;
            break;
          };
        };
      };
    };
    Logger.log("Cleaned up " + deleteCount + " rows.");
  };
}

/**
 * Responds to a MESSAGE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {
  var idRange = tracker.getRange(2, 1);
  var nextId = idRange.getValue() + 1;
  idRange.setValue(nextId);
  sheet.appendRow([nextId, JSON.stringify(event), "No", "onMessage"]);
  Logger.log(event);
}

/**
 * Responds to a CARD_CLICKED event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onCardClick(event) {
  var idRange = tracker.getRange(2, 1);
  var nextId = idRange.getValue() + 1;
  idRange.setValue(nextId);
  sheet.appendRow([nextId, JSON.stringify(event), "No", "onCardClick"]);
  Logger.log(event);
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  var idRange = tracker.getRange(2, 1);
  var nextId = idRange.getValue() + 1;
  idRange.setValue(nextId);
  sheet.appendRow([nextId, JSON.stringify(event), "No", "onAddToSpace"]);
  Logger.log(event);
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onRemoveFromSpace(event) {
  var idRange = tracker.getRange(2, 1);
  var nextId = idRange.getValue() + 1;
  idRange.setValue(nextId);
  sheet.appendRow([nextId, JSON.stringify(event), "No", "onRemoveFromSpace"]);
  Logger.log(event);
}
