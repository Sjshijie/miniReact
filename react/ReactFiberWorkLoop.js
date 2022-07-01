import { updateHostComponent, updateFunctionComponent, updateClassComponent, updateFragmentComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { HostComponent, FunctionComponent, ClassComponent, Fragment, HostText } from "./ReactWorkTag";
import { Placement, Update, updateNode } from "./utils";
import scheduleCallback from './scheduler/index'
let wip = null // work in progress
let wipRoot = null
export function scheduleUpdateOnFiber(fiber) {
    wip = fiber;
    wipRoot = fiber
    scheduleCallback(workLoop)
}

function performUnitOfWork() {
    const { tag } = wip;
    switch (tag) {
        case HostComponent:
            updateHostComponent(wip);
            break;
        case FunctionComponent:
            updateFunctionComponent(wip);
            break;
        case ClassComponent:
            updateClassComponent(wip);
            break;
        case Fragment:
            updateFragmentComponent(wip);
            break;
        case HostText:
            updateHostTextComponent(wip);
            break;
        default:
            break;
    }

    if(wip.child) {
        wip = wip.child;
        return;
    }

    let next = wip

    while (next) {
        if(next.sibling) {
            wip = next.sibling;
            return;
        }
        next = next.return;

    }

    wip = null;

    
}

function workLoop(IdleDeadline) {
    while(wip){
        performUnitOfWork()
    }

    console.log(wip)

    if(!wip && wipRoot) {
        commitRoot()
    }
}

function commitRoot() {
    console.log(wipRoot)
    commitWorker(wipRoot)
    wipRoot = null
}

function commitWorker(wip) {
    if(!wip){
        return
    }
    const parentNode = getParentNode(wip.return)
    const { flags, stateNode } = wip;
    if(flags & Placement && stateNode) {
        const before = getHostSibling(wip.sibling)
        insertOrAppendPlacementNode(stateNode,before,parentNode)
        // parentNode.appendChild(stateNode)
    }

    if(flags & Update && stateNode) {
        // console.log(123)
        updateNode(stateNode,wip.alternate.props,wip.props)
    }

    if(wip.deletions) {
        commitDeletions(wip.deletions, stateNode || parentNode)
    }


    if(wip.tag === FunctionComponent) {
        invokeHooks(wip)
    }

    commitWorker(wip.child)
    commitWorker(wip.sibling)
}

function invokeHooks(wip){
    const { updateQueueOfEffect, updateQueueOfLayout } = wip

    for(let i = 0; i < updateQueueOfLayout.length; i++) {
        const effect = updateQueueOfLayout[i]
        effect.create()
    }

    for(let i = 0; i < updateQueueOfEffect.length; i++) {
        const effect = updateQueueOfEffect[i]
        // effect.create()

        scheduleCallback(() => {
            effect.create()
        })
    }
}

function getHostSibling(sibling) {
    console.log(sibling)
    while(sibling){
        if(sibling.stateNode && !(sibling.flags & Placement)) {
            return sibling.stateNode
        }

        sibling = sibling.sibling
    }

    return null;
}

function insertOrAppendPlacementNode(stateNode,before,parentNode){
    if(before){
        parentNode.insertBefore(stateNode, before)
    }else {
        parentNode.appendChild(stateNode)
    }
}

function getParentNode(wip) {
    let tem = wip;
    while(tem) {
        if(tem.stateNode){
            return tem.stateNode
        }
        tem = tem.return
    }
    
}

function commitDeletions(deleteions, parentNode){
    for(let i = 0;i<deleteions.length;i++){
        parentNode.removeChild(getStateNode(deleteions[i]));
    }
}

function getStateNode(fiber){
    let tem = fiber;

    while(!tem.stateNode) {
        tem = tem.child
    }

    return tem.stateNode
}

// requestIdleCallback(workLoop)