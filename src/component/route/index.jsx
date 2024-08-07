// Este código pega a street muito massa

// import React, { useEffect } from "react";
// import { useMap } from "react-leaflet";
// import L from "leaflet";

// const Route = ({ source, destination }) => {
//   const map = useMap();

//   useEffect(() => {
//     const fetchRoute = async () => {
//       try {
//         const response = await fetch(
//           `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
//         );
//         const data = await response.json();
//         const coordinates = data.routes[0].geometry.coordinates.map(coord => [
//           coord[1], // latitude
//           coord[0], // longitude
//         ]);
//         console.log("coordinates", coordinates);
//         L.polyline(coordinates, { color: "red" }).addTo(map);
//       } catch (error) {
//         console.error("Error fetching route data:", error);
//       }
//     };

//     fetchRoute();
//   }, [source, destination, map]);

//   return null;
// };

// export default Route;

// Este código vai de ponto a ponto
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
