'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export type DutyStatus = 'OFF_DUTY' | 'SLEEPER_BERTH' | 'DRIVING' | 'ON_DUTY' | 'BREAK';

export interface ELDLog {
    start: Date;
    end: Date;
    status: DutyStatus;
}

interface ELDChartProps {
    logs: ELDLog[];
    width?: number;
    height?: number;
}

const STATUS_MAP: Record<string, number> = {
    OFF_DUTY: 2,
    BREAK: 0,
    DRIVING: 1,
    ON_DUTY: 0,
};

const STATUS_LABELS = [
    'On Duty',
    'Driving',
    'Off Duty',
];

export default function ELDChart({
    logs,
    width = 1200,
    height = 240,
}: ELDChartProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const MARGIN = { top: 30, right: 30, bottom: 30, left: 80 };
    const COLORS = {
        axis: '#9ca3af',
        subAxis: '#4b5563',
        gridMajor: '#374151',
        gridMinor: '#374151',
        line: '#3b82f6'
    };

    useEffect(() => {
        if (!svgRef.current || logs.length === 0) return;

        // Clear previous render
        d3.select(svgRef.current).selectAll('*').remove();

        const innerWidth = width - MARGIN.left - MARGIN.right;
        const innerHeight = height - MARGIN.top - MARGIN.bottom;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("display", "block")
            .attr("preserveAspectRatio", "none")
            .style("width", "100%")
            .style("height", "100%")
            .style("min-width", "700px");

        const g = svg
            .append('g')
            .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

        // 24 Hours per day
        const dayStart = new Date(logs[0].start);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(24, 0, 0, 0);

        const xScale = d3
            .scaleTime()
            .domain([dayStart, dayEnd])
            .range([0, innerWidth]);

        const yScale = d3
            .scaleLinear()
            .domain([-0.5, 2.5])
            .range([innerHeight, 0]);

        /* ------------------ 
        Axes
        ------------------ */
        const drawAxes = () => {
            // X Axis (Hours)
            const xAxis = d3.axisBottom(xScale)
                .ticks(d3.timeHour.every(1))
                .tickFormat(d3.timeFormat('%H') as any)
                .tickSize(10);

            g.append('g')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(xAxis)
                .attr('color', COLORS.axis)
                .style('font-size', '12px');

            // X Sub-Axis (15 mins)
            const xSubAxis = d3.axisBottom(xScale)
                .ticks(d3.timeMinute.every(15))
                .tickFormat(() => "")
                .tickSize(5);

            g.append('g')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(xSubAxis)
                .attr('color', COLORS.subAxis)
                .lower();

            // Y Axis
            g.append('g')
                .call(
                    d3.axisLeft(yScale)
                        .ticks(3)
                        .tickFormat((d) => STATUS_LABELS[d as number] || '')
                )
                .attr('color', COLORS.axis)
                .style('font-size', '12px')
                .style('font-weight', 'bold');
        };

        /* ------------------ 
        Grid Lines
        ------------------ */
        const drawGridLines = () => {
            // 15-min vertical lines
            g.append('g')
                .selectAll('line.sub-grid')
                .data(d3.range(0, 24 * 4 + 1)) // 96 segments
                .enter()
                .append('line')
                .attr('class', 'sub-grid')
                .attr('x1', (d) => xScale(new Date(dayStart.getTime() + d * 15 * 60 * 1000)))
                .attr('x2', (d) => xScale(new Date(dayStart.getTime() + d * 15 * 60 * 1000)))
                .attr('y1', 0)
                .attr('y2', innerHeight)
                .attr('stroke', (d) => d % 4 === 0 ? COLORS.gridMajor : COLORS.gridMinor)
                .attr('stroke-width', (d) => d % 4 === 0 ? 1 : 0.5)
                .attr('stroke-opacity', (d) => d % 4 === 0 ? 1 : 0.3);

            // Horizontal Status Lines
            g.append('g')
                .selectAll('line.row')
                .data([0, 1, 2])
                .enter()
                .append('line')
                .attr('x1', 0)
                .attr('x2', innerWidth)
                .attr('y1', (d) => yScale(d))
                .attr('y2', (d) => yScale(d))
                .attr('stroke', COLORS.gridMajor)
                .attr('stroke-width', 0.5);
        };

        /* ------------------ 
        Duty Line (ELD Log)
        ------------------ */
        const drawDutyLine = () => {
            const line = d3
                .line<[Date, number]>()
                .x((d) => xScale(d[0]))
                .y((d) => yScale(d[1]))
                .curve(d3.curveStepAfter);

            const points: [Date, number][] = [];

            logs.forEach((log) => {
                const statusKey = log.status;
                const y = STATUS_MAP[statusKey] !== undefined ? STATUS_MAP[statusKey] : 2;
                points.push([log.start, y]);
                points.push([log.end, y]);
            });

            g.append('path')
                .datum(points)
                .attr('fill', 'none')
                .attr('stroke', COLORS.line)
                .attr('stroke-width', 2)
                .attr('d', line);
        };

        // Draw log
        drawAxes();
        drawGridLines();
        drawDutyLine();

    }, [logs, width, height]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: 'auto', minHeight: height }}>
            <svg ref={svgRef} />
        </div>
    );
}
