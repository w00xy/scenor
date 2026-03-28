import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('GET / returns expected server response', async (t) => {
  const server = app.listen(0);

  t.after(() => {
    server.close();
  });

  const address = server.address();

  assert.ok(address && typeof address === 'object');

  const response = await fetch(`http://127.0.0.1:${address.port}/`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { message: 'Hello from server' });
});

test('GET / passes errors to error middleware', async (t) => {
  const server = app.listen(0);

  t.after(() => {
    server.close();
  });

  const address = server.address();

  assert.ok(address && typeof address === 'object');

  const response = await fetch(`http://127.0.0.1:${address.port}/?fail=true`);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.equal(body.message, 'Failed to build response');
});
