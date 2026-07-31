sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    History
) {
    "use strict";

    return Controller.extend("employee.controller.LeaveBalance", {

        onInit: function () {
            this._loadLeaveBalance();
        },

        _loadLeaveBalance: function () {

            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            var oSession = this.getOwnerComponent().getModel("session");

            if (!oSession) {
                MessageToast.show("Session model not found.");
                return;
            }

            var sEmpId = oSession.getProperty("/empId");

            oModel.read("/LeaveBalanceSet", {

                filters: [
                    new Filter("EmpId", FilterOperator.EQ, sEmpId)
                ],

                success: function (oData) {
                        console.log("Leave Balance Response:", oData);


                    if (oData.results.length > 0) {

                        var oJson = new JSONModel(oData.results[0]);

                        that.getView().setModel(oJson, "balance");

                    } else {

                        MessageToast.show("No Leave Balance Found");

                    }

                },

                error: function () {

                    MessageToast.show("Failed to Load Leave Balance");

                }

            });

        },

        onNavBack: function () {

            var oHistory = History.getInstance();

            if (oHistory.getPreviousHash()) {

                window.history.go(-1);

            } else {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Dashboard");

            }

        }

    });

});