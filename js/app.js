// App logic.
window.myApp = {};

// global initialization
console.log("Global initialization");
let status = new Status();
let connection = new Connection();

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

function updateUI() {
    document.getElementById('MDSIpRestInput').value = status.serverIpMdsIpRest;
    document.getElementById('serverIpMdsplusInput').value = status.serverIpMdsplus;
    document.getElementById('treeNameInput').value = status.treeName;

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
}

function getDataButtonClicked() {
    //console.log("getDataButtonClicked");
    messageShow("Getting data ... please wait ...", "WAITING");
    status.expressionToEvaluate = "_m = getnci(getnci(0, 'member_nids'), 'nid_number')";
    connection.evalExpr(status, function( data ) {
        //alert( "Data: " + data );
        status.evaluatedExpression = data; // .substring(1, data.length-1).replace(/,/g, ", ");
        messageShow("Got data.", "OK");
	ons.notification.alert("DATA: " + data);

        //status.currentTreeData = status.convertArrayOfNidsStrToTreeData(data);
        //// status.evaluatedExpression = data.substring(1, data.length-1).replace(/,/g, ", ");
        //// status.currentTreeSource = convertDataToCurrentTree(status.evaluatedExpression);
        //completeNodeInfos(status, connection, data, Status.treeLabelsReturningArray, function (x) {
	//    //alert("Complete DONE!");
	//	showMessage("Data fetched.", "OK");
	//	return null;
	//    });

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

  if (page.id === 'treePage') {
      for(var i=0; i<5; i++) {
	  // update list
          var taskItem = ons.createElement(
	    '<ons-list-item tappable>' + // category="' + myApp.services.categories.parseId(data.category)+ '">' +
            //'<label class="left">' +
            // '<ons-checkbox></ons-checkbox>' +
            //'</label>' +
            '<div class="center">' +
              'data.title' +
            '</div>' +
            //'<div class="right">' +
            //  '<ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>' +
            //'</div>' +
            '</ons-list-item>'
          );

          //document.querySelector("tree").appendChild(taskItem);
          document.getElementById('tree').appendChild(taskItem);
      }
  }

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
