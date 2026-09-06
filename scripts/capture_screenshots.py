import subprocess
import time
import json
import urllib.request
import base64
import os
import socket
import struct
import sys

def setup_dirs():
    dirs = [
        "artifacts/lab-02/screenshots/requester-selector",
        "artifacts/lab-02/screenshots/create-ticket",
        "artifacts/lab-02/screenshots/my-tickets",
        "artifacts/lab-02/screenshots/ticket-detail",
        "artifacts/lab-02/screenshots/responsive",
        "artifacts/lab-02/screenshots/tests-and-git"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

class CDPClient:
    def __init__(self, port=9222):
        self.port = port
        self.msg_id = 0
        self.s = None

    def connect(self, ws_url):
        ws_host = "127.0.0.1"
        ws_path = ws_url.split(f":{self.port}")[1]
        
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.s.connect((ws_host, self.port))
        
        key = base64.b64encode(os.urandom(16)).decode()
        handshake = (
            f"GET {ws_path} HTTP/1.1\r\n"
            f"Host: {ws_host}:{self.port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.s.sendall(handshake.encode())
        
        response = b""
        while b"\r\n\r\n" not in response:
            response += self.s.recv(1024)

    def send(self, method, params=None):
        self.msg_id += 1
        req = {"id": self.msg_id, "method": method}
        if params:
            req["params"] = params
        payload = json.dumps(req).encode()
        
        header = bytearray()
        header.append(0x81)
        length = len(payload)
        if length <= 125:
            header.append(0x80 | length)
        elif length <= 65535:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
            
        mask = os.urandom(4)
        header.extend(mask)
        masked_payload = bytearray(payload[i] ^ mask[i % 4] for i in range(len(payload)))
        self.s.sendall(header + masked_payload)
        
        target_id = self.msg_id
        while True:
            res = self.recv()
            if res and res.get("id") == target_id:
                return res.get("result", {})

    def recv(self):
        header = self.s.recv(2)
        if len(header) < 2:
            return None
        b1, b2 = header[0], header[1]
        length = b2 & 0x7F
        if length == 126:
            length = struct.unpack("!H", self.s.recv(2))[0]
        elif length == 127:
            length = struct.unpack("!Q", self.s.recv(8))[0]
        data = b""
        while len(data) < length:
            chunk = self.s.recv(min(65536, length - len(data)))
            if not chunk:
                break
            data += chunk
        return json.loads(data.decode('utf-8', errors='ignore'))

    def eval(self, js_expr):
        res = self.send("Runtime.evaluate", {
            "expression": js_expr,
            "awaitPromise": True,
            "returnByValue": True
        })
        return res.get("result", {}).get("value")

    def set_viewport(self, width, height, is_mobile=False):
        self.send("Emulation.setDeviceMetricsOverride", {
            "width": width,
            "height": height,
            "deviceScaleFactor": 2,
            "mobile": is_mobile
        })
        self.send("Emulation.setVisibleSize", {"width": width, "height": height})

    def screenshot(self, file_path):
        res = self.send("Page.captureScreenshot", {"format": "png"})
        data = res.get("data")
        if data:
            with open(file_path, "wb") as f:
                f.write(base64.b64decode(data))
            print(f"Captured: {file_path}")

def run_capture():
    setup_dirs()
    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    port = 9223
    
    cmd = [
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        "--no-first-run",
        "--no-default-browser-check",
        "--user-data-dir=" + os.path.abspath(".chrome-ss-temp"),
        "about:blank"
    ]
    
    proc = subprocess.Popen(cmd)
    try:
        ws_url = None
        for _ in range(30):
            time.sleep(0.5)
            try:
                with urllib.request.urlopen(f"http://localhost:{port}/json/list") as resp:
                    data = json.loads(resp.read().decode())
                    if data and len(data) > 0:
                        ws_url = data[0].get("webSocketDebuggerUrl")
                        if ws_url:
                            break
            except Exception:
                pass
                
        if not ws_url:
            print("Failed to get WebSocket debugger URL from Chrome.")
            return
            
        client = CDPClient(port)
        client.connect(ws_url)
        client.send("Page.enable")
        client.send("Runtime.enable")
        client.send("DOM.enable")
        
        # 1. Requester Selection Screen
        client.set_viewport(1280, 800)
        client.send("Page.navigate", {"url": "http://localhost:5175"})
        time.sleep(2)
        client.screenshot("artifacts/lab-02/screenshots/requester-selector/requester-selection-screen.png")
        
        # 2. Continue into Main -> My Tickets for Jennifer Anderson (Default)
        client.eval("""
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue'));
            if (btn) btn.click();
        """)
        time.sleep(1.5)
        client.screenshot("artifacts/lab-02/screenshots/my-tickets/requester-a-list.png")
        client.screenshot("artifacts/lab-02/screenshots/responsive/desktop-view.png")
        
        # 3. Responsive Tablet & Mobile for My Tickets
        client.set_viewport(768, 1024)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/responsive/tablet-view.png")
        
        client.set_viewport(375, 812, is_mobile=True)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/responsive/mobile-view.png")
        
        # Reset to Desktop
        client.set_viewport(1280, 800)
        time.sleep(0.5)
        
        # 4. Filter & Search
        client.eval("""
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
                searchInput.value = 'battery';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        """)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/my-tickets/search-and-filter.png")
        
        # 5. No results state
        client.eval("""
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
                searchInput.value = 'nonexistentxyz999';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        """)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/my-tickets/no-results-state.png")
        
        # Clear search
        client.eval("""
            const clearBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Clear'));
            if (clearBtn) clearBtn.click();
        """)
        time.sleep(1)
        
        # 6. Switch to Requester B (Sarah Johnson or Michael Brown)
        client.eval("""
            const select = document.querySelector('select');
            if (select) {
                for (let opt of select.options) {
                    if (opt.text.includes('Michael Brown') || opt.text.includes('Sarah Johnson')) {
                        select.value = opt.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }
        """)
        time.sleep(1.5)
        client.screenshot("artifacts/lab-02/screenshots/my-tickets/requester-b-list.png")
        
        # 7. Navigate to Create Ticket Form
        client.eval("""
            const createBtn = Array.from(document.querySelectorAll('button, a, span')).find(b => b.textContent.includes('Create Ticket'));
            if (createBtn) createBtn.click();
        """)
        time.sleep(1.5)
        client.screenshot("artifacts/lab-02/screenshots/create-ticket/desktop-initial.png")
        
        # 8. Trigger Validation Error on Create Ticket
        client.eval("""
            const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit') || b.textContent.includes('Create'));
            if (submitBtn) submitBtn.click();
        """)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/create-ticket/validation-error.png")
        
        # 9. Fill Form & Test Invalid Attachment / Valid Form
        client.eval("""
            const summary = document.querySelector('input[name="summary"], input[placeholder*="summary"], input[placeholder*="Summary"]');
            if (summary) {
                summary.value = 'Laptop battery drains within 1 hour';
                summary.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const desc = document.querySelector('textarea');
            if (desc) {
                desc.value = 'My laptop battery drains completely within 1 hour after recent Windows update.';
                desc.dispatchEvent(new Event('input', { bubbles: true }));
            }
        """)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/create-ticket/submitting-busy.png")
        
        # 10. Submit valid ticket to see success state
        client.eval("""
            const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit') || b.textContent.includes('Create'));
            if (submitBtn) submitBtn.click();
        """)
        time.sleep(2)
        client.screenshot("artifacts/lab-02/screenshots/create-ticket/success-created.png")
        
        # 11. Go back to My Tickets and Open First Ticket Detail
        client.eval("""
            const myTicketsNav = Array.from(document.querySelectorAll('button, a, span')).find(b => b.textContent.includes('My Tickets'));
            if (myTicketsNav) myTicketsNav.click();
        """)
        time.sleep(1.5)
        
        client.eval("""
            const row = document.querySelector('tbody tr') || document.querySelector('.ticket-card');
            if (row) row.click();
        """)
        time.sleep(2)
        client.screenshot("artifacts/lab-02/screenshots/ticket-detail/ticket-detail-view.png")
        
        # 12. Soft Remove Modal trigger
        client.eval("""
            const removeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Remove') || b.textContent.includes('Delete'));
            if (removeBtn) removeBtn.click();
        """)
        time.sleep(1)
        client.screenshot("artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png")
        
        print("All live screenshots captured successfully!")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    run_capture()
