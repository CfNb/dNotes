/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, app, ElementPlacement*/

//for formatting compelex objects to return:
#include "json2.jsx"

// returns bool
function docIsOpen() {
    return app.documents.length > 0 ? 'true' : 'false';
}

// return array with info from active document
function getURLandName() {
    var theArr = [];
    
    theArr[0] = 'file:///Volumes' + app.activeDocument.fullName.fullName;
    theArr[1] = app.activeDocument.name;
  
    //return value must be string...
    return JSON.stringify(theArr);
}
