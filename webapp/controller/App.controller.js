sap.ui.define(
  ['./BaseController',
    "sap/ui/core/mvc/Controller",
    'sap/ui/Device',
    'sap/ui/core/CustomData',
    'sap/ui/core/syncStyleClass',
    'sap/m/library'
  ],
  function (
    BaseController,
    Device,
    CustomData,
    syncStyleClass,
  ) {
    "use strict";

    return BaseController.extend("management.controller.App", {
      onInit: function () {

        this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

        // // if the app starts on desktop devices with small or medium screen size, collaps the side navigation
        // if (Device.resize.width <= 1024) {
        //   this.onSideNavButtonPress();
        // }
        //   Device.media.attachHandler(this._handleWindowResize, this);
        //   this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
      },

      onExit: function () {
        Device.media.detachHandler(this._handleWindowResize, this);
      },

      onRouteChange: function (oEvent) {
        this.getModel('side').setProperty('/selectedKey', oEvent.getParameter('name'));

        if (Device.system.phone) {
          this.onSideNavButtonPress();
        }
      },

      onSideNavButtonPress: function () {
        var oToolPage = this.byId("app");
        var bSideExpanded = oToolPage.getSideExpanded();
        this._setToggleButtonTooltip(bSideExpanded);
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      },

      _setToggleButtonTooltip: function (bSideExpanded) {
        var oToggleButton = this.byId('sideNavigationToggleButton');
        this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function (sTooltipText) {
          oToggleButton.setTooltip(sTooltipText);
        });
      },

      /**
       * Returns a promise which resolves with the resource bundle value of the given key <code>sI18nKey</code>
       *
       * @public
       * @param {string} sI18nKey The key
       * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
       * @returns {Promise<string>} The promise
       */
      getBundleText: function (sI18nKey, aPlaceholderValues) {
        return this.getBundleTextByModel(sI18nKey, this.getOwnerComponent().getModel("i18n"), aPlaceholderValues);
      },

      _handleWindowResize: function (oDevice) {
        if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
          this.onSideNavButtonPress();
          // set the _bExpanded to false on tablet devices
          // extending and collapsing of side navigation should be done when resizing from
          // desktop to tablet screen sizes)
          this._bExpanded = (oDevice.name === "Desktop");
        }
      },

      onConsultantsSelect: function () {
        this.getOwnerComponent().getRouter().navTo("RouteConsultant");
      },

      onDashboardSelect: function () {
        this.getOwnerComponent().getRouter().navTo("RouteManagement");
      },
      onTicketsSelect: function () {
        this.getOwnerComponent().getRouter().navTo("RouteTicket");
      },
      onProjectsSelect: function () {
        this.getOwnerComponent().getRouter().navTo("Project");
      },
      onConsultantCalendar: function () {
        this.getOwnerComponent().getRouter().navTo("ConsultantCalendar");
      }

    });
  },


);
