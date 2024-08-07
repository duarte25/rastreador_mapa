import React, { useEffect } from 'react';
import { MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CustomMarker from '../customMaker';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'; // Importar locale se você precisa de data em português
import Route from '../route';

// Custom hook to handle map updates
const MapUpdater = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      map.setView([location.latitude, location.longitude], 14);
    }
  }, [location, map]);

  return null;
};

// Function to format date to a more readable format
const formatDate = (date) => {
  if (!date) return 'Data não disponível';

  try {
    const dateObj = new Date(date);
    return format(dateObj, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }); // Format in Portuguese
  } catch (error) {
    return 'Formato de data inválido';
  }
};

const Map = ({ markers = [], location, error }) => {
  // Ensure markers array is not empty
  const firstMarker = markers.length > 0 ? markers[0] : null;
  const lastMarker = markers.length > 0 ? markers[markers.length - 1] : null;

  // Extract coords if available
  const firstMarkerCoords = firstMarker ? firstMarker.coords : null;
  const lastMarkerCoords = lastMarker ? lastMarker.coords : null;

    console.log("primeiro", firstMarkerCoords)
    console.log("Ultimo", lastMarkerCoords)

  // Example coordinates
  const source = firstMarkerCoords || [-12.703715, -60.118591];
  const destination = lastMarkerCoords || [-12.70372, -60.11859];

  return (
    <MapContainer
      center={[location.latitude, location.longitude]}
      zoom={14}
      style={{ height: '100vh', width: '100%' }}
      key={`${location.latitude}-${location.longitude}`} // Ensure map re-renders with location change
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <Route source={source} destination={destination} />

      {firstMarkerCoords && (
        <CustomMarker position={source}>
          <Popup>
            <h4 className="decoration-gray-50">Data: {formatDate(firstMarker.data_conectado)}</h4>
            <h4>Velocidade: {firstMarker.vel}km/h</h4>
          </Popup>
        </CustomMarker>
      )}

      {lastMarkerCoords && (
        <CustomMarker position={destination}>
          <Popup>
            <h4 className="decoration-gray-50">Data: {formatDate(lastMarker.data_conectado)}</h4>
            <h4>Velocidade: {lastMarker.vel}km/h</h4>
          </Popup>
        </CustomMarker>
      )}

      <MapUpdater location={location} />
    </MapContainer>
  );
};

Map.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      label: PropTypes.string,
      ultima_posicao: PropTypes.shape({
        coords: PropTypes.arrayOf(PropTypes.number).isRequired,
        vel: PropTypes.number.isRequired
      }).isRequired,
      data_conectado: PropTypes.string.isRequired
    })
  ),
  location: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  }).isRequired,
  error: PropTypes.string
};

export default Map;
