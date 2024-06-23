sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("management.controller.Managers.Managers", {

    onInit: function () {

      var oModel = this.getOwnerComponent().getModel();
      
      // Read the total count of managers and set it to the count model
      oModel.read("/MANAGERIDSet/$count", {
        success: function (iCount) {
          var oCountModel = new JSONModel({ count: iCount });
          this.getView().setModel(oCountModel, "CountModel");
        }.bind(this),
        error: function (oError) {
          console.error("Error reading Manager count:", oError);
        }
      });

      // Load the manager data
      this.loadManagers();
    },

    // Load the manager data with optional filters
    loadManagers: function (aFilters) {

      var oModel = this.getOwnerComponent().getModel();
      var oView = this.getView();

      // Read the manager data with optional filters
      oModel.read("/MANAGERIDSet", {
        filters: aFilters || [],
        success: function (oData) {
          var oManagersModel = new JSONModel(oData);
          oView.setModel(oManagersModel, "managersModel");
        },
        error: function (oError) {
          console.error("Error reading MANAGERIDSet:", oError);
        }
      });
    },

    // Event handler for the quick filter selection
    onQuickFilter: function (oEvent) {
      var sSelectedKey = oEvent.getParameter("selectedKey");
      this._sSelectedFilterKey = sSelectedKey;

      // If 'extract' is selected, call the extract method
      if (sSelectedKey === "extract") {
        this.onExtract();
      } else {
        // Apply filters based on the selected key
        var aFilters = [];
        if (sSelectedKey !== "all") {
          aFilters.push(new Filter("Key", FilterOperator.EQ, sSelectedKey));
        }
        this.loadManagers(aFilters);
      }
    },

    // Event handler for the search field
    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query");
      var aFilters = [];
      
      // Apply search filters based on the query
      if (sQuery && sQuery.length > 0) {
        aFilters.push(new Filter({
          filters: [
            new Filter("ManagerId", FilterOperator.Contains, sQuery),
            new Filter("Name", FilterOperator.Contains, sQuery),
            new Filter("FirstName", FilterOperator.Contains, sQuery),
            new Filter("Login", FilterOperator.Contains, sQuery),
            new Filter("Email", FilterOperator.Contains, sQuery),
            new Filter("Expertise", FilterOperator.Contains, sQuery)
          ],
          and: false
        }));
      }
      
      // Apply the filters to the table binding
      var oTable = this.byId("idManagersTable");
      var oBinding = oTable.getBinding("rows");
      oBinding.filter(aFilters);
    },

    // Extract the filtered data to a CSV file
    onExtract: function () {
      var oTable = this.byId("idManagersTable");
      var oBinding = oTable.getBinding("rows");
      var aFilteredContexts = oBinding.getContexts();
      
      // Extract filtered data
      var aFilteredData = aFilteredContexts.map(function (oContext) {
        return oContext.getObject();
      });

      // Create CSV data
      var aCSV = [];
      aCSV.push("ManagerId,Name,FirstName,Email");
      aFilteredData.forEach(function (oManager) {
        aCSV.push([
          oManager.ManagerId,
          oManager.Name,
          oManager.FirstName,
          oManager.Email
        ].join(","));
      });

      // Convert CSV data to a blob and download it
      var sCSV = aCSV.join("\n");
      var sFileName = "managers_" + (this._sSelectedFilterKey || "all") + ".csv";
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
});
