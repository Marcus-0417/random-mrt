import { useState } from 'react'
import './App.css'

// 台北捷運站清單（含路線顏色與簡易代碼）
// line 顏色代碼：
// red: 淡水信義線、blue: 板南線、green: 松山新店線、
// orange: 中和新蘆線、brown: 文湖線、yellow: 環狀線、purple: 機場捷運
const buildStations = (
  names,
  line,
  prefix,
  { padTwoDigits = false, offset = 1 } = {},
) =>
  names.map((name, index) => {
    const num = index + offset
    const suffix = padTwoDigits ? String(num).padStart(2, '0') : String(num)
    return {
      name,
      line,
      code: `${prefix}${suffix}`,
    }
  })

const TAIPEI_MRT_STATIONS = [
  // 淡水信義線（red）→ R02, R03, ...（R01 為尚未通車的廣慈/奉天宮，不列入抽選）
  ...buildStations(
    [
      '象山', '台北101/世貿', '信義安和', '大安', '大安森林公園', '東門', '中正紀念堂',
      '台大醫院', '台北車站', '中山', '雙連', '民權西路', '圓山', '劍潭', '士林',
      '芝山', '明德', '石牌', '唭哩岸', '奇岩', '北投', '復興崗', '忠義', '關渡',
      '竹圍', '紅樹林', '淡水',
    ],
    'red',
    'R',
    { padTwoDigits: true, offset: 2 },
  ),
  {
    name: '新北投',
    line: 'red',
    code: 'R22A',
    branchOf: '北投',
  },

  // 板南線（blue）→ BL01, BL02, ...
  ...buildStations(
    [
      '頂埔', '永寧', '土城', '海山', '亞東醫院', '府中', '板橋', '新埔', '江子翠',
      '龍山寺', '西門', '台北車站', '善導寺', '忠孝新生', '忠孝復興', '忠孝敦化', '國父紀念館',
      '市政府', '永春', '後山埤', '昆陽', '南港', '南港展覽館',
    ],
    'blue',
    'BL',
    { padTwoDigits: true },
  ),

  // 松山新店線（green）
  // 注意：小碧潭為七張支線站，代碼為 G03A，不影響主線編號（七張 G03、大坪林 G04 ...）
  ...buildStations(
    [
      '新店', '新店區公所', '七張', '大坪林', '景美', '萬隆', '公館',
      '台電大樓', '古亭', '中正紀念堂', '小南門', '西門', '北門', '中山', '松江南京',
      '南京復興', '台北小巨蛋', '南京三民', '松山',
    ],
    'green',
    'G',
    { padTwoDigits: true },
  ),
  {
    name: '小碧潭',
    line: 'green',
    code: 'G03A',
    branchOf: '七張',
  },

  // 中和新蘆線（orange）→ O01, O02, ...
  ...buildStations(
    [
      '南勢角', '景安', '永安市場', '頂溪', '古亭', '東門', '忠孝新生',
      '松江南京', '行天宮', '中山國小', '民權西路', '大橋頭', '台北橋', '菜寮',
      '三重', '先嗇宮', '頭前庄', '新莊', '輔大', '丹鳳', '迴龍',
      '三重國小', '三和國中', '徐匯中學', '三民高中', '蘆洲',
    ],
    'orange',
    'O',
    { padTwoDigits: true },
  ),

  // 文湖線（brown，部分）→ BR01, BR02, ...
  ...buildStations(
    [
      '動物園', '木柵', '萬芳社區', '萬芳醫院', '辛亥', '麟光', '六張犁',
      '科技大樓', '大安', '忠孝復興', '南京復興', '中山國中', '松山機場',
      '大直', '劍南路', '西湖', '港墘', '文德', '內湖', '大湖公園',
      '葫洲', '東湖', '南港軟體園區', '南港展覽館',
    ],
    'brown',
    'BR',
    { padTwoDigits: true },
  ),

  // 環狀線（yellow，部分站）→ Y01, Y02, ...
  ...buildStations(
    [
      '大坪林', '十四張', '秀朗橋', '景平', '景安', '中和', '橋和', '中原',
      '板新', '板橋', '新埔民生', '頭前庄', '幸福', '新北產業園區',
    ],
    'yellow',
    'Y',
    { padTwoDigits: true, offset: 7 },
  ),

  // 機場捷運（purple，主要站）→ A1, A2, ...
  ...buildStations(
    [
      '台北車站', '三重', '新北產業園區', '新莊副都心', '泰山', '泰山貴和',
      '體育大學', '長庚醫院', '林口', '山鼻', '坑口',
      '機場第一航廈', '機場第二航廈',
    ],
    'purple',
    'A',
  ),
]

// 部分熱門車站的附近景點建議（可依需求持續補充）
const STATION_ATTRACTIONS = {
  淡水: ['淡水老街', '紅毛城', '漁人碼頭夜景'],
  北投: ['北投溫泉博物館', '地熱谷', '北投圖書館'],
  士林: ['士林夜市', '士林官邸', '台北科教館'],
  劍潭: ['士林夜市', '台北表演藝術中心'],
  中山: ['南西商圈', '台北當代藝術館', '赤峰街周邊小店'],
  西門: ['西門町商圈', '電影街', '馬辣火鍋一條街'],
  台北車站: ['中正紀念堂', '華山1914文化創意產業園區', '京站/微風北車購物'],
  '台北101/世貿': ['台北101觀景台', '信義商圈百貨', '象山步道入口（近象山站）'],
  象山: ['象山親山步道', '六巨石觀景點', '夜景拍攝點'],
  動物園: ['台北市立動物園', '貓空纜車', '貓空茶園'],
  大直: ['美麗華百樂園摩天輪', '大直河濱公園'],
  南港展覽館: ['南港展覽館場館展覽', 'CITYLINK 南港店'],
  公館: ['公館商圈', '自來水園區', '寶藏巖國際藝術村'],
  新店: ['碧潭風景區', '和美山步道'],
  大坪林: ['景美夜市（步行可達）'],
  '台北車站(A1)': ['桃園機場捷運台北站', '轉乘台北車站周邊景點'],
  '長庚醫院(A8)': ['林口長庚醫院園區', '林口三井 OUTLET'],
}

function App() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleRandomPick = () => {
    if (isAnimating) return

    const total = TAIPEI_MRT_STATIONS.length
    if (total === 0) return

    setIsAnimating(true)

    // 先決定「最終抽到的站」，同時避免跟上一站相同
    let finalStation = currentStation
    if (total === 1) {
      finalStation = TAIPEI_MRT_STATIONS[0]
    } else {
      let candidate = null
      let tries = 0
      const maxTries = 20

      while (
        (!candidate || candidate.code === currentStation?.code) &&
        tries < maxTries
      ) {
        const randomIndex = Math.floor(Math.random() * total)
        candidate = TAIPEI_MRT_STATIONS[randomIndex]
        tries += 1
      }

      finalStation = candidate || TAIPEI_MRT_STATIONS[0]
    }

    // 抽獎動畫：在短時間內不斷切換隨機站名，最後停在真正抽中的站
    const rollIntervalMs = 80
    const rollDurationMs = 1000

    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * total)
      setCurrentStation(TAIPEI_MRT_STATIONS[randomIndex])
    }, rollIntervalMs)

    setTimeout(() => {
      clearInterval(intervalId)
      setCurrentStation(finalStation)
      setIsAnimating(false)
    }, rollDurationMs)
  }

  return (
    <div className="app-root">
      <div className="app-container">
        <header className="app-header">
          <h1>台北捷運隨機抽取器</h1>
          <p className="subtitle">
            給還沒想好要去哪裡的你，一鍵抽出今天的冒險起點。
          </p>
        </header>

        <main className="content">
          <div className="station-card">
            <div
              className={`station-name ${isAnimating ? 'station-name--shake' : ''} ${
                currentStation ? `station-name--${currentStation.line}` : ''
              } ${
                currentStation && currentStation.name === '小碧潭'
                  ? 'station-name--lightgreen'
                  : ''
              } ${
                currentStation && currentStation.name === '新北投'
                  ? 'station-name--pink'
                  : ''
              }`}
            >
              {currentStation
                ? `${currentStation.name} (${currentStation.code})`
                : '還沒決定，按下下面的按鈕開始冒險！'}
            </div>

            {currentStation && !isAnimating && (
              <div className="station-attractions">
                <div className="station-attractions__title">附近景點建議</div>
                <ul className="station-attractions__list">
                  {(STATION_ATTRACTIONS[currentStation.name] ||
                    ['暫時沒有特別整理的景點，走出車站隨意探索也是一種冒險！']
                  ).map((place) => (
                    <li key={place} className="station-attractions__item">
                      {place}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="random-button" onClick={handleRandomPick}>
            抽一個車站
          </button>

          <p className="hint-text">
            可以和朋友一起玩：決定集合站、約會地點、今晚要吃飯的捷運站…
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
