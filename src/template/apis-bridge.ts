import {DOMEvents, DependencyTracker, UpdateQueue, Watcher} from '@pucelle/ff'
export {noop} from '@pucelle/ff'


// Make you visit these apis easier, no need to import another module except **lupos.js**.
export const onGet = DependencyTracker.onGet
export const onSet = DependencyTracker.onSet
export const beginTrack = DependencyTracker.beginTrack
export const endTrack = DependencyTracker.endTrack
export const untrack = DependencyTracker.untrack
export const onGetBunched = DependencyTracker.onGetBunched
export const onSetBunched = DependencyTracker.onSetBunched
export const enqueue = UpdateQueue.enqueue
export const watch = Watcher.watch
export const watchImmediately = Watcher.watchImmediately
export const bindEvent = DOMEvents.on
export const unbindEvent = DOMEvents.off
