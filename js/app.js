// App logic.
window.myApp = {};

// global initialization
console.log("Global initialization");
let status = new Status();
let statusOld = null;
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
	    arrayOfNids  = convertArrayAsStrToArrayOfInt(data);
	    arrayOfNames = convertArrayAsStrToArrayOfStr(resp);
	    if (arrayOfNids.length == arrayOfNames.length) {
		for (var i=0; i<arrayOfNames.length; i++) {
		    status.updateNodeFromNidSetValue(status.currentTreeData, 
					     arrayOfNids[i], 
					     carWhat, arrayOfNames[i]);
		}
	    }
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
	    status.updateNodeFromNidAddToChildren(status.currentTreeData, infoskey, memb);
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
    if (infos) {
        infoStr = "";
        for (let [key, value] of Object.entries(infos)) {
	    if (key.toString() != 'children') {
	        infoStr = infoStr + key + ": <b>" + value + "</b>,<br>";
	    }
        }
    }

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
		    messageShow("Subtree loaded.", "OK");
		    //updateTreeAll();
		    callBackF(true, infoStr);
		});
	});
    } else {
        callBackF(false, infoStr);
    }
}


function treeCallback(key) {
    console.log("treeCallback key: " + key);
    var currentFlagIsOpen = status.updateNodeFromNidSwitchFlag(status.currentTreeData, key, 'isOpen');

    // get info
    console.log("treeCallback: getting getInfoOfNid");
    getInfoOfNid(status, key, function (rebuildAll, infoStr) {
            //console.log("treeCallback: got getInfoOfNid " + infoStr);
	    if (!status.hasSubTree(key)) {
		ons.notification.alert(infoStr); 
	    }
	    //showDetails(infoStr);
            //document.getElementById('detailsShowLabel').innerText = infoStr;
	    status.currentDetails = infoStr;

	    console.log("rebuildAll: " + rebuildAll);
	    if (rebuildAll) {
	        updateTreeAll();
	    } else {
	        var subListId ="subListIdOf" + key;
		if (currentFlagIsOpen) {
		    document.getElementById(subListId).style.display = "block";
		} else {
		    document.getElementById(subListId).style.display = "none";
		}
	        //updateTreeAll();
	    }

	});
}

function updateSubTree(level, myNode, treeData) {
    for (var i=0; i<treeData.length; i++) {
	// update list removed tappable
	var itemId = "itemid" + treeData[i].key;
	var iconName = "img/null-icon.png";
	if (status.hasSubTreeNode(treeData[i])) {
	    iconName = "img/folder-icon.png";
	}
        var taskItem = ons.createElement(
	    '<ons-list-item id="' + itemId + '">' +  
              '<div class="left">' +
                '<img class="list-item__thumbnail" src="' + iconName + '">' +
              '</div>' +
              '<ons-button onclick="treeCallback(' + treeData[i].key + ')" modifier="large--quiet" ripple>' +
                '<div align="left">' +
	          treeData[i].node_name.slice(1, -1) +    // "(" + treeData[i].key + ")" + 
                '</div>' +
	    '</ons-button>' +
            '</ons-list-item>'
        );
        //document.querySelector("tree").appendChild(taskItem);
	//https://dom.spec.whatwg.org/#interface-nonelementparentnode
        myNode.appendChild(taskItem);
	if (treeData[i].children != null && treeData[i].isOpen) {
	    var modifier = 'modifier="inset"';
	    var subListId ="subListIdOf" + treeData[i].key;
            var subList = ons.createElement(
	        '<ons-list id="' + subListId + '"' + modifier + '></ons-list>'
            );	    
            myNode.appendChild(subList);
	    updateSubTree(level+1, subList, treeData[i].children);
	}
      }
}

function updateTreeAll() {
    console.log("updateTree");
    var treeData = status.currentTreeData;
    var myNode = document.getElementById("tree");

    // clear previous tree
    while (myNode.firstChild) { myNode.removeChild(myNode.firstChild); }
    updateSubTree(0, myNode, treeData);
}

function updateLabels() {
    console.log("updateLabels");

    document.getElementById('MDSIpRestInput').value = status.serverIpMdsIpRest;
    document.getElementById('serverIpMdsplusInput').value = status.serverIpMdsplus;
    document.getElementById('treeNameInput').value = status.treeName;
    document.getElementById('detailsShowLabel').innerHTML = status.currentDetails;
}

//status.addUpdateF(updateUI);

// buttons
function connectToMdsipRestButtonClicked() {
    //console.log("connectToMdsipRestButtonClicked");
    status.serverIpMdsIpRest = document.getElementById('MDSIpRestInput').value;
    messageShow("Set MDSIP REST", "OK");
    updateLabels();
}

function connectToMdsplusButtonClicked() {
    //console.log("connectToMdsplusButtonClicked");
    status.serverIpMdsPlus = document.getElementById('serverIpMdsplusInput').value;
    messageShow("Opening connection", "WAITING");
    connection.openConnection(status, function(x) { 
	messageShow("Connected", "OK");
        //ons.notification.alert("got " + x); return x; 
	messageLogWindow(x);
	updateLabels();
    });
}

function openTreeButtonClicked() {
    //console.log("openTreeButtonClicked");
    status.treeName = document.getElementById('treeNameInput').value;
    messageShow("Opening tree", "WAITING");
    connection.openTree(status, function(x) { 
	messageShow("Tree opened", "OK");
        //ons.notification.alert("got " + x); return x; 
	updateLabels();
    });

    //document.getElementById('detailsShowLabel').innerText = "button open tree clicked";
}

function getDataButtonClicked() {
    //console.log("getDataButtonClicked");
    messageShow("Getting data ... please wait ...", "WAITING");
    //status.suspendUpdate();
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
	    //status.restoreUpdate();
	    messageShow("Data fetched.", "OK");
	    updateTreeAll();
	    return null;
	});

    });
}



//Pie chart example data. Note how there is only a single array of key-value pairs.
function exampleData() {
  return  [
	   { 
	       "label": "One",
		   "value" : 29.765957771107
		   } , 
	   { 
	       "label": "Two",
		   "value" : 0
		   } , 
	   { 
	       "label": "Three",
		   "value" : 32.807804682612
		   } , 
	   { 
	       "label": "Four",
		   "value" : 196.45946739256
		   } , 
	   { 
	       "label": "Five",
		   "value" : 0.19434030906893
		   } , 
	   { 
	       "label": "Six",
		   "value" : 98.079782601442
		   } , 
	   { 
	       "label": "Seven",
		   "value" : 13.925743130903
		   } , 
	   { 
	       "label": "Eight",
		   "value" : 5.1387322875705
		   }
	   ];
}


document.addEventListener('init', function(event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  if (page.id === 'statusPage') {
      updateLabels();
  }

  if (page.id === 'detailsPage') {
      updateLabels();	  

      // https://codepen.io/anon/pen/yeqMEJ
      nv.addGraph(function() {
	      var chart = nv.models.pieChart()
		  .x(function(d) { return d.label })
		  .y(function(d) { return d.value })
		  .showLabels(true)     //Display pie labels
		  .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
		  .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
		  .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
		  .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
		  ;

	      d3.select("#chart2 svg")
		  .datum(exampleData())
		  .transition().duration(350)
		  .call(chart);

	      return chart;
	  });


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
