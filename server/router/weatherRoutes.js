const express = require('express');

const router = express.Router();

const WEATHER_API_KEY = '760d6319b48248b0917183629262406';

router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const q =
      lat && lon
        ? `${lat},${lon}`
        : req.query.q || 'india';

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}&aqi=yes`
    );

    const data = await response.json();

    res.json({
      success: true,
      city: data.location.name,
      state: data.location.region,
      country: data.location.country,
      weather: data.current,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;