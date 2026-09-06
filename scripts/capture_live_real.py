import subprocess
import time
import json
import urllib.request
import base64
import os
import socket
import struct
import shutil

def setup():
    os.makedirs("artifacts/lab-02/screenshots/github", exist_ok=True)
    os.makedirs("artifacts/lab-02/screenshots/requester-selector", exist_ok=True)
    os.makedirs("artifacts/lab-02/screenshots/create-ticket", exist_ok=True)
    os.makedirs("artifacts/lab-02/screenshots/my-tickets", exist_ok=True)
    os.makedirs("artifacts/lab-02/screenshots/ticket-detail", exist_ok=True)
    os.makedirs("artifacts/lab-02/screenshots/responsive", exist_ok=True)
    os.makedirs("artifacts/lab-02/screenshots/tests-and-git", exist_ok=True)

    # Copy brain screenshots if available
    brain_dir = r"C:\Users\ADMIN\.gemini\antigravity-ide\brain\839ecb1e-234f-4aeb-988d-3479ba518eaf"
    mappings = {
        "github_repo_main_1788679654229.png": "artifacts/lab-02/screenshots/github/github-repo-main.png",
        "github_issues_closed_1788679797791.png": "artifacts/lab-02/screenshots/github/github-issues-closed.png",
        "github_prs_list_1788679740788.png": "artifacts/lab-02/screenshots/github/github-prs-list.png",
        "git_commit_graph_1788679771618.png": "artifacts/lab-02/screenshots/tests-and-git/git-commit-graph.png",
        "requester_selection_screen_1788679917895.png": "artifacts/lab-02/screenshots/requester-selector/requester-selection-screen.png",
        "requester_dropdown_open_1788679945697.png": "artifacts/lab-02/screenshots/requester-selector/requester-dropdown-open.png",
        "requester_a_list_1788680430823.png": "artifacts/lab-02/screenshots/my-tickets/requester-a-list.png",
        "desktop_initial_1788680472144.png": "artifacts/lab-02/screenshots/create-ticket/desktop-initial.png",
        "validation_error_1788680542919.png": "artifacts/lab-02/screenshots/create-ticket/validation-error.png",
    }
    for src_name, dst_path in mappings.items():
        src_path = os.path.join(brain_dir, src_name)
        if os.path.exists(src_path):
            shutil.copyfile(src_path, dst_path)
            print(f"Copied {src_name} -> {dst_path}")

def run_live_capture():
    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    port = 9245
    temp_dir = os.path.abspath(".chrome-ss-live-2")
    
    proc = subprocess.Popen([
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        "--window-size=1280,900",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={temp_dir}",
        "http://localhost:5173"
    ])
    try:
        time.sleep(3)
        ws_url = None
        for _ in range(20):
            try:
                with urllib.request.urlopen(f"http://localhost:{port}/json/list") as resp:
                    data = json.loads(resp.read().decode())
                    if data:
                        ws_url = data[0].get("webSocketDebuggerUrl")
                        break
            except Exception:
                time.sleep(0.5)

        if not ws_url:
            print("Failed to get websocket debugger url")
            return

        ws_host = "127.0.0.1"
        ws_path = ws_url.split(f":{port}")[1]
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((ws_host, port))
        
        key = base64.b64encode(os.urandom(16)).decode()
        handshake = f"GET {ws_path} HTTP/1.1\r\nHost: {ws_host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        s.sendall(handshake.encode())
        res = b""
        while b"\r\n\r\n" not in res:
            res += s.recv(1024)
            
        msg_id = 0
        def send_cdp(method, params=None):
            nonlocal msg_id
            msg_id += 1
            req = {"id": msg_id, "method": method}
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
            s.sendall(h)
            
            while True:
                hdr = s.recv(2)
                if not hdr: return None
                ll = hdr[1] & 0x7F
                if ll == 126: ll = struct.unpack("!H", s.recv(2))[0]
                elif ll == 127: ll = struct.unpack("!Q", s.recv(8))[0]
                d = b""
                while len(d) < ll:
                    c = s.recv(min(65536, ll - len(d)))
                    if not c: break
                    d += c
                r = json.loads(d.decode("utf-8", errors="ignore"))
                if r.get("id") == msg_id:
                    return r.get("result", {})

        def eval_js(code):
            return send_cdp("Runtime.evaluate", {"expression": code, "awaitPromise": True, "returnByValue": True})

        def screenshot(filepath):
            r = send_cdp("Page.captureScreenshot", {"format": "png"})
            if r and "data" in r:
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(r["data"]))
                print(f"Captured: {filepath}")

        time.sleep(2)
        # Select Requester 1
        eval_js("const s = document.querySelector('select.form-select'); if(s) { s.value = '1'; s.dispatchEvent(new Event('change', {bubbles:true})); }")
        time.sleep(1)

        # 1. My Tickets list for Requester A
        eval_js("const btns = Array.from(document.querySelectorAll('a, button')); const b = btns.find(x => x.textContent.includes('My Tickets')); if(b) b.click();")
        time.sleep(1.5)
        screenshot("artifacts/lab-02/screenshots/my-tickets/requester-a-list.png")

        # 2. Search & filter
        eval_js("const inp = document.querySelector('input'); if(inp) { inp.value = 'Laptop'; inp.dispatchEvent(new Event('input', {bubbles:true})); }")
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/my-tickets/search-and-filter.png")

        # 3. Requester B list
        eval_js("const s2 = document.querySelector('select.form-select'); if(s2) { s2.value = '2'; s2.dispatchEvent(new Event('change', {bubbles:true})); }")
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/my-tickets/requester-b-list.png")

        # Back to Requester A and click ticket detail
        eval_js("const s3 = document.querySelector('select.form-select'); if(s3) { s3.value = '1'; s3.dispatchEvent(new Event('change', {bubbles:true})); }")
        time.sleep(1)
        eval_js("const viewBtn = Array.from(document.querySelectorAll('button, a')).find(x => x.textContent.includes('View') || x.textContent.includes('Detail')); if(viewBtn) viewBtn.click();")
        time.sleep(1.5)
        screenshot("artifacts/lab-02/screenshots/ticket-detail/ticket-detail-view.png")

        # Switch to Attachments Tab
        eval_js("const tabs = Array.from(document.querySelectorAll('.nav-link, button')); const attTab = tabs.find(x => x.textContent.includes('Attachments')); if(attTab) attTab.click();")
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/ticket-detail/attachments-tab-view.png")

        # Click Soft Remove on attachment
        eval_js("const remBtn = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Remove')); if(remBtn) remBtn.click();")
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png")

        # Cancel modal, go to Create Ticket
        eval_js("const cBtn = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Cancel')); if(cBtn) cBtn.click();")
        time.sleep(0.5)
        eval_js("const crBtn = Array.from(document.querySelectorAll('a, button')).find(x => x.textContent.includes('Create Ticket') || x.textContent.includes('New Ticket')); if(crBtn) crBtn.click();")
        time.sleep(1.5)
        screenshot("artifacts/lab-02/screenshots/create-ticket/desktop-initial.png")

        # Submit empty form to trigger validation
        eval_js("const subBtn = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Submit')); if(subBtn) subBtn.click();")
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/create-ticket/validation-error.png")

        # Fill valid ticket and create
        eval_js("""
            const titleInput = document.querySelector('input[name="title"], input#title, input[placeholder*="Title"]');
            if (titleInput) { titleInput.value = "Printer Connectivity Issues in Lab 304"; titleInput.dispatchEvent(new Event('input', {bubbles:true})); }
            const descInput = document.querySelector('textarea');
            if (descInput) { descInput.value = "Unable to connect to HP LaserJet in Room 304 from MacBook Pro. Driver shows offline."; descInput.dispatchEvent(new Event('input', {bubbles:true})); }
        """)
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/create-ticket/form-filled-valid.png")

        # Responsive: Mobile
        send_cdp("Emulation.setDeviceMetricsOverride", {"width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/responsive/mobile-view.png")

        # Responsive: Tablet
        send_cdp("Emulation.setDeviceMetricsOverride", {"width": 768, "height": 1024, "deviceScaleFactor": 1, "mobile": True})
        time.sleep(1)
        screenshot("artifacts/lab-02/screenshots/responsive/tablet-view.png")

        print("All screenshots captured successfully!")
    finally:
        proc.terminate()

if __name__ == "__main__":
    setup()
    run_live_capture()
