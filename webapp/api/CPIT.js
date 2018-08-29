sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    var dataModel = function (model) {
        this._data = []; // structure to hold the nested data

        this._model = model;
        this._costPToCostCPath = '/ITServiceMaster';
        this._costPToCostCData = [];
        this._ITServicePath = '/CCVCP_CC';
        this._ITServiceData = [];
        this._endpoint = 'https://fg8b51648f83.us1.hana.ondemand.com/CIO/Allocation/Services/Allocation.xsodata'//'/eyhcp/CIO/Allocation/Services/Allocation.xsodata';

        this.loadData = function () {
            this._costPToCostCData  = this._fetchData(this._costPToCostCPath);
            this._ITServiceData     = this._fetchData(this._ITServicePath);
        };

        //Trigger AJAX to fetch data
        this._fetchData = function (path) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: this._endpoint + path,
                    method: "GET",
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (error) {
                        reject();
                    }
                });
            }.bind(this));
        };
    };

    var dataUploader = BaseObject.extend("pinaki.ey.CIO.allocation.api.CPIT", {
        constructor: dataModel
    });
    return dataModel;
});