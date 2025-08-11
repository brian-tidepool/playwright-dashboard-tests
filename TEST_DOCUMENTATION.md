# Tidepool Dashboard Tests - Comprehensive Documentation

## Overview

This test suite provides comprehensive verification of Tidepool dashboard functionality using Playwright and the Tidepool CLI library. The tests cover clinic management, patient tagging, dashboard creation, and dashboard verification with expected patient counts.

## Test Environment

- **Framework**: Playwright with TypeScript
- **Target Environment**: Tidepool QA2 (https://qa2.development.tidepool.org)
- **Authentication**: Keycloak integration via environment variables
- **Browser**: Chromium (configurable in playwright.config.ts)

## Test File Breakdown

### 1. dashboard.spec.ts
**Purpose**: Basic clinic data fetching and authentication validation

**Functionality**:
- Tests `fetchClinicsByCredentials` function
- Validates user authentication flow
- Verifies clinic data structure and required fields
- Ensures proper error handling for missing credentials

**Key Test Cases**:
- Authentication with Tidepool API
- Clinic data retrieval and validation
- Clinic structure verification (id, name properties)
- Error handling for missing environment variables

**Dependencies**:
- `TIDEPOOL_USERNAME`, `TIDEPOOL_PASSWORD`, `TIDEPOOL_BASE_URL`

**Expected Output**:
- Console logs showing authentication success
- List of available clinics with structure validation
- Proper error messages for authentication failures

---

### 2. clinics-with-tags.spec.ts
**Purpose**: Extended clinic functionality testing with patient tag support

**Functionality**:
- Tests `fetchClinicsWithTags` function
- Validates patient tag data structure
- Provides graceful handling for unimplemented tag features
- Compares regular clinic data with tag-enhanced data

**Key Test Cases**:
- Clinic data retrieval with tag information
- Patient tags property validation
- Structure comparison between regular and tag-enhanced clinics
- Backward compatibility verification

**Dependencies**:
- `TIDEPOOL_USERNAME`, `TIDEPOOL_PASSWORD`, `TIDEPOOL_BASE_URL`

**Expected Output**:
- Clinic data with potential patient tag properties
- Validation of tag structure if available
- Console logging for debugging tag implementation status

---

### 3. create-dashboard-offset.spec.ts
**Purpose**: Dashboard creation with time offset and TIR (Time in Range) data

**Functionality**:
- Tests `createDashboardOffset` function
- Creates test patients with specific TIR scenarios
- Uploads dashboard data with configurable time offsets
- Validates data creation process

**Key Parameters**:
```typescript
const tirCounts = {
  "Time below 3.0 mmol/L > 1%": 1,
  "Time below 3.9 mmol/L > 4%": 1,
  "Drop in Time in Range > 15%": 1,
  "Time in Range < 70%": 1,
  "CGM Wear Time <70%": 1,
  "Meeting Targets": 1
};
const offset = 1440; // 24 hours in minutes
const periodLength = 14; // days
```

**Dependencies**:
- `TIDEPOOL_USERNAME`, `TIDEPOOL_PASSWORD`, `TIDEPOOL_BASE_URL`
- `TAG_ID`, `CLINIC_ID`

**Timeout**: 5 minutes (3,000,000ms) due to patient creation and data upload

**Expected Output**:
- Successful patient creation with TIR data
- Dashboard data upload completion
- No thrown errors (success indicated by test completion)

---

### 4. dashboard-offset-nocreate.spec.ts
**Purpose**: Dashboard verification without creating new test data

**Functionality**:
- Verifies existing dashboard counts match expected values
- Uses robust table detection with multiple fallback approaches
- Implements comprehensive error handling for missing data
- Validates patient counts across multiple dashboard categories

**Key Features**:
```typescript
const expectedCounts = {
  "Time below 3.0 mmol/L > 1%": 50,
  "Time below 3.9 mmol/L > 4%": 40,
  "Drop in Time in Range > 15%": 40,
  "Time in Range < 70%": 40,
  "CGM Wear Time <70%": 40,
  "Meeting Targets": 40
};
```

**Table Detection Logic**:
- Primary: `xpath=following::table[contains(@aria-label, "peopletablelabel")]`
- Fallback 1: Section container search for patient tables
- Fallback 2: Broader table area search with debug logging

**Error Handling**:
- Fails if no patients found but expected count > 0
- Provides descriptive error messages for debugging
- Logs table detection results for troubleshooting

**Dependencies**:
- `TIDEPOOL_USERNAME`, `TIDEPOOL_PASSWORD`, `TIDEPOOL_BASE_URL`
- `TAG_ID`, `CLINIC_ID`

**Timeout**: 10 minutes (6,000,000ms) for comprehensive dashboard loading

---

### 5. dashboard-offset-recreatepatients.spec.ts
**Purpose**: Dashboard verification with patient recreation capability

**Functionality**:
- Combines dashboard verification with patient management
- Includes patient cleanup functionality using `deletePatients`
- Uses same robust table detection as nocreate version
- Provides complete dashboard lifecycle testing

**Key Features**:
- Patient deletion via `deletePatients` function
- Dashboard creation via `createDashboardOffset`
- Same expected count verification as nocreate version
- Enhanced table detection with multiple fallback approaches

**Patient Management**:
```typescript
async function cleanupDashboardPatients() {
  const creds: Credentials = {
    userName: credentials.userName,
    password: credentials.password,
    baseUrl: credentials.baseUrl,
  };
  await deletePatients(creds, clinicId, tagId);
}
```

**Dependencies**:
- `TIDEPOOL_USERNAME`, `TIDEPOOL_PASSWORD`, `TIDEPOOL_BASE_URL`
- `TAG_ID`, `CLINIC_ID`
- `tidepool-cli/lib/deletePatients` function
- `tidepool-cli/lib/dashboardScenarioSelector` function

**Timeout**: 10 minutes (6,000,000ms) for patient operations and dashboard verification

## Environment Configuration

### Required Environment Variables

```env
# Authentication
TIDEPOOL_USERNAME=your-username@example.com
TIDEPOOL_PASSWORD=your-password
TIDEPOOL_BASE_URL=https://qa2.development.tidepool.org

# Test Configuration
TAG_ID=your-tag-id
CLINIC_ID=your-clinic-id
```

### Environment Setup

1. Create `.env` file in project root
2. Add all required variables with appropriate values
3. Ensure no extra whitespace around values
4. Never commit `.env` file to version control

## Dashboard Categories and Expected Counts

The dashboard verification tests check six main categories:

| Category | Expected Count (nocreate) | Expected Count (recreate) |
|----------|---------------------------|---------------------------|
| Time below 3.0 mmol/L > 1% | 50 patients | 50 patients |
| Time below 3.9 mmol/L > 4% | 40 patients | 40 patients |
| Drop in Time in Range > 15% | 40 patients | 40 patients |
| Time in Range < 70% | 40 patients | 40 patients |
| CGM Wear Time <70% | 40 patients | 40 patients |
| Meeting Targets | 40 patients | 40 patients |

## Technical Implementation Details

### Table Detection Strategy

The dashboard tests use a three-tier approach for finding patient tables:

1. **Primary Detection**: Direct XPath for tables with "peopletablelabel" aria-label
2. **Fallback Detection**: Section container search for nested tables
3. **Broad Search**: General table area search with enhanced debugging

### Error Handling

- **Authentication Errors**: Clear messages for missing credentials
- **Table Detection Failures**: Multiple fallback approaches with debug logging
- **Count Mismatches**: Descriptive errors showing expected vs actual counts
- **Missing Data**: Specific failure conditions when no patients found but counts expected

### Browser Automation

- **Navigation**: Automated login flow through Keycloak
- **Dashboard Access**: Direct navigation to TIDE Dashboard with clinic/tag parameters
- **Element Interaction**: Robust element detection with wait strategies
- **Data Extraction**: Table parsing with patient count verification

## Running Tests

### Individual Test Execution

```bash
# Basic clinic functionality
npm test -- tests/dashboard.spec.ts

# Clinic data with tags
npm test -- tests/clinics-with-tags.spec.ts

# Dashboard creation
npm test -- tests/create-dashboard-offset.spec.ts

# Dashboard verification (no creation)
npm test -- tests/dashboard-offset-nocreate.spec.ts

# Dashboard verification (with recreation)
npm test -- tests/dashboard-offset-recreatepatients.spec.ts
```

### Test Suite Execution

```bash
# Run all tests
npm test

# Run with debugging
npm run test:debug

# Run with browser visible
npm run test:headed
```

### Test Reports

Playwright generates HTML reports with:
- Test execution details
- Screenshot captures
- Error traces and stack traces
- Performance metrics

Access reports via: `npx playwright show-report`

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Table Detection Failures (hasTable = false)

**Symptoms**: Tests report "hasTable is false" when patients should be visible

**Solution**: The enhanced table detection with multiple fallback approaches should resolve this

**Debug Steps**:
1. Check console logs for table detection attempts
2. Verify dashboard loads completely before table detection
3. Ensure correct TAG_ID and CLINIC_ID in environment

#### 2. Authentication Failures

**Symptoms**: Tests fail during login process

**Solutions**:
- Verify username/password in `.env` file
- Check base URL matches target environment
- Ensure no extra spaces in environment variables
- Confirm account has clinic access

#### 3. Count Mismatches

**Symptoms**: Expected counts don't match actual dashboard counts

**Solutions**:
- Verify test data setup is complete
- Check if previous test runs affected data
- Use recreate version to reset patient data
- Confirm TAG_ID corresponds to test data

#### 4. Timeout Issues

**Symptoms**: Tests timeout during execution

**Solutions**:
- Increase test timeout in beforeAll setup
- Check network connectivity to QA2 environment
- Verify dashboard loading performance
- Consider running tests during off-peak hours

### Debug Logging

All tests include comprehensive console logging:

- Authentication status
- Navigation progress
- Table detection results
- Patient count comparisons
- Error details with context

Review test output and Playwright reports for detailed debugging information.

## Test Maintenance

### Updating Expected Counts

To modify expected patient counts:

1. Update `expectedCounts` object in relevant test files
2. Ensure counts match actual test data in environment
3. Run tests to verify new expectations
4. Update documentation if categories change

### Adding New Dashboard Categories

To add new dashboard verification:

1. Add new category to `expectedCounts` object
2. Update table detection logic if needed
3. Add appropriate error handling
4. Update documentation with new category details

### Environment Updates

When changing test environments:

1. Update `TIDEPOOL_BASE_URL` in `.env`
2. Verify TAG_ID and CLINIC_ID for new environment
3. Update expected counts if data differs
4. Run full test suite to verify compatibility

## Best Practices

### Test Development

- Always validate environment variables before test execution
- Use descriptive error messages for debugging
- Implement proper timeouts for long-running operations
- Include comprehensive logging for troubleshooting

### Data Management

- Use consistent test data across environments
- Document expected data states
- Implement cleanup procedures for test isolation
- Verify data integrity before and after tests

### Security

- Never commit credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate test account credentials
- Limit test account permissions to necessary scope

### Performance

- Optimize wait strategies for element detection
- Use parallel execution where appropriate
- Monitor test execution times
- Implement efficient table detection strategies

## Future Enhancements

### Planned Improvements

- Enhanced dashboard category verification
- Additional TIR scenario testing
- Performance monitoring integration
- Cross-environment compatibility testing

### Extensibility

The test framework supports:
- Additional dashboard categories
- New TIR scenarios
- Multiple environment configurations
- Extended patient management operations

This documentation provides a complete reference for understanding, running, and maintaining the Tidepool dashboard test suite.
