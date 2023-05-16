var mapsKey;

var parametersModal = document.getElementById('parameter-modal');
var sortModal = document.getElementById('sort-modal');
var sortButton = document.querySelector('.sort-button');
var searchResultsEl = document.querySelector('.earthquake-results');

var apiKeyForm =  document.getElementById('api-key-form');

// Get any saved keys on page load
loadAPIKey();

function loadAPIKey() {
    mapsKey = localStorage.getItem('mapsKey');

    if (!mapsKey) {
      apiKeyForm.style.display = 'flex';
      apiKeyForm.addEventListener('submit', handleFormSubmit);
    } else {
      apiKeyForm.style.display = 'none';
      apiKeyForm.removeEventListener('submit', handleFormSubmit);
    }
  }

  // Saves the API keys to localStorage
  function saveAPIKey(mapAPIKey) {
    localStorage.setItem('mapsKey', mapAPIKey);
  }

  // When the form is submitted, save the keys to localStorage and then load them into the app
  function handleFormSubmit(event) {
    event.preventDefault();
    mapAPIKey = $('#map-key').val().trim();

    saveAPIKey(mapAPIKey);
    loadAPIKey();

  }

$('#location-button').on('click', function() {
    locationInput = $('#search-input').val().trim();
    console.log(locationInput);
    $('.earthquake-results ol').empty();
    $('.earthquake-parameters').text('');
    $('.map-result').empty();
    $('.radius-warning').text('')
    sortButton.style.display = 'none';
    searchResultsEl.style.display = 'none';
    findCoordinates(locationInput);
});

$('.close').on('click', function () {
    parametersModal.style.display = 'none';
    sortModal.style.display = 'none';
})

$('#parameters-button').on('click', function () {
    searchRadius = $('#search-radius').val().trim();
    if(isNaN(searchRadius)) {
        $('.radius-warning').text('Must enter a valid number!')
        searchRadius = NaN
    } else if(!searchRadius) {
        searchRadius = 20;
    }
    console.log(`Specified search radius: ${searchRadius}`);

    minMagnitude = $('#min-magnitude').find(':selected').val();
    minMagnitude = minMagnitude.substring(1,4)
    console.log(`Specified minimum magnitude: ${minMagnitude}`);

    startTime = $('#start-date').val();
    if(!startTime) {
        startTime = (dayjs().unix() - 604800);
        startTime = dayjs.unix(startTime).format('DD-MM-YYYY')
    }
    console.log(`Specified start of search: ${startTime}`);

    endTime = $('#end-date').val();
    if(!endTime) {
        endTime = dayjs().format('DD-MM-YYYY');
    }
    console.log(`Specified end of search: ${endTime}`);
 
    mapType = $('#map-type').find(':selected').val();
    console.log(`Specified map time: ${mapType}`);


    if(searchRadius && minMagnitude && startTime && endTime) {
        parametersModal.style.display = 'none';
        findEarthquakes(latitude, longitude, searchRadius, minMagnitude, startTime, endTime)
    }
})

$('.sort-button').on('click', function () {
    sortModal.style.display = 'block';
})

$('.submit-button').on('click', function () {
    sortModal.style.display = 'none'
    sortValue = $('#sort-parameters').find(':selected').val();
    sortMagnitude(sortValue, earthquakes);
})

function findCoordinates(locationInput) {
    var geocodingQuery = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationInput}&key=${mapsKey}`;
    fetch(geocodingQuery).then(function (response) {
        if (response.ok) {
            response.json().then(function (searchResults) {
                results = searchResults;
                if(results.status == 'OK') {
                    $('.location-warning').text('')
                    latitude = results.results[0].geometry.location.lat;
                    longitude = results.results[0].geometry.location.lng;
                    parametersModal.style.display = 'block';
                } else if (results.status == 'ZERO_RESULTS') {
                    $('.location-warning').text('Zero results found! Please search again.')
                }
            });
        } else {
            $('.location-warning').text('Please enter a valid location.');
        }
    });
};

function findEarthquakes(latitude, longitude, searchRadius, minMagnitude, startTime, endTime) {
    var earthquakeQuery = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${latitude}&longitude=${longitude}&maxradiuskm=${searchRadius}&minmagnitude=${minMagnitude}&starttime=${startTime}&endtime=${endTime}`
    fetch(earthquakeQuery).then(function (response) {
        if (response.ok) {
            response.json().then(function (earthquakeResults) {
                earthquakes = earthquakeResults;
                if(earthquakes.features.length > 0 && earthquakes.features.length < 100) {
                    $('.earthquakes-message').text('');
                    listEarthquakes(earthquakes);
                    visualizeEarthquakes(earthquakes);
                    sortButton.style.display = 'block';
                    searchResultsEl.style.display = 'block';
                } else if (earthquakes.features.length == 0) {
                    searchResultsEl.style.display = 'block';
                    $('.earthquakes-message').text('No earthquakes fitting the search parameters were found.')
                } else if (earthquakes.features.length >= 100) {
                    searchResultsEl.style.display = 'block';
                    $('.earthquakes-message').text('Too many earthquakes found within search window! Please narrow your parameters.')
                }
            });
        } else {
            alert('Unable to search! Please try again.');
        }
    });
};

function listEarthquakes(earthquakes) {
    $('.earthquake-results ol').empty();
    $('.earthquake-parameters').text(`Showing ${earthquakes.features.length} earthquakes that happened between ${startTime} to ${endTime} that were M${minMagnitude} or greater`);
    for(var i = 0; i < earthquakes.features.length; i++) {
        var earthquakeTime = dayjs.unix(earthquakes.features[i].properties.time/1000).format('M/D/YY [at] hh:mm:ss a')
        $('.earthquake-results ol').append(`<li>Time: ${earthquakeTime} <br>Place: ${earthquakes.features[i].properties.place} <br>Magnitude: ${earthquakes.features[i].properties.mag}</li>`)
    }
}

function visualizeEarthquakes(earthquakes) {
    earthquakeMarkers = '';
    locationMarker = '&markers=color:red%7C' + latitude + ',' + longitude;

    for(var i = 0; i < earthquakes.features.length; i++) {
        earthquakeLon = earthquakes.features[i].geometry.coordinates[0];
        earthquakeLat = earthquakes.features[i].geometry.coordinates[1];
        earthquakeMarkers += '&markers=color:blue%7Clabel:' + [i+1] + '%7C' + earthquakeLat + ',' + earthquakeLon;
    }

    if(searchRadius < 50) {
        zoom = 10;
    } else if (searchRadius >= 50 && searchRadius < 150) {
        zoom = 8;
    } else if (searchRadius >= 150 && searchRadius <= 300) {
        zoom = 7;
    } else {
        zoom = 5;
    }

    mapQuery = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=800x800&maptype=${mapType}${locationMarker}${earthquakeMarkers}&key=${mapsKey}`;
    fetch(mapQuery).then(function (response) {
        if (response.ok) {
            map = document.createElement('img');
            map.src = (mapQuery);
            map.classList = 'map-img';
            $('.map-result').append(map);
        }
    })
}

function sortMagnitude (sortValue, earthquakes) {
    if(sortValue == 'most-recent') {
        $('.map-result').empty();
        $('.earthquake-results ol').empty();
        $('.earthquake-parameters').text('');
        listEarthquakes(earthquakes);
        visualizeEarthquakes(earthquakes);
        $('.earthquake-parameters').text(`Showing earthquakes from most to least recent:`)

    } else if (sortValue == 'least-recent') {
        earthquakeProperties = earthquakes.features.toReversed();
        $('.earthquake-results ol').empty();
        $('.earthquake-parameters').text('');
        $('.earthquake-parameters').text(`Showing earthquakes from least to most recent:`);
        for(var i = 0; i < earthquakeProperties.length; i++) {
            var earthquakeTime = dayjs.unix(earthquakeProperties[i].properties.time/1000).format('M/D/YY [at] hh:mm:ss a')
            $('.earthquake-results ol').append(`<li>Time: ${earthquakeTime} <br>Place: ${earthquakeProperties[i].properties.place} <br>Magnitude: ${earthquakeProperties[i].properties.mag}</li>`)
        }
        
    } else if(sortValue == 'descending-mag') {
        $('.earthquake-results ol').empty();
        $('.earthquake-parameters').text('');
        $('.earthquake-parameters').text('Showing earthquakes from strongest to weakest:');
        earthquakeMagnitudes = [];
        earthquakeProperties = [];
        for(var i = 0; i < earthquakes.features.length; i++) {
            earthquakeMagnitudes.push(earthquakes.features[i].properties.mag)
        }

        earthquakeMagnitudes.sort(function(a,b){return b-a})

        for(var i = 0; i < earthquakeMagnitudes.length; i++) {
            var earthquakeMagnitude = earthquakeMagnitudes[i];
            for(var x = 0; x < earthquakes.features.length; x++) {
                if(earthquakeMagnitude == earthquakes.features[x].properties.mag && !earthquakeProperties.includes(earthquakes.features[x])) {
                    earthquakeProperties.push(earthquakes.features[x])
                    var earthquakeTime = dayjs.unix(earthquakes.features[x].properties.time/1000).format('M/D/YY [at] hh:mm:ss a')
                    $('.earthquake-results ol').append(`<li>Magnitude: ${earthquakes.features[x].properties.mag} <br>Place: ${earthquakes.features[x].properties.place} <br>Time: ${earthquakeTime}</li>`)
            }
        }}

    } else if (sortValue == 'ascending-mag') {
        $('.earthquake-results ol').empty();
        $('.earthquake-parameters').text('');
        $('.earthquake-parameters').text('Showing earthquakes from weakest to strongest:');
        earthquakeMagnitudes = [];
        earthquakeProperties = [];
        for(var i = 0; i < earthquakes.features.length; i++) {
            earthquakeMagnitudes.push(earthquakes.features[i].properties.mag)
        }

        earthquakeMagnitudes.sort(function(a,b){return a-b})

        for(var i = 0; i < earthquakeMagnitudes.length; i++) {
            var earthquakeMagnitude = earthquakeMagnitudes[i];
            for(var x = 0; x < earthquakes.features.length; x++) {
                if(earthquakeMagnitude == earthquakes.features[x].properties.mag && !earthquakeProperties.includes(earthquakes.features[x])) {
                    earthquakeProperties.push(earthquakes.features[x])
                    var earthquakeTime = dayjs.unix(earthquakes.features[x].properties.time/1000).format('M/D/YY [at] hh:mm:ss a')
                    $('.earthquake-results ol').append(`<li>Magnitude: ${earthquakes.features[x].properties.mag} <br>Place: ${earthquakes.features[x].properties.place} <br>Time: ${earthquakeTime}</li>`)
            }
        }}
    }

    if(sortValue !== 'most-recent') {
        $('.map-result').empty();
        earthquakeMarkers = '';
        locationMarker = '&markers=color:red%7C' + latitude + ',' + longitude;

        for(var i = 0; i < earthquakeProperties.length; i++) {
            earthquakeLon = earthquakeProperties[i].geometry.coordinates[0];
            earthquakeLat = earthquakeProperties[i].geometry.coordinates[1];
            earthquakeMarkers += '&markers=color:blue%7Clabel:' + [i+1] + '%7C' + earthquakeLat + ',' + earthquakeLon;
        }

        if(searchRadius < 50) {
            zoom = 10;
        } else if (searchRadius >= 50 && searchRadius < 150) {
        zoom = 8;
        } else if (searchRadius >= 150 && searchRadius <= 300) {
            zoom = 7;
        } else {
            zoom = 5;
        }

        mapQuery = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=800x800&maptype=${mapType}${locationMarker}${earthquakeMarkers}&key=${mapsKey}`;
        fetch(mapQuery).then(function (response) {
            if (response.ok) {
                map = document.createElement('img');
                map.src = (mapQuery);
                map.classList = 'map-img';
                $('.map-result').append(map);
            }
        })
    }
}


// Get the help button and modal elements
var helpButton = document.getElementById("help-button");
var helpModal = document.getElementById("help-modal");

// Get the close button element
var closeButton = helpModal.querySelector(".close");

// When the user clicks the help button, show the help modal
helpButton.addEventListener("click", function () {
  helpModal.style.display = "block";
});

// When the user clicks the close button or outside the modal, hide the modal
window.addEventListener("click", function (event) {
  if (event.target == helpModal || event.target == closeButton) {
    helpModal.style.display = "none";
  }
});
