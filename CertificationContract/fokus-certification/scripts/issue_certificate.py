import os
from dotenv import load_dotenv
from algosdk.v2client import algod
from algosdk import mnemonic, account
from algosdk.atomic_transaction_composer import AccountTransactionSigner
from beaker.client import ApplicationClient
from smart_contracts.fokus_certification import app

# Load environment variables
load_dotenv()

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""

APP_ID_ENV = os.getenv("APP_ID")
ALGO_MNEMONIC = os.getenv("ALGO_MNEMONIC")

if APP_ID_ENV is None:
    raise Exception("APP_ID not found in .env file")

if ALGO_MNEMONIC is None:
    raise Exception("ALGO_MNEMONIC not found in .env file")

APP_ID = int(APP_ID_ENV)

if len(ALGO_MNEMONIC.split()) != 25:
    raise Exception("Mnemonic must contain exactly 25 words")

algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

private_key = mnemonic.to_private_key(ALGO_MNEMONIC)
address = account.address_from_private_key(private_key)

print("Using Account:", address)

signer = AccountTransactionSigner(private_key)

app_client = ApplicationClient(
    algod_client,
    app,
    signer=signer,
    app_id=APP_ID
)

try:
    result = app_client.call(
        app.issue_certificate,
        wallet="TEST_WALLET_001",
        course="AI Fundamentals",
        score=85
    )

    print("✅ Certificate Issued Successfully!")
    print(result)

except Exception as e:
    print("❌ Blockchain Error:")
    print(e)
