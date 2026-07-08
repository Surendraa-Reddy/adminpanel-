sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (
    Controller,
    MessageToast,
    MessageBox,
    ValueState,
    JSONModel,
    Fragment
) {
    "use strict";

    return Controller.extend("employee.controller.LeaveAdd", {

        onInit: function () {
            // Setup a local model for the confirmation dialog mapping
            var oConfirmModel = new JSONModel({});
            this.getView().setModel(oConfirmModel, "confirmModel");
        },

        _validateForm: function () {
            var bValid = true;
            var oEmpIdInput = this.byId("empId");
            var oLeaveTypeSelect = this.byId("leaveType");
            var oFromDatePicker = this.byId("fromDate");
            var oToDatePicker = this.byId("toDate");

            if (!oEmpIdInput.getValue().trim()) {
                oEmpIdInput.setValueState(ValueState.Error);
                oEmpIdInput.setValueStateText("Employee ID is required.");
                bValid = false;
            } else { oEmpIdInput.setValueState(ValueState.None); }

            if (!oLeaveTypeSelect.getSelectedKey()) {
                oLeaveTypeSelect.setValueState(ValueState.Error);
                oLeaveTypeSelect.setValueStateText("Please select a leave type.");
                bValid = false;
            } else { oLeaveTypeSelect.setValueState(ValueState.None); }

            var oFromDate = oFromDatePicker.getDateValue();
            if (!oFromDate) {
                oFromDatePicker.setValueState(ValueState.Error);
                oFromDatePicker.setValueStateText("From Date is required.");
                bValid = false;
            } else { oFromDatePicker.setValueState(ValueState.None); }

            var oToDate = oToDatePicker.getDateValue();
            if (!oToDate) {
                oToDatePicker.setValueState(ValueState.Error);
                oToDatePicker.setValueStateText("To Date is required.");
                bValid = false;
            } else { oToDatePicker.setValueState(ValueState.None); }

            if (oFromDate && oToDate && oToDate < oFromDate) {
                oToDatePicker.setValueState(ValueState.Error);
                oToDatePicker.setValueStateText("To Date cannot be earlier than From Date.");
                bValid = false;
            }

            return bValid;
        },

        onDateChange: function (oEvent) {
            oEvent.getSource().setValueState(ValueState.None);
        },

        onSave: function () {
            if (!this._validateForm()) {
                MessageBox.error("Please correct the errors on the form before submitting.");
                return; 
            }

            var oModel = this.getView().getModel();
            var oDateTimeInstance = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            // User-friendly display format instance for the summary popup
            var oDisplayInstance = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd-MM-yyyy" });

            var oFromDateRaw = this.byId("fromDate").getDateValue();
            var oToDateRaw = this.byId("toDate").getDateValue();

            var sFromDateFormatted = oDateTimeInstance.format(oFromDateRaw);
            var sToDateFormatted = oDateTimeInstance.format(oToDateRaw);

            // Payload for the backend OData
            var oData = {
                LeaveId: this.byId("leaveId").getValue(),
                EmpId: this.byId("empId").getValue().trim(),
                LeaveType: this.byId("leaveType").getSelectedKey(),
                FromDate: new Date(sFromDateFormatted + "T00:00:00Z"),
                ToDate: new Date(sToDateFormatted + "T00:00:00Z"),
                Reason: this.byId("reason").getValue(),
                Status: "P" 
            };

            this.getView().setBusy(true);

            oModel.create("/LeavesSet", oData, {
                success: function (oCreatedData) {
                    this.getView().setBusy(false);
                    
                    // Prepare data for the display popup, mapping real generated IDs if returned by backend
                    this.getView().getModel("confirmModel").setData({
                        LeaveId: oCreatedData.LeaveId || oData.LeaveId,
                        EmpId: oData.EmpId,
                        LeaveType: this.byId("leaveType").getSelectedItem().getText(), // User-friendly text
                        FromDateString: oDisplayInstance.format(oFromDateRaw),
                        ToDateString: oDisplayInstance.format(oToDateRaw),
                        Reason: oData.Reason
                    });

                    // Trigger the popup window
                    this._openDetailsDialog();
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    console.error(oError);
                    MessageBox.error("Creation Failed. Please try again.");
                }.bind(this)
            });
        },

        /**
         * Asynchronously loads and opens the Fragment Dialog Window
         */
        _openDetailsDialog: function () {
            var oView = this.getView();

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "employee.view.LeaveDetailsDialog", // Match your project path structure
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Closes the dialog and routes back to previous screen
         */
        onCloseDetailsDialog: function () {
            this.byId("leaveDetailsDialog").close();
            MessageToast.show("Leave Created Successfully");
            this.onNavBack();
        },

        onNavBack: function () {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Leave", {}, true);
            }
        }
    });
});