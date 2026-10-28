const test = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

// Register the models without connecting to a database
mongoose.model('Todo', new mongoose.Schema({ content: Buffer, updated_at: Date }))
const User = mongoose.model('User', new mongoose.Schema({ username: String, password: String }))
const routes = require('../routes/index')

function run(body, users) {
  const calls = []
  User.find = function (query, cb) {
    calls.push(query)
    cb(null, users || [])
  }
  const res = {
    statusCode: null,
    redirected: null,
    status(code) { this.statusCode = code; return this },
    send() { return this },
    redirect(page) { this.redirected = page; return this },
  }
  routes.loginHandler({ body, session: {} }, res, () => {})
  return { calls, res }
}

test('operator object as password is rejected without querying', () => {
  const { calls, res } = run({ username: 'user@example.test', password: { $ne: '' } }, [{}])
  assert.strictEqual(calls.length, 0)
  assert.strictEqual(res.statusCode, 401)
})

test('non-string username is rejected without querying', () => {
  const { calls, res } = run({ username: { $ne: '' }, password: 'pw' }, [{}])
  assert.strictEqual(calls.length, 0)
  assert.strictEqual(res.statusCode, 401)
})

test('valid string credentials are queried as-is and log in', () => {
  const { calls, res } = run({ username: 'user@example.test', password: 'pw', redirectPage: '/' }, [{}])
  assert.deepStrictEqual(calls, [{ username: 'user@example.test', password: 'pw' }])
  assert.strictEqual(res.redirected, '/')
})

test('no matching user returns 401', () => {
  const { res } = run({ username: 'user@example.test', password: 'wrong' }, [])
  assert.strictEqual(res.statusCode, 401)
})
