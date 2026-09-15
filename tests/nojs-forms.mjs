// Real Next.js + curl multipart POSTs. --fixture supplies an in-memory MySQL
// protocol fixture, never a production database. No response bodies, form
// signatures, confirmation links, or server logs are printed or written.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
const require = createRequire(import.meta.url);
const fixture = process.argv.includes('--fixture');
const base = process.argv.find((arg) => arg.startsWith('http')) ?? 'http://localhost:3101';
let app, db;
let serverErrors = '';
const connections = new Set();
const writes = { leads: 0, subscribers: 0 };
function curl(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'curl.exe' : 'curl', ['-sS', '--max-time', '60', ...args], { windowsHide: true });
    const chunks = [];
    child.stdout.on('data', (data) => chunks.push(data));
    child.stderr.resume();
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(Buffer.concat(chunks).toString()) : reject(new Error(`curl exit ${code}`)));
    child.stdin.end(input);
  });
}
const decode = (value) => value.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
async function submit(path, name, overrides, expected = 'ok') {
  const url = base + path;
  const html = await curl([url]);
  const form = (html.match(/<form\b[\s\S]*?<\/form>/g) ?? []).find((item) => name === 'lead' ? item.includes('name="kind"') : name === 'newsletter' ? item.includes('name="source"') : item.includes('name="email"'));
  assert.ok(form, `${name}: server-rendered form exists`);
  assert.ok(form.includes('multipart/form-data'), `${name}: native server action encoding`);
  const fields = new Map();
  for (const tag of form.matchAll(/<(?:input|textarea|select)\b[^>]*>/g)) {
    const key = tag[0].match(/name="([^"]+)"/);
    if (key) fields.set(decode(key[1]), decode(tag[0].match(/value="([^"]*)"/)?.[1] ?? ''));
  }
  fields.set('email', `o19-${name}@example.invalid`);
  fields.set('name', 'O19 verification');
  for (const [key, value] of Object.entries(overrides ?? {})) fields.set(key, value);
  await delay(2700);
  const boundary = 'o19-' + randomUUID();
  const body = Array.from(fields, ([key, value]) => `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`).join('') + `--${boundary}--\r\n`;
  // Exact curl operation: curl.exe -sS --max-time 60 -i -X POST URL
  // -H "Referer: URL" -H "Content-Type: multipart/form-data; boundary=..."
  // --data-binary @- ; body is streamed on stdin, never saved.
  const response = await curl(['-i', '-X', 'POST', url, '-H', `Referer: ${url}`, '-H', `Content-Type: multipart/form-data; boundary=${boundary}`, '--data-binary', '@-'], body);
  const status = response.match(/^HTTP\/\S+ (\d+)/)?.[1];
  const location = response.match(/^location: (.+)$/im)?.[1].trim();
  assert.equal(status, '303', `${name}: native POST redirects`);
  assert.equal(new URL(location, base).searchParams.get(name), expected, `${name}: ${expected} result`);
  console.log(`PASS ${name}${overrides?.kind === 'whatsapp' ? ' WhatsApp-only' : ''}: curl multipart POST ${path} -> 303 ${location}`);
}
try {
  if (fixture) {
    const mysql = require('mysql2');
    db = mysql.createServer();
    db.on('connection', (connection) => {
      connections.add(connection);
      connection.on('error', (error) => { if (error.code !== 'PROTOCOL_CONNECTION_LOST') console.error('Fixture connection error:', error.code ?? error.name); });
      connection.serverHandshake({ protocolVersion: 10, serverVersion: '8.0.0-o19-fixture', connectionId: connections.size, statusFlags: 2, characterSet: 45, capabilityFlags: 0x0008a20d, authCallback: (_auth, done) => { done(null); connection._resetSequenceId(); } });
      connection.on('query', (sql) => {
        connection.sequenceId = 1;
        if (/^select/i.test(sql)) {
          connection.writeColumns([{ catalog: 'def', schema: 'o19', table: '', orgTable: '', name: 'id', orgName: 'id', columnType: 3, characterSet: 45, columnLength: 11, flags: 0, decimals: 0 }]);
          // Existing account for the magic-link fixture; other lookups are empty.
          if (/from `users`/i.test(sql)) connection.writeTextRow(['1']);
          connection.writeEof();
        } else {
          for (const table of Object.keys(writes)) if (sql.toLowerCase().startsWith(`insert into \`${table}\``)) writes[table]++;
          connection.writeOk({ affectedRows: 1, insertId: 1 });
        }
        connection._resetSequenceId();
      });
    });
    await new Promise((resolve) => db.listen(0, '127.0.0.1', resolve));
    const env = { ...process.env, DATABASE_URL: `mysql://o19@127.0.0.1:${db._server.address().port}/o19`, EMAIL_NOTIFY_TO: 'team@example.invalid' };
    for (const key of ['RESEND_API_KEY', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'VENDERCRM_API_URL', 'VENDERCRM_API_KEY']) delete env[key];
    app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', new URL(base).port], { env, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    app.stderr.on('data', (chunk) => { serverErrors = (serverErrors + chunk.toString()).slice(-20000); });
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (app.exitCode !== null) throw new Error('Next dev process exited before verification');
      try { await curl([base + '/contact']); ready = true; break; } catch { await delay(500); }
    }
    if (app.exitCode !== null) throw new Error('Next dev process exited before verification');
    assert.ok(ready, 'Next dev server became ready');
  }
  await submit('/contact', 'lead');
  await submit('/?site=guide', 'newsletter');
  await submit('/login?site=guide', 'magic');
  await submit('/contact', 'lead', { kind: 'whatsapp', email: '', whatsapp: '+595981123456' });
  await submit('/contact', 'lead', { email: 'invalid' }, 'error');
  if (fixture) {
    assert.equal(writes.leads, 2, 'Both valid leads reached database inserts');
    assert.equal(writes.subscribers, 1, 'Newsletter signup reached its database insert');
    console.log('PASS fixture inserts: 2 leads, 1 subscriber; invalid lead did not insert. Email transport: console only.');
  }
} catch (error) {
  console.error(`FAIL ${error.message}`);
  for (const line of serverErrors.split('\n')) {
    if (/TypeError:|ReferenceError:|SyntaxError:|code: '[A-Z_]+'/.test(line)) console.error(line.replace(/sql:.*/, ''));
  }
  process.exitCode = 1;
} finally {
  if (app) {
    if (process.platform === 'win32') await new Promise((resolve) => { const killer = spawn('taskkill', ['/pid', String(app.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); killer.on('close', resolve); });
    else app.kill('SIGTERM');
  }
  for (const connection of connections) connection.stream.destroy();
  if (db) db.close();
  // The mysql2 test server retains protocol command timers after socket shutdown.
  if (fixture) process.exit(process.exitCode ?? 0);
}
