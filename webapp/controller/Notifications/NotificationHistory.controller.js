sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("management.controller.Notifications.NotificationHistory", {
        onInit: function () {
            this._loadNotifications();
        },

        _loadNotifications: function() {
            var oModel = this.getOwnerComponent().getModel();
            var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var sUserId = oBundle.getText("userId");
        
            oModel.read("/NOTIFICATIONIDSet", {
                filters: [new Filter("ReceivedBy", FilterOperator.EQ, sUserId)],
                success: function (oData) {
                    oData.results.sort(function (a, b) {
                        return b.DateNotif - a.DateNotif;
                    });
        
                    var oVBox = this.byId("notificationVBox");
                    oVBox.removeAllItems();
        
                    // Fetch manager names
                    this._fetchManagerNames(oData.results).then(function(managerNames) {
                        oData.results.forEach(function(notification) {
                            var oNotificationItem = new sap.m.NotificationListItem({
                                title: "You have a ticket.",
                                description: {
                                    parts: ['Type', 'IdTicketJira', 'SentBy'],
                                    formatter: function () {
                                        var managerName = managerNames[notification.SentBy] || notification.SentBy;
                                        if (notification.Status === 'StatusChange') {
                                            return `The ticket ${notification.IdTicketJira} done by the consultant ${managerName}.`;
                                        } else {
                                            return `The ticket ${notification.IdTicketJira} was assigned to you by the manager ${managerName}.`;
                                        }
                                    }
                                },
                                datetime: this.formatDate(notification.DateNotif),
                                unread: notification.Seen != "a",
                                authorPicture: "sap-icon://clinical-order",
                                width: "100%",
                                showCloseButton: false,
                                priority: "Medium"
                            });
                            oVBox.addItem(oNotificationItem);
                        }, this);
                    }.bind(this));
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Failed to load notifications.");
                    console.error("Error fetching notifications:", oError);  // Debugging
                }
            });
        },        

        _fetchManagerNames: function(notifications) {
            var oModel = this.getOwnerComponent().getModel();
            var managerIds = notifications.map(notification => notification.SentBy);
            var uniqueManagerIds = [...new Set(managerIds)];

            return new Promise((resolve, reject) => {
                oModel.read("/MANAGERIDSet", {
                    filters: uniqueManagerIds.map(id => new Filter("ManagerId", FilterOperator.EQ, id)),
                    success: function(oData) {
                        var managerNames = {};
                        oData.results.forEach(function(manager) {
                            managerNames[manager.ManagerId] = manager.Name + " " + manager.FirstName; 
                        });
                        resolve(managerNames);
                    },
                    error: function(oError) {
                        console.error("Error fetching manager names:", oError);
                        reject(oError);
                    }
                });
            });
        },
        
        // Show the ticket information in a dialog
        showTicketInfo: function (oEvent, sTicketId, sNotifId, s) {
            var oLink = oEvent.getSource();
            var oBindingContext = oLink.getBindingContext("TicketsModel");
        
            var oModel = this.getView().getModel();
            oModel.read("/TICKETIDSet('" + sTicketId + "')", {
                success: function (oData) {  
                    if (!this._pTicketDetailsDialog) {
                        this._pTicketDetailsDialog = Fragment.load({
                            id: this.getView().getId(),
                            name: "management.view.Fragments.TicketDetails",
                            controller: this
                        }).then(function (oDialog) {
                            this.getView().addDependent(oDialog);
                            return oDialog;
                        }.bind(this));
                    }
                    this._pTicketDetailsDialog.then(function (oDialog) {
                        oDialog.setModel(new JSONModel(oData));
                        oDialog.open();
        
                        // Mark the notification as seen
                        oModel.read("/NOTIFICATIONIDSet('" + sNotifId + "')", {
                        success: function (oNotificationData) {
                            var oUpdateData = {
                                Id: oNotificationData.Id,
                                IdTicketJira: oNotificationData.IdTicketJira,
                                Type: oNotificationData.Type,
                                Seen: "1",
                                DateNotif: oNotificationData.DateNotif,
                                SentBy: oNotificationData.SentBy,
                                ReceivedBy: oNotificationData.ReceivedBy,
                                Deleted: oNotificationData.Deleted,
                                Content: oNotificationData.Content
                            };
                            oModel.create("/NOTIFICATIONIDSet", oUpdateData, {
                                success: function () {      
                                    // Reload notifications
                                    this._loadNotifications();
                                    // Update the notification icon
                                    var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                                    var sUserId = oBundle.getText("userId");
                                    this.setNotificationIcon(sUserId);
                                }.bind(this),
                                error: function (oError) {
                                    MessageToast.show("Error updating notification: " + oError.message);
                                }
                            });
                        }.bind(this),
                        error: function (oError) {
                            MessageToast.show("Error finding notification: " + oError.message);
                        }
                    });
                    }.bind(this));
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error fetching ticket data: " + oError.message);
                }
            });
        },    

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

            return year + "-" + month + "-" + day;
        }
    });
});
