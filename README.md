# OmniNadsMinter Subgraph (Monad)

This subgraph indexes the **OmniNadsMinter** contract deployed on **Monad**, capturing ERC721 events and bridging events (if used), along with updating dynamic token URIs when the base URI changes.

## Table of Contents

1. [Overview](#overview)  
2. [Key Features](#key-features)  
3. [Requirements](#requirements)  
4. [Installation & Setup](#installation--setup)  
5. [Building & Deploying](#building--deploying)  
7. [Usage & Queries](#usage--queries)

---

## Overview

- **Chain**: Monad testnet or mainnet (depending on your `network` config in `subgraph.yaml`).  
- **Contract**: **OmniNadsMinter** at a specific address.  
- **Purpose**:  
  - Index NFT mints, transfers, bridging events (`ONFTReceived` / `ONFTSent`), base URI changes, token evolution, etc.  
  - Store an off‐chain view in The Graph, so you can easily query token ownership, URIs, and states.

---

## Key Features

1. **Dynamic Token URIs**: Whenever `BaseURISet` fires, previously minted tokens re-derive their `tokenURI` from the new base URI.  
2. **Zero-Owner**: If a token’s `owner` becomes `0x0000...000`, it may remain in the subgraph or be removed based on your logic (currently, this subgraph sets `owner` to zero but does not remove the token).  
3. **Bridging**:  
   - Decodes a combined `tokenId` and `tokenState` from bridging events.  
   - Updates the token’s state or sets the owner to zero if bridged out.  
4. **Global Entity**: A “Global” record stores `baseURI` and a list of minted `tokenIds` so we can re-derive URIs on base URI changes.

---

## Requirements

1. **Node.js** (v14 or newer)  
2. **Yarn** or **npm**  
3. **@graphprotocol/graph-cli**  
4. **A functioning RPC endpoint** for Monad  
5. **OmniNadsMinter ABI** (included in `abis/OmniNadsMinter.json`)

---

## Installation & Setup

1. **Clone** the repository:
   ```bash
   git clone https://github.com/<your-org>/<repo-name>.git
   cd <repo-name>
   ```
2. **Install dependencies**:
   ```bash
   yarn install
   ```
   or
   ```bash
   npm install
   ```
3. **Review** the [`subgraph.yaml`](./subgraph.yaml) to confirm:
   - `network: monad` (or `monad-testnet`)  
   - `source.address`: matches your OmniNadsMinter contract  
   - `startBlock`: the block from which you want to index  

---

## Building & Deploying

1. **Generate types**:
   ```bash
   yarn codegen
   ```
2. **Build**:
   ```bash
   yarn build
   ```
   This compiles your mapping (`src/omni-nads-minter.ts`) to WebAssembly.

3. **Deploy**:  
   - **Hosted Service**:
     ```bash
     graph auth --product hosted-service <ACCESS_TOKEN>
     graph deploy --product hosted-service <ORG_OR_USER>/<SUBGRAPH_NAME>
     ```  
   - **Graph Studio** (Decentralized Network):
     ```bash
     graph deploy --studio <SUBGRAPH_SLUG>
     ```  
   - **Local Graph Node**:
     ```bash
     graph create <LOCAL_NAME>
     graph deploy <LOCAL_NAME>
     ```

---

## Usage & Queries

Once deployed, you can run GraphQL queries against the subgraph’s endpoint. Example:

```graphql
{
  tokens(first: 10) {
    tokenId
    owner
    tokenURI
    tokenState
    blockNumber
  }
}
```

You can also query event entities like:

```graphql
{
  transfers(first: 5, orderBy: blockNumber, orderDirection: desc) {
    id
    from
    to
    tokenId
    blockNumber
    transactionHash
  }
}
```

---

## Here’s an improved version of your comment with better clarity, grammar, and readability:

---

## Challenges Faced During the Hackathon  
### Issues on Monad Testnet with The Graph  

Throughout the hackathon, we encountered several challenges, particularly when deploying our subgraph on the Monad Testnet using The Graph. We performed multiple deployments to index data, which was then integrated across our UI components.  

In the final 48 hours leading up to the submission, we faced significant issues due to RPC outages. As a result, the subgraph lagged behind by approximately **935K blocks** at the time of this commit. This delay severely impacted our ability to demonstrate key features, including:  
- **Bridging NFTs across chains**  
- **Fetching and displaying data within the application**  
- **Showing rankings and NFT evolution steps in our leaderboard**  

These issues restricted our ability to showcase the full functionality of our project, highlighting the importance of reliable infrastructure in blockchain applications.  