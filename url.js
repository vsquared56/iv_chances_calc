function resetUrlOptions()
{
	var path = location.pathname;
	history.replaceState(null, "", path);
}

function getUrlOptionString(isGraphDrawn)
{
	getPageOptions();
	
	var path = location.pathname;
	var hash = "#";			
	
	var i = 0;
	for (var key in pageOpts)
	{
		if (i != 0)
		{
			hash += "&"
		}
		hash += key + "=" + pageOpts[key].value;
		i++;
	}

	if (isGraphDrawn)
	{
		hash += "&calc=true";
	}
	
	return path+hash;
}

function setUrlOptions(isGraphDrawn)
{	
	state = {id:'iv_chances_calc_state',options:pageOpts}
	history.pushState(state, "", getUrlOptionString(isGraphDrawn));
}

function getUrlOptions()
{
	var err = 0;
	var errortext = "";
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
	var optionsSet = 0;
	
	for (var k in opts)
	{
		if (pageOpts[k])
		{
			try
			{
				if (pageOpts[k].optionType === "bool")
				{
					pageOpts[k].setValue(opts[k] === "true");
				}
				else if (pageOpts[k].optionType === "int")
				{
					if (opts[k] === "any")
					{
						pageOpts[k].setValue("any");
					}
					else
					{
						pageOpts[k].setValue(parseFloat(opts[k])); //Parse as a float so we can throw an error if it's not an integer
					}
				}
				else if (pageOpts[k].optionType === "float")
				{
					if (opts[k] === "any")
					{
						pageOpts[k].setValue("any");
					}
					else
					{
						pageOpts[k].setValue(parseFloat(opts[k]));
					}
				}
				else if (pageOpts[k].optionType === "string")
				{
					pageOpts[k].setValue(opts[k].toString());
				}
				
				optionsSet++;
			}
			catch(e)
			{
				err++;
				errortext += "<li>" + e.message + "</li>";
			}
		}
		else if (k === "calc")
		{
			if (opts["calc"] === "true")
			{
				calc = true;
			}
			
			optionsSet++;
		}
		else
		{
			err++;
			errortext += "<li>Invalid option " + k + ".</li>";
		}
	}
	
	if (err)
	{
		validateOptions("url",errortext);
	}
	else if (optionsSet > 0)
	{
		err = validateOptions("url");
		if (!err)
		{
			setPageOptions();
			
			processOptions();
			
			if (calc)
			{
				// Start the loading spinner
				document.getElementById("loadingoverlay").style.display = "flex";
		
				// Set a timeout of 0 to push the calculation into the queue and let the spinner update on the page
				setTimeout(function(){
					calculate();
				}, 1000);
				
			}
		}
		return err;
	}
	else
	{
		return;
	}

}