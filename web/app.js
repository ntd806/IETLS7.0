const $ = id => document.getElementById(id);
let names = [], current = '', original = '', mode = 'preview', busy = false;
const dirty = () => $('editor').value !== original;
function message(text, error = false) { $('message').textContent = text; $('message').hidden = !text; $('message').className = error ? 'error' : ''; }
async function api(url, options) {
  const res = await fetch(url, options); const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Không thể tải tài liệu.');
  return data;
}
function renderFiles() {
  $('files').replaceChildren();
  for (const name of names.filter(n => n.toLowerCase().includes($('search').value.toLowerCase()))) {
    const button = document.createElement('button'); button.className = 'file' + (name === current ? ' active' : '');
    button.textContent = '▤  ' + name; button.title = name; button.onclick = () => load(name); $('files').append(button);
  }
}
function setMode(next) {
  mode = next;
  $('preview').hidden = next !== 'preview'; $('raw').hidden = next !== 'raw'; $('editor').hidden = next !== 'edit';
  $('save').hidden = $('cancel').hidden = next !== 'edit';
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', b.dataset.mode === next));
  $('state').textContent = dirty() ? 'Chưa lưu' : '';
}
function update(data) { original = data.source; $('editor').value = original; $('raw').textContent = original; $('preview').innerHTML = data.html; }
async function load(name) {
  if (busy || name === current) return;
  if (dirty() && !confirm('Bạn có thay đổi chưa lưu. Bỏ thay đổi và mở file khác?')) return;
  busy = true; message('Đang tải…');
  try { const data = await api('/api/document?name=' + encodeURIComponent(name)); current = name; update(data); $('filename').textContent = name; renderFiles(); setMode('preview'); message(''); }
  catch (e) { message(e.message, true); } finally { busy = false; }
}
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
$('search').oninput = renderFiles;
$('editor').oninput = () => { $('state').textContent = dirty() ? 'Chưa lưu' : ''; };
$('cancel').onclick = () => { if (dirty() && !confirm('Bỏ các thay đổi chưa lưu?')) return; $('editor').value = original; setMode('preview'); message(''); };
$('save').onclick = async () => {
  if (busy) return; busy = true; $('save').disabled = $('editor').disabled = true;
  try { update(await api('/api/document?name=' + encodeURIComponent(current), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: $('editor').value, original }) })); setMode('preview'); message('Đã lưu vào file Markdown.'); }
  catch (e) { message(e.message, true); } finally { busy = false; $('save').disabled = $('editor').disabled = false; }
};
window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
function theme(value) { document.documentElement.dataset.theme = value; localStorage.setItem('ielts-theme', value); }
theme(localStorage.getItem('ielts-theme') || 'light');
$('theme').onclick = () => theme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
api('/api/files').then(data => { names = data; renderFiles(); if (names.length) load(names.includes('Writing.md') ? 'Writing.md' : names[0]); else message('Chưa có tài liệu Markdown.'); }).catch(e => message(e.message, true));
