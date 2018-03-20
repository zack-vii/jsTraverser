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

function openConnection(status, connection, callBackF) {
    var expr = "connect?ip=" + status.serverIpMdsplus;
    //console.log("open Connection serverIpMdsplus: " + status.serverIpMdsplus + " expr: " + expr);
    connection.internalQuery(status, expr, function( resp ) {
	// alert( "in openConnection: Data " + data );
	status.connectionId = parseInt(resp.data);
	//this.isOpen = true;
	callBackF(resp);
    });
}

function closeConnection(status, connection, callBackF) {
    // TODO - now operation is not implemented in mdsIpRest server
    callBackF({ "status": 200, "statusText": "OK", "data": "" });
}

function treeopen(status, connection, callBackF) {
    status.expressionToEvaluate = "treeopen('" + status.treeName + "'," + status.shotNumber + ")";
    connection.evalExpr(status, status.expressionToEvaluate, function( resp ) {
        status.evaluatedExpression = resp.data;
	callBackF(resp);
    });
}



function getAllChildrenMembers(status, connection, nid, nChildren, nMembers, callBackF) {
	// callBackF will accept the array of nids
    var theRequests = [
		       "_m = getnci(getnci(" + nid + ", 'MEMBER_NIDS'), 'NID_NUMBER')",
		       "_m = getnci(getnci(" + nid + ", 'CHILDREN_NIDS'), 'NID_NUMBER')"];
    connection.evalExprMulti(status, connection, theRequests, [], function (respArray) {
	    //console.log(respArray);
	    var nidsArray = [];
	    var dataArray = respArray.map(function (resp) {return resp.data; } );
	    for (var i=0; i<dataArray.length; i++) {
		if (dataArray[i].startsWith("'%")) continue;
		var aus = convertArrayAsStrToArrayOfInt(dataArray[i]);
		nidsArray = nidsArray.concat(aus);
	    } 
	    var memb = status.convertArrayOfNidsIntToTreeData(nidsArray);
	    status.updateNodeFromNidAddToChildren(status.currentTreeData, nid, memb);
	    callBackF(nidsArray);
	});
}



function getAttribute(status, connection, nidsArray, what, callBackF) {   
    status.expressionToEvaluate = "_m = getnci(" + convertNidsArrayToNidsStr(nidsArray) + ", '" + what + "')";
    connection.evalExpr(status, status.expressionToEvaluate, function (resp) {
	    callBackF(resp);
	});
}

