sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/SummaryGenerator",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/Navigator",
	"sap/m/MessageBox"
], function (Controller, Constants, SummaryGenerator, Filter, MessageToast, Navigator, MessageBox) {
	"use strict";
	var navigator = null;
	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationSummary", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationSummary").attachPatternMatched(this._onRouteMatched, this);
			navigator = new Navigator(this);
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
					new Filter("CCName", "Contains", query),
					new Filter("BSName", "Contains", query),
					new Filter("BName", "Contains", query),
					new Filter("ITSPName", "Contains", query),
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
				name: ''
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
								name: oEvent.getSource().getParent().getContent()[0].getValue()
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
								error: function (error) {}
							});
							oEvent.getSource().getParent().close();
						}
					})
				]
			});
			dialog.open();
		},
		saveAllocation: function (oEvent) {
			this.checkIfErrorExists().then(function () {
				this.triggerSaveRequest(this.formatSaveData()).then(function (e) {
					MessageBox.success(
						"Allocations Saved Successfully", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Successfully Saved",
							onClose: function (oAction) {
								navigator.navToAllocationHome();
								window.location.reload();
							}
						}
					);

				}.bind(this)).catch(function (e) {
					MessageToast.show("Error saving allocations");
				});
			}.bind(this)).catch(function (e) {
				MessageToast.show(e);
			});
		},
		checkIfErrorExists: function () {
			return new Promise(function (resolve, reject) {
				var modelData = this.getView().getModel().getData().summary.validationMessages;
				var total = modelData.ITIT.count +
					modelData.BSB.count +
					modelData.CPITBS.count +
					modelData.ITBS.count;
				if (total === 0) {
					resolve();
				} else {
					reject(total + ' Errors occured. Please correct before saving. Alternatively use the save draft option ');
				}
			}.bind(this));
		},
		formatSaveData: function () {
			var data = this.getView().getModel().getData();
			var outData = {
				alllcationType: data.type,
				allocationSubType: data.subType,
				actualPeriod: data.allocationYearMonth,
				budgetPeriod: data.budgetYearMonth,
				allocationGuid: data.allocationGuid,
				mode: data.allocationGuid.length > 0 ? 'Edit' : 'Create',
				name: '',
				description: '',
				userName: sap.ushell.Container.getService("UserInfo").getUser().getFullName(),
				userId: sap.ushell.Container.getService("UserInfo").getId(),
				deviceInfo: '',
				changes: Object.keys(data.changes).length,
				changeData: JSON.stringify(data.changes),
				allocatedData: [{
					data: data.summary.BSB,
					typeDescription: 'Business to Business Service',
					type: 'BSB'
				}, {
					data: data.summary.ITIT,
					typeDescription: 'IT Service to IT Service',
					type: 'ITIT'
				}, {
					data: data.summary.ITBS,
					typeDescription: 'IT Service to Business Service',
					type: 'ITBS'
				}, {
					data: data.summary.CPIT,
					typeDescription: 'Cost Pool to IT Service',
					type: 'CPIT'
				}, {
					data: data.summary.CPBS,
					typeDescription: 'Cost Pool to Business Service',
					type: 'CPBS'
				}, ]
			};
			return outData;
		},
		triggerSaveRequest: function (data) {
			return new Promise(function (resolve, reject) {
				$.ajax({
					url: '/eyhcp/CIO/Allocation/Scripts/SaveAllocation.xsjs',
					type: "POST",
					data: JSON.stringify(data),
					contentType: 'application/json; charset=utf-8',
					success: function (response) {
						resolve(response);
					},
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		}

	});
});