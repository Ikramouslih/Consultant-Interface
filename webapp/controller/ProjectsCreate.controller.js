sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("management.controller.ProjectsCreate", {

      onInit: function () {

      },

      onCreateProjects: function () {

        var sProjectName = this.getView().byId("ProjectName").getValue().toUpperCase();
        var sProjectId = sProjectName.substring(0, 3) + ('000' + Math.floor(Math.random() * 1000)).slice(-3);
        var sChefProjet = this.getView().byId("ChefProjet").getValue();
        var oData = {
          IdProject: sProjectId,
          NomProjet: sProjectName,
          ChefProjet: sChefProjet,
        };

        var oModel = this.getView().getModel();

        oModel.create("/PROJECTIDSet", oData, {
          success: function () {
            sap.m.MessageToast.show("Données ajoutées avec succès");
            this.getView().byId("ProjectName").setValue("");
            this.getView().byId("ChefProjet").setValue("");
          }.bind(this),
          error: function (oError) {
            sap.m.MessageToast.show("Erreur lors de l'ajout des données : " + oError.message);
          }
        })
      }

    });
  }
);