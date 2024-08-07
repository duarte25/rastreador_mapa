import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
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

const Map = ({ markers, location, error }) => {
  
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

      {markers && markers.map((marker, index) => ( 
        <CustomMarker key={index} position={marker.ultima_posicao.coords}>
          <Popup>
            <h4 className="decoration-gray-50" >Data: {formatDate(marker.data_conectado)}</h4>
            <h4>Velocidade: {marker.ultima_posicao.vel}km/h</h4>
          </Popup>
        </CustomMarker>
      ))}

      {/* Custom hook to update map view based on location changes */}
      <MapUpdater location={location} />
    </MapContainer>
  );
};

Map.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      label: PropTypes.string
    })
  ),
  location: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  }).isRequired,
  error: PropTypes.string
};

export default Map;

//     {/* <Route source={source} destination={destination} /> */}