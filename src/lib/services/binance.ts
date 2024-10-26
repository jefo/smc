export interface KlineData {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
    quoteVolume: number;
    trades: number;
    takerBuyBaseVolume: number;
    takerBuyQuoteVolume: number;
}

/**
 * Получает kline данные с Binance API
 * @param symbol Торговая пара (например 'BTCUSDT')
 * @param interval Интервал ('1m', '5m', '15m', '1h', '4h', '1d')
 * @param limit Количество свечей (max 1000)
 */
export async function fetchKlines(
    symbol: string,
    interval: string,
    limit: number = 1000
): Promise<KlineData[]> {
    const url = `https://api.binance.com/api/v3/uiKlines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        return data.map((item: any[]) => ({
            openTime: item[0],
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
            closeTime: item[6],
            quoteVolume: parseFloat(item[7]),
            trades: item[8],
            takerBuyBaseVolume: parseFloat(item[9]),
            takerBuyQuoteVolume: parseFloat(item[10])
        }));
    } catch (error) {
        console.error('Error fetching klines:', error);
        throw error;
    }
}
