import fetch from "node-fetch";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || "";

interface TestResult {
  test: string;
  status: "PASS" | "FAIL";
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testProvidersAPI() {
  console.log("=".repeat(60));
  console.log("Testing Telemedicine Providers API");
  console.log("=".repeat(60));
  console.log("");

  // Test 1: GET /api/telemedicine/providers (all providers)
  console.log("Test 1: Fetching all providers...");
  try {
    const response = await fetch(`${API_BASE}/api/telemedicine/providers`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success && Array.isArray(data.providers)) {
      results.push({
        test: "GET /api/telemedicine/providers",
        status: "PASS",
        message: `Successfully fetched ${data.providers.length} providers`,
        details: {
          providersCount: data.providers.length,
          sampleProvider: data.providers[0]
            ? {
                name: data.providers[0].name,
                specialty: data.providers[0].specialty,
                videoEnabled: data.providers[0].videoEnabled,
              }
            : null,
        },
      });
      console.log(`✓ PASS: Found ${data.providers.length} providers`);
    } else {
      results.push({
        test: "GET /api/telemedicine/providers",
        status: "FAIL",
        message: "Invalid response format or no providers found",
        details: { response: data },
      });
      console.log("✗ FAIL: Invalid response format");
    }
  } catch (error) {
    results.push({
      test: "GET /api/telemedicine/providers",
      status: "FAIL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    console.log(
      `✗ FAIL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  console.log("");

  // Test 2: GET /api/telemedicine/providers?videoEnabled=true
  console.log("Test 2: Fetching video-enabled providers...");
  try {
    const response = await fetch(
      `${API_BASE}/api/telemedicine/providers?videoEnabled=true`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      },
    );

    const data = await response.json();

    if (response.ok && data.success && Array.isArray(data.providers)) {
      const allVideoEnabled = data.providers.every(
        (p: any) => p.videoEnabled === true,
      );

      if (allVideoEnabled) {
        results.push({
          test: "GET /api/telemedicine/providers?videoEnabled=true",
          status: "PASS",
          message: `Successfully fetched ${data.providers.length} video-enabled providers`,
          details: { providersCount: data.providers.length },
        });
        console.log(
          `✓ PASS: Found ${data.providers.length} video-enabled providers`,
        );
      } else {
        results.push({
          test: "GET /api/telemedicine/providers?videoEnabled=true",
          status: "FAIL",
          message: "Some providers are not video-enabled",
        });
        console.log("✗ FAIL: Filtering not working correctly");
      }
    } else {
      results.push({
        test: "GET /api/telemedicine/providers?videoEnabled=true",
        status: "FAIL",
        message: "Invalid response format",
        details: { response: data },
      });
      console.log("✗ FAIL: Invalid response format");
    }
  } catch (error) {
    results.push({
      test: "GET /api/telemedicine/providers?videoEnabled=true",
      status: "FAIL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    console.log(
      `✗ FAIL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  console.log("");

  // Test 3: GET /api/telemedicine/providers?specialty=Cardiology
  console.log("Test 3: Fetching providers by specialty...");
  try {
    const response = await fetch(
      `${API_BASE}/api/telemedicine/providers?specialty=Cardiology`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      },
    );

    const data = await response.json();

    if (response.ok && data.success && Array.isArray(data.providers)) {
      const allCardiology = data.providers.every((p: any) =>
        p.specialty.toLowerCase().includes("cardiology"),
      );

      if (allCardiology || data.providers.length === 0) {
        results.push({
          test: "GET /api/telemedicine/providers?specialty=Cardiology",
          status: "PASS",
          message: `Successfully fetched ${data.providers.length} cardiology providers`,
          details: { providersCount: data.providers.length },
        });
        console.log(
          `✓ PASS: Found ${data.providers.length} cardiology providers`,
        );
      } else {
        results.push({
          test: "GET /api/telemedicine/providers?specialty=Cardiology",
          status: "FAIL",
          message: "Some providers are not cardiologists",
        });
        console.log("✗ FAIL: Specialty filtering not working correctly");
      }
    } else {
      results.push({
        test: "GET /api/telemedicine/providers?specialty=Cardiology",
        status: "FAIL",
        message: "Invalid response format",
        details: { response: data },
      });
      console.log("✗ FAIL: Invalid response format");
    }
  } catch (error) {
    results.push({
      test: "GET /api/telemedicine/providers?specialty=Cardiology",
      status: "FAIL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    console.log(
      `✗ FAIL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  console.log("");

  // Test 4: Validate provider data structure
  console.log("Test 4: Validating provider data structure...");
  try {
    const response = await fetch(`${API_BASE}/api/telemedicine/providers`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success && data.providers.length > 0) {
      const provider = data.providers[0];
      const requiredFields = [
        "id",
        "firstName",
        "lastName",
        "name",
        "specialty",
        "credentials",
        "experience",
        "rating",
        "reviewCount",
        "languages",
        "videoEnabled",
        "availability",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in provider),
      );

      if (missingFields.length === 0) {
        results.push({
          test: "Provider Data Structure",
          status: "PASS",
          message: "All required fields are present",
          details: { sampleProvider: provider },
        });
        console.log("✓ PASS: Provider data structure is valid");
      } else {
        results.push({
          test: "Provider Data Structure",
          status: "FAIL",
          message: `Missing fields: ${missingFields.join(", ")}`,
          details: { provider },
        });
        console.log(`✗ FAIL: Missing fields: ${missingFields.join(", ")}`);
      }
    } else {
      results.push({
        test: "Provider Data Structure",
        status: "FAIL",
        message: "No providers to validate",
      });
      console.log("✗ FAIL: No providers to validate");
    }
  } catch (error) {
    results.push({
      test: "Provider Data Structure",
      status: "FAIL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    console.log(
      `✗ FAIL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("Test Summary");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("");

  if (failed > 0) {
    console.log("Failed Tests:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
  }

  console.log("=".repeat(60));

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testProvidersAPI().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
