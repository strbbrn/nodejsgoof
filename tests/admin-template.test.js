const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const template = fs.readFileSync(path.join(__dirname, '..', 'views', 'admin.ejs'), 'utf8')
const line = template.split('\n').find((l) => l.includes('name="redirectPage"'))

test('redirectPage is HTML-encoded in the hidden input', () => {
  const html = ejs.render(line, { redirectPage: '"><script>alert(1)</script>' })
  assert.ok(!html.includes('<script>'))
  assert.ok(html.includes('&quot;&gt;&lt;script&gt;'))
})

test('benign redirectPage is preserved', () => {
  assert.ok(ejs.render(line, { redirectPage: '/admin' }).includes('value="/admin"'))
})
