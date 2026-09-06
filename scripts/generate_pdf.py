import subprocess
import time
import json
import urllib.request
import base64
import os
import sys

def generate_pdf():
    html_path = os.path.abspath("report-lab-02.html")
    pdf_path = os.path.abspath("Lab_02_Report.pdf")
    file_url = "file:///" + html_path.replace("\\", "/")
    
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    ]
    
    chrome_exe = None
    for p in chrome_paths:
        if os.path.exists(p):
            chrome_exe = p
            break
            
    if not chrome_exe:
        print("No Chrome/Edge browser found.")
        return False
        
    print(f"Using browser: {chrome_exe}")
    port = 9235
    temp_dir = os.path.abspath(f".chrome-pdf-{int(time.time())}")
    
    # Launch Chrome with remote debugging
    cmd = [
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={temp_dir}",
        "about:blank"
    ]
    
    proc = subprocess.Popen(cmd)
    try:
        # Wait for debugging port to be ready
        version_url = f"http://localhost:{port}/json/version"
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
            return False
            
        print(f"Connecting to CDP WebSocket: {ws_url}")
        
        # Connect to websocket using simple python socket/websocket
        # Since Python standard library has socket, or we can use a minimal client
        import socket
        import hashlib
        import struct
        
        # Parse ws URL
        # e.g. ws://localhost:9222/devtools/page/XXXX
        ws_host = "127.0.0.1"
        ws_path = ws_url.split(f":{port}")[1]
        
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((ws_host, port))
        
        key = base64.b64encode(os.urandom(16)).decode()
        handshake = (
            f"GET {ws_path} HTTP/1.1\r\n"
            f"Host: {ws_host}:{port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        s.sendall(handshake.encode())
        
        response = b""
        while b"\r\n\r\n" not in response:
            response += s.recv(1024)
            
        print("WebSocket handshake successful!")
        
        def send_ws(msg_dict):
            payload = json.dumps(msg_dict).encode()
            header = bytearray()
            header.append(0x81) # text frame, fin=1
            length = len(payload)
            if length <= 125:
                header.append(0x80 | length) # masked
            elif length <= 65535:
                header.append(0x80 | 126)
                header.extend(struct.pack("!H", length))
            else:
                header.append(0x80 | 127)
                header.extend(struct.pack("!Q", length))
            mask = os.urandom(4)
            header.extend(mask)
            masked_payload = bytearray(payload[i] ^ mask[i % 4] for i in range(len(payload)))
            s.sendall(header + masked_payload)
            
        def recv_ws_msg():
            assembled_data = bytearray()
            while True:
                # Read 2 byte header
                header = s.recv(2)
                while len(header) < 2:
                    more = s.recv(2 - len(header))
                    if not more:
                        return None
                    header += more
                    
                b1, b2 = header[0], header[1]
                fin = (b1 & 0x80) != 0
                opcode = b1 & 0x0F
                
                length = b2 & 0x7F
                if length == 126:
                    ext = s.recv(2)
                    while len(ext) < 2:
                        ext += s.recv(2 - len(ext))
                    length = struct.unpack("!H", ext)[0]
                elif length == 127:
                    ext = s.recv(8)
                    while len(ext) < 8:
                        ext += s.recv(8 - len(ext))
                    length = struct.unpack("!Q", ext)[0]
                    
                frame_data = bytearray()
                while len(frame_data) < length:
                    chunk = s.recv(min(65536, length - len(frame_data)))
                    if not chunk:
                        break
                    frame_data.extend(chunk)
                    
                assembled_data.extend(frame_data)
                if fin:
                    break
                    
            try:
                return json.loads(assembled_data.decode('utf-8', errors='ignore'))
            except Exception as e:
                print(f"JSON decode error: {e}")
                return None
            
        # 1. Enable Page
        send_ws({"id": 1, "method": "Page.enable"})
        
        # 2. Navigate to local HTML file URL
        print(f"Navigating to {file_url}")
        send_ws({"id": 2, "method": "Page.navigate", "params": {"url": file_url}})
        
        # Wait for navigation events to settle
        time.sleep(3)
        
        # Drain any pending event messages
        s.settimeout(0.5)
        while True:
            try:
                m = recv_ws_msg()
                if not m:
                    break
            except Exception:
                break
        s.settimeout(30.0) # 30s timeout for PDF generation
        
        # 3. Print to PDF
        print("Requesting Page.printToPDF...")
        print_req = {
            "id": 100,
            "method": "Page.printToPDF",
            "params": {
                "printBackground": True,
                "paperWidth": 8.27, # A4 in inches
                "paperHeight": 11.69,
                "marginTop": 0.4,
                "marginBottom": 0.4,
                "marginLeft": 0.4,
                "marginRight": 0.4,
                "preferCSSPageSize": True
            }
        }
        send_ws(print_req)
        
        # Receive response
        pdf_base64 = None
        while True:
            msg = recv_ws_msg()
            if not msg:
                break
            if msg.get("id") == 100:
                pdf_base64 = msg.get("result", {}).get("data")
                break
                
        if pdf_base64:
            pdf_bytes = base64.b64decode(pdf_base64)
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)
            print(f"Successfully generated PDF: {pdf_path} ({len(pdf_bytes):,} bytes)")
            return True
        else:
            print("Failed to receive PDF data from Chrome.")
            return False
            
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    success = generate_pdf()
    sys.exit(0 if success else 1)
