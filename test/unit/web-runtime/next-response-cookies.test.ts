/**
 * @jest-environment @edge-runtime/jest-environment
 */

it('reflect .set into `set-cookie`', async () => {
  const { NextResponse } = await import(
    'next/dist/server/web/spec-extension/response'
  )

  const response = new NextResponse()
  expect(response.cookies.get('foo')?.value).toBe(undefined)
  expect(response.cookies.get('foo')).toEqual(undefined)

  response.cookies
    .set('foo', 'bar', { path: '/test' })
    .set('fooz', 'barz', { path: '/test2' })

  expect(response.cookies.get('foo')?.value).toBe('bar')
  expect(response.cookies.get('fooz')?.value).toBe('barz')

  expect(response.cookies.get('foo')).toEqual({
    name: 'foo',
    value: 'bar',
    Path: '/test',
  })
  expect(response.cookies.get('fooz')).toEqual({
    name: 'fooz',
    value: 'barz',
    Path: '/test2',
  })

  expect(Object.fromEntries(response.headers.entries())['set-cookie']).toBe(
    'foo=bar; Path=/test, fooz=barz; Path=/test2'
  )
})

it('reflect .delete into `set-cookie`', async () => {
  const { NextResponse } = await import(
    'next/dist/server/web/spec-extension/response'
  )

  const response = new NextResponse()

  response.cookies.set('foo', 'bar')
  expect(Object.fromEntries(response.headers.entries())['set-cookie']).toBe(
    'foo=bar; Path=/'
  )

  expect(response.cookies.get('foo')?.value).toBe('bar')
  expect(response.cookies.get('foo')).toEqual({
    name: 'foo',
    path: '/',
    value: 'bar',
  })

  response.cookies.set('fooz', 'barz')
  expect(Object.fromEntries(response.headers.entries())['set-cookie']).toBe(
    'foo=bar; Path=/, fooz=barz; Path=/'
  )

  expect(response.cookies.get('fooz')?.value).toBe('barz')
  expect(response.cookies.get('fooz')).toEqual({
    name: 'fooz',
    value: 'barz',
    Path: '/',
  })

  const firstDelete = response.cookies.delete('foo')
  expect(firstDelete).toBe(true)
  expect(Object.fromEntries(response.headers.entries())['set-cookie']).toBe(
    'foo=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT, fooz=barz; Path=/'
  )

  expect(response.cookies.get('foo')?.value).toBe(undefined)
  expect(response.cookies.get('foo')).toEqual({
    name: 'foo',
    value: undefined,
  })

  const secondDelete = response.cookies.delete('fooz')
  expect(secondDelete).toBe(true)

  expect(Object.fromEntries(response.headers.entries())['set-cookie']).toBe(
    'fooz=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT, foo=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  )

  expect(response.cookies.get('fooz')?.value).toBe(undefined)
  expect(response.cookies.get('fooz')).toEqual({
    name: 'fooz',
    value: undefined,
  })
})

it('response.cookie does not modify options', async () => {
  const { NextResponse } = await import(
    'next/dist/server/web/spec-extension/response'
  )

  const options = { maxAge: 10000 }
  const response = new NextResponse(null, {
    headers: { 'content-type': 'application/json' },
  })
  response.cookies.set('cookieName', 'cookieValue', options)
  expect(options).toEqual({ maxAge: 10000 })
})
