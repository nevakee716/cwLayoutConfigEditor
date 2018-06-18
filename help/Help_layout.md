# Description
This layout allows you to create configuration for the EvolveOnDemand **[Calculation Operation](https://github.com/JGrndn/ErwinTools---Fr---Documentation/wiki/Operation-Calculation-Engine)**.

# Installation  
[https://github.com/casewise/cpm/wiki](https://github.com/casewise/cpm/wiki)  

# How to set up
## Mapping type
All EvolveOnDemand configurations requires that you set a category for each type of Operation. As there is one single layout for multiple type of Operations, you need to inform the system what layout to use. This can be done automatically by setting the corresponding values in the **cwMappingTypeToEngine.js** file. The following structure is :  
```
var cwConfigurationEditorMapping = {
	"Calculation engine" : "cwEngineCalculation"
};
```  
The key is the configuration category. Make sure you do not modify the value.
## Evolve structure
As layout are dynamically loaded according to the configuration category, you need to create the following structure within Evolve :

<img src="https://github.com/JGrndn/cwLayoutConfigEditor/blob/master/screen/1.JPG" style="width:95%" />  

_Please make sure to select the Category and configuration property in the Edit page._  

Once the configuration is set up, deploy your website (don't forget to deploy themes too !)  

## Result  
Below is a screenshot of what you get once your layout is deployed
<img src="https://github.com/JGrndn/cwLayoutConfigEditor/blob/master/screen/2.JPG" style="width:95%" />  