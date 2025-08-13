# Tidepool CLI Dashboard Tests

This project contains Playwright tests for the Tidepool CLI library, specifically testing dashboard functionality including clinic management, patient tagging, and dashboard creation with time offsets.

## Prerequisites

- Node.js (version 16 or higher)
- npm (Node Package Manager)
- Git
- A Tidepool account with clinic access
- Visual Studio Code (recommended for development)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd playwright-dashboard-tests
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Tidepool CLI Library

The project uses a custom build of the Tidepool CLI library from a specific GitHub branch. Run the installation script:

```bash
npm run install-tidepool
```

This command will:
- Install the Tidepool CLI from the GitHub repository
- Navigate to the library directory
- Install its dependencies
- Build the library

### 4. Install Playwright Browsers

```bash
npx playwright install
```

### 5. Set Up Environment Variables

Create a `.env` file in the project root directory with your Tidepool credentials and test parameters:

```env
TIDEPOOL_USERNAME=your-username@example.com
TIDEPOOL_PASSWORD=your-password
TIDEPOOL_BASE_URL=https://int-api.tidepool.org
TAG_SCENARIO1_ID=your-tag-id
TAG_SCENARIO2_ID=your-scenario2-tag-id
CLINIC_ID=your-clinic-id
```

**Important Notes:**
- Replace the values with your actual Tidepool credentials
- The `TAG_SCENARIO1_ID` and `TAG_SCENARIO2_ID` and `CLINIC_ID` are required for dashboard creation tests
- Make sure there are no extra spaces in the values
- Never commit the `.env` file to version control

### 6. Verify Installation

Run a quick test to verify everything is set up correctly:

```bash
npm test -- tests/dashboard.spec.ts
```

If successful, you should see output indicating the test passed and fetched clinic data.

## Project Structure

```
playwright-dashboard-tests/
├── tests/
│   ├── dashboard.spec.ts              # Tests fetchClinicsByCredentials
│   ├── clinics-with-tags.spec.ts      # Tests fetchClinicsWithTags
│   └── create-dashboard-offset.spec.ts # Tests createDashboardOffset
├── playwright.config.ts               # Playwright configuration
├── package.json                       # Project dependencies and scripts
├── .env                               # Environment variables (create this)
└── README.md                          # This file
```

## Available Scripts

### Test Commands

```bash
# Run all tests
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests in debug mode with step-by-step execution
npm run test:debug

# Run a specific test file
npm test -- tests/dashboard.spec.ts

# Run tests matching a pattern
npm test -- --grep "clinic"
```

### Development Commands

```bash
# Reinstall and rebuild Tidepool CLI library
npm run install-tidepool

# Show last test report
npx playwright show-report
```

## Test Descriptions

### dashboard.spec.ts
Tests the `fetchClinicsByCredentials` function which retrieves clinic information using authentication credentials.

**What it tests:**
- Authentication with Tidepool API
- Fetching clinic data
- Validating clinic structure and required fields

### clinics-with-tags.spec.ts
Tests the `fetchClinicsWithTags` function which retrieves clinics and their associated patient tags.

**What it tests:**
- Clinic data retrieval with tag information
- Patient tags property validation
- Graceful handling of unimplemented features

### create-dashboard-offset.spec.ts
Tests the `createDashboardOffset` function which creates dashboard data with time-based offsets for testing Time in Range (TIR) scenarios.

**What it tests:**
- Patient creation with specific TIR counts
- Dashboard creation with time offsets
- Data upload and validation

**Parameters:**
- Offset: 1440 minutes (24 hours)
- Period Length: 14 days
- TIR Counts: Various glucose management scenarios

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TIDEPOOL_USERNAME` | Your Tidepool account email | `user@example.com` |
| `TIDEPOOL_PASSWORD` | Your Tidepool account password | `your-password` |
| `TIDEPOOL_BASE_URL` | Tidepool API base URL | `https://int-api.tidepool.org` |
| `TAG_SCENARIO1_ID` | Patient tag ID for scenario 1 testing | `6841e165edfe663ac4d8bff0` |
| `TAG_SCENARIO2_ID` | Patient tag ID for scenario 2 testing | `your-scenario2-tag-id` |
| `CLINIC_ID` | Clinic ID for testing | `633b559d1d64ad2c9471178b` |

## Troubleshooting

### Common Issues

#### 1. "Cannot find module cbg.json" Error

This occurs when the Tidepool CLI build doesn't copy data files. Run:

```bash
npm run install-tidepool
cd node_modules/tidepool-cli
xcopy src\data dist\data /E /I
```

#### 2. Environment Variables Not Loading

Ensure your `.env` file:
- Is in the project root directory
- Has no extra spaces around values
- Uses the exact variable names listed above

#### 3. Test Timeouts

The `create-dashboard-offset.spec.ts` test may take several minutes to complete as it creates patients and uploads data. The test is configured with a 5-minute timeout.

#### 4. Authentication Failures

Verify:
- Your Tidepool credentials are correct
- You have access to the specified clinic
- The base URL is correct for your environment

### Getting Help

If you encounter issues:

1. Check the test output for specific error messages
2. Verify your `.env` file configuration
3. Ensure all dependencies are installed correctly
4. Try reinstalling the Tidepool CLI library

## Development

### Adding New Tests

1. Create a new `.spec.ts` file in the `tests/` directory
2. Import the required Tidepool CLI functions
3. Set up environment variable validation
4. Write test cases following the existing patterns

### Modifying Existing Tests

All tests use environment-only credential management for security. When modifying tests:
- Never add hardcoded credentials
- Always validate required environment variables
- Use appropriate timeouts for long-running operations

### Test Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- Environment variable loading with dotenv
- ES module compatibility
- Browser and worker settings
- Test timeouts and retry logic

## Security Notes

- Never commit the `.env` file to version control
- Keep your Tidepool credentials secure
- Use test-specific clinic and tag IDs when possible
- Regularly update your credentials and test parameters
