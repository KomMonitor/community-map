var mapContainerNodeId = "mapContainer";
var linkToJsonFile = "./app/resources/kreise.json";

const layerName_kreise = "Alle Kreise und kreisfreie Städte NRW";
const layerName_kreise_activeMembers = "KomMonitor Kreise und kreisfreie Städte NRW";
const property_gn = "GN";
const property_usesKM = "usesKomMonitor";
const property_contacts = "contacts";
const property_contacts_name = "name";
const property_contacts_role = "role";
const property_contacts_mail = "mail";
const property_contacts_phone = "phone";

const styleColor_activeMembers = "#F7931E";
const styleColor_nonActiveMembers = "#919191";
const transparency_activeMembers = "0.3";
const transparency_nonActiveMembers = "0.5";

var overlayLayersArray = [];

var map;
var layerControl;

function initControls() {

    if (map) {
        // zoom control as default

        // attribution control - static suffix
        map.attributionControl.addAttribution("Hochschule Bochum");

        // scale control
        L.control.scale(
            { maxWidth: 500, metric: true, imperial: false }
        ).addTo(map);

        // layerControl
        var baseLayers = {};
        var overlayLayers = {};
        layerControl = L.control.layers(baseLayers, overlayLayers);
        layerControl.addTo(map);
    }

}

function initBackgroundLayers() {

    if (map && layerControl) {
        // specify all background WMS layers
        // only OSM as active layer

        // start layer

        var osmLayer_tiled =
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                { attribution: 'OSMTiles' }).addTo(map);

        // add baseLayers to Base Layers in layer control
        layerControl.addBaseLayer(osmLayer_tiled, "Open Street Map");
    }
}

function onEachFeature(feature, layer) {
    if (feature.properties) {
        let html = "<div class='featurePropertyPopupHeader'><b>" + feature.properties[property_gn] + "</b></div><br/><div class='featurePropertyPopupContent'>";

        if (feature.properties[property_contacts] && feature.properties[property_contacts].length > 0) {
            // html += "<i>Kontakte</i>:<br/>";
            html += "<div class='table-responsive'><table class='table table-striped table-sm'>";

            html += "<thead>"

            html += "<tr>";
            html += "<th><b>Name</b></th>"
            html += "<th><b>Rolle</b></th>"
            html += "<th><b>E-Mail</b></th>"
            html += "<th><b>Telefon</b></th>"
            html += "</tr>";

            html += "</thead>"
            html += "<tbody>"

            let contacts = feature.properties[property_contacts];
            for (const contact of contacts) {
                html += "<tr>";
                html += "<td><i>" + contact[property_contacts_name] + "</i></td>"
                html += "<td>" + contact[property_contacts_role] + "</td>"
                html += "<td><a href='mailto:" + contact[property_contacts_mail] + "'>" + contact[property_contacts_mail] + "</td>"
                html += "<td>" + contact[property_contacts_phone] + "</td>"
                html += "</tr>";
            }

            html += "</tbody>"
            html += "</table></div></div>";
        }

        layer.bindPopup(html);
    }
    else {
        layer.bindPopup("No properties found");
    }
}

function addLeafletOverlay(geoJSON, title, styleColor, transparency) {
    if (map && layerControl) {

        let layer = L.geoJSON(geoJSON, {
            style: function (feature) {
                return {
                    // color: styleColor,
                    color: styleColor_nonActiveMembers,
                    fillColor: styleColor,
                    fillOpacity: 1 - transparency,
                    opacity: 1
                };
            },
            onEachFeature: onEachFeature,
        }).addTo(map);

        layerControl.addOverlay(layer, title);
        overlayLayersArray.push(layer);

        map.fitBounds(layer.getBounds());
        // map.setMaxBounds(layer.getBounds());
    }
}


function loadLayers(geoJSON) {
    let geoJSON_kreise = JSON.parse(JSON.stringify(geoJSON));
    let geoJSON_kreise_activeMembers = JSON.parse(JSON.stringify(geoJSON));

    // study is an array. so multiple studies may be specified
    // hence query the array if it includes the respective array
    let features_activeMambers = geoJSON_kreise.features.filter(feature => feature.properties[property_usesKM] == true);
    // let features_nonActiveMambers = geoJSON_kreise.features.filter(feature => feature.properties[property_usesKM] == false);

    geoJSON_kreise_activeMembers.features = features_activeMambers;

    // addAll features
    addLeafletOverlay(geoJSON_kreise, layerName_kreise, styleColor_nonActiveMembers, transparency_nonActiveMembers);
    addLeafletOverlay(geoJSON_kreise_activeMembers, layerName_kreise_activeMembers, styleColor_activeMembers, transparency_activeMembers);

}

function clearOverlays() {
    for (const layer of overlayLayersArray) {
        layerControl.removeLayer(layer);
        map.removeLayer(layer);
    }
}

function initOverlays() {
    if (map && layerControl) {
        // specify all overlay layers

        clearOverlays();

        fetch(linkToJsonFile)
            .then((response) => response.json())
            .then((data) => {

                loadLayers(data);
            }
            )
            .catch((error) => {
                console.error('Error:', error);
            });




    }
}

function initMap() {
    // map = L.map(mapContainerNodeId).setView([51.461372, 7.2418863], 6);
    map = L.map(mapContainerNodeId, {
        center: [51.3149725, 7.3905754],
        zoom: 8,
        minZoom: 8,
        maxZoom: 10,
    });

    initControls();

    initBackgroundLayers();

    initOverlays();
}

function onDomLoaded() {
    initMap();
}

document.addEventListener("DOMContentLoaded", onDomLoaded);