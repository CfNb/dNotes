/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global window, document, CSInterface*/


/*

    Responsible for event listener monitoring active Ai document.

*/

var activeManager = (function () {
    'use strict';
    
    function init() {
        
        var csInterface = new CSInterface();
        
        function onDocActivated(event) {
            console.log('\n doc activated');
            //console.log(event.type);
            //console.log(event.EventScope);
            //console.log(event.appId);
            //console.log(event.extensionId);
            console.log(event.data);
            
            /*
            event.data=
            <documentAfterActivate>
                <url>file:///Volumes/Jobs/104491-Creative%20Instinct-Mythical%20Creatures%20Card%20Wrapper/Indigo%20-%20Job%20104491/104491-01-67572-P1.ai</url>
                <name>104491-01-67572-P1.ai</name>
                </documentAfterActivate>
            
            or if doc not saved=
            <documentAfterActivate>
                <url>Untitled-2</url>
                <name>Untitled-2</name>
            </documentAfterActivate>
            
            or if no doc open=
            <documentAfterDeactivate>
                <url/>
                <name/>
            </documentAfterDeactivate>
            */
            
            
            //csInterface.evalScript('sayHello()');
        }
        
        csInterface.addEventListener("documentAfterActivate", onDocActivated);
    }
    
    return {
        init: init
    };
    
}());