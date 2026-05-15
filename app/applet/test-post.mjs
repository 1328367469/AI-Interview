import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function run() {
  const form = new FormData();
  form.append('resume', fs.createReadStream('test.pdf'));
  
  const res = await fetch('http://localhost:3000/api/parse-resume', {
    method: 'POST',
    body: form
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
