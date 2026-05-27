import './App.css';
import Mapgl from './Mapgl';
import { MapglContextProvider } from './MapglContext';

function App() {
    return (
        <MapglContextProvider>
            <div className='App-map-container'>
                <Mapgl />
            </div>
        </MapglContextProvider>
    );
}

export default App;
