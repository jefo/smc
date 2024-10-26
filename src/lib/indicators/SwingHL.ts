interface OHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

interface SwingHLResult {
    highLow: number | null; // 1 for swing high, -1 for swing low
    level: number | null;   // price level of the swing
}

/**
 * Calculates Swing Highs and Lows
 * A swing high is when the current high is the highest high out of the swingLength amount of candles before and after.
 * A swing low is when the current low is the lowest low out of the swingLength amount of candles before and after.
 * 
 * @param ohlc Array of OHLC data
 * @param swingLength Number of candles to look back and forward
 * @returns Array of Swing High/Low results
 */
export function calculateSwingHL(ohlc: OHLC[], swingLength: number = 50): SwingHLResult[] {
    const results: SwingHLResult[] = new Array(ohlc.length).fill(null).map(() => ({
        highLow: null,
        level: null
    }));

    // Find swing points
    for (let i = swingLength; i < ohlc.length - swingLength; i++) {
        let isHigh = true;
        let isLow = true;

        // Check if current point is a swing high
        for (let j = i - swingLength; j <= i + swingLength; j++) {
            if (j === i) continue;
            if (ohlc[j].high > ohlc[i].high) {
                isHigh = false;
                break;
            }
        }

        // Check if current point is a swing low
        for (let j = i - swingLength; j <= i + swingLength; j++) {
            if (j === i) continue;
            if (ohlc[j].low < ohlc[i].low) {
                isLow = false;
                break;
            }
        }

        if (isHigh) {
            results[i].highLow = 1;
            results[i].level = ohlc[i].high;
        } else if (isLow) {
            results[i].highLow = -1;
            results[i].level = ohlc[i].low;
        }
    }

    return results;
}
