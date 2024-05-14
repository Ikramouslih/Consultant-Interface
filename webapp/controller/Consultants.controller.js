sap.ui.define(
  ["sap/ui/core/mvc/Controller", 
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator" ],

  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Consultants", {
      onInit: function () {
        this._mFilters = {
          all: [], 
          available: [new Filter("Disponilbilty", FilterOperator.EQ, "1")],
          unavailable: [new Filter("Disponilbilty", FilterOperator.EQ, "0")],
        };
        var oModel = this.getOwnerComponent().getModel();
    
        oModel.read("/CONSULTANTIDSet/$count", {
          success: function (iCount) {
            var oCountModel = new sap.ui.model.json.JSONModel({ count: iCount });
            this.getView().setModel(oCountModel, "CountModel");
          }.bind(this),
          error: function (oError) {
            console.error("Erreur lors de la lecture du comptage des tickets:", oError);
          }
        });
      },
      onPress: function(oEvent) {
          var oItem = oEvent.getSource();
          var oBindingContext = oItem.getBindingContext();
          var sConsultantId = oBindingContext.getProperty("ConsultantId");
      
          // Navigate to the details view with the selected person's ID
          this.getOwnerComponent().getRouter().navTo("ConsultantDetails", { consultantId: sConsultantId });

      },
      onCreateConsultant: function() {
        this.getOwnerComponent().getRouter().navTo("CreateConsultant");
      },
      onQuickFilter: function (oEvent) {
        var sSelectedKey = oEvent.getParameter("selectedKey");
        if (sSelectedKey === "create") {
          this.getOwnerComponent().getRouter().navTo("CreateConsultant");
        } else {
          var oBinding = this.byId("idProductsTable").getBinding("items");
          var aFilters = this._mFilters[sSelectedKey];
          oBinding.filter(aFilters);
        }
      },

    });
  }
);
