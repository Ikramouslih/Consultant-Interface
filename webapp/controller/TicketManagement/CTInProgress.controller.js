sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Component"
], function (Controller, Filter, FilterOperator, JSONModel, Component) {
  "use strict";

  return Controller.extend("management.controller.TicketManagement.Ticket", {

    onInit: function () {
      this.loadTicketsWithProjectNames();
    },

    // Load tickets with associated project names
    loadTicketsWithProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();
      var oInProgressFilter = new Filter("Status", FilterOperator.EQ, "In Progress");
      var aTickets = [];
      var aProjects = [];

      // Read tickets with 'In Progress' status
      oModel.read("/TICKETIDSet", {
        filters: [oInProgressFilter],
        success: function (oData) {
          aTickets = oData.results;
          checkIfBothLoaded();
        },
        error: function (oError) {
          console.error("Error reading tickets:", oError);
        }
      });

      // Read all projects
      oModel.read("/PROJECTIDSet", {
        success: function (oData) {
          aProjects = oData.results;
          checkIfBothLoaded();
        },
        error: function (oError) {
          console.error("Error reading projects:", oError);
        }
      });

      // Function to check if both tickets and projects are loaded
      var checkIfBothLoaded = function () {
        if (aTickets.length > 0 && aProjects.length > 0) {
          // Create a map of Project IDs to Project Names
          var oProjectMap = aProjects.reduce(function (map, project) {
            map[project.IdProject] = project.NomProjet;
            return map;
          }, {});

          // Merge ticket data with project names
          var aMergedData = aTickets.map(function (ticket) {
            ticket.ProjectName = oProjectMap[ticket.Project] || "-";
            return ticket;
          });

          // Create JSON model for tickets with merged data
          var oTicketsModel = new JSONModel({ Tickets: aMergedData, TicketCount: aMergedData.length });
          this.getView().setModel(oTicketsModel, "TicketsModel");
        }
      }.bind(this); // Ensure 'this' refers to the controller inside checkIfBothLoaded function
    },

    // Format priority color based on priority level
    formatPriorityColor: function (sPriority) {
      switch (sPriority) {
        case "High":
          return 2; // Red
        case "Medium":
          return 1; // Yellow
        case "Low":
          return 8; // Grey
        default:
          return 8; 
      }
    },

    // Format priority icon based on priority level
    formatPriorityIcon: function (sPriority) {
      switch (sPriority) {
        case "High":
          return "sap-icon://arrow-top"; // Arrow pointing up for high priority
        case "Medium":
          return "sap-icon://line-charts"; // Line chart for medium priority
        case "Low":
          return "sap-icon://arrow-bottom"; // Arrow pointing down for low priority
        default:
          return "sap-icon://arrow-bottom"; // Default to arrow down if not recognized
      }
    },

    // Format date from YYYYMMDD to DD/MM/YYYY
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

      // Return the formatted date
      return day + "/" + month + "/" + year;
    },

    // Get selected item context from the 'TicketsModel'
    getSelectedItemContext: function () {
      var oTable = this.byId("idProductsTable");
      var aSelectedItems = oTable.getSelectedItems();
      var oSelectedItem = aSelectedItems[0];
      var oSelectedItemContext = oSelectedItem.getBindingContext("TicketsModel");
      if (!oSelectedItem) {
        MessageToast.show("Please select a row!"); // Show message if no row is selected
        return;
      }
      return oSelectedItemContext;
    },

    // Move selected item to 'In Progress' status
    onDropInProgress: function(oEvent) {
      var oDraggedItem = oEvent.getParameter("draggedControl");
      var oDraggedItemContext = oDraggedItem.getBindingContext("TicketsModel");
      if (!oDraggedItem) {
        return;
      }
      var sStartDate = oDraggedItemContext.getProperty("StartDate");

      // Get controller of 'CTicket' and call moveItemToTable function
      var oOwnerComponent = Component.getOwnerComponentFor(this.getView());
      var oTicketController = oOwnerComponent.byId("CTicket").getController();
      oTicketController.moveItemToTable(oDraggedItemContext, "In Progress", sStartDate, "");

    },
  });
});
