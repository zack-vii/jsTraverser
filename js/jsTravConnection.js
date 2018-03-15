/* 
 * jsTraverser
 * Copyright (C) 2017 Gianluca.Moro@unipd.it
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
	this.isOpen = false;
    }

    internalQuery(status, queryStr, callBackF) {
        var url = "http://" + status.serverIpMdsIpRest + "/" + queryStr;
	//console.log("internalQuery: REQUEST: " + url);

	var time1 = Date.now();

	// do the request
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
	xhr.responseType = 'text'; 
	xhr.onload = function() {
	    var status = xhr.status;
	    //console.log(status);
	    //console.log(xhr.response);
	    //console.log("internalQuery: '"+url+"' -> " + status + " '" + xhr.response + "' (" + (Date.now() - time1) + "ms)");
	    if (status == 200) {
	        callBackF(xhr.response);
	    } else {
	        callBackF("ERROR: "+status);
	    }
	};
	xhr.send();
    }

    evalExpr(status, callBackF) {
	//console.log(status.expressionToEvaluate);
		var queryStr = "eval?expr=" + encodeURIComponent(status.expressionToEvaluate) + 
		    //var queryStr = "eval?expr=" + status.expressionToEvaluate + 
                       "&idx=" + status.connectionId;	
		//console.log(queryStr);
	this.internalQuery(status, queryStr, callBackF);
    }

    openConnection(status, callBackF) {
	var expr = "connect?ip=" + status.serverIpMdsplus;
	//console.log("open Connection serverIpMdsplus: " + status.serverIpMdsplus + " expr: " + expr);
	this.internalQuery(status, expr, function( data ) {
	    // alert( "in openConnection: Data " + data );
	    status.connectionId = parseInt(data);
	    //this.isOpen = true;
	    callBackF(data);
        });
    }

    closeConnection(status, callBackF) {
	// TODO - now operation is not implemented in mdsIpRest server
	// this.isOpen = false;
	// status.connectionId = -1;
	callBackF("data");
    }

    openTree(status, callBackF) {
	status.expressionToEvaluate = "treeopen('" + status.treeName + "',-1)";
	this.evalExpr(status, function( data ) {
            //alert( "Data: " + data );
            status.evaluatedExpression = data;
	    callBackF(data);
        });
    }

}