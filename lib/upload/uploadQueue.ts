export default class UploadQueue {
  private queue: File[];
  private isProcessing: boolean;
  private retryFunction: (file: any) => Promise<void>;
  private retryLimit: number;
  private retryDelay: number;

  constructor(retryFunction: (file: any) => Promise<void>) {
    this.queue = [];
    this.isProcessing = false;
    this.retryFunction = retryFunction;
    this.retryLimit = 3;
    this.retryDelay = 8000;
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
        console.error("Upload failed, will retry:", file?.name);
        // Add file back to the queue for retry
        this.queue.push(file as File);
      }
    }
    this.isProcessing = false;
  }

  private async uploadBatch(batch: File): Promise<void> {
    let attempts = 0;
    let uploadSuccess = false;

    while (!uploadSuccess && attempts < this.retryLimit) {
      try {
        await this.retryFunction(batch);
        uploadSuccess = true; // Upload successful
      } catch (error) {
        console.error(
          `Upload failed. Retrying in ${this.retryDelay} milliseconds...`
        );
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay)); // Delay before retry
      }
    }

    if (!uploadSuccess) {
      console.error(`Upload failed after ${this.retryLimit} attempts.`);
      // Handle failure after retry attempts
    }
  }
}
