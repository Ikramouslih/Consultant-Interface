sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/library',
    'sap/m/SelectDialog',
    'sap/m/StandardListItem',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/m/MessageToast'
], function (Controller, JSONModel, DateFormat, coreLibrary, SelectDialog, StandardListItem, Filter, FilterOperator, MessageToast) {
    "use strict";

    var CalendarType = coreLibrary.CalendarType;

    return Controller.extend("management.controller.InputCalendar.ConsultantCalendar", {

        oFormatYyyymmdd: null,
        oModel: null,

        onInit: function () {

            // Date formatter for "yyyyMMdd" pattern
            this.oFormatYyyymmdd = DateFormat.getInstance({
                pattern: "yyyyMMdd",
                calendarType: CalendarType.Gregorian
            });

            // Initialize the JSON model with default values
            this.oModel = new JSONModel({ selectedDates: [], Enabled: false });
            this.getView().setModel(this.oModel);

            // Initialize OData models for fetching data
            var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");
            this.getView().setModel(oDataModel, "odataModel");
            var oDataModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_CALENDRIER_SRV/");
            this.getView().setModel(oDataModel2, "odataModel2");
        },

        // Handle date selection in the calendar
        handleCalendarSelect: function (oEvent) {

            // Handle date selection in the calendar
            var oCalendar = oEvent.getSource(),
                aSelectedDates = oCalendar.getSelectedDates(),
                oData = { selectedDates: [] },
                oDate,
                i;

            if (aSelectedDates.length > 0) {
                for (i = 0; i < aSelectedDates.length; i++) {
                    oDate = aSelectedDates[i].getStartDate();
                    oData.selectedDates.push({ Date: this.oFormatYyyymmdd.format(oDate) });
                }
                this.oModel.setData(oData);
                this.oModel.setProperty("/Enabled", true); // Enable switch if a date is selected
            } else {
                this._clearModel();
                this.oModel.setProperty("/Enabled", false); // Disable switch if no dates are selected
            }
        },

        // Handle removal of selected dates
        handleRemoveSelection: function () {
            // Remove all selected dates from the calendar and clear the model
            this.byId("calendar").removeAllSelectedDates();
            this._clearModel();
        },

        // Clear the selected dates from the model
        _clearModel: function () {
            // Clear the selected dates from the model
            var oData = { selectedDates: [] };
            this.oModel.setData(oData);
        },

        // Handle value help request for selecting tickets
        onValueHelpRequest: function () {
            // Handle value help dialog for selecting tickets
            var oFilter = new Filter("Status", FilterOperator.EQ, "In Progress");
            var oODataModel = this.getView().getModel("odataModel");

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = new SelectDialog({
                    title: "Select Ticket",
                    noDataText: "No Tickets Found",
                    search: this.onSearch.bind(this),
                    confirm: this.onDialogClose.bind(this),
                    cancel: this.onDialogClose.bind(this)
                });

                this._pValueHelpDialog.bindAggregation("items", {
                    path: "/TICKETIDSet",
                    template: new StandardListItem({
                        title: "{IdTicket}",
                        description: "{Description}"
                    })
                });

                this.getView().addDependent(this._pValueHelpDialog);
            }

            // Fetch data before opening the dialog
            oODataModel.read("/TICKETIDSet", {
                filters: [oFilter],
                success: function (oData) {
                    this.oModel.setProperty("/TICKETIDSet", oData.results);
                    this._pValueHelpDialog.setModel(this.oModel);
                    this._pValueHelpDialog.open();
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error while fetching ticket data: " + oError.message);
                }
            });
        },

        // Handle search within the value help dialog
        onSearch: function (oEvent) {
            // Handle search within the value help dialog
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        // Handle closing of the value help dialog
        onDialogClose: function (oEvent) {
            // Handle closing of the value help dialog
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oInput = this.byId("TicketInput");
                oInput.setValue(oSelectedItem.getTitle());
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

        // Handle creation of availability entries
        onCreateAvailability: function () {
            // Create availability entries based on selected dates and switch state
            var sTicketInput = this.getView().byId("TicketInput").getValue();
            var oSelectedDates = this.oModel.getProperty("/selectedDates");
            var bSwitchState = this.oModel.getProperty("/Enabled");
            var sAvailability = bSwitchState ? "1" : "0";

            if (bSwitchState) {
                // Fetch and update ticket data if the switch is enabled
                this.fetchAndUpdateTicketData(sTicketInput, oSelectedDates, bSwitchState).then(function (oTicketDetails) {
                    this.createCalendarEntries(sTicketInput, oSelectedDates, sAvailability);
                }.bind(this)).catch(function (oError) {
                    MessageToast.show("Error while fetching ticket data: " + oError.message);
                });
            } else {
                this.createCalendarEntries(sTicketInput, oSelectedDates, sAvailability);
            }
        },

        // Create calendar entries for selected dates
        createCalendarEntries: function (sTicketInput, oSelectedDates, sAvailability) {
            // Create calendar entries for selected dates with a delay between each request
            var oData1;
            var delay = 1000; // 1 second delay between each request
            oSelectedDates.forEach(function (element, index) {
                setTimeout(function () {
                    var formattedDate = element.Date;
                    oData1 = {
                        Id: ('000' + Math.floor(Math.random() * 1000)).slice(-3),
                        IdTicket: sTicketInput,
                        DateAvailability: formattedDate,
                        IdConsultant: "C-SEL495", // ***********TO DO***************
                        Availability: sAvailability
                    };
                    var oModel2 = this.getView().getModel("odataModel2");
                    oModel2.create("/CALENDARIDSet", oData1, {
                        success: function () {
                            MessageToast.show("Availability created successfully.");
                            location.reload();
                        }.bind(this),
                        error: function (oError) {
                            MessageToast.show("Error while creating availability: " + oError.message);
                        }
                    });
                }.bind(this), index * delay);
            }.bind(this));
            // Clear selected dates and ticket input after successful update
            this._clearModel();
            this.byId("TicketInput").setValue("");
        },

        // Fetch and update ticket data
        fetchAndUpdateTicketData: function (sTicketInput, oSelectedDates, bSwitchState) {
            // Fetch and update ticket data, returning a promise
            return new Promise(function (resolve, reject) {
                var oModel = this.getView().getModel("odataModel");

                // Find the latest date in selected dates
                var maxDate = oSelectedDates.reduce(function (latest, current) {
                    return latest.Date > current.Date ? latest : current;
                });

                if (bSwitchState === true) {
                    oModel.read("/TICKETIDSet('" + sTicketInput + "')", {
                        success: function (oData) {
                            var oTicketDetails = {
                                IdTicket: oData.IdTicket,
                                Description: oData.Description,
                                IdJira: oData.IdJira,
                                Titre: oData.Titre,
                                Projet: oData.Projet,
                                Technology: oData.Technology,
                                Status: "Done",
                                Estimated: oData.Estimated,
                                CreationDate: oData.CreationDate,
                                StartDate: oData.StartDate,
                                EndDate: maxDate.Date, // Update EndDate with the latest date
                                Consultant: oData.Consultant,
                                Priority: oData.Priority,
                                CreatedBy: oData.CreatedBy
                            };

                            // Update ticket status
                            oModel.create("/TICKETIDSet", oTicketDetails, {
                                success: function () {
                                    resolve(oTicketDetails);
                                    location.reload();
                                },
                                error: function (oError) {
                                    reject(oError);
                                }
                            });
                        }.bind(this),
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                }
            }.bind(this));
        },

        // Handle switch change event
        onSwitchChange: function (oEvent) {
            // Handle switch change event to toggle ticket input state
            var bState = oEvent.getParameter("state");
            var oInput = this.byId("TicketInput");
            if (!bState) {
                oInput.setValue("");
                oInput.setEnabled(false);
            } else {
                oInput.setEnabled(true);
            }
            this.oModel.setProperty("/Enabled", bState);
        },

        // Format date string to "YYYY-MM-DD"
        formatDate: function (sDate) {
            // Format date string to "YYYY-MM-DD"
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

            var formattedDate = year + "-" + month + "-" + day;
            return formattedDate;
        }
        
    });
});
