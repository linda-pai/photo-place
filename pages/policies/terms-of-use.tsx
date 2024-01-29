import Link from "next/link";

const TermOfUse = () => {
  return (
    <div className="container mx-auto mt-24 text-[color:var(--main-color-dark)] sm:w-[65%] w-[90%]">
      <h1 className="text-center text-2xl my-6">使用者條款</h1>
      <div className="leading-9">
        非常歡迎您使用「 Photo Pacer 網站
        」（以下簡稱本網站），為了讓您能夠安心的使用本網站的各項服務與資訊，特此向您說明本網站的使用者條款，以保障您的權益，請您詳閱下列內容：
        <ol>
          <li className="my-4">
            <b className="text-xl">一、接受條款</b>
            <p className="pl-8">
              請仔細閱讀並確保您完全理解並同意本使用者條款。使用本網站即表示您接受這些條款的約束。如果您不同意這些條款，請勿使用本網站。
            </p>
            <p className="pl-8">
              若您為未滿二十歲或受監護宣告、輔助宣告，除應符合上述規定外，並應於您的家長（或監護人、輔助人）閱讀、瞭解並同意本條款之所有內容及其後修改變更後，方得使用或繼續使用本網站服務。當您使用或繼續使用本網站服務時，即視為您的家長（或監護人、輔助人）已閱讀、瞭解並同意接受本條款之所有內容及其後修改變更。
            </p>
          </li>
          <li className="my-4">
            <b className="text-xl">二、使用規則</b>
            <p className="pl-8">
              您承諾絕不為任何非法目的或以任何非法方式使用本網服務，您同意並保證不得利用本網服務從事侵害他人權益或違法之行為，包括但不限於：
            </p>
            <ul className="pl-8">
              <li className="before:content-['•'] before:mr-4 flex">
                <div>
                  製作任何違法、詐騙、滋擾、威脅、侮辱、違反公共秩序或善良風俗或其他不法之文字、圖片或任何形式的檔案於本網服務上。
                </div>
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                侵害他人名譽、隱私權、營業秘密、商標權、著作權、專利權、其他智慧財產權及其他權利。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                若您非相片本人，請勿將相片用於任何商業廣告，必須取得相片中人物的肖像權。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                以侵犯任何第三方的商標或其他知識產權或會導致欺騙性廣告或不正當競爭索賠的方式使用圖片。
              </li>
            </ul>
          </li>
          <li className="my-4">
            <b className="text-xl">三、內容所有權</b>
            <ul className="pl-8">
              <li className="before:content-['•'] before:mr-4 flex">
                本網站上的所有內容，包括但不限於文字、圖片、標誌、音頻、視頻等，均受到知識產權法保護。未經授權，禁止複製、修改、分發或以任何方式使用。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                如果您在本網站上提供任何用戶生成的內容，您同意授予本網站非獨家、全球性的使用權，包括修改、複製、分發等。
              </li>
            </ul>
          </li>
          <li className="my-4">
            <b className="text-xl">四、照片存取</b>
            <ul className="pl-8">
              <li className="before:content-['•'] before:mr-4 flex">
                本網站不保證所有相片永久提供相片存取服務。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                已出售之相片，本網站提供一年內有效存取。
              </li>
            </ul>
          </li>
          <li className="my-4">
            <b className="text-xl">五、退換貨須知</b>
            <ul className="pl-8">
              <li className="before:content-['•'] before:mr-4 flex">
                因產品為特定內容的性質，付費後系統立即提供下載，故我們無法提供退款、退換貨。請在確認付款前確保您已經仔細檢查所選擇的照片。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                本網站保有最終退換貨與否之決定權及規則更改權利。
              </li>
            </ul>
          </li>
          <li className="my-4">
            <b className="text-xl">六、購買流程</b>
            <ul className="pl-8">
              <li className="before:content-['•'] before:mr-4 flex">
                本網站提供相片原始電子檔下載，買家得以支付一定費用的方式，取得所選照片的電子檔。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                使用本服務購買照片時，本網站將列明相關的付費項目和金額，在您確認訂單內容無誤後，您將被引導至第三方支付頁面。完成付款後，即可至您的訂單查詢頁面，點擊照片以獲取所選照片的原始電子檔。
              </li>
              <li className="before:content-['•'] before:mr-4 flex">
                如在下載過程中遇到任何技術問題，請聯繫我們的
                <a href="mailto:photopacer@gmail" className="text-[#4285f4]">
                  客服信箱
                </a>
                及
                <a
                  href="https://lin.ee/n4xOm2O"
                  target="_blank"
                  className="text-[#4285f4]"
                >
                  官方Line帳號
                </a>
                以獲得協助。
              </li>
            </ul>
          </li>
          <li className="my-4">
            <b className="text-xl">七、免責聲明</b>
            <p className="pl-8">
              本網站不對因使用本網站而導致的任何損失或損害負責，包括但不限於直接或間接損失、收入損失、商譽損失等。
            </p>
          </li>
          <li className="my-4">
            <b className="text-xl">八、隱私權政策</b>
            <p className="pl-8">
              請參閱我們的
              <Link href="/policies/privacy-policy" className="text-[#4285f4]">
                隱私權政策
              </Link>
              以瞭解我們如何收集、使用和分享您的個人信息。
            </p>
          </li>
          <li className="my-4">
            <b className="text-xl">九、修改和終止</b>
            <p className="pl-8">
              我們保留隨時修改或終止本使用者條款的權利，修改將通過在本網站上發佈更新的條款生效。您繼續使用本網站將被視為接受修改後的條款。
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TermOfUse;
