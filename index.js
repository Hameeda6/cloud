
const express = require('express');
const multer = require('multer');
const server = express();

const AWS = require('aws-sdk');
const PORT = process.env.PORT || 3000;
const { spawn } = require('child_process');

const upload = multer({ dest: __dirname + '/upload_images' });
const ID = 'AKIAV2H4JEE2V2XBIVXY';
const SECRET = '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';
var fs = require('fs');
var path = require("path");
server.use(express.static('public'));

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});



const test = (fileName) => {
  const python = spawn("python3", ["../face_recognition.py", fileName]);
  var file = path.basename(fileName);
  python.stdout.on("data", (data) => {
    console.log(file)
    console.log(data.toString())
    var content = file + "  " + data.toString()
    fs.appendFileSync('output.txt', content)
  });

  python.stderr.on("data", (data) => {
    console.error(data.toString());
  });

};

const uploadFile = (fileName) => {

  const fileContent = fs.readFileSync(fileName);

  var file = path.basename(fileName);

  const params = {
    Bucket: 'impcloud',
    Key: file, // File name you want to save as in S3
    Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};


const outputFile = (fileName) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  var file = path.basename(fileName);

  const params = {
    Bucket: 'outcloud1',
    Key: file, // File name you want to save as in S3
    Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};


// "myfile" is the key of the http payload
server.post('/', upload.single('myfile'), function (request, respond) {
  if (request.file) console.log(request.file);

  // Uploading files to the bucket
  // save the image

  fs.rename(__dirname + '/upload_images/' + request.file.filename, __dirname + '/upload_images/' + request.file.originalname, function (err) {
    if (err) console.log('ERROR: ' + err);
  });



  uploadFile(__dirname + '/upload_images/' + request.file.originalname);
  test(__dirname + '/upload_images/' + request.file.originalname);
  outputFile(__dirname + '/output.txt');


  respond.end(request.file.originalname + ' uploaded!');
  // respond.end("uploaded");

});

const hostname = '0.0.0.0';
server.listen(PORT, () => {
  console.log(`Server listening in port ${PORT}`)
});

