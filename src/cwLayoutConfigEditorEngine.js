/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery, angular*/
(function (cwApi, $) {
  "use strict";

  var cwLayoutConfigEditorEngine = function(object, loader){
    this.mainObject = object;
    this.angularLoader = loader;
  };

  cwLayoutConfigEditorEngine.prototype.getOperationTemplatePath = function() {
    return undefined;
  };

  cwLayoutConfigEditorEngine.prototype.init = function(config) {
    /*jslint unparam:true*/
    return undefined;
  };

  cwLayoutConfigEditorEngine.prototype.run = function($scope, config) {
    /*jslint unparam:true*/
    return undefined;
  };

  cwLayoutConfigEditorEngine.prototype.getConfigToSave = function($scope) {
    /*jslint unparam:true*/
    return undefined;
  };

  cwLayoutConfigEditorEngine.prototype.isContentAvailable = function(){
    return undefined;
  };

  cwLayoutConfigEditorEngine.prototype.getTemplatePath = function(folder, templateName) {
    return cwApi.format('{0}/html/{1}/{2}.ng.html', cwApi.getCommonContentPath(), folder, templateName);
  };

  cwLayoutConfigEditorEngine.prototype.saveConfiguration = function($scope) {
    var changeset, sourceItem, targetItem;
    sourceItem = {
      associations: {},
      displayNames: {
        configuration: "Configuration"
      },
      properties: {
        configuration: this.mainObject.properties.configuration
      }
    };
    targetItem = {
      associations: {},
      displayNames: {
        configuration: "Configuration"
      },
      properties: {
        configuration: angular.toJson(this.getConfigToSave($scope))
      }
    };
    cwApi.pendingChanges.clear();
    changeset = new cwApi.CwPendingChangeset(this.mainObject.objectTypeScriptName, this.mainObject.object_id, this.mainObject.name, true, 1);
    changeset.compareAndAddChanges(sourceItem, targetItem);
    cwApi.pendingChanges.addChangeset(changeset);
    cwApi.pendingChanges.sendAsChangeRequest(undefined, function(response) {
      if (cwApi.statusIsKo(response)) {
        cwApi.notificationManager.addNotification($.i18n.prop('editmode_someOfTheChangesWereNotUpdated'), 'error');
      } else {
        cwApi.notificationManager.addNotification($.i18n.prop('editmode_yourChangeHaveBeenSaved'));
      }
    }, function(error) {
      cwApi.notificationManager.addNotification(error.status + ' - ' + error.responseText, 'error');
    });
  };


  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)){
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwLayoutConfigEditorEngine = cwLayoutConfigEditorEngine;

}(cwAPI, jQuery));