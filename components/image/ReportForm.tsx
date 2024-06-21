import { Radio } from "antd";
import { REPORT_TYPE } from "@/constants";

const ReportForm = ({ setReportType }: any) => {
  const reportTypes = [
    { label: "照片涉及色情或暴力", value: REPORT_TYPE.PORNOGRAPH },
    { label: "照片涉及仇恨或惡意", value: REPORT_TYPE.HATEFUL },
    { label: "照片涉及騷擾", value: REPORT_TYPE.HARASSMENT },
    { label: "照片侵權或爭議", value: REPORT_TYPE.INFRINGEMENT },
  ];

  const handleChange = (e: any) => {
    setReportType(e.target.value);
  };

  return (
    <Radio.Group className="flex flex-col gap-2" onChange={handleChange}>
      {reportTypes.map((type) => (
        <div>
          <Radio key={type.value} value={type.value}>
            {type.label}
          </Radio>
        </div>
      ))}
    </Radio.Group>
  );
};

export default ReportForm;
