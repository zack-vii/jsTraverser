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

class Status {

    constructor() {
	this.doingUpdate = true;
	//this.internalServerIpMdsIpRest = "localhost:8081";
        //this.internalServerIpMdsIpRest = "portal.igi.cnr.it/mdsipRest";
	this.internalServerIpMdsIpRest = "www1.igi.cnr.it:8081";
	this.internalServerIpMdsplus = "roserver.igi.cnr.it:8000";
	this.internalConnectionId = -1; // -1 is no connection
	this.internalExpressionToEvaluate = "2+$PI"; // "2%2B$PI"
	this.internalEvaluatedExpression = "";
	this.internalTreeName = "test";
        this.internalCurrentDetails ="DETAILS";
	this.internalCurrentTreeData = [
					{"key": 1, 
					 "class": null,
					 "dtype": null,
					 "usage": null,
					 "fullpath": null,
					 "minpath": null,
					 "node_name": "EMPTY TREE", 
					 "path": null,
					 "number_of_children": null,
					 "number_of_members": null,
					 "type": null,
					 //					 "children": null,
					 "children": [{"key": 2, 
					 "class": null,
					 "dtype": null,
					 "usage": null,
					 "fullpath": null,
					 "minpath": null,
					 "node_name": "EMPTY TREE CHILD 1", 
					 "path": null,
					 "number_of_children": null,
					 "number_of_members": null,
					 "type": null,
					 "children": null,
					 "isOpen": false,
					},],

					 "isOpen": true,
					},

					{"key": 3, 
					 "class": null,
					 "dtype": null,
					 "usage": null,
					 "fullpath": null,
					 "minpath": null,
					 "node_name": "EMPTY TREE BIS", 
					 "path": null,
					 "number_of_children": null,
					 "number_of_members": null,
					 "type": null,
					 "children": null,
					 "isOpen": false,
					},

				       ];
	this.internalUpdateF = new Array();
    }

    buildTreeDataFromNID(nid) {
	return ({ 
		    key: nid,
		    type: null,
		    children: null,
		    isOpen: false,
		    });
    }

    convertArrayOfNidsIntToTreeData(arrayOfNidsInt) {
	return(arrayOfNidsInt.map(this.buildTreeDataFromNID));
    }

    convertArrayOfNidsStrToTreeData(arrayOfNidsStr) {
	var data = convertArrayAsStrToArrayOfInt(arrayOfNidsStr);
	return(this.convertArrayOfNidsIntToTreeData(data));
    }

    get serverIpMdsIpRest    () { return this.internalServerIpMdsIpRest; }
    get serverIpMdsplus      () { return this.internalServerIpMdsplus; }
    get connectionId         () { return this.internalConnectionId; }
    get expressionToEvaluate () { return this.internalExpressionToEvaluate; }
    get evaluatedExpression  () { return this.internalEvaluatedExpression; }
    get treeName             () { return this.internalTreeName; }
    get currentDetails       () { return this.internalCurrentDetails; }
    get currentTreeData      () { return this.internalCurrentTreeData; }
    //get currentTreeSource    () { return this.internalCurrentTreeSource; }
    get updateF              () { return this.internalUpdateF; }

    static get treeLabelsReturningArray() {
	return ["node_name", // "fullpath", "class", "dtype", "usage", // "minpath", "path",
		"number_of_children", "number_of_members"];
    }

    set serverIpMdsIpRest    (x) { this.internalServerIpMdsIpRest = x;    this.update(); }
    set serverIpMdsplus      (x) { this.internalServerIpMdsplus = x;      this.update(); }
    set connectionId         (x) { this.internalConnectionId = x;         this.update(); }
    set expressionToEvaluate (x) { this.internalExpressionToEvaluate = x; this.update(); }
    set evaluatedExpression  (x) { this.internalEvaluatedExpression = x;  this.update(); }
    set treeName             (x) { this.internalTreeName = x;             this.update(); }
    set currentDetails       (x) { this.internalCurrentDetails = x;       this.update(); }
    set updateF              (x) { this.internalUpdateF = x;              this.update(); }
    //set currentTreeSource    (x) { this.internalCurrentTreeSource = x;    this.update(); }
    set currentTreeData      (x) { 
	this.internalCurrentTreeData = x;      
	//this.internalCurrentTreeSource = this.convertTreeDataToTreeSource(x);
	this.update(); 
    }

    addUpdateF(f) {
	this.internalUpdateF.push(f);
    }

    suspendUpdate() {
	this.doingUpdate = false;
    }

    restoreUpdate() {
	this.doingUpdate = true;
	this.update();
    }

    update() {
	if (!this.doingUpdate) return;

	// TODO optimize this update
	for (var i=0; i<this.internalUpdateF.length; i++) {
	    // call all the update functions
	    this.internalUpdateF[i]();
	}
    }

    updateNodeFromNid(theTree, nid, fieldName, updateFunc) {
	for (var i=0; i<theTree.length; i++) {
	    if (theTree[i].key == nid) {
		theTree[i][fieldName] = updateFunc(theTree[i][fieldName]);
		return true;
	    } 

	    if (Array.isArray(theTree[i].children)) {
		if (this.updateNodeFromNid(theTree[i].children, nid, fieldName, updateFunc)) {
		    return true;
		}
	    }
	}
	return null;	
    }

    updateNodeFromNidSetValue(theTree, nid, fieldName, fieldValue) {
	return this.updateNodeFromNid(theTree, nid, fieldName, function(x) { return fieldValue; });
    }

    updateNodeFromNidSwitchFlag(theTree, nid, fieldName) {
	return this.updateNodeFromNid(theTree, nid, fieldName, function(x) { return !x; });
    }

    updateNodeFromNidAddToChildren(theTree, nid, theChildrenTree) {
	return this.updateNodeFromNid(theTree, nid, 'children', function (x) {
		var ausArr = [];
	        if (Array.isArray(x)) {
		    ausArr = x.slice();;
		    for (var j=0; j<theChildrenTree.length; j++) {
		        ausArr.push(theChildrenTree[j]);
		    }
		    return ausArr;
		} else {
		    return theChildrenTree;
		}
	    });
    }

    getNodeFromNid(theTree, nid) {
	var found = null;
	for (var i=0; i<theTree.length; i++) {
	    if (theTree[i].key == nid) {
		return theTree[i];
	    } 
	    if ( theTree[i].children ) {
		found = this.getNodeFromNid(theTree[i].children, nid);
		if ( found ) {
		    return found;
		}
	    }
	}
	return null;
    }
}