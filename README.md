# 292ProxySwitcher

A lightweight, secure, and open-source Google Chrome extension designed to help users quickly switch and manage their proxy server configurations. Built on top of the reliable core architecture of Simple Proxy Switcher.

## 🚀 Features

* **Quick Switching:** Toggle between direct connections and custom proxy profiles with a single click.
* **Profile Management:** Easily add, edit, or delete multiple proxy servers (HTTP, HTTPS, SOCKS4, SOCKS5).
* **100% Offline & Local:** All configurations are stored securely inside your browser's local storage (`chrome.storage`).
* **Zero Tracking:** No analytics, no telemetry, no home servers, and no data collection of any kind.

## 🔒 Privacy & Permissions

This extension is built with absolute privacy in mind. It requires only two essential permissions to function:
* `proxy`: To change the browser's proxy settings based on your active profile.
* `storage`: To save your proxy profiles locally on your device so you don't lose them when closing the browser.

## 🛠️ Installation for Developers

If you want to load this extension locally in developer mode:
1. Download or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** (top-left button) and select the root directory of this project.

## 📄 License

This project is open-source and available under the MIT License.
