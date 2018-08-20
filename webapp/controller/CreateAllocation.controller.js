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
			});
			this.getView().getModel().setProperty('/addAllocationMapingData', {
				map: map
			});
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
		},
		handleDrop : function(oEvent){
			if(!this.checkSelfMappingAllowed(oEvent.getParameter("dndEvent"))){
				sap.m.MessageToast.show('Self mapping not allowed');
				return;
			}
		},
		checkSelfMappingAllowed : function(oEvent){
			if(oEvent.getParameter('draggedControl') === oEvent.getParameter('droppedControl')){
				return oEvent.getParameter('draggedControl').getBindingContext().getProperty('selfMap');
			}else{
				return true;
			}
		}
	});
});