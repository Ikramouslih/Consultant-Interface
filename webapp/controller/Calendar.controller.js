sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/unified/CalendarDayType"],
  function (Controller, CalendarDayType) {
      "use strict";

      return Controller.extend("management.controller.Calendar", {
          onInit: function () {
              var oCalendar = this.getView().byId("calendar");
              var oLegend = this.getView().byId("legend");

              // Données statiques pour les périodes disponibles et non disponibles
              var aAvailableDates = [
                  new Date(2024,4,1),
                  new Date(2024,4,2),
                  new Date(2024,4,3),
                  new Date(2024,4,13),
                  new Date(2024,4,16),
                  new Date(2024,4,21),
                  new Date(2024,4,22),
                  new Date(2024,4,24),
                  new Date(2024,4,30),
                  new Date(2024,4,31),
                  // Ajoutez plus de dates disponibles si nécessaire
              ];
              var aunAvailableDates = [
                new Date(2024,4,6),
                new Date(2024,4,7),
                new Date(2024,4,8),
                new Date(2024,4,9),
                new Date(2024,4,10),
                new Date(2024,4,14),
                new Date(2024,4,15),
                new Date(2024,4,17),
                new Date(2024,4,20),
                new Date(2024,4,23),
                new Date(2024,4,27),
                new Date(2024,4,28),
                new Date(2024,4,29),
                // Ajoutez plus de dates disponibles si nécessaire
            ];
              

              // Créer des événements pour les périodes disponibles (vert)
              aAvailableDates.forEach(function (oDate) {
                  oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                      startDate: oDate,
                      type: CalendarDayType.Type08 // Type01 pour la couleur verte (disponible)
                  }));
              });
              aunAvailableDates.forEach(function (oDate) {
                oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                    startDate: oDate,
                    type: CalendarDayType.Type02 // Type01 pour la couleur verte (disponible)
                }));
            });


              // Créer des événements pour les périodes non disponibles (rouge)

              // Ajouter des légendes pour les couleurs
              oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                  text: "Disponible",
                  type: CalendarDayType.Type08 // Type01 pour la couleur verte
              }));

              oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                  text: "Non disponible",
                  type: CalendarDayType.Type02 // Type02 pour la couleur rouge
              }));
          }
      });
  }
);
