sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/SummaryGenerator",
], function (Controller, Constants,SummaryGenerator) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationSummary", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationSummary").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			new SummaryGenerator(this.getView().getModel());
		},

	});
});