// 地図の初期化
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.0, 135.0], 5); // 日本全体を表示するように設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 地震データの取得と表示
    const fetchAndDisplayEarthquakeData = () => {
        const url = 'https://api.hinet.bosai.go.jp/nied/1/query?source=HP1&time_from=now-1h&includeall=true'; // NIEDの地震データを取得

        $.getJSON(url, (data) => {
            console.log('地震データを取得しました:', data); // データをコンソールに出力

            // 既存のマーカーを削除
            map.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker) {
                    map.removeLayer(layer);
                }
            });

            // マーカーとポップアップを地図に追加
            data.forEach((earthquake) => {
                const coords = earthquake.geometry.coordinates;
                const magnitude = earthquake.properties.magnitude;
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
            const bounds = L.latLngBounds(data.map((earthquake) => [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]]));
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
