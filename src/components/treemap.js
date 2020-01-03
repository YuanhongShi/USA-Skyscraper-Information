import * as d3 from 'd3';


export function TreeMap(_) {
    let _margin = { top: 0, right: 0, bottom: 0, left: 0 },
        formatNumber = d3.format("");
    let _width, _height;
    let _departments = [];
    let _highlight_artist = '';
    let _highlight_color = 'yellow';

    function exports(data, i) {
        const that = this;
        _width = that.clientWidth;
        _height = that.clientHeight;

        /* create x and y scales */
        var x = d3.scaleLinear()
            .domain([0, _width])
            .range([0, _width]);

        var y = d3.scaleLinear()
            .domain([0, _height - _margin.top - _margin.bottom])
            .range([0, _height - _margin.top - _margin.bottom]);

        var color = d3.scaleOrdinal()
            .domain(_departments)
            .range(["#A39CA3", "#C1BCC1", "#DAD6D8"]);

        var color2 = d3.scaleOrdinal()
            .domain(_departments)
            .range(["#DDDBE5","#ECEBF4","#FCF0FC"]);


        var max_artwork = d3.max(data[0].values.map(d => d.values).map(d => d3.max(d, i => i.value)));
           
        
        var colorDencity = d3.scaleLinear()
            .domain([0, max_artwork])
            .range([0, 1]);

        var treemap = d3.treemap()
            //.tile(d3.treemapResquarify)
            .size([_width, _height])
            .round(false)
            .paddingTop(20)
            .paddingInner(1);

        var root = d3.hierarchy(data[0], d => d.values)
            // .eachBefore(function (d) { console.log(d); d.id = (d.parent ? d.parent.id + "." : "") + d.data.key; })
            .sum(d => d.value)
            .sort(function (a, b) {
                return b.value = a.value;
            });

        initialize(root);
        accumulate(root);
        layout(root);
        treemap(root);


        /* create svg */
        var svg = d3.select(that)
            .append("svg")
            .attr("width", _width + _margin.left + _margin.right)
            .attr("height", _height + _margin.bottom + _margin.top)
            .style("margin-left", -_margin.left + "px")
            .style("margin.right", -_margin.right + "px")
            .append("g")
            .attr("transform", "translate(" + _margin.left + "," + _margin.top + ")")
            .style("shape-rendering", "crispEdges");

        svg.selectAll('g.children')
            .data([root])
            .enter().append('g').classed('children', true)
            .each(display);


        function initialize(root) {
            root.x = root.y = 0;
            root.x1 = _width;
            root.y1 = _height;
            root.depth = 0;
        }

        // Aggregate the values for internal nodes. This is normally done by the
        // treemap layout, but not here because of our custom implementation.
        // We also take a snapshot of the original children (_children) to avoid
        // the children being overwritten when when layout is computed.
        function accumulate(d) {
            // console.log('accumulate called ' + d.data.key);
            return (d._children = d.children)
                ? d.value = d.children.reduce(function (p, v) { return p + accumulate(v); }, 0)
                : d.value;
        }





        // Compute the treemap layout recursively such that each group of siblings
        // uses the same size (1×1) rather than the dimensions of the parent cell.
        // This optimizes the layout for the current zoom state. Note that a wrapper
        // object is created for the parent node for each group of siblings so that
        // the parent’s dimensions are not discarded as we recurse. Since each group
        // of sibling was laid out in 1×1, we must rescale to fit using absolute
        // coordinates. This lets us use a viewport to zoom.
        function layout(d) {
            if (d._children) {
                // treemap.nodes({_children: d._children});
                // treemap(d);
                d._children.forEach(function (c) {
                    c.x0 = d.x0 + c.x0 * d.x1;
                    c.y0 = d.y0 + c.y0 * d.y1;
                    c.x1 *= d.x1;
                    c.y1 *= d.y1;
                    c.parent = d;
                    layout(c);
                });
            }
        }

        function layerContent(d) {
            let rectNode = d3.select(this)
                .selectAll('rect')
                .data([d]);
            let rectEnter = rectNode.enter()
                .append('rect')
            rectNode.exit().remove();
            rectNode.merge(rectEnter)
            
                .style("fill", d => {
                    if (d.depth == 1) {
                        return color(d.data.key);
                    } else if(d.depth == 2) {
                     
                        return (_highlight_artist && _highlight_artist == d.data.key)? 
                            _highlight_color : color2(d.parent.data.key);
                    }
                })
                
                .call(rect)
                .on('mouseover', function(d){
                    d3.select(this)
                    .style('fill', d=>{
                        if (d.depth == 1) {
                        return '#413844';
                    } else if(d.depth == 2) {
                     
                       return (_highlight_artist && _highlight_artist == d.data.key)? 
                            _highlight_color : '#CAADD3';
                    }
                    });
                })
                .on('mouseout', function(d){
                    d3.select(this)
                    .style('fill', d=>{
                        if (d.depth == 1) {
                        return color(d.data.key);
                    } else if(d.depth == 2) {
                     
                        return (_highlight_artist && _highlight_artist == d.data.key)? 
                            _highlight_color : color2(d.parent.data.key);
                    }
                    });
                })
                    .append("title")
                    .text(function (d) { return d.data.key + " (" + formatNumber(d.value) + ")"; });

            if (d.depth == 1) { // only display department
                let textNode = d3.select(this)
                    .selectAll('text')
                    .data([d]);
                let textEnter = textNode.enter()
                    .append('text')
                    .attr('fill','white');
                textNode.exit().remove();
                textNode.merge(textEnter)
                    .text( d => d.data.key)
                    .call(text)
                    .each(wrap)
                    ;
            }
          
           
        }

        

        function display(d) {
            let that = this;
            let layerNode = d3.select(that).selectAll('g.layer')
                .data([d])
            let layerEnter = layerNode.enter()
                .append('g')
                .attr("data-depth", d => d.depth)
                .classed('layer', true);
            layerNode.exit().remove();
            let layer = layerNode.merge(layerEnter);
            layer.each(layerContent);

            if (d.children) {
                let childrenNode =  d3.select(that).selectAll('g.children')
                    .data(d.children);
                let childrenEnter = childrenNode.enter()
                    .append('g')
                    .classed('children', true);
                childrenNode.exit().remove();
                childrenNode.merge(childrenEnter)
                    .each(display);
            }
            
            
 /*           

            var g1 = tag.insert("g", ".grandparent")
                .datum(d)
                .classed("depth", true);

            var g = g1.selectAll("g")
                .data(d._children)
                .enter().append("g")
                    .classed('children', true)
                ;


            // the following lines add rects in parent mode. 

            var children = g.selectAll(".child")
                .data(function (d) { return d._children || [d]; })
                .enter().append("g");

            children.append("rect")
                .classed("child", true)
                .call(rect)
                .append("title")
                .text(function (d) { return d.data.key + " (" + formatNumber(d.value) + ")"; });

            children.append("text")
                .classed("ctext", true)
                .text(function (d) { return d.data.key; })
                .call(text2);

            g.append("rect")
                .classed("parent", true)
                .call(rect);


            var t = g.append("text")
                .classed("ptext", true)
                .attr("dy", ".75em")

            t.append("tspan")
                .text(function (d) { return d.data.key; });
            t.append("tspan")
                .attr("dy", "1.0em")
                .text(function (d) { return formatNumber(d.value); });
            t.call(text);

            g.selectAll("rect")
                .style("fill", function (d) { return color(d.data.key); });


            return g;
        */
        }


        function text(text) {
            text.selectAll("tspan")
                .attr("x", function (d) { return x(d.x0) + 6; })
            text.attr("x", function (d) { return x(d.x0) + 6; })
                .attr("y", function (d) { return y(d.y0) + 16; });
        }

        function text2(text) {
            text.attr("x", function (d) { return x(d.x0 + d.x1) - this.getComputedTextLength() - 6; })
                .attr("y", function (d) { return y(d.y0 + d.y1) - 6; })
                .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x0 + d.x1) - x(d.x0) ? 1 : 0; });
        }

        function rect(rect) {
            rect.attr("x", function (d) { return x(d.x0); })
                .attr("y", function (d) { return y(d.y0); })
                .attr("width", function (d) {
                    // console.log('id ' + d.id + ' rect width ' + (d.x1 - d.x0));
                    //return x(d.x0 + d.x1) - x(d.x0);
                    return x(d.x1 -d.x0);

                })
                .attr("height", function (d) {
                    // console.log('id ' + d.id + ' rect height ' + (d.y1 - d.y0) + ' ordinal ' + (y(d.y1 + d.y0) - y(d.y0)));
                    //return y(d.y0 + d.y1) - y(d.y0);
                    return y(d.y1 - d.y0);

                });

            // rect.append("title")
            //     .text(d=>d.data.key)
            // ;
        }

        function wrap(d) {
            var self = d3.select(this),
                textLength = self.node().getComputedTextLength(),
                text = self.text();
            while (textLength > (x(d.x1 -d.x0) - 2 * 6) && text.length > 0) {
                text = text.slice(0, -1);
                self.text(text + '...');
                textLength = self.node().getComputedTextLength();
            }
        } 

        function name(d) {
            return d.parent
                ? name(d.parent) + " / " + d.data.key + " (" + formatNumber(d.value) + " items)"
                : d.data.key + " (" + formatNumber(d.value) + " items)";
        }


    }

    exports.margin = function (_) {
        _margin = _;
        return this;
    }

    exports.width = function (_) {
        _width = _;
        return this;
    }

    exports.height = function (_) {
        _height = _;
        return this;
    }

    exports.departments = function(_) {
        _departments = _;
        return this;
    }

    exports.highlight_artist = function(_) {
        _highlight_artist = _;
        return this;
    }

    exports.highlight_color = function(_) {
        _highlight_color = _;
        return this;
    }

    return exports;



}

export default TreeMap;