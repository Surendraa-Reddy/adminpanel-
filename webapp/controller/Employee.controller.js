sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.Employee", {

        onInit: function () {
            var oSession = this.getOwnerComponent().getModel("session");

            if (!oSession.getProperty("/loggedIn")) {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Login", {}, true);

                return;

            }

           

        },


        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue") || "";

            var oTable = this.byId("employeeTable");

            if (!oTable) {
                console.log("Table not found");
                return;
            }

            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                console.log("Binding not found");
                return;
            }

            if (!sValue) {
                oBinding.filter([]);
                return;
            }

            var oFilter = new Filter({
                filters: [
                    new Filter("EmpId", FilterOperator.Contains, sValue),
                    new Filter("FirstName", FilterOperator.Contains, sValue),
                    new Filter("LastName", FilterOperator.Contains, sValue),
                    new Filter("Email", FilterOperator.Contains, sValue),
                    new Filter("Phone", FilterOperator.Contains, sValue)
                ],
                and: false
            });

            oBinding.filter([oFilter]);
        },
        onRefresh: function () {

            var oSearch = this.byId("searchEmployee");
            if (oSearch) {
                oSearch.setValue("");
            }

            var oModel = this.getView().getModel();

            // Reload data from backend
            oModel.refresh(true);

            // Clear filters
            var oBinding = this.byId("employeeTable").getBinding("items");
            if (oBinding) {
                oBinding.filter([]);
            }

            MessageToast.show("Employee List Refreshed");
        },
        onAdd: function () {

            var oNav = this.getView().getParent();

            sap.ui.core.mvc.XMLView.create({

                viewName: "employee.view.CreateEmployee"

            }).then(function (oView) {

                oNav.addPage(oView);

                oNav.to(oView);

            });

        },

        onPressEmployee: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var sEmpId = oContext.getProperty("EmpId");
            console.log(this.getView().getModel("employee"));

            MessageToast.show("Employee: " + sEmpId);
        },
        onView: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var oEmployee = oContext.getObject();

            var oNavContainer = this.getView().getParent();

            sap.ui.core.mvc.XMLView.create({

                viewName: "employee.view.EmployeeDetails"

            }).then(function (oView) {

                var oModel = new sap.ui.model.json.JSONModel(oEmployee);

                oView.setModel(oModel, "employee");

                oNavContainer.addPage(oView);

                oNavContainer.to(oView);

                // console.log(oEmployee.Status);
                // console.log(typeof oEmployee.Status);
            });

        },
        onEdit: function (oEvent) {

            var oEmployee = oEvent.getSource().getBindingContext().getObject();

            var oNav = this.getView().getParent();

            sap.ui.core.mvc.XMLView.create({

                viewName: "employee.view.EditEmployee"

            }).then(function (oView) {

                var oModel = new sap.ui.model.json.JSONModel(oEmployee);

                oView.setModel(oModel, "employee");

                oNav.addPage(oView);

                oNav.to(oView);

            });

        },
        onDelete: function (oEvent) {

            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();

            var sEmpId = oContext.getProperty("EmpId");

            var oModel = this.getView().getModel();

            var that = this;

            MessageBox.confirm(
                "Are you sure you want to delete Employee " + sEmpId + "?",
                {
                    title: "Confirm Delete",

                    actions: [
                        sap.m.MessageBox.Action.YES,
                        sap.m.MessageBox.Action.NO
                    ],

                    emphasizedAction: sap.m.MessageBox.Action.YES,

                    onClose: function (sAction) {

                        if (sAction === sap.m.MessageBox.Action.YES) {

                            oModel.remove("/EmployeeeSet('" + sEmpId + "')", {

                                success: function () {

                                    MessageBox.success("Employee deleted successfully.");

                                    // Refresh the table
                                    oModel.refresh(true);

                                },

                                error: function (oError) {

                                    sap.m.MessageBox.error("Failed to delete employee.");

                                    console.log(oError);

                                }

                            });

                        }

                    }

                }
            );

        }

    });

});