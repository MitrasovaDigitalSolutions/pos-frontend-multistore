# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshots.spec.ts >> Ambil Screenshot untuk User Manual >> Screenshot Seluruh Halaman Fitur
- Location: tests\e2e\screenshots.spec.ts:48:7

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - button "Sembunyikan Menu" [ref=e4] [cursor=pointer]:
        - img [ref=e5]
      - generic [ref=e8]:
        - img "Logo" [ref=e9]
        - generic [ref=e10]: Mitra Buana Motor
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Menu Utama
          - list [ref=e15]:
            - listitem [ref=e16]:
              - link "Dashboard" [ref=e17] [cursor=pointer]:
                - /url: /admin
                - img [ref=e18]
                - generic [ref=e22]: Dashboard
            - listitem [ref=e23]:
              - link "Layar Kasir (POS)" [ref=e24] [cursor=pointer]:
                - /url: /checkout
                - img [ref=e25]
                - generic [ref=e27]: Layar Kasir (POS)
        - generic [ref=e28]:
          - generic [ref=e29]: Transaksi & Inventori
          - list [ref=e30]:
            - button "Penjualan" [ref=e32] [cursor=pointer]:
              - generic [ref=e33]:
                - img [ref=e35]
                - generic [ref=e37]: Penjualan
              - img [ref=e39]
            - button "Pembelian" [ref=e42] [cursor=pointer]:
              - generic [ref=e43]:
                - img [ref=e45]
                - generic [ref=e50]: Pembelian
              - img [ref=e52]
            - button "Inventori" [ref=e55] [cursor=pointer]:
              - generic [ref=e56]:
                - img [ref=e58]
                - generic [ref=e62]: Inventori
              - img [ref=e64]
            - button "Pengeluaran" [ref=e67] [cursor=pointer]:
              - generic [ref=e68]:
                - img [ref=e70]
                - generic [ref=e72]: Pengeluaran
              - img [ref=e74]
            - listitem [ref=e76]:
              - link "Kas & Bank" [ref=e77] [cursor=pointer]:
                - /url: /admin/cash-accounts
                - img [ref=e78]
                - generic [ref=e81]: Kas & Bank
            - button "Hutang" [ref=e83] [cursor=pointer]:
              - generic [ref=e84]:
                - img [ref=e86]
                - generic [ref=e88]: Hutang
              - img [ref=e90]
            - button "Laporan" [ref=e93] [cursor=pointer]:
              - generic [ref=e94]:
                - img [ref=e96]
                - generic [ref=e100]: Laporan
              - img [ref=e102]
        - generic [ref=e104]:
          - generic [ref=e105]: Data Master & Sistem
          - list [ref=e106]:
            - button "Data Master" [ref=e108] [cursor=pointer]:
              - generic [ref=e109]:
                - img [ref=e111]
                - generic [ref=e115]: Data Master
              - img [ref=e117]
            - listitem [ref=e119]:
              - link "Pengaturan Toko" [ref=e120] [cursor=pointer]:
                - /url: /admin/settings
                - img [ref=e121]
                - generic [ref=e124]: Pengaturan Toko
            - listitem [ref=e125]:
              - link "Kelola Pengguna" [ref=e126] [cursor=pointer]:
                - /url: /admin/users
                - img [ref=e127]
                - generic [ref=e132]: Kelola Pengguna
            - listitem [ref=e133]:
              - link "Log Aktivitas" [ref=e134] [cursor=pointer]:
                - /url: /admin/audit
                - img [ref=e135]
                - generic [ref=e138]: Log Aktivitas
      - list [ref=e140]:
        - listitem [ref=e141]:
          - button "Keluar" [ref=e142] [cursor=pointer]:
            - img [ref=e143]
            - generic [ref=e147]: Keluar
    - generic [ref=e148]:
      - banner [ref=e149]:
        - heading "Pengaturan Toko" [level=2] [ref=e150]
        - generic [ref=e151]:
          - generic [ref=e152]:
            - img [ref=e153]
            - generic [ref=e155]: "Hari Ini: 29 Juni 2026"
          - generic [ref=e157]:
            - generic [ref=e158]:
              - generic [ref=e159]: Admin POS
              - generic [ref=e160]: admin
            - generic [ref=e161]: A
      - main [ref=e162]:
        - generic [ref=e163]:
          - generic [ref=e164]:
            - heading "Pengaturan Profil Toko" [level=3] [ref=e165]
            - paragraph [ref=e166]: Peninjauan detail informasi toko yang terdaftar.
          - generic [ref=e167]:
            - paragraph [ref=e168]:
              - text: "Nama Toko:"
              - strong [ref=e169]: Mitra Buana Motor
            - paragraph [ref=e170]:
              - text: "Alamat Cabang:"
              - strong [ref=e171]: Jl. Raya Indah No. 45, Jakarta Selatan
            - paragraph [ref=e172]:
              - text: "ID Store Terdaftar:"
              - strong [ref=e173]: 1 (Toko Utama)
  - region "Notifications alt+T"
  - generic [ref=e174]:
    - img [ref=e176]
    - button "Open Tanstack query devtools" [ref=e224] [cursor=pointer]:
      - img [ref=e225]
  - button "Open Next.js Dev Tools" [ref=e278] [cursor=pointer]:
    - img [ref=e279]
  - alert [ref=e282]
```