const User = require("../model/usermodel");
const bcrypt = require("bcryptjs");
const { getBillingDetails } = require("../utils/billing");

const { generatetoken } = require("../utils/generateToken");
const { none } = require("../middlewere/resumeuploadmiddlewere");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedpassword,
      role: "user",
    });

    const token = generatetoken(user);
    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    });
    res
      .status(201)
      .json({ message: "User registered Successfully", role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credential" });

    if (user.isblocked) {
      return res.status(403).json({ message: "User blocked" });
    }

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(400).json({ message: "Invalid credential" });
    }

    const token = generatetoken(user);

    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    });

    user.lastlogin = new Date();
    await user.save();

    res.status(200).json({
      message: "Login successfully",
      role: user.role,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("accesstoken");
  res.status(200).json({ message: "Logged Out successfully" });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const billingDetails = await getBillingDetails(user);
    res.status(200).json({
      ...user.toObject(),
      billingDetails,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateprofile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changepassword = async (req, res) => {
  try {
    const { currentpassword, newpassword, confirmpassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const ismatch = await bcrypt.compare(currentpassword, user.password);

    if (!ismatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({ message: "Password do not match" });
    }

    if (newpassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedpassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedpassword;

    await user.save();
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
