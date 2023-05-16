//Maps API Key
var mapsKey;

//Form Elements
var parametersModal = document.getElementById('parameter-modal');
var apiKeyForm =  document.getElementById('api-key-form');
var searchHistory = document.getElementById('searchHistory');
var searchInput = document.getElementById('search-input');
var sortModal = document.getElementById('sort-modal');
var sortButton = document.querySelector('.sort-button');
var searchResultsEl = document.querySelector('.earthquake-results');

// Get any saved keys on page load
loadAPIKey();

// Gets saved API Key, hides api key entry form if found
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

// When the form is submitted, save the keys to localStorage and then reload them into the app to remove the display
function handleFormSubmit(event) {
    event.preventDefault();
    mapAPIKey = $('#map-key').val().trim();

    saveAPIKey(mapAPIKey);
    loadAPIKey();

}

//Handles Clicking the 'Search' Button
$('#location-button').on('click', function() {
    handleSearch();
});

//'Enter' key event listener for Search
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Main search function, clears previous results, saves search to storage, performs the new search
// and displays results
function handleSearch(){
    //Trim the search input
    locationInput = $('#search-input').val().trim();
    console.log(locationInput);

    if(locationInput == '' || !locationInput) {
        $('.location-warning').text('Please enter a valid location.');
    } else {
    //Clear Previous Search Results and Params
    clearPreviousResults();

    //Save the search to storage
    savesearchtostorage(locationInput);

    //Find results and display
    findCoordinates(locationInput);
    }
}

// Main Search function with Given Search Input (used for clicking history list)
function handleHistorySearch(historyInput){
    //Trim the search input
    console.log(historyInput);

    //Clear Previous Search Results and Params
    clearPreviousResults();

    //Save the search to storage
    savesearchtostorage(historyInput);

    //Find results and display
    findCoordinates(historyInput);
}

// Clears previous search results and other info
function clearPreviousResults(){
    console.log('Clearing Previous Results..');
    // clear previous results and params
    $('.earthquake-results ol').empty();
    $('.earthquake-parameters').text('');
    $('.map-result').empty();
    $('.radius-warning').text('');
    sortButton.style.display = 'none';
    searchResultsEl.style.display = 'none';
    // Clear previous search history
    searchHistory.innerHTML = '';
}

//Hides Modal on clicking close
$('.close').on('click', function () {
    parametersModal.style.display = 'none';
})

//Submits final Search with EQ parameters
$('#parameters-button').on('click', function () {
    
    //check and handle radius entry    
    searchRadius = $('#search-radius').val().trim();
    if(isNaN(searchRadius)) {
        $('.radius-warning').text('Must enter a valid number!')
        searchRadius = NaN
    } else if(!searchRadius) {
        searchRadius = 20;
    }
    console.log(`Specified search radius: ${searchRadius}`);

    //get eq magnitude
    minMagnitude = $('#min-magnitude').find(':selected').val();
    minMagnitude = minMagnitude.substring(1,4)
    console.log(`Specified minimum magnitude: ${minMagnitude}`);

    //get eq start date
    startTime = $('#start-date').val();
    if(!startTime) {
        startTime = (dayjs().unix() - 604800);
        startTime = dayjs.unix(startTime).format('DD-MM-YYYY')
    }
    console.log(`Specified start of search: ${startTime}`);

    //get eq end date
    endTime = $('#end-date').val();
    if(!endTime) {
        endTime = dayjs().format('DD-MM-YYYY');
    }
    console.log(`Specified end of search: ${endTime}`);
 
    //get map type
    mapType = $('#map-type').find(':selected').val();
    console.log(`Specified map time: ${mapType}`);

    //if all params are entered, hide display and find the earthquakes based on params
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

//Saves search to storage
function savesearchtostorage(locationInput) {
    console.log('saving search to storage...');
    
    // Retrieve existing search history from local storage
    const searches = JSON.parse(localStorage.getItem('searches')) || [];
    
    // Check if the current search already exists in the search history
    const existingIndex = searches.findIndex(search => search === locationInput);
    
    // If the search exists, remove it from the array
    if (existingIndex !== -1) {
        searches.splice(existingIndex, 1);
    }
    
    // Add the new search to the array
    searches.unshift(locationInput);

    // limit searches to 5
    if (searches.length > 5) {
        searches.splice (5);
    }

    // Store the updated search history in local storage
    localStorage.setItem('searches', JSON.stringify(searches));

    // Display the last 5 search items in the search history
    const last5Searches = searches.slice(-5);
    last5Searches.forEach(function(search) {
        console.log('creating element...');
        const li = document.createElement('button');
        li.textContent = search;
        // add style to cursor
        li.classList.add('search-history-item')

        //Add event listener to be able to click history
        li.addEventListener('click', function() {
            //Perform search based on selected item
            handleHistorySearch(li.textContent);
        });           
        searchHistory.appendChild(li);
    });
};

//get location latitude and longitude based on user entry
function findCoordinates(locationInput) {
    console.log('finding coordinates...');
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

//uses entered params with latitude and longitude to list and visualize EQs
function findEarthquakes(latitude, longitude, searchRadius, minMagnitude, startTime, endTime) {
    console.log('finding earthquakes...');
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
                    searchResultsEl.style.display = 'flex';
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

//Displays given parameters and iterates through earthquakes found to display results 
function listEarthquakes(earthquakes) {
    console.log("listing earthquakes...");
    //$('.earthquake-results ol').empty(); part of clear
    $('.earthquake-parameters').text(`Showing ${earthquakes.features.length} earthquakes that happened between ${startTime} to ${endTime} that were M${minMagnitude} or greater`);
    for(var i = 0; i < earthquakes.features.length; i++) {
        var earthquakeTime = dayjs.unix(earthquakes.features[i].properties.time/1000).format('M/D/YY [at] hh:mm:ss a')
        $('.earthquake-results ol').append(`<li>Time: ${earthquakeTime} <br>Place: ${earthquakes.features[i].properties.place} <br>Magnitude: ${earthquakes.features[i].properties.mag}</li>`)
    }
}

//Creates a map with markers on selected location, adding markers for each earthquake found near location.
function visualizeEarthquakes(earthquakes) {
    console.log('visualizing earthquakes...');
    //vars for eq and location markers
    earthquakeMarkers = '';
    locationMarker = '&markers=color:red%7C' + latitude + ',' + longitude;

    //creates earthquake markers
    for(var i = 0; i < earthquakes.features.length; i++) {
        earthquakeLon = earthquakes.features[i].geometry.coordinates[0];
        earthquakeLat = earthquakes.features[i].geometry.coordinates[1];
        earthquakeMarkers += '&markers=color:blue%7Clabel:' + [i+1] + '%7C' + earthquakeLat + ',' + earthquakeLon;
    }

    //defines zoom of map based on search radius 
    if(searchRadius < 50) {
        zoom = 10;
    } else if (searchRadius >= 50 && searchRadius < 150) {
        zoom = 8;
    } else if (searchRadius >= 150 && searchRadius <= 300) {
        zoom = 7;
    } else {
        zoom = 5;
    }

    //using location and earthquake markers, create the image
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

function init() {
    const searches = JSON.parse(localStorage.getItem('searches')) || []

    const last5Searches = searches.slice(-5);
    last5Searches.forEach(function(search) {
        console.log('creating element...');
        const li = document.createElement('button');
        li.textContent = search;
        // add style to cursor
        li.classList.add('search-history-item')

        //Add event listener to be able to click history
        li.addEventListener('click', function() {
            //Perform search based on selected item
            handleHistorySearch(li.textContent);
        });           
        searchHistory.appendChild(li);
    });
}

init();

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
