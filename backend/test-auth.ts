import { auth } from "./src/auth/server";

async function test() {
  console.log("Creating user session...");
  const result = await auth.api.signInEmail({
    body: {
      email: "example1@gmail.com",
      password: "password1",
    }
  });

  if (!result || !result.user) {
    console.error("Sign in failed:", result);
    return;
  }

  console.log("Sign in successful for:", result.user.email);
  
  // result is a session object, and also has some headers if we use the right return type.
  // Better-auth returns the response object if we call it through the handler.
  // If we use the direct API call, it might not return headers easily?
  
  // Let's try calling it via auth.handler
  const req = new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "example1@gmail.com",
      password: "password1",
    })
  });
  const res = await auth.handler(req);
  const body = await res.json();
  console.log("Sign in result from handler:", body.user.email);
  
  // Now get session with the set-cookie from res
  const cookies = res.headers.get("set-cookie");
  const getSessionHeaders = new Headers();
  if (cookies) getSessionHeaders.append("cookie", cookies);

  const session = await auth.api.getSession({
    headers: getSessionHeaders
  });

  console.log("Retrieved session for:", session?.user?.email || "none");
}

test().catch(console.error);
