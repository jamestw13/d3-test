import './App.css';
import { stackedData } from './stackedData';
import { scaleBand, scaleLinear, max, index, stack, union, groupSort, sum, scaleOrdinal } from 'd3';

function App() {
  console.log(stackedData);

  const width = 960;
  const height = 600;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const titleOffset = 25;
  const yAxisWidth = 190;
  const yAxisLabelOffset = 20;
  const xAxisHeight = 10;
  const xAxisLabelOffset = 30;

  const innerHeight = height - margin.top - margin.bottom - xAxisHeight - xAxisLabelOffset - titleOffset;
  const innerWidth = width - margin.left - margin.right - yAxisWidth - yAxisLabelOffset;

  const indexed = index(
    stackedData,
    d => d.protocolLabel,
    d => d.status
  );

  // console.log({ indexed });

  const series = stack()
    .keys(union(stackedData.map(d => d.status)))
    .value(([, D], key) => D.get(key).count)(indexed);

  console.log({ series });

  console.log(
    'sorted',
    groupSort(
      stackedData,
      D => -sum(D, d => d.count),
      d => d.protocolLabel
    )
  );

  const yScale = scaleBand()
    .domain(
      groupSort(
        stackedData,
        D => -sum(D, d => d.count),
        d => d.protocolLabel
      )
    )
    .range([innerHeight, 0])
    .padding(0.1);

  const xScale = scaleLinear()
    .domain([0, max(series, d => max(d, d => d[1]))])
    .range([0, innerWidth]);

  const color = scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(['red', 'green', 'blue'])
    .unknown('#ccc');

  return (
    <>
      <svg width={width} height={height} style={{ background: 'lightgray' }}>
        <text dominantBaseline="middle" textAnchor="middle" x={width / 2} y={titleOffset / 2} fontSize="1.5em">
          Title
        </text>
        <g transform={`translate(${margin.left + yAxisWidth + yAxisLabelOffset}, ${margin.top + titleOffset})`}>
          {/* yaxis */}
          <text
            dominantBaseline="middle"
            textAnchor="middle"
            transform={`rotate(-90) translate(-${innerHeight / 2}, ${-yAxisWidth - yAxisLabelOffset})`}
          >
            Y Axis
          </text>

          {yScale.domain().map((tick, i) => (
            <g key={i} transform={`translate(0, ${yScale(tick) + yScale.bandwidth() / 2})`}>
              <text x={0} textAnchor="end" dominantBaseline="middle" dx="-1em">
                {tick}
              </text>
            </g>
          ))}

          {/* xaxis */}
          <text
            dominantBaseline="middle"
            textAnchor="middle"
            x={innerWidth / 2}
            y={innerHeight + xAxisHeight + xAxisLabelOffset}
          >
            X Axis
          </text>

          {xScale.ticks(10).map((tick, i) => (
            <g key={i} transform={`translate(${xScale(tick)}, 0)`}>
              <line y2={innerHeight} stroke="black" />
              <text y={innerHeight + 1} textAnchor="middle" dy="1em">
                {tick}
              </text>
            </g>
          ))}

          {/* bars */}
          {series.map((statusBar, i) => {
            // console.log(statusBar);
            return (
              <g key={i} fill={color(statusBar.key)}>
                {statusBar.map((bar, j) => {
                  // console.log(bar);
                  return (
                    <rect
                      key={j}
                      x={xScale(bar[0])}
                      y={yScale(bar.data[0])}
                      width={xScale(bar[1]) - xScale(bar[0])}
                      height={yScale.bandwidth()}
                    >
                      <title>{`${bar.data[0]} ${statusBar.key}\n${bar.data[1].get(statusBar.key).count}`}</title>
                    </rect>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );
}

export default App;
