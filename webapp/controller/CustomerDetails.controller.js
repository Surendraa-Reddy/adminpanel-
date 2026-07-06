sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("admindemo.controller.CustomerDetails", {

        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("CustomerDetails")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var sId = oEvent.getParameter("arguments").id;

            this.getView().bindElement({
                path: "/Customers('" + sId + "')"
            });

        },

        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("Customers");

        }

    });

});