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

    return Controller.extend("employee.controller.recruitment.CreateCandidate", {

        onSave: function () {

            var oModel = this.getOwnerComponent().getModel();

            var bError = false;

            // Required Fields

            var oCandidateName = this.byId("candidateName");
            var oGender = this.byId("gender");
            var oQualification = this.byId("qualification");
            var oEmail = this.byId("email");
            var oMobile = this.byId("mobile");
            var oJob = this.byId("jobId");
            var oStatus = this.byId("status");

            // Reset Value States

            [
                oCandidateName,
                oGender,
                oQualification,
                oEmail,
                oMobile,
                oJob,
                oStatus
            ].forEach(function (oControl) {

                oControl.setValueState("None");

            });

            // Candidate Name

            if (!oCandidateName.getValue().trim()) {

                oCandidateName.setValueState("Error");
                oCandidateName.setValueStateText("Candidate Name is required");
                bError = true;

            }

            // Gender

            if (!oGender.getSelectedKey()) {

                oGender.setValueState("Error");
                oGender.setValueStateText("Please select Gender");
                bError = true;

            }

            // Qualification

            if (!oQualification.getSelectedKey()) {

                oQualification.setValueState("Error");
                oQualification.setValueStateText("Please select Qualification");
                bError = true;

            }

            // Email

            var sEmail = oEmail.getValue().trim();

            var oEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!sEmail) {

                oEmail.setValueState("Error");
                oEmail.setValueStateText("Email is required");
                bError = true;

            } else if (!oEmailRegex.test(sEmail)) {

                oEmail.setValueState("Error");
                oEmail.setValueStateText("Enter valid Email");
                bError = true;

            }

            // Mobile

            var sMobile = oMobile.getValue().trim();

            if (!/^[0-9]{10}$/.test(sMobile)) {

                oMobile.setValueState("Error");
                oMobile.setValueStateText("Enter valid 10 digit Mobile Number");
                bError = true;

            }

            // Job

            if (!oJob.getSelectedKey()) {

                oJob.setValueState("Error");
                oJob.setValueStateText("Please select Job");
                bError = true;

            }

            // Status

            if (!oStatus.getSelectedKey()) {

                oStatus.setValueState("Error");
                oStatus.setValueStateText("Please select Status");
                bError = true;

            }

            if (bError) {

                sap.m.MessageBox.error("Please fill all mandatory fields.");

                return;

            }

            // Selected Job Title

            var sJobTitle = "";

            if (oJob.getSelectedItem()) {

                sJobTitle = oJob.getSelectedItem().getText();

            }

            // Payload

            var oPayload = {

                JobId: oJob.getSelectedKey(),
                JobTitle: sJobTitle,

                CandidateName: oCandidateName.getValue(),

                Gender: oGender.getSelectedKey(),

                DateOfBirth: this.byId("dateOfBirth").getDateValue(),

                Email: sEmail,

                Mobile: sMobile,

                Address: this.byId("address").getValue(),

                City: this.byId("city").getValue(),

                State: this.byId("state").getValue(),

                Pincode: this.byId("pincode").getValue(),

                Nationality: this.byId("nationality").getValue(),

                Qualification: oQualification.getSelectedKey(),

                Specialization: this.byId("specialization").getValue(),

                Experience: this.byId("experience").getValue(),

                Skills: this.byId("skills").getValue(),

                AppliedOn: this.byId("appliedOn").getDateValue(),

                Status: oStatus.getSelectedKey(),

                Remarks: this.byId("remarks").getValue()

            };

            this.getView().setBusy(true);

            oModel.create("/CandidateSet", oPayload, {

                success: function () {

                    this.getView().setBusy(false);

                    sap.m.MessageToast.show("Candidate created successfully.");

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("CandidateList");

                }.bind(this),

                error: function (oError) {

                    this.getView().setBusy(false);

                    sap.m.MessageBox.error("Failed to create candidate.");

                    console.log(oError);

                }.bind(this)

            });

        },

        onReset: function () {

            var aControls = [

                "candidateName",
                "gender",
                "dateOfBirth",
                "nationality",
                "qualification",
                "specialization",
                "experience",
                "skills",
                "email",
                "mobile",
                "address",
                "city",
                "state",
                "pincode",
                "jobId",
                "appliedOn",
                "status",
                "remarks"

            ];

            aControls.forEach(function (sId) {

                var oControl = this.byId(sId);

                if (!oControl) {
                    return;
                }

                // Input / TextArea
                if (oControl.setValue) {
                    oControl.setValue("");
                }

                // Select
                if (oControl.setSelectedKey) {
                    oControl.setSelectedKey("");
                }

                // DatePicker
                if (oControl.setDateValue) {
                    oControl.setDateValue(null);
                }

                // Clear Validation
                if (oControl.setValueState) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }

            }.bind(this));

            MessageToast.show("Form reset successfully.");

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