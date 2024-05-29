sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageToast, Filter, FilterOperator, ODataModel) {
    "use strict";

    return Controller.extend("sap.suite.ui.commons.demo.tutorial.controller.ProcessFlow", {

        onInit: function () {
            console.log("onInit");
            this._calculatePriorityChart();
            this._initializeODataModel();
            this._fetchTicketsForCurrentMonth();
            console.log("End of onInit");
        },

        _initializeODataModel: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZODA_GEST_DISPON_SRV/");
            this.getView().setModel(oModel, "TICKETIDDATA");
        },

        _fetchTicketsForCurrentMonth: function () {
            var firstDayOfMonth = this._getFirstDayOfMonth();
            var lastDayOfMonth = this._getLastDayOfMonth();

            var formattedFirstDay = this._formatDate(firstDayOfMonth);
            var formattedLastDay = this._formatDate(lastDayOfMonth);

            var filters = [
                new Filter("CreationDate", FilterOperator.GE, formattedFirstDay),
                new Filter("CreationDate", FilterOperator.LE, formattedLastDay)
            ];

            this.getView().getModel("TICKETIDDATA").read("/TICKETIDSet", {
                filters: filters,
                success: this._onFetchSuccess.bind(this),
                error: this._onFetchError.bind(this)
            });
        },

        _getFirstDayOfMonth: function () {
            var currentDate = new Date();
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        },

        _getLastDayOfMonth: function () {
            var currentDate = new Date();
            return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        },

        _formatDate: function (date) {
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString().padStart(2, '0');
            var dd = date.getDate().toString().padStart(2, '0');
            return yyyy + mm + dd;
        },

        _onFetchSuccess: function (data) {
            if (!data || !data.results || data.results.length === 0) {
                return;
            }

            var totalTickets = data.results.length;
            var progressPercentage = (totalTickets / 60) * 100;

            var radialMicroChart = this.getView().byId("_IDGenRadialMicroChart1");
            radialMicroChart.setPercentage(progressPercentage);
        },

        _onFetchError: function () {
            MessageToast.show("Error fetching ticket data");
        },

        _calculatePriorityChart: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oJSONModel = new sap.ui.model.json.JSONModel();

            oModel.read("/TICKETIDSet", {
                success: function (oData) {
                    var priorityCounts = {
                        LOW: 0,
                        MEDIUM: 0,
                        HIGH: 0
                    };

                    oData.results.forEach(function (ticket) {
                        if (priorityCounts.hasOwnProperty(ticket.Priority)) {
                            priorityCounts[ticket.Priority]++;
                        }
                    });

                    var totalValue = priorityCounts.LOW + priorityCounts.MEDIUM + priorityCounts.HIGH;

                    var oPriorityData = {
                        low: { value: priorityCounts.LOW, displayValue: priorityCounts.LOW.toString() },
                        medium: { value: priorityCounts.MEDIUM, displayValue: priorityCounts.MEDIUM.toString() },
                        high: { value: priorityCounts.HIGH, displayValue: priorityCounts.HIGH.toString() },
                        total: { value: totalValue, displayValue: totalValue.toString() }
                    };

                    oJSONModel.setData(oPriorityData);
                    this.getView().setModel(oJSONModel, "priorityData");
                }.bind(this),
                error: function () {
                    MessageToast.show("Error calculating priority data");
                }
            });
        }

    });
});
