<div class="plugin__mobile-header">
    { title }
</div>

<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={ () => bcast.emit('rqstOpen', 'menu') }
    >
    { title }
    </div>
<p> A plugin by <a href="https://github.com/YannKerherve">Yann Kerhervé</a> for Ponant</p>
<img src="https://raw.githubusercontent.com/YannKerherve/ratus/refs/heads/main/src/ice.png" width=100%/>
<p> <center>🛳️</center></p>
<p> 1. Download and unzip the <a href="https://drive.google.com/file/d/1WQprHSiy15N97M6U9ybNfuVbMuzLSsL2/view?usp=sharing">plugin file</a> (click on ‘plugin file')</p>
<p> 2. Run server.exe and fill in the information from TCP</p>
<p> 3. Press start on the server and update Windy</p>
<p> <center>🛳️</center></p>
    {#if gpsData}
           <p> GPS Data:</p>
           <p> {gpsData}</p>
           <p>  Latitude: {latitude}° </p>
           <p>  Longitude: {longitude}° </p>
           <p>  Heading: {heading}° </p>
    {/if}
    {#if error}
        <div class="error">
            <p>Error: {error}</p>
        </div>
    {/if}
</section>


<script lang="ts">
import bcast from "@windy/broadcast";
import { onDestroy, onMount } from 'svelte';
import { map } from "@windy/map";

const title = 'TCP GPS Position Plugin';
let latitude = null;
let longitude = null;
let heading = null;
let markerLayer = L.layerGroup().addTo(map);
let gpsData = 'Aucune donnée reçue pour le moment...';
let error = '';
let polyline;
let previousLat = null, previousLon = null;
let marker = null;

async function fetchGPSData() {
    try {
        const response = await fetch("http://localhost:5000/gps-data");
        gpsData = await response.text();
        
        if (gpsData.startsWith('$GPGLL')) {
            const parts = gpsData.split(',');
            latitude = convertLatitude(parseFloat(parts[1]), parts[2]);
            longitude = convertLongitude(parseFloat(parts[3]), parts[4]);
            if (latitude && longitude) addMarkerOnMap(latitude, longitude);
        } else if (gpsData.startsWith('$HEHDT')) {
            heading = parseFloat(gpsData.split(',')[1]);
        }
    } catch (err) {
        error = `Erreur lors de la récupération des données : ${err.message || err}`;
        console.error(error);
    }
}

function convertLatitude(value, direction) {
    const degrees = Math.floor(value / 100);
    const minutes = value - (degrees * 100);
    let lat = degrees + (minutes / 60);
    return direction === 'S' ? -lat : lat;
}

function convertLongitude(value, direction) {
    const degrees = Math.floor(value / 100);
    const minutes = value - (degrees * 100);
    let lon = degrees + (minutes / 60);
    return direction === 'W' ? -lon : lon;
}

function addMarkerOnMap(lat, lon) {
    if (!map) {
        console.error("Carte Windy non disponible !");
        return;
    }

    const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/YannKerherve/ratus/refs/heads/main/src/lccdetoure.png',
        iconSize: [25, 100],
        iconAnchor: [12, 50],
    });

    if (!marker) {
        marker = L.marker([lat, lon], { icon: customIcon }).addTo(markerLayer);
    } else {
        marker.setLatLng([lat, lon]);
    }

    setTimeout(() => {
        const iconElement = marker.getElement();
        if (iconElement) {
            let match = iconElement.style.transform.match(/translate3d\([^)]+\)/);
            let translatePart = match ? match[0] : "translate3d(0px, 0px, 0px)";
            iconElement.style.transform = `${translatePart} rotate(${heading}deg)`;
            iconElement.style.transformOrigin = "50% 50%";
        }
    }, 50);

    if (previousLat !== null && previousLon !== null) {
        polyline.addLatLng([lat, lon]);
    }
    previousLat = lat;
    previousLon = lon;
}

let interval;
onMount(() => {
    polyline = L.polyline([], { color: 'red' }).addTo(map);
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
</script>




<style lang="less">
    .gps-info {
        margin-top: 20px;
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 5px;
    }
.rotated-icon {
    transform-origin: center;
}
    .error {
        color: red;
        margin-top: 20px;
    }
    .plugin-container {
        padding: 10px;
        font-family: Arial, sans-serif;
        white-space: pre-wrap; /* Permet d'afficher les retours à la ligne */
        background: #f5f5f5;
        height: 100%;
        overflow-y: auto;
    }
</style>
<div class="plugin-container">
    <h3>GPS Data Stream</h3>
    {#if error}
        <div class="error">{error}</div>
    {/if}
    <pre>{gpsData}</pre>
</div>
