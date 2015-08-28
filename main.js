var express = require('express');

var app = express();
var port = process.env.PORT || 3000;

app.get('/', function(request, response, next){
	response.send('Welcome to Watch Tower!');
});


app.listen(port, function(){
	console.log('Server started at port ' + port)
})