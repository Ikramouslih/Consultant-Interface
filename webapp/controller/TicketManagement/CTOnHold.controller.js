sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/ui/core/Component",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageToast, Component, JSONModel) {
  "use strict";

  return Controller.extend("management.controller.TicketManagement.CTOnHold", {
    onInit: function () {
      this.loadTicketsWithProjectNames();
    },

    loadTicketsWithProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();

      // Get userId from the i18n model and fetch user data
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
      var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var sUserId = oBundle.getText("userId");

      var oOnHoldFilter = [new Filter("Status", FilterOperator.EQ, "On Hold"),
                         new Filter("Consultant", FilterOperator.EQ, sUserId)
      ];

      var aTickets = [];
      var aProjects = [];

      oModel.read("/TICKETIDSet", {
        filters: [oOnHoldFilter],
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
          return 8;
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

    formatDate: function (sDate) {
      if (!sDate) {
        return "-";
      }

      if (sDate.length !== 8) {
        console.warn("Invalid date format: " + sDate);
        return sDate;
      }

      var year = sDate.substring(0, 4);
      var month = sDate.substring(4, 6);
      var day = sDate.substring(6, 8);

      return day + "-" + month + "-" + year;
    },

    getSelectedItemContext: function () {
      var oTable = this.byId("idProductsTable");
      var aSelectedItems = oTable.getSelectedItems();
      if (aSelectedItems.length === 0) {
        MessageToast.show("Please select a ticket!");
        return null;
      }
      var oSelectedItem = aSelectedItems[0];
      return oSelectedItem.getBindingContext("TicketsModel");
    },

    onDropOnHold: function(oEvent) {
      var oDraggedItem = oEvent.getParameter("draggedControl");
      var oDraggedItemContext = oDraggedItem.getBindingContext("TicketsModel");
      if (!oDraggedItemContext) {
        return;
      }

      var sStartDate = oDraggedItemContext.getProperty("StartDate");

      var oOwnerComponent = Component.getOwnerComponentFor(this.getView());
      var oTicketController = oOwnerComponent.byId("CTicket").getController();
      oTicketController.moveItemToTable(oDraggedItemContext, "On Hold", sStartDate, "");
    }
  });
});
