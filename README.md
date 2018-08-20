# Google Apps Script Sheet MQ <!-- omit in toc -->

Google Apps Script endpoint for Hangouts Chat bot using Sheets as a message queue

This project is primarily geared towards use with PSGSuite and PoshBot in PowerShell to create a bot framework without incurring the extra costs associated with setting up and maintaining a public API endpoint or a Cloud Pub/Sub subscription.

If you have a different bot framework you'd like to use, this will work fine with it as well, assuming your chosen framework can interact with Google Sheets. Here's a quick overview of the message processing flow once setup:

1. User sends a DM to the bot or tags the bot in a Room in Google Chat
2. Google Apps Script on the Sheet backend adds the following details to the Sheet:
    1. `ID`: Tracking ID specific to the queue.
    2. `Event`: This is the actual JSON payload of the event. This includes the full details of the message, including the message text, the Space where the message was sent and who sent it
    3. `Acked`: When new messages are received, they are inserted as new rows on the sheet with this value set to `No`. During the ReceiveMessage job on the bot framework, it should iterate through the rows one by one and update this cell's value to `Yes` once acknowledged. Any rows marked as Acked will be removed from the Queue Sheet immediately.
    4. `Method`: This is the method that was called on Google Apps Script based on the message type. Current supported events are:  
        * `onMessage`: Normal message
        * `onAddToSpace`: New DM opened or Bot added to room
        * `onRemoveFromSpace`: DM closed or Bot removed from room
        * `onCardClick`: User clicked a button, image, etc on the card.

***

Bots frameworks integrating with this setup should follow the following workflow:  

* `RecieveMessage` Job polls the following Range on the Sheet for Data to get the top event row in queue: `Queue!A1:D2`
    * **Polling frequency needs be no more frequent than 1 second, otherwise you risk hitting the default rate limit for Sheets Reads**
* If a new event is found, the `ReceiveMessage` Job sends the event to the output stream and marks the row as Acked by updating cell `C2` with a value of `Yes`
* `CommandParser` parses the messages sent in the output stream from the `ReceiveMessage` job and invokes them
* Invocation results are sent back to Google Chat via `SendMessage` job

***


# How To Set Up Sheets MQ <!-- omit in toc -->

Here's how to set up Sheets MQ with your own account.

* [1. Add Sheet & Google Apps Script template to your account](#1-add-sheet--google-apps-script-template-to-your-account)
* [2. Add the `cleanupSheet` trigger to the Apps Script project](#2-add-the-cleanupsheet-trigger-to-the-apps-script-project)
* [3. Enable Sheets API for the Apps Script project](#3-enable-sheets-api-for-the-apps-script-project)

## 1. Add Sheet & Google Apps Script template to your account

You have 2 options for adding the Sheet and Google Apps Script to your account:

* [Preferred / Easiest] Make a copy of this Sheet using the following link: [Click here to make a copy of the template Sheet](https://docs.google.com/spreadsheets/d/1vH2eUGA9F7bejZ2JCSGTFgQDB8L0lu2RRC3EUnwhS3E/copy)
* [Harder / Necessary if your G Suite domain has external sharing disabled] Create a new Sheet and copy the Google Apps Script to the it.

If you are copying the Sheet using the link, proceed to the next section: [2. Add the `cleanupSheet` trigger to the Apps Script project](#2-add-the-cleanupsheet-trigger-to-the-apps-script-project)

If you need or want to do option 2, you'll need to do the following:

1. Create a new Google Sheet and open it in a new tab (if not already open).
2. In the menu bar on top of the Sheet, select `Tools > Script Editor` to open the Script Editor.
3. Clear the default code in `Code.gs`.
4. Copy the raw contents of the [`Code.js` file in this repo](https://github.com/scrthq/GoogleAppsScriptSheetMQ/blob/master/Code.js) and paste it in the Script Editor pane on the `Code.gs` file.
5. In the Script Editor's menu, select `View > Show project manifest` to show the project manifest in your file list. You should see a new file named `appsscript.json` in your Script Editor file list after.
6. Open the `appsscript.json` file in the Script Editor.
7. Copy the raw contents of the [`appsscript.json` file in this repo](https://github.com/scrthq/GoogleAppsScriptSheetMQ/blob/master/appsscript.json) and paste it in the Script Editor pane on the `appsscript.json` file.
8. Save both the `Code.gs` and `appsscript.json` files in the Script Editor.
9. Update the Apps Script project name to something meaninful/useful (i.e. `Google Chat Bot - Sheets MQ`), as this will be the name displayed to users in the event that authorization is needed.

## 2. Add the `cleanupSheet` trigger to the Apps Script project

If you copied the Sheet using the template link during the previous step, open the Script Editor by selecting `Tools > Script Editor` from the menu bar on top of the Sheet.

With the Script Editor now open, you'll need to add 1 trigger to the project so that Sheet cleanup is automated: 

1. In the Script Editor's menu, select `Edit > Current project's triggers`.
2. Click the blue link `No triggers set up. Click here to add one now.` to add a new trigger.
3. Choose the following options to build the trigger as needed:
    * Run: `cleanupSheet`
    * Events:
        1. `From spreadsheet`
        2. `On change`
4. Click the `Save` button to save the trigger.
5. You will receive a pop-up advising `Authorization required`; click the `Review Permissions` button to continue.
    * _This is to allow Apps Script to update_ 
6. Choose your Google account that owns the Sheet.
7. Click the `Allow` button to allow this Apps Script project to manage the Message Queue Sheet for you.

## 3. Enable Sheets API for the Apps Script project

Once you have the Sheet and Apps Script project code set up, you'll need to enable the Sheets API on the Apps Script project from the Google API Console:

1. In the Script Editor's menu, select `Resources > Advanced Google services`. If the `appsscript.json` file was updated correctly, you should only see the Google Sheets API switched `on` in the list.
2. On the bottom of the Advanced Google Services pop-up, click the blue link to go to the `Google API Console` for this project. This should take you to the API Dashboard for this Apps Script project.
3. At the top of the Dashboard, click the blue link to `Enable APIs and Services`
4. Search for `Sheets` and click the `Google Sheets API` to open it.
5. Click the blue `Enable` button to enable the Sheets API for your Apps Script project. You should be taken back to the API Dashboard once enabled.
6. You can close this tab and ignore the "you may need credentials" warning on top of the page as they are not needed for this project.
