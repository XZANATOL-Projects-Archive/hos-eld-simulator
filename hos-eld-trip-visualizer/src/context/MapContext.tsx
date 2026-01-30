"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface MapContextType {
    calculateRoute: (waypoint1: string, waypoint2: string) => Promise<any>;
    routes: any[];
    clearRoutes: () => void;
    calculatedDistances: { distance: number, time: number }[]
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [routes, setRoutes] = useState<any[]>([]);
    const [calculatedDistances, setCalculatedDistances] = useState<{ distance: number, time: number }[]>([])

    const calculateRoute = async (waypoint1: string, waypoint2: string) => {
        const apiKey = process.env.NEXT_PUBLIC_GEOPIFY_KEY;
        const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoint1}|${waypoint2}&mode=truck&lang=en&units=imperial&apiKey=${apiKey}`;
        let data: any;

        try {
            const response = await fetch(url);
            data = await response.json();
            
            if (data && data.features) {
                setRoutes(prev => [...prev, data]);
                const props = data.features[0].properties;
                const distance = props.distance;
                const timeHrs = props.time / 3600; // Convert seconds to hours

                setCalculatedDistances(prev => [...prev, { distance, time: timeHrs }]);
            }
        } catch (error) {
            console.error("Error calculating route:", error);
        } finally{
            // In case the api returned 400
            if (data && data.statusCode === 400){
                throw new Error(data.message)
            }
        }
    };

    const clearRoutes = () => {
        setRoutes([]);
        setCalculatedDistances([]);
    };

    return (
        <MapContext.Provider value={{ calculateRoute, routes, clearRoutes, calculatedDistances }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMapContext must be used within a MapProvider");
    }
    return context;
};
