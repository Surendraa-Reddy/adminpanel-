sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "employee/model/formatter",
    "sap/ui/core/Fragment"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    formatter,
    Fragment
) {
    "use strict";

    return Controller.extend(
        "employee.controller.recruitment.OfferLetter",
        {

            formatter: formatter,

            onInit: function () {

                var oOfferModel = new JSONModel({
                    Offers: [],
                    AllOffers: []
                });

                this.getView().setModel(
                    oOfferModel,
                    "offer"
                );
                var oCandidateModel = new JSONModel({
                    Candidates: []
                });

                this.getView().setModel(
                    oCandidateModel,
                    "candidate"
                );


                var oJobModel = new JSONModel({
                    Jobs: []
                });

                this.getView().setModel(
                    oJobModel,
                    "job"
                );

                this._sSearchValue = "";
                this._sStatusValue = "";

                this._oCreateDialog = null;
                this._oEditDialog = null;
                this._oViewDialog = null;

                this._loadCandidates();
                this._loadJobs();

                this._loadOffers();

            },
            _loadJobs: function () {

                var oModel =
                    this.getOwnerComponent().getModel();

                oModel.read("/JobOpeningSet", {

                    success: function (oData) {

                        var aJobs =
                            oData.results || [];

                        this.getView()
                            .getModel("job")
                            .setProperty(
                                "/Jobs",
                                aJobs
                            );

                        console.log(
                            "Jobs:",
                            aJobs
                        );

                    }.bind(this),

                    error: function (oError) {

                        console.error(
                            "JobOpeningSet Error:",
                            oError
                        );

                        MessageBox.error(
                            "Unable to load job openings."
                        );
                    }

                });
            },
            _loadCandidates: function () {

                var oModel =
                    this.getOwnerComponent().getModel();

                oModel.read("/CandidateSet", {

                    success: function (oData) {

                        var aCandidates =
                            oData.results || [];

                        this.getView()
                            .getModel("candidate")
                            .setProperty(
                                "/Candidates",
                                aCandidates
                            );

                        console.log(
                            "Candidates:",
                            aCandidates
                        );

                    }.bind(this),

                    error: function (oError) {

                        console.error(
                            "CandidateSet Error:",
                            oError
                        );

                        MessageBox.error(
                            "Unable to load candidates."
                        );
                    }

                });
            },
            _loadOffers: function () {

                var oView = this.getView();

                var oModel =
                    this.getOwnerComponent().getModel();

                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;
                }

                oView.setBusy(true);
                oModel.read(
                    "/OfferSet",
                    {

                        success: function (oData) {

                            oView.setBusy(false);


                            var aResults =
                                oData &&
                                    oData.results
                                    ? oData.results
                                    : [];

                            console.log(
                                "RAW OfferSet DATA:",
                                aResults
                            );


                            var aOffers =
                                aResults.map(
                                    function (oOffer) {

                                        return this._normalizeOffer(
                                            oOffer
                                        );

                                    }.bind(this)
                                );

                            console.log(
                                "NORMALIZED OFFERS:",
                                aOffers
                            );


                            var oOfferModel =
                                oView.getModel("offer");

                            if (!oOfferModel) {

                                console.error(
                                    "Offer JSONModel is not available."
                                );

                                MessageBox.error(
                                    "Offer model is not available."
                                );

                                return;
                            }


                            oOfferModel.setProperty(
                                "/AllOffers",
                                aOffers
                            );


                            oOfferModel.setProperty(
                                "/Offers",
                                aOffers.slice()
                            );


                            this._updateKPIs(
                                aOffers
                            );


                            this._sSearchValue = "";

                            this._sStatusValue = "";


                            var oSearch =
                                this.byId(
                                    "offerSearchField"
                                );

                            if (oSearch) {

                                oSearch.setValue("");
                            }



                            var oStatus =
                                this.byId(
                                    "offerStatusFilter"
                                );

                            if (oStatus) {

                                oStatus.setSelectedKey("");
                            }


                            this._updateOfferCount(
                                aOffers.length
                            );



                            console.log(
                                "TOTAL OFFERS:",
                                aOffers.length
                            );

                            console.log(
                                "OFFER MODEL DATA:",
                                oOfferModel.getData()
                            );

                        }.bind(this),

                        error: function (oError) {

                            oView.setBusy(false);

                            console.error(
                                "OfferSet Read Error:",
                                oError
                            );

                            console.error(
                                "OfferSet Response:",
                                oError &&
                                oError.responseText
                            );

                            MessageBox.error(
                                "Unable to load offer letters."
                            );

                        }.bind(this)

                    }
                );
            },
            _normalizeOffer: function (oOffer) {
                oOffer =
                    oOffer || {};

                var oItem =
                    Object.assign(
                        {},
                        oOffer
                    );
                oItem.Mandt =
                    oOffer.Mandt ||
                    oOffer.MANDT ||
                    oOffer.Client ||
                    oOffer.CLIENT ||
                    "";

                oItem.OfferId =
                    oOffer.OfferId ||
                    oOffer.OfferID ||
                    oOffer.OFFER_ID ||
                    "";
                oItem.CandidateId =
                    oOffer.CandidateId ||
                    oOffer.CandidateID ||
                    oOffer.CANDIDATE_ID ||
                    "";
                oItem.CandidateName =
                    oOffer.CandidateName ||
                    oOffer.Candidate_Name ||
                    oOffer.CANDIDATE_NAME ||
                    "";
                oItem.JobId =
                    oOffer.JobId ||
                    oOffer.JobID ||
                    oOffer.JOB_ID ||
                    "";
                oItem.JobTitle =
                    oOffer.JobTitle ||
                    oOffer.Job_Title ||
                    oOffer.JOB_TITLE ||
                    "";
                oItem.OfferDate =
                    oOffer.OfferDate ||
                    oOffer.OFFER_DATE ||
                    null;

                oItem.JoiningDate =
                    oOffer.JoiningDate ||
                    oOffer.JOINING_DATE ||
                    null;

                if (
                    oOffer.Salary !== undefined &&
                    oOffer.Salary !== null &&
                    oOffer.Salary !== ""
                ) {

                    oItem.Salary =
                        oOffer.Salary;

                } else if (
                    oOffer.SALARY !== undefined &&
                    oOffer.SALARY !== null &&
                    oOffer.SALARY !== ""
                ) {

                    oItem.Salary =
                        oOffer.SALARY;

                } else {

                    oItem.Salary = 0;
                }


                oItem.Waers =
                    oOffer.Waers ||
                    oOffer.WAERS ||
                    oOffer.Currency ||
                    oOffer.CURRENCY ||
                    "INR";
                oItem.Status =
                    oOffer.OfferStatus ||
                    oOffer.OfferStatus ||
                    oOffer.OFFER_STATUS ||
                    oOffer.Offer_Status ||
                    "";

                oItem.Status =
                    String(
                        oItem.Status
                    )
                        .trim()
                        .toUpperCase();

                oItem.OfferType =
                    oOffer.OfferType ||
                    oOffer.OFFER_TYPE ||
                    oOffer.Offer_Type ||
                    "";

                oItem.Comments =
                    oOffer.Comments ||
                    oOffer.COMMENTS ||
                    oOffer.Comment ||
                    oOffer.COMMENT ||
                    oOffer.Remarks ||
                    oOffer.REMARKS ||
                    "";

                oItem.CreatedOn =
                    oOffer.CreatedOn ||
                    oOffer.CREATED_ON ||
                    oOffer.CreatedDate ||
                    oOffer.CREATED_DATE ||
                    null;

                oItem.EmpId =
                    oOffer.EmpId ||
                    oOffer.EMP_ID ||
                    oOffer.CreatedBy ||
                    oOffer.CREATED_BY ||
                    "";
                return oItem;
            },

            _firstValue: function (aValues) {

                for (
                    var i = 0;
                    i < aValues.length;
                    i++
                ) {

                    if (
                        aValues[i] !== undefined &&
                        aValues[i] !== null &&
                        aValues[i] !== ""
                    ) {
                        return aValues[i];
                    }
                }

                return "";
            },

            _updateKPIs: function (aOffers) {

                aOffers = aOffers || [];

                var iTotal = aOffers.length;
                var iOffered = 0;
                var iAccepted = 0;
                var iRejected = 0;

                aOffers.forEach(
                    function (oOffer) {

                        var sStatus =
                            String(
                                oOffer.OfferStatus || ""
                            )
                                .trim()
                                .toUpperCase();

                        switch (sStatus) {

                            case "OFFERED":
                                iOffered++;
                                break;

                            case "ACCEPTED":
                                iAccepted++;
                                break;

                            case "REJECTED":
                                iRejected++;
                                break;

                            default:
                                break;
                        }

                    }
                );

                console.log(
                    "KPI:",
                    {
                        Total: iTotal,
                        Offered: iOffered,
                        Accepted: iAccepted,
                        Rejected: iRejected
                    }
                );

                var oTotal =
                    this.byId("totalOfferKpi");

                if (oTotal) {
                    oTotal.setText(
                        String(iTotal)
                    );
                }

                var oOffered =
                    this.byId("offeredKpi");

                if (oOffered) {
                    oOffered.setText(
                        String(iOffered)
                    );
                }

                var oAccepted =
                    this.byId("acceptedKpi");

                if (oAccepted) {
                    oAccepted.setText(
                        String(iAccepted)
                    );
                }

                var oRejected =
                    this.byId("rejectedKpi");

                if (oRejected) {
                    oRejected.setText(
                        String(iRejected)
                    );
                }
            },

            _updateOfferCount: function (iCount) {

                iCount =
                    Number(iCount) || 0;

                var sText =
                    iCount +
                    (
                        iCount === 1
                            ? " Offer"
                            : " Offers"
                    );

                var oCountText =
                    this.byId(
                        "offerCountText"
                    );

                if (oCountText) {

                    oCountText.setText(
                        sText
                    );
                }

                var oTableStatus =
                    this.byId(
                        "offerTableStatus"
                    );

                if (oTableStatus) {

                    oTableStatus.setText(
                        sText
                    );
                }
            },

            _applyFilters: function () {

                var oOfferModel =
                    this.getView()
                        .getModel("offer");

                if (!oOfferModel) {
                    return;
                }

                var aAllOffers =
                    oOfferModel.getProperty(
                        "/AllOffers"
                    ) || [];

                var sSearch =
                    String(
                        this._sSearchValue || ""
                    )
                        .trim()
                        .toLowerCase();

                var sStatus =
                    String(
                        this._sStatusValue || ""
                    )
                        .trim()
                        .toUpperCase();

                var aFiltered =
                    aAllOffers.filter(
                        function (oOffer) {



                            var bSearchMatch = true;

                            if (sSearch) {

                                var aSearchValues = [

                                    oOffer.OfferId,

                                    oOffer.CandidateId,

                                    oOffer.CandidateName,

                                    oOffer.JobId,

                                    oOffer.JobTitle

                                ];

                                bSearchMatch =
                                    aSearchValues.some(
                                        function (vValue) {

                                            return String(
                                                vValue || ""
                                            )
                                                .toLowerCase()
                                                .indexOf(
                                                    sSearch
                                                ) !== -1;

                                        }
                                    );
                            }



                            var bStatusMatch = true;

                            if (sStatus) {

                                bStatusMatch =
                                    String(
                                        oOffer.OfferStatus || ""
                                    )
                                        .trim()
                                        .toUpperCase() ===
                                    sStatus;
                            }

                            return (
                                bSearchMatch &&
                                bStatusMatch
                            );
                        }
                    );

                oOfferModel.setProperty(
                    "/Offers",
                    aFiltered
                );



                this._updateOfferCount(
                    aFiltered.length
                );

            },
            onSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter(
                        "newValue"
                    );

                if (
                    sValue === undefined
                ) {

                    sValue =
                        oEvent.getParameter(
                            "query"
                        );
                }

                this._sSearchValue =
                    String(
                        sValue || ""
                    );

                this._applyFilters();
            },

            onStatusFilter: function (oEvent) {

                this._sStatusValue =
                    oEvent.getSource()
                        .getSelectedKey();

                this._applyFilters();
            },

            onRefresh: function () {

                this._loadOffers();

                MessageToast.show(
                    "Offer list refreshed."
                );
            },

            onCreateOffer: function () {

                var oSessionModel =
                    this.getOwnerComponent()
                        .getModel("session");

                var oSession =
                    oSessionModel
                        ? oSessionModel.getData()
                        : {};

                var oData = {

                    OfferId: "",

                    CandidateId: "",

                    CandidateName: "",

                    JobId: "",

                    JobTitle: "",

                    OfferDate: "",

                    JoiningDate: "",

                    Salary: "",

                    Waers: "INR",

                    OfferStatus: "DRAFT",

                    OfferType: "FULL_TIME",

                    Comments: "",

                    EmpId:
                        oSession.empId ||
                        oSession.EmpId ||
                        ""
                };

                var oCreateModel =
                    new JSONModel(oData);

                if (!this._oCreateDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.CreateOffer",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oCreateDialog =
                                oDialog;

                            this.getView()
                                .addDependent(
                                    oDialog
                                );

                            oDialog.setModel(
                                oCreateModel,
                                "create"
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Create Offer Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to open Create Offer dialog."
                            );
                        }
                    );

                } else {

                    this._oCreateDialog.setModel(
                        oCreateModel,
                        "create"
                    );

                    this._oCreateDialog.open();
                }
            },
            onCloseCreateOffer: function () {

                if (this._oCreateDialog) {

                    this._oCreateDialog.close();
                }
            },


            onSaveOffer: function () {

                var that = this;


                if (!this._oCreateDialog) {
                    MessageBox.error(
                        "Create Offer dialog is not available."
                    );
                    return;
                }



                var oModel =
                    this.getOwnerComponent().getModel();

                if (!oModel) {
                    MessageBox.error(
                        "OData model is not available."
                    );
                    return;
                }

                var oCreateModel =
                    this._oCreateDialog.getModel("create");

                if (!oCreateModel) {
                    MessageBox.error(
                        "Create offer model is not available."
                    );
                    return;
                }

                var oFormData =
                    oCreateModel.getData() || {};

                console.log("========================================");
                console.log("CREATE OFFER FORM DATA");
                console.log("========================================");
                console.log(oFormData);



                var sFragmentId =
                    this.getView().getId();

                var oCandidateSelect =
                    sap.ui.core.Fragment.byId(
                        sFragmentId,
                        "createCandidateSelect"
                    );

                var oJobSelect =
                    sap.ui.core.Fragment.byId(
                        sFragmentId,
                        "createJobSelect"
                    );

                var oOfferDatePicker =
                    sap.ui.core.Fragment.byId(
                        sFragmentId,
                        "createOfferDate"
                    );

                var oJoiningDatePicker =
                    sap.ui.core.Fragment.byId(
                        sFragmentId,
                        "createJoiningDate"
                    );

                console.log("Candidate Select:", oCandidateSelect);
                console.log("Job Select:", oJobSelect);
                console.log("Offer Date Picker:", oOfferDatePicker);
                console.log("Joining Date Picker:", oJoiningDatePicker);


                var sOfferId =
                    String(
                        oFormData.OfferId || ""
                    )
                        .trim()
                        .toUpperCase();

                if (!sOfferId) {

                    MessageBox.warning(
                        "Please enter Offer ID."
                    );

                    return;
                }

                if (sOfferId.length > 10) {

                    MessageBox.warning(
                        "Offer ID cannot exceed 10 characters."
                    );

                    return;
                }


                var sCandidateId =
                    String(
                        oFormData.CandidateId || ""
                    ).trim();

                if (!sCandidateId) {

                    MessageBox.warning(
                        "Please select Candidate."
                    );

                    if (oCandidateSelect) {

                        oCandidateSelect.setValueState(
                            "Error"
                        );

                        oCandidateSelect.setValueStateText(
                            "Please select a candidate."
                        );
                    }

                    return;
                }

                if (oCandidateSelect) {
                    oCandidateSelect.setValueState("None");
                }



                var sCandidateName =
                    String(
                        oFormData.CandidateName || ""
                    ).trim();

                if (!sCandidateName) {

                    MessageBox.warning(
                        "Candidate Name is required."
                    );

                    return;
                }


                var sJobId =
                    String(
                        oFormData.JobId || ""
                    ).trim();

                if (!sJobId) {

                    MessageBox.warning(
                        "Please select Job Opening."
                    );

                    if (oJobSelect) {

                        oJobSelect.setValueState(
                            "Error"
                        );

                        oJobSelect.setValueStateText(
                            "Please select a job opening."
                        );
                    }

                    return;
                }

                if (oJobSelect) {
                    oJobSelect.setValueState("None");
                }


                var sJobTitle =
                    String(
                        oFormData.JobTitle || ""
                    ).trim();

                if (!sJobTitle) {

                    MessageBox.warning(
                        "Job Title is required."
                    );

                    return;
                }



                var sSalary =
                    String(
                        oFormData.Salary || ""
                    )
                        .trim()
                        .replace(/,/g, "");

                var fSalary =
                    Number(sSalary);

                if (
                    !sSalary ||
                    isNaN(fSalary) ||
                    !isFinite(fSalary) ||
                    fSalary <= 0
                ) {

                    MessageBox.warning(
                        "Please enter a valid Salary."
                    );

                    return;
                }

                // Edm.Decimal(14,3)
                var sFormattedSalary =
                    fSalary.toFixed(3);


                if (!oOfferDatePicker) {

                    MessageBox.error(
                        "Offer Date control is not available."
                    );

                    return;
                }

                var sOfferDateValue =
                    oOfferDatePicker.getValue();

                if (!sOfferDateValue) {

                    MessageBox.warning(
                        "Please select Offer Date."
                    );

                    oOfferDatePicker.setValueState(
                        "Error"
                    );

                    return;
                }

                if (!oOfferDatePicker.isValidValue()) {

                    MessageBox.warning(
                        "Please enter a valid Offer Date."
                    );

                    oOfferDatePicker.setValueState(
                        "Error"
                    );

                    return;
                }

                oOfferDatePicker.setValueState(
                    "None"
                );

                var oOfferDate =
                    oOfferDatePicker.getDateValue();

                if (!oOfferDate) {

                    MessageBox.warning(
                        "Invalid Offer Date."
                    );

                    return;
                }


                if (!oJoiningDatePicker) {

                    MessageBox.error(
                        "Joining Date control is not available."
                    );

                    return;
                }

                var sJoiningDateValue =
                    oJoiningDatePicker.getValue();

                if (!sJoiningDateValue) {

                    MessageBox.warning(
                        "Please select Joining Date."
                    );

                    oJoiningDatePicker.setValueState(
                        "Error"
                    );

                    return;
                }

                if (!oJoiningDatePicker.isValidValue()) {

                    MessageBox.warning(
                        "Please enter a valid Joining Date."
                    );

                    oJoiningDatePicker.setValueState(
                        "Error"
                    );

                    return;
                }

                oJoiningDatePicker.setValueState(
                    "None"
                );

                var oJoiningDate =
                    oJoiningDatePicker.getDateValue();

                if (!oJoiningDate) {

                    MessageBox.warning(
                        "Invalid Joining Date."
                    );

                    return;
                }

                var iOfferDate =
                    new Date(
                        oOfferDate.getFullYear(),
                        oOfferDate.getMonth(),
                        oOfferDate.getDate()
                    ).getTime();

                var iJoiningDate =
                    new Date(
                        oJoiningDate.getFullYear(),
                        oJoiningDate.getMonth(),
                        oJoiningDate.getDate()
                    ).getTime();

                if (iJoiningDate < iOfferDate) {

                    MessageBox.warning(
                        "Joining Date cannot be before Offer Date."
                    );

                    oJoiningDatePicker.setValueState(
                        "Error"
                    );

                    oJoiningDatePicker.setValueStateText(
                        "Joining Date must be on or after Offer Date."
                    );

                    return;
                }

                oJoiningDatePicker.setValueState(
                    "None"
                );
                var sOfferStatus =
                    String(
                        oFormData.OfferStatus ||
                        "DRAFT"
                    )
                        .trim()
                        .toUpperCase();

                var aValidStatuses = [
                    "DRAFT",
                    "OFFERED",
                    "ACCEPTED",
                    "REJECTED"
                ];

                if (
                    aValidStatuses.indexOf(
                        sOfferStatus
                    ) === -1
                ) {
                    sOfferStatus = "DRAFT";
                }

                var sOfferType =
                    String(
                        oFormData.OfferType ||
                        "FULL_TIME"
                    )
                        .trim()
                        .toUpperCase();



                var sWaers =
                    String(
                        oFormData.Waers ||
                        "INR"
                    )
                        .trim()
                        .toUpperCase();



                var sComments =
                    String(
                        oFormData.Comments || ""
                    ).trim();

                // =========================================================
                // ODATA PAYLOAD
                // =========================================================
                //
                // Based exactly on your metadata:
                //
                // OfferId
                // CandidateId
                // CandidateName
                // JobId
                // JobTitle
                // OfferDate
                // JoiningDate
                // Salary
                // Waers
                // OfferStatus
                // OfferType
                // Comments
                //
                // Do NOT send:
                // Mandt
                // CreatedOn
                // EmpId
                // Status
                // =========================================================

                var oPayload = {

                    OfferId: sOfferId,

                    CandidateId: sCandidateId,

                    CandidateName: sCandidateName,

                    JobId: sJobId,

                    JobTitle: sJobTitle,

                    OfferDate: oOfferDate,

                    JoiningDate: oJoiningDate,

                    Salary: sFormattedSalary,

                    Waers: sWaers,

                    OfferStatus: sOfferStatus,

                    OfferType: sOfferType,

                    Comments: sComments
                };

                // =========================================================
                // LOG PAYLOAD
                // =========================================================

                console.log(
                    "========================================"
                );

                console.log(
                    "FINAL OFFER PAYLOAD"
                );

                console.log(
                    "========================================"
                );

                console.log(
                    oPayload
                );



                this.getView().setBusy(true);



                oModel.create(
                    "/OfferSet",
                    oPayload,
                    {

                        success: function (oResponse) {

                            that.getView().setBusy(false);

                            console.log(
                                "========================================"
                            );

                            console.log(
                                "OFFER CREATED SUCCESSFULLY"
                            );

                            console.log(
                                "========================================"
                            );

                            console.log(
                                "Response:",
                                oResponse
                            );

                            MessageToast.show(
                                "Offer created successfully."
                            );

                            // Close dialog

                            if (that._oCreateDialog) {

                                that._oCreateDialog.close();
                            }

                            // Reload offers

                            that._loadOffers();

                        },

                        error: function (oError) {

                            that.getView().setBusy(false);

                            console.error(
                                "========================================"
                            );

                            console.error(
                                "CREATE OFFER FAILED"
                            );

                            console.error(
                                "========================================"
                            );

                            console.error(
                                "Status Code:",
                                oError &&
                                oError.statusCode
                            );

                            console.error(
                                "Response Text:",
                                oError &&
                                oError.responseText
                            );

                            var sMessage =
                                "Unable to create offer.";

                            try {

                                if (
                                    oError &&
                                    oError.responseText
                                ) {

                                    var oErrorResponse =
                                        JSON.parse(
                                            oError.responseText
                                        );

                                    if (
                                        oErrorResponse &&
                                        oErrorResponse.error
                                    ) {

                                        var oErrorObject =
                                            oErrorResponse.error;

                                        if (
                                            oErrorObject.message
                                        ) {

                                            if (
                                                typeof oErrorObject.message ===
                                                "string"
                                            ) {

                                                sMessage =
                                                    oErrorObject.message;

                                            } else if (
                                                oErrorObject.message.value
                                            ) {

                                                sMessage =
                                                    oErrorObject
                                                        .message
                                                        .value;
                                            }
                                        }

                                        if (
                                            oErrorObject.innererror
                                        ) {

                                            console.error(
                                                "SAP Gateway Inner Error:",
                                                oErrorObject.innererror
                                            );
                                        }
                                    }
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
                        }
                    }
                );
            },
            onCandidateChange: function (oEvent) {

                var sCandidateId =
                    oEvent.getSource().getSelectedKey();

                var oCandidateModel =
                    this.getView().getModel("candidate");

                var oCreateModel =
                    this._oCreateDialog.getModel("create");

                if (!sCandidateId || !oCandidateModel || !oCreateModel) {
                    return;
                }

                var aCandidates =
                    oCandidateModel.getProperty("/Candidates") || [];

                var oCandidate =
                    aCandidates.find(function (oCandidate) {
                        return String(oCandidate.CandidateId) ===
                            String(sCandidateId);
                    });

                if (oCandidate) {

                    oCreateModel.setProperty(
                        "/CandidateId",
                        oCandidate.CandidateId
                    );

                    oCreateModel.setProperty(
                        "/CandidateName",
                        oCandidate.CandidateName
                    );
                }
            },
            onJobChange: function (oEvent) {

                var sJobId =
                    oEvent.getSource().getSelectedKey();

                var oJobModel =
                    this.getView().getModel("job");

                var oCreateModel =
                    this._oCreateDialog.getModel("create");

                if (!sJobId || !oJobModel || !oCreateModel) {
                    return;
                }

                var aJobs =
                    oJobModel.getProperty("/Jobs") || [];

                var oJob =
                    aJobs.find(function (oJob) {
                        return String(oJob.JobId) ===
                            String(sJobId);
                    });

                if (oJob) {

                    oCreateModel.setProperty(
                        "/JobId",
                        oJob.JobId
                    );

                    oCreateModel.setProperty(
                        "/JobTitle",
                        oJob.JobTitle
                    );
                }
            },
            onViewOffer: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext(
                            "offer"
                        );

                if (!oContext) {

                    MessageBox.error(
                        "Offer record not found."
                    );

                    return;
                }


                var oOriginalData =
                    oContext.getObject();

                console.log(
                    "VIEW OFFER DATA:",
                    oOriginalData
                );

                var oData =
                    Object.assign(
                        {},
                        oOriginalData
                    );

                var oViewModel =
                    new JSONModel(oData);

                if (!this._oViewDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.OfferDetails",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oViewDialog =
                                oDialog;

                            this.getView()
                                .addDependent(
                                    oDialog
                                );

                            oDialog.setModel(
                                oViewModel,
                                "details"
                            );

                            console.log(
                                "DETAILS MODEL:",
                                oViewModel.getData()
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Offer Details Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to open offer details."
                            );
                        }
                    );

                } else {

                    this._oViewDialog.setModel(
                        oViewModel,
                        "details"
                    );

                    this._oViewDialog.open();
                }
            },

            onCloseOfferDetails: function () {

                if (this._oViewDialog) {

                    this._oViewDialog.close();
                }
            },

            onEditOffer: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext(
                            "offer"
                        );

                if (!oContext) {

                    MessageBox.error(
                        "Offer record not found."
                    );

                    return;
                }

                var oData =
                    Object.assign(
                        {},
                        oContext.getObject()
                    );

                var oEditModel =
                    new JSONModel(oData);

                if (!this._oEditDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.EditOffer",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oEditDialog =
                                oDialog;

                            this.getView()
                                .addDependent(
                                    oDialog
                                );

                            oDialog.setModel(
                                oEditModel,
                                "edit"
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Edit Offer Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to open edit dialog."
                            );
                        }
                    );

                } else {

                    this._oEditDialog.setModel(
                        oEditModel,
                        "edit"
                    );

                    this._oEditDialog.open();
                }
            },

            onUpdateOffer: function () {

                if (!this._oEditDialog) {
                    return;
                }

                var oModel =
                    this.getOwnerComponent().getModel();

                var oEditModel =
                    this._oEditDialog.getModel("edit");

                if (!oEditModel) {

                    MessageBox.error(
                        "Edit data not available."
                    );

                    return;
                }

                var oData =
                    Object.assign(
                        {},
                        oEditModel.getData()
                    );


                delete oData.__metadata;
                delete oData.EmpId;
                delete oData.Status;
                if (!oData.OfferId) {

                    MessageBox.warning(
                        "Offer ID is required."
                    );

                    return;
                }

                oData.OfferStatus =
                    String(
                        oData.OfferStatus || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.OfferType =
                    String(
                        oData.OfferType || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.Waers =
                    String(
                        oData.Waers || "INR"
                    )
                        .trim()
                        .toUpperCase();

                function convertToDate(vDate) {

                    if (!vDate) {
                        return null;
                    }

                    if (vDate instanceof Date) {

                        if (!isNaN(vDate.getTime())) {

                            return new Date(
                                vDate.getTime()
                            );
                        }

                        return null;
                    }



                    if (typeof vDate === "string") {

                        var sDate =
                            vDate.trim();



                        if (
                            /^\d{8}$/.test(sDate)
                        ) {

                            var iYear =
                                Number(
                                    sDate.substring(0, 4)
                                );

                            var iMonth =
                                Number(
                                    sDate.substring(4, 6)
                                );

                            var iDay =
                                Number(
                                    sDate.substring(6, 8)
                                );

                            var oDate =
                                new Date(
                                    iYear,
                                    iMonth - 1,
                                    iDay
                                );

                            if (
                                oDate.getFullYear() === iYear &&
                                oDate.getMonth() === iMonth - 1 &&
                                oDate.getDate() === iDay
                            ) {

                                return oDate;
                            }

                            return null;
                        }



                        if (
                            /^\d{4}-\d{2}-\d{2}$/.test(sDate)
                        ) {

                            var aParts =
                                sDate.split("-");

                            var iYear2 =
                                Number(aParts[0]);

                            var iMonth2 =
                                Number(aParts[1]);

                            var iDay2 =
                                Number(aParts[2]);

                            var oDate2 =
                                new Date(
                                    iYear2,
                                    iMonth2 - 1,
                                    iDay2
                                );

                            if (
                                oDate2.getFullYear() === iYear2 &&
                                oDate2.getMonth() === iMonth2 - 1 &&
                                oDate2.getDate() === iDay2
                            ) {

                                return oDate2;
                            }

                            return null;
                        }
                    }


                    return null;
                }

                if (oData.OfferDate) {

                    var oOfferDate =
                        convertToDate(
                            oData.OfferDate
                        );

                    if (!oOfferDate) {

                        MessageBox.error(
                            "Invalid Offer Date."
                        );

                        return;
                    }

                    oData.OfferDate =
                        oOfferDate;
                }


                if (oData.JoiningDate) {

                    var oJoiningDate =
                        convertToDate(
                            oData.JoiningDate
                        );

                    if (!oJoiningDate) {

                        MessageBox.error(
                            "Invalid Joining Date."
                        );

                        return;
                    }

                    oData.JoiningDate =
                        oJoiningDate;
                }



                if (
                    oData.OfferDate &&
                    oData.JoiningDate
                ) {

                    var dOffer =
                        new Date(
                            oData.OfferDate
                        );

                    var dJoining =
                        new Date(
                            oData.JoiningDate
                        );

                    dOffer.setHours(
                        0, 0, 0, 0
                    );

                    dJoining.setHours(
                        0, 0, 0, 0
                    );

                    if (
                        dJoining < dOffer
                    ) {

                        MessageBox.warning(
                            "Joining Date cannot be before Offer Date."
                        );

                        return;
                    }
                }


                if (oData.Salary !== null && oData.Salary !== undefined && oData.Salary !== "") {
                    var sSalary = String(oData.Salary)
                        .replace(/,/g, "")
                        .trim();
                    var fSalary = Number(sSalary);
                    if (isNaN(fSalary)) {
                        MessageBox.warning("Please enter a valid salary.");
                        return;

                    }
                    if (fSalary < 0) {
                        MessageBox.warning("Salary cannot be negative.");
                        return;
                    }
                    oData.Salary = fSalary.toFixed(2);
                }



                var sPath =
                    oModel.createKey(
                        "/OfferSet",
                        {
                            OfferId:
                                oData.OfferId
                        }
                    );

                console.log(
                    "UPDATE PATH:",
                    sPath
                );

                console.log(
                    "UPDATE PAYLOAD:",
                    oData
                );

                console.log(
                    "OfferDate:",
                    oData.OfferDate,
                    typeof oData.OfferDate,
                    oData.OfferDate instanceof Date
                );

                console.log(
                    "JoiningDate:",
                    oData.JoiningDate,
                    typeof oData.JoiningDate,
                    oData.JoiningDate instanceof Date
                );


                /*
                 * ----------------------------------------------------------
                 * Busy
                 * ----------------------------------------------------------
                 */
                this.getView().setBusy(true);


                /*
                 * ----------------------------------------------------------
                 * Update OData
                 * ----------------------------------------------------------
                 */
                oModel.update(
                    sPath,
                    oData,
                    {

                        merge: true,

                        success: function () {

                            this.getView()
                                .setBusy(false);

                            MessageToast.show(
                                "Offer updated successfully."
                            );

                            this._oEditDialog.close();

                            this._loadOffers();

                        }.bind(this),


                        error: function (oError) {

                            this.getView()
                                .setBusy(false);

                            console.error(
                                "Update Offer Error:",
                                oError
                            );

                            console.error(
                                "Response:",
                                oError &&
                                oError.responseText
                            );


                            var sMessage =
                                "Unable to update offer.";


                            try {

                                var oResponse =
                                    JSON.parse(
                                        oError.responseText
                                    );

                                if (
                                    oResponse &&
                                    oResponse.error &&
                                    oResponse.error.message &&
                                    oResponse.error.message.value
                                ) {

                                    sMessage =
                                        oResponse.error.message.value;
                                }

                            } catch (e) {

                                console.error(
                                    "Error parsing response:",
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

            onCloseEditOffer: function () {

                if (this._oEditDialog) {

                    this._oEditDialog.close();
                }
            },
            onDeleteOffer: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext(
                            "offer"
                        );

                if (!oContext) {

                    MessageBox.error(
                        "Offer record not found."
                    );

                    return;
                }

                var oData =
                    oContext.getObject();

                var sOfferId =
                    oData.OfferId;

                if (!sOfferId) {

                    MessageBox.error(
                        "Offer ID is missing."
                    );

                    return;
                }

                MessageBox.confirm(

                    "Are you sure you want to delete offer " +
                    sOfferId +
                    "?",

                    {

                        title:
                            "Delete Offer",

                        actions: [
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

                                this._deleteOffer(
                                    sOfferId
                                );

                            }.bind(this)
                    }
                );
            },
            _deleteOffer: function (sOfferId) {

                var oModel =
                    this.getOwnerComponent()
                        .getModel();

                var sPath =
                    oModel.createKey(
                        "/OfferSet",
                        {
                            OfferId:
                                sOfferId
                        }
                    );

                this.getView()
                    .setBusy(true);

                oModel.remove(
                    sPath,
                    {

                        success: function () {

                            this.getView()
                                .setBusy(false);

                            MessageToast.show(
                                "Offer deleted successfully."
                            );

                            this._loadOffers();

                        }.bind(this),

                        error: function (oError) {

                            this.getView()
                                .setBusy(false);

                            console.error(
                                "Delete Offer Error:",
                                oError
                            );

                            console.error(
                                "Response:",
                                oError &&
                                oError.responseText
                            );

                            MessageBox.error(
                                "Unable to delete offer."
                            );

                        }.bind(this)

                    }
                );
            },


            onGenerateOfferPDF: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext("offer");

                if (!oContext) {

                    MessageBox.error(
                        "Offer record not found."
                    );

                    return;
                }

                var oData =
                    Object.assign(
                        {},
                        oContext.getObject()
                    );

                console.log(
                    "Offer PDF Data:",
                    oData
                );


                /* ============================================================
                 * CHECK jsPDF
                 * ============================================================ */

                if (
                    !window.jspdf ||
                    !window.jspdf.jsPDF
                ) {

                    MessageBox.error(
                        "PDF library jsPDF is not loaded."
                    );

                    console.error(
                        "jsPDF library not found."
                    );

                    return;
                }


                MessageToast.show(
                    "Generating Offer Letter PDF for " +
                    (oData.OfferId || "")
                );


                /* ============================================================
                 * CREATE PDF
                 * ============================================================ */

                var jsPDF =
                    window.jspdf.jsPDF;

                var oPDF =
                    new jsPDF(
                        "p",
                        "mm",
                        "a4"
                    );


                /* ============================================================
                 * PAGE SETTINGS
                 * ============================================================ */

                var iPageWidth =
                    oPDF.internal.pageSize.getWidth();

                var iPageHeight =
                    oPDF.internal.pageSize.getHeight();

                var iLeft = 16;
                var iRight = 16;

                var iContentWidth =
                    iPageWidth -
                    iLeft -
                    iRight;


                /* ============================================================
                 * HELPER - SAFE VALUE
                 * ============================================================ */

                function safeValue(vValue) {

                    if (
                        vValue === null ||
                        vValue === undefined ||
                        vValue === ""
                    ) {

                        return "-";
                    }

                    return String(vValue);
                }


                /* ============================================================
                 * HELPER - FORMAT DATE
                 * ============================================================ */

                function formatDate(vDate) {

                    if (!vDate) {
                        return "";
                    }

                    var oDate;

                    if (vDate instanceof Date) {

                        oDate =
                            new Date(
                                vDate.getTime()
                            );

                    } else if (
                        typeof vDate === "string"
                    ) {

                        var sDate =
                            vDate.trim();


                        /*
                         * OData Date format
                         * /Date(1754501400000)/
                         */

                        var aMatch =
                            sDate.match(
                                /\/Date\((\d+)\)\//
                            );

                        if (aMatch) {

                            oDate =
                                new Date(
                                    Number(aMatch[1])
                                );

                        } else if (
                            /^\d{8}$/.test(sDate)
                        ) {

                            oDate =
                                new Date(
                                    Number(
                                        sDate.substring(0, 4)
                                    ),
                                    Number(
                                        sDate.substring(4, 6)
                                    ) - 1,
                                    Number(
                                        sDate.substring(6, 8)
                                    )
                                );

                        } else if (
                            /^\d{4}-\d{2}-\d{2}$/.test(sDate)
                        ) {

                            var aParts =
                                sDate.split("-");

                            oDate =
                                new Date(
                                    Number(aParts[0]),
                                    Number(aParts[1]) - 1,
                                    Number(aParts[2])
                                );

                        } else {

                            oDate =
                                new Date(sDate);
                        }

                    } else {

                        oDate =
                            new Date(vDate);
                    }


                    if (
                        !oDate ||
                        isNaN(oDate.getTime())
                    ) {

                        return "";
                    }


                    var sDay =
                        String(
                            oDate.getDate()
                        ).padStart(2, "0");

                    var sMonth =
                        String(
                            oDate.getMonth() + 1
                        ).padStart(2, "0");

                    var sYear =
                        oDate.getFullYear();


                    return (
                        sDay +
                        "-" +
                        sMonth +
                        "-" +
                        sYear
                    );
                }


                /* ============================================================
                 * HELPER - FORMAT SALARY
                 * ============================================================ */

                function formatSalary(
                    vSalary,
                    sCurrency
                ) {

                    if (
                        vSalary === null ||
                        vSalary === undefined ||
                        vSalary === ""
                    ) {

                        return "0.00";
                    }


                    var fSalary =
                        Number(
                            String(vSalary)
                                .replace(/,/g, "")
                                .trim()
                        );


                    if (isNaN(fSalary)) {

                        return String(vSalary);
                    }


                    return (
                        sCurrency +
                        " " +
                        fSalary.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )
                    );
                }


                /* ============================================================
                 * DATA
                 * ============================================================ */

                var sOfferId =
                    safeValue(
                        oData.OfferId
                    );

                var sCandidateName =
                    safeValue(
                        oData.CandidateName
                    );

                var sCandidateId =
                    safeValue(
                        oData.CandidateId
                    );

                var sJobId =
                    safeValue(
                        oData.JobId
                    );

                var sJobTitle =
                    safeValue(
                        oData.JobTitle
                    );

                var sOfferDate =
                    formatDate(
                        oData.OfferDate
                    );

                var sJoiningDate =
                    formatDate(
                        oData.JoiningDate
                    );

                var sCurrency =
                    safeValue(
                        oData.Waers || "INR"
                    ).toUpperCase();

                var sSalary =
                    formatSalary(
                        oData.Salary,
                        sCurrency
                    );

                var sOfferType =
                    safeValue(
                        oData.OfferType
                    );

                var sOfferStatus =
                    safeValue(
                        oData.OfferStatus
                    );

                var sComments =
                    safeValue(
                        oData.Comments
                    );


                /* ============================================================
                 * COLORS
                 * ============================================================ */

                var aPrimary =
                    [31, 78, 121];

                var aDark =
                    [45, 45, 45];

                var aGray =
                    [105, 105, 105];

                var aLightGray =
                    [245, 247, 249];

                var aBorder =
                    [210, 214, 218];


                /* ============================================================
                 * HEADER
                 * ============================================================ */

                oPDF.setFillColor(
                    aPrimary[0],
                    aPrimary[1],
                    aPrimary[2]
                );

                oPDF.rect(
                    0,
                    0,
                    iPageWidth,
                    28,
                    "F"
                );


                oPDF.setTextColor(
                    255,
                    255,
                    255
                );

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.setFontSize(
                    18
                );

                oPDF.text(
                    "YOUR COMPANY",
                    iLeft,
                    12
                );


                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.setFontSize(
                    8.5
                );

                oPDF.text(
                    "Human Resources Department",
                    iLeft,
                    19
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.setFontSize(
                    9
                );

                oPDF.text(
                    "OFFER LETTER",
                    iPageWidth - iRight,
                    16,
                    {
                        align: "right"
                    }
                );


                /* ============================================================
                 * TITLE
                 * ============================================================ */

                var iCurrentY = 39;


                oPDF.setTextColor(
                    aDark[0],
                    aDark[1],
                    aDark[2]
                );

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.setFontSize(
                    15
                );

                oPDF.text(
                    "Employment Offer Letter",
                    iLeft,
                    iCurrentY
                );


                iCurrentY += 7;


                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.setFontSize(
                    8.5
                );

                oPDF.setTextColor(
                    aGray[0],
                    aGray[1],
                    aGray[2]
                );


                oPDF.text(
                    "Offer ID: " + sOfferId,
                    iLeft,
                    iCurrentY
                );


                oPDF.text(
                    "Offer Date: " + sOfferDate,
                    iPageWidth - iRight,
                    iCurrentY,
                    {
                        align: "right"
                    }
                );


                /* ============================================================
                 * GREETING
                 * ============================================================ */

                iCurrentY += 11;


                oPDF.setTextColor(
                    aDark[0],
                    aDark[1],
                    aDark[2]
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.setFontSize(
                    9.5
                );

                oPDF.text(
                    "Dear " + sCandidateName + ",",
                    iLeft,
                    iCurrentY
                );


                iCurrentY += 6;


                var aIntroText =
                    oPDF.splitTextToSize(
                        "We are pleased to offer you employment with our organization. " +
                        "Following the successful completion of our selection process, " +
                        "we are delighted to offer you the position outlined below.",
                        iContentWidth
                    );


                oPDF.setFontSize(
                    8.7
                );

                oPDF.text(
                    aIntroText,
                    iLeft,
                    iCurrentY
                );


                iCurrentY +=
                    (aIntroText.length * 4) + 6;


                /* ============================================================
                 * OFFER SUMMARY HEADER
                 * ============================================================ */

                oPDF.setFillColor(
                    aPrimary[0],
                    aPrimary[1],
                    aPrimary[2]
                );

                oPDF.roundedRect(
                    iLeft,
                    iCurrentY,
                    iContentWidth,
                    7,
                    1.5,
                    1.5,
                    "F"
                );


                oPDF.setTextColor(
                    255,
                    255,
                    255
                );

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.setFontSize(
                    9
                );

                oPDF.text(
                    "OFFER SUMMARY",
                    iLeft + 4,
                    iCurrentY + 4.8
                );


                iCurrentY += 7;


                /* ============================================================
                 * OFFER SUMMARY BOX
                 * ============================================================ */

                var iSummaryHeight = 47;


                oPDF.setFillColor(
                    aLightGray[0],
                    aLightGray[1],
                    aLightGray[2]
                );

                oPDF.setDrawColor(
                    aBorder[0],
                    aBorder[1],
                    aBorder[2]
                );

                oPDF.roundedRect(
                    iLeft,
                    iCurrentY,
                    iContentWidth,
                    iSummaryHeight,
                    1.5,
                    1.5,
                    "FD"
                );


                var iCol1 =
                    iLeft + 5;

                var iCol2 =
                    iLeft + 102;

                var iValue1 =
                    iLeft + 39;

                var iValue2 =
                    iLeft + 136;


                var iRow1 =
                    iCurrentY + 9;

                var iRow2 =
                    iCurrentY + 19;

                var iRow3 =
                    iCurrentY + 29;

                var iRow4 =
                    iCurrentY + 39;


                oPDF.setTextColor(
                    aDark[0],
                    aDark[1],
                    aDark[2]
                );

                oPDF.setFontSize(
                    8.2
                );


                /* Row 1 */

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Candidate Name",
                    iCol1,
                    iRow1
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sCandidateName,
                    iValue1,
                    iRow1
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Candidate ID",
                    iCol2,
                    iRow1
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sCandidateId,
                    iValue2,
                    iRow1
                );


                /* Row 2 */

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Job Title",
                    iCol1,
                    iRow2
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sJobTitle,
                    iValue1,
                    iRow2
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Job ID",
                    iCol2,
                    iRow2
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sJobId,
                    iValue2,
                    iRow2
                );


                /* Row 3 */

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Joining Date",
                    iCol1,
                    iRow3
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sJoiningDate,
                    iValue1,
                    iRow3
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Employment Type",
                    iCol2,
                    iRow3
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sOfferType,
                    iValue2,
                    iRow3
                );


                /* Row 4 */

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Salary",
                    iCol1,
                    iRow4
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sSalary,
                    iValue1,
                    iRow4
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Offer Status",
                    iCol2,
                    iRow4
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sOfferStatus,
                    iValue2,
                    iRow4
                );


                iCurrentY +=
                    iSummaryHeight + 7;


                /* ============================================================
                 * TERMS OF EMPLOYMENT
                 * ============================================================ */

                oPDF.setTextColor(
                    aPrimary[0],
                    aPrimary[1],
                    aPrimary[2]
                );

                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.setFontSize(
                    10.5
                );

                oPDF.text(
                    "Terms of Employment",
                    iLeft,
                    iCurrentY
                );


                iCurrentY += 6;


                oPDF.setTextColor(
                    aDark[0],
                    aDark[1],
                    aDark[2]
                );

                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.setFontSize(
                    8.2
                );


                var aTerms = [

                    "1. You will be employed in the position of " +
                    sJobTitle + ".",

                    "2. Your expected joining date is " +
                    sJoiningDate + ".",

                    "3. Your offered compensation is " +
                    sSalary + ".",

                    "4. This offer is subject to the organization's " +
                    "employment policies and applicable terms and conditions.",

                    "5. You are expected to comply with all company policies, " +
                    "procedures and applicable rules during your employment."

                ];


                aTerms.forEach(
                    function (sTerm) {

                        var aLines =
                            oPDF.splitTextToSize(
                                sTerm,
                                iContentWidth
                            );

                        oPDF.text(
                            aLines,
                            iLeft,
                            iCurrentY
                        );

                        iCurrentY +=
                            (aLines.length * 3.8) + 2.5;
                    }
                );


                /* ============================================================
                 * COMMENTS
                 * ============================================================ */

                if (
                    sComments &&
                    sComments !== "-"
                ) {

                    iCurrentY += 2;


                    oPDF.setTextColor(
                        aPrimary[0],
                        aPrimary[1],
                        aPrimary[2]
                    );

                    oPDF.setFont(
                        "helvetica",
                        "bold"
                    );

                    oPDF.setFontSize(
                        9.5
                    );

                    oPDF.text(
                        "Additional Comments",
                        iLeft,
                        iCurrentY
                    );


                    iCurrentY += 5;


                    oPDF.setTextColor(
                        aDark[0],
                        aDark[1],
                        aDark[2]
                    );

                    oPDF.setFont(
                        "helvetica",
                        "normal"
                    );

                    oPDF.setFontSize(
                        8.2
                    );


                    var aComments =
                        oPDF.splitTextToSize(
                            sComments,
                            iContentWidth
                        );


                    /*
                     * Limit comments to avoid
                     * pushing signature to page 2.
                     */

                    if (aComments.length > 2) {

                        aComments =
                            aComments.slice(
                                0,
                                2
                            );

                        if (
                            aComments[1] &&
                            aComments[1].length > 3
                        ) {

                            aComments[1] =
                                aComments[1].replace(
                                    /\s+$/,
                                    ""
                                ) +
                                "...";
                        }
                    }


                    oPDF.text(
                        aComments,
                        iLeft,
                        iCurrentY
                    );


                    iCurrentY +=
                        (aComments.length * 3.8) + 4;
                }


                /* ============================================================
                 * CLOSING
                 * ============================================================ */

                var aClosing =
                    oPDF.splitTextToSize(
                        "We look forward to welcoming you to our organization " +
                        "and wish you every success in your new role.",
                        iContentWidth
                    );


                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.setFontSize(
                    8.5
                );

                oPDF.setTextColor(
                    aDark[0],
                    aDark[1],
                    aDark[2]
                );


                oPDF.text(
                    aClosing,
                    iLeft,
                    iCurrentY
                );


                /* ============================================================
                 * SIGNATURE SECTION
                 * ============================================================ */

                var iSignatureY =
                    iPageHeight - 35;


                oPDF.setDrawColor(
                    150,
                    150,
                    150
                );


                /*
                 * Authorized Signatory
                 */

                oPDF.line(
                    iLeft,
                    iSignatureY,
                    iLeft + 48,
                    iSignatureY
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.setFontSize(
                    8
                );

                oPDF.setTextColor(
                    aDark[0],
                    aDark[1],
                    aDark[2]
                );

                oPDF.text(
                    "Authorized Signatory",
                    iLeft,
                    iSignatureY + 5
                );


                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    "Human Resources",
                    iLeft,
                    iSignatureY + 9
                );


                /*
                 * Candidate Signature
                 */

                var iCandidateSignatureX =
                    iPageWidth -
                    iRight -
                    48;


                oPDF.line(
                    iCandidateSignatureX,
                    iSignatureY,
                    iPageWidth - iRight,
                    iSignatureY
                );


                oPDF.setFont(
                    "helvetica",
                    "bold"
                );

                oPDF.text(
                    "Candidate Signature",
                    iCandidateSignatureX,
                    iSignatureY + 5
                );


                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.text(
                    sCandidateName,
                    iCandidateSignatureX,
                    iSignatureY + 9
                );


                /* ============================================================
                 * FOOTER
                 * ============================================================ */

                var iFooterY =
                    iPageHeight - 17;


                oPDF.setDrawColor(
                    205,
                    205,
                    205
                );


                oPDF.line(
                    iLeft,
                    iFooterY - 3,
                    iPageWidth - iRight,
                    iFooterY - 3
                );


                oPDF.setFont(
                    "helvetica",
                    "normal"
                );

                oPDF.setFontSize(
                    7
                );

                oPDF.setTextColor(
                    120,
                    120,
                    120
                );


                oPDF.text(
                    "This is a system-generated offer letter.",
                    iLeft,
                    iFooterY + 2
                );


                oPDF.text(
                    "Offer ID: " + sOfferId,
                    iPageWidth - iRight,
                    iFooterY + 2,
                    {
                        align: "right"
                    }
                );


                /* ============================================================
                 * SAVE PDF
                 * ============================================================ */

                var sSafeCandidateName =
                    sCandidateName
                        .replace(
                            /[^a-zA-Z0-9]/g,
                            "_"
                        );


                var sFileName =
                    "Offer_Letter_" +
                    sOfferId +
                    "_" +
                    sSafeCandidateName +
                    ".pdf";


                oPDF.save(
                    sFileName
                );


                MessageToast.show(
                    "Offer letter PDF generated successfully."
                );
            },
            onNavigateToJoiningConfirmation: function (){
                this.getOwnerComponent().getRouter().navTo("JoiningConfirmation")
            },
            onNavBack: function () {

              onNavBack
            }

        }
    );
});