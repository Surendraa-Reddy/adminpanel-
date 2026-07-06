sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    "use strict";

    return Controller.extend("employee.controller.EmployeeDetails", {

        onBack: function () {

            this.getView().getParent().back();

        }

    });

});