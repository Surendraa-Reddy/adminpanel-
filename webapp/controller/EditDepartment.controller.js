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

    return Controller.extend("employee.controller.EditDepartment", {

        onBack: function () {

            this.getView().getParent().back();

        },

        onUpdate: function () {

            var oModel = this.getView().getModel();

            var oDepartmentModel = this.getView().getModel("department");

            var oData = oDepartmentModel.getData();

            var sPath = "/DepartmentSet('" + oData.DeptId + "')";

            var oPayload = {

                DeptId: oData.DeptId,
                DeptName: oData.DeptName,
                Location: oData.Location,
                Status: oData.Status

            };

            var that = this;

            oModel.update(sPath, oPayload, {

                success: function () {

                    MessageToast.show("Department updated successfully.");

                    that.getView().getParent().back();

                    oModel.refresh(true);

                },

                error: function (oError) {

                    console.log(oError);

                    MessageBox.error("Update failed.");

                }

            });

        }

    });

});