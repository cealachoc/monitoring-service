const axios = require("axios");
const fs = require("fs");
const { performance } = require("perf_hooks");
const cron = require("node-cron");

const testData = [
  { endpoint: "/wordcount", input: "hello world", expected: 2 },
  { endpoint: "/charcount", input: "hello world", expected: 10 },
  { endpoint: "/vowelcount", input: "hello world", expected: 3 },
  { endpoint: "/consonantcount", input: "hello world", expected: 7 },
  { endpoint: "/commacount", input: "hello world", expected: 1 },
  { endpoint: "/andcount", input: "and and and", expected: 3 },
];

const proxyURL = "https://reverse-proxy-760312763044.europe-west2.run.app";

function validateResponse(endpoint, input, expected, response) {
  try {
    const responseData = response.data;

    if (responseData.answer === expected) {
      return `Test passed for ${endpoint} with the input ${input}`;
    } else {
      return `Test failed for ${endpoint} with the input ${input}. Expected ${expected}. Returned: ${responseData.answer}`;
    }
  } catch (error) {
    return `Error validating a response from ${endpoint} with the input ${input}: ${error.message}`;
  }
}

async function test(endpoint, input, expected) {
  const url = `${proxyURL}${endpoint}?text=${encodeURIComponent(input)}`;
  const startTime = performance.now();

  try {
    const response = await axios.get(url);
    const endTime = performance.now();
    const duration = endTime - startTime;

    const result = validateResponse(endpoint, input, expected, response);
    console.log(result);

    console.log(`Performance for ${endpoint}: ${duration.toFixed(2)} ms`);

    fs.appendFileSync(
      "performance.log",
      `${new Date().toISOString()} - ${resultMessage} - Time: ${duration.toFixed(
        2
      )} ms\n`
    );
  } catch (error) {
    console.log(`Error performing test for ${endpoint}: ${error.message}`);
  }
}

function runTests() {
  console.log("Running tests...");
  testData.forEach((test) => {
    performTest(test.endpoint, test.input, test.expected);
  });
}

cron.schedule("*/30 * * * *", runTests);

runTests();
