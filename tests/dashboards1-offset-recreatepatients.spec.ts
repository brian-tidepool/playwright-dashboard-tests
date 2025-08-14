import { test, expect } from "@playwright/test";
import { Credentials } from "tidepool-cli/lib/credentials";
import { createDashboardOffset } from "tidepool-cli/lib/dashboardScenarioSelector";
import { deletePatients } from "tidepool-cli/lib/deletePatients";

test.describe("Dashboard Offset Verification Tests", { tag: '@scenario1' }, () => {
  // Declare variables at test suite level for proper scoping
  let credentials: {
    userName: string;
    password: string;
    baseUrl: string;
  };
  let tagId: string;
  let clinicId: string;
  
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
      
      // Try different parameter order - credentials first, then clinicId, tagId
      await deletePatients(creds, clinicId, tagId);
      
      console.log("Successfully deleted patients using deletePatients function");
      
    } catch (error) {
      console.error("Error calling deletePatients:", error.message);
      throw error;
    }
  }
  
  test.beforeAll(async () => {
    // Set a longer timeout for setup
    test.setTimeout(6000000); // 10 minutes for setup

    // Setup authentication credentials from environment variables
    credentials = {
      userName: process.env.TIDEPOOL_USERNAME || '',
      password: process.env.TIDEPOOL_PASSWORD || '',
      baseUrl: process.env.TIDEPOOL_BASE_URL || 'https://qa2.development.tidepool.org',
    };

    tagId = process.env.TAG_SCENARIO1_ID || '';
    clinicId = process.env.CLINIC_ID || '';

    // Validate required environment variables
    if (!credentials.userName || !credentials.password || !credentials.baseUrl) {
      throw new Error("Missing Tidepool credentials. Please set TIDEPOOL_USERNAME, TIDEPOOL_PASSWORD, and TIDEPOOL_BASE_URL in your environment variables.");
    }

    if (!tagId || !clinicId) {
      throw new Error("Missing TAG_SCENARIO1_ID or CLINIC_ID. Please set TAG_SCENARIO1_ID and CLINIC_ID in your environment variables.");
    }

    console.log("Environment variables validated successfully");
    
    // Check if data setup should be performed (configurable via environment variable)
    const shouldSetupData = process.env.SETUP_DASHBOARD_DATA?.toLowerCase() === 'true';
    console.log(`Data setup ${shouldSetupData ? 'enabled' : 'disabled'} via SETUP_DASHBOARD_DATA environment variable`);

    // Check if data should be scaled down by 10x (configurable via environment variable)
    const shouldScaleDown = process.env.SCALE_DOWN_DATASET?.toLowerCase() === 'true';
    const scaleFactor = shouldScaleDown ? 0.1 : 1;
    console.log(`Dataset scaling ${shouldScaleDown ? 'enabled' : 'disabled'} via SCALE_DOWN_DATASET environment variable (scale factor: ${scaleFactor})`);

    if (shouldSetupData) {
      console.log("Setting up dashboard offset test data...");

      try {
        // Clean up existing dashboard patients using the helper function
        await cleanupDashboardPatients();

        // Create users with offset 0 minutes
        console.log("Creating users with 0 minute offset...");
        const tirCounts0 = {
          "Time below 3.0 mmol/L > 1%": Math.round(50 * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(40 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(40 * scaleFactor),
          "Time in Range < 70%": Math.round(40 * scaleFactor),
          "CGM Wear Time <70%": Math.round(40 * scaleFactor),
          "Meeting Targets": Math.round(40 * scaleFactor)
        };

        await createDashboardOffset(
          tirCounts0,
          14, // period length in days
          0, // offset 0 minutes
          "Test Patient Offset 0",
          clinicId,
          tagId,
          credentials
        );

        // Create users with offset 2*1440 minutes (2 days)
        console.log("Creating users with 2 day offset...");
        const tirCounts2Days = {
          "Time below 3.0 mmol/L > 1%": Math.round(40 * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(0 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(0 * scaleFactor),
          "Time in Range < 70%": Math.round(0 * scaleFactor),
          "CGM Wear Time <70%": Math.round(0 * scaleFactor),
          "Meeting Targets": Math.round(0 * scaleFactor)
        };

        await createDashboardOffset(
          tirCounts2Days,
          14, // period length in days
          2 * 1440, // offset 2 days
          "Test Patient Offset 2Days",
          clinicId,
          tagId,
          credentials
        );

        // Create users with offset 7*1440 minutes (7 days)
        console.log("Creating users with 7 day offset...");
        const tirCounts7Days = {
          "Time below 3.0 mmol/L > 1%": Math.round(40 * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(0 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(0 * scaleFactor),
          "Time in Range < 70%": Math.round(0 * scaleFactor),
          "CGM Wear Time <70%": Math.round(0 * scaleFactor),
          "Meeting Targets": Math.round(0 * scaleFactor)
        };

        await createDashboardOffset(
          tirCounts7Days,
          14, // period length in days
          7 * 1440, // offset 7 days
          "Test Patient Offset 7Days",
          clinicId,
          tagId,
          credentials
        );

        // Create users with offset 14*1440 minutes (14 days)
        console.log("Creating users with 14 day offset...");
        const tirCounts14Days = {
          "Time below 3.0 mmol/L > 1%": Math.round(40 * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(0 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(0 * scaleFactor),
          "Time in Range < 70%": Math.round(0 * scaleFactor),
          "CGM Wear Time <70%": Math.round(0 * scaleFactor),
          "Meeting Targets": Math.round(0 * scaleFactor)
        };

        await createDashboardOffset(
          tirCounts14Days,
          14, // period length in days
          14 * 1440, // offset 14 days
          "Test Patient Offset 14Days",
          clinicId,
          tagId,
          credentials
        );

        console.log("Dashboard offset test data setup completed successfully!");

      } catch (error) {
        console.error("Setup failed with error:", error);
        throw error;
      }
    } else {
      console.log("Skipping data setup - using existing dashboard data");
    }
  });

  test("should verify dashboard counts with correct offset data across different data recency periods", async ({ page }) => {
    // Set timeout for the test
    test.setTimeout(900000); // 15 minutes
    
    // Use environment variable for wait time, with fallback to 60 seconds
    const waitTime = parseInt(process.env.WAIT_SUMMARY_CALCULATION_FINISH || '60000', 10);
    console.log(`Wait ${waitTime} ms for test summaries to be generated`);
    await page.waitForTimeout(waitTime);

    // Check if data should be scaled down by 10x (configurable via environment variable)
    const shouldScaleDown = process.env.SCALE_DOWN_DATASET?.toLowerCase() === 'true';
    const scaleFactor = shouldScaleDown ? 0.1 : 1;
    console.log(`Dataset scaling ${shouldScaleDown ? 'enabled' : 'disabled'} via SCALE_DOWN_DATASET environment variable (scale factor: ${scaleFactor})`);

    try {
      console.log("Verifying dashboard scenario 1 data creation with different data recency periods...");

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

        // Select tag 'scenario1'
        console.log("Selecting tag 'scenario1'...");
        await page.locator('#patient-tags-select').getByText('scenario1').click();

        // Select data recency 'Within 2 days' for initial verification
        console.log("Selecting data recency 'Within 2 days'...");
        await page.locator('#lastData label').filter({ hasText: 'Within 2 days' }).locator('svg').nth(1).click();

        // Select summarization period '14 days'
        console.log("Selecting summarization period '14 days'...");
        await page.locator('#period').getByText('14 days').click();

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

      // Array of data recency periods to test
      const dataRecencyPeriods = [
        { period: '2 days', expectedCounts: {
          "Time below 3.0 mmol/L > 1%": Math.round((shouldScaleDown ? 50 : 90) * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(40 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(40 * scaleFactor),
          "Time in Range < 70%": Math.round(40 * scaleFactor),
          "CGM Wear Time < 70%": Math.round(40 * scaleFactor),
          "Meeting Targets": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor)
        }},
        { period: '7 days', expectedCounts: {
          "Time below 3.0 mmol/L > 1%": Math.round((shouldScaleDown ? 90 : 130) * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(40 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(40 * scaleFactor),
          "Time in Range < 70%": Math.round(40 * scaleFactor),
          "CGM Wear Time < 70%": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor),
          "Meeting Targets": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor)
        }},
        { period: '14 days', expectedCounts: {
          "Time below 3.0 mmol/L > 1%": Math.round((shouldScaleDown ? 130 : 170) * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(40 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round(40 * scaleFactor),
          "Time in Range < 70%": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor),
          "CGM Wear Time < 70%": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor),
          "Meeting Targets": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor)
        }},
        { period: '30 days', expectedCounts: {
          "Time below 3.0 mmol/L > 1%": Math.round((shouldScaleDown ? 170 : 210) * scaleFactor),
          "Time below 3.9 mmol/L > 4%": Math.round(40 * scaleFactor),
          "Drop in Time in Range > 15%": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor),
          "Time in Range < 70%": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor),
          "CGM Wear Time < 70%": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor),
          "Meeting Targets": Math.round((shouldScaleDown ? 40 : 0) * scaleFactor)
        }}
      ];

      // Test each data recency period
      for (let i = 0; i < dataRecencyPeriods.length; i++) {
        const { period, expectedCounts } = dataRecencyPeriods[i];
        console.log(`\n=== Testing data recency period: ${period} ===`);
        
        if (i > 0) {
          // For subsequent periods, use Filter Patients button to reconfigure
          console.log(`Reconfiguring dashboard for ${period} data recency...`);
          
          // Click the Filter Patients button
          await page.getByRole('button', { name: 'Filter Patients Open dashboard config' }).waitFor({ timeout: 10000 });
          await page.getByRole('button', { name: 'Filter Patients Open dashboard config' }).click();

          // Wait for modal to appear
          await page.waitForSelector('text="Select Patients to Display in the TIDE Dashboard"', { timeout: 10000 });

          // Select the current data recency period being tested
          console.log(`Selecting data recency 'Within ${period}'...`);
          await page.locator('#lastData label').filter({ hasText: `Within ${period}` }).locator('svg').nth(1).click();

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
        
        // Verify that the dashboard has loaded and shows the correct data recency period
        console.log("Verifying dashboard loaded successfully...");
        
        // Wait a bit more for the data to load after changing the period
        await page.waitForTimeout(5000);
        
        // Verify the dashboard has loaded with the expected sections and counts
        const dashboardSections = [
          "Time below 3.0 mmol/L > 1%",
          "Time below 3.9 mmol/L > 4%", 
          "Drop in Time in Range > 15%",
          "Time in Range < 70%",
          "CGM Wear Time < 70%",
          "Meeting Targets"
        ];
        
        console.log(`Verifying expected counts for data recency period: ${period}`);
        
        for (const sectionTitle of dashboardSections) {
          console.log(`Verifying section: ${sectionTitle}`);
          const section = page.locator(`text="${sectionTitle}"`).first();
          await expect(section).toBeVisible({ timeout: 10000 });
          console.log(`✓ Section "${sectionTitle}" is visible`);
          
          // Check expected counts for each section
          if (expectedCounts[sectionTitle] !== undefined) {
            console.log(`Checking patient count for section: ${sectionTitle}`);
            
            // Find the specific section container for this section title
            console.log(`Looking for patient table rows specifically in the ${sectionTitle} section...`);
            
            // Use a more specific selector that targets only this section
            // Look for the section header and then find the table immediately following it
            const sectionHeader = page.locator(`text="${sectionTitle}"`).first();
            
            // Find the closest parent container that contains both the header and the table
            const sectionContainer = sectionHeader.locator('xpath=ancestor::div[contains(@class, "section") or contains(@id, "section") or contains(@data-testid, "section")][1]');
            
            // If no specific section container found, try a more general approach
            let actualCount = 0;
            let sectionTable;
            
            if (await sectionContainer.count() > 0) {
              console.log("Found section container, looking for table within it...");
              sectionTable = sectionContainer.locator('table[aria-label="peopletablelabel"]').first();
            } else {
              console.log("No specific section container found, trying alternative approach...");
              // Alternative: find the table that immediately follows the section text
              sectionTable = sectionHeader.locator('xpath=following::table[contains(@aria-label, "peopletablelabel")][1]');
            }
            
            if (await sectionTable.count() > 0) {
              // Count the patient rows in the table
              const patientRows = sectionTable.locator('tbody tr');
              actualCount = await patientRows.count();
              console.log(`Found ${actualCount} patient rows in ${sectionTitle} section table for ${period} data recency`);
              
              // Debug: List patient names found (first few)
              if (actualCount > 0) {
                const maxToShow = Math.min(actualCount, 3); // Show first 3 patients
                for (let j = 0; j < maxToShow; j++) {
                  const row = patientRows.nth(j);
                  const patientNameCell = row.locator('td').first();
                  const patientName = await patientNameCell.textContent();
                  console.log(`  Patient ${j + 1}: "${patientName}"`);
                }
                if (actualCount > 3) {
                  console.log(`  ... and ${actualCount - 3} more patients`);
                }
              }
            } else {
              console.log(`No patient table found directly in ${sectionTitle} section`);
              
              // Check if there's a "no patients" message in this specific section
              const noDataMessage = sectionHeader.locator('xpath=following::*[contains(text(), "There are no patients that match your filter criteria")][1]');
              if (await noDataMessage.isVisible()) {
                actualCount = 0;
                console.log(`Found 'no patients' message in ${sectionTitle} section, count is 0`);
              } else {
                // Last resort: check if this section shows a count instead of a table
                const countText = sectionHeader.locator('xpath=following::*[contains(text(), "0") or contains(text(), "1") or contains(text(), "2") or contains(text(), "3") or contains(text(), "4") or contains(text(), "5")][1]');
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
            
            console.log(`Final patient row count in ${sectionTitle} section for ${period} data recency: ${actualCount}`);
            console.log(`Expected: ${expectedCounts[sectionTitle]}, Actual: ${actualCount} patients in ${sectionTitle}`);
            
            // Assert that the actual count matches the expected count
            if (actualCount !== expectedCounts[sectionTitle]) {
              // Take a screenshot for debugging
              await page.screenshot({ 
                path: `dashboard-count-mismatch-${sectionTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${period.replace(' ', '-')}-${Date.now()}.png`, 
                fullPage: true 
              });
              console.log(`Screenshot saved for debugging count mismatch in ${sectionTitle} section with ${period} data recency`);
              
              throw new Error(`Expected ${expectedCounts[sectionTitle]} patients in section "${sectionTitle}" for ${period} data recency, but found ${actualCount} patient rows`);
            }
            
            expect(actualCount).toBe(expectedCounts[sectionTitle]);
            console.log(`✓ Successfully verified ${actualCount} patient rows in ${sectionTitle} section for ${period} data recency`);
          }
        }
      }

      console.log("\n=== Dashboard scenario 1 verification completed successfully! ===");
      console.log("✓ Verified all data recency periods (2 days, 7 days, 14 days, 30 days)");
      console.log("✓ Successfully tested data recency filtering functionality");

    } catch (error) {
      console.error("Dashboard scenario 1 verification failed:", error);
      
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: `dashboard-scenario1-verification-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }
  });
});