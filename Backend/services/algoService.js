import algosdk from "algosdk";
import dotenv from "dotenv";

dotenv.config();

const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = "";
const algodToken = "";

const client = new algosdk.Algodv2(
  algodToken,
  algodServer,
  algodPort
);

if (!process.env.ALGO_MNEMONIC) {
  throw new Error("ALGO_MNEMONIC missing in .env");
}

if (!process.env.APP_ID) {
  throw new Error("APP_ID missing in .env");
}

// 🔐 Convert mnemonic to account
const account = algosdk.mnemonicToSecretKey(
  process.env.ALGO_MNEMONIC.trim()
);

// 🔥 VERY IMPORTANT FIX (convert Address object → string)
const senderAddress = algosdk.encodeAddress(
  account.addr.publicKey
);

const APP_ID = Number(process.env.APP_ID);

export const storeCertificateOnChain = async (
  certificateId,
  hash
) => {
  try {

    const mnemonic = process.env.ALGO_MNEMONIC.trim();
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const sender = account.addr.toString();

    const appId = parseInt(process.env.APP_ID);

    console.log("Sender:", sender);
    console.log("App ID:", appId);

    const suggestedParams = await client.getTransactionParams().do();

    console.log("Suggested Params:", suggestedParams);

    return "TEST_ONLY";

  } catch (error) {
    console.error("Debug Error:", error);
    throw error;
  }
};


export const fetchCertificateFromChain =
  async (certificateId) => {

    const appInfo =
      await client.getApplicationByID(APP_ID).do();

    const globalState =
      appInfo.params["global-state"];

    if (!globalState) return null;

    for (let item of globalState) {

      const key = Buffer.from(
        item.key,
        "base64"
      ).toString();

      if (key === certificateId) {

        return Buffer.from(
          item.value.bytes,
          "base64"
        ).toString();
      }
    }
   console.log("Sender:", senderAddress);
console.log("APP_ID:", APP_ID);

    return null;
  };
