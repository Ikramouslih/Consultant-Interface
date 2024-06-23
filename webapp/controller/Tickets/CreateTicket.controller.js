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

    return Controller.extend("management.controller.Tickets.CreateTicket", {

      onInit: function () {
      },

      // Validation function for input fields
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

      // Function to create a new ticket
      onCreateTicket: function () {
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

        if (!bValid) {
          MessageToast.show("Please fill in all required fields.");
          return;
        }

        // Constructing data object for new ticket
        var sIdTicketJira = oView.byId("IdTicketJira").getValue();
        var sTitre = oView.byId("Titre").getValue();
        var sProjet = oView.byId("Projet").getSelectedItem().getKey();
        var sDescription = oView.byId("Description").getValue();
        var sTechnology = oView.byId("technology").getTokens().map(function (token) {
          return token.getText();
        }).join(", ");
        var sConsultantId = oView.byId("Consultant").getSelectedItem() ? oView.byId("Consultant").getSelectedItem().getKey() : null;
        var sEstimated = oView.byId("Estimated").getValue();
        var sPriority = oView.byId("Priority").getSelectedKey();
        var intEstimated = parseInt(sEstimated, 10);
        var sIdTicket = "T-" + sProjet.substring(0, 2).toUpperCase() + ('000' + Math.floor(Math.random() * 1000)).slice(-3);

        var oData = {
          IdTicket: sIdTicket,
          IdJira: sIdTicketJira,
          Titre: sTitre,
          Projet: sProjet,
          Description: sDescription,
          Technology: sTechnology,
          Priority: sPriority,
          Estimated: intEstimated,
          CreationDate: this._formatDate(new Date()),
          StartDate: "",
          EndDate: "",
          CreatedBy: "",
        };

        // Determine status based on consultant selection
        if (sConsultantId === null) {
          oData.Status = 'Unassigned';
        } else {
          oData.Status = 'In Progress';
          oData.Consultant = sConsultantId;
        }

        // Accessing and using the OData model to create a new ticket entry
        var oModel = this.getView().getModel();

        oModel.create("/TICKETIDSet", oData, {
          success: function () {
            MessageToast.show("Data successfully added.");
            this.onReset(); // Reset form fields
            location.reload(); // Reload the page
          }.bind(this),
          error: function (oError) {
            MessageToast.show("Error adding data: " + oError.message);
          }
        });
      },

      // Function to reset form fields
      onReset: function () {
        var oView = this.getView();
        oView.byId("IdTicketJira").setValue("");
        oView.byId("Titre").setValue("");
        oView.byId("Projet").setSelectedItem(null);
        oView.byId("Description").setValue("");
        oView.byId("technology").setValue("");

        // Clear tokens from expertise MultiInput
        var oExpertiseMultiInput = oView.byId("technology");
        oExpertiseMultiInput.removeAllTokens();

        // Reset value states for inputs and selects
        var aInputs = [
          oView.byId("IdTicketJira"),
          oView.byId("Titre"),
          oView.byId("Description"),
          oView.byId("Estimated")
        ];

        var aSelects = [
          oView.byId("Projet"),
          oView.byId("Technology"),
          oView.byId("Consultant")
        ];

        aInputs.forEach(function (oInput) {
          oInput.setValueState(ValueState.None);
        });

        aSelects.forEach(function (oSelect) {
          oSelect.setValueState(ValueState.None);
        });
      },

      // Function to format date in YYYYMMDD format
      _formatDate: function (date) {
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString().padStart(2, '0');
        var dd = date.getDate().toString().padStart(2, '0');
        return yyyy + mm + dd;
      },

      // Function to handle value help dialog for expertise
      handleValueHelp: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
          oView = this.getView();

        // Lazy load the value help fragment if not loaded
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

      // Function to handle search in value help dialog
      _handleValueHelpSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("NomTechnology", FilterOperator.Contains, sValue);
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },

      // Function to handle close in value help dialog
      _handleValueHelpClose: function (oEvent) {
        var oSelectedItems = oEvent.getParameter("selectedItems");
        var oMultiInput = this.byId("technology");

        if (oSelectedItems && oSelectedItems.length > 0) {
          oSelectedItems.forEach(function (oItem) {
            // Check if token already exists in MultiInput
            var oTokens = oMultiInput.getTokens();
            var bTokenExists = oTokens.some(function (oToken) {
              return oToken.getText() === oItem.getTitle();
            });

            // Add token if it doesn't exist
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
