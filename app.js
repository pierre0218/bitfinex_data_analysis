const express = require('express');
var fs = require('fs');
var request = require('request')

// Bitfinex API URL
var bitfinex_url = "https://api.bitfinex.com/v1"

// Kraken API URL
var kraken_url = "https://api.kraken.com/0/public/"

// Create express server
const app = express();
// Listen to port 3000
app.listen(3000);

// Set files in the public folder to be static
app.use(express.static("public"));

// Set URL routing
app.get('/amount', function (req, res) {
    renderTradingBarGraph(req, res, 0);
});

app.get('/price', function (req, res) {
    renderTradingBarGraph(req, res, 1);
});

function renderTradingBarGraph(req, res, type)
{
    //use as header in header1 and header2
    var headerText1,headerText2;

    //use as bar value in bar graph
    var values1,values2;

    // Use as x axis labels in the bar graph
    var xlabels1,xlabels2;

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

        //set header1
        headerText1 = ((type == 0)?'Trade Amount Data':'Trade Price Data');
    });

    // Call Kraken API to get trading data
    request.get(kraken_url + "/Trades?pair="+req.query.symbol,
    function(error, response, body) {
        var map = new Object();
        var max = 0;

        // Decode the JSON data from Kraken
        var symbol = "X" + req.query.symbol.substring(0,3).toUpperCase() + "Z" + req.query.symbol.substring(3,6).toUpperCase()
        var jsonData = JSON.parse(body); 
        var jsonResult = jsonData.result[symbol];
        for (var i = 0; i < jsonResult.length; i++) {
    
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

        // Render bar graph with html
        headerText2 = ((type == 0)?'Trade Amount Data Comparison':'Trade Price Data Comparison');
    });

    fs.readFile('./public/bar-graph-template.html',function(error, content){ 
        if(error){
            console.log('file read error');
        }
        else {
            var rendered = content.toString().replace('#title#', 'Bitfinex Data Analysis')
                            .replace('#header#', header1Text)
                            .replace('#valueData#', values1.toString()).replace('#xLabelData#', xlabels1.toString())
                            .replace('#header1#', header2Text)
                            .replace('#value1Data#', values2.toString()).replace('#xLabel1Data#', xlabels2.toString());
            res.send(rendered);
        }
    }
}