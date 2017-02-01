/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, document, CSInterface*/


/*
    Functions for retreiving, displaying, adding & removing notes
*/


//send get request with identifiers to server, get notes back
function noteGet(theKind, theID) {
    "use strict";
    $.get('http://digital:8080/noteget', {kind: theKind, id: theID}, function (data) {
        console.log('noteGet:success');
        console.log(data);
        return data;
    }).fail(function () {
        $('#theResult').html('error');
        console.log('fail');
        return 'error';
    });
}

//send get request with note info to server, get confirmation back
function noteSend(theKind, theID, theAuthor, theDate, theContent) {
    "use strict";
    $.get('http://digital:8080/notesend', {kind: theKind, id: theID, author: theAuthor, date: theDate, content: theContent}, function (data) {
        console.log('noteSend:success');
        console.log(data);
        return data;
    }).fail(function () {
        $('#theResult').html('error');
        console.log('fail');
        return 'error';
    });
}