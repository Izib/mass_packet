if(process.argv.length != 5)
{
	console.log('usage: node client.js \\\\172.0.1.90\\packets serverIp port');
	return;
}

var fs   = require('fs')
var http = require('http')
var walk = require('walk')
var lazy = require('lazy')
var common = require('./common')
var os     = require('os')

var options = {
	host: '127.0.0.1',
	port: 1636
};

emitter = new process.EventEmitter;

var counter = 0;    // this for counter the success tasks.
var files   = [];   // this for contain the files which walk searched in the dirctory.
var mapper  = [];   // this contain the computers which can be dispatched
var allTasks= [];   // this contain the files list which is used by mapper.
var walker;
var timeOut = process.argv[5];
var logFile = fs.createWriteStream('./logs/log', {'flags': 'a'});	

emitter.on( 'traversing', function( folder ){
	logFile.write('\ntraversing folder');
	walker = walk.walk( folder, { followLinks: false });		
	walker.on('file', function(root, stat, next) {
	    // Add this file to the list of files
	    files.push(root + '/' + stat.name);
	    next();
	});

	walker.on('end', function() {
		// console.log(files);
		emitter.emit('gotAllMapper', './mapper.txt' );		
	});
});

// got the initial allTasks and save it in files.
emitter.on('generateTaskFile', function( allAvailableComputers ){
	console.log('\ngenerate task files.\nAllAvailableComputers:' + allAvailableComputers.length);	
	var div = files.length/allAvailableComputers.length;
	console.log('\npartition:' + div);
	console.log('\npackets number:' + files.length);

	var packets = 0;
	for (var i = 0; i < allAvailableComputers.length; i++){
		var mapTask = fs.createWriteStream('./dispatch/' + allAvailableComputers[i], {'flags': 'w'});	
		allTasks.push( allAvailableComputers[i] ); // got a task list.
		for( var j = 0; j <= div ; j++){
			if( packets < files.length){	
				//console.log(__dirname);				
				mapTask.write( files[packets] + '\n' );		
				packets ++;				
			}
		}	
	}
	
	emitter.emit(' distributor ', allAvailableComputers, allTasks );
});

// got all server position and push in mapper.
emitter.on('gotAllMapper', function( mapperFile ){	
	logFile.write('\nget all mappers:');
	new lazy( fs.createReadStream( mapperFile ).on('end', function(){
			emitter.emit('generateTaskFile', mapper);
		})).lines.forEach(function(line){
        	logFile.write('\ngot one mapper:' + line.toString());
        	// filter the \r character.
		mapper.push(line.toString().replace(/[^\d._]/g,''));
    	});	
});

// this is used to distribute the allTasks to each computer. mapper...
emitter.on(' distributor ', function( availableComputer, remainTasks ){
	logFile.write('\nStarting distribute tasks\nAvailable computers->');
	logFile.write( availableComputer );
	logFile.write( '\n remain tasks:');
	logFile.write( remainTasks );
	// console.log( availableComputer );
	// console.log( remainTasks);
	for ( var taskIndex = 0, computerIndex = 0; taskIndex <  remainTasks.length; computerIndex++,taskIndex++){
		if( computerIndex == availableComputer.length ){
			computerIndex = 0;
		}
	
		var array =  availableComputer[computerIndex].split('_');
		options.host = array[0];
		options.port = array[1];
		var sig = common.getMilliseconds();
		options.path = '/dispatch?serverIp=' + process.argv[3] + '&&serverPort=' + process.argv[4]
						+ '&&packetsInfo=\\\\' + os.hostname() + '/dispatch/' +  remainTasks[taskIndex] + '&&sig=' + sig ;
		// this is for fault patience. computerIndex will delete all doc which have this sig when the map failed.			
		// console.log(sig);	
		logFile.write('\nmap computer:' + options.host + ' port:' + options.port + ' Sig:' + sig 
			+ 'url_path->' + options.path + '\r');
		// console.log('url_path->' + options.path);
		var req = http.request( options,  function( res ){
					logFile.write('\nget a response:' + res.statusCode);
					if( res.statusCode == 0){
						console.log('\nfinish a task by' + this.computer);
						logFile.write('\nfinish a task');	
						counter++;
						if( allTasks.length == counter )					
						{
							console.log('\nall task finish');
							logFile.write('\n all task finish');
						}						
					}else{
						logFile.write('\nemit faultPatience');
						emitter.emit('faultPatience', this.tasks, this.computer);
					}
				}, {agent:false}).on('error', function(e) {
					logFile.write("Got error: " + e.message);
					//console.log(this);
					emitter.emit('faultPatience', this.tasks, this.computer);
				});
			
		req.tasks = remainTasks[taskIndex];		
		req.computer = availableComputer[computerIndex];
		req.setTimeout( timeOut, function(){ 
			logFile.write( 'timeout');
			//console.log(this);
			emitter.emit('faultPatience', this.tasks, this.computer);
		});		
		req.on('end', function(){console.log('end');})	;
		req.end();
		
	}
});

emitter.on('faultPatience', function( faultTask, faultComputer ){
	logFile.write('\nfault patience:');
	logFile.write('\nfault task' + faultTask );
	logFile.write('\nfault computer' + faultComputer);	
	var dispatchTaskAgain = [];
	dispatchTaskAgain.push( faultTask );
	mapper.splice( mapper.indexOf( faultComputer ), 1);
	if( mapper.length == 0)
	{
		console.log( ' no more computer for use');
		return;
	}
	logFile.write('\ncurrent usable computers:' + mapper);

	emitter.emit( ' distributor ', mapper, dispatchTaskAgain);
});

emitter.emit('traversing', process.argv[2]);