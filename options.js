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
					ratemodifierselect:1,
					ratemodifier:1,
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
	var optEncountersToGraph = document.getElementById("encounters_to_graph").value;
	var optEncounterType = document.getElementById("encounter_type").value;
	
	if(optEncounterType === "normal")
	{
		optEncountersToGraphSavedNonRaid = optEncountersToGraph;
	}
	else if(optEncounterType === "boosted")
	{
		optEncountersToGraphSavedNonRaid = optEncountersToGraph;
	}
	else if(optEncounterType === "raid")
	{
		optEncountersToGraphSavedRaid = optEncountersToGraph;
	}
}

/* processMinIvPercentOption()
 * Save the custom value entered into the minimum IV text box
 *
 * Called from onchange at <input id="min_iv_percent">
 */
function processMinIvPercentOption()
{
	optCustomMinIvPercentSaved = document.getElementById("min_iv_percent").value;
}

/* processRateModifierOption()
 * Save the custom value entered into the custom shiny rate box
 *
 * Called from onchange at <input id="rate_modifier">
 */
function processRateModifierOption()
{
	optCustomRateModifierSaved = document.getElementById("rate_modifier").value;
	document.getElementById("rate_modifier_inv").value = (1/parseFloat(document.getElementById("rate_modifier").value)).toFixed(2);
}

/* processRateModifierInvOption()
 * Save the custom value entered into the custom shiny rate (inverse) box
 *
 * Called from onchange at <input id="rate_modifier_inv">
 */

function processRateModifierInvOption()
{
	var decvalue = (1/parseFloat(document.getElementById("rate_modifier_inv").value)).toFixed(8);
	document.getElementById("rate_modifier").value = decvalue;
	optCustomRateModifierSaved = decvalue;
}


/* processOptions()
 * Process various selection and input boxes on the pageX
 * Print errors if necessary
 *
 * Called from onchange on all <select> and <input> except for <input id="encounters_to_graph"> and <input id="min_iv_percent">
 */
function processOptions()
{
	var optAppraisal = document.getElementById("appraisal").value;
	var optEncounterType = document.getElementById("encounter_type").value;
	var optMinLevel = document.getElementById("min_level").value;
	var optTrainerLevel = document.getElementById("trainer_level").value;
	var optRateModifierSelect = document.getElementById("ratemodifierselect").value;
	
	/* Process appraisal selection
	 * Change min_iv_percent to match selected value and disable/enable the text box as needed
	 */
	if(optAppraisal === "best")
	{
		document.getElementById("min_iv_percent").value = 82.2;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(optAppraisal === "good")
	{
		document.getElementById("min_iv_percent").value = 66.7;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(optAppraisal === "aboveaverage")
	{
		document.getElementById("min_iv_percent").value = 51.1;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(optAppraisal === "any")
	{
		document.getElementById("min_iv_percent").value = 0;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(optAppraisal === "other")
	{
		document.getElementById("min_iv_percent").disabled = false;
		if (optCustomMinIvPercentSaved)
		{
			document.getElementById("min_iv_percent").value = optCustomMinIvPercentSaved;
		}
	}
	  
	/* Process encounter type selection
	 * Set the encounters to graph text box to either the default or the saved value for the selected encounter type
	 * Enable or disable the minimum level and trainer level selections
	 * Enable or disable the different Pokemon levels that become available in normal or boosted mode
	 */
	if(optEncounterType === "normal")
	{
		if (optEncountersToGraphSavedNonRaid)
		{
			document.getElementById("encounters_to_graph").value = optEncountersToGraphSavedNonRaid;
		}
		else
		{
			document.getElementById("encounters_to_graph").value = encountersToGraphDefaultNonRaid;
		}
		document.getElementById("min_level").disabled = false;
		document.getElementById("trainer_level").disabled = false;

		changePokeLvlOption(31,35,"disabled");
		changePokeLvlOption(1,5,"enabled");
		
		document.getElementById("min_level_div").style.display = "block"; //Display the minimum Pokemon level / Trainer level div
		document.getElementById("trainer_level_div").style.display = "block";
	}
	else if(optEncounterType === "boosted")
	{
		if (optEncountersToGraphSavedNonRaid)
		{
			document.getElementById("encounters_to_graph").value = optEncountersToGraphSavedNonRaid;
		}
		else
		{
			document.getElementById("encounters_to_graph").value = encountersToGraphDefaultNonRaid;
		}
		document.getElementById("min_level").disabled = false;
		document.getElementById("trainer_level").disabled = false;
		
		changePokeLvlOption(31,35,"enabled");
		changePokeLvlOption(1,5,"disabled");
		
		document.getElementById("min_level_div").style.display = "block";
		document.getElementById("trainer_level_div").style.display = "block";
	}
	else if(optEncounterType === "raid")
	{
		if (optEncountersToGraphSavedRaid)
		{
			document.getElementById("encounters_to_graph").value = optEncountersToGraphSavedRaid;
		}
		else
		{
			document.getElementById("encounters_to_graph").value = encountersToGraphDefaultRaid;
		}
		document.getElementById("min_level").disabled = true;
		document.getElementById("trainer_level").disabled = true;
		
		document.getElementById("min_level_div").style.display = "none";  //Hide the minimum Pokemon level / Trainer level div
		document.getElementById("trainer_level_div").style.display = "none";
	}
	  
	/* Process minimum Pokemon level selection
	 * Disable the trainer level selection if the minimum Pokemon level is set to any.
	 */
	if(optMinLevel === "any")
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
	if (optRateModifierSelect === "custom")
	{
		document.getElementById("rate_modifier").disabled = false;
		document.getElementById("rate_modifier_inv").disabled = false;
		if (optCustomRateModifierSaved)
		{
			document.getElementById("rate_modifier").value = optCustomRateModifierSaved;
			document.getElementById("rate_modifier_inv").value = (1/optCustomRateModifierSaved).toFixed(2);
		}
	}
	else
	{
		document.getElementById("rate_modifier").disabled = true;
		document.getElementById("rate_modifier_inv").disabled = true;
		document.getElementById("rate_modifier").value = optRateModifierSelect;
		document.getElementById("rate_modifier_inv").value = (1/parseFloat(document.getElementById("rate_modifier").value)).toFixed(2);
	}
	
	/* Error processing	*/
	var errortext;
	if (optEncounterType === "normal")
	{
		if (parseInt(optMinLevel) > parseInt(optTrainerLevel))
		{
			errortext = "Minimum Pokemon level can't be greater than Trainer Level!  ";
		}
		if (parseInt(optMinLevel) > 30)
		{
			errortext = "Minimum Pokemon level can't be greater than 30 unless weather boosted!  ";
		}
	}
	else if (optEncounterType === "boosted")
	{
		if (parseInt(optMinLevel) > (parseInt(optTrainerLevel) + 5))
		{
			errortext = "Minimum Pokemon level can't be greater than Trainer Level + 5 when weather boosted!  ";
		}
		if (parseInt(optMinLevel) < 6)
		{
			errortext = "Minimum Pokemon level can't be less than 6 when weather boosted!  ";
		}
	}
	
	// Display any error text
	if (errortext)
	{
			document.getElementById("error").innerHTML = "<div class='errortext'>" + errortext + "</div>";
			document.getElementById("b1").disabled = true;
	}
	else
	{
			document.getElementById("error").innerHTML = "";
			document.getElementById("b1").disabled = false;
	}
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
	
