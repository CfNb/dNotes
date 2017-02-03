/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager, activeManager*/

$(document).ready(function () {
	'use strict';
    
    var csInterface = new CSInterface();
    
    function init() {
        themeManager.init();
    }
    init();
    
    function listenForActive() {
        activeManager.init();
    }
    listenForActive();
    
    var userID;
    function setUserID(uid, storeBool) {
        userID = uid;
        $('#currentID').text(uid);
        if (storeBool) {localStorage.setItem("userid", uid); }
        console.log('User ID set to ' + uid);
    }

    // info stored in localStorage
    // on mac: ~/library/Caches/CSXS/cep_cache
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("userid") === null) {
            console.log('need user ID');
            $('#noteDisplay').hide();
            $('#getUserID').show();
        } else {
            setUserID(localStorage.userid, false);
        }
    } else {
        console.log('Sorry! No Web Storage support...');
        setUserID('??', false);
    }
    
    $('#setUserID').click(function () {
        setUserID($('#userID').val(), true);
        $('#getUserID').hide();
        $('#noteDisplay').show();
	});
    
    $('#currentID').click(function () {
        $('#noteDisplay').hide();
        $('#getUserID').show();
    });
    
    
    
    //send get request with identifiers to server, get notes back
    function noteGet(customer, job, item, callback) {
        $.get('http://digital:8080/noteget', {customer: customer, job: job, item: item}, function (data) {
            console.log('noteGet:success');
            console.log(data);
            callback(data);
        }).fail(function () {
            $('#theResult').html('error');
            console.log('fail');
            return 'error';
        });
    }
    
    function xButton(initials, noteID) {
        if (initials !== userID) {
            return '<button class="topcoat-button--quiet" disabled>' + initials + '</button>';
        } else {
            return '<button id="' + noteID + '" class="topcoat-button--quiet"><span>' + initials + '</span></button>';
        }
    }
    
    // refresh tab content using new data
    function refreshTab(noteKind, dataArr) {
        if (dataArr !== 'error') {
            var rebuiltTab = '';
            var i;
            for (i = 0; i < dataArr.length; i++) {
                rebuiltTab += '<div class="note">' + xButton(dataArr[i].author, dataArr[i]._id);
                rebuiltTab += '<span class="noteHighlight">' + dataArr[i].date + '</span>' + dataArr[i].content + '</div>';
            }
            rebuiltTab += '<button id="' + noteKind + '" class="addNote topcoat-button">+</button>';
            //update tab contents:
            $('#tab' + noteKind).html('');
            $(rebuiltTab).appendTo($('#tab' + noteKind));
        } else {
            console.log(dataArr);
            $('#notifierText').text('The database server encountered an error.');
            $('#notifier').show();
        }
    }

    noteGet('CUS01', undefined, undefined, function (data) {
        refreshTab('Customer', data);
    });
    noteGet('CUS01', 98765, undefined, function (data) {
        refreshTab('Job', data);
    });
    noteGet('CUS01', 98765, 123456, function (data) {
        refreshTab('Item', data);
    });
    
    /*
    $("#send_text").click(function () {
        console.log("ok");
        var theText = $('#toSend').val();
        console.log(theText);
        $.get('http://digital:8080', {text: theText}, function (data) {
            console.log('success');
            console.log(data);
            $('#theResult').html(data);
        }).fail(function () {
            $('#theResult').html('error');
            console.log('fail');
        });
    });
    */
    
	$('ul.tabs li').click(function () {
        $(this).find('button').blur();
		var tab_id = $(this).attr('data-tab');
        console.log('tab_id' + tab_id);
		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');
		$(this).addClass('current');
		$("#" + tab_id).addClass('current');
	});
    
    // format addNote ui by button pressed
    var noteKind;
    $('#noteDisplay').on('click', '.addNote', function () {
        noteKind = this.id; // Customer, Job or Item
        $('#addNote').text('Add ' + noteKind + ' Note');
        $('#noteDisplay').hide();
        $('#newNoteUI').show();
        $('#newNote').focus();
    });
    
    $('#noteDisplay.note').on('click', 'button', function () {
        console.log('x button clicked:' + this.id);
        var noteID = "";
    });
    
    function closeNotifier() {
        $('#notifier').hide();
        $('#notifierText').text('');
    }
    
    function closeAddNote() {
        closeNotifier();
        $('#newNoteUI').hide();
        $('#noteDisplay').show();
        $('#newNote').val('');
    }

    function getDate() {
        var d = new Date();
        return d.toLocaleString();
    }

    $('#addNote').click(function () {
        closeNotifier();

        /* note info:
        customer: customer #
        job: job #, undefined for Customer Notes
        item: item #, undefined for Job Notes
        author: initials, stored in localstorage and userID var
        stage: job stage determined by file URL; GTG, Preflight, Proof #1, Job, etc.
        date: current date object, when note was created
        content: user entered text
        deleted: bool, has the note been removed, default false
        */
        
        var theCustomer = 'CUS01'; // all notes require customer
        var theJob; // Job & Item notes require job
        var theItem; // only Item notes use item

        if (noteKind === "Item") {
            theJob = 98765;
            theItem = 123456;
        } else if (noteKind === "Job") {
            theJob = 98765;
        }
        var theStage = 'Proof #1';

        $.get('http://digital:8080/notesend', {customer: theCustomer, job: theJob, item: theItem, author: userID, stage: theStage, date: getDate(), content: $('#newNote').val()}, function (data) {
            console.log(data);
            //response should be json object of all notes for tab, or 'error'
            if (data !== 'error') {
                refreshTab(noteKind, data);
                closeAddNote();
            } else {
                //display error...
                console.log(data);
                $('#notifierText').text('The database server encountered an error.');
                $('#notifier').show();
            }
        }).fail(function () {
            console.log('fail');
            $('#notifierText').text('There was a problem saving your note.');
            $('#notifier').show();
        });
    });
        
    $('#cancelAddNote').click(function () {
        closeAddNote();
    });
        
    $('#notifierClose').click(function () {
        closeNotifier();
    });

});