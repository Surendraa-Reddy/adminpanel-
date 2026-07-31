sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    MessageToast,
    MessageBox
) {

    "use strict";

    return Controller.extend("employee.controller.PayrollCreate", {

        onInit: function () {

        },

        onSalaryChange: function () {

            var aFieldIds = [
                "basicSalary",
                "hra",
                "da",
                "specialAllowance",
                "travelAllowance",
                "bonus",
                "pf",
                "tax",
                "professionalTax"
            ];

            var bValid = true;

            aFieldIds.forEach(function (sId) {

                var oInput = this.byId(sId);

                if (!oInput) {
                    console.error("Control not found:", sId);
                    bValid = false;
                    return;
                }

                var sValue = oInput.getValue().trim();

                if (sValue === "") {
                    oInput.setValueState("None");
                    return;
                }

                var value = parseFloat(sValue);

                if (isNaN(value)) {

                    oInput.setValueState("Error");
                    oInput.setValueStateText("Enter valid number");
                    bValid = false;
                    return;

                }

                if (value < 0) {

                    oInput.setValueState("Error");
                    oInput.setValueStateText("Negative values not allowed");
                    bValid = false;
                    return;

                }

                oInput.setValueState("None");


            }.bind(this));


            if (!bValid) {
                return;
            }


            // Earnings

            var basic = parseFloat(this.byId("basicSalary").getValue()) || 0;
            var hra = parseFloat(this.byId("hra").getValue()) || 0;
            var da = parseFloat(this.byId("da").getValue()) || 0;
            var specialAllowance =
                parseFloat(this.byId("specialAllowance").getValue()) || 0;
            var travelAllowance =
                parseFloat(this.byId("travelAllowance").getValue()) || 0;
            var bonus =
                parseFloat(this.byId("bonus").getValue()) || 0;


            // Deductions

            var pf =
                parseFloat(this.byId("pf").getValue()) || 0;

            var tax =
                parseFloat(this.byId("tax").getValue()) || 0;

            var professionalTax =
                parseFloat(this.byId("professionalTax").getValue()) || 0;


            // Calculation

            var gross =
                basic +
                hra +
                da +
                specialAllowance +
                travelAllowance +
                bonus;


            var deductions =
                pf +
                tax +
                professionalTax;


            var net =
                gross - deductions;


            // Display result

            this.byId("deductions")
                .setValue(deductions.toFixed(2));


            this.byId("grossSalary")
                .setValue(gross.toFixed(2));


            this.byId("netSalary")
                .setValue(net.toFixed(2));

        },

        onSave: function () {

            if (!this._validatePayroll()) {
                return;
            }

            var oModel = this.getView().getModel();

            // Earnings
            var basic = parseFloat(this.byId("basicSalary").getValue()) || 0;
            var hra = parseFloat(this.byId("hra").getValue()) || 0;
            var da = parseFloat(this.byId("da").getValue()) || 0;
            var specialAllowance = parseFloat(this.byId("specialAllowance").getValue()) || 0;
            var travelAllowance = parseFloat(this.byId("travelAllowance").getValue()) || 0;
            var bonus = parseFloat(this.byId("bonus").getValue()) || 0;

            // Deductions
            var pf = parseFloat(this.byId("pf").getValue()) || 0;
            var tax = parseFloat(this.byId("tax").getValue()) || 0;
            var professionalTax = parseFloat(this.byId("professionalTax").getValue()) || 0;

            // Calculations
            var gross = basic +
                hra +
                da +
                specialAllowance +
                travelAllowance +
                bonus;

            var deduction = pf +
                tax +
                professionalTax;

            var net = gross - deduction;

            var oPayload = {

                EmpId: this.byId("empSelect").getSelectedKey(),

                PayMonth: this.byId("monthSelect").getSelectedKey(),

                PayYear: this.byId("yearSelect").getSelectedKey(),

                BasicPay: basic.toFixed(2),

                Hra: hra.toFixed(2),

                Da: da.toFixed(2),

                SpecialAllowance: specialAllowance.toFixed(2),

                TravelAllowance: travelAllowance.toFixed(2),

                Bonus: bonus.toFixed(2),

                Pf: pf.toFixed(2),

                Tax: tax.toFixed(2),

                ProfessionalTax: professionalTax.toFixed(2),

                GrossSalary: gross.toFixed(2),

                Deductions: deduction.toFixed(2),

                NetSalary: net.toFixed(2),

                Waers: "INR"

            };

            console.log("Payload:", oPayload);

            oModel.create("/PayrollSet", oPayload, {

                success: function () {

                    MessageToast.show("Payroll Saved Successfully");

                    oController.getOwnerComponent()
                        .getRouter()
                        .navTo("Payslip");

                },

                error: function (oError) {

                    console.log(oError);

                    MessageBox.error("Error Saving Payroll");

                }

            });

        },
        _validatePayroll: function () {

            var bValid = true;

            var aControls = [
                this.byId("empSelect"),
                this.byId("monthSelect"),
                this.byId("yearSelect"),

                this.byId("basicSalary"),
                this.byId("hra"),
                this.byId("da"),
                this.byId("specialAllowance"),
                this.byId("travelAllowance"),
                this.byId("bonus"),

                this.byId("pf"),
                this.byId("tax"),
                this.byId("professionalTax")
            ];


            aControls.forEach(function (oControl) {


                if (!oControl) {
                    console.error("Control missing");
                    bValid = false;
                    return;
                }


                var value;


                if (oControl.isA("sap.m.Select")) {

                    value = oControl.getSelectedKey();

                } else {

                    value = oControl.getValue();

                }


                console.log(oControl.getId(), "=", value);


                if (value === "" || value === null || value === undefined) {


                    oControl.setValueState(
                        sap.ui.core.ValueState.Error
                    );


                    bValid = false;


                } else {


                    oControl.setValueState(
                        sap.ui.core.ValueState.None
                    );


                }


            });


            console.log("Validation:", bValid);


            return bValid;

        },

        onReset: function () {

            this.byId("empSelect").setSelectedKey("");
            this.byId("monthSelect").setSelectedKey("");
            this.byId("yearSelect").setSelectedKey("");

            var aInputs = [
                "basicSalary",
                "hra",
                "da",
                "specialAllowance",
                "travelAllowance",
                "bonus",
                "pf",
                "tax",
                "professionalTax",
                "deductions",
                "grossSalary",
                "netSalary"
            ];

            aInputs.forEach(function (sId) {

                this.byId(sId).setValue("");
                this.byId(sId).setValueState("None");

            }.bind(this));

        },

        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("Payroll");

        }
    });

});