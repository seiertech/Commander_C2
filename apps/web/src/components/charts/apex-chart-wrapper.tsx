'use client';

import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';

/**
 * Dynamic import wrapper for ApexCharts — SSR-safe.
 * ApexCharts requires `window` and cannot run during server rendering.
 */
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export type { ApexChartProps };
export default ReactApexChart;
