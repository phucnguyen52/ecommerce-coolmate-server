const { Provider } = require("../model/provider");

const createProvider = async (data) => {
  try {
    const check = await Provider.findOne({
      where: {
        fullname: data.fullname,
        address: data.address,
      },
    });
    if (check) {
      return -1;
    }
    await Provider.create(data);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getAllProvider = async () => {
  try {
    const provider = await Provider.findAll();
    return provider;
  } catch (error) {
    console.log(error);
  }
};

const deleteProvider = async (id) => {
  try {
    const provider = await Provider.findByPk(id);
    await provider.destroy();
  } catch (error) {
    console.log(error);
  }
};

const putProvider = async (id, data) => {
  try {
    const provider = await Provider.findByPk(id);
    provider.update(data);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  createProvider,
  getAllProvider,
  putProvider,
  deleteProvider,
};
