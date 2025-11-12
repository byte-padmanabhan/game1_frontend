import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.jsx";

// ✅ Load the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ✅ If it’s missing, show a clear error
if (!clerkPubKey) {
  console.error(
    "❌ Missing Clerk key! Add VITE_CLERK_PUBLISHABLE_KEY=your_key_here in .env.local"
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
