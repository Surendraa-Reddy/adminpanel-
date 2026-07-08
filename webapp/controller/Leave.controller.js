sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/library"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    JSONModel,
    Fragment,
    coreLibrary
) {
    "use strict";

    return Controller.extend("employee.controller.Leave", {

        onInit: function () {
            // Initialization logic if required
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

            // Safeguard check to ensure binding exists before execution
            if (!oBinding) {
                return;
            }

            // Clear filter if search text is empty
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

            // Generate clean multi-field OR query array
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
        }
    });
});