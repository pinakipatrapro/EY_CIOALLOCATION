sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"sap/m/MessageToast",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/CPIT",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/ITIT"
], function (Controller, Constants, MessageToast, CPIT, ITIT) {
	"use strict";
	var routeData = {
		id: ''
	};
	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationDetail", {
		onInit: function () {
			setTimeout(function () {
				this.getView().getModel().setData({
					allocationData: {
						CPIT: null,
						ITIT: null,
						currentPathDesc: ''
					},
					changes: {}
				}, true);
			}.bind(this), 0);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateAllocationDetail").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			routeData.id = oEvent.getParameter("arguments").id;
			this.setData();
		},
		setData: function () {
			this.loadApi(this.getView().getModel());
		},
		loadApi: function () {
			if (routeData.id === 'CPIT' && !this.getView().getModel().getProperty('/allocationData/CPIT/editingCompleted')) {
				this.getView().bindElement('/allocationData/CPIT');
				var editingComleted = this.getView().getModel().getProperty('/allocationData/CPIT/editingCompleted');
				if (editingComleted || editingComleted == undefined) {
					var CPITDataModel = new CPIT(this.getView().getModel());
					this.getView().setBusy(true);
					CPITDataModel.loadInitialData().then(function (data) {
						this.getView().setBusy(false);
						this.getView().getModel().setProperty('/allocationData/CPIT', data);
						this.getView().getModel().setProperty('/allocationData/CPIT/editingCompleted', false);
						this.getView().getModel().setProperty('/allocationData/CPIT/currentPathDesc', 'Map Cost Pool to IT Services');
					}.bind(this));
				}
			}
			if (routeData.id === 'ITIT') {
				this.getView().bindElement('/allocationData/ITIT');
				var editingComleted = this.getView().getModel().getProperty('/allocationData/ITIT/editingCompleted');
				if (editingComleted || editingComleted == undefined) {
					var ITITDataModel = new ITIT(this.getView().getModel());
					this.getView().setBusy(true);
					ITITDataModel.loadInitialData().then(function (data) {
						this.getView().setBusy(false);
						this.getView().getModel().setProperty('/allocationData/ITIT', data);
						this.getView().getModel().setProperty('/allocationData/ITIT/editingCompleted', false);
						this.getView().getModel().setProperty('/allocationData/ITIT/currentPathDesc', 'Map IT Services to IT Services');
					}.bind(this));
				} else {
					var ITITDataModel = new ITIT(this.getView().getModel());
					ITITDataModel.updateAllocations();
				}
			}
		},
		openCostPoolSelection: function (oEvent) {
			var that = this;
			var source = oEvent.getSource();
			var path = source.getBindingContext().sPath;
			var model = source.getModel();
			var parentPath = path.substring(0, path.lastIndexOf('/'));
			var cpPopover = new sap.m.Popover({
				showHeader: false,
				content: new sap.m.List({
					items: {
						path: '',
						template: new sap.m.StandardListItem({
							title: "{name}",
							type: "Active",
							press: function (oEvent) {
								var event = oEvent;
								oEvent.getSource().getParent().getParent().close();
								that.changeCostPool(event);
							}
						})
					}
				})
			});
			cpPopover.bindElement(parentPath);
			cpPopover.setModel(model);
			cpPopover.openBy(source);
		},
		changeCostPool: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().sPath;
			var newContext = path.substring(path.lastIndexOf('/') + 1, path.length) + '/';
			this.getView().byId("idObjectHeader").bindElement(newContext);
			this.getView().byId("idParentSplitter").bindElement(newContext);
		},
		listSelectSetBinding: function (oEvent) {
			var selectedItem = oEvent.getParameter('listItem');
			var path = selectedItem.getBindingContext().sPath;
			var newContext = path.substring(path.indexOf('child'), path.length) + '/';

			var list = oEvent.getSource();
			var panel = list.getParent();
			var splitter = panel.getParent();

			var panelIndex = splitter.indexOfContentArea(panel);
			var contents = splitter.getContentAreas();

			var child = contents[panelIndex + 1];
			child.bindElement(newContext);

			// SetVisibility
			contents.forEach(function (e) {
				e.setVisible(true);
			});
			var isSelected = 'X';
			for (var i = 0; i < contents.length; i++) {
				var list = contents[i].getContent()[0];
				if (isSelected !== 'X') {
					contents[i].setVisible(false);
				} else if (list.getSelectedItem() === null) {
					isSelected = ' ';
				}
			}

		},
		onValueChange: function (oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();
			var path = oEvent.getSource().getBindingContext().getPath();
			var model = this.getView().getModel();
			this.setValueHistory(currentObject);
			//
			if(oEvent.getSource().getValue().length === 0){
				oEvent.getSource().setValue(0);
			}
			//Get Peers
			var aPeersPath = path.split('/');
			aPeersPath.pop();

			var aPeers = model.getProperty(aPeersPath.join('/'));
			var peersTotal = 0;
			aPeers.forEach(function (e) {
				peersTotal = peersTotal + e.valueInPercentage;
			});
			if (peersTotal > 100) {
				currentObject.valueInPercentage = currentObject.previousValue;
				this.showMessageToast('Sum of percenage cannot be greater than 100');
				return;
			} else {
				this.propagatePercChangeCPIT(path);
			}
		},
		setValueHistory: function (object) {
			if (!object["previousValue"]) {
				object["previousValue"] = 0;
			}
			setTimeout(function () {
				object["previousValue"] = object.valueInPercentage;
			}.bind(this), 0);
		},
		addToChangeLog: function (oEvent) {
			var changedObject = oEvent.getSource().getBindingContext().getObject();
			var model = this.getView().getModel();
			var existingData = model.getProperty('/changes');

			existingData[changedObject.guid] = changedObject.valueInPercentage;

			model.setProperty('/changes', existingData);
		},
		propagatePercChangeCPIT: function (path) {
			var model = this.getView().getModel();
			var currentObjectPath = path;
			//Propagate Upwards
			do {
				var currentObject = model.getProperty(path);
				var parentObject = this.getParentObject(path, 2).data;
				var aPeers = this.getParentObject(path, 1).data;
				if (currentObject.valueInPercentage !== undefined) {
					currentObject.value = Math.round(currentObject.valueInPercentage * parentObject.value) / 100;
				}

				parentObject.childSum = 0;
				aPeers.forEach(function (e) {
					if (parentObject.root) {
						parentObject.childSum = parentObject.childSum + e.childSum;
					} else {
						parentObject.childSum = parentObject.childSum + e.value;
					}
				});
				path = this.getParentObject(path, 2).path;
			} while (!!this.getParentObject(path, 2).data && !parentObject.root);

			//Propagate Downwards
			var currentObject = model.getProperty(currentObjectPath);
			if (!currentObject.child) {
				return;
			}
			currentObject.childSum = 0;
			currentObject.child.forEach(function (e) {
				e.value = Math.round(e.valueInPercentage * currentObject.value) / 100;
				currentObject.childSum = currentObject.childSum + e.value;
				if (!e.child) {
					return;
				}
				e.child.forEach(function (f) {
					e.childSum = 0;
					f.value = Math.round(f.valueInPercentage * e.value) / 100;
					e.childSum = e.childSum + e.value;
					if (!f.child) {
						return;
					}
					f.child.forEach(function (g) {
						f.childSum = 0;
						g.value = Math.round(g.valueInPercentage * f.value) / 100;
						f.childSum = f.childSum + f.value;
					}.bind(this));
				}.bind(this));
			}.bind(this));

		},
		getParentObject: function (path, i) {
			var model = this.getView().getModel();
			var aPath = path.split('/');
			while (i > 0) {
				aPath.pop();
				i--;
			}
			return {
				data: model.getProperty(aPath.join('/')),
				path: aPath.join('/')
			};
		},
		showMessageToast: function (message) {
			MessageToast.show(message);
		}
	});
});