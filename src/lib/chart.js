import 'd3-appendselect';

import * as d3 from 'd3';

import ChartComponent from './base/ChartComponent';
import defaultData from './defaultData.json';

class MyChart extends ChartComponent {
  defaultProps = {
    stroke: '#aaa',
    strokeWidth: 1,
    fill: 'steelblue',
    height: 200,
  };

  defaultData = defaultData;

  draw() {
    const data = this.data();
    const props = this.props();
    const node = this.selection().node();

    const { width } = node.getBoundingClientRect();

    const transition = d3.transition()
      .duration(750);

    const g = this.selection()
      .appendSelect('svg') // see docs in ./utils/d3.js
      .attr('width', width)
      .attr('height', props.height)
      .appendSelect('g')
      .attr('transform', `translate(${width / 2 - 60}, 0)`);

    const circles = g.selectAll('circle')
      .data(data, (d, i) => i);

    circles
      .style('fill', props.fill)
      .style('stroke', props.stroke);

    circles.enter().append('circle')
      .style('fill', props.fill)
      .style('stroke', props.stroke)
      .style('stroke-width', props.strokeWidth)
      .attr('cy', props.height / 2)
      .attr('cx', (d, i) =>
        data.slice(0, i).reduce((a, b) => a + b, 0) + (d / 2)
      )
      .merge(circles)
      .transition(transition)
      .attr('cx', (d, i) =>
        data.slice(0, i).reduce((a, b) => a + b, 0) + (d / 2)
      )
      .attr('r', d => d / 2);

    circles.exit()
      .transition(transition)
      .attr('r', 0)
      .remove();

    return this;
  }
}

export default MyChart;
