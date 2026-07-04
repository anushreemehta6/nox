//! Deploy SettlementRegistry to Casper testnet via odra-cli.

use odra::host::{HostEnv, NoArgs};
use odra_cli::{
    deploy::DeployScript, ContractProvider, DeployedContractsContainer, DeployerExt, OdraCli,
};
use settlement_registry::SettlementRegistry;

const PACKAGE_KEY_NAME: &str = "relaypay_settlement_registry";

pub struct SettlementRegistryDeployScript;

impl DeployScript for SettlementRegistryDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer,
    ) -> Result<(), odra_cli::deploy::Error> {
        SettlementRegistry::load_or_deploy(env, NoArgs, container, 350_000_000_000)?;
        Ok(())
    }
}

pub fn main() {
    OdraCli::new()
        .about("Deploy RelayPay SettlementRegistry to Casper")
        .deploy(SettlementRegistryDeployScript)
        .contract::<SettlementRegistry>()
        .build()
        .run();
}
