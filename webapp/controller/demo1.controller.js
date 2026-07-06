sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, MessageToast, MessageBox) {
    "use strict";
    return Controller.extend("admindemo.controller.demo1", {
        onInit: function() {
            
        },
        onSaveClick: function() {
            var name = this.getView().byId("nameInput").getValue();
            var dept = this.getView().byId("deptInput").getValue();
            MessageBox.success("Employee Name: " + name + ", Department: " + dept);
        },
        onClearClick: function() {
            this.getView().byId("nameInput").setValue("");
            this.getView().byId("deptInput").setValue("");
        }   

    }); 


});  