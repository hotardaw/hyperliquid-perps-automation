import { Hyperliquid } from 'hyperliquid';

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

interface OrderResult {
  size: number;
  price?: number;
}

// ============================================================================
// DISCORD WEBHOOK SERVICE
// ============================================================================

export class DiscordWebhookService {
  private webhookUrl: string;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async sendWebhookWithRetry(payload: any): Promise<Response | null> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return response;
        }

        if (attempt < this.MAX_RETRIES && response.status >= 500) {
          console.warn(
            `Discord webhook attempt ${attempt} failed with status ${response.status}, retrying...`
          );
          await this.sleep(this.RETRY_DELAY_MS * attempt);
          continue;
        }

        console.error(`Discord webhook failed with status: ${response.status}`);
        return response;
      } catch (error) {
        if (attempt < this.MAX_RETRIES) {
          console.warn(
            `Discord webhook attempt ${attempt} failed with error: ${error}, retrying...`
          );
          await this.sleep(this.RETRY_DELAY_MS * attempt);
          continue;
        }

        console.error(
          `Discord webhook failed after ${this.MAX_RETRIES} attempts:`,
          error
        );
        throw error;
      }
    }

    return null;
  }

  private isEntryWebhook(position: string): boolean {
    return position === 'long' || position === 'short';
  }

  private isExitWebhook(position: string): boolean {
    return position === 'flat';
  }

  private getWebhookEmbedColor(isEntry: boolean, position?: string): number {
    if (isEntry) {
      return position === 'long' ? 5763719 : 15548997; // green for long, red for short
    } else {
      return 10070709; // light gray for exits
    }
  }

  async sendTradeAlert(
    webhookPayload: WebhookPayload,
    orderResult: OrderResult
  ): Promise<void> {
    if (!this.webhookUrl) {
      return;
    }

    try {
      if (this.isEntryWebhook(webhookPayload.position)) {
        await this.sendEntryWebhook(webhookPayload, orderResult);
      } else if (this.isExitWebhook(webhookPayload.position)) {
        await this.sendExitWebhook(webhookPayload, orderResult);
      } else {
        await this.sendGenericWebhook(webhookPayload, orderResult);
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  private async sendEntryWebhook(
    webhookPayload: WebhookPayload,
    orderResult: OrderResult
  ): Promise<void> {
    const leverageText = webhookPayload.sizeByLeverage
      ? `${webhookPayload.sizeByLeverage}x`
      : 'N/A';
    const baseToken = this.extractBaseToken(webhookPayload.market);
    const tokenEmoji = this.getTokenEmoji(webhookPayload.market);
    const formattedMarket = this.formatMarketPair(webhookPayload.market);
    const longOrShortEmoji = webhookPayload.position === 'long' ? '↗️' : '↘️';

    const price = parseFloat(webhookPayload.price);
    const sizeInUsd = `$${(orderResult.size * price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const sizeInToken = `${orderResult.size.toFixed(5)} ${baseToken}`;

    const payload = {
      embeds: [
        {
          description: `📊 **[${webhookPayload.strategy
            }](https://docs.google.com/spreadsheets/d/1v6RgPJrju0i8ZpQJ_PxFoc8cHjrIzNdFiCECPBw3Zlg/edit?gid=662561373#gid=662561373)**\n\n**Trading Pair:** ${tokenEmoji} ${formattedMarket}\n**Trade Action:** ${longOrShortEmoji} ${webhookPayload.position.charAt(0).toUpperCase() +
            webhookPayload.position.slice(1)
            } at **$${price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}**\n**Leverage:** ${leverageText}\n**Size in USD:** ${sizeInUsd}\n**Size in ${baseToken}:** ${sizeInToken}`,
          color: this.getWebhookEmbedColor(true, webhookPayload.position),
          footer: {
            text: 'BlockCircle 2024, all rights reserved.',
            icon_url: '',
          },
        },
      ],
    };

    await this.sendWebhookWithRetry(payload);
  }

  private async sendExitWebhook(
    webhookPayload: WebhookPayload,
    orderResult: OrderResult
  ): Promise<void> {
    const tokenEmoji = this.getTokenEmoji(webhookPayload.market);
    const formattedMarket = this.formatMarketPair(webhookPayload.market);
    const price = parseFloat(webhookPayload.price);

    const payload = {
      embeds: [
        {
          description: `📊 **[${webhookPayload.strategy
            }](https://docs.google.com/spreadsheets/d/1v6RgPJrju0i8ZpQJ_PxFoc8cHjrIzNdFiCECPBw3Zlg/edit?gid=662561373#gid=662561373)**\n\n**Trading Pair:** ${tokenEmoji} ${formattedMarket}\n**Trade Action:** Flat at **$${price.toLocaleString(
              'en-US',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}**`,
          color: this.getWebhookEmbedColor(false),
          footer: {
            text: 'BlockCircle 2024, all rights reserved.',
            icon_url: '',
          },
        },
      ],
    };

    await this.sendWebhookWithRetry(payload);
  }

  private async sendGenericWebhook(
    webhookPayload: WebhookPayload,
    orderResult: OrderResult
  ): Promise<void> {
    const price = parseFloat(webhookPayload.price);
    const calculatedSizeUsd = orderResult ? orderResult.size * price : null;
    const sizeUsdDisplay = calculatedSizeUsd
      ? `$${calculatedSizeUsd.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : 'N/A';

    const payload = {
      embeds: [
        {
          description: `📊 **[${webhookPayload.strategy
            }](https://docs.google.com/spreadsheets/d/1v6RgPJrju0i8ZpQJ_PxFoc8cHjrIzNdFiCECPBw3Zlg/edit?gid=662561373#gid=662561373)**\n\n**Trading Pair:** ${webhookPayload.market
            }\n**Position:** ${webhookPayload.position
            }\n**Price:** $${price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}\n**Size USD:** ${sizeUsdDisplay}`,
          color: 10197915,
          footer: {
            text: 'BlockCircle 2024, all rights reserved.',
            icon_url: '',
          },
        },
      ],
    };

    await this.sendWebhookWithRetry(payload);
  }

  async sendErrorAlert(
    webhookPayload: WebhookPayload,
    error: string
  ): Promise<void> {
    if (!this.webhookUrl) {
      return;
    }

    try {
      const payload = {
        embeds: [
          {
            description: `❌ **TRADE EXECUTION FAILED**\n\n**Strategy:** ${webhookPayload.strategy}\n**Exchange:** ${webhookPayload.exchange}\n**Market:** ${webhookPayload.market}\n**Error:** ${error}`,
            color: 15548997,
            footer: {
              text: 'BlockCircle 2024, all rights reserved.',
              icon_url: '',
            },
          },
        ],
      };

      await this.sendWebhookWithRetry(payload);
    } catch (error) {
      console.error('Failed to send Discord error notification:', error);
    }
  }

  private extractBaseToken(market: string): string {
    const separators = ['/', '-', '_'];

    for (const sep of separators) {
      if (market.includes(sep)) {
        return market.split(sep)[0];
      }
    }

    if (market.toUpperCase().endsWith('USDC')) {
      return market.slice(0, -4);
    }
    if (market.toUpperCase().endsWith('USDT')) {
      return market.slice(0, -4);
    }
    if (market.toUpperCase().endsWith('USD')) {
      return market.slice(0, -3);
    }

    return market.replace(/[0-9]/g, '').substring(0, market.length / 2);
  }

  private getTokenEmoji(market: string): string {
    const ticker = market.substring(0, 3).toUpperCase();

    const emojiMap: { [key: string]: string } = {
      BTC: '<:btc:1373703264796672020>',
      SOL: '<:sol:1373702715389120633>',
      ETH: '<:eth:1373703078456590358>',
    };

    return emojiMap[ticker] || '';
  }

  private formatMarketPair(market: string): string {
    return market.replace(/_/g, '/');
  }
}