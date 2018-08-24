sap.ui.define([], function () {
	"use strict";
	return {
		map: [{
			"name": "Cost Pool to IT Service",
			"id": "CPIT",
			"selectVisible" : true,
			"icon": "sap-icon://capital-projects"
		}, {
			"name": "Cost Pool to Business Service",
			"id": "BPBS",
			"selectVisible" : true,
			"icon":"sap-icon://it-system"
		},
		{
			"name": "IT Service to IT Service",
			"id": "ITIT",
			"selectVisible" : false,
			"icon":"sap-icon://it-system"
		},
		{
			"name": "IT Service to Business Service",
			"icon":"sap-icon://official-service",
			"id": "ITBS",
			"selectVisible" : false
		}, {
			"name": "Business Service to Business",
			"selectVisible" : false,
			"icon":"sap-icon://business-one",
			"id": "BSB"
		}]
	};

});