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

    return Controller.extend("management.controller.ConsultantCalendar", {
        oFormatYyyymmdd: null,
        oModel: null,

        onInit: function () {
            this.oFormatYyyymmdd = DateFormat.getInstance({
                pattern: "yyyyMMdd",
                calendarType: CalendarType.Gregorian
            });

            this.oModel = new JSONModel({ selectedDates: [], Enabled: false });
            this.getView().setModel(this.oModel);

            // Initialize your OData models
            var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");
            this.getView().setModel(oDataModel, "odataModel");
            var oDataModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_CALENDRIER_SRV/");
            this.getView().setModel(oDataModel2, "odataModel2");
            console.log(oDataModel);
            console.log(oDataModel2);
        },

        handleCalendarSelect: function (oEvent) {
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
                this.oModel.setProperty("/Enabled", true); // Active le Switch lorsqu'une date est sélectionnée
            } else {
                this._clearModel();
                this.oModel.setProperty("/Enabled", false); // Désactive le Switch lorsqu'aucune date n'est sélectionnée
            }
        },

        handleRemoveSelection: function () {
            this.byId("calendar").removeAllSelectedDates();
            this._clearModel();
        },

        _clearModel: function () {
            var oData = { selectedDates: [] };
            this.oModel.setData(oData);
        },

        onValueHelpRequest: function () {
            var oFilter = new Filter("Status", FilterOperator.EQ, "In Progress"); 
            var oODataModel = this.getView().getModel("odataModel");
            console.log(oODataModel);
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
                    console.log("Error fetching ticket data:", oError);
                }
            });
        },

        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onDialogClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oInput = this.byId("TicketInput");
                oInput.setValue(oSelectedItem.getTitle());
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

        onCreateAvailability: function () {
            var sTicketInput = this.getView().byId("TicketInput").getValue();
            var oData1;
            var oSelectedDates = this.oModel.getProperty("/selectedDates"); // Get selected dates
            var bSwitchState = this.oModel.getProperty("/Enabled"); // Get the switch state
            var sAvailability = bSwitchState ? "1" : "0"; // Determine availability based on switch state

            console.log("onCreateAvailability", sTicketInput);
            console.log("selected date ", oSelectedDates);
            console.log("switch state ???? ", sAvailability);

            if (bSwitchState) {
                // Fetch and update ticket data
                this.fetchAndUpdateTicketData(sTicketInput, bSwitchState).then(function(oTicketDetails) {
                    this.createCalendarEntries(sTicketInput, oSelectedDates, sAvailability);
                }.bind(this)).catch(function(oError) {
                    MessageToast.show("Error while fetching ticket data: " + oError.message);
                });
            } else {
                this.createCalendarEntries(sTicketInput, oSelectedDates, sAvailability);
            }
        },

        createCalendarEntries: function (sTicketInput, oSelectedDates, sAvailability) {
            var oData1;
            var delay = 1000; // Délai de 1 seconde entre chaque requête
            oSelectedDates.forEach(function(element, index) {
                setTimeout(function() {
                    var formattedDate = element.Date; // Use the correctly formatted date
                    oData1 = {
                        Id: ('000' + Math.floor(Math.random() * 1000)).slice(-3),
                        IdTicket: sTicketInput,
                        DateAvailability: formattedDate, // Use the correctly formatted date
                        IdConsultant: "CONS1",
                        Availability: sAvailability
                    };
                    console.log(oData1);

                    var oModel2 = this.getView().getModel("odataModel2");
                    // oModel2.create("/CALENDARIDSet", oData1, {
                    //     success: function () {
                    //         MessageToast.show("Availability created successfully.");
                    //     }.bind(this),
                    //     error: function (oError) {
                    //         MessageToast.show("Error while creating availability: " + oError.message);
                    //     }
                    // });
                }.bind(this), index * delay);
            }.bind(this));
            // Clear selected dates and ticket input after successful update
            this._clearModel();
            this.byId("TicketInput").setValue("");
        },

        fetchAndUpdateTicketData: function(sTicketInput, bSwitchState) {
            return new Promise(function(resolve, reject) {
                var oModel = this.getView().getModel("odataModel");
                if (bSwitchState === true) {
                    oModel.read("/TICKETIDSet('" + sTicketInput + "')", {
                        success: function(oData) {
                            console.log(oData);
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
                                EndDate: oData.EndDate,
                                Consultant: oData.Consultant,
                                Priority: oData.Priority,
                                CreatedBy: oData.CreatedBy
                            };
                            console.log("Détails du ticket:", oTicketDetails);

                            // Update ticket status
                            oModel.create("/TICKETIDSet", oTicketDetails, {
                                success: function() {
                                    console.log("Ticket status updated successfully.");
                                    resolve(oTicketDetails);
                                },
                                error: function(oError) {
                                    console.log("Error updating ticket status:", oError);
                                    reject(oError);
                                }
                            });
                        }.bind(this),
                        error: function(oError) {
                            console.log("Error fetching ticket data:", oError);
                            reject(oError);
                        }
                    });
                }
            }.bind(this));
        },

        onSwitchChange: function (oEvent) {
            var bState = oEvent.getParameter("state");
            var oInput = this.byId("TicketInput");
            var bSwitchState = bState ? "1" : "0"; // Stocke '1' si le Switch est activé, sinon stocke '0'
            if (!bState) {
                oInput.setValue("");
                oInput.setEnabled(false);
            } else {
                oInput.setEnabled(true);
            }
            this.oModel.setProperty("/Enabled", bState); // Met à jour l'état du Switch dans le modèle
        },
        formatDate: function (sDate) {
            if (!sDate) {
              return "-";
            }
      
            // Ensure the date string is in the expected format
            if (sDate.length !== 8) {
              console.warn("Invalid date format: " + sDate);
              return sDate;
            }
      
            // Extract year, month, and day from the date string
            var year = sDate.substring(0, 4);
            var month = sDate.substring(4, 6);
            var day = sDate.substring(6, 8);
      
            // Convert to "YYYY-MM-DD" format
            var formattedDate = year + "-" + month + "-" + day;
            return formattedDate;
          }
    });
});
