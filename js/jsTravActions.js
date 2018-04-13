/* 
 * jsTraverser
 * Copyright (C) 2018 Gianluca.Moro@unipd.it
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function initActions(status) {
    // actions:           an array of strings
    // actionsSubactions: an array of strings
    // actionsStatus:     an array of { name: "theStatus", color: "theColor" }

    var actions = status.ACTIONS;
    var actionsSubactions = status.ACTIONS_SUBACTIONS;
    var actionsStatus = status.ACTIONS_STATUS;

    var myNode = document.getElementById("actionslist");

    //console.log(myNode.childNodes);
    while (myNode.hasChildNodes()) {
        myNode.removeChild(myNode.lastChild);
    }


    //actions.unshift(""); // add an emtpy action - a header line
    
    var width = ((100 / (actionsSubactions.length + 1))-2).toString() + "%";
    var color = actionsStatus[actionsStatus.length-1].color;

    for (var i=0; i<actions.length; i++) {
	var nm = actions[i];
	//console.log(nm);
        var item = ons.createElement(
            '<ons-list-item>' +  
                '<div align="left" style="width:' + width + '">' +
	          nm +
                '</div>' +
	    initSingleAction(status, nm, width, color) +
            '</ons-list-item>'
        );
        myNode.appendChild(item);
    }

    updateActionsGlobalStatus(status);

    // test
    //updateOnIncomingAction(status, "DEV2", "RUN", "DONE");
}

function initSingleAction(status, actionName, width, color) {
    var returnStr = "";
    var actionsSubactions = status.ACTIONS_SUBACTIONS;
    var actionsStatus = status.ACTIONS_STATUS;
    // each cell id is: actionSubactionCellOutput
    
    for (var i=0; i<actionsSubactions.length; i++) {
	returnStr = returnStr + '<div align="center" style="width:' + width + 
	    '; ' + ((actionName.length==0)?'':'background-color: ' + color + ';') + 
	    ' margin: 1px; border-style: solid; border-width: thin; border-color: black; "' +
	    ' id="' + actionName + actionsSubactions[i] + 'CellOutput' + '">' + 
	    ((actionName.length==0)?actionsSubactions[i]:' &nbsp; ') +
	    '</div>';
    }

    return returnStr;
}


function updateOnIncomingAction(status, action, subAction, actionStatus) {
    var allActionsStatusList = status.ACTIONS_STATUS;
    var cellId = action + subAction + "CellOutput";

    var foundAction = allActionsStatusList.filter(x => x.name == actionStatus);
    var color = "White";

    if (foundAction.length > 0) {
	color = foundAction[0].color;
	var myNode = document.getElementById(cellId);

	//var chk = myNode.style.backgroundColor;
	//console.log(chk);

	myNode.style.backgroundColor = color;
	updateActionsGlobalStatus(status);
    }
}

function updateActionsGlobalStatus(status) {
    var myNode = document.getElementById('actionsGlobalStatusOutput');
    var okColor = status.ACTIONS_GLOBAL_COLOR_OK.toLowerCase();

    for (var i=1; i<status.ACTIONS.length; i++) {
	for (var j=0; j<status.ACTIONS_SUBACTIONS.length; j++) {
	    var n = document.getElementById(status.ACTIONS[i] + status.ACTIONS_SUBACTIONS[j] + 'CellOutput');
	    //console.log("Comparing: 1" + n.style.backgroundColor.toLowerCase() + "1 2" +  okColor + "2");
	    //console.log(n);
	    if (n.style.backgroundColor.toLowerCase() != okColor) {
		myNode.style.backgroundColor = status.ACTIONS_GLOBAL_COLOR_KO;        
		return;
	    }
	}
    }
    myNode.style.backgroundColor = okColor;        
}