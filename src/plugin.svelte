<div class="plugin__mobile-header">
    { title }
</div>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={ () => bcast.emit('rqstOpen', 'menu') }
    >
    { title }
    </div>
<p> A plugin by <a href="https://github.com/YannKerherve">Yann Kerhervé</a></p>
<p> <center>🛳️</center></p>

<p> Frame: $GNRMC ;
<label for="baudrate">Baud Rate:</label>
<select name="baurate" id="baudrate">
  <option value="115200">115200</option>
  <option value="74880">74880</option>
  <option value="57600">57600</option>
  <option value="38400">38400</option>
  <option value="19200">19200</option>
  <option value="9600">9600</option>
  <option value="4800">4800</option>
</select>    </p>
<div class="button" on:click={connectSerial}>Connect to GPS</div>
<div class="button" on:click={deco}>Disconnect</div>
    {#if gpsData}
           <p> GPS Data:</p>
           <p> {gpsData}</p>
           <p>  Latitude: {latitude}° </p>
           <p>  Longitude: {longitude}° </p>
           <p>  Sog: {cog} knt</p>
          <p>  Cog: {sog}°</p>
          <p>  Mag. Deviation: {dev}° {dir}</p>
    {/if}
    {#if error}
        <div class="error">
            <p>Error: {error}</p>
        </div>
    {/if}
</section>

import bcast from "@windy/broadcast";
import { onDestroy, onMount } from 'svelte';
import { map } from "@windy/map";

const title = 'GPS Position Plugin';

let gpsData = "";
let latitude = "";
let longitude = "";
let error = "";

let markerLayer: L.LayerGroup;

async function fetchGPSData() {
    try {
        const response = await fetch("http://localhost:5000");
        const data = await response.text();
        parseGPSData(data);
    } catch (err) {
        error = `Erreur lors de la récupération des données : ${err.message || err}`;
        console.error('Erreur de récupération des données:', err);
    }
}

function parseGPSData(data: string) {
    gpsData = data;

    const regex = /\$GPGLL,(\d{4}\.\d+),([NS]),(\d{5}\.\d+),([EW]),(\d{6}\.\d+),([AV])\*/;
    const match = regex.exec(data);

    if (match) {
        const latDeg = parseFloat(match[1].slice(0, 2));
        const latMin = parseFloat(match[1].slice(2));
        const latHem = match[2];

        const lonDeg = parseFloat(match[3].slice(0, 3));
        const lonMin = parseFloat(match[3].slice(3));
        const lonHem = match[4];

        const validity = match[6];

        latitude = ((latDeg + latMin / 60) * (latHem === 'S' ? -1 : 1)).toFixed(6);
        longitude = ((lonDeg + lonMin / 60) * (lonHem === 'W' ? -1 : 1)).toFixed(6);

        if (latitude && longitude && validity === 'A') {
            error = ""; // Clear any previous errors
            addMarkerOnMap(parseFloat(latitude), parseFloat(longitude));
        } else {
            error = "Données GPS invalides.";
        }
    } else {
        error = "Trame GPS non valide.";
    }
}

function addMarkerOnMap(lat: number, lon: number) {
    if (map) {
        if (!markerLayer) {
            markerLayer = L.layerGroup().addTo(map);
        }

        markerLayer.clearLayers();

        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="display: flex; align-items: center; flex-direction: column;">
                    <div style="font-size: 24px; animation: spin 2s linear infinite; color: black;">
                        <i class="fa-solid fa-location-crosshairs"></i>
                    </div>
                </div>
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
        });

        L.marker([lat, lon], { icon: customIcon }).addTo(markerLayer);
    } else {
        console.error("Carte Windy non disponible !");
    }
}

function cleanup() {
    if (markerLayer) {
        markerLayer.clearLayers();
        map.removeLayer(markerLayer);
        markerLayer = null;
    }
}

export const onopen = (_params: unknown) => {
    // Handler si nécessaire lors de l'ouverture du plugin
};

onMount(() => {
    window.addEventListener('beforeunload', cleanup);
});

onDestroy(() => {
    cleanup();
    window.removeEventListener('beforeunload', cleanup);
});
</script>

<style lang="less">
    .gps-info {
        margin-top: 20px;
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 5px;
    }

    .error {
        color: red;
        margin-top: 20px;
    }
</style>