/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"appcap/app-cap/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});