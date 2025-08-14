import { test, expect } from "@playwright/test";
import { Credentials } from "tidepool-cli/lib/credentials";
import { createDashboardOffset } from "tidepool-cli/lib/dashboardScenarioSelector";
import { deletePatients } from "tidepool-cli/lib/deletePatients";

test.describe("Dashboard Scenario 2 - Period Length Variations - without data initialization", { tag: '@scenario2' }, () => {
  // Declare variables at test suite level for proper scoping
  let credentials: {
    userName: string;
    password: string;
    baseUrl: string;
  };
  let tagId: string;
  let clinicId: string;
  
  // Helper function to load only scenario2 environment variables
  function loadScenario2EnvironmentVariables() {
    const envVars: { [key: string]: string } = {};
    
    // Load all environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (value) {
        // If variable name contains "scenario", only load scenario2
        if (key.toLowerCase().includes('scenario')) {
          if (key.toLowerCase().includes('scenario2')) {
            envVars[key] = value;
            console.log(`Loaded scenario2 env var: ${key}`);
          }
        } else {
          // Load non-scenario variables
          envVars[key] = value;
        }
      }
    }
    
    return envVars;
  }
  
  // Helper function to delete test patients using deletePatients function
  async function cleanupDashboardPatients() {
    try {
      console.log("Starting cleanup of existing dashboard patients...");
      console.log(`Calling deletePatients with clinic: ${clinicId}, tag: ${tagId}`);
      
      // Call the actual deletePatients function from tidepool-cli/lib/deletePatients
      // Create Credentials object for the function call
      const creds: Credentials = {
        userName: credentials.userName,
        password: credentials.password,
        baseUrl: credentials.baseUrl,
      };
      
      // Delete patients with the specified tag
      await deletePatients(creds, clinicId, tagId);
      
      console.log("Successfully deleted patients using deletePatients function");
      
    } catch (error) {
      console.error("Error calling deletePatients:", error.message);
      throw error;
    }
  }
  
  test.beforeAll(async () => {
    // Set a longer timeout for setup
    test.setTimeout(12000000); // 20 minutes for setup (4 batches)

    // Load scenario2-specific environment variables
    const envVars = loadScenario2EnvironmentVariables();
    
    // Setup authentication credentials from environment variables
    credentials = {
      userName: envVars.TIDEPOOL_USERNAME || '',
      password: envVars.TIDEPOOL_PASSWORD || '',
      baseUrl: envVars.TIDEPOOL_BASE_URL || 'https://qa2.development.tidepool.org',
    };

    tagId = envVars.TAG_SCENARIO2_ID || '';
    clinicId = envVars.CLINIC_ID || '';

    // Validate required environment variables
    if (!credentials.userName || !credentials.password || !credentials.baseUrl) {
      throw new Error("Missing Tidepool credentials. Please set TIDEPOOL_USERNAME, TIDEPOOL_PASSWORD, and TIDEPOOL_BASE_URL in your environment variables.");
    }

    if (!tagId || !clinicId) {
      throw new Error("Missing TAG_SCENARIO2_ID or CLINIC_ID. Please set TAG_SCENARIO2_ID and CLINIC_ID in your environment variables.");
    }

    console.log("Environment variables validated successfully");
    console.log(`Using TAG_SCENARIO2_ID: ${tagId}`);
    console.log("Setting up dashboard scenario 2 test data with period length variations...");

    
  });

  test("should verify dashboard data was created for scenario 2 with period length variations", async ({ page }) => {
    // Set timeout for the test
    test.setTimeout(900000); // 15 minutes

    try {
      console.log("Verifying dashboard scenario 2 data creation with different summarization periods...");
      
      // Navigate to Tidepool QA2
      console.log("Navigating to Tidepool QA2...");
      await page.goto(credentials.baseUrl);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Login with credentials from .env
      if (!credentials.userName || !credentials.password) {
        throw new Error("Missing login credentials in environment variables");
      }

      // Fill in email and proceed
      await page.getByRole('textbox', { name: 'Enter your email address' }).waitFor({ timeout: 15000 });
      await page.getByRole('textbox', { name: 'Enter your email address' }).fill(credentials.userName);
      await page.getByRole('button', { name: 'Next' }).click();

      // Fill in password and login
      await page.getByRole('textbox', { name: 'Password' }).waitFor({ timeout: 15000 });
      await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
      await page.getByRole('button', { name: 'Log In' }).click();

      // Go to workspace a2 abc
      console.log("Navigating to workspace a2 abc...");
      // Wait for the workspaces page to load
      await page.waitForSelector('text="Welcome To Tidepool"', { timeout: 15000 });
      
      // Find and click on the "a2 abc" workspace's "Go To Workspace" button
      const a2abcHeading = page.locator('h4:has-text("a2 abc")').first();
      const goToWorkspaceButton = a2abcHeading.locator('xpath=following::button[normalize-space()="Go To Workspace"][1]');
      await goToWorkspaceButton.waitFor({ state: 'visible', timeout: 15000 });
      await goToWorkspaceButton.click();

      // Click TIDE Dashboard View
      console.log("Clicking TIDE Dashboard View...");
      await page.waitForSelector('text="TIDE Dashboard View"', { timeout: 15000 });
      await page.click('text="TIDE Dashboard View"');
      
      // Wait after clicking TIDE Dashboard View (configurable via environment variable)
      const waitAfterDashboardClick = parseInt(process.env.WAIT_AFTER_DASHBOARD_CLICK || '1000', 10);
      console.log(`Waiting ${waitAfterDashboardClick}ms after clicking TIDE Dashboard View...`);
      await page.waitForTimeout(waitAfterDashboardClick);

      // Handle modal if it appears
      console.log("Checking for dashboard configuration modal...");
      try {
        // Wait for modal to appear
        await page.waitForSelector('text="Select Patients to Display in the TIDE Dashboard"', { timeout: 5000 });
        console.log("Modal detected, configuring dashboard settings...");

        // Select tag based on environment variable (scenario2)
        console.log("Selecting scenario2 tag...");
        await page.locator('#patient-tags-select').getByText('scenario2').click();

        // Select data recency '24 hours'
        console.log("Selecting data recency '24 hours'...");
        await page.locator('#lastData label').filter({ hasText: 'Within 24 hours' }).locator('svg').nth(1).click();

        // Select summarization period '24 hours'
        console.log("Selecting summarization period '24 hours'...");
        await page.locator('#period').getByText('24 hours').click();

        // Wait for Next button to become enabled and click it
        console.log("Clicking Next button...");
        await page.getByRole('button', { name: 'Next' }).click();
        
        // Wait after clicking Next button (configurable via environment variable)
        console.log(`Waiting ${waitAfterDashboardClick}ms after clicking Next button...`);
        await page.waitForTimeout(waitAfterDashboardClick);

      } catch (modalError) {
        console.log("Modal handling failed:", modalError.message);
        throw modalError;
      }

      // Array of summarization periods to test
      const periodsToTest = ['24 hours', '7 days', '14 days', '30 days'];

      // Test each summarization period
      for (let i = 0; i < periodsToTest.length; i++) {
        const period = periodsToTest[i];
        console.log(`\n=== Testing summarization period: ${period} ===`);
        
        if (i > 0) {
          // For subsequent periods, use Filter Patients button to reconfigure
          console.log(`Reconfiguring dashboard for ${period}...`);
          
          // Click the Filter Patients button
          await page.getByRole('button', { name: 'Filter Patients Open dashboard config' }).waitFor({ timeout: 10000 });
          await page.getByRole('button', { name: 'Filter Patients Open dashboard config' }).click();

          // Wait for modal to appear
          await page.waitForSelector('text="Select Patients to Display in the TIDE Dashboard"', { timeout: 10000 });

          // Select the current summarization period being tested
          console.log(`Selecting summarization period '${period}'...`);
          await page.locator('#period').getByText(period).click();

          // Click Apply button
          console.log("Clicking Apply button...");
          await page.getByRole('button', { name: 'Apply' }).click();
          
          // Wait after clicking Apply button (configurable via environment variable)
          console.log(`Waiting ${waitAfterDashboardClick}ms after clicking Apply button...`);
          await page.waitForTimeout(waitAfterDashboardClick);
        }

        // Wait for dashboard to load
        console.log("Waiting for dashboard to load...");
        await page.waitForSelector('h3:has-text("TIDE Dashboard")', { timeout: 15000 });
        
        // Verify that the dashboard has loaded and shows the correct summarization period
        console.log("Verifying dashboard loaded successfully...");
        
        // Verify the summarization period is displayed correctly
        // The period might be split across multiple elements, so let's try to find the parent container
        let displayedPeriod = '';
        
        // Try to find the container that has the period information
        console.log("Searching for period display elements...");
        
        // Wait a bit more for the period to fully load
        await page.waitForTimeout(2000);
        
        // Find the parent container of "Summarizing" and extract the period text
        try {
          const summarizingContainer = page.locator('text="Summarizing"').locator('..');
          if (await summarizingContainer.count() > 0) {
            const containerText = await summarizingContainer.first().textContent() || '';
            console.log(`Dashboard shows summarization period: '${containerText}'`);
            
            if (containerText.includes('of data')) {
              // Extract the period from "Summarizing24 hours of data" or "Summarizing 24 hours of data"
              const periodMatch = containerText.match(/Summarizing\s*(.+?)\s+of data/);
              if (periodMatch && periodMatch[1]) {
                displayedPeriod = periodMatch[1].trim();
                
                // Verify the period matches the expected value
                if (displayedPeriod === period) {
                  console.log(`✅ Period validation passed: Found "${displayedPeriod}" as expected`);
                } else {
                  console.log(`❌ Period validation failed: found "${displayedPeriod}", expected "${period}"`);
                }
              } else {
                console.log(`❌ Failed to extract period from container text`);
              }
            }
          }
        } catch (e) {
          console.log(`Period validation error: ${e.message}`);
        }
        
        // Verify period validation succeeded
        if (displayedPeriod !== period) {
          throw new Error(`Period validation failed: expected "${period}" but found "${displayedPeriod}"`);
        }

        // Check for the Drop in Time in Range > 15% section
        console.log(`Checking for Drop in Time in Range > 15% section with ${period} filter...`);
        
        // Wait longer for the data to load after changing the period
        await page.waitForTimeout(5000);
        
        // Wait for the dashboard to finish loading by looking for the Drop in Time in Range section
        console.log("Waiting for dashboard to finish loading data...");
        try {
          // Wait for the Drop in Time in Range section to appear
          await page.waitForSelector('text="Drop in Time in Range > 15%"', { timeout: 15000 });
        } catch (waitError) {
          console.log("Dashboard data still loading, waiting more...");
          await page.waitForTimeout(5000);
        }
        
        // Look for the Drop in Time in Range section specifically
        console.log("Looking for Drop in Time in Range section...");
        const dropSection = page.locator('text="Drop in Time in Range > 15%"');
        const hasDashboardData = await dropSection.isVisible();
        
        console.log(`Drop in Time in Range section visible: ${hasDashboardData}`);
        
        if (hasDashboardData) {
          console.log(`✓ Dashboard data found for ${period} period`);
          
          // Find the specific section container for "Drop in Time in Range > 15%" 
          console.log("Looking for patient table rows specifically in the Drop in Time in Range > 15% section...");
          
          // Use a more specific selector that targets only the Drop in Time in Range section
          // Look for the section header and then find the table immediately following it
          const dropSectionHeader = page.locator('text="Drop in Time in Range > 15%"').first();
          
          // Find the closest parent container that contains both the header and the table
          const dropSectionContainer = dropSectionHeader.locator('xpath=ancestor::div[contains(@class, "section") or contains(@id, "section") or contains(@data-testid, "section")][1]');
          
          // If no specific section container found, try a more general approach
          let actualCount = 0;
          let dropTable;
          
          if (await dropSectionContainer.count() > 0) {
            console.log("Found section container, looking for table within it...");
            dropTable = dropSectionContainer.locator('table[aria-label="peopletablelabel"]').first();
          } else {
            console.log("No specific section container found, trying alternative approach...");
            // Alternative: find the table that immediately follows the "Drop in Time in Range > 15%" text
            dropTable = dropSectionHeader.locator('xpath=following::table[contains(@aria-label, "peopletablelabel")][1]');
          }
          
          if (await dropTable.count() > 0) {
            // Count the patient rows in the table
            const patientRows = dropTable.locator('tbody tr');
            actualCount = await patientRows.count();
            console.log(`Found ${actualCount} patient rows in Drop in Time in Range > 15% section table for ${period} period`);
            
            // Debug: List patient names found (first few)
            if (actualCount > 0) {
              const maxToShow = Math.min(actualCount, 3); // Show first 3 patients
              for (let i = 0; i < maxToShow; i++) {
                const row = patientRows.nth(i);
                const patientNameCell = row.locator('td').first();
                const patientName = await patientNameCell.textContent();
                console.log(`  Patient ${i + 1}: "${patientName}"`);
              }
              if (actualCount > 3) {
                console.log(`  ... and ${actualCount - 3} more patients`);
              }
            }
          } else {
            console.log("No patient table found directly in Drop in Time in Range section");
            
            // Check if there's a "no patients" message in this specific section
            const noDataMessage = dropSectionHeader.locator('xpath=following::*[contains(text(), "There are no patients that match your filter criteria")][1]');
            if (await noDataMessage.isVisible()) {
              actualCount = 0;
              console.log("Found 'no patients' message in Drop in Time in Range section, count is 0");
            } else {
              // Last resort: check if this section shows a count instead of a table
              const countText = dropSectionHeader.locator('xpath=following::*[contains(text(), "1") or contains(text(), "0")][1]');
              if (await countText.count() > 0) {
                const text = await countText.textContent();
                const match = text?.match(/(\d+)/);
                if (match) {
                  actualCount = parseInt(match[1], 10);
                  console.log(`Found count display: ${actualCount}`);
                }
              }
            }
          }
          
          console.log(`Final patient row count in Drop in Time in Range > 15% section for ${period} period: ${actualCount}`);
          
          // We expect exactly 1 patient row for each summarization period
          if (actualCount === 0) {
            // Take a screenshot for debugging
            await page.screenshot({ 
              path: `dashboard-nodata-debug-${period.replace(' ', '-')}-${Date.now()}.png`, 
              fullPage: true 
            });
            console.log(`Screenshot saved for debugging no-data state in Drop section with ${period} filter`);
            
            throw new Error(`Expected 1 patient row in Drop in Time in Range > 15% section for ${period} period, but found 0 patient rows`);
          }
          
          expect(actualCount).toBe(1);
          console.log(`✓ Successfully verified 1 patient row in Drop in Time in Range section for ${period} period`);
        } else {
          // Take a screenshot for debugging
          await page.screenshot({ 
            path: `dashboard-nosection-debug-${period.replace(' ', '-')}-${Date.now()}.png`, 
            fullPage: true 
          });
          console.log(`Screenshot saved for debugging no-section state with ${period} filter`);
          
          // Test should fail if Drop in Time in Range section is not visible
          throw new Error(`Expected Drop in Time in Range > 15% section to be visible for ${period} period, but section was not found`);
        }
      }

      console.log("\n=== Dashboard scenario 2 verification completed successfully! ===");
      console.log("✓ Verified all summarization periods (24 hours, 7 days, 14 days, 30 days)");
      console.log("✓ Successfully tested period filtering functionality");

    } catch (error) {
      console.error("Dashboard scenario 2 verification failed:", error);
      
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: `dashboard-scenario2-verification-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }
  });
});
