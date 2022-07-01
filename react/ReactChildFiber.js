import createFiber from "./ReactFiber";
import { isArray, isStringOrNumber, Placement, Update, updateNode } from "./utils"

function deleteChild(returnFiber, childToDelete){
    const deletions = returnFiber.deletions 
    
    if(deletions){
        returnFiber.deletions.push(childToDelete)
    } else{
        returnFiber.deletions = [childToDelete]
    }
}

function deleteRemainingChildren(returnFiber,currentFirstChild){
    let childToDelete = currentFirstChild
    while(childToDelete) {
        deleteChild(returnFiber, childToDelete)
        childToDelete = childToDelete.sibling
    }
}

function mapRemainingChildren(currentFirstChild) {
    const existingChildren = new Map();
    let existingChild = currentFirstChild

    while(existingChild){
        existingChildren.set(existingChild.key || existingChild.index, existingChild)
        existingChild = existingChild.sibling
    }

    return existingChildren;


}

function placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects) {
    newFiber.index = newIndex
    if(!shouldTrackSideEffects) {
        return lastPlacedIndex
    }

    const current = newFiber.alternate
    if(current) {
        const oldIndex = current.index
        if(oldIndex < lastPlacedIndex) {
            console.log(123)
            newFiber.flags |= Placement
            return lastPlacedIndex
        } else {
            return oldIndex
        }
    } else {
        newFiber.flags |= Placement
        return lastPlacedIndex
    }
}

export function reconcileChildren(wip, children) {
    // console.log(wip)
    if(isStringOrNumber(children)) {
        return;
    }

    const newChildren = isArray(children) ? children : [children]
    let oldFiber = wip.alternate?.child;
    let nextOldFiber = null;
    let previousNewFiber = null;
    let shouldTrackSideEffects = !!wip.alternate
    let newIndex = 0;
    let lastPlacedIndex = 0;

    for (; oldFiber && newIndex<newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex]
        if(newChild === null){
            continue
        }

        // console.log(oldFiber.index, newIndex)
        if(oldFiber.index > newIndex){
            // ？ 什么情苦啊下会进入
            nextOldFiber = oldFiber
            oldFiber = null
        } else {
            nextOldFiber = oldFiber.sibling
        }

        const same = sameNode(newChild, oldFiber)
        if(!same){
            if(oldFiber == null) {
                oldFiber = nextOldFiber
            }
            break;
        }
        const newFiber = createFiber(newChild, wip);
        Object.assign(newFiber,{
            stateNode:oldFiber.stateNode,
            alternate:oldFiber,
            flags: Update
        })

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)
        // console.log(lastPlacedIndex)

        if(previousNewFiber === null) {
            wip.child = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
        oldFiber = nextOldFiber
    }

    if (newIndex === newChildren.length) {
        // console.log('xcds', oldFiber)
        deleteRemainingChildren(wip, oldFiber);
        return;
    }

    if(!oldFiber) {
        for (; newIndex<newChildren.length; newIndex++) {
            const newChild = newChildren[newIndex]
            if(newChild === null){
                continue
            }
            const newFiber = createFiber(newChild, wip);

            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)
    
            if(previousNewFiber === null) {
                wip.child = newFiber
            } else {
                previousNewFiber.sibling = newFiber
            }
            previousNewFiber = newFiber
        }
    }

    const existingChildren = mapRemainingChildren(oldFiber)
    for (; newIndex<newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex]
        if(newChild === null){
            continue
        }
        const newFiber = createFiber(newChild, wip);

        const matchedFiber = existingChildren.get(newFiber.key || newFiber.index)

        if(matchedFiber) {
            Object.assign(newFiber,{
                stateNode:matchedFiber.stateNode,
                alternate:matchedFiber,
                flags: Update
            })

            existingChildren.delete(newFiber.key || newFiber.index)
        }

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)


        if(previousNewFiber === null) {
            wip.child = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
    }

    if(shouldTrackSideEffects){
        existingChildren.forEach(child => deleteChild(wip, child))
    }

}

function sameNode(a, b){
    return a && b && a.type === b.type && a.key === b.key
}
