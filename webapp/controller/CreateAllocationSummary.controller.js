sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/SummaryGenerator",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
], function (Controller, Constants, SummaryGenerator, Filter, MessageToast) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationSummary", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationSummary").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			new SummaryGenerator(this.getView().getModel());
		},
		navBack: function (oEvent) {
			window.history.go(-1);
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
		},
		saveDraft: function () {
			var that = this;
			var changes = this.getView().getModel().getProperty('/changes');
			var data = {
				changes: JSON.stringify(changes),
				userName: sap.ushell.Container.getService("UserInfo").getUser().getFullName(),
				type: 'Draft',
				name : ''
			};
			$.ajax({
				url: '/eyhcp/CIO/Allocation/Scripts/SaveDraft.xsjs',
				type: "POST",
				data: JSON.stringify(data),
				contentType: 'application/json; charset=utf-8',
				success: function (response) {
					MessageToast.show("Draft Saved Successfully");
					that.getView().getModel('viewModel').refresh();
				},
				error: function (error) {

				}
			});
		},
		saveTemplate: function () {
			var that = this;
			var changes = this.getView().getModel().getProperty('/changes');
			var dialog = new sap.m.Dialog({
				title: 'Create Template',
				content: [
					new sap.m.Input({
						placeholder: 'Template Name',
						value: 'Template-' + new Date().toUTCString()
					}),
				],
				buttons: [
					new sap.m.Button({
						text: "Cancel",
						press: function (oEvent) {
							oEvent.getSource().getParent().close();
						}
					}),
					new sap.m.Button({
						text: "Save",
						press: function (oEvent) {
							var data = {
								changes: JSON.stringify(changes),
								userName: sap.ushell.Container.getService("UserInfo").getUser().getFullName(),
								type: 'Template',
								name : oEvent.getSource().getParent().getContent()[0].getValue()
							};
							$.ajax({
								url: '/eyhcp/CIO/Allocation/Scripts/SaveDraft.xsjs',
								type: "POST",
								data: JSON.stringify(data),
								contentType: 'application/json; charset=utf-8',
								success: function (response) {
									MessageToast.show("Template Saved Successfully");
									that.getView().getModel('viewModel').refresh();
								},
								error: function (error) {
								}
							});
							oEvent.getSource().getParent().close();
						}
					})
				]
			});
			dialog.open();
		}

	});
});