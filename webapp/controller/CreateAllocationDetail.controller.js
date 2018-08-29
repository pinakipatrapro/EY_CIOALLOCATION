sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/CPIT"
], function (Controller, Constants,CPIT) {
	"use strict";
	var routeData = {
		id : ''
	};
	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationDetail", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationDetail").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			routeData.id = oEvent.getParameter("arguments").id;
			this.setData();
		},
		setData: function () {
			this.loadApi(this.getView().getModel());
			var aData = this.loadMockData();
			aData.forEach(function (e, index) {
				if (e.mapping === routeData.id) {
					this.getView().bindElement('/allocationData/' + index+"/");
				}
			}.bind(this))
		},
		loadMockData: function () {
			var data = [{"mapping":"CPIT","description":"Allocate Cost Center to IT Services","child":[{"level":"Cost Pool","name":"Internal Labour","value":1000,"root":true,"leaf":false,"childSum":1140,"nodeType":"display","child":[{"level":"Cost Center","name":"IT Operations","root":false,"leaf":false,"nodeType":"display","value":400,"childSum":230,"child":[{"level":"IT Tower","name":"Server","root":false,"nodeType":"value","leaf":false,"value":300,"childSum":430,"child":[{"level":"IT Sub Tower","name":"Server Internal","root":false,"leaf":false,"nodeType":"value","value":150,"childSum":230,"child":[{"level":"IT Service","name":"Exp Maintenance","root":false,"leaf":true,"nodeType":"value","value":100}]}]}]}]}]}];
			this.getView().getModel().setProperty('/allocationData', data);
			return data;
		},
		loadApi : function(){
			if(routeData.id === 'CPIT'){
				var CPITDataModel = new CPIT();
				CPITDataModel.loadData();
			}
		}
	});
});