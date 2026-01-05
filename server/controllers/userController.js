const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { Resend } = require('resend');
const generateToken = require('../utils/generateToken');
const verifyRecaptcha = require('../utils/verifyRecaptcha');
const User = require('../models/User');
const Product = require('../models/Product');

const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    // Vérifier le token reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
        res.status(400);
        throw new Error('Captcha invalide. Veuillez réessayer.');
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(403);
            throw new Error('Votre compte n\'est pas vérifié. Veuillez vérifier votre email avant de vous connecter.');
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, recaptchaToken } = req.body;

    // Vérifier le token reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
        res.status(400);
        throw new Error('Captcha invalide. Veuillez réessayer.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Générer un token de vérification unique
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        verificationToken,
        isVerified: false,
    });

    if (user) {
        // Envoyer l'email de vérification
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
        
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Vérifiez votre compte E-perfume',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Bienvenue sur E-perfume !</h2>
                        <p>Bonjour ${name},</p>
                        <p>Merci de vous être inscrit sur E-perfume. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
                        <p style="margin: 30px 0;">
                            <a href="${verifyUrl}" style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Vérifier mon compte
                            </a>
                        </p>
                        <p>Ou copiez ce lien dans votre navigateur :</p>
                        <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
                        <p style="margin-top: 30px; color: #666; font-size: 12px;">
                            Si vous n'avez pas créé de compte sur E-perfume, vous pouvez ignorer cet email.
                        </p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // On ne bloque pas l'inscription si l'email échoue
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user && user.wishlist) {
        res.json(user.wishlist);
    } else {
        res.json([]);
    }
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const product = await Product.findById(req.params.productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (!user.wishlist.includes(req.params.productId)) {
        user.wishlist.push(req.params.productId);
        await user.save();
    }

    res.json({ message: 'Product added to wishlist' });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
        (productId) => productId.toString() !== req.params.productId
    );
    await user.save();

    res.json({ message: 'Product removed from wishlist' });
});

// @desc    Verify user email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        res.status(400);
        throw new Error('Token de vérification invalide ou expiré');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' });
});

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    getUsers,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    verifyEmail,
};
