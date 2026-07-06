sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {

    "use strict";

    return Controller.extend("employee.controller.EditEmployee", {

        onBack: function () {

            this.getView().getParent().back();

        },

        onUpdate: function () {

            var oModel = this.getView().getModel();

            var oData = {

                EmpId: this.byId("empId").getValue(),
                FirstName: this.byId("firstName").getValue(),
                LastName: this.byId("lastName").getValue(),
                Gender: this.byId("gender").getSelectedKey(),
                Dob: this.byId("dob").getDateValue(),
                Email: this.byId("email").getValue(),
                Phone: this.byId("phone").getValue(),
                DeptId: this.byId("deptId").getSelectedKey(),
                RoleId: this.byId("roleId").getSelectedKey(),
                JoinDate: this.byId("joinDate").getDateValue(),
                Salary: this.byId("salary").getValue(),
                Waers: this.byId("waers").getValue(),
                Status: this.byId("status").getSelectedKey()

            };

            oModel.update(

                "/EmployeeeSet('" + oData.EmpId + "')",

                oData,

                {

                    success: function () {

                        MessageBox.success("Employee Updated Successfully");

                    },

                    error: function () {

                        MessageBox.error("Update Failed");

                    }

                }

            );

        }
       

    });

});