sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants"
], function (Controller, Constants) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocation", {
		onAfterRendering: function () {
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
			this.getView().getModel().setData({
				type : "A",
				allocationYearMonth : "",
				budgetYearMonth : ""
			},true);
		},
		navToCostAllocDetails: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var selection = oEvent.getSource().getBindingContext().getProperty('selectVisible');

			oRouter.navTo("CreateAllocationDetail", {
				id: oEvent.getSource().getBindingContext().getProperty('id')
			});
		}
	});
});