"use strict";
var getType = function (value) { return Object.prototype.toString.call(value).slice(8, -1).toLowerCase(); };
function diff(oldObj, newObj) {
    if (newObj === oldObj) {
        return undefined;
    }
    var oldObjType = getType(oldObj);
    var newObjType = getType(newObj);
    if (newObjType == oldObjType) {
        if (newObjType == "array") {
            var result = {};
            for (var index in newObj) {
                var newValue = diff(oldObj[index], newObj[index]);
                if (newValue !== undefined) {
                    result[index] = newValue;
                }
            }
            if (Object.keys(result).length == 0) {
                return undefined;
            }
            result["$type"] = "array";
            result["$length"] = newObj.length;
            return result;
        }
        else if (newObjType == "object") {
            var result = {};
            for (var index in newObj) {
                var newValue = diff(oldObj[index], newObj[index]);
                if (newValue !== undefined) {
                    result[index] = newValue;
                }
            }
            var deletes = [];
            for (var index in oldObj) {
                if (newObj[index] === undefined) {
                    deletes.push(index);
                }
            }
            if (deletes.length > 0) {
                result["$deletes"] = deletes;
            }
            if (Object.keys(result).length == 0) {
                return undefined;
            }
            return result;
        }
    }
    return newObj;
}
exports.diff = diff;
function apply(oldObj, diffObj) {
    var oldObjType = getType(oldObj);
    var diffObjType = getType(diffObj);
    if (diffObjType == "object") {
        var type = diffObj["$type"];
        if (type !== undefined) {
            diffObjType = type;
        }
    }
    if (diffObjType == "array") {
        var length_1 = diffObj["$length"];
        if (diffObjType == oldObjType) {
            while (oldObj.length < length_1) {
                oldObj.push(undefined);
            }
            if (oldObj.length > length_1) {
                oldObj.splice(length_1, oldObj.length - length_1);
            }
            for (var index in diffObj) {
                if (index.indexOf("$") == -1) {
                    oldObj[index] = apply(oldObj[index], diffObj[index]);
                }
            }
            return oldObj;
        }
        else {
            var result = [];
            while (result.length < length_1) {
                result.push(undefined);
            }
            for (var index in diffObj) {
                if (index.indexOf("$") == -1) {
                    result[index] = diffObj[index];
                }
            }
            return result;
        }
    }
    else if (diffObjType == "object") {
        if (diffObjType == oldObjType) {
            var deletes = diffObj["$deletes"];
            if (deletes !== undefined) {
                for (var i = 0; i < deletes.length; i++) {
                    delete oldObj[deletes[i]];
                }
            }
            for (var index in diffObj) {
                if (index.indexOf("$") == -1) {
                    oldObj[index] = apply(oldObj[index], diffObj[index]);
                }
            }
            return oldObj;
        }
        else {
            for (var index in diffObj) {
                if (index.indexOf("$") == -1) {
                    delete diffObj[index];
                }
            }
            return diffObj;
        }
    }
    return diffObj;
}
exports.apply = apply;
