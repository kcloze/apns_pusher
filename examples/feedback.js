var apn = require ('../index.js');

// Setup a connection to the feedback service using a custom interval (10 seconds)
var feedback = new apn.feedback({ address:'feedback.sandbox.push.apple.com', interval: 10, port: 2196	});

feedback.on('feedback', handleFeedback);
feedback.on('feedbackError', console.error);

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  database : 'test',
  password : ''
});
connection.connect();

function handleFeedback(feedbackData) {
	console.log(feedbackData);
	var time, device;
	for(var i in feedbackData) {
		time = feedbackData[i].time;
		device = feedbackData[i].device;
		error_log_add(connection,device.toString('hex'),0,0,'',time);
		console.log("Device: " + device.toString('hex') + " has been unreachable, since: " + time);
	}
}

function error_log_add(connection,token,push_id,status,message,addtime){
	var query = connection.query('INSERT INTO `cj_push_log` (`token`,`push_id`,`error_status`,`error_message`,`addtime`) VALUE(?,?,?,?,?)', 
		[token, push_id, status, message, addtime], function(err, results) {
  		if (err) throw err;
	});
}
