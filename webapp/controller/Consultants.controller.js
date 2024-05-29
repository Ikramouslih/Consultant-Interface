sap.ui.define(
  ["sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"],

  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Consultants", {
      onInit: function () {
        this._mFilters = {
          all: [],
          available: [new Filter("Disponilbilty", FilterOperator.EQ, "1")],
          unavailable: [new Filter("Disponilbilty", FilterOperator.EQ, "0")],
        };

        var oModel = this.getOwnerComponent().getModel();

        // Fetch the count of consultants
        oModel.read("/CONSULTANTIDSet/$count", {
          success: function (iCount) {
            var oCountModel = new sap.ui.model.json.JSONModel({ count: iCount });
            this.getView().setModel(oCountModel, "CountModel");
          }.bind(this),
          error: function (oError) {
            console.error("Error reading consultant count:", oError);
          }
        });
        // Fetch the count of available consultants
        oModel.read("/CONSULTANTIDSet/$count", {
          success: function (iCount) {
            var oCountModel = this.getView().getModel("CountModel");
            oCountModel.setProperty("/available", iCount);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading available consultants count:", oError);
          },
          filters: [new Filter("Disponilbilty", FilterOperator.EQ, "1")]
        });

        // Fetch the count of unavailable consultants
        oModel.read("/CONSULTANTIDSet/$count", {
          success: function (iCount) {
            var oCountModel = this.getView().getModel("CountModel");
            oCountModel.setProperty("/unavailable", iCount);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading unavailable consultants count:", oError);
          },
          filters: [new Filter("Disponilbilty", FilterOperator.EQ, "0")]
        });
      },

      onShow: function (oEvent) {
        var oItem = oEvent.getSource();
        var oBindingContext = oItem.getBindingContext();
        var sConsultantId = oBindingContext.getProperty("ConsultantId");

        // Navigate to the details view with the selected person's ID
        this.getOwnerComponent().getRouter().navTo("ConsultantDetails", { consultantId: sConsultantId });
      },

      onEdit: function (oEvent) {
        var oItem = oEvent.getSource();
        var oBindingContext = oItem.getBindingContext();
        var sConsultantId = oBindingContext.getProperty("ConsultantId");

        // Navigate to the update page view with the selected person's ID
        this.getOwnerComponent().getRouter().navTo("UpdateConsultant", { consultantId: sConsultantId });
      },

      onCreateConsultant: function () {
        this.getOwnerComponent().getRouter().navTo("CreateConsultant");
      },

      onQuickFilter: function (oEvent) {
        var sSelectedKey = oEvent.getParameter("selectedKey");
        this._sSelectedFilterKey = sSelectedKey; // Save the selected filter key

        if (sSelectedKey === "create") {
          this.getOwnerComponent().getRouter().navTo("CreateConsultant");
        } else if (sSelectedKey === "extract") {
          this.onExtract(); // Call the extract function
        } else {
          var oBinding = this.byId("idConsultantsTable").getBinding("rows");
          var aFilters = this._mFilters[sSelectedKey];
          oBinding.filter(aFilters);
        }
      },

      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("query");
        var aFilters = [];
        if (sQuery && sQuery.length > 0) {
          aFilters = new Filter({
            filters: [
              new Filter("ConsultantId", FilterOperator.Contains, sQuery),
              new Filter("Name", FilterOperator.Contains, sQuery),
              new Filter("FirstName", FilterOperator.Contains, sQuery),
              new Filter("Login", FilterOperator.Contains, sQuery),
              new Filter("Email", FilterOperator.Contains, sQuery),
              new Filter("Grade", FilterOperator.Contains, sQuery),
              new Filter("Expertise", FilterOperator.Contains, sQuery)
            ],
            and: false
          });
        }
        var oTable = this.byId("idConsultantsTable");
        var oBinding = oTable.getBinding("rows");
        oBinding.filter(aFilters);
      },

      onExtract: function () {
        var oTable = this.byId("idConsultantsTable");
        var oBinding = oTable.getBinding("rows");
        var aFilteredContexts = oBinding.getContexts();
        var aFilteredData = aFilteredContexts.map(function (oContext) {
          return oContext.getObject();
        });

        var aCSV = [];

        // Add CSV headers
        aCSV.push("ConsultantId,Name,FirstName,Disponibility,Email");

        // Add table data
        aFilteredData.forEach(function (oConsultant) {
          aCSV.push([
            oConsultant.ConsultantId,
            oConsultant.Name,
            oConsultant.FirstName,
            oConsultant.Disponilbilty,
            oConsultant.Email
          ].join(","));
        });

        // Convert data to CSV string
        var sCSV = aCSV.join("\n");

        // Set filename based on selected filter
        var sFileName = "consultants_" + this._sSelectedFilterKey + ".csv";
        var oBlob = new Blob([sCSV], { type: 'text/csv;charset=utf-8;' });
        var oLink = document.createElement("a");
        if (oLink.download !== undefined) {
          var url = URL.createObjectURL(oBlob);
          oLink.setAttribute("href", url);
          oLink.setAttribute("download", sFileName);
          oLink.style.visibility = 'hidden';
          document.body.appendChild(oLink);
          oLink.click();
          document.body.removeChild(oLink);
        }
      }
    });
  }
);
