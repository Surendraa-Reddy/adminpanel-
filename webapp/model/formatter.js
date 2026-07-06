sap.ui.define([], function () {
    "use strict";

    return {

        getStatusText: function (dShippedDate) {

            if (!dShippedDate) {
                return "Pending";
            }

            return "Delivered";
        },

        getStatusState: function (dShippedDate) {

            if (!dShippedDate) {
                return "Warning";
            }

            return "Success";
        },

        getStatusIcon: function (dShippedDate) {

            if (!dShippedDate) {
                return "sap-icon://pending";
            }

            return "sap-icon://accept";
        }

    };

});