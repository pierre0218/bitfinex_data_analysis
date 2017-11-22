import sys
import json
from jsonrpc import ServiceProxy
from urllib import urlopen

if len(sys.argv) < 2:
 print 'no argument'
 sys.exit()

# Connect to bitcoin node
rpc = ServiceProxy("http://2b:hw234@140.112.29.42:8332")

# Secify a trasaction address to be searched
Addr=sys.argv[1] #"1JKk56ZN7BajpMadw9K7LqLrvVGFr5L2zd"  "1EEZzSWes5SE1j5KEULEXmJcD5HGt4ZgR2"

# Call blockchain.info's api to retrieve an address's information
def ListAddrTx(addr) :
	data=json.loads(urlopen("https://blockchain.info/rawaddr/"+addr).read())
	txs=data['txs']
	toAddrTxs=[]
	fromAddrTxs=[]
	for i in txs :
		for j in i['out'] :
			if j.keys().count('addr')<1 :
				continue
			if j['addr'] == addr :
				toAddrTxs.append((i['hash'],j['n']))
				break
		for j in i['inputs'] :
			if j['prev_out'].keys().count('addr')<1 :
				continue
			if j['prev_out']['addr'] == addr :
				fromAddrTxs.append((i['hash'],j['prev_out']['n']))
				break
	return {"Address":addr,"ToAddrTxs":toAddrTxs,"FromAddrTxs":fromAddrTxs}


def voutToAddr(txid,vout):
	tx=rpc.decoderawtransaction(rpc.getrawtransaction(txid))
	return tx['vout'][vout]['scriptPubKey']['addresses'][0]

# Recursively search for the inputs of an address
def findFromList(txid,vout,iteration):
	if iteration<=0:
		tx=rpc.decoderawtransaction(rpc.getrawtransaction(txid))
		return {"Address":tx['vout'][vout]['scriptPubKey']['addresses'][0],"FromList":[],"Value":tx['vout'][vout]['value']}
	fromList=[]
	tx=rpc.decoderawtransaction(rpc.getrawtransaction(txid))
	addr=tx['vout'][vout]['scriptPubKey']['addresses'][0]
	for i in tx['vin'] :
		fromList.append(findFromList(i['txid'], i['vout'], iteration-1))
	return {"Address":addr,"FromList":fromList,"Value":tx['vout'][vout]['value']}

def findFrom(addr) :
	txList=ListAddrTx(addr)
	fromList=[]
	for i in txList['ToAddrTxs'] :
		fromList+=findFromList(i[0],i[1],3)['FromList']
	return {"Address":addr,"FromList":fromList,"Value":0}
	
# Recursively search for the outputs of an address
def findToList(addr,iteration):
	if iteration<=0:
		return []
	data=json.loads(urlopen("https://blockchain.info/rawaddr/"+addr).read())
	txs=data['txs']
	toList=[]
	for i in txs :
		for j in i['inputs'] :
			if j['prev_out']['addr'] == addr :
				for k in i['out'] :
					toList.append({"Address":k['addr'], "ToList":findToList(k['addr'],iteration-1), "Value":float(k['value'])/100000000})
	return toList
	
def findTo(addr) :
	return{"Address":addr, "ToList":findToList(addr,3), "Value":0}
	

From=findFrom(Addr)
To=findTo(Addr)
print json.dumps({"From":From,"To":To}	)	
