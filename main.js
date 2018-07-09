//Chart options
var chartOptions = {
	
	lineWidth: 4,
	
	animation: {
		duration: 1000,
		easing: 'in'
	},
	
	curveType: 'none',
	tooltip: { trigger: 'selection' }
};

/* Window resize handling */
var timer;
var chartDrawn = false;

var clientWidthOld = document.documentElement.clientWidth;
var clientHeightOld = document.documentElement.clientHeight;
window.addEventListener('resize', function(){
	
	if ((document.documentElement.clientWidth != clientWidthOld) ||	//Handle mobile resizes when the address bar appears or disappears
	    (document.documentElement.clientHeight > clientHeightOld + 200) || //That is, resize only on width changes or significant height changes.
		(document.documentElement.clientHeight < clientHeightOld - 200))
	{
		clientWidthOld = document.documentElement.clientWidth;
		clientHeightOld = document.documentElement.clientHeight;
		
		clearTimeout(timer);
		timer = setTimeout(function(){
			if (chartDrawn)
			{
				setChartArea();
				drawChart();
			}
			}, 500);
	}
});

/* History handling */
window.onpopstate = function(event) {
	if (getUrlOptions() == 0)
	{
		setPageOptions();
		processOptions();
		// Set a timeout of 0 to push the calculation into the queue and let the spinner update on the page
		setTimeout(function(){
			calculate();
			}, 0);
	}
};
	
function drawChart() {
	// Disable the button while the chart is drawing.
	var button = document.getElementById('calcbutton');
	button.disabled = true;
	google.visualization.events.addListener(chartWrapper, 'ready',
		function() {
		button.disabled = false;
		
		//Turn off the loading spinners
		document.getElementById("calculatingspinner").style.display = "none";
		document.getElementById("loadingoverlay").style.display = "none";
		
		document.getElementById('description').style.display = "none";
		document.getElementById('results').style.display = "block";
	});
	
	//Clear the chart if it has been drawn already
	if (chartWrapper.getChart())
	{
		chartWrapper.getChart().clearChart();
	}
	chartDrawn = true;
	chartWrapper.draw();
}

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(init);

/*
window.onload = function()
{
}
*/

function addTooltip()
{
	chartWrapper.getChart().setAction({
		id: 'showpmf',
		text: 'Show PMF at this number of encounters',
		visible: function() {
			var selection = chartWrapper.getChart().getSelection();
			if (selection.length > 0)
			{
				if (selection[0].row > 0)
				{
					return true;
				}
			}
			return false;
		},
		action: function() {
			var selection = chartWrapper.getChart().getSelection();
			pageOpts.encounterstograph.setValue(data.getValue(selection[0].row,0));
			pageOpts.chartmode.setValue("pmf");
			setPageOptions();
			processOptions();
			setUrlOptions();
			calculate();
		}
	});
	
	chartWrapper.getChart().setAction({
		id: 'showcdf',
		text: 'Show 1-CDF at this number of encounters',
		visible: function() {
			var selection = chartWrapper.getChart().getSelection();
			if (selection.length > 0)
			{
				if (selection[0].row > 0)
				{
					return true;
				}
			}
			return false;
		},
		action: function() {
			selection = chartWrapper.getChart().getSelection();
			pageOpts.encounterstograph.setValue(data.getValue(selection[0].row,0));
			pageOpts.chartmode.setValue("cdf");
			setPageOptions();
			processOptions();
			setUrlOptions();
			calculate();
		}
	});
}

function resetClick()
{
	resetOptionDefaults();
	resetUrlOptions();
	setPageOptions();
	processOptions();
	
}

function calculateClick()
{
	getPageOptions();
	if (!validateOptions());
	{
		//Save the options for this chart in the URL
		setUrlOptions(true);
		setPageOptions();
	}
	
	// Start the loading spinner
	document.getElementById("calculatingspinner").style.display = "block";
	
	// Set a timeout of 0 to push the calculation into the queue and let the spinner update on the page
	setTimeout(function(){
      	calculate();
    }, 0);

}

var width, height, heightpercent;
/* Set chart area.
 * Call this during init.
 * Don't call during button press to prevent virtual-keyboard size changes on mobile.
 * Don't call on window resize?
 */
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
	  height = Math.max((height - 300),(width/2.5));
	}
	
	// Decrease chart area to fit the title if it spans two lines
	
	if (width < 1000)
	{
	  heightpercent = '70%';
	  widthpercent = '75%';
	}
	else
	{
	  heightpercent = '85%';
	  widthpercent = '90%';
	}
	
	//Reset these in calculate() as well.
	chartOptions.width = "90%";
	chartOptions.height = height;
	chartOptions.chartArea = {width:widthpercent,height:heightpercent};
}
	
var chartWrapper;
function init()
{
	chartWrapper = new google.visualization.ChartWrapper({'containerId':'visualization'});
	
	
	setChartArea();
	
	resetOptionDefaults();
	setPageOptions();
	
	getUrlOptions();

}