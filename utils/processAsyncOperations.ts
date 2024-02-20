const asyncOperation = async (index: any, func: any) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await func();
      resolve(`Result for ${index}`);
    }, 100); // Simulating a 100ms delay
  });
};

const processAsyncOperations = async (
  fileOptionsList: any[],
  func: any,
  handleOnFinishAll: () => void
) => {
  try {
    const processedResults = [];
    for (let index = 0; index < fileOptionsList.length; index++) {
      const result = await asyncOperation(index, () => func(index));
      processedResults.push(result);
    }
    if (processedResults.length === fileOptionsList.length) handleOnFinishAll();
  } catch (error) {
    console.error(error);
  }
};

export default processAsyncOperations;
