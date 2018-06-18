function setUrlOptions(isGraphDrawn)
{
	var path = location.pathname;
	
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

	var hash = "#";			
	
	var i = 0;
	for (var key in pageopts)
	{
		if (i != 0)
		{
			hash += "&"
		}
		hash += key + "=" + pageopts[key];
		i++;
	}

	if (isGraphDrawn)
	{
		hash += "&calc=true";
	}
	
	state = {id:'iv_chances_calc_state',pageopts:pageopts}
	history.replaceState(state, "", path + hash);
}

function getUrlOptions()
{
	var hash = location.hash.substr(1);
	if (hash)
	{
		var keyval = hash.split('&');
		var key, val;
		
		var opts = {};
		
		for (var i in keyval)
		{
			key = keyval[i].split('=')[0];
			val = keyval[i].split('=')[1];
			
			opts[key] = val;
		}
	}
	
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
			
	var calc = false;
	
	for (var k in opts)
	{
		if (keyToHtmlId[k])
		{
			document.getElementById(keyToHtmlId[k]).value = opts[k];
		}
		else if (k === "calc")
		{
			if (opts["calc"] === "true")
			{
				calc = true;
			}
		}
		else
		{
			//Invalid option -- potentially write an error?
		}
	}
	processEncountersToGraphOption();  //Save the Encounters to Graph option or it'll get reset to default by processOptions()
	processRateModifierOption();
	
	processOptions();
	
	if (calc)
	{
		calculate();
		
	}
}