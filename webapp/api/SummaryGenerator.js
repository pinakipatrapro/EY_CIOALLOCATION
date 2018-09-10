sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";
	Array.prototype.groupBy = function (p1, p2, m1, m2) {
		var arrayCopy = JSON.parse(JSON.stringify(this));
		var groupedArray = [];
		this.forEach(function (e, i) {
			var oGroup = e;
			oGroup[m1] = 0;
			oGroup[m2] = 0;
			arrayCopy.forEach(function (f, j) {
				if ((e[p1] === f[p1]) && (e[p2] === f[p2])) {
					oGroup[m1] = oGroup[m1] + f[m1];
					oGroup[m2] = oGroup[m2] + f[m2];
				}
			});
			groupedArray.push(oGroup);
		});
	};
	var constructor = function (model) {
		this._model = model;
		this._model.setProperty('/summary', {
			total: 0,
			totalAllocated: 0
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
								if (i.valueInPercentage > 0) {
									aOutput.push(oData);
								}
							});
						});
					});
				});
			});
			aOutput.groupBy('CCId', 'ITId', 'allocatedValue', 'percentageValue');
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