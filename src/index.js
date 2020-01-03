'use strict'

import * as d3 from "d3";
import ScrollMagic from 'scrollmagic';
import { SearchBox } from './components/searchbox';
import { Timeline, TimelineAxis } from './components/timeline';
import { TreeMap } from './components/treemap';
import { StackedYearProgress } from './components/stackedyearprogress';

import 'jquery';
import 'bootstrap-loader';
import './style/main.css'

//Import utility function
import { parse, parseArtist, fetchCsv } from './utils';


function numberRange(start, end) {
	return new Array(end - start).fill().map((d, i) => i + start);
}


// scroll magic hook
const hook = d3.select('body')
	.append('div')
	.classed('hook', true);

const scroller = new ScrollMagic.Controller();

const dispatch = d3.dispatch('enterYear', 'leaveYear', 'enterHead', 'enterFoot');

//Import data using the Promise interface
Promise.all([
		fetchCsv('./data/artworks.csv', parse, ),
		fetchCsv('./data/artists.csv', parseArtist)
	])
	.then(([artworks, artists]) => {

		// filter all artworks with clear acquistion year... 
		artworks = artworks.filter(d=> d.acquistion_year);

		const earliest_time = Number(d3.min(artworks, d => { return d.acquistion_year || Number.MAX_SAFE_INTEGER }));
		const latest_time = Number(d3.max(artworks, d => { return d.acquistion_year || Number.MIN_SAFE_INTEGER }));

		const artworksSorted = artworks.sort(function (a, b) {
			return a.acquistion_year - b.acquistion_year;
		});

		/*---------------------------------------------Data Processing--------------------------------------------*/
		
		let expect_scroll_year = 0; // a flag used to temprary disable year change notification so that we can quickly jump
		let scrolledYear = 0;
		let highlightYears = [];
		let selectedArtist = null;

		
		let artist_year = d3.nest()
			.key( d => d.artist)
			.key( d => d.acquistion_year)
			.entries(artworksSorted);
		
		let all_artists = artist_year.map(d=>d.key);
		
		let artist_year_map = [];
		artist_year.forEach(function(d){
			artist_year_map[d.key] = d.values.map(d=>d.key);
		});

		// console.log(artist_year);
		// console.log(artist_year_map);

		let department_year = d3.nest()
			.key(function (d) { return d.department })
			.key(function (d) { return d.acquistion_year })
			.rollup(d => { return d.length })
			.entries(artworksSorted);

		let all_departments = department_year.map(d=>d.key);

		let year_department_artist = d3.nest()
			.key(function (d) { return d.acquistion_year })
			.key(function (d) { return d.department })
			.key(function (d) { return d.artist })
			.rollup(d => { return d.length })
			.entries(artworksSorted);

		//define the transtion function
		var transition_t = d3.transition()
    			.duration(2000)
    			.ease(d3.easeLinear);
		/*---------------------------------------------END Data Processing------------------------------------------*/

		// scroll To handler when called by timeline overview
		function updateScroll(year) {
			expect_scroll_year = year;
			let scene_elem = $(`div.year-node[data-year="${year}"]`);
			let offset =  scene_elem.offset().top;
			let height = scene_elem.innerHeight();
			let hook_pos = $('div.hook').position().top;
			scroller.scrollTo(offset + height/2-hook_pos);
		}


		// timeline overview, the years in which the selected artist's artworks are collected will be highlightd
		function updateTimelineAxis() {
			d3.select('#timeline-axis').each(
				TimelineAxis(updateScroll)
					.current(scrolledYear)
					.highlights(highlightYears)
			);
		}

		// treemap
		function updateTreemap() {
			$('#TreemapTable').empty();
			d3.select('#TreemapTable')
				.datum(year_department_artist.filter(d=>d.key == scrolledYear))
				.each(TreeMap()
					.departments(all_departments)
					.highlight_artist(selectedArtist)
					.highlight_color('yellow')
					//.width(600)
					//.height(400)
			
			);
		}

		// stackbar
		function updateStackBar() {
			d3.select('#stackedbar')
				.datum(department_year)
				.each(StackedYearProgress()
					.startyear(1929)
					.margin({ t:30, r: 0, b: 30, l: 50 })
					.currentyear(scrolledYear)
				);
		}

		/*---------------------------------------------Layout Processing--------------------------------------------*/


		// search input 
		d3.select('#search-input')
			.datum(all_artists)
			.each(SearchBox());

		// search handler
		d3.select('#search-artist')
			.on('click', function(e) {
				selectedArtist = d3.select('#artist-search-input').node().value;
				console.log(`Going to highlight years with artist ${selectedArtist}`);
				highlightYears = (selectedArtist && selectedArtist in artist_year_map) ? artist_year_map[selectedArtist] : [];
				updateTimelineAxis();
				updateTreemap();
			});

		//clear handler
		d3.select('#search-clear')
			.on('click', function(e) {
				d3.select('#artist-search-input').node().value = "";
				console.log(`Clear artist search`);
				selectedArtist = null;
				highlightYears = [];
				updateTimelineAxis();
				updateTreemap();
			});

		// scrollable timeline
		d3.select('#timeline').each(
			Timeline()
				.scroller(scroller)
				.begin(earliest_time)
				.end(latest_time)
				.enterDispatcher(dispatch, 'enterYear')
				.leaveDispatcher(dispatch, 'leaveYear')
				.enterHead(dispatch, 'enterHead')
				.enterFoot(dispatch, 'enterFoot')
				//.padding({ t: $(window).height()/2, r: 10, b: $(window).height()/2, l: 10 })
				.hookPosition(0.2)
		);

		// initialize timeline summary
		updateTimelineAxis();



		/*Dispatch function*/
		dispatch.on('enterYear', function (year) {

			if(expect_scroll_year) {
				if(expect_scroll_year != year) { 
					console.log(`Expected year: ${expect_scroll_year}, current scroll pos: ${year}, skipping...`);
					return;
				} else {
					expect_scroll_year = 0; // reset
				}
			}

			scrolledYear = year;

			updateTimelineAxis();

			updateTreemap();

			updateStackBar();
			d3.selectAll('#searchbar').style('visibility','visible');

			d3.selectAll('.head-area').style('visibility', 'hidden');
		
			d3.selectAll('.main-area').style('visibility', 'visible');
		
			d3.selectAll('.hook').style('visibility', 'visible');
			d3.selectAll('.foot-area').style('visibility', 'hidden');
	
		});

		dispatch.on('enterHead', function() {
			 d3.selectAll('#searchbar').style('visibility','hidden');
		

			d3.selectAll('.head-area').style('visibility', 'visible');
		
			
			d3.selectAll('.main-area').style('visibility', 'hidden');
			
			d3.selectAll('.hook').style('visibility', 'hidden');
			d3.selectAll('.foot-area').style('visibility', 'hidden');
		
		});

		dispatch.on('enterFoot', function() {
			d3.selectAll('#searchbar').style('visibility','hidden');
			d3.selectAll('.head-area').style('visibility', 'hidden');
		
			d3.selectAll('.main-area').style('visibility', 'hidden');
		
			d3.selectAll('.hook').style('visibility', 'hidden');
			d3.selectAll('.foot-area').style('visibility', 'visible');
		
		});


		// initialize state, scroll to first year
		// updateScroll(earliest_time);

	})
	.catch(error => {
		console.log(error);
	})






