const test = async (url) => {
  console.log("Testing:", url);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { mode: 'no-cors', method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    console.log(url, "success - status:", response.status);
  } catch (e) {
    console.log(url, "failed -", e.name, e.message);
  }
}

console.log("Script started");

test("https://google.com").then(() => {
  return test("https://thisdomaindoesnotexist12345.com");
}).then(() => {
  console.log("Script finished");
}).catch((err) => {
  console.error("Error:", err);
});
