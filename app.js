const express = require('express');
var fs = require('fs');
var request = require('request')
var cmd=require('node-cmd');

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

var testTxJson = '{ 	"To": { 		"ToList": [ 			{ 				"ToList": [], 				"Value": 18.04188, 				"Address": "1Dakqf1NaGjt2pWCBTPPyMEBww8rigdWmu" 			}, 			{ 				"ToList": [ 					{ 						"ToList": [], 						"Value": 0.26, 						"Address": "12CrhYtBm1aD8z6KvdNn3egLqEVKswM1bj" 					}, 					{ 						"ToList": [], 						"Value": 0.00024091, 						"Address": "13BPv52aPAgqrZw43cwNwRGKYNJR1jKay7" 					} 				], 				"Value": 0.26127522, 				"Address": "1KeBQZ7utLAWgNKDLjx6m21GDQWSqv8fWn" 			} 		], 		"Value": 0, 		"Address": "1JKk56ZN7BajpMadw9K7LqLrvVGFr5L2zd" 	}, 	"From": { 		"FromList": [ 			{ 				"FromList": [ 					{ 						"FromList": [ 							{ 								"FromList": [], 								"Value": 10.08707495, 								"Address": "1FueC1Qn2GHJL8WQVoSp5a2WSXwdt73uKj" 							} 						], 						"Value": 8.75648207, 						"Address": "1AqKn1vRr6gUxpcpmPGkDF82eqSSSmyyif" 					} 				], 				"Value": 8.7530323, 				"Address": "12vJ6jdxcd6YkrxvS5JpEutSWwkBB6DUMu" 			}, 			{ 				"FromList": [ 					{ 						"FromList": [ 							{ 								"FromList": [], 								"Value": 0.1294, 								"Address": "3FqD8u9MZf65NaZJZ5DburwVKGHYForCim" 							}, 							{ 								"FromList": [], 								"Value": 0.13, 								"Address": "3BMWXPghLuarAigtp6B7FeuaNubQMzHg2n" 							}, 							{ 								"FromList": [], 								"Value": 0.16281638, 								"Address": "32Xz2LajzhjBCkt5vZQxsqvWnQkQwDN2q7" 							}, 							{ 								"FromList": [], 								"Value": 0.13833054, 								"Address": "3AKTRSkcGuwew7Wxc8tzSpKKCBNcvUQSdN" 							}, 							{ 								"FromList": [], 								"Value": 0.19025598, 								"Address": "3DnByQ6HVhcFLj452uxWDZ7ZefSxQ6SsWE" 							}, 							{ 								"FromList": [], 								"Value": 0.208544, 								"Address": "3A19jK8gr7ZQunE4RvYwqCjUzx5PSYG1Vi" 							}, 							{ 								"FromList": [], 								"Value": 0.1999, 								"Address": "3AfsAUVs9qvkoyvDpBFzhM6anYoAoRXhHX" 							}, 							{ 								"FromList": [], 								"Value": 0.20187017, 								"Address": "394b3cXSw1PUPCn7mzis5WrPEEDQKyEtF6" 							}, 							{ 								"FromList": [], 								"Value": 0.1653799, 								"Address": "3CttZbttktvS5H1WUPXFeHcbfyC16XeuRs" 							}, 							{ 								"FromList": [], 								"Value": 0.209, 								"Address": "3QDs8yMEcHSx5F4MbJUREiqpDSDjaAMYKF" 							}, 							{ 								"FromList": [], 								"Value": 0.51057797, 								"Address": "3Q2y2TdwRDP6mKgXQ4oVFaK2Su1d58eW7s" 							}, 							{ 								"FromList": [], 								"Value": 0.320148, 								"Address": "35zpfPmscfJC3Fq8xCLnaRc66S2fXwkCEE" 							}, 							{ 								"FromList": [], 								"Value": 0.29815588, 								"Address": "3DnByQ6HVhcFLj452uxWDZ7ZefSxQ6SsWE" 							}, 							{ 								"FromList": [], 								"Value": 0.318728, 								"Address": "35zpfPmscfJC3Fq8xCLnaRc66S2fXwkCEE" 							}, 							{ 								"FromList": [], 								"Value": 0.26185, 								"Address": "383rdJZEEGTXAhAG3mFNvxdC8FsYFDXaLr" 							}, 							{ 								"FromList": [], 								"Value": 0.287136, 								"Address": "35zpfPmscfJC3Fq8xCLnaRc66S2fXwkCEE" 							}, 							{ 								"FromList": [], 								"Value": 0.263416, 								"Address": "35zpfPmscfJC3Fq8xCLnaRc66S2fXwkCEE" 							}, 							{ 								"FromList": [], 								"Value": 0.1999, 								"Address": "33w4oFUF9R8Y7r3g9DCFRc2o6yRRN6udQY" 							}, 							{ 								"FromList": [], 								"Value": 0.25672, 								"Address": "3EY2Kyx8KfHAHAnaWsc8YSEq62CoR3aa41" 							}, 							{ 								"FromList": [], 								"Value": 1.08954612, 								"Address": "3N52RatRchh9Rzqka6wurw83K34uhGJgAw" 							}, 							{ 								"FromList": [], 								"Value": 0.26, 								"Address": "3CttZbttktvS5H1WUPXFeHcbfyC16XeuRs" 							}, 							{ 								"FromList": [], 								"Value": 0.75092399, 								"Address": "323dgPjWA8P8UHos6rdijLAoD6osRV8EQk" 							}, 							{ 								"FromList": [], 								"Value": 1.5, 								"Address": "36nX2MPqRgJBoQo1SbBzZj32CkZFTBfrKa" 							}, 							{ 								"FromList": [], 								"Value": 0.5, 								"Address": "3Q2iPGenGMogxbZeZKBr1r6jeE63QHpnWe" 							}, 							{ 								"FromList": [], 								"Value": 0.36646214, 								"Address": "37yFNRL4VPTCQRcF7fMVYdCENWWb5qepKL" 							}, 							{ 								"FromList": [], 								"Value": 0.316, 								"Address": "3KJfyXc2SqRE5jppcLXqPJDd729iSAtnw6" 							}, 							{ 								"FromList": [], 								"Value": 0.4695, 								"Address": "3Crr7DW3Kog616giXe3MzSSiFfGkVANxQG" 							}, 							{ 								"FromList": [], 								"Value": 0.37010128, 								"Address": "32v1hyqiPJFdny1gHYRD7cq4re8BRcERPd" 							}, 							{ 								"FromList": [], 								"Value": 0.5, 								"Address": "38uCu7H3CZNvvQX3T3Tq8L5t3pMqwXih2L" 							}, 							{ 								"FromList": [], 								"Value": 0.33640205, 								"Address": "3KZVmF78aQsLdcGpYGXwz1bECoZqQVyz2f" 							}, 							{ 								"FromList": [], 								"Value": 1.29884581, 								"Address": "3DW3yupebXxYBsyX3JdJR5Xsq342a8p26C" 							}, 							{ 								"FromList": [], 								"Value": 2.29261406, 								"Address": "3LS9pXL7ffQmDmBW4TNC2NCyrjJzZxatuP" 							}, 							{ 								"FromList": [], 								"Value": 0.586, 								"Address": "36kYRY5SyEmZJ9RqKFzZho6CoE4n7R37Vm" 							}, 							{ 								"FromList": [], 								"Value": 1.52, 								"Address": "3PtJRj5xKUKJ21TshP5u2G6dQMPNz2yUSc" 							}, 							{ 								"FromList": [], 								"Value": 0.84455, 								"Address": "3MnENzHbXgQeV9mUAh1dcTu4zWiy7RvprM" 							}, 							{ 								"FromList": [], 								"Value": 1.8930823, 								"Address": "37xXVPx7fhGKo7JEn72cPMcCqE2Bc92SJM" 							}, 							{ 								"FromList": [], 								"Value": 0.80332364, 								"Address": "32AhzkKzAjQYHynK1t5ShNtNqDyCivuCYS" 							}, 							{ 								"FromList": [], 								"Value": 1, 								"Address": "35ySCLsRiZ7WzNxKxhQbAhzdBhtGEyHQvF" 							}, 							{ 								"FromList": [], 								"Value": 0.319667, 								"Address": "35zpfPmscfJC3Fq8xCLnaRc66S2fXwkCEE" 							}, 							{ 								"FromList": [], 								"Value": 1.75479643, 								"Address": "3QkGfyiZc51xFMCJ5zMsHcVSfSHfeUMe2Q" 							} 						], 						"Value": 0.280656, 						"Address": "15We1ePDMW3B8M67wsFPRnxp6iWSKKkyE9" 					}, 					{ 						"FromList": [ 							{ 								"FromList": [], 								"Value": 0.10742709, 								"Address": "3PhysGe1HGVgGoTEtYimv5uC3RT11RKuVc" 							}, 							{ 								"FromList": [], 								"Value": 0.15, 								"Address": "3GpnFTJ2bat1LGg6VdXp1CNtgPH3nuiVdw" 							}, 							{ 								"FromList": [], 								"Value": 0.13, 								"Address": "3FG8GsZTVV3KBuBWfmZsyNC7SeEaEghfB6" 							}, 							{ 								"FromList": [], 								"Value": 0.319946, 								"Address": "35zpfPmscfJC3Fq8xCLnaRc66S2fXwkCEE" 							}, 							{ 								"FromList": [], 								"Value": 0.23893267, 								"Address": "3GzCuwT4WociMZnHeqiKWayGpxeo58AWPG" 							}, 							{ 								"FromList": [], 								"Value": 0.22343751, 								"Address": "3GzCuwT4WociMZnHeqiKWayGpxeo58AWPG" 							}, 							{ 								"FromList": [], 								"Value": 0.13245, 								"Address": "3QuiJen1HaaZov2HrpELFyC5DLUX4VC2Dz" 							}, 							{ 								"FromList": [], 								"Value": 0.61, 								"Address": "3976tZdk1QX3QGnDFCfYayif3j5Gi96gwg" 							}, 							{ 								"FromList": [], 								"Value": 1, 								"Address": "3EeFUo29HUvpKzaKPS6onxxhrBaBb5RaTP" 							}, 							{ 								"FromList": [], 								"Value": 0.31, 								"Address": "3KDsh3ffRKh2jGg33Dkkb1dBnjGHhjMvP7" 							}, 							{ 								"FromList": [], 								"Value": 0.2995, 								"Address": "33L3kyJjZ31YS53MYofyHhweZ9ZmxJTndE" 							}, 							{ 								"FromList": [], 								"Value": 1.4, 								"Address": "3F1WY4SjrRocGXjRZMe75bynmYSMWy9icm" 							}, 							{ 								"FromList": [], 								"Value": 0.56711082, 								"Address": "37rmhSAqSUgvitafwhgKWLKWCtvbnYL1DL" 							}, 							{ 								"FromList": [], 								"Value": 0.48458807, 								"Address": "3EFjghZuY1u4iMvTJc9sF2NigDX6R9obMD" 							}, 							{ 								"FromList": [], 								"Value": 0.22958689, 								"Address": "3GRr3dFZ9PBpCnkmZg2a4E1uP3TpsBKo2t" 							}, 							{ 								"FromList": [], 								"Value": 1.39682296, 								"Address": "3KuHUjWsZkGY4UhJaYdFx7e7YpS8xvqoPp" 							}, 							{ 								"FromList": [], 								"Value": 3.92558398, 								"Address": "3EDGpTpArQpPcdqBpaeqSYS3whpVbYLRh6" 							}, 							{ 								"FromList": [], 								"Value": 1.3414, 								"Address": "3MGRwkxjUEVVBbWBCk53AN2ucXuUK4NnqM" 							}, 							{ 								"FromList": [], 								"Value": 1.18581846, 								"Address": "3Ltc4GMLusk9euHByo7hdFsiVPoRbNgKEB" 							}, 							{ 								"FromList": [], 								"Value": 2.43065017, 								"Address": "3CUtorwyoxDDFXskjnU3ovtB6QVLY65zYQ" 							}, 							{ 								"FromList": [], 								"Value": 0.517085, 								"Address": "36U265Ptp4VbyQz8nrQ9nhTQe4dvLGk2cN" 							}, 							{ 								"FromList": [], 								"Value": 2.9999, 								"Address": "39DCYqPvhWf3t5Da12bUAQVna8EfbrVcK9" 							}, 							{ 								"FromList": [], 								"Value": 0.41, 								"Address": "3Lnb56WuG73DQHduiStFsBTgEpeT7MBtiC" 							} 						], 						"Value": 1.111108, 						"Address": "1JC4MDeUFkEexD6aX12s7ysqXoKGFY8K3A" 					} 				], 				"Value": 1.39154893, 				"Address": "15sZvEAfkwfcYsTb3eQ6Ww5ZvqRULt6DxQ" 			}, 			{ 				"FromList": [ 					{ 						"FromList": [ 							{ 								"FromList": [], 								"Value": 0.000158, 								"Address": "14SiLRM7H6pLFxvvvGoHThZZdqTFwn837X" 							}, 							{ 								"FromList": [], 								"Value": 10.8, 								"Address": "1BDu7hET2kZG57U7szxpgkF9nTwynqJgM" 							} 						], 						"Value": 10.79995879, 						"Address": "14NVApLnh64y24QMUHNw2aTiKfCKGEPnXh" 					} 				], 				"Value": 8.1608179, 				"Address": "1M3ohRC8wT4ypvQVJt2NXCJ3JunbMJmeTY" 			} 		], 		"Value": 0, 		"Address": "1JKk56ZN7BajpMadw9K7LqLrvVGFr5L2zd" 	} }';


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

app.get('/bitcointransactions', function (req, res) {
    if(typeof(req.query.address) != 'undefined' && req.query.address != "")
    {
		// Call python to retrieve trasactions on the blockchain
        /*cmd.get(
        'python findtxbyaddress.py '+req.query.address,
            function(err, data, stderr){
                if(stderr)
                {
                    res.send(stderr);
                }
                else
                {
                    var treeData = convertTransactionData(data);
                
                    fs.writeFile("./public/treeMap.json", treeData, function(err) {
                        if(err) {
                            return console.log(err);
                        }

                        fs.readFile('./public/tree.html',function(error, content){ 
                            if(error){
                                console.log('file read error');
                            }
                            else {
                                var rendered = content.toString().replace('#address#', req.query.address);

                                res.send(rendered);
                            }
                        });
                    }); 
                }
            }
        );*/
        
        var treeData = convertTransactionData(testTxJson);
                
        fs.writeFile("./public/treeMap.json", treeData, function(err) {
            if(err) {
                return console.log(err);
            }

            fs.readFile('./public/tree.html',function(error, content){ 
                if(error){
                    console.log('file read error');
                }
                else {
                    var rendered = content.toString().replace('#address#', req.query.address);

                    res.send(rendered);
                }
            });
        }); 
    }
    else
    {
        fs.readFile('./public/tree-empty.html',function(error, content){ 
            if(error){
                console.log('file read error');
            }
            else {
                var rendered = content.toString();

                res.send(rendered);
            }
        });
    }
});

// Convert trasaction json to tree map data
function convertTransactionData(txJsonString)
{
    var txData = JSON.parse(txJsonString);
    var toList = txData["To"];
    var fromList = txData["From"];
    
    var dataTo = convertTransactionToData(toList);
    var dataFrom = convertTransactionFromData(fromList);
    if("children" in dataTo)
    {
        dataFrom["children"] = dataTo["children"];
    }
    
    return JSON.stringify(dataFrom);
}

// Recursively build trasaction output links
function convertTransactionToData(toList)
{
    if("Address" in toList)
    {
        var treeMap = new Object();
        treeMap["name"] = toList["Address"]+"\t"+toList["Value"];
        treeMap["isparent"] = false;
        if(toList["ToList"].length > 0)
        {
            treeMap["children"] = [];
            for(var i =0; i < toList["ToList"].length; i++)
            {
                treeMap["children"].push(convertTransactionToData(toList["ToList"][i]));
            }
        }
        
        return treeMap;
    }
    else
    {
        return 'undefined';
    }
}

// Recursively build trasaction input links
function convertTransactionFromData(fromList)
{
    if("Address" in fromList)
    {
        var treeMap = new Object();
        treeMap["name"] = fromList["Address"]+"\t"+fromList["Value"];
        treeMap["isparent"] = true;
        if(fromList["FromList"].length > 0)
        {
            treeMap["parents"] = [];
            for(var i =0; i < fromList["FromList"].length; i++)
            {
                treeMap["parents"].push(convertTransactionFromData(fromList["FromList"][i]));
            }
        }
        
        return treeMap;
    }
    else
    {
        return 'undefined';
    }
}


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