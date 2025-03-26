# Nexus Syndicate Marketplace Smart Contract

This directory contains the Move smart contract for the Nexus Syndicate marketplace. The contract implements functionality for buying and selling resources and NFTs on the Aptos blockchain.

## Contract Features

- Resource management (Credits, DataShards, QuantumCores, SyntheticAlloys)
- Resource listings and purchases
- NFT listings and purchases
- Event emission for tracking transactions

## Functions Implemented

The contract implements the following functions that are referenced in the frontend code:

1. `marketplace::list_resource` - List a resource for sale
2. `marketplace::buy_resource` - Buy a resource from the marketplace
3. `marketplace::sell_nft` - List an NFT for sale
4. `marketplace::buy_nft` - Buy an NFT from the marketplace

## Deployment Instructions

### Prerequisites

1. Install the Aptos CLI:
   ```
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. Create an account on the Aptos blockchain:
   ```
   aptos init --profile nexus-syndicate
   ```

### Compile and Deploy

1. Navigate to the `move` directory:
   ```
   cd move
   ```

2. Update the `Move.toml` file with your account address:
   - Replace the `_` in `nexus_syndicate = "_"` with your account address

3. Compile the contract:
   ```
   aptos move compile
   ```

4. Publish the contract:
   ```
   aptos move publish --named-addresses nexus_syndicate=<YOUR_ACCOUNT_ADDRESS>
   ```

5. Initialize the marketplace (only needed once):
   ```
   aptos move run --function-id <YOUR_ACCOUNT_ADDRESS>::marketplace::init_module
   ```

## Integration with Frontend

After deploying the contract, update your application's configuration:

1. Update the `.env` file with your contract address:
   ```
   REACT_APP_APTOS_CONTRACT_ADDRESS=<YOUR_ACCOUNT_ADDRESS>
   ```

2. Set `USE_MOCK_IMPLEMENTATION` to `false` in `src/utils/aptosUtils.ts`

## Testing the Contract

You can test the contract functions using the Aptos CLI:

1. Initialize resources for a user:
   ```
   aptos move run --function-id <YOUR_ACCOUNT_ADDRESS>::marketplace::initialize_resources
   ```

2. List a resource for sale:
   ```
   aptos move run --function-id <YOUR_ACCOUNT_ADDRESS>::marketplace::list_resource --args string:credits u64:10 u64:100
   ```

3. Buy a resource:
   ```
   aptos move run --function-id <YOUR_ACCOUNT_ADDRESS>::marketplace::buy_resource --args u64:<LISTING_ID> u64:50
   ```

## Viewing Transactions on Aptos Explorer

Once your contract is deployed and transactions are being made, you can view them on the Aptos Explorer:

- Testnet Explorer: https://explorer.aptoslabs.com/?network=testnet
- Devnet Explorer: https://explorer.aptoslabs.com/?network=devnet
- Mainnet Explorer: https://explorer.aptoslabs.com/?network=mainnet

Search for your account address or transaction hash to view details.
