import { NextResponse } from "next/server";
import {BASE_URL } from "@/utils/axiosUtils/API";
const MESSAGES = { SERVER_ERROR: "Internal server error" }
const axios = require('axios');

var crypto = require("crypto");

const GCM_TAG_LENGTH = 16; // 128 bits
const IV_LENGTH = 12;
const SECRET_KEY = process.env.SECRET_KEY || '';
/**
 * Convert hex string to Buffer (same as Java hexToAESKey)
 */
function hexToAESKey(hexKey) {
    return Buffer.from(hexKey, "hex");
}

/**
 * Base64 URL-safe encode
 */
function base64UrlEncode(buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/**
 * Base64 URL-safe decode
 */
function base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return Buffer.from(str, "base64");
}

function decrypt(encryptedData, secretKey) {
    const combined = base64UrlDecode(encryptedData);
    const key = hexToAESKey(secretKey);

    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(combined.length - GCM_TAG_LENGTH);
    const encrypted = combined.slice(
        IV_LENGTH,
        combined.length - GCM_TAG_LENGTH
    );

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentResponse = searchParams.get("response");
        if (!paymentResponse || !SECRET_KEY) {
            return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
        }
        const resp = decrypt(paymentResponse, SECRET_KEY);
        const jsonObject = JSON.parse(resp);
        let transectionids = '';
        let orderid = '';
        if (paymentResponse) {
            transectionids = jsonObject.requestorTransactionId+"__"+jsonObject.transactionId;
            orderid = Number(
                jsonObject.collectionReferenceNumber ||
                String(jsonObject.reasonForCollection || "").match(/\d+/)?.[0]
            );
            if (!Number.isInteger(orderid)) {
                return NextResponse.json({ error: "Payment response is missing the order reference" }, { status: 400 });
            }
                // Forward BenePay's authenticated opaque response to the API.
                // Rebuilding a reduced callback payload here discards the GCM
                // authentication tag and prevents the API from verifying that
                // the payment status and amount really came from BenePay.
                let data = JSON.stringify({ response: paymentResponse });
                let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: BASE_URL+'/api/payments/benePay/update',
               withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    },
                data : data
                };
            await axios.request(config);
            return NextResponse.json({ transactionId: transectionids, orderid, payerName: jsonObject.payerName, transactionStatus: jsonObject.transactionStatus, transactionAmt: jsonObject.amountPaid }, { status: 200 });
        }
    } catch (e) { console.error("Payment callback failed", e); }
    return NextResponse.json({ error: MESSAGES.SERVER_ERROR }, { status: 500 });
}
