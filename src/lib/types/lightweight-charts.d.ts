declare module 'lightweight-charts' {
    export interface ChartOptions {
        width?: number;
        height?: number;
        layout?: {
            background?: {
                type?: string;
                color?: string;
            };
            textColor?: string;
        };
        grid?: {
            vertLines?: {
                color?: string;
            };
            horzLines?: {
                color?: string;
            };
        };
        crosshair?: {
            mode?: number;
        };
        timeScale?: {
            timeVisible?: boolean;
            secondsVisible?: boolean;
        };
    }

    export interface SeriesOptions {
        upColor?: string;
        downColor?: string;
        borderVisible?: boolean;
        wickUpColor?: string;
        wickDownColor?: string;
    }

    export interface PriceLineOptions {
        price: number;
        color: string;
        lineWidth: number;
        lineStyle: number;
        axisLabelVisible?: boolean;
        title?: string;
    }

    export interface IChartApi {
        applyOptions(options: ChartOptions): void;
        addCandlestickSeries(options?: SeriesOptions): ICandlestickSeriesApi;
        timeScale(): ITimeScaleApi;
        remove(): void;
    }

    export interface ICandlestickSeriesApi {
        setData(data: any[]): void;
        createPriceLine(options: PriceLineOptions): IPriceLineApi;
        removePriceLine(line: IPriceLineApi): void;
    }

    export interface IPriceLineApi {
        options(): PriceLineOptions;
        applyOptions(options: PriceLineOptions): void;
        remove(): void;
    }

    export interface ITimeScaleApi {
        fitContent(): void;
    }

    export const ColorType: {
        Solid: string;
    };

    export const CrosshairMode: {
        Normal: number;
    };

    export function createChart(container: HTMLElement, options?: ChartOptions): IChartApi;
}
