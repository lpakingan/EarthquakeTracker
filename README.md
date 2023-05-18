# The Earthquake Tracker

## Description

The Earthquake Tracker displays earthquakes in a specified search area with the help of APIs. We used the [USGS Earthquake Catalog API](https://earthquake.usgs.gov/fdsnws/event/1/) that displays earthquakes according to search parameters you specify based on distance, magnitude, and time range. We also used the [Google Maps API](https://developers.google.com/maps) to display an updated static map of the data, with markers marking earthquakes that fit the search parameter criteria. 

### User Story
```
As a potential home buyer that wants to protect my 40 year purchase,
I want a map that shows earthquakes that occurred in the past 30 years,
So that I can decide to purchase earthquake insurance
```

## Installation

No installation is required to use the application. All you need is a Google Maps API key (instructions on how to obtain one can be found [here](https://developers.google.com/maps/documentation/javascript/get-api-key)).

The deployed application can be accessed at [this link](https://lpakingan.github.io/project-1-earthquake-tracker/).

## Usage

To conduct a search of earthquakes and a visualization of any searched results:

**For first time users of the tracker:** You will need to input your Google Maps API key in the pop up to store it. Once you enter a valid API key, your key will be stored and will be accessible for use each time you visit the tracker until you empty your local storage.

1. Enter a location in the search bar and click "Search". If the location search is successful, a pop-up containing search parameters will appear.
   Any location searches you input will be stored and your 5 most recent searches can be easily accessed.

   ![](https://github.com/lpakingan/project-1-earthquake-tracker/blob/liana-final-edit/assets/photos/updated_search.jpg)

2. Adjust the search parameters as desired, and click "Submit". If left blank, the default parameters for the search will be used.
   
   ![](https://github.com/lpakingan/project-1-earthquake-tracker/blob/liana-final-edit/assets/photos/updated_parameters.jpg)

3. The earthquake results that were pulled from the USGS API will be displayed in a numbered list on the left, and a map with markers for each earthquake created by the Google Maps API will be displayed on the right.

![](https://github.com/lpakingan/project-1-earthquake-tracker/blob/liana-final-edit/assets/photos/updated_results.jpg)

4. If you would like to sort your results, you can click on the "Sort" button above the earthquakes list. You can sort by either time or magnitude. If you enter a sort parameter, the map will also dynamically update to display your newly sorted results.

These instructions can also be found by clicking on the 'Help' button in the application.

## Credits
Special thanks to the collaborators of this project:

Jedidiah Chang (jedichang99)\
Rick Quinbar (RQuinbar)\
Liana Pakingan (lpakingan)

## License

N/A