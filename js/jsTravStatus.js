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

class Status {

    constructor() {
	this.MDSPLUS_CLASS_ARRAY_DESCRIPTOR = 4;

	// data types (roserver):
	// /usr/local/mdsplus/include/usagedef.h
	// /usr/local/mdsplus/include/mdsdescrip.h

	this.MDSPLUS_USAGE_ANY       = 0;
	this.MDSPLUS_USAGE_STRUCTURE = 1;
	this.MDSPLUS_USAGE_ACTION    = 2;
	this.MDSPLUS_USAGE_DEVICE    = 3;
	this.MDSPLUS_USAGE_DISPATCH  = 4;
	this.MDSPLUS_USAGE_NUMBER    = 5;
	this.MDSPLUS_USAGE_SIGNAL    = 6;
	this.MDSPLUS_USAGE_TASK      = 7;
	this.MDSPLUS_USAGE_TEXT      = 8;
	this.MDSPLUS_USAGE_WINDOW    = 9;
	this.MDSPLUS_USAGE_AXIS      = 10;
	this.MDSPLUS_USAGE_SUBTREE   = 11;

	this.DATA_TYPE_NULL       = 0;
	this.DATA_TYPE_ARRAY      = 8;
	this.DATA_TYPE_HASSUBTREE = 16;

	this.DATA_TYPE_STRUCTURE  = 32; 
	this.DATA_TYPE_ACTION     = 33;
	this.DATA_TYPE_DEVICE     = 34;
	this.DATA_TYPE_DISPATCH   = 35;
	this.DATA_TYPE_NUMBER     = 36;
	this.DATA_TYPE_SIGNAL     = 37;
	this.DATA_TYPE_TASK       = 38;
	this.DATA_TYPE_TEXT       = 39;
	this.DATA_TYPE_WINDOW     = 40;
	this.DATA_TYPE_AXIS       = 41;
	this.DATA_TYPE_SUBTREE    = 42;

	this.internalArrayOfDataTypeFromUsage = [];
	this.internalArrayOfDataTypeFromUsage[0]                           = this.DATA_TYPE_NULL;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_STRUCTURE]= this.DATA_TYPE_STRUCTURE;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_ACTION]   = this.DATA_TYPE_ACTION;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_DEVICE]   = this.DATA_TYPE_DEVICE;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_DISPATCH] = this.DATA_TYPE_DISPATCH;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_NUMBER]   = this.DATA_TYPE_NUMBER;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_SIGNAL]   = this.DATA_TYPE_SIGNAL;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_TASK]     = this.DATA_TYPE_TASK;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_TEXT]     = this.DATA_TYPE_TEXT;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_WINDOW]   = this.DATA_TYPE_WINDOW;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_AXIS]     = this.DATA_TYPE_AXIS;
	this.internalArrayOfDataTypeFromUsage[this.MDSPLUS_USAGE_SUBTREE]  = this.DATA_TYPE_SUBTREE;

	// mostly from https://pixabay.com
	this.internalArrayOfIcons = [];
	this.internalArrayOfIcons[0] = "img/transparent.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_HASSUBTREE] = "img/folderClosedDisabled";
	this.internalArrayOfIcons[this.DATA_TYPE_ARRAY] = "img/graph.svg";

	this.internalArrayOfIcons[this.DATA_TYPE_STRUCTURE] = "img/graphene.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_ACTION]    = "img/hand.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_DEVICE]    = "img/disk.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_DISPATCH] = "img/arrows.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_NUMBER]  = "img/digital.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_SIGNAL]  = "img/frequency.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_TASK]    = "img/t.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_TEXT]    = "img/document.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_WINDOW]  = "img/vector-frame.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_AXIS]    = "img/rotate.svg";
	this.internalArrayOfIcons[this.DATA_TYPE_SUBTREE] = "img/folderClosedDisabled.svg";

	//this.doingUpdate = true;
	//this.internalServerIpMdsIpRest = "localhost:8081";
        //this.internalServerIpMdsIpRest = "portal.igi.cnr.it/mdsipRest";
	this.internalServerIpMdsIpRest = "www1.igi.cnr.it:8081";
	this.internalServerIpMdsplus = "roserver.igi.cnr.it:8000";
	this.internalConnectionId = -1; // -1 is no connection
	this.internalExpressionToEvaluate = "2+$PI"; // "2%2B$PI"
	this.internalEvaluatedExpression = "";
	this.internalTreeName = "RFX"; // "test";
        this.internalShotNumber = -1;
        this.internalCurrentDetails ="DETAILS";
	this.internalCurrentTreeData = this.buildDummyTree(0);
	this.internalUpdateF = new Array();
    }

    static get treeLabelsReturningArray() {
	return ["node_name", "fullpath", "class", "dtype", "usage", // "minpath", "path",
		"number_of_children", "number_of_members"];
    }


    buildDummyTree(length) {
	var tree = [];
	for (var i=0; i<length; i++) {
	    var n = this.buildTreeDataFromNID(i);
	    n['node_name'] = "'Node Name "+i+"'";
	    tree.push(n);
	}
	return tree;
    }


    buildTreeDataFromNID(nid) {
	return ({ 
		    key: nid,
		    type: null,
		    number_of_children: null,
		    number_of_members: null,
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
    get shotNumber           () { return this.internalShotNumber; }
    get currentDetails       () { return this.internalCurrentDetails; }
    get currentTreeData      () { return this.internalCurrentTreeData; }
    //get currentTreeSource    () { return this.internalCurrentTreeSource; }
    get updateF              () { return this.internalUpdateF; }

    set serverIpMdsIpRest    (x) { this.internalServerIpMdsIpRest = x;    /*this.update();*/ }
    set serverIpMdsplus      (x) { this.internalServerIpMdsplus = x;      /*this.update();*/ }
    set connectionId         (x) { this.internalConnectionId = x;         /*this.update();*/ }
    set expressionToEvaluate (x) { this.internalExpressionToEvaluate = x; /*this.update();*/ }
    set evaluatedExpression  (x) { this.internalEvaluatedExpression = x;  /*this.update();*/ }
    set treeName             (x) { this.internalTreeName = x;             /*this.update();*/ }
    set shotNumber           (x) { this.internalShotNumber = x;           /*this.update();*/ }
    set currentDetails       (x) { this.internalCurrentDetails = x;       /*this.update();*/ }
    set updateF              (x) { this.internalUpdateF = x;              /*this.update();*/ }
    //set currentTreeSource    (x) { this.internalCurrentTreeSource = x;    /*this.update();*/ }
    set currentTreeData      (x) { 
	this.internalCurrentTreeData = x;      
	//this.internalCurrentTreeSource = this.convertTreeDataToTreeSource(x);
	//this.update(); 
    }

    getIconForDataType (x) {	
	return this.internalArrayOfIcons[(x in this.internalArrayOfIcons)?x:0];
    }

    getDataTypeFromUsage(x) {
	return this.internalArrayOfDataTypeFromUsage[(x in this.internalArrayOfDataTypeFromUsage)?x:0];
    }

    addUpdateF(f) {
	this.internalUpdateF.push(f);
    }

    //suspendUpdate() {
    //	this.doingUpdate = false;
    //}

    //restoreUpdate() {
    //	this.doingUpdate = true;
    //	this.update();
    //}

    DELETEupdate() {
	//if (!this.doingUpdate) return;

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
		return theTree[i][fieldName];
	    } 

	    if (Array.isArray(theTree[i].children)) {
		var aus = this.updateNodeFromNid(theTree[i].children, nid, fieldName, updateFunc);
		if (aus != null) {
		    return aus;
		}
	    }
	}
	return null;	
    }

    updateNodeFromNidSetValue(theTree, nid, fieldName, fieldValue) {
	//console.log("updateNodeFromNidSetValue: fieldName=" + fieldName + " fieldValue=" + fieldValue);
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


    hasSubTreeNode(nd) {
	if (nd != null && nd.number_of_children + nd.number_of_members > 0) {
	    return true;
	} else {
	    return false;
	}
    }

    hasSubTree(key) {
	return (this.hasSubTreeNode(this.getNodeFromNid(this.internalCurrentTreeData, key)));
    }

}