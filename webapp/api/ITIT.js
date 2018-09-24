sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var dataModel = function (model) {
		this._data = []; // structure to hold the nested data

		this._model = model;

		this._ITServiceTower = '/ITServiceMaster?$select=ITTower';
		this._ITServiceTowerData = [];
		this._ITServiceSubTower = '/ITServiceMaster?$select=ITTower,ITSubTower';
		this._ITServiceSubTowerData = [];
		this._ITService = '/ITServiceMaster?$select=ITSubTower,ITService,ITServiceID';
		this._ITServiceData = [];

		this._endpoint = '/eyhcp/CIO/Allocation/Services/Allocation.xsodata';

		this.updateAllocations = function () {
			var dataFromCCtoITS = this._createITServiceExistingAllocation('raw');
			var itServices = this._model.getData().allocationData.ITIT[0].child;
			this._model.getData().allocationData.ITIT[0].value = 0;

			//Change as per percentage allocation
			itServices.forEach(function (e, i) {
				e.value = dataFromCCtoITS[i].value;
				this._model.getData().allocationData.ITIT[0].value = this._model.getData().allocationData.ITIT[0].value + e.value;
			}.bind(this));

			//Propagate Upwards
			var data = this._model.getData().allocationData.ITIT[0];
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
			//Auto allocate 100% 
			if(!this._model.getData().allocationData.ITIT["initialAllAlloc"]){
				this.autoAllocateParentToChild(); 
			}
			this._model.refresh(); //It is required to asynchronously update the bindings
		};
		this.autoAllocateParentToChild = function(){
			var allITIT = this._model.getData().allocationData.ITIT[0];
			var aITPServices = allITIT.child;
			
			allITIT.childSum = allITIT.value;
			allITIT.valueInPercentage = 100;
			
			aITPServices.forEach(function(e){ //IT Service Parent
				e.child.forEach(function (f) { //It tower
					f.child.forEach(function (g) { //It sub tower
						g.child.forEach(function (h) { //It services Child
						 if(h.id === e.id){
						 	f.value = e.value;
						 	g.value = e.value;
						 	h.value = e.value;
						 	
						 	f.valueInPercentage = 100;
						 	g.valueInPercentage = 100;
						 	h.valueInPercentage = 100;
						 	
						 	e.childSum = e.value;
						 	f.childSum = e.value;
						 	g.childSum = e.value;
						 	
						 }
						}.bind(this));
					}.bind(this));
				}.bind(this));    
			}.bind(this));
			this._model.getData().allocationData.ITIT["initialAllAlloc"] = true;
		};
		this.loadInitialData = function () {
			return new Promise(function (res, rej) {
				var dataLoadCompleted = new Promise(function (resolve, reject) {
					Promise.all([
						this._fetchData(this._ITServiceTower),
						this._fetchData(this._ITServiceSubTower),
						this._fetchData(this._ITService)
					]).then(function (value) {
						this._ITServiceTowerData = value[0];
						this._ITServiceSubTowerData = value[1];
						this._ITServiceData = value[2];
						resolve();
					}.bind(this));
				}.bind(this));
				dataLoadCompleted.then(function () {
					var ITST2ITS = this._buildITST2ITSHierarchy();
					var ITT2ITS = this._buildITT2ITSHierarchy(ITST2ITS);

					var initialHier = this._buildInitialHierarchy();
					var cpItsData = this._createITServiceExistingAllocation(initialHier, ITT2ITS);
					res(cpItsData);
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
		this._createITServiceExistingAllocation = function (initialHier, ITT2ITS) {
			var cpitData = this._model.getData().allocationData.CPIT;
			var oData = {};
			cpitData.forEach(function (e) { //Cost Pool
				e.child.forEach(function (f) { //CostCenter
					f.child.forEach(function (g) { //IT Tower
						g.child.forEach(function (h) { //IT Sub Tower
							h.child.forEach(function (i) { //IT Services
								oData[i.id + '-----' + i.name] = oData[i.id + '-----' + i.name] ? oData[i.id + '-----' + i.name] + i.value : i.value;
							});
						});
					});
				});
			});
			var outData = [];
			var parentSum = 0;
			Object.keys(oData).forEach(function (e) {
				outData.push({
					"level": "IT Service",
					"name": e.split('-----')[1],
					"root": false,
					"leaf": false,
					"id": e.split('-----')[0],
					"guid": "ITIT--ITS--Input--" + e.split('-----')[0],
					"nodeType": "display",
					"value": oData[e],
					"childSum": 0,
					"child": ITT2ITS ? JSON.parse(JSON.stringify(ITT2ITS)) : []
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
				"level": "IT Services",
				"name": 'All Services',
				"value": 0,
				"valueInPercentage": 0,
				"root": true,
				"id": null,
				"guid": "ITIT--ITSALL--All Services",
				"leaf": false,
				"childSum": 0,
				"nodeType": "display"
			});
			return dataOut;
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
					"guid": "ITIT--ITST--" + e["ITSubTower"],
					"nodeType": "value",
					"value": 0,
					"valueInPercentage": 0,
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
							"guid": "ITIT--ITS--" + f["ITServiceID"],
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
					"guid": "ITIT--ITT--" + e["ITTower"],
					"leaf": false,
					"value": 0,
					"valueInPercentage": 0,
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

	var ITIT = BaseObject.extend("pinaki.ey.CIO.allocation.api.ITIT", {
		constructor: dataModel
	});
	return ITIT;
});