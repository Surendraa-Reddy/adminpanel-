sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    "use strict";

    return Controller.extend("employee.controller.Main", {

        onToggleMenu: function () {

            var oToolPage = this.byId("toolPage");

            oToolPage.setSideExpanded(
                !oToolPage.getSideExpanded()
            );

        },

        onDashboard: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
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

        onAttendance: function () {
            this.getOwnerComponent().getRouter().navTo("Attendance");
        },

        onLeave: function () {
            this.getOwnerComponent().getRouter().navTo("Leave");
        }

    });

});