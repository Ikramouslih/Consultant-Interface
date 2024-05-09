sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
 
      return Controller.extend("management.controller.Projects", {
        onInit: function () {},
        onCreateProjects: function() {
          this.getOwnerComponent().getRouter().navTo("CreateProjects");
      }
        /*onPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sConsultantId = oBindingContext.getProperty("IdProject");
       
            // Navigate to the details view with the selected person's ID
            this.getOwnerComponent().getRouter().navTo("ConsultantDetails", { consultantId: sConsultantId });
 
        }*/
      });
    }
  );