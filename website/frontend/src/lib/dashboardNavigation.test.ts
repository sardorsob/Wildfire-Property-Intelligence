const assert = await import('node:' + 'assert/strict')
const { default: test } = await import('node:' + 'test')
import { pageFromPathname, pagePath, shouldHandleDashboardClick } from './dashboardNavigation.ts'

test('pageFromPathname resolves dashboard routes and falls back to home', () => {
    assert.equal(pageFromPathname('/conditional-probability'), 'conditional-probability')
    assert.equal(pageFromPathname('/unknown'), 'home')
})

test('pagePath keeps home at the root and uses page ids elsewhere', () => {
    assert.equal(pagePath('home'), '/')
    assert.equal(pagePath('morans-i'), '/morans-i')
})

test('dashboard navigation only intercepts unmodified primary clicks', () => {
    assert.equal(shouldHandleDashboardClick({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), true)
    assert.equal(shouldHandleDashboardClick({ button: 1, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), false)
    assert.equal(shouldHandleDashboardClick({ button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false }), false)
    assert.equal(shouldHandleDashboardClick({ button: 0, metaKey: false, ctrlKey: true, shiftKey: false, altKey: false }), false)
})
