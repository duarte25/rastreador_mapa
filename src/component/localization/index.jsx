import { useState, useEffect } from 'react';

const Localization = () => {
  const [location, setLocation] = useState({ latitude: -12.7341, longitude: -60.1446 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGetLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setError(null);
          },
          (err) => {
            setError(err.message);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    };

    handleGetLocation();
  }, []);

  return { location, error };
};

export default Localization;
