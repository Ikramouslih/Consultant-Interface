sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/core/ValueState"],
    function (Controller, MessageToast, ValueState) {
      "use strict";
  
      return Controller.extend("management.controller.UpdateConsultant", {
  
        onInit: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("UpdateConsultant").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sConsultantId = oEvent.getParameter("arguments").consultantId;
            var oView = this.getView();
            var sPath = "/" + oView.getModel().createKey("CONSULTANTIDSet", {
                ConsultantId: sConsultantId
            });
            oView.bindElement({
                path: sPath,
                events: {
                    dataReceived: function (oData) {
                        if (!oData.getParameter("data")) {
                            MessageToast.show("No data found for this consultant.");
                        }
                    }
                }
            });
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
  
        onUpdateConsultant: function () {
          var oView = this.getView();
          var aInputs = [
            oView.byId("firstName"),
            oView.byId("lastName"),
            oView.byId("email"),
            oView.byId("login"),
            oView.byId("password")
          ];
  
          var aSelects = [
            oView.byId("country"),
            oView.byId("hold"),
            oView.byId("role")
          ];
  
          var bValid = true;
  
          // Validate inputs
          aInputs.forEach(function (oInput) {
            bValid = this.validateInput(oInput) && bValid;
          }, this);
  
          // Validate selects
          aSelects.forEach(function (oSelect) {
            if (oSelect.getSelectedKey() === "initial" || !oSelect.getSelectedKey()) {
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
  
          // Proceed with form submission if all fields are valid
          var sFirstName = oView.byId("firstName").getValue();
          var sName = oView.byId("lastName").getValue().toUpperCase();
          sFirstName = sFirstName.charAt(0).toUpperCase() + sFirstName.slice(1).toLowerCase();
          var sEmail = oView.byId("email").getValue();
          var sExpertise = oView.byId("expertise").getValue();
          var sGrade = oView.byId("grade").getSelectedKey() === "initial" ? "" : oView.byId("grade").getSelectedKey();
          var sCountry = oView.byId("country").getSelectedKey();
          var sLogin = oView.byId("login").getValue();
          var sPassword = oView.byId("password").getValue();
          var sHold = oView.byId("hold").getSelectedKey() === "Active" ? 1 : 0;
          var sRole = oView.byId("role").getSelectedKey();
  
          var oData = {
            FirstName: sFirstName,
            Name: sName,
            Email: sEmail,
            // Expertise: sExpertise,
            Grade: sGrade,
            Country: sCountry,
            Login: sLogin,
            Password: sPassword,
            Hold: sHold,
            Role: sRole
          };
  
          console.log("odata", oData);
          var oModel = oView.getModel();
          oModel.update("/CONSULTANTIDSet('" + oData.ConsultantId + "')", oData, {
            success: function () {
              sap.m.MessageToast.show("Data successfully updated");
              this.onCancel();
            }.bind(this),
            error: function (oError) {
              sap.m.MessageToast.show("Error updating data: " + oError.message);
            }
          });
        },

        getEmailPrefix: function(sEmail) {
            var parts = sEmail.split('@');
            return parts[0];
        },
        
        onCancel: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("Consultants");
          this.getOwnerComponent().getRouter().navTo("Consultants");
        }
  
      });
    }
  );
