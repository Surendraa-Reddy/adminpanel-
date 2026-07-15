sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator"
], function (
    Controller,
    MessageBox,
    MessageToast,
    BusyIndicator
) {
    "use strict";

    return Controller.extend("employee.controller.Login", {

        //==================================================
        // Init
        //==================================================
        onInit: function () {

            var oSession = this.getOwnerComponent().getModel("session");

            // Already logged in
            if (oSession.getProperty("/loggedIn")) {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Dashboard", {}, true);

                return;
            }

            // Focus Username
            var that = this;

            setTimeout(function () {

                if (that.byId("idUsername")) {
                    that.byId("idUsername").focus();
                }

            }, 300);


        },

        //==================================================
        // Login
        //==================================================
        onLogin: function () {

            if (!this._validate()) {
                return;
            }

            var sUsername = this.byId("idUsername").getValue().trim();
            var sPassword = this.byId("idPassword").getValue().trim();

            var oModel = this.getOwnerComponent().getModel();

            var that = this;

            // Clear old session
            this.getOwnerComponent().getModel("session").setData({

                loggedIn: false,
                username: "",
                empId: "",
                role: "",
                status: ""

            });

            BusyIndicator.show(0);

            oModel.create("/LoginSet", {

                Username: sUsername,
                Password: sPassword

            }, {

                success: function (oData) {

                    BusyIndicator.hide();

                    var oSession = that.getOwnerComponent().getModel("session");

                    var oSessionData = {

                        loggedIn: true,

                        username: oData.Username,

                        empId: oData.EmpId,

                        role: oData.Role,

                        status: oData.Status,

                        canDashboard: true,
                        canEmployee: true,
                        canDepartment: true,
                        canRole: true,
                        canAttendance: true,
                        canLeave: true,
                        canReports: true

                    };

                    oSession.setData(oSessionData);

                    localStorage.setItem(
                        "HR_SESSION",
                        JSON.stringify(oSessionData)
                    );

                    MessageToast.show("Login Successful");

                    that._clear();

                    that.getOwnerComponent()
                        .getRouter()
                        .navTo("Dashboard", {}, true);

                },

                error: function (oError) {

                    BusyIndicator.hide();

                    var sMessage = "Invalid Username or Password";

                    try {

                        var oResponse = JSON.parse(oError.responseText);

                        if (
                            oResponse.error &&
                            oResponse.error.message &&
                            oResponse.error.message.value
                        ) {
                            sMessage = oResponse.error.message.value;
                        }

                    } catch (e) {

                    }

                    // Clear only password
                    that.byId("idPassword").setValue("");
                    that.byId("idPassword").focus();

                    MessageBox.error(sMessage);

                }

            });

        },

        //==================================================
        // Validation
        //==================================================
        _validate: function () {

            var oUser = this.byId("idUsername");
            var oPass = this.byId("idPassword");

            var sUser = oUser.getValue().trim();
            var sPass = oPass.getValue().trim();

            var bValid = true;

            oUser.setValueState("None");
            oPass.setValueState("None");

            if (!sUser) {

                oUser.setValueState("Error");
                oUser.setValueStateText("Username is required");
                bValid = false;

            }

            if (!sPass) {

                oPass.setValueState("Error");
                oPass.setValueStateText("Password is required");
                bValid = false;

            }

            return bValid;

        },

        //==================================================
        // Clear Fields
        //==================================================
        _clear: function () {

            this.byId("idUsername").setValue("");
            this.byId("idPassword").setValue("");

            this.byId("idUsername").setValueState("None");
            this.byId("idPassword").setValueState("None");

        },

        //==================================================
        // Live Change
        //==================================================
        onLiveChange: function (oEvent) {

            var oInput = oEvent.getSource();

            if (oInput.getValue().trim()) {

                oInput.setValueState("None");

            }

        },

        //==================================================
        // Press Enter
        //==================================================
        onSubmit: function () {

            this.onLogin();

        }

    });

});