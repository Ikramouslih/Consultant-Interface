sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      return Controller.extend("management.controller.Ticket", {
        onInit: function () {
        },
        onCreateTicket: function() {
            this.getOwnerComponent().getRouter().navTo("CreateTicket");
        },
        onAssignTicket: function(oEvent) {
          console.log('test');
          var oItem = oEvent.getSource();
          var oBindingContext = oItem.getBindingContext();
          var sTicketId = oBindingContext.getProperty("IdTicket");
          this.getOwnerComponent().getRouter().navTo("AssignTicket",{ IdTicket: sTicketId });
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
  