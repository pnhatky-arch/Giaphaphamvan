import fs from 'node:fs';
import assert from 'node:assert/strict';

const index=fs.readFileSync('public/index.html','utf8');
const fix=fs.readFileSync('public/auth-fix.js','utf8');
const auth=fs.readFileSync('public/auth-audit.js','utf8');
const theme=fs.readFileSync('public/auth-theme.js','utf8');

assert.ok(index.includes('/auth-fix.js?v=1')&&index.indexOf('/auth-fix.js?v=1')<index.indexOf('/auth-audit.js?v=1'),'fresh-auth bootstrap must load before auth runtime');
assert.ok(index.includes('<strong>Chưa đăng nhập</strong>'),'legacy family pseudo-account must not be the default account card');
assert.ok(index.includes('Tài khoản đăng nhập hiện tại'),'settings must describe the real login account');
assert.ok(!index.includes('<div class="account-avatar">PV</div><div><strong>Gia phả họ Phạm Văn</strong>'),'legacy family pseudo-account card must be removed');
assert.ok(fix.includes("localStorage.removeItem(SESSION_KEY)"),'auth revision must force one clean logout');
assert.ok(fix.includes("GATE_VERSION='3'"),'auth gate revision marker missing');
assert.ok(fix.includes("delete data.account"),'legacy family account data must be migrated away');
assert.ok(fix.includes('body[data-authenticated="false"] .app-shell'),'application shell must stay hidden until authenticated');
assert.ok(fix.includes("/auth-theme.js?v=1"),'Dong Son authentication theme must be loaded');
assert.ok(auth.includes('Đăng nhập')&&auth.includes('Đăng ký'),'login and registration gate must remain available');
assert.ok(auth.includes("const ROOT_USERNAME = 'devphamgia'"),'root account must remain devphamgia');
assert.ok(theme.includes('heritage-auth-drum'),'Dong Son drum visual must be present');
assert.ok(theme.includes('Giữ cội nguồn · Kết nối muôn đời'),'approved welcome motto missing');
assert.ok(theme.includes('data-auth-screen="welcome"')&&theme.includes('data-auth-screen="login"')&&theme.includes('data-auth-screen="register"'),'welcome/login/register flow must remain three-stage');
assert.ok(theme.includes("Auth()?.login")&&theme.includes("Auth()?.register"),'themed forms must use the existing account runtime');

console.log('Giaphaphamvan Dong Son login/register experience audit: PASS');