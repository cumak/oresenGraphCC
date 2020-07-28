import oresenGraphCC from "./src/oresenGraphCC.js";
// import oresenGraphCC from "../../public/js/modules/oresenGraphCC.js";


const option = {
  canvasId: 'ogcc-canvas',
  // canvasX: '1200',//横スクロールで表示する場合設定(未実装)
  // canvasY: 400,
  canvasTop: 20,
  // canvasLeft: 10,
  // canvasRight: 10,
  // canvasBottom: 10,
  // gridStroke: 0,//グリッドの線の太さ（0の場合はグリッドなし）
  // gridEmStroke: 2,//グリッド(太線)の線の太さ（0の場合はグリッドなし）
  // gridColor: '',
  // zoom:false,//true→x,y,xy、xy→xyのみ、x→xのみ、y→yのみ、false→すべてなし
  graphTitle: true,//凡例の有無
  // graphDirection: false,//矢印の有無
  // drowAnimation:false,//描画時のアニメーションの有無
  // responsiveType:'aspect',//'x-only'→x軸のみ縮小、'aspect'→縦横比を保ったまま縮小
  y: {
    unit: '人',//単位
    // memoriInterval: 10,//目盛りのインターバル
    // memoriFirstNum: 10,//メモリの始めの数字
    // memoriCount: 4,//縦軸の目盛りの数
    gridCount: 2,//1目盛りに何マスあるか
    gridBoldCount: 1,//1目盛りに太い線が何マスあるか
    // memoriCustomText: '約[n]kg',//メモリのテキストを編集 [n]メモリの数字が入る
  },
  x: {
    unit: '年',//単位
    memoriInterval: 6,//目盛りのインターバル
    memoriFirstNum: 1,//メモリの始めの数字
    // memoriCount: 5,//横軸の目盛りの数
    gridCount: 3,//1目盛りに何マスあるか
    gridBoldCount: 1,//1目盛りに太い線が何マスあるか
    // memoriCustomText: '約[n]くらい',//メモリのテキストを編集 [n]メモリの数字が入る
    // memoriList: ['月', '火', '水', '木', '金', '土', '日'],//メモリのリストを任意のものに編集(memoriCountは強制的に無効、memoriIntervalは強制的に1に)
  },
  graph: [
    {
      graphName: 'データ１',
      dotColor: '#ff9fb3',
      dotSize: 15,
      dotStyle: 'rect',
      lineColor: '#ff9fb3',
      lineStroke: 2,
      lineType: 'curve',
      hoverCustomText: '[x][unitX]：約[y][unitY]です',//hoverのテキストを編集 [y]=メモリのy軸の値、[x]=メモリのx軸の値、[unitY]=メモリのY軸の単位、[unitX]=x軸の単位が入る
      graphFirstMemori:1,//グラフデータの始めの数字はX軸の何メモリから始まるか
    },
    {
      graphName: 'データ２',
      dotSize: 6,
      lineType: 'curve',
      hoverCustomText: '[x][unitX]：約[y][unitY]だよ',//hoverのテキストを編集 [y]=メモリのy軸の値、[x]=メモリのx軸の値、[unitY]=メモリのY軸の単位、[unitX]=x軸の単位が入る
      graphFirstMemori: 1,//グラフデータの始めの数字はX軸の何メモリから始まるか
    },
  ]
}

const allGraphData = [
  [5,10,15,20,25],
  [10, 2, -15, 40, 16, 1, ''],
];


const allGraphData2 = [
  [1, 2, 35, 40, 16, 1, 10],
];
const option2 = {
  canvasId: 'ogcc-canvas2',
  // canvasX: '1200',//横スクロールで表示する場合設定
  canvasY: 200,
  // gridStroke: 1,//グリッドの線の太さ（0の場合はグリッドなし）
  // gridEmStroke: 2,//グリッド(太線)の線の太さ（0の場合はグリッドなし）
  gridColor: '#2ee',
  zoom:'x',//true→x,y,xy、xy→xyのみ、x→xのみ、y→yのみ、false→すべてなし
  graphTitle: true,//凡例の有無
  // graphDirection: false,//凡例の有無
  // drowAnimation:false,//描画時のアニメーションの有無
  graph: [
    {
      graphName: 'データ１',
      dotColor: '#fe9f33',
      dotSize: 8,
      dotStyle: 'rect',
      lineColor: '#fe9f33',
      lineStroke: 3,
      hoverCustomText: '[y][unitY]',//hoverのテキストを編集 [y]=メモリのy軸の値、[x]=メモリのx軸の値、[unitY]=メモリのY軸の単位、[unitX]=x軸の単位が入る
    },
  ]
}

let graph = oresenGraphCC(allGraphData, option)
let graph2 = oresenGraphCC(allGraphData2, option2)

// リフレッシュテスト
const refreshBtn = document.getElementById('refresh');
refreshBtn.addEventListener('click',refresh);

function refresh() {
  let cl = "rgb(" + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ")";
  option.graph[0].dotColor = cl;
  option.graph[0].lineColor = cl;
  graph = oresenGraphCC(allGraphData, option, graph)
}