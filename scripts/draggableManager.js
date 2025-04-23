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

  timerState = {
    holdTimer: null,
    isHolding: false,
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
    this.timerState.holdTimer = setTimeout(() => {
      this.timerState.isHolding = true
      this.setDragState(event)
      navigator.vibrate(200)
    }, 300)
  }

  onPointerMove(event) {
    clearTimeout(this.timerState.holdTimer)
    this.timerState.isHolding = false
    if (!this.state.draggableElement) return

    const y = event.clientY - this.listStartY - this.state.offsetY
    if (event.clientY - this.state.offsetY > this.listStartY && y < this.listMaxY) {
      this.state.draggableElement.style.top = `${y}px`
    }

    const previousElement = this.state.draggableElementWrapper.previousElementSibling
    if (previousElement) {
      const previousElementStartY = previousElement.getBoundingClientRect().top - this.listStartY
      if (y < previousElementStartY + previousElement.getBoundingClientRect().height && previousElementStartY < y) {
        this.listElement.insertBefore(this.state.draggableElementWrapper, previousElement)
        this.listElements = document.querySelectorAll(this.selectors.listElement)
      }
    }
    const draggableElementHeight = this.state.draggableElement.getBoundingClientRect().height
    const nextElement = this.state.draggableElementWrapper.nextElementSibling
    if (nextElement) {
      const nextElementStartY = nextElement.getBoundingClientRect().top - this.listStartY
      if (y + draggableElementHeight < nextElementStartY + nextElement.getBoundingClientRect().height && nextElementStartY < y + draggableElementHeight) {
        this.listElement.insertBefore(this.state.draggableElementWrapper, nextElement.nextElementSibling)
        this.listElements = document.querySelectorAll(this.selectors.listElement)
      }
    }
  }

  onPointerUp() {
    clearTimeout(this.timerState.holdTimer)
    this.timerState.isHolding = false
    if (!this.state.draggableElement) return

    this.resetState()
  }

  resetState() {
    this.state.draggableElement.style.zIndex = '0'
    this.state.draggableElement.classList.remove(this.stateClasses.isDragging)

    this.state = { ...this.initialState }    
  }

  setDragState(event) {
    if (this.timerState.isHolding) {
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