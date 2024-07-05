sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
], function (Controller, JSONModel, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("management.controller.Profile.ConsultantDetails", {
    
    onInit: function () {

      // Add appropriate content density class to the view
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

      // Get userId from the i18n model
      var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var sConsultantId = oBundle.getText("userId");

      // Bind the view to the consultant data
      this.getView().bindElement({
        path: "/CONSULTANTIDSet('" + sConsultantId + "')",
        events: {
          dataReceived: function(oData) {
            // Handle data received event if needed
          }
        }
      });

      // Fetch ticket data based on the consultant ID
      var oModel = this.getOwnerComponent().getModel();
      var oFilter = new Filter("Consultant", FilterOperator.EQ, sConsultantId);
      
      oModel.read("/TICKETIDSet", {
        filters: [oFilter],
        success: function (response) {
          // Set the fetched ticket data to the model
          var oJSONModel = this.getView().getModel("TICKETIDDATA");
          oJSONModel.setData(response.results);
          this.loadDonutData(sConsultantId); // Load data for the donut chart
        }.bind(this),
        error: function (error) {
          console.error("Error while fetching ticket data:", error);
        }
      });
      
      // Create and set the JSON model for ticket data
      var oJSONModel = new JSONModel();
      this.getView().setModel(oJSONModel, "TICKETIDDATA");
      this.loadDonutData(sConsultantId); // Load data at initialization
    },

    // Load data for the donut chart
    loadDonutData: function (sConsultantId) {
      var oModel = this.getOwnerComponent().getModel();
      var oJSONModel = new JSONModel();
      var oFilter = new Filter("Consultant", FilterOperator.EQ, sConsultantId);

      // Fetch data for the donut chart based on consultant ID
      oModel.read("/TICKETIDSet", {
        filters: [oFilter],
        success: function (oData) {
          // Group data by status and set to the model for the donut chart
          var aGroupedData = this.groupByStatus(oData.results);
          oJSONModel.setData({ donutData: aGroupedData });
          this.getView().setModel(oJSONModel, "donutModel");
        }.bind(this),
        error: function (oError) {
          console.error("Error retrieving data:", oError);
        }
      });
    },

    // Group ticket data by status for the donut chart
    groupByStatus: function (aData) {
      var statusCounts = {}; // Object to store counts by status

      // Count the number of tickets for each status
      aData.forEach(function (item) {
        var status = item.Status || "Inconnu"; // Default to "Inconnu" if status is empty

        if (!statusCounts[status]) {
          statusCounts[status] = 1;
        } else {
          statusCounts[status]++;
        }
      });

      // Convert the counts object to an array for the donut chart
      var aDonutData = [];
      for (var key in statusCounts) {
        aDonutData.push({
          label: key, // Segment label (status)
          value: statusCounts[key], // Segment value (number of tickets)
          displayedValue: statusCounts[key] + " tickets" // Displayed value
        });
      }

      return aDonutData;
    },

    // Event handler for donut chart selection change
    onSelectionChanged: function (oEvent) {
      var oSelectedSegment = oEvent.getParameter("selectedSegment");
      // Handle the selection change if needed
    },

    // Show ticket info in a dialog
    showTicketInfo: function (oEvent) {
      var oSelectedItem = oEvent.getSource();
      var oTicketContext = oSelectedItem.getBindingContext("TICKETIDDATA");
      var oTicketDetails = oTicketContext.getObject();

      // Lazy load the dialog fragment if not already loaded
      if (!this._oDialog) {
        this._oDialog = sap.ui.xmlfragment("management.view.Fragments.TicketDetails", this);
        this.getView().addDependent(this._oDialog);
      }

      // Set the ticket details model to the dialog
      this._oDialog.setModel(new sap.ui.model.json.JSONModel(oTicketDetails));
      this._oDialog.bindElement("/");

      // Open the dialog
      this._oDialog.open();
    },

    // Close the ticket info dialog
    onCloseDialog: function () {
      if (this._oDialog) {
        this._oDialog.close();
      }
    },

    // Search functionality for filtering tickets
    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue");
      var oTable = this.getView().byId("idProductsTable");
      var oBinding = oTable.getBinding("items");
      var oFilter = new Filter("Titre", FilterOperator.Contains, sQuery);
      oBinding.filter(oFilter);
    }

  });
});
