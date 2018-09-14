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
		this._pushErrorNodeSum = function (aErrorNodes, node, shadowNode, validateSum) {
			if (node.value != (node.childSum + shadowNode.childSum) && node.childSum != undefined && validateSum) {
				aErrorNodes.push(JSON.parse(JSON.stringify(node)));
			} else {
				if (node.value != node.childSum && node.childSum != undefined) {
					aErrorNodes.push(JSON.parse(JSON.stringify(node)));
				}
				if (shadowNode.value != shadowNode.childSum && shadowNode.childSum != undefined) {
					aErrorNodes.push(JSON.parse(JSON.stringify(shadowNode)));
				}
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
							this._pushErrorNodes(aErrorNodes, h);
							h.child.forEach(function (i) {
								this._pushErrorNodes(aErrorNodes, i);
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
			return aErrorNodes;
		};
		this._validateCPIT_CPBS = function () {
			var CPBSData = this._model.getData().allocationData.CPBS;
			var CPITData = this._model.getData().allocationData.CPIT;
			var aErrorNodes = [];

			CPBSData.forEach(function (e, j) {
				this._pushErrorNodeSum(aErrorNodes, e, CPITData[j]);
				e.child.forEach(function (f, k) {
					this._pushErrorNodeSum(aErrorNodes, f, CPITData[j].child[k]);
					f.child.forEach(function (g, l) {
						this._pushErrorNodeSum(aErrorNodes, g, CPITData[j].child[k].child[l]);
						g.child.forEach(function (h, m) {
							this._pushErrorNodeSum(aErrorNodes, h, CPITData[j].child[k].child[l].child[m]);
							h.child.forEach(function (i, n) {
								this._pushErrorNodeSum(aErrorNodes, i, CPITData[j].child[k].child[l].child[m].child[n]);
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
			return aErrorNodes;
		};
		this._validateBSB = function (data) {
			var aErrorNodes = [];
			data.forEach(function (e) {
				this._pushErrorNodes(aErrorNodes, e);
				e.child.forEach(function (f) {
					this._pushErrorNodes(aErrorNodes, f);
					f.child.forEach(function (g) {
						this._pushErrorNodes(aErrorNodes, g);
					}.bind(this));
				}.bind(this));
			}.bind(this));
			return aErrorNodes;
		};
		this.validate = function () {
			var ITITValidationMessages = this._validateITIT_ITBS(this._model.getData().allocationData.ITIT);
			var ITBSValidationMessages = this._validateITIT_ITBS(this._model.getData().allocationData.ITBS);
			var CPITBSValidationMessages = this._validateCPIT_CPBS();
			var BSBValidationMessages = this._validateBSB(this._model.getData().allocationData.BSB);
			return {
				"ITIT": {
					"name": "IT Services to IT Services ",
					"count": ITITValidationMessages.length,
					"errorNodes": ITITValidationMessages
				},
				"ITBS": {
					"name": "IT Services to Business Services ",
					"count": ITBSValidationMessages.length,
					"errorNodes": ITBSValidationMessages
				},
				"CPITBS": {
					"name": "Cost Pool to IT Service and Business Service",
					"count": CPITBSValidationMessages.length,
					"errorNodes": CPITBSValidationMessages
				},
				"BSB": {
					"name": "Business Service to Business",
					"count": BSBValidationMessages.length,
					"errorNodes": BSBValidationMessages
				}
			};
		};
	};

	var Validator = BaseObject.extend("pinaki.ey.CIO.allocation.api.Validator", {
		constructor: constructor
	});
	return Validator;
});