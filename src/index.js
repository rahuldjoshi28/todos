const PropsMap = {
  children: "innerHTML"
}

const Events = {
  SUBMIT: "submit",
  CLICK: "click"
}

function addListeners(node, events) {
  Object.keys(events).forEach(event => {
    node.addEventListener(event, events[event])
  })
}

function createElement(type, props = {}, events = {}) {
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

function append(parent, ...children) {
  children.forEach(child => {
    parent.appendChild(child)
  })
  return parent
}

const store = {}

function createStore(name, initialValue) {
  store[name] = {
    state: initialValue,
    listeners: []
  }
}

function subscribe(name, onChange) {
  store[name].listeners.push(onChange)
  setTimeout(() => onChange(store[name].state))
}

function update(name, updator) {
  store[name].state = updator(store[name].state)

  store[name].listeners.forEach(listener => listener(store[name].state))
}

// ---

const TODO_STORE = "todo"

function iconButton(iconName, props, events) {
  const iconEl = createElement("i", {className: `fa fa-${iconName}`})
  const button = createElement("button", props, events)

  return append(button, iconEl)
}

function todoForm() {
  const onSubmit = e => {
    const todoText = textArea.value
    update(TODO_STORE, todos => [...todos, {text: todoText, id: Symbol()}])
    textArea.value = ""
    e.preventDefault()
  }

  const textArea = createElement("textarea", {
    className: "todo-input",
    placeholder: "Please enter todo here...",
    required: true
  })
  const submitButton = createElement("button", {className: "button", type: "submit", children: "Add"})
  const form = createElement("form", {className: "todo-form"}, {[Events.SUBMIT]: onSubmit})

  return append(form, textArea, submitButton)
}

function todoBox(todo) {
  const deleteTODO = () => {
    update(TODO_STORE, todos => todos.filter(({id}) => id !== todo.id))
  }

  const deleteBtn = iconButton("trash", {className: "delete-button"}, {[Events.CLICK]: deleteTODO})
  const card = createElement("article", {children: todo.text, className: "todo"})
  return append(card, deleteBtn)
}

function todoList() {
  const render = (todos) => {
    todosWrapper.innerHTML = ""

    if (!todos.length) {
      append(todosWrapper, createElement("p", {children: "No TODOS yet"}))
      return
    }

    const allTodos = todos.map((todo) => append(createElement("li"), todoBox(todo)))
    append(todosWrapper, ...allTodos)
  }

  const todosWrapper = createElement("ul", {className: "todos"})
  subscribe(TODO_STORE, render)
  return todosWrapper
}

const root = document.getElementById("root")

createStore(TODO_STORE, [])
append(root, todoForm(), todoList())