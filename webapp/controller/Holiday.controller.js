sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (
    Controller,
    Filter,
    FilterOperator,
    JSONModel,
    MessageToast,
    Fragment,
    MessageBox,
    History
) {
    "use strict";

    return Controller.extend("employee.controller.Holiday", {

        onInit: function () {

            var oSummaryModel = new JSONModel({
                Total: 0,
                National: 0,
                Festival: 0,
                State: 0
            });

            this.getView().setModel(oSummaryModel, "summary");

        },


        onSearch: function () {
            this._applyFilters();
        },



        onFilter: function () {
            this._applyFilters();
        },



        _applyFilters: function () {

            var aFilters = [];

            var sSearch = this.byId("searchHoliday").getValue().trim();
            var sYear = this.byId("yearFilter").getSelectedKey();
            var sState = this.byId("stateFilter").getSelectedKey();
            var sType = this.byId("typeFilter").getSelectedKey();


            if (sSearch) {
                aFilters.push(
                    new Filter(
                        "HolidayName",
                        FilterOperator.Contains,
                        sSearch
                    )
                );
            }

            if (sYear) {
                aFilters.push(
                    new Filter(
                        "HolidayYear",
                        FilterOperator.EQ,
                        sYear
                    )
                );
            }

            if (sState) {
                aFilters.push(
                    new Filter(
                        "State",
                        FilterOperator.EQ,
                        sState
                    )
                );
            }


            if (sType) {
                aFilters.push(
                    new Filter(
                        "HolidayType",
                        FilterOperator.EQ,
                        sType
                    )
                );
            }

            var oBinding = this.byId("holidayTable").getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }

        },



        onTableUpdateFinished: function (oEvent) {

            var oBinding = oEvent.getSource().getBinding("items");

            if (!oBinding) {
                return;
            }

            var aContexts = oBinding.getContexts();

            var iTotal = aContexts.length;
            var iNational = 0;
            var iFestival = 0;
            var iState = 0;

            aContexts.forEach(function (oContext) {

                var sType = oContext.getProperty("HolidayType");

                switch (sType) {

                    case "NATIONAL":
                        iNational++;
                        break;

                    case "FESTIVAL":
                        iFestival++;
                        break;

                    case "STATE":
                        iState++;
                        break;

                }

            });

            this.getView().getModel("summary").setData({

                Total: iTotal,
                National: iNational,
                Festival: iFestival,
                State: iState

            });

        },



        onRefresh: function () {

            this.byId("searchHoliday").setValue("");
            this.byId("yearFilter").setSelectedKey("");
            this.byId("stateFilter").setSelectedKey("");
            this.byId("typeFilter").setSelectedKey("");

            var oBinding = this.byId("holidayTable").getBinding("items");

            if (oBinding) {

                oBinding.filter([]);

                oBinding.refresh(true);

            }

            MessageToast.show("Holiday list refreshed");

        },


        onNavBack: function () {


            this.getOwnerComponent()
                .getRouter()
                .navTo("Dashboard", {}, true);



        },


        onAdd: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("CreateHoliday");
        },



        onView: async function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!this._pHolidayDialog) {

                this._pHolidayDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "employee.view.fragments.HolidayDetails",
                    controller: this
                });

                this.getView().addDependent(this._pHolidayDialog);
            }

            this._pHolidayDialog.setBindingContext(oContext);
            this._pHolidayDialog.open();

        },


        onEdit: function (oEvent) {

            var sHolidayId = oEvent.getSource()
                .getBindingContext()
                .getProperty("HolidayId");

            this.getOwnerComponent()
                .getRouter()
                .navTo("EditHoliday", {
                    HolidayId: sHolidayId
                });

        },
        onCloseHolidayDialog: function () {

            this._pHolidayDialog.close();

        },



        onDelete: function (oEvent) {

            var that = this;

            var oContext = oEvent.getSource().getBindingContext();
            var oData = oContext.getObject();

            sap.m.MessageBox.confirm(
                "Are you sure you want to delete holiday '" + oData.HolidayName + "'?",
                {
                    title: "Delete Holiday",
                    icon: sap.m.MessageBox.Icon.WARNING,
                    actions: [
                        sap.m.MessageBox.Action.DELETE,
                        sap.m.MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: sap.m.MessageBox.Action.DELETE,

                    onClose: function (sAction) {

                        if (sAction === sap.m.MessageBox.Action.DELETE) {

                            var oModel = that.getOwnerComponent().getModel();

                            oModel.remove("/HolidaySet('" + oData.HolidayId + "')", {

                                success: function () {

                                    sap.m.MessageToast.show("Holiday deleted successfully.");

                                    that.byId("holidayTable")
                                        .getBinding("items")
                                        .refresh();

                                },

                                error: function (oError) {

                                    console.log(oError);

                                    sap.m.MessageBox.error("Unable to delete Holiday.");

                                }

                            });

                        }

                    }

                }

            );

        },



        onExportCSV: function () {

            var oTable = this.byId("holidayTable");
            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                sap.m.MessageToast.show("No data available.");
                return;
            }

            var aContexts = oBinding.getContexts();

            if (aContexts.length === 0) {
                sap.m.MessageToast.show("No records found.");
                return;
            }

            var sCSV = "";

            // CSV Header
            sCSV += "Holiday ID,Holiday Name,Holiday Date,Holiday Year,State,Holiday Type,Description\n";

            aContexts.forEach(function (oContext) {

                var oData = oContext.getObject();

                var sDate = "";

                if (oData.HolidayDate) {
                    sDate = new Date(oData.HolidayDate).toLocaleDateString("en-GB");
                }

                sCSV += '"' + (oData.HolidayId || "") + '",';
                sCSV += '"' + (oData.HolidayName || "") + '",';
                sCSV += '"' + sDate + '",';
                sCSV += '"' + (oData.HolidayYear || "") + '",';
                sCSV += '"' + (oData.State || "") + '",';
                sCSV += '"' + (oData.HolidayType || "") + '",';
                sCSV += '"' + (oData.Description || "") + '"\n';

            });

            var blob = new Blob([sCSV], {
                type: "text/csv;charset=utf-8;"
            });

            var sFileName = "Holiday_Report.csv";

            if (window.navigator.msSaveBlob) {

                window.navigator.msSaveBlob(blob, sFileName);

            } else {

                var link = document.createElement("a");

                if (link.download !== undefined) {

                    var url = URL.createObjectURL(blob);

                    link.setAttribute("href", url);
                    link.setAttribute("download", sFileName);
                    link.style.visibility = "hidden";

                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);

                    URL.revokeObjectURL(url);
                }
            }

            sap.m.MessageToast.show("CSV exported successfully.");

        },


        onExportPDF: function () {

            var oTable = this.byId("holidayTable");
            var aItems = oTable.getItems();

            if (aItems.length === 0) {
                sap.m.MessageToast.show("No data available to export.");
                return;
            }

            var jsPDF = window.jspdf.jsPDF;
            var doc = new jsPDF("p", "mm", "a4");

            // Header
            doc.setFontSize(18);
            doc.setTextColor(33, 150, 243);
            doc.text("Holiday Report", 14, 18);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Generated On : " + new Date().toLocaleString(), 14, 25);

            // Table Data
            var aBody = [];

            aItems.forEach(function (oItem) {

                var oData = oItem.getBindingContext().getObject();

                var sDate = "";

                if (oData.HolidayDate) {
                    sDate = new Date(oData.HolidayDate).toLocaleDateString("en-GB");
                }

                aBody.push([
                    oData.HolidayId,
                    oData.HolidayName,
                    sDate,
                    oData.HolidayYear,
                    oData.State,
                    oData.HolidayType,
                    oData.Description || ""
                ]);

            });

            doc.autoTable({

                startY: 32,

                head: [[
                    "Holiday ID",
                    "Holiday Name",
                    "Holiday Date",
                    "Year",
                    "State",
                    "Type",
                    "Description"
                ]],

                body: aBody,

                theme: "grid",

                headStyles: {
                    fillColor: [33, 150, 243],
                    textColor: 255,
                    fontStyle: "bold"
                },

                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    valign: "middle"
                },

                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }

            });

            doc.save("Holiday_Report.pdf");

        }

    });

});