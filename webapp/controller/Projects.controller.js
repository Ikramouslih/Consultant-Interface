sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/Device", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, Device, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("management.controller.Projects", {
      onInit: function () {
        this._mFilters = {
          all: []
          // Add additional filters if needed
        };

        var oModel = this.getOwnerComponent().getModel();
        oModel.read("/PROJECTIDSet/$count", {
          success: function (iCount) {
            var oCountModel = new sap.ui.model.json.JSONModel({ count: iCount });
            this.getView().setModel(oCountModel, "CountModel");
          }.bind(this),
          error: function (oError) {
            console.error("Error reading projects count:", oError);
          }
        });
      },

      onQuickFilter: function (oEvent) {
        var sSelectedKey = oEvent.getParameter("selectedKey");
        this._sSelectedFilterKey = sSelectedKey; // Save the selected filter key

        if (sSelectedKey === "create") {
          this.getOwnerComponent().getRouter().navTo("CreateProjects");
        } else if (sSelectedKey === "extract") {
          this.onExtract(); // Call the extract function
        } else {
          var oBinding = this.byId("idProjectsTable").getBinding("rows");
          var aFilters = this._mFilters[sSelectedKey];
          oBinding.filter(aFilters);
        }
      },

      onExtract: function () {
        var oTable = this.byId("idProjectsTable");
        var oBinding = oTable.getBinding("rows");
        var aFilteredContexts = oBinding.getContexts();
        var aFilteredData = aFilteredContexts.map(function (oContext) {
          return oContext.getObject();
        });

        var aCSV = [];

        // Add CSV headers
        aCSV.push("IdProject,NomProjet,ChefProjet");

        // Add table data
        aFilteredData.forEach(function (oProject) {
          aCSV.push([
            oProject.IdProject,
            oProject.NomProjet,
            oProject.ChefProjet
          ].join(","));
        });

        // Convert data to CSV string
        var sCSV = aCSV.join("\n");

        // Set filename based on selected filter
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
      },

      onCreateProjects: function () {
        this.getOwnerComponent().getRouter().navTo("CreateProjects");
      }
      
    });
  }
);
