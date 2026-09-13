import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completionUrl, requestCoach } from '../src/utils/llm.js';
test('endpoint validation and normalization', () => {
  assert.equal(completionUrl('https://example.com/v1/'), 'https://example.com/v1/chat/completions');
  assert.equal(completionUrl('http://localhost:11434/v1/chat/completions'), 'http://localhost:11434/v1/chat/completions');
  for (const url of ['http://example.com/v1', 'javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com?key=secret']) assert.throws(() => completionUrl(url));
});
test('request, authentication, errors and cancellation', async () => {
  const original = global.fetch;
  const config = { baseUrl: 'https://example.com/v1', model: 'custom', apiKey: 'secret' };
  try {
    global.fetch = async (url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer secret');
      assert.equal(options.redirect, 'error');
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'custom');
      assert.equal(body.messages[1].content, 'write a paper');
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'Plan one step' } }] }) };
    };
    assert.equal(await requestCoach(config, 'write a paper', 25, 'zh'), 'Plan one step');
    global.fetch = async () => ({ ok: false, status: 401 });
    await assert.rejects(requestCoach(config, 'task', 25, 'en'), /HTTP 401/);
    global.fetch = async () => ({ ok: true, json: async () => ({}) });
    await assert.rejects(requestCoach(config, 'task', 25, 'en'), /Empty/);
    global.fetch = async () => { throw new TypeError('network'); };
    await assert.rejects(requestCoach(config, 'task', 25, 'en'), /CORS/);
    global.fetch = async (_, options) => { assert.equal(options.signal.aborted, true); throw new DOMException('Aborted', 'AbortError'); };
    const controller = new AbortController(); controller.abort();
    await assert.rejects(requestCoach(config, 'task', 25, 'en', controller.signal), /Cancelled/);
  } finally { global.fetch = original; }
});
