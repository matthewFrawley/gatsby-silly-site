declare module "*module.css" {
  const content: { [className: string]: string }
  export = content
}

declare module "*module.scss" {
  const content: any
  export = content
}

declare module "*.jpeg" {
  const content: string
  export = content
}

declare module "*.jpg" {
  const content: string
  export = content
}

declare module "*.png" {
  const content: string
  export = content
}

declare module "*.svg" {
  const content: string
  export = content
}

declare module "*.mp4" {
  const content: string
  export = content
}
