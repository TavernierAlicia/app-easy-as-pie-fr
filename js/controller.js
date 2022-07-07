import home         from '/js/controllers/home.js';
import cart         from '/js/controllers/cart.js';
import page404      from '/js/controllers/page404.js';
import qr           from '/js/controllers/qr.js';
import status       from '/js/controllers/status.js';

window.app.current = {};

window.app.controllers = {
    cart:       cart,
    home:       home,
    page404:    page404,
    qr:         qr,
    status:     status
};


