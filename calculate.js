var chart;
var data;

/* Initialize the IV table */
var iv = [];
for (i = 0; i < 16; i++) {
	for (j = 0; j < 16; j++) {
		for (k = 0; k < 16; k++) {
			iv.push({
				atk: i,
				def: j,
				sta: k,
				percent: 100*(i+j+k)/45,
				lowestiv: Math.min(i, j, k)
			});
		}
	}
}

function calculate()
{
	//Save the options for this chart in the URL
	setUrlOptions(true);
	
	// Process input boxes
	var minattack = document.getElementById("min_attack_iv").value;
	if (minattack === "any")
	{
		minattack = 0;
	}
	else
	{
		minattack = parseInt(minattack);
	}
	var minivpercent = document.getElementById("min_iv_percent").value;
	var encountertype = document.getElementById("encounter_type").value;
	var pokemontoget = parseInt(document.getElementById("pokemon_to_get").value);
	var numcatches = parseInt(document.getElementById("encounters_to_graph").value);
	var minlevel = document.getElementById("min_level").value;
	var chartmode = document.getElementById("chart_mode").value;
	
	if (minlevel === "any")
	{
	  minlevel = 0;
	}
	else
	{
	  minlevel = parseInt(minlevel);
	}
	var trainerlevel = parseInt(document.getElementById("trainer_level").value);
	var ratemodifier = parseFloat(document.getElementById("rate_modifier").value);
	
	var miniv = 0;
	if (encountertype === "normal")
	{
	  miniv = 0;
	}
	else if (encountertype === "boosted")
	{
	  miniv = 4;
	}
	else if (encountertype === "raid")
	{
	  miniv = 10;
	}
	

  // Calculate the number of potential matches (and the total possible matches) given the input minattack, minpercent, and miniv.
	var prnumerator = 0;
	var prdenominator = 0;
	var p = 1;
	
	// Loop through the entire iv table, counting the chance any single encounter will fit our criteria
	for (i = 0; i < iv.length; i++)
	{
		// If it matches ATK and IV% criteria, and fits the type of encounter (miniv), we want it.
		if ((iv[i].atk >= minattack) && (iv[i].percent >= minivpercent) && (iv[i].lowestiv >= miniv))
		{
			prnumerator++;
		}
		// Divide by the total number of possible encounters (those matching the encounter type, miniv)
		if (iv[i].lowestiv >= miniv)
		{
			prdenominator++;
		}
	}
	p = (prnumerator / prdenominator);
	
	// Calculate level modifier
	var lvlnumerator, lvldenominator,lvlp;
	lvlnumerator = 1;
	lvldenominator = 1;
	
	//minlvl of 30 means 'any'
	if (minlevel == 0)
	{
	  lvlnumerator = 1;
	  lvldenominator = 1;
	}
	else if (encountertype === "boosted")
	{
	  if (trainerlevel >= minlevel - 5)
	  {
		lvlnumerator = 1;
		if (trainerlevel >= 30)
		{
		  lvldenominator = 30;
		  lvlnumerator = 36 - minlevel;
		}
		else
		{
		  lvldenominator = trainerlevel;
		  lvlnumerator = trainerlevel + 6 - minlevel;
		}
	  }
	  else
	  {
		lvlnumerator = 0;
		lvldenominator = 1;
	  }
	}
	else if (encountertype === "normal")
	{
	  if (trainerlevel >= minlevel)
	  {
		lvlnumerator = 1;
		if (trainerlevel >= 30)
		{
		  lvldenominator = 30;
		  lvlnumerator = 31 - minlevel;
		}
		else
		{
		  lvldenominator = trainerlevel;
		  lvlnumerator = trainerlevel + 1 - minlevel;
		}
	  }
	  else
	  {
		lvlnumerator = 0;
		lvldenominator = 1;
	  }
	}
	
	lvlp = (lvlnumerator/lvldenominator);
	finalp = p*lvlp*ratemodifier;
	
	// Fill the data table, where x is the number of catches/encounters, y is the probability of successfully finding what we're looking for.
	var i,j;
	var prob;
	var datapoints = 1000; //Don't calculate/chart more than 1000 data points.
	var datainterval = Math.ceil(numcatches / datapoints); //
	var datarow;
	
	data = new google.visualization.DataTable();
	
	/* TODO
	// Discard any data drawn previously
	data.removeRows(0,data.getNumberOfRows());
	data.removeColumns(0,data.getNumberOfColumns());
	*/
	
	if (chartmode === "single")
	{
		chart = new google.visualization.LineChart(		//Should we be creating a new one each time?
			document.getElementById('visualization'));
		options.isStacked = false;
		options.legend = { position :'none'};
		options.hAxis = {title:'Number of catches/encounters'};
		options.vAxis = {minValue:0, maxValue:1, format: 'percent'};
		
		data.addColumn('number', 'Encounters');
		data.addColumn('number', 'Probability');
		
		// i is the number of catches/encounters.
		for (i = 0; i <= numcatches; i+= datainterval)
		{
			// binomcdf(k,n,p) gives us the chances of getting k or fewer successes after n trials with p probability.
			// Since we want the chances of getting k or more successes, we do (1-binomcdf(k-1,n,p).
			prob = (1-binomcdf(pokemontoget-1,i,(finalp)));
			data.addRow([i,prob]);
		}
		
		//Set the chart title
		options.title = "Chance of finding at least " + pokemontoget + " ";
		if (ratemodifier != 1)
		{
			options.title += "shiny ";
		}
		options.title += "Pokemon above " + minivpercent + "% IV with min " + minattack + "ATK ";
		if ((minlevel != 0) && (encountertype != "raid"))
		{
			options.title += "with level >" + minlevel + " ";
		}
		options.title += "after x " + encountertype + " catches/encounters";
		
		//Print some debug text
		document.getElementById("debug").innerHTML = 	"Plotting 1-binomcdf(k,n,p) with k=" + (pokemontoget - 1) + ", p = (" + prnumerator +
														"/" + prdenominator + ")*(" + lvlnumerator + "/" + lvldenominator + ")*" + ratemodifier +
														" = (" + p.toFixed(6) + "*" + lvlp.toFixed(6) + "*" + ratemodifier.toFixed(6) + ") = " + finalp.toFixed(8) +
														" for n=" + numcatches;
	}
	else if (chartmode === "area")
	{
		chart = new google.visualization.AreaChart(		//Should we be creating a new one each time?
			document.getElementById('visualization'));
		options.isStacked = true;
		options.legend = { position :'right'};
		options.hAxis = {title:'Number of catches/encounters'};
		options.vAxis = {minValue:0, maxValue:1, format: 'percent'};
		
		data.addColumn('number', 'Encounters');
		
		for (j = pokemontoget; j >= 1; j--)
		{
			data.addColumn('number', 'Probability of ' + j + ' successes');
		}
		
		var prob_prev;
		var datarow;
		// i is the number of catches/encounters.
		for (i = 0; i <= numcatches; i+= datainterval)
		{
			prob_prev = 0;
			datarow = [];
			
			datarow.push(i);
			for (j = pokemontoget; j >= 1; j--)
			{
				prob = (1-binomcdf(j-1,i,(finalp)));
				datarow.push(prob - prob_prev);
				prob_prev = prob;
			}
			
			data.addRow(datarow);
		}
		//Set the chart title
		options.title = "Chance of finding 0 to " + pokemontoget + " ";
		if (ratemodifier != 1)
		{
			options.title += "shiny ";
		}
		options.title += "Pokemon above " + minivpercent + "% IV with min " + minattack + "ATK ";
		if ((minlevel != 0) && (encountertype != "raid"))
		{
			options.title += "with level >" + minlevel + " ";
		}
		options.title += "after x " + encountertype + " catches/encounters";
		
		//Print some debug text
		document.getElementById("debug").innerHTML = 	"Plotting 1-binomcdf(k,n,p) with k=" + (pokemontoget - 1) + ", p = (" + prnumerator +
														"/" + prdenominator + ")*(" + lvlnumerator + "/" + lvldenominator + ")*" + ratemodifier +
														" = (" + p.toFixed(6) + "*" + lvlp.toFixed(6) + "*" + ratemodifier.toFixed(6) + ") = " + finalp.toFixed(8) +
														" for 0<=n<=" + numcatches;
	}
	else if (chartmode === "pmf")
	{
		chart = new google.visualization.ColumnChart(		//Should we be creating a new one each time?
			document.getElementById('visualization'));
		options.legend = { position :'none'};
		options.hAxis = {title:'Number of catches/encounters matching criteria'};
			
		data.addColumn('string', 'Successful Encounters');
		data.addColumn('number', 'Probability');
		data.addColumn({type:'string', role:'style'});
		
		//First find the max number of successful encounters to chart
		var maxencounters = 1;
		while (binomcdf(maxencounters,numcatches,finalp) < 0.999)
		{
			maxencounters++;
		}
		
		var maxprob = 0;
		for (i = 0; i <= maxencounters; i++)
		{
			// binomcdf(k,n,p) gives us the chances of getting k or fewer successes after n trials with p probability.
			// Since we want the chances of getting k or more successes, we do (1-binomcdf(k-1,n,p).
			prob = binompmf(i,numcatches,finalp);
			
			if (i < pokemontoget)
			{
				color = "blue";
			}
			else
			{
				color = "green";
			}
			
			if (prob > maxprob)
			{
				maxprob = prob;
			}
			
			if (i < maxencounters)
			{
				data.addRow([String(i),prob,color]);
			}
			else
			{
				data.addRow([">=" + i,prob,color]);
			}
		}
		
		//Set the chart scale
		options.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:(Math.ceil(maxprob/0.1) * 0.1), format: 'percent'};
		
		//Set the chart title
		options.title = "Chance of finding x ";
		if (ratemodifier != 1)
		{
			options.title += "shiny ";
		}
		options.title += "Pokemon above " + minivpercent + "% IV with min " + minattack + "ATK ";
		if ((minlevel != 0) && (encountertype != "raid"))
		{
			options.title += "with level >" + minlevel + " ";
		}
		options.title += "after " + numcatches + " " + encountertype + " catches/encounters";
		
		//Print some debug text
		document.getElementById("debug").innerHTML = 	"Plotting binompmf(k,n,p) with 0<=k<=" + maxencounters + ", p = (" + prnumerator +
														"/" + prdenominator + ")*(" + lvlnumerator + "/" + lvldenominator + ")*" + ratemodifier +
														" = (" + p.toFixed(6) + "*" + lvlp.toFixed(6) + "*" + ratemodifier.toFixed(6) + ") = " + finalp.toFixed(8) +
														" for n=" + numcatches;
	}

	
	
	//Print the final probability per encounter
	document.getElementById("resultstext").innerHTML =	"On average, " + prnumerator + " of every " + prdenominator +
														" Pokemon (" + (p*100).toFixed(2) + "%) will match the IV criteria...<br>";
	if (minlevel != 0)
	{
		document.getElementById("resultstext").innerHTML += "Also, " + lvlnumerator + "/" + lvldenominator + " (" + (lvlp*100).toFixed(2) +
															"%) of those will match the level requirements...<br>";
	}
														
	if (ratemodifier != 1)
	{
		document.getElementById("resultstext").innerHTML += "Finally, there's a manual rate modifier (shiny rate) of " + ratemodifier.toFixed(4) + "<br>";
	}
	document.getElementById("resultstext").innerHTML += "This gives a total probability of " + (p*lvlp*ratemodifier*100).toFixed(6) + "% per encounter.";
	
	
	//Draw the chart!
	drawChart();
}