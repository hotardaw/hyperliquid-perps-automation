import { Wallet, HDNodeWallet, ethers } from 'ethers';

declare class RateLimiter {
    private tokens;
    private lastRefill;
    private readonly capacity;
    private readonly refillRate;
    constructor();
    private refillTokens;
    waitForToken(weight?: number): Promise<void>;
}

type Tif = 'Alo' | 'Ioc' | 'Gtc';
type TriggerType = 'tp' | 'sl';
type LimitOrder = {
    tif: Tif;
};
type TriggerOrder = {
    triggerPx: string | number;
    isMarket: boolean;
    tpsl: TriggerType;
};
type Grouping = 'na' | 'normalTpsl' | 'positionTpsl';
type OrderType = {
    limit?: LimitOrder;
    trigger?: TriggerOrder;
};
type Cloid = string;
type OidOrCloid = number | Cloid;
interface OrderRequest {
    coin: string;
    is_buy: boolean;
    sz: number | string;
    limit_px: number | string;
    order_type: OrderType;
    reduce_only: boolean;
    cloid?: string;
    grouping?: Grouping;
    builder?: Builder;
}
interface BaseOrder {
    vaultAddress?: string;
    grouping?: Grouping;
    builder?: Builder;
}
interface Order extends BaseOrder {
    coin: string;
    is_buy: boolean;
    sz: number | string;
    limit_px: number | string;
    order_type: OrderType;
    reduce_only: boolean;
    cloid?: Cloid;
    orders?: undefined;
}
interface MultiOrder extends BaseOrder {
    orders: OrderRequest[];
}
type BulkOrderRequest = MultiOrder;
interface Builder {
    address: string;
    fee: number;
}
interface AllMids {
    [coin: string]: string;
}
type Meta = {
    universe: {
        name: string;
        szDecimals: number;
        maxLeverage: number;
        onlyIsolated?: boolean;
    }[];
};
interface ClearinghouseState {
    assetPositions: {
        position: {
            coin: string;
            cumFunding: {
                allTime: string;
                sinceChange: string;
                sinceOpen: string;
            };
            entryPx: string;
            leverage: {
                rawUsd: string;
                type: string;
                value: number;
            };
            liquidationPx: string;
            marginUsed: string;
            maxLeverage: number;
            positionValue: string;
            returnOnEquity: string;
            szi: string;
            unrealizedPnl: string;
        };
        type: string;
    }[];
    crossMaintenanceMarginUsed: string;
    crossMarginSummary: {
        accountValue: string;
        totalMarginUsed: string;
        totalNtlPos: string;
        totalRawUsd: string;
    };
    marginSummary: {
        accountValue: string;
        totalMarginUsed: string;
        totalNtlPos: string;
        totalRawUsd: string;
    };
    time: number;
    withdrawable: string;
}
type UserFills = {
    closedPnl: string;
    coin: string;
    crossed: boolean;
    dir: string;
    hash: string;
    oid: number;
    px: string;
    side: string;
    startPosition: string;
    sz: string;
    time: number;
    fee: string;
    feeToken: string;
    tid: number;
    builderFee?: string;
    liquidationMarkPx?: string;
    twapId?: number;
}[];
interface OrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            statuses: Array<{
                resting?: {
                    oid: number;
                };
                filled?: {
                    oid: number;
                    totalSz: string;
                    avgPx: string;
                };
            }>;
        };
    };
}
interface Leverage {
    type: 'cross' | 'isolated';
    value: number;
    rawUsd?: string;
}
interface WsTrade {
    coin: string;
    side: string;
    px: string;
    sz: string;
    hash: string;
    time: number;
    tid: number;
}
interface WsBook {
    coin: string;
    levels: [Array<WsLevel>, Array<WsLevel>];
    time: number;
}
interface WsBbo {
    coin: string;
    time: number;
    bbo: [WsLevel | null, WsLevel | null];
}
interface WsLevel {
    px: string;
    sz: string;
    n: number;
}
interface WsOrder {
    order: {
        coin: string;
        side: string;
        limitPx: string;
        sz: string;
        oid: number;
        timestamp: number;
        origSz: string;
    };
    status: string;
    statusTimestamp: number;
    user: string;
}
type WsUserEvent = (WsFill[] | WsUserFunding | WsLiquidation | WsNonUserCancel[]) & {
    user: string;
};
interface WsFill {
    coin: string;
    px: string;
    sz: string;
    side: string;
    time: number;
    startPosition: string;
    dir: string;
    closedPnl: string;
    hash: string;
    oid: number;
    crossed: boolean;
    fee: string;
    tid: number;
}
interface WsLiquidation {
    lid: number;
    liquidator: string;
    liquidated_user: string;
    liquidated_ntl_pos: string;
    liquidated_account_value: string;
}
interface WsNonUserCancel {
    coin: string;
    oid: number;
}
interface SpotClearinghouseState {
    balances: {
        coin: string;
        hold: string;
        total: string;
    }[];
}
type FrontendOpenOrders = {
    coin: string;
    isPositionTpsl: boolean;
    isTrigger: boolean;
    limitPx: string;
    oid: number;
    orderType: string;
    origSz: string;
    reduceOnly: boolean;
    side: string;
    sz: string;
    timestamp: number;
    triggerCondition: string;
    triggerPx: string;
}[];
interface UserRateLimit {
    [key: string]: any;
}
interface OrderStatus {
    [key: string]: any;
}
interface L2Book {
    levels: [
        {
            px: string;
            sz: string;
            n: number;
        }[],
        {
            px: string;
            sz: string;
            n: number;
        }[]
    ];
}
type CandleSnapshot = Candle[];
type AssetCtx = {
    dayBaseVlm: string;
    dayNtlVlm: string;
    funding: string;
    impactPxs: [string, string];
    markPx: string;
    midPx: string;
    openInterest: string;
    oraclePx: string;
    premium: string;
    prevDayPx: string;
};
type MetaAndAssetCtxs = [Meta, AssetCtx[]];
interface UserFundingDelta {
    coin: string;
    fundingRate: string;
    szi: string;
    type: 'funding';
    usdc: string;
}
interface UserFundingEntry {
    delta: UserFundingDelta;
    hash: string;
    time: number;
}
type UserFunding = UserFundingEntry[];
interface UserNonFundingLedgerDelta {
    coin: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'liquidation';
    usdc: string;
}
interface UserNonFundingLedgerEntry {
    delta: UserNonFundingLedgerDelta;
    hash: string;
    time: number;
}
type UserNonFundingLedgerUpdates = UserNonFundingLedgerEntry[];
interface FundingHistoryEntry {
    coin: string;
    fundingRate: string;
    premium: string;
    time: number;
}
type FundingHistory = FundingHistoryEntry[];
interface SpotToken {
    name: string;
    szDecimals: number;
    weiDecimals: number;
    index: number;
    tokenId: string;
    isCanonical: boolean;
}
interface SpotMarket {
    name: string;
    tokens: [number, number];
    index: number;
    isCanonical: boolean;
}
type SpotMeta = {
    tokens: SpotToken[];
    universe: SpotMarket[];
};
type SpotAssetCtx = {
    circulatingSupply: string;
    coin: string;
    dayBaseVlm: string;
    dayNtlVlm: string;
    markPx: string;
    midPx: string;
    prevDayPx: string;
    totalSupply: string;
};
type SpotMetaAndAssetCtxs = [SpotMeta, SpotAssetCtx[]];
interface UserOpenOrder {
    coin: string;
    limitPx: string;
    oid: number;
    side: string;
    sz: string;
    timestamp: number;
}
type UserOpenOrders = UserOpenOrder[];
interface OrderWire {
    a: number;
    b: boolean;
    p: string;
    s: string;
    r: boolean;
    t: OrderType;
    c?: string;
}
interface CancelOrderRequest {
    coin: string;
    o: number;
}
type CancelOrderRequests = {
    a: number;
    o: number;
}[];
interface CancelByCloidRequest {
    coin: string;
    cloid: Cloid;
}
interface ModifyRequest {
    oid: OidOrCloid;
    order: OrderRequest;
}
interface ModifyWire {
    oid: number;
    order: OrderWire;
}
interface ScheduleCancelAction {
    type: 'scheduleCancel';
    time?: number | null;
}
interface Signature {
    r: string;
    s: string;
    v: number;
}
interface Notification {
    notification: string;
    user: string;
}
interface WebData2 {
    [key: string]: any;
}
interface Candle {
    t: number;
    T: number;
    s: string;
    i: string;
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
    n: number;
}
interface WsUserFill {
    coin: string;
    px: string;
    sz: string;
    side: string;
    time: number;
    startPosition: string;
    dir: string;
    closedPnl: string;
    hash: string;
    oid: number;
    crossed: boolean;
    fee: string;
    tid: number;
}
type WsUserFills = {
    isSnapshot: boolean;
    fills: WsUserFill[];
    user: string;
};
interface WsUserFunding {
    time: number;
    coin: string;
    usdc: string;
    szi: string;
    fundingRate: string;
}
interface WsUserFunding {
    time: number;
    coin: string;
    usdc: string;
    szi: string;
    fundingRate: string;
}
type WsUserFundings = {
    isSnapshot: boolean;
    fundings: WsUserFunding[];
    user: string;
};
interface WsUserNonFundingLedgerUpdate {
    time: number;
    coin: string;
    usdc: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'liquidation';
}
type WsUserNonFundingLedgerUpdates = {
    isSnapshot: boolean;
    updates: WsUserNonFundingLedgerUpdate[];
    user: string;
};
type WsUserActiveAssetData = {
    isSnapshot: boolean;
    user: string;
    coin: string;
    leverage: Leverage;
    maxTradeSzs: [number, number];
    availableToTrade: [number, number];
};
interface TwapOrder {
    coin: string;
    is_buy: boolean;
    sz: number;
    reduce_only: boolean;
    minutes: number;
    randomize: boolean;
}
interface TwapCancelRequest {
    coin: string;
    twap_id: number;
}
interface TwapOrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            status: {
                running: {
                    twapId: number;
                };
            };
        };
    };
}
interface TwapCancelResponse {
    status: string;
    response: {
        type: string;
        data: {
            status: string;
        };
    };
}
interface PredictedFunding {
    fundingRate: string;
    nextFundingTime: number;
}
interface VenueFunding {
    [venue: string]: PredictedFunding;
}
interface PredictedFundings {
    [coin: string]: VenueFunding[];
}
interface TokenDetails {
    name: string;
    maxSupply: string;
    totalSupply: string;
    circulatingSupply: string;
    szDecimals: number;
    weiDecimals: number;
    midPx: string;
    markPx: string;
    prevDayPx: string;
    genesis: {
        userBalances: [string, string][];
        existingTokenBalances: [number, string][];
    };
    deployer: string;
    deployGas: string;
    deployTime: string;
    seededUsdc: string;
    nonCirculatingUserBalances: string[];
    futureEmissions: string;
}
interface SpotDeployState {
    states: {
        token: number;
        spec: {
            name: string;
            szDecimals: number;
            weiDecimals: number;
        };
        fullName: string;
        spots: number[];
        maxSupply: number;
        hyperliquidityGenesisBalance: string;
        totalGenesisBalanceWei: string;
        userGenesisBalances: [string, string][];
        existingTokenGenesisBalances: [number, string][];
    }[];
    gasAuction: {
        startTimeSeconds: number;
        durationSeconds: number;
        startGas: string;
        currentGas: string | null;
        endGas: string;
    };
}
interface SubAccount {
    name: string;
    subAccountUser: string;
    master: string;
    clearinghouseState: ClearinghouseState;
    spotState: {
        balances: {
            coin: string;
            token: number;
            total: string;
            hold: string;
            entryNtl: string;
        }[];
    };
}
interface PortfolioPeriodData {
    accountValueHistory: [number, string][];
    pnlHistory: [number, string][];
    vlm: string;
}
interface VaultFollower {
    user: string;
    vaultEquity: string;
    pnl: string;
    allTimePnl: string;
    daysFollowing: number;
    vaultEntryTime: number;
    lockupUntil: number;
}
interface VaultDetails {
    name: string;
    vaultAddress: string;
    leader: string;
    description: string;
    portfolio: [string, PortfolioPeriodData][];
    apr: number;
    followerState: any;
    leaderFraction: number;
    leaderCommission: number;
    followers: VaultFollower[];
    maxDistributable: number;
    maxWithdrawable: number;
    isClosed: boolean;
    relationship: {
        type: string;
        data: {
            childAddresses: string[];
        };
    };
    allowDeposits: boolean;
    alwaysCloseOnWithdraw: boolean;
}
interface VaultEquity {
    vaultAddress: string;
    equity: string;
}
interface HistoricalOrder {
    order: {
        coin: string;
        side: string;
        limitPx: string;
        sz: string;
        oid: number;
        timestamp: number;
        triggerCondition: string;
        isTrigger: boolean;
        triggerPx: string;
        children: any[];
        isPositionTpsl: boolean;
        reduceOnly: boolean;
        orderType: string;
        origSz: string;
        tif: string;
        cloid: string | null;
    };
    status: 'filled' | 'open' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled';
    statusTimestamp: number;
}
interface TwapSliceFill {
    fill: {
        closedPnl: string;
        coin: string;
        crossed: boolean;
        dir: string;
        hash: string;
        oid: number;
        px: string;
        side: string;
        startPosition: string;
        sz: string;
        time: number;
        fee: string;
        feeToken: string;
        tid: number;
    };
    twapId: number;
}
interface ApproveAgentRequest {
    agentAddress: string;
    agentName?: string;
}
interface ApproveBuilderFeeRequest {
    maxFeeRate: string;
    builder: string;
}
interface Delegation {
    validator: string;
    amount: string;
    lockedUntilTimestamp: number;
}
interface DelegatorSummary {
    delegated: string;
    undelegated: string;
    totalPendingWithdrawal: string;
    nPendingWithdrawals: number;
}
interface DelegatorHistoryEntry {
    time: number;
    hash: string;
    delta: {
        delegate: {
            validator: string;
            amount: string;
            isUndelegate: boolean;
        };
    };
}
interface DelegatorReward {
    time: number;
    source: string;
    totalAmount: string;
}
type PerpsAtOpenInterestCap = string[];
type UserRole = 'missing' | 'user' | 'agent' | 'vault' | 'subAccount';
interface WsActiveAssetCtx {
    coin: string;
    ctx: {
        dayNtlVlm: string;
        prevDayPx: string;
        markPx: string;
        midPx?: string;
        funding?: number;
        openInterest?: number;
        oraclePx?: number;
        circulatingSupply?: number;
    };
}
interface WsActiveSpotAssetCtx {
    coin: string;
    ctx: {
        dayNtlVlm: string;
        prevDayPx: string;
        markPx: string;
        midPx?: string;
        circulatingSupply: string;
    };
}
interface WsTwapState {
    coin: string;
    user: string;
    side: string;
    sz: number;
    executedSz: number;
    executedNtl: number;
    minutes: number;
    reduceOnly: boolean;
    randomize: boolean;
    timestamp: number;
}
type WsTwapStatus = 'activated' | 'terminated' | 'finished' | 'error';
interface WsTwapHistory {
    state: WsTwapState;
    status: {
        status: WsTwapStatus;
        description: string;
    };
    time: number;
}
interface WsTwapHistoryResponse {
    isSnapshot: boolean;
    user: string;
    history: WsTwapHistory[];
}
interface WsTwapSliceFill {
    isSnapshot?: boolean;
    user: string;
    twapSliceFills: Array<{
        fill: {
            closedPnl: string;
            coin: string;
            crossed: boolean;
            dir: string;
            hash: string;
            oid: number;
            px: string;
            side: string;
            startPosition: string;
            sz: string;
            time: number;
            fee: string;
            feeToken: string;
            tid: number;
        };
        twapId: number;
    }>;
}
interface ValidatorStats {
    uptimeFraction: string;
    predictedApr: string;
    nSamples: number;
}
interface ValidatorSummary {
    validator: string;
    signer: string;
    name: string;
    description: string;
    nRecentBlocks: number;
    stake: number;
    isJailed: boolean;
    unjailableAfter: number | null;
    isActive: boolean;
    commission: string;
    stats: [['day', ValidatorStats], ['week', ValidatorStats], ['month', ValidatorStats]];
}
interface VaultRelationship {
    type: 'normal' | 'child' | 'parent';
    data?: {
        childAddresses: string[];
    };
}
interface VaultSummary {
    name: string;
    vaultAddress: string;
    leader: string;
    tvl: string;
    isClosed: boolean;
    relationship: VaultRelationship;
    createTimeMillis: number;
}
interface TxDetails {
    action: {
        type: string;
        [key: string]: unknown;
    };
    block: number;
    error: string | null;
    hash: string;
    time: number;
    user: string;
}
interface BlockDetails {
    blockTime: number;
    hash: string;
    height: number;
    numTxs: number;
    proposer: string;
    txs: TxDetails[];
}
interface BlockDetailsResponse {
    type: 'blockDetails';
    blockDetails: BlockDetails;
}
interface TxDetailsResponse {
    type: 'txDetails';
    tx: TxDetails;
}
interface UserDetailsResponse {
    type: 'userDetails';
    txs: TxDetails[];
}
interface UserFees {
    dailyUserVlm: {
        date: string;
        userCross: string;
        userAdd: string;
        exchange: string;
    }[];
    feeSchedule: {
        cross: string;
        add: string;
        tiers: {
            vip: {
                ntlCutoff: string;
                cross: string;
                add: string;
            }[];
            mm: {
                makerFractionCutoff: string;
                add: string;
            }[];
        };
        referralDiscount: string;
    };
    userCrossRate: string;
    userAddRate: string;
    activeReferralDiscount: string;
    trial: unknown | null;
    feeTrialReward: string;
    nextTrialAvailableTimestamp: unknown | null;
}
interface Portfolio {
    accountValueHistory: [number, string][];
    pnlHistory: [number, string][];
    vlm: string;
}
type PortfolioPeriods = [
    [
        'day',
        Portfolio
    ],
    [
        'week',
        Portfolio
    ],
    [
        'month',
        Portfolio
    ],
    [
        'allTime',
        Portfolio
    ],
    [
        'perpDay',
        Portfolio
    ],
    [
        'perpWeek',
        Portfolio
    ],
    [
        'perpMonth',
        Portfolio
    ],
    [
        'perpAllTime',
        Portfolio
    ]
];
interface PreTransferCheck {
    fee: string;
    isSanctioned: boolean;
    userExists: boolean;
}
interface Referral {
    referredBy: {
        referrer: string;
        code: string;
    } | null;
    cumVlm: string;
    unclaimedRewards: string;
    claimedRewards: string;
    builderRewards: string;
    referrerState: {
        stage: 'ready' | 'needToCreateCode' | 'needToTrade';
        data?: {
            code?: string;
            referralStates?: {
                cumVlm: string;
                cumRewardedFeesSinceReferred: string;
                cumFeesRewardedToReferrer: string;
                timeJoined: number;
                user: string;
            }[];
            required?: string;
        };
    };
    rewardHistory: {
        earned: string;
        vlm: string;
        referralVlm: string;
        time: number;
    }[];
}
interface ExtraAgent {
    address: string;
    name: string;
    validUntil: number;
}
interface LegalCheck {
    ipAllowed: boolean;
    acceptedTerms: boolean;
    userAllowed: boolean;
}
interface TwapState {
    coin: string;
    executedNtl: string;
    executedSz: string;
    minutes: number;
    randomize: boolean;
    reduceOnly: boolean;
    side: 'B' | 'A';
    sz: string;
    timestamp: number;
    user: string;
}
interface TwapStatus {
    status: 'finished' | 'activated' | 'terminated' | 'error';
    description?: string;
}
interface TwapHistory {
    time: number;
    state: TwapState;
    status: TwapStatus;
}
interface MultiSigSigners {
    authorizedUsers: string[];
    threshold: number;
}
interface CreateVaultRequest {
    name: string;
    description: string;
    initialUsd: number;
}
interface CreateVaultResponse {
    status: string;
    response: {
        type: string;
        data: string;
    };
}
interface VaultDistributeRequest {
    vaultAddress: string;
    usd: number;
}
interface VaultModifyRequest {
    vaultAddress: string;
    allowDeposits: boolean | null;
    alwaysCloseOnWithdraw: boolean | null;
}
interface ClaimRewardsResponse {
    status: string;
    response: {
        type: string;
    };
}
interface CreateSubAccountResponse {
    status: string;
    response: {
        type: string;
        data: string;
    };
}
interface SetDisplayNameResponse {
    status: string;
    response: {
        type: string;
    };
}
interface SpotUserResponse {
    status: string;
    response: {
        type: string;
    };
}
interface CDepositResponse {
    status: string;
    response: {
        type: string;
    };
}
interface CWithdrawResponse {
    status: string;
    response: {
        type: string;
    };
}
interface TokenDelegateResponse {
    status: string;
    response: {
        type: string;
    };
}
interface SubAccountSpotTransferResponse {
    status: string;
    response: {
        type: string;
    };
}
interface SubAccountTransferResponse {
    status: string;
    response: {
        type: string;
    };
}
interface ReserveRequestWeightRequest {
    weight: number;
}
interface ReserveRequestWeightResponse {
    status: string;
    response: {
        type: string;
    };
}
interface BuilderFeeApproval {
    maxFeeRate: string;
}
interface UserOrderHistoryEntry {
    order: {
        coin: string;
        side: string;
        limitPx: string;
        sz: string;
        oid: number;
        timestamp: number;
        triggerCondition: string;
        isTrigger: boolean;
        triggerPx: string;
        children: any[];
        isPositionTpsl: boolean;
        reduceOnly: boolean;
        orderType: string;
        origSz: string;
        tif: string;
        cloid: string | null;
    };
    status: 'filled' | 'open' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled';
    statusTimestamp: number;
}
type UserOrderHistory = UserOrderHistoryEntry[];
interface PerpDexLimits {
    totalOiCap: string;
    oiSzCapPerPerp: string;
    maxTransferNtl: string;
    coinToOiCap: [string, string][];
}
interface NoopResponse {
    status: string;
    response: {
        type: string;
    };
}

declare class HttpApi {
    private client;
    private endpoint;
    private rateLimiter;
    constructor(baseUrl: string, endpoint: string | undefined, rateLimiter: RateLimiter);
    makeRequest<T>(payload: any, weight?: number, endpoint?: string): Promise<T>;
}

declare class SymbolConversion {
    private assetToIndexMap;
    private exchangeToInternalNameMap;
    private httpApi;
    private refreshIntervalMs;
    private refreshInterval;
    private initialized;
    private consecutiveFailures;
    private maxConsecutiveFailures;
    private baseRetryDelayMs;
    private disableAssetMapRefresh;
    constructor(baseURL: string, rateLimiter: any, disableAssetMapRefresh?: boolean, refreshIntervalMs?: number);
    initialize(): Promise<void>;
    private ensureInitialized;
    getInternalName(exchangeName: string): Promise<string | undefined>;
    private startPeriodicRefresh;
    private checkMaxFailures;
    stopPeriodicRefresh(): void;
    enablePeriodicRefresh(): void;
    disablePeriodicRefresh(): void;
    isRefreshEnabled(): boolean;
    getRefreshInterval(): number;
    setRefreshInterval(intervalMs: number): void;
    private refreshAssetMaps;
    getExchangeName(internalName: string): Promise<string | undefined>;
    getAssetIndex(assetSymbol: string): Promise<number | undefined>;
    getAllAssets(): Promise<{
        perp: string[];
        spot: string[];
    }>;
    convertSymbol(symbol: string, mode?: string, symbolMode?: string): Promise<string>;
    convertSymbolsInObject(obj: any, symbolsFields?: Array<string>, symbolMode?: string): Promise<any>;
    convertToNumber(value: any): any;
    convertResponse(response: any, symbolsFields?: string[], symbolMode?: string): Promise<any>;
}

declare class SpotInfoAPI {
    private httpApi;
    private symbolConversion;
    constructor(httpApi: HttpApi, symbolConversion: SymbolConversion);
    getSpotMeta(rawResponse?: boolean): Promise<SpotMeta>;
    getSpotClearinghouseState(user: string, rawResponse?: boolean): Promise<SpotClearinghouseState>;
    getSpotMetaAndAssetCtxs(rawResponse?: boolean): Promise<SpotMetaAndAssetCtxs>;
    getTokenDetails(tokenId: string, rawResponse?: boolean): Promise<any>;
    getSpotDeployState(user: string, rawResponse?: boolean): Promise<any>;
}

declare class PerpetualsInfoAPI {
    private httpApi;
    private symbolConversion;
    private parent;
    constructor(httpApi: HttpApi, symbolConversion: SymbolConversion, parent: Hyperliquid);
    getMeta(rawResponse?: boolean): Promise<Meta>;
    getMetaAndAssetCtxs(rawResponse?: boolean): Promise<MetaAndAssetCtxs>;
    getClearinghouseState(user: string, rawResponse?: boolean): Promise<ClearinghouseState>;
    getUserFunding(user: string, startTime: number, endTime?: number, rawResponse?: boolean): Promise<UserFunding>;
    getUserNonFundingLedgerUpdates(user: string, startTime: number, endTime?: number, rawResponse?: boolean): Promise<UserNonFundingLedgerUpdates>;
    getFundingHistory(coin: string, startTime: number, endTime?: number, rawResponse?: boolean): Promise<FundingHistory>;
    getPredictedFundings(rawResponse?: boolean): Promise<PredictedFundings>;
    getPerpsAtOpenInterestCap(rawResponse?: boolean): Promise<PerpsAtOpenInterestCap>;
    getPerpDexLimits(dex: string, rawResponse?: boolean): Promise<PerpDexLimits>;
}

declare class InfoAPI {
    spot: SpotInfoAPI;
    perpetuals: PerpetualsInfoAPI;
    private httpApi;
    private generalAPI;
    private symbolConversion;
    private parent;
    constructor(baseURL: string, rateLimiter: RateLimiter, symbolConversion: SymbolConversion, parent: Hyperliquid);
    getAssetIndex(assetName: string): Promise<number | undefined>;
    getInternalName(exchangeName: string): Promise<string | undefined>;
    getAllAssets(): Promise<{
        perp: string[];
        spot: string[];
    }>;
    getAllMids(rawResponse?: boolean): Promise<AllMids>;
    getUserOpenOrders(user: string, rawResponse?: boolean): Promise<UserOpenOrders>;
    getFrontendOpenOrders(user: string, rawResponse?: boolean): Promise<FrontendOpenOrders>;
    getUserFills(user: string, rawResponse?: boolean): Promise<UserFills>;
    getUserFillsByTime(user: string, startTime: number, endTime: number, rawResponse?: boolean): Promise<UserFills>;
    getUserRateLimit(user: string, rawResponse?: boolean): Promise<UserRateLimit>;
    getOrderStatus(user: string, oid: number | string, rawResponse?: boolean): Promise<OrderStatus>;
    getL2Book(coin: string, rawResponse?: boolean, nSigFigs?: number, mantissa?: number): Promise<L2Book>;
    getCandleSnapshot(coin: string, interval: string, startTime: number, endTime: number, rawResponse?: boolean): Promise<CandleSnapshot>;
    getMaxBuilderFee(user: string, builder: string, rawResponse?: boolean): Promise<number>;
    getHistoricalOrders(user: string, rawResponse?: boolean): Promise<HistoricalOrder[]>;
    getUserTwapSliceFills(user: string, rawResponse?: boolean): Promise<TwapSliceFill[]>;
    getSubAccounts(user: string, rawResponse?: boolean): Promise<SubAccount[]>;
    getVaultDetails(vaultAddress: string, user?: string, rawResponse?: boolean): Promise<VaultDetails>;
    getUserVaultEquities(user: string, rawResponse?: boolean): Promise<VaultEquity[]>;
    getUserRole(user: string, rawResponse?: boolean): Promise<UserRole>;
    getDelegations(user: string, rawResponse?: boolean): Promise<Delegation[]>;
    getDelegatorSummary(user: string, rawResponse?: boolean): Promise<DelegatorSummary>;
    getDelegatorHistory(user: string, rawResponse?: boolean): Promise<DelegatorHistoryEntry[]>;
    getDelegatorRewards(user: string, rawResponse?: boolean): Promise<DelegatorReward[]>;
    validatorSummaries(rawResponse?: boolean): Promise<ValidatorSummary[]>;
    vaultSummaries(rawResponse?: boolean): Promise<VaultSummary[]>;
    userFees(user: string, rawResponse?: boolean): Promise<UserFees>;
    portfolio(user: string, rawResponse?: boolean): Promise<PortfolioPeriods>;
    preTransferCheck(user: string, source: string, rawResponse?: boolean): Promise<PreTransferCheck>;
    referral(user: string, rawResponse?: boolean): Promise<Referral>;
    extraAgents(user: string, rawResponse?: boolean): Promise<ExtraAgent[]>;
    isVip(user: string, rawResponse?: boolean): Promise<boolean>;
    legalCheck(user: string, rawResponse?: boolean): Promise<LegalCheck>;
    userTwapSliceFillsByTime(user: string, startTime: number, endTime?: number, aggregateByTime?: boolean, rawResponse?: boolean): Promise<TwapSliceFill[]>;
    twapHistory(user: string, rawResponse?: boolean): Promise<TwapHistory[]>;
    userToMultiSigSigners(user: string, rawResponse?: boolean): Promise<MultiSigSigners | null>;
    getBuilderFeeApproval(user: string, builderAddress: string, rawResponse?: boolean): Promise<BuilderFeeApproval>;
    getUserOrderHistory(user: string, startTime: number, endTime?: number, rawResponse?: boolean): Promise<UserOrderHistory>;
}

declare function orderTypeToWire(orderType: OrderType): OrderType;
declare function signL1Action(wallet: Wallet | HDNodeWallet, action: unknown, activePool: string | null, nonce: number, isMainnet: boolean): Promise<Signature>;
declare function signUserSignedAction(wallet: Wallet, action: any, payloadTypes: Array<{
    name: string;
    type: string;
}>, primaryType: string, isMainnet: boolean): Promise<Signature>;
declare function signUsdTransferAction(wallet: Wallet, action: any, isMainnet: boolean): Promise<Signature>;
declare function signWithdrawFromBridgeAction(wallet: Wallet, action: any, isMainnet: boolean): Promise<Signature>;
declare function signAgent(wallet: Wallet, action: any, isMainnet: boolean): Promise<Signature>;
declare function floatToWire(x: number): string;
/**
 * Removes trailing zeros from a string representation of a number.
 * This is useful when working with price and size fields directly.
 *
 * Hyperliquid API requires that price ('p') and size ('s') fields do not contain trailing zeros.
 * For example, "12345.0" should be "12345" and "0.123450" should be "0.12345".
 * This function ensures that all numeric string values are properly formatted.
 *
 * @param value - The string value to normalize
 * @returns The normalized string without trailing zeros
 */
declare function removeTrailingZeros(value: string): string;
declare function floatToIntForHashing(x: number): number;
declare function floatToUsdInt(x: number): number;
declare function getTimestampMs(): number;
declare function orderToWire(order: Order | OrderRequest, asset: number): OrderWire;
declare function orderWireToAction(orders: OrderWire[], grouping?: Grouping, builder?: Builder): any;
/**
 * Normalizes an object by removing trailing zeros from price ('p') and size ('s') fields.
 * This is useful when working with actions that contain these fields.
 *
 * Hyperliquid API requires that price ('p') and size ('s') fields do not contain trailing zeros.
 * This function recursively processes an object and its nested properties to ensure all
 * price and size fields are properly formatted according to API requirements.
 *
 * This helps prevent the "L1 error: User or API Wallet 0x... does not exist" error
 * that can occur when trailing zeros are present in these fields.
 *
 * @param obj - The object to normalize
 * @returns A new object with normalized price and size fields
 */
declare function normalizeTrailingZeros<T>(obj: T): T;
interface CancelOrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            statuses: string[];
        };
    };
}
declare function cancelOrderToAction(cancelRequest: CancelOrderRequest): any;

declare class ExchangeAPI {
    private info;
    private wallet;
    private httpApi;
    private symbolConversion;
    private IS_MAINNET;
    private walletAddress;
    private _i;
    private parent;
    private vaultAddress;
    private nonceCounter;
    private lastNonceTimestamp;
    constructor(testnet: boolean, privateKey: string, info: InfoAPI, rateLimiter: RateLimiter, symbolConversion: SymbolConversion, walletAddress: string | null | undefined, parent: Hyperliquid, vaultAddress?: string | null);
    private getVaultAddress;
    private getAssetIndex;
    placeOrder(orderRequest: OrderRequest | Order | BulkOrderRequest): Promise<any>;
    cancelOrder(cancelRequests: CancelOrderRequest | CancelOrderRequest[]): Promise<CancelOrderResponse>;
    cancelOrderByCloid(symbol: string, cloid: string): Promise<any>;
    modifyOrder(oid: number | string, orderRequest: Order): Promise<any>;
    batchModifyOrders(modifies: Array<{
        oid: number | string;
        order: Order;
    }>): Promise<any>;
    updateLeverage(symbol: string, leverageMode: string, leverage: number): Promise<any>;
    updateIsolatedMargin(symbol: string, isBuy: boolean, ntli: number): Promise<any>;
    usdTransfer(destination: string, amount: number): Promise<any>;
    /**
     * Transfer SPOT assets to another wallet (doesn't touch bridge, so no fees)
     * @param destination - Destination wallet address
     * @param token - Token in format "TOKEN_NAME:TOKEN_ADDRESS" (e.g., "PURR:0xeb62eee3685fc4c43992febcd9e75443")
     * @param amount - Amount to transfer as string
     * @returns Promise with transfer result
     *
     * @example
     * // Get available tokens first
     * const spotMeta = await sdk.info.spot.getSpotMeta();
     * const purrToken = spotMeta.tokens.find(t => t.name === 'PURR');
     * const tokenFormat = `${purrToken.name}:${purrToken.tokenId}`;
     *
     * // Transfer tokens
     * await sdk.exchange.spotTransfer(
     *   '0x1234567890123456789012345678901234567890',
     *   tokenFormat, // "PURR:0xeb62eee3685fc4c43992febcd9e75443"
     *   '1.0'
     * );
     */
    spotTransfer(destination: string, token: string, amount: string): Promise<any>;
    initiateWithdrawal(destination: string, amount: number): Promise<any>;
    /**
     * Generate a payload for placing an order that can be used with WebSocket POST requests
     * @param orderRequest Order parameters
     * @returns A signed payload that can be used with WebSocket POST requests
     */
    getOrderPayload(orderRequest: OrderRequest | Order | BulkOrderRequest): Promise<any>;
    /**
     * Generate a payload for canceling an order that can be used with WebSocket POST requests
     * @param cancelRequests Cancel order parameters
     * @returns A signed payload that can be used with WebSocket POST requests
     */
    getCancelOrderPayload(cancelRequests: CancelOrderRequest | CancelOrderRequest[]): Promise<any>;
    /**
     * Generate a payload for canceling all orders that can be used with WebSocket POST requests
     * @returns A signed payload that can be used with WebSocket POST requests
     */
    getCancelAllPayload(): Promise<any>;
    transferBetweenSpotAndPerp(usdc: number, toPerp: boolean): Promise<any>;
    scheduleCancel(time: number | null): Promise<any>;
    vaultTransfer(vaultAddress: string, isDeposit: boolean, usd: number): Promise<any>;
    createVault(name: string, description: string, initialUsd: number): Promise<CreateVaultResponse>;
    vaultDistribute(vaultAddress: string, usd: number): Promise<any>;
    vaultModify(vaultAddress: string, allowDeposits: boolean | null, alwaysCloseOnWithdraw: boolean | null): Promise<any>;
    setReferrer(code?: string): Promise<any>;
    registerReferrer(code: string): Promise<any>;
    modifyUserEvm(usingBigBlocks: boolean): Promise<any>;
    placeTwapOrder(orderRequest: TwapOrder): Promise<TwapOrderResponse>;
    cancelTwapOrder(cancelRequest: TwapCancelRequest): Promise<TwapCancelResponse>;
    approveAgent(request: ApproveAgentRequest): Promise<any>;
    approveBuilderFee(request: ApproveBuilderFeeRequest): Promise<any>;
    claimRewards(): Promise<ClaimRewardsResponse>;
    createSubAccount(name: string): Promise<CreateSubAccountResponse>;
    setDisplayName(displayName: string): Promise<SetDisplayNameResponse>;
    spotUser(optOut: boolean): Promise<SpotUserResponse>;
    cDeposit(wei: bigint): Promise<CDepositResponse>;
    cWithdraw(wei: bigint): Promise<CWithdrawResponse>;
    tokenDelegate(validator: string, isUndelegate: boolean, wei: bigint): Promise<TokenDelegateResponse>;
    subAccountSpotTransfer(subAccountUser: string, isDeposit: boolean, token: number, amount: string): Promise<SubAccountSpotTransferResponse>;
    /**
     * Reserve additional actions for 0.0005 USDC per request instead of trading to increase rate limits
     * @param weight The weight to reserve (as a number)
     * @returns Response indicating success or failure
     */
    reserveRequestWeight(weight: number): Promise<ReserveRequestWeightResponse>;
    subAccountTransfer(subAccountUser: string, isDeposit: boolean, usd: number): Promise<SubAccountTransferResponse>;
    /**
     * Invalidate pending nonce (noop)
     * This endpoint can be used to invalidate pending nonces
     * @returns Response indicating success or failure
     */
    noop(): Promise<NoopResponse>;
    /**
     * Generates a unique nonce by using the current timestamp in milliseconds
     * If multiple calls happen in the same millisecond, it ensures the nonce is still increasing
     * @returns A unique nonce value
     */
    private generateUniqueNonce;
}

declare class WebSocketClient {
    private ws;
    private url;
    private pingInterval;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private initialReconnectDelay;
    private maxReconnectDelay;
    private eventHandlers;
    private WebSocketImpl;
    private connected;
    private connecting;
    private connectionPromise;
    private subscriptionCount;
    private lastPongReceived;
    private manualDisconnect;
    private readonly MAX_SUBSCRIPTIONS;
    constructor(testnet?: boolean, maxReconnectAttempts?: number);
    isConnected(): boolean;
    connect(): Promise<void>;
    private reconnect;
    private startPingInterval;
    private stopPingInterval;
    sendMessage(message: any): void;
    close(manualDisconnect?: boolean): void;
    on(event: string, handler: Function): void;
    removeListener(event: string, handler: Function): void;
    removeAllListeners(event?: string): void;
    private emit;
    incrementSubscriptionCount(): boolean;
    decrementSubscriptionCount(): void;
    getSubscriptionCount(): number;
}

declare class WebSocketSubscriptions {
    private ws;
    private symbolConversion;
    private activeSubscriptions;
    private subscriptionDetails;
    constructor(ws: WebSocketClient, symbolConversion: SymbolConversion);
    private getSubscriptionKey;
    private addSubscriptionCallback;
    private removeSubscriptionCallback;
    private subscribe;
    private unsubscribe;
    private handleMessage;
    subscribeToAllMids(callback: (data: AllMids) => void): Promise<void>;
    subscribeToNotification(user: string, callback: (data: Notification & {
        user: string;
    }) => void): Promise<void>;
    subscribeToWebData2(user: string, callback: (data: WebData2) => void): Promise<void>;
    subscribeToCandle(coin: string, interval: string, callback: (data: Candle) => void): Promise<void>;
    subscribeToL2Book(coin: string, callback: (data: WsBook & {
        coin: string;
    }) => void): Promise<void>;
    subscribeToTrades(coin: string, callback: (data: any) => void): Promise<void>;
    subscribeToOrderUpdates(user: string, callback: (data: WsOrder[] & {
        user: string;
    }) => void): Promise<void>;
    subscribeToUserEvents(user: string, callback: (data: WsUserEvent & {
        user: string;
    }) => void): Promise<void>;
    subscribeToUserFills(user: string, callback: (data: WsUserFills & {
        user: string;
    }) => void): Promise<void>;
    subscribeToUserFundings(user: string, callback: (data: WsUserFundings & {
        user: string;
    }) => void): Promise<void>;
    subscribeToUserNonFundingLedgerUpdates(user: string, callback: (data: WsUserNonFundingLedgerUpdates & {
        user: string;
    }) => void): Promise<void>;
    subscribeToUserActiveAssetData(user: string, coin: string, callback: (data: WsUserActiveAssetData & {
        user: string;
    }) => void): Promise<void>;
    /**
     * Send a POST request via WebSocket
     * @param requestType - The type of request ('info' or 'action')
     * @param payload - The payload to send with the request
     * @param timeout - Optional timeout in milliseconds (default: 30000)
     * @returns A promise that resolves with the response data
     */
    postRequest(requestType: 'info' | 'action', payload: any, timeout?: number): Promise<any>;
    unsubscribeFromAllMids(): Promise<void>;
    unsubscribeFromNotification(user: string): Promise<void>;
    unsubscribeFromWebData2(user: string): Promise<void>;
    unsubscribeFromCandle(coin: string, interval: string): Promise<void>;
    unsubscribeFromL2Book(coin: string): Promise<void>;
    unsubscribeFromTrades(coin: string): Promise<void>;
    unsubscribeFromOrderUpdates(user: string): Promise<void>;
    unsubscribeFromUserEvents(user: string): Promise<void>;
    unsubscribeFromUserFills(user: string): Promise<void>;
    unsubscribeFromUserFundings(user: string): Promise<void>;
    unsubscribeFromUserNonFundingLedgerUpdates(user: string): Promise<void>;
    unsubscribeFromUserActiveAssetData(user: string, coin: string): Promise<void>;
    subscribeToActiveAssetCtx(coin: string, callback: (data: WsActiveAssetCtx) => void): Promise<void>;
    subscribeToActiveSpotAssetCtx(coin: string, callback: (data: WsActiveSpotAssetCtx) => void): Promise<void>;
    subscribeToUserTwapSliceFills(user: string, callback: (data: WsTwapSliceFill & {
        user: string;
    }) => void): Promise<void>;
    subscribeToBbo(coin: string, callback: (data: WsBbo) => void): Promise<void>;
    subscribeToUserTwapHistory(user: string, callback: (data: WsTwapHistoryResponse) => void): Promise<void>;
    unsubscribeFromActiveAssetCtx(coin: string): Promise<void>;
    unsubscribeFromActiveSpotAssetCtx(coin: string): Promise<void>;
    unsubscribeFromUserTwapSliceFills(user: string): Promise<void>;
    unsubscribeFromBbo(coin: string): Promise<void>;
    unsubscribeFromUserTwapHistory(user: string): Promise<void>;
    /**
     * Resubscribes to all active subscriptions after a WebSocket reconnection
     */
    resubscribeAll(): Promise<void>;
}

declare class CustomOperations {
    private exchange;
    private infoApi;
    private wallet?;
    private symbolConversion;
    private walletAddress;
    private parent?;
    constructor(exchangeOrParent: ExchangeAPI | Hyperliquid, infoApiOrPrivateKey?: InfoAPI | string, privateKeyOrSymbolConversion?: string | SymbolConversion, symbolConversionOrWalletAddress?: SymbolConversion | string | null, walletAddress?: string | null);
    private getUserAddress;
    cancelAllOrders(symbol?: string): Promise<CancelOrderResponse>;
    getAllAssets(): Promise<{
        perp: string[];
        spot: string[];
    }>;
    private DEFAULT_SLIPPAGE;
    private getSlippagePrice;
    marketOpen(symbol: string, isBuy: boolean, size: number, px?: number, slippage?: number, cloid?: string): Promise<OrderResponse>;
    marketClose(symbol: string, size?: number, px?: number, slippage?: number, cloid?: string): Promise<OrderResponse>;
    closeAllPositions(slippage?: number): Promise<OrderResponse[]>;
}

/**
 * WebSocket Payload Manager
 *
 * This module provides a high-level interface for generating and sending
 * exchange method payloads via WebSocket POST requests. It integrates with
 * the dynamic payload generator and WebSocket subscriptions.
 */

interface PayloadManagerConfig {
    wallet: ethers.Wallet;
    isMainnet: boolean;
    symbolConversion: SymbolConversion;
    subscriptions: WebSocketSubscriptions;
    vaultAddress?: string | null;
    generateNonce: () => number;
    customOperations: CustomOperations;
}
/**
 * WebSocket Payload Manager
 * Provides a unified interface for all exchange operations via WebSocket POST
 */
declare class WebSocketPayloadManager {
    private payloadGenerator;
    private subscriptions;
    private symbolConversion;
    private vaultAddress;
    private customOperations;
    constructor(config: PayloadManagerConfig);
    /**
     * Get asset index for a coin symbol
     */
    private getAssetIndex;
    /**
     * Execute any exchange method via WebSocket POST
     * @param methodName The exchange method name
     * @param params The method parameters
     * @param timeout Optional timeout in milliseconds
     * @returns The response from the WebSocket POST request
     */
    executeMethod(methodName: string, params: any, timeout?: number): Promise<any>;
    /**
     * Place an order via WebSocket POST
     */
    placeOrder(orderParams: {
        coin: string;
        is_buy: boolean;
        sz: string | number;
        limit_px: string | number;
        order_type: any;
        reduce_only: boolean;
        cloid?: string;
    }): Promise<any>;
    /**
     * Place multiple orders via WebSocket POST
     */
    placeOrders(orders: any[], grouping?: string): Promise<any>;
    /**
     * Cancel an order via WebSocket POST
     */
    cancelOrder(cancelParams: {
        coin: string;
        o: number | string;
    }): Promise<any>;
    /**
     * Cancel multiple orders via WebSocket POST
     */
    cancelOrders(cancels: any[]): Promise<any>;
    /**
     * Cancel all orders via WebSocket POST
     * This is a custom composite operation that uses native methods
     */
    cancelAllOrders(): Promise<any>;
    /**
     * Modify an order via WebSocket POST
     */
    modifyOrder(modifyParams: {
        oid: number | string;
        order: any;
    }): Promise<any>;
    /**
     * Transfer between spot and perp wallets via WebSocket POST
     */
    transferBetweenSpotAndPerp(amount: number, toPerp: boolean): Promise<any>;
    /**
     * Transfer USDC to another address via WebSocket POST
     */
    usdTransfer(destination: string, amount: number): Promise<any>;
    /**
     * Transfer spot tokens to another address via WebSocket POST
     */
    spotTransfer(destination: string, token: string, amount: string): Promise<any>;
    /**
     * Transfer to/from vault via WebSocket POST
     */
    vaultTransfer(vaultAddress: string, isDeposit: boolean, usd: number): Promise<any>;
    /**
     * Approve an agent via WebSocket POST
     */
    approveAgent(agentAddress: string, agentName: string): Promise<any>;
    /**
     * Approve builder fee via WebSocket POST
     */
    approveBuilderFee(builder: string, maxFeeRate: string): Promise<any>;
    /**
     * Initiate withdrawal via WebSocket POST
     */
    initiateWithdrawal(destination: string, amount: number): Promise<any>;
    /**
     * Place TWAP order via WebSocket POST
     */
    placeTwapOrder(twapParams: {
        coin: string;
        is_buy: boolean;
        sz: number;
        reduce_only: boolean;
        minutes: number;
        randomize: boolean;
    }): Promise<any>;
    /**
     * Schedule cancel via WebSocket POST
     */
    scheduleCancel(time: number | null): Promise<any>;
    /**
     * Deposit into staking via WebSocket POST
     */
    cDeposit(wei: bigint): Promise<any>;
    /**
     * Withdraw from staking via WebSocket POST
     */
    cWithdraw(wei: bigint): Promise<any>;
    /**
     * Market buy/sell via WebSocket POST
     * This is a custom composite operation that uses native methods
     */
    marketOpen(symbol: string, isBuy: boolean, size: number, px?: number, slippage?: number, cloid?: string): Promise<any>;
    /**
     * Market close position via WebSocket POST
     * This is a custom composite operation that uses native methods
     */
    marketClose(symbol: string, size?: number, px?: number, slippage?: number, cloid?: string): Promise<any>;
    /**
     * Close all positions via WebSocket POST
     * This is a custom composite operation that uses native methods
     */
    closeAllPositions(slippage?: number): Promise<any>;
    /**
     * Get all available exchange methods
     */
    getAvailableMethods(): string[];
    /**
     * Check if a method is supported
     */
    isMethodSupported(methodName: string): boolean;
    /**
     * Execute a custom method with raw parameters
     * Useful for methods not yet wrapped in convenience functions
     */
    executeCustomMethod(methodName: string, params: any, timeout?: number): Promise<any>;
    /**
     * Generate payload without executing (for testing/debugging)
     */
    generatePayload(methodName: string, params: any): Promise<any>;
    /**
     * Update vault address
     */
    setVaultAddress(vaultAddress: string | null): void;
    /**
     * Get current vault address
     */
    getVaultAddress(): string | null;
}

declare const BASE_URLS: {
    PRODUCTION: string;
    TESTNET: string;
};
declare const WSS_URLS: {
    PRODUCTION: string;
    TESTNET: string;
};
declare const CHAIN_IDS: {
    ARBITRUM_MAINNET: string;
    ARBITRUM_TESTNET: string;
};
declare const ENDPOINTS: {
    INFO: string;
    EXCHANGE: string;
};
declare enum InfoType {
    ALL_MIDS = "allMids",
    META = "meta",
    OPEN_ORDERS = "openOrders",
    FRONTEND_OPEN_ORDERS = "frontendOpenOrders",
    USER_FILLS = "userFills",
    USER_FILLS_BY_TIME = "userFillsByTime",
    USER_RATE_LIMIT = "userRateLimit",
    ORDER_STATUS = "orderStatus",
    L2_BOOK = "l2Book",
    CANDLE_SNAPSHOT = "candleSnapshot",
    PERPS_META_AND_ASSET_CTXS = "metaAndAssetCtxs",
    PERPS_CLEARINGHOUSE_STATE = "clearinghouseState",
    USER_FUNDING = "userFunding",
    USER_NON_FUNDING_LEDGER_UPDATES = "userNonFundingLedgerUpdates",
    FUNDING_HISTORY = "fundingHistory",
    SPOT_META = "spotMeta",
    SPOT_CLEARINGHOUSE_STATE = "spotClearinghouseState",
    SPOT_META_AND_ASSET_CTXS = "spotMetaAndAssetCtxs",
    PREDICTED_FUNDINGS = "predictedFundings",
    SPOT_DEPLOY_STATE = "spotDeployState",
    TOKEN_DETAILS = "tokenDetails",
    MAX_BUILDER_FEE = "maxBuilderFee",
    HISTORICAL_ORDERS = "historicalOrders",
    USER_TWAP_SLICE_FILLS = "userTwapSliceFills",
    SUB_ACCOUNTS = "subAccounts",
    VAULT_DETAILS = "vaultDetails",
    USER_VAULT_EQUITIES = "userVaultEquities",
    USER_ROLE = "userRole",
    DELEGATIONS = "delegations",
    DELEGATOR_SUMMARY = "delegatorSummary",
    PERPS_AT_OPEN_INTEREST_CAP = "perpsAtOpenInterestCap",
    DELEGATOR_HISTORY = "delegatorHistory",
    DELEGATOR_REWARDS = "delegatorRewards",
    VALIDATOR_SUMMARIES = "validatorSummaries",
    VAULT_SUMMARIES = "vaultSummaries",
    BLOCK_DETAILS = "blockDetails",
    TX_DETAILS = "txDetails",
    USER_DETAILS = "userDetails",
    USER_FEES = "userFees",
    PORTFOLIO = "portfolio",
    PRE_TRANSFER_CHECK = "preTransferCheck",
    REFERRAL = "referral",
    EXTRA_AGENTS = "extraAgents",
    IS_VIP = "isVip",
    LEGAL_CHECK = "legalCheck",
    USER_TWAP_SLICE_FILLS_BY_TIME = "userTwapSliceFillsByTime",
    TWAP_HISTORY = "twapHistory",
    USER_TO_MULTI_SIG_SIGNERS = "userToMultiSigSigners",
    BUILDER_FEE_APPROVAL = "builderFeeApproval",
    USER_ORDER_HISTORY = "userOrderHistory",
    PERP_DEX_LIMITS = "perpDexLimits"
}
declare enum ExchangeType {
    ORDER = "order",
    CANCEL = "cancel",
    CANCEL_BY_CLOID = "cancelByCloid",
    SCHEDULE_CANCEL = "scheduleCancel",
    MODIFY = "modify",
    BATCH_MODIFY = "batchModify",
    UPDATE_LEVERAGE = "updateLeverage",
    UPDATE_ISOLATED_MARGIN = "updateIsolatedMargin",
    USD_SEND = "usdSend",
    SPOT_SEND = "spotSend",
    WITHDRAW = "withdraw3",
    SPOT_USER = "spotUser",
    VAULT_TRANSFER = "vaultTransfer",
    CREATE_VAULT = "createVault",
    VAULT_DISTRIBUTE = "vaultDistribute",
    VAULT_MODIFY = "vaultModify",
    SET_REFERRER = "setReferrer",
    REGISTER_REFERRER = "registerReferrer",
    USD_CLASS_TRANSFER = "usdClassTransfer",
    TWAP_ORDER = "twapOrder",
    TWAP_CANCEL = "twapCancel",
    APPROVE_AGENT = "approveAgent",
    APPROVE_BUILDER_FEE = "approveBuilderFee",
    EVM_USER_MODIFY = "evmUserModify",
    CLAIM_REWARDS = "claimRewards",
    CREATE_SUB_ACCOUNT = "createSubAccount",
    SET_DISPLAY_NAME = "setDisplayName",
    C_DEPOSIT = "cDeposit",
    C_WITHDRAW = "cWithdraw",
    TOKEN_DELEGATE = "tokenDelegate",
    SUB_ACCOUNT_SPOT_TRANSFER = "subAccountSpotTransfer",
    SUB_ACCOUNT_TRANSFER = "subAccountTransfer",
    RESERVE_REQUEST_WEIGHT = "reserveRequestWeight",
    NOOP = "noop"
}
declare const WEBSOCKET: {
    MAINNET_URL: string;
    TESTNET_URL: string;
};
declare const SDK_CODE = "PLACEHOLDER";

interface HyperliquidConfig {
    enableWs?: boolean;
    privateKey?: string;
    testnet?: boolean;
    walletAddress?: string;
    vaultAddress?: string;
    maxReconnectAttempts?: number;
    disableAssetMapRefresh?: boolean;
    assetMapRefreshIntervalMs?: number;
}
declare class Hyperliquid {
    info: InfoAPI;
    exchange: ExchangeAPI;
    ws: WebSocketClient;
    subscriptions: WebSocketSubscriptions;
    wsPayloads: WebSocketPayloadManager;
    custom: CustomOperations;
    symbolConversion: SymbolConversion;
    private rateLimiter;
    private isValidPrivateKey;
    private walletAddress;
    private _initialized;
    private _initializing;
    private _privateKey?;
    private _walletAddress?;
    private vaultAddress?;
    private enableWs;
    private baseUrl;
    private testnet;
    constructor(params?: HyperliquidConfig);
    connect(): Promise<void>;
    private initialize;
    ensureInitialized(): Promise<void>;
    private initializePrivateKey;
    private createAuthenticatedProxy;
    private initializeWithPrivateKey;
    isAuthenticated(): boolean;
    isWebSocketConnected(): boolean;
    isWebSocketEnabled(): boolean;
    disconnect(): void;
    getBaseUrl(): string;
    getRateLimiter(): RateLimiter;
    enableAssetMapRefresh(): void;
    disableAssetMapRefresh(): void;
    isAssetMapRefreshEnabled(): boolean;
    getAssetMapRefreshInterval(): number;
    setAssetMapRefreshInterval(intervalMs: number): void;
    refreshAssetMapsNow(): Promise<void>;
}

export { type AllMids, type ApproveAgentRequest, type ApproveBuilderFeeRequest, type AssetCtx, BASE_URLS, type BlockDetails, type BlockDetailsResponse, type Builder, type BuilderFeeApproval, type BulkOrderRequest, type CDepositResponse, CHAIN_IDS, type CWithdrawResponse, type CancelByCloidRequest, type CancelOrderRequest, type CancelOrderRequests, type CancelOrderResponse, type Candle, type CandleSnapshot, type ClaimRewardsResponse, type ClearinghouseState, type Cloid, type CreateSubAccountResponse, type CreateVaultRequest, type CreateVaultResponse, type Delegation, type DelegatorHistoryEntry, type DelegatorReward, type DelegatorSummary, ENDPOINTS, ExchangeType, type ExtraAgent, type FrontendOpenOrders, type FundingHistory, type FundingHistoryEntry, type Grouping, type HistoricalOrder, Hyperliquid, type HyperliquidConfig, InfoType, type L2Book, type LegalCheck, type Leverage, type LimitOrder, type Meta, type MetaAndAssetCtxs, type ModifyRequest, type ModifyWire, type MultiOrder, type MultiSigSigners, type NoopResponse, type Notification, type OidOrCloid, type Order, type OrderRequest, type OrderResponse, type OrderStatus, type OrderType, type OrderWire, type PerpDexLimits, type PerpsAtOpenInterestCap, type Portfolio, type PortfolioPeriodData, type PortfolioPeriods, type PreTransferCheck, type PredictedFunding, type PredictedFundings, type Referral, type ReserveRequestWeightRequest, type ReserveRequestWeightResponse, SDK_CODE, type ScheduleCancelAction, type SetDisplayNameResponse, type Signature, type SpotAssetCtx, type SpotClearinghouseState, type SpotDeployState, type SpotMarket, type SpotMeta, type SpotMetaAndAssetCtxs, type SpotToken, type SpotUserResponse, type SubAccount, type SubAccountSpotTransferResponse, type SubAccountTransferResponse, type Tif, type TokenDelegateResponse, type TokenDetails, type TriggerOrder, type TriggerType, type TwapCancelRequest, type TwapCancelResponse, type TwapHistory, type TwapOrder, type TwapOrderResponse, type TwapSliceFill, type TwapState, type TwapStatus, type TxDetails, type TxDetailsResponse, type UserDetailsResponse, type UserFees, type UserFills, type UserFunding, type UserFundingDelta, type UserFundingEntry, type UserNonFundingLedgerDelta, type UserNonFundingLedgerEntry, type UserNonFundingLedgerUpdates, type UserOpenOrder, type UserOpenOrders, type UserOrderHistory, type UserOrderHistoryEntry, type UserRateLimit, type UserRole, type ValidatorStats, type ValidatorSummary, type VaultDetails, type VaultDistributeRequest, type VaultEquity, type VaultFollower, type VaultModifyRequest, type VaultRelationship, type VaultSummary, type VenueFunding, WEBSOCKET, WSS_URLS, type WebData2, type WsActiveAssetCtx, type WsActiveSpotAssetCtx, type WsBbo, type WsBook, type WsFill, type WsLevel, type WsLiquidation, type WsNonUserCancel, type WsOrder, type WsTrade, type WsTwapHistory, type WsTwapHistoryResponse, type WsTwapSliceFill, type WsTwapState, type WsTwapStatus, type WsUserActiveAssetData, type WsUserEvent, type WsUserFill, type WsUserFills, type WsUserFunding, type WsUserFundings, type WsUserNonFundingLedgerUpdate, type WsUserNonFundingLedgerUpdates, cancelOrderToAction, floatToIntForHashing, floatToUsdInt, floatToWire, getTimestampMs, normalizeTrailingZeros, orderToWire, orderTypeToWire, orderWireToAction, removeTrailingZeros, signAgent, signL1Action, signUsdTransferAction, signUserSignedAction, signWithdrawFromBridgeAction };
