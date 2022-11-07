const gen = (id, len) => {
  return id.substr(id.length - (len + 1), len);
};

export default gen;
