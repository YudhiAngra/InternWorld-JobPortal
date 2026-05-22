import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'test-screenshots');

// Create a helper to log findings
const findings = [];

async function log(msg) {
  console.log(msg);
  findings.push(msg);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  
  // ─── DESKTOP VIEW ─────────────────────────────────────────────────────────
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1280, height: 800 });
  
  await log('Navigating to http://localhost:5174/ ...');
  await desktopPage.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // Screenshot 1 – desktop
  const ss1 = path.join(screenshotDir, '01_desktop_full.png');
  await desktopPage.screenshot({ path: ss1, fullPage: false });
  await log(`[Screenshot 1] Desktop view saved: ${ss1}`);

  // Inspect navbar elements
  const navbarHTML = await desktopPage.evaluate(() => {
    const nav = document.querySelector('nav') || document.querySelector('header') || document.querySelector('[class*="nav"]');
    return nav ? nav.outerHTML.slice(0, 2000) : 'No navbar found';
  });
  await log(`[Desktop Navbar HTML snippet]:\n${navbarHTML}\n`);

  // Check for hamburger button
  const hamburgerVisible = await desktopPage.evaluate(() => {
    const btn = document.querySelector('[class*="hamburger"], [class*="menu-btn"], [class*="mobile"], button[aria-label*="menu"], .hamburger, #hamburger, .menu-toggle, [class*="toggle"]');
    return btn ? { found: true, display: window.getComputedStyle(btn).display, classes: btn.className } : { found: false };
  });
  await log(`[Desktop] Hamburger button check: ${JSON.stringify(hamburgerVisible)}`);

  // Check for desktop nav links
  const desktopLinks = await desktopPage.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a'));
    return links.map(a => ({ text: a.textContent.trim(), href: a.href, visible: window.getComputedStyle(a).display !== 'none' }));
  });
  await log(`[Desktop] Nav links: ${JSON.stringify(desktopLinks, null, 2)}`);

  await desktopPage.close();

  // ─── MOBILE VIEW ──────────────────────────────────────────────────────────
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });

  await log('\nNavigating to http://localhost:5174/ in MOBILE view (375px)...');
  await mobilePage.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Screenshot 2 – mobile (menu closed)
  const ss2 = path.join(screenshotDir, '02_mobile_closed.png');
  await mobilePage.screenshot({ path: ss2 });
  await log(`[Screenshot 2] Mobile view (menu closed) saved: ${ss2}`);

  // Check hamburger visibility on mobile
  const mobileHamburger = await mobilePage.evaluate(() => {
    const selectors = [
      '[class*="hamburger"]',
      '[class*="menu-btn"]',
      '[class*="mobile-menu"]',
      'button[aria-label*="menu"]',
      '.hamburger',
      '#hamburger',
      '.menu-toggle',
      '[class*="toggle"]',
      'button svg',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const style = window.getComputedStyle(el);
        return { found: true, selector: sel, display: style.display, visibility: style.visibility, classes: el.className };
      }
    }
    // Fallback: find any button in nav
    const navBtn = document.querySelector('nav button, header button');
    if (navBtn) {
      const style = window.getComputedStyle(navBtn);
      return { found: true, selector: 'nav/header button', display: style.display, visibility: style.visibility, classes: navBtn.className };
    }
    return { found: false };
  });
  await log(`[Mobile] Hamburger button check: ${JSON.stringify(mobileHamburger)}`);

  // Check desktop links hidden on mobile
  const mobileLinks = await mobilePage.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a'));
    return links.map(a => ({
      text: a.textContent.trim(),
      display: window.getComputedStyle(a).display,
      visibility: window.getComputedStyle(a).visibility,
      isHidden: window.getComputedStyle(a).display === 'none',
    }));
  });
  await log(`[Mobile] Nav links visibility: ${JSON.stringify(mobileLinks, null, 2)}`);

  // ─── CLICK HAMBURGER ──────────────────────────────────────────────────────
  const hamburgerClicked = await mobilePage.evaluate(() => {
    const selectors = [
      '[class*="hamburger"]',
      '[class*="menu-btn"]',
      '.hamburger',
      '#hamburger',
      '.menu-toggle',
      'nav button',
      'header button',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.click();
        return { clicked: true, selector: sel };
      }
    }
    return { clicked: false };
  });
  await log(`[Mobile] Hamburger click result: ${JSON.stringify(hamburgerClicked)}`);

  await mobilePage.waitForTimeout(600); // wait for animation

  // Screenshot 3 – mobile (menu open)
  const ss3 = path.join(screenshotDir, '03_mobile_menu_open.png');
  await mobilePage.screenshot({ path: ss3 });
  await log(`[Screenshot 3] Mobile menu OPEN saved: ${ss3}`);

  // Check if dropdown links are now visible
  const openMenuLinks = await mobilePage.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a, [class*="dropdown"] a, [class*="mobile-menu"] a'));
    return links.map(a => ({
      text: a.textContent.trim(),
      display: window.getComputedStyle(a).display,
      visibility: window.getComputedStyle(a).visibility,
    }));
  });
  await log(`[Mobile Open Menu] Link visibility: ${JSON.stringify(openMenuLinks, null, 2)}`);

  // ─── CLICK A LINK TO CLOSE MENU ───────────────────────────────────────────
  const linkClicked = await mobilePage.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a'));
    const visibleLink = links.find(a => window.getComputedStyle(a).display !== 'none' && a.textContent.trim().length > 0);
    if (visibleLink) {
      visibleLink.click();
      return { clicked: true, text: visibleLink.textContent.trim(), href: visibleLink.href };
    }
    return { clicked: false };
  });
  await log(`[Mobile] Clicked link to close menu: ${JSON.stringify(linkClicked)}`);

  await mobilePage.waitForTimeout(600);

  // Screenshot 4 – after clicking link (menu should close)
  const ss4 = path.join(screenshotDir, '04_mobile_after_link_click.png');
  await mobilePage.screenshot({ path: ss4 });
  await log(`[Screenshot 4] After clicking link (menu should close): ${ss4}`);

  // Final check: is menu closed?
  const menuAfterClick = await mobilePage.evaluate(() => {
    const dropdown = document.querySelector('[class*="dropdown"], [class*="mobile-menu"], [class*="nav-open"]');
    if (dropdown) {
      return { element: dropdown.className, display: window.getComputedStyle(dropdown).display, visible: dropdown.offsetParent !== null };
    }
    return { noDropdown: true };
  });
  await log(`[Mobile] Menu state after link click: ${JSON.stringify(menuAfterClick)}`);

  await mobilePage.close();
  await browser.close();

  // Summary
  await log('\n\n=== SUMMARY OF FINDINGS ===');
  return findings;
}

main().then(findings => {
  console.log('\n\nAll findings logged. Check test-screenshots/ directory for images.');
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
