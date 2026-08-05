sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageBox,
    Fragment,
    MessageToast
) {
    "use strict";

    return Controller.extend("employee.controller.recruitment.JobOpenings", {

        onInit: function () {
            //console.log("Recruitment Page Loaded");
        },

        _loadJobs: function () {

            var oTable = this.byId("jobTable");

            if (!oTable) {
                return;
            }

            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.refresh();
            }

        },

        onRefresh: function () {


            this.byId("searchField").setValue("");


            this.byId("departmentFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");


            var oTable = this.byId("jobTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {


                oBinding.filter([]);


                oBinding.refresh();

            }

            sap.m.MessageToast.show("Job list refreshed");

        },

        onCreateJob: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("CreateJob");

        },

        onEditJob: function (oEvent) {

            var sJobId = oEvent.getSource()
                .getBindingContext()
                .getProperty("JobId");

            this.getOwnerComponent()
                .getRouter()
                .navTo("EditJob", {

                    JobId: sJobId

                });

        },
        onViewJob: async function (oEvent) {

            this._sSelectedJobId = oEvent.getSource()
                .getBindingContext()
                .getProperty("JobId");

            var oContext = oEvent.getSource().getBindingContext();

            if (!this._oJobDialog) {

                this._oJobDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "employee.view.fragments.JobDetails",
                    controller: this
                });

                this.getView().addDependent(this._oJobDialog);

            }

            this._oJobDialog.setBindingContext(oContext);

            this._oJobDialog.open();

        },
        onEditFromDialog: function () {

            this._oJobDialog.close();

            this.getOwnerComponent()
                .getRouter()
                .navTo("EditJob", {

                    JobId: this._sSelectedJobId

                });

        },
        onDuplicateJob: function () {

            sap.m.MessageToast.show(
                "Duplicate Job - Coming Soon"
            );

        },
        onCloseJobDetails: function () {

            this._oJobDialog.close();

        },
        onDeleteJob: function (oEvent) {

            var that = this;

            var sPath = oEvent.getSource()
                .getBindingContext()
                .getPath();

            MessageBox.confirm(
                "Delete this job opening?",
                {

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            that.getView()
                                .getModel()
                                .remove(sPath, {

                                    success: function () {

                                        MessageToast.show(
                                            "Job deleted successfully"
                                        );

                                        that._loadJobs();

                                    },

                                    error: function () {

                                        MessageBox.error(
                                            "Delete failed"
                                        );

                                    }

                                });

                        }

                    }

                });

        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue");

            var oBinding = this.byId("jobTable")
                .getBinding("items");

            if (!sValue) {

                oBinding.filter([]);

                return;

            }

            var aFilters = [

                new Filter(
                    "JobTitle",
                    FilterOperator.Contains,
                    sValue
                ),

                new Filter(
                    "Location",
                    FilterOperator.Contains,
                    sValue
                )

            ];

            oBinding.filter(
                new Filter(aFilters, false)
            );

        },

        onFilter: function () {

            var aFilters = [];

            var sDepartment = this.byId("departmentFilter")
                .getSelectedKey();

            var sStatus = this.byId("statusFilter")
                .getSelectedKey();

            if (sDepartment) {

                aFilters.push(

                    new Filter(
                        "Department",
                        FilterOperator.EQ,
                        sDepartment
                    )

                );

            }

            if (sStatus) {

                aFilters.push(

                    new Filter(
                        "Status",
                        FilterOperator.EQ,
                        sStatus
                    )

                );

            }

            this.byId("jobTable")
                .getBinding("items")
                .filter(aFilters);

        },

        onNavBack: function () {

            this.getOwnerComponent().getRouter().navTo("RecruitmentDashboard")
        }

    });

});