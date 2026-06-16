import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';

describe('EcoTrade Login E2E Tests', function () {
  this.timeout(30000); // 30 seconds timeout
  let driver;

  before(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should successfully log in a user and redirect to dashboard', async function () {
    // 1. Navigate to the application
    await driver.get('http://localhost:3000');

    // 2. Click navbar 'Sign In' button
    const signInNavButton = await driver.wait(
      until.elementLocated(By.id('nav-login')),
      10000
    );
    await signInNavButton.click();

    // 3. Wait for login inputs to be visible
    const emailInput = await driver.wait(
      until.elementLocated(By.id('email')),
      5000
    );
    const passwordInput = await driver.findElement(By.id('password'));
    const loginButton = await driver.findElement(By.id('login-button'));

    // 4. Fill credentials and submit
    await emailInput.sendKeys('customer@ecotrade.com');
    await passwordInput.sendKeys('password123');
    await loginButton.click();

    // 5. Wait for OTP screen and enter the mock code '4821'
    const otpInput = await driver.wait(
      until.elementLocated(By.id('otp-input')),
      5000
    );
    const otpConfirmButton = await driver.findElement(By.id('otp-confirm-button'));

    await otpInput.sendKeys('4821');
    await otpConfirmButton.click();

    // 6. Verify transition to dashboard (look for welcome text or live workspace button)
    // The welcome text is: "Welcome, Jane Doe!" or dashboard elements
    // Let's locate the live workspace button or logout button
    const logoutBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Sign Out')]")),
      10000
    );
    assert.ok(logoutBtn, 'Dashboard loaded successfully and Sign Out button is visible');
  });
});
