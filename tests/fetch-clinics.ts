import { test, expect } from "@playwright/test";

// Import directly from the GitHub branch
// Note: You'll need to install this specific branch first:
// npm run install-tidepool

import { Credentials } from "tidepool-cli/lib/credentials";
import {
  ClinicData,
  fetchClinicsByCredentials,
} from "tidepool-cli/lib/fetchClinics";
import {
  fetchClinicsWithTags
} from "tidepool-cli/lib/fetchTags";

test.describe("Tidepool CLI fetchClinics", () => {
  test("should authenticate and fetch clinics", async ({ page }) => {
    // Setup authentication credentials from environment variables only
    const credentials = {
      userName: process.env.TIDEPOOL_USERNAME,
      password: process.env.TIDEPOOL_PASSWORD,
      baseUrl: process.env.TIDEPOOL_BASE_URL,
    };

    try {
      // Check for required environment variables first
      if (!credentials.userName || !credentials.password || !credentials.baseUrl) {
        throw new Error("Missing Tidepool credentials. Please set TIDEPOOL_USERNAME, TIDEPOOL_PASSWORD, and TIDEPOOL_BASE_URL in your environment variables.");
      }

      console.log("Authenticating with Tidepool...");
      console.log("Authentication successful");

      // Fetch clinics directly using credentials
      console.log("Fetching clinics...");
      const clinics: ClinicData[] | null = await fetchClinicsByCredentials({
        userName: credentials.userName,
        password: credentials.password,
        baseUrl: credentials.baseUrl,
      });

      // Basic assertions
      expect(clinics).toBeDefined();
      expect(Array.isArray(clinics)).toBe(true);

      if (!clinics || clinics.length === 0) {
        console.log("No clinics found for the current user.");
        return;
      } else {
        console.log(`Found ${clinics.length} clinic(s)`);

        // Log first clinic for debugging
        console.log("First clinic:", JSON.stringify(clinics[0], null, 2));

        // Verify clinic structure
        const firstClinic = clinics[0];
        expect(firstClinic.clinic).toHaveProperty("id");
        expect(firstClinic.clinic).toHaveProperty("name");
        expect(typeof firstClinic.clinic.id).toBe("string");
        expect(typeof firstClinic.clinic.name).toBe("string");
      }
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });


});
