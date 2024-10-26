interface OHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

interface FVGResult {
    fvg: number | null;
    top: number | null; 
    bottom: number | null;
    mitigatedIndex: number | null;
}

/**
 * Calculates Fair Value Gap (FVG)
 * A fair value gap is when the previous high is lower than the next low if the current candle is bullish.
 * Or when the previous low is higher than the next high if the current candle is bearish.
 * 
 * @param ohlc Array of OHLC data
 * @param joinConsecutive If true, consecutive FVGs will be merged using highest top and lowest bottom
 * @returns Array of FVG results
 */
export function calculateFVG(ohlc: OHLC[], joinConsecutive: boolean = false): FVGResult[] {
    const results: FVGResult[] = new Array(ohlc.length).fill(null).map(() => ({
        fvg: null,
        top: null,
        bottom: null,
        mitigatedIndex: null
    }));

    for (let i = 1; i < ohlc.length - 1; i++) {
        const prevCandle = ohlc[i - 1];
        const currentCandle = ohlc[i];
        const nextCandle = ohlc[i + 1];
        const isBullish = currentCandle.close > currentCandle.open;

        // Check for bullish or bearish FVG
        if ((prevCandle.high < nextCandle.low && isBullish) || 
            (prevCandle.low > nextCandle.high && !isBullish)) {
            
            results[i].fvg = isBullish ? 1 : -1;
            results[i].top = isBullish ? nextCandle.low : prevCandle.low;
            results[i].bottom = isBullish ? prevCandle.high : nextCandle.high;
        }
    }

    // Join consecutive FVGs if requested
    if (joinConsecutive) {
        for (let i = 0; i < results.length - 1; i++) {
            if (results[i].fvg !== null && results[i].fvg === results[i + 1].fvg) {
                results[i + 1].top = Math.max(results[i].top!, results[i + 1].top!);
                results[i + 1].bottom = Math.min(results[i].bottom!, results[i + 1].bottom!);
                results[i].fvg = null;
                results[i].top = null;
                results[i].bottom = null;
            }
        }
    }

    // Calculate mitigation
    for (let i = 0; i < results.length; i++) {
        if (results[i].fvg !== null) {
            for (let j = i + 2; j < ohlc.length; j++) {
                if ((results[i].fvg === 1 && ohlc[j].low <= results[i].top!) ||
                    (results[i].fvg === -1 && ohlc[j].high >= results[i].bottom!)) {
                    results[i].mitigatedIndex = j;
                    break;
                }
            }
        }
    }

    return results;
}
