import {csv} from 'd3';
import * as d3 from "d3";

function getFixedDate(s) {
 const parsedDate = new Date(s);
 const yy = parsedDate.getFullYear() % 100;
 const mm = parsedDate.getMonth();
 const dd = parsedDate.getDate();
 
 var yyyy = yy;
 
 if ( yyyy >= 29 && yyyy < 100) {
  yyyy += 1900;
 } else if (yyyy >= 0 && yyyy <= 18) {
  yyyy += 2000;
 }
 return new Date(yyyy, mm, dd);

}

export const parse = d => {
	let t0 = getFixedDate(d.Acquisition_Date);
	let t1 = t0.getFullYear();
	

	return {
		artist: d.Name,
		artist_id: d.Artist_ID,
		art_work: d.Title,
		department: d.Department,
		date: d.Date,
		acquistion_date: d.Acquisition_Date,
		acquistion_year: t1,
		classification: d.Classification
	};
}



export const parseArtist = d => {
	return {
		artist: d.Name,
		artist_id: d.Artist_ID,
		nationality: d.Nationality,
		gender: d.Gender,
		birth: d.Birth_Year,
		dead: d.Death_Year
	};
}


export const fetchCsv = (url, parse) => {
	return new Promise((resolve, reject) => {
		csv(url, parse, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		})
	});
}