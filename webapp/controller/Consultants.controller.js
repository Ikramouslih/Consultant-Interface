sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      return Controller.extend("management.controller.Consultants", {
        onInit: function () {},
        onPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sConsultantId = oBindingContext.getProperty("ConsultantId");
        
            // Navigate to the details view with the selected person's ID
            this.getOwnerComponent().getRouter().navTo("ConsultantDetails", { consultantId: sConsultantId });
        }
      });
    }
  );
  