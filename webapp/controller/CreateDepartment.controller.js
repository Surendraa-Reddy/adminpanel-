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

    return Controller.extend("employee.controller.CreateDepartment", {

        onInit: function () {

        },

        onBack: function () {

            this.getView().getParent().back();

        },

        onCreate: function () {

            var oModel = this.getView().getModel();

            var sDeptId = this.byId("deptId").getValue().trim();
            var sDeptName = this.byId("deptName").getValue().trim();
            var sLocation = this.byId("location").getValue().trim();
            var sStatus = this.byId("status").getSelectedKey();

            if (!sDeptId) {
                MessageBox.warning("Please enter Department ID.");
                return;
            }

            if (!sDeptName) {
                MessageBox.warning("Please enter Department Name.");
                return;
            }

            var oEntry = {
                DeptId: sDeptId,
                DeptName: sDeptName,
                Location: sLocation,
                Status: sStatus
            };

            var that = this;

            oModel.create("/DepartmentSet", oEntry, {

                success: function () {

                    MessageToast.show("Department created successfully.");

                    that.byId("deptId").setValue("");
                    that.byId("deptName").setValue("");
                    that.byId("location").setValue("");
                    that.byId("status").setSelectedKey("1");

                    that.getView().getParent().back();

                },

                error: function (oError) {

                    MessageBox.error("Failed to create department.");

                    console.log(oError);

                }

            });

        }

    });

});