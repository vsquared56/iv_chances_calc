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
window.addEventListener('resize', function(){
	clearTimeout(timer);
	timer = setTimeout(function(){
		if (chartDrawn)
		{
			drawChart();
		}
		}, 500);
	});

function drawChart() {
	// Disable the button while the chart is drawing.
	var button = document.getElementById('b1');
	button.disabled = true;
	google.visualization.events.addListener(chart, 'ready',
		function() {
		button.disabled = false;
		
		//Turn off the loading spinners
		document.getElementById("calculatingspinner").style.display = "none";
		document.getElementById("loadingoverlay").style.display = "none";
	});
	
	//Clear the chart if it has been drawn already
	if (chart.getChart())
	{
		chart.getChart().clearChart();
	}
	chartDrawn = true;
	chart.draw();
}

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(init);

/*
window.onload = function()
{
}
*/


function resetClick()
{
	resetOptionDefaults();
	resetUrlOptions();
	setPageOptions();
	processOptions();
	
}

function calculateClick()
{
	// Start the loading spinner
	document.getElementById("calculatingspinner").style.display = "block";
	
	// Set a timeout of 0 to push the calculation into the queue and let the spinner update on the page
	setTimeout(function(){
      	calculate();
    }, 0);

}

var width, height, heightpercent;
var chart;
function init()
{
	chart = new google.visualization.ChartWrapper({'containerId':'visualization'});
	
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
		  widthpercent = '80%';
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
	
	setChartArea();
	
	resetOptionDefaults();
	if (getUrlOptions() == 0)
	{
		setPageOptions();
	}

}