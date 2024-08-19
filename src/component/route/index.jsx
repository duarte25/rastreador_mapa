//  Este código vai de ponto a ponto
import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const Route = ({ source, destination }) => {
  const map = useMap();
  
  useEffect(() => {
    const drawDirectLine = () => {
      const coordinates = [
        [source[0], source[1]], // [latitude, longitude] for source
        [destination[0], destination[1]]  // [latitude, longitude] for destination
      ];
      console.log("coordinates", coordinates);
      L.polyline(coordinates, { color: "red" }).addTo(map);
    };

    drawDirectLine();
  }, [source, destination, map]);

  return null;
};

export default Route;
