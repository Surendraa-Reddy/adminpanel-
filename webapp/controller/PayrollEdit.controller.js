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

    return Controller.extend("employee.controller.PayrollEdit", {

        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("PayrollEdit")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var oArgs = oEvent.getParameter("arguments");

            this._empId = oArgs.EmpId;
            this._month = oArgs.PayMonth;
            this._year = oArgs.PayYear;

            this._loadPayroll();

        },

        _loadPayroll: function () {

            var that = this;

            var sPath =
                "/PayrollSet(EmpId='" +
                this._empId +
                "',PayMonth='" +
                this._month +
                "',PayYear='" +
                this._year +
                "')";

            this.getView().getModel().read(sPath, {

                success: function (oData) {

                    that.byId("empSelect").setSelectedKey(oData.EmpId);
                    that.byId("monthSelect").setSelectedKey(oData.PayMonth);
                    that.byId("yearSelect").setSelectedKey(oData.PayYear);

                    that.byId("basicSalary").setValue(oData.BasicPay);
                    that.byId("hra").setValue(oData.Hra);
                    that.byId("da").setValue(oData.Da);
                    that.byId("specialAllowance").setValue(oData.SpecialAllowance);
                    that.byId("travelAllowance").setValue(oData.TravelAllowance);
                    that.byId("bonus").setValue(oData.Bonus);

                    that.byId("pf").setValue(oData.Pf);
                    that.byId("tax").setValue(oData.Tax);
                    that.byId("professionalTax").setValue(oData.ProfessionalTax);

                    that.onSalaryChange();

                },

                error: function () {

                    MessageBox.error("Unable to load Payroll");

                }

            });

        },

        onSalaryChange: function () {

            var basic = parseFloat(this.byId("basicSalary").getValue()) || 0;
            var hra = parseFloat(this.byId("hra").getValue()) || 0;
            var da = parseFloat(this.byId("da").getValue()) || 0;
            var specialAllowance =
                parseFloat(this.byId("specialAllowance").getValue()) || 0;
            var travelAllowance =
                parseFloat(this.byId("travelAllowance").getValue()) || 0;
            var bonus =
                parseFloat(this.byId("bonus").getValue()) || 0;

            var pf =
                parseFloat(this.byId("pf").getValue()) || 0;

            var tax =
                parseFloat(this.byId("tax").getValue()) || 0;

            var professionalTax =
                parseFloat(this.byId("professionalTax").getValue()) || 0;

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
                gross -
                deductions;

            this.byId("deductions")
                .setValue(deductions.toFixed(2));

            this.byId("grossSalary")
                .setValue(gross.toFixed(2));

            this.byId("netSalary")
                .setValue(net.toFixed(2));

        },


        onUpdate: function () {

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

            // Totals
            var gross = basic + hra + da + specialAllowance + travelAllowance + bonus;
            var deductions = pf + tax + professionalTax;
            var net = gross - deductions;

            // Construct Payload with String formatted numbers (.toFixed(2))
            var oPayload = {
                EmpId: this._empId,
                PayMonth: this._month,
                PayYear: this._year,
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
                Deductions: deductions.toFixed(2),
                NetSalary: net.toFixed(2),
                Waers: "INR"
            };

            var sPath = "/PayrollSet(EmpId='" + this._empId +
                "',PayMonth='" + this._month +
                "',PayYear='" + this._year + "')";

            var that = this;

            oModel.update(sPath, oPayload, {
                success: function () {
                    MessageToast.show("Payroll Updated Successfully");
                    that.getOwnerComponent().getRouter().navTo("Payroll");
                },
                error: function (oError) {
                    console.log(oError);
                    MessageBox.error("Update Failed");
                }
            });
        },
        onReset: function () {

            this._loadPayroll();

        },

        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("Payroll");

        }

    });

});