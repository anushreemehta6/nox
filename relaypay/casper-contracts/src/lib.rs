#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
extern crate alloc;

use odra::prelude::*;
use odra::casper_types::U512;

#[odra::odra_type]
pub struct Settlement {
    pub payment_id: String,
    pub payer: String,
    pub amount: U512,
    pub timestamp: u64,
}

#[odra::odra_error]
pub enum SettlementRegistryError {
    EmptyPaymentId,
    AlreadyRecorded,
}

#[odra::event]
pub struct SettlementRecorded {
    pub payment_id: String,
    pub payer: String,
    pub amount: U512,
}

#[odra::module(
    events = [SettlementRecorded],
    errors = SettlementRegistryError
)]
pub struct SettlementRegistry {
    settlements: Mapping<String, Settlement>,
}

#[odra::module]
impl SettlementRegistry {
    pub fn init(&mut self) {}

    pub fn record_settlement(
        &mut self,
        payment_id: String,
        payer: String,
        amount: U512,
    ) {
        if payment_id.is_empty() {
            self.env().revert(SettlementRegistryError::EmptyPaymentId);
        }

        if self.settlements.get(&payment_id).is_some() {
            self.env().revert(SettlementRegistryError::AlreadyRecorded);
        }

        let timestamp = self.env().get_block_time();
        let settlement = Settlement {
            payment_id: payment_id.clone(),
            payer: payer.clone(),
            amount,
            timestamp,
        };

        self.settlements.set(&payment_id, settlement);
        self.env().emit_event(SettlementRecorded {
            payment_id,
            payer,
            amount,
        });
    }

    pub fn get_settlement(&self, payment_id: String) -> Option<Settlement> {
        self.settlements.get(&payment_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, NoArgs};

    #[test]
    fn stores_and_retrieves_settlement() {
        let env = odra_test::env();
        let mut contract = SettlementRegistry::deploy(&env, NoArgs);

        contract.record_settlement(
            "pay-demo-001".to_string(),
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".to_string(),
            U512::from(1u64),
        );

        let settlement = contract
            .get_settlement("pay-demo-001".to_string())
            .expect("settlement should exist");

        assert_eq!(settlement.payment_id, "pay-demo-001");
        assert_eq!(
            settlement.payer,
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        );
        assert_eq!(settlement.amount, U512::from(1u64));
        assert!(settlement.timestamp > 0);
    }
}
