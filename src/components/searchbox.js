import * as d3 from 'd3';


export function SearchBox(_) {
    const _datalist_name = 'artist-datalist'

    function exports(data) {
        let that = this;

        let inputUpdate = d3.select(that).selectAll('input').data([1]);
        let inputEnter = inputUpdate.enter().append('input');
        inputUpdate.exit().remove()
        let input = inputUpdate.merge(inputEnter);

        input.attr('id', 'artist-search-input')
            .attr('type', 'text')
            .attr('list', _datalist_name)
            .attr('placeholder', "Artist");
        
        let datalistUpdate = d3.select(that).selectAll('datalist').data([1]);
        let datalistEnter = datalistUpdate.enter().append('datalist');
        datalistUpdate.exit().remove();
        let datalist = datalistUpdate.merge(datalistEnter);

        datalist.attr('id', _datalist_name)

        let optionsUpdate = datalist.selectAll('option').data(data);
        let optionsEnter = optionsUpdate.enter().append('option');
        optionsUpdate.exit().remove();
        let options = optionsUpdate.merge(optionsEnter);

        options.attr('value', d => d);



    }

    return exports;
}