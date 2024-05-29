/* sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/library',
    'sap/m/SelectDialog',
    'sap/m/StandardListItem'
], function (Controller, JSONModel, DateFormat, coreLibrary, SelectDialog, StandardListItem) {
    "use strict";

    var CalendarType = coreLibrary.CalendarType;

    return Controller.extend("management.controller.ConsultantCalendar", {
        oFormatYyyymmdd: null,
        oModel: null,

        onInit: function () {
            this.oFormatYyyymmdd = DateFormat.getInstance({
                pattern: "yyyy-MM-dd",
                calendarType: CalendarType.Gregorian
            });

            this.oModel = new JSONModel({ selectedDates: [] });
            this.getView().setModel(this.oModel);

            // Initialize your OData model
            var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");
            this.getView().setModel(oDataModel, "odataModel");

            // Load ticket data
            this._loadTickets();
        },

        _loadTickets: function () {
            var oModel = this.getView().getModel("odataModel");

            oModel.read("/TICKETIDSet", {
                success: function (oData) {
                    console.log("Ticket data:", oData);
                    this.oModel.setProperty("/TICKETIDSet", oData.results);
                }.bind(this),
                error: function (oError) {
                    console.log("Error fetching ticket data:", oError);
                }
            });
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
            } else {
                this._clearModel();
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
            var oModel = this.getView().getModel();

            if (!this._pValueHelpDialog) {
                console.log("Creating SelectDialog...");
                this._pValueHelpDialog = new SelectDialog({
                    title: "Select Ticket",
                    noDataText: "No Tickets Found",
                    search: this.onSearch.bind(this),
                    confirm: this.onDialogClose.bind(this),
                    cancel: this.onDialogClose.bind(this)
                });

                console.log("Binding items...");
                this._pValueHelpDialog.bindAggregation("items", {
                    path: "/TICKETIDSet",
                    template: new StandardListItem({
                        title: "{IdTicket}",
                        description: "{Description}"
                    })
                });

                this.getView().addDependent(this._pValueHelpDialog);
            } else {
                console.log("SelectDialog already created");
            }

            console.log("Setting model...");
            this._pValueHelpDialog.setModel(oModel);

            setTimeout(function () {
                console.log("Opening SelectDialog...");
                this._pValueHelpDialog.open();
                this._pValueHelpDialog.getBinding("items").refresh();
            }.bind(this), 1000); // Delay opening the dialog by 1000 milliseconds (1 second)
        },

        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("Titre", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onDialogClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oInput = this.byId("productInput");
                oInput.setValue(oSelectedItem.getTitle());
            }
            oEvent.getSource().getBinding("items").filter([]);
        }
    });
}); */
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/library',
    'sap/m/SelectDialog',
    'sap/m/StandardListItem'
], function (Controller, JSONModel, DateFormat, coreLibrary, SelectDialog, StandardListItem) {
    "use strict";

    var CalendarType = coreLibrary.CalendarType;

    return Controller.extend("management.controller.ConsultantCalendar", {
        oFormatYyyymmdd: null,
        oModel: null,

        onInit: function () {
            this.oFormatYyyymmdd = DateFormat.getInstance({
                pattern: "yyyy-MM-dd",
                calendarType: CalendarType.Gregorian
            });

            this.oModel = new JSONModel({ selectedDates: [] });
            this.getView().setModel(this.oModel);

            // Initialize your OData model
            var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");
            this.getView().setModel(oDataModel, "odataModel");
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
            } else {
                this._clearModel();
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
                var oInput = this.byId("productInput");
                oInput.setValue(oSelectedItem.getTitle());
            }
            oEvent.getSource().getBinding("items").filter([]);
        }
    });
});
