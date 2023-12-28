const scrollIntoViewWithOffset = (selector: any, offset: number) => {
  if (!selector) return;
  window.scrollTo({
    behavior: "smooth",
    top:
      document.querySelector(selector).getBoundingClientRect().top -
      document.body.getBoundingClientRect().top -
      offset,
  });
};

export default scrollIntoViewWithOffset;
