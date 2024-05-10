import { message } from "antd";

import { sha256 } from "js-sha256";

const getAuthorDisplayName = async (author: string) => {
  return await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/photographer/getDisplayName/${author}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + author,
        secret: sha256(author + process.env.NEXT_PUBLIC_SALT),
      },
    }
  ).then((res) => res.json());
};

const setAuthorDisplayName = (author: string, displayName: string) => {
  if (!author || !displayName) message.error("請輸入攝影師名稱");
  fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/photographer/setDisplayName`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + author,
        secret: sha256(author + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({
        author,
        displayName,
      }),
    }
  ).then((res) => res.json());
};

export { getAuthorDisplayName, setAuthorDisplayName };
