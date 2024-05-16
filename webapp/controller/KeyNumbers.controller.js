sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel" // Import ODataModel
], function(Controller, MessageToast, Filter, FilterOperator, ODataModel) {
    "use strict";

    return Controller.extend("sap.suite.ui.commons.demo.tutorial.controller.ProcessFlow", {

        onInit: function() {
            console.log("onInit");
            this._calculatePriorityChart();
            // document.getElementById("application-management-display-component---Management--_IDGenXMLView3--_IDGenComparisonMicroChartData1").style.display = "none";
            
            // Initialize the ODataModel with the service URL
            var oModel = new ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");

            // Set the model for the view
            this.getView().setModel(oModel, "TICKETIDDATA");

            // Get the current date
            var currentDate = new Date();
            // Get the first day of the current month
            var firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            // Get the last day of the current month
            var lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            console.log("First day of month: " + firstDayOfMonth);
            console.log("Last day of month: " + lastDayOfMonth);

            // Format the dates for ODataModel filter
            var formattedFirstDay = this._formatDate(firstDayOfMonth);
            var formattedLastDay = this._formatDate(lastDayOfMonth);

			console.log("Formatted First Day: " + formattedFirstDay);
			console.log("Formatted Last Day: " + formattedLastDay);

			
            var filterStartDate = new Filter({
				path: "CreationDate",
				operator: FilterOperator.GE,
				value1: formattedFirstDay
			});
			
			var filterEndDate = new Filter({
				path: "CreationDate",
				operator: FilterOperator.LE,
				value1: formattedLastDay
			});
			
			console.log("Filter Start Date: ", filterStartDate);
			console.log("Filter End Date: ", filterEndDate);

			// Combine the filters using AND operator
			var odataFilter = new Filter({
				filters: [filterStartDate, filterEndDate],
				and: true
			});
			console.log("OData Filter: ", odataFilter);


            // Fetch the tickets based on the filter
            oModel.read("/TICKETIDSet", {
                filters: [odataFilter],
                success: this._onFetchSuccess.bind(this),
                error: this._onFetchError.bind(this)
            });

            console.log("End of onInit");
        },

        _formatDate: function(date) {
            // Ensure the date is formatted as YYYYMMDD
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
            var dd = date.getDate().toString().padStart(2, '0');
            return yyyy + mm + dd;
        },

        _onFetchSuccess: function(data) {
            if (!data || !data.results || data.results.length === 0) {
                // No data returned, handle accordingly
                return;
            }

            // Calculate the progress percentage
            var targetTickets = 60; // Target number of tickets
            var totalTickets = data.results.length; // Total number of tickets fetched
            var progressPercentage = (totalTickets / targetTickets) * 100;

            console.log("Total tickets: " + totalTickets);
            console.log("Progress percentage: " + progressPercentage);

            // Update the RadialMicroChart with the progress percentage
            var radialMicroChart = this.getView().byId("_IDGenRadialMicroChart1");
            radialMicroChart.setPercentage(progressPercentage);
        },

        _onFetchError: function(error) {
            // Handle error
            MessageToast.show("Error fetching ticket data");
        },/* 
        _calculatePriorityChart: function() {
            var oModel = this.getOwnerComponent().getModel(); // Assuming you have set a model for your view
        
            oModel.read("/TICKETIDSet", {
                success: function(oData) {
                    var lowTotal = 0,
                        mediumTotal = 0,
                        highTotal = 0;
        
                    oData.results.forEach(function(ticket) {
                        switch (ticket.Priority) {
                            case "LOW":
                                lowTotal++;
                                break;
                            case "MEDIUM":
                                mediumTotal++;
                                break;
                            case "HIGH":
                                highTotal++;
                                break;
                        }
                    });
        
                    var totalValue = lowTotal + mediumTotal + highTotal;
                    console.log('totalValue : '+ totalValue);
                    // Update the value of the "Total" chart
                    var totalChart = this.getView().byId("_IDGenComparisonMicroChartData15");
                    if (totalChart) {
                        totalChart.setValue(totalValue.toString());
                        totalChart.setDisplayValue(totalValue.toString());
                    }
                }.bind(this),
                error: function(error) {
                    // Handle error
                }
            });
        } */_calculatePriorityChart: function() {
    var oModel = this.getOwnerComponent().getModel(); // Assuming you have set a model for your view
    var oJSONModel = new sap.ui.model.json.JSONModel();
 
    oModel.read("/TICKETIDSet", {
        success: function(oData) {
            var lowTotal = 0,
                mediumTotal = 0,
                highTotal = 0;
 
            oData.results.forEach(function(ticket) {
                switch (ticket.Priority) {
                    case "LOW":
                        lowTotal++;
                        break;
                    case "MEDIUM":
                        mediumTotal++;
                        break;
                    case "HIGH":
                        highTotal++;
                        break;
                }
            });
 
            var totalValue = lowTotal + mediumTotal + highTotal;
            console.log('totalValue : '+ totalValue);
 
            var oPriorityData = {
                low: { value: lowTotal, displayValue: lowTotal.toString() },
                medium: { value: mediumTotal, displayValue: mediumTotal.toString() },
                high: { value: highTotal, displayValue: highTotal.toString() },
                total: { value: totalValue, displayValue: totalValue.toString() }
            };
 
            oJSONModel.setData(oPriorityData);
            this.getView().setModel(oJSONModel, "priorityData");
        }.bind(this),
        error: function(error) {
            // Handle error
        }
    });
}

    });
});
