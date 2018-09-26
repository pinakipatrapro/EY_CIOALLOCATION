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
				allocationYearMonth: new Date().getFullYear().toString() + '-' + new Date().getMonth().toString().padStart(2, 0),
				budgetYearMonth: new Date().getFullYear().toString()
			}, true);
		},
		masterSelectionChange: function () {
			var modelData = this.getView().getModel().getData();
			if (!!modelData.type.length && !!modelData.subType.length) {
				this.checkAllocationExists(modelData).then(function (e) {
					this.getView().setBusy(false);
					if (e === "null") {
						this.getView().getModel().setProperty('/mode', 'Create');
						this.getView().getModel().setProperty('/allocationGuid', '');
					} else {
						this.getView().getModel().setProperty('/mode', 'Edit');
						this.getView().getModel().setProperty('/allocationGuid', e);
						this.loadEditData(e);
					}
				}.bind(this));
			}
		},
		checkAllocationExists: function (modelData) {
			return new Promise(function (resolve, reject) {
				this.getView().setBusy(true);
				$.ajax({
					url: '/eyhcp/CIO/Allocation/Scripts/CheckVersionExists.xsjs',
					type: "POST",
					data: JSON.stringify({
						type: modelData.type,
						subType: modelData.subType,
						budgetYearMonth: modelData.budgetYearMonth,
						allocationYearMonth: modelData.allocationYearMonth,
					}),
					contentType: 'application/json; charset=utf-8',
					success: function (response) {
						resolve(response);
					},
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},
		loadEditData: function (guid) {
			var that = this;
			$.ajax({
				url: '/eyhcp/CIO/Allocation/Services/Allocation.xsodata/EditLog?$filter=GUID eq \'' + guid + '\'&$format=json',
				type: "GET",
				contentType: 'application/json; charset=utf-8',
				success: function (response) {
					that.getView().getModel().setProperty('/allocationEditLog', response.d.results);
				},
				error: function (error) {

				}
			});
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
			if (subType.length < 1) {
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
				this.getView().setBusy(false);
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
		},
		loadTimelineVersion: function (oEvent) {
			var that = this;
			var changeLogGUID = oEvent.getSource().getBindingContext().getProperty('ChangeLogGUID');
			$.ajax({
				url: '/eyhcp/CIO/Allocation/Scripts/OpenEditLogVersion.xsjs',
				type: "POST",
				contentType: 'application/json; charset=utf-8',
				data: JSON.stringify({
					guid: changeLogGUID,
					allocationGuid: that.getView().getModel().getProperty('/allocationGuid')
				}),
				success: function (response) {
					that.applyDraftValues(response);
					that.getView().getModel().setProperty('/mode', 'Create');
				},
				error: function (error) {

				}
			});
		},
		resetToThisVersion: function (oEvent) {
			var that = this;
			var changeLogGuid = oEvent.getSource().getBindingContext().getProperty('ChangeLogGUID');
			var allocationGuid = oEvent.getSource().getBindingContext().getProperty('GUID');
			$.ajax({
				url: '/eyhcp/CIO/Allocation/Scripts/RevertVersion.xsjs?guid=' + changeLogGuid + '&allocationGuid=' + allocationGuid,
				type: "GET",
				success: function (response) {
					sap.m.MessageToast.show(response);
					that.masterSelectionChange();
				},
				error: function (error) {
					sap.m.MessageToast.show('Error reverting version');
				}
			});
		},
		editTimelineSelect: function (oEvent) {
			var selectedItem = oEvent.getSource().getParent();
			var timelineGuid = selectedItem.getBindingContext().getProperty('ChangeLogGUID');
			var list = new sap.m.List({
				styleClass : 'sapUiSmallMargin',
				noDataText : "No change(s) found ",
				items: {
					path: '/GUID(IP_GUID=\'' + timelineGuid + '\')/Execute',
					template: new sap.m.StandardListItem({
						title: '{FromName}({FromID}) to {ToName}({ToID})',
						icon : '{= ${DeltaType} === "Changes" ? "sap-icon://journey-change" : ${DeltaType} === "Additions"?"sap-icon://add":"sap-icon://negative" }',
						description : 'Value {Percentage} %',
						infoState : '{= ${DeltaType} === "Changes" ? "Warning" : ${DeltaType} === "Additions"?"Success":"Error" }',
						info : '{= ${DeltaType} === "Changes" ? "Changed from " + ${PercentageFrom} + "%" : ${DeltaType} === "Additions"?"Added":"Deleted" }'
					}),
					sorter :[	new sap.ui.model.Sorter('TypeDescription',false,true),
								new sap.ui.model.Sorter('DeltaType',false,false)
							]
				}
			});
			list.setModel(this.getView().getModel('viewModel'));
			var dialog = new sap.m.Dialog({
				resizable : true,
				stretch : true,
				draggable : true,
				customHeader : new sap.m.Toolbar({
					content : [
						new sap.m.ToolbarSpacer(),
						new sap.m.Label({text:"Changes made in selected version", design:"Bold"}),
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							icon: 'sap-icon://decline',
							press : function(oEvent){
								oEvent.getSource().getParent().getParent().close();
							}
						}),
					]
				}),
				content: list
			});
			dialog.open();
		},
	});
});