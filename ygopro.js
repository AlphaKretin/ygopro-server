// Generated by CoffeeScript 1.9.3
(function() {
  var Struct, _, declaration, field, i, len, name, result, structs_declaration, type, typedefs;

  _ = require('underscore');

  _.str = require('underscore.string');

  _.mixin(_.str.exports());

  Struct = require('struct').Struct;

  structs_declaration = require('./structs.json');

  typedefs = require('./typedefs.json');

  this.proto_structs = require('./proto_structs.json');

  this.constants = require('./constants.json');

  this.structs = {};

  for (name in structs_declaration) {
    declaration = structs_declaration[name];
    result = Struct();
    for (i = 0, len = declaration.length; i < len; i++) {
      field = declaration[i];
      if (field.encoding) {
        switch (field.encoding) {
          case "UTF-16LE":
            result.chars(field.name, field.length * 2, field.encoding);
            break;
          default:
            throw "unsupported encoding: " + field.encoding;
        }
      } else {
        type = field.type;
        if (typedefs[type]) {
          type = typedefs[type];
        }
        if (field.length) {
          result.array(field.name, field.length, type);
        } else {
          if (this.structs[type]) {
            result.struct(field.name, this.structs[type]);
          } else {
            result[type](field.name);
          }
        }
      }
    }
    this.structs[name] = result;
  }

  this.stoc_follows = {};

  this.ctos_follows = {};

  this.stoc_follow = function(proto, synchronous, callback) {
    var key, ref, value;
    if (typeof proto === 'string') {
      ref = this.constants.STOC;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.STOC[proto]) {
        throw "unknown proto";
      }
    }
    this.stoc_follows[proto] = {
      callback: callback,
      synchronous: synchronous
    };
  };

  this.ctos_follow = function(proto, synchronous, callback) {
    var key, ref, value;
    if (typeof proto === 'string') {
      ref = this.constants.CTOS;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.CTOS[proto]) {
        throw "unknown proto";
      }
    }
    this.ctos_follows[proto] = {
      callback: callback,
      synchronous: synchronous
    };
  };

  this.stoc_send = function(socket, proto, info) {
    var buffer, header, key, ref, struct, value;
    if (typeof info === 'undefined') {
      buffer = "";
    } else if (Buffer.isBuffer(info)) {
      buffer = info;
    } else {
      struct = this.structs[this.proto_structs.STOC[proto]];
      struct.allocate();
      struct.set(info);
      buffer = struct.buffer();
    }
    if (typeof proto === 'string') {
      ref = this.constants.STOC;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.STOC[proto]) {
        throw "unknown proto";
      }
    }
    header = new Buffer(3);
    header.writeUInt16LE(buffer.length + 1, 0);
    header.writeUInt8(proto, 2);
    socket.write(header);
    if (buffer.length) {
      socket.write(buffer);
    }
  };

  this.ctos_send = function(socket, proto, info) {
    var buffer, header, key, ref, struct, value;
    if (typeof info === 'undefined') {
      buffer = "";
    } else if (Buffer.isBuffer(info)) {
      buffer = info;
    } else {
      struct = this.structs[this.proto_structs.CTOS[proto]];
      struct.allocate();
      struct.set(info);
      buffer = struct.buffer();
    }
    if (typeof proto === 'string') {
      ref = this.constants.CTOS;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.CTOS[proto]) {
        throw "unknown proto";
      }
    }
    header = new Buffer(3);
    header.writeUInt16LE(buffer.length + 1, 0);
    header.writeUInt8(proto, 2);
    socket.write(header);
    if (buffer.length) {
      socket.write(buffer);
    }
  };

  this.stoc_send_chat = function(client, msg, player) {
    var j, len1, line, ref;
    if (player == null) {
      player = 8;
    }
    if (!client) {
      console.log("err stoc_send_chat");
      return;
    }
    ref = _.lines(msg);
    for (j = 0, len1 = ref.length; j < len1; j++) {
      line = ref[j];
      if (player >= 10) {
        line = "[System]: " + line;
      }
      this.stoc_send(client, 'CHAT', {
        player: player,
        msg: line
      });
    }
  };

  this.stoc_send_chat_to_room = function(room, msg, player) {
    var client, j, k, len1, len2, ref, ref1;
    if (player == null) {
      player = 8;
    }
    if (!room) {
      console.log("err stoc_send_chat_to_room");
      return;
    }
    ref = room.players;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      client = ref[j];
      if (client) {
        this.stoc_send_chat(client, msg, player);
      }
    }
    ref1 = room.watchers;
    for (k = 0, len2 = ref1.length; k < len2; k++) {
      client = ref1[k];
      if (client) {
        this.stoc_send_chat(client, msg, player);
      }
    }
  };

}).call(this);
