import * as d3 from 'd3';
import '../style/stackbar.css'

function numberRange(start, end) {
    const index = end - start + 1;
    return new Array(index).fill().map((d, i) => Number(i) + Number(start));
}

export function StackedYearProgress(_) {

    let _currentyear;
    let _startyear;
    let _endyear;
    let _margin = { t: 20, r: 20, b: 20, l: 20 };
    let _departments = [];


    function exports(data, i) {
        const root = this;

        const width = root.clientWidth;
        const height = root.clientHeight;
        const w = width - _margin.l - _margin.r;
        const h = height - _margin.t - _margin.b;

        _departments = data.map(d => d.key);

        var min_year = d3.min(data.map(d => d.values).map(d => d3.min(d, i => i.key)));
        if (_startyear && _startyear > min_year) {
            min_year = _startyear;
        }

        var max_year = d3.max(data.map(d => d.values).map(d => d3.max(d, i => i.key)));
        if (_endyear && _endyear < max_year) {
            max_year = _endyear;
        }
        const years = numberRange(min_year, max_year);

        var department_design_counts = data.map(d => d.values).map(d => d3.sum(d, i => i.value));
        var max_design_count = d3.max(department_design_counts);


        const svg = d3.select(root)
            .classed('Stackedbar', true)
            .selectAll('svg')
            .data([1]);

        const svgEnter = svg.enter().append('svg')
            .attr('width', width)
            .attr('height', height);
        svgEnter.append('g')
            .attr('class', 'plot');

        const plot = svg.merge(svgEnter)
            .select('.plot')
            .attr('transform', `translate(${_margin.l},${_margin.t})`);

        var scaleX = d3.scaleBand()
            .rangeRound([0,w])
            .paddingInner(0.05)
            .paddingOuter(0)
            .domain(_departments);

        var scaleY = d3.scaleLinear()
            .rangeRound([h, 0])
            .domain([0, max_design_count]);

        // var scaleColor = d3.scaleOrdinal()
        //     .domain(years)
        //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        const axisY = d3.axisLeft()
            .scale(scaleY)
            .tickSize(-w);

        const axisX = d3.axisBottom()
            .scale(scaleX);


        const axisXNode = plot
            .selectAll('.axis-x')
            .data([1])
        const axisXnodeEnter = axisXNode.enter()
            .append('g')
            .attr("class", "axis axis-x")
        axisXNode.merge(axisXnodeEnter)
            .attr("transform", `translate(0,${h})`)
            .call(axisX)
            .selectAll("text")
            .attr("y",5)
            .attr("x",0)
            .attr("dy",".35em")
            .attr("transform","rotate(-90)")
            .style("text-anchor","start");

        const axisYNode = plot
            .selectAll('.axis-y')
            .data([1])
        const axisYNodeEnter = axisYNode.enter()
            .append('g')
            .attr("class", "axis axis-y")
        axisYNode.merge(axisYNodeEnter)
            .call(axisY);


        //BEGIN data cleanup for d3.stack
        //Add default values for missing data points to make each array formatted the same
        data = data.map(function(keyObj) {
            return {
                key: keyObj.key,
                values: years.map(function(k) {
                    var value = keyObj.values.filter(function(v) { return v.key == k; })[0];
                    return value || ({ key: k, value: 0 });
                })
            };
        });
        //Loop through the nested array and create a new array element that converts each individual nested element into a key/value pair in a single object.
        var flatData = [];
        data.forEach(function(d) {
            var obj = { Department: d.key }
            d.values.forEach(function(f) {
                if(f.key <= _currentyear) { // only add artworks before current year
                    obj[f.key] = f.value;
                }
            });
            flatData.push(obj);
        });

        var stackNode = plot.selectAll('.stack').data([1]);
        var stackNodeEnter = stackNode.enter()
            .append('g')
            .classed('stack', true);
        stackNode.exit().remove();
        var stack = stackNode.merge(stackNodeEnter);

        var columnsNode = stack.selectAll('g')
            .data(d3.stack().keys(years)(flatData));
        var columnsEnter = columnsNode.enter()
            .append('g');
           // .attr("fill", function(d) { return scaleColor(d.key); });
        columnsNode.exit().remove();
        var columns = columnsNode.merge(columnsEnter);

        // columns.selectAll('rect').data([]).exit().remove();

       
        var rectNodes = columns.selectAll('rect')
            .data(d=>d);

        rectNodes.exit().remove();
        var rectEnter = rectNodes.enter().append('rect')
            .classed('block', true);
        rectNodes.merge(rectEnter)
            .attr("x", function(d) {
                
                return scaleX(d.data.Department); 
            })
            .attr("y", function(d) {
                var d1 = d[1];// ? d[1] : 0;
                return scaleY(d1); 
            })
            .attr("width", scaleX.bandwidth()*0.4) 
            .attr("height", function(d){
                var d0 = d[0]; //? d[0] : 0;
                var d1 = d[1]; //? d[1] : 0;
                return scaleY(d0) - scaleY(d1)})
            .attr('stroke', 'white')
            .attr('stroke-width', 0.2)
            .attr('fill', 'grey');
/*
        plot.append("g")
            .selectAll("g")
            .data(d3.stack().keys(years)(flatData))
            .enter().append("g")
                .attr("fill", function(d) { return scaleColor(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
                .enter().append("rect")
                    .classed('block', true)
                    .attr("x", function(d) { return scaleX(d.data.Year); })
                    .attr("y", function(d) { return scaleY(d[1]); })
                    .attr("height", function(d) { return scaleY(d[0]) - scaleY(d[1]); })
                    .attr("width", scaleX.bandwidth());
*/


    }
    exports.currentyear = function(_) {
        _currentyear = _;
        return this;
    }

    exports.startyear = function(_) {
        _startyear = _;
        return this;
    }

    exports.endyear = function(_) {
        _endyear = _;
        return this;
    }

    exports.margin = function(_) {
        _margin = _;
        return this;
    }

    return exports;

}