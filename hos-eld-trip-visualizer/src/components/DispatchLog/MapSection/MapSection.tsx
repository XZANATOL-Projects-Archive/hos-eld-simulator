"use client";

import dynamic from 'next/dynamic';
import InputField from '../../InputField/InputField';
import ActionButton from '../../ActionButton/ActionButton';
import CancelButton from '../../CancelButton/CancelButton';
import SimulateButton from '../../SimulateButton/SimulateButton';
import styles from '../DispatchLogDashboard.module.css';

// Dynamically import map with SSR disabled
const TripMap = dynamic(() => import('../../TripMap/TripMap'), {
    ssr: false,
    loading: () => <div className="text-light p-3">Loading Map...</div>
});

type TLocation = {
    lng: number,
    lat: number,
    label: string
}

type TMapStatus = "crntLoc" | "pickLoc" | "dropLoc" | "null"

interface MapSectionProps {
    locations: Record<string, TLocation>;
    setLocations: React.Dispatch<React.SetStateAction<Record<string, TLocation>>>;
    mapStatus: TMapStatus;
    setMapStatus: React.Dispatch<React.SetStateAction<TMapStatus>>;
    consumedHours: number;
    setConsumedHours: React.Dispatch<React.SetStateAction<number>>;
    canSimulate: boolean;
    simulateTrip: () => void;
}

const MapSection = ({
    locations,
    setLocations,
    mapStatus,
    setMapStatus,
    consumedHours,
    setConsumedHours,
    canSimulate,
    simulateTrip
}: MapSectionProps) => {
    return (
        <div className="row g-4 h-100">
            <div className={`col-lg-4 col-12 ${styles.leftColumn}`}>

                <div className={styles.headerContainer}>
                    <div className={styles.logoBackground}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                        </svg>
                    </div>
                    <h2 className={styles.title}>Dispatch Interface</h2>
                </div>

                <div className={styles.inputsSection}>
                    <div className={styles.inputRow}>
                        <InputField
                            type="text"
                            label="Current Location"
                            placeholder="Mark current location"
                            value={locations.crntLoc?.label || ""}
                            readOnly={true}
                        />
                        {
                            mapStatus != "crntLoc" ?
                                (<ActionButton label="Set Mark" onClick={() => setMapStatus("crntLoc")} />)
                                :
                                (<CancelButton label="Cancel" onClick={() => setMapStatus("null")} />)
                        }

                    </div>

                    <div className={styles.inputRow}>
                        <InputField
                            type="text"
                            label="Pickup Location"
                            placeholder="Mark pickup location"
                            value={locations.pickLoc?.label || ""}
                            readOnly={true}
                        />
                        {
                            mapStatus != "pickLoc" ?
                                (<ActionButton label="Set Mark" onClick={() => setMapStatus("pickLoc")} />)
                                :
                                (<CancelButton label="Cancel" onClick={() => setMapStatus("null")} />)
                        }
                    </div>

                    <div className={styles.inputRow}>
                        <InputField
                            type="text"
                            label="Dropoff Location"
                            placeholder="Mark dropoff location"
                            value={locations.dropLoc?.label || ""}
                            readOnly={true}
                        />
                        {
                            mapStatus != "dropLoc" ?
                                (<ActionButton label="Set Mark" onClick={() => setMapStatus("dropLoc")} />)
                                :
                                (<CancelButton label="Cancel" onClick={() => setMapStatus("null")} />)
                        }
                    </div>

                    <div className="mt-2">
                        <InputField
                            type="number"
                            label="Consumed Hrs"
                            placeholder="consumed hours (Default: 0)"
                            readOnly={false}
                            onChange={(val: number) => setConsumedHours(val)}
                            value={consumedHours}
                        />
                    </div>


                    <div className="mt-2">
                        <SimulateButton
                            label="Simulate"
                            onClick={simulateTrip}
                            disabled={!canSimulate}
                        />
                    </div>
                </div>
            </div>


            <div className="col-lg-8 col-12 d-flex flex-column">
                {
                    mapStatus != "null" ?
                        (
                            <h4 className={styles.mapStatus}>Status: Setting {mapStatus}</h4>
                        )
                        :
                        (
                            <h4 className={styles.mapStatus}>Status: Viewing map</h4>
                        )
                }

                <div className={styles.mapWrapper}>
                    <TripMap mapStatus={mapStatus} setMapStatus={setMapStatus} addLocation={setLocations} />
                </div>
            </div>
        </div>
    );
};

export default MapSection;
