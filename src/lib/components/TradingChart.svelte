<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
    import { calculateBOSCHOCH } from '../indicators/BOSCHOCH';
    import { calculateFVG } from '../indicators/FVG';
    import type { KlineData } from '../services/binance';

    export let data: KlineData[] = [];
    export let swingLength: number = 50;
    export let closeBreak: boolean = true;
    export let showFVG: boolean = true;
    
    let chartContainer: HTMLElement;
    let chart: any;
    let candlestickSeries: any;
    let markers: any[] = [];

    $: if (data.length > 0 && chart && candlestickSeries) {
        updateChart(data);
    }

    onMount(() => {
        chart = createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 600,
            layout: {
                background: { type: ColorType.Solid, color: '#1E222D' },
                textColor: '#DDD',
            },
            grid: {
                vertLines: { color: '#2B2B43' },
                horzLines: { color: '#2B2B43' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        const handleResize = () => {
            chart.applyOptions({
                width: chartContainer.clientWidth,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    });

    function createStructureBlock(type: string, direction: number, time: number, level: number, color: string) {
        // Создаем линию для уровня
        const lineSeries = chart.addLineSeries({
            color: color,
            lineWidth: 1,
            lineStyle: 2,
            lastValueVisible: false,
            priceLineVisible: false,
        });

        // Создаем короткую линию (10 свечей)
        const blockWidth = 10;
        const candleInterval = (data[1].openTime - data[0].openTime) / 1000;
        const startTime = time - blockWidth * candleInterval;
        const endTime = time;

        const linePoints = [{
            time: startTime,
            value: level
        }, {
            time: endTime,
            value: level
        }];

        lineSeries.setData(linePoints);

        // Добавляем текст как маркер
        candlestickSeries.setMarkers([{
            time: startTime,
            position: 'inBar',
            color: color,
            shape: 'text',
            text: type,
            size: 1
        }]);

        return lineSeries;
    }

    function updateChart(data: KlineData[]) {
        const candleData = data.map(d => ({
            time: d.openTime / 1000,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        candlestickSeries.setData(candleData);

        const ohlcData = data.map(d => ({
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        // Очищаем старые маркеры
        markers.forEach(marker => {
            if (marker.series) chart.removeSeries(marker.series);
            if (marker.priceLine) candlestickSeries.removePriceLine(marker.priceLine);
        });
        markers = [];

        // Рассчитываем BOS/CHoCH
        const bosChochResults = calculateBOSCHOCH(ohlcData, swingLength, closeBreak);
        
        bosChochResults.forEach((result, i) => {
            const structureCandle = ohlcData[i];
            
            // Обрабатываем BOS
            if (result.bos !== null) {
                const color = result.bos === 1 ? '#26a69a' : '#ef5350';
                const level = result.bos === 1 ? structureCandle.high : structureCandle.low;
                const series = createStructureBlock(
                    'BOS',
                    result.bos,
                    candleData[i].time,
                    level,
                    color
                );
                markers.push({ series });
            }

            // Обрабатываем CHoCH
            if (result.choch !== null) {
                const color = result.choch === 1 ? '#26a69a' : '#ef5350';
                const level = result.choch === 1 ? structureCandle.high : structureCandle.low;
                const series = createStructureBlock(
                    'CHoCH',
                    result.choch,
                    candleData[i].time,
                    level,
                    color
                );
                markers.push({ series });
            }
        });

        // Отображаем FVG если включено
        if (showFVG) {
            const fvgResults = calculateFVG(ohlcData);
            fvgResults.forEach((result, i) => {
                // Показываем только незаполненные FVG
                if (result.fvg !== null && result.mitigatedIndex === null) {
                    const color = result.fvg === 1 ? '#26a69a' : '#ef5350';
                    
                    // Верхняя линия FVG
                    const topLine = candlestickSeries.createPriceLine({
                        price: result.top!,
                        color: color,
                        lineWidth: 1,
                        lineStyle: 2,
                        axisLabelVisible: true,
                        title: `FVG ${result.fvg === 1 ? 'Bullish' : 'Bearish'} Top`,
                    });

                    // Нижняя линия FVG
                    const bottomLine = candlestickSeries.createPriceLine({
                        price: result.bottom!,
                        color: color,
                        lineWidth: 1,
                        lineStyle: 2,
                        axisLabelVisible: true,
                        title: `FVG ${result.fvg === 1 ? 'Bullish' : 'Bearish'} Bottom`,
                    });

                    markers.push({ priceLine: topLine }, { priceLine: bottomLine });
                }
            });
        }
    }
</script>

<div class="chart-container" bind:this={chartContainer}>
    {#if !data.length}
        <div class="loading">Loading...</div>
    {/if}
</div>

<style>
    .chart-container {
        width: 100%;
        height: 600px;
        position: relative;
    }

    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #DDD;
    }
</style>
