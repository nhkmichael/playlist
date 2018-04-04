Library = new Mongo.Collection('library');
Playlists = new Mongo.Collection('playlists');

if(Meteor.isServer) {
    Library._ensureIndex({_id:1,id:1});
    Playlists._ensureIndex({_id:1,id:1});
}