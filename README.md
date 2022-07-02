# hook

## useState 和 useReduce
hook存储在fiber中，以链表形式存在

数据结构类似于：
`

hook = {

​	memorizedState , 

​	next  //指向下一个hook

}

初次渲染 把hook的初始值存入fiber中，返回hook.memorizedState 和 dispatch函数

之后渲染 把存入fiber的hook取出返回，

dispatch函数需要利用闭包的特性 使当前上下文环境的fiber节点始终是当前调用hook时的fiber节点

## useEffect


# diff

## conciler
react的diff一共有四个步骤

（1）复用之前的fiber节点，直到sameNode为false

例：

old  0 1 2 3 5

new  0 2 3 4

当新的vode遍历到2时，该vnode节点与老的fiber节点的key不同时，跳出循环

（2） 当新的vode节点遍历完，还有oldFiber时，把oldFiber删除

例：

old  0 1 2 3 4

new  0 1 2

（3） 当oldFiber为null，但是vnode还没有遍历完的情况下，遍历，生成newFibr，状态为Placement

例：

old  0 1 

new  0 1 2


（4）当老节点和新节点都还有时，需要把还剩于的老节点

以 key ｜ index : fiber 的形式存到map里。

遍历新节点，从map中找出于新节点的key或者index相同的老节点复用，找出后从map中删除

生成newFiber

遍历map把map里还剩余的fiber删除

例：

old  3 2 1

new  1 2 3

lastPlacedIndex作用：

当新节点为1时 从map找到oldFiber复用 并把oldFiber的index=3复制给lastPlacedIndex， 生成newFiber


当新节点为2时 从map找到oldFiber复用 

比较oldFiber的index=2与lastPlacedIndex=3

2<3

表示该fiber是要移动的

把fiber的flags 赋值为6

当新节点为3时 从map找到oldFiber复用

比较oldFiber的index=1与lastPlacedIndex=3

1<3

表示该fiber是要移动的

把fiber的flags 赋值为6

## commit阶段
当fiber的flags为6时，需要找到最近的一个flags是Update的兄弟元素，把当前节点的stateNode插入到该兄弟元素之前