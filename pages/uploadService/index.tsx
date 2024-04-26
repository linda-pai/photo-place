import React, { useState } from "react";
import { Button, Checkbox } from "antd";
import { useRouter } from "next/navigation";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import userPermission from "@/hooks/usePermission";

const UploadBreadcrumb = dynamic(
  () => import("@/components/UploadBreadcrumb"),
  {
    loading: () => <Spin />,
  }
);

const uploadService = () => {
  const isAllowed = userPermission();
  const [checked, setChecked] = useState(false);

  const router = useRouter();

  const onChange = (e: any) => {
    setChecked(e.target.checked);
  };

  return (
    <>
      <Head>
        <title>上傳服務說明 - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="上傳服務說明" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/uploadService`}
        />
      </Head>
      {isAllowed ? (
        <div className="container mx-auto mt-24 px-4 text-[color:var(--main-color-dark)]">
          <UploadBreadcrumb />
          <div className="mx-auto sm:w-[65%] w-[90%]">
            <h1 className="text-center text-2xl my-6">上傳服務說明</h1>
            <div className="leading-9">
              非常歡迎您使用「 Photo Pacer 攝影小隊 網站
              」（以下簡稱本網站），為了讓您能夠安心的使用本網站的各項服務與資訊，特此向您說明上傳服務，以保障您的權益，請您詳閱下列內容：
              <ol>
                <li className="my-4">
                  <b className="text-xl">一、上傳照片</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      選擇賽事，如果沒有您所拍攝的賽事，請透過Line官方帳號或客服信箱聯絡我們新增賽事相簿。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      僅供兩週內的賽事，超過兩週的賽事將不提供上傳服務。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      攝影師可於上傳照片時，自行設定照片售價。
                    </li>
                  </ul>
                  <b className="text-xl">二、照片格式</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      支援的格式：JPEG、JPG、PNG。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      最大檔案大小：20 MB
                    </li>
                  </ul>
                  <b className="text-xl">三、上傳進度</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      上傳流程包含照片上傳、偵測號碼布、上浮水印等步驟，尚未完成前請勿關閉瀏覽器。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      上傳速度會因網路狀況而有所不同，請耐心等候或盡量在網路狀況良好時上傳。
                    </li>
                  </ul>
                  <b className="text-xl">四、已上傳照片</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      您可以到「攝影師成就」查看已上傳的照片，並可進行檢查號碼布、加入精選或刪除等操作。
                    </li>
                  </ul>
                  <b className="text-xl">五、照片保存期限</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      照片將保存三個月，三個月後將會自動刪除或進行壓縮，僅保留精選照片。
                    </li>
                  </ul>
                  <b className="text-xl">六、費用</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      上傳照片需支付每張0.4元的費用，如有優惠活動將另行通知。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      於照片售出時，將扣除攝影師自訂照片售價之3%，為金流費用。
                    </li>
                  </ul>
                  <b className="text-xl">七、收益與結算</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      當攝影師的照片售出時，平台將同步寄送售出通知信給攝影師。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      平台將從照片收益中扣除服務費和金流費用，於次月5日結算給攝影師。
                    </li>
                  </ul>
                  <b className="text-xl">七、檢舉機制</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      請勿上傳侵犯版權或其他法律權利的照片。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      請勿上傳色情、暴力或任何可能傷害他人或誤導他人的照片。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      如果您被檢舉違反服務條款，經查證屬實，將被停權。
                    </li>
                  </ul>
                  <b className="text-xl">八、其他注意事項</b>
                  <ul className="pl-8">
                    <li className="before:content-['•'] before:mr-4 flex">
                      上傳費用和金流費用可能會有所變動，請以網站公告為準。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      本網站保留隨時更改服務條款和細則的權利。
                    </li>
                    <li className="before:content-['•'] before:mr-4 flex">
                      以上如有任何問題或疑慮，請透過Line官方帳號或客服信箱聯絡我們，謝謝！
                    </li>
                  </ul>
                </li>
              </ol>
              <div className="text-center my-20">
                <div>
                  <Checkbox checked={checked} onChange={onChange}>
                    <div className="flex">
                      <p className="text-orange-600">*</p>
                      <p className="text-base text-[color:var(--main-color-dark)]">
                        我已閱讀並同意服務條款
                      </p>
                    </div>
                  </Checkbox>
                </div>

                <Button
                  onClick={() => {
                    router.push("/uploadService/chooseEvent");
                  }}
                  className="my-6"
                  disabled={!checked}
                >
                  下一步
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default uploadService;
