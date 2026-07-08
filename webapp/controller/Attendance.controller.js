sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/ui/core/format/DateFormat"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    Dialog,
    Button,
    VBox,
    HBox,
    Text,
    Title,
    DateFormat
) {
    "use strict";

    return Controller.extend("employee.controller.Attendance", {

        onInit: function () {

        },

        _formatTime: function (oTime) {

            if (!oTime || oTime.ms === undefined) {
                return "";
            }

            var iTotalSeconds = Math.floor(oTime.ms / 1000);

            var iHours = Math.floor(iTotalSeconds / 3600);
            var iMinutes = Math.floor((iTotalSeconds % 3600) / 60);
            var iSeconds = iTotalSeconds % 60;

            return (
                String(iHours).padStart(2, "0") + ":" +
                String(iMinutes).padStart(2, "0") + ":" +
                String(iSeconds).padStart(2, "0")
            );
        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue") || oEvent.getParameter("query");

            var oTable = this.byId("attendanceTable");
            var oBinding = oTable.getBinding("items");


            if (!oBinding) {
                return;
            }

            if (!sValue) {
                oBinding.filter([]);
                return;
            }


            var sStatusValue = sValue;
            if (sValue.toLowerCase().startsWith("p")) {
                sStatusValue = "P";
            } else if (sValue.toLowerCase().startsWith("a")) {
                sStatusValue = "A";
            }

            var aSubFilters = [
                new Filter("AttId", FilterOperator.Contains, sValue),
                new Filter("EmpId", FilterOperator.Contains, sValue),
                new Filter("Status", FilterOperator.Contains, sStatusValue)
            ];


            var oSearchFilter = new Filter({
                filters: aSubFilters,
                and: false
            });


            oBinding.filter([oSearchFilter]);
        },
        onAdd: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("AttendanceAdd");
        },
        onRefresh: function () {

            this.byId("searchAttendance").setValue("");

            this.getView().getModel().refresh(true);

            this.byId("attendanceTable")
                .getBinding("items")
                .filter([]);

            MessageToast.show("Attendance list refreshed");

        },

        onView: function (oEvent) {

            var oAttendance = oEvent.getSource()
                .getBindingContext()
                .getObject();

            // Date formatter
            var oDateFormat = DateFormat.getDateInstance({
                pattern: "dd-MM-yyyy"
            });

            // Time formatter
            var oTimeFormat = DateFormat.getTimeInstance({
                pattern: "HH:mm:ss"
            });

            // Attendance Date
            var sAttDate = "";
            if (oAttendance.AttDate) {
                sAttDate = oDateFormat.format(oAttendance.AttDate);
            }

            console.log(oAttendance.Checkin);
            console.log(oAttendance.Checkout);

            var sCheckIn = this._formatTime(oAttendance.Checkin);
            var sCheckOut = this._formatTime(oAttendance.Checkout);

            var oDialog = new Dialog({

                title: "Attendance Details",
                icon: "sap-icon://calendar",
                contentWidth: "450px",
                draggable: true,
                resizable: true,

                content: [

                    new VBox({

                        class: "sapUiMediumMargin",

                        items: [

                            new Title({
                                text: "Attendance Information"
                            }),

                            new HBox({
                                items: [
                                    new Text({
                                        text: "Attendance ID : ",
                                        width: "150px"
                                    }),
                                    new Text({
                                        text: oAttendance.AttId
                                    })
                                ]
                            }),

                            new HBox({
                                items: [
                                    new Text({
                                        text: "Employee ID : ",
                                        width: "150px"
                                    }),
                                    new Text({
                                        text: oAttendance.EmpId
                                    })
                                ]
                            }),

                            new HBox({
                                items: [
                                    new Text({
                                        text: "Attendance Date : ",
                                        width: "150px"
                                    }),
                                    new Text({
                                        text: sAttDate
                                    })
                                ]
                            }),

                            new HBox({
                                items: [
                                    new Text({
                                        text: "Check In : ",
                                        width: "150px"
                                    }),
                                    new Text({
                                        text: sCheckIn
                                    })
                                ]
                            }),

                            new HBox({
                                items: [
                                    new Text({
                                        text: "Check Out : ",
                                        width: "150px"
                                    }),
                                    new Text({
                                        text: sCheckOut
                                    })
                                ]
                            }),

                            new HBox({
                                items: [
                                    new Text({
                                        text: "Status : ",
                                        width: "150px"
                                    }),
                                    new Text({
                                        text: oAttendance.Status === "P" ? "Present" : "Absent"
                                    })
                                ]
                            })

                        ]

                    })

                ],

                beginButton: new Button({
                    text: "Close",
                    press: function () {
                        oDialog.close();
                    }
                }),

                afterClose: function () {
                    oDialog.destroy();
                }

            });

            oDialog.open();
        },
        onEdit: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            var sAttId = oContext.getProperty("AttId");

            this.getOwnerComponent().getRouter().navTo("AttendanceEdit", {
                AttId: sAttId
            });

        },
        onDelete: function (oEvent) {

            var oModel = this.getView().getModel();

            var sAttId = oEvent.getSource()
                .getBindingContext()
                .getProperty("AttId");

            var sPath = "/AttendanceSet('" + sAttId + "')";

            var that = this;

            sap.m.MessageBox.confirm("Are you sure you want to delete this attendance?", {

                title: "Confirm Delete",

                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],

                onClose: function (sAction) {

                    if (sAction === sap.m.MessageBox.Action.YES) {

                        oModel.remove(sPath, {

                            success: function () {

                                sap.m.MessageToast.show("Attendance deleted successfully");

                                that.getView().getModel().refresh(true);

                            },

                            error: function () {

                                sap.m.MessageToast.show("Delete failed");

                            }

                        });

                    }

                }

            });

        }
    });

});