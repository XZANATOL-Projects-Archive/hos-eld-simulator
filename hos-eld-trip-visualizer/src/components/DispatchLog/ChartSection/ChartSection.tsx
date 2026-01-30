"use client";

import ELDChart, { ELDLog } from '../../ELDChart/ELDChart';
import styles from '../DispatchLogDashboard.module.css';

interface ChartSectionProps {
    eldLogs: { day: number, logs: ELDLog[] }[];
    apiError: string | null;
    calculatedDistances: { distance: number, time: number }[];
}

const ChartSection = ({ eldLogs, apiError, calculatedDistances }: ChartSectionProps) => {

    const totalDistance = calculatedDistances.length === 2
        ? (calculatedDistances[0].distance + calculatedDistances[1].distance).toFixed(2)
        : "0";

    const totalTime = calculatedDistances.length === 2
        ? (calculatedDistances[0].time + calculatedDistances[1].time).toFixed(2)
        : "0";

    return (
        <div className="row mt-5">
            <div className={`col-12`}>
                <div className={styles.headerContainer}>
                    <div className={styles.logoBackground}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
                        </svg>
                    </div>
                    <h2 className={styles.title}>ELD Log</h2>
                </div>

                <div className={styles.headerContainer}>
                    <h4 className={styles.title}>
                        Distance: {totalDistance} miles
                    </h4>

                    <h4 className={styles.title}>
                        ETA: {totalTime} hours
                    </h4>
                </div>

                <div className={styles.eldTableContainer}>
                    <table className={`table table-dark table-bordered mb-0 ${styles.eldTable}`}>
                        <thead>
                            <tr>
                                <th className={styles.dayColumn}>Day</th>
                                <th>Chart</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eldLogs.length > 0 ? (
                                eldLogs.map((dayLog) => (
                                    <tr key={dayLog.day}>
                                        <td className="align-middle fw-bold">{dayLog.day}</td>
                                        <td className="p-0">
                                            <ELDChart logs={dayLog.logs} width={800} height={150} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                apiError != null ?
                                    (
                                        <tr>
                                            <td colSpan={2} className="text-center p-3 text-muted">
                                                <p>Error: {apiError}</p>
                                            </td>
                                        </tr>
                                    )
                                    :
                                    (
                                        <tr>
                                            <td colSpan={2} className="text-center p-3 text-muted">
                                                <p>Run simulation to generate ELD logs</p>
                                            </td>
                                        </tr>
                                    )
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default ChartSection;
