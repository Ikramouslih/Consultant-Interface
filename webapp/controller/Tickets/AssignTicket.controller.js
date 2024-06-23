sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/m/Token",
    "sap/ui/model/FilterOperator"
  ],
  function (Controller, MessageToast, ValueState, Fragment, Filter, Token, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Tickets.AssignTicket", {

      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("AssignTicket").attachPatternMatched(this._onObjectMatched, this);
      },

      // Handler for route pattern matched event
      _onObjectMatched: function (oEvent) {
        var sTicketId = oEvent.getParameter("arguments").IdTicket;
        var oView = this.getView();
        var sPath = "/" + oView.getModel().createKey("TICKETIDSet", {
          IdTicket: sTicketId
        });
        var sConsultantId = "C-IMO777";

        // Bind element to view based on ticket ID
        oView.bindElement({
          path: sPath,
          events: {
            dataReceived: function (oData) {
              // Data received handler for binding context
              var oContext = oView.getBindingContext();
              var sTechnology = oContext.getProperty("Technology");
              this._setTechnologiesTokens(sTechnology); 
              this._setConsultant(sConsultantId); 
            }.bind(this),
            change: function (oEvent) {
              // Change event handler
              var oElementBinding = oEvent.getSource();
              var oContext = oElementBinding.getBoundContext();
              var sTechnology = oContext.getProperty("Technology");
              this._setTechnologiesTokens(sTechnology); 
              this._setConsultant(sConsultantId);
            }.bind(this),
            dataStateChange: function (oEvent) {
              // Data state change event handler
              var oElementBinding = oEvent.getSource();
              var oContext = oElementBinding.getBoundContext();
              var sTechnology = oContext.getProperty("Technology");
              this._setTechnologiesTokens(sTechnology); 
              this._setConsultant(sConsultantId); 
            }.bind(this),
          }
        });
      },

      // Set tokens for technologies
      _setTechnologiesTokens: function (sTechnology) {
        var oMultiInput = this.getView().byId("technology");
        var aTechnologies = sTechnology.split(", ");
        oMultiInput.destroyTokens();
        aTechnologies.forEach(function (sTechnologyItem) {
          if (sTechnologyItem !== "") {
            oMultiInput.addToken(new Token({ text: sTechnologyItem }));
          }
        });
      },

      // Set consultant details in dropdown
      _setConsultant: function (s) {
        var oView = this.getView();
        var oModel = oView.getModel();
        var oConsultant = oModel.getProperty("/CONSULTANTIDSet('" + s + "')");
        var oConsultantSelect = oView.byId("Consultant");
        var oConsultantItem = new sap.ui.core.Item({
          key: oConsultant.ConsultantId,
          text: oConsultant.FirstName + " " + oConsultant.Name
        });
        oConsultantSelect.removeAllItems();
        oConsultantSelect.addItem(oConsultantItem);
        oConsultantSelect.setSelectedKey(oConsultant.ConsultantId);
      },

      // Validate input fields
      validateInput: function (oInput) {
        var sValue = oInput.getValue();
        if (!sValue) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText("This field is required");
          return false;
        } else {
          oInput.setValueState(ValueState.None);
          return true;
        }
      },

      // Update function to save changes
      onUpdate: function () {
        var oView = this.getView();
        var aInputs = [
          oView.byId("IdTicketJira"),
          oView.byId("Titre"),
          oView.byId("Estimated")
        ];

        var aSelects = [
          oView.byId("Projet"),
          oView.byId("Priority"),
        ];

        var bValid = true;

        // Validate inputs
        aInputs.forEach(function (oInput) {
          bValid = this.validateInput(oInput) && bValid;
        }, this);

        // Validate selects
        aSelects.forEach(function (oSelect) {
          if (oSelect.getSelectedKey() === "" || !oSelect.getSelectedItem()) {
            oSelect.setValueState(ValueState.Error);
            oSelect.setValueStateText("This field is required");
            bValid = false;
          } else {
            oSelect.setValueState(ValueState.None);
          }
        });
        
        // Check if all fields are valid
        if (!bValid) {
          MessageToast.show("Please fill in all required fields.");
          return;
        }

        // Get consultant ID and Build the new Ticket object
        var sConsultantId = oView.byId("Consultant").getSelectedItem() ? oView.byId("Consultant").getSelectedItem().getKey() : null;
        var oData = {
          IdTicket: oView.getBindingContext().getProperty("IdTicket"),
          IdJira: oView.getBindingContext().getProperty("IdJira"),
          Titre: oView.getBindingContext().getProperty("Titre"),
          Projet: oView.getBindingContext().getProperty("Projet"),
          Description: oView.getBindingContext().getProperty("Description"),
          Technology: oView.getBindingContext().getProperty("Technology"),
          Priority: oView.getBindingContext().getProperty("Priority"),
          Estimated: oView.getBindingContext().getProperty("Estimated"),
          StartDate: oView.getBindingContext().getProperty("StartDate"),
          EndDate: oView.getBindingContext().getProperty("EndDate"),
          CreatedBy: oView.getBindingContext().getProperty("CreatedBy"),
          CreationDate: oView.getBindingContext().getProperty("CreationDate"),
          Status: oView.getBindingContext().getProperty("Status"),
        };
        if (sConsultantId === null) {
          oData.Status = 'Unassigned';
        } else {
          oData.Status = 'In Progress';
          oData.Consultant = sConsultantId;
        }

        var oModel = this.getView().getModel();

        //Update TICKETIDSet entity with the new Ticket Object
        oModel.create("/TICKETIDSet", oData, {
          success: function () {
            MessageToast.show("Data successfully updated.");
            this.onCancel();
            location.reload();
          }.bind(this),
          error: function (oError) {
            MessageToast.show("Error adding data: " + oError.message);
          }
        });

        // Get the consultant by Id 
        oModel.read("/CONSULTANTIDSet('" + sConsultantId + "')", {
          success: function (oData) {
            // Change the consultant availability
            var inputData = {
              ConsultantId: oData.ConsultantId,
              FirstName: oData.FirstName,
              Name: oData.Name,
              Email: oData.Email,
              Expertise: oData.Expertise,
              Grade: oData.Grade,
              Country: oData.Country,
              Login: oData.Login,
              Password: oData.Password,
              Hold: oData.Hold,
              Disponilbilty: "0",
              ManagerId: oData.ManagerId
            };
            oModel.create("/CONSULTANTIDSet", inputData, {
              success: function () {
                console.log("Availability updated.");
                location.reload();
              }.bind(this),
              error: function (oError) {
                sap.m.MessageToast.show("Error changing availability: " + oError.message);
              }
            });
          }.bind(this),
          error: function (oError) {
            MessageToast.show("Error adding data: " + oError.message);
          }
        });

      },

      // Cancel function to navigate back
      onCancel: function () {
        this.getOwnerComponent().getRouter().navTo("RouteTicket");
      },

      // Format date to YYYYMMDD
      _formatDate: function (date) {
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString().padStart(2, '0');
        var dd = date.getDate().toString().padStart(2, '0');
        return yyyy + mm + dd;
      },

      // Handle value help dialog for technologies
      handleValueHelp: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
          oView = this.getView();

        if (!this._pValueHelpDialog) {
          this._pValueHelpDialog = Fragment.load({
            id: oView.getId(),
            name: "management.view.Fragments.ExpertiseValueHelp",
            controller: this
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }
        this._pValueHelpDialog.then(function (oValueHelpDialog) {
          oValueHelpDialog.open(sInputValue);
        });
      },

      // Handle value help dialog search
      _handleValueHelpSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("NomTechnology", FilterOperator.Contains, sValue);
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },

      // Handle value help dialog close
      _handleValueHelpClose: function (oEvent) {
        var oSelectedItems = oEvent.getParameter("selectedItems");
        var oMultiInput = this.byId("technology");

        if (oSelectedItems && oSelectedItems.length > 0) {
          oSelectedItems.forEach(function (oItem) {
            var oTokens = oMultiInput.getTokens();
            var bTokenExists = oTokens.some(function (oToken) {
              return oToken.getText() === oItem.getTitle();
            });

            if (!bTokenExists) {
              var oToken = new Token({
                text: oItem.getTitle()
              });
              oMultiInput.addToken(oToken);
            }
          });
        }
      }

    });
  }
);
