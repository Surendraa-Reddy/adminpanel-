sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("employee.controller.EditHoliday", {

        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("EditHoliday")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var sHolidayId = oEvent.getParameter("arguments").HolidayId;

            this._sHolidayId = sHolidayId;

            var oModel = this.getOwnerComponent().getModel();

            var that = this;

            oModel.read("/HolidaySet('" + sHolidayId + "')", {

                success: function (oData) {

                    that.byId("txtHolidayId").setValue(oData.HolidayId);
                    that.byId("txtHolidayName").setValue(oData.HolidayName);
                    that.byId("dpHolidayDate").setDateValue(new Date(oData.HolidayDate));
                    that.byId("txtHolidayYear").setValue(oData.HolidayYear);
                    that.byId("txtState").setValue(oData.State);
                    that.byId("txtHolidayType").setValue(oData.HolidayType);
                    that.byId("txtDescription").setValue(oData.Description);

                },

                error: function () {

                    MessageBox.error("Unable to load Holiday details.");

                }

            });

        },

        onUpdate: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oHolidayId = this.byId("txtHolidayId");
            var oHolidayName = this.byId("txtHolidayName");
            var oHolidayDate = this.byId("dpHolidayDate");
            var oHolidayYear = this.byId("txtHolidayYear");
            var oState = this.byId("txtState");
            var oHolidayType = this.byId("txtHolidayType");
            var oDescription = this.byId("txtDescription");

            // Reset Value States

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

            // Validation

            if (!sHolidayName) {

                oHolidayName.setValueState("Error");
                oHolidayName.setValueStateText("Holiday Name is required");
                bError = true;

            }

            if (!dHolidayDate) {

                oHolidayDate.setValueState("Error");
                oHolidayDate.setValueStateText("Please select Holiday Date");
                bError = true;

            }

            if (!sHolidayYear) {

                oHolidayYear.setValueState("Error");
                oHolidayYear.setValueStateText("Holiday Year is required");
                bError = true;

            }

            if (!sState) {

                oState.setValueState("Error");
                oState.setValueStateText("State is required");
                bError = true;

            }

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
                HolidayDate: dHolidayDate,
                HolidayYear: sHolidayYear,
                State: sState.toUpperCase(),
                HolidayType: sHolidayType.toUpperCase(),
                Description: sDescription

            };

            var that = this;

            oModel.update(

                "/HolidaySet('" + sHolidayId + "')",

                oPayload,

                {

                    success: function () {

                        MessageToast.show("Holiday updated successfully.");

                        that.getOwnerComponent()
                            .getRouter()
                            .navTo("Holiday");

                    },

                    error: function (oError) {

                        console.log(oError);

                        MessageBox.error("Unable to update Holiday.");

                    }

                }

            );

        },

        onReset: function () {

            var oModel = this.getOwnerComponent().getModel();

            var that = this;

            oModel.read("/HolidaySet('" + this._sHolidayId + "')", {

                success: function (oData) {

                    that.byId("txtHolidayId").setValue(oData.HolidayId);
                    that.byId("txtHolidayName").setValue(oData.HolidayName);
                    that.byId("dpHolidayDate").setDateValue(new Date(oData.HolidayDate));
                    that.byId("txtHolidayYear").setValue(oData.HolidayYear);
                    that.byId("txtState").setValue(oData.State);
                    that.byId("txtHolidayType").setValue(oData.HolidayType);
                    that.byId("txtDescription").setValue(oData.Description);

                    [
                        that.byId("txtHolidayName"),
                        that.byId("dpHolidayDate"),
                        that.byId("txtHolidayYear"),
                        that.byId("txtState"),
                        that.byId("txtHolidayType"),
                        that.byId("txtDescription")
                    ].forEach(function (oControl) {

                        oControl.setValueState("None");
                        oControl.setValueStateText("");

                    });

                }

            });

        },

        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("Holiday");

        }

    });

});