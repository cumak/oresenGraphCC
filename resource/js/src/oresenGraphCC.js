// カンバスの幅は、canvaswrapから計算される仕組み。

const oresenGraphCC = (allGraphData, option, currentGraph) => {

  let stage = null;
  let canvasWrap = null;

  // リフレッシュ時にステージとcanvasWrapを既存のものに差し替えてリセット
  if (currentGraph) {
    stage = currentGraph.stage;
    canvasWrap = currentGraph.canvasWrap;
    reset();
  }

  // パラメータ初期値セット
  option = option ?? createEmptyOption()//オプションがなければカラのものを作る
  const canvasId = option.canvasId ?? 'ogcc-canvas';
  let canvasX = '';
  let canvasY = option.canvasY ?? 350;
  const canvasTop = option.canvasTop ?? 30;
  const canvasLeft = option.canvasLeft ?? 10;
  const canvasRight = option.canvasRight ?? 70;
  const canvasBottom = option.canvasBottom ?? 10;
  const gridStroke = option.gridStroke ?? .5;
  const gridEmStroke = option.gridEmStroke ?? gridStroke + 1;
  const gridColor = option.gridColor ?? '#ddd';
  const zoom = option.zoom ?? true;
  const graphTitle = option.graphTitle ?? false;
  const graphDirection = option.graphDirection ?? true;
  const drowAnimation = option.drowAnimation ?? true;
  const responsiveType = option.responsiveType ?? 'x-only';

  const y = {}
  option.y = option.y ?? new Object()//yがなければカラのものを作る
  y.unit = option.y.unit ?? '';
  y.memoriInterval = option.y.memoriInterval ?? 10;
  y.memoriFirstNum = memoriFirstNumCalc();
  y.memoriCount = memoriCountingY();
  y.gridCount = option.y.gridCount ?? 2;
  y.gridBoldCount = option.y.gridBoldCount ?? 1;
  y.memoriCustomText = option.y.memoriCustomText ?? '';

  const x = {}
  option.x = option.x ?? new Object()//yがなければカラのものを作る
  x.unit = option.x.unit ?? '';
  x.memoriList = option.x.memoriList ?? '';
  x.memoriInterval = memoriIntervalX();
  x.memoriFirstNum = option.x.memoriFirstNum ?? 0;
  x.memoriCount = memoriCountingX();
  x.gridCount = option.x.gridCount ?? 2;
  x.gridBoldCount = option.x.gridBoldCount ?? 1;
  x.memoriCustomText = option.x.memoriCustomText ?? '';

  let graph = []
  option.graph = option.graph ?? new Object()//graphがなければカラのものを作る
  for (let i = 0; i < allGraphData.length; i++) {
    graph[i] = {};
    option.graph[i] = option.graph[i] ?? {};
    graph[i].graphName = option.graph[i].graphName ?? '';
    graph[i].dotColor = option.graph[i].dotColor ?? '#999';
    graph[i].dotSize = option.graph[i].dotSize ?? 15;
    graph[i].dotStyle = option.graph[i].dotStyle ?? 'circle';
    graph[i].lineColor = option.graph[i].lineColor ?? '#999';
    graph[i].lineStroke = option.graph[i].lineStroke ?? 1;
    graph[i].lineType = option.graph[i].lineType ?? 'line';
    graph[i].hoverCustomText = option.graph[i].hoverCustomText ?? '';
    graph[i].graphFirstMemori = option.graph[i].graphFirstMemori ?? 0;
  }


  // canvas
  const canvas = document.getElementById(canvasId);
  canvasWrap = canvas.parentElement;

  // canvasWrapのpaddingを取得
  const wrapPaddingLeft = parseInt(getComputedStyle(canvasWrap, null).getPropertyValue('padding-left').replace('px', ''));
  const wrapPaddingRight = parseInt(getComputedStyle(canvasWrap, null).getPropertyValue('padding-right').replace('px', ''));
  const wrapPaddingTop = parseInt(getComputedStyle(canvasWrap, null).getPropertyValue('padding-top').replace('px', ''));

  // canvas幅の決定
  if (typeof option.canvasX == 'undefined') {
    canvasX = parseInt(getComputedStyle(canvasWrap, null).getPropertyValue('width').replace('px', '')) - wrapPaddingLeft - wrapPaddingRight
  } else {
    canvasX = option.canvasX;
  }

  // アスペクト比を求める
  const canvasWrapMaxWidth = getComputedStyle(canvasWrap, null).getPropertyValue('max-width');
  const canvasMaxWidth = canvasWrapMaxWidth.replace('px', '') - wrapPaddingLeft - wrapPaddingRight;
  const aspect = canvasMaxWidth / canvasY;


  // stage新規作成
  stage = new createjs.Stage(canvasId);
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  stage.enableMouseOver();

  // 変数
  let jikuContainer, memoriY, memoriX, unitY, unitX, gridContainer, graphContainer, scaleBtnContainer, scaleBtnYContainer, scaleBtnXContainer, plusAll, minusAll, plusY, minusY, plusX, minusX, graphTitleWrap, directionWrap
  let hoverContentDiv = []
  let graphList = []//zoomアニメーションのために必要なデータだけ（x,yなど）を記憶しておくもの

  // 各処理
  function createEmptyOption() {
    const x = new Object()
    const y = new Object()
    const graph = new Array()
    return { x, y, graph }
  }

  function graphUpdate() {
    reset();
    loadAll();
    stage.update();
  }


  // 縦横のメモリ数を計算（memoriCountオプション指定がない場合）
  function memoriCountingY() {
    let count;
    if (typeof option.y.memoriCount == 'undefined') {
      const { max, min } = memoriMinMax();
      count = Math.ceil(max / y.memoriInterval) - Math.floor(min / y.memoriInterval);
    } else {
      count = option.y.memoriCount
    }
    return count;
  }
  function memoriCountingX() {
    // 複数グラフの中で一番データ数が多いものに合わせる
    let count;
    if (x.memoriList) {
      count = x.memoriList.length - 1 - x.memoriFirstNum;
    } else {
      // memoriCountもmemoriListも指定がなければデータの数値による
      if (typeof option.x.memoriCount == 'undefined') {
        let max = 0;
        allGraphData.forEach(arr => {
          const len = arr.length;
          max = len > max ? len : max;
        })
        count = max - 1;
      } else {
        count = option.x.memoriCount
      }
    }
    return count;
  }
  function memoriFirstNumCalc() {
    let firstNum;
    if (typeof option.y.memoriFirstNum == 'undefined') {
      const { min } = memoriMinMax()
      const a = Math.floor(min / y.memoriInterval);
      firstNum = a * y.memoriInterval;
    } else {
      firstNum = option.y.memoriFirstNum
    }
    return firstNum
  }
  function memoriMinMax() {
    // 全グラフデータの最大値と最小値を取得
    let alldata = [];
    allGraphData.forEach(arr => {
      alldata = alldata.concat(arr);
    })
    let max = Math.max(...alldata);
    let min = Math.min(...alldata);
    return { max, min }
  }
  function memoriIntervalX() {
    // memoriListがあればそれ優先
    if (typeof option.x.memoriList != 'undefined') {
      return 1;
    } else if (option.x.memoriInterval) {
      return option.x.memoriInterval;
    } else {
      return 10
    }
  }

  // リセット
  function reset() {
    const deleteElement = canvasWrap.children;
    [...deleteElement].forEach(el => {
      // canvas以外のDOM削除
      if (el.tagName !== 'CANVAS') {
        el.remove()
      }
    })
    // ステージの破棄
    stage.removeAllChildren();
    // stage.clear();
    stage.removeAllEventListeners();
  }


  responsive('nonUpdate');
  loadAll()

  function loadAll() {


    //カンバスが使えなければ終了
    if (!canvas || !canvas.getContext) {
      return false;
    }

    // 初期計算
    let jiku_height, jiku_width, gridAllCountY, gridOneHeight, memoriOneHeight, gridAllCountX, gridOneWidth, memoriOneWidth, oneValHeight, oneValWidth;

    function init() {
      jiku_height = canvasY - canvasBottom; //縦軸の長さ
      jiku_width = canvasX - canvasLeft; //横軸の長さ
      gridAllCountY = y.memoriCount * y.gridCount; //縦軸のグリッドの数
      gridOneHeight = (jiku_height - canvasTop) / gridAllCountY; //縦軸の1グリッドのpx
      memoriOneHeight = (jiku_height - canvasTop) / y.memoriCount; //縦軸の1メモリのpx
      gridAllCountX = x.memoriCount * x.gridCount; //横軸のグリッドの数
      gridOneWidth = (jiku_width - canvasRight) / gridAllCountX; //横軸の1グリッドのpx
      memoriOneWidth = (jiku_width - canvasRight) / x.memoriCount; //縦軸の1メモリのpx
      oneValHeight = memoriOneHeight / y.memoriInterval //縦軸の値１＝何pxか
      oneValWidth = memoriOneWidth / x.memoriInterval //横軸の値１＝何pxか
    }

    init()

    // canvasのwidthとheightを指定（CSSは見た目サイズ、属性はリティーナ対策でその２倍）
    canvas.setAttribute('style', `width: ${canvasX}px; height: ${canvasY}px;`)
    canvas.width = canvasX * 2
    canvas.height = canvasY * 2


    // 軸
    const createJiku = () => {
      jikuContainer = new createjs.Container();
      jikuContainer.x = canvasLeft
      jikuContainer.y = 0;
      stage.addChild(jikuContainer);
      let jiku = new createjs.Graphics();
      jiku.beginStroke("#999");
      jiku.setStrokeStyle(1);
      jiku.moveTo(0, 0).lineTo(0, jiku_height - 1).lineTo(canvasX, jiku_height - 1).endStroke();
      //Displayオブジェクトを作成
      var shape_jiku = new createjs.Shape(jiku);
      //シェイプオブジェクトをステージに追加する
      jikuContainer.addChild(shape_jiku);
    }

    const createMemori = () => {
      // 目盛り（縦）

      memoriY = document.createElement("ul")
      memoriY.setAttribute("class", "ogcc-memoriY");
      memoriY.setAttribute("style", "top:" + (canvasTop + wrapPaddingTop) + 'px');
      let memoriY_lists = '';
      for (let i = 0; i <= y.memoriCount; i++) {
        const y_num = y.memoriInterval * (y.memoriCount - i) + y.memoriFirstNum;
        const y_text = y.memoriCustomText ? y.memoriCustomText.replace('[n]', y_num) : y_num;
        memoriY_lists += '<li class="ogcc-memoriY_li">' + y_text + '</li>'
      }
      memoriY.insertAdjacentHTML('afterbegin', memoriY_lists)
      canvasWrap.appendChild(memoriY);
      const memoriY_li = canvasWrap.querySelectorAll('.ogcc-memoriY_li');
      [...memoriY_li].forEach((el, index) => {
        el.setAttribute("style", "top:" + (memoriOneHeight * index) + "px");
      })
      if (y.unit) {
        unitY = document.createElement('span');
        unitY.setAttribute('class', 'ogcc-unitY');
        unitY.innerHTML = '（' + y.unit + '）';
        canvasWrap.append(unitY);
      }
      // 目盛り（横）
      memoriX = document.createElement("ul")
      memoriX.setAttribute("class", "ogcc-memoriX");
      memoriX.setAttribute("style", "left:" + (wrapPaddingLeft + canvasLeft) + 'px');
      let memoriX_lists = '';
      
      for (let i = 0; i <= x.memoriCount; i++) {
        // メモリの数字があれば
        let x_num;
        if (x.memoriList.length > 0){
          x_num = x.memoriList[i];
        }else{
          x_num = i * x.memoriInterval + x.memoriFirstNum;
        }
        // メモリテキストカスタマイズ
        let x_text = '';
        x_text = x.memoriCustomText ? x.memoriCustomText.replace('[n]', x_num) : x_num;
        if (x.memoriList.length) {
          x_text = x.memoriList[i + x.memoriFirstNum];
          x_text = x_text == undefined ? '' : x_text;
        }
        memoriX_lists += '<li class="ogcc-memoriX_li">' + x_text + '</li>'
      }
      memoriX.insertAdjacentHTML('afterbegin', memoriX_lists)
      canvasWrap.appendChild(memoriX);
      const memoriX_li = canvasWrap.querySelectorAll('.ogcc-memoriX_li');
      [...memoriX_li].forEach((el, index) => {
        el.setAttribute("style", "left:" + (memoriOneWidth * index) + "px");
      })
      if (x.unit) {
        unitX = document.createElement('span');
        unitX.setAttribute('class', 'ogcc-unitX');
        unitX.innerHTML = '（' + x.unit + '）';
        canvasWrap.append(unitX);
      }
    }

    const createGrid = () => {
      gridContainer = new createjs.Container();
      gridContainer.x = 0;
      gridContainer.y = 0;
      stage.addChild(gridContainer);
      if (gridStroke) {
        // グリッド（横線）
        for (let i = 0; i < gridAllCountY; i++) {
          let grid_tate = new createjs.Graphics();
          grid_tate.beginStroke(gridColor);
          grid_tate.setStrokeStyle(gridStroke);
          const y = gridOneHeight * i;
          grid_tate.moveTo(canvasLeft, y + canvasTop).lineTo(canvasX + canvasLeft, y + canvasTop).endStroke();
          const shape_grid_tate = new createjs.Shape(grid_tate);
          gridContainer.addChild(shape_grid_tate);
        }
        // グリッド（縦線）
        for (let i = 0; i <= gridAllCountX; i++) {
          let grid_yoko = new createjs.Graphics();
          grid_yoko.beginStroke(gridColor);
          grid_yoko.setStrokeStyle(gridStroke);
          const x = gridOneWidth * i + canvasLeft;
          grid_yoko.moveTo(x, 0).lineTo(x, jiku_height).endStroke();
          const shape_grid_yoko = new createjs.Shape(grid_yoko);
          gridContainer.addChild(shape_grid_yoko);
        }
      }

      // グリッドの太い線（横線）
      if (gridEmStroke) {
        let grid_em_kazu_tate = y.memoriCount * y.gridBoldCount;
        let grid_em_tate_one_haba = (jiku_height - canvasTop) / grid_em_kazu_tate;
        for (let i = 0; i <= grid_em_kazu_tate; i++) {
          let grid_em_tate = new createjs.Graphics();
          grid_em_tate.beginStroke(gridColor);
          grid_em_tate.setStrokeStyle(gridEmStroke);
          const y = grid_em_tate_one_haba * i;
          grid_em_tate.moveTo(0, y + canvasTop).lineTo(canvasX + canvasLeft, y + canvasTop).endStroke();
          const shape_grid_em_tate = new createjs.Shape(grid_em_tate);
          gridContainer.addChild(shape_grid_em_tate);
        }
        // グリッドの太い線（縦線）
        let grid_em_kazu_yoko = x.memoriCount * x.gridBoldCount;
        let grid_em_yoko_one_haba = (jiku_width - canvasRight) / grid_em_kazu_yoko;
        for (let i = 0; i <= grid_em_kazu_yoko; i++) {
          let grid_em_yoko = new createjs.Graphics();
          grid_em_yoko.beginStroke(gridColor);
          grid_em_yoko.setStrokeStyle(gridEmStroke);
          const x = grid_em_yoko_one_haba * i + canvasLeft;
          grid_em_yoko.moveTo(x, 0).lineTo(x, jiku_height + canvasBottom).endStroke();
          const shape_grid_em_yoko = new createjs.Shape(grid_em_yoko);
          gridContainer.addChild(shape_grid_em_yoko);
        }
      }
    }

    function createhoverContent() {
      for (let i = 0; i < graph.length; i++) {
        hoverContentDiv[i] = document.createElement("div")
        hoverContentDiv[i].setAttribute('class', 'ogcc-hoverContent');
        hoverContentDiv[i].setAttribute('data-ogccid', i);
        canvasWrap.appendChild(hoverContentDiv[i]);
      }
    }

    function hoverContent(event) {
      const x_pos = event.target.x;
      const y_pos = event.target.y;
      const j = this.payload[1];
      const i = this.payload[2];
      const hoverContentDivs = canvasWrap.querySelectorAll('.ogcc-hoverContent')
      const thisHoverContentDiv = [...hoverContentDivs].find(el => {
        return el.getAttribute('data-ogccid') == j
      });
      let textContent = this.payload[0] + y.unit;
      // カスタムテキストがある場合
      if (graph[j].hoverCustomText) {
        textContent = graph[j].hoverCustomText.replace(/\[y\]/g, this.payload[0]);
        if (!x.memoriList) {
          textContent = textContent.replace(/\[x\]/g, x.memoriInterval * i + graph[j].graphFirstMemori);
        } else {
          textContent = textContent.replace(/\[x\]/g, x.memoriList[i + graph[j].graphFirstMemori]);
        }
        textContent = textContent.replace(/\[unitY\]/g, y.unit);
        textContent = textContent.replace(/\[unitX\]/g, x.unit);
      }
      thisHoverContentDiv.innerHTML = textContent;
      thisHoverContentDiv.setAttribute('style', `left:${x_pos + canvasLeft + wrapPaddingLeft}px;top:${y_pos + wrapPaddingTop}px;`);
      thisHoverContentDiv.classList.add('is_show')
    }

    const hoverContent_remove = () => {
      const target = document.querySelector('.ogcc-hoverContent.is_show');
      target.classList.remove('is_show')
    }

    function createGraphTitle() {
      if (graphTitle) {
        graphTitleWrap = document.createElement('ul')
        graphTitleWrap.setAttribute('class', 'ogcc-graphTitle');
        canvasWrap.append(graphTitleWrap);
      }
    }

    // perY,perXがある場合は、新規ではなくzoomによるupdate
    const createGraph = (perY, perX) => {
      // graphListをディープコピーしてデータを取っておく（アニメーションに使用）
      let currentData = null;
      if (perX || perY) {
        currentData = JSON.parse(JSON.stringify(graphList));
      }
      // コンテナを作る
      graphContainer = new createjs.Container();
      graphContainer.x = canvasLeft;
      graphContainer.y = 0;
      stage.addChild(graphContainer);

      // グラフのオブジェクトを作る
      let graphOneContainer = []
      for (let j = 0; j < allGraphData.length; j++) {
        graphOneContainer[j] = new createjs.Container();

        graphList[j] = { point: [], line: [], curve: [] }

        drowLine(j)
        drowPoint(j)
        drowGraphTitle(j)
        graphContainer.addChild(graphOneContainer[j]);
      }
      createjs.Ticker.addEventListener("tick", stage);

      // 点
      function drowPoint(j) {
        let cicle = '';
        const thisAllGraphData = allGraphData[j];
        for (let i = 0; i < thisAllGraphData.length; i++) {
          if (thisAllGraphData[i] !== '') {
            const x_pos = i * memoriOneWidth - oneValWidth * x.memoriFirstNum + oneValWidth * graph[j].graphFirstMemori;
            const y_pos = jiku_height - (thisAllGraphData[i] - y.memoriFirstNum) * oneValHeight;
            //次のアニメーションのための記憶
            graphList[j].point[i] = { x: x_pos, y: y_pos };

            cicle = new createjs.Graphics();
            cicle.beginFill(graph[j].dotColor);
            if (graph[j].dotStyle === 'circle') {
              cicle.drawCircle(0, 0, graph[j].dotSize / 2);
            } else if (graph[j].dotStyle === 'rect') {
              cicle.drawRect(-(graph[j].dotSize / 2), -(graph[j].dotSize / 2), graph[j].dotSize, graph[j].dotSize);
            }
            const shape_circle = new createjs.Shape(cicle);
            shape_circle.x = x_pos;
            // アニメーション前の位置
            if (!currentData) {
              shape_circle.y = jiku_height / 2;
            } else {
              shape_circle.x = currentData[j].point[i].x;
              shape_circle.y = currentData[j].point[i].y;
            }
            graphOneContainer[j].addChild(shape_circle);
            // アニメーション
            if (drowAnimation) {
              createjs.Tween.get(shape_circle)
                .to({
                  x: x_pos,
                  y: y_pos
                }, 700, createjs.Ease.cubicOut)
            } else {
              shape_circle.x = x_pos;
              shape_circle.y = y_pos;
            }
            // マウスオーバーで吹き出し
            shape_circle.addEventListener("mouseover", { payload: [thisAllGraphData[i], j, i], handleEvent: hoverContent });
            shape_circle.addEventListener("mouseout", hoverContent_remove);
          }
        }
      }
      // 線
      function drowLine(j) {
        let line = new createjs.Graphics();
        line.beginStroke(graph[j].lineColor);
        line.setStrokeStyle(graph[j].lineStroke);
        const thisAllGraphData = allGraphData[j];
        let x_prev, y_prev;
        for (let i = 0; i < thisAllGraphData.length; i++) {
          const x_pos = i * memoriOneWidth - oneValWidth * x.memoriFirstNum + oneValWidth * graph[j].graphFirstMemori;
          const y_pos = jiku_height - (thisAllGraphData[i] - y.memoriFirstNum) * oneValHeight;
          const curveData = [x_prev + 50, y_prev, x_pos - 50, y_pos, x_pos, y_pos];

          //次のアニメーションのための記憶
          if (graph[j].lineType === 'line') {
            graphList[j].line[i] = { x: x_pos, y: y_pos };
          } else {
            graphList[j].curve[i] = curveData;
          }

          if (thisAllGraphData[i] !== '') {
            if (i === 0) {
              line.moveTo(x_pos, y_pos)
            }
            if (i === thisAllGraphData.length) {
              line.beginStroke('transparent').lineTo(x_pos, jiku_height).beginStroke('transparent').lineTo(0, jiku_height).beginStroke('transparent').closePath();
            } else {
              if (graph[j].lineType === 'line') {
                line.lineTo(x_pos, y_pos);
              } else if ('curve') {
                line.bezierCurveTo(...curveData);
              }
            }
          }
          const shape_line = new createjs.Shape(line);
          // アニメーション前の位置
          if (!currentData) {
            shape_line.scaleY = 0;
            shape_line.y = jiku_height / 2;
          } else {
            shape_line.scaleY = perY;
            shape_line.scaleX = perX;
          }
          graphOneContainer[j].addChild(shape_line);
          // アニメーション
          if (drowAnimation) {
            createjs.Tween.get(shape_line)
              .to({
                scaleY: 1,
                scaleX: 1,
                y: 0
              }, 700, createjs.Ease.cubicOut)
          } else {
            shape_line.scaleY = 1;
            shape_line.scaleX = 1;
            shape_line.y = 0;
          }
          x_prev = x_pos
          y_prev = y_pos
        }
      }
      function drowGraphTitle(j) {
        if (graphTitle && graph[j].graphName) {
          const graphName = graph[j].graphName;
          const li = document.createElement("li");
          li.setAttribute('class', 'ogcc-graphTitle_one');
          const span = '<span class="ogcc-graphTitle_one_cl" style="background-color:' + graph[j].lineColor + ';"></span><span class="ogcc-graphTitle_one_name">' + graphName + '</span>';
          li.insertAdjacentHTML('afterbegin', span);
          graphTitleWrap.append(li);
          li.addEventListener('click', function () {
            if (graphOneContainer[j].visible) {
              graphOneContainer[j].visible = false;
              li.classList.add('is_hide')
            } else {
              graphOneContainer[j].visible = true;
              li.classList.remove('is_hide')
            }
          })
        }
      }
    }

    const createDirection = () => {
      if (graphDirection) {
        directionWrap = document.createElement('div');
        directionWrap.setAttribute('class', 'ogcc-direction');
        // ボタンhtml生成
        const topBtn = document.createElement('span');
        topBtn.setAttribute('class', 'ogcc-direction_part is_top');
        const rightBtn = document.createElement('span');
        rightBtn.setAttribute('class', 'ogcc-direction_part is_right');
        const bottomBtn = document.createElement('span');
        bottomBtn.setAttribute('class', 'ogcc-direction_part is_bottom');
        const leftBtn = document.createElement('span');
        leftBtn.setAttribute('class', 'ogcc-direction_part is_left');
        directionWrap.insertAdjacentElement('afterbegin', topBtn);
        directionWrap.insertAdjacentElement('afterbegin', rightBtn);
        directionWrap.insertAdjacentElement('afterbegin', bottomBtn);
        directionWrap.insertAdjacentElement('afterbegin', leftBtn);
        // クリックイベント追加
        let ret = true;
        function graphUpdateDirection(dir, movePx) {
          if (ret != null) {
            ret = null;
            memoriY.remove();
            memoriX.remove();
            unitY ? unitY.remove() : '';
            unitX ? unitX.remove() : '';
            const graphCount = graphContainer.children.length;
            for (let i = 0; i < graphCount; i++) {
              graphContainer.children[i].children.forEach(el => {
                const y_pos = el.y;
                const x_pos = el.x;
                if (dir === 'top' || dir === 'bottom') {
                  createjs.Tween.get(el, { override: false })
                    .to({
                      y: y_pos + movePx
                    }, 500, createjs.Ease.cubicOut)
                    .call(function () { ret = movePx });
                } else {
                  createjs.Tween.get(el, { override: false })
                    .to({
                      x: x_pos + movePx
                    }, 500, createjs.Ease.cubicOut)
                    .call(function () { ret = movePx });
                }
              })
            }
            if (dir === 'top') {
              y.memoriFirstNum = y.memoriFirstNum + y.memoriInterval;
            } else if (dir === 'right') {
              x.memoriFirstNum = x.memoriFirstNum + x.memoriInterval;
            } else if (dir === 'bottom') {
              y.memoriFirstNum = y.memoriFirstNum - y.memoriInterval;
            } else if (dir === 'left') {
              x.memoriFirstNum = x.memoriFirstNum - x.memoriInterval;
            }
            createMemori();
          }
        }
        topBtn.addEventListener('click', function () {
          graphUpdateDirection('top', memoriOneHeight,);
        })
        rightBtn.addEventListener('click', function () {
          graphUpdateDirection('right', -memoriOneWidth);
        })
        bottomBtn.addEventListener('click', function () {
          graphUpdateDirection('bottom', -memoriOneHeight);
        })
        leftBtn.addEventListener('click', function () {
          graphUpdateDirection('left', memoriOneWidth);
        })
        canvasWrap.append(directionWrap);
      }
    }

    const createScaleBtn = () => {
      const plusSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a4a4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
      const minusSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a4a4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
      const scaleBtnAll = () => {
        scaleBtnContainer = document.createElement('div');
        scaleBtnContainer.setAttribute('class', 'ogcc-zoomAll');
        plusAll = document.createElement('div');
        plusAll.setAttribute('class', 'ogcc-zoomAll_btn is_in');
        plusAll.insertAdjacentHTML('afterbegin', plusSvg)
        scaleBtnContainer.append(plusAll);
        minusAll = document.createElement('div');
        minusAll.setAttribute('class', 'ogcc-zoomAll_btn is_out');
        minusAll.insertAdjacentHTML('afterbegin', minusSvg);
        scaleBtnContainer.append(minusAll);
        canvasWrap.append(scaleBtnContainer);
      }
      const scaleBtnY = () => {
        scaleBtnYContainer = document.createElement('div');
        scaleBtnYContainer.setAttribute('class', 'ogcc-zoomY');
        plusY = document.createElement('div');
        plusY.setAttribute('class', 'ogcc-zoomY_btn is_in');
        plusY.insertAdjacentHTML('afterbegin', plusSvg)
        scaleBtnYContainer.append(plusY);
        minusY = document.createElement('div');
        minusY.setAttribute('class', 'ogcc-zoomY_btn is_out');
        minusY.insertAdjacentHTML('afterbegin', minusSvg);
        scaleBtnYContainer.append(minusY);
        canvasWrap.append(scaleBtnYContainer);
      }
      const scaleBtnX = () => {
        scaleBtnXContainer = document.createElement('div');
        scaleBtnXContainer.setAttribute('class', 'ogcc-zoomX');
        plusX = document.createElement('div');
        plusX.setAttribute('class', 'ogcc-zoomX_btn is_in');
        plusX.insertAdjacentHTML('afterbegin', plusSvg)
        scaleBtnXContainer.append(plusX);
        minusX = document.createElement('div');
        minusX.setAttribute('class', 'ogcc-zoomX_btn is_out');
        minusX.insertAdjacentHTML('afterbegin', minusSvg);
        scaleBtnXContainer.append(minusX);
        canvasWrap.append(scaleBtnXContainer);
      }

      if (zoom) {
        if (zoom === true) {
          scaleBtnAll()
          scaleBtnY()
          scaleBtnX()
          plusAll.addEventListener('click', zoominAll)
          minusAll.addEventListener('click', zoomoutAll)
          plusY.addEventListener('click', zoominY)
          minusY.addEventListener('click', zoomoutY)
          plusX.addEventListener('click', zoominX)
          minusX.addEventListener('click', zoomoutX)
        } else if (zoom === 'xy') {
          scaleBtnAll()
          plusAll.addEventListener('click', zoominAll)
          minusAll.addEventListener('click', zoomoutAll)
        } else if (zoom === 'x') {
          scaleBtnX()
          plusX.addEventListener('click', zoominX)
          minusX.addEventListener('click', zoomoutX)
        } else if (zoom === 'y') {
          scaleBtnY()
          plusY.addEventListener('click', zoominY)
          minusY.addEventListener('click', zoomoutY)
        }
      }
      function zoomoutAll() {
        y.memoriCount += 1;
        x.memoriCount += 1;
        const perY = y.memoriCount / (y.memoriCount + 1);
        const perX = x.memoriCount / (x.memoriCount - 1);
        graphUpdateZoom(perY, perX)
      }
      function zoominAll() {
        if (y.memoriCount > 1 && x.memoriCount > 1) {
          y.memoriCount -= 1;
          x.memoriCount -= 1;
          const perY = y.memoriCount / (y.memoriCount - 1);
          const perX = x.memoriCount / (x.memoriCount + 1);
          graphUpdateZoom(perY, perX)
        }
      }
      function zoomoutY() {
        y.memoriCount += 1;
        const perY = y.memoriCount / (y.memoriCount + 1);
        graphUpdateZoom(perY, 1)
      }
      function zoominY() {
        if (y.memoriCount > 1) {
          y.memoriCount -= 1;
          const perY = ((y.memoriCount + 1) / y.memoriCount);
          graphUpdateZoom(perY, 1)
        }
      }
      function zoomoutX() {
        x.memoriCount += 1;
        const perX = x.memoriCount / (x.memoriCount - 1);
        graphUpdateZoom(1, perX)
      }
      function zoominX() {
        if (x.memoriCount > 1) {
          x.memoriCount -= 1;
          const perX = x.memoriCount / (x.memoriCount + 1);
          graphUpdateZoom(1, perX)
        }
      }
      // per =>　lineの拡大縮小割合
      function graphUpdateZoom(perY, perX) {
        init();
        stage.removeChild(graphContainer);
        stage.removeChild(gridContainer);
        memoriY.remove();
        memoriX.remove();
        unitY ? unitY.remove() : '';
        unitX ? unitX.remove() : '';
        graphTitleWrap ? graphTitleWrap.remove() : '';
        createGraphTitle();
        createGrid();
        createMemori();
        createGraph(perY, perX)
      }
    }


    // 下のレイヤーから順番に実行
    createGrid();
    createJiku();
    createMemori();
    createGraphTitle()
    createGraph();
    createDirection();
    createScaleBtn();
    createhoverContent();


    // 描画内容を2倍にする。リティーナ対応
    stage.scale = 2;

  }

  // リサイズした時にグラフを読み直す。nonUpdateはロード時用
  function responsive(nonUpdate){
    let timeoutId;
    const canvasWrapWidth = parseInt(getComputedStyle(canvasWrap, null).getPropertyValue('width').replace('px', ''));
    if (!nonUpdate){
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        responsiveUpdate()
      }, 100);
    }else{
      // ロード時はsetTimeoutなしですぐ実行
      responsiveUpdate()
    }
    function responsiveUpdate(){
      canvasX = canvasWrapWidth - wrapPaddingLeft - wrapPaddingRight
      if (responsiveType === 'aspect') {
        canvasY = canvasX / aspect;
      }
      if (!nonUpdate) {
        graphUpdate()
      }
    }
  }
  window.addEventListener('resize', function () {
    responsive()
  });

  return {
    stage,
    canvasWrap
  }

}

export default oresenGraphCC;