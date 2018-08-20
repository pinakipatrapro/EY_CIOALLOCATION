sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.Home", {
		navToCreateAllocation: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CreateAllocation");
		},
		toggleSidebar: function (oEvent) {
			var toolPage = oEvent.getSource().getParent().getParent().getParent();
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		}
	});
});