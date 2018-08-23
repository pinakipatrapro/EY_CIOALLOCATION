sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var AllocationGraph = function (model) {
		this._data = model;

		this._data.setData({
			allocationGraph: {
				nodes: null
			},
			allocationGraphMetadata: [{
				level: 1,
				valueNode : false,
				groupName: "Source",
				values: [{
					name: "Data Center",
					parent : "IT Services"
				}, {
					name: "Hosting",
					parent : "IT Services"
				}]
			}, {
				level: 2,
				valueNode : false,
				groupName: "Source",
				values: [{
					name: "Enterprise Data Center",
					parent : "Data Center"
				}, {
					name: "Other Data Center",
					parent : "Data Center"
				}, {
					name: "Server",
					parent : "Hosting"
				}, {
					name: "Hosting"
				}]
			}, {
				level: 3,
				valueNode : true,
				groupName: "Source",
				values: [{
					name: "Enterprise Data Center",
					parent : "Enterprise Data Center"
				}, {
					name: "Housing Services",
					parent : "Enterprise Data Center"
				}, {
					name: "Other Data Center",
					parent : "Other Data Center"
				}]
			} ],
			allocationObject: this
		});
		this._nodeProperty = "/allocationGraph/nodes";
		this._lineProperty = "/allocationGraph/lines";
		this._groupProperty = "/allocationGraph/groups";
		//Handle methods
		this._getImageUrl = function (number) {
			return "https://chart.googleapis.com/chart?chst=d_text_outline&chld=4d6377|300|l|4d6377|_|" + number  ;
		};
		this._getInitialsFromString = function(string){
			var aIni = [];
			string.split(" ").forEach(function(e){
				aIni.push(e[0]);
			});
			if(aIni.length === 1){
				aIni = [string.substring(0,2)]	;
			}
			return aIni.join(" ").toUpperCase();
		};
		this._setNodeData = function (data) {
			var aExistingNodes = this._data.getProperty(this._nodeProperty);
			if (!aExistingNodes) {
				aExistingNodes = [];
			} 
			var aNewRecord = aExistingNodes.filter(function (e) {
				return e.key === data.key;
			});
			if (aNewRecord.length === 0) {
				aExistingNodes.push(data);
			}
			this._data.setProperty(this._nodeProperty, aExistingNodes);
		};
		this._setLineData = function (data) {
			var aExistingLines = this._data.getProperty(this._lineProperty);
			if (!aExistingLines) {
				aExistingLines = [];
			}

			var aNewRecord = aExistingLines.filter(function (e) {
				return (e.from === data.from && e.to === data.to);
			});
			if (aNewRecord.length === 0) {
				aExistingLines.push(data);
			}
			this._data.setProperty(this._lineProperty, aExistingLines);
		};
		this._setGroupData = function (data) {
			var aExistingGroups = this._data.getProperty(this._groupProperty);
			if (!aExistingGroups) {
				aExistingGroups = [];
			}

			var aNewRecord = aExistingGroups.filter(function (e) {
				return e.key === data.key;
			});
			if (aNewRecord.length === 0) {
				aExistingGroups.push(data);
			}
			this._data.setProperty(this._groupProperty, aExistingGroups);
		};
		this._createRootNode = function () {
			this._setNodeData({
				key: "ITS",
				title: "IT Services",
				icon: this._getImageUrl(100),
				level: 0
			});
		};
		this.createNode = function () {
			var allocationMetadata = this._data.getData().allocationGraphMetadata;
			var targetContext = this._data.getProperty(this._data.getProperty('/allocationGraphMetadata/tempTargetContext'));
			var newNodeKey = (targetContext.groupName + allocationMetadata.tempTarget.name).replace(/\s/g, "")+(targetContext.level+1);
			var groupKey = targetContext.groupName.replace(/\s/g, "");

			this._setGroupData({
				key: groupKey,
				title: targetContext.groupName
			});
			this._setNodeData({
				key: newNodeKey,
				title: allocationMetadata.tempTarget.name,
				icon: targetContext.valueNode ? this._getImageUrl("0 €") : this._getImageUrl(this._getInitialsFromString(allocationMetadata.tempTarget.name)),
				group: groupKey,
				level: targetContext.level
			});
			this._setLineData({
				to: newNodeKey,
				from: this._data.getProperty('/allocationGraphMetadata/tempSource').key
			});
		};
		//Methods Utilization
		this._createRootNode();
	};

	var oAllocationGraph = BaseObject.extend("pinaki.ey.CIO.allocation.CIOAllocation.api.AllocationGraph", {
		constructor: AllocationGraph
	});
	return oAllocationGraph;
});