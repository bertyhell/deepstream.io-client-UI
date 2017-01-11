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
let editor: any;
let isFirst: boolean = true;

$(function() {
  let $serverUrlInput = $('.server-url-input');
  let $connectBtn = $('.connect-btn');
  let $records = $('.records');
  let $recordValue = $('.record-value');
  let subscribedRecords: {[recordName: string]: any} = {};

  editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$recordValue[0], {
    lineNumbers: true,
    mode: 'javascript'
  });

  $connectBtn.on('click', () => {
    let serverUrl: string = $serverUrlInput.val();
    const client = deepstream(serverUrl).login();
    client.record.listen('.*', (match: string, isSubscribed: boolean, response: any) => {
      let $recordLabel = $('<li>' + match + '</li>');
      $recordLabel.on('click', (evt: JQueryEventObject) => {
        evt.stopPropagation();
        let record = client.record.getRecord(match);
        record.whenReady(() => {
          setRecordValue(record.get());
        });
        record.subscribe(setRecordValue);
        if (subscribedRecords[match]) {
          subscribedRecords[match].unsubscribe();
        }
        subscribedRecords[match] = record;
      });

      let $deleteButton = $('<i class="fa fa-times delete-btn" title="Delete record"></i>');
      $deleteButton.on('click', () => {
        client.record.getRecord(match).delete();
        subscribedRecords[match].unsubscribe();
        $recordLabel.remove();
      });

      $recordLabel.append($deleteButton);
      $records.append($recordLabel);

      if (isFirst) {
        isFirst = false;
        $recordLabel.trigger('click');
      }
    });
  });
});

function setRecordValue(value: any) {
  editor.getDoc().setValue(JSON.stringify(value, null, '\t'));
}
