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
	this.internalMDSPLUS_CLASS_ARRAY_DESCRIPTOR = 4;

	this.internalMDSPLUS_USAGE_ACTION = 2;
	this.internalMDSPLUS_USAGE_NUMBER = 5;
	this.internalMDSPLUS_USAGE_SIGNAL = 6;
	this.internalMDSPLUS_USAGE_TEXT = 8;

	this.internalDATA_TYPE_HASSUBTREE = 16;
	this.internalDATA_TYPE_ARRAY  = 32;
	this.internalDATA_TYPE_TEXT   = 33;
	this.internalDATA_TYPE_NUMBER = 34;
	this.internalDATA_TYPE_ACTION = 35;
	this.internalDATA_TYPE_SIGNAL = 36;

	// mostly from https://pixabay.com
	this.internalArrayOfIcons = [];
	this.internalArrayOfIcons[0] = "img/transparent.svg";
	this.internalArrayOfIcons[this.internalDATA_TYPE_HASSUBTREE] = "img/folderClosedDisabled";
	this.internalArrayOfIcons[this.internalDATA_TYPE_ARRAY] = "img/graph.svg";
	this.internalArrayOfIcons[this.internalDATA_TYPE_TEXT] = "img/document.svg";
	this.internalArrayOfIcons[this.internalDATA_TYPE_NUMBER] = "img/digital.svg";
	this.internalArrayOfIcons[this.internalDATA_TYPE_ACTION] = "img/hand.svg";
	this.internalArrayOfIcons[this.internalDATA_TYPE_SIGNAL] = "img/frequency.svg";

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

    get MDSPLUS_CLASS_ARRAY_DESCRIPTOR () { return this.internalMDSPLUS_CLASS_ARRAY_DESCRIPTOR; }
    get MDSPLUS_USAGE_ACTION () { return this.internalMDSPLUS_USAGE_ACTION; }
    get MDSPLUS_USAGE_TEXT () { return this.internalMDSPLUS_USAGE_TEXT; }
    get MDSPLUS_USAGE_SIGNAL () { return this.internalMDSPLUS_USAGE_SIGNAL; }
    get MDSPLUS_USAGE_NUMBER () { return this.internalMDSPLUS_USAGE_NUMBER; }

    get DATA_TYPE_HASSUBTREE () { return this.internalDATA_TYPE_HASSUBTREE; }
    get DATA_TYPE_ARRAY      () { return this.internalDATA_TYPE_ARRAY; }
    get DATA_TYPE_TEXT       () { return this.internalDATA_TYPE_TEXT; }
    get DATA_TYPE_NUMBER     () { return this.internalDATA_TYPE_NUMBER; }
    get DATA_TYPE_ACTION     () { return this.internalDATA_TYPE_ACTION; }
    get DATA_TYPE_SIGNAL     () { return this.internalDATA_TYPE_SIGNAL; }

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
	if (x in this.internalArrayOfIcons) {
	    return this.internalArrayOfIcons[x];
	} else {
	    return this.internalArrayOfIcons[0];
	}
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