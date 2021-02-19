export const lockScroll = () => {
  document.width = window.innerWidth
  document.height = window.innerHeight
  document.body.style.overflow = "hidden"
}

export const unlockScroll = () => {
  document.body.style.overflow = "scroll"
}
