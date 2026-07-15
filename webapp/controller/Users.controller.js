sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet"
], function (
    Controller,
    Dialog,
    Button,
    Input,
    Label,
    Select,
    Item,
    MessageToast,
    MessageBox,
    SimpleForm,
    BusyIndicator,
    JSONModel,
    Spreadsheet
) {

    "use strict";

    return Controller.extend("employee.controller.Users", {



        onInit: function () {

            this._bEdit = false;
            this._sUserPath = "";

            this._loadUsers();

        },

       

        onAdd: function () {

            var that = this;

            if (!this.oDialog) {

                this.oDialog = new Dialog({

                    title: "Create New User",
                    icon: "sap-icon://add-contact",
                    contentWidth: "500px",
                    draggable: true,
                    resizable: true,

                    content: [

                        new SimpleForm({

                            editable: true,
                            layout: "ResponsiveGridLayout",

                            labelSpanXL: 4,
                            labelSpanL: 4,
                            labelSpanM: 4,
                            labelSpanS: 12,

                            columnsXL: 1,
                            columnsL: 1,
                            columnsM: 1,

                            content: [

                                new Label({
                                    text: "Username",
                                    required: true
                                }),

                                new Input("userName", {
                                    width: "100%",
                                    placeholder: "Enter Username"
                                }),

                                new Label({
                                    text: "Password",
                                    required: true
                                }),

                                new Input("password", {
                                    width: "100%",
                                    type: "Password",
                                    placeholder: "Enter Password"
                                }),

                                new Label({
                                    text: "Employee ID",
                                    required: true
                                }),

                                new Input("empId", {
                                    width: "100%",
                                    placeholder: "EMP001"
                                }),

                                new Label({
                                    text: "Employee Name",
                                    required: true
                                }),

                                new Input("name", {
                                    width: "100%",
                                    placeholder: "Employee Name"
                                }),

                                new Label({
                                    text: "Role",
                                    required: true
                                }),

                                new Select("role", {

                                    width: "100%",
                                    selectedKey: "EMPLOYEE",

                                    items: [

                                        new Item({
                                            key: "ADMIN",
                                            text: "Administrator"
                                        }),

                                        new Item({
                                            key: "HR",
                                            text: "HR"
                                        }),

                                        new Item({
                                            key: "MANAGER",
                                            text: "Manager"
                                        }),

                                        new Item({
                                            key: "EMPLOYEE",
                                            text: "Employee"
                                        })

                                    ]

                                }),

                                new Label({
                                    text: "Status",
                                    required: true
                                }),

                                new Select("status", {

                                    width: "100%",
                                    selectedKey: "1",

                                    items: [

                                        new Item({
                                            key: "1",
                                            text: "Active"
                                        }),

                                        new Item({
                                            key: "0",
                                            text: "Inactive"
                                        })

                                    ]

                                })

                            ]

                        })

                    ],

                    beginButton: new Button({

                        type: "Emphasized",
                        text: "Create User",
                        icon: "sap-icon://save",

                        press: function () {

                            if (that._bEdit) {
                                that._updateUser();
                            } else {
                                that._saveUser();
                            }

                        }

                    }),

                    endButton: new Button({

                        text: "Cancel",
                        icon: "sap-icon://decline",

                        press: function () {
                            that.oDialog.close();
                        }

                    })

                });

            }

            // Create Mode

            this._bEdit = false;

            this.oDialog.setTitle("Create New User");

            this.oDialog.getBeginButton()
                .setText("Create User")
                .setIcon("sap-icon://save");

            this._clearDialog();

            sap.ui.getCore().byId("userName").setEditable(true);

            this.oDialog.open();

        },


        _saveUser: function () {

            if (!this._validate()) {
                return;
            }

            var oPayload = {

                Username: sap.ui.getCore().byId("userName").getValue().trim(),
                Password: sap.ui.getCore().byId("password").getValue().trim(),
                EmpId: sap.ui.getCore().byId("empId").getValue().trim(),
                Name: sap.ui.getCore().byId("name").getValue().trim(),
                Role: sap.ui.getCore().byId("role").getSelectedKey(),
                Status: sap.ui.getCore().byId("status").getSelectedKey()

            };

            var that = this;

            BusyIndicator.show(0);

            this.getOwnerComponent().getModel().create("/UsersSet", oPayload, {

                success: function () {

                    BusyIndicator.hide();

                    MessageToast.show("User Created Successfully");

                    that.oDialog.close();

                    that._loadUsers();

                },

                error: function (oError) {

                    BusyIndicator.hide();

                    var sMsg = "Unable to Create User";

                    try {

                        sMsg = JSON.parse(oError.responseText)
                            .error.message.value;

                    } catch (e) { }

                    MessageBox.error(sMsg);

                }

            });

        },

       

        _validate: function () {

            var bValid = true;

            var aInputs = [

                sap.ui.getCore().byId("userName"),
                sap.ui.getCore().byId("password"),
                sap.ui.getCore().byId("empId"),
                sap.ui.getCore().byId("name")

            ];

            aInputs.forEach(function (oInput) {

                oInput.setValueState("None");

                if (!oInput.getValue().trim()) {

                    oInput.setValueState("Error");
                    bValid = false;

                }

            });

            return bValid;

        },


        /* Clear Dialog                                              */
        /*==========================================================*/

        _clearDialog: function () {

            sap.ui.getCore().byId("userName").setValue("");
            sap.ui.getCore().byId("password").setValue("");
            sap.ui.getCore().byId("empId").setValue("");
            sap.ui.getCore().byId("name").setValue("");

            sap.ui.getCore().byId("role").setSelectedKey("EMPLOYEE");
            sap.ui.getCore().byId("status").setSelectedKey("1");

            sap.ui.getCore().byId("userName").setEditable(true);

            sap.ui.getCore().byId("userName").setValueState("None");
            sap.ui.getCore().byId("password").setValueState("None");
            sap.ui.getCore().byId("empId").setValueState("None");
            sap.ui.getCore().byId("name").setValueState("None");

        },
       
        onEdit: function (oEvent) {

            if (!this.oDialog) {
                this.onAdd();
                this.oDialog.close();
            }

            var oContext = oEvent.getSource().getBindingContext("users");

            if (!oContext) {
                oContext = oEvent.getSource().getParent().getBindingContext("users");
            }

            if (!oContext) {
                MessageBox.error("Unable to determine selected row.");
                return;
            }

            var oData = oContext.getObject();

            sap.ui.getCore().byId("userName").setValue(oData.Username);
            sap.ui.getCore().byId("password").setValue(oData.Password);
            sap.ui.getCore().byId("empId").setValue(oData.EmpId);
            sap.ui.getCore().byId("name").setValue(oData.Name);
            sap.ui.getCore().byId("role").setSelectedKey(oData.Role);
            sap.ui.getCore().byId("status").setSelectedKey(oData.Status);
            //console.log(oData);
           // console.log(oData.Password);

            // Username should not change
            sap.ui.getCore().byId("userName").setEditable(false);

            this._bEdit = true;

            var oModel = this.getOwnerComponent().getModel();

            this._sUserPath = oModel.createKey("/UsersSet", {
                Username: oData.Username
            });

            this.oDialog.setTitle("Edit User");

            this.oDialog.getBeginButton()
                .setText("Update User")
                .setIcon("sap-icon://edit");

            this.oDialog.open();


        },



        _updateUser: function () {

            if (!this._validate()) {
                return;
            }

            var oPayload = {

                Username: sap.ui.getCore().byId("userName").getValue().trim(),
                Password: sap.ui.getCore().byId("password").getValue().trim(),
                EmpId: sap.ui.getCore().byId("empId").getValue().trim(),
                Name: sap.ui.getCore().byId("name").getValue().trim(),
                Role: sap.ui.getCore().byId("role").getSelectedKey(),
                Status: sap.ui.getCore().byId("status").getSelectedKey()

            };

            var that = this;

            BusyIndicator.show(0);

            this.getOwnerComponent().getModel().update(

                this._sUserPath,
                oPayload,

                {

                    merge: true,

                    success: function () {

                        BusyIndicator.hide();

                        MessageToast.show("User Updated Successfully");

                        that.oDialog.close();

                        sap.ui.getCore().byId("userName").setEditable(true);

                        that._loadUsers();

                    },

                    error: function (oError) {

                        BusyIndicator.hide();

                        sap.ui.getCore().byId("userName").setEditable(true);

                        var sMsg = "Unable to Update User";

                        try {

                            sMsg = JSON.parse(oError.responseText).error.message.value;

                        } catch (e) { }

                        MessageBox.error(sMsg);

                    }

                }

            );

        },


        

        onDelete: function (oEvent) {

            var that = this;

            var oContext = oEvent.getSource().getBindingContext("users");

            if (!oContext) {
                oContext = oEvent.getSource().getParent().getBindingContext("users");
            }

            if (!oContext) {
                MessageBox.error("Unable to determine selected row.");
                return;
            }

            var oData = oContext.getObject();

            var sPath = this.getOwnerComponent().getModel().createKey("/UsersSet", {
                Username: oData.Username
            });

            MessageBox.confirm(

                "Delete user '" + oData.Username + "' ?",

                {

                    title: "Confirmation",

                    actions: [

                        MessageBox.Action.YES,
                        MessageBox.Action.NO

                    ],

                    emphasizedAction: MessageBox.Action.YES,

                    onClose: function (sAction) {

                        if (sAction !== MessageBox.Action.YES) {
                            return;
                        }

                        BusyIndicator.show(0);

                        that.getOwnerComponent().getModel().remove(

                            sPath,

                            {

                                success: function () {

                                    BusyIndicator.hide();

                                    MessageToast.show("User Deleted");

                                    that._loadUsers();

                                },

                                error: function (oError) {

                                    BusyIndicator.hide();

                                    var sMsg = "Delete Failed";

                                    try {

                                        sMsg = JSON.parse(oError.responseText).error.message.value;

                                    } catch (e) { }

                                    MessageBox.error(sMsg);

                                }

                            }

                        );

                    }

                }

            );

        },

        _loadUsers: function () {

            var that = this;

            BusyIndicator.show(0);

            this.getOwnerComponent().getModel().read("/UsersSet", {

                success: function (oData) {

                    BusyIndicator.hide();

                    var oJSON = new sap.ui.model.json.JSONModel({
                        Users: oData.results
                    });

                    that.getView().setModel(oJSON, "users");

                },

                error: function () {

                    BusyIndicator.hide();

                    MessageBox.error("Unable to load Users.");

                }

            });

        },
        _applyFilters: function () {

            var oTable = this.byId("userTable");
            var oBinding = oTable.getBinding("items");

            var sSearch = this.byId("searchField").getValue().trim();
            var sRole = this.byId("roleFilter").getSelectedKey();
            var sStatus = this.byId("statusFilter").getSelectedKey();

            var aFilters = [];

            // Search Filter
            if (sSearch) {

                aFilters.push(

                    new sap.ui.model.Filter({

                        filters: [

                            new sap.ui.model.Filter(
                                "Username",
                                sap.ui.model.FilterOperator.Contains,
                                sSearch
                            ),

                            new sap.ui.model.Filter(
                                "EmpId",
                                sap.ui.model.FilterOperator.Contains,
                                sSearch
                            ),

                            new sap.ui.model.Filter(
                                "Name",
                                sap.ui.model.FilterOperator.Contains,
                                sSearch
                            )

                        ],

                        and: false

                    })

                );

            }

            // Role Filter
            if (sRole) {

                aFilters.push(

                    new sap.ui.model.Filter(
                        "Role",
                        sap.ui.model.FilterOperator.EQ,
                        sRole
                    )

                );

            }

            // Status Filter
            if (sStatus) {

                aFilters.push(

                    new sap.ui.model.Filter(
                        "Status",
                        sap.ui.model.FilterOperator.EQ,
                        sStatus
                    )

                );

            }

            // Apply all filters together
            oBinding.filter(aFilters);

        },




        onSearch: function (oEvent) {
            this._applyFilters();

        },




        onRoleFilter: function (oEvent) {

            this._applyFilters();

        },
        onStatusFilter: function (oEvent) {

            this._applyFilters();

        },




        onResetFilters: function () {

            this.byId("userTable").getBinding("items").filter([]);

            this.byId("searchField").setValue("");
            this.byId("roleFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");

            this._applyFilters();

        },
        onResetPassword: function (oEvent) {

            var that = this;

            var oContext = oEvent.getSource().getBindingContext("users");

            if (!oContext) {
                oContext = oEvent.getSource().getParent().getBindingContext("users");
            }

            if (!oContext) {
                MessageBox.error("Unable to determine selected row.");
                return;
            }

            var oData = oContext.getObject();

            MessageBox.confirm(
                "Reset password for " + oData.Username + "?",
                {
                    onClose: function (sAction) {

                        if (sAction !== MessageBox.Action.OK) {
                            return;
                        }

                        BusyIndicator.show(0);

                        var sPath = that.getOwnerComponent().getModel().createKey(
                            "/UsersSet",
                            {
                                Username: oData.Username
                            }
                        );

                        that.getOwnerComponent().getModel().update(
                            sPath,
                            {
                                Password: "Welcome@123",
                                Username: oData.Username,
                                EmpId: oData.EmpId,
                                Name: oData.Name,
                                Role: oData.Role,
                                Status: oData.Status
                            },
                            {
                                success: function () {

                                    BusyIndicator.hide();

                                    MessageToast.show("Password Reset Successfully");

                                },
                                error: function () {

                                    BusyIndicator.hide();

                                    MessageBox.error("Unable to Reset Password");

                                }
                            }
                        );

                    }
                }
            );

        },
        onExportExcel: function () {

            var oTable = this.byId("userTable");
            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                MessageBox.error("No data available.");
                return;
            }

            // Get only visible (filtered/searched) rows
            var aContexts = oBinding.getCurrentContexts();

            if (aContexts.length === 0) {
                MessageBox.information("No users found.");
                return;
            }

            var aData = [];

            aContexts.forEach(function (oContext, iIndex) {

                var oUser = Object.assign({}, oContext.getObject());

                oUser.SNo = iIndex + 1;

                switch (oUser.Role) {

                    case "ADMIN":
                        oUser.RoleText = "Administrator";
                        break;

                    case "HR":
                        oUser.RoleText = "HR";
                        break;

                    case "MANAGER":
                        oUser.RoleText = "Manager";
                        break;

                    default:
                        oUser.RoleText = "Employee";
                }

                oUser.StatusText = oUser.Status === "1"
                    ? "Active"
                    : "Inactive";

                aData.push(oUser);

            });

            var aColumns = [

                {
                    label: "S.No",
                    property: "SNo",
                    type: "Number"
                },
                {
                    label: "Username",
                    property: "Username",
                    type: "String"
                },
                {
                    label: "Employee ID",
                    property: "EmpId",
                    type: "String"
                },
                {
                    label: "Employee Name",
                    property: "Name",
                    type: "String"
                },
                {
                    label: "Role",
                    property: "RoleText",
                    type: "String"
                },
                {
                    label: "Status",
                    property: "StatusText",
                    type: "String"
                }

            ];

            var oSpreadsheet = new Spreadsheet({

                workbook: {
                    columns: aColumns
                },

                dataSource: aData,

                fileName: "Users.xlsx"

            });

            BusyIndicator.show(0);

            oSpreadsheet.build().finally(function () {

                BusyIndicator.hide();
                oSpreadsheet.destroy();

            });

        }
    });

});