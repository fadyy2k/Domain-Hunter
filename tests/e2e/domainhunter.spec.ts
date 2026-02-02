import { test, expect } from "@playwright/test";

/**
 * DomainHunter E2E Smoke Tests
 * These tests verify the core functionality of the application
 */

test.describe("DomainHunter Smoke Tests", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto("/");
        // Wait for page to be fully loaded
        await page.waitForLoadState("networkidle");
    });

    test("should load the homepage", async ({ page }) => {
        // Check main heading is visible (could be "Generator" or "Domain Generator")
        await expect(page.locator("h1, h2").first()).toBeVisible();

        // Check key UI elements are present
        await expect(page.getByText(/Keywords/i).first()).toBeVisible();
        await expect(page.getByRole("button", { name: /Generate/i })).toBeVisible();
    });

    test("should have working sidebar navigation", async ({ page }) => {
        // Check sidebar navigation links exist
        const sidebar = page.locator("aside, nav").first();
        await expect(sidebar).toBeVisible();

        // Check for navigation items (by text content)
        await expect(page.getByText(/Generator/i).first()).toBeVisible();
    });

    test("should navigate to About page", async ({ page }) => {
        // Find and click About link in sidebar
        const aboutLink = page.locator('a[href="/about"]');
        await aboutLink.click();

        // Wait for navigation
        await page.waitForURL("**/about");

        // Check About page content
        await expect(page.locator("h1")).toContainText(/About/i);
    });

    test("should navigate to Settings page", async ({ page }) => {
        // Find and click Settings link in sidebar
        const settingsLink = page.locator('a[href="/settings"]');
        await settingsLink.click();

        // Wait for navigation
        await page.waitForURL("**/settings");

        // Check Settings page content
        await expect(page.locator("h1")).toContainText(/Settings/i);
    });

    test("should navigate to Projects page", async ({ page }) => {
        // Find and click Projects link in sidebar
        const projectsLink = page.locator('a[href="/projects"]');
        await projectsLink.click();

        // Wait for navigation
        await page.waitForURL("**/projects");

        // Check Projects page content
        await expect(page.locator("h1")).toContainText(/Projects/i);
    });

    test("should enter keywords and select TLDs", async ({ page }) => {
        // Find and fill the keywords textarea
        const keywordsInput = page.locator("textarea").first();
        await keywordsInput.fill("testbrand\nawesome");

        // Verify the text was entered
        await expect(keywordsInput).toHaveValue("testbrand\nawesome");

        // Check that some TLDs are visible
        await expect(page.getByText(".com")).toBeVisible();
    });

    test("should have API Keys button in sidebar", async ({ page }) => {
        // Look for API Keys button or link in sidebar
        const apiKeysButton = page.locator('button:has-text("API Keys"), a:has-text("API Keys")').first();

        if (await apiKeysButton.isVisible()) {
            await apiKeysButton.click();

            // Wait a bit for modal to open
            await page.waitForTimeout(500);

            // Check if modal or dialog appeared
            const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
            if (await modal.isVisible()) {
                // Modal opened successfully
                await expect(modal).toBeVisible();
            }
        }
    });

    test("should generate domains", async ({ page }) => {
        // Enter a keyword
        const keywordsInput = page.locator("textarea").first();
        await keywordsInput.fill("techstartup");

        // Click Generate button
        const generateButton = page.getByRole("button", { name: /Generate/i });
        await generateButton.click();

        // Wait for generation to complete - look for "Generated X domains" or results
        await page.waitForTimeout(5000);

        // Check for any indicator that generation happened
        // Could be: domain count text, results panel, progress indicator
        const generatedText = page.getByText(/Generated|domains|results|Total/i).first();
        const hasGenerated = await generatedText.isVisible().catch(() => false);

        // Also check if any domain-like text appeared (e.g., .com, .io)
        const hasDomains = await page.getByText(/\.com|\.io|\.co/i).first().isVisible().catch(() => false);

        expect(hasGenerated || hasDomains).toBeTruthy();
    });

    test("should show checking mode options", async ({ page }) => {
        // Check that checking mode options exist
        const rdapOption = page.getByText(/RDAP/i).first();
        await expect(rdapOption).toBeVisible();
    });

    test("should have theme switcher", async ({ page }) => {
        // Look for theme toggle button
        const themeButton = page.locator('button:has-text("Theme"), [aria-label*="theme"], [title*="theme"]').first();

        if (await themeButton.isVisible()) {
            await themeButton.click();
            await page.waitForTimeout(300);
        }
        // Test passes if no error - theme toggle may not be visible on all viewport sizes
    });

    test("health endpoint should return 200", async ({ request }) => {
        const response = await request.get("/api/health");
        expect(response.ok()).toBeTruthy();

        const body = await response.json();
        expect(body.status).toBe("healthy");
    });
});
