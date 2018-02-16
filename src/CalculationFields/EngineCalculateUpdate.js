/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/
(function(cwApi) {
  "use strict";

  var cwEngine, getAllAvailableObjectType, loadConfiguration;

  getAllAvailableObjectType = function(that) {
    var otScriptName, allOts = cwApi.mm.getMetaModel().objectTypes;
    that.availableObjectTypes = {};
    for(otScriptName in allOts){
      if (allOts.hasOwnProperty(otScriptName) && !allOts[otScriptName].properties.hasOwnProperty('allowautomaticdeletion')){
        that.availableObjectTypes[otScriptName] = cwApi.cwLayoutsEngine.cwEngineCalculation.cloneObjectType(allOts[otScriptName]);
      }
    }
  };

  loadConfiguration = function(that, config) {
    var i;
    if(!cwApi.isUndefined(config)){
      // load objects
      that.Node.SelectedObjectType = that.availableObjectTypes[config.CwLightNodeObjectType.ObjectTypeScriptName];
      
      if (that.Node.SelectedObjectType && that.availableObjectTypes.hasOwnProperty(that.Node.SelectedObjectType.scriptName)){
        for(i=0; i<config.CwLightNodeObjectType.Filters.length; i+=1){
          that.Node.Filters.push({ScriptName: config.CwLightNodeObjectType.Filters[i].ScriptName, Operator:config.CwLightNodeObjectType.Filters[i].Operator, Value: config.CwLightNodeObjectType.Filters[i].Value});
        }
        for(i=0; i<config.ValuesToUpdate.length; i+=1){
          that.Node.Values.push({ScriptName: config.ValuesToUpdate[i].ScriptName, Value: config.ValuesToUpdate[i].Value});
        }
      }
    }
  };

  cwEngine = function(config){
    this.Node = {};
    this.Node.SelectedObjectType = {};
    this.Node.Filters = [];
    this.Node.Values = [];

    getAllAvailableObjectType(this);
    loadConfiguration(this, config);
  };

  cwEngine.prototype.GetConfigurationToSave = function(json) {
    var i, f;
    // Important : $type must be 1st attribute
    json.$type = 'CalculationFields.JSON.OperationNodeJsonUpdate, CalculationFields';
    json.CwLightNodeObjectType = {
      ObjectTypeScriptName : this.Node.SelectedObjectType.scriptName,
      Properties : ['id', 'name'],
      Filters : []
    };
    // filters
    for(i=0; i<this.Node.Filters.length; i+=1){
      f = this.Node.Filters[i];
      json.CwLightNodeObjectType.Filters.push({ScriptName: f.ScriptName, Operator: f.Operator, Value: f.Value});
    }
    json.ValuesToUpdate = [];
    for (i = 0; i < this.Node.Values.length; i+=1) {
      json.ValuesToUpdate.push({ScriptName: this.Node.Values[i].ScriptName, Value:this.Node.Values[i].Value});
    }
  };

  cwEngine.prototype.run = function($scope){
    var that = this;
    $scope.getPropertyDataType = function(ptScriptName){
      if (cwApi.isUndefined(that.Node.SelectedObjectType)){
        return '';
      }
      var p = cwApi.mm.getProperty(that.Node.SelectedObjectType.scriptName, ptScriptName);
      if (cwApi.isUndefined(p)){
        return '';
      }
      switch(p.type){
        case 'Boolean':
          return 'checkbox';
        /*case 'Date':
          return 'date';*/
        case 'Integer':
        case 'Double':
          return 'number';
        case 'Lookup':
          return 'lookup';
        default:
          return 'text';
      }
    };

    $scope.addFilter = function(evt){
      evt.preventDefault();
      that.Node.Filters.push({});
    };

    $scope.removeFilter = function(evt, index){
      evt.preventDefault();
      that.Node.Filters.splice(index, 1);
    };

    $scope.resetFilter = function(filter){
      filter.Operator = '';
      filter.Value = '';
    };

    $scope.addValue = function(evt){
      evt.preventDefault();
      that.Node.Values.push({});
    };

    $scope.removeValue = function(evt, index){
      evt.preventDefault();
      that.Node.Values.splice(index, 1);
    };

    $scope.resetValue = function(value){
      value.Value = '';
    };

  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineCalculation_CalculateUpdate = cwEngine;

}(cwAPI));