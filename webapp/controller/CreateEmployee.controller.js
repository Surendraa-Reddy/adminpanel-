sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState"
], function (Controller, MessageToast, MessageBox, ValueState) {

    "use strict";

    return Controller.extend("employee.controller.CreateEmployee", {

        onBack: function () {
            this.getView().getParent().back();
        },

        onSave: function () {

            var oEmpId = this.byId("empId");
            var oFirstName = this.byId("firstName");
            var oLastName = this.byId("lastName");
            var oEmail = this.byId("email");
            var oPhone = this.byId("phone");
            var oDeptId = this.byId("deptId");
            var oRoleId = this.byId("roleId");
            var oStatus = this.byId("status");
            var oGender = this.byId("gender");
            var oDob = this.byId("dob");
            var oJoinDate = this.byId("joinDate");
            var oSalary = this.byId("salary");
            var oWaers = this.byId("waers");

            var bValid = true;

            // Reset Value States
            [
                oEmpId,
                oFirstName,
                oLastName,
                oGender,
                oDob,
                oEmail,
                oPhone,
                oJoinDate,
                oSalary,
                oWaers,
                oDeptId,
                oRoleId
            ].forEach(function (oControl) {
                oControl.setValueState(ValueState.None);
            });
            // Employee ID
            if (!oEmpId.getValue().trim()) {
                oEmpId.setValueState(ValueState.Error);
                oEmpId.setValueStateText("Employee ID is required");
                bValid = false;
            }
            if (!oGender.getSelectedKey()) {
                oGender.setValueState(ValueState.Error);
                oGender.setValueStateText("Please select Gender");
                bValid = false;
            }

            // Date of Birth
            if (!oDob.getValue()) {
                oDob.setValueState(ValueState.Error);
                oDob.setValueStateText("Please select Date of Birth");
                bValid = false;
            }

            // First Name
            if (!oFirstName.getValue().trim()) {
                oFirstName.setValueState(ValueState.Error);
                oFirstName.setValueStateText("First Name is required");
                bValid = false;
            }

            // Last Name
            if (!oLastName.getValue().trim()) {
                oLastName.setValueState(ValueState.Error);
                oLastName.setValueStateText("Last Name is required");
                bValid = false;
            }

            // Email
            var sEmail = oEmail.getValue().trim();
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!sEmail) {
                oEmail.setValueState(ValueState.Error);
                oEmail.setValueStateText("Email is required");
                bValid = false;
            } else if (!emailRegex.test(sEmail)) {
                oEmail.setValueState(ValueState.Error);
                oEmail.setValueStateText("Invalid Email");
                bValid = false;
            }

            // Phone
            var sPhone = oPhone.getValue().trim();

            if (!/^[0-9]{10}$/.test(sPhone)) {
                oPhone.setValueState(ValueState.Error);
                oPhone.setValueStateText("Phone must contain 10 digits");
                bValid = false;
            }

            // Department
            if (!oDeptId.getSelectedKey()) {
                oDeptId.setValueState(ValueState.Error);
                oDeptId.setValueStateText("Please select Department");
                bValid = false;
            }

            if (!oRoleId.getSelectedKey()) {
                oRoleId.setValueState(ValueState.Error);
                oRoleId.setValueStateText("Please select Role");
                bValid = false;
            }
            // Join Date
            if (!oJoinDate.getValue()) {
                oJoinDate.setValueState(ValueState.Error);
                oJoinDate.setValueStateText("Please select Joining Date");
                bValid = false;
            }

            // Salary
            if (!oSalary.getValue()) {
                oSalary.setValueState(ValueState.Error);
                oSalary.setValueStateText("Salary is required");
                bValid = false;
            }

            // Currency
            if (!oWaers.getSelectedKey()) {
                oWaers.setValueState(ValueState.Error);
                oWaers.setValueStateText("Please select Currency");
                bValid = false;
            }

            // Status
            if (!oStatus.getSelectedKey()) {
                MessageBox.error("Please select Status.");
                return;
            }

            if (!bValid) {
                MessageBox.error("Please fill all mandatory fields correctly.");
                return;
            }

            var oEntry = {

                EmpId: oEmpId.getValue().trim(),
                FirstName: oFirstName.getValue().trim(),
                LastName: oLastName.getValue().trim(),

                Gender: oGender.getSelectedKey(),

                Dob: oDob.getDateValue(),

                Email: sEmail,

                Phone: sPhone,

                DeptId: oDeptId.getSelectedKey(),

                RoleId: oRoleId.getSelectedKey(),

                JoinDate: oJoinDate.getDateValue(),

                Salary: oSalary.getValue(),

                Waers: oWaers.getSelectedKey(),

                Status: oStatus.getSelectedKey()

            };

            var oModel = this.getView().getModel();

            oModel.create("/EmployeeeSet", oEntry, {

                success: function () {

                    MessageBox.success("Employee Created Successfully", {

                        onClose: function () {

                            that.getView().getParent().back();

                        }

                    });

                },

                error: function (oError) {

                    MessageBox.error("Employee creation failed.");

                    console.log(oError);

                }

            });

        }

    });

});