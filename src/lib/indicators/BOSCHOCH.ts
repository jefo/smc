import type { OHLC } from '../types';
import { calculateSwingHL } from './SwingHL';

interface BOSCHOCHResult {
    bos: number | null;      // 1 for bullish BOS, -1 for bearish BOS
    choch: number | null;    // 1 for bullish CHoCH, -1 for bearish CHoCH
    level: number | null;    // price level
    brokenIndex: number | null; // index when the level was broken
}

/**
 * Calculates Break of Structure (BOS) and Change of Character (CHoCH)
 * These are both indications of market structure changing
 * 
 * @param ohlc Array of OHLC data
 * @param swingLength Length for swing high/low calculation
 * @param closeBreak If true, use close price for break detection
 * @returns Array of BOS/CHoCH results
 */
export function calculateBOSCHOCH(
    ohlc: OHLC[], 
    swingLength: number = 50,
    closeBreak: boolean = true
): BOSCHOCHResult[] {
    const results: BOSCHOCHResult[] = new Array(ohlc.length).fill(null).map(() => ({
        bos: null,
        choch: null,
        level: null,
        brokenIndex: null
    }));

    const swingResults = calculateSwingHL(ohlc, swingLength);
    
    let lastHigh = { index: -1, level: -Infinity };
    let lastLow = { index: -1, level: Infinity };

    // Analyze each point for BOS and CHoCH
    for (let i = 0; i < ohlc.length; i++) {
        const swing = swingResults[i];
        
        if (swing.highLow === 1) { // Swing High
            // Bullish BOS - пробой предыдущего максимума
            if (swing.level! > lastHigh.level) {
                results[i].bos = 1;
                results[i].level = lastHigh.level;
                results[i].brokenIndex = i;
            }
            lastHigh = { index: i, level: swing.level! };
        }
        else if (swing.highLow === -1) { // Swing Low
            // Bearish BOS - пробой предыдущего минимума
            if (swing.level! < lastLow.level) {
                results[i].bos = -1;
                results[i].level = lastLow.level;
                results[i].brokenIndex = i;
            }
            lastLow = { index: i, level: swing.level! };
        }

        // CHoCH detection
        if (i >= 3) {
            const swings = swingResults.slice(i - 3, i + 1)
                .filter(s => s.highLow !== null)
                .slice(-4);

            if (swings.length === 4) {
                const [s1, s2, s3, s4] = swings;

                // Bullish CHoCH
                if (s1.highLow === -1 && s2.highLow === 1 && s3.highLow === -1 && s4.highLow === 1 &&
                    s4.level! > s2.level! && s2.level! > s1.level! && s1.level! > s3.level!) {
                    results[i].choch = 1;
                    results[i].level = s2.level;
                }

                // Bearish CHoCH
                if (s1.highLow === 1 && s2.highLow === -1 && s3.highLow === 1 && s4.highLow === -1 &&
                    s4.level! < s2.level! && s2.level! < s1.level! && s1.level! < s3.level!) {
                    results[i].choch = -1;
                    results[i].level = s2.level;
                }
            }
        }
    }

    return results;
}
