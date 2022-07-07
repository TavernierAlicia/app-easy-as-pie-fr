export default function cart() {

    const formatPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    const init = (context, params) => {
        app.services.setTemplate('cart.html')
            .then(_ => app.services.setHeader())
            .then(_ => setCart())
        ;
        return true;
    };

    const setCart = _ => {
        let current_basket = localStorage.getItem('current_basket');
        if (current_basket) current_basket = JSON.parse(current_basket);
        if (!current_basket) return;

        const container = document.getElementById('cart-items');
        const itemTPL = document.getElementById('item-tpl');

        for (let i in current_basket) {
            let item = document.importNode(itemTPL.content, true);
            item.querySelector('.item').dataset.id = i;
            item.querySelector('.item-name').textContent = current_basket[i].name;
            item.querySelector('.item-price').textContent = formatPrice.format(current_basket[i].price);
            item.querySelector('.item-total').textContent = formatPrice.format(current_basket[i].price * current_basket[i].count);
            item.querySelector('.item-count').textContent = "x" + current_basket[i].count;
            container.appendChild(item);
            container.dataset.items = parseInt(container.dataset.items) + 1;
        }
        setTotal(current_basket);
    }

    const setTotal = current_basket => {
        let t = 0;
        for (let i in current_basket) {
            t += current_basket[i].price * current_basket[i].count;
        }
        document.getElementById('total-TTC').textContent = "Total TTC: " + formatPrice.format(t);
        document.getElementById('total-HT').textContent = "Total HT: " + formatPrice.format(t / 1.2);

    };

    const change = (target, event, changer) => {
        let current_basket = localStorage.getItem('current_basket');
        current_basket = current_basket ? JSON.parse(current_basket) : {};
        if (!current_basket[target.dataset.id]) return;
        let current = current_basket[target.dataset.id];

        let c = parseInt(current.count) + changer;
        if (c < 1) {
            delete current_basket[target.dataset.id];
            target.parentNode.dataset.items = parseInt(target.parentNode.dataset.items) - 1;
            target.parentNode.removeChild(target);
        } else {
            current_basket[target.dataset.id].count = c;
            target.querySelector('.item-count').textContent = "x" + c;
            target.querySelector('.item-total').textContent =  formatPrice.format(current.price * c);
        }
        localStorage.setItem('current_basket', JSON.stringify(current_basket)); 
        setTotal(current_basket);
    };

    const payment = _ => {
        let current_basket = localStorage.getItem('current_basket');
        current_basket = current_basket ? JSON.parse(current_basket) : {};

        let data = {
            cli_uuid: localStorage.getItem('user_token'),
            token: localStorage.getItem('etab_token'),
            totalTTC: 0,
            totalHT: 0,
            Order_items: [],
        }

        let t = 0;
        for (let i in current_basket) {
            t += current_basket[i].price * current_basket[i].count;
            data.Order_items.push({item_id: parseInt(i), price: current_basket[i].price, quantity: current_basket[i].count, name: current_basket[i].name});
        }
        data.totalTTC = t;
        data.totalHT = t / 1.2;

        return app.services.http(true).post('/place-order', data)
            .then(res => localStorage.setItem('order_id', res))
            .then(_ => app.router.resolve('/status')) 
    };


    

    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy,

        payment: payment,
        change: change

    }

};