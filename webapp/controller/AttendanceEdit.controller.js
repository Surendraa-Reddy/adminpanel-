sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("employee.controller.AttendanceEdit", {

        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("AttendanceEdit")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var that = this;

            var sAttId = oEvent.getParameter("arguments").AttId;

            var sPath = "/AttendanceSet('" + sAttId + "')";

            this.getView().getModel().read(sPath, {

                success: function (oData) {

                    console.log(oData);

                    // Attendance ID
                    that.byId("attId").setValue(oData.AttId);

                    // Employee ID
                    that.byId("empId").setValue(oData.EmpId);

                    // Attendance Date
                    that.byId("attDate").setDateValue(oData.AttDate);

                    // Check In
                    if (oData.Checkin) {
                        var oCheckIn = new Date();

                        oCheckIn.setHours(
                            Math.floor(oData.Checkin.ms / 3600000),
                            Math.floor((oData.Checkin.ms % 3600000) / 60000),
                            Math.floor((oData.Checkin.ms % 60000) / 1000),
                            0
                        );

                        that.byId("checkIn").setDateValue(oCheckIn);
                    }

                    // Check Out
                    if (oData.Checkout) {

                        var oCheckOut = new Date();

                        oCheckOut.setHours(
                            Math.floor(oData.Checkout.ms / 3600000),
                            Math.floor((oData.Checkout.ms % 3600000) / 60000),
                            Math.floor((oData.Checkout.ms % 60000) / 1000),
                            0
                        );

                        that.byId("checkOut").setDateValue(oCheckOut);
                    }

                    // Status
                    that.byId("status").setSelectedKey(oData.Status);

                },

                error: function (oError) {
                    console.log(oError);
                }

            });

        },

        onSave: function () {

            var oModel = this.getView().getModel();

            var sPath =
                "/AttendanceSet('" +
                this.byId("attId").getValue() +
                "')";

            // Attendance Date
            var oAttDate = this.byId("attDate").getDateValue();

            // Check In
            var sCheckIn = this.byId("checkIn").getValue();
            var a = sCheckIn.split(":");

            var oCheckIn = {
                __edmType: "Edm.Time",
                ms:
                    parseInt(a[0], 10) * 3600000 +
                    parseInt(a[1], 10) * 60000 +
                    parseInt(a[2], 10) * 1000
            };

            // Check Out
            var sCheckOut = this.byId("checkOut").getValue();
            var b = sCheckOut.split(":");

            var oCheckOut = {
                __edmType: "Edm.Time",
                ms:
                    parseInt(b[0], 10) * 3600000 +
                    parseInt(b[1], 10) * 60000 +
                    parseInt(b[2], 10) * 1000
            };

            var oData = {
                AttId: this.byId("attId").getValue(),
                EmpId: this.byId("empId").getValue(),
                AttDate: this.byId("attDate").getDateValue(),
                Checkin: oCheckIn,
                Checkout: oCheckOut,
                Status: this.byId("status").getSelectedKey()
            };


            // console.log(JSON.stringify(oData));
            // console.log(oData);

            oModel.update(sPath, oData, {

                success: function () {

                    MessageToast.show("Attendance Updated");

                    history.back();

                },

                error: function (oError) {

                    console.log(oError);

                    MessageToast.show("Update Failed");

                }

            });

        },

        onNavBack: function () {

            history.back();

        }

    });

});