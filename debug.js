window.onload = function()
{
	document.getElementById("title").innerHTML = "DEBUG";
	document.body.style.backgroundColor = "#FF6666";
	document.getElementsByClassName("content")[0].style.backgroundColor = "#FF6666";
	document.getElementById("chart_mode").innerHTML += `<option value="normalpdf">Normal PDF</option><option value="normalcdf">Normal CDF</option>`;
	document.getElementsByClassName("options")[0].innerHTML = `<div class="optioncategory"><div class="optionentry"><div class="optiondescription">DEBUG</div>` +
							                                  `<button type="button" id="b3" onclick="testClick()">Test</button>` +
															  `<button type="button" id="b4" onclick="randomizevalid()">Random Valid Options</button>` +
															  `<button type="button" id="b5" onclick="randomizeoptions()">Randomize Options</button>` +
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
	pageopts.appraisal = "other"
	pageopts.minivpercent = getRandomArbitrary(0,100);
	
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



function testClick()
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
	testValue(0,0);
	testValue(10,33.712604034834634);
	testValue(100,98.36201626393432);
	
	pageopts.appraisal = "good";
	pageopts.minivpercent = "66.7";

	runTest();
	testValue(0,0);
	testValue(10,83.7228209606438);
	testValue(100,99.99999869445632);
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

function testValue(row,expected)
{
	if (data.getValue(row,1) === expected)
	{
		var testresult = `<span style="background-color:green;color:white;"> PASS </span>`;
	}
	else
	{
		var testresult = `<span style="background-color:red;color:white"> FAIL </span>`
	}
	document.getElementById("testresults").innerHTML += `Test value at row ${row.toString().padStart(4,"0")} -- ${testresult} Result:${data.getValue(row,1)} Expected:${expected}<br>`;
}