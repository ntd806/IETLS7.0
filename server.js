const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
const root = path.resolve(process.env.DOCUMENTS_DIR || __dirname);
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
async function files() {
  return (await fs.readdir(root, { withFileTypes: true }))
    .filter(f => f.isFile() && f.name.endsWith('.md')).map(f => f.name).sort();
}
function reply(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (req.method === 'GET' && url.pathname === '/api/files') return reply(res, 200, await files());
    if (url.pathname === '/api/document') {
      const name = url.searchParams.get('name');
      if (!(await files()).includes(name)) return reply(res, 404, { error: 'Không tìm thấy tài liệu.' });
      const target = path.join(root, name);
      if (req.method === 'GET') {
        const source = await fs.readFile(target, 'utf8');
        return reply(res, 200, { source, html: md.render(source) });
      }
      if (req.method === 'PUT') {
        if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') return reply(res, 403, { error: 'Yêu cầu không hợp lệ.' });
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 2_000_000) return reply(res, 413, { error: 'Tài liệu quá lớn.' });
        }
        const { source, original } = JSON.parse(body);
        if (typeof source !== 'string' || typeof original !== 'string') return reply(res, 400, { error: 'Nội dung không hợp lệ.' });
        if (await fs.readFile(target, 'utf8') !== original) return reply(res, 409, { error: 'File đã thay đổi bên ngoài ứng dụng. Hãy tải lại trước khi lưu.' });
        const temporary = path.join(root, '.tmp', name);
        await fs.mkdir(path.dirname(temporary), { recursive: true });
        await fs.writeFile(temporary, source);
        await fs.rename(temporary, target);
        return reply(res, 200, { source, html: md.render(source) });
      }
    }
    const assets = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
    if (req.method === 'GET' && assets[url.pathname]) {
      const [file, type] = assets[url.pathname];
      return reply(res, 200, await fs.readFile(path.join(root, 'web', file)), `${type}; charset=utf-8`);
    }
    reply(res, 404, { error: 'Không tìm thấy trang.' });
  } catch (error) { reply(res, 500, { error: 'Không thể xử lý yêu cầu.' }); }
});
server.listen(port, host, () => console.log(`IELTS workspace: ${origin}`));
