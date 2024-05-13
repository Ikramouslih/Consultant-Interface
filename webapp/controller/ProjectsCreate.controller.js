sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
 
      return Controller.extend("management.controller.ProjectsCreate", {
        onInit: function () {},
        onCreateProjects: function () {
          console.log("project event");
          var sProject = this.getView().byId("Project").getValue();
          var sChefProjet = this.getView().byId("ChefProjet").getValue();
         
          var oData = {
            IdProject: sProject,
            NomProjet: sProject,
            ChefProjet: sChefProjet,
           };
           console.log(oData);
        var oModel = this.getView().getModel();
        console.log(oModel);
        oModel.create("/PROJECTIDSet",oData,{
          success: function() {
            sap.m.MessageToast.show("Données ajoutées avec succès");
            this.getView().byId("NomProjet").setValue("");
            this.getView().byId("ChefProjet").setValue("");
        }.bind(this),
        error: function(oError) {
            sap.m.MessageToast.show("Erreur lors de l'ajout des données : " + oError.message);
        }
        })
        }
       
      });
    }
  );