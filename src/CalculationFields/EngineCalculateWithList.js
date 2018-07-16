/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/
(function(cwApi) {
	"use strict";

	var cwEngine, getAllAvailableObjectType, loadConfiguration;

	getAllAvailableObjectType = function(that) {
		var otScriptName, allOts = cwApi.mm.getMetaModel().objectTypes;
		that.availableObjectTypes = {};
		for (otScriptName in allOts) {
			if (allOts.hasOwnProperty(otScriptName) && !allOts[otScriptName].properties.hasOwnProperty('allowautomaticdeletion')) {
				that.availableObjectTypes[otScriptName] = cwApi.cwLayoutsEngine.cwEngineCalculation.cloneObjectType(allOts[otScriptName]);
			}
		}
	};

	loadConfiguration = function(that, config) {
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
					that.Node.Filters.push({
						ScriptName: f.ScriptName,
						Operator: f.Operator,
						Value: f.Value
					});
				}
				// result
				if (that.Node.SelectedObjectType.properties.hasOwnProperty(config.ResultPropertyScriptName)) {
					that.Node.ResultProperty = that.Node.SelectedObjectType.properties[config.ResultPropertyScriptName];
				}
				// association node
				for (i = 0; i < that.Node.SelectedObjectType.AssociationTypes.length; i += 1) {
					if (that.Node.SelectedObjectType.AssociationTypes[i].ScriptName.toLowerCase() === config.CwLightNodeObjectType.AssociationTypeNodes[0].AssociationTypeScriptName.toLowerCase()) {
						that.Node.ChildNode.SelectedAssociationType = that.Node.SelectedObjectType.AssociationTypes[i];
					}
				}
				that.Node.ChildNode.TargetObjectType = that.availableObjectTypes[that.Node.ChildNode.SelectedAssociationType.TargetObjectTypeScriptName.toLowerCase()];
				if (that.Node.ChildNode.TargetObjectType && that.availableObjectTypes.hasOwnProperty(that.Node.ChildNode.TargetObjectType.scriptName)) {
					// filters
					for (i = 0; i < config.CwLightNodeObjectType.AssociationTypeNodes[0].Filters.length; i += 1) {
						f = config.CwLightNodeObjectType.AssociationTypeNodes[0].Filters[i];
						that.Node.ChildNode.Filters.push({
							ScriptName: f.ScriptName,
							Operator: f.Operator,
							Value: f.Value
						});
					}
					// properties
					if (config.Operation !== 'count') {
						if (that.OperandOnIntersection) {
							that.Node.ChildNode.IntersectionNode.ObjectType.OperandPropertyScriptName = config.OperandPropertyScriptName.toLowerCase();
						} else {
							that.Node.ChildNode.TargetObjectType.Operand = that.Node.ChildNode.TargetObjectType.properties[config.OperandPropertyScriptName.toLowerCase()];
						}
					}
				}
			}
		}
	};

	cwEngine = function(config) {
		this.Node = {};
		this.Node.SelectedObjectType = {};
		this.Node.Filters = [];
		this.Node.ChildNode = {};
		this.Node.ChildNode.TargetObjectType = {};
		this.Node.ChildNode.SelectedAssociationType = {};
		this.Node.ChildNode.Filters = [];
		this.Node.ChildNode.IntersectionNode = {};
		this.Node.ChildNode.IntersectionNode.Filters = [];
		this.Node.ChildNode.IntersectionNode.ObjectType = {};
		this.OperandOnIntersection = false;
		getAllAvailableObjectType(this);
		loadConfiguration(this, config);
	};

	cwEngine.prototype.GetConfigurationToSave = function(json) {
		var f, i, aNode;
		// Important : $type must be 1st attribute
		json.$type = 'CalculationFields.JSON.OperationNodeJsonCalculateWithList, CalculationFields';
		json.CwLightNodeObjectType = {
			ObjectTypeScriptName: this.Node.SelectedObjectType.scriptName,
			Properties: ['id', 'name'],
			Filters: []
		};
		json.Operation = this.Operator;
		json.ResultPropertyScriptName = this.Node.ResultProperty.scriptName;
		json.OperandOnIntersection = this.OperandOnIntersection;
		// filters
		for (i = 0; i < this.Node.Filters.length; i += 1) {
			f = this.Node.Filters[i];
			json.CwLightNodeObjectType.Filters.push({
				ScriptName: f.ScriptName,
				Operator: f.Operator,
				Value: f.Value
			});
		}
		// association node
		aNode = {
			AssociationTypeScriptName: this.Node.ChildNode.SelectedAssociationType.ScriptName,
			Properties: ['id', 'name'],
			Filters: [],
			IntersectionProperties: [],
			IntersectionFilters: []
		};
		// operand
		if (json.Operation !== 'count') {
			if (this.OperandOnIntersection) {
				json.OperandPropertyScriptName = (this.Node.ChildNode.TargetObjectType.Operand) ? this.Node.ChildNode.TargetObjectType.Operand.scriptName.toLowerCase() : 'id';
				aNode.IntersectionProperties.push(json.OperandPropertyScriptName);
			} else {
				json.OperandPropertyScriptName = this.Node.ChildNode.TargetObjectType.Operand.scriptName.toLowerCase();
				aNode.Properties.push(json.OperandPropertyScriptName);
			}
		}

		if (this.Node.ChildNode.Filters) {
			for (i = 0; i < this.Node.ChildNode.Filters.length; i += 1) {
				f = this.Node.ChildNode.Filters[i];
				aNode.Filters.push({
					ScriptName: f.ScriptName,
					Operator: f.Operator,
					Value: f.Value
				});
			}
		}
		if (this.Node.ChildNode.IntersectionNodeFilters) {
			for (i = 0; i < this.Node.ChildNode.IntersectionNodeFilters.length; i += 1) {
				f = this.Node.ChildNode.IntersectionNodeFilters.Filters[i];
				aNode.IntersectionFilters.push({
					ScriptName: f.ScriptName,
					Operator: f.Operator,
					Value: f.Value
				});
			}
		}
		json.CwLightNodeObjectType.AssociationTypeNodes = [aNode];
	};

	cwEngine.prototype.run = function($scope) {
		var that = this;
		$scope.setTargetObjectType = function() {
			var ot = that.availableObjectTypes[that.Node.ChildNode.SelectedAssociationType.TargetObjectTypeScriptName.toLowerCase()];
			if (!cwApi.isUndefined(ot)) {
				that.Node.ChildNode.TargetObjectType = cwApi.cwLayoutsEngine.cwEngineCalculation.cloneObjectType(ot);
			}
		};

	};

	if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
		cwApi.cwLayoutsEngine = {};
	}
	cwApi.cwLayoutsEngine.cwEngineCalculation_CalculateWithList = cwEngine;

}(cwAPI));