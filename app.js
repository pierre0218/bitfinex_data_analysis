const express = require('express');
var fs = require('fs');
var request = require('request')

//bitfinex api url
var bitfinex_url = "https://api.bitfinex.com/v1"


const app = express(); //create express server
app.listen(3000); //listen to port 3000

//set files in the public folder to be static
app.use(express.static("public"));

app.get('/amount', function (req, res) {
	request.get(bitfinex_url + "/trades/"+req.query.symbol,
	  function(error, response, body) {
		
		fs.readFile('./public/bar-graph-template.html',function(error, content){ // read html template
		if(error){ //handle error
			console.log('file read error');
		}
		else {
			
			
			var map = new Object();
		
			var jsonData = JSON.parse(body);
			for (var i = 0; i < jsonData.length; i++) {
				
				var key = jsonData[i].timestamp;
				
				if (!(key in map))
				{
					map[key] = parseFloat(jsonData[i].amount);
				}
				else
				{
					map[key] += parseFloat(jsonData[i].amount);
				}
			}
	   
		   var dataInSeconds = 20;
		   var xlabels = [];
		   var values = [];

		   for (i = jsonData[0].timestamp-dataInSeconds; i <= jsonData[0].timestamp; i++) {
			   if(i in map)
			   {
				   values.push(map[i]);
			   }
			   else
			   {
				   values.push(0);
			   }

			   var date = new Date(i*1000);
			   var datetext = date.toTimeString();
			   datetext = datetext.split(' ')[0];
			   xlabels.push(datetext);

			}
			

			var rendered = content.toString().replace('#title#', 'Bitfinex Data Analysis')
							.replace('#header#', 'Trade Amount Data').replace('#data#', body)
							.replace('#valueData#', values.toString()).replace('#xLabelData#', xlabels.toString());
			res.send(rendered);
		}
	});
		
	});
});

app.get('/price', function (req, res) {
	request.get(bitfinex_url + "/trades/"+req.query.symbol,
	  function(error, response, body) {
		
		fs.readFile('./public/bar-graph-template.html',function(error, content){ // read html template
		if(error){ //handle error
			console.log('file read error');
		}
		else {
			
			var map = new Object();
		
			var jsonData = JSON.parse(body);
			for (var i = 0; i < jsonData.length; i++) {
				
				var key = jsonData[i].timestamp;
				
				if (!(key in map))
				{
					map[key] = parseFloat(jsonData[i].price);
				}
				else
				{
					map[key] += parseFloat(jsonData[i].price);
				}
			}
	   
		   var dataInSeconds = 20;
		   var xlabels = [];
		   var values = [];

		   for (i = jsonData[0].timestamp-dataInSeconds; i <= jsonData[0].timestamp; i++) {
			   if(i in map)
			   {
				   values.push(map[i]);
			   }
			   else
			   {
				   values.push("0");
			   }
			   
			   var date = new Date(i*1000);
			   var datetext = date.toTimeString();
			   datetext = datetext.split(' ')[0];
			   xlabels.push(datetext);

			}

			var rendered = content.toString().replace('#title#', 'Bitfinex Data Analysis')
							.replace('#header#', 'Trade Price Data').replace('#data#', body)
							.replace('#valueData#', values.toString()).replace('#xLabelData#', xlabels.toString());
			res.send(rendered);
		}
	});
		
	});
});