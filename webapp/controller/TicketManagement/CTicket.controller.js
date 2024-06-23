sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("management.controller.TicketManagement.CTicket", {
        onInit: function () {
        },

		// Function to move selected item to 'In Progress'
        onMoveToInProgress: function () {
            var oOnHoldView = this.byId("OnHold").getController();
            var oSelectedItem = oOnHoldView.getSelectedItemContext();
            var sStartDate = oSelectedItem.getProperty("StartDate");
            // i still need to take today's date

            this.moveItemToTable(oSelectedItem, "In Progress", sStartDate, "");
        },

		// Function to move selected item to 'On Hold'
        onMoveToOnHold: function () {
            var oInProgressView = this.byId("InProgress").getController();
            var oSelectedItem = oInProgressView.getSelectedItemContext();
            var sStartDate = oSelectedItem.getProperty("StartDate");

            this.moveItemToTable(oSelectedItem, "On Hold", sStartDate, "");
        },

        // Function to update item status in the model
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

            if (!oSelectedItem) {
                MessageToast.show("Please select a row in the 'On Hold' table.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var sPath = oModel.createKey("/TICKETIDSet", {
                IdTicket: sIdTicket
            });

            oModel.update(sPath, { 
                "CreationDate": sCreationDate,
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
                    oOnHoldView.loadTicketsWithProjectNames();
                    oInProgressView.loadTicketsWithProjectNames();
                },
                error: function (oError) {
                    console.error("Error updating ticket status:", oError);
                }
            });
        }
    });
});
