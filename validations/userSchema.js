import Joi from "joi";

// --- Joi Schemas for Input Validation ---

const userSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(6).max(50).required(), // Password will be hashed
});

const channelSchema = Joi.object({
  channel_name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(250).allow("").optional(),
  channel_owner_id: Joi.number().integer().positive().required(),
});

const messageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  author_id: Joi.number().integer().positive().allow(null).optional(), // Can be null if anonymous
  channel_id: Joi.number().integer().positive().required(),
});

const subscriptionSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  channel_id: Joi.number().integer().positive().required(),
});

export { userSchema, channelSchema, messageSchema, subscriptionSchema };
