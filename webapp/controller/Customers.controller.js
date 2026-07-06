sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast"
], function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast
) {
    "use strict";

    return Controller.extend("admindemo.controller.Customers", {

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue");

            var oBinding = this.byId("customersTable").getBinding("items");

            if (sValue) {

                var oFilter = new Filter(
                    "CompanyName",
                    FilterOperator.Contains,
                    sValue
                );

                oBinding.filter([oFilter]);

            } else {

                oBinding.filter([]);

            }

        },

        onSort: function () {

            var oBinding = this.byId("customersTable").getBinding("items");

            oBinding.sort(new Sorter("CompanyName", false));

            MessageToast.show("Sorted");

        },

        onFilter: function () {

            var oBinding = this.byId("customersTable").getBinding("items");

            var oFilter = new Filter(
                "Country",
                FilterOperator.EQ,
                "Germany"
            );

            oBinding.filter([oFilter]);

            MessageToast.show("Germany Customers");

        },

        onSelectionChange: function (oEvent) {

            var oItem = oEvent.getParameter("listItem");

            var oContext = oItem.getBindingContext();

            var oCustomer = oContext.getObject();

            this.getOwnerComponent()
                .getRouter()
                .navTo("CustomerDetails", {
                    id: oCustomer.CustomerID
                });

        }

    });

});