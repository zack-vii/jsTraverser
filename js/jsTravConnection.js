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
        $.get("http://" + status.serverIpMdsIpRest + "/" + queryStr, callBackF);

	//	var time1 = Date.now();
	//console.log(time1);
	//$.get("http://" + status.serverIpMdsIpRest + "/" + queryStr, function (x) {
	//	    var time2 = Date.now();
	//	    console.log(time2 - time1);
	//	    callBackF(x);});

    }

    evalExpr(status, callBackF) {
	var queryStr = "eval?expr=" + encodeURIComponent(status.expressionToEvaluate) + 
                       "&idx=" + status.connectionId;	
	this.internalQuery(status, queryStr, callBackF);
    }

    openConnection(status, callBackF) {
	this.internalQuery(status, "connect?ip=" + status.serverIpMdsplus, function( data ) {
	    // alert( "in openConnection: Data " + data );
	    status.connectionId = parseInt(data);
	    this.isOpen = true;
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