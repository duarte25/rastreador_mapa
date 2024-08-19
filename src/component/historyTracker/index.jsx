import React, { useEffect } from 'react';
import { MapContainer, Popup, TileLayer, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CustomMarker from '../customMaker';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'; // Importar locale se você precisa de data em português
import FormattedDate from '../realTimeTrackers/formattedDate';

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

const HistoryTracker = ({ markers = [], location, error }) => {
  // Cria um array de pares de coordenadas para desenhar as linhas
  const routes = markers.map((marker, index) => {
    if (index < markers.length - 1) {
      return [marker.coords, markers[index + 1].coords];
    }
    return null;
  }).filter(route => route !== null);

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

      {routes.map((route, index) => (
        <Polyline key={index} positions={route} color="blue" />
      ))}

      {markers.map((marker, index) => (
        <CustomMarker key={index} position={marker.coords}>
          <Popup>
            <h4 className="decoration-gray-50">Data: <FormattedDate date={marker.data} /></h4>
            <h4>Velocidade: {marker.vel}km/h</h4>
          </Popup>
        </CustomMarker>
      ))}

      <MapUpdater location={location} />
    </MapContainer>
  );
};

HistoryTracker.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      coords: PropTypes.arrayOf(PropTypes.number).isRequired,
      vel: PropTypes.number.isRequired,
      data: PropTypes.string.isRequired
    })
  ),
  location: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  }).isRequired,
  error: PropTypes.string
};

export default HistoryTracker;
