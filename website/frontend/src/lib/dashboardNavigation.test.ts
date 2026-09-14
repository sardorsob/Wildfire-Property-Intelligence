const assert = await import('node:' + 'assert/strict')
const { default: test } = await import('node:' + 'test')
import { pageFromPathname, pagePath } from './dashboardNavigation.ts'

test('pageFromPathname resolves dashboard routes and falls back to home', () => {
    assert.equal(pageFromPathname('/conditional-probability'), 'conditional-probability')
    assert.equal(pageFromPathname('/unknown'), 'home')
})

test('pagePath keeps home at the root and uses page ids elsewhere', () => {
    assert.equal(pagePath('home'), '/')
    assert.equal(pagePath('morans-i'), '/morans-i')
})
