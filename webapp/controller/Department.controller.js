sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast
) {
    "use strict";

    return Controller.extend("employee.controller.Department", {

        onInit: function () {
            // OData model already from manifest
        },
        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue") || "";

            var oBinding = this.byId("departmentTable").getBinding("items");

            if (!oBinding) {
                return;
            }

            if (!sValue) {
                oBinding.filter([]);
                return;
            }

            var oFilter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("DeptId", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("DeptName", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("Location", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            });

            oBinding.filter([oFilter]);
        },
         onRefresh: function () {

            var oSearch = this.byId("searchDepartment");
            if (oSearch) {
                oSearch.setValue("");
            }

            var oModel = this.getView().getModel();

            // Reload data from backend
            oModel.refresh(true);

            // Clear filters
            var oBinding = this.byId("departmentTable").getBinding("items");
            if (oBinding) {
                oBinding.filter([]);
            }

            MessageToast.show("Department List Refreshed");
        },


        
        onAdd: function () {
            MessageToast.show("Add Department Clicked");
        },

       
        onView: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var oDepartment = oContext.getObject();

            MessageToast.show("Department: " + oDepartment.DeptId);

            // If you want navigation later, we can add like employee detail page
        },

        onEdit: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var oDept = oContext.getObject();

            MessageToast.show("Edit Department: " + oDept.DeptId);
        },

        onDelete: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var oDept = oContext.getObject();

            MessageToast.show("Delete Department: " + oDept.DeptId);
        }

    });

});