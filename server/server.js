require('dotenv').config()

const httpServer = require("http").createServer();
const AWS = require('aws-sdk');
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const formidable = require('express-formidable');
const fs = require('fs');

// Set the Region 
AWS.config.update({region: 'us-east-2'});
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var uploadParams = {Bucket: 'test-bucket-ectchiu', Key: '', Body: ''};
var bucketParams = {
  Bucket : 'test-bucket-ectchiu',
};

const port = 8000;
const serverPort = 5000

const io = require('socket.io')(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let files = {};

// ********************** socket connection *************************
io.on('connection', (client) => {
  let fileName = client.handshake.query['fileName']
  
  if(fileName) {
    client.join(fileName);

    var params = {
      Bucket: 'test-bucket-ectchiu', 
      Key: fileName
    };

    s3.getObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        files[fileName] = data.Body.toString()          // successful response
        io.to(fileName).emit('updatedMessage', files[fileName]);
      }
    })
 

    client.on('textEdit', (msg) => {
      files[fileName] = msg
      io.to(fileName).emit('updatedMessage', msg)
    });

    client.on('saveFile', (fileId) => {
      uploadParams.Key = fileId
      uploadParams.Body = files[fileName]
      s3.upload (uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } if (data) {
          console.log("Upload Success", data.Location);
          io.to(fileName).emit('fileSaved');
        }
      });
    })
  } 
})

io.listen(port);
console.log('socket listening on port: ', port);

// ************************** express application **********************

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(formidable());

app.get('/getFiles', (req, res) => {
  s3.listObjects(bucketParams, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
      const fileNames = data.Contents.map((object) => {
        return { 'name': object.Key };
      })
      res.send(fileNames)
    }
  });
})

app.post('/addFile', (req, res) => {
  console.log(req.body)
  uploadParams.Key = req.body.fileName
  uploadParams.Body = ''
  s3.upload (uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
      res.send('Upload Success')
    }
  });
})

app.post('/uploadFile', (req, res) => {
  uploadParams.Key = req.files['newFile'].name
  console.log(req.files['newFile'])
  const fileStream = fs.createReadStream(req.files['newFile'].path);
  uploadParams.Body = fileStream
  s3.upload (uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
      res.send('Upload Success')
    }
  });
})

app.listen(serverPort, () => {
  console.log(`Example app listening at http://localhost:${serverPort}`)
})