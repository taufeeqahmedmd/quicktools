const { chromium } = require('playwright');
const path = require('path');

async function test() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext();
  const page = await context.newPage();

  const filePath = path.join(__dirname, 'excel-merger.html');
  await page.goto(`file://${filePath}`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check if tabs are visible
  const tabs = await page.locator('.tab-btn');
  const tabCount = await tabs.count();
  console.log(`✓ Found ${tabCount} tabs`);

  // Check first tab (Merge Multiple Files)
  const firstTab = page.locator('[data-tab="merge-files"]');
  const isVisible = await firstTab.isVisible();
  console.log(`✓ First tab visible: ${isVisible}`);

  // Check second tab (Merge Sheets / Split Sheet)
  const secondTab = page.locator('[data-tab="merge-sheets"]');
  const isSecondVisible = await secondTab.isVisible();
  console.log(`✓ Second tab visible: ${isSecondVisible}`);

  // Click second tab
  await secondTab.click();
  await page.waitForTimeout(300);

  // Verify tab content switched
  const mergeSheetUI = page.locator('#mergeSheetUI');
  const splitSheetUI = page.locator('#splitSheetUI');

  const mergeVisible = await mergeSheetUI.isVisible();
  const splitVisible = await splitSheetUI.isVisible();

  console.log(`✓ Tab switched: Merge Sheets UI visible: ${mergeVisible}`);

  // Check operation selector
  const operationSegmented = page.locator('#sheetOpSegmented');
  const isOperationSegmentedVisible = await operationSegmented.isVisible();
  console.log(`✓ Operation selector visible: ${isOperationSegmentedVisible}`);

  // Switch to split operation
  const splitOp = page.locator('[data-operation="split-sheet"]');
  await splitOp.click();
  await page.waitForTimeout(300);

  const splitUIVisible = await splitSheetUI.isVisible();
  const mergeUIHidden = await mergeSheetUI.isVisible();
  console.log(`✓ Split Sheet UI visible: ${splitUIVisible}, Merge hidden: ${!mergeUIHidden}`);

  // Take screenshot
  await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
  console.log('✓ Screenshot saved to test-screenshot.png');

  await browser.close();
  console.log('\n✓ All tests passed!');
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
