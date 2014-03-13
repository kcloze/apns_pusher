var apn = require ('../index.js');

//var tokens = ["6b4cffe407ac5eb2837ae6b3204e7fee15e977d0408bfc456f7e22a282d9e368","4337d554f2708f0c53945c2a8c76deaae6c2f555fc6b35f289293c13ffc6de96"];
var tokens = [];

if(tokens[0] == "<insert token here>") {
	console.log("Please set token to a valid device token for the push notification service");
	process.exit();
}

//mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  database : 'test',
  password : ''
});
connection.connect();

// Create a connection to the service using mostly default parameters.

var service = new apn.connection({ gateway:'gateway.sandbox.push.apple.com' });

service.on('connected', function() {
    console.log("Connected");
});

service.on('transmitted', function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString('hex'));
});

service.on('transmissionError', function(errCode, notification, device) {
    token = device.token.toString('hex');
    var now= new Date(); 
    error_log_add(connection,token,0,errCode,notification.alert,now.getTime());
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
});

service.on('timeout', function () {
    console.log("Connection Timeout");
});

service.on('disconnected', function() {
    console.log("Disconnected from APNS");
});

service.on('socketError', console.error);


// If you plan on sending identical paylods to many devices you can do something like this.
function pushNotificationToMany(connection) {

    var pre_send_num=200;

    connection.query('SELECT * FROM `cj_mobile_push` WHERE `ios_push_status`=0 ORDER BY id DESC LIMIT 1', function(err1, need_push_contents) {
      if (err1) throw err1;
      if(need_push_contents.length > 0){
        //console.log('The push is: ', need_push_contents[0].id);
        push_start_mark(connection,need_push_contents[0].id);
        connection.query('SELECT COUNT(*) as count FROM `cj_ios_push`', function(err2, mobile_count) {
            if (err2) throw err2;
            //要推送的手机号码总数
            var count=mobile_count[0].count;
            //要循环的次数
            var count_for=Math.ceil(count/pre_send_num);
            console.log(count_for);
            //process.exit();

            var note = new apn.notification();
            note.setAlertText(need_push_contents[0].title);
            note.badge = 1;
       
            for (var i = 0; i <=count_for; i++) {
                //console.log('SELECT * FROM `cj_ios_push` WHERE `isopen`=1 ORDER BY id DESC LIMIT '+i*pre_send_num+','+pre_send_num);
                connection.query('SELECT * FROM `cj_ios_push` WHERE `isopen`=1 ORDER BY id DESC LIMIT '+i*pre_send_num+','+pre_send_num, function(err3, need_push_tokens) {
                    if (err3) throw err3;
                    if(need_push_tokens.length > 0){
                      //console.log('The tokens is: ', need_push_tokens);
                      var ready_send_num=0;
                      for (var i = 0; i < need_push_tokens.length; i++) {
                        tokens.push(need_push_tokens[i].token);
                      };
                      service.pushNotification(note, tokens);
                      /*setTimeout(function() {
                        console.log('hello world!');
                        service.pushNotification(note, tokens);
                      }, 2000);*/
                      //console.log(tokens);
                    }
                    
                });
                //connection.end();
            };
            setTimeout(function() {
                console.log('done!');
                push_stop_mark(connection,need_push_contents[0].id);
                process.exit();
            }, 10000);
        });
  
      }else{
        console.log('no need to push');
        process.exit();
      }

    });
    
    //connection.end();
}

pushNotificationToMany(connection);


// If you have a list of devices for which you want to send a customised notification you can create one and send it to and individual device.
function pushSomeNotifications() {
  for (var i in tokens) {
      var note = new apn.notification();
      note.setAlertText("Hello, from node-apn! You are number: " + i);
      note.badge = i;

      service.pushNotification(note, tokens[i]);
  }
  service.socketClosed();
}

function push_start_mark(connection,id){
  connection.query('UPDATE  `cj_mobile_push` SET `ios_push_status`=1 WHERE id='+id, function(err, rows) {
    //console.log('UPDATE  `cj_mobile_push` SET `ios_push_status`=1 WHERE id='+id);
    if (err) throw err;
  });
}

function push_stop_mark(connection,id){
  connection.query('UPDATE  `cj_mobile_push` SET `ios_push_status`=99 WHERE id='+id, function(err, rows) {
    if (err) throw err;
  });
}

function error_log_add(connection,token,push_id,status,message,addtime){
  var query = connection.query('INSERT INTO `cj_push_log` (`token`,`push_id`,`error_status`,`error_message`,`addtime`) VALUE(?,?,?,?,?)', 
    [token, push_id, status, message, addtime], function(err, results) {
      if (err) throw err;
  });
}

//pushSomeNotifications();
