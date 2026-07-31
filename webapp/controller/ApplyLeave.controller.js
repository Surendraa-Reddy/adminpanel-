sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.ApplyLeave", {

        onInit: function () {

            // Leave Form Model
            var oLeaveModel = new JSONModel({
                EmpId: "",
                EmpName: "",
                Role: "",
                LeaveType: "",
                FromDate: "",
                ToDate: "",
                TotalDays: 0,
                Reason: "",
                Attachment: ""
            });

            this.getView().setModel(oLeaveModel, "leave");

            // Leave Balance Model (temporary static values)
            var oBalanceModel = new JSONModel({
                CL: 10,
                SL: 8,
                EL: 12
            });

            this.getView().setModel(oBalanceModel, "balance");

            this._loadEmployee();

        },



        _loadEmployee: function () {

            var oSession = this.getOwnerComponent().getModel("session");

            var oModel = this.getView().getModel("leave");

            oModel.setProperty("/EmpId", oSession.getProperty("/empId"));
            oModel.setProperty("/EmpName", oSession.getProperty("/name"));
            oModel.setProperty("/Role", oSession.getProperty("/role"));

        },



        onDateChange: function () {

            var oLeave = this.getView().getModel("leave");

            var sFrom = oLeave.getProperty("/FromDate");
            var sTo = oLeave.getProperty("/ToDate");

            if (!sFrom || !sTo) {
                return;
            }

            var oFrom = new Date(sFrom);
            var oTo = new Date(sTo);

            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0);

            // Past Date
            if (oFrom < oToday) {

                MessageBox.error("From Date cannot be less than today.");

                oLeave.setProperty("/FromDate", "");
                oLeave.setProperty("/TotalDays", 0);

                return;
            }

            // To Date Validation
            if (oTo < oFrom) {

                MessageBox.error("To Date must be greater than or equal to From Date.");

                oLeave.setProperty("/ToDate", "");
                oLeave.setProperty("/TotalDays", 0);

                return;
            }

            // Weekend Validation
            if (oFrom.getDay() === 0 || oFrom.getDay() === 6) {

                MessageBox.warning("Leave cannot start on Saturday or Sunday.");

            }

            this._calculateDays();

        },

        /*====================================================*/
        /* Calculate Leave Days                               */
        /*====================================================*/

        _calculateDays: function () {

            var oLeave = this.getView().getModel("leave");

            var sFrom = oLeave.getProperty("/FromDate");
            var sTo = oLeave.getProperty("/ToDate");

            if (!sFrom || !sTo) {
                return;
            }

            var oFrom = new Date(sFrom);
            var oTo = new Date(sTo);

            var iDays = Math.floor(

                (oTo.getTime() - oFrom.getTime()) /

                (1000 * 60 * 60 * 24)

            ) + 1;

            oLeave.setProperty("/TotalDays", iDays);

        },

        /*====================================================*/
        /* Navigation                                         */
        /*====================================================*/

        onCancel: function () {

            history.back();

        },

        onNavBack: function () {

            history.back();

        },


        onApply: function () {

            var that = this;

            if (!this._validateForm()) {
                return;
            }

            MessageBox.confirm(
                "Do you want to apply this leave?",
                {
                    title: "Confirm",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            that._checkDuplicateLeave();

                        }

                    }

                });

        },



        _validateForm: function () {

            var oLeave = this.getView().getModel("leave");

            if (!oLeave.getProperty("/LeaveType")) {

                MessageBox.error("Please select Leave Type.");
                return false;

            }

            if (!oLeave.getProperty("/FromDate")) {

                MessageBox.error("Please select From Date.");
                return false;

            }

            if (!oLeave.getProperty("/ToDate")) {

                MessageBox.error("Please select To Date.");
                return false;

            }

            var sReason = oLeave.getProperty("/Reason");

            if (!sReason || sReason.trim().length < 10) {

                MessageBox.error("Reason should contain minimum 10 characters.");
                return false;

            }

            return true;

        },



        _checkDuplicateLeave: function () {

            var that = this;

            var oLeave = this.getView().getModel("leave");

            var oModel = this.getView().getModel();

            sap.ui.core.BusyIndicator.show(0);

            oModel.read("/LeavesSet", {

                filters: [

                    new sap.ui.model.Filter(
                        "EmpId",
                        sap.ui.model.FilterOperator.EQ,
                        oLeave.getProperty("/EmpId")
                    )

                ],

                success: function (oData) {

                    var bDuplicate = false;

                    var sFrom = new Date(
                        oLeave.getProperty("/FromDate")
                    );

                    var sTo = new Date(
                        oLeave.getProperty("/ToDate")
                    );

                    oData.results.forEach(function (oRow) {

                        var oExistingFrom = new Date(oRow.FromDate);

                        var oExistingTo = new Date(oRow.ToDate);

                        if (

                            sFrom <= oExistingTo &&
                            sTo >= oExistingFrom

                        ) {

                            bDuplicate = true;

                        }

                    });

                    if (bDuplicate) {

                        sap.ui.core.BusyIndicator.hide();

                        MessageBox.error(
                            "Leave already exists for selected dates."
                        );

                        return;

                    }

                    that._createLeave();

                },

                error: function () {

                    sap.ui.core.BusyIndicator.hide();

                    MessageBox.error(
                        "Unable to validate leave."
                    );

                }

            });

        },



        _createLeave: function () {

            var that = this;

            var oLeave = this.getView().getModel("leave");

            var oModel = this.getView().getModel();

            var oData = {

                EmpId: oLeave.getProperty("/EmpId"),

                LeaveType: oLeave.getProperty("/LeaveType"),

                FromDate: new Date(
                    oLeave.getProperty("/FromDate")
                ),

                ToDate: new Date(
                    oLeave.getProperty("/ToDate")
                ),

                Reason: oLeave.getProperty("/Reason"),

                Status: "P"

            };

            oModel.create("/LeavesSet", oData, {

                success: function () {

                    sap.ui.core.BusyIndicator.hide();

                    MessageBox.success(
                        "Leave Applied Successfully.",
                        {

                            onClose: function () {

                                that._resetForm();

                                that.getOwnerComponent()
                                    .getRouter()
                                    .navTo("MyLeave");

                            }

                        });

                },

                error: function (oError) {

                    sap.ui.core.BusyIndicator.hide();

                    console.log(oError);

                    MessageBox.error(
                        "Unable to apply leave."
                    );

                }

            });

        },



        _resetForm: function () {

            var oSession =
                this.getOwnerComponent().getModel("session");

            var oLeave =
                this.getView().getModel("leave");

            oLeave.setData({

                EmpId: oSession.getProperty("/empId"),

                EmpName: oSession.getProperty("/name"),

                Role: oSession.getProperty("/role"),

                LeaveType: "",

                FromDate: "",

                ToDate: "",

                TotalDays: 0,

                Reason: "",

                Attachment: ""

            });

        },

        onFileChange: function (oEvent) {

            var oFile = oEvent.getParameter("files")[0];

            if (!oFile) {
                return;
            }

            var sName = oFile.name.toLowerCase();

            if (
                !sName.endsWith(".pdf") &&
                !sName.endsWith(".jpg") &&
                !sName.endsWith(".jpeg") &&
                !sName.endsWith(".png")
            ) {

                sap.m.MessageBox.error(
                    "Only PDF, JPG, JPEG and PNG files are allowed."
                );

                this.byId("fileUploader").clear();

                return;
            }

            this.getView()
                .getModel("leave")
                .setProperty("/Attachment", oFile.name);

        },

        onBeforeItemAdded: function (oEvent) {

            var oItem = oEvent.getParameter("item");

            var sName = oItem.getFileName().toLowerCase();

            if (!(

                sName.endsWith(".pdf") ||

                sName.endsWith(".jpg") ||

                sName.endsWith(".jpeg") ||

                sName.endsWith(".png")

            )) {

                MessageBox.error(
                    "Only PDF, JPG, JPEG and PNG files are allowed."
                );

                oEvent.preventDefault();

            }

        },
        onRefresh: function () {

            // Refresh OData Model
            this.getView().getModel().refresh(true);

            // Reload employee/form data if needed
            this._loadEmployee();

            sap.m.MessageToast.show("Page refreshed");

        }

    });

});