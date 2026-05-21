document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(['proxy']);
    if (data.proxy && data.proxy.ip) {
        let str = `${data.proxy.ip}:${data.proxy.port}`;
        if (data.proxy.user && data.proxy.pass) {
            str += `:${data.proxy.user}:${data.proxy.pass}`;
        }
        document.getElementById('proxyString').value = str;
        document.getElementById('statusIndicator').classList.add('active');
    } else {
        document.getElementById('statusIndicator').classList.remove('active');
    }
});

document.getElementById('save').addEventListener('click', async () => {
    const raw = document.getElementById('proxyString').value.trim();
    if (!raw) {
        alert("Vui lòng nhập proxy!");
        return;
    }

    const parts = raw.split(':');
    if (parts.length < 2) {
        alert("Định dạng không hợp lệ. Vui lòng nhập IP:Port hoặc IP:Port:User:Pass");
        return;
    }

    const proxy = {
        ip: parts[0].trim(),
        port: parts[1].trim(),
        user: parts.length >= 4 ? parts[2].trim() : '',
        pass: parts.length >= 4 ? parts[3].trim() : ''
    };
    
    // Save to storage
    await chrome.storage.local.set({proxy});
    
    // Tell background script to reload the proxy
    chrome.runtime.sendMessage({action: 'reload_proxy'}, () => {
        window.close();
    });
});

document.getElementById('disable').addEventListener('click', async () => {
    // Remove from storage
    await chrome.storage.local.remove('proxy');
    
    // Tell background script to turn off the proxy
    chrome.runtime.sendMessage({action: 'reload_proxy'}, () => {
        window.close();
    });
});
