export function completionUrl(value) {
  let url;
  try { url = new URL(value.trim()); } catch { throw Error('API 地址无效 / Invalid API URL'); }
  if (url.username || url.password || url.search || url.hash || !['https:', 'http:'].includes(url.protocol)) throw Error('API 地址无效 / Invalid API URL');
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw Error('远程 API 需要 HTTPS / Remote APIs require HTTPS');
  url.pathname = url.pathname.replace(/\/+$/, '');
  if (!url.pathname.endsWith('/chat/completions')) url.pathname += '/chat/completions';
  return url.href;
}
export async function requestCoach(config, task, minutes, language, signal) {
  const url = completionUrl(config.baseUrl);
  if (!config.model.trim()) throw Error('请填写模型名称 / Model required');
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 45000);
  try {
    const response = await fetch(url, {
      method: 'POST', redirect: 'error', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(config.apiKey.trim() ? { Authorization: 'Bearer ' + config.apiKey.trim() } : {}) },
      body: JSON.stringify({ model: config.model.trim(), stream: false, messages: [
        { role: 'system', content: 'You are a friendly cat focus coach. Reply in ' + (language === 'zh' ? 'Chinese' : 'English') + ' with three brief practical steps for a ' + minutes + '-minute session. Use plain text.' },
        { role: 'user', content: task.trim().slice(0, 4000) }
      ] })
    });
    if (!response.ok) throw Error('API 请求失败 / Request failed (HTTP ' + response.status + ')');
    let data;
    try { data = await response.json(); } catch { throw Error('接口未返回 JSON / Invalid JSON'); }
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw Error('回答为空或接口不兼容 / Empty or incompatible response');
    return content.trim();
  } catch (error) {
    if (error.name === 'AbortError') throw Error('请求已取消或超时（45 秒） / Cancelled or timed out (45s)');
    if (error instanceof TypeError) throw Error('连接失败，请检查地址、网络和 CORS / Check URL, network and CORS');
    throw error;
  } finally { clearTimeout(timeout); signal?.removeEventListener('abort', cancel); }
}
