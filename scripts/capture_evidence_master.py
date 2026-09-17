import os
import sys
import time
import json
import base64
import urllib.request
import subprocess
import socket
import struct
import shutil

# 1. Helper to encode local image to base64
def img_to_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            ext = "png" if path.endswith(".png") else "jpeg"
            return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

# 2. Chrome CDP Client for real DOM captures
class HeadlessCDP:
    def __init__(self, port=9260):
        self.port = port
        self.msg_id = 0
        self.proc = None
        self.s = None

    def start(self):
        chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        temp_dir = os.path.abspath(".chrome-report-cap")
        os.makedirs(temp_dir, exist_ok=True)
        self.proc = subprocess.Popen([
            chrome_exe,
            "--headless=new",
            "--disable-gpu",
            f"--remote-debugging-port={self.port}",
            "--window-size=1280,900",
            "--no-first-run",
            "--no-default-browser-check",
            f"--user-data-dir={temp_dir}",
            "http://localhost:5173"
        ])
        time.sleep(3)
        ws_url = None
        for _ in range(25):
            try:
                with urllib.request.urlopen(f"http://localhost:{self.port}/json/list") as resp:
                    data = json.loads(resp.read().decode())
                    if data:
                        ws_url = data[0].get("webSocketDebuggerUrl")
                        break
            except Exception:
                time.sleep(0.4)

        if not ws_url:
            raise RuntimeError("Cannot connect to Chrome DevTools WebSocket")

        ws_host = "127.0.0.1"
        ws_path = ws_url.split(f":{self.port}")[1]
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.s.connect((ws_host, self.port))
        
        key = base64.b64encode(os.urandom(16)).decode()
        handshake = f"GET {ws_path} HTTP/1.1\r\nHost: {ws_host}:{self.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        self.s.sendall(handshake.encode())
        res = b""
        while b"\r\n\r\n" not in res:
            res += self.s.recv(1024)

    def send_cdp(self, method, params=None):
        self.msg_id += 1
        req = {"id": self.msg_id, "method": method}
        if params: req["params"] = params
        payload = json.dumps(req).encode()
        h = bytearray([0x81])
        l = len(payload)
        if l <= 125: h.append(0x80 | l)
        elif l <= 65535: h.extend(struct.pack("!BH", 0x80 | 126, l))
        else: h.extend(struct.pack("!BQ", 0x80 | 127, l))
        mask = os.urandom(4)
        h.extend(mask)
        h.extend(bytearray(payload[i] ^ mask[i % 4] for i in range(l)))
        self.s.sendall(h)
        
        while True:
            hdr = self.s.recv(2)
            if not hdr: return None
            ll = hdr[1] & 0x7F
            if ll == 126: ll = struct.unpack("!H", self.s.recv(2))[0]
            elif ll == 127: ll = struct.unpack("!Q", self.s.recv(8))[0]
            d = b""
            while len(d) < ll:
                c = self.s.recv(min(65536, ll - len(d)))
                if not c: break
                d += c
            r = json.loads(d.decode("utf-8", errors="ignore"))
            if r.get("id") == self.msg_id:
                return r.get("result", {})

    def eval(self, code):
        return self.send_cdp("Runtime.evaluate", {"expression": code, "awaitPromise": True, "returnByValue": True})

    def capture_screenshot(self, filepath, width=1280, height=900, mobile=False):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        self.send_cdp("Emulation.setDeviceMetricsOverride", {
            "width": width,
            "height": height,
            "deviceScaleFactor": 1,
            "mobile": mobile
        })
        time.sleep(0.8)
        res = self.send_cdp("Page.captureScreenshot", {"format": "png"})
        if res and "data" in res:
            with open(filepath, "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print(f"Captured: {filepath}")

    def close(self):
        if self.proc:
            self.proc.terminate()

def capture_all():
    print("Starting screenshot capture from live app...")
    cdp = HeadlessCDP()
    cdp.start()
    try:
        # Part 5: Requester Selector Screen
        time.sleep(2)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/requester-selector/01_requester_selector_modal.png")
        
        # Click continue to enter main screen
        cdp.eval("const b = document.getElementById('requester-continue-btn'); if(b) b.click();")
        time.sleep(1.5)

        # Part 7: My Tickets - Requester A (Jennifer Anderson)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/my-tickets/01_requester_a_tickets.png")

        # Part 7: Search applied in My Tickets
        cdp.eval("""
            const inp = document.querySelector('input[type="text"], input[placeholder*="Search"]');
            if (inp) { inp.value = "Laptop"; inp.dispatchEvent(new Event('input', {bubbles:true})); }
        """)
        time.sleep(1)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/my-tickets/03_search_applied.png")

        # Part 7: No results state
        cdp.eval("""
            const inp = document.querySelector('input[type="text"], input[placeholder*="Search"]');
            if (inp) { inp.value = "nonexistent-keyword-999"; inp.dispatchEvent(new Event('input', {bubbles:true})); }
        """)
        time.sleep(1)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/my-tickets/05_no_results_state.png")

        # Clear search
        cdp.eval("""
            const clr = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Clear'));
            if (clr) clr.click();
        """)
        time.sleep(1)

        # Part 7: Switch to Requester B (Bob Smith)
        cdp.eval("""
            const sel = document.getElementById('app-requester-selector');
            if (sel) { sel.value = '2'; sel.dispatchEvent(new Event('change', {bubbles:true})); }
        """)
        time.sleep(1.5)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/my-tickets/02_requester_b_tickets.png")

        # Switch back to Requester A
        cdp.eval("""
            const sel = document.getElementById('app-requester-selector');
            if (sel) { sel.value = '1'; sel.dispatchEvent(new Event('change', {bubbles:true})); }
        """)
        time.sleep(1)

        # Part 8: Open Ticket Detail
        cdp.eval("""
            const row = document.querySelector('table tbody tr');
            if (row) row.click();
        """)
        time.sleep(1.5)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/ticket-detail/01_owned_ticket_detail.png")

        # Part 8: Switch to Attachments Tab & Soft Removal Modal
        cdp.eval("""
            const tabs = Array.from(document.querySelectorAll('.nav-link, button'));
            const att = tabs.find(x => x.textContent.includes('Attachments'));
            if (att) att.click();
        """)
        time.sleep(1)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/ticket-detail/02_attachment_section.png")

        cdp.eval("""
            const rem = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Remove'));
            if (rem) rem.click();
        """)
        time.sleep(1)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/ticket-detail/03_soft_remove_modal.png")

        # Close modal
        cdp.eval("""
            const cancel = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Cancel'));
            if (cancel) cancel.click();
        """)
        time.sleep(0.5)

        # Part 6: Create Ticket Screen
        cdp.eval("""
            const crBtn = document.getElementById('nav-create-ticket-btn');
            if (crBtn) crBtn.click();
        """)
        time.sleep(1.5)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/create-ticket/01_create_ticket_empty.png")

        # Submit empty for validation error
        cdp.eval("""
            const sub = document.getElementById('submit-ticket-btn');
            if (sub) sub.click();
        """)
        time.sleep(1)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/create-ticket/02_validation_error.png")

        # Fill valid values and submit
        cdp.eval("""
            const sum = document.getElementById('summary-input');
            if (sum) { sum.value = "Cannot connect to campus eduroam Wi-Fi in CB2"; sum.dispatchEvent(new Event('input', {bubbles:true})); }
            const desc = document.getElementById('description-input');
            if (desc) { desc.value = "My MacBook repeatedly asks for credentials when roaming between 3rd and 4th floors of CB2 building."; desc.dispatchEvent(new Event('input', {bubbles:true})); }
            const sub = document.getElementById('submit-ticket-btn');
            if (sub) sub.click();
        """)
        time.sleep(2)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/create-ticket/05_success_created_ticket.png")

        # Part 9: Responsive Views
        cdp.capture_screenshot("artifacts/lab-02/screenshots/responsive/01_desktop_1200px.png", width=1200, height=800)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/responsive/02_tablet_768px.png", width=768, height=1024, mobile=True)
        cdp.capture_screenshot("artifacts/lab-02/screenshots/responsive/03_mobile_375px.png", width=375, height=812, mobile=True)

        print("All live DOM screenshots captured successfully!")
    finally:
        cdp.close()

if __name__ == "__main__":
    capture_all()
