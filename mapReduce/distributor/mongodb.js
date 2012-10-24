var mongodb = exports;  // remember check isOpen flag before call the insert method

var db = require( 'mongodb' ).Db;
var server  = require( 'mongodb' ).Server;

// this is for connect the database.
var client = new db( 'test', new server( '172.0.1.72', 27017, {auto_reconnect: true}, {} ));
var isOpen = false;   // this is for check the database whether opened or not.
var insertArray = [];// this is a table for insert the data which is added after the database open.

mongodb.insert = function(data){
      // console.log(data);
      if(isOpen == false){  
        // if the database is not opened, push the data in the table. 
        insertArray.push(data);        
      }
      else{
        client.collection('stress', function(err, collection) {
        if( err ) throw err;  // if add err, throw it.

        // insert the data in mongodb database. data format is BSON.
        collection.insert(data);          
        });
      }
}

mongodb.close = function(){
  // close the database connection.
  client.close(); 
}

client.on('isOpened', function(){
   // when the database opened, enumanate all data in insertArray and add it in database
   // if you wanna do some update or delete before database opened. do it here.
   for (var i = 0; i < insertArray.length; i++) {
     mongodb.insert( insertArray[i] );
   };
});

client.open(function(err, pClient) {
	//console.log(pClient);
	if( pClient ){		
        pClient.authenticate( 'stress', 'odomoc', function( err,data){
          // auth the password.
             if( data ){                
                console.log("Database opened");
                isOpen = true;
                // when the database opened, emit the event of isOpened for the operation 
                // which is added before database connectted
                client.emit('isOpened');
             }
             else{
                 console.log(err);
             }
         });
      }
      else{
           console.log(err);
      }
});


// the others, not use it now, maybe later.

var removeData = function(err, collection) {
    collection.remove({name: "Spiderman"});
}

var updateData = function(err, collection) {
    collection.update({name: "Kristiono Setyadi"}, {name: "Kristiono Setyadi", sex: "Male"});
}

var listAllData = function(err, collection) {
    collection.find().toArray(function(err, results) {
        console.log(results);
    });
}