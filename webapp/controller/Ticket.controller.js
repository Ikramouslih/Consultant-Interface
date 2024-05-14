sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("management.controller.Ticket", {
    onInit: function () {
      // Définition des filtres pour chaque onglet de l'IconTabBar
      this._mFilters = {
        all: [], // Aucun filtre, affiche tout
        completed: [new Filter("Status", FilterOperator.EQ, "TERMINE")], // Tickets terminés
        in_progress: [new Filter("Status", FilterOperator.EQ, "EN-COURS")], // Tickets en cours
        not_assigned: [new Filter("Status", FilterOperator.EQ, "NON-AFFECTER")] // Tickets non affectés
      };
      var oModel = this.getOwnerComponent().getModel();

      // Lire le nombre total de tickets
      oModel.read("/TICKETIDSet/$count", {
        success: function (iCount) {
          // Mettre à jour le modèle avec le comptage
          var oCountModel = new JSONModel({ count: iCount });
          this.getView().setModel(oCountModel, "CountModel");
        }.bind(this),
        error: function (oError) {
          console.error("Erreur lors de la lecture du comptage des tickets:", oError);
        }
      });

      // Load tickets with consultant names
      this.loadTicketsWithConsultantNames();
    },

    loadTicketsWithConsultantNames: function () {
      var oModel = this.getOwnerComponent().getModel();
      var aTickets = [];
      var aConsultants = [];

      // Fetch tickets
      oModel.read("/TICKETIDSet", {
        success: function (oData) {
          aTickets = oData.results;
          checkIfBothLoaded();
        },
        error: function (oError) {
          console.error("Erreur lors de la lecture des tickets:", oError);
        }
      });

      // Fetch consultants
      oModel.read("/CONSULTANTIDSet", {
        success: function (oData) {
          aConsultants = oData.results;
          checkIfBothLoaded();
        },
        error: function (oError) {
          console.error("Erreur lors de la lecture des consultants:", oError);
        }
      });

      // Check if both requests are done and then merge data
      var checkIfBothLoaded = function () {
        if (aTickets.length > 0 && aConsultants.length > 0) {
          var oConsultantMap = aConsultants.reduce(function (map, consultant) {
            map[consultant.ConsultantId] = consultant.Name + " " + consultant.FirstName;
            return map;
          }, {});

          var aMergedData = aTickets.map(function (ticket) {
            ticket.ConsultantName = oConsultantMap[ticket.Consultant] || "-";
            return ticket;
          });

          // Update the model with merged data
          var oTicketsModel = new JSONModel(aMergedData);
          this.getView().setModel(oTicketsModel, "TicketsModel");
        }
      }.bind(this);
    },

    onQuickFilter: function (oEvent) {
      var sSelectedKey = oEvent.getParameter("selectedKey");
      if (sSelectedKey === "create") {
        this.getOwnerComponent().getRouter().navTo("CreateTicket");
      }else {
        var oBinding = this.byId("idProductsTable").getBinding("rows");
        var aFilters = this._mFilters[sSelectedKey];
        oBinding.filter(aFilters);
      }
    },

    // Exemple de fonction pour assigner un ticket
    onAssignTicket: function (oEvent) {
      var oSource = oEvent.getSource();
      var oBindingContext = oSource.getBindingContext("TicketsModel");
      var sTicketId = oBindingContext.getProperty("IdTicket");

      // Logique de redirection ou autre action
      this.getOwnerComponent().getRouter().navTo("AssignTicket", { IdTicket: sTicketId });
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
