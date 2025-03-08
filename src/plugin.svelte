import bcast from "@windy/broadcast";
import { onDestroy, onMount } from 'svelte';
import { map } from "@windy/map";

const title = 'TCP GPS position plugin';
let latitude = null;
let longitude = null;
let markerLayer = L.layerGroup().addTo(map);
let gpsData = 'Aucune donnée reçue pour le moment...';
let error = '';
let polyline = L.polyline([], { color: 'red' }).addTo(map); // Ligne pour l'historique des positions
let previousLat = null, previousLon = null;

async function fetchGPSData() {
    try {
        const response = await fetch("http://localhost:5000/gps-data");
        gpsData = await response.text();
        
        if (gpsData.startsWith('$GPGLL')) {
            const parts = gpsData.split(',');
            const latitudesal = parseFloat(parts[1]);
            const latDirection = parts[2];
            const longitudesal = parseFloat(parts[3]);
            const lonDirection = parts[4];
            
            latitude = convertLatitude(latitudesal, latDirection);
            longitude = convertLongitude(longitudesal, lonDirection);
            
            if (latitude && longitude) {
                addMarkerOnMap(parseFloat(latitude), parseFloat(longitude));
            }
        }
    } catch (err) {
        error = `Erreur lors de la récupération des données : ${err.message || err}`;
        console.error('Erreur de récupération des données:', err);
    }
}

function convertLatitude(latitudesal, latDirection) {
    const degrees = Math.floor(latitudesal / 100);
    const minutes = latitudesal - (degrees * 100);
    let latitude = degrees + (minutes / 60);
    return latDirection === 'S' ? -latitude : latitude;
}

function convertLongitude(longitudesal, lonDirection) {
    const degrees = Math.floor(longitudesal / 100);
    const minutes = longitudesal - (degrees * 100);
    let longitude = degrees + (minutes / 60);
    return lonDirection === 'W' ? -longitude : longitude;
}

function addMarkerOnMap(lat, lon) {
    if (map) {
        markerLayer.clearLayers(); 
        const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/YannKerherve/ratus/refs/heads/main/src/lcc.png',
            iconSize: [100, 100],
            iconAnchor: [50, 100],
        });
        
        L.marker([lat, lon], { icon: customIcon }).addTo(markerLayer);
        
        if (previousLat !== null && previousLon !== null) {
            polyline.addLatLng([lat, lon]); // Ajoute le nouveau point à la trace
        }
        
        previousLat = lat;
        previousLon = lon;
    } else {
        console.error("Carte Windy non disponible !");
    }
}

let interval;
onMount(() => {
    interval = setInterval(fetchGPSData, 500);
    fetchGPSData();
});

onDestroy(() => {
    clearInterval(interval);
});

export const onopen = () => {
    console.log('Plugin ouvert');
    fetchGPSData();
};

export const onclose = () => {
    console.log('Plugin fermé');
};
