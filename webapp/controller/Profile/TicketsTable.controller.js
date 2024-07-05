sap.ui.define(
  ["sap/ui/core/mvc/Controller", 
   "sap/m/MessageToast", 
   "sap/ui/Device", 
   "sap/ui/model/Filter",
   "sap/ui/model/FilterOperator"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Profile.TicketsTable", {

      onInit: function () { 
      },

      // Filter the posts based on the user input
      onFilterPosts: function (oEvent) {

        var aFilter = [];

        // Get the query string entered by the user
        var sQuery = oEvent.getParameter("query");

        // If the query string is not empty, create a filter
        if (sQuery) {
          aFilter.push(new Filter("Title", FilterOperator.Contains, sQuery));
        }

        // Apply the filter(s) to the binding
        var oTable = this.byId("table");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilter);

      },

      // Show the ticket information in a dialog
      showTicketInfo: function (oEvent) {

        if (!this._pTicketDetailsDialog) {
          this._pTicketDetailsDialog = Fragment.load({
            id: this.getView().getId(),
            name: "management.view.Fragments.TicketDetails",
            controller: this
          }).then(function (oDialog) {
            this.getView().addDependent(oDialog);
            return oDialog;
          }.bind(this));
        }
        this._pTicketDetailsDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      onCloseDialog: function () {
        this.byId("ticketDetailsDialog").close();
      },
    });
  }
);
