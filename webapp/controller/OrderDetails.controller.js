sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

"use strict";

return Controller.extend(
"admindemo.controller.OrderDetails",{

onInit:function(){

this.getOwnerComponent()
.getRouter()
.getRoute("OrderDetails")
.attachPatternMatched(
this._onObjectMatched,
this
);

},

_onObjectMatched:function(oEvent){

var sId=oEvent.getParameter("arguments").id;

this.getView().bindElement({

path:"/Orders("+sId+")"

});

},

onNavBack:function(){

this.getOwnerComponent()
.getRouter()
.navTo("Orders");

}

});

});