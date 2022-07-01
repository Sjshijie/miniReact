import { pop, push, peek } from "./minHeap";

let taskQueue = [];
let taskIdCounter = 1;

export default function scheduleCallback(callback){
    const currentTime = getCurrentTime()
    const timeout = -1

    const expirationTime = currentTime - timeout

    const newTask = {
        id: taskIdCounter++,
        callback,
        expirationTime,
        sortIndex:expirationTime
    }

    push(taskQueue, newTask)

    requestHostCallback()

}

function requestHostCallback() {
    port.postMessage(null)
}

const channel = new MessageChannel();
const port = channel.port2
channel.port1.onmessage = function() {
    workLoop();
}

function workLoop() {
    let currentTask = peek(taskQueue)
    while(currentTask) {
        const callback = currentTask.callback

        currentTask.callback = null
        callback()
        pop(taskQueue)

        currentTask = peek(taskQueue)
    }
}

export function getCurrentTime() {
    return performance.now()
}
