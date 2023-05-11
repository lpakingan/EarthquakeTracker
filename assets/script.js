var mapsKey;

var parametersModal = document.getElementById('parameter-modal');

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