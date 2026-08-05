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

        },
        getRelativeTime: function (vDate) {

            if (!vDate) {
                return "";
            }

            var oDate = new Date(vDate);

            var oNow = new Date();

            var iDiff = oNow.getTime() - oDate.getTime();

            var iMinutes = Math.floor(iDiff / (1000 * 60));

            var iHours = Math.floor(iDiff / (1000 * 60 * 60));

            var iDays = Math.floor(iDiff / (1000 * 60 * 60 * 24));

            if (iMinutes < 1) {
                return "Just now";
            }

            if (iMinutes < 60) {
                return iMinutes + " mins ago";
            }

            if (iHours < 24) {
                return iHours + " hours ago";
            }

            if (iDays === 1) {
                return "Yesterday";
            }

            if (iDays < 7) {
                return iDays + " days ago";
            }

            if (iDays < 30) {
                return Math.floor(iDays / 7) + " weeks ago";
            }

            return oDate.toLocaleDateString("en-GB");

        },
        getActivityIcon: function (sType) {

            switch (sType) {

                case "JOB_CREATED":
                    return "sap-icon://add-document";

                case "CANDIDATE_APPLIED":
                    return "sap-icon://employee";

                case "INTERVIEW":
                    return "sap-icon://calendar";

                case "JOB_CLOSED":
                    return "sap-icon://decline";

                default:
                    return "sap-icon://activity-items";

            }

        },

        getActivityState: function (sType) {

            switch (sType) {

                case "JOB_CREATED":
                    return "Success";

                case "CANDIDATE_APPLIED":
                    return "Information";

                case "INTERVIEW":
                    return "Warning";

                case "JOB_CLOSED":
                    return "Error";

                default:
                    return "None";

            }

        },
        formatDate: function (vDate) {

            if (!vDate) {
                return "";
            }

            var oDate = new Date(vDate);

            return oDate.toLocaleDateString("en-GB").replace(/\//g, "-");

        },
        formatDate: function (vDate) {

            if (!vDate) {
                return "";
            }

            var oDate = new Date(vDate);

            return oDate.toLocaleDateString("en-GB").replace(/\//g, "-");

        },
        getCandidateStatusState: function (sStatus) {

            switch (sStatus) {

                case "SHORTLISTED":
                    return "Success";

                case "SELECTED":
                    return "Success";

                case "INTERVIEW":
                    return "Information";

                case "HIRED":
                    return "Success";

                case "REJECTED":
                    return "Error";

                case "ON HOLD":
                    return "Warning";

                default:
                    return "None";
            }

        },
        formatTime: function (oTime) {

            if (!oTime) {
                return "";
            }

            var iSeconds = oTime.ms / 1000;

            var h = Math.floor(iSeconds / 3600);
            var m = Math.floor((iSeconds % 3600) / 60);

            h = h < 10 ? "0" + h : h;
            m = m < 10 ? "0" + m : m;

            return h + ":" + m;
        }




    };


});