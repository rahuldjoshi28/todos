const PropsMap = {
  children: "innerHTML"
}


export const Events = {
  SUBMIT: "submit",
  CLICK: "click"
}

function addListeners(node, events) {
  Object.keys(events).forEach(event => {
    node.addEventListener(event, events[event])
  })
}

export function createElement(type, props = {}, events = {}) {
  const el = document.createElement(type)

  addListeners(el, events)

  Object.keys(props).forEach(key => {
    if (!!PropsMap[key]) {
      el[PropsMap[key]] = props[key]
      return
    }
    el[key] = props[key]
  })

  return el
}

export function append(parent, ...children) {
  children.forEach(child => {
    parent.appendChild(child)
  })
  return parent
}