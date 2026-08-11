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
            onViewInterview: function (oEvent) {

                var oContext = oEvent.getSource().getBindingContext("interview");
                var oData = Object.assign({}, oContext.getObject());

                // Convert Edm.Time to HH:mm
                if (oData.InterviewTime && oData.InterviewTime.ms !== undefined) {

                    var iTotalSeconds = oData.InterviewTime.ms / 1000;

                    var iHours = Math.floor(iTotalSeconds / 3600);
                    var iMinutes = Math.floor((iTotalSeconds % 3600) / 60);

                    oData.InterviewTime =
                        String(iHours).padStart(2, "0") + ":" +
                        String(iMinutes).padStart(2, "0");
                }

                var oModel = new sap.ui.model.json.JSONModel(oData);

                var that = this;

                if (!this._oInterviewDetailsDialog) {

                    Fragment.load({
                        id: this.getView().getId(),
                        name: "employee.view.fragments.InterviewDetails",
                        controller: this
                    }).then(function (oDialog) {

                        that._oInterviewDetailsDialog = oDialog;

                        that.getView().addDependent(oDialog);

                        oDialog.setModel(oModel, "details");

                        oDialog.open();

                    });

                } else {

                    this._oInterviewDetailsDialog.setModel(oModel, "details");

                    this._oInterviewDetailsDialog.open();

                }

            },
            onCloseInterviewDetails: function () {

                if (this._oInterviewDetailsDialog) {

                    this._oInterviewDetailsDialog.close();

                }

            },

            onEditInterview: function (oEvent) {

                var oContext = oEvent.getSource().getBindingContext("interview");

                var oData = JSON.parse(JSON.stringify(oContext.getObject()));

                // Convert Interview Date string to JavaScript Date
                if (oData.InterviewDate) {

                    oData.InterviewDate = new Date(oData.InterviewDate);

                }

                // Convert Edm.Time to HHmmss
                if (oData.InterviewTime && oData.InterviewTime.ms !== undefined) {

                    var d = new Date(oData.InterviewTime.ms);

                    var h = String(d.getUTCHours()).padStart(2, "0");
                    var m = String(d.getUTCMinutes()).padStart(2, "0");
                    var s = String(d.getUTCSeconds()).padStart(2, "0");

                    oData.InterviewTime = h + m + s;
                }

                var oModel = new sap.ui.model.json.JSONModel(oData);

                var that = this;

                if (!this._oEditDialog) {

                    sap.ui.core.Fragment.load({

                        id: this.getView().getId(),
                        name: "employee.view.fragments.EditInterview",
                        controller: this

                    }).then(function (oDialog) {

                        that._oEditDialog = oDialog;

                        that.getView().addDependent(oDialog);

                        that._oEditDialog.setModel(oModel, "edit");

                        that._oEditDialog.open();

                    });

                } else {

                    this._oEditDialog.setModel(oModel, "edit");

                    this._oEditDialog.open();

                }

            },
            onUpdateInterview: function () {

                var oModel = this.getOwnerComponent().getModel();

                // Clone model data
                var oData = Object.assign({}, this._oEditDialog.getModel("edit").getData());

                // Remove unwanted properties
                delete oData.__metadata;
                delete oData.Mandt;
                delete oData.CreatedOn;

                /*---------------------------------------------------------
                  Interview Date (Edm.DateTime)
                ----------------------------------------------------------*/
                if (oData.InterviewDate instanceof Date) {

                    oData.InterviewDate = new Date(
                        oData.InterviewDate.getFullYear(),
                        oData.InterviewDate.getMonth(),
                        oData.InterviewDate.getDate(),
                        12, 0, 0
                    );

                }


                if (typeof oData.InterviewTime === "string") {

                    var h = 0,
                        m = 0,
                        s = 0;

                    // HHmmss
                    if (/^\d{6}$/.test(oData.InterviewTime)) {

                        h = parseInt(oData.InterviewTime.substring(0, 2), 10);
                        m = parseInt(oData.InterviewTime.substring(2, 4), 10);
                        s = parseInt(oData.InterviewTime.substring(4, 6), 10);

                    }
                    // HH:mm:ss
                    else if (/^\d{2}:\d{2}:\d{2}$/.test(oData.InterviewTime)) {

                        var a = oData.InterviewTime.split(":");

                        h = parseInt(a[0], 10);
                        m = parseInt(a[1], 10);
                        s = parseInt(a[2], 10);

                    }
                    // HH:mm
                    else if (/^\d{2}:\d{2}$/.test(oData.InterviewTime)) {

                        var b = oData.InterviewTime.split(":");

                        h = parseInt(b[0], 10);
                        m = parseInt(b[1], 10);
                        s = 0;

                    }
                    // OData Duration (P00DT10H30M00S)
                    else if (oData.InterviewTime.indexOf("P") === 0) {

                        var match = oData.InterviewTime.match(/(\d+)H(\d+)M(\d+)S/);

                        if (match) {

                            h = parseInt(match[1], 10);
                            m = parseInt(match[2], 10);
                            s = parseInt(match[3], 10);

                        }

                    }

                    oData.InterviewTime = {

                        __edmType: "Edm.Time",

                        ms: ((h * 3600) + (m * 60) + s) * 1000

                    };

                }

                console.log("Update Payload");
                console.log(oData);

                var sPath = "/InterviewSet('" + oData.InterviewId + "')";

                var that = this;

                this.getView().setBusy(true);

                oModel.update(sPath, oData, {

                    success: function () {

                        that.getView().setBusy(false);

                        sap.m.MessageToast.show("Interview updated successfully.");

                        that._oEditDialog.close();

                        that._loadInterviews();

                    },

                    error: function (oError) {

                        that.getView().setBusy(false);

                        console.log(oError);

                        sap.m.MessageBox.error("Interview update failed.");

                    }

                });

            },
            onCloseEditInterview: function () {

                if (this._oEditDialog) {

                    this._oEditDialog.close();

                }

            },
            onDeleteInterview: function (oEvent) {

                var oContext = oEvent.getSource().getBindingContext("interview");
                var oData = oContext.getObject();

                var sPath = "/InterviewSet('" + oData.InterviewId + "')";

                var oModel = this.getOwnerComponent().getModel();

                var that = this;

                sap.m.MessageBox.confirm(

                    "Are you sure you want to delete Interview '" +
                    oData.InterviewId +
                    "'?",

                    {

                        title: "Delete Interview",

                        actions: [
                            sap.m.MessageBox.Action.DELETE,
                            sap.m.MessageBox.Action.CANCEL
                        ],

                        emphasizedAction: sap.m.MessageBox.Action.DELETE,

                        onClose: function (sAction) {

                            if (sAction === sap.m.MessageBox.Action.DELETE) {

                                that.getView().setBusy(true);

                                oModel.remove(sPath, {

                                    success: function () {

                                        that.getView().setBusy(false);

                                        sap.m.MessageToast.show(
                                            "Interview deleted successfully."
                                        );

                                        that._loadInterviews();

                                    },

                                    error: function (oError) {

                                        that.getView().setBusy(false);

                                        console.log(oError);

                                        sap.m.MessageBox.error(
                                            "Unable to delete interview."
                                        );

                                    }

                                });

                            }

                        }

                    }

                );

            },

            onNavBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("CandidateDashboard");

            }

        });

});