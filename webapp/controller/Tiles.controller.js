sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel", // Import ODataModel
], function(Controller, MessageToast, Filter, FilterOperator, ODataModel, CustomTileContent) {
    "use strict";

    return Controller.extend("sap.suite.ui.commons.demo.tutorial.controller.ProcessFlow", {

        onInit: function() {
            console.log("onInit");
			
            // Initialize the ODataModel with the service URL
            var oModel = new ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");

            // Set the model for the view
            this.getView().setModel(oModel, "TICKETIDDATA");

            
            
        },



    });
});
