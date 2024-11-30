import { jwtDecode } from "jwt-decode"; // Ensure to install: npm install jwt-decode

// Helper to determine if token needs refresh
export const checkIfTokenNeedsRefresh = (token: string) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token); // Decode the JWT token
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeLeft = decoded?.exp! - currentTime; // Remaining time until expiration

    // Return true if less than 5 minutes (300 seconds) are left

    return timeLeft <= 300;
  } catch (error) {
    console.error("Error decoding token", error);
    return false;
  }
};
