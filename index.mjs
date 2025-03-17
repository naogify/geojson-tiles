// 必要なモジュールの読み込み
import fs from 'fs';
import path from 'path';
import geojsonvt from 'geojson-vt';


const geojsonFile = 'data.geojson';
const outputDir = 'tiles';


// GeoJSONファイルを非同期で読み込む
fs.readFile(geojsonFile, 'utf8', (err, data) => {
  if (err) {
    console.error('GeoJSONファイルの読み込みエラー:', err);
    return;
  }
  
  // 読み込んだ文字列をJSONにパース
  const geojson = JSON.parse(data);
  
  // geojson-vt によりタイルインデックスを作成（オプションは用途に応じて調整）
  const tileIndex = geojsonvt(geojson, {
    maxZoom: 14,      // タイルの最大ズームレベル
    indexMaxZoom: 5,  // インデックス作成時の最大ズームレベル
    indexMaxPoints: 10000  // 各タイルでの最大ポイント数
  });
  
  console.log('タイルインデックス作成完了');
    // タイル出力用のディレクトリ作成（存在しない場合）
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    // 0 から maxZoom までループ
    for (let z = 0; z <= 14; z++) {
      // ズームレベル z ではタイル数は 2^z (x,yともに)
      const numTiles = Math.pow(2, z);
      for (let x = 0; x < numTiles; x++) {
        for (let y = 0; y < numTiles; y++) {
          // タイルデータの取得
          const tile = tileIndex.getTile(z, x, y);
          if (tile) {
            // 出力先のディレクトリパスを作成：tiles/z/x/
            const tileDir = path.join(outputDir, String(z), String(x));
            if (!fs.existsSync(tileDir)) {
              fs.mkdirSync(tileDir, { recursive: true });
            }
            // ファイルパス：tiles/z/x/y.json
            const filePath = path.join(tileDir, `${y}.geojson`);
            // JSON 文字列に変換してファイルに書き出し
            fs.writeFileSync(filePath, JSON.stringify(tile, null, 2), 'utf8');
            console.log(`タイル書き出し: z=${z}, x=${x}, y=${y}`);
          }
        }
      }
    }
    console.log('全タイルの書き出しが完了しました。');
  
});
