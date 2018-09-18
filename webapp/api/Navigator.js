sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var constructor = function (that) {
		this._router = sap.ui.core.UIComponent.getRouterFor(that);
		this._aRoutes = [
			"CPIT",
			"ITIT",
			"ITBS",
			"CPBS",
			"BSB",
		];
		this.navNext = function () {
			var currentRoute = this.getCurrentRoute();
			var indexOfCurrentRoute =  this._aRoutes.indexOf(currentRoute);
			var nextRoute = this._aRoutes[indexOfCurrentRoute + 1 ];
			if(!nextRoute){
				this.navSummary();
				return;
			};
			this._router.navTo("CreateAllocationDetail", {
				id: nextRoute
			});
		};
		this.navSummary = function () {
			this._router.navTo("CreateAllocationDetail", {
				id: 'CPIT'
			});
			this._router.navTo("CreateAllocationDetail", {
				id: 'ITIT'
			});
			this._router.navTo("CreateAllocationDetail", {
				id: 'ITBS'
			});
			this._router.navTo("CreateAllocationDetail", {
				id: 'CPBS'
			});
			this._router.navTo("CreateAllocationDetail", {
				id: 'BSB'
			});
			this._router.navTo("CreateAllocationSummary");
		};
		this.navPrevious = function () {
			var currentRoute = this.getCurrentRoute();
			var indexOfCurrentRoute =  this._aRoutes.indexOf(currentRoute);
			var previousRoute = this._aRoutes[indexOfCurrentRoute - 1 ];
			if(!previousRoute){
				return;
			};
			this._router.navTo("CreateAllocationDetail", {
				id: previousRoute
			});
		};
		this.getCurrentRoute = function () {
			var aHash = window.location.hash.split('/');
			var currentPath = aHash[aHash.length - 1];
			return currentPath;
		};
	};

	var navigator = BaseObject.extend("pinaki.ey.CIO.allocation.api.CPIT", {
		constructor: constructor
	});
	return navigator;
});