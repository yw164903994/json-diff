const getType = (value) => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
export function diff (oldObj: any, newObj: any): any {
	if (newObj === oldObj) {
		return undefined;
	}
	let oldObjType = getType(oldObj);
	let newObjType = getType(newObj);
	if (newObjType == oldObjType) {
		if (newObjType == "array") {
			let result = {};
			for (let index in newObj) {
				let newValue = diff(oldObj[index], newObj[index]);
				if (newValue !== undefined) {
					result[index] = newValue;
				}
			}
			if (newObj.length == oldObj.length && Object.keys(result).length == 0) {
				return undefined;
			}
			result["$length"] = newObj.length;
			return result;
		}
		else if (newObjType == "object") {
			let result = {};
			for (let index in newObj) {
				let newValue = diff(oldObj[index], newObj[index]);
				if (newValue !== undefined) {
					result[index] = newValue;
				}
			}
			let deletes: string[] = [];
			for (let index in oldObj) {
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
export function apply (oldObj: any, diffObj: any): any {
	let oldObjType = getType(oldObj);
	let diffObjType = getType(diffObj);
	if (diffObjType == "object" && diffObj["$length"] !== undefined) {
		diffObjType = "array";
		let length = diffObj["$length"];
		if (diffObjType == oldObjType) {
			while (oldObj.length < length) {
				oldObj.push(undefined);
			}
			if (oldObj.length > length) {
				oldObj.splice(length, oldObj.length - length);
			}
			for (let index in diffObj) {
				if (index.indexOf("$") != 0) {
					oldObj[index] = apply(oldObj[index], diffObj[index]);
				}
			}
			return oldObj;
		}
		else {
			let result: any[] = [];
			while (result.length < length) {
				result.push(undefined);
			}
			for (let index in diffObj) {
				if (index.indexOf("$") != 0) {
					result[index] = diffObj[index];
				}
			}
			return result;
		}
		
	}
	else if (diffObjType == "object") {
		if (diffObjType == oldObjType) {
			let deletes = diffObj["$deletes"];
			if (deletes !== undefined) {
				for (let i = 0; i < deletes.length; i++) {
					delete oldObj[deletes[i]];
				}
			}
			for (let index in diffObj) {
				if (index.indexOf("$") != 0) {
					oldObj[index] = apply(oldObj[index], diffObj[index]);
				}
			}
			return oldObj;
		}
		else {
			for (let index in diffObj) {
				if (index.indexOf("$") == 0) {
					delete diffObj[index];
				}
			}
			return diffObj;
		}
	}
	return diffObj;
}
