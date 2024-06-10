const authMiddleware = (req, res, next) => {
    
    if ( ! req.session.accountId) {
        return res.redirect('/login');
    }

    next();
};

module.exports = authMiddleware;