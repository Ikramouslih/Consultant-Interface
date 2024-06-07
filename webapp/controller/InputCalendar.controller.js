 sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/library',
    'sap/m/SelectDialog',
    'sap/m/StandardListItem'
], function (Controller,  SelectDialog, StandardListItem) {
    "use strict";

    return Controller.extend("management.controller.ConsultantCalendar", {


        onInit: function () {

        },
        onValueHelpRequest: function () {
             var oModel = this.getView().getModel(); 

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
            this._pValueHelpDialog.setModel(oModel);
            this._pValueHelpDialog.open();
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
});