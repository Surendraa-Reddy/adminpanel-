sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.Payroll", {

        onInit: function () {

            this._loadPayroll();

        },

        _loadPayroll: function () {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            oModel.read("/PayrollSet", {
                success: function (oData) {
                    var aResults = oData.results || [];


                    var iTotalBasic = 0, iTotalGross = 0, iTotalNet = 0, iTotalDeductions = 0;

                    aResults.forEach(function (oItem) {
                        iTotalBasic += parseFloat(oItem.BasicPay || 0);
                        iTotalGross += parseFloat(oItem.GrossSalary || 0);
                        iTotalNet += parseFloat(oItem.NetSalary || 0);
                        iTotalDeductions += parseFloat(oItem.Deductions || 0);
                    });

                    var oJson = new JSONModel({
                        payrolls: aResults,
                        BasicPay: iTotalBasic.toFixed(2),
                        GrossSalary: iTotalGross.toFixed(2),
                        NetSalary: iTotalNet.toFixed(2),
                        Deductions: iTotalDeductions.toFixed(2)
                    });

                    that.getView().setModel(oJson, "payroll");
                },

                error: function () {
                    MessageToast.show("Unable to load Payroll");
                }
            });
        },



        onSearch: function () {
            var aFilters = [];


            var sEmp = this.byId("empFilter").getSelectedKey();
            var sMonth = this.byId("monthFilter").getSelectedKey();
            var sYear = this.byId("yearFilter").getSelectedKey();


            if (sEmp) {
                aFilters.push(
                    new Filter("EmpId", FilterOperator.EQ, sEmp)
                );
            }

            if (sMonth) {
                aFilters.push(
                    new Filter("PayMonth", FilterOperator.EQ, sMonth)
                );
            }

            if (sYear) {
                aFilters.push(
                    new Filter("PayYear", FilterOperator.EQ, sYear)
                );
            }


            var oTable = this.byId("payrollTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },
        onExportCSV: function () {
            var oTable = this.byId("payrollTable");
            var oBinding = oTable ? oTable.getBinding("items") : null;

            if (!oBinding) {
                MessageToast.show("No data available to export.");
                return;
            }


            var aContexts = oBinding.getContexts(0, oBinding.getLength());
            if (aContexts.length === 0) {
                MessageToast.show("No records found to export.");
                return;
            }


            var aColumns = [

                { label: "Employee ID", property: "EmpId" },
                { label: "Month", property: "PayMonth" },
                { label: "Year", property: "PayYear" },


                { label: "Basic Pay", property: "BasicPay" },
                { label: "HRA", property: "Hra" },
                { label: "Special Allowance", property: "SpecialAllowance" },
                { label: "Travel Allowance", property: "TravelAllowance" },
                { label: "Gross Salary", property: "GrossSalary" },


                { label: "PF (Provident Fund)", property: "Pf" },
                { label: "Professional Tax", property: "ProfessionalTax" },
                { label: "Income Tax (TDS)", property: "Tax" },

                { label: "Total Deductions", property: "Deductions" },


                { label: "Net Salary", property: "NetSalary" }
            ];

            var aCsvContent = [];
            var aHeaders = aColumns.map(function (col) {
                return '"' + col.label + '"';
            });
            aCsvContent.push(aHeaders.join(","));


            for (var i = 0; i < aContexts.length; i++) {
                var oRow = aContexts[i].getObject();
                var aRowValues = aColumns.map(function (col) {
                    var val = oRow[col.property] !== undefined && oRow[col.property] !== null ? oRow[col.property] : "";

                    return '"' + String(val).replace(/"/g, '""') + '"';
                });
                aCsvContent.push(aRowValues.join(","));
            }


            var sCsvString = aCsvContent.join("\n");
            var oBlob = new Blob([sCsvString], { type: "text/csv;charset=utf-8;" });
            var sFileName = "Payroll_Export_" + new Date().toISOString().slice(0, 10) + ".csv";

            if (navigator.msSaveBlob) {

                navigator.msSaveBlob(oBlob, sFileName);
            } else {
                var oLink = document.createElement("a");
                var sUrl = URL.createObjectURL(oBlob);
                oLink.setAttribute("href", sUrl);
                oLink.setAttribute("download", sFileName);
                oLink.style.visibility = "hidden";
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
            }

            MessageToast.show("CSV downloaded successfully!");
        },
        onRefresh: function () {

            this.byId("empFilter").setSelectedKey("");
            this.byId("monthFilter").setSelectedKey("");
            this.byId("yearFilter").setSelectedKey("");


            var oTable = this.byId("payrollTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([]);
                }
            }


            var oModel = this.getView().getModel("payroll") || this.getOwnerComponent().getModel();
            if (oModel && oModel.refresh) {
                oModel.refresh(true);
            }

            MessageToast.show("Filters reset and data refreshed.");
        },
        // onGeneratePayslip: function (oEvent) {

        //     var oContext = oEvent.getSource().getBindingContext("payroll");

        //     if (!oContext) {
        //         sap.m.MessageBox.error("Unable to get Payroll data");
        //         return;
        //     }

        //     var oData = oContext.getObject();

        //     var oModel = this.getOwnerComponent().getModel();

        //     var that = this;

        //     oModel.callFunction("/GeneratePayslip", {

        //         method: "POST",

        //         urlParameters: {

        //             EmpId: oData.EmpId,

        //             PayMonth: oData.PayMonth,

        //             PayYear: oData.PayYear

        //         },

        //         success: function () {

        //             sap.m.MessageToast.show("Payslip Generated Successfully");

        //             that.getOwnerComponent()
        //                 .getRouter()
        //                 .navTo("Payslip");

        //         },

        //         error: function (oError) {

        //             console.log(oError);

        //             sap.m.MessageBox.error("Unable to Generate Payslip");

        //         }

        //     });

        // },

        onCreatePayroll: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("PayrollCreate");

        },



        onEdit: function (oEvent) {

            var oData = oEvent.getSource()
                .getBindingContext("payroll")
                .getObject();
            console.log(oData);
            console.log("EmpId:", oData.EmpId);
            console.log("PayMonth:", oData.PayMonth);
            console.log("PayYear:", oData.PayYear);

            this.getOwnerComponent()
                .getRouter()
                .navTo("PayrollEdit", {

                    EmpId: oData.EmpId,
                    PayMonth: oData.PayMonth,
                    PayYear: oData.PayYear

                });

        },

        onDelete: function (oEvent) {

            var that = this;
            var oModel = this.getOwnerComponent().getModel(); // Default OData model for CRUD operations

            // Extract row data using the named model "payroll"
            var oData = oEvent.getSource()
                .getBindingContext("payroll")
                .getObject();

            // Construct the OData key path using composite keys
            var sPath = "/PayrollSet(EmpId='" + oData.EmpId +
                "',PayMonth='" + oData.PayMonth +
                "',PayYear='" + oData.PayYear + "')";

            MessageBox.confirm("Are you sure you want to delete this payroll entry?", {
                title: "Delete Confirmation",
                onClose: function (sAction) {

                    if (sAction === MessageBox.Action.OK || sAction === "OK") {

                        oModel.remove(sPath, {

                            success: function () {
                                MessageToast.show("Payroll Deleted Successfully");
                                // Refresh the named model so the table updates
                                var oPayrollModel = that.getView().getModel("payroll");
                                if (oPayrollModel) {
                                    oPayrollModel.refresh(true);
                                }
                            },

                            error: function (oError) {
                                console.error(oError);
                                MessageBox.error("Delete Failed");
                            }

                        });

                    }

                }
            });

        },


        onViewPayslip: function (oEvent) {
            var oData = oEvent.getSource().getBindingContext("payroll").getObject();

            this.getOwnerComponent().getRouter().navTo("Payslip", {
                EmpId: oData.EmpId
            });
        },


        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("Dashboard");

        }

    });

});