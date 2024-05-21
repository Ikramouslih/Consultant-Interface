sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("management.controller.TicketCreate", {

      onInit: function () {

      },

      onCreateTicket: function () {

        var sIdTicketJira = this.getView().byId("IdTicketJira").getValue();
        var sTitre = this.getView().byId("Titre").getValue();
        var sProjet = this.getView().byId("Projet").getSelectedItem().getKey();
        var sDescription = this.getView().byId("Description").getValue();
        var sTechnology = this.getView().byId("Technology").getValue();
        var sConsultantId = this.getView().byId("Consultant").getSelectedItem().getKey();
        var sEstimated = this.getView().byId("Estimated").getValue();
        var intEstimated = parseInt(sEstimated, 10);

        if (sConsultantId === null) {
          var oData = {
            IdTicket: sIdTicketJira,
            IdJira: sIdTicketJira,
            Titre: sTitre,
            Projet: sProjet,
            Description: sDescription,
            Technology: sTechnology,
            Status: 'NON-AFFECTER',
            Estimated: intEstimated,
            CreationDate: this._formatDate(new Date())
          };
        }
        else {
          var oData = {
            IdTicket: sIdTicketJira,
            IdJira: sIdTicketJira,
            Titre: sTitre,
            Projet: sProjet,
            Description: sDescription,
            Technology: sTechnology,
            Status: 'EN-COURS',
            Consultant: sConsultantId,
            Estimated: intEstimated,
            CreationDate: this._formatDate(new Date())
          };
        }

        var oModel = this.getView().getModel();

        oModel.create("/TICKETIDSet", oData, {
          success: function () {
            sap.m.MessageToast.show("Données ajoutées avec succès");
            this.getView().byId("IdTicketJira").setValue("");
            this.getView().byId("Titre").setValue("");
            this.getView().byId("Projet").setValue("");
            this.getView().byId("Description").setValue("");
            this.getView().byId("Technology").setValue("");
            this.getView().byId("Estimated").setValue("");
          }.bind(this),
          error: function (oError) {
            sap.m.MessageToast.show("Erreur lors de l'ajout des données : " + oError.message);
          }
        })
      },

      _formatDate: function (date) {
        // Ensure the date is formatted as YYYYMMDD
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
        var dd = date.getDate().toString().padStart(2, '0');
        return yyyy + mm + dd;
      },

    });
  }
);
