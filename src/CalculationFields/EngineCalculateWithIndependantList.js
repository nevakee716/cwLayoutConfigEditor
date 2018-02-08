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
    var i, f;
    if(!cwApi.isUndefined(config)){
      that.Operator = config.Operation;
      that.CreateNewItem = config.CreateNew;
      // load objects
      that.Node.SelectedObjectType = that.availableObjectTypes[config.CwLightNodeObjectType.ObjectTypeScriptName];
      
      if (that.Node.SelectedObjectType && that.availableObjectTypes.hasOwnProperty(that.Node.SelectedObjectType.scriptName)){
        // filters
        for(i=0; i<config.CwLightNodeObjectType.Filters.length; i+=1){
          f = config.CwLightNodeObjectType.Filters[i];
          that.Node.Filters.push({ScriptName: f.ScriptName, Operator:f.Operator, Value: f.Value});
        }
        that.Node.SelectedObjectType.Operand = that.Node.SelectedObjectType.properties[config.OperandPropertyScriptName.toLowerCase()];
      }

      that.ResultObjectType = that.availableObjectTypes[config.ResultObjectTypeScriptName];
      if (that.availableObjectTypes.hasOwnProperty(that.ResultObjectType.scriptName)){
        that.ResultObjectType.ResultProperty = that.ResultObjectType.properties[config.ResultPropertyScriptName];
        that.ResultObjectType.IdentifierProperty = that.ResultObjectType.properties[config.IdentifierPropertyScriptName];
        that.ResultObjectType.IdentifierPropertyValue = config.IdentifierPropertyValue;

        that.DefaultValues = config.DefaultValues;
      }
    }
  };

  cwEngine = function(config){
    this.Node = {};
    this.Node.SelectedObjectType = {};
    this.Node.SelectedObjectType.Operand = {};
    this.Node.Filters = [];

    this.ResultObjectType = {};
    this.ResultObjectType.ResultProperty = {};
    this.ResultObjectType.IdentifierProperty = {};
    this.ResultObjectType.IdentifierPropertyValue = null;
    this.CreateNewItem = false;
    this.DefaultValues = {};

    getAllAvailableObjectType(this);
    loadConfiguration(this, config);
  };

  cwEngine.prototype.GetConfigurationToSave = function(json) {
    var f, i;
    // Important : $type must be 1st attribute
    json.$type = 'CalculationFields.JSON.OperationNodeJsonCalculateWithIndependantList, CalculationFields';
    json.CwLightNodeObjectType = {
      ObjectTypeScriptName : this.Node.SelectedObjectType.scriptName,
      Properties : ['id', 'name'],
      Filters : []
    };
    json.Operation = this.Operator;
    json.ResultPropertyScriptName = this.ResultObjectType.ResultProperty.scriptName;

    // filters
    for(i=0; i<this.Node.Filters.length; i+=1){
      f = this.Node.Filters[i];
      json.CwLightNodeObjectType.Filters.push({ScriptName: f.ScriptName, Operator: f.Operator, Value: f.Value});
    }
    
    // operand
    json.OperandPropertyScriptName = this.Node.SelectedObjectType.Operand.scriptName;
    json.ResultObjectTypeScriptName = this.ResultObjectType.scriptName;
    json.CreateNew = this.CreateNewItem;
    if (!cwApi.isUndefined(this.ResultObjectType.IdentifierProperty) && !cwApi.isUndefined(this.ResultObjectType.IdentifierProperty.scriptName)){
      json.IdentifierPropertyScriptName = this.ResultObjectType.IdentifierProperty.scriptName;
      json.IdentifierPropertyValue = this.ResultObjectType.IdentifierPropertyValue;
    }
    json.DefaultValues = this.DefaultValues;  
  };

  cwEngine.prototype.run = function($scope){
    $scope.getPropertyDataType = function(ot, ptScriptName){
      if (cwApi.isUndefined(ot.scriptName)){
        return '';
      }
      var p = cwApi.mm.getProperty(ot.scriptName, ptScriptName);
      if (cwApi.isUndefined(p)){
        return '';
      }
      switch(p.type){
        case 'Boolean':
          return 'checkbox';
        case 'Date':
          return 'date';
        case 'Integer':
        case 'Double':
          return 'number';
        case 'Lookup':
          return 'lookup';
        default:
          return 'text';
      }
    };

    $scope.addFilter = function(evt, filters){
      evt.preventDefault();
      filters.push({});
    };

    $scope.removeFilter = function(evt, index, filters){
      evt.preventDefault();
      filters.splice(index, 1);
    };

    $scope.resetFilter = function(filter){
      filter.Operator = '';
      filter.Value = '';
    };
  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineCalculation_CalculateWithIndependantList = cwEngine;

}(cwAPI));