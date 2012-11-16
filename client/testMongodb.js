var mongodb = require( './mongodb')

var str = "chen";
mongodb.insert( { _id : str, name: { first:"Alex", last:"Benisson" }, karma : 1.0 } );