// utils/loadRazorpay.js
export const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.getElementById("razorpay-sdk")) return resolve();

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
