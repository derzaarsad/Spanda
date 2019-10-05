'use strict'

module.exports = class {
  constructor() {
    this.busy = false
    this.queue = []
  }

  synchronize(task) {
    return new Promise((resolve, reject) => {
      this.queue.push([task, resolve, reject])

      if (!this.busy) {
        this.dequeue()
      }
    })
  }

  dequeue() {
    this.busy = true
    const next = this.queue.shift()

    if (next) {
      this.execute(next)
    } else {
      this.busy = false
    }
  }

  execute(record) {
    const task = record[0]
    const resolve = record[1]
    const reject = record[2]

    task()
      .then(resolve, reject)
      .then(() => {
        this.dequeue()
      })
  }
}
