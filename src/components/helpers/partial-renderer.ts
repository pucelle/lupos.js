import {DOMScroll, UpdateQueue} from '@pucelle/ff'
import {locateLastVisibleIndex, locateFirstVisibleIndex, getRect, Rect} from './utils'
import {PartialRendererSizeStat} from './partial-renderer-size-stat'


/** Function for doing updating, resolved after render complete and can check computed styles. */
type UpdateDataCallback = (startIndex: number, endIndex: number, scrollDirection: 'up' | 'down' | null) => void


/** Latest render state, values keep change after each time rendering. */
interface RenderState {

	/** Latest scroller size. */
	scrollerSize: number

	/** 
	 * The end index when last time updating placeholder,
	 * thus, can avoid update placeholder when scrolling up.
	 */
	maxEndIndexForPlaceholder: number

	/** 
	 * Last scroll direction.
	 * If is `end`, `sliderEndPosition` is prepared immediately, and `sliderStartPosition` is prepared after rendered.
	 * Otherwise `sliderStartPosition` is prepared immediately, and `sliderEndPosition` is prepared after rendered.
	 */
	scrollDirection: 'start' | 'end' | null,

	/** The top/left position of slider, update it before or after every time rendered. */
	sliderStartPosition: number

	/** The bottom/right position of slider, update it before or after every time rendered. */
	sliderEndPosition: number

	/** 
	 * The `startIndex` property has changed and need to be applied.
	 * Soon need to re-render according to the new start index.
	 * Note it was initialized as `true`.
	 */
	needToApplyStartIndex: boolean
}


/**
 * What a renderer do:
 *
 * When initializing or update from applied start index:
 * - Update indices.
 * - Update placeholder height and scroll position.
 * - Cause scroll event dispatched
 * - Validate scroll viewport coverage and re-render if required.
 * 
 * When scrolling up or down / left or right:
 * - Update scroll direction.
 * - Validate scroll viewport coverage and adjust `startIndex` or `endIndex` a little if not fully covered.
 */
export class PartialRenderer {

	private readonly scroller: HTMLElement
	private readonly slider: HTMLElement
	private readonly palceholder: HTMLDivElement
	private readonly updateDataCallback: UpdateDataCallback
	private overflowDirection: HVDirection | null = null
	private renderCountRate: number = 1

	/** Do rendered item size statistic, guess item size. */
	private readonly ss: PartialRendererSizeStat = new PartialRendererSizeStat()

	/** Cache render state values, and use them for later rendering. */
	private readonly state: RenderState = {
		scrollerSize: 0,
		maxEndIndexForPlaceholder: 0,
		scrollDirection: null,
		sliderStartPosition: 0,
		sliderEndPosition: 0,
		needToApplyStartIndex: true,
	}

	/** 
	 * The start index of the first item in the whole data.
	 * Readonly outside.
	 */
	startIndex: number = 0

	/**
	 * The end index of next position of last item in the whole data.
	 * Readonly outside.
	 */
	endIndex: number = 0

	/** Current total data count. */
	private dataCount: number = 0
	

	constructor(scroller: HTMLElement,
		slider: HTMLElement,
		palceholder: HTMLDivElement,
		updateDataCallback: UpdateDataCallback,
		overflowDirection: HVDirection | null
	) {
		this.scroller = scroller
		this.slider = slider
		this.palceholder = palceholder
		this.overflowDirection = overflowDirection
		this.updateDataCallback = updateDataCallback
		
		// Avoid it cause reflow.
		UpdateQueue.onComplete(() => {
			this.initProperties()
		})
	}

	/** Validate css properties of several elements. */
	private initProperties() {
		let scrollerStyle = getComputedStyle(this.scroller)
		let sliderStyle = getComputedStyle(this.slider)
		
		if (scrollerStyle.position === 'static') {
			throw 'Must not set "position" property of scroller element out of "<LiveRepeat>" to "static"!'
		}

		if (sliderStyle.position !== 'absolute') {
			throw 'Must set "position" property of "<LiveRepeat>" element to "absolute"!'
		}

		if (this.overflowDirection === 'vertical') {
			let overflowY = scrollerStyle.overflowY === 'auto' || scrollerStyle.overflowY === 'scroll'
			if (!overflowY) {
				throw 'Must set "overflow-y" property of scroller element out of "<LiveRepeat>" to "scroll" or "auto"!'
			}
		}
		else if (this.overflowDirection === 'horizontal') {
			let overflowY = scrollerStyle.overflowX === 'auto' || scrollerStyle.overflowX === 'scroll'
			if (!overflowY) {
				throw 'Must set "overflow-x" property of scroller element out of "<LiveRepeat>" to "scroll" or "auto"!'
			}
		}
		else {
			this.overflowDirection = DOMScroll.getScrollDirection(this.scroller)
		}
	}

	/** Set `renderCountRate` property. */
	setRenderCountRate(renderCountRate: number) {
		this.renderCountRate = renderCountRate
	}

	/** Will make the rendered item at this index been located at the top/left of scroll viewport. */
	setStartIndex(index: number) {
		this.startIndex = index
		this.state.needToApplyStartIndex = true
	}

	/** Set total data count before updating. */
	setDataCount(dataCount: number) {
		this.dataCount = dataCount
	}

	/** Update from applying start index or updating data. */
	async updateRendering() {
		// Adjust scroll position to specified index.
		if (this.state.needToApplyStartIndex) {
			this.updateWithNewStartIndex()
			this.state.needToApplyStartIndex = false
		}

		// Try persist indices and scroll position.
		else {
			this.updatePersistIndicesAndPosition()
		}

		this.updateStatePre(null)
		this.updatePlaceholderSizePre()

		await UpdateQueue.untilComplete()
		this.updateStatePost()
		this.updatePlaceholderSizePost()

		this.updateRenderingContinuously()
	}

	/** Update when start index specified and need to apply. */
	private updateWithNewStartIndex() {
		this.updateIndices(this.startIndex)
		this.updateDataCallback(this.startIndex, this.endIndex, null)
		this.resetSliderPosition()
	}

	/** Update start and end indices before rendering. */
	private updateIndices(newStartIndex: number) {
		let renderCount = this.ss.getSuggestedRenderCount(this.renderCountRate, this.state.scrollerSize)

		newStartIndex = Math.min(newStartIndex, this.dataCount - renderCount)
		newStartIndex = Math.max(0, newStartIndex)

		let endIndex = newStartIndex + renderCount
		endIndex = Math.min(endIndex, this.dataCount)

		this.startIndex = newStartIndex
		this.endIndex = endIndex
	}

	/** Reset scroll position by current start index. */
	private resetSliderPosition() {
		let countBeforeStart = this.startIndex
		let newTop = this.ss.getAverageSize() * countBeforeStart
		
		this.setSliderPosition('start', newTop)
		this.resetScrollPosition()
	}

	/** Update slider position after set new indices. */
	private setSliderPosition(where: 'start' | 'end', position: number) {
		if (where === 'start') {
			if (this.overflowDirection === 'vertical') {
				this.slider.style.top = position + 'px'
				this.slider.style.bottom = 'auto'
			}
			else if (this.overflowDirection === 'horizontal') {
				this.slider.style.left = position + 'px'
				this.slider.style.right = 'auto'
			}
		}
		else {
			if (this.overflowDirection === 'vertical') {
				this.slider.style.bottom = position + 'px'
				this.slider.style.top = 'auto'
			}
			else if (this.overflowDirection === 'horizontal') {
				this.slider.style.right = position + 'px'
				this.slider.style.left = 'auto'
			}
		}

		if (where === 'start') {
			this.state.sliderStartPosition = position
		}
		else {
			this.state.sliderEndPosition = position
		}
	}

	/** Update scroll position of `scroller` after set new slider position. */
	private resetScrollPosition() {
		if (this.overflowDirection === 'vertical') {
			this.scroller.scrollTop = this.state.sliderStartPosition
		}
		else if (this.overflowDirection === 'horizontal') {
			this.scroller.scrollLeft = this.state.sliderStartPosition
		}
	}

	/** Update data normally, and try to keep indices and scroll position. */
	private updatePersistIndicesAndPosition() {
		let oldStartIndex = this.startIndex

		// Update indices only if required.
		if (this.endIndex > this.dataCount) {
			this.updateIndices(this.startIndex)
		}
		
		this.updateDataCallback(this.startIndex, this.endIndex, null)
		
		// If start index is not changed, needs to keep the position of the item at this index.
		// Must reset it to top mode because may in bottom position mode.
		if (oldStartIndex === this.startIndex) {
			this.setSliderPosition('start', this.state.sliderStartPosition)
		}
		else {
			this.resetSliderPosition()
		}
	}

	/** 
	 * Update height/width of placeholder progressive.
	 * When scrolling down, and rendered more items at the end, update size.
	 * No need to update when scrolling up.
	 */
	private updatePlaceholderSizePre() {
		let scrollingDown = this.endIndex > this.state.maxEndIndexForPlaceholder
		if (scrollingDown) {
			let scrollSize: number
			let averageSize = this.ss.getAverageSize()
			
			if (this.state.scrollDirection === 'end') {
				scrollSize = averageSize * (this.dataCount - this.endIndex) + this.state.sliderEndPosition
			}
			else {
				scrollSize = averageSize * (this.dataCount - this.startIndex) + this.state.sliderStartPosition
			}

			if (this.overflowDirection === 'vertical') {
				this.palceholder.style.height = scrollSize + 'px'
			}
			else {
				this.palceholder.style.width = scrollSize + 'px'
			}

			this.state.maxEndIndexForPlaceholder = this.endIndex
		}
	}

	/** 
	 * After rendered and reach scroll end position,
	 * Update height/width of placeholder to a strict size.
	 */
	private updatePlaceholderSizePost() {
		let scrolledToEnd = this.endIndex === this.dataCount
		if (scrolledToEnd) {
			let scrollSize = this.state.sliderEndPosition

			if (this.overflowDirection === 'vertical') {
				this.palceholder.style.height = scrollSize + 'px'
			}
			else {
				this.palceholder.style.width = scrollSize + 'px'
			}

			this.state.maxEndIndexForPlaceholder = this.endIndex
		}
	}

	/** Every time after render complete, update state data.  */
	private updateStatePre(scrollDirection: 'start' | 'end' | null) {
		this.state.scrollDirection = scrollDirection
	}

	/** Every time after render complete, update state data.  */
	private updateStatePost() {
		let sliderSize = this.overflowDirection === 'vertical'
			? this.slider.offsetHeight
			: this.slider.offsetWidth

		let scrollerSize = this.overflowDirection === 'vertical'
			? this.scroller.clientHeight
			: this.scroller.clientWidth

		if (this.state.scrollDirection === 'end') {
			this.state.sliderStartPosition = this.state.sliderEndPosition - sliderSize
		}
		else {
			this.state.sliderEndPosition = this.state.sliderStartPosition + sliderSize
		}

		this.ss.update(this.startIndex, this.endIndex, sliderSize)
		this.state.scrollerSize = scrollerSize
	}

	/** 
	 * Update only when current rendering can't cover scroller, and will keep continuous scroll position.
	 * Note it must call `this.updateIndicesCallback` synchronously since it may be in a updating queue.
	 * Returns whether updated.
	 */
	updateRenderingContinuously() {
		
		// Reach start or end edge.
		if (this.startIndex === 0 && this.endIndex === this.dataCount) {
			return false
		}

		let updatePromise = this.updateFromCoverage()
		if (updatePromise) {
			this.lockUpdatingByPromise(updatePromise.then(() => {
				this.updatePlaceholderSizePre()
			}))

			return true
		}

		else {
			return false
		}
	}

	/** 
	 * Validate if slider fully covers scroller and update indices if not.
	 * Returns whether updated indices.
	 */
	 private updateFromCoverage() {
		let scrollerRect = this.getScrollerClientRect()
		let sliderRect = this.slider.getBoundingClientRect()
		let renderCount = this.renderCount * this.renderGroupCount
		let unexpectedScrollEnd = this.scroller.scrollTop + this.scroller.clientHeight === this.scroller.scrollHeight && this.endIndex < this.dataCount
		let unexpectedScrollStart = this.scroller.scrollTop === 0 && this.startIndex > 0
		let promise: Promise<void>

		// No intersection, reset slider position from current slider scroll offset.
		let hasNoIntersection = sliderRect.bottom < scrollerRect.top || sliderRect.top > scrollerRect.bottom
		if (hasNoIntersection) {
			this.updateFromCurrentScrollPosition()
			promise = untilRenderComplete()
		}

		// Scroll down and can't cover at bottom direction.
		// Otherwise will still load more when touch bottom scrolling edge and still more data exist.
		else if (sliderRect.bottom < scrollerRect.bottom || unexpectedScrollEnd) {
			let roughFirstVisibleIndex = locateFirstVisibleIndex(this.scroller, this.slider.children, 0)
			let oldStartIndex = this.startIndex
			let newStartIndex = this.startIndex + roughFirstVisibleIndex
	
			this.updateIndices(newStartIndex)
			promise = this.updateWithSliderPositionStable('down', oldStartIndex, scrollerRect)
		}

		// Scroll up and can't cover at top direction.
		// Keeps last visible index as endIndex.
		// Otherwise will still load more when touch top scrolling edge and still more data exist.
		else if (sliderRect.top > scrollerRect.top || unexpectedScrollStart) {
			let roughLastVisibleIndex = locateLastVisibleIndex(this.scroller, this.slider.children, 0)
			let oldStartIndex = this.startIndex
			let newEndIndex = this.startIndex + roughLastVisibleIndex + 1
			let newStartIndex = newEndIndex - renderCount

			this.updateIndices(newStartIndex)
			promise = this.updateWithSliderPositionStable('up', oldStartIndex, scrollerRect)
		}
		else {
			promise = Promise.resolve()
		}

		// Very small rate updating failed, especially when CPU is very busy.
		promise.catch(() => {
			this.updateFromCurrentScrollPosition()
			promise = untilRenderComplete()
		})

		return promise!
	}

	/** Re-generate indices from current scroll offset. */
	private updateFromCurrentScrollPosition() {
		this.resetIndices()
		this.resetSliderPosition()

		this.updateDataCallback(this.startIndex, this.endIndex, null)
	}

	/** Reset indices from current scroll offset. */
	private resetIndices() {
		let newStartIndex = this.averageItemSize > 0 ? Math.floor(this.scroller.scrollTop / this.averageItemSize) : 0
		this.updateIndices(newStartIndex)
	}

	/** Update slider position to keep it in a stable position after updating data items. */
	protected async updateWithSliderPositionStable(scrollDirection: 'up' | 'down', oldStartIndex: number, scrollerRect: Rect, ) {
		let visibleIndex = scrollDirection === 'down' ? this.startIndex - oldStartIndex : this.endIndex - 1 - oldStartIndex
		let visibleElement = this.slider.children[visibleIndex]
		let updateData = () => {this.updateDataCallback(this.startIndex, this.endIndex, scrollDirection)}

		if (!visibleElement) {
			throw new Error(`Wrongly rendered: can't found expected element in specified index!`)
		}

		// When reach start index but may not reach scroll start.
		if (this.startIndex === 0) {
			await this.updateWhenReachStartIndex(visibleElement, updateData)
		}

		// When reach end index but may not reach scroll end.
		else if (this.endIndex === this.dataCount) {
			await this.updateWhenReachEndIndex(visibleElement, updateData)
		}

		// When reach start index but not scroll index.
		else if (this.startIndex > 0 && this.scroller.scrollTop === 0) {
			await this.updateWhenReachScrollStart(visibleElement, scrollerRect, updateData)
		}

		// When reach scroll end but not end index.
		else if (this.endIndex < this.dataCount && this.scroller.scrollTop + this.scroller.clientHeight === this.scroller.scrollHeight) {
			await this.updateWhenReachScrollEnd(visibleElement, scrollerRect, updateData)
		}

		// Keeps visible element in the same scroll position.
		else if (scrollDirection === 'down') {
			await this.updateNormallyWhenScrollingDown(visibleElement, scrollerRect, updateData)
		}

		// Keeps visible element in the same scroll position.
		else {
			await this.updateNormallyWhenScrollingUp(visibleElement, scrollerRect, updateData)
		}
	}

	/** When reach start index but may not reach scroll start, reset scroll top. */
	protected async updateWhenReachStartIndex(lastVisibleElement: Element) {
		let visibleIndex = this.endIndex - 1 - this.startIndex
		let oldTop = lastVisibleElement.getBoundingClientRect().top

		this.setSliderPosition('top', 0)

		// Render to locate first item.
		updateData()
		
		await untilRenderComplete()

		// Should keep the visible element stable.
		let newVisibleElement = this.slider.children[visibleIndex]
		let newTop = newVisibleElement.getBoundingClientRect().top
		let translate = newTop - oldTop

		// Set scroll top to restore it's translate, `scrollTop` property is opposite with translation, so here it's `+`.
		this.scroller.scrollTop = this.scroller.scrollTop + translate
	}

	/** When reach end index but may not reach scroll end, reset scroll top. */
	protected async updateWhenReachEndIndex(firstVisibleElement: Element) {
		let visibleIndex = 0
		let oldBottom = firstVisibleElement.getBoundingClientRect().bottom

		// Render to locate last item.
		updateData()

		await untilRenderComplete()

		// Get element translated.
		let newVisibleElement = this.slider.children[visibleIndex]
		let newBottom = newVisibleElement.getBoundingClientRect().bottom
		let translate = newBottom - oldBottom

		// Get new position.
		let scrollerRect = this.getScrollerClientRect()
		let sliderRect = this.slider.getBoundingClientRect()

		// should minus translate normally, but bottom property is opposite with translation, so here it's `+`.
		let position = scrollerRect.bottom - sliderRect.bottom + translate
		position -= this.scroller.scrollTop
		this.setSliderPosition('bottom', position)
	}

	/** When reach scroll start but not reach start index, provide more scroll space. */
	protected async updateWhenReachScrollStart(lastVisibleElement: Element, scrollerRect: Rect) {
		// Provide more spaces at start.
		let extendedScrollSpace = this.averageItemSize * this.startIndex

		// Translate position from the spaces.
		let position = scrollerRect.bottom - lastVisibleElement.getBoundingClientRect().bottom
		position -= extendedScrollSpace
		this.setSliderPosition('bottom', position)
		updateData()

		this.scroller.scrollTop = extendedScrollSpace
		await untilRenderComplete()
	}

	/** When reach scroll end but not reach end index, provide more scroll space. */
	protected async updateWhenReachScrollEnd(firstVisibleElement: Element, scrollerRect: Rect) {
		// Update normally.
		let position = firstVisibleElement.getBoundingClientRect().top - scrollerRect.top
		position += this.scroller.scrollTop
		this.setSliderPosition('top', position)

		updateData()
		await untilRenderComplete()
	}

	/** Render more items when scrolling down, not reset scroll position. */
	protected async updateNormallyWhenScrollingDown(firstVisibleElement: Element, scrollerRect: Rect) {
		let position = firstVisibleElement.getBoundingClientRect().top - scrollerRect.top
		position += this.scroller.scrollTop
		this.setSliderPosition('top', position)

		updateData()
		await untilRenderComplete()
	}

	/** Render more items when scrolling up, not reset scroll position. */
	protected async updateNormallyWhenScrollingUp(lastVisibleElement: Element, scrollerRect: Rect) {
		let position = scrollerRect.bottom - lastVisibleElement.getBoundingClientRect().bottom
		position -= this.scroller.scrollTop
		this.setSliderPosition('bottom', position)

		updateData()
		await untilRenderComplete()
	}
}