"use client";

import { useEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './TripMap.module.css';

type TMapStatus = "crntLoc" | "pickLoc" | "dropLoc" | "null"

interface TripMapProps {
    mapStatus: TMapStatus;
    setMapStatus: (status: TMapStatus) => void;
    addLocation: Function;
}

interface IMarker {
    status: TMapStatus;
    marker: L.Marker
}

const TripMap = ({ mapStatus, setMapStatus, addLocation }: TripMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    const markersRef = useRef<IMarker[]>([]);

    const mapAPIKey = process.env.NEXT_PUBLIC_GEOPIFY_KEY;

    const mapContext = useMapContext();
    const routeLayerRef = useRef<L.GeoJSON | null>(null);

    const fetchLocationName = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${mapAPIKey}`);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                return data.features[0].properties.name || data.features[0].properties.formatted || "";
            }
            return "";
        } catch (error) {
            console.error("Error fetching location name:", error);
            return "";
        }
    };



    // Handle Map Clicks
    useEffect(() => {
        if (!mapInstance.current) return;

        const map = mapInstance.current;

        const onMapClick = (e: L.LeafletMouseEvent) => {
            if (mapStatus === "null") return;

            // Remove current drawn route if exists
            if (mapContext.routes.length > 0){
                routeLayerRef.current?.remove()
                mapContext.clearRoutes()
            }

            // Check if marker with same map status exists & remove it
            const existingMarkerIndex = markersRef.current.findIndex(m => m.status === mapStatus);
            if (existingMarkerIndex !== -1) {
                markersRef.current[existingMarkerIndex].marker.remove();
                markersRef.current.splice(existingMarkerIndex, 1);
            }

            const { lat, lng } = e.latlng;
            console.log(`Clicked at: ${lat}, ${lng} for status: ${mapStatus}`);

            const iconUrl = `https://api.geoapify.com/v2/icon?type=material&color=%23ff5722&size=64&apiKey=${mapAPIKey}`;

            const icon = L.icon({
                iconUrl: iconUrl,
                iconSize: [31, 46],
                iconAnchor: [15.5, 42],
                popupAnchor: [0, -45]
            });

            const marker = L.marker([lat, lng], { icon: icon }).addTo(map);

            const labels: Record<string, string> = {
                "crntLoc": "Current Location",
                "pickLoc": "Pickup Location",
                "dropLoc": "Dropoff Location"
            };
            const label = labels[mapStatus];

            marker.bindTooltip(label, {
                permanent: false,
                direction: 'top'
            });

            markersRef.current.push({
                status: mapStatus,
                marker: marker
            });


            fetchLocationName(lat, lng).then((name) => {
                addLocation((prev: any) => {
                    return {
                        ...prev,
                        [mapStatus]: {
                            lng: lng,
                            lat: lat,
                            label: name
                        }
                    }
                })
            });

            setMapStatus("null");
        };

        map.on('click', onMapClick);

        return () => {
            map.off('click', onMapClick);
        };
    }, [mapStatus]);



    // Handle Route Drawing
    useEffect(() => {
        if (!mapInstance.current || mapContext.routes.length === 0) return;

        const map = mapInstance.current;

        // Clear previous route layer if exists
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
        }

        // Flatten features
        const routeFeatureCollection = {
            type: "FeatureCollection",
            features: mapContext.routes.flatMap((r: any) => r.features)
        } as any;

        const routeLayer = L.geoJSON(routeFeatureCollection, {
            style: {
                color: '#3b82f6',
                weight: 5,
                opacity: 0.7
            }
        }).addTo(map);

        routeLayerRef.current = routeLayer;

        // Fit bounds to route
        const bounds = routeLayer.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

    }, [mapContext.routes]);



    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        const initialState = {
            lng: 29.991354,
            lat: 31.251518,
            zoom: 16,
        };

        const leafletMap = L.map(mapContainer.current).setView(
            [initialState.lat, initialState.lng],
            initialState.zoom
        );

        mapInstance.current = leafletMap;

        const isRetina = L.Browser.retina;
        const baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${mapAPIKey}`;
        const retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${mapAPIKey}`;

        L.tileLayer(isRetina ? retinaUrl : baseUrl, {
            attribution: 'Built By <a href="https://xzant.dpdns.org/" target="_blank">XZANATOL</a> | Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
            maxZoom: 25,
            id: 'osm-bright'
        }).addTo(leafletMap);

        setTimeout(() => {
            leafletMap.invalidateSize();
        }, 100);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);


    
    return <div className={styles.mapContainer} ref={mapContainer}></div>;
};

export default TripMap;
