const downloadImage = async (url: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default downloadImage;
