sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast, JSONModel, Utils, jQuery) {
    "use strict";
    return Controller.extend("management.controller.TicketManagement.CTicket", {
        onInit: function () {
			// set explored app's demo model on this sample
		},

		onMoveToInProgress: function () {
			var oOnHoldView = this.byId("OnHold").getController();
	  
			var oSelectedItem = oOnHoldView.getSelectedItemContext();
			var sStartDate = oSelectedItem.getProperty("StartDate");
			// i still need to take today's date

			if (!sStartDate) {
				var date = new Date();
				var yyyy = date.getFullYear().toString();
    	    	var mm = (date.getMonth() + 1).toString().padStart(2, '0');
        		var dd = date.getDate().toString().padStart(2, '0');
				sStartDate = yyyy + mm + dd; // This formats the date as 'YYYYMMDD'
			}

			this.moveItemToTable(oSelectedItem, "In Progress", sStartDate, "");

		},

		onMoveToOnHold: function () {
			var oInProgressView = this.byId("InProgress").getController();
	  
			var oSelectedItem = oInProgressView.getSelectedItemContext();
			
			var sStartDate = oSelectedItem.getProperty("StartDate");

			this.moveItemToTable(oSelectedItem, "On Hold", sStartDate, "");
		},

		onMoveToDone: function () {
			var oInProgressView = this.byId("InProgress").getController();
	  
			var oSelectedItem = oInProgressView.getSelectedItemContext();
			
			var sStartDate = oSelectedItem.getProperty("StartDate");

			var date = new Date();
			var yyyy = date.getFullYear().toString();
        	var mm = (date.getMonth() + 1).toString().padStart(2, '0');
        	var dd = date.getDate().toString().padStart(2, '0');
			var sEndDate = yyyy + mm + dd; // This formats the date as 'YYYYMMDD'

			console.log("Avant end date :",sEndDate);
			this.moveItemToTable(oSelectedItem, "Done", sStartDate, sEndDate);
			
		},

		onMoveToInProgress2: function () {
			var oDoneView = this.byId("Done").getController();
	  
			var oSelectedItem = oDoneView.getSelectedItemContext();
			
			var sStartDate = oSelectedItem.getProperty("StartDate");

			this.moveItemToTable(oSelectedItem, "In Progress", sStartDate, "");
		},

		moveItemToTable: function(oSelectedItem, sStatus, sStartDate, sEndDate){
			console.log("function end date :",sEndDate);
			var oOnHoldView = this.byId("OnHold").getController();
			var oInProgressView = this.byId("InProgress").getController();
			var oDoneView = this.byId("Done").getController();

			var sIdTicket = oSelectedItem.getProperty("IdTicket");

			var oUpdatedTicket = {
                CreationDate: oSelectedItem.getProperty("CreationDate"),
                IdTicket: oSelectedItem.getProperty("IdTicket"),
                IdJira: oSelectedItem.getProperty("IdJira"),
                Titre: oSelectedItem.getProperty("Titre"),
                Description: oSelectedItem.getProperty("Description"),
                Projet: oSelectedItem.getProperty("Projet"),
                CreatedBy: oSelectedItem.getProperty("CreationBy"),
                Technology: oSelectedItem.getProperty("Technology"),
                Consultant: oSelectedItem.getProperty("Consultant"),
                Estimated: oSelectedItem.getProperty("Estimated"),
                StartDate: sStartDate,
                EndDate: sEndDate,
                Status: sStatus,
                Priority: oSelectedItem.getProperty("Priority")
            };
			// console.log("sIdTicket was found :"+sIdTicket);
			if (!oSelectedItem) {
			  MessageToast.show("Please select a row in the 'On Hold' table.");
			  return;
			}
			//console.log('move to in progress pressed');
	  
			var oModel = this.getOwnerComponent().getModel();
			var sPath = oModel.createKey("/TICKETIDSet", {
				IdTicket: sIdTicket
			});
			//console.log("sPath was found :"+sPath);
	  
			//var sPath = "/TICKETIDSet('"+oSelectedItem.IdTicket+"')";
			oModel.update(sPath, oUpdatedTicket, {
			  success: function () {
				MessageToast.show("Ticket status updated to "+sStatus+".");
	  
				// Refresh the tables
				oOnHoldView.loadTicketsWithProjectNames();
				oInProgressView.loadTicketsWithProjectNames();
				oDoneView.loadTicketsWithProjectNames();
				
		      },
			  error: function (oError) {
				console.error("Error updating ticket status:", oError);
			  }
			});
		  }

	});

});