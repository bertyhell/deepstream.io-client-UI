'use strict';

function require(moduleName: string): any {
  switch (moduleName) {
    case 'jquery':
      return $;
    // case 'lodash':
    //   return _;
    default:
      // return (<any>window)[moduleName];
  }
}

import * as $ from 'jquery';
// import * as CodeMirror from 'codemirror';
// import * as _ from 'lodash';
declare var deepstream: any;
declare var CodeMirror: any;
let existingRecordValueEditor: any;
let newRecordValueEditor: any;
let isFirst: boolean = true;
let client: any;

let $serverUrlInput: JQuery;
let $connectBtn: JQuery;
let $records: JQuery;
let $recordValue: JQuery;
let $newRecordLabelInput: JQuery;
let $newRecordValueInput: JQuery;
let $insertBtn: JQuery;
let lastSubscribedMatch: string;
let lastSubscribedRecord: any;

$(function() {
  $serverUrlInput = $('.server-url-input');
  $connectBtn = $('#connectBtn');
  $records = $('.records');
  $recordValue = $('.record-value');
  $newRecordLabelInput = $('#newRecordLabelInput');
  $newRecordValueInput = $('#newRecordValueInput');
  $insertBtn = $('#insertBtn');

  existingRecordValueEditor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$recordValue[0], {
    lineNumbers: true,
    mode: 'javascript'
  });
  newRecordValueEditor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$newRecordValueInput[0], {
    lineNumbers: true,
    mode: 'javascript'
  });

  $connectBtn.on('click', () => {
    let serverUrl: string = $serverUrlInput.val();
    client = deepstream(serverUrl).login({}, () => {
      // login successful
      startListening();
    });
  });
});

function startListening() {
  client.record.listen('.*', (match: string, isSubscribed: boolean, response: any) => {
    console.log('match: ', match, 'isSubscribed: ', isSubscribed, 'response: ', response);
    if ($('[data="' + match + '"]').length) {
      // already added
      return;
    }
    let $recordLabel = $('<li>' + match + '</li>');
    $recordLabel.data('match', match);

    // Select record
    $recordLabel.on('click', (evt: JQueryEventObject) => {
      evt.stopPropagation();

      // Stop listening to last record
      if (lastSubscribedRecord) {
        lastSubscribedRecord.unsubscribe();
      }

      // start listening to new record
      lastSubscribedRecord = client.record.getRecord(match);
      lastSubscribedMatch = match;
      lastSubscribedRecord.whenReady(() => {
        setRecordValue(lastSubscribedRecord.get());
      });
      lastSubscribedRecord.subscribe(setRecordValue);
    });

    // Delete record
    let $deleteButton = $('<i class="fa fa-times delete-btn" title="Delete record"></i>');
    $deleteButton.on('click', () => {
      client.record.getRecord(match).delete();
      if (lastSubscribedRecord && lastSubscribedMatch === match) {
        lastSubscribedRecord.unsubscribe();
        lastSubscribedRecord = null;
        lastSubscribedMatch = null;
      }
      $recordLabel.remove();
    });

    $recordLabel.append($deleteButton);
    $records.append($recordLabel);

    if (isFirst) {
      isFirst = false;
      $recordLabel.trigger('click');
    }
  });

  $insertBtn.on('click', function() {
    let recordLabel: string = $newRecordLabelInput.val();
    let recordValue: string;
    try {
      recordValue = JSON.parse($newRecordValueInput.val());
    } catch (err) {
      console.error('Failed to parse the json for the new record: ', err);
    }

    if (recordLabel) {
      let newRecord: any = client.record.getRecord($newRecordLabelInput.val());
      newRecord.whenReady(() => {
        newRecord.set(recordValue);
      });
    }
  });
}

function setRecordValue(value: any) {
  existingRecordValueEditor.getDoc().setValue(JSON.stringify(value, null, '\t'));
}
