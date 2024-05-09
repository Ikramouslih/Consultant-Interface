sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";
 
    return Controller.extend("management.controller.Donut", {
      onInit: function () {
        this.loaddonutManagementData(); // Charger les données au démarrage
      },
 
      loaddonutManagementData: function () {
        var oModel = this.getOwnerComponent().getModel();
        var oJSONModel = new JSONModel();
 
        oModel.read("/TICKETIDSet", { // Chemin de l'entité dans OData
          success: function (oData) {
            var aGroupedData = this.groupByStatus(oData.results); // Groupement des données
            console.log("Grouped data:", aGroupedData); // Vérification des données groupées
            oJSONModel.setData({ donutManagementData: aGroupedData }); // Définit le modèle pour la vue
            this.getView().setModel(oJSONModel, "donutManagementModel"); // Associe le modèle JSON à la vue
          }.bind(this),
          error: function (oError) {
            console.error("Erreur lors de la récupération des données:", oError);
          }
        });
      },
 
      groupByStatus: function (aData) {
        var statusCounts = {}; // Objet pour stocker les comptes par statut
 
        aData.forEach(function (item) {
          var status = item.Status || "Inconnu"; // Si le statut est vide ou indéfini, le définir à "Inconnu"
 
          if (!statusCounts[status]) { // Si le statut n'existe pas dans l'objet, l'ajouter
            statusCounts[status] = 1;
          } else { // Sinon, incrémenter le compte
            statusCounts[status]++;
          }
        });
 
        var adonutManagementData = [];
 
        // Convertir l'objet de comptes en tableau pour le Donut Chart
        for (var key in statusCounts) {
          adonutManagementData.push({
            label: key, // Le label du segment (le statut)
            value: statusCounts[key], // La valeur du segment (le nombre de tickets)
            displayedValue: statusCounts[key] // La valeur affichée
          });
        }
        
        // Find the index of the item with the label "TERMINE"
        var index = adonutManagementData.findIndex(function(item) {
          return item.label === "TERMINE";
        });

        // Remove the item from the array
        if (index !== -1) {
          adonutManagementData.splice(index, 1);
        }

        // adonutManagementData.pop(); // Supprimer le dernier élément du tableau (Inconnu)
        return adonutManagementData;
      },
 
      onSelectionChanged: function (oEvent) {
        var oSelectedSegment = oEvent.getParameter("selectedSegment");
        console.log("Segment sélectionné:", oSelectedSegment.getLabel());
      }
    });
  });