import {
  AllowedSmartContractUpdated as AllowedSmartContractUpdatedEvent,
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  BaseURISet as BaseURISetEvent,
  EnforcedOptionSet as EnforcedOptionSetEvent,
  MsgInspectorSet as MsgInspectorSetEvent,
  ONFTReceived as ONFTReceivedEvent,
  ONFTSent as ONFTSentEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PeerSet as PeerSetEvent,
  PreCrimeSet as PreCrimeSetEvent,
  PublicMint as PublicMintEvent,
  PublicPhaseStarted as PublicPhaseStartedEvent,
  TokenEvolved as TokenEvolvedEvent,
  Transfer as TransferEvent,
  WhitelistMint as WhitelistMintEvent,
  WhitelistPhaseStarted as WhitelistPhaseStartedEvent,
  WhitelistUpdated as WhitelistUpdatedEvent,
  OmniNadsMinter
} from "../generated/OmniNadsMinter/OmniNadsMinter"
import {
  AllowedSmartContractUpdated,
  Approval,
  ApprovalForAll,
  BaseURISet,
  EnforcedOptionSet,
  MsgInspectorSet,
  ONFTReceived,
  ONFTSent,
  OwnershipTransferred,
  PeerSet,
  PreCrimeSet,
  PublicMint,
  PublicPhaseStarted,
  TokenEvolved,
  Transfer,
  WhitelistMint,
  WhitelistPhaseStarted,
  WhitelistUpdated,
  Token,
  Global
} from "../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"

export const BASE_URI: string = "https://arweave.net/XI2afr4wHl_M78ovIGYzCPvU0O8126DndmZ-L3VjrMY/monad/";

class DecodedToken {
  realTokenId: BigInt;
  tokenState: BigInt;

  constructor(realTokenId: BigInt, tokenState: BigInt) {
    this.realTokenId = realTokenId;
    this.tokenState = tokenState;
  }
}

function decodeTokenInfo(encoded: BigInt): DecodedToken {
  let tokenState = encoded.mod(BigInt.fromI32(10));
  let realTokenId = encoded.div(BigInt.fromI32(10));
  return new DecodedToken(realTokenId, tokenState);
}

export function getOrCreateToken(event: ethereum.Event, tokenId: BigInt): Token {
  let id = tokenId.toString();
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.tokenId = tokenId;
    token.contract = event.address;
    token.evolution = 0; 
  }
  
  token.blockNumber = event.block.number;
  token.blockTimestamp = event.block.timestamp;
  token.transactionHash = event.transaction.hash;
  
  let contract = OmniNadsMinter.bind(event.address);
  
  let tokenStateCall = contract.try_tokenState(tokenId);
  if (!tokenStateCall.reverted) {
    token.tokenState = tokenStateCall.value.toString();
  }
  
  let tokenURICall = contract.try_tokenURI(tokenId);
  if (!tokenURICall.reverted && tokenURICall.value != "") {
    token.tokenURI = tokenURICall.value;
  } else {
    let safeState: string;
    if (token.tokenState == null) {
      safeState = "1";
    } else {
      safeState = token.tokenState as string;
    }
    token.tokenURI = BASE_URI.concat(safeState).concat("/omninad.json");
  }
  
  return token as Token;
}

function updateGlobalTokenList(tokenId: string): void {
  let global = Global.load("global");
  if (global == null) {
    global = new Global("global");
    global.baseURI = BASE_URI;
    global.tokenIds = new Array<string>();
  }
  if (global.tokenIds.indexOf(tokenId) == -1) {
    global.tokenIds.push(tokenId);
  }
  global.save();
}

export function handleAllowedSmartContractUpdated(
  event: AllowedSmartContractUpdatedEvent
): void {
  let entity = new AllowedSmartContractUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._address = event.params._address
  entity._isAllowedSmartContract = event.params._isAllowedSmartContract

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBaseURISet(event: BaseURISetEvent): void {
  let entity = new BaseURISet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.baseURI = event.params.baseURI;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let global = Global.load("global");
  if (global == null) {
    global = new Global("global");
    global.tokenIds = new Array<string>();
  }
  global.baseURI = event.params.baseURI;
  global.save();

  for (let i = 0; i < global.tokenIds.length; i++) {
    let tokenId = global.tokenIds[i];
    let token = Token.load(tokenId);
    if (token) {
      let safeState: string = token.tokenState ? token.tokenState as string : "1";
      token.tokenURI = event.params.baseURI.concat(safeState).concat("/omninad.json");
      token.save();
    }
  }
}

export function handleEnforcedOptionSet(event: EnforcedOptionSetEvent): void {
  let entity = new EnforcedOptionSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._enforcedOptions = changetype<Bytes[]>(event.params._enforcedOptions)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMsgInspectorSet(event: MsgInspectorSetEvent): void {
  let entity = new MsgInspectorSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.inspector = event.params.inspector

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {

  let token = getOrCreateToken(event, event.params.tokenId);
  token.owner = event.params.to;
  token.save();

  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleONFTReceived(event: ONFTReceivedEvent): void {
  let encoded = event.params.tokenId;
  let decoded = decodeTokenInfo(encoded);
  let realTokenId = decoded.realTokenId;
  let parsedState = decoded.tokenState;

  let token = getOrCreateToken(event, realTokenId);
  token.owner = event.params.toAddress;
  token.tokenState = parsedState.toString();

  token.save();
}

export function handleONFTSent(event: ONFTSentEvent): void {
  let encoded = event.params.tokenId;
  let decoded = decodeTokenInfo(encoded); 
  let realTokenId = decoded.realTokenId;
  let parsedState = decoded.tokenState;
  let token = getOrCreateToken(event, realTokenId);

  token.owner = Bytes.fromHexString("0x0000000000000000000000000000000000000000")!;
  token.tokenState = parsedState.toString();  
  
  token.save();
}


export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePeerSet(event: PeerSetEvent): void {
  let entity = new PeerSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.eid = event.params.eid
  entity.peer = event.params.peer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePreCrimeSet(event: PreCrimeSetEvent): void {
  let entity = new PreCrimeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.preCrimeAddress = event.params.preCrimeAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePublicMint(event: PublicMintEvent): void {
  let token = getOrCreateToken(event, event.params.tokenId);
  token.owner = event.params.minter;
  token.save();

  updateGlobalTokenList(event.params.tokenId.toString());

  let entity = new PublicMint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenId = event.params.tokenId;
  entity.minter = event.params.minter;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handlePublicPhaseStarted(event: PublicPhaseStartedEvent): void {
  let entity = new PublicPhaseStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenEvolved(event: TokenEvolvedEvent): void {
  let token = getOrCreateToken(event, event.params.tokenId)
  token.tokenState = event.params.evolution.toString() 
  token.save()
}


export function handleWhitelistMint(event: WhitelistMintEvent): void {
  let token = getOrCreateToken(event, event.params.tokenId);
  token.owner = event.params.minter;  
  token.save();

  updateGlobalTokenList(event.params.tokenId.toString());

  let entity = new WhitelistMint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenId = event.params.tokenId;
  entity.minter = event.params.minter;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}


export function handleWhitelistPhaseStarted(
  event: WhitelistPhaseStartedEvent
): void {
  let entity = new WhitelistPhaseStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistUpdated(event: WhitelistUpdatedEvent): void {
  let entity = new WhitelistUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._address = event.params._address
  entity._isWhitelisted = event.params._isWhitelisted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
