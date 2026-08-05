sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.recruitment.EditCandidate", {

        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("EditCandidate")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var sCandidateId = oEvent.getParameter("arguments").CandidateId;

            this._sCandidateId = sCandidateId;

            this._loadCandidate();

        },

        _loadCandidate: function () {

            var that = this;

            this.getView().setBusy(true);

            this.getOwnerComponent().getModel().read(

                "/CandidateSet('" + this._sCandidateId + "')",

                {

                    success: function (oData) {

                        that._oOriginal = JSON.parse(JSON.stringify(oData));

                        that._setData(oData);

                        that.getView().setBusy(false);

                    },

                    error: function () {

                        that.getView().setBusy(false);

                        MessageBox.error("Unable to load Candidate.");

                    }

                }

            );

        },

        _setData: function (oData) {
          
            this.byId("candidateId").setValue(oData.CandidateId);
            this.byId("candidateName").setValue(oData.CandidateName);
            this.byId("jobId").setValue(oData.JobId);
            this.byId("jobTitle").setValue(oData.JobTitle);
            this.byId("gender").setSelectedKey(oData.Gender);

            this.byId("dob").setDateValue(new Date(oData.DateOfBirth));

            this.byId("email").setValue(oData.Email);
            this.byId("mobile").setValue(oData.Mobile);
            this.byId("address").setValue(oData.Address);
            this.byId("city").setValue(oData.City);
            this.byId("state").setValue(oData.State);
            this.byId("pincode").setValue(oData.Pincode);
            this.byId("nationality").setValue(oData.Nationality);
            this.byId("qualification").setSelectedKey(oData.Qualification);
            this.byId("specialization").setValue(oData.Specialization);
            this.byId("experience").setValue(oData.Experience);
            this.byId("skills").setValue(oData.Skills);
            this.byId("status").setSelectedKey(oData.Status);

            this.byId("appliedOn").setDateValue(new Date(oData.AppliedOn));

            this.byId("remarks").setValue(oData.Remarks);

        },

        onUpdate: function () {

            var oModel = this.getOwnerComponent().getModel();

            var oPayload = {

                CandidateId: this._sCandidateId,

                JobId: this.byId("jobId").getValue(),
                JobTitle: this.byId("jobTitle").getValue(),

                CandidateName: this.byId("candidateName").getValue(),

                Gender: this.byId("gender").getSelectedKey(),

                DateOfBirth: this.byId("dob").getDateValue(),

                Email: this.byId("email").getValue(),

                Mobile: this.byId("mobile").getValue(),

                Address: this.byId("address").getValue(),

                City: this.byId("city").getValue(),

                State: this.byId("state").getValue(),

                Pincode: this.byId("pincode").getValue(),

                Nationality: this.byId("nationality").getValue(),

                Qualification: this.byId("qualification").getSelectedKey(),

                Specialization: this.byId("specialization").getValue(),

                Experience: this.byId("experience").getValue(),

                Skills: this.byId("skills").getValue(),

                Status: this.byId("status").getSelectedKey(),

                AppliedOn: this.byId("appliedOn").getDateValue(),

                Remarks: this.byId("remarks").getValue()

            };

            this.getView().setBusy(true);

            oModel.update(

                "/CandidateSet('" + this._sCandidateId + "')",

                oPayload,

                {

                    success: function () {

                        this.getView().setBusy(false);

                        MessageToast.show("Candidate updated successfully.");

                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("CandidateList");

                    }.bind(this),

                    error: function () {

                        this.getView().setBusy(false);

                        MessageBox.error("Update failed.");

                    }.bind(this)

                }

            );

        },

        onReset: function () {

            this._setData(this._oOriginal);

            MessageToast.show("Original data restored.");

        },

        onCancel: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("CandidateList");

        },

        onNavBack: function () {

            this.onCancel();

        }

    });

});