window.onload = function()
{
	document.getElementById("title").innerHTML = "DEBUG";
	document.body.style.backgroundColor = "yellow";
	document.getElementsByClassName("content")[0].style.backgroundColor = "yellow";
	document.getElementById("chart_mode").innerHTML += `<option value="normalpdf">Normal PDF</option><option value="normalcdf">Normal CDF</option>`;
	document.getElementsByClassName("options")[0].innerHTML = `<div class="optioncategory"><div class="optionentry"><div class="optiondescription">DEBUG</div>` +
							                                  `<button type="button" onclick="runCalcTest()">Test Calculations</button>` +
															  `<button type="button" onclick="runMathTest()">Test Math</button>` +
															  `<button type="button" onclick="randomizevalid()">Random Valid Options</button>` +
															  `<button type="button" onclick="randomizeoptions()">Randomize Options</button>` +
															  `</div></div>` +
                                                              document.getElementsByClassName("options")[0].innerHTML;
	document.getElementsByClassName("content")[0].innerHTML += `<div id="testresults" style="font-family: 'Courier New', Courier"></div>`;
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

function randomizevalid()
{
	do {randomize();} while(validateOptions())
	setPageOptions();
}

function randomizeoptions()
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
		pageopts.appraisal = "best";
		pageopts.minivpercent = 82.2;
	}
	else if (x === 1)
	{
		pageopts.appraisal = "good";
		pageopts.minivpercent = 66.7;
	}
	else if (x === 2)
	{
		pageopts.appraisal = "aboveaverage";
		pageopts.minivpercent = 51.1;
	}
	else if (x === 3)
	{
		pageopts.appraisal = "any";
		pageopts.minivpercent = 0;
	}
	else
	{
		pageopts.appraisal = "other"
		pageopts.minivpercent = getRandomArbitrary(0,100);
	}

	
	x = getRandomInt(0,16);
	{
		if (x === 16)
		{
			pageopts.minattackiv = "any";
		}
		else
		{
			pageopts.minattackiv = x;
		}
	}
	
	x = getRandomInt(0,2);
	if (x === 0)
	{
		pageopts.encountertype = "normal";
	}
	else if (x === 1)
	{
		pageopts.encountertype = "boosted";
	}
	else if (x === 2)
	{
		pageopts.encountertype = "raid";
	}
	
	x = getRandomInt(0,35);
	if (x === 0)
	{
		pageopts.minlevel = "any";
	}
	else
	{
		pageopts.minlevel = x;
	}
	
	pageopts.trainerlevel = getRandomInt(0,30);
	pageopts.ratemodifierselect = "custom";
	
	x = getRandomArbitrary(0,1)
	pageopts.ratemodifier = x;
	pageopts.ratemodifierinv = 1/x;
	
	x = getRandomInt(0,3)
	if (x === 0)
	{
		pageopts.chartmode = "single";
	}
	else if (x === 1)
	{
		pageopts.chartmode = "area";
	}
	else if (x === 2)
	{
		pageopts.chartmode = "pmf";
	}
	else if (x === 3)
	{
		pageopts.chartmode = "cdf";
	}
	
	x = getRandomInt(0,10)
	pageopts.pokemontoget = getRandomInt(0,Math.pow(10,x));
	
	x = getRandomInt(0,10)
	pageopts.encounterstograph = getRandomInt(0,Math.pow(10,x));
}



function runCalcTest()
{
	pageopts = {	appraisal:"best",
					minivpercent:"82.2",
					minattackiv:"any",
					encountertype:"normal",
					minlevel:"any",
					trainerlevel:30,
					ratemodifierselect:"1",
					ratemodifier:"1.000000000",
					ratemodifierinv:1,
					pokemontoget:1,
					chartmode:"single",
					encounterstograph:encountersToGraphDefaultNonRaid
				};
	resetOptionDefaults();

	runTest();
	testValueData(0,1,0);
	testValueData(10,1,33.712604034834634);
	testValueData(100,1,98.36201626393432);
	
	pageopts.appraisal = "good";
	pageopts.minivpercent = "66.7";

	runTest();
	testValueData(0,1,0);
	testValueData(10,1,83.7228209606438);
	testValueData(100,1,99.99999869445632);
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

}

function runTest()
{
	document.getElementById("testresults").innerHTML += `<br><br><span style="background-color:black;color:white">Running test:</span> `+
	                                                    `Chart mode:${pageopts.chartmode} Appraisal:${pageopts.appraisal} MinIVPercent:${pageopts.minivpercent} `+
                                                        `MinAttackIv:${pageopts.minattackiv} EncounterType:${pageopts.encountertype} MinLevel:${pageopts.minlevel} `+
														`TrainerLevel:${pageopts.trainerlevel} RateModiferSelect:${pageopts.ratemodifierselect} RateModifier:${pageopts.ratemodifier} `+
														`RateModifierInv:${pageopts.ratemodifierinv} PokemonToGet:${pageopts.pokemontoget} EncountersToGraph:${pageopts.encounterstograph}<br>`;
	setPageOptions();
	var starttime = performance.now();
	calculate();

	var endtime = performance.now();
	document.getElementById("testresults").innerHTML += `Finished in ${endtime-starttime} ms<br>`;

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