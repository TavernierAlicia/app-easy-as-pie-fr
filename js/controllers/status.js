export default function status() {

    let WS = null;
    let stopws = false;
    let fact_link = null;

    const init = (context, params) => {
        app.services.setTemplate('status.html')
            .then(_ => app.services.setHeader())
            .then(_ => getOrder())
        ;
        return true;
    };

    const destroy = _ => {
        if (WS) WS.close();
        stopws = true;
        if (WSTO) clearTimeout(WSTO);
    };

    const getOrder = _ => {
        let order_id = localStorage.getItem('order_id');
        let etab_token =  localStorage.getItem('etab_token');
        if (!etab_token) {
            localStorage.removeItem('order_id');
            return app.router.resolve('/');
        }
        return app.services.http(true).get('/order/' + etab_token + "/" + order_id)
            .then(res => {

                app.services.http(true).get('/fact-link', {order_id:  order_id})
                    .then(res => fact_link = res)
                if (res.Ready) return document.getElementById('status').className = "finish";
                if (res.Done) {
                    localStorage.removeItem('order_id');
                    return app.router.resolve('/');
                }
                setWS();
            })
        ;
    }

    const back = _ => {
        localStorage.removeItem('order_id');
        localStorage.removeItem('current_basket');
        app.router.resolve('/')
    }

    const dlFact = _ => {
        if (fact_link) window.open(fact_link, '_blank');
    };

    let WSTO = null;
    const setWS = _ => {
        if (WS) return;
        if (stopws) return;
        let order_id = localStorage.getItem('order_id');
        if (!order_id) return;
        WS = new WebSocket('ws://ws.easy-as-pie.fr/ws?orderid=' + order_id + '&cliid=' + localStorage.getItem('user_token'));
        WS.onclose = _ => {
            WS = null;
            WSTO = setTimeout(_ => setWS(), 2000)
        };
        WS.onmessage = msg => {
            const message = JSON.parse(msg.data);
            if (message.status) getOrder();
        };
    }

    return {
        init: init,
        destroy: destroy,

        dlFact: dlFact,
        back: back

    }

};