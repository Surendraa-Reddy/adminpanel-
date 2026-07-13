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

        onInit: function () {

        },

        //=========================
        // Login Button
        //=========================
        onLogin: function () {

            if (!this._validate()) {
                return;
            }

            var sUsername = this.byId("idUsername").getValue().trim();
            var sPassword = this.byId("idPassword").getValue().trim();

            var oModel = this.getOwnerComponent().getModel();

            var that = this;

            BusyIndicator.show(0);

            oModel.create("/LoginSet", {

                Username: sUsername,
                Password: sPassword

            }, {

                success: function (oData) {

                    BusyIndicator.hide();

                    MessageToast.show("Login Successful");

                    // Store User Session
                    var oSession = that.getOwnerComponent().getModel("session");

                    oSession.setData({

                        loggedIn: true,
                        username: oData.Username,
                        empId: oData.EmpId,
                        role: oData.Role,
                        status: oData.Status

                    });

                    that._clear();

                    that.getOwnerComponent()
                        .getRouter()
                        .navTo("Dashboard");

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

                    that._showError(sMessage);

                }

            });

        },

        //=========================
        // Input Validation
        //=========================
        _validate: function () {

            var bValid = true;

            var oUser = this.byId("idUsername");
            var oPass = this.byId("idPassword");

            var sUsername = oUser.getValue().trim();
            var sPassword = oPass.getValue().trim();

            oUser.setValueState("None");
            oPass.setValueState("None");

            if (!sUsername) {

                oUser.setValueState("Error");
                oUser.setValueStateText("Username is required");

                bValid = false;

            }

            if (!sPassword) {

                oPass.setValueState("Error");
                oPass.setValueStateText("Password is required");

                bValid = false;

            }

            return bValid;

        },

        //=========================
        // Clear Inputs
        //=========================
        _clear: function () {

            this.byId("idUsername").setValue("");
            this.byId("idPassword").setValue("");

            this.byId("idUsername").setValueState("None");
            this.byId("idPassword").setValueState("None");

        },

        //=========================
        // Error Popup
        //=========================
        _showError: function (sMessage) {

            MessageBox.error(sMessage);

        },

        //=========================
        // Enter Key Login
        //=========================
        onSubmit: function () {

            this.onLogin();

        }

    });

});