Router.route('/', {
    action: function () {
        this.render('home');
        this.layout('mainlayout')
    }
})