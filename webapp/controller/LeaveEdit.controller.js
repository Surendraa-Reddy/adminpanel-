sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("employee.controller.LeaveEdit", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            // Attach a listener to capture the navigation pattern matches
            oRouter.getRoute("LeaveEdit").attachPatternMatched(this._onObjectMatched, this);
        },

        /**
         * Executed automatically whenever the URL pattern is triggered
         */
        _onObjectMatched: function (oEvent) {
            var sLeaveId = oEvent.getParameter("arguments").leaveId;
            var oView = this.getView();

            // Construct the path for the specific OData Entity row context
            var sPath = "/LeavesSet('" + sLeaveId + "')";

            oView.bindElement({
                path: sPath,
                events: {
                    change: function () {
                        // Validate if item wasn't deleted or missing on backend refresh
                        if (!oView.getBindingContext()) {
                            MessageBox.error("Requested leave entry was not found.");
                        }
                    }
                }
            });
        },

        /**
         * Standard back navigation handler
         */
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Leave", {}, true);
            }
        },

        /**
         * Triggers the OData network UPDATE payload save sequence
         */
        onSave: function () {
            var oModel = this.getView().getModel();
            var oContext = this.getView().getBindingContext();
            var sPath = oContext.getPath();

            // Extract the updated values out from the current layout context
            var oPayload = {
                LeaveId: oContext.getProperty("LeaveId"),
                EmpId: oContext.getProperty("EmpId"),
                LeaveType: this.byId("selectLeaveType").getSelectedKey(),
                FromDate: this.byId("inputFromDate").getDateValue(),
                ToDate: this.byId("inputToDate").getDateValue(),
                Reason: this.byId("inputReason").getValue(),
                Status: oContext.getProperty("Status") // Retain old status until approved again
            };

            
            if (!oPayload.FromDate || !oPayload.ToDate) {
                MessageToast.show("Please select valid timeline dates.");
                return;
            }

            this.getView().setBusy(true);

            // Execute the OData Model PUT/MERGE network payload operation
            oModel.update(sPath, oPayload, {
                success: function () {
                    this.getView().setBusy(false);
                    MessageToast.show("Leave request updated successfully.");
                    this.onNavBack();
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    MessageBox.error("Failed to update record. Please review system trace logs.");
                }.bind(this)
            });
        }
    });
});