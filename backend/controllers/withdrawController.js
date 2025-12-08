import axios from "axios";

export const withdraw = async (req, res) => {
  try {
    const {
      api_key,
      currency_code,
      bank_code,
      receive_account_number,
      receive_account_name,
      amount,
      description,
    } = req.body;

    const response = await axios.post(
      "https://thenapvip.com/api/client/withdraw",
      {
        api_key,
        currency_code,
        bank_code,
        receive_account_number,
        receive_account_name,
        amount,
        description,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi rút tiền",
      error: error.response?.data || error,
    });
  }
};
