import { describe, expect, test } from 'bun:test'
import { normalizeDaemonAddress, validateConnectionConfig } from './connection'

describe('normalizeDaemonAddress', () => {
  test('normalizes host, HTTP, and daemon paths', () => {
    expect(normalizeDaemonAddress('host.example:34123')).toBe(
      'ws://host.example:34123',
    )
    expect(normalizeDaemonAddress('https://launcher.example/v1?token=nope')).toBe(
      'wss://launcher.example',
    )
    expect(normalizeDaemonAddress('HTTP://LAUNCHER.EXAMPLE/v1')).toBe(
      'ws://launcher.example',
    )
  })

  test('rejects unsupported schemes and credentials', () => {
    expect(() => normalizeDaemonAddress('ftp://launcher.example')).toThrow()
    expect(() => normalizeDaemonAddress('ws://token@launcher.example')).toThrow()
  })

  test('requires a token without putting it in the address', () => {
    expect(() =>
      validateConnectionConfig({ address: 'launcher.example', token: '  ' }),
    ).toThrow('token')
    expect(
      validateConnectionConfig({ address: 'launcher.example', token: 'secret' }),
    ).toEqual({
      address: 'ws://launcher.example',
      token: 'secret',
      remember: false,
    })
  })
})
