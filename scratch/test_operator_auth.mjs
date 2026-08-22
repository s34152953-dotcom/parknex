import fetch from "node-fetch";

async function testOperatorLogin() {
  console.log("Testing operator login with credentials...");
  
  // 1. Get CSRF token
  const csrfRes = await fetch("https://parknex.vercel.app/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const cookies = csrfRes.headers.get("set-cookie");
  console.log("CSRF Token:", csrfData.csrfToken);

  // 2. Call NextAuth credentials callback
  const loginRes = await fetch("https://parknex.vercel.app/api/auth/callback/operator-credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookies || "",
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: "parknexadmin.com",
      password: "wrongpassword",
      json: "true",
    }),
    redirect: "manual",
  });

  console.log("Login Response Status:", loginRes.status);
  const location = loginRes.headers.get("location");
  console.log("Redirect Location:", location);
  
  if (location && !location.includes("error")) {
    console.log("✅ Operator Login SUCCESS!");
  } else {
    const text = await loginRes.text();
    console.log("Login body:", text);
  }
}

testOperatorLogin().catch(console.error);
