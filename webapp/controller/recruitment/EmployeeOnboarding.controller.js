sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Fragment,
    MessageBox,
    MessageToast
) {

    "use strict";

    return Controller.extend(
        "employee.controller.recruitment.EmployeeOnboarding",
        {

            JOINING_ENTITY_SET: "/JoiningSet",

            CANDIDATE_ENTITY_SET: "/CandidateSet",

            JOB_ENTITY_SET: "/JobOpeningSet",

            ONBOARDING_ENTITY_SET: "/OnboardingSet",




            onInit: function () {

                var oOnboardingModel = new JSONModel({

                    Items: [],

                    KPI: {

                        Total: 0,

                        Pending: 0,

                        InProgress: 0,

                        Completed: 0,

                        Cancelled: 0

                    }

                });


                this.getView().setModel(
                    oOnboardingModel,
                    "onboarding"
                );


                this._loadOnboarding();

            },




            _loadOnboarding: function () {

                var oModel =
                    this.getOwnerComponent().getModel();


                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;

                }


                this.getView().setBusy(true);


                oModel.read(
                    this.ONBOARDING_ENTITY_SET,
                    {

                        success: function (oData) {

                            var aResults =
                                oData.results || [];


                            console.log(
                                "OnboardingSet DATA:",
                                aResults
                            );


                            var oOnboardingModel =
                                this.getView().getModel(
                                    "onboarding"
                                );


                            oOnboardingModel.setProperty(
                                "/Items",
                                aResults
                            );


                            this._calculateKPI(
                                aResults
                            );


                            this.getView()
                                .setBusy(false);

                        }.bind(this),


                        error: function (oError) {

                            this.getView()
                                .setBusy(false);


                            console.error(
                                "OnboardingSet READ ERROR:",
                                oError
                            );


                            MessageBox.error(
                                this._getODataErrorMessage(
                                    oError,
                                    "Unable to load employee onboarding records."
                                )
                            );

                        }.bind(this)

                    }
                );

            },





            _calculateKPI: function (aItems) {

                var iTotal =
                    aItems.length;

                var iPending = 0;

                var iInProgress = 0;

                var iCompleted = 0;

                var iCancelled = 0;


                aItems.forEach(
                    function (oItem) {

                        var sStatus =
                            String(
                                oItem.OnboardingStatus || ""
                            )
                                .trim()
                                .toUpperCase();


                        switch (sStatus) {

                            case "PENDING":

                                iPending++;

                                break;


                            case "IN_PROGRESS":

                                iInProgress++;

                                break;


                            case "COMPLETED":

                                iCompleted++;

                                break;


                            case "CANCELLED":

                                iCancelled++;

                                break;

                        }

                    }
                );


                var oModel =
                    this.getView().getModel(
                        "onboarding"
                    );


                oModel.setProperty(
                    "/KPI/Total",
                    iTotal
                );


                oModel.setProperty(
                    "/KPI/Pending",
                    iPending
                );


                oModel.setProperty(
                    "/KPI/InProgress",
                    iInProgress
                );


                oModel.setProperty(
                    "/KPI/Completed",
                    iCompleted
                );


                oModel.setProperty(
                    "/KPI/Cancelled",
                    iCancelled
                );

            },




            onRefresh: function () {

                this._loadOnboarding();


                MessageToast.show(
                    "Onboarding records refreshed."
                );

            },




            onSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue");


                if (sValue === undefined) {

                    sValue =
                        oEvent.getParameter("query");

                }


                sValue =
                    String(sValue || "")
                        .trim();


                var oTable =
                    this.byId(
                        "onboardingTable"
                    );


                if (!oTable) {
                    return;
                }


                var oBinding =
                    oTable.getBinding("items");


                if (!oBinding) {
                    return;
                }


                if (!sValue) {

                    oBinding.filter([]);

                    return;

                }


                var aFilters = [

                    new Filter(
                        "OnboardId",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "JoiningId",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "CandidateId",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "CandidateName",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "EmpId",
                        FilterOperator.Contains,
                        sValue
                    )

                ];


                oBinding.filter(
                    new Filter(
                        aFilters,
                        false
                    )
                );

            },



            onStatusFilter: function (oEvent) {

                var oSelectedItem =
                    oEvent.getParameter(
                        "selectedItem"
                    );


                if (!oSelectedItem) {
                    return;
                }


                var sStatus =
                    oSelectedItem.getKey();


                this._applyStatusFilter(
                    sStatus
                );

            },


            _applyStatusFilter: function (sStatus) {

                var oTable =
                    this.byId(
                        "onboardingTable"
                    );


                if (!oTable) {
                    return;
                }


                var oBinding =
                    oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {
                    return;
                }


                if (
                    !sStatus ||
                    sStatus === "ALL"
                ) {

                    oBinding.filter([]);

                    return;

                }


                oBinding.filter(
                    new Filter(
                        "OnboardingStatus",
                        FilterOperator.EQ,
                        sStatus
                    )
                );

            },

            onClearFilters: function () {

                var oSearch =
                    this.byId(
                        "onboardingSearch"
                    );


                var oStatus =
                    this.byId(
                        "onboardingStatusFilter"
                    );


                if (oSearch) {

                    oSearch.setValue("");

                }


                if (oStatus) {

                    oStatus.setSelectedKey(
                        "ALL"
                    );

                }


                var oTable =
                    this.byId(
                        "onboardingTable"
                    );


                if (!oTable) {
                    return;
                }


                var oBinding =
                    oTable.getBinding(
                        "items"
                    );


                if (oBinding) {

                    oBinding.filter([]);

                }

            },




            onKpiTotalPress: function () {

                this.onClearFilters();

            },


            onKpiPendingPress: function () {

                this.byId(
                    "onboardingStatusFilter"
                ).setSelectedKey(
                    "PENDING"
                );


                this._applyStatusFilter(
                    "PENDING"
                );

            },


            onKpiInProgressPress: function () {

                this.byId(
                    "onboardingStatusFilter"
                ).setSelectedKey(
                    "IN_PROGRESS"
                );


                this._applyStatusFilter(
                    "IN_PROGRESS"
                );

            },


            onKpiCompletedPress: function () {

                this.byId(
                    "onboardingStatusFilter"
                ).setSelectedKey(
                    "COMPLETED"
                );


                this._applyStatusFilter(
                    "COMPLETED"
                );

            },




            onCreateOnboarding: function () {

                var oCreateModel =
                    new JSONModel({

                        /*
                         * Generated by backend
                         */
                        OnboardId: "",

                        /*
                         * User enters
                         */
                        JoiningId: "",

                        /*
                         * Loaded from Joining
                         */
                        OfferId: "",

                        CandidateId: "",

                        CandidateName: "",

                        JobId: "",

                        JobTitle: "",

                        Department: "",

                        JoiningDate: null,

                        JoiningDateDisplay: "",

                        Email: "",

                        Mobile: "",

                        Location: "",

                        EmploymentType: "",

                        /*
                         * Manual entry
                         */
                        ReportingManager: "",

                        OnboardingStatus: "PENDING",

                        EmpId: "",

                        Comments: "",

                        /*
                         * Validation
                         */
                        JoiningIdState: "None",

                        JoiningIdStateText: "",

                        ReportingManagerState: "None",

                        ReportingManagerStateText: "",

                        DetailsLoaded: false,

                        CanCreate: false

                    });


                if (!this._oCreateOnboardingDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.CreateOnboarding",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oCreateOnboardingDialog =
                                oDialog;


                            this.getView()
                                .addDependent(
                                    oDialog
                                );


                            oDialog.setModel(
                                oCreateModel,
                                "createOnboarding"
                            );


                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "CREATE ONBOARDING FRAGMENT ERROR:",
                                oError
                            );


                            MessageBox.error(
                                "Unable to open Create Onboarding dialog."
                            );

                        }.bind(this)

                    );

                } else {

                    this._oCreateOnboardingDialog
                        .setModel(
                            oCreateModel,
                            "createOnboarding"
                        );


                    this._oCreateOnboardingDialog.open();

                }

            },




            onJoiningIdChange: function (oEvent) {

                var sValue =
                    oEvent.getSource().getValue();


                sValue =
                    String(sValue || "")
                        .trim()
                        .toUpperCase();


                oEvent.getSource()
                    .setValue(sValue);


                var oCreateModel =
                    this._oCreateOnboardingDialog
                        ? this._oCreateOnboardingDialog
                            .getModel("createOnboarding")
                        : null;


                if (!oCreateModel) {
                    return;
                }


                /*
                 * Synchronize Joining ID
                 */
                oCreateModel.setProperty(
                    "/JoiningId",
                    sValue
                );


                /*
                 * Reset validation
                 */
                oCreateModel.setProperty(
                    "/JoiningIdState",
                    "None"
                );

                oCreateModel.setProperty(
                    "/JoiningIdStateText",
                    ""
                );


                /*
                 * Reset loaded details
                 */
                oCreateModel.setProperty(
                    "/CanCreate",
                    false
                );

                oCreateModel.setProperty(
                    "/DetailsLoaded",
                    false
                );


                oCreateModel.setProperty(
                    "/OfferId",
                    ""
                );

                oCreateModel.setProperty(
                    "/CandidateId",
                    ""
                );

                oCreateModel.setProperty(
                    "/CandidateName",
                    ""
                );

                oCreateModel.setProperty(
                    "/JobId",
                    ""
                );

                oCreateModel.setProperty(
                    "/JobTitle",
                    ""
                );

                oCreateModel.setProperty(
                    "/Department",
                    ""
                );

                oCreateModel.setProperty(
                    "/JoiningDate",
                    null
                );

                oCreateModel.setProperty(
                    "/JoiningDateDisplay",
                    ""
                );

                oCreateModel.setProperty(
                    "/Email",
                    ""
                );

                oCreateModel.setProperty(
                    "/Mobile",
                    ""
                );

                oCreateModel.setProperty(
                    "/Location",
                    ""
                );

                oCreateModel.setProperty(
                    "/EmploymentType",
                    ""
                );

                /*
                 * Reporting Manager is manual.
                 */
                oCreateModel.setProperty(
                    "/ReportingManager",
                    ""
                );

                oCreateModel.setProperty(
                    "/ReportingManagerState",
                    "None"
                );

                oCreateModel.setProperty(
                    "/ReportingManagerStateText",
                    ""
                );


                console.log(
                    "JOINING ID CHANGED TO:",
                    sValue
                );

            },




            _clearLoadedJoiningDetails: function () {

                if (
                    !this._oCreateOnboardingDialog
                ) {
                    return;
                }


                var oModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!oModel) {
                    return;
                }


                oModel.setProperty(
                    "/OfferId",
                    ""
                );

                oModel.setProperty(
                    "/CandidateId",
                    ""
                );

                oModel.setProperty(
                    "/CandidateName",
                    ""
                );

                oModel.setProperty(
                    "/JobId",
                    ""
                );

                oModel.setProperty(
                    "/JobTitle",
                    ""
                );

                oModel.setProperty(
                    "/Department",
                    ""
                );

                oModel.setProperty(
                    "/JoiningDate",
                    null
                );

                oModel.setProperty(
                    "/JoiningDateDisplay",
                    ""
                );

                oModel.setProperty(
                    "/Email",
                    ""
                );

                oModel.setProperty(
                    "/Mobile",
                    ""
                );

                oModel.setProperty(
                    "/Location",
                    ""
                );

                oModel.setProperty(
                    "/EmploymentType",
                    ""
                );

                oModel.setProperty(
                    "/OnboardingStatus",
                    "PENDING"
                );

                oModel.setProperty(
                    "/DetailsLoaded",
                    false
                );

                oModel.setProperty(
                    "/CanCreate",
                    false
                );

            },




            onLoadJoiningDetails: function () {

                var oDialog =
                    this._oCreateOnboardingDialog;


                if (!oDialog) {

                    MessageBox.error(
                        "Create Onboarding dialog is not available."
                    );

                    return;

                }


                var oCreateModel =
                    oDialog.getModel(
                        "createOnboarding"
                    );


                if (!oCreateModel) {

                    MessageBox.error(
                        "Create onboarding model is not available."
                    );

                    return;

                }


                /*
                 * Get Joining ID directly from Input
                 */
                var oInput =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "createJoiningId"
                    );


                if (!oInput) {

                    MessageBox.error(
                        "Joining ID input field was not found."
                    );

                    return;

                }


                var sJoiningId =
                    oInput.getValue();


                sJoiningId =
                    String(sJoiningId || "")
                        .trim()
                        .toUpperCase();


                console.log(
                    "======================================"
                );

                console.log(
                    "JOINING ID ENTERED:",
                    sJoiningId
                );

                console.log(
                    "======================================"
                );


                /*
                 * Validate Joining ID
                 */
                if (!sJoiningId) {

                    oInput.setValueState(
                        "Error"
                    );

                    oInput.setValueStateText(
                        "Joining ID is required."
                    );


                    oCreateModel.setProperty(
                        "/CanCreate",
                        false
                    );


                    oCreateModel.setProperty(
                        "/DetailsLoaded",
                        false
                    );


                    MessageBox.warning(
                        "Please enter a Joining ID."
                    );

                    return;

                }


                oInput.setValueState(
                    "None"
                );


                /*
                 * Update model
                 */
                oCreateModel.setProperty(
                    "/JoiningId",
                    sJoiningId
                );


                /*
                 * Reset previous values
                 */
                oCreateModel.setProperty(
                    "/CanCreate",
                    false
                );

                oCreateModel.setProperty(
                    "/DetailsLoaded",
                    false
                );

                oCreateModel.setProperty(
                    "/OfferId",
                    ""
                );

                oCreateModel.setProperty(
                    "/CandidateId",
                    ""
                );

                oCreateModel.setProperty(
                    "/CandidateName",
                    ""
                );

                oCreateModel.setProperty(
                    "/JobId",
                    ""
                );

                oCreateModel.setProperty(
                    "/JobTitle",
                    ""
                );

                oCreateModel.setProperty(
                    "/Department",
                    ""
                );

                oCreateModel.setProperty(
                    "/JoiningDate",
                    null
                );

                oCreateModel.setProperty(
                    "/JoiningDateDisplay",
                    ""
                );

                oCreateModel.setProperty(
                    "/Email",
                    ""
                );

                oCreateModel.setProperty(
                    "/Mobile",
                    ""
                );

                oCreateModel.setProperty(
                    "/Location",
                    ""
                );

                oCreateModel.setProperty(
                    "/EmploymentType",
                    ""
                );

                oCreateModel.setProperty(
                    "/ReportingManager",
                    ""
                );

                oCreateModel.setProperty(
                    "/ReportingManagerState",
                    "None"
                );

                oCreateModel.setProperty(
                    "/ReportingManagerStateText",
                    ""
                );


                /*
                 * Get OData Model
                 */
                var oModel =
                    this.getOwnerComponent()
                        .getModel();


                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;

                }


                this.getView()
                    .setBusy(true);


                /*
                 * Build Joining key
                 */
                var sJoiningPath =
                    oModel.createKey(
                        this.JOINING_ENTITY_SET,
                        {
                            JoiningId:
                                sJoiningId
                        }
                    );


                console.log(
                    "JOINING READ PATH:",
                    sJoiningPath
                );


                /*
                 * Read Joining
                 */
                oModel.read(
                    sJoiningPath,
                    {

                        success:
                            function (
                                oJoiningData
                            ) {

                                console.log(
                                    "JOINING DATA:",
                                    oJoiningData
                                );


                                /*
                                 * Verify returned Joining ID
                                 */
                                var sReturnedJoiningId =
                                    String(
                                        oJoiningData.JoiningId || ""
                                    )
                                        .trim()
                                        .toUpperCase();


                                if (
                                    sReturnedJoiningId &&
                                    sReturnedJoiningId !==
                                    sJoiningId
                                ) {

                                    this.getView()
                                        .setBusy(false);


                                    oCreateModel.setProperty(
                                        "/CanCreate",
                                        false
                                    );

                                    oCreateModel.setProperty(
                                        "/DetailsLoaded",
                                        false
                                    );


                                    MessageBox.error(
                                        "Joining ID mismatch.\n\n" +
                                        "Requested: " +
                                        sJoiningId +
                                        "\nReturned: " +
                                        sReturnedJoiningId
                                    );

                                    return;

                                }


                                /*
                                 * Check Joining Status
                                 */
                                var sStatus =
                                    String(
                                        oJoiningData.JoiningStatus || ""
                                    )
                                        .trim()
                                        .toUpperCase();


                                console.log(
                                    "JOINING STATUS:",
                                    sStatus
                                );


                                if (
                                    sStatus !==
                                    "CONFIRMED"
                                ) {

                                    this.getView()
                                        .setBusy(false);


                                    oCreateModel.setProperty(
                                        "/CanCreate",
                                        false
                                    );

                                    oCreateModel.setProperty(
                                        "/DetailsLoaded",
                                        false
                                    );


                                    oCreateModel.setProperty(
                                        "/JoiningIdState",
                                        "Error"
                                    );

                                    oCreateModel.setProperty(
                                        "/JoiningIdStateText",
                                        "Joining status is not CONFIRMED."
                                    );


                                    MessageBox.warning(
                                        "Joining " +
                                        sJoiningId +
                                        " is not CONFIRMED." +
                                        "\n\nCurrent Status: " +
                                        (
                                            sStatus ||
                                            "UNKNOWN"
                                        ) +
                                        "\n\nOnly confirmed joining records can be onboarded."
                                    );

                                    return;

                                }


                                /*
                                 * Joining data
                                 */
                                oCreateModel.setProperty(
                                    "/JoiningId",
                                    sJoiningId
                                );

                                oCreateModel.setProperty(
                                    "/OfferId",
                                    oJoiningData.OfferId || ""
                                );

                                oCreateModel.setProperty(
                                    "/CandidateId",
                                    oJoiningData.CandidateId || ""
                                );

                                oCreateModel.setProperty(
                                    "/CandidateName",
                                    oJoiningData.CandidateName || ""
                                );

                                oCreateModel.setProperty(
                                    "/JobId",
                                    oJoiningData.JobId || ""
                                );

                                oCreateModel.setProperty(
                                    "/JobTitle",
                                    oJoiningData.JobTitle || ""
                                );

                                oCreateModel.setProperty(
                                    "/JoiningDate",
                                    oJoiningData.JoiningDate || null
                                );

                                oCreateModel.setProperty(
                                    "/JoiningDateDisplay",
                                    this.formatDate(
                                        oJoiningData.JoiningDate
                                    )
                                );


                                /*
                                 * Candidate ID
                                 */
                                var sCandidateId =
                                    String(
                                        oJoiningData.CandidateId || ""
                                    )
                                        .trim()
                                        .toUpperCase();


                                /*
                                 * Job ID
                                 */
                                var sJobId =
                                    String(
                                        oJoiningData.JobId || ""
                                    )
                                        .trim()
                                        .toUpperCase();


                                console.log(
                                    "CANDIDATE ID:",
                                    sCandidateId
                                );

                                console.log(
                                    "JOB ID:",
                                    sJobId
                                );


                                /*
                                 * Candidate missing
                                 */
                                if (!sCandidateId) {

                                    console.warn(
                                        "Candidate ID is empty."
                                    );


                                    this._loadJobForOnboarding(
                                        oModel,
                                        oCreateModel,
                                        sJobId
                                    );

                                    return;

                                }


                                /*
                                 * Candidate path
                                 */
                                var sCandidatePath =
                                    oModel.createKey(
                                        this.CANDIDATE_ENTITY_SET,
                                        {
                                            CandidateId:
                                                sCandidateId
                                        }
                                    );


                                console.log(
                                    "CANDIDATE READ PATH:",
                                    sCandidatePath
                                );


                                /*
                                 * Read Candidate
                                 */
                                oModel.read(
                                    sCandidatePath,
                                    {

                                        success:
                                            function (
                                                oCandidateData
                                            ) {

                                                console.log(
                                                    "CANDIDATE DATA:",
                                                    oCandidateData
                                                );


                                                oCreateModel.setProperty(
                                                    "/CandidateId",
                                                    oCandidateData.CandidateId ||
                                                    sCandidateId
                                                );


                                                oCreateModel.setProperty(
                                                    "/CandidateName",
                                                    oCandidateData.CandidateName ||
                                                    oJoiningData.CandidateName ||
                                                    ""
                                                );


                                                oCreateModel.setProperty(
                                                    "/Email",
                                                    oCandidateData.Email ||
                                                    ""
                                                );


                                                oCreateModel.setProperty(
                                                    "/Mobile",
                                                    oCandidateData.Mobile ||
                                                    ""
                                                );


                                                console.log(
                                                    "CANDIDATE EMAIL:",
                                                    oCandidateData.Email
                                                );


                                                console.log(
                                                    "CANDIDATE MOBILE:",
                                                    oCandidateData.Mobile
                                                );


                                                this._loadJobForOnboarding(
                                                    oModel,
                                                    oCreateModel,
                                                    sJobId
                                                );

                                            }.bind(this),


                                        error:
                                            function (
                                                oError
                                            ) {

                                                console.error(
                                                    "CANDIDATE READ ERROR:",
                                                    oError
                                                );


                                                /*
                                                 * Continue with job.
                                                 */
                                                this._loadJobForOnboarding(
                                                    oModel,
                                                    oCreateModel,
                                                    sJobId
                                                );

                                            }.bind(this)

                                    }
                                );

                            }.bind(this),


                        error:
                            function (
                                oError
                            ) {

                                this.getView()
                                    .setBusy(false);


                                console.error(
                                    "JOINING READ ERROR:",
                                    oError
                                );


                                oCreateModel.setProperty(
                                    "/CanCreate",
                                    false
                                );

                                oCreateModel.setProperty(
                                    "/DetailsLoaded",
                                    false
                                );


                                MessageBox.error(
                                    this._getODataErrorMessage(
                                        oError,
                                        "Unable to load joining details."
                                    )
                                );

                            }.bind(this)

                    }
                );

            },




            _loadJobForOnboarding: function (
                oModel,
                oCreateModel,
                sJobId
            ) {


                if (!sJobId) {

                    console.warn(
                        "Job ID is empty."
                    );


                    this.getView()
                        .setBusy(false);


                    /*
                     * Do NOT directly set CanCreate=true.
                     */
                    oCreateModel.setProperty(
                        "/DetailsLoaded",
                        true
                    );


                    this._updateCreateButtonState();

                    return;

                }


                /*
                 * Job key
                 */
                var sJobPath =
                    oModel.createKey(
                        this.JOB_ENTITY_SET,
                        {
                            JobId:
                                sJobId
                        }
                    );


                console.log(
                    "JOB OPENING READ PATH:",
                    sJobPath
                );


                /*
                 * Read Job
                 */
                oModel.read(
                    sJobPath,
                    {

                        success:
                            function (
                                oJobData
                            ) {

                                console.log(
                                    "JOB OPENING DATA:",
                                    oJobData
                                );


                                /*
                                 * Job ID
                                 */
                                oCreateModel.setProperty(
                                    "/JobId",
                                    oJobData.JobId ||
                                    sJobId
                                );


                                /*
                                 * Job Title
                                 */
                                oCreateModel.setProperty(
                                    "/JobTitle",
                                    oJobData.JobTitle ||
                                    ""
                                );


                                /*
                                 * Department
                                 */
                                oCreateModel.setProperty(
                                    "/Department",
                                    oJobData.Department ||
                                    ""
                                );


                                /*
                                 * Location
                                 */
                                oCreateModel.setProperty(
                                    "/Location",
                                    oJobData.Location ||
                                    ""
                                );


                                /*
                                 * Employment Type
                                 */
                                oCreateModel.setProperty(
                                    "/EmploymentType",
                                    oJobData.JobType ||
                                    ""
                                );


                                console.log(
                                    "DEPARTMENT:",
                                    oJobData.Department
                                );

                                console.log(
                                    "LOCATION:",
                                    oJobData.Location
                                );

                                console.log(
                                    "EMPLOYMENT TYPE:",
                                    oJobData.JobType
                                );



                                this._finishLoadingJoiningDetails();


                                console.log(
                                    "FINAL CREATE ONBOARDING MODEL:",
                                    oCreateModel.getData()
                                );

                            }.bind(this),


                        error:
                            function (
                                oError
                            ) {

                                this.getView()
                                    .setBusy(false);


                                console.error(
                                    "JOB OPENING READ ERROR:",
                                    oError
                                );



                                oCreateModel.setProperty(
                                    "/CanCreate",
                                    false
                                );

                                oCreateModel.setProperty(
                                    "/DetailsLoaded",
                                    false
                                );


                                MessageBox.error(
                                    this._getODataErrorMessage(
                                        oError,
                                        "Unable to load job opening details."
                                    )
                                );

                            }.bind(this)

                    }
                );

            },




            _processJoiningRecord: function (
                oJoining
            ) {

                var oCreateModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                var sJoiningStatus =
                    String(
                        oJoining.JoiningStatus || ""
                    )
                        .trim()
                        .toUpperCase();


                if (
                    sJoiningStatus !==
                    "CONFIRMED"
                ) {

                    this.getView()
                        .setBusy(false);


                    oCreateModel.setProperty(
                        "/JoiningIdState",
                        "Error"
                    );


                    oCreateModel.setProperty(
                        "/JoiningIdStateText",
                        "Joining status is not CONFIRMED."
                    );


                    MessageBox.warning(

                        "Joining " +
                        oJoining.JoiningId +
                        " is not CONFIRMED." +
                        "\n\nCurrent Status: " +
                        (
                            oJoining.JoiningStatus ||
                            "Unknown"
                        ) +
                        "\n\nOnly confirmed joining records can be onboarded."

                    );


                    return;

                }


                oCreateModel.setProperty(
                    "/JoiningId",
                    oJoining.JoiningId || ""
                );


                oCreateModel.setProperty(
                    "/OfferId",
                    oJoining.OfferId || ""
                );


                oCreateModel.setProperty(
                    "/CandidateId",
                    oJoining.CandidateId || ""
                );


                oCreateModel.setProperty(
                    "/CandidateName",
                    oJoining.CandidateName || ""
                );


                oCreateModel.setProperty(
                    "/JobId",
                    oJoining.JobId || ""
                );


                oCreateModel.setProperty(
                    "/JobTitle",
                    oJoining.JobTitle || ""
                );


                oCreateModel.setProperty(
                    "/JoiningDate",
                    oJoining.JoiningDate || null
                );


                oCreateModel.setProperty(
                    "/OnboardingStatus",
                    "PENDING"
                );


                oCreateModel.setProperty(
                    "/JoiningDateDisplay",
                    this.formatDate(
                        oJoining.JoiningDate
                    )
                );


                this._loadCandidateDetails(
                    oJoining.CandidateId,
                    oJoining.JobId
                );

            },



            _loadCandidateDetails: function (
                sCandidateId,
                sJobId
            ) {

                var oCreateModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!sCandidateId) {

                    this._loadJobDetails(
                        sJobId
                    );

                    return;

                }


                var oODataModel =
                    this.getOwnerComponent()
                        .getModel();


                var aFilters = [

                    new Filter(
                        "CandidateId",
                        FilterOperator.EQ,
                        sCandidateId
                    )

                ];


                oODataModel.read(

                    this.CANDIDATE_ENTITY_SET,

                    {

                        filters:
                            aFilters,

                        success:
                            function (
                                oData
                            ) {

                                var aResults =
                                    oData.results || [];


                                if (
                                    aResults.length > 0
                                ) {

                                    var oCandidate =
                                        aResults[0];


                                    console.log(
                                        "CANDIDATE RECORD:",
                                        oCandidate
                                    );


                                    oCreateModel.setProperty(
                                        "/CandidateId",
                                        oCandidate.CandidateId ||
                                        sCandidateId
                                    );


                                    oCreateModel.setProperty(
                                        "/CandidateName",
                                        oCandidate.CandidateName ||
                                        ""
                                    );


                                    oCreateModel.setProperty(
                                        "/Email",
                                        oCandidate.Email ||
                                        ""
                                    );


                                    oCreateModel.setProperty(
                                        "/Mobile",
                                        oCandidate.Mobile ||
                                        ""
                                    );

                                }


                                this._loadJobDetails(
                                    sJobId
                                );

                            }.bind(this),


                        error:
                            function (
                                oError
                            ) {

                                console.error(
                                    "CANDIDATE READ ERROR:",
                                    oError
                                );


                                this._loadJobDetails(
                                    sJobId
                                );

                            }.bind(this)

                    }

                );

            },



            _loadJobDetails: function (
                sJobId
            ) {

                var oCreateModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!sJobId) {

                    this._finishLoadingJoiningDetails();

                    return;

                }


                var oODataModel =
                    this.getOwnerComponent()
                        .getModel();


                var aFilters = [

                    new Filter(
                        "JobId",
                        FilterOperator.EQ,
                        sJobId
                    )

                ];


                oODataModel.read(

                    this.JOB_ENTITY_SET,

                    {

                        filters:
                            aFilters,

                        success:
                            function (
                                oData
                            ) {

                                var aResults =
                                    oData.results || [];


                                if (
                                    aResults.length > 0
                                ) {

                                    var oJob =
                                        aResults[0];


                                    console.log(
                                        "JOB RECORD:",
                                        oJob
                                    );


                                    oCreateModel.setProperty(
                                        "/JobId",
                                        oJob.JobId ||
                                        sJobId
                                    );


                                    oCreateModel.setProperty(
                                        "/JobTitle",
                                        oJob.JobTitle ||
                                        oCreateModel.getProperty(
                                            "/JobTitle"
                                        ) ||
                                        ""
                                    );


                                    oCreateModel.setProperty(
                                        "/Department",
                                        oJob.Department ||
                                        ""
                                    );


                                    oCreateModel.setProperty(
                                        "/Location",
                                        oJob.Location ||
                                        ""
                                    );


                                    oCreateModel.setProperty(
                                        "/EmploymentType",
                                        oJob.JobType ||
                                        ""
                                    );

                                }


                                this._finishLoadingJoiningDetails();

                            }.bind(this),


                        error:
                            function (
                                oError
                            ) {

                                console.error(
                                    "JOB READ ERROR:",
                                    oError
                                );


                                this._finishLoadingJoiningDetails();

                            }.bind(this)

                    }

                );

            },


            _finishLoadingJoiningDetails: function () {

                var oCreateModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!oCreateModel) {

                    console.error(
                        "createOnboarding model not found."
                    );

                    this.getView()
                        .setBusy(false);

                    return;

                }


                this.getView()
                    .setBusy(false);


                /*
                 * Joining loaded successfully
                 */
                oCreateModel.setProperty(
                    "/JoiningIdState",
                    "Success"
                );


                oCreateModel.setProperty(
                    "/JoiningIdStateText",
                    "Confirmed joining loaded successfully."
                );


                /*
                 * Mark details loaded
                 */
                oCreateModel.setProperty(
                    "/DetailsLoaded",
                    true
                );


                /*
                 * IMPORTANT:
                 *
                 * Do not directly set CanCreate=true.
                 *
                 * _updateCreateButtonState()
                 * checks ReportingManager.
                 */
                this._updateCreateButtonState();


                console.log(
                    "======================================"
                );

                console.log(
                    "DETAILS LOADING FINISHED"
                );

                console.log(
                    "DetailsLoaded:",
                    oCreateModel.getProperty(
                        "/DetailsLoaded"
                    )
                );

                console.log(
                    "ReportingManager:",
                    oCreateModel.getProperty(
                        "/ReportingManager"
                    )
                );

                console.log(
                    "CanCreate:",
                    oCreateModel.getProperty(
                        "/CanCreate"
                    )
                );

                console.log(
                    "FINAL CREATE ONBOARDING MODEL:",
                    oCreateModel.getData()
                );

                console.log(
                    "======================================"
                );


                MessageToast.show(
                    "Joining details loaded successfully."
                );

            },




            onReportingManagerChange: function (
                oEvent
            ) {

                var sValue =
                    oEvent.getParameter(
                        "value"
                    );


                sValue =
                    String(
                        sValue || ""
                    )
                        .trim();


                if (
                    !this._oCreateOnboardingDialog
                ) {
                    return;
                }


                var oModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!oModel) {
                    return;
                }


                /*
                 * Update model
                 */
                oModel.setProperty(
                    "/ReportingManager",
                    sValue
                );


                /*
                 * Validation
                 */
                if (sValue) {

                    oModel.setProperty(
                        "/ReportingManagerState",
                        "None"
                    );

                    oModel.setProperty(
                        "/ReportingManagerStateText",
                        ""
                    );

                } else {

                    oModel.setProperty(
                        "/ReportingManagerState",
                        "Error"
                    );

                    oModel.setProperty(
                        "/ReportingManagerStateText",
                        "Reporting Manager is required."
                    );

                }


                /*
                 * Recalculate button
                 */
                this._updateCreateButtonState();


                console.log(
                    "REPORTING MANAGER CHANGED:",
                    sValue
                );

                console.log(
                    "CAN CREATE:",
                    oModel.getProperty(
                        "/CanCreate"
                    )
                );

            },




            _updateCreateButtonState: function () {

                if (
                    !this._oCreateOnboardingDialog
                ) {
                    return;
                }


                var oModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!oModel) {
                    return;
                }


                /*
                 * Details must be loaded
                 */
                var bDetailsLoaded =
                    oModel.getProperty(
                        "/DetailsLoaded"
                    ) === true;


                /*
                 * Reporting Manager must exist
                 */
                var sReportingManager =
                    String(
                        oModel.getProperty(
                            "/ReportingManager"
                        ) || ""
                    )
                        .trim();


                /*
                 * FINAL CREATE CONDITION
                 *
                 * DetailsLoaded = true
                 *
                 * AND
                 *
                 * ReportingManager is not empty
                 */
                var bCanCreate =
                    bDetailsLoaded &&
                    sReportingManager.length > 0;



                oModel.setProperty(
                    "/CanCreate",
                    bCanCreate
                );


                console.log(
                    "======================================"
                );

                console.log(
                    "CREATE BUTTON VALIDATION"
                );

                console.log(
                    "DetailsLoaded:",
                    bDetailsLoaded
                );

                console.log(
                    "ReportingManager:",
                    sReportingManager
                );

                console.log(
                    "CanCreate:",
                    bCanCreate
                );

                console.log(
                    "======================================"
                );

            },


            onCloseCreateOnboarding: function () {

                if (
                    this._oCreateOnboardingDialog
                ) {

                    this._oCreateOnboardingDialog.close();

                }

            },




            onSaveOnboarding: function () {

                if (
                    !this._oCreateOnboardingDialog
                ) {

                    MessageBox.error(
                        "Create Onboarding dialog is not available."
                    );

                    return;

                }


                var oCreateModel =
                    this._oCreateOnboardingDialog
                        .getModel(
                            "createOnboarding"
                        );


                if (!oCreateModel) {

                    MessageBox.error(
                        "Onboarding data is not available."
                    );

                    return;

                }


                /*
                 * Get data
                 */
                var oData =
                    Object.assign(
                        {},
                        oCreateModel.getData()
                    );


                console.log(
                    "======================================"
                );

                console.log(
                    "CREATE ONBOARDING DATA:",
                    oData
                );

                console.log(
                    "======================================"
                );


                /*
                 * =====================================================
                 * 1. CLEAN VALUES
                 * =====================================================
                 */

                oData.JoiningId =
                    String(
                        oData.JoiningId || ""
                    )
                        .trim()
                        .toUpperCase();


                oData.ReportingManager =
                    String(
                        oData.ReportingManager || ""
                    )
                        .trim();


                oData.Comments =
                    String(
                        oData.Comments || ""
                    )
                        .trim();


                /*
                 * =====================================================
                 * 2. JOINING ID
                 * =====================================================
                 */

                if (!oData.JoiningId) {

                    oCreateModel.setProperty(
                        "/JoiningIdState",
                        "Error"
                    );


                    oCreateModel.setProperty(
                        "/JoiningIdStateText",
                        "Joining ID is required."
                    );


                    MessageBox.warning(
                        "Please enter Joining ID."
                    );


                    return;

                }


                /*
                 * =====================================================
                 * 3. DETAILS LOADED
                 * =====================================================
                 */

                if (
                    oData.DetailsLoaded !== true
                ) {

                    MessageBox.warning(
                        "Please click 'Load Details' and load a confirmed joining record first."
                    );


                    return;

                }


                /*
                 * =====================================================
                 * 4. REPORTING MANAGER
                 * =====================================================
                 */

                if (!oData.ReportingManager) {

                    oCreateModel.setProperty(
                        "/ReportingManagerState",
                        "Error"
                    );


                    oCreateModel.setProperty(
                        "/ReportingManagerStateText",
                        "Reporting Manager is required."
                    );


                    MessageBox.warning(
                        "Please enter Reporting Manager."
                    );


                    return;

                }


                /*
                 * =====================================================
                 * 5. CANDIDATE
                 * =====================================================
                 */

                if (!oData.CandidateId) {

                    MessageBox.warning(
                        "Candidate ID is missing."
                    );


                    return;

                }


                /*
                 * =====================================================
                 * 6. JOB
                 * =====================================================
                 */

                if (!oData.JobId) {

                    MessageBox.warning(
                        "Job ID is missing."
                    );


                    return;

                }


                /*
                 * =====================================================
                 * 7. STATUS
                 * =====================================================
                 */

                oData.OnboardingStatus =
                    "PENDING";


                /*
                 * =====================================================
                 * 8. DATE
                 * =====================================================
                 */

                if (oData.JoiningDate) {

                    if (
                        !(oData.JoiningDate instanceof Date)
                    ) {

                        oData.JoiningDate =
                            new Date(
                                oData.JoiningDate
                            );

                    }


                    if (
                        isNaN(
                            oData.JoiningDate.getTime()
                        )
                    ) {

                        MessageBox.warning(
                            "Invalid joining date."
                        );


                        return;

                    }

                }


                /*
                 * =====================================================
                 * 9. BUILD CLEAN ODATA PAYLOAD
                 * =====================================================
                 */

                var oPayload = {

                    JoiningId:
                        oData.JoiningId,

                    OfferId:
                        oData.OfferId || "",

                    CandidateId:
                        oData.CandidateId || "",

                    CandidateName:
                        oData.CandidateName || "",

                    JobId:
                        oData.JobId || "",

                    JobTitle:
                        oData.JobTitle || "",

                    Department:
                        oData.Department || "",

                    JoiningDate:
                        oData.JoiningDate || null,

                    Email:
                        oData.Email || "",

                    Mobile:
                        oData.Mobile || "",

                    Location:
                        oData.Location || "",

                    EmploymentType:
                        oData.EmploymentType || "",

                    ReportingManager:
                        oData.ReportingManager,

                    OnboardingStatus:
                        "PENDING",

                    Comments:
                        oData.Comments || ""

                };


                console.log(
                    "======================================"
                );

                console.log(
                    "FINAL CREATE ONBOARDING PAYLOAD:",
                    oPayload
                );

                console.log(
                    "======================================"
                );


                /*
                 * =====================================================
                 * 10. ODATA MODEL
                 * =====================================================
                 */

                var oODataModel =
                    this.getOwnerComponent()
                        .getModel();


                if (!oODataModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );


                    return;

                }


                /*
                 * =====================================================
                 * 11. BUSY
                 * =====================================================
                 */

                this.getView()
                    .setBusy(true);


                /*
                 * =====================================================
                 * 12. CREATE
                 * =====================================================
                 */

                oODataModel.create(

                    this.ONBOARDING_ENTITY_SET,

                    oPayload,

                    {

                        success:
                            function (
                                oCreatedData
                            ) {

                                this.getView()
                                    .setBusy(false);


                                console.log(
                                    "======================================"
                                );

                                console.log(
                                    "ONBOARDING CREATED:",
                                    oCreatedData
                                );

                                console.log(
                                    "======================================"
                                );


                                var sOnboardId =
                                    oCreatedData.OnboardId ||
                                    "";


                                MessageBox.success(

                                    "Employee onboarding record created successfully." +
                                    "\n\nOnboarding ID: " +
                                    sOnboardId,

                                    {

                                        title:
                                            "Onboarding Created",


                                        onClose:
                                            function () {

                                                if (
                                                    this._oCreateOnboardingDialog
                                                ) {

                                                    this._oCreateOnboardingDialog
                                                        .close();

                                                }


                                                this._loadOnboarding();

                                            }.bind(this)

                                    }

                                );

                            }.bind(this),


                        error:
                            function (
                                oError
                            ) {

                                this.getView()
                                    .setBusy(false);


                                console.error(
                                    "======================================"
                                );

                                console.error(
                                    "CREATE ONBOARDING ERROR:",
                                    oError
                                );

                                console.error(
                                    "======================================"
                                );


                                MessageBox.error(

                                    this._getODataErrorMessage(
                                        oError,
                                        "Unable to create onboarding record."
                                    )

                                );

                            }.bind(this)

                    }

                );

            },




            onViewOnboarding: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext("onboarding");


                if (!oContext) {

                    MessageBox.error(
                        "Onboarding record not found."
                    );

                    return;

                }


                var oData =
                    oContext.getObject();


                console.log(
                    "VIEW ONBOARDING:",
                    oData
                );


                /*
                 * Create model for selected
                 * onboarding record
                 */

                var oViewModel =
                    new JSONModel(
                        Object.assign(
                            {},
                            oData
                        )
                    );


                /*
                 * Load ViewOnboarding dialog
                 */

                if (!this._oViewOnboardingDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.ViewOnboarding",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            console.log(
                                "ViewOnboarding fragment loaded successfully."
                            );


                            this._oViewOnboardingDialog =
                                oDialog;


                            this.getView()
                                .addDependent(
                                    oDialog
                                );


                            oDialog.setModel(
                                oViewModel,
                                "viewOnboarding"
                            );


                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "ViewOnboarding Fragment Load Error:",
                                oError
                            );


                            MessageBox.error(

                                "Unable to display onboarding details.\n\n" +
                                (
                                    oError.message ||
                                    "Unable to load ViewOnboarding.fragment.xml."
                                )

                            );

                        }.bind(this)

                    );

                } else {



                    this._oViewOnboardingDialog
                        .setModel(
                            oViewModel,
                            "viewOnboarding"
                        );


                    this._oViewOnboardingDialog.open();

                }

            },
            onCloseViewOnboarding: function () {

                if (
                    this._oViewOnboardingDialog
                ) {

                    this._oViewOnboardingDialog.close();

                }

            },

            onStartOnboarding: function (oEvent) {

                var oContext = oEvent.getSource()
                    .getBindingContext("onboarding");

                if (!oContext) {

                    MessageBox.error(
                        "Onboarding record not found."
                    );

                    return;
                }

                var oData = Object.assign(
                    {},
                    oContext.getObject()
                );

                console.log(
                    "START ONBOARDING:",
                    oData
                );


                /*
                 * Only PENDING records can be started
                 */

                var sStatus = (
                    oData.OnboardingStatus ||
                    ""
                ).toUpperCase();


                if (sStatus !== "PENDING") {

                    MessageBox.information(
                        "This onboarding cannot be started because its current status is " +
                        (oData.OnboardingStatus || "UNKNOWN") +
                        "."
                    );

                    return;
                }


                /*
                 * Create checklist model
                 */

                var oStartModel = new JSONModel({

                    OnboardId:
                        oData.OnboardId || "",

                    JoiningId:
                        oData.JoiningId || "",

                    OfferId:
                        oData.OfferId || "",

                    CandidateId:
                        oData.CandidateId || "",

                    CandidateName:
                        oData.CandidateName || "",

                    JobId:
                        oData.JobId || "",

                    JobTitle:
                        oData.JobTitle || "",

                    JoiningDate:
                        oData.JoiningDate || "",

                    JoiningDateDisplay:
                        this.formatDate(
                            oData.JoiningDate
                        ),

                    ReportingManager:
                        oData.ReportingManager || "",

                    OnboardingStatus:
                        "PENDING",

                    Comments:
                        oData.Comments || "",

                    Progress:
                        0,

                    ProgressText:
                        "0% Completed",

                    Checklist: {

                        PersonalInfo: false,

                        Documents: false,

                        BankDetails: false,

                        EmergencyContact: false,

                        ITAssets: false,

                        HRFormalities: false,

                        Orientation: false

                    }

                });


                /*
                 * Open dialog
                 */

                if (!this._oStartOnboardingDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.StartOnboarding",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            console.log(
                                "StartOnboarding fragment loaded successfully."
                            );


                            this._oStartOnboardingDialog =
                                oDialog;


                            this.getView()
                                .addDependent(
                                    oDialog
                                );


                            oDialog.setModel(
                                oStartModel,
                                "startOnboarding"
                            );


                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Start Onboarding Fragment Error:",
                                oError
                            );


                            MessageBox.error(
                                "Unable to open Start Onboarding screen."
                            );

                        }.bind(this)
                    );

                } else {

                    this._oStartOnboardingDialog
                        .setModel(
                            oStartModel,
                            "startOnboarding"
                        );


                    this._oStartOnboardingDialog.open();

                }

            },
            onChecklistChange: function () {

                var oModel =
                    this._oStartOnboardingDialog
                        .getModel("startOnboarding");

                if (!oModel) {
                    return;
                }


                var oChecklist =
                    oModel.getProperty(
                        "/Checklist"
                    );


                var aItems = [

                    oChecklist.PersonalInfo,

                    oChecklist.Documents,

                    oChecklist.BankDetails,

                    oChecklist.EmergencyContact,

                    oChecklist.ITAssets,

                    oChecklist.HRFormalities,

                    oChecklist.Orientation

                ];


                var iCompleted = 0;


                aItems.forEach(
                    function (bValue) {

                        if (bValue === true) {

                            iCompleted++;

                        }

                    }
                );


                var iTotal =
                    aItems.length;


                var iProgress =
                    Math.round(
                        (iCompleted / iTotal) * 100
                    );


                oModel.setProperty(
                    "/Progress",
                    iProgress
                );


                oModel.setProperty(
                    "/ProgressText",
                    iProgress +
                    "% Completed"
                );


                console.log(
                    "Onboarding Progress:",
                    iProgress + "%"
                );

            },
            onSaveOnboardingProgress: function () {

                var oModel =
                    this._oStartOnboardingDialog
                        .getModel("startOnboarding");


                if (!oModel) {

                    MessageBox.error(
                        "Onboarding model not found."
                    );

                    return;
                }


                var oData =
                    oModel.getData();


                var iProgress =
                    Number(
                        oData.Progress || 0
                    );


                /*
                 * At least one checklist item
                 */

                if (iProgress === 0) {

                    MessageBox.warning(
                        "Please complete at least one onboarding activity before saving."
                    );

                    return;
                }


                MessageBox.confirm(

                    "Start onboarding for " +
                    oData.CandidateName +
                    "?\n\n" +
                    "The onboarding status will change from PENDING to IN_PROGRESS.",

                    {

                        title:
                            "Start Employee Onboarding",

                        actions:
                            [
                                MessageBox.Action.OK,
                                MessageBox.Action.CANCEL
                            ],

                        emphasizedAction:
                            MessageBox.Action.OK,

                        onClose:
                            function (sAction) {

                                if (
                                    sAction !==
                                    MessageBox.Action.OK
                                ) {

                                    return;

                                }


                                this._updateOnboardingStatus(
                                    oData
                                );

                            }.bind(this)

                    }

                );

            },

            onCompleteOnboarding: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext(
                            "onboarding"
                        );


                if (!oContext) {

                    MessageBox.error(
                        "Onboarding record not found."
                    );

                    return;

                }


                var oData =
                    oContext.getObject();


                var sOnboardId =
                    oData.OnboardId;


                if (!sOnboardId) {

                    MessageBox.error(
                        "Onboarding ID is missing."
                    );

                    return;

                }


                if (
                    String(
                        oData.OnboardingStatus
                    )
                        .toUpperCase() !==
                    "IN_PROGRESS"
                ) {

                    MessageBox.warning(
                        "Only onboarding records in progress can be completed."
                    );

                    return;

                }


                MessageBox.confirm(

                    "Complete onboarding for " +
                    (oData.CandidateName || "") +
                    "?",

                    {

                        title:
                            "Complete Onboarding",

                        actions: [
                            MessageBox.Action.YES,
                            MessageBox.Action.NO
                        ],

                        emphasizedAction:
                            MessageBox.Action.YES,

                        onClose:
                            function (sAction) {

                                if (
                                    sAction !==
                                    MessageBox.Action.YES
                                ) {
                                    return;
                                }


                                this._completeOnboarding(
                                    oData
                                );

                            }.bind(this)

                    }

                );

            },




            _completeOnboarding: function (
                oData
            ) {

                var oModel =
                    this.getOwnerComponent()
                        .getModel();


                var sOnboardId =
                    oData.OnboardId;


                var sPath =
                    oModel.createKey(
                        this.ONBOARDING_ENTITY_SET,
                        {
                            OnboardId:
                                sOnboardId
                        }
                    );


                var oPayload = {

                    OnboardingStatus:
                        "COMPLETED"

                };


                this.getView()
                    .setBusy(true);


                oModel.update(

                    sPath,

                    oPayload,

                    {

                        merge:
                            true,

                        success:
                            function (
                                oUpdatedData
                            ) {

                                this.getView()
                                    .setBusy(false);


                                console.log(
                                    "ONBOARDING COMPLETED:",
                                    oUpdatedData
                                );


                                MessageBox.success(

                                    "Onboarding completed successfully." +
                                    "\n\nCandidate: " +
                                    (
                                        oData.CandidateName ||
                                        ""
                                    ),

                                    {

                                        title:
                                            "Onboarding Completed",

                                        onClose:
                                            function () {

                                                this._loadOnboarding();

                                            }.bind(this)

                                    }

                                );

                            }.bind(this),


                        error:
                            function (
                                oError
                            ) {

                                this.getView()
                                    .setBusy(false);


                                console.error(
                                    "COMPLETE ONBOARDING ERROR:",
                                    oError
                                );


                                MessageBox.error(
                                    this._getODataErrorMessage(
                                        oError,
                                        "Unable to complete onboarding."
                                    )
                                );

                            }.bind(this)

                    }

                );

            },

            _updateOnboardingStatus: function (oData) {

                var oModel =
                    this.getView()
                        .getModel();


                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;
                }


                var sJoiningId =
                    oData.JoiningId;


                var sOnboardId =
                    oData.OnboardId;


                /*
                 * IMPORTANT:
                 * Change this entity name if your
                 * OData entity is different.
                 */

                var sPath =
                    "/OnboardingSet";


                /*
                 * If your entity key is OnboardId:
                 */

                if (sOnboardId) {

                    sPath =
                        "/OnboardingSet('" +
                        encodeURIComponent(
                            sOnboardId
                        ) +
                        "')";

                }


                var oPayload = {

                    OnboardingStatus:
                        "IN_PROGRESS",

                    Comments:
                        oData.Comments || ""

                };


                console.log(
                    "UPDATE ONBOARDING:",
                    sPath,
                    oPayload
                );


                oModel.update(

                    sPath,

                    oPayload,

                    {

                        merge:
                            true,

                        success:
                            function () {

                                MessageToast.show(
                                    "Onboarding started successfully."
                                );


                                /*
                                 * Update local list model
                                 */

                                var oListModel =
                                    this.getView()
                                        .getModel("onboarding");


                                if (oListModel) {

                                    var aItems =
                                        oListModel.getProperty(
                                            "/Items"
                                        ) || [];


                                    aItems.forEach(
                                        function (oItem) {

                                            if (
                                                oItem.OnboardId ===
                                                oData.OnboardId
                                            ) {

                                                oItem.OnboardingStatus =
                                                    "IN_PROGRESS";

                                            }

                                        }
                                    );


                                    oListModel.setProperty(
                                        "/Items",
                                        aItems
                                    );


                                    oListModel.refresh(
                                        true
                                    );

                                }


                                /*
                                 * Update dialog model
                                 */

                                oModel.setProperty(
                                    "/OnboardingStatus",
                                    "IN_PROGRESS"
                                );


                                /*
                                 * Close dialog
                                 */

                                if (
                                    this._oStartOnboardingDialog
                                ) {

                                    this._oStartOnboardingDialog
                                        .close();

                                }


                                /*
                                 * Refresh OData list
                                 */

                                if (
                                    this.getView()
                                        .getModel()
                                ) {

                                    this.getView()
                                        .getModel()
                                        .refresh(
                                            true
                                        );

                                }


                            }.bind(this),

                        error:
                            function (oError) {

                                console.error(
                                    "Start Onboarding Update Error:",
                                    oError
                                );


                                var sMessage =
                                    "Unable to start onboarding.";


                                try {

                                    var oResponse =
                                        JSON.parse(
                                            oError.responseText
                                        );


                                    if (
                                        oResponse.error &&
                                        oResponse.error.message
                                    ) {

                                        sMessage =
                                            oResponse.error.message.value ||
                                            sMessage;

                                    }

                                } catch (e) {

                                    console.error(
                                        "Error parsing OData error:",
                                        e
                                    );

                                }


                                MessageBox.error(
                                    sMessage
                                );

                            }.bind(this)

                    }

                );

            },
            onCloseStartOnboarding: function () {

                if (
                    this._oStartOnboardingDialog
                ) {

                    this._oStartOnboardingDialog.close();

                }

            },

            formatDate: function (
                vDate
            ) {

                if (!vDate) {
                    return "-";
                }


                var oDate;


                if (
                    vDate instanceof Date
                ) {

                    oDate =
                        vDate;

                } else if (
                    typeof vDate === "string"
                ) {

                    var aMatch =
                        vDate.match(
                            /\/Date\((\d+)\)\//
                        );


                    if (aMatch) {

                        oDate =
                            new Date(
                                Number(
                                    aMatch[1]
                                )
                            );

                    } else {

                        /*
                         * YYYYMMDD
                         */
                        if (
                            /^\d{8}$/.test(
                                vDate
                            )
                        ) {

                            oDate =
                                new Date(

                                    Number(
                                        vDate.substring(
                                            0,
                                            4
                                        )
                                    ),

                                    Number(
                                        vDate.substring(
                                            4,
                                            6
                                        )
                                    ) - 1,

                                    Number(
                                        vDate.substring(
                                            6,
                                            8
                                        )
                                    )

                                );

                        } else {

                            oDate =
                                new Date(
                                    vDate
                                );

                        }

                    }

                } else {

                    oDate =
                        new Date(
                            vDate
                        );

                }


                if (
                    !oDate ||
                    isNaN(
                        oDate.getTime()
                    )
                ) {

                    return "-";

                }


                var sDay =
                    String(
                        oDate.getDate()
                    )
                        .padStart(
                            2,
                            "0"
                        );


                var sMonth =
                    String(
                        oDate.getMonth() + 1
                    )
                        .padStart(
                            2,
                            "0"
                        );


                var sYear =
                    oDate.getFullYear();


                return (
                    sDay +
                    "-" +
                    sMonth +
                    "-" +
                    sYear
                );

            },


            formatStatusState: function (
                sStatus
            ) {

                switch (

                String(
                    sStatus || ""
                )
                    .trim()
                    .toUpperCase()

                ) {

                    case "PENDING":

                        return "Warning";


                    case "IN_PROGRESS":

                        return "Information";


                    case "COMPLETED":

                        return "Success";


                    case "CANCELLED":

                        return "Error";


                    default:

                        return "None";

                }

            },



            formatStatusIcon: function (
                sStatus
            ) {

                switch (

                String(
                    sStatus || ""
                )
                    .trim()
                    .toUpperCase()

                ) {

                    case "PENDING":

                        return "sap-icon://pending";


                    case "IN_PROGRESS":

                        return "sap-icon://process";


                    case "COMPLETED":

                        return "sap-icon://accept";


                    case "CANCELLED":

                        return "sap-icon://decline";


                    default:

                        return "sap-icon://question-mark";

                }

            },



            _getODataErrorMessage: function (
                oError,
                sDefaultMessage
            ) {

                var sMessage =
                    sDefaultMessage;


                if (!oError) {
                    return sMessage;
                }


                try {

                    if (
                        oError.responseText
                    ) {

                        var oResponse =
                            JSON.parse(
                                oError.responseText
                            );


                        if (
                            oResponse &&
                            oResponse.error
                        ) {

                            if (
                                typeof
                                oResponse.error.message ===
                                "string"
                            ) {

                                sMessage =
                                    oResponse.error.message;

                            } else if (
                                oResponse.error.message &&
                                oResponse.error.message.value
                            ) {

                                sMessage =
                                    oResponse.error.message.value;

                            }

                        }

                    }

                } catch (e) {

                    console.error(
                        "OData error parsing failed:",
                        e
                    );

                }


                return sMessage;

            },



            onExit: function () {

                if (
                    this._oCreateOnboardingDialog
                ) {

                    this._oCreateOnboardingDialog.destroy();

                    this._oCreateOnboardingDialog =
                        null;

                }


                if (
                    this._oViewOnboardingDialog
                ) {

                    this._oViewOnboardingDialog.destroy();

                    this._oViewOnboardingDialog =
                        null;

                }

            },


            OnnavBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "CandidateDashboard"
                    );

            }

        }

    );

});