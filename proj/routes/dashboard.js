var express = require('express');
var router = express.Router();

// this API redirect the user to dash board
router.get('/', (req, res) => {
    res.render('dashboard', { menuBlockHeader : 'DashBoard', 
                menuBlockMesg1 : 'Welcome!', 
                menuBlockMesg2 : 'You are our first new user!'});
    // This following code will not work
    // instead we should 
    //      for each resource in dashboard(protected page)
    //      we check whether we have permission (by in client side, we send tokens and verify it in server side)
    //      then we give corresponding resources back to user


    // Check if the Authorization header is present and contains a valid token
    // const authHeader = req.headers.authorization;
    // console.log(req.headers.authorization);
    // if (authHeader) {
    //     const token = authHeader.split(' ')[1];
    //     jwt.verify(token, secretKey, (err, decoded) => {
    //         if (err) {
    //             res.status(401).json({ success: false, message: 'Invalid token' });
    //         } else {

                
    //         }
    //     });
    // } else {
    //     // soft failure for auto-generated GET
    //     // It can prevents attack to force oursite to dashboard
    //     res.json({ success: false, message: 'Authorization header missing' });
    // }
});



module.exports = router;

