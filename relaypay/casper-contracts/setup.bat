@echo off

REM One-time setup for Casper/Odra contracts on Windows



echo [1/4] Nightly Rust (Odra 2.8 requires nightly)...

rustup toolchain install nightly-2026-01-01



echo [2/4] WASM target...

rustup target add wasm32-unknown-unknown --toolchain nightly-2026-01-01



echo [3/4] cargo-odra (may take a few minutes)...

cargo install cargo-odra --locked



echo [4/4] Build WASM...

cargo odra build

if errorlevel 1 (

  echo Build failed. If wasm-opt missing, copy manually:

  echo   copy target\wasm32-unknown-unknown\release\settlement_registry_build_contract.wasm wasm\settlement_registry.wasm

)



echo Done. Deploy with: cd ..\backend\relay ^&^& npm run deploy:casper

