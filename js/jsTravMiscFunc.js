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

function trimQuotesSpaces(str) {
    // trim "'" and " "
    //var retStr = str;
    //if (retStr == null) return "";
    //if (retStr[0] == "'") retStr = retStr.slice(1);
    //if (retStr.slice(-1) == "'") retStr = retStr.slice(0, -1);
    //return retStr;
    if (str == null) return "";
    if ((typeof str) == "string")
	return str.replace(/^\'+|\'+$/gm,'').replace(/^\s+|\s+$/gm,'');
    else
	return str;
}

function convertArrayAsStrToArrayOfStr(str) {
    // input string ['str1','str2',...]
    //console.log(str);
    if (str.charAt(0) == '[' && str.charAt(str.length - 1) == ']') {
	return str.substring(1, str.length-1).split(',');
    }
    return ([]);
}


function convertArrayAsStrToArrayOfInt(str) {
    // input string ['1','2',...]
    var data = [];
    var strAus1 = convertArrayAsStrToArrayOfStr(str);
    for (var i=0; i<strAus1.length; i++) {
	data[i] = parseInt(strAus1[i]);
    }
    return data;
}


function convertArrayAsStrToArrayOfFloat(str) {
    // input string ['1','2',...]
    var data = [];
    var strAus1 = convertArrayAsStrToArrayOfStr(str);
    for (var i=0; i<strAus1.length; i++) {
	data[i] = parseFloat(strAus1[i]);
    }
    return data;
}


function convertArrayOfIntToStr(x) {
    // input: an array, returns a string "[1,2,...]"
    return("["+x.join(",")+"]");
}

function convertNidsArrayToNidsStr(arr) {
    if (arr == null) {
	return "";
    }
    return ("[" + arr.join(",") + "]");
}