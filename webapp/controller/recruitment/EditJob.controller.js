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

    return Controller.extend("employee.controller.recruitment.EditJob", {

        onInit: function () {

            var oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("EditJob")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function (oEvent) {

            var sJobId = oEvent.getParameter("arguments").JobId;

            var sPath = "/JobOpeningSet('" + sJobId + "')";

            this.getView().bindElement(sPath);

        },

        onUpdate: function () {

            var oModel = this.getView().getModel();

            var sPath = this.getView().getBindingContext().getPath();
            var oLastDate = this.byId("lastDate").getDateValue();

            if (oLastDate) {
                oLastDate.setHours(12, 0, 0, 0);
            }


            var oData = {

                JobId: this.byId("jobId").getValue(),
                JobTitle: this.byId("jobTitle").getValue(),
                Department: this.byId("department").getValue(),
                Location: this.byId("location").getValue(),
                Experience: this.byId("experience").getValue(),
                Vacancies: this.byId("vacancies").getValue(),
                JobType: this.byId("jobType").getValue(),
                Description: this.byId("description").getValue(),
                Status: this.byId("status").getSelectedKey(),
                LastDate: oLastDate


            };

            this.getView().setBusy(true);

            oModel.update(sPath, oData, {

                success: function () {

                    this.getView().setBusy(false);

                    MessageToast.show("Job Updated Successfully");

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("JobOpenings");

                }.bind(this),

                error: function () {

                    this.getView().setBusy(false);

                    MessageBox.error("Update Failed");

                }.bind(this)

            });

        },

        onRefresh: function () {

            this.getView().getBindingContext().refresh();

            MessageToast.show("Data Refreshed");

        },

        onReset: function () {

            this.getView().getModel().resetChanges();

        },

        onCancel: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("JobOpenings");

        },

        onNavBack: function () {

            this.onCancel();

        }

    });

});