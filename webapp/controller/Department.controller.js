sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/ui/core/Icon",
    "sap/m/ObjectStatus",
    "sap/m/MessageBox"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    Dialog,
    Button,
    VBox,
    HBox,
    Text,
    Title,
    Icon,
    ObjectStatus,
    MessageBox
) {
    "use strict";

    return Controller.extend("employee.controller.Department", {

        onInit: function () {
            // OData model already from manifest
        },
        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue") || "";

            var oBinding = this.byId("departmentTable").getBinding("items");

            if (!oBinding) {
                return;
            }

            if (!sValue) {
                oBinding.filter([]);
                return;
            }

            var oFilter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("DeptId", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("DeptName", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("Location", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            });

            oBinding.filter([oFilter]);
        },
        onRefresh: function () {

            var oSearch = this.byId("searchDepartment");
            if (oSearch) {
                oSearch.setValue("");
            }

            var oModel = this.getView().getModel();

            // Reload data from backend
            oModel.refresh(true);

            // Clear filters
            var oBinding = this.byId("departmentTable").getBinding("items");
            if (oBinding) {
                oBinding.filter([]);
            }

            MessageToast.show("Department List Refreshed");
        },



        onAdd: function () {

            var oNav = this.getView().getParent();

            sap.ui.core.mvc.XMLView.create({

                viewName: "employee.view.CreateDepartment"

            }).then(function (oView) {

                oNav.addPage(oView);

                oNav.to(oView);

            });

        },

        onView: function (oEvent) {

            var oDepartment = oEvent.getSource()
                .getBindingContext()
                .getObject();

            var oDialog = new Dialog({

                title: "Department Details",

                contentWidth: "450px",

                draggable: true,

                resizable: true,

                content: [

                    new VBox({

                        class: "sapUiResponsiveMargin",

                        items: [

                            new Title({
                                text: "Department Information"
                            }),

                            new VBox({

                                class: "sapUiLargeMarginBegin",

                                items: [

                                    new HBox({
                                        items: [
                                            new Text({
                                                text: "Department ID : "
                                            }).addStyleClass("sapUiTinyMarginEnd"),

                                            new Text({
                                                text: oDepartment.DeptId
                                            })
                                        ]
                                    }),

                                    new HBox({
                                        items: [
                                            new Text({
                                                text: "Department Name : "
                                            }).addStyleClass("sapUiTinyMarginEnd"),

                                            new Text({
                                                text: oDepartment.DeptName
                                            })
                                        ]
                                    }),

                                    new HBox({
                                        items: [
                                            new Text({
                                                text: "Location : "
                                            }).addStyleClass("sapUiTinyMarginEnd"),

                                            new Text({
                                                text: oDepartment.Location
                                            })
                                        ]
                                    }),

                                    new HBox({
                                        items: [
                                            new Text({
                                                text: "Status : "
                                            }).addStyleClass("sapUiTinyMarginEnd"),

                                            new Text({
                                                text: oDepartment.Status === "1" ? "Active" : "Inactive"
                                            })
                                        ]
                                    })

                                ]

                            })

                        ]

                    })

                ],

                beginButton: new Button({

                    text: "Close",

                    press: function () {

                        oDialog.close();

                    }

                }),

                afterClose: function () {

                    oDialog.destroy();

                }

            });

            oDialog.open();

        },

        onEdit: function (oEvent) {

            var oDepartment = oEvent.getSource()
                .getBindingContext()
                .getObject();

            var oNav = this.getView().getParent();

            sap.ui.core.mvc.XMLView.create({

                viewName: "employee.view.EditDepartment"

            }).then(function (oView) {

                var oModel = new sap.ui.model.json.JSONModel(oDepartment);

                oView.setModel(oModel, "department");

                oNav.addPage(oView);

                oNav.to(oView);

            });

        },

        onDelete: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                MessageBox.error("Unable to determine the selected department.");
                return;
            }

            var sDeptId = oContext.getProperty("DeptId");

            var oModel = this.getView().getModel();

            var sPath = "/DepartmentSet('" + sDeptId + "')";

            var that = this;

            MessageBox.confirm(
                "Are you sure you want to delete Department '" + sDeptId + "'?",
                {
                    title: "Confirm Delete",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    emphasizedAction: MessageBox.Action.YES,

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            oModel.remove(sPath, {

                                success: function () {

                                    MessageToast.show("Department deleted successfully.");

                                    oModel.refresh(true);

                                },

                                error: function (oError) {

                                    console.log(oError);

                                    MessageBox.error("Unable to delete department.");

                                }

                            });

                        }

                    }

                }
            );

        }

    });

});