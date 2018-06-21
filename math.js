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
function bigfactorial(n)
{
	if (n === 0)
	{
		return 1;
	}
	  
	var i;
	  
	var prod = new Decimal(1);
	  
	for (i = n; i > 0; i--)
	{
		prod = new Decimal(prod).times(i);
	}
	  
	return prod;
}


function bigchoose(n,k)
{
	var i;
	
	var prod = new Decimal(1);
	for (i = n; i > (n - k); i--)
	{
		prod = new Decimal(prod).times(i);
	}

	return new Decimal(prod).dividedBy(bigfactorial(k));
}


/*
 * Exceeds call stack
function bigchoose2(n,k)
{
	bign = new Decimal(n);
	bigk = new Decimal(k);
	
	var x;

	if (bigk.isZero()) //n choose 0 = 1
	{
		return 1;
	}
	if (bigk.gt(bign.div(2))) //n choose k == n choose n-k
	{
		x = new Decimal(bigchoose2(bign,bign.minus(k)));
	}
	else //n choose k == (n/k)*(n-1 choose k-1)
	{
		y = new Decimal(bigchoose(bign.minus(1),bigk.minus(1)));
		x = new Decimal(n).times(y).div(k)
	}
	//console.log(`BC n=${n.toString()} k=${k.toString()} x=${x.toString()}`);
	return x;
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
		//console.log("Overflow at choose n: " + n + " k: " + k + " p:" + prod + " f:" + factorial(k));
		//console.trace();
	}
	
	return prod/factorial(k);
}

function binompmf(k, n, p)
{
	if (k > n)
	{
		return 0;
	}
	else if (k > (n/2))
	{
		return binompmf(n-k,n,1-p); //Return the complement of the pmf for k>n/2
	}
	
	var x = new Decimal(bigchoose(n, k));
	var y = new Decimal(p).toPower(k);
	var z = new Decimal(1-p).toPower(n-k);
	
	return new Decimal(x).times(y).times(z).toNumber();
}

function binomcdf(k, n, p, begin)
{
	var sum = new Decimal(0);
	
	var i;
	var x,y,z;
	
	if (p > 0.5)
	{
		return 1-binomcdf(n-k-1,n,1-p,0); //Return the complement for p>0.5
	}
	
	for (i = begin; i <= Math.floor(k); i++)
	{
		/*
		var x = new Decimal(bigchoose(n, i));
		var y = new Decimal(p).toPower(i);
		var z = new Decimal(1-p).toPower(n-i);
		
		sum = new Decimal(x).times(y).times(z).plus(sum);
		*/
		sum = new Decimal(binompmf(i, n, p)).plus(sum);
	}
	
	return sum.toNumber();
	
}

function normalpdf(x,mean,variance)
{
	exponent = -(Math.pow((x-mean),2)/(2*variance));
	denominator = Math.sqrt(2*Math.PI*variance);
	
	return Math.pow(Math.E,exponent)/denominator;
}

/* Error function code based on Abramowitz and Stegun Formula 7.1.26
 * Based on public domain code at https://www.johndcook.com/blog/cpp_phi/
 */
function erf(x)
{
	var sign = 1;
	if (x < 0)
	{
		sign = -1;
	}
	x = Math.abs(x);
	
	var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;
	
	var t = 1/(1 + p*x);
	var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
	return sign * y;
}

function normalcdf(x,mean,variance)
{
	return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}