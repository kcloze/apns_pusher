/*var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  database : 'test',
  password : ''
});
connection.connect();

connection.query('SELECT * FROM `cj_mobile_push` WHERE `ios_push_status`=0 ORDER BY id DESC LIMIT 1', function(err, need_push_contents, fields) {
  if (err) throw err;
  if(need_push_contents.length > 0){
  	console.log('The solution is: ', need_push_contents);
  }
});

console.log('The solution is: done');


connection.end();
*/

var Client = require('easymysql');

var mysql = Client.create({
  'maxconnections' : 10
});

mysql.addserver({
  'host' : '127.0.0.1',
  'user' : 'root',
  'password' : '',
  'datebase' : 'test'
});
var need_push_contents='';


var outputPromise = getInputPromise()
.then(function (input) {
}, function (reason) {
});

Q.fcall(get_need_push_contents)
.then(promisedStep2)
.then(promisedStep3)
.then(promisedStep4)
.then(function (value4) {
    // Do something with value4
})
.catch(function (error) {
    // Handle any error from all above steps
})
.done();

function get_need_push_contents(){
	mysql.query('SELECT * FROM `cj_mobile_push` WHERE `ios_push_status`=0 ORDER BY id DESC LIMIT 1', function (error, res) {
  		console.log(res);
  		return res;
	});
}

mysql.query({
  sql: 'select * from user where user =:user',
  params: {user: 'xxoo'}
}, function (err, rows) {
  console.log(rows);
});