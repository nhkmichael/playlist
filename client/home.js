Meteor.startup(function () {
    // initialize client's collections with playlist and library data
    Meteor.call('initialize_collections')
});

Template.home.onCreated(function () {
    let instance = this;
    instance.playlistExpand = new ReactiveVar(true);
    instance.playlist = new ReactiveVar(null);
    instance.page = new ReactiveVar('library');
    instance.sort = new ReactiveVar('title');
    instance.searchKeyword = new ReactiveVar(null);
});

Template.registerHelper('playlist', function () {
    return Playlists.find()
});

Template.home.helpers({
    isExpanded: function () {
        return Template.instance().playlistExpand.get()
    },
    songs: function () {
        let sort = Template.instance().sort.get();
        let keyword = Template.instance().searchKeyword.get();
        let playlist = Template.instance().playlist.get();
        let projection;
        let query;
        if (!!playlist) {
            if (!!keyword) {
                let regex = new RegExp(keyword, 'i');
                query = {
                    id: {$in: playlist['songs']},
                    $or: [
                        {title: regex},
                        {artist: regex},
                        {album: regex}
                    ]
                }
            } else {
                query = {
                    id: {$in: playlist['songs']}
                }
            }
        } else {
            if (!!keyword) {
                let regex = new RegExp(keyword, 'i');
                query = {
                    $or: [
                        {title: regex},
                        {artist: regex},
                        {album: regex}
                    ]
                }
            } else {
                query = {}
            }
        }
        switch (sort) {
            case 'default':
                projection = {sort: {id: 1}};
                break;
            case 'album':
                projection = {sort: {album: 1}};
                break;
            case 'artist':
                projection = {sort: {artist: 1}};
                break;
            case 'duration':
                projection = {sort: {duration: 1}};
                break;
        }
        return Library.find(query, projection)
    },
    length: function () {
        let seconds = Number(this['duration']);
        let minute = parseInt(seconds / 60);
        let second = seconds % 60;
        if (second < 10) {
            second = '0' + second
        }
        return minute + ':' + second
    },
    page_title: function () {
        let page = Template.instance().page.get();
        if (page === 'library') {
            return 'Library'
        } else if (page === 'playlist') {
            return Template.instance().playlist.get().name
        }
    }
});

Template.home.events({
    'click .playlist_toogle': function (e, t) {
        e.preventDefault();
        let status = !t.playlistExpand.get();
        t.playlistExpand.set(status)
    },
    'click .nav a': function (e, t) {
        let target = $(e.target).closest('li');
        if (!target.hasClass('nav-title')) {
            $('.nav').removeClass('active');
            $(e.target).closest('li').addClass('active');
            t.page.set(target.attr('data-page'))
            if (target.attr('data-page') === 'library') {
                t.playlist.set(null)
            } else {
                t.playlist.set(this)
            }
        }
    },
    'keyup #search_keyword_input': function (e, t) {
        t.searchKeyword.set($(e.target).val())
    },
    'click .sort_type': function (e, t) {
        e.preventDefault();
        let target = $(e.target);
        $('.sort_type').removeClass('active');
        target.addClass('active');
        t.sort.set(target.attr('data-type'))
    },
    'click #add_new_playlist': function () {
        swal({
            title: 'Please Enter New Playlist Name',
            input: 'text',
            showCancelButton: true,
            preConfirm: (name) => {
                return new Promise((resolve, reject) => {
                    if (name.trim() !== "") {
                        resolve(name)
                    } else {
                        reject('Name cannot be empty')
                    }
                })
            },
        }).then(function (name) {
            Meteor.call('add_new_playlist', name)

        })
    },
    'click .edit_playlist': function () {
        let playlist = this;
        swal({
            title: 'Please Enter New Playlist Name',
            input: 'text',
            inputPlaceholder: playlist['name'],
            showCancelButton: true,
            preConfirm: (name) => {
                return new Promise((resolve, reject) => {
                    if (name.trim() !== "") {
                        resolve(name)
                    } else {
                        resolve(playlist['name'])
                    }
                })
            },
        }).then(function (name) {
            Meteor.call('edit_playlist', name, playlist)
        })
    },
    'click .remove_playlist': function () {
        let playlist = this;
        console.log(playlist)
        swal({title: 'Confirm To Remove Playlist?', type: 'warning', showCancelButton: true}).then(function () {
            Meteor.call('remove_playlist', playlist)
        }, function () {

        })
    },
    'mouseover .song_detail': function () {
        $('.add_to_pl').hide();
        $('.add_to_pl[data-id='+ this['id']+']').show();
    },
    'mouseleave .song_detail': function () {
        $('.add_to_pl').hide();
    },
    'click .add_to_pl': function () {
        let song = this;
        Session.set('selected_song', this);
        $('#add_to_playlist_modal').modal('show')
    },
    'click .select_playlist': function () {
        let selected_song = Session.get('selected_song');
        let selected_playlist = this;
        selected_playlist['songs'].push(selected_song['id']);
        Meteor.call('add_to_playlist', selected_playlist, function (err,res) {
            $('#add_to_playlist_modal').modal('hide')
        })

    },
    'hidden.bs.modal #add_to_playlist_modal': function () {
        Session.clear('selected_song')
    }
});