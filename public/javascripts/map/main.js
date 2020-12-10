//for calculate Time
function calDate(dayon = 0) {
  const date = new Date();
  const newDate = date.setDate(date.getDate() + dayon);
  date.setTime(newDate);
  //get Month
  const currentMonth = date.getMonth() + 1 > 12 ? 1 : date.getMonth() + 1;
  //get Date
  const currentDate = date.getDate();
  //return DateString
  const dateString = `${currentMonth}/${currentDate}`;
  return dateString;
}

const app = new Vue({
  el: '#app',
  data: {
    initPlaceId: null,
    weekDate: [
      '今天',
      '明天',
      calDate(2),
      calDate(3),
      calDate(4),
    ],
    map: null,
    deleteIndex: null,
    lookfor: 'origin',
    lookforText: '設為起點',
    travelMode: "DRIVING",
    travelName: '',
    weather: {
      cityName: 'Taipei',
      country: 'TW',
      forecasts: [
        {
          icon: "10d",
          max: 24.32,
          min: 20.68,
        },
        {
          icon: "10d",
          max: 24.32,
          min: 20.68,
        },
        {
          icon: "10d",
          max: 24.32,
          min: 20.68,
        },
        {
          icon: "10d",
          max: 24.32,
          min: 20.68,
        },
        {
          icon: "10d",
          max: 24.32,
          min: 20.68,
        },
      ]
    },
    posts: [
    //   {
    //   article_id: 0,
    //   description: '暫無文章',
    //   img_path: '/images/map_noimage.jpg',
    //   title: '暫無文章'
    // },
    ],
    interests: [],
    layout: {
      markers: [],
      detailMarkers: [],
      markedMarkers: [],
      postMarkers: [],
      infowindow: null,
      infoContent: {
        // imgSrc: null,
        placeId: null,
        placeName: null,
        placeLatlng: null,
        placeAddress: null,
        placeOpenHour: null,
        placeTel: null,
        showResult: true,
      }
    },
    services: {
      distanceMatrixService: null,
      directionsService: null,
      directionsRenderer: null,
      geocoder: null,
    },
    libraries: {
      autocomplete: null,
      placesService: null,
    },
    originData: {
      placeId: null,
      placeName: null,
      placeLatlng: null,
      placeAddress: null,
    },
    terminalData: {
      placeId: null,
      placeName: null,
      placeLatlng: null,
      placeAddress: null,
    },
    distance: {},
    duration: {},
  },
  methods: {
    async initMap(location = { lat: 25.0475701, lng: 121.5166028 }) {
      //define Services
      this.services.distanceMatrixService = new google.maps.DistanceMatrixService();
      this.services.directionsService = new google.maps.DirectionsService();
      this.services.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#f25041",
          strokeOpacity: 1,
          strokeWeight: 5,
        }
      });
      this.services.geocoder = new google.maps.Geocoder();

      if (this.initPlaceId) {
        const returnLatLng = await new Promise((resolve, reject) => {
          this.services.geocoder.geocode({ 'placeId': this.initPlaceId }, function (results, status) {
            if (status == 'OK') {
              resolve(results[0].geometry.location);
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
              reject(status);
            }
          });
        })
        location = returnLatLng;
      }

      //define libraries
      this.libraries.autocomplete = new google.maps.places.Autocomplete(document.getElementById('searchBar'));

      //define infowindow
      this.layout.infowindow = new google.maps.InfoWindow({
        content: document.getElementById('infowindow-content'),
        pixelOffset: new google.maps.Size(0, -60)
      });
      //init map
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#d6e2e6"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#cfd4d5"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#7492a8"
              }
            ]
          },
          {
            "featureType": "administrative.neighborhood",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "lightness": 25
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#dde2e3"
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#cfd4d5"
              }
            ]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#dde2e3"
              }
            ]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#7492a8"
              }
            ]
          },
          {
            "featureType": "landscape.natural.terrain",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#dde2e3"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#588ca4"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.icon",
            "stylers": [
              {
                "saturation": -100
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#a9de83"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#bae6a1"
              }
            ]
          },
          {
            "featureType": "poi.sports_complex",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#c6e8b3"
              }
            ]
          },
          {
            "featureType": "poi.sports_complex",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#bae6a1"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#41626b"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "saturation": -45
              },
              {
                "lightness": 10
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#c1d1d6"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#a6b5bb"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#9fb6bd"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "labels.icon",
            "stylers": [
              {
                "saturation": -70
              }
            ]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#b4cbd4"
              }
            ]
          },
          {
            "featureType": "transit.line",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#588ca4"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#008cb5"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "transit.station.airport",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "saturation": -100
              },
              {
                "lightness": -5
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#a6cbe3"
              }
            ]
          }
        ],
      });

      this.currentCountry = '台灣';
      //define directionRenderer target &
      this.services.directionsRenderer.setMap(this.map);
      this.libraries.placesService = new google.maps.places.PlacesService(this.map);

      // define init marker
      if (this.initPlaceId) {
        postMarker = new google.maps.Marker({
          animation: google.maps.Animation.DROP,
          position: location,
          icon: { url: '/images/Pushpin-r.svg', scaledSize: new google.maps.Size(55, 55), origin: new google.maps.Point(-1, 0) }
        });
        this.libraries.placesService.getDetails({ placeId: this.initPlaceId }, (place, status) => {
          if (status === "OK") {
            console.log(place);

            if (place.address_components.length > 1) { //check whether target place is in any country
              for (let i = 0; i < place.address_components.length; i++) {
                const typesArr = place.address_components[i].types;
                if (typesArr.find(function (ele) { return ele === 'country'; })) {
                  this.currentCountry = place.address_components[i].long_name; // get country name or natural feature name
                }
              }
            } else {
              this.currentCountry = place.address_components[0].long_name;
            }


            const infoContent = this.layout.infoContent;
            infoContent.showResult = false;
            this.layout.infowindow.setPosition(location);

            infoContent.placeId = place.place_id;

            infoContent.placeName = place.name;
            infoContent.placeLatlng = place.geometry.location;
            infoContent.placeAddress = place.formatted_address;
            this.layout.infoContent.placeOpenHour = null;

            infoContent.placeTel = place.formatted_phone_number;
            if (this.distance.text && this.duration.text) {
              infoContent.showResult = true;
            }
            this.layout.infowindow.open(this.map);

          }
        })
        this.layout.markers.push(postMarker);
        this.layout.markers[0].setMap(this.map);
        postMarker.addListener('click', () => { this.layout.postMarkers[0].setMap(null) });
      }

      //add event
      this.map.addListener('click', this.onClick)
      this.libraries.autocomplete.addListener("place_changed", this.onPlaceChanged);
      this.map.addListener('click', () => {
        this.layout.infowindow.close();
      });
      // this.getWeather(location.lat(),location.lng());
    },
    forecastDetail() {
      $('#weatherShower').toggleClass('weather-open');
    },
    async getWeather(lat = 25.0475701, lng = 121.5166028, days = '5') {
      forecasts = await fetch(`https://community-open-weather-map.p.rapidapi.com/forecast/daily?lat=${lat}&lon=${lng}&cnt=${days}&units=metric&lang=zh_tw`, {
        "method": "GET",
        "headers": {
          "x-rapidapi-key": "YOUR_KEY",
          "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com"
        }
      })
        .then(response => {
          return response.json();
        })
        .catch(err => {
          console.error(err);
          return;
        });
      this.weather.cityName = forecasts.city.name;
      this.weather.country = forecasts.city.country;
      const forecastLangth = forecasts.list.length;
      //make forecasts empty every time the api connect.
      this.weather.forecasts = [];

      for (let i = 0; i < forecastLangth; i++) {
        const forecastObj = {};
        forecastObj.icon = forecasts.list[i].weather[0].icon;
        forecastObj.max = forecasts.list[i].temp.max;
        forecastObj.min = forecasts.list[i].temp.min;
        this.weather.forecasts.push(forecastObj);
      }
    },
    async onClick(event) {
      $('#postShower').removeClass('morePost');
      if (!event.placeId) {
        return;
      }
      console.log(event.placeId);
      this.posts =  [
      //   {
      //   article_id: 0,
      //   description: '暫無文章',
      //   img_path: '/images/map_noimage.jpg',
      //   title: '暫無文章'
      // },
      ]

      let queryURL = '/map/schArt?placeId=';
      queryURL += event.placeId;
      resultPosts = await fetch(queryURL).then(res=>{
        const resultPosts = res.json();
        return resultPosts;
      });
      console.log(resultPosts.length);
      if(resultPosts.length>0){
        this.posts = resultPosts;
      }



      this.distance = {};
      this.duration = {};
      // console.log(event.placeId);
      event.stop();

      const markedMarkers = this.layout.markedMarkers
      if (markedMarkers.length >= 2) {
        const markedMarkers = this.layout.markedMarkers
        console.log(markedMarkers);
        markedMarkers[markedMarkers.length - 1].setMap(null);
        markedMarkers.pop();
      }

      this.setAllMarker(null, this.layout.detailMarkers);
      this.layout.detailMarkers = [];
      this.services.directionsRenderer.setMap(null);

      const marker = new google.maps.Marker({
        position: event.latLng,
        icon: { url: '/images/Pushpin-r.svg', scaledSize: new google.maps.Size(55, 55), origin: new google.maps.Point(-1, 0) }
      });

      if (this.layout.markers.length) {
        const markers = this.layout.markers;
        this.layout.markers[markers.length - 1].setMap(null);
        this.layout.markers.pop();
      };

      this.layout.markers.push(marker);
      this.setAllMarker(this.map);
      this.setAllMarker(this.map, this.layout.markedMarkers);
      this.layout.infowindow.close();
      this.fetchPlaceInformation(event);
    },
    setPoint() {
      this.setAllMarker(null);
      this.layout.markers = [];
      this.layout.infowindow.close();
      const markedMarkers = this.layout.markedMarkers

      const infoContent = this.layout.infoContent;

      const marker = new google.maps.Marker({
        position: infoContent.placeLatlng,
        icon: { url: '/images/Pushpin-r.svg', scaledSize: new google.maps.Size(55, 55), origin: new google.maps.Point(-1, 0) }
      });

      if (markedMarkers.length >= 2) {
        console.log(markedMarkers);
        markedMarkers[markedMarkers.length - 1].setMap(null);
        markedMarkers.pop();
      }

      markedMarkers.push(marker);
      this.setAllMarker(this.map, markedMarkers);

      const target = (this.lookfor === 'origin') ? this.originData : this.terminalData;
      if (this.lookfor === 'origin') {
        target.placeId = infoContent.placeId;
        target.placeName = infoContent.placeName;
        target.placeAddress = infoContent.placeAddress;
        target.placeLatlng = infoContent.placeLatlng;
        console.log(target);
        this.lookforText = "設為終點";
        this.lookfor = 'terminal';
      } else {
        target.placeId = infoContent.placeId;
        target.placeName = infoContent.placeName;
        target.placeAddress = infoContent.placeAddress;
        target.placeLatlng = infoContent.placeLatlng;
        console.log(target);

        this.services.distanceMatrixService
          .getDistanceMatrix({
            origins: [this.originData.placeLatlng],
            destinations: [this.terminalData.placeLatlng],
            travelMode: this.travelMode,
            avoidHighways: true,
            avoidTolls: true,
          }, (res, status) => {
            if (status === "OK") {
              const distance = res.rows[0].elements[0].distance;
              const duration = res.rows[0].elements[0].duration;
              this.distance = distance;
              this.duration = duration;
              this.services.directionsService.route({
                origin: this.originData.placeLatlng,
                destination: this.terminalData.placeLatlng,
                travelMode: this.travelMode
              }, (result, status) => {
                if (status === "OK") {
                  this.services.directionsRenderer.setDirections(result);
                  this.services.directionsRenderer.setMap(this.map);
                  this.layout.infowindow.close();
                  const infoContent = this.layout.infoContent;
                  if (this.distance.text && this.duration.text) {
                    infoContent.showResult = true;
                  }
                  this.layout.infowindow.open(this.map);
                }
              })
            }
          })
      }
    },
    setAllMarker(map, arr = this.layout.markers) {
      for (let i = 0; i < arr.length; i++) {
        arr[i].setMap(map);
      }
    },
    getDistance(event) {
      this.services.distanceMatrixService
        .getDistanceMatrix({
          origins: [this.originData.placeLatlng],
          destinations: [event.latLng],
          travelMode: this.travelMode,
          avoidHighways: true,
          avoidTolls: true,
        }, (res, status) => {
          if (status === "OK") {
            const distance = res.rows[0].elements[0].distance;
            const duration = res.rows[0].elements[0].duration;
            this.distance = distance;
            this.duration = duration;
            this.calcRoute(event);
          }
        })
    },
    calcRoute(event) {
      this.services.directionsService.route({
        origin: this.originData.placeLatlng,
        destination: event.latLng,
        travelMode: this.travelMode
      }, (result, status) => {
        if (status === "OK") {
          this.services.directionsRenderer.setDirections(result);
          this.services.directionsRenderer.setMap(this.map);
          this.fetchPlaceInformation(event);
        }
      })
    },
    fetchPlaceInformation(event) {
      // console.log(event);
      this.libraries.placesService.getDetails({ placeId: event.placeId }, (place, status) => {
        if (status === "OK") {
          // console.log(place);
          const infoContent = this.layout.infoContent;
          infoContent.showResult = false;
          this.layout.infowindow.setPosition(event.latLng);

          infoContent.placeId = place.place_id;

          infoContent.placeName = place.name;
          infoContent.placeLatlng = place.geometry.location;
          infoContent.placeAddress = place.formatted_address;
          this.layout.infoContent.placeOpenHour = null;

          if (place.opening_hours) {
            let today = new Date().getDay() - 1;
            today = today < 0 ? 6 : today;
            this.layout.infoContent.placeOpenHour = place.opening_hours.weekday_text[today];
          }

          infoContent.placeTel = place.formatted_phone_number;
          if (this.distance.text && this.duration.text) {
            infoContent.showResult = true;
          }
          this.layout.infowindow.open(this.map);

        }
      })
    },
    onPlaceChanged() {
      const place = this.libraries.autocomplete.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      this.getWeather(lat, lng);
      let countryName = '';
      if (place.address_components.length > 1) { //check whether target place is in any country
        for (let i = 0; i < place.address_components.length; i++) {
          const typesArr = place.address_components[i].types;
          if (typesArr.find(function (ele) { return ele === 'country'; })) {
            countryName = place.address_components[i].long_name; // get country name or natural feature name
          }
        }
      } else {
        countryName = place.address_components[0].long_name;
      }

      if(this.currentCountry !== countryName){
        this.setAllMarker(null, this.layout.markedMarkers);
        this.layout.markedMarkers = [];
        this.lookfor = "origin";
        this.lookforText = '設為起點';
      };

      this.currentCountry = countryName;

      if (place.geometry) {
        this.map.panTo(place.geometry.location);
        this.map.setZoom(18);
        // this.lookfor = "origin";
        // this.lookforText = '設為起點';
      }
    },
    reset() {
      this.lookfor = 'origin';
      this.lookforText = '設為起點';
      this.layout.infowindow.close();
      this.services.directionsRenderer.setMap(null);
      this.distance = {};
      this.duration = {};
      this.setAllMarker(null);
      this.layout.markers = [];
      this.setAllMarker(null, this.layout.detailMarkers);
      this.layout.detailMarkers = [];
      this.setAllMarker(null, this.layout.markedMarkers);
      this.layout.markedMarkers = [];
    },
    add() {
      const schedule = {
        originData: {
          placeId: this.originData.placeId,
          placeName: this.originData.placeName,
        },
        terminalData: {
          placeId: this.terminalData.placeId,
          placeName: this.terminalData.placeName,
        },
        distance: {
          text: this.distance.text,
          value: this.distance.value,
        },
        duration: {
          text: this.duration.text,
          value: this.duration.value,
        }
      }
      this.interests.push(schedule);
      this.lookfor = 'origin';
      this.lookforText = '設為起點';
      this.layout.infowindow.close();
      this.services.directionsRenderer.setMap(null);
      this.distance = {};
      this.duration = {};
      this.setAllMarker(null);
      this.layout.markers = [];
      this.setAllMarker(null, this.layout.markedMarkers);
      this.layout.markedMarkers = [];
      const interestsJSON = JSON.stringify(this.interests);
      // console.log(interestsJSON);
      Cookies.set('interests', interestsJSON, { expires: 365 });
      console.log(JSON.parse(Cookies.get('interests')));
    },
    deleteSchedule(event, index) {
      event.stopPropagation();
      this.deleteIndex = index;
      $('#closeWindow').modal('show');
    },
    delConfirm() {
      this.setAllMarker(null, this.layout.detailMarkers);
      this.layout.detailMarkers = [];
      this.setAllMarker(null);
      this.layout.markers = [];
      this.setAllMarker(null, this.layout.markedMarkers);
      this.layout.markedMarkers = [];
      this.services.directionsRenderer.setMap(null);
      this.layout.infowindow.close();
      if (this.deleteIndex === 'all') {
        Cookies.set('interests', '');
        this.interests = [];
      } else {
        this.interests.splice(this.deleteIndex, 1);
      }
      const interestsJSON = JSON.stringify(this.interests);
      Cookies.set('interests', interestsJSON, { expires: 7 });
      $('#closeWindow').modal('hide');
      this.deleteIndex = null;
    },
    quitList() {
      $('#listShower').addClass("miniaturize");
    },
    enterList() {
      $('#listShower').removeClass("miniaturize");
    },
    delAll() {
      this.deleteIndex = 'all';
      $('#closeWindow').modal('show');
    },
    showScheDetail(event, index) {
      this.setAllMarker(null);
      this.setAllMarker(null, this.layout.detailMarkers);
      this.setAllMarker(null, this.layout.markedMarkers);
      this.layout.detailMarkers = [];
      this.layout.infowindow.close();
      this.services.directionsService.route({
        origin: { placeId: this.interests[index].originData.placeId },
        destination: { placeId: this.interests[index].terminalData.placeId },
        travelMode: this.travelMode
      }, (result, status) => {
        if (status === "OK") {
          console.log(result);
          this.services.directionsRenderer.setDirections(result);
          this.services.directionsRenderer.setMap(this.map);
          const originMarker = new google.maps.Marker({
            position: result.routes[0].overview_path[0],
            icon: { url: '/images/Pushpin-r.svg', scaledSize: new google.maps.Size(55, 55), origin: new google.maps.Point(-1, 0) }
          });
          const terminalMarker = new google.maps.Marker({
            position: result.routes[0].overview_path[result.routes[0].overview_path.length - 1],
            icon: { url: '/images/Pushpin-r.svg', scaledSize: new google.maps.Size(55, 55), origin: new google.maps.Point(-1, 0) }
          });
          this.layout.detailMarkers.push(originMarker, terminalMarker);
          this.setAllMarker(this.map, this.layout.detailMarkers);
        }
      })
    },
    async morePost() {

      $('#postShower').toggleClass('morePost');
    },
    quitPost() {
      $('#postShower').removeClass('morePost');
    },
    calcuLength(value, num = 10){
      newString = value;
      if(value.length>=num){
        let strArr = value.split("");
        // console.log(strArr);
        strArr = strArr.slice(0,num);
        strArr.push("...");
        newString = strArr.join("");
        // console.log(newString);
      }
      return newString;
    }
  },
  computed: {
    interestsJSON: function () {
      return JSON.stringify(this.interests);
    }
  },
  watch:{
    travelName : function(){
      Cookies.set('travelName', this.travelName, { expires: 365 });
    }
  },
  mounted() {
    window.addEventListener('load', async () => {
      if (Cookies.get('interests') && Cookies.get('interests') !== '') {
        this.interests = JSON.parse(Cookies.get('interests'));
      };
      if (Cookies.get('travelName') && Cookies.get('travelName') !== '') {
        this.travelName = Cookies.get('travelName');
      }
      if (Cookies.get('saveStatus') === 'success') {
        this.travelName = '';
        Cookies.set('travelName', '');
        $('#successWindow').modal('show');
        Cookies.set('interests', '');
        this.interests = [];
        Cookies.set('saveStatus', 'success', { expires: -1 });
      }
      // const url = 'http://localhost:3000/map?placeId=ChIJS7qHS2mpQjQRjcsDvPunUgo';
      if (window.location.href.indexOf('?') !== -1) {
        const urlArr = window.location.href.split("?");
        const placeIdArr = urlArr[1].split("=");
        this.initPlaceId = placeIdArr[1];

        this.posts =  [
        //   {
        //   article_id: 0,
        //   description: '暫無文章',
        //   img_path: '/images/map_noimage.jpg',
        //   title: '暫無文章'
        // },
        ]
  
        let queryURL = '/map/schArt?placeId=';
        queryURL += this.initPlaceId;
        resultPosts = await fetch(queryURL).then(res=>{
          const resultPosts = res.json();
          return resultPosts;
        });
        console.log(resultPosts.length);
        if(resultPosts.length>0){
          this.posts = resultPosts;
        }
      }
      $('#listShower').addClass("miniaturize");
      this.initMap();
    });
  }
})