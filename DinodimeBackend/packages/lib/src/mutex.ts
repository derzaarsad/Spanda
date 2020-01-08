type Job = {
  task: () => Promise<void>;
  resolve: (result?: any) => void;
  reject: (err?: any) => void;
};

export class Mutex {
  private busy: boolean;
  private queue: Array<Job>;
  constructor() {
    this.busy = false;
    this.queue = [];
  }

  synchronize(task: () => Promise<void>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task: task,
        resolve: resolve,
        reject: reject
      });

      if (!this.busy) {
        this.dequeue();
      }
    });
  }

  private dequeue() {
    this.busy = true;
    const next = this.queue.shift();

    if (next) {
      this.execute(next);
    } else {
      this.busy = false;
    }
  }

  private execute(record: Job) {
    record
      .task()
      .then(record.resolve, record.reject)
      .then(() => {
        this.dequeue();
      });
  }
}
