const customLoader = ({ src, width, height, quality }: any) => {
  return `${src}?w=${width}&h=${height}&q=${quality || 75}`;
};

export default customLoader;
