sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      return Controller.extend("management.controller.CreateConsultant", {
        onInit: function () {},
        onCreateConsultant: function () {
          var sConsultantId = this.getView().byId("ConsultantId").getValue();
          var sName = this.getView().byId("Name").getValue();
          var sFirstName = this.getView().byId("FirstName").getValue();
          var sEmail = this.getView().byId("Email").getValue();
          console.log(sConsultantId);
          var oData = {
            ConsultantId: sConsultantId,
            Name: sName,
            FirstName: sFirstName,
            Email: sEmail
           };
        var oModel = this.getView().getModel();
        console.log(oModel);
        oModel.create("/CONSULTANTIDSet",oData,{
          success: function() {
            sap.m.MessageToast.show("Données ajoutées avec succès");
            this.getView().byId("ConsultantId").setValue("");
            this.getView().byId("Name").setValue("");
            this.getView().byId("FirstName").setValue("");
            this.getView().byId("Email").setValue("");
        }.bind(this), 
        error: function(oError) {
            sap.m.MessageToast.show("Erreur lors de l'ajout des données : " + oError.message);
        }
        })
        }
        
      });
    }
  );
  