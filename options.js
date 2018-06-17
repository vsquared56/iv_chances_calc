/* Global option variables */
var appraisal;
var encountertype;
var minlevel;
var ratemodifier;

function processOptions()
{
	var optAppraisal = document.getElementById("appraisal").value;
	var optEncounterType = document.getElementById("encounter_type").value;
	var optMinLevel = document.getElementById("min_level").value;
	var optTrainerLevel = document.getElementById("trainer_level").value;
	var optRateModifierSelect = document.getElementById("ratemodifierselect").value;
	
	/* Process appraisal selection -- change min_iv_percent to match selected value and disable/enable the text box as needed */
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
	else if(optAppraisal === "bad")
	{
		document.getElementById("min_iv_percent").value = 0;
		document.getElementById("min_iv_percent").disabled = true;
	}
	else if(optAppraisal === "other")
	{
		document.getElementById("min_iv_percent").disabled = false;
	}
	  
	/* Process encounter type selection
	 * 
	 */
	if(optEncounterType === "normal")
	{
		document.getElementById("encounters_to_graph").value = 300;
		document.getElementById("min_level").disabled = false;
		document.getElementById("trainer_level").disabled = false;

		changePokeLvlOption(31,35,"disabled");
		changePokeLvlOption(1,5,"enabled");
		
		document.getElementById("min_level_div").style.display = "block"; //Display the minimum Pokemon level / Trainer level div
		document.getElementById("trainer_level_div").style.display = "block";
	}
	else if(optEncounterType === "boosted")
	{
		document.getElementById("encounters_to_graph").value = 300;
		document.getElementById("min_level").disabled = false;
		document.getElementById("trainer_level").disabled = false;
		
		changePokeLvlOption(31,35,"enabled");
		changePokeLvlOption(1,5,"disabled");
		
		document.getElementById("min_level_div").style.display = "block";
		document.getElementById("trainer_level_div").style.display = "block";
	}
	else if(optEncounterType === "raid")
	{
		document.getElementById("encounters_to_graph").value = 30;
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
	}
	else
	{
		document.getElementById("rate_modifier").disabled = true;
		document.getElementById("rate_modifier").value = optRateModifierSelect;
	}
	
	/* Look for any errors */
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
	
