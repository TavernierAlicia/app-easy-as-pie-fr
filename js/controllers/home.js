export default function home() {

    let menu = null;
    let planning = null;
    let is_happy_hour = null;
    let is_open = null;

    const formatPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    const padTo2Digits = num => {
        return num.toString().padStart(2, '0');
    }

    const init = (context, params) => {
        app.services.setTemplate('home.html')
            .then(_ => app.services.setHeader())
            .then(_ => getMenu())
        ;
        return true;
    };

    const getPlanning = _ => {
        return app.services.http(true).get('/planning/' + localStorage.getItem('etab_token'))
            .then(res => planning = res)
            .then(_ => checkPlanning())
        ;
    };

    let planningTO = null;

    const checkPlanning = _ => {
        clearTimeout(planningTO);
        let day = new Date().getDay() - 1;
        if (day == -1) day = 6;
        let minutes = new Date().getHours() * 60 + new Date().getMinutes();
        let open = false;
        let happy_hour = false;
        let happy_hour_p = null;
        for (let p of planning) {
            if (!p.Is_Active) continue;
            if (p.Day != day) continue;
            if (p.Start > minutes) continue;
            if (p.End < minutes) continue;
            open = true;
            happy_hour = p.Is_HH;
            if (p.Is_HH) happy_hour_p = p;
            break;
        }
        if (is_happy_hour !== null && happy_hour !== is_happy_hour) setMenu();

        is_happy_hour = happy_hour;
        is_open = open;

        if (is_happy_hour) {
            let h_s = Math.floor(happy_hour_p.Start / 60);
            let m_s = happy_hour_p.Start % 60;
            let h_e =  Math.floor(happy_hour_p.End / 60);
            let m_e = happy_hour_p.End % 60;
            document.getElementById('hh-start').textContent = h_s + "h" + padTo2Digits(m_s); 
            document.getElementById('hh-end').textContent = h_e + "h" + padTo2Digits(m_e); 
        }
        
        document.getElementById('menu').className = (is_open ? "open" : "close") + (is_happy_hour ? " hh" : "");
        
        // refresh every 5 minutes
        planningTO = setTimeout(_ => checkPlanning(), 60000 * 5);
    }

    const getMenu = _ => {
        return app.services.http(true).get('/menu-cli/' + localStorage.getItem('etab_token')) 
            .then(res => menu = res)
            .then(_ => localStorage.setItem('etab_name', menu.Name))
            .then(_ => app.services.setTitle())
            .then(_ => getPlanning())
            .then(_ => setMenu())
        ;
    };


    const setMenu = _ => {

        const drinks = menu.Items.reduce((result, currentValue) => {
            (result[currentValue.Category] = result[currentValue.Category] || []).push(currentValue);
            return result;
        }, {});

        const container = document.getElementById('products');
        container.innerHTML = "";
        const itemTPL = document.getElementById('item-tpl');

        let current_basket = localStorage.getItem('current_basket');
        current_basket = current_basket ? JSON.parse(current_basket) : {};

        for (let d in drinks) {
            let cardbox = document.createElement("div");
            cardbox.className = "cardbox";
            let cate = document.createElement('h2');
            cate.textContent = "- " + d;
            cardbox.appendChild(cate);
            let cardcon = document.createElement("div");
            cardcon.className = "cardcon";
            for (let i of drinks[d]) {
                if (!i.Stock) continue;
                let item = document.importNode(itemTPL.content, true);
                
                let price = is_happy_hour ? i.HHPrice : i.Price;
                let total = price;
                let count = 1;
                if (current_basket[i.Id.toString()]) {
                    item.querySelector('.item').classList.add('selected');
                    total = total * current_basket[i.Id.toString()].count;
                    count = current_basket[i.Id.toString()].count;
                }
                if (is_happy_hour && i.HHPrice != i.Price) item.querySelector('.item').classList.add('hh');
                item.querySelector('.item').dataset.id = i.Id;
                item.querySelector('.item').dataset.price = price;
                item.querySelector('.item').dataset.count = count;
                item.querySelector('.item-remove').dataset.id = i.Id;
                item.querySelector('.item-name').textContent = i.Name;
                item.querySelector('.item-desc').textContent = i.Desc;
                item.querySelector('.item-count').textContent = "x" + count;
                item.querySelector('.item-HH').textContent = formatPrice.format(i.HHPrice);
                item.querySelector('.item-price').textContent = formatPrice.format(i.Price);
                item.querySelector('.item-total').textContent = formatPrice.format(total);
                cardcon.appendChild(item);
            }
            cardbox.appendChild(cardcon);
            container.appendChild(cardbox);
        }

        let panier = document.createElement('div');
        panier.id = "basket";
        panier.className = "btn";
        panier.textContent = "panier";
        panier.onclick = basket;
        container.appendChild(panier);
    };
    
    const change = (target, event, changer = 0) => {
        let c = parseInt(target.dataset.count) + changer;
        if (c < 1 || !changer) {
            target.classList.remove("selected");
            event.stopPropagation();
        }
        if (!changer) c = 1;
        if (c < 1) return;
        const p = parseFloat(target.dataset.price);
        target.dataset.count = c; 
        target.querySelector('.item-count').textContent = "x" + c;
        target.querySelector('.item-total').textContent = formatPrice.format(p * c);
    };

    const basket = _ => {
        let selected = document.querySelectorAll('#products .item.selected');
        let currentOrder = {};
        for (let s of selected) {
            let item = menu.Items.find(i => i.Id == parseInt(s.dataset.id));
            if (!item) continue;
            currentOrder[s.dataset.id] = {
                count: parseInt(s.dataset.count),
                name: item.Name,
                price: is_happy_hour ? item.HHPrice : item.Price
            };
        }
        localStorage.setItem('current_basket', JSON.stringify(currentOrder));
        return app.router.resolve('/cart');
    };



    const destroy = _ => {
        clearTimeout(planningTO);
    };

    return {
        init: init,
        destroy: destroy,

        change: change,
        basket: basket,
    }

};