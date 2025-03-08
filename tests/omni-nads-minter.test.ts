import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AllowedSmartContractUpdated } from "../generated/schema"
import { AllowedSmartContractUpdated as AllowedSmartContractUpdatedEvent } from "../generated/OmniNadsMinter/OmniNadsMinter"
import { handleAllowedSmartContractUpdated } from "../src/omni-nads-minter"
import { createAllowedSmartContractUpdatedEvent } from "./omni-nads-minter-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _address = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _isAllowedSmartContract = "boolean Not implemented"
    let newAllowedSmartContractUpdatedEvent =
      createAllowedSmartContractUpdatedEvent(_address, _isAllowedSmartContract)
    handleAllowedSmartContractUpdated(newAllowedSmartContractUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AllowedSmartContractUpdated created and stored", () => {
    assert.entityCount("AllowedSmartContractUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AllowedSmartContractUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_address",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AllowedSmartContractUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_isAllowedSmartContract",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
