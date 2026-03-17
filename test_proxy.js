const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
  email: 'student1@edu.com',
  password: '123' 
});

const options = {
  hostname: 'edumatric-new.vercel.app',
  path: '/api/datasedu/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  const log = `STATUS: ${res.statusCode}\nHEADERS: ${JSON.stringify(res.headers, null, 2)}\n`;
  fs.writeFileSync('output.log', log);
});

req.on('error', error => {
  console.error('ERROR:', error);
});

req.write(data);
req.end();
