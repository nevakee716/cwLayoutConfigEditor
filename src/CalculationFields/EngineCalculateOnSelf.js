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
        for(i=0; i<config.OperandPropertyScriptNames.length; i+=1){
          if (that.Node.SelectedObjectType.properties.hasOwnProperty(config.OperandPropertyScriptNames[i])){
            that.Node.SelectedObjectType.properties[config.OperandPropertyScriptNames[i]].isOperand = true;
          }
        }
        for(i=0; i<config.CwLightNodeObjectType.Filters.length; i+=1){
          that.Node.Filters.push({ScriptName: config.CwLightNodeObjectType.Filters[i].ScriptName, Operator:config.CwLightNodeObjectType.Filters[i].Operator, Value: config.CwLightNodeObjectType.Filters[i].Value});
        }
      }
      that.Operator = config.Operation;
      if (that.Node.SelectedObjectType.properties.hasOwnProperty(config.ResultPropertyScriptName)){
        that.Node.ResultProperty = that.Node.SelectedObjectType.properties[config.ResultPropertyScriptName];
      }
    }
  };

  cwEngine = function(config){
    this.Node = {};
    this.Node.SelectedObjectType = {};
    this.Node.Filters = [];
    this.Node.ResultProperty = {};

    getAllAvailableObjectType(this);
    loadConfiguration(this, config);
  };

  cwEngine.prototype.GetConfigurationToSave = function(json) {
    var p, i, f;
    // Important : $type must be 1st attribute
    json.$type = 'CalculationFields.JSON.OperationNodeJsonCalculateOnSelf, CalculationFields';
    json.CwLightNodeObjectType = {
      ObjectTypeScriptName : this.Node.SelectedObjectType.scriptName,
      Properties : ['id', 'name'],
      Filters : []
    };
    json.Operation = this.Operator;
    json.ResultPropertyScriptName = this.Node.ResultProperty.scriptName;
    // operand
    json.OperandPropertyScriptNames = [];
    for (p in this.Node.SelectedObjectType.properties){
      if (this.Node.SelectedObjectType.properties.hasOwnProperty(p)){
        if (this.Node.SelectedObjectType.properties[p].isOperand === true){
          json.OperandPropertyScriptNames.push(this.Node.SelectedObjectType.properties[p].scriptName);
        }
      }
    }
    // filters
    for(i=0; i<this.Node.Filters.length; i+=1){
      f = this.Node.Filters[i];
      json.CwLightNodeObjectType.Filters.push({ScriptName: f.ScriptName, Operator: f.Operator, Value: f.Value});
    }
  };

  cwEngine.prototype.run = function($scope){
    var that = this;
  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineCalculation_CalculateOnSelf = cwEngine;

}(cwAPI));