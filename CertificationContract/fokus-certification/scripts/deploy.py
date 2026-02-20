import os
from dotenv import load_dotenv
from algosdk.v2client import algod
from algosdk import mnemonic, account
from algosdk.atomic_transaction_composer import AccountTransactionSigner
from beaker.client import ApplicationClient
from smart_contracts.fokus_certification import app


# =========================
# Load Environment
# =========================
load_dotenv()

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""

ALGO_MNEMONIC = os.getenv("ALGO_MNEMONIC")

if not ALGO_MNEMONIC:
    raise Exception("ALGO_MNEMONIC not found in .env file")

if len(ALGO_MNEMONIC.split()) != 25:
    raise Exception("Mnemonic must contain exactly 25 words.")


# =========================
# Connect to Algorand
# =========================
algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

private_key = mnemonic.to_private_key(ALGO_MNEMONIC)
address = account.address_from_private_key(private_key)

print("Deploying from account:", address)

signer = AccountTransactionSigner(private_key)


# =========================
# Deploy Contract
# =========================
app_client = ApplicationClient(
    algod_client,
    app,
    signer=signer
)

app_id, app_addr, tx_id = app_client.create()

print("================================")
print("✅ DEPLOYED SUCCESSFULLY")
print("Application ID:", app_id)
print("Application Address:", app_addr)
print("Transaction ID:", tx_id)
print("================================")

