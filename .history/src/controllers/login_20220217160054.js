const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../utils/jwt");
const joi = require("joi");
const login = async (req, res) => {
  const { email, password } = req.body;

  //validate user input
  if (
    joi.string().email().validate(email).error ||
    joi.string().min(1).validate(password).error
  )
    return res.status(400).json({
      errors: [{ msg: "Email or password cannot be empty or invalid" }],
    });

  //Check if the user doesnt exist

  let user = await User.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ errors: [{ msg: "User donesnt exist, please create one" }] });
  }

  //hash user document's password with method defined in user model
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
  }

  const payload = {
    user: {
      id: user.id,
    },
  };
  const token = generateToken(payload);

  res.json({ TOKEN: token });
};
const getuser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sercer Error");
  }
};
module.exports = { login };
