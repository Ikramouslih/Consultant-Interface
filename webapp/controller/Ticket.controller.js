sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("management.controller.Ticket", {
    onInit: function () {
      // Définition des filtres pour chaque onglet de l'IconTabBar
      this._mFilters = {
        all: [], // Aucun filtre, affiche tout
        completed: [new Filter("Status",FilterOperator.EQ, "TERMINE")], // Tickets terminés
        in_progress: [new Filter("Status",FilterOperator.EQ, "EN-COURS")], // Tickets en cours
        not_assigned: [new Filter("Status",FilterOperator.EQ, "NON-AFFECTER")], // Tickets non affectés
      };
      var oModel = this.getOwnerComponent().getModel();
  
      // Lire le nombre total de tickets
      oModel.read("/TICKETIDSet/$count", {
        success: function (iCount) {
          // Mettre à jour le modèle avec le comptage
          var oCountModel = new sap.ui.model.json.JSONModel({ count: iCount });
          this.getView().setModel(oCountModel, "CountModel");
        }.bind(this),
        error: function (oError) {
          console.error("Erreur lors de la lecture du comptage des tickets:", oError);
        }
      });
    },

    onQuickFilter: function (oEvent) {
      var sSelectedKey = oEvent.getParameter("selectedKey");
      if (sSelectedKey === "create") {
        this.getOwnerComponent().getRouter().navTo("CreateTicket");
      }else {
        var oBinding = this.byId("idProductsTable").getBinding("items");
        var aFilters = this._mFilters[sSelectedKey];
        oBinding.filter(aFilters);
      }
    },

    // Exemple de fonction pour assigner un ticket
    onAssignTicket: function (oEvent) {
      var oSource = oEvent.getSource();
      var oBindingContext = oSource.getBindingContext();
      var sTicketId = oBindingContext.getProperty("IdTicket");

      // Logique de redirection ou autre action
      this.getOwnerComponent().getRouter().navTo("AssignTicket", { IdTicket: sTicketId });
    },

  });
});
