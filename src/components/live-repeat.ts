import {locateFirstVisibleIndex, locateLastVisibleIndex} from './helpers/utils'
import {Repeat, RepeatRenderFn} from './repeat'
import {PartialRenderer} from './helpers/partial-renderer'
import {DOMEvents, LayoutWatcher, effect, input} from '@pucelle/ff'


export interface LiveRepeatEvents {

	/** 
	 * Fired after every time live data is updated.
	 * After the standard event `updated` fired,
	 * `<LiveRepeat>` may need more time to check rendering size,
	 * and adjust render result to cover scroll viewport.
	 * after all ready, this event is fired.
	 */
	'live-updated': (scrollDirection: 'start' | 'end' | null) => void
}


/** 
 * Compare with `<Repeat>`, `<LiveRepeat>` can render partial items in the scroll viewport,
 * and update rendered partial items follow user scrolling.
 * 
 * Some style restrictions you need to know:
 * - `<LiveRepeat>` must be contained in a scroller element with `overflow: auto / scroll`.
 * - `<LiveRepeat>` must be the only child of the scroller element.
 * - `<LiveRepeat>` must in `absolute` position
 * - The scroller element must not in `static` position.
 */
export class LiveRepeat<T = any, E = any> extends Repeat<T, E & LiveRepeatEvents> {

	/**
	* Rate of how many items to render compare with the minimum items that can cover scroll viewport.
	* - Set it small like less than `1.5` can render fewer contents each time, but update more frequently when scrolling.
    * - Set it large like more than `2` cause render more contents each time, but update less frequently when scrolling.
	* 
	* Must larger than `1`.
	*/
	@input renderCountRate: number = 1.2

	/** 
	 * Specify overflow direction.
	 * - If not specified, try to detect from scroller element.
	 * - If specified, scroller element's scroll direction but keep consistent with it.
	 * 
	 * If scroller element has scroll css property set in both direction,
	 * you must specify this property explicitly.
	 */
	@input overflowDirection: HVDirection | null = null

	/** The parent element of slider, which has a `overflow` value like `auto` or `scroll` set. */
	protected scroller: HTMLElement = null as any

	/** 
	 * Placeholder element, sibling of slider.
	 * as here it renders only partial content,
	 * slider element has no enough size to expand scrolling area,
	 * so use it instead to expand scrolling area to the full size.
	 */
	protected palceholder: HTMLDivElement = null as any

	/** Partial content renderer. */
	protected renderer: PartialRenderer = null as any

	/**
	 * Render function to generate template result by each item.
	 * Please ensure it renders only one child element,
	 * and don't apply `:transition` to this element.
	 */
	declare renderFn: RepeatRenderFn<T>


	/** The start index of the first item in the whole data. */
	private startIndex: number = 0

	/** The end index of next position of the last item in the whole data. */
	endIndex: number = 0

	/** Current rendered partial of full data. */
	liveData: T[] = []

	/** Transfer `renderCountRate` property to renderer. */
	@effect onRenderCountRateChange() {
		this.renderer.setRenderCountRate(this.renderCountRate)
	}

	/** Transfer `data.length` property to renderer. */
	@effect onDataCountChange() {
		this.renderer.setDataCount(this.data.length)
	}

	protected onConnected(this: LiveRepeat<any, {}>) {
		super.onConnected()
		this.updateScroller()

		DOMEvents.on(this.scroller, 'scroll', this.checkCoverage, this, {passive: true})

		let unwatchScrollerSize = LayoutWatcher.watch(this.scroller, 'size', this.checkCoverage.bind(this))
		this.once('disconnected', unwatchScrollerSize)
	}
	
	protected updateScroller() {
		if (this.scroller) {
			if (this.scroller !== this.el.parentElement) {
				this.palceholder.remove()
				this.initScroller()
			}
		}
		else {
			this.initScroller()
		}
	}

	protected initScroller() {
		let scroller = this.el.parentElement

		if (!scroller || scroller.children.length !== 1) {
			throw new Error(
				`"<LiveRepeat>" must be contained in a scroller element with style "overflow: scroll / auto", and must be it's only child!`
			)
		}
		
		this.scroller = scroller
		this.initPlaceholder()
		this.renderer = new PartialRenderer(scroller, this.el, this.palceholder, this.updateIndices.bind(this), this.overflowDirection)
	}

	protected initPlaceholder() {
		this.palceholder = document.createElement('div')
		this.palceholder.style.cssText = 'position: absolute; left: 0; top: 0; width: 1px; visibility: hidden;'
		this.scroller.prepend(this.palceholder)
	}

	protected onDisconnected() {
		super.onDisconnected()
		DOMEvents.off(this.scroller, 'scroll', this.checkCoverage, this)
	}

	/** Check whether current rendering can cover scroll viewport. */
	protected checkCoverage() {
		this.renderer.updateRenderingContinuously()
	}

	protected doUpdateRendering() {
		this.renderer.updateRendering()
	}

	protected updateIndices(startIndex: number, endIndex: number, scrollDirection: 'up' | 'down' | null) {
		this.startIndex = startIndex
		this.endIndex = endIndex
		this.updateData(this.data.slice(startIndex, endIndex))

		;(this as LiveRepeat<T, {}>).fire('live-updated', scrollDirection)
	}

	async setStartIndex(index: number): Promise<boolean> {
		this.renderer.setStartIndex(index)
		this.willUpdate()

		return true
	}

	async scrollIndexToView(): Promise<boolean> {
		throw new Error(`"<LiveRepeat>" doesn't support scrolling to position!`)
	}

	async scrollIndexToStart(): Promise<boolean> {
		throw new Error(`"<LiveRepeat>" doesn't support scrolling to position!`)
	}

	async scrollIndexToLeft(): Promise<boolean> {
		throw new Error(`"<LiveRepeat>" doesn't support scrolling to position!`)
	}

	/** 
	 * Get the index of the first visible element, which can be used to restore scrolling position by `setFirstVisibleIndex`.
	 * May cause page reflow.
	 */
	getFirstVisibleIndex() {
		return Math.max(0, locateFirstVisibleIndex(this.scroller, this.sliderChildren.getChildren())) + this.startIndex
	}

	/** 
	 * Get the index of the last visible element.
	 * May cause page reflow.
	 */
	getLastVisibleIndex() {
		return Math.max(0, locateLastVisibleIndex(this.scroller, this.sliderChildren.getChildren()))
	}

	/** 
	 * Make item in the specified index becomes visible by scrolling minimum pixels.
	 * Try to adjust immediately, so you will need to ensure elements rendered.
	 * Will re-render if the element in specified index is not rendered.
	 */
	async makeIndexVisible(index: number): Promise<boolean> {
		if (this.isIndexRendered(index)) {
			return this.scrollToViewRenderedIndex(index)
		}
		else {
			this.setStartIndex(index)
			await this.untilDataUpdatedAndRendered()
			return this.scrollToViewRenderedIndex(index)
		}
	}

	/** Returns a promise which will be resolved after data updated and renderer. */
	protected untilDataUpdatedAndRendered(this: LiveRepeat<T>) {
		return new Promise(resolve => {
			this.once('liveDataRendered', resolve)
		})
	}

	/** Get if item with specified index is rendered. */
	protected isIndexRendered(index: number) {
		return index >= this.startIndex && index < this.startIndex + this.liveData.length
	}

	/** After item in index rendered, make it visible. */
	protected scrollToViewRenderedIndex(index: number): boolean {
		let el = this.sliderChildren.childAt(index - this.startIndex)
		if (!el) {
			return false
		}

		let scrollerRect = this.scroller.getBoundingClientRect()
		let elRect = el.getBoundingClientRect()

		// Below it, need to scroll up.
		if (elRect.bottom > scrollerRect.bottom) {
			this.scroller.scrollTop = this.scroller.scrollTop + (elRect.bottom - scrollerRect.bottom)
		}

		// Above it, need to scroll down.
		else if (elRect.top < scrollerRect.top) {
			this.scroller.scrollTop = this.scroller.scrollTop + (scrollerRect.top - elRect.top)
		}

		return true
	}

	/** 
	 * Make item in the specified index visible at the top edge of scroller.
	 * Try to adjust immediately, so you will need to ensure elements rendered.
	 * Will re-render if the element in specified index is not rendered.
	 */
	async makeIndexVisibleAtTop(index: number): Promise<boolean> {
		if (this.isIndexRendered(index)) {
			return this.scrollToMakeRenderedIndexAtTop(index)
		}
		else {
			this.setStartIndex(index)
			await this.untilDataUpdatedAndRendered()
			return this.scrollToMakeRenderedIndexAtTop(index)
		}
	}

	/** 
	 * Make item in the specified index becomes visible at the top scroll position.
	 * If needs to update, will update firstly and then set index.
	 */
	async setFirstVisibleIndex(index: number): Promise<boolean> {
		this.setStartIndex(index)
		await this.untilDataUpdatedAndRendered()
		return this.scrollToMakeRenderedIndexAtTop(index)
	}

	/** After item in index rendered, make it becomes visible at the top scroll position. */
	protected scrollToMakeRenderedIndexAtTop(index: number): boolean {
		let el = this.sliderChildren.childAt(index - this.startIndex)
		if (!el) {
			return false
		}

		let scrollerRect = this.scroller.getBoundingClientRect()
		let elRect = el.getBoundingClientRect()

		this.scroller.scrollTop = this.scroller.scrollTop + (elRect.top - scrollerRect.top)

		return true
	}
}
