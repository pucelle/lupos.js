import {DependencyTracker} from '@pucelle/ff'
export {noop} from '@pucelle/ff'


// Make you visit these apis easier, no need to import another module except **lupos.js**.
export const onGet = DependencyTracker.onGet
export const onSet = DependencyTracker.onSet
export const onGetBunched = DependencyTracker.onGetBunched
export const onSetBunched = DependencyTracker.onSetBunched
export const trackExecutionOf = DependencyTracker.trackExecutionOf
export const untrack = DependencyTracker.untrack