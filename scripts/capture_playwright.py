import asyncio
import os
import sys
from pathlib import Path

BASE = Path("artifacts/lab-02/screenshots")
BASE.mkdir(parents=True, exist_ok=True)

async def capture_all():
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--window-size=1280,900"]
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()

        print("=== Starting Screenshot Capture ===")

        # 1: Requester Selector
        print("[1] Navigating to localhost:5173...")
        await page.goto("http://localhost:5173", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2500)
        await page.screenshot(path=str(BASE / "01_requester_selector.png"))
        print(f"    Saved 01_requester_selector.png")

        # Select first requester from dropdown
        try:
            sel = page.locator("select").first
            opts = await sel.locator("option").all()
            if len(opts) > 1:
                await sel.select_option(index=1)
                await page.wait_for_timeout(500)
        except Exception as e:
            print(f"    select not found: {e}")

        # Click Continue
        for btn_text in ["Continue", "Select", "Go", "Confirm"]:
            try:
                btn = page.get_by_role("button", name=btn_text)
                if await btn.is_visible(timeout=1500):
                    await btn.click()
                    await page.wait_for_timeout(2000)
                    print(f"    Clicked '{btn_text}'")
                    break
            except Exception:
                pass

        await page.screenshot(path=str(BASE / "02_after_requester_select.png"))
        print("    Saved 02_after_requester_select.png")

        # 3: My Tickets List
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(BASE / "03_my_tickets_list.png"))
        print("    Saved 03_my_tickets_list.png")

        # 4: Search
        try:
            si = page.locator("input[type=text], input[placeholder*=earch]").first
            await si.wait_for(timeout=4000)
            await si.fill("Laptop")
            await page.wait_for_timeout(1500)
            await page.screenshot(path=str(BASE / "04_search_laptop.png"))
            print("    Saved 04_search_laptop.png")
        except Exception as e:
            print(f"    Search error: {e}")
            await page.screenshot(path=str(BASE / "04_search_laptop.png"))

        # 5: No results
        try:
            si = page.locator("input[type=text]").first
            await si.fill("zzznoresults999")
            await page.wait_for_timeout(1500)
        except Exception: pass
        await page.screenshot(path=str(BASE / "05_no_results.png"))
        print("    Saved 05_no_results.png")

        # Clear search
        try:
            si = page.locator("input[type=text]").first
            await si.fill("")
            await page.keyboard.press("Enter")
            await page.wait_for_timeout(1000)
        except Exception: pass

        # 6: Ticket Detail
        try:
            row = page.locator("table tbody tr").first
            await row.wait_for(timeout=4000)
            await row.click()
            await page.wait_for_timeout(2000)
        except Exception as e:
            print(f"    Row click error: {e}")
        await page.screenshot(path=str(BASE / "06_ticket_detail.png"))
        print("    Saved 06_ticket_detail.png")

        # Go back
        try:
            await page.go_back()
            await page.wait_for_timeout(1000)
        except Exception: pass

        # 7: Create Ticket - find nav button
        for sel in ["#nav-create-ticket-btn", "a[href*=create]", "button:has-text('Create Ticket')", "button:has-text('New Ticket')"]:
            try:
                btn = page.locator(sel).first
                if await btn.is_visible(timeout=2000):
                    await btn.click()
                    await page.wait_for_timeout(2000)
                    print(f"    Clicked create via: {sel}")
                    break
            except Exception: pass

        await page.screenshot(path=str(BASE / "07_create_form_empty.png"))
        print("    Saved 07_create_form_empty.png")

        # 8: Validation error - submit empty
        for sel in ["#submit-ticket-btn", "button[type=submit]", "button:has-text('Submit')", "button:has-text('Create')"]:
            try:
                btn = page.locator(sel).first
                if await btn.is_visible(timeout=2000):
                    await btn.click()
                    await page.wait_for_timeout(1000)
                    print(f"    Submitted empty via {sel}")
                    break
            except Exception: pass
        await page.screenshot(path=str(BASE / "08_validation_error.png"))
        print("    Saved 08_validation_error.png")

        # 9: Fill form
        for sel in ["#summary-input", "input[name=summary]", "input[placeholder*=ummary]"]:
            try:
                inp = page.locator(sel).first
                if await inp.is_visible(timeout=1500):
                    await inp.fill("Cannot connect to campus eduroam Wi-Fi in CB2")
                    break
            except Exception: pass

        for sel in ["#description-input", "textarea[name=description]", "textarea"]:
            try:
                inp = page.locator(sel).first
                if await inp.is_visible(timeout=1500):
                    await inp.fill("My MacBook repeatedly disconnects when roaming between floors of CB2 building.")
                    break
            except Exception: pass

        for sel in ["select#category-select", "select[name=category]", "select[id*=category]"]:
            try:
                s = page.locator(sel).first
                if await s.is_visible(timeout=1000):
                    opts = await s.locator("option").all()
                    if len(opts) > 1: await s.select_option(index=1)
                    break
            except Exception: pass

        for sel in ["select#system-select", "select[name=system]", "select[id*=system]"]:
            try:
                s = page.locator(sel).first
                if await s.is_visible(timeout=1000):
                    opts = await s.locator("option").all()
                    if len(opts) > 1: await s.select_option(index=1)
                    break
            except Exception: pass

        await page.wait_for_timeout(500)
        await page.screenshot(path=str(BASE / "09_form_filled.png"))
        print("    Saved 09_form_filled.png")

        # 10: Submit and success
        for sel in ["#submit-ticket-btn", "button[type=submit]", "button:has-text('Submit')"]:
            try:
                btn = page.locator(sel).first
                if await btn.is_visible(timeout=2000):
                    await btn.click()
                    await page.wait_for_timeout(2500)
                    break
            except Exception: pass
        await page.screenshot(path=str(BASE / "10_ticket_created_success.png"))
        print("    Saved 10_ticket_created_success.png")

        # 11: Requester B switch
        for sel in ["#app-requester-selector", "select[id*=requester]", "header select", "nav select", "select"]:
            try:
                rs = page.locator(sel).first
                if await rs.is_visible(timeout=2000):
                    opts = await rs.locator("option").all()
                    if len(opts) > 2:
                        await rs.select_option(index=2)
                    elif len(opts) > 1:
                        await rs.select_option(index=1)
                    await page.wait_for_timeout(2000)
                    print(f"    Switched requester via {sel}")
                    break
            except Exception: pass
        await page.screenshot(path=str(BASE / "11_requester_b_tickets.png"))
        print("    Saved 11_requester_b_tickets.png")

        await browser.close()

        files = sorted(BASE.glob("*.png"))
        print(f"\n=== Done! {len(files)} screenshots captured ===")
        for f in files:
            print(f"  {f.name} ({f.stat().st_size:,} bytes)")

if __name__ == "__main__":
    asyncio.run(capture_all())
