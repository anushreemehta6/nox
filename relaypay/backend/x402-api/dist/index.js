import express from "express";
import cors from "cors";
import crypto from "crypto";
const app = express();
const port = 3002;
const NOX_RECEIPT_API_URL = "http://localhost:3001/receipt"; // Adjust if receipt-api runs on different port
app.use(cors());
app.use(express.json());
// Middleware to enforce x402 payment
async function x402Middleware(req, res, next) {
    const authHeader = req.headers.authorization;
    // No authorization header -> Return 402 Payment Required
    if (!authHeader || !authHeader.startsWith("x402 ")) {
        const paymentId = "pay-" + crypto.randomUUID();
        return res.status(402).json({
            error: "Payment Required",
            message: "Please submit a payment via NOX Relay to access this resource.",
            paymentId: paymentId,
            challenge: "casper-settlement",
        });
    }
    // Extract the paymentId (the receipt)
    const paymentId = authHeader.split(" ")[1];
    try {
        // Verify the receipt against the NOX Receipt API
        const response = await fetch(`${NOX_RECEIPT_API_URL}/${paymentId}`);
        if (response.status === 404) {
            return res.status(402).json({
                error: "Payment Not Settled",
                message: "The payment has not been settled on Casper yet or does not exist.",
            });
        }
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to verify receipt." });
        }
        const receipt = await response.json();
        if (receipt.status === "settled") {
            // Payment verified! Allow access.
            req.body.receipt = receipt;
            next();
        }
        else {
            return res.status(402).json({
                error: "Payment Required",
                message: "The receipt exists but status is not settled.",
            });
        }
    }
    catch (err) {
        console.error("Error verifying receipt:", err.message);
        return res.status(500).json({ error: "Internal server error verifying payment." });
    }
}
// Protected Route (e.g. AI Agent Endpoint)
app.post("/api/v1/agent/chat", x402Middleware, (req, res) => {
    const userMessage = req.body.message || "Hello";
    const casperTxHash = req.body.receipt?.casperTxHash || "unknown";
    res.json({
        status: "success",
        message: `[AI AGENT]: I have processed your request. Thank you for paying via NOX.`,
        proofOfPayment: casperTxHash,
        data: {
            input: userMessage,
            response: "This is premium AI generated content unlocked by your cross-chain settlement.",
        }
    });
});
app.listen(port, () => {
    console.log(`[x402 Agent API] listening at http://localhost:${port}`);
    console.log(`[x402 Agent API] verifying receipts against ${NOX_RECEIPT_API_URL}`);
});
