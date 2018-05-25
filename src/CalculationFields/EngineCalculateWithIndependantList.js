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

        if (config.DefaultValues){
          for(var v in config.DefaultValues){
            if (config.DefaultValues.hasOwnProperty(v)){
              that.NewValues.push({ScriptName: v, Value: config.DefaultValues[v]});
            }
          }
        }
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
    this.NewValues = [];

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
    json.DefaultValues = {};
    for(i=0; i<this.NewValues.length; i+=1){
      json.DefaultValues[this.NewValues[i].ScriptName] = this.NewValues[i].Value;
    }
  };

  cwEngine.prototype.run = function($scope){
    var that = this;
    $scope.resetPropertyIdentifier = function(){
      that.ResultObjectType.IdentifierProperty = {};
      that.ResultObjectType.IdentifierPropertyValue = null;
      if (that.CreateNewItem === false){
        that.NewValues = [];
      }
    };

  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineCalculation_CalculateWithIndependantList = cwEngine;

}(cwAPI));