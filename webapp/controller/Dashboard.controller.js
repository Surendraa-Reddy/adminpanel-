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
                Roles: 0,
                Leaves: 0

            });

            this.getView().setModel(oDashboardModel, "dashboard");

            this._loadCounts();

        },
        _loadCounts: function () {

            var oModel = this.getOwnerComponent().getModel();

            if (!oModel) {
                console.log("Model not available");
                return;
            }

            var oDashboard = this.getView().getModel("dashboard");

            // Employees
            oModel.read("/EmployeeeSet", {

                success: function (oData) {

                    oDashboard.setProperty("/Employees", oData.results.length);

                },

                error: function () {

                    console.log("Employee Read Failed");

                }

            });

            // Departments
            oModel.read("/DepartmentSet", {

                success: function (oData) {

                    oDashboard.setProperty("/Departments", oData.results.length);

                },

                error: function () {

                    console.log("Department Read Failed");

                }

            });

            // Roles
            oModel.read("/RolesSet", {

                success: function (oData) {

                    oDashboard.setProperty("/Roles", oData.results.length);

                },

                error: function () {

                    console.log("Roles Read Failed");

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

            this.getOwnerComponent().getRouter().navTo("Roles");

        },

        onLeave: function () {

            this.getOwnerComponent().getRouter().navTo("Leave");

        }

    });

});