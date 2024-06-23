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

        // Check if the dialog has not been created yet
        if (!this.oFixedSizeDialog) {
          this.oFixedSizeDialog = new Dialog({
            title: "Available Products",
            contentWidth: "550px",
            contentHeight: "300px",
            content: new List({
              items: {
                path: "/ProductCollection", 
                template: new StandardListItem({
                  title: "{Name}", 
                  counter: "{Quantity}"
                })
              }
            }),
            // Add a close button to the dialog
            endButton: new Button({
              text: "Close",
              press: function () {
                this.oFixedSizeDialog.close();
              }.bind(this)
            })
          });

          // Add the dialog as a dependent of the view
          this.getView().addDependent(this.oFixedSizeDialog);
        }

        // Open the dialog
        this.oFixedSizeDialog.open();
      }

    });
  }
);
