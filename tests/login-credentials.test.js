const test = require('node:test')
const assert = require('node:assert')
const utils = require('../utils')

test('accepts plain string credentials', () => {
  assert.deepStrictEqual(utils.loginCredentials({ username: 'user@example.com', password: 'pw' }),
    { username: 'user@example.com', password: 'pw' })
})

test('rejects NoSQL operator payloads', () => {
  const payloads = [
    { username: 'user@example.com', password: { $ne: null } },
    { username: { $gt: '' }, password: 'pw' },
    { username: 'user@example.com', password: { $regex: '.*' } },
    { username: 'user@example.com', password: { $where: '1==1' } },
    { username: ['a@b.co'], password: 'pw' },
  ]
  for (const p of payloads) assert.strictEqual(utils.loginCredentials(p), null)
})

test('rejects missing body or fields', () => {
  assert.strictEqual(utils.loginCredentials(undefined), null)
  assert.strictEqual(utils.loginCredentials({}), null)
})
