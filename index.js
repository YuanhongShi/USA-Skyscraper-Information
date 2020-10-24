/*var width = document.getElementById('svg1').clientWidth;
var height = document.getElementById('svg1').clientHeight;
*/

var width = document.getElementById('svg0').clientWidth;
var height = document.getElementById('svg0').clientHeight;

//console.log(width);

var marginLeft = 0;
var marginTop = 0;

var chartBarheight = .35*height*.8;
var chartBarwidth = .35*width*.45;

var scaleX_chart = d3.scaleBand().range([0, chartBarwidth]).padding(0.2);
var scaleY_floor = d3.scaleLinear().range([chartBarheight,0]);

var scaleY_height = d3.scaleLinear().range([chartBarheight,0]);
var scaleY_site_area = d3.scaleLinear().range([chartBarheight,0]);
var scaleY_year = d3.scaleLinear().range([chartBarheight,0]);

//draw the svg1 and svg2 canvas for the map and city axon drawing


var svg0 = d3.select('#svg0')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

var svg1 = d3.select('#svg1')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

var svg2 = d3.select('#svg2')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');


var scaleUsa;

scaleUsa = 1200 *(width/1600);
//map function for USA map
var albersProjection = d3.geoAlbersUsa()
    .scale(scaleUsa)
    .translate([(width/2), (height/2)]);

var path = d3.geoPath()
    .projection(albersProjection);

//variaty for the cities
var cityArrary = ['BOSTON IN MA',
    'NEW YORK IN NY',
    'CHICAGO IN IL',
    'LOS ANGELES IN CA',
    'PHOENIX IN AZ',
    'SEATTLE IN WA'];

//Downtown area position
var arrayList = [
    {long:-71.056612, lat:42.354175, name:'BOSTON IN MA', id:"BOSTON"},//boston
    {long:-73.96625, lat:40.78343, name:'NEW YORK IN NY', id:'NEWYORK'}, //newyork
    {long:-87.65005, lat:41.85003, name:'CHICAGO IN IL'}, //Chicago
    {long:-118.24368, lat:34.05223, name:'LOS ANGELES IN CA'}, //Los Angeles
    {long:-112.07404, lat:33.44838, name:'PHOENIX IN AZ'}, //Phoenix
    {long:-122.33207, lat:47.60621, name:'SEATTLE IN WA'} //Seatle
];

var centered;


//import the data from the .csv file
d3.json('./cb_2016_us_state_20m.json', function(dataIn){

/* it's not quite fit the browser
//////////////////--------------Define the map for the USA country--------------------------------////////////////
    var center = d3.geoCentroid(dataIn);
    var scale  = 900;
    var offset = [width/2-0.1*width, height/2-0.18*height];
    var projection = d3.geoMercator().scale(scale).center(center)
        .translate(offset);

// create the path
    var path = d3.geoPath().projection(projection);
///////////////----------------------end of the map function of USA------------------------------/////////////////
*/
    //console.log(dataIn);
    svg0.selectAll('path')
        .data(dataIn.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', 'gainsboro')
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

    var cityDots = svg0.selectAll('circle')
        .data(arrayList)//change to array of long and lat of cities; [{long:-71.0589, lat:42.3601}]
        .enter()
        .append('circle')
        .attr('class', 'cityCircle')
        .attr('cx', function (d){
            return albersProjection([d.long, d.lat])[0];
        })
        .attr('cy', function (d){
            return albersProjection([d.long, d.lat])[1];
        })
        .attr('r', 8)
        .attr('fill', 'steelblue')
        .attr('data-toggle',"tooltip")
        .attr('data-html', 'true')
        .attr('title', function(d){
            return d.name;
        })
        .attr('id', function(d){
                return d.id;
        })

        .on('mouseover', function(d){
            d3.select(this)
                .transition()
                .duration(2000)
                .ease(d3.easeBounce)
                .attr('fill', 'yellow')
                .attr('r', 20)
                .attr('opacity', .8);
        })
        .on('mouseout', function(d){
            d3.select(this)
                .transition()
                .duration(2000)
                .ease(d3.easeBounce)
                .attr('fill', 'steelblue')
                .attr('r', 8)
                .attr('opacity', 1);
        })
        .on('click', function(d){

            document.getElementById('welcomeForm').style.display = 'none';

            document.getElementById('cityForm').style.display = 'inline-block';
            document.getElementById('svgdiv1').style.display = 'inline-block';
            document.getElementById('svgdiv2').style.display = 'inline-block';
            document.getElementById('buttondiv_left').style.display = 'inline-block';
            document.getElementById('buttondiv_left').style.visibility = 'visible';

            //var selectDefault = 'BOSTON IN MA';
            var selectValue = d.name;
            drawMap(selectValue);

            d3.select('#city').property('value', selectValue);


        });
var highlightCity = svg0.selectAll('#'+ "BOSTON" +  ',#'+ "NEWYORK");
repeat();

    $('[data-toggle="tooltip"]').tooltip();

    function repeat(){
        highlightCity
            .attr('fill', 'steelblue')
            .attr('r', 8)
            .transition()
            .duration(1000)
            .attr('fill', 'yellow')
            .attr('r', 20)
            .transition()
            .duration(1000)
            .attr('fill', 'steelblue')
            .attr('r', 8)
            .on("end", repeat);
    }
});



d3.select('select')
    .on('change', function(d){
        var selectCity = d3.select('select').property('value');
        console.log(selectCity);
        document.getElementById('buttondiv_right').style.display = 'none';
        document.getElementById('compare_data').textContent = 'Data';

        drawMap(selectCity);

    });


function drawMap(selectCity){
    svg1.selectAll('path')
        .remove();
    svg1.selectAll('circle')
        .remove();
    svg1.selectAll('rect')
        .remove();
    svg1.selectAll('.axisGroup')
        .remove();

    svg2.selectAll('pattern')
        .remove();
    svg2.selectAll('circle')
        .remove();
    svg2.selectAll('rect')
        .remove();



    var widthSvg1 = document.getElementById('svg1').clientWidth;
    var heightSvg1 = document.getElementById('svg1').clientHeight;
    console.log(widthSvg1, heightSvg1);

    d3.json('./'+selectCity+'.json', function(dataIn){
        var center = d3.geoCentroid(dataIn);
        var scale  = 40000;
        var offset = [widthSvg1/2, heightSvg1/2];
        var projection = d3.geoMercator().center(center)
            .translate(offset);

        var cityScale=[3.2,1,1.2,0.6,0.7,0.6];
        if (selectCity == cityArrary[0]){
            scale = scale * cityScale[0];
        }
        else if(selectCity == cityArrary[1]){
            scale = scale * cityScale[1];
        }
        else if(selectCity == cityArrary[2]){
            scale = scale * cityScale[2];
        }
        else if(selectCity == cityArrary[3]){
            scale = scale * cityScale[3];
        }
        else if(selectCity == cityArrary[4]){
            scale = scale * cityScale[4];
        }
        else if(selectCity == cityArrary[5]){
            scale = scale * cityScale[5];
        }

        scale = scale * (widthSvg1/600);

        // create the path
        var pathCity = d3.geoPath().projection(projection.scale(scale));
        //console.log(dataIn.features);

        var pathMap= svg1.selectAll('path')
            .data(dataIn.features)
            .enter()
            .append('path')
            .attr('d',pathCity)
            .attr('fill', 'gainsboro')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('data-toggle',"tooltip")
            .attr('title', function(d){
                if (selectCity == 'BOSTON IN MA'){
                    return d.properties.name;
                }
                else {
                    return 'ZCTA5CE10: '+ d.properties.ZCTA5CE10;
                }

            })
            .on('mouseover', function(d){
                d3.select(this)
                    .attr('fill', 'yellow');
            })
            .on('mouseout', function(d){
                d3.select(this)
                    .attr('fill', 'gainsboro');
            })
            .on('click', mapClicked);

        ///center the map function//
        function mapClicked(d){
            var x, y, k;

            if (d && centered !== d) {
                var centroid = pathCity.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;
            } else {
                x = widthSvg1 / 2;
                y = heightSvg1 / 2;
                k = 1;
                centered = null;
            }

            svg1.selectAll("path")
                .classed("active", centered && function(d) { return d === centered; });

            svg1.transition()
                .duration(750)
                .attr("transform", "translate(" + widthSvg1 / 2 + "," + heightSvg1 / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");

        }
        //end of the center of map function//

        svg1.selectAll('circle')
            .data(arrayList)
            .enter()
            .append('circle')
            .attr('cx', function (d){
                return projection([d.long, d.lat])[0];
            })
            .attr('cy', function (d){
                return projection([d.long, d.lat])[1];
            })
            .attr('r', 10)
            .attr('fill', 'steelblue')
            .attr('data-toggle',"tooltip")
            .attr('title', 'CLICK TO SEE DOWNTOWN DISTRICT!')
            .on('mouseover', function(d){

                d3.select(this)
                //why this tooltip not work!

                    .transition()
                    .duration(2000)
                    .ease(d3.easeBounce)
                    .attr('fill', 'yellow')
                    .attr('r', 30)
                    .attr('opacity', .8)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 0.5);

            })

            .on('mouseout', function(d){
                d3.select(this)
                    .transition()
                    .duration(2000)
                    .ease(d3.easeBounce)
                    .attr('fill', 'steelblue')
                    .attr('stroke', 'none')
                    .attr('r', 10);
            })

            .on('click', function(d){
                
                document.getElementById('buttondiv_right').style.display = 'inline-block';
                document.getElementById('buttondiv_right').style.visibility = 'visible';

                d3.select(this)
                    .attr('fill', 'yellow')
                    .attr('r', 10);
                d3.select('.background')
                    .transition()
                    .duration(2000)
                    .ease(d3.easeBounce)
                    .attr('opacity', 1);

                d3.csv('./CityMap.csv', function(dataIn){

                    var selectCity = d3.select('select').property('value');

                    nestedData = d3.nest()
                        .key(function(d){return d.city})
                        .entries(dataIn);

                    var dataCity = dataIn.filter(function(d){
                        return d.city == selectCity;
                    });

                    svg2.selectAll('circle')
                        .data(dataCity)
                        .enter()
                        .append('circle')
                        .attr('class','myCircles');

                    drawPoints(dataCity);

                    svg2.selectAll('circle')
                        .transition()
                        .duration(2000)
                        .ease(d3.easeBounce)
                        .attr('opacity', 1);

                });

            });

        $('[data-toggle="tooltip"]').tooltip();


        var defs = svg2.append('defs');
        defs.append('pattern')
            .attr('id','bg')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', widthSvg1)
            .attr('height', heightSvg1)
            .append('image')
            .attr('xlink:href', function(d){
                return selectCity + '.png';
            })
            .attr('width', widthSvg1)
            .attr('height', heightSvg1)
            .attr('x', 0)
            .attr('y', 0);

        svg2.append('rect')
            .attr('class', 'background')
            .attr('width', widthSvg1)
            .attr('height', heightSvg1)
            .attr('fill', 'url(#bg)')
            .attr('opacity', 0);
    });
}


var nestedData = [];
/*
///////////////Button functions////////////////////////////////////
d3.select('#show_points')
    .on('click', function(){
        d3.csv('./CityMap.csv', function(dataIn){

            var selectCity = d3.select('select').property('value');

            nestedData = d3.nest()
                .key(function(d){return d.city})
                .entries(dataIn);

            dataCity = dataIn.filter(function(d){
                return d.city == selectCity;
            });

            svg2.selectAll('circle')
                .data(dataCity)
                .enter()
                .append('circle')
                .attr('class','myCircles');

            drawPoints(dataCity);

            svg2.selectAll('circle')
                .transition()
                .duration(2000)
                .ease(d3.easeBounce)
                .attr('opacity', 1);
        });
    });

*/


////////////////////////Button functions////////////////////////////////////
//----------------------Button - Back to Home-----------------------------//
d3.select('#back_Home')
    .on('click', function(){
        document.getElementById('welcomeForm').style.display = 'inline-block';

        document.getElementById('cityForm').style.display = 'none';
        document.getElementById('svgdiv1').style.display = 'none';
        document.getElementById('svgdiv2').style.display = 'none';
        document.getElementById('buttondiv_left').style.display = 'none';
        document.getElementById('buttondiv_right').style.display = 'none';
});

//----------------------Button - Compare data-----------------------------//
d3.select('#compare_data')
    .on('click', function(){      
        var text = document.getElementById('compare_data').textContent;
        if (text == 'Data') {
            document.getElementById('compare_data').textContent = 'Clear';
            d3.csv('./CityMap.csv', function(dataIn){
                var selectCity = d3.select('select').property('value');    
                nestedData = d3.nest()
                    .key(function(d){return d.city})
                    .entries(dataIn);              
    
                var dataCity = dataIn.filter(function(d){
                    return d.city == selectCity;});
    
                scaleX_chart.domain(dataCity.map(function(d){
                        return d.id;
                    })
                );
      
                var chartMarginleft = 50;
                var chartMargintop = 20;
        
    /////////////////----------------lighter the background----------------------------//////////////////
    
                svg1.selectAll('circle')
                    .transition()
                    .duration(1000)
                    .attr('opacity', .2);
    
                svg1.selectAll('path')
                    .transition()
                    .duration(1000)
                    .attr('opacity', .2);
    
    
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' + chartMarginleft + ',' + (chartMargintop+chartBarheight) + ')')
                    .call(d3.axisBottom(scaleX_chart));
                
                svg1.append('text')
                    .attr('class', 'axisGroup')
                    .attr('transform','translate(' + (chartMarginleft+chartBarwidth/2)+ ',' + (chartMargintop+chartBarheight*1.2) + ')')
                    .style('text-anchor', 'middle')
                    .text('Floors');
    
                scaleY_floor.domain([0,d3.max(dataCity.map(function(d){
                    return d.floor;
                }))]);
    
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' + chartMarginleft + ',' + chartMargintop + ')')
                    .call(d3.axisLeft(scaleY_floor));
    
    
                svg1.selectAll('.bars')
                    .data(dataCity)
                    .enter()
                    .append('rect')
                    .attr('class', 'floor')
                    .attr('fill', function(d){
                        return '#'+d.fill;
                    });
    
    
                drawBars_floor(dataCity,chartMarginleft,chartMargintop);
    
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' + (2*chartMarginleft + chartBarwidth)+',' + (chartMargintop+chartBarheight) + ')')
                    .call(d3.axisBottom(scaleX_chart));
       
                scaleY_height.domain([0,d3.max(dataCity.map(function(d){
                    return +d.height;
                }))]);

                svg1.append('text')
                    .attr('class', 'axisGroup')
                    .attr('transform','translate(' + (2*chartMarginleft+chartBarwidth*1.5)+ ',' + (chartMargintop+chartBarheight*1.2) + ')')
                    .style('text-anchor', 'middle')
                    .text('Height');
       
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' +(2*chartMarginleft + chartBarwidth)+ ',' + chartMargintop + ')')
                    .call(d3.axisLeft(scaleY_height));
    
                svg1.selectAll('.bars')
                    .data(dataCity)
                    .enter()
                    .append('rect')
                    .attr('class', 'height')
                    .attr('fill', function(d){
                        return '#'+d.fill;
                    });
    
                drawBars_height(dataCity,(2*chartMarginleft + chartBarwidth),chartMargintop);
       
                ////////////////////////////////////////////////////////////////////////////////////////////////////
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' + chartMarginleft+',' + (2*chartMargintop+3*chartBarheight) + ')')
                    .call(d3.axisBottom(scaleX_chart));    
    
                scaleY_site_area.domain([2000,d3.max(dataCity.map(function(d){
                    //console.log(d.site_area);
                    return +d.site_area;
                }))]);    
                
                //console.log(dataCity.map(function(d){
                //    return d.site_area;
                //}));   
                //console.log(scaleY_site_area.domain());
    
                svg1.append('text')
                    .attr('class', 'axisGroup')
                    .attr('transform','translate(' + (chartMarginleft+chartBarwidth/2)+ ',' + (2*chartMargintop+chartBarheight*3.2) + ')')
                    .style('text-anchor', 'middle')
                    .text('Sqf');
                
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' +chartMarginleft+ ',' + (2*chartMargintop + 2*chartBarheight)+ ')')
                    .call(d3.axisLeft(scaleY_site_area));
    
                svg1.selectAll('.bars')
                    .data(dataCity)
                    .enter()
                    .append('rect')
                    .attr('class', 'site_area')
                    .attr('fill', function(d){
                        return '#'+d.fill;
                    });
    
                drawBars_site_area(dataCity,chartMarginleft,(2*chartMargintop+2*chartBarheight));
    
                ////////////////////////////////////////////////////////////////////////////////////////////////////
                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' + (2*chartMarginleft + chartBarwidth)+',' + (2*chartMargintop+3*chartBarheight) + ')')
                    .call(d3.axisBottom(scaleX_chart));
    
    
                scaleY_year.domain([1950,d3.max(dataCity.map(function(d){
                    return d.year;
                }))]);
    
                svg1.append('text')
                    .attr('class', 'axisGroup')
                    .attr('transform','translate(' + (2*chartMarginleft+chartBarwidth*1.5)+ ',' + (2*chartMargintop+chartBarheight*3.2) + ')')
                    .style('text-anchor', 'middle')
                    .text('Built Years');

                svg1.append('g')
                    .attr('class', 'axisGroup')
                    .attr('transform', 'translate(' +(2*chartMarginleft + chartBarwidth)+ ',' + (2*chartMargintop + 2*chartBarheight)+ ')')
                    .call(d3.axisLeft(scaleY_year));
    
                svg1.selectAll('.bars')
                    .data(dataCity)
                    .enter()
                    .append('rect')
                    .attr('class', 'year')
                    .attr('fill', function(d){
                        return '#'+d.fill;
                    });
    
                drawBars_year(dataCity,(2*chartMarginleft + chartBarwidth),(2*chartMargintop+2*chartBarheight));                
            });
    
        } else {
            document.getElementById('compare_data').textContent = 'Data';
            svg1.selectAll('circle')
                    .transition()
                    .duration(1000)
                    .attr('opacity', 1);
    
            svg1.selectAll('path')
                .transition()
                .duration(1000)
                .attr('opacity', 1);
            
            svg1.selectAll('.axisGroup')
                .remove();

            svg1.selectAll('rect')
                .remove();
            
        }

    });



//////////////////////Draw cirlce function/////////////////////
function drawPoints(dataIn){
    var widthSvg2 = document.getElementById('svg2').clientWidth;
    var heightSvg2 = document.getElementById('svg2').clientHeight;

    var scaleX = d3.scaleLinear().range([0,widthSvg2]).domain([0,600]);
    var scaleY = d3.scaleLinear().range([0,heightSvg2]).domain([0,770]);

    svg2.selectAll('.myCircles')
        .data(dataIn)
        .attr('cx',function(d){
            return scaleX(d.x);
        })
        .attr('cy', function(d){
            return scaleY(d.y);
        })
        .attr('r', function(d){
            return d.r;
        })
        .attr('fill', function(d){
            return '#'+d.fill;
        })
        .attr('stroke', function(d){
            return d.stroke;
        })
        .attr('stroke-width',function(d){
            return d.strokewidth;
        })
        .attr('id', function(d){
            return d.id;
        })
        .on('mouseover', function(d) {
            d3.select(this)
                .attr('fill', 'yellow');

            var currentId = d3.select(this).attr('id');
            //console.log(currentId);
            svg1.selectAll('#'+currentId)
                .transition()
                .duration(1000)
                .attr('fill', 'yellow');
        })
        .on('mouseout', function(d){
            d3.select(this)
                .attr('fill', function(d){
                    return '#'+d.fill;
                });
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#' + currentId)
                .transition()
                .duration(1000)
                .attr('fill', function(d){
                return '#'+d.fill;
            });
        })

        .attr('data-toggle',"tooltip")
        .attr('data-html', 'true')
        .attr('title', function(d){
            return d.name + '<br />'+ d.height +' feet'+'<br />'+ d.site_area +' sqf'+'<br />'+ d.floor +' floors'
                +'<br />'+ 'Built in ' +d.year +' year';
        });

    $('[data-toggle="tooltip"]').tooltip();

}



/////////////////////////////////////////////////////////////////

function drawBars_floor(dataCity,chartMarginleft,chartMargintop){

    svg1.selectAll('.floor')
        .data(dataCity)
        .attr('x',function(d){
            //console.log(d.id);
            return scaleX_chart(d.id)+ chartMarginleft;
        })
        .attr('y',function(d){
            return scaleY_floor(d.floor)+chartMargintop;
        })
        .attr('width',scaleX_chart.bandwidth())//scaleX_chart.bandwidth()
        .attr('height',function(d){
            return chartBarheight - scaleY_floor(d.floor);
        })
        .attr('id', function(d){
            return d.id;
        })
        .attr('data-toggle',"tooltip")
        .attr('data-html', 'true')
        .attr('title', function(d){
            return d.floor + ' floors';
        })
        .on('mouseover', function(d){
            d3.select(this)
                .attr('fill', 'yellow');
            var currentId = d3.select(this).attr('id');
            //console.log(currentId);
            svg1.selectAll('#'+currentId).attr('fill', 'yellow');
            svg2.selectAll('#'+currentId)
                .transition()
                .duration(1000)
                .attr('r', 20)
                .attr('fill', 'yellow');
        })
        .on('mouseout', function(d){
            d3.select(this)
                .attr('fill', 'steelblue');
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#' + currentId).attr('fill', function(d){
                return '#'+d.fill;
            });
            svg2.selectAll('#' + currentId)
                .transition()
                .duration(1000)
                .attr('r', function(d){
                    return d.r;
                })
                .attr('fill', function(d){
                return '#'+d.fill;
            });
        });

    $('[data-toggle="tooltip"]').tooltip();
}

function drawBars_height(dataCity,chartMarginleft,chartMargintop){

    svg1.selectAll('.height')
        .data(dataCity)
        .attr('x',function(d){
            return scaleX_chart(d.id)+ chartMarginleft;
        })
        .attr('y',function(d){
            return scaleY_height(d.height)+chartMargintop;
        })
        .attr('width',scaleX_chart.bandwidth())
        .attr('height',function(d){
            return chartBarheight - scaleY_height(d.height);
        })
        .attr('id', function(d){
            return d.id;
        })
        .attr('data-toggle',"tooltip")
        .attr('data-html', 'true')
        .attr('title', function(d){
            return d.height +' feet height';
        })
        .on('mouseover', function(d){
            d3.select(this)
                .attr('fill', 'yellow');
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#'+currentId).attr('fill', 'yellow');
            svg2.selectAll('#'+currentId)
                .transition()
                .duration(1000)
                .attr('r', 20)
                .attr('fill', 'yellow');
        })
        .on('mouseout', function(d){
            d3.select(this)
                .attr('fill', function(d){
                    return '#'+d.fill;
                });
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#' + currentId).attr('fill', function(d){
                return '#'+d.fill;
            });
            svg2.selectAll('#' + currentId)
                .transition()
                .duration(1000)
                .attr('r', function(d){
                    return d.r;
                })
                .attr('fill', function(d){
                return '#'+d.fill;
            });
        });

    $('[data-toggle="tooltip"]').tooltip();
}

function drawBars_site_area(dataCity,chartMarginleft,chartMargintop){

    svg1.selectAll('.site_area')
        .data(dataCity)
        .attr('x',function(d){
            return scaleX_chart(d.id)+ chartMarginleft;
        })
        .attr('y',function(d){
            return scaleY_site_area(d.site_area)+chartMargintop;
        })
        .attr('width',scaleX_chart.bandwidth())
        .attr('height',function(d){
            return chartBarheight - scaleY_site_area(d.site_area);
        })
        .attr('id', function(d){
            return d.id;
        })
        .attr('data-toggle',"tooltip")
        .attr('data-html', 'true')
        .attr('title', function(d){
            return 'Gross area: '+d.site_area + ' sqf';
        })
        .on('mouseover', function(d){
            d3.select(this)
                .attr('fill', 'yellow');
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#'+currentId).attr('fill', 'yellow');
            svg2.selectAll('#'+currentId)
                .transition()
                .duration(1000)
                .attr('r', 20)
                .attr('fill', 'yellow');
        })
        .on('mouseout', function(d){
            d3.select(this)
                .attr('fill', function(d){
                    return '#'+d.fill;
                });
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#' + currentId).attr('fill', function(d){
                return '#'+d.fill;
            });
            svg2.selectAll('#' + currentId)
                .transition()
                .duration(1000)
                .attr('r', function(d){
                    return d.r;
                })
                .attr('fill', function(d){
                return '#'+d.fill;
            });
        });

    $('[data-toggle="tooltip"]').tooltip();
}

function drawBars_year(dataCity,chartMarginleft,chartMargintop){

    svg1.selectAll('.year')
        .data(dataCity)
        .attr('x',function(d){
            return scaleX_chart(d.id)+ chartMarginleft;
        })
        .attr('y',function(d){
            return scaleY_year(d.year)+chartMargintop;
        })
        .attr('width',scaleX_chart.bandwidth())
        .attr('height',function(d){
            return chartBarheight - scaleY_year(d.year);
        })
        .attr('id', function(d){
            return d.id;
        })
        .attr('data-toggle',"tooltip")
        .attr('data-html', 'true')
        .attr('title', function(d){
            return 'Built in '+ d.year + ' year';
        })
        .on('mouseover', function(d){
            d3.select(this)
                .attr('fill', 'yellow');
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#'+currentId).attr('fill', 'yellow');
            svg2.selectAll('#'+currentId)
                .transition()
                .duration(1000)
                .attr('r', 20)
                .attr('fill', 'yellow');
        })
        .on('mouseout', function(d){
            d3.select(this)
                .attr('fill', function(d){
                    return '#'+d.fill;
                });
            var currentId = d3.select(this).attr('id');
            svg1.selectAll('#' + currentId).attr('fill', function(d){
                return '#'+d.fill;
            });
            svg2.selectAll('#' + currentId)
                .transition()
                .duration(1000)
                .attr('r', function(d){
                    return d.r;
                })
                .attr('fill', function(d){
                return '#'+d.fill;
            });
        });

    $('[data-toggle="tooltip"]').tooltip();
}