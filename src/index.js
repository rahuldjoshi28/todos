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

  Storage.setItem(TODO_STORE, store[name].state)

  store[name].listeners.forEach(listener => listener(store[name].state))
}

const Storage = {
  getItem(name) {
    const item = localStorage.getItem(name)
    if (item) {
      return JSON.parse(item)
    }
    return undefined
  },
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

function UUID() {
  let counter = 0
  return () => {
    counter++
    return counter
  }
}

// ---

const TODO_STORE = "todo"

const getUUID = UUID()

function iconButton(iconName, props, events) {
  const iconEl = createElement("i", {className: `fa fa-${iconName}`})
  const button = createElement("button", props, events)

  return append(button, iconEl)
}

function todoForm(initialValue = "", handleSubmit) {
  const onSubmit = e => {
    const todoText = textArea.value
    handleSubmit({text: todoText, id: getUUID()})
    textArea.value = ""
    e.preventDefault()
  }

  const textArea = createElement("textarea", {
    className: "todo-input",
    placeholder: "Please enter todo here...",
    value: initialValue,
    required: true
  })
  const submitButton = createElement("button", {className: "button", type: "submit", children: "Add"})
  const form = createElement("form", {className: "todo-form"}, {[Events.SUBMIT]: onSubmit})

  return append(form, textArea, submitButton)
}

function editModal(todo) {
  const editTodo = newTodo => {
    update(TODO_STORE, todos => todos.map(itr => {
      if (itr.id === todo.id) return {...itr, text: newTodo.text}
      return itr
    }))
  }

  const cancelButton = iconButton("window-close", {className: "modal-close"}, {[Events.CLICK]: () => overlay.remove()})
  const modal = createElement("div", {className: "modal"})
  const overlay = createElement("div", {className: "overlay"})

  return append(overlay, append(modal, cancelButton, todoForm(todo.text, editTodo)))
}

function todoBox(todo) {
  const deleteTODO = () => {
    update(TODO_STORE, todos => todos.filter(({id}) => id !== todo.id))
  }
  const openEditModal = () => {
    card.appendChild(editModal(todo))
  }

  const deleteBtn = iconButton("trash", {className: "delete-button"}, {[Events.CLICK]: deleteTODO})
  const editBtn = iconButton("edit", {className: "edit-button"}, {[Events.CLICK]: openEditModal})
  const card = createElement("article", {children: todo.text, className: "todo"})
  return append(card, editBtn, deleteBtn)
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

function addTodo(newTodo) {
  update(TODO_STORE, todos => [...todos, newTodo])
}

const initialTodos = Storage.getItem(TODO_STORE)
createStore(TODO_STORE, initialTodos || [])
append(root, todoForm("", addTodo), todoList())