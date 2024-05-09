sap.ui.define([

  "sap/ui/core/mvc/Controller",

  "sap/ui/model/json/JSONModel",

  "sap/ui/model/Filter",

  "sap/ui/model/FilterOperator",

  "sap/m/MessageToast"

], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {

  "use strict";
 
  return Controller.extend("management.controller.ConsultantDetails", {

    onInit: function () {

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      oRouter.getRoute("ConsultantDetails").attachPatternMatched(this._onObjectMatched, this);
 
      // Creating the JSON model for ticket data

      var oJSONModel = new JSONModel();

      this.getView().setModel(oJSONModel, "TICKETIDDATA");

    },

    _onObjectMatched: function (oEvent) {

      var sObjectId = oEvent.getParameter("arguments").consultantId;
 
      // Binding the view to the consultant data

      this.getView().bindElement({

        path: "/CONSULTANTIDSet('" + sObjectId + "')"

      });
 
      var oModel = this.getOwnerComponent().getModel();

      var oFilter = new Filter("Consultant", FilterOperator.EQ, sObjectId);
 
      // Fetching ticket data based on the consultant ID

      oModel.read("/TICKETIDSet", {

        filters: [oFilter],

        success: function (response) {

          var oJSONModel = this.getView().getModel("TICKETIDDATA");

          oJSONModel.setData(response.results); // Setting the data to the JSON model

        }.bind(this),

        error: function (error) {

          console.error("Error while fetching ticket data:", error);

        }

      });

    }

  });

});

 