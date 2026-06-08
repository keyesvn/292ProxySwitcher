let currentProxy = null;
let loadingPromise = null;

// Hàm hỗ trợ lấy proxy (trả về cache nếu có, hoặc đọc từ storage)
async function getOrLoadProxy() {
    if (currentProxy) return currentProxy;
    if (!loadingPromise) {
        loadingPromise = chrome.storage.local.get(['proxy']).then((data) => {
            if (data.proxy && data.proxy.ip) {
                currentProxy = data.proxy;
            } else {
                currentProxy = null;
            }
            loadingPromise = null;
            return currentProxy;
        }).catch(() => {
            loadingPromise = null;
            return null;
        });
    }
    return loadingPromise;
}

// Đọc proxy từ chrome.storage.local và apply
async function loadProxy() {
    currentProxy = null; // Reset cache để force đọc lại từ storage khi reload
    const p = await getOrLoadProxy();
    if (p && p.ip) {
        await applyProxySettings(p);
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
        console.log('[292] Proxy applied:', p.ip + ':' + p.port);
    } else {
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
                scheme: p.type || 'http',
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
        getOrLoadProxy().then((p) => {
            if (p && p.user && p.pass) {
                callback({
                    authCredentials: {
                        username: p.user,
                        password: p.pass
                    }
                });
            } else {
                callback({});
            }
        }).catch(() => {
            callback({});
        });
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
