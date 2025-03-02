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

<p> Frame: $GNRMC ;</p>
<div class="button" on:click={connectSerial}>Connect to GPS</div>
<div class="button" on:click={deco}>Disconnect</div>
    {#if gpsData}
           <p> GPS Data:</p>
           <p> {gpsData}</p>
           <p>  Latitude: {latitude}° </p>
           <p>  Longitude: {longitude}° </p>
    {/if}
    {#if error}
        <div class="error">
            <p>Error: {error}</p>
        </div>
    {/if}
</section>

<script lang="ts">
    import { onDestroy, onMount } from 'svelte';

    let gpsData = 'Aucune donnée reçue pour le moment...';
    let error = '';

    // Fonction pour récupérer les données de l'API locale
    async function fetchGPSData() {
        try {
            const response = await fetch("http://localhost:5000");
            gpsData = await response.text();
        } catch (err) {
            error = `Erreur lors de la récupération des données : ${err.message || err}`;
            console.error('Erreur de récupération des données:', err);
        }
    }

    // Rafraîchissement périodique
    let interval;
    onMount(() => {
        interval = setInterval(fetchGPSData, 2000); // toutes les 2 secondes
        fetchGPSData(); // première récupération immédiate
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
