<script lang="ts">
    import { calculateSwingHL } from '../indicators/SwingHL';
    import type { OHLC } from '../types';

    export let data: OHLC[] = [];
    export let swingLength: number = 50;
    
    $: swingResults = calculateSwingHL(data, swingLength);
    
    // Вычисляем min/max для масштабирования
    $: yScale = {
        min: Math.min(...data.map(d => d.low)),
        max: Math.max(...data.map(d => d.high))
    };
</script>

<div class="swing-container">
    {#each swingResults as result, i}
        {#if result.highLow !== null && result.level !== null}
            <div 
                class="swing-point"
                class:high={result.highLow === 1}
                class:low={result.highLow === -1}
                style="
                    --y: {100 - ((result.level - yScale.min) / (yScale.max - yScale.min)) * 100}%;
                    --x: {(i / data.length) * 100}%;
                "
            >
                <div class="swing-line"></div>
            </div>
        {/if}
    {/each}
</div>

<style>
    .swing-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .swing-point {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }

    .high {
        background-color: rgba(255, 0, 0, 0.8);
    }

    .low {
        background-color: rgba(0, 255, 0, 0.8);
    }

    .swing-line {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 12px;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
    }
</style>
