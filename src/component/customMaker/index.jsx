import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Marker } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaCarSide } from "react-icons/fa";
import { LuAlertTriangle } from "react-icons/lu";

const CustomMarker = ({ position, children, connected, icon: Icon, colorIcon: ColorIcon }) => {
  // Renderiza o ícone como uma string SVG
  let svgMarkup = renderToStaticMarkup(<Icon size={30} color={connected ? ColorIcon : "#777"} />);

  const svgUrl = `data:image/svg+xml;base64,${btoa(svgMarkup)}`;

  const customIcon = L.icon({
    iconUrl: svgUrl,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker position={position} icon={customIcon}>
      {children}
    </Marker>
  );
};

export default CustomMarker;
