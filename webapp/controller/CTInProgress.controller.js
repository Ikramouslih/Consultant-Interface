sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Component"
], function (Controller, Filter, FilterOperator, JSONModel, Component) {
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
      var oInProgressFilter = new Filter("Status", FilterOperator.EQ, "In Progress");
      var aTickets = [];
      var aProjects = [];

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
        case "High":
          return "sap-icon://arrow-top";
        case "Medium":
          return "sap-icon://line-charts";
        case "Low":
          return "sap-icon://arrow-bottom";
        default:
          return "sap-icon://arrow-bottom";
      }
    },

    formatPriorityColor: function (sPriority) {
      switch (sPriority) {
        case "High":
          return 2;
        case "Medium":
          return 1;
        case "Low":
          return 8;
        default:
          return 8;
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
    },

    getSelectedItemContext: function () {
      var oTable = this.byId("idProductsTable");
      var aSelectedItems = oTable.getSelectedItems();
      var oSelectedItem = aSelectedItems[0];
      var oSelectedItemContext = oSelectedItem.getBindingContext("TicketsModel");
      if (!oSelectedItem) {
				MessageToast.show("Please select a row!");
				return;
			}
      // var oModel = this.getView().getModel("TicketsModel");
      // var aTickets = oModel.getProperty("/Tickets");
      console.log("we got the selected item to change it  "+oSelectedItemContext);
      return oSelectedItemContext;
    },

    onDropInProgress: function(oEvent) {
      console.log("Bonjour je suis dedans");
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext("TicketsModel");
      console.log("Bonjour j'ai récupéré le context de l'item");
			if (!oDraggedItem) {
				return;
			}
      console.log("Bonjour j'ai dépassé la condition");
      var sStartDate = oDraggedItemContext.getProperty("StartDate");

			var oOwnerComponent = Component.getOwnerComponentFor(this.getView());
			var oTicketController = oOwnerComponent.byId("CTicket").getController();
			oTicketController.moveItemToTable(oDraggedItemContext, "In Progress", sStartDate, "");

			// reset the rank property and update the model to refresh the bindings
			/* var oAvailableProductsTable = Utils.getAvailableProductsTable(this);
			// var oProductsModel = oAvailableProductsTable.getModel();
			 oProductsModel.setProperty("Rank", Utils.ranking.Initial, oDraggedItemContext);*/
		},
  });
});
