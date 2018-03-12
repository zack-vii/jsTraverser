// App logic.
window.myApp = {};

// global initialization
console.log("Global initialization");
let status = new Status();
let connection = new Connection();

function messageLogWindow(str) {
    //document.getElementById('logWindow').innerText = str;
    console.log("messageWindow: " + str);
}

function messageShow(str, type) {
    var localStr = str;
    switch (type) {
    case "WAITING":
	localStr = "WAITING: ";
	document.getElementById('messageShowLabel').style.backgroundColor = 'red';
	break;
    case "OK":
	localStr = "READY: ";
	document.getElementById('messageShowLabel').style.backgroundColor = 'GreenYellow';
        break;
    }
    localStr = localStr + str;
    document.getElementById('messageShowLabel').innerText = localStr;
}

function completeNodeInfos(status, connection, data, what, cont) {
    console.log("completeNodeInfos IN");
    if ( ! Array.isArray(what)) {  return cont(); }
    if (what.length < 1) { return cont(); }

    // get info and continue on remaining whats
    var carWhat = what.shift();
    // now, carWhat is car(what) and what is cdr(what)

    
    //console.log(convertArrayOfIntToStr(data));
    status.expressionToEvaluate = "_m = getnci(" + data + ", '" + carWhat + "')";
    //console.log("completeNodeInfos: expressionToEvaluate: " + status.expressionToEvaluate);
    connection.evalExpr(status, function( resp ) {
            //alert( "Data: " + resp );
            status.evaluatedExpression = resp;
	    //console.log("completeNodeInfos IN got resp for data");
//console.log(data);
//console.log(resp);
		      
            carWhat = carWhat.toLowerCase();
//	    switch (carWhat) {
//		case "fullpath":
//		case "node_name":
		    arrayOfNids  = convertArrayAsStrToArrayOfInt(data);
//console.log(arrayOfNids);
		    arrayOfNames = convertArrayAsStrToArrayOfStr(resp);
		    if (arrayOfNids.length == arrayOfNames.length) {
		        for (var i=0; i<arrayOfNames.length; i++) {
		            status.updateNodeFromNid(status.currentTreeData, 
							     arrayOfNids[i], 
							     carWhat, arrayOfNames[i]);
			}
                        status.update();
		    }
//		    break;
//	    }
            completeNodeInfos(status, connection, data, what, cont);
        });
}


function mergeData(s1, s2) {
    if (s1 == "[]") return s2;
    if (s2 == "[]") return s1;
    return (s1.slice(0, -1) + "," + s2.slice(1));
}

function evaluateMultiExpr(infoskey, requests, retStr, callBackF) {
    var carRequest = requests.shift();
    status.expressionToEvaluate = carRequest;
    connection.evalExpr(status, function( data ) {
	    status.evaluatedExpression = data;
	    var memb = status.convertArrayOfNidsStrToTreeData(data);
	    status.addToChildren(status.currentTreeData, infoskey, memb);
	    retStr = mergeData(retStr, data);
	    if (requests.length > 0) {
		evaluateMultiExpr(infoskey, requests, retStr, callBackF);
	    } else {
		callBackF(retStr);
	    }
	});
}

function getInfoOfNid(status, nid, callBackF) {
    var infoStr = "NO INFO FOR " + nid;
    var infos = status.getNodeFromNid(status.currentTreeData, nid);
    
    if (infos.number_of_children + infos.number_of_members > 0 && !infos.children) {
        messageShow("Fetching subtree ... please wait", "WAITING");
        console.log("Fetching subtree ... please wait", "WAITING");

        var theRequests = [];
        if (infos.number_of_members > 0) {
            theRequests = [ "_m = getnci(getnci(" + infos.key + ", 'MEMBER_NIDS'), 'NID_NUMBER')" ];
        }
        if (infos.number_of_children > 0) {
            theRequests.push("_m = getnci(getnci(" + infos.key + ", 'CHILDREN_NIDS'), 'NID_NUMBER')");
        }

        evaluateMultiExpr(infos.key, theRequests, "[]", function (dataStr) {
		//console.log(dataStr);
		completeNodeInfos(status, connection, dataStr, Status.treeLabelsReturningArray, function (x) {
			status.update();
			messageShow("Subtree loaded.", "OK");
		    });
	    });
    }
    
    console.log(infos);
    if (infos) {
        infoStr = "";
        for (let [key, value] of Object.entries(infos)) {
            infoStr = infoStr + key + ": <b>" + value + "</b>,<br>";
        }
    }
    callBackF(infoStr);
}


function treeCallback(key) {
    console.log("treeCallback key: " + key);
    var node = status.getNodeFromNid(status.currentTreeData, key);
    isOpen = node.isOpen;
    status.updateNodeFromNid(status.currentTreeData, key, 'isOpen', !isOpen);

    // get info
    console.log("treeCallback: getting getInfoOfNid");
    getInfoOfNid(status, key, function (infoStr) {
            console.log("treeCallback: got getInfoOfNid " + infoStr);
	    //showDetails(infoStr);
            //document.getElementById('detailsShowLabel').innerText = infoStr;
	    status.currentDetails = infoStr;
	});

    status.update();
}

function updateSubTree(level, myNode, treeData) {
    var indent = ""; // new Array(level + 1).join(" -> ");
    for (var i=0; i<treeData.length; i++) {
	// update list removed tappable
        var taskItem = ons.createElement(
	    '<ons-list-item>' +  
              '<ons-button onclick="treeCallback(' + treeData[i].key + ')" modifier="large--quiet" ripple>' +
                '<div align="left">' +
                  indent + treeData[i].node_name + "(" + treeData[i].key + ")" + 
                '</div>' +
	    '</ons-button>' +
            '</ons-list-item>'
        );
        //document.querySelector("tree").appendChild(taskItem);
	//https://dom.spec.whatwg.org/#interface-nonelementparentnode
        myNode.appendChild(taskItem);
	if (treeData[i].children != null && treeData[i].isOpen) {
	    var modifier = 'modifier="inset"';
            var subList = ons.createElement(
	        '<ons-list ' + modifier + '></ons-list>'
            );	    
            myNode.appendChild(subList);
	    updateSubTree(level+1, subList, treeData[i].children);
	}
      }
}

function updateTree() {
    var treeData = status.currentTreeData;

    // clear previous tree
    var myNode = document.getElementById("tree");
    while (myNode.firstChild) {	myNode.removeChild(myNode.firstChild); }

    updateSubTree(0, myNode, treeData);
}

function updateUI() {
    console.log("updateUI");
    document.getElementById('MDSIpRestInput').value = status.serverIpMdsIpRest;
    document.getElementById('serverIpMdsplusInput').value = status.serverIpMdsplus;
    document.getElementById('treeNameInput').value = status.treeName;
    document.getElementById('detailsShowLabel').innerHTML = status.currentDetails;
    updateTree();
}

status.addUpdateF(updateUI);

// buttons
function connectToMdsipRestButtonClicked() {
    //console.log("connectToMdsipRestButtonClicked");
    status.serverIpMdsIpRest = document.getElementById('MDSIpRestInput').value;
    messageShow("Set MDSIP REST", "OK");
}

function connectToMdsplusButtonClicked() {
    //console.log("connectToMdsplusButtonClicked");
    status.serverIpMdsPlus = document.getElementById('serverIpMdsplusInput').value;
    messageShow("Opening connection", "WAITING");
    connection.openConnection(status, function(x) { 
	messageShow("Connected", "OK");
        //ons.notification.alert("got " + x); return x; 
	messageLogWindow(x);
    });
}

function openTreeButtonClicked() {
    //console.log("openTreeButtonClicked");
    status.treeName = document.getElementById('treeNameInput').value;
    messageShow("Opening tree", "WAITING");
    connection.openTree(status, function(x) { 
	messageShow("Tree opened", "OK");
        //ons.notification.alert("got " + x); return x; 
    });

    //document.getElementById('detailsShowLabel').innerText = "button open tree clicked";
}

function getDataButtonClicked() {
    //console.log("getDataButtonClicked");
    messageShow("Getting data ... please wait ...", "WAITING");
    status.expressionToEvaluate = "_m = getnci(getnci(0, 'member_nids'), 'nid_number')";
    connection.evalExpr(status, function( data ) {
        //alert( "Data: " + data );
        status.evaluatedExpression = data; // .substring(1, data.length-1).replace(/,/g, ", ");
        //messageShow("Got data.", "OK");
	//ons.notification.alert("DATA: " + data);
        //console.log(data);

        status.currentTreeData = status.convertArrayOfNidsStrToTreeData(data);
	completeNodeInfos(status, connection, data, Status.treeLabelsReturningArray, function (x) {
	    //alert("Complete DONE!");
	    messageShow("Data fetched.", "OK");
	    return null;
	});

    });
}


//ons.ready(function() {
//    status.update();
//});

document.addEventListener('init', function(event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  if (page.id === 'statusPage') {
      status.update();
  }

  if (page.id === 'detailsPage') {
      status.update();
  }


  //if (page.id === 'treePage') {
  //    for(var i=0; i<5; i++) {
  //	  // update list
  //        var taskItem = ons.createElement(
  //	    '<ons-list-item tappable><div class="center">' +
  //            'data title</div></ons-list-item>'
  //        );
  //
  //          //document.querySelector("tree").appendChild(taskItem);
  //        document.getElementById('tree').appendChild(taskItem);
  //    }
  //}

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  /*
  if (page.id === 'menuPage' || page.id === 'pendingTasksPage') {
    if (document.querySelector('#menuPage')
      && document.querySelector('#pendingTasksPage')
      && !document.querySelector('#pendingTasksPage ons-list-item')
    ) {
      myApp.services.fixtures.forEach(function(data) {
        myApp.services.tasks.create(data);
      });
    }
  }
  */

});
