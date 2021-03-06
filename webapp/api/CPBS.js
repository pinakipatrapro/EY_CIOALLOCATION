sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var dataModel = function (model) {
		this._data = []; // structure to hold the nested data

		this._model = model;

		this._businessService = '/BusinessService?$select=BusinessService';
		this._businessServiceData = [];
		this._businessServiceGroup = '/BusinessService?$select=BusinessService,BusinessServiceGroup';
		this._businessServiceGroupData = [];
		this._businessServiceCategory = '/BusinessService?$select=BusinessServiceCategory,BusinessServiceCategoryID,BusinessServiceGroup';
		this._businessServiceCategoryData = [];

		this._endpoint = '/eyhcp/CIO/Allocation/Services/Allocation.xsodata';

		this.updateAllocations = function () {

			//Propagate Downwards
			var data = this._model.getData().allocationData.CPBS[0];
			data.childSum = 0;
			data.child.forEach(function (e) { //It Services Input
				e.childSum = 0;
				e.child.forEach(function (f) { //It tower
					f.value = parseFloat((f.valueInPercentage * e.value / 100).toFixed(2));
					e.childSum = e.childSum + f.value;
					f.childSum = 0;
					f.child.forEach(function (g) { //It sub tower
						g.value = parseFloat((g.valueInPercentage * f.value / 100).toFixed(2));
						f.childSum = f.childSum + g.value;
						g.childSum = 0;
						g.child.forEach(function (h) { //It services
							h.value = parseFloat((h.valueInPercentage * g.value / 100).toFixed(2));
							g.childSum = g.childSum + h.value;
						}.bind(this));
					}.bind(this));
				}.bind(this));
				data.childSum = data.childSum + e.childSum;
			}.bind(this));

			this._model.refresh(); //It is required to asynchronously update the bindings
		};

		this.loadInitialData = function () {
			return new Promise(function (res, rej) {
				var dataLoadCompleted = new Promise(function (resolve, reject) {
					Promise.all([
						this._fetchData(this._businessService),
						this._fetchData(this._businessServiceGroup),
						this._fetchData(this._businessServiceCategory)
					]).then(function (value) {
						this._businessServiceData = value[0];
						this._businessServiceGroupData = value[1];
						this._businessServiceCategoryData = value[2];
						resolve();
					}.bind(this));
				}.bind(this));
				dataLoadCompleted.then(function () {
					var BSG2BSC = this._buildBSG2BSCHierarchy();
					var BS2BSG = this._buildBS2BSGHierarchy(BSG2BSC);
					var initialHier = this._buildInitialHierarchy(BS2BSG);
					
					res(initialHier);
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
		// Build Initial Hierarchy
		this._buildInitialHierarchy = function (BS2BSG) {
			var dataOut = [];
			var CPCCData = JSON.parse(JSON.stringify(this._model.getData().allocationData.CPIT));
			CPCCData.forEach(function (e) {
				e.value = e.value;
				e.childSum = 0;
				e.child.forEach(function (f) {
					f.value = f.value;
					f.childSum = 0;
					delete f.child;
					f.child = JSON.parse(JSON.stringify(BS2BSG));
				});
			});
			return CPCCData;
		};
		this._buildBSG2BSCHierarchy = function () {
			var outData = [];
			var businessServiceGroup = this._businessServiceGroupData;
			var businessServiceCategory = this._businessServiceCategoryData;
			businessServiceGroup.forEach(function (e) {
				var subTower = {
					"level": "Business Service Group",
					"name": e["BusinessServiceGroup"],
					"root": false,
					"leaf": false,
					"id": "",
					"guid": "ITBS--BSG--" + e["BusinessServiceGroup"],
					"nodeType": "value",
					"value": 0,
					"valueInPercentage": 0,
					"parentValue": e["BusinessService"],
					"childSum": 0,
					"child": []
				};
				businessServiceCategory.forEach(function (f) {
					if (f["BusinessServiceGroup"] === e["BusinessServiceGroup"]) {
						subTower.child.push({
							"level": "Business Service Category",
							"name": f["BusinessServiceCategory"],
							"root": false,
							"id": f["BusinessServiceCategoryID"],
							"guid": "ITBS--BSC--" + f["BusinessServiceCategoryID"],
							"leaf": true,
							"nodeType": "value",
							"value": 0,
							"valueInPercentage": 0
						});
					}
				}.bind(this));
				outData.push(subTower);
			});
			return outData;
		};
		this._buildBS2BSGHierarchy = function (BSG2BSC) {
			var outData = [];
			var businessService = this._businessServiceData;
			businessService.forEach(function (e) {
				var itTower = {
					"level": "Business Service",
					"name": e["BusinessService"],
					"root": false,
					"nodeType": "value",
					"id": "",
					"guid": "BSIT--BS--" + e["BusinessService"],
					"leaf": false,
					"value": 0,
					"valueInPercentage": 0,
					"childSum": 0,
					"child": []
				};
				BSG2BSC.forEach(function (f) {
					if (f["parentValue"] === e["BusinessService"]) {
						itTower.child.push(f);
					}
				}.bind(this));
				outData.push(itTower);
			}.bind(this));
			return outData;
		};
	};

	var ITBS = BaseObject.extend("pinaki.ey.CIO.allocation.api.ITBS", {
		constructor: dataModel
	});
	return ITBS;
});