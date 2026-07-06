sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {

    "use strict";

    return Controller.extend("employee.controller.Dashboard", {

        onInit: function () {
            var oDashboardModel = new JSONModel({

                Employees: 0,
                Departments: 0,
                Roles: 12,
                Leaves: 6

            });

            this.getView().setModel(oDashboardModel, "dashboard");

            this._loadCounts();

        },
        _loadCounts: function () {

            var oModel = this.getOwnerComponent().getModel();

            console.log("Model =", oModel);

            if (!oModel) {
                console.log("Model not available");
                return;
            }

            var oDashboard = this.getView().getModel("dashboard");

            oModel.read("/EmployeeeSet", {
                success: function (oData) {
                    oDashboard.setProperty("/Employees", oData.results.length);
                },
                error: function () {
                    console.log("Employee Read Failed");
                }
            });

            oModel.read("/DepartmentSet", {
                success: function (oData) {
                    oDashboard.setProperty("/Departments", oData.results.length);
                },
                error: function () {
                    console.log("Department Read Failed");
                }
            });


        },


        onEmployee: function () {

            this.getOwnerComponent().getRouter().navTo("Employee");

        },

        onDepartment: function () {

            this.getOwnerComponent().getRouter().navTo("Department");

        },

        onRole: function () {

            this.getOwnerComponent().getRouter().navTo("Role");

        },

        onLeave: function () {

            this.getOwnerComponent().getRouter().navTo("Leave");

        }

    });

});