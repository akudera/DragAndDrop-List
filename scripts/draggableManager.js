export class DraggableManager {
  selectors = {
    list: '[data-js-list]',
    listElement: '[data-js-list-element]',
    listElementInner: '[data-js-dnd-element]'
  }

  stateClasses = {
    isDragging: 'is-dragging'
  }

  initialState = {
    draggableElement: null,
    draggableElementWrapper: null,
    currentPosition: null,
    offsetY: null,
  }

  holderTimerState = {
    holdTimer: null,
    isHolding: false,
  }

  scrollIntervalState = {
    interval: null,
  }

  constructor(RowGap) {
    this.listElement = document.querySelector(this.selectors.list)
    this.listElements = document.querySelectorAll(this.selectors.listElement)
    this.listStartY = this.listElement.getBoundingClientRect().top
    this.listRowGap = RowGap

    this.state = { ...this.initialState }

    this.bindEvents()
    this.listMaxY = this.getNewTopCoordinate(this.listElements[this.listElements.length - 1])
  }

  bindEvents() {
    this.listElement.addEventListener('pointerdown', (event) => { this.onPointerDown(event) })
    document.addEventListener('pointermove', (event) => { this.onPointerMove(event) })
    document.addEventListener('pointerup', () => { this.onPointerUp() })
  }

  onPointerDown(event) {
    this.holderTimerState.holdTimer = setTimeout(() => {
      this.holderTimerState.isHolding = true
      this.setDragState(event)
    }, 300)
  }

  onPointerMove(event) {
    if (!this.state.draggableElement) return

    const listCurrentStartY = this.listElement.getBoundingClientRect().top
    const y = event.clientY - listCurrentStartY - this.state.offsetY

    if (event.pageY - this.state.offsetY > this.listStartY && y < this.listMaxY) {
      this.state.draggableElement.style.top = `${y}px`
    }

    const draggableRect = this.state.draggableElement.getBoundingClientRect()

    const previousElement = this.state.draggableElementWrapper.previousElementSibling
    if (previousElement) {
      const previousRect = previousElement.getBoundingClientRect()

      if (draggableRect.top < previousRect.top + previousRect.height / 2) {
        this.listElement.insertBefore(this.state.draggableElementWrapper, previousElement)
        this.listElements = document.querySelectorAll(this.selectors.listElement)
      }
    }

    const nextElement = this.state.draggableElementWrapper.nextElementSibling
    if (nextElement) {
      const nextRect = nextElement.getBoundingClientRect()

      if (draggableRect.bottom > nextRect.top + nextRect.height / 2) {
        this.listElement.insertBefore(this.state.draggableElementWrapper, nextElement.nextElementSibling)
        this.listElements = document.querySelectorAll(this.selectors.listElement)
      }
    }

    const viewportHeight = document.documentElement.clientHeight
    const scrollZone = 60
    const scrollSpeed = 180

    clearInterval(this.scrollIntervalState.interval)

    if (event.clientY < scrollZone) {
      this.scrollIntervalState.interval = setInterval(() => { this.autoScroll(-scrollSpeed) }, 10)
    } else if (event.clientY > viewportHeight - scrollZone) {
      this.scrollIntervalState.interval = setInterval(() => { this.autoScroll(scrollSpeed) }, 10)
    }
  }

  onPointerUp() {
    clearTimeout(this.holderTimerState.holdTimer)
    this.holderTimerState.isHolding = false

    clearInterval(this.scrollIntervalState.interval)
    if (!this.state.draggableElement) return

    this.resetState()
  }

  resetState() {
    this.state.draggableElementWrapper.style.height = ''
    this.state.draggableElement.style.zIndex = '0'
    this.state.draggableElement.classList.remove(this.stateClasses.isDragging)

    this.state = { ...this.initialState }
  }

  autoScroll(scrollSpeed) {
    scrollBy({
      left: 0,
      top: scrollSpeed,
      behavior: 'smooth',
    })
  }

  setDragState(event) {
    if (this.holderTimerState.isHolding) {
      const { target, clientY } = event
      const { top } = target.getBoundingClientRect()

      if (!target.matches(this.selectors.listElementInner)) return

      this.state.draggableElementWrapper = target.parentElement
      this.state.draggableElement = target
      this.state.offsetY = clientY - top
      this.state.draggableElement.style.zIndex = 100
      this.state.currentPosition = target.style.top
      this.state.draggableElement.classList.add(this.stateClasses.isDragging)

      this.state.draggableElementWrapper.style.height = `${this.state.draggableElement.getBoundingClientRect().height}px`
      this.state.draggableElement.style.top = `${this.getNewTopCoordinate(this.state.draggableElementWrapper)}px`
    }
  }

  getNewTopCoordinate(element) {
    let topY = 0

    const listLength = [...this.listElements].length
    for (let i = 0; i < listLength; i++) {
      const item = this.listElements[i]
      if (item === element) return topY

      topY += item.getBoundingClientRect().height + this.listRowGap
    }
    return topY
  }
}