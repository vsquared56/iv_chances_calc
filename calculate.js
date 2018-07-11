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

var calcopts;

function getCalcOptions()
{
	calcopts = { minivpercent:parseFloat(pageOpts.minivpercent.value),
				 miniv:0,
				 minattackiv:((pageOpts.minattackiv.value === "any") ? 0 : parseInt(pageOpts.minattackiv.value)),
				 mindefenseiv:((pageOpts.mindefenseiv.value === "any") ? 0 : parseInt(pageOpts.mindefenseiv.value)),
				 minstaminaiv:((pageOpts.minstaminaiv.value === "any") ? 0 : parseInt(pageOpts.minstaminaiv.value)),
				 encountertype:pageOpts.encountertype.value,
				 minlevel:((pageOpts.minlevel.value === "any") ? 0 : parseInt(pageOpts.minlevel.value)),
				 trainerlevel:parseInt(pageOpts.trainerlevel.value),
				 ratemodifier:parseFloat(pageOpts.ratemodifier.value),
				 pokemontoget:parseInt(pageOpts.pokemontoget.value),
				 chartmode:pageOpts.chartmode.value,
				 encounterstograph:parseInt(pageOpts.encounterstograph.value)
			   };
			   
	if (calcopts.encountertype === "normal")
	{
		calcopts.miniv = 0;
	}
	else if (calcopts.encountertype === "boosted")
	{
		calcopts.miniv = 4;
	}
	else if (calcopts.encountertype === "raid")
	{
		calcopts.miniv = 10;
	}
}

var calcresults;
function calculatePerEncounterProb()
{
	getCalcOptions();
	
	calcresults = { ivnumerator: 0,
					ivdenominator: 0,
					iv_prob: 0,
					lvlnumerator: 1,
					lvldenominator: 1,
					lvl_prob: 0
					}
	/* Calculate the number of potential matches (and the total possible matches) given the input minattackiv, minivpercent, and miniv */
	
	// Loop through the entire iv table, counting the chance any single encounter will fit our criteria
	for (i = 0; i < iv.length; i++)
	{
		// If it matches ATK,DEF,STA and IV% criteria, and fits the type of encounter (miniv), we want it.
		if ((iv[i].atk >= calcopts.minattackiv) &&
		    (iv[i].def >= calcopts.mindefenseiv) &&
			(iv[i].sta >= calcopts.minstaminaiv) &&
			(iv[i].percent >= calcopts.minivpercent) &&
			(iv[i].lowestiv >= calcopts.miniv))
		{
			calcresults.ivnumerator++;
		}
		// Divide by the total number of possible encounters (those matching the encounter type, miniv)
		if (iv[i].lowestiv >= calcopts.miniv)
		{
			calcresults.ivdenominator++;
		}
	}
	calcresults.iv_prob = (calcresults.ivnumerator / calcresults.ivdenominator);
	
	// Calculate level modifier
	calcresults.lvlnumerator = 1;
	calcresults.lvldenominator = 1;
	
	//min lvl of 0 means 'any'
	if (calcopts.minlevel == 0)
	{
	  calcresults.lvlnumerator = 1;
	  calcresults.lvldenominator = 1;
	}
	else if (calcopts.encountertype === "boosted")
	{
	  if (calcopts.trainerlevel >= calcopts.minlevel - 5)
	  {
		calcresults.lvlnumerator = 1;
		if (calcopts.trainerlevel >= 30)
		{
		  calcresults.lvldenominator = 30;
		  calcresults.lvlnumerator = 36 - calcopts.minlevel;
		}
		else
		{
		  calcresults.lvldenominator = calcopts.trainerlevel;
		  calcresults.lvlnumerator = calcopts.trainerlevel + 6 - calcopts.minlevel;
		}
	  }
	  else
	  {
		calcresults.lvlnumerator = 0;
		calcresults.lvldenominator = 1;
	  }
	}
	else if (calcopts.encountertype === "normal")
	{
	  if (calcopts.trainerlevel >= calcopts.minlevel)
	  {
		calcresults.lvlnumerator = 1;
		if (calcopts.trainerlevel >= 30)
		{
		  calcresults.lvldenominator = 30;
		  calcresults.lvlnumerator = 31 - calcopts.minlevel;
		}
		else
		{
		  calcresults.lvldenominator = calcopts.trainerlevel;
		  calcresults.lvlnumerator = calcopts.trainerlevel + 1 - calcopts.minlevel;
		}
	  }
	  else
	  {
		calcresults.lvlnumerator = 0;
		calcresults.lvldenominator = 1;
	  }
	}
	
	calcresults.lvl_prob = (calcresults.lvlnumerator/calcresults.lvldenominator);
	calcresults.final_prob = calcresults.iv_prob*calcresults.lvl_prob*calcopts.ratemodifier;
}

function calculateAutoEncountersToGraph()
{
	getCalcOptions();
	calculatePerEncounterProb();
		
	var encounters = 10;
	
	var maxProb;
	if (calcopts.chartmode === 'single')
	{
		maxProb = 99.5;
	}
	else if (calcopts.chartmode === 'area')
	{
		maxProb = 50;
	}
	
	while(100*(1-binomcdf(calcopts.pokemontoget-1,encounters,(calcresults.final_prob),0)) < maxProb)
	{
		encounters += Math.pow(10,Math.floor(Math.log10(encounters))); //Add the nearest lower power of 10 (10 for x<100, 100 for x<1000, etc)
	}

	return encounters;
}

function calculate()
{
	getPageOptions();
	if (!validateOptions());
	{
		getCalcOptions();
		
		var titleopts = { findingwhat: "", //Chance of finding __ Pokemon...
		                  afterwhat: ""    //...after ___ normal encounters
		                };
		
		calculatePerEncounterProb()
		
		
		/* Switch to using a normal approximation if the Binomial distribution would be difficult to calculate */
		if (calcopts.chartmode === "pmf")
		{
			if (calcopts.encounterstograph > 1000000)
			{
				calcopts.chartmode = "normalpdf";
			}
			else if (calcopts.encounterstograph > 10000)
			{
				minencounters = Math.max(0,Math.ceil((calcopts.encounterstograph*calcresults.final_prob) - 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
				maxencounters = Math.floor((calcopts.encounterstograph*calcresults.final_prob) + 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)));
				if ((maxencounters - minencounters) > 100)
				{
					calcopts.chartmode = "normalpdf";
				}
			}
		}
		else if (calcopts.chartmode === "cdf")
		{
			if (calcopts.encounterstograph > 1000000)
			{
				calcopts.chartmode = "normalcdf";
			}
			else if (calcopts.encounterstograph > 500)
			{
				minencounters = Math.max(0,Math.ceil((calcopts.encounterstograph*calcresults.final_prob) - 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
				maxencounters = Math.floor((calcopts.encounterstograph*calcresults.final_prob) + 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)));
				if (minencounters > 100 && (maxencounters-minencounters) > 30 )
				{
					calcopts.chartmode = "normalcdf";
				}
				else if (minencounters > 1000)
				{
					calcopts.chartmode = "normalcdf";
				}
			}
		}
		
		/* Fill the data table, where x is the number of encounters, y is the probability of successfully finding what we're looking for. */
		var i,j;
		var prob;
		var datapoints;
		var datainterval;
		
		data = new google.visualization.DataTable();
		
		/* Single chart */
		if (calcopts.chartmode === "single")
		{
			chartWrapper.setChartType("LineChart");
			chartOptions.isStacked = false;
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of encounters'};
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:100, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};

			data.addColumn('number', 'Encounters');
			data.addColumn('number', 'Probability');
			
			datapoints = 500; //Don't calculate/chart more than 500 data points.
			datainterval = Math.ceil(calcopts.encounterstograph / datapoints);
			
			// i is the number of encounters.
			for (i = 0; i <= calcopts.encounterstograph; i+= datainterval)
			{
				// binomcdf(k,n,p) gives us the chances of getting k or fewer successes after n trials with p probability.
				// Since we want the chances of getting k or more successes, we do (1-binomcdf(k-1,n,p).
				prob = 100*(1-binomcdf(calcopts.pokemontoget-1,i,(calcresults.final_prob),0));
				data.addRow([i,prob]);
			}
			
			//Add tooltip when the chart is ready
			google.visualization.events.addOneTimeListener(chartWrapper, 'ready', addTooltip);
			
			//Set the title options
			titleopts.findingwhat = `at least ${calcopts.pokemontoget}`;
			titleopts.afterwhat = "x";
							 
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting 1-binomcdf(k,n,p) with k=${calcopts.pokemontoget - 1},` +
			                                                `<br>p=(${calcresults.ivnumerator}/${calcresults.ivdenominator})*(${calcresults.lvlnumerator}/${calcresults.lvldenominator})*${calcopts.ratemodifier}=` +
															`(${calcresults.iv_prob.toFixed(6)}*${calcresults.lvl_prob.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${calcresults.final_prob.toFixed(8)}` +
															`<br>for 0<=n<=${calcopts.encounterstograph}`;
		}
		/* Area chart */
		else if (calcopts.chartmode === "area")
		{
			chartWrapper.setChartType("AreaChart");
			chartOptions.isStacked = true;
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of encounters'};
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:100, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			datainterval = Math.ceil(calcopts.encounterstograph / datapoints);
			
			data.addColumn('number', 'Encounters');
			
			for (j = calcopts.pokemontoget; j >= 1; j--)
			{
				data.addColumn('number', 'Probability of ' + j + ' successes');
			}
			
			var probPrevSeries;
			var dataRow;
			
			//i is the number of encounters.
			for (i = 0; i <= calcopts.encounterstograph; i+= datainterval)
			{
				probPrevSeries = 0;
				dataRow = [];
				dataRow.push(i);
				
				//j is each series
				for (j = calcopts.pokemontoget; j >= 1; j--)
				{
					prob = 100*(1-binomcdf(j-1,i,(calcresults.final_prob),0));
					dataRow.push(prob - probPrevSeries); //Due to .isStacked = true
					probPrevSeries = prob;
				}
				
				data.addRow(dataRow);
			}
			
			//Add tooltip when the chart is ready
			google.visualization.events.addOneTimeListener(chartWrapper, 'ready', addTooltip);
			
			//Set the title options
			titleopts.findingwhat = `0 to ${calcopts.pokemontoget}`;
			titleopts.afterwhat = "x";
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting 1-binomcdf(k,n,p) with k=${calcopts.pokemontoget - 1},` +
			                                                `<br>p=(${calcresults.ivnumerator}/${calcresults.ivdenominator})*(${calcresults.lvlnumerator}/${calcresults.lvldenominator})*${calcopts.ratemodifier}=` +
															`(${calcresults.iv_prob.toFixed(6)}*${calcresults.lvl_prob.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${calcresults.final_prob.toFixed(8)}` +
															`<br>for 0<=n<=${calcopts.encounterstograph}`;
		}
		/* PMF Chart */
		else if (calcopts.chartmode === "pmf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of encounters matching criteria'};
				
			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(0,Math.floor((calcopts.encounterstograph*calcresults.final_prob) - 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			maxencounters = Math.ceil((calcopts.encounterstograph*calcresults.final_prob) + 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.

			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chartWrapper.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chartWrapper.setChartType("LineChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				charttype="LineChart";
				datainterval = Math.ceil((maxencounters - minencounters) / datapoints);
			}
			
			var maxprob = 0;
			
			for (i = minencounters; i <= maxencounters; i+= datainterval)
			{
				prob = 100*binompmf(i,calcopts.encounterstograph,calcresults.final_prob);
				if (charttype === "ColumnChart")
				{
					if (i < calcopts.pokemontoget)
					{
						color = "blue";
					}
					else
					{
						color = "green";
					}
					data.addRow([String(i),prob,color]);
				}
				else if (charttype === "LineChart")
				{
					data.addRow([String(i),prob]);
				}
			
				if (prob > maxprob)
				{
					maxprob = prob;
				}
				
				
			}
			
			//Set the chart scale
			var maxValRounded = Math.pow(10,Math.floor(Math.log10(maxprob)))
			var maxVal = (maxValRounded * Math.ceil(maxprob / maxValRounded));
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:maxVal, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};
			
			//Set the title options
			titleopts.findingwhat = "x";
			titleopts.afterwhat = `exactly ${calcopts.encounterstograph}`;
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting binompmf(k,n,p) with 0<=k<=${maxencounters},` +
															`<br>p = (${calcresults.ivnumerator}/${calcresults.ivdenominator})*(${calcresults.lvlnumerator}/${calcresults.lvldenominator})*${calcopts.ratemodifier}=` +
															`(${calcresults.iv_prob.toFixed(6)}*${calcresults.lvl_prob.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${calcresults.final_prob.toFixed(8)}` +
															`<br>for n=${calcopts.encounterstograph}`;
		}
		/* CDF chart */
		else if (calcopts.chartmode === "cdf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of encounters matching criteria'};
				

			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(1,Math.floor((calcopts.encounterstograph*calcresults.final_prob) - 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			maxencounters = Math.ceil((calcopts.encounterstograph*calcresults.final_prob) + 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			
			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chartWrapper.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chartWrapper.setChartType("LineChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				charttype="LineChart";
				datainterval = Math.ceil((maxencounters - minencounters) / datapoints);
			}
			
			var maxprob = 0;
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting 1-binomcdf(k,n,p) with 0<=k<=${maxencounters},` +
															`<br>p = (${calcresults.ivnumerator}/${calcresults.ivdenominator})*(${calcresults.lvlnumerator}/${calcresults.lvldenominator})*${calcopts.ratemodifier}=` +
															`(${calcresults.iv_prob.toFixed(6)}*${calcresults.lvl_prob.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)}) = ${calcresults.final_prob.toFixed(8)}` +
															`<br>for n=${calcopts.encounterstograph}`;
			
			//Toss the extreme left tail (anything less than 10 standard deviations left of the mean)
			var begin = Math.max(0,Math.floor((calcopts.encounterstograph*calcresults.final_prob)-10*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			begin = 0;
			if (begin != 0)
			{
				document.getElementById("debug").innerHTML += (`<br>binomcdf: ignoring extreme left tail below ${begin} of size << ${(begin+1)*binompmf(begin,calcopts.encounterstograph,calcresults.final_prob)}`);
			}
			
			
			for (i = minencounters; i <= maxencounters; i+= datainterval)
			{
				prob = 100*(1-binomcdf(i-1,calcopts.encounterstograph,calcresults.final_prob,begin));
			
				if (charttype === "ColumnChart")
				{
					if (i < calcopts.pokemontoget)
					{
						color = "blue";
					}
					else
					{
						color = "green";
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
				else if (charttype === "LineChart")
				{
					data.addRow([String(i),prob]);
				}
				
				if (prob > maxprob)
				{
					maxprob = prob;
				}
				
			}		
			
			//Set the chart scale
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:100, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};
			
			//Set the title options
			titleopts.findingwhat = "at least x";
			titleopts.afterwhat = `exactly ${calcopts.encounterstograph}`;
			
		}
		/* Gaussian PDF chart */
		else if (calcopts.chartmode === "normalpdf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of encounters matching criteria'};
				
			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(0,Math.floor((calcopts.encounterstograph*calcresults.final_prob) - 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			maxencounters = Math.min(calcopts.encounterstograph,
									 Math.ceil((calcopts.encounterstograph*calcresults.final_prob) + 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			
			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chartWrapper.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chartWrapper.setChartType("LineChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				charttype="LineChart";
				datainterval = Math.ceil((maxencounters - minencounters) / datapoints);
			}
			
			var maxprob = 0;
			
			
			for (i = minencounters; i <= maxencounters; i++)
			{
				//The binomial distribution can be approximated by the normal distribution with mean n*p and variance n*p*(1-p)
				//Apply a continuity correction to get binompmf(x,n,p) ~= normalcdf(x+0.5,mean=np,variance=np(1-p))-normalcdf(x-0.5,np,np(1-p))
				prob = 100*((normalcdf(i+0.5,(calcopts.encounterstograph*calcresults.final_prob),(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))) -
							normalcdf(i-0.5,(calcopts.encounterstograph*calcresults.final_prob),(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)))));
			
				if (charttype === "ColumnChart")
				{
					if (i < calcopts.pokemontoget)
					{
						color = "blue";
					}
					else
					{
						color = "green";
					}
				
					data.addRow([String(i),prob,color]);
				}
				else if (charttype === "LineChart")
				{
					data.addRow([String(i),prob]);
				}
				if (prob > maxprob)
				{
					maxprob = prob;
				}
			}


			//Set the chart scale
			var maxValRounded = Math.pow(10,Math.floor(Math.log10(maxprob)))
			var maxVal = (maxValRounded * Math.ceil(maxprob / maxValRounded));
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:maxVal, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};
			
			//Set the title options
			titleopts.findingwhat = "x";
			titleopts.afterwhat = `exactly ${calcopts.encounterstograph}`;
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Using a Gaussian approximation of the binomial distribution...` +
			                                                `<br>Plotting normalpdf(x,μ,σ²) with 0<=x<=${maxencounters},` +
															`<br>μ=n*p=${calcopts.encounterstograph}*(${calcresults.ivnumerator}/${calcresults.ivdenominator})*(${calcresults.lvlnumerator}/${calcresults.lvldenominator})*${calcopts.ratemodifier}=` +
															`${calcopts.encounterstograph}*(${calcresults.iv_prob.toFixed(6)}*${calcresults.lvl_prob.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${(calcopts.encounterstograph*calcresults.final_prob.toFixed(8))}` +
															`<br>σ²=n*p*(1-p)=${(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)).toFixed(4)}` +
															`<br>with np=${(calcopts.encounterstograph*calcresults.final_prob).toFixed(4)} n(1-p)=${(calcopts.encounterstograph*(1-calcresults.final_prob)).toFixed(4)}`;
		}
		/* Gaussian CDF chart */
		else if (calcopts.chartmode === "normalcdf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of encounters matching criteria'};
				
			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(1,Math.floor((calcopts.encounterstograph*calcresults.final_prob) - 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			maxencounters = Math.min(calcopts.encounterstograph,
									 Math.ceil((calcopts.encounterstograph*calcresults.final_prob) + 5*Math.sqrt(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			
			
			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chartWrapper.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chartWrapper.setChartType("LineChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				charttype="LineChart";
				datainterval = Math.ceil((maxencounters - minencounters) / datapoints);
			}
			
			var maxprob = 0;
			
			
			for (i = minencounters; i <= maxencounters; i++)
			{
				//The binomial distribution can be approximated by the normal distribution with mean n*p and variance n*p*(1-p)
				//Apply a continuity correction to get binomcdf(x,n,p) ~= normalcdf(x-0.5,mean=np,variance=np(1-p))
				prob = 100*(1-normalcdf(i-0.5,(calcopts.encounterstograph*calcresults.final_prob),(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob))));
			
				if (charttype === "ColumnChart")
				{
					if (i < calcopts.pokemontoget)
					{
						color = "blue";
					}
					else
					{
						color = "green";
					}
					
					data.addRow([String(i),prob,color]);
				}
				else if (charttype === "LineChart")
				{
					data.addRow([String(i),prob]);
				}
			
				if (prob > maxprob)
				{
					maxprob = prob;
				}
			}

			
			//Set the chart scale
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:100, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};
			
			//Set the title options
			titleopts.findingwhat = "at least x";
			titleopts.afterwhat = `exactly ${calcopts.encounterstograph}`;
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Using a Gaussian approximation of the binomial distribution...` +
			                                                `Plotting normalcdf(x,μ,σ²) with 0<=x<=${maxencounters},` +
															`<br>μ=n*p=${calcopts.encounterstograph}*(${calcresults.ivnumerator}/${calcresults.ivdenominator})*(${calcresults.lvlnumerator}/${calcresults.lvldenominator})*${calcopts.ratemodifier}=` +
															`${calcopts.encounterstograph}*(${calcresults.iv_prob.toFixed(6)}*${calcresults.lvl_prob.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${(calcopts.encounterstograph*calcresults.final_prob.toFixed(8))}` +
															`<br>σ²=n*p*(1-p)=${(calcopts.encounterstograph*calcresults.final_prob*(1-calcresults.final_prob)).toFixed(4)}` +
															`<br>with np=${(calcopts.encounterstograph*calcresults.final_prob).toFixed(4)} n(1-p)=${(calcopts.encounterstograph*(1-calcresults.final_prob)).toFixed(4)}`;
		}
		
	/* Finished calculating for all charts */
		
		//Print the final probability per encounter
		document.getElementById("resultstext").innerHTML =	`On average, ${calcresults.ivnumerator} of every ${calcresults.ivdenominator} Pokemon (${(calcresults.iv_prob*100).toFixed(2)}%) will match the IV criteria...<br>`;
		if (calcopts.minlevel != 0)
		{
			document.getElementById("resultstext").innerHTML += `Also, ${calcresults.lvlnumerator}/${calcresults.lvldenominator} (${(calcresults.lvl_prob*100).toFixed(2)}%) of those will match the level requirements...<br>`;
		}
															
		if (calcopts.ratemodifier != 1)
		{
		document.getElementById("resultstext").innerHTML += `Finally, there's a manual rate modifier (shiny rate) of ${calcopts.ratemodifier.toFixed(4)}<br>`;
		}
		document.getElementById("resultstext").innerHTML += `This gives a total probability of ${(calcresults.iv_prob*calcresults.lvl_prob*calcopts.ratemodifier*100).toFixed(6)}% per encounter.`;
		
		//Set the chart title
		var titleShiny = "";
		var titleLevel = "";
		var titleMinIV = "";
		var titleIV = "";

		if (calcopts.ratemodifier != 1)
		{
			titleShiny = `shiny (1 in ${(1/calcopts.ratemodifier).toFixed(1)})`;
		}
		if ((calcopts.minlevel != 0) && (calcopts.encountertype != "raid"))
		{
			titleLevel = `with level ≥${calcopts.minlevel}`;
		}
		if (calcopts.minivpercent > 0)
		{
			titleMinIV = `of at least ${calcopts.minivpercent}% IV`;
		}
		if ((calcopts.minattackiv + calcopts.mindefenseiv + calcopts.minstaminaiv) > 0)
		{
			titleIV = "with ";
			if (calcopts.minattackiv > 0)
			{
				titleIV += ` ATK≥${calcopts.minattackiv}`;
			}
			if (calcopts.mindefenseiv > 0)
			{
				titleIV += ` DEF≥${calcopts.mindefenseiv}`;
			}
			if (calcopts.minstaminaiv > 0)
			{
				titleIV += ` STA≥${calcopts.minstaminaiv}`;
			}
		}
		
		chartOptions.title  = `Chance of finding ${titleopts.findingwhat} ${titleShiny} Pokemon ${titleMinIV} ${titleLevel} ${titleIV} ` +
							  `after ${titleopts.afterwhat} ${calcopts.encountertype} encounters`;
		
		
		chartOptions.height = height;
		chartOptions.width = "90%";
		chartOptions.chartArea = {width:widthpercent,height:heightpercent};
		
		chartWrapper.setDataTable(data);
		chartWrapper.setOptions(chartOptions);
		
		//Draw the chart!
		drawChart();
	}
}

function addOverlays()
{
	var i,j;
	
	/*First, calculate the intersection of each series with an imaginary line from the upper-left to the bottom-right corner of the chart
	 */
	var seriesLineIntersections = []; //Where index 1 is the intersection with the last, bottom-right-most curve
	var currSeries, currSeriesVal;
	var slope = -100/(data.getValue(data.getNumberOfRows() - 1,0));
	var currLineVal = 100; //The value of the imaginary line above at some x;
	
	currSeries = calcopts.pokemontoget; //The bottom-left most curve is series 1, with data in column 1

	var x;
	var xPrev = 0;
	var xMax = data.getValue(data.getNumberOfRows() - 1,0);
	var yMax = 100;
	
	var firstSeries = 0;
	var lastSeries = 0;
	
	//i iterates over rows, i.e. over different x values
	for(i=0; i < data.getNumberOfRows(); i++)
	{	
		x = data.getValue(i, 0);
		
		//The data in each column contains the probabilities for that individual series.
		//To find the x,y coordinates of any given line, add up all the series below it.
		currSeriesVal = 0;
		for(j=1; j <= currSeries; j++)
		{
			currSeriesVal += data.getValue(i, j); //Columns (j) start with the lowest series indexed at 1
		}
		
		//Check for intersection
		if (currSeriesVal >= currLineVal)
		{
			seriesLineIntersections[currSeries] = {x:x,y:currSeriesVal};
			currSeries--; //Once we found the intersection with the top-left most curve, move on to the next
		}
		
		currLineVal += slope * (x-xPrev); //Slope is negative
		xPrev = x;
	}
	
	//If no intersections were found for any bottom-right curves, set them to the bottom-right corner.
	if (currSeries > 1)
	{
		for (i = currSeries; i > 0; i--)
		{
			seriesLineIntersections[i] = {x:xMax,y:0};
		}
	}
	
	
	/*Next, switch to x/y pixel coordinates
	 */
	var cli = chartWrapper.getChart().getChartLayoutInterface();
	
	var seriesLineIntersectionsPx = []; //Here, we switch the direction of the index and add both the upper-left and bottom-right corner
	
	seriesLineIntersectionsPx[0] = {x:cli.getXLocation(0), y:cli.getYLocation(100)} //So the upper-left corner is at index 0
	seriesLineIntersectionsPx[seriesLineIntersections.length] = {x:cli.getXLocation(xMax), y:cli.getYLocation(0)}; //And the bottom-right corner is last
	for (var index in seriesLineIntersections)
	{
		seriesLineIntersectionsPx[seriesLineIntersections.length - index] = {x:cli.getXLocation(seriesLineIntersections[index].x), y:cli.getYLocation(seriesLineIntersections[index].y)};
	}
	
	/*Finally, find the midpoints of the above coordinates
	 *which will be the overlay locations
	 */
	var overlayLocations = []; //Now the index corresponds to the Pokemon number of the area under the location
	
	for (i=0; i < seriesLineIntersectionsPx.length - 1; i++)
	{
		overlayLocations[i] = {x:(seriesLineIntersectionsPx[i].x + seriesLineIntersectionsPx[i+1].x)/2,
 	                      	   y:(seriesLineIntersectionsPx[i].y + seriesLineIntersectionsPx[i+1].y)/2};
		
		var div = document.createElement("div");
		
		div.className = "overlay";
		div.id = `overlay_${i}`;
		div.innerHTML = `n=${i}`;
		
		document.getElementById("overlaycontainer").appendChild(div);
		
		divWidth = document.getElementById("overlay_" + i).clientWidth;
		divHeight = document.getElementById("overlay_" + i).clientHeight;
		
		if (((overlayLocations[i].x - seriesLineIntersectionsPx[i].x) < (divWidth/2.25)) || ((overlayLocations[i].y - seriesLineIntersectionsPx[i].y) < (divHeight/2.25)))
		{
			document.getElementById("overlay_" + i).style.display = "none";
		}
		else
		{
			document.getElementById("overlay_" + i).style.top = (overlayLocations[i].y - (divHeight / 2)) + "px";
			document.getElementById("overlay_" + i).style.left = (overlayLocations[i].x - (divWidth / 2)) + "px";
		}
	}
	
	console.log(seriesLineIntersections);
}