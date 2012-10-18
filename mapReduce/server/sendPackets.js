
if(process.argv.length != 3){
    console.log('usage: node sendPackets 1636(listen port)')
    return;
}

var os   = require( 'os');
var http = require( 'http');
var fs   = require( 'fs' );
var walk = require( 'walk');  // this is for recursive search into the directory 
var crc  = require( 'crc32');
var url  = require( 'url' );
var lazy = require( 'lazy');
var common = require( './common');
var mongodb = require( './mongodb');

var runTimes = 1;
//make a request options
var options = {
    host: "127.0.0.1",
    port: 1636,
    agent: false 
};

http.createServer(function(req_, res) {
    console.log( common.getDate() +'start...\n');
    req_.connection.setTimeout(0);
    
    var sendCounter = 0;
    var recvCounter = 0;
    params = url.parse(req_.url, true).query;
    options.host = params.serverIp || '127.0.0.1';
    options.port = params.serverPort || 80;
    var packetsInfo = params.packetsInfo;
    var sig    = params.sig;
    var times = params.times;
    var log = fs.createWriteStream('./logs/log' + String(sig) ,{'flags': 'a'});

    log.write('\nstarting new task...');

    var logLine = '\nSig:' + sig + ' \nhost:' + options.host + ' \nport:' + options.port 
                  + ' \npacketsInfo:' + packetsInfo + ' \ntimes:' + times;
    // console.log(logLine);
    log.write(logLine);

    // Event 'over', emitted when one task over.
    res.on('over', function(msg){
    // 1: read file error
    // 0: success
        console.log('over');
        var body = new Buffer(String(msg));
        this.writeHead( Number(msg), { "Content-Type": "text/plain",
                               "Content-Length": body.length});
        this.end( body );    
        log.write('\n' + 'over status code->' + msg);
        console.log(msg);
    });

    var lines = new lazy( fs.createReadStream( packetsInfo).on('error', function(err){
                      log.write('\n' + common.getDate() + 'open stream error:' + err.message);
                })).lines;

    // traversing all lines of packetsInfo indicated.
    lines.forEach(function(line){ 
        var packetsPath = String(line);
        log.write('\n' + common.getDate() + '->Read packet path' + packetsPath);      
        // read packets for send out.
        fs.readFile( packetsPath, function (err, data) {
            if (err){
                log.write('\n' + common.getDate() + 'read file error' + err.message);
                console.log(err.message);            
                res.emit('over', 1);
            }               
            // send the packets by request object with IO event driving.
            var req = http.request(options, function(response) {
                // res.setEncoding('utf8'); 
                //console.log('respone');
                var chunks;
                response.on('data', function(chunk){      
                    chunks = chunks + chunk;       
                });    
              
                // Event 'end' emitted when one request over.
                response.on('end', function () {               
                    var recvPoint = common.getMilliseconds();   
                    // save to mongodb
                    //console.log(this.client._httpMessage);                
                    var oneCollection = { 
                        sig: sig,
                        runMachine: os.hostname(),             
                        timeStamp: common.getDate(),
                        filePath: String(this.client._httpMessage.filePath),
                        timeStamp: common.getDate(),
                        responseTime: recvPoint-this.client._httpMessage.sendPoint,
                        responseStatus: this.statusCode,
                        headers: JSON.stringify(this.headers),
                        data: chunks, 
                        dataCrc: crc( chunks)
                    };

                    //  console.log(oneCollection);
                    log.write('\ninsert db->>>' + oneCollection + '\n');
                    mongodb.insert(oneCollection); 
                    log.write('\nrecv Counter++->' + recvCounter);
                    recvCounter++;
                    if(recvCounter == sendCounter){
                        // emit over when all of packets send out and receive the responses.                    
                        res.emit('over', 0);          
                    }
                });
            });

            req.sendPoint = common.getMilliseconds();    
            req.filePath  = line;    
            req.end(data);
            var packetsPath = String(line);  
            log.write('\nSend Counter++->' + sendCounter) ;
            sendCounter++;
            req.on('error', function(e) {
                log.write('\n' + common.getDate() + '->send packets:' + sendCounter
                          + 'error packets:' + this.packetsPath + '->request error:' + e.message); 
                // console.log('problem with request: ' + e.message);
                log.write('\nsend Counter-- ->' + sendCounter);
                sendCounter --;
                if(sendCounter == recvCounter){       
                    res.emit('over',0);
                }
            });        
        });       
    });
}).listen(process.argv[2]);

console.log('listen:' + process.argv[2]);