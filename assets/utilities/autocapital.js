const capitalizeFirstLetter = (str = "") => {
  if (str != "") return str[0]?.toUpperCase() + str?.substring(1);
  return str;
};

export default capitalizeFirstLetter;
