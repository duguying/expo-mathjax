# expo-mathjax

React Native 的 MathJax 数学渲染库 — **无需原生构建，无需 WebView，可在 Expo Go 中运行**。

通过 [MathJax](https://www.mathjax.org/) 在 JS 线程上将 TeX 和 MathML 转换为 SVG，然后使用 [`react-native-svg`](https://github.com/software-mansion/react-native-svg) 进行渲染。

## 特性

- 支持 TeX 和 MathML 输入
- 显示模式和内联模式
- 通过单一的 `color` 属性设置颜色主题
- LRU 缓存（128 条目）实现快速重新渲染
- 零原生代码 — **Expo Go** 无需 `expo prebuild`

## 架构

```
TeX / MathML
    │
    ▼  mathjax-full (liteAdaptor, JS 线程 — 无需 DOM)
  SVG 字符串
    │
    ▼  react-native-svg (SvgXml)
  渲染视图
```

## 安装

```bash
npm install expo-mathjax mathjax-full react-native-svg
```

对于托管的 Expo 项目：

```bash
npx expo install expo-mathjax react-native-svg
```

## 使用方法

### `<MathView>` 组件

```tsx
import { MathView } from 'expo-mathjax';

// TeX 显示模式
<MathView tex="\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />

// TeX 内联模式，自定义颜色
<MathView tex="E = mc^2" display={false} color="#e74c3c" fontSize={18} />

// MathML
<MathView mathml="<math><mi>x</mi><mo>+</mo><mn>1</mn></math>" />
```

### 属性

| 属性              | 类型         | 默认值       | 描述                        |
|-------------------|--------------|-------------|-----------------------------|
| `tex`             | `string`     | —           | LaTeX/TeX 输入               |
| `mathml`          | `string`     | —           | MathML 输入                  |
| `display`         | `boolean`   | `true`      | 显示（块级）vs 内联模式       |
| `color`           | `string`     | `"#000000"` | 公式颜色（CSS 颜色字符串）    |
| `backgroundColor` | `string`    | —           | 容器背景色                   |
| `fontSize`        | `number`     | `16`        | 基础字号（dp）               |
| `style`           | `ViewStyle` | —           | 容器 View 的额外样式         |
| `onLayout`        | `function`   | —           | View 的 `onLayout` 回调     |

### 底层 API

```ts
import { texToSvg, mathmlToSvg, clearCache, configure, ALL_PACKAGES } from 'expo-mathjax';

// 在首次渲染前配置 TeX 包（可选）
configure({ packages: ALL_PACKAGES });

// 直接转换为 SVG
const { svgString, exWidth, exHeight } = texToSvg('x^2 + y^2 = r^2', { display: true });

// 清除 LRU 缓存
clearCache();
```

### TeX 包

默认加载 `COMMON_PACKAGES`（base, ams, newcommand 等）。如需启用更多包：

```ts
import { configure, COMMON_PACKAGES } from 'expo-mathjax';

configure({ packages: [...COMMON_PACKAGES, 'mhchem', 'physics'] });
```

在应用启动时、首次渲染之前调用一次 `configure()`。

## 依赖

| 包                 | 版本         |
|--------------------|--------------|
| `react`            | `*`          |
| `react-native`     | `*`          |
| `react-native-svg` | `>=13.0.0`  |

## 许可证

MIT