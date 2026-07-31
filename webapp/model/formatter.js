sap.ui.define([], function () {
    "use strict";

    return {

        getNotificationIcon: function (sType) {

            switch (sType) {

                case "LEAVE_APPROVED":
                    return "sap-icon://accept";

                case "LEAVE_REJECTED":
                    return "sap-icon://decline";

                case "PAYROLL":
                    return "sap-icon://money-bills";

                case "BIRTHDAY":
                    return "sap-icon://gift";

                case "HOLIDAY":
                    return "sap-icon://calendar";

                default:
                    return "sap-icon://bell";
            }

        },

        getAvatarColor: function (sType) {

            switch (sType) {

                case "LEAVE_APPROVED":
                    return "Accent8";

                case "LEAVE_REJECTED":
                    return "Accent1";

                case "PAYROLL":
                    return "Accent7";

                case "BIRTHDAY":
                    return "Accent2";

                case "HOLIDAY":
                    return "Accent6";

                default:
                    return "Accent5";
            }

        },

        getStatusState: function (sMsgType) {

            switch (sMsgType) {

                case "SUCCESS":
                    return "Success";

                case "ERROR":
                    return "Error";

                case "WARNING":
                    return "Warning";

                case "INFORMATION":
                    return "Information";

                default:
                    return "None";
            }

        },
        getNotificationStatusText: function (sStatus) {

            switch (sStatus) {
                case "R":
                    return "Read";

                case "U":
                    return "Unread";

                default:
                    return sStatus;
            }

        },

        getNotificationStatusState: function (sStatus) {

            switch (sStatus) {
                case "R":
                    return "Success";

                case "U":
                    return "Warning";

                default:
                    return "None";
            }

        }

    };


});