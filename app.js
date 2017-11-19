const express = require('express');
var fs = require('fs');
var request = require('request')

// Bitfinex API URL
var bitfinex_url = "https://api.bitfinex.com/v1"

// Kraken API URL
var kraken_url = "https://api.kraken.com/0/public/"

var bitfinexToKrakenSymbol = {
    'btcusd': 'XBTUSD',
    'ltcusd': 'LTCUSD',
	'ethusd': 'ETHUSD',
	'etcbtc': 'ETHXBT'
};



// Create express server
const app = express();
// Listen to port 3000
app.listen(3000);

// Set files in the public folder to be static
app.use(express.static("public"));

// Set URL routing
app.get('/amount', function (req, res) {
    retrieveData(req, res, 0);
});

app.get('/price', function (req, res) {
    retrieveData(req, res, 1);
});

function retrieveData(req, res, type)
{
    //use as bar value in bar graph
    var values1 = [];
    var values2 = [];

    // Use as x axis labels in the bar graph
    var xlabels1 = [];
    var xlabels2 = [];

    var step = 0;

    // Call Bitfinex API to get trading data
    request.get(bitfinex_url + "/trades/"+req.query.symbol,
    function(error, response, body) {

		var map = new Object();
	
		// Decode the JSON data from Bitfinex
		var jsonData = JSON.parse(body); 
		for (var i = 0; i < jsonData.length; i++) {
			
			var key = jsonData[i].timestamp;
			
			// If type is 0, we analyze the trading amount, otherwise, we analyze the trading price
			var data = ((type == 0)?jsonData[i].amount:jsonData[i].price);
			
			// Sum up the data values into a map
			if (!(key in map))
			{
				map[key] = parseFloat(data);
			}
			else
			{
				map[key] += parseFloat(data);
			}
		}
	
		// Set the time range for data we want to analyze
		var dataInSeconds = 20;

		// Push the map values into an array for bar graph to display
		for (i = jsonData[0].timestamp-dataInSeconds; i <= jsonData[0].timestamp; i++) {
		if(i in map)
			{
				values1.push(map[i]);
			}
			else
			{
				values1.push("0");
			}
			
			// Set x labels to be the time string
			var date = new Date(i*1000);
			var datetext = date.toTimeString();
			datetext = datetext.split(' ')[0];
			xlabels1.push(datetext);
		}

		step++;
		renderTradingBarGraph(req, res, type, values1, xlabels1, values2, xlabels2, step);
	
    });
	
	if(req.query.symbol in bitfinexToKrakenSymbol)
	{
		var krakenSymbol = bitfinexToKrakenSymbol[req.query.symbol];

		// Call Kraken API to get trading data
		request.get(kraken_url + "/Trades?pair="+krakenSymbol,
		function(error, response, body) {

			var map = new Object();
			var max = 0;

			// Decode the JSON data from Kraken
			var symbol = "X" + krakenSymbol.substring(0,3) + "Z" + krakenSymbol.substring(3,6);
			var jsonData = JSON.parse(body); 
			
			if (!(symbol in jsonData.result))
			{
				res.send("Server is busy now. Please try again!");
				
			}
			else
			{
			
				var jsonResult = jsonData.result[symbol];

				for (var i = jsonResult.length-1; i > jsonResult.length-100; i--) {
			
					var jsonArray = jsonResult[i];
					var key = Math.round(jsonArray[2]);
					if(key > max) max = key;//timestamp
					
					// If type is 0, we analyze the trading amount, otherwise, we analyze the trading price
					var data = ((type == 0)?jsonArray[1]:jsonArray[0]);
					
					// Sum up the data values into a map
					if (!(key in map))
					{
						map[key] = parseFloat(data);
					}
					else
					{
						map[key] += parseFloat(data);
					}
				}

				
				// Set the time range for data we want to analyze
				var dataInSeconds = 20;

				// Push the map values into an array for bar graph to display
				for (i = max-dataInSeconds; i <= max; i++) {
					if(i in map)
					{
						values2.push(map[i]);
					}
					else
					{
						values2.push("0");
					}
					
					// Set x labels to be the time string
					var date = new Date(i*1000);
					var datetext = date.toTimeString();
					datetext = datetext.split(' ')[0];
					xlabels2.push(datetext);
				}

				step++;
				renderTradingBarGraph(req, res, type, values1, xlabels1, values2, xlabels2, step);
			}
		});
	}
	else
	{
		res.send("invalid symbol!");
		
	}
	
}

function renderTradingBarGraph(req, res, type, val1, xlab1, val2, xlab2, step)
{
	if(step == 2)
	{
		//set header
        headerText = ((type == 0)?'Trade Amount Data':'Trade Price Data');
		
		fs.readFile('./public/bar-graph-template.html',function(error, content){ 
			if(error){
				console.log('file read error');
			}
			else {
				var rendered = content.toString().replace('#title#', 'Bitfinex Data Analysis')
                            .replace('#header#', headerText)
                            .replace('#valueData1#', val1.toString())
                            .replace('#xLabelData1#', xlab1.toString())
							.replace('#valueData2#', val2.toString())
                            .replace('#xLabelData2#', xlab2.toString());
                res.send(rendered);
			}
		});
	}
}