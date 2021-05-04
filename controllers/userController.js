const User = require('../models/userModel');
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image, please upload only images', 400), false)
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.uploadUserPhoto = upload.single('photo')
exports.getAllUsers = factory.getAll(User);
exports.createUser = (req, res ) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not implement yet and not be - please use POST /signUp instead'
  });
}
exports.updateMe = async (req, res, next ) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route not password updates, please use /updatePassword.', 400)
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  })
};
exports.getMe = async (req, res, next ) => {
  req.params.id = req.user.id
  next();
};
exports.deleteMe = catchAsync(async (req, res, next ) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(402).json({
    status: 'success',
    data: null,
  })
});
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
