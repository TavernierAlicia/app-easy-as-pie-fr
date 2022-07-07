window.app.routes = [
    {
        path: '', 
        ctrl: 'home',
        isAuth: true
    },{
        path: 'cart', 
        ctrl: 'cart',
        isAuth: true
    },{
        path: 'status', 
        ctrl: 'status',
        isAuth: true
    },{
        path: 'qr/:token', 
        ctrl: 'qr',
        isAuth: false
    },{
        path: '(.*)', 
        ctrl: 'page404',
        isAuth: false
    }
];

window.app.loadRouter = _ => {

    const controllers = app.controllers;

    let titleSetted = false;

    const options = {
        context: {
            user_token: _ => localStorage.getItem('user_token') || null,
            order_id: _ => localStorage.getItem('order_id') || null,
            prev_ctrl: null,
            back: false,
            data: {}
        },
        baseUrl: '/',
        resolveRoute(context, params) {

            if (context.route.ctrl && controllers[context.route.ctrl]) {

                if (context.route.ctrl == "qr") {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('order_id');
                }
                if (context.route.isAuth && !context.user_token()) return app.router.resolve('/redirect');
                if (context.order_id() && context.route.ctrl != "status") return app.router.resolve('/status');

                if (context.prev_ctrl == context.route.ctrl) return;

                // Destroy previous controller
                if (app.current.destroy) {
                    app.current.destroy();
                }
                context.prev_ctrl = context.route.ctrl;
                
                // Update url
                if (context.pathname != window.location.pathname && !context.back) {
                    window.history.pushState({}, context.pathname, window.location.origin + context.pathname + window.location.search);
                }
                
                // Reinitialize back trigger
                context.back = false;

                document.body.className = context.route.ctrl;

                window.app.current = controllers[context.route.ctrl]();

                return app.current.init(context, params);
            }
            return undefined;
        },
        errorHandler(error, context) {}
    };
    
    window.app.router = new UniversalRouter(app.routes, options);
    app.router.resolve(location.pathname);

    window.onpopstate = ev => {
        app.router.resolve(ev.target.location.pathname, {back: true});
    };
}

window.onload = window.app.loadRouter;