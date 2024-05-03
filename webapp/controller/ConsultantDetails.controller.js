sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      return Controller.extend("management.controller.ConsultantDetails", {
        onInit: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("ConsultantDetails").attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").consultantId;
          console.log("Navigated to employee with ID:", sObjectId);
          this.getView().bindElement({
              path: "/CONSULTANTIDSet('" + sObjectId + "')"
          });
      }
      });
    }
  );
  