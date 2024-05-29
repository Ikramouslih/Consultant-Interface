sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/core/ValueState"],
  function (Controller, MessageToast, ValueState) {
    "use strict";

    return Controller.extend("management.controller.CreateConsultant", {

      onInit: function () {
        this.getView().byId("domain").setValue("@inetum.com");
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

      onCreateConsultant: function () {
        var oView = this.getView();
        var aInputs = [
          oView.byId("firstName"),
          oView.byId("lastName"),
          oView.byId("email"),
          oView.byId("login"),
          oView.byId("password"),
          oView.byId("confirmPassword")
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

        // Check if password and confirm password match
        var sPassword = oView.byId("password").getValue();
        var sConfirmPassword = oView.byId("confirmPassword").getValue();
        if (sPassword !== sConfirmPassword) {
          oView.byId("confirmPassword").setValueState(ValueState.Error);
          oView.byId("confirmPassword").setValueStateText("Passwords do not match");
          bValid = false;
        } else {
          oView.byId("confirmPassword").setValueState(ValueState.None);
        }

        if (!bValid) {
          MessageToast.show("Please fill in all required fields.");
          return;
        }

        // Proceed with form submission if all fields are valid
        var sFirstName = oView.byId("firstName").getValue();
        var sName = oView.byId("lastName").getValue().toUpperCase();
        sFirstName = sFirstName.charAt(0).toUpperCase() + sFirstName.slice(1).toLowerCase();
        var sConsultantId = sFirstName.substring(0, 1).toUpperCase() + sName.substring(0, 2).toUpperCase() + ('000' + Math.floor(Math.random() * 1000)).slice(-3);
        var sEmail = oView.byId("email").getValue() + "@inetum.com";
        var sExpertise = oView.byId("expertise").getValue();
        var sGrade = oView.byId("grade").getSelectedKey() === "initial" ? "" : oView.byId("grade").getSelectedKey();
        var sCountry = oView.byId("country").getSelectedKey();
        var sLogin = oView.byId("login").getValue();
        var sHold = oView.byId("hold").getSelectedKey() === "Active" ? "1" : "0";
        var sRole = oView.byId("role").getSelectedKey();

        var oData = {
          ConsultantId: sConsultantId,
          FirstName: sFirstName,
          Name: sName,
          Email: sEmail,
          Expertise: sExpertise,
          Grade: sGrade,
          Country: sCountry,
          Login: sLogin,
          Password: sPassword,
          Hold: sHold,
          // Role: sRole,
          Disponilbilty: "1",
          ManagerId : ""
        };
        

        console.log("odata", oData);
        var oModel = oView.getModel();
        oModel.create("/CONSULTANTIDSet", oData, {
          success: function () {
            sap.m.MessageToast.show("Data successfully added");
            this.onReset();
          }.bind(this),
          error: function (oError) {
            sap.m.MessageToast.show("Error adding data: " + oError.message);
          }
        });
      },

      onReset: function () {
        var oView = this.getView();
        oView.byId("lastName").setValue("");
        oView.byId("firstName").setValue("");
        oView.byId("email").setValue("");
        oView.byId("expertise").setValue("");
        oView.byId("grade").setSelectedKey("initial");
        oView.byId("country").setSelectedKey("initial");
        oView.byId("hold").setSelectedKey("Active");
        oView.byId("login").setValue("");
        oView.byId("password").setValue("");
        oView.byId("confirmPassword").setValue("");
        oView.byId("role").setSelectedKey("initial");

        // Reset value states
        var aInputs = [
          oView.byId("firstName"),
          oView.byId("lastName"),
          oView.byId("email"),
          oView.byId("login"),
          oView.byId("password"),
          oView.byId("confirmPassword")
        ];

        var aSelects = [
          oView.byId("country"),
          oView.byId("hold"),
          oView.byId("role")
        ];

        aInputs.forEach(function (oInput) {
          oInput.setValueState(ValueState.None);
        });

        aSelects.forEach(function (oSelect) {
          oSelect.setValueState(ValueState.None);
        });
      }

    });
  }
);
