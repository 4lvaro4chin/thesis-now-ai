const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot-home.png', fullPage: true });
    console.log('✓ Captured home page');
    
    // Wait a moment
    await page.waitForTimeout(2000);
    
    // Try search page
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot-search.png', fullPage: true });
    console.log('✓ Captured search page');
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
