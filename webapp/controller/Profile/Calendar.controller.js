sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/unified/CalendarDayType",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, CalendarDayType, Filter, FilterOperator) {
        "use strict";
 
        return Controller.extend("management.controller.Profile.Calendar", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var oCalendar = this.getView().byId("calendar");
                var oLegend = this.getView().byId("legend");
                var oDataModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_CALENDRIER_SRV/");
                this.getView().setModel(oDataModel2, "odataModel2");
 
                var aUnAvailableDates = [];
                var aAvailableDates = [];
               
                function convertDateFormat(dateString) {
                    var year = dateString.substring(0, 4);
                    var month = dateString.substring(4, 6) - 1; // Months start from 0 in JavaScript
                    var day = dateString.substring(6, 8);
                    return new Date(year, month, day);
                }
                var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                var sConsultantId = oBundle.getText("userId");
               
                    var oModel2 = this.getView().getModel("odataModel2");
                    var oFilter = new Filter("IdConsultant", FilterOperator.EQ, sConsultantId);
 
                    oModel2.read("/CALENDARIDSet", {
                        filters: [oFilter],
                        success: function (response) {
                            response.results.forEach(function (item) {
                                var oDate = convertDateFormat(item.DateAvailability);
                                if (item.Availability === '1') {
                                    aAvailableDates.push(oDate);
                                } else {
                                    aUnAvailableDates.push(oDate);
                                }
                            });
 
                            // Adding special dates to the calendar
                            aAvailableDates.forEach(function (oDate) {
                                oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                                    startDate: oDate,
                                    type: CalendarDayType.Type08 // Green color for available
                                }));
                            });
 
                            aUnAvailableDates.forEach(function (oDate) {
                                oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                                    startDate: oDate,
                                    type: CalendarDayType.Type02 // Red color for unavailable
                                }));
                            });
 
                            // Adding legend items
                            oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                                text: "Available",
                                type: CalendarDayType.Type08 // Green color
                            }));
 
                            oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                                text: "Unavailble",
                                type: CalendarDayType.Type02 // Red color
                            }));
                        },
                        error: function (error) {
                            console.error("Error reading OData !", error);
                        }
                    });
 
            }
        });
    }
);
 
 