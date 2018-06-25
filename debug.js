window.onload = function()
{
	document.getElementById("title").innerHTML = "DEBUG";
	document.body.style.backgroundColor = "yellow";
	document.getElementsByClassName("content")[0].style.backgroundColor = "yellow";
	document.getElementById("chart_mode").innerHTML += `<option value="normalpdf">Normal PDF</option><option value="normalcdf">Normal CDF</option>`;
	document.getElementsByClassName("options")[0].innerHTML = `<div class="optioncategory"><div class="optionentry"><div class="optiondescription">DEBUG</div>` +
							                                  `<button type="button" onclick="runCalcTest()">Test Calculations</button>` +
															  `<button type="button" onclick="runMathTest()">Test Math</button>` +
															  `<br>` +
															  `<button type="button" onclick="runRandomTests()">Run x Random Tests</button><input id="numrandomtests"></input>` +
															  `<br>` +
															  `<button type="button" onclick="randomizeValid()">Random Valid Options</button>` +
															  `<button type="button" onclick="randomizeOptions()">Randomize Options</button>` +
															  `<br>` +
															  `Max time:<input id="maxtime" value="2000"></input>` +
															  `<br>` +
															  `<button type="button" onclick="clearResults()">Clear Results</button>` +
															  `</div></div>` +
                                                              document.getElementsByClassName("options")[0].innerHTML;
	document.getElementsByClassName("content")[0].innerHTML += `<div id="testresults" style="font-family: 'Courier New', Courier"></div>`;
}

function runCalcTest()
{
	resetOptionDefaults();

	runTest();
	testValueData(0,1,0);
	testValueData(10,1,33.712604034834634);
	testValueData(100,1,98.36201626393432);
	
	pageOpts.appraisal.value = "good";
	pageOpts.minivpercent.value = "66.7";

	runTest();
	testValueData(0,1,0);
	testValueData(10,1,83.7228209606438);
	testValueData(100,1,99.99999869445632);
	
	/* Probability = 1 test for different chart modes */
	resetOptionDefaults();
	pageOpts.appraisal.value = "any";
	pageOpts.minivpercent.value = 0;
	runTest("Simple chart performance with p=1, other options defaults");
	testValueData(0,1,0);
	testValueData(1,1,100);
	testValueData(2,1,100);
	testValueData(150,1,100);
	testValueData(300,1,100);
	pageOpts.chartmode.value = "area";
	runTest("Area chart performance with p=1, other options defaults");
	testValueData(0,1,0);
	testValueData(1,1,100);
	testValueData(2,1,100);
	testValueData(50,1,100);
	testValueData(100,1,100);
	pageOpts.chartmode.value = "pmf";
	runTest("PMF chart performance with p=1, other options defaults");
	testValueData(0,1,100);
	pageOpts.chartmode.value = "cdf";
	runTest("CDF chart performance with p=1, other options defaults");
	testValueData(0,1,100);
	pageOpts.chartmode.value = "normalpdf";
	runTest("Normal PDF chart performance with p=1, other options defaults");
	testValueData(0,1,100);
	pageOpts.chartmode.value = "normalcdf";
	runTest("Normal CDF chart performance with p=1, other options defaults");
	testValueData(0,1,100);
	
	/* CDF chart test with very high probability near 1 */
	resetOptionDefaults();
	pageOpts.appraisal.value = "any";
	pageOpts.minivpercent.value = 0;
	pageOpts.ratemodifierselect.value = "custom";
	pageOpts.ratemodifier.value = 0.999;
	pageOpts.ratemodifierinv.value = 1.001;
	pageOpts.encounterstograph.value = 1000;
	pageOpts.chartmode.value = "cdf"
	runTest("CDF chart performance with p=0.999, graph 1000 encounters");
}

function runMathTest()
{
	document.getElementById("testresults").innerHTML += `<br><br><span style="background-color:black;color:white">Running math test:</span><br>`;
	
	testValue(choose(5,0).toNumber(),1,"Choose(5,0)"); //Confirmed value
	testValue(choose(5,1).toNumber(),5,"Choose(5,1)"); //Confirmed value
	testValue(choose(5,5).toNumber(),1,"Choose(5,5)"); //Confirmed value
	testValue(choose(10,5).toNumber(),252,"Choose(10,5)"); //Confirmed value
	testValue(choose(100,25).toString(),"2.4251926972033712102e+23","Choose(100,25)"); //Confirmed value
	testValue(choose(100,50).toString(),"1.0089134454556419332e+29","Choose(100,50)"); //Confirmed value
	testValue(choose(100,75).toString(),"2.4251926972033712102e+23","Choose(100,75)"); //Confirmed value
	testValue(choose(100,100).toNumber(),1,"Choose(100,100)"); //Confirmed value
	testValue(choose(1000000,500000).toString(),"7.899578772276971003e+301026","Choose(1 000 000,500 000)"); //WolframAlpha gives 7.8995787722769708417702379031791126849833959830 × 10^301026
	
	testValue(binompmf(0,100,0.5),7.888609052210118e-31,"binompmf(0,100,0.5)"); //WolframAlpha gives 7.889 * 10^-31
	testValue(binompmf(50,100,0.5),0.07958923738717877,"binompmf(50,100,0.5)"); //WolframAlpha gives 0.0795892
	testValue(binompmf(100,100,0.5),7.888609052210118e-31,"binompmf(100,100,0.5)"); //WolframAlpha gives 7.889 * 10^-31
	
	testValue(binompmf(0,1000,0.001),0.36769542477096406 ,"binompmf(0,1000,0.001)"); //WolframAlpha gives 0.367695
	testValue(binompmf(100,1000,0.001),2.5947993889513444e-161 ,"binompmf(100,1000,0.001)"); //WolframAlpha gives 2.595 * 10^-161
	testValue(binompmf(500,1000,0.001),0,"binompmf(500,1000,0.001)"); //WolframAlpha gives 1.639 * 10^-1201
	testValue(binompmf(900,1000,0.001),0,"binompmf(900,1000,0.001)"); //WolframAlpha gives 5.777 * 10^-2561
	testValue(binompmf(1000,1000,0.001),0,"binompmf(1000,1000,0.001)"); //WolframAlpha gives 1 * 10^-3000
	
	testValue(binompmf(0,1000,0.999),0,"binompmf(0,1000,0.999)"); //WolframAlpha gives 1 * 10^-3000
	testValue(binompmf(100,1000,0.999),0,"binompmf(100,1000,0.999)"); //WolframAlpha gives 5.777 * 10^-2561
	testValue(binompmf(500,1000,0.999),0 ,"binompmf(500,1000,0.999)"); //WolframAlpha gives 1.639 * 10^-1201
	testValue(binompmf(900,1000,0.999),2.5947993889515778e-161  ,"binompmf(500,1000,0.999)"); //WolframAlpha gives 2.595 * 10^-161
	testValue(binompmf(1000,1000,0.999),0.36769542477096406,"binompmf(1000,1000,0.999)"); //WolframAlpha gives 0.367695
	
	testValue(binompmf(24000,100000,0.25),6.078655149933904e-15 ,"binompmf(24 000,100 000,0.25)"); //WolframAlpha gives 6.079 * 10^-15
	testValue(binompmf(25000,100000,0.25),0.0029134519607611348,"binompmf(25 000,100 000,0.25)"); //WolframAlpha gives 0.00291345
	testValue(binompmf(26000,100000,0.25),9.510758150443336e-15 ,"binompmf(26 000,100 000,0.25)"); //WolframAlpha gives 9.511 * 10^-15
	
	testValue(binomcdf(0,100,0.5),7.888609052210118e-31 ,"binomcdf(0,100,0.5)"); //WolframAlpha gives 7.889 * 10^-31
	testValue(binomcdf(50,100,0.5),0.5397946186935894,"binomcdf(50,100,0.5)"); //WolframAlpha gives 0.539795
	testValue(binomcdf(100,100,0.5),1,"binomcdf(100,100,0.5)"); //WolframAlpha gives 1
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function randomizeValid()
{
	do {randomize();} while(validateOptions())
	setPageOptions();
}

function randomizeOptions()
{
	randomize();
		
	setPageOptions();
	validateOptions();
}

function randomize()
{
	var x;

	
	x = getRandomInt(0,10)
	if (x === 0)
	{
		pageOpts.appraisal.value = "best";
		pageOpts.minivpercent.value = 82.2;
	}
	else if (x === 1)
	{
		pageOpts.appraisal.value = "good";
		pageOpts.minivpercent.value = 66.7;
	}
	else if (x === 2)
	{
		pageOpts.appraisal.value = "aboveaverage";
		pageOpts.minivpercent.value = 51.1;
	}
	else if (x === 3)
	{
		pageOpts.appraisal.value = "any";
		pageOpts.minivpercent.value = 0;
	}
	else
	{
		pageOpts.appraisal.value = "other"
		pageOpts.minivpercent.value = getRandomArbitrary(0,100);
	}

	
	x = getRandomInt(0,16);
	{
		if (x === 16)
		{
			pageOpts.minattackiv.value = "any";
		}
		else
		{
			pageOpts.minattackiv.value = x;
		}
	}
	
	x = getRandomInt(0,2);
	if (x === 0)
	{
		pageOpts.encountertype.value = "normal";
	}
	else if (x === 1)
	{
		pageOpts.encountertype.value = "boosted";
	}
	else if (x === 2)
	{
		pageOpts.encountertype.value = "raid";
	}
	
	x = getRandomInt(0,35);
	if (x === 0)
	{
		pageOpts.minlevel.value = "any";
	}
	else
	{
		pageOpts.minlevel.value = x;
	}
	
	pageOpts.trainerlevel.value = getRandomInt(0,30);
	
	x = getRandomInt(0,10);
	if (x === 0)
	{
		pageOpts.ratemodifierselect.value = "450";
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = 1/pageOpts.ratemodifierselect.value;
	}
	else if (x === 1)
	{
		pageOpts.ratemodifierselect.value = "75";
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = 1/pageOpts.ratemodifierselect.value;
	}
	else if (x === 2)
	{
		pageOpts.ratemodifierselect.value = "45";
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = 1/pageOpts.ratemodifierselect.value;
	}
	else if (x === 3)
	{
		pageOpts.ratemodifierselect.value = "35";
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = 1/pageOpts.ratemodifierselect.value;
	}
	else if (x === 4)
	{
		pageOpts.ratemodifierselect.value = "19";
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = 1/pageOpts.ratemodifierselect.value;
	}
	else if (x === 5)
	{
		pageOpts.ratemodifierselect.value = "24.5";
		pageOpts.ratemodifierinv.value = pageOpts.ratemodifierselect.value;
		pageOpts.ratemodifier.value = 1/pageOpts.ratemodifierselect.value;
	}
	else
	{
		x = getRandomArbitrary(0,1)
		pageOpts.ratemodifierselect.value = "custom";
	
		pageOpts.ratemodifier.value = x;
		pageOpts.ratemodifierinv.value = 1/x;
	}
	
	x = getRandomInt(0,3)
	if (x === 0)
	{
		pageOpts.chartmode.value = "single";
	}
	else if (x === 1)
	{
		pageOpts.chartmode.value = "area";
	}
	else if (x === 2)
	{
		pageOpts.chartmode.value = "pmf";
	}
	else if (x === 3)
	{
		pageOpts.chartmode.value = "cdf";
	}
	
	x = getRandomInt(0,10)
	pageOpts.pokemontoget.value = getRandomInt(0,Math.pow(10,x));
	
	x = getRandomInt(0,10)
	pageOpts.encounterstograph.value = getRandomInt(0,Math.pow(10,x));
}

function runRandomTests()
{
	var i;
	for (i=0; i < document.getElementById("numrandomtests").value; i++)
	{
		randomizeValid();
		runTest(`Random test ${i}`);
	}
}


function runTest(comment)
{
	console.log("Running test: " + comment);
	console.log(pageOpts);

	setPageOptions();
	processOptions();
	document.getElementById("testresults").innerHTML += `<br><br><span style="background-color:black;color:white">` +
														`Running <a style="color:white" href="${getUrlOptionString(true)}">test: ${comment}</a></span><br>`+
	                                                    `Chart mode:${pageOpts.chartmode.value} Appraisal:${pageOpts.appraisal.value} MinIVPercent:${pageOpts.minivpercent.value} `+
                                                        `MinAttackIv:${pageOpts.minattackiv.value} EncounterType:${pageOpts.encountertype.value} MinLevel:${pageOpts.minlevel.value} `+
														`TrainerLevel:${pageOpts.trainerlevel.value} RateModiferSelect:${pageOpts.ratemodifierselect.value} RateModifier:${pageOpts.ratemodifier.value} `+
														`RateModifierInv:${pageOpts.ratemodifierinv.value} PokemonToGet:${pageOpts.pokemontoget.value} EncountersToGraph:${pageOpts.encounterstograph.value}<br>`;
	var starttime = performance.now();
	calculate();

	var endtime = performance.now();
	if ((endtime-starttime) < document.getElementById("maxtime").value)
	{
		var elapsedtime = `<span style="background-color:green;color:white">${endtime-starttime} ms</span>`;
	}
	else
	{
		var elapsedtime = `<span style="background-color:red;color:white">${endtime-starttime} ms</span>`;
	}
	document.getElementById("testresults").innerHTML += `Finished in ${elapsedtime}<br>`;

}

function testValueData(row,column,expected)
{
	testValue(data.getValue(row,column),expected,`at row ${row.toString().padStart(4,"0")} col ${column.toString().padStart(2,"0")} `);
}

function testValue(value,expected,description)
{
	if (value === expected)
	{
		var testresult = `<span style="background-color:green;color:white;"> PASS </span>`;
	}
	else
	{
		var testresult = `<span style="background-color:red;color:white"> FAIL </span>`
	}
	document.getElementById("testresults").innerHTML += `${testresult} Test value ${description} --  Result:${value} Expected:${expected}<br>`;
}

function clearResults()
{
	document.getElementById("testresults").innerHTML = "";
}