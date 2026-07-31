sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "employee/libs/jspdf.umd.min"
],

    function (
        Controller,
        Filter,
        FilterOperator,
        MessageToast,
        jsPDFLib
    ) {

        "use strict";


        return Controller.extend(
            "employee.controller.Payslip",
            {

                onInit: function () {


                    this._loadPayslips();


                },



                _loadPayslips: function () {



                    var oModel = this.getOwnerComponent()
                        .getModel();


                    var oTable = this.byId("payslipTable");


                    var oSession = this.getOwnerComponent()
                        .getModel("session");
                    console.log(
                        "Session Model:",
                        oSession.getData()
                    );


                    var sEmpId = oSession.getProperty("/empId");
                    console.log("Employee ID:", sEmpId);


                    var aFilters = [];


                    // aFilters.push(
                    //     new Filter(
                    //         "EmpId",
                    //         FilterOperator.EQ,
                    //         sEmpId
                    //     )
                    // );



                    oModel.read(
                        "/PayslipSet",
                        {

                            filters: aFilters,


                            success: function (oData) {

                                oTable
                                    .getBinding("items")
                                    .refresh();


                            },


                            error: function () {

                                MessageToast.show(
                                    "Unable to load payslips"
                                );

                            }


                        }
                    );


                },



                onSearch: function () {

                    var oTable = this.byId("payslipTable");
                    var oBinding = oTable.getBinding("items");

                    var oSession = this.getOwnerComponent().getModel("session");
                    var sEmpId = oSession.getProperty("/empId");

                    var sMonth = this.byId("monthSelect").getSelectedKey();
                    var sYear = this.byId("yearSelect").getSelectedKey();

                    console.log("Employee :", sEmpId);
                    console.log("Month :", sMonth);
                    console.log("Year :", sYear);

                    var aFilters = [];

                    // if (sEmpId) {
                    //     aFilters.push(new Filter("EmpId", FilterOperator.EQ, sEmpId));
                    // }

                    if (sMonth) {
                        aFilters.push(new Filter("PayMonth", FilterOperator.EQ, sMonth));
                    }

                    if (sYear) {
                        aFilters.push(new Filter("PayYear", FilterOperator.EQ, sYear));
                    }

                    console.log(aFilters);

                    oBinding.filter(aFilters);

                },

                onReset: function () {

                    this.byId("monthSelect").setSelectedKey("");
                    this.byId("yearSelect").setSelectedKey("");

                    this.byId("payslipTable")
                        .getBinding("items")
                        .filter([]);

                },


                onNavBack: function () {

                    history.go(-1);

                },



                onDownloadPDF: function (oEvent) {
                    var oContext = oEvent.getSource().getBindingContext("payroll") || oEvent.getSource().getBindingContext();

                    if (!oContext) {
                        sap.m.MessageToast.show("No Payslip Selected");
                        return;
                    }

                    var oData = oContext.getObject();
                    var oModel = this.getOwnerComponent().getModel();
                    var that = this;

                    // Use Filters to force GET_ENTITYSET execution instead of direct key GET_ENTITY
                    var aFilters = [
                        new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.EQ, String(oData.EmpId).trim()),
                        new sap.ui.model.Filter("PayMonth", sap.ui.model.FilterOperator.EQ, String(oData.PayMonth).trim()),
                        new sap.ui.model.Filter("PayYear", sap.ui.model.FilterOperator.EQ, String(oData.PayYear).trim())
                    ];

                    oModel.read("/PayrollSet", {
                        filters: aFilters,
                        success: function (oResponse) {
                            if (oResponse && oResponse.results && oResponse.results.length > 0) {
                                var oPayroll = oResponse.results[0];
                                that._generatePDF(oData, oPayroll);
                            } else {
                                sap.m.MessageToast.show("No detailed payroll record found.");
                            }
                        },
                        error: function (oError) {
                            console.error("Read Error:", oError);
                            sap.m.MessageToast.show("Unable to load Payroll Details for PDF");
                        }
                    });
                },

                _generatePDF: function (oData, oPayroll) {
                    // Helper to safely format amounts
                    var fmt = function (val) {
                        if (val === null || val === undefined || val === "") return "0.00";
                        if (typeof val === "string") val = val.replace(/[^0-9.-]+/g, "");
                        var num = parseFloat(val);
                        return isNaN(num) ? "0.00" : num.toLocaleString("en-IN", { minimumFractionDigits: 2 });
                    };

                    const { jsPDF } = window.jspdf;
                    var doc = new jsPDF("p", "mm", "a4");

                    //================ HEADER ==================
                    doc.setFillColor(25, 118, 210);
                    doc.rect(0, 0, 210, 38, "F");

                    doc.setTextColor(255, 255, 255);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(18);
                    doc.text("Proceed Group PVT. LTD.", 105, 14, { align: "center" });

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.text("Hyderabad, Telangana", 105, 21, { align: "center" });
                    doc.text("Email : hr@abctech.com | Phone : +91 9876543210", 105, 28, { align: "center" });

                    //================ TITLE ==================
                    doc.setTextColor(0, 0, 0);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(15);
                    doc.text("MONTHLY PAYSLIP", 105, 48, { align: "center" });

                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");
                    doc.text((oData.PayMonth || "") + " - " + (oData.PayYear || ""), 105, 55, { align: "center" });

                    //================ EMPLOYEE DETAILS ==================
                    doc.setFillColor(245, 245, 245);
                    doc.roundedRect(15, 62, 180, 42, 3, 3, "F");

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(11);
                    doc.text("EMPLOYEE DETAILS", 20, 70);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9.5);

                    var sDate = oData.GeneratedOn ? new Date(oData.GeneratedOn).toLocaleDateString("en-GB") : "";

                    var empDetailsLeft = [
                        ["Employee ID", oData.EmpId],
                        ["Employee Name", oData.FirstName],
                        ["Role", oData.RoleName],
                        ["Phone", oData.Phone]
                    ];

                    var empDetailsRight = [
                        ["Generated On", sDate],
                        ["Department", oData.DeptName],
                        ["Email", oData.Email],
                        ["Currency", "INR"]
                    ];

                    var y = 77;
                    for (var i = 0; i < empDetailsLeft.length; i++) {
                        // Left Column
                        doc.text(empDetailsLeft[i][0], 20, y);
                        doc.text(":", 55, y);
                        doc.text(String(empDetailsLeft[i][1] || ""), 58, y);

                        // Right Column
                        doc.text(empDetailsRight[i][0], 110, y);
                        doc.text(":", 145, y);
                        doc.text(String(empDetailsRight[i][1] || ""), 148, y);

                        y += 6.5;
                    }

                    //================ SALARY DETAILS TABLE ==================
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text("SALARY DETAILS", 20, 114);

                    var startY = 118;

                    // Header
                    doc.setFillColor(25, 118, 210);
                    doc.rect(20, startY, 170, 9, "F");

                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(10);
                    doc.text("DESCRIPTION", 25, startY + 6);
                    doc.text("AMOUNT (INR)", 185, startY + 6, { align: "right" });

                    doc.setTextColor(0, 0, 0);
                    doc.setFont("helvetica", "normal");

                    // All Salary Components (Matching print template)
                    var salaryItems = [
                        { label: "Basic Pay", val: oPayroll.BasicPay },
                        { label: "HRA", val: oPayroll.Hra },
                        { label: "DA", val: oPayroll.Da },
                        { label: "Special Allowance", val: oPayroll.SpecialAllowance },
                        { label: "Travel Allowance", val: oPayroll.TravelAllowance },
                        { label: "Bonus", val: oPayroll.Bonus },
                        { label: "Gross Salary", val: oPayroll.GrossSalary, bold: true },
                        { label: "PF", val: oPayroll.Pf },
                        { label: "Tax", val: oPayroll.Tax },
                        { label: "Professional Tax", val: oPayroll.ProfessionalTax },
                        { label: "Total Deductions", val: oPayroll.Deductions, bold: true }
                    ];

                    var rowY = startY + 9;

                    salaryItems.forEach(function (item) {
                        doc.rect(20, rowY, 170, 8);

                        if (item.bold) {
                            doc.setFont("helvetica", "bold");
                        } else {
                            doc.setFont("helvetica", "normal");
                        }

                        doc.text(item.label, 25, rowY + 5.5);
                        doc.text(fmt(item.val), 185, rowY + 5.5, { align: "right" });

                        rowY += 8;
                    });

                    //================ NET SALARY ==================
                    doc.setFillColor(46, 125, 50);
                    doc.rect(20, rowY, 170, 12, "F");

                    doc.setTextColor(255, 255, 255);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text("NET SALARY", 25, rowY + 8);
                    doc.text(fmt(oPayroll.NetSalary) + " INR", 185, rowY + 8, { align: "right" });

                    doc.setTextColor(0, 0, 0);

                    //================ SIGNATURES ==================
                    var sigY = rowY + 35;

                    doc.line(25, sigY, 75, sigY);
                    doc.line(135, sigY, 185, sigY);

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.text("Employee Signature", 25, sigY + 6);
                    doc.text("Authorized Signature", 135, sigY + 6);

                    //================ FOOTER ==================
                    doc.line(20, 275, 190, 275);
                    doc.setFontSize(8.5);
                    doc.setTextColor(100, 100, 100);
                    doc.text(
                        "This is a system generated payslip and does not require a physical signature.",
                        105,
                        282,
                        { align: "center" }
                    );

                    //================ SAVE PDF ==================
                    doc.save(
                        "Payslip_" +
                        (oData.EmpId || "Emp") +
                        "_" +
                        (oData.PayMonth || "Month") +
                        "_" +
                        (oData.PayYear || "Year") +
                        ".pdf"
                    );
                },

                onPrint: function (oEvent) {
                    var oContext = oEvent.getSource().getBindingContext("payroll") || oEvent.getSource().getBindingContext();

                    if (!oContext) {
                        sap.m.MessageToast.show("No Payslip Selected");
                        return;
                    }

                    var oData = oContext.getObject();
                    var oModel = this.getOwnerComponent().getModel();
                    var that = this;

                    // Use Filters to force GET_ENTITYSET execution instead of direct key GET_ENTITY
                    var aFilters = [
                        new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.EQ, String(oData.EmpId).trim()),
                        new sap.ui.model.Filter("PayMonth", sap.ui.model.FilterOperator.EQ, String(oData.PayMonth).trim()),
                        new sap.ui.model.Filter("PayYear", sap.ui.model.FilterOperator.EQ, String(oData.PayYear).trim())
                    ];

                    oModel.read("/PayrollSet", {
                        filters: aFilters,
                        success: function (oResponse) {
                            if (oResponse && oResponse.results && oResponse.results.length > 0) {
                                var oPayroll = oResponse.results[0];
                                that._printPayslip(oData, oPayroll);
                            } else {
                                sap.m.MessageToast.show("No detailed payroll record found.");
                            }
                        },
                        error: function (oError) {
                            console.error("Read Error:", oError);
                            sap.m.MessageToast.show("Unable to load Payroll Details for Print");
                        }
                    });
                },
                _printPayslip: function (oData, oPayroll) {

                    var sDate = new Date(oData.GeneratedOn).toLocaleDateString("en-GB");

                    var sHTML = `
<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8">

<title>Payslip</title>

<style>

@page{
    size:A4 portrait;
    margin:15mm;
}

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    width:210mm;
    min-height:297mm;
    margin:0 auto;
    padding:10mm;
    font-family:Arial, Helvetica, sans-serif;
    font-size:13px;
    color:#222;
    background:#fff;
}

.header{
    text-align:center;
    border-bottom:3px solid #0f0f0f;
    padding-bottom:12px;
    margin-bottom:20px;
}

.header h1{
    font-size:28px;
    color: #414345;
    margin-bottom:5px;
}

.header h2{
    font-size:20px;
    margin-bottom:5px;
}

.header h3{
    font-size:16px;
    color:#555;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
    page-break-inside:avoid;
}

th,
td{
    border:1px solid #cfcfcf;
    padding:9px 10px;
    font-size:13px;
}

th{
    background:#5b5c5d;;
    color:#fff;
    text-align:left;
}

td:last-child,
th:last-child{
    text-align:right;
}

.total{
    background:#616367;;
    color:#fff;
    font-weight:bold;
    font-size:15px;
}

.signatureTable{
    width:100%;
    margin-top:70px;
    border:none;
}

.signatureTable td{
    border:none;
    text-align:center;
    vertical-align:bottom;
}

.signLine{
    width:220px;
    margin:auto;
    border-top:1px solid #000;
    margin-bottom:8px;
}

.footer{
    margin-top:40px;
    text-align:center;
    font-size:12px;
    color:#777;
    border-top:1px solid #ccc;
    padding-top:10px;
}

@media print{

    html,
    body{
        width:210mm;
        height:297mm;
    }

    body{
        margin:0;
        padding:10mm;
    }

    .header,
    th,
    .total{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

}

</style>

</head>

<body>

<div class="header">

<h1>Proceed Group </h1>

<h2>MONTHLY PAYSLIP</h2>

<h3>${oData.PayMonth} - ${oData.PayYear}</h3>

</div>

<br>

<table>

<tr>

<td><b>Employee ID</b></td>
<td>${oData.EmpId}</td>

<td><b>Generated On</b></td>
<td>${sDate}</td>

</tr>

<tr>

<td><b>Employee Name</b></td>
<td>${oData.FirstName}</td>

<td><b>Department</b></td>
<td>${oData.DeptName}</td>

</tr>

<tr>

<td><b>Role</b></td>
<td>${oData.RoleName}</td>

<td><b>Email</b></td>
<td>${oData.Email}</td>

</tr>

<tr>

<td><b>Phone</b></td>
<td>${oData.Phone}</td>

<td><b>Currency</b></td>
<td>INR</td>

</tr>

</table>

<br>

<table>

<tr>

<th>Description</th>
<th>Amount (INR)</th>

</tr>

<tr>
<td>Basic Pay</td>
<td align="right">${Number(oPayroll.BasicPay).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>HRA</td>
<td align="right">${Number(oPayroll.Hra).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>DA</td>
<td align="right">${Number(oPayroll.Da).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Special Allowance</td>
<td align="right">${Number(oPayroll.SpecialAllowance).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Travel Allowance</td>
<td align="right">${Number(oPayroll.TravelAllowance).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Bonus</td>
<td align="right">${Number(oPayroll.Bonus).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Gross Salary</td>
<td align="right">${Number(oPayroll.GrossSalary).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>PF</td>
<td align="right">${Number(oPayroll.Pf).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Tax</td>
<td align="right">${Number(oPayroll.Tax).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Professional Tax</td>
<td align="right">${Number(oPayroll.ProfessionalTax).toLocaleString("en-IN")}</td>
</tr>

<tr>
<td>Total Deductions</td>
<td align="right">${Number(oPayroll.Deductions).toLocaleString("en-IN")}</td>
</tr>

<tr class="total">

<td>Net Salary</td>

<td align="right">

${Number(oPayroll.NetSalary).toLocaleString("en-IN")}

</td>

</tr>

</table>

<br><br>

<table class="signatureTable">

<tr>

<td>

<div class="signLine"></div>

Employee Signature

</td>

<td>

<div class="signLine"></div>

Authorized Signature

</td>

</tr>

</table>

<div class="footer">

This is a system generated payslip and does not require a physical signature.

</div>

</body>

</html>
`;

                    var oWin = window.open("", "_blank");

                    oWin.document.write(sHTML);

                    oWin.document.close();

                    oWin.focus();

                    oWin.print();

                }

            });


    });