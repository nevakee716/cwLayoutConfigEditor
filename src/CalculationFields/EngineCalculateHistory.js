/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/
(function (cwApi) {
  "use strict";

  var cwEngine, getAllAvailableObjectType, loadConfiguration;

  getAllAvailableObjectType = function (that) {
    var otScriptName,
      allOts = cwApi.mm.getMetaModel().objectTypes;
    that.availableObjectTypes = {};
    for (otScriptName in allOts) {
      if (allOts.hasOwnProperty(otScriptName) && !allOts[otScriptName].properties.hasOwnProperty("allowautomaticdeletion")) {
        that.availableObjectTypes[otScriptName] = cwApi.cwLayoutsEngine.cwEngineCalculation.cloneObjectType(allOts[otScriptName]);
      }
    }
  };

  loadConfiguration = function (that, config) {
    var i, f;
    if (!cwApi.isUndefined(config)) {
      that.Operator = config.Operation;
      that.OperandOnIntersection = config.OperandOnIntersection;
      // load objects
      that.Node.SelectedObjectType = that.availableObjectTypes[config.CwLightNodeObjectType.ObjectTypeScriptName];

      if (that.Node.SelectedObjectType && that.availableObjectTypes.hasOwnProperty(that.Node.SelectedObjectType.scriptName)) {
        // filters
        for (i = 0; i < config.CwLightNodeObjectType.Filters.length; i += 1) {
          f = config.CwLightNodeObjectType.Filters[i];
          that.Node.Filters.push({ ScriptName: f.ScriptName, Operator: f.Operator, Value: f.Value });
        }
        // result
        if (that.Node.SelectedObjectType.properties.hasOwnProperty(config.ResultPropertyScriptName)) {
          that.Node.ResultProperty = that.Node.SelectedObjectType.properties[config.ResultPropertyScriptName];
        }
        // association node
        for (i = 0; i < that.Node.SelectedObjectType.AssociationTypes.length; i += 1) {
          if (
            that.Node.SelectedObjectType.AssociationTypes[i].ScriptName.toLowerCase() ===
            config.CwLightNodeObjectType.AssociationTypeNodes[0].AssociationTypeScriptName.toLowerCase()
          ) {
            that.Node.ChildNode.SelectedAssociationType = that.Node.SelectedObjectType.AssociationTypes[i];
          }
        }
        that.Node.ChildNode.TargetObjectType =
          that.availableObjectTypes[that.Node.ChildNode.SelectedAssociationType.TargetObjectTypeScriptName.toLowerCase()];

        for (i = 0; i < config.ValuesToUpdate.length; i += 1) {
          that.Node.Values.push({ ScriptName: config.ValuesToUpdate[i].scriptname, TargetScriptName: config.ValuesToUpdate[i].targetscriptname });
        }
      }
    }
  };

  cwEngine = function (config) {
    this.Node = {};
    this.Node.SelectedObjectType = {};
    this.Node.Filters = [];
    this.Node.ChildNode = {};
    this.Node.ChildNode.TargetObjectType = {};
    this.Node.ChildNode.SelectedAssociationType = {};
    this.Node.Values = [];

    getAllAvailableObjectType(this);
    loadConfiguration(this, config);
  };

  cwEngine.prototype.GetConfigurationToSave = function (json) {
    var f, i, aNode;
    // Important : $type must be 1st attribute
    json.$type = "CalculationFields.JSON.OperationNodeJsonCalculateHistory, CalculationFields";
    json.CwLightNodeObjectType = {
      ObjectTypeScriptName: this.Node.SelectedObjectType.scriptName,
      Properties: ["id", "name"],
      Filters: [],
    };

    // filters
    for (i = 0; i < this.Node.Filters.length; i += 1) {
      f = this.Node.Filters[i];
      json.CwLightNodeObjectType.Filters.push({ ScriptName: f.ScriptName, Operator: f.Operator, Value: f.Value });
    }
    // association node
    aNode = {
      AssociationTypeScriptName: this.Node.ChildNode.SelectedAssociationType.ScriptName,
      Properties: ["id", "name"],
      Filters: [],
      IntersectionProperties: [],
      IntersectionFilters: [],
    };

    json.CwLightNodeObjectType.AssociationTypeNodes = [aNode];
    json.ValuesToUpdate = this.Node.Values.map((v) => {
      return { scriptname: v.ScriptName, targetscriptname: v.TargetScriptName };
    });
  };

  cwEngine.prototype.run = function ($scope) {
    var that = this;

    $scope.arrayProp = function () {
      if (!that.Node.SelectedObjectType) return;
      that.Node.SelectedObjectType.propertiesArray = that.Node.SelectedObjectType?.propertiesArray?.concat([
        { name: "_Current Year", scriptName: "@currentYear" },
        { name: "_Current Month", scriptName: "@currentMonth" },
        { name: "_Current Day", scriptName: "@currentDay" },
      ]);
    };

    $scope.arrayProp();
    $scope.setTargetObjectType = function () {
      var ot = that.availableObjectTypes[that.Node.ChildNode.SelectedAssociationType.TargetObjectTypeScriptName.toLowerCase()];
      if (!cwApi.isUndefined(ot)) {
        that.Node.ChildNode.TargetObjectType = cwApi.cwLayoutsEngine.cwEngineCalculation.cloneObjectType(ot);
        that.Node.ChildNode.TargetObjectType.propertiesArray = that.Node.ChildNode.TargetObjectType.properties;
      }
    };

    $scope.addValue = function (evt) {
      evt.preventDefault();
      that.Node.Values.push({});
    };

    $scope.removeValue = function (evt, index) {
      evt.preventDefault();
      that.Node.Values.splice(index, 1);
    };

    $scope.resetValue = function (value) {
      value.Value = "";
    };
  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineCalculation_CalculateHistory = cwEngine;
})(cwAPI);
