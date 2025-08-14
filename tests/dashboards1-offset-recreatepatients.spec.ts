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

    if (shouldSetupData) {
      console.log("Setting up dashboard offset test data...");

      try {
        // Clean up existing dashboard patients using the helper function
        await cleanupDashboardPatients();

        // Create users with offset 0 minutes
        console.log("Creating users with 0 minute offset...");
        const tirCounts0 = {
          "Time below 3.0 mmol/L > 1%": 50,
          "Time below 3.9 mmol/L > 4%": 40,
          "Drop in Time in Range > 15%": 40,
          "Time in Range < 70%": 40,
          "CGM Wear Time <70%": 40,
          "Meeting Targets": 40
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
          "Time below 3.0 mmol/L > 1%": 40,
          "Time below 3.9 mmol/L > 4%": 0,
          "Drop in Time in Range > 15%": 0,
          "Time in Range < 70%": 0,
          "CGM Wear Time <70%": 0,
          "Meeting Targets": 0
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
          "Time below 3.0 mmol/L > 1%": 40,
          "Time below 3.9 mmol/L > 4%": 0,
          "Drop in Time in Range > 15%": 0,
          "Time in Range < 70%": 0,
          "CGM Wear Time <70%": 0,
          "Meeting Targets": 0
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
          "Time below 3.0 mmol/L > 1%": 40,
          "Time below 3.9 mmol/L > 4%": 0,
          "Drop in Time in Range > 15%": 0,
          "Time in Range < 70%": 0,
          "CGM Wear Time <70%": 0,
          "Meeting Targets": 0
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

  test("should verify dashboard counts with correct offset data", async ({ page }) => {
    // Set timeout for the test
    test.setTimeout(300000); // 5 minutes

    try {
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

      // Wait for login to complete
      //await page.waitForLoadState('networkidle');

      // Go to workspace a2 abc
      console.log("Navigating to workspace a2 abc...");
      // Wait for the workspaces page to load
      await page.waitForSelector('text="Welcome To Tidepool"', { timeout: 15000 });
      
      // Find and click on the "a2 abc" workspace's "Go To Workspace" button
      const a2abcHeading = page.locator('h4:has-text("a2 abc")').first();
      const goToWorkspaceButton = a2abcHeading.locator('xpath=following::button[normalize-space()="Go To Workspace"][1]');
      await goToWorkspaceButton.waitFor({ state: 'visible', timeout: 15000 });
      await goToWorkspaceButton.click();

      //await page.waitForLoadState('networkidle');

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

        // Select tag 'category2' (note: not 'category 2')
        console.log("Selecting tag 'category2'...");
        await page.locator('#patient-tags-select').getByText('category2').click();

        // Select data recency 'Within 24 hours'
        console.log("Selecting data recency 'Within 24 hours'...");
        await page.locator('#lastData label').filter({ hasText: 'Within 24 hours' }).locator('svg').nth(1).click();


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

      // Wait for dashboard to load
      console.log("Waiting for dashboard to load...");
      await page.waitForSelector('h3:has-text("TIDE Dashboard")', { timeout: 15000 });
      await page.waitForSelector('table[aria-label="peopletablelabel"]', { timeout: 10000 });
      
      // Verify that patients with category2 tag are displayed
      console.log("Verifying patients with category2 tag...");
      const categoryElements = await page.locator('text=category2').count();
      console.log(`Found ${categoryElements} patients with category2 tag`);
      
      // Define expected counts for each category
      const expectedCounts = {
        "Time below 3.0 mmol/L > 1%": 50,
        "Time below 3.9 mmol/L > 4%": 40,
        "Drop in Time in Range > 15%": 40,
        "Time in Range < 70%": 40,
        "CGM Wear Time < 70%": 40,
        "Meeting Targets": 40
      };

      // Verify the dashboard has loaded with the expected sections and counts
      const dashboardSections = [
        "Time below 3.0 mmol/L > 1%",
        "Time below 3.9 mmol/L > 4%", 
        "Drop in Time in Range > 15%",
        "Time in Range < 70%",
        "CGM Wear Time < 70%",
        "Meeting Targets",
        "Data Issues"
      ];
      
      for (const sectionTitle of dashboardSections) {
        console.log(`Verifying section: ${sectionTitle}`);
        const section = page.locator(`text="${sectionTitle}"`).first();
        await expect(section).toBeVisible({ timeout: 5000 });
        console.log(`✓ Section "${sectionTitle}" is visible`);
        
        // Check expected counts for non-Data Issues sections
        // Test will FAIL if no patients are found but expected count > 0
        if (expectedCounts[sectionTitle]) {
          console.log(`Checking patient count for section: ${sectionTitle}`);
          
          // Try multiple approaches to find the patient table for this section
          // Approach 1: Look for table following the section title
          let patientTable = page.locator(`text="${sectionTitle}"`).locator('xpath=following::table[contains(@aria-label, "peopletablelabel")][1]');
          let hasTable = await patientTable.count() > 0;
          
          // Approach 2: If not found, look within the section container
          if (!hasTable) {
            const sectionContainer = page.locator(`text="${sectionTitle}"`).locator('xpath=following-sibling::*[1]');
            patientTable = sectionContainer.locator('table[aria-label="peopletablelabel"]');
            hasTable = await patientTable.count() > 0;
          }
          
          // Approach 3: Look for any table within the broader section area
          if (!hasTable) {
            patientTable = page.locator(`text="${sectionTitle}"`).locator('xpath=following::*[contains(@class, "table") or .//table][1]//table');
            hasTable = await patientTable.count() > 0;
          }
          
          console.log(`Found table for "${sectionTitle}": ${hasTable}`);
          
          if (hasTable) {
            const patientRows = patientTable.locator('tbody tr');
            const actualCount = await patientRows.count();
            
            console.log(`Expected: ${expectedCounts[sectionTitle]}, Actual: ${actualCount} patients in ${sectionTitle}`);
            
            // Assert that the actual count matches the expected count
            expect(actualCount).toBe(expectedCounts[sectionTitle]);
            console.log(`✓ Patient count verified for "${sectionTitle}": ${actualCount} patients`);
          } else {
            // Check if there's a "no patients" message anywhere near the section
            const noPatients = await page.locator(`text="${sectionTitle}"`).locator('xpath=following::*[contains(text(), "There are no patients that match your filter criteria")][1]').count();
            if (noPatients > 0) {
              console.log(`⚠️ Section "${sectionTitle}" shows no patients match filter criteria`);
              console.log(`Expected ${expectedCounts[sectionTitle]} patients but found none due to filter settings`);
              
              // Fail the test if we expected patients but found none
              if (expectedCounts[sectionTitle] > 0) {
                throw new Error(`Expected ${expectedCounts[sectionTitle]} patients in section "${sectionTitle}" but found none. Filter criteria may be too restrictive.`);
              }
            } else {
              console.log(`⚠️ Section "${sectionTitle}" has no table and no "no patients" message`);
              
              // Add debugging information to help identify the issue
              const sectionElement = page.locator(`text="${sectionTitle}"`).first();
              const nextElement = sectionElement.locator('xpath=following::*[1]');
              const nextElementText = await nextElement.textContent();
              console.log(`Next element after section: "${nextElementText}"`);
              
              // Fail the test if we expected patients but can't find any data structure
              if (expectedCounts[sectionTitle] > 0) {
                throw new Error(`Expected ${expectedCounts[sectionTitle]} patients in section "${sectionTitle}" but found no patient table or data. Section may not be loading properly. Next element: "${nextElementText}"`);
              }
            }
          }
        }
      }

      // Verify that the Data Issues section has patient data
      console.log("Verifying Data Issues section has patient data...");
      const dataIssuesTable = page.locator('text="Data Issues"').locator('xpath=following::table[1]');
      const patientRows = dataIssuesTable.locator('tbody tr');
      const patientCount = await patientRows.count();
      console.log(`Found ${patientCount} patients in Data Issues section`);
      
      // Expect at least some patients to be displayed
      expect(patientCount).toBeGreaterThan(0);
      
      // Verify that at least some patients have the expected tag
      expect(categoryElements).toBeGreaterThan(0);

      console.log("Dashboard verification completed successfully!");

    } catch (error) {
      console.error("Dashboard verification failed:", error);
      
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: `dashboard-verification-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }
  });
});