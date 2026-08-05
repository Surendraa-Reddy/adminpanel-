sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "employee/model/formatter",
    "sap/ui/core/Fragment"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    formatter,
    Fragment
) {
    "use strict";

    return Controller.extend(
        "employee.controller.recruitment.InterviewSchedule",
        {
            formatter: formatter,

            onInit: function () {

                var oModel = new JSONModel({

                    Interviews: []

                });

                this.getView().setModel(
                    oModel,
                    "interview"
                );

                this._loadInterviews();

            },

            _loadInterviews: function () {

                var that = this;

                this.getView().setBusy(true);

                this.getOwnerComponent()
                    .getModel()
                    .read("/InterviewSet", {

                        success: function (oData) {

                            that.getView().setBusy(false);

                            that.getView()
                                .getModel("interview")
                                .setProperty(
                                    "/Interviews",
                                    oData.results
                                );

                        },

                        error: function () {

                            that.getView().setBusy(false);

                            MessageBox.error(
                                "Unable to load interviews."
                            );

                        }

                    });

            },

            onRefresh: function () {

                // Clear Search Field
                this.byId("searchInterview").setValue("");

                // Reset Status Filter
                this.byId("statusFilter").setSelectedKey("");

                // Clear all table filters
                var oBinding = this.byId("interviewTable").getBinding("items");
                oBinding.filter([]);

                // Reload all interviews
                this._loadInterviews();

                MessageToast.show("Interview list refreshed.");

            },

            onSearch: function (oEvent) {

                var sValue = oEvent.getParameter("newValue");

                var oBinding = this.byId("interviewTable")
                    .getBinding("items");

                if (!sValue) {

                    oBinding.filter([]);

                    return;

                }

                oBinding.filter([

                    new Filter(
                        "CandidateName",
                        FilterOperator.Contains,
                        sValue
                    )

                ]);

            },

            onFilter: function () {

                var sStatus = this.byId("statusFilter")
                    .getSelectedKey();

                var oBinding = this.byId("interviewTable")
                    .getBinding("items");

                if (!sStatus) {

                    oBinding.filter([]);

                    return;

                }

                oBinding.filter([

                    new Filter(
                        "Status",
                        FilterOperator.EQ,
                        sStatus
                    )

                ]);

            },

            onCloseInterviewDialog: function () {

                if (this._oCreateInterviewDialog) {

                    this._oCreateInterviewDialog.close();

                }

            },
            _loadCandidates: function () {

                var that = this;

                this.getOwnerComponent()
                    .getModel()
                    .read("/CandidateSet", {

                        success: function (oData) {

                            var oModel = new sap.ui.model.json.JSONModel({

                                Candidates: oData.results

                            });

                            that.getView().setModel(
                                oModel,
                                "candidate"
                            );

                        }

                    });

            },
            _loadInterviewers: function () {

                var that = this;

                this.getOwnerComponent()
                    .getModel()
                    .read("/EmployeeeSet", {

                        success: function (oData) {

                            var oEmployeeModel = new JSONModel({
                                Employees: oData.results
                            });

                            that.getView().setModel(
                                oEmployeeModel,
                                "employee"
                            );

                        },

                        error: function () {

                            MessageBox.error(
                                "Unable to load interviewers."
                            );

                        }

                    });

            },
            onCandidateSelect: function (oEvent) {

                var sCandidateId = oEvent.getSource().getSelectedKey();

                var aCandidates = this.getView()
                    .getModel("candidate")
                    .getProperty("/Candidates");

                var oCandidate = aCandidates.find(function (oItem) {
                    return oItem.CandidateId === sCandidateId;
                });

                if (!oCandidate) {
                    return;
                }

                Fragment.byId(
                    this.getView().getId(),
                    "txtCandidateId"
                ).setValue(oCandidate.CandidateId);

                Fragment.byId(
                    this.getView().getId(),
                    "txtJobId"
                ).setValue(oCandidate.JobId);

                Fragment.byId(
                    this.getView().getId(),
                    "txtJobTitle"
                ).setValue(oCandidate.JobTitle);

            },

            onCreateInterview: function () {

                var that = this;

                if (!this._oCreateInterviewDialog) {

                    Fragment.load({
                        id: this.getView().getId(),
                        name: "employee.view.fragments.CreateInterview",
                        controller: this
                    }).then(function (oDialog) {

                        that._oCreateInterviewDialog = oDialog;

                        that.getView().addDependent(oDialog);

                        that._loadCandidates();

                        that._loadInterviewers();

                        oDialog.open();

                    });

                } else {

                    this._loadCandidates();

                    this._loadInterviewers();

                    this._oCreateInterviewDialog.open();

                }

            },
            onSaveInterview: function () {

                var oModel = this.getOwnerComponent().getModel();
                var sInterviewId = sap.ui.getCore()
                    .byId(this.getView().getId() + "--txtInterviewId")
                    .getValue()
                    .trim();

                var sCandidateId = sap.ui.getCore().byId(this.getView().getId() + "--cbCandidate").getSelectedKey();
                var sCandidateName = sap.ui.getCore().byId(this.getView().getId() + "--cbCandidate").getValue();

                var sJobId = sap.ui.getCore().byId(this.getView().getId() + "--txtJobId").getValue();
                var sJobTitle = sap.ui.getCore().byId(this.getView().getId() + "--txtJobTitle").getValue();

                var sInterviewer = sap.ui.getCore().byId(this.getView().getId() + "--cbInterviewer").getSelectedKey();

                var oDate = sap.ui.getCore()
                    .byId(this.getView().getId() + "--dpInterviewDate")
                    .getDateValue();

                var sTime = sap.ui.getCore()
                    .byId(this.getView().getId() + "--tpInterviewTime")
                    .getValue();   // "09:00"

                var sMode = sap.ui.getCore().byId(this.getView().getId() + "--slMode").getSelectedKey();
                var iHour = parseInt(sTime.substring(0, 2), 10);
                var iMinute = parseInt(sTime.substring(2, 4), 10);
                var iSecond = parseInt(sTime.substring(4, 6), 10);

                var oTime = {
                    __edmType: "Edm.Time",
                    ms: ((iHour * 3600) + (iMinute * 60) + iSecond) * 1000
                };
                if (!sInterviewId || !sCandidateId || !oDate || !sTime || !sInterviewer) {

                    sap.m.MessageBox.warning("Please fill all mandatory fields.");
                    return;

                }

                var oPayload = {
                    InterviewId: sInterviewId,

                    CandidateId: sCandidateId,

                    CandidateName: sCandidateName,

                    JobId: sJobId,

                    JobTitle: sJobTitle,

                    Interviewer: sInterviewer,

                    InterviewDate: oDate,

                    InterviewTime: oTime,

                    InterviewMode: sMode,

                    Status: "SCHEDULED",

                    Feedback: "",

                    Rating: 0

                };
                console.log(oPayload);

                var that = this;

                this.getView().setBusy(true);

                oModel.create("/InterviewSet", oPayload, {

                    success: function () {

                        that.getView().setBusy(false);

                        sap.m.MessageToast.show("Interview Scheduled Successfully.");

                        that.onCloseInterviewDialog();

                        that._loadInterviews();

                    },

                    error: function () {

                        that.getView().setBusy(false);

                        sap.m.MessageBox.error("Interview creation failed.");

                    }

                });

            },

            onEditInterview: function () {

                MessageToast.show("Edit Interview");

            },

            onDeleteInterview: function () {

                MessageBox.confirm(

                    "Delete this interview?",

                    {

                        onClose: function (sAction) {

                            if (sAction === "OK") {

                                MessageToast.show(
                                    "Interview deleted."
                                );

                            }

                        }

                    }

                );

            },

            onNavBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RecruitmentDashboard");

            }

        });

});