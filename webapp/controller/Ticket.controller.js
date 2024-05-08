sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      return Controller.extend("management.controller.Ticket", {
        onInit: function () {},
        onCreateTicket: function() {
            this.getOwnerComponent().getRouter().navTo("CreateTicket");
        },
        onAssignTicket: function() {

        },
        getCounty: function(oContext) {
          return oContext.getProperty('Status');
        },
       
        getGroupHeader: function(oGroup) {
          return new GroupHeaderListItem({
            title : oGroup.key
          }
        );
      },    
      });
    }
  );
  