use odra::casper_types::U512;
use odra::prelude::*;

#[odra::odra_type]
pub enum SettlementStatus {
    Settled,
}

#[odra::odra_type]
pub struct Settlement {
    pub payment_id: String,
    pub payer: String,
    pub amount: U512,
    pub timestamp: u64,
    pub evm_tx_hash: String,
    pub status: SettlementStatus,
}
#[odra::event]
pub struct SettlementRecorded {
    pub payment_id: String,
    pub payer: String,
    pub amount: U512,
}

#[odra::odra_error]
pub enum ContractErrors {
    SettlementAlreadyExists = 1,
    SettlementNotFound = 2,
}

#[odra::module(events = [SettlementRecorded], errors = ContractErrors)]
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
    evm_tx_hash: String,
) {
        if self.settlements.get(&payment_id).is_some() {
            self.env()
                .revert(ContractErrors::SettlementAlreadyExists);
        }

        let settlement = Settlement {
    payment_id: payment_id.clone(),
    payer: payer.clone(),
    amount,
    timestamp: self.env().get_block_time(),
    evm_tx_hash,
    status: SettlementStatus::Settled,
};

        self.settlements
            .set(&payment_id, settlement);

        self.env().emit_event(SettlementRecorded {
            payment_id,
            payer,
            amount,
        });
    }

    pub fn get_settlement(
        &self,
        payment_id: String,
    ) -> Option<Settlement> {
        self.settlements.get(&payment_id)
    }
}


