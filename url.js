function resetUrlOptions()
{
	var path = location.pathname;
	history.replaceState(null, "", path);
}

function setUrlOptions(isGraphDrawn)
{
	getPageOptions();
	
	var path = location.pathname;
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

	var calc = false;
	
	for (var k in opts)
	{
		if (pageopts[k])
		{
			pageopts[k] = opts[k];
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
			console.log("getUrlOptions(): invalid URL option -- " + k);
		}
	}
	
	setPageOptions();
	processEncountersToGraphOption();  //Save the Encounters to Graph option or it'll get reset to default by processOptions()
	processRateModifierOption();
	
	processOptions();
	
	if (calc)
	{
		calculate();
		
	}
}