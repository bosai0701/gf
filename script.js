// 地図の初期化
document.addEventListener('DOMContentLoaded', () => {
    // 初期表示範囲を北海道に設定
    const map = L.map('map').setView([43.0, 141.0], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 地震データの取得と表示
    const fetchAndDisplayEarthquakeData = () => {
        const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';

        $.getJSON(url, (data) => {
            console.log('地震データを取得しました:', data); // データをコンソールに出力

            // 既存のマーカーを削除
            map.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker) {
                    map.removeLayer(layer);
                }
            });

            // S波とP波に沿ってズームするための座標計算
            let latitudes = data.features.map((earthquake) => earthquake.geometry.coordinates[1]);
            let longitudes = data.features.map((earthquake) => earthquake.geometry.coordinates[0]);
            let maxLatitude = Math.max(...latitudes);
            let minLatitude = Math.min(...latitudes);
            let maxLongitude = Math.max(...longitudes);
            let minLongitude = Math.min(...longitudes);
            let centerLat = (maxLatitude + minLatitude) / 2;
            let centerLng = (maxLongitude + minLongitude) / 2;

            // マーカーとポップアップを地図に追加
            data.features.forEach((earthquake) => {
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

            // S波とP波に沿ってズーム
            map.setView([centerLat, centerLng], 8); // 中心座標にズーム
        }).fail((jqxhr, textStatus, error) => {
            console.error('データの取得に失敗しました:', textStatus, error);
        });
    };

    // 初回データ取得と表示
    fetchAndDisplayEarthquakeData();

    // データを定期的に更新
    setInterval(fetchAndDisplayEarthquakeData, 1000); // 1秒毎に更新
});
