import { NextApiRequest, NextApiResponse } from "next";
import JSZip from "jszip";
import dayjs from "dayjs";

interface Image {
  fileName: string;
  url: string;
  id: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const imageList = JSON.parse(req.query.imageList as string);

  const downloadPromises = await Promise.all(
    imageList.map(async (image: Image) => {
      const response = await fetch(image.url);
      const contentType = image.url.split(".").pop()?.toLocaleLowerCase();
      const buffer = await response.arrayBuffer();
      return { ...image, buffer, type: contentType };
    })
  );

  const zip = new JSZip();

  downloadPromises.forEach(async (download) => {
    const { fileName, buffer, type } = download;
    const displayName = fileName?.split("-IMG_")?.pop()?.split(".")[0];
    zip.file(`photopacer-IMG-${displayName}.${type}`, buffer);
  });

  const content = await zip.generateAsync({ type: "nodebuffer" });

  const fileName = "phohopacer_img_" + dayjs().format("YYYY-MM-DD") + ".zip";

  //下載檔案
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Length", content.length);
  res.status(200).end(content);
}
