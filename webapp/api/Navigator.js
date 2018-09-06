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
			this._router.navTo("CreateAllocationDetail", {
				id: nextRoute
			});
		};
		this.navPrevious = function () {
			var currentRoute = this.getCurrentRoute();
			var indexOfCurrentRoute =  this._aRoutes.indexOf(currentRoute);
			var previousRoute = this._aRoutes[indexOfCurrentRoute - 1 ];
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