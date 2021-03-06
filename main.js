var express = require('express');
var app = express();
app.use(express.static(__dirname));
var bodyParser = require('body-parser');
var request = require('request');

var getStockPrice = function (ticker, success, fail)
{
	var options = {
  		url: 'http://dev.markitondemand.com/Api/v2/Quote/json?Symbol=' + ticker,
  		method: 'POST',
    }
	request.post(options, function(error, response, body){
		console.log(typeof(body));
		console.log(body);
		if(!error && response.statusCode == 200 && body.indexOf('No symbol matches found for') == -1)
			success(body);
		else
			fail(error);
	});
};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

var complianceRules = new Array();
complianceRules.push({Name : "Market_Value_Rule" , Description : "Trade only when marketValue should be more than 10000", Expression : "alloc.Amount * price.LastPrice > 10000"});
complianceRules.push({Name : "Volume_Rule" , Description : "Trade only when Volume is greater then 200000", Expression : " price.Volume > 200000"});
complianceRules.push({Name : "Restricted_Security_Rule" , Description : "Cannot trade symbol IBM", Expression : 'alloc.Symbol != "IBM"'});
complianceRules.push({Name : "Restricted_Portfolio_Symbol_Rule", Description: "Ashish cannot trade AAPL", Expression : '!(alloc.Symbol == "AAPL" && alloc.Portfolio == "Ashish")'})
	

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html') 
});

app.get('/Rules', function(req, res){
	res.send(complianceRules);
});

app.post('/Rules', function(req, response){
	console.log('Update request for ' + req.body.Name + " " + req.body.Expression);
	for(var i = 0; i < complianceRules.length; i++)
	{
		if(complianceRules[i].Name == req.body.Name)
		{
			complianceRules[i].Expression = req.body.Expression;
		}
	}
	response.send(complianceRules);
});

app.get('/Portfolios', function(req, response)
{
	var portfolios = [];
	portfolios.push({Name : "Ashish"});
	portfolios.push({Name : "James"});
	portfolios.push({Name : "Rob"});
	portfolios.push({Name : "Roman"});
	portfolios.push({Name : "Ranjith"});
	response.send(portfolios);		
});

app.post('/Compliance', function(req, res){
	console.log(req.body.Action + req.body.Amount, req.body.Symbol + req.body.Portfolio);
	var success = function(result)
	{
		var price = JSON.parse(result);
		var expressionFunctionTemplate = 'return #;'
		var complianceResults=[];
		for(var i = 0; i < complianceRules.length; i++)
		{
			var expression = complianceRules[i].Expression;
			var functionExpressionAsString = expressionFunctionTemplate.replace('#', expression);
			console.log(functionExpressionAsString);
			var functionExpression = new Function('alloc', 'price', 'portfolio', functionExpressionAsString);
			var alloc = {Amount : req.body.Amount, Symbol : req.body.Symbol.toUpperCase(), Portfolio : req.body.Portfolio, Action : req.body.Action};
			var resultStatus = "Fail";
			if(functionExpression(alloc, price, {}))
				resultStatus = "Pass";
			complianceResults.push({Rule : complianceRules[i].Name, Result : resultStatus});
		}
		res.json({ComplianceResults : complianceResults, Price : price});
	};
	var fail = function(error)
	{
		console.log('calling fail ' + error);
		res.status(400).send('Symbol Not found');
	}
	getStockPrice(req.body.Symbol, success, fail);
});

app.listen(3000, function(){
	console.log('Server started at ' + 3000);
});