sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/m/VBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/Title"

], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    Dialog,
    Button,
    Label,
    Input,
    TextArea,
    VBox,
    SimpleForm,
    Title

) {
    "use strict";

    return Controller.extend("employee.controller.Roles", {

        onInit: function () {

        },

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue") || "";

            var oTable = this.byId("rolesTable");

            if (!oTable) {
                return;
            }

            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }

            if (!sValue) {
                oBinding.filter([]);
                return;
            }

            var oFilter = new Filter({

                filters: [

                    new Filter("RoleId", FilterOperator.Contains, sValue),

                    new Filter("RoleName", FilterOperator.Contains, sValue),

                    new Filter("Description", FilterOperator.Contains, sValue)

                ],

                and: false

            });

            oBinding.filter([oFilter]);

        },

        onRefresh: function () {

            var oSearch = this.byId("searchRole");

            if (oSearch) {
                oSearch.setValue("");
            }

            var oModel = this.getView().getModel();

            oModel.refresh(true);

            var oBinding = this.byId("rolesTable").getBinding("items");

            if (oBinding) {
                oBinding.filter([]);
            }

            MessageToast.show("Roles refreshed.");

        },

        onAdd: function () {

            var oModel = this.getView().getModel();

            // Input Controls
            var oRoleId = new Input({
                placeholder: "e.g. R001",
                maxLength: 10,
                width: "100%"
            });

            var oRoleName = new Input({
                placeholder: "Enter Role Name",
                maxLength: 40,
                width: "100%"
            });

            var oDescription = new TextArea({
                placeholder: "Enter Role Description",
                rows: 4,
                maxLength: 100,
                width: "100%",
                growing: true,
                growingMaxLines: 5
            });

            // Dialog
            var oDialog = new Dialog({

                title: "Create New Role",
                icon: "sap-icon://manager",

                contentWidth: "550px",

                draggable: true,
                resizable: true,

                content: [

                    new sap.ui.layout.form.SimpleForm({

                        editable: true,
                        layout: "ResponsiveGridLayout",

                        columnsXL: 1,
                        columnsL: 1,
                        columnsM: 1,

                        labelSpanXL: 3,
                        labelSpanL: 3,
                        labelSpanM: 3,
                        labelSpanS: 12,

                        emptySpanXL: 0,
                        emptySpanL: 0,
                        emptySpanM: 0,
                        emptySpanS: 0,

                        class: "sapUiResponsiveContentPadding sapUiMediumMargin",

                        content: [

                            new Title({
                                text: "Role Information"
                            }),

                            new Label({
                                text: "Role ID",
                                required: true
                            }),
                            oRoleId,

                            new Label({
                                text: "Role Name",
                                required: true
                            }),
                            oRoleName,

                            new Label({
                                text: "Description"
                            }),
                            oDescription

                        ]

                    })

                ],

                beginButton: new Button({

                    text: "Create",
                    icon: "sap-icon://add",
                    type: "Emphasized",

                    press: function () {

                        var oEntry = {

                            RoleId: oRoleId.getValue().trim(),
                            RoleName: oRoleName.getValue().trim(),
                            Description: oDescription.getValue().trim()

                        };

                        // Validation
                        if (!oEntry.RoleId) {

                            MessageBox.error("Please enter Role ID.");

                            oRoleId.focus();

                            return;
                        }

                        if (!oEntry.RoleName) {

                            MessageBox.error("Please enter Role Name.");

                            oRoleName.focus();

                            return;
                        }

                        // Create Role
                        oModel.create("/RolesSet", oEntry, {

                            success: function () {

                                MessageToast.show("Role created successfully.");

                                oModel.refresh(true);

                                oDialog.close();

                            },

                            error: function () {

                                MessageBox.error("Unable to create role.");

                            }

                        });

                    }

                }),

                endButton: new Button({

                    text: "Cancel",
                    icon: "sap-icon://decline",
                    type: "Transparent",

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

        onView: function (oEvent) {

            var oRole = oEvent.getSource()
                .getBindingContext()
                .getObject();

            MessageBox.information(

                "Role ID : " + oRole.RoleId +
                "\n\nRole Name : " + oRole.RoleName +
                "\n\nDescription : " + oRole.Description,

                {
                    title: "Role Details"
                }

            );

        },

        onEdit: function (oEvent) {

            var oModel = this.getView().getModel();

            var oRole = oEvent.getSource()
                .getBindingContext()
                .getObject();

            // Input Controls
            var oRoleId = new Input({
                value: oRole.RoleId,
                editable: false,
                width: "100%"
            });

            var oRoleName = new Input({
                value: oRole.RoleName,
                maxLength: 40,
                width: "100%"
            });

            var oDescription = new TextArea({
                value: oRole.Description,
                rows: 4,
                maxLength: 100,
                width: "100%",
                growing: true,
                growingMaxLines: 5
            });

            // Dialog
            var oDialog = new Dialog({

                title: "Edit Role",
                icon: "sap-icon://edit",

                contentWidth: "550px",

                draggable: true,
                resizable: true,

                content: [

                    new sap.ui.layout.form.SimpleForm({

                        editable: true,
                        layout: "ResponsiveGridLayout",

                        columnsXL: 1,
                        columnsL: 1,
                        columnsM: 1,

                        labelSpanXL: 3,
                        labelSpanL: 3,
                        labelSpanM: 3,
                        labelSpanS: 12,

                        class: "sapUiResponsiveContentPadding sapUiMediumMargin",

                        content: [

                            new Title({
                                text: "Role Information"
                            }),

                            new Label({
                                text: "Role ID"
                            }),
                            oRoleId,

                            new Label({
                                text: "Role Name",
                                required: true
                            }),
                            oRoleName,

                            new Label({
                                text: "Description"
                            }),
                            oDescription

                        ]

                    })

                ],

                beginButton: new Button({

                    text: "Update",
                    icon: "sap-icon://save",
                    type: "Emphasized",

                    press: function () {

                        var oEntry = {

                            RoleId: oRole.RoleId,
                            RoleName: oRoleName.getValue().trim(),
                            Description: oDescription.getValue().trim()

                        };

                        if (!oEntry.RoleName) {

                            MessageBox.error("Please enter Role Name.");

                            oRoleName.focus();

                            return;

                        }

                        var sPath = "/RolesSet('" + oRole.RoleId + "')";

                        oModel.update(sPath, oEntry, {

                            success: function () {

                                MessageToast.show("Role updated successfully.");

                                oModel.refresh(true);

                                oDialog.close();

                            },

                            error: function () {

                                MessageBox.error("Unable to update role.");

                            }

                        });

                    }

                }),

                endButton: new Button({

                    text: "Cancel",
                    icon: "sap-icon://decline",
                    type: "Transparent",

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

        onDelete: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var sRoleId = oContext.getProperty("RoleId");

            var oModel = this.getView().getModel();

            var sPath = "/RolesSet('" + sRoleId + "')";

            var that = this;

            MessageBox.confirm(
                "Are you sure you want to delete this role?",
                {

                    title: "Delete Role",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    emphasizedAction: MessageBox.Action.YES,

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            oModel.remove(sPath, {

                                success: function () {

                                    MessageToast.show("Role deleted successfully.");

                                    oModel.refresh(true);

                                },

                                error: function (oError) {

                                    console.log(oError);

                                    MessageBox.error("Unable to delete role.");

                                }

                            });

                        }

                    }

                }

            );

        }

    });

});