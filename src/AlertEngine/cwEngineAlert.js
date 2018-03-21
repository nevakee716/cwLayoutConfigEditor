/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery, angular */
(function(cwApi, $) {
  "use strict";

  var cwEngineAlert = function(object, loader) {
    cwApi.extend(this, cwApi.cwLayoutsEngine.cwLayoutConfigEditorEngine, object, loader);
  };

  cwEngineAlert.prototype.getOperationTemplatePath = function() {
    return this.getTemplatePath('AlertEngine', 'cwTemplateAlertEngine');
  };

  cwEngineAlert.prototype.init = function(config) {
    this.engine = new cwApi.cwLayoutsEngine["cwEngineAlert_Alert"](config);
  };

  cwEngineAlert.prototype.getConfigToSave = function($scope){
    var i, json = {}, o;
    if(this.engine){
      this.engine.GetConfigurationToSave(json);
      json.what = this.engine.what;
      json.who = this.engine.who;
      json.mail = this.engine.mail;
      json.mailObject = this.engine.mailObject;
      json.notification = this.engine.notification;
      json.workflowID = this.engine.workflowID;
      json.notificationObject = this.engine.notificationObject;
      json.publicAccess = window.location.origin + window.location.pathname;
      json.MailTemplate = cwApi.cwLayoutsEngine.basicAlertTemplate.MailTemplate;
      json.header = cwApi.cwLayoutsEngine.basicAlertTemplate.header;
      json.CSS = cwApi.cwLayoutsEngine.basicAlertTemplate.CSS;
      json.favGetAll  = this.engine.favGetAll;
      json.delay  = this.engine.delay;
      json.delayValue  = this.engine.delayValue;

    }
    return json;
  };

  cwEngineAlert.cloneObjectType = function(ot){
    var ptScriptName, newOt = $.extend(true, {}, ot);
    newOt.propertiesArray = [];
    for(ptScriptName in newOt.properties){
      if (newOt.properties.hasOwnProperty(ptScriptName)){
        newOt.propertiesArray.push(newOt.properties[ptScriptName]);
      }
    }
    return newOt;
  };

  cwEngineAlert.prototype.isContentAvailable = function(){
    if (this.Operations && this.Operations.length > 0){
      return true;
    }
    return false;
  };

  cwEngineAlert.prototype.run = function($scope, config) {
    /*jslint unparam:true*/
    var that = this, index = 0;
    $scope.engine = this.engine;
    this.engine.run($scope);

    cwApi.tmp = $scope.Operations;

    $scope.FilterOperators = ['Equal','NotEqual','GreaterThan','LessThan','GreaterThanEqual','LessThanEqual'/*,'In'*/];

    $scope.templateByTypeOfOperation = {
      'Alert': that.getTemplatePath('AlertEngine', 'Template_Alert'),
    };

    $scope.enumWhat = ['modification'];
    $scope.enumWho = ['favorite', 'workflow']; 

    function getRandomId(){
      var id = Math.random().toString().substring(2, 10);
      if ($scope.OperationsById.hasOwnProperty(id)){
        return getRandomId();
      }
      return id;
    }

    function getNextOrder(){
      if ($scope.Operations.length > 0){
        $scope.Operations.sort(function(a, b){return a.Order - b.Order;});
        return $scope.Operations[$scope.Operations.length-1].Order + 1;
      }
      return 1;
    }

    $scope.addOperation = function(e) {
      var op;
      e.preventDefault();
      op = {
        Id: getRandomId(),
        Label: $.i18n.prop('ec_NewOperationLabel'),
        Order: getNextOrder()
      };
      $scope.Operations.push(op);
      $scope.OperationsById[op.Id] = op;
      $scope.displayOperation(op.Id);
    };

    $scope.displayOperation = function(selectedId) {
      var i;
      for (i = 0; i < $scope.Operations.length; i+=1) {
        if (selectedId === $scope.Operations[i].Id){
          $scope.Operations[i].selected = true;
        } else {
          $scope.Operations[i].selected = false;
        }
      }
    };

    $scope.removeOperation = function(e, selectedId) {
      var i;
      e.preventDefault();
      for (i = 0; i < $scope.Operations.length; i+=1) {
        if (selectedId === $scope.Operations[i].Id){
          break;
        }
      }
      $scope.Operations.splice(i, 1);
      delete $scope.OperationsById[selectedId];
      if ($scope.Operations.length > 0){
        if (i === $scope.Operations.length){
          $scope.displayOperation($scope.Operations[i-1].Id);
        } else {
          $scope.displayOperation($scope.Operations[i].Id);
        }
      }
    };

    $scope.updateOperationType = function(operation){
      operation.engine = new cwApi.cwLayoutsEngine['cwEngineAlert_' + operation.Type]();
      operation.engine.run($scope);
      
    };

  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineAlert = cwEngineAlert;

}(cwAPI, jQuery));