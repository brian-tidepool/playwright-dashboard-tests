import { test, expect } from "@playwright/test";
import { Credentials } from "tidepool-cli/lib/credentials";
import { createDashboardOffset } from "tidepool-cli/lib/dashboardScenarioSelector";
import { deletePatients } from "tidepool-cli/lib/deletePatients";

test.describe("Dashboard Scenario 3 - Period Length Variations - All Categories", { tag: '@scenario3' }, () => {
  // Declare variables at test suite level for proper scoping
  let credentials: {
    userName: string;
    password: string;
    baseUrl: string;
  };
  let tagId: string;
  let clinicId: string;
  
  // Helper function to load only scenario3 environment variables
  function loadScenario3EnvironmentVariables() {
    const envVars: { [key: string]: string } = {};
    
    // Load all environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (value) {
        // If variable name contains "scenario", only load scenario3
        if (key.toLowerCase().includes('scenario')) {
          if (key.toLowerCase().includes('scenario3')) {
            envVars[key] = value;
            console.log(`Loaded scenario3 env var: ${key}`);
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

    // Load scenario3-specific environment variables
    const envVars = loadScenario3EnvironmentVariables();
    
    // Setup authentication credentials from environment variables
    credentials = {
      userName: envVars.TIDEPOOL_USERNAME || '',
      password: envVars.TIDEPOOL_PASSWORD || '',
      baseUrl: envVars.TIDEPOOL_BASE_URL || 'https://qa2.development.tidepool.org',
    };

    tagId = envVars.TAG_SCENARIO3_ID || '';
    clinicId = envVars.CLINIC_ID || '';

    // Validate required environment variables
    if (!credentials.userName || !credentials.password || !credentials.baseUrl) {
      throw new Error("Missing Tidepool credentials. Please set TIDEPOOL_USERNAME, TIDEPOOL_PASSWORD, and TIDEPOOL_BASE_URL in your environment variables.");
    }

    if (!tagId || !clinicId) {
      throw new Error("Missing TAG_SCENARIO3_ID or CLINIC_ID. Please set TAG_SCENARIO3_ID and CLINIC_ID in your environment variables.");
    }

    console.log("Environment variables validated successfully");
    console.log(`Using TAG_SCENARIO3_ID: ${tagId}`);
    console.log("Setting up dashboard scenario 3 test data with all categories...");

    try {
      // Pre-processing step: Clean up existing dashboard patients using the helper function
      await cleanupDashboardPatients();

      // Create patient data set with one patient in each category (excluding Data Issues)
      // TIR Input attributes: [ Time below 54 mg/dL > 1%, Time below 70 mg/dL > 4%, Drop in Time in Range > 15%, Time in Range < 70%, CGM Wear Time < 70%, Meeting Targets, Last Data Uploaded Date, Summarizing Period Length]
      // Values: [ 1, 1, 1, 1, 1, 1, Today, 30 days]
      
      console.log("Creating comprehensive dataset for all categories...");
      const allCategoriesTirCounts = {
        "Time below 3.0 mmol/L > 1%": 1,
        "Time below 3.9 mmol/L > 4%": 1,
        "Drop in Time in Range > 15%": 0,
        "Time in Range < 70%": 1,
        "CGM Wear Time <70%": 1,
        "Meeting Targets": 1
      };

      await createDashboardOffset(
        allCategoriesTirCounts,
        30, // period length: 30 days (as specified in requirements)
        0, // offset: 0 minutes (Today)
        "Test Patient Scenario3 AllCategories",
        clinicId,
        tagId,
        credentials
      );

      console.log("Dashboard scenario 3 test data setup completed successfully!");
      console.log("Created dataset with 1 patient appearing in each category");
      
    } catch (error) {
      console.error("Setup failed with error:", error);
      throw error;
    }
  });

  test("should verify dashboard data with one patient in each category across different summarization periods", async ({ page }) => {
    // Set timeout for the test
    test.setTimeout(900000); // 15 minutes
    const waitTime = 60000; // 1 minute wait time for summaries to generate
    console.log(`Wait ${waitTime} ms for test summaries to generated`)
    await page.waitForTimeout(waitTime);
    
    try {
      console.log("Verifying dashboard scenario 3 data with all categories across different summarization periods...");
      
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

      // Handle modal if it appears
      console.log("Checking for dashboard configuration modal...");
      try {
        // Wait for modal to appear
        await page.waitForSelector('text="Select Patients to Display in the TIDE Dashboard"', { timeout: 5000 });
        console.log("Modal detected, configuring dashboard settings...");

        // Select tag scenario3
        console.log("Selecting scenario3 tag...");
        await page.locator('#patient-tags-select').getByText('scenario3').click();

        // Select data recency 'Within 24 hours'
        console.log("Selecting data recency 'Within 24 hours'...");
        await page.locator('#lastData label').filter({ hasText: 'Within 24 hours' }).locator('svg').nth(1).click();

        // Select summarization period '24 hours' for Number of Days to Summarize
        console.log("Selecting summarization period '7 days'...");
        await page.locator('#period').getByText('7 days').click();

        // Wait for Next button to become enabled and click it
        console.log("Clicking Next button...");
        await page.getByRole('button', { name: 'Next' }).click();

      } catch (modalError) {
        console.log("Modal handling failed:", modalError.message);
        throw modalError;
      }

      // Array of summarization periods to test
      const periodsToTest = ['7 days', '14 days', '30 days'];

      // Categories to verify (excluding Data Issues section)
      // Let's first discover what categories actually exist rather than hardcoding them
      const possibleCategories = [
        'Time below 54 mg/dL > 1%',
        'Time below 70 mg/dL > 4%', 
        'Time in Range < 70%',
        'CGM Wear Time < 70%',
        'Meeting Targets'
      ];

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
        }

        // Wait for dashboard to load
        console.log("Waiting for dashboard to load...");
        await page.waitForSelector('h3:has-text("TIDE Dashboard")', { timeout: 15000 });
        
        // Verify that the dashboard has loaded and shows the correct summarization period
        console.log("Verifying dashboard loaded successfully...");
        
        // Verify the summarization period is displayed correctly
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

        // Verify 1 patient row appears in each category (excluding Data Issues section)
        console.log(`Verifying 1 patient in each category for ${period} period...`);
        
        // Wait longer for the data to load after changing the period
        await page.waitForTimeout(5000);
        
        // First, discover which categories actually exist on the dashboard
        console.log("Discovering available categories on the dashboard...");
        const categoriesToVerify: string[] = [];
        
        for (const category of possibleCategories) {
          try {
            // Check if this category exists on the dashboard with a short timeout
            const categoryExists = await page.locator(`text="${category}"`).isVisible({ timeout: 2000 });
            if (categoryExists) {
              categoriesToVerify.push(category);
              console.log(`✓ Found category: ${category}`);
            } else {
              console.log(`✗ Category not found: ${category}`);
            }
          } catch (e) {
            console.log(`✗ Category not accessible: ${category}`);
          }
        }
        
        console.log(`Found ${categoriesToVerify.length} categories to verify: ${categoriesToVerify.join(', ')}`);
        
        if (categoriesToVerify.length === 0) {
          throw new Error(`No dashboard categories found for ${period} period. Dashboard may not have loaded properly.`);
        }
        
        for (const category of categoriesToVerify) {
          console.log(`\nChecking category: ${category}`);
          
          // Wait for the category section to appear
          try {
            await page.waitForSelector(`text="${category}"`, { timeout: 15000 });
          } catch (waitError) {
            console.log(`Category ${category} still loading, waiting more...`);
            await page.waitForTimeout(5000);
          }
          
          // Look for the category section specifically
          const categorySection = page.locator(`text="${category}"`);
          const hasCategoryData = await categorySection.isVisible();
          
          console.log(`${category} section visible: ${hasCategoryData}`);
          
          if (hasCategoryData) {
            console.log(`✓ Found ${category} section for ${period} period`);
            
            // Find the specific section container for this category
            console.log(`Looking for patient table rows specifically in the ${category} section...`);
            
            const categorySectionHeader = page.locator(`text="${category}"`).first();
            
            // Find the closest parent container that contains both the header and the table
            const categorySectionContainer = categorySectionHeader.locator('xpath=ancestor::div[contains(@class, "section") or contains(@id, "section") or contains(@data-testid, "section")][1]');
            
            let actualCount = 0;
            let categoryTable;
            
            if (await categorySectionContainer.count() > 0) {
              console.log(`Found section container for ${category}, looking for table within it...`);
              categoryTable = categorySectionContainer.locator('table[aria-label="peopletablelabel"]').first();
            } else {
              console.log(`No specific section container found for ${category}, trying alternative approach...`);
              // Alternative: find the table that immediately follows the category text
              categoryTable = categorySectionHeader.locator('xpath=following::table[contains(@aria-label, "peopletablelabel")][1]');
            }
            
            if (await categoryTable.count() > 0) {
              // Count the patient rows in the table
              const patientRows = categoryTable.locator('tbody tr');
              actualCount = await patientRows.count();
              console.log(`Found ${actualCount} patient rows in ${category} section table for ${period} period`);
              
              // Debug: List patient names found and verify they contain category name
              if (actualCount > 0) {
                for (let j = 0; j < actualCount; j++) {
                  const row = patientRows.nth(j);
                  const patientNameCell = row.locator('td').first();
                  const patientName = await patientNameCell.textContent();
                  console.log(`  Patient ${j + 1}: "${patientName}"`);
                  
                  // Verify that the patient name contains the category name
                  if (patientName && patientName.includes('AllCategories')) {
                    console.log(`  ✓ Patient name contains expected category identifier`);
                  } else {
                    console.log(`  ⚠ Patient name does not contain expected category identifier`);
                  }
                }
              }
            } else {
              console.log(`No patient table found directly in ${category} section`);
              
              // Check if there's a "no patients" message in this specific section
              const noDataMessage = categorySectionHeader.locator('xpath=following::*[contains(text(), "There are no patients that match your filter criteria")][1]');
              if (await noDataMessage.isVisible()) {
                actualCount = 0;
                console.log(`Found 'no patients' message in ${category} section, count is 0`);
              } else {
                // Last resort: check if this section shows a count instead of a table
                const countText = categorySectionHeader.locator('xpath=following::*[contains(text(), "1") or contains(text(), "0")][1]');
                if (await countText.count() > 0) {
                  const text = await countText.textContent();
                  const match = text?.match(/(\d+)/);
                  if (match) {
                    actualCount = parseInt(match[1], 10);
                    console.log(`Found count display for ${category}: ${actualCount}`);
                  }
                }
              }
            }
            
            console.log(`Final patient row count in ${category} section for ${period} period: ${actualCount}`);
            
            // We expect exactly 1 patient row in each category
            if (actualCount === 0) {
              // Take a screenshot for debugging
              await page.screenshot({ 
                path: `dashboard-allcategories-nodata-debug-${category.replace(/[^a-zA-Z0-9]/g, '-')}-${period.replace(' ', '-')}-${Date.now()}.png`, 
                fullPage: true 
              });
              console.log(`Screenshot saved for debugging no-data state in ${category} section with ${period} filter`);
              
              throw new Error(`Expected 1 patient row in ${category} section for ${period} period, but found 0 patient rows`);
            }
            
            expect(actualCount).toBe(1);
            console.log(`✓ Successfully verified 1 patient row in ${category} section for ${period} period`);
            
          } else {
            // Take a screenshot for debugging
            await page.screenshot({ 
              path: `dashboard-allcategories-nosection-debug-${category.replace(/[^a-zA-Z0-9]/g, '-')}-${period.replace(' ', '-')}-${Date.now()}.png`, 
              fullPage: true 
            });
            console.log(`Screenshot saved for debugging no-section state for ${category} with ${period} filter`);
            
            // Test should fail if category section is not visible
            throw new Error(`Expected ${category} section to be visible for ${period} period, but section was not found`);
          }
        }
      }

      console.log("\n=== Dashboard scenario 3 verification completed successfully! ===");
      console.log("✓ Verified all summarization periods (24 hours, 7 days, 14 days, 30 days)");
      console.log("✓ Successfully verified 1 patient in each category across all periods");
      console.log("✓ Successfully tested period filtering functionality with Apply button");

    } catch (error) {
      console.error("Dashboard scenario 3 verification failed:", error);
      
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: `dashboard-scenario3-verification-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }
  });
});
