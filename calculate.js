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
	if (!validateOptions());
	{
		//Save the options for this chart in the URL
		setUrlOptions(true);
		
		getPageOptions();
		
		var calcopts = { minivpercent:parseFloat(pageopts.minivpercent),
		                 minattackiv:((pageopts.minattackiv === "any") ? 0 : parseInt(pageopts.minattackiv)),
		                 encountertype:pageopts.encountertype,
		                 minlevel:((pageopts.minlevel === "any") ? 0 : parseInt(pageopts.minlevel)),
		                 trainerlevel:parseInt(pageopts.trainerlevel),
		                 ratemodifier:parseFloat(pageopts.ratemodifier),
		                 pokemontoget:parseInt(pageopts.pokemontoget),
		                 chartmode:pageopts.chartmode,
		                 encounterstograph:parseInt(pageopts.encounterstograph)
				       };
		
		var titleopts = { findingwhat: "", //Chance of finding __ Pokemon...
		                  afterwhat: ""    //...after ___ normal catches/encounters
		                };
		
		/* First find the probability for any single encounter */
		var miniv = 0;
		if (calcopts.encountertype === "normal")
		{
		  miniv = 0;
		}
		else if (calcopts.encountertype === "boosted")
		{
		  miniv = 4;
		}
		else if (calcopts.encountertype === "raid")
		{
		  miniv = 10;
		}
		

		/* Calculate the number of potential matches (and the total possible matches) given the input minattackiv, minivpercent, and miniv */
		var prnumerator = 0;
		var prdenominator = 0;
		var p = 1;
		
		// Loop through the entire iv table, counting the chance any single encounter will fit our criteria
		for (i = 0; i < iv.length; i++)
		{
			// If it matches ATK and IV% criteria, and fits the type of encounter (miniv), we want it.
			if ((iv[i].atk >= calcopts.minattackiv) &&
			    (iv[i].percent >= calcopts.minivpercent) &&
				(iv[i].lowestiv >= miniv))
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
		var lvlnumerator, lvldenominator, lvlp;
		lvlnumerator = 1;
		lvldenominator = 1;
		
		//min lvl of 0 means 'any'
		if (calcopts.minlevel == 0)
		{
		  lvlnumerator = 1;
		  lvldenominator = 1;
		}
		else if (calcopts.encountertype === "boosted")
		{
		  if (calcopts.trainerlevel >= calcopts.minlevel - 5)
		  {
			lvlnumerator = 1;
			if (calcopts.trainerlevel >= 30)
			{
			  lvldenominator = 30;
			  lvlnumerator = 36 - calcopts.minlevel;
			}
			else
			{
			  lvldenominator = calcopts.trainerlevel;
			  lvlnumerator = calcopts.trainerlevel + 6 - calcopts.minlevel;
			}
		  }
		  else
		  {
			lvlnumerator = 0;
			lvldenominator = 1;
		  }
		}
		else if (calcopts.encountertype === "normal")
		{
		  if (calcopts.trainerlevel >= calcopts.minlevel)
		  {
			lvlnumerator = 1;
			if (calcopts.trainerlevel >= 30)
			{
			  lvldenominator = 30;
			  lvlnumerator = 31 - calcopts.minlevel;
			}
			else
			{
			  lvldenominator = calcopts.trainerlevel;
			  lvlnumerator = calcopts.trainerlevel + 1 - calcopts.minlevel;
			}
		  }
		  else
		  {
			lvlnumerator = 0;
			lvldenominator = 1;
		  }
		}
		
		lvlp = (lvlnumerator/lvldenominator);
		finalp = p*lvlp*calcopts.ratemodifier;
		
		/* Switch to using a normal approximation if the Binomial distribution would be difficult to calculate */
		if (calcopts.chartmode === "pmf")
		{
			if (calcopts.encounterstograph > 1000000)
			{
				calcopts.chartmode = "normalpdf";
			}
			else if (calcopts.encounterstograph > 10000)
			{
				minencounters = Math.max(0,Math.ceil((calcopts.encounterstograph*finalp) - 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
				maxencounters = Math.floor((calcopts.encounterstograph*finalp) + 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp)));
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
				minencounters = Math.max(0,Math.ceil((calcopts.encounterstograph*finalp) - 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
				maxencounters = Math.floor((calcopts.encounterstograph*finalp) + 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp)));
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
		
		/* Fill the data table, where x is the number of catches/encounters, y is the probability of successfully finding what we're looking for. */
		var i,j;
		var prob;
		var datapoints;
		var datainterval;
		var datarow;
		
		data = new google.visualization.DataTable();
		
		/* Single chart */
		if (calcopts.chartmode === "single")
		{
			chart.setChartType("LineChart");
			chartOptions.isStacked = false;
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of catches/encounters'};
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:100, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};

			data.addColumn('number', 'Encounters');
			data.addColumn('number', 'Probability');
			
			datapoints = 500; //Don't calculate/chart more than 500 data points.
			datainterval = Math.ceil(calcopts.encounterstograph / datapoints);
			
			// i is the number of catches/encounters.
			for (i = 0; i <= calcopts.encounterstograph; i+= datainterval)
			{
				// binomcdf(k,n,p) gives us the chances of getting k or fewer successes after n trials with p probability.
				// Since we want the chances of getting k or more successes, we do (1-binomcdf(k-1,n,p).
				prob = 100*(1-binomcdf(calcopts.pokemontoget-1,i,(finalp),0));
				data.addRow([i,prob]);
			}
			
			//Set the title options
			titleopts.findingwhat = `at least ${calcopts.pokemontoget}`;
			titleopts.afterwhat = "x";
							 
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting 1-binomcdf(k,n,p) with k=${calcopts.pokemontoget - 1},` +
			                                                `<br>p=(${prnumerator}/${prdenominator})*(${lvlnumerator}/${lvldenominator})*${calcopts.ratemodifier}=` +
															`(${p.toFixed(6)}*${lvlp.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${finalp.toFixed(8)}` +
															`<br>for n=${calcopts.encounterstograph}`;
		}
		/* Area chart */
		else if (calcopts.chartmode === "area")
		{
			chart.setChartType("AreaChart");
			chartOptions.isStacked = true;
			chartOptions.legend = { position :'right'};
			chartOptions.hAxis = {title:'Number of catches/encounters'};
			chartOptions.vAxis = {gridlines: {count:-1}, minValue:0, maxValue:100, format: 'decimal', title: 'Probability (%)', titleTextStyle:{italic: false}};
			
			datapoints = 100; //Don't calculate/chart more than 500 data points.
			datainterval = Math.ceil(calcopts.encounterstograph / datapoints);
			
			data.addColumn('number', 'Encounters');
			
			for (j = calcopts.pokemontoget; j >= 1; j--)
			{
				data.addColumn('number', 'Probability of ' + j + ' successes');
			}
			
			var prob_prev_series;
			var datarow;
			// i is the number of catches/encounters.
			for (i = 0; i <= calcopts.encounterstograph; i+= datainterval)
			{
				prob_prev_series = 0;
				datarow = [];
				
				datarow.push(i);
				for (j = calcopts.pokemontoget; j >= 1; j--)
				{
					prob = 100*(1-binomcdf(j-1,i,(finalp),0));
					datarow.push(prob - prob_prev_series);
					prob_prev_series = prob;
				}
				
				data.addRow(datarow);
			}
			//Set the title options
			titleopts.findingwhat = `0 to ${calcopts.pokemontoget}`;
			titleopts.afterwhat = "x";
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting 1-binomcdf(k,n,p) with k=${calcopts.pokemontoget - 1},` +
			                                                `<br>p=(${prnumerator}/${prdenominator})*(${lvlnumerator}/${lvldenominator})*${calcopts.ratemodifier}=` +
															`(${p.toFixed(6)}*${lvlp.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${finalp.toFixed(8)}` +
															`<br>for n=${calcopts.encounterstograph}`;
		}
		/* PMF Chart */
		else if (calcopts.chartmode === "pmf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of catches/encounters matching criteria'};
				
			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(0,Math.ceil((calcopts.encounterstograph*finalp) - 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
			maxencounters = Math.floor((calcopts.encounterstograph*finalp) + 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp)));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.

			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chart.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chart.setChartType("LineChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				charttype="LineChart";
				datainterval = Math.ceil((maxencounters - minencounters) / datapoints);
			}
			
			var maxprob = 0;
			
			for (i = minencounters; i <= maxencounters; i+= datainterval)
			{
				prob = 100*binompmf(i,calcopts.encounterstograph,finalp);
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
															`<br>p = (${prnumerator}/${prdenominator})*(${lvlnumerator}/${lvldenominator})*${calcopts.ratemodifier}=` +
															`(${p.toFixed(6)}*${lvlp.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${finalp.toFixed(8)}` +
															`<br>for n=${calcopts.encounterstograph}`;
		}
		/* CDF chart */
		else if (calcopts.chartmode === "cdf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of catches/encounters matching criteria'};
				

			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(1,Math.ceil((calcopts.encounterstograph*finalp) - 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
			maxencounters = Math.floor((calcopts.encounterstograph*finalp) + 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp)));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			
			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chart.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chart.setChartType("LineChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				charttype="LineChart";
				datainterval = Math.ceil((maxencounters - minencounters) / datapoints);
			}
			
			var maxprob = 0;
			
			//Print some debug text
			document.getElementById("debug").innerHTML = 	`Plotting 1-binomcdf(k,n,p) with 0<=k<=${maxencounters},` +
															`<br>p = (${prnumerator}/${prdenominator})*(${lvlnumerator}/${lvldenominator})*${calcopts.ratemodifier}=` +
															`(${p.toFixed(6)}*${lvlp.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)}) = ${finalp.toFixed(8)}` +
															`<br>for n=${calcopts.encounterstograph}`;
			
			//Toss the extreme left tail (anything less than 10 standard deviations left of the mean)
			var begin = Math.max(0,Math.floor((calcopts.encounterstograph*finalp)-10*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
			begin = 0;
			if (begin != 0)
			{
				document.getElementById("debug").innerHTML += (`<br>binomcdf: ignoring extreme left tail below ${begin} of size << ${(begin+1)*binompmf(begin,calcopts.encounterstograph,finalp)}`);
			}
			
			
			for (i = minencounters; i <= maxencounters; i+= datainterval)
			{
				prob = 100*(1-binomcdf(i-1,calcopts.encounterstograph,finalp,begin));
			
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
			chartOptions.hAxis = {title:'Number of catches/encounters matching criteria'};
				
			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(0,Math.ceil((calcopts.encounterstograph*finalp) - 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
			maxencounters = Math.floor((calcopts.encounterstograph*finalp) + 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp)));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			
			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chart.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chart.setChartType("LineChart");
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
				prob = 100*((normalcdf(i+0.5,(calcopts.encounterstograph*finalp),(calcopts.encounterstograph*finalp*(1-finalp))) -
							normalcdf(i-0.5,(calcopts.encounterstograph*finalp),(calcopts.encounterstograph*finalp*(1-finalp)))));
			
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
															`<br>μ=n*p=${calcopts.encounterstograph}*(${prnumerator}/${prdenominator})*(${lvlnumerator}/${lvldenominator})*${calcopts.ratemodifier}=` +
															`${calcopts.encounterstograph}*(${p.toFixed(6)}*${lvlp.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${(calcopts.encounterstograph*finalp.toFixed(8))}` +
															`<br>σ²=n*p*(1-p)=${(calcopts.encounterstograph*finalp*(1-finalp)).toFixed(4)}` +
															`<br>with np=${(calcopts.encounterstograph*finalp).toFixed(4)} n(1-p)=${(calcopts.encounterstograph*(1-finalp)).toFixed(4)}`;
		}
		/* Gaussian CDF chart */
		else if (calcopts.chartmode === "normalcdf")
		{
			chartOptions.legend = { position :'none'};
			chartOptions.hAxis = {title:'Number of catches/encounters matching criteria'};
				
			//Plot 5 standard deviations away from the mean
			minencounters = Math.max(1,Math.ceil((calcopts.encounterstograph*finalp) - 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp))));
			maxencounters = Math.floor((calcopts.encounterstograph*finalp) + 5*Math.sqrt(calcopts.encounterstograph*finalp*(1-finalp)));
			
			datapoints = 100; //Don't calculate/chart more than 100 data points.
			
			
			var charttype;
			//Graph at most 50 columns, otherwise switch to a line chart
			if((maxencounters - minencounters) <= 50)
			{
				chart.setChartType("ColumnChart");
				data.addColumn('string', 'Successful Encounters');
				data.addColumn('number', 'Probability');
				data.addColumn({type:'string', role:'style'});
				charttype="ColumnChart";
				datainterval = 1;
			}
			else
			{
				chart.setChartType("LineChart");
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
				prob = 100*(1-normalcdf(i-0.5,(calcopts.encounterstograph*finalp),(calcopts.encounterstograph*finalp*(1-finalp))));
			
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
															`<br>μ=n*p=${calcopts.encounterstograph}*(${prnumerator}/${prdenominator})*(${lvlnumerator}/${lvldenominator})*${calcopts.ratemodifier}=` +
															`${calcopts.encounterstograph}*(${p.toFixed(6)}*${lvlp.toFixed(6)}*${calcopts.ratemodifier.toFixed(6)})=${(calcopts.encounterstograph*finalp.toFixed(8))}` +
															`<br>σ²=n*p*(1-p)=${(calcopts.encounterstograph*finalp*(1-finalp)).toFixed(4)}` +
															`<br>with np=${(calcopts.encounterstograph*finalp).toFixed(4)} n(1-p)=${(calcopts.encounterstograph*(1-finalp)).toFixed(4)}`;
		}
		
	/* Finished calculating for all charts */
		
		//Print the final probability per encounter
		document.getElementById("resultstext").innerHTML =	`On average, ${prnumerator} of every ${prdenominator} Pokemon (${(p*100).toFixed(2)}%) will match the IV criteria...<br>`;
		if (calcopts.minlevel != 0)
		{
			document.getElementById("resultstext").innerHTML += `Also, ${lvlnumerator}/${lvldenominator} (${(lvlp*100).toFixed(2)}%) of those will match the level requirements...<br>`;
		}
															
		if (calcopts.ratemodifier != 1)
		{
		document.getElementById("resultstext").innerHTML += `Finally, there's a manual rate modifier (shiny rate) of ${calcopts.ratemodifier.toFixed(4)}<br>`;
		}
		document.getElementById("resultstext").innerHTML += `This gives a total probability of ${(p*lvlp*calcopts.ratemodifier*100).toFixed(6)}% per encounter.`;
		
		//Set the chart title
		var titleShiny = "";
		var titleLevel = "";
		var titleMinIV = "";
		var titleAttackIV = "";

		if (calcopts.ratemodifier != 1)
		{
			var titleShiny = "shiny";
		}
		if ((calcopts.minlevel != 0) && (calcopts.encountertype != "raid"))
		{
			var titleLevel = `with level >${calcopts.minlevel}`;
		}
		if (calcopts.minivpercent > 0)
		{
			var titleMinIV = `above ${calcopts.minivpercent}% IV`;
		}
		if (calcopts.minattackiv > 0)
		{
			var titleAttackIV = `with ATK>${calcopts.minattackiv}`;
		}
		
		chartOptions.title  = `Chance of finding ${titleopts.findingwhat} ${titleShiny} Pokemon ${titleMinIV} ${titleLevel} ${titleAttackIV} ` +
							  `after ${titleopts.afterwhat} ${calcopts.encountertype} encounters`;
		
		
		chartOptions.height = height;
		chartOptions.width = "90%";
		chartOptions.chartArea = {width:widthpercent,height:heightpercent};
		
		chart.setDataTable(data);
		chart.setOptions(chartOptions);
		
		//Draw the chart!
		drawChart();
	}
}