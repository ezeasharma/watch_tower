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
		if(!error && response.statusCode == 200)
			success(body);
		else
			fail(error);
	})
};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html') 
});

app.get('/Rules', function(req, res){
	var rules = new Array();
	rules.push({Name : "MarketValueRule" , Description : "MarketValue should be more than 100", Expression : "alloc.Amount * price.Last > 100"});
	rules.push({Name : "PortfolioExposureRule" , Description : "Portfolio Exposure should not be greater than 100m", Expression : "alloc.Amount * price.Last + portfolio.Exposure< 100"});
	rules.push({Name : "RestrictedSecurityRule" , Description : "Cannot trade symbol IBM", Expression : 'alloc.Symbol != "IBM"'});
	res.send(rules);
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
	console.log(req.body.Action + req.body.Amount, req.body.Symbol + req.body.Portfolio)
	var success = function(result)
	{
		res.json(JSON.parse(result));
	};
	var fail = function(error)
	{
		res.status(400);
	}
	getStockPrice(req.body.Symbol, success, fail);
});

app.listen(3000, function(){
	console.log('Server started at ' + 3000);
});