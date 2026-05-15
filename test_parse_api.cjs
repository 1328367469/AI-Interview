const fs = require('fs');
const FormData = require('form-data');

const pdfContent = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nF3NOw6DMAwF0Jm5whV+kE+QkEgoA+ISiC5dxN1T1CpA1H561kviN4+xN10rYQj6X7V2uK/Z086Tz9+5I5hQ2j9hLhGj9BEMM0z1V++aMUV2t1a1t4bUv4Z207t2Vz/XyB9COgoKZW5kc3RyZWFtCmVuZG9iagoKCjMgMCBvYmoKOTEKZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvTWVkaWFCb3hbMCAwIDU5NS4yOCA4NDEuODldL1BhcmVudCA1IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNiAwIFI+Pj4+L0NvbnRlbnRzIDIgMCBSPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvS2lkc1s0IDAgUl0vQ291bnQgMT4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKCjcgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDUgMCBSPj4KZW5kb2JqCgo4IDAgb2JqCjw8L1Byb2R1Y2VyKGpkZik+PgplbmRvYmoKCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxNzkgMDAwMDAgbiAKMDAwMDAwMDIwMCAwMDAwMCBuIAowMDAwMDAwMzI3IDAwMDAwIG4gCjAwMDAwMDAzODUgMDAwMDAgbiAKMDAwMDAwMDQ3MiAwMDAwMCBuIAowMDAwMDAwNTIzIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA5L1Jvb3QgNyAwIFIvSW5mbyA4IDAgUj4+CnN0YXJ0eHJlZgo1NTkKJSVFT0YK";
fs.writeFileSync('test1.pdf', Buffer.from(pdfContent, 'base64'));

async function run() {
  const form = new FormData();
  form.append('resume', fs.createReadStream('test1.pdf'));
  
  const { default: fetch } = await import('node-fetch');

  const res = await fetch('http://localhost:3000/api/parse-resume', {
    method: 'POST',
    body: form
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
