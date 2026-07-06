sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, Sorter, MessageToast) {
    "use strict";

    return Controller.extend("admindemo.controller.Products", {

        onInit: function () {

        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("View1");
        },

        onRefresh: function () {

            var oBinding = this.byId("productsTable").getBinding("items");

            if (oBinding) {
                oBinding.refresh();
                MessageToast.show("Products Refreshed");
            }

        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue");

            var oBinding = this.byId("productsTable").getBinding("items");

            if (!oBinding) {
                return;
            }

            if (sValue) {

                var oFilter = new Filter(
                    "ProductName",
                    FilterOperator.Contains,
                    sValue
                );

                oBinding.filter([oFilter]);

            } else {

                oBinding.filter([]);

            }

        },

        onSort: function () {

            var oBinding = this.byId("productsTable").getBinding("items");

            if (!oBinding) {
                return;
            }

            var oSorter = new Sorter(
                "ProductName",
                false
            );

            oBinding.sort(oSorter);

            MessageToast.show("Sorted by Product Name");

        },

        onFilter: function () {

            var oBinding = this.byId("productsTable").getBinding("items");

            if (!oBinding) {
                return;
            }

            var oFilter = new Filter(
                "UnitPrice",
                FilterOperator.GT,
                20
            );

            oBinding.filter([oFilter]);

            MessageToast.show("Showing products with Price > 20");

        },
        onSelectionChange: function (oEvent) {

            var oItem = oEvent.getParameter("listItem");
            var oProduct = oItem.getBindingContext().getObject();

            console.log("Product ID:", oProduct.ProductID);

            var oRouter = this.getOwnerComponent().getRouter();

            console.log(oRouter);

            oRouter.navTo("ProductDetails", {
                id: oProduct.ProductID
            });

        }

    });
});