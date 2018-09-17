sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
		"sap/m/MessageToast"
], function (Controller, Constants,MessageToast) {
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
		navToCostAllocDetails: function (oEvent, directNav) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
					id: !!oEvent ? oEvent.getSource().getBindingContext().getProperty('id') : directNav
				});
				model.setProperty('/allocationYearMonthEnabled', false);
				model.setProperty('/budgetYearMonthEnabled', false);
				model.setProperty('/typeEnabled', false);
			} else {
				sap.m.MessageToast.show('Please fill in the required details');
			}
		},
		openDraft: function (oEvent) {
			var guid = oEvent.getSource().getBindingContextPath().split('\'')[1];
			var that = this;
			$.ajax({
				url: '/eyhcp/CIO/Allocation/Services/Allocation.xsodata/DraftTemplate?$select=Data&$filter=GUID eq \'' + guid +
					'\'&$format=json',
				type: "GET",
				success: function (response) {
					that.applyDraftValues(response.d.results[0].Data);
				},
				error: function (error) {
					alert('Error Retriving Draft');
				}
			});
		},
		applyDraftValues: function (data) {
			var that = this;
			var data = JSON.parse(atob(data));
			this.navToCostAllocDetails(undefined, 'CPIT');
			var model = this.getView().getModel();
			model.setProperty('/allocationData/dataLoaded',null);
			model.setProperty('/changes',data);
			if (!this.getView().getModel().getProperty('/draftLoadEvent')) {
				var event = new Event('MasterDataBuildCompleted');
				this.getView().getModel().setProperty('/draftLoadEvent', event);
			}
			window.addEventListener('MasterDataBuildCompleted', function () {
				Object.keys(this.data).forEach(function (e) {
					this.model.setProperty(e + '/valueInPercentage', this.data[e]);

				}.bind(this));
				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("CreateAllocation");
				this.model.refresh();
				MessageToast.show('Draft Loaded Successfully');
			}.bind({
				data: data,
				model: model,
				that: that
			}));
		}
	});
});