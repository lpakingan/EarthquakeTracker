var mapsKey;

var parametersModal = document.getElementById('parameter-modal');

var apiKeyForm =  document.getElementById('api-key-form');

var mapsKey = '';
// Get any saved keys on page load
loadAPIKey();

function loadAPIKey() {
    var mapsKey = localStorage.getItem('mapsKey');

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
    var mapAPIKey = $('#map-key').val().trim();

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
    findCoordinates(locationInput);
});

$('.close').on('click', function () {
    parametersModal.style.display = 'none';
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
                } else if (earthquakes.features.length == 0) {
                    $('.earthquakes-message').text('No earthquakes fitting the search parameters were found.')
                } else if (earthquakes.features.length >= 100) {
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

var searchBar = document.getElementById('#search-input');
var searchHistory = document.getElementById('#searchHistory');

// Event listener for when the search bar is clicked
searchBar.addEventListener('click', function() {
  //showRecentSearches(this);
  console.log('test');
});

// Event listener for when a search is submitted
searchBar.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    saveSearch(this.value);
  }
});

// Function to show recent searches
function showRecentSearches(searchInput) {
  // Clear previous search history
  searchHistory.innerHTML = '';

  // Retrieve search history from local storage
  const searches = JSON.parse(localStorage.getItem('searches')) || [];

  // Display each search item in the search history
  searches.forEach(function(search) {
    const li = document.createElement('li');
    li.textContent = search;
    li.addEventListener('click', function() {
      searchInput.value = search;
      // Perform search based on selected item
      performSearch(search);
    });
    searchHistory.appendChild(li);
  });
}

// Function to save a search
function saveSearch(search) {
  // Retrieve existing search history from local storage
  const searches = JSON.parse(localStorage.getItem('searches')) || [];

  // Add the new search to the array
  searches.push(search);

  // Store the updated search history in local storage
  localStorage.setItem('searches', JSON.stringify(searches));
}

// Function to perform a search
function performSearch(search) {
  // Perform the search with the given search term
  console.log('Performing search for:', search);
}