sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast
) {
    "use strict";

    return Controller.extend("employee.controller.MyAttendance", {

        onInit: function () {

            this.getView().setModel(new JSONModel({
                Present: 0,
                Absent: 0,
                Late: 0,
                WorkingHours: "0"
            }), "summary");

            this.getView().setModel(new JSONModel({
                results: []
            }), "attendance");

            this._loadAttendance();

        },

        /*=============================================
        Load Attendance
        =============================================*/
        _loadAttendance: function () {

            var oModel = this.getOwnerComponent().getModel();

            var sEmpId = this.getOwnerComponent()
                .getModel("session")
                .getProperty("/empId");

            var that = this;

            oModel.read("/AttendanceSet", {

                filters: [
                    new Filter("EmpId", FilterOperator.EQ, sEmpId)
                ],

                success: function (oData) {

                    oData.results.forEach(function (oRow) {

                        // Convert Edm.Time to display format
                        oRow.CheckinText = that._convertTime(oRow.Checkin);
                        oRow.CheckoutText = that._convertTime(oRow.Checkout);

                        // Calculate Working Hours
                        oRow.WorkingHours = that._calculateHours(
                            oRow.Checkin,
                            oRow.Checkout
                        );

                    });

                    that.getView()
                        .getModel("attendance")
                        .setData(oData);

                    that._updateSummary(oData.results);

                },

                error: function (oError) {

                    console.log(oError);

                    MessageToast.show("Unable to load attendance");

                }

            });

        },
        _convertTime: function (oTime) {

            if (!oTime) {
                return "";
            }

            var iHours = Math.floor(oTime.ms / 3600000);
            var iMinutes = Math.floor((oTime.ms % 3600000) / 60000);
            var iSeconds = Math.floor((oTime.ms % 60000) / 1000);

            return (
                String(iHours).padStart(2, "0") + ":" +
                String(iMinutes).padStart(2, "0") + ":" +
                String(iSeconds).padStart(2, "0")
            );

        },

        /*=============================================
        Calculate Working Hours
        =============================================*/
        _calculateHours: function (oCheckIn, oCheckOut) {

            if (!oCheckIn || !oCheckOut) {
                return "00:00";
            }

            var sCheckIn = this._convertTime(oCheckIn);
            var sCheckOut = this._convertTime(oCheckOut);

            var aIn = sCheckIn.split(":");
            var aOut = sCheckOut.split(":");

            var iIn =
                parseInt(aIn[0], 10) * 60 +
                parseInt(aIn[1], 10);

            var iOut =
                parseInt(aOut[0], 10) * 60 +
                parseInt(aOut[1], 10);

            var iDiff = iOut - iIn;

            if (iDiff < 0) {
                return "00:00";
            }

            var iHours = Math.floor(iDiff / 60);
            var iMinutes = iDiff % 60;

            return (
                String(iHours).padStart(2, "0") +
                ":" +
                String(iMinutes).padStart(2, "0")
            );

        },

        /*=============================================
        Summary
        =============================================*/
        _updateSummary: function (aData) {

            var iPresent = 0;
            var iAbsent = 0;
            var iLate = 0;

            var iTotalMinutes = 0;

            aData.forEach(function (oRow) {

                switch (oRow.Status) {

                    case "P":
                        iPresent++;
                        break;

                    case "A":
                        iAbsent++;
                        break;

                    case "L":
                        iLate++;
                        break;

                }

                if (oRow.WorkingHours !== "00:00") {

                    var aTime =
                        oRow.WorkingHours.split(":");

                    iTotalMinutes +=
                        parseInt(aTime[0], 10) * 60 +
                        parseInt(aTime[1], 10);

                }

            });

            var iHours =
                Math.floor(iTotalMinutes / 60);

            var iMinutes =
                iTotalMinutes % 60;

            this.getView()
                .getModel("summary")
                .setData({

                    Present: iPresent,

                    Absent: iAbsent,

                    Late: iLate,

                    WorkingHours:
                        iHours + ":" +
                        String(iMinutes).padStart(2, "0")

                });

        },

        /*=============================================
        Search
        =============================================*/
        onSearch: function (oEvent) {

            var sValue =
                oEvent.getParameter("newValue");

            var oBinding =
                this.byId("attendanceTable")
                    .getBinding("items");

            if (!sValue) {

                oBinding.filter([]);

                return;

            }

            var oFilter = new Filter({

                filters: [

                    new Filter(
                        "Status",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "AttDate",
                        FilterOperator.Contains,
                        sValue
                    )

                ],

                and: false

            });

            oBinding.filter(oFilter);

        },

        onDateFilter: function () {

            var oDate =
                this.byId("dpDate")
                    .getDateValue();

            var oBinding =
                this.byId("attendanceTable")
                    .getBinding("items");

            if (!oDate) {

                oBinding.filter([]);

                return;

            }

            var sDate =
                oDate.getFullYear() +
                String(oDate.getMonth() + 1)
                    .padStart(2, "0") +
                String(oDate.getDate())
                    .padStart(2, "0");

            oBinding.filter(
                new Filter(
                    "AttDate",
                    FilterOperator.EQ,
                    sDate
                )
            );

        },

        onMonthFilter: function () {

            var oDate =
                this.byId("dpMonth")
                    .getDateValue();

            var oBinding =
                this.byId("attendanceTable")
                    .getBinding("items");

            if (!oDate) {

                oBinding.filter([]);

                return;

            }

            var sMonth =
                oDate.getFullYear() +
                String(oDate.getMonth() + 1)
                    .padStart(2, "0");

            oBinding.filter(
                new Filter(
                    "AttDate",
                    FilterOperator.StartsWith,
                    sMonth
                )
            );

        }, 
        onRefresh : function () {

            this.byId("searchAttendance").setValue("");

            this.byId("dpDate").setValue("");

            this.byId("dpMonth").setValue("");

            this._loadAttendance();

            MessageToast.show("Attendance refreshed");

        },

        onNavBack: function () {

            history.back();

        }

    });

});