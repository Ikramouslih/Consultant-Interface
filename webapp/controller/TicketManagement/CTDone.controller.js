sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("management.controller.TicketManagement.Ticket", {

    onInit: function () {
      // Call function to load tickets with associated project names
      this.loadTicketsWithProjectNames();
    },

    // Load tickets with associated project names
    loadTicketsWithProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();
      var oDoneFilter = new Filter("Status", FilterOperator.EQ, "TERMINE");
      var aTickets = [];
      var aProjects = [];

      // Read tickets filtered by 'TERMINE' status
      oModel.read("/TICKETIDSet", {
        filters: [oDoneFilter],
        success: function (oData) {
          aTickets = oData.results;
          checkIfBothLoaded(); // Check if both tickets and projects data are loaded
        },
        error: function (oError) {
          console.error("Error reading tickets:", oError);
        }
      });

      // Read all projects
      oModel.read("/PROJECTIDSet", {
        success: function (oData) {
          aProjects = oData.results;
          checkIfBothLoaded(); // Check if both tickets and projects data are loaded
        },
        error: function (oError) {
          console.error("Error reading projects:", oError);
        }
      });

      // Function to merge tickets with project names once both are loaded
      var checkIfBothLoaded = function () {
        if (aTickets.length > 0 && aProjects.length > 0) {
          // Create a map of project IDs to project names
          var oProjectMap = aProjects.reduce(function (map, project) {
            map[project.IdProject] = project.NomProjet;
            return map;
          }, {});

          // Merge ticket data with project names
          var aMergedData = aTickets.map(function (ticket) {
            ticket.ProjectName = oProjectMap[ticket.Project] || "-"; // Assign project name or '-' if not found
            return ticket;
          });

          // Create JSON model with merged ticket data and set it to the view
          var oTicketsModel = new JSONModel({ Tickets: aMergedData, TicketCount: aMergedData.length });
          this.getView().setModel(oTicketsModel, "TicketsModel");
        }
      }.bind(this); // Ensure 'this' refers to the controller instance
    },

    // Event handler for the quick filter selection
    formatPriorityColor: function (sPriority) {
      // Return color based on priority
      switch (sPriority) {
        case "HIGH":
          return 2; // Red color
        case "MEDIUM":
          return 1; // Yellow color
        case "LOW":
          return 8; // Green color
        default:
          return; // No color specified
      }
    },

    // Event handler for the quick filter selection
    formatPriorityIcon: function (sPriority) {
      // Return icon based on priority
      switch (sPriority) {
        case "HIGH":
          return "sap-icon://arrow-top"; // Arrow pointing upwards
        case "MEDIUM":
          return "sap-icon://line-charts"; // Line charts icon
        case "LOW":
          return "sap-icon://arrow-bottom"; // Arrow pointing downwards
        default:
          return ""; // No icon specified
      }
    },

    // Event handler for the quick filter selection
    formatDate: function (sDate) {
      if (!sDate) {
        return "-"; // Return '-' if date is not provided
      }

      // Ensure the date string is in the expected format
      if (sDate.length !== 8) {
        console.warn("Invalid date format: " + sDate); // Log a warning for invalid date format
        return sDate; // Return the date string as is
      }

      // Extract year, month, and day from the date string
      var year = sDate.substring(0, 4);
      var month = sDate.substring(4, 6);
      var day = sDate.substring(6, 8);

      // Return the formatted date in DD/MM/YYYY format
      return day + "/" + month + "/" + year;
    }
    
  });
});
