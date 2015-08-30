// A simple templating method for replacing placeholders enclosed in curly braces.
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

$(function(){
	var rules = undefined;
	var headingTag = $('#headingTag');
	headingTag.text("Welcome to Watch Tower!");
	var expressionDiv = undefined;
	var stockTableDiv = undefined;
	
	var stockTableRowTemplate = '<tr data-Id="{Symbol}"><td>{Symbol}</td><td>{Name}</td><td>{LastPrice}</td><td>{Change}</td><td>{ChangePercent}</td><td>{Volume}</td><td>{ChangeYTD}</td><td>{High}</td><td>{Low}</td><td>{Open}</td></tr>';
	var stockTableTemplate    = '<table class="pure-table" id="stockDetailsTable"><thead><tr><th>Symbol</th><th>Name</th><th>LastPrice</th><th>Change</th><th>ChangePercent</th><th>Volume</th><th>ChangeYTD</th><th>High</th><th>Low</th><th>Open</th></tr></thead>'
	$.get("/Rules", function(data){
		rules = data;
		var rulesSelection = $('#rulesSelection');
		rulesSelection.attr('size', data.length );
		rulesSelection.empty();
		for(var i = 0; i < data.length; i++)
		{
			rulesSelection.append(new Option(data[i].Name, data[i].Name, false, false));
		}
	}).fail(function(){
		console.log('Error getting rules.')
	});
	
	$.get("/Portfolios", function(data){
		var portfolioSelect = $('#portfolioSelect');
		portfolioSelect.empty();
		for(var i = 0; i < data.length; i++)
		{
			portfolioSelect.append(new Option(data[i].Name, data[i].Name, false, false));
		}
	}).fail(function(){
		console.log('Error getting rules.')
	});
	
	
	$('#checkComplainceButton').click(function(){
		var sym = $('#symbolTextBox').val();
		var amount = $('#amountTextBox').val();
		var portfolio = $('#portfolioSelect').val();
		var action = $('#actionSelectDropdown').val();
		$.post("/Compliance", {Symbol : sym, Amount : amount, Portfolio : portfolio, Action : action}, function(data){
			console.log(data);
			console.log(data.Symbol);
			stockTableDiv = $('#stockDiv');
			stockTableDiv.empty();
			stockTableDiv.html('<table class="pure-table" id="stockDetailsTable"><thead><tr><th>Name</th><th>Symbol</th><th>LastPrice</th><th>Change</th><th>ChangePercent</th><th>Volume</th><th>ChangeYTD</th><th>High</th><th>Low</th><th>Open</th></tr></thead>')
			var stockTable = $('#stockDetailsTable');
			var rowData = stockTableRowTemplate.supplant(data);
			//var row = stockTable.find('tr[data-Id=' + this.Id + ']');
			stockTable.append(rowData);
		});
	});
	
	
	var expressionFunctionTemplate = 'return #;'  
	function TestExpression()
	{
		var expression = $('#expressionTextBox').val();
		var functionExpressionAsString = expressionFunctionTemplate.replace('#', expression);
		var functionExpression = new Function('alloc', 'price', 'portfolio', functionExpressionAsString);
		var result = functionExpression({Amount : 10}, {Last : 11}, {});
		alert(result);
	}
	
	$('#rulesSelection').change(function(){
		if(typeof(rules) == 'undefined')
			return;
		var description = $( "#rulesSelection option:selected" ).text();
		for(var i = 0; i < rules.length; i++)
		{
			if(rules[i].Name == description)
			{
				$('#descriptionTag').text('Description: ' + rules[i].Description);
				$('#descriptionTestBox').text("Some expression");
				if(typeof(expressionDiv) == "undefined"){
					expressionDiv = $('#expression_div');
					expressionDiv.html('<label>Expression: </label>' +
									'<input type="text" id="expressionTextBox" value="" class="pure-input-rounded"/>' +
									'<button type="button" id="updateButton" class="button-success pure-button">Update</button>');
					var updateButton = $('#updateButton');
					updateButton.click(function(){
						TestExpression();
					});
				}
				var expressionTextBox = $('#expressionTextBox');
				expressionTextBox.val(rules[i].Expression);
				expressionTextBox.attr('size', "100");
			}
		}
	});
});