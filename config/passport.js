const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/userSchema');
require('dotenv').config();
console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:1906/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Check if user exists by email
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await User.findOne({ email });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.name = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
                    await user.save();
                } else {
                    // Create new user
                    user = new User({
                        name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
                        email,
                        googleId: profile.id
                    });
                    await user.save();
                }
            }
        } else {
            // Update name if needed
            user.name = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        console.error('Google auth error:', err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error('Deserialize error:', err);
        done(err, null);
    }
});




// const GoogleStrategy = require('passport-google-oauth2').Strategy;
// console.log(process.env.GOOGLE_CLIENT_SECRET)
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "https:localhost:1906/auth/google/callback",
//     passReqToCallback: true
// },
//     function (request, accessToken, refreshToken, profile, done) {
//         done(null, profile)
//     }
// ))

// passport.serializeUser((user, done) => {
//     done(null, user)
// })

// passport.deserializeUser((user, done) => {
//     done(null, user)
// })

// const success = async (req, res) => {
//     req.session.user = req.user
//     req.session.google=req.user
//     const password = req.user.id;

//     function MobileGenerator() {
//         return Math.floor(1000000000 + Math.random() * 9000000000);
//     }
//     const mobile = MobileGenerator();
//     const Already = await User.findOne({ email: req.user.email })

//     const refferalcode = generateRandomString(9)
//     const s = await User.findOne({ email: req.user.email })
   
//     if (!Already) {
//         var Signup = new User({
//             name: req.user.displayName,
//             email: req.user.email,
//             password: password,
//             refferalcode: refferalcode

//         });
//         // req.session._id = password._id,
//         req.session.email = req.user.email
//         req.session.name = req.user.displayName
//         req.session.user = Signup;
//         const n = await Signup.save();
//         const New = await User.findOne({ email: req.session.email })
//         req.session._id = New._id;
        
//         console.log(req.session.mobile,'req.seidnflsdf')
//         res.redirect('/')
//     }
//     else {

//         if (Already.is_delete == true) {

//             res.redirect('/login')
//         }
//         else {
//             req.session.mobile=s.mobile
//             req.session.email = s.email
//             req.session._id = s._id;
//             req.session.name = s.name
//             req.session.user = s;
//             console.log(req.session.mobile,'mobile')
//             res.redirect('/')
//         }
//     }
// }
module.exports = passport;
