sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/core/ValueState"],
  function (Controller, MessageToast, ValueState) {
    "use strict";

    return Controller.extend("management.controller.TicketCreate", {

      onInit: function () {
        // Any initialization logic goes here
      },

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

      onCreateTicket: function () {
        var oView = this.getView();
        var aInputs = [
          oView.byId("IdTicketJira"),
          oView.byId("Titre"),
          oView.byId("Description"),
          oView.byId("Estimated")
        ];

        var aSelects = [
          oView.byId("Projet"),
          oView.byId("Consultant"),
          oView.byId("Technology")
        ];

        var bValid = true;

        // Validate inputs
        aInputs.forEach(function (oInput) {
          bValid = this.validateInput(oInput) && bValid;
        }, this);

        // Validate selects
        aSelects.forEach(function (oSelect) {
          if (!oSelect.getSelectedItem()) {
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

        var sIdTicketJira = oView.byId("IdTicketJira").getValue();
        var sTitre = oView.byId("Titre").getValue();
        var sProjet = oView.byId("Projet").getSelectedItem().getKey();
        var sDescription = oView.byId("Description").getValue();
        var sTechnology = oView.byId("Technology").getSelectedItem().getKey();
        var sConsultantId = oView.byId("Consultant").getSelectedItem() ? oView.byId("Consultant").getSelectedItem().getKey() : null;
        var sEstimated = oView.byId("Estimated").getValue();
        var intEstimated = parseInt(sEstimated, 10);

        var oData = {
          IdTicket: sIdTicketJira,
          IdJira: sIdTicketJira,
          Titre: sTitre,
          Projet: sProjet,
          Description: sDescription,
          Technology: sTechnology,
          Estimated: intEstimated,
          CreationDate: this._formatDate(new Date())
        };

        if (sConsultantId === null) {
          oData.Status = 'NON-AFFECTER';
        } else {
          oData.Status = 'In progress';
          oData.Consultant = sConsultantId;
        }

        var oModel = this.getView().getModel();

        oModel.create("/TICKETIDSet", oData, {
          success: function () {
            MessageToast.show("Data successfully added");
            this.onReset();
          }.bind(this),
          error: function (oError) {
            MessageToast.show("Error adding data: " + oError.message);
          }
        });
      },

      onReset: function () {
        var oView = this.getView();
        oView.byId("IdTicketJira").setValue("");
        oView.byId("Titre").setValue("");
        oView.byId("Projet").setSelectedItem(null);
        oView.byId("Description").setValue("");
        oView.byId("Technology").setSelectedItem(null);
        oView.byId("Consultant").setSelectedItem(null);
        oView.byId("Estimated").setValue("");

        // Reset value states
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

      _formatDate: function (date) {
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString().padStart(2, '0');
        var dd = date.getDate().toString().padStart(2, '0');
        return yyyy + mm + dd;
      },

    });
  }
);
