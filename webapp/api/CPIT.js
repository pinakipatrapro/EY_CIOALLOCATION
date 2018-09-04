sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var dataModel = function (model) {
		this._data = []; // structure to hold the nested data

		this._model = model;
		if (this._model.getData().type === 'A') {
			this._costPToCostCPath = '/CCVCP_CC';
		} else {
			this._costPToCostCPath = '/CCVCP_CCBudget?$filter=Year eq \'' + this._model.getData().budgetYearMonth+'\'';
		}

		this._costPToCostCData = [];

		this._ITServiceTower = '/ITServiceMaster?$select=ITTower';
		this._ITServiceTowerData = [];
		this._ITServiceSubTower = '/ITServiceMaster?$select=ITTower,ITSubTower';
		this._ITServiceSubTowerData = [];
		this._ITService = '/ITServiceMaster?$select=ITSubTower,ITService,ITServiceID';
		this._ITServiceData = [];

		this._endpoint = '/eyhcp/CIO/Allocation/Services/Allocation.xsodata';

		this.loadInitialData = function () {
			return new Promise(function (res, rej) {
				var dataLoadCompleted = new Promise(function (resolve, reject) {
					Promise.all([
						this._fetchData(this._costPToCostCPath),
						this._fetchData(this._ITServiceTower),
						this._fetchData(this._ITServiceSubTower),
						this._fetchData(this._ITService)
					]).then(function (value) {
						this._costPToCostCData = value[0];
						this._ITServiceTowerData = value[1];
						this._ITServiceSubTowerData = value[2];
						this._ITServiceData = value[3];
						resolve();
					}.bind(this));
				}.bind(this));
				dataLoadCompleted.then(function () {
					var ITST2ITS = this._buildITST2ITSHierarchy();
					var ITT2ITS = this._buildITT2ITSHierarchy(ITST2ITS);

					var cpData = this._buildCPHierarchy();
					var finalData = this._buildCCHierarchy(cpData, ITT2ITS);
					res(finalData);
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

		//Build Hierarchies
		this._buildCPHierarchy = function () {
			var dataOut = [];
			var data = this._costPToCostCData;
			data.forEach(function (e, i) {
				var alreadyExists = false;
				dataOut.forEach(function (f) {
					if (e["CostPoolID"] === f["id"]) {
						alreadyExists = true;
					}
				}.bind(this));
				if (!alreadyExists) {
					dataOut.push({
						"level": "Cost Pool",
						"name": e["CostPoolName"],
						"value": 0,
						"root": true,
						"id": e["CostPoolID"],
						"guid": "CPIT--CP--" + e["CostPoolID"],
						"leaf": false,
						"childSum": 0,
						"nodeType": "display"
					});
				}
			});
			return dataOut;
		};
		this._buildCCHierarchy = function (CPData, ITT2ITS) {
			var flatData = this._costPToCostCData;
			CPData.forEach(function (e) {
				e.child = [];
				flatData.forEach(function (f) {
					if (e["id"] === f["CostPoolID"]) {
						e.child.push({
							"level": "Cost Center",
							"name": f["CostCenterName"],
							"root": false,
							"leaf": false,
							"id": f["CostCenterID"],
							"guid": "CPIT--CC--" + f["CostCenterID"],
							"nodeType": "display",
							"value": parseFloat(f["AmountFormatted"]),
							"childSum": 0,
							"child": JSON.parse(JSON.stringify(ITT2ITS))
						});
						e.value = e.value + parseFloat(f["AmountFormatted"]);
					}
				}.bind(this));
			}.bind(this));
			return CPData;
		};
		this._buildITST2ITSHierarchy = function (CPData) {
			var outData = [];
			var itSubServiceData = this._ITServiceSubTowerData;
			var itServiceData = this._ITServiceData;
			itSubServiceData.forEach(function (e) {
				var subTower = {
					"level": "IT Sub Tower",
					"name": e["ITSubTower"],
					"root": false,
					"leaf": false,
					"id": "",
					"guid": "CPIT--ITST--" + e["ITSubTower"],
					"nodeType": "value",
					"value": 0,
					"parentValue": e["ITTower"],
					"childSum": 0,
					"child": []
				};
				itServiceData.forEach(function (f) {
					if (f["ITSubTower"] === e["ITSubTower"]) {
						subTower.child.push({
							"level": "IT Service",
							"name": f["ITService"],
							"root": false,
							"id": f["ITServiceID"],
							"guid": "CPIT--ITS--" + f["ITServiceID"],
							"leaf": true,
							"nodeType": "value",
							"value": 0
						});
					}
				}.bind(this));
				outData.push(subTower);
			});
			return outData;
		};
		this._buildITT2ITSHierarchy = function (ITST2ITS) {
			var outData = [];
			var towerData = this._ITServiceTowerData;
			towerData.forEach(function (e) {
				var itTower = {
					"level": "IT Tower",
					"name": e["ITTower"],
					"root": false,
					"nodeType": "value",
					"id": "",
					"guid": "CPIT--ITT--" + e["ITTower"],
					"leaf": false,
					"value": 0,
					"childSum": 0,
					"child": []
				};
				ITST2ITS.forEach(function (f) {
					if (f["parentValue"] === e["ITTower"]) {
						itTower.child.push(f);
					}
				}.bind(this));
				outData.push(itTower);
			}.bind(this));
			return outData;
		};
	};

	var CPIT = BaseObject.extend("pinaki.ey.CIO.allocation.api.CPIT", {
		constructor: dataModel
	});
	return CPIT;
});