sap.ui.define([], function() {
    "use strict";
    
    return {
        formatDate: function(sDate) {
            if (!sDate) {
                return "-";
            }
            if (sDate.length !== 8) {
                console.warn("Invalid date format: " + sDate);
                return sDate;
            }
            var year = sDate.substring(0, 4);
            var month = sDate.substring(4, 6);
            var day = sDate.substring(6, 8);

            return day + "-" + month + "-" + year;
        },

        cleanDate: function (date) {
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString().padStart(2, '0');
            var dd = date.getDate().toString().padStart(2, '0');
            return yyyy + mm + dd;
        }
    };
});
