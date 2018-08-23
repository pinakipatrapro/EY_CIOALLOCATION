sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants"
], function (Controller, Constants) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocation", {
		onAfterRendering: function () {
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
		},
		handleOnDragStart: function (oEvent) {
			var mapTo = oEvent.getSource().getBindingContext().getProperty("mapTo");
			this.hideUnmappedAvatars(mapTo, false);
		},
		hideUnmappedAvatars: function (mapTo, visible) {
			var map = this.getView().getModel().getProperty('/addAllocationMapingData').map;
			map.forEach(function (e) {
				if (mapTo.indexOf(e["id"]) < 0) {
					e["visible"] = visible;
				}else if(e["ghost"] === true){
					e["visible"] = true;
				}
			});
			this.getView().getModel().setProperty('/addAllocationMapingData', {
				map: map
			});
		},
		handleOnDragEnd: function (oEvent) {
			var map = this.getView().getModel().getProperty('/addAllocationMapingData').map;
			map.forEach(function (e) {
				e["visible"] = true;
				if(e["ghost"] === true){
					e["visible"] = false;
				}
			});
			this.getView().getModel().setProperty('/addAllocationMapingData', {
				map: map
			});
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
		},
		handleDrop : function(oEvent){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CreateAllocationDetail", {
				source: oEvent.getParameter('source').getBindingContext().getProperty('id'),
				target: oEvent.getParameter('target').getBindingContext().getProperty('id')
			});
		},
		onAllocationTypeChange : function(oEvent){
			var type = oEvent.getParameter('selectedItem').getProperty('text');
			var allocationDate = this.getView().byId('allocationDate');
			if(type =="Actual"){
				allocationDate.setValueFormat('yyyy-MM');
				allocationDate.setDisplayFormat('yyyy-MM');
			}else{
				allocationDate.setValueFormat('yyyy');
				allocationDate.setDisplayFormat('yyyy');
			}
		}
	});
});