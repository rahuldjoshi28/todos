export const Storage = {
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