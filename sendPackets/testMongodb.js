var mongodb = require( './mongodb')

var str = "alex";
mongodb.insert( { _id : str, name: { first:"Alex", last:"Benisson" }, karma : 1.0 } );