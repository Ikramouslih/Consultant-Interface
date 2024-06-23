sap.ui.define(
  ["sap/ui/core/mvc/Controller",
   "sap/ui/model/Filter",
   "sap/ui/model/FilterOperator",
  ],
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Projects.Projects", {

      onInit: function () {

        // Initialize filter object with an empty array for 'all' key
        this._mFilters = {
          all: []
        };

        // Fetch and display the count of projects
        var oModel = this.getOwnerComponent().getModel();
        oModel.read("/PROJECTIDSet/$count", {
          success: function (iCount) {
            // Create a JSON model with the count and set it to the view
            var oCountModel = new sap.ui.model.json.JSONModel({ count: iCount });
            this.getView().setModel(oCountModel, "CountModel");
          }.bind(this),
          error: function (oError) {
            console.error("Error reading projects count:", oError);
          }
        });
        
      },

      // Fetch and display the projects data in the table
      onQuickFilter: function (oEvent) {

        // Retrieve the selected key from the event
        var sSelectedKey = oEvent.getParameter("selectedKey");
        this._sSelectedFilterKey = sSelectedKey; 

        // Handle different actions based on the selected key
        if (sSelectedKey === "extract") {
          this.onExtract(); // Perform extraction action
        } else {
          // Filter the table based on selected key
          var oBinding = this.byId("idProjectsTable").getBinding("rows");
          var aFilters = this._mFilters[sSelectedKey];
          oBinding.filter(aFilters);
        }

      },

      // Extract data to CSV format and initiate download
      onExtract: function () {

        // Extract data to CSV format and initiate download
        var oTable = this.byId("idProjectsTable");
        var oBinding = oTable.getBinding("rows");
        var aFilteredContexts = oBinding.getContexts();
        var aFilteredData = aFilteredContexts.map(function (oContext) {
          return oContext.getObject();
        });

        // Prepare CSV content
        var aCSV = [];
        aCSV.push("IdProject,NomProjet,ChefProjet");
        aFilteredData.forEach(function (oProject) {
          aCSV.push([
            oProject.IdProject,
            oProject.NomProjet,
            oProject.ChefProjet
          ].join(","));
        });

        var sCSV = aCSV.join("\n");
        var sFileName = "projects_" + this._sSelectedFilterKey + ".csv";
        var oBlob = new Blob([sCSV], { type: 'text/csv;charset=utf-8;' });

        // Create a temporary link element to initiate download
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
      },

      // Filter the projects based on the user input
      onSearch: function(oEvent) {

        // Handle search event to filter table rows
        var sQuery = oEvent.getParameter("query");

        var aFilters = [];
        if (sQuery && sQuery.length > 0) {
          // Create filters for 'IdProject', 'NomProjet', and 'ChefProjet' fields
          var filterId = new Filter("IdProject", FilterOperator.Contains, sQuery);
          var filterNom = new Filter("NomProjet", FilterOperator.Contains, sQuery);
          var filterChef = new Filter("ChefProjet", FilterOperator.Contains, sQuery);

          // Combine filters using OR operator
          aFilters = new Filter([filterId, filterNom, filterChef], false);
        }

        // Apply the filters to the table binding with 'Application' filter type
        var oTable = this.byId("idProjectsTable");
        var oBinding = oTable.getBinding("rows");
        oBinding.filter(aFilters, "Application");

      }
    
    });
  }
);
