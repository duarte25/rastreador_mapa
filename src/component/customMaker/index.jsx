import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Marker } from 'react-leaflet';
import { FaMapPin } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaCarSide } from "react-icons/fa";

const CustomMarker = ({ position, children }) => {
  // Renderiza o ícone como uma string SVG
  const svgMarkup = renderToStaticMarkup(<FaCarSide size={30} color="blue" />);
  const svgUrl = `data:image/svg+xml;base64,${btoa(svgMarkup)}`;

  const customIcon = L.icon({
    iconUrl: svgUrl,
    iconSize: [20, 20],
    iconAnchor: [15, 15],
  });

  return (
    <Marker position={position} icon={customIcon}>
      {children}
    </Marker>
  );
};

export default CustomMarker;
