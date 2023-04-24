var http = require('http');

var fs = require('fs');

var qs = require('querystring');

var url = require('url');

var path = require('path');

var urlPath = path.join(__dirname + './index.html');

var server = http.createServer(handleRequest);


function handleRequest(req, res){
    let parsedUrl = url.parse(req.url, true);

    let pathname = parsedUrl.pathname;
  
  

    var store = '';

    req.on('data', (chunk)=>{
     
        store += chunk;
    });

    req.on('end',()=>{
        if(req.method === "GET" && req.url ==="/"){
            res.setHeader('content-type','text/html');
            fs.createReadStream("./index.html").pipe(res);

            console.log(store);
        }else if(req.method === "GET" && req.url ==="/about"){
            res.setHeader('content-type','text/html');
            fs.createReadStream("./about.html").pipe(res);

            console.log(store);
        }else if(req.method === "GET" && req.url ==="/contact"){
            res.setHeader('content-type','text/html');
            fs.createReadStream("./contact.html").pipe(res);

            console.log(store);
        }else if(req.method === "POST" && req.url ==="/form"){
            let parsedData = qs.parse(store);
            let stringifiedData = JSON.stringify(parsedData);
            fs.open(urlPath + parsedData.username + ".json","wx",(err,fd)=>{
                if(err){
                    res.setHeader('content-type', "text/html");
                    res.end("<h1>Username Already Exist!<h/1>")
                }
                fs.write(fd,stringifiedData,(err)=>{
                    if(err) return console.log(err);
                    fs.close(fd,(err)=>{
                        if(err) return console.log(err);
                        res.setHeader('content-type','text/html');
                        res.write(`<h2>${parsedData.username} contact save</h2>`);
                        res.end();
                    })
                })
            })
        }
        else if (pathname === "/users" && req.method === "GET") {
            if (!req.url.includes("?")) {
              fs.readdir(urlPath, function (err, files) {
                //handling error
                if (err) { 
                  return console.log("Unable to scan directory: " + err);
                }
                var length = files.length;
                var count = 1;
                files.forEach(function (file) {
                  console.log(file);
                  fs.readFile(urlPath + file, (err, content) => {
                    if (err) return console.log(err);
                    if (count < length) {
                      count++;
                      res.write(content);
                    } else {
                      return res.end(content);
                    }
                  });
                });
              });
            } 
            else if (parsedUrl.query.username) {
              let userFileName = path.join(
                urlPath + parsedUrl.query.username + ".json"
              );
              fs.readFile(userFileName, "utf8", (err, content) => {
                res.setHeader("Content-Type", "text/html");
                return res.end(content);
              });
            }
          }
      
          //Handling with the  css request
    else if (req.method === "GET" && req.url.split(".").pop() === "css") {
        const cssFile = req.url;
        res.setHeader("Content-Type", "text/css");
        fs.readFile(__dirname + cssFile, "utf8", (err, content) => {
          if (err) return console.log(err);
          res.end(content);
        });
      }
      // Handling with the images requests
      else if (req.method === "GET" && req.url.split(".").pop() === "jpg") {
        const imageUrl = req.url;
        res.setHeader("Content-Type", "image/jpg");
        fs.createReadStream(__dirname + req.url).pipe(res);
      }
    });
  }
  
        




server.listen(5000, ()=>{
    console.log('server running at port 5k');
})