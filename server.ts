// const { Hyperliquid } = require('hyperliquid');

// // Create SDK instance with WebSocket disabled for REST-only usage
// const sdk = new Hyperliquid({
//   enableWs: false,  // This is the key - disables WebSocket completely
//   testnet: false,   // Set to true if you want testnet
// });

// async function main() {
//   try {
//     console.log('Getting market data...');

//     // Get all current prices
//     const allMids = await sdk.info.getAllMids();
//     console.log('All mids:', allMids);

//     // Get L2 order book for BTC perpetual
//     const l2Book = await sdk.info.getL2Book('BTC-PERP');
//     console.log('BTC-PERP L2 Book:', l2Book);

//     // Get perpetuals metadata
//     const perpsMeta = await sdk.info.perpetuals.getMeta();
//     console.log('Perps metadata:', perpsMeta);

//     console.log('✅ REST API calls successful!');

//   } catch (error) {
//     console.error('❌ Error:', error);
//   }
// }

// main();