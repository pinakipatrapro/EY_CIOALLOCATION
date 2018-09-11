sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants"
], function (Controller, Constants) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocation", {
		onAfterRendering: function () {
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
			this.getView().getModel().setData({
				type: "A",
				allocationYearMonth: "2018-09",
				budgetYearMonth: "2018"
			}, true);
		},
		navToCostAllocDetails: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var selection = oEvent.getSource().getBindingContext().getProperty('selectVisible');
			var model = this.getView().getModel();
			var type = model.getProperty('/type');
			var allocationYearMonth = model.getProperty('/allocationYearMonth');
			var budgetYearMonth = model.getProperty('/budgetYearMonth');
			var validation = false;
			if (type === "A") {
				if (allocationYearMonth) {
					validation = true;
				}
			} else {
				if (budgetYearMonth) {
					validation = true;
				}
			}
			if (validation) {
				oRouter.navTo("CreateAllocationDetail", {
					id: oEvent.getSource().getBindingContext().getProperty('id')
				});
				model.setProperty('/allocationYearMonthEnabled',false);
				model.setProperty('/budgetYearMonthEnabled',false);
				model.setProperty('/typeEnabled',false);
			} else {
				sap.m.MessageToast.show('Please fill in the required details');
			}
		}
	});
});