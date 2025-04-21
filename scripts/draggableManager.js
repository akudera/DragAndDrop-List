export class DraggableManager {
  selectors = {
    list: '[data-js-list]',
    listElement: '[data-js-list-element]',
  }

  stateClasses = {
    isDragging: 'is-dragging'
  }

  initialState = {
    draggableElement: null,
    offsetX: null,
    offsetY: null,
  }

  itemsStartPosition = []

  constructor() {
    this.listElement = document.querySelector(this.selectors.list)
    this.listElements = document.querySelectorAll(this.selectors.listElement)
    this.listStartY = this.listElement.getBoundingClientRect().top

    this.state = { ...this.initialState }

    this.bindEvents()
    this.initialFilter()
  }

  bindEvents() {
    this.listElement.addEventListener('pointerdown', (event) => { this.onPointerDown(event) })
    this.listElement.addEventListener('pointermove', (event) => { this.onPointerMove(event) })
    this.listElement.addEventListener('pointerup', () => { this.onPointerUp() })
  }

  initialFilter() {
    let topPosition = 0

    for (let i = 0; i < this.listElements.length; i++) {
      this.listElements[i].style.top = `${topPosition}px`

      const itemPosition = this.listElements[i].getBoundingClientRect().height + 12

      this.itemsStartPosition.push(topPosition)
      topPosition += itemPosition
    }

    this.listEndY =
      this.itemsStartPosition[this.itemsStartPosition.length - 1]
  }

  onPointerDown(event) {
    const { target, clientY } = event
    const { top } = target.getBoundingClientRect()

    if (!target.matches(this.selectors.listElement)) return

    this.state.draggableElement = target
    this.state.offsetY = clientY - top
    this.state.draggableElement.style.zIndex = 100
    this.state.draggableElement.classList.add(this.stateClasses.isDragging)
  }

  onPointerMove(event) {
    if (!this.state.draggableElement) return

    const y = event.clientY - this.listStartY - this.state.offsetY
    if (event.clientY - this.state.offsetY > this.listStartY && y < this.listEndY) {
      this.state.draggableElement.style.top = `${y}px`
    }
  }

  onPointerUp() {
    if (!this.state.draggableElement) return

    this.resetState()
  }

  resetState() {
    this.state.draggableElement.style.zIndex = '0'
    this.state.draggableElement.classList.remove(this.stateClasses.isDragging)

    this.state = { ...this.initialState }    
  }
}