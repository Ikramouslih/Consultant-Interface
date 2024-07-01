sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("management.controller.TicketManagement.CTicket", {
        onInit: function () {
        },

        // From On hold to in progress 
        onMoveToInProgress: function () {
            var oOnHoldView = this.byId("OnHold").getController();
            var oSelectedItem = oOnHoldView.getSelectedItemContext();
			if (oSelectedItem){
				var sStartDate = oSelectedItem.getProperty("StartDate");

				if (!sStartDate) {
					sStartDate = this._getCurrentFormattedDate();
				}

				this.moveItemToTable(oSelectedItem, "In Progress", sStartDate, "");
			}
			else{
				MessageToast.show("Please select a ticket.")
			}
            
        },

		// From in progress to On hold 
        onMoveToOnHold: function () {
            var oInProgressView = this.byId("InProgress").getController();
            var oSelectedItem = oInProgressView.getSelectedItemContext();
			if(oSelectedItem){
				var sStartDate = oSelectedItem.getProperty("StartDate");
				this.moveItemToTable(oSelectedItem, "On Hold", sStartDate, "");
			}
			else{
				MessageToast.show("Please select a ticket.")
			}
        },

		// From in progress to Done
        onMoveToDone: function () {
            var oInProgressView = this.byId("InProgress").getController();
            var oSelectedItem = oInProgressView.getSelectedItemContext();
			if(oSelectedItem){
				var sStartDate = oSelectedItem.getProperty("StartDate");
				var sEndDate = this._getCurrentFormattedDate();

				this.moveItemToTable(oSelectedItem, "Done", sStartDate, sEndDate, this._createNotification.bind(this, oSelectedItem, sEndDate));
			}
			else{
				MessageToast.show("Please select a ticket.");
			}
		},

		// From Done to In Progress
        onMoveToInProgress2: function () {
            var oDoneView = this.byId("Done").getController();
            var oSelectedItem = oDoneView.getSelectedItemContext();
			if(oSelectedItem){
				var sStartDate = oSelectedItem.getProperty("StartDate");
				this.moveItemToTable(oSelectedItem, "In Progress", sStartDate, "");
			}
			else{
				MessageToast.show("Please select a ticket.");
			}
        },

        moveItemToTable: function (oSelectedItem, sStatus, sStartDate, sEndDate, callback) {

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

            var oModel = this.getOwnerComponent().getModel();
            var sPath = oModel.createKey("/TICKETIDSet", {
                IdTicket: sIdTicket
            });

            oModel.update(sPath, oUpdatedTicket, {
                success: function () {
                    MessageToast.show("Ticket status updated to " + sStatus + ".");
                    oOnHoldView.loadTicketsWithProjectNames();
                    oInProgressView.loadTicketsWithProjectNames();
                    oDoneView.loadTicketsWithProjectNames();
                    if (callback) {
                        callback();
                    }
                },
                error: function (oError) {
                    console.error("Error updating ticket status:", oError);
                }
            });
        },

        _getCurrentFormattedDate: function () {
            var date = new Date();
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString().padStart(2, '0');
            var dd = date.getDate().toString().padStart(2, '0');
            return yyyy + mm + dd; // This formats the date as 'YYYYMMDD'
        },

        _createNotification: function (oSelectedItem, sEndDate) {
            var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var sUserId = oBundle.getText("userId");
            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/CONSULTANTIDSet('" + sUserId + "')", {
                success: function (response) {
                    var sConsultantName = response.Name + " " + response.FirstName;
                    var sTicketId = oSelectedItem.getProperty("IdTicket");
                    var sNotifID = "N-" + ('0000000000' + Math.floor(Math.random() * 1000000000)).slice(-9);

                    var sEmailBody = "The ticket with ID " + sTicketId + " has been marked as done on " + this.formatDate(sEndDate) + " by " + sConsultantName + ".";
                    var notification = {
                        Id: sNotifID,
                        IdTicketJira: sTicketId,
                        Type: "StatusChange",
                        Seen: "0",
                        DateNotif: this._formatDate(new Date()),
                        SentBy: response.ConsultantId,
                        ReceivedBy: response.ManagerId,
                        Deleted: "0",
                        Content: sEmailBody
                    };

                    oModel.create("/NOTIFICATIONIDSet", notification, {
                        success: function () {
                            console.log("Notification created");
                        },
                        error: function (oError) {
							console.error("Create operation failed", oError);
							var errorMessage;
							if (oError.responseText) {
								try {
									var errorResponse = JSON.parse(oError.responseText);
									errorMessage = errorResponse.error.message.value;
								} catch (e) {
									errorMessage = "An unknown error occurred";
								}
							} else {
								errorMessage = oError.message;
							}
                        }
                    });

                }.bind(this),
                error: function (error) {
                    console.error("Error while fetching consultant data:", error);
					console.log("erorrororo");
                }
            });
        },

        // Function to format date in YYYYMMDD format
		_formatDate: function (date) {
			var yyyy = date.getFullYear().toString();
			var mm = (date.getMonth() + 1).toString().padStart(2, '0');
			var dd = date.getDate().toString().padStart(2, '0');
			return yyyy + mm + dd;
		},

		// Function to format date in YYYY-MM-DD format
        formatDate: function (sDate) {
            if (!sDate) {
                return "-";
            }
            if (sDate.length !== 8) {
                console.warn("Invalid date format: " + sDate);
                return sDate;
            }
            var year = sDate.substring(0, 4);
            var month = sDate.substring(4, 6);
            var day = sDate.substring(6, 8);
            return day + "-" + month + "-" + year;
        }
    });
});
