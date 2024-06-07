sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("management.controller.Ticket", {
    onInit: function () {
      /*this._mFilters = {
        all: [], // No filter, show all
        completed: [new Filter("Status", FilterOperator.EQ, "TERMINE")], // Completed tickets
        in_progress: [new Filter("Status", FilterOperator.EQ, "EN-COURS")], // In progress tickets
        not_assigned: [new Filter("Status", FilterOperator.EQ, "NON-AFFECTER")] // Not assigned tickets
      };*/

      // var oModel = this.getOwnerComponent().getModel();
      // this._setCounts(oModel);
      this.loadTicketsWithProjectNames();
    },

    loadTicketsWithProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();
      var oDoneFilter = new Filter("Status", FilterOperator.EQ, "TERMINE");
      var aTickets = [];
      var aProjects = [];

      oModel.read("/TICKETIDSet", {
        filters: [oDoneFilter],
        success: function (oData) {
          aTickets = oData.results;
          checkIfBothLoaded();
        },
        error: function (oError) {
          console.error("Error reading tickets:", oError);
        }
      });

      oModel.read("/PROJECTIDSet", {
        success: function (oData) {
          aProjects = oData.results;
          checkIfBothLoaded();
        },
        error: function (oError) {
          console.error("Error reading projects:", oError);
        }
      });

      var checkIfBothLoaded = function () {
        if (aTickets.length > 0 && aProjects.length > 0) {
          var oProjectMap = aProjects.reduce(function (map, project) {
            map[project.IdProject] = project.NomProjet;
            return map;
          }, {});

          var aMergedData = aTickets.map(function (ticket) {
            ticket.ProjectName = oProjectMap[ticket.Project] || "-";
            return ticket;
          });

          var oTicketsModel = new JSONModel({ Tickets: aMergedData, TicketCount: aMergedData.length });
          this.getView().setModel(oTicketsModel, "TicketsModel");
        }
      }.bind(this);
    },

    formatPriorityColor: function (sPriority) {
      switch (sPriority) {
        case "HIGH":
          return 2;
        case "MEDIUM":
          return 1;
        case "LOW":
          return 8;
        default:
          return;
      }
    },

    formatPriorityIcon: function (sPriority) {
      switch (sPriority) {
        case "HIGH":
          return "sap-icon://arrow-top";
        case "MEDIUM":
          return "sap-icon://line-charts";
        case "LOW":
          return "sap-icon://arrow-bottom";
        default:
          return "";
      }
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

      // Return the formatted date
      return day + "/" + month + "/" + year;
    }
  });
});
