"use client";

import { useEffect, useState } from 'react';
import MapSection from './MapSection/MapSection';
import ChartSection from './ChartSection/ChartSection';

import { useMapContext } from '../../context/MapContext';

import { ELDLog } from '../ELDChart/ELDChart';

import styles from './DispatchLogDashboard.module.css';

type TLocation = {
    lng: number,
    lat: number,
    label: string
}

const DispatchLogDashboard = () => {
    const [consumedHours, setConsumedHours] = useState<number>(0);
    const [locations, setLocations] = useState<Record<string, TLocation>>({})
    const [mapStatus, setMapStatus] = useState<"crntLoc" | "pickLoc" | "dropLoc" | "null">("null")

    const [canSimulate, setCanSimulate] = useState<boolean>(false)
    const [eldLogs, setEldLogs] = useState<{ day: number, logs: ELDLog[] }[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const mapContext = useMapContext();

    useEffect(() => {
        const runSimulation = async () => {
            if (mapContext.calculatedDistances.length !== 2) return;

            try {
                const response = await fetch(`/api/trip`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        dist_btwn_current_and_pickup: mapContext.calculatedDistances[0].distance,
                        dist_btwn_pickup_and_dropoff: mapContext.calculatedDistances[1].distance,
                        cycles_used: Number(consumedHours)
                    })
                });

                const data = await response.json();

                if (data?.days.status == "FAILED") {
                    setApiError(data.days.reason)
                    return;
                };

                const processedLogs = data.days.logs.map((dayData: any) => {
                    const dayStart = new Date();
                    dayStart.setHours(0, 0, 0, 0);
                    dayStart.setDate(dayStart.getDate() + (dayData.day - 1));

                    let currentTime = new Date(dayStart);

                    const logs: ELDLog[] = dayData.events.map((event: any) => {
                        const start = new Date(currentTime);
                        const durationMs = event.duration * 60 * 60 * 1000;
                        const end = new Date(start.getTime() + durationMs);

                        currentTime = end;

                        return {
                            start,
                            end,
                            status: event.status
                        };
                    });

                    return {
                        day: dayData.day,
                        logs
                    };
                });

                setEldLogs(processedLogs);
            } catch (err) {
                console.error("Simulation failed:", err);
                setApiError("Failed to load trip data. Please try again.");
            }
        };

        runSimulation();
    }, [mapContext.calculatedDistances]);

    useEffect(() => {
        // Validate Inputs
        if (
            locations.crntLoc != undefined &&
            locations.pickLoc != undefined &&
            locations.dropLoc != undefined &&
            parseFloat(`${consumedHours}`) >= 0 &&
            parseFloat(`${consumedHours}`) < 70
        ) {
            setCanSimulate(true)
        } else {
            setCanSimulate(false)
        }
    }, [locations, consumedHours])

    const simulateTrip = async () => {
        mapContext.clearRoutes();
        setEldLogs([]);
        setApiError(null);

        try {
            if (locations.crntLoc && locations.pickLoc && locations.dropLoc) {
                const wp1 = `${locations.crntLoc.lat},${locations.crntLoc.lng}`;
                const wp2 = `${locations.pickLoc.lat},${locations.pickLoc.lng}`;
                const wp3 = `${locations.dropLoc.lat},${locations.dropLoc.lng}`;

                // Current -> Pickup
                await mapContext.calculateRoute(wp1, wp2);
                // Pickup -> Dropoff
                await mapContext.calculateRoute(wp2, wp3);
            }
        } catch (err: any) {
            setApiError(`Failed to simulate trip - ${err.message}`)
            console.error(err)
        }
    }

    return (
        <div className={`container-fluid ${styles.mainContainer}`}>
            <MapSection
                locations={locations}
                setLocations={setLocations}
                mapStatus={mapStatus}
                setMapStatus={setMapStatus}
                consumedHours={consumedHours}
                setConsumedHours={setConsumedHours}
                canSimulate={canSimulate}
                simulateTrip={simulateTrip}
            />

            <ChartSection
                eldLogs={eldLogs}
                apiError={apiError}
                calculatedDistances={mapContext.calculatedDistances}
            />
        </div>
    );
};

export default DispatchLogDashboard;
