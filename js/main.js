/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

$(document).ready(function () {
	'use strict';
    
    var csInterface = new CSInterface();
    
    var userID;
    //var urlFullRegex = new RegExp(/^file:\/\/\/Volumes\/.*\/\d{6}-.*-.*\/Indigo - Job \d{6}\/\d{6}-\d{1,2}-\d{5}.{0,3}\.ai$/);
    var urlFolderRegex = new RegExp(/^file:\/\/\/Volumes\/Jobs(\/[^\/]*\/|\/)\d{6}-.*-.*\/Indigo - Job \d{6}\/.*\.ai$/);
    var urlGtGFolderRegex = new RegExp(/^file:\/\/\/Volumes\/Jobs\/99999-Quotes\/G\d{4}-.*-.*\/Indigo - Job G\d{4}\/.*\.ai$/);
    var fileNameRegex = new RegExp(/^\d{6}-\d{1,2}(_\d{1,2}|)-\d{5}(_.+|)-[PJV]\d{1,2}\.(ai|pdf)$/);
    
    var name, customer, job, item, url; //current file info, set by onDocActivated
    
    var idToDelete; //note id to be deleted, set on xbutton click
    
    var custUnavailMsg = '<div class="tabdisabled"><span class="noteHighlight pad">Customer Notes Unavailable</span>';
    custUnavailMsg += 'The active file must be saved in a valid Job or GtG Folder to enable Customer Notes.</div>';
    var jobUnavailMsg = '<div class="tabdisabled"><span class="noteHighlight pad">Job Notes Unavailable</span>';
    jobUnavailMsg += 'The active file must be saved in a valid Job or GtG Folder to enable Job Notes.</div>';
    var itemUnavailMsg = '<div class="tabdisabled"><span class="noteHighlight pad">Item Notes Unavailable</span>';
    itemUnavailMsg += 'The active file must have a standard file name and be saved in a valid Job Folder to enable Item Notes.</div>';
    
    function init() {
        themeManager.init();
    }
    
    // set notes ui to unavail.
    function notesUnavailable() {
        $('#tabCustomer').html(custUnavailMsg);
        $('#tabCustomer').addClass('disabled');
        $('#CustomerTabLbl').prop('disabled', true);
        $('#tabJob').html(jobUnavailMsg);
        $('#tabJob').addClass('disabled');
        $('#JobTabLbl').prop('disabled', true);
        $('#tabItem').html(itemUnavailMsg);
        $('#tabItem').addClass('disabled');
        $('#ItemTabLbl').prop('disabled', true);
        //reset tab counts
        $('#CustomerTabLbl').text('Customer');
        $('#JobTabLbl').text('Job');
        $('#ItemTabLbl').text('Item');
    }
    
    //takes file url and returns job folder url
    function jobUrl(url) {
        var jobPath = url.substring(7, url.indexOf('/Indigo - Job'));
        //console.log(Date() + 'got substring url:' + jobPath);
        return jobPath;
    }
    
    //send get request with identifiers to server, get note array back
    function noteGet(customer, job, item, url, callback) {
        if (customer === undefined && job === undefined && item === undefined) {
            console.log(Date() + ' Notes unavailable');
            notesUnavailable();
            return 'unavailable';
        }
        
        $.post('http://digital:8080/noteget', {customer: customer, job: job, item: item, url: jobUrl(url)}, function (data) {
            if (data !== 'error - customer undefined') {
                callback(data);
            } else {
                //display error...
                console.log(Date() + ' ' + data);
                $('#notifierText').text('Database Server ' + data);
                $('#notifier').show();
            }
        }).fail(function () {
            $('#theResult').html('error');
            console.log(Date() + 'noteGet failed');
            $('#retryText').text('Notes could not be retrieved from the server.');
            $('#retry').show();
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
        //console.log(Date() + ' refreshTab - ' + noteKind);
        if (dataArr === 'unavailable') {
            return;
        }
        
        if (dataArr !== 'error') {
            var rebuiltTab = '';
            var i;
            var noteCount = dataArr.length;
            for (i = 0; i < noteCount; i++) {
                rebuiltTab += '<div class="note">';
                rebuiltTab += xButton(dataArr[i].author, noteKind, dataArr[i]._id);
                rebuiltTab += '<span class="noteHighlight">' + dataArr[i].date + '</span>';
                rebuiltTab += '<span class="noteHighlight">' + dataArr[i].filename + '</span>';
                rebuiltTab += '<pre>' + dataArr[i].content + '</pre></div>';
                rebuiltTab += '<hr />';
            }
            rebuiltTab += '<button id="' + noteKind;
            rebuiltTab += '" class="addNote topcoat-button">+</button>';
            
            switch (noteKind) {
            case 'Customer':
                rebuiltTab += '<div class="noteHighlight lrg">' + customer + '</div>';
                break;
            case 'Job':
                rebuiltTab += '<div class="noteHighlight lrg">' + job + '</div>';
                break;
            case 'Item':
                rebuiltTab += '<div class="noteHighlight lrg">' + item + '</div>';
                break;
            }
            
            //update tab contents:
            $('#tab' + noteKind).html('');
            $(rebuiltTab).appendTo($('#tab' + noteKind));
            
            //update tab name with note count
            if (noteCount > 0) {
                $('#' + noteKind + 'TabLbl').text(noteKind + ' (' + noteCount + ')');
            } else {
                $('#' + noteKind + 'TabLbl').text(noteKind);
            }
            
            $('#tab' + noteKind).removeClass('disabled');
            
        } else {
            console.log(Date() + dataArr);
            $('#notifierText').text('The database server encountered an error.');
            $('#notifier').show();
        }
    }
        
    function closeNotifier(divID) {
        $('#' + divID).hide();
        $('#' + divID + 'Text').text('');
    }
    
    function closeAddNote() {
        closeNotifier('notifier');
        $('#newNoteUI').hide();
        $('#noteDisplay').show();
        $('#newNote').val('');
    }

    function getDate() {
        var d = new Date();
        return d.toLocaleString();
    }
    
    function onDocSaved(event) {
        console.log(Date() + ' doc saved');
        console.log(event.data);
    }
    
    function onDocDeactivated(event) {
        customer = undefined;
        job = undefined;
        item = undefined;
        
        //clear notifiers
        closeNotifier('notifier');
        closeNotifier('retry');
        closeNotifier('confirmation');
        
        //cancel Add Notes
        closeAddNote();
    }
        
    // action taken when active doc changes, call passing in '' to rerun with current vars(retry)
    function onDocActivated(event) {
        
        if (event !== '') {
            //get info from active document
            url = decodeURI($(event.data).find("url").text());

            name = $(event.data).find("name").text();
        }
            
        if (url === '' || url === name) {
            notesUnavailable();
            return;
        }
        
        var getItem = false;
        var getJob = false;
        
        if (name.match(fileNameRegex)) {
            //filename matches Item format, get Job# & Item#
            job = name.substr(0, 6);
            item = name.split('-', 3)[2].substr(0, 5);
            $('#ItemTabLbl').prop('disabled', false);
            getItem = true;
        } else {
            $('#ItemTabLbl').prop('disabled', true);
            $('#tabItem').html(itemUnavailMsg);
        }
        
        var urlJob;
        if (url.match(urlFolderRegex)) {
            //doc url matches Job folder format
            var jobFolderName = url.split('/');
            jobFolderName = jobFolderName[jobFolderName.length - 3];
            
            //get job from url
            urlJob = jobFolderName.slice(0, 6);
            //console.log(Date() + ' ' + urlJob);
            
            //get customer name from url
            customer = jobFolderName.split('-')[1];
            //console.log(Date() + ' ' + customer);
            
            if (job === undefined) {
                job = urlJob;
            } else if (job !== urlJob) {
                console.log(Date() + ' job string mismatch: ' + job + 'vs' + urlJob);
                notesUnavailable();
                return;
            }
            
            getJob = true;
            $('#CustomerTabLbl').prop('disabled', false);
            $('#JobTabLbl').prop('disabled', false);
            
        } else if (url.match(urlGtGFolderRegex)) {
            //doc url matches GtG folder format
            var gtgFolder = url.split('/')[6];
            urlJob = gtgFolder.split('-')[0];
            customer = gtgFolder.split('-')[1];
            
            if (job === undefined) {
                job = urlJob;
            } else if (job !== urlJob) {
                console.log(Date() + ' job string mismatch');
                //throw error!
            }
            
            //update name with GtG# ref if needed
            if (!name.startsWith(job)) {
                name = job + ' - ' + name;
            }
            
            getJob = true;
            $('#CustomerTabLbl').prop('disabled', false);
            $('#JobTabLbl').prop('disabled', false);
        }

        // always run noteGet for customer, all undefined sets notes unavailable
        noteGet(customer, undefined, undefined, url, function (data) {
            refreshTab('Customer', data);
        });
        
        if (getJob) {
            noteGet(customer, job, undefined, url, function (data) {
                refreshTab('Job', data);
            });
        }
        
        if (getItem) {
            noteGet(customer, job, item, url, function (data) {
                refreshTab('Item', data);
            });
        }

    }
    
    function setUserID(uid, storeBool) {
        userID = uid;
        $('#currentID').text(uid);
        if (storeBool) {localStorage.setItem("userid", uid); }
        console.log(Date() + ' User ID set to ' + uid);
        
        onDocActivated('');
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
		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');
		$(this).addClass('current');
		$("#" + tab_id).addClass('current');
	});
    
    // format addNote ui by button pressed
    $('#noteDisplay').on('click', '.addNote', function () {
        var noteKind = this.id; // Customer, Job or Item 
        $('#addNote').text('Add ' + noteKind + ' Note');
        $('#addNote').attr('kind', noteKind);
        $('#noteDisplay').hide();
        $('#newNoteUI').show();
        $('#newNote').focus();
    });
    
    // remove a note
    $('#noteDisplay').on('click', '.note button', function () {
        idToDelete = this.id;
        $('#confirmationText').text('Delete this Note?');
        $('#confirmation').show();
    });
    
    $('#deny').click(function () {
        idToDelete = undefined;
        closeNotifier('confirmation');
    });
        
    $('#confirm').click(function () {
        console.log('confirmed deletion ' + idToDelete);
        $.get('http://digital:8080/notedelete', {id: idToDelete}, function (data) {
            //response should be json object of all notes for tab, or 'error'
            if (data !== 'error') {
                console.log('note deleted, refresh ' + $('#' + idToDelete).attr('kind'));
                refreshTab($('#' + idToDelete).attr('kind'), data);
            } else {
                //display error...
                console.log(Date() + ' ' + data);
                $('#notifierText').text('The database server encountered an error.');
                $('#notifier').show();
            }
            idToDelete = undefined;
            closeNotifier('confirmation');
        }).fail(function () {
            console.log('noteDisplay failed');
            $('#notifierText').text('There was a problem deleting your note.');
            $('#notifier').show();
            idToDelete = undefined;
            closeNotifier('confirmation');
        });
    });
    

    $('#addNote').click(function () {
        closeNotifier('notifier');

        /* note info:
        customer: customer #
        job: job #, undefined for Customer Notes
        item: item #, undefined for Job Notes
        author: initials, stored in localstorage and userID var
        filename: name of file at time of note, filename should reveal job stage
        date: current date object, when note was created
        content: user entered text
        deleted: bool, has the note been removed, default false
        */
        
        var noteKind = $(this).attr('kind');
        // all notes require customer
        var theJob; // Job & Item notes require job
        var theItem; // only Item notes use item

        if (noteKind === "Item") {
            theJob = job;
            theItem = item;
        } else if (noteKind === "Job") {
            theJob = job;
        }

        console.log('sending url:' + jobUrl(url));
        
        $.post('http://digital:8080/notesend', {url: jobUrl(url), customer: customer, job: theJob, item: theItem, author: userID, filename: name, date: getDate(), content: $('#newNote').val()}, function (data) {
            //response should be json object of all notes for tab, or 'error'
            if (data !== 'error - customer undefined') {
                refreshTab(noteKind, data);
                closeAddNote();
            } else {
                //display error...
                console.log(Date() + ' ' + data);
                $('#notifierText').text('Database Server ' + data);
                $('#notifier').show();
            }
        }).fail(function () {
            console.log(Date() + ' addNote failed');
            $('#notifierText').text('There was a problem saving your note.');
            $('#notifier').show();
        });
    });
        
    $('#cancelAddNote').click(function () {
        closeAddNote();
    });
        
    $('#notifierClose').click(function () {
        closeNotifier('notifier');
    });
    
    $('#retryButton').click(function () {
        console.log(Date() + ' Retry');

        closeNotifier('retry');
        
        onDocActivated('');
    });

    
    //////////////////////////////////
    
    //themeManager:
    init();
    
    //listen for ai document deactivations
    csInterface.addEventListener("documentAfterDeactivate", onDocDeactivated);
    
    //listen for ai document activations
    csInterface.addEventListener("documentAfterActivate", onDocActivated);
    
    //listen for ai document save
    //csInterface.addEventListener("documentAfterSave", onDocSaved);
    
    
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
});