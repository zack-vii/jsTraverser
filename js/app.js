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

// App logic.
window.myApp = {};

// global initialization
console.log("Global initialization");
let status = new Status();
let statusOld = null;
let connection = new Connection();

let wsConnection = null;

function startWebsocket(url) {
    //let wsConnection = new WebSocket('ws://192.168.55.251:8088/'); // my dummy test
    //let wsConnection = new WebSocket('ws://www1.igi.cnr.it:8088/'); // my dummy test
    //let wsConnection = new WebSocket('ws://www1.igi.cnr.it:8081/');
    let wsConnection = new WebSocket('ws://' + url);
    wsConnection.onopen = function(event) {
	//console.log("onopen");
	//document.getElementById("wsoutput").innerHTML = "OPEN";
	//document.getElementById("wsoutput").style = "background-color:LawnGreen;";
    };

    wsConnection.onerror = function(event) {
	//console.log("onerror");
	//document.getElementById("wsoutput").innerHTML = "ERROR";
	//document.getElementById("wsoutput").style = "background-color:Red;";
    };

    wsConnection.onmessage = function(event) {
	//console.log("onmessage");
	
	if (document.getElementById("wsoutput")==null)
	    return;
	str = event.data;
	theNumber = parseInt(str.match(/\d+/));
	document.getElementById("wsoutput").innerHTML = str;
	if (theNumber % 2) {
	    document.getElementById("wsoutput").style = "background-color:LawnGreen;";
	} else {
	    document.getElementById("wsoutput").style = "background-color:Red;";
	}
    };
}

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

function completeNodeInfos(status, connection, nidsArray, what, cont) {
    //console.log("completeNodeInfos IN");
    if ( ! Array.isArray(what)) {  return cont(); }
    if (what.length < 1) { return cont(); }

    var carWhat = what.shift(); // now, carWhat is car(what) and what is cdr(what)
   
    getAttribute(status, connection, nidsArray, carWhat, function (respJson) {
            //alert( "Data: " + resp );
            status.evaluatedExpression = respJson.data;      
            carWhat = carWhat.toLowerCase();

	    arrayOfNames = convertArrayAsStrToArrayOfStr(respJson.data);
	    if (nidsArray.length == arrayOfNames.length) {
		for (var i=0; i<arrayOfNames.length; i++) {
		    status.updateNodeFromNidSetValue(status.currentTreeData, 
					     nidsArray[i], 
					     carWhat, arrayOfNames[i]);

		    var ausValue = parseInt(arrayOfNames[i]);

		    switch (carWhat) {
			//case 'class':
			//if (ausValue == status.MDSPLUS_CLASS_ARRAY_DESCRIPTOR) {
			//    //console.log("SETTING IIFF class " + arrayOfNames[i]);
		        //    status.updateNodeFromNidSetValue(status.currentTreeData, 
			//		     nidsArray[i], 
			//		     'type', status.DATA_TYPE_ARRAY);
			//
			//}
			//break;
		    case 'usage':
			//console.log("SETTING IIFF class " + arrayOfNames[i]);
			status.updateNodeFromNidSetValue(status.currentTreeData, 
							 nidsArray[i], 
							 'type', 
							 status.getDataTypeFromUsage(ausValue));
			break;
		    
		    case 'number_of_children':
		    case 'number_of_members':
			if (ausValue > 0) {
		            status.updateNodeFromNidSetValue(status.currentTreeData, 
					     nidsArray[i], 
					     'type', status.DATA_TYPE_HASSUBTREE);
			}
			break;
		    }
		}
	    }
            completeNodeInfos(status, connection, nidsArray, what, cont);
        });
}


function mergeData(s1, s2) {
    if (s1 == "[]") return s2;
    if (s2 == "[]") return s1;
    //console.log("mergeData: s1=" + s1 + " s2=" + s2);
    return (s1.slice(0, -1) + "," + s2.slice(1));
}

function getInfoOfNid(status, nid, callBackF) {
    var infoStr = "NO INFO FOR " + nid;
    var infos = status.getNodeFromNid(status.currentTreeData, nid);
    if (infos) {
        infoStr = "";
        for (let [key, value] of Object.entries(infos)) {
	    if (key.toString() != 'children') {
		//if (key.toString() == 'fullpath') {
		//    value = trimQuotesSpaces(value).replace(/:/g, " : ").replace(/\./g," . ");
		//}
		value = trimQuotesSpaces(value);
	        infoStr = infoStr + '<div style="margin-left: 10px; word-break: break-all; word-wrap: break-word;">' + key + ": <b>" + value + "</b></div>";
	    }
        }
    }

    if (infos.number_of_children + infos.number_of_members > 0 && !infos.children) {
        messageShow("Fetching subtree ... please wait", "WAITING");
        //console.log("Fetching subtree ... please wait", "WAITING");


        getAllChildrenMembers(status, connection, infos.key, infos.number_of_children, infos.number_of_members, function (nidsArray) {
		//console.log("REMOVE PASSAGE ARRAY-STR");
	    completeNodeInfos(status, connection, nidsArray, Status.treeLabelsReturningArray, function (x) {
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
    //console.log("treeCallback key: " + key);
    var currentFlagIsOpen = status.updateNodeFromNidSwitchFlag(status.currentTreeData, key, 'isOpen');

    var time1 = Date.now();

    // get info
    //console.log("treeCallback: getting getInfoOfNid");
    getInfoOfNid(status, key, function (rebuildAll, infoStr) {
            //console.log("treeCallback: got getInfoOfNid " + infoStr);


	    //console.log("getInfoOfNid-callback: " + (Date.now() - time1) + "ms");

	    if (!status.hasSubTree(key)) {
		ons.notification.alert(infoStr); 
	    }
	    //showDetails(infoStr);
            //document.getElementById('detailsShowLabel').innerText = infoStr;
	    status.currentDetails = infoStr;

	    //console.log("infoStr: " + infoStr);
	    if (rebuildAll) {
	        //console.log("getInfoOfNid-callback-END:preupdatetreeall " + (Date.now() - time1) + "ms");
	        updateTreeAll();
	        //console.log("getInfoOfNid-callback-END:postupdatetreeall " + (Date.now() - time1) + "ms");
	    } else {
	        var subListId ="subListIdOf" + key;
		var theSublist = document.getElementById(subListId);
		//console.log("subListId: " + subListId + " theSubList: " + theSublist);
		if (theSublist != null) {
		    theSublist.style.display = (currentFlagIsOpen)?"block":"none";
		}
	        //updateTreeAll();
	    }
	    //console.log("getInfoOfNid-callback-END: " + (Date.now() - time1) + "ms");
	    updateLabels();
	    //console.log("getInfoOfNid-callback-END: " + (Date.now() - time1) + "ms");
	});
}

function updateSubTree(level, myNode, treeData) {
    for (var i=0; i<treeData.length; i++) {
	// update list removed tappable
	var itemId = "itemid" + treeData[i].key;

	var iconName = status.getIconForDataType(treeData[i].type);

	if (treeData[i].type == status.DATA_TYPE_HASSUBTREE) {
	    if (treeData[i].children == null) {
		iconName = "img/folderClosedDisabled.svg";
	    } else {
		iconName = "img/folderOpen.svg";
	    }
	}
	
        var taskItem = ons.createElement(
            '<ons-list-item id="' + itemId + '">' +  
              '<div class="left">' +
                '<img class="list-item__thumbnail" src="' + iconName + '">' +
              '</div>' +
              '<ons-button onclick="treeCallback(' + treeData[i].key + ')" modifier="large--quiet" ripple>' +
                '<div align="left">' +
	        trimQuotesSpaces(treeData[i].node_name) +    // "(" + treeData[i].key + ")" + 
                '</div>' +
	    '</ons-button>' +
            '</ons-list-item>'
        );
	
        myNode.appendChild(taskItem);
	if (treeData[i].children != null) {
	    var modifier = 'modifier="inset"';
	    var subListId ="subListIdOf" + treeData[i].key;
            var subList = ons.createElement(
	        '<ons-list id="' + subListId + '"' + modifier + '></ons-list>'
            );

	    subList.style.display = (treeData[i].isOpen)?"block":"none";
            myNode.appendChild(subList);
	    updateSubTree(level+1, subList, treeData[i].children);
	}
      }
}

function updateTreeAll() {
    //console.log("updateTree");
    var treeData = status.currentTreeData;
    var myNode = document.getElementById("tree");
    var parentNode = myNode.parentNode;
    var c = document.createDocumentFragment();

    parentNode.removeChild(myNode);
    myNode = document.createElement("ons-list");
    myNode.id = "tree";

    if (treeData.length == 0) {
        myNode.appendChild(ons.createElement(
	    '<ons-if platform="android ios">' +
	    '<ons-list-item><div class="left">SWIPE LEFT FOR</div></ons-list-item>' +
            '</ons-if>'));
        myNode.appendChild(ons.createElement(
	    '<ons-if platform="android ios">' +
            '<ons-list-item><div class="left">OPERATION PAGE</div></ons-list-item>' +
            '</ons-if>'));
        myNode.appendChild(ons.createElement(
	    '<ons-if platform="android ios">' +
	     '<ons-list-item><div class="right">SWIPE RIGHT FOR</div></ons-list-item>' +
            '</ons-if>'));
        myNode.appendChild(ons.createElement(
	    '<ons-if platform="android ios">' +
	     '<ons-list-item><div class="right">DETAILS PAGE</div></ons-list-item>' +
            '</ons-if>'));
        myNode.appendChild(ons.createElement(
            '<ons-list-item>' +  
              '<div style="text-align:center">' +
                '<img style="width:80%" src="img/icon.png"></img>' +
              '</div>' +
            '</ons-list-item>'));
	//console.log(treeData);
    }

    //var time1 = Date.now();
    //console.log("updatetreeall1 " + (Date.now() - time1) + "ms");
    updateSubTree(0, myNode, treeData);
    c.appendChild(myNode);
    parentNode.appendChild(c);
    //console.log("updatetreeall2 " + (Date.now() - time1) + "ms");
}

function updateLabels() {
    //console.log("updateLabels - " + status.currentDetails);

    document.getElementById('MDSIpRestInput').value = status.serverIpMdsIpRest;
    document.getElementById('serverIpMdsplusInput').value = status.serverIpMdsplus;
    document.getElementById('treeNameInput').value = status.treeName;
    document.getElementById('shotNumberInput').value = status.shotNumber;
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
    status.serverIpMdsplus = document.getElementById('serverIpMdsplusInput').value;
    messageShow("Opening connection", "WAITING");
    openConnection(status, connection, function(x) { 
	messageShow("Connected", "OK");
        //ons.notification.alert("got " + x); return x; 
	//messageLogWindow(x);

	startWebsocket(status.serverIpMdsIpRest);

	updateLabels();
    });
}

function openTreeButtonClicked() {
    //console.log("openTreeButtonClicked");
    status.treeName   = document.getElementById('treeNameInput').value;
    status.shotNumber = document.getElementById('shotNumberInput').value;
    messageShow("Opening tree", "WAITING");
    treeopen(status, connection, function(x) { 
	messageShow("Tree opened", "OK");
        //ons.notification.alert("got " + x); return x; 
	updateLabels();
    });

    //document.getElementById('detailsShowLabel').innerText = "button open tree clicked";
}

function getDataButtonClicked() {
    //console.log("getDataButtonClicked");
    messageShow("Getting data ... please wait ...", "WAITING");

    getAllChildrenMembers(status, connection, 0, null, null, function (nidsArray) {
	    var data = convertNidsArrayToNidsStr(nidsArray);
            status.currentTreeData = status.convertArrayOfNidsStrToTreeData(data);
	    completeNodeInfos(status, connection, nidsArray, Status.treeLabelsReturningArray, function (x) {
	        messageShow("Data fetched.", "OK");
	        updateTreeAll();
	        return null;
	    });	    
	});
}



/* Inspired by Lee Byron's test data generator. */
function stream_layers(n, m, o) {
    if (arguments.length < 3) o = 0;
    function bump(a) {
	var x = 1 / (.1 + Math.random()),
	    y = 2 * Math.random() - .5,
	    z = 10 / (.1 + Math.random());
	for (var i = 0; i < m; i++) {
	    var w = (i / m - y) * z;
	    a[i] += x * Math.exp(-w * w);
	}
    }
    return d3.range(n).map(function() {
	    var a = [], i;
	    for (i = 0; i < m; i++) a[i] = o + o * Math.random();
	    for (i = 0; i < 5; i++) bump(a);
	    return a.map(stream_index);
	});
}

/* Another layer generator using gamma distributions. */
function stream_waves(n, m) {
    return d3.range(n).map(function(i) {
	    return d3.range(m).map(function(j) {
		    var x = 20 * j / m - i / 3;
		    return 2 * x * Math.exp(-.5 * x);
		}).map(stream_index);
	});
}

function stream_index(d, i) {
    return {x: i, y: Math.max(0, d)};
}



function testData() {
    return stream_layers(3,128,.1).map(function(data, i) {
	    return { 
		key: 'Stream' + i,
		    values: data
		    };
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

  if (page.id === 'treePage') {
      updateTreeAll();
  }


  if (page.id === 'detailsPage') {
      updateLabels();	  

      // https://codepen.io/anon/pen/yeqMEJ
      /*
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
      */
      nv.addGraph(function() {
	      var chart = nv.models.lineWithFocusChart();

  chart.xAxis
      .tickFormat(d3.format(',f'));

  chart.yAxis
      .tickFormat(d3.format(',.2f'));

  chart.y2Axis
      .tickFormat(d3.format(',.2f'));

  d3.select('#chart2 svg')
      .datum(testData())
      .transition().duration(500)
      .call(chart);

  nv.utils.windowResize(chart.update);

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
