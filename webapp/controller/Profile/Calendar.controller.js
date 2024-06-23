sap.ui.define(
["sap/ui/core/mvc/Controller", 
"sap/ui/unified/CalendarDayType", 
"sap/ui/model/Filter", 
"sap/ui/model/FilterOperator"],
function (Controller, CalendarDayType, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Profile.Calendar", {

        onInit: function () {

            // Get the router for navigating between views
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // Get references to the calendar and legend elements in the view
            var oCalendar = this.getView().byId("calendar");
            var oLegend = this.getView().byId("legend");

            // Create and set OData model for accessing the calendar data
            var oDataModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_CALENDRIER_SRV/");
            this.getView().setModel(oDataModel2, "odataModel2");

            var aUnAvailableDates = [];
            var aAvailableDates = [];
            var oModel2 = this.getView().getModel("odataModel2");

            // Function to convert date strings from "YYYYMMDD" to JavaScript Date objects
            function convertDateFormat(dateString) {
                var year = dateString.substring(0, 4);
                var month = dateString.substring(4, 6) - 1; // Months are 0-based in JavaScript
                var day = dateString.substring(6, 8);
                return new Date(year, month, day);
            }

            // Attach a pattern matched event handler to the route "ConsultantDetails"
            oRouter.getRoute("ConsultantDetails").attachPatternMatched(function (oEvent) {
                var sConsultantId = oEvent.getParameter("arguments").consultantId;

                var oFilter = new Filter("IdConsultant", FilterOperator.EQ, sConsultantId);

                // Read calendar data for the specific consultant using the filter
                oModel2.read("/CALENDARIDSet", {
                    filters: [oFilter],
                    success: function (response) {
                        response.results.forEach(function (item) {
                            var oDate = convertDateFormat(item.DateAvailability);
                            if (item.Availability === '1') {
                                aAvailableDates.push(oDate); // Available dates
                            } else {
                                aUnAvailableDates.push(oDate); // Unavailable dates
                            }
                        });

                        // Add available dates to the calendar with green color
                        aAvailableDates.forEach(function (oDate) {
                            oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                                startDate: oDate,
                                type: CalendarDayType.Type08 // Green for available
                            }));
                        });

                        // Add unavailable dates to the calendar with red color
                        aUnAvailableDates.forEach(function (oDate) {
                            oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                                startDate: oDate,
                                type: CalendarDayType.Type02 // Red for unavailable
                            }));
                        });

                        // Add legend items for available and unavailable statuses
                        oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                            text: "Disponible",
                            type: CalendarDayType.Type08 // Green for available
                        }));

                        oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                            text: "Non disponible",
                            type: CalendarDayType.Type02 // Red for unavailable
                        }));
                    },
                    error: function (error) {
                        console.error("Error fetching calendar data", error);
                    }
                });
            }, this);
        }
        
    });
}
);
