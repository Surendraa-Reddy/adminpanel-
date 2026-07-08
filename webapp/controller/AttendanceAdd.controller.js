sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("employee.controller.AttendanceAdd", {

        onSave: function () {

            var oModel = this.getView().getModel();

            // Date values
            var oAttDate = this.byId("attDate").getDateValue();
            var oCheckIn = this.byId("checkIn").getDateValue();
            var oCheckOut = this.byId("checkOut").getDateValue();

            // Convert time to milliseconds
            var iCheckInMs = oCheckIn ?
                ((oCheckIn.getHours() * 3600) +
                    (oCheckIn.getMinutes() * 60) +
                    oCheckIn.getSeconds()) * 1000 : 0;

            var iCheckOutMs = oCheckOut ?
                ((oCheckOut.getHours() * 3600) +
                    (oCheckOut.getMinutes() * 60) +
                    oCheckOut.getSeconds()) * 1000 : 0;

            var oData = {

                AttId: this.byId("attId").getValue(),

                EmpId: this.byId("empId").getValue(),

                AttDate: oAttDate,

                Checkin: {
                    __edmType: "Edm.Time",
                    ms: iCheckInMs
                },

                Checkout: {
                    __edmType: "Edm.Time",
                    ms: iCheckOutMs
                },

                Status: this.byId("status").getSelectedKey()

            };

            console.log(oData);

            oModel.create("/AttendanceSet", oData, {

                success: function () {
                    MessageToast.show("Attendance Created");
                    history.back();
                },

                error: function (oError) {
                    console.log(oError);
                    MessageToast.show("Creation Failed");
                }

            });

        },
        onNavBack: function () {

            history.back();

        }

    });

});