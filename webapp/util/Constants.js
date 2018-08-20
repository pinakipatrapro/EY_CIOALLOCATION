sap.ui.define([], function () {
	"use strict";
	return {
		map: [{
			"name": "Cost Pool",
			"id": "CP",
			"visible":true,
			"selfMap":false,
			"icon": "sap-icon://capital-projects",
			"mapTo": ["ITS", "BS","CP"]
		}, {
			"name": "IT Service",
			"id": "ITS",
			"visible":true,
			"selfMap":true,
			"icon":"sap-icon://it-system",
			"mapTo": ["ITS", "BS"]
		}, {
			"name": "Business Service",
			"icon":"sap-icon://official-service",
			"id": "BS",
			"visible":true,
			"selfMap":false,
			"mapTo": ["B","BS"]
		}, {
			"name": "Business",
			"icon":"sap-icon://business-one",
			"id": "B",
			"selfMap":false,
			"visible":true,
			"mapTo": ["B"]
		}]
	};

});