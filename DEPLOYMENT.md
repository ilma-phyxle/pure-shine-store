# 🚀 Deployment Guide — CleanyGlow Store

This document covers deploying both the **React frontend** (`pure-shine-store`) and the **Laravel backend** (`GrepC backend`) to your shared hosting environment (https://oeh.phyxle.com.au/).

---

## 📋 Hosting Folder Structure Overview

Based on your setup, this is how files will be organized on the server:

- **`public_html/website_3ef429ea/`**
  - This is your public Document Root.
  - It will contain your built React frontend files (from `dist/`) COMBINED WITH your Laravel `public/` files.
- **`Backend Files/GrepC backend/`**
  - This is where the core of the Laravel framework lives, safely hidden from public web access.

---

## Part 1 — Laravel Backend Pre-Deployment

### 1.1 — Export Local Database

1. Open `http://localhost/phpmyadmin`
2. Select the `grepc_db` database
3. Click **Export** → Format: SQL → Click **Go**
4. Save the downloaded `.sql` file

---

### 1.2 — Create Database on cPanel

1. Log into **cPanel** → **MySQL Databases**
2. Create a new database: `yourusername_grepc`
3. Create a new database user: `yourusername_dbuser` and password.
4. Add user to the database → select **All Privileges** → click **Make Changes**

---

### 1.3 — Import Database

1. cPanel → **phpMyAdmin**
2. Select your new database `yourusername_grepc`
3. Click **Import** tab → Choose the `.sql` file you exported
4. Click **Go**

---

### 1.4 — Prepare Laravel Files Locally

Run in the `GrepC backend` directory:

```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Part 2 — Uploading and Configuring Files

### 2.1 — Upload Laravel Core
1. Take everything inside your local `GrepC backend` EXCLUDING the `public/` folder, `node_modules/`, and `.git/`.
2. Upload these files to **`Backend Files/GrepC backend/`** via cPanel File Manager or FTP.

### 2.2 — Compile and Upload React Frontend
1. Open terminal in your `pure-shine-store` folder.
2. Run `npm run build`
3. Open the newly created `dist/` folder.
4. Upload all contents of `dist/` directly into **`public_html/website_3ef429ea/`**.

### 2.3 — Upload Laravel Public Files
1. Go back to your local `GrepC backend/public/` folder.
2. Upload its contents (`index.php`, `.htaccess`, etc.) into **`public_html/website_3ef429ea/`** (mixing it with your React build files).

---

## Part 3 — Linking the Core and Public Folders

### 3.1 — Fix `index.php` Paths (Crucial)

Since you separated Laravel's `public/` folder from its core, you must point `index.php` to the correct location.

Edit **`public_html/website_3ef429ea/index.php`** and update these two lines:

```php
// Change:
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

// To:
require __DIR__.'/../../Backend Files/GrepC backend/vendor/autoload.php';
$app = require_once __DIR__.'/../../Backend Files/GrepC backend/bootstrap/app.php';
```

---

### 3.2 — Configure `.env` on Server

Create/edit **`Backend Files/GrepC backend/.env`**:

```env
APP_NAME="CleanyGlow"
APP_ENV=production
APP_KEY=          ← generate below
APP_DEBUG=false
APP_URL=https://oeh.phyxle.com.au

LOG_CHANNEL=stack

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306      ← Note: It's 3306 on shared hosting
DB_DATABASE=yourusername_grepc
DB_USERNAME=yourusername_dbuser
DB_PASSWORD=your_strong_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

Generate the app key via SSH or cPanel Terminal:

```bash
cd "Backend Files/GrepC backend"
php artisan key:generate
```

---

### 3.3 — Set Folder Permissions

Via SSH or cPanel → File Manager → Right-click → Change Permissions:

```
Backend Files/GrepC backend/storage/          → 755
Backend Files/GrepC backend/bootstrap/cache/  → 755
```

---

## Part 4 — Post-Deployment Checks

| Check | How to verify |
|---|---|
| Laravel API is responding | Visit `https://oeh.phyxle.com.au/api/products` in browser |
| Default route works | Visit `https://oeh.phyxle.com.au/` and ensure the React app loads |
| React router | Navigate to `https://oeh.phyxle.com.au/shop` and refresh the page. |
| DB connection | Check if products load on the shop page. |

---

## ⚠️ Common Issues & Fixes

| Problem | Fix |
|---|---|
| 500 error on loading site | Ensure `index.php` paths are exact and `storage/` has 755 permissions. Check `storage/logs/laravel.log`. |
| 404 on React page refresh | We added `Route::fallback` in `routes/web.php` to handle this. Make sure it's at the very bottom. |
| Database connection error | Ensure you used the cPanel database name, user, and password on port 3306 in `.env` |
