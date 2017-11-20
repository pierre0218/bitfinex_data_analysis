const express = require('express');
var fs = require('fs');
var request = require('request')

// Bitfinex API URL
var bitfinex_url = "https://api.bitfinex.com/v1"

// Kraken API URL
var kraken_url = "https://api.kraken.com/0/public/"

// Symbol map from Bitfinex to Kraken
var bitfinexToKrakenSymbol = {
    'btcusd': 'XBTUSD',
    'ltcusd': 'LTCUSD',
    'ethusd': 'ETHUSD',
    'etcbtc': 'ETHXBT'
};

// Dummy data for my trades
var myTrades = [
    {
        "price":"9681.77",
        "amount":"3.0",
        "timestamp":"1505405289",
        "exchange":"",
        "type":"Buy",
        "fee_currency":"USD",
        "fee_amount":"-10.22",
        "tid":11970500,
        "order_id":446913500
    },
    {
        "price":"4320.4",
        "amount":"1.0",
        "timestamp":"1506999369",
        "exchange":"",
        "type":"Buy",
        "fee_currency":"USD",
        "fee_amount":"-10.22",
        "tid":11970700,
        "order_id":446913800
    },
    {
        "price":"5857.32",
        "amount":"1.0",
        "timestamp":"1510480929",
        "exchange":"",
        "type":"Buy",
        "fee_currency":"USD",
        "fee_amount":"-10.22",
        "tid":11970750,
        "order_id":446913850
    },
    {
        "price":"7755.4",
        "amount":"1.0",
        "timestamp":"1511147133",
        "exchange":"",
        "type":"Buy",
        "fee_currency":"USD",
        "fee_amount":"-10.22",
        "tid":11970839,
        "order_id":446913929
    }
];


// Dummy data for history movements
var myMovements = [
    {
        "id":581000,
        "txid":123100,
        "currency":"BTC",
        "method":"BITCOIN",
        "type":"WITHDRAWAL",
        "amount":"1",
        "description":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ, offchain transfer ",
        "address":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ",
        "status":"COMPLETED",
        "timestamp":"1509350529",
        "timestamp_created":"1509350529.1",
        "fee":0.1
    },
    {
        "id":581050,
        "txid":123150,
        "currency":"BTC",
        "method":"BITCOIN",
        "type":"WITHDRAWAL",
        "amount":".5",
        "description":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ, offchain transfer ",
        "address":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ",
        "status":"COMPLETED",
        "timestamp":"1510052529",
        "timestamp_created":"1510052529.1",
        "fee":0.1
    },
    {
        "id":581183,
        "txid":123456,
        "currency":"BTC",
        "method":"BITCOIN",
        "type":"WITHDRAWAL",
        "amount":".7",
        "description":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ, offchain transfer ",
        "address":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ",
        "status":"COMPLETED",
        "timestamp":"1511147160",
        "timestamp_created":"1511147160.1",
        "fee":0.1
    }
];




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

app.get('/mytrades', function (req, res) {
    renderMyTrades(req, res);
});


function retrieveData(req, res, type)
{
    // Used as bar value in bar graph
    var values1 = [];
    var values2 = [];

    // Used as x axis labels in the bar graph
    var xlabels1 = [];
    var xlabels2 = [];

    var step = 0;

    // Get current timestamp
    const dateTime = Date.now();
    const currentTimestamp = Math.floor(dateTime / 1000);
    
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
        for (i = currentTimestamp-dataInSeconds; i <= currentTimestamp; i++) {
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
            
            if (typeof jsonData.result == 'undefined' || !(symbol in jsonData.result))
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
                for (i = currentTimestamp-dataInSeconds; i <= currentTimestamp; i++) {
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
    // Only render the bar graph after we got the data from both Bitfinex and Kraken
    if(step == 2)
    {
        // Set header
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

function renderMyTrades(req, res)
{
    var value1 = []; // trade amount
    var value2 = []; // withdraw amount
    var value3 = []; // total amount
    var xlabel = []; // time

    var timestampMap = new Object();

    for (var i = 0; i < myTrades.length; i++)
    {
        var timestamp = parseInt(myTrades[i]["timestamp"]);
        
        var dataObj = new Object();
        dataObj["amount"] = myTrades[i]["amount"];
        dataObj["type"] = "trade";
        timestampMap[timestamp] = dataObj;
    }
    
    for (var i = 0; i < myMovements.length; i++)
    {
        var timestamp = parseInt(myMovements[i]["timestamp"]);
        
        var dataObj = new Object();
        dataObj["amount"] = myMovements[i]["amount"];
        dataObj["type"] = "withdraw";
        timestampMap[timestamp] = dataObj;
    }
    
    var index = 0;
    var total = 0;
    for (var t in timestampMap)
    {
        var date = new Date(t*1000);
        var datetext = date.toString();
        xlabel.push(datetext);
        
        
        if(timestampMap[t]["type"] == "trade")
        {
            value1.push(timestampMap[t]["amount"]);
            total += parseFloat(timestampMap[t]["amount"]);
        }
        else
        {
            value1.push("0");
        }
        
        if(timestampMap[t]["type"] == "withdraw")
        {
            value2.push(timestampMap[t]["amount"]);
        }
        else
        {
            value2.push("0");
        }
        
        total = total - parseFloat(value2[index]);
        value3.push(total);
        
        index++;
    }
    
    
    
    fs.readFile('./public/myTrades.html',function(error, content){ 
    if(error){
        console.log('file read error');
    }
    else {
        var rendered = content.toString()
                    .replace('#valueData1#', value1.toString())
                    .replace('#xLabelData1#', xlabel.toString())
                    .replace('#valueData2#', value2.toString())
                    .replace('#xLabelData2#', xlabel.toString())
                    .replace('#valueData3#', value3.toString())
                    .replace('#xLabelData3#', xlabel.toString());

        res.send(rendered);
    }
});
}