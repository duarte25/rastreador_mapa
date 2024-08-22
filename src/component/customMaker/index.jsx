import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Marker } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

const CustomMarker = ({ position, children, connected, icon: Icon, colorIcon: ColorIcon, sizeIcon, zIndexOffset }) => {
  // Renderiza o ícone como uma string SVG com o tamanho definido pela prop sizeIcon
  let svgMarkup = renderToStaticMarkup(<Icon size={sizeIcon} color={connected ? ColorIcon : "#777"} />);

  // Codifica o SVG em base64 para usar como URL da imagem
  const svgUrl = `data:image/svg+xml;base64,${btoa(svgMarkup)}`;

  // Cria o ícone personalizado para o Leaflet, usando o tamanho definido por sizeIcon
  const customIcon = L.icon({
    iconUrl: svgUrl,
    iconSize: [sizeIcon, sizeIcon], // Ajusta o tamanho do ícone
    iconAnchor: [sizeIcon / 2, sizeIcon / 2], // Ajusta a âncora do ícone para que o ponto central seja o centro do ícone
  });

  return (
    <Marker position={position} icon={customIcon} zIndexOffset={zIndexOffset}>
      {children}
    </Marker>
  );
};

export default CustomMarker;
