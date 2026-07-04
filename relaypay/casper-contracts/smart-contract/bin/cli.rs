//! CLI for deploying the SettlementRegistry contract.

use tips_demo::settlement_registry::SettlementRegistry;
use odra::host::{HostEnv, NoArgs};
use odra_cli::{
    deploy::DeployScript,
    DeployedContractsContainer,
    DeployerExt,
    OdraCli,
};pub struct SettlementRegistryDeployScript;

impl DeployScript for SettlementRegistryDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer,
    ) -> Result<(), odra_cli::deploy::Error> {
        SettlementRegistry::load_or_deploy(
            env,
            NoArgs,
            container,
            350_000_000_000,
        )?;

        Ok(())
    }
}

fn main() {
    OdraCli::new()
        .about("RelayPay Settlement Registry CLI")
        .deploy(SettlementRegistryDeployScript)
        .contract::<SettlementRegistry>()
        .build()
        .run();
}
