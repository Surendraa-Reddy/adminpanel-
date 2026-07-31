sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/library",
    "sap/m/MessageBox"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    JSONModel,
    Fragment,
    coreLibrary,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.Leave", {

        onInit: function () {
            var oSession = this.getOwnerComponent().getModel("session");

            if (!oSession.getProperty("/loggedIn")) {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Login", {}, true);

                return;

            }


        },

        onNavBack: function () {
            history.back();
        },

        onRefresh: function () {
            this.byId("searchLeave").setValue("");
            var oTable = this.byId("leaveTable");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter([]);
            }
            this.getView().getModel().refresh(true);
            MessageToast.show("Leave list refreshed");
        },

        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("newValue") || oEvent.getParameter("query");
            var oTable = this.byId("leaveTable");
            var oBinding = oTable.getBinding("items");


            if (!oBinding) {
                return;
            }


            if (!sValue || sValue.trim() === "") {
                oBinding.filter([]);
                return;
            }

            var sStatus = sValue.trim();
            if (sStatus.toLowerCase().startsWith("a")) {
                sStatus = "A";
            } else if (sStatus.toLowerCase().startsWith("p")) {
                sStatus = "P";
            } else if (sStatus.toLowerCase().startsWith("r")) {
                sStatus = "R";
            }


            var oFilter = new Filter({
                filters: [
                    new Filter("LeaveId", FilterOperator.Contains, sValue),
                    new Filter("EmpId", FilterOperator.Contains, sValue),
                    new Filter("LeaveType", FilterOperator.Contains, sValue),
                    new Filter("Reason", FilterOperator.Contains, sValue),
                    new Filter("Status", FilterOperator.Contains, sStatus)
                ],
                and: false
            });

            oBinding.filter([oFilter]);
        },

        onAdd: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("LeaveAdd");
        },

        _openDetailsDialog: function (oEvent) {
            var oView = this.getView();
            var oButton = oEvent.getSource();
            var oBindingContext = oButton.getBindingContext();

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "employee.view.LeaveDetailsDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                if (oBindingContext) {
                    oDialog.setBindingContext(oBindingContext);
                }
                oDialog.open();
            });
        },

        onCloseDetailsDialog: function () {
            this.byId("leaveDetailsDialog").close();
        },
        onEdit: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var sLeaveId = oContext.getProperty("LeaveId");

            // Route directly over into our newly implemented component window
            this.getOwnerComponent().getRouter().navTo("LeaveEdit", {
                leaveId: sLeaveId
            });
        },
        onDelete: function (oEvent) {

            var oModel = this.getView().getModel();

            var sLeaveId = oEvent.getSource()
                .getBindingContext()
                .getProperty("LeaveId");

            var sPath = "/LeavesSet('" + sLeaveId + "')";

            var that = this;

            sap.m.MessageBox.confirm("Are you sure you want to delete this leave request?", {

                title: "Confirm Delete",

                actions: [
                    sap.m.MessageBox.Action.YES,
                    sap.m.MessageBox.Action.NO
                ],

                onClose: function (sAction) {

                    if (sAction === sap.m.MessageBox.Action.YES) {

                        oModel.remove(sPath, {

                            success: function () {

                                sap.m.MessageToast.show("Leave deleted successfully");

                                that.getView().getModel().refresh(true);

                            },

                            error: function () {

                                sap.m.MessageToast.show("Delete failed");

                            }

                        });

                    }

                }

            });

        },
        onApproveLeave: function (oEvent) {

            var oModel = this.getView().getModel();

            // Get logged-in user's role
            var oSession = this.getOwnerComponent().getModel("session");
            var sRole = oSession.getProperty("/role");

            var oContext = oEvent.getSource().getBindingContext();

            var sLeaveId = oContext.getProperty("LeaveId");

            MessageBox.confirm(
                "Are you sure you want to approve this leave?",
                {
                    title: "Approve Leave",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            oModel.callFunction("/ApproveLeave", {

                                method: "POST",

                                urlParameters: {

                                    LeaveId: sLeaveId,
                                    Role: sRole

                                },

                                success: function () {

                                    MessageToast.show(
                                        "Leave approved successfully"
                                    );

                                    oModel.refresh(true);

                                },

                                error: function (oError) {

                                    MessageBox.error(
                                        "Approval failed"
                                    );

                                    console.log(oError);

                                }

                            });

                        }

                    }

                }
            );

        },
        onRejectLeave: function (oEvent) {

            var oModel = this.getView().getModel();

            var oContext = oEvent
                .getSource()
                .getBindingContext();

            var sLeaveId = oContext.getProperty("LeaveId");

            var oSession = this.getOwnerComponent().getModel("session");

            var sRole = oSession.getProperty("/role");

            MessageBox.confirm(
                "Are you sure you want to reject this leave?",
                {
                    title: "Reject Leave",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            oModel.callFunction("/RejectLeave", {

                                method: "POST",

                                urlParameters: {
                                    LeaveId: sLeaveId,
                                    Role: sRole,
                                    RejectionReason: ""
                                },

                                success: function () {

                                    MessageToast.show(
                                        "Leave rejected successfully"
                                    );

                                    oModel.refresh(true);

                                },

                                error: function (oError) {

                                    var sMessage = "Rejection failed";

                                    try {

                                        sMessage = JSON.parse(
                                            oError.responseText
                                        ).error.message.value;

                                    } catch (e) { }

                                    MessageBox.error(sMessage);

                                    console.log(oError);

                                }

                            });

                        }

                    }

                }
            );

        }
    });
});