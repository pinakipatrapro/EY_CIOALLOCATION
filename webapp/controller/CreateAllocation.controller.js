sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"sap/m/MessageToast",
	"sap/m/Button",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/Navigator"
], function (Controller, Constants, MessageToast, Button, Navigator) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocation", {
		onAfterRendering: function () {
			this.getView().getModel().setProperty('/addAllocationMapingData', Constants);
			this.getView().getModel().setData({
				type: "A",
				subType: "",
				allocationYearMonth: "2018-09",
				budgetYearMonth: "2018"
			}, true);
		},
		navToCostAllocDetails: function (oEvent, directNav) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var model = this.getView().getModel();
			var type = model.getProperty('/type');
			var subType = model.getProperty('/subType');
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
			if(subType.length <1 ){
				validation = false;
			}
			if (validation) {
				oRouter.navTo("CreateAllocationDetail", {
					id: !!oEvent ? oEvent.getSource().getBindingContext().getProperty('id') : directNav
				});
				model.setProperty('/allocationYearMonthEnabled', false);
				model.setProperty('/budgetYearMonthEnabled', false);
				model.setProperty('/typeEnabled', false);
				model.setProperty('/subTypeEnabled', false);
			} else {
				sap.m.MessageToast.show('Please fill in the required details');
			}
		},
		openDraft: function (oEvent) {
			var guid = oEvent.getSource().getBindingContextPath().split('\'')[1];
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: 'All existing changes will be overwritten. Are you sure?'
				}),
				beginButton: new Button({
					text: 'Submit',
					press: function () {
						that.getView().setBusy(true);
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
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		applyDraftValues: function (data) {
			var that = this;
			var data = JSON.parse(atob(data));
			this.navToCostAllocDetails(undefined, 'CPIT');
			var model = this.getView().getModel();
			model.setProperty('/allocationData/dataLoaded', null);
			model.setProperty('/changes', data);
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
				setTimeout(function () {
					MessageToast.show('Draft/Template Loaded Successfully');
					that.getView().setBusy(false);
				}.bind(this), 100);
			}.bind({
				data: data,
				model: model,
				that: that
			}));
		},
		navToSummary: function (oEvent) {
			var navigator = new Navigator(this);
			navigator.navSummary();
		},
		reloadPage: function () {
			window.location.reload();
		},
		deleteDraftTemplate: function (oEvent) {
			var guid = oEvent.getParameter('listItem').getBindingContextPath().split('\'')[1];
			var model = this.getView().getModel('viewModel');
			var list = oEvent.getSource();
			list.setBusy(true);
			$.ajax({
				url: '/eyhcp/CIO/Allocation/Scripts/DeleteDraft.xsjs?guid=' + guid,
				type: "GET",
				success: function (response) {
					MessageToast.show(response);
					model.refresh();
					list.setBusy(false);
				},
				error: function (error) {
					MessageToast.show('Error Deleting Draft');
					list.setBusy(false);
				}
			});
		}
	});
});