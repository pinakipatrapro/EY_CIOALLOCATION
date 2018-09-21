sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var dataModel = function (model) {
		this._data = []; // structure to hold the nested data

		this._model = model;

		this._business = '/Business';
		this._businessData = [];

		this._endpoint = '/eyhcp/CIO/Allocation/Services/Allocation.xsodata';

		this.updateAllocations = function () {
			var dataFromBStoB = this._createBusinessServiceExistingAllocation('raw');
			var bsServices = this._model.getData().allocationData.BSB[0].child;
			this._model.getData().allocationData.BSB[0].value = 0;

			//Change as per percentage allocation
			bsServices.forEach(function (e, i) {
				e.value = dataFromBStoB[i].value;
				this._model.getData().allocationData.BSB[0].value = this._model.getData().allocationData.BSB[0].value + e.value;
			}.bind(this));
			
			
			//Propagate Downwards
			var data = this._model.getData().allocationData.BSB[0];
			data.childSum = 0;
			data.child.forEach(function (e) { //It Services Input
				e.childSum = 0;
				e.child.forEach(function (f) { //It tower
					f.value = parseFloat((f.valueInPercentage * e.value / 100).toFixed(2));
					e.childSum = e.childSum + f.value;
					f.childSum = 0;
				});
				data.childSum = data.childSum + e.childSum;
			});
			this._model.refresh(); //It is required to asynchronously update the bindings
		};

		this.loadInitialData = function () {
			return new Promise(function (res, rej) {
				var dataLoadCompleted = new Promise(function (resolve, reject) {
					Promise.all([
						this._fetchData(this._business)
					]).then(function (value) {
						this._businessData = value[0];
						resolve();
					}.bind(this));
				}.bind(this));
				dataLoadCompleted.then(function () {
					var BS = this._buildBSData();
					var initialHier = this._buildInitialHierarchy();
					var bsbData = this._createBusinessServiceExistingAllocation(initialHier, BS);
					res(bsbData);
				}.bind(this));
			}.bind(this));

		};

		//Trigger AJAX to fetch data
		this._fetchData = function (path) {
			return new Promise(function (resolve, reject) {
				if (path.indexOf('?') > -1) {
					var jsonFormatText = '&$format=json';
				} else {
					jsonFormatText = '?$format=json';
				}
				$.ajax({
					url: this._endpoint + path + jsonFormatText,
					method: "GET",
					success: function (response) {
						resolve(response.d.results);
					},
					error: function (error) {
						reject();
					}
				});
			}.bind(this));
		};
		//Get Flattened Data for Allocated IT Service Value
		this._createBusinessServiceExistingAllocation = function (initialHier, BS) {
			var ITBSData = this._model.getData().allocationData.ITBS;
			var CPBSData = this._model.getData().allocationData.CPBS;
			var oData = {};
			ITBSData.forEach(function (e, l1) { //All Services
				e.child.forEach(function (f, l2) { //IT Tower / CC
					f.child.forEach(function (g, l3) { //BS
						g.child.forEach(function (h, l4) { //BS Group
							h.child.forEach(function (i, l5) { //BS Category
								if (!oData[i.id + '-----' + i.name]) {
									oData[i.id + '-----' + i.name] = i.value;
								} else {
									oData[i.id + '-----' + i.name] = oData[i.id + '-----' + i.name] + i.value;
								}
							});
						});
					});
				});
			});
			CPBSData.forEach(function (e, l1) { //All Services
				e.child.forEach(function (f, l2) { //IT Tower / CC
					f.child.forEach(function (g, l3) { //BS
						g.child.forEach(function (h, l4) { //BS Group
							h.child.forEach(function (i, l5) { //BS Category
								if (!oData[i.id + '-----' + i.name]) {
									oData[i.id + '-----' + i.name] = i.value;
								} else {
									oData[i.id + '-----' + i.name] = oData[i.id + '-----' + i.name] + i.value;
								}
							});
						});
					});
				});
			});
			var outData = [];
			var parentSum = 0;
			Object.keys(oData).forEach(function (e) {
				outData.push({
					"level": "Business Service Category",
					"name": e.split('-----')[1],
					"root": false,
					"leaf": false,
					"id": e.split('-----')[0],
					"guid": "ITBS--IBSC--" + e.split('-----')[0],
					"nodeType": "display",
					"value": oData[e],
					"childSum": 0,
					"child": BS ? JSON.parse(JSON.stringify(BS)) : []
				});
				parentSum = parentSum + parseFloat(oData[e]);
			}.bind(this));
			if (initialHier === 'raw') {
				return outData;
			}
			initialHier.forEach(function (e) {
				e.child = outData;
				e.value = parentSum;
			});
			return initialHier;
		};
		// Build Initial Hierarchy
		this._buildInitialHierarchy = function () {
			var dataOut = [];
			dataOut.push({
				"level": "Business Service Category",
				"name": 'All',
				"value": 0,
				"valueInPercentage": 0,
				"root": true,
				"id": null,
				"guid": "BSB--ALL--All Services",
				"leaf": false,
				"childSum": 0,
				"nodeType": "display"
			});
			return dataOut;
		};
		this._buildBSData = function () {
			var dataOut = [];
			this._businessData.forEach(function (e) {
				dataOut.push({
					"level": "Business",
					"name": e["BusinessName"],
					"value": 0,
					"valueInPercentage": 0,
					"root": true,
					"id": e["BusinessID"],
					"guid": "BSB--BS--" + e["BusinessName"],
					"leaf": true,
					"childSum": 0,
					"nodeType": "display"
				});
			});
			return dataOut;
		};
	};

	var BSB = BaseObject.extend("pinaki.ey.CIO.allocation.api.BSB", {
		constructor: dataModel
	});
	return BSB;
});