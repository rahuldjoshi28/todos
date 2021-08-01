import {Storage} from "./storage.js"

const store = {}

export function createStore(name, initialValue) {
  store[name] = {
    state: initialValue,
    listeners: []
  }
}

export function subscribe(name, onChange) {
  store[name].listeners.push(onChange)
  setTimeout(() => onChange(store[name].state))
}

export function update(name, updator) {
  store[name].state = updator(store[name].state)

  Storage.setItem(name, store[name].state)

  store[name].listeners.forEach(listener => listener(store[name].state))
}