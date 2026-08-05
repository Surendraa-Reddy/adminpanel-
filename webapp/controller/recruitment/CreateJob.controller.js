
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

    return Controller.extend("employee.controller.recruitment.CreateJob", {

        onSave: function () {

            var oModel = this.getView().getModel();

           

            var oEntry = {

                JobTitle: this.byId("jobTitle").getValue(),
                Department: this.byId("department").getValue().trim(),

                Location: this.byId("location").getValue(),

                Experience: this.byId("experience").getValue(),

                Vacancies: this.byId("vacancies").getValue().toString(),

                JobType: this.byId("jobType").getSelectedKey(),

                Description: this.byId("description").getValue(),

                Status: this.byId("status").getSelectedKey(),
                    LastDate: this.byId("lastDate").getDateValue()

            };
            console.log(oEntry);

            if (!oEntry.JobTitle) {

                MessageBox.error("Enter Job Title");

                return;

            }

            if (!oEntry.Department) {

                MessageBox.error("Select Department");

                return;

            }

            this.getView().setBusy(true);

            oModel.create("/JobOpeningSet", oEntry, {

                success: function () {

                    this.getView().setBusy(false);

                    MessageToast.show("Job Created Successfully");

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("JobOpenings");

                }.bind(this),

                error: function () {

                    this.getView().setBusy(false);

                    MessageBox.error("Unable to create Job");

                }.bind(this)

            });

        },

        onReset: function () {

            this.byId("jobTitle").setValue("");

            this.byId("department").setSelectedKey("");

            this.byId("location").setValue("");

            this.byId("experience").setValue("");

            this.byId("vacancies").setValue(1);

            this.byId("jobType").setSelectedKey("");

            this.byId("description").setValue("");

            this.byId("status").setSelectedKey("OPEN");

        },

        onCancel: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobOpenings");

        },

        onNavBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobOpenings");

        }

    });

});