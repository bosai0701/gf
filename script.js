// 地図の初期化
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.0, 135.0], 5); // 日本全体を表示するように設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 地震データの取得と表示
    const fetchAndDisplayEarthquakeData = () => {
        const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';

        $.getJSON(url, (data) => {
            console.log('地震データを取得しました:', data); // データをコンソールに出力

            // 日本国内の地震データのみをフィルタリング
            const japanEarthquakes = data.features.filter((earthquake) => {
                const coords = earthquake.geometry.coordinates;
                const lat = coords[1];
                const lng = coords[0];
                return lat >= 20 && lat <= 45 && lng >= 122 && lng <= 153; // 日本国内の緯度経度範囲
            });

            // 既存のマーカーを削除
            map.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker) {
                    map.removeLayer(layer);
                }
            });

            // マーカーとポップアップを地図に追加
            japanEarthquakes.forEach((earthquake) => {
                const coords = earthquake.geometry.coordinates;
                const magnitude = earthquake.properties.mag;
                const place = earthquake.properties.place;

                console.log(`地震をプロット: ${place}, マグニチュード: ${magnitude}`); // ログを出力

                const circle = L.circleMarker([coords[1], coords[0]], {
                    radius: magnitude * 3, // マグニチュードに基づいてサイズを調整
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(map);

                circle.bindPopup(`地点: ${place}<br>マグニチュード: ${magnitude}`);
            });

            // 地震データに合わせて地図をズーム
            const bounds = L.latLngBounds(japanEarthquakes.map((earthquake) => [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]]));
            map.fitBounds(bounds.pad(0.2)); // ズームアウトして表示
        }).fail((jqxhr, textStatus, error) => {
            console.error('データの取得に失敗しました:', textStatus, error);
        });
    };

    // 初回データ取得と表示
    fetchAndDisplayEarthquakeData();

    // データを定期的に更新
    setInterval(fetchAndDisplayEarthquakeData, 1000); // 1秒毎に更新
});
