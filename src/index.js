import {append, createElement, Events} from "./append.js";
import {createStore, subscribe, update} from "./store.js";
import {Storage} from "./storage.js";

function UUID(initialCounter) {
  let counter = initialCounter
  return () => {
    counter++
    return counter
  }
}

const TODO_STORE = "todo"

function createIconButton(iconName, props, events) {
  const iconEl = createElement("i", {className: `fa fa-${iconName}`})
  const button = createElement("button", props, events)

  return append(button, iconEl)
}

function createTodoForm(initialValue = "", handleSubmit) {
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

function createEditModal(todo) {
  const onSubmit = newTodo => {
    update(TODO_STORE, todos => todos.map(itr => {
      if (itr.id === todo.id) return {...itr, text: newTodo.text}
      return itr
    }))
  }

  const cancelButton = createIconButton("window-close", {className: "modal-close"}, {[Events.CLICK]: () => overlay.remove()})
  const modal = createElement("div", {className: "modal"})
  const overlay = createElement("div", {className: "overlay"})

  return append(overlay, append(modal, cancelButton, createTodoForm(todo.text, onSubmit)))
}

function createDeleteTodoButton(todo) {
  const deleteTODO = () => {
    update(TODO_STORE, todos => todos.filter(({id}) => id !== todo.id))
  }
  return  createIconButton("trash", {className: "delete-button"}, {[Events.CLICK]: deleteTODO})
}

function createTodo(todo) {
  const openEditModal = () => {
    card.appendChild(createEditModal(todo))
  }

  const deleteBtn = createDeleteTodoButton(todo)

  const editBtn = createIconButton("edit", {className: "edit-button"}, {[Events.CLICK]: openEditModal})
  const card = createElement("article", {children: todo.text, className: "todo"})
  return append(card, editBtn, deleteBtn)
}

function createTodoList() {
  const render = (todos) => {
    todosWrapper.innerHTML = ""

    if (!todos.length) {
      append(todosWrapper, createElement("p", {children: "No TODOS yet"}))
      return
    }

    const allTodos = todos.map((todo) => append(createElement("li"), createTodo(todo)))
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

const getUUID = UUID(initialTodos.length ? initialTodos[initialTodos.length - 1].id : 0)

append(root, createTodoForm("", addTodo), createTodoList())