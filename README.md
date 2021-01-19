![](./badge.svg)

# CountryVaccination

### Install

```
$ yarn add https://github.com/reuters-graphics/chart-module-vaccination-cumulative.git
```

### Use

```javascript
import CountryVaccination from '@reuters-graphics/chart-module-vaccination-cumulative';

const chart = new CountryVaccination();

// To create your chart, pass a selector string to the chart's selection method,
// as well as any props or data to their respective methods. Then call draw.
chart
  .selection('#chart')
  .data([1, 2, 3])
  .props({
      // Area stroke
      strokeWidth: 2,

      // Chart height
      height: 300,

      // Margins
      margin: {
        top: 20,
        right: 60,
        bottom: 60,
        left: 20,
        // Gap between the two x axis
        axis: 25,
      },
      dateRange: {
        // start: '2020-01-01',
      },
      format: {
        // Axis date format
        dateAxis: '%b %e',
        // Axis number of days format
        number: '~s',
      },
      // Area fill
      areaFill: 'rgba(238, 195, 49,.6)',
      // Area stroke
      stroke: '#EEC331',
      // Variable to plot
      variable: 'totalDoses',
      // ISO of country
      countryISO: 'ISR',
      // Array of milestones to check
      milestones: [.05, 0.1, 0.2, 0.3, 0.4, 0.5],
      // Text
      text: {
        milestone: '{{ number }}% of population',
        milestoneMinor: '{{ number }}%',
        daysLabel: 'Days since first reported dose'
      },
      // Styles for milestone elements
      milestoneStyle: {
        stroke: 'white',
        'stroke-dasharray': '4',
        textFill: 'rgba(255,255,255,.5)',
      },})
  .draw();

// You can call any method again to update the chart.
chart
  .data([3, 4, 5])
  .draw();

// Or just call the draw function alone, which is useful for resizing the chart.
chart.draw();
```

To apply this chart's default styles when using SCSS, simply define the variable `$CountryVaccination-container` to represent the ID or class of the chart's container(s) and import the `_chart.scss` partial.

```CSS
$CountryVaccination-container: '#chart';

@import '~@reuters-graphics/chart-module-vaccination-cumulative/src/scss/chart';
```

## Developing chart modules

Read more in the [DEVELOPING docs](./DEVELOPING.md) about how to write your chart module.