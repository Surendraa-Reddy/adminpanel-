sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "employee/model/formatter",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    formatter,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.recruitment.InterviewFeedback", {

        formatter: formatter,

        onInit: function () {

            this._loadFeedback();

        },

        _loadFeedback: function () {

            var oModel = this.getOwnerComponent().getModel();

            var that = this;

            oModel.read("/InterviewFeedbackSet", {

                success: function (oData) {

                    var oJson = new JSONModel({
                        Feedbacks: oData.results
                    });

                    that.getView().setModel(oJson, "feedback");

                    that._loadKPIs(oData.results);

                }

            });

        },

        _loadKPIs: function (aData) {

            var total = aData.length;

            var selected = 0;

            var rejected = 0;

            var rating = 0;

            aData.forEach(function (o) {

                if (o.Recommendation === "SELECTED") {

                    selected++;

                }

                if (o.Recommendation === "REJECTED") {

                    rejected++;

                }

                rating += Number(o.OverallRating);

            });

            var avg = total ? (rating / total).toFixed(1) : 0;

            this.getView().setModel(new JSONModel({

                Total: total,

                Selected: selected,

                Rejected: rejected,

                Average: avg

            }), "kpi");

        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue");

            var aFilters = [

                new Filter("FeedbackId", FilterOperator.Contains, sValue),

                new Filter("InterviewId", FilterOperator.Contains, sValue),

                new Filter("CandidateId", FilterOperator.Contains, sValue)

            ];

            this.byId("feedbackTable").getBinding("items")
                .filter(new Filter(aFilters, false));

        },

        onRecommendationFilter: function (oEvent) {

            var sKey = oEvent.getSource().getSelectedKey();

            var oBinding = this.byId("feedbackTable").getBinding("items");

            if (!sKey) {

                oBinding.filter([]);

                return;

            }

            oBinding.filter([
                new Filter("Recommendation", FilterOperator.EQ, sKey)
            ]);

        },

        onRatingFilter: function (oEvent) {

            var sKey = oEvent.getSource().getSelectedKey();

            var oBinding = this.byId("feedbackTable").getBinding("items");

            if (!sKey) {

                oBinding.filter([]);

                return;

            }

            oBinding.filter([
                new Filter("OverallRating", FilterOperator.EQ, Number(sKey))
            ]);

        },

        onRefresh: function () {

            this._loadFeedback();

            MessageToast.show("Feedback list refreshed.");

        },

        onCreateFeedback: function () {

            var oSession = this.getOwnerComponent()
                .getModel("session")
                .getData();

            var oData = {

                FeedbackId: "",
                InterviewId: "",
                CandidateId: "",
                CandidateName: "",

                TechnicalRating: 0,
                CommunicationRating: 0,
                ProblemSolvingRating: 0,
                OverallRating: 0,

                Strengths: "",
                Weaknesses: "",
                Comments: "",

                Recommendation: "HOLD",

                EmpId: oSession.empId

            };

            var oModel = new sap.ui.model.json.JSONModel(oData);

            var that = this;

            if (!this._oCreateDialog) {

                sap.ui.core.Fragment.load({

                    id: this.getView().getId(),
                    name: "employee.view.fragments.CreateInterviewFeedback",
                    controller: this

                }).then(function (oDialog) {

                    that._oCreateDialog = oDialog;

                    that.getView().addDependent(oDialog);

                    oDialog.setModel(oModel, "create");

                    oDialog.open();

                });

            } else {

                this._oCreateDialog.setModel(oModel, "create");

                this._oCreateDialog.open();

            }

        },
        onInterviewValueHelp: function () {

            var that = this;

            if (!this._oInterviewVH) {

                sap.ui.core.Fragment.load({

                    id: this.getView().getId(),

                    name: "employee.view.fragments.InterviewValueHelp",

                    controller: this

                }).then(function (oDialog) {

                    that._oInterviewVH = oDialog;

                    that.getView().addDependent(oDialog);

                    oDialog.setModel(that.getOwnerComponent().getModel());

                    oDialog.open();

                });

            } else {

                this._oInterviewVH.open();

            }

        },
        onInterviewSearch: function (oEvent) {

            var sValue = oEvent.getParameter("value");

            var oFilter = new sap.ui.model.Filter({

                filters: [

                    new sap.ui.model.Filter(
                        "InterviewId",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ),

                    new sap.ui.model.Filter(
                        "CandidateName",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ),

                    new sap.ui.model.Filter(
                        "JobTitle",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    )

                ],

                and: false

            });

            oEvent.getSource()
                .getBinding("items")
                .filter([oFilter]);

        },
        onInterviewSelect: function (oEvent) {

            var oItem = oEvent.getParameter("selectedItem");

            if (!oItem) {
                return;
            }

            var oInterview = oItem.getBindingContext().getObject();

            var oModel = this._oCreateDialog.getModel("create");

            oModel.setProperty("/InterviewId", oInterview.InterviewId);

            oModel.setProperty("/CandidateId", oInterview.CandidateId);

            oModel.setProperty("/CandidateName", oInterview.CandidateName);

        },
        onInterviewValueHelpClose: function () {

            if (this._oInterviewVH) {

                this._oInterviewVH.close();

            }

        },
        onSaveFeedback: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oData = Object.assign(
                {},
                this._oCreateDialog.getModel("create").getData()
            );

            delete oData.__metadata;

            // Validate Feedback ID
            if (!oData.FeedbackId || oData.FeedbackId.trim() === "") {

                sap.m.MessageBox.warning("Please enter Feedback ID.");

                return;

            }

            var that = this;

            this.getView().setBusy(true);

            oModel.create("/InterviewFeedbackSet", oData, {

                success: function () {

                    that.getView().setBusy(false);

                    sap.m.MessageToast.show(
                        "Interview Feedback created successfully."
                    );

                    that._oCreateDialog.close();

                    that._loadFeedback();

                },

                error: function (oError) {

                    that.getView().setBusy(false);

                    console.log(oError);

                    sap.m.MessageBox.error(
                        "Unable to save Interview Feedback."
                    );

                }

            });

        },
        onCloseCreateFeedback: function () {

            if (this._oCreateDialog) {

                this._oCreateDialog.close();

            }

        },

        onViewFeedback: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext("feedback");

            var oData = JSON.parse(JSON.stringify(oContext.getObject()));
            if (oData.CreatedOn) {
                oData.CreatedOn = new Date(oData.CreatedOn);
            }


            var oModel = new sap.ui.model.json.JSONModel(oData);
            console.log(oData.CreatedOn);
            console.log(typeof oData.CreatedOn);

            var that = this;

            if (!this._oFeedbackDetailsDialog) {

                sap.ui.core.Fragment.load({

                    id: this.getView().getId(),
                    name: "employee.view.fragments.FeedbackDetails",
                    controller: this

                }).then(function (oDialog) {

                    that._oFeedbackDetailsDialog = oDialog;

                    that.getView().addDependent(oDialog);

                    oDialog.setModel(oModel, "details");

                    oDialog.open();

                });

            } else {

                this._oFeedbackDetailsDialog.setModel(oModel, "details");

                this._oFeedbackDetailsDialog.open();

            }

        },
        onCloseFeedbackDetails: function () {

            this._oFeedbackDetailsDialog.close();

        },
        onEditFeedback: function (oEvent) {

            var oData = JSON.parse(
                JSON.stringify(
                    oEvent.getSource()
                        .getBindingContext("feedback")
                        .getObject()
                )
            );

            var oModel = new sap.ui.model.json.JSONModel(oData);

            var that = this;

            if (!this._oEditDialog) {

                sap.ui.core.Fragment.load({

                    id: this.getView().getId(),
                    name: "employee.view.fragments.EditInterviewFeedback",
                    controller: this

                }).then(function (oDialog) {

                    that._oEditDialog = oDialog;

                    that.getView().addDependent(oDialog);

                    oDialog.setModel(oModel, "edit");

                    oDialog.open();

                });

            } else {

                this._oEditDialog.setModel(oModel, "edit");

                this._oEditDialog.open();

            }

        },
        onUpdateFeedback: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oData = Object.assign(
                {},
                this._oEditDialog.getModel("edit").getData()
            );

            delete oData.__metadata;
            delete oData.Mandt;
            delete oData.CreatedOn;

            var sPath =
                "/InterviewFeedbackSet('" +
                oData.FeedbackId +
                "')";

            var that = this;

            this.getView().setBusy(true);

            oModel.update(sPath, oData, {

                success: function () {

                    that.getView().setBusy(false);

                    sap.m.MessageToast.show(
                        "Interview Feedback updated successfully."
                    );

                    that._oEditDialog.close();

                    that._loadFeedback();

                },

                error: function (oError) {

                    that.getView().setBusy(false);

                    console.log(oError);

                    sap.m.MessageBox.error(
                        "Unable to update Interview Feedback."
                    );

                }

            });

        },
        onCloseEditFeedback: function () {

            this._oEditDialog.close();

        },

        onDeleteFeedback: function (oEvent) {

            var oButton = oEvent.getSource();

            var oContext =
                oButton.getBindingContext("feedback");

            if (!oContext) {

                MessageBox.error(
                    "Interview Feedback record not found."
                );

                return;
            }

            var oFeedback =
                oContext.getObject();

            var sFeedbackId =
                oFeedback.FeedbackId;

            if (!sFeedbackId) {

                MessageBox.error(
                    "Feedback ID is missing."
                );

                return;
            }

            var that = this;

            MessageBox.confirm(

                "Are you sure you want to delete Feedback " +
                sFeedbackId + "?",

                {
                    title: "Delete Interview Feedback",

                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],

                    emphasizedAction:
                        MessageBox.Action.OK,

                    onClose: function (sAction) {

                        if (
                            sAction !==
                            MessageBox.Action.OK
                        ) {
                            return;
                        }

                        var oModel =
                            that.getOwnerComponent()
                                .getModel();

                        /*
                         * Build OData key path
                         */
                        var sPath =
                            oModel.createKey(
                                "/InterviewFeedbackSet",
                                {
                                    FeedbackId:
                                        sFeedbackId
                                }
                            );

                        console.log(
                            "Deleting:",
                            sPath
                        );

                        that.getView()
                            .setBusy(true);

                        /*
                         * DELETE
                         */
                        oModel.remove(
                            sPath,
                            {

                                success: function () {

                                    that.getView()
                                        .setBusy(false);

                                    MessageToast.show(
                                        "Interview Feedback deleted successfully."
                                    );

                                    /*
                                     * Reload feedback table
                                     */
                                    that._loadFeedback();

                                },

                                error: function (oError) {

                                    that.getView()
                                        .setBusy(false);

                                    console.error(
                                        "Delete Feedback Error:",
                                        oError
                                    );

                                    MessageBox.error(
                                        "Unable to delete Interview Feedback."
                                    );

                                }

                            }
                        );

                    }

                }
            );

        },

        onNavBack: function () {

            history.go(-1);

        }

    });

});