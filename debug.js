window.onload = function()
{
	document.getElementById("title").innerHTML = "DEBUG";
	document.body.style.backgroundColor = "#FF6666";
	document.getElementsByClassName("content")[0].style.backgroundColor = "#FF6666";
	document.getElementById("chart_mode").innerHTML += `<option value="normalpdf">Normal PDF</option><option value="normalcdf">Normal CDF</option>`;
}