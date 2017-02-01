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
    $('.addNote').click(function () {
        var theTab = this.id;
        console.log('clicked id = ' + theTab);
        $('#addNote').text('Add ' + theTab + ' Note');
        noteKind = theTab;
        $('#noteDisplay').hide();
        $('#newNoteUI').show();
        $('#newNote').focus();
    });
    
    function closeNotifier() {
        $('#notifier').hide();
        $('#notifierText').text('');
    }
    
    //send get request with identifiers to server, get notes back
    function noteGet(theKind, theID) {
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


    
    // send entered note info to server for save
    $('#addNote').click(function () {
        console.log('clicked add note button');
        closeNotifier();
        
        
        var theIdentifier = 12345;
        var theDate = '1/12/17';
        
        $.get('http://digital:8080/notesend', {kind: noteKind, identifier: theIdentifier, author: userID, date: theDate, content: $('#newNote').val()}, function (data) {
            console.log('noteSend:success');
            console.log(data);
            $('#tab' + noteKind).html(data);
            $('#newNoteUI').hide();
            $('#noteDisplay').show();
        }).fail(function () {
            console.log('fail');
            $('#notifierText').text('There was a problem saving your note.');
            $('#notifier').show();
        });
    });
        
    $('#cancelAddNote').click(function () {
        closeNotifier();
        $('#newNoteUI').hide();
        $('#noteDisplay').show();
        $('#newNote').val('');
    });
        
    $('#notifierClose').click(function () {
        closeNotifier();
    });

});