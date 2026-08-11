sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "employee/model/formatter"
], function (
    Controller,
    JSONModel,
    MessageToast,
    formatter
) {
    "use strict";

    return Controller.extend("employee.controller.recruitment.RecruitmentDashboard", {

        formatter: formatter,


        onInit: function () {

            var oDashboardModel = new JSONModel({

                OpenJobs: 0,
                ClosedJobs: 0,
                Candidates: 0,
                TodayInterviews: 0,

                TotalVacancies: 0,

                FullTimeJobs: 0,
                ContractJobs: 0,
                InternshipJobs: 0,

                JobsCreatedThisMonth: 0,
                ExpiringJobs: 0,

                AllJobs: [],
                RecentJobs: [],

                AllCandidates: [],
                RecentCandidates: [],

                AppliedCandidates: 0,
                ShortlistedCandidates: 0,
                InterviewCandidates: 0,
                SelectedCandidates: 0,
                RejectedCandidates: 0,

                TodayInterviewList: [],
                RecentActivities: [],
                UpcomingDeadlines: []
            });

            this.getView().setModel(
                oDashboardModel,
                "dashboard"
            );
            var oChartModel = new JSONModel({

                JobStatus: [],

                DepartmentJobs: []

            });

            this.getView().setModel(
                oChartModel,
                "chart"
            );

            this._loadDashboard();



        },



        _loadDashboard: function () {

            var that = this;
            var oModel = this.getOwnerComponent().getModel();

            // Load Jobs
            oModel.read("/JobOpeningSet", {

                success: function (oData) {

                    that._aAllJobs = oData.results;
                    that._processJobs(that._aAllJobs);

                },

                error: function () {

                    MessageToast.show("Unable to load Jobs.");

                }

            });

            // Load Candidates
            oModel.read("/CandidateSet", {

                success: function (oData) {

                    that._processCandidates(oData.results);

                },

                error: function () {

                    MessageToast.show("Unable to load Candidates.");

                }

            });
            oModel.read("/InterviewSet", {

                success: function (oData) {

                    that._processTodayInterviews(oData.results);

                },

                error: function () {

                    MessageToast.show("Unable to load Interviews.");

                }

            });

        },

        _processJobs: function (aJobs) {

            var oDashboard = this.getView().getModel("dashboard");
            var oChart = this.getView().getModel("chart");

            var iOpen = 0;
            var iClosed = 0;

            var mDepartment = {};

            var iVacancies = 0;

            var iFullTime = 0;
            var iContract = 0;
            var iInternship = 0;

            var iCreatedThisMonth = 0;
            var iExpiring = 0;

            var aDeadlines = [];

            var oToday = new Date();

            var iCurrentMonth = oToday.getMonth();
            var iCurrentYear = oToday.getFullYear();

            aJobs.forEach(function (oJob) {

                // Open / Closed Jobs

                if (oJob.Status === "OPEN") {
                    iOpen++;
                } else {
                    iClosed++;
                }

                // Department Count

                if (!mDepartment[oJob.Department]) {
                    mDepartment[oJob.Department] = 0;
                }

                mDepartment[oJob.Department]++;

                // Total Vacancies

                iVacancies += Number(oJob.Vacancies || 0);

                // Job Type Count

                switch ((oJob.JobType || "").toUpperCase()) {

                    case "FULL TIME":
                        iFullTime++;
                        break;

                    case "CONTRACT":
                        iContract++;
                        break;

                    case "INTERNSHIP":
                        iInternship++;
                        break;

                }

                // Jobs Created This Month

                if (oJob.CreatedOn) {

                    var oCreated = new Date(oJob.CreatedOn);

                    if (
                        oCreated.getMonth() === iCurrentMonth &&
                        oCreated.getFullYear() === iCurrentYear
                    ) {

                        iCreatedThisMonth++;

                    }

                }

                // Expiring Jobs (within next 7 days)

                // Upcoming Deadlines (Next 7 Days)

                if (oJob.LastDate) {

                    var oExpiry = new Date(oJob.LastDate);

                    var iDiff = Math.ceil(
                        (oExpiry.getTime() - oToday.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    if (iDiff >= 0 && iDiff <= 7) {

                        iExpiring++;

                        aDeadlines.push({

                            JobId: oJob.JobId,

                            JobTitle: oJob.JobTitle,

                            Department: oJob.Department,

                            LastDate: oJob.LastDate,

                            DaysLeft: iDiff

                        });

                    }

                }

            });

            // KPI Tiles

            oDashboard.setProperty("/OpenJobs", iOpen);
            oDashboard.setProperty("/ClosedJobs", iClosed);

            // Statistics

            oDashboard.setProperty("/TotalVacancies", iVacancies);
            oDashboard.setProperty("/FullTimeJobs", iFullTime);
            oDashboard.setProperty("/ContractJobs", iContract);
            oDashboard.setProperty("/InternshipJobs", iInternship);
            oDashboard.setProperty("/JobsCreatedThisMonth", iCreatedThisMonth);
            oDashboard.setProperty("/ExpiringJobs", iExpiring);

            // Table

            oDashboard.setProperty("/RecentJobs", aJobs);

            // Pie Chart

            oChart.setProperty("/JobStatus", [
                {
                    Status: "Open",
                    Count: iOpen
                },
                {
                    Status: "Closed",
                    Count: iClosed
                }
            ]);

            // Department Chart

            var aDepartment = [];

            Object.keys(mDepartment).forEach(function (sDept) {

                aDepartment.push({
                    Department: sDept,
                    Count: mDepartment[sDept]
                });

            });

            oChart.setProperty("/DepartmentJobs", aDepartment);

            var aActivities = [];

            aJobs.slice(0, 10).forEach(function (oJob) {

                aActivities.push({

                    Time: oJob.CreatedOn,
                    Type: "JOB_CREATED",
                    Title: oJob.JobTitle,
                    Description: "New job opening created"

                });

            });

            oDashboard.setProperty("/RecentActivities", aActivities);
            oDashboard.setProperty("/UpcomingDeadlines", aDeadlines);


        },
        _processCandidates: function (aCandidates) {

            var oDashboard = this.getView().getModel("dashboard");

            var iApplied = 0;
            var iShortlisted = 0;
            var iInterview = 0;
            var iSelected = 0;
            var iRejected = 0;

            aCandidates.forEach(function (oCandidate) {

                switch ((oCandidate.Status || "").toUpperCase()) {

                    case "APPLIED":
                        iApplied++;
                        break;

                    case "SHORTLISTED":
                        iShortlisted++;
                        break;

                    case "INTERVIEW":
                        iInterview++;
                        break;

                    case "SELECTED":
                    case "HIRED":
                        iSelected++;
                        break;

                    case "REJECTED":
                        iRejected++;
                        break;

                }

            });

            oDashboard.setProperty("/Candidates", aCandidates.length);

            oDashboard.setProperty("/AppliedCandidates", iApplied);

            oDashboard.setProperty("/ShortlistedCandidates", iShortlisted);

            oDashboard.setProperty("/InterviewCandidates", iInterview);

            oDashboard.setProperty("/SelectedCandidates", iSelected);

            oDashboard.setProperty("/RejectedCandidates", iRejected);

            oDashboard.setProperty("/AllCandidates", aCandidates);

            // Latest 5 candidates
            oDashboard.setProperty(
                "/RecentCandidates",
                aCandidates.slice(0, 5)
            );

        },
        _processTodayInterviews: function (aInterviews) {

            var oDashboard = this.getView().getModel("dashboard");

            var oToday = new Date();

            var sToday =
                oToday.getFullYear() +
                "-" +
                String(oToday.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(oToday.getDate()).padStart(2, "0");

            var aTodayInterviews = [];

            aInterviews.forEach(function (oInterview) {

                if (!oInterview.InterviewDate) {
                    return;
                }

                var oDate = new Date(oInterview.InterviewDate);

                var sInterviewDate =
                    oDate.getFullYear() +
                    "-" +
                    String(oDate.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(oDate.getDate()).padStart(2, "0");

                if (sInterviewDate === sToday) {

                    // Convert OData Time to HH:mm
                    var sTime = "";

                    if (oInterview.InterviewTime) {

                        if (oInterview.InterviewTime.ms !== undefined) {

                            var d = new Date(oInterview.InterviewTime.ms);

                            sTime =
                                String(d.getUTCHours()).padStart(2, "0") +
                                ":" +
                                String(d.getUTCMinutes()).padStart(2, "0");

                        } else if (typeof oInterview.InterviewTime === "string") {

                            var m = oInterview.InterviewTime.match(/(\d+)H(\d+)M/);

                            if (m) {

                                sTime =
                                    String(m[1]).padStart(2, "0") +
                                    ":" +
                                    String(m[2]).padStart(2, "0");

                            }

                        }

                    }

                    aTodayInterviews.push({

                        CandidateName: oInterview.CandidateName,

                        InterviewTime: sTime,

                        Interviewer: oInterview.Interviewer,

                        Status: oInterview.Status

                    });

                }

            });

            oDashboard.setProperty(
                "/TodayInterviewList",
                aTodayInterviews
            );

            oDashboard.setProperty(
                "/TodayInterviews",
                aTodayInterviews.length
            );

        },
        onStatusChartSelect: function (oEvent) {

            var sStatus = oEvent.getParameter("data")[0].data.Status;

            if (sStatus === "Open") {
                sStatus = "OPEN";
            } else {
                sStatus = "CLOSED";
            }

            var oDashboard = this.getView().getModel("dashboard");

            var aJobs = this._aAllJobs;

            var aFiltered = aJobs.filter(function (oJob) {

                return oJob.Status === sStatus;

            });

            oDashboard.setProperty("/RecentJobs", aFiltered);

            MessageToast.show("Showing " + sStatus + " Jobs");

        },
        onDepartmentChartSelect: function (oEvent) {

            var sDepartment = oEvent.getParameter("data")[0].data.Department;

            var oDashboard = this.getView().getModel("dashboard");

            var aJobs = this._aAllJobs;

            var aFiltered = aJobs.filter(function (oJob) {

                return oJob.Department === sDepartment;

            });

            oDashboard.setProperty("/RecentJobs", aFiltered);

            MessageToast.show("Department : " + sDepartment);

        },
        onShowAllJobs: function () {

            var oDashboard = this.getView().getModel("dashboard");
            oDashboard.setProperty(
                "/RecentJobs",
                this._aAllJobs
            );

            MessageToast.show("Showing All Jobs");

        },
        onDashboardSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue").toLowerCase();

            var aJobs = this._aAllJobs;

            var aFiltered = aJobs.filter(function (oJob) {

                return oJob.JobTitle.toLowerCase().includes(sValue);

            });

            this._processJobs(aFiltered);

        },
        onDashboardFilter: function () {

            var sDept = this.byId("dashboardDeptFilter").getSelectedKey();

            var sStatus = this.byId("dashboardStatusFilter").getSelectedKey();

            var aJobs = this._aAllJobs;

            var aFiltered = aJobs.filter(function (oJob) {

                var bDept = !sDept || oJob.Department === sDept;

                var bStatus = !sStatus || oJob.Status === sStatus;

                return bDept && bStatus;

            });

            this._processJobs(aFiltered);

        },
        onExportJobs: function () {

            var aJobs = this.getView()
                .getModel("dashboard")
                .getProperty("/RecentJobs");

            if (!aJobs || aJobs.length === 0) {

                sap.m.MessageToast.show("No job records available.");
                return;

            }

            var sCSV = "";

            // Header
            sCSV += "Job ID,Job Title,Department,Location,Experience,Vacancies,Job Type,Status,Created On\n";

            // Data
            aJobs.forEach(function (oJob) {

                sCSV += [
                    oJob.JobId,
                    oJob.JobTitle,
                    oJob.Department,
                    oJob.Location,
                    oJob.Experience,
                    oJob.Vacancies,
                    oJob.JobType,
                    oJob.Status,
                    new Date(oJob.CreatedOn).toLocaleDateString("en-GB").replace(/\//g, "-")
                ].join(",");

                sCSV += "\n";

            });

            // Create file
            var oBlob = new Blob(
                [sCSV],
                { type: "text/csv;charset=utf-8;" }
            );

            var sFileName = "Recruitment_Jobs.csv";

            if (window.navigator.msSaveBlob) {

                window.navigator.msSaveBlob(oBlob, sFileName);

            } else {

                var oLink = document.createElement("a");

                var sUrl = URL.createObjectURL(oBlob);

                oLink.href = sUrl;
                oLink.download = sFileName;

                document.body.appendChild(oLink);

                oLink.click();

                document.body.removeChild(oLink);

                URL.revokeObjectURL(sUrl);

            }

            sap.m.MessageToast.show("CSV exported successfully.");

        },

        onClearDashboardFilter: function () {

            this.byId("dashboardSearch").setValue("");

            this.byId("dashboardDeptFilter").setSelectedKey("");

            this.byId("dashboardStatusFilter").setSelectedKey("");

            this._processJobs(this._aAllJobs);

        },
        onOpenSortDialog: function () {

            var that = this;

            if (!this._oSortDialog) {

                sap.ui.core.Fragment.load({

                    name: "employee.view.fragments.JobSortDialog",
                    controller: this

                }).then(function (oDialog) {

                    that._oSortDialog = oDialog;

                    that.getView().addDependent(oDialog);

                    oDialog.open();

                });

            } else {

                this._oSortDialog.open();

            }

        },
        onSortConfirm: function (oEvent) {

            var sSort = oEvent.getParameter("selectedItem").getTitle();

            var oDashboard = this.getView().getModel("dashboard");

            var aJobs = oDashboard.getProperty("/RecentJobs");

            switch (sSort) {

                case "Job Title":

                    aJobs.sort(function (a, b) {

                        return a.JobTitle.localeCompare(b.JobTitle);

                    });

                    break;

                case "Department":

                    aJobs.sort(function (a, b) {

                        return a.Department.localeCompare(b.Department);

                    });

                    break;

                case "Status":

                    aJobs.sort(function (a, b) {

                        return a.Status.localeCompare(b.Status);

                    });

                    break;

                case "Location":

                    aJobs.sort(function (a, b) {

                        return a.Location.localeCompare(b.Location);

                    });

                    break;

                case "Created Date":

                    aJobs.sort(function (a, b) {

                        return new Date(b.CreatedOn) - new Date(a.CreatedOn);

                    });

                    break;

            }

            oDashboard.setProperty("/RecentJobs", aJobs);

            MessageToast.show("Sorted by " + sSort);

        },
        onRefresh: function () {

            var oDashboard = this.getView().getModel("dashboard");

            // Reset the table before loading fresh data
            oDashboard.setProperty("/RecentJobs", []);

            // Load latest jobs from backend
            this._loadDashboard();

            // Clear Pie Chart selection
            var oStatusChart = this.byId("jobStatusChart");

            if (oStatusChart) {

                oStatusChart.vizSelection([], {
                    clearSelection: true
                });

            }

            // Clear Department Chart selection
            var oDeptChart = this.byId("departmentChart");

            if (oDeptChart) {

                oDeptChart.vizSelection([], {
                    clearSelection: true
                });

            }

            MessageToast.show("Dashboard refreshed successfully");

        },
        onCreateJob: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("CreateJob");

        },

        onManageJobs: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobOpenings");

        },

        onManageCandidates: function () {


            this.getOwnerComponent()
                .getRouter()
                .navTo("CandidateList");



        },

        onInterviewSchedule: function () {

            this.getOwnerComponent().getRouter().navTo("InterviewSchedule")

        },

        onOpenJobs: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobOpenings");

        },

        onClosedJobs: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobOpenings");

        },

        onCandidates: function () {

            MessageToast.show(
                "Candidate Module"
            );

        },

        onInterviews: function () {

            MessageToast.show(
                "Interview Schedule"
            );

        },

        onViewJob: function (oEvent) {

            var sJobId = oEvent.getSource()
                .getBindingContext("dashboard")
                .getProperty("JobId");

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobDetails", {

                    JobId: sJobId

                });

        },

        onNavBack: function () {

            history.go(-1);

        }

    });

});