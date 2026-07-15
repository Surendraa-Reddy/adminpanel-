sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet"

], function (Controller, MessageToast, Filter, FilterOperator, Spreadsheet) {

    "use strict";

    return Controller.extend("employee.controller.Reports", {

        onInit: function () {

            this._loadDepartments();
            this._loadRoles();

            this.byId("reportSelector").setSelectedKey("EMPLOYEE");

            this.byId("employeePanel").setVisible(true);
            this.byId("departmentPanel").setVisible(false);
            this.byId("attendancePanel").setVisible(false);



            var oDepartmentModel = new sap.ui.model.json.JSONModel({
                Departments: []
            });

            this.getView().setModel(oDepartmentModel, "department");
            var oSession = this.getOwnerComponent().getModel("session");

            if (!oSession.getProperty("/loggedIn")) {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Login", {}, true);

                return;

            }

            
        },
        formatTime: function (oTime) {

            if (!oTime) {
                return "";
            }

            var iMilliseconds = oTime.ms;

            var oDate = new Date(iMilliseconds);

            var sHours = String(oDate.getUTCHours()).padStart(2, "0");
            var sMinutes = String(oDate.getUTCMinutes()).padStart(2, "0");
            var sSeconds = String(oDate.getUTCSeconds()).padStart(2, "0");

            return sHours + ":" + sMinutes + ":" + sSeconds;
        },


        onReportChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oSearchField = this.byId("employeeSearch");

            // 1. Explicitly hide ALL panels first
            this.byId("employeePanel").setVisible(false);
            this.byId("departmentPanel").setVisible(false);
            this.byId("attendancePanel").setVisible(false);
            this.byId("leavePanel").setVisible(false);

            // 2. Show only the one matching the clicked SegmentedButton key
            switch (sKey) {
                case "EMPLOYEE":
                    this.byId("employeePanel").setVisible(true);
                    oSearchField.setPlaceholder("Search Employee");
                    break;
                case "DEPARTMENT":
                    this.byId("departmentPanel").setVisible(true);
                    this._loadDepartmentReport();
                    oSearchField.setPlaceholder("Search Department");
                    break;
                case "ATTENDANCE":
                    this.byId("attendancePanel").setVisible(true);
                    oSearchField.setPlaceholder("Search Attendance ID");
                    break;
                case "LEAVE":
                    this.byId("leavePanel").setVisible(true);
                    oSearchField.setPlaceholder("Search");
                    break;
            }
        },
        onSearch: function () {

            var sReport = this.byId("reportSelector").getSelectedKey();

            switch (sReport) {

                case "EMPLOYEE":
                    this._searchEmployee();
                    break;

                case "DEPARTMENT":
                    this._searchDepartment();
                    break;

                case "ATTENDANCE":
                    this._searchAttendance();
                    break;

                case "LEAVE":
                    this._searchLeave();
                    break;
            }

        },
        _searchEmployee: function () {

            var oTable = this.byId("employeeReportTable");
            var oBinding = oTable.getBinding("items");

            var aFilters = [];

            var sEmployee = this.byId("employeeSearch").getValue();

            if (sEmployee) {

                aFilters.push(new Filter({

                    filters: [

                        new Filter("EmpId", FilterOperator.Contains, sEmployee),
                        new Filter("FirstName", FilterOperator.Contains, sEmployee),
                        new Filter("LastName", FilterOperator.Contains, sEmployee),
                        new Filter("Email", FilterOperator.Contains, sEmployee),
                        new Filter("Phone", FilterOperator.Contains, sEmployee)

                    ],

                    and: false

                }));

            }

            var sDept = this.byId("departmentFilter").getSelectedKey();

            if (sDept) {
                aFilters.push(new Filter("DeptId", FilterOperator.EQ, sDept));
            }

            var sRole = this.byId("roleFilter").getSelectedKey();

            if (sRole) {
                aFilters.push(new Filter("RoleId", FilterOperator.EQ, sRole));
            }

            var sStatus = this.byId("statusFilter").getSelectedKey();

            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            var oFromDate = this.byId("fromDate").getDateValue();

            if (oFromDate) {
                aFilters.push(new Filter("JoinDate", FilterOperator.GE, oFromDate));
            }

            var oToDate = this.byId("toDate").getDateValue();

            if (oToDate) {
                aFilters.push(new Filter("JoinDate", FilterOperator.LE, oToDate));
            }

            oBinding.filter(aFilters);

        },
        _searchDepartment: function () {

            var oTable = this.byId("departmentReportTable");
            var oBinding = oTable.getBinding("items");

            var aFilters = [];

            var sSearch = this.byId("employeeSearch").getValue();

            // FIXED: Changed "f(sSearch)" to "if (sSearch) {"
            if (sSearch) {
                var sQuery = sSearch.toLowerCase();

                aFilters.push(new Filter({
                    filters: [
                        new Filter({
                            path: "DeptId",
                            test: function (v) { return (v || "").toString().toLowerCase().includes(sQuery); }
                        }),
                        new Filter({
                            path: "DeptName",
                            test: function (v) { return (v || "").toString().toLowerCase().includes(sQuery); }
                        }),
                        new Filter({
                            path: "Location",
                            test: function (v) { return (v || "").toString().toLowerCase().includes(sQuery); }
                        })
                    ],
                    and: false
                }));
            }

            var sStatus = this.byId("statusFilter").getSelectedKey();

            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            oBinding.filter(aFilters);
        },
        _searchAttendance: function () {
            var oTable = this.byId("attendanceReportTable");
            if (!oTable) {
                return;
            }

            var oBinding = oTable.getBinding("items");
            if (!oBinding) {
                return;
            }

            var aFilters = [];
            var sEmployee = this.byId("employeeSearch").getValue();

            // 1. Search Bar Filter
            if (sEmployee) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("AttId", FilterOperator.Contains, sEmployee),
                        new Filter("EmpId", FilterOperator.Contains, sEmployee)
                    ],
                    and: false
                }));
            }

            // 2. Status Filter (Allows any active code selected by the ComboBox/Select item)
            var sStatus = this.byId("statusFilter").getSelectedKey();
            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            // 3. From Date Filter (Normalized to UTC midnight)
            var oFrom = this.byId("fromDate").getDateValue();
            if (oFrom) {
                var oFromUTC = new Date(Date.UTC(oFrom.getFullYear(), oFrom.getMonth(), oFrom.getDate(), 0, 0, 0));
                aFilters.push(new Filter("AttDate", FilterOperator.GE, oFromUTC));
            }

            // 4. To Date Filter (Normalized to UTC end-of-day)
            var oTo = this.byId("toDate").getDateValue();
            if (oTo) {
                var oToUTC = new Date(Date.UTC(oTo.getFullYear(), oTo.getMonth(), oTo.getDate(), 23, 59, 59));
                aFilters.push(new Filter("AttDate", FilterOperator.LE, oToUTC));
            }

            // Apply the synchronized filters
            oBinding.filter(aFilters);
        },
        _searchLeave: function () {
            var oBinding = this.byId("leaveReportTable").getBinding("items");
            var aFilters = [];
            var sSearch = this.byId("employeeSearch").getValue();

            if (sSearch) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("LeaveId", FilterOperator.Contains, sSearch),
                        new Filter("EmpId", FilterOperator.Contains, sSearch)
                    ],
                    and: false
                }));
            }

            var sStatus = this.byId("statusFilter").getSelectedKey();
            if (sStatus && ["A", "P", "R"].includes(sStatus)) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            var oFrom = this.byId("fromDate").getDateValue();
            if (oFrom) {
                // MATCHED TO METADATA: FromDate
                aFilters.push(new Filter("FromDate", FilterOperator.GE, oFrom));
            }

            var oTo = this.byId("toDate").getDateValue();
            if (oTo) {
                // MATCHED TO METADATA: ToDate
                aFilters.push(new Filter("ToDate", FilterOperator.LE, oTo));
            }

            oBinding.filter(aFilters);
        },
        onViewEmployee: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            var sEmpId = oContext.getProperty("EmpId");

            this.getOwnerComponent().getRouter().navTo("EmployeeDetails", {

                empId: sEmpId

            });

        },

        onReset: function () {
            this.byId("employeeSearch").setValue("");
            this.byId("departmentFilter").setSelectedKey("");
            this.byId("roleFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("fromDate").setDateValue(null);
            this.byId("toDate").setDateValue(null);

            this.byId("employeeReportTable").getBinding("items").filter([]);
            this.byId("attendanceReportTable").getBinding("items").filter([]);
            this.byId("departmentReportTable").getBinding("items").filter([]);
            this.byId("leaveReportTable").getBinding("items").filter([]);
        },
        onExportExcel: function () {

            var sReport = this.byId("reportSelector").getSelectedKey();

            switch (sReport) {

                case "EMPLOYEE":
                    this._exportEmployeeExcel();
                    break;

                case "DEPARTMENT":
                    this._exportDepartmentExcel();
                    break;

                case "ATTENDANCE":
                    this._exportAttendanceExcel();
                    break;

                case "LEAVE":
                    this._exportLeaveExcel();
                    break;
            }

        },


        onPrint: function () {

            window.print();

        },

        _loadDepartments: function () {

            var oCombo = this.byId("departmentFilter");

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/DepartmentSet", {

                success: function (oData) {

                    // console.log(oData.results);

                    oCombo.removeAllItems();

                    oCombo.addItem(new sap.ui.core.Item({
                        key: "",
                        text: "All Departments"
                    }));

                    oData.results.forEach(function (oDept) {

                        // console.log(oDept);

                        oCombo.addItem(new sap.ui.core.Item({
                            key: oDept.DeptId,
                            text: oDept.DeptName
                        }));

                    });

                }

            });

        },

        _loadRoles: function () {

            var oCombo = this.byId("roleFilter");

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/RolesSet", {

                success: function (oData) {

                    oCombo.removeAllItems();

                    oCombo.addItem(new sap.ui.core.Item({

                        key: "",

                        text: "All Roles"

                    }));

                    oData.results.forEach(function (oRole) {

                        oCombo.addItem(new sap.ui.core.Item({

                            key: oRole.RoleId,

                            text: oRole.RoleName

                        }));

                    });

                }

            });

        },

        _loadEmployeeReport: function () {

        },

        _loadDepartmentReport: function () {

            var oModel = this.getOwnerComponent().getModel();
            var oDeptModel = this.getView().getModel("department");

            oModel.read("/DepartmentSet", {

                success: function (oDeptData) {

                    oModel.read("/EmployeeeSet", {

                        success: function (oEmpData) {

                            var aDepartments = oDeptData.results;
                            var aEmployees = oEmpData.results;

                            aDepartments.forEach(function (oDept) {

                                var iCount = 0;

                                aEmployees.forEach(function (oEmp) {

                                    if (oEmp.DeptId === oDept.DeptId) {
                                        iCount++;
                                    }

                                });

                                oDept.TotalEmployees = iCount;

                            });

                            oDeptModel.setProperty("/Departments", aDepartments);

                        }

                    });

                }

            });

        },

        _loadAttendanceReport: function () {


            this.byId("attendancePanel").setVisible(true);


        },
        _exportEmployeeExcel: function () {

            var aCols = [
                { label: "Employee ID", property: "EmpId" },
                { label: "First Name", property: "FirstName" },
                { label: "Last Name", property: "LastName" },
                { label: "Department", property: "DeptId" },
                { label: "Role", property: "RoleId" },
                { label: "Gender", property: "Gender" },
                { label: "Email", property: "Email" },
                { label: "Phone", property: "Phone" },
                { label: "Status", property: "Status" }
            ];

            var aData = this.byId("employeeReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {

                    var oEmp = Object.assign({}, oContext.getObject());

                    oEmp.Status = Number(oEmp.Status) === 1 ? "Active" : "Inactive";

                    return oEmp;

                });

            var oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileName: "Employee_Report.xlsx"
            };

            var oSheet = new Spreadsheet(oSettings);

            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        },
        _exportDepartmentExcel: function () {

            var aCols = [
                { label: "Department ID", property: "DeptId" },
                { label: "Department Name", property: "DeptName" },
                { label: "Location", property: "Location" },
                { label: "Status", property: "Status" },
                { label: "Total Employees", property: "TotalEmployees" }
            ];

            var aData = this.byId("departmentReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {

                    var oDept = Object.assign({}, oContext.getObject());

                    oDept.Status = Number(oDept.Status) === 1 ? "Active" : "Inactive";

                    return oDept;

                });

            var oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileName: "Department_Report.xlsx"
            };

            var oSheet = new Spreadsheet(oSettings);

            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        },
        _exportAttendanceExcel: function () {

            var aCols = [
                { label: "Attendance ID", property: "AttId" },
                { label: "Employee ID", property: "EmpId" },
                { label: "Attendance Date", property: "AttDate" },
                { label: "Check In", property: "Checkin" },
                { label: "Check Out", property: "Checkout" },
                { label: "Status", property: "Status" }
            ];

            var aData = this.byId("attendanceReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {

                    var oAtt = Object.assign({}, oContext.getObject());

                    oAtt.Status = oAtt.Status === "P" ? "Present" : "Absent";

                    return oAtt;

                });
            var oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileName: "Attendance_Report.xlsx"
            };

            var oSheet = new Spreadsheet(oSettings);

            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        },
        _exportLeaveExcel: function () {

            var aCols = [
                { label: "Leave ID", property: "LeaveId" },
                { label: "Employee ID", property: "EmpId" },
                { label: "Leave Type", property: "LeaveType" },
                { label: "From Date", property: "FromDate" },
                { label: "To Date", property: "ToDate" },
                { label: "Reason", property: "Reason" },
                { label: "Status", property: "Status" }
            ];

            var aData = this.byId("leaveReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {

                    var oLeave = Object.assign({}, oContext.getObject());

                    switch (oLeave.Status) {

                        case "A":
                            oLeave.Status = "Approved";
                            break;

                        case "P":
                            oLeave.Status = "Pending";
                            break;

                        case "R":
                            oLeave.Status = "Rejected";
                            break;

                        default:
                            oLeave.Status = "Unknown";
                    }

                    return oLeave;

                });

            var oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileName: "Leave_Report.xlsx"
            };

            var oSheet = new Spreadsheet(oSettings);

            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        },
        onExportPDF: function () {

            var sReport = this.byId("reportSelector").getSelectedKey();

            switch (sReport) {

                case "EMPLOYEE":
                    this._exportEmployeePDF();
                    break;

                case "DEPARTMENT":
                    this._exportDepartmentPDF();
                    break;

                case "ATTENDANCE":
                    this._exportAttendancePDF();
                    break;

                case "LEAVE":
                    this._exportLeavePDF();
                    break;
            }
        },
        _exportEmployeePDF: function () {

            var { jsPDF } = window.jspdf;
            var doc = new jsPDF("l", "mm", "a4");

            var aEmployees = this.byId("employeeReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {
                    return oContext.getObject();
                });

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("Employee Report", 14, 15);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Generated On : " + new Date().toLocaleString(), 14, 22);

            var rows = [];

            aEmployees.forEach(function (emp) {

                rows.push([
                    emp.EmpId || "",
                    emp.FirstName || "",
                    emp.LastName || "",
                    emp.DeptId || "",
                    emp.RoleId || "",
                    emp.Gender || "",
                    emp.Email || "",
                    emp.Phone || "",
                    Number(emp.Status) === 1 ? "Active" : "Inactive",
                ]);

            });

            doc.autoTable({

                startY: 30,

                head: [[
                    "Employee ID",
                    "First Name",
                    "Last Name",
                    "Department",
                    "Role",
                    "Gender",
                    "Email",
                    "Phone",
                    "Status"
                ]],

                body: rows,

                theme: "grid",

                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    valign: "middle",
                    halign: "center"
                },

                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: "bold",
                    halign: "center"
                },

                bodyStyles: {
                    halign: "left"
                },

                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }

            });

            doc.save("Employee_Report.pdf");
        },
        _exportDepartmentPDF: function () {

            var { jsPDF } = window.jspdf;
            var doc = new jsPDF("l", "mm", "a4");

            var aDepartments = this.byId("departmentReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {
                    return oContext.getObject();
                });

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("Department Report", 14, 15);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Generated On : " + new Date().toLocaleString(), 14, 22);

            var rows = [];


            aDepartments.forEach(function (dept) {



                rows.push([
                    dept.DeptId,
                    dept.DeptName,
                    dept.Location,
                    Number(dept.Status) === 1 ? "Active" : "Inactive",
                    dept.TotalEmployees
                ]);

            });
            // console.log(aDepartments);

            doc.autoTable({

                startY: 30,

                head: [[
                    "Department ID",
                    "Department Name",
                    "Location",
                    "Status",
                    "Total Employees"
                ]],

                body: rows,

                theme: "grid",

                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: "center",
                    valign: "middle"
                },

                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: "bold"
                },

                bodyStyles: {
                    halign: "left"
                },

                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }

            });

            doc.save("Department_Report.pdf");

        },
        _exportAttendancePDF: function () {

            var { jsPDF } = window.jspdf;
            var doc = new jsPDF("l", "mm", "a4");

            var that = this;

            var aAttendance = this.byId("attendanceReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {
                    return oContext.getObject();
                });

            // IMPORTANT: Declare rows before using it
            var rows = [];

            aAttendance.forEach(function (att) {

                rows.push([
                    att.AttId || "",
                    att.EmpId || "",
                    att.AttDate ? new Date(att.AttDate).toLocaleDateString("en-GB") : "",
                    that.formatTime(att.Checkin),
                    that.formatTime(att.Checkout),
                    att.Status === "P" ? "Present" : "Absent"
                ]);

            });

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("Attendance Report", 14, 15);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Generated On : " + new Date().toLocaleString(), 14, 22);

            doc.autoTable({

                startY: 30,

                head: [[
                    "Attendance ID",
                    "Employee ID",
                    "Attendance Date",
                    "Check In",
                    "Check Out",
                    "Status"
                ]],

                body: rows,

                theme: "grid"

            });

            doc.save("Attendance_Report.pdf");
        },
        _exportLeavePDF: function () {

            var { jsPDF } = window.jspdf;
            var doc = new jsPDF("l", "mm", "a4");

            var aLeaves = this.byId("leaveReportTable")
                .getBinding("items")
                .getContexts()
                .map(function (oContext) {
                    return oContext.getObject();
                });

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("Leave Report", 14, 15);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Generated On : " + new Date().toLocaleString(), 14, 22);

            var rows = [];

            aLeaves.forEach(function (leave) {

                var sStatus = "";

                switch (leave.Status) {

                    case "A":
                        sStatus = "Approved";
                        break;

                    case "P":
                        sStatus = "Pending";
                        break;

                    case "R":
                        sStatus = "Rejected";
                        break;

                    default:
                        sStatus = leave.Status || "";
                }

                rows.push([
                    leave.LeaveId || "",
                    leave.EmpId || "",
                    leave.LeaveType || "",
                    leave.FromDate ? new Date(leave.FromDate).toLocaleDateString("en-GB") : "",
                    leave.ToDate ? new Date(leave.ToDate).toLocaleDateString("en-GB") : "",
                    leave.Reason || "",
                    sStatus
                ]);

            });

            doc.autoTable({

                startY: 30,

                head: [[
                    "Leave ID",
                    "Employee ID",
                    "Leave Type",
                    "From Date",
                    "To Date",
                    "Reason",
                    "Status"
                ]],

                body: rows,

                theme: "grid",

                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: "center",
                    valign: "middle"
                },

                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: "bold"
                },

                bodyStyles: {
                    halign: "left"
                },

                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }

            });

            doc.save("Leave_Report.pdf");

        },

    });

});