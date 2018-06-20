function factorial(n)
{
	  if (n === 0)
	  {
		  return 1;
	  }
	  
	  var i;
	  
	  var prod = 1;
	  
	  for (i = n; i > 0; i--)
	  {
		  prod = prod * i;
	  }
	  
	  return prod;
}

/*function choose(n, k)
{
	return factorial(n)/(factorial(k)*factorial(n-k));
}
*/

function choose(n,k)
{
	var i,prod;
	
	prod = 1;
	for (i = n; i > (n - k); i--)
	{
		prod *= i;
	}
	
	if (!isFinite(prod) || !isFinite(factorial(k)))
	{
		console.log("Overflow at choose n: " + n + " k: " + k + " p:" + prod + " f:" + factorial(k));
		console.trace();
	}
	
	return prod/factorial(k);
}

function binompmf(k, n, p)
{
	return (choose (n, k) * Math.pow(p, k) * Math.pow((1 - p), (n - k)));
}

function binomcdf(k, n, p)
{
	var sum = 0;
	
	for (i = 0; i <= Math.floor(k); i++)
	{
		  sum += (choose(n, i) * Math.pow(p, i) * Math.pow((1 - p), (n - i)));
	}
	
	/*
	for (i = 0; i <= Math.floor(k); i++)
	{
		  sum += (choose(n, i));
	}*/
	
	return sum;
}