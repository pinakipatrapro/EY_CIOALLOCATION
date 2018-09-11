sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/SummaryGenerator",
	"sap/ui/model/Filter"
], function (Controller, Constants, SummaryGenerator,Filter) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationSummary", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationSummary").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			new SummaryGenerator(this.getView().getModel());
		},
		searchMappings: function (oEvent) {
			var list = oEvent.getSource().getParent().getParent();
			var searchString = oEvent.getParameter('query');
			list.getBinding('items').filter(this.getSearchFilters(searchString));
		},
		getSearchFilters: function (query) {
			return new Filter({
				filters: [
					new Filter("ITName", "Contains", query),
					new Filter("CCName", "Contains", query)
				],
				and: false
			});
		}

	});
});