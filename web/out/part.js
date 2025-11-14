/** Get content slot parameter from component callback parameter. */
export function getComponentSlotParameter(param) {
    // Replace `AsDirectNode` to as `AsContextNode` for a component.
    if (param & 2 /* PartCallbackParameterMask.AsDirectNode */) {
        param &= ~2 /* PartCallbackParameterMask.AsDirectNode */;
        param |= 4 /* PartCallbackParameterMask.AsDirectContextNodeInternal */;
    }
    // Remove `FromOwnStateChange`.
    param &= ~1 /* PartCallbackParameterMask.FromOwnStateChange */;
    return param;
}
/** Get part callback parameter by template callback parameter and part position. */
export function getTemplatePartParameter(param, position) {
    // Removes `AsDirectNode` if is in Direct Position.
    if (param & 2 /* PartCallbackParameterMask.AsDirectNode */) {
        if (position !== 1 /* PartPositionType.DirectNode */) {
            param &= ~2 /* PartCallbackParameterMask.AsDirectNode */;
        }
    }
    // If has `AsContextNode` and is in Context Position, replace to `AsDirectNode`.
    if (param & 4 /* PartCallbackParameterMask.AsDirectContextNodeInternal */) {
        param &= ~4 /* PartCallbackParameterMask.AsDirectContextNodeInternal */;
        if (position === 2 /* PartPositionType.ContextNode */) {
            param |= 2 /* PartCallbackParameterMask.AsDirectNode */;
        }
    }
    return param;
}
/** It delegate a part, and this part itself may be deleted or appended again. */
export class PartDelegator {
    connected = false;
    part = null;
    update(part) {
        if (this.part === part) {
            return;
        }
        if (this.connected) {
            if (this.part) {
                this.part.beforeDisconnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
            }
            if (part) {
                part.afterConnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
            }
        }
        this.part = part;
    }
    afterConnectCallback(param) {
        if (this.connected) {
            return;
        }
        if (this.part) {
            this.part.afterConnectCallback(param);
        }
        this.connected = true;
    }
    beforeDisconnectCallback(param) {
        if (!this.connected) {
            return;
        }
        if (this.part) {
            this.part.beforeDisconnectCallback(param);
        }
        this.connected = false;
    }
}
