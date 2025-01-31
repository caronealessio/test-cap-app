module.exports = (srv) => {
  srv.on("toInteger", (req) => {
    const { value } = req.data;

    return { value: parseInt(value) };
  });
};
