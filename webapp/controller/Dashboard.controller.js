sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {

    "use strict";

    return Controller.extend("employee.controller.Dashboard", {

        onInit: function () {

            var oDashboard = new JSONModel({

                Employees: 0,
                Departments: 0,
                Roles: 0,
                Leaves: 0,
                ActiveEmployees: 0

            });

            this.getView().setModel(oDashboard, "dashboard");

            var oChart = new JSONModel({

                DepartmentChart: [],
                GenderChart: [],
                AttendanceChart: [],
                LeaveChart: []

            });


            this.getView().setModel(oChart, "chart");

            this._loadDashboard();
            var oRecent = new JSONModel({

                RecentEmployees: [],
                RecentLeaves: []

            });

            this.getView().setModel(oRecent, "recent");
            this._loadRecentData();

        },

        _loadDashboard: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oDashboard = this.getView().getModel("dashboard");

            var oChart = this.getView().getModel("chart");

            // Employees
            oModel.read("/EmployeeeSet", {

                success: function (oData) {

                    var aEmployees = oData.results;

                    oDashboard.setProperty("/Employees", aEmployees.length);

                    // Active Employees

                    var iActive = 0;

                    var mDept = {};

                    var mGender = {};

                    aEmployees.forEach(function (oEmp) {

                        if (oEmp.Status === "1") {
                            iActive++;
                        }

                        if (!mDept[oEmp.DeptId]) {
                            mDept[oEmp.DeptId] = 0;
                        }

                        mDept[oEmp.DeptId]++;

                        var sGender =
                            oEmp.Gender === "M" ? "Male" :
                                oEmp.Gender === "F" ? "Female" :
                                    "Others";

                        if (!mGender[sGender]) {
                            mGender[sGender] = 0;
                        }

                        mGender[sGender]++;

                    });

                    oDashboard.setProperty("/ActiveEmployees", iActive);

                    var aDept = [];

                    Object.keys(mDept).forEach(function (sKey) {

                        aDept.push({

                            Department: sKey,
                            Count: mDept[sKey]

                        });

                    });

                    var aGender = [];

                    Object.keys(mGender).forEach(function (sKey) {

                        aGender.push({

                            Gender: sKey,
                            Count: mGender[sKey]

                        });

                    });

                    oChart.setProperty("/DepartmentChart", aDept);

                    oChart.setProperty("/GenderChart", aGender);

                }

            });

            // Departments

            oModel.read("/DepartmentSet", {

                success: function (oData) {

                    oDashboard.setProperty("/Departments", oData.results.length);

                }

            });

            // Roles

            oModel.read("/RolesSet", {

                success: function (oData) {

                    oDashboard.setProperty("/Roles", oData.results.length);

                }

            });

            // Leaves

            oModel.read("/LeavesSet", {

                success: function (oData) {

                    oDashboard.setProperty("/Leaves", oData.results.length);

                }

            });
            // Attendance Chart

            oModel.read("/AttendanceSet", {

                success: function (oData) {

                    var aAttendance = oData.results;

                    var mAttendance = {};

                    aAttendance.forEach(function (oItem) {

                        /*
                         Status should be something like
                         P = Present
                         A = Absent
            
                         If your backend uses
                         1 / 0
                         change below accordingly.
                        */

                        if (oItem.Status === "P") {

                            // Convert OData DateTime to JS Date

                            var dDate = new Date(oItem.AttDate);

                            var sDate =
                                dDate.getDate().toString().padStart(2, "0") + "-" +
                                (dDate.getMonth() + 1).toString().padStart(2, "0") + "-" +
                                dDate.getFullYear();

                            if (!mAttendance[sDate]) {
                                mAttendance[sDate] = 0;
                            }

                            mAttendance[sDate]++;

                        }

                    });

                    var aChart = [];

                    Object.keys(mAttendance).forEach(function (sDate) {

                        aChart.push({

                            Date: sDate,
                            PresentCount: mAttendance[sDate]

                        });

                    });

                    oChart.setProperty("/AttendanceChart", aChart);

                },

                error: function () {

                    console.log("Attendance Read Failed");

                }

            });
            // Leave Status Chart

            oModel.read("/LeavesSet", {

                success: function (oData) {

                    var aLeaves = oData.results;

                    var mLeave = {
                        Pending: 0,
                        Approved: 0,
                        Rejected: 0
                    };

                    aLeaves.forEach(function (oItem) {

                        switch (oItem.Status) {

                            case "P":
                                mLeave.Pending++;
                                break;

                            case "A":
                                mLeave.Approved++;
                                break;

                            case "R":
                                mLeave.Rejected++;
                                break;

                        }

                    });

                    var aLeaveChart = [

                        {
                            Status: "Pending",
                            Count: mLeave.Pending
                        },
                        {
                            Status: "Approved",
                            Count: mLeave.Approved
                        },
                        {
                            Status: "Rejected",
                            Count: mLeave.Rejected
                        }

                    ];

                    oChart.setProperty("/LeaveChart", aLeaveChart);

                },

                error: function () {

                    console.log("Leave Read Failed");

                }

            });

        },
        _loadRecentData: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oRecent = this.getView().getModel("recent");

            //==========================
            // Recent Employees
            //==========================

            oModel.read("/EmployeeeSet", {

                success: function (oData) {

                    var aEmployees = oData.results;

                    // Latest 5 Employees
                    aEmployees = aEmployees.slice(-5).reverse();

                    oRecent.setProperty("/RecentEmployees", aEmployees);

                },

                error: function () {

                    console.log("Employee Read Failed");

                }

            });

            //==========================
            // Recent Leave Requests
            //==========================

            oModel.read("/LeavesSet", {

                success: function (oData) {

                    var aLeaves = oData.results;

                    // Latest 5 Leave Requests
                    aLeaves = aLeaves.slice(-5).reverse();

                    oRecent.setProperty("/RecentLeaves", aLeaves);

                },

                error: function () {

                    console.log("Leave Read Failed");

                }

            });

        },
        onViewEmployee: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext("recent");

            var sEmpId = oContext.getProperty("EmpId");

            this.getOwnerComponent().getRouter().navTo("EmployeeDetails", {

                empId: sEmpId

            });

        },
        onEmployee: function () {
            this.getOwnerComponent().getRouter().navTo("Employee");
        },

        onDepartment: function () {
            this.getOwnerComponent().getRouter().navTo("Department");
        },

        onRole: function () {
            this.getOwnerComponent().getRouter().navTo("Roles");
        },

        onLeave: function () {
            this.getOwnerComponent().getRouter().navTo("Leave");
        }

    });

});