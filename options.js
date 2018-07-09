/* Global variables
 */
var optEncountersToGraphSavedNonRaid = false;
var optEncountersToGraphSavedRaid = false;
var optCustomMinIvPercentSaved = false;
var optCustomRateModifierSaved = false;
var encountersToGraphDefaultNonRaid;
var	encountersToGraphDefaultRaid;

/* PageOption objects
 * 
 * PageOptionBool, PageOptionFloat, PageOptionFloatOrAny, PageOptionInt, PageOptionIntOrAny, and PageOptionString
 * all inherit from the base PageOption.  Each object provides a value property that can be set by .setValue(),
 * written to the page with .writeToPage(), or read from the page with .getFromPage().  The previous value held
 * is saved in the previousValue property.
 *
 * The pageElement is the html id of the input on the page, and must be one of 'select', 'textbox', or 'checkbox'.
 * The pageContainerElement is the html id of the container div for the input.
 *
 * PageOption itself should not be used directly.
 */
 
//Base PageOption prototype
function PageOption(name,optionType,pageElement,pageElementType,pageContainerElement)
{
	this.name = name;
	
	if (optionType === "bool" || optionType === "int" || optionType === "float" || optionType === "string")
	{
		this.optionType = optionType;
	}
	else
	{
		throw new TypeError("PageOption constructor -- Invalid optionType: " + optionType);
	}

	this.pageElement = pageElement;
	
	if (pageElementType === "select" || pageElementType === "textbox" || pageElementType === "checkbox")
	{
		this.pageElementType = pageElementType;
	}
	else
	{
		throw new TypeError("PageOption constructor -- Invalid pageElementType: " + pageElementType);
	}
	
	this.pageContainerElement = pageContainerElement;
}
PageOption.prototype.setValue = function(v)
{
	this.previousValue = this.value;
	this.value = v;
}
PageOption.prototype.writeToPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		document.getElementById(this.pageElement).value = this.value;
	}
	else if (this.pageElementType === "checkbox")
	{
		if (this.optionType === "bool")
		{
			document.getElementById(this.pageElement).checked = this.value;
		}
		else
		{
			throw new TypeError("PageOption writeToPage -- trying to write invalid optionType " + this.optionType + " to checkbox.");
		}
	}
}

//PageOptionString prototype -- inherits from PageOption
function PageOptionString(name,pageElement,pageElementType,pageContainerElement,defaultVal,validVals)
{
	PageOption.call(this,name,"string",pageElement,pageElementType,pageContainerElement);
	
	if (Array.isArray(validVals))
	{
		this.validVals = validVals;
	}
	else
	{
		throw new TypeError("PageOptionString constructor -- validVals must be an array.");
	}
	
	if (validVals.includes(defaultVal))
	{
		this.defaultVal = defaultVal;
		this.value = defaultVal;
	}
	else
	{
		throw new RangeError("PageOptionString constructor -- invalid defaultVal.");
	}
}
PageOptionString.prototype = Object.create(PageOption.prototype);
PageOptionString.prototype.setValue = function(v)
{
	if (this.validVals.includes(v))
	{
		this.previousValue = this.value;
		this.value = v.toString();
	}
	else
	{
		throw new RangeError(this.name + " has an invalid value: " + v + ".");
	}
}
PageOptionString.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		this.setValue(document.getElementById(this.pageElement).value);
	}
	else if (this.pageElementType === "checkbox")
	{
		this.setValue(document.getElementById(this.pageElement).checked);
	}
}

//PageOptionBool prototype -- inherits from PageObject
function PageOptionBool(name,pageElement,pageElementType,defaultVal)
{
	PageOption.call(this,name,"bool",pageElement,pageElementType);
	
	this.defaultVal = Boolean(defaultVal);
	this.value = Boolean(defaultVal);
}
PageOptionBool.prototype = Object.create(PageOption.prototype);
PageOptionBool.prototype.setValue = function(v)
{
	this.previousValue = this.value;
	this.value = Boolean(v);
}
PageOptionBool.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		this.setValue(document.getElementById(this.pageElement).value === 'true');
	}
	else if (this.pageElementType === "checkbox")
	{
		this.setValue(document.getElementById(this.pageElement).checked);
	}
}

//PageOptionFloat prototype -- inherits from PageOption
function PageOptionFloat(name,pageElement,pageElementType,pageContainerElement,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	PageOption.call(this,name,"float",pageElement,pageElementType,pageContainerElement);
	
	if (Number.isFinite(defaultVal))
	{
		this.defaultVal = defaultVal;
		this.value = defaultVal;
	}
	else
	{
		throw new TypeError("PageOptionFloat constructor -- invalid defaultVal.");
	}
	
	if (validMinType === "nomin" || validMinType === "inclusivemin" || validMinType === "exclusivemin")
	{
		this.validMinType = validMinType;
	}
	else
	{
		throw new TypeError("PageOptionFloat constructor -- invalid validMinType.");
	}
	
	if (Number.isFinite(validMin))
	{
		this.validMin = validMin;
	}
	else
	{
		throw new TypeError("PageOptionFloat constructor -- invalid validMin.");
	}
	
	if (validMaxType === "nomax" || validMaxType === "inclusivemax" || validMaxType === "exclusivemax")
	{
		this.validMaxType = validMaxType;
	}
	else
	{
		throw new TypeError("PageOptionFloat constructor -- invalid validMaxType.");
	}
	
	if (Number.isFinite(validMax))
	{
		this.validMax = validMax;
	}
	else
	{
		throw new TypeError("PageOptionFloat constructor -- invalid validMax.");
	}
}
PageOptionFloat.prototype = Object.create(PageOption.prototype);
PageOptionFloat.prototype.setValue = function(v)
{
	if (isNaN(v))
	{
		throw new TypeError(this.name + " must be a number.");
	}
	else
	{
		v = parseFloat(v);
	}
	
	if (!Number.isFinite(v))
	{
		throw new TypeError(this.name + " is not an valid number.");
	}
	else
	{
		if ((this.validMinType === "inclusivemin") && (v < this.validMin))
		{
			throw new RangeError(this.name + " must be at least " + this.validMin + ".");
		}
		else if ((this.validMinType === "exclusivemin") && (v <= this.validMin))
		{
			throw new RangeError(this.name + " must be greater than " + this.validMin + ".");
		}
		else if ((this.validMaxType === "inclusivemax") && (v > this.validMax))
		{
			throw new RangeError(this.name + " can't be greater than " + this.validMax + ".");
		}
		else if ((this.validMaxType === "exclusivemax") && (v >= this.validMax))
		{
			throw new RangeError(this.name + "must be less than " + this.validMax + ".");
		}
		else
		{
			this.previousValue = this.value;
			this.value = v;
		}
	}
}
PageOptionFloat.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		this.setValue(document.getElementById(this.pageElement).value);
	}
	else if (this.pageElementType === "checkbox")
	{
		throw new TypeError("PageOptionFloat getFromPage -- Can't get float from checkbox on page");
	}
}

//PageOptionFloatOrAny prototype -- inherits from PageOptionFloat
function PageOptionFloatOrAny(name,pageElement,pageElementType,pageContainerElement,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	if (defaultVal === "any")
	{
		PageOptionFloat.call(this,name,pageElement,pageElementType,pageContainerElement,0,validMinType,validMin,validMaxType,validMax);
		this.defaultVal = "any";
		this.value = "any";
	}
	else
	{
		PageOptionFloat.call(this,name,pageElement,pageElementType,pageContainerElement,defaultVal,validMinType,validMin,validMaxType,validMax);
	}
}
PageOptionFloatOrAny.prototype = Object.create(PageOptionFloat.prototype);
PageOptionFloatOrAny.prototype.setValue = function(v)
{
	if (v === "any")
	{
		this.previousValue = this.value;
		this.value = "any";
	}
	else
	{
		PageOptionFloat.prototype.setValue.call(this, v);
	}

}
PageOptionFloatOrAny.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		if (document.getElementById(this.pageElement).value === 'any')
		{
			this.setValue('any');
		}
		else
		{
			this.setValue(document.getElementById(this.pageElement).value);
		}
	}
	else if (this.pageElementType === "checkbox")
	{
		throw new TypeError("PageOptionFloat getFromPage -- Can't get float from checkbox on page");
	}
}

//PageOptionInt prototype -- inherits from PageOption
function PageOptionInt(name,pageElement,pageElementType,pageContainerElement,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	PageOption.call(this,name,"int",pageElement,pageElementType,pageContainerElement);
	
	if (Number.isInteger(defaultVal))
	{
		this.defaultVal = defaultVal;
		this.value = defaultVal;
	}
	else
	{
		throw new TypeError("PageOptionInt constructor -- invalid defaultVal.");
	}
	
	if (validMinType === "nomin" || validMinType === "inclusivemin" || validMinType === "exclusivemin")
	{
		this.validMinType = validMinType;
	}
	else
	{
		throw new TypeError("PageOptionInt constructor -- invalid validMinType.");
	}
	
	if (Number.isInteger(validMin))
	{
		this.validMin = validMin;
	}
	else
	{
		throw new TypeError("PageOptionInt constructor -- invalid validMin.");
	}
	
	if (validMaxType === "nomax" || validMaxType === "inclusivemax" || validMaxType === "exclusivemax")
	{
		this.validMaxType = validMaxType;
	}
	else
	{
		throw new TypeError("PageOptionInt constructor -- invalid validMaxType.");
	}
	
	if (Number.isInteger(validMax))
	{
		this.validMax = validMax;
	}
	else
	{
		throw new TypeError("PageOptionInt constructor -- invalid validMax.");
	}
}
PageOptionInt.prototype = Object.create(PageOption.prototype);
PageOptionInt.prototype.setValue = function (v)
{
	if (isNaN(v))
	{
		throw new TypeError(this.name + " is not a valid integer.");
	}
	else
	{
		v = parseFloat(v);
	}
	
	if (!Number.isInteger(v))
	{
		throw new TypeError(this.name + " must be an integer.");
	}
	else
	{
		if ((this.validMinType === "inclusivemin") && (v < this.validMin))
		{
			throw new RangeError(this.name + " must be at least " + this.validMin + ".");
		}
		else if ((this.validMinType === "exclusivemin") && (v <= this.validMin))
		{
			throw new RangeError(this.name + " must be greater than " + this.validMin + ".");
		}
		else if ((this.validMaxType === "inclusivemax") && (v > this.validMax))
		{
			throw new RangeError(this.name + " can't be greater than " + this.validMax + ".");
		}
		else if ((this.validMaxType === "exclusivemax") && (v >= this.validMax))
		{
			throw new RangeError(this.name + "must be less than " + this.validMax + ".");
		}
		else
		{
			this.previousValue = this.value;
			this.value = v;
		}
	}
}
PageOptionInt.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		this.setValue(document.getElementById(this.pageElement).value);
	}
	else if (this.pageElementType === "checkbox")
	{
		throw new TypeError("PageOptionFloat getFromPage -- Can't get int from checkbox on page");
	}
}

//PageOptionIntOrAny prototype -- inherits from PageOptionInt
function PageOptionIntOrAny(name,pageElement,pageElementType,pageContainerElement,defaultVal,validMinType,validMin,validMaxType,validMax)
{
	if (defaultVal === "any")
	{
		PageOptionInt.call(this,name,pageElement,pageElementType,pageContainerElement,0,validMinType,validMin,validMaxType,validMax);
		this.defaultVal = "any";
		this.value = "any";
	}
	else
	{
		PageOptionFloat.call(this,name,pageElement,pageElementType,pageContainerElement,defaultVal,validMinType,validMin,validMaxType,validMax);
	}
}
PageOptionIntOrAny.prototype = Object.create(PageOptionInt.prototype);
PageOptionIntOrAny.prototype.setValue = function(v)
{
	if (v === "any")
	{
		this.previousValue = this.value;
		this.value = "any";
	}
	else
	{
		PageOptionInt.prototype.setValue.call(this, v);
	}
}
PageOptionIntOrAny.prototype.getFromPage = function()
{
	if (this.pageElementType === "select" || this.pageElementType === "textbox")
	{
		if (document.getElementById(this.pageElement).value === 'any')
		{
			this.setValue('any');
		}
		else
		{
			this.setValue(document.getElementById(this.pageElement).value);
		}
	}
	else if (this.pageElementType === "checkbox")
	{
		throw new TypeError("PageOptionFloat getFromPage -- Can't get int from checkbox on page");
	}
}

/* pageOpts global variable -- contains various PageOption objects that can be set */
var pageOpts = {	appraisal: new PageOptionString("Appraisal","appraisal","select","opt_minivpercent","best",["best","good","aboveaverage","any","other"]),
					minivpercent: new PageOptionFloat("Minimum IV Percentage","min_iv_percent","textbox","opt_minivpercent",82.2,"inclusivemin",0,"inclusivemax",100),
					minattackiv: new PageOptionIntOrAny("Minimum Attack IV","min_attack_iv","select","opt_minattackiv","any","inclusivemin",0,"inclusivemax",15),
					mindefenseiv: new PageOptionIntOrAny("Minimum Defense IV","min_defense_iv","select","opt_mindefenseiv","any","inclusivemin",0,"inclusivemax",15),
					minstaminaiv: new PageOptionIntOrAny("Minimum Stamina IV","min_stamina_iv","select","opt_minstaminaiv","any","inclusivemin",0,"inclusivemax",15),
					encountertype: new PageOptionString("Encounter Type","encounter_type","select","opt_encountertype","normal",["normal","raid","boosted"]),
					minlevel: new PageOptionIntOrAny("Minimum Pokemon Level","min_level","select","opt_minlevel","any","inclusivemin",1,"inclusivemax",35),
					trainerlevel: new PageOptionInt("Trainer Level","trainer_level","select","opt_trainerlevel",30,"inclusivemin",1,"inclusivemax",30),
					ratemodifierselect: new PageOptionString("Rate Modifier Selection","ratemodifierselect","select","opt_ratemodifier","1",["1","450","75","60","50","45","35","19","24.5","custom"]), //TODO: Update pageElement
					ratemodifier: new PageOptionFloat("Rate Modifier","rate_modifier","textbox","opt_ratemodifier",1,"exclusivemin",0,"inclusivemax",1),
					ratemodifierinv: new PageOptionFloat("Rate Modifier (inverse)","rate_modifier_inv","textbox","opt_ratemodifier",1,"exclusivemin",0,"nomax",0),
					pokemontoget: new PageOptionInt("Number of Pokemon Needed","pokemon_to_get","textbox","opt_pokemontoget",1,"inclusivemin",1,"nomax",0),
					chartmode: new PageOptionString("Chart Mode","chart_mode","select","opt_chartmode","single",["single","area","pmf","cdf","normalpdf","normalcdf"]),
					encounterstograph: new PageOptionInt("Encounters to Graph","encounters_to_graph","textbox","opt_encounterstograph",200,"inclusivemin",1,"nomax",0), //TODO: Set max
					autoencounterstograph: new PageOptionBool("Auto Encounters to Graph","auto_encounters_to_graph","checkbox","opt_encounterstograph",true)
				};


/* resetOptionDefaults()
 * Reset all pageOpts to their defaults
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

/* getPageOptions()
 * Get all pageOpts from the values on the page form
 */ 
function getPageOptions()
{
	clearErrors();
	var err = 0;
	
	for (var k in pageOpts)
	{
		try
		{
			pageOpts[k].getFromPage();
		}
		catch (e)
		{
			alert(e.message);
			pageOpts[k].setValue(pageOpts[k].previousValue);
			pageOpts[k].writeToPage();
		}
	}
	
	return;
}

/* setPageOptions()
 * Write all pageOpts to the page form
 */
function setPageOptions()
{
	for (var k in pageOpts)
	{
		pageOpts[k].writeToPage();
	}
}

/* processOptions()
 * Process various selection and input boxes on the page
 * Print errors if necessary
 *
 * Called from onchange on all <select> and <input>
 */
function processOptions()
{
	clearErrors();
	
	var pageOptsError = getPageOptions();

	/* Process appraisal selection
	 * Change min_iv_percent to match selected value and disable/enable the text box as needed
	 */
	if(pageOpts.appraisal.value === "best")
	{
		pageOpts.minivpercent.setValue(82.2);
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "good")
	{
		pageOpts.minivpercent.setValue(66.7);
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "aboveaverage")
	{
		pageOpts.minivpercent.setValue(51.1);
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "any")
	{
		pageOpts.minivpercent.setValue(0);
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageOpts.appraisal.value === "other")
	{
		document.getElementById("min_iv_percent").disabled = false;
		
		//If the Minimum IV Percent box was just changed, save the value.
		if (pageOpts.minivpercent.previousValue != pageOpts.minivpercent.value)
		{
			optCustomMinIvPercentSaved = pageOpts.minivpercent.value;
		}
		//Otherwise, restore the saved value.
		else if (optCustomMinIvPercentSaved)
		{
			pageOpts.minivpercent.setValue(optCustomMinIvPercentSaved);
		}
	}
	  
	/* Process encounter type selection
	 * Set the encounters to graph text box to either the default or the saved value for the selected encounter type
	 * Enable or disable the minimum level and trainer level selections
	 * Enable or disable the different Pokemon levels that become available in normal or boosted mode
	 */
	if(pageOpts.encountertype.value === "normal")
	{
		document.getElementById("opt_minlevel").disabled = false;
		document.getElementById("opt_trainerlevel").disabled = false;

		changePokeLvlOption(31,35,"disabled");
		changePokeLvlOption(1,5,"enabled");
		
		document.getElementById("opt_minlevel").style.display = "block"; //Display the minimum Pokemon level / Trainer level div
		document.getElementById("opt_trainerlevel").style.display = "block";
	}
	else if(pageOpts.encountertype.value === "boosted")
	{
		document.getElementById("opt_minlevel").disabled = false;
		document.getElementById("opt_trainerlevel").disabled = false;
		
		changePokeLvlOption(31,35,"enabled");
		changePokeLvlOption(1,5,"disabled");
		
		document.getElementById("opt_minlevel").style.display = "block";
		document.getElementById("opt_minlevel").style.display = "block";
	}
	else if(pageOpts.encountertype.value === "raid")
	{
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
		
		//If the rate modifier box was just changed, save the value and update the inverse.
		if (pageOpts.ratemodifier.previousValue != pageOpts.ratemodifier.value)
		{
			optCustomRateModifierSaved = pageOpts.ratemodifier.value;
			pageOpts.ratemodifierinv.setValue(parseFloat((1/pageOpts.ratemodifier.value).toFixed(4)));
		}
		//If the inverse rate modifier box was just changed, calculate the rate modifier, update it, and save the value.
		else if (pageOpts.ratemodifierinv.previousValue != pageOpts.ratemodifierinv.value)
		{
			pageOpts.ratemodifier.setValue(parseFloat((1/pageOpts.ratemodifierinv.value).toFixed(8)));
			optCustomRateModifierSaved = pageOpts.ratemodifier.value;
		}
		//Otherwise, set both boxes to the saved value.
		else if (optCustomRateModifierSaved)
		{
			pageOpts.ratemodifier.setValue(optCustomRateModifierSaved);
			pageOpts.ratemodifierinv.setValue(parseFloat((1/optCustomRateModifierSaved).toFixed(4)));
		}
	}
	else
	{
		document.getElementById("rate_modifier").disabled = true;
		document.getElementById("rate_modifier_inv").disabled = true;
		pageOpts.ratemodifierinv.setValue(parseFloat(pageOpts.ratemodifierselect.value));
		pageOpts.ratemodifier.setValue(parseFloat((1/pageOpts.ratemodifierselect.value).toFixed(8)));
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
	
	if (!validateOptions()) //Calculate auto encounters and write everything to the page if there were no validation errors
	{
		if ((pageOpts.autoencounterstograph.value === true) && (pageOpts.chartmode.value === "single" || pageOpts.chartmode.value === "area"))
		{
			var autoEncountersToGraphValue = calculateAutoEncountersToGraph(); //Can't do this in a single line like pageOpts.encounterstograph.setValue(calculateAutoEncountersToGraph())
			pageOpts.encounterstograph.setValue(autoEncountersToGraphValue); //...because pageOpts is reset deep within calculateAutoEncountersToGraph().
		}
	
		setPageOptions();
	}
}

/* validateOptions()
 * Validates the values in pageOpts to ensure the combination is valid.
 * Adds any errors and calls processErrors() to print them.
 * 
 * Returns 0 if no errors were found.
 */
function validateOptions(optionsSource)
{
	//clearErrors();
	
	//Checks if value is contained in validvals
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
	
	// Validate combination of Minimum IV Percentage and Appraisal
	if (pageOpts.appraisal.value !== "other")
	{
		if (((pageOpts.appraisal.value === "best") && (pageOpts.minivpercent.value != 82.2)) ||
			((pageOpts.appraisal.value === "good") && (pageOpts.minivpercent.value != 66.7)) ||
			((pageOpts.appraisal.value === "aboveaverage") && (pageOpts.minivpercent.value != 51.1)) ||
			((pageOpts.appraisal.value === "any") && (pageOpts.minivpercent.value != 0)))
		{
			addError("Minimum IV Percent doesn't match Appraisal selection.",pageOpts.appraisal);
		}
	}
	
	// Validate combination of trainer level and pokemon level
	if (pageOpts.minlevel.value !== "any")
	{
		if (pageOpts.encountertype.value === "normal")
		{
			if (pageOpts.minlevel.value > pageOpts.trainerlevel.value)
			{
				addError("Minimum Pokemon level can't be greater than Trainer Level.",pageOpts.minlevel);
			}
			if (pageOpts.minlevel.value > 30)
			{
				addError("Minimum Pokemon level can't be greater than 30 unless weather boosted.",pageOpts.minlevel);
			}
		}
		else if (pageOpts.encountertype.value === "boosted")
		{
			if (pageOpts.minlevel.value > pageOpts.trainerlevel.value + 5)
			{
				addError("Minimum Pokemon level can't be greater than Trainer Level + 5 when weather boosted.",pageOpts.minlevel);
			}
			if (pageOpts.minlevel.value < 6)
			{
				addError("Minimum Pokemon level can't be less than 6 when weather boosted.",pageOpts.minlevel);
			}
		}
	}
	
	// Validate combination of Rate Modifier and Rate Modifier Inverse
	if ((pageOpts.ratemodifier.value > (1.001 / pageOpts.ratemodifierinv.value)) ||
		(pageOpts.ratemodifier.value < (0.999 / pageOpts.ratemodifierinv.value)))
	{
		//The two values need to be inverses of each other, but allow some .1% leeway to account for float rounding
		addError("Rate modifier and inverse do not match.",pageOpts.ratemodifier);
	}
	
	// Validate combination of chart mode and number of Pokemon needed */
	if (pageOpts.chartmode.value === "single")
	{
		if (pageOpts.pokemontoget.value > 16)
		{
			addError("Simple chart only supports  a maximum of 16 Pokemon needed.",pageOpts.pokemontoget);
		}
	}
	else if (pageOpts.chartmode.value === "area")
	{
		if (pageOpts.pokemontoget.value > 16)
		{
			addError("Stacked area chart only supports a maximum of 16 Pokemon needed.",pageOpts.pokemontoget);
		}
		else if(pageOpts.pokemontoget.value === 1)
		{
			addError("The stacked area chart must have more than 1 matching Pokemon needed.",pageOpts.pokemontoget);
		}
	}

	if (pageOpts.encounterstograph.value > Number.MAX_SAFE_INTEGER)
	{
		addError("Number of encounters to graph can't be bigger than " + Number.MAX_SAFE_INTEGER + ".",pageOpts.encounterstograph);
	}
	else if (pageOpts.encounterstograph.value < pageOpts.pokemontoget.value)
	{
		addError("Number of encounters to graph can't be smaller than the number of Pokemon needed.",pageOpts.encounterstograph);
	}

	
	processErrors(optionsSource);
	
	return numErrors;
}

var errorText;
var numErrors = 0;

function addError(err,invalidOption)
{
	errorText += `<li>${err}</li>`;
	
	if (invalidOption)
	{
		document.getElementById(invalidOption.pageContainerElement).className += " invalidoptionentry";
	}
	
	numErrors++;
}

function clearErrors()
{
	errorText = "";
	numErrors = 0;
	
	optionEntryDivs = document.getElementsByClassName("optionentry");
	var i;
	
	for (i=0; i < optionEntryDivs.length; i++)
	{
		optionEntryDivs[i].className = "optionentry";
	}
}

function processErrors(optionsSource)
{
	// Display any error text
	if (numErrors > 0)
	{
			document.getElementById("calcbutton").disabled = true;
			
			
			if (optionsSource == "url")
			{
				document.getElementById("urlerror").style.display = "block";
				document.getElementById("urlerror").innerHTML = "<div class='errortext'><div class='errorheading'>" +
																"You got to this page via a direct URL that tried to preset the options and draw a finished chart for you.<br><br>" +
																"Unfortunately, something went wrong, and the options encoded in the URL were invalid.<br><br>" +
																"Make sure you copied the full URL properly, or contact the person that provided it to you.<br><br>" +
																"The errors were:" +
																"</div><ul>" + errorText + "</ul></div>";
			}
			else
			{
				document.getElementById("optionerror").style.display = "block";
				document.getElementById("optionerror").innerHTML = "<div class='errortext'><div class='errorheading'>Invalid Options:</div><ul>" + errorText + "</ul></div>";
			}
	}
	else
	{
			document.getElementById("optionerror").innerHTML = "";
			document.getElementById("optionerror").style.display = "none";
			document.getElementById("urlerror").innerHTML = "";
			document.getElementById("urlerror").style.display = "none";
			document.getElementById("calcbutton").disabled = false;
			
			clearErrors();
	}
}

/* changePokeLvlOption()
 * Enable or Disable any option elements between the low and high in the Pokemon level selection
 */
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

/* changeTrainerLvlOption()
 * Enable or Disable any option elements between the low and high in the trainer level selection
 */
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
	
