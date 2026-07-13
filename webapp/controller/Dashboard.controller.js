sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("employee.controller.Dashboard", {

        onInit: function () {
          
            var oDashboardModel = new JSONModel({
                Employees: 0,
                Departments: 0,
                Roles: 0,
                Leaves: 0,
                ActiveEmployees: 0,
                Attendance: 0
            });
            this.getView().setModel(oDashboardModel, "dashboard");

            var oChartModel = new JSONModel({
                DepartmentChart: [],
                GenderChart: [],
                AttendanceChart: [],
                LeaveChart: []
            });
            this.getView().setModel(oChartModel, "chart");

           
            var oRecentModel = new JSONModel({
                RecentEmployees: [],
                RecentLeaves: []
            });
            this.getView().setModel(oRecentModel, "recent");

            
            this._loadDashboardData();
            this._loadRecentTablesData();

           
            this._configureChartProperties();
        },

        
        _configureChartProperties: function () {
            var oVizProperties = {
                title: { visible: false },
                plotArea: {
                    dataLabel: { visible: true }
                }
            };

            this.byId("departmentChart").setVizProperties(oVizProperties);
            this.byId("genderChart").setVizProperties(oVizProperties);
            this.byId("attendanceChart").setVizProperties(oVizProperties);
            this.byId("leaveChart").setVizProperties(oVizProperties);
        },

        
        _loadDashboardData: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oDashboard = this.getView().getModel("dashboard");
            var oChart = this.getView().getModel("chart");

            
            oModel.read("/EmployeeeSet", {
                success: function (oData) {
                    var aEmployees = oData.results;
                    oDashboard.setProperty("/Employees", aEmployees.length);

                    var iActiveCount = 0;
                    var mDeptGroup = {};
                    var mGenderGroup = {};

                    aEmployees.forEach(function (oEmp) {
                       
                        if (oEmp.Status === "1") { iActiveCount++; }

                        
                        if (!mDeptGroup[oEmp.DeptId]) { mDeptGroup[oEmp.DeptId] = 0; }
                        mDeptGroup[oEmp.DeptId]++;

                        
                        var sGenderText = oEmp.Gender === "M" ? "Male" : oEmp.Gender === "F" ? "Female" : "Others";
                        if (!mGenderGroup[sGenderText]) { mGenderGroup[sGenderText] = 0; }
                        mGenderGroup[sGenderText]++;
                    });

                    oDashboard.setProperty("/ActiveEmployees", iActiveCount);

                    
                    var aDeptChartData = Object.keys(mDeptGroup).map(function (sKey) {
                        return { Department: sKey, Count: mDeptGroup[sKey] };
                    });
                    oChart.setProperty("/DepartmentChart", aDeptChartData);

                    
                    var aGenderChartData = Object.keys(mGenderGroup).map(function (sKey) {
                        return { Gender: sKey, Count: mGenderGroup[sKey] };
                    });
                    oChart.setProperty("/GenderChart", aGenderChartData);
                }
            });

            
            oModel.read("/DepartmentSet", {
                success: function (oData) {
                    oDashboard.setProperty("/Departments", oData.results.length);
                }
            });

          
            oModel.read("/RolesSet", {
                success: function (oData) {
                    oDashboard.setProperty("/Roles", oData.results.length);
                }
            });

            
            oModel.read("/LeavesSet", {
                success: function (oData) {
                    oDashboard.setProperty("/Leaves", oData.results.length);
                }
            });

           
            oModel.read("/AttendanceSet", {
                success: function (oData) {
                    var aAttendance = oData.results;
                    var mAttendanceTrend = {};
                    var iTodayAttendanceCount = 0;

                    
                    var sTodayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); 

                    aAttendance.forEach(function (oItem) {
                        if (oItem.Status === "P") {
                            var dDate = new Date(oItem.AttDate);
                            var sDateStr = dDate.getDate().toString().padStart(2, "0") + "-" +
                                           (dDate.getMonth() + 1).toString().padStart(2, "0") + "-" +
                                           dDate.getFullYear();

                            if (!mAttendanceTrend[sDateStr]) { mAttendanceTrend[sDateStr] = 0; }
                            mAttendanceTrend[sDateStr]++;

                            if (sDateStr === sTodayStr) { iTodayAttendanceCount++; }
                        }
                    });

                    oDashboard.setProperty("/Attendance", iTodayAttendanceCount);

                    
                    var aAttendanceChartData = Object.keys(mAttendanceTrend).map(function (sDate) {
                        return { Date: sDate, PresentCount: mAttendanceTrend[sDate] };
                    });
                    oChart.setProperty("/AttendanceChart", aAttendanceChartData);
                }
            });

            
            oModel.read("/LeavesSet", {
                success: function (oData) {
                    var aLeaves = oData.results;
                    var mLeaveStatus = { Pending: 0, Approved: 0, Rejected: 0 };

                    aLeaves.forEach(function (oLeave) {
                        if (oLeave.Status === "P") { mLeaveStatus.Pending++; }
                        else if (oLeave.Status === "A") { mLeaveStatus.Approved++; }
                        else if (oLeave.Status === "R") { mLeaveStatus.Rejected++; }
                    });

                    var aLeaveChartData = [
                        { Status: "Pending", Count: mLeaveStatus.Pending },
                        { Status: "Approved", Count: mLeaveStatus.Approved },
                        { Status: "Rejected", Count: mLeaveStatus.Rejected }
                    ];
                    oChart.setProperty("/LeaveChart", aLeaveChartData);
                }
            });
        },

    
        _loadRecentTablesData: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oRecent = this.getView().getModel("recent");

      
            oModel.read("/EmployeeeSet", {
                success: function (oData) {
                    var aEmployees = oData.results || [];
                    var aRecentEmp = aEmployees.slice(-5).reverse();
                    oRecent.setProperty("/RecentEmployees", aRecentEmp);
                }
            });

            // Recent Leave Requests Table
            oModel.read("/LeavesSet", {
                success: function (oData) {
                    var aLeaves = oData.results || [];
                    // Take the last 5 records and reverse to show newest first
                    var aRecentLeaves = aLeaves.slice(-5).reverse();
                    oRecent.setProperty("/RecentLeaves", aRecentLeaves);
                }
            });
        },

        // Navigational Press Event Routing Handlers
        onViewEmployee: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("recent");
            var sEmpId = oContext.getProperty("EmpId");
            this.getOwnerComponent().getRouter().navTo("EmployeeDetails", { empId: sEmpId });
        },

        onEmployee: function () { this.getOwnerComponent().getRouter().navTo("Employee"); },
        onDepartment: function () { this.getOwnerComponent().getRouter().navTo("Department"); },
        onRole: function () { this.getOwnerComponent().getRouter().navTo("Roles"); },
        onLeave: function () { this.getOwnerComponent().getRouter().navTo("Leave"); }
    });
});