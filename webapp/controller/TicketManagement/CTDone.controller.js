sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/ui/core/Component",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/format/DateFormat"
], function (Controller, Filter, FilterOperator, MessageToast, Component, JSONModel, DateFormat) {
  "use strict";

  return Controller.extend("management.controller.TicketManagement.CTDone", {
    onInit: function () {
      this.loadTicketsWithProjectNames();
    },

    loadTicketsWithProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();
      var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyyMMdd" });
      var oToday = new Date();
      var o30DaysAgo = new Date(oToday);
      o30DaysAgo.setDate(oToday.getDate() - 30);

      var s30DaysAgo = oDateFormat.format(o30DaysAgo);
      var sToday = oDateFormat.format(oToday);

      var oDoneFilter = [new Filter("Status", FilterOperator.EQ, "Done"),
                        new Filter("Consultant", FilterOperator.EQ, "C-IMO777")
      ];
      var aTickets = [];
      var aProjects = [];

      oModel.read("/TICKETIDSet", {
        filters: [oDoneFilter],
        success: function (oData) {
          aTickets = oData.results;
          console.log("Tickets:", aTickets);
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
            ticket.ProjectName = oProjectMap[ticket.Projet] || "-";
            return ticket;
          });

          var oTicketsModel = new JSONModel({ Tickets: aMergedData });
          this.getView().setModel(oTicketsModel, "TicketsModel");
        }
      }.bind(this);
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
      var oSelectedItem = aSelectedItems[0];
      if (!oSelectedItem) {
        MessageToast.show("Please select a row!");
        return null;
      }
      var oSelectedItemContext = oSelectedItem.getBindingContext("TicketsModel");
      return oSelectedItemContext;
    },

    onDropDone: function (oEvent) {
      var oDraggedItem = oEvent.getParameter("draggedControl");
      var oDraggedItemContext = oDraggedItem.getBindingContext("TicketsModel");
      if (!oDraggedItemContext) {
        return;
      }

      var sStartDate = oDraggedItemContext.getProperty("StartDate");
      var date = new Date();
      var yyyy = date.getFullYear().toString();
      var mm = (date.getMonth() + 1).toString().padStart(2, '0');
      var dd = date.getDate().toString().padStart(2, '0');
      var sEndDate = yyyy + mm + dd;

      var oOwnerComponent = Component.getOwnerComponentFor(this.getView());
      var oTicketController = oOwnerComponent.byId("CTicket").getController();
      oTicketController.moveItemToTable(oDraggedItemContext, "Done", sStartDate, sEndDate);
    }
  });
});
