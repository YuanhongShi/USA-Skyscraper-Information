import * as d3 from 'd3';
import ScrollMagic from 'scrollmagic';
import 'debug.addIndicators'

function numberRange (start, end) {
    const index = end-start+1;
    return new Array(index).fill().map((d, i) => i + start);
}

export function Timeline(_) {
    let _begin;
    let _end;
    let _orientation = 0;
    let _thinkness = 1;
    let _scroller;
    let _enterDispatcher;
    let _enterEventName;
    let _leaveDispatcher;
    let _leaveEventName;
    let _enterHeadDispatcher;
    let _enterHeadEventName;
    let _enterFootDispatcher;
    let _enterFootEventName;

    let _hookPosition = -10;
    let _nodes;
    let _yearwindowsize = 3;
    let _padding =  { t: 0, r: 0, b: 0, l: 0 };

    function addScrollScene(year) {
        const trigger = this;// d3.select(this);
        const scene = new ScrollMagic.Scene({
            triggerElement: trigger,
            triggerHook: _hookPosition,
            reverse: true,
            duration: trigger.offsetHeight
        })
        //.addIndicators()
        .on('enter', function(e){
           // console.log('entering year: ' + year);
            if(_enterDispatcher) {
                _enterDispatcher.call(_enterEventName, null, year);
            }
            display(_nodes, year);
        })
        .on('leave', function(e){
           // console.log('leaving year: ' + year);
            if(_leaveDispatcher) {
                _leaveDispatcher.call(_leaveEventName, null, year);
            }
            
        })
        .addTo(_scroller);

    }

    function addHeadScene() {
        const trigger = this;
        const scene = new ScrollMagic.Scene({
            triggerElement: trigger,
            triggerHook: _hookPosition,
            reverse: true,
            duration: trigger.offsetHeight
        })
        //.addIndicators()
        .on('enter', function(e){
          if (_enterHeadDispatcher) {
              _enterHeadDispatcher.call(_enterHeadEventName, null);
          }  
        })
        .addTo(_scroller);

    }
    function addFootScene() {
        const trigger = this;
        const scene = new ScrollMagic.Scene({
            triggerElement: trigger,
            triggerHook: _hookPosition,
            reverse: true,
            duration: trigger.offsetHeight
        })
        //.addIndicators()
        .on('enter', function(e){
          if (_enterFootDispatcher) {
              _enterFootDispatcher.call(_enterFootEventName, null);
          }
        })
        .addTo(_scroller);

    }


    function exports(_) {
        _nodes = yearNodes(this);
        // display(_nodes, _begin);
    }

    function yearNodes(root) {
        const years = numberRange(_begin, _end);

        d3.select(root)
            .style('padding-top', `${_padding.t}px`)
            .style('padding-bottom', `${_padding.b}px`)
            .style('padding-left', `${_padding.l}px`)
            .style('padding-right', `${_padding.r}px`)
            ;
        
        

        const headUpdate = d3.select(root)
            .selectAll('div.head-node')
            .data([1]);
        const headsEnter = headUpdate.enter()
            .append('div')
            .classed('head-node', true);
        headUpdate.exit().remove();
        const headNodes = headUpdate.merge(headsEnter);
        headNodes.each(addHeadScene);
        headNodes.append('p').text('Establishment');

        const yearsUpdate = d3.select(root)
            .selectAll('div.year-node')
            .data(years);
        const yearsEnter = yearsUpdate.enter()
            .append('div')
            .classed('year-node', true);
        yearsUpdate.exit().remove();
        
        const yearNodes = yearsUpdate.merge(yearsEnter);
        yearNodes
            .attr('data-year', d=>d)
            .text(d=>d)
            .each(addScrollScene);


        const footUpdate = d3.select(root)
            .selectAll('div.foot-node')
            .data([1]);
        const footEnter = footUpdate.enter()
            .append('div')
            .classed('foot-node', true);
        footUpdate.exit().remove();
        const footNodes = footUpdate.merge(footEnter);
        footNodes.each(addFootScene);
    
            
        return yearNodes;
    }

    function display(nodes, currentYear) {
        nodes//.text(function(d){return Math.abs(d-currentYear) < 5 ? d : "";})
            .classed("invisible", d=> Math.abs(d-currentYear) > _yearwindowsize)
            .classed("timeline-current-year", d=> d==currentYear)
            ;
    }


    exports.scroller = function(_) {
        _scroller = _;
        return this;
    }
    exports.begin = function(_) {
        _begin = _;
        return this;
    }

    exports.end = function(_) {
        _end = _;
        return this;
    }

    exports.enterDispatcher = function(d, name) {
        _enterDispatcher = d;
        _enterEventName = name;
        return this;
    }

    exports.leaveDispatcher = function(d, name) {
        _leaveDispatcher = d;
        _leaveEventName = name;
        return this;
    }

    exports.enterHead = function(d, name) {
        _enterHeadDispatcher = d;
        _enterHeadEventName = name;
        return this;
    }

    exports.enterFoot = function(d, name) {
        _enterFootDispatcher = d;
        _enterFootEventName = name;
        return this;
    }

    exports.hookPosition = function(_) {
        _hookPosition = _;
        return this;
    }

    exports.padding = function(_) {
        _padding = _;
        return this;
    }

    return exports;

}

export function TimelineAxis(scrollToNotify) {
    let _start = 1929;
    let _stop = 2018;
    let _current = 0;
    let _highlights = [];
    let _padding = 0;
    let _linewidth = 6;
    let _yearwidth = 16;
    let _yearheight = 8;
    let _yeartextwidth = 8;
    let _yeartextheight = 8;
    let _highlight_size = 4;
    let _highlight_offset = 10;
    let _scrollToNotify = scrollToNotify;

    function exports(_) {
        let that = this;
        let _width = that.offsetWidth;
        let _height =  that.offsetHeight;

        var scale = d3.scaleLinear()
            .domain([_start-1, _stop+1])
            .range([_padding, _height-_padding*2])
            ;

        var axis = d3.axisRight(scale)
            .tickFormat(d3.format("d"))
            .tickValues([_current]);

        let svgNode = d3.select(that).selectAll("svg")
            .data([1])
        let svgEnter = svgNode.enter().append("svg")

        let svg = svgNode.merge(svgEnter)
        svg.attr("width", _width)
            .attr("height", _height)

        var gNode = svg.selectAll("g")
            .data([1]);
        var gEnter = gNode.enter().append('g')
            // .attr("transform", `translate(0,0)`);

        let g = gNode.merge(gEnter);

        let lineNodeUpdate = g.selectAll('line.thread')
            .data([1]);
        var lineEnter = lineNodeUpdate.enter().append('line')
            .classed('thread', true);
        lineNodeUpdate.merge(lineEnter)
            .attr('x1', (_width-_linewidth)/4)
            .attr('x2', (_width-_linewidth)/4)
            .attr('y1', scale(_start))
            .attr('y2', scale(_stop))
            .attr('stroke', 'grey')
            .attr('stroke-width', 2);


        function showYearNode(d) {
            let rectNode = d3.select(this).selectAll('rect').data([d]);
            let rectEnter = rectNode.enter().append('rect');
            rectNode.exit().remove();
            rectNode.merge(rectNode)
                .attr('x', (_width-_yearwidth)/4-3)
                .attr('y', scale(d))//.attr('y', scale(d) - _yearheight/2)
                .attr('width', 10)
                .attr('height', 2)
                .attr('fill', 'black');

            // let textNode = d3.select(this).selectAll('text').data([d]);
            // let textEnter = textNode.enter().append('text');
            // textNode.exit().remove();
            // textNode.merge(textEnter)
            //     .attr('x', 2)
            //     .attr('y', scale(d) + _yeartextheight/2)
            //     .attr("font-size", `${_yeartextheight}px`)
            //     .text(d => d);
        }

        var yearNode = g.selectAll('g.slider')
            .data([_current]);
        var yearEnter = yearNode.enter().append('g')
            .classed('slider', true);
        yearNode.merge(yearEnter)
            .each(showYearNode)

        function showHighlight(d) {
            let circleNode = d3.select(this).selectAll('rect').data([d]);
            let circleEnter = circleNode.enter().append('rect');
            circleNode.exit().remove();
            circleNode.merge(circleEnter)
                .attr('x', _width/4 + _highlight_offset)
                .attr('y', d=>scale(d))
                .attr('width', 4)
                .attr('height', 4)
                .attr('fill', 'black')
                .on('click', d => {
                     if(_scrollToNotify) {
                        console.log(`Scroll to year: ${d}`);
                        _scrollToNotify(d);
                    }
                 })
                .on('mouseover', function(d){
                    d3.select(this)
                    .transition()
                    .duration(500)
                    .ease(d3.easeBounce)
                    .attr('fill', 'yellow')
                    .attr('width',80)
                    .attr('height',4)
                    .attr('opacity', .8);
                    })
                .on('mouseout',function(d){
                    d3.select(this)
                    .transition()
                    .duration(500)
                    .ease(d3.easeBounce)
                    .attr('fill', 'black')
                    .attr('width',4)
                    .attr('height',4)

                });
               
        }

        var highlightsNode = g.selectAll('g.highlight')
            .data(_highlights);
        var highlightsEnter = highlightsNode.enter().append('g')
            .classed('highlight', true);
        highlightsNode.exit().remove();
        highlightsNode.merge(highlightsEnter)
            .each(showHighlight);

    }

    

    exports.start  = function(_) {
        _start = _;
        return this;
    }

    exports.stop = function(_) {
        _stop = _;
        return this;
    }

    exports.current = function(_) {
        _current = _;
        return this;
    }

    exports.padding = function(_) {
        _padding = _;
        return this;
    }

    exports.highlights = function(_) {
        _highlights = _;
        return this;
    }

    return exports;
}

