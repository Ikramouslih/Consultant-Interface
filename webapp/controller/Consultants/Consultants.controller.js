sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], 
  function (Controller, Filter, FilterOperator, JSONModel) {
    "use strict";
  
    return Controller.extend("management.controller.Consultants.Consultants", {
  
      onInit: function () {
        // Initialize filters for consultant availability
        this._mFilters = {
          all: [], // No filter, show all consultants
          available: [new Filter("Disponilbilty", FilterOperator.EQ, "1")],
          unavailable: [new Filter("Disponilbilty", FilterOperator.EQ, "0")]
        };
  
        var oModel = this.getOwnerComponent().getModel();
        this._setCounts(oModel); // Set initial counts for consultant availability
        this.loadConsultantsData(); // Load consultants data
      },
  
      // Function to set counts for different consultant availability categories
      _setCounts: function (oModel) {
        // Total count of all consultants
        oModel.read("/CONSULTANTIDSet/$count", {
          success: function (iCount) {
            var oCountModel = new JSONModel({ count: iCount });
            this.getView().setModel(oCountModel, "CountModel");
          }.bind(this),
          error: function (oError) {
            console.error("Error reading consultant count:", oError);
          }
        });
  
        // Count of available consultants
        oModel.read("/CONSULTANTIDSet/$count", {
          filters: [new Filter("Disponilbilty", FilterOperator.EQ, "1")],
          success: function (iCount) {
            var oCountModel = this.getView().getModel("CountModel");
            oCountModel.setProperty("/available", iCount);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading available consultants count:", oError);
          }
        });
  
        // Count of unavailable consultants
        oModel.read("/CONSULTANTIDSet/$count", {
          filters: [new Filter("Disponilbilty", FilterOperator.EQ, "0")],
          success: function (iCount) {
            var oCountModel = this.getView().getModel("CountModel");
            oCountModel.setProperty("/unavailable", iCount);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading unavailable consultants count:", oError);
          }
        });
      },
  
      // Function to load consultants data
      loadConsultantsData: function () {
        var oModel = this.getOwnerComponent().getModel();
        var aConsultants = [];
  
        // Read consultants data
        oModel.read("/CONSULTANTIDSet", {
          success: function (oData) {
            aConsultants = oData.results;
            var oConsultantsModel = new JSONModel({ Consultants: aConsultants });
            this.getView().setModel(oConsultantsModel, "ConsultantsModel");
          }.bind(this),
          error: function (oError) {
            console.error("Error reading consultants:", oError);
          }
        });
      },
  
      // Function to handle search for consultants based on user input
      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
        var aFilters = [];
  
        // Build array of filters based on search query
        if (sQuery && sQuery.length > 0) {
          aFilters = new Filter([
            new Filter("ConsultantId", FilterOperator.Contains, sQuery),
            new Filter("Name", FilterOperator.Contains, sQuery),
            new Filter("FirstName", FilterOperator.Contains, sQuery),
            new Filter("Login", FilterOperator.Contains, sQuery),
            new Filter("Expertise", FilterOperator.Contains, sQuery),
            new Filter("Email", FilterOperator.Contains, sQuery)
          ], false);
        }
  
        // Apply filters to the table binding
        var oTable = this.byId("idConsultantsTable");
        var oBinding = oTable.getBinding("rows");
        oBinding.filter(aFilters, "Application");
      },
  
      // Function to handle quick filters for consultant availability categories
      onQuickFilter: function (oEvent) {
        var sKey = oEvent.getParameter("selectedKey"); // Get selected filter key
        var oTable = this.byId("idConsultantsTable");
        var oBinding = oTable.getBinding("rows");
        var aFilters = [];
  
        // Determine which filter to apply based on selected key
        if (sKey === "available") {
          aFilters.push(new Filter("Disponilbilty", FilterOperator.EQ, "1"));
        } else if (sKey === "unavailable") {
          aFilters.push(new Filter("Disponilbilty", FilterOperator.EQ, "0"));
        }
  
        // Apply filters to the table binding
        oBinding.filter(aFilters, "Application");
      },
  
      // Function to extract filtered consultant data to CSV
      onExtract: function () {
        var oTable = this.byId("idConsultantsTable");
        var oBinding = oTable.getBinding("rows");
        var aFilteredContexts = oBinding.getContexts();
        var aFilteredData = aFilteredContexts.map(function (oContext) {
          return oContext.getObject();
        });
  
        var aCSV = [];
  
        // Add headers for CSV
        aCSV.push("ConsultantId,Name,FirstName,Disponibility,Email");
  
        // Add data rows for CSV
        aFilteredData.forEach(function (oConsultant) {
          aCSV.push([
            oConsultant.ConsultantId,
            oConsultant.Name,
            oConsultant.FirstName,
            oConsultant.Disponilbilty === '1' ? 'Available' : 'Unavailable',
            oConsultant.Email
          ].join(","));
        });
  
        // Convert data to CSV string
        var sCSV = aCSV.join("\n");
  
        // Set file name for downloaded CSV
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
 