sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (
    Controller,
    JSONModel,
    BusyIndicator,
    MessageToast,
    MessageBox,
    History
) {
    "use strict";

    return Controller.extend("employee.controller.Profile", {


        onInit: function () {

            this._loadProfile();

            this._loadPhoto();

        },



        _loadProfile: function () {

            var oSession = this.getOwnerComponent().getModel("session");

            var sEmpId = oSession.getProperty("/empId");

            var oModel = this.getOwnerComponent().getModel();

            var that = this;

            console.log("Session:", oSession.getData());

            console.log("Loading Employee:", sEmpId);

            oModel.read("/EmployeeeSet('" + sEmpId + "')", {

                success: function (oData) {

                    console.log("Employee Data", oData);

                    // Merge Session + Employee

                    var oProfile = {

                        EmpId: oData.EmpId,

                        Username: oSession.getProperty("/username"),

                        Role: oSession.getProperty("/role"),

                        Status: oSession.getProperty("/status"),

                        Name:
                            (oData.FirstName || "") +
                            " " +
                            (oData.LastName || ""),

                        FirstName: oData.FirstName,

                        LastName: oData.LastName,

                        Gender: oData.Gender,

                        Dob: oData.Dob,

                        Email: oData.Email,

                        Phone: oData.Phone,

                        DeptId: oData.DeptId,

                        RoleId: oData.RoleId,

                        JoinDate: oData.JoinDate,

                        Salary: oData.Salary,

                        Waers: oData.Waers
                    };

                    that.getView().setModel(
                        new sap.ui.model.json.JSONModel(oProfile),
                        "profile"
                    );

                    console.log(that.getView().getModel("profile").getData());

                },

                error: function (oError) {

                    console.log(oError);

                }

            });

        },
        _loadPhoto: function () {

            var sEmpId = this.getOwnerComponent()
                .getModel("session")
                .getProperty("/empId");

            var sServiceUrl = this.getOwnerComponent()
                .getModel()
                .sServiceUrl;

          
            var sPhotoUrl = sServiceUrl + "/PhotosSet('" + sEmpId + "')/$value";

            this.getView().setModel(
                new sap.ui.model.json.JSONModel({
                    PhotoUrl: sPhotoUrl
                }),
                "photo"
            );

        },


        onOpenUpload: function () {

            this.byId("uploadDialog").open();

        },
        onCloseUpload: function () {

            this.byId("uploadDialog").close();

        },
        onFileChange: function (oEvent) {

            this._oFile = oEvent.getParameter("files")[0];

        },



        onChangePassword: function () {

            MessageToast.show("Change Password Dialog (Next Step)");

        },


        onRefreshPhoto: function () {

            this._loadPhoto();

            MessageToast.show("Profile Refreshed");

        },



        onNavBack: function () {

            var oHistory = History.getInstance();

            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {

                window.history.go(-1);

            } else {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Dashboard", {}, true);

            }

        },
        onFileSelected: function (oEvent) {

            var oFile = oEvent.getParameter("files")[0];

            if (!oFile) {
                return;
            }

            this._oFile = oFile;

            var reader = new FileReader();

            reader.onload = function (e) {

                this.byId("previewAvatar")
                    .setSrc(e.target.result);

            }.bind(this);

            reader.readAsDataURL(oFile);

        },
        onUploadPhoto: function () {

            var oUploader = this.byId("fuPhoto");

            var oFile = oUploader.getFocusDomRef().files[0];

            if (!oFile) {
                sap.m.MessageToast.show("Please select a photo.");
                return;
            }

            var sEmpId = this.getOwnerComponent()
                .getModel("session")
                .getProperty("/empId");

            var sServiceUrl = this.getOwnerComponent()
                .getModel()
                .sServiceUrl;

            var sUrl = sServiceUrl + "/PhotosSet";

            var oReader = new FileReader();

            var that = this;

            oReader.onload = function (e) {

                var oXHR = new XMLHttpRequest();

                oXHR.open("POST", sUrl, true);

                oXHR.setRequestHeader("Slug", sEmpId);

                oXHR.setRequestHeader("Content-Type", oFile.type);

               // oXHR.setRequestHeader("Accept", "application/json");

                var sToken = that.getOwnerComponent()
                    .getModel()
                    .getSecurityToken();

                oXHR.setRequestHeader("x-csrf-token", sToken);

                oXHR.onload = function () {

                    sap.ui.core.BusyIndicator.hide();

                    if (oXHR.status === 201 || oXHR.status === 200) {

                        sap.m.MessageToast.show("Photo uploaded successfully.");

                        that._loadPhoto();

                        that.byId("uploadDialog").close();

                    } else {

                        console.log(oXHR.responseText);

                        sap.m.MessageBox.error("Upload failed");

                    }

                };

                oXHR.onerror = function () {

                    sap.ui.core.BusyIndicator.hide();

                    sap.m.MessageBox.error("Network Error");

                };

                sap.ui.core.BusyIndicator.show(0);

                oXHR.send(e.target.result);

            };

            oReader.readAsArrayBuffer(oFile);

        },
        onCancelUpload: function () {

            this._oUploadDialog.close();

        }

    });

});