/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery, angular */
(function (cwApi, $) {
  "use strict";

  var cwEngineCalculation = function (object, loader, options) {
    cwApi.extend(this, cwApi.cwLayoutsEngine.cwLayoutConfigEditorEngine, object, loader, options);
  };

  cwEngineCalculation.prototype.getOperationTemplatePath = function () {
    return this.getTemplatePath("CalculationFields", "cwTemplateCalculationFields");
  };

  cwEngineCalculation.prototype.init = function (config, options) {
    var i,
      o,
      c,
      operationsById = {},
      allOperations = [];
    this.layoutOptions = options;
    if (!cwApi.isUndefined(config) && !cwApi.isUndefined(config.Operations)) {
      for (i = 0; i < config.Operations.length; i += 1) {
        c = config.Operations[i];
        o = { Id: c.Id, Label: c.Label, Order: c.Order, Description: c.Description, Type: c.Type };
        o.engine = new cwApi.cwLayoutsEngine["cwEngineCalculation_" + c.Type](c, this.layoutOptions);
        if (i === 0) {
          o.selected = true;
        }
        operationsById[c.Id] = o;
        allOperations.push(o);
      }
    }
    this.OperationsById = operationsById;
    this.Operations = allOperations;
  };

  cwEngineCalculation.prototype.getConfigToSave = function ($scope) {
    var i,
      json,
      o,
      res = [];
    $scope.Operations.sort(function (a, b) {
      return a.Order - b.Order;
    });
    for (i = 0; i < $scope.Operations.length; i += 1) {
      o = $scope.Operations[i];
      if (o.engine) {
        json = {};
        o.engine.GetConfigurationToSave(json);
        json.Id = o.Id;
        json.Label = o.Label;
        json.Order = o.Order;
        json.Description = o.Description;
        json.Type = o.Type;
        res.push(json);
      }
    }
    return {
      $type: "CalculationFields.JSON.CalculationConfiguration, CalculationFields",
      OperationReference: "CalculationFields.Core.CalculationEngine,CalculationFields.dll",
      Operations: res,
    };
  };

  cwEngineCalculation.cloneObjectType = function (ot) {
    var ptScriptName,
      newOt = $.extend(true, {}, ot);
    newOt.propertiesArray = [];
    for (ptScriptName in newOt.properties) {
      if (newOt.properties.hasOwnProperty(ptScriptName)) {
        newOt.propertiesArray.push(newOt.properties[ptScriptName]);
      }
    }
    return newOt;
  };

  cwEngineCalculation.prototype.isContentAvailable = function () {
    if (this.Operations && this.Operations.length > 0) {
      return true;
    }
    return false;
  };

  cwEngineCalculation.prototype.run = function ($scope, config) {
    /*jslint unparam:true*/
    var that = this,
      index = 0;
    $scope.Operations = this.Operations;
    $scope.OperationsById = this.OperationsById;

    for (index = 0; index < this.Operations.length; index += 1) {
      if (!cwApi.isUndefined(this.Operations[index].engine)) {
        this.Operations[index].engine.run($scope);
      }
    }

    $scope.FilterOperators = ["Equal", "NotEqual", "GreaterThan", "LessThan", "GreaterThanEqual", "LessThanEqual", "In"];

    $scope.templateByTypeOfOperation = {
      CalculateOnSelf: that.getTemplatePath("CalculationFields", "Template_CalculateOnSelf"),
      CalculateWithList: that.getTemplatePath("CalculationFields", "Template_CalculateWithList"),
      CalculateWithIndependantList: that.getTemplatePath("CalculationFields", "Template_CalculateWithIndependantList"),
      CalculateUpdate: that.getTemplatePath("CalculationFields", "Template_CalculateUpdate"),
      CalculateHistory: that.getTemplatePath("CalculationFields", "Template_CalculateHistory"),
    };

    $scope.enumOperations = ["sum", "mult", "average", "min", "max", "and", "or", "count", "concat", "diff", "divide"];

    function getRandomId() {
      var id = Math.random().toString().substring(2, 10);
      if ($scope.OperationsById.hasOwnProperty(id)) {
        return getRandomId();
      }
      return id;
    }

    function getNextOrder() {
      if ($scope.Operations.length > 0) {
        $scope.Operations.sort(function (a, b) {
          return a.Order - b.Order;
        });
        return $scope.Operations[$scope.Operations.length - 1].Order + 1;
      }
      return 1;
    }

    $scope.addOperation = function (e) {
      var op;
      e.preventDefault();
      op = {
        Id: getRandomId(),
        Label: $.i18n.prop("ec_NewOperationLabel"),
        Order: getNextOrder(),
      };
      $scope.Operations.push(op);
      $scope.OperationsById[op.Id] = op;
      $scope.displayOperation(op.Id);
    };

    $scope.displayOperation = function (selectedId) {
      var i;
      for (i = 0; i < $scope.Operations.length; i += 1) {
        if (selectedId === $scope.Operations[i].Id) {
          $scope.Operations[i].selected = true;
        } else {
          $scope.Operations[i].selected = false;
        }
      }
    };

    $scope.removeOperation = function (e, selectedId) {
      var i;
      e.preventDefault();
      for (i = 0; i < $scope.Operations.length; i += 1) {
        if (selectedId === $scope.Operations[i].Id) {
          break;
        }
      }
      $scope.Operations.splice(i, 1);
      delete $scope.OperationsById[selectedId];
      if ($scope.Operations.length > 0) {
        if (i === $scope.Operations.length) {
          $scope.displayOperation($scope.Operations[i - 1].Id);
        } else {
          $scope.displayOperation($scope.Operations[i].Id);
        }
      }
    };

    $scope.updateOperationType = function (operation) {
      operation.engine = new cwApi.cwLayoutsEngine["cwEngineCalculation_" + operation.Type](undefined, that.layoutOptions);
      operation.engine.run($scope);
    };

    $scope.getPropertyDataType = function (ot, ptScriptName) {
      if (cwApi.isUndefined(ot.scriptName)) {
        return "";
      }
      var p = cwApi.mm.getProperty(ot.scriptName, ptScriptName);
      if (cwApi.isUndefined(p)) {
        return "";
      }
      switch (p.type) {
        case "Boolean":
          return "checkbox";
        //case 'Integer':
        case "Double":
          return "number";
        case "Lookup":
          return "lookup";
        case "Date":
        //return 'date';
        default:
          return "text";
      }
    };

    $scope.addFilter = function (evt, filters) {
      evt.preventDefault();
      filters.push({});
    };

    $scope.removeFilter = function (evt, index, filters) {
      evt.preventDefault();
      filters.splice(index, 1);
    };

    $scope.resetFilter = function (filter) {
      filter.Operator = "";
      filter.Value = "";
    };

    $scope.setSelectedPropertyOrder = function (evt, arr, item) {
      var selectedItems = arr.filter(function (p) {
        return p.isOperand;
      });
      item.operandOrder = selectedItems.length;
      selectedItems
        .sort(function (a, b) {
          return a.operandOrder - b.operandOrder;
        })
        .map(function (v, i) {
          v.operandOrder = i;
        });
    };

    $scope.setFilterValueInArray = function (evt, index, filter, lu) {
      if (!Array.isArray(filter.Value)) {
        filter.Value = [];
      }
      if (filter.Value.indexOf(lu.id) !== -1) {
        filter.Value.splice(index, 1);
      } else {
        filter.Value.push(lu.id);
      }
    };
  };

  if (cwApi.isUndefined(cwApi.cwLayoutsEngine)) {
    cwApi.cwLayoutsEngine = {};
  }
  cwApi.cwLayoutsEngine.cwEngineCalculation = cwEngineCalculation;
})(cwAPI, jQuery);
