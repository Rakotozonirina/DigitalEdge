const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const buildVerificationUrl = (req, verificationToken) =>
  `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;

const sendVerificationEmail = async (req, user, verificationToken) => {
  const verifyUrl = buildVerificationUrl(req, verificationToken);
  const message = `Bienvenue sur MahaTech ! \n\nVeuillez cliquer sur le lien suivant pour verifier votre adresse email et debloquer toutes les fonctionnalites de votre compte : \n\n ${verifyUrl}`;

  await sendEmail({
    email: user.email,
    subject: 'Verifiez votre compte MahaTech',
    message,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Cet email est deja utilise' });
    }

    const user = new User({
      name,
      email,
      password,
    });

    const verificationToken = user.getVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail(req, user, verificationToken);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
        message: 'Compte cree. Un email de verification vous a ete envoye.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur: Le compte a ete cree mais l'email n'a pas pu etre envoye" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verifie avec succes' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Votre email est deja verifie.' });
    }

    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(req, user, verificationToken);

    res.status(200).json({ message: 'Un nouvel email de verification a ete envoye.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'Aucun utilisateur trouve avec cet email' });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demande la reinitialisation de votre mot de passe. \n\n Faites une requete PUT vers: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reinitialisation de mot de passe',
        message,
      });

      res.status(200).json({ message: 'Email envoye' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "L'email n'a pas pu etre envoye" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expire' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: 'Mot de passe reinitialise avec succes',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
