'use strict';
function require(moduleName) {
    switch (moduleName) {
        case 'jquery':
            return $;
        default:
    }
}
var $ = require("jquery");
var editor;
var isFirst = true;
$(function () {
    var $serverUrlInput = $('.server-url-input');
    var $connectBtn = $('.connect-btn');
    var $records = $('.records');
    var $recordValue = $('.record-value');
    var subscribedRecords = {};
    editor = CodeMirror.fromTextArea($recordValue[0], {
        lineNumbers: true,
        mode: 'javascript'
    });
    $connectBtn.on('click', function () {
        var serverUrl = $serverUrlInput.val();
        var client = deepstream(serverUrl).login();
        client.record.listen('.*', function (match, isSubscribed, response) {
            var $recordLabel = $('<li>' + match + '</li>');
            $recordLabel.on('click', function (evt) {
                evt.stopPropagation();
                var record = client.record.getRecord(match);
                record.whenReady(function () {
                    setRecordValue(record.get());
                });
                record.subscribe(setRecordValue);
                if (subscribedRecords[match]) {
                    subscribedRecords[match].unsubscribe();
                }
                subscribedRecords[match] = record;
            });
            var $deleteButton = $('<i class="fa fa-times delete-btn" title="Delete record"></i>');
            $deleteButton.on('click', function () {
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
function setRecordValue(value) {
    editor.getDoc().setValue(JSON.stringify(value, null, '\t'));
}
//# sourceMappingURL=index.js.map