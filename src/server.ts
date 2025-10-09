import express from 'express';
import { Hyperliquid } from 'hyperliquid';
import * as dotenv from 'dotenv';
import { DiscordWebhookService } from './discordWebhook';

dotenv.config();

console.log('🚀 Starting Hyperliquid Bot...');
console.log('🔑 Private key configured:', !!process.env.HYPERLIQUID_PRIVATE_KEY);
console.log('🔍 Environment variables currently set:',
  Object.keys(process.env).filter(k => k.includes('HYPER')));

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('🔍 RAW WEBHOOK REQUEST RECEIVED');
    console.log('Content-Type:', req.headers['content-type']);
  }
  next();
});

app.use((req, res, next) => {
  if (req.method === 'POST' || req.path !== '/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

const discordWebhook = process.env.DISCORD_WEBHOOK_URL
  ? new DiscordWebhookService(process.env.DISCORD_WEBHOOK_URL)
  : null;

// ============================================================================
// TYPES
// ============================================================================

interface WebhookPayload {
  exchange: string;
  strategy: string;
  market: string;
  sizeByLeverage: number;
  reverse: boolean;
  order: 'buy' | 'sell';
  position: 'flat' | 'long' | 'short';
  prevPosition: 'flat' | 'long' | 'short';
  price: string;
}

interface Position {
  coin: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  unrealizedPnl: number;
  leverage: number;
}

// ============================================================================
// HYPERLIQUID CLIENT
// ============================================================================

let hyperliquidSDK: Hyperliquid | null = null;
let walletAddress: string = '';

async function getHyperliquidClient(): Promise<Hyperliquid> {
  if (hyperliquidSDK) {
    return hyperliquidSDK;
  }

  const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('HYPERLIQUID_PRIVATE_KEY not configured');
  }

  hyperliquidSDK = new Hyperliquid({
    privateKey: privateKey,
    enableWs: false,
    testnet: false,
  });

  await hyperliquidSDK.connect();

  // Derive wallet address from private key using ethers
  const { Wallet } = await import('ethers');
  const wallet = new Wallet(privateKey);
  walletAddress = wallet.address;

  console.log(`Hyperliquid client initialized`);
  console.log(`Wallet: ${walletAddress}`);

  return hyperliquidSDK;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert TradingView market symbol to Hyperliquid coin
 * Example: BTC_USD -> BTC-PERP
 */
function convertMarketToCoin(market: string): string {
  const coin = market.split('_')[0].toUpperCase();
  return `${coin}-PERP`;
}

/**
 * Get current position for a specific coin
 */
async function getCurrentPosition(coin: string): Promise<Position | null> {
  const sdk = await getHyperliquidClient();

  if (!walletAddress) {
    const { Wallet } = await import('ethers');
    const wallet = new Wallet(process.env.HYPERLIQUID_PRIVATE_KEY!);
    walletAddress = wallet.address;
  }

  const userState = await sdk.info.perpetuals.getClearinghouseState(walletAddress);

  // Strip -PERP suffix for comparison since API returns just "ETH", "BTC", etc.
  const coinBase = coin.replace('-PERP', '');

  const assetPosition = userState.assetPositions.find(
    (assetPos: any) => assetPos.position.coin === coinBase
  );

  if (!assetPosition) {
    return null;
  }

  const pos = assetPosition.position;
  const size = parseFloat(pos.szi);

  if (size === 0) {
    return null;
  }

  return {
    coin: pos.coin,
    side: size > 0 ? 'LONG' : 'SHORT',
    size: Math.abs(size),
    entryPrice: parseFloat(pos.entryPx),
    unrealizedPnl: parseFloat(pos.unrealizedPnl),
    leverage: pos.leverage.value,
  };
}

/**
 * Get available balance for trading
 */
async function getAvailableBalance(): Promise<number> {
  const sdk = await getHyperliquidClient();

  if (!walletAddress) {
    const { Wallet } = await import('ethers');
    const wallet = new Wallet(process.env.HYPERLIQUID_PRIVATE_KEY!);
    walletAddress = wallet.address;
  }

  const userState = await sdk.info.perpetuals.getClearinghouseState(walletAddress);

  const accountValue = parseFloat(userState.marginSummary.accountValue);
  const marginUsed = parseFloat(userState.marginSummary.totalMarginUsed);
  const availableMargin = accountValue - marginUsed;

  return availableMargin;
}

/**
 * Get current market price for a coin
 */
async function getMarketPrice(coin: string): Promise<number> {
  const sdk = await getHyperliquidClient();
  const allMids = await sdk.info.getAllMids();
  return parseFloat(allMids[coin]);
}

/**
 * Calculate position size based on available balance and leverage
 */
function calculatePositionSize(
  availableBalance: number,
  leverage: number,
  marketPrice: number
): number {
  const positionValue = availableBalance * leverage;
  const size = positionValue / marketPrice;

  // Round to 4 decimal places
  return Math.round(size * 10000) / 10000;
}

/**
 * Close existing position
 */
async function closePosition(coin: string, currentPosition: Position): Promise<void> {
  const sdk = await getHyperliquidClient();
  const maxAttempts = 3;
  let attempt = 0;

  console.log(`Closing ${currentPosition.side} position: ${currentPosition.size} ${coin}`);

  // To close: if LONG, sell; if SHORT, buy
  const isBuy = currentPosition.side === 'SHORT';

  while (attempt < maxAttempts) {
    attempt++;

    try {
      const marketPrice = await getMarketPrice(coin);
      console.log(`Market Price: $${marketPrice.toFixed(6)} (Attempt ${attempt}/${maxAttempts})`);

      const orderRequest = {
        coin: coin,
        is_buy: isBuy,
        sz: currentPosition.size,
        limit_px: marketPrice,
        order_type: { limit: { tif: 'Ioc' as const } },
        reduce_only: true,
      };

      console.log('Submitting close order:', JSON.stringify(orderRequest, null, 2));

      const result = await sdk.exchange.placeOrder(orderRequest);
      console.log(`Close order result (full):`, JSON.stringify(result, null, 2));

      // Check if order filled
      if (result.response?.data?.statuses) {
        const statuses = result.response.data.statuses;
        console.log('Order statuses:', JSON.stringify(statuses, null, 2));

        // Check for successful fill
        const allFilled = statuses.every((s: any) =>
          s.filled || s.status === 'filled' || (s.filled && s.filled !== '0')
        );

        if (allFilled) {
          console.log('✅ Close order filled successfully');
          return; // success - exit function
        }

        console.error(`❌ Close order was not fully filled on attempt ${attempt}`);
        console.error('Statuses:', statuses);

        if (attempt < maxAttempts) {
          console.log(`Retrying close order (${attempt + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secs between retries
        }
      } else {
        console.warn(`⚠️ Couldn't verify order fill status - no statuses in response`);
        if (attempt < maxAttempts) {
          console.log(`Retrying close order (${attempt + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error(`❌ Error on close attempt ${attempt}:`, error);
      if (attempt < maxAttempts) {
        console.log(`Retrying close order (${attempt + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error; // re-throw on final attempt
      }
    }
  }

  throw new Error(`Close order failed after ${maxAttempts} attempts`);
}

/**
 * Open new position
 */
async function openPosition(
  coin: string,
  isBuy: boolean,
  size: number,
  leverage: number
): Promise<any> {
  const sdk = await getHyperliquidClient();
  const maxAttempts = 3;
  let attempt = 0;

  const side = isBuy ? 'LONG' : 'SHORT';
  console.log(`Opening ${side} position: ${size} ${coin} at ${leverage}x leverage`);

  await sdk.exchange.updateLeverage(coin, 'cross', leverage);
  console.log(`Leverage set to ${leverage}x`);

  while (attempt < maxAttempts) {
    attempt++;

    try {
      const marketPrice = await getMarketPrice(coin);
      console.log(`Market Price: $${marketPrice.toFixed(6)} (Attempt ${attempt}/${maxAttempts})`);

      // Round the limit price to appropriate precision
      const limitPrice = parseFloat(marketPrice.toFixed(2));

      const orderRequest = {
        coin: coin,
        is_buy: isBuy,
        sz: size,
        limit_px: limitPrice, // Use rounded price
        order_type: { limit: { tif: 'Ioc' as const } },
        reduce_only: false,
      };

      console.log('Submitting open order:', JSON.stringify(orderRequest, null, 2));

      const result = await sdk.exchange.placeOrder(orderRequest);
      console.log(`Open order result (full):`, JSON.stringify(result, null, 2));

      // Check if order filled
      if (result.response?.data?.statuses) {
        const statuses = result.response.data.statuses;
        console.log('Order statuses:', JSON.stringify(statuses, null, 2));

        // Check for successful fill
        const allFilled = statuses.every((s: any) =>
          s.filled || s.status === 'filled' || (s.filled && s.filled !== '0')
        );

        if (allFilled) {
          console.log('✅ Open order filled successfully');
          return result; // success - exit function
        }

        console.error(`❌ Open order was not fully filled on attempt ${attempt}`);
        console.error('Statuses:', statuses);

        if (attempt < maxAttempts) {
          console.log(`Retrying open order (${attempt + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secs between retries
        }
      } else {
        console.warn(`⚠️ Couldn't verify order fill status - no statuses in response`);
        if (attempt < maxAttempts) {
          console.log(`Retrying open order (${attempt + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error(`❌ Error on open attempt ${attempt}:`, error);
      if (attempt < maxAttempts) {
        console.log(`Retrying open order (${attempt + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error; // re-throw on final attempt
      }
    }
  }

  // If we get here, all attempts failed
  throw new Error(`Open order failed after ${maxAttempts} attempts`);
}

// ============================================================================
// TRADE EXECUTION LOGIC
// ============================================================================

async function executeTradeFromWebhook(payload: WebhookPayload): Promise<void> {
  const coin = convertMarketToCoin(payload.market);

  console.log('\n' + '='.repeat(40));
  console.log('📊 TRADE SIGNAL RECEIVED');
  console.log('='.repeat(40));
  console.log(`Strategy:     ${payload.strategy}`);
  console.log(`Market:       ${payload.market} (${coin})`);
  console.log(`Order:        ${payload.order.toUpperCase()}`);
  console.log(`Position:     ${payload.position.toUpperCase()}`);
  console.log(`Leverage:     ${payload.sizeByLeverage}x`);
  console.log(`Signal Price: $${payload.price}`);
  console.log('='.repeat(40) + '\n');

  const currentPosition = await getCurrentPosition(coin);

  if (currentPosition) {
    console.log(`Current Position: ${currentPosition.side} ${currentPosition.size} ${coin}`);
    console.log(`   Entry: $${currentPosition.entryPrice.toFixed(2)}`);
    console.log(`   PnL: $${currentPosition.unrealizedPnl.toFixed(2)}\n`);
  } else {
    console.log(`Current Position: NONE\n`);
  }

  const action = determineAction(payload.position, currentPosition);
  console.log(`Action: ${action}\n`);

  let orderResult: { size: number } | null = null;

  try {
    switch (action) {
      case 'OPEN_LONG':
        orderResult = await executeLong(coin, payload.sizeByLeverage);
        break;

      case 'OPEN_SHORT':
        orderResult = await executeShort(coin, payload.sizeByLeverage);
        break;

      case 'CLOSE':
        if (currentPosition) {
          await closePosition(coin, currentPosition);
          orderResult = { size: currentPosition.size };
        }
        break;

      case 'REVERSE_TO_LONG':
        if (currentPosition) {
          await closePosition(coin, currentPosition);
        }
        orderResult = await executeLong(coin, payload.sizeByLeverage);
        break;

      case 'REVERSE_TO_SHORT':
        if (currentPosition) {
          await closePosition(coin, currentPosition);
        }
        orderResult = await executeShort(coin, payload.sizeByLeverage);
        break;

      case 'NONE':
        console.log('ℹ️ No action needed - already in correct position\n');
        return;
    }

    console.log('✅ Trade execution completed\n');

    // Send success notif to Discord, only if action was taken
    if (discordWebhook && orderResult) {
      await discordWebhook.sendTradeAlert(payload, orderResult);
    }
  } catch (error) {
    console.error('❌ Trade execution failed:', error);

    // Send error notif to Discord
    if (discordWebhook) {
      await discordWebhook.sendErrorAlert(
        payload,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    throw error;
  }
}

/**
 * Determine what action to take based on desired position and current position
 */
function determineAction(
  desiredPosition: string,
  currentPosition: Position | null
): string {
  if (desiredPosition === 'flat') {
    if (currentPosition) {
      return 'CLOSE';
    }
    return 'NONE';
  }

  if (desiredPosition === 'long') {
    if (!currentPosition) {
      return 'OPEN_LONG';
    }
    if (currentPosition.side === 'LONG') {
      return 'NONE'; // already in long
    }
    if (currentPosition.side === 'SHORT') {
      return 'REVERSE_TO_LONG';
    }
  }

  if (desiredPosition === 'short') {
    if (!currentPosition) {
      return 'OPEN_SHORT';
    }
    if (currentPosition.side === 'SHORT') {
      return 'NONE'; // already in short
    }
    if (currentPosition.side === 'LONG') {
      return 'REVERSE_TO_SHORT';
    }
  }

  return 'NONE';
}

/**
 * Execute a long
 */
async function executeLong(coin: string, leverage: number): Promise<{ size: number }> {
  const availableBalance = await getAvailableBalance();
  const marketPrice = await getMarketPrice(coin);
  const size = calculatePositionSize(availableBalance, leverage, marketPrice);

  console.log(`Available Balance: $${availableBalance.toFixed(2)}`);
  console.log(`Market Price: $${marketPrice.toFixed(2)}`);
  console.log(`Position Size: ${size} ${coin}\n`);

  await openPosition(coin, true, size, leverage);

  return { size };
}

/**
 * Execute a short
 */
async function executeShort(coin: string, leverage: number): Promise<{ size: number }> {
  const availableBalance = await getAvailableBalance();
  const marketPrice = await getMarketPrice(coin);
  const size = calculatePositionSize(availableBalance, leverage, marketPrice);

  console.log(`Available Balance: $${availableBalance.toFixed(2)}`);
  console.log(`Market Price: $${marketPrice.toFixed(2)}`);
  console.log(`Position Size: ${size} ${coin}\n`);

  await openPosition(coin, false, size, leverage);

  return { size };
}

// ============================================================================
// STARTUP ACCOUNT INFO
// ============================================================================

async function displayAccountInfo() {
  try {
    console.log('\n' + '='.repeat(40));
    console.log('ACCOUNT STATS');
    console.log('='.repeat(40));

    const sdk = await getHyperliquidClient();

    if (!walletAddress) {
      const { Wallet } = await import('ethers');
      const wallet = new Wallet(process.env.HYPERLIQUID_PRIVATE_KEY!);
      walletAddress = wallet.address;
    }

    const userState = await sdk.info.perpetuals.getClearinghouseState(walletAddress);

    const accountValue = parseFloat(userState.marginSummary.accountValue);
    const marginUsed = parseFloat(userState.marginSummary.totalMarginUsed);
    const availableMargin = accountValue - marginUsed;

    console.log(`Account Value:    $${accountValue.toFixed(2)}`);
    console.log(`Margin Used:      $${marginUsed.toFixed(2)}`);
    console.log(`Available:        $${availableMargin.toFixed(2)}`);

    const activePositions = userState.assetPositions.filter(
      (assetPos: any) => parseFloat(assetPos.position.szi) !== 0
    );

    console.log(`\nActive Positions: ${activePositions.length}`);

    if (activePositions.length > 0) {
      activePositions.forEach((assetPos: any) => {
        const pos = assetPos.position;
        const size = parseFloat(pos.szi);
        const side = size > 0 ? 'LONG' : 'SHORT';
        console.log(`  ${pos.coin}: ${side} ${Math.abs(size)} @ $${parseFloat(pos.entryPx).toFixed(2)} | PnL: $${parseFloat(pos.unrealizedPnl).toFixed(2)}`);
      });
    }

    console.log('='.repeat(40) + '\n');
  } catch (error) {
    console.error('❌ Failed to fetch account info:', error);
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Health check (required by Render)
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * Webhook endpoint for TradingView
 */
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  console.log('\n' + '='.repeat(40));
  console.log(`[${timestamp}] 🔔 WEBHOOK RECEIVED`);
  console.log('='.repeat(40));
  console.log('Raw body:', JSON.stringify(req.body, null, 2));
  console.log('Order value:', req.body.order);
  console.log('Position value:', req.body.position);
  console.log('Price value:', req.body.price);
  console.log('='.repeat(40) + '\n');

  try {
    const payload: WebhookPayload = req.body;

    console.log('Validation checks:');
    console.log('  - Has market?', !!payload.market);
    console.log('  - Has order?', !!payload.order);
    console.log('  - Has position?', !!payload.position);
    console.log('  - Exchange:', payload.exchange);

    // Validate payload
    if (!payload.market || !payload.order || !payload.position) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: market, order, or position',
      });
    }

    if (payload.exchange !== 'hyperliquid') {
      console.error(`❌ Invalid exchange: ${payload.exchange}`);
      return res.status(400).json({
        success: false,
        error: `Invalid exchange: ${payload.exchange}. Expected: hyperliquid`,
      });
    }

    console.log('✅ Validation passed, executing trade...\n');

    await executeTradeFromWebhook(payload);

    console.log('✅ Trade execution completed successfully\n');

    res.json({
      success: true,
      message: 'Trade executed successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('\n' + '='.repeat(40));
    console.error('❌ WEBHOOK ERROR');
    console.error('='.repeat(40));
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('='.repeat(40) + '\n');

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get current positions (for debugging)
 */
app.get('/positions', async (req, res) => {
  try {
    const sdk = await getHyperliquidClient();
    const userState = await sdk.info.perpetuals.getClearinghouseState(walletAddress);

    const positions = userState.assetPositions
      .filter((assetPos: any) => parseFloat(assetPos.position.szi) !== 0)
      .map((assetPos: any) => {
        const pos = assetPos.position;
        const size = parseFloat(pos.szi);
        return {
          coin: pos.coin,
          side: size > 0 ? 'LONG' : 'SHORT',
          size: Math.abs(size),
          entryPrice: parseFloat(pos.entryPx),
          unrealizedPnl: parseFloat(pos.unrealizedPnl),
          leverage: pos.leverage.value,
        };
      });

    res.json({
      success: true,
      positions,
      count: positions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Network: ${process.env.HYPERLIQUID_TESTNET === 'true' ? 'TESTNET' : 'MAINNET'}`);

  // Display account info after booting up server
  displayAccountInfo().catch(console.error);
});

/*
{
    "exchange": "hyperliquid",
    "strategy": "Configuration 3 - Swings, High PnL",
    "market": "BTC_USD",
    "sizeByLeverage": 2.5,
    "reverse": false,
    "order":"{{strategy.order.action}}",
    "position":"{{strategy.market_position}}",
    "prevPosition":"{{strategy.prev_market_position}}",
    "price":"{{strategy.order.price}}"
}
*/