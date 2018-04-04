Meteor.methods({
    initialize_collections: function () {
        HTTP.call('GET', 'http://localhost:5000/playlist/', function (err, res) {
            if (!!res && res['data'].length > 0) {
                console.log(res['data'])
                res['data'].forEach(function (playlist) {
                    Playlists.update({id: playlist['id']}, {$set: playlist}, {upsert: true})
                })
            }
        });
        HTTP.call('GET', 'http://localhost:5000/library/', function (err, res) {
            if (!!res && res['data'].length > 0) {
                res['data'].forEach(function (library) {
                    Library.update({id: library['id']}, {$set: library}, {upsert: true})
                })
            }
        });
    },
    add_new_playlist: function (name) {
        HTTP.call('POST', 'http://localhost:5000/playlist/', {
            data: {
                name: name,
                songs: []
            }
        }, function (err, res) {
            if (res) {
                Playlists.update({
                    id: res['data']['id']
                }, {$set: {id: res['data']['id'], name: name, songs: []}}, {upsert: true})
            }
        })
    },
    edit_playlist: function (name, playlist) {
        HTTP.call('POST', 'http://localhost:5000/playlist/' + playlist['id'] + '/', {
            data: {
                name: name,
                songs: playlist['songs']
            }
        }, function (err, res) {
            if (res) {
                Playlists.update({
                    id: res['data']['id']
                }, {$set: {id: res['data']['id'], name: name, songs: playlist['songs']}}, {upsert: true})
            }
        })
    },
    remove_playlist: function (playlist) {
        HTTP.call('DELETE', 'http://localhost:5000/playlist/' + playlist['id'] + '/', function (err, res) {
            console.log(err, res);
            if (res) {
                Playlists.remove({
                    id: playlist['id']
                })
            }
        })
    },
    add_to_playlist: function (selected_playlist) {
        return HTTP.call('POST', 'http://localhost:5000/playlist/' + selected_playlist['id'] + '/', {
            data: {
                name: selected_playlist['name'],
                songs: selected_playlist['songs']
            }
        }, function (err, res) {
            console.log(err,res)
            if (res) {
                Playlists.update({
                    id: res['data']['id']
                }, {$set: {id: res['data']['id'], name: selected_playlist['name'], songs:selected_playlist['songs']}}, {upsert: true})
            }
        })

    }
});