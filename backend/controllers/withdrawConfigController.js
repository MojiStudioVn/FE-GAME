import WithdrawConfig from "../models/WithdrawConfig.js";

export const saveWithdrawConfig = async (req, res) => {
  try {
    const { provider, api_key, withdraw_fee, coin_rate } = req.body;
    let config = await WithdrawConfig.findOne();
    if (!config) {
      config = await WithdrawConfig.create({
        provider,
        api_key,
        withdraw_fee,
        coin_rate,
      });
    } else {
      config.provider = provider;
      config.api_key = api_key;
      config.withdraw_fee = withdraw_fee;
      config.coin_rate = coin_rate;
      await config.save();
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
