sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageBox"
], function (Controller, MessageToast, Fragment, JSONModel, formatter, MessageBox) {
    "use strict";

    return Controller.extend("employee.controller.App", {


        formatter: formatter,

        onInit: function () {

            // this.getOwnerComponent().getRouter().initialize();

            this._iLastUnreadCount = 0;

            var oSession = this.getOwnerComponent().getModel("session");

            if (oSession.getProperty("/loggedIn")) {

                this._loadNotifications();

                this._notificationTimer = setInterval(function () {

                    this._checkNewNotifications();

                }.bind(this), 10000);
            }

        },
        onExit: function () {

            if (this._notificationTimer) {
                clearInterval(this._notificationTimer);
            }

        },


        _loadNotificationsold: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oNotificationModel =
                this.getOwnerComponent().getModel("notification");

            if (!oNotificationModel) {

                oNotificationModel =
                    new sap.ui.model.json.JSONModel({

                        NotificationGroups: [],
                        UnreadCount: 0

                    });

                this.getOwnerComponent().setModel(
                    oNotificationModel,
                    "notification"
                );

            }

            var sEmpId = this.getOwnerComponent()
                .getModel("session")
                .getProperty("/empId");

            var aFilters = [

                new sap.ui.model.Filter(
                    "EmpId",
                    sap.ui.model.FilterOperator.EQ,
                    sEmpId
                ),
                new sap.ui.model.Filter(
                    "Status",
                    sap.ui.model.FilterOperator.EQ,
                    "U"
                )

            ];

            oModel.read("/UserNotificationSet", {

                filters: aFilters,

                success: function (oData) {

                    console.log(oData.results);

                    oNotificationModel.setProperty(
                        "/Notifications",
                        oData.results
                    );

                    var iUnread = oData.results.filter(function (oItem) {

                        return oItem.Status === "U";

                    }).length;

                    // console.log("Unread Count:", iUnread);

                    oNotificationModel.setProperty(
                        "/UnreadCount",
                        iUnread
                    );

                    oNotificationModel.refresh(true);

                },

                error: function (oError) {

                    //console.error(oError);

                    MessageToast.show(
                        "Unable to load notifications"
                    );

                }

            });

        },
        _loadNotifications: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oNotificationModel =
                this.getOwnerComponent().getModel("notification");

            if (!oNotificationModel) {

                oNotificationModel = new sap.ui.model.json.JSONModel({
                    NotificationGroups: [],
                    UnreadCount: 0
                });

                this.getOwnerComponent().setModel(
                    oNotificationModel,
                    "notification"
                );
            }

            var oSession = this.getOwnerComponent().getModel("session");

            var sEmpId = oSession.getProperty("/empId");
            var sRole = oSession.getProperty("/role");

            var aFilters = [];

            // Employees -> Only their notifications
            if (sRole !== "ADMIN") {

                aFilters.push(
                    new sap.ui.model.Filter(
                        "EmpId",
                        sap.ui.model.FilterOperator.EQ,
                        sEmpId
                    )
                );

            }

            // Everyone -> Only unread
            aFilters.push(
                new sap.ui.model.Filter(
                    "Status",
                    sap.ui.model.FilterOperator.EQ,
                    "U"
                )
            );

            oModel.read("/UserNotificationSet", {

                filters: aFilters,

                success: function (oData) {

                    var aGroups = this._groupNotifications(oData.results);

                    oNotificationModel.setProperty(
                        "/NotificationGroups",
                        aGroups
                    );

                    oNotificationModel.setProperty(
                        "/UnreadCount",
                        oData.results.length
                    );

                    oNotificationModel.refresh(true);

                }.bind(this),

                error: function () {

                    MessageToast.show("Unable to load notifications");
                    console.log(
                        this.getOwnerComponent()
                            .getModel("notification")
                            .getData()
                    );

                }

            });

        },
        _groupNotifications: function (aNotifications) {

            var aGroups = [];

            var oToday = new Date();

            oToday.setHours(0, 0, 0, 0);

            var oYesterday = new Date(oToday);

            oYesterday.setDate(oYesterday.getDate() - 1);

            var oWeek = new Date(oToday);

            oWeek.setDate(oWeek.getDate() - 7);

            var mGroups = {
                "Today": [],
                "Yesterday": [],
                "Last Week": [],
                "Older": []
            };

            aNotifications.forEach(function (oItem) {

                var oDate = new Date(oItem.CreatedOn);

                oDate.setHours(0, 0, 0, 0);

                if (oDate.getTime() === oToday.getTime()) {

                    mGroups["Today"].push(oItem);

                } else if (oDate.getTime() === oYesterday.getTime()) {

                    mGroups["Yesterday"].push(oItem);

                } else if (oDate >= oWeek) {

                    mGroups["Last Week"].push(oItem);

                } else {

                    mGroups["Older"].push(oItem);

                }

            });

            Object.keys(mGroups).forEach(function (sTitle) {

                if (mGroups[sTitle].length > 0) {

                    aGroups.push({

                        Title: sTitle,

                        Items: mGroups[sTitle]

                    });

                }

            });

            return aGroups;

        },
        onNotificationPress: function (oEvent) {

            var oButton = oEvent.getSource();

            if (!this._oNotificationPopover) {

                Fragment.load({
                    id: this.getView().getId(),
                    name: "employee.view.fragments.NotificationPopover",
                    controller: this
                }).then(function (oPopover) {

                    this._oNotificationPopover = oPopover;

                    this.getView().addDependent(oPopover);

                    oPopover.openBy(oButton);

                }.bind(this));

            } else {

                this._oNotificationPopover.openBy(oButton);

            }

        },
        onNotificationSelect: function (oEvent) {

            var oItem = oEvent.getParameter("listItem");

            var oBindingContext = oItem.getBindingContext("notification");

            if (!oBindingContext) {
                return;
            }

            var oData = oBindingContext.getObject();

            // console.log("Selected Notification:", oData);

            if (!this._oNotificationDialog) {

                Fragment.load({
                    id: this.getView().getId(),
                    name: "employee.view.fragments.NotificationDetails",
                    controller: this
                }).then(function (oDialog) {

                    this._oNotificationDialog = oDialog;

                    this.getView().addDependent(oDialog);

                    oDialog.setBindingContext(
                        oBindingContext,
                        "notification"
                    );

                    oDialog.open();

                }.bind(this));

            } else {

                this._oNotificationDialog.setBindingContext(
                    oBindingContext,
                    "notification"
                );

                this._oNotificationDialog.open();
            }

            if (oData.Status === "R") {
                return;
            }

            var oNotificationModel = this.getView().getModel("notification");

            oNotificationModel.setProperty(
                oBindingContext.getPath() + "/Status",
                "R"
            );

            this.markNotificationAsRead(
                oData,
                oBindingContext.getPath()
            );

        },
        onCloseNotificationDialog: function () {

            if (this._oNotificationDialog) {
                this._oNotificationDialog.close();
            }

        },

        markNotificationAsRead: function (oNotification, sContextPath) {

            var oModel = this.getOwnerComponent().getModel();

            var sPath =
                "/UserNotificationSet('" +
                oNotification.NotifId +
                "')";

            var oPayload = {
                NotifId: oNotification.NotifId,
                Status: "R"
            };

            // console.log("Update Path:", sPath);
            // console.log("Payload:", oPayload);

            oModel.update(sPath, oPayload, {

                success: function () {

                    MessageToast.show("Marked as Read");

                    this._loadNotifications();

                }.bind(this),

                error: function (oError) {

                    //   console.log(oError);
                    // console.log(oError.responseText);

                    this.getView()
                        .getModel("notification")
                        .setProperty(
                            sContextPath + "/Status",
                            "U"
                        );

                    MessageToast.show("Update Failed");

                }.bind(this)

            });

        },
        onDeleteNotification: function (oEvent) {

            oEvent.cancelBubble();

            var oContext = oEvent.getSource().getBindingContext("notification");

            if (!oContext) {
                return;
            }

            var oData = oContext.getObject();

            MessageBox.confirm(
                "Are you sure you want to delete this notification?",
                {
                    title: "Delete Notification",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    emphasizedAction: MessageBox.Action.YES,

                    onClose: function (sAction) {

                        if (sAction !== MessageBox.Action.YES) {
                            return;
                        }

                        var oModel = this.getOwnerComponent().getModel();

                        oModel.remove(
                            "/UserNotificationSet('" + oData.NotifId + "')",
                            {

                                success: function () {

                                    MessageToast.show("Notification deleted.");

                                    this._loadNotifications();

                                }.bind(this),

                                error: function () {

                                    MessageBox.error("Failed to delete notification.");

                                }

                            }
                        );

                    }.bind(this)

                }
            );

        },
        onMarkAllRead: function () {

            var oSession = this.getOwnerComponent().getModel("session");

            var sEmpId = oSession.getProperty("/empId");
            var sRole = oSession.getProperty("/role");

            var oModel = this.getOwnerComponent().getModel();

            MessageBox.confirm("Mark all notifications as read?", {

                title: "Confirmation",

                actions: [
                    MessageBox.Action.YES,
                    MessageBox.Action.NO
                ],

                emphasizedAction: MessageBox.Action.YES,

                onClose: function (sAction) {

                    if (sAction !== MessageBox.Action.YES) {
                        return;
                    }

                    oModel.callFunction("/MarkAllNotificationsRead", {

                        method: "POST",

                        urlParameters: {
                            EmpId: sEmpId,
                            Role: sRole
                        },

                        success: function () {

                            MessageToast.show("All notifications marked as read.");

                            this._loadNotifications();

                        }.bind(this),

                        error: function () {

                            MessageBox.error("Unable to mark all notifications as read.");

                        }

                    });

                }.bind(this)

            });

        },
        _checkNewNotifications: function () {

            var oSession = this.getOwnerComponent().getModel("session");

            var sEmpId = oSession.getProperty("/empId");
            var sRole = oSession.getProperty("/role");

            // User not logged in yet
            if (!oSession.getProperty("/loggedIn")) {
                return;
            }

            // Employee login but EmpId missing
            if (sRole !== "ADMIN" && !sEmpId) {
                return;
            }

            var aFilters = [];

            if (sRole !== "ADMIN") {

                aFilters.push(
                    new sap.ui.model.Filter(
                        "EmpId",
                        sap.ui.model.FilterOperator.EQ,
                        sEmpId
                    )
                );
            }

            aFilters.push(
                new sap.ui.model.Filter(
                    "Status",
                    sap.ui.model.FilterOperator.EQ,
                    "U"
                )
            );

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/UserNotificationSet", {
                filters: aFilters,
                success: function (oData) {

                    var iCurrent = oData.results.length;

                    if (this._iLastUnreadCount === 0) {
                        this._iLastUnreadCount = iCurrent;
                        return;
                    }

                    if (iCurrent > this._iLastUnreadCount) {
                        this._showNotificationPopup(oData.results[0]);
                    }

                    this._iLastUnreadCount = iCurrent;

                }.bind(this)
            });

        },
        _showNotificationPopup: function (oNotification) {

            if (!this._oNotificationPopup) {

                Fragment.load({
                    id: this.getView().getId(),
                    name: "employee.view.fragments.NotificationPopup",
                    controller: this
                }).then(function (oDialog) {

                    this._oNotificationPopup = oDialog;

                    this.getView().addDependent(oDialog);

                    this._openNotificationPopup(oNotification);

                }.bind(this));

            } else {

                this._openNotificationPopup(oNotification);

            }

        },
        _openNotificationPopup: function (oNotification) {

            var oModel = this.getOwnerComponent().getModel("notification");

            oModel.setProperty("/PopupNotification", oNotification);

            this._oNotificationPopup.setBindingContext(
                new sap.ui.model.Context(
                    oModel,
                    "/PopupNotification"
                ),
                "notification"
            );

            this._oNotificationPopup.open();

            // Auto close after 5 seconds
            setTimeout(function () {

                if (this._oNotificationPopup &&
                    this._oNotificationPopup.isOpen()) {

                    this._oNotificationPopup.close();

                }

            }.bind(this), 5000);

        },
        onPopupClose: function () {

            if (this._oNotificationPopup) {

                this._oNotificationPopup.close();

            }

        },
        onPopupView: function () {

            if (this._oNotificationPopup) {

                this._oNotificationPopup.close();

            }

            var oModel = this.getOwnerComponent().getModel("notification");

            var oContext = new sap.ui.model.Context(
                oModel,
                "/PopupNotification"
            );

            if (!this._oNotificationDialog) {

                Fragment.load({
                    id: this.getView().getId(),
                    name: "employee.view.fragments.NotificationDetails",
                    controller: this
                }).then(function (oDialog) {

                    this._oNotificationDialog = oDialog;

                    this.getView().addDependent(oDialog);

                    oDialog.setBindingContext(
                        oContext,
                        "notification"
                    );

                    oDialog.open();

                }.bind(this));

            } else {

                this._oNotificationDialog.setBindingContext(
                    oContext,
                    "notification"
                );

                this._oNotificationDialog.open();

            }

        },

        onToggleMenu: function () {

            var oToolPage = this.byId("toolPage");

            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());

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

            this.getOwnerComponent().getRouter().navTo("Roles");

        },

        onAttendance: function () {

            this.getOwnerComponent().getRouter().navTo("Attendance");

        },

        onMyAttendance: function () {

            this.getOwnerComponent().getRouter().navTo("MyAttendance");

        },

        onLeave: function () {

            this.getOwnerComponent().getRouter().navTo("Leave");

        },

        onApplyLeave: function () {

            this.getOwnerComponent().getRouter().navTo("ApplyLeave");

        },

        onLeaveBalance: function () {

            this.getOwnerComponent().getRouter().navTo("LeaveBalance");

        },

        onReports: function () {

            this.getOwnerComponent().getRouter().navTo("Reports");

        },

        onProfile: function () {

            this.getOwnerComponent().getRouter().navTo("Profile");

        },

        onPayroll: function () {

            this.getOwnerComponent().getRouter().navTo("Payroll");

        },

        onPayrollCreate: function () {

            this.getOwnerComponent().getRouter().navTo("PayrollCreate");

        },

        onUsers: function () {

            this.getOwnerComponent().getRouter().navTo("Users");

        },

        onMenuSelect: function (oEvent) {

            var sKey = oEvent.getParameter("item").getKey();

            this.getOwnerComponent().getRouter().navTo(sKey);

        },

        /*==========================================================*/
        /* Logout */
        /*==========================================================*/

        onLogout: function () {

            localStorage.removeItem("HR_SESSION");

            var oSession = this.getOwnerComponent().getModel("session");

            oSession.setData({

                loggedIn: false,

                username: "",

                empId: "",

                name: "",

                role: ""

            });

            MessageToast.show("Logged out successfully");

            this.getOwnerComponent()
                .getRouter()
                .navTo("Login", {}, true);

        }

    });

});