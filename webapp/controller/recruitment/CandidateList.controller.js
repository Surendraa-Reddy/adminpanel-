sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "employee/model/formatter"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    formatter
) {
    "use strict";


    return Controller.extend("employee.controller.recruitment.CandidateList", {
        formatter: formatter,

        onInit: function () {

            var oCandidateModel = new JSONModel({

                Candidates: []

            });

            this.getView().setModel(
                oCandidateModel,
                "candidate"
            );

            this._aCandidates = [];

            this._loadCandidates();

        },



        _loadCandidates: function () {

            var that = this;

            this.getView().setBusy(true);

            this.getOwnerComponent().getModel().read("/CandidateSet", {

                success: function (oData) {

                    that.getView().setBusy(false);

                    that._aCandidates = oData.results;

                    that.getView()
                        .getModel("candidate")
                        .setProperty("/Candidates", oData.results);

                },

                error: function () {

                    that.getView().setBusy(false);

                    MessageBox.error("Unable to load Candidate data.");

                }

            });

        },


        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue").toLowerCase();

            var aFiltered = this._aCandidates.filter(function (oCandidate) {

                return (
                    (oCandidate.CandidateName || "").toLowerCase().includes(sValue) ||

                    (oCandidate.JobTitle || "").toLowerCase().includes(sValue) ||

                    (oCandidate.Email || "").toLowerCase().includes(sValue)

                );

            });

            this.getView()
                .getModel("candidate")
                .setProperty("/Candidates", aFiltered);

        },


        onFilter: function () {

            var sStatus = this.byId("statusFilter")
                .getSelectedKey()
                .trim()
                .toUpperCase();

            var sQualification = this.byId("qualificationFilter")
                .getSelectedKey()
                .trim()
                .toUpperCase();

            var aFiltered = this._aCandidates.filter(function (oCandidate) {

                // Status Filter
                var bStatus = !sStatus ||
                    (oCandidate.Status || "")
                        .trim()
                        .toUpperCase()
                        .includes(sStatus);

                // Qualification Filter
                var bQualification = !sQualification ||
                    (oCandidate.Qualification || "")
                        .trim()
                        .toUpperCase()
                        .includes(sQualification);

                return bStatus && bQualification;

            });

            this.getView()
                .getModel("candidate")
                .setProperty("/Candidates", aFiltered);

        },



        onClear: function () {

            this.byId("searchCandidate").setValue("");

            this.byId("statusFilter").setSelectedKey("");

            this.byId("qualificationFilter").setSelectedKey("");

            this.getView()
                .getModel("candidate")
                .setProperty("/Candidates", this._aCandidates);

            MessageToast.show("Filters Cleared");

        },



        onRefresh: function () {

            this.byId("searchCandidate").setValue("");

            this.byId("statusFilter").setSelectedKey("");

            this.byId("qualificationFilter").setSelectedKey("");

            this._loadCandidates();

            MessageToast.show("Candidate list refreshed.");

        },
        onViewCandidate: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext("candidate");

          //  console.log(oContext.getObject());

            if (!this._oCandidateDialog) {

                this._oCandidateDialog = sap.ui.xmlfragment(
                    "employee.view.fragments.CandidateDetails",
                    this
                );

                this.getView().addDependent(this._oCandidateDialog);

                // Set named model to fragment
                this._oCandidateDialog.setModel(
                    this.getView().getModel("candidate"),
                    "candidate"
                );
            }

            // Bind selected candidate
            this._oCandidateDialog.setBindingContext(
                oContext,
                "candidate"
            );

            this._oCandidateDialog.open();

        },
        onCloseCandidateDetails: function () {

            this._oCandidateDialog.close();

        },



        onExport: function () {

            var aData = this.getView()
                .getModel("candidate")
                .getProperty("/Candidates");

            if (!aData || aData.length === 0) {

                MessageToast.show("No candidate data available.");
                return;

            }

            function formatDate(vDate) {

                if (!vDate) {
                    return "";
                }

                var oDate = new Date(vDate);

                if (isNaN(oDate.getTime())) {
                    return "";
                }

                var dd = String(oDate.getDate()).padStart(2, "0");
                var mm = String(oDate.getMonth() + 1).padStart(2, "0");
                var yyyy = oDate.getFullYear();

                return dd + "-" + mm + "-" + yyyy;

            }

            var sCSV = "";

            // Header
            sCSV += [
                "Candidate ID",
                "Candidate Name",
                "Job ID",
                "Job Title",
                "Gender",
                "Date of Birth",
                "Email",
                "Mobile",
                "Address",
                "City",
                "State",
                "Pincode",
                "Nationality",
                "Qualification",
                "Specialization",
                "Experience",
                "Skills",
                "Status",
                "Applied On",
                "Remarks"

            ].join(",");

            sCSV += "\n";

            // Data
            aData.forEach(function (oRow) {

                sCSV += [

                    '"' + (oRow.CandidateId || "") + '"',
                    '"' + (oRow.CandidateName || "") + '"',
                    '"' + (oRow.JobId || "") + '"',
                    '"' + (oRow.JobTitle || "") + '"',
                    '"' + (oRow.Gender || "") + '"',
                    '"' + formatDate(oRow.DateOfBirth) + '"',
                    '"' + (oRow.Email || "") + '"',
                    '"' + (oRow.Mobile || "") + '"',
                    '"' + (oRow.Address || "") + '"',
                    '"' + (oRow.City || "") + '"',
                    '"' + (oRow.State || "") + '"',
                    '"' + (oRow.Pincode || "") + '"',
                    '"' + (oRow.Nationality || "") + '"',
                    '"' + (oRow.Qualification || "") + '"',
                    '"' + (oRow.Specialization || "") + '"',
                    '"' + (oRow.Experience || "") + '"',
                    '"' + (oRow.Skills || "") + '"',
                    '"' + (oRow.Status || "") + '"',
                    '"' + formatDate(oRow.AppliedOn) + '"',
                    '"' + (oRow.Remarks || "") + '"'


                ].join(",");

                sCSV += "\n";

            });

            var oBlob = new Blob(
                [sCSV],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );

            var sFileName = "Candidate_Master.csv";

            if (window.navigator.msSaveBlob) {

                window.navigator.msSaveBlob(
                    oBlob,
                    sFileName
                );

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

            MessageToast.show("Candidate data exported successfully.");

        },


        onCreateCandidate: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("CreateCandidate");

        },

        onEdit: function (oEvent) {

            var sCandidateId = oEvent.getSource()
                .getBindingContext("candidate")
                .getProperty("CandidateId");

            this.getOwnerComponent()
                .getRouter()
                .navTo("EditCandidate", {
                    CandidateId: sCandidateId
                });

        },

  

        onDetails: function (oEvent) {

            var sCandidateId = oEvent.getSource()
                .getBindingContext("candidate")
                .getProperty("CandidateId");

            this.getOwnerComponent()
                .getRouter()
                .navTo("CandidateDetails", {

                    CandidateId: sCandidateId

                });

        },

  

        onDelete: function (oEvent) {

            var that = this;

            var sCandidateId = oEvent.getSource()
                .getBindingContext("candidate")
                .getProperty("CandidateId");

            MessageBox.confirm(

                "Are you sure you want to delete this candidate?", {

                title: "Delete Candidate",

                actions: [
                    MessageBox.Action.OK,
                    MessageBox.Action.CANCEL
                ],

                onClose: function (sAction) {

                    if (sAction === "OK") {

                        that.getOwnerComponent()
                            .getModel()
                            .remove("/CandidateSet('" + sCandidateId + "')", {

                                success: function () {

                                    MessageToast.show("Candidate Deleted Successfully.");

                                    that._loadCandidates();

                                },

                                error: function () {

                                    MessageBox.error("Unable to delete candidate.");

                                }

                            });

                    }

                }

            });

        },

        

        onNavBack: function () {

          this.getOwnerComponent().getRouter().navTo("RecruitmentDashboard");

        }

    });

});