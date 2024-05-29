sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("management.controller.CreateConsultant", {

      onInit: function () {

      },

      onCreateConsultant: function () {

        var sName = this.getView().byId("Name").getValue().toUpperCase();
        var sFirstName = this.getView().byId("FirstName").getValue();
        sFirstName = sFirstName.charAt(0).toUpperCase() + sFirstName.slice(1).toLowerCase();
        var sConsultantId = sFirstName.substring(0, 1).toUpperCase() + sName.substring(0, 2).toUpperCase() + ('000' + Math.floor(Math.random() * 1000)).slice(-3);
        var sEmail = this.getView().byId("Email").getValue();

        var oData = {
          ConsultantId: sConsultantId,
          Name: sName,
          FirstName: sFirstName,
          Email: sEmail
        };

        var oModel = this.getView().getModel();
        
        oModel.create("/CONSULTANTIDSet", oData, {
          success: function () {
            sap.m.MessageToast.show("Données ajoutées avec succès");
            this.getView().byId("Name").setValue("");
            this.getView().byId("FirstName").setValue("");
            this.getView().byId("Email").setValue("");
          }.bind(this),
          error: function (oError) {
            sap.m.MessageToast.show("Erreur lors de l'ajout des données : " + oError.message);
          }
        })
      }

    });
  }
);
