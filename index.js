// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;
// app.get('/',(req, res) => res.send('Hello World'));
// app.listen(PORT, () => console.log(`Server listening in port ${PORT}`))

// we use express and multer libraries to send images
const express = require('express');
const multer = require('multer');
const server = express();
// const PORT = 3000;
const AWS = require('aws-sdk');
const PORT = process.env.PORT || 3000;

// uploaded images are saved in the folder "/upload_images"
const upload = multer({dest: __dirname + '/upload_images'});
const ID = 'AKIAV2H4JEE2TXQJE442';
const SECRET = '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';
var fs = require('fs');
var path = require("path");
// The name of the bucket that you have created
// const BUCKET_NAME = 'test-bucket';

server.use(express.static('public'));

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

const pythonPromise = (data) => {
  return new Promise((resolve, reject) => {
    const python = spawn("python", ["../face_recognition.py",data]);

    python.stdout.on("data", (data) => {
      console.log(data.toString())
      resolve(data.toString());
    });

    python.stderr.on("data", (data) => {
      reject(data.toString());
    });
  });
};

app.get("/test", async (req, res) => {
  //const { name, id } = req.params;
  const dataFromPython = await pythonPromise("./cloud/upload_images/test_00.jpg");
  res.send(dataFromPython);
});

const uploadFile = (fileName) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  var file = path.basename(fileName);

  const params = {
      Bucket: 'impcloud',
      Key: file, // File name you want to save as in S3
      Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
  });
};


// "myfile" is the key of the http payload
server.post('/', upload.single('myfile'), function(request, respond) {
  if(request.file) console.log(request.file);
  
  

// Uploading files to the bucket

  // save the image
  
  fs.rename(__dirname + '/upload_images/' + request.file.filename, __dirname + '/upload_images/' + request.file.originalname, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  });

  

  uploadFile(__dirname+'/upload_images/'+request.file.originalname);

 

 respond.end(request.file.originalname + ' uploaded!');
// respond.end("uploaded");
}); 

// You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine
const hostname = '0.0.0.0';
server.listen(PORT, () => {
    // console.log(`Server running at http://${hostname}:${PORT}/`);
    console.log(`Server listening in port ${PORT}`)
  });

