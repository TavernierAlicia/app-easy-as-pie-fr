export default function qr() {
    
    let token = null;
    
    const init = (context, params) => {
        token = context.params.token;
        let etab_token = localStorage.getItem('etab_token');
        if (token != etab_token) {
            localStorage.clear();
        }
        localStorage.setItem('etab_token', token)
        login();
        return true;
    };

    const login = _ => {
        return app.services.http(true).post('/qr/' + token)
            .then(res => localStorage.setItem('user_token', res))
            .then(_ => app.router.resolve('/'))
            .catch(_ => app.router.resolve('/redirect'))
    };

    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy

    }


}