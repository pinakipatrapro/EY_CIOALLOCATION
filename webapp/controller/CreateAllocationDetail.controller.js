sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/CPIT"
], function (Controller, Constants, CPIT) {
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
					}
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
				if (!this.getView().getModel().getProperty('/allocationData/CPIT/editingCompleted')) {
					var CPITDataModel = new CPIT();
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
				if (!this.getView().getModel().getProperty('/allocationData/ITIT/editingCompleted')) {
					var CPITDataModel = new CPIT();
					this.getView().setBusy(true);
					CPITDataModel.loadInitialData().then(function (data) {
						this.getView().setBusy(false);
						// this.getView().getModel().setProperty('/allocationData/ITIT', data);
						this.getView().getModel().setProperty('/allocationData/ITIT/editingCompleted', false);
						this.getView().getModel().setProperty('/allocationData/ITIT/currentPathDesc', 'Map IT Services to IT Services');
					}.bind(this));
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
			var changedValue = oEvent.getParameter('value');
			changedValue.length == 0 ? changedValue = 0 : '';
			var path = oEvent.getSource().getBindingContext().sPath;
			var reachedTop = false;
			var model = this.getView().getModel();
			var currentObject = model.getProperty(path);
			currentObject.value = parseFloat(changedValue);

			if (currentObject["previousValue"] == undefined) {
				currentObject["previousValue"] = 0;
			}

			//Get Parent
			var aContexts = path.split('/');
			aContexts.pop();
			aContexts.pop();
			path = aContexts.join('/');

			var parentObject = model.getProperty(path);
			if (parentObject.childSum !== undefined) {
				var sum = parseFloat(parentObject.childSum) + parseFloat(changedValue) - parseFloat(currentObject["previousValue"]);
				if (sum > parentObject.value) {
					sap.m.MessageToast.show('Error : Sum of value cannot be greater than the total allocated values');
					currentObject.value = currentObject["previousValue"];
				} else {
					parentObject.childSum = sum;
				}
			} else {
				reachedTop = true;
			}
			currentObject["previousValue"] = currentObject.value.length == 0 ? 0 : currentObject.value;

			// getSuperParent-Peers
			var aContexts = path.split('/');
			aContexts.pop();
			path = aContexts.join('/');
			var parentPeerSum = 0;

			var aParentPeers = model.getProperty(path);
			aParentPeers.forEach(function (e) {
				parentPeerSum = parentPeerSum + e.childSum;
			});

			var aContexts = path.split('/');
			aContexts.pop();
			path = aContexts.join('/');

			var aParentParent = model.getProperty(path);
			if (aParentParent.level === 'Cost Pool') {
				aParentParent.childSum = parentPeerSum;
			}
		}
	});
});