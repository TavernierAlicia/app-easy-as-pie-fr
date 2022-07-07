window.app.services = (function() {

    const histoyTemplate = {};
    const getTemplate = tpl => fetch('/html/' + tpl).then(res => res.text()).then(res => histoyTemplate[tpl] = res);
    const setTemplate = tpl => (histoyTemplate[tpl] ? Promise.resolve() : getTemplate(tpl)).then(_ => document.body.innerHTML = histoyTemplate[tpl]);

    const setHeader = _ => (histoyTemplate['header.html'] ? Promise.resolve() : getTemplate('header.html')).then(_ => document.body.innerHTML = histoyTemplate["header.html"] + document.body.innerHTML)
        .then(_ => setTitle());

    const setModule = tpl => {
        cleanModule();
        tpl = "modules/" + tpl;
        return (histoyTemplate[tpl] ? Promise.resolve() : getTemplate(tpl)).then(_ => {
            let modulePop = document.createElement('div');
            modulePop.id = "module-pop";
            modulePop.setAttribute('onclick', 'app.services.cleanModule()');
            let module = document.createElement('div');
            module.id = "module";
            module.innerHTML = histoyTemplate[tpl];
            document.body.appendChild(modulePop);
            document.body.appendChild(module);
            document.body.classList.add('sub-module');
        });
        
    };
    
    const cleanModule = _ => {
        document.body.classList.remove('sub-module');
        let module = document.getElementById('module');
        let modulePop = document.getElementById('module-pop');
        if (module) module.parentNode.removeChild(module);
        if (modulePop) modulePop.parentNode.removeChild(modulePop);
    };

    const openDropdown = function(event) {
        const container =  event.currentTarget.parentNode;
        container.classList.toggle('show');
    };

    const setDropdown = function(event) {
        if (!event.target.dataset.value) return;
        let container = event.currentTarget.parentNode;
        container.firstElementChild.dataset.value = event.target.dataset.value;
        container.firstElementChild.dataset.text = event.target.innerText;
        container.firstElementChild.innerHTML = event.target.innerHTML;
        closeAllDropdown();
    }

    const closeAllDropdown = _ => {
        var dropdowns = document.getElementsByClassName("dropdown");
        for (let dd of dropdowns) dd.classList.remove('show');
    }


    window.onclick = function(event) {
        if (event.target.classList.contains('dropdown')) return;
        let trg = event.target;
        while (trg.parentNode && trg.parentNode.classList) {
            if (trg.parentNode.classList.contains('dropdown')) return;
            trg = trg.parentNode;
        }
        closeAllDropdown();
    }



    const http = (is_auth = false, is_json = true) => {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (is_auth) {
            headers["Authorization"] = localStorage.getItem('user_token') || "";
        }

        const api = "http://api.easy-as-pie.fr";

        const retour = res => {
            if (res.status == 401) {
                logout();
                return Promise.reject();
            }
            return is_json ? Promise[res.ok ? "resolve" : "reject"](res.json()) : res
        };
        const catchRetour = err => Promise.reject(err);

        const get = (path, data) => {
            let params = '?';
            for (let param in data) {
                params += param + '=' + data[param] + '&';
            }
            params = params.slice(0, -1);
    
            return fetch(api + path + params, {
                headers: headers,
                method: "GET"
            }).then(retour).catch(catchRetour);
        };

        const post = (path, data) => {
            return fetch(api + path, {
                headers: headers,
                method: "POST",
                body: JSON.stringify(data)
            }).then(retour).catch(catchRetour);
        };

        const del = (path, data) => {
            return fetch(api + path, {
                headers: headers,
                method: "DELETE",
                body: JSON.stringify(data)
            }).then(retour).catch(catchRetour);
        };

        const put = (path, data) => {
            return fetch(api + path, {
                headers: headers,
                method: "PUT",
                body: JSON.stringify(data)
            }).then(retour).catch(catchRetour);
        };



        return {
            get: get,
            post: post,
            put: put,
            delete: del
        }
    };

    const setTitle = _ => {
        let title = localStorage.getItem('etab_name');
        if (!title) return;
        document.title = "EasyAsPie - " + title;
        let ht = document.getElementById('header-title');
        if (ht) ht.textContent = "au " + title.toUpperCase();
    }

    return {
        setTemplate: setTemplate,
        setHeader: setHeader,
        setModule: setModule,
        cleanModule: cleanModule,
        openDropdown: openDropdown,
        setDropdown: setDropdown,
        http: http,
        setTitle: setTitle
    }

})();