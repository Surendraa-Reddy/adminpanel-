sap.ui.define([
    "sap/ui/core/UIComponent",
    "employee/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("employee.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            sap.ui.require(["sap/ui/dom/includeStylesheet"], function (includeStylesheet) {
                includeStylesheet("css/style.css");
            });
            var oSessionData = localStorage.getItem("HR_SESSION");

            if (oSessionData) {

                oSessionData = JSON.parse(oSessionData);

            } else {

                oSessionData = {

                    loggedIn: false,

                    username: "",

                    empId: "",

                    role: "",

                    canDashboard: false,
                    canEmployee: false,
                    canDepartment: false,
                    canRole: false,
                    canAttendance: false,
                    canLeave: false,
                    canReports: false

                };

            }

            this.setModel(
                new sap.ui.model.json.JSONModel(oSessionData),
                "session"
            );
        }
    });
});