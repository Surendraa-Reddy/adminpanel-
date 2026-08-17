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
        "employee.controller.recruitment.JoiningConfirmation",
        {

           

            onInit: function () {

                var oJoiningModel = new JSONModel({
                    Items: [],
                    KPI: {
                        Total: 0,
                        Pending: 0,
                        Confirmed: 0,
                        Cancelled: 0
                    }
                });

                this.getView().setModel(
                    oJoiningModel,
                    "joining"
                );

                this._loadJoinings();
            },



            _loadJoinings: function () {

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
                    "/JoiningSet",
                    {

                        success: function (oData) {

                            var aResults =
                                oData.results || [];

                            console.log(
                                "JoiningSet DATA:",
                                aResults
                            );

                            var oJoiningModel =
                                this.getView()
                                    .getModel("joining");

                            oJoiningModel.setProperty(
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
                                "JoiningSet READ ERROR:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to load joining confirmations."
                            );

                        }.bind(this)

                    }
                );
            },




            _calculateKPI: function (aItems) {

                var iTotal = aItems.length;

                var iPending = 0;
                var iConfirmed = 0;
                var iCancelled = 0;

                aItems.forEach(
                    function (oItem) {

                        var sStatus =
                            String(
                                oItem.JoiningStatus || ""
                            )
                                .trim()
                                .toUpperCase();

                        if (sStatus === "PENDING") {
                            iPending++;
                        }

                        if (sStatus === "CONFIRMED") {
                            iConfirmed++;
                        }

                        if (sStatus === "CANCELLED") {
                            iCancelled++;
                        }
                    }
                );

                var oModel =
                    this.getView()
                        .getModel("joining");

                oModel.setProperty(
                    "/KPI/Total",
                    iTotal
                );

                oModel.setProperty(
                    "/KPI/Pending",
                    iPending
                );

                oModel.setProperty(
                    "/KPI/Confirmed",
                    iConfirmed
                );

                oModel.setProperty(
                    "/KPI/Cancelled",
                    iCancelled
                );
            },



            onRefresh: function () {

                this._loadJoinings();

                MessageToast.show(
                    "Joining confirmations refreshed."
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
                    this.byId("joiningTable");

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
                        "JoiningId",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "OfferId",
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
                        "JobId",
                        FilterOperator.Contains,
                        sValue
                    ),

                    new Filter(
                        "JobTitle",
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
                    oEvent.getParameter("selectedItem");

                if (!oSelectedItem) {
                    return;
                }

                var sStatus =
                    oSelectedItem.getKey();

                var oTable =
                    this.byId("joiningTable");

                var oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                if (sStatus === "ALL") {

                    oBinding.filter([]);

                    return;
                }

                oBinding.filter(
                    new Filter(
                        "JoiningStatus",
                        FilterOperator.EQ,
                        sStatus
                    )
                );
            },


            onClearFilters: function () {

                this.byId("joiningSearch")
                    .setValue("");

                this.byId("joiningStatusFilter")
                    .setSelectedKey("ALL");

                var oTable =
                    this.byId("joiningTable");

                var oBinding =
                    oTable.getBinding("items");

                if (oBinding) {
                    oBinding.filter([]);
                }
            },


            onCreateJoining: function () {

                var oCreateModel =
                    new JSONModel({

                        JoiningId: "",

                        OfferId: "",

                        CandidateId: "",

                        CandidateName: "",

                        JobId: "",

                        JobTitle: "",

                        JoiningDate: null,

                        JoiningStatus: "PENDING",

                        Comments: "",

                        Department: "",

                        Location: ""

                    });


                if (!this._oCreateJoiningDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.CreateJoining",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oCreateJoiningDialog =
                                oDialog;

                            this.getView()
                                .addDependent(
                                    oDialog
                                );

                            oDialog.setModel(
                                oCreateModel,
                                "createJoining"
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Create Joining Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to open joining confirmation dialog."
                            );

                        }.bind(this)

                    );

                } else {

                    this._oCreateJoiningDialog
                        .setModel(
                            oCreateModel,
                            "createJoining"
                        );

                    this._oCreateJoiningDialog.open();
                }
            },


            onOfferIdChange: function (oEvent) {

                var sOfferId =
                    oEvent.getParameter("value");

                sOfferId =
                    String(sOfferId || "")
                        .trim()
                        .toUpperCase();

                oEvent.getSource()
                    .setValue(sOfferId);

                var oCreateModel =
                    this._oCreateJoiningDialog
                        .getModel("createJoining");

                if (!sOfferId) {

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
                        "/JoiningDate",
                        null
                    );

                    return;
                }

                this._loadOfferDetails(
                    sOfferId
                );
            },


            _loadOfferDetails: function (sOfferId) {

                var oModel =
                    this.getOwnerComponent().getModel();

                var oCreateModel =
                    this._oCreateJoiningDialog
                        .getModel("createJoining");

                if (!oModel || !oCreateModel) {

                    MessageBox.error(
                        "Joining confirmation model is not available."
                    );

                    return;
                }

                sOfferId =
                    String(sOfferId || "")
                        .trim()
                        .toUpperCase();

                if (!sOfferId) {
                    return;
                }

                this._oCreateJoiningDialog
                    .setBusy(true);

                var sPath =
                    oModel.createKey(
                        "/OfferSet",
                        {
                            OfferId: sOfferId
                        }
                    );

                console.log(
                    "Reading Offer:",
                    sPath
                );

                oModel.read(
                    sPath,
                    {

                        success: function (oOffer) {

                            console.log(
                                "OFFER DATA:",
                                oOffer
                            );

                            var sOfferStatus =
                                String(
                                    oOffer.OfferStatus || ""
                                )
                                    .trim()
                                    .toUpperCase();


                            if (
                                sOfferStatus === "CANCELLED" ||
                                sOfferStatus === "REJECTED"
                            ) {

                                this._oCreateJoiningDialog
                                    .setBusy(false);

                                MessageBox.warning(
                                    "This offer cannot be used for joining confirmation because its status is " +
                                    sOfferStatus +
                                    "."
                                );

                                return;
                            }


                            /*
                             * OFFER ID
                             */

                            oCreateModel.setProperty(
                                "/OfferId",
                                oOffer.OfferId || sOfferId
                            );


                            /*
                             * CANDIDATE
                             */

                            oCreateModel.setProperty(
                                "/CandidateId",
                                oOffer.CandidateId || ""
                            );

                            oCreateModel.setProperty(
                                "/CandidateName",
                                oOffer.CandidateName || ""
                            );


                            /*
                             * JOB
                             */

                            oCreateModel.setProperty(
                                "/JobId",
                                oOffer.JobId || ""
                            );

                            oCreateModel.setProperty(
                                "/JobTitle",
                                oOffer.JobTitle || ""
                            );


                            /*
                             * JOINING DATE
                             */

                            var oJoiningDate =
                                this._convertODataDate(
                                    oOffer.JoiningDate
                                );

                            oCreateModel.setProperty(
                                "/JoiningDate",
                                oJoiningDate
                            );


                            /*
                             * READ CANDIDATE
                             */

                            if (oOffer.CandidateId) {

                                this._loadCandidateDetails(
                                    oOffer.CandidateId
                                );
                            }


                            /*
                             * READ JOB
                             */

                            if (oOffer.JobId) {

                                this._loadJobDetails(
                                    oOffer.JobId
                                );
                            }


                            this._oCreateJoiningDialog
                                .setBusy(false);

                            MessageToast.show(
                                "Offer details loaded successfully."
                            );

                        }.bind(this),

                        error: function (oError) {

                            this._oCreateJoiningDialog
                                .setBusy(false);

                            console.error(
                                "OFFER READ ERROR:",
                                oError
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
                                "/JoiningDate",
                                null
                            );

                            MessageBox.error(
                                "Offer ID '" +
                                sOfferId +
                                "' was not found."
                            );

                        }.bind(this)

                    }
                );
            },



            _loadCandidateDetails: function (
                sCandidateId
            ) {

                var oModel =
                    this.getOwnerComponent().getModel();

                var oCreateModel =
                    this._oCreateJoiningDialog
                        .getModel("createJoining");

                if (!oModel || !oCreateModel) {
                    return;
                }

                sCandidateId =
                    String(sCandidateId || "")
                        .trim()
                        .toUpperCase();

                if (!sCandidateId) {
                    return;
                }

                var sPath =
                    oModel.createKey(
                        "/CandidateSet",
                        {
                            CandidateId:
                                sCandidateId
                        }
                    );

                console.log(
                    "Reading Candidate:",
                    sPath
                );

                oModel.read(
                    sPath,
                    {

                        success: function (
                            oCandidate
                        ) {

                            console.log(
                                "CANDIDATE DATA:",
                                oCandidate
                            );

                            if (
                                oCandidate.CandidateName
                            ) {

                                oCreateModel.setProperty(
                                    "/CandidateName",
                                    oCandidate.CandidateName
                                );
                            }


                            if (
                                oCandidate.JobId
                            ) {

                                oCreateModel.setProperty(
                                    "/JobId",
                                    oCandidate.JobId
                                );
                            }


                            if (
                                oCandidate.JobTitle
                            ) {

                                oCreateModel.setProperty(
                                    "/JobTitle",
                                    oCandidate.JobTitle
                                );
                            }

                        }.bind(this),

                        error: function (oError) {

                            console.error(
                                "CANDIDATE READ ERROR:",
                                oError
                            );

                        }.bind(this)

                    }
                );
            },




            _loadJobDetails: function (
                sJobId
            ) {

                var oModel =
                    this.getOwnerComponent().getModel();

                var oCreateModel =
                    this._oCreateJoiningDialog
                        .getModel("createJoining");

                if (!oModel || !oCreateModel) {
                    return;
                }

                sJobId =
                    String(sJobId || "")
                        .trim()
                        .toUpperCase();

                if (!sJobId) {
                    return;
                }

                var sPath =
                    oModel.createKey(
                        "/JobOpeningSet",
                        {
                            JobId: sJobId
                        }
                    );

                console.log(
                    "Reading Job Opening:",
                    sPath
                );

                oModel.read(
                    sPath,
                    {

                        success: function (oJob) {

                            console.log(
                                "JOB OPENING DATA:",
                                oJob
                            );

                            if (oJob.JobTitle) {

                                oCreateModel.setProperty(
                                    "/JobTitle",
                                    oJob.JobTitle
                                );
                            }

                            if (oJob.JobId) {

                                oCreateModel.setProperty(
                                    "/JobId",
                                    oJob.JobId
                                );
                            }

                            if (
                                oJob.Department
                            ) {

                                oCreateModel.setProperty(
                                    "/Department",
                                    oJob.Department
                                );
                            }

                            if (
                                oJob.Location
                            ) {

                                oCreateModel.setProperty(
                                    "/Location",
                                    oJob.Location
                                );
                            }

                        }.bind(this),

                        error: function (oError) {

                            console.error(
                                "JOB OPENING READ ERROR:",
                                oError
                            );

                        }.bind(this)

                    }
                );
            },


            _convertODataDate: function (vDate) {

                if (!vDate) {
                    return null;
                }

                if (vDate instanceof Date) {
                    return vDate;
                }

                if (
                    typeof vDate === "string"
                ) {

                    var aMatch =
                        vDate.match(
                            /\/Date\((\d+)\)\//
                        );

                    if (aMatch) {

                        return new Date(
                            Number(
                                aMatch[1]
                            )
                        );
                    }

                    var oDate =
                        new Date(vDate);

                    if (
                        !isNaN(
                            oDate.getTime()
                        )
                    ) {

                        return oDate;
                    }
                }

                return null;
            },


            onSaveJoining: function () {

                if (!this._oCreateJoiningDialog) {
                    return;
                }

                var oModel =
                    this.getOwnerComponent()
                        .getModel();

                var oCreateModel =
                    this._oCreateJoiningDialog
                        .getModel(
                            "createJoining"
                        );

                if (!oCreateModel) {

                    MessageBox.error(
                        "Joining data is not available."
                    );

                    return;
                }

                var oData =
                    Object.assign(
                        {},
                        oCreateModel.getData()
                    );

                oData.JoiningId =
                    String(
                        oData.JoiningId || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.OfferId =
                    String(
                        oData.OfferId || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.CandidateId =
                    String(
                        oData.CandidateId || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.JoiningStatus =
                    String(
                        oData.JoiningStatus ||
                        "PENDING"
                    )
                        .trim()
                        .toUpperCase();

                if (!oData.JoiningId) {

                    MessageBox.warning(
                        "Joining ID is required."
                    );

                    return;
                }


                if (
                    oData.JoiningId.length > 10
                ) {

                    MessageBox.warning(
                        "Joining ID cannot exceed 10 characters."
                    );

                    return;
                }


                if (!/^[A-Z0-9]+$/.test(
                    oData.JoiningId
                )) {

                    MessageBox.warning(
                        "Joining ID can contain only letters and numbers."
                    );

                    return;
                }


                if (!oData.OfferId) {

                    MessageBox.warning(
                        "Offer ID is required."
                    );

                    return;
                }


                if (!oData.CandidateId) {

                    MessageBox.warning(
                        "Candidate ID could not be determined from the offer."
                    );

                    return;
                }


                if (!oData.JoiningDate) {

                    MessageBox.warning(
                        "Joining date is required."
                    );

                    return;
                }


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
                        "Please enter a valid joining date."
                    );

                    return;
                }

                delete oData.__metadata;



                delete oData.Department;

                delete oData.Location;


                console.log(
                    "JOINING CREATE PAYLOAD:",
                    oData
                );



                this.getView()
                    .setBusy(true);




                oModel.create(
                    "/JoiningSet",
                    oData,
                    {

                        success: function (
                            oCreatedData
                        ) {

                            this.getView()
                                .setBusy(false);

                            console.log(
                                "JOINING CREATED:",
                                oCreatedData
                            );

                            MessageToast.show(
                                "Joining confirmation created successfully."
                            );

                            this._oCreateJoiningDialog
                                .close();

                            this._loadJoinings();

                        }.bind(this),


                        error: function (oError) {

                            this.getView()
                                .setBusy(false);

                            console.error(
                                "JOINING CREATE ERROR:",
                                oError
                            );

                            var sMessage =
                                "Unable to create joining confirmation.";

                            try {

                                var oResponse =
                                    JSON.parse(
                                        oError.responseText
                                    );

                                if (
                                    oResponse &&
                                    oResponse.error &&
                                    oResponse.error.message
                                ) {

                                    if (
                                        typeof
                                        oResponse.error.message ===
                                        "string"
                                    ) {

                                        sMessage =
                                            oResponse.error.message;

                                    } else if (
                                        oResponse.error.message.value
                                    ) {

                                        sMessage =
                                            oResponse.error.message.value;
                                    }
                                }

                            } catch (e) {

                                console.error(
                                    "Response parsing error:",
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


            onCloseCreateJoining: function () {

                if (
                    this._oCreateJoiningDialog
                ) {

                    this._oCreateJoiningDialog.close();
                }
            },

            onDisplayJoining: function (oEvent) {


                var oContext =
                    oEvent.getSource()
                        .getBindingContext("joining");

                if (!oContext) {

                    MessageBox.error(
                        "Joining confirmation record not found."
                    );

                    return;
                }

                var oData =
                    Object.assign(
                        {},
                        oContext.getObject()
                    );

                console.log(
                    "DISPLAY JOINING DATA:",
                    oData
                );

                var oDisplayModel =
                    new JSONModel(oData);

                if (!this._oDisplayJoiningDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.DisplayJoining",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oDisplayJoiningDialog =
                                oDialog;

                            this.getView()
                                .addDependent(oDialog);

                            oDialog.setModel(
                                oDisplayModel,
                                "displayJoining"
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Display Joining Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to display joining confirmation details."
                            );

                        }.bind(this)

                    );

                } else {

                    this._oDisplayJoiningDialog
                        .setModel(
                            oDisplayModel,
                            "displayJoining"
                        );

                    this._oDisplayJoiningDialog.open();
                }


            },

            onCloseDisplayJoining: function () {


                if (this._oDisplayJoiningDialog) {

                    this._oDisplayJoiningDialog.close();
                }


            },

            onEditJoining: function (oEvent) {

                var oContext = oEvent.getSource()
                    .getBindingContext("joining");

                if (!oContext) {
                    MessageBox.error("Joining record not found.");
                    return;
                }

                var oData = Object.assign({}, oContext.getObject());

                console.log("EDIT JOINING DATA:", oData);

                /* ----------------------------------------------------------
                 * Normalize Status
                 * ---------------------------------------------------------- */

                var sStatus = String(
                    oData.JoiningStatus || "PENDING"
                )
                    .trim()
                    .toUpperCase();


                /* ----------------------------------------------------------
                 * Business Rule
                 *
                 * PENDING    -> Editable
                 * CONFIRMED  -> Not Editable
                 * CANCELLED  -> Not Editable
                 * ---------------------------------------------------------- */

                if (sStatus === "CONFIRMED") {

                    MessageBox.information(
                        "This joining confirmation is already CONFIRMED.\n\n" +
                        "Confirmed joining records cannot be edited."
                    );

                    return;
                }


                if (sStatus === "CANCELLED") {

                    MessageBox.information(
                        "This joining confirmation is CANCELLED.\n\n" +
                        "Cancelled joining records cannot be edited."
                    );

                    return;
                }


                /* ----------------------------------------------------------
                 * Create Edit Model
                 * ---------------------------------------------------------- */

                var oEditModel = new JSONModel({

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
                        oData.JoiningDate || null,

                    JoiningStatus:
                        sStatus,

                    Comments:
                        oData.Comments || ""

                });


                /* ----------------------------------------------------------
                 * Load Edit Fragment
                 * ---------------------------------------------------------- */

                if (!this._oEditJoiningDialog) {

                    Fragment.load({

                        id: this.getView().getId(),

                        name:
                            "employee.view.fragments.EditJoining",

                        controller: this

                    }).then(

                        function (oDialog) {

                            this._oEditJoiningDialog = oDialog;

                            this.getView().addDependent(
                                oDialog
                            );

                            oDialog.setModel(
                                oEditModel,
                                "editJoining"
                            );

                            this._updateEditCommentsRequirement();

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Edit Joining Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to open edit joining dialog."
                            );

                        }.bind(this)
                    );

                } else {

                    this._oEditJoiningDialog.setModel(
                        oEditModel,
                        "editJoining"
                    );

                    this._updateEditCommentsRequirement();

                    this._oEditJoiningDialog.open();
                }
            },

            onEditJoiningStatusChange: function () {

                this._updateEditCommentsRequirement();

            },

            _updateEditCommentsRequirement: function () {

                if (!this._oEditJoiningDialog) {
                    return;
                }

                var oModel =
                    this._oEditJoiningDialog
                        .getModel("editJoining");

                if (!oModel) {
                    return;
                }

                var sStatus =
                    String(
                        oModel.getProperty(
                            "/JoiningStatus"
                        ) || ""
                    )
                        .trim()
                        .toUpperCase();

                var oComments =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "editJoiningComments"
                    );

                var oCommentsLabel =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "editCommentsLabel"
                    );

                if (oComments) {

                    oComments.setPlaceholder(
                        sStatus === "CANCELLED"
                            ? "Enter cancellation reason..."
                            : "Enter comments..."
                    );

                    oComments.setValueState(
                        "None"
                    );
                }

                if (oCommentsLabel) {

                    oCommentsLabel.setRequired(
                        sStatus === "CANCELLED"
                    );
                }
            },

            onUpdateJoining: function () {

                if (!this._oEditJoiningDialog) {
                    return;
                }


                var oModel =
                    this.getOwnerComponent()
                        .getModel();

                var oEditModel =
                    this._oEditJoiningDialog
                        .getModel("editJoining");


                if (!oEditModel) {

                    MessageBox.error(
                        "Joining data is not available."
                    );

                    return;
                }


                var oData =
                    Object.assign(
                        {},
                        oEditModel.getData()
                    );


                /*
                 * ----------------------------------------------------------
                 * Normalize values
                 * ----------------------------------------------------------
                 */

                oData.JoiningId =
                    String(
                        oData.JoiningId || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.OfferId =
                    String(
                        oData.OfferId || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.CandidateId =
                    String(
                        oData.CandidateId || ""
                    )
                        .trim()
                        .toUpperCase();

                oData.JoiningStatus =
                    String(
                        oData.JoiningStatus ||
                        "PENDING"
                    )
                        .trim()
                        .toUpperCase();

                oData.Comments =
                    String(
                        oData.Comments || ""
                    )
                        .trim();


                /*
                 * ----------------------------------------------------------
                 * Required validation
                 * ----------------------------------------------------------
                 */

                if (!oData.JoiningId) {

                    MessageBox.warning(
                        "Joining ID is required."
                    );

                    return;
                }


                if (!oData.JoiningStatus) {

                    MessageBox.warning(
                        "Please select joining status."
                    );

                    return;
                }


                /*
                 * ----------------------------------------------------------
                 * Cancellation validation
                 * ----------------------------------------------------------
                 */

                if (
                    oData.JoiningStatus ===
                    "CANCELLED" &&
                    !oData.Comments
                ) {

                    MessageBox.warning(
                        "Please enter the reason for cancellation."
                    );

                    var oComments =
                        sap.ui.core.Fragment.byId(
                            this.getView().getId(),
                            "editJoiningComments"
                        );

                    if (oComments) {

                        oComments.setValueState(
                            "Error"
                        );

                        oComments.setValueStateText(
                            "Cancellation reason is required."
                        );

                        oComments.focus();
                    }

                    return;
                }


                /*
                 * ----------------------------------------------------------
                 * Date validation
                 * ----------------------------------------------------------
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
                            "Please enter a valid joining date."
                        );

                        return;
                    }
                }


                /*
                 * ----------------------------------------------------------
                 * Prepare payload
                 * ----------------------------------------------------------
                 */

                var oPayload = {

                    JoiningId:
                        oData.JoiningId,

                    OfferId:
                        oData.OfferId,

                    CandidateId:
                        oData.CandidateId,

                    CandidateName:
                        oData.CandidateName,

                    JobId:
                        oData.JobId,

                    JobTitle:
                        oData.JobTitle,

                    JoiningDate:
                        oData.JoiningDate,

                    JoiningStatus:
                        oData.JoiningStatus,

                    Comments:
                        oData.Comments

                };


                console.log(
                    "JOINING UPDATE PAYLOAD:",
                    oPayload
                );


                /*
                 * ----------------------------------------------------------
                 * OData Key
                 * ----------------------------------------------------------
                 */

                var sPath =
                    oModel.createKey(
                        "/JoiningSet",
                        {
                            JoiningId:
                                oData.JoiningId
                        }
                    );


                console.log(
                    "JOINING UPDATE PATH:",
                    sPath
                );




                this.getView()
                    .setBusy(true);


                oModel.update(
                    sPath,
                    oPayload,
                    {

                        merge: true,

                        success: function (
                            oUpdatedData
                        ) {

                            this.getView()
                                .setBusy(false);

                            console.log(
                                "JOINING UPDATED:",
                                oUpdatedData
                            );


                            MessageToast.show(
                                "Joining confirmation updated successfully."
                            );


                            this._oEditJoiningDialog
                                .close();


                            this._loadJoinings();

                        }.bind(this),


                        error: function (oError) {

                            this.getView()
                                .setBusy(false);

                            console.error(
                                "JOINING UPDATE ERROR:",
                                oError
                            );


                            var sMessage =
                                "Unable to update joining confirmation.";


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
                                        oResponse.error &&
                                        oResponse.error.message
                                    ) {

                                        if (
                                            typeof
                                            oResponse.error.message ===
                                            "string"
                                        ) {

                                            sMessage =
                                                oResponse.error.message;

                                        } else if (
                                            oResponse.error.message.value
                                        ) {

                                            sMessage =
                                                oResponse.error.message.value;
                                        }
                                    }
                                }

                            } catch (e) {

                                console.error(
                                    "Update response parsing error:",
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

            onCloseEditJoining: function () {
                if (this._oEditJoiningDialog) {
                    this._oEditJoiningDialog.close();
                }
            },
            onConfirmJoining: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext("joining");

                if (!oContext) {

                    MessageBox.error(
                        "Joining record not found."
                    );

                    return;
                }

                var oData =
                    oContext.getObject();

                var sJoiningId =
                    String(
                        oData.JoiningId || ""
                    ).trim();

                var sStatus =
                    String(
                        oData.JoiningStatus || ""
                    )
                        .trim()
                        .toUpperCase();

                if (!sJoiningId) {

                    MessageBox.error(
                        "Joining ID is missing."
                    );

                    return;
                }

                /* ----------------------------------------------------- */
                /* Only PENDING can be confirmed */
                /* ----------------------------------------------------- */

                if (sStatus !== "PENDING") {

                    MessageBox.warning(
                        "Only pending joining confirmations can be confirmed."
                    );

                    return;
                }

                MessageBox.confirm(

                    "Are you sure you want to confirm joining " +
                    sJoiningId +
                    " for " +
                    (oData.CandidateName || "this candidate") +
                    "?",

                    {

                        title: "Confirm Joining",

                        actions: [
                            MessageBox.Action.YES,
                            MessageBox.Action.NO
                        ],

                        emphasizedAction:
                            MessageBox.Action.YES,

                        onClose: function (sAction) {

                            if (
                                sAction !==
                                MessageBox.Action.YES
                            ) {
                                return;
                            }

                            this._updateJoiningStatus(
                                sJoiningId,
                                "CONFIRMED",
                                oData.Comments || ""
                            );

                        }.bind(this)

                    }
                );
            },

            _updateJoiningStatus: function (
                sJoiningId,
                sNewStatus,
                sComments
            ) {

                var oModel =
                    this.getOwnerComponent()
                        .getModel();

                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;
                }

                var sPath =
                    oModel.createKey(
                        "/JoiningSet",
                        {
                            JoiningId:
                                sJoiningId
                        }
                    );

                var oPayload = {

                    JoiningStatus:
                        sNewStatus,

                    Comments:
                        sComments || ""

                };

                console.log(
                    "JOINING STATUS UPDATE:",
                    sPath,
                    oPayload
                );

                this.getView()
                    .setBusy(true);

                oModel.update(
                    sPath,
                    oPayload,
                    {

                        merge: true,

                        success: function () {

                            this.getView()
                                .setBusy(false);

                            MessageToast.show(
                                "Joining status updated to " +
                                sNewStatus +
                                "."
                            );

                            this._loadJoinings();

                        }.bind(this),

                        error: function (oError) {

                            this.getView()
                                .setBusy(false);

                            console.error(
                                "JOINING STATUS UPDATE ERROR:",
                                oError
                            );

                            var sMessage =
                                "Unable to update joining status.";

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
                                        oResponse.error &&
                                        oResponse.error.message
                                    ) {

                                        if (
                                            typeof oResponse.error.message ===
                                            "string"
                                        ) {

                                            sMessage =
                                                oResponse.error.message;

                                        } else if (
                                            oResponse.error.message.value
                                        ) {

                                            sMessage =
                                                oResponse.error.message.value;
                                        }
                                    }
                                }

                            } catch (e) {

                                console.error(
                                    "Error response parsing:",
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
            onCancelJoining: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext("joining");

                if (!oContext) {

                    MessageBox.error(
                        "Joining record not found."
                    );

                    return;
                }

                var oData =
                    oContext.getObject();

                var sJoiningId =
                    String(
                        oData.JoiningId || ""
                    ).trim();

                var sStatus =
                    String(
                        oData.JoiningStatus || ""
                    )
                        .trim()
                        .toUpperCase();

                if (!sJoiningId) {

                    MessageBox.error(
                        "Joining ID is missing."
                    );

                    return;
                }

                /* ----------------------------------------------------- */
                /* Only PENDING / CONFIRMED can be cancelled */
                /* ----------------------------------------------------- */

                if (
                    sStatus !== "PENDING" &&
                    sStatus !== "CONFIRMED"
                ) {

                    MessageBox.warning(
                        "This joining confirmation cannot be cancelled."
                    );

                    return;
                }

                /* ----------------------------------------------------- */
                /* Create cancellation model */
                /* ----------------------------------------------------- */

                var oCancelModel =
                    new JSONModel({

                        JoiningId:
                            sJoiningId,

                        CandidateName:
                            oData.CandidateName || "",

                        CurrentStatus:
                            sStatus,

                        Comments: ""

                    });

                /* ----------------------------------------------------- */
                /* Load cancellation fragment */
                /* ----------------------------------------------------- */

                if (!this._oCancelJoiningDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.CancelJoining",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oCancelJoiningDialog =
                                oDialog;

                            this.getView()
                                .addDependent(
                                    oDialog
                                );

                            oDialog.setModel(
                                oCancelModel,
                                "cancelJoining"
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "Cancel Joining Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to open cancellation dialog."
                            );

                        }.bind(this)
                    );

                } else {

                    this._oCancelJoiningDialog
                        .setModel(
                            oCancelModel,
                            "cancelJoining"
                        );

                    this._oCancelJoiningDialog.open();
                }
            },
            onSaveCancelJoining: function () {

                if (!this._oCancelJoiningDialog) {
                    return;
                }

                var oCancelModel =
                    this._oCancelJoiningDialog
                        .getModel("cancelJoining");

                if (!oCancelModel) {

                    MessageBox.error(
                        "Cancellation data is not available."
                    );

                    return;
                }

                var oData =
                    oCancelModel.getData();

                var sJoiningId =
                    String(
                        oData.JoiningId || ""
                    ).trim();

                var sComments =
                    String(
                        oData.Comments || ""
                    ).trim();

                /* ----------------------------------------------------- */
                /* Validate comment */
                /* ----------------------------------------------------- */

                if (!sComments) {

                    MessageBox.warning(
                        "Cancellation reason is required."
                    );

                    return;
                }

                if (sComments.length < 5) {

                    MessageBox.warning(
                        "Please enter a meaningful cancellation reason."
                    );

                    return;
                }

                if (sComments.length > 255) {

                    MessageBox.warning(
                        "Cancellation reason cannot exceed 255 characters."
                    );

                    return;
                }

                MessageBox.confirm(

                    "Are you sure you want to cancel joining " +
                    sJoiningId +
                    "?",

                    {

                        title: "Cancel Joining",

                        actions: [
                            MessageBox.Action.YES,
                            MessageBox.Action.NO
                        ],

                        emphasizedAction:
                            MessageBox.Action.YES,

                        onClose: function (sAction) {

                            if (
                                sAction !==
                                MessageBox.Action.YES
                            ) {
                                return;
                            }

                            this._updateJoiningStatus(
                                sJoiningId,
                                "CANCELLED",
                                sComments
                            );

                            this._oCancelJoiningDialog.close();

                        }.bind(this)

                    }
                );
            },

            onCloseCancelJoining: function () {

                if (this._oCancelJoiningDialog) {

                    this._oCancelJoiningDialog.close();

                }
            },


            onViewJoining: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext("joining");

                if (!oContext) {

                    MessageBox.error(
                        "Joining record not found."
                    );

                    return;
                }

                var oData =
                    Object.assign(
                        {},
                        oContext.getObject()
                    );

                var oViewModel =
                    new JSONModel(oData);

                if (!this._oViewJoiningDialog) {

                    Fragment.load({

                        id:
                            this.getView().getId(),

                        name:
                            "employee.view.fragments.ViewJoining",

                        controller:
                            this

                    }).then(

                        function (oDialog) {

                            this._oViewJoiningDialog =
                                oDialog;

                            this.getView()
                                .addDependent(
                                    oDialog
                                );

                            oDialog.setModel(
                                oViewModel,
                                "viewJoining"
                            );

                            oDialog.open();

                        }.bind(this)

                    ).catch(

                        function (oError) {

                            console.error(
                                "View Joining Fragment Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to display joining details."
                            );

                        }.bind(this)
                    );

                } else {

                    this._oViewJoiningDialog
                        .setModel(
                            oViewModel,
                            "viewJoining"
                        );

                    this._oViewJoiningDialog.open();
                }
            },
            onCloseViewJoining: function () {

                if (this._oViewJoiningDialog) {

                    this._oViewJoiningDialog.close();

                }
            },
            isPending: function (sStatus) {

                return String(
                    sStatus || ""
                )
                    .trim()
                    .toUpperCase() === "PENDING";
            },


            isCancellable: function (sStatus) {

                var sValue =
                    String(
                        sStatus || ""
                    )
                        .trim()
                        .toUpperCase();

                return (
                    sValue === "PENDING" ||
                    sValue === "CONFIRMED"
                );
            },

            onKpiTotalPress: function () {

                this.onClearFilters();
            },



            onKpiPendingPress: function () {

                this.byId(
                    "joiningStatusFilter"
                ).setSelectedKey(
                    "PENDING"
                );

                this._applyStatusFilter(
                    "PENDING"
                );
            },



            onKpiConfirmedPress: function () {

                this.byId(
                    "joiningStatusFilter"
                ).setSelectedKey(
                    "CONFIRMED"
                );

                this._applyStatusFilter(
                    "CONFIRMED"
                );
            },


            onKpiCancelledPress: function () {

                this.byId(
                    "joiningStatusFilter"
                ).setSelectedKey(
                    "CANCELLED"
                );

                this._applyStatusFilter(
                    "CANCELLED"
                );
            },


            _applyStatusFilter: function (
                sStatus
            ) {

                var oTable =
                    this.byId(
                        "joiningTable"
                    );

                var oBinding =
                    oTable.getBinding(
                        "items"
                    );

                if (!oBinding) {
                    return;
                }

                oBinding.filter(
                    new Filter(
                        "JoiningStatus",
                        FilterOperator.EQ,
                        sStatus
                    )
                );
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

                        oDate =
                            new Date(vDate);
                    }

                } else {

                    oDate =
                        new Date(vDate);
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
                    ).padStart(
                        2,
                        "0"
                    );

                var sMonth =
                    String(
                        oDate.getMonth() + 1
                    ).padStart(
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

                    case "CONFIRMED":
                        return "Success";

                    case "PENDING":
                        return "Warning";

                    case "CANCELLED":
                        return "Error";

                    default:
                        return "None";
                }
            },


            formatJoiningStatusState: function (sStatus) {

                if (!sStatus) {
                    return "None";
                }

                switch (String(sStatus).toUpperCase()) {

                    case "CONFIRMED":
                        return "Success";

                    case "PENDING":
                        return "Warning";

                    case "REJECTED":
                        return "Error";

                    case "CANCELLED":
                        return "Error";

                    case "JOINED":
                        return "Success";

                    case "IN_PROGRESS":
                        return "Information";

                    default:
                        return "None";
                }
            },


        

            formatJoiningStatusIcon: function (sStatus) {

                if (!sStatus) {
                    return "sap-icon://status-inactive";
                }

                switch (String(sStatus).toUpperCase()) {

                    case "CONFIRMED":
                        return "sap-icon://accept";

                    case "PENDING":
                        return "sap-icon://pending";

                    case "REJECTED":
                        return "sap-icon://decline";

                    case "CANCELLED":
                        return "sap-icon://decline";

                    case "JOINED":
                        return "sap-icon://employee";

                    case "IN_PROGRESS":
                        return "sap-icon://process";

                    default:
                        return "sap-icon://status-inactive";
                }
            },



            onExit: function () {

                if (
                    this._oCreateJoiningDialog
                ) {

                    this._oCreateJoiningDialog.destroy();

                    this._oCreateJoiningDialog =
                        null;
                }
            },
            onNavigateToOnboarding: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("EmployeeOnboarding");

            },
            onNavBack: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "OfferLetter"
                    );

            }

        }

    );
});