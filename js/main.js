/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager, activeManager*/

$(document).ready(function () {
	'use strict';
    
    var csInterface = new CSInterface();
    
    var userID;
    //var urlFullRegex = new RegExp(/^file:\/\/\/Volumes\/.*\/\d{6}-.*-.*\/Indigo - Job \d{6}\/\d{6}-\d{1,2}-\d{5}.{0,3}\.ai$/);
    var urlFolderRegex = new RegExp(/^file:\/\/\/Volumes\/.*\/\d{6}-.*-.*\/Indigo - Job \d{6}\/.*\.ai$/);
    var fileNameRegex = new RegExp(/^\d{6}-\d{1,2}(_\d{1,2}|)-\d{5}(_.+|)-[PJV]\d{1,2}\.(ai|pdf)$/);
    
    function init() {
        themeManager.init();
    }
    
    //send get request with identifiers to server, get notes back
    function noteGet(customer, job, item, callback) {
        $.get('http://digital:8080/noteget', {customer: customer, job: job, item: item}, function (data) {
            console.log('noteGet:success');
            //console.log(data);
            callback(data);
        }).fail(function () {
            $('#theResult').html('error');
            console.log('noteGet failed');
            $('#notifierText').text('Notes could not be retrieved from the server.');
            $('#notifier').show();
            return 'error';
        });
    }
    
    function xButton(initials, noteKind, noteID) {
        if (initials !== userID) {
            return '<button class="topcoat-button--quiet" kind="' + noteKind + '" disabled>' + initials + '</button>';
        } else {
            return '<button id="' + noteID + '" class="topcoat-button--quiet" kind="' + noteKind + '"><span>' + initials + '</span></button>';
        }
    }
    
    // refreshes tab content using new data
    function refreshTab(noteKind, dataArr) {
        console.log('refreshTab-');
        console.log('noteKind: ' + noteKind);
        if (dataArr !== 'error') {
            var rebuiltTab = '';
            var i;
            var noteCount = dataArr.length;
            for (i = 0; i < noteCount; i++) {
                rebuiltTab += '<div class="note">' + xButton(dataArr[i].author, noteKind, dataArr[i]._id);
                rebuiltTab += '<span class="noteHighlight">' + dataArr[i].date + '</span><pre>' + dataArr[i].content + '</pre></div>';
            }
            rebuiltTab += '<button id="' + noteKind + '" class="addNote topcoat-button">+</button>';
            //update tab contents:
            $('#tab' + noteKind).html('');
            $(rebuiltTab).appendTo($('#tab' + noteKind));
            //update tab name with note count
            if (noteCount > 0) {
                $('#' + noteKind + 'TabLbl').text(noteKind + ' (' + noteCount + ')');
            } else {
                $('#' + noteKind + 'TabLbl').text(noteKind);
            }
        } else {
            console.log(dataArr);
            $('#notifierText').text('The database server encountered an error.');
            $('#notifier').show();
        }
    }
    
    function setUserID(uid, storeBool) {
        userID = uid;
        $('#currentID').text(uid);
        if (storeBool) {localStorage.setItem("userid", uid); }
        console.log('User ID set to ' + uid);
        
        noteGet('CUS01', undefined, undefined, function (data) {
            refreshTab('Customer', data);
        });
        noteGet('CUS01', 98765, undefined, function (data) {
            refreshTab('Job', data);
        });
        noteGet('CUS01', 98765, 123456, function (data) {
            refreshTab('Item', data);
        });
    }
    
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
    
    // action taken when active doc changes
    function onDocActivated(event) {
        var customer, job, item;
        
        //parse info from data
        var url = decodeURIComponent($(event.data).find("url").text());
        console.log('doc activated:' + url);
        var name = $(event.data).find("name").text();
        
        if (url === '' || url === name) {
            console.log('url undefined/not saved');
            
            $('#tabCustomer').html('');
            $('Customer Notes Unavailable').appendTo($('#tabCustomer'));
            $('#tabJob').html('');
            $('Job Notes Unavailable').appendTo($('#tabJob'));
            $('#tabItem').html('');
            $('Item Notes Unavailable').appendTo($('#tabItem'));
            //reset tab counts
            $('#CustomerTabLbl').text('Customer');
            $('#JobTabLbl').text('Job');
            $('#ItemTabLbl').text('Item');
            return;
        }
        
        if (name.match(fileNameRegex)) {
            //filename matches Item format, get Job# & Item#
            console.log('url file matched!');
            job = name.substr(0, 5);
            console.log('job' + name);
            item = name.split('-', 3)[1];
            console.log('item:' + name);
        }
        
        if (url.match(urlFolderRegex)) {
            //doc url matches Job folder format, get customer# from .xml?
            console.log('url folder matched!');
            //job = 
        }
        
        
        
        
            
        if (job === undefined && item === undefined) {
            console.log('url non-standard');
            
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
    }
    
    //////////////////////////////////
    
    $('#setUserID').click(function () {
        setUserID($('#userID').val(), true);
        $('#getUserID').hide();
        $('#noteDisplay').show();
	});
    
    $('#currentID').click(function () {
        $('#noteDisplay').hide();
        $('#getUserID').show();
        $('#userID').focus();
    });
    
	$('ul.tabs li').click(function () {
        $(this).find('button').blur();
		var tab_id = $(this).attr('data-tab');
        //console.log('tab_id' + tab_id);
		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');
		$(this).addClass('current');
		$("#" + tab_id).addClass('current');
	});
    
    // format addNote ui by button pressed
    $('#noteDisplay').on('click', '.addNote', function () {
        var noteKind = this.id; // Customer, Job or Item 
        //console.log('format addNote ui by button pressed, noteKind:' + noteKind);
        $('#addNote').text('Add ' + noteKind + ' Note');
        $('#addNote').attr('kind', noteKind);
        $('#noteDisplay').hide();
        $('#newNoteUI').show();
        $('#newNote').focus();
    });
    
    // remove a note
    $('#noteDisplay').on('click', '.note button', function () {
        var noteID = this.id;
        console.log('x button clicked:' + noteID);
        
        $.get('http://digital:8080/notedelete', {id: noteID}, function (data) {
            //response should be json object of all notes for tab, or 'error'
            if (data !== 'error') {
                refreshTab($('#' + noteID).attr('kind'), data);
                closeAddNote();
            } else {
                //display error...
                console.log(data);
                $('#notifierText').text('The database server encountered an error.');
                $('#notifier').show();
            }
        }).fail(function () {
            console.log('noteDisplay failed');
            $('#notifierText').text('There was a problem deleting your note.');
            $('#notifier').show();
        });
    });

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
        
        var noteKind = $(this).attr('kind');
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
            console.log('addNote failed');
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

    
    //////////////////////////////////
    
    //themeManager:
    init();
    
    //listen for ai document activations
    csInterface.addEventListener("documentAfterActivate", onDocActivated);
    
    // get and set userID
    // info stored in localStorage, on mac: ~/library/Caches/CSXS/cep_cache
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
    
    /*
    
    csInterface.evalScript('docURL()');
    
    */
    
});