let currentProxy = null;

async function loadProxy() {
    // Try to load proxy from proxy.json (injected by Bot)
    try {
        const response = await fetch(chrome.runtime.getURL('proxy.json'));
        const fileData = await response.json();
        if (fileData && fileData.ip) {
            await chrome.storage.local.set({ proxy: fileData });
        }
    } catch (e) {
        console.log('No proxy.json found, using existing storage');
    }

    const data = await chrome.storage.local.get(['proxy']);
    if (data.proxy && data.proxy.ip) {
        currentProxy = data.proxy;
        await applyProxySettings(currentProxy);
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
    } else {
        currentProxy = null;
        chrome.proxy.settings.clear({ scope: 'regular' });
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
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

chrome.runtime.onInstalled.addListener(loadProxy);
chrome.runtime.onStartup.addListener(loadProxy);

// Handle authentication
chrome.webRequest.onAuthRequired.addListener(
    (details) => {
        if (currentProxy && currentProxy.user && currentProxy.pass) {
            return {
                authCredentials: {
                    username: currentProxy.user,
                    password: currentProxy.pass
                }
            };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'reload_proxy') {
        loadProxy().then(() => sendResponse({status: 'ok'}));
        return true;
    }
});

// === AUTO INJECT ===
