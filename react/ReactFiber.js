import { FunctionComponent, HostComponent, ClassComponent, HostText, Fragment } from "./ReactWorkTag";
import { isFn, isStr, Placement, isUndefined} from "./utils";

export default function createFiber(vnode, returnFiber) {
    const fiber = {
        //类型
        type: vnode.type,
        key: vnode.key,
        props: vnode.props,
        stateNode: null,
        child: null,
        sibling: null,
        return: returnFiber,
        flags: Placement,
        // 记录节点在当前层级下的位置
        index: null,
        alternate: null,
        memorizedState:null
    }

    const { type } = vnode;

    if(isStr(type)) {
        fiber.tag = HostComponent
    } else if (isFn(type)) {
        fiber.tag = type.prototype.isReactComponent ? ClassComponent : FunctionComponent
    } else if(isUndefined(type)){
        fiber.tag = HostText
        fiber.props = {children: vnode}
    } else {
        fiber.tag = Fragment
    }
    

    return fiber;
}