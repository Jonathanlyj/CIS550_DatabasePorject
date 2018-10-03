var path = require('path')
var fs = require('fs')
var express = require('express')
var https = require('https')

var certOptions = {
  key: fs.readFileSync(path.resolve('/Users/kara/server.key')),
  cert: fs.readFileSync(path.resolve('/Users/kara/server.crt'))
}

var app = express()

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'londondb.cvyor6g2kb1u.us-east-2.rds.amazonaws.com',
  user     : 'cis550',
  password : 'cis550london',
  database : 'londondb'
});

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/map', function(request, response) {
	response.sendFile(path.join(__dirname, '/', 'map.html'));
})

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, '/', 'index.html'));
})

app.get('/searchPlace/:input', function(request, response) {
  console.log(request.params.input);
  var input = request.params.input.split('&');

  var lat = input[0];
  var lng = input[1];
  console.log(input);
  console.log(input[0]);
  console.log(input[1]);
//    {id: --,
//    name: --,
//    address: --,
//    lat: --,
//    lng: --}
  var query = "select * \
from londonAttraction a \
where 6371*ACOS(1-(POWER((SIN((90-a.lng)*3.14/180)*COS(a.lat*3.14/180) \
      -SIN((90- ? )*3.14/180)*COS( ? *3.14/180)),2) \
      +POWER((SIN((90-a.lng)*3.14/180)*SIN(a.lat*3.14/180) \
      -SIN((90- ? )*3.14/180)*SIN( ? *3.14/180)),2) \
      +POWER((COS((90-a.lng)*3.14/180)-COS((90- ? )*3.14/180)),2))/2)<1;"


    connection.query(query, [lng, lat, lng, lat, lng], function (error, results, fields) {
    if (error) throw error;
    else response.json(results);
  });
})
app.get('/name', function(request, response) {
  response.sendFile(path.join(__dirname, '/', 'name.html'));
})


app.get('/preciseSearch/:input', function(request, response) {
  var input = request.params.input;
  console.log(input)
	var query1 =" select  t.catagory, t.name, t.address\
                from londonTransportation t,\
                (select a.lat as lat0, a.lng as lng0\
                from londonAttraction a \
                where ";
  var query2 = ") as  pre\
                where power(abs(pre.lat0-t.lat)*111000,2) + power(abs(pre.lng0-t.lng)*70000,2) < power(1000,2);";
  var query3 = "select rr.name, res.address, round(avg(rr.rating),2) as average_rating,count(rr.author) as review_number,rr.author,rr.comment_date,rr.comment\
                from (select  r.name, r.address\
                from londonRestaurant r,\
                (select a.lat as lat0, a.lng as lng0\
                from londonAttraction a \
                where ";
  var query4 = ") as  pre\
                where power(abs(pre.lat0-r.lat)*111000,2) + power(abs(pre.lng0-r.lng)*70000,2) < power(1000,2)) res natural join\
                londonRestaurantReview rr\
                group by rr.name\
                order by average_rating desc;";
  var query5 = "select  h.name, h.address\
                from londonHotel h,\
                (select a.lat as lat0, a.lng as lng0\
                from londonAttraction a \
                where "
  var query6 = ") as  pre\
                where power(abs(pre.lat0-h.lat)*111000,2) + power(abs(pre.lng0-h.lng)*70000,2) < power(1000,2);";

  var q = input[0] == 0 ? "a.id = ?" : "a.name = ?";
  if (input[1] == 1) {
    var query = query1 + q + query2;

  } else if (input[2] == 1) {
    var query = query3  + q + query4;

  }else {
    var query = query5  + q + query6;

  }
	connection.query(query, input.substring(4), function (error, result, fields) {
	if (error) throw error;
	else response.json(result);
  });
})

app.get('/filter', function(request, response) {
  response.sendFile(path.join(__dirname, '/', 'filter.html'));
})


app.get('/filterSearch/:input', function(request, response) {
  var input = request.params.input;
  console.log(input)
  var query1 = "select att_res_hot_tra.id,att_res_hot_tra.attraction_name as name,att_res_hot_tra.attraction_address as address,att_res_hot_tra.restaurant_num,att_res_hot_tra.hotel_num,att_res_hot_tra.trans_num, c.level as crimeScore\
                from londonCrimeScore as c join \
                (select att_res_hot.id,att_res_hot.attraction_name,att_res_hot.attraction_address,att_res_hot.restaurant_num,att_res_hot.hotel_num, att_res_hot.lat0, att_res_hot.lng0, count(t.id) as trans_num\
                from londonTransportation t,\
                (select att_res.id,att_res.attraction_name, att_res.attraction_address, att_res.restaurant_num,att_res.lng0 as lng0, att_res.lat0 as lat0,count(h.id) as hotel_num\
                from londonHotel h,\
                (select  pre.id,pre.attraction_name, pre.lat0, pre.lng0, pre.attraction_address,count(r.id) as restaurant_num\
                from londonRestaurant r,\
                (select a.id, a.name as attraction_name, a.address as attraction_address, a.lat as lat0, a.lng as lng0\
                from londonAttraction a\
                where a.name like ?) as  pre\
                where power(abs(pre.lat0-r.lat)*111000,2) + power(abs(pre.lng0-r.lng)*70000,2) < power(300,2)\
                group by pre.attraction_name\
                having restaurant_num > ?) as att_res\
                where power(abs(att_res.lat0-h.lat)*111000,2) + power(abs(att_res.lng0-h.lng)*70000,2) < power(800,2)\
                group by att_res.attraction_name\
                having hotel_num > ?) as att_res_hot\
                where power(abs(att_res_hot.lat0-t.lat)*111000,2) + power(abs(att_res_hot.lng0-t.lng)*70000,2) < power(800,2)\
                group by att_res_hot.attraction_name\
                having trans_num > ?) as att_res_hot_tra on round(att_res_hot_tra.lat0,2) = c.lat and round(att_res_hot_tra.lng0,2) = c.lng\
                where c.level < ?\
                                ;";
  var safty = 1000000
  if (input.substring(3, 4) == 1) {
    safty = 2000
  }
	connection.query(query1, ['%'+input.substring(4)+'%', input.substring(0, 1), input.substring(1, 2), input.substring(2, 3), safty], function (error, result, fields) {
	if (error) throw error;
	else response.json(result);
  });
})


app.get('/script.js', function(request, response) {
  response.sendFile(path.join(__dirname, '/', 'script.js'));
})


var server = https.createServer(certOptions, app).listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
})
