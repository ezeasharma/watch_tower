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
	var complianceResultRowTemplate = '<tr data-Id="{Rule}"><td>{Rule}</td><td>{Result}</td></tr>';
	var complianceResultTableTemplate    = '<table class="pure-table" id="complianceResultTable"><thead><tr><th>Rule</th><th>Result</th></thead></table>';
	
	var stockTableRowTemplate = '<tr data-Id="{Symbol}"><td>{Symbol}</td><td>{Name}</td><td>{LastPrice}</td><td>{Change}</td><td>{ChangePercent}</td><td>{Volume}</td><td>{ChangeYTD}</td><td>{High}</td><td>{Low}</td><td>{Open}</td></tr>';
	var stockTableTemplate    = '<table class="pure-table" id="stockDetailsTable"><thead><tr><th>Symbol</th><th>Name</th><th>LastPrice</th><th>Change</th><th>ChangePercent</th><th>Volume</th><th>ChangeYTD</th><th>High</th><th>Low</th><th>Open</th></tr></thead></table>';
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
		$.post("/Compliance", {Symbol : sym, Amount : amount, Portfolio : portfolio, Action : action})
		.done(function(data) {
    		populateResultUi(data);
  		})
  		.fail(function(xhr) {
			console.log(xhr);
    		alert(xhr.status + ' ' + xhr.responseText);
  		});
	});
	
	$('#rulesSelection').change(function(){
		if(typeof(rules) == 'undefined')
			return;
		var name = $( "#rulesSelection option:selected" ).text();
				
		if(typeof(expressionDiv) == "undefined"){
			expressionDiv = $('#expression_div');
			expressionDiv.html('<label>Expression: </label>' +
							'<input type="text" id="expressionTextBox" value="" class="pure-input-rounded"/>' +
							'<button type="button" id="updateButton" class="button-success pure-button">Update</button>');
			var updateButton = $('#updateButton');
			updateButton.click(function(){
				updateRule();
			});
		}
	
		for(var i = 0; i < rules.length; i++)
		{
			if(rules[i].Name == name)
			{
				$('#descriptionTag').text('Description: ' + rules[i].Description);
				var expressionTextBox = $('#expressionTextBox');
				expressionTextBox.val(rules[i].Expression);
			}
		}
	});
	
	function updateRule()
	{
		var name = $( "#rulesSelection option:selected" ).text();
		var expression = $('#expressionTextBox').val();
		$.post("/Rules", {Name : name, Expression : expression})
		.done(function(data) {
			$('#expressionTextBox').val(expression);
			for(var i = 0; i < rules.length; i++)
			{
				if(rules[i].Name == name)
					rules[i].Expression = expression;
			}
		})
  		.fail(function(xhr) {
			console.log(xhr);
    		alert(xhr.status + ' ' + xhr.responseText);
  		});
	}
	
	function populateResultUi(data)
	{
		stockTableDiv = $('#stockDiv');
		stockTableDiv.empty();
		stockTableDiv.html(stockTableTemplate);
		var stockTable = $('#stockDetailsTable');
		var rowData = stockTableRowTemplate.supplant(data.Price);
		//var row = stockTable.find('tr[data-Id=' + this.Id + ']');
		stockTable.append(rowData);
		
		var complianceResultDiv = $('#complianceResultsDiv');
		complianceResultDiv.empty();
		complianceResultDiv.html(complianceResultTableTemplate);
		var complianceTable = $('#complianceResultTable');
		for(var i = 0; i < data.ComplianceResults.length; i++)
		{
			complianceTable.append(complianceResultRowTemplate.supplant(data.ComplianceResults[i]));
			if(data.ComplianceResults[i].Result.toUpperCase() == "FAIL")
			{
				var row = complianceTable.find('tr[data-Id=' + data.ComplianceResults[i].Rule + ']');
				row.css("background-color", "#cd5c5c");
			}
		}
	}
});