/* Global variables
 */
var optEncountersToGraphSavedNonRaid = false;
var optEncountersToGraphSavedRaid = false;
var optCustomMinIvPercentSaved = false;
var optCustomRateModifierSaved = false;
var encountersToGraphDefaultNonRaid;
var	encountersToGraphDefaultRaid;


function PageOption(name,optionType,pageElement,pageElementType)
{
	this.name = name;
	
	if (optionType === "bool" || optionType === "int" || optionType === "float" || optionType === "string")
	{
		this.optionType = optionType;
	}
	else
	{
		throw("PageOption constructor -- Invalid optionType: " + optionType);
	}

	this.pageElement = pageElement;
	
	if (pageElementType === "select" || pageElementType === "textbox" || pageElementType === "checkbox")
	{
		this.pageElementType = pageElementType;
	}
	else
	{
		throw("PageOption constructor -- Invalid pageElementType: " + pageElementType);
	}
}
PageOption.prototype.setValue = function(v)
{
	this.value = v;
}
PageOption.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		this.value = document.getElementById(this.pageElement).value;
	}
	else if (this.pageElementType === "checkbox")
	{
		this.value = document.getElementById(this.pageElement).checked;
	}
}
PageOption.prototype.writeToPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		document.getElementById(this.pageElement).value = this.value;
	}
	else if (this.pageElementType === "checkbox")
	{
		document.getElementById(this.pageElement).checked = this.value;
	}
}

function PageOptionString(name,pageElement,pageElementType,defaultVal,validVals)
{
	PageOption.call(this,name,"string",pageElement,pageElementType);
	
	if (Array.isArray(validVals))
	{
		this.validVals = validVals;
	}
	else
	{
		throw("PageOptionString constructor -- validVals must be an array.");
	}
	
	if (validVals.includes(defaultVal))
	{
		this.defaultVal = defaultVal;
		this.value = defaultVal;
	}
	else
	{
		throw("PageOptionString constructor -- invalid defaultVal.");
	}
}
PageOptionString.prototype = Object.create(PageOption.prototype);
PageOptionString.prototype.setValue = function(v)
{
	if (this.validVals.includes(v))
	{
		this.value = v;
	}
	else
	{
		throw("PageOptionString.setValue -- invalid value: " + v);
	}
}

function PageOptionBool(name,pageElement,pageElementType,defaultVal)
{
	PageOption.call(this,name,"bool",pageElement,pageElementType);
	
	this.defaultVal = Boolean(defaultVal);
	this.value = Boolean(defaultVal);
}
PageOptionBool.prototype = Object.create(PageOption.prototype);
PageOptionBool.prototype.setValue = function(v)
{
	this.value = Boolean(v);
}

function PageOptionFloat(name,pageElement,pageElementType,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	PageOption.call(this,name,"float",pageElement,pageElementType);
	
	if (Number.isFinite(defaultVal))
	{
		this.defaultVal = defaultVal;
		this.value = defaultVal;
	}
	else
	{
		throw("PageOptionFloat constructor -- invalid defaultVal.");
	}
	
	if (validMinType === "nomin" || validMinType === "inclusivemin" || validMinType === "exclusivemin")
	{
		this.validMinType = validMinType;
	}
	else
	{
		throw("PageOptionFloat constructor -- invalid validMinType.");
	}
	
	if (Number.isFinite(validMin))
	{
		this.validMin = validMin;
	}
	else
	{
		throw("PageOptionFloat constructor -- invalid validMin.");
	}
	
	if (validMaxType === "nomax" || validMaxType === "inclusivemax" || validMaxType === "exclusivemax")
	{
		this.validMaxType = validMaxType;
	}
	else
	{
		throw("PageOptionFloat constructor -- invalid validMaxType.");
	}
	
	if (Number.isFinite(validMax))
	{
		this.validMax = validMax;
	}
	else
	{
		throw("PageOptionFloat constructor -- invalid validMax.");
	}
}
PageOptionFloat.prototype = Object.create(PageOption.prototype);
PageOptionFloat.prototype.setValue = function(v)
{
	if (!Number.isFinite(v))
	{
		throw("PageOptionFloat setValue -- " + this.name + " is not an valid float.");
	}
	else
	{
		if (((this.validMinType === "inclusivemin") && (v < this.validMin)) || ((this.validMinType === "exclusivemin") && (v <= this.validMin)) ||
			((this.validMaxType === "inclusivemax") && (v > this.validMax)) || ((this.validMaxType === "exclusivemax") && (v >= this.validMax)))
		{
			throw("PageOptionFloat setValue -- " + this.name + " value outside of valid range.");
		}
		else
		{
			this.value = v;
		}
	}
}

function PageOptionFloatOrAny(name,pageElement,pageElementType,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	if (defaultVal === "any")
	{
		PageOptionFloat.call(this,name,pageElement,pageElementType,0,validMinType,validMin,validMaxType,validMax);
		this.defaultVal = "any";
		this.value = "any";
	}
	else
	{
		PageOptionFloat.call(this,name,pageElement,pageElementType,defaultVal,validMinType,validMin,validMaxType,validMax);
	}
}
PageOptionFloatOrAny.prototype = Object.create(PageOptionFloat.prototype);
PageOptionFloatOrAny.prototype.setValue = function(v)
{
	if (v === "any")
	{
		this.value = "any";
	}
	else
	{
		PageOptionFloat.prototype.setValue.call(this, v);
	}
}

function PageOptionInt(name,pageElement,pageElementType,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	PageOption.call(this,name,"int",pageElement,pageElementType);
	
	if (Number.isInteger(defaultVal))
	{
		this.defaultVal = defaultVal;
		this.value = defaultVal;
	}
	else
	{
		throw("PageOptionInt constructor -- invalid defaultVal.");
	}
	
	if (validMinType === "nomin" || validMinType === "inclusivemin" || validMinType === "exclusivemin")
	{
		this.validMinType = validMinType;
	}
	else
	{
		throw("PageOptionInt constructor -- invalid validMinType.");
	}
	
	if (Number.isInteger(validMin))
	{
		this.validMin = validMin;
	}
	else
	{
		throw("PageOptionInt constructor -- invalid validMin.");
	}
	
	if (validMaxType === "nomax" || validMaxType === "inclusivemax" || validMaxType === "exclusivemax")
	{
		this.validMaxType = validMaxType;
	}
	else
	{
		throw("PageOptionInt constructor -- invalid validMaxType.");
	}
	
	if (Number.isInteger(validMax))
	{
		this.validMax = validMax;
	}
	else
	{
		throw("PageOptionInt constructor -- invalid validMax.");
	}
}
PageOptionInt.prototype = Object.create(PageOption.prototype);
PageOptionInt.prototype.setValue = function (v)
{
	if (!Number.isInteger(v))
	{
		throw("PageOptionInt setValue -- " + this.name + " is not an valid int.");
	}
	else
	{
		if (((this.validMinType === "inclusivemin") && (v < this.validMin)) || ((this.validMinType === "exclusivemin") && (v <= this.validMin)) ||
			((this.validMaxType === "inclusivemax") && (v > this.validMax)) || ((this.validMaxType === "exclusivemax") && (v >= this.validMax)))
		{
			throw("PageOptionInt setValue -- " + this.name + " value outside of valid range.");
		}
		else
		{
			this.value = v;
		}
	}
}

function PageOptionIntOrAny(name,pageElement,pageElementType,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	if (defaultVal === "any")
	{
		PageOptionInt.call(this,name,pageElement,pageElementType,0,validMinType,validMin,validMaxType,validMax);
		this.defaultVal = "any";
		this.value = "any";
	}
	else
	{
		PageOptionFloat.call(this,name,pageElement,pageElementType,defaultVal,validMinType,validMin,validMaxType,validMax);
	}
	
	
}
PageOptionIntOrAny.prototype = Object.create(PageOptionInt.prototype);
PageOptionIntOrAny.prototype.setValue = function(v)
{
	if (v === "any")
	{
		this.value = "any";
	}
	else
	{
		PageOptionInt.prototype.setValue.call(this, v);
	}
}

var pageOpts = {	appraisal: new PageOptionString("Appraisal","appraisal","select","best",["best","good","aboveaverage","any"]),
					minivpercent: new PageOptionFloat("Minimum IV Percentage","min_iv_percent","textbox",82.2,"inclusivemin",0,"inclusivemax",100),
					minattackiv: new PageOptionIntOrAny("Minimum Attack IV","min_attack_iv","select","any","inclusivemin",0,"inclusivemax",15),
					encountertype: new PageOptionString("Encounter Type","encounter_type","select","normal",["normal","raid","boosted"]),
					minlevel: new PageOptionIntOrAny("Minimum Pokemon Level","min_level","select","any","inclusivemin",1,"inclusivemax",35),
					trainerlevel: new PageOptionInt("Trainer Level","trainer_level","select",30,"inclusivemin",1,"inclusivemax",30),
					ratemodifierselect: new PageOptionString("Rate Modifier Selection","ratemodifierselect","select","1",["1","450","75","45","35","19","24.5","custom"]), //TODO: Update pageElement
					ratemodifier: new PageOptionFloat("Rate Modifier","rate_modifier","textbox",1,"exclusivemin",0,"inclusivemax",1),
					ratemodifierinv: new PageOptionFloat("Rate Modifier Inverse","rate_modifier_inv","textbox",1,"exclusivemin",0,"nomax",0),
					pokemontoget: new PageOptionInt("Pokemon to Get","pokemon_to_get","textbox",1,"inclusivemin",1,"nomax",0),
					chartmode: new PageOptionString("Chart Mode","chart_mode","select","single",["single","area","pmf","cdf","normalpdf","normalcdf"]),
					encounterstograph: new PageOptionInt("Encounters to Graph","encounters_to_graph","textbox",300,"inclusivemin",1,"nomax",0), //TODO: Set max
					autoencounterstograph: new PageOptionBool("Auto Encounters to Graph","auto_encounters_to_graph","checkbox",true)
				};

// Initialize pageOpts
resetOptionDefaults();

/* resetOptionDefaults()
 */
function resetOptionDefaults()
{
	optEncountersToGraphSavedNonRaid = false;
	optEncountersToGraphSavedRaid = false;
	optCustomMinIvPercentSaved = false;
	optCustomRateModifierSaved = false;
	
	encountersToGraphDefaultNonRaid = 300;
	encountersToGraphDefaultRaid = 30;
	
	for (var k in pageOpts)
	{
		pageOpts[k].setValue(pageOpts[k].defaultVal);
	}
}
				
function getPageOptions()
{
	for (var k in pageOpts)
	{
		pageOpts[k].getFromPage();
	}
}

function setPageOptions()
{
	for (var k in pageOpts)
	{
		pageOpts[k].writeToPage();
	}
}

/* processEncountersToGraphOption()
 * Save the state of the Encounters to Graph text box between different Encounter Type modes
 * The value is then recalled in processOptions()
 *
 * Called from onchange at <input id="encounters_to_graph">
 */
function processEncountersToGraphOption()
{
	getPageOptions();
	
	validateOptions();
	
	if(pageOpts.encountertype.value === "normal")
	{
		optEncountersToGraphSavedNonRaid = pageOpts.encounterstograph.value;
	}
	else if(pageOpts.encountertype.value === "boosted")
	{
		optEncountersToGraphSavedNonRaid = pageOpts.encounterstograph.value;
	}
	else if(pageOpts.encountertype.value === "raid")
	{
		optEncountersToGraphSavedRaid = pageOpts.encounterstograph.value;
	}
}

/* processMinIvPercentOption()
 * Save the custom value entered into the minimum IV text box
 *
 * Called from onchange at <input id="min_iv_percent">
 */
function processMinIvPercentOption()
{
	getPageOptions();
	optCustomMinIvPercentSaved = pageOpts.minivpercent.value;
	validateOptions();
}

/* processRateModifierOption()
 * Save the custom value entered into the custom shiny rate box
 *
 * Called from onchange at <input id="rate_modifier">
 */
function processRateModifierOption()
{
	getPageOptions();
	optCustomRateModifierSaved = pageOpts.ratemodifier.value;
	pageOpts.ratemodifierinv.value = (1/parseFloat(pageOpts.ratemodifier.value)).toFixed(4);
	
	validateOptions();
	setPageOptions();
	processOptions();
}

/* processRateModifierInvOption()
 * Save the custom value entered into the custom shiny rate (inverse) box
 *
 * Called from onchange at <input id="rate_modifier_inv">
 */

function processRateModifierInvOption()
{
	getPageOptions();
	var decvalue = (1/parseFloat(pageOpts.ratemodifierinv.value)).toFixed(8);
	pageOpts.ratemodifier.value = decvalue;
	optCustomRateModifierSaved = decvalue;
	
	validateOptions();
	setPageOptions();
	processOptions();
}


/* processOptions()
 * Process various selection and input boxes on the pageX
 * Print errors if necessary
 *
 * Called from onchange on all <select> and <input> except for <input id="encounters_to_graph"> and <input id="min_iv_percent">
 */
function processOptions()
{
	getPageOptions();
	
	/* Process appraisal selection
	 * Change min_iv_percent to match selected value and disable/enable the text box as needed
	 */
	if(pageOpts.appraisal.value === "best")
	{
		pageOpts.minivpercent.value = 82.2;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "good")
	{
		pageOpts.minivpercent.value = 66.7;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "aboveaverage")
	{
		pageOpts.minivpercent.value = 51.1;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "any")
	{
		pageOpts.minivpercent.value = 0;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "other")
	{
		document.getElementById("min_iv_percent").disabled = false;
		if (optCustomMinIvPercentSaved)
		{
			pageOpts.minivpercent.value = optCustomMinIvPercentSaved;
		}
	}
	  
	/* Process encounter type selection
	 * Set the encounters to graph text box to either the default or the saved value for the selected encounter type
	 * Enable or disable the minimum level and trainer level selections
	 * Enable or disable the different Pokemon levels that become available in normal or boosted mode
	 */
	if(pageOpts.encountertype.value === "normal")
	{
		if (optEncountersToGraphSavedNonRaid)
		{
			pageOpts.encounterstograph.value = optEncountersToGraphSavedNonRaid;
		}
		else
		{
			pageOpts.encounterstograph.value = encountersToGraphDefaultNonRaid;
		}
		document.getElementById("opt_minlevel").disabled = false;
		document.getElementById("opt_trainerlevel").disabled = false;

		changePokeLvlOption(31,35,"disabled");
		changePokeLvlOption(1,5,"enabled");
		
		document.getElementById("opt_minlevel").style.display = "block"; //Display the minimum Pokemon level / Trainer level div
		document.getElementById("opt_trainerlevel").style.display = "block";
	}
	else if(pageOpts.encountertype.value === "boosted")
	{
		if (optEncountersToGraphSavedNonRaid)
		{
			pageOpts.encounterstograph.value = optEncountersToGraphSavedNonRaid;
		}
		else
		{
			pageOpts.encounterstograph.value = encountersToGraphDefaultNonRaid;
		}
		document.getElementById("opt_minlevel").disabled = false;
		document.getElementById("opt_trainerlevel").disabled = false;
		
		changePokeLvlOption(31,35,"enabled");
		changePokeLvlOption(1,5,"disabled");
		
		document.getElementById("opt_minlevel").style.display = "block";
		document.getElementById("opt_minlevel").style.display = "block";
	}
	else if(pageOpts.encountertype.value === "raid")
	{
		if (optEncountersToGraphSavedRaid)
		{
			pageOpts.encounterstograph.value = optEncountersToGraphSavedRaid;
		}
		else
		{
			pageOpts.encounterstograph.value = encountersToGraphDefaultRaid;
		}
		document.getElementById("opt_minlevel").disabled = true;
		document.getElementById("opt_minlevel").disabled = true;
		
		document.getElementById("opt_minlevel").style.display = "none";  //Hide the minimum Pokemon level / Trainer level div
		document.getElementById("opt_minlevel").style.display = "none";
	}
	  
	/* Process minimum Pokemon level selection
	 * Disable the trainer level selection if the minimum Pokemon level is set to any.
	 */
	if(pageOpts.minlevel.value === "any")
	{
		document.getElementById("trainer_level").disabled = true;
	}
	else
	{
		document.getElementById("trainer_level").disabled = false;
	}
	 
	/* Process the rate modifier select box
	 * If the rate is set to custom, enable the text box to set a custom rate.
	 * Otherwise, disable the text box and fill it with the selected value.
	 */
	if (pageOpts.ratemodifierselect.value === "custom")
	{
		document.getElementById("rate_modifier").disabled = false;
		document.getElementById("rate_modifier_inv").disabled = false;
		if (optCustomRateModifierSaved)
		{
			pageOpts.ratemodifier.value = optCustomRateModifierSaved;
			pageOpts.ratemodifierinv.value = (1/optCustomRateModifierSaved).toFixed(4);
		}
	}
	else
	{
		document.getElementById("rate_modifier").disabled = true;
		document.getElementById("rate_modifier_inv").disabled = true;
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = (1/parseFloat(pageOpts.ratemodifierselect.value)).toFixed(8);
	}
	
	/* Process Chart Mode select
	 * Enable the autoencounterstograph checkbox for single and area chart modes
	 */
	if (pageOpts.chartmode.value === "single" || pageOpts.chartmode.value === "area")
	{
		document.getElementById("autoencounterstograph").style.display = "inline";
	}
	else
	{
		document.getElementById("autoencounterstograph").style.display = "none";
	}
	
	if ((pageOpts.autoencounterstograph.value === true) && (pageOpts.chartmode.value === "single" || pageOpts.chartmode.value === "area"))
	{
		var autoEncountersToGraphValue = calculateAutoEncountersToGraph(); //Can't do this in a single line like pageOpts.encounterstograph.value = calculateAutoEncountersToGraph()
		pageOpts.encounterstograph.value = autoEncountersToGraphValue; //...because pageOpts is reset deep within calculateAutoEncountersToGraph().
	}
	
	validateOptions();
	setPageOptions();
}

function validateOptions(optionsSource)
{
	var errortext = "";
	var numErrors = 0;
	function addError(err,invalidoptionid)
	{



		errortext += `<li>${err}</li>`;
		markOptionInvalid(invalidoptionid);
		
		numErrors++;
	}
	
	function clearInvalidOptions()
	{
		optionEntryDivs = document.getElementsByClassName("optionentry");
		var i;
		
		for (i=0; i < optionEntryDivs.length; i++)
		{
			optionEntryDivs[i].className = "optionentry";
		}
	}
	
	function processErrors()
	{
		// Display any error text
		if (numErrors > 0)
		{
				
				document.getElementById("calcbutton").disabled = true;
				document.getElementById("error").style.display = "block";
				
				if (optionsSource == "url")
				{
					errortext += document.getElementById("error").innerHTML = "<div class='errortext'><div class='errorheading'>Invalid URL Options:</div><ul>" + errortext + "</ul></div>";
				}
				else
				{
					errortext += document.getElementById("error").innerHTML = "<div class='errortext'><div class='errorheading'>Invalid Options:</div><ul>" + errortext + "</ul></div>";
				}
		}
		else
		{
				document.getElementById("error").innerHTML = "";
				document.getElementById("calcbutton").disabled = false;
				document.getElementById("error").style.display = "none";
				clearInvalidOptions();
		}
	}
	
	function markOptionInvalid(elementid)
	{
		document.getElementById(elementid).className += " invalidoptionentry";
	}
	
	function isValid(value, validvals)
	{
		valid = false;
		for (var i = 0; i < validvals.length; i++)
		{
			if (value === validvals[i])
			{
				valid = true;
			}
		}
		return valid;
	}
	
	//Polyfill https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
	Number.isInteger = Number.isInteger || function(value) {
		return typeof value === 'number' && 
		isFinite(value) && 
		Math.floor(value) === value;
	};
	
	/* Validate appraisal selection */
	if (!isValid(pageOpts.appraisal.value,["best","good","aboveaverage","any","other"]))
	{
		addError("Invalid Appraisal selection.","opt_minivpercent");
	}
	
	/* Validate Minimum IV Percent box */
	if (isNaN(pageOpts.minivpercent.value))
	{
		addError("Minimum IV Percentage must be a number.","opt_minivpercent");
	}
	else
	{
		pageOpts.minivpercent.value = parseFloat(pageOpts.minivpercent.value);
		
		if (pageOpts.minivpercent.value > 100 || pageOpts.minivpercent.value < 0)
		{
			addError("Minimum IV Percentage must be between 0 and 100.","opt_minivpercent");
		}
	}
	
	/* Validate combination of Minimum IV Percentage and Appraisal */
	if (pageOpts.appraisal.value !== "other")
	{
		if (((pageOpts.appraisal.value === "best") && (pageOpts.minivpercent.value != 82.2)) ||
			((pageOpts.appraisal.value === "good") && (pageOpts.minivpercent.value != 66.7)) ||
			((pageOpts.appraisal.value === "aboveaverage") && (pageOpts.minivpercent.value != 51.1)) ||
			((pageOpts.appraisal.value === "any") && (pageOpts.minivpercent.value != 0)))
		{
			addError("Minimum IV Percent doesn't match Appraisal selection.","opt_minivpercent");
		}
	}
	
	/* Validate Minimum Attack IV */
	if (isNaN(pageOpts.minattackiv.value) && (pageOpts.minattackiv.value !== "any"))
	{
		addError("Invalid Minimum Attack IV selection","opt_minattackiv");
	}
	else if (pageOpts.minattackiv.value !== "any")
	{
		pageOpts.minattackiv.value = parseFloat(pageOpts.minattackiv.value)
		if (!Number.isInteger(pageOpts.minattackiv.value))
		{
			addError("Minimum Attack IV selection must be an integer.","opt_minattackiv");
		}
		if (pageOpts.minattackiv.value > 15 || pageOpts.minattackiv.value < 0)
		{
			addError("Minimum Attack IV selection must be between 0 and 15.","opt_minattackiv");
		}		
	}
	
	/* Validate Encounter Type Selection */
	if (!isValid(pageOpts.encountertype.value,["normal","boosted","raid"]))
	{
		addError("Invalid Encounter Type selection!","opt_encountertype");
	}
	
	/* Validate Minimum Pokemon Level Selection */
	if (isNaN(pageOpts.minlevel.value) && (pageOpts.minlevel.value !== "any"))
	{
		addError("Invalid Pokemon Level selection!","opt_minlevel");
	}
	else if (pageOpts.minlevel.value !== "any")
	{
		pageOpts.minlevel.value = parseFloat(pageOpts.minlevel.value);
		if (!Number.isInteger(pageOpts.minlevel.value))
		{
			addError("Minimum Pokemon Level selection must be an integer.","opt_minlevel");
		}
		if (pageOpts.minlevel.value > 35 || pageOpts.minlevel.value < 1)
		{
			addError("Minimum Pokemon Level selection must be between 1 and 35.","opt_minlevel");
		}	
	}
	
	/* Validate Trainer Level Selection */
	if (isNaN(pageOpts.trainerlevel.value) && (pageOpts.trainerlevel.value !== "any"))
	{
		addError("Invalid Trainer Level selection!","opt_trainerlevel");
	}
	else
	{
		pageOpts.trainerlevel.value = parseFloat(pageOpts.trainerlevel.value);
		if (!Number.isInteger(pageOpts.trainerlevel.value))
		{
			addError("Trainer Level selection must be an integer.","opt_trainerlevel");
		}
		if (pageOpts.trainerlevel.value > 30 || pageOpts.trainerlevel.value < 1)
		{
			addError("Trainer Level selection must be between 1 and 30.","opt_trainerlevel");
		}	
	}
	
	/* Validate combination of trainer level and pokemon level */
	if (pageOpts.minlevel.value !== "any")
	{
		if (pageOpts.encountertype.value === "normal")
		{
			if (pageOpts.minlevel.value > pageOpts.trainerlevel.value)
			{
				addError("Minimum Pokemon level can't be greater than Trainer Level.","opt_minlevel");
			}
			if (pageOpts.minlevel.value > 30)
			{
				addError("Minimum Pokemon level can't be greater than 30 unless weather boosted.","opt_minlevel");
			}
		}
		else if (pageOpts.encountertype.value === "boosted")
		{
			if (pageOpts.minlevel.value > pageOpts.trainerlevel.value + 5)
			{
				addError("Minimum Pokemon level can't be greater than Trainer Level + 5 when weather boosted.","opt_minlevel");
			}
			if (pageOpts.minlevel.value < 6)
			{
				addError("Minimum Pokemon level can't be less than 6 when weather boosted.","opt_minlevel");
			}
		}
	}
	
	/* Validate Additional Probability Modifier selection */
	if (!isValid(pageOpts.ratemodifierselect.value,["1","450","75","45","35","19","24.5","custom"]))
	{
		addError("Invalid Probability Modifier selection.","opt_ratemodifier");
	}
	
	/* Validate Rate Modifier box */
	if (isNaN(pageOpts.ratemodifier.value))
	{
		addError("Rate modifier must be a number.","opt_ratemodifier");
	}
	else
	{
		pageOpts.ratemodifier.value = parseFloat(pageOpts.ratemodifier.value);
		if (pageOpts.ratemodifier.value < 0 || pageOpts.ratemodifier.value > 1)
		{
			addError("Rate modifier must be a decimal between 0 and 1.","opt_ratemodifier");
		}	
	}
	
	/* Validate Rate Modifier Inverse box */
	if (isNaN(pageOpts.ratemodifierinv.value))
	{
		addError("Rate modifier (inverse) must be a number.","opt_ratemodifier");
	}
	else
	{
		pageOpts.ratemodifierinv.value = parseFloat(pageOpts.ratemodifierinv.value);
		if (pageOpts.ratemodifierinv.value <= 0)
		{
			addError("Rate modifier (inverse) must be above 0.","opt_ratemodifier");
		}	
	}
	
	/* Validate combination of Rate Modifier and Rate Modifier Inverse */
	if ((pageOpts.ratemodifier.value > (1.001 / pageOpts.ratemodifierinv.value)) ||
		(pageOpts.ratemodifier.value < (0.999 / pageOpts.ratemodifierinv.value)))
	{
		//The two values need to be inverses of each other, but allow some .1% leeway to account for float rounding
		addError("Rate modifier and inverse do not match.","opt_ratemodifier");
	}
	
	/* Validate Number of Pokemon Needed box */
	if (isNaN(pageOpts.pokemontoget.value))
	{
		addError("Invalid Pokemon Number Needed.","opt_pokemontoget");
	}
	else
	{
		pageOpts.pokemontoget.value = parseFloat(pageOpts.pokemontoget.value);
		if (!Number.isInteger(pageOpts.pokemontoget.value))
		{
			addError("Number of Pokemon needed must be an integer.","opt_pokemontoget");
		}
		if (pageOpts.pokemontoget.value < 1)
		{
			addError("Number of Pokemon needed must be greater than 0.","opt_pokemontoget");
		}
	}
	
	/* Validate Chart Mode Selection */
	if (!isValid(pageOpts.chartmode.value,["single","area","pmf","cdf","normalpdf","normalcdf"]))
	{
		addError("Invalid Chart Mode selection.","opt_chartmode");
	}
	
	/* Validate combination of chart mode and number of Pokemon needed */
	if (pageOpts.chartmode.value === "single")
	{
		if (pageOpts.pokemontoget.value > 16)
		{
			addError("Simple chart only supports  a maximum of 16 Pokemon needed.","opt_pokemontoget");
		}
	}
	if (pageOpts.chartmode.value === "area")
	{
		if (pageOpts.pokemontoget.value > 16)
		{
			addError("Stacked area chart only supports a maximum of 16 Pokemon needed.","opt_pokemontoget");
		}
		else if(pageOpts.pokemontoget.value === 1)
		{
			addError("The stacked area chart must have more than 1 matching Pokemon needed.","opt_pokemontoget");
		}
	}
	
	/* Validate Encounters to graph box */
	if (isNaN(pageOpts.encounterstograph.value))
	{
		addError("Invalid encounters to graph.","opt_encounterstograph");
	}
	else
	{
		pageOpts.encounterstograph.value = parseFloat(pageOpts.encounterstograph.value);
		if (!Number.isInteger(pageOpts.encounterstograph.value))
		{
			addError("Number of encounters to graph must be an integer.","opt_encounterstograph");
		}
		if (pageOpts.encounterstograph.value < 1)
		{
			addError("Number of encounters to graph must be 1 or more.","opt_encounterstograph");
		}
		else if (pageOpts.encounterstograph.value > Number.MAX_SAFE_INTEGER)
		{
			addError("Number of encounters to graph can't be bigger than " + Number.MAX_SAFE_INTEGER + ".","opt_encounterstograph");
		}
		else if (pageOpts.encounterstograph.value < pageOpts.pokemontoget.value)
		{
			addError("Number of encounters to graph can't be smaller than the number of Pokemon needed.","opt_encounterstograph");
		}
	}
	
	processErrors();
	
	return numErrors;
}

/* Enable or Disable any option elements between the low and high in the Pokemon level selection */
function changePokeLvlOption(optionnumlow,optionnumhigh,state)
{
  var i,disabled;
  if (state === "disabled")
  {
	disabled = true;
  }
  else if (state === "enabled")
  {
	disabled = false;
  }
  else
  {
	disabled = false;
  }
  for (i = optionnumlow; i <= optionnumhigh; i++)
  {
	document.getElementById("pokelvl" + i).disabled = disabled;
  }
}

/* Enable or Disable any option elements between the low and high in the trainer level selection */
function changeTrainerLvlOption(optionnumlow,optionnumhigh,state)
{
  var i,disabled;
  if (state === "disabled")
  {
	disabled = true;
  }
  else if (state === "enabled")
  {
	disabled = false;
  }
  else
  {
	disabled = false;
  }
  for (i = optionnumlow; i <= optionnumhigh; i++)
  {
	document.getElementById("trainerlvl" + i).disabled = disabled;
  }
}
	
