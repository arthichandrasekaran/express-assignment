//Assignment 1
var express = require("express");
var myParser = require("body-parser");
var fs = require("fs");
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"
var buf = new Buffer(1024);
var app = express();


app.use(myParser.json());

//API 1 - Reads a JSON request, returns a Request Accepted message and persists the JSON request in mongo db
app.post("/persistRequest", function(request, response) {
	
	allTest = request.body.test;
	
	var requestObj = "[ ";
	var measureFlag = (allTest.length) - 1;
	
	//Iterating through the JSON request
	for (var i = 0; i<allTest.length ; i++) {
		var servicename = request.body.test[i].servicename;
		var serverip = request.body.test[i].serverip;
		var method = request.body.test[i].method;
		//console.log(serverip + "," + servicename + "," + method);

		//Forming the request object for persisting into Mongo DB
		if (i != measureFlag) {
			requestObj = requestObj+"{ \"serverip\": \""+serverip+"\", \"servicename\": \""+servicename+"\", \"method\": \""+method+"\" },";
			console.log ("size:"+measureFlag+" i:"+i);
		}
		else {
			requestObj = requestObj+"{ \"serverip\": \""+serverip+"\", \"servicename\": \""+servicename+"\", \"method\": \""+method+"\" }";
		}
		
		//Writing the request into a file
		//Since it took time for getting required permissions for installing mongo client through NPM, started off with writing into file.
		fs.appendFileSync('input.txt', serverip+" "+servicename+" "+method+" "+"\n", function(err) {
		   if (err) {
			  return console.error(err);
		   }
		   console.log("Data written successfully");
		});
	}
	requestObj = requestObj + " ]";
	//requestObj = requestObj + "}";
	
	console.log("String : "+requestObj);
	
	
	//Inserting into mongo db
	//DB Name: Assignment, Table/Document name : ServerDetails
	mongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("Assignment");
			
		dbo.collection("ServerDetails").insertMany(JSON.parse(requestObj),{safe:true}, function(err, res) {
			console.log("Document(s) inserted");
			if (err) console.warn(err.message);
			db.close();
		});

	});
	
	response.send("Request Accepted!!!");
  
});

app.listen(8080);