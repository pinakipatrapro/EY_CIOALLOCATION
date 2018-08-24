sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants"
], function (Controller, Constants) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocation", {
		onAfterRendering: function () {
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
		},
		navToCostAllocDetails: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var selection = oEvent.getSource().getBindingContext().getProperty('selectVisible');

			oRouter.navTo("CreateAllocationDetail", {
				id: oEvent.getSource().getBindingContext().getProperty('id')
			});

			setTimeout(function () {
				if (selection) {
					this.openCostPoolSelectionDialog();
				}
			}.bind(this), 100);

		},
		openCostPoolSelectionDialog: function () {
			var that  = this;
			new sap.m.Dialog({
				headerText : "Select Cost Pool",
				title : "Select Cost Pool",
				content : [
					new sap.m.Select({
						width : '100%',
						items : [
							new sap.ui.core.Item({text:"Internal Labour",key:"IL"}),
							new sap.ui.core.Item({text:"External Labour",key:"EL"})
						],
						change : function(oEvent){
							that.getView().getModel().setProperty('/selectedCostPool', oEvent.getSource().getSelectedKey());
							oEvent.getSource().getParent().close();
						}
					})
				]
			}).open();
		}

	});
});