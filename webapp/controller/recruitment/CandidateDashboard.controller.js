sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";


    return Controller.extend(
        "employee.controller.recruitment.CandidateDashboard",
        {


            onInit: function () {


                var oDashboardModel = new JSONModel({

                    KPI: {

                        Total: 0,
                        Applied: 0,
                        Shortlisted: 0,
                        Interview: 0,
                        Selected: 0,
                        Rejected: 0,
                        Joined: 0

                    },


                    RecentCandidates: [],


                    RecentActivities: []

                });



                this.getView().setModel(
                    oDashboardModel,
                    "dashboard"
                );




                var oChartModel = new JSONModel({

                    StatusData: [],

                    QualificationData: []

                });



                this.getView().setModel(
                    oChartModel,
                    "chart"
                );



                this._loadDashboard();


            },


            _loadDashboard: function () {


                var that = this;


                this.getView().setBusy(true);



                this.getOwnerComponent()
                    .getModel()
                    .read(
                        "/CandidateSet",
                        {


                            success: function (oData) {


                                that.getView()
                                    .setBusy(false);



                                that._prepareDashboard(
                                    oData.results
                                );


                            },



                            error: function () {


                                that.getView()
                                    .setBusy(false);



                                MessageBox.error(
                                    "Unable to load Candidate Dashboard"
                                );


                            }


                        }
                    );

            },
            _prepareDashboard: function (aCandidates) {


                var oDashboardModel =
                    this.getView()
                        .getModel("dashboard");



                var oChartModel =
                    this.getView()
                        .getModel("chart");



                var iApplied = 0;
                var iShortlisted = 0;
                var iInterview = 0;
                var iSelected = 0;
                var iRejected = 0;
                var iJoined = 0;



                var mStatus = {};

                var mQualification = {};





                aCandidates.forEach(function (oCandidate) {



                    var sStatus =
                        oCandidate.Status ||
                        "UNKNOWN";




                    switch (sStatus) {


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

                            iSelected++;

                            break;



                        case "REJECTED":

                            iRejected++;

                            break;



                        case "JOINED":

                            iJoined++;

                            break;


                    }
                    if (!mStatus[sStatus]) {

                        mStatus[sStatus] = 0;

                    }

                    mStatus[sStatus]++;
                    var sQualification =
                        oCandidate.Qualification ||
                        "Others";

                    if (!mQualification[sQualification]) {
                        mQualification[sQualification] = 0;
                    }
                    mQualification[sQualification]++;

                });

                oDashboardModel.setProperty(
                    "/KPI",
                    {
                        Total: aCandidates.length,

                        Applied: iApplied,

                        Shortlisted: iShortlisted,

                        Interview: iInterview,

                        Selected: iSelected,

                        Rejected: iRejected,

                        Joined: iJoined


                    }
                );

                var aRecent =
                    aCandidates
                        .slice()
                        .sort(function (a, b) {


                            return new Date(b.AppliedOn)
                                -
                                new Date(a.AppliedOn);


                        });

                oDashboardModel.setProperty(
                    "/RecentCandidates",
                    aRecent.slice(0, 10)
                );

                var aActivities = [];

                aCandidates
                    .slice(0, 10)
                    .forEach(function (oCandidate) {

                        aActivities.push({
                            Title:
                                "New Candidate Applied",
                            Description:
                                oCandidate.CandidateName +
                                " applied for " +
                                oCandidate.JobTitle,



                            Date:
                                oCandidate.AppliedOn,



                            Type:
                                "APPLICATION"


                        });



                    });

                oDashboardModel.setProperty(

                    "/RecentActivities",

                    aActivities

                );

                var aStatus = [];

                Object.keys(mStatus)
                    .forEach(function (sKey) {

                        aStatus.push({

                            Status: sKey,

                            Count: mStatus[sKey]

                        });



                    });

                var aQualification = [];

                Object.keys(mQualification)
                    .forEach(function (sKey) {
                        aQualification.push({

                            Qualification: sKey,

                            Count: mQualification[sKey]

                        });



                    });
                oChartModel.setProperty(
                    "/StatusData",
                    aStatus
                );
                oChartModel.setProperty(
                    "/QualificationData",
                    aQualification
                );
                console.log(
                    "Status Chart",
                    aStatus
                );
                console.log(
                    "Qualification Chart",
                    aQualification
                );
                console.log(
                    "Activities",
                    aActivities
                );


            },


            onRefresh: function () {

                this._loadDashboard();
                MessageToast.show(
                    "Dashboard refreshed"
                );


            },

            onManageCandidates: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "CandidateList"
                    );


            },
            onInterviewSchedule: function () {

                this.getOwnerComponent().getRouter().navTo("InterviewSchedule")

            },
            onExport: function () {
                var oData =
                    this.getView()
                        .getModel("dashboard")
                        .getData();
                var sCSV =
                    "Metric,Value\n";
                sCSV +=
                    "Total Candidates," +
                    oData.KPI.Total +
                    "\n";
                sCSV +=
                    "Applied," +
                    oData.KPI.Applied +
                    "\n";
                sCSV +=
                    "Shortlisted," +
                    oData.KPI.Shortlisted +
                    "\n";
                sCSV +=
                    "Interview," +
                    oData.KPI.Interview +
                    "\n";
                sCSV +=
                    "Selected," +
                    oData.KPI.Selected +
                    "\n";
                sCSV +=
                    "Rejected," +
                    oData.KPI.Rejected +
                    "\n";
                sCSV +=
                    "Joined," +
                    oData.KPI.Joined +
                    "\n";
                var blob =
                    new Blob(
                        [sCSV],
                        {
                            type:
                                "text/csv;charset=utf-8;"
                        }
                    );
                var url =
                    URL.createObjectURL(blob);
                var link =
                    document.createElement("a");
                link.href = url;
                link.download =
                    "CandidateDashboard.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                MessageToast.show(
                    "Export completed"
                );



            },

            onNavBack: function () {


                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "RecruitmentDashboard"
                    );


            }



        });


});