import React from 'react';
import { requestCoach } from '../utils/llm';
export default function ApiSettings({ config, setConfig, remember, setRemember, language }) {
  const zh = language === 'zh';
  const [status, setStatus] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const active = React.useRef(null);
  React.useEffect(() => () => active.current?.abort(), []);
  const change = (key, value) => { active.current?.abort(); setStatus(''); setConfig(c => ({ ...c, [key]: value })); };
  const style = { display: 'block', width: '100%', padding: 8, border: '1px solid currentColor', borderRadius: 8, background: 'transparent', marginTop: 4 };
  return <fieldset style={{ display: 'grid', gap: 12, minWidth: 0 }}>
    <legend>{zh ? '大模型 API（OpenAI 兼容）' : 'Model API (OpenAI compatible)'}</legend>
    <label><input type="checkbox" checked={config.enabled} onChange={e => change('enabled', e.target.checked)} /> {zh ? '启用大模型猫猫教练' : 'Enable AI cat coach'}</label>
    <label>Base URL<input style={style} type="url" placeholder="https://your-provider.example/v1" value={config.baseUrl} onChange={e => change('baseUrl', e.target.value)} /></label>
    <label>{zh ? '模型名称' : 'Model'}<input style={style} value={config.model} placeholder="model-name" onChange={e => change('model', e.target.value)} /></label>
    <label>API Key<input style={style} type="password" autoComplete="off" value={config.apiKey} placeholder={zh ? '免鉴权服务可留空' : 'Optional for unauthenticated APIs'} onChange={e => change('apiKey', e.target.value)} /></label>
    <label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> {zh ? '在本机记住密钥' : 'Remember key on this device'}</label>
    <p style={{ fontSize: 14 }}>{zh ? '密钥默认仅在当前页面有效；勾选后明文保存在本浏览器，不包含在进度备份中。任务将发送至填写的 API。服务需允许浏览器跨域请求（CORS）。地址需包含服务商要求的路径，如 /v1，也可填完整 /chat/completions 地址。测试会发送一次请求，可能产生费用。' : 'Keys stay in memory by default. Remembered keys are stored as plain text in this browser, excluded from backups. Tasks are sent to your API. The provider must allow CORS. Include the required path, such as /v1, or the full /chat/completions endpoint. Testing sends one request and may incur a charge.'}</p>
    <button type="button" style={style} disabled={busy} onClick={async () => {
      if (active.current) return;
      const controller = new AbortController(); active.current = controller; setBusy(true); setStatus('');
      try { await requestCoach(config, 'Say hello briefly.', 25, language, controller.signal); if (!controller.signal.aborted) setStatus(zh ? '连接成功' : 'Connected'); }
      catch (e) { if (!controller.signal.aborted) setStatus(e.message); }
      finally { active.current = null; setBusy(false); }
    }}>{busy ? (zh ? '测试中…' : 'Testing…') : (zh ? '测试连接' : 'Test connection')}</button>
    <button type="button" style={style} onClick={() => { change('apiKey', ''); setRemember(false); }}>{zh ? '清除密钥' : 'Clear key'}</button>
    <p role="status">{status}</p>
  </fieldset>;
}
