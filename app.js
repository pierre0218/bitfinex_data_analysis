const express = require('express');
var fs = require('fs');
var request = require('request')

// Bitfinex API URL
var bitfinex_url = "https://api.bitfinex.com/v1"

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
    // Call Bitfinex API to get trading data
    request.get(bitfinex_url + "/trades/"+req.query.symbol,
    function(error, response, body) {
        
        // Read html template
        fs.readFile('./public/bar-graph-template.html',function(error, content){ 
        if(error){
            console.log('file read error');
        }
        else {
            
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
            
            // Use as x axis labels in the bar graph
            var xlabels = [];
            
            // Use as the bar values in the bar graph
            var values = [];

            // Push the map values into an array for bar graph to display
            for (i = jsonData[0].timestamp-dataInSeconds; i <= jsonData[0].timestamp; i++) {
            if(i in map)
                {
                    values.push(map[i]);
                }
                else
                {
                    values.push("0");
                }
               
                // Set x labels to be the time string
                var date = new Date(i*1000);
                var datetext = date.toTimeString();
                datetext = datetext.split(' ')[0];
                xlabels.push(datetext);
            }

            // Render bar graph with html
            var headerText = ((type == 0)?'Trade Amount Data':'Trade Price Data');
            var rendered = content.toString().replace('#title#', 'Bitfinex Data Analysis')
                            .replace('#header#', headerText)
                            .replace('#valueData#', values.toString()).replace('#xLabelData#', xlabels.toString());
            res.send(rendered);
        }
    });
        
    });
}