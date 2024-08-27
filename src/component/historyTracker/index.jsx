import React, { useEffect } from 'react';
import { MapContainer, Popup, TileLayer, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CustomMarker from '../customMaker';
import PropTypes from 'prop-types';
import { IoLocationSharp } from "react-icons/io5";
import { TbPointFilled } from "react-icons/tb";
import { MdOutlineHourglassTop } from "react-icons/md";
import { RiAlertFill } from "react-icons/ri";

import FormattedDate from '../realTimeTrackers/formattedDate';
import haversineDistance from "haversine-distance";

const gerarPontosMapa = (markers) => {
  let pontos = [];
  let nParados = 0;
  for (let index = 0; index < markers.length; index++) {
    const marker = markers[index];
    // Verifica se é o primeiro ou o último marcador
    const alertMsg = marker.tipo === "ALT" && marker.alertMessage && marker.alertMessage != "Movimento detectado";
    const isFirst = index === 0;
    const isLast = index === markers.length - 1;
    let pontoAnterior = pontos.length > 0 ? pontos[pontos.length - 1] : undefined;
    if (!alertMsg && !isFirst && !isLast && pontoAnterior) {
      let coord_atual = marker.coords;
      let coord_antes = pontoAnterior.marker.coords;
      //let dist = Math.abs(coord_atual[1] - coord_antes[1]); // depois calcular certo
      let distanceMeters = haversineDistance({
        lat: coord_atual[0], lng: coord_atual[1]
      }, {
        lat: coord_antes[0], lng: coord_antes[1]
      });

      if (distanceMeters < 10) {
        nParados++;
        continue;
      }
    }
    // Escolhe o ícone com base na posição
    let icon = TbPointFilled;
    // Define a cor com base na posição
    let colorIcon = "#155ECC";
    let sizeIcon = 20;
    let zIndexOffset = 0; // Definindo um zIndexOffset alto para o primeiro e último marcador

    if (isFirst || isLast) {
      icon = IoLocationSharp; 
      colorIcon = "#d61e0e";
      sizeIcon = 25;
      zIndexOffset = 1000;
    } else if(alertMsg) {
      icon = RiAlertFill;
      colorIcon = "ffff00";
      zIndexOffset = 500;
      sizeIcon = 25;
    } else if(nParados > 2) {
      icon = MdOutlineHourglassTop;
      colorIcon = "#d61e0e";
      zIndexOffset = 500;
      sizeIcon = 25;
    }

    //if (index < markers.length - 1) {
    //  routes.push([marker.coords, markers[index + 1].coords]);
    //}

    pontos.push({
      icon: icon,
      colorIcon: colorIcon,
      sizeIcon: sizeIcon,
      zIndexOffset: zIndexOffset,
      marker: marker,
      coords_anterior: pontoAnterior && pontoAnterior.marker.coords
    });
    nParados = 0;
  }
  return pontos;
};

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
  const pontos = gerarPontosMapa(markers);

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

      {pontos.map((ponto, index) => {
        let marker = ponto.marker;
        return (
          <React.Fragment key={index}>
            <CustomMarker
              position={marker.coords}
              connected={true}
              icon={ponto.icon}
              colorIcon={ponto.colorIcon}
              sizeIcon={ponto.sizeIcon}
              zIndexOffset={ponto.zIndexOffset}
            >
              <Popup>
                <h4 className="decoration-gray-50">Data: <FormattedDate date={marker.data} /></h4>
                <h4>Velocidade: {marker.vel}km/h</h4>
                { marker.alertMessage && <p> {marker.alertMessage} </p>}
              </Popup>
            </CustomMarker>
            {
              ponto.coords_anterior && (
                <Polyline
                  positions={[marker.coords, ponto.coords_anterior]}
                  color="#155ECC"
                />
              )
            }
          </React.Fragment>
        );
      })}
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
