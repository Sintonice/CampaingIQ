import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Campaign } from '../types';

interface D3BubbleChartProps {
  campaigns: Campaign[];
}

export default function D3BubbleChart({ campaigns }: D3BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || campaigns.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 450;
    const height = 260;

    // Build SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    // Create realistic size bounds (bubble area maps to Spend)
    const maxSpend = d3.max(campaigns, d => d.spend) || 10000;
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxSpend])
      .range([12, 38]);

    // Color code bubbles using high-contrast agency colors:
    // ROAS >= 3: strong emerald green, 2-3: warm amber, <2: premium soft crimson
    const colorScale = (roas: number) => {
      if (roas >= 3.0) return '#34d399'; // Emerald
      if (roas >= 2.0) return '#fbbf24'; // Amber
      return '#f87171'; // Rose
    };

    const nodes = campaigns.map((c, i) => {
      const roas = c.spend > 0 ? c.revenue / c.spend : 0;
      return {
        id: c.id,
        name: c.name,
        shortName: c.name.split('-')[1]?.trim() || c.name,
        platform: c.platform,
        spend: c.spend,
        roas: roas,
        radius: radiusScale(c.spend),
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height / 2 + (Math.random() - 0.5) * 80,
      };
    });

    // Create D3 forces simulation
    const simulation = d3.forceSimulation<any>(nodes)
      .force('charge', d3.forceManyBody().strength(15))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<any>().radius(d => d.radius + 3))
      .on('tick', ticked);

    // Filter backdrop glow
    const filter = svg.append('defs')
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');

    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Create container for bubbles
    const bubbleGroup = svg.append('g').attr('class', 'bubbles');

    // Define mouse event interactions
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'd3-bubble-tooltip')
      .style('position', 'absolute')
      .style('z-index', '9999')
      .style('visibility', 'hidden')
      .style('background', '#0b1329')
      .style('border', '1px solid #ff6b00')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('color', '#fff')
      .style('font-family', 'ui-sans-serif, system-ui, sans-serif')
      .style('font-size', '11px')
      .style('box-shadow', '0 10px 15px -3px rgba(0, 0, 0, 0.5)');

    // Render nodes
    const nodeElements = bubbleGroup.selectAll('.bubble-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble-node')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Circle background bubble
    nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => colorScale(d.roas))
      .attr('fill-opacity', 0.15)
      .attr('stroke', d => colorScale(d.roas))
      .attr('stroke-width', 2.2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill-opacity', 0.4)
          .attr('r', d.radius + 3);

        tooltip.html(`
          <div style="font-weight: bold; font-size:12px; margin-bottom: 4px;">${d.name}</div>
          <div style="color: #cbd5e1; font-family: monospace;">
            Platform: ${d.platform}<br/>
            Spend: $${d.spend.toLocaleString()}<br/>
            ROAS: <span style="font-weight: bold; color: ${colorScale(d.roas)}">${d.roas.toFixed(2)}x</span>
          </div>
        `);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function (event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 15) + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill-opacity', 0.15)
          .attr('r', d.radius);
        tooltip.style('visibility', 'hidden');
      });

    // Outer tiny glowing core
    nodeElements.append('circle')
      .attr('r', 2)
      .attr('fill', d => colorScale(d.roas))
      .attr('fill-opacity', 0.8)
      .style('pointer-events', 'none');

    // Label text
    nodeElements.append('text')
      .attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .style('font-size', d => `${Math.max(8, d.radius / 2.8)}px`)
      .style('fill', '#f8fafc')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .style('letter-spacing', '-0.02em')
      .text(d => d.radius > 18 ? (d.shortName?.length > 10 ? d.shortName.slice(0, 8) + '..' : d.shortName) : '');

    function ticked() {
      nodeElements.attr('transform', d => {
        // Constrain bounding boxes
        const r = d.radius;
        const x = Math.max(r, Math.min(width - r, d.x));
        const y = Math.max(r, Math.min(height - r, d.y));
        return `translate(${x}, ${y})`;
      });
    }

    // Force drag behavior
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [campaigns]);

  return (
    <div id="d3-bubble-card" className="w-full h-[320px] bg-slate-900/60 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            D3 Portfolio Gravity Model
          </h3>
          <p className="text-xs text-slate-400 font-mono">Drag bubbles to explore size (spend) vs ROAS bands</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-900" />
          <span className="text-[10px] text-slate-400 font-mono">Good</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-900" />
          <span className="text-[10px] text-slate-400 font-mono">Mid</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-900" />
          <span className="text-[10px] text-slate-400 font-mono">Poor</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center min-h-0">
        <svg ref={svgRef} className="w-full h-full max-h-[230px]" />
      </div>
    </div>
  );
}
