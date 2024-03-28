export default class UploadQueue {
  private queue: File[];
  private isProcessing: boolean;
  private retryFunction: (file: any) => Promise<any>;
  private name: string;
  private retryLimit: number;
  private retryDelay: number;
  private isRetrying: boolean = false;

  constructor(name: string, retryFunction: (file: any) => Promise<any>) {
    this.queue = [];
    this.isProcessing = false;
    this.retryFunction = retryFunction;
    this.name = name;
    this.retryLimit = 3;
    this.retryDelay = 10000;
    this.isRetrying = false;
  }

  enqueue(file: File[]): void {
    this.queue.push(...file);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const file = this.queue.shift();
      try {
        await this.uploadBatch(file as any);
      } catch (error) {
        console.error(`${this.name} failed, will retry:`, file?.name);
        // Add file back to the queue for retry
        this.queue.push(file as File);
      }
    }
    this.isProcessing = false;
  }

  private async uploadBatch(batch: File): Promise<void> {
    if (this.isRetrying) {
      return;
    }

    this.isRetrying = true;

    let attempts = 0;
    let uploadSuccess = false;

    while (!uploadSuccess && attempts < this.retryLimit) {
      try {
        await this.retryFunction(batch);
        uploadSuccess = true; // Upload successful
        console.log(`${this.name}  succeeded:`, batch.name);
      } catch (error) {
        console.error(
          `${this.name} ${batch.name} ${attempts} times failed. Retrying in ${this.retryDelay} milliseconds...`
        );
        attempts++;
        //TODO: Bug: 這邊會一次呼叫3次
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }
    if (!uploadSuccess) {
      console.error(
        `${this.name} ${batch.name} failed after ${this.retryLimit} attempts.`
      );
      // Handle failure after retry attempts

      this.isRetrying = false;
    }
  }
}
