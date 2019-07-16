const DEFAULT_CONFIG = {
    text: 'text',
    x: 20,
    y: 20,
    rows: 0,
    cols: 0,
    xSpace: 100,
    ySpace: 50,
    color: '#aaa',
    alpha: 0.4,
    fontsize: '15px',
    font: '微软雅黑',
    width: 210,
    height: 80,
    angle: 15
}

function throttle (fn, time = 200) {
    let timer = null;
    return function () {
        if (timer) return;
        timer = setTimeout(() => {
            fn.apply(null, arguments);
            timer = null;
        }, time);
    }
}

function between (val, min, max) {
    return (val >= min) && (val <= max);
}

class watermark {
    
    constructor (options) {
        this.options = Object.assign({}, DEFAULT_CONFIG, options);

        this.mark = document.createElement('div');
        this.updateMarkStyle();
        this.generateMark();
        this.resizeEvent();
    }

    updateMarkStyle () {
        this.mark.style.overflow = 'hidden';
        this.mark.style.position = 'absolute';
        this.mark.style.top = 0;
        this.mark.style.left = 0;
    }

    updateMarkRect () {
        this.mark.style.width = `${this.pageWidth}px`;
        this.mark.style.height = `${this.pageHeight}px`;
    }

    resizeEvent () {
        window.onresize = throttle(() => {
            this.generateMark();
        });
    }

    get pageWidth () {
        return Math.max(document.body.scrollWidth, document.body.clientWidth);
    }

    get pageHeight () {
        return Math.max(document.body.scrollHeight, document.body.clientHeight);
    }

    // 列数为0或设置过大超过最大宽度，则重新计算水印列数和x轴间距
    computeCol () {
        let {cols, x, width, xSpace} = this.options;
        let newCols;

        let markWidth = width * cols + xSpace * (cols - 1);
        let remainWidth = this.pageWidth - x - markWidth;

        if (cols && between(remainWidth, 0, width + xSpace)) {
            return;
        }

        newCols = parseInt((this.pageWidth - x + xSpace) / (width + xSpace)) + 1;
        

        this.options.cols = newCols;
    }

    // 行数为0或设置过大超过最大高度，则重新计算水印行数和y轴间距
    computeRow () {
        let {rows, y, height, ySpace} = this.options;
        let newRows;

        let markHeight = y * 2 + height * rows + ySpace * (rows - 1);
        let remainHeight = this.pageHeight - markHeight;

        if (rows && between(remainHeight, 0, height + ySpace)) {
            return;
        }

        newRows = parseInt((this.pageHeight - (y * 2) + ySpace) / (height + ySpace));

        this.options.rows = newRows;
    }

    generateMark () {
        this.updateMarkRect();
        this.computeCol();
        this.computeRow();

        let markFragment = document.createDocumentFragment();
        let {cols, rows, y, ySpace, height, x, width, xSpace, text} = this.options;
        let cx, cy;

        Array.apply(null, Array(rows)).forEach((r, i) => {
            cy = y + (ySpace + height) * i;

            Array.apply(null, Array(cols)).forEach((c, j) => {
                cx = x + (width + xSpace) * j;

                let maskDiv = document.createElement('div');
                maskDiv.id = `mask-div${i}${j}`;
                maskDiv.className = 'mask-div';
                maskDiv.appendChild(document.createTextNode(text));

                let config = this.generateCSSConfig(cx, cy);
                for (let key in config) {
                    if (config.hasOwnProperty(key)) {
                        maskDiv.style[key] = config[key];
                    }
                }
                markFragment.appendChild(maskDiv);
            });
        });

        this.mark.innerHTML = '';
        this.mark.appendChild(markFragment);
        document.body.appendChild(this.mark);
    }

    generateCSSConfig (x, y) {
        let {angle, alpha, fontsize, font, color, width, height} = this.options;
        let pre = ['webkit', 'Moz', 'ms', 'O', ''];

        return {
            ...pre.reduce((o, k) => {
                o[`${k + (k ? 'T': 't')}ransform`] = `rotate(-${angle}deg)`;
                return o;
            }, {}),
            visibility: '',
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            overflow: 'hidden',
            zIndex: '99999',
            pointerEvents: 'none',
            opacity: alpha,
            fontSize: fontsize,
            fontFamily: font,
            color: color,
            textAligin: 'center',
            width: `${width}px`,
            height: `${height}px`,
            display: 'block'
        };
    }

}

export default function (options) {
    return new watermark(options);
};