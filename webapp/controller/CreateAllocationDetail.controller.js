sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/AllocationGraphIT2IT"
], function (Controller, Constants, AllocationGraphIT2IT) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationDetail", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationDetail").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			var source = oEvent.getParameter("arguments").source;
			var target = oEvent.getParameter("arguments").target;
			this._callApi(source, target);
		},
		_callApi: function (source, target) {
			if (source === "ITS" && target === "ITSG") {
				this.mapITSwithITSG();
			}
		},
		mapITSwithITSG: function () {
			var allocationGraph = new AllocationGraphIT2IT(this.getView().getModel());
		},
		openNodeAdditionDialog: function (oEvent) {
			var that = this;
			var level = oEvent.getSource().getBindingContext().getProperty('level');
			this.getView().getModel().setProperty('/allocationGraphMetadata/tempSource', oEvent.getSource().getBindingContext().getObject());
			var parentValue = oEvent.getSource().getBindingContext().getProperty('title');
			var selectDialog = new sap.m.SelectDialog({
				items: {
					path: '/allocationGraphMetadata/' + level + '/values',
					template: new sap.m.StandardListItem({
						title: "{name}"
					})
				},
				confirm: function (oEvent) {
					var selectionContext = oEvent.getParameter('selectedItem').getBindingContext();

					that.getView().getModel().setProperty('/allocationGraphMetadata/tempTarget', selectionContext.getObject());
					that.getView().getModel().setProperty('/allocationGraphMetadata/tempTargetContext', selectionContext.sPath.substring(0, 26));
					that.getView().getModel().getProperty('/allocationObject').createNode();
				}
			});
			selectDialog.setModel(this.getView().getModel());
			selectDialog.open();
			if (parentValue) {
				selectDialog.getBinding('items').filter([new sap.ui.model.Filter('parent', 'EQ', parentValue)]);
			}
		},
		deleteNode : function(oEvent){
			
		}
	});
});