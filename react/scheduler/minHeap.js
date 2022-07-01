//返回最小堆堆顶
export function peek(heap) {
    return heap.length === 0 ? null : heap[0]
}

//往最小堆中插入元素
// 1.把node插入数组尾部
// 2.往上调整最小堆
export function push(heap, node) {
    let index = heap.length
    heap.push(node)
    siftUp(heap,node,index)
}

function siftUp(heap,node,i) {
    let index = i;
    while(index>0){
        const parentIndex = (index-1)>>1
        const parent = heap[parentIndex]

        if(compare(parent,node) > 0){
            heap[parentIndex] = node
            heap[index] = parent
            index = parentIndex
        } else {
            // 这个好像不对
            return;
        }
    }
}

//删除堆顶元素
export function pop(heap) {
    if(heap.length ===0){
        return null;
    }

    const first = heap[0]
    const last = heap.pop()
    if(first !== last){
        heap[0] = last
        siftDown(heap,last,0)
    }

    return first
}

function siftDown(heap,node, i){
    let index = i
    const len = heap.length
    const halfLen = len>>1
    while(index < halfLen){
        let findIndex = index
        const leftIndex = index * 2 + 1
        const rightIndex = index * 2 + 2
        if (compare(heap[leftIndex], heap[findIndex]) < 0) {
            findIndex = leftIndex;
        }
        if (compare(heap[rightIndex], heap[findIndex]) < 0) {
            findIndex = rightIndex;
        }
        if (index !== findIndex) {
            const item = heap[index]
            heap[index] = heap[findIndex]
            heap[findIndex] = item
            index = findIndex;
        } else {
            break;
        }
    }
}

function compare(a,b){
    // return a-b
    const diff = a.sortIndex - b.sortIndex
    return diff !==0 ? diff : a.id-b.id
}

// const a = [3, 7, 4, 10, 12, 9, 6, 100];

// push(a, 8);

// while (1) {
//   if (a.length === 0) {
//     break;
//   }
//   console.log("a", peek(a)); //sy-log
//   pop(a);
// }