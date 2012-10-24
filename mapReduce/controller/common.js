 var common = exports;
 
 // get the current time of system.
 common.getDate = function () {
	var dTime = new Date();
	var year = dTime.getFullYear();
	var month = dTime.getMonth();
	var day = dTime.getDate();
	var hours = dTime.getHours();
	var minute = dTime.getMinutes();
	var second = dTime.getSeconds();	

    return year + "-" + month + "-" + day + "->" + hours + ":" + minute + ":" + second;
 }

 common.getMilliseconds = function(){
 	// display the number of milliseconds since midnight, January 1, 1970
 	var dTime = new Date();
 	 return dTime.getTime();
 }