var http = require('http');
var nedb = require("nedb")
var db = new nedb ({filename : "userInfo.db", autoload: true });
const webpush = require('web-push');

webpush.setVapidDetails(
    "mailto: lokeshv23@gmail.com",
    "BJZRIKv-LoL3jyKOTHvQ6sZ_Z7BM5NYEk3LfJiNBlRQb6DMXw7y4bhW6aMrh8DNzScK7WbZl7T5VhFhWHP65vjM",
    "kJubES_cMMcwvKOCmf6geZic_jK8LNvAnuid5NaoXrQ"
);

var server = http.createServer(function (req, res) {   // 2 - creating server

    //handle incomming requests here..
    if (req.url == '/') {
        res.write('<html><body><p>Hello!!</p></body></html>');
        res.end();
    }


    if (req.url == '/registerclient') {
        var body = ''
        req.on('data', function(data) {
            body += data
        })
        req.on('end', function() {
            console.log('Content : ' + body)
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end('post received')

            var payload = JSON.parse(body);
            db.count({callInfo:payload.endPoint}, function (err, count) {
                if (count == 0 ) {
                    var pushUser = {
                        user:payload.user,
                        callInfo: payload.endPoint,
                    };
                    db.insert(pushUser, function (err) {
                        if(err)
                            console.log(err);
                        else 
                            console.log("New User Created");
                    })
                }else {
                    console.log("User already exists");
                }
            });
        })
    }

    if (req.url == '/notifyclients') {
        db.find({},function(err, users) {
            const promises = [];
            users.forEach(function(user) {
                console.log(user.user);
                console.log(user.callInfo);
                let result = webpush.sendNotification(JSON.parse(user.callInfo), 
                JSON.stringify({  "title": "Notification From Web Push Demo",
                "text": "Test Notification - EAM",
                "url" :"https://www.ultimatix.net" // icon 
       }));
                promises.push(result);
            });

            Promise.all(promises).then().catch();
        });
        res.write('<html><body><p>Notification Sent to all clients</p></body></html>');
        res.end();
    }
});
server.listen(5000); 
console.log('Node.js web server at port 5000 is running..')