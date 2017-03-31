using UnityEngine;
using System;
using System.Collections.Generic;

public static class JsonDiff {
	
	static string TypeNameLower<T>(T obj) {
		return typeof(T).Name.ToLower();
	}
	static string TypeNameLower(object obj) {
	if (obj != null) { return obj.GetType().Name.ToLower(); }
		else { return null; }
	}
	public static object Apply (object oldObj, object diffObj) {
		string oldObjType = TypeNameLower (oldObj);
		string diffObjType = TypeNameLower (diffObj);
		Dictionary<string, object> diffObjDict = diffObj as Dictionary<string, object>;
		if (diffObjType == TypeNameLower (new Dictionary<string, object> ()) && diffObjDict.ContainsKey ("$length")) {
			diffObjType = TypeNameLower (new List<object> ());
			int length = int.Parse (diffObjDict["$length"].ToString ());
			if (diffObjType == oldObjType) {
				List<object> oldObjList = oldObj as List<object>;
				while (oldObjList.Count < length) {
					oldObjList.Add (null);
				}
				if (oldObjList.Count > length) {
					oldObjList.RemoveRange (length, oldObjList.Count - length);
				}
				foreach (var kvp in diffObjDict) {
					if (kvp.Key.IndexOf ("$") != 0) {
						int index = int.Parse (kvp.Key);
						oldObjList[index] = Apply (oldObjList[index], kvp.Value);
					}
				}
				return oldObjList;
			}
			else {
				List<object> result = new List<object> ();
				while (result.Count < length) {
					result.Add (null);
				}
				foreach (var kvp in diffObjDict) {
					if (kvp.Key.IndexOf ("$") != 0) {
						int index = int.Parse (kvp.Key);
						result[index] = kvp.Value;
					}
				}
				return result;
			}
		}
		else if (diffObjType == TypeNameLower (new Dictionary<string, object> ())) {
			if (diffObjType == oldObjType) {
				Dictionary<string, object> oldObjDict = oldObj as Dictionary<string, object>;
				object deletes = null;
				if (diffObjDict.TryGetValue ("$deletes", out deletes)) {
					List<object> deleteList = deletes as List<object>;
					foreach (object deleteObj in deleteList) {
						oldObjDict.Remove (deleteObj.ToString ());
					}
				}
				foreach (var kvp in diffObjDict) {
					if (kvp.Key.IndexOf ("$") != 0) {
						oldObjDict[kvp.Key] = Apply (oldObjDict.ContainsKey (kvp.Key) ? oldObjDict[kvp.Key] : null, kvp.Value);
					}
				}
				return oldObjDict;
			}
			else {
				List<string> deleteKeys = new List<string> ();
				foreach (var kvp in diffObjDict) {
					if (kvp.Key.IndexOf ("$") == 0) {
						deleteKeys.Add (kvp.Key);
					}
				}
				foreach (string deleteKey in deleteKeys) {
					diffObjDict.Remove (deleteKey);
				}
				return diffObjDict;
			}
		}
		return diffObj;
	}
}
