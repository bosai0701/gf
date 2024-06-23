// 地図の初期化
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.0, 135.0], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 地震データの取得
    const fetchEarthquakeData = () => {
        const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';

        $.getJSON(url, (data) => {
            // 既存のマーカーを削除
            map.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker) {
                    map.removeLayer(layer);
                }
            });

            data.features.forEach((earthquake) => {
                const coords = earthquake.geometry.coordinates;
                const magnitude = earthquake.properties.mag;
                const place = earthquake.properties.place;

                const circle = L.circleMarker([coords[1], coords[0]], {
                    radius: magnitude * 3, // マグニチュードに基づいてサイズを調整
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(map);

                circle.bindPopup(`地点: ${place}<br>マグニチュード: ${magnitude}`);
            });
        });
    };

    // 初回データ取得
    fetchEarthquakeData();

    // データを定期的に更新
    setInterval(fetchEarthquakeData, 60000); // 1分毎に更新
});
