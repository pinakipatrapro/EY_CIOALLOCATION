sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";
	Array.prototype.groupBy = function (p1, p2, m1, m2) {
		var arrayCopy = JSON.parse(JSON.stringify(this));
		var groupedArray = [];
		var groupHistory = null;
		var froupAggregator = function (e, arrayCopy, p1, p2, m1, m2, groupedArray) {
			var oGroup = JSON.parse(JSON.stringify(e));
			oGroup[m1] = 0;
			oGroup[m2] = 0;
			arrayCopy.forEach(function (f, j) {
				if ((e[p1] === f[p1]) && (e[p2] === f[p2])) {
					oGroup[m1] = oGroup[m1] + f[m1];
					oGroup[m2] = oGroup[m2] + f[m2];
				}
			});
			oGroup["valueInPercentage"] = Math.round(oGroup["allocatedValue"] / oGroup["value"] * 10000)/100;
			groupedArray.push(oGroup);
			return oGroup;
		};

		function sortByMultipleKey(keys) {
			return function (a, b) {
				if (keys.length == 0) return 0; // force to equal if keys run out
				var key = keys[0]; // take out the first key
				if (a[key] < b[key]) return -1; // will be 1 if DESC
				else if (a[key] > b[key]) return 1; // will be -1 if DESC
				else return sortByMultipleKey(keys.slice(1))(a, b);
			};
		}
		this.sort(sortByMultipleKey([p1,p2]));
		
		this.forEach(function (e, i) {
			if (!!groupHistory) {
				if ((groupHistory[p1] === e[p1]) && (groupHistory[p2] === e[p2])) {
					//Do Nothing
				} else {
					groupHistory = froupAggregator(e, arrayCopy, p1, p2, m1, m2, groupedArray);
				}
			} else {
				groupHistory = froupAggregator(e, arrayCopy, p1, p2, m1, m2, groupedArray);
			}
		});
		return groupedArray;
	};
	var constructor = function (model) {
		this._model = model;
		this._model.setProperty('/summary', {
			total: 0,
			totalAllocated: 0,
			CPIT: null
		});

		//Define Utilty functions
		this._getTotalAmount = function () {
			var total = 0;
			var totalAlloc = 0;
			var aData = this._model.getData().allocationData.CPIT;
			aData.forEach(function (e) {
				total = total + e.value;
				totalAlloc = totalAlloc + e.childSum;
			});
			this.totalCPITAlloc = totalAlloc;
			this._model.setProperty('/summary/total', total);
		};
		this._getTotalAllocated = function () {
			var total = 0;
			var aData = this._model.getData().allocationData.CPBS;
			if (!aData) {
				this._model.setProperty('/summary/totalAllocated', this.totalCPITAlloc);
				return;
			}
			aData.forEach(function (e) {
				total = total + e.childSum;
			});
			this.totalCPBSAlloc = total;
			this._model.setProperty('/summary/totalAllocated', this.totalCPBSAlloc + this.totalCPITAlloc);
		};
		this._getCCIT = function () {
			var aCP = this._model.getData().allocationData.CPIT;
			var aOutput = [];
			aCP.forEach(function (e) {
				e.child.forEach(function (f) {
					f.child.forEach(function (g) {
						g.child.forEach(function (h) {
							h.child.forEach(function (i) {
								var oData = {};
								oData.CCName = f.name;
								oData.CCId = f.id;
								oData.value = f.value;
								oData.ITName = i.name;
								oData.ITId = i.id;
								oData.allocatedValue = i.value;
								// if (i.valueInPercentage > 0) {
									aOutput.push(oData);
								// }
							});
						});
					});
				});
			});
			this._model.setProperty('/summary/CPIT', aOutput.groupBy('CCId', 'ITId', 'allocatedValue', 'value'));
		};
		//Call Functions
		this._getTotalAmount();
		this._getTotalAllocated();
		this._getCCIT();
	};

	var SummaryGenerator = BaseObject.extend("pinaki.ey.CIO.allocation.api.SummaryGenerator", {
		constructor: constructor
	});
	return SummaryGenerator;
});