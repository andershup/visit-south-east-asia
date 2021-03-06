// CODE ADAPTED FROM developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/places-autocomplete-hotelsearch

// Define var. Allocate country ISO IDs, location and zoom. Define search to restrict to selected country. 

var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = {
	'country': ['kh', 'id', 'la', 'my', 'mm', 'ph', 'sg', 'th', 'vn', ]
};
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

var countries = {
	'kh': {
		center: {
			lat: 12.812202,
			lng: 104.120895
		},
		zoom: 5
	},
	'id': {
		center: {
			lat: -8.759395,
			lng: 115.324468
		},
		zoom: 4
	},
	'la': {
		center: {
			lat: 18.436229,
			lng: 102.823787
		},
		zoom: 5
	},
	'my': {
		center: {
			lat: 3.991729,
			lng: 102.026593
		},
		zoom: 5
	},
	'mm': {
		center: {
			lat: 22.176772,
			lng: 96.168621
		},
		zoom: 5
	},
	'ph': {
		center: {
			lat: 12.886638,
			lng: 122.586546
		},
		zoom: 5
	},
	'sg': {
		center: {
			lat: 1.366079,
			lng: 103.796655
		},
		zoom: 9
	},
	'th': {
		center: {
			lat: 15.957531,
			lng: 100.865050
		},
		zoom: 5
	},
	'vn': {
		center: {
			lat: 17.872043,
			lng: 105.985417
		},
		zoom: 5
	},


};
/* Initialise the google map function
* Targeted to "map" element HTML
* Initial zoom set for south east asia
* Functions available to user set to true
*/ 

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: {
			lat: 11.621900,
			lng: 107.071500
		},
		mapTypeControl: false,
		panControl: false,
		zoomControl: true,
		streetViewControl: true
	});
 
    //Info content created.

	infoWindow = new google.maps.InfoWindow({
		content: document.getElementById('info-content')
	});


//Auto complete text box for city search with country restriction.

	autocomplete = new google.maps.places.Autocomplete(
		/** @type {!HTMLInputElement} */
		(
			document.getElementById('autocomplete')), {
			types: ['(cities)'],
			componentRestrictions: countryRestrict
		});
	places = new google.maps.places.PlacesService(map);

        //DOM event listener. Complete on user selection
    
	autocomplete.addListener('place_changed', onPlaceChanged);


	document.getElementById('country').addEventListener(
		'change', setAutocompleteCountry);
}


// zoom the map in on the city.

function onPlaceChanged() {
	var place = autocomplete.getPlace();
	if (place.geometry) {
		map.panTo(place.geometry.location);
		map.setZoom(15);
		search();
	} else {
		document.getElementById('autocomplete').placeholder = 'Enter a city';
	}
}

// Search for hotels in the selected city, within the viewport of the map.

function search() {
	var search = {
		bounds: map.getBounds(),
		types: ['lodging']
	};

	places.nearbySearch(search, function (results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			clearResults();
			clearMarkers();
			// Create a marker for each hotel found, and
			// assign a letter of the alphabetic to each marker icon.
			for (var i = 0; i < results.length; i++) {
				var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
				var markerIcon = MARKER_PATH + markerLetter + '.png';
				// Use marker animation to drop the icons incrementally on the map.
				markers[i] = new google.maps.Marker({
					position: results[i].geometry.location,
					animation: google.maps.Animation.DROP,
					icon: markerIcon
				});
				


				// If the user clicks a hotel marker, show the details of that hotel
				// in an info window.
				markers[i].placeResult = results[i];
				google.maps.event.addListener(markers[i], 'click', showInfoWindow);
				setTimeout(dropMarker(i), i * 100);
				addResult(results[i], i);
			}
		}
	});
}

function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
		if (markers[i]) {
			markers[i].setMap(null);
		}
	}
	markers = [];
}

// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
function setAutocompleteCountry() {
	var country = document.getElementById('country').value;
	if (country == 'all') {
		autocomplete.setComponentRestrictions({
			'country': []
		});
		map.setCenter({
			lat: 11.621900,
			lng: 107.071500
		});
		map.setZoom(4);
	} else {
		autocomplete.setComponentRestrictions({
			'country': country
		});
		map.setCenter(countries[country].center);
		map.setZoom(countries[country].zoom);
	}
	clearResults();
	clearMarkers();
}

function dropMarker(i) {
	return function () {
		markers[i].setMap(map);
	};
}

function addResult(result, i) {
	var results = document.getElementById('results');
	var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
	var markerIcon = MARKER_PATH + markerLetter + '.png';

	var tr = document.createElement('tr');
	tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
	tr.onclick = function () {
		google.maps.event.trigger(markers[i], 'click');
	};

	var iconTd = document.createElement('td');
	var nameTd = document.createElement('td');
	var icon = document.createElement('img');
	icon.src = markerIcon;
	icon.setAttribute('class', 'placeIcon');
	icon.setAttribute('className', 'placeIcon');
	var name = document.createTextNode(result.name);
	iconTd.appendChild(icon);
	nameTd.appendChild(name);
	tr.appendChild(iconTd);
	tr.appendChild(nameTd);
	results.appendChild(tr);
}

function clearResults() {
	var results = document.getElementById('results');
	while (results.childNodes[0]) {
		results.removeChild(results.childNodes[0]);
	}
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
	var marker = this;
	places.getDetails({
			placeId: marker.placeResult.place_id
		},
		function (place, status) {
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				return;
			}
			infoWindow.open(map, marker);
			buildIWContent(place);
		});
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
	document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
		'src="' + place.icon + '"/>';
	document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
		'">' + place.name + '</a></b>';
	document.getElementById('iw-address').textContent = place.vicinity;

	if (place.formatted_phone_number) {
		document.getElementById('iw-phone-row').style.display = '';
		document.getElementById('iw-phone').textContent =
			place.formatted_phone_number;
	} else {
		document.getElementById('iw-phone-row').style.display = 'none';
	}

     // assigning ratings to hotels
     
	if (place.rating) {
		var ratingHtml = '';
		for (var i = 0; i < 5; i++) {
			if (place.rating < (i + 0.5)) {
				ratingHtml += '&#10025;';
			} else {
				ratingHtml += '&#10029;';
			}
			document.getElementById('iw-rating-row').style.display = '';
			document.getElementById('iw-rating').innerHTML = ratingHtml;
		}
	} else {
		document.getElementById('iw-rating-row').style.display = 'none';
	}

    // assigning URLs
    
	if (place.website) {
		var fullUrl = place.website;
		var website = hostnameRegexp.exec(place.website);
		if (website === null) {
			website = 'http://' + place.website + '/';
			fullUrl = website;
		}
		document.getElementById('iw-website-row').style.display = '';
		document.getElementById('iw-website').textContent = website;
	} else {
		document.getElementById('iw-website-row').style.display = 'none';
	}
}

// functions to be initialised by the map-reset button html 

function buttonReset() {
	initMap();
	clearMarkers();
	clearResults();
	document.getElementById('autocomplete').value = '';
	document.getElementById('country').value = 'all';
}
      