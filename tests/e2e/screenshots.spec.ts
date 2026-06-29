import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Direktori untuk menyimpan screenshot
const SC_DIR = path.resolve(__dirname, '../../../docs/images');

// Pastikan direktori ada
if (!fs.existsSync(SC_DIR)) {
  fs.mkdirSync(SC_DIR, { recursive: true });
}

test.describe('Ambil Screenshot untuk User Manual', () => {
  // Tambahkan timeout keseluruhan karena kita menavigasi banyak halaman
  test.setTimeout(180000); // 3 menit

  // Setup: Login sebelum tes
  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman login
    await page.goto('/');
    
    // Tunggu jika ada delay
    await page.waitForTimeout(1000);

    // Ambil screenshot halaman login sebelum diisi
    await page.screenshot({ path: path.join(SC_DIR, '01_login.png') });

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="username" i], input[name="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Masuk")').first();

    if (await emailInput.isVisible()) {
        // Kredensial sesuai persetujuan
        await emailInput.fill('admin_pos');
        await passwordInput.fill('password');
        
        await page.waitForTimeout(500); // Jeda sejenak untuk screenshot saat diisi
        await page.screenshot({ path: path.join(SC_DIR, '02_login_filled.png') });

        await loginButton.click();
        
        // Tunggu navigasi selesai
        await page.waitForURL('**/admin**', { timeout: 15000 }).catch(() => console.log('Timeout waiting for admin url, continuing...'));
        await page.waitForLoadState('domcontentloaded');
    }
  });

  test('Screenshot Seluruh Halaman Fitur', async ({ page }) => {
    const pages = [
      { url: '/admin', name: '03_dashboard.png' },
      
      // Kasir / POS
      { url: '/checkout', name: '04_pos_checkout.png' },
      
      // Master Data
      { url: '/admin/products', name: '05_master_products.png' },
      { url: '/admin/categories', name: '06_master_categories.png' },
      { url: '/admin/brands', name: '07_master_brands.png' },
      { url: '/admin/suppliers', name: '08_master_suppliers.png' },
      { url: '/admin/members', name: '09_master_members.png' },
      
      // Inventori / Stok
      { url: '/admin/inventory/stock-opname', name: '10_inventory_opname.png' },
      { url: '/admin/inventory/adjustments', name: '11_inventory_adjustment.png' },
      
      // Pembelian
      { url: '/admin/purchase/order', name: '12_purchase_order.png' },
      { url: '/admin/purchase/receiving', name: '13_purchase_receiving.png' },
      { url: '/admin/purchase/return', name: '14_purchase_return.png' },
      { url: '/admin/purchase/payment', name: '15_purchase_payment.png' },
      
      // Penjualan & Piutang
      { url: '/admin/transactions', name: '16_sales_transactions.png' },
      { url: '/admin/debts/member', name: '17_debts_member.png' },
      
      // Keuangan
      { url: '/admin/cash-drawer-sessions', name: '18_finance_cash_drawer.png' },
      { url: '/admin/expenses', name: '19_finance_expenses.png' },
      
      // Laporan
      { url: '/admin/reports/sales', name: '20_reports_sales.png' },
      { url: '/admin/reports/laba-rugi', name: '21_reports_laba_rugi.png' },
      { url: '/admin/reports/purchase', name: '22_reports_purchase.png' },
      { url: '/admin/reports/expenses', name: '23_reports_expenses.png' },
      
      // Pengaturan
      { url: '/admin/users', name: '24_settings_users.png' },
      { url: '/admin/settings', name: '25_settings_store.png' }
    ];

    for (const p of pages) {
      console.log(`Navigating to ${p.url}...`);
      await page.goto(p.url);
      
      // Tunggu DOM siap dan delay spesifik agar animasi selesai
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000); 

      // Ambil screenshot
      await page.screenshot({ path: path.join(SC_DIR, p.name) });
    }
  });
});
