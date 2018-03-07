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
	//this.internalServerIpMdsIpRest = "localhost:8081";
        //this.internalServerIpMdsIpRest = "portal.igi.cnr.it/mdsipRest";
	this.internalServerIpMdsIpRest = "www1:8081";
	this.internalServerIpMdsplus = "roserver.igi.cnr.it:8000";
	this.internalConnectionId = -1; // -1 is no connection
	this.internalExpressionToEvaluate = "2+$PI"; // "2%2B$PI"
	this.internalEvaluatedExpression = "";
	this.internalTreeName = "test";
	this.internalCurrentTreeData = [
					{"key": 0, 
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
					 "children": null,
					 "isOpen": false,
					},
				       ];
	this.internalCurrentTreeSource = [   // icon: png ...
					  // {"title": "EMPTY TREE", "key": "0"},
				   // {"title":"1","key":"1"},
				   // {"title":"2","key":"2"},
				   //    {"title": "1", "key": "1"},
				   //    {"title": "2", "key": "2", "folder": true, "children": [
				   //      {"title": "Node 2.1", "key": "3"},
				   //      {"title": "Node 2.2", "key": "4"}
				   //      ]},
				   //    {"title": "5", "key": "5"},
				 ];
	this.internalUpdateF = new Array();
    }

    convertTreeDataToTreeSource(internalTree) { 
	var ausArr = [];
	for (let [key, nod] of Object.entries(internalTree)) {
	    // console.log(key); console.log(value);
	    var isFolder = false;    
	    if (nod.number_of_children + nod.number_of_members > 0) {
		isFolder = true;
	    }

	    var children = null;
	    if (nod.children) {
		children = this.convertTreeDataToTreeSource(nod.children);
	    }
	    ausArr.push({title: nod.node_name, key: nod.key, folder: isFolder, expanded: nod.isOpen, children: children }); 
	}
	return(ausArr);
    }

    buildTreeDataFromNID(nid) {
	return ({ 
		    key: nid,
		    type: null,
		    children: null,
		    isOpen: false,
		    });
    }

    convertArrayOfNidsStrToTreeData(arrayOfNidsStr) {
	var data = convertArrayAsStrToArrayOfInt(arrayOfNidsStr);
	return(data.map(this.buildTreeDataFromNID));
    }

    get serverIpMdsIpRest    () { return this.internalServerIpMdsIpRest; }
    get serverIpMdsplus      () { return this.internalServerIpMdsplus; }
    get connectionId         () { return this.internalConnectionId; }
    get expressionToEvaluate () { return this.internalExpressionToEvaluate; }
    get evaluatedExpression  () { return this.internalEvaluatedExpression; }
    get treeName             () { return this.internalTreeName; }
    get currentTreeData      () { return this.internalCurrentTreeData; }
    get currentTreeSource    () { return this.internalCurrentTreeSource; }
    get updateF              () { return this.internalUpdateF; }

    static get treeLabelsReturningArray() {
	return ["node_name", "fullpath", "class", "dtype", "usage", // "minpath", "path",
		"number_of_children", "number_of_members"];
    }

    set serverIpMdsIpRest    (x) { this.internalServerIpMdsIpRest = x;    this.update(); }
    set serverIpMdsplus      (x) { this.internalServerIpMdsplus = x;      this.update(); }
    set connectionId         (x) { this.internalConnectionId = x;         this.update(); }
    set expressionToEvaluate (x) { this.internalExpressionToEvaluate = x; this.update(); }
    set evaluatedExpression  (x) { this.internalEvaluatedExpression = x;  this.update(); }
    set treeName             (x) { this.internalTreeName = x;             this.update(); }
    set updateF              (x) { this.internalUpdateF = x;              this.update(); }
    set currentTreeSource    (x) { this.internalCurrentTreeSource = x;    this.update(); }
    set currentTreeData      (x) { 
	this.internalCurrentTreeData = x;      
	this.internalCurrentTreeSource = this.convertTreeDataToTreeSource(x);
	// console.log(x);
	// console.log(this.internalCurrentTreeSource)
	this.update(); 
    }

    addUpdateF(f) {
	this.internalUpdateF.push(f);
    }

    update() {
	// TODO optimize this update
	this.internalCurrentTreeSource = 
	    this.convertTreeDataToTreeSource(this.internalCurrentTreeData);
	for (var i=0; i<this.internalUpdateF.length; i++) {
	    // call all the update functions
	    this.internalUpdateF[i]();
	}
    }

    updateNodeFromNid(theTree, nid, fieldName, fieldValue) {
	var found = null;
	for (var i=0; i<theTree.length; i++) {
	    if (theTree[i].key == nid) {
		theTree[i][fieldName] = fieldValue;
		return true;;
	    } 

	    if (Array.isArray(theTree[i].children)) {
		found = this.updateNodeFromNid(theTree[i].children, nid, fieldName, fieldValue);
		if ( found ) {
		    return found;
		}
	    }
	}
	return null;	
    }

    addToChildren(theTree, nid, theChildrenTree) {
	var found = null;
	for (var i=0; i<theTree.length; i++) {
	    if (theTree[i].key == nid) {
	        if (Array.isArray(theTree[i].children)) {
		    //console.log("ADDING CHILDREN!!!");
		    //console.log(i);
		    //console.log(theTree);
		    for (var j=0; j<theChildrenTree.length; j++) {
		        theTree[i].children.push(theChildrenTree[j]);
		    }
		    //console.log(theTree);
		    //alert("x");
		} else {
		    theTree[i].children = theChildrenTree;
		}
		return true;;
	    } 
	    if (Array.isArray(theTree[i].children)) {
		found = this.addToChildren(theTree[i].children, nid, theChildrenTree);
		if ( found ) {
		    return found;
		}
	    }
	}
	return null;	
    }

    getNodeFromNid(theTree, nid) {
	var found = null;
	//console.log(theTree);
	for (var i=0; i<theTree.length; i++) {
	    //console.log(nid);
	    //console.log(theTree[i].key);
	    if (theTree[i].key == nid) {
		found = theTree[i];
		return found;
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