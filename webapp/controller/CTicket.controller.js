sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast, JSONModel, Utils, jQuery) {
    "use strict";
    return Controller.extend("management.controller.CTicket", {
        onInit: function () {
			// set explored app's demo model on this sample
		},

		onMoveToInProgress: function () {
			var oOnHoldView = this.byId("OnHold").getController();
	  
			var oSelectedItem = oOnHoldView.getSelectedItemContext();
			var sStartDate = oSelectedItem.getProperty("StartDate");
			// i still need to take today's date


			this.moveItemToTable(oSelectedItem, "In Progress", sStartDate, "");

		},

		onMoveToOnHold: function () {
			var oInProgressView = this.byId("InProgress").getController();
	  
			var oSelectedItem = oInProgressView.getSelectedItemContext();
			
			var sStartDate = oSelectedItem.getProperty("StartDate");

			this.moveItemToTable(oSelectedItem, "On Hold", sStartDate, "");
		},

		moveItemToTable: function(oSelectedItem, sStatus, sStartDate, sEndDate){
			var oOnHoldView = this.byId("OnHold").getController();
			var oInProgressView = this.byId("InProgress").getController();

			var sIdTicket = oSelectedItem.getProperty("IdTicket");
			var sCreationDate = oSelectedItem.getProperty("CreationDate");
			var sCreatedBy = oSelectedItem.getProperty("CreationBy");
	    	var sIdJira = oSelectedItem.getProperty("IdJira");
    		var sProjet = oSelectedItem.getProperty("Projet");
    		var sTechnology = oSelectedItem.getProperty("Technology");
    		var sConsultant = oSelectedItem.getProperty("Consultant");
		    var sEstimated = oSelectedItem.getProperty("Estimated");
	    	var sTitre = oSelectedItem.getProperty("Titre");
    		var sDescription = oSelectedItem.getProperty("Description");
		    var sPriority = oSelectedItem.getProperty("Priority");
			console.log("sIdTicket was found :"+sIdTicket);
			if (!oSelectedItem) {
			  MessageToast.show("Please select a row in the 'On Hold' table.");
			  return;
			}
			//console.log('move to in progress pressed');
	  
			var oModel = this.getOwnerComponent().getModel();
			var sPath = oModel.createKey("/TICKETIDSet", {
				IdTicket: sIdTicket
			});
			console.log("sPath was found :"+sPath);
	  
			//var sPath = "/TICKETIDSet('"+oSelectedItem.IdTicket+"')";
			oModel.update(sPath, { 
				"CreationDate": sCreationDate, // This can also be dynamic if needed
	        	"IdTicket": sIdTicket,
    	    	"IdJira": sIdJira,
	        	"Titre": sTitre,
				"Description": sDescription,
				"Projet": sProjet,
				"CreatedBy": sCreatedBy,
	        	"Technology": sTechnology,
    		    "Consultant": sConsultant,
        		"Estimated": sEstimated,
    	    	"StartDate": sStartDate, 
	        	"EndDate": sEndDate, 
    		    "Status": sStatus,
	    	    "Priority": sPriority
      		}, {
			  success: function () {
				MessageToast.show("Ticket status updated to "+sStatus+".");
	  
				// oModel.refresh();
				oOnHoldView.loadTicketsWithProjectNames();
				oInProgressView.loadTicketsWithProjectNames();

				/*oOnHoldView.removeSelectedRow();
				oInProgressView.addRow(oSelectedItem);
				var oOnHoldTable = oOnHoldView.byId("idProductsTable"); 
	            var oOnHoldModel = oOnHoldTable.getModel();
    	        var oOnHoldData = oOnHoldModel.getProperty("/TICKETIDSet");

        	    //Find and remove the item from the 'On Hold' data
            	oOnHoldData = oOnHoldData.filter(function (item) {
    	            return item.IdTicket !== sIdTicket;
	            });*/

        	    // Update the 'On Hold' model with the new data
            	// oOnHoldModel.setProperty("/TICKETIDSet", oOnHoldData);
		      },
			  error: function (oError) {
				console.error("Error updating ticket status:", oError);
			  }
			});
		  }

	});

});