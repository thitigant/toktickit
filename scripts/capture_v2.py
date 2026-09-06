import asyncio
from pathlib import Path

BASE = Path("artifacts/lab-02/screenshots")
BASE.mkdir(parents=True, exist_ok=True)

async def capture_all():
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()

        print("=== Screenshot Capture v2 ===")

        # Helper to click nav "Create Ticket"
        async def go_create():
            await page.locator("nav a:has-text('Create Ticket'), button:has-text('Create Ticket'), a:has-text('Create Ticket')").first.click()
            await page.wait_for_timeout(2000)

        async def go_my_tickets():
            await page.locator("nav a:has-text('My Tickets'), button:has-text('My Tickets')").first.click()
            await page.wait_for_timeout(2000)

        # 1: Load app - requester selector
        await page.goto("http://localhost:5173", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(BASE / "01_requester_selector.png"))
        print("Saved 01_requester_selector.png")

        # Select requester (wait for options to load)
        await page.wait_for_timeout(2000)
        sel = page.locator("select").first
        try:
            await sel.wait_for(state="visible", timeout=5000)
            opts = await sel.locator("option").all()
            print(f"  Found {len(opts)} options")
            if len(opts) > 1:
                await sel.select_option(index=1)
                await page.wait_for_timeout(500)
                await page.screenshot(path=str(BASE / "01b_requester_selected.png"))
                print("Saved 01b_requester_selected.png")
        except Exception as e:
            print(f"  Select error: {e}")

        # Click Continue
        cont_btn = page.locator("button:has-text('Continue')")
        await cont_btn.click()
        await page.wait_for_timeout(2500)
        await page.screenshot(path=str(BASE / "02_main_my_tickets.png"))
        print("Saved 02_main_my_tickets.png")

        # 3: Full ticket list loaded
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(BASE / "03_tickets_list_full.png"))
        print("Saved 03_tickets_list_full.png")

        # 4: Search for "Laptop"
        si = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[type='text']").first
        await si.fill("Laptop")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(BASE / "04_search_laptop.png"))
        print("Saved 04_search_laptop.png")

        # 5: No results
        await si.fill("zzznoresults999")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(BASE / "05_no_results.png"))
        print("Saved 05_no_results.png")

        # Clear search
        await si.fill("")
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(1000)

        # 6: Click first ticket row for detail
        row = page.locator("table tbody tr").first
        await row.wait_for(timeout=5000)
        await row.click()
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(BASE / "06_ticket_detail.png"))
        print("Saved 06_ticket_detail.png")

        # 7: Create Ticket form - click nav
        await go_create()
        await page.screenshot(path=str(BASE / "07_create_form_empty.png"))
        print("Saved 07_create_form_empty.png")

        # 8: Submit empty - validation error
        sub = page.locator("#submit-ticket-btn, button[type='submit'], button:has-text('Submit Ticket'), button:has-text('Create Ticket')").first
        await sub.click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(BASE / "08_validation_error.png"))
        print("Saved 08_validation_error.png")

        # 9: Fill form
        for s in ["#summary-input", "input[name='summary']", "input[placeholder*='ummary']"]:
            try:
                inp = page.locator(s).first
                if await inp.is_visible(timeout=1000):
                    await inp.fill("Cannot connect to campus eduroam Wi-Fi in CB2")
                    break
            except: pass

        for s in ["#description-input", "textarea[name='description']", "textarea"]:
            try:
                inp = page.locator(s).first
                if await inp.is_visible(timeout=1000):
                    await inp.fill("My MacBook repeatedly disconnects when roaming between floors.")
                    break
            except: pass

        # Category select
        for s in ["select#category-select", "select[name='category']", "select[id*='category']"]:
            try:
                cs = page.locator(s).first
                if await cs.is_visible(timeout=1000):
                    opts = await cs.locator("option").all()
                    if len(opts) > 1: await cs.select_option(index=1)
                    break
            except: pass

        # System select
        for s in ["select#system-select", "select[name='system']", "select[id*='system']", "select[id*='related']"]:
            try:
                ss = page.locator(s).first
                if await ss.is_visible(timeout=1000):
                    opts = await ss.locator("option").all()
                    if len(opts) > 1: await ss.select_option(index=1)
                    break
            except: pass

        await page.wait_for_timeout(500)
        await page.screenshot(path=str(BASE / "09_form_filled.png"))
        print("Saved 09_form_filled.png")

        # 10: Submit
        sub2 = page.locator("#submit-ticket-btn, button[type='submit'], button:has-text('Submit Ticket')").first
        try:
            await sub2.click()
            await page.wait_for_timeout(3000)
        except Exception as e:
            print(f"  Submit error: {e}")
        await page.screenshot(path=str(BASE / "10_after_submit.png"))
        print("Saved 10_after_submit.png")

        # 11: Switch to Requester B - find the Switch dropdown in dev banner
        for s in ["#app-requester-selector", "select[id*='requester']", ".dev-banner select", "select"]:
            try:
                rs = page.locator(s).first
                if await rs.is_visible(timeout=2000):
                    opts = await rs.locator("option").all()
                    print(f"  Requester sel '{s}': {len(opts)} options")
                    if len(opts) > 2:
                        await rs.select_option(index=2)
                    elif len(opts) > 1:
                        await rs.select_option(index=1)
                    await page.wait_for_timeout(2500)
                    print(f"  Switched via {s}")
                    break
            except Exception as e:
                print(f"  {s}: {e}")
        await page.screenshot(path=str(BASE / "11_requester_b_tickets.png"))
        print("Saved 11_requester_b_tickets.png")

        await browser.close()
        files = sorted(BASE.glob("*.png"))
        print(f"\n=== Done! {len(files)} screenshots ===")
        for f in files:
            print(f"  {f.name}: {f.stat().st_size:,} bytes")

asyncio.run(capture_all())
