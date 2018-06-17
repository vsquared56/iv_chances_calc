//Chart options
var options = {
	
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
// Disabling the button while the chart is drawing.
	var button = document.getElementById('b1');
	button.disabled = true;
	google.visualization.events.addListener(chart, 'ready',
		function() {
		button.disabled = false;
	});
	chartDrawn = true;
	chart.draw(data, options);
}

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(init);

function init()
{
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
	
	setChartArea();
}