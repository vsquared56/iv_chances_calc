/* Global variables
 */
var optEncountersToGraphSavedNonRaid = false;
var optEncountersToGraphSavedRaid = false;
var optCustomMinIvPercentSaved = false;
var optCustomRateModifierSaved = false;
var encountersToGraphDefaultNonRaid;
var	encountersToGraphDefaultRaid;

/* Global page options variables
 * Update these from the html forms with getPageOptions()
 * Update from the URL hash with getUrlOptions()
 * Reset to defaults with resetOptionDefaults()
 */
var pageopts = {};

// Initialize pageopts
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
	
	pageopts = {	appraisal:"best",
					minivpercent:"82.2",
					minattackiv:"any",
					encountertype:"normal",
					minlevel:"any",
					trainerlevel:30,
					ratemodifierselect:"1",
					ratemodifier:"1.000000000",
					ratemodifierinv:1,
					pokemontoget:1,
					chartmode:"single",
					encounterstograph:encountersToGraphDefaultNonRaid
				};
	
}
				
function getPageOptions()
{
	pageopts = {	appraisal:document.getElementById("appraisal").value,
					minivpercent:document.getElementById("min_iv_percent").value,
					minattackiv:document.getElementById("min_attack_iv").value,
					encountertype:document.getElementById("encounter_type").value,
					minlevel:document.getElementById("min_level").value,
					trainerlevel:document.getElementById("trainer_level").value,
					ratemodifierselect:document.getElementById("ratemodifierselect").value,
					ratemodifier:document.getElementById("rate_modifier").value,
					ratemodifierinv:document.getElementById("rate_modifier_inv").value,
					pokemontoget:document.getElementById("pokemon_to_get").value,
					chartmode:document.getElementById("chart_mode").value,
					encounterstograph:document.getElementById("encounters_to_graph").value};

}

function setPageOptions()
{
	var keyToHtmlId = {	appraisal:"appraisal",
						minivpercent:"min_iv_percent",
						minattackiv:"min_attack_iv",
						encountertype:"encounter_type",
						minlevel:"min_level",
						trainerlevel:"trainer_level",
						ratemodifierselect:"ratemodifierselect",
						ratemodifier:"rate_modifier",
						ratemodifierinv:"rate_modifier_inv",
						pokemontoget:"pokemon_to_get",
						chartmode:"chart_mode",
						encounterstograph:"encounters_to_graph"
					};
					
	for (var k in pageopts)
	{
		if (keyToHtmlId[k])
		{
			document.getElementById(keyToHtmlId[k]).value = pageopts[k];
		}
		else
		{
			console.log("setPageOptions(): invalid option key -- " + k);
		}
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
	
	if(pageopts.encountertype === "normal")
	{
		optEncountersToGraphSavedNonRaid = pageopts.encounterstograph;
	}
	else if(pageopts.encountertype === "boosted")
	{
		optEncountersToGraphSavedNonRaid = pageopts.encounterstograph;
	}
	else if(pageopts.encountertype === "raid")
	{
		optEncountersToGraphSavedRaid = pageopts.encounterstograph;
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
	optCustomMinIvPercentSaved = pageopts.minivpercent;
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
	optCustomRateModifierSaved = pageopts.ratemodifier;
	pageopts.ratemodifierinv = (1/parseFloat(pageopts.ratemodifier)).toFixed(4);
	
	validateOptions();
	setPageOptions();
}

/* processRateModifierInvOption()
 * Save the custom value entered into the custom shiny rate (inverse) box
 *
 * Called from onchange at <input id="rate_modifier_inv">
 */

function processRateModifierInvOption()
{
	getPageOptions();
	var decvalue = (1/parseFloat(pageopts.ratemodifierinv)).toFixed(8);
	pageopts.ratemodifier = decvalue;
	optCustomRateModifierSaved = decvalue;
	
	validateOptions();
	setPageOptions();
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
	if(pageopts.appraisal === "best")
	{
		pageopts.minivpercent = 82.2;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageopts.appraisal === "good")
	{
		pageopts.minivpercent = 66.7;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageopts.appraisal === "aboveaverage")
	{
		pageopts.minivpercent = 51.1;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageopts.appraisal === "any")
	{
		pageopts.minivpercent = 0;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(pageopts.appraisal === "other")
	{
		document.getElementById("min_iv_percent").disabled = false;
		if (optCustomMinIvPercentSaved)
		{
			pageopts.minivpercent = optCustomMinIvPercentSaved;
		}
	}
	  
	/* Process encounter type selection
	 * Set the encounters to graph text box to either the default or the saved value for the selected encounter type
	 * Enable or disable the minimum level and trainer level selections
	 * Enable or disable the different Pokemon levels that become available in normal or boosted mode
	 */
	if(pageopts.encountertype === "normal")
	{
		if (optEncountersToGraphSavedNonRaid)
		{
			pageopts.encounterstograph = optEncountersToGraphSavedNonRaid;
		}
		else
		{
			pageopts.encounterstograph = encountersToGraphDefaultNonRaid;
		}
		document.getElementById("opt_minlevel").disabled = false;
		document.getElementById("opt_trainerlevel").disabled = false;

		changePokeLvlOption(31,35,"disabled");
		changePokeLvlOption(1,5,"enabled");
		
		document.getElementById("opt_minlevel").style.display = "block"; //Display the minimum Pokemon level / Trainer level div
		document.getElementById("opt_trainerlevel").style.display = "block";
	}
	else if(pageopts.encountertype === "boosted")
	{
		if (optEncountersToGraphSavedNonRaid)
		{
			pageopts.encounterstograph = optEncountersToGraphSavedNonRaid;
		}
		else
		{
			pageopts.encounterstograph = encountersToGraphDefaultNonRaid;
		}
		document.getElementById("opt_minlevel").disabled = false;
		document.getElementById("opt_trainerlevel").disabled = false;
		
		changePokeLvlOption(31,35,"enabled");
		changePokeLvlOption(1,5,"disabled");
		
		document.getElementById("opt_minlevel").style.display = "block";
		document.getElementById("opt_minlevel").style.display = "block";
	}
	else if(pageopts.encountertype === "raid")
	{
		if (optEncountersToGraphSavedRaid)
		{
			pageopts.encounterstograph = optEncountersToGraphSavedRaid;
		}
		else
		{
			pageopts.encounterstograph = encountersToGraphDefaultRaid;
		}
		document.getElementById("opt_minlevel").disabled = true;
		document.getElementById("opt_minlevel").disabled = true;
		
		document.getElementById("opt_minlevel").style.display = "none";  //Hide the minimum Pokemon level / Trainer level div
		document.getElementById("opt_minlevel").style.display = "none";
	}
	  
	/* Process minimum Pokemon level selection
	 * Disable the trainer level selection if the minimum Pokemon level is set to any.
	 */
	if(pageopts.minlevel === "any")
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
	if (pageopts.ratemodifierselect === "custom")
	{
		document.getElementById("rate_modifier").disabled = false;
		document.getElementById("rate_modifier_inv").disabled = false;
		if (optCustomRateModifierSaved)
		{
			pageopts.ratemodifier = optCustomRateModifierSaved;
			pageopts.ratemodifierinv = (1/optCustomRateModifierSaved).toFixed(4);
		}
	}
	else
	{
		document.getElementById("rate_modifier").disabled = true;
		document.getElementById("rate_modifier_inv").disabled = true;
		pageopts.ratemodifierinv = pageopts.ratemodifierselect;
		pageopts.ratemodifier = (1/parseFloat(pageopts.ratemodifierselect)).toFixed(8);
	}
	
	/* Process Chart Mode select
	 * Enable the autoencounterstographbutton for single and area chart modes
	 */
	if (pageopts.chartmode === "single" || pageopts.chartmode === "area")
	{
		document.getElementById("autoencounterstographbutton").style.visibility = "visible";
	}
	else
	{
		document.getElementById("autoencounterstographbutton").style.visibility = "hidden";
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
	if (!isValid(pageopts.appraisal,["best","good","aboveaverage","any","other"]))
	{
		addError("Invalid Appraisal selection.","opt_minivpercent");
	}
	
	/* Validate Minimum IV Percent box */
	if (isNaN(pageopts.minivpercent))
	{
		addError("Minimum IV Percentage must be a number.","opt_minivpercent");
	}
	else
	{
		pageopts.minivpercent = parseFloat(pageopts.minivpercent);
		
		if (pageopts.minivpercent > 100 || pageopts.minivpercent < 0)
		{
			addError("Minimum IV Percentage must be between 0 and 100.","opt_minivpercent");
		}
	}
	
	/* Validate combination of Minimum IV Percentage and Appraisal */
	if (pageopts.appraisal !== "other")
	{
		if (((pageopts.appraisal === "best") && (pageopts.minivpercent != 82.2)) ||
			((pageopts.appraisal === "good") && (pageopts.minivpercent != 66.7)) ||
			((pageopts.appraisal === "aboveaverage") && (pageopts.minivpercent != 51.1)) ||
			((pageopts.appraisal === "any") && (pageopts.minivpercent != 0)))
		{
			addError("Minimum IV Percent doesn't match Appraisal selection.","opt_minivpercent");
		}
	}
	
	/* Validate Minimum Attack IV */
	if (isNaN(pageopts.minattackiv) && (pageopts.minattackiv !== "any"))
	{
		addError("Invalid Minimum Attack IV selection","opt_minattackiv");
	}
	else if (pageopts.minattackiv !== "any")
	{
		pageopts.minattackiv = parseFloat(pageopts.minattackiv)
		if (!Number.isInteger(pageopts.minattackiv))
		{
			addError("Minimum Attack IV selection must be an integer.","opt_minattackiv");
		}
		if (pageopts.minattackiv > 15 || pageopts.minattackiv < 0)
		{
			addError("Minimum Attack IV selection must be between 0 and 15.","opt_minattackiv");
		}		
	}
	
	/* Validate Encounter Type Selection */
	if (!isValid(pageopts.encountertype,["normal","boosted","raid"]))
	{
		addError("Invalid Encounter Type selection!","opt_encountertype");
	}
	
	/* Validate Minimum Pokemon Level Selection */
	if (isNaN(pageopts.minlevel) && (pageopts.minlevel !== "any"))
	{
		addError("Invalid Pokemon Level selection!","opt_minlevel");
	}
	else if (pageopts.minlevel !== "any")
	{
		pageopts.minlevel = parseFloat(pageopts.minlevel);
		if (!Number.isInteger(pageopts.minlevel))
		{
			addError("Minimum Pokemon Level selection must be an integer.","opt_minlevel");
		}
		if (pageopts.minlevel > 35 || pageopts.minlevel < 1)
		{
			addError("Minimum Pokemon Level selection must be between 1 and 35.","opt_minlevel");
		}	
	}
	
	/* Validate Trainer Level Selection */
	if (isNaN(pageopts.trainerlevel) && (pageopts.trainerlevel !== "any"))
	{
		addError("Invalid Trainer Level selection!","opt_trainerlevel");
	}
	else
	{
		pageopts.trainerlevel = parseFloat(pageopts.trainerlevel);
		if (!Number.isInteger(pageopts.trainerlevel))
		{
			addError("Trainer Level selection must be an integer.","opt_trainerlevel");
		}
		if (pageopts.trainerlevel > 30 || pageopts.trainerlevel < 1)
		{
			addError("Trainer Level selection must be between 1 and 30.","opt_trainerlevel");
		}	
	}
	
	/* Validate combination of trainer level and pokemon level */
	if (pageopts.minlevel !== "any")
	{
		if (pageopts.encountertype === "normal")
		{
			if (pageopts.minlevel > pageopts.trainerlevel)
			{
				addError("Minimum Pokemon level can't be greater than Trainer Level.","opt_minlevel");
			}
			if (pageopts.minlevel > 30)
			{
				addError("Minimum Pokemon level can't be greater than 30 unless weather boosted.","opt_minlevel");
			}
		}
		else if (pageopts.encountertype === "boosted")
		{
			if (pageopts.minlevel > pageopts.trainerlevel + 5)
			{
				addError("Minimum Pokemon level can't be greater than Trainer Level + 5 when weather boosted.","opt_minlevel");
			}
			if (pageopts.minlevel < 6)
			{
				addError("Minimum Pokemon level can't be less than 6 when weather boosted.","opt_minlevel");
			}
		}
	}
	
	/* Validate Additional Probability Modifier selection */
	if (!isValid(pageopts.ratemodifierselect,["1","450","75","45","35","19","24.5","custom"]))
	{
		addError("Invalid Probability Modifier selection.","opt_ratemodifier");
	}
	
	/* Validate Rate Modifier box */
	if (isNaN(pageopts.ratemodifier))
	{
		addError("Rate modifier must be a number.","opt_ratemodifier");
	}
	else
	{
		pageopts.ratemodifier = parseFloat(pageopts.ratemodifier);
		if (pageopts.ratemodifier < 0 || pageopts.ratemodifier > 1)
		{
			addError("Rate modifier must be a decimal between 0 and 1.","opt_ratemodifier");
		}	
	}
	
	/* Validate Rate Modifier Inverse box */
	if (isNaN(pageopts.ratemodifierinv))
	{
		addError("Rate modifier (inverse) must be a number.","opt_ratemodifier");
	}
	else
	{
		pageopts.ratemodifierinv = parseFloat(pageopts.ratemodifierinv);
		if (pageopts.ratemodifierinv <= 0)
		{
			addError("Rate modifier (inverse) must be above 0.","opt_ratemodifier");
		}	
	}
	
	/* Validate combination of Rate Modifier and Rate Modifier Inverse */
	if ((pageopts.ratemodifier > (1.001 / pageopts.ratemodifierinv)) ||
		(pageopts.ratemodifier < (0.999 / pageopts.ratemodifierinv)))
	{
		//The two values need to be inverses of each other, but allow some .1% leeway to account for float rounding
		addError("Rate modifier and inverse do not match.","opt_ratemodifier");
	}
	
	/* Validate Number of Pokemon Needed box */
	if (isNaN(pageopts.pokemontoget))
	{
		addError("Invalid Pokemon Number Needed.","opt_pokemontoget");
	}
	else
	{
		pageopts.pokemontoget = parseFloat(pageopts.pokemontoget);
		if (!Number.isInteger(pageopts.pokemontoget))
		{
			addError("Number of Pokemon needed must be an integer.","opt_pokemontoget");
		}
		if (pageopts.pokemontoget < 1)
		{
			addError("Number of Pokemon needed must be greater than 0.","opt_pokemontoget");
		}
	}
	
	/* Validate Chart Mode Selection */
	if (!isValid(pageopts.chartmode,["single","area","pmf","cdf","normalpdf","normalcdf"]))
	{
		addError("Invalid Chart Mode selection.","opt_chartmode");
	}
	
	/* Validate combination of chart mode and number of Pokemon needed */
	if (pageopts.chartmode === "single")
	{
		if (pageopts.pokemontoget > 16)
		{
			addError("Simple chart only supports  a maximum of 16 Pokemon needed.","opt_pokemontoget");
		}
	}
	if (pageopts.chartmode === "area")
	{
		if (pageopts.pokemontoget > 16)
		{
			addError("Stacked area chart only supports a maximum of 16 Pokemon needed.","opt_pokemontoget");
		}
		else if(pageopts.pokemontoget === 1)
		{
			addError("The stacked area chart must have more than 1 matching Pokemon needed.","opt_pokemontoget");
		}
	}
	
	/* Validate Encounters to graph box */
	if (isNaN(pageopts.encounterstograph))
	{
		addError("Invalid encounters to graph.","opt_encounterstograph");
	}
	else
	{
		pageopts.encounterstograph = parseFloat(pageopts.encounterstograph);
		if (!Number.isInteger(pageopts.encounterstograph))
		{
			addError("Number of encounters to graph must be an integer.","opt_encounterstograph");
		}
		if (pageopts.encounterstograph < 1)
		{
			addError("Number of encounters to graph must be 1 or more.","opt_encounterstograph");
		}
		else if (pageopts.encounterstograph > Number.MAX_SAFE_INTEGER)
		{
			addError("Number of encounters to graph can't be bigger than " + Number.MAX_SAFE_INTEGER + ".","opt_encounterstograph");
		}
		else if (pageopts.encounterstograph < pageopts.pokemontoget)
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
	
