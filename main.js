google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(init);

function init()
{
	
	//Chart options
	var options = {
		
		//fontSize: 20,
		
		lineWidth: 4,
		
		hAxis: {title: 'Number of catches/encounters' },
		vAxis: {minValue:0, maxValue:1, format: 'percent'}, // This is also reset at the bottom of the button onclick function
		
		animation: {
			duration: 1000,
			easing: 'in'
		},
		
		curveType: 'none',
		legend: { position: 'none' },
		tooltip: { trigger: 'selection' }
	};

	/* Set chart area.
	 * Call this during init.
	 * Don't call during button press to prevent virtual-keyboard size changes on mobile.
	 * Don't call on window resize?
	 */
	var width, height, heightpercent;
	function setChartArea()
	{
		width = window.innerWidth;
		height = window.innerHeight;
		
		if (height > width)
		{
		  height = height/2;
		}
		else
		{
		  height = Math.max((height - 200),(width/2.5));
		}
		
		// Decrease chart area to fit the title if it spans two lines
		
		if (width < 1000)
		{
		  heightpercent = '70%';
		  widthpercent = '80%';
		}
		else
		{
		  heightpercent = '85%';
		  widthpercent = '90%';
		}
		
		options.height = height;
		options.chartArea = {width:widthpercent,height:heightpercent};
	}
	
	/* Window resize handling */
	var timer;
	var chartDrawn = false;
	window.addEventListener('resize', function(){
		clearTimeout(timer);
		timer = setTimeout(function(){
			if (chartDrawn)
			{
				drawChart();
			}
			}, 500);
		});
	
	setChartArea();
	
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
	
	/* Process the encounter type, minimum Pokemon level, and trainer level, and throw errors if needed */
	function findLevelErrors()
	{
	  var errortext;
	  if (document.getElementById("encounter_type").value === "normal")
	  {
		if (parseInt(document.getElementById("min_level").value) > parseInt(document.getElementById("trainer_level").value))
		{
			errortext = "Minimum Pokemon level can't be greater than Trainer Level!  ";
		}
		if (parseInt(document.getElementById("min_level").value) > 30)
		{
			errortext = "Minimum Pokemon level can't be greater than 30 unless weather boosted!  ";
		}
	  }
	  else if (document.getElementById("encounter_type").value === "boosted")
	  {
		if (parseInt(document.getElementById("min_level").value) > (parseInt(document.getElementById("trainer_level").value) + 5))
		{
			errortext = "Minimum Pokemon level can't be greater than Trainer Level + 5 when weather boosted!  ";
		}
		if (parseInt(document.getElementById("min_level").value) < 6)
		{
			errortext = "Minimum Pokemon level can't be less than 6 when weather boosted!  ";
		}
	  }
	  else if (document.getElementById("encounter_type").value === "raid")
	  {
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
	
	/* Appraisal Selection -- onchange
	 * Change the minimum IV box depending on the Appraisal selection
	 */
	document.getElementById("appraisal").onchange = function()
	{
	  if(this.value === "best")
	  {
		document.getElementById("min_iv_percent").value = 82.2;
		document.getElementById("min_iv_percent").disabled = true;
	  }
	  else if(this.value === "good")
	  {
		document.getElementById("min_iv_percent").value = 66.7;
		document.getElementById("min_iv_percent").disabled = true;
	  }
	  else if(this.value === "aboveaverage")
	  {
		document.getElementById("min_iv_percent").value = 51.1;
		document.getElementById("min_iv_percent").disabled = true;
	  }
	  else if(this.value === "bad")
	  {
		document.getElementById("min_iv_percent").value = 0;
		document.getElementById("min_iv_percent").disabled = true;
	  }
	  else if(this.value === "other")
	  {
		document.getElementById("min_iv_percent").disabled = false;
	  }
	  
	  findLevelErrors();
	}
	
	/* Encounter Type Selection -- onchange
	 * Change the encounters to graph depending on the Type of catch selection.  Disable/enable min pokemon levels above 30 or below 6
	 */
	document.getElementById("encounter_type").onchange = function()
	{
	  if(this.value === "normal")
	  {
		document.getElementById("encounters_to_graph").value = 300;
		document.getElementById("min_level").disabled = false;
		document.getElementById("trainer_level").disabled = false;

		changePokeLvlOption(31,35,"disabled");
		changePokeLvlOption(1,5,"enabled");
		
		document.getElementById("min_level_div").style.display = "block"; //Display the minimum Pokemon level / Trainer level div
		document.getElementById("trainer_level_div").style.display = "block";
	  }
	  else if(this.value === "boosted")
	  {
		document.getElementById("encounters_to_graph").value = 300;
		document.getElementById("min_level").disabled = false;
		document.getElementById("trainer_level").disabled = false;
		
		changePokeLvlOption(31,35,"enabled");
		changePokeLvlOption(1,5,"disabled");
		
		document.getElementById("min_level_div").style.display = "block";
		document.getElementById("trainer_level_div").style.display = "block";
	  }
	  else if(this.value === "raid")
	  {
		document.getElementById("encounters_to_graph").value = 30;
		document.getElementById("min_level").disabled = true;
		document.getElementById("trainer_level").disabled = true;
		
		document.getElementById("min_level_div").style.display = "none";  //Hide the minimum Pokemon level / Trainer level div
		document.getElementById("trainer_level_div").style.display = "none";
	  }
	  
	  findLevelErrors();
	}		
	
	/* Minimum Level Selection -- onchange
	 * Enable/disable the trainer level box depending on the minimum Pokemon level.
	 */
	document.getElementById("min_level").onchange = function()
	{
	  if(this.value == 0)
	  {
		document.getElementById("trainer_level").disabled = true;
	  }
	  else
	  {
		document.getElementById("trainer_level").disabled = false;
	  }
	  
	  findLevelErrors();
	}
	
	/* Trainer Level Selection -- onchange
	 * Check for errors
	 */
	document.getElementById("trainer_level").onchange = function()
	{
	  findLevelErrors();
	}
	
	/* Probability Modifier Selection -- onchange
	 * Set the shiny rate box depending on the selection
	 */
	document.getElementById("ratemodifierselect").onchange = function()
	{
	  if (this.value === "custom")
	  {
		document.getElementById("rate_modifier").disabled = false;
	  }
	  else
	  {
		document.getElementById("rate_modifier").disabled = true;
		document.getElementById("rate_modifier").value = this.value;
	  }
	  findLevelErrors();
	}
	
	/* Chart Mode Selection -- onchange
	 */
	document.getElementById("chart_mode").onchange = function()
	{
	  findLevelErrors();
	}
	
	var button = document.getElementById('b1');
	
	/* Process the button click -- calculate probability, populate data table, and draw the chart */
	button.onclick = function() {
	
		// Process input boxes
		var minattack = parseInt(document.getElementById("min_attack_iv").value);
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
		
		if (chartmode === "single")
		{
			chart = new google.visualization.LineChart(		//Should we be creating a new one each time?
				document.getElementById('visualization'));
			options.isStacked = false;
		}
		else if (chartmode === "area")
		{
			chart = new google.visualization.AreaChart(		//Should we be creating a new one each time?
				document.getElementById('visualization'));
			//options.isStacked = true;
		}
		
		data = new google.visualization.DataTable();
		
		// Discard any data drawn previously
		data.removeRows(0,data.getNumberOfRows());
		data.removeColumns(0,data.getNumberOfColumns());
		
		data.addColumn('number', 'Encounters');
		
		if (chartmode === "single")
		{
			
			lastdatacolumn = pokemontoget;
		}
		else if (chartmode === "area")
		{
			lastdatacolumn = 1;
		}
		
		var j;
		for (j = pokemontoget; j >= lastdatacolumn; j--)
		{
			data.addColumn('number', 'Probability of ' + j + ' successes');
		}
		
		// Fill the data table, where x is the number of catches/encounters, y is the probability of successfully finding what we're looking for.
		var i;
		var prob;
		var datapoints = 1000; //Don't calculate/chart more than 1000 data points.
		var datainterval = Math.ceil(numcatches / datapoints);
		var datarow;
		// i is the number of catches/encounters.
		for (i = 0; i <= numcatches; i+= datainterval)
		{
			datarow = [];
			
			datarow.push(i);
			
			for (j = pokemontoget; j >= lastdatacolumn; j--)
			{
				// binomcdf(k,n,p) gives us the chances of getting k or fewer successes after n trials with p probability.
				// Since we want the chances of getting k or more successes, we do (1-binomcdf(k-1,n,p).
				prob = (1-binomcdf(j-1,i,(finalp)));
				datarow.push(prob);
			}
			
			data.addRow(datarow);
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
		
		//Print some debug text
		document.getElementById("debug").innerHTML = 	"Plotting 1-binomcdf(k,n,p) with k=" + (pokemontoget - 1) + ", p = (" + prnumerator +
														"/" + prdenominator + ")*(" + lvlnumerator + "/" + lvldenominator + ")*" + ratemodifier +
														" = (" + p.toFixed(6) + "*" + lvlp.toFixed(6) + "*" + ratemodifier.toFixed(6) + ") = " + finalp.toFixed(8) +
														" for 0<=n<=" + numcatches;
								
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
		
		//Reset some options
		options.vAxis.viewWindow = {min:0, max:1};
		
		//Draw the chart!
		drawChart();
	}
	
	
	function drawChart() {
	// Disabling the button while the chart is drawing.
		button.disabled = true;
		google.visualization.events.addListener(chart, 'ready',
			function() {
			button.disabled = false;
		});
		chartDrawn = true;
		chart.draw(data, options);
	}
	
}