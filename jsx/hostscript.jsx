/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, app, ElementPlacement*/
'use strict';

// returns bool
function docIsOpen() {
    return app.documents.length > 0 ? 'true' : 'false';
}

