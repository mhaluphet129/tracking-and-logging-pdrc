const gen = (id, len) => {
  if (id != undefined && id != null && id?.length > 0)
    return id.substr(id.length - len, len);
  else return "1234";
};

export default gen;
