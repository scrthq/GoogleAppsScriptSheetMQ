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

1. [Add Sheet & Google Apps Script template to your account](#add-sheet--google-apps-script-template-to-your-account)
2. [Setting up permissions and sharing](#setting-up-permissions-and-sharing)

## Add Sheet & Google Apps Script template to your account

You have 2 options for adding the Sheet and Google Apps Script to your account:

* [Preferred / Easiest] Make a copy of this Sheet using the following link: [Click here to make a copy of the template Sheet](https://docs.google.com/spreadsheets/d/1vH2eUGA9F7bejZ2JCSGTFgQDB8L0lu2RRC3EUnwhS3E/copy)
* [Harder / Necessary if your G Suite domain has external sharing disabled] Create a new Sheet and copy the Google Apps Script to the it.

If you are copying the Sheet using the link, proceed to the next section: [Setting up permissions and sharing](#setting-up-permissions-and-sharing)

If you need or want to do option 2, you'll need to do the following:

1. Create a new Google Sheet


## Setting up permissions and sharing