// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: bullhorn;

// Author: 叮噹鬧 github.com/dingdangnao //

const widgetSize = config.widgetFamily
const iconUrl = "https://raw.githubusercontent.com/dingdangnao/Scriptable/main/icon/hotweibo.png"
const urlscheme = "https://m.weibo.cn/search?"

// 自定义显示多少条数据。在不同平台上小组件尺寸不一致
let dataCount = {
    small:8,
    medium:8,
    large:8,
}
if (Device.model() === "iPhone") {
    dataCount.large = 22
}else if (Device.model() === "iPad") {
    dataCount.large = 20
} else {
    dataCount.large = 20
}
console.log(widgetSize)
async function render() {
    if (widgetSize === 'medium') {
        return await renderMedium(dataCount.medium)
    } else if (widgetSize === 'large') {
        return await renderMedium(dataCount.large)
    } else {
        return await renderSmall(dataCount.small)
    }
}
let widget = await render();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
    const sw = await renderSmall(dataCount.small)
    sw.presentSmall();
    const mw = await renderMedium(dataCount.medium)
    mw.presentMedium();
    const lw = await renderMedium(dataCount.large)
    lw.presentLarge();
}
await Script.complete();
/**
 * 渲染小尺寸组件
 */
async function renderSmall(count) {
    const bgColor = Color.dynamic(new Color('#FAFAFA'), new Color('#1a1a1a'));
    let res = await getData('https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot')
    let data = res['data']['cards'][0]['card_group']
    let updateTime = res['data']['cardlistInfo']['starttime']
    //console.log(data)
    // 去除第一条
    data.shift()
    // 显示数据
    let w = new ListWidget()
    w.backgroundColor = bgColor;
    w.setPadding(16, 8, 16, 8)

    const _updateTime = '更新于' + time(updateTime)
    w = await renderHeader(w, iconUrl, "微博热搜", _updateTime, null)

    // 布局：一行一个，左边顺序排序，中间标题，后边热/新
    for (let i = 0; i < count; i++) {
        let topic = data[i];
        if (!topic['promotion']) {
            let dom = w.addStack()
            dom.centerAlignContent()
            let pic = dom.addImage(await getImage(topic['pic']))
            pic.imageSize = new Size(12, 12)
            dom.addSpacer(3)
            let title = dom.addText(topic['desc'])
            title.font = Font.systemFont(8)
            dom.addSpacer()
            //dom.url = "vvebo://search?q=" + encodeURI(topic["desc"])
            w.addSpacer(2)
        } else {
            count += 1
        }
    }
    w.url = urlscheme
    return w
}
/**
 * 渲染中尺寸组件
 */
async function renderMedium(count) {
    const bgColor = Color.dynamic(new Color('#FAFAFA'), new Color('#1A1A1A'));
    let res = await getData('https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot')
    //console.log(res)
    let data = res['data']['cards'][0]['card_group']
    let updateTime = res['data']['cardlistInfo']['starttime']
    // 去除第一条
    data.shift()
    // 显示数据
    let w = new ListWidget()
    w.backgroundColor = bgColor;
    w.setPadding(32, 16, 32, 16)
    const _updateTime = '更新于' + time(updateTime)
    w = await renderHeader(w, iconUrl, "微博热搜", _updateTime)

    // 布局：一行一个，左边顺序排序，中间标题，后边热/新
    for (let i = 0; i < count; i++) {
        let topic = data[i];
        if (!topic['promotion']) {
            let dom = w.addStack()
            dom.centerAlignContent()
            let pic = dom.addImage(await getImage(topic['pic']))
            pic.imageSize = new Size(14, 14)
            dom.addSpacer(5)
            let title = dom.addText(topic['desc'])
            title.lineLimit = 1
            title.font = Font.systemFont(9)
            dom.addSpacer(5)
            let extr = dom.addText(topic['desc_extr'] ? bigNumberTransform(topic['desc_extr'].toString()) : '')
            extr.font = Font.lightSystemFont(8)
            extr.textOpacity = 0.7
            dom.addSpacer()
            if (topic['icon']) {
                let iconDom = dom.addStack()
                let icon = iconDom.addImage(await getImage(topic['icon']))
                icon.imageSize = new Size(14, 14)
            }
            if (Device.model() === "iPhone") {
                dom.url = topic['scheme']
                console.log("当前平台是 iOS");
            } else if (Device.model() === "iPad") {
                const url = "https://s.weibo.com/weibo?q=%23" + encodeURIComponent(topic['desc']) + "%23"
                dom.url = url
            } else {
                dom.url = topic['scheme']
                console.log("当前平台是 其他");
            }

            w.addSpacer(1)
        } else {
            count += 1
        }
    }

    return w
}
/**
 * 渲染大尺寸组件
 */
async function renderLarge(count) {
    return await renderMedium(count)
}

/**
 * 渲染标题
 * @param widget 组件对象
 * @param icon 图标url地址
 * @param title 标题
 * @param altText 更新时间
 * @param altIcon 右侧icon
 */

async function renderHeader(widget, icon, title, altText, altIcon) {
    let header = widget.addStack()
    header.bottomAlignContent()
    header.addSpacer(2)
    let _icon = header.addImage(await getImage(icon))
    _icon.imageSize = new Size(16, 16)
    _icon.cornerRadius = 4
    header.addSpacer(8)

    let _title = header.addText(title)
    _title.textOpacity = 1
    _title.font = Font.boldSystemFont(10)

    if (altText) {
        header.addSpacer(10)
        let _altText = header.addText(altText)
        _altText.font = Font.systemFont(8)
        _altText.textOpacity = 0.8
    }

    if (altIcon) {
        header.addSpacer()
        let _altIcon = header.addImage(await getImage(altIcon))
        _altIcon.imageSize = new Size(16, 16)
        _altIcon.cornerRadius = 4
    }

    header.url = urlscheme
    widget.addSpacer()
    return widget
}

/**
 * 获取api数据
 * @param api api地址
 */
async function getData(api) {
    let req = new Request(api)
    return await req.loadJSON()
}

/**
 * 加载远程图片
 * @param url string 图片地址
 * @return image
 */
async function getImage(url) {
    let req = new Request(url)
    return await req.loadImage()
}

function time(timestamp) {
    var date = new Date(timestamp * 1000);
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '日';
    var h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + '时';
    var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + "分";
    return h + m;
}
function formatBigNumber(value){
    const newValue = ['', '', '']
    let fr = 1000
    let num = 3
    let text1 = ''
    let fm = 1
    while (value / fr >= 1) {
        fr *= 10
        num += 1
        //       console.log('数字', value / fr, 'num:', num)
    }
    if (num <= 4) { // 千
        newValue[0] = parseInt(value / 1000) + ''
        newValue[1] = '千'
    } else if (num <= 8) { // 万
        text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万'
        // tslint:disable-next-line:no-shadowed-variable
        fm = text1 === '万' ? 10000 : 10000000
        if (value % fm === 0) {
            newValue[0] = parseInt(value / fm) + ''
        } else {
            newValue[0] = parseFloat(value / fm).toFixed(2) + ''
        }
        newValue[1] = text1
    } else if (num <= 16) { // 亿
        text1 = (num - 8) / 3 > 1 ? '千亿' : '亿'
        text1 = (num - 8) / 4 > 1 ? '万亿' : text1
        text1 = (num - 8) / 7 > 1 ? '千万亿' : text1
        // tslint:disable-next-line:no-shadowed-variable
        fm = 1
        if (text1 === '亿') {
            fm = 100000000
        } else if (text1 === '千亿') {
            fm = 100000000000
        } else if (text1 === '万亿') {
            fm = 1000000000000
        } else if (text1 === '千万亿') {
            fm = 1000000000000000
        }
        if (value % fm === 0) {
            newValue[0] = parseInt(value / fm) + ''
        } else {
            newValue[0] = parseFloat(value / fm).toFixed(2) + ''
        }
        newValue[1] = text1
    }
    if (value < 1000) {
        newValue[0] = value + ''
        newValue[1] = ''
    }
    return newValue.join('')
}
function bigNumberTransform(value) {
    if (value&&parseInt(value)>0) {
        return formatBigNumber(value)
    }else if (value.split(' ').length>1) {
        return value.split(' ')[0]+' '+formatBigNumber(value.split(' ')[1])
    }else{
        return value
    }
}