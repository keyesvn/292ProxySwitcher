let currentProxy = null;

// Đọc proxy từ chrome.storage.local và apply
async function loadProxy() {
    const data = await chrome.storage.local.get(['proxy']);
    if (data.proxy && data.proxy.ip) {
        currentProxy = data.proxy;
        await applyProxySettings(currentProxy);
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
        console.log('[292] Proxy applied:', currentProxy.ip + ':' + currentProxy.port);
    } else {
        currentProxy = null;
        chrome.proxy.settings.clear({ scope: 'regular' });
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
        console.log('[292] No proxy configured.');
    }
}

async function applyProxySettings(p) {
    const config = {
        mode: 'fixed_servers',
        rules: {
            singleProxy: {
                scheme: 'http',
                host: p.ip,
                port: parseInt(p.port)
            }
        }
    };
    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
}

// Khởi chạy lần đầu khi cài đặt hoặc trình duyệt mở
chrome.runtime.onInstalled.addListener(loadProxy);
chrome.runtime.onStartup.addListener(loadProxy);

// Xác thực proxy khi trang web yêu cầu — MV3: dùng asyncBlocking + callback
chrome.webRequest.onAuthRequired.addListener(
    (details, callback) => {
        if (currentProxy && currentProxy.user && currentProxy.pass) {
            callback({
                authCredentials: {
                    username: currentProxy.user,
                    password: currentProxy.pass
                }
            });
        } else {
            callback({});
        }
    },
    { urls: ["<all_urls>"] },
    ["asyncBlocking"]
);

// Lắng nghe message từ config.js và popup.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'reload_proxy') {
        loadProxy().then(() => sendResponse({ status: 'ok' }));
        return true; // Giữ kênh message mở cho async response
    }
});
