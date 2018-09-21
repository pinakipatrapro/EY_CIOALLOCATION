sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"pinaki/ey/CIO/allocation/CIOAllocation/util/Constants",
	"sap/m/MessageToast",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/Navigator",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/CPIT",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/ITIT",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/ITBS",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/CPBS",
	"pinaki/ey/CIO/allocation/CIOAllocation/api/BSB"
], function (Controller, Constants, MessageToast, Navigator, CPIT, ITIT, ITBS, CPBS, BSB) {
	"use strict";
	var routeData = {
		id: ''
	};
	var navigator = null;
	return Controller.extend("pinaki.ey.CIO.allocation.CIOAllocation.controller.CreateAllocationDetail", {
		navToNextAllocation: function (oEvent) {
			navigator.navNext();
		},
		navToPreviousAllocation: function (oEvent) {
			navigator.navPrevious();
		},
		navToSummary: function (oEvent) {
			navigator.navSummary();
		},
		onInit: function () {
			navigator = new Navigator(this);
			setTimeout(function () {
				this.getView().getModel().setData({
					allocationData: {
						CPIT: null,
						ITIT: null,
						ITBS: null,
						CPBS: null,
						BSB: null,
						currentPathDesc: '',
						dataLoaded: false
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
			var model = this.getView().getModel();
			var CPITDataModel = new CPIT(model);
			var ITITDataModel = new ITIT(model);
			var ITBSDataModel = new ITBS(model);
			var CPBSDataModel = new CPBS(model);
			var BSBDataModel = new BSB(model);

			if (!model.getProperty('/allocationData/dataLoaded')) {
				this.getView().setBusy(true);
				var generateData = new Promise(function (resolve, reject) {
					CPITDataModel.loadInitialData().then(function (e) {
						model.setProperty('/allocationData/CPIT', e);
						ITITDataModel.loadInitialData().then(function (f) {
							model.setProperty('/allocationData/ITIT', f);
							ITBSDataModel.loadInitialData().then(function (g) {
								model.setProperty('/allocationData/ITBS', g);
								CPBSDataModel.loadInitialData().then(function (h) {
									model.setProperty('/allocationData/CPBS', h);
									BSBDataModel.loadInitialData().then(function (i) {
										model.setProperty('/allocationData/BSB', i);
										model.setProperty('/allocationData/dataLoaded', true);
										this.getView().setBusy(false);
										resolve();
									}.bind(this));
								}.bind(this));
							}.bind(this).bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
				generateData.then(function () {
					this.loadApi(model);
					setTimeout(function(){
						var event = this.getView().getModel().getProperty('/draftLoadEvent');	
						if(!!event){
							window.dispatchEvent(event);
						}
					}.bind(this),0);
				}.bind(this));
			} else {
				this.loadApi(model);
			}

		},
		loadApi: function () {
			this.routeChangeResetVisibility();
			if (routeData.id === 'CPIT') {
				this.getView().bindElement('/allocationData/CPIT');
				this.getView().getModel().setProperty('/allocationData/CPIT/currentPathDesc', 'Map Cost Pool to IT Services');
				var CPITDataModel = new CPIT(this.getView().getModel());
				CPITDataModel.updateAllocations();

			}
			if (routeData.id === 'ITIT') {
				this.getView().bindElement('/allocationData/ITIT');
				this.getView().getModel().setProperty('/allocationData/ITIT/currentPathDesc', 'Map IT Services to IT Services');
				var ITITDataModel = new ITIT(this.getView().getModel());
				ITITDataModel.updateAllocations();
			}
			if (routeData.id === 'ITBS') {
				this.getView().bindElement('/allocationData/ITBS');
				this.getView().getModel().setProperty('/allocationData/ITBS/currentPathDesc', 'Map IT Services to Business Services');
				var ITBSDataModel = new ITBS(this.getView().getModel());
				ITBSDataModel.updateAllocations();
			}
			if (routeData.id === 'CPBS') {
				this.getView().bindElement('/allocationData/CPBS');
				this.getView().getModel().setProperty('/allocationData/CPBS/currentPathDesc', 'Map Cost Pool to Business Services');
				var CPBSDataModel = new CPBS(this.getView().getModel());
				CPBSDataModel.updateAllocations();
			}
			if (routeData.id === 'BSB') {
				this.getView().bindElement('/allocationData/BSB');
				this.getView().getModel().setProperty('/allocationData/BSB/currentPathDesc', 'Map Business Services to Busines');
				var BSBDataModel = new BSB(this.getView().getModel());
				BSBDataModel.updateAllocations();
			}
		},
		routeChangeResetVisibility :function(){
			var splitter = this.getView().byId("idParentSplitter");
			var aPanel = splitter.getContentAreas();
			for(var i = 1;i<aPanel.length;i++){
				aPanel[i].setVisible(false);
				aPanel[i].getContent()[0].removeSelections();
			};
			var objectHeader = this.getView().byId("idObjectHeader");
			objectHeader.bindElement("0/");
			splitter.bindElement("0/");
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
			var type = selectedItem.getType();
			if (type !== "Inactive") {
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
			}
		},
		onValueChange: function (oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();
			var path = oEvent.getSource().getBindingContext().getPath();
			var model = this.getView().getModel();
			this.setValueHistory(currentObject);
			//
			if (oEvent.getSource().getValue().length === 0) {
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
				if (this.CPITCPBSException(oEvent)) {
					currentObject.valueInPercentage = currentObject.previousValue;
					this.showMessageToast('Total allocated amount in IT Services and Business Services exceeds the total cost pool amount');
				}
				this.propagatePercChangeCPIT(path);
				this.addToChangeLog(oEvent);
			}
		},
		CPITCPBSException: function (oEvent) {
			var level = oEvent.getSource().getBindingContext().getObject().level;
			if(level !== "IT Tower" && level !== "Business Service"){
				return;
			}
			var model = oEvent.getSource().getModel();
			var sourcePath = oEvent.getSource().getBindingContext().getPath();
			if (sourcePath.indexOf('CPIT') + sourcePath.indexOf('CPBS') < 0) {
				return false;
			}
			var cpitPercValuePath = sourcePath.replace('CPBS', 'CPIT');
			var cpbsPercValuePath = sourcePath.replace('CPIT', 'CPBS');
			var cpitPercValue = model.getProperty(cpitPercValuePath).valueInPercentage;
			if (!model.getProperty(cpbsPercValuePath)) {
				return false;
			}
			var cpbsPercValue = model.getProperty(cpbsPercValuePath).valueInPercentage;
			if (cpitPercValue + cpbsPercValue > 100) {
				return true;
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
			var changedPath = oEvent.getSource().getBindingContext().getPath();
			existingData[changedPath] = changedObject.valueInPercentage;

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
				e.childSum = 0;
				e.child.forEach(function (f) {
					f.value = Math.round(f.valueInPercentage * e.value) / 100;
					e.childSum = e.childSum + f.value;
					if (!f.child) {
						return;
					}
					f.childSum = 0;
					f.child.forEach(function (g) {
						g.value = Math.round(g.valueInPercentage * f.value) / 100;
						f.childSum = f.childSum + g.value;
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