/**
 * config.js — Auto Proxy Injector via URL Parameters
 *
 * Được gọi bởi file .bat thông qua URL dạng:
 *   chrome-extension://[ID]/config.html?ip=1.2.3.4&port=8080&user=abc&pass=xyz
 *
 * Luồng:
 *   1. Đọc params từ URL
 *   2. Lưu vào chrome.storage.local (nằm ngoài thư mục extension — không bao giờ bị Corrupted)
 *   3. Gửi message cho bg.js để apply proxy ngay lập tức
 *   4. Tự đóng tab sau 1.5 giây
 */

(async () => {
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(window.location.search);

    const ip   = params.get('ip')   || '';
    const port = params.get('port') || '';
    const user = params.get('user') || '';
    const pass = params.get('pass') || '';

    // Hiển thị thông tin proxy đang được cấu hình
    if (ip && port) {
        const masked = user ? `${ip}:${port} (auth: ${user})` : `${ip}:${port}`;
        $('proxyInfo').textContent = masked;
    } else {
        $('proxyInfo').textContent = 'Không có thông số proxy trong URL';
    }

    // Kiểm tra đầu vào
    if (!ip || !port) {
        $('status').innerHTML = `
            <div class="dot error"></div>
            <span>Thiếu tham số ip hoặc port!</span>
        `;
        return;
    }

    try {
        const proxy = { ip, port, user, pass };

        // Bước 1: Lưu vào chrome.storage.local
        // Dữ liệu lưu ở Local Extension Settings — nằm ngoài thư mục extension
        // Chrome KHÔNG kiểm tra hash ở đây → không bao giờ bị Corrupted
        await chrome.storage.local.set({ proxy });

        // Bước 2: Yêu cầu bg.js apply proxy ngay lập tức
        // Wrap trong Promise để xử lý trường hợp service worker chưa sẵn sàng
        await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'reload_proxy' }, (response) => {
                // Bỏ qua chrome.runtime.lastError nếu service worker chưa khởi động xong
                const _ignore = chrome.runtime.lastError;
                resolve(response);
            });
        });

        // Bước 3: Hiển thị thành công
        $('status').innerHTML = `
            <div class="dot success"></div>
            <span>Đã cấu hình thành công! Đang đóng tab...</span>
        `;

        // Bước 4: Tự đóng tab sau 1.5 giây
        setTimeout(() => window.close(), 1500);

    } catch (err) {
        $('status').innerHTML = `
            <div class="dot error"></div>
            <span>Lỗi: ${err.message}</span>
        `;
        console.error('[292ProxySwitcher] Config error:', err);
    }
})();
