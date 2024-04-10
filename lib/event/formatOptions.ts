import dayjs from "dayjs";

const formatOptions = (eventOption: any) => {
  const removeDuplicate = (arr: any) => {
    return arr.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => t.value === v.value) === i
    );
  };
  const years = eventOption.map(
    (event: { date: string; eventName: string; eventId: string }) => {
      return {
        value: dayjs(event.date).format("YYYYMM"),
        title: dayjs(event.date).format("YYYY年MM月"),
        children: [],
      };
    }
  );

  const yearsData = removeDuplicate(years);

  const months = eventOption.map(
    (event: { date: string; eventName: string; eventId: string }) => {
      return {
        value: dayjs(event.date).format("M"),
        title: dayjs(event.date).format("M月"),
        children: [],
      };
    }
  );
  const monthsData = removeDuplicate(months);

  eventOption.forEach(
    (event: { date: string; eventName: string; eventId: string }) => {
      const yearIndex = yearsData.findIndex(
        (year: { value: string }) =>
          year.value === dayjs(event.date).format("YYYYMM")
      );
      const monthIndex = monthsData.findIndex(
        (month: { value: string }) =>
          month.value === dayjs(event.date).format("M")
      );
      yearsData[yearIndex].children.push({
        value: event.eventId,
        title: event.eventName,
        date: event.date,
      });
      monthsData[monthIndex].children.push({
        value: event.eventId,
        title: event.eventName,
        date: event.date,
      });
    }
  );

  return yearsData;
};

export default formatOptions;
