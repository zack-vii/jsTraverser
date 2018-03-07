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
	//console.log("internalQuery: queryStr= " + "http://" + status.serverIpMdsIpRest + "/" + queryStr);

	var url = "http://" + status.serverIpMdsIpRest + "/" + queryStr;

	//console.log(url);

	// do the request
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function() {
	    var status = xhr.status;
	    //console.log(status);
	    if (status == 200) {
	        callBackF(xhr.response);
	    } else {
	        callBackF("ERROR");
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
	this.internalQuery(status, "connect?ip=" + status.serverIpMdsplus, function( data ) {
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