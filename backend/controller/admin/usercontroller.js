const User = require("../../model/usermodel");

exports.getUserStats = async (req, res) => {

  const totalUsers = await User.countDocuments();

  const suspendedUsers = await User.countDocuments({
    isblocked: true
  });
  const activeUsers = await User.countDocuments({
        lastlogin: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      });

  const newUsersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setDate(1))
    }
  });

  res.json({
    totalUsers,
    suspendedUsers,
    activeUsers,
    newUsersThisMonth
  });

};

exports.getUsersList = async (req, res) => {

  const users = await User.find().sort({ name: 1, createdAt: 1 });

  res.json(users);

};
