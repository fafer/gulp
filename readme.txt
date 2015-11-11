css总结
1、表单元素不会继承body里设置的font属性
2、盒子左右margin所占空间的是相加
3、盒子上下margin所占空间是重叠的，如-5+10得到的上下间距是5，10+10得到的上下间距是10,20+10得到的上下间距是20。
4、盒子负margin不占用空间，相当于在原位置向上或向左移动位置。
5、先按照原有的html解析，当定位为relative时，再做偏移，而原位置保留并占用空间，偏移后的元素不影响容器大小。
6、先按照原有的html解析，当定位为absolute时，再做偏移(相对上一级非static定位的父级元素)，而原位置不占用空间
7、text-algin只对行级元素起作用，只能左右对其
8、block块级元素width为auto时，min-width设置不生效，min-height设置生效
9、用layout改变盒子模型实现上下居中，该盒子的设置的text-algin、line-height无效，但会影响盒子中的子元素
10、iphone里，无法给body绑定click事件，解决办法就是给body里加一个顶级div，给div上加click；或者给body设置一个"cursor:pointer"样式

reactjs总结
React、ReactDom、ReactDom.render()、React.createClass()、React.createElement()、React.createFactory