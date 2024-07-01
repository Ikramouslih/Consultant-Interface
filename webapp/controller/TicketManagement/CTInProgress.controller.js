sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Component",
  "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, JSONModel, Component, MessageToast) {
  "use strict";

  return Controller.extend("management.controller.TicketManagement.CTInProgress", {
    onInit: function () {
      this.loadTicketsWithProjectNames();
    },

    loadTicketsWithProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();

      // Get userId from the i18n model and fetch user data
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
      var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var sUserId = oBundle.getText("userId");

      var oInProgressFilter = [new Filter("Status", FilterOperator.EQ, "In Progress"),
                               new Filter("Consultant", FilterOperator.EQ, sUserId)
      ];

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
        if (aTickets.length == 0) {
          var oTicketsModel = new JSONModel({ Tickets: [], TicketCount: 0 });
          this.getView().setModel(oTicketsModel, "TicketsModel");
          return;
        }
       
        if (aTickets.length > 0 && aProjects.length > 0) {
          var oProjectMap = aProjects.reduce(function (map, project) {
            map[project.IdProject] = project.NomProjet;
            return map;
          }, {});
 
          var aMergedData = aTickets.map(function (ticket) {
            ticket.ProjectName = oProjectMap[ticket.Projet] || "-";
            return ticket;
          });
 
          var oTicketsModel = new JSONModel({ Tickets: aMergedData });
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
      return day + "-" + month + "-" + year;
    },

    getSelectedItemContext: function () {
      var oTable = this.byId("idProductsTable");
      var aSelectedItems = oTable.getSelectedItems();
      var oSelectedItem = aSelectedItems[0];
      if(oSelectedItem){
        var oSelectedItemContext = oSelectedItem.getBindingContext("TicketsModel");
        return oSelectedItemContext;
      }
      else {
				MessageToast.show("Please select a ticket.");
				return;
			}
    },

    onDropInProgress: function(oEvent) {

			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext("TicketsModel");
			if (!oDraggedItem) {
				return;
			}

      var sStartDate = oDraggedItemContext.getProperty("StartDate");

      if(!sStartDate){
        var date = new Date();
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString().padStart(2, '0');
        var dd = date.getDate().toString().padStart(2, '0');
        var sStartDate = yyyy + mm + dd;
      }

			var oOwnerComponent = Component.getOwnerComponentFor(this.getView());
			var oTicketController = oOwnerComponent.byId("CTicket").getController();
			oTicketController.moveItemToTable(oDraggedItemContext, "In Progress", sStartDate, "");
		},
  });
});
