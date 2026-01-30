import DispatchLogDashboard from '../components/DispatchLog/DispatchLogDashboard';
import { MapProvider } from '../context/MapContext';

export default function Home() {
  return (
    <main className="min-vh-100 d-flex flex-column">
      <MapProvider>
        <DispatchLogDashboard />
      </MapProvider>
    </main>
  );
}
