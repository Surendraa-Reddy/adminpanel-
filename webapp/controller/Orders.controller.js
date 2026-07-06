sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "admindemo/model/formatter"
], function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    formatter
) {
    "use strict";

    return Controller.extend("admindemo.controller.Orders", {

        formatter: formatter,

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        onRefresh: function () {

            var oBinding = this.byId("ordersTable").getBinding("items");

            if (oBinding) {
                oBinding.refresh();
                MessageToast.show("Orders Refreshed");
            }

        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue");

            var oBinding = this.byId("ordersTable").getBinding("items");

            if (!oBinding) {
                return;
            }

            if (sValue) {

                var oFilter = new Filter(
                    "CustomerID",
                    FilterOperator.Contains,
                    sValue
                );

                oBinding.filter([oFilter]);

            } else {

                oBinding.filter([]);

            }

        },

        onDateFilter: function (oEvent) {

            var dFrom = oEvent.getSource().getDateValue();
            var dTo = oEvent.getSource().getSecondDateValue();

            if (!dFrom || !dTo) {
                return;
            }

            var oFilter = new Filter(
                "OrderDate",
                FilterOperator.BT,
                dFrom,
                dTo
            );

            this.byId("ordersTable")
                .getBinding("items")
                .filter([oFilter]);

        },

        onSort: function () {

            this.byId("ordersTable")
                .getBinding("items")
                .sort(new Sorter("OrderDate", true));

            MessageToast.show("Sorted by Latest Orders");

        },

        onFilter: function () {

            this.byId("ordersTable")
                .getBinding("items")
                .filter([
                    new Filter(
                        "Freight",
                        FilterOperator.GT,
                        100
                    )
                ]);

            MessageToast.show("Freight > 100");

        },

        onSelectionChange: function (oEvent) {

            var oItem = oEvent.getParameter("listItem");

            var sId = oItem.getBindingContext().getObject().OrderID;

            this.getOwnerComponent().getRouter().navTo("OrderDetails", {
                id: sId
            });

        }

    });

});