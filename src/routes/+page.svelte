<script lang="ts">
    import { onMount } from 'svelte';
    import TradingChart from '$lib/components/TradingChart.svelte';
    import { fetchKlines } from '$lib/services/binance';
    import type { KlineData } from '$lib/services/binance';

    let klineData: KlineData[] = [];
    let symbol = 'BTCUSDT';
    let interval = '1h';
    let error = '';
    let loading = false;

    // Настройки индикаторов
    let swingLength = 50;
    let closeBreak = true;
    let showFVG = true;

    async function loadData() {
        try {
            loading = true;
            error = '';
            klineData = await fetchKlines(symbol, interval);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load data';
            console.error('Error loading data:', e);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadData();
    });
</script>

<main>
    <div class="header">
        <h1>Technical Analysis</h1>
        <div class="controls">
            <div class="control-group">
                <select bind:value={symbol} on:change={loadData} disabled={loading}>
                    <option value="BTCUSDT">BTC/USDT</option>
                    <option value="ETHUSDT">ETH/USDT</option>
                    <option value="BNBUSDT">BNB/USDT</option>
                </select>

                <select bind:value={interval} on:change={loadData} disabled={loading}>
                    <option value="1m">1 minute</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="4h">4 hours</option>
                    <option value="1d">1 day</option>
                </select>

                <button 
                    on:click={loadData} 
                    disabled={loading}
                    class="refresh-btn"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div class="indicators">
                <div class="indicator-group">
                    <div class="swing-length">
                        <span>Swing Length:</span>
                        <input 
                            type="number" 
                            bind:value={swingLength}
                            min="2"
                            max="200"
                            step="1"
                        >
                    </div>
                    <label class="indicator-control">
                        <input type="checkbox" bind:checked={closeBreak}>
                        <span>Use Close Price for Break Detection</span>
                    </label>
                </div>
                <div class="indicator-group">
                    <label class="indicator-control">
                        <input type="checkbox" bind:checked={showFVG}>
                        <span>Show Fair Value Gaps</span>
                    </label>
                </div>
            </div>
        </div>
    </div>

    {#if error}
        <div class="error">
            <span>Error: {error}</span>
            <button on:click={loadData}>Retry</button>
        </div>
    {/if}

    <div class="chart-wrapper">
        {#if loading && !klineData.length}
            <div class="loading">Loading chart data...</div>
        {:else}
            <TradingChart 
                data={klineData}
                swingLength={swingLength}
                closeBreak={closeBreak}
                showFVG={showFVG}
            />
        {/if}
    </div>
</main>

<style>
    main {
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
        color: #DDD;
    }

    .header {
        margin-bottom: 1rem;
    }

    h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #DDD;
    }

    .controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .control-group {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .indicators {
        display: flex;
        gap: 2rem;
        align-items: center;
        flex-wrap: wrap;
        padding: 0.5rem;
        background: rgba(43, 43, 67, 0.3);
        border-radius: 4px;
    }

    .indicator-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .indicator-group {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .swing-length {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .swing-length input {
        width: 60px;
        padding: 0.25rem;
        border-radius: 4px;
        background: #1E222D;
        color: #DDD;
        border: 1px solid #2B2B43;
    }

    select, button {
        padding: 0.5rem;
        border-radius: 4px;
        background: #1E222D;
        color: #DDD;
        border: 1px solid #2B2B43;
        cursor: pointer;
    }

    select:disabled, button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .refresh-btn {
        background: #2962FF;
        border: none;
        padding: 0.5rem 1rem;
    }

    .refresh-btn:hover:not(:disabled) {
        background: #2051DE;
    }

    .error {
        background: rgba(239, 83, 80, 0.1);
        border: 1px solid #ef5350;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error button {
        background: #ef5350;
        border: none;
        padding: 0.5rem 1rem;
    }

    .error button:hover {
        background: #d32f2f;
    }

    .chart-wrapper {
        position: relative;
        height: 600px;
        background: #1E222D;
        border-radius: 4px;
        overflow: hidden;
    }

    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #DDD;
    }
</style>
