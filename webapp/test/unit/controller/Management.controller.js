/*global QUnit*/

sap.ui.define([
	"management/controller/Management.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Management Controller");

	QUnit.test("I should test the Management controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
