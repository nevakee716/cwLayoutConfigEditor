/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */

/*global cwAPI, jQuery, cwConfigurationEditorMapping */
(function (cwApi, $) {
  "use strict";

  var cwLayoutConfigEditor;

  cwLayoutConfigEditor = function (options, viewSchema) {
    cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
    this.drawOneMethod = this.drawOne.bind(this);
    cwApi.registerLayoutForJSActions(this);
  };

  cwLayoutConfigEditor.prototype.applyJavaScript = function () {
    var that = this,
      objectCategory = this.mainObject.properties.type,
      layoutEngine;
    if (cwApi.isUndefined(objectCategory) || !cwConfigurationEditorMapping[objectCategory]) {
      return;
    }

    $("#navview-" + this.viewSchema.ViewName).removeClass("cw-view-tab-disable");
    cwApi.CwAsyncLoader.load("angular", function () {
      var loader = cwApi.CwAngularLoader,
        templatePath,
        $container = $("#" + that.domId);
      loader.setup();
      layoutEngine = new cwApi.cwLayoutsEngine[cwConfigurationEditorMapping[objectCategory]](that.mainObject, loader);
      templatePath = layoutEngine.getTemplatePath("cwLayoutConfigEditor", "cwLayoutConfigEditor");
      layoutEngine.init(that.config);
      loader.loadControllerWithTemplate("cwLayoutConfigEditor", $container, templatePath, function ($scope) {
        $scope.operationTemplatePath = layoutEngine.getOperationTemplatePath();
        $scope.submit = function (e) {
          e.preventDefault();
          layoutEngine.saveConfiguration($scope);
        };
        $scope.isContentAvailable = layoutEngine.isContentAvailable;
        layoutEngine.run($scope, that.config);
      });
    });
  };

  cwLayoutConfigEditor.prototype.drawOne = function (output, item, callback) {
    /*jslint unparam:true*/
    return undefined;
  };

  cwLayoutConfigEditor.prototype.drawAssociations = function (output, associationTitleText, object) {
    var cleanJSON = function (json) {
      let c = json.replaceAll('\\\\\\"', "#§#§#");
      c = c.replaceAll('\\"', '"');
      c = c.replaceAll("#§#§#", '\\"');
      return c;
    };

    /*jslint unparam:true*/
    this.mainObject = object.associations[this.nodeID][0];
    this.config = {};
    if (cwApi.cwPropertiesGroups.formatMemoProperty(this.mainObject.properties.configuration) !== "") {
      this.config = JSON.parse(cleanJSON(this.mainObject.properties.configuration));
    }
    this.domId = "zone_" + this.viewSchema.ViewName;
  };

  cwApi.cwLayouts.cwLayoutConfigEditor = cwLayoutConfigEditor;
})(cwAPI, jQuery);
