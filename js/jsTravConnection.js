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

class Connection {
    constructor() {
	this.showTimingFlag = false;
    }

    internalQuery(status, queryStr, callBackF) {
	var time1 = Date.now();
        var url = "http://" + status.serverIpMdsIpRest + "/" + queryStr;
	//console.log("internalQuery: REQUEST: " + url);
	// do the request
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
	xhr.responseType = 'text'; 
	xhr.onload = function() {
	    var status = xhr.status;
	    //console.log(status);
	    //console.log(xhr.response);
	    if (this.showTimingFlag) {
	        console.log("internalQuery: '"+url+"' -> " + status + " '" + xhr.response + "' (" + (Date.now() - time1) + "ms)");
	    }
	    callBackF({ "status": xhr.status, "statusText": xhr.statusText, "data": xhr.response });
	};
	xhr.send();
    }

    evalExpr(status, expr, callBackF) {
	//console.log(status.expressionToEvaluate);
		var queryStr = "eval?expr=" + encodeURIComponent(expr) + 
		    //var queryStr = "eval?expr=" + status.expressionToEvaluate + 
                       "&idx=" + status.connectionId;	
		//console.log(queryStr);
	this.internalQuery(status, queryStr, callBackF);
    }


    evalExprMulti(status, connection, requests, retArray, callBackF) {
        status.expressionToEvaluate = requests.shift();
        this.evalExpr(status, status.expressionToEvaluate, function (resp) {
	    status.evaluatedExpression = resp.data;
	    retArray.push(resp);
	    if (requests.length > 0) {
		connection.evalExprMulti(status, connection, requests, retArray, callBackF);
	    } else {
		callBackF(retArray);
	    }
	});
    }


    openConnection(status, callBackF) {
	var expr = "connect?ip=" + status.serverIpMdsplus;
	//console.log("open Connection serverIpMdsplus: " + status.serverIpMdsplus + " expr: " + expr);
	this.internalQuery(status, expr, function( resp ) {
	    // alert( "in openConnection: Data " + data );
	    status.connectionId = parseInt(resp.data);
	    //this.isOpen = true;
	    callBackF(resp);
        });
    }

    closeConnection(status, callBackF) {
	// TODO - now operation is not implemented in mdsIpRest server
	callBackF({ "status": 200, "statusText": "OK", "data": "" });
    }

    treeopen(status, callBackF) {
	status.expressionToEvaluate = "treeopen('" + status.treeName + "',-1)";
	this.evalExpr(status, status.expressionToEvaluate, function( resp ) {
            status.evaluatedExpression = resp.data;
	    callBackF(resp);
        });
    }

    getAllChildrenMembers(nid, nChildren, nMembers, callBackF) {
	// callBackF will accept the array of nids
        var theRequests = [];
        if (nMembers > 0) {
            theRequests = [ "_m = getnci(getnci(" + nid + ", 'MEMBER_NIDS'), 'NID_NUMBER')" ];
        }
        if (nChildren > 0) {
            theRequests.push("_m = getnci(getnci(" + nid + ", 'CHILDREN_NIDS'), 'NID_NUMBER')");
        }

        this.evalExprMulti(status, this, theRequests, [], function (respArray) {
	    var nidsArray = [];
	    var dataArray = respArray.map(function (resp) {return resp.data; } );
	    for (var i=0; i<dataArray.length; i++) {
		var aus = convertArrayAsStrToArrayOfInt(dataArray[i]);
		nidsArray = nidsArray.concat(aus);
	    } 
	    var memb = status.convertArrayOfNidsIntToTreeData(nidsArray);
	    status.updateNodeFromNidAddToChildren(status.currentTreeData, nid, memb);
	    callBackF(nidsArray);
	});
    }

}