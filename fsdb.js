var requireall = require('requireall'),
    _ = require('underscore'),
    uuid = require('uuid'),
    fs = require('fs'),
    path = require('path'),
    beautify = require('js-beautify').js_beautify;

function FsDb(directory, Constructor) {

    if(!Constructor) {
        throw 'You must provide a constructor for the ' + directory + ' file database.';
    }

    var key = Constructor.key || Constructor.prototype.key || 'id';
    var objects = [];

    requireall(directory + '/*.json').forEach(function(doc) {
        objects.push(new Constructor(doc));
    });

    this.all = function() {
        return objects;
    };

    this.findOne = function(query) {
        return _.findWhere(objects, query);
    };

    this.save = function(obj) {
        if(!obj[key]) {
            obj[key] = uuid.v1();
        }

        fs.writeFileSync(ensureDir(directory + '/' + obj[key] + '.json'), beautify(JSON.stringify(obj)));

        objects.push(obj);

        return obj;
    };
}

function ensureDir(filename) {
    var dirs = path.dirname(path.normalize(filename)).split(path.sep),
        dirname = '';

    dirs.shift();

    do {
        dirname += '/' + dirs.shift();
        if(!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, 0770);
        }
    } while(dirs.length > 0);
    return filename;
}

module.exports = FsDb;