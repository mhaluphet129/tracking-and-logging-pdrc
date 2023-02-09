const changeTitle = (data) => {
  let flag = false;

  return setInterval(() => {
    flag = !flag;
    document.title = flag
      ? data.title
      : "PDRC - Visitor Tracking and Logging System";
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        flag
          ? data.metaDescription
          : "This system develop to help PDRC staff to manage visitor data and information."
      );
  }, 1000);
};

export default changeTitle;
