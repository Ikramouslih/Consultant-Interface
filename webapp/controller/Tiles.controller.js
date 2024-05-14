sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel", // Import JSONModel
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("sap.suite.ui.commons.demo.tutorial.controller.ProcessFlow", {

      onInit: function() {
          this.loadTilesData();
          this.loadTilesData1();
          this.loadTilesData2();
          this.loadTilesData3();
      },

      loadTilesData: function() {
          var oModel = this.getOwnerComponent().getModel();
          var oJSONModel = new JSONModel();

          oModel.read("/TICKETIDSet", { // Chemin de l'entité dans OData
              success: function(oData) {
                  var aGroupedData = this.groupByStatus(oData.results); // Groupement des données
                  console.log("Grouped data:", aGroupedData); // Vérification des données groupées
                  oJSONModel.setData({ donutData: aGroupedData }); // Définit le modèle pour la vue
                  this.getView().setModel(oJSONModel, "TilesData"); // Associe le modèle JSON à la vue
              }.bind(this),
              error: function(oError) {
                  console.error("Erreur lors de la récupération des données:", oError);
              }
          });
      },
      
      groupByStatus: function(aData) {
          var statusCounts = { unassigned: 0, assigned: 0 }; // Initialiser les comptes

          aData.forEach(function(item) {
              var status = item.Status || "Inconnu"; // Si le statut est vide ou indéfini, le définir à "Inconnu"
              
              if (status === "EN-COURS") {
                  statusCounts.unassigned++;
              } else if (status === "TERMINE") {
                  statusCounts.assigned++;
              }
          });

          var aDonutData = [];

          // Convertir l'objet de comptes en tableau pour le Donut Chart
          for (var key in statusCounts) {
              aDonutData.push({
                  label: key, // Le label du segment (le statut)
                  value: statusCounts[key], // La valeur du segment (le nombre de tickets)
                  displayedValue: statusCounts[key] // La valeur affichée
              });
          }
          return aDonutData;
      },    
      loadTilesData1: function() {
          var oModel = this.getOwnerComponent().getModel();
          var oJSONModel = new JSONModel();

          // Define the filter for availability
          var oFilter = new Filter("Disponilbilty", FilterOperator.EQ, "1");

          oModel.read("/CONSULTANTIDSet", { // Chemin de l'entité dans OData
              filters: [oFilter],
              success: function(oData) {
                  var groupedData = this.groupByCountry(oData.results); // Groupement des données
                  console.log("Grouped data:", groupedData); // Vérification des données groupées
                  oJSONModel.setData({ tilesData1: groupedData }); // Définit le modèle pour la vue
                  this.getView().setModel(oJSONModel, "TilesData1"); // Associe le modèle JSON à la vue
              }.bind(this),
              error: function(oError) {
                  console.error("Erreur lors de la récupération des données:", oError);
              }
          });
      },
      
      groupByCountry: function(aData) {
          var countryCounts = {}; // Initialiser les comptes par pays

          aData.forEach(function(item) {
              var country = item.Country || "Inconnu"; // Si le pays est vide ou indéfini, le définir à "Inconnu"
              
              if (!countryCounts[country]) { // Si le pays n'existe pas dans l'objet, l'ajouter
                  countryCounts[country] = 1;
              } else { // Sinon, incrémenter le compte
                  countryCounts[country]++;
              }
          });

          var aGroupedData1 = [];

          // Convertir l'objet de comptes en tableau pour l'affichage
          for (var key in countryCounts) {
              aGroupedData1.push({
                  country: key, // Le pays
                  value: countryCounts[key] // Le nombre de consultants disponibles
              });
          }
          return aGroupedData1;
      },
         
      loadTilesData2: function() {
          var oModel = this.getOwnerComponent().getModel();
          var oJSONModel = new JSONModel();

          // Define the filter for availability

          oModel.read("/CONSULTANTIDSet", { // Chemin de l'entité dans OData
              success: function(oData) {
                  var groupedData = this.groupByCountry(oData.results); // Groupement des données
                  console.log("Grouped data:", groupedData); // Vérification des données groupées
                  oJSONModel.setData({ tilesData2: groupedData }); // Définit le modèle pour la vue
                  this.getView().setModel(oJSONModel, "TilesData2"); // Associe le modèle JSON à la vue
              }.bind(this),
              error: function(oError) {
                  console.error("Erreur lors de la récupération des données:", oError);
              }
          });
      },
      
      groupByCountry: function(aData) {
          var countryCounts = {}; // Initialiser les comptes par pays

          aData.forEach(function(item) {
              var country = item.Country || "Inconnu"; // Si le pays est vide ou indéfini, le définir à "Inconnu"
              
              if (!countryCounts[country]) { // Si le pays n'existe pas dans l'objet, l'ajouter
                  countryCounts[country] = 1;
              } else { // Sinon, incrémenter le compte
                  countryCounts[country]++;
              }
          });

          var aGroupedData2 = [];

          // Convertir l'objet de comptes en tableau pour l'affichage
          for (var key in countryCounts) {
              aGroupedData2.push({
                  country: key, // Le pays
                  value: countryCounts[key] // Le nombre de consultants disponibles
              });
          }
          return aGroupedData2;
      },
         
      loadTilesData3: function() {
          var oModel = this.getOwnerComponent().getModel();
          var oJSONModel = new JSONModel();

          // Define the filter for availability
          oModel.read("/MANAGERIDSet", { // Chemin de l'entité dans OData
              success: function(oData) {
                  var groupedData = this.groupByCountry(oData.results); // Groupement des données
                  console.log("Grouped data:", groupedData); // Vérification des données groupées
                  oJSONModel.setData({ tilesData3: groupedData }); // Définit le modèle pour la vue
                  this.getView().setModel(oJSONModel, "TilesData3"); // Associe le modèle JSON à la vue
              }.bind(this),
              error: function(oError) {
                  console.error("Erreur lors de la récupération des données:", oError);
              }
          });
      },
      
      groupByCountry: function(aData) {
          var countryCounts = {}; // Initialiser les comptes par pays

          aData.forEach(function(item) {
              var country = item.Country || "Inconnu"; // Si le pays est vide ou indéfini, le définir à "Inconnu"
              
              if (!countryCounts[country]) { // Si le pays n'existe pas dans l'objet, l'ajouter
                  countryCounts[country] = 1;
              } else { // Sinon, incrémenter le compte
                  countryCounts[country]++;
              }
          });

          var aGroupedData3 = [];

          // Convertir l'objet de comptes en tableau pour l'affichage
          for (var key in countryCounts) {
              aGroupedData3.push({
                  country: key, // Le pays
                  value: countryCounts[key] // Le nombre de consultants disponibles
              });
          }
          return aGroupedData3;
      }
  });
});
