'use strict';
function require(moduleName) {
    switch (moduleName) {
        case 'jquery':
            return $;
        default:
    }
}
var $ = require("jquery");
var existingRecordValueEditor;
var newRecordValueEditor;
var isFirst = true;
var client;
var $serverUrlInput;
var $connectBtn;
var $records;
var $recordValue;
var $newRecordLabelInput;
var $newRecordValueInput;
var $insertBtn;
var lastSubscribedMatch;
var lastSubscribedRecord;
$(function () {
    $serverUrlInput = $('.server-url-input');
    $connectBtn = $('#connectBtn');
    $records = $('.records');
    $recordValue = $('.record-value');
    $newRecordLabelInput = $('#newRecordLabelInput');
    $newRecordValueInput = $('#newRecordValueInput');
    $insertBtn = $('#insertBtn');
    existingRecordValueEditor = CodeMirror.fromTextArea($recordValue[0], {
        lineNumbers: true,
        mode: 'javascript'
    });
    newRecordValueEditor = CodeMirror.fromTextArea($newRecordValueInput[0], {
        lineNumbers: true,
        mode: 'javascript'
    });
    $connectBtn.on('click', function () {
        var serverUrl = $serverUrlInput.val();
        client = deepstream(serverUrl).login({}, function () {
            startListening();
        });
    });
});
function startListening() {
    client.record.listen('.*', function (match, isSubscribed, response) {
        console.log('match: ', match, 'isSubscribed: ', isSubscribed, 'response: ', response);
        if ($('[data-match="' + match + '"]').length) {
            return;
        }
        var $recordLabel = $('<li>' + match + '</li>');
        $recordLabel.attr('data-match', match);
        $recordLabel.on('click', function (evt) {
            evt.stopPropagation();
            if (lastSubscribedRecord) {
                lastSubscribedRecord.unsubscribe();
            }
            lastSubscribedRecord = client.record.getRecord(match);
            lastSubscribedMatch = match;
            lastSubscribedRecord.whenReady(function () {
                setRecordValue(lastSubscribedRecord.get());
            });
            lastSubscribedRecord.subscribe(setRecordValue);
        });
        var $deleteButton = $('<i class="fa fa-times delete-btn" title="Delete record"></i>');
        $deleteButton.on('click', function () {
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
    $insertBtn.on('click', function () {
        var recordLabel = $newRecordLabelInput.val();
        var recordValue;
        try {
            recordValue = JSON.parse($newRecordValueInput.val());
        }
        catch (err) {
            console.error('Failed to parse the json for the new record: ', err);
        }
        if (recordLabel) {
            var newRecord_1 = client.record.getRecord($newRecordLabelInput.val());
            newRecord_1.whenReady(function () {
                newRecord_1.set(recordValue);
            });
        }
    });
}
function setRecordValue(value) {
    existingRecordValueEditor.getDoc().setValue(JSON.stringify(value, null, '\t'));
}
//# sourceMappingURL=index.js.map