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

}