import * as d3 from 'd3';

import AtlasMetadataClient from '@reuters-graphics/graphics-atlas-client';
import BaseChartComponent from './baseClasses/ChartComponent';
import Mustache from 'mustache';

const client = new AtlasMetadataClient();
/**
 * Write your chart as a class with a single draw method that draws
 * your chart! This component inherits from a base class you can
 * see and customize in the baseClasses folder.
 */
class CountryVaccination extends BaseChartComponent {
    /**
     * Default props are the built-in styles your chart comes with
     * that you want to allow a user to customize. Remember, you can
     * pass in complex data here, like default d3 axes or accessor
     * functions that can get properties from your data.
     */
    defaultProps = {
      height: 300,
      margin: {
        top: 20,
        right: 60,
        bottom: 60,
        axis: 25,
        left: 0,
      },
      dateRange: {
        // start: '2020-01-01',
      },
      format: {
        dateAxis: '%b %e',
        number: '~s',
      },
      areaFill: 'rgba(230, 147, 77,.8)',
      stroke: '#DE7041',
      strokeWidth: 3,
      variable: 'totalDoses',
      countryISO: 'ISR',
      milestones: [.05, 0.1, 0.2, 0.3, 0.4, 0.5],
      text: {
        milestone: '{{ number }}% of population',
        milestoneMinor: '{{ number }}%',
        daysLabel: 'No. of days',
      },
      milestoneStyle: {
        stroke: 'white',
        'stroke-dasharray': '5 5',
        textFill: 'rgba(255,255,255,.5)',
      },
    };

    /**
     * Default data for your chart. Generally, it's NOT a good idea to import
     * a big dataset and assign it here b/c it'll make your component quite
     * large in terms of file size. At minimum, though, you should assign an
     * empty Array or Object, depending on what your chart expects.
     */
    defaultData = [];

    /**
     * Write all your code to draw your chart in this function!
     * Remember to use appendSelect!
     */
    draw() {
      const data = this.data(); // Data passed to your chart
      const props = this.props(); // Props passed to your chart
      const parseDate = d3.timeParse('%Y-%m-%d');
      const dateAxisFormat = d3.timeFormat(props.format.dateAxis);
      const formatNumber = d3.format(props.format.number);
      const getCountry = client.getCountry(props.countryISO);
      let pop = 0;
      if (getCountry) {
        pop = getCountry.dataProfile.population.d;
      }
      const { milestones } = props;

      const popMilestones = milestones.map((d) => (pop * d) * 2);

      data.forEach(function(d) {
        d.parsedDate = parseDate(d.date);
      });

      if (data.length == 1) {
        const dateOffset = (24 * 60 * 60 * 1000) * 1; // 1 day
        const zeroDate = new Date();
        zeroDate.setTime(data[0].parsedDate.getTime() - dateOffset);

        data.unshift({
          date: d3.timeFormat('%Y-%m-%d')(zeroDate),
          parsedDate: zeroDate,
          count: 0,
        });
      }

      const { margin } = props;

      const node = this.selection().node();
      const { width: containerWidth } = node.getBoundingClientRect(); // Respect the width of your container!

      const width = containerWidth - margin.left - margin.right;
      const height = props.height - margin.top - margin.bottom;
      let startDate;

      if (props.dateRange.start) {
        startDate = parseDate(props.dateRange.start);
      } else {
        startDate = d3.min(data, d => d.parsedDate);
      }

      var endDate = d3.max(data, d => d.parsedDate); // some date
      var dateDiff = Math.abs(endDate - startDate)/(24*60*60*1000); // difference in milliseconds

      let useMilestone, useMilestonePer, milestoneIndex;
      const maxValue = d3.max(data, d => d.count);
      for (let i = popMilestones.length - 1; i >= 0; i--) {
        if (popMilestones[i] > maxValue) {
          useMilestone = popMilestones[i];
          useMilestonePer = milestones[i];
          milestoneIndex = i;
        }
      }

      const xScale = d3.scaleTime()
        .rangeRound([0, width])
        .domain([startDate, endDate]);

      const xScaleNum = d3.scaleLinear()
        .rangeRound([0, width])
        .domain([1,dateDiff+1]);

      const yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, useMilestone * 1.05]);

      const transition = d3.transition()
        .duration(500);

      this.svg = this.selection()
        .appendSelect('svg') // 👈 Use appendSelect instead of append for non-data-bound elements!
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const plot = this.svg
        .appendSelect('g')
        .classed('plot', true)
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xAxis = plot.appendSelect('g.axis.x');

      const xAxisNum = plot.appendSelect('g.axis.x.x-number');
      const yAxis = plot.appendSelect('g.axis.y');
      const area = d3.area()
        .x(function(d) { return xScale(d.parsedDate); }) // set the x values for the line generator
        .y1(function(d) { return yScale(d.count); }) // set the y values for the line generator
        .y0(yScale(0)) // set the y values for the line generator
        .curve(d3.curveStepAfter); // apply smoothing to the line

      const line = d3.line()
        .x(function(d) { return xScale(d.parsedDate); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.count); }) // set the y values for the line generator
        .curve(d3.curveStepAfter); // apply smoothing to the line

      const numberTicks=[], dateTicks=[];
      // ticks section
      if (data.length<7 && data.length%2!=0 && data[0].count>0) {
        dateTicks.push(startDate);
        dateTicks.push(endDate);
        numberTicks.push(dateDiff+1);
      } else if (data[0].count==0) {
        dateTicks.push(startDate);
        dateTicks.push(endDate);
        numberTicks.push(dateDiff);
        xScaleNum.domain([0,1])
      }else {
        dateTicks.push(startDate);
        dateTicks.push(new Date(startDate.getTime() + (Math.floor((dateDiff / 2) +1) * (24 * 60 * 60 * 1000))));
        dateTicks.push(endDate);
        numberTicks.push(dateDiff+1);
        numberTicks.push(Math.floor(dateDiff / 2 + 2));
      }

      xAxis.attr('transform', `translate(0,${height})`)
        .call(
          d3.axisBottom(xScale)
            .tickValues(dateTicks)
            .tickFormat(dateAxisFormat)
        );

      xAxis.selectAll('.tick').filter((d,i)=>i==0).select('text')
        .attr('text-anchor','start')

      xAxisNum.attr('transform', `translate(0,${height+margin.axis})`)
        .call(
          d3.axisBottom(xScaleNum)
            .tickValues(numberTicks)
            .tickFormat(d3.format(props.format.number))
        );

      yAxis.attr('transform', `translate(${width}, 0)`)
        .call(
          d3.axisRight(yScale)
            .tickFormat(d => formatNumber(d))
            .ticks(3)
          // .tickSize(-width - margin.right)
        );

      this.selection().appendSelect('div.days-label')
        .style('bottom', `${17}px`)
        .style('left', `${0}px`)
        .text(props.text.daysLabel);

      plot.appendSelect('path.vaccinations-area')
        .attr('d', area(data))
        .style('fill', props.areaFill)

      plot.appendSelect('path.vaccinations-line')
        .attr('d', line(data))
        .style('fill','none')
        .style('stroke', props.stroke)
        .style('stroke-width', props.strokeWidth);

      const milestoneG = plot.appendSelect('g.milestone-group');

      const ms0 = milestoneG.appendSelect('g.milestone-0')
        .attr('transform', `translate(0, ${yScale(useMilestone)})`);

      ms0.appendSelect('line')
        .style('stroke', props.milestoneStyle.stroke)
        .style('stroke-dasharray', props.milestoneStyle['stroke-dasharray'])
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', 0)
        .attr('y2', 0);

      ms0.appendSelect('text')
        .attr('transform', `translate(0,${-10})`)
        .style('fill', props.milestoneStyle.textFill)
        .text(Mustache.render(props.text.milestone, { number: useMilestonePer * 100 }));

      if (milestoneIndex > 0) {
        const ms1 = milestoneG.appendSelect('g.milestone-1')
          .attr('transform', `translate(0, ${yScale(popMilestones[milestoneIndex - 1])})`);

        ms1.appendSelect('line')
          .style('stroke', props.milestoneStyle.stroke)
          .style('stroke-dasharray', props.milestoneStyle['stroke-dasharray'])
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', 0)
          .attr('y2', 0);

        ms1.appendSelect('text')
          .attr('transform', `translate(0,${-10})`)
          .style('fill', props.milestoneStyle.textFill)
          .text(Mustache.render(props.text.milestoneMinor, { number: milestones[milestoneIndex - 1] * 100 }));
      } else {
        milestoneG.selectAll('.milestone-1').remove();
      }

      return this; // Generally, always return the chart class from draw!
    }
}

export default CountryVaccination;
