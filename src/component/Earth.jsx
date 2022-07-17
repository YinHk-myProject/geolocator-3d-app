import React, { useRef, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import mapboxgl from 'mapbox-gl'; 
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Heading } from '@chakra-ui/react';

mapboxgl.accessToken = 'pk.eyJ1IjoieWluaGsiLCJhIjoiY2w1bjh0MGJxMTB5eTNicTkyMTV2eW9jbyJ9.LIBqr5O71-8rUSUkNRXkJQ';

const mapStyle = createUseStyles({
    container: {
       position: 'absolute',
       top: 0,
       bottom: 0,
       left: 0,
       right: 0
    },
    sideBar: {
       position: 'relative', 
       zIndex: '100'
    }
});


export default function Earth(props) {
    const classes = mapStyle();
    const [longitude, setLongitude] = useState(-70.9);
    const [latitude, setLatitude] = useState(42.35);
    const [zoom, setZoom] = useState(2.5);
    //const [mapt, setMapt] = useState(`mapbox://styles/mapbox/satellite-streets-v11`);
    const earthContainer = useRef(null);
    

    useEffect(() => {
        var map = new mapboxgl.Map({
            container: earthContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            zoom: zoom,
            center: [longitude, latitude],
            projection: 'globe'
        });

        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            placeholder: 'Search  Location'
        });

        const geolocate = new mapboxgl.GeolocateControl({
            trackUserLocation: true,
            showUserHeading: true,
            positionOptions: {
                enableHighAccuracy: true
            }
        });

        const screenControl = new mapboxgl.FullscreenControl();

        if(navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition((position) => {
                setLongitude(position.coords.longitude);
                setLatitude(position.coords.latitude);
                
                //fly to the user current location
                map.flyTo({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: zoom + 6,
                    essential: true,
                    duration: 12000
                });
            })
        } 

        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        map.addControl(geocoder);
        map.addControl(geolocate, 'bottom-right');
        map.addControl(screenControl, 'bottom-right');


        /* Event handler */

        //move to specific location
        map.once('move', () => {
            const {lng, lat} = map.getCenter();
            setZoom(map.getZoom().toFixed(2));
            setLongitude(lng);
            setLatitude(lat);
        });

        geolocate.on('geolocate', function(e) {
            setLongitude(e.coords.longitude);
            setLatitude(e.coords.latitude);
            let position = [longitude, latitude];
        });

        //Set the default atmosphere style
        map.on('load', () => map.setFog({
            'range': [-1, 2],
            'horizon-blend': 0.,
            'color': '#242B4B',
            'high-color': 'rgba(0, 0, 0, .9)',
            'space-color': '#0B1026',
            'star-intensity': 1.2
        }));

        //detect pointer move and corresponding position
        //map.on('mousemove', (e) => { console.log(e.lngLat)});

        map.on('contextmenu', (e) => {
            //console.log(e.lngLat)
            var el = document.createElement('div');
            el.innerHTML = `<label>longitude: ${e.lngLat.lng}, latitude: ${e.lngLat.lat}</label>`

            let marker = new mapboxgl.Marker({draggable: true})
               .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .setPopup(new mapboxgl.Popup().setDOMContent(el))
                 .addTo(map) 
                 
            marker.getElement('click', (e) => { marker.togglePopup(); e.stopPropagation(); }, false)
            //marker.getElement('contextmenu', () => marker.remove());
        });


       //Clear before unmount
       return () => {
         map.remove();
       } 

    }, []);

    
    return (
      <>
       <div className={classes.container} ref={earthContainer}></div> 
       <div className={classes.sideBar}>
          <Heading 
            size='lg' 
            fontSize='25px' 
            color="#FFFFFF"
            marginLeft='55px'
            marginTop='3.5px'
          >Geolocator 3D</Heading>
       </div>
       <div className={classes.sideBar}>
    
       </div>
      </>
    );

}