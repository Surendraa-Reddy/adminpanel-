sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("admindemo.controller.ProductDetails", {

        onInit: function () {

            var oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("ProductDetails")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var sId = oEvent.getParameter("arguments").id;

            this.getView().bindElement({
                path: "/Products(" + sId + ")"
            });

        },

        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("Products");

        }

    });

});