import DeliveryOption from "../models/DeliveryOption.js";

const getAllDeliveryOptions = async (req, res, next) => {
  try {
    const { expand } = req.query;
    const deliveryOptions = await DeliveryOption.find().select("-_id").lean();

    if (expand === "estimatedDeliveryTime") {
      const deliveryOptionsWithTime = deliveryOptions.map((option) => ({
        ...option,
        estimatedDeliveryTimeMs:
          Date.now() + option.deliveryDays * 24 * 60 * 60 * 1000,
      }));

      return res.status(200).json(deliveryOptionsWithTime);
    }

    res.status(200).json(deliveryOptions);
  } catch (error) {
    next(error);
  }
};

export default { getAllDeliveryOptions };
