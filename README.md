# 概要

折れ線グラフをcanvasとcssで描画するJSです。  
メモリや凡例の部分など、グラフ以外のところをDOM追加することで、CSSでのスタイル調整ができるようにしました。  
canvasの描画には、CreateJsを使っています。  
レスポンシブに対応しています。


# 使い方

## CreateJsの読み込み
```html
<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>
```

もしくは<a href="https://createjs.com/" target="_blank">公式サイト</a>からダウンロードして読み込み

## oresenGraphCCの読み込み
scriptタグでの読み込み
```html
<script src="js/oresenGraphCC.js"></script>
```

モジュール版の読み込み
```javascript
import oresenGraphCC from "js/modules/oresenGraphCC.js";
```

## HTML
```html
<div class="ogcc-wrap">
  <canvas id="ogcc-canvas"></canvas>
</div>
```
クラス「ogcc-wrap」とid「ogcc-canvas」は任意に変更可能ですが、その場合下記に注意してください。
- 「ogcc-wrap」クラスを変更する場合  
下記にある基本のCSSがきかなくなりますので、手動でのスタイル追加が必要になります。
- 「ogcc-canvas」IDを変更する場合  
オプションにてcanvasIdの指定が必要です。

## oresenGraphCCスタイルシートの読み込み
基本のスタイルシートを読み込みます。
```html
<link rel="stylesheet" href="css/oresenGraphCC.css">
```
基本のスタイルシートを追加しなくても、グラフは表示されます。
基本のスタイルシートを読み込まない場合は、縦横のメモリなどはDOM追加されるだけです。

### 基本のスタイルシートを読み込まない場合の必須CSS
下記は必須のプロパティです。padding、max-widthは任意に変更可能です。
```css
.ogcc-wrap{
  position: relative;
  padding:60px 0 24px 42px;
  max-width: 900px;
  width: 100%;
}
```


## 実行

oresenGraphCC()でグラフを描画します。
```javascript
oresenGraphCC(データの配列,オプション,現在のステージ);
```

### 一番シンプルな実行
グラフのy軸の値を配列にし、oresenGraphCCを実行します。
```javascript
const allGraphData = [
  [3, 12, 45, 3, 15, '', 20, 45]
];
oresenGraphCC(allGraphData);
```

### 複数のグラフを表示する
配列を増やします。
```javascript
const allGraphData = [
  [3, 12, 45, 30, 15, '', 20],
  [1, 2, 35, 40, 16, 1, ''],
];
oresenGraphCC(allGraphData);
```

# オプション
オプションを追加することで、メモリやグリッドなどをカスタムすることができます。  
## 例
```javascript
const option = {
  graphTitle: true,//凡例の有無
  y: {
    unit: '人',//単位
    memoriInterval: 15,//目盛りのインターバル
    gridCount: 3,//1目盛りに何マスあるか
    gridBoldCount: 1,//1目盛りに太い線が何マスあるか
  },
  x: {
    unit: '年',//単位
    memoriInterval: 1,//目盛りのインターバル
    gridCount: 2,//1目盛りに何マスあるか
  },
  graph: [
    {
      graphName: 'データ1',
      dotColor: '#ff9fb3',
      lineColor: '#ff9fb3',
    },
    {
      graphName: 'データ2',
      dotColor: '#ff9fb3',
      lineColor: '#ff9fb3',
    },
  ]
}
const allGraphData = [
  [3, 12, 45, 30, 15, '', 20],
  [1, 2, 35, 40, 16, 1, ''],
];
oresenGraphCC(allGraphData, option);
```

## オプション一覧
| プロパティ | デフォルト値 | 説明 |
|-|-|-|
| canvasId | 'ogcc-canvas' | canvasタグのid |
| canvasY | 350 | canvasタグの高さ |
| canvasTop | 30 | グラフの上の余白 |
| canvasLeft | 10 | グラフの左の余白 |
| canvasRight | 70 | グラフの右の余白 |
| canvasBottom | 10 | グラフの下の余白 |
| gridStroke | 0.5 | グリッドの線の太さ（0の場合はグリッドなし） |
| gridEmStroke | gridStroke + 1 | グリッド(太線)の線の太さ（0の場合はグリッドなし） |
| grid_color | #ddd | グリッドの色 |
| zoom | true | ズーム機能の有無。true→x,y,xyすべてあり、xy→xyのみ、x→xのみ、y→yのみ、false→すべてなし |
| graphTitle | false | 凡例の有無 |
| graphDirection | true | 上下左右移動矢印の有無 |
| drowAnimation | true | 描画時のアニメーションの有無 |
| responsiveType | x-only | レスポンシブ用の設定。画面を縮めた時のグラフの縮小をどのようにするか。'x-only'→x軸のみ縮小、'aspect'→縦横比を保ったまま縮小 |
  

### Y軸のオプション
y{}の中で使用してください。
| プロパティ | デフォルト値 | 説明 |
|-|-|-|
| unit |  | 単位 |
| memoriInterval | 10 | 目盛りのインターバル |
| memoriFirstNum | データの最小値によって決まる | メモリの始めの数字 |
| memoriCount | データの最小値と最大値によって決まる | 縦軸の目盛りの数（通常はデータの最小値と最大値によって決まる。最初から固定したい場合に使用） |
| gridCount | 2 | 1目盛りに何マスあるか |
| gridBoldCount | 1 | 1目盛りに太い線が何マスあるか |
| memoriCustomText |  | メモリのテキストを編集したい場合に。[n]と入れるとメモリの数字が入る。例）'約[n]kg' |

### X軸のオプション
x{}の中で使用してください。
| プロパティ | デフォルト値 | 説明 |
|-|-|-|
| unit |  | 単位 |
| memoriInterval | 10 | 目盛りのインターバル |
| memoriFirstNum | 0 | メモリの始めの数字 ※memoriListがある場合はindexを指定 |
| memoriCount | データの個数によって決まる | 縦軸の目盛りの数（通常はデータの個数によって決まる。最初から固定したい場合に使用） |
| gridCount | 2 | 1目盛りに何マスあるか |
| gridBoldCount | 1 | 1目盛りに太い線が何マスあるか |
| memoriCustomText |  | メモリのテキストを編集したい場合に。[n]と入れるとメモリの数字が入る。例）'約[n]kg' |
| memoriList |  | メモリのリストを任意のものにしたい場合、配列で指定する(gridCountは強制的に無効となり、配列のlengthに置き換わる。) <br>例）memoriList: ['月', '火', '水', '木', '金', '土', '日']|

### グラフのオプション
| プロパティ | デフォルト値 | 説明 |
|-|-|-|
| graphName |  | グラフの名前（凡例に表示） |
| dotColor | #999 | 点の色 |
| dotSize | 15 | 点のサイズ |
| dotStyle | circle | 点の形。'circle'→円、'rect'→四角 |
| lineColor | #999 | ラインの色 |
| lineStroke | 1 | ラインの太さ |
| lineType | line | ラインのタイプ。'line'→直線、'curve'→曲線 |
| hoverCustomText | Y軸の値 | マウスオーバー時のテキストを編集。[y]=メモリのy軸の値、[x]=メモリのx軸の値、[unitY]=メモリのY軸の単位、[unitX]=x軸の単位が入る。例）'[x][unitX]：約[y][unitY]です' |
| graphFirstMemori | 0 | グラフデータの始めの数字はX軸の何メモリから始まるか ※memoriListがある場合は、indexを指定|


# グラフのリフレッシュ
oresenGraphCC関数はグラフのデータ(stageとcanvasWrap)をリターンします。
第三引数に現在のデータを渡すことで、グラフをリフレッシュすることができます。

```html
<div class="ogcc-wrap">
  <canvas id="ogcc-canvas"></canvas>
</div>
<button id="refresh">リフレッシュ</button>
```
```javascript
let graph = oresenGraphCC(allGraphData, option);

const refreshBtn = document.getElementById('refresh');
refreshBtn.addEventListener('click',refresh);

function refresh() {
  //例えば点と線の色をランダムに変更してリフレッシュ
  let cl = "rgb(" + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ")";
  option.graph[0].dotColor = cl;
  option.graph[0].lineColor = cl;
  graph = oresenGraphCC(allGraphData, option, graph)
}
```

# カスタマイズについて

CSSでのカスタマイズを基本としていますが、top、leftなどの位置決めはJS側で挿入されるところがあります。
その場合の微妙な位置調整を行いたい場合は、(邪道かもしれませんが)!importantやマイナスマージン、transform:translateなどを活用すると微調整できます。