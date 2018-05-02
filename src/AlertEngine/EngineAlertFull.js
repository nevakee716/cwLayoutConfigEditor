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

 

  cwEngine = function(config){
    this.Node = {};
    this.Node.SelectedObjectType = {};
    this.Node.propertiesToSelect = [];
    this.Node.Filters = [];
    this.Node.ChildNodes = [];

    getAllAvailableObjectType(this);
    this.loadConfiguration(config);
  };

 cwEngine.prototype.loadConfiguration = function(config) {
    var i, f, self = this;
    if(!cwApi.isUndefined(config) && config.node){

      this.what = config.what;
      this.who = config.who;
      this.mail = config.mail;
      this.notification = config.notification;
      this.mailObject = config.mailObject;
      this.notificationObject = config.notificationObject;
      this.workflowID = config.workflowID;
      this.favGetAll  = config.favGetAll;

      this.delay  = config.delay;      
      this.delayValue  = config.delayValue;
      
      // load objects
      this.Node.SelectedObjectType = this.availableObjectTypes[config.node.ObjectTypeScriptName];
      
      if (this.Node.SelectedObjectType && this.availableObjectTypes.hasOwnProperty(this.Node.SelectedObjectType.scriptName)){
        // filters
        for(i=0; i<config.node.Filters.length; i+=1){
          f = config.node.Filters[i];
          this.Node.Filters.push({ScriptName: f.ScriptName, Operator:f.Operator, Value: f.Value});
        }
        // properties to select
        this.Node.propertiesToSelect = {};
        config.node.Properties.forEach(function(p){
          self.Node.propertiesToSelect[p] = true; 
        });
        
        // association node
        config.node.AssociationTypeNodes.forEach(function(aNode) {
          var a = {};
          a.SelectedObjectType = self.availableObjectTypes[aNode.ObjectTypeScriptName];

          self.availableObjectTypes[self.Node.SelectedObjectType.scriptName].AssociationTypes.forEach(function(assoType) {
            if(assoType.ScriptName === aNode.AssociationTypeScriptName) a.SelectedAssociationType = assoType;
          });
          
          a.propertiesToSelect = aNode.Properties;
          a.label = aNode.label;

          // properties to select
          a.propertiesToSelect = {};
          aNode.Properties.forEach(function(p){
            a.propertiesToSelect[p] = true; 
          });

          a.Filters = [];
          // filters
          for(i=0; i<aNode.Filters.length; i+=1){
            f = aNode.Filters[i];
            a.Filters.push({ScriptName: f.ScriptName, Operator:f.Operator, Value: f.Value});
          }

          self.Node.ChildNodes.push(a);
        });
      }
    }
  };


  cwEngine.prototype.getNode = function(node) {
    var result = {},props = [],p,filters = [];

    // properties
    if(node.propertiesToSelect && !node.propertiesToSelect.hasOwnProperty("name")) props.push("name");
    if(node.propertiesToSelect && !node.propertiesToSelect.hasOwnProperty("id")) props.push("id");

    for(p in node.propertiesToSelect) {
      if(node.propertiesToSelect.hasOwnProperty(p) && node.propertiesToSelect[p] === true) {
        props.push(p);
      }
    };

    // filters
    node.Filters.forEach(function(f) {
      filters.push({ScriptName: f.ScriptName, Operator: f.Operator, Value: f.Value});
    });
    result.label = node.label;
    result.ObjectTypeScriptName = node.SelectedObjectType.scriptName;
    result.Filters = [];
    result.Properties = props;
    result.Filters = filters;
    result.IncludeObjectsOnlyIfHasAssociations = false;
    result.Id = node.SelectedObjectType.scriptName;
    if(node.hasOwnProperty("SelectedAssociationType")) {

      result.Id += "_" + node.SelectedAssociationType.ScriptName;
      this.NodeIDtoAssociationLabel[result.Id] = node.label;
      result.AssociationTypeScriptName = node.SelectedAssociationType.ScriptName;
    }
    
    return result;
  };





  cwEngine.prototype.GetConfigurationToSave = function(json) {
    var f, i, aNode,self=this;

    json.node = this.getNode(this.Node);
    this.NodeIDtoAssociationLabel = {};
    json.NodeIDtoAssociationLabel = this.NodeIDtoAssociationLabel;
    // associations nodes
    json.node.AssociationTypeNodes = [];
    this.Node.ChildNodes.forEach(function(node) {
      json.node.AssociationTypeNodes.push(self.getNode(node));
    });

    return json;
  };

  cwEngine.prototype.run = function($scope){
    var that = this;
    $scope.setTargetObjectType = function(ChildNode){
      var ot = that.availableObjectTypes[ChildNode.SelectedAssociationType.TargetObjectTypeScriptName.toLowerCase()];
      if (!cwApi.isUndefined(ot)){
        ChildNode.SelectedObjectType = cwApi.cwLayoutsEngine.cwEngineCalculation.cloneObjectType(ot);
        ChildNode.Filters = [];
        ChildNode.propertiesToSelect = [];
      }
    };

    $scope.getPropertyDataType = function(ot, ptScriptName){
      if (cwApi.isUndefined(ot)){
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

    $scope.addElement = function(evt, elems){
      evt.preventDefault();
      elems.push({});
    };


    $scope.removeElement = function(evt, elems, index){
      evt.preventDefault();
      elems.splice(index, 1);
    };

    $scope.resetFilter = function(filter){
      filter.Operator = '';
      filter.Value = '';
    };
    
    $scope.toggle = function(obj,scriptName){
      var elem = obj[scriptName];
      if(elem === undefined || elem === false) elem = true;
      else elem = false;
      obj[scriptName] = elem;
    };

    $scope.initWorkflowId = function(){
      if(that.workflowID === undefined || that.workflowID === "") that.workflowID = "Workflow ID";
    };

  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineAlert_Alert = cwEngine;

}(cwAPI));