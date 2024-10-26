<script lang="ts">
    import { calculateFVG } from '../indicators/FVG';
    import type { OHLC } from '../types';

    export let data: OHLC[] = [];
    export let joinConsecutive: boolean = false;
    
    $: fvgResults = calculateFVG(data, joinConsecutive);
    
    // Вычисляем min/max для масштабирования
    $: yScale = {
        min: Math.min(...data.map(d => d.low)),
        max: Math.max(...data.map(d => d.high))
    };
</script>

<div class="fvg-container">
    {#each fvgResults as result, i}
        {#if result.fvg !== null && result.top !== null && result.bottom !== null}
            <div 
                class="fvg-zone"
                class:bullish={result.fvg === 1}
                class:bearish={result.fvg === -1}
                style="
                    --top: {100 - ((result.top - yScale.min) / (yScale.max - yScale.min)) * 100}%;
                    --bottom: {100 - ((result.bottom - yScale.min) / (yScale.max - yScale.min)) * 100}%;
                    --left: {(i / data.length) * 100}%;
                    --width: {(1 / data.length) * 100}%;
                "
            >
                {#if result.mitigatedIndex !== null}
                    <div class="mitigation-line" style="
                        --end: {((result.mitigatedIndex - i) / data.length) * 100}%;
                    "></div>
                {/if}
            </div>
        {/if}
    {/each}
</div>

<style>
    .fvg-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .fvg-zone {
        position: absolute;
        left: var(--left);
        width: var(--width);
        top: var(--top);
        bottom: var(--bottom);
        opacity: 0.3;
    }

    .bullish {
        background-color: rgba(0, 255, 0, 0.2);
        border: 1px solid rgba(0, 255, 0, 0.5);
    }

    .bearish {
        background-color: rgba(255, 0, 0, 0.2);
        border: 1px solid rgba(255, 0, 0, 0.5);
    }

    .mitigation-line {
        position: absolute;
        top: 0;
        left: 100%;
        width: var(--end);
        height: 1px;
        background-color: rgba(255, 255, 255, 0.5);
    }
</style>
