import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join('docs', 'lab-03', 'screenshots');

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ── Helper ──────────────────────────────────────────────
  async function newPage(width = 1280, height = 900) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    return ctx.newPage();
  }

  async function login(page: any, email: string, password: string) {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // Clear any existing session by going to login directly
    const emailInput = page.locator('input[type="email"], input[name="email"], #email');
    if (await emailInput.count() > 0) {
      await emailInput.fill(email);
      const pwInput = page.locator('input[type="password"], input[name="password"], #password');
      await pwInput.fill(password);
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }
  }

  async function logout(page: any) {
    // Try to find logout button
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), [data-testid="logout"]');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      // Clear localStorage and navigate to login
      await page.evaluate(() => localStorage.clear());
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    }
  }

  try {
    // ── 1. Login Screen (Desktop) ────────────────────────
    console.log('📸 1. Login Screen (Desktop)...');
    const p1 = await newPage(1280, 900);
    await p1.goto(BASE_URL);
    await p1.waitForLoadState('networkidle');
    await p1.waitForTimeout(800);
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login-screen.png'), fullPage: false });
    console.log('   ✅ 01-login-screen.png');

    // ── 2. Responsive Login (Mobile) ────────────────────
    console.log('📸 2. Responsive Login (Mobile 390px)...');
    const p2 = await newPage(390, 844);
    await p2.goto(BASE_URL);
    await p2.waitForLoadState('networkidle');
    await p2.waitForTimeout(800);
    await p2.screenshot({ path: path.join(SCREENSHOT_DIR, '09a-responsive-login.png'), fullPage: false });
    console.log('   ✅ 09a-responsive-login.png');
    await p2.close();

    // ── 3. Change Password Screen ────────────────────────
    console.log('📸 3. Mandatory Change Password Screen...');
    await p1.setViewportSize({ width: 1280, height: 900 });
    await login(p1, 'requester.david@toktickit.com', 'InitialPassword123!');
    await p1.waitForTimeout(1000);
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '02-change-password-screen.png'), fullPage: false });
    console.log('   ✅ 02-change-password-screen.png');

    // ── 4. IT Staff Ticket Queue (Desktop) ──────────────
    console.log('📸 4. IT Staff Ticket Queue (Desktop)...');
    await p1.evaluate(() => localStorage.clear());
    await p1.goto(BASE_URL);
    await p1.waitForLoadState('networkidle');
    await login(p1, 'staff.alex@toktickit.com', 'Password123!');
    await p1.waitForTimeout(1200);
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '03-staff-ticket-queue.png'), fullPage: false });
    console.log('   ✅ 03-staff-ticket-queue.png');

    // ── 5. Responsive Staff Queue (Mobile) ──────────────
    console.log('📸 5. Responsive Staff Queue (Mobile)...');
    await p1.setViewportSize({ width: 390, height: 844 });
    await p1.waitForTimeout(500);
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '09b-responsive-staff-queue.png'), fullPage: false });
    console.log('   ✅ 09b-responsive-staff-queue.png');

    // ── 6. Ticket Detail ─────────────────────────────────
    console.log('📸 6. IT Staff Ticket Detail...');
    await p1.setViewportSize({ width: 1280, height: 900 });
    await p1.waitForTimeout(300);
    // Click first ticket row
    const ticketRow = p1.locator('table tbody tr, [data-testid="ticket-row"], .ticket-row, tr').first();
    if (await ticketRow.count() > 0) {
      await ticketRow.click();
      await p1.waitForLoadState('networkidle');
      await p1.waitForTimeout(800);
    }
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '04-staff-ticket-detail.png'), fullPage: false });
    console.log('   ✅ 04-staff-ticket-detail.png');

    // ── 7. Comments & Internal Notes ────────────────────
    console.log('📸 7. Comments & Internal Notes...');
    await p1.evaluate(() => window.scrollBy(0, 600));
    await p1.waitForTimeout(500);
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '05-comments-and-internal-notes.png'), fullPage: false });
    console.log('   ✅ 05-comments-and-internal-notes.png');

    // ── 8. Admin User Management ─────────────────────────
    console.log('📸 8. Admin User Management...');
    await p1.evaluate(() => localStorage.clear());
    await p1.goto(BASE_URL);
    await p1.waitForLoadState('networkidle');
    await login(p1, 'admin@toktickit.com', 'Password123!');
    await p1.waitForTimeout(1000);
    // Navigate to user management
    const userMgmtLink = p1.locator('a:has-text("User"), button:has-text("User Management"), [href*="user"], [href*="admin"]').first();
    if (await userMgmtLink.count() > 0) {
      await userMgmtLink.click();
      await p1.waitForLoadState('networkidle');
      await p1.waitForTimeout(800);
    }
    await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '06-admin-user-management.png'), fullPage: false });
    console.log('   ✅ 06-admin-user-management.png');

    // ── 9. Create User Modal ─────────────────────────────
    console.log('📸 9. Create User Modal...');
    const createBtn = p1.locator('button:has-text("Create"), button:has-text("New User"), button:has-text("Add User"), button:has-text("+ User")').first();
    if (await createBtn.count() > 0) {
      await createBtn.click();
      await p1.waitForTimeout(600);
      await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '07-create-user-modal.png'), fullPage: false });
      console.log('   ✅ 07-create-user-modal.png');
      await p1.keyboard.press('Escape');
      await p1.waitForTimeout(400);
    } else {
      console.log('   ⚠️  Create button not found, taking page screenshot');
      await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '07-create-user-modal.png'), fullPage: false });
    }

    // ── 10. Edit User Modal ──────────────────────────────
    console.log('📸 10. Edit User Modal...');
    const editBtn = p1.locator('button:has-text("Edit"), button[aria-label*="Edit"], [data-testid*="edit"]').first();
    if (await editBtn.count() > 0) {
      await editBtn.click();
      await p1.waitForTimeout(600);
      await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '08-edit-and-reset-password-modal.png'), fullPage: false });
      console.log('   ✅ 08-edit-and-reset-password-modal.png');
    } else {
      console.log('   ⚠️  Edit button not found, taking page screenshot');
      await p1.screenshot({ path: path.join(SCREENSHOT_DIR, '08-edit-and-reset-password-modal.png'), fullPage: false });
    }

    // ── 11. Test Results Screenshot ──────────────────────
    console.log('\n✅ All screenshots done!');
    console.log('📁 Saved to:', path.resolve(SCREENSHOT_DIR));

    const files = fs.readdirSync(SCREENSHOT_DIR);
    console.log('Files:', files.join(', '));

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
