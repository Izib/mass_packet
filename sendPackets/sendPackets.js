// if the input argv error. exit now.
if (process.argv.length != 5 )
{
  console.log("usage: node example.js E:\\packets 172.0.1.31 80");
  return;
}

var http = require( 'http');
var fs   = require( 'fs' );
var walk = require( 'walk');  // this is for recursive search into the directory 
var crc  = require( 'crc32');
var common = require( './common');
var mongodb = require( './mongodb');

//make a request options
var options = {
    port: process.argv[4],
    host: process.argv[3],
    method: 'GET',
};

var files   = [];   // this for contain the files which walk searched in the dirctory.
var walker  = walk.walk( process.argv[2], { followLinks: false });

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});
//console.log('start');

walker.on('end', function() {
  //console.log( 'files' + files);
  for (var i = 0; i < files.length; i++) {
    //console.log(files[i]);
    fs.readFile( files[i], function (err, data) {
      if (err) throw err;
      //console.log(data);
      //request.write(data);

      var request = http.request(options, function(res) {
        // res.setEncoding('utf8'); 
        
        var chunks;
        res.on('data', function(chunk){
          chunks = chunks + chunk;       
        });    
         res.on('end', function () {            
          var recvPoint = common.getMilliseconds();   
          // save to mongodb
          mongodb.insert({ 
            timeStamp: timeStamp,
            responseTime: recvPoint-sendPoint,
            responseStatus: res.statusCode,
            // headers: JSON.stringify(res.headers),
            // data: chunks, 
            dataCrc: crc( chunks)});          
        });         
      });

      var sendPoint = common.getMilliseconds();        
      var timeStamp = common.getDate();      
      request.end(data);
      // console.log('write---------------->');      
    });    
  } 
});