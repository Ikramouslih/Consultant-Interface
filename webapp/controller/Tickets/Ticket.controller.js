sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("management.controller.Tickets.Ticket", {

    onInit: function () {
      // Initialize filters for ticket status categories
      this._mFilters = {
        all: [], // No filter, show all tickets
        completed: [new Filter("Status", FilterOperator.EQ, "Done")], 
        in_progress: [new Filter("Status", FilterOperator.EQ, "In Progress")],
        not_assigned: [new Filter("Status", FilterOperator.EQ, "Unassigned")], 
        on_hold: [new Filter("Status", FilterOperator.EQ, "On Hold")] 
      };

      var oModel = this.getOwnerComponent().getModel();
      this._setCounts(oModel); // Set initial counts for ticket status categories
      this.loadTicketsWithConsultantAndProjectNames(); // Load tickets with consultant name and project names instead of IDs
    },

    // Function to set counts for different ticket status categories
    _setCounts: function (oModel) {
      // Total count of all tickets
      oModel.read("/TICKETIDSet/$count", {
        success: function (iCount) {
          var oCountModel = new JSONModel({ count: iCount });
          this.getView().setModel(oCountModel, "CountModel");
        }.bind(this),
        error: function (oError) {
          console.error("Error reading ticket count:", oError);
        }
      });

      // Count of completed tickets
      oModel.read("/TICKETIDSet/$count", {
        filters: [new Filter("Status", FilterOperator.EQ, "Done")],
        success: function (iCount) {
          var oCountModel = this.getView().getModel("CountModel");
          oCountModel.setProperty("/completed", iCount);
        }.bind(this),
        error: function (oError) {
          console.error("Error reading completed tickets count:", oError);
        }
      });

      // Count of tickets in progress
      oModel.read("/TICKETIDSet/$count", {
        filters: [new Filter("Status", FilterOperator.EQ, "In Progress")],
        success: function (iCount) {
          var oCountModel = this.getView().getModel("CountModel");
          oCountModel.setProperty("/in_progress", iCount);
        }.bind(this),
        error: function (oError) {
          console.error("Error reading in progress tickets count:", oError);
        }
      });

      // Count of unassigned tickets
      oModel.read("/TICKETIDSet/$count", {
        filters: [new Filter("Status", FilterOperator.EQ, "Unassigned")],
        success: function (iCount) {
          var oCountModel = this.getView().getModel("CountModel");
          oCountModel.setProperty("/not_assigned", iCount);
        }.bind(this),
        error: function (oError) {
          console.error("Error reading not assigned tickets count:", oError);
        }
      });

      // Count of tickets on hold
      oModel.read("/TICKETIDSet/$count", {
        filters: [new Filter("Status", FilterOperator.EQ, "On Hold")],
        success: function (iCount) {
          var oCountModel = this.getView().getModel("CountModel");
          oCountModel.setProperty("/on_hold", iCount);
        }.bind(this),
        error: function (oError) {
          console.error("Error reading on hold tickets count:", oError);
        }
      });
    },

    // Function to load tickets along with associated consultant name and project names instead of IDs
    loadTicketsWithConsultantAndProjectNames: function () {
      var oModel = this.getOwnerComponent().getModel();
      var aTickets = [];
      var aConsultants = [];
      var aProjects = [];

      // Read tickets data
      oModel.read("/TICKETIDSet", {
        success: function (oData) {
          aTickets = oData.results;
          checkIfAllLoaded(); // Check if all necessary data is loaded
        },
        error: function (oError) {
          console.error("Error reading tickets:", oError);
        }
      });

      // Read consultants data
      oModel.read("/CONSULTANTIDSet", {
        success: function (oData) {
          aConsultants = oData.results;
          checkIfAllLoaded(); // Check if all necessary data is loaded
        },
        error: function (oError) {
          console.error("Error reading consultants:", oError);
        }
      });

      // Read projects data
      oModel.read("/PROJECTIDSet", {
        success: function (oData) {
          aProjects = oData.results;
          checkIfAllLoaded(); // Check if all necessary data is loaded
        },
        error: function (oError) {
          console.error("Error reading projects:", oError);
        }
      });

      var checkIfAllLoaded = function () {
        // Function to merge ticket data with consultant and project names once all data is loaded

        if (aTickets.length > 0 && aConsultants.length > 0 && aProjects.length > 0) {
          // Create maps for quick lookup of consultant and project names
          var oConsultantMap = aConsultants.reduce(function (map, consultant) {
            map[consultant.ConsultantId] = consultant.Name + " " + consultant.FirstName;
            return map;
          }, {});

          var oProjectMap = aProjects.reduce(function (map, project) {
            map[project.IdProject] = project.NomProjet;
            return map;
          }, {});

          // Merge ticket data with consultant and project names
          var aMergedData = aTickets.map(function (ticket) {
            ticket.ConsultantName = oConsultantMap[ticket.Consultant] || "-";
            ticket.ProjectName = oProjectMap[ticket.Projet] || "Unknown Project";

            return ticket;
          });

          // Create JSON model for merged ticket data
          var oTicketsModel = new JSONModel({ Tickets: aMergedData, TicketCount: aMergedData.length });
          this.getView().setModel(oTicketsModel, "TicketsModel");
        }
      }.bind(this);
    },

    // Function to handle search for tickets based on user input
    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query"); // Get search query
      var aFilters = [];

      // Build array of filters based on search query
      if (sQuery && sQuery.length > 0) {
        aFilters = new Filter([
          new Filter("IdTicket", FilterOperator.Contains, sQuery),
          new Filter("IdJira", FilterOperator.Contains, sQuery),
          new Filter("Titre", FilterOperator.Contains, sQuery),
          new Filter("Description", FilterOperator.Contains, sQuery),
          new Filter("ProjectName", FilterOperator.Contains, sQuery),
          new Filter("ConsultantName", FilterOperator.Contains, sQuery),
          new Filter("Status", FilterOperator.Contains, sQuery),
          new Filter("Priority", FilterOperator.Contains, sQuery),
          new Filter("CreationDate", FilterOperator.Contains, sQuery),
          new Filter("StartDate", FilterOperator.Contains, sQuery),
          new Filter("EndDate", FilterOperator.Contains, sQuery),
          new Filter("Technology", FilterOperator.Contains, sQuery)
        ], false);
      }

      // Apply filters to the table binding
      var oTable = this.byId("idTicketsTable");
      var oBinding = oTable.getBinding("rows");
      oBinding.filter(aFilters, "Application");
    },

    // Function to handle quick filters for ticket status categories
    onQuickFilter: function (oEvent) {
      var sKey = oEvent.getParameter("selectedKey"); // Get selected filter key
      var oTable = this.byId("idTicketsTable");
      var oBinding = oTable.getBinding("rows");
      var aFilters = [];

      // Determine which filter to apply based on selected key
      if (sKey === "completed") {
        aFilters.push(new Filter("Status", FilterOperator.EQ, "Done"));
      } else if (sKey === "in_progress") {
        aFilters.push(new Filter("Status", FilterOperator.EQ, "In Progress"));
      } else if (sKey === "not_assigned") {
        aFilters.push(new Filter("Status", FilterOperator.EQ, "Unassigned"));
      } else if (sKey === "on_hold") {
        aFilters.push(new Filter("Status", FilterOperator.EQ, "On Hold"));
      } else if (sKey === "create") {
        this.getOwnerComponent().getRouter().navTo("CreateTicket"); // Navigate to create ticket page
      } else if (sKey === "extract") {
        this.onExtractTickets(); // Extract ticket data to CSV
      }

      // Apply filters to the table binding
      oBinding.filter(aFilters, "Application");
    },

    // Function to extract filtered ticket data to CSV
    onExtractTickets: function () {
      var oTable = this.byId("idTicketsTable");
      var oBinding = oTable.getBinding("rows");
      var aFilteredContexts = oBinding.getContexts();
      var aFilteredData = aFilteredContexts.map(function (oContext) {
        return oContext.getObject();
      });

      var aCSV = [];

      // Add headers for CSV
      aCSV.push("Jira ID,Title,Project,Consultant,Status,Priority,Creation Date,Estimated Days");

      // Add data rows for CSV
      aFilteredData.forEach(function (oTicket) {
        aCSV.push([
          oTicket.IdJira,
          oTicket.Titre,
          oTicket.ProjectName,
          oTicket.ConsultantName,
          oTicket.Status,
          oTicket.Priority,
          this.formatDate(oTicket.CreationDate),
          oTicket.Estimated
        ].join(","));
      }.bind(this));

      // Convert data to CSV string
      var sCSV = aCSV.join("\n");

      // Set file name for downloaded CSV
      var sFileName = "tickets_" + this._sSelectedFilterKey + ".csv";
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

    // Function to handle assigning tickets to a consultant
    onAssignTicket: function (oEvent) {
      var oSource = oEvent.getSource();
      var oBindingContext = oSource.getBindingContext("TicketsModel");
      var sTicketId = oBindingContext.getProperty("IdTicket");

      // Redirect to assign ticket page
      this.getOwnerComponent().getRouter().navTo("AssignTicket", { IdTicket: sTicketId });
    },

    // Function to format priority color based on priority level
    formatPriorityColor: function (sPriority) {
      switch (sPriority) {
        case "High":
          return 2; // Red color
        case "Medium":
          return 1; // Yellow color
        case "Low":
          return 8; // Gray color
        default:
          return 8; // Gray color
      }
    },

    // Function to determine priority icon based on priority level
    formatPriorityIcon: function (sPriority) {
      switch (sPriority) {
        case "High":
          return "sap-icon://arrow-top"; // High priority icon
        case "Medium":
          return "sap-icon://line-charts"; // Medium priority icon
        case "Low":
          return "sap-icon://arrow-bottom"; // Low priority icon
        default:
          return "sap-icon://arrow-bottom"; // Default icon
      }
    },

    // Function to format date from YYYYMMDD to YYYY-MM-DD format
    formatDate: function (sDate) {
      if (!sDate) {
        return "-";
      }

      // Ensure the date string is in the expected format
      if (sDate.length !== 8) {
        console.warn("Invalid date format: " + sDate);
        return sDate;
      }

      // Extract year, month, and day from the date string
      var year = sDate.substring(0, 4);
      var month = sDate.substring(4, 6);
      var day = sDate.substring(6, 8);

      // Format date as "YYYY-MM-DD"
      var formattedDate = year + "-" + month + "-" + day;
      return formattedDate;
    }
    
  });
});
