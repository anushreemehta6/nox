// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PaymentRegistry
 * @notice Records EVM-side payment intents for cross-chain settlement relay.
 */
contract PaymentRegistry {
    event PaymentCreated(
        string paymentId,
        address payer,
        uint256 amount
    );

    /**
     * @notice Accept a payment and emit a verifiable PaymentCreated event.
     * @param paymentId Unique identifier for the payment (generated off-chain).
     */
    function pay(string calldata paymentId) external payable {
        require(bytes(paymentId).length > 0, "PaymentRegistry: empty paymentId");
        require(msg.value > 0, "PaymentRegistry: zero amount");

        emit PaymentCreated(paymentId, msg.sender, msg.value);
    }
}
