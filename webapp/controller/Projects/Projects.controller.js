sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";
 
  return Controller.extend("management.controller.Projects.Projects", {
 
    onInit: function () {
      // Initialize the filters
      this._mFilters = {
        all: []
      };
 
      var oModel = this.getOwnerComponent().getModel();
      this._setCounts(oModel); // Set initial counts for projects
      this.loadProjectsData(); // Load projects data
    },
 
    // Function to set counts for projects
    _setCounts: function (oModel) {
      // Total count of all projects
      oModel.read("/PROJECTIDSet/$count", {
        success: function (iCount) {
          var oCountModel = new JSONModel({ count: iCount });
          this.getView().setModel(oCountModel, "CountModel");
        }.bind(this),
        error: function (oError) {
          console.error("Error reading project count:", oError);
        }
      });
    },
 
    // Function to load projects data
    loadProjectsData: function () {
      var oModel = this.getOwnerComponent().getModel();
      var aProjects = [];
 
      // Read projects data
      oModel.read("/PROJECTIDSet", {
        success: function (oData) {
          aProjects = oData.results;
          var oProjectsModel = new JSONModel({ Projects: aProjects });
          this.getView().setModel(oProjectsModel, "ProjectsModel");
        }.bind(this),
        error: function (oError) {
          console.error("Error reading projects:", oError);
        }
      });
    },
 
    // Function to handle search for projects based on user input
    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
      var aFilters = [];
 
      // Build array of filters based on search query
      if (sQuery && sQuery.length > 0) {
        aFilters = new Filter([
          new Filter("IdProject", FilterOperator.Contains, sQuery),
          new Filter("NomProjet", FilterOperator.Contains, sQuery),
          new Filter("ChefProjet", FilterOperator.Contains, sQuery)
        ], false);
      }
 
      // Apply filters to the table binding
      var oTable = this.byId("idProjectsTable");
      var oBinding = oTable.getBinding("rows");
      oBinding.filter(aFilters, "Application");
    },
 
    // Function to handle quick filters for projects
    onQuickFilter: function (oEvent) {
      var sKey = oEvent.getParameter("selectedKey"); // Get selected filter key
      var oTable = this.byId("idProjectsTable");
      var oBinding = oTable.getBinding("rows");
      var aFilters = [];
 
      // Determine which filter to apply based on selected key
      if (sKey === "extract") {
        this.onExtract(); // Extract project data to CSV
      } else {
        aFilters = this._mFilters[sKey];
        oBinding.filter(aFilters, "Application");
      }
    },
 
    // Function to extract filtered project data to CSV
    onExtract: function () {
      var oTable = this.byId("idProjectsTable");
      var oBinding = oTable.getBinding("rows");
      var aFilteredContexts = oBinding.getContexts();
      var aFilteredData = aFilteredContexts.map(function (oContext) {
        return oContext.getObject();
      });
 
      var aCSV = [];
 
      // Add headers for CSV
      aCSV.push("IdProject,NomProjet,ChefProjet");
 
      // Add data rows for CSV
      aFilteredData.forEach(function (oProject) {
        aCSV.push([
          oProject.IdProject,
          oProject.NomProjet,
          oProject.ChefProjet
        ].join(","));
      });
 
      // Convert data to CSV string
      var sCSV = aCSV.join("\n");
 
      // Set file name for downloaded CSV
      var sFileName = "projects_" + this._sSelectedFilterKey + ".csv";
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
 