sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("employee.controller.CreateHoliday", {

        onInit: function () {

        },



        onSave: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oHolidayId = this.byId("txtHolidayId");
            var oHolidayName = this.byId("txtHolidayName");
            var oHolidayDate = this.byId("dpHolidayDate");
            var oHolidayYear = this.byId("txtHolidayYear");
            var oState = this.byId("txtState");
            var oHolidayType = this.byId("txtHolidayType");
            var oDescription = this.byId("txtDescription");

            // Reset ValueState
            [
                oHolidayId,
                oHolidayName,
                oHolidayDate,
                oHolidayYear,
                oState,
                oHolidayType,
                oDescription
            ].forEach(function (oControl) {
                oControl.setValueState("None");
                oControl.setValueStateText("");
            });

            var bError = false;

            var sHolidayId = oHolidayId.getValue().trim();
            var sHolidayName = oHolidayName.getValue().trim();
            var dHolidayDate = oHolidayDate.getDateValue();
            var sHolidayYear = oHolidayYear.getValue().trim();
            var sState = oState.getValue().trim();
            var sHolidayType = oHolidayType.getValue().trim();
            var sDescription = oDescription.getValue().trim();

            // Holiday ID
            if (!sHolidayId) {
                oHolidayId.setValueState("Error");
                oHolidayId.setValueStateText("Holiday ID is required");
                bError = true;
            }

            // Holiday Name
            if (!sHolidayName) {
                oHolidayName.setValueState("Error");
                oHolidayName.setValueStateText("Holiday Name is required");
                bError = true;
            }

            // Holiday Date
            if (!dHolidayDate) {
                oHolidayDate.setValueState("Error");
                oHolidayDate.setValueStateText("Please select Holiday Date");
                bError = true;
            }

            // Holiday Year
            if (!sHolidayYear) {
                oHolidayYear.setValueState("Error");
                oHolidayYear.setValueStateText("Holiday Year is required");
                bError = true;
            } else if (!/^\d{4}$/.test(sHolidayYear)) {
                oHolidayYear.setValueState("Error");
                oHolidayYear.setValueStateText("Enter a valid 4-digit year");
                bError = true;
            }

            // State
            if (!sState) {
                oState.setValueState("Error");
                oState.setValueStateText("State is required");
                bError = true;
            }

            // Holiday Type
            if (!sHolidayType) {
                oHolidayType.setValueState("Error");
                oHolidayType.setValueStateText("Holiday Type is required");
                bError = true;
            }

            if (bError) {
                MessageBox.error("Please correct the highlighted fields.");
                return;
            }

            var oPayload = {
                HolidayId: sHolidayId,
                HolidayName: sHolidayName,
                HolidayDate: dHolidayDate,   // Date object
                HolidayYear: sHolidayYear,
                State: sState.toUpperCase(),
                HolidayType: sHolidayType.toUpperCase(),
                Description: sDescription
            };

            var that = this;

            oModel.create("/HolidaySet", oPayload, {
                success: function () {

                    MessageToast.show("Holiday created successfully.");

                    that.onClear();

                    that.getOwnerComponent()
                        .getRouter()
                        .navTo("Holiday");
                },

                error: function (oError) {

                    console.log(oError);

                    MessageBox.error("Unable to create Holiday.");
                }
            });

        },



        onClear: function () {

            var aControls = [
                this.byId("txtHolidayId"),
                this.byId("txtHolidayName"),
                this.byId("dpHolidayDate"),
                this.byId("txtHolidayYear"),
                this.byId("txtState"),
                this.byId("txtHolidayType"),
                this.byId("txtDescription")
            ];

            aControls.forEach(function (oControl) {
                oControl.setValue("");
                oControl.setValueState("None");
                oControl.setValueStateText("");
            });

        },


        onNavBack: function () {

            var oRouter = this.getOwnerComponent().getRouter();

            oRouter.navTo("Holiday");

        }

    });

});