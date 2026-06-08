document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(['proxy']);
    if (data.proxy && data.proxy.ip) {
        const type = data.proxy.type || 'http';
        document.getElementById('proxyType').value = type;
        
        let str = `${data.proxy.ip}:${data.proxy.port}`;
        if (data.proxy.user && data.proxy.pass) {
            str += `:${data.proxy.user}:${data.proxy.pass}`;
        }
        document.getElementById('proxyString').value = str;
        document.getElementById('statusIndicator').classList.add('active');
        checkWarning();
    } else {
        document.getElementById('statusIndicator').classList.remove('active');
    }
});

const proxyTypeEl = document.getElementById('proxyType');
const proxyStringEl = document.getElementById('proxyString');
const warningBoxEl = document.getElementById('warningBox');

function checkWarning() {
    const type = proxyTypeEl.value;
    const raw = proxyStringEl.value.trim();
    const parts = raw.split(':');
    
    // Nếu là SOCKS và có User/Pass (parts có từ 4 phần tử trở lên và phần tử 2, 3 không rỗng)
    if ((type === 'socks5' || type === 'socks4') && parts.length >= 4 && parts[2].trim() && parts[3].trim()) {
        warningBoxEl.style.display = 'block';
    } else {
        warningBoxEl.style.display = 'none';
    }
}

proxyTypeEl.addEventListener('change', checkWarning);

proxyStringEl.addEventListener('input', () => {
    let raw = proxyStringEl.value.trim();
    
    // Tự động nhận diện và cắt bỏ tiền tố giao thức
    const protocols = [
        { prefix: 'socks5://', type: 'socks5' },
        { prefix: 'socks4://', type: 'socks4' },
        { prefix: 'socks://', type: 'socks5' },
        { prefix: 'https://', type: 'http' },
        { prefix: 'http://', type: 'http' }
    ];
    
    for (const p of protocols) {
        if (raw.toLowerCase().startsWith(p.prefix)) {
            proxyTypeEl.value = p.type;
            proxyStringEl.value = raw.substring(p.prefix.length);
            break;
        }
    }
    
    checkWarning();
});

document.getElementById('save').addEventListener('click', async () => {
    const type = proxyTypeEl.value;
    const raw = proxyStringEl.value.trim();
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
        type: type,
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
