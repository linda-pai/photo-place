import { DownloadOutlined } from "@ant-design/icons";

const ImageItemDisplay = ({ item, onClick }: any) => {
  return (
    <div
      className="relative group cursor-pointer"
      key={item.id}
      onClick={onClick}
    >
      <div className="w-24">
        <img
          src={item.watermarkedUrl}
          className="w-full object-contain"
          alt={item.id}
        />
      </div>
      <div className="group-hover:visible invisible">
        <div className="bg-black opacity-50 absolute top-0 w-full h-full "></div>
        <div className="animate-bounce z-20 text-white text-xl absolute top-[40%] left-[40%]">
          <DownloadOutlined />
        </div>
      </div>
    </div>
  );
};
export default ImageItemDisplay;
