import { test, expect } from "@playwright/test";

// Import directly from the GitHub branch
// Note: You'll need to install this specific branch first:
// npm run install-tidepool

import { Credentials } from "tidepool-cli/lib/credentials";
import { createDashboardOffset } from "tidepool-cli/lib/dashboardScenarioSelector";

test.describe("Tidepool CLI createDashboardOffset", () => {
  test("should create dashboard with offset", async ({ page }) => {
    // Set a longer timeout for this test as it creates patients and uploads data
    test.setTimeout(3000000); // 5 minutes

    // Setup authentication credentials from environment variables only
    const credentials = {
      userName: process.env.TIDEPOOL_USERNAME,
      password: process.env.TIDEPOOL_PASSWORD,
      baseUrl: process.env.TIDEPOOL_BASE_URL,
    };

    // Get additional parameters from environment variables
    const tagId = process.env.TAG_ID;
    const clinicId = process.env.CLINIC_ID;

    try {
      // Check for required environment variables first
      if (!credentials.userName || !credentials.password || !credentials.baseUrl) {
        throw new Error("Missing Tidepool credentials. Please set TIDEPOOL_USERNAME, TIDEPOOL_PASSWORD, and TIDEPOOL_BASE_URL in your environment variables.");
      }

      if (!tagId || !clinicId) {
        throw new Error("Missing TAG_ID or CLINIC_ID. Please set TAG_ID and CLINIC_ID in your environment variables.");
      }

      console.log("Creating dashboard with offset...");

      // Define tirCounts as specified
      const tirCounts = {
        "Time below 3.0 mmol/L > 1%": 1,
        "Time below 3.9 mmol/L > 4%": 1,
        "Drop in Time in Range > 15%": 1,
        "Time in Range < 70%": 1,
        "CGM Wear Time <70%": 1,
        "Meeting Targets": 1
      };

      // Set parameters as specified
      const offset = 1440; // offset in minutes
      const periodLength = 14; // period length in days
      const patientName = "Test Patient Dashboard Offset"; // patient name for the test

      console.log("Parameters:");
      console.log(`- Clinic ID: ${clinicId}`);
      console.log(`- Tag ID: ${tagId}`);
      console.log(`- Offset: ${offset} minutes`);
      console.log(`- Period Length: ${periodLength} days`);
      console.log(`- Patient Name: ${patientName}`);
      console.log(`- TIR Counts:`, JSON.stringify(tirCounts, null, 2));

      // Create dashboard with offset
      await createDashboardOffset(
        tirCounts,
        periodLength,
        offset,
        patientName,
        clinicId,
        tagId,
        {
          userName: credentials.userName,
          password: credentials.password,
          baseUrl: credentials.baseUrl,
        }
      );

      console.log("Dashboard with offset created successfully!");

      // The function doesn't return anything, so we just verify it doesn't throw
      // This is a successful test if no error is thrown
      expect(true).toBe(true);

    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });
});
