sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";
	var constructor = function (model) {
		this._model = model;

		this._pushErrorNodes = function (aErrorNodes, node) {
			if (node.value != node.childSum && node.childSum != undefined) {
				aErrorNodes.push(JSON.parse(JSON.stringify(node)));
			}
		};
		this._validateITIT_ITBS = function (data) {
			var aErrorNodes = [];
			data.forEach(function (e) {
				this._pushErrorNodes(aErrorNodes, e);
				e.child.forEach(function (f) {
					this._pushErrorNodes(aErrorNodes, f);
					f.child.forEach(function (g) {
						this._pushErrorNodes(aErrorNodes, g);
						g.child.forEach(function (h) {
							this._pushErrorNodes(aErrorNodes, h );
							h.child.forEach(function (i) {
								this._pushErrorNodes(aErrorNodes, i);
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
			return aErrorNodes;
		};

		this.validate = function () {
			var ITITValidationMessages = this._validateITIT_ITBS(this._model.getData().allocationData.ITIT);
			var ITBSValidationMessages = this._validateITIT_ITBS(this._model.getData().allocationData.ITBS);
			return {
				"ITIT" : {
					"name" : "IT Services to IT Services ",
					"count" : ITITValidationMessages.length,
					"errorNodes" : ITITValidationMessages
				},
				"ITBS" : {
					"name" : "IT Services to Business Services ",
					"count" : ITBSValidationMessages.length,
					"errorNodes" : ITBSValidationMessages
				}
			};
		};
	};

	var Validator = BaseObject.extend("pinaki.ey.CIO.allocation.api.Validator", {
		constructor: constructor
	});
	return Validator;
});