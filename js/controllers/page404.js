export default function page404() {


    const init = context => {
        console.log(1, context);
        location.replace("http://easy-as-pie.fr");
        return false;
    };

    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy

    }

};