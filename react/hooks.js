import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { HookLayout, HookPassive } from "./utils";

let currentlyRenderingFiber = null;
let workInProgressHook = null
let currentHook = null

export function renderWithHooks(wip){
    currentlyRenderingFiber = wip
    // currentlyRenderingFiber.memorizedState = null
    workInProgressHook = null

    currentlyRenderingFiber.updateQueueOfEffect = []
    currentlyRenderingFiber.updateQueueOfLayout = []
}

function updateWorkInProgressHook(){
    let hook
    const current = currentlyRenderingFiber.alternate
    if(current){
        console.log(workInProgressHook)
        // currentlyRenderingFiber.memorizedState = current.memorizedState
        if(workInProgressHook){
            workInProgressHook = hook = workInProgressHook.next
            currentHook = currentHook.next

        } else {
            workInProgressHook = hook = currentlyRenderingFiber.memorizedState
            currentHook = currentHook.memorizedState
        }

    } else {
        currentHook = null
        hook = {
            memorizedState: null,
            next:null
        }
        if(workInProgressHook){
            workInProgressHook = workInProgressHook.next = hook
        } else {
            workInProgressHook = currentlyRenderingFiber.memorizedState = hook
        }
    }
    return hook
}

export function useReducer(reducer, initialState){
    const hook = updateWorkInProgressHook()

    if(!currentlyRenderingFiber.alternate) {
        hook.memorizedState = initialState
    }

    // const dispatch = (action) => dispatchReducerAction(currentlyRenderingFiber, hook, reducer,action)
    const dispatch = ((currentlyRenderingFiber)=>{
        return (action) => {
            console.log('action', action)
            dispatchReducerAction(currentlyRenderingFiber, hook, reducer, action)
        }
    })(currentlyRenderingFiber)
    // const dispatch = () => {
    //     hook.memorizedState = reducer(hook.memorizedState)
    //     currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber }
    //     scheduleUpdateOnFiber(currentlyRenderingFiber)
    // }
    return [
        hook.memorizedState,
        dispatch
    ]
}

function dispatchReducerAction(fiber, hook, reducer, action) {
    console.log('xxc', fiber)
    hook.memorizedState = reducer ? reducer(hook.memorizedState, action) : action
    fiber.alternate = { ...fiber }
    fiber.sibling = null;
    scheduleUpdateOnFiber(fiber)
}

export function useState(initialState) {
    return useReducer(null, initialState)
}

function updateEffectImp(hooksFlags, create, deps){
    const hook = updateWorkInProgressHook();

    if(currentHook) {
        const prevEffect = currentHook.memorizedState
        if(deps) {
            const prevDeps = prevEffect.deps
            if(areHookInputsEqual(deps,prevDeps)) {
                return;
            }
        }
    }

    const effect = { hooksFlags, create, deps }

    hook.memorizedState = effect

    if(hooksFlags & HookPassive){
        currentlyRenderingFiber.updateQueueOfEffect.push(effect)
    } else {
        currentlyRenderingFiber.updateQueueOfLayout.push(effect)
    }


}

export function useEffect(create, deps) {
    return updateEffectImp(HookPassive, create,deps)
}
export function useLayoutEffect(create,deps) {

    return updateEffectImp(HookLayout, create,deps)


}

export function areHookInputsEqual(nextDeps, prevDeps) {
    if(prevDeps == null) {
        return false
    }

    for(let i = 0; i<prevDeps.length && i<nextDeps.length; i++) {
        if(Object.is(nextDeps[i], prevDeps[i])) {
            continue
        }
        return false
    }

    return true
}

