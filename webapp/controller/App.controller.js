sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("employee.controller.App", {

        onInit: function () {
            this.getOwnerComponent().getRouter().initialize();
        },

        // Expand/Collapse Sidebar
        onToggleMenu: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        // Dashboard
        onDashboard: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        // Employees
        onEmployee: function () {
            this.getOwnerComponent().getRouter().navTo("Employee");
        },

        // Departments
        onDepartment: function () {
            this.getOwnerComponent().getRouter().navTo("Department");
        },

        // Roles
        onRole: function () {
            this.getOwnerComponent().getRouter().navTo("Role");
        },

        // Attendance
        onAttendance: function () {
            this.getOwnerComponent().getRouter().navTo("Attendance");
        },

        // Leaves
        onLeave: function () {
            this.getOwnerComponent().getRouter().navTo("Leave");
        },

        // Reports
        onReports: function () {
            this.getOwnerComponent().getRouter().navTo("Reports");
        }

    });
});