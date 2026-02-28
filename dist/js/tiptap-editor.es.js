var pd = Object.defineProperty;
var hd = (n, t, e) => t in n ? pd(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var bs = (n, t, e) => hd(n, typeof t != "symbol" ? t + "" : t, e);
function et(n) {
  this.content = n;
}
et.prototype = {
  constructor: et,
  find: function(n) {
    for (var t = 0; t < this.content.length; t += 2)
      if (this.content[t] === n) return t;
    return -1;
  },
  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(n) {
    var t = this.find(n);
    return t == -1 ? void 0 : this.content[t + 1];
  },
  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(n, t, e) {
    var i = e && e != n ? this.remove(e) : this, s = i.find(n), r = i.content.slice();
    return s == -1 ? r.push(e || n, t) : (r[s + 1] = t, e && (r[s] = e)), new et(r);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(n) {
    var t = this.find(n);
    if (t == -1) return this;
    var e = this.content.slice();
    return e.splice(t, 2), new et(e);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(n, t) {
    return new et([n, t].concat(this.remove(n).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(n, t) {
    var e = this.remove(n).content.slice();
    return e.push(n, t), new et(e);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(n, t, e) {
    var i = this.remove(t), s = i.content.slice(), r = i.find(n);
    return s.splice(r == -1 ? s.length : r, 0, t, e), new et(s);
  },
  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(n) {
    for (var t = 0; t < this.content.length; t += 2)
      n(this.content[t], this.content[t + 1]);
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(n) {
    return n = et.from(n), n.size ? new et(n.content.concat(this.subtract(n).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(n) {
    return n = et.from(n), n.size ? new et(this.subtract(n).content.concat(n.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(n) {
    var t = this;
    n = et.from(n);
    for (var e = 0; e < n.content.length; e += 2)
      t = t.remove(n.content[e]);
    return t;
  },
  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var n = {};
    return this.forEach(function(t, e) {
      n[t] = e;
    }), n;
  },
  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1;
  }
};
et.from = function(n) {
  if (n instanceof et) return n;
  var t = [];
  if (n) for (var e in n) t.push(e, n[e]);
  return new et(t);
};
function na(n, t, e) {
  for (let i = 0; ; i++) {
    if (i == n.childCount || i == t.childCount)
      return n.childCount == t.childCount ? null : e;
    let s = n.child(i), r = t.child(i);
    if (s == r) {
      e += s.nodeSize;
      continue;
    }
    if (!s.sameMarkup(r))
      return e;
    if (s.isText && s.text != r.text) {
      for (let o = 0; s.text[o] == r.text[o]; o++)
        e++;
      return e;
    }
    if (s.content.size || r.content.size) {
      let o = na(s.content, r.content, e + 1);
      if (o != null)
        return o;
    }
    e += s.nodeSize;
  }
}
function ia(n, t, e, i) {
  for (let s = n.childCount, r = t.childCount; ; ) {
    if (s == 0 || r == 0)
      return s == r ? null : { a: e, b: i };
    let o = n.child(--s), l = t.child(--r), a = o.nodeSize;
    if (o == l) {
      e -= a, i -= a;
      continue;
    }
    if (!o.sameMarkup(l))
      return { a: e, b: i };
    if (o.isText && o.text != l.text) {
      let c = 0, d = Math.min(o.text.length, l.text.length);
      for (; c < d && o.text[o.text.length - c - 1] == l.text[l.text.length - c - 1]; )
        c++, e--, i--;
      return { a: e, b: i };
    }
    if (o.content.size || l.content.size) {
      let c = ia(o.content, l.content, e - 1, i - 1);
      if (c)
        return c;
    }
    e -= a, i -= a;
  }
}
class v {
  /**
  @internal
  */
  constructor(t, e) {
    if (this.content = t, this.size = e || 0, e == null)
      for (let i = 0; i < t.length; i++)
        this.size += t[i].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(t, e, i, s = 0, r) {
    for (let o = 0, l = 0; l < e; o++) {
      let a = this.content[o], c = l + a.nodeSize;
      if (c > t && i(a, s + l, r || null, o) !== !1 && a.content.size) {
        let d = l + 1;
        a.nodesBetween(Math.max(0, t - d), Math.min(a.content.size, e - d), i, s + d);
      }
      l = c;
    }
  }
  /**
  Call the given callback for every descendant node. `pos` will be
  relative to the start of the fragment. The callback may return
  `false` to prevent traversal of a given node's children.
  */
  descendants(t) {
    this.nodesBetween(0, this.size, t);
  }
  /**
  Extract the text between `from` and `to`. See the same method on
  [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
  */
  textBetween(t, e, i, s) {
    let r = "", o = !0;
    return this.nodesBetween(t, e, (l, a) => {
      let c = l.isText ? l.text.slice(Math.max(t, a) - a, e - a) : l.isLeaf ? s ? typeof s == "function" ? s(l) : s : l.type.spec.leafText ? l.type.spec.leafText(l) : "" : "";
      l.isBlock && (l.isLeaf && c || l.isTextblock) && i && (o ? o = !1 : r += i), r += c;
    }, 0), r;
  }
  /**
  Create a new fragment containing the combined content of this
  fragment and the other.
  */
  append(t) {
    if (!t.size)
      return this;
    if (!this.size)
      return t;
    let e = this.lastChild, i = t.firstChild, s = this.content.slice(), r = 0;
    for (e.isText && e.sameMarkup(i) && (s[s.length - 1] = e.withText(e.text + i.text), r = 1); r < t.content.length; r++)
      s.push(t.content[r]);
    return new v(s, this.size + t.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(t, e = this.size) {
    if (t == 0 && e == this.size)
      return this;
    let i = [], s = 0;
    if (e > t)
      for (let r = 0, o = 0; o < e; r++) {
        let l = this.content[r], a = o + l.nodeSize;
        a > t && ((o < t || a > e) && (l.isText ? l = l.cut(Math.max(0, t - o), Math.min(l.text.length, e - o)) : l = l.cut(Math.max(0, t - o - 1), Math.min(l.content.size, e - o - 1))), i.push(l), s += l.nodeSize), o = a;
      }
    return new v(i, s);
  }
  /**
  @internal
  */
  cutByIndex(t, e) {
    return t == e ? v.empty : t == 0 && e == this.content.length ? this : new v(this.content.slice(t, e));
  }
  /**
  Create a new fragment in which the node at the given index is
  replaced by the given node.
  */
  replaceChild(t, e) {
    let i = this.content[t];
    if (i == e)
      return this;
    let s = this.content.slice(), r = this.size + e.nodeSize - i.nodeSize;
    return s[t] = e, new v(s, r);
  }
  /**
  Create a new fragment by prepending the given node to this
  fragment.
  */
  addToStart(t) {
    return new v([t].concat(this.content), this.size + t.nodeSize);
  }
  /**
  Create a new fragment by appending the given node to this
  fragment.
  */
  addToEnd(t) {
    return new v(this.content.concat(t), this.size + t.nodeSize);
  }
  /**
  Compare this fragment to another one.
  */
  eq(t) {
    if (this.content.length != t.content.length)
      return !1;
    for (let e = 0; e < this.content.length; e++)
      if (!this.content[e].eq(t.content[e]))
        return !1;
    return !0;
  }
  /**
  The first child of the fragment, or `null` if it is empty.
  */
  get firstChild() {
    return this.content.length ? this.content[0] : null;
  }
  /**
  The last child of the fragment, or `null` if it is empty.
  */
  get lastChild() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  }
  /**
  The number of child nodes in this fragment.
  */
  get childCount() {
    return this.content.length;
  }
  /**
  Get the child node at the given index. Raise an error when the
  index is out of range.
  */
  child(t) {
    let e = this.content[t];
    if (!e)
      throw new RangeError("Index " + t + " out of range for " + this);
    return e;
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(t) {
    return this.content[t] || null;
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(t) {
    for (let e = 0, i = 0; e < this.content.length; e++) {
      let s = this.content[e];
      t(s, i, e), i += s.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(t, e = 0) {
    return na(this, t, e);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(t, e = this.size, i = t.size) {
    return ia(this, t, e, i);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(t) {
    if (t == 0)
      return Hn(0, t);
    if (t == this.size)
      return Hn(this.content.length, t);
    if (t > this.size || t < 0)
      throw new RangeError(`Position ${t} outside of fragment (${this})`);
    for (let e = 0, i = 0; ; e++) {
      let s = this.child(e), r = i + s.nodeSize;
      if (r >= t)
        return r == t ? Hn(e + 1, r) : Hn(e, i);
      i = r;
    }
  }
  /**
  Return a debugging string that describes this fragment.
  */
  toString() {
    return "<" + this.toStringInner() + ">";
  }
  /**
  @internal
  */
  toStringInner() {
    return this.content.join(", ");
  }
  /**
  Create a JSON-serializeable representation of this fragment.
  */
  toJSON() {
    return this.content.length ? this.content.map((t) => t.toJSON()) : null;
  }
  /**
  Deserialize a fragment from its JSON representation.
  */
  static fromJSON(t, e) {
    if (!e)
      return v.empty;
    if (!Array.isArray(e))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new v(e.map(t.nodeFromJSON));
  }
  /**
  Build a fragment from an array of nodes. Ensures that adjacent
  text nodes with the same marks are joined together.
  */
  static fromArray(t) {
    if (!t.length)
      return v.empty;
    let e, i = 0;
    for (let s = 0; s < t.length; s++) {
      let r = t[s];
      i += r.nodeSize, s && r.isText && t[s - 1].sameMarkup(r) ? (e || (e = t.slice(0, s)), e[e.length - 1] = r.withText(e[e.length - 1].text + r.text)) : e && e.push(r);
    }
    return new v(e || t, i);
  }
  /**
  Create a fragment from something that can be interpreted as a
  set of nodes. For `null`, it returns the empty fragment. For a
  fragment, the fragment itself. For a node or array of nodes, a
  fragment containing those nodes.
  */
  static from(t) {
    if (!t)
      return v.empty;
    if (t instanceof v)
      return t;
    if (Array.isArray(t))
      return this.fromArray(t);
    if (t.attrs)
      return new v([t], t.nodeSize);
    throw new RangeError("Can not convert " + t + " to a Fragment" + (t.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
}
v.empty = new v([], 0);
const ys = { index: 0, offset: 0 };
function Hn(n, t) {
  return ys.index = n, ys.offset = t, ys;
}
function ci(n, t) {
  if (n === t)
    return !0;
  if (!(n && typeof n == "object") || !(t && typeof t == "object"))
    return !1;
  let e = Array.isArray(n);
  if (Array.isArray(t) != e)
    return !1;
  if (e) {
    if (n.length != t.length)
      return !1;
    for (let i = 0; i < n.length; i++)
      if (!ci(n[i], t[i]))
        return !1;
  } else {
    for (let i in n)
      if (!(i in t) || !ci(n[i], t[i]))
        return !1;
    for (let i in t)
      if (!(i in n))
        return !1;
  }
  return !0;
}
let B = class Js {
  /**
  @internal
  */
  constructor(t, e) {
    this.type = t, this.attrs = e;
  }
  /**
  Given a set of marks, create a new set which contains this one as
  well, in the right position. If this mark is already in the set,
  the set itself is returned. If any marks that are set to be
  [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
  those are replaced by this one.
  */
  addToSet(t) {
    let e, i = !1;
    for (let s = 0; s < t.length; s++) {
      let r = t[s];
      if (this.eq(r))
        return t;
      if (this.type.excludes(r.type))
        e || (e = t.slice(0, s));
      else {
        if (r.type.excludes(this.type))
          return t;
        !i && r.type.rank > this.type.rank && (e || (e = t.slice(0, s)), e.push(this), i = !0), e && e.push(r);
      }
    }
    return e || (e = t.slice()), i || e.push(this), e;
  }
  /**
  Remove this mark from the given set, returning a new set. If this
  mark is not in the set, the set itself is returned.
  */
  removeFromSet(t) {
    for (let e = 0; e < t.length; e++)
      if (this.eq(t[e]))
        return t.slice(0, e).concat(t.slice(e + 1));
    return t;
  }
  /**
  Test whether this mark is in the given set of marks.
  */
  isInSet(t) {
    for (let e = 0; e < t.length; e++)
      if (this.eq(t[e]))
        return !0;
    return !1;
  }
  /**
  Test whether this mark has the same type and attributes as
  another mark.
  */
  eq(t) {
    return this == t || this.type == t.type && ci(this.attrs, t.attrs);
  }
  /**
  Convert this mark to a JSON-serializeable representation.
  */
  toJSON() {
    let t = { type: this.type.name };
    for (let e in this.attrs) {
      t.attrs = this.attrs;
      break;
    }
    return t;
  }
  /**
  Deserialize a mark from JSON.
  */
  static fromJSON(t, e) {
    if (!e)
      throw new RangeError("Invalid input for Mark.fromJSON");
    let i = t.marks[e.type];
    if (!i)
      throw new RangeError(`There is no mark type ${e.type} in this schema`);
    let s = i.create(e.attrs);
    return i.checkAttrs(s.attrs), s;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(t, e) {
    if (t == e)
      return !0;
    if (t.length != e.length)
      return !1;
    for (let i = 0; i < t.length; i++)
      if (!t[i].eq(e[i]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(t) {
    if (!t || Array.isArray(t) && t.length == 0)
      return Js.none;
    if (t instanceof Js)
      return [t];
    let e = t.slice();
    return e.sort((i, s) => i.type.rank - s.type.rank), e;
  }
};
B.none = [];
class di extends Error {
}
class C {
  /**
  Create a slice. When specifying a non-zero open depth, you must
  make sure that there are nodes of at least that depth at the
  appropriate side of the fragment—i.e. if the fragment is an
  empty paragraph node, `openStart` and `openEnd` can't be greater
  than 1.
  
  It is not necessary for the content of open nodes to conform to
  the schema's content constraints, though it should be a valid
  start/end/middle for such a node, depending on which sides are
  open.
  */
  constructor(t, e, i) {
    this.content = t, this.openStart = e, this.openEnd = i;
  }
  /**
  The size this slice would add when inserted into a document.
  */
  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }
  /**
  @internal
  */
  insertAt(t, e) {
    let i = ra(this.content, t + this.openStart, e);
    return i && new C(i, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(t, e) {
    return new C(sa(this.content, t + this.openStart, e + this.openStart), this.openStart, this.openEnd);
  }
  /**
  Tests whether this slice is equal to another slice.
  */
  eq(t) {
    return this.content.eq(t.content) && this.openStart == t.openStart && this.openEnd == t.openEnd;
  }
  /**
  @internal
  */
  toString() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  }
  /**
  Convert a slice to a JSON-serializable representation.
  */
  toJSON() {
    if (!this.content.size)
      return null;
    let t = { content: this.content.toJSON() };
    return this.openStart > 0 && (t.openStart = this.openStart), this.openEnd > 0 && (t.openEnd = this.openEnd), t;
  }
  /**
  Deserialize a slice from its JSON representation.
  */
  static fromJSON(t, e) {
    if (!e)
      return C.empty;
    let i = e.openStart || 0, s = e.openEnd || 0;
    if (typeof i != "number" || typeof s != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new C(v.fromJSON(t, e.content), i, s);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(t, e = !0) {
    let i = 0, s = 0;
    for (let r = t.firstChild; r && !r.isLeaf && (e || !r.type.spec.isolating); r = r.firstChild)
      i++;
    for (let r = t.lastChild; r && !r.isLeaf && (e || !r.type.spec.isolating); r = r.lastChild)
      s++;
    return new C(t, i, s);
  }
}
C.empty = new C(v.empty, 0, 0);
function sa(n, t, e) {
  let { index: i, offset: s } = n.findIndex(t), r = n.maybeChild(i), { index: o, offset: l } = n.findIndex(e);
  if (s == t || r.isText) {
    if (l != e && !n.child(o).isText)
      throw new RangeError("Removing non-flat range");
    return n.cut(0, t).append(n.cut(e));
  }
  if (i != o)
    throw new RangeError("Removing non-flat range");
  return n.replaceChild(i, r.copy(sa(r.content, t - s - 1, e - s - 1)));
}
function ra(n, t, e, i) {
  let { index: s, offset: r } = n.findIndex(t), o = n.maybeChild(s);
  if (r == t || o.isText)
    return i && !i.canReplace(s, s, e) ? null : n.cut(0, t).append(e).append(n.cut(t));
  let l = ra(o.content, t - r - 1, e, o);
  return l && n.replaceChild(s, o.copy(l));
}
function fd(n, t, e) {
  if (e.openStart > n.depth)
    throw new di("Inserted content deeper than insertion position");
  if (n.depth - e.openStart != t.depth - e.openEnd)
    throw new di("Inconsistent open depths");
  return oa(n, t, e, 0);
}
function oa(n, t, e, i) {
  let s = n.index(i), r = n.node(i);
  if (s == t.index(i) && i < n.depth - e.openStart) {
    let o = oa(n, t, e, i + 1);
    return r.copy(r.content.replaceChild(s, o));
  } else if (e.content.size)
    if (!e.openStart && !e.openEnd && n.depth == i && t.depth == i) {
      let o = n.parent, l = o.content;
      return Ce(o, l.cut(0, n.parentOffset).append(e.content).append(l.cut(t.parentOffset)));
    } else {
      let { start: o, end: l } = md(e, n);
      return Ce(r, aa(n, o, l, t, i));
    }
  else return Ce(r, ui(n, t, i));
}
function la(n, t) {
  if (!t.type.compatibleContent(n.type))
    throw new di("Cannot join " + t.type.name + " onto " + n.type.name);
}
function Gs(n, t, e) {
  let i = n.node(e);
  return la(i, t.node(e)), i;
}
function xe(n, t) {
  let e = t.length - 1;
  e >= 0 && n.isText && n.sameMarkup(t[e]) ? t[e] = n.withText(t[e].text + n.text) : t.push(n);
}
function cn(n, t, e, i) {
  let s = (t || n).node(e), r = 0, o = t ? t.index(e) : s.childCount;
  n && (r = n.index(e), n.depth > e ? r++ : n.textOffset && (xe(n.nodeAfter, i), r++));
  for (let l = r; l < o; l++)
    xe(s.child(l), i);
  t && t.depth == e && t.textOffset && xe(t.nodeBefore, i);
}
function Ce(n, t) {
  return n.type.checkContent(t), n.copy(t);
}
function aa(n, t, e, i, s) {
  let r = n.depth > s && Gs(n, t, s + 1), o = i.depth > s && Gs(e, i, s + 1), l = [];
  return cn(null, n, s, l), r && o && t.index(s) == e.index(s) ? (la(r, o), xe(Ce(r, aa(n, t, e, i, s + 1)), l)) : (r && xe(Ce(r, ui(n, t, s + 1)), l), cn(t, e, s, l), o && xe(Ce(o, ui(e, i, s + 1)), l)), cn(i, null, s, l), new v(l);
}
function ui(n, t, e) {
  let i = [];
  if (cn(null, n, e, i), n.depth > e) {
    let s = Gs(n, t, e + 1);
    xe(Ce(s, ui(n, t, e + 1)), i);
  }
  return cn(t, null, e, i), new v(i);
}
function md(n, t) {
  let e = t.depth - n.openStart, s = t.node(e).copy(n.content);
  for (let r = e - 1; r >= 0; r--)
    s = t.node(r).copy(v.from(s));
  return {
    start: s.resolveNoCache(n.openStart + e),
    end: s.resolveNoCache(s.content.size - n.openEnd - e)
  };
}
class wn {
  /**
  @internal
  */
  constructor(t, e, i) {
    this.pos = t, this.path = e, this.parentOffset = i, this.depth = e.length / 3 - 1;
  }
  /**
  @internal
  */
  resolveDepth(t) {
    return t == null ? this.depth : t < 0 ? this.depth + t : t;
  }
  /**
  The parent node that the position points into. Note that even if
  a position points into a text node, that node is not considered
  the parent—text nodes are ‘flat’ in this model, and have no content.
  */
  get parent() {
    return this.node(this.depth);
  }
  /**
  The root node in which the position was resolved.
  */
  get doc() {
    return this.node(0);
  }
  /**
  The ancestor node at the given level. `p.node(p.depth)` is the
  same as `p.parent`.
  */
  node(t) {
    return this.path[this.resolveDepth(t) * 3];
  }
  /**
  The index into the ancestor at the given level. If this points
  at the 3rd node in the 2nd paragraph on the top level, for
  example, `p.index(0)` is 1 and `p.index(1)` is 2.
  */
  index(t) {
    return this.path[this.resolveDepth(t) * 3 + 1];
  }
  /**
  The index pointing after this position into the ancestor at the
  given level.
  */
  indexAfter(t) {
    return t = this.resolveDepth(t), this.index(t) + (t == this.depth && !this.textOffset ? 0 : 1);
  }
  /**
  The (absolute) position at the start of the node at the given
  level.
  */
  start(t) {
    return t = this.resolveDepth(t), t == 0 ? 0 : this.path[t * 3 - 1] + 1;
  }
  /**
  The (absolute) position at the end of the node at the given
  level.
  */
  end(t) {
    return t = this.resolveDepth(t), this.start(t) + this.node(t).content.size;
  }
  /**
  The (absolute) position directly before the wrapping node at the
  given level, or, when `depth` is `this.depth + 1`, the original
  position.
  */
  before(t) {
    if (t = this.resolveDepth(t), !t)
      throw new RangeError("There is no position before the top-level node");
    return t == this.depth + 1 ? this.pos : this.path[t * 3 - 1];
  }
  /**
  The (absolute) position directly after the wrapping node at the
  given level, or the original position when `depth` is `this.depth + 1`.
  */
  after(t) {
    if (t = this.resolveDepth(t), !t)
      throw new RangeError("There is no position after the top-level node");
    return t == this.depth + 1 ? this.pos : this.path[t * 3 - 1] + this.path[t * 3].nodeSize;
  }
  /**
  When this position points into a text node, this returns the
  distance between the position and the start of the text node.
  Will be zero for positions that point between nodes.
  */
  get textOffset() {
    return this.pos - this.path[this.path.length - 1];
  }
  /**
  Get the node directly after the position, if any. If the position
  points into a text node, only the part of that node after the
  position is returned.
  */
  get nodeAfter() {
    let t = this.parent, e = this.index(this.depth);
    if (e == t.childCount)
      return null;
    let i = this.pos - this.path[this.path.length - 1], s = t.child(e);
    return i ? t.child(e).cut(i) : s;
  }
  /**
  Get the node directly before the position, if any. If the
  position points into a text node, only the part of that node
  before the position is returned.
  */
  get nodeBefore() {
    let t = this.index(this.depth), e = this.pos - this.path[this.path.length - 1];
    return e ? this.parent.child(t).cut(0, e) : t == 0 ? null : this.parent.child(t - 1);
  }
  /**
  Get the position at the given index in the parent node at the
  given depth (which defaults to `this.depth`).
  */
  posAtIndex(t, e) {
    e = this.resolveDepth(e);
    let i = this.path[e * 3], s = e == 0 ? 0 : this.path[e * 3 - 1] + 1;
    for (let r = 0; r < t; r++)
      s += i.child(r).nodeSize;
    return s;
  }
  /**
  Get the marks at this position, factoring in the surrounding
  marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
  position is at the start of a non-empty node, the marks of the
  node after it (if any) are returned.
  */
  marks() {
    let t = this.parent, e = this.index();
    if (t.content.size == 0)
      return B.none;
    if (this.textOffset)
      return t.child(e).marks;
    let i = t.maybeChild(e - 1), s = t.maybeChild(e);
    if (!i) {
      let l = i;
      i = s, s = l;
    }
    let r = i.marks;
    for (var o = 0; o < r.length; o++)
      r[o].type.spec.inclusive === !1 && (!s || !r[o].isInSet(s.marks)) && (r = r[o--].removeFromSet(r));
    return r;
  }
  /**
  Get the marks after the current position, if any, except those
  that are non-inclusive and not present at position `$end`. This
  is mostly useful for getting the set of marks to preserve after a
  deletion. Will return `null` if this position is at the end of
  its parent node or its parent node isn't a textblock (in which
  case no marks should be preserved).
  */
  marksAcross(t) {
    let e = this.parent.maybeChild(this.index());
    if (!e || !e.isInline)
      return null;
    let i = e.marks, s = t.parent.maybeChild(t.index());
    for (var r = 0; r < i.length; r++)
      i[r].type.spec.inclusive === !1 && (!s || !i[r].isInSet(s.marks)) && (i = i[r--].removeFromSet(i));
    return i;
  }
  /**
  The depth up to which this position and the given (non-resolved)
  position share the same parent nodes.
  */
  sharedDepth(t) {
    for (let e = this.depth; e > 0; e--)
      if (this.start(e) <= t && this.end(e) >= t)
        return e;
    return 0;
  }
  /**
  Returns a range based on the place where this position and the
  given position diverge around block content. If both point into
  the same textblock, for example, a range around that textblock
  will be returned. If they point into different blocks, the range
  around those blocks in their shared ancestor is returned. You can
  pass in an optional predicate that will be called with a parent
  node to see if a range into that parent is acceptable.
  */
  blockRange(t = this, e) {
    if (t.pos < this.pos)
      return t.blockRange(this);
    for (let i = this.depth - (this.parent.inlineContent || this.pos == t.pos ? 1 : 0); i >= 0; i--)
      if (t.pos <= this.end(i) && (!e || e(this.node(i))))
        return new pi(this, t, i);
    return null;
  }
  /**
  Query whether the given position shares the same parent node.
  */
  sameParent(t) {
    return this.pos - this.parentOffset == t.pos - t.parentOffset;
  }
  /**
  Return the greater of this and the given position.
  */
  max(t) {
    return t.pos > this.pos ? t : this;
  }
  /**
  Return the smaller of this and the given position.
  */
  min(t) {
    return t.pos < this.pos ? t : this;
  }
  /**
  @internal
  */
  toString() {
    let t = "";
    for (let e = 1; e <= this.depth; e++)
      t += (t ? "/" : "") + this.node(e).type.name + "_" + this.index(e - 1);
    return t + ":" + this.parentOffset;
  }
  /**
  @internal
  */
  static resolve(t, e) {
    if (!(e >= 0 && e <= t.content.size))
      throw new RangeError("Position " + e + " out of range");
    let i = [], s = 0, r = e;
    for (let o = t; ; ) {
      let { index: l, offset: a } = o.content.findIndex(r), c = r - a;
      if (i.push(o, l, s + a), !c || (o = o.child(l), o.isText))
        break;
      r = c - 1, s += a + 1;
    }
    return new wn(e, i, r);
  }
  /**
  @internal
  */
  static resolveCached(t, e) {
    let i = bo.get(t);
    if (i)
      for (let r = 0; r < i.elts.length; r++) {
        let o = i.elts[r];
        if (o.pos == e)
          return o;
      }
    else
      bo.set(t, i = new gd());
    let s = i.elts[i.i] = wn.resolve(t, e);
    return i.i = (i.i + 1) % bd, s;
  }
}
class gd {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const bd = 12, bo = /* @__PURE__ */ new WeakMap();
class pi {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(t, e, i) {
    this.$from = t, this.$to = e, this.depth = i;
  }
  /**
  The position at the start of the range.
  */
  get start() {
    return this.$from.before(this.depth + 1);
  }
  /**
  The position at the end of the range.
  */
  get end() {
    return this.$to.after(this.depth + 1);
  }
  /**
  The parent node that the range points into.
  */
  get parent() {
    return this.$from.node(this.depth);
  }
  /**
  The start index of the range in the parent node.
  */
  get startIndex() {
    return this.$from.index(this.depth);
  }
  /**
  The end index of the range in the parent node.
  */
  get endIndex() {
    return this.$to.indexAfter(this.depth);
  }
}
const yd = /* @__PURE__ */ Object.create(null);
let se = class Ys {
  /**
  @internal
  */
  constructor(t, e, i, s = B.none) {
    this.type = t, this.attrs = e, this.marks = s, this.content = i || v.empty;
  }
  /**
  The array of this node's child nodes.
  */
  get children() {
    return this.content.content;
  }
  /**
  The size of this node, as defined by the integer-based [indexing
  scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
  amount of characters. For other leaf nodes, it is one. For
  non-leaf nodes, it is the size of the content plus two (the
  start and end token).
  */
  get nodeSize() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }
  /**
  The number of children that the node has.
  */
  get childCount() {
    return this.content.childCount;
  }
  /**
  Get the child node at the given index. Raises an error when the
  index is out of range.
  */
  child(t) {
    return this.content.child(t);
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(t) {
    return this.content.maybeChild(t);
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(t) {
    this.content.forEach(t);
  }
  /**
  Invoke a callback for all descendant nodes recursively between
  the given two positions that are relative to start of this
  node's content. The callback is invoked with the node, its
  position relative to the original node (method receiver),
  its parent node, and its child index. When the callback returns
  false for a given node, that node's children will not be
  recursed over. The last parameter can be used to specify a
  starting position to count from.
  */
  nodesBetween(t, e, i, s = 0) {
    this.content.nodesBetween(t, e, i, s, this);
  }
  /**
  Call the given callback for every descendant node. Doesn't
  descend into a node when the callback returns `false`.
  */
  descendants(t) {
    this.nodesBetween(0, this.content.size, t);
  }
  /**
  Concatenates all the text nodes found in this fragment and its
  children.
  */
  get textContent() {
    return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
  }
  /**
  Get all text between positions `from` and `to`. When
  `blockSeparator` is given, it will be inserted to separate text
  from different block nodes. If `leafText` is given, it'll be
  inserted for every non-text leaf node encountered, otherwise
  [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
  */
  textBetween(t, e, i, s) {
    return this.content.textBetween(t, e, i, s);
  }
  /**
  Returns this node's first child, or `null` if there are no
  children.
  */
  get firstChild() {
    return this.content.firstChild;
  }
  /**
  Returns this node's last child, or `null` if there are no
  children.
  */
  get lastChild() {
    return this.content.lastChild;
  }
  /**
  Test whether two nodes represent the same piece of document.
  */
  eq(t) {
    return this == t || this.sameMarkup(t) && this.content.eq(t.content);
  }
  /**
  Compare the markup (type, attributes, and marks) of this node to
  those of another. Returns `true` if both have the same markup.
  */
  sameMarkup(t) {
    return this.hasMarkup(t.type, t.attrs, t.marks);
  }
  /**
  Check whether this node's markup correspond to the given type,
  attributes, and marks.
  */
  hasMarkup(t, e, i) {
    return this.type == t && ci(this.attrs, e || t.defaultAttrs || yd) && B.sameSet(this.marks, i || B.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(t = null) {
    return t == this.content ? this : new Ys(this.type, this.attrs, t, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(t) {
    return t == this.marks ? this : new Ys(this.type, this.attrs, this.content, t);
  }
  /**
  Create a copy of this node with only the content between the
  given positions. If `to` is not given, it defaults to the end of
  the node.
  */
  cut(t, e = this.content.size) {
    return t == 0 && e == this.content.size ? this : this.copy(this.content.cut(t, e));
  }
  /**
  Cut out the part of the document between the given positions, and
  return it as a `Slice` object.
  */
  slice(t, e = this.content.size, i = !1) {
    if (t == e)
      return C.empty;
    let s = this.resolve(t), r = this.resolve(e), o = i ? 0 : s.sharedDepth(e), l = s.start(o), c = s.node(o).content.cut(s.pos - l, r.pos - l);
    return new C(c, s.depth - o, r.depth - o);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(t, e, i) {
    return fd(this.resolve(t), this.resolve(e), i);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(t) {
    for (let e = this; ; ) {
      let { index: i, offset: s } = e.content.findIndex(t);
      if (e = e.maybeChild(i), !e)
        return null;
      if (s == t || e.isText)
        return e;
      t -= s + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(t) {
    let { index: e, offset: i } = this.content.findIndex(t);
    return { node: this.content.maybeChild(e), index: e, offset: i };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(t) {
    if (t == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: e, offset: i } = this.content.findIndex(t);
    if (i < t)
      return { node: this.content.child(e), index: e, offset: i };
    let s = this.content.child(e - 1);
    return { node: s, index: e - 1, offset: i - s.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(t) {
    return wn.resolveCached(this, t);
  }
  /**
  @internal
  */
  resolveNoCache(t) {
    return wn.resolve(this, t);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(t, e, i) {
    let s = !1;
    return e > t && this.nodesBetween(t, e, (r) => (i.isInSet(r.marks) && (s = !0), !s)), s;
  }
  /**
  True when this is a block (non-inline node)
  */
  get isBlock() {
    return this.type.isBlock;
  }
  /**
  True when this is a textblock node, a block node with inline
  content.
  */
  get isTextblock() {
    return this.type.isTextblock;
  }
  /**
  True when this node allows inline content.
  */
  get inlineContent() {
    return this.type.inlineContent;
  }
  /**
  True when this is an inline node (a text node or a node that can
  appear among text).
  */
  get isInline() {
    return this.type.isInline;
  }
  /**
  True when this is a text node.
  */
  get isText() {
    return this.type.isText;
  }
  /**
  True when this is a leaf node.
  */
  get isLeaf() {
    return this.type.isLeaf;
  }
  /**
  True when this is an atom, i.e. when it does not have directly
  editable content. This is usually the same as `isLeaf`, but can
  be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
  on a node's spec (typically used when the node is displayed as
  an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
  */
  get isAtom() {
    return this.type.isAtom;
  }
  /**
  Return a string representation of this node for debugging
  purposes.
  */
  toString() {
    if (this.type.spec.toDebugString)
      return this.type.spec.toDebugString(this);
    let t = this.type.name;
    return this.content.size && (t += "(" + this.content.toStringInner() + ")"), ca(this.marks, t);
  }
  /**
  Get the content match in this node at the given index.
  */
  contentMatchAt(t) {
    let e = this.type.contentMatch.matchFragment(this.content, 0, t);
    if (!e)
      throw new Error("Called contentMatchAt on a node with invalid content");
    return e;
  }
  /**
  Test whether replacing the range between `from` and `to` (by
  child index) with the given replacement fragment (which defaults
  to the empty fragment) would leave the node's content valid. You
  can optionally pass `start` and `end` indices into the
  replacement fragment.
  */
  canReplace(t, e, i = v.empty, s = 0, r = i.childCount) {
    let o = this.contentMatchAt(t).matchFragment(i, s, r), l = o && o.matchFragment(this.content, e);
    if (!l || !l.validEnd)
      return !1;
    for (let a = s; a < r; a++)
      if (!this.type.allowsMarks(i.child(a).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(t, e, i, s) {
    if (s && !this.type.allowsMarks(s))
      return !1;
    let r = this.contentMatchAt(t).matchType(i), o = r && r.matchFragment(this.content, e);
    return o ? o.validEnd : !1;
  }
  /**
  Test whether the given node's content could be appended to this
  node. If that node is empty, this will only return true if there
  is at least one node type that can appear in both nodes (to avoid
  merging completely incompatible nodes).
  */
  canAppend(t) {
    return t.content.size ? this.canReplace(this.childCount, this.childCount, t.content) : this.type.compatibleContent(t.type);
  }
  /**
  Check whether this node and its descendants conform to the
  schema, and raise an exception when they do not.
  */
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let t = B.none;
    for (let e = 0; e < this.marks.length; e++) {
      let i = this.marks[e];
      i.type.checkAttrs(i.attrs), t = i.addToSet(t);
    }
    if (!B.sameSet(t, this.marks))
      throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((e) => e.type.name)}`);
    this.content.forEach((e) => e.check());
  }
  /**
  Return a JSON-serializeable representation of this node.
  */
  toJSON() {
    let t = { type: this.type.name };
    for (let e in this.attrs) {
      t.attrs = this.attrs;
      break;
    }
    return this.content.size && (t.content = this.content.toJSON()), this.marks.length && (t.marks = this.marks.map((e) => e.toJSON())), t;
  }
  /**
  Deserialize a node from its JSON representation.
  */
  static fromJSON(t, e) {
    if (!e)
      throw new RangeError("Invalid input for Node.fromJSON");
    let i;
    if (e.marks) {
      if (!Array.isArray(e.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      i = e.marks.map(t.markFromJSON);
    }
    if (e.type == "text") {
      if (typeof e.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return t.text(e.text, i);
    }
    let s = v.fromJSON(t, e.content), r = t.nodeType(e.type).create(e.attrs, s, i);
    return r.type.checkAttrs(r.attrs), r;
  }
};
se.prototype.text = void 0;
class hi extends se {
  /**
  @internal
  */
  constructor(t, e, i, s) {
    if (super(t, e, null, s), !i)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = i;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : ca(this.marks, JSON.stringify(this.text));
  }
  get textContent() {
    return this.text;
  }
  textBetween(t, e) {
    return this.text.slice(t, e);
  }
  get nodeSize() {
    return this.text.length;
  }
  mark(t) {
    return t == this.marks ? this : new hi(this.type, this.attrs, this.text, t);
  }
  withText(t) {
    return t == this.text ? this : new hi(this.type, this.attrs, t, this.marks);
  }
  cut(t = 0, e = this.text.length) {
    return t == 0 && e == this.text.length ? this : this.withText(this.text.slice(t, e));
  }
  eq(t) {
    return this.sameMarkup(t) && this.text == t.text;
  }
  toJSON() {
    let t = super.toJSON();
    return t.text = this.text, t;
  }
}
function ca(n, t) {
  for (let e = n.length - 1; e >= 0; e--)
    t = n[e].type.name + "(" + t + ")";
  return t;
}
class _e {
  /**
  @internal
  */
  constructor(t) {
    this.validEnd = t, this.next = [], this.wrapCache = [];
  }
  /**
  @internal
  */
  static parse(t, e) {
    let i = new vd(t, e);
    if (i.next == null)
      return _e.empty;
    let s = da(i);
    i.next && i.err("Unexpected trailing text");
    let r = Ed(Md(s));
    return _d(r, i), r;
  }
  /**
  Match a node type, returning a match after that node if
  successful.
  */
  matchType(t) {
    for (let e = 0; e < this.next.length; e++)
      if (this.next[e].type == t)
        return this.next[e].next;
    return null;
  }
  /**
  Try to match a fragment. Returns the resulting match when
  successful.
  */
  matchFragment(t, e = 0, i = t.childCount) {
    let s = this;
    for (let r = e; s && r < i; r++)
      s = s.matchType(t.child(r).type);
    return s;
  }
  /**
  @internal
  */
  get inlineContent() {
    return this.next.length != 0 && this.next[0].type.isInline;
  }
  /**
  Get the first matching node type at this match position that can
  be generated.
  */
  get defaultType() {
    for (let t = 0; t < this.next.length; t++) {
      let { type: e } = this.next[t];
      if (!(e.isText || e.hasRequiredAttrs()))
        return e;
    }
    return null;
  }
  /**
  @internal
  */
  compatible(t) {
    for (let e = 0; e < this.next.length; e++)
      for (let i = 0; i < t.next.length; i++)
        if (this.next[e].type == t.next[i].type)
          return !0;
    return !1;
  }
  /**
  Try to match the given fragment, and if that fails, see if it can
  be made to match by inserting nodes in front of it. When
  successful, return a fragment of inserted nodes (which may be
  empty if nothing had to be inserted). When `toEnd` is true, only
  return a fragment if the resulting match goes to the end of the
  content expression.
  */
  fillBefore(t, e = !1, i = 0) {
    let s = [this];
    function r(o, l) {
      let a = o.matchFragment(t, i);
      if (a && (!e || a.validEnd))
        return v.from(l.map((c) => c.createAndFill()));
      for (let c = 0; c < o.next.length; c++) {
        let { type: d, next: u } = o.next[c];
        if (!(d.isText || d.hasRequiredAttrs()) && s.indexOf(u) == -1) {
          s.push(u);
          let p = r(u, l.concat(d));
          if (p)
            return p;
        }
      }
      return null;
    }
    return r(this, []);
  }
  /**
  Find a set of wrapping node types that would allow a node of the
  given type to appear at this position. The result may be empty
  (when it fits directly) and will be null when no such wrapping
  exists.
  */
  findWrapping(t) {
    for (let i = 0; i < this.wrapCache.length; i += 2)
      if (this.wrapCache[i] == t)
        return this.wrapCache[i + 1];
    let e = this.computeWrapping(t);
    return this.wrapCache.push(t, e), e;
  }
  /**
  @internal
  */
  computeWrapping(t) {
    let e = /* @__PURE__ */ Object.create(null), i = [{ match: this, type: null, via: null }];
    for (; i.length; ) {
      let s = i.shift(), r = s.match;
      if (r.matchType(t)) {
        let o = [];
        for (let l = s; l.type; l = l.via)
          o.push(l.type);
        return o.reverse();
      }
      for (let o = 0; o < r.next.length; o++) {
        let { type: l, next: a } = r.next[o];
        !l.isLeaf && !l.hasRequiredAttrs() && !(l.name in e) && (!s.type || a.validEnd) && (i.push({ match: l.contentMatch, type: l, via: s }), e[l.name] = !0);
      }
    }
    return null;
  }
  /**
  The number of outgoing edges this node has in the finite
  automaton that describes the content expression.
  */
  get edgeCount() {
    return this.next.length;
  }
  /**
  Get the _n_​th outgoing edge from this node in the finite
  automaton that describes the content expression.
  */
  edge(t) {
    if (t >= this.next.length)
      throw new RangeError(`There's no ${t}th edge in this content match`);
    return this.next[t];
  }
  /**
  @internal
  */
  toString() {
    let t = [];
    function e(i) {
      t.push(i);
      for (let s = 0; s < i.next.length; s++)
        t.indexOf(i.next[s].next) == -1 && e(i.next[s].next);
    }
    return e(this), t.map((i, s) => {
      let r = s + (i.validEnd ? "*" : " ") + " ";
      for (let o = 0; o < i.next.length; o++)
        r += (o ? ", " : "") + i.next[o].type.name + "->" + t.indexOf(i.next[o].next);
      return r;
    }).join(`
`);
  }
}
_e.empty = new _e(!0);
class vd {
  constructor(t, e) {
    this.string = t, this.nodeTypes = e, this.inline = null, this.pos = 0, this.tokens = t.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
  }
  get next() {
    return this.tokens[this.pos];
  }
  eat(t) {
    return this.next == t && (this.pos++ || !0);
  }
  err(t) {
    throw new SyntaxError(t + " (in content expression '" + this.string + "')");
  }
}
function da(n) {
  let t = [];
  do
    t.push(wd(n));
  while (n.eat("|"));
  return t.length == 1 ? t[0] : { type: "choice", exprs: t };
}
function wd(n) {
  let t = [];
  do
    t.push(kd(n));
  while (n.next && n.next != ")" && n.next != "|");
  return t.length == 1 ? t[0] : { type: "seq", exprs: t };
}
function kd(n) {
  let t = Sd(n);
  for (; ; )
    if (n.eat("+"))
      t = { type: "plus", expr: t };
    else if (n.eat("*"))
      t = { type: "star", expr: t };
    else if (n.eat("?"))
      t = { type: "opt", expr: t };
    else if (n.eat("{"))
      t = xd(n, t);
    else
      break;
  return t;
}
function yo(n) {
  /\D/.test(n.next) && n.err("Expected number, got '" + n.next + "'");
  let t = Number(n.next);
  return n.pos++, t;
}
function xd(n, t) {
  let e = yo(n), i = e;
  return n.eat(",") && (n.next != "}" ? i = yo(n) : i = -1), n.eat("}") || n.err("Unclosed braced range"), { type: "range", min: e, max: i, expr: t };
}
function Cd(n, t) {
  let e = n.nodeTypes, i = e[t];
  if (i)
    return [i];
  let s = [];
  for (let r in e) {
    let o = e[r];
    o.isInGroup(t) && s.push(o);
  }
  return s.length == 0 && n.err("No node type or group '" + t + "' found"), s;
}
function Sd(n) {
  if (n.eat("(")) {
    let t = da(n);
    return n.eat(")") || n.err("Missing closing paren"), t;
  } else if (/\W/.test(n.next))
    n.err("Unexpected token '" + n.next + "'");
  else {
    let t = Cd(n, n.next).map((e) => (n.inline == null ? n.inline = e.isInline : n.inline != e.isInline && n.err("Mixing inline and block content"), { type: "name", value: e }));
    return n.pos++, t.length == 1 ? t[0] : { type: "choice", exprs: t };
  }
}
function Md(n) {
  let t = [[]];
  return s(r(n, 0), e()), t;
  function e() {
    return t.push([]) - 1;
  }
  function i(o, l, a) {
    let c = { term: a, to: l };
    return t[o].push(c), c;
  }
  function s(o, l) {
    o.forEach((a) => a.to = l);
  }
  function r(o, l) {
    if (o.type == "choice")
      return o.exprs.reduce((a, c) => a.concat(r(c, l)), []);
    if (o.type == "seq")
      for (let a = 0; ; a++) {
        let c = r(o.exprs[a], l);
        if (a == o.exprs.length - 1)
          return c;
        s(c, l = e());
      }
    else if (o.type == "star") {
      let a = e();
      return i(l, a), s(r(o.expr, a), a), [i(a)];
    } else if (o.type == "plus") {
      let a = e();
      return s(r(o.expr, l), a), s(r(o.expr, a), a), [i(a)];
    } else {
      if (o.type == "opt")
        return [i(l)].concat(r(o.expr, l));
      if (o.type == "range") {
        let a = l;
        for (let c = 0; c < o.min; c++) {
          let d = e();
          s(r(o.expr, a), d), a = d;
        }
        if (o.max == -1)
          s(r(o.expr, a), a);
        else
          for (let c = o.min; c < o.max; c++) {
            let d = e();
            i(a, d), s(r(o.expr, a), d), a = d;
          }
        return [i(a)];
      } else {
        if (o.type == "name")
          return [i(l, void 0, o.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function ua(n, t) {
  return t - n;
}
function vo(n, t) {
  let e = [];
  return i(t), e.sort(ua);
  function i(s) {
    let r = n[s];
    if (r.length == 1 && !r[0].term)
      return i(r[0].to);
    e.push(s);
    for (let o = 0; o < r.length; o++) {
      let { term: l, to: a } = r[o];
      !l && e.indexOf(a) == -1 && i(a);
    }
  }
}
function Ed(n) {
  let t = /* @__PURE__ */ Object.create(null);
  return e(vo(n, 0));
  function e(i) {
    let s = [];
    i.forEach((o) => {
      n[o].forEach(({ term: l, to: a }) => {
        if (!l)
          return;
        let c;
        for (let d = 0; d < s.length; d++)
          s[d][0] == l && (c = s[d][1]);
        vo(n, a).forEach((d) => {
          c || s.push([l, c = []]), c.indexOf(d) == -1 && c.push(d);
        });
      });
    });
    let r = t[i.join(",")] = new _e(i.indexOf(n.length - 1) > -1);
    for (let o = 0; o < s.length; o++) {
      let l = s[o][1].sort(ua);
      r.next.push({ type: s[o][0], next: t[l.join(",")] || e(l) });
    }
    return r;
  }
}
function _d(n, t) {
  for (let e = 0, i = [n]; e < i.length; e++) {
    let s = i[e], r = !s.validEnd, o = [];
    for (let l = 0; l < s.next.length; l++) {
      let { type: a, next: c } = s.next[l];
      o.push(a.name), r && !(a.isText || a.hasRequiredAttrs()) && (r = !1), i.indexOf(c) == -1 && i.push(c);
    }
    r && t.err("Only non-generatable nodes (" + o.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function pa(n) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let e in n) {
    let i = n[e];
    if (!i.hasDefault)
      return null;
    t[e] = i.default;
  }
  return t;
}
function ha(n, t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let i in n) {
    let s = t && t[i];
    if (s === void 0) {
      let r = n[i];
      if (r.hasDefault)
        s = r.default;
      else
        throw new RangeError("No value supplied for attribute " + i);
    }
    e[i] = s;
  }
  return e;
}
function fa(n, t, e, i) {
  for (let s in t)
    if (!(s in n))
      throw new RangeError(`Unsupported attribute ${s} for ${e} of type ${s}`);
  for (let s in n) {
    let r = n[s];
    r.validate && r.validate(t[s]);
  }
}
function ma(n, t) {
  let e = /* @__PURE__ */ Object.create(null);
  if (t)
    for (let i in t)
      e[i] = new Ad(n, i, t[i]);
  return e;
}
let wo = class ga {
  /**
  @internal
  */
  constructor(t, e, i) {
    this.name = t, this.schema = e, this.spec = i, this.markSet = null, this.groups = i.group ? i.group.split(" ") : [], this.attrs = ma(t, i.attrs), this.defaultAttrs = pa(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(i.inline || t == "text"), this.isText = t == "text";
  }
  /**
  True if this is an inline type.
  */
  get isInline() {
    return !this.isBlock;
  }
  /**
  True if this is a textblock type, a block that contains inline
  content.
  */
  get isTextblock() {
    return this.isBlock && this.inlineContent;
  }
  /**
  True for node types that allow no content.
  */
  get isLeaf() {
    return this.contentMatch == _e.empty;
  }
  /**
  True when this node is an atom, i.e. when it does not have
  directly editable content.
  */
  get isAtom() {
    return this.isLeaf || !!this.spec.atom;
  }
  /**
  Return true when this node type is part of the given
  [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
  */
  isInGroup(t) {
    return this.groups.indexOf(t) > -1;
  }
  /**
  The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
  */
  get whitespace() {
    return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
  }
  /**
  Tells you whether this node type has any required attributes.
  */
  hasRequiredAttrs() {
    for (let t in this.attrs)
      if (this.attrs[t].isRequired)
        return !0;
    return !1;
  }
  /**
  Indicates whether this node allows some of the same content as
  the given node type.
  */
  compatibleContent(t) {
    return this == t || this.contentMatch.compatible(t.contentMatch);
  }
  /**
  @internal
  */
  computeAttrs(t) {
    return !t && this.defaultAttrs ? this.defaultAttrs : ha(this.attrs, t);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(t = null, e, i) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new se(this, this.computeAttrs(t), v.from(e), B.setFrom(i));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(t = null, e, i) {
    return e = v.from(e), this.checkContent(e), new se(this, this.computeAttrs(t), e, B.setFrom(i));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(t = null, e, i) {
    if (t = this.computeAttrs(t), e = v.from(e), e.size) {
      let o = this.contentMatch.fillBefore(e);
      if (!o)
        return null;
      e = o.append(e);
    }
    let s = this.contentMatch.matchFragment(e), r = s && s.fillBefore(v.empty, !0);
    return r ? new se(this, t, e.append(r), B.setFrom(i)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(t) {
    let e = this.contentMatch.matchFragment(t);
    if (!e || !e.validEnd)
      return !1;
    for (let i = 0; i < t.childCount; i++)
      if (!this.allowsMarks(t.child(i).marks))
        return !1;
    return !0;
  }
  /**
  Throws a RangeError if the given fragment is not valid content for this
  node type.
  @internal
  */
  checkContent(t) {
    if (!this.validContent(t))
      throw new RangeError(`Invalid content for node ${this.name}: ${t.toString().slice(0, 50)}`);
  }
  /**
  @internal
  */
  checkAttrs(t) {
    fa(this.attrs, t, "node", this.name);
  }
  /**
  Check whether the given mark type is allowed in this node.
  */
  allowsMarkType(t) {
    return this.markSet == null || this.markSet.indexOf(t) > -1;
  }
  /**
  Test whether the given set of marks are allowed in this node.
  */
  allowsMarks(t) {
    if (this.markSet == null)
      return !0;
    for (let e = 0; e < t.length; e++)
      if (!this.allowsMarkType(t[e].type))
        return !1;
    return !0;
  }
  /**
  Removes the marks that are not allowed in this node from the given set.
  */
  allowedMarks(t) {
    if (this.markSet == null)
      return t;
    let e;
    for (let i = 0; i < t.length; i++)
      this.allowsMarkType(t[i].type) ? e && e.push(t[i]) : e || (e = t.slice(0, i));
    return e ? e.length ? e : B.none : t;
  }
  /**
  @internal
  */
  static compile(t, e) {
    let i = /* @__PURE__ */ Object.create(null);
    t.forEach((r, o) => i[r] = new ga(r, e, o));
    let s = e.spec.topNode || "doc";
    if (!i[s])
      throw new RangeError("Schema is missing its top node type ('" + s + "')");
    if (!i.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let r in i.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return i;
  }
};
function Td(n, t, e) {
  let i = e.split("|");
  return (s) => {
    let r = s === null ? "null" : typeof s;
    if (i.indexOf(r) < 0)
      throw new RangeError(`Expected value of type ${i} for attribute ${t} on type ${n}, got ${r}`);
  };
}
class Ad {
  constructor(t, e, i) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(i, "default"), this.default = i.default, this.validate = typeof i.validate == "string" ? Td(t, e, i.validate) : i.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class Qi {
  /**
  @internal
  */
  constructor(t, e, i, s) {
    this.name = t, this.rank = e, this.schema = i, this.spec = s, this.attrs = ma(t, s.attrs), this.excluded = null;
    let r = pa(this.attrs);
    this.instance = r ? new B(this, r) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(t = null) {
    return !t && this.instance ? this.instance : new B(this, ha(this.attrs, t));
  }
  /**
  @internal
  */
  static compile(t, e) {
    let i = /* @__PURE__ */ Object.create(null), s = 0;
    return t.forEach((r, o) => i[r] = new Qi(r, s++, e, o)), i;
  }
  /**
  When there is a mark of this type in the given set, a new set
  without it is returned. Otherwise, the input set is returned.
  */
  removeFromSet(t) {
    for (var e = 0; e < t.length; e++)
      t[e].type == this && (t = t.slice(0, e).concat(t.slice(e + 1)), e--);
    return t;
  }
  /**
  Tests whether there is a mark of this type in the given set.
  */
  isInSet(t) {
    for (let e = 0; e < t.length; e++)
      if (t[e].type == this)
        return t[e];
  }
  /**
  @internal
  */
  checkAttrs(t) {
    fa(this.attrs, t, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(t) {
    return this.excluded.indexOf(t) > -1;
  }
}
class ba {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(t) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let e = this.spec = {};
    for (let s in t)
      e[s] = t[s];
    e.nodes = et.from(t.nodes), e.marks = et.from(t.marks || {}), this.nodes = wo.compile(this.spec.nodes, this), this.marks = Qi.compile(this.spec.marks, this);
    let i = /* @__PURE__ */ Object.create(null);
    for (let s in this.nodes) {
      if (s in this.marks)
        throw new RangeError(s + " can not be both a node and a mark");
      let r = this.nodes[s], o = r.spec.content || "", l = r.spec.marks;
      if (r.contentMatch = i[o] || (i[o] = _e.parse(o, this.nodes)), r.inlineContent = r.contentMatch.inlineContent, r.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!r.isInline || !r.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = r;
      }
      r.markSet = l == "_" ? null : l ? ko(this, l.split(" ")) : l == "" || !r.inlineContent ? [] : null;
    }
    for (let s in this.marks) {
      let r = this.marks[s], o = r.spec.excludes;
      r.excluded = o == null ? [r] : o == "" ? [] : ko(this, o.split(" "));
    }
    this.nodeFromJSON = (s) => se.fromJSON(this, s), this.markFromJSON = (s) => B.fromJSON(this, s), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(t, e = null, i, s) {
    if (typeof t == "string")
      t = this.nodeType(t);
    else if (t instanceof wo) {
      if (t.schema != this)
        throw new RangeError("Node type from different schema used (" + t.name + ")");
    } else throw new RangeError("Invalid node type: " + t);
    return t.createChecked(e, i, s);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(t, e) {
    let i = this.nodes.text;
    return new hi(i, i.defaultAttrs, t, B.setFrom(e));
  }
  /**
  Create a mark with the given type and attributes.
  */
  mark(t, e) {
    return typeof t == "string" && (t = this.marks[t]), t.create(e);
  }
  /**
  @internal
  */
  nodeType(t) {
    let e = this.nodes[t];
    if (!e)
      throw new RangeError("Unknown node type: " + t);
    return e;
  }
}
function ko(n, t) {
  let e = [];
  for (let i = 0; i < t.length; i++) {
    let s = t[i], r = n.marks[s], o = r;
    if (r)
      e.push(r);
    else
      for (let l in n.marks) {
        let a = n.marks[l];
        (s == "_" || a.spec.group && a.spec.group.split(" ").indexOf(s) > -1) && e.push(o = a);
      }
    if (!o)
      throw new SyntaxError("Unknown mark type: '" + t[i] + "'");
  }
  return e;
}
function Ld(n) {
  return n.tag != null;
}
function Nd(n) {
  return n.style != null;
}
class re {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(t, e) {
    this.schema = t, this.rules = e, this.tags = [], this.styles = [];
    let i = this.matchedStyles = [];
    e.forEach((s) => {
      if (Ld(s))
        this.tags.push(s);
      else if (Nd(s)) {
        let r = /[^=]*/.exec(s.style)[0];
        i.indexOf(r) < 0 && i.push(r), this.styles.push(s);
      }
    }), this.normalizeLists = !this.tags.some((s) => {
      if (!/^(ul|ol)\b/.test(s.tag) || !s.node)
        return !1;
      let r = t.nodes[s.node];
      return r.contentMatch.matchType(r);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(t, e = {}) {
    let i = new Co(this, e, !1);
    return i.addAll(t, B.none, e.from, e.to), i.finish();
  }
  /**
  Parses the content of the given DOM node, like
  [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
  options. But unlike that method, which produces a whole node,
  this one returns a slice that is open at the sides, meaning that
  the schema constraints aren't applied to the start of nodes to
  the left of the input and the end of nodes at the end.
  */
  parseSlice(t, e = {}) {
    let i = new Co(this, e, !0);
    return i.addAll(t, B.none, e.from, e.to), C.maxOpen(i.finish());
  }
  /**
  @internal
  */
  matchTag(t, e, i) {
    for (let s = i ? this.tags.indexOf(i) + 1 : 0; s < this.tags.length; s++) {
      let r = this.tags[s];
      if (Id(t, r.tag) && (r.namespace === void 0 || t.namespaceURI == r.namespace) && (!r.context || e.matchesContext(r.context))) {
        if (r.getAttrs) {
          let o = r.getAttrs(t);
          if (o === !1)
            continue;
          r.attrs = o || void 0;
        }
        return r;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(t, e, i, s) {
    for (let r = s ? this.styles.indexOf(s) + 1 : 0; r < this.styles.length; r++) {
      let o = this.styles[r], l = o.style;
      if (!(l.indexOf(t) != 0 || o.context && !i.matchesContext(o.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      l.length > t.length && (l.charCodeAt(t.length) != 61 || l.slice(t.length + 1) != e))) {
        if (o.getAttrs) {
          let a = o.getAttrs(e);
          if (a === !1)
            continue;
          o.attrs = a || void 0;
        }
        return o;
      }
    }
  }
  /**
  @internal
  */
  static schemaRules(t) {
    let e = [];
    function i(s) {
      let r = s.priority == null ? 50 : s.priority, o = 0;
      for (; o < e.length; o++) {
        let l = e[o];
        if ((l.priority == null ? 50 : l.priority) < r)
          break;
      }
      e.splice(o, 0, s);
    }
    for (let s in t.marks) {
      let r = t.marks[s].spec.parseDOM;
      r && r.forEach((o) => {
        i(o = So(o)), o.mark || o.ignore || o.clearMark || (o.mark = s);
      });
    }
    for (let s in t.nodes) {
      let r = t.nodes[s].spec.parseDOM;
      r && r.forEach((o) => {
        i(o = So(o)), o.node || o.ignore || o.mark || (o.node = s);
      });
    }
    return e;
  }
  /**
  Construct a DOM parser using the parsing rules listed in a
  schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
  [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
  */
  static fromSchema(t) {
    return t.cached.domParser || (t.cached.domParser = new re(t, re.schemaRules(t)));
  }
}
const ya = {
  address: !0,
  article: !0,
  aside: !0,
  blockquote: !0,
  canvas: !0,
  dd: !0,
  div: !0,
  dl: !0,
  fieldset: !0,
  figcaption: !0,
  figure: !0,
  footer: !0,
  form: !0,
  h1: !0,
  h2: !0,
  h3: !0,
  h4: !0,
  h5: !0,
  h6: !0,
  header: !0,
  hgroup: !0,
  hr: !0,
  li: !0,
  noscript: !0,
  ol: !0,
  output: !0,
  p: !0,
  pre: !0,
  section: !0,
  table: !0,
  tfoot: !0,
  ul: !0
}, Od = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, va = { ol: !0, ul: !0 }, kn = 1, Xs = 2, dn = 4;
function xo(n, t, e) {
  return t != null ? (t ? kn : 0) | (t === "full" ? Xs : 0) : n && n.whitespace == "pre" ? kn | Xs : e & ~dn;
}
class $n {
  constructor(t, e, i, s, r, o) {
    this.type = t, this.attrs = e, this.marks = i, this.solid = s, this.options = o, this.content = [], this.activeMarks = B.none, this.match = r || (o & dn ? null : t.contentMatch);
  }
  findWrapping(t) {
    if (!this.match) {
      if (!this.type)
        return [];
      let e = this.type.contentMatch.fillBefore(v.from(t));
      if (e)
        this.match = this.type.contentMatch.matchFragment(e);
      else {
        let i = this.type.contentMatch, s;
        return (s = i.findWrapping(t.type)) ? (this.match = i, s) : null;
      }
    }
    return this.match.findWrapping(t.type);
  }
  finish(t) {
    if (!(this.options & kn)) {
      let i = this.content[this.content.length - 1], s;
      if (i && i.isText && (s = /[ \t\r\n\u000c]+$/.exec(i.text))) {
        let r = i;
        i.text.length == s[0].length ? this.content.pop() : this.content[this.content.length - 1] = r.withText(r.text.slice(0, r.text.length - s[0].length));
      }
    }
    let e = v.from(this.content);
    return !t && this.match && (e = e.append(this.match.fillBefore(v.empty, !0))), this.type ? this.type.create(this.attrs, e, this.marks) : e;
  }
  inlineContext(t) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : t.parentNode && !ya.hasOwnProperty(t.parentNode.nodeName.toLowerCase());
  }
}
class Co {
  constructor(t, e, i) {
    this.parser = t, this.options = e, this.isOpen = i, this.open = 0, this.localPreserveWS = !1;
    let s = e.topNode, r, o = xo(null, e.preserveWhitespace, 0) | (i ? dn : 0);
    s ? r = new $n(s.type, s.attrs, B.none, !0, e.topMatch || s.type.contentMatch, o) : i ? r = new $n(null, null, B.none, !0, null, o) : r = new $n(t.schema.topNodeType, null, B.none, !0, null, o), this.nodes = [r], this.find = e.findPositions, this.needsBlock = !1;
  }
  get top() {
    return this.nodes[this.open];
  }
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  addDOM(t, e) {
    t.nodeType == 3 ? this.addTextNode(t, e) : t.nodeType == 1 && this.addElement(t, e);
  }
  addTextNode(t, e) {
    let i = t.nodeValue, s = this.top, r = s.options & Xs ? "full" : this.localPreserveWS || (s.options & kn) > 0, { schema: o } = this.parser;
    if (r === "full" || s.inlineContext(t) || /[^ \t\r\n\u000c]/.test(i)) {
      if (r)
        if (r === "full")
          i = i.replace(/\r\n?/g, `
`);
        else if (o.linebreakReplacement && /[\r\n]/.test(i) && this.top.findWrapping(o.linebreakReplacement.create())) {
          let l = i.split(/\r?\n|\r/);
          for (let a = 0; a < l.length; a++)
            a && this.insertNode(o.linebreakReplacement.create(), e, !0), l[a] && this.insertNode(o.text(l[a]), e, !/\S/.test(l[a]));
          i = "";
        } else
          i = i.replace(/\r?\n|\r/g, " ");
      else if (i = i.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(i) && this.open == this.nodes.length - 1) {
        let l = s.content[s.content.length - 1], a = t.previousSibling;
        (!l || a && a.nodeName == "BR" || l.isText && /[ \t\r\n\u000c]$/.test(l.text)) && (i = i.slice(1));
      }
      i && this.insertNode(o.text(i), e, !/\S/.test(i)), this.findInText(t);
    } else
      this.findInside(t);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(t, e, i) {
    let s = this.localPreserveWS, r = this.top;
    (t.tagName == "PRE" || /pre/.test(t.style && t.style.whiteSpace)) && (this.localPreserveWS = !0);
    let o = t.nodeName.toLowerCase(), l;
    va.hasOwnProperty(o) && this.parser.normalizeLists && Rd(t);
    let a = this.options.ruleFromNode && this.options.ruleFromNode(t) || (l = this.parser.matchTag(t, this, i));
    t: if (a ? a.ignore : Od.hasOwnProperty(o))
      this.findInside(t), this.ignoreFallback(t, e);
    else if (!a || a.skip || a.closeParent) {
      a && a.closeParent ? this.open = Math.max(0, this.open - 1) : a && a.skip.nodeType && (t = a.skip);
      let c, d = this.needsBlock;
      if (ya.hasOwnProperty(o))
        r.content.length && r.content[0].isInline && this.open && (this.open--, r = this.top), c = !0, r.type || (this.needsBlock = !0);
      else if (!t.firstChild) {
        this.leafFallback(t, e);
        break t;
      }
      let u = a && a.skip ? e : this.readStyles(t, e);
      u && this.addAll(t, u), c && this.sync(r), this.needsBlock = d;
    } else {
      let c = this.readStyles(t, e);
      c && this.addElementByRule(t, a, c, a.consuming === !1 ? l : void 0);
    }
    this.localPreserveWS = s;
  }
  // Called for leaf DOM nodes that would otherwise be ignored
  leafFallback(t, e) {
    t.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(t.ownerDocument.createTextNode(`
`), e);
  }
  // Called for ignored nodes
  ignoreFallback(t, e) {
    t.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), e, !0);
  }
  // Run any style parser associated with the node's styles. Either
  // return an updated array of marks, or null to indicate some of the
  // styles had a rule with `ignore` set.
  readStyles(t, e) {
    let i = t.style;
    if (i && i.length)
      for (let s = 0; s < this.parser.matchedStyles.length; s++) {
        let r = this.parser.matchedStyles[s], o = i.getPropertyValue(r);
        if (o)
          for (let l = void 0; ; ) {
            let a = this.parser.matchStyle(r, o, this, l);
            if (!a)
              break;
            if (a.ignore)
              return null;
            if (a.clearMark ? e = e.filter((c) => !a.clearMark(c)) : e = e.concat(this.parser.schema.marks[a.mark].create(a.attrs)), a.consuming === !1)
              l = a;
            else
              break;
          }
      }
    return e;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(t, e, i, s) {
    let r, o;
    if (e.node)
      if (o = this.parser.schema.nodes[e.node], o.isLeaf)
        this.insertNode(o.create(e.attrs), i, t.nodeName == "BR") || this.leafFallback(t, i);
      else {
        let a = this.enter(o, e.attrs || null, i, e.preserveWhitespace);
        a && (r = !0, i = a);
      }
    else {
      let a = this.parser.schema.marks[e.mark];
      i = i.concat(a.create(e.attrs));
    }
    let l = this.top;
    if (o && o.isLeaf)
      this.findInside(t);
    else if (s)
      this.addElement(t, i, s);
    else if (e.getContent)
      this.findInside(t), e.getContent(t, this.parser.schema).forEach((a) => this.insertNode(a, i, !1));
    else {
      let a = t;
      typeof e.contentElement == "string" ? a = t.querySelector(e.contentElement) : typeof e.contentElement == "function" ? a = e.contentElement(t) : e.contentElement && (a = e.contentElement), this.findAround(t, a, !0), this.addAll(a, i), this.findAround(t, a, !1);
    }
    r && this.sync(l) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(t, e, i, s) {
    let r = i || 0;
    for (let o = i ? t.childNodes[i] : t.firstChild, l = s == null ? null : t.childNodes[s]; o != l; o = o.nextSibling, ++r)
      this.findAtPoint(t, r), this.addDOM(o, e);
    this.findAtPoint(t, r);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(t, e, i) {
    let s, r;
    for (let o = this.open, l = 0; o >= 0; o--) {
      let a = this.nodes[o], c = a.findWrapping(t);
      if (c && (!s || s.length > c.length + l) && (s = c, r = a, !c.length))
        break;
      if (a.solid) {
        if (i)
          break;
        l += 2;
      }
    }
    if (!s)
      return null;
    this.sync(r);
    for (let o = 0; o < s.length; o++)
      e = this.enterInner(s[o], null, e, !1);
    return e;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(t, e, i) {
    if (t.isInline && this.needsBlock && !this.top.type) {
      let r = this.textblockFromContext();
      r && (e = this.enterInner(r, null, e));
    }
    let s = this.findPlace(t, e, i);
    if (s) {
      this.closeExtra();
      let r = this.top;
      r.match && (r.match = r.match.matchType(t.type));
      let o = B.none;
      for (let l of s.concat(t.marks))
        (r.type ? r.type.allowsMarkType(l.type) : Mo(l.type, t.type)) && (o = l.addToSet(o));
      return r.content.push(t.mark(o)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(t, e, i, s) {
    let r = this.findPlace(t.create(e), i, !1);
    return r && (r = this.enterInner(t, e, i, !0, s)), r;
  }
  // Open a node of the given type
  enterInner(t, e, i, s = !1, r) {
    this.closeExtra();
    let o = this.top;
    o.match = o.match && o.match.matchType(t);
    let l = xo(t, r, o.options);
    o.options & dn && o.content.length == 0 && (l |= dn);
    let a = B.none;
    return i = i.filter((c) => (o.type ? o.type.allowsMarkType(c.type) : Mo(c.type, t)) ? (a = c.addToSet(a), !1) : !0), this.nodes.push(new $n(t, e, a, s, null, l)), this.open++, i;
  }
  // Make sure all nodes above this.open are finished and added to
  // their parents
  closeExtra(t = !1) {
    let e = this.nodes.length - 1;
    if (e > this.open) {
      for (; e > this.open; e--)
        this.nodes[e - 1].content.push(this.nodes[e].finish(t));
      this.nodes.length = this.open + 1;
    }
  }
  finish() {
    return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
  }
  sync(t) {
    for (let e = this.open; e >= 0; e--) {
      if (this.nodes[e] == t)
        return this.open = e, !0;
      this.localPreserveWS && (this.nodes[e].options |= kn);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let t = 0;
    for (let e = this.open; e >= 0; e--) {
      let i = this.nodes[e].content;
      for (let s = i.length - 1; s >= 0; s--)
        t += i[s].nodeSize;
      e && t++;
    }
    return t;
  }
  findAtPoint(t, e) {
    if (this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].node == t && this.find[i].offset == e && (this.find[i].pos = this.currentPos);
  }
  findInside(t) {
    if (this.find)
      for (let e = 0; e < this.find.length; e++)
        this.find[e].pos == null && t.nodeType == 1 && t.contains(this.find[e].node) && (this.find[e].pos = this.currentPos);
  }
  findAround(t, e, i) {
    if (t != e && this.find)
      for (let s = 0; s < this.find.length; s++)
        this.find[s].pos == null && t.nodeType == 1 && t.contains(this.find[s].node) && e.compareDocumentPosition(this.find[s].node) & (i ? 2 : 4) && (this.find[s].pos = this.currentPos);
  }
  findInText(t) {
    if (this.find)
      for (let e = 0; e < this.find.length; e++)
        this.find[e].node == t && (this.find[e].pos = this.currentPos - (t.nodeValue.length - this.find[e].offset));
  }
  // Determines whether the given context string matches this context.
  matchesContext(t) {
    if (t.indexOf("|") > -1)
      return t.split(/\s*\|\s*/).some(this.matchesContext, this);
    let e = t.split("/"), i = this.options.context, s = !this.isOpen && (!i || i.parent.type == this.nodes[0].type), r = -(i ? i.depth + 1 : 0) + (s ? 0 : 1), o = (l, a) => {
      for (; l >= 0; l--) {
        let c = e[l];
        if (c == "") {
          if (l == e.length - 1 || l == 0)
            continue;
          for (; a >= r; a--)
            if (o(l - 1, a))
              return !0;
          return !1;
        } else {
          let d = a > 0 || a == 0 && s ? this.nodes[a].type : i && a >= r ? i.node(a - r).type : null;
          if (!d || d.name != c && !d.isInGroup(c))
            return !1;
          a--;
        }
      }
      return !0;
    };
    return o(e.length - 1, this.open);
  }
  textblockFromContext() {
    let t = this.options.context;
    if (t)
      for (let e = t.depth; e >= 0; e--) {
        let i = t.node(e).contentMatchAt(t.indexAfter(e)).defaultType;
        if (i && i.isTextblock && i.defaultAttrs)
          return i;
      }
    for (let e in this.parser.schema.nodes) {
      let i = this.parser.schema.nodes[e];
      if (i.isTextblock && i.defaultAttrs)
        return i;
    }
  }
}
function Rd(n) {
  for (let t = n.firstChild, e = null; t; t = t.nextSibling) {
    let i = t.nodeType == 1 ? t.nodeName.toLowerCase() : null;
    i && va.hasOwnProperty(i) && e ? (e.appendChild(t), t = e) : i == "li" ? e = t : i && (e = null);
  }
}
function Id(n, t) {
  return (n.matches || n.msMatchesSelector || n.webkitMatchesSelector || n.mozMatchesSelector).call(n, t);
}
function So(n) {
  let t = {};
  for (let e in n)
    t[e] = n[e];
  return t;
}
function Mo(n, t) {
  let e = t.schema.nodes;
  for (let i in e) {
    let s = e[i];
    if (!s.allowsMarkType(n))
      continue;
    let r = [], o = (l) => {
      r.push(l);
      for (let a = 0; a < l.edgeCount; a++) {
        let { type: c, next: d } = l.edge(a);
        if (c == t || r.indexOf(d) < 0 && o(d))
          return !0;
      }
    };
    if (o(s.contentMatch))
      return !0;
  }
}
class Ie {
  /**
  Create a serializer. `nodes` should map node names to functions
  that take a node and return a description of the corresponding
  DOM. `marks` does the same for mark names, but also gets an
  argument that tells it whether the mark's content is block or
  inline content (for typical use, it'll always be inline). A mark
  serializer may be `null` to indicate that marks of that type
  should not be serialized.
  */
  constructor(t, e) {
    this.nodes = t, this.marks = e;
  }
  /**
  Serialize the content of this fragment to a DOM fragment. When
  not in the browser, the `document` option, containing a DOM
  document, should be passed so that the serializer can create
  nodes.
  */
  serializeFragment(t, e = {}, i) {
    i || (i = vs(e).createDocumentFragment());
    let s = i, r = [];
    return t.forEach((o) => {
      if (r.length || o.marks.length) {
        let l = 0, a = 0;
        for (; l < r.length && a < o.marks.length; ) {
          let c = o.marks[a];
          if (!this.marks[c.type.name]) {
            a++;
            continue;
          }
          if (!c.eq(r[l][0]) || c.type.spec.spanning === !1)
            break;
          l++, a++;
        }
        for (; l < r.length; )
          s = r.pop()[1];
        for (; a < o.marks.length; ) {
          let c = o.marks[a++], d = this.serializeMark(c, o.isInline, e);
          d && (r.push([c, s]), s.appendChild(d.dom), s = d.contentDOM || d.dom);
        }
      }
      s.appendChild(this.serializeNodeInner(o, e));
    }), i;
  }
  /**
  @internal
  */
  serializeNodeInner(t, e) {
    let { dom: i, contentDOM: s } = ei(vs(e), this.nodes[t.type.name](t), null, t.attrs);
    if (s) {
      if (t.isLeaf)
        throw new RangeError("Content hole not allowed in a leaf node spec");
      this.serializeFragment(t.content, e, s);
    }
    return i;
  }
  /**
  Serialize this node to a DOM node. This can be useful when you
  need to serialize a part of a document, as opposed to the whole
  document. To serialize a whole document, use
  [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
  its [content](https://prosemirror.net/docs/ref/#model.Node.content).
  */
  serializeNode(t, e = {}) {
    let i = this.serializeNodeInner(t, e);
    for (let s = t.marks.length - 1; s >= 0; s--) {
      let r = this.serializeMark(t.marks[s], t.isInline, e);
      r && ((r.contentDOM || r.dom).appendChild(i), i = r.dom);
    }
    return i;
  }
  /**
  @internal
  */
  serializeMark(t, e, i = {}) {
    let s = this.marks[t.type.name];
    return s && ei(vs(i), s(t, e), null, t.attrs);
  }
  static renderSpec(t, e, i = null, s) {
    return ei(t, e, i, s);
  }
  /**
  Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
  properties in a schema's node and mark specs.
  */
  static fromSchema(t) {
    return t.cached.domSerializer || (t.cached.domSerializer = new Ie(this.nodesFromSchema(t), this.marksFromSchema(t)));
  }
  /**
  Gather the serializers in a schema's node specs into an object.
  This can be useful as a base to build a custom serializer from.
  */
  static nodesFromSchema(t) {
    let e = Eo(t.nodes);
    return e.text || (e.text = (i) => i.text), e;
  }
  /**
  Gather the serializers in a schema's mark specs into an object.
  */
  static marksFromSchema(t) {
    return Eo(t.marks);
  }
}
function Eo(n) {
  let t = {};
  for (let e in n) {
    let i = n[e].spec.toDOM;
    i && (t[e] = i);
  }
  return t;
}
function vs(n) {
  return n.document || window.document;
}
const _o = /* @__PURE__ */ new WeakMap();
function Dd(n) {
  let t = _o.get(n);
  return t === void 0 && _o.set(n, t = Pd(n)), t;
}
function Pd(n) {
  let t = null;
  function e(i) {
    if (i && typeof i == "object")
      if (Array.isArray(i))
        if (typeof i[0] == "string")
          t || (t = []), t.push(i);
        else
          for (let s = 0; s < i.length; s++)
            e(i[s]);
      else
        for (let s in i)
          e(i[s]);
  }
  return e(n), t;
}
function ei(n, t, e, i) {
  if (typeof t == "string")
    return { dom: n.createTextNode(t) };
  if (t.nodeType != null)
    return { dom: t };
  if (t.dom && t.dom.nodeType != null)
    return t;
  let s = t[0], r;
  if (typeof s != "string")
    throw new RangeError("Invalid array passed to renderSpec");
  if (i && (r = Dd(i)) && r.indexOf(t) > -1)
    throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
  let o = s.indexOf(" ");
  o > 0 && (e = s.slice(0, o), s = s.slice(o + 1));
  let l, a = e ? n.createElementNS(e, s) : n.createElement(s), c = t[1], d = 1;
  if (c && typeof c == "object" && c.nodeType == null && !Array.isArray(c)) {
    d = 2;
    for (let u in c)
      if (c[u] != null) {
        let p = u.indexOf(" ");
        p > 0 ? a.setAttributeNS(u.slice(0, p), u.slice(p + 1), c[u]) : u == "style" && a.style ? a.style.cssText = c[u] : a.setAttribute(u, c[u]);
      }
  }
  for (let u = d; u < t.length; u++) {
    let p = t[u];
    if (p === 0) {
      if (u < t.length - 1 || u > d)
        throw new RangeError("Content hole must be the only child of its parent node");
      return { dom: a, contentDOM: a };
    } else {
      let { dom: h, contentDOM: f } = ei(n, p, e, i);
      if (a.appendChild(h), f) {
        if (l)
          throw new RangeError("Multiple content holes");
        l = f;
      }
    }
  }
  return { dom: a, contentDOM: l };
}
const wa = 65535, ka = Math.pow(2, 16);
function Bd(n, t) {
  return n + t * ka;
}
function To(n) {
  return n & wa;
}
function Hd(n) {
  return (n - (n & wa)) / ka;
}
const xa = 1, Ca = 2, ni = 4, Sa = 8;
class Qs {
  /**
  @internal
  */
  constructor(t, e, i) {
    this.pos = t, this.delInfo = e, this.recover = i;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & Sa) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (xa | ni)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (Ca | ni)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & ni) > 0;
  }
}
class bt {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(t, e = !1) {
    if (this.ranges = t, this.inverted = e, !t.length && bt.empty)
      return bt.empty;
  }
  /**
  @internal
  */
  recover(t) {
    let e = 0, i = To(t);
    if (!this.inverted)
      for (let s = 0; s < i; s++)
        e += this.ranges[s * 3 + 2] - this.ranges[s * 3 + 1];
    return this.ranges[i * 3] + e + Hd(t);
  }
  mapResult(t, e = 1) {
    return this._map(t, e, !1);
  }
  map(t, e = 1) {
    return this._map(t, e, !0);
  }
  /**
  @internal
  */
  _map(t, e, i) {
    let s = 0, r = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? s : 0);
      if (a > t)
        break;
      let c = this.ranges[l + r], d = this.ranges[l + o], u = a + c;
      if (t <= u) {
        let p = c ? t == a ? -1 : t == u ? 1 : e : e, h = a + s + (p < 0 ? 0 : d);
        if (i)
          return h;
        let f = t == (e < 0 ? a : u) ? null : Bd(l / 3, t - a), g = t == a ? Ca : t == u ? xa : ni;
        return (e < 0 ? t != a : t != u) && (g |= Sa), new Qs(h, g, f);
      }
      s += d - c;
    }
    return i ? t + s : new Qs(t + s, 0, null);
  }
  /**
  @internal
  */
  touches(t, e) {
    let i = 0, s = To(e), r = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? i : 0);
      if (a > t)
        break;
      let c = this.ranges[l + r], d = a + c;
      if (t <= d && l == s * 3)
        return !0;
      i += this.ranges[l + o] - c;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(t) {
    let e = this.inverted ? 2 : 1, i = this.inverted ? 1 : 2;
    for (let s = 0, r = 0; s < this.ranges.length; s += 3) {
      let o = this.ranges[s], l = o - (this.inverted ? r : 0), a = o + (this.inverted ? 0 : r), c = this.ranges[s + e], d = this.ranges[s + i];
      t(l, l + c, a, a + d), r += d - c;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new bt(this.ranges, !this.inverted);
  }
  /**
  @internal
  */
  toString() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  }
  /**
  Create a map that moves all positions by offset `n` (which may be
  negative). This can be useful when applying steps meant for a
  sub-document to a larger document, or vice-versa.
  */
  static offset(t) {
    return t == 0 ? bt.empty : new bt(t < 0 ? [0, -t, 0] : [0, 0, t]);
  }
}
bt.empty = new bt([]);
class xn {
  /**
  Create a new mapping with the given position maps.
  */
  constructor(t, e, i = 0, s = t ? t.length : 0) {
    this.mirror = e, this.from = i, this.to = s, this._maps = t || [], this.ownData = !(t || e);
  }
  /**
  The step maps in this mapping.
  */
  get maps() {
    return this._maps;
  }
  /**
  Create a mapping that maps only through a part of this one.
  */
  slice(t = 0, e = this.maps.length) {
    return new xn(this._maps, this.mirror, t, e);
  }
  /**
  Add a step map to the end of this mapping. If `mirrors` is
  given, it should be the index of the step map that is the mirror
  image of this one.
  */
  appendMap(t, e) {
    this.ownData || (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), this.ownData = !0), this.to = this._maps.push(t), e != null && this.setMirror(this._maps.length - 1, e);
  }
  /**
  Add all the step maps in a given mapping to this one (preserving
  mirroring information).
  */
  appendMapping(t) {
    for (let e = 0, i = this._maps.length; e < t._maps.length; e++) {
      let s = t.getMirror(e);
      this.appendMap(t._maps[e], s != null && s < e ? i + s : void 0);
    }
  }
  /**
  Finds the offset of the step map that mirrors the map at the
  given offset, in this mapping (as per the second argument to
  `appendMap`).
  */
  getMirror(t) {
    if (this.mirror) {
      for (let e = 0; e < this.mirror.length; e++)
        if (this.mirror[e] == t)
          return this.mirror[e + (e % 2 ? -1 : 1)];
    }
  }
  /**
  @internal
  */
  setMirror(t, e) {
    this.mirror || (this.mirror = []), this.mirror.push(t, e);
  }
  /**
  Append the inverse of the given mapping to this one.
  */
  appendMappingInverted(t) {
    for (let e = t.maps.length - 1, i = this._maps.length + t._maps.length; e >= 0; e--) {
      let s = t.getMirror(e);
      this.appendMap(t._maps[e].invert(), s != null && s > e ? i - s - 1 : void 0);
    }
  }
  /**
  Create an inverted version of this mapping.
  */
  invert() {
    let t = new xn();
    return t.appendMappingInverted(this), t;
  }
  /**
  Map a position through this mapping.
  */
  map(t, e = 1) {
    if (this.mirror)
      return this._map(t, e, !0);
    for (let i = this.from; i < this.to; i++)
      t = this._maps[i].map(t, e);
    return t;
  }
  /**
  Map a position through this mapping, returning a mapping
  result.
  */
  mapResult(t, e = 1) {
    return this._map(t, e, !1);
  }
  /**
  @internal
  */
  _map(t, e, i) {
    let s = 0;
    for (let r = this.from; r < this.to; r++) {
      let o = this._maps[r], l = o.mapResult(t, e);
      if (l.recover != null) {
        let a = this.getMirror(r);
        if (a != null && a > r && a < this.to) {
          r = a, t = this._maps[a].recover(l.recover);
          continue;
        }
      }
      s |= l.delInfo, t = l.pos;
    }
    return i ? t : new Qs(t, s, null);
  }
}
const ws = /* @__PURE__ */ Object.create(null);
class dt {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return bt.empty;
  }
  /**
  Try to merge this step with another one, to be applied directly
  after it. Returns the merged step when possible, null if the
  steps can't be merged.
  */
  merge(t) {
    return null;
  }
  /**
  Deserialize a step from its JSON representation. Will call
  through to the step class' own implementation of this method.
  */
  static fromJSON(t, e) {
    if (!e || !e.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let i = ws[e.stepType];
    if (!i)
      throw new RangeError(`No step type ${e.stepType} defined`);
    return i.fromJSON(t, e);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(t, e) {
    if (t in ws)
      throw new RangeError("Duplicate use of step JSON ID " + t);
    return ws[t] = e, e.prototype.jsonID = t, e;
  }
}
class G {
  /**
  @internal
  */
  constructor(t, e) {
    this.doc = t, this.failed = e;
  }
  /**
  Create a successful step result.
  */
  static ok(t) {
    return new G(t, null);
  }
  /**
  Create a failed step result.
  */
  static fail(t) {
    return new G(null, t);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(t, e, i, s) {
    try {
      return G.ok(t.replace(e, i, s));
    } catch (r) {
      if (r instanceof di)
        return G.fail(r.message);
      throw r;
    }
  }
}
function Rr(n, t, e) {
  let i = [];
  for (let s = 0; s < n.childCount; s++) {
    let r = n.child(s);
    r.content.size && (r = r.copy(Rr(r.content, t, r))), r.isInline && (r = t(r, e, s)), i.push(r);
  }
  return v.fromArray(i);
}
class ee extends dt {
  /**
  Create a mark step.
  */
  constructor(t, e, i) {
    super(), this.from = t, this.to = e, this.mark = i;
  }
  apply(t) {
    let e = t.slice(this.from, this.to), i = t.resolve(this.from), s = i.node(i.sharedDepth(this.to)), r = new C(Rr(e.content, (o, l) => !o.isAtom || !l.type.allowsMarkType(this.mark.type) ? o : o.mark(this.mark.addToSet(o.marks)), s), e.openStart, e.openEnd);
    return G.fromReplace(t, this.from, this.to, r);
  }
  invert() {
    return new Nt(this.from, this.to, this.mark);
  }
  map(t) {
    let e = t.mapResult(this.from, 1), i = t.mapResult(this.to, -1);
    return e.deleted && i.deleted || e.pos >= i.pos ? null : new ee(e.pos, i.pos, this.mark);
  }
  merge(t) {
    return t instanceof ee && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new ee(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "addMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.from != "number" || typeof e.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new ee(e.from, e.to, t.markFromJSON(e.mark));
  }
}
dt.jsonID("addMark", ee);
class Nt extends dt {
  /**
  Create a mark-removing step.
  */
  constructor(t, e, i) {
    super(), this.from = t, this.to = e, this.mark = i;
  }
  apply(t) {
    let e = t.slice(this.from, this.to), i = new C(Rr(e.content, (s) => s.mark(this.mark.removeFromSet(s.marks)), t), e.openStart, e.openEnd);
    return G.fromReplace(t, this.from, this.to, i);
  }
  invert() {
    return new ee(this.from, this.to, this.mark);
  }
  map(t) {
    let e = t.mapResult(this.from, 1), i = t.mapResult(this.to, -1);
    return e.deleted && i.deleted || e.pos >= i.pos ? null : new Nt(e.pos, i.pos, this.mark);
  }
  merge(t) {
    return t instanceof Nt && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new Nt(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "removeMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.from != "number" || typeof e.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new Nt(e.from, e.to, t.markFromJSON(e.mark));
  }
}
dt.jsonID("removeMark", Nt);
class ne extends dt {
  /**
  Create a node mark step.
  */
  constructor(t, e) {
    super(), this.pos = t, this.mark = e;
  }
  apply(t) {
    let e = t.nodeAt(this.pos);
    if (!e)
      return G.fail("No node at mark step's position");
    let i = e.type.create(e.attrs, null, this.mark.addToSet(e.marks));
    return G.fromReplace(t, this.pos, this.pos + 1, new C(v.from(i), 0, e.isLeaf ? 0 : 1));
  }
  invert(t) {
    let e = t.nodeAt(this.pos);
    if (e) {
      let i = this.mark.addToSet(e.marks);
      if (i.length == e.marks.length) {
        for (let s = 0; s < e.marks.length; s++)
          if (!e.marks[s].isInSet(i))
            return new ne(this.pos, e.marks[s]);
        return new ne(this.pos, this.mark);
      }
    }
    return new Te(this.pos, this.mark);
  }
  map(t) {
    let e = t.mapResult(this.pos, 1);
    return e.deletedAfter ? null : new ne(e.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new ne(e.pos, t.markFromJSON(e.mark));
  }
}
dt.jsonID("addNodeMark", ne);
class Te extends dt {
  /**
  Create a mark-removing step.
  */
  constructor(t, e) {
    super(), this.pos = t, this.mark = e;
  }
  apply(t) {
    let e = t.nodeAt(this.pos);
    if (!e)
      return G.fail("No node at mark step's position");
    let i = e.type.create(e.attrs, null, this.mark.removeFromSet(e.marks));
    return G.fromReplace(t, this.pos, this.pos + 1, new C(v.from(i), 0, e.isLeaf ? 0 : 1));
  }
  invert(t) {
    let e = t.nodeAt(this.pos);
    return !e || !this.mark.isInSet(e.marks) ? this : new ne(this.pos, this.mark);
  }
  map(t) {
    let e = t.mapResult(this.pos, 1);
    return e.deletedAfter ? null : new Te(e.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new Te(e.pos, t.markFromJSON(e.mark));
  }
}
dt.jsonID("removeNodeMark", Te);
class X extends dt {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(t, e, i, s = !1) {
    super(), this.from = t, this.to = e, this.slice = i, this.structure = s;
  }
  apply(t) {
    return this.structure && Zs(t, this.from, this.to) ? G.fail("Structure replace would overwrite content") : G.fromReplace(t, this.from, this.to, this.slice);
  }
  getMap() {
    return new bt([this.from, this.to - this.from, this.slice.size]);
  }
  invert(t) {
    return new X(this.from, this.from + this.slice.size, t.slice(this.from, this.to));
  }
  map(t) {
    let e = t.mapResult(this.from, 1), i = t.mapResult(this.to, -1);
    return e.deletedAcross && i.deletedAcross ? null : new X(e.pos, Math.max(e.pos, i.pos), this.slice, this.structure);
  }
  merge(t) {
    if (!(t instanceof X) || t.structure || this.structure)
      return null;
    if (this.from + this.slice.size == t.from && !this.slice.openEnd && !t.slice.openStart) {
      let e = this.slice.size + t.slice.size == 0 ? C.empty : new C(this.slice.content.append(t.slice.content), this.slice.openStart, t.slice.openEnd);
      return new X(this.from, this.to + (t.to - t.from), e, this.structure);
    } else if (t.to == this.from && !this.slice.openStart && !t.slice.openEnd) {
      let e = this.slice.size + t.slice.size == 0 ? C.empty : new C(t.slice.content.append(this.slice.content), t.slice.openStart, this.slice.openEnd);
      return new X(t.from, this.to, e, this.structure);
    } else
      return null;
  }
  toJSON() {
    let t = { stepType: "replace", from: this.from, to: this.to };
    return this.slice.size && (t.slice = this.slice.toJSON()), this.structure && (t.structure = !0), t;
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.from != "number" || typeof e.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new X(e.from, e.to, C.fromJSON(t, e.slice), !!e.structure);
  }
}
dt.jsonID("replace", X);
class Q extends dt {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(t, e, i, s, r, o, l = !1) {
    super(), this.from = t, this.to = e, this.gapFrom = i, this.gapTo = s, this.slice = r, this.insert = o, this.structure = l;
  }
  apply(t) {
    if (this.structure && (Zs(t, this.from, this.gapFrom) || Zs(t, this.gapTo, this.to)))
      return G.fail("Structure gap-replace would overwrite content");
    let e = t.slice(this.gapFrom, this.gapTo);
    if (e.openStart || e.openEnd)
      return G.fail("Gap is not a flat range");
    let i = this.slice.insertAt(this.insert, e.content);
    return i ? G.fromReplace(t, this.from, this.to, i) : G.fail("Content does not fit in gap");
  }
  getMap() {
    return new bt([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(t) {
    let e = this.gapTo - this.gapFrom;
    return new Q(this.from, this.from + this.slice.size + e, this.from + this.insert, this.from + this.insert + e, t.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(t) {
    let e = t.mapResult(this.from, 1), i = t.mapResult(this.to, -1), s = this.from == this.gapFrom ? e.pos : t.map(this.gapFrom, -1), r = this.to == this.gapTo ? i.pos : t.map(this.gapTo, 1);
    return e.deletedAcross && i.deletedAcross || s < e.pos || r > i.pos ? null : new Q(e.pos, i.pos, s, r, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let t = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    return this.slice.size && (t.slice = this.slice.toJSON()), this.structure && (t.structure = !0), t;
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.from != "number" || typeof e.to != "number" || typeof e.gapFrom != "number" || typeof e.gapTo != "number" || typeof e.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new Q(e.from, e.to, e.gapFrom, e.gapTo, C.fromJSON(t, e.slice), e.insert, !!e.structure);
  }
}
dt.jsonID("replaceAround", Q);
function Zs(n, t, e) {
  let i = n.resolve(t), s = e - t, r = i.depth;
  for (; s > 0 && r > 0 && i.indexAfter(r) == i.node(r).childCount; )
    r--, s--;
  if (s > 0) {
    let o = i.node(r).maybeChild(i.indexAfter(r));
    for (; s > 0; ) {
      if (!o || o.isLeaf)
        return !0;
      o = o.firstChild, s--;
    }
  }
  return !1;
}
function $d(n, t, e, i) {
  let s = [], r = [], o, l;
  n.doc.nodesBetween(t, e, (a, c, d) => {
    if (!a.isInline)
      return;
    let u = a.marks;
    if (!i.isInSet(u) && d.type.allowsMarkType(i.type)) {
      let p = Math.max(c, t), h = Math.min(c + a.nodeSize, e), f = i.addToSet(u);
      for (let g = 0; g < u.length; g++)
        u[g].isInSet(f) || (o && o.to == p && o.mark.eq(u[g]) ? o.to = h : s.push(o = new Nt(p, h, u[g])));
      l && l.to == p ? l.to = h : r.push(l = new ee(p, h, i));
    }
  }), s.forEach((a) => n.step(a)), r.forEach((a) => n.step(a));
}
function zd(n, t, e, i) {
  let s = [], r = 0;
  n.doc.nodesBetween(t, e, (o, l) => {
    if (!o.isInline)
      return;
    r++;
    let a = null;
    if (i instanceof Qi) {
      let c = o.marks, d;
      for (; d = i.isInSet(c); )
        (a || (a = [])).push(d), c = d.removeFromSet(c);
    } else i ? i.isInSet(o.marks) && (a = [i]) : a = o.marks;
    if (a && a.length) {
      let c = Math.min(l + o.nodeSize, e);
      for (let d = 0; d < a.length; d++) {
        let u = a[d], p;
        for (let h = 0; h < s.length; h++) {
          let f = s[h];
          f.step == r - 1 && u.eq(s[h].style) && (p = f);
        }
        p ? (p.to = c, p.step = r) : s.push({ style: u, from: Math.max(l, t), to: c, step: r });
      }
    }
  }), s.forEach((o) => n.step(new Nt(o.from, o.to, o.style)));
}
function Ir(n, t, e, i = e.contentMatch, s = !0) {
  let r = n.doc.nodeAt(t), o = [], l = t + 1;
  for (let a = 0; a < r.childCount; a++) {
    let c = r.child(a), d = l + c.nodeSize, u = i.matchType(c.type);
    if (!u)
      o.push(new X(l, d, C.empty));
    else {
      i = u;
      for (let p = 0; p < c.marks.length; p++)
        e.allowsMarkType(c.marks[p].type) || n.step(new Nt(l, d, c.marks[p]));
      if (s && c.isText && e.whitespace != "pre") {
        let p, h = /\r?\n|\r/g, f;
        for (; p = h.exec(c.text); )
          f || (f = new C(v.from(e.schema.text(" ", e.allowedMarks(c.marks))), 0, 0)), o.push(new X(l + p.index, l + p.index + p[0].length, f));
      }
    }
    l = d;
  }
  if (!i.validEnd) {
    let a = i.fillBefore(v.empty, !0);
    n.replace(l, l, new C(a, 0, 0));
  }
  for (let a = o.length - 1; a >= 0; a--)
    n.step(o[a]);
}
function qd(n, t, e) {
  return (t == 0 || n.canReplace(t, n.childCount)) && (e == n.childCount || n.canReplace(0, e));
}
function Xe(n) {
  let e = n.parent.content.cutByIndex(n.startIndex, n.endIndex);
  for (let i = n.depth, s = 0, r = 0; ; --i) {
    let o = n.$from.node(i), l = n.$from.index(i) + s, a = n.$to.indexAfter(i) - r;
    if (i < n.depth && o.canReplace(l, a, e))
      return i;
    if (i == 0 || o.type.spec.isolating || !qd(o, l, a))
      break;
    l && (s = 1), a < o.childCount && (r = 1);
  }
  return null;
}
function Fd(n, t, e) {
  let { $from: i, $to: s, depth: r } = t, o = i.before(r + 1), l = s.after(r + 1), a = o, c = l, d = v.empty, u = 0;
  for (let f = r, g = !1; f > e; f--)
    g || i.index(f) > 0 ? (g = !0, d = v.from(i.node(f).copy(d)), u++) : a--;
  let p = v.empty, h = 0;
  for (let f = r, g = !1; f > e; f--)
    g || s.after(f + 1) < s.end(f) ? (g = !0, p = v.from(s.node(f).copy(p)), h++) : c++;
  n.step(new Q(a, c, o, l, new C(d.append(p), u, h), d.size - u, !0));
}
function Dr(n, t, e = null, i = n) {
  let s = Vd(n, t), r = s && jd(i, t);
  return r ? s.map(Ao).concat({ type: t, attrs: e }).concat(r.map(Ao)) : null;
}
function Ao(n) {
  return { type: n, attrs: null };
}
function Vd(n, t) {
  let { parent: e, startIndex: i, endIndex: s } = n, r = e.contentMatchAt(i).findWrapping(t);
  if (!r)
    return null;
  let o = r.length ? r[0] : t;
  return e.canReplaceWith(i, s, o) ? r : null;
}
function jd(n, t) {
  let { parent: e, startIndex: i, endIndex: s } = n, r = e.child(i), o = t.contentMatch.findWrapping(r.type);
  if (!o)
    return null;
  let a = (o.length ? o[o.length - 1] : t).contentMatch;
  for (let c = i; a && c < s; c++)
    a = a.matchType(e.child(c).type);
  return !a || !a.validEnd ? null : o;
}
function Ud(n, t, e) {
  let i = v.empty;
  for (let o = e.length - 1; o >= 0; o--) {
    if (i.size) {
      let l = e[o].type.contentMatch.matchFragment(i);
      if (!l || !l.validEnd)
        throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
    }
    i = v.from(e[o].type.create(e[o].attrs, i));
  }
  let s = t.start, r = t.end;
  n.step(new Q(s, r, s, r, new C(i, 0, 0), e.length, !0));
}
function Wd(n, t, e, i, s) {
  if (!i.isTextblock)
    throw new RangeError("Type given to setBlockType should be a textblock");
  let r = n.steps.length;
  n.doc.nodesBetween(t, e, (o, l) => {
    let a = typeof s == "function" ? s(o) : s;
    if (o.isTextblock && !o.hasMarkup(i, a) && Kd(n.doc, n.mapping.slice(r).map(l), i)) {
      let c = null;
      if (i.schema.linebreakReplacement) {
        let h = i.whitespace == "pre", f = !!i.contentMatch.matchType(i.schema.linebreakReplacement);
        h && !f ? c = !1 : !h && f && (c = !0);
      }
      c === !1 && Ea(n, o, l, r), Ir(n, n.mapping.slice(r).map(l, 1), i, void 0, c === null);
      let d = n.mapping.slice(r), u = d.map(l, 1), p = d.map(l + o.nodeSize, 1);
      return n.step(new Q(u, p, u + 1, p - 1, new C(v.from(i.create(a, null, o.marks)), 0, 0), 1, !0)), c === !0 && Ma(n, o, l, r), !1;
    }
  });
}
function Ma(n, t, e, i) {
  t.forEach((s, r) => {
    if (s.isText) {
      let o, l = /\r?\n|\r/g;
      for (; o = l.exec(s.text); ) {
        let a = n.mapping.slice(i).map(e + 1 + r + o.index);
        n.replaceWith(a, a + 1, t.type.schema.linebreakReplacement.create());
      }
    }
  });
}
function Ea(n, t, e, i) {
  t.forEach((s, r) => {
    if (s.type == s.type.schema.linebreakReplacement) {
      let o = n.mapping.slice(i).map(e + 1 + r);
      n.replaceWith(o, o + 1, t.type.schema.text(`
`));
    }
  });
}
function Kd(n, t, e) {
  let i = n.resolve(t), s = i.index();
  return i.parent.canReplaceWith(s, s + 1, e);
}
function Jd(n, t, e, i, s) {
  let r = n.doc.nodeAt(t);
  if (!r)
    throw new RangeError("No node at given position");
  e || (e = r.type);
  let o = e.create(i, null, s || r.marks);
  if (r.isLeaf)
    return n.replaceWith(t, t + r.nodeSize, o);
  if (!e.validContent(r.content))
    throw new RangeError("Invalid content for node type " + e.name);
  n.step(new Q(t, t + r.nodeSize, t + 1, t + r.nodeSize - 1, new C(v.from(o), 0, 0), 1, !0));
}
function Ut(n, t, e = 1, i) {
  let s = n.resolve(t), r = s.depth - e, o = i && i[i.length - 1] || s.parent;
  if (r < 0 || s.parent.type.spec.isolating || !s.parent.canReplace(s.index(), s.parent.childCount) || !o.type.validContent(s.parent.content.cutByIndex(s.index(), s.parent.childCount)))
    return !1;
  for (let c = s.depth - 1, d = e - 2; c > r; c--, d--) {
    let u = s.node(c), p = s.index(c);
    if (u.type.spec.isolating)
      return !1;
    let h = u.content.cutByIndex(p, u.childCount), f = i && i[d + 1];
    f && (h = h.replaceChild(0, f.type.create(f.attrs)));
    let g = i && i[d] || u;
    if (!u.canReplace(p + 1, u.childCount) || !g.type.validContent(h))
      return !1;
  }
  let l = s.indexAfter(r), a = i && i[0];
  return s.node(r).canReplaceWith(l, l, a ? a.type : s.node(r + 1).type);
}
function Gd(n, t, e = 1, i) {
  let s = n.doc.resolve(t), r = v.empty, o = v.empty;
  for (let l = s.depth, a = s.depth - e, c = e - 1; l > a; l--, c--) {
    r = v.from(s.node(l).copy(r));
    let d = i && i[c];
    o = v.from(d ? d.type.create(d.attrs, o) : s.node(l).copy(o));
  }
  n.step(new X(t, t, new C(r.append(o), e, e), !0));
}
function ue(n, t) {
  let e = n.resolve(t), i = e.index();
  return _a(e.nodeBefore, e.nodeAfter) && e.parent.canReplace(i, i + 1);
}
function Yd(n, t) {
  t.content.size || n.type.compatibleContent(t.type);
  let e = n.contentMatchAt(n.childCount), { linebreakReplacement: i } = n.type.schema;
  for (let s = 0; s < t.childCount; s++) {
    let r = t.child(s), o = r.type == i ? n.type.schema.nodes.text : r.type;
    if (e = e.matchType(o), !e || !n.type.allowsMarks(r.marks))
      return !1;
  }
  return e.validEnd;
}
function _a(n, t) {
  return !!(n && t && !n.isLeaf && Yd(n, t));
}
function Zi(n, t, e = -1) {
  let i = n.resolve(t);
  for (let s = i.depth; ; s--) {
    let r, o, l = i.index(s);
    if (s == i.depth ? (r = i.nodeBefore, o = i.nodeAfter) : e > 0 ? (r = i.node(s + 1), l++, o = i.node(s).maybeChild(l)) : (r = i.node(s).maybeChild(l - 1), o = i.node(s + 1)), r && !r.isTextblock && _a(r, o) && i.node(s).canReplace(l, l + 1))
      return t;
    if (s == 0)
      break;
    t = e < 0 ? i.before(s) : i.after(s);
  }
}
function Xd(n, t, e) {
  let i = null, { linebreakReplacement: s } = n.doc.type.schema, r = n.doc.resolve(t - e), o = r.node().type;
  if (s && o.inlineContent) {
    let d = o.whitespace == "pre", u = !!o.contentMatch.matchType(s);
    d && !u ? i = !1 : !d && u && (i = !0);
  }
  let l = n.steps.length;
  if (i === !1) {
    let d = n.doc.resolve(t + e);
    Ea(n, d.node(), d.before(), l);
  }
  o.inlineContent && Ir(n, t + e - 1, o, r.node().contentMatchAt(r.index()), i == null);
  let a = n.mapping.slice(l), c = a.map(t - e);
  if (n.step(new X(c, a.map(t + e, -1), C.empty, !0)), i === !0) {
    let d = n.doc.resolve(c);
    Ma(n, d.node(), d.before(), n.steps.length);
  }
  return n;
}
function Qd(n, t, e) {
  let i = n.resolve(t);
  if (i.parent.canReplaceWith(i.index(), i.index(), e))
    return t;
  if (i.parentOffset == 0)
    for (let s = i.depth - 1; s >= 0; s--) {
      let r = i.index(s);
      if (i.node(s).canReplaceWith(r, r, e))
        return i.before(s + 1);
      if (r > 0)
        return null;
    }
  if (i.parentOffset == i.parent.content.size)
    for (let s = i.depth - 1; s >= 0; s--) {
      let r = i.indexAfter(s);
      if (i.node(s).canReplaceWith(r, r, e))
        return i.after(s + 1);
      if (r < i.node(s).childCount)
        return null;
    }
  return null;
}
function Ta(n, t, e) {
  let i = n.resolve(t);
  if (!e.content.size)
    return t;
  let s = e.content;
  for (let r = 0; r < e.openStart; r++)
    s = s.firstChild.content;
  for (let r = 1; r <= (e.openStart == 0 && e.size ? 2 : 1); r++)
    for (let o = i.depth; o >= 0; o--) {
      let l = o == i.depth ? 0 : i.pos <= (i.start(o + 1) + i.end(o + 1)) / 2 ? -1 : 1, a = i.index(o) + (l > 0 ? 1 : 0), c = i.node(o), d = !1;
      if (r == 1)
        d = c.canReplace(a, a, s);
      else {
        let u = c.contentMatchAt(a).findWrapping(s.firstChild.type);
        d = u && c.canReplaceWith(a, a, u[0]);
      }
      if (d)
        return l == 0 ? i.pos : l < 0 ? i.before(o + 1) : i.after(o + 1);
    }
  return null;
}
function ts(n, t, e = t, i = C.empty) {
  if (t == e && !i.size)
    return null;
  let s = n.resolve(t), r = n.resolve(e);
  return Aa(s, r, i) ? new X(t, e, i) : new Zd(s, r, i).fit();
}
function Aa(n, t, e) {
  return !e.openStart && !e.openEnd && n.start() == t.start() && n.parent.canReplace(n.index(), t.index(), e.content);
}
class Zd {
  constructor(t, e, i) {
    this.$from = t, this.$to = e, this.unplaced = i, this.frontier = [], this.placed = v.empty;
    for (let s = 0; s <= t.depth; s++) {
      let r = t.node(s);
      this.frontier.push({
        type: r.type,
        match: r.contentMatchAt(t.indexAfter(s))
      });
    }
    for (let s = t.depth; s > 0; s--)
      this.placed = v.from(t.node(s).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let t = this.mustMoveInline(), e = this.placed.size - this.depth - this.$from.depth, i = this.$from, s = this.close(t < 0 ? this.$to : i.doc.resolve(t));
    if (!s)
      return null;
    let r = this.placed, o = i.depth, l = s.depth;
    for (; o && l && r.childCount == 1; )
      r = r.firstChild.content, o--, l--;
    let a = new C(r, o, l);
    return t > -1 ? new Q(i.pos, t, this.$to.pos, this.$to.end(), a, e) : a.size || i.pos != this.$to.pos ? new X(i.pos, s.pos, a) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let t = this.unplaced.openStart;
    for (let e = this.unplaced.content, i = 0, s = this.unplaced.openEnd; i < t; i++) {
      let r = e.firstChild;
      if (e.childCount > 1 && (s = 0), r.type.spec.isolating && s <= i) {
        t = i;
        break;
      }
      e = r.content;
    }
    for (let e = 1; e <= 2; e++)
      for (let i = e == 1 ? t : this.unplaced.openStart; i >= 0; i--) {
        let s, r = null;
        i ? (r = ks(this.unplaced.content, i - 1).firstChild, s = r.content) : s = this.unplaced.content;
        let o = s.firstChild;
        for (let l = this.depth; l >= 0; l--) {
          let { type: a, match: c } = this.frontier[l], d, u = null;
          if (e == 1 && (o ? c.matchType(o.type) || (u = c.fillBefore(v.from(o), !1)) : r && a.compatibleContent(r.type)))
            return { sliceDepth: i, frontierDepth: l, parent: r, inject: u };
          if (e == 2 && o && (d = c.findWrapping(o.type)))
            return { sliceDepth: i, frontierDepth: l, parent: r, wrap: d };
          if (r && c.matchType(r.type))
            break;
        }
      }
  }
  openMore() {
    let { content: t, openStart: e, openEnd: i } = this.unplaced, s = ks(t, e);
    return !s.childCount || s.firstChild.isLeaf ? !1 : (this.unplaced = new C(t, e + 1, Math.max(i, s.size + e >= t.size - i ? e + 1 : 0)), !0);
  }
  dropNode() {
    let { content: t, openStart: e, openEnd: i } = this.unplaced, s = ks(t, e);
    if (s.childCount <= 1 && e > 0) {
      let r = t.size - e <= e + s.size;
      this.unplaced = new C(rn(t, e - 1, 1), e - 1, r ? e - 1 : i);
    } else
      this.unplaced = new C(rn(t, e, 1), e, i);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: t, frontierDepth: e, parent: i, inject: s, wrap: r }) {
    for (; this.depth > e; )
      this.closeFrontierNode();
    if (r)
      for (let g = 0; g < r.length; g++)
        this.openFrontierNode(r[g]);
    let o = this.unplaced, l = i ? i.content : o.content, a = o.openStart - t, c = 0, d = [], { match: u, type: p } = this.frontier[e];
    if (s) {
      for (let g = 0; g < s.childCount; g++)
        d.push(s.child(g));
      u = u.matchFragment(s);
    }
    let h = l.size + t - (o.content.size - o.openEnd);
    for (; c < l.childCount; ) {
      let g = l.child(c), m = u.matchType(g.type);
      if (!m)
        break;
      c++, (c > 1 || a == 0 || g.content.size) && (u = m, d.push(La(g.mark(p.allowedMarks(g.marks)), c == 1 ? a : 0, c == l.childCount ? h : -1)));
    }
    let f = c == l.childCount;
    f || (h = -1), this.placed = on(this.placed, e, v.from(d)), this.frontier[e].match = u, f && h < 0 && i && i.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let g = 0, m = l; g < h; g++) {
      let b = m.lastChild;
      this.frontier.push({ type: b.type, match: b.contentMatchAt(b.childCount) }), m = b.content;
    }
    this.unplaced = f ? t == 0 ? C.empty : new C(rn(o.content, t - 1, 1), t - 1, h < 0 ? o.openEnd : t - 1) : new C(rn(o.content, t, c), o.openStart, o.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let t = this.frontier[this.depth], e;
    if (!t.type.isTextblock || !xs(this.$to, this.$to.depth, t.type, t.match, !1) || this.$to.depth == this.depth && (e = this.findCloseLevel(this.$to)) && e.depth == this.depth)
      return -1;
    let { depth: i } = this.$to, s = this.$to.after(i);
    for (; i > 1 && s == this.$to.end(--i); )
      ++s;
    return s;
  }
  findCloseLevel(t) {
    t: for (let e = Math.min(this.depth, t.depth); e >= 0; e--) {
      let { match: i, type: s } = this.frontier[e], r = e < t.depth && t.end(e + 1) == t.pos + (t.depth - (e + 1)), o = xs(t, e, s, i, r);
      if (o) {
        for (let l = e - 1; l >= 0; l--) {
          let { match: a, type: c } = this.frontier[l], d = xs(t, l, c, a, !0);
          if (!d || d.childCount)
            continue t;
        }
        return { depth: e, fit: o, move: r ? t.doc.resolve(t.after(e + 1)) : t };
      }
    }
  }
  close(t) {
    let e = this.findCloseLevel(t);
    if (!e)
      return null;
    for (; this.depth > e.depth; )
      this.closeFrontierNode();
    e.fit.childCount && (this.placed = on(this.placed, e.depth, e.fit)), t = e.move;
    for (let i = e.depth + 1; i <= t.depth; i++) {
      let s = t.node(i), r = s.type.contentMatch.fillBefore(s.content, !0, t.index(i));
      this.openFrontierNode(s.type, s.attrs, r);
    }
    return t;
  }
  openFrontierNode(t, e = null, i) {
    let s = this.frontier[this.depth];
    s.match = s.match.matchType(t), this.placed = on(this.placed, this.depth, v.from(t.create(e, i))), this.frontier.push({ type: t, match: t.contentMatch });
  }
  closeFrontierNode() {
    let e = this.frontier.pop().match.fillBefore(v.empty, !0);
    e.childCount && (this.placed = on(this.placed, this.frontier.length, e));
  }
}
function rn(n, t, e) {
  return t == 0 ? n.cutByIndex(e, n.childCount) : n.replaceChild(0, n.firstChild.copy(rn(n.firstChild.content, t - 1, e)));
}
function on(n, t, e) {
  return t == 0 ? n.append(e) : n.replaceChild(n.childCount - 1, n.lastChild.copy(on(n.lastChild.content, t - 1, e)));
}
function ks(n, t) {
  for (let e = 0; e < t; e++)
    n = n.firstChild.content;
  return n;
}
function La(n, t, e) {
  if (t <= 0)
    return n;
  let i = n.content;
  return t > 1 && (i = i.replaceChild(0, La(i.firstChild, t - 1, i.childCount == 1 ? e - 1 : 0))), t > 0 && (i = n.type.contentMatch.fillBefore(i).append(i), e <= 0 && (i = i.append(n.type.contentMatch.matchFragment(i).fillBefore(v.empty, !0)))), n.copy(i);
}
function xs(n, t, e, i, s) {
  let r = n.node(t), o = s ? n.indexAfter(t) : n.index(t);
  if (o == r.childCount && !e.compatibleContent(r.type))
    return null;
  let l = i.fillBefore(r.content, !0, o);
  return l && !tu(e, r.content, o) ? l : null;
}
function tu(n, t, e) {
  for (let i = e; i < t.childCount; i++)
    if (!n.allowsMarks(t.child(i).marks))
      return !0;
  return !1;
}
function eu(n) {
  return n.spec.defining || n.spec.definingForContent;
}
function nu(n, t, e, i) {
  if (!i.size)
    return n.deleteRange(t, e);
  let s = n.doc.resolve(t), r = n.doc.resolve(e);
  if (Aa(s, r, i))
    return n.step(new X(t, e, i));
  let o = Oa(s, r);
  o[o.length - 1] == 0 && o.pop();
  let l = -(s.depth + 1);
  o.unshift(l);
  for (let p = s.depth, h = s.pos - 1; p > 0; p--, h--) {
    let f = s.node(p).type.spec;
    if (f.defining || f.definingAsContext || f.isolating)
      break;
    o.indexOf(p) > -1 ? l = p : s.before(p) == h && o.splice(1, 0, -p);
  }
  let a = o.indexOf(l), c = [], d = i.openStart;
  for (let p = i.content, h = 0; ; h++) {
    let f = p.firstChild;
    if (c.push(f), h == i.openStart)
      break;
    p = f.content;
  }
  for (let p = d - 1; p >= 0; p--) {
    let h = c[p], f = eu(h.type);
    if (f && !h.sameMarkup(s.node(Math.abs(l) - 1)))
      d = p;
    else if (f || !h.type.isTextblock)
      break;
  }
  for (let p = i.openStart; p >= 0; p--) {
    let h = (p + d + 1) % (i.openStart + 1), f = c[h];
    if (f)
      for (let g = 0; g < o.length; g++) {
        let m = o[(g + a) % o.length], b = !0;
        m < 0 && (b = !1, m = -m);
        let y = s.node(m - 1), w = s.index(m - 1);
        if (y.canReplaceWith(w, w, f.type, f.marks))
          return n.replace(s.before(m), b ? r.after(m) : e, new C(Na(i.content, 0, i.openStart, h), h, i.openEnd));
      }
  }
  let u = n.steps.length;
  for (let p = o.length - 1; p >= 0 && (n.replace(t, e, i), !(n.steps.length > u)); p--) {
    let h = o[p];
    h < 0 || (t = s.before(h), e = r.after(h));
  }
}
function Na(n, t, e, i, s) {
  if (t < e) {
    let r = n.firstChild;
    n = n.replaceChild(0, r.copy(Na(r.content, t + 1, e, i, r)));
  }
  if (t > i) {
    let r = s.contentMatchAt(0), o = r.fillBefore(n).append(n);
    n = o.append(r.matchFragment(o).fillBefore(v.empty, !0));
  }
  return n;
}
function iu(n, t, e, i) {
  if (!i.isInline && t == e && n.doc.resolve(t).parent.content.size) {
    let s = Qd(n.doc, t, i.type);
    s != null && (t = e = s);
  }
  n.replaceRange(t, e, new C(v.from(i), 0, 0));
}
function su(n, t, e) {
  let i = n.doc.resolve(t), s = n.doc.resolve(e), r = Oa(i, s);
  for (let o = 0; o < r.length; o++) {
    let l = r[o], a = o == r.length - 1;
    if (a && l == 0 || i.node(l).type.contentMatch.validEnd)
      return n.delete(i.start(l), s.end(l));
    if (l > 0 && (a || i.node(l - 1).canReplace(i.index(l - 1), s.indexAfter(l - 1))))
      return n.delete(i.before(l), s.after(l));
  }
  for (let o = 1; o <= i.depth && o <= s.depth; o++)
    if (t - i.start(o) == i.depth - o && e > i.end(o) && s.end(o) - e != s.depth - o && i.start(o - 1) == s.start(o - 1) && i.node(o - 1).canReplace(i.index(o - 1), s.index(o - 1)))
      return n.delete(i.before(o), e);
  n.delete(t, e);
}
function Oa(n, t) {
  let e = [], i = Math.min(n.depth, t.depth);
  for (let s = i; s >= 0; s--) {
    let r = n.start(s);
    if (r < n.pos - (n.depth - s) || t.end(s) > t.pos + (t.depth - s) || n.node(s).type.spec.isolating || t.node(s).type.spec.isolating)
      break;
    (r == t.start(s) || s == n.depth && s == t.depth && n.parent.inlineContent && t.parent.inlineContent && s && t.start(s - 1) == r - 1) && e.push(s);
  }
  return e;
}
class Ue extends dt {
  /**
  Construct an attribute step.
  */
  constructor(t, e, i) {
    super(), this.pos = t, this.attr = e, this.value = i;
  }
  apply(t) {
    let e = t.nodeAt(this.pos);
    if (!e)
      return G.fail("No node at attribute step's position");
    let i = /* @__PURE__ */ Object.create(null);
    for (let r in e.attrs)
      i[r] = e.attrs[r];
    i[this.attr] = this.value;
    let s = e.type.create(i, null, e.marks);
    return G.fromReplace(t, this.pos, this.pos + 1, new C(v.from(s), 0, e.isLeaf ? 0 : 1));
  }
  getMap() {
    return bt.empty;
  }
  invert(t) {
    return new Ue(this.pos, this.attr, t.nodeAt(this.pos).attrs[this.attr]);
  }
  map(t) {
    let e = t.mapResult(this.pos, 1);
    return e.deletedAfter ? null : new Ue(e.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(t, e) {
    if (typeof e.pos != "number" || typeof e.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new Ue(e.pos, e.attr, e.value);
  }
}
dt.jsonID("attr", Ue);
class Cn extends dt {
  /**
  Construct an attribute step.
  */
  constructor(t, e) {
    super(), this.attr = t, this.value = e;
  }
  apply(t) {
    let e = /* @__PURE__ */ Object.create(null);
    for (let s in t.attrs)
      e[s] = t.attrs[s];
    e[this.attr] = this.value;
    let i = t.type.create(e, t.content, t.marks);
    return G.ok(i);
  }
  getMap() {
    return bt.empty;
  }
  invert(t) {
    return new Cn(this.attr, t.attrs[this.attr]);
  }
  map(t) {
    return this;
  }
  toJSON() {
    return { stepType: "docAttr", attr: this.attr, value: this.value };
  }
  static fromJSON(t, e) {
    if (typeof e.attr != "string")
      throw new RangeError("Invalid input for DocAttrStep.fromJSON");
    return new Cn(e.attr, e.value);
  }
}
dt.jsonID("docAttr", Cn);
let Ke = class extends Error {
};
Ke = function n(t) {
  let e = Error.call(this, t);
  return e.__proto__ = n.prototype, e;
};
Ke.prototype = Object.create(Error.prototype);
Ke.prototype.constructor = Ke;
Ke.prototype.name = "TransformError";
class Pr {
  /**
  Create a transform that starts with the given document.
  */
  constructor(t) {
    this.doc = t, this.steps = [], this.docs = [], this.mapping = new xn();
  }
  /**
  The starting document.
  */
  get before() {
    return this.docs.length ? this.docs[0] : this.doc;
  }
  /**
  Apply a new step in this transform, saving the result. Throws an
  error when the step fails.
  */
  step(t) {
    let e = this.maybeStep(t);
    if (e.failed)
      throw new Ke(e.failed);
    return this;
  }
  /**
  Try to apply a step in this transformation, ignoring it if it
  fails. Returns the step result.
  */
  maybeStep(t) {
    let e = t.apply(this.doc);
    return e.failed || this.addStep(t, e.doc), e;
  }
  /**
  True when the document has been changed (when there are any
  steps).
  */
  get docChanged() {
    return this.steps.length > 0;
  }
  /**
  Return a single range, in post-transform document positions,
  that covers all content changed by this transform. Returns null
  if no replacements are made. Note that this will ignore changes
  that add/remove marks without replacing the underlying content.
  */
  changedRange() {
    let t = 1e9, e = -1e9;
    for (let i = 0; i < this.mapping.maps.length; i++) {
      let s = this.mapping.maps[i];
      i && (t = s.map(t, 1), e = s.map(e, -1)), s.forEach((r, o, l, a) => {
        t = Math.min(t, l), e = Math.max(e, a);
      });
    }
    return t == 1e9 ? null : { from: t, to: e };
  }
  /**
  @internal
  */
  addStep(t, e) {
    this.docs.push(this.doc), this.steps.push(t), this.mapping.appendMap(t.getMap()), this.doc = e;
  }
  /**
  Replace the part of the document between `from` and `to` with the
  given `slice`.
  */
  replace(t, e = t, i = C.empty) {
    let s = ts(this.doc, t, e, i);
    return s && this.step(s), this;
  }
  /**
  Replace the given range with the given content, which may be a
  fragment, node, or array of nodes.
  */
  replaceWith(t, e, i) {
    return this.replace(t, e, new C(v.from(i), 0, 0));
  }
  /**
  Delete the content between the given positions.
  */
  delete(t, e) {
    return this.replace(t, e, C.empty);
  }
  /**
  Insert the given content at the given position.
  */
  insert(t, e) {
    return this.replaceWith(t, t, e);
  }
  /**
  Replace a range of the document with a given slice, using
  `from`, `to`, and the slice's
  [`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
  than fixed start and end points. This method may grow the
  replaced area or close open nodes in the slice in order to get a
  fit that is more in line with WYSIWYG expectations, by dropping
  fully covered parent nodes of the replaced region when they are
  marked [non-defining as
  context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
  open parent node from the slice that _is_ marked as [defining
  its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
  
  This is the method, for example, to handle paste. The similar
  [`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
  primitive tool which will _not_ move the start and end of its given
  range, and is useful in situations where you need more precise
  control over what happens.
  */
  replaceRange(t, e, i) {
    return nu(this, t, e, i), this;
  }
  /**
  Replace the given range with a node, but use `from` and `to` as
  hints, rather than precise positions. When from and to are the same
  and are at the start or end of a parent node in which the given
  node doesn't fit, this method may _move_ them out towards a parent
  that does allow the given node to be placed. When the given range
  completely covers a parent node, this method may completely replace
  that parent node.
  */
  replaceRangeWith(t, e, i) {
    return iu(this, t, e, i), this;
  }
  /**
  Delete the given range, expanding it to cover fully covered
  parent nodes until a valid replace is found.
  */
  deleteRange(t, e) {
    return su(this, t, e), this;
  }
  /**
  Split the content in the given range off from its parent, if there
  is sibling content before or after it, and move it up the tree to
  the depth specified by `target`. You'll probably want to use
  [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
  sure the lift is valid.
  */
  lift(t, e) {
    return Fd(this, t, e), this;
  }
  /**
  Join the blocks around the given position. If depth is 2, their
  last and first siblings are also joined, and so on.
  */
  join(t, e = 1) {
    return Xd(this, t, e), this;
  }
  /**
  Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
  The wrappers are assumed to be valid in this position, and should
  probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
  */
  wrap(t, e) {
    return Ud(this, t, e), this;
  }
  /**
  Set the type of all textblocks (partly) between `from` and `to` to
  the given node type with the given attributes.
  */
  setBlockType(t, e = t, i, s = null) {
    return Wd(this, t, e, i, s), this;
  }
  /**
  Change the type, attributes, and/or marks of the node at `pos`.
  When `type` isn't given, the existing node type is preserved,
  */
  setNodeMarkup(t, e, i = null, s) {
    return Jd(this, t, e, i, s), this;
  }
  /**
  Set a single attribute on a given node to a new value.
  The `pos` addresses the document content. Use `setDocAttribute`
  to set attributes on the document itself.
  */
  setNodeAttribute(t, e, i) {
    return this.step(new Ue(t, e, i)), this;
  }
  /**
  Set a single attribute on the document to a new value.
  */
  setDocAttribute(t, e) {
    return this.step(new Cn(t, e)), this;
  }
  /**
  Add a mark to the node at position `pos`.
  */
  addNodeMark(t, e) {
    return this.step(new ne(t, e)), this;
  }
  /**
  Remove a mark (or all marks of the given type) from the node at
  position `pos`.
  */
  removeNodeMark(t, e) {
    let i = this.doc.nodeAt(t);
    if (!i)
      throw new RangeError("No node at position " + t);
    if (e instanceof B)
      e.isInSet(i.marks) && this.step(new Te(t, e));
    else {
      let s = i.marks, r, o = [];
      for (; r = e.isInSet(s); )
        o.push(new Te(t, r)), s = r.removeFromSet(s);
      for (let l = o.length - 1; l >= 0; l--)
        this.step(o[l]);
    }
    return this;
  }
  /**
  Split the node at the given position, and optionally, if `depth` is
  greater than one, any number of nodes above that. By default, the
  parts split off will inherit the node type of the original node.
  This can be changed by passing an array of types and attributes to
  use after the split (with the outermost nodes coming first).
  */
  split(t, e = 1, i) {
    return Gd(this, t, e, i), this;
  }
  /**
  Add the given mark to the inline content between `from` and `to`.
  */
  addMark(t, e, i) {
    return $d(this, t, e, i), this;
  }
  /**
  Remove marks from inline nodes between `from` and `to`. When
  `mark` is a single mark, remove precisely that mark. When it is
  a mark type, remove all marks of that type. When it is null,
  remove all marks of any type.
  */
  removeMark(t, e, i) {
    return zd(this, t, e, i), this;
  }
  /**
  Removes all marks and nodes from the content of the node at
  `pos` that don't match the given new parent node type. Accepts
  an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
  third argument.
  */
  clearIncompatible(t, e, i) {
    return Ir(this, t, e, i), this;
  }
}
const Cs = /* @__PURE__ */ Object.create(null);
class L {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(t, e, i) {
    this.$anchor = t, this.$head = e, this.ranges = i || [new Ra(t.min(e), t.max(e))];
  }
  /**
  The selection's anchor, as an unresolved position.
  */
  get anchor() {
    return this.$anchor.pos;
  }
  /**
  The selection's head.
  */
  get head() {
    return this.$head.pos;
  }
  /**
  The lower bound of the selection's main range.
  */
  get from() {
    return this.$from.pos;
  }
  /**
  The upper bound of the selection's main range.
  */
  get to() {
    return this.$to.pos;
  }
  /**
  The resolved lower  bound of the selection's main range.
  */
  get $from() {
    return this.ranges[0].$from;
  }
  /**
  The resolved upper bound of the selection's main range.
  */
  get $to() {
    return this.ranges[0].$to;
  }
  /**
  Indicates whether the selection contains any content.
  */
  get empty() {
    let t = this.ranges;
    for (let e = 0; e < t.length; e++)
      if (t[e].$from.pos != t[e].$to.pos)
        return !1;
    return !0;
  }
  /**
  Get the content of this selection as a slice.
  */
  content() {
    return this.$from.doc.slice(this.from, this.to, !0);
  }
  /**
  Replace the selection with a slice or, if no slice is given,
  delete the selection. Will append to the given transaction.
  */
  replace(t, e = C.empty) {
    let i = e.content.lastChild, s = null;
    for (let l = 0; l < e.openEnd; l++)
      s = i, i = i.lastChild;
    let r = t.steps.length, o = this.ranges;
    for (let l = 0; l < o.length; l++) {
      let { $from: a, $to: c } = o[l], d = t.mapping.slice(r);
      t.replaceRange(d.map(a.pos), d.map(c.pos), l ? C.empty : e), l == 0 && Oo(t, r, (i ? i.isInline : s && s.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(t, e) {
    let i = t.steps.length, s = this.ranges;
    for (let r = 0; r < s.length; r++) {
      let { $from: o, $to: l } = s[r], a = t.mapping.slice(i), c = a.map(o.pos), d = a.map(l.pos);
      r ? t.deleteRange(c, d) : (t.replaceRangeWith(c, d, e), Oo(t, i, e.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(t, e, i = !1) {
    let s = t.parent.inlineContent ? new T(t) : $e(t.node(0), t.parent, t.pos, t.index(), e, i);
    if (s)
      return s;
    for (let r = t.depth - 1; r >= 0; r--) {
      let o = e < 0 ? $e(t.node(0), t.node(r), t.before(r + 1), t.index(r), e, i) : $e(t.node(0), t.node(r), t.after(r + 1), t.index(r) + 1, e, i);
      if (o)
        return o;
    }
    return null;
  }
  /**
  Find a valid cursor or leaf node selection near the given
  position. Searches forward first by default, but if `bias` is
  negative, it will search backwards first.
  */
  static near(t, e = 1) {
    return this.findFrom(t, e) || this.findFrom(t, -e) || new vt(t.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(t) {
    return $e(t, t, 0, 0, 1) || new vt(t);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(t) {
    return $e(t, t, t.content.size, t.childCount, -1) || new vt(t);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(t, e) {
    if (!e || !e.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let i = Cs[e.type];
    if (!i)
      throw new RangeError(`No selection type ${e.type} defined`);
    return i.fromJSON(t, e);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(t, e) {
    if (t in Cs)
      throw new RangeError("Duplicate use of selection JSON ID " + t);
    return Cs[t] = e, e.prototype.jsonID = t, e;
  }
  /**
  Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
  which is a value that can be mapped without having access to a
  current document, and later resolved to a real selection for a
  given document again. (This is used mostly by the history to
  track and restore old selections.) The default implementation of
  this method just converts the selection to a text selection and
  returns the bookmark for that.
  */
  getBookmark() {
    return T.between(this.$anchor, this.$head).getBookmark();
  }
}
L.prototype.visible = !0;
class Ra {
  /**
  Create a range.
  */
  constructor(t, e) {
    this.$from = t, this.$to = e;
  }
}
let Lo = !1;
function No(n) {
  !Lo && !n.parent.inlineContent && (Lo = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + n.parent.type.name + ")"));
}
class T extends L {
  /**
  Construct a text selection between the given points.
  */
  constructor(t, e = t) {
    No(t), No(e), super(t, e);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(t, e) {
    let i = t.resolve(e.map(this.head));
    if (!i.parent.inlineContent)
      return L.near(i);
    let s = t.resolve(e.map(this.anchor));
    return new T(s.parent.inlineContent ? s : i, i);
  }
  replace(t, e = C.empty) {
    if (super.replace(t, e), e == C.empty) {
      let i = this.$from.marksAcross(this.$to);
      i && t.ensureMarks(i);
    }
  }
  eq(t) {
    return t instanceof T && t.anchor == this.anchor && t.head == this.head;
  }
  getBookmark() {
    return new es(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new T(t.resolve(e.anchor), t.resolve(e.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(t, e, i = e) {
    let s = t.resolve(e);
    return new this(s, i == e ? s : t.resolve(i));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(t, e, i) {
    let s = t.pos - e.pos;
    if ((!i || s) && (i = s >= 0 ? 1 : -1), !e.parent.inlineContent) {
      let r = L.findFrom(e, i, !0) || L.findFrom(e, -i, !0);
      if (r)
        e = r.$head;
      else
        return L.near(e, i);
    }
    return t.parent.inlineContent || (s == 0 ? t = e : (t = (L.findFrom(t, -i, !0) || L.findFrom(t, i, !0)).$anchor, t.pos < e.pos != s < 0 && (t = e))), new T(t, e);
  }
}
L.jsonID("text", T);
class es {
  constructor(t, e) {
    this.anchor = t, this.head = e;
  }
  map(t) {
    return new es(t.map(this.anchor), t.map(this.head));
  }
  resolve(t) {
    return T.between(t.resolve(this.anchor), t.resolve(this.head));
  }
}
class _ extends L {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(t) {
    let e = t.nodeAfter, i = t.node(0).resolve(t.pos + e.nodeSize);
    super(t, i), this.node = e;
  }
  map(t, e) {
    let { deleted: i, pos: s } = e.mapResult(this.anchor), r = t.resolve(s);
    return i ? L.near(r) : new _(r);
  }
  content() {
    return new C(v.from(this.node), 0, 0);
  }
  eq(t) {
    return t instanceof _ && t.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Br(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new _(t.resolve(e.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(t, e) {
    return new _(t.resolve(e));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(t) {
    return !t.isText && t.type.spec.selectable !== !1;
  }
}
_.prototype.visible = !1;
L.jsonID("node", _);
class Br {
  constructor(t) {
    this.anchor = t;
  }
  map(t) {
    let { deleted: e, pos: i } = t.mapResult(this.anchor);
    return e ? new es(i, i) : new Br(i);
  }
  resolve(t) {
    let e = t.resolve(this.anchor), i = e.nodeAfter;
    return i && _.isSelectable(i) ? new _(e) : L.near(e);
  }
}
class vt extends L {
  /**
  Create an all-selection over the given document.
  */
  constructor(t) {
    super(t.resolve(0), t.resolve(t.content.size));
  }
  replace(t, e = C.empty) {
    if (e == C.empty) {
      t.delete(0, t.doc.content.size);
      let i = L.atStart(t.doc);
      i.eq(t.selection) || t.setSelection(i);
    } else
      super.replace(t, e);
  }
  toJSON() {
    return { type: "all" };
  }
  /**
  @internal
  */
  static fromJSON(t) {
    return new vt(t);
  }
  map(t) {
    return new vt(t);
  }
  eq(t) {
    return t instanceof vt;
  }
  getBookmark() {
    return ru;
  }
}
L.jsonID("all", vt);
const ru = {
  map() {
    return this;
  },
  resolve(n) {
    return new vt(n);
  }
};
function $e(n, t, e, i, s, r = !1) {
  if (t.inlineContent)
    return T.create(n, e);
  for (let o = i - (s > 0 ? 0 : 1); s > 0 ? o < t.childCount : o >= 0; o += s) {
    let l = t.child(o);
    if (l.isAtom) {
      if (!r && _.isSelectable(l))
        return _.create(n, e - (s < 0 ? l.nodeSize : 0));
    } else {
      let a = $e(n, l, e + s, s < 0 ? l.childCount : 0, s, r);
      if (a)
        return a;
    }
    e += l.nodeSize * s;
  }
  return null;
}
function Oo(n, t, e) {
  let i = n.steps.length - 1;
  if (i < t)
    return;
  let s = n.steps[i];
  if (!(s instanceof X || s instanceof Q))
    return;
  let r = n.mapping.maps[i], o;
  r.forEach((l, a, c, d) => {
    o == null && (o = d);
  }), n.setSelection(L.near(n.doc.resolve(o), e));
}
const Ro = 1, zn = 2, Io = 4;
class ou extends Pr {
  /**
  @internal
  */
  constructor(t) {
    super(t.doc), this.curSelectionFor = 0, this.updated = 0, this.meta = /* @__PURE__ */ Object.create(null), this.time = Date.now(), this.curSelection = t.selection, this.storedMarks = t.storedMarks;
  }
  /**
  The transaction's current selection. This defaults to the editor
  selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
  transaction, but can be overwritten with
  [`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
  */
  get selection() {
    return this.curSelectionFor < this.steps.length && (this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor)), this.curSelectionFor = this.steps.length), this.curSelection;
  }
  /**
  Update the transaction's current selection. Will determine the
  selection that the editor gets when the transaction is applied.
  */
  setSelection(t) {
    if (t.$from.doc != this.doc)
      throw new RangeError("Selection passed to setSelection must point at the current document");
    return this.curSelection = t, this.curSelectionFor = this.steps.length, this.updated = (this.updated | Ro) & ~zn, this.storedMarks = null, this;
  }
  /**
  Whether the selection was explicitly updated by this transaction.
  */
  get selectionSet() {
    return (this.updated & Ro) > 0;
  }
  /**
  Set the current stored marks.
  */
  setStoredMarks(t) {
    return this.storedMarks = t, this.updated |= zn, this;
  }
  /**
  Make sure the current stored marks or, if that is null, the marks
  at the selection, match the given set of marks. Does nothing if
  this is already the case.
  */
  ensureMarks(t) {
    return B.sameSet(this.storedMarks || this.selection.$from.marks(), t) || this.setStoredMarks(t), this;
  }
  /**
  Add a mark to the set of stored marks.
  */
  addStoredMark(t) {
    return this.ensureMarks(t.addToSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Remove a mark or mark type from the set of stored marks.
  */
  removeStoredMark(t) {
    return this.ensureMarks(t.removeFromSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Whether the stored marks were explicitly set for this transaction.
  */
  get storedMarksSet() {
    return (this.updated & zn) > 0;
  }
  /**
  @internal
  */
  addStep(t, e) {
    super.addStep(t, e), this.updated = this.updated & ~zn, this.storedMarks = null;
  }
  /**
  Update the timestamp for the transaction.
  */
  setTime(t) {
    return this.time = t, this;
  }
  /**
  Replace the current selection with the given slice.
  */
  replaceSelection(t) {
    return this.selection.replace(this, t), this;
  }
  /**
  Replace the selection with the given node. When `inheritMarks` is
  true and the content is inline, it inherits the marks from the
  place where it is inserted.
  */
  replaceSelectionWith(t, e = !0) {
    let i = this.selection;
    return e && (t = t.mark(this.storedMarks || (i.empty ? i.$from.marks() : i.$from.marksAcross(i.$to) || B.none))), i.replaceWith(this, t), this;
  }
  /**
  Delete the selection.
  */
  deleteSelection() {
    return this.selection.replace(this), this;
  }
  /**
  Replace the given range, or the selection if no range is given,
  with a text node containing the given string.
  */
  insertText(t, e, i) {
    let s = this.doc.type.schema;
    if (e == null)
      return t ? this.replaceSelectionWith(s.text(t), !0) : this.deleteSelection();
    {
      if (i == null && (i = e), !t)
        return this.deleteRange(e, i);
      let r = this.storedMarks;
      if (!r) {
        let o = this.doc.resolve(e);
        r = i == e ? o.marks() : o.marksAcross(this.doc.resolve(i));
      }
      return this.replaceRangeWith(e, i, s.text(t, r)), !this.selection.empty && this.selection.to == e + t.length && this.setSelection(L.near(this.selection.$to)), this;
    }
  }
  /**
  Store a metadata property in this transaction, keyed either by
  name or by plugin.
  */
  setMeta(t, e) {
    return this.meta[typeof t == "string" ? t : t.key] = e, this;
  }
  /**
  Retrieve a metadata property for a given name or plugin.
  */
  getMeta(t) {
    return this.meta[typeof t == "string" ? t : t.key];
  }
  /**
  Returns true if this transaction doesn't contain any metadata,
  and can thus safely be extended.
  */
  get isGeneric() {
    for (let t in this.meta)
      return !1;
    return !0;
  }
  /**
  Indicate that the editor should scroll the selection into view
  when updated to the state produced by this transaction.
  */
  scrollIntoView() {
    return this.updated |= Io, this;
  }
  /**
  True when this transaction has had `scrollIntoView` called on it.
  */
  get scrolledIntoView() {
    return (this.updated & Io) > 0;
  }
}
function Do(n, t) {
  return !t || !n ? n : n.bind(t);
}
class ln {
  constructor(t, e, i) {
    this.name = t, this.init = Do(e.init, i), this.apply = Do(e.apply, i);
  }
}
const lu = [
  new ln("doc", {
    init(n) {
      return n.doc || n.schema.topNodeType.createAndFill();
    },
    apply(n) {
      return n.doc;
    }
  }),
  new ln("selection", {
    init(n, t) {
      return n.selection || L.atStart(t.doc);
    },
    apply(n) {
      return n.selection;
    }
  }),
  new ln("storedMarks", {
    init(n) {
      return n.storedMarks || null;
    },
    apply(n, t, e, i) {
      return i.selection.$cursor ? n.storedMarks : null;
    }
  }),
  new ln("scrollToSelection", {
    init() {
      return 0;
    },
    apply(n, t) {
      return n.scrolledIntoView ? t + 1 : t;
    }
  })
];
class Ss {
  constructor(t, e) {
    this.schema = t, this.plugins = [], this.pluginsByKey = /* @__PURE__ */ Object.create(null), this.fields = lu.slice(), e && e.forEach((i) => {
      if (this.pluginsByKey[i.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + i.key + ")");
      this.plugins.push(i), this.pluginsByKey[i.key] = i, i.spec.state && this.fields.push(new ln(i.key, i.spec.state, i));
    });
  }
}
class Ve {
  /**
  @internal
  */
  constructor(t) {
    this.config = t;
  }
  /**
  The schema of the state's document.
  */
  get schema() {
    return this.config.schema;
  }
  /**
  The plugins that are active in this state.
  */
  get plugins() {
    return this.config.plugins;
  }
  /**
  Apply the given transaction to produce a new state.
  */
  apply(t) {
    return this.applyTransaction(t).state;
  }
  /**
  @internal
  */
  filterTransaction(t, e = -1) {
    for (let i = 0; i < this.config.plugins.length; i++)
      if (i != e) {
        let s = this.config.plugins[i];
        if (s.spec.filterTransaction && !s.spec.filterTransaction.call(s, t, this))
          return !1;
      }
    return !0;
  }
  /**
  Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
  returns the precise transactions that were applied (which might
  be influenced by the [transaction
  hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
  plugins) along with the new state.
  */
  applyTransaction(t) {
    if (!this.filterTransaction(t))
      return { state: this, transactions: [] };
    let e = [t], i = this.applyInner(t), s = null;
    for (; ; ) {
      let r = !1;
      for (let o = 0; o < this.config.plugins.length; o++) {
        let l = this.config.plugins[o];
        if (l.spec.appendTransaction) {
          let a = s ? s[o].n : 0, c = s ? s[o].state : this, d = a < e.length && l.spec.appendTransaction.call(l, a ? e.slice(a) : e, c, i);
          if (d && i.filterTransaction(d, o)) {
            if (d.setMeta("appendedTransaction", t), !s) {
              s = [];
              for (let u = 0; u < this.config.plugins.length; u++)
                s.push(u < o ? { state: i, n: e.length } : { state: this, n: 0 });
            }
            e.push(d), i = i.applyInner(d), r = !0;
          }
          s && (s[o] = { state: i, n: e.length });
        }
      }
      if (!r)
        return { state: i, transactions: e };
    }
  }
  /**
  @internal
  */
  applyInner(t) {
    if (!t.before.eq(this.doc))
      throw new RangeError("Applying a mismatched transaction");
    let e = new Ve(this.config), i = this.config.fields;
    for (let s = 0; s < i.length; s++) {
      let r = i[s];
      e[r.name] = r.apply(t, this[r.name], this, e);
    }
    return e;
  }
  /**
  Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
  */
  get tr() {
    return new ou(this);
  }
  /**
  Create a new state.
  */
  static create(t) {
    let e = new Ss(t.doc ? t.doc.type.schema : t.schema, t.plugins), i = new Ve(e);
    for (let s = 0; s < e.fields.length; s++)
      i[e.fields[s].name] = e.fields[s].init(t, i);
    return i;
  }
  /**
  Create a new state based on this one, but with an adjusted set
  of active plugins. State fields that exist in both sets of
  plugins are kept unchanged. Those that no longer exist are
  dropped, and those that are new are initialized using their
  [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
  configuration object..
  */
  reconfigure(t) {
    let e = new Ss(this.schema, t.plugins), i = e.fields, s = new Ve(e);
    for (let r = 0; r < i.length; r++) {
      let o = i[r].name;
      s[o] = this.hasOwnProperty(o) ? this[o] : i[r].init(t, s);
    }
    return s;
  }
  /**
  Serialize this state to JSON. If you want to serialize the state
  of plugins, pass an object mapping property names to use in the
  resulting JSON object to plugin objects. The argument may also be
  a string or number, in which case it is ignored, to support the
  way `JSON.stringify` calls `toString` methods.
  */
  toJSON(t) {
    let e = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
    if (this.storedMarks && (e.storedMarks = this.storedMarks.map((i) => i.toJSON())), t && typeof t == "object")
      for (let i in t) {
        if (i == "doc" || i == "selection")
          throw new RangeError("The JSON fields `doc` and `selection` are reserved");
        let s = t[i], r = s.spec.state;
        r && r.toJSON && (e[i] = r.toJSON.call(s, this[s.key]));
      }
    return e;
  }
  /**
  Deserialize a JSON representation of a state. `config` should
  have at least a `schema` field, and should contain array of
  plugins to initialize the state with. `pluginFields` can be used
  to deserialize the state of plugins, by associating plugin
  instances with the property names they use in the JSON object.
  */
  static fromJSON(t, e, i) {
    if (!e)
      throw new RangeError("Invalid input for EditorState.fromJSON");
    if (!t.schema)
      throw new RangeError("Required config field 'schema' missing");
    let s = new Ss(t.schema, t.plugins), r = new Ve(s);
    return s.fields.forEach((o) => {
      if (o.name == "doc")
        r.doc = se.fromJSON(t.schema, e.doc);
      else if (o.name == "selection")
        r.selection = L.fromJSON(r.doc, e.selection);
      else if (o.name == "storedMarks")
        e.storedMarks && (r.storedMarks = e.storedMarks.map(t.schema.markFromJSON));
      else {
        if (i)
          for (let l in i) {
            let a = i[l], c = a.spec.state;
            if (a.key == o.name && c && c.fromJSON && Object.prototype.hasOwnProperty.call(e, l)) {
              r[o.name] = c.fromJSON.call(a, t, e[l], r);
              return;
            }
          }
        r[o.name] = o.init(t, r);
      }
    }), r;
  }
}
function Ia(n, t, e) {
  for (let i in n) {
    let s = n[i];
    s instanceof Function ? s = s.bind(t) : i == "handleDOMEvents" && (s = Ia(s, t, {})), e[i] = s;
  }
  return e;
}
class V {
  /**
  Create a plugin.
  */
  constructor(t) {
    this.spec = t, this.props = {}, t.props && Ia(t.props, this, this.props), this.key = t.key ? t.key.key : Da("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(t) {
    return t[this.key];
  }
}
const Ms = /* @__PURE__ */ Object.create(null);
function Da(n) {
  return n in Ms ? n + "$" + ++Ms[n] : (Ms[n] = 0, n + "$");
}
class J {
  /**
  Create a plugin key.
  */
  constructor(t = "key") {
    this.key = Da(t);
  }
  /**
  Get the active plugin with this key, if any, from an editor
  state.
  */
  get(t) {
    return t.config.pluginsByKey[this.key];
  }
  /**
  Get the plugin's state from an editor state.
  */
  getState(t) {
    return t[this.key];
  }
}
const it = function(n) {
  for (var t = 0; ; t++)
    if (n = n.previousSibling, !n)
      return t;
}, Je = function(n) {
  let t = n.assignedSlot || n.parentNode;
  return t && t.nodeType == 11 ? t.host : t;
};
let tr = null;
const Vt = function(n, t, e) {
  let i = tr || (tr = document.createRange());
  return i.setEnd(n, e ?? n.nodeValue.length), i.setStart(n, t || 0), i;
}, au = function() {
  tr = null;
}, Ae = function(n, t, e, i) {
  return e && (Po(n, t, e, i, -1) || Po(n, t, e, i, 1));
}, cu = /^(img|br|input|textarea|hr)$/i;
function Po(n, t, e, i, s) {
  for (var r; ; ) {
    if (n == e && t == i)
      return !0;
    if (t == (s < 0 ? 0 : Ct(n))) {
      let o = n.parentNode;
      if (!o || o.nodeType != 1 || In(n) || cu.test(n.nodeName) || n.contentEditable == "false")
        return !1;
      t = it(n) + (s < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      let o = n.childNodes[t + (s < 0 ? -1 : 0)];
      if (o.nodeType == 1 && o.contentEditable == "false")
        if (!((r = o.pmViewDesc) === null || r === void 0) && r.ignoreForSelection)
          t += s;
        else
          return !1;
      else
        n = o, t = s < 0 ? Ct(n) : 0;
    } else
      return !1;
  }
}
function Ct(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function du(n, t) {
  for (; ; ) {
    if (n.nodeType == 3 && t)
      return n;
    if (n.nodeType == 1 && t > 0) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[t - 1], t = Ct(n);
    } else if (n.parentNode && !In(n))
      t = it(n), n = n.parentNode;
    else
      return null;
  }
}
function uu(n, t) {
  for (; ; ) {
    if (n.nodeType == 3 && t < n.nodeValue.length)
      return n;
    if (n.nodeType == 1 && t < n.childNodes.length) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[t], t = 0;
    } else if (n.parentNode && !In(n))
      t = it(n) + 1, n = n.parentNode;
    else
      return null;
  }
}
function pu(n, t, e) {
  for (let i = t == 0, s = t == Ct(n); i || s; ) {
    if (n == e)
      return !0;
    let r = it(n);
    if (n = n.parentNode, !n)
      return !1;
    i = i && r == 0, s = s && r == Ct(n);
  }
}
function In(n) {
  let t;
  for (let e = n; e && !(t = e.pmViewDesc); e = e.parentNode)
    ;
  return t && t.node && t.node.isBlock && (t.dom == n || t.contentDOM == n);
}
const ns = function(n) {
  return n.focusNode && Ae(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset);
};
function ge(n, t) {
  let e = document.createEvent("Event");
  return e.initEvent("keydown", !0, !0), e.keyCode = n, e.key = e.code = t, e;
}
function hu(n) {
  let t = n.activeElement;
  for (; t && t.shadowRoot; )
    t = t.shadowRoot.activeElement;
  return t;
}
function fu(n, t, e) {
  if (n.caretPositionFromPoint)
    try {
      let i = n.caretPositionFromPoint(t, e);
      if (i)
        return { node: i.offsetNode, offset: Math.min(Ct(i.offsetNode), i.offset) };
    } catch {
    }
  if (n.caretRangeFromPoint) {
    let i = n.caretRangeFromPoint(t, e);
    if (i)
      return { node: i.startContainer, offset: Math.min(Ct(i.startContainer), i.startOffset) };
  }
}
const Ot = typeof navigator < "u" ? navigator : null, Bo = typeof document < "u" ? document : null, pe = Ot && Ot.userAgent || "", er = /Edge\/(\d+)/.exec(pe), Pa = /MSIE \d/.exec(pe), nr = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(pe), mt = !!(Pa || nr || er), oe = Pa ? document.documentMode : nr ? +nr[1] : er ? +er[1] : 0, St = !mt && /gecko\/(\d+)/i.test(pe);
St && +(/Firefox\/(\d+)/.exec(pe) || [0, 0])[1];
const ir = !mt && /Chrome\/(\d+)/.exec(pe), rt = !!ir, Ba = ir ? +ir[1] : 0, at = !mt && !!Ot && /Apple Computer/.test(Ot.vendor), Ge = at && (/Mobile\/\w+/.test(pe) || !!Ot && Ot.maxTouchPoints > 2), xt = Ge || (Ot ? /Mac/.test(Ot.platform) : !1), Ha = Ot ? /Win/.test(Ot.platform) : !1, jt = /Android \d/.test(pe), Dn = !!Bo && "webkitFontSmoothing" in Bo.documentElement.style, mu = Dn ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function gu(n) {
  let t = n.defaultView && n.defaultView.visualViewport;
  return t ? {
    left: 0,
    right: t.width,
    top: 0,
    bottom: t.height
  } : {
    left: 0,
    right: n.documentElement.clientWidth,
    top: 0,
    bottom: n.documentElement.clientHeight
  };
}
function Ht(n, t) {
  return typeof n == "number" ? n : n[t];
}
function bu(n) {
  let t = n.getBoundingClientRect(), e = t.width / n.offsetWidth || 1, i = t.height / n.offsetHeight || 1;
  return {
    left: t.left,
    right: t.left + n.clientWidth * e,
    top: t.top,
    bottom: t.top + n.clientHeight * i
  };
}
function Ho(n, t, e) {
  let i = n.someProp("scrollThreshold") || 0, s = n.someProp("scrollMargin") || 5, r = n.dom.ownerDocument;
  for (let o = e || n.dom; o; ) {
    if (o.nodeType != 1) {
      o = Je(o);
      continue;
    }
    let l = o, a = l == r.body, c = a ? gu(r) : bu(l), d = 0, u = 0;
    if (t.top < c.top + Ht(i, "top") ? u = -(c.top - t.top + Ht(s, "top")) : t.bottom > c.bottom - Ht(i, "bottom") && (u = t.bottom - t.top > c.bottom - c.top ? t.top + Ht(s, "top") - c.top : t.bottom - c.bottom + Ht(s, "bottom")), t.left < c.left + Ht(i, "left") ? d = -(c.left - t.left + Ht(s, "left")) : t.right > c.right - Ht(i, "right") && (d = t.right - c.right + Ht(s, "right")), d || u)
      if (a)
        r.defaultView.scrollBy(d, u);
      else {
        let h = l.scrollLeft, f = l.scrollTop;
        u && (l.scrollTop += u), d && (l.scrollLeft += d);
        let g = l.scrollLeft - h, m = l.scrollTop - f;
        t = { left: t.left - g, top: t.top - m, right: t.right - g, bottom: t.bottom - m };
      }
    let p = a ? "fixed" : getComputedStyle(o).position;
    if (/^(fixed|sticky)$/.test(p))
      break;
    o = p == "absolute" ? o.offsetParent : Je(o);
  }
}
function yu(n) {
  let t = n.dom.getBoundingClientRect(), e = Math.max(0, t.top), i, s;
  for (let r = (t.left + t.right) / 2, o = e + 1; o < Math.min(innerHeight, t.bottom); o += 5) {
    let l = n.root.elementFromPoint(r, o);
    if (!l || l == n.dom || !n.dom.contains(l))
      continue;
    let a = l.getBoundingClientRect();
    if (a.top >= e - 20) {
      i = l, s = a.top;
      break;
    }
  }
  return { refDOM: i, refTop: s, stack: $a(n.dom) };
}
function $a(n) {
  let t = [], e = n.ownerDocument;
  for (let i = n; i && (t.push({ dom: i, top: i.scrollTop, left: i.scrollLeft }), n != e); i = Je(i))
    ;
  return t;
}
function vu({ refDOM: n, refTop: t, stack: e }) {
  let i = n ? n.getBoundingClientRect().top : 0;
  za(e, i == 0 ? 0 : i - t);
}
function za(n, t) {
  for (let e = 0; e < n.length; e++) {
    let { dom: i, top: s, left: r } = n[e];
    i.scrollTop != s + t && (i.scrollTop = s + t), i.scrollLeft != r && (i.scrollLeft = r);
  }
}
let Pe = null;
function wu(n) {
  if (n.setActive)
    return n.setActive();
  if (Pe)
    return n.focus(Pe);
  let t = $a(n);
  n.focus(Pe == null ? {
    get preventScroll() {
      return Pe = { preventScroll: !0 }, !0;
    }
  } : void 0), Pe || (Pe = !1, za(t, 0));
}
function qa(n, t) {
  let e, i = 2e8, s, r = 0, o = t.top, l = t.top, a, c;
  for (let d = n.firstChild, u = 0; d; d = d.nextSibling, u++) {
    let p;
    if (d.nodeType == 1)
      p = d.getClientRects();
    else if (d.nodeType == 3)
      p = Vt(d).getClientRects();
    else
      continue;
    for (let h = 0; h < p.length; h++) {
      let f = p[h];
      if (f.top <= o && f.bottom >= l) {
        o = Math.max(f.bottom, o), l = Math.min(f.top, l);
        let g = f.left > t.left ? f.left - t.left : f.right < t.left ? t.left - f.right : 0;
        if (g < i) {
          e = d, i = g, s = g && e.nodeType == 3 ? {
            left: f.right < t.left ? f.right : f.left,
            top: t.top
          } : t, d.nodeType == 1 && g && (r = u + (t.left >= (f.left + f.right) / 2 ? 1 : 0));
          continue;
        }
      } else f.top > t.top && !a && f.left <= t.left && f.right >= t.left && (a = d, c = { left: Math.max(f.left, Math.min(f.right, t.left)), top: f.top });
      !e && (t.left >= f.right && t.top >= f.top || t.left >= f.left && t.top >= f.bottom) && (r = u + 1);
    }
  }
  return !e && a && (e = a, s = c, i = 0), e && e.nodeType == 3 ? ku(e, s) : !e || i && e.nodeType == 1 ? { node: n, offset: r } : qa(e, s);
}
function ku(n, t) {
  let e = n.nodeValue.length, i = document.createRange(), s;
  for (let r = 0; r < e; r++) {
    i.setEnd(n, r + 1), i.setStart(n, r);
    let o = Jt(i, 1);
    if (o.top != o.bottom && Hr(t, o)) {
      s = { node: n, offset: r + (t.left >= (o.left + o.right) / 2 ? 1 : 0) };
      break;
    }
  }
  return i.detach(), s || { node: n, offset: 0 };
}
function Hr(n, t) {
  return n.left >= t.left - 1 && n.left <= t.right + 1 && n.top >= t.top - 1 && n.top <= t.bottom + 1;
}
function xu(n, t) {
  let e = n.parentNode;
  return e && /^li$/i.test(e.nodeName) && t.left < n.getBoundingClientRect().left ? e : n;
}
function Cu(n, t, e) {
  let { node: i, offset: s } = qa(t, e), r = -1;
  if (i.nodeType == 1 && !i.firstChild) {
    let o = i.getBoundingClientRect();
    r = o.left != o.right && e.left > (o.left + o.right) / 2 ? 1 : -1;
  }
  return n.docView.posFromDOM(i, s, r);
}
function Su(n, t, e, i) {
  let s = -1;
  for (let r = t, o = !1; r != n.dom; ) {
    let l = n.docView.nearestDesc(r, !0), a;
    if (!l)
      return null;
    if (l.dom.nodeType == 1 && (l.node.isBlock && l.parent || !l.contentDOM) && // Ignore elements with zero-size bounding rectangles
    ((a = l.dom.getBoundingClientRect()).width || a.height) && (l.node.isBlock && l.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(l.dom.nodeName) && (!o && a.left > i.left || a.top > i.top ? s = l.posBefore : (!o && a.right < i.left || a.bottom < i.top) && (s = l.posAfter), o = !0), !l.contentDOM && s < 0 && !l.node.isText))
      return (l.node.isBlock ? i.top < (a.top + a.bottom) / 2 : i.left < (a.left + a.right) / 2) ? l.posBefore : l.posAfter;
    r = l.dom.parentNode;
  }
  return s > -1 ? s : n.docView.posFromDOM(t, e, -1);
}
function Fa(n, t, e) {
  let i = n.childNodes.length;
  if (i && e.top < e.bottom)
    for (let s = Math.max(0, Math.min(i - 1, Math.floor(i * (t.top - e.top) / (e.bottom - e.top)) - 2)), r = s; ; ) {
      let o = n.childNodes[r];
      if (o.nodeType == 1) {
        let l = o.getClientRects();
        for (let a = 0; a < l.length; a++) {
          let c = l[a];
          if (Hr(t, c))
            return Fa(o, t, c);
        }
      }
      if ((r = (r + 1) % i) == s)
        break;
    }
  return n;
}
function Mu(n, t) {
  let e = n.dom.ownerDocument, i, s = 0, r = fu(e, t.left, t.top);
  r && ({ node: i, offset: s } = r);
  let o = (n.root.elementFromPoint ? n.root : e).elementFromPoint(t.left, t.top), l;
  if (!o || !n.dom.contains(o.nodeType != 1 ? o.parentNode : o)) {
    let c = n.dom.getBoundingClientRect();
    if (!Hr(t, c) || (o = Fa(n.dom, t, c), !o))
      return null;
  }
  if (at)
    for (let c = o; i && c; c = Je(c))
      c.draggable && (i = void 0);
  if (o = xu(o, t), i) {
    if (St && i.nodeType == 1 && (s = Math.min(s, i.childNodes.length), s < i.childNodes.length)) {
      let d = i.childNodes[s], u;
      d.nodeName == "IMG" && (u = d.getBoundingClientRect()).right <= t.left && u.bottom > t.top && s++;
    }
    let c;
    Dn && s && i.nodeType == 1 && (c = i.childNodes[s - 1]).nodeType == 1 && c.contentEditable == "false" && c.getBoundingClientRect().top >= t.top && s--, i == n.dom && s == i.childNodes.length - 1 && i.lastChild.nodeType == 1 && t.top > i.lastChild.getBoundingClientRect().bottom ? l = n.state.doc.content.size : (s == 0 || i.nodeType != 1 || i.childNodes[s - 1].nodeName != "BR") && (l = Su(n, i, s, t));
  }
  l == null && (l = Cu(n, o, t));
  let a = n.docView.nearestDesc(o, !0);
  return { pos: l, inside: a ? a.posAtStart - a.border : -1 };
}
function $o(n) {
  return n.top < n.bottom || n.left < n.right;
}
function Jt(n, t) {
  let e = n.getClientRects();
  if (e.length) {
    let i = e[t < 0 ? 0 : e.length - 1];
    if ($o(i))
      return i;
  }
  return Array.prototype.find.call(e, $o) || n.getBoundingClientRect();
}
const Eu = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function Va(n, t, e) {
  let { node: i, offset: s, atom: r } = n.docView.domFromPos(t, e < 0 ? -1 : 1), o = Dn || St;
  if (i.nodeType == 3)
    if (o && (Eu.test(i.nodeValue) || (e < 0 ? !s : s == i.nodeValue.length))) {
      let a = Jt(Vt(i, s, s), e);
      if (St && s && /\s/.test(i.nodeValue[s - 1]) && s < i.nodeValue.length) {
        let c = Jt(Vt(i, s - 1, s - 1), -1);
        if (c.top == a.top) {
          let d = Jt(Vt(i, s, s + 1), -1);
          if (d.top != a.top)
            return tn(d, d.left < c.left);
        }
      }
      return a;
    } else {
      let a = s, c = s, d = e < 0 ? 1 : -1;
      return e < 0 && !s ? (c++, d = -1) : e >= 0 && s == i.nodeValue.length ? (a--, d = 1) : e < 0 ? a-- : c++, tn(Jt(Vt(i, a, c), d), d < 0);
    }
  if (!n.state.doc.resolve(t - (r || 0)).parent.inlineContent) {
    if (r == null && s && (e < 0 || s == Ct(i))) {
      let a = i.childNodes[s - 1];
      if (a.nodeType == 1)
        return Es(a.getBoundingClientRect(), !1);
    }
    if (r == null && s < Ct(i)) {
      let a = i.childNodes[s];
      if (a.nodeType == 1)
        return Es(a.getBoundingClientRect(), !0);
    }
    return Es(i.getBoundingClientRect(), e >= 0);
  }
  if (r == null && s && (e < 0 || s == Ct(i))) {
    let a = i.childNodes[s - 1], c = a.nodeType == 3 ? Vt(a, Ct(a) - (o ? 0 : 1)) : a.nodeType == 1 && (a.nodeName != "BR" || !a.nextSibling) ? a : null;
    if (c)
      return tn(Jt(c, 1), !1);
  }
  if (r == null && s < Ct(i)) {
    let a = i.childNodes[s];
    for (; a.pmViewDesc && a.pmViewDesc.ignoreForCoords; )
      a = a.nextSibling;
    let c = a ? a.nodeType == 3 ? Vt(a, 0, o ? 0 : 1) : a.nodeType == 1 ? a : null : null;
    if (c)
      return tn(Jt(c, -1), !0);
  }
  return tn(Jt(i.nodeType == 3 ? Vt(i) : i, -e), e >= 0);
}
function tn(n, t) {
  if (n.width == 0)
    return n;
  let e = t ? n.left : n.right;
  return { top: n.top, bottom: n.bottom, left: e, right: e };
}
function Es(n, t) {
  if (n.height == 0)
    return n;
  let e = t ? n.top : n.bottom;
  return { top: e, bottom: e, left: n.left, right: n.right };
}
function ja(n, t, e) {
  let i = n.state, s = n.root.activeElement;
  i != t && n.updateState(t), s != n.dom && n.focus();
  try {
    return e();
  } finally {
    i != t && n.updateState(i), s != n.dom && s && s.focus();
  }
}
function _u(n, t, e) {
  let i = t.selection, s = e == "up" ? i.$from : i.$to;
  return ja(n, t, () => {
    let { node: r } = n.docView.domFromPos(s.pos, e == "up" ? -1 : 1);
    for (; ; ) {
      let l = n.docView.nearestDesc(r, !0);
      if (!l)
        break;
      if (l.node.isBlock) {
        r = l.contentDOM || l.dom;
        break;
      }
      r = l.dom.parentNode;
    }
    let o = Va(n, s.pos, 1);
    for (let l = r.firstChild; l; l = l.nextSibling) {
      let a;
      if (l.nodeType == 1)
        a = l.getClientRects();
      else if (l.nodeType == 3)
        a = Vt(l, 0, l.nodeValue.length).getClientRects();
      else
        continue;
      for (let c = 0; c < a.length; c++) {
        let d = a[c];
        if (d.bottom > d.top + 1 && (e == "up" ? o.top - d.top > (d.bottom - o.top) * 2 : d.bottom - o.bottom > (o.bottom - d.top) * 2))
          return !1;
      }
    }
    return !0;
  });
}
const Tu = /[\u0590-\u08ac]/;
function Au(n, t, e) {
  let { $head: i } = t.selection;
  if (!i.parent.isTextblock)
    return !1;
  let s = i.parentOffset, r = !s, o = s == i.parent.content.size, l = n.domSelection();
  return l ? !Tu.test(i.parent.textContent) || !l.modify ? e == "left" || e == "backward" ? r : o : ja(n, t, () => {
    let { focusNode: a, focusOffset: c, anchorNode: d, anchorOffset: u } = n.domSelectionRange(), p = l.caretBidiLevel;
    l.modify("move", e, "character");
    let h = i.depth ? n.docView.domAfterPos(i.before()) : n.dom, { focusNode: f, focusOffset: g } = n.domSelectionRange(), m = f && !h.contains(f.nodeType == 1 ? f : f.parentNode) || a == f && c == g;
    try {
      l.collapse(d, u), a && (a != d || c != u) && l.extend && l.extend(a, c);
    } catch {
    }
    return p != null && (l.caretBidiLevel = p), m;
  }) : i.pos == i.start() || i.pos == i.end();
}
let zo = null, qo = null, Fo = !1;
function Lu(n, t, e) {
  return zo == t && qo == e ? Fo : (zo = t, qo = e, Fo = e == "up" || e == "down" ? _u(n, t, e) : Au(n, t, e));
}
const Mt = 0, Vo = 1, ye = 2, Rt = 3;
class Pn {
  constructor(t, e, i, s) {
    this.parent = t, this.children = e, this.dom = i, this.contentDOM = s, this.dirty = Mt, i.pmViewDesc = this;
  }
  // Used to check whether a given description corresponds to a
  // widget/mark/node.
  matchesWidget(t) {
    return !1;
  }
  matchesMark(t) {
    return !1;
  }
  matchesNode(t, e, i) {
    return !1;
  }
  matchesHack(t) {
    return !1;
  }
  // When parsing in-editor content (in domchange.js), we allow
  // descriptions to determine the parse rules that should be used to
  // parse them.
  parseRule() {
    return null;
  }
  // Used by the editor's event handler to ignore events that come
  // from certain descs.
  stopEvent(t) {
    return !1;
  }
  // The size of the content represented by this desc.
  get size() {
    let t = 0;
    for (let e = 0; e < this.children.length; e++)
      t += this.children[e].size;
    return t;
  }
  // For block nodes, this represents the space taken up by their
  // start/end tokens.
  get border() {
    return 0;
  }
  destroy() {
    this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
    for (let t = 0; t < this.children.length; t++)
      this.children[t].destroy();
  }
  posBeforeChild(t) {
    for (let e = 0, i = this.posAtStart; ; e++) {
      let s = this.children[e];
      if (s == t)
        return i;
      i += s.size;
    }
  }
  get posBefore() {
    return this.parent.posBeforeChild(this);
  }
  get posAtStart() {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
  }
  get posAfter() {
    return this.posBefore + this.size;
  }
  get posAtEnd() {
    return this.posAtStart + this.size - 2 * this.border;
  }
  localPosFromDOM(t, e, i) {
    if (this.contentDOM && this.contentDOM.contains(t.nodeType == 1 ? t : t.parentNode))
      if (i < 0) {
        let r, o;
        if (t == this.contentDOM)
          r = t.childNodes[e - 1];
        else {
          for (; t.parentNode != this.contentDOM; )
            t = t.parentNode;
          r = t.previousSibling;
        }
        for (; r && !((o = r.pmViewDesc) && o.parent == this); )
          r = r.previousSibling;
        return r ? this.posBeforeChild(o) + o.size : this.posAtStart;
      } else {
        let r, o;
        if (t == this.contentDOM)
          r = t.childNodes[e];
        else {
          for (; t.parentNode != this.contentDOM; )
            t = t.parentNode;
          r = t.nextSibling;
        }
        for (; r && !((o = r.pmViewDesc) && o.parent == this); )
          r = r.nextSibling;
        return r ? this.posBeforeChild(o) : this.posAtEnd;
      }
    let s;
    if (t == this.dom && this.contentDOM)
      s = e > it(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      s = t.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (e == 0)
        for (let r = t; ; r = r.parentNode) {
          if (r == this.dom) {
            s = !1;
            break;
          }
          if (r.previousSibling)
            break;
        }
      if (s == null && e == t.childNodes.length)
        for (let r = t; ; r = r.parentNode) {
          if (r == this.dom) {
            s = !0;
            break;
          }
          if (r.nextSibling)
            break;
        }
    }
    return s ?? i > 0 ? this.posAtEnd : this.posAtStart;
  }
  nearestDesc(t, e = !1) {
    for (let i = !0, s = t; s; s = s.parentNode) {
      let r = this.getDesc(s), o;
      if (r && (!e || r.node))
        if (i && (o = r.nodeDOM) && !(o.nodeType == 1 ? o.contains(t.nodeType == 1 ? t : t.parentNode) : o == t))
          i = !1;
        else
          return r;
    }
  }
  getDesc(t) {
    let e = t.pmViewDesc;
    for (let i = e; i; i = i.parent)
      if (i == this)
        return e;
  }
  posFromDOM(t, e, i) {
    for (let s = t; s; s = s.parentNode) {
      let r = this.getDesc(s);
      if (r)
        return r.localPosFromDOM(t, e, i);
    }
    return -1;
  }
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  descAt(t) {
    for (let e = 0, i = 0; e < this.children.length; e++) {
      let s = this.children[e], r = i + s.size;
      if (i == t && r != i) {
        for (; !s.border && s.children.length; )
          for (let o = 0; o < s.children.length; o++) {
            let l = s.children[o];
            if (l.size) {
              s = l;
              break;
            }
          }
        return s;
      }
      if (t < r)
        return s.descAt(t - i - s.border);
      i = r;
    }
  }
  domFromPos(t, e) {
    if (!this.contentDOM)
      return { node: this.dom, offset: 0, atom: t + 1 };
    let i = 0, s = 0;
    for (let r = 0; i < this.children.length; i++) {
      let o = this.children[i], l = r + o.size;
      if (l > t || o instanceof Wa) {
        s = t - r;
        break;
      }
      r = l;
    }
    if (s)
      return this.children[i].domFromPos(s - this.children[i].border, e);
    for (let r; i && !(r = this.children[i - 1]).size && r instanceof Ua && r.side >= 0; i--)
      ;
    if (e <= 0) {
      let r, o = !0;
      for (; r = i ? this.children[i - 1] : null, !(!r || r.dom.parentNode == this.contentDOM); i--, o = !1)
        ;
      return r && e && o && !r.border && !r.domAtom ? r.domFromPos(r.size, e) : { node: this.contentDOM, offset: r ? it(r.dom) + 1 : 0 };
    } else {
      let r, o = !0;
      for (; r = i < this.children.length ? this.children[i] : null, !(!r || r.dom.parentNode == this.contentDOM); i++, o = !1)
        ;
      return r && o && !r.border && !r.domAtom ? r.domFromPos(0, e) : { node: this.contentDOM, offset: r ? it(r.dom) : this.contentDOM.childNodes.length };
    }
  }
  // Used to find a DOM range in a single parent for a given changed
  // range.
  parseRange(t, e, i = 0) {
    if (this.children.length == 0)
      return { node: this.contentDOM, from: t, to: e, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
    let s = -1, r = -1;
    for (let o = i, l = 0; ; l++) {
      let a = this.children[l], c = o + a.size;
      if (s == -1 && t <= c) {
        let d = o + a.border;
        if (t >= d && e <= c - a.border && a.node && a.contentDOM && this.contentDOM.contains(a.contentDOM))
          return a.parseRange(t, e, d);
        t = o;
        for (let u = l; u > 0; u--) {
          let p = this.children[u - 1];
          if (p.size && p.dom.parentNode == this.contentDOM && !p.emptyChildAt(1)) {
            s = it(p.dom) + 1;
            break;
          }
          t -= p.size;
        }
        s == -1 && (s = 0);
      }
      if (s > -1 && (c > e || l == this.children.length - 1)) {
        e = c;
        for (let d = l + 1; d < this.children.length; d++) {
          let u = this.children[d];
          if (u.size && u.dom.parentNode == this.contentDOM && !u.emptyChildAt(-1)) {
            r = it(u.dom);
            break;
          }
          e += u.size;
        }
        r == -1 && (r = this.contentDOM.childNodes.length);
        break;
      }
      o = c;
    }
    return { node: this.contentDOM, from: t, to: e, fromOffset: s, toOffset: r };
  }
  emptyChildAt(t) {
    if (this.border || !this.contentDOM || !this.children.length)
      return !1;
    let e = this.children[t < 0 ? 0 : this.children.length - 1];
    return e.size == 0 || e.emptyChildAt(t);
  }
  domAfterPos(t) {
    let { node: e, offset: i } = this.domFromPos(t, 0);
    if (e.nodeType != 1 || i == e.childNodes.length)
      throw new RangeError("No node after pos " + t);
    return e.childNodes[i];
  }
  // View descs are responsible for setting any selection that falls
  // entirely inside of them, so that custom implementations can do
  // custom things with the selection. Note that this falls apart when
  // a selection starts in such a node and ends in another, in which
  // case we just use whatever domFromPos produces as a best effort.
  setSelection(t, e, i, s = !1) {
    let r = Math.min(t, e), o = Math.max(t, e);
    for (let h = 0, f = 0; h < this.children.length; h++) {
      let g = this.children[h], m = f + g.size;
      if (r > f && o < m)
        return g.setSelection(t - f - g.border, e - f - g.border, i, s);
      f = m;
    }
    let l = this.domFromPos(t, t ? -1 : 1), a = e == t ? l : this.domFromPos(e, e ? -1 : 1), c = i.root.getSelection(), d = i.domSelectionRange(), u = !1;
    if ((St || at) && t == e) {
      let { node: h, offset: f } = l;
      if (h.nodeType == 3) {
        if (u = !!(f && h.nodeValue[f - 1] == `
`), u && f == h.nodeValue.length)
          for (let g = h, m; g; g = g.parentNode) {
            if (m = g.nextSibling) {
              m.nodeName == "BR" && (l = a = { node: m.parentNode, offset: it(m) + 1 });
              break;
            }
            let b = g.pmViewDesc;
            if (b && b.node && b.node.isBlock)
              break;
          }
      } else {
        let g = h.childNodes[f - 1];
        u = g && (g.nodeName == "BR" || g.contentEditable == "false");
      }
    }
    if (St && d.focusNode && d.focusNode != a.node && d.focusNode.nodeType == 1) {
      let h = d.focusNode.childNodes[d.focusOffset];
      h && h.contentEditable == "false" && (s = !0);
    }
    if (!(s || u && at) && Ae(l.node, l.offset, d.anchorNode, d.anchorOffset) && Ae(a.node, a.offset, d.focusNode, d.focusOffset))
      return;
    let p = !1;
    if ((c.extend || t == e) && !(u && St)) {
      c.collapse(l.node, l.offset);
      try {
        t != e && c.extend(a.node, a.offset), p = !0;
      } catch {
      }
    }
    if (!p) {
      if (t > e) {
        let f = l;
        l = a, a = f;
      }
      let h = document.createRange();
      h.setEnd(a.node, a.offset), h.setStart(l.node, l.offset), c.removeAllRanges(), c.addRange(h);
    }
  }
  ignoreMutation(t) {
    return !this.contentDOM && t.type != "selection";
  }
  get contentLost() {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
  }
  // Remove a subtree of the element tree that has been touched
  // by a DOM change, so that the next update will redraw it.
  markDirty(t, e) {
    for (let i = 0, s = 0; s < this.children.length; s++) {
      let r = this.children[s], o = i + r.size;
      if (i == o ? t <= o && e >= i : t < o && e > i) {
        let l = i + r.border, a = o - r.border;
        if (t >= l && e <= a) {
          this.dirty = t == i || e == o ? ye : Vo, t == l && e == a && (r.contentLost || r.dom.parentNode != this.contentDOM) ? r.dirty = Rt : r.markDirty(t - l, e - l);
          return;
        } else
          r.dirty = r.dom == r.contentDOM && r.dom.parentNode == this.contentDOM && !r.children.length ? ye : Rt;
      }
      i = o;
    }
    this.dirty = ye;
  }
  markParentsDirty() {
    let t = 1;
    for (let e = this.parent; e; e = e.parent, t++) {
      let i = t == 1 ? ye : Vo;
      e.dirty < i && (e.dirty = i);
    }
  }
  get domAtom() {
    return !1;
  }
  get ignoreForCoords() {
    return !1;
  }
  get ignoreForSelection() {
    return !1;
  }
  isText(t) {
    return !1;
  }
}
class Ua extends Pn {
  constructor(t, e, i, s) {
    let r, o = e.type.toDOM;
    if (typeof o == "function" && (o = o(i, () => {
      if (!r)
        return s;
      if (r.parent)
        return r.parent.posBeforeChild(r);
    })), !e.type.spec.raw) {
      if (o.nodeType != 1) {
        let l = document.createElement("span");
        l.appendChild(o), o = l;
      }
      o.contentEditable = "false", o.classList.add("ProseMirror-widget");
    }
    super(t, [], o, null), this.widget = e, this.widget = e, r = this;
  }
  matchesWidget(t) {
    return this.dirty == Mt && t.type.eq(this.widget.type);
  }
  parseRule() {
    return { ignore: !0 };
  }
  stopEvent(t) {
    let e = this.widget.spec.stopEvent;
    return e ? e(t) : !1;
  }
  ignoreMutation(t) {
    return t.type != "selection" || this.widget.spec.ignoreSelection;
  }
  destroy() {
    this.widget.type.destroy(this.dom), super.destroy();
  }
  get domAtom() {
    return !0;
  }
  get ignoreForSelection() {
    return !!this.widget.type.spec.relaxedSide;
  }
  get side() {
    return this.widget.type.side;
  }
}
class Nu extends Pn {
  constructor(t, e, i, s) {
    super(t, [], e, null), this.textDOM = i, this.text = s;
  }
  get size() {
    return this.text.length;
  }
  localPosFromDOM(t, e) {
    return t != this.textDOM ? this.posAtStart + (e ? this.size : 0) : this.posAtStart + e;
  }
  domFromPos(t) {
    return { node: this.textDOM, offset: t };
  }
  ignoreMutation(t) {
    return t.type === "characterData" && t.target.nodeValue == t.oldValue;
  }
}
class Le extends Pn {
  constructor(t, e, i, s, r) {
    super(t, [], i, s), this.mark = e, this.spec = r;
  }
  static create(t, e, i, s) {
    let r = s.nodeViews[e.type.name], o = r && r(e, s, i);
    return (!o || !o.dom) && (o = Ie.renderSpec(document, e.type.spec.toDOM(e, i), null, e.attrs)), new Le(t, e, o.dom, o.contentDOM || o.dom, o);
  }
  parseRule() {
    return this.dirty & Rt || this.mark.type.spec.reparseInView ? null : { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
  }
  matchesMark(t) {
    return this.dirty != Rt && this.mark.eq(t);
  }
  markDirty(t, e) {
    if (super.markDirty(t, e), this.dirty != Mt) {
      let i = this.parent;
      for (; !i.node; )
        i = i.parent;
      i.dirty < this.dirty && (i.dirty = this.dirty), this.dirty = Mt;
    }
  }
  slice(t, e, i) {
    let s = Le.create(this.parent, this.mark, !0, i), r = this.children, o = this.size;
    e < o && (r = rr(r, e, o, i)), t > 0 && (r = rr(r, 0, t, i));
    for (let l = 0; l < r.length; l++)
      r[l].parent = s;
    return s.children = r, s;
  }
  ignoreMutation(t) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(t) : super.ignoreMutation(t);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
}
class le extends Pn {
  constructor(t, e, i, s, r, o, l, a, c) {
    super(t, [], r, o), this.node = e, this.outerDeco = i, this.innerDeco = s, this.nodeDOM = l;
  }
  // By default, a node is rendered using the `toDOM` method from the
  // node type spec. But client code can use the `nodeViews` spec to
  // supply a custom node view, which can influence various aspects of
  // the way the node works.
  //
  // (Using subclassing for this was intentionally decided against,
  // since it'd require exposing a whole slew of finicky
  // implementation details to the user code that they probably will
  // never need.)
  static create(t, e, i, s, r, o) {
    let l = r.nodeViews[e.type.name], a, c = l && l(e, r, () => {
      if (!a)
        return o;
      if (a.parent)
        return a.parent.posBeforeChild(a);
    }, i, s), d = c && c.dom, u = c && c.contentDOM;
    if (e.isText) {
      if (!d)
        d = document.createTextNode(e.text);
      else if (d.nodeType != 3)
        throw new RangeError("Text must be rendered as a DOM text node");
    } else d || ({ dom: d, contentDOM: u } = Ie.renderSpec(document, e.type.spec.toDOM(e), null, e.attrs));
    !u && !e.isText && d.nodeName != "BR" && (d.hasAttribute("contenteditable") || (d.contentEditable = "false"), e.type.spec.draggable && (d.draggable = !0));
    let p = d;
    return d = Ga(d, i, e), c ? a = new Ou(t, e, i, s, d, u || null, p, c, r, o + 1) : e.isText ? new is(t, e, i, s, d, p, r) : new le(t, e, i, s, d, u || null, p, r, o + 1);
  }
  parseRule() {
    if (this.node.type.spec.reparseInView)
      return null;
    let t = { node: this.node.type.name, attrs: this.node.attrs };
    if (this.node.type.whitespace == "pre" && (t.preserveWhitespace = "full"), !this.contentDOM)
      t.getContent = () => this.node.content;
    else if (!this.contentLost)
      t.contentElement = this.contentDOM;
    else {
      for (let e = this.children.length - 1; e >= 0; e--) {
        let i = this.children[e];
        if (this.dom.contains(i.dom.parentNode)) {
          t.contentElement = i.dom.parentNode;
          break;
        }
      }
      t.contentElement || (t.getContent = () => v.empty);
    }
    return t;
  }
  matchesNode(t, e, i) {
    return this.dirty == Mt && t.eq(this.node) && fi(e, this.outerDeco) && i.eq(this.innerDeco);
  }
  get size() {
    return this.node.nodeSize;
  }
  get border() {
    return this.node.isLeaf ? 0 : 1;
  }
  // Syncs `this.children` to match `this.node.content` and the local
  // decorations, possibly introducing nesting for marks. Then, in a
  // separate step, syncs the DOM inside `this.contentDOM` to
  // `this.children`.
  updateChildren(t, e) {
    let i = this.node.inlineContent, s = e, r = t.composing ? this.localCompositionInfo(t, e) : null, o = r && r.pos > -1 ? r : null, l = r && r.pos < 0, a = new Iu(this, o && o.node, t);
    Bu(this.node, this.innerDeco, (c, d, u) => {
      c.spec.marks ? a.syncToMarks(c.spec.marks, i, t, d) : c.type.side >= 0 && !u && a.syncToMarks(d == this.node.childCount ? B.none : this.node.child(d).marks, i, t, d), a.placeWidget(c, t, s);
    }, (c, d, u, p) => {
      a.syncToMarks(c.marks, i, t, p);
      let h;
      a.findNodeMatch(c, d, u, p) || l && t.state.selection.from > s && t.state.selection.to < s + c.nodeSize && (h = a.findIndexWithChild(r.node)) > -1 && a.updateNodeAt(c, d, u, h, t) || a.updateNextNode(c, d, u, t, p, s) || a.addNode(c, d, u, t, s), s += c.nodeSize;
    }), a.syncToMarks([], i, t, 0), this.node.isTextblock && a.addTextblockHacks(), a.destroyRest(), (a.changed || this.dirty == ye) && (o && this.protectLocalComposition(t, o), Ka(this.contentDOM, this.children, t), Ge && Hu(this.dom));
  }
  localCompositionInfo(t, e) {
    let { from: i, to: s } = t.state.selection;
    if (!(t.state.selection instanceof T) || i < e || s > e + this.node.content.size)
      return null;
    let r = t.input.compositionNode;
    if (!r || !this.dom.contains(r.parentNode))
      return null;
    if (this.node.inlineContent) {
      let o = r.nodeValue, l = $u(this.node.content, o, i - e, s - e);
      return l < 0 ? null : { node: r, pos: l, text: o };
    } else
      return { node: r, pos: -1, text: "" };
  }
  protectLocalComposition(t, { node: e, pos: i, text: s }) {
    if (this.getDesc(e))
      return;
    let r = e;
    for (; r.parentNode != this.contentDOM; r = r.parentNode) {
      for (; r.previousSibling; )
        r.parentNode.removeChild(r.previousSibling);
      for (; r.nextSibling; )
        r.parentNode.removeChild(r.nextSibling);
      r.pmViewDesc && (r.pmViewDesc = void 0);
    }
    let o = new Nu(this, r, e, s);
    t.input.compositionNodes.push(o), this.children = rr(this.children, i, i + s.length, t, o);
  }
  // If this desc must be updated to match the given node decoration,
  // do so and return true.
  update(t, e, i, s) {
    return this.dirty == Rt || !t.sameMarkup(this.node) ? !1 : (this.updateInner(t, e, i, s), !0);
  }
  updateInner(t, e, i, s) {
    this.updateOuterDeco(e), this.node = t, this.innerDeco = i, this.contentDOM && this.updateChildren(s, this.posAtStart), this.dirty = Mt;
  }
  updateOuterDeco(t) {
    if (fi(t, this.outerDeco))
      return;
    let e = this.nodeDOM.nodeType != 1, i = this.dom;
    this.dom = Ja(this.dom, this.nodeDOM, sr(this.outerDeco, this.node, e), sr(t, this.node, e)), this.dom != i && (i.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = t;
  }
  // Mark this node as being the selected node.
  selectNode() {
    this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.add("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && (this.nodeDOM.draggable = !0));
  }
  // Remove selected node marking from this node.
  deselectNode() {
    this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.remove("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && this.nodeDOM.removeAttribute("draggable"));
  }
  get domAtom() {
    return this.node.isAtom;
  }
}
function jo(n, t, e, i, s) {
  Ga(i, t, n);
  let r = new le(void 0, n, t, e, i, i, i, s, 0);
  return r.contentDOM && r.updateChildren(s, 0), r;
}
class is extends le {
  constructor(t, e, i, s, r, o, l) {
    super(t, e, i, s, r, null, o, l, 0);
  }
  parseRule() {
    let t = this.nodeDOM.parentNode;
    for (; t && t != this.dom && !t.pmIsDeco; )
      t = t.parentNode;
    return { skip: t || !0 };
  }
  update(t, e, i, s) {
    return this.dirty == Rt || this.dirty != Mt && !this.inParent() || !t.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(e), (this.dirty != Mt || t.text != this.node.text) && t.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = t.text, s.trackWrites == this.nodeDOM && (s.trackWrites = null)), this.node = t, this.dirty = Mt, !0);
  }
  inParent() {
    let t = this.parent.contentDOM;
    for (let e = this.nodeDOM; e; e = e.parentNode)
      if (e == t)
        return !0;
    return !1;
  }
  domFromPos(t) {
    return { node: this.nodeDOM, offset: t };
  }
  localPosFromDOM(t, e, i) {
    return t == this.nodeDOM ? this.posAtStart + Math.min(e, this.node.text.length) : super.localPosFromDOM(t, e, i);
  }
  ignoreMutation(t) {
    return t.type != "characterData" && t.type != "selection";
  }
  slice(t, e, i) {
    let s = this.node.cut(t, e), r = document.createTextNode(s.text);
    return new is(this.parent, s, this.outerDeco, this.innerDeco, r, r, i);
  }
  markDirty(t, e) {
    super.markDirty(t, e), this.dom != this.nodeDOM && (t == 0 || e == this.nodeDOM.nodeValue.length) && (this.dirty = Rt);
  }
  get domAtom() {
    return !1;
  }
  isText(t) {
    return this.node.text == t;
  }
}
class Wa extends Pn {
  parseRule() {
    return { ignore: !0 };
  }
  matchesHack(t) {
    return this.dirty == Mt && this.dom.nodeName == t;
  }
  get domAtom() {
    return !0;
  }
  get ignoreForCoords() {
    return this.dom.nodeName == "IMG";
  }
}
class Ou extends le {
  constructor(t, e, i, s, r, o, l, a, c, d) {
    super(t, e, i, s, r, o, l, c, d), this.spec = a;
  }
  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  update(t, e, i, s) {
    if (this.dirty == Rt)
      return !1;
    if (this.spec.update && (this.node.type == t.type || this.spec.multiType)) {
      let r = this.spec.update(t, e, i);
      return r && this.updateInner(t, e, i, s), r;
    } else return !this.contentDOM && !t.isLeaf ? !1 : super.update(t, e, i, s);
  }
  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }
  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }
  setSelection(t, e, i, s) {
    this.spec.setSelection ? this.spec.setSelection(t, e, i.root) : super.setSelection(t, e, i, s);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
  stopEvent(t) {
    return this.spec.stopEvent ? this.spec.stopEvent(t) : !1;
  }
  ignoreMutation(t) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(t) : super.ignoreMutation(t);
  }
}
function Ka(n, t, e) {
  let i = n.firstChild, s = !1;
  for (let r = 0; r < t.length; r++) {
    let o = t[r], l = o.dom;
    if (l.parentNode == n) {
      for (; l != i; )
        i = Uo(i), s = !0;
      i = i.nextSibling;
    } else
      s = !0, n.insertBefore(l, i);
    if (o instanceof Le) {
      let a = i ? i.previousSibling : n.lastChild;
      Ka(o.contentDOM, o.children, e), i = a ? a.nextSibling : n.firstChild;
    }
  }
  for (; i; )
    i = Uo(i), s = !0;
  s && e.trackWrites == n && (e.trackWrites = null);
}
const un = function(n) {
  n && (this.nodeName = n);
};
un.prototype = /* @__PURE__ */ Object.create(null);
const ve = [new un()];
function sr(n, t, e) {
  if (n.length == 0)
    return ve;
  let i = e ? ve[0] : new un(), s = [i];
  for (let r = 0; r < n.length; r++) {
    let o = n[r].type.attrs;
    if (o) {
      o.nodeName && s.push(i = new un(o.nodeName));
      for (let l in o) {
        let a = o[l];
        a != null && (e && s.length == 1 && s.push(i = new un(t.isInline ? "span" : "div")), l == "class" ? i.class = (i.class ? i.class + " " : "") + a : l == "style" ? i.style = (i.style ? i.style + ";" : "") + a : l != "nodeName" && (i[l] = a));
      }
    }
  }
  return s;
}
function Ja(n, t, e, i) {
  if (e == ve && i == ve)
    return t;
  let s = t;
  for (let r = 0; r < i.length; r++) {
    let o = i[r], l = e[r];
    if (r) {
      let a;
      l && l.nodeName == o.nodeName && s != n && (a = s.parentNode) && a.nodeName.toLowerCase() == o.nodeName || (a = document.createElement(o.nodeName), a.pmIsDeco = !0, a.appendChild(s), l = ve[0]), s = a;
    }
    Ru(s, l || ve[0], o);
  }
  return s;
}
function Ru(n, t, e) {
  for (let i in t)
    i != "class" && i != "style" && i != "nodeName" && !(i in e) && n.removeAttribute(i);
  for (let i in e)
    i != "class" && i != "style" && i != "nodeName" && e[i] != t[i] && n.setAttribute(i, e[i]);
  if (t.class != e.class) {
    let i = t.class ? t.class.split(" ").filter(Boolean) : [], s = e.class ? e.class.split(" ").filter(Boolean) : [];
    for (let r = 0; r < i.length; r++)
      s.indexOf(i[r]) == -1 && n.classList.remove(i[r]);
    for (let r = 0; r < s.length; r++)
      i.indexOf(s[r]) == -1 && n.classList.add(s[r]);
    n.classList.length == 0 && n.removeAttribute("class");
  }
  if (t.style != e.style) {
    if (t.style) {
      let i = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, s;
      for (; s = i.exec(t.style); )
        n.style.removeProperty(s[1]);
    }
    e.style && (n.style.cssText += e.style);
  }
}
function Ga(n, t, e) {
  return Ja(n, n, ve, sr(t, e, n.nodeType != 1));
}
function fi(n, t) {
  if (n.length != t.length)
    return !1;
  for (let e = 0; e < n.length; e++)
    if (!n[e].type.eq(t[e].type))
      return !1;
  return !0;
}
function Uo(n) {
  let t = n.nextSibling;
  return n.parentNode.removeChild(n), t;
}
class Iu {
  constructor(t, e, i) {
    this.lock = e, this.view = i, this.index = 0, this.stack = [], this.changed = !1, this.top = t, this.preMatch = Du(t.node.content, t);
  }
  // Destroy and remove the children between the given indices in
  // `this.top`.
  destroyBetween(t, e) {
    if (t != e) {
      for (let i = t; i < e; i++)
        this.top.children[i].destroy();
      this.top.children.splice(t, e - t), this.changed = !0;
    }
  }
  // Destroy all remaining children in `this.top`.
  destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  }
  // Sync the current stack of mark descs with the given array of
  // marks, reusing existing mark descs when possible.
  syncToMarks(t, e, i, s) {
    let r = 0, o = this.stack.length >> 1, l = Math.min(o, t.length);
    for (; r < l && (r == o - 1 ? this.top : this.stack[r + 1 << 1]).matchesMark(t[r]) && t[r].type.spec.spanning !== !1; )
      r++;
    for (; r < o; )
      this.destroyRest(), this.top.dirty = Mt, this.index = this.stack.pop(), this.top = this.stack.pop(), o--;
    for (; o < t.length; ) {
      this.stack.push(this.top, this.index + 1);
      let a = -1, c = this.top.children.length;
      s < this.preMatch.index && (c = Math.min(this.index + 3, c));
      for (let d = this.index; d < c; d++) {
        let u = this.top.children[d];
        if (u.matchesMark(t[o]) && !this.isLocked(u.dom)) {
          a = d;
          break;
        }
      }
      if (a > -1)
        a > this.index && (this.changed = !0, this.destroyBetween(this.index, a)), this.top = this.top.children[this.index];
      else {
        let d = Le.create(this.top, t[o], e, i);
        this.top.children.splice(this.index, 0, d), this.top = d, this.changed = !0;
      }
      this.index = 0, o++;
    }
  }
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  findNodeMatch(t, e, i, s) {
    let r = -1, o;
    if (s >= this.preMatch.index && (o = this.preMatch.matches[s - this.preMatch.index]).parent == this.top && o.matchesNode(t, e, i))
      r = this.top.children.indexOf(o, this.index);
    else
      for (let l = this.index, a = Math.min(this.top.children.length, l + 5); l < a; l++) {
        let c = this.top.children[l];
        if (c.matchesNode(t, e, i) && !this.preMatch.matched.has(c)) {
          r = l;
          break;
        }
      }
    return r < 0 ? !1 : (this.destroyBetween(this.index, r), this.index++, !0);
  }
  updateNodeAt(t, e, i, s, r) {
    let o = this.top.children[s];
    return o.dirty == Rt && o.dom == o.contentDOM && (o.dirty = ye), o.update(t, e, i, r) ? (this.destroyBetween(this.index, s), this.index++, !0) : !1;
  }
  findIndexWithChild(t) {
    for (; ; ) {
      let e = t.parentNode;
      if (!e)
        return -1;
      if (e == this.top.contentDOM) {
        let i = t.pmViewDesc;
        if (i) {
          for (let s = this.index; s < this.top.children.length; s++)
            if (this.top.children[s] == i)
              return s;
        }
        return -1;
      }
      t = e;
    }
  }
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  updateNextNode(t, e, i, s, r, o) {
    for (let l = this.index; l < this.top.children.length; l++) {
      let a = this.top.children[l];
      if (a instanceof le) {
        let c = this.preMatch.matched.get(a);
        if (c != null && c != r)
          return !1;
        let d = a.dom, u, p = this.isLocked(d) && !(t.isText && a.node && a.node.isText && a.nodeDOM.nodeValue == t.text && a.dirty != Rt && fi(e, a.outerDeco));
        if (!p && a.update(t, e, i, s))
          return this.destroyBetween(this.index, l), a.dom != d && (this.changed = !0), this.index++, !0;
        if (!p && (u = this.recreateWrapper(a, t, e, i, s, o)))
          return this.destroyBetween(this.index, l), this.top.children[this.index] = u, u.contentDOM && (u.dirty = ye, u.updateChildren(s, o + 1), u.dirty = Mt), this.changed = !0, this.index++, !0;
        break;
      }
    }
    return !1;
  }
  // When a node with content is replaced by a different node with
  // identical content, move over its children.
  recreateWrapper(t, e, i, s, r, o) {
    if (t.dirty || e.isAtom || !t.children.length || !t.node.content.eq(e.content) || !fi(i, t.outerDeco) || !s.eq(t.innerDeco))
      return null;
    let l = le.create(this.top, e, i, s, r, o);
    if (l.contentDOM) {
      l.children = t.children, t.children = [];
      for (let a of l.children)
        a.parent = l;
    }
    return t.destroy(), l;
  }
  // Insert the node as a newly created node desc.
  addNode(t, e, i, s, r) {
    let o = le.create(this.top, t, e, i, s, r);
    o.contentDOM && o.updateChildren(s, r + 1), this.top.children.splice(this.index++, 0, o), this.changed = !0;
  }
  placeWidget(t, e, i) {
    let s = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (s && s.matchesWidget(t) && (t == s.widget || !s.widget.type.toDOM.parentNode))
      this.index++;
    else {
      let r = new Ua(this.top, t, e, i);
      this.top.children.splice(this.index++, 0, r), this.changed = !0;
    }
  }
  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  addTextblockHacks() {
    let t = this.top.children[this.index - 1], e = this.top;
    for (; t instanceof Le; )
      e = t, t = e.children[e.children.length - 1];
    (!t || // Empty textblock
    !(t instanceof is) || /\n$/.test(t.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(t.node.text)) && ((at || rt) && t && t.dom.contentEditable == "false" && this.addHackNode("IMG", e), this.addHackNode("BR", this.top));
  }
  addHackNode(t, e) {
    if (e == this.top && this.index < e.children.length && e.children[this.index].matchesHack(t))
      this.index++;
    else {
      let i = document.createElement(t);
      t == "IMG" && (i.className = "ProseMirror-separator", i.alt = ""), t == "BR" && (i.className = "ProseMirror-trailingBreak");
      let s = new Wa(this.top, [], i, null);
      e != this.top ? e.children.push(s) : e.children.splice(this.index++, 0, s), this.changed = !0;
    }
  }
  isLocked(t) {
    return this.lock && (t == this.lock || t.nodeType == 1 && t.contains(this.lock.parentNode));
  }
}
function Du(n, t) {
  let e = t, i = e.children.length, s = n.childCount, r = /* @__PURE__ */ new Map(), o = [];
  t: for (; s > 0; ) {
    let l;
    for (; ; )
      if (i) {
        let c = e.children[i - 1];
        if (c instanceof Le)
          e = c, i = c.children.length;
        else {
          l = c, i--;
          break;
        }
      } else {
        if (e == t)
          break t;
        i = e.parent.children.indexOf(e), e = e.parent;
      }
    let a = l.node;
    if (a) {
      if (a != n.child(s - 1))
        break;
      --s, r.set(l, s), o.push(l);
    }
  }
  return { index: s, matched: r, matches: o.reverse() };
}
function Pu(n, t) {
  return n.type.side - t.type.side;
}
function Bu(n, t, e, i) {
  let s = t.locals(n), r = 0;
  if (s.length == 0) {
    for (let c = 0; c < n.childCount; c++) {
      let d = n.child(c);
      i(d, s, t.forChild(r, d), c), r += d.nodeSize;
    }
    return;
  }
  let o = 0, l = [], a = null;
  for (let c = 0; ; ) {
    let d, u;
    for (; o < s.length && s[o].to == r; ) {
      let m = s[o++];
      m.widget && (d ? (u || (u = [d])).push(m) : d = m);
    }
    if (d)
      if (u) {
        u.sort(Pu);
        for (let m = 0; m < u.length; m++)
          e(u[m], c, !!a);
      } else
        e(d, c, !!a);
    let p, h;
    if (a)
      h = -1, p = a, a = null;
    else if (c < n.childCount)
      h = c, p = n.child(c++);
    else
      break;
    for (let m = 0; m < l.length; m++)
      l[m].to <= r && l.splice(m--, 1);
    for (; o < s.length && s[o].from <= r && s[o].to > r; )
      l.push(s[o++]);
    let f = r + p.nodeSize;
    if (p.isText) {
      let m = f;
      o < s.length && s[o].from < m && (m = s[o].from);
      for (let b = 0; b < l.length; b++)
        l[b].to < m && (m = l[b].to);
      m < f && (a = p.cut(m - r), p = p.cut(0, m - r), f = m, h = -1);
    } else
      for (; o < s.length && s[o].to < f; )
        o++;
    let g = p.isInline && !p.isLeaf ? l.filter((m) => !m.inline) : l.slice();
    i(p, g, t.forChild(r, p), h), r = f;
  }
}
function Hu(n) {
  if (n.nodeName == "UL" || n.nodeName == "OL") {
    let t = n.style.cssText;
    n.style.cssText = t + "; list-style: square !important", window.getComputedStyle(n).listStyle, n.style.cssText = t;
  }
}
function $u(n, t, e, i) {
  for (let s = 0, r = 0; s < n.childCount && r <= i; ) {
    let o = n.child(s++), l = r;
    if (r += o.nodeSize, !o.isText)
      continue;
    let a = o.text;
    for (; s < n.childCount; ) {
      let c = n.child(s++);
      if (r += c.nodeSize, !c.isText)
        break;
      a += c.text;
    }
    if (r >= e) {
      if (r >= i && a.slice(i - t.length - l, i - l) == t)
        return i - t.length;
      let c = l < i ? a.lastIndexOf(t, i - l - 1) : -1;
      if (c >= 0 && c + t.length + l >= e)
        return l + c;
      if (e == i && a.length >= i + t.length - l && a.slice(i - l, i - l + t.length) == t)
        return i;
    }
  }
  return -1;
}
function rr(n, t, e, i, s) {
  let r = [];
  for (let o = 0, l = 0; o < n.length; o++) {
    let a = n[o], c = l, d = l += a.size;
    c >= e || d <= t ? r.push(a) : (c < t && r.push(a.slice(0, t - c, i)), s && (r.push(s), s = void 0), d > e && r.push(a.slice(e - c, a.size, i)));
  }
  return r;
}
function $r(n, t = null) {
  let e = n.domSelectionRange(), i = n.state.doc;
  if (!e.focusNode)
    return null;
  let s = n.docView.nearestDesc(e.focusNode), r = s && s.size == 0, o = n.docView.posFromDOM(e.focusNode, e.focusOffset, 1);
  if (o < 0)
    return null;
  let l = i.resolve(o), a, c;
  if (ns(e)) {
    for (a = o; s && !s.node; )
      s = s.parent;
    let u = s.node;
    if (s && u.isAtom && _.isSelectable(u) && s.parent && !(u.isInline && pu(e.focusNode, e.focusOffset, s.dom))) {
      let p = s.posBefore;
      c = new _(o == p ? l : i.resolve(p));
    }
  } else {
    if (e instanceof n.dom.ownerDocument.defaultView.Selection && e.rangeCount > 1) {
      let u = o, p = o;
      for (let h = 0; h < e.rangeCount; h++) {
        let f = e.getRangeAt(h);
        u = Math.min(u, n.docView.posFromDOM(f.startContainer, f.startOffset, 1)), p = Math.max(p, n.docView.posFromDOM(f.endContainer, f.endOffset, -1));
      }
      if (u < 0)
        return null;
      [a, o] = p == n.state.selection.anchor ? [p, u] : [u, p], l = i.resolve(o);
    } else
      a = n.docView.posFromDOM(e.anchorNode, e.anchorOffset, 1);
    if (a < 0)
      return null;
  }
  let d = i.resolve(a);
  if (!c) {
    let u = t == "pointer" || n.state.selection.head < l.pos && !r ? 1 : -1;
    c = zr(n, d, l, u);
  }
  return c;
}
function Ya(n) {
  return n.editable ? n.hasFocus() : Qa(n) && document.activeElement && document.activeElement.contains(n.dom);
}
function Wt(n, t = !1) {
  let e = n.state.selection;
  if (Xa(n, e), !!Ya(n)) {
    if (!t && n.input.mouseDown && n.input.mouseDown.allowDefault && rt) {
      let i = n.domSelectionRange(), s = n.domObserver.currentSelection;
      if (i.anchorNode && s.anchorNode && Ae(i.anchorNode, i.anchorOffset, s.anchorNode, s.anchorOffset)) {
        n.input.mouseDown.delayedSelectionSync = !0, n.domObserver.setCurSelection();
        return;
      }
    }
    if (n.domObserver.disconnectSelection(), n.cursorWrapper)
      qu(n);
    else {
      let { anchor: i, head: s } = e, r, o;
      Wo && !(e instanceof T) && (e.$from.parent.inlineContent || (r = Ko(n, e.from)), !e.empty && !e.$from.parent.inlineContent && (o = Ko(n, e.to))), n.docView.setSelection(i, s, n, t), Wo && (r && Jo(r), o && Jo(o)), e.visible ? n.dom.classList.remove("ProseMirror-hideselection") : (n.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && zu(n));
    }
    n.domObserver.setCurSelection(), n.domObserver.connectSelection();
  }
}
const Wo = at || rt && Ba < 63;
function Ko(n, t) {
  let { node: e, offset: i } = n.docView.domFromPos(t, 0), s = i < e.childNodes.length ? e.childNodes[i] : null, r = i ? e.childNodes[i - 1] : null;
  if (at && s && s.contentEditable == "false")
    return _s(s);
  if ((!s || s.contentEditable == "false") && (!r || r.contentEditable == "false")) {
    if (s)
      return _s(s);
    if (r)
      return _s(r);
  }
}
function _s(n) {
  return n.contentEditable = "true", at && n.draggable && (n.draggable = !1, n.wasDraggable = !0), n;
}
function Jo(n) {
  n.contentEditable = "false", n.wasDraggable && (n.draggable = !0, n.wasDraggable = null);
}
function zu(n) {
  let t = n.dom.ownerDocument;
  t.removeEventListener("selectionchange", n.input.hideSelectionGuard);
  let e = n.domSelectionRange(), i = e.anchorNode, s = e.anchorOffset;
  t.addEventListener("selectionchange", n.input.hideSelectionGuard = () => {
    (e.anchorNode != i || e.anchorOffset != s) && (t.removeEventListener("selectionchange", n.input.hideSelectionGuard), setTimeout(() => {
      (!Ya(n) || n.state.selection.visible) && n.dom.classList.remove("ProseMirror-hideselection");
    }, 20));
  });
}
function qu(n) {
  let t = n.domSelection();
  if (!t)
    return;
  let e = n.cursorWrapper.dom, i = e.nodeName == "IMG";
  i ? t.collapse(e.parentNode, it(e) + 1) : t.collapse(e, 0), !i && !n.state.selection.visible && mt && oe <= 11 && (e.disabled = !0, e.disabled = !1);
}
function Xa(n, t) {
  if (t instanceof _) {
    let e = n.docView.descAt(t.from);
    e != n.lastSelectedViewDesc && (Go(n), e && e.selectNode(), n.lastSelectedViewDesc = e);
  } else
    Go(n);
}
function Go(n) {
  n.lastSelectedViewDesc && (n.lastSelectedViewDesc.parent && n.lastSelectedViewDesc.deselectNode(), n.lastSelectedViewDesc = void 0);
}
function zr(n, t, e, i) {
  return n.someProp("createSelectionBetween", (s) => s(n, t, e)) || T.between(t, e, i);
}
function Yo(n) {
  return n.editable && !n.hasFocus() ? !1 : Qa(n);
}
function Qa(n) {
  let t = n.domSelectionRange();
  if (!t.anchorNode)
    return !1;
  try {
    return n.dom.contains(t.anchorNode.nodeType == 3 ? t.anchorNode.parentNode : t.anchorNode) && (n.editable || n.dom.contains(t.focusNode.nodeType == 3 ? t.focusNode.parentNode : t.focusNode));
  } catch {
    return !1;
  }
}
function Fu(n) {
  let t = n.docView.domFromPos(n.state.selection.anchor, 0), e = n.domSelectionRange();
  return Ae(t.node, t.offset, e.anchorNode, e.anchorOffset);
}
function or(n, t) {
  let { $anchor: e, $head: i } = n.selection, s = t > 0 ? e.max(i) : e.min(i), r = s.parent.inlineContent ? s.depth ? n.doc.resolve(t > 0 ? s.after() : s.before()) : null : s;
  return r && L.findFrom(r, t);
}
function Gt(n, t) {
  return n.dispatch(n.state.tr.setSelection(t).scrollIntoView()), !0;
}
function Xo(n, t, e) {
  let i = n.state.selection;
  if (i instanceof T)
    if (e.indexOf("s") > -1) {
      let { $head: s } = i, r = s.textOffset ? null : t < 0 ? s.nodeBefore : s.nodeAfter;
      if (!r || r.isText || !r.isLeaf)
        return !1;
      let o = n.state.doc.resolve(s.pos + r.nodeSize * (t < 0 ? -1 : 1));
      return Gt(n, new T(i.$anchor, o));
    } else if (i.empty) {
      if (n.endOfTextblock(t > 0 ? "forward" : "backward")) {
        let s = or(n.state, t);
        return s && s instanceof _ ? Gt(n, s) : !1;
      } else if (!(xt && e.indexOf("m") > -1)) {
        let s = i.$head, r = s.textOffset ? null : t < 0 ? s.nodeBefore : s.nodeAfter, o;
        if (!r || r.isText)
          return !1;
        let l = t < 0 ? s.pos - r.nodeSize : s.pos;
        return r.isAtom || (o = n.docView.descAt(l)) && !o.contentDOM ? _.isSelectable(r) ? Gt(n, new _(t < 0 ? n.state.doc.resolve(s.pos - r.nodeSize) : s)) : Dn ? Gt(n, new T(n.state.doc.resolve(t < 0 ? l : l + r.nodeSize))) : !1 : !1;
      }
    } else return !1;
  else {
    if (i instanceof _ && i.node.isInline)
      return Gt(n, new T(t > 0 ? i.$to : i.$from));
    {
      let s = or(n.state, t);
      return s ? Gt(n, s) : !1;
    }
  }
}
function mi(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function pn(n, t) {
  let e = n.pmViewDesc;
  return e && e.size == 0 && (t < 0 || n.nextSibling || n.nodeName != "BR");
}
function Be(n, t) {
  return t < 0 ? Vu(n) : ju(n);
}
function Vu(n) {
  let t = n.domSelectionRange(), e = t.focusNode, i = t.focusOffset;
  if (!e)
    return;
  let s, r, o = !1;
  for (St && e.nodeType == 1 && i < mi(e) && pn(e.childNodes[i], -1) && (o = !0); ; )
    if (i > 0) {
      if (e.nodeType != 1)
        break;
      {
        let l = e.childNodes[i - 1];
        if (pn(l, -1))
          s = e, r = --i;
        else if (l.nodeType == 3)
          e = l, i = e.nodeValue.length;
        else
          break;
      }
    } else {
      if (Za(e))
        break;
      {
        let l = e.previousSibling;
        for (; l && pn(l, -1); )
          s = e.parentNode, r = it(l), l = l.previousSibling;
        if (l)
          e = l, i = mi(e);
        else {
          if (e = e.parentNode, e == n.dom)
            break;
          i = 0;
        }
      }
    }
  o ? lr(n, e, i) : s && lr(n, s, r);
}
function ju(n) {
  let t = n.domSelectionRange(), e = t.focusNode, i = t.focusOffset;
  if (!e)
    return;
  let s = mi(e), r, o;
  for (; ; )
    if (i < s) {
      if (e.nodeType != 1)
        break;
      let l = e.childNodes[i];
      if (pn(l, 1))
        r = e, o = ++i;
      else
        break;
    } else {
      if (Za(e))
        break;
      {
        let l = e.nextSibling;
        for (; l && pn(l, 1); )
          r = l.parentNode, o = it(l) + 1, l = l.nextSibling;
        if (l)
          e = l, i = 0, s = mi(e);
        else {
          if (e = e.parentNode, e == n.dom)
            break;
          i = s = 0;
        }
      }
    }
  r && lr(n, r, o);
}
function Za(n) {
  let t = n.pmViewDesc;
  return t && t.node && t.node.isBlock;
}
function Uu(n, t) {
  for (; n && t == n.childNodes.length && !In(n); )
    t = it(n) + 1, n = n.parentNode;
  for (; n && t < n.childNodes.length; ) {
    let e = n.childNodes[t];
    if (e.nodeType == 3)
      return e;
    if (e.nodeType == 1 && e.contentEditable == "false")
      break;
    n = e, t = 0;
  }
}
function Wu(n, t) {
  for (; n && !t && !In(n); )
    t = it(n), n = n.parentNode;
  for (; n && t; ) {
    let e = n.childNodes[t - 1];
    if (e.nodeType == 3)
      return e;
    if (e.nodeType == 1 && e.contentEditable == "false")
      break;
    n = e, t = n.childNodes.length;
  }
}
function lr(n, t, e) {
  if (t.nodeType != 3) {
    let r, o;
    (o = Uu(t, e)) ? (t = o, e = 0) : (r = Wu(t, e)) && (t = r, e = r.nodeValue.length);
  }
  let i = n.domSelection();
  if (!i)
    return;
  if (ns(i)) {
    let r = document.createRange();
    r.setEnd(t, e), r.setStart(t, e), i.removeAllRanges(), i.addRange(r);
  } else i.extend && i.extend(t, e);
  n.domObserver.setCurSelection();
  let { state: s } = n;
  setTimeout(() => {
    n.state == s && Wt(n);
  }, 50);
}
function Qo(n, t) {
  let e = n.state.doc.resolve(t);
  if (!(rt || Ha) && e.parent.inlineContent) {
    let s = n.coordsAtPos(t);
    if (t > e.start()) {
      let r = n.coordsAtPos(t - 1), o = (r.top + r.bottom) / 2;
      if (o > s.top && o < s.bottom && Math.abs(r.left - s.left) > 1)
        return r.left < s.left ? "ltr" : "rtl";
    }
    if (t < e.end()) {
      let r = n.coordsAtPos(t + 1), o = (r.top + r.bottom) / 2;
      if (o > s.top && o < s.bottom && Math.abs(r.left - s.left) > 1)
        return r.left > s.left ? "ltr" : "rtl";
    }
  }
  return getComputedStyle(n.dom).direction == "rtl" ? "rtl" : "ltr";
}
function Zo(n, t, e) {
  let i = n.state.selection;
  if (i instanceof T && !i.empty || e.indexOf("s") > -1 || xt && e.indexOf("m") > -1)
    return !1;
  let { $from: s, $to: r } = i;
  if (!s.parent.inlineContent || n.endOfTextblock(t < 0 ? "up" : "down")) {
    let o = or(n.state, t);
    if (o && o instanceof _)
      return Gt(n, o);
  }
  if (!s.parent.inlineContent) {
    let o = t < 0 ? s : r, l = i instanceof vt ? L.near(o, t) : L.findFrom(o, t);
    return l ? Gt(n, l) : !1;
  }
  return !1;
}
function tl(n, t) {
  if (!(n.state.selection instanceof T))
    return !0;
  let { $head: e, $anchor: i, empty: s } = n.state.selection;
  if (!e.sameParent(i))
    return !0;
  if (!s)
    return !1;
  if (n.endOfTextblock(t > 0 ? "forward" : "backward"))
    return !0;
  let r = !e.textOffset && (t < 0 ? e.nodeBefore : e.nodeAfter);
  if (r && !r.isText) {
    let o = n.state.tr;
    return t < 0 ? o.delete(e.pos - r.nodeSize, e.pos) : o.delete(e.pos, e.pos + r.nodeSize), n.dispatch(o), !0;
  }
  return !1;
}
function el(n, t, e) {
  n.domObserver.stop(), t.contentEditable = e, n.domObserver.start();
}
function Ku(n) {
  if (!at || n.state.selection.$head.parentOffset > 0)
    return !1;
  let { focusNode: t, focusOffset: e } = n.domSelectionRange();
  if (t && t.nodeType == 1 && e == 0 && t.firstChild && t.firstChild.contentEditable == "false") {
    let i = t.firstChild;
    el(n, i, "true"), setTimeout(() => el(n, i, "false"), 20);
  }
  return !1;
}
function Ju(n) {
  let t = "";
  return n.ctrlKey && (t += "c"), n.metaKey && (t += "m"), n.altKey && (t += "a"), n.shiftKey && (t += "s"), t;
}
function Gu(n, t) {
  let e = t.keyCode, i = Ju(t);
  if (e == 8 || xt && e == 72 && i == "c")
    return tl(n, -1) || Be(n, -1);
  if (e == 46 && !t.shiftKey || xt && e == 68 && i == "c")
    return tl(n, 1) || Be(n, 1);
  if (e == 13 || e == 27)
    return !0;
  if (e == 37 || xt && e == 66 && i == "c") {
    let s = e == 37 ? Qo(n, n.state.selection.from) == "ltr" ? -1 : 1 : -1;
    return Xo(n, s, i) || Be(n, s);
  } else if (e == 39 || xt && e == 70 && i == "c") {
    let s = e == 39 ? Qo(n, n.state.selection.from) == "ltr" ? 1 : -1 : 1;
    return Xo(n, s, i) || Be(n, s);
  } else {
    if (e == 38 || xt && e == 80 && i == "c")
      return Zo(n, -1, i) || Be(n, -1);
    if (e == 40 || xt && e == 78 && i == "c")
      return Ku(n) || Zo(n, 1, i) || Be(n, 1);
    if (i == (xt ? "m" : "c") && (e == 66 || e == 73 || e == 89 || e == 90))
      return !0;
  }
  return !1;
}
function qr(n, t) {
  n.someProp("transformCopied", (h) => {
    t = h(t, n);
  });
  let e = [], { content: i, openStart: s, openEnd: r } = t;
  for (; s > 1 && r > 1 && i.childCount == 1 && i.firstChild.childCount == 1; ) {
    s--, r--;
    let h = i.firstChild;
    e.push(h.type.name, h.attrs != h.type.defaultAttrs ? h.attrs : null), i = h.content;
  }
  let o = n.someProp("clipboardSerializer") || Ie.fromSchema(n.state.schema), l = rc(), a = l.createElement("div");
  a.appendChild(o.serializeFragment(i, { document: l }));
  let c = a.firstChild, d, u = 0;
  for (; c && c.nodeType == 1 && (d = sc[c.nodeName.toLowerCase()]); ) {
    for (let h = d.length - 1; h >= 0; h--) {
      let f = l.createElement(d[h]);
      for (; a.firstChild; )
        f.appendChild(a.firstChild);
      a.appendChild(f), u++;
    }
    c = a.firstChild;
  }
  c && c.nodeType == 1 && c.setAttribute("data-pm-slice", `${s} ${r}${u ? ` -${u}` : ""} ${JSON.stringify(e)}`);
  let p = n.someProp("clipboardTextSerializer", (h) => h(t, n)) || t.content.textBetween(0, t.content.size, `

`);
  return { dom: a, text: p, slice: t };
}
function tc(n, t, e, i, s) {
  let r = s.parent.type.spec.code, o, l;
  if (!e && !t)
    return null;
  let a = !!t && (i || r || !e);
  if (a) {
    if (n.someProp("transformPastedText", (p) => {
      t = p(t, r || i, n);
    }), r)
      return l = new C(v.from(n.state.schema.text(t.replace(/\r\n?/g, `
`))), 0, 0), n.someProp("transformPasted", (p) => {
        l = p(l, n, !0);
      }), l;
    let u = n.someProp("clipboardTextParser", (p) => p(t, s, i, n));
    if (u)
      l = u;
    else {
      let p = s.marks(), { schema: h } = n.state, f = Ie.fromSchema(h);
      o = document.createElement("div"), t.split(/(?:\r\n?|\n)+/).forEach((g) => {
        let m = o.appendChild(document.createElement("p"));
        g && m.appendChild(f.serializeNode(h.text(g, p)));
      });
    }
  } else
    n.someProp("transformPastedHTML", (u) => {
      e = u(e, n);
    }), o = Zu(e), Dn && tp(o);
  let c = o && o.querySelector("[data-pm-slice]"), d = c && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(c.getAttribute("data-pm-slice") || "");
  if (d && d[3])
    for (let u = +d[3]; u > 0; u--) {
      let p = o.firstChild;
      for (; p && p.nodeType != 1; )
        p = p.nextSibling;
      if (!p)
        break;
      o = p;
    }
  if (l || (l = (n.someProp("clipboardParser") || n.someProp("domParser") || re.fromSchema(n.state.schema)).parseSlice(o, {
    preserveWhitespace: !!(a || d),
    context: s,
    ruleFromNode(p) {
      return p.nodeName == "BR" && !p.nextSibling && p.parentNode && !Yu.test(p.parentNode.nodeName) ? { ignore: !0 } : null;
    }
  })), d)
    l = ep(nl(l, +d[1], +d[2]), d[4]);
  else if (l = C.maxOpen(Xu(l.content, s), !0), l.openStart || l.openEnd) {
    let u = 0, p = 0;
    for (let h = l.content.firstChild; u < l.openStart && !h.type.spec.isolating; u++, h = h.firstChild)
      ;
    for (let h = l.content.lastChild; p < l.openEnd && !h.type.spec.isolating; p++, h = h.lastChild)
      ;
    l = nl(l, u, p);
  }
  return n.someProp("transformPasted", (u) => {
    l = u(l, n, a);
  }), l;
}
const Yu = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function Xu(n, t) {
  if (n.childCount < 2)
    return n;
  for (let e = t.depth; e >= 0; e--) {
    let s = t.node(e).contentMatchAt(t.index(e)), r, o = [];
    if (n.forEach((l) => {
      if (!o)
        return;
      let a = s.findWrapping(l.type), c;
      if (!a)
        return o = null;
      if (c = o.length && r.length && nc(a, r, l, o[o.length - 1], 0))
        o[o.length - 1] = c;
      else {
        o.length && (o[o.length - 1] = ic(o[o.length - 1], r.length));
        let d = ec(l, a);
        o.push(d), s = s.matchType(d.type), r = a;
      }
    }), o)
      return v.from(o);
  }
  return n;
}
function ec(n, t, e = 0) {
  for (let i = t.length - 1; i >= e; i--)
    n = t[i].create(null, v.from(n));
  return n;
}
function nc(n, t, e, i, s) {
  if (s < n.length && s < t.length && n[s] == t[s]) {
    let r = nc(n, t, e, i.lastChild, s + 1);
    if (r)
      return i.copy(i.content.replaceChild(i.childCount - 1, r));
    if (i.contentMatchAt(i.childCount).matchType(s == n.length - 1 ? e.type : n[s + 1]))
      return i.copy(i.content.append(v.from(ec(e, n, s + 1))));
  }
}
function ic(n, t) {
  if (t == 0)
    return n;
  let e = n.content.replaceChild(n.childCount - 1, ic(n.lastChild, t - 1)), i = n.contentMatchAt(n.childCount).fillBefore(v.empty, !0);
  return n.copy(e.append(i));
}
function ar(n, t, e, i, s, r) {
  let o = t < 0 ? n.firstChild : n.lastChild, l = o.content;
  return n.childCount > 1 && (r = 0), s < i - 1 && (l = ar(l, t, e, i, s + 1, r)), s >= e && (l = t < 0 ? o.contentMatchAt(0).fillBefore(l, r <= s).append(l) : l.append(o.contentMatchAt(o.childCount).fillBefore(v.empty, !0))), n.replaceChild(t < 0 ? 0 : n.childCount - 1, o.copy(l));
}
function nl(n, t, e) {
  return t < n.openStart && (n = new C(ar(n.content, -1, t, n.openStart, 0, n.openEnd), t, n.openEnd)), e < n.openEnd && (n = new C(ar(n.content, 1, e, n.openEnd, 0, 0), n.openStart, e)), n;
}
const sc = {
  thead: ["table"],
  tbody: ["table"],
  tfoot: ["table"],
  caption: ["table"],
  colgroup: ["table"],
  col: ["table", "colgroup"],
  tr: ["table", "tbody"],
  td: ["table", "tbody", "tr"],
  th: ["table", "tbody", "tr"]
};
let il = null;
function rc() {
  return il || (il = document.implementation.createHTMLDocument("title"));
}
let Ts = null;
function Qu(n) {
  let t = window.trustedTypes;
  return t ? (Ts || (Ts = t.defaultPolicy || t.createPolicy("ProseMirrorClipboard", { createHTML: (e) => e })), Ts.createHTML(n)) : n;
}
function Zu(n) {
  let t = /^(\s*<meta [^>]*>)*/.exec(n);
  t && (n = n.slice(t[0].length));
  let e = rc().createElement("div"), i = /<([a-z][^>\s]+)/i.exec(n), s;
  if ((s = i && sc[i[1].toLowerCase()]) && (n = s.map((r) => "<" + r + ">").join("") + n + s.map((r) => "</" + r + ">").reverse().join("")), e.innerHTML = Qu(n), s)
    for (let r = 0; r < s.length; r++)
      e = e.querySelector(s[r]) || e;
  return e;
}
function tp(n) {
  let t = n.querySelectorAll(rt ? "span:not([class]):not([style])" : "span.Apple-converted-space");
  for (let e = 0; e < t.length; e++) {
    let i = t[e];
    i.childNodes.length == 1 && i.textContent == " " && i.parentNode && i.parentNode.replaceChild(n.ownerDocument.createTextNode(" "), i);
  }
}
function ep(n, t) {
  if (!n.size)
    return n;
  let e = n.content.firstChild.type.schema, i;
  try {
    i = JSON.parse(t);
  } catch {
    return n;
  }
  let { content: s, openStart: r, openEnd: o } = n;
  for (let l = i.length - 2; l >= 0; l -= 2) {
    let a = e.nodes[i[l]];
    if (!a || a.hasRequiredAttrs())
      break;
    s = v.from(a.create(i[l + 1], s)), r++, o++;
  }
  return new C(s, r, o);
}
const pt = {}, ht = {}, np = { touchstart: !0, touchmove: !0 };
class ip {
  constructor() {
    this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = { time: 0, x: 0, y: 0, type: "", button: 0 }, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = /* @__PURE__ */ Object.create(null), this.hideSelectionGuard = null;
  }
}
function sp(n) {
  for (let t in pt) {
    let e = pt[t];
    n.dom.addEventListener(t, n.input.eventHandlers[t] = (i) => {
      op(n, i) && !Fr(n, i) && (n.editable || !(i.type in ht)) && e(n, i);
    }, np[t] ? { passive: !0 } : void 0);
  }
  at && n.dom.addEventListener("input", () => null), cr(n);
}
function ie(n, t) {
  n.input.lastSelectionOrigin = t, n.input.lastSelectionTime = Date.now();
}
function rp(n) {
  n.domObserver.stop();
  for (let t in n.input.eventHandlers)
    n.dom.removeEventListener(t, n.input.eventHandlers[t]);
  clearTimeout(n.input.composingTimeout), clearTimeout(n.input.lastIOSEnterFallbackTimeout);
}
function cr(n) {
  n.someProp("handleDOMEvents", (t) => {
    for (let e in t)
      n.input.eventHandlers[e] || n.dom.addEventListener(e, n.input.eventHandlers[e] = (i) => Fr(n, i));
  });
}
function Fr(n, t) {
  return n.someProp("handleDOMEvents", (e) => {
    let i = e[t.type];
    return i ? i(n, t) || t.defaultPrevented : !1;
  });
}
function op(n, t) {
  if (!t.bubbles)
    return !0;
  if (t.defaultPrevented)
    return !1;
  for (let e = t.target; e != n.dom; e = e.parentNode)
    if (!e || e.nodeType == 11 || e.pmViewDesc && e.pmViewDesc.stopEvent(t))
      return !1;
  return !0;
}
function lp(n, t) {
  !Fr(n, t) && pt[t.type] && (n.editable || !(t.type in ht)) && pt[t.type](n, t);
}
ht.keydown = (n, t) => {
  let e = t;
  if (n.input.shiftKey = e.keyCode == 16 || e.shiftKey, !lc(n, e) && (n.input.lastKeyCode = e.keyCode, n.input.lastKeyCodeTime = Date.now(), !(jt && rt && e.keyCode == 13)))
    if (e.keyCode != 229 && n.domObserver.forceFlush(), Ge && e.keyCode == 13 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      let i = Date.now();
      n.input.lastIOSEnter = i, n.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
        n.input.lastIOSEnter == i && (n.someProp("handleKeyDown", (s) => s(n, ge(13, "Enter"))), n.input.lastIOSEnter = 0);
      }, 200);
    } else n.someProp("handleKeyDown", (i) => i(n, e)) || Gu(n, e) ? e.preventDefault() : ie(n, "key");
};
ht.keyup = (n, t) => {
  t.keyCode == 16 && (n.input.shiftKey = !1);
};
ht.keypress = (n, t) => {
  let e = t;
  if (lc(n, e) || !e.charCode || e.ctrlKey && !e.altKey || xt && e.metaKey)
    return;
  if (n.someProp("handleKeyPress", (s) => s(n, e))) {
    e.preventDefault();
    return;
  }
  let i = n.state.selection;
  if (!(i instanceof T) || !i.$from.sameParent(i.$to)) {
    let s = String.fromCharCode(e.charCode), r = () => n.state.tr.insertText(s).scrollIntoView();
    !/[\r\n]/.test(s) && !n.someProp("handleTextInput", (o) => o(n, i.$from.pos, i.$to.pos, s, r)) && n.dispatch(r()), e.preventDefault();
  }
};
function ss(n) {
  return { left: n.clientX, top: n.clientY };
}
function ap(n, t) {
  let e = t.x - n.clientX, i = t.y - n.clientY;
  return e * e + i * i < 100;
}
function Vr(n, t, e, i, s) {
  if (i == -1)
    return !1;
  let r = n.state.doc.resolve(i);
  for (let o = r.depth + 1; o > 0; o--)
    if (n.someProp(t, (l) => o > r.depth ? l(n, e, r.nodeAfter, r.before(o), s, !0) : l(n, e, r.node(o), r.before(o), s, !1)))
      return !0;
  return !1;
}
function We(n, t, e) {
  if (n.focused || n.focus(), n.state.selection.eq(t))
    return;
  let i = n.state.tr.setSelection(t);
  i.setMeta("pointer", !0), n.dispatch(i);
}
function cp(n, t) {
  if (t == -1)
    return !1;
  let e = n.state.doc.resolve(t), i = e.nodeAfter;
  return i && i.isAtom && _.isSelectable(i) ? (We(n, new _(e)), !0) : !1;
}
function dp(n, t) {
  if (t == -1)
    return !1;
  let e = n.state.selection, i, s;
  e instanceof _ && (i = e.node);
  let r = n.state.doc.resolve(t);
  for (let o = r.depth + 1; o > 0; o--) {
    let l = o > r.depth ? r.nodeAfter : r.node(o);
    if (_.isSelectable(l)) {
      i && e.$from.depth > 0 && o >= e.$from.depth && r.before(e.$from.depth + 1) == e.$from.pos ? s = r.before(e.$from.depth) : s = r.before(o);
      break;
    }
  }
  return s != null ? (We(n, _.create(n.state.doc, s)), !0) : !1;
}
function up(n, t, e, i, s) {
  return Vr(n, "handleClickOn", t, e, i) || n.someProp("handleClick", (r) => r(n, t, i)) || (s ? dp(n, e) : cp(n, e));
}
function pp(n, t, e, i) {
  return Vr(n, "handleDoubleClickOn", t, e, i) || n.someProp("handleDoubleClick", (s) => s(n, t, i));
}
function hp(n, t, e, i) {
  return Vr(n, "handleTripleClickOn", t, e, i) || n.someProp("handleTripleClick", (s) => s(n, t, i)) || fp(n, e, i);
}
function fp(n, t, e) {
  if (e.button != 0)
    return !1;
  let i = n.state.doc;
  if (t == -1)
    return i.inlineContent ? (We(n, T.create(i, 0, i.content.size)), !0) : !1;
  let s = i.resolve(t);
  for (let r = s.depth + 1; r > 0; r--) {
    let o = r > s.depth ? s.nodeAfter : s.node(r), l = s.before(r);
    if (o.inlineContent)
      We(n, T.create(i, l + 1, l + 1 + o.content.size));
    else if (_.isSelectable(o))
      We(n, _.create(i, l));
    else
      continue;
    return !0;
  }
}
function jr(n) {
  return gi(n);
}
const oc = xt ? "metaKey" : "ctrlKey";
pt.mousedown = (n, t) => {
  let e = t;
  n.input.shiftKey = e.shiftKey;
  let i = jr(n), s = Date.now(), r = "singleClick";
  s - n.input.lastClick.time < 500 && ap(e, n.input.lastClick) && !e[oc] && n.input.lastClick.button == e.button && (n.input.lastClick.type == "singleClick" ? r = "doubleClick" : n.input.lastClick.type == "doubleClick" && (r = "tripleClick")), n.input.lastClick = { time: s, x: e.clientX, y: e.clientY, type: r, button: e.button };
  let o = n.posAtCoords(ss(e));
  o && (r == "singleClick" ? (n.input.mouseDown && n.input.mouseDown.done(), n.input.mouseDown = new mp(n, o, e, !!i)) : (r == "doubleClick" ? pp : hp)(n, o.pos, o.inside, e) ? e.preventDefault() : ie(n, "pointer"));
};
class mp {
  constructor(t, e, i, s) {
    this.view = t, this.pos = e, this.event = i, this.flushed = s, this.delayedSelectionSync = !1, this.mightDrag = null, this.startDoc = t.state.doc, this.selectNode = !!i[oc], this.allowDefault = i.shiftKey;
    let r, o;
    if (e.inside > -1)
      r = t.state.doc.nodeAt(e.inside), o = e.inside;
    else {
      let d = t.state.doc.resolve(e.pos);
      r = d.parent, o = d.depth ? d.before() : 0;
    }
    const l = s ? null : i.target, a = l ? t.docView.nearestDesc(l, !0) : null;
    this.target = a && a.nodeDOM.nodeType == 1 ? a.nodeDOM : null;
    let { selection: c } = t.state;
    (i.button == 0 && r.type.spec.draggable && r.type.spec.selectable !== !1 || c instanceof _ && c.from <= o && c.to > o) && (this.mightDrag = {
      node: r,
      pos: o,
      addAttr: !!(this.target && !this.target.draggable),
      setUneditable: !!(this.target && St && !this.target.hasAttribute("contentEditable"))
    }), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
      this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
    }, 20), this.view.domObserver.start()), t.root.addEventListener("mouseup", this.up = this.up.bind(this)), t.root.addEventListener("mousemove", this.move = this.move.bind(this)), ie(t, "pointer");
  }
  done() {
    this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => Wt(this.view)), this.view.input.mouseDown = null;
  }
  up(t) {
    if (this.done(), !this.view.dom.contains(t.target))
      return;
    let e = this.pos;
    this.view.state.doc != this.startDoc && (e = this.view.posAtCoords(ss(t))), this.updateAllowDefault(t), this.allowDefault || !e ? ie(this.view, "pointer") : up(this.view, e.pos, e.inside, t, this.selectNode) ? t.preventDefault() : t.button == 0 && (this.flushed || // Safari ignores clicks on draggable elements
    at && this.mightDrag && !this.mightDrag.node.isAtom || // Chrome will sometimes treat a node selection as a
    // cursor, but still report that the node is selected
    // when asked through getSelection. You'll then get a
    // situation where clicking at the point where that
    // (hidden) cursor is doesn't change the selection, and
    // thus doesn't get a reaction from ProseMirror. This
    // works around that.
    rt && !this.view.state.selection.visible && Math.min(Math.abs(e.pos - this.view.state.selection.from), Math.abs(e.pos - this.view.state.selection.to)) <= 2) ? (We(this.view, L.near(this.view.state.doc.resolve(e.pos))), t.preventDefault()) : ie(this.view, "pointer");
  }
  move(t) {
    this.updateAllowDefault(t), ie(this.view, "pointer"), t.buttons == 0 && this.done();
  }
  updateAllowDefault(t) {
    !this.allowDefault && (Math.abs(this.event.x - t.clientX) > 4 || Math.abs(this.event.y - t.clientY) > 4) && (this.allowDefault = !0);
  }
}
pt.touchstart = (n) => {
  n.input.lastTouch = Date.now(), jr(n), ie(n, "pointer");
};
pt.touchmove = (n) => {
  n.input.lastTouch = Date.now(), ie(n, "pointer");
};
pt.contextmenu = (n) => jr(n);
function lc(n, t) {
  return n.composing ? !0 : at && Math.abs(t.timeStamp - n.input.compositionEndedAt) < 500 ? (n.input.compositionEndedAt = -2e8, !0) : !1;
}
const gp = jt ? 5e3 : -1;
ht.compositionstart = ht.compositionupdate = (n) => {
  if (!n.composing) {
    n.domObserver.flush();
    let { state: t } = n, e = t.selection.$to;
    if (t.selection instanceof T && (t.storedMarks || !e.textOffset && e.parentOffset && e.nodeBefore.marks.some((i) => i.type.spec.inclusive === !1) || rt && Ha && bp(n)))
      n.markCursor = n.state.storedMarks || e.marks(), gi(n, !0), n.markCursor = null;
    else if (gi(n, !t.selection.empty), St && t.selection.empty && e.parentOffset && !e.textOffset && e.nodeBefore.marks.length) {
      let i = n.domSelectionRange();
      for (let s = i.focusNode, r = i.focusOffset; s && s.nodeType == 1 && r != 0; ) {
        let o = r < 0 ? s.lastChild : s.childNodes[r - 1];
        if (!o)
          break;
        if (o.nodeType == 3) {
          let l = n.domSelection();
          l && l.collapse(o, o.nodeValue.length);
          break;
        } else
          s = o, r = -1;
      }
    }
    n.input.composing = !0;
  }
  ac(n, gp);
};
function bp(n) {
  let { focusNode: t, focusOffset: e } = n.domSelectionRange();
  if (!t || t.nodeType != 1 || e >= t.childNodes.length)
    return !1;
  let i = t.childNodes[e];
  return i.nodeType == 1 && i.contentEditable == "false";
}
ht.compositionend = (n, t) => {
  n.composing && (n.input.composing = !1, n.input.compositionEndedAt = t.timeStamp, n.input.compositionPendingChanges = n.domObserver.pendingRecords().length ? n.input.compositionID : 0, n.input.compositionNode = null, n.input.badSafariComposition ? n.domObserver.forceFlush() : n.input.compositionPendingChanges && Promise.resolve().then(() => n.domObserver.flush()), n.input.compositionID++, ac(n, 20));
};
function ac(n, t) {
  clearTimeout(n.input.composingTimeout), t > -1 && (n.input.composingTimeout = setTimeout(() => gi(n), t));
}
function cc(n) {
  for (n.composing && (n.input.composing = !1, n.input.compositionEndedAt = vp()); n.input.compositionNodes.length > 0; )
    n.input.compositionNodes.pop().markParentsDirty();
}
function yp(n) {
  let t = n.domSelectionRange();
  if (!t.focusNode)
    return null;
  let e = du(t.focusNode, t.focusOffset), i = uu(t.focusNode, t.focusOffset);
  if (e && i && e != i) {
    let s = i.pmViewDesc, r = n.domObserver.lastChangedTextNode;
    if (e == r || i == r)
      return r;
    if (!s || !s.isText(i.nodeValue))
      return i;
    if (n.input.compositionNode == i) {
      let o = e.pmViewDesc;
      if (!(!o || !o.isText(e.nodeValue)))
        return i;
    }
  }
  return e || i;
}
function vp() {
  let n = document.createEvent("Event");
  return n.initEvent("event", !0, !0), n.timeStamp;
}
function gi(n, t = !1) {
  if (!(jt && n.domObserver.flushingSoon >= 0)) {
    if (n.domObserver.forceFlush(), cc(n), t || n.docView && n.docView.dirty) {
      let e = $r(n), i = n.state.selection;
      return e && !e.eq(i) ? n.dispatch(n.state.tr.setSelection(e)) : (n.markCursor || t) && !i.$from.node(i.$from.sharedDepth(i.to)).inlineContent ? n.dispatch(n.state.tr.deleteSelection()) : n.updateState(n.state), !0;
    }
    return !1;
  }
}
function wp(n, t) {
  if (!n.dom.parentNode)
    return;
  let e = n.dom.parentNode.appendChild(document.createElement("div"));
  e.appendChild(t), e.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let i = getSelection(), s = document.createRange();
  s.selectNodeContents(t), n.dom.blur(), i.removeAllRanges(), i.addRange(s), setTimeout(() => {
    e.parentNode && e.parentNode.removeChild(e), n.focus();
  }, 50);
}
const Sn = mt && oe < 15 || Ge && mu < 604;
pt.copy = ht.cut = (n, t) => {
  let e = t, i = n.state.selection, s = e.type == "cut";
  if (i.empty)
    return;
  let r = Sn ? null : e.clipboardData, o = i.content(), { dom: l, text: a } = qr(n, o);
  r ? (e.preventDefault(), r.clearData(), r.setData("text/html", l.innerHTML), r.setData("text/plain", a)) : wp(n, l), s && n.dispatch(n.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function kp(n) {
  return n.openStart == 0 && n.openEnd == 0 && n.content.childCount == 1 ? n.content.firstChild : null;
}
function xp(n, t) {
  if (!n.dom.parentNode)
    return;
  let e = n.input.shiftKey || n.state.selection.$from.parent.type.spec.code, i = n.dom.parentNode.appendChild(document.createElement(e ? "textarea" : "div"));
  e || (i.contentEditable = "true"), i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.focus();
  let s = n.input.shiftKey && n.input.lastKeyCode != 45;
  setTimeout(() => {
    n.focus(), i.parentNode && i.parentNode.removeChild(i), e ? Mn(n, i.value, null, s, t) : Mn(n, i.textContent, i.innerHTML, s, t);
  }, 50);
}
function Mn(n, t, e, i, s) {
  let r = tc(n, t, e, i, n.state.selection.$from);
  if (n.someProp("handlePaste", (a) => a(n, s, r || C.empty)))
    return !0;
  if (!r)
    return !1;
  let o = kp(r), l = o ? n.state.tr.replaceSelectionWith(o, i) : n.state.tr.replaceSelection(r);
  return n.dispatch(l.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function dc(n) {
  let t = n.getData("text/plain") || n.getData("Text");
  if (t)
    return t;
  let e = n.getData("text/uri-list");
  return e ? e.replace(/\r?\n/g, " ") : "";
}
ht.paste = (n, t) => {
  let e = t;
  if (n.composing && !jt)
    return;
  let i = Sn ? null : e.clipboardData, s = n.input.shiftKey && n.input.lastKeyCode != 45;
  i && Mn(n, dc(i), i.getData("text/html"), s, e) ? e.preventDefault() : xp(n, e);
};
class uc {
  constructor(t, e, i) {
    this.slice = t, this.move = e, this.node = i;
  }
}
const Cp = xt ? "altKey" : "ctrlKey";
function pc(n, t) {
  let e = n.someProp("dragCopies", (i) => !i(t));
  return e ?? !t[Cp];
}
pt.dragstart = (n, t) => {
  let e = t, i = n.input.mouseDown;
  if (i && i.done(), !e.dataTransfer)
    return;
  let s = n.state.selection, r = s.empty ? null : n.posAtCoords(ss(e)), o;
  if (!(r && r.pos >= s.from && r.pos <= (s instanceof _ ? s.to - 1 : s.to))) {
    if (i && i.mightDrag)
      o = _.create(n.state.doc, i.mightDrag.pos);
    else if (e.target && e.target.nodeType == 1) {
      let u = n.docView.nearestDesc(e.target, !0);
      u && u.node.type.spec.draggable && u != n.docView && (o = _.create(n.state.doc, u.posBefore));
    }
  }
  let l = (o || n.state.selection).content(), { dom: a, text: c, slice: d } = qr(n, l);
  (!e.dataTransfer.files.length || !rt || Ba > 120) && e.dataTransfer.clearData(), e.dataTransfer.setData(Sn ? "Text" : "text/html", a.innerHTML), e.dataTransfer.effectAllowed = "copyMove", Sn || e.dataTransfer.setData("text/plain", c), n.dragging = new uc(d, pc(n, e), o);
};
pt.dragend = (n) => {
  let t = n.dragging;
  window.setTimeout(() => {
    n.dragging == t && (n.dragging = null);
  }, 50);
};
ht.dragover = ht.dragenter = (n, t) => t.preventDefault();
ht.drop = (n, t) => {
  try {
    Sp(n, t, n.dragging);
  } finally {
    n.dragging = null;
  }
};
function Sp(n, t, e) {
  if (!t.dataTransfer)
    return;
  let i = n.posAtCoords(ss(t));
  if (!i)
    return;
  let s = n.state.doc.resolve(i.pos), r = e && e.slice;
  r ? n.someProp("transformPasted", (h) => {
    r = h(r, n, !1);
  }) : r = tc(n, dc(t.dataTransfer), Sn ? null : t.dataTransfer.getData("text/html"), !1, s);
  let o = !!(e && pc(n, t));
  if (n.someProp("handleDrop", (h) => h(n, t, r || C.empty, o))) {
    t.preventDefault();
    return;
  }
  if (!r)
    return;
  t.preventDefault();
  let l = r ? Ta(n.state.doc, s.pos, r) : s.pos;
  l == null && (l = s.pos);
  let a = n.state.tr;
  if (o) {
    let { node: h } = e;
    h ? h.replace(a) : a.deleteSelection();
  }
  let c = a.mapping.map(l), d = r.openStart == 0 && r.openEnd == 0 && r.content.childCount == 1, u = a.doc;
  if (d ? a.replaceRangeWith(c, c, r.content.firstChild) : a.replaceRange(c, c, r), a.doc.eq(u))
    return;
  let p = a.doc.resolve(c);
  if (d && _.isSelectable(r.content.firstChild) && p.nodeAfter && p.nodeAfter.sameMarkup(r.content.firstChild))
    a.setSelection(new _(p));
  else {
    let h = a.mapping.map(l);
    a.mapping.maps[a.mapping.maps.length - 1].forEach((f, g, m, b) => h = b), a.setSelection(zr(n, p, a.doc.resolve(h)));
  }
  n.focus(), n.dispatch(a.setMeta("uiEvent", "drop"));
}
pt.focus = (n) => {
  n.input.lastFocus = Date.now(), n.focused || (n.domObserver.stop(), n.dom.classList.add("ProseMirror-focused"), n.domObserver.start(), n.focused = !0, setTimeout(() => {
    n.docView && n.hasFocus() && !n.domObserver.currentSelection.eq(n.domSelectionRange()) && Wt(n);
  }, 20));
};
pt.blur = (n, t) => {
  let e = t;
  n.focused && (n.domObserver.stop(), n.dom.classList.remove("ProseMirror-focused"), n.domObserver.start(), e.relatedTarget && n.dom.contains(e.relatedTarget) && n.domObserver.currentSelection.clear(), n.focused = !1);
};
pt.beforeinput = (n, t) => {
  if (rt && jt && t.inputType == "deleteContentBackward") {
    n.domObserver.flushSoon();
    let { domChangeCount: i } = n.input;
    setTimeout(() => {
      if (n.input.domChangeCount != i || (n.dom.blur(), n.focus(), n.someProp("handleKeyDown", (r) => r(n, ge(8, "Backspace")))))
        return;
      let { $cursor: s } = n.state.selection;
      s && s.pos > 0 && n.dispatch(n.state.tr.delete(s.pos - 1, s.pos).scrollIntoView());
    }, 50);
  }
};
for (let n in ht)
  pt[n] = ht[n];
function En(n, t) {
  if (n == t)
    return !0;
  for (let e in n)
    if (n[e] !== t[e])
      return !1;
  for (let e in t)
    if (!(e in n))
      return !1;
  return !0;
}
class bi {
  constructor(t, e) {
    this.toDOM = t, this.spec = e || Se, this.side = this.spec.side || 0;
  }
  map(t, e, i, s) {
    let { pos: r, deleted: o } = t.mapResult(e.from + s, this.side < 0 ? -1 : 1);
    return o ? null : new ot(r - i, r - i, this);
  }
  valid() {
    return !0;
  }
  eq(t) {
    return this == t || t instanceof bi && (this.spec.key && this.spec.key == t.spec.key || this.toDOM == t.toDOM && En(this.spec, t.spec));
  }
  destroy(t) {
    this.spec.destroy && this.spec.destroy(t);
  }
}
class ae {
  constructor(t, e) {
    this.attrs = t, this.spec = e || Se;
  }
  map(t, e, i, s) {
    let r = t.map(e.from + s, this.spec.inclusiveStart ? -1 : 1) - i, o = t.map(e.to + s, this.spec.inclusiveEnd ? 1 : -1) - i;
    return r >= o ? null : new ot(r, o, this);
  }
  valid(t, e) {
    return e.from < e.to;
  }
  eq(t) {
    return this == t || t instanceof ae && En(this.attrs, t.attrs) && En(this.spec, t.spec);
  }
  static is(t) {
    return t.type instanceof ae;
  }
  destroy() {
  }
}
class Ur {
  constructor(t, e) {
    this.attrs = t, this.spec = e || Se;
  }
  map(t, e, i, s) {
    let r = t.mapResult(e.from + s, 1);
    if (r.deleted)
      return null;
    let o = t.mapResult(e.to + s, -1);
    return o.deleted || o.pos <= r.pos ? null : new ot(r.pos - i, o.pos - i, this);
  }
  valid(t, e) {
    let { index: i, offset: s } = t.content.findIndex(e.from), r;
    return s == e.from && !(r = t.child(i)).isText && s + r.nodeSize == e.to;
  }
  eq(t) {
    return this == t || t instanceof Ur && En(this.attrs, t.attrs) && En(this.spec, t.spec);
  }
  destroy() {
  }
}
class ot {
  /**
  @internal
  */
  constructor(t, e, i) {
    this.from = t, this.to = e, this.type = i;
  }
  /**
  @internal
  */
  copy(t, e) {
    return new ot(t, e, this.type);
  }
  /**
  @internal
  */
  eq(t, e = 0) {
    return this.type.eq(t.type) && this.from + e == t.from && this.to + e == t.to;
  }
  /**
  @internal
  */
  map(t, e, i) {
    return this.type.map(t, this, e, i);
  }
  /**
  Creates a widget decoration, which is a DOM node that's shown in
  the document at the given position. It is recommended that you
  delay rendering the widget by passing a function that will be
  called when the widget is actually drawn in a view, but you can
  also directly pass a DOM node. `getPos` can be used to find the
  widget's current document position.
  */
  static widget(t, e, i) {
    return new ot(t, t, new bi(e, i));
  }
  /**
  Creates an inline decoration, which adds the given attributes to
  each inline node between `from` and `to`.
  */
  static inline(t, e, i, s) {
    return new ot(t, e, new ae(i, s));
  }
  /**
  Creates a node decoration. `from` and `to` should point precisely
  before and after a node in the document. That node, and only that
  node, will receive the given attributes.
  */
  static node(t, e, i, s) {
    return new ot(t, e, new Ur(i, s));
  }
  /**
  The spec provided when creating this decoration. Can be useful
  if you've stored extra information in that object.
  */
  get spec() {
    return this.type.spec;
  }
  /**
  @internal
  */
  get inline() {
    return this.type instanceof ae;
  }
  /**
  @internal
  */
  get widget() {
    return this.type instanceof bi;
  }
}
const ze = [], Se = {};
class F {
  /**
  @internal
  */
  constructor(t, e) {
    this.local = t.length ? t : ze, this.children = e.length ? e : ze;
  }
  /**
  Create a set of decorations, using the structure of the given
  document. This will consume (modify) the `decorations` array, so
  you must make a copy if you want need to preserve that.
  */
  static create(t, e) {
    return e.length ? yi(e, t, 0, Se) : lt;
  }
  /**
  Find all decorations in this set which touch the given range
  (including decorations that start or end directly at the
  boundaries) and match the given predicate on their spec. When
  `start` and `end` are omitted, all decorations in the set are
  considered. When `predicate` isn't given, all decorations are
  assumed to match.
  */
  find(t, e, i) {
    let s = [];
    return this.findInner(t ?? 0, e ?? 1e9, s, 0, i), s;
  }
  findInner(t, e, i, s, r) {
    for (let o = 0; o < this.local.length; o++) {
      let l = this.local[o];
      l.from <= e && l.to >= t && (!r || r(l.spec)) && i.push(l.copy(l.from + s, l.to + s));
    }
    for (let o = 0; o < this.children.length; o += 3)
      if (this.children[o] < e && this.children[o + 1] > t) {
        let l = this.children[o] + 1;
        this.children[o + 2].findInner(t - l, e - l, i, s + l, r);
      }
  }
  /**
  Map the set of decorations in response to a change in the
  document.
  */
  map(t, e, i) {
    return this == lt || t.maps.length == 0 ? this : this.mapInner(t, e, 0, 0, i || Se);
  }
  /**
  @internal
  */
  mapInner(t, e, i, s, r) {
    let o;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l].map(t, i, s);
      a && a.type.valid(e, a) ? (o || (o = [])).push(a) : r.onRemove && r.onRemove(this.local[l].spec);
    }
    return this.children.length ? Mp(this.children, o || [], t, e, i, s, r) : o ? new F(o.sort(Me), ze) : lt;
  }
  /**
  Add the given array of decorations to the ones in the set,
  producing a new set. Consumes the `decorations` array. Needs
  access to the current document to create the appropriate tree
  structure.
  */
  add(t, e) {
    return e.length ? this == lt ? F.create(t, e) : this.addInner(t, e, 0) : this;
  }
  addInner(t, e, i) {
    let s, r = 0;
    t.forEach((l, a) => {
      let c = a + i, d;
      if (d = fc(e, l, c)) {
        for (s || (s = this.children.slice()); r < s.length && s[r] < a; )
          r += 3;
        s[r] == a ? s[r + 2] = s[r + 2].addInner(l, d, c + 1) : s.splice(r, 0, a, a + l.nodeSize, yi(d, l, c + 1, Se)), r += 3;
      }
    });
    let o = hc(r ? mc(e) : e, -i);
    for (let l = 0; l < o.length; l++)
      o[l].type.valid(t, o[l]) || o.splice(l--, 1);
    return new F(o.length ? this.local.concat(o).sort(Me) : this.local, s || this.children);
  }
  /**
  Create a new set that contains the decorations in this set, minus
  the ones in the given array.
  */
  remove(t) {
    return t.length == 0 || this == lt ? this : this.removeInner(t, 0);
  }
  removeInner(t, e) {
    let i = this.children, s = this.local;
    for (let r = 0; r < i.length; r += 3) {
      let o, l = i[r] + e, a = i[r + 1] + e;
      for (let d = 0, u; d < t.length; d++)
        (u = t[d]) && u.from > l && u.to < a && (t[d] = null, (o || (o = [])).push(u));
      if (!o)
        continue;
      i == this.children && (i = this.children.slice());
      let c = i[r + 2].removeInner(o, l + 1);
      c != lt ? i[r + 2] = c : (i.splice(r, 3), r -= 3);
    }
    if (s.length) {
      for (let r = 0, o; r < t.length; r++)
        if (o = t[r])
          for (let l = 0; l < s.length; l++)
            s[l].eq(o, e) && (s == this.local && (s = this.local.slice()), s.splice(l--, 1));
    }
    return i == this.children && s == this.local ? this : s.length || i.length ? new F(s, i) : lt;
  }
  forChild(t, e) {
    if (this == lt)
      return this;
    if (e.isLeaf)
      return F.empty;
    let i, s;
    for (let l = 0; l < this.children.length; l += 3)
      if (this.children[l] >= t) {
        this.children[l] == t && (i = this.children[l + 2]);
        break;
      }
    let r = t + 1, o = r + e.content.size;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l];
      if (a.from < o && a.to > r && a.type instanceof ae) {
        let c = Math.max(r, a.from) - r, d = Math.min(o, a.to) - r;
        c < d && (s || (s = [])).push(a.copy(c, d));
      }
    }
    if (s) {
      let l = new F(s.sort(Me), ze);
      return i ? new Qt([l, i]) : l;
    }
    return i || lt;
  }
  /**
  @internal
  */
  eq(t) {
    if (this == t)
      return !0;
    if (!(t instanceof F) || this.local.length != t.local.length || this.children.length != t.children.length)
      return !1;
    for (let e = 0; e < this.local.length; e++)
      if (!this.local[e].eq(t.local[e]))
        return !1;
    for (let e = 0; e < this.children.length; e += 3)
      if (this.children[e] != t.children[e] || this.children[e + 1] != t.children[e + 1] || !this.children[e + 2].eq(t.children[e + 2]))
        return !1;
    return !0;
  }
  /**
  @internal
  */
  locals(t) {
    return Wr(this.localsInner(t));
  }
  /**
  @internal
  */
  localsInner(t) {
    if (this == lt)
      return ze;
    if (t.inlineContent || !this.local.some(ae.is))
      return this.local;
    let e = [];
    for (let i = 0; i < this.local.length; i++)
      this.local[i].type instanceof ae || e.push(this.local[i]);
    return e;
  }
  forEachSet(t) {
    t(this);
  }
}
F.empty = new F([], []);
F.removeOverlap = Wr;
const lt = F.empty;
class Qt {
  constructor(t) {
    this.members = t;
  }
  map(t, e) {
    const i = this.members.map((s) => s.map(t, e, Se));
    return Qt.from(i);
  }
  forChild(t, e) {
    if (e.isLeaf)
      return F.empty;
    let i = [];
    for (let s = 0; s < this.members.length; s++) {
      let r = this.members[s].forChild(t, e);
      r != lt && (r instanceof Qt ? i = i.concat(r.members) : i.push(r));
    }
    return Qt.from(i);
  }
  eq(t) {
    if (!(t instanceof Qt) || t.members.length != this.members.length)
      return !1;
    for (let e = 0; e < this.members.length; e++)
      if (!this.members[e].eq(t.members[e]))
        return !1;
    return !0;
  }
  locals(t) {
    let e, i = !0;
    for (let s = 0; s < this.members.length; s++) {
      let r = this.members[s].localsInner(t);
      if (r.length)
        if (!e)
          e = r;
        else {
          i && (e = e.slice(), i = !1);
          for (let o = 0; o < r.length; o++)
            e.push(r[o]);
        }
    }
    return e ? Wr(i ? e : e.sort(Me)) : ze;
  }
  // Create a group for the given array of decoration sets, or return
  // a single set when possible.
  static from(t) {
    switch (t.length) {
      case 0:
        return lt;
      case 1:
        return t[0];
      default:
        return new Qt(t.every((e) => e instanceof F) ? t : t.reduce((e, i) => e.concat(i instanceof F ? i : i.members), []));
    }
  }
  forEachSet(t) {
    for (let e = 0; e < this.members.length; e++)
      this.members[e].forEachSet(t);
  }
}
function Mp(n, t, e, i, s, r, o) {
  let l = n.slice();
  for (let c = 0, d = r; c < e.maps.length; c++) {
    let u = 0;
    e.maps[c].forEach((p, h, f, g) => {
      let m = g - f - (h - p);
      for (let b = 0; b < l.length; b += 3) {
        let y = l[b + 1];
        if (y < 0 || p > y + d - u)
          continue;
        let w = l[b] + d - u;
        h >= w ? l[b + 1] = p <= w ? -2 : -1 : p >= d && m && (l[b] += m, l[b + 1] += m);
      }
      u += m;
    }), d = e.maps[c].map(d, -1);
  }
  let a = !1;
  for (let c = 0; c < l.length; c += 3)
    if (l[c + 1] < 0) {
      if (l[c + 1] == -2) {
        a = !0, l[c + 1] = -1;
        continue;
      }
      let d = e.map(n[c] + r), u = d - s;
      if (u < 0 || u >= i.content.size) {
        a = !0;
        continue;
      }
      let p = e.map(n[c + 1] + r, -1), h = p - s, { index: f, offset: g } = i.content.findIndex(u), m = i.maybeChild(f);
      if (m && g == u && g + m.nodeSize == h) {
        let b = l[c + 2].mapInner(e, m, d + 1, n[c] + r + 1, o);
        b != lt ? (l[c] = u, l[c + 1] = h, l[c + 2] = b) : (l[c + 1] = -2, a = !0);
      } else
        a = !0;
    }
  if (a) {
    let c = Ep(l, n, t, e, s, r, o), d = yi(c, i, 0, o);
    t = d.local;
    for (let u = 0; u < l.length; u += 3)
      l[u + 1] < 0 && (l.splice(u, 3), u -= 3);
    for (let u = 0, p = 0; u < d.children.length; u += 3) {
      let h = d.children[u];
      for (; p < l.length && l[p] < h; )
        p += 3;
      l.splice(p, 0, d.children[u], d.children[u + 1], d.children[u + 2]);
    }
  }
  return new F(t.sort(Me), l);
}
function hc(n, t) {
  if (!t || !n.length)
    return n;
  let e = [];
  for (let i = 0; i < n.length; i++) {
    let s = n[i];
    e.push(new ot(s.from + t, s.to + t, s.type));
  }
  return e;
}
function Ep(n, t, e, i, s, r, o) {
  function l(a, c) {
    for (let d = 0; d < a.local.length; d++) {
      let u = a.local[d].map(i, s, c);
      u ? e.push(u) : o.onRemove && o.onRemove(a.local[d].spec);
    }
    for (let d = 0; d < a.children.length; d += 3)
      l(a.children[d + 2], a.children[d] + c + 1);
  }
  for (let a = 0; a < n.length; a += 3)
    n[a + 1] == -1 && l(n[a + 2], t[a] + r + 1);
  return e;
}
function fc(n, t, e) {
  if (t.isLeaf)
    return null;
  let i = e + t.nodeSize, s = null;
  for (let r = 0, o; r < n.length; r++)
    (o = n[r]) && o.from > e && o.to < i && ((s || (s = [])).push(o), n[r] = null);
  return s;
}
function mc(n) {
  let t = [];
  for (let e = 0; e < n.length; e++)
    n[e] != null && t.push(n[e]);
  return t;
}
function yi(n, t, e, i) {
  let s = [], r = !1;
  t.forEach((l, a) => {
    let c = fc(n, l, a + e);
    if (c) {
      r = !0;
      let d = yi(c, l, e + a + 1, i);
      d != lt && s.push(a, a + l.nodeSize, d);
    }
  });
  let o = hc(r ? mc(n) : n, -e).sort(Me);
  for (let l = 0; l < o.length; l++)
    o[l].type.valid(t, o[l]) || (i.onRemove && i.onRemove(o[l].spec), o.splice(l--, 1));
  return o.length || s.length ? new F(o, s) : lt;
}
function Me(n, t) {
  return n.from - t.from || n.to - t.to;
}
function Wr(n) {
  let t = n;
  for (let e = 0; e < t.length - 1; e++) {
    let i = t[e];
    if (i.from != i.to)
      for (let s = e + 1; s < t.length; s++) {
        let r = t[s];
        if (r.from == i.from) {
          r.to != i.to && (t == n && (t = n.slice()), t[s] = r.copy(r.from, i.to), sl(t, s + 1, r.copy(i.to, r.to)));
          continue;
        } else {
          r.from < i.to && (t == n && (t = n.slice()), t[e] = i.copy(i.from, r.from), sl(t, s, i.copy(r.from, i.to)));
          break;
        }
      }
  }
  return t;
}
function sl(n, t, e) {
  for (; t < n.length && Me(e, n[t]) > 0; )
    t++;
  n.splice(t, 0, e);
}
function As(n) {
  let t = [];
  return n.someProp("decorations", (e) => {
    let i = e(n.state);
    i && i != lt && t.push(i);
  }), n.cursorWrapper && t.push(F.create(n.state.doc, [n.cursorWrapper.deco])), Qt.from(t);
}
const _p = {
  childList: !0,
  characterData: !0,
  characterDataOldValue: !0,
  attributes: !0,
  attributeOldValue: !0,
  subtree: !0
}, Tp = mt && oe <= 11;
class Ap {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  set(t) {
    this.anchorNode = t.anchorNode, this.anchorOffset = t.anchorOffset, this.focusNode = t.focusNode, this.focusOffset = t.focusOffset;
  }
  clear() {
    this.anchorNode = this.focusNode = null;
  }
  eq(t) {
    return t.anchorNode == this.anchorNode && t.anchorOffset == this.anchorOffset && t.focusNode == this.focusNode && t.focusOffset == this.focusOffset;
  }
}
class Lp {
  constructor(t, e) {
    this.view = t, this.handleDOMChange = e, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new Ap(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((i) => {
      for (let s = 0; s < i.length; s++)
        this.queue.push(i[s]);
      mt && oe <= 11 && i.some((s) => s.type == "childList" && s.removedNodes.length || s.type == "characterData" && s.oldValue.length > s.target.nodeValue.length) ? this.flushSoon() : at && t.composing && i.some((s) => s.type == "childList" && s.target.nodeName == "TR") ? (t.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
    }), Tp && (this.onCharData = (i) => {
      this.queue.push({ target: i.target, type: "characterData", oldValue: i.prevValue }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this);
  }
  flushSoon() {
    this.flushingSoon < 0 && (this.flushingSoon = window.setTimeout(() => {
      this.flushingSoon = -1, this.flush();
    }, 20));
  }
  forceFlush() {
    this.flushingSoon > -1 && (window.clearTimeout(this.flushingSoon), this.flushingSoon = -1, this.flush());
  }
  start() {
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, _p)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
  }
  stop() {
    if (this.observer) {
      let t = this.observer.takeRecords();
      if (t.length) {
        for (let e = 0; e < t.length; e++)
          this.queue.push(t[e]);
        window.setTimeout(() => this.flush(), 20);
      }
      this.observer.disconnect();
    }
    this.onCharData && this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData), this.disconnectSelection();
  }
  connectSelection() {
    this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
  }
  disconnectSelection() {
    this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
  }
  suppressSelectionUpdates() {
    this.suppressingSelectionUpdates = !0, setTimeout(() => this.suppressingSelectionUpdates = !1, 50);
  }
  onSelectionChange() {
    if (Yo(this.view)) {
      if (this.suppressingSelectionUpdates)
        return Wt(this.view);
      if (mt && oe <= 11 && !this.view.state.selection.empty) {
        let t = this.view.domSelectionRange();
        if (t.focusNode && Ae(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset))
          return this.flushSoon();
      }
      this.flush();
    }
  }
  setCurSelection() {
    this.currentSelection.set(this.view.domSelectionRange());
  }
  ignoreSelectionChange(t) {
    if (!t.focusNode)
      return !0;
    let e = /* @__PURE__ */ new Set(), i;
    for (let r = t.focusNode; r; r = Je(r))
      e.add(r);
    for (let r = t.anchorNode; r; r = Je(r))
      if (e.has(r)) {
        i = r;
        break;
      }
    let s = i && this.view.docView.nearestDesc(i);
    if (s && s.ignoreMutation({
      type: "selection",
      target: i.nodeType == 3 ? i.parentNode : i
    }))
      return this.setCurSelection(), !0;
  }
  pendingRecords() {
    if (this.observer)
      for (let t of this.observer.takeRecords())
        this.queue.push(t);
    return this.queue;
  }
  flush() {
    let { view: t } = this;
    if (!t.docView || this.flushingSoon > -1)
      return;
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let i = t.domSelectionRange(), s = !this.suppressingSelectionUpdates && !this.currentSelection.eq(i) && Yo(t) && !this.ignoreSelectionChange(i), r = -1, o = -1, l = !1, a = [];
    if (t.editable)
      for (let d = 0; d < e.length; d++) {
        let u = this.registerMutation(e[d], a);
        u && (r = r < 0 ? u.from : Math.min(u.from, r), o = o < 0 ? u.to : Math.max(u.to, o), u.typeOver && (l = !0));
      }
    if (a.some((d) => d.nodeName == "BR") && (t.input.lastKeyCode == 8 || t.input.lastKeyCode == 46)) {
      for (let d of a)
        if (d.nodeName == "BR" && d.parentNode) {
          let u = d.nextSibling;
          u && u.nodeType == 1 && u.contentEditable == "false" && d.parentNode.removeChild(d);
        }
    } else if (St && a.length) {
      let d = a.filter((u) => u.nodeName == "BR");
      if (d.length == 2) {
        let [u, p] = d;
        u.parentNode && u.parentNode.parentNode == p.parentNode ? p.remove() : u.remove();
      } else {
        let { focusNode: u } = this.currentSelection;
        for (let p of d) {
          let h = p.parentNode;
          h && h.nodeName == "LI" && (!u || Rp(t, u) != h) && p.remove();
        }
      }
    }
    let c = null;
    r < 0 && s && t.input.lastFocus > Date.now() - 200 && Math.max(t.input.lastTouch, t.input.lastClick.time) < Date.now() - 300 && ns(i) && (c = $r(t)) && c.eq(L.near(t.state.doc.resolve(0), 1)) ? (t.input.lastFocus = 0, Wt(t), this.currentSelection.set(i), t.scrollToSelection()) : (r > -1 || s) && (r > -1 && (t.docView.markDirty(r, o), Np(t)), t.input.badSafariComposition && (t.input.badSafariComposition = !1, Ip(t, a)), this.handleDOMChange(r, o, l, a), t.docView && t.docView.dirty ? t.updateState(t.state) : this.currentSelection.eq(i) || Wt(t), this.currentSelection.set(i));
  }
  registerMutation(t, e) {
    if (e.indexOf(t.target) > -1)
      return null;
    let i = this.view.docView.nearestDesc(t.target);
    if (t.type == "attributes" && (i == this.view.docView || t.attributeName == "contenteditable" || // Firefox sometimes fires spurious events for null/empty styles
    t.attributeName == "style" && !t.oldValue && !t.target.getAttribute("style")) || !i || i.ignoreMutation(t))
      return null;
    if (t.type == "childList") {
      for (let d = 0; d < t.addedNodes.length; d++) {
        let u = t.addedNodes[d];
        e.push(u), u.nodeType == 3 && (this.lastChangedTextNode = u);
      }
      if (i.contentDOM && i.contentDOM != i.dom && !i.contentDOM.contains(t.target))
        return { from: i.posBefore, to: i.posAfter };
      let s = t.previousSibling, r = t.nextSibling;
      if (mt && oe <= 11 && t.addedNodes.length)
        for (let d = 0; d < t.addedNodes.length; d++) {
          let { previousSibling: u, nextSibling: p } = t.addedNodes[d];
          (!u || Array.prototype.indexOf.call(t.addedNodes, u) < 0) && (s = u), (!p || Array.prototype.indexOf.call(t.addedNodes, p) < 0) && (r = p);
        }
      let o = s && s.parentNode == t.target ? it(s) + 1 : 0, l = i.localPosFromDOM(t.target, o, -1), a = r && r.parentNode == t.target ? it(r) : t.target.childNodes.length, c = i.localPosFromDOM(t.target, a, 1);
      return { from: l, to: c };
    } else return t.type == "attributes" ? { from: i.posAtStart - i.border, to: i.posAtEnd + i.border } : (this.lastChangedTextNode = t.target, {
      from: i.posAtStart,
      to: i.posAtEnd,
      // An event was generated for a text change that didn't change
      // any text. Mark the dom change to fall back to assuming the
      // selection was typed over with an identical value if it can't
      // find another change.
      typeOver: t.target.nodeValue == t.oldValue
    });
  }
}
let rl = /* @__PURE__ */ new WeakMap(), ol = !1;
function Np(n) {
  if (!rl.has(n) && (rl.set(n, null), ["normal", "nowrap", "pre-line"].indexOf(getComputedStyle(n.dom).whiteSpace) !== -1)) {
    if (n.requiresGeckoHackNode = St, ol)
      return;
    console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), ol = !0;
  }
}
function ll(n, t) {
  let e = t.startContainer, i = t.startOffset, s = t.endContainer, r = t.endOffset, o = n.domAtPos(n.state.selection.anchor);
  return Ae(o.node, o.offset, s, r) && ([e, i, s, r] = [s, r, e, i]), { anchorNode: e, anchorOffset: i, focusNode: s, focusOffset: r };
}
function Op(n, t) {
  if (t.getComposedRanges) {
    let s = t.getComposedRanges(n.root)[0];
    if (s)
      return ll(n, s);
  }
  let e;
  function i(s) {
    s.preventDefault(), s.stopImmediatePropagation(), e = s.getTargetRanges()[0];
  }
  return n.dom.addEventListener("beforeinput", i, !0), document.execCommand("indent"), n.dom.removeEventListener("beforeinput", i, !0), e ? ll(n, e) : null;
}
function Rp(n, t) {
  for (let e = t.parentNode; e && e != n.dom; e = e.parentNode) {
    let i = n.docView.nearestDesc(e, !0);
    if (i && i.node.isBlock)
      return e;
  }
  return null;
}
function Ip(n, t) {
  var e;
  let { focusNode: i, focusOffset: s } = n.domSelectionRange();
  for (let r of t)
    if (((e = r.parentNode) === null || e === void 0 ? void 0 : e.nodeName) == "TR") {
      let o = r.nextSibling;
      for (; o && o.nodeName != "TD" && o.nodeName != "TH"; )
        o = o.nextSibling;
      if (o) {
        let l = o;
        for (; ; ) {
          let a = l.firstChild;
          if (!a || a.nodeType != 1 || a.contentEditable == "false" || /^(BR|IMG)$/.test(a.nodeName))
            break;
          l = a;
        }
        l.insertBefore(r, l.firstChild), i == r && n.domSelection().collapse(r, s);
      } else
        r.parentNode.removeChild(r);
    }
}
function Dp(n, t, e) {
  let { node: i, fromOffset: s, toOffset: r, from: o, to: l } = n.docView.parseRange(t, e), a = n.domSelectionRange(), c, d = a.anchorNode;
  if (d && n.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (c = [{ node: d, offset: a.anchorOffset }], ns(a) || c.push({ node: a.focusNode, offset: a.focusOffset })), rt && n.input.lastKeyCode === 8)
    for (let m = r; m > s; m--) {
      let b = i.childNodes[m - 1], y = b.pmViewDesc;
      if (b.nodeName == "BR" && !y) {
        r = m;
        break;
      }
      if (!y || y.size)
        break;
    }
  let u = n.state.doc, p = n.someProp("domParser") || re.fromSchema(n.state.schema), h = u.resolve(o), f = null, g = p.parse(i, {
    topNode: h.parent,
    topMatch: h.parent.contentMatchAt(h.index()),
    topOpen: !0,
    from: s,
    to: r,
    preserveWhitespace: h.parent.type.whitespace == "pre" ? "full" : !0,
    findPositions: c,
    ruleFromNode: Pp,
    context: h
  });
  if (c && c[0].pos != null) {
    let m = c[0].pos, b = c[1] && c[1].pos;
    b == null && (b = m), f = { anchor: m + o, head: b + o };
  }
  return { doc: g, sel: f, from: o, to: l };
}
function Pp(n) {
  let t = n.pmViewDesc;
  if (t)
    return t.parseRule();
  if (n.nodeName == "BR" && n.parentNode) {
    if (at && /^(ul|ol)$/i.test(n.parentNode.nodeName)) {
      let e = document.createElement("div");
      return e.appendChild(document.createElement("li")), { skip: e };
    } else if (n.parentNode.lastChild == n || at && /^(tr|table)$/i.test(n.parentNode.nodeName))
      return { ignore: !0 };
  } else if (n.nodeName == "IMG" && n.getAttribute("mark-placeholder"))
    return { ignore: !0 };
  return null;
}
const Bp = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function Hp(n, t, e, i, s) {
  let r = n.input.compositionPendingChanges || (n.composing ? n.input.compositionID : 0);
  if (n.input.compositionPendingChanges = 0, t < 0) {
    let S = n.input.lastSelectionTime > Date.now() - 50 ? n.input.lastSelectionOrigin : null, A = $r(n, S);
    if (A && !n.state.selection.eq(A)) {
      if (rt && jt && n.input.lastKeyCode === 13 && Date.now() - 100 < n.input.lastKeyCodeTime && n.someProp("handleKeyDown", (P) => P(n, ge(13, "Enter"))))
        return;
      let I = n.state.tr.setSelection(A);
      S == "pointer" ? I.setMeta("pointer", !0) : S == "key" && I.scrollIntoView(), r && I.setMeta("composition", r), n.dispatch(I);
    }
    return;
  }
  let o = n.state.doc.resolve(t), l = o.sharedDepth(e);
  t = o.before(l + 1), e = n.state.doc.resolve(e).after(l + 1);
  let a = n.state.selection, c = Dp(n, t, e), d = n.state.doc, u = d.slice(c.from, c.to), p, h;
  n.input.lastKeyCode === 8 && Date.now() - 100 < n.input.lastKeyCodeTime ? (p = n.state.selection.to, h = "end") : (p = n.state.selection.from, h = "start"), n.input.lastKeyCode = null;
  let f = qp(u.content, c.doc.content, c.from, p, h);
  if (f && n.input.domChangeCount++, (Ge && n.input.lastIOSEnter > Date.now() - 225 || jt) && s.some((S) => S.nodeType == 1 && !Bp.test(S.nodeName)) && (!f || f.endA >= f.endB) && n.someProp("handleKeyDown", (S) => S(n, ge(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (!f)
    if (i && a instanceof T && !a.empty && a.$head.sameParent(a.$anchor) && !n.composing && !(c.sel && c.sel.anchor != c.sel.head))
      f = { start: a.from, endA: a.to, endB: a.to };
    else {
      if (c.sel) {
        let S = al(n, n.state.doc, c.sel);
        if (S && !S.eq(n.state.selection)) {
          let A = n.state.tr.setSelection(S);
          r && A.setMeta("composition", r), n.dispatch(A);
        }
      }
      return;
    }
  n.state.selection.from < n.state.selection.to && f.start == f.endB && n.state.selection instanceof T && (f.start > n.state.selection.from && f.start <= n.state.selection.from + 2 && n.state.selection.from >= c.from ? f.start = n.state.selection.from : f.endA < n.state.selection.to && f.endA >= n.state.selection.to - 2 && n.state.selection.to <= c.to && (f.endB += n.state.selection.to - f.endA, f.endA = n.state.selection.to)), mt && oe <= 11 && f.endB == f.start + 1 && f.endA == f.start && f.start > c.from && c.doc.textBetween(f.start - c.from - 1, f.start - c.from + 1) == "  " && (f.start--, f.endA--, f.endB--);
  let g = c.doc.resolveNoCache(f.start - c.from), m = c.doc.resolveNoCache(f.endB - c.from), b = d.resolve(f.start), y = g.sameParent(m) && g.parent.inlineContent && b.end() >= f.endA;
  if ((Ge && n.input.lastIOSEnter > Date.now() - 225 && (!y || s.some((S) => S.nodeName == "DIV" || S.nodeName == "P")) || !y && g.pos < c.doc.content.size && (!g.sameParent(m) || !g.parent.inlineContent) && g.pos < m.pos && !/\S/.test(c.doc.textBetween(g.pos, m.pos, "", ""))) && n.someProp("handleKeyDown", (S) => S(n, ge(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (n.state.selection.anchor > f.start && zp(d, f.start, f.endA, g, m) && n.someProp("handleKeyDown", (S) => S(n, ge(8, "Backspace")))) {
    jt && rt && n.domObserver.suppressSelectionUpdates();
    return;
  }
  rt && f.endB == f.start && (n.input.lastChromeDelete = Date.now()), jt && !y && g.start() != m.start() && m.parentOffset == 0 && g.depth == m.depth && c.sel && c.sel.anchor == c.sel.head && c.sel.head == f.endA && (f.endB -= 2, m = c.doc.resolveNoCache(f.endB - c.from), setTimeout(() => {
    n.someProp("handleKeyDown", function(S) {
      return S(n, ge(13, "Enter"));
    });
  }, 20));
  let w = f.start, M = f.endA, x = (S) => {
    let A = S || n.state.tr.replace(w, M, c.doc.slice(f.start - c.from, f.endB - c.from));
    if (c.sel) {
      let I = al(n, A.doc, c.sel);
      I && !(rt && n.composing && I.empty && (f.start != f.endB || n.input.lastChromeDelete < Date.now() - 100) && (I.head == w || I.head == A.mapping.map(M) - 1) || mt && I.empty && I.head == w) && A.setSelection(I);
    }
    return r && A.setMeta("composition", r), A.scrollIntoView();
  }, N;
  if (y)
    if (g.pos == m.pos) {
      mt && oe <= 11 && g.parentOffset == 0 && (n.domObserver.suppressSelectionUpdates(), setTimeout(() => Wt(n), 20));
      let S = x(n.state.tr.delete(w, M)), A = d.resolve(f.start).marksAcross(d.resolve(f.endA));
      A && S.ensureMarks(A), n.dispatch(S);
    } else if (
      // Adding or removing a mark
      f.endA == f.endB && (N = $p(g.parent.content.cut(g.parentOffset, m.parentOffset), b.parent.content.cut(b.parentOffset, f.endA - b.start())))
    ) {
      let S = x(n.state.tr);
      N.type == "add" ? S.addMark(w, M, N.mark) : S.removeMark(w, M, N.mark), n.dispatch(S);
    } else if (g.parent.child(g.index()).isText && g.index() == m.index() - (m.textOffset ? 0 : 1)) {
      let S = g.parent.textBetween(g.parentOffset, m.parentOffset), A = () => x(n.state.tr.insertText(S, w, M));
      n.someProp("handleTextInput", (I) => I(n, w, M, S, A)) || n.dispatch(A());
    } else
      n.dispatch(x());
  else
    n.dispatch(x());
}
function al(n, t, e) {
  return Math.max(e.anchor, e.head) > t.content.size ? null : zr(n, t.resolve(e.anchor), t.resolve(e.head));
}
function $p(n, t) {
  let e = n.firstChild.marks, i = t.firstChild.marks, s = e, r = i, o, l, a;
  for (let d = 0; d < i.length; d++)
    s = i[d].removeFromSet(s);
  for (let d = 0; d < e.length; d++)
    r = e[d].removeFromSet(r);
  if (s.length == 1 && r.length == 0)
    l = s[0], o = "add", a = (d) => d.mark(l.addToSet(d.marks));
  else if (s.length == 0 && r.length == 1)
    l = r[0], o = "remove", a = (d) => d.mark(l.removeFromSet(d.marks));
  else
    return null;
  let c = [];
  for (let d = 0; d < t.childCount; d++)
    c.push(a(t.child(d)));
  if (v.from(c).eq(n))
    return { mark: l, type: o };
}
function zp(n, t, e, i, s) {
  if (
    // The content must have shrunk
    e - t <= s.pos - i.pos || // newEnd must point directly at or after the end of the block that newStart points into
    Ls(i, !0, !1) < s.pos
  )
    return !1;
  let r = n.resolve(t);
  if (!i.parent.isTextblock) {
    let l = r.nodeAfter;
    return l != null && e == t + l.nodeSize;
  }
  if (r.parentOffset < r.parent.content.size || !r.parent.isTextblock)
    return !1;
  let o = n.resolve(Ls(r, !0, !0));
  return !o.parent.isTextblock || o.pos > e || Ls(o, !0, !1) < e ? !1 : i.parent.content.cut(i.parentOffset).eq(o.parent.content);
}
function Ls(n, t, e) {
  let i = n.depth, s = t ? n.end() : n.pos;
  for (; i > 0 && (t || n.indexAfter(i) == n.node(i).childCount); )
    i--, s++, t = !1;
  if (e) {
    let r = n.node(i).maybeChild(n.indexAfter(i));
    for (; r && !r.isLeaf; )
      r = r.firstChild, s++;
  }
  return s;
}
function qp(n, t, e, i, s) {
  let r = n.findDiffStart(t, e);
  if (r == null)
    return null;
  let { a: o, b: l } = n.findDiffEnd(t, e + n.size, e + t.size);
  if (s == "end") {
    let a = Math.max(0, r - Math.min(o, l));
    i -= o + a - r;
  }
  if (o < r && n.size < t.size) {
    let a = i <= r && i >= o ? r - i : 0;
    r -= a, r && r < t.size && cl(t.textBetween(r - 1, r + 1)) && (r += a ? 1 : -1), l = r + (l - o), o = r;
  } else if (l < r) {
    let a = i <= r && i >= l ? r - i : 0;
    r -= a, r && r < n.size && cl(n.textBetween(r - 1, r + 1)) && (r += a ? 1 : -1), o = r + (o - l), l = r;
  }
  return { start: r, endA: o, endB: l };
}
function cl(n) {
  if (n.length != 2)
    return !1;
  let t = n.charCodeAt(0), e = n.charCodeAt(1);
  return t >= 56320 && t <= 57343 && e >= 55296 && e <= 56319;
}
class gc {
  /**
  Create a view. `place` may be a DOM node that the editor should
  be appended to, a function that will place it into the document,
  or an object whose `mount` property holds the node to use as the
  document container. If it is `null`, the editor will not be
  added to the document.
  */
  constructor(t, e) {
    this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new ip(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = e, this.state = e.state, this.directPlugins = e.plugins || [], this.directPlugins.forEach(fl), this.dispatch = this.dispatch.bind(this), this.dom = t && t.mount || document.createElement("div"), t && (t.appendChild ? t.appendChild(this.dom) : typeof t == "function" ? t(this.dom) : t.mount && (this.mounted = !0)), this.editable = pl(this), ul(this), this.nodeViews = hl(this), this.docView = jo(this.state.doc, dl(this), As(this), this.dom, this), this.domObserver = new Lp(this, (i, s, r, o) => Hp(this, i, s, r, o)), this.domObserver.start(), sp(this), this.updatePluginViews();
  }
  /**
  Holds `true` when a
  [composition](https://w3c.github.io/uievents/#events-compositionevents)
  is active.
  */
  get composing() {
    return this.input.composing;
  }
  /**
  The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
  */
  get props() {
    if (this._props.state != this.state) {
      let t = this._props;
      this._props = {};
      for (let e in t)
        this._props[e] = t[e];
      this._props.state = this.state;
    }
    return this._props;
  }
  /**
  Update the view's props. Will immediately cause an update to
  the DOM.
  */
  update(t) {
    t.handleDOMEvents != this._props.handleDOMEvents && cr(this);
    let e = this._props;
    this._props = t, t.plugins && (t.plugins.forEach(fl), this.directPlugins = t.plugins), this.updateStateInner(t.state, e);
  }
  /**
  Update the view by updating existing props object with the object
  given as argument. Equivalent to `view.update(Object.assign({},
  view.props, props))`.
  */
  setProps(t) {
    let e = {};
    for (let i in this._props)
      e[i] = this._props[i];
    e.state = this.state;
    for (let i in t)
      e[i] = t[i];
    this.update(e);
  }
  /**
  Update the editor's `state` prop, without touching any of the
  other props.
  */
  updateState(t) {
    this.updateStateInner(t, this._props);
  }
  updateStateInner(t, e) {
    var i;
    let s = this.state, r = !1, o = !1;
    t.storedMarks && this.composing && (cc(this), o = !0), this.state = t;
    let l = s.plugins != t.plugins || this._props.plugins != e.plugins;
    if (l || this._props.plugins != e.plugins || this._props.nodeViews != e.nodeViews) {
      let h = hl(this);
      Vp(h, this.nodeViews) && (this.nodeViews = h, r = !0);
    }
    (l || e.handleDOMEvents != this._props.handleDOMEvents) && cr(this), this.editable = pl(this), ul(this);
    let a = As(this), c = dl(this), d = s.plugins != t.plugins && !s.doc.eq(t.doc) ? "reset" : t.scrollToSelection > s.scrollToSelection ? "to selection" : "preserve", u = r || !this.docView.matchesNode(t.doc, c, a);
    (u || !t.selection.eq(s.selection)) && (o = !0);
    let p = d == "preserve" && o && this.dom.style.overflowAnchor == null && yu(this);
    if (o) {
      this.domObserver.stop();
      let h = u && (mt || rt) && !this.composing && !s.selection.empty && !t.selection.empty && Fp(s.selection, t.selection);
      if (u) {
        let f = rt ? this.trackWrites = this.domSelectionRange().focusNode : null;
        this.composing && (this.input.compositionNode = yp(this)), (r || !this.docView.update(t.doc, c, a, this)) && (this.docView.updateOuterDeco(c), this.docView.destroy(), this.docView = jo(t.doc, c, a, this.dom, this)), f && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (h = !0);
      }
      h || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && Fu(this)) ? Wt(this, h) : (Xa(this, t.selection), this.domObserver.setCurSelection()), this.domObserver.start();
    }
    this.updatePluginViews(s), !((i = this.dragging) === null || i === void 0) && i.node && !s.doc.eq(t.doc) && this.updateDraggedNode(this.dragging, s), d == "reset" ? this.dom.scrollTop = 0 : d == "to selection" ? this.scrollToSelection() : p && vu(p);
  }
  /**
  @internal
  */
  scrollToSelection() {
    let t = this.domSelectionRange().focusNode;
    if (!(!t || !this.dom.contains(t.nodeType == 1 ? t : t.parentNode))) {
      if (!this.someProp("handleScrollToSelection", (e) => e(this))) if (this.state.selection instanceof _) {
        let e = this.docView.domAfterPos(this.state.selection.from);
        e.nodeType == 1 && Ho(this, e.getBoundingClientRect(), t);
      } else
        Ho(this, this.coordsAtPos(this.state.selection.head, 1), t);
    }
  }
  destroyPluginViews() {
    let t;
    for (; t = this.pluginViews.pop(); )
      t.destroy && t.destroy();
  }
  updatePluginViews(t) {
    if (!t || t.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
      this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
      for (let e = 0; e < this.directPlugins.length; e++) {
        let i = this.directPlugins[e];
        i.spec.view && this.pluginViews.push(i.spec.view(this));
      }
      for (let e = 0; e < this.state.plugins.length; e++) {
        let i = this.state.plugins[e];
        i.spec.view && this.pluginViews.push(i.spec.view(this));
      }
    } else
      for (let e = 0; e < this.pluginViews.length; e++) {
        let i = this.pluginViews[e];
        i.update && i.update(this, t);
      }
  }
  updateDraggedNode(t, e) {
    let i = t.node, s = -1;
    if (this.state.doc.nodeAt(i.from) == i.node)
      s = i.from;
    else {
      let r = i.from + (this.state.doc.content.size - e.doc.content.size);
      (r > 0 && this.state.doc.nodeAt(r)) == i.node && (s = r);
    }
    this.dragging = new uc(t.slice, t.move, s < 0 ? void 0 : _.create(this.state.doc, s));
  }
  someProp(t, e) {
    let i = this._props && this._props[t], s;
    if (i != null && (s = e ? e(i) : i))
      return s;
    for (let o = 0; o < this.directPlugins.length; o++) {
      let l = this.directPlugins[o].props[t];
      if (l != null && (s = e ? e(l) : l))
        return s;
    }
    let r = this.state.plugins;
    if (r)
      for (let o = 0; o < r.length; o++) {
        let l = r[o].props[t];
        if (l != null && (s = e ? e(l) : l))
          return s;
      }
  }
  /**
  Query whether the view has focus.
  */
  hasFocus() {
    if (mt) {
      let t = this.root.activeElement;
      if (t == this.dom)
        return !0;
      if (!t || !this.dom.contains(t))
        return !1;
      for (; t && this.dom != t && this.dom.contains(t); ) {
        if (t.contentEditable == "false")
          return !1;
        t = t.parentElement;
      }
      return !0;
    }
    return this.root.activeElement == this.dom;
  }
  /**
  Focus the editor.
  */
  focus() {
    this.domObserver.stop(), this.editable && wu(this.dom), Wt(this), this.domObserver.start();
  }
  /**
  Get the document root in which the editor exists. This will
  usually be the top-level `document`, but might be a [shadow
  DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  root if the editor is inside one.
  */
  get root() {
    let t = this._root;
    if (t == null) {
      for (let e = this.dom.parentNode; e; e = e.parentNode)
        if (e.nodeType == 9 || e.nodeType == 11 && e.host)
          return e.getSelection || (Object.getPrototypeOf(e).getSelection = () => e.ownerDocument.getSelection()), this._root = e;
    }
    return t || document;
  }
  /**
  When an existing editor view is moved to a new document or
  shadow tree, call this to make it recompute its root.
  */
  updateRoot() {
    this._root = null;
  }
  /**
  Given a pair of viewport coordinates, return the document
  position that corresponds to them. May return null if the given
  coordinates aren't inside of the editor. When an object is
  returned, its `pos` property is the position nearest to the
  coordinates, and its `inside` property holds the position of the
  inner node that the position falls inside of, or -1 if it is at
  the top level, not in any node.
  */
  posAtCoords(t) {
    return Mu(this, t);
  }
  /**
  Returns the viewport rectangle at a given document position.
  `left` and `right` will be the same number, as this returns a
  flat cursor-ish rectangle. If the position is between two things
  that aren't directly adjacent, `side` determines which element
  is used. When < 0, the element before the position is used,
  otherwise the element after.
  */
  coordsAtPos(t, e = 1) {
    return Va(this, t, e);
  }
  /**
  Find the DOM position that corresponds to the given document
  position. When `side` is negative, find the position as close as
  possible to the content before the position. When positive,
  prefer positions close to the content after the position. When
  zero, prefer as shallow a position as possible.
  
  Note that you should **not** mutate the editor's internal DOM,
  only inspect it (and even that is usually not necessary).
  */
  domAtPos(t, e = 0) {
    return this.docView.domFromPos(t, e);
  }
  /**
  Find the DOM node that represents the document node after the
  given position. May return `null` when the position doesn't point
  in front of a node or if the node is inside an opaque node view.
  
  This is intended to be able to call things like
  `getBoundingClientRect` on that DOM node. Do **not** mutate the
  editor DOM directly, or add styling this way, since that will be
  immediately overriden by the editor as it redraws the node.
  */
  nodeDOM(t) {
    let e = this.docView.descAt(t);
    return e ? e.nodeDOM : null;
  }
  /**
  Find the document position that corresponds to a given DOM
  position. (Whenever possible, it is preferable to inspect the
  document structure directly, rather than poking around in the
  DOM, but sometimes—for example when interpreting an event
  target—you don't have a choice.)
  
  The `bias` parameter can be used to influence which side of a DOM
  node to use when the position is inside a leaf node.
  */
  posAtDOM(t, e, i = -1) {
    let s = this.docView.posFromDOM(t, e, i);
    if (s == null)
      throw new RangeError("DOM position not inside the editor");
    return s;
  }
  /**
  Find out whether the selection is at the end of a textblock when
  moving in a given direction. When, for example, given `"left"`,
  it will return true if moving left from the current cursor
  position would leave that position's parent textblock. Will apply
  to the view's current state by default, but it is possible to
  pass a different state.
  */
  endOfTextblock(t, e) {
    return Lu(this, e || this.state, t);
  }
  /**
  Run the editor's paste logic with the given HTML string. The
  `event`, if given, will be passed to the
  [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
  */
  pasteHTML(t, e) {
    return Mn(this, "", t, !1, e || new ClipboardEvent("paste"));
  }
  /**
  Run the editor's paste logic with the given plain-text input.
  */
  pasteText(t, e) {
    return Mn(this, t, null, !0, e || new ClipboardEvent("paste"));
  }
  /**
  Serialize the given slice as it would be if it was copied from
  this editor. Returns a DOM element that contains a
  representation of the slice as its children, a textual
  representation, and the transformed slice (which can be
  different from the given input due to hooks like
  [`transformCopied`](https://prosemirror.net/docs/ref/#view.EditorProps.transformCopied)).
  */
  serializeForClipboard(t) {
    return qr(this, t);
  }
  /**
  Removes the editor from the DOM and destroys all [node
  views](https://prosemirror.net/docs/ref/#view.NodeView).
  */
  destroy() {
    this.docView && (rp(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], As(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, au());
  }
  /**
  This is true when the view has been
  [destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
  used anymore).
  */
  get isDestroyed() {
    return this.docView == null;
  }
  /**
  Used for testing.
  */
  dispatchEvent(t) {
    return lp(this, t);
  }
  /**
  @internal
  */
  domSelectionRange() {
    let t = this.domSelection();
    return t ? at && this.root.nodeType === 11 && hu(this.dom.ownerDocument) == this.dom && Op(this, t) || t : { focusNode: null, focusOffset: 0, anchorNode: null, anchorOffset: 0 };
  }
  /**
  @internal
  */
  domSelection() {
    return this.root.getSelection();
  }
}
gc.prototype.dispatch = function(n) {
  let t = this._props.dispatchTransaction;
  t ? t.call(this, n) : this.updateState(this.state.apply(n));
};
function dl(n) {
  let t = /* @__PURE__ */ Object.create(null);
  return t.class = "ProseMirror", t.contenteditable = String(n.editable), n.someProp("attributes", (e) => {
    if (typeof e == "function" && (e = e(n.state)), e)
      for (let i in e)
        i == "class" ? t.class += " " + e[i] : i == "style" ? t.style = (t.style ? t.style + ";" : "") + e[i] : !t[i] && i != "contenteditable" && i != "nodeName" && (t[i] = String(e[i]));
  }), t.translate || (t.translate = "no"), [ot.node(0, n.state.doc.content.size, t)];
}
function ul(n) {
  if (n.markCursor) {
    let t = document.createElement("img");
    t.className = "ProseMirror-separator", t.setAttribute("mark-placeholder", "true"), t.setAttribute("alt", ""), n.cursorWrapper = { dom: t, deco: ot.widget(n.state.selection.from, t, { raw: !0, marks: n.markCursor }) };
  } else
    n.cursorWrapper = null;
}
function pl(n) {
  return !n.someProp("editable", (t) => t(n.state) === !1);
}
function Fp(n, t) {
  let e = Math.min(n.$anchor.sharedDepth(n.head), t.$anchor.sharedDepth(t.head));
  return n.$anchor.start(e) != t.$anchor.start(e);
}
function hl(n) {
  let t = /* @__PURE__ */ Object.create(null);
  function e(i) {
    for (let s in i)
      Object.prototype.hasOwnProperty.call(t, s) || (t[s] = i[s]);
  }
  return n.someProp("nodeViews", e), n.someProp("markViews", e), t;
}
function Vp(n, t) {
  let e = 0, i = 0;
  for (let s in n) {
    if (n[s] != t[s])
      return !0;
    e++;
  }
  for (let s in t)
    i++;
  return e != i;
}
function fl(n) {
  if (n.spec.state || n.spec.filterTransaction || n.spec.appendTransaction)
    throw new RangeError("Plugins passed directly to the view must not have a state component");
}
var ce = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, vi = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, jp = typeof navigator < "u" && /Mac/.test(navigator.platform), Up = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var st = 0; st < 10; st++) ce[48 + st] = ce[96 + st] = String(st);
for (var st = 1; st <= 24; st++) ce[st + 111] = "F" + st;
for (var st = 65; st <= 90; st++)
  ce[st] = String.fromCharCode(st + 32), vi[st] = String.fromCharCode(st);
for (var Ns in ce) vi.hasOwnProperty(Ns) || (vi[Ns] = ce[Ns]);
function Wp(n) {
  var t = jp && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || Up && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", e = !t && n.key || (n.shiftKey ? vi : ce)[n.keyCode] || n.key || "Unidentified";
  return e == "Esc" && (e = "Escape"), e == "Del" && (e = "Delete"), e == "Left" && (e = "ArrowLeft"), e == "Up" && (e = "ArrowUp"), e == "Right" && (e = "ArrowRight"), e == "Down" && (e = "ArrowDown"), e;
}
const Kp = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), Jp = typeof navigator < "u" && /Win/.test(navigator.platform);
function Gp(n) {
  let t = n.split(/-(?!$)/), e = t[t.length - 1];
  e == "Space" && (e = " ");
  let i, s, r, o;
  for (let l = 0; l < t.length - 1; l++) {
    let a = t[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      s = !0;
    else if (/^s(hift)?$/i.test(a))
      r = !0;
    else if (/^mod$/i.test(a))
      Kp ? o = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + a);
  }
  return i && (e = "Alt-" + e), s && (e = "Ctrl-" + e), o && (e = "Meta-" + e), r && (e = "Shift-" + e), e;
}
function Yp(n) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let e in n)
    t[Gp(e)] = n[e];
  return t;
}
function Os(n, t, e = !0) {
  return t.altKey && (n = "Alt-" + n), t.ctrlKey && (n = "Ctrl-" + n), t.metaKey && (n = "Meta-" + n), e && t.shiftKey && (n = "Shift-" + n), n;
}
function Xp(n) {
  return new V({ props: { handleKeyDown: Kr(n) } });
}
function Kr(n) {
  let t = Yp(n);
  return function(e, i) {
    let s = Wp(i), r, o = t[Os(s, i)];
    if (o && o(e.state, e.dispatch, e))
      return !0;
    if (s.length == 1 && s != " ") {
      if (i.shiftKey) {
        let l = t[Os(s, i, !1)];
        if (l && l(e.state, e.dispatch, e))
          return !0;
      }
      if ((i.altKey || i.metaKey || i.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(Jp && i.ctrlKey && i.altKey) && (r = ce[i.keyCode]) && r != s) {
        let l = t[Os(r, i)];
        if (l && l(e.state, e.dispatch, e))
          return !0;
      }
    }
    return !1;
  };
}
const Jr = (n, t) => n.selection.empty ? !1 : (t && t(n.tr.deleteSelection().scrollIntoView()), !0);
function bc(n, t) {
  let { $cursor: e } = n.selection;
  return !e || (t ? !t.endOfTextblock("backward", n) : e.parentOffset > 0) ? null : e;
}
const yc = (n, t, e) => {
  let i = bc(n, e);
  if (!i)
    return !1;
  let s = Gr(i);
  if (!s) {
    let o = i.blockRange(), l = o && Xe(o);
    return l == null ? !1 : (t && t(n.tr.lift(o, l).scrollIntoView()), !0);
  }
  let r = s.nodeBefore;
  if (_c(n, s, t, -1))
    return !0;
  if (i.parent.content.size == 0 && (Ye(r, "end") || _.isSelectable(r)))
    for (let o = i.depth; ; o--) {
      let l = ts(n.doc, i.before(o), i.after(o), C.empty);
      if (l && l.slice.size < l.to - l.from) {
        if (t) {
          let a = n.tr.step(l);
          a.setSelection(Ye(r, "end") ? L.findFrom(a.doc.resolve(a.mapping.map(s.pos, -1)), -1) : _.create(a.doc, s.pos - r.nodeSize)), t(a.scrollIntoView());
        }
        return !0;
      }
      if (o == 1 || i.node(o - 1).childCount > 1)
        break;
    }
  return r.isAtom && s.depth == i.depth - 1 ? (t && t(n.tr.delete(s.pos - r.nodeSize, s.pos).scrollIntoView()), !0) : !1;
}, Qp = (n, t, e) => {
  let i = bc(n, e);
  if (!i)
    return !1;
  let s = Gr(i);
  return s ? vc(n, s, t) : !1;
}, Zp = (n, t, e) => {
  let i = kc(n, e);
  if (!i)
    return !1;
  let s = Yr(i);
  return s ? vc(n, s, t) : !1;
};
function vc(n, t, e) {
  let i = t.nodeBefore, s = i, r = t.pos - 1;
  for (; !s.isTextblock; r--) {
    if (s.type.spec.isolating)
      return !1;
    let d = s.lastChild;
    if (!d)
      return !1;
    s = d;
  }
  let o = t.nodeAfter, l = o, a = t.pos + 1;
  for (; !l.isTextblock; a++) {
    if (l.type.spec.isolating)
      return !1;
    let d = l.firstChild;
    if (!d)
      return !1;
    l = d;
  }
  let c = ts(n.doc, r, a, C.empty);
  if (!c || c.from != r || c instanceof X && c.slice.size >= a - r)
    return !1;
  if (e) {
    let d = n.tr.step(c);
    d.setSelection(T.create(d.doc, r)), e(d.scrollIntoView());
  }
  return !0;
}
function Ye(n, t, e = !1) {
  for (let i = n; i; i = t == "start" ? i.firstChild : i.lastChild) {
    if (i.isTextblock)
      return !0;
    if (e && i.childCount != 1)
      return !1;
  }
  return !1;
}
const wc = (n, t, e) => {
  let { $head: i, empty: s } = n.selection, r = i;
  if (!s)
    return !1;
  if (i.parent.isTextblock) {
    if (e ? !e.endOfTextblock("backward", n) : i.parentOffset > 0)
      return !1;
    r = Gr(i);
  }
  let o = r && r.nodeBefore;
  return !o || !_.isSelectable(o) ? !1 : (t && t(n.tr.setSelection(_.create(n.doc, r.pos - o.nodeSize)).scrollIntoView()), !0);
};
function Gr(n) {
  if (!n.parent.type.spec.isolating)
    for (let t = n.depth - 1; t >= 0; t--) {
      if (n.index(t) > 0)
        return n.doc.resolve(n.before(t + 1));
      if (n.node(t).type.spec.isolating)
        break;
    }
  return null;
}
function kc(n, t) {
  let { $cursor: e } = n.selection;
  return !e || (t ? !t.endOfTextblock("forward", n) : e.parentOffset < e.parent.content.size) ? null : e;
}
const xc = (n, t, e) => {
  let i = kc(n, e);
  if (!i)
    return !1;
  let s = Yr(i);
  if (!s)
    return !1;
  let r = s.nodeAfter;
  if (_c(n, s, t, 1))
    return !0;
  if (i.parent.content.size == 0 && (Ye(r, "start") || _.isSelectable(r))) {
    let o = ts(n.doc, i.before(), i.after(), C.empty);
    if (o && o.slice.size < o.to - o.from) {
      if (t) {
        let l = n.tr.step(o);
        l.setSelection(Ye(r, "start") ? L.findFrom(l.doc.resolve(l.mapping.map(s.pos)), 1) : _.create(l.doc, l.mapping.map(s.pos))), t(l.scrollIntoView());
      }
      return !0;
    }
  }
  return r.isAtom && s.depth == i.depth - 1 ? (t && t(n.tr.delete(s.pos, s.pos + r.nodeSize).scrollIntoView()), !0) : !1;
}, Cc = (n, t, e) => {
  let { $head: i, empty: s } = n.selection, r = i;
  if (!s)
    return !1;
  if (i.parent.isTextblock) {
    if (e ? !e.endOfTextblock("forward", n) : i.parentOffset < i.parent.content.size)
      return !1;
    r = Yr(i);
  }
  let o = r && r.nodeAfter;
  return !o || !_.isSelectable(o) ? !1 : (t && t(n.tr.setSelection(_.create(n.doc, r.pos)).scrollIntoView()), !0);
};
function Yr(n) {
  if (!n.parent.type.spec.isolating)
    for (let t = n.depth - 1; t >= 0; t--) {
      let e = n.node(t);
      if (n.index(t) + 1 < e.childCount)
        return n.doc.resolve(n.after(t + 1));
      if (e.type.spec.isolating)
        break;
    }
  return null;
}
const th = (n, t) => {
  let e = n.selection, i = e instanceof _, s;
  if (i) {
    if (e.node.isTextblock || !ue(n.doc, e.from))
      return !1;
    s = e.from;
  } else if (s = Zi(n.doc, e.from, -1), s == null)
    return !1;
  if (t) {
    let r = n.tr.join(s);
    i && r.setSelection(_.create(r.doc, s - n.doc.resolve(s).nodeBefore.nodeSize)), t(r.scrollIntoView());
  }
  return !0;
}, eh = (n, t) => {
  let e = n.selection, i;
  if (e instanceof _) {
    if (e.node.isTextblock || !ue(n.doc, e.to))
      return !1;
    i = e.to;
  } else if (i = Zi(n.doc, e.to, 1), i == null)
    return !1;
  return t && t(n.tr.join(i).scrollIntoView()), !0;
}, nh = (n, t) => {
  let { $from: e, $to: i } = n.selection, s = e.blockRange(i), r = s && Xe(s);
  return r == null ? !1 : (t && t(n.tr.lift(s, r).scrollIntoView()), !0);
}, Sc = (n, t) => {
  let { $head: e, $anchor: i } = n.selection;
  return !e.parent.type.spec.code || !e.sameParent(i) ? !1 : (t && t(n.tr.insertText(`
`).scrollIntoView()), !0);
};
function Xr(n) {
  for (let t = 0; t < n.edgeCount; t++) {
    let { type: e } = n.edge(t);
    if (e.isTextblock && !e.hasRequiredAttrs())
      return e;
  }
  return null;
}
const ih = (n, t) => {
  let { $head: e, $anchor: i } = n.selection;
  if (!e.parent.type.spec.code || !e.sameParent(i))
    return !1;
  let s = e.node(-1), r = e.indexAfter(-1), o = Xr(s.contentMatchAt(r));
  if (!o || !s.canReplaceWith(r, r, o))
    return !1;
  if (t) {
    let l = e.after(), a = n.tr.replaceWith(l, l, o.createAndFill());
    a.setSelection(L.near(a.doc.resolve(l), 1)), t(a.scrollIntoView());
  }
  return !0;
}, Mc = (n, t) => {
  let e = n.selection, { $from: i, $to: s } = e;
  if (e instanceof vt || i.parent.inlineContent || s.parent.inlineContent)
    return !1;
  let r = Xr(s.parent.contentMatchAt(s.indexAfter()));
  if (!r || !r.isTextblock)
    return !1;
  if (t) {
    let o = (!i.parentOffset && s.index() < s.parent.childCount ? i : s).pos, l = n.tr.insert(o, r.createAndFill());
    l.setSelection(T.create(l.doc, o + 1)), t(l.scrollIntoView());
  }
  return !0;
}, Ec = (n, t) => {
  let { $cursor: e } = n.selection;
  if (!e || e.parent.content.size)
    return !1;
  if (e.depth > 1 && e.after() != e.end(-1)) {
    let r = e.before();
    if (Ut(n.doc, r))
      return t && t(n.tr.split(r).scrollIntoView()), !0;
  }
  let i = e.blockRange(), s = i && Xe(i);
  return s == null ? !1 : (t && t(n.tr.lift(i, s).scrollIntoView()), !0);
};
function sh(n) {
  return (t, e) => {
    let { $from: i, $to: s } = t.selection;
    if (t.selection instanceof _ && t.selection.node.isBlock)
      return !i.parentOffset || !Ut(t.doc, i.pos) ? !1 : (e && e(t.tr.split(i.pos).scrollIntoView()), !0);
    if (!i.depth)
      return !1;
    let r = [], o, l, a = !1, c = !1;
    for (let h = i.depth; ; h--)
      if (i.node(h).isBlock) {
        a = i.end(h) == i.pos + (i.depth - h), c = i.start(h) == i.pos - (i.depth - h), l = Xr(i.node(h - 1).contentMatchAt(i.indexAfter(h - 1))), r.unshift(a && l ? { type: l } : null), o = h;
        break;
      } else {
        if (h == 1)
          return !1;
        r.unshift(null);
      }
    let d = t.tr;
    (t.selection instanceof T || t.selection instanceof vt) && d.deleteSelection();
    let u = d.mapping.map(i.pos), p = Ut(d.doc, u, r.length, r);
    if (p || (r[0] = l ? { type: l } : null, p = Ut(d.doc, u, r.length, r)), !p)
      return !1;
    if (d.split(u, r.length, r), !a && c && i.node(o).type != l) {
      let h = d.mapping.map(i.before(o)), f = d.doc.resolve(h);
      l && i.node(o - 1).canReplaceWith(f.index(), f.index() + 1, l) && d.setNodeMarkup(d.mapping.map(i.before(o)), l);
    }
    return e && e(d.scrollIntoView()), !0;
  };
}
const rh = sh(), oh = (n, t) => {
  let { $from: e, to: i } = n.selection, s, r = e.sharedDepth(i);
  return r == 0 ? !1 : (s = e.before(r), t && t(n.tr.setSelection(_.create(n.doc, s))), !0);
};
function lh(n, t, e) {
  let i = t.nodeBefore, s = t.nodeAfter, r = t.index();
  return !i || !s || !i.type.compatibleContent(s.type) ? !1 : !i.content.size && t.parent.canReplace(r - 1, r) ? (e && e(n.tr.delete(t.pos - i.nodeSize, t.pos).scrollIntoView()), !0) : !t.parent.canReplace(r, r + 1) || !(s.isTextblock || ue(n.doc, t.pos)) ? !1 : (e && e(n.tr.join(t.pos).scrollIntoView()), !0);
}
function _c(n, t, e, i) {
  let s = t.nodeBefore, r = t.nodeAfter, o, l, a = s.type.spec.isolating || r.type.spec.isolating;
  if (!a && lh(n, t, e))
    return !0;
  let c = !a && t.parent.canReplace(t.index(), t.index() + 1);
  if (c && (o = (l = s.contentMatchAt(s.childCount)).findWrapping(r.type)) && l.matchType(o[0] || r.type).validEnd) {
    if (e) {
      let h = t.pos + r.nodeSize, f = v.empty;
      for (let b = o.length - 1; b >= 0; b--)
        f = v.from(o[b].create(null, f));
      f = v.from(s.copy(f));
      let g = n.tr.step(new Q(t.pos - 1, h, t.pos, h, new C(f, 1, 0), o.length, !0)), m = g.doc.resolve(h + 2 * o.length);
      m.nodeAfter && m.nodeAfter.type == s.type && ue(g.doc, m.pos) && g.join(m.pos), e(g.scrollIntoView());
    }
    return !0;
  }
  let d = r.type.spec.isolating || i > 0 && a ? null : L.findFrom(t, 1), u = d && d.$from.blockRange(d.$to), p = u && Xe(u);
  if (p != null && p >= t.depth)
    return e && e(n.tr.lift(u, p).scrollIntoView()), !0;
  if (c && Ye(r, "start", !0) && Ye(s, "end")) {
    let h = s, f = [];
    for (; f.push(h), !h.isTextblock; )
      h = h.lastChild;
    let g = r, m = 1;
    for (; !g.isTextblock; g = g.firstChild)
      m++;
    if (h.canReplace(h.childCount, h.childCount, g.content)) {
      if (e) {
        let b = v.empty;
        for (let w = f.length - 1; w >= 0; w--)
          b = v.from(f[w].copy(b));
        let y = n.tr.step(new Q(t.pos - f.length, t.pos + r.nodeSize, t.pos + m, t.pos + r.nodeSize - m, new C(b, f.length, 0), 0, !0));
        e(y.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function Tc(n) {
  return function(t, e) {
    let i = t.selection, s = n < 0 ? i.$from : i.$to, r = s.depth;
    for (; s.node(r).isInline; ) {
      if (!r)
        return !1;
      r--;
    }
    return s.node(r).isTextblock ? (e && e(t.tr.setSelection(T.create(t.doc, n < 0 ? s.start(r) : s.end(r)))), !0) : !1;
  };
}
const ah = Tc(-1), ch = Tc(1);
function dh(n, t = null) {
  return function(e, i) {
    let { $from: s, $to: r } = e.selection, o = s.blockRange(r), l = o && Dr(o, n, t);
    return l ? (i && i(e.tr.wrap(o, l).scrollIntoView()), !0) : !1;
  };
}
function ml(n, t = null) {
  return function(e, i) {
    let s = !1;
    for (let r = 0; r < e.selection.ranges.length && !s; r++) {
      let { $from: { pos: o }, $to: { pos: l } } = e.selection.ranges[r];
      e.doc.nodesBetween(o, l, (a, c) => {
        if (s)
          return !1;
        if (!(!a.isTextblock || a.hasMarkup(n, t)))
          if (a.type == n)
            s = !0;
          else {
            let d = e.doc.resolve(c), u = d.index();
            s = d.parent.canReplaceWith(u, u + 1, n);
          }
      });
    }
    if (!s)
      return !1;
    if (i) {
      let r = e.tr;
      for (let o = 0; o < e.selection.ranges.length; o++) {
        let { $from: { pos: l }, $to: { pos: a } } = e.selection.ranges[o];
        r.setBlockType(l, a, n, t);
      }
      i(r.scrollIntoView());
    }
    return !0;
  };
}
function Qr(...n) {
  return function(t, e, i) {
    for (let s = 0; s < n.length; s++)
      if (n[s](t, e, i))
        return !0;
    return !1;
  };
}
Qr(Jr, yc, wc);
Qr(Jr, xc, Cc);
Qr(Sc, Mc, Ec, rh);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function uh(n, t = null) {
  return function(e, i) {
    let { $from: s, $to: r } = e.selection, o = s.blockRange(r);
    if (!o)
      return !1;
    let l = i ? e.tr : null;
    return ph(l, o, n, t) ? (i && i(l.scrollIntoView()), !0) : !1;
  };
}
function ph(n, t, e, i = null) {
  let s = !1, r = t, o = t.$from.doc;
  if (t.depth >= 2 && t.$from.node(t.depth - 1).type.compatibleContent(e) && t.startIndex == 0) {
    if (t.$from.index(t.depth - 1) == 0)
      return !1;
    let a = o.resolve(t.start - 2);
    r = new pi(a, a, t.depth), t.endIndex < t.parent.childCount && (t = new pi(t.$from, o.resolve(t.$to.end(t.depth)), t.depth)), s = !0;
  }
  let l = Dr(r, e, i, t);
  return l ? (n && hh(n, t, l, s, e), !0) : !1;
}
function hh(n, t, e, i, s) {
  let r = v.empty;
  for (let d = e.length - 1; d >= 0; d--)
    r = v.from(e[d].type.create(e[d].attrs, r));
  n.step(new Q(t.start - (i ? 2 : 0), t.end, t.start, t.end, new C(r, 0, 0), e.length, !0));
  let o = 0;
  for (let d = 0; d < e.length; d++)
    e[d].type == s && (o = d + 1);
  let l = e.length - o, a = t.start + e.length - (i ? 2 : 0), c = t.parent;
  for (let d = t.startIndex, u = t.endIndex, p = !0; d < u; d++, p = !1)
    !p && Ut(n.doc, a, l) && (n.split(a, l), a += 2 * l), a += c.child(d).nodeSize;
  return n;
}
function fh(n) {
  return function(t, e) {
    let { $from: i, $to: s } = t.selection, r = i.blockRange(s, (o) => o.childCount > 0 && o.firstChild.type == n);
    return r ? e ? i.node(r.depth - 1).type == n ? mh(t, e, n, r) : gh(t, e, r) : !0 : !1;
  };
}
function mh(n, t, e, i) {
  let s = n.tr, r = i.end, o = i.$to.end(i.depth);
  r < o && (s.step(new Q(r - 1, o, r, o, new C(v.from(e.create(null, i.parent.copy())), 1, 0), 1, !0)), i = new pi(s.doc.resolve(i.$from.pos), s.doc.resolve(o), i.depth));
  const l = Xe(i);
  if (l == null)
    return !1;
  s.lift(i, l);
  let a = s.doc.resolve(s.mapping.map(r, -1) - 1);
  return ue(s.doc, a.pos) && a.nodeBefore.type == a.nodeAfter.type && s.join(a.pos), t(s.scrollIntoView()), !0;
}
function gh(n, t, e) {
  let i = n.tr, s = e.parent;
  for (let h = e.end, f = e.endIndex - 1, g = e.startIndex; f > g; f--)
    h -= s.child(f).nodeSize, i.delete(h - 1, h + 1);
  let r = i.doc.resolve(e.start), o = r.nodeAfter;
  if (i.mapping.map(e.end) != e.start + r.nodeAfter.nodeSize)
    return !1;
  let l = e.startIndex == 0, a = e.endIndex == s.childCount, c = r.node(-1), d = r.index(-1);
  if (!c.canReplace(d + (l ? 0 : 1), d + 1, o.content.append(a ? v.empty : v.from(s))))
    return !1;
  let u = r.pos, p = u + o.nodeSize;
  return i.step(new Q(u - (l ? 1 : 0), p + (a ? 1 : 0), u + 1, p - 1, new C((l ? v.empty : v.from(s.copy(v.empty))).append(a ? v.empty : v.from(s.copy(v.empty))), l ? 0 : 1, a ? 0 : 1), l ? 0 : 1)), t(i.scrollIntoView()), !0;
}
function bh(n) {
  return function(t, e) {
    let { $from: i, $to: s } = t.selection, r = i.blockRange(s, (c) => c.childCount > 0 && c.firstChild.type == n);
    if (!r)
      return !1;
    let o = r.startIndex;
    if (o == 0)
      return !1;
    let l = r.parent, a = l.child(o - 1);
    if (a.type != n)
      return !1;
    if (e) {
      let c = a.lastChild && a.lastChild.type == l.type, d = v.from(c ? n.create() : null), u = new C(v.from(n.create(null, v.from(l.type.create(null, d)))), c ? 3 : 1, 0), p = r.start, h = r.end;
      e(t.tr.step(new Q(p - (c ? 3 : 1), h, p, h, u, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function rs(n) {
  const { state: t, transaction: e } = n;
  let { selection: i } = e, { doc: s } = e, { storedMarks: r } = e;
  return {
    ...t,
    apply: t.apply.bind(t),
    applyTransaction: t.applyTransaction.bind(t),
    plugins: t.plugins,
    schema: t.schema,
    reconfigure: t.reconfigure.bind(t),
    toJSON: t.toJSON.bind(t),
    get storedMarks() {
      return r;
    },
    get selection() {
      return i;
    },
    get doc() {
      return s;
    },
    get tr() {
      return i = e.selection, s = e.doc, r = e.storedMarks, e;
    }
  };
}
class ls {
  constructor(t) {
    this.editor = t.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = t.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands: t, editor: e, state: i } = this, { view: s } = e, { tr: r } = i, o = this.buildProps(r);
    return Object.fromEntries(Object.entries(t).map(([l, a]) => [l, (...d) => {
      const u = a(...d)(o);
      return !r.getMeta("preventDispatch") && !this.hasCustomState && s.dispatch(r), u;
    }]));
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(t, e = !0) {
    const { rawCommands: i, editor: s, state: r } = this, { view: o } = s, l = [], a = !!t, c = t || r.tr, d = () => (!a && e && !c.getMeta("preventDispatch") && !this.hasCustomState && o.dispatch(c), l.every((p) => p === !0)), u = {
      ...Object.fromEntries(Object.entries(i).map(([p, h]) => [p, (...g) => {
        const m = this.buildProps(c, e), b = h(...g)(m);
        return l.push(b), u;
      }])),
      run: d
    };
    return u;
  }
  createCan(t) {
    const { rawCommands: e, state: i } = this, s = !1, r = t || i.tr, o = this.buildProps(r, s);
    return {
      ...Object.fromEntries(Object.entries(e).map(([a, c]) => [a, (...d) => c(...d)({ ...o, dispatch: void 0 })])),
      chain: () => this.createChain(r, s)
    };
  }
  buildProps(t, e = !0) {
    const { rawCommands: i, editor: s, state: r } = this, { view: o } = s, l = {
      tr: t,
      editor: s,
      view: o,
      state: rs({
        state: r,
        transaction: t
      }),
      dispatch: e ? () => {
      } : void 0,
      chain: () => this.createChain(t, e),
      can: () => this.createCan(t),
      get commands() {
        return Object.fromEntries(Object.entries(i).map(([a, c]) => [a, (...d) => c(...d)(l)]));
      }
    };
    return l;
  }
}
class yh {
  constructor() {
    this.callbacks = {};
  }
  on(t, e) {
    return this.callbacks[t] || (this.callbacks[t] = []), this.callbacks[t].push(e), this;
  }
  emit(t, ...e) {
    const i = this.callbacks[t];
    return i && i.forEach((s) => s.apply(this, e)), this;
  }
  off(t, e) {
    const i = this.callbacks[t];
    return i && (e ? this.callbacks[t] = i.filter((s) => s !== e) : delete this.callbacks[t]), this;
  }
  once(t, e) {
    const i = (...s) => {
      this.off(t, i), e.apply(this, s);
    };
    return this.on(t, i);
  }
  removeAllListeners() {
    this.callbacks = {};
  }
}
function E(n, t, e) {
  return n.config[t] === void 0 && n.parent ? E(n.parent, t, e) : typeof n.config[t] == "function" ? n.config[t].bind({
    ...e,
    parent: n.parent ? E(n.parent, t, e) : null
  }) : n.config[t];
}
function as(n) {
  const t = n.filter((s) => s.type === "extension"), e = n.filter((s) => s.type === "node"), i = n.filter((s) => s.type === "mark");
  return {
    baseExtensions: t,
    nodeExtensions: e,
    markExtensions: i
  };
}
function Ac(n) {
  const t = [], { nodeExtensions: e, markExtensions: i } = as(n), s = [...e, ...i], r = {
    default: null,
    rendered: !0,
    renderHTML: null,
    parseHTML: null,
    keepOnSplit: !0,
    isRequired: !1
  };
  return n.forEach((o) => {
    const l = {
      name: o.name,
      options: o.options,
      storage: o.storage,
      extensions: s
    }, a = E(o, "addGlobalAttributes", l);
    if (!a)
      return;
    a().forEach((d) => {
      d.types.forEach((u) => {
        Object.entries(d.attributes).forEach(([p, h]) => {
          t.push({
            type: u,
            name: p,
            attribute: {
              ...r,
              ...h
            }
          });
        });
      });
    });
  }), s.forEach((o) => {
    const l = {
      name: o.name,
      options: o.options,
      storage: o.storage
    }, a = E(o, "addAttributes", l);
    if (!a)
      return;
    const c = a();
    Object.entries(c).forEach(([d, u]) => {
      const p = {
        ...r,
        ...u
      };
      typeof (p == null ? void 0 : p.default) == "function" && (p.default = p.default()), p != null && p.isRequired && (p == null ? void 0 : p.default) === void 0 && delete p.default, t.push({
        type: o.name,
        name: d,
        attribute: p
      });
    });
  }), t;
}
function tt(n, t) {
  if (typeof n == "string") {
    if (!t.nodes[n])
      throw Error(`There is no node type named '${n}'. Maybe you forgot to add the extension?`);
    return t.nodes[n];
  }
  return n;
}
function D(...n) {
  return n.filter((t) => !!t).reduce((t, e) => {
    const i = { ...t };
    return Object.entries(e).forEach(([s, r]) => {
      if (!i[s]) {
        i[s] = r;
        return;
      }
      if (s === "class") {
        const l = r ? String(r).split(" ") : [], a = i[s] ? i[s].split(" ") : [], c = l.filter((d) => !a.includes(d));
        i[s] = [...a, ...c].join(" ");
      } else if (s === "style") {
        const l = r ? r.split(";").map((d) => d.trim()).filter(Boolean) : [], a = i[s] ? i[s].split(";").map((d) => d.trim()).filter(Boolean) : [], c = /* @__PURE__ */ new Map();
        a.forEach((d) => {
          const [u, p] = d.split(":").map((h) => h.trim());
          c.set(u, p);
        }), l.forEach((d) => {
          const [u, p] = d.split(":").map((h) => h.trim());
          c.set(u, p);
        }), i[s] = Array.from(c.entries()).map(([d, u]) => `${d}: ${u}`).join("; ");
      } else
        i[s] = r;
    }), i;
  }, {});
}
function dr(n, t) {
  return t.filter((e) => e.type === n.type.name).filter((e) => e.attribute.rendered).map((e) => e.attribute.renderHTML ? e.attribute.renderHTML(n.attrs) || {} : {
    [e.name]: n.attrs[e.name]
  }).reduce((e, i) => D(e, i), {});
}
function Lc(n) {
  return typeof n == "function";
}
function R(n, t = void 0, ...e) {
  return Lc(n) ? t ? n.bind(t)(...e) : n(...e) : n;
}
function vh(n = {}) {
  return Object.keys(n).length === 0 && n.constructor === Object;
}
function wh(n) {
  return typeof n != "string" ? n : n.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(n) : n === "true" ? !0 : n === "false" ? !1 : n;
}
function gl(n, t) {
  return "style" in n ? n : {
    ...n,
    getAttrs: (e) => {
      const i = n.getAttrs ? n.getAttrs(e) : n.attrs;
      if (i === !1)
        return !1;
      const s = t.reduce((r, o) => {
        const l = o.attribute.parseHTML ? o.attribute.parseHTML(e) : wh(e.getAttribute(o.name));
        return l == null ? r : {
          ...r,
          [o.name]: l
        };
      }, {});
      return { ...i, ...s };
    }
  };
}
function bl(n) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(n).filter(([t, e]) => t === "attrs" && vh(e) ? !1 : e != null)
  );
}
function kh(n, t) {
  var e;
  const i = Ac(n), { nodeExtensions: s, markExtensions: r } = as(n), o = (e = s.find((c) => E(c, "topNode"))) === null || e === void 0 ? void 0 : e.name, l = Object.fromEntries(s.map((c) => {
    const d = i.filter((b) => b.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: t
    }, p = n.reduce((b, y) => {
      const w = E(y, "extendNodeSchema", u);
      return {
        ...b,
        ...w ? w(c) : {}
      };
    }, {}), h = bl({
      ...p,
      content: R(E(c, "content", u)),
      marks: R(E(c, "marks", u)),
      group: R(E(c, "group", u)),
      inline: R(E(c, "inline", u)),
      atom: R(E(c, "atom", u)),
      selectable: R(E(c, "selectable", u)),
      draggable: R(E(c, "draggable", u)),
      code: R(E(c, "code", u)),
      whitespace: R(E(c, "whitespace", u)),
      linebreakReplacement: R(E(c, "linebreakReplacement", u)),
      defining: R(E(c, "defining", u)),
      isolating: R(E(c, "isolating", u)),
      attrs: Object.fromEntries(d.map((b) => {
        var y;
        return [b.name, { default: (y = b == null ? void 0 : b.attribute) === null || y === void 0 ? void 0 : y.default }];
      }))
    }), f = R(E(c, "parseHTML", u));
    f && (h.parseDOM = f.map((b) => gl(b, d)));
    const g = E(c, "renderHTML", u);
    g && (h.toDOM = (b) => g({
      node: b,
      HTMLAttributes: dr(b, d)
    }));
    const m = E(c, "renderText", u);
    return m && (h.toText = m), [c.name, h];
  })), a = Object.fromEntries(r.map((c) => {
    const d = i.filter((m) => m.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: t
    }, p = n.reduce((m, b) => {
      const y = E(b, "extendMarkSchema", u);
      return {
        ...m,
        ...y ? y(c) : {}
      };
    }, {}), h = bl({
      ...p,
      inclusive: R(E(c, "inclusive", u)),
      excludes: R(E(c, "excludes", u)),
      group: R(E(c, "group", u)),
      spanning: R(E(c, "spanning", u)),
      code: R(E(c, "code", u)),
      attrs: Object.fromEntries(d.map((m) => {
        var b;
        return [m.name, { default: (b = m == null ? void 0 : m.attribute) === null || b === void 0 ? void 0 : b.default }];
      }))
    }), f = R(E(c, "parseHTML", u));
    f && (h.parseDOM = f.map((m) => gl(m, d)));
    const g = E(c, "renderHTML", u);
    return g && (h.toDOM = (m) => g({
      mark: m,
      HTMLAttributes: dr(m, d)
    })), [c.name, h];
  }));
  return new ba({
    topNode: o,
    nodes: l,
    marks: a
  });
}
function Rs(n, t) {
  return t.nodes[n] || t.marks[n] || null;
}
function yl(n, t) {
  return Array.isArray(t) ? t.some((e) => (typeof e == "string" ? e : e.name) === n.name) : t;
}
function Zr(n, t) {
  const e = Ie.fromSchema(t).serializeFragment(n), s = document.implementation.createHTMLDocument().createElement("div");
  return s.appendChild(e), s.innerHTML;
}
const xh = (n, t = 500) => {
  let e = "";
  const i = n.parentOffset;
  return n.parent.nodesBetween(Math.max(0, i - t), i, (s, r, o, l) => {
    var a, c;
    const d = ((c = (a = s.type.spec).toText) === null || c === void 0 ? void 0 : c.call(a, {
      node: s,
      pos: r,
      parent: o,
      index: l
    })) || s.textContent || "%leaf%";
    e += s.isAtom && !s.isText ? d : d.slice(0, Math.max(0, i - r));
  }), e;
};
function to(n) {
  return Object.prototype.toString.call(n) === "[object RegExp]";
}
class cs {
  constructor(t) {
    this.find = t.find, this.handler = t.handler;
  }
}
const Ch = (n, t) => {
  if (to(t))
    return t.exec(n);
  const e = t(n);
  if (!e)
    return null;
  const i = [e.text];
  return i.index = e.index, i.input = n, i.data = e.data, e.replaceWith && (e.text.includes(e.replaceWith) || console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".'), i.push(e.replaceWith)), i;
};
function qn(n) {
  var t;
  const { editor: e, from: i, to: s, text: r, rules: o, plugin: l } = n, { view: a } = e;
  if (a.composing)
    return !1;
  const c = a.state.doc.resolve(i);
  if (
    // check for code node
    c.parent.type.spec.code || !((t = c.nodeBefore || c.nodeAfter) === null || t === void 0) && t.marks.find((p) => p.type.spec.code)
  )
    return !1;
  let d = !1;
  const u = xh(c) + r;
  return o.forEach((p) => {
    if (d)
      return;
    const h = Ch(u, p.find);
    if (!h)
      return;
    const f = a.state.tr, g = rs({
      state: a.state,
      transaction: f
    }), m = {
      from: i - (h[0].length - r.length),
      to: s
    }, { commands: b, chain: y, can: w } = new ls({
      editor: e,
      state: g
    });
    p.handler({
      state: g,
      range: m,
      match: h,
      commands: b,
      chain: y,
      can: w
    }) === null || !f.steps.length || (f.setMeta(l, {
      transform: f,
      from: i,
      to: s,
      text: r
    }), a.dispatch(f), d = !0);
  }), d;
}
function Sh(n) {
  const { editor: t, rules: e } = n, i = new V({
    state: {
      init() {
        return null;
      },
      apply(s, r, o) {
        const l = s.getMeta(i);
        if (l)
          return l;
        const a = s.getMeta("applyInputRules");
        return !!a && setTimeout(() => {
          let { text: d } = a;
          typeof d == "string" ? d = d : d = Zr(v.from(d), o.schema);
          const { from: u } = a, p = u + d.length;
          qn({
            editor: t,
            from: u,
            to: p,
            text: d,
            rules: e,
            plugin: i
          });
        }), s.selectionSet || s.docChanged ? null : r;
      }
    },
    props: {
      handleTextInput(s, r, o, l) {
        return qn({
          editor: t,
          from: r,
          to: o,
          text: l,
          rules: e,
          plugin: i
        });
      },
      handleDOMEvents: {
        compositionend: (s) => (setTimeout(() => {
          const { $cursor: r } = s.state.selection;
          r && qn({
            editor: t,
            from: r.pos,
            to: r.pos,
            text: "",
            rules: e,
            plugin: i
          });
        }), !1)
      },
      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(s, r) {
        if (r.key !== "Enter")
          return !1;
        const { $cursor: o } = s.state.selection;
        return o ? qn({
          editor: t,
          from: o.pos,
          to: o.pos,
          text: `
`,
          rules: e,
          plugin: i
        }) : !1;
      }
    },
    // @ts-ignore
    isInputRules: !0
  });
  return i;
}
function Mh(n) {
  return Object.prototype.toString.call(n).slice(8, -1);
}
function Fn(n) {
  return Mh(n) !== "Object" ? !1 : n.constructor === Object && Object.getPrototypeOf(n) === Object.prototype;
}
function ds(n, t) {
  const e = { ...n };
  return Fn(n) && Fn(t) && Object.keys(t).forEach((i) => {
    Fn(t[i]) && Fn(n[i]) ? e[i] = ds(n[i], t[i]) : e[i] = t[i];
  }), e;
}
class gt {
  constructor(t = {}) {
    this.type = "mark", this.name = "mark", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...t
    }, this.name = this.config.name, t.defaultOptions && Object.keys(t.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = R(E(this, "addOptions", {
      name: this.name
    }))), this.storage = R(E(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(t = {}) {
    return new gt(t);
  }
  configure(t = {}) {
    const e = this.extend({
      ...this.config,
      addOptions: () => ds(this.options, t)
    });
    return e.name = this.name, e.parent = this.parent, e;
  }
  extend(t = {}) {
    const e = new gt(t);
    return e.parent = this, this.child = e, e.name = t.name ? t.name : e.parent.name, t.defaultOptions && Object.keys(t.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${e.name}".`), e.options = R(E(e, "addOptions", {
      name: e.name
    })), e.storage = R(E(e, "addStorage", {
      name: e.name,
      options: e.options
    })), e;
  }
  static handleExit({ editor: t, mark: e }) {
    const { tr: i } = t.state, s = t.state.selection.$from;
    if (s.pos === s.end()) {
      const o = s.marks();
      if (!!!o.find((c) => (c == null ? void 0 : c.type.name) === e.name))
        return !1;
      const a = o.find((c) => (c == null ? void 0 : c.type.name) === e.name);
      return a && i.removeStoredMark(a), i.insertText(" ", s.pos), t.view.dispatch(i), !0;
    }
    return !1;
  }
}
function Eh(n) {
  return typeof n == "number";
}
class _h {
  constructor(t) {
    this.find = t.find, this.handler = t.handler;
  }
}
const Th = (n, t, e) => {
  if (to(t))
    return [...n.matchAll(t)];
  const i = t(n, e);
  return i ? i.map((s) => {
    const r = [s.text];
    return r.index = s.index, r.input = n, r.data = s.data, s.replaceWith && (s.text.includes(s.replaceWith) || console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".'), r.push(s.replaceWith)), r;
  }) : [];
};
function Ah(n) {
  const { editor: t, state: e, from: i, to: s, rule: r, pasteEvent: o, dropEvent: l } = n, { commands: a, chain: c, can: d } = new ls({
    editor: t,
    state: e
  }), u = [];
  return e.doc.nodesBetween(i, s, (h, f) => {
    if (!h.isTextblock || h.type.spec.code)
      return;
    const g = Math.max(i, f), m = Math.min(s, f + h.content.size), b = h.textBetween(g - f, m - f, void 0, "￼");
    Th(b, r.find, o).forEach((w) => {
      if (w.index === void 0)
        return;
      const M = g + w.index + 1, x = M + w[0].length, N = {
        from: e.tr.mapping.map(M),
        to: e.tr.mapping.map(x)
      }, S = r.handler({
        state: e,
        range: N,
        match: w,
        commands: a,
        chain: c,
        can: d,
        pasteEvent: o,
        dropEvent: l
      });
      u.push(S);
    });
  }), u.every((h) => h !== null);
}
let Vn = null;
const Lh = (n) => {
  var t;
  const e = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  return (t = e.clipboardData) === null || t === void 0 || t.setData("text/html", n), e;
};
function Nh(n) {
  const { editor: t, rules: e } = n;
  let i = null, s = !1, r = !1, o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, l;
  try {
    l = typeof DragEvent < "u" ? new DragEvent("drop") : null;
  } catch {
    l = null;
  }
  const a = ({ state: d, from: u, to: p, rule: h, pasteEvt: f }) => {
    const g = d.tr, m = rs({
      state: d,
      transaction: g
    });
    if (!(!Ah({
      editor: t,
      state: m,
      from: Math.max(u - 1, 0),
      to: p.b - 1,
      rule: h,
      pasteEvent: f,
      dropEvent: l
    }) || !g.steps.length)) {
      try {
        l = typeof DragEvent < "u" ? new DragEvent("drop") : null;
      } catch {
        l = null;
      }
      return o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, g;
    }
  };
  return e.map((d) => new V({
    // we register a global drag handler to track the current drag source element
    view(u) {
      const p = (f) => {
        var g;
        i = !((g = u.dom.parentElement) === null || g === void 0) && g.contains(f.target) ? u.dom.parentElement : null, i && (Vn = t);
      }, h = () => {
        Vn && (Vn = null);
      };
      return window.addEventListener("dragstart", p), window.addEventListener("dragend", h), {
        destroy() {
          window.removeEventListener("dragstart", p), window.removeEventListener("dragend", h);
        }
      };
    },
    props: {
      handleDOMEvents: {
        drop: (u, p) => {
          if (r = i === u.dom.parentElement, l = p, !r) {
            const h = Vn;
            h != null && h.isEditable && setTimeout(() => {
              const f = h.state.selection;
              f && h.commands.deleteRange({ from: f.from, to: f.to });
            }, 10);
          }
          return !1;
        },
        paste: (u, p) => {
          var h;
          const f = (h = p.clipboardData) === null || h === void 0 ? void 0 : h.getData("text/html");
          return o = p, s = !!(f != null && f.includes("data-pm-slice")), !1;
        }
      }
    },
    appendTransaction: (u, p, h) => {
      const f = u[0], g = f.getMeta("uiEvent") === "paste" && !s, m = f.getMeta("uiEvent") === "drop" && !r, b = f.getMeta("applyPasteRules"), y = !!b;
      if (!g && !m && !y)
        return;
      if (y) {
        let { text: x } = b;
        typeof x == "string" ? x = x : x = Zr(v.from(x), h.schema);
        const { from: N } = b, S = N + x.length, A = Lh(x);
        return a({
          rule: d,
          state: h,
          from: N,
          to: { b: S },
          pasteEvt: A
        });
      }
      const w = p.doc.content.findDiffStart(h.doc.content), M = p.doc.content.findDiffEnd(h.doc.content);
      if (!(!Eh(w) || !M || w === M.b))
        return a({
          rule: d,
          state: h,
          from: w,
          to: M,
          pasteEvt: o
        });
    }
  }));
}
function Oh(n) {
  const t = n.filter((e, i) => n.indexOf(e) !== i);
  return Array.from(new Set(t));
}
class je {
  constructor(t, e) {
    this.splittableMarks = [], this.editor = e, this.extensions = je.resolve(t), this.schema = kh(this.extensions, e), this.setupExtensions();
  }
  /**
   * Returns a flattened and sorted extension list while
   * also checking for duplicated extensions and warns the user.
   * @param extensions An array of Tiptap extensions
   * @returns An flattened and sorted array of Tiptap extensions
   */
  static resolve(t) {
    const e = je.sort(je.flatten(t)), i = Oh(e.map((s) => s.name));
    return i.length && console.warn(`[tiptap warn]: Duplicate extension names found: [${i.map((s) => `'${s}'`).join(", ")}]. This can lead to issues.`), e;
  }
  /**
   * Create a flattened array of extensions by traversing the `addExtensions` field.
   * @param extensions An array of Tiptap extensions
   * @returns A flattened array of Tiptap extensions
   */
  static flatten(t) {
    return t.map((e) => {
      const i = {
        name: e.name,
        options: e.options,
        storage: e.storage
      }, s = E(e, "addExtensions", i);
      return s ? [e, ...this.flatten(s())] : e;
    }).flat(10);
  }
  /**
   * Sort extensions by priority.
   * @param extensions An array of Tiptap extensions
   * @returns A sorted array of Tiptap extensions by priority
   */
  static sort(t) {
    return t.sort((i, s) => {
      const r = E(i, "priority") || 100, o = E(s, "priority") || 100;
      return r > o ? -1 : r < o ? 1 : 0;
    });
  }
  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
  get commands() {
    return this.extensions.reduce((t, e) => {
      const i = {
        name: e.name,
        options: e.options,
        storage: e.storage,
        editor: this.editor,
        type: Rs(e.name, this.schema)
      }, s = E(e, "addCommands", i);
      return s ? {
        ...t,
        ...s()
      } : t;
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor: t } = this, e = je.sort([...this.extensions].reverse()), i = [], s = [], r = e.map((o) => {
      const l = {
        name: o.name,
        options: o.options,
        storage: o.storage,
        editor: t,
        type: Rs(o.name, this.schema)
      }, a = [], c = E(o, "addKeyboardShortcuts", l);
      let d = {};
      if (o.type === "mark" && E(o, "exitable", l) && (d.ArrowRight = () => gt.handleExit({ editor: t, mark: o })), c) {
        const g = Object.fromEntries(Object.entries(c()).map(([m, b]) => [m, () => b({ editor: t })]));
        d = { ...d, ...g };
      }
      const u = Xp(d);
      a.push(u);
      const p = E(o, "addInputRules", l);
      yl(o, t.options.enableInputRules) && p && i.push(...p());
      const h = E(o, "addPasteRules", l);
      yl(o, t.options.enablePasteRules) && h && s.push(...h());
      const f = E(o, "addProseMirrorPlugins", l);
      if (f) {
        const g = f();
        a.push(...g);
      }
      return a;
    }).flat();
    return [
      Sh({
        editor: t,
        rules: i
      }),
      ...Nh({
        editor: t,
        rules: s
      }),
      ...r
    ];
  }
  /**
   * Get all attributes from the extensions.
   * @returns An array of attributes
   */
  get attributes() {
    return Ac(this.extensions);
  }
  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews() {
    const { editor: t } = this, { nodeExtensions: e } = as(this.extensions);
    return Object.fromEntries(e.filter((i) => !!E(i, "addNodeView")).map((i) => {
      const s = this.attributes.filter((a) => a.type === i.name), r = {
        name: i.name,
        options: i.options,
        storage: i.storage,
        editor: t,
        type: tt(i.name, this.schema)
      }, o = E(i, "addNodeView", r);
      if (!o)
        return [];
      const l = (a, c, d, u, p) => {
        const h = dr(a, s);
        return o()({
          // pass-through
          node: a,
          view: c,
          getPos: d,
          decorations: u,
          innerDecorations: p,
          // tiptap-specific
          editor: t,
          extension: i,
          HTMLAttributes: h
        });
      };
      return [i.name, l];
    }));
  }
  /**
   * Go through all extensions, create extension storages & setup marks
   * & bind editor event listener.
   */
  setupExtensions() {
    this.extensions.forEach((t) => {
      var e;
      this.editor.extensionStorage[t.name] = t.storage;
      const i = {
        name: t.name,
        options: t.options,
        storage: t.storage,
        editor: this.editor,
        type: Rs(t.name, this.schema)
      };
      t.type === "mark" && (!((e = R(E(t, "keepOnSplit", i))) !== null && e !== void 0) || e) && this.splittableMarks.push(t.name);
      const s = E(t, "onBeforeCreate", i), r = E(t, "onCreate", i), o = E(t, "onUpdate", i), l = E(t, "onSelectionUpdate", i), a = E(t, "onTransaction", i), c = E(t, "onFocus", i), d = E(t, "onBlur", i), u = E(t, "onDestroy", i);
      s && this.editor.on("beforeCreate", s), r && this.editor.on("create", r), o && this.editor.on("update", o), l && this.editor.on("selectionUpdate", l), a && this.editor.on("transaction", a), c && this.editor.on("focus", c), d && this.editor.on("blur", d), u && this.editor.on("destroy", u);
    });
  }
}
class K {
  constructor(t = {}) {
    this.type = "extension", this.name = "extension", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...t
    }, this.name = this.config.name, t.defaultOptions && Object.keys(t.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = R(E(this, "addOptions", {
      name: this.name
    }))), this.storage = R(E(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(t = {}) {
    return new K(t);
  }
  configure(t = {}) {
    const e = this.extend({
      ...this.config,
      addOptions: () => ds(this.options, t)
    });
    return e.name = this.name, e.parent = this.parent, e;
  }
  extend(t = {}) {
    const e = new K({ ...this.config, ...t });
    return e.parent = this, this.child = e, e.name = t.name ? t.name : e.parent.name, t.defaultOptions && Object.keys(t.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${e.name}".`), e.options = R(E(e, "addOptions", {
      name: e.name
    })), e.storage = R(E(e, "addStorage", {
      name: e.name,
      options: e.options
    })), e;
  }
}
function Nc(n, t, e) {
  const { from: i, to: s } = t, { blockSeparator: r = `

`, textSerializers: o = {} } = e || {};
  let l = "";
  return n.nodesBetween(i, s, (a, c, d, u) => {
    var p;
    a.isBlock && c > i && (l += r);
    const h = o == null ? void 0 : o[a.type.name];
    if (h)
      return d && (l += h({
        node: a,
        pos: c,
        parent: d,
        index: u,
        range: t
      })), !1;
    a.isText && (l += (p = a == null ? void 0 : a.text) === null || p === void 0 ? void 0 : p.slice(Math.max(i, c) - c, s - c));
  }), l;
}
function Oc(n) {
  return Object.fromEntries(Object.entries(n.nodes).filter(([, t]) => t.spec.toText).map(([t, e]) => [t, e.spec.toText]));
}
const Rh = K.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new V({
        key: new J("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: n } = this, { state: t, schema: e } = n, { doc: i, selection: s } = t, { ranges: r } = s, o = Math.min(...r.map((d) => d.$from.pos)), l = Math.max(...r.map((d) => d.$to.pos)), a = Oc(e);
            return Nc(i, { from: o, to: l }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: a
            });
          }
        }
      })
    ];
  }
}), Ih = () => ({ editor: n, view: t }) => (requestAnimationFrame(() => {
  var e;
  n.isDestroyed || (t.dom.blur(), (e = window == null ? void 0 : window.getSelection()) === null || e === void 0 || e.removeAllRanges());
}), !0), Dh = (n = !1) => ({ commands: t }) => t.setContent("", n), Ph = () => ({ state: n, tr: t, dispatch: e }) => {
  const { selection: i } = t, { ranges: s } = i;
  return e && s.forEach(({ $from: r, $to: o }) => {
    n.doc.nodesBetween(r.pos, o.pos, (l, a) => {
      if (l.type.isText)
        return;
      const { doc: c, mapping: d } = t, u = c.resolve(d.map(a)), p = c.resolve(d.map(a + l.nodeSize)), h = u.blockRange(p);
      if (!h)
        return;
      const f = Xe(h);
      if (l.type.isTextblock) {
        const { defaultType: g } = u.parent.contentMatchAt(u.index());
        t.setNodeMarkup(h.start, g);
      }
      (f || f === 0) && t.lift(h, f);
    });
  }), !0;
}, Bh = (n) => (t) => n(t), Hh = () => ({ state: n, dispatch: t }) => Mc(n, t), $h = (n, t) => ({ editor: e, tr: i }) => {
  const { state: s } = e, r = s.doc.slice(n.from, n.to);
  i.deleteRange(n.from, n.to);
  const o = i.mapping.map(t);
  return i.insert(o, r.content), i.setSelection(new T(i.doc.resolve(Math.max(o - 1, 0)))), !0;
}, zh = () => ({ tr: n, dispatch: t }) => {
  const { selection: e } = n, i = e.$anchor.node();
  if (i.content.size > 0)
    return !1;
  const s = n.selection.$anchor;
  for (let r = s.depth; r > 0; r -= 1)
    if (s.node(r).type === i.type) {
      if (t) {
        const l = s.before(r), a = s.after(r);
        n.delete(l, a).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, qh = (n) => ({ tr: t, state: e, dispatch: i }) => {
  const s = tt(n, e.schema), r = t.selection.$anchor;
  for (let o = r.depth; o > 0; o -= 1)
    if (r.node(o).type === s) {
      if (i) {
        const a = r.before(o), c = r.after(o);
        t.delete(a, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, Fh = (n) => ({ tr: t, dispatch: e }) => {
  const { from: i, to: s } = n;
  return e && t.delete(i, s), !0;
}, Vh = () => ({ state: n, dispatch: t }) => Jr(n, t), jh = () => ({ commands: n }) => n.keyboardShortcut("Enter"), Uh = () => ({ state: n, dispatch: t }) => ih(n, t);
function wi(n, t, e = { strict: !0 }) {
  const i = Object.keys(t);
  return i.length ? i.every((s) => e.strict ? t[s] === n[s] : to(t[s]) ? t[s].test(n[s]) : t[s] === n[s]) : !0;
}
function Rc(n, t, e = {}) {
  return n.find((i) => i.type === t && wi(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(e).map((s) => [s, i.attrs[s]])),
    e
  ));
}
function vl(n, t, e = {}) {
  return !!Rc(n, t, e);
}
function eo(n, t, e) {
  var i;
  if (!n || !t)
    return;
  let s = n.parent.childAfter(n.parentOffset);
  if ((!s.node || !s.node.marks.some((d) => d.type === t)) && (s = n.parent.childBefore(n.parentOffset)), !s.node || !s.node.marks.some((d) => d.type === t) || (e = e || ((i = s.node.marks[0]) === null || i === void 0 ? void 0 : i.attrs), !Rc([...s.node.marks], t, e)))
    return;
  let o = s.index, l = n.start() + s.offset, a = o + 1, c = l + s.node.nodeSize;
  for (; o > 0 && vl([...n.parent.child(o - 1).marks], t, e); )
    o -= 1, l -= n.parent.child(o).nodeSize;
  for (; a < n.parent.childCount && vl([...n.parent.child(a).marks], t, e); )
    c += n.parent.child(a).nodeSize, a += 1;
  return {
    from: l,
    to: c
  };
}
function he(n, t) {
  if (typeof n == "string") {
    if (!t.marks[n])
      throw Error(`There is no mark type named '${n}'. Maybe you forgot to add the extension?`);
    return t.marks[n];
  }
  return n;
}
const Wh = (n, t = {}) => ({ tr: e, state: i, dispatch: s }) => {
  const r = he(n, i.schema), { doc: o, selection: l } = e, { $from: a, from: c, to: d } = l;
  if (s) {
    const u = eo(a, r, t);
    if (u && u.from <= c && u.to >= d) {
      const p = T.create(o, u.from, u.to);
      e.setSelection(p);
    }
  }
  return !0;
}, Kh = (n) => (t) => {
  const e = typeof n == "function" ? n(t) : n;
  for (let i = 0; i < e.length; i += 1)
    if (e[i](t))
      return !0;
  return !1;
};
function Ic(n) {
  return n instanceof T;
}
function we(n = 0, t = 0, e = 0) {
  return Math.min(Math.max(n, t), e);
}
function Dc(n, t = null) {
  if (!t)
    return null;
  const e = L.atStart(n), i = L.atEnd(n);
  if (t === "start" || t === !0)
    return e;
  if (t === "end")
    return i;
  const s = e.from, r = i.to;
  return t === "all" ? T.create(n, we(0, s, r), we(n.content.size, s, r)) : T.create(n, we(t, s, r), we(t, s, r));
}
function wl() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function ki() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function Jh() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const Gh = (n = null, t = {}) => ({ editor: e, view: i, tr: s, dispatch: r }) => {
  t = {
    scrollIntoView: !0,
    ...t
  };
  const o = () => {
    (ki() || wl()) && i.dom.focus(), requestAnimationFrame(() => {
      e.isDestroyed || (i.focus(), Jh() && !ki() && !wl() && i.dom.focus({ preventScroll: !0 }));
    });
  };
  if (i.hasFocus() && n === null || n === !1)
    return !0;
  if (r && n === null && !Ic(e.state.selection))
    return o(), !0;
  const l = Dc(s.doc, n) || e.state.selection, a = e.state.selection.eq(l);
  return r && (a || s.setSelection(l), a && s.storedMarks && s.setStoredMarks(s.storedMarks), o()), !0;
}, Yh = (n, t) => (e) => n.every((i, s) => t(i, { ...e, index: s })), Xh = (n, t) => ({ tr: e, commands: i }) => i.insertContentAt({ from: e.selection.from, to: e.selection.to }, n, t), Pc = (n) => {
  const t = n.childNodes;
  for (let e = t.length - 1; e >= 0; e -= 1) {
    const i = t[e];
    i.nodeType === 3 && i.nodeValue && /^(\n\s\s|\n)$/.test(i.nodeValue) ? n.removeChild(i) : i.nodeType === 1 && Pc(i);
  }
  return n;
};
function jn(n) {
  const t = `<body>${n}</body>`, e = new window.DOMParser().parseFromString(t, "text/html").body;
  return Pc(e);
}
function _n(n, t, e) {
  if (n instanceof se || n instanceof v)
    return n;
  e = {
    slice: !0,
    parseOptions: {},
    ...e
  };
  const i = typeof n == "object" && n !== null, s = typeof n == "string";
  if (i)
    try {
      if (Array.isArray(n) && n.length > 0)
        return v.fromArray(n.map((l) => t.nodeFromJSON(l)));
      const o = t.nodeFromJSON(n);
      return e.errorOnInvalidContent && o.check(), o;
    } catch (r) {
      if (e.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: r });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", n, "Error:", r), _n("", t, e);
    }
  if (s) {
    if (e.errorOnInvalidContent) {
      let o = !1, l = "";
      const a = new ba({
        topNode: t.spec.topNode,
        marks: t.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: t.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (c) => (o = !0, l = typeof c == "string" ? c : c.outerHTML, null)
              }
            ]
          }
        })
      });
      if (e.slice ? re.fromSchema(a).parseSlice(jn(n), e.parseOptions) : re.fromSchema(a).parse(jn(n), e.parseOptions), e.errorOnInvalidContent && o)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${l}`) });
    }
    const r = re.fromSchema(t);
    return e.slice ? r.parseSlice(jn(n), e.parseOptions).content : r.parse(jn(n), e.parseOptions);
  }
  return _n("", t, e);
}
function Qh(n, t, e) {
  const i = n.steps.length - 1;
  if (i < t)
    return;
  const s = n.steps[i];
  if (!(s instanceof X || s instanceof Q))
    return;
  const r = n.mapping.maps[i];
  let o = 0;
  r.forEach((l, a, c, d) => {
    o === 0 && (o = d);
  }), n.setSelection(L.near(n.doc.resolve(o), e));
}
const Zh = (n) => !("type" in n), tf = (n, t, e) => ({ tr: i, dispatch: s, editor: r }) => {
  var o;
  if (s) {
    e = {
      parseOptions: r.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...e
    };
    let l;
    const a = (m) => {
      r.emit("contentError", {
        editor: r,
        error: m,
        disableCollaboration: () => {
          r.storage.collaboration && (r.storage.collaboration.isDisabled = !0);
        }
      });
    }, c = {
      preserveWhitespace: "full",
      ...e.parseOptions
    };
    if (!e.errorOnInvalidContent && !r.options.enableContentCheck && r.options.emitContentError)
      try {
        _n(t, r.schema, {
          parseOptions: c,
          errorOnInvalidContent: !0
        });
      } catch (m) {
        a(m);
      }
    try {
      l = _n(t, r.schema, {
        parseOptions: c,
        errorOnInvalidContent: (o = e.errorOnInvalidContent) !== null && o !== void 0 ? o : r.options.enableContentCheck
      });
    } catch (m) {
      return a(m), !1;
    }
    let { from: d, to: u } = typeof n == "number" ? { from: n, to: n } : { from: n.from, to: n.to }, p = !0, h = !0;
    if ((Zh(l) ? l : [l]).forEach((m) => {
      m.check(), p = p ? m.isText && m.marks.length === 0 : !1, h = h ? m.isBlock : !1;
    }), d === u && h) {
      const { parent: m } = i.doc.resolve(d);
      m.isTextblock && !m.type.spec.code && !m.childCount && (d -= 1, u += 1);
    }
    let g;
    if (p) {
      if (Array.isArray(t))
        g = t.map((m) => m.text || "").join("");
      else if (t instanceof v) {
        let m = "";
        t.forEach((b) => {
          b.text && (m += b.text);
        }), g = m;
      } else typeof t == "object" && t && t.text ? g = t.text : g = t;
      i.insertText(g, d, u);
    } else
      g = l, i.replaceWith(d, u, g);
    e.updateSelection && Qh(i, i.steps.length - 1, -1), e.applyInputRules && i.setMeta("applyInputRules", { from: d, text: g }), e.applyPasteRules && i.setMeta("applyPasteRules", { from: d, text: g });
  }
  return !0;
}, ef = () => ({ state: n, dispatch: t }) => th(n, t), nf = () => ({ state: n, dispatch: t }) => eh(n, t), sf = () => ({ state: n, dispatch: t }) => yc(n, t), rf = () => ({ state: n, dispatch: t }) => xc(n, t), of = () => ({ state: n, dispatch: t, tr: e }) => {
  try {
    const i = Zi(n.doc, n.selection.$from.pos, -1);
    return i == null ? !1 : (e.join(i, 2), t && t(e), !0);
  } catch {
    return !1;
  }
}, lf = () => ({ state: n, dispatch: t, tr: e }) => {
  try {
    const i = Zi(n.doc, n.selection.$from.pos, 1);
    return i == null ? !1 : (e.join(i, 2), t && t(e), !0);
  } catch {
    return !1;
  }
}, af = () => ({ state: n, dispatch: t }) => Qp(n, t), cf = () => ({ state: n, dispatch: t }) => Zp(n, t);
function Bc() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function df(n) {
  const t = n.split(/-(?!$)/);
  let e = t[t.length - 1];
  e === "Space" && (e = " ");
  let i, s, r, o;
  for (let l = 0; l < t.length - 1; l += 1) {
    const a = t[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      s = !0;
    else if (/^s(hift)?$/i.test(a))
      r = !0;
    else if (/^mod$/i.test(a))
      ki() || Bc() ? o = !0 : s = !0;
    else
      throw new Error(`Unrecognized modifier name: ${a}`);
  }
  return i && (e = `Alt-${e}`), s && (e = `Ctrl-${e}`), o && (e = `Meta-${e}`), r && (e = `Shift-${e}`), e;
}
const uf = (n) => ({ editor: t, view: e, tr: i, dispatch: s }) => {
  const r = df(n).split(/-(?!$)/), o = r.find((c) => !["Alt", "Ctrl", "Meta", "Shift"].includes(c)), l = new KeyboardEvent("keydown", {
    key: o === "Space" ? " " : o,
    altKey: r.includes("Alt"),
    ctrlKey: r.includes("Ctrl"),
    metaKey: r.includes("Meta"),
    shiftKey: r.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), a = t.captureTransaction(() => {
    e.someProp("handleKeyDown", (c) => c(e, l));
  });
  return a == null || a.steps.forEach((c) => {
    const d = c.map(i.mapping);
    d && s && i.maybeStep(d);
  }), !0;
};
function Tn(n, t, e = {}) {
  const { from: i, to: s, empty: r } = n.selection, o = t ? tt(t, n.schema) : null, l = [];
  n.doc.nodesBetween(i, s, (u, p) => {
    if (u.isText)
      return;
    const h = Math.max(i, p), f = Math.min(s, p + u.nodeSize);
    l.push({
      node: u,
      from: h,
      to: f
    });
  });
  const a = s - i, c = l.filter((u) => o ? o.name === u.node.type.name : !0).filter((u) => wi(u.node.attrs, e, { strict: !1 }));
  return r ? !!c.length : c.reduce((u, p) => u + p.to - p.from, 0) >= a;
}
const pf = (n, t = {}) => ({ state: e, dispatch: i }) => {
  const s = tt(n, e.schema);
  return Tn(e, s, t) ? nh(e, i) : !1;
}, hf = () => ({ state: n, dispatch: t }) => Ec(n, t), ff = (n) => ({ state: t, dispatch: e }) => {
  const i = tt(n, t.schema);
  return fh(i)(t, e);
}, mf = () => ({ state: n, dispatch: t }) => Sc(n, t);
function us(n, t) {
  return t.nodes[n] ? "node" : t.marks[n] ? "mark" : null;
}
function kl(n, t) {
  const e = typeof t == "string" ? [t] : t;
  return Object.keys(n).reduce((i, s) => (e.includes(s) || (i[s] = n[s]), i), {});
}
const gf = (n, t) => ({ tr: e, state: i, dispatch: s }) => {
  let r = null, o = null;
  const l = us(typeof n == "string" ? n : n.name, i.schema);
  return l ? (l === "node" && (r = tt(n, i.schema)), l === "mark" && (o = he(n, i.schema)), s && e.selection.ranges.forEach((a) => {
    i.doc.nodesBetween(a.$from.pos, a.$to.pos, (c, d) => {
      r && r === c.type && e.setNodeMarkup(d, void 0, kl(c.attrs, t)), o && c.marks.length && c.marks.forEach((u) => {
        o === u.type && e.addMark(d, d + c.nodeSize, o.create(kl(u.attrs, t)));
      });
    });
  }), !0) : !1;
}, bf = () => ({ tr: n, dispatch: t }) => (t && n.scrollIntoView(), !0), yf = () => ({ tr: n, dispatch: t }) => {
  if (t) {
    const e = new vt(n.doc);
    n.setSelection(e);
  }
  return !0;
}, vf = () => ({ state: n, dispatch: t }) => wc(n, t), wf = () => ({ state: n, dispatch: t }) => Cc(n, t), kf = () => ({ state: n, dispatch: t }) => oh(n, t), xf = () => ({ state: n, dispatch: t }) => ch(n, t), Cf = () => ({ state: n, dispatch: t }) => ah(n, t);
function ur(n, t, e = {}, i = {}) {
  return _n(n, t, {
    slice: !1,
    parseOptions: e,
    errorOnInvalidContent: i.errorOnInvalidContent
  });
}
const Sf = (n, t = !1, e = {}, i = {}) => ({ editor: s, tr: r, dispatch: o, commands: l }) => {
  var a, c;
  const { doc: d } = r;
  if (e.preserveWhitespace !== "full") {
    const u = ur(n, s.schema, e, {
      errorOnInvalidContent: (a = i.errorOnInvalidContent) !== null && a !== void 0 ? a : s.options.enableContentCheck
    });
    return o && r.replaceWith(0, d.content.size, u).setMeta("preventUpdate", !t), !0;
  }
  return o && r.setMeta("preventUpdate", !t), l.insertContentAt({ from: 0, to: d.content.size }, n, {
    parseOptions: e,
    errorOnInvalidContent: (c = i.errorOnInvalidContent) !== null && c !== void 0 ? c : s.options.enableContentCheck
  });
};
function Hc(n, t) {
  const e = he(t, n.schema), { from: i, to: s, empty: r } = n.selection, o = [];
  r ? (n.storedMarks && o.push(...n.storedMarks), o.push(...n.selection.$head.marks())) : n.doc.nodesBetween(i, s, (a) => {
    o.push(...a.marks);
  });
  const l = o.find((a) => a.type.name === e.name);
  return l ? { ...l.attrs } : {};
}
function Mf(n, t) {
  const e = new Pr(n);
  return t.forEach((i) => {
    i.steps.forEach((s) => {
      e.step(s);
    });
  }), e;
}
function Ef(n) {
  for (let t = 0; t < n.edgeCount; t += 1) {
    const { type: e } = n.edge(t);
    if (e.isTextblock && !e.hasRequiredAttrs())
      return e;
  }
  return null;
}
function _f(n, t, e) {
  const i = [];
  return n.nodesBetween(t.from, t.to, (s, r) => {
    e(s) && i.push({
      node: s,
      pos: r
    });
  }), i;
}
function $c(n, t) {
  for (let e = n.depth; e > 0; e -= 1) {
    const i = n.node(e);
    if (t(i))
      return {
        pos: e > 0 ? n.before(e) : 0,
        start: n.start(e),
        depth: e,
        node: i
      };
  }
}
function no(n) {
  return (t) => $c(t.$from, n);
}
function Tf(n, t) {
  const e = {
    from: 0,
    to: n.content.size
  };
  return Nc(n, e, t);
}
function Af(n, t) {
  const e = tt(t, n.schema), { from: i, to: s } = n.selection, r = [];
  n.doc.nodesBetween(i, s, (l) => {
    r.push(l);
  });
  const o = r.reverse().find((l) => l.type.name === e.name);
  return o ? { ...o.attrs } : {};
}
function zc(n, t) {
  const e = us(typeof t == "string" ? t : t.name, n.schema);
  return e === "node" ? Af(n, t) : e === "mark" ? Hc(n, t) : {};
}
function Lf(n, t = JSON.stringify) {
  const e = {};
  return n.filter((i) => {
    const s = t(i);
    return Object.prototype.hasOwnProperty.call(e, s) ? !1 : e[s] = !0;
  });
}
function Nf(n) {
  const t = Lf(n);
  return t.length === 1 ? t : t.filter((e, i) => !t.filter((r, o) => o !== i).some((r) => e.oldRange.from >= r.oldRange.from && e.oldRange.to <= r.oldRange.to && e.newRange.from >= r.newRange.from && e.newRange.to <= r.newRange.to));
}
function Of(n) {
  const { mapping: t, steps: e } = n, i = [];
  return t.maps.forEach((s, r) => {
    const o = [];
    if (s.ranges.length)
      s.forEach((l, a) => {
        o.push({ from: l, to: a });
      });
    else {
      const { from: l, to: a } = e[r];
      if (l === void 0 || a === void 0)
        return;
      o.push({ from: l, to: a });
    }
    o.forEach(({ from: l, to: a }) => {
      const c = t.slice(r).map(l, -1), d = t.slice(r).map(a), u = t.invert().map(c, -1), p = t.invert().map(d);
      i.push({
        oldRange: {
          from: u,
          to: p
        },
        newRange: {
          from: c,
          to: d
        }
      });
    });
  }), Nf(i);
}
function io(n, t, e) {
  const i = [];
  return n === t ? e.resolve(n).marks().forEach((s) => {
    const r = e.resolve(n), o = eo(r, s.type);
    o && i.push({
      mark: s,
      ...o
    });
  }) : e.nodesBetween(n, t, (s, r) => {
    !s || (s == null ? void 0 : s.nodeSize) === void 0 || i.push(...s.marks.map((o) => ({
      from: r,
      to: r + s.nodeSize,
      mark: o
    })));
  }), i;
}
function ii(n, t, e) {
  return Object.fromEntries(Object.entries(e).filter(([i]) => {
    const s = n.find((r) => r.type === t && r.name === i);
    return s ? s.attribute.keepOnSplit : !1;
  }));
}
function pr(n, t, e = {}) {
  const { empty: i, ranges: s } = n.selection, r = t ? he(t, n.schema) : null;
  if (i)
    return !!(n.storedMarks || n.selection.$from.marks()).filter((u) => r ? r.name === u.type.name : !0).find((u) => wi(u.attrs, e, { strict: !1 }));
  let o = 0;
  const l = [];
  if (s.forEach(({ $from: u, $to: p }) => {
    const h = u.pos, f = p.pos;
    n.doc.nodesBetween(h, f, (g, m) => {
      if (!g.isText && !g.marks.length)
        return;
      const b = Math.max(h, m), y = Math.min(f, m + g.nodeSize), w = y - b;
      o += w, l.push(...g.marks.map((M) => ({
        mark: M,
        from: b,
        to: y
      })));
    });
  }), o === 0)
    return !1;
  const a = l.filter((u) => r ? r.name === u.mark.type.name : !0).filter((u) => wi(u.mark.attrs, e, { strict: !1 })).reduce((u, p) => u + p.to - p.from, 0), c = l.filter((u) => r ? u.mark.type !== r && u.mark.type.excludes(r) : !0).reduce((u, p) => u + p.to - p.from, 0);
  return (a > 0 ? a + c : a) >= o;
}
function Rf(n, t, e = {}) {
  if (!t)
    return Tn(n, null, e) || pr(n, null, e);
  const i = us(t, n.schema);
  return i === "node" ? Tn(n, t, e) : i === "mark" ? pr(n, t, e) : !1;
}
function xl(n, t) {
  const { nodeExtensions: e } = as(t), i = e.find((o) => o.name === n);
  if (!i)
    return !1;
  const s = {
    name: i.name,
    options: i.options,
    storage: i.storage
  }, r = R(E(i, "group", s));
  return typeof r != "string" ? !1 : r.split(" ").includes("list");
}
function ps(n, { checkChildren: t = !0, ignoreWhitespace: e = !1 } = {}) {
  var i;
  if (e) {
    if (n.type.name === "hardBreak")
      return !0;
    if (n.isText)
      return /^\s*$/m.test((i = n.text) !== null && i !== void 0 ? i : "");
  }
  if (n.isText)
    return !n.text;
  if (n.isAtom || n.isLeaf)
    return !1;
  if (n.content.childCount === 0)
    return !0;
  if (t) {
    let s = !0;
    return n.content.forEach((r) => {
      s !== !1 && (ps(r, { ignoreWhitespace: e, checkChildren: t }) || (s = !1));
    }), s;
  }
  return !1;
}
function If(n) {
  return n instanceof _;
}
function Df(n, t, e) {
  var i;
  const { selection: s } = t;
  let r = null;
  if (Ic(s) && (r = s.$cursor), r) {
    const l = (i = n.storedMarks) !== null && i !== void 0 ? i : r.marks();
    return !!e.isInSet(l) || !l.some((a) => a.type.excludes(e));
  }
  const { ranges: o } = s;
  return o.some(({ $from: l, $to: a }) => {
    let c = l.depth === 0 ? n.doc.inlineContent && n.doc.type.allowsMarkType(e) : !1;
    return n.doc.nodesBetween(l.pos, a.pos, (d, u, p) => {
      if (c)
        return !1;
      if (d.isInline) {
        const h = !p || p.type.allowsMarkType(e), f = !!e.isInSet(d.marks) || !d.marks.some((g) => g.type.excludes(e));
        c = h && f;
      }
      return !c;
    }), c;
  });
}
const Pf = (n, t = {}) => ({ tr: e, state: i, dispatch: s }) => {
  const { selection: r } = e, { empty: o, ranges: l } = r, a = he(n, i.schema);
  if (s)
    if (o) {
      const c = Hc(i, a);
      e.addStoredMark(a.create({
        ...c,
        ...t
      }));
    } else
      l.forEach((c) => {
        const d = c.$from.pos, u = c.$to.pos;
        i.doc.nodesBetween(d, u, (p, h) => {
          const f = Math.max(h, d), g = Math.min(h + p.nodeSize, u);
          p.marks.find((b) => b.type === a) ? p.marks.forEach((b) => {
            a === b.type && e.addMark(f, g, a.create({
              ...b.attrs,
              ...t
            }));
          }) : e.addMark(f, g, a.create(t));
        });
      });
  return Df(i, e, a);
}, Bf = (n, t) => ({ tr: e }) => (e.setMeta(n, t), !0), Hf = (n, t = {}) => ({ state: e, dispatch: i, chain: s }) => {
  const r = tt(n, e.schema);
  let o;
  return e.selection.$anchor.sameParent(e.selection.$head) && (o = e.selection.$anchor.parent.attrs), r.isTextblock ? s().command(({ commands: l }) => ml(r, { ...o, ...t })(e) ? !0 : l.clearNodes()).command(({ state: l }) => ml(r, { ...o, ...t })(l, i)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, $f = (n) => ({ tr: t, dispatch: e }) => {
  if (e) {
    const { doc: i } = t, s = we(n, 0, i.content.size), r = _.create(i, s);
    t.setSelection(r);
  }
  return !0;
}, zf = (n) => ({ tr: t, dispatch: e }) => {
  if (e) {
    const { doc: i } = t, { from: s, to: r } = typeof n == "number" ? { from: n, to: n } : n, o = T.atStart(i).from, l = T.atEnd(i).to, a = we(s, o, l), c = we(r, o, l), d = T.create(i, a, c);
    t.setSelection(d);
  }
  return !0;
}, qf = (n) => ({ state: t, dispatch: e }) => {
  const i = tt(n, t.schema);
  return bh(i)(t, e);
};
function Cl(n, t) {
  const e = n.storedMarks || n.selection.$to.parentOffset && n.selection.$from.marks();
  if (e) {
    const i = e.filter((s) => t == null ? void 0 : t.includes(s.type.name));
    n.tr.ensureMarks(i);
  }
}
const Ff = ({ keepMarks: n = !0 } = {}) => ({ tr: t, state: e, dispatch: i, editor: s }) => {
  const { selection: r, doc: o } = t, { $from: l, $to: a } = r, c = s.extensionManager.attributes, d = ii(c, l.node().type.name, l.node().attrs);
  if (r instanceof _ && r.node.isBlock)
    return !l.parentOffset || !Ut(o, l.pos) ? !1 : (i && (n && Cl(e, s.extensionManager.splittableMarks), t.split(l.pos).scrollIntoView()), !0);
  if (!l.parent.isBlock)
    return !1;
  const u = a.parentOffset === a.parent.content.size, p = l.depth === 0 ? void 0 : Ef(l.node(-1).contentMatchAt(l.indexAfter(-1)));
  let h = u && p ? [
    {
      type: p,
      attrs: d
    }
  ] : void 0, f = Ut(t.doc, t.mapping.map(l.pos), 1, h);
  if (!h && !f && Ut(t.doc, t.mapping.map(l.pos), 1, p ? [{ type: p }] : void 0) && (f = !0, h = p ? [
    {
      type: p,
      attrs: d
    }
  ] : void 0), i) {
    if (f && (r instanceof T && t.deleteSelection(), t.split(t.mapping.map(l.pos), 1, h), p && !u && !l.parentOffset && l.parent.type !== p)) {
      const g = t.mapping.map(l.before()), m = t.doc.resolve(g);
      l.node(-1).canReplaceWith(m.index(), m.index() + 1, p) && t.setNodeMarkup(t.mapping.map(l.before()), p);
    }
    n && Cl(e, s.extensionManager.splittableMarks), t.scrollIntoView();
  }
  return f;
}, Vf = (n, t = {}) => ({ tr: e, state: i, dispatch: s, editor: r }) => {
  var o;
  const l = tt(n, i.schema), { $from: a, $to: c } = i.selection, d = i.selection.node;
  if (d && d.isBlock || a.depth < 2 || !a.sameParent(c))
    return !1;
  const u = a.node(-1);
  if (u.type !== l)
    return !1;
  const p = r.extensionManager.attributes;
  if (a.parent.content.size === 0 && a.node(-1).childCount === a.indexAfter(-1)) {
    if (a.depth === 2 || a.node(-3).type !== l || a.index(-2) !== a.node(-2).childCount - 1)
      return !1;
    if (s) {
      let b = v.empty;
      const y = a.index(-1) ? 1 : a.index(-2) ? 2 : 3;
      for (let A = a.depth - y; A >= a.depth - 3; A -= 1)
        b = v.from(a.node(A).copy(b));
      const w = a.indexAfter(-1) < a.node(-2).childCount ? 1 : a.indexAfter(-2) < a.node(-3).childCount ? 2 : 3, M = {
        ...ii(p, a.node().type.name, a.node().attrs),
        ...t
      }, x = ((o = l.contentMatch.defaultType) === null || o === void 0 ? void 0 : o.createAndFill(M)) || void 0;
      b = b.append(v.from(l.createAndFill(null, x) || void 0));
      const N = a.before(a.depth - (y - 1));
      e.replace(N, a.after(-w), new C(b, 4 - y, 0));
      let S = -1;
      e.doc.nodesBetween(N, e.doc.content.size, (A, I) => {
        if (S > -1)
          return !1;
        A.isTextblock && A.content.size === 0 && (S = I + 1);
      }), S > -1 && e.setSelection(T.near(e.doc.resolve(S))), e.scrollIntoView();
    }
    return !0;
  }
  const h = c.pos === a.end() ? u.contentMatchAt(0).defaultType : null, f = {
    ...ii(p, u.type.name, u.attrs),
    ...t
  }, g = {
    ...ii(p, a.node().type.name, a.node().attrs),
    ...t
  };
  e.delete(a.pos, c.pos);
  const m = h ? [
    { type: l, attrs: f },
    { type: h, attrs: g }
  ] : [{ type: l, attrs: f }];
  if (!Ut(e.doc, a.pos, 2))
    return !1;
  if (s) {
    const { selection: b, storedMarks: y } = i, { splittableMarks: w } = r.extensionManager, M = y || b.$to.parentOffset && b.$from.marks();
    if (e.split(a.pos, 2, m).scrollIntoView(), !M || !s)
      return !0;
    const x = M.filter((N) => w.includes(N.type.name));
    e.ensureMarks(x);
  }
  return !0;
}, Is = (n, t) => {
  const e = no((o) => o.type === t)(n.selection);
  if (!e)
    return !0;
  const i = n.doc.resolve(Math.max(0, e.pos - 1)).before(e.depth);
  if (i === void 0)
    return !0;
  const s = n.doc.nodeAt(i);
  return e.node.type === (s == null ? void 0 : s.type) && ue(n.doc, e.pos) && n.join(e.pos), !0;
}, Ds = (n, t) => {
  const e = no((o) => o.type === t)(n.selection);
  if (!e)
    return !0;
  const i = n.doc.resolve(e.start).after(e.depth);
  if (i === void 0)
    return !0;
  const s = n.doc.nodeAt(i);
  return e.node.type === (s == null ? void 0 : s.type) && ue(n.doc, i) && n.join(i), !0;
}, jf = (n, t, e, i = {}) => ({ editor: s, tr: r, state: o, dispatch: l, chain: a, commands: c, can: d }) => {
  const { extensions: u, splittableMarks: p } = s.extensionManager, h = tt(n, o.schema), f = tt(t, o.schema), { selection: g, storedMarks: m } = o, { $from: b, $to: y } = g, w = b.blockRange(y), M = m || g.$to.parentOffset && g.$from.marks();
  if (!w)
    return !1;
  const x = no((N) => xl(N.type.name, u))(g);
  if (w.depth >= 1 && x && w.depth - x.depth <= 1) {
    if (x.node.type === h)
      return c.liftListItem(f);
    if (xl(x.node.type.name, u) && h.validContent(x.node.content) && l)
      return a().command(() => (r.setNodeMarkup(x.pos, h), !0)).command(() => Is(r, h)).command(() => Ds(r, h)).run();
  }
  return !e || !M || !l ? a().command(() => d().wrapInList(h, i) ? !0 : c.clearNodes()).wrapInList(h, i).command(() => Is(r, h)).command(() => Ds(r, h)).run() : a().command(() => {
    const N = d().wrapInList(h, i), S = M.filter((A) => p.includes(A.type.name));
    return r.ensureMarks(S), N ? !0 : c.clearNodes();
  }).wrapInList(h, i).command(() => Is(r, h)).command(() => Ds(r, h)).run();
}, Uf = (n, t = {}, e = {}) => ({ state: i, commands: s }) => {
  const { extendEmptyMarkRange: r = !1 } = e, o = he(n, i.schema);
  return pr(i, o, t) ? s.unsetMark(o, { extendEmptyMarkRange: r }) : s.setMark(o, t);
}, Wf = (n, t, e = {}) => ({ state: i, commands: s }) => {
  const r = tt(n, i.schema), o = tt(t, i.schema), l = Tn(i, r, e);
  let a;
  return i.selection.$anchor.sameParent(i.selection.$head) && (a = i.selection.$anchor.parent.attrs), l ? s.setNode(o, a) : s.setNode(r, { ...a, ...e });
}, Kf = (n, t = {}) => ({ state: e, commands: i }) => {
  const s = tt(n, e.schema);
  return Tn(e, s, t) ? i.lift(s) : i.wrapIn(s, t);
}, Jf = () => ({ state: n, dispatch: t }) => {
  const e = n.plugins;
  for (let i = 0; i < e.length; i += 1) {
    const s = e[i];
    let r;
    if (s.spec.isInputRules && (r = s.getState(n))) {
      if (t) {
        const o = n.tr, l = r.transform;
        for (let a = l.steps.length - 1; a >= 0; a -= 1)
          o.step(l.steps[a].invert(l.docs[a]));
        if (r.text) {
          const a = o.doc.resolve(r.from).marks();
          o.replaceWith(r.from, r.to, n.schema.text(r.text, a));
        } else
          o.delete(r.from, r.to);
      }
      return !0;
    }
  }
  return !1;
}, Gf = () => ({ tr: n, dispatch: t }) => {
  const { selection: e } = n, { empty: i, ranges: s } = e;
  return i || t && s.forEach((r) => {
    n.removeMark(r.$from.pos, r.$to.pos);
  }), !0;
}, Yf = (n, t = {}) => ({ tr: e, state: i, dispatch: s }) => {
  var r;
  const { extendEmptyMarkRange: o = !1 } = t, { selection: l } = e, a = he(n, i.schema), { $from: c, empty: d, ranges: u } = l;
  if (!s)
    return !0;
  if (d && o) {
    let { from: p, to: h } = l;
    const f = (r = c.marks().find((m) => m.type === a)) === null || r === void 0 ? void 0 : r.attrs, g = eo(c, a, f);
    g && (p = g.from, h = g.to), e.removeMark(p, h, a);
  } else
    u.forEach((p) => {
      e.removeMark(p.$from.pos, p.$to.pos, a);
    });
  return e.removeStoredMark(a), !0;
}, Xf = (n, t = {}) => ({ tr: e, state: i, dispatch: s }) => {
  let r = null, o = null;
  const l = us(typeof n == "string" ? n : n.name, i.schema);
  return l ? (l === "node" && (r = tt(n, i.schema)), l === "mark" && (o = he(n, i.schema)), s && e.selection.ranges.forEach((a) => {
    const c = a.$from.pos, d = a.$to.pos;
    let u, p, h, f;
    e.selection.empty ? i.doc.nodesBetween(c, d, (g, m) => {
      r && r === g.type && (h = Math.max(m, c), f = Math.min(m + g.nodeSize, d), u = m, p = g);
    }) : i.doc.nodesBetween(c, d, (g, m) => {
      m < c && r && r === g.type && (h = Math.max(m, c), f = Math.min(m + g.nodeSize, d), u = m, p = g), m >= c && m <= d && (r && r === g.type && e.setNodeMarkup(m, void 0, {
        ...g.attrs,
        ...t
      }), o && g.marks.length && g.marks.forEach((b) => {
        if (o === b.type) {
          const y = Math.max(m, c), w = Math.min(m + g.nodeSize, d);
          e.addMark(y, w, o.create({
            ...b.attrs,
            ...t
          }));
        }
      }));
    }), p && (u !== void 0 && e.setNodeMarkup(u, void 0, {
      ...p.attrs,
      ...t
    }), o && p.marks.length && p.marks.forEach((g) => {
      o === g.type && e.addMark(h, f, o.create({
        ...g.attrs,
        ...t
      }));
    }));
  }), !0) : !1;
}, Qf = (n, t = {}) => ({ state: e, dispatch: i }) => {
  const s = tt(n, e.schema);
  return dh(s, t)(e, i);
}, Zf = (n, t = {}) => ({ state: e, dispatch: i }) => {
  const s = tt(n, e.schema);
  return uh(s, t)(e, i);
};
var tm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: Ih,
  clearContent: Dh,
  clearNodes: Ph,
  command: Bh,
  createParagraphNear: Hh,
  cut: $h,
  deleteCurrentNode: zh,
  deleteNode: qh,
  deleteRange: Fh,
  deleteSelection: Vh,
  enter: jh,
  exitCode: Uh,
  extendMarkRange: Wh,
  first: Kh,
  focus: Gh,
  forEach: Yh,
  insertContent: Xh,
  insertContentAt: tf,
  joinBackward: sf,
  joinDown: nf,
  joinForward: rf,
  joinItemBackward: of,
  joinItemForward: lf,
  joinTextblockBackward: af,
  joinTextblockForward: cf,
  joinUp: ef,
  keyboardShortcut: uf,
  lift: pf,
  liftEmptyBlock: hf,
  liftListItem: ff,
  newlineInCode: mf,
  resetAttributes: gf,
  scrollIntoView: bf,
  selectAll: yf,
  selectNodeBackward: vf,
  selectNodeForward: wf,
  selectParentNode: kf,
  selectTextblockEnd: xf,
  selectTextblockStart: Cf,
  setContent: Sf,
  setMark: Pf,
  setMeta: Bf,
  setNode: Hf,
  setNodeSelection: $f,
  setTextSelection: zf,
  sinkListItem: qf,
  splitBlock: Ff,
  splitListItem: Vf,
  toggleList: jf,
  toggleMark: Uf,
  toggleNode: Wf,
  toggleWrap: Kf,
  undoInputRule: Jf,
  unsetAllMarks: Gf,
  unsetMark: Yf,
  updateAttributes: Xf,
  wrapIn: Qf,
  wrapInList: Zf
});
const em = K.create({
  name: "commands",
  addCommands() {
    return {
      ...tm
    };
  }
}), nm = K.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new V({
        key: new J("tiptapDrop"),
        props: {
          handleDrop: (n, t, e, i) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: t,
              slice: e,
              moved: i
            });
          }
        }
      })
    ];
  }
}), im = K.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new V({
        key: new J("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
}), sm = new J("focusEvents"), rm = K.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: n } = this;
    return [
      new V({
        key: sm,
        props: {
          handleDOMEvents: {
            focus: (t, e) => {
              n.isFocused = !0;
              const i = n.state.tr.setMeta("focus", { event: e }).setMeta("addToHistory", !1);
              return t.dispatch(i), !1;
            },
            blur: (t, e) => {
              n.isFocused = !1;
              const i = n.state.tr.setMeta("blur", { event: e }).setMeta("addToHistory", !1);
              return t.dispatch(i), !1;
            }
          }
        }
      })
    ];
  }
}), om = K.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const n = () => this.editor.commands.first(({ commands: o }) => [
      () => o.undoInputRule(),
      // maybe convert first text block node to default node
      () => o.command(({ tr: l }) => {
        const { selection: a, doc: c } = l, { empty: d, $anchor: u } = a, { pos: p, parent: h } = u, f = u.parent.isTextblock && p > 0 ? l.doc.resolve(p - 1) : u, g = f.parent.type.spec.isolating, m = u.pos - u.parentOffset, b = g && f.parent.childCount === 1 ? m === u.pos : L.atStart(c).from === p;
        return !d || !h.type.isTextblock || h.textContent.length || !b || b && u.parent.type.name === "paragraph" ? !1 : o.clearNodes();
      }),
      () => o.deleteSelection(),
      () => o.joinBackward(),
      () => o.selectNodeBackward()
    ]), t = () => this.editor.commands.first(({ commands: o }) => [
      () => o.deleteSelection(),
      () => o.deleteCurrentNode(),
      () => o.joinForward(),
      () => o.selectNodeForward()
    ]), i = {
      Enter: () => this.editor.commands.first(({ commands: o }) => [
        () => o.newlineInCode(),
        () => o.createParagraphNear(),
        () => o.liftEmptyBlock(),
        () => o.splitBlock()
      ]),
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: n,
      "Mod-Backspace": n,
      "Shift-Backspace": n,
      Delete: t,
      "Mod-Delete": t,
      "Mod-a": () => this.editor.commands.selectAll()
    }, s = {
      ...i
    }, r = {
      ...i,
      "Ctrl-h": n,
      "Alt-Backspace": n,
      "Ctrl-d": t,
      "Ctrl-Alt-Backspace": t,
      "Alt-Delete": t,
      "Alt-d": t,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return ki() || Bc() ? r : s;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new V({
        key: new J("clearDocument"),
        appendTransaction: (n, t, e) => {
          if (n.some((g) => g.getMeta("composition")))
            return;
          const i = n.some((g) => g.docChanged) && !t.doc.eq(e.doc), s = n.some((g) => g.getMeta("preventClearDocument"));
          if (!i || s)
            return;
          const { empty: r, from: o, to: l } = t.selection, a = L.atStart(t.doc).from, c = L.atEnd(t.doc).to;
          if (r || !(o === a && l === c) || !ps(e.doc))
            return;
          const p = e.tr, h = rs({
            state: e,
            transaction: p
          }), { commands: f } = new ls({
            editor: this.editor,
            state: h
          });
          if (f.clearNodes(), !!p.steps.length)
            return p;
        }
      })
    ];
  }
}), lm = K.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new V({
        key: new J("tiptapPaste"),
        props: {
          handlePaste: (n, t, e) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: t,
              slice: e
            });
          }
        }
      })
    ];
  }
}), am = K.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new V({
        key: new J("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
class be {
  get name() {
    return this.node.type.name;
  }
  constructor(t, e, i = !1, s = null) {
    this.currentNode = null, this.actualDepth = null, this.isBlock = i, this.resolvedPos = t, this.editor = e, this.currentNode = s;
  }
  get node() {
    return this.currentNode || this.resolvedPos.node();
  }
  get element() {
    return this.editor.view.domAtPos(this.pos).node;
  }
  get depth() {
    var t;
    return (t = this.actualDepth) !== null && t !== void 0 ? t : this.resolvedPos.depth;
  }
  get pos() {
    return this.resolvedPos.pos;
  }
  get content() {
    return this.node.content;
  }
  set content(t) {
    let e = this.from, i = this.to;
    if (this.isBlock) {
      if (this.content.size === 0) {
        console.error(`You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`);
        return;
      }
      e = this.from + 1, i = this.to - 1;
    }
    this.editor.commands.insertContentAt({ from: e, to: i }, t);
  }
  get attributes() {
    return this.node.attrs;
  }
  get textContent() {
    return this.node.textContent;
  }
  get size() {
    return this.node.nodeSize;
  }
  get from() {
    return this.isBlock ? this.pos : this.resolvedPos.start(this.resolvedPos.depth);
  }
  get range() {
    return {
      from: this.from,
      to: this.to
    };
  }
  get to() {
    return this.isBlock ? this.pos + this.size : this.resolvedPos.end(this.resolvedPos.depth) + (this.node.isText ? 0 : 1);
  }
  get parent() {
    if (this.depth === 0)
      return null;
    const t = this.resolvedPos.start(this.resolvedPos.depth - 1), e = this.resolvedPos.doc.resolve(t);
    return new be(e, this.editor);
  }
  get before() {
    let t = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2));
    return t.depth !== this.depth && (t = this.resolvedPos.doc.resolve(this.from - 3)), new be(t, this.editor);
  }
  get after() {
    let t = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1));
    return t.depth !== this.depth && (t = this.resolvedPos.doc.resolve(this.to + 3)), new be(t, this.editor);
  }
  get children() {
    const t = [];
    return this.node.content.forEach((e, i) => {
      const s = e.isBlock && !e.isTextblock, r = e.isAtom && !e.isText, o = this.pos + i + (r ? 0 : 1);
      if (o < 0 || o > this.resolvedPos.doc.nodeSize - 2)
        return;
      const l = this.resolvedPos.doc.resolve(o);
      if (!s && l.depth <= this.depth)
        return;
      const a = new be(l, this.editor, s, s ? e : null);
      s && (a.actualDepth = this.depth + 1), t.push(new be(l, this.editor, s, s ? e : null));
    }), t;
  }
  get firstChild() {
    return this.children[0] || null;
  }
  get lastChild() {
    const t = this.children;
    return t[t.length - 1] || null;
  }
  closest(t, e = {}) {
    let i = null, s = this.parent;
    for (; s && !i; ) {
      if (s.node.type.name === t)
        if (Object.keys(e).length > 0) {
          const r = s.node.attrs, o = Object.keys(e);
          for (let l = 0; l < o.length; l += 1) {
            const a = o[l];
            if (r[a] !== e[a])
              break;
          }
        } else
          i = s;
      s = s.parent;
    }
    return i;
  }
  querySelector(t, e = {}) {
    return this.querySelectorAll(t, e, !0)[0] || null;
  }
  querySelectorAll(t, e = {}, i = !1) {
    let s = [];
    if (!this.children || this.children.length === 0)
      return s;
    const r = Object.keys(e);
    return this.children.forEach((o) => {
      i && s.length > 0 || (o.node.type.name === t && r.every((a) => e[a] === o.node.attrs[a]) && s.push(o), !(i && s.length > 0) && (s = s.concat(o.querySelectorAll(t, e, i))));
    }), s;
  }
  setAttribute(t) {
    const { tr: e } = this.editor.state;
    e.setNodeMarkup(this.from, void 0, {
      ...this.node.attrs,
      ...t
    }), this.editor.view.dispatch(e);
  }
}
const cm = `.ProseMirror {
  position: relative;
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror [contenteditable="false"] {
  white-space: normal;
}

.ProseMirror [contenteditable="false"] [contenteditable="true"] {
  white-space: pre-wrap;
}

.ProseMirror pre {
  white-space: pre-wrap;
}

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: absolute;
  margin: 0;
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 1px solid black;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}

.ProseMirror-hideselection *::selection {
  background: transparent;
}

.ProseMirror-hideselection *::-moz-selection {
  background: transparent;
}

.ProseMirror-hideselection * {
  caret-color: transparent;
}

.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}

.tippy-box[data-animation=fade][data-state=hidden] {
  opacity: 0
}`;
function dm(n, t, e) {
  const i = document.querySelector("style[data-tiptap-style]");
  if (i !== null)
    return i;
  const s = document.createElement("style");
  return t && s.setAttribute("nonce", t), s.setAttribute("data-tiptap-style", ""), s.innerHTML = n, document.getElementsByTagName("head")[0].appendChild(s), s;
}
class um extends yh {
  constructor(t = {}) {
    super(), this.isFocused = !1, this.isInitialized = !1, this.extensionStorage = {}, this.options = {
      element: document.createElement("div"),
      content: "",
      injectCSS: !0,
      injectNonce: void 0,
      extensions: [],
      autofocus: !1,
      editable: !0,
      editorProps: {},
      parseOptions: {},
      coreExtensionOptions: {},
      enableInputRules: !0,
      enablePasteRules: !0,
      enableCoreExtensions: !0,
      enableContentCheck: !1,
      emitContentError: !1,
      onBeforeCreate: () => null,
      onCreate: () => null,
      onUpdate: () => null,
      onSelectionUpdate: () => null,
      onTransaction: () => null,
      onFocus: () => null,
      onBlur: () => null,
      onDestroy: () => null,
      onContentError: ({ error: e }) => {
        throw e;
      },
      onPaste: () => null,
      onDrop: () => null
    }, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.setOptions(t), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("contentError", this.options.onContentError), this.createView(), this.injectCSS(), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: e, slice: i, moved: s }) => this.options.onDrop(e, i, s)), this.on("paste", ({ event: e, slice: i }) => this.options.onPaste(e, i)), window.setTimeout(() => {
      this.isDestroyed || (this.commands.focus(this.options.autofocus), this.emit("create", { editor: this }), this.isInitialized = !0);
    }, 0);
  }
  /**
   * Returns the editor storage.
   */
  get storage() {
    return this.extensionStorage;
  }
  /**
   * An object of all registered commands.
   */
  get commands() {
    return this.commandManager.commands;
  }
  /**
   * Create a command chain to call multiple commands at once.
   */
  chain() {
    return this.commandManager.chain();
  }
  /**
   * Check if a command or a command chain can be executed. Without executing it.
   */
  can() {
    return this.commandManager.can();
  }
  /**
   * Inject CSS styles.
   */
  injectCSS() {
    this.options.injectCSS && document && (this.css = dm(cm, this.options.injectNonce));
  }
  /**
   * Update editor options.
   *
   * @param options A list of options
   */
  setOptions(t = {}) {
    this.options = {
      ...this.options,
      ...t
    }, !(!this.view || !this.state || this.isDestroyed) && (this.options.editorProps && this.view.setProps(this.options.editorProps), this.view.updateState(this.state));
  }
  /**
   * Update editable state of the editor.
   */
  setEditable(t, e = !0) {
    this.setOptions({ editable: t }), e && this.emit("update", { editor: this, transaction: this.state.tr });
  }
  /**
   * Returns whether the editor is editable.
   */
  get isEditable() {
    return this.options.editable && this.view && this.view.editable;
  }
  /**
   * Returns the editor state.
   */
  get state() {
    return this.view.state;
  }
  /**
   * Register a ProseMirror plugin.
   *
   * @param plugin A ProseMirror plugin
   * @param handlePlugins Control how to merge the plugin into the existing plugins.
   * @returns The new editor state
   */
  registerPlugin(t, e) {
    const i = Lc(e) ? e(t, [...this.state.plugins]) : [...this.state.plugins, t], s = this.state.reconfigure({ plugins: i });
    return this.view.updateState(s), s;
  }
  /**
   * Unregister a ProseMirror plugin.
   *
   * @param nameOrPluginKeyToRemove The plugins name
   * @returns The new editor state or undefined if the editor is destroyed
   */
  unregisterPlugin(t) {
    if (this.isDestroyed)
      return;
    const e = this.state.plugins;
    let i = e;
    if ([].concat(t).forEach((r) => {
      const o = typeof r == "string" ? `${r}$` : r.key;
      i = i.filter((l) => !l.key.startsWith(o));
    }), e.length === i.length)
      return;
    const s = this.state.reconfigure({
      plugins: i
    });
    return this.view.updateState(s), s;
  }
  /**
   * Creates an extension manager.
   */
  createExtensionManager() {
    var t, e;
    const s = [...this.options.enableCoreExtensions ? [
      im,
      Rh.configure({
        blockSeparator: (e = (t = this.options.coreExtensionOptions) === null || t === void 0 ? void 0 : t.clipboardTextSerializer) === null || e === void 0 ? void 0 : e.blockSeparator
      }),
      em,
      rm,
      om,
      am,
      nm,
      lm
    ].filter((r) => typeof this.options.enableCoreExtensions == "object" ? this.options.enableCoreExtensions[r.name] !== !1 : !0) : [], ...this.options.extensions].filter((r) => ["extension", "node", "mark"].includes(r == null ? void 0 : r.type));
    this.extensionManager = new je(s, this);
  }
  /**
   * Creates an command manager.
   */
  createCommandManager() {
    this.commandManager = new ls({
      editor: this
    });
  }
  /**
   * Creates a ProseMirror schema.
   */
  createSchema() {
    this.schema = this.extensionManager.schema;
  }
  /**
   * Creates a ProseMirror view.
   */
  createView() {
    var t;
    let e;
    try {
      e = ur(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: this.options.enableContentCheck });
    } catch (o) {
      if (!(o instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(o.message))
        throw o;
      this.emit("contentError", {
        editor: this,
        error: o,
        disableCollaboration: () => {
          this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((l) => l.name !== "collaboration"), this.createExtensionManager();
        }
      }), e = ur(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: !1 });
    }
    const i = Dc(e, this.options.autofocus);
    this.view = new gc(this.options.element, {
      ...this.options.editorProps,
      attributes: {
        // add `role="textbox"` to the editor element
        role: "textbox",
        ...(t = this.options.editorProps) === null || t === void 0 ? void 0 : t.attributes
      },
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: Ve.create({
        doc: e,
        selection: i || void 0
      })
    });
    const s = this.state.reconfigure({
      plugins: this.extensionManager.plugins
    });
    this.view.updateState(s), this.createNodeViews(), this.prependClass();
    const r = this.view.dom;
    r.editor = this;
  }
  /**
   * Creates all node views.
   */
  createNodeViews() {
    this.view.isDestroyed || this.view.setProps({
      nodeViews: this.extensionManager.nodeViews
    });
  }
  /**
   * Prepend class name to element.
   */
  prependClass() {
    this.view.dom.className = `tiptap ${this.view.dom.className}`;
  }
  captureTransaction(t) {
    this.isCapturingTransaction = !0, t(), this.isCapturingTransaction = !1;
    const e = this.capturedTransaction;
    return this.capturedTransaction = null, e;
  }
  /**
   * The callback over which to send transactions (state updates) produced by the view.
   *
   * @param transaction An editor state transaction
   */
  dispatchTransaction(t) {
    if (this.view.isDestroyed)
      return;
    if (this.isCapturingTransaction) {
      if (!this.capturedTransaction) {
        this.capturedTransaction = t;
        return;
      }
      t.steps.forEach((o) => {
        var l;
        return (l = this.capturedTransaction) === null || l === void 0 ? void 0 : l.step(o);
      });
      return;
    }
    const e = this.state.apply(t), i = !this.state.selection.eq(e.selection);
    this.emit("beforeTransaction", {
      editor: this,
      transaction: t,
      nextState: e
    }), this.view.updateState(e), this.emit("transaction", {
      editor: this,
      transaction: t
    }), i && this.emit("selectionUpdate", {
      editor: this,
      transaction: t
    });
    const s = t.getMeta("focus"), r = t.getMeta("blur");
    s && this.emit("focus", {
      editor: this,
      event: s.event,
      transaction: t
    }), r && this.emit("blur", {
      editor: this,
      event: r.event,
      transaction: t
    }), !(!t.docChanged || t.getMeta("preventUpdate")) && this.emit("update", {
      editor: this,
      transaction: t
    });
  }
  /**
   * Get attributes of the currently selected node or mark.
   */
  getAttributes(t) {
    return zc(this.state, t);
  }
  isActive(t, e) {
    const i = typeof t == "string" ? t : null, s = typeof t == "string" ? e : t;
    return Rf(this.state, i, s);
  }
  /**
   * Get the document as JSON.
   */
  getJSON() {
    return this.state.doc.toJSON();
  }
  /**
   * Get the document as HTML.
   */
  getHTML() {
    return Zr(this.state.doc.content, this.schema);
  }
  /**
   * Get the document as text.
   */
  getText(t) {
    const { blockSeparator: e = `

`, textSerializers: i = {} } = t || {};
    return Tf(this.state.doc, {
      blockSeparator: e,
      textSerializers: {
        ...Oc(this.schema),
        ...i
      }
    });
  }
  /**
   * Check if there is no content.
   */
  get isEmpty() {
    return ps(this.state.doc);
  }
  /**
   * Get the number of characters for the current document.
   *
   * @deprecated
   */
  getCharacterCount() {
    return console.warn('[tiptap warn]: "editor.getCharacterCount()" is deprecated. Please use "editor.storage.characterCount.characters()" instead.'), this.state.doc.content.size - 2;
  }
  /**
   * Destroy the editor.
   */
  destroy() {
    if (this.emit("destroy"), this.view) {
      const t = this.view.dom;
      t && t.editor && delete t.editor, this.view.destroy();
    }
    this.removeAllListeners();
  }
  /**
   * Check if the editor is already destroyed.
   */
  get isDestroyed() {
    var t;
    return !(!((t = this.view) === null || t === void 0) && t.docView);
  }
  $node(t, e) {
    var i;
    return ((i = this.$doc) === null || i === void 0 ? void 0 : i.querySelector(t, e)) || null;
  }
  $nodes(t, e) {
    var i;
    return ((i = this.$doc) === null || i === void 0 ? void 0 : i.querySelectorAll(t, e)) || null;
  }
  $pos(t) {
    const e = this.state.doc.resolve(t);
    return new be(e, this);
  }
  get $doc() {
    return this.$pos(0);
  }
}
function Ne(n) {
  return new cs({
    find: n.find,
    handler: ({ state: t, range: e, match: i }) => {
      const s = R(n.getAttributes, void 0, i);
      if (s === !1 || s === null)
        return null;
      const { tr: r } = t, o = i[i.length - 1], l = i[0];
      if (o) {
        const a = l.search(/\S/), c = e.from + l.indexOf(o), d = c + o.length;
        if (io(e.from, e.to, t.doc).filter((h) => h.mark.type.excluded.find((g) => g === n.type && g !== h.mark.type)).filter((h) => h.to > c).length)
          return null;
        d < e.to && r.delete(d, e.to), c > e.from && r.delete(e.from + a, c);
        const p = e.from + a + o.length;
        r.addMark(e.from + a, p, n.type.create(s || {})), r.removeStoredMark(n.type);
      }
    }
  });
}
function pm(n) {
  return new cs({
    find: n.find,
    handler: ({ state: t, range: e, match: i }) => {
      const s = R(n.getAttributes, void 0, i) || {}, { tr: r } = t, o = e.from;
      let l = e.to;
      const a = n.type.create(s);
      if (i[1]) {
        const c = i[0].lastIndexOf(i[1]);
        let d = o + c;
        d > l ? d = l : l = d + i[1].length;
        const u = i[0][i[0].length - 1];
        r.insertText(u, o + i[0].length - 1), r.replaceWith(d, l, a);
      } else if (i[0]) {
        const c = n.type.isInline ? o : o - 1;
        r.insert(c, n.type.create(s)).delete(r.mapping.map(o), r.mapping.map(l));
      }
      r.scrollIntoView();
    }
  });
}
function hr(n) {
  return new cs({
    find: n.find,
    handler: ({ state: t, range: e, match: i }) => {
      const s = t.doc.resolve(e.from), r = R(n.getAttributes, void 0, i) || {};
      if (!s.node(-1).canReplaceWith(s.index(-1), s.indexAfter(-1), n.type))
        return null;
      t.tr.delete(e.from, e.to).setBlockType(e.from, e.from, n.type, r);
    }
  });
}
function An(n) {
  return new cs({
    find: n.find,
    handler: ({ state: t, range: e, match: i, chain: s }) => {
      const r = R(n.getAttributes, void 0, i) || {}, o = t.tr.delete(e.from, e.to), a = o.doc.resolve(e.from).blockRange(), c = a && Dr(a, n.type, r);
      if (!c)
        return null;
      if (o.wrap(a, c), n.keepMarks && n.editor) {
        const { selection: u, storedMarks: p } = t, { splittableMarks: h } = n.editor.extensionManager, f = p || u.$to.parentOffset && u.$from.marks();
        if (f) {
          const g = f.filter((m) => h.includes(m.type.name));
          o.ensureMarks(g);
        }
      }
      if (n.keepAttributes) {
        const u = n.type.name === "bulletList" || n.type.name === "orderedList" ? "listItem" : "taskList";
        s().updateAttributes(u, r).run();
      }
      const d = o.doc.resolve(e.from - 1).nodeBefore;
      d && d.type === n.type && ue(o.doc, e.from - 1) && (!n.joinPredicate || n.joinPredicate(i, d)) && o.join(e.from - 1);
    }
  });
}
class H {
  constructor(t = {}) {
    this.type = "node", this.name = "node", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...t
    }, this.name = this.config.name, t.defaultOptions && Object.keys(t.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = R(E(this, "addOptions", {
      name: this.name
    }))), this.storage = R(E(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(t = {}) {
    return new H(t);
  }
  configure(t = {}) {
    const e = this.extend({
      ...this.config,
      addOptions: () => ds(this.options, t)
    });
    return e.name = this.name, e.parent = this.parent, e;
  }
  extend(t = {}) {
    const e = new H(t);
    return e.parent = this, this.child = e, e.name = t.name ? t.name : e.parent.name, t.defaultOptions && Object.keys(t.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${e.name}".`), e.options = R(E(e, "addOptions", {
      name: e.name
    })), e.storage = R(E(e, "addStorage", {
      name: e.name,
      options: e.options
    })), e;
  }
}
function de(n) {
  return new _h({
    find: n.find,
    handler: ({ state: t, range: e, match: i, pasteEvent: s }) => {
      const r = R(n.getAttributes, void 0, i, s);
      if (r === !1 || r === null)
        return null;
      const { tr: o } = t, l = i[i.length - 1], a = i[0];
      let c = e.to;
      if (l) {
        const d = a.search(/\S/), u = e.from + a.indexOf(l), p = u + l.length;
        if (io(e.from, e.to, t.doc).filter((f) => f.mark.type.excluded.find((m) => m === n.type && m !== f.mark.type)).filter((f) => f.to > u).length)
          return null;
        p < e.to && o.delete(p, e.to), u > e.from && o.delete(e.from + d, u), c = e.from + d + l.length, o.addMark(e.from + d, c, n.type.create(r || {})), o.removeStoredMark(n.type);
      }
    }
  });
}
function hm(n, t) {
  const { selection: e } = n, { $from: i } = e;
  if (e instanceof _) {
    const r = i.index();
    return i.parent.canReplaceWith(r, r + 1, t);
  }
  let s = i.depth;
  for (; s >= 0; ) {
    const r = i.index(s);
    if (i.node(s).contentMatchAt(r).matchType(t))
      return !0;
    s -= 1;
  }
  return !1;
}
function fm(n) {
  return n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
const mm = /^\s*>\s$/, gm = H.create({
  name: "blockquote",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "block+",
  group: "block",
  defining: !0,
  parseHTML() {
    return [
      { tag: "blockquote" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["blockquote", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setBlockquote: () => ({ commands: n }) => n.wrapIn(this.name),
      toggleBlockquote: () => ({ commands: n }) => n.toggleWrap(this.name),
      unsetBlockquote: () => ({ commands: n }) => n.lift(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-b": () => this.editor.commands.toggleBlockquote()
    };
  },
  addInputRules() {
    return [
      An({
        find: mm,
        type: this.type
      })
    ];
  }
}), bm = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/, ym = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g, vm = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/, wm = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g, km = gt.create({
  name: "bold",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "strong"
      },
      {
        tag: "b",
        getAttrs: (n) => n.style.fontWeight !== "normal" && null
      },
      {
        style: "font-weight=400",
        clearMark: (n) => n.type.name === this.name
      },
      {
        style: "font-weight",
        getAttrs: (n) => /^(bold(er)?|[5-9]\d{2,})$/.test(n) && null
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["strong", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setBold: () => ({ commands: n }) => n.setMark(this.name),
      toggleBold: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetBold: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-b": () => this.editor.commands.toggleBold(),
      "Mod-B": () => this.editor.commands.toggleBold()
    };
  },
  addInputRules() {
    return [
      Ne({
        find: bm,
        type: this.type
      }),
      Ne({
        find: vm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      de({
        find: ym,
        type: this.type
      }),
      de({
        find: wm,
        type: this.type
      })
    ];
  }
}), xm = "listItem", Sl = "textStyle", Ml = /^\s*([-+*])\s$/, Cm = H.create({
  name: "bulletList",
  addOptions() {
    return {
      itemTypeName: "listItem",
      HTMLAttributes: {},
      keepMarks: !1,
      keepAttributes: !1
    };
  },
  group: "block list",
  content() {
    return `${this.options.itemTypeName}+`;
  },
  parseHTML() {
    return [
      { tag: "ul" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["ul", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      toggleBulletList: () => ({ commands: n, chain: t }) => this.options.keepAttributes ? t().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(xm, this.editor.getAttributes(Sl)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor.commands.toggleBulletList()
    };
  },
  addInputRules() {
    let n = An({
      find: Ml,
      type: this.type
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = An({
      find: Ml,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: () => this.editor.getAttributes(Sl),
      editor: this.editor
    })), [
      n
    ];
  }
}), Sm = /(^|[^`])`([^`]+)`(?!`)/, Mm = /(^|[^`])`([^`]+)`(?!`)/g, Em = gt.create({
  name: "code",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  excludes: "_",
  code: !0,
  exitable: !0,
  parseHTML() {
    return [
      { tag: "code" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["code", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setCode: () => ({ commands: n }) => n.setMark(this.name),
      toggleCode: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetCode: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-e": () => this.editor.commands.toggleCode()
    };
  },
  addInputRules() {
    return [
      Ne({
        find: Sm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      de({
        find: Mm,
        type: this.type
      })
    ];
  }
}), _m = /^```([a-z]+)?[\s\n]$/, Tm = /^~~~([a-z]+)?[\s\n]$/, Am = H.create({
  name: "codeBlock",
  addOptions() {
    return {
      languageClassPrefix: "language-",
      exitOnTripleEnter: !0,
      exitOnArrowDown: !0,
      defaultLanguage: null,
      HTMLAttributes: {}
    };
  },
  content: "text*",
  marks: "",
  group: "block",
  code: !0,
  defining: !0,
  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (n) => {
          var t;
          const { languageClassPrefix: e } = this.options, r = [...((t = n.firstElementChild) === null || t === void 0 ? void 0 : t.classList) || []].filter((o) => o.startsWith(e)).map((o) => o.replace(e, ""))[0];
          return r || null;
        },
        rendered: !1
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full"
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    return [
      "pre",
      D(this.options.HTMLAttributes, t),
      [
        "code",
        {
          class: n.attrs.language ? this.options.languageClassPrefix + n.attrs.language : null
        },
        0
      ]
    ];
  },
  addCommands() {
    return {
      setCodeBlock: (n) => ({ commands: t }) => t.setNode(this.name, n),
      toggleCodeBlock: (n) => ({ commands: t }) => t.toggleNode(this.name, "paragraph", n)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty: n, $anchor: t } = this.editor.state.selection, e = t.pos === 1;
        return !n || t.parent.type.name !== this.name ? !1 : e || !t.parent.textContent.length ? this.editor.commands.clearNodes() : !1;
      },
      // exit node on triple enter
      Enter: ({ editor: n }) => {
        if (!this.options.exitOnTripleEnter)
          return !1;
        const { state: t } = n, { selection: e } = t, { $from: i, empty: s } = e;
        if (!s || i.parent.type !== this.type)
          return !1;
        const r = i.parentOffset === i.parent.nodeSize - 2, o = i.parent.textContent.endsWith(`

`);
        return !r || !o ? !1 : n.chain().command(({ tr: l }) => (l.delete(i.pos - 2, i.pos), !0)).exitCode().run();
      },
      // exit node on arrow down
      ArrowDown: ({ editor: n }) => {
        if (!this.options.exitOnArrowDown)
          return !1;
        const { state: t } = n, { selection: e, doc: i } = t, { $from: s, empty: r } = e;
        if (!r || s.parent.type !== this.type || !(s.parentOffset === s.parent.nodeSize - 2))
          return !1;
        const l = s.after();
        return l === void 0 ? !1 : i.nodeAt(l) ? n.commands.command(({ tr: c }) => (c.setSelection(L.near(i.resolve(l))), !0)) : n.commands.exitCode();
      }
    };
  },
  addInputRules() {
    return [
      hr({
        find: _m,
        type: this.type,
        getAttributes: (n) => ({
          language: n[1]
        })
      }),
      hr({
        find: Tm,
        type: this.type,
        getAttributes: (n) => ({
          language: n[1]
        })
      })
    ];
  },
  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new V({
        key: new J("codeBlockVSCodeHandler"),
        props: {
          handlePaste: (n, t) => {
            if (!t.clipboardData || this.editor.isActive(this.type.name))
              return !1;
            const e = t.clipboardData.getData("text/plain"), i = t.clipboardData.getData("vscode-editor-data"), s = i ? JSON.parse(i) : void 0, r = s == null ? void 0 : s.mode;
            if (!e || !r)
              return !1;
            const { tr: o, schema: l } = n.state, a = l.text(e.replace(/\r\n?/g, `
`));
            return o.replaceSelectionWith(this.type.create({ language: r }, a)), o.selection.$from.parent.type !== this.type && o.setSelection(T.near(o.doc.resolve(Math.max(0, o.selection.from - 2)))), o.setMeta("paste", !0), n.dispatch(o), !0;
          }
        }
      })
    ];
  }
}), Lm = H.create({
  name: "doc",
  topNode: !0,
  content: "block+"
});
function Nm(n = {}) {
  return new V({
    view(t) {
      return new Om(t, n);
    }
  });
}
class Om {
  constructor(t, e) {
    var i;
    this.editorView = t, this.cursorPos = null, this.element = null, this.timeout = -1, this.width = (i = e.width) !== null && i !== void 0 ? i : 1, this.color = e.color === !1 ? void 0 : e.color || "black", this.class = e.class, this.handlers = ["dragover", "dragend", "drop", "dragleave"].map((s) => {
      let r = (o) => {
        this[s](o);
      };
      return t.dom.addEventListener(s, r), { name: s, handler: r };
    });
  }
  destroy() {
    this.handlers.forEach(({ name: t, handler: e }) => this.editorView.dom.removeEventListener(t, e));
  }
  update(t, e) {
    this.cursorPos != null && e.doc != t.state.doc && (this.cursorPos > t.state.doc.content.size ? this.setCursor(null) : this.updateOverlay());
  }
  setCursor(t) {
    t != this.cursorPos && (this.cursorPos = t, t == null ? (this.element.parentNode.removeChild(this.element), this.element = null) : this.updateOverlay());
  }
  updateOverlay() {
    let t = this.editorView.state.doc.resolve(this.cursorPos), e = !t.parent.inlineContent, i, s = this.editorView.dom, r = s.getBoundingClientRect(), o = r.width / s.offsetWidth, l = r.height / s.offsetHeight;
    if (e) {
      let u = t.nodeBefore, p = t.nodeAfter;
      if (u || p) {
        let h = this.editorView.nodeDOM(this.cursorPos - (u ? u.nodeSize : 0));
        if (h) {
          let f = h.getBoundingClientRect(), g = u ? f.bottom : f.top;
          u && p && (g = (g + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2);
          let m = this.width / 2 * l;
          i = { left: f.left, right: f.right, top: g - m, bottom: g + m };
        }
      }
    }
    if (!i) {
      let u = this.editorView.coordsAtPos(this.cursorPos), p = this.width / 2 * o;
      i = { left: u.left - p, right: u.left + p, top: u.top, bottom: u.bottom };
    }
    let a = this.editorView.dom.offsetParent;
    this.element || (this.element = a.appendChild(document.createElement("div")), this.class && (this.element.className = this.class), this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;", this.color && (this.element.style.backgroundColor = this.color)), this.element.classList.toggle("prosemirror-dropcursor-block", e), this.element.classList.toggle("prosemirror-dropcursor-inline", !e);
    let c, d;
    if (!a || a == document.body && getComputedStyle(a).position == "static")
      c = -pageXOffset, d = -pageYOffset;
    else {
      let u = a.getBoundingClientRect(), p = u.width / a.offsetWidth, h = u.height / a.offsetHeight;
      c = u.left - a.scrollLeft * p, d = u.top - a.scrollTop * h;
    }
    this.element.style.left = (i.left - c) / o + "px", this.element.style.top = (i.top - d) / l + "px", this.element.style.width = (i.right - i.left) / o + "px", this.element.style.height = (i.bottom - i.top) / l + "px";
  }
  scheduleRemoval(t) {
    clearTimeout(this.timeout), this.timeout = setTimeout(() => this.setCursor(null), t);
  }
  dragover(t) {
    if (!this.editorView.editable)
      return;
    let e = this.editorView.posAtCoords({ left: t.clientX, top: t.clientY }), i = e && e.inside >= 0 && this.editorView.state.doc.nodeAt(e.inside), s = i && i.type.spec.disableDropCursor, r = typeof s == "function" ? s(this.editorView, e, t) : s;
    if (e && !r) {
      let o = e.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        let l = Ta(this.editorView.state.doc, o, this.editorView.dragging.slice);
        l != null && (o = l);
      }
      this.setCursor(o), this.scheduleRemoval(5e3);
    }
  }
  dragend() {
    this.scheduleRemoval(20);
  }
  drop() {
    this.scheduleRemoval(20);
  }
  dragleave(t) {
    this.editorView.dom.contains(t.relatedTarget) || this.setCursor(null);
  }
}
const Rm = K.create({
  name: "dropCursor",
  addOptions() {
    return {
      color: "currentColor",
      width: 1,
      class: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      Nm(this.options)
    ];
  }
});
class U extends L {
  /**
  Create a gap cursor.
  */
  constructor(t) {
    super(t, t);
  }
  map(t, e) {
    let i = t.resolve(e.map(this.head));
    return U.valid(i) ? new U(i) : L.near(i);
  }
  content() {
    return C.empty;
  }
  eq(t) {
    return t instanceof U && t.head == this.head;
  }
  toJSON() {
    return { type: "gapcursor", pos: this.head };
  }
  /**
  @internal
  */
  static fromJSON(t, e) {
    if (typeof e.pos != "number")
      throw new RangeError("Invalid input for GapCursor.fromJSON");
    return new U(t.resolve(e.pos));
  }
  /**
  @internal
  */
  getBookmark() {
    return new so(this.anchor);
  }
  /**
  @internal
  */
  static valid(t) {
    let e = t.parent;
    if (e.isTextblock || !Im(t) || !Dm(t))
      return !1;
    let i = e.type.spec.allowGapCursor;
    if (i != null)
      return i;
    let s = e.contentMatchAt(t.index()).defaultType;
    return s && s.isTextblock;
  }
  /**
  @internal
  */
  static findGapCursorFrom(t, e, i = !1) {
    t: for (; ; ) {
      if (!i && U.valid(t))
        return t;
      let s = t.pos, r = null;
      for (let o = t.depth; ; o--) {
        let l = t.node(o);
        if (e > 0 ? t.indexAfter(o) < l.childCount : t.index(o) > 0) {
          r = l.child(e > 0 ? t.indexAfter(o) : t.index(o) - 1);
          break;
        } else if (o == 0)
          return null;
        s += e;
        let a = t.doc.resolve(s);
        if (U.valid(a))
          return a;
      }
      for (; ; ) {
        let o = e > 0 ? r.firstChild : r.lastChild;
        if (!o) {
          if (r.isAtom && !r.isText && !_.isSelectable(r)) {
            t = t.doc.resolve(s + r.nodeSize * e), i = !1;
            continue t;
          }
          break;
        }
        r = o, s += e;
        let l = t.doc.resolve(s);
        if (U.valid(l))
          return l;
      }
      return null;
    }
  }
}
U.prototype.visible = !1;
U.findFrom = U.findGapCursorFrom;
L.jsonID("gapcursor", U);
class so {
  constructor(t) {
    this.pos = t;
  }
  map(t) {
    return new so(t.map(this.pos));
  }
  resolve(t) {
    let e = t.resolve(this.pos);
    return U.valid(e) ? new U(e) : L.near(e);
  }
}
function qc(n) {
  return n.isAtom || n.spec.isolating || n.spec.createGapCursor;
}
function Im(n) {
  for (let t = n.depth; t >= 0; t--) {
    let e = n.index(t), i = n.node(t);
    if (e == 0) {
      if (i.type.spec.isolating)
        return !0;
      continue;
    }
    for (let s = i.child(e - 1); ; s = s.lastChild) {
      if (s.childCount == 0 && !s.inlineContent || qc(s.type))
        return !0;
      if (s.inlineContent)
        return !1;
    }
  }
  return !0;
}
function Dm(n) {
  for (let t = n.depth; t >= 0; t--) {
    let e = n.indexAfter(t), i = n.node(t);
    if (e == i.childCount) {
      if (i.type.spec.isolating)
        return !0;
      continue;
    }
    for (let s = i.child(e); ; s = s.firstChild) {
      if (s.childCount == 0 && !s.inlineContent || qc(s.type))
        return !0;
      if (s.inlineContent)
        return !1;
    }
  }
  return !0;
}
function Pm() {
  return new V({
    props: {
      decorations: zm,
      createSelectionBetween(n, t, e) {
        return t.pos == e.pos && U.valid(e) ? new U(e) : null;
      },
      handleClick: Hm,
      handleKeyDown: Bm,
      handleDOMEvents: { beforeinput: $m }
    }
  });
}
const Bm = Kr({
  ArrowLeft: Un("horiz", -1),
  ArrowRight: Un("horiz", 1),
  ArrowUp: Un("vert", -1),
  ArrowDown: Un("vert", 1)
});
function Un(n, t) {
  const e = n == "vert" ? t > 0 ? "down" : "up" : t > 0 ? "right" : "left";
  return function(i, s, r) {
    let o = i.selection, l = t > 0 ? o.$to : o.$from, a = o.empty;
    if (o instanceof T) {
      if (!r.endOfTextblock(e) || l.depth == 0)
        return !1;
      a = !1, l = i.doc.resolve(t > 0 ? l.after() : l.before());
    }
    let c = U.findGapCursorFrom(l, t, a);
    return c ? (s && s(i.tr.setSelection(new U(c))), !0) : !1;
  };
}
function Hm(n, t, e) {
  if (!n || !n.editable)
    return !1;
  let i = n.state.doc.resolve(t);
  if (!U.valid(i))
    return !1;
  let s = n.posAtCoords({ left: e.clientX, top: e.clientY });
  return s && s.inside > -1 && _.isSelectable(n.state.doc.nodeAt(s.inside)) ? !1 : (n.dispatch(n.state.tr.setSelection(new U(i))), !0);
}
function $m(n, t) {
  if (t.inputType != "insertCompositionText" || !(n.state.selection instanceof U))
    return !1;
  let { $from: e } = n.state.selection, i = e.parent.contentMatchAt(e.index()).findWrapping(n.state.schema.nodes.text);
  if (!i)
    return !1;
  let s = v.empty;
  for (let o = i.length - 1; o >= 0; o--)
    s = v.from(i[o].createAndFill(null, s));
  let r = n.state.tr.replace(e.pos, e.pos, new C(s, 0, 0));
  return r.setSelection(T.near(r.doc.resolve(e.pos + 1))), n.dispatch(r), !1;
}
function zm(n) {
  if (!(n.selection instanceof U))
    return null;
  let t = document.createElement("div");
  return t.className = "ProseMirror-gapcursor", F.create(n.doc, [ot.widget(n.selection.head, t, { key: "gapcursor" })]);
}
const qm = K.create({
  name: "gapCursor",
  addProseMirrorPlugins() {
    return [
      Pm()
    ];
  },
  extendNodeSchema(n) {
    var t;
    const e = {
      name: n.name,
      options: n.options,
      storage: n.storage
    };
    return {
      allowGapCursor: (t = R(E(n, "allowGapCursor", e))) !== null && t !== void 0 ? t : null
    };
  }
}), Fm = H.create({
  name: "hardBreak",
  addOptions() {
    return {
      keepMarks: !0,
      HTMLAttributes: {}
    };
  },
  inline: !0,
  group: "inline",
  selectable: !1,
  linebreakReplacement: !0,
  parseHTML() {
    return [
      { tag: "br" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["br", D(this.options.HTMLAttributes, n)];
  },
  renderText() {
    return `
`;
  },
  addCommands() {
    return {
      setHardBreak: () => ({ commands: n, chain: t, state: e, editor: i }) => n.first([
        () => n.exitCode(),
        () => n.command(() => {
          const { selection: s, storedMarks: r } = e;
          if (s.$from.parent.type.spec.isolating)
            return !1;
          const { keepMarks: o } = this.options, { splittableMarks: l } = i.extensionManager, a = r || s.$to.parentOffset && s.$from.marks();
          return t().insertContent({ type: this.name }).command(({ tr: c, dispatch: d }) => {
            if (d && a && o) {
              const u = a.filter((p) => l.includes(p.type.name));
              c.ensureMarks(u);
            }
            return !0;
          }).run();
        })
      ])
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setHardBreak(),
      "Shift-Enter": () => this.editor.commands.setHardBreak()
    };
  }
}), Vm = H.create({
  name: "heading",
  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {}
    };
  },
  content: "inline*",
  group: "block",
  defining: !0,
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: !1
      }
    };
  },
  parseHTML() {
    return this.options.levels.map((n) => ({
      tag: `h${n}`,
      attrs: { level: n }
    }));
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    return [`h${this.options.levels.includes(n.attrs.level) ? n.attrs.level : this.options.levels[0]}`, D(this.options.HTMLAttributes, t), 0];
  },
  addCommands() {
    return {
      setHeading: (n) => ({ commands: t }) => this.options.levels.includes(n.level) ? t.setNode(this.name, n) : !1,
      toggleHeading: (n) => ({ commands: t }) => this.options.levels.includes(n.level) ? t.toggleNode(this.name, "paragraph", n) : !1
    };
  },
  addKeyboardShortcuts() {
    return this.options.levels.reduce((n, t) => ({
      ...n,
      [`Mod-Alt-${t}`]: () => this.editor.commands.toggleHeading({ level: t })
    }), {});
  },
  addInputRules() {
    return this.options.levels.map((n) => hr({
      find: new RegExp(`^(#{${Math.min(...this.options.levels)},${n}})\\s$`),
      type: this.type,
      getAttributes: {
        level: n
      }
    }));
  }
});
var xi = 200, Z = function() {
};
Z.prototype.append = function(t) {
  return t.length ? (t = Z.from(t), !this.length && t || t.length < xi && this.leafAppend(t) || this.length < xi && t.leafPrepend(this) || this.appendInner(t)) : this;
};
Z.prototype.prepend = function(t) {
  return t.length ? Z.from(t).append(this) : this;
};
Z.prototype.appendInner = function(t) {
  return new jm(this, t);
};
Z.prototype.slice = function(t, e) {
  return t === void 0 && (t = 0), e === void 0 && (e = this.length), t >= e ? Z.empty : this.sliceInner(Math.max(0, t), Math.min(this.length, e));
};
Z.prototype.get = function(t) {
  if (!(t < 0 || t >= this.length))
    return this.getInner(t);
};
Z.prototype.forEach = function(t, e, i) {
  e === void 0 && (e = 0), i === void 0 && (i = this.length), e <= i ? this.forEachInner(t, e, i, 0) : this.forEachInvertedInner(t, e, i, 0);
};
Z.prototype.map = function(t, e, i) {
  e === void 0 && (e = 0), i === void 0 && (i = this.length);
  var s = [];
  return this.forEach(function(r, o) {
    return s.push(t(r, o));
  }, e, i), s;
};
Z.from = function(t) {
  return t instanceof Z ? t : t && t.length ? new Fc(t) : Z.empty;
};
var Fc = /* @__PURE__ */ (function(n) {
  function t(i) {
    n.call(this), this.values = i;
  }
  n && (t.__proto__ = n), t.prototype = Object.create(n && n.prototype), t.prototype.constructor = t;
  var e = { length: { configurable: !0 }, depth: { configurable: !0 } };
  return t.prototype.flatten = function() {
    return this.values;
  }, t.prototype.sliceInner = function(s, r) {
    return s == 0 && r == this.length ? this : new t(this.values.slice(s, r));
  }, t.prototype.getInner = function(s) {
    return this.values[s];
  }, t.prototype.forEachInner = function(s, r, o, l) {
    for (var a = r; a < o; a++)
      if (s(this.values[a], l + a) === !1)
        return !1;
  }, t.prototype.forEachInvertedInner = function(s, r, o, l) {
    for (var a = r - 1; a >= o; a--)
      if (s(this.values[a], l + a) === !1)
        return !1;
  }, t.prototype.leafAppend = function(s) {
    if (this.length + s.length <= xi)
      return new t(this.values.concat(s.flatten()));
  }, t.prototype.leafPrepend = function(s) {
    if (this.length + s.length <= xi)
      return new t(s.flatten().concat(this.values));
  }, e.length.get = function() {
    return this.values.length;
  }, e.depth.get = function() {
    return 0;
  }, Object.defineProperties(t.prototype, e), t;
})(Z);
Z.empty = new Fc([]);
var jm = /* @__PURE__ */ (function(n) {
  function t(e, i) {
    n.call(this), this.left = e, this.right = i, this.length = e.length + i.length, this.depth = Math.max(e.depth, i.depth) + 1;
  }
  return n && (t.__proto__ = n), t.prototype = Object.create(n && n.prototype), t.prototype.constructor = t, t.prototype.flatten = function() {
    return this.left.flatten().concat(this.right.flatten());
  }, t.prototype.getInner = function(i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length);
  }, t.prototype.forEachInner = function(i, s, r, o) {
    var l = this.left.length;
    if (s < l && this.left.forEachInner(i, s, Math.min(r, l), o) === !1 || r > l && this.right.forEachInner(i, Math.max(s - l, 0), Math.min(this.length, r) - l, o + l) === !1)
      return !1;
  }, t.prototype.forEachInvertedInner = function(i, s, r, o) {
    var l = this.left.length;
    if (s > l && this.right.forEachInvertedInner(i, s - l, Math.max(r, l) - l, o + l) === !1 || r < l && this.left.forEachInvertedInner(i, Math.min(s, l), r, o) === !1)
      return !1;
  }, t.prototype.sliceInner = function(i, s) {
    if (i == 0 && s == this.length)
      return this;
    var r = this.left.length;
    return s <= r ? this.left.slice(i, s) : i >= r ? this.right.slice(i - r, s - r) : this.left.slice(i, r).append(this.right.slice(0, s - r));
  }, t.prototype.leafAppend = function(i) {
    var s = this.right.leafAppend(i);
    if (s)
      return new t(this.left, s);
  }, t.prototype.leafPrepend = function(i) {
    var s = this.left.leafPrepend(i);
    if (s)
      return new t(s, this.right);
  }, t.prototype.appendInner = function(i) {
    return this.left.depth >= Math.max(this.right.depth, i.depth) + 1 ? new t(this.left, new t(this.right, i)) : new t(this, i);
  }, t;
})(Z);
const Um = 500;
class Et {
  constructor(t, e) {
    this.items = t, this.eventCount = e;
  }
  // Pop the latest event off the branch's history and apply it
  // to a document transform.
  popEvent(t, e) {
    if (this.eventCount == 0)
      return null;
    let i = this.items.length;
    for (; ; i--)
      if (this.items.get(i - 1).selection) {
        --i;
        break;
      }
    let s, r;
    e && (s = this.remapping(i, this.items.length), r = s.maps.length);
    let o = t.tr, l, a, c = [], d = [];
    return this.items.forEach((u, p) => {
      if (!u.step) {
        s || (s = this.remapping(i, p + 1), r = s.maps.length), r--, d.push(u);
        return;
      }
      if (s) {
        d.push(new Tt(u.map));
        let h = u.step.map(s.slice(r)), f;
        h && o.maybeStep(h).doc && (f = o.mapping.maps[o.mapping.maps.length - 1], c.push(new Tt(f, void 0, void 0, c.length + d.length))), r--, f && s.appendMap(f, r);
      } else
        o.maybeStep(u.step);
      if (u.selection)
        return l = s ? u.selection.map(s.slice(r)) : u.selection, a = new Et(this.items.slice(0, i).append(d.reverse().concat(c)), this.eventCount - 1), !1;
    }, this.items.length, 0), { remaining: a, transform: o, selection: l };
  }
  // Create a new branch with the given transform added.
  addTransform(t, e, i, s) {
    let r = [], o = this.eventCount, l = this.items, a = !s && l.length ? l.get(l.length - 1) : null;
    for (let d = 0; d < t.steps.length; d++) {
      let u = t.steps[d].invert(t.docs[d]), p = new Tt(t.mapping.maps[d], u, e), h;
      (h = a && a.merge(p)) && (p = h, d ? r.pop() : l = l.slice(0, l.length - 1)), r.push(p), e && (o++, e = void 0), s || (a = p);
    }
    let c = o - i.depth;
    return c > Km && (l = Wm(l, c), o -= c), new Et(l.append(r), o);
  }
  remapping(t, e) {
    let i = new xn();
    return this.items.forEach((s, r) => {
      let o = s.mirrorOffset != null && r - s.mirrorOffset >= t ? i.maps.length - s.mirrorOffset : void 0;
      i.appendMap(s.map, o);
    }, t, e), i;
  }
  addMaps(t) {
    return this.eventCount == 0 ? this : new Et(this.items.append(t.map((e) => new Tt(e))), this.eventCount);
  }
  // When the collab module receives remote changes, the history has
  // to know about those, so that it can adjust the steps that were
  // rebased on top of the remote changes, and include the position
  // maps for the remote changes in its array of items.
  rebased(t, e) {
    if (!this.eventCount)
      return this;
    let i = [], s = Math.max(0, this.items.length - e), r = t.mapping, o = t.steps.length, l = this.eventCount;
    this.items.forEach((p) => {
      p.selection && l--;
    }, s);
    let a = e;
    this.items.forEach((p) => {
      let h = r.getMirror(--a);
      if (h == null)
        return;
      o = Math.min(o, h);
      let f = r.maps[h];
      if (p.step) {
        let g = t.steps[h].invert(t.docs[h]), m = p.selection && p.selection.map(r.slice(a + 1, h));
        m && l++, i.push(new Tt(f, g, m));
      } else
        i.push(new Tt(f));
    }, s);
    let c = [];
    for (let p = e; p < o; p++)
      c.push(new Tt(r.maps[p]));
    let d = this.items.slice(0, s).append(c).append(i), u = new Et(d, l);
    return u.emptyItemCount() > Um && (u = u.compress(this.items.length - i.length)), u;
  }
  emptyItemCount() {
    let t = 0;
    return this.items.forEach((e) => {
      e.step || t++;
    }), t;
  }
  // Compressing a branch means rewriting it to push the air (map-only
  // items) out. During collaboration, these naturally accumulate
  // because each remote change adds one. The `upto` argument is used
  // to ensure that only the items below a given level are compressed,
  // because `rebased` relies on a clean, untouched set of items in
  // order to associate old items with rebased steps.
  compress(t = this.items.length) {
    let e = this.remapping(0, t), i = e.maps.length, s = [], r = 0;
    return this.items.forEach((o, l) => {
      if (l >= t)
        s.push(o), o.selection && r++;
      else if (o.step) {
        let a = o.step.map(e.slice(i)), c = a && a.getMap();
        if (i--, c && e.appendMap(c, i), a) {
          let d = o.selection && o.selection.map(e.slice(i));
          d && r++;
          let u = new Tt(c.invert(), a, d), p, h = s.length - 1;
          (p = s.length && s[h].merge(u)) ? s[h] = p : s.push(u);
        }
      } else o.map && i--;
    }, this.items.length, 0), new Et(Z.from(s.reverse()), r);
  }
}
Et.empty = new Et(Z.empty, 0);
function Wm(n, t) {
  let e;
  return n.forEach((i, s) => {
    if (i.selection && t-- == 0)
      return e = s, !1;
  }), n.slice(e);
}
class Tt {
  constructor(t, e, i, s) {
    this.map = t, this.step = e, this.selection = i, this.mirrorOffset = s;
  }
  merge(t) {
    if (this.step && t.step && !t.selection) {
      let e = t.step.merge(this.step);
      if (e)
        return new Tt(e.getMap().invert(), e, this.selection);
    }
  }
}
class Yt {
  constructor(t, e, i, s, r) {
    this.done = t, this.undone = e, this.prevRanges = i, this.prevTime = s, this.prevComposition = r;
  }
}
const Km = 20;
function Jm(n, t, e, i) {
  let s = e.getMeta(Ee), r;
  if (s)
    return s.historyState;
  e.getMeta(Xm) && (n = new Yt(n.done, n.undone, null, 0, -1));
  let o = e.getMeta("appendedTransaction");
  if (e.steps.length == 0)
    return n;
  if (o && o.getMeta(Ee))
    return o.getMeta(Ee).redo ? new Yt(n.done.addTransform(e, void 0, i, si(t)), n.undone, El(e.mapping.maps), n.prevTime, n.prevComposition) : new Yt(n.done, n.undone.addTransform(e, void 0, i, si(t)), null, n.prevTime, n.prevComposition);
  if (e.getMeta("addToHistory") !== !1 && !(o && o.getMeta("addToHistory") === !1)) {
    let l = e.getMeta("composition"), a = n.prevTime == 0 || !o && n.prevComposition != l && (n.prevTime < (e.time || 0) - i.newGroupDelay || !Gm(e, n.prevRanges)), c = o ? Ps(n.prevRanges, e.mapping) : El(e.mapping.maps);
    return new Yt(n.done.addTransform(e, a ? t.selection.getBookmark() : void 0, i, si(t)), Et.empty, c, e.time, l ?? n.prevComposition);
  } else return (r = e.getMeta("rebased")) ? new Yt(n.done.rebased(e, r), n.undone.rebased(e, r), Ps(n.prevRanges, e.mapping), n.prevTime, n.prevComposition) : new Yt(n.done.addMaps(e.mapping.maps), n.undone.addMaps(e.mapping.maps), Ps(n.prevRanges, e.mapping), n.prevTime, n.prevComposition);
}
function Gm(n, t) {
  if (!t)
    return !1;
  if (!n.docChanged)
    return !0;
  let e = !1;
  return n.mapping.maps[0].forEach((i, s) => {
    for (let r = 0; r < t.length; r += 2)
      i <= t[r + 1] && s >= t[r] && (e = !0);
  }), e;
}
function El(n) {
  let t = [];
  for (let e = n.length - 1; e >= 0 && t.length == 0; e--)
    n[e].forEach((i, s, r, o) => t.push(r, o));
  return t;
}
function Ps(n, t) {
  if (!n)
    return null;
  let e = [];
  for (let i = 0; i < n.length; i += 2) {
    let s = t.map(n[i], 1), r = t.map(n[i + 1], -1);
    s <= r && e.push(s, r);
  }
  return e;
}
function Ym(n, t, e) {
  let i = si(t), s = Ee.get(t).spec.config, r = (e ? n.undone : n.done).popEvent(t, i);
  if (!r)
    return null;
  let o = r.selection.resolve(r.transform.doc), l = (e ? n.done : n.undone).addTransform(r.transform, t.selection.getBookmark(), s, i), a = new Yt(e ? l : r.remaining, e ? r.remaining : l, null, 0, -1);
  return r.transform.setSelection(o).setMeta(Ee, { redo: e, historyState: a });
}
let Bs = !1, _l = null;
function si(n) {
  let t = n.plugins;
  if (_l != t) {
    Bs = !1, _l = t;
    for (let e = 0; e < t.length; e++)
      if (t[e].spec.historyPreserveItems) {
        Bs = !0;
        break;
      }
  }
  return Bs;
}
const Ee = new J("history"), Xm = new J("closeHistory");
function Qm(n = {}) {
  return n = {
    depth: n.depth || 100,
    newGroupDelay: n.newGroupDelay || 500
  }, new V({
    key: Ee,
    state: {
      init() {
        return new Yt(Et.empty, Et.empty, null, 0, -1);
      },
      apply(t, e, i) {
        return Jm(e, i, t, n);
      }
    },
    config: n,
    props: {
      handleDOMEvents: {
        beforeinput(t, e) {
          let i = e.inputType, s = i == "historyUndo" ? jc : i == "historyRedo" ? Uc : null;
          return !s || !t.editable ? !1 : (e.preventDefault(), s(t.state, t.dispatch));
        }
      }
    }
  });
}
function Vc(n, t) {
  return (e, i) => {
    let s = Ee.getState(e);
    if (!s || (n ? s.undone : s.done).eventCount == 0)
      return !1;
    if (i) {
      let r = Ym(s, e, n);
      r && i(t ? r.scrollIntoView() : r);
    }
    return !0;
  };
}
const jc = Vc(!1, !0), Uc = Vc(!0, !0), Zm = K.create({
  name: "history",
  addOptions() {
    return {
      depth: 100,
      newGroupDelay: 500
    };
  },
  addCommands() {
    return {
      undo: () => ({ state: n, dispatch: t }) => jc(n, t),
      redo: () => ({ state: n, dispatch: t }) => Uc(n, t)
    };
  },
  addProseMirrorPlugins() {
    return [
      Qm(this.options)
    ];
  },
  addKeyboardShortcuts() {
    return {
      "Mod-z": () => this.editor.commands.undo(),
      "Shift-Mod-z": () => this.editor.commands.redo(),
      "Mod-y": () => this.editor.commands.redo(),
      // Russian keyboard layouts
      "Mod-я": () => this.editor.commands.undo(),
      "Shift-Mod-я": () => this.editor.commands.redo()
    };
  }
}), tg = H.create({
  name: "horizontalRule",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  group: "block",
  parseHTML() {
    return [{ tag: "hr" }];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["hr", D(this.options.HTMLAttributes, n)];
  },
  addCommands() {
    return {
      setHorizontalRule: () => ({ chain: n, state: t }) => {
        if (!hm(t, t.schema.nodes[this.name]))
          return !1;
        const { selection: e } = t, { $from: i, $to: s } = e, r = n();
        return i.parentOffset === 0 ? r.insertContentAt({
          from: Math.max(i.pos - 1, 0),
          to: s.pos
        }, {
          type: this.name
        }) : If(e) ? r.insertContentAt(s.pos, {
          type: this.name
        }) : r.insertContent({ type: this.name }), r.command(({ tr: o, dispatch: l }) => {
          var a;
          if (l) {
            const { $to: c } = o.selection, d = c.end();
            if (c.nodeAfter)
              c.nodeAfter.isTextblock ? o.setSelection(T.create(o.doc, c.pos + 1)) : c.nodeAfter.isBlock ? o.setSelection(_.create(o.doc, c.pos)) : o.setSelection(T.create(o.doc, c.pos));
            else {
              const u = (a = c.parent.type.contentMatch.defaultType) === null || a === void 0 ? void 0 : a.create();
              u && (o.insert(d, u), o.setSelection(T.create(o.doc, d + 1)));
            }
            o.scrollIntoView();
          }
          return !0;
        }).run();
      }
    };
  },
  addInputRules() {
    return [
      pm({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type
      })
    ];
  }
}), eg = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, ng = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, ig = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, sg = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, rg = gt.create({
  name: "italic",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "em"
      },
      {
        tag: "i",
        getAttrs: (n) => n.style.fontStyle !== "normal" && null
      },
      {
        style: "font-style=normal",
        clearMark: (n) => n.type.name === this.name
      },
      {
        style: "font-style=italic"
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["em", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setItalic: () => ({ commands: n }) => n.setMark(this.name),
      toggleItalic: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetItalic: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-i": () => this.editor.commands.toggleItalic(),
      "Mod-I": () => this.editor.commands.toggleItalic()
    };
  },
  addInputRules() {
    return [
      Ne({
        find: eg,
        type: this.type
      }),
      Ne({
        find: ig,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      de({
        find: ng,
        type: this.type
      }),
      de({
        find: sg,
        type: this.type
      })
    ];
  }
}), og = H.create({
  name: "listItem",
  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: "bulletList",
      orderedListTypeName: "orderedList"
    };
  },
  content: "paragraph block*",
  defining: !0,
  parseHTML() {
    return [
      {
        tag: "li"
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["li", D(this.options.HTMLAttributes, n), 0];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name)
    };
  }
}), lg = "listItem", Tl = "textStyle", Al = /^(\d+)\.\s$/, ag = H.create({
  name: "orderedList",
  addOptions() {
    return {
      itemTypeName: "listItem",
      HTMLAttributes: {},
      keepMarks: !1,
      keepAttributes: !1
    };
  },
  group: "block list",
  content() {
    return `${this.options.itemTypeName}+`;
  },
  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: (n) => n.hasAttribute("start") ? parseInt(n.getAttribute("start") || "", 10) : 1
      },
      type: {
        default: null,
        parseHTML: (n) => n.getAttribute("type")
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "ol"
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    const { start: t, ...e } = n;
    return t === 1 ? ["ol", D(this.options.HTMLAttributes, e), 0] : ["ol", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      toggleOrderedList: () => ({ commands: n, chain: t }) => this.options.keepAttributes ? t().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(lg, this.editor.getAttributes(Tl)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.commands.toggleOrderedList()
    };
  },
  addInputRules() {
    let n = An({
      find: Al,
      type: this.type,
      getAttributes: (t) => ({ start: +t[1] }),
      joinPredicate: (t, e) => e.childCount + e.attrs.start === +t[1]
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = An({
      find: Al,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: (t) => ({ start: +t[1], ...this.editor.getAttributes(Tl) }),
      joinPredicate: (t, e) => e.childCount + e.attrs.start === +t[1],
      editor: this.editor
    })), [
      n
    ];
  }
}), cg = H.create({
  name: "paragraph",
  priority: 1e3,
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  group: "block",
  content: "inline*",
  parseHTML() {
    return [
      { tag: "p" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["p", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setParagraph: () => ({ commands: n }) => n.setNode(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-0": () => this.editor.commands.setParagraph()
    };
  }
}), dg = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/, ug = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g, pg = gt.create({
  name: "strike",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "s"
      },
      {
        tag: "del"
      },
      {
        tag: "strike"
      },
      {
        style: "text-decoration",
        consuming: !1,
        getAttrs: (n) => n.includes("line-through") ? {} : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["s", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setStrike: () => ({ commands: n }) => n.setMark(this.name),
      toggleStrike: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetStrike: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.toggleStrike()
    };
  },
  addInputRules() {
    return [
      Ne({
        find: dg,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      de({
        find: ug,
        type: this.type
      })
    ];
  }
}), hg = H.create({
  name: "text",
  group: "inline"
}), fg = K.create({
  name: "starterKit",
  addExtensions() {
    const n = [];
    return this.options.bold !== !1 && n.push(km.configure(this.options.bold)), this.options.blockquote !== !1 && n.push(gm.configure(this.options.blockquote)), this.options.bulletList !== !1 && n.push(Cm.configure(this.options.bulletList)), this.options.code !== !1 && n.push(Em.configure(this.options.code)), this.options.codeBlock !== !1 && n.push(Am.configure(this.options.codeBlock)), this.options.document !== !1 && n.push(Lm.configure(this.options.document)), this.options.dropcursor !== !1 && n.push(Rm.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && n.push(qm.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && n.push(Fm.configure(this.options.hardBreak)), this.options.heading !== !1 && n.push(Vm.configure(this.options.heading)), this.options.history !== !1 && n.push(Zm.configure(this.options.history)), this.options.horizontalRule !== !1 && n.push(tg.configure(this.options.horizontalRule)), this.options.italic !== !1 && n.push(rg.configure(this.options.italic)), this.options.listItem !== !1 && n.push(og.configure(this.options.listItem)), this.options.orderedList !== !1 && n.push(ag.configure(this.options.orderedList)), this.options.paragraph !== !1 && n.push(cg.configure(this.options.paragraph)), this.options.strike !== !1 && n.push(pg.configure(this.options.strike)), this.options.text !== !1 && n.push(hg.configure(this.options.text)), n;
  }
}), mg = gt.create({
  name: "underline",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "u"
      },
      {
        style: "text-decoration",
        consuming: !1,
        getAttrs: (n) => n.includes("underline") ? {} : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["u", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setUnderline: () => ({ commands: n }) => n.setMark(this.name),
      toggleUnderline: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetUnderline: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-u": () => this.editor.commands.toggleUnderline(),
      "Mod-U": () => this.editor.commands.toggleUnderline()
    };
  }
}), gg = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", bg = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", fr = "numeric", mr = "ascii", gr = "alpha", hn = "asciinumeric", an = "alphanumeric", br = "domain", Wc = "emoji", yg = "scheme", vg = "slashscheme", Hs = "whitespace";
function wg(n, t) {
  return n in t || (t[n] = []), t[n];
}
function ke(n, t, e) {
  t[fr] && (t[hn] = !0, t[an] = !0), t[mr] && (t[hn] = !0, t[gr] = !0), t[hn] && (t[an] = !0), t[gr] && (t[an] = !0), t[an] && (t[br] = !0), t[Wc] && (t[br] = !0);
  for (const i in t) {
    const s = wg(i, e);
    s.indexOf(n) < 0 && s.push(n);
  }
}
function kg(n, t) {
  const e = {};
  for (const i in t)
    t[i].indexOf(n) >= 0 && (e[i] = !0);
  return e;
}
function ft(n = null) {
  this.j = {}, this.jr = [], this.jd = null, this.t = n;
}
ft.groups = {};
ft.prototype = {
  accepts() {
    return !!this.t;
  },
  /**
   * Follow an existing transition from the given input to the next state.
   * Does not mutate.
   * @param {string} input character or token type to transition on
   * @returns {?State<T>} the next state, if any
   */
  go(n) {
    const t = this, e = t.j[n];
    if (e)
      return e;
    for (let i = 0; i < t.jr.length; i++) {
      const s = t.jr[i][0], r = t.jr[i][1];
      if (r && s.test(n))
        return r;
    }
    return t.jd;
  },
  /**
   * Whether the state has a transition for the given input. Set the second
   * argument to true to only look for an exact match (and not a default or
   * regular-expression-based transition)
   * @param {string} input
   * @param {boolean} exactOnly
   */
  has(n, t = !1) {
    return t ? n in this.j : !!this.go(n);
  },
  /**
   * Short for "transition all"; create a transition from the array of items
   * in the given list to the same final resulting state.
   * @param {string | string[]} inputs Group of inputs to transition on
   * @param {Transition<T> | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   */
  ta(n, t, e, i) {
    for (let s = 0; s < n.length; s++)
      this.tt(n[s], t, e, i);
  },
  /**
   * Short for "take regexp transition"; defines a transition for this state
   * when it encounters a token which matches the given regular expression
   * @param {RegExp} regexp Regular expression transition (populate first)
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  tr(n, t, e, i) {
    i = i || ft.groups;
    let s;
    return t && t.j ? s = t : (s = new ft(t), e && i && ke(t, e, i)), this.jr.push([n, s]), s;
  },
  /**
   * Short for "take transitions", will take as many sequential transitions as
   * the length of the given input and returns the
   * resulting final state.
   * @param {string | string[]} input
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  ts(n, t, e, i) {
    let s = this;
    const r = n.length;
    if (!r)
      return s;
    for (let o = 0; o < r - 1; o++)
      s = s.tt(n[o]);
    return s.tt(n[r - 1], t, e, i);
  },
  /**
   * Short for "take transition", this is a method for building/working with
   * state machines.
   *
   * If a state already exists for the given input, returns it.
   *
   * If a token is specified, that state will emit that token when reached by
   * the linkify engine.
   *
   * If no state exists, it will be initialized with some default transitions
   * that resemble existing default transitions.
   *
   * If a state is given for the second argument, that state will be
   * transitioned to on the given input regardless of what that input
   * previously did.
   *
   * Specify a token group flags to define groups that this token belongs to.
   * The token will be added to corresponding entires in the given groups
   * object.
   *
   * @param {string} input character, token type to transition on
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of groups
   * @returns {State<T>} taken after the given input
   */
  tt(n, t, e, i) {
    i = i || ft.groups;
    const s = this;
    if (t && t.j)
      return s.j[n] = t, t;
    const r = t;
    let o, l = s.go(n);
    if (l ? (o = new ft(), Object.assign(o.j, l.j), o.jr.push.apply(o.jr, l.jr), o.jd = l.jd, o.t = l.t) : o = new ft(), r) {
      if (i)
        if (o.t && typeof o.t == "string") {
          const a = Object.assign(kg(o.t, i), e);
          ke(r, a, i);
        } else e && ke(r, e, i);
      o.t = r;
    }
    return s.j[n] = o, o;
  }
};
const O = (n, t, e, i, s) => n.ta(t, e, i, s), j = (n, t, e, i, s) => n.tr(t, e, i, s), Ll = (n, t, e, i, s) => n.ts(t, e, i, s), k = (n, t, e, i, s) => n.tt(t, e, i, s), qt = "WORD", yr = "UWORD", Kc = "ASCIINUMERICAL", Jc = "ALPHANUMERICAL", Ln = "LOCALHOST", vr = "TLD", wr = "UTLD", ri = "SCHEME", qe = "SLASH_SCHEME", ro = "NUM", kr = "WS", oo = "NL", fn = "OPENBRACE", mn = "CLOSEBRACE", Ci = "OPENBRACKET", Si = "CLOSEBRACKET", Mi = "OPENPAREN", Ei = "CLOSEPAREN", _i = "OPENANGLEBRACKET", Ti = "CLOSEANGLEBRACKET", Ai = "FULLWIDTHLEFTPAREN", Li = "FULLWIDTHRIGHTPAREN", Ni = "LEFTCORNERBRACKET", Oi = "RIGHTCORNERBRACKET", Ri = "LEFTWHITECORNERBRACKET", Ii = "RIGHTWHITECORNERBRACKET", Di = "FULLWIDTHLESSTHAN", Pi = "FULLWIDTHGREATERTHAN", Bi = "AMPERSAND", Hi = "APOSTROPHE", $i = "ASTERISK", Xt = "AT", zi = "BACKSLASH", qi = "BACKTICK", Fi = "CARET", Zt = "COLON", lo = "COMMA", Vi = "DOLLAR", At = "DOT", ji = "EQUALS", ao = "EXCLAMATION", kt = "HYPHEN", gn = "PERCENT", Ui = "PIPE", Wi = "PLUS", Ki = "POUND", bn = "QUERY", co = "QUOTE", Gc = "FULLWIDTHMIDDLEDOT", uo = "SEMI", Lt = "SLASH", yn = "TILDE", Ji = "UNDERSCORE", Yc = "EMOJI", Gi = "SYM";
var Xc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ALPHANUMERICAL: Jc,
  AMPERSAND: Bi,
  APOSTROPHE: Hi,
  ASCIINUMERICAL: Kc,
  ASTERISK: $i,
  AT: Xt,
  BACKSLASH: zi,
  BACKTICK: qi,
  CARET: Fi,
  CLOSEANGLEBRACKET: Ti,
  CLOSEBRACE: mn,
  CLOSEBRACKET: Si,
  CLOSEPAREN: Ei,
  COLON: Zt,
  COMMA: lo,
  DOLLAR: Vi,
  DOT: At,
  EMOJI: Yc,
  EQUALS: ji,
  EXCLAMATION: ao,
  FULLWIDTHGREATERTHAN: Pi,
  FULLWIDTHLEFTPAREN: Ai,
  FULLWIDTHLESSTHAN: Di,
  FULLWIDTHMIDDLEDOT: Gc,
  FULLWIDTHRIGHTPAREN: Li,
  HYPHEN: kt,
  LEFTCORNERBRACKET: Ni,
  LEFTWHITECORNERBRACKET: Ri,
  LOCALHOST: Ln,
  NL: oo,
  NUM: ro,
  OPENANGLEBRACKET: _i,
  OPENBRACE: fn,
  OPENBRACKET: Ci,
  OPENPAREN: Mi,
  PERCENT: gn,
  PIPE: Ui,
  PLUS: Wi,
  POUND: Ki,
  QUERY: bn,
  QUOTE: co,
  RIGHTCORNERBRACKET: Oi,
  RIGHTWHITECORNERBRACKET: Ii,
  SCHEME: ri,
  SEMI: uo,
  SLASH: Lt,
  SLASH_SCHEME: qe,
  SYM: Gi,
  TILDE: yn,
  TLD: vr,
  UNDERSCORE: Ji,
  UTLD: wr,
  UWORD: yr,
  WORD: qt,
  WS: kr
});
const $t = /[a-z]/, en = new RegExp("\\p{L}", "u"), $s = new RegExp("\\p{Emoji}", "u"), zt = /\d/, zs = /\s/, Nl = "\r", qs = `
`, xg = "️", Cg = "‍", Fs = "￼";
let Wn = null, Kn = null;
function Sg(n = []) {
  const t = {};
  ft.groups = t;
  const e = new ft();
  Wn == null && (Wn = Ol(gg)), Kn == null && (Kn = Ol(bg)), k(e, "'", Hi), k(e, "{", fn), k(e, "}", mn), k(e, "[", Ci), k(e, "]", Si), k(e, "(", Mi), k(e, ")", Ei), k(e, "<", _i), k(e, ">", Ti), k(e, "（", Ai), k(e, "）", Li), k(e, "「", Ni), k(e, "」", Oi), k(e, "『", Ri), k(e, "』", Ii), k(e, "＜", Di), k(e, "＞", Pi), k(e, "&", Bi), k(e, "*", $i), k(e, "@", Xt), k(e, "`", qi), k(e, "^", Fi), k(e, ":", Zt), k(e, ",", lo), k(e, "$", Vi), k(e, ".", At), k(e, "=", ji), k(e, "!", ao), k(e, "-", kt), k(e, "%", gn), k(e, "|", Ui), k(e, "+", Wi), k(e, "#", Ki), k(e, "?", bn), k(e, '"', co), k(e, "/", Lt), k(e, ";", uo), k(e, "~", yn), k(e, "_", Ji), k(e, "\\", zi), k(e, "・", Gc);
  const i = j(e, zt, ro, {
    [fr]: !0
  });
  j(i, zt, i);
  const s = j(i, $t, Kc, {
    [hn]: !0
  }), r = j(i, en, Jc, {
    [an]: !0
  }), o = j(e, $t, qt, {
    [mr]: !0
  });
  j(o, zt, s), j(o, $t, o), j(s, zt, s), j(s, $t, s);
  const l = j(e, en, yr, {
    [gr]: !0
  });
  j(l, $t), j(l, zt, r), j(l, en, l), j(r, zt, r), j(r, $t), j(r, en, r);
  const a = k(e, qs, oo, {
    [Hs]: !0
  }), c = k(e, Nl, kr, {
    [Hs]: !0
  }), d = j(e, zs, kr, {
    [Hs]: !0
  });
  k(e, Fs, d), k(c, qs, a), k(c, Fs, d), j(c, zs, d), k(d, Nl), k(d, qs), j(d, zs, d), k(d, Fs, d);
  const u = j(e, $s, Yc, {
    [Wc]: !0
  });
  k(u, "#"), j(u, $s, u), k(u, xg, u);
  const p = k(u, Cg);
  k(p, "#"), j(p, $s, u);
  const h = [[$t, o], [zt, s]], f = [[$t, null], [en, l], [zt, r]];
  for (let g = 0; g < Wn.length; g++)
    Kt(e, Wn[g], vr, qt, h);
  for (let g = 0; g < Kn.length; g++)
    Kt(e, Kn[g], wr, yr, f);
  ke(vr, {
    tld: !0,
    ascii: !0
  }, t), ke(wr, {
    utld: !0,
    alpha: !0
  }, t), Kt(e, "file", ri, qt, h), Kt(e, "mailto", ri, qt, h), Kt(e, "http", qe, qt, h), Kt(e, "https", qe, qt, h), Kt(e, "ftp", qe, qt, h), Kt(e, "ftps", qe, qt, h), ke(ri, {
    scheme: !0,
    ascii: !0
  }, t), ke(qe, {
    slashscheme: !0,
    ascii: !0
  }, t), n = n.sort((g, m) => g[0] > m[0] ? 1 : -1);
  for (let g = 0; g < n.length; g++) {
    const m = n[g][0], y = n[g][1] ? {
      [yg]: !0
    } : {
      [vg]: !0
    };
    m.indexOf("-") >= 0 ? y[br] = !0 : $t.test(m) ? zt.test(m) ? y[hn] = !0 : y[mr] = !0 : y[fr] = !0, Ll(e, m, m, y);
  }
  return Ll(e, "localhost", Ln, {
    ascii: !0
  }), e.jd = new ft(Gi), {
    start: e,
    tokens: Object.assign({
      groups: t
    }, Xc)
  };
}
function Qc(n, t) {
  const e = Mg(t.replace(/[A-Z]/g, (l) => l.toLowerCase())), i = e.length, s = [];
  let r = 0, o = 0;
  for (; o < i; ) {
    let l = n, a = null, c = 0, d = null, u = -1, p = -1;
    for (; o < i && (a = l.go(e[o])); )
      l = a, l.accepts() ? (u = 0, p = 0, d = l) : u >= 0 && (u += e[o].length, p++), c += e[o].length, r += e[o].length, o++;
    r -= u, o -= p, c -= u, s.push({
      t: d.t,
      // token type/name
      v: t.slice(r - c, r),
      // string value
      s: r - c,
      // start index
      e: r
      // end index (excluding)
    });
  }
  return s;
}
function Mg(n) {
  const t = [], e = n.length;
  let i = 0;
  for (; i < e; ) {
    let s = n.charCodeAt(i), r, o = s < 55296 || s > 56319 || i + 1 === e || (r = n.charCodeAt(i + 1)) < 56320 || r > 57343 ? n[i] : n.slice(i, i + 2);
    t.push(o), i += o.length;
  }
  return t;
}
function Kt(n, t, e, i, s) {
  let r;
  const o = t.length;
  for (let l = 0; l < o - 1; l++) {
    const a = t[l];
    n.j[a] ? r = n.j[a] : (r = new ft(i), r.jr = s.slice(), n.j[a] = r), n = r;
  }
  return r = new ft(e), r.jr = s.slice(), n.j[t[o - 1]] = r, r;
}
function Ol(n) {
  const t = [], e = [];
  let i = 0, s = "0123456789";
  for (; i < n.length; ) {
    let r = 0;
    for (; s.indexOf(n[i + r]) >= 0; )
      r++;
    if (r > 0) {
      t.push(e.join(""));
      for (let o = parseInt(n.substring(i, i + r), 10); o > 0; o--)
        e.pop();
      i += r;
    } else
      e.push(n[i]), i++;
  }
  return t;
}
const Nn = {
  defaultProtocol: "http",
  events: null,
  format: Rl,
  formatHref: Rl,
  nl2br: !1,
  tagName: "a",
  target: null,
  rel: null,
  validate: !0,
  truncate: 1 / 0,
  className: null,
  attributes: null,
  ignoreTags: [],
  render: null
};
function po(n, t = null) {
  let e = Object.assign({}, Nn);
  n && (e = Object.assign(e, n instanceof po ? n.o : n));
  const i = e.ignoreTags, s = [];
  for (let r = 0; r < i.length; r++)
    s.push(i[r].toUpperCase());
  this.o = e, t && (this.defaultRender = t), this.ignoreTags = s;
}
po.prototype = {
  o: Nn,
  /**
   * @type string[]
   */
  ignoreTags: [],
  /**
   * @param {IntermediateRepresentation} ir
   * @returns {any}
   */
  defaultRender(n) {
    return n;
  },
  /**
   * Returns true or false based on whether a token should be displayed as a
   * link based on the user options.
   * @param {MultiToken} token
   * @returns {boolean}
   */
  check(n) {
    return this.get("validate", n.toString(), n);
  },
  // Private methods
  /**
   * Resolve an option's value based on the value of the option and the given
   * params. If operator and token are specified and the target option is
   * callable, automatically calls the function with the given argument.
   * @template {keyof Opts} K
   * @param {K} key Name of option to use
   * @param {string} [operator] will be passed to the target option if it's a
   * function. If not specified, RAW function value gets returned
   * @param {MultiToken} [token] The token from linkify.tokenize
   * @returns {Opts[K] | any}
   */
  get(n, t, e) {
    const i = t != null;
    let s = this.o[n];
    return s && (typeof s == "object" ? (s = e.t in s ? s[e.t] : Nn[n], typeof s == "function" && i && (s = s(t, e))) : typeof s == "function" && i && (s = s(t, e.t, e)), s);
  },
  /**
   * @template {keyof Opts} L
   * @param {L} key Name of options object to use
   * @param {string} [operator]
   * @param {MultiToken} [token]
   * @returns {Opts[L] | any}
   */
  getObj(n, t, e) {
    let i = this.o[n];
    return typeof i == "function" && t != null && (i = i(t, e.t, e)), i;
  },
  /**
   * Convert the given token to a rendered element that may be added to the
   * calling-interface's DOM
   * @param {MultiToken} token Token to render to an HTML element
   * @returns {any} Render result; e.g., HTML string, DOM element, React
   *   Component, etc.
   */
  render(n) {
    const t = n.render(this);
    return (this.get("render", null, n) || this.defaultRender)(t, n.t, n);
  }
};
function Rl(n) {
  return n;
}
function Zc(n, t) {
  this.t = "token", this.v = n, this.tk = t;
}
Zc.prototype = {
  isLink: !1,
  /**
   * Return the string this token represents.
   * @return {string}
   */
  toString() {
    return this.v;
  },
  /**
   * What should the value for this token be in the `href` HTML attribute?
   * Returns the `.toString` value by default.
   * @param {string} [scheme]
   * @return {string}
   */
  toHref(n) {
    return this.toString();
  },
  /**
   * @param {Options} options Formatting options
   * @returns {string}
   */
  toFormattedString(n) {
    const t = this.toString(), e = n.get("truncate", t, this), i = n.get("format", t, this);
    return e && i.length > e ? i.substring(0, e) + "…" : i;
  },
  /**
   *
   * @param {Options} options
   * @returns {string}
   */
  toFormattedHref(n) {
    return n.get("formatHref", this.toHref(n.get("defaultProtocol")), this);
  },
  /**
   * The start index of this token in the original input string
   * @returns {number}
   */
  startIndex() {
    return this.tk[0].s;
  },
  /**
   * The end index of this token in the original input string (up to this
   * index but not including it)
   * @returns {number}
   */
  endIndex() {
    return this.tk[this.tk.length - 1].e;
  },
  /**
  	Returns an object  of relevant values for this token, which includes keys
  	* type - Kind of token ('url', 'email', etc.)
  	* value - Original text
  	* href - The value that should be added to the anchor tag's href
  		attribute
  		@method toObject
  	@param {string} [protocol] `'http'` by default
  */
  toObject(n = Nn.defaultProtocol) {
    return {
      type: this.t,
      value: this.toString(),
      isLink: this.isLink,
      href: this.toHref(n),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   *
   * @param {Options} options Formatting option
   */
  toFormattedObject(n) {
    return {
      type: this.t,
      value: this.toFormattedString(n),
      isLink: this.isLink,
      href: this.toFormattedHref(n),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   * Whether this token should be rendered as a link according to the given options
   * @param {Options} options
   * @returns {boolean}
   */
  validate(n) {
    return n.get("validate", this.toString(), this);
  },
  /**
   * Return an object that represents how this link should be rendered.
   * @param {Options} options Formattinng options
   */
  render(n) {
    const t = this, e = this.toHref(n.get("defaultProtocol")), i = n.get("formatHref", e, this), s = n.get("tagName", e, t), r = this.toFormattedString(n), o = {}, l = n.get("className", e, t), a = n.get("target", e, t), c = n.get("rel", e, t), d = n.getObj("attributes", e, t), u = n.getObj("events", e, t);
    return o.href = i, l && (o.class = l), a && (o.target = a), c && (o.rel = c), d && Object.assign(o, d), {
      tagName: s,
      attributes: o,
      content: r,
      eventListeners: u
    };
  }
};
function hs(n, t) {
  class e extends Zc {
    constructor(s, r) {
      super(s, r), this.t = n;
    }
  }
  for (const i in t)
    e.prototype[i] = t[i];
  return e.t = n, e;
}
const Il = hs("email", {
  isLink: !0,
  toHref() {
    return "mailto:" + this.toString();
  }
}), Dl = hs("text"), Eg = hs("nl"), Jn = hs("url", {
  isLink: !0,
  /**
  	Lowercases relevant parts of the domain and adds the protocol if
  	required. Note that this will not escape unsafe HTML characters in the
  	URL.
  		@param {string} [scheme] default scheme (e.g., 'https')
  	@return {string} the full href
  */
  toHref(n = Nn.defaultProtocol) {
    return this.hasProtocol() ? this.v : `${n}://${this.v}`;
  },
  /**
   * Check whether this URL token has a protocol
   * @return {boolean}
   */
  hasProtocol() {
    const n = this.tk;
    return n.length >= 2 && n[0].t !== Ln && n[1].t === Zt;
  }
}), wt = (n) => new ft(n);
function _g({
  groups: n
}) {
  const t = n.domain.concat([Bi, $i, Xt, zi, qi, Fi, Vi, ji, kt, ro, gn, Ui, Wi, Ki, Lt, Gi, yn, Ji]), e = [Hi, Zt, lo, At, ao, gn, bn, co, uo, _i, Ti, fn, mn, Si, Ci, Mi, Ei, Ai, Li, Ni, Oi, Ri, Ii, Di, Pi], i = [Bi, Hi, $i, zi, qi, Fi, Vi, ji, kt, fn, mn, gn, Ui, Wi, Ki, bn, Lt, Gi, yn, Ji], s = wt(), r = k(s, yn);
  O(r, i, r), O(r, n.domain, r);
  const o = wt(), l = wt(), a = wt();
  O(s, n.domain, o), O(s, n.scheme, l), O(s, n.slashscheme, a), O(o, i, r), O(o, n.domain, o);
  const c = k(o, Xt);
  k(r, Xt, c), k(l, Xt, c), k(a, Xt, c);
  const d = k(r, At);
  O(d, i, r), O(d, n.domain, r);
  const u = wt();
  O(c, n.domain, u), O(u, n.domain, u);
  const p = k(u, At);
  O(p, n.domain, u);
  const h = wt(Il);
  O(p, n.tld, h), O(p, n.utld, h), k(c, Ln, h);
  const f = k(u, kt);
  k(f, kt, f), O(f, n.domain, u), O(h, n.domain, u), k(h, At, p), k(h, kt, f);
  const g = k(h, Zt);
  O(g, n.numeric, Il);
  const m = k(o, kt), b = k(o, At);
  k(m, kt, m), O(m, n.domain, o), O(b, i, r), O(b, n.domain, o);
  const y = wt(Jn);
  O(b, n.tld, y), O(b, n.utld, y), O(y, n.domain, o), O(y, i, r), k(y, At, b), k(y, kt, m), k(y, Xt, c);
  const w = k(y, Zt), M = wt(Jn);
  O(w, n.numeric, M);
  const x = wt(Jn), N = wt();
  O(x, t, x), O(x, e, N), O(N, t, x), O(N, e, N), k(y, Lt, x), k(M, Lt, x);
  const S = k(l, Zt), A = k(a, Zt), I = k(A, Lt), P = k(I, Lt);
  O(l, n.domain, o), k(l, At, b), k(l, kt, m), O(a, n.domain, o), k(a, At, b), k(a, kt, m), O(S, n.domain, x), k(S, Lt, x), k(S, bn, x), O(P, n.domain, x), O(P, t, x), k(P, Lt, x);
  const Y = [
    [fn, mn],
    // {}
    [Ci, Si],
    // []
    [Mi, Ei],
    // ()
    [_i, Ti],
    // <>
    [Ai, Li],
    // （）
    [Ni, Oi],
    // 「」
    [Ri, Ii],
    // 『』
    [Di, Pi]
    // ＜＞
  ];
  for (let $ = 0; $ < Y.length; $++) {
    const [ut, Dt] = Y[$], fe = k(x, ut);
    k(N, ut, fe), k(fe, Dt, x);
    const Pt = wt(Jn);
    O(fe, t, Pt);
    const Bt = wt();
    O(fe, e), O(Pt, t, Pt), O(Pt, e, Bt), O(Bt, t, Pt), O(Bt, e, Bt), k(Pt, Dt, x), k(Bt, Dt, x);
  }
  return k(s, Ln, y), k(s, oo, Eg), {
    start: s,
    tokens: Xc
  };
}
function Tg(n, t, e) {
  let i = e.length, s = 0, r = [], o = [];
  for (; s < i; ) {
    let l = n, a = null, c = null, d = 0, u = null, p = -1;
    for (; s < i && !(a = l.go(e[s].t)); )
      o.push(e[s++]);
    for (; s < i && (c = a || l.go(e[s].t)); )
      a = null, l = c, l.accepts() ? (p = 0, u = l) : p >= 0 && p++, s++, d++;
    if (p < 0)
      s -= d, s < i && (o.push(e[s]), s++);
    else {
      o.length > 0 && (r.push(Vs(Dl, t, o)), o = []), s -= p, d -= p;
      const h = u.t, f = e.slice(s - d, s);
      r.push(Vs(h, t, f));
    }
  }
  return o.length > 0 && r.push(Vs(Dl, t, o)), r;
}
function Vs(n, t, e) {
  const i = e[0].s, s = e[e.length - 1].e, r = t.slice(i, s);
  return new n(r, e);
}
const Ag = typeof console < "u" && console && console.warn || (() => {
}), Lg = "until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.", q = {
  scanner: null,
  parser: null,
  tokenQueue: [],
  pluginQueue: [],
  customSchemes: [],
  initialized: !1
};
function Ng() {
  return ft.groups = {}, q.scanner = null, q.parser = null, q.tokenQueue = [], q.pluginQueue = [], q.customSchemes = [], q.initialized = !1, q;
}
function Pl(n, t = !1) {
  if (q.initialized && Ag(`linkifyjs: already initialized - will not register custom scheme "${n}" ${Lg}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(n))
    throw new Error(`linkifyjs: incorrect scheme format.
1. Must only contain digits, lowercase ASCII letters or "-"
2. Cannot start or end with "-"
3. "-" cannot repeat`);
  q.customSchemes.push([n, t]);
}
function Og() {
  q.scanner = Sg(q.customSchemes);
  for (let n = 0; n < q.tokenQueue.length; n++)
    q.tokenQueue[n][1]({
      scanner: q.scanner
    });
  q.parser = _g(q.scanner.tokens);
  for (let n = 0; n < q.pluginQueue.length; n++)
    q.pluginQueue[n][1]({
      scanner: q.scanner,
      parser: q.parser
    });
  return q.initialized = !0, q;
}
function ho(n) {
  return q.initialized || Og(), Tg(q.parser.start, n, Qc(q.scanner.start, n));
}
ho.scan = Qc;
function td(n, t = null, e = null) {
  if (t && typeof t == "object") {
    if (e)
      throw Error(`linkifyjs: Invalid link type ${t}; must be a string`);
    e = t, t = null;
  }
  const i = new po(e), s = ho(n), r = [];
  for (let o = 0; o < s.length; o++) {
    const l = s[o];
    l.isLink && (!t || l.t === t) && i.check(l) && r.push(l.toFormattedObject(i));
  }
  return r;
}
const fo = "[\0-   ᠎ -\u2029 　]", Rg = new RegExp(fo), Ig = new RegExp(`${fo}$`), Dg = new RegExp(fo, "g");
function Pg(n) {
  return n.length === 1 ? n[0].isLink : n.length === 3 && n[1].isLink ? ["()", "[]"].includes(n[0].value + n[2].value) : !1;
}
function Bg(n) {
  return new V({
    key: new J("autolink"),
    appendTransaction: (t, e, i) => {
      const s = t.some((c) => c.docChanged) && !e.doc.eq(i.doc), r = t.some((c) => c.getMeta("preventAutolink"));
      if (!s || r)
        return;
      const { tr: o } = i, l = Mf(e.doc, [...t]);
      if (Of(l).forEach(({ newRange: c }) => {
        const d = _f(i.doc, c, (h) => h.isTextblock);
        let u, p;
        if (d.length > 1)
          u = d[0], p = i.doc.textBetween(u.pos, u.pos + u.node.nodeSize, void 0, " ");
        else if (d.length) {
          const h = i.doc.textBetween(c.from, c.to, " ", " ");
          if (!Ig.test(h))
            return;
          u = d[0], p = i.doc.textBetween(u.pos, c.to, void 0, " ");
        }
        if (u && p) {
          const h = p.split(Rg).filter(Boolean);
          if (h.length <= 0)
            return !1;
          const f = h[h.length - 1], g = u.pos + p.lastIndexOf(f);
          if (!f)
            return !1;
          const m = ho(f).map((b) => b.toObject(n.defaultProtocol));
          if (!Pg(m))
            return !1;
          m.filter((b) => b.isLink).map((b) => ({
            ...b,
            from: g + b.start + 1,
            to: g + b.end + 1
          })).filter((b) => i.schema.marks.code ? !i.doc.rangeHasMark(b.from, b.to, i.schema.marks.code) : !0).filter((b) => n.validate(b.value)).filter((b) => n.shouldAutoLink(b.value)).forEach((b) => {
            io(b.from, b.to, i.doc).some((y) => y.mark.type === n.type) || o.addMark(b.from, b.to, n.type.create({
              href: b.href
            }));
          });
        }
      }), !!o.steps.length)
        return o;
    }
  });
}
function Hg(n) {
  return new V({
    key: new J("handleClickLink"),
    props: {
      handleClick: (t, e, i) => {
        var s, r;
        if (i.button !== 0 || !t.editable)
          return !1;
        let o = i.target;
        const l = [];
        for (; o.nodeName !== "DIV"; )
          l.push(o), o = o.parentNode;
        if (!l.find((p) => p.nodeName === "A"))
          return !1;
        const a = zc(t.state, n.type.name), c = i.target, d = (s = c == null ? void 0 : c.href) !== null && s !== void 0 ? s : a.href, u = (r = c == null ? void 0 : c.target) !== null && r !== void 0 ? r : a.target;
        return c && d ? (window.open(d, u), !0) : !1;
      }
    }
  });
}
function $g(n) {
  return new V({
    key: new J("handlePasteLink"),
    props: {
      handlePaste: (t, e, i) => {
        const { state: s } = t, { selection: r } = s, { empty: o } = r;
        if (o)
          return !1;
        let l = "";
        i.content.forEach((c) => {
          l += c.textContent;
        });
        const a = td(l, { defaultProtocol: n.defaultProtocol }).find((c) => c.isLink && c.value === l);
        return !l || !a ? !1 : n.editor.commands.setMark(n.type, {
          href: a.href
        });
      }
    }
  });
}
function me(n, t) {
  const e = [
    "http",
    "https",
    "ftp",
    "ftps",
    "mailto",
    "tel",
    "callto",
    "sms",
    "cid",
    "xmpp"
  ];
  return t && t.forEach((i) => {
    const s = typeof i == "string" ? i : i.scheme;
    s && e.push(s);
  }), !n || n.replace(Dg, "").match(new RegExp(
    // eslint-disable-next-line no-useless-escape
    `^(?:(?:${e.join("|")}):|[^a-z]|[a-z0-9+.-]+(?:[^a-z+.-:]|$))`,
    "i"
  ));
}
const zg = gt.create({
  name: "link",
  priority: 1e3,
  keepOnSplit: !1,
  exitable: !0,
  onCreate() {
    this.options.validate && !this.options.shouldAutoLink && (this.options.shouldAutoLink = this.options.validate, console.warn("The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.")), this.options.protocols.forEach((n) => {
      if (typeof n == "string") {
        Pl(n);
        return;
      }
      Pl(n.scheme, n.optionalSlashes);
    });
  },
  onDestroy() {
    Ng();
  },
  inclusive() {
    return this.options.autolink;
  },
  addOptions() {
    return {
      openOnClick: !0,
      linkOnPaste: !0,
      autolink: !0,
      protocols: [],
      defaultProtocol: "http",
      HTMLAttributes: {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
        class: null
      },
      isAllowedUri: (n, t) => !!me(n, t.protocols),
      validate: (n) => !!n,
      shouldAutoLink: (n) => !!n
    };
  },
  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML(n) {
          return n.getAttribute("href");
        }
      },
      target: {
        default: this.options.HTMLAttributes.target
      },
      rel: {
        default: this.options.HTMLAttributes.rel
      },
      class: {
        default: this.options.HTMLAttributes.class
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "a[href]",
        getAttrs: (n) => {
          const t = n.getAttribute("href");
          return !t || !this.options.isAllowedUri(t, {
            defaultValidate: (e) => !!me(e, this.options.protocols),
            protocols: this.options.protocols,
            defaultProtocol: this.options.defaultProtocol
          }) ? !1 : null;
        }
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return this.options.isAllowedUri(n.href, {
      defaultValidate: (t) => !!me(t, this.options.protocols),
      protocols: this.options.protocols,
      defaultProtocol: this.options.defaultProtocol
    }) ? ["a", D(this.options.HTMLAttributes, n), 0] : [
      "a",
      D(this.options.HTMLAttributes, { ...n, href: "" }),
      0
    ];
  },
  addCommands() {
    return {
      setLink: (n) => ({ chain: t }) => {
        const { href: e } = n;
        return this.options.isAllowedUri(e, {
          defaultValidate: (i) => !!me(i, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? t().setMark(this.name, n).setMeta("preventAutolink", !0).run() : !1;
      },
      toggleLink: (n) => ({ chain: t }) => {
        const { href: e } = n;
        return this.options.isAllowedUri(e, {
          defaultValidate: (i) => !!me(i, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? t().toggleMark(this.name, n, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run() : !1;
      },
      unsetLink: () => ({ chain: n }) => n().unsetMark(this.name, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run()
    };
  },
  addPasteRules() {
    return [
      de({
        find: (n) => {
          const t = [];
          if (n) {
            const { protocols: e, defaultProtocol: i } = this.options, s = td(n).filter((r) => r.isLink && this.options.isAllowedUri(r.value, {
              defaultValidate: (o) => !!me(o, e),
              protocols: e,
              defaultProtocol: i
            }));
            s.length && s.forEach((r) => t.push({
              text: r.value,
              data: {
                href: r.href
              },
              index: r.start
            }));
          }
          return t;
        },
        type: this.type,
        getAttributes: (n) => {
          var t;
          return {
            href: (t = n.data) === null || t === void 0 ? void 0 : t.href
          };
        }
      })
    ];
  },
  addProseMirrorPlugins() {
    const n = [], { protocols: t, defaultProtocol: e } = this.options;
    return this.options.autolink && n.push(Bg({
      type: this.type,
      defaultProtocol: this.options.defaultProtocol,
      validate: (i) => this.options.isAllowedUri(i, {
        defaultValidate: (s) => !!me(s, t),
        protocols: t,
        defaultProtocol: e
      }),
      shouldAutoLink: this.options.shouldAutoLink
    })), this.options.openOnClick === !0 && n.push(Hg({
      type: this.type
    })), this.options.linkOnPaste && n.push($g({
      editor: this.editor,
      defaultProtocol: this.options.defaultProtocol,
      type: this.type
    })), n;
  }
}), qg = K.create({
  name: "textAlign",
  addOptions() {
    return {
      types: [],
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: null
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (n) => {
              const t = n.style.textAlign;
              return this.options.alignments.includes(t) ? t : this.options.defaultAlignment;
            },
            renderHTML: (n) => n.textAlign ? { style: `text-align: ${n.textAlign}` } : {}
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setTextAlign: (n) => ({ commands: t }) => this.options.alignments.includes(n) ? this.options.types.map((e) => t.updateAttributes(e, { textAlign: n })).every((e) => e) : !1,
      unsetTextAlign: () => ({ commands: n }) => this.options.types.map((t) => n.resetAttributes(t, "textAlign")).every((t) => t),
      toggleTextAlign: (n) => ({ editor: t, commands: e }) => this.options.alignments.includes(n) ? t.isActive({ textAlign: n }) ? e.unsetTextAlign() : e.setTextAlign(n) : !1
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-l": () => this.editor.commands.setTextAlign("left"),
      "Mod-Shift-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-r": () => this.editor.commands.setTextAlign("right"),
      "Mod-Shift-j": () => this.editor.commands.setTextAlign("justify")
    };
  }
}), Fg = K.create({
  name: "placeholder",
  addOptions() {
    return {
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
      placeholder: "Write something …",
      showOnlyWhenEditable: !0,
      showOnlyCurrent: !0,
      includeChildren: !1
    };
  },
  addProseMirrorPlugins() {
    return [
      new V({
        key: new J("placeholder"),
        props: {
          decorations: ({ doc: n, selection: t }) => {
            const e = this.editor.isEditable || !this.options.showOnlyWhenEditable, { anchor: i } = t, s = [];
            if (!e)
              return null;
            const r = this.editor.isEmpty;
            return n.descendants((o, l) => {
              const a = i >= l && i <= l + o.nodeSize, c = !o.isLeaf && ps(o);
              if ((a || !this.options.showOnlyCurrent) && c) {
                const d = [this.options.emptyNodeClass];
                r && d.push(this.options.emptyEditorClass);
                const u = ot.node(l, l + o.nodeSize, {
                  class: d.join(" "),
                  "data-placeholder": typeof this.options.placeholder == "function" ? this.options.placeholder({
                    editor: this.editor,
                    node: o,
                    pos: l,
                    hasAnchor: a
                  }) : this.options.placeholder
                });
                s.push(u);
              }
              return this.options.includeChildren;
            }), F.create(n, s);
          }
        }
      })
    ];
  }
}), Vg = K.create({
  name: "characterCount",
  addOptions() {
    return {
      limit: null,
      mode: "textSize",
      textCounter: (n) => n.length,
      wordCounter: (n) => n.split(" ").filter((t) => t !== "").length
    };
  },
  addStorage() {
    return {
      characters: () => 0,
      words: () => 0
    };
  },
  onBeforeCreate() {
    this.storage.characters = (n) => {
      const t = (n == null ? void 0 : n.node) || this.editor.state.doc;
      if (((n == null ? void 0 : n.mode) || this.options.mode) === "textSize") {
        const i = t.textBetween(0, t.content.size, void 0, " ");
        return this.options.textCounter(i);
      }
      return t.nodeSize;
    }, this.storage.words = (n) => {
      const t = (n == null ? void 0 : n.node) || this.editor.state.doc, e = t.textBetween(0, t.content.size, " ", " ");
      return this.options.wordCounter(e);
    };
  },
  addProseMirrorPlugins() {
    let n = !1;
    return [
      new V({
        key: new J("characterCount"),
        appendTransaction: (t, e, i) => {
          if (n)
            return;
          const s = this.options.limit;
          if (s == null || s === 0) {
            n = !0;
            return;
          }
          const r = this.storage.characters({ node: i.doc });
          if (r > s) {
            const o = r - s, l = 0, a = o;
            console.warn(`[CharacterCount] Initial content exceeded limit of ${s} characters. Content was automatically trimmed.`);
            const c = i.tr.deleteRange(l, a);
            return n = !0, c;
          }
          n = !0;
        },
        filterTransaction: (t, e) => {
          const i = this.options.limit;
          if (!t.docChanged || i === 0 || i === null || i === void 0)
            return !0;
          const s = this.storage.characters({ node: e.doc }), r = this.storage.characters({ node: t.doc });
          if (r <= i || s > i && r > i && r <= s)
            return !0;
          if (s > i && r > i && r > s || !t.getMeta("paste"))
            return !1;
          const l = t.selection.$head.pos, a = r - i, c = l - a, d = l;
          return t.deleteRange(c, d), !(this.storage.characters({ node: t.doc }) > i);
        }
      })
    ];
  }
}), jg = gt.create({
  name: "subscript",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "sub"
      },
      {
        style: "vertical-align",
        getAttrs(n) {
          return n !== "sub" ? !1 : null;
        }
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["sub", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setSubscript: () => ({ commands: n }) => n.setMark(this.name),
      toggleSubscript: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetSubscript: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-,": () => this.editor.commands.toggleSubscript()
    };
  }
}), Ug = gt.create({
  name: "superscript",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "sup"
      },
      {
        style: "vertical-align",
        getAttrs(n) {
          return n !== "super" ? !1 : null;
        }
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["sup", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setSuperscript: () => ({ commands: n }) => n.setMark(this.name),
      toggleSuperscript: () => ({ commands: n }) => n.toggleMark(this.name),
      unsetSuperscript: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-.": () => this.editor.commands.toggleSuperscript()
    };
  }
}), Wg = (n) => {
  if (!n.children.length)
    return;
  const t = n.querySelectorAll("span");
  t && t.forEach((e) => {
    var i, s;
    const r = e.getAttribute("style"), o = (s = (i = e.parentElement) === null || i === void 0 ? void 0 : i.closest("span")) === null || s === void 0 ? void 0 : s.getAttribute("style");
    e.setAttribute("style", `${o};${r}`);
  });
}, Kg = gt.create({
  name: "textStyle",
  priority: 101,
  addOptions() {
    return {
      HTMLAttributes: {},
      mergeNestedSpanStyles: !1
    };
  },
  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (n) => n.hasAttribute("style") ? (this.options.mergeNestedSpanStyles && Wg(n), {}) : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["span", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ tr: n }) => {
        const { selection: t } = n;
        return n.doc.nodesBetween(t.from, t.to, (e, i) => {
          if (e.isTextblock)
            return !0;
          e.marks.filter((s) => s.type === this.type).some((s) => Object.values(s.attrs).some((r) => !!r)) || n.removeMark(i, i + e.nodeSize, this.type);
        }), !0;
      }
    };
  }
}), Jg = K.create({
  name: "color",
  addOptions() {
    return {
      types: ["textStyle"]
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (n) => {
              var t;
              return (t = n.style.color) === null || t === void 0 ? void 0 : t.replace(/['"]+/g, "");
            },
            renderHTML: (n) => n.color ? {
              style: `color: ${n.color}`
            } : {}
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setColor: (n) => ({ chain: t }) => t().setMark("textStyle", { color: n }).run(),
      unsetColor: () => ({ chain: n }) => n().setMark("textStyle", { color: null }).removeEmptyTextStyle().run()
    };
  }
}), Gg = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))$/, Yg = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))/g, Xg = gt.create({
  name: "highlight",
  addOptions() {
    return {
      multicolor: !1,
      HTMLAttributes: {}
    };
  },
  addAttributes() {
    return this.options.multicolor ? {
      color: {
        default: null,
        parseHTML: (n) => n.getAttribute("data-color") || n.style.backgroundColor,
        renderHTML: (n) => n.color ? {
          "data-color": n.color,
          style: `background-color: ${n.color}; color: inherit`
        } : {}
      }
    } : {};
  },
  parseHTML() {
    return [
      {
        tag: "mark"
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["mark", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      setHighlight: (n) => ({ commands: t }) => t.setMark(this.name, n),
      toggleHighlight: (n) => ({ commands: t }) => t.toggleMark(this.name, n),
      unsetHighlight: () => ({ commands: n }) => n.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.toggleHighlight()
    };
  },
  addInputRules() {
    return [
      Ne({
        find: Gg,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      de({
        find: Yg,
        type: this.type
      })
    ];
  }
});
let xr, Cr;
if (typeof WeakMap < "u") {
  let n = /* @__PURE__ */ new WeakMap();
  xr = (t) => n.get(t), Cr = (t, e) => (n.set(t, e), e);
} else {
  const n = [];
  let e = 0;
  xr = (i) => {
    for (let s = 0; s < n.length; s += 2) if (n[s] == i) return n[s + 1];
  }, Cr = (i, s) => (e == 10 && (e = 0), n[e++] = i, n[e++] = s);
}
var W = class {
  constructor(n, t, e, i) {
    this.width = n, this.height = t, this.map = e, this.problems = i;
  }
  findCell(n) {
    for (let t = 0; t < this.map.length; t++) {
      const e = this.map[t];
      if (e != n) continue;
      const i = t % this.width, s = t / this.width | 0;
      let r = i + 1, o = s + 1;
      for (let l = 1; r < this.width && this.map[t + l] == e; l++) r++;
      for (let l = 1; o < this.height && this.map[t + this.width * l] == e; l++) o++;
      return {
        left: i,
        top: s,
        right: r,
        bottom: o
      };
    }
    throw new RangeError(`No cell with offset ${n} found`);
  }
  colCount(n) {
    for (let t = 0; t < this.map.length; t++) if (this.map[t] == n) return t % this.width;
    throw new RangeError(`No cell with offset ${n} found`);
  }
  nextCell(n, t, e) {
    const { left: i, right: s, top: r, bottom: o } = this.findCell(n);
    return t == "horiz" ? (e < 0 ? i == 0 : s == this.width) ? null : this.map[r * this.width + (e < 0 ? i - 1 : s)] : (e < 0 ? r == 0 : o == this.height) ? null : this.map[i + this.width * (e < 0 ? r - 1 : o)];
  }
  rectBetween(n, t) {
    const { left: e, right: i, top: s, bottom: r } = this.findCell(n), { left: o, right: l, top: a, bottom: c } = this.findCell(t);
    return {
      left: Math.min(e, o),
      top: Math.min(s, a),
      right: Math.max(i, l),
      bottom: Math.max(r, c)
    };
  }
  cellsInRect(n) {
    const t = [], e = {};
    for (let i = n.top; i < n.bottom; i++) for (let s = n.left; s < n.right; s++) {
      const r = i * this.width + s, o = this.map[r];
      e[o] || (e[o] = !0, !(s == n.left && s && this.map[r - 1] == o || i == n.top && i && this.map[r - this.width] == o) && t.push(o));
    }
    return t;
  }
  positionAt(n, t, e) {
    for (let i = 0, s = 0; ; i++) {
      const r = s + e.child(i).nodeSize;
      if (i == n) {
        let o = t + n * this.width;
        const l = (n + 1) * this.width;
        for (; o < l && this.map[o] < s; ) o++;
        return o == l ? r - 1 : this.map[o];
      }
      s = r;
    }
  }
  static get(n) {
    return xr(n) || Cr(n, Qg(n));
  }
};
function Qg(n) {
  if (n.type.spec.tableRole != "table") throw new RangeError("Not a table node: " + n.type.name);
  const t = Zg(n), e = n.childCount, i = [];
  let s = 0, r = null;
  const o = [];
  for (let c = 0, d = t * e; c < d; c++) i[c] = 0;
  for (let c = 0, d = 0; c < e; c++) {
    const u = n.child(c);
    d++;
    for (let f = 0; ; f++) {
      for (; s < i.length && i[s] != 0; ) s++;
      if (f == u.childCount) break;
      const g = u.child(f), { colspan: m, rowspan: b, colwidth: y } = g.attrs;
      for (let w = 0; w < b; w++) {
        if (w + c >= e) {
          (r || (r = [])).push({
            type: "overlong_rowspan",
            pos: d,
            n: b - w
          });
          break;
        }
        const M = s + w * t;
        for (let x = 0; x < m; x++) {
          i[M + x] == 0 ? i[M + x] = d : (r || (r = [])).push({
            type: "collision",
            row: c,
            pos: d,
            n: m - x
          });
          const N = y && y[x];
          if (N) {
            const S = (M + x) % t * 2, A = o[S];
            A == null || A != N && o[S + 1] == 1 ? (o[S] = N, o[S + 1] = 1) : A == N && o[S + 1]++;
          }
        }
      }
      s += m, d += g.nodeSize;
    }
    const p = (c + 1) * t;
    let h = 0;
    for (; s < p; ) i[s++] == 0 && h++;
    h && (r || (r = [])).push({
      type: "missing",
      row: c,
      n: h
    }), d++;
  }
  (t === 0 || e === 0) && (r || (r = [])).push({ type: "zero_sized" });
  const l = new W(t, e, i, r);
  let a = !1;
  for (let c = 0; !a && c < o.length; c += 2) o[c] != null && o[c + 1] < e && (a = !0);
  return a && tb(l, o, n), l;
}
function Zg(n) {
  let t = -1, e = !1;
  for (let i = 0; i < n.childCount; i++) {
    const s = n.child(i);
    let r = 0;
    if (e) for (let o = 0; o < i; o++) {
      const l = n.child(o);
      for (let a = 0; a < l.childCount; a++) {
        const c = l.child(a);
        o + c.attrs.rowspan > i && (r += c.attrs.colspan);
      }
    }
    for (let o = 0; o < s.childCount; o++) {
      const l = s.child(o);
      r += l.attrs.colspan, l.attrs.rowspan > 1 && (e = !0);
    }
    t == -1 ? t = r : t != r && (t = Math.max(t, r));
  }
  return t;
}
function tb(n, t, e) {
  n.problems || (n.problems = []);
  const i = {};
  for (let s = 0; s < n.map.length; s++) {
    const r = n.map[s];
    if (i[r]) continue;
    i[r] = !0;
    const o = e.nodeAt(r);
    if (!o) throw new RangeError(`No cell with offset ${r} found`);
    let l = null;
    const a = o.attrs;
    for (let c = 0; c < a.colspan; c++) {
      const d = t[(s + c) % n.width * 2];
      d != null && (!a.colwidth || a.colwidth[c] != d) && ((l || (l = eb(a)))[c] = d);
    }
    l && n.problems.unshift({
      type: "colwidth mismatch",
      pos: r,
      colwidth: l
    });
  }
}
function eb(n) {
  if (n.colwidth) return n.colwidth.slice();
  const t = [];
  for (let e = 0; e < n.colspan; e++) t.push(0);
  return t;
}
function ct(n) {
  let t = n.cached.tableNodeTypes;
  if (!t) {
    t = n.cached.tableNodeTypes = {};
    for (const e in n.nodes) {
      const i = n.nodes[e], s = i.spec.tableRole;
      s && (t[s] = i);
    }
  }
  return t;
}
const te = new J("selectingCells");
function Oe(n) {
  for (let t = n.depth - 1; t > 0; t--) if (n.node(t).type.spec.tableRole == "row") return n.node(0).resolve(n.before(t + 1));
  return null;
}
function nb(n) {
  for (let t = n.depth; t > 0; t--) {
    const e = n.node(t).type.spec.tableRole;
    if (e === "cell" || e === "header_cell") return n.node(t);
  }
  return null;
}
function _t(n) {
  const t = n.selection.$head;
  for (let e = t.depth; e > 0; e--) if (t.node(e).type.spec.tableRole == "row") return !0;
  return !1;
}
function fs(n) {
  const t = n.selection;
  if ("$anchorCell" in t && t.$anchorCell) return t.$anchorCell.pos > t.$headCell.pos ? t.$anchorCell : t.$headCell;
  if ("node" in t && t.node && t.node.type.spec.tableRole == "cell") return t.$anchor;
  const e = Oe(t.$head) || ib(t.$head);
  if (e) return e;
  throw new RangeError(`No cell found around position ${t.head}`);
}
function ib(n) {
  for (let t = n.nodeAfter, e = n.pos; t; t = t.firstChild, e++) {
    const i = t.type.spec.tableRole;
    if (i == "cell" || i == "header_cell") return n.doc.resolve(e);
  }
  for (let t = n.nodeBefore, e = n.pos; t; t = t.lastChild, e--) {
    const i = t.type.spec.tableRole;
    if (i == "cell" || i == "header_cell") return n.doc.resolve(e - t.nodeSize);
  }
}
function Sr(n) {
  return n.parent.type.spec.tableRole == "row" && !!n.nodeAfter;
}
function sb(n) {
  return n.node(0).resolve(n.pos + n.nodeAfter.nodeSize);
}
function mo(n, t) {
  return n.depth == t.depth && n.pos >= t.start(-1) && n.pos <= t.end(-1);
}
function ed(n, t, e) {
  const i = n.node(-1), s = W.get(i), r = n.start(-1), o = s.nextCell(n.pos - r, t, e);
  return o == null ? null : n.node(0).resolve(r + o);
}
function Re(n, t, e = 1) {
  const i = {
    ...n,
    colspan: n.colspan - e
  };
  return i.colwidth && (i.colwidth = i.colwidth.slice(), i.colwidth.splice(t, e), i.colwidth.some((s) => s > 0) || (i.colwidth = null)), i;
}
function nd(n, t, e = 1) {
  const i = {
    ...n,
    colspan: n.colspan + e
  };
  if (i.colwidth) {
    i.colwidth = i.colwidth.slice();
    for (let s = 0; s < e; s++) i.colwidth.splice(t, 0, 0);
  }
  return i;
}
function rb(n, t, e) {
  const i = ct(t.type.schema).header_cell;
  for (let s = 0; s < n.height; s++) if (t.nodeAt(n.map[e + s * n.width]).type != i) return !1;
  return !0;
}
var z = class Ft extends L {
  constructor(t, e = t) {
    const i = t.node(-1), s = W.get(i), r = t.start(-1), o = s.rectBetween(t.pos - r, e.pos - r), l = t.node(0), a = s.cellsInRect(o).filter((d) => d != e.pos - r);
    a.unshift(e.pos - r);
    const c = a.map((d) => {
      const u = i.nodeAt(d);
      if (!u) throw new RangeError(`No cell with offset ${d} found`);
      const p = r + d + 1;
      return new Ra(l.resolve(p), l.resolve(p + u.content.size));
    });
    super(c[0].$from, c[0].$to, c), this.$anchorCell = t, this.$headCell = e;
  }
  map(t, e) {
    const i = t.resolve(e.map(this.$anchorCell.pos)), s = t.resolve(e.map(this.$headCell.pos));
    if (Sr(i) && Sr(s) && mo(i, s)) {
      const r = this.$anchorCell.node(-1) != i.node(-1);
      return r && this.isRowSelection() ? Ft.rowSelection(i, s) : r && this.isColSelection() ? Ft.colSelection(i, s) : new Ft(i, s);
    }
    return T.between(i, s);
  }
  content() {
    const t = this.$anchorCell.node(-1), e = W.get(t), i = this.$anchorCell.start(-1), s = e.rectBetween(this.$anchorCell.pos - i, this.$headCell.pos - i), r = {}, o = [];
    for (let a = s.top; a < s.bottom; a++) {
      const c = [];
      for (let d = a * e.width + s.left, u = s.left; u < s.right; u++, d++) {
        const p = e.map[d];
        if (r[p]) continue;
        r[p] = !0;
        const h = e.findCell(p);
        let f = t.nodeAt(p);
        if (!f) throw new RangeError(`No cell with offset ${p} found`);
        const g = s.left - h.left, m = h.right - s.right;
        if (g > 0 || m > 0) {
          let b = f.attrs;
          if (g > 0 && (b = Re(b, 0, g)), m > 0 && (b = Re(b, b.colspan - m, m)), h.left < s.left) {
            if (f = f.type.createAndFill(b), !f) throw new RangeError(`Could not create cell with attrs ${JSON.stringify(b)}`);
          } else f = f.type.create(b, f.content);
        }
        if (h.top < s.top || h.bottom > s.bottom) {
          const b = {
            ...f.attrs,
            rowspan: Math.min(h.bottom, s.bottom) - Math.max(h.top, s.top)
          };
          h.top < s.top ? f = f.type.createAndFill(b) : f = f.type.create(b, f.content);
        }
        c.push(f);
      }
      o.push(t.child(a).copy(v.from(c)));
    }
    const l = this.isColSelection() && this.isRowSelection() ? t : o;
    return new C(v.from(l), 1, 1);
  }
  replace(t, e = C.empty) {
    const i = t.steps.length, s = this.ranges;
    for (let o = 0; o < s.length; o++) {
      const { $from: l, $to: a } = s[o], c = t.mapping.slice(i);
      t.replace(c.map(l.pos), c.map(a.pos), o ? C.empty : e);
    }
    const r = L.findFrom(t.doc.resolve(t.mapping.slice(i).map(this.to)), -1);
    r && t.setSelection(r);
  }
  replaceWith(t, e) {
    this.replace(t, new C(v.from(e), 0, 0));
  }
  forEachCell(t) {
    const e = this.$anchorCell.node(-1), i = W.get(e), s = this.$anchorCell.start(-1), r = i.cellsInRect(i.rectBetween(this.$anchorCell.pos - s, this.$headCell.pos - s));
    for (let o = 0; o < r.length; o++) t(e.nodeAt(r[o]), s + r[o]);
  }
  isColSelection() {
    const t = this.$anchorCell.index(-1), e = this.$headCell.index(-1);
    if (Math.min(t, e) > 0) return !1;
    const i = t + this.$anchorCell.nodeAfter.attrs.rowspan, s = e + this.$headCell.nodeAfter.attrs.rowspan;
    return Math.max(i, s) == this.$headCell.node(-1).childCount;
  }
  static colSelection(t, e = t) {
    const i = t.node(-1), s = W.get(i), r = t.start(-1), o = s.findCell(t.pos - r), l = s.findCell(e.pos - r), a = t.node(0);
    return o.top <= l.top ? (o.top > 0 && (t = a.resolve(r + s.map[o.left])), l.bottom < s.height && (e = a.resolve(r + s.map[s.width * (s.height - 1) + l.right - 1]))) : (l.top > 0 && (e = a.resolve(r + s.map[l.left])), o.bottom < s.height && (t = a.resolve(r + s.map[s.width * (s.height - 1) + o.right - 1]))), new Ft(t, e);
  }
  isRowSelection() {
    const t = this.$anchorCell.node(-1), e = W.get(t), i = this.$anchorCell.start(-1), s = e.colCount(this.$anchorCell.pos - i), r = e.colCount(this.$headCell.pos - i);
    if (Math.min(s, r) > 0) return !1;
    const o = s + this.$anchorCell.nodeAfter.attrs.colspan, l = r + this.$headCell.nodeAfter.attrs.colspan;
    return Math.max(o, l) == e.width;
  }
  eq(t) {
    return t instanceof Ft && t.$anchorCell.pos == this.$anchorCell.pos && t.$headCell.pos == this.$headCell.pos;
  }
  static rowSelection(t, e = t) {
    const i = t.node(-1), s = W.get(i), r = t.start(-1), o = s.findCell(t.pos - r), l = s.findCell(e.pos - r), a = t.node(0);
    return o.left <= l.left ? (o.left > 0 && (t = a.resolve(r + s.map[o.top * s.width])), l.right < s.width && (e = a.resolve(r + s.map[s.width * (l.top + 1) - 1]))) : (l.left > 0 && (e = a.resolve(r + s.map[l.top * s.width])), o.right < s.width && (t = a.resolve(r + s.map[s.width * (o.top + 1) - 1]))), new Ft(t, e);
  }
  toJSON() {
    return {
      type: "cell",
      anchor: this.$anchorCell.pos,
      head: this.$headCell.pos
    };
  }
  static fromJSON(t, e) {
    return new Ft(t.resolve(e.anchor), t.resolve(e.head));
  }
  static create(t, e, i = e) {
    return new Ft(t.resolve(e), t.resolve(i));
  }
  getBookmark() {
    return new ob(this.$anchorCell.pos, this.$headCell.pos);
  }
};
z.prototype.visible = !1;
L.jsonID("cell", z);
var ob = class id {
  constructor(t, e) {
    this.anchor = t, this.head = e;
  }
  map(t) {
    return new id(t.map(this.anchor), t.map(this.head));
  }
  resolve(t) {
    const e = t.resolve(this.anchor), i = t.resolve(this.head);
    return e.parent.type.spec.tableRole == "row" && i.parent.type.spec.tableRole == "row" && e.index() < e.parent.childCount && i.index() < i.parent.childCount && mo(e, i) ? new z(e, i) : L.near(i, 1);
  }
};
function lb(n) {
  if (!(n.selection instanceof z)) return null;
  const t = [];
  return n.selection.forEachCell((e, i) => {
    t.push(ot.node(i, i + e.nodeSize, { class: "selectedCell" }));
  }), F.create(n.doc, t);
}
function ab({ $from: n, $to: t }) {
  if (n.pos == t.pos || n.pos < t.pos - 6) return !1;
  let e = n.pos, i = t.pos, s = n.depth;
  for (; s >= 0 && !(n.after(s + 1) < n.end(s)); s--, e++) ;
  for (let r = t.depth; r >= 0 && !(t.before(r + 1) > t.start(r)); r--, i--) ;
  return e == i && /row|table/.test(n.node(s).type.spec.tableRole);
}
function cb({ $from: n, $to: t }) {
  let e, i;
  for (let s = n.depth; s > 0; s--) {
    const r = n.node(s);
    if (r.type.spec.tableRole === "cell" || r.type.spec.tableRole === "header_cell") {
      e = r;
      break;
    }
  }
  for (let s = t.depth; s > 0; s--) {
    const r = t.node(s);
    if (r.type.spec.tableRole === "cell" || r.type.spec.tableRole === "header_cell") {
      i = r;
      break;
    }
  }
  return e !== i && t.parentOffset === 0;
}
function db(n, t, e) {
  const i = (t || n).selection, s = (t || n).doc;
  let r, o;
  if (i instanceof _ && (o = i.node.type.spec.tableRole)) {
    if (o == "cell" || o == "header_cell") r = z.create(s, i.from);
    else if (o == "row") {
      const l = s.resolve(i.from + 1);
      r = z.rowSelection(l, l);
    } else if (!e) {
      const l = W.get(i.node), a = i.from + 1, c = a + l.map[l.width * l.height - 1];
      r = z.create(s, a + 1, c);
    }
  } else i instanceof T && ab(i) ? r = T.create(s, i.from) : i instanceof T && cb(i) && (r = T.create(s, i.$from.start(), i.$from.end()));
  return r && (t || (t = n.tr)).setSelection(r), t;
}
const ub = new J("fix-tables");
function sd(n, t, e, i) {
  const s = n.childCount, r = t.childCount;
  t: for (let o = 0, l = 0; o < r; o++) {
    const a = t.child(o);
    for (let c = l, d = Math.min(s, o + 3); c < d; c++) if (n.child(c) == a) {
      l = c + 1, e += a.nodeSize;
      continue t;
    }
    i(a, e), l < s && n.child(l).sameMarkup(a) ? sd(n.child(l), a, e + 1, i) : a.nodesBetween(0, a.content.size, i, e + 1), e += a.nodeSize;
  }
}
function rd(n, t) {
  let e;
  const i = (s, r) => {
    s.type.spec.tableRole == "table" && (e = pb(n, s, r, e));
  };
  return t ? t.doc != n.doc && sd(t.doc, n.doc, 0, i) : n.doc.descendants(i), e;
}
function pb(n, t, e, i) {
  const s = W.get(t);
  if (!s.problems) return i;
  i || (i = n.tr);
  const r = [];
  for (let a = 0; a < s.height; a++) r.push(0);
  for (let a = 0; a < s.problems.length; a++) {
    const c = s.problems[a];
    if (c.type == "collision") {
      const d = t.nodeAt(c.pos);
      if (!d) continue;
      const u = d.attrs;
      for (let p = 0; p < u.rowspan; p++) r[c.row + p] += c.n;
      i.setNodeMarkup(i.mapping.map(e + 1 + c.pos), null, Re(u, u.colspan - c.n, c.n));
    } else if (c.type == "missing") r[c.row] += c.n;
    else if (c.type == "overlong_rowspan") {
      const d = t.nodeAt(c.pos);
      if (!d) continue;
      i.setNodeMarkup(i.mapping.map(e + 1 + c.pos), null, {
        ...d.attrs,
        rowspan: d.attrs.rowspan - c.n
      });
    } else if (c.type == "colwidth mismatch") {
      const d = t.nodeAt(c.pos);
      if (!d) continue;
      i.setNodeMarkup(i.mapping.map(e + 1 + c.pos), null, {
        ...d.attrs,
        colwidth: c.colwidth
      });
    } else if (c.type == "zero_sized") {
      const d = i.mapping.map(e);
      i.delete(d, d + t.nodeSize);
    }
  }
  let o, l;
  for (let a = 0; a < r.length; a++) r[a] && (o == null && (o = a), l = a);
  for (let a = 0, c = e + 1; a < s.height; a++) {
    const d = t.child(a), u = c + d.nodeSize, p = r[a];
    if (p > 0) {
      let h = "cell";
      d.firstChild && (h = d.firstChild.type.spec.tableRole);
      const f = [];
      for (let m = 0; m < p; m++) {
        const b = ct(n.schema)[h].createAndFill();
        b && f.push(b);
      }
      const g = (a == 0 || o == a - 1) && l == a ? c + 1 : u - 1;
      i.insert(i.mapping.map(g), f);
    }
    c = u;
  }
  return i.setMeta(ub, { fixTables: !0 });
}
function It(n) {
  const t = n.selection, e = fs(n), i = e.node(-1), s = e.start(-1), r = W.get(i);
  return {
    ...t instanceof z ? r.rectBetween(t.$anchorCell.pos - s, t.$headCell.pos - s) : r.findCell(e.pos - s),
    tableStart: s,
    map: r,
    table: i
  };
}
function od(n, { map: t, tableStart: e, table: i }, s) {
  let r = s > 0 ? -1 : 0;
  rb(t, i, s + r) && (r = s == 0 || s == t.width ? null : 0);
  for (let o = 0; o < t.height; o++) {
    const l = o * t.width + s;
    if (s > 0 && s < t.width && t.map[l - 1] == t.map[l]) {
      const a = t.map[l], c = i.nodeAt(a);
      n.setNodeMarkup(n.mapping.map(e + a), null, nd(c.attrs, s - t.colCount(a))), o += c.attrs.rowspan - 1;
    } else {
      const a = r == null ? ct(i.type.schema).cell : i.nodeAt(t.map[l + r]).type, c = t.positionAt(o, s, i);
      n.insert(n.mapping.map(e + c), a.createAndFill());
    }
  }
  return n;
}
function hb(n, t) {
  if (!_t(n)) return !1;
  if (t) {
    const e = It(n);
    t(od(n.tr, e, e.left));
  }
  return !0;
}
function fb(n, t) {
  if (!_t(n)) return !1;
  if (t) {
    const e = It(n);
    t(od(n.tr, e, e.right));
  }
  return !0;
}
function mb(n, { map: t, table: e, tableStart: i }, s) {
  const r = n.mapping.maps.length;
  for (let o = 0; o < t.height; ) {
    const l = o * t.width + s, a = t.map[l], c = e.nodeAt(a), d = c.attrs;
    if (s > 0 && t.map[l - 1] == a || s < t.width - 1 && t.map[l + 1] == a) n.setNodeMarkup(n.mapping.slice(r).map(i + a), null, Re(d, s - t.colCount(a)));
    else {
      const u = n.mapping.slice(r).map(i + a);
      n.delete(u, u + c.nodeSize);
    }
    o += d.rowspan;
  }
}
function gb(n, t) {
  if (!_t(n)) return !1;
  if (t) {
    const e = It(n), i = n.tr;
    if (e.left == 0 && e.right == e.map.width) return !1;
    for (let s = e.right - 1; mb(i, e, s), s != e.left; s--) {
      const r = e.tableStart ? i.doc.nodeAt(e.tableStart - 1) : i.doc;
      if (!r) throw new RangeError("No table found");
      e.table = r, e.map = W.get(r);
    }
    t(i);
  }
  return !0;
}
function bb(n, t, e) {
  var i;
  const s = ct(t.type.schema).header_cell;
  for (let r = 0; r < n.width; r++) if (((i = t.nodeAt(n.map[r + e * n.width])) === null || i === void 0 ? void 0 : i.type) != s) return !1;
  return !0;
}
function ld(n, { map: t, tableStart: e, table: i }, s) {
  let r = e;
  for (let c = 0; c < s; c++) r += i.child(c).nodeSize;
  const o = [];
  let l = s > 0 ? -1 : 0;
  bb(t, i, s + l) && (l = s == 0 || s == t.height ? null : 0);
  for (let c = 0, d = t.width * s; c < t.width; c++, d++) if (s > 0 && s < t.height && t.map[d] == t.map[d - t.width]) {
    const u = t.map[d], p = i.nodeAt(u).attrs;
    n.setNodeMarkup(e + u, null, {
      ...p,
      rowspan: p.rowspan + 1
    }), c += p.colspan - 1;
  } else {
    var a;
    const u = l == null ? ct(i.type.schema).cell : (a = i.nodeAt(t.map[d + l * t.width])) === null || a === void 0 ? void 0 : a.type, p = u == null ? void 0 : u.createAndFill();
    p && o.push(p);
  }
  return n.insert(r, ct(i.type.schema).row.create(null, o)), n;
}
function yb(n, t) {
  if (!_t(n)) return !1;
  if (t) {
    const e = It(n);
    t(ld(n.tr, e, e.top));
  }
  return !0;
}
function vb(n, t) {
  if (!_t(n)) return !1;
  if (t) {
    const e = It(n);
    t(ld(n.tr, e, e.bottom));
  }
  return !0;
}
function wb(n, { map: t, table: e, tableStart: i }, s) {
  let r = 0;
  for (let c = 0; c < s; c++) r += e.child(c).nodeSize;
  const o = r + e.child(s).nodeSize, l = n.mapping.maps.length;
  n.delete(r + i, o + i);
  const a = /* @__PURE__ */ new Set();
  for (let c = 0, d = s * t.width; c < t.width; c++, d++) {
    const u = t.map[d];
    if (!a.has(u)) {
      if (a.add(u), s > 0 && u == t.map[d - t.width]) {
        const p = e.nodeAt(u).attrs;
        n.setNodeMarkup(n.mapping.slice(l).map(u + i), null, {
          ...p,
          rowspan: p.rowspan - 1
        }), c += p.colspan - 1;
      } else if (s < t.height && u == t.map[d + t.width]) {
        const p = e.nodeAt(u), h = p.attrs, f = p.type.create({
          ...h,
          rowspan: p.attrs.rowspan - 1
        }, p.content), g = t.positionAt(s + 1, c, e);
        n.insert(n.mapping.slice(l).map(i + g), f), c += h.colspan - 1;
      }
    }
  }
}
function kb(n, t) {
  if (!_t(n)) return !1;
  if (t) {
    const e = It(n), i = n.tr;
    if (e.top == 0 && e.bottom == e.map.height) return !1;
    for (let s = e.bottom - 1; wb(i, e, s), s != e.top; s--) {
      const r = e.tableStart ? i.doc.nodeAt(e.tableStart - 1) : i.doc;
      if (!r) throw new RangeError("No table found");
      e.table = r, e.map = W.get(e.table);
    }
    t(i);
  }
  return !0;
}
function Bl(n) {
  const t = n.content;
  return t.childCount == 1 && t.child(0).isTextblock && t.child(0).childCount == 0;
}
function xb({ width: n, height: t, map: e }, i) {
  let s = i.top * n + i.left, r = s, o = (i.bottom - 1) * n + i.left, l = s + (i.right - i.left - 1);
  for (let a = i.top; a < i.bottom; a++) {
    if (i.left > 0 && e[r] == e[r - 1] || i.right < n && e[l] == e[l + 1]) return !0;
    r += n, l += n;
  }
  for (let a = i.left; a < i.right; a++) {
    if (i.top > 0 && e[s] == e[s - n] || i.bottom < t && e[o] == e[o + n]) return !0;
    s++, o++;
  }
  return !1;
}
function Hl(n, t) {
  const e = n.selection;
  if (!(e instanceof z) || e.$anchorCell.pos == e.$headCell.pos) return !1;
  const i = It(n), { map: s } = i;
  if (xb(s, i)) return !1;
  if (t) {
    const r = n.tr, o = {};
    let l = v.empty, a, c;
    for (let d = i.top; d < i.bottom; d++) for (let u = i.left; u < i.right; u++) {
      const p = s.map[d * s.width + u], h = i.table.nodeAt(p);
      if (!(o[p] || !h))
        if (o[p] = !0, a == null)
          a = p, c = h;
        else {
          Bl(h) || (l = l.append(h.content));
          const f = r.mapping.map(p + i.tableStart);
          r.delete(f, f + h.nodeSize);
        }
    }
    if (a == null || c == null) return !0;
    if (r.setNodeMarkup(a + i.tableStart, null, {
      ...nd(c.attrs, c.attrs.colspan, i.right - i.left - c.attrs.colspan),
      rowspan: i.bottom - i.top
    }), l.size > 0) {
      const d = a + 1 + c.content.size, u = Bl(c) ? a + 1 : d;
      r.replaceWith(u + i.tableStart, d + i.tableStart, l);
    }
    r.setSelection(new z(r.doc.resolve(a + i.tableStart))), t(r);
  }
  return !0;
}
function $l(n, t) {
  const e = ct(n.schema);
  return Cb(({ node: i }) => e[i.type.spec.tableRole])(n, t);
}
function Cb(n) {
  return (t, e) => {
    const i = t.selection;
    let s, r;
    if (i instanceof z) {
      if (i.$anchorCell.pos != i.$headCell.pos) return !1;
      s = i.$anchorCell.nodeAfter, r = i.$anchorCell.pos;
    } else {
      var o;
      if (s = nb(i.$from), !s) return !1;
      r = (o = Oe(i.$from)) === null || o === void 0 ? void 0 : o.pos;
    }
    if (s == null || r == null || s.attrs.colspan == 1 && s.attrs.rowspan == 1) return !1;
    if (e) {
      let l = s.attrs;
      const a = [], c = l.colwidth;
      l.rowspan > 1 && (l = {
        ...l,
        rowspan: 1
      }), l.colspan > 1 && (l = {
        ...l,
        colspan: 1
      });
      const d = It(t), u = t.tr;
      for (let h = 0; h < d.right - d.left; h++) a.push(c ? {
        ...l,
        colwidth: c && c[h] ? [c[h]] : null
      } : l);
      let p;
      for (let h = d.top; h < d.bottom; h++) {
        let f = d.map.positionAt(h, d.left, d.table);
        h == d.top && (f += s.nodeSize);
        for (let g = d.left, m = 0; g < d.right; g++, m++)
          g == d.left && h == d.top || u.insert(p = u.mapping.map(f + d.tableStart, 1), n({
            node: s,
            row: h,
            col: g
          }).createAndFill(a[m]));
      }
      u.setNodeMarkup(r, n({
        node: s,
        row: d.top,
        col: d.left
      }), a[0]), i instanceof z && u.setSelection(new z(u.doc.resolve(i.$anchorCell.pos), p ? u.doc.resolve(p) : void 0)), e(u);
    }
    return !0;
  };
}
function Sb(n, t) {
  return function(e, i) {
    if (!_t(e)) return !1;
    const s = fs(e);
    if (s.nodeAfter.attrs[n] === t) return !1;
    if (i) {
      const r = e.tr;
      e.selection instanceof z ? e.selection.forEachCell((o, l) => {
        o.attrs[n] !== t && r.setNodeMarkup(l, null, {
          ...o.attrs,
          [n]: t
        });
      }) : r.setNodeMarkup(s.pos, null, {
        ...s.nodeAfter.attrs,
        [n]: t
      }), i(r);
    }
    return !0;
  };
}
function Mb(n) {
  return function(t, e) {
    if (!_t(t)) return !1;
    if (e) {
      const i = ct(t.schema), s = It(t), r = t.tr, o = s.map.cellsInRect(n == "column" ? {
        left: s.left,
        top: 0,
        right: s.right,
        bottom: s.map.height
      } : n == "row" ? {
        left: 0,
        top: s.top,
        right: s.map.width,
        bottom: s.bottom
      } : s), l = o.map((a) => s.table.nodeAt(a));
      for (let a = 0; a < o.length; a++) l[a].type == i.header_cell && r.setNodeMarkup(s.tableStart + o[a], i.cell, l[a].attrs);
      if (r.steps.length === 0) for (let a = 0; a < o.length; a++) r.setNodeMarkup(s.tableStart + o[a], i.header_cell, l[a].attrs);
      e(r);
    }
    return !0;
  };
}
function zl(n, t, e) {
  const i = t.map.cellsInRect({
    left: 0,
    top: 0,
    right: n == "row" ? t.map.width : 1,
    bottom: n == "column" ? t.map.height : 1
  });
  for (let s = 0; s < i.length; s++) {
    const r = t.table.nodeAt(i[s]);
    if (r && r.type !== e.header_cell) return !1;
  }
  return !0;
}
function On(n, t) {
  return t = t || { useDeprecatedLogic: !1 }, t.useDeprecatedLogic ? Mb(n) : function(e, i) {
    if (!_t(e)) return !1;
    if (i) {
      const s = ct(e.schema), r = It(e), o = e.tr, l = zl("row", r, s), a = zl("column", r, s), c = (n === "column" ? l : n === "row" && a) ? 1 : 0, d = n == "column" ? {
        left: 0,
        top: c,
        right: 1,
        bottom: r.map.height
      } : n == "row" ? {
        left: c,
        top: 0,
        right: r.map.width,
        bottom: 1
      } : r, u = n == "column" ? a ? s.cell : s.header_cell : n == "row" ? l ? s.cell : s.header_cell : s.cell;
      r.map.cellsInRect(d).forEach((p) => {
        const h = p + r.tableStart, f = o.doc.nodeAt(h);
        f && o.setNodeMarkup(h, u, f.attrs);
      }), i(o);
    }
    return !0;
  };
}
On("row", { useDeprecatedLogic: !0 });
On("column", { useDeprecatedLogic: !0 });
const Eb = On("cell", { useDeprecatedLogic: !0 });
function _b(n, t) {
  if (t < 0) {
    const e = n.nodeBefore;
    if (e) return n.pos - e.nodeSize;
    for (let i = n.index(-1) - 1, s = n.before(); i >= 0; i--) {
      const r = n.node(-1).child(i), o = r.lastChild;
      if (o) return s - 1 - o.nodeSize;
      s -= r.nodeSize;
    }
  } else {
    if (n.index() < n.parent.childCount - 1) return n.pos + n.nodeAfter.nodeSize;
    const e = n.node(-1);
    for (let i = n.indexAfter(-1), s = n.after(); i < e.childCount; i++) {
      const r = e.child(i);
      if (r.childCount) return s + 1;
      s += r.nodeSize;
    }
  }
  return null;
}
function ql(n) {
  return function(t, e) {
    if (!_t(t)) return !1;
    const i = _b(fs(t), n);
    if (i == null) return !1;
    if (e) {
      const s = t.doc.resolve(i);
      e(t.tr.setSelection(T.between(s, sb(s))).scrollIntoView());
    }
    return !0;
  };
}
function Tb(n, t) {
  const e = n.selection.$anchor;
  for (let i = e.depth; i > 0; i--) if (e.node(i).type.spec.tableRole == "table")
    return t && t(n.tr.delete(e.before(i), e.after(i)).scrollIntoView()), !0;
  return !1;
}
function Gn(n, t) {
  const e = n.selection;
  if (!(e instanceof z)) return !1;
  if (t) {
    const i = n.tr, s = ct(n.schema).cell.createAndFill().content;
    e.forEachCell((r, o) => {
      r.content.eq(s) || i.replace(i.mapping.map(o + 1), i.mapping.map(o + r.nodeSize - 1), new C(s, 0, 0));
    }), i.docChanged && t(i);
  }
  return !0;
}
function Ab(n) {
  if (n.size === 0) return null;
  let { content: t, openStart: e, openEnd: i } = n;
  for (; t.childCount == 1 && (e > 0 && i > 0 || t.child(0).type.spec.tableRole == "table"); )
    e--, i--, t = t.child(0).content;
  const s = t.child(0), r = s.type.spec.tableRole, o = s.type.schema, l = [];
  if (r == "row") for (let a = 0; a < t.childCount; a++) {
    let c = t.child(a).content;
    const d = a ? 0 : Math.max(0, e - 1), u = a < t.childCount - 1 ? 0 : Math.max(0, i - 1);
    (d || u) && (c = Mr(ct(o).row, new C(c, d, u)).content), l.push(c);
  }
  else if (r == "cell" || r == "header_cell") l.push(e || i ? Mr(ct(o).row, new C(t, e, i)).content : t);
  else return null;
  return Lb(o, l);
}
function Lb(n, t) {
  const e = [];
  for (let s = 0; s < t.length; s++) {
    const r = t[s];
    for (let o = r.childCount - 1; o >= 0; o--) {
      const { rowspan: l, colspan: a } = r.child(o).attrs;
      for (let c = s; c < s + l; c++) e[c] = (e[c] || 0) + a;
    }
  }
  let i = 0;
  for (let s = 0; s < e.length; s++) i = Math.max(i, e[s]);
  for (let s = 0; s < e.length; s++)
    if (s >= t.length && t.push(v.empty), e[s] < i) {
      const r = ct(n).cell.createAndFill(), o = [];
      for (let l = e[s]; l < i; l++) o.push(r);
      t[s] = t[s].append(v.from(o));
    }
  return {
    height: t.length,
    width: i,
    rows: t
  };
}
function Mr(n, t) {
  const e = n.createAndFill();
  return new Pr(e).replace(0, e.content.size, t).doc;
}
function Nb({ width: n, height: t, rows: e }, i, s) {
  if (n != i) {
    const r = [], o = [];
    for (let l = 0; l < e.length; l++) {
      const a = e[l], c = [];
      for (let d = r[l] || 0, u = 0; d < i; u++) {
        let p = a.child(u % a.childCount);
        d + p.attrs.colspan > i && (p = p.type.createChecked(Re(p.attrs, p.attrs.colspan, d + p.attrs.colspan - i), p.content)), c.push(p), d += p.attrs.colspan;
        for (let h = 1; h < p.attrs.rowspan; h++) r[l + h] = (r[l + h] || 0) + p.attrs.colspan;
      }
      o.push(v.from(c));
    }
    e = o, n = i;
  }
  if (t != s) {
    const r = [];
    for (let o = 0, l = 0; o < s; o++, l++) {
      const a = [], c = e[l % t];
      for (let d = 0; d < c.childCount; d++) {
        let u = c.child(d);
        o + u.attrs.rowspan > s && (u = u.type.create({
          ...u.attrs,
          rowspan: Math.max(1, s - u.attrs.rowspan)
        }, u.content)), a.push(u);
      }
      r.push(v.from(a));
    }
    e = r, t = s;
  }
  return {
    width: n,
    height: t,
    rows: e
  };
}
function Ob(n, t, e, i, s, r, o) {
  const l = n.doc.type.schema, a = ct(l);
  let c, d;
  if (s > t.width) for (let u = 0, p = 0; u < t.height; u++) {
    const h = e.child(u);
    p += h.nodeSize;
    const f = [];
    let g;
    h.lastChild == null || h.lastChild.type == a.cell ? g = c || (c = a.cell.createAndFill()) : g = d || (d = a.header_cell.createAndFill());
    for (let m = t.width; m < s; m++) f.push(g);
    n.insert(n.mapping.slice(o).map(p - 1 + i), f);
  }
  if (r > t.height) {
    const u = [];
    for (let f = 0, g = (t.height - 1) * t.width; f < Math.max(t.width, s); f++) {
      const m = f >= t.width ? !1 : e.nodeAt(t.map[g + f]).type == a.header_cell;
      u.push(m ? d || (d = a.header_cell.createAndFill()) : c || (c = a.cell.createAndFill()));
    }
    const p = a.row.create(null, v.from(u)), h = [];
    for (let f = t.height; f < r; f++) h.push(p);
    n.insert(n.mapping.slice(o).map(i + e.nodeSize - 2), h);
  }
  return !!(c || d);
}
function Fl(n, t, e, i, s, r, o, l) {
  if (o == 0 || o == t.height) return !1;
  let a = !1;
  for (let c = s; c < r; c++) {
    const d = o * t.width + c, u = t.map[d];
    if (t.map[d - t.width] == u) {
      a = !0;
      const p = e.nodeAt(u), { top: h, left: f } = t.findCell(u);
      n.setNodeMarkup(n.mapping.slice(l).map(u + i), null, {
        ...p.attrs,
        rowspan: o - h
      }), n.insert(n.mapping.slice(l).map(t.positionAt(o, f, e)), p.type.createAndFill({
        ...p.attrs,
        rowspan: h + p.attrs.rowspan - o
      })), c += p.attrs.colspan - 1;
    }
  }
  return a;
}
function Vl(n, t, e, i, s, r, o, l) {
  if (o == 0 || o == t.width) return !1;
  let a = !1;
  for (let c = s; c < r; c++) {
    const d = c * t.width + o, u = t.map[d];
    if (t.map[d - 1] == u) {
      a = !0;
      const p = e.nodeAt(u), h = t.colCount(u), f = n.mapping.slice(l).map(u + i);
      n.setNodeMarkup(f, null, Re(p.attrs, o - h, p.attrs.colspan - (o - h))), n.insert(f + p.nodeSize, p.type.createAndFill(Re(p.attrs, 0, o - h))), c += p.attrs.rowspan - 1;
    }
  }
  return a;
}
function jl(n, t, e, i, s) {
  let r = e ? n.doc.nodeAt(e - 1) : n.doc;
  if (!r) throw new Error("No table found");
  let o = W.get(r);
  const { top: l, left: a } = i, c = a + s.width, d = l + s.height, u = n.tr;
  let p = 0;
  function h() {
    if (r = e ? u.doc.nodeAt(e - 1) : u.doc, !r) throw new Error("No table found");
    o = W.get(r), p = u.mapping.maps.length;
  }
  Ob(u, o, r, e, c, d, p) && h(), Fl(u, o, r, e, a, c, l, p) && h(), Fl(u, o, r, e, a, c, d, p) && h(), Vl(u, o, r, e, l, d, a, p) && h(), Vl(u, o, r, e, l, d, c, p) && h();
  for (let f = l; f < d; f++) {
    const g = o.positionAt(f, a, r), m = o.positionAt(f, c, r);
    u.replace(u.mapping.slice(p).map(g + e), u.mapping.slice(p).map(m + e), new C(s.rows[f - l], 0, 0));
  }
  h(), u.setSelection(new z(u.doc.resolve(e + o.positionAt(l, a, r)), u.doc.resolve(e + o.positionAt(d - 1, c - 1, r)))), t(u);
}
const Rb = Kr({
  ArrowLeft: Yn("horiz", -1),
  ArrowRight: Yn("horiz", 1),
  ArrowUp: Yn("vert", -1),
  ArrowDown: Yn("vert", 1),
  "Shift-ArrowLeft": Xn("horiz", -1),
  "Shift-ArrowRight": Xn("horiz", 1),
  "Shift-ArrowUp": Xn("vert", -1),
  "Shift-ArrowDown": Xn("vert", 1),
  Backspace: Gn,
  "Mod-Backspace": Gn,
  Delete: Gn,
  "Mod-Delete": Gn
});
function oi(n, t, e) {
  return e.eq(n.selection) ? !1 : (t && t(n.tr.setSelection(e).scrollIntoView()), !0);
}
function Yn(n, t) {
  return (e, i, s) => {
    if (!s) return !1;
    const r = e.selection;
    if (r instanceof z) return oi(e, i, L.near(r.$headCell, t));
    if (n != "horiz" && !r.empty) return !1;
    const o = ad(s, n, t);
    if (o == null) return !1;
    if (n == "horiz") return oi(e, i, L.near(e.doc.resolve(r.head + t), t));
    {
      const l = e.doc.resolve(o), a = ed(l, n, t);
      let c;
      return a ? c = L.near(a, 1) : t < 0 ? c = L.near(e.doc.resolve(l.before(-1)), -1) : c = L.near(e.doc.resolve(l.after(-1)), 1), oi(e, i, c);
    }
  };
}
function Xn(n, t) {
  return (e, i, s) => {
    if (!s) return !1;
    const r = e.selection;
    let o;
    if (r instanceof z) o = r;
    else {
      const a = ad(s, n, t);
      if (a == null) return !1;
      o = new z(e.doc.resolve(a));
    }
    const l = ed(o.$headCell, n, t);
    return l ? oi(e, i, new z(o.$anchorCell, l)) : !1;
  };
}
function Ib(n, t) {
  const e = n.state.doc, i = Oe(e.resolve(t));
  return i ? (n.dispatch(n.state.tr.setSelection(new z(i))), !0) : !1;
}
function Db(n, t, e) {
  if (!_t(n.state)) return !1;
  let i = Ab(e);
  const s = n.state.selection;
  if (s instanceof z) {
    i || (i = {
      width: 1,
      height: 1,
      rows: [v.from(Mr(ct(n.state.schema).cell, e))]
    });
    const r = s.$anchorCell.node(-1), o = s.$anchorCell.start(-1), l = W.get(r).rectBetween(s.$anchorCell.pos - o, s.$headCell.pos - o);
    return i = Nb(i, l.right - l.left, l.bottom - l.top), jl(n.state, n.dispatch, o, l, i), !0;
  } else if (i) {
    const r = fs(n.state), o = r.start(-1);
    return jl(n.state, n.dispatch, o, W.get(r.node(-1)).findCell(r.pos - o), i), !0;
  } else return !1;
}
function Pb(n, t) {
  var e;
  if (t.button != 0 || t.ctrlKey || t.metaKey) return;
  const i = Ul(n, t.target);
  let s;
  if (t.shiftKey && n.state.selection instanceof z)
    r(n.state.selection.$anchorCell, t), t.preventDefault();
  else if (t.shiftKey && i && (s = Oe(n.state.selection.$anchor)) != null && ((e = js(n, t)) === null || e === void 0 ? void 0 : e.pos) != s.pos)
    r(s, t), t.preventDefault();
  else if (!i) return;
  function r(a, c) {
    let d = js(n, c);
    const u = te.getState(n.state) == null;
    if (!d || !mo(a, d)) if (u) d = a;
    else return;
    const p = new z(a, d);
    if (u || !n.state.selection.eq(p)) {
      const h = n.state.tr.setSelection(p);
      u && h.setMeta(te, a.pos), n.dispatch(h);
    }
  }
  function o() {
    n.root.removeEventListener("mouseup", o), n.root.removeEventListener("dragstart", o), n.root.removeEventListener("mousemove", l), te.getState(n.state) != null && n.dispatch(n.state.tr.setMeta(te, -1));
  }
  function l(a) {
    const c = a, d = te.getState(n.state);
    let u;
    if (d != null) u = n.state.doc.resolve(d);
    else if (Ul(n, c.target) != i && (u = js(n, t), !u))
      return o();
    u && r(u, c);
  }
  n.root.addEventListener("mouseup", o), n.root.addEventListener("dragstart", o), n.root.addEventListener("mousemove", l);
}
function ad(n, t, e) {
  if (!(n.state.selection instanceof T)) return null;
  const { $head: i } = n.state.selection;
  for (let s = i.depth - 1; s >= 0; s--) {
    const r = i.node(s);
    if ((e < 0 ? i.index(s) : i.indexAfter(s)) != (e < 0 ? 0 : r.childCount)) return null;
    if (r.type.spec.tableRole == "cell" || r.type.spec.tableRole == "header_cell") {
      const o = i.before(s), l = t == "vert" ? e > 0 ? "down" : "up" : e > 0 ? "right" : "left";
      return n.endOfTextblock(l) ? o : null;
    }
  }
  return null;
}
function Ul(n, t) {
  for (; t && t != n.dom; t = t.parentNode) if (t.nodeName == "TD" || t.nodeName == "TH") return t;
  return null;
}
function js(n, t) {
  const e = n.posAtCoords({
    left: t.clientX,
    top: t.clientY
  });
  if (!e) return null;
  let { inside: i, pos: s } = e;
  return i >= 0 && Oe(n.state.doc.resolve(i)) || Oe(n.state.doc.resolve(s));
}
var Bb = class {
  constructor(t, e) {
    this.node = t, this.defaultCellMinWidth = e, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.table.style.setProperty("--default-cell-min-width", `${e}px`), this.colgroup = this.table.appendChild(document.createElement("colgroup")), Er(t, this.colgroup, this.table, e), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(t) {
    return t.type != this.node.type ? !1 : (this.node = t, Er(t, this.colgroup, this.table, this.defaultCellMinWidth), !0);
  }
  ignoreMutation(t) {
    return t.type == "attributes" && (t.target == this.table || this.colgroup.contains(t.target));
  }
};
function Er(n, t, e, i, s, r) {
  let o = 0, l = !0, a = t.firstChild;
  const c = n.firstChild;
  if (c) {
    for (let u = 0, p = 0; u < c.childCount; u++) {
      const { colspan: h, colwidth: f } = c.child(u).attrs;
      for (let g = 0; g < h; g++, p++) {
        const m = s == p ? r : f && f[g], b = m ? m + "px" : "";
        if (o += m || i, m || (l = !1), a)
          a.style.width != b && (a.style.width = b), a = a.nextSibling;
        else {
          const y = document.createElement("col");
          y.style.width = b, t.appendChild(y);
        }
      }
    }
    for (; a; ) {
      var d;
      const u = a.nextSibling;
      (d = a.parentNode) === null || d === void 0 || d.removeChild(a), a = u;
    }
    l ? (e.style.width = o + "px", e.style.minWidth = "") : (e.style.width = "", e.style.minWidth = o + "px");
  }
}
const yt = new J("tableColumnResizing");
function Hb({ handleWidth: n = 5, cellMinWidth: t = 25, defaultCellMinWidth: e = 100, View: i = Bb, lastColumnResizable: s = !0 } = {}) {
  const r = new V({
    key: yt,
    state: {
      init(o, l) {
        var a;
        const c = (a = r.spec) === null || a === void 0 || (a = a.props) === null || a === void 0 ? void 0 : a.nodeViews, d = ct(l.schema).table.name;
        return i && c && (c[d] = (u, p) => new i(u, e, p)), new $b(-1, !1);
      },
      apply(o, l) {
        return l.apply(o);
      }
    },
    props: {
      attributes: (o) => {
        const l = yt.getState(o);
        return l && l.activeHandle > -1 ? { class: "resize-cursor" } : {};
      },
      handleDOMEvents: {
        mousemove: (o, l) => {
          zb(o, l, n, s);
        },
        mouseleave: (o) => {
          qb(o);
        },
        mousedown: (o, l) => {
          Fb(o, l, t, e);
        }
      },
      decorations: (o) => {
        const l = yt.getState(o);
        if (l && l.activeHandle > -1) return Kb(o, l.activeHandle);
      },
      nodeViews: {}
    }
  });
  return r;
}
var $b = class li {
  constructor(t, e) {
    this.activeHandle = t, this.dragging = e;
  }
  apply(t) {
    const e = this, i = t.getMeta(yt);
    if (i && i.setHandle != null) return new li(i.setHandle, !1);
    if (i && i.setDragging !== void 0) return new li(e.activeHandle, i.setDragging);
    if (e.activeHandle > -1 && t.docChanged) {
      let s = t.mapping.map(e.activeHandle, -1);
      return Sr(t.doc.resolve(s)) || (s = -1), new li(s, e.dragging);
    }
    return e;
  }
};
function zb(n, t, e, i) {
  if (!n.editable) return;
  const s = yt.getState(n.state);
  if (s && !s.dragging) {
    const r = jb(t.target);
    let o = -1;
    if (r) {
      const { left: l, right: a } = r.getBoundingClientRect();
      t.clientX - l <= e ? o = Wl(n, t, "left", e) : a - t.clientX <= e && (o = Wl(n, t, "right", e));
    }
    if (o != s.activeHandle) {
      if (!i && o !== -1) {
        const l = n.state.doc.resolve(o), a = l.node(-1), c = W.get(a), d = l.start(-1);
        if (c.colCount(l.pos - d) + l.nodeAfter.attrs.colspan - 1 == c.width - 1) return;
      }
      cd(n, o);
    }
  }
}
function qb(n) {
  if (!n.editable) return;
  const t = yt.getState(n.state);
  t && t.activeHandle > -1 && !t.dragging && cd(n, -1);
}
function Fb(n, t, e, i) {
  var s;
  if (!n.editable) return !1;
  const r = (s = n.dom.ownerDocument.defaultView) !== null && s !== void 0 ? s : window, o = yt.getState(n.state);
  if (!o || o.activeHandle == -1 || o.dragging) return !1;
  const l = n.state.doc.nodeAt(o.activeHandle), a = Vb(n, o.activeHandle, l.attrs);
  n.dispatch(n.state.tr.setMeta(yt, { setDragging: {
    startX: t.clientX,
    startWidth: a
  } }));
  function c(u) {
    r.removeEventListener("mouseup", c), r.removeEventListener("mousemove", d);
    const p = yt.getState(n.state);
    p != null && p.dragging && (Ub(n, p.activeHandle, Kl(p.dragging, u, e)), n.dispatch(n.state.tr.setMeta(yt, { setDragging: null })));
  }
  function d(u) {
    if (!u.which) return c(u);
    const p = yt.getState(n.state);
    if (p && p.dragging) {
      const h = Kl(p.dragging, u, e);
      Jl(n, p.activeHandle, h, i);
    }
  }
  return Jl(n, o.activeHandle, a, i), r.addEventListener("mouseup", c), r.addEventListener("mousemove", d), t.preventDefault(), !0;
}
function Vb(n, t, { colspan: e, colwidth: i }) {
  const s = i && i[i.length - 1];
  if (s) return s;
  const r = n.domAtPos(t);
  let o = r.node.childNodes[r.offset].offsetWidth, l = e;
  if (i)
    for (let a = 0; a < e; a++) i[a] && (o -= i[a], l--);
  return o / l;
}
function jb(n) {
  for (; n && n.nodeName != "TD" && n.nodeName != "TH"; ) n = n.classList && n.classList.contains("ProseMirror") ? null : n.parentNode;
  return n;
}
function Wl(n, t, e, i) {
  const s = e == "right" ? -i : i, r = n.posAtCoords({
    left: t.clientX + s,
    top: t.clientY
  });
  if (!r) return -1;
  const { pos: o } = r, l = Oe(n.state.doc.resolve(o));
  if (!l) return -1;
  if (e == "right") return l.pos;
  const a = W.get(l.node(-1)), c = l.start(-1), d = a.map.indexOf(l.pos - c);
  return d % a.width == 0 ? -1 : c + a.map[d - 1];
}
function Kl(n, t, e) {
  const i = t.clientX - n.startX;
  return Math.max(e, n.startWidth + i);
}
function cd(n, t) {
  n.dispatch(n.state.tr.setMeta(yt, { setHandle: t }));
}
function Ub(n, t, e) {
  const i = n.state.doc.resolve(t), s = i.node(-1), r = W.get(s), o = i.start(-1), l = r.colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1, a = n.state.tr;
  for (let c = 0; c < r.height; c++) {
    const d = c * r.width + l;
    if (c && r.map[d] == r.map[d - r.width]) continue;
    const u = r.map[d], p = s.nodeAt(u).attrs, h = p.colspan == 1 ? 0 : l - r.colCount(u);
    if (p.colwidth && p.colwidth[h] == e) continue;
    const f = p.colwidth ? p.colwidth.slice() : Wb(p.colspan);
    f[h] = e, a.setNodeMarkup(o + u, null, {
      ...p,
      colwidth: f
    });
  }
  a.docChanged && n.dispatch(a);
}
function Jl(n, t, e, i) {
  const s = n.state.doc.resolve(t), r = s.node(-1), o = s.start(-1), l = W.get(r).colCount(s.pos - o) + s.nodeAfter.attrs.colspan - 1;
  let a = n.domAtPos(s.start(-1)).node;
  for (; a && a.nodeName != "TABLE"; ) a = a.parentNode;
  a && Er(r, a.firstChild, a, i, l, e);
}
function Wb(n) {
  return Array(n).fill(0);
}
function Kb(n, t) {
  const e = [], i = n.doc.resolve(t), s = i.node(-1);
  if (!s) return F.empty;
  const r = W.get(s), o = i.start(-1), l = r.colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1;
  for (let c = 0; c < r.height; c++) {
    const d = l + c * r.width;
    if ((l == r.width - 1 || r.map[d] != r.map[d + 1]) && (c == 0 || r.map[d] != r.map[d - r.width])) {
      var a;
      const u = r.map[d], p = o + u + s.nodeAt(u).nodeSize - 1, h = document.createElement("div");
      h.className = "column-resize-handle", !((a = yt.getState(n)) === null || a === void 0) && a.dragging && e.push(ot.node(o + u, o + u + s.nodeAt(u).nodeSize, { class: "column-resize-dragging" })), e.push(ot.widget(p, h));
    }
  }
  return F.create(n.doc, e);
}
function Jb({ allowTableNodeSelection: n = !1 } = {}) {
  return new V({
    key: te,
    state: {
      init() {
        return null;
      },
      apply(t, e) {
        const i = t.getMeta(te);
        if (i != null) return i == -1 ? null : i;
        if (e == null || !t.docChanged) return e;
        const { deleted: s, pos: r } = t.mapping.mapResult(e);
        return s ? null : r;
      }
    },
    props: {
      decorations: lb,
      handleDOMEvents: { mousedown: Pb },
      createSelectionBetween(t) {
        return te.getState(t.state) != null ? t.state.selection : null;
      },
      handleTripleClick: Ib,
      handleKeyDown: Rb,
      handlePaste: Db
    },
    appendTransaction(t, e, i) {
      return db(i, rd(i, e), n);
    }
  });
}
function _r(n, t) {
  return t ? ["width", `${Math.max(t, n)}px`] : ["min-width", `${n}px`];
}
function Gl(n, t, e, i, s, r) {
  var o;
  let l = 0, a = !0, c = t.firstChild;
  const d = n.firstChild;
  if (d !== null)
    for (let u = 0, p = 0; u < d.childCount; u += 1) {
      const { colspan: h, colwidth: f } = d.child(u).attrs;
      for (let g = 0; g < h; g += 1, p += 1) {
        const m = s === p ? r : f && f[g], b = m ? `${m}px` : "";
        if (l += m || i, m || (a = !1), c) {
          if (c.style.width !== b) {
            const [y, w] = _r(i, m);
            c.style.setProperty(y, w);
          }
          c = c.nextSibling;
        } else {
          const y = document.createElement("col"), [w, M] = _r(i, m);
          y.style.setProperty(w, M), t.appendChild(y);
        }
      }
    }
  for (; c; ) {
    const u = c.nextSibling;
    (o = c.parentNode) === null || o === void 0 || o.removeChild(c), c = u;
  }
  a ? (e.style.width = `${l}px`, e.style.minWidth = "") : (e.style.width = "", e.style.minWidth = `${l}px`);
}
class dd {
  constructor(t, e) {
    this.node = t, this.cellMinWidth = e, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.colgroup = this.table.appendChild(document.createElement("colgroup")), Gl(t, this.colgroup, this.table, e), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(t) {
    return t.type !== this.node.type ? !1 : (this.node = t, Gl(t, this.colgroup, this.table, this.cellMinWidth), !0);
  }
  ignoreMutation(t) {
    return t.type === "attributes" && (t.target === this.table || this.colgroup.contains(t.target));
  }
}
function Gb(n, t, e, i) {
  let s = 0, r = !0;
  const o = [], l = n.firstChild;
  if (!l)
    return {};
  for (let u = 0, p = 0; u < l.childCount; u += 1) {
    const { colspan: h, colwidth: f } = l.child(u).attrs;
    for (let g = 0; g < h; g += 1, p += 1) {
      const m = e === p ? i : f && f[g];
      s += m || t, m || (r = !1);
      const [b, y] = _r(t, m);
      o.push([
        "col",
        { style: `${b}: ${y}` }
      ]);
    }
  }
  const a = r ? `${s}px` : "", c = r ? "" : `${s}px`;
  return { colgroup: ["colgroup", {}, ...o], tableWidth: a, tableMinWidth: c };
}
function Yl(n, t) {
  return n.createAndFill();
}
function Yb(n) {
  if (n.cached.tableNodeTypes)
    return n.cached.tableNodeTypes;
  const t = {};
  return Object.keys(n.nodes).forEach((e) => {
    const i = n.nodes[e];
    i.spec.tableRole && (t[i.spec.tableRole] = i);
  }), n.cached.tableNodeTypes = t, t;
}
function Xb(n, t, e, i, s) {
  const r = Yb(n), o = [], l = [];
  for (let c = 0; c < e; c += 1) {
    const d = Yl(r.cell);
    if (d && l.push(d), i) {
      const u = Yl(r.header_cell);
      u && o.push(u);
    }
  }
  const a = [];
  for (let c = 0; c < t; c += 1)
    a.push(r.row.createChecked(null, i && c === 0 ? o : l));
  return r.table.createChecked(null, a);
}
function Qb(n) {
  return n instanceof z;
}
const Qn = ({ editor: n }) => {
  const { selection: t } = n.state;
  if (!Qb(t))
    return !1;
  let e = 0;
  const i = $c(t.ranges[0].$from, (r) => r.type.name === "table");
  return i == null || i.node.descendants((r) => {
    if (r.type.name === "table")
      return !1;
    ["tableCell", "tableHeader"].includes(r.type.name) && (e += 1);
  }), e === t.ranges.length ? (n.commands.deleteTable(), !0) : !1;
}, Zb = H.create({
  name: "table",
  // @ts-ignore
  addOptions() {
    return {
      HTMLAttributes: {},
      resizable: !1,
      renderWrapper: !1,
      handleWidth: 5,
      cellMinWidth: 25,
      // TODO: fix
      View: dd,
      lastColumnResizable: !0,
      allowTableNodeSelection: !1
    };
  },
  content: "tableRow+",
  tableRole: "table",
  isolating: !0,
  group: "block",
  parseHTML() {
    return [{ tag: "table" }];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const { colgroup: e, tableWidth: i, tableMinWidth: s } = Gb(n, this.options.cellMinWidth), r = [
      "table",
      D(this.options.HTMLAttributes, t, {
        style: i ? `width: ${i}` : `min-width: ${s}`
      }),
      e,
      ["tbody", 0]
    ];
    return this.options.renderWrapper ? ["div", { class: "tableWrapper" }, r] : r;
  },
  addCommands() {
    return {
      insertTable: ({ rows: n = 3, cols: t = 3, withHeaderRow: e = !0 } = {}) => ({ tr: i, dispatch: s, editor: r }) => {
        const o = Xb(r.schema, n, t, e);
        if (s) {
          const l = i.selection.from + 1;
          i.replaceSelectionWith(o).scrollIntoView().setSelection(T.near(i.doc.resolve(l)));
        }
        return !0;
      },
      addColumnBefore: () => ({ state: n, dispatch: t }) => hb(n, t),
      addColumnAfter: () => ({ state: n, dispatch: t }) => fb(n, t),
      deleteColumn: () => ({ state: n, dispatch: t }) => gb(n, t),
      addRowBefore: () => ({ state: n, dispatch: t }) => yb(n, t),
      addRowAfter: () => ({ state: n, dispatch: t }) => vb(n, t),
      deleteRow: () => ({ state: n, dispatch: t }) => kb(n, t),
      deleteTable: () => ({ state: n, dispatch: t }) => Tb(n, t),
      mergeCells: () => ({ state: n, dispatch: t }) => Hl(n, t),
      splitCell: () => ({ state: n, dispatch: t }) => $l(n, t),
      toggleHeaderColumn: () => ({ state: n, dispatch: t }) => On("column")(n, t),
      toggleHeaderRow: () => ({ state: n, dispatch: t }) => On("row")(n, t),
      toggleHeaderCell: () => ({ state: n, dispatch: t }) => Eb(n, t),
      mergeOrSplit: () => ({ state: n, dispatch: t }) => Hl(n, t) ? !0 : $l(n, t),
      setCellAttribute: (n, t) => ({ state: e, dispatch: i }) => Sb(n, t)(e, i),
      goToNextCell: () => ({ state: n, dispatch: t }) => ql(1)(n, t),
      goToPreviousCell: () => ({ state: n, dispatch: t }) => ql(-1)(n, t),
      fixTables: () => ({ state: n, dispatch: t }) => (t && rd(n), !0),
      setCellSelection: (n) => ({ tr: t, dispatch: e }) => {
        if (e) {
          const i = z.create(t.doc, n.anchorCell, n.headCell);
          t.setSelection(i);
        }
        return !0;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.goToNextCell() ? !0 : this.editor.can().addRowAfter() ? this.editor.chain().addRowAfter().goToNextCell().run() : !1,
      "Shift-Tab": () => this.editor.commands.goToPreviousCell(),
      Backspace: Qn,
      "Mod-Backspace": Qn,
      Delete: Qn,
      "Mod-Delete": Qn
    };
  },
  addProseMirrorPlugins() {
    return [
      ...this.options.resizable && this.editor.isEditable ? [
        Hb({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          defaultCellMinWidth: this.options.cellMinWidth,
          View: this.options.View,
          lastColumnResizable: this.options.lastColumnResizable
        })
      ] : [],
      Jb({
        allowTableNodeSelection: this.options.allowTableNodeSelection
      })
    ];
  },
  extendNodeSchema(n) {
    const t = {
      name: n.name,
      options: n.options,
      storage: n.storage
    };
    return {
      tableRole: R(E(n, "tableRole", t))
    };
  }
});
function Xl(n) {
  const t = ["table"];
  return n.bordered && t.push("table-bordered"), n.striped && t.push("table-striped"), n.hover && t.push("table-hover"), n.small && t.push("table-sm"), n.alignMiddle && t.push("align-middle"), t.join(" ");
}
class ty extends dd {
  constructor(t, e, i) {
    super(t, e), this.editor = i, this.dom.className = "tableWrapper table-responsive", this.dom.style.position = "relative", this.table.className = Xl(t.attrs), this.editBtn = document.createElement("button"), this.editBtn.type = "button", this.editBtn.className = "tiptap-node-edit-btn", this.editBtn.innerHTML = '<i class="bi bi-pencil"></i>', this.editBtn.contentEditable = "false", this.editBtn.addEventListener("mousedown", (s) => {
      s.preventDefault(), s.stopPropagation();
      const r = this.editor._tiptapToolbar;
      if (r && r.tableModal) {
        const o = {
          bordered: !!this.node.attrs.bordered,
          striped: !!this.node.attrs.striped,
          hover: !!this.node.attrs.hover,
          small: !!this.node.attrs.small,
          alignMiddle: !!this.node.attrs.alignMiddle
        };
        r.tableModal.open(o);
      }
    }), this.dom.appendChild(this.editBtn);
  }
  update(t) {
    const e = super.update(t);
    return e && (this.table.className = Xl(t.attrs)), e;
  }
}
const ey = Zb.extend({
  addAttributes() {
    var n;
    return {
      ...(n = this.parent) == null ? void 0 : n.call(this),
      bordered: {
        default: !1,
        parseHTML: (t) => t.classList.contains("table-bordered")
      },
      striped: {
        default: !1,
        parseHTML: (t) => t.classList.contains("table-striped")
      },
      hover: {
        default: !1,
        parseHTML: (t) => t.classList.contains("table-hover")
      },
      small: {
        default: !1,
        parseHTML: (t) => t.classList.contains("table-sm")
      },
      alignMiddle: {
        default: !1,
        parseHTML: (t) => t.classList.contains("align-middle")
      }
    };
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const e = ["table"];
    n.attrs.bordered && e.push("table-bordered"), n.attrs.striped && e.push("table-striped"), n.attrs.hover && e.push("table-hover"), n.attrs.small && e.push("table-sm"), n.attrs.alignMiddle && e.push("align-middle");
    const i = D(this.options.HTMLAttributes, t, {
      class: e.join(" ")
    });
    return ["div", { class: "table-responsive" }, ["table", i, ["tbody", 0]]];
  },
  addNodeView() {
    const n = this.editor;
    return ({ node: t }) => new ty(t, this.options.cellMinWidth, n);
  },
  addCommands() {
    var n;
    return {
      ...(n = this.parent) == null ? void 0 : n.call(this),
      /**
       * Update style attributes of the table containing the cursor.
       * @param {Object} styles - { bordered, striped, hover, small, alignMiddle }
       */
      updateTableStyles: (t) => ({ tr: e, state: i, dispatch: s }) => {
        const { $from: r } = i.selection;
        for (let o = r.depth; o > 0; o--) {
          const l = r.node(o);
          if (l.type.name === "table") {
            if (s) {
              const a = r.before(o);
              e.setNodeMarkup(a, void 0, { ...l.attrs, ...t });
            }
            return !0;
          }
        }
        return !1;
      },
      /**
       * Get current table style attributes (for edit modal).
       */
      getTableStyles: () => ({ state: t }) => {
        const { $from: e } = t.selection;
        for (let i = e.depth; i > 0; i--) {
          const s = e.node(i);
          if (s.type.name === "table")
            return {
              bordered: !!s.attrs.bordered,
              striped: !!s.attrs.striped,
              hover: !!s.attrs.hover,
              small: !!s.attrs.small,
              alignMiddle: !!s.attrs.alignMiddle
            };
        }
        return null;
      }
    };
  }
}), ny = H.create({
  name: "tableRow",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "(tableCell | tableHeader)*",
  tableRole: "row",
  parseHTML() {
    return [
      { tag: "tr" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["tr", D(this.options.HTMLAttributes, n), 0];
  }
}), iy = H.create({
  name: "tableCell",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "block+",
  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      colwidth: {
        default: null,
        parseHTML: (n) => {
          const t = n.getAttribute("colwidth");
          return t ? t.split(",").map((i) => parseInt(i, 10)) : null;
        }
      }
    };
  },
  tableRole: "cell",
  isolating: !0,
  parseHTML() {
    return [
      { tag: "td" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["td", D(this.options.HTMLAttributes, n), 0];
  }
}), sy = H.create({
  name: "tableHeader",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "block+",
  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      colwidth: {
        default: null,
        parseHTML: (n) => {
          const t = n.getAttribute("colwidth");
          return t ? t.split(",").map((i) => parseInt(i, 10)) : null;
        }
      }
    };
  },
  tableRole: "header_cell",
  isolating: !0,
  parseHTML() {
    return [
      { tag: "th" }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["th", D(this.options.HTMLAttributes, n), 0];
  }
}), Tr = {
  "1-col": ["col-12"],
  "2-col": ["col-md-6", "col-md-6"],
  "3-col": ["col-md-4", "col-md-4", "col-md-4"],
  "4-col": ["col-md-3", "col-md-3", "col-md-3", "col-md-3"],
  "1-2": ["col-md-4", "col-md-8"],
  "2-1": ["col-md-8", "col-md-4"],
  "1-1-2": ["col-md-3", "col-md-3", "col-md-6"],
  "2-1-1": ["col-md-6", "col-md-3", "col-md-3"]
}, Zn = {
  start: "justify-content-start",
  center: "justify-content-center",
  end: "justify-content-end",
  between: "justify-content-between",
  around: "justify-content-around",
  evenly: "justify-content-evenly"
}, ti = {
  start: "align-items-start",
  center: "align-items-center",
  end: "align-items-end",
  stretch: "align-items-stretch"
}, ry = H.create({
  name: "bootstrapRow",
  group: "block",
  content: "bootstrapCol+",
  defining: !0,
  isolating: !0,
  addAttributes() {
    return {
      gutter: {
        default: 3,
        parseHTML: (n) => {
          const e = (n.className || "").match(/g-(\d)/);
          return e ? parseInt(e[1], 10) : 3;
        },
        renderHTML: () => ({})
      },
      justifyContent: {
        default: null,
        parseHTML: (n) => {
          const e = (n.className || "").match(/justify-content-(\w+)/);
          return e ? e[1] : null;
        },
        renderHTML: () => ({})
      },
      alignItems: {
        default: null,
        parseHTML: (n) => {
          const e = (n.className || "").match(/align-items-(\w+)/);
          return e ? e[1] : null;
        },
        renderHTML: () => ({})
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "div.row"
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const e = n.attrs.gutter ?? 3, i = n.attrs.justifyContent, s = n.attrs.alignItems;
    let r = `row g-${e}`;
    return i && Zn[i] && (r += ` ${Zn[i]}`), s && ti[s] && (r += ` ${ti[s]}`), [
      "div",
      D(t, {
        "data-type": "bootstrap-row",
        class: r
      }),
      0
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a Bootstrap row with a given layout preset.
       * @param {string} preset - One of LAYOUT_PRESETS keys
       * @param {number} [gutter=3] - Bootstrap gutter class (0-5)
       */
      insertBootstrapRow: (n = "2-col", t = 3) => ({ commands: e, editor: i }) => {
        const r = (Tr[n] || Tr["2-col"]).map((o) => ({
          type: "bootstrapCol",
          attrs: { colClass: o },
          content: [
            {
              type: "paragraph"
            }
          ]
        }));
        return e.insertContent({
          type: "bootstrapRow",
          attrs: { gutter: t },
          content: r
        });
      },
      /**
       * Insert a Bootstrap row with full advanced configuration.
       * @param {Object} config - { columns: [{colClass}], gutter, justifyContent, alignItems }
       */
      insertBootstrapRowAdvanced: (n) => ({ commands: t }) => {
        const { columns: e = [], gutter: i = 3, justifyContent: s = null, alignItems: r = null } = n, o = e.map((l) => ({
          type: "bootstrapCol",
          attrs: { colClass: l.colClass || "col" },
          content: [{ type: "paragraph" }]
        }));
        return o.length === 0 && o.push({
          type: "bootstrapCol",
          attrs: { colClass: "col" },
          content: [{ type: "paragraph" }]
        }), t.insertContent({
          type: "bootstrapRow",
          attrs: { gutter: i, justifyContent: s, alignItems: r },
          content: o
        });
      },
      /**
       * Update the current row's attributes and optionally reconfigure columns.
       * @param {Object} config - { columns: [{colClass}], gutter, justifyContent, alignItems }
       */
      updateBootstrapRow: (n) => ({ state: t, dispatch: e, tr: i }) => {
        const { $from: s } = t.selection, { columns: r, gutter: o, justifyContent: l, alignItems: a } = n;
        let c = null;
        for (let d = s.depth; d > 0; d--)
          if (s.node(d).type.name === "bootstrapRow") {
            c = d;
            break;
          }
        if (c === null) return !1;
        if (e) {
          const d = s.before(c), u = t.doc.nodeAt(d);
          if (!u) return !1;
          if (i.setNodeMarkup(d, void 0, {
            ...u.attrs,
            gutter: o ?? u.attrs.gutter,
            justifyContent: l !== void 0 ? l : u.attrs.justifyContent,
            alignItems: a !== void 0 ? a : u.attrs.alignItems
          }), r && r.length > 0) {
            let p = 1;
            const h = u.childCount, f = r.length;
            for (let g = 0; g < Math.min(h, f); g++) {
              const m = u.child(g), b = d + p;
              i.setNodeMarkup(b, void 0, {
                ...m.attrs,
                colClass: r[g].colClass || "col"
              }), p += m.nodeSize;
            }
            if (f > h) {
              const g = d + u.nodeSize - 1;
              for (let m = h; m < f; m++) {
                const b = t.schema.nodes.bootstrapCol.create(
                  { colClass: r[m].colClass || "col" },
                  t.schema.nodes.paragraph.create()
                );
                i.insert(g, b);
              }
            }
            if (f < h) {
              let g = 1;
              const m = [];
              for (let b = 0; b < h; b++) {
                const y = u.child(b);
                b >= f && m.push({ from: d + g, to: d + g + y.nodeSize }), g += y.nodeSize;
              }
              for (let b = m.length - 1; b >= 0; b--)
                i.delete(m[b].from, m[b].to);
            }
          }
          e(i);
        }
        return !0;
      },
      /**
       * Add a column to the current row.
       * @param {string} [colClass='col'] - Bootstrap column class
       */
      addColumnToRow: (n = "col") => ({ state: t, commands: e, editor: i }) => {
        const { $from: s } = t.selection;
        let r = null;
        for (let a = s.depth; a > 0; a--)
          if (s.node(a).type.name === "bootstrapRow") {
            r = s.before(a);
            break;
          }
        if (r === null) return !1;
        const o = t.doc.nodeAt(r);
        if (!o) return !1;
        const l = r + o.nodeSize - 1;
        return e.insertContentAt(l, {
          type: "bootstrapCol",
          attrs: { colClass: n },
          content: [{ type: "paragraph" }]
        });
      },
      /**
       * Remove the current column from its parent row.
       * Won't remove if it's the last column.
       */
      removeColumn: () => ({ state: n, dispatch: t, tr: e }) => {
        const { $from: i } = n.selection;
        let s = null;
        for (let l = i.depth; l > 0; l--)
          if (i.node(l).type.name === "bootstrapCol") {
            s = l;
            break;
          }
        if (s === null) return !1;
        const r = s - 1;
        if (i.node(r).type.name !== "bootstrapRow" || i.node(r).childCount <= 1) return !1;
        if (t) {
          const l = i.before(s), a = i.after(s);
          e.delete(l, a), t(e);
        }
        return !0;
      },
      /**
       * Change the column class of the current column.
       * @param {string} colClass - New Bootstrap column class
       */
      setColumnClass: (n) => ({ state: t, dispatch: e, tr: i }) => {
        const { $from: s } = t.selection;
        for (let r = s.depth; r > 0; r--)
          if (s.node(r).type.name === "bootstrapCol")
            return e && (i.setNodeMarkup(s.before(r), void 0, {
              ...s.node(r).attrs,
              colClass: n
            }), e(i)), !0;
        return !1;
      },
      /**
       * Change the gutter of the current row.
       * @param {number} gutter - Bootstrap gutter value (0-5)
       */
      setRowGutter: (n) => ({ state: t, dispatch: e, tr: i }) => {
        const { $from: s } = t.selection;
        for (let r = s.depth; r > 0; r--)
          if (s.node(r).type.name === "bootstrapRow")
            return e && (i.setNodeMarkup(s.before(r), void 0, {
              ...s.node(r).attrs,
              gutter: Math.max(0, Math.min(5, n))
            }), e(i)), !0;
        return !1;
      },
      /**
       * Delete the entire row.
       */
      deleteBootstrapRow: () => ({ state: n, dispatch: t, tr: e }) => {
        const { $from: i } = n.selection;
        for (let s = i.depth; s > 0; s--)
          if (i.node(s).type.name === "bootstrapRow") {
            if (t) {
              const r = i.before(s), o = i.after(s);
              e.delete(r, o), t(e);
            }
            return !0;
          }
        return !1;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      // Backspace on empty column in row with single column: delete entire row
      Backspace: ({ editor: n }) => {
        var i, s;
        const { state: t } = n, { $from: e } = t.selection;
        for (let r = e.depth; r > 0; r--)
          if (e.node(r).type.name === "bootstrapCol") {
            const o = e.node(r), l = e.node(r - 1);
            if (o.childCount === 1 && ((i = o.firstChild) == null ? void 0 : i.type.name) === "paragraph" && ((s = o.firstChild) == null ? void 0 : s.content.size) === 0 && l.type.name === "bootstrapRow" && l.childCount === 1)
              return n.commands.deleteBootstrapRow();
            break;
          }
        return !1;
      }
    };
  },
  addNodeView() {
    return ({ node: n, editor: t, getPos: e }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "bootstrap-row"), i.style.position = "relative";
      const s = (l) => {
        const a = l.gutter ?? 3, c = l.justifyContent, d = l.alignItems;
        let u = `row g-${a}`;
        c && Zn[c] && (u += ` ${Zn[c]}`), d && ti[d] && (u += ` ${ti[d]}`), i.className = u;
      };
      s(n.attrs);
      const r = document.createElement("button");
      r.type = "button", r.className = "tiptap-node-edit-btn", r.innerHTML = '<i class="bi bi-pencil"></i>', r.contentEditable = "false", r.addEventListener("mousedown", (l) => {
        l.preventDefault(), l.stopPropagation();
        const a = e(), c = t.state.doc.nodeAt(a);
        if (!c) return;
        const d = [];
        c.forEach((h) => {
          h.type.name === "bootstrapCol" && d.push({ colClass: h.attrs.colClass || "col" });
        });
        const u = {
          ...c.attrs,
          columns: d
        }, p = t._tiptapToolbar;
        p && p.layoutModal && p.layoutModal.open(u);
      }), i.appendChild(r);
      const o = document.createElement("div");
      return o.style.display = "contents", i.appendChild(o), {
        dom: i,
        contentDOM: o,
        update: (l) => l.type.name !== "bootstrapRow" ? !1 : (s(l.attrs), !0)
      };
    };
  }
}), oy = H.create({
  name: "bootstrapCol",
  // Not in standard group – only allowed as direct child of bootstrapRow
  group: "",
  content: "block+",
  defining: !0,
  isolating: !0,
  addAttributes() {
    return {
      colClass: {
        default: "col",
        parseHTML: (n) => {
          const e = (n.className || "").match(/col(?:-(?:sm|md|lg|xl|xxl))?(?:-\d{1,2})?/g);
          return e ? e.join(" ") : "col";
        },
        renderHTML: (n) => ({})
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "div",
        getAttrs: (n) => {
          const t = n.className || "";
          return /\bcol\b|\bcol-/.test(t) ? {} : !1;
        }
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const e = n.attrs.colClass || "col";
    return [
      "div",
      D(t, {
        "data-type": "bootstrap-col",
        class: e
      }),
      0
    ];
  }
}), He = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark"
], ly = H.create({
  name: "bootstrapAlert",
  group: "block",
  content: "inline*",
  defining: !0,
  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (n) => {
          const t = n.className || "";
          for (const e of He)
            if (t.includes(`alert-${e}`))
              return e;
          return "info";
        },
        renderHTML: () => ({})
        // handled in renderHTML
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "div.alert",
        getAttrs: (n) => (n.className || "").includes("alert") ? {} : !1
      },
      {
        tag: 'div[data-type="bootstrap-alert"]'
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const e = He.includes(n.attrs.type) ? n.attrs.type : "info";
    return [
      "div",
      D(t, {
        "data-type": "bootstrap-alert",
        "data-alert-type": e,
        class: `alert alert-${e}`,
        role: "alert"
      }),
      0
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a new Bootstrap Alert at the current position.
       * @param {string} type - Alert type (primary, secondary, success, etc.)
       */
      insertBootstrapAlert: (n = "info") => ({ commands: t }) => {
        const e = He.includes(n) ? n : "info";
        return t.insertContent({
          type: this.name,
          attrs: { type: e },
          content: [{ type: "text", text: "Alert message..." }]
        });
      },
      /**
       * Set the type of the current Bootstrap Alert.
       * @param {string} type - Alert type
       */
      setAlertType: (n) => ({ commands: t }) => {
        const e = He.includes(n) ? n : "info";
        return t.updateAttributes(this.name, { type: e });
      },
      /**
       * Delete the current Bootstrap Alert.
       */
      deleteBootstrapAlert: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addNodeView() {
    return ({ node: n, editor: t, getPos: e }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "bootstrap-alert"), i.style.position = "relative";
      const s = document.createElement("div");
      s.style.minHeight = "1.5em";
      const r = (a) => {
        const c = He.includes(a.type) ? a.type : "info";
        i.className = `alert alert-${c}`, i.setAttribute("data-alert-type", c), i.setAttribute("role", "alert"), i.style.position = "relative", i.querySelectorAll(".tiptap-node-edit-btn, .tiptap-alert-type-picker").forEach((u) => u.remove()), i.contains(s) || i.appendChild(s);
        const d = document.createElement("button");
        d.type = "button", d.className = "tiptap-node-edit-btn", d.title = "Change alert type", d.innerHTML = '<i class="bi bi-pencil-square"></i>', d.contentEditable = "false", d.addEventListener("click", (u) => {
          u.preventDefault(), u.stopPropagation(), l();
        }), i.appendChild(d);
      }, o = () => {
        const a = document.createElement("div");
        return a.className = "tiptap-alert-type-picker", a.contentEditable = "false", a.style.cssText = "position:absolute;top:6px;right:36px;display:flex;gap:3px;z-index:6;background:rgba(255,255,255,.95);border:1px solid rgba(0,0,0,.15);border-radius:6px;padding:4px 6px;box-shadow:0 2px 8px rgba(0,0,0,.12);flex-wrap:wrap;max-width:200px;", He.forEach((c) => {
          const d = document.createElement("button");
          d.type = "button", d.className = `btn btn-${c} btn-sm`, d.style.cssText = "width:24px;height:24px;padding:0;border-radius:4px;font-size:0;", d.title = c.charAt(0).toUpperCase() + c.slice(1), d.addEventListener("click", (u) => {
            u.preventDefault(), u.stopPropagation(), t.chain().focus().setAlertType(c).run(), a.remove();
          }), a.appendChild(d);
        }), a;
      }, l = () => {
        const a = i.querySelector(".tiptap-alert-type-picker");
        a ? a.remove() : i.appendChild(o());
      };
      return r(n.attrs), {
        dom: i,
        contentDOM: s,
        update(a) {
          return a.type.name !== "bootstrapAlert" ? !1 : (r(a.attrs), !0);
        },
        destroy() {
        }
      };
    };
  },
  addKeyboardShortcuts() {
    return {
      // Delete empty alert on Backspace
      Backspace: ({ editor: n }) => {
        const { $anchor: t } = n.state.selection, e = t.node(t.depth);
        return e.type.name === this.name && e.textContent.length === 0 ? n.commands.deleteBootstrapAlert() : !1;
      }
    };
  }
}), ai = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark"
], ay = H.create({
  name: "bootstrapCard",
  group: "block",
  content: "block+",
  defining: !0,
  isolating: !0,
  addAttributes() {
    return {
      headerText: {
        default: null,
        parseHTML: (n) => {
          const t = n.querySelector(".card-header");
          return t ? t.textContent : null;
        },
        renderHTML: () => ({})
        // handled in renderHTML
      },
      footerText: {
        default: null,
        parseHTML: (n) => {
          const t = n.querySelector(".card-footer");
          return t ? t.textContent : null;
        },
        renderHTML: () => ({})
      },
      borderColor: {
        default: null,
        parseHTML: (n) => {
          const t = n.className || "";
          for (const e of ai)
            if (t.includes(`border-${e}`))
              return e;
          return null;
        },
        renderHTML: () => ({})
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "div.card",
        getAttrs: (n) => (n.className || "").includes("card") ? {} : !1
      },
      {
        tag: 'div[data-type="bootstrap-card"]'
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const { headerText: e, footerText: i, borderColor: s } = n.attrs, r = ["card"];
    s && ai.includes(s) && r.push(`border-${s}`);
    const o = [];
    return e && o.push([
      "div",
      { class: "card-header", contenteditable: "false" },
      e
    ]), o.push(["div", { class: "card-body" }, 0]), i && o.push([
      "div",
      { class: "card-footer", contenteditable: "false" },
      i
    ]), [
      "div",
      D(t, {
        "data-type": "bootstrap-card",
        class: r.join(" ")
      }),
      ...o
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a new Bootstrap Card at the current position.
       * @param {Object} attrs - Card attributes
       * @param {string|null} attrs.headerText
       * @param {string|null} attrs.footerText
       * @param {string|null} attrs.borderColor
       */
      insertBootstrapCard: (n = {}) => ({ commands: t }) => {
        const { headerText: e = null, footerText: i = null, borderColor: s = null } = n;
        return t.insertContent({
          type: this.name,
          attrs: { headerText: e, footerText: i, borderColor: s },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Card content..." }]
            }
          ]
        });
      },
      /**
       * Update attributes of the current Bootstrap Card.
       * @param {Object} attrs - Partial card attributes to update
       */
      updateBootstrapCard: (n) => ({ commands: t }) => t.updateAttributes(this.name, n),
      /**
       * Delete the current Bootstrap Card.
       */
      deleteBootstrapCard: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor: n }) => {
        const { $anchor: t } = n.state.selection;
        for (let e = t.depth; e > 0; e--) {
          const i = t.node(e);
          if (i.type.name === this.name && i.textContent.length === 0)
            return n.commands.deleteBootstrapCard();
        }
        return !1;
      }
    };
  },
  addNodeView() {
    return ({ node: n, editor: t, getPos: e }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "bootstrap-card"), i.style.position = "relative";
      const s = document.createElement("div");
      s.className = "card-body";
      const r = (l) => {
        const { headerText: a, footerText: c, borderColor: d } = l;
        if (i.innerHTML = "", i.className = "card tiptap-card-editable", d && ai.includes(d) && i.classList.add(`border-${d}`), a) {
          const p = document.createElement("div");
          p.className = "card-header", p.contentEditable = "false", p.textContent = a, i.appendChild(p);
        }
        if (i.appendChild(s), c) {
          const p = document.createElement("div");
          p.className = "card-footer text-muted", p.contentEditable = "false", p.textContent = c, i.appendChild(p);
        }
        const u = document.createElement("button");
        u.type = "button", u.className = "tiptap-node-edit-btn", u.title = "Edit card (double-click)", u.innerHTML = '<i class="bi bi-pencil-square"></i>', u.contentEditable = "false", u.addEventListener("click", (p) => {
          p.preventDefault(), p.stopPropagation(), o();
        }), i.appendChild(u);
      }, o = () => {
        const l = t._tiptapToolbar;
        l != null && l.cardModal && l.cardModal.open(n.attrs);
      };
      return i.addEventListener("dblclick", (l) => {
        const a = l.target;
        a.closest(".card-body") && !a.closest(".card-header") && !a.closest(".card-footer") && !a.classList.contains("tiptap-node-edit-btn") || (l.preventDefault(), l.stopPropagation(), o());
      }), r(n.attrs), {
        dom: i,
        contentDOM: s,
        update(l) {
          return l.type.name !== "bootstrapCard" ? !1 : (r(l.attrs), !0);
        },
        destroy() {
        }
      };
    };
  }
}), Fe = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "link"
], Us = ["sm", "lg"], cy = H.create({
  name: "bootstrapButton",
  group: "inline",
  inline: !0,
  atom: !0,
  // not editable from inside – click to configure
  addAttributes() {
    return {
      text: {
        default: "Button",
        parseHTML: (n) => n.textContent || "Button",
        renderHTML: () => ({})
      },
      url: {
        default: "#",
        parseHTML: (n) => n.getAttribute("href") || "#",
        renderHTML: () => ({})
      },
      variant: {
        default: "primary",
        parseHTML: (n) => {
          const t = n.className || "";
          for (const e of Fe)
            if (t.includes(`btn-outline-${e}`)) return e;
          for (const e of Fe)
            if (t.includes(`btn-${e}`)) return e;
          return "primary";
        },
        renderHTML: () => ({})
      },
      size: {
        default: null,
        parseHTML: (n) => {
          const t = n.className || "";
          return t.includes("btn-sm") ? "sm" : t.includes("btn-lg") ? "lg" : null;
        },
        renderHTML: () => ({})
      },
      outline: {
        default: !1,
        parseHTML: (n) => (n.className || "").includes("btn-outline-"),
        renderHTML: () => ({})
      },
      target: {
        default: "_self",
        parseHTML: (n) => n.getAttribute("target") || "_self",
        renderHTML: () => ({})
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "a.btn",
        getAttrs: (n) => (n.className || "").includes("btn") ? {} : !1
      },
      {
        tag: 'span[data-type="bootstrap-button"]'
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const { text: e, url: i, variant: s, size: r, outline: o, target: l } = n.attrs, a = Fe.includes(s) ? s : "primary", d = ["btn", o ? `btn-outline-${a}` : `btn-${a}`];
    return r && Us.includes(r) && d.push(`btn-${r}`), [
      "span",
      D(t, {
        "data-type": "bootstrap-button",
        "data-url": i || "#",
        "data-variant": a,
        "data-size": r || "",
        "data-outline": o ? "true" : "false",
        "data-target": l || "_self",
        class: d.join(" "),
        role: "button",
        contenteditable: "false"
      }),
      e || "Button"
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a Bootstrap Button at the current cursor position.
       * @param {Object} attrs - Button attributes
       */
      insertBootstrapButton: (n = {}) => ({ commands: t }) => {
        const {
          text: e = "Button",
          url: i = "#",
          variant: s = "primary",
          size: r = null,
          outline: o = !1,
          target: l = "_self"
        } = n;
        return t.insertContent({
          type: this.name,
          attrs: { text: e, url: i, variant: s, size: r, outline: o, target: l }
        });
      },
      /**
       * Update the current Bootstrap Button's attributes.
       * @param {Object} attrs - Partial attributes to update
       */
      updateBootstrapButton: (n) => ({ commands: t }) => t.updateAttributes(this.name, n),
      /**
       * Delete the current Bootstrap Button.
       */
      deleteBootstrapButton: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  /**
   * NodeView is needed for proper inline atom click handling.
   * This allows opening a config modal when the button is clicked.
   */
  addNodeView() {
    return ({ node: n, getPos: t, editor: e }) => {
      const i = document.createElement("span");
      i.setAttribute("data-type", "bootstrap-button"), i.style.position = "relative", i.style.display = "inline-block", i.contentEditable = "false";
      const s = document.createElement("span"), { text: r, variant: o, size: l, outline: a, target: c } = n.attrs, d = Fe.includes(o) ? o : "primary", u = a ? `btn-outline-${d}` : `btn-${d}`;
      s.className = `btn ${u}`, l && Us.includes(l) && s.classList.add(`btn-${l}`), s.setAttribute("role", "button"), s.textContent = r || "Button", s.style.cursor = "pointer", s.contentEditable = "false", i.appendChild(s);
      const p = () => {
        const f = t();
        if (typeof f != "number") return;
        const g = e._tiptapToolbar;
        g != null && g.buttonModal && g.buttonModal.open(n.attrs, f);
      }, h = document.createElement("button");
      return h.type = "button", h.className = "tiptap-node-edit-btn", h.title = "Edit button (double-click)", h.innerHTML = '<i class="bi bi-pencil-square"></i>', h.contentEditable = "false", h.style.top = "-8px", h.style.right = "-8px", h.addEventListener("click", (f) => {
        f.preventDefault(), f.stopPropagation(), p();
      }), i.appendChild(h), s.addEventListener("dblclick", (f) => {
        f.preventDefault(), f.stopPropagation(), p();
      }), {
        dom: i,
        update(f) {
          if (f.type.name !== "bootstrapButton") return !1;
          const g = Fe.includes(f.attrs.variant) ? f.attrs.variant : "primary", m = f.attrs.outline ? `btn-outline-${g}` : `btn-${g}`;
          return s.className = `btn ${m}`, f.attrs.size && Us.includes(f.attrs.size) && s.classList.add(`btn-${f.attrs.size}`), s.textContent = f.attrs.text || "Button", !0;
        },
        destroy() {
        }
      };
    };
  }
}), dy = ["left", "center", "right"], uy = H.create({
  name: "customImage",
  group: "block",
  draggable: !0,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (n) => {
          var t;
          return ((t = n.querySelector("img")) == null ? void 0 : t.getAttribute("src")) || n.getAttribute("src");
        }
      },
      alt: {
        default: "",
        parseHTML: (n) => {
          var t;
          return ((t = n.querySelector("img")) == null ? void 0 : t.getAttribute("alt")) || n.getAttribute("alt") || "";
        }
      },
      title: {
        default: null,
        parseHTML: (n) => {
          var t;
          return ((t = n.querySelector("img")) == null ? void 0 : t.getAttribute("title")) || n.getAttribute("title");
        }
      },
      caption: {
        default: null,
        parseHTML: (n) => {
          const t = n.querySelector("figcaption");
          return t ? t.textContent : null;
        }
      },
      width: {
        default: null,
        parseHTML: (n) => {
          const e = (n.querySelector("img") || n).getAttribute("width");
          return e ? parseInt(e, 10) : null;
        }
      },
      height: {
        default: null,
        parseHTML: (n) => {
          const e = (n.querySelector("img") || n).getAttribute("height");
          return e ? parseInt(e, 10) : null;
        }
      },
      alignment: {
        default: "center",
        parseHTML: (n) => n.classList.contains("text-start") || n.classList.contains("text-left") ? "left" : n.classList.contains("text-end") || n.classList.contains("text-right") ? "right" : "center"
      },
      mediaId: {
        default: null,
        parseHTML: (n) => n.getAttribute("data-media-id") || null
      },
      loading: {
        default: "lazy"
      },
      // ── New in v1.1 ──
      widthStyle: {
        default: null,
        parseHTML: (n) => {
          var t;
          return ((t = n.style) == null ? void 0 : t.width) || n.getAttribute("data-width-style") || null;
        }
      },
      extraClass: {
        default: null,
        parseHTML: (n) => n.getAttribute("data-extra-class") || null
      },
      linkUrl: {
        default: null,
        parseHTML: (n) => {
          var t;
          return ((t = n.querySelector("a")) == null ? void 0 : t.getAttribute("href")) || n.getAttribute("data-link-url") || null;
        }
      },
      linkTarget: {
        default: null,
        parseHTML: (n) => {
          var t;
          return ((t = n.querySelector("a")) == null ? void 0 : t.getAttribute("target")) || null;
        }
      }
    };
  },
  parseHTML() {
    return [
      { tag: 'figure[data-type="custom-image"]' },
      { tag: "figure.tiptap-image" },
      {
        tag: "img[src]",
        getAttrs: (n) => n.closest("figure") ? !1 : { src: n.getAttribute("src") }
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const {
      src: e,
      alt: i,
      title: s,
      caption: r,
      width: o,
      height: l,
      alignment: a,
      mediaId: c,
      loading: d,
      widthStyle: u,
      extraClass: p,
      linkUrl: h,
      linkTarget: f
    } = n.attrs;
    let m = `tiptap-image ${a === "left" ? "text-start" : a === "right" ? "text-end" : "text-center"}`;
    p && (m += " " + p);
    const b = D(t, {
      "data-type": "custom-image",
      class: m
    });
    c && (b["data-media-id"] = c), u && (b["data-width-style"] = u), p && (b["data-extra-class"] = p), h && (b["data-link-url"] = h), u && (b.style = `width:${u}`);
    const y = {
      src: e || "",
      alt: i || "",
      class: "img-fluid",
      loading: d || "lazy"
    };
    s && (y.title = s), o && (y.width = String(o)), l && (y.height = String(l));
    const w = ["img", y], x = [h ? ["a", { href: h, target: f || null, rel: f === "_blank" ? "noopener noreferrer" : null }, w] : w];
    return r && x.push(["figcaption", { class: "figure-caption" }, r]), ["figure", b, ...x];
  },
  addCommands() {
    return {
      /**
       * Insert a custom image.
       * @param {Object} attrs - Image attributes (src, alt, etc.)
       */
      insertCustomImage: (n = {}) => ({ commands: t }) => t.insertContent({
        type: this.name,
        attrs: {
          src: n.src || "",
          alt: n.alt || "",
          title: n.title || null,
          caption: n.caption || null,
          width: n.width || null,
          height: n.height || null,
          alignment: dy.includes(n.alignment) ? n.alignment : "center",
          mediaId: n.mediaId || null,
          loading: n.loading || "lazy",
          widthStyle: n.widthStyle || null,
          extraClass: n.extraClass || null,
          linkUrl: n.linkUrl || null,
          linkTarget: n.linkTarget || null
        }
      }),
      /**
       * Update attributes of the current custom image.
       */
      updateCustomImage: (n) => ({ commands: t }) => t.updateAttributes(this.name, n),
      /**
       * Delete the current custom image.
       */
      deleteCustomImage: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addNodeView() {
    return ({ node: n, editor: t, getPos: e }) => {
      const i = document.createElement("figure");
      i.classList.add("tiptap-image"), i.setAttribute("data-type", "custom-image"), i.contentEditable = "false";
      const s = (o) => {
        const {
          src: l,
          alt: a,
          title: c,
          caption: d,
          width: u,
          height: p,
          alignment: h,
          mediaId: f,
          widthStyle: g,
          extraClass: m,
          linkUrl: b,
          linkTarget: y
        } = o;
        i.innerHTML = "", i.classList.remove("text-start", "text-center", "text-end"), i.classList.add(
          h === "left" ? "text-start" : h === "right" ? "text-end" : "text-center"
        ), m && i.setAttribute("data-extra-class", m), g ? (i.style.width = g, i.style.display = "inline-block") : (i.style.width = "", i.style.display = ""), f && i.setAttribute("data-media-id", f);
        const w = document.createElement("img");
        if (w.src = l || "", w.alt = a || "", w.className = "img-fluid", w.loading = "lazy", c && (w.title = c), u && (w.width = u), p && (w.height = p), b) {
          const x = document.createElement("a");
          x.href = b, y && (x.target = y), y === "_blank" && (x.rel = "noopener noreferrer"), x.appendChild(w), i.appendChild(x);
        } else
          i.appendChild(w);
        if (d) {
          const x = document.createElement("figcaption");
          x.className = "figure-caption", x.textContent = d, i.appendChild(x);
        }
        const M = document.createElement("button");
        M.type = "button", M.className = "tiptap-image-edit-btn", M.title = "Edit image (double-click)", M.innerHTML = '<i class="bi bi-pencil-square"></i>', M.addEventListener("click", (x) => {
          x.preventDefault(), x.stopPropagation(), r();
        }), i.appendChild(M);
      }, r = () => {
        const o = t._tiptapToolbar;
        if (o != null && o.imageModal) {
          const l = typeof e == "function" ? e() : null;
          l !== null && t.chain().focus().setNodeSelection(l).run(), o.imageModal.open(n.attrs);
        }
      };
      return i.addEventListener("dblclick", (o) => {
        o.preventDefault(), o.stopPropagation(), r();
      }), s(n.attrs), {
        dom: i,
        update(o) {
          return o.type.name !== "customImage" ? !1 : (s(o.attrs), !0);
        },
        destroy() {
        }
      };
    };
  }
}), vn = {
  youtube: {
    regex: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    embedUrl: (n) => `https://www.youtube-nocookie.com/embed/${n}`,
    name: "YouTube"
  },
  vimeo: {
    regex: /vimeo\.com\/(\d+)/,
    embedUrl: (n) => `https://player.vimeo.com/video/${n}`,
    name: "Vimeo"
  }
};
function Ar(n) {
  for (const [t, e] of Object.entries(vn)) {
    const i = n.match(e.regex);
    if (i && i[1])
      return { provider: t, videoId: i[1] };
  }
  return /\.(mp4|webm)(\?|$)/i.test(n) ? { provider: "mp4", videoId: n } : null;
}
const py = H.create({
  name: "customVideo",
  group: "block",
  atom: !0,
  draggable: !0,
  addAttributes() {
    return {
      provider: {
        default: "youtube",
        parseHTML: (n) => n.getAttribute("data-provider") || "youtube"
      },
      videoId: {
        default: null,
        parseHTML: (n) => n.getAttribute("data-video-id") || null
      },
      url: {
        default: null,
        parseHTML: (n) => {
          const t = n.querySelector("iframe");
          if (t) return t.getAttribute("src");
          const e = n.querySelector("video source");
          return e ? e.getAttribute("src") : n.getAttribute("data-url") || null;
        }
      },
      title: {
        default: "",
        parseHTML: (n) => {
          const t = n.querySelector("iframe");
          return (t == null ? void 0 : t.getAttribute("title")) || "";
        }
      },
      width: {
        default: 560
      },
      height: {
        default: 315
      },
      caption: {
        default: "",
        parseHTML: (n) => {
          const t = n.querySelector("figcaption");
          return (t == null ? void 0 : t.textContent) || "";
        }
      },
      aspectRatio: {
        default: "16x9",
        parseHTML: (n) => {
          const e = (n.className || "").match(/ratio-(\d+x\d+)/);
          return e ? e[1] : "16x9";
        }
      },
      alignment: {
        default: "center",
        parseHTML: (n) => n.getAttribute("data-alignment") || "center"
      },
      widthStyle: {
        default: null,
        parseHTML: (n) => {
          const e = (n.getAttribute("style") || "").match(/width:\s*(\d+(?:\.\d+)?(?:px|%))/);
          return e ? e[1] : null;
        }
      }
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-type="custom-video"]' },
      { tag: 'figure[data-type="custom-video"]' },
      { tag: "div.ratio.ratio-16x9" }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: t }) {
    const { provider: e, videoId: i, url: s, title: r, aspectRatio: o, alignment: l, widthStyle: a, caption: c } = n.attrs, d = o || "16x9", u = l === "left" ? "text-start" : l === "right" ? "text-end" : "text-center", p = a ? `width:${a}` : "", h = `tiptap-video-figure ${u}`, f = D(t, {
      "data-type": "custom-video",
      "data-provider": e,
      "data-video-id": i || "",
      "data-url": s || "",
      "data-alignment": l || "center",
      class: `ratio ratio-${d}`
    });
    let g;
    if (e === "mp4")
      g = [
        "div",
        f,
        [
          "video",
          { controls: "true", class: "w-100", title: r || "" },
          ["source", { src: s || i || "", type: "video/mp4" }]
        ]
      ];
    else {
      const b = vn[e], y = b ? b.embedUrl(i) : "";
      g = [
        "div",
        f,
        [
          "iframe",
          {
            src: y,
            title: r || "",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: "true",
            loading: "lazy",
            frameborder: "0"
          }
        ]
      ];
    }
    const m = { class: h };
    return p && (m.style = p), c ? ["figure", m, g, ["figcaption", {}, c]] : ["figure", m, g];
  },
  addCommands() {
    return {
      /**
       * Insert a custom video from a URL.
       * Auto-detects provider (YouTube, Vimeo, MP4).
       * @param {Object} attrs - { url, title? }
       */
      insertCustomVideo: (n = {}) => ({ commands: t }) => {
        const e = Ar(n.url || "");
        return e ? t.insertContent({
          type: this.name,
          attrs: {
            provider: n.provider || e.provider,
            videoId: n.videoId || e.videoId,
            url: n.url,
            title: n.title || "",
            caption: n.caption || "",
            aspectRatio: n.aspectRatio || "16x9",
            alignment: n.alignment || "center",
            widthStyle: n.widthStyle || null
          }
        }) : (console.warn("[CustomVideo] Unsupported video URL:", n.url), !1);
      },
      /**
       * Update the current video attributes.
       */
      updateCustomVideo: (n) => ({ commands: t }) => t.updateAttributes(this.name, n),
      /**
       * Delete the current custom video.
       */
      deleteCustomVideo: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addNodeView() {
    return ({ node: n, editor: t, getPos: e }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "custom-video"), i.contentEditable = "false", i.style.position = "relative";
      const { provider: s, videoId: r, url: o, title: l, aspectRatio: a, alignment: c, widthStyle: d, caption: u } = n.attrs, p = a || "16x9", h = document.createElement("figure");
      h.className = `tiptap-video-figure ${c === "left" ? "text-start" : c === "right" ? "text-end" : "text-center"}`, d && (h.style.width = d);
      const f = document.createElement("div");
      if (f.className = `ratio ratio-${p} tiptap-video-wrapper`, f.setAttribute("data-type", "custom-video"), f.setAttribute("data-provider", s), s === "mp4") {
        const m = document.createElement("video");
        m.controls = !0, m.className = "w-100", m.title = l || "";
        const b = document.createElement("source");
        b.src = o || r || "", b.type = "video/mp4", m.appendChild(b), f.appendChild(m);
      } else {
        const m = document.createElement("iframe"), b = vn[s];
        m.src = b ? b.embedUrl(r) : "", m.title = l || "", m.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", m.allowFullscreen = !0, m.loading = "lazy", m.frameBorder = "0", f.appendChild(m);
      }
      if (h.appendChild(f), u) {
        const m = document.createElement("figcaption");
        m.textContent = u, h.appendChild(m);
      }
      i.appendChild(h);
      const g = document.createElement("button");
      return g.type = "button", g.className = "tiptap-node-edit-btn", g.title = "Edit video (double-click)", g.innerHTML = '<i class="bi bi-pencil-square"></i>', g.contentEditable = "false", g.addEventListener("click", (m) => {
        var b;
        m.preventDefault(), m.stopPropagation(), (b = t._tiptapToolbar) != null && b.videoModal && t._tiptapToolbar.videoModal.open(n.attrs);
      }), i.appendChild(g), i.addEventListener("dblclick", (m) => {
        var b;
        m.preventDefault(), m.stopPropagation(), (b = t._tiptapToolbar) != null && b.videoModal && t._tiptapToolbar.videoModal.open(n.attrs);
      }), {
        dom: i,
        update(m) {
          if (m.type.name !== "customVideo") return !1;
          const b = m.attrs.provider, y = m.attrs.videoId, w = m.attrs.aspectRatio || "16x9", M = m.attrs.alignment || "center", x = m.attrs.widthStyle, N = m.attrs.caption || "";
          i.innerHTML = "";
          const S = document.createElement("figure");
          S.className = `tiptap-video-figure ${M === "left" ? "text-start" : M === "right" ? "text-end" : "text-center"}`, x && (S.style.width = x);
          const A = document.createElement("div");
          if (A.className = `ratio ratio-${w} tiptap-video-wrapper`, A.setAttribute("data-provider", b), b === "mp4") {
            const P = document.createElement("video");
            P.controls = !0, P.className = "w-100";
            const Y = document.createElement("source");
            Y.src = m.attrs.url || y || "", Y.type = "video/mp4", P.appendChild(Y), A.appendChild(P);
          } else {
            const P = document.createElement("iframe"), Y = vn[b];
            P.src = Y ? Y.embedUrl(y) : "", P.title = m.attrs.title || "", P.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", P.allowFullscreen = !0, P.loading = "lazy", P.frameBorder = "0", A.appendChild(P);
          }
          if (S.appendChild(A), N) {
            const P = document.createElement("figcaption");
            P.textContent = N, S.appendChild(P);
          }
          i.appendChild(S);
          const I = document.createElement("button");
          return I.type = "button", I.className = "tiptap-node-edit-btn", I.title = "Edit video (double-click)", I.innerHTML = '<i class="bi bi-pencil-square"></i>', I.contentEditable = "false", I.addEventListener("click", (P) => {
            var Y;
            P.preventDefault(), P.stopPropagation(), (Y = t._tiptapToolbar) != null && Y.videoModal && t._tiptapToolbar.videoModal.open(m.attrs);
          }), i.appendChild(I), !0;
        },
        destroy() {
        }
      };
    };
  }
}), nn = 3, Ql = [2, 3, 4, 6], hy = H.create({
  name: "gallery",
  group: "block",
  draggable: !0,
  /**
   * A gallery contains galleryImage nodes.
   */
  content: "galleryImage+",
  addAttributes() {
    return {
      columns: {
        default: nn,
        parseHTML: (n) => {
          const t = parseInt(n.getAttribute("data-columns"), 10);
          return Ql.includes(t) ? t : nn;
        },
        renderHTML: (n) => ({ "data-columns": n.columns })
      },
      gap: {
        default: 2,
        parseHTML: (n) => {
          const t = parseInt(n.getAttribute("data-gap"), 10);
          return t >= 0 && t <= 5 ? t : 2;
        },
        renderHTML: (n) => ({ "data-gap": n.gap })
      },
      lightbox: {
        default: !1,
        parseHTML: (n) => n.getAttribute("data-lightbox") === "true",
        renderHTML: (n) => n.lightbox ? { "data-lightbox": "true" } : {}
      }
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="gallery"]' }];
  },
  renderHTML({ HTMLAttributes: n }) {
    n["data-columns"];
    const t = n["data-gap"] ?? 2;
    return [
      "div",
      D(n, {
        "data-type": "gallery",
        class: `row g-${t} tiptap-gallery`
      }),
      0
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a gallery with image sources.
       * @param {Object} options
       * @param {Array<{src: string, alt?: string}>} options.images - Array of image objects
       * @param {number} [options.columns=3] - Number of columns
       * @param {number} [options.gap=2] - Gap between images (0-5)
       * @param {boolean} [options.lightbox=false] - Enable lightbox
       */
      insertGallery: (n = {}) => ({ commands: t }) => {
        const { images: e = [], columns: i = nn, gap: s = 2, lightbox: r = !1 } = n;
        if (e.length === 0) return !1;
        const o = Math.floor(12 / i), l = e.map((a) => ({
          type: "galleryImage",
          attrs: {
            src: a.src || "",
            alt: a.alt || "",
            colClass: `col-${o}`
          }
        }));
        return t.insertContent({
          type: this.name,
          attrs: { columns: i, gap: s, lightbox: r },
          content: l
        });
      },
      /**
       * Change the number of columns in the current gallery.
       * @param {number} columns
       */
      setGalleryColumns: (n) => ({ commands: t }) => Ql.includes(n) ? t.updateAttributes(this.name, { columns: n }) : !1,
      /**
       * Toggle lightbox on the current gallery.
       */
      toggleGalleryLightbox: () => ({ commands: n, editor: t }) => {
        const e = t.getAttributes(this.name);
        return n.updateAttributes(this.name, { lightbox: !e.lightbox });
      }
    };
  },
  addNodeView() {
    return ({ node: n, editor: t, getPos: e }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "gallery"), i.style.position = "relative";
      const s = document.createElement("div");
      s.className = "row tiptap-gallery";
      const r = (l) => {
        const { columns: a, gap: c, lightbox: d } = l, u = c ?? 2;
        s.className = `row g-${u} tiptap-gallery`, d ? s.setAttribute("data-lightbox", "true") : s.removeAttribute("data-lightbox"), s.setAttribute("data-columns", a || nn), s.setAttribute("data-gap", u);
        const p = i.querySelector(".tiptap-node-edit-btn");
        p && p.remove();
        const h = document.createElement("button");
        h.type = "button", h.className = "tiptap-node-edit-btn", h.title = "Edit gallery (double-click)", h.innerHTML = '<i class="bi bi-pencil-square"></i>', h.contentEditable = "false", h.addEventListener("click", (f) => {
          f.preventDefault(), f.stopPropagation(), o();
        }), i.appendChild(h);
      }, o = () => {
        const l = t._tiptapToolbar;
        if (l != null && l.galleryModal) {
          const a = [];
          n.content.forEach((c) => {
            c.type.name === "galleryImage" && a.push({ src: c.attrs.src, alt: c.attrs.alt || "" });
          }), l.galleryModal.open({
            columns: n.attrs.columns,
            gap: n.attrs.gap,
            lightbox: n.attrs.lightbox,
            images: a
          });
        }
      };
      return i.addEventListener("dblclick", (l) => {
        l.preventDefault(), l.stopPropagation(), o();
      }), i.appendChild(s), r(n.attrs), {
        dom: i,
        contentDOM: s,
        update(l) {
          return l.type.name !== "gallery" ? !1 : (r(l.attrs), !0);
        },
        destroy() {
        }
      };
    };
  }
}), fy = H.create({
  name: "galleryImage",
  /**
   * Only valid inside a gallery.
   */
  group: "",
  draggable: !0,
  /**
   * Leaf node – no nested content.
   */
  content: "",
  /**
   * Inline: false (block-level within gallery).
   */
  inline: !1,
  atom: !0,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (n) => {
          const t = n.querySelector("img");
          return t ? t.getAttribute("src") : null;
        }
      },
      alt: {
        default: "",
        parseHTML: (n) => {
          const t = n.querySelector("img");
          return t && t.getAttribute("alt") || "";
        }
      },
      colClass: {
        default: "col-4",
        parseHTML: (n) => n.className.split(" ").find((i) => i.startsWith("col-")) || "col-4"
      }
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="gallery-image"]' }];
  },
  renderHTML({ HTMLAttributes: n }) {
    const { src: t, alt: e, colClass: i } = n;
    return [
      "div",
      {
        "data-type": "gallery-image",
        class: `${i || "col-4"} tiptap-gallery__item`
      },
      [
        "img",
        {
          src: t || "",
          alt: e || "",
          class: "img-fluid rounded",
          loading: "lazy"
        }
      ]
    ];
  }
}), my = K.create({
  name: "trailingNode",
  addProseMirrorPlugins() {
    const n = new J("trailingNode");
    return [
      new V({
        key: n,
        appendTransaction: (t, e, i) => {
          const { doc: s, tr: r, schema: o } = i, l = s.lastChild;
          if (!l) return null;
          const a = l.type.name === "paragraph";
          if (a && l.content.size === 0 || a) return null;
          const d = o.nodes.paragraph;
          return d ? r.insert(s.content.size, d.create()) : null;
        }
      })
    ];
  }
});
function gy(n) {
  var t;
  const { char: e, allowSpaces: i, allowToIncludeChar: s, allowedPrefixes: r, startOfLine: o, $position: l } = n, a = i && !s, c = fm(e), d = new RegExp(`\\s${c}$`), u = o ? "^" : "", p = s ? "" : c, h = a ? new RegExp(`${u}${c}.*?(?=\\s${p}|$)`, "gm") : new RegExp(`${u}(?:^)?${c}[^\\s${p}]*`, "gm"), f = ((t = l.nodeBefore) === null || t === void 0 ? void 0 : t.isText) && l.nodeBefore.text;
  if (!f)
    return null;
  const g = l.pos - f.length, m = Array.from(f.matchAll(h)).pop();
  if (!m || m.input === void 0 || m.index === void 0)
    return null;
  const b = m.input.slice(Math.max(0, m.index - 1), m.index), y = new RegExp(`^[${r == null ? void 0 : r.join("")}\0]?$`).test(b);
  if (r !== null && !y)
    return null;
  const w = g + m.index;
  let M = w + m[0].length;
  return a && d.test(f.slice(M - 1, M + 1)) && (m[0] += " ", M += 1), w < l.pos && M >= l.pos ? {
    range: {
      from: w,
      to: M
    },
    query: m[0].slice(e.length),
    text: m[0]
  } : null;
}
const by = new J("suggestion");
function yy({ pluginKey: n = by, editor: t, char: e = "@", allowSpaces: i = !1, allowToIncludeChar: s = !1, allowedPrefixes: r = [" "], startOfLine: o = !1, decorationTag: l = "span", decorationClass: a = "suggestion", decorationContent: c = "", decorationEmptyClass: d = "is-empty", command: u = () => null, items: p = () => [], render: h = () => ({}), allow: f = () => !0, findSuggestionMatch: g = gy }) {
  let m;
  const b = h == null ? void 0 : h(), y = new V({
    key: n,
    view() {
      return {
        update: async (w, M) => {
          var x, N, S, A, I, P, Y;
          const $ = (x = this.key) === null || x === void 0 ? void 0 : x.getState(M), ut = (N = this.key) === null || N === void 0 ? void 0 : N.getState(w.state), Dt = $.active && ut.active && $.range.from !== ut.range.from, fe = !$.active && ut.active, Pt = $.active && !ut.active, Bt = !fe && !Pt && $.query !== ut.query, Qe = fe || Dt && Bt, Bn = Bt || Dt, ms = Pt || Dt && Bt;
          if (!Qe && !Bn && !ms)
            return;
          const De = ms && !Qe ? $ : ut, go = w.dom.querySelector(`[data-decoration-id="${De.decorationId}"]`);
          m = {
            editor: t,
            range: De.range,
            query: De.query,
            text: De.text,
            items: [],
            command: (Ze) => u({
              editor: t,
              range: De.range,
              props: Ze
            }),
            decorationNode: go,
            // virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            clientRect: go ? () => {
              var Ze;
              const { decorationId: ud } = (Ze = this.key) === null || Ze === void 0 ? void 0 : Ze.getState(t.state), gs = w.dom.querySelector(`[data-decoration-id="${ud}"]`);
              return (gs == null ? void 0 : gs.getBoundingClientRect()) || null;
            } : null
          }, Qe && ((S = b == null ? void 0 : b.onBeforeStart) === null || S === void 0 || S.call(b, m)), Bn && ((A = b == null ? void 0 : b.onBeforeUpdate) === null || A === void 0 || A.call(b, m)), (Bn || Qe) && (m.items = await p({
            editor: t,
            query: De.query
          })), ms && ((I = b == null ? void 0 : b.onExit) === null || I === void 0 || I.call(b, m)), Bn && ((P = b == null ? void 0 : b.onUpdate) === null || P === void 0 || P.call(b, m)), Qe && ((Y = b == null ? void 0 : b.onStart) === null || Y === void 0 || Y.call(b, m));
        },
        destroy: () => {
          var w;
          m && ((w = b == null ? void 0 : b.onExit) === null || w === void 0 || w.call(b, m));
        }
      };
    },
    state: {
      // Initialize the plugin's internal state.
      init() {
        return {
          active: !1,
          range: {
            from: 0,
            to: 0
          },
          query: null,
          text: null,
          composing: !1
        };
      },
      // Apply changes to the plugin state from a view transaction.
      apply(w, M, x, N) {
        const { isEditable: S } = t, { composing: A } = t.view, { selection: I } = w, { empty: P, from: Y } = I, $ = { ...M };
        if ($.composing = A, S && (P || t.view.composing)) {
          (Y < M.range.from || Y > M.range.to) && !A && !M.composing && ($.active = !1);
          const ut = g({
            char: e,
            allowSpaces: i,
            allowToIncludeChar: s,
            allowedPrefixes: r,
            startOfLine: o,
            $position: I.$from
          }), Dt = `id_${Math.floor(Math.random() * 4294967295)}`;
          ut && f({
            editor: t,
            state: N,
            range: ut.range,
            isActive: M.active
          }) ? ($.active = !0, $.decorationId = M.decorationId ? M.decorationId : Dt, $.range = ut.range, $.query = ut.query, $.text = ut.text) : $.active = !1;
        } else
          $.active = !1;
        return $.active || ($.decorationId = null, $.range = { from: 0, to: 0 }, $.query = null, $.text = null), $;
      }
    },
    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(w, M) {
        var x;
        const { active: N, range: S } = y.getState(w.state);
        return N && ((x = b == null ? void 0 : b.onKeyDown) === null || x === void 0 ? void 0 : x.call(b, { view: w, event: M, range: S })) || !1;
      },
      // Setup decorator on the currently active suggestion.
      decorations(w) {
        const { active: M, range: x, decorationId: N, query: S } = y.getState(w);
        if (!M)
          return null;
        const A = !(S != null && S.length), I = [a];
        return A && I.push(d), F.create(w.doc, [
          ot.inline(x.from, x.to, {
            nodeName: l,
            class: I.join(" "),
            "data-decoration-id": N,
            "data-decoration-content": c
          })
        ]);
      }
    }
  });
  return y;
}
const vy = new J("slashCommands"), wy = [
  // ── Text ──────────────────────────────
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text block",
    icon: "text-paragraph",
    group: "Text",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).setParagraph().run();
    }
  },
  {
    id: "heading1",
    label: "Heading 1",
    description: "Big section heading",
    icon: "type-h1",
    group: "Text",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleHeading({ level: 1 }).run();
    }
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium section heading",
    icon: "type-h2",
    group: "Text",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleHeading({ level: 2 }).run();
    }
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small section heading",
    icon: "type-h3",
    group: "Text",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleHeading({ level: 3 }).run();
    }
  },
  // ── Lists ─────────────────────────────
  {
    id: "bulletList",
    label: "Bullet List",
    description: "Unordered list",
    icon: "list-ul",
    group: "Lists",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleBulletList().run();
    }
  },
  {
    id: "orderedList",
    label: "Ordered List",
    description: "Numbered list",
    icon: "list-ol",
    group: "Lists",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleOrderedList().run();
    }
  },
  // ── Blocks ────────────────────────────
  {
    id: "blockquote",
    label: "Blockquote",
    description: "Quotation block",
    icon: "blockquote-left",
    group: "Blocks",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleBlockquote().run();
    }
  },
  {
    id: "codeBlock",
    label: "Code Block",
    description: "Syntax-highlighted code",
    icon: "code-square",
    group: "Blocks",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).toggleCodeBlock().run();
    }
  },
  {
    id: "horizontalRule",
    label: "Divider",
    description: "Horizontal separator line",
    icon: "hr",
    group: "Blocks",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).setHorizontalRule().run();
    }
  },
  // ── Media ─────────────────────────────
  {
    id: "image",
    label: "Image",
    description: "Upload or embed an image",
    icon: "image",
    group: "Media",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).run();
      const e = new CustomEvent("tiptap:insert-image", { bubbles: !0 });
      n.view.dom.dispatchEvent(e);
    }
  },
  {
    id: "video",
    label: "Video",
    description: "YouTube, Vimeo, or MP4",
    icon: "play-btn",
    group: "Media",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).run();
      const e = prompt("Enter video URL (YouTube, Vimeo, or MP4):");
      e && n.chain().focus().insertCustomVideo({ url: e }).run();
    }
  },
  // ── Table ─────────────────────────────
  {
    id: "table",
    label: "Table",
    description: "3×3 table with header",
    icon: "table",
    group: "Insert",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).insertTable({ rows: 3, cols: 3, withHeaderRow: !0 }).run();
    }
  },
  // ── Layout ────────────────────────────
  {
    id: "row2col",
    label: "2 Columns",
    description: "Two equal columns",
    icon: "layout-split",
    group: "Layout",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).insertBootstrapRow("2-col").run();
    }
  },
  {
    id: "row3col",
    label: "3 Columns",
    description: "Three equal columns",
    icon: "grid-3x3",
    group: "Layout",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).insertBootstrapRow("3-col").run();
    }
  },
  {
    id: "rowSidebarLeft",
    label: "Sidebar Left",
    description: "Narrow + wide column",
    icon: "layout-sidebar",
    group: "Layout",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).insertBootstrapRow("1-2").run();
    }
  },
  // ── Components ────────────────────────
  {
    id: "alert",
    label: "Alert",
    description: "Bootstrap alert box",
    icon: "exclamation-triangle",
    group: "Components",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).insertBootstrapAlert("info").run();
    }
  },
  {
    id: "card",
    label: "Card",
    description: "Bootstrap card with header",
    icon: "card-heading",
    group: "Components",
    command: ({ editor: n, range: t }) => {
      n.chain().focus().deleteRange(t).insertBootstrapCard({ headerText: null }).run();
    }
  }
];
function ky(n, t) {
  if (!t) return n;
  const e = t.toLowerCase();
  return n.filter(
    (i) => i.label.toLowerCase().includes(e) || i.description.toLowerCase().includes(e) || i.group.toLowerCase().includes(e)
  );
}
function xy(n) {
  const t = {};
  return n.forEach((e) => {
    const i = e.group || "Other";
    t[i] || (t[i] = []), t[i].push(e);
  }), t;
}
function Cy() {
  let n = null, t = 0, e = [], i = null;
  function s() {
    const a = document.createElement("div");
    return a.className = "tiptap-slash-menu", a.setAttribute("role", "listbox"), a.style.display = "none", document.body.appendChild(a), a;
  }
  function r(a) {
    if (!n) return;
    e = a;
    const c = xy(a);
    let d = "", u = 0;
    if (a.length === 0)
      d = '<div class="tiptap-slash-menu__empty">No matching commands</div>';
    else
      for (const [h, f] of Object.entries(c))
        d += `<div class="tiptap-slash-menu__group-label">${h}</div>`, f.forEach((g) => {
          const m = u === t;
          d += `
            <button
              type="button"
              class="tiptap-slash-menu__item${m ? " tiptap-slash-menu__item--selected" : ""}"
              data-index="${u}"
              role="option"
              aria-selected="${m}"
            >
              <span class="tiptap-slash-menu__icon"><i class="bi bi-${g.icon}"></i></span>
              <span class="tiptap-slash-menu__text">
                <span class="tiptap-slash-menu__label">${g.label}</span>
                <span class="tiptap-slash-menu__description">${g.description}</span>
              </span>
            </button>
          `, u++;
        });
    n.innerHTML = d, n.querySelectorAll(".tiptap-slash-menu__item").forEach((h) => {
      h.addEventListener("mousedown", (f) => {
        f.preventDefault();
        const g = parseInt(h.getAttribute("data-index"), 10);
        o(g);
      }), h.addEventListener("mouseenter", () => {
        t = parseInt(h.getAttribute("data-index"), 10), r(e);
      });
    });
    const p = n.querySelector(".tiptap-slash-menu__item--selected");
    p && p.scrollIntoView({ block: "nearest" });
  }
  function o(a) {
    const c = e[a];
    c && i && i(c);
  }
  function l(a) {
    if (!n || !a) return;
    const c = typeof a == "function" ? a() : a;
    if (!c) return;
    n.style.position = "fixed", n.style.left = `${c.left}px`, n.style.top = `${c.bottom + 4}px`, n.style.display = "block";
    const d = n.getBoundingClientRect();
    d.right > window.innerWidth - 8 && (n.style.left = `${window.innerWidth - d.width - 8}px`), d.bottom > window.innerHeight - 8 && (n.style.top = `${c.top - d.height - 4}px`);
  }
  return {
    onStart(a) {
      n || (n = s()), t = 0, i = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, r(a.items), l(a.clientRect);
    },
    onUpdate(a) {
      t = 0, i = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, r(a.items), l(a.clientRect);
    },
    onKeyDown(a) {
      const { event: c } = a;
      return c.key === "ArrowUp" ? (c.preventDefault(), t = (t - 1 + e.length) % e.length, r(e), !0) : c.key === "ArrowDown" ? (c.preventDefault(), t = (t + 1) % e.length, r(e), !0) : c.key === "Enter" ? (c.preventDefault(), o(t), !0) : c.key === "Escape" ? (c.preventDefault(), n && (n.style.display = "none"), !0) : !1;
    },
    onExit() {
      n && (n.style.display = "none"), e = [], i = null;
    }
  };
}
const Sy = K.create({
  name: "slashCommands",
  addOptions() {
    return {
      commands: null,
      filterFn: null
    };
  },
  addProseMirrorPlugins() {
    const n = this.options.commands || wy, t = this.options.filterFn || ky;
    return [
      yy({
        editor: this.editor,
        char: "/",
        pluginKey: vy,
        startOfLine: !1,
        items: ({ query: e }) => t(n, e),
        render: Cy
      })
    ];
  }
});
class My {
  /**
   * @param {import('./Toolbar').Toolbar} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._pendingFile = null, this._editMode = !1, this._libraryLoaded = !1, this._libraryPage = 1, this._libraryHasMore = !1, this._selectedLibraryItem = null, this._build();
  }
  /* ─────────────────────────────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   */
  open(t = null) {
    this._reset(), this._editMode = !!t, t && this._populate(t), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ─────────────────────────────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    e || console.warn("[TiptapEditor] Bootstrap Modal not found. Image modal may not work."), this._bs = e ? new e(this._modal) : { show: () => {
    }, hide: () => {
    }, dispose: () => {
    } }, this._bindEvents();
  }
  _template() {
    return `
<div class="modal fade tiptap-image-modal" id="tiptap-image-modal-${Date.now()}"
     tabindex="-1" aria-labelledby="tiptap-img-modal-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="tiptap-img-modal-title">
          <i class="bi bi-image me-2 text-primary"></i>
          <span class="tiptap-img-modal-title-text">Insert Image</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body p-3">
        <div class="row g-3">

          <!-- ── Left column: source ── -->
          <div class="col-lg-7">

            <!-- Source tabs -->
            <ul class="nav nav-tabs nav-sm mb-3 border-bottom" role="tablist">
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 active tiptap-img-tab-btn fs-sm"
                        data-tab="upload" role="tab">
                  <i class="bi bi-upload me-1"></i>Upload
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-img-tab-btn fs-sm"
                        data-tab="url" role="tab">
                  <i class="bi bi-link-45deg me-1"></i>URL
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-img-tab-btn fs-sm"
                        data-tab="library" role="tab">
                  <i class="bi bi-images me-1"></i>Library
                </button>
              </li>
            </ul>

            <!-- Upload panel -->
            <div class="tiptap-img-panel" data-panel="upload">
              <div class="tiptap-img-dropzone rounded-2 border-2 border-dashed
                          d-flex flex-column align-items-center justify-content-center
                          py-4 px-3 gap-2 text-center position-relative"
                   id="tiptap-img-dropzone-el" style="cursor:pointer;min-height:130px">
                <i class="bi bi-cloud-upload fs-3 text-secondary"></i>
                <p class="mb-0 small text-secondary tiptap-img-dropzone-label">
                  Drag & drop image here, or click to browse
                </p>
                <span class="badge bg-light text-secondary border tiptap-img-file-name d-none"></span>
                <input type="file" accept="image/*" class="tiptap-img-file-input"
                       style="position:absolute;inset:0;opacity:0;cursor:pointer">
              </div>
            </div>

            <!-- URL panel -->
            <div class="tiptap-img-panel d-none" data-panel="url">
              <label class="form-label small fw-medium mb-1">Image URL</label>
              <input type="url" class="form-control form-control-sm tiptap-img-url-input"
                     placeholder="https://example.com/image.jpg">
              <div class="form-text">Enter a direct link to an image file.</div>
            </div>

            <!-- Library panel -->
            <div class="tiptap-img-panel d-none" data-panel="library">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="input-group input-group-sm flex-grow-1">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control tiptap-img-library-search"
                         placeholder="Search images...">
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary tiptap-img-library-refresh"
                        title="Refresh"><i class="bi bi-arrow-clockwise"></i></button>
              </div>
              <div class="tiptap-img-library-grid" style="max-height:220px;overflow-y:auto;"></div>
              <div class="tiptap-img-library-status text-center py-2 small text-muted d-none"></div>
              <div class="text-center mt-2">
                <button type="button" class="btn btn-sm btn-outline-secondary tiptap-img-library-more d-none">
                  Load more
                </button>
              </div>
            </div>

            <!-- ─── Common fields ─── -->
            <div class="mt-3 d-flex flex-column gap-2">

              <!-- Alt -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Alt Text
                  <span class="text-muted fw-normal">(recommended for accessibility & SEO)</span>
                </label>
                <input type="text" class="form-control form-control-sm tiptap-img-alt-input"
                       placeholder="Describe the image…">
              </div>

              <!-- Caption -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Caption <span class="text-muted fw-normal">(optional)</span>
                </label>
                <input type="text" class="form-control form-control-sm tiptap-img-caption-input"
                       placeholder="Shown below the image">
              </div>

              <!-- Link -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Link URL <span class="text-muted fw-normal">(wrap image in &lt;a&gt;)</span>
                </label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
                  <input type="url" class="form-control tiptap-img-link-input"
                         placeholder="https://…">
                  <div class="input-group-text p-0 border-0 bg-transparent">
                    <div class="form-check form-check-sm ms-2 mb-0">
                      <input class="form-check-input tiptap-img-link-blank" type="checkbox"
                             id="tiptap-img-link-blank-chk">
                      <label class="form-check-label small" for="tiptap-img-link-blank-chk">
                        _blank
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div><!-- /common fields -->
          </div><!-- /left col -->

          <!-- ── Right column: options + preview ── -->
          <div class="col-lg-5">

            <!-- Preview -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Preview</label>
              <div class="tiptap-img-preview-wrap rounded-2 bg-body-secondary
                          d-flex align-items-center justify-content-center"
                   style="min-height:120px;overflow:hidden">
                <img class="tiptap-img-preview img-fluid rounded"
                     alt="" style="max-height:160px;display:none">
                <span class="tiptap-img-preview-placeholder text-secondary">
                  <i class="bi bi-image fs-2 d-block"></i>
                  <span class="small">No image</span>
                </span>
              </div>
            </div>

            <!-- Alignment -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Alignment</label>
              <div class="d-flex gap-2">
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align left" style="cursor:pointer">
                  <input type="radio" name="tiptap-img-align-radio" value="left"
                         class="d-none tiptap-img-align-radio">
                  <i class="bi bi-align-start d-block fs-5"></i>
                  <span style="font-size:10px">Left</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1 tiptap-align-active"
                       title="Align center" style="cursor:pointer">
                  <input type="radio" name="tiptap-img-align-radio" value="center"
                         class="d-none tiptap-img-align-radio" checked>
                  <i class="bi bi-align-center d-block fs-5"></i>
                  <span style="font-size:10px">Center</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align right" style="cursor:pointer">
                  <input type="radio" name="tiptap-img-align-radio" value="right"
                         class="d-none tiptap-img-align-radio">
                  <i class="bi bi-align-end d-block fs-5"></i>
                  <span style="font-size:10px">Right</span>
                </label>
              </div>
            </div>

            <!-- Width -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Width</label>
              <div class="d-flex gap-1 flex-wrap mb-2">
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0 active"
                        data-width="">Auto</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="25%">25%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="50%">50%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="75%">75%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="100%">100%</button>
              </div>
              <div class="input-group input-group-sm">
                <input type="text" class="form-control tiptap-img-width-input"
                       placeholder="e.g. 480px or 60%">
                <span class="input-group-text text-muted">px / %</span>
              </div>
              <div class="form-text">Leave blank to use natural image size.</div>
            </div>

            <!-- Extra class -->
            <div class="mb-1">
              <label class="form-label small fw-medium mb-1">
                Extra CSS Class
                <span class="text-muted fw-normal">(optional)</span>
              </label>
              <input type="text" class="form-control form-control-sm tiptap-img-class-input"
                     placeholder="rounded-circle shadow-sm border …">
            </div>

          </div><!-- /right col -->
        </div><!-- /row -->
      </div><!-- /modal-body -->

      <!-- Footer -->
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
          Cancel
        </button>
        <button type="button" class="btn btn-sm btn-primary tiptap-img-insert-btn">
          <i class="bi bi-check2 me-1"></i>
          <span class="tiptap-img-insert-btn-label">Insert Image</span>
        </button>
      </div>

    </div><!-- /modal-content -->
  </div><!-- /modal-dialog -->
</div>`;
  }
  _bindEvents() {
    const t = (r) => this._modal.querySelector(r), e = (r) => this._modal.querySelectorAll(r);
    e(".tiptap-img-tab-btn").forEach((r) => {
      r.addEventListener("click", () => {
        e(".tiptap-img-tab-btn").forEach((o) => o.classList.remove("active")), e(".tiptap-img-panel").forEach((o) => o.classList.add("d-none")), r.classList.add("active"), t(`[data-panel="${r.dataset.tab}"]`).classList.remove("d-none"), r.dataset.tab === "library" && !this._libraryLoaded && this._loadLibrary();
      });
    }), this._bindLibraryEvents(), t(".tiptap-img-file-input").addEventListener("change", (r) => {
      var l;
      const o = (l = r.target.files) == null ? void 0 : l[0];
      o && this._handleFileSelected(o);
    });
    const s = t("#tiptap-img-dropzone-el");
    s.addEventListener("dragover", (r) => {
      r.preventDefault(), s.classList.add("tiptap-img-dragover");
    }), s.addEventListener("dragleave", () => s.classList.remove("tiptap-img-dragover")), s.addEventListener("drop", (r) => {
      var l;
      r.preventDefault(), s.classList.remove("tiptap-img-dragover");
      const o = (l = r.dataTransfer.files) == null ? void 0 : l[0];
      o != null && o.type.startsWith("image/") && this._handleFileSelected(o);
    }), t(".tiptap-img-url-input").addEventListener("input", (r) => {
      this._updatePreview(r.target.value.trim());
    }), e(".tiptap-img-align-radio").forEach((r) => {
      r.addEventListener("change", () => {
        var o;
        e(".tiptap-align-btn").forEach((l) => l.classList.remove("tiptap-align-active")), (o = r.closest(".tiptap-align-btn")) == null || o.classList.add("tiptap-align-active");
      });
    }), e(".tiptap-width-btn").forEach((r) => {
      r.addEventListener("click", () => {
        e(".tiptap-width-btn").forEach((o) => o.classList.remove("active")), r.classList.add("active"), t(".tiptap-img-width-input").value = r.dataset.width;
      });
    }), t(".tiptap-img-width-input").addEventListener("input", () => {
      e(".tiptap-width-btn").forEach((r) => r.classList.remove("active"));
    }), t(".tiptap-img-insert-btn").addEventListener("click", () => this._insert()), this._modal.addEventListener("hidden.bs.modal", () => this._reset());
  }
  _handleFileSelected(t) {
    this._pendingFile = t;
    const e = new FileReader();
    e.onload = (o) => this._updatePreview(o.target.result), e.readAsDataURL(t);
    const i = this._modal.querySelector(".tiptap-img-dropzone-label");
    i && (i.textContent = "📎 " + t.name);
    const s = this._modal.querySelector(".tiptap-img-file-name");
    s && (s.textContent = t.name, s.classList.remove("d-none"));
    const r = this._modal.querySelector(".tiptap-img-alt-input");
    r && !r.value && (r.value = t.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }
  _updatePreview(t) {
    const e = this._modal.querySelector(".tiptap-img-preview"), i = this._modal.querySelector(".tiptap-img-preview-placeholder");
    t ? (e.src = t, e.style.display = "", i && (i.style.display = "none")) : (e.src = "", e.style.display = "none", i && (i.style.display = ""));
  }
  _populate(t) {
    var l;
    const e = (a) => this._modal.querySelector(a), i = (a) => this._modal.querySelectorAll(a);
    e('[data-tab="url"]').click(), e(".tiptap-img-url-input").value = t.src || "", e(".tiptap-img-alt-input").value = t.alt || "", e(".tiptap-img-caption-input").value = t.caption || "", e(".tiptap-img-link-input").value = t.linkUrl || "", e(".tiptap-img-link-blank").checked = t.linkTarget === "_blank", e(".tiptap-img-width-input").value = t.widthStyle || "", e(".tiptap-img-class-input").value = t.extraClass || "", t.src && this._updatePreview(t.src);
    const s = t.alignment || "center", r = e(`[name="tiptap-img-align-radio"][value="${s}"]`);
    r && (r.checked = !0, i(".tiptap-align-btn").forEach((a) => a.classList.remove("tiptap-align-active")), (l = r.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active"));
    const o = t.widthStyle || "";
    i(".tiptap-width-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.width === o);
    }), e(".tiptap-img-modal-title-text").textContent = "Edit Image", e(".tiptap-img-insert-btn-label").textContent = "Update Image";
  }
  async _insert() {
    var m, b;
    const t = (y) => this._modal.querySelector(y), e = (m = this._modal.querySelector(".tiptap-img-tab-btn.active")) == null ? void 0 : m.dataset.tab, i = t(".tiptap-img-alt-input").value.trim(), s = t(".tiptap-img-caption-input").value.trim(), r = t(".tiptap-img-link-input").value.trim(), o = t(".tiptap-img-link-blank").checked, l = t(".tiptap-img-width-input").value.trim(), a = t(".tiptap-img-class-input").value.trim(), c = ((b = t('[name="tiptap-img-align-radio"]:checked')) == null ? void 0 : b.value) || "center";
    let d = null;
    l && (l.endsWith("%") || l.endsWith("px") ? d = l : isNaN(parseFloat(l)) || (d = parseFloat(l) + "px"));
    const u = t(".tiptap-img-insert-btn");
    u.disabled = !0, u.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing…';
    let p = null, h = null, f = null, g = null;
    try {
      if (e === "upload" && this._pendingFile) {
        const w = this.toolbar._getUploadUrl();
        if (w) {
          const M = await this.toolbar._uploadFile(this._pendingFile, w);
          p = M.url, h = M.id || null, f = M.width || null, g = M.height || null;
        } else
          p = await this._toBase64(this._pendingFile);
      } else e === "library" && this._selectedLibraryItem ? (p = this._selectedLibraryItem.url, h = this._selectedLibraryItem.id || null, f = this._selectedLibraryItem.width || null, g = this._selectedLibraryItem.height || null) : p = t(".tiptap-img-url-input").value.trim();
      if (!p) {
        this._showError("Please provide an image file or URL.");
        return;
      }
      const y = {
        src: p,
        alt: i || "",
        caption: s || null,
        linkUrl: r || null,
        linkTarget: r && o ? "_blank" : null,
        widthStyle: d || null,
        extraClass: a || null,
        alignment: c,
        mediaId: h || null,
        // Keep pixel dimensions from upload for img width/height attributes
        width: f || null,
        height: g || null
      };
      this._editMode ? this.editor.chain().focus().updateCustomImage(y).run() : this.editor.chain().focus().insertCustomImage(y).run(), this._bs.hide();
    } catch (y) {
      console.error("[TiptapEditor] Image modal error:", y), this._showError(y.message || "Image operation failed.");
    } finally {
      u.disabled = !1, u.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-img-insert-btn-label">' + (this._editMode ? "Update Image" : "Insert Image") + "</span>";
    }
  }
  _showError(t) {
    let e = this._modal.querySelector(".tiptap-img-error");
    e || (e = document.createElement("div"), e.className = "alert alert-danger alert-sm py-1 px-2 mt-2 small tiptap-img-error", this._modal.querySelector(".modal-body").prepend(e)), e.textContent = t, e.style.display = "", setTimeout(() => {
      e.style.display = "none";
    }, 4e3);
  }
  _toBase64(t) {
    return new Promise((e, i) => {
      const s = new FileReader();
      s.onload = (r) => e(r.target.result), s.onerror = i, s.readAsDataURL(t);
    });
  }
  /* ──────────────── Media Library ──────────────── */
  _bindLibraryEvents() {
    var i, s, r;
    const t = (o) => this._modal.querySelector(o);
    let e = null;
    (i = t(".tiptap-img-library-search")) == null || i.addEventListener("input", (o) => {
      clearTimeout(e), e = setTimeout(() => {
        this._libraryPage = 1, this._loadLibrary(o.target.value.trim());
      }, 300);
    }), (s = t(".tiptap-img-library-refresh")) == null || s.addEventListener("click", () => {
      var l, a;
      this._libraryPage = 1, this._libraryLoaded = !1;
      const o = ((a = (l = t(".tiptap-img-library-search")) == null ? void 0 : l.value) == null ? void 0 : a.trim()) || "";
      this._loadLibrary(o);
    }), (r = t(".tiptap-img-library-more")) == null || r.addEventListener("click", () => {
      var l, a;
      this._libraryPage++;
      const o = ((a = (l = t(".tiptap-img-library-search")) == null ? void 0 : l.value) == null ? void 0 : a.trim()) || "";
      this._loadLibrary(o, !0);
    });
  }
  async _loadLibrary(t = "", e = !1) {
    var l;
    const i = this.toolbar._getBrowseUrl();
    if (!i) {
      this._showLibraryStatus("Media library not available");
      return;
    }
    const s = this._modal.querySelector(".tiptap-img-library-grid"), r = this._modal.querySelector(".tiptap-img-library-more"), o = this._modal.querySelector(".tiptap-img-library-status");
    e || (s.innerHTML = '<div class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>');
    try {
      const a = new URLSearchParams({ type: "image", page: this._libraryPage });
      t && a.set("search", t);
      const c = ((l = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : l.content) || "", d = await fetch(`${i}?${a}`, {
        headers: { Accept: "application/json", "X-CSRF-TOKEN": c }
      });
      if (!d.ok) throw new Error(`HTTP ${d.status}`);
      const u = await d.json(), p = u.data || [], h = u.pagination || {};
      if (e || (s.innerHTML = ""), p.length === 0 && !e) {
        this._showLibraryStatus("No images found"), r == null || r.classList.add("d-none");
        return;
      }
      o == null || o.classList.add("d-none"), p.forEach((f) => {
        const g = document.createElement("div");
        g.className = "tiptap-img-library-item", g.dataset.url = f.url, g.dataset.alt = f.alt || "", g.dataset.title = f.title || "", g.title = f.filename || "";
        const m = document.createElement("img");
        m.src = f.thumbnail || f.url, m.alt = f.alt || f.filename || "", m.loading = "lazy", g.appendChild(m);
        const b = document.createElement("span");
        b.className = "tiptap-img-library-name", b.textContent = f.filename || "", g.appendChild(b), g.addEventListener("click", () => {
          s.querySelectorAll(".tiptap-img-library-item").forEach((w) => w.classList.remove("selected")), g.classList.add("selected"), this._selectedLibraryItem = f, this._updatePreview(f.url);
          const y = this._modal.querySelector(".tiptap-img-alt-input");
          y && !y.value && f.alt && (y.value = f.alt);
        }), s.appendChild(g);
      }), this._libraryHasMore = h.current_page < h.last_page, r == null || r.classList.toggle("d-none", !this._libraryHasMore), this._libraryLoaded = !0;
    } catch (a) {
      console.error("[TiptapEditor] Library load error:", a), e || (s.innerHTML = ""), this._showLibraryStatus("Failed to load media library");
    }
  }
  _showLibraryStatus(t) {
    const e = this._modal.querySelector(".tiptap-img-library-status");
    e && (e.textContent = t, e.classList.remove("d-none"));
  }
  _reset() {
    var l, a, c;
    const t = (d) => this._modal.querySelector(d), e = (d) => this._modal.querySelectorAll(d);
    this._pendingFile = null, this._editMode = !1, this._selectedLibraryItem = null;
    const i = t(".tiptap-img-file-input");
    i && (i.value = ""), t(".tiptap-img-url-input").value = "", t(".tiptap-img-alt-input").value = "", t(".tiptap-img-caption-input").value = "", t(".tiptap-img-link-input").value = "", t(".tiptap-img-link-blank").checked = !1, t(".tiptap-img-width-input").value = "", t(".tiptap-img-class-input").value = "", this._updatePreview("");
    const s = t(".tiptap-img-dropzone-label");
    s && (s.textContent = "Drag & drop image here, or click to browse");
    const r = t(".tiptap-img-file-name");
    r && r.classList.add("d-none");
    const o = t('[name="tiptap-img-align-radio"][value="center"]');
    o && (o.checked = !0, e(".tiptap-align-btn").forEach((d) => d.classList.remove("tiptap-align-active")), (l = o.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active")), e(".tiptap-width-btn").forEach((d) => d.classList.remove("active")), (a = t('[data-width=""]')) == null || a.classList.add("active"), (c = t('[data-tab="upload"]')) == null || c.click(), t(".tiptap-img-modal-title-text").textContent = "Insert Image", t(".tiptap-img-insert-btn-label").textContent = "Insert Image";
  }
}
class Ey {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._editMode = !1, this._build();
  }
  /* ─────────────────────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode
   */
  open(t = null) {
    this._reset(), this._editMode = !!t;
    const e = this._modal.querySelector(".tiptap-link-modal-title-text");
    e && (e.textContent = this._editMode ? "Edit Link" : "Insert Link");
    const i = this._modal.querySelector(".tiptap-link-unlink-btn");
    i && (i.style.display = this._editMode ? "" : "none"), t && this._populate(t), this._showSelectedText(), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ─────────────────────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    e || console.warn("[TiptapEditor] Bootstrap Modal not found. Link modal may not work."), this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _template() {
    const t = `tiptap-link-modal-${Date.now()}`;
    return `
<div class="modal fade tiptap-link-modal" id="${t}"
     tabindex="-1" aria-labelledby="${t}-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="${t}-title">
          <i class="bi bi-link-45deg me-2 text-primary"></i>
          <span class="tiptap-link-modal-title-text">Insert Link</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body p-3">

        <!-- Selected text context -->
        <div class="tiptap-link-selected-text mb-3 d-none">
          <small class="text-muted">Selected text:</small>
          <span class="fw-medium tiptap-link-selected-text-label"></span>
        </div>

        <!-- Link type tabs -->
        <ul class="nav nav-pills nav-sm mb-3 gap-1" role="tablist">
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 active tiptap-link-type-btn fs-sm"
                    data-type="url" role="tab">
              <i class="bi bi-globe me-1"></i>URL
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 tiptap-link-type-btn fs-sm"
                    data-type="anchor" role="tab">
              <i class="bi bi-hash me-1"></i>Anchor
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 tiptap-link-type-btn fs-sm"
                    data-type="email" role="tab">
              <i class="bi bi-envelope me-1"></i>Email
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 tiptap-link-type-btn fs-sm"
                    data-type="tel" role="tab">
              <i class="bi bi-phone me-1"></i>Phone
            </button>
          </li>
        </ul>

        <!-- URL panel -->
        <div class="tiptap-link-panel" data-panel="url">
          <label class="form-label small fw-medium mb-1">URL</label>
          <input type="url" class="form-control form-control-sm tiptap-link-href-input"
                 placeholder="https://example.com">
        </div>

        <!-- Anchor panel -->
        <div class="tiptap-link-panel d-none" data-panel="anchor">
          <label class="form-label small fw-medium mb-1">Anchor ID</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text">#</span>
            <input type="text" class="form-control tiptap-link-anchor-input"
                   placeholder="section-name">
          </div>
          <div class="form-text">Link to an element with this ID on the same page.</div>
        </div>

        <!-- Email panel -->
        <div class="tiptap-link-panel d-none" data-panel="email">
          <label class="form-label small fw-medium mb-1">Email Address</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control tiptap-link-email-input"
                   placeholder="user@example.com">
          </div>
        </div>

        <!-- Phone panel -->
        <div class="tiptap-link-panel d-none" data-panel="tel">
          <label class="form-label small fw-medium mb-1">Phone Number</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-phone"></i></span>
            <input type="tel" class="form-control tiptap-link-tel-input"
                   placeholder="+1 234 567 8900">
          </div>
        </div>

        <hr class="my-3">

        <!-- Title -->
        <div class="mb-3">
          <label class="form-label small fw-medium mb-1">
            Title <span class="text-muted fw-normal">(tooltip on hover)</span>
          </label>
          <input type="text" class="form-control form-control-sm tiptap-link-title-input"
                 placeholder="Link title…">
        </div>

        <!-- Target & rel row -->
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <div class="form-check">
              <input class="form-check-input tiptap-link-blank-check" type="checkbox"
                     id="${t}-blank">
              <label class="form-check-label small" for="${t}-blank">
                Open in new tab <code class="small">_blank</code>
              </label>
            </div>
          </div>
        </div>

        <!-- Rel options -->
        <div class="mb-3">
          <label class="form-label small fw-medium mb-1">
            Rel attributes <span class="text-muted fw-normal">(SEO)</span>
          </label>
          <div class="d-flex flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="nofollow" id="${t}-nofollow">
              <label class="form-check-label small" for="${t}-nofollow">nofollow</label>
            </div>
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="ugc" id="${t}-ugc">
              <label class="form-check-label small" for="${t}-ugc">ugc</label>
            </div>
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="sponsored" id="${t}-sponsored">
              <label class="form-check-label small" for="${t}-sponsored">sponsored</label>
            </div>
          </div>
        </div>

        <!-- CSS class -->
        <div class="mb-1">
          <label class="form-label small fw-medium mb-1">
            CSS Class <span class="text-muted fw-normal">(optional)</span>
          </label>
          <input type="text" class="form-control form-control-sm tiptap-link-class-input"
                 placeholder="e.g. btn btn-primary">
        </div>

      </div><!-- /body -->

      <!-- Footer -->
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger tiptap-link-unlink-btn"
                style="display:none">
          <i class="bi bi-link-45deg me-1"></i>Unlink
        </button>
        <div class="flex-grow-1"></div>
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary tiptap-link-insert-btn">
          <i class="bi bi-check2 me-1"></i><span class="tiptap-link-insert-btn-text">Insert Link</span>
        </button>
      </div>

    </div>
  </div>
</div>`;
  }
  _bindEvents() {
    this._modal.querySelectorAll(".tiptap-link-type-btn").forEach((t) => {
      t.addEventListener("click", () => {
        this._switchType(t.dataset.type);
      });
    }), this._modal.querySelector(".tiptap-link-insert-btn").addEventListener("click", () => this._submit()), this._modal.querySelector(".tiptap-link-unlink-btn").addEventListener("click", () => this._unlink()), this._modal.querySelectorAll("input").forEach((t) => {
      t.addEventListener("keydown", (e) => {
        e.key === "Enter" && (e.preventDefault(), this._submit());
      });
    });
  }
  _switchType(t) {
    this._modal.querySelectorAll(".tiptap-link-type-btn").forEach((e) => {
      e.classList.toggle("active", e.dataset.type === t);
    }), this._modal.querySelectorAll(".tiptap-link-panel").forEach((e) => {
      e.classList.toggle("d-none", e.dataset.panel !== t);
    });
  }
  _reset() {
    this._editMode = !1, this._modal.querySelector(".tiptap-link-href-input").value = "", this._modal.querySelector(".tiptap-link-anchor-input").value = "", this._modal.querySelector(".tiptap-link-email-input").value = "", this._modal.querySelector(".tiptap-link-tel-input").value = "", this._modal.querySelector(".tiptap-link-title-input").value = "", this._modal.querySelector(".tiptap-link-class-input").value = "", this._modal.querySelector(".tiptap-link-blank-check").checked = !1, this._modal.querySelectorAll(".tiptap-link-rel-check").forEach((i) => {
      i.checked = !1;
    }), this._switchType("url");
    const t = this._modal.querySelector(".tiptap-link-insert-btn-text");
    t && (t.textContent = "Insert Link");
    const e = this._modal.querySelector(".tiptap-link-selected-text");
    e && e.classList.add("d-none");
  }
  _showSelectedText() {
    const { from: t, to: e } = this.editor.state.selection, i = this.editor.state.doc.textBetween(t, e, " "), s = this._modal.querySelector(".tiptap-link-selected-text"), r = this._modal.querySelector(".tiptap-link-selected-text-label");
    i && i.trim() && (s && s.classList.remove("d-none"), r && (r.textContent = i.length > 60 ? i.substring(0, 60) + "…" : i));
  }
  _populate(t) {
    const e = t.href || "", i = t.target || "", s = t.rel || "", r = t.title || "", o = t.class || "";
    e.startsWith("mailto:") ? (this._switchType("email"), this._modal.querySelector(".tiptap-link-email-input").value = e.replace("mailto:", "")) : e.startsWith("tel:") ? (this._switchType("tel"), this._modal.querySelector(".tiptap-link-tel-input").value = e.replace("tel:", "")) : e.startsWith("#") ? (this._switchType("anchor"), this._modal.querySelector(".tiptap-link-anchor-input").value = e.replace("#", "")) : (this._switchType("url"), this._modal.querySelector(".tiptap-link-href-input").value = e), this._modal.querySelector(".tiptap-link-title-input").value = r, this._modal.querySelector(".tiptap-link-class-input").value = o, this._modal.querySelector(".tiptap-link-blank-check").checked = i === "_blank";
    const l = s.split(/\s+/).filter(Boolean);
    this._modal.querySelectorAll(".tiptap-link-rel-check").forEach((c) => {
      c.checked = l.includes(c.value);
    });
    const a = this._modal.querySelector(".tiptap-link-insert-btn-text");
    a && (a.textContent = "Update Link");
  }
  /**
   * Build the href from current active type & input.
   * @returns {string|null}
   */
  _getHref() {
    var e;
    switch (((e = this._modal.querySelector(".tiptap-link-type-btn.active")) == null ? void 0 : e.dataset.type) || "url") {
      case "url":
        return this._modal.querySelector(".tiptap-link-href-input").value.trim();
      case "anchor": {
        const i = this._modal.querySelector(".tiptap-link-anchor-input").value.trim();
        return i ? `#${i}` : null;
      }
      case "email": {
        const i = this._modal.querySelector(".tiptap-link-email-input").value.trim();
        return i ? `mailto:${i}` : null;
      }
      case "tel": {
        const i = this._modal.querySelector(".tiptap-link-tel-input").value.trim();
        return i ? `tel:${i}` : null;
      }
      default:
        return null;
    }
  }
  /**
   * Build rel string from checked checkboxes.
   * @returns {string}
   */
  _getRel() {
    const t = [];
    return this._modal.querySelector(".tiptap-link-blank-check").checked && t.push("noopener"), this._modal.querySelectorAll(".tiptap-link-rel-check:checked").forEach((i) => {
      t.includes(i.value) || t.push(i.value);
    }), t.join(" ");
  }
  _submit() {
    var l;
    const t = this._getHref();
    if (!t) {
      const a = ((l = this._modal.querySelector(".tiptap-link-type-btn.active")) == null ? void 0 : l.dataset.type) || "url", c = {
        url: ".tiptap-link-href-input",
        anchor: ".tiptap-link-anchor-input",
        email: ".tiptap-link-email-input",
        tel: ".tiptap-link-tel-input"
      }, d = this._modal.querySelector(c[a]);
      d && (d.classList.add("is-invalid"), d.focus(), setTimeout(() => d.classList.remove("is-invalid"), 2e3));
      return;
    }
    const e = this._modal.querySelector(".tiptap-link-blank-check").checked ? "_blank" : null, i = this._getRel() || null, s = this._modal.querySelector(".tiptap-link-title-input").value.trim() || null, r = this._modal.querySelector(".tiptap-link-class-input").value.trim() || null, o = { href: t };
    e && (o.target = e), i && (o.rel = i), s && (o.title = s), r && (o.class = r), this.editor.chain().focus().extendMarkRange("link").setLink(o).run(), this._bs.hide();
  }
  _unlink() {
    this.editor.chain().focus().unsetLink().run(), this._bs.hide();
  }
}
class _y {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._editMode = !1, this._pendingFile = null, this._libraryLoaded = !1, this._libraryPage = 1, this._libraryHasMore = !1, this._selectedLibraryItem = null, this._build();
  }
  /* ─────────────────────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode
   */
  open(t = null) {
    this._reset(), this._editMode = !!t;
    const e = this._modal.querySelector(".tiptap-video-modal-title-text");
    e && (e.textContent = this._editMode ? "Edit Video" : "Insert Video");
    const i = this._modal.querySelector(".tiptap-video-insert-btn-text");
    i && (i.textContent = this._editMode ? "Update Video" : "Insert Video"), t && this._populate(t), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ─────────────────────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    e || console.warn("[TiptapEditor] Bootstrap Modal not found. Video modal may not work."), this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _template() {
    const t = `tiptap-video-modal-${Date.now()}`;
    return `
<div class="modal fade tiptap-video-modal" id="${t}"
     tabindex="-1" aria-labelledby="${t}-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="${t}-title">
          <i class="bi bi-play-btn me-2 text-primary"></i>
          <span class="tiptap-video-modal-title-text">Insert Video</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body p-3">
        <div class="row g-3">

          <!-- ── Left column: source ── -->
          <div class="col-lg-7">

            <!-- Source tabs -->
            <ul class="nav nav-tabs nav-sm mb-3 border-bottom" role="tablist">
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 active tiptap-video-tab-btn fs-sm"
                        data-tab="url" role="tab">
                  <i class="bi bi-link-45deg me-1"></i>URL
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-video-tab-btn fs-sm"
                        data-tab="upload" role="tab">
                  <i class="bi bi-upload me-1"></i>Upload
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-video-tab-btn fs-sm"
                        data-tab="library" role="tab">
                  <i class="bi bi-collection-play me-1"></i>Library
                </button>
              </li>
            </ul>

            <!-- URL panel -->
            <div class="tiptap-video-panel" data-panel="url">
              <label class="form-label small fw-medium mb-1">Video URL</label>
              <input type="url" class="form-control form-control-sm tiptap-video-url-input"
                     placeholder="https://www.youtube.com/watch?v=...">
              <div class="form-text">Supports YouTube, Vimeo, or direct MP4/WebM links.</div>
              <div class="tiptap-video-provider-badge mt-2 d-none">
                <span class="badge bg-secondary tiptap-video-provider-name"></span>
              </div>
            </div>

            <!-- Upload panel -->
            <div class="tiptap-video-panel d-none" data-panel="upload">
              <div class="tiptap-video-dropzone rounded-2 border-2 border-dashed
                          d-flex flex-column align-items-center justify-content-center
                          py-4 px-3 gap-2 text-center position-relative"
                   style="cursor:pointer;min-height:130px">
                <i class="bi bi-cloud-upload fs-3 text-secondary"></i>
                <p class="mb-0 small text-secondary tiptap-video-dropzone-label">
                  Drag & drop video here, or click to browse
                </p>
                <span class="badge bg-light text-secondary border tiptap-video-file-name d-none"></span>
                <input type="file" accept="video/mp4,video/webm" class="tiptap-video-file-input"
                       style="position:absolute;inset:0;opacity:0;cursor:pointer">
              </div>
              <div class="form-text mt-1">Accepted formats: MP4, WebM</div>
            </div>

            <!-- Library panel -->
            <div class="tiptap-video-panel d-none" data-panel="library">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="input-group input-group-sm flex-grow-1">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control tiptap-video-library-search"
                         placeholder="Search videos...">
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary tiptap-video-library-refresh"
                        title="Refresh"><i class="bi bi-arrow-clockwise"></i></button>
              </div>
              <div class="tiptap-video-library-grid" style="max-height:220px;overflow-y:auto;"></div>
              <div class="tiptap-video-library-status text-center py-2 small text-muted d-none"></div>
              <div class="text-center mt-2">
                <button type="button" class="btn btn-sm btn-outline-secondary tiptap-video-library-more d-none">
                  Load more
                </button>
              </div>
            </div>

            <!-- ─── Common fields ─── -->
            <div class="mt-3 d-flex flex-column gap-2">

              <!-- Title -->
              <div>
                <label class="form-label small fw-medium mb-1">Title</label>
                <input type="text" class="form-control form-control-sm tiptap-video-title-input"
                       placeholder="Video title (accessibility)">
              </div>

              <!-- Caption -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Caption <span class="text-muted fw-normal">(optional)</span>
                </label>
                <input type="text" class="form-control form-control-sm tiptap-video-caption-input"
                       placeholder="Shown below the video">
              </div>

            </div>
          </div><!-- /left col -->

          <!-- ── Right column: options + preview ── -->
          <div class="col-lg-5">

            <!-- Preview -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Preview</label>
              <div class="tiptap-video-preview-wrap rounded-2 bg-body-secondary
                          d-flex align-items-center justify-content-center"
                   style="min-height:120px;overflow:hidden">
                <div class="tiptap-video-preview w-100" style="display:none"></div>
                <span class="tiptap-video-preview-placeholder text-secondary">
                  <i class="bi bi-play-btn fs-2 d-block"></i>
                  <span class="small">No video</span>
                </span>
              </div>
            </div>

            <!-- Aspect ratio -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Aspect Ratio</label>
              <div class="d-flex gap-1 flex-wrap">
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0 active"
                        data-ratio="16x9">16:9</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0"
                        data-ratio="4x3">4:3</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0"
                        data-ratio="1x1">1:1</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0"
                        data-ratio="21x9">21:9</button>
              </div>
            </div>

            <!-- Alignment -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Alignment</label>
              <div class="d-flex gap-2">
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align left" style="cursor:pointer">
                  <input type="radio" name="${t}-align" value="left"
                         class="d-none tiptap-video-align-radio">
                  <i class="bi bi-align-start d-block fs-5"></i>
                  <span style="font-size:10px">Left</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1 tiptap-align-active"
                       title="Align center" style="cursor:pointer">
                  <input type="radio" name="${t}-align" value="center"
                         class="d-none tiptap-video-align-radio" checked>
                  <i class="bi bi-align-center d-block fs-5"></i>
                  <span style="font-size:10px">Center</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align right" style="cursor:pointer">
                  <input type="radio" name="${t}-align" value="right"
                         class="d-none tiptap-video-align-radio">
                  <i class="bi bi-align-end d-block fs-5"></i>
                  <span style="font-size:10px">Right</span>
                </label>
              </div>
            </div>

            <!-- Width -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Width</label>
              <div class="d-flex gap-1 flex-wrap mb-2">
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0 active"
                        data-width="">Auto</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0"
                        data-width="50%">50%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0"
                        data-width="75%">75%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0"
                        data-width="100%">100%</button>
              </div>
              <div class="input-group input-group-sm">
                <input type="text" class="form-control tiptap-video-width-input"
                       placeholder="e.g. 640px or 80%">
                <span class="input-group-text text-muted">px / %</span>
              </div>
            </div>

          </div><!-- /right col -->
        </div><!-- /row -->
      </div><!-- /body -->

      <!-- Footer -->
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary tiptap-video-insert-btn">
          <i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>
        </button>
      </div>

    </div>
  </div>
</div>`;
  }
  _bindEvents() {
    this._modal.querySelectorAll(".tiptap-video-tab-btn").forEach((s) => {
      s.addEventListener("click", () => {
        this._switchTab(s.dataset.tab), s.dataset.tab === "library" && !this._libraryLoaded && this._loadLibrary();
      });
    }), this._bindLibraryEvents();
    const t = this._modal.querySelector(".tiptap-video-url-input");
    t.addEventListener("input", () => this._detectProvider()), t.addEventListener("blur", () => this._detectProvider());
    const e = this._modal.querySelector(".tiptap-video-file-input"), i = this._modal.querySelector(".tiptap-video-dropzone");
    e.addEventListener("change", (s) => {
      var o;
      const r = (o = s.target.files) == null ? void 0 : o[0];
      r && this._handleFileSelect(r);
    }), i.addEventListener("dragover", (s) => {
      s.preventDefault(), i.classList.add("tiptap-dropzone-active");
    }), i.addEventListener("dragleave", () => {
      i.classList.remove("tiptap-dropzone-active");
    }), i.addEventListener("drop", (s) => {
      var o, l;
      s.preventDefault(), i.classList.remove("tiptap-dropzone-active");
      const r = (l = (o = s.dataTransfer) == null ? void 0 : o.files) == null ? void 0 : l[0];
      r && (r.type === "video/mp4" || r.type === "video/webm") && this._handleFileSelect(r);
    }), this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((s) => {
      s.addEventListener("click", () => {
        this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((r) => r.classList.remove("active")), s.classList.add("active");
      });
    }), this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((s) => {
      s.addEventListener("change", () => {
        this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((r) => {
          r.closest(".tiptap-align-btn").classList.toggle("tiptap-align-active", r.checked);
        });
      });
    }), this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((s) => {
      s.addEventListener("click", () => {
        this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((r) => r.classList.remove("active")), s.classList.add("active"), this._modal.querySelector(".tiptap-video-width-input").value = s.dataset.width || "";
      });
    }), this._modal.querySelector(".tiptap-video-width-input").addEventListener("input", () => {
      this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((s) => s.classList.remove("active"));
    }), this._modal.querySelector(".tiptap-video-insert-btn").addEventListener("click", () => this._submit());
  }
  _switchTab(t) {
    this._modal.querySelectorAll(".tiptap-video-tab-btn").forEach((e) => {
      e.classList.toggle("active", e.dataset.tab === t);
    }), this._modal.querySelectorAll(".tiptap-video-panel").forEach((e) => {
      e.classList.toggle("d-none", e.dataset.panel !== t);
    });
  }
  _reset() {
    this._editMode = !1, this._pendingFile = null, this._selectedLibraryItem = null, this._modal.querySelector(".tiptap-video-url-input").value = "", this._modal.querySelector(".tiptap-video-title-input").value = "", this._modal.querySelector(".tiptap-video-caption-input").value = "", this._modal.querySelector(".tiptap-video-width-input").value = "";
    const t = this._modal.querySelector(".tiptap-video-file-input");
    t && (t.value = "");
    const e = this._modal.querySelector(".tiptap-video-file-name");
    e && (e.textContent = "", e.classList.add("d-none"));
    const i = this._modal.querySelector(".tiptap-video-dropzone-label");
    i && (i.textContent = "Drag & drop video here, or click to browse");
    const s = this._modal.querySelector(".tiptap-video-provider-badge");
    s && s.classList.add("d-none"), this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((r) => {
      r.classList.toggle("active", r.dataset.ratio === "16x9");
    }), this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((r) => {
      const o = r.value === "center";
      r.checked = o, r.closest(".tiptap-align-btn").classList.toggle("tiptap-align-active", o);
    }), this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((r) => {
      r.classList.toggle("active", r.dataset.width === "");
    }), this._hidePreview(), this._switchTab("url");
  }
  _populate(t) {
    const e = t.url || "", i = t.title || "", s = t.caption || "", r = t.aspectRatio || "16x9", o = t.alignment || "center", l = t.widthStyle || "";
    this._modal.querySelector(".tiptap-video-url-input").value = e, this._detectProvider(), this._modal.querySelector(".tiptap-video-title-input").value = i, this._modal.querySelector(".tiptap-video-caption-input").value = s, this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.ratio === r);
    }), this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((a) => {
      a.checked = a.value === o, a.closest(".tiptap-align-btn").classList.toggle("tiptap-align-active", a.value === o);
    }), l && (this._modal.querySelector(".tiptap-video-width-input").value = l, this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.width === l);
    })), this._showPreview(e, t.provider);
  }
  _detectProvider() {
    const t = this._modal.querySelector(".tiptap-video-url-input").value.trim(), e = this._modal.querySelector(".tiptap-video-provider-badge"), i = this._modal.querySelector(".tiptap-video-provider-name");
    if (!t) {
      e.classList.add("d-none"), this._hidePreview();
      return;
    }
    const s = Ar(t);
    if (s) {
      const r = { youtube: "YouTube", vimeo: "Vimeo", mp4: "MP4/WebM" };
      i.textContent = r[s.provider] || s.provider, e.classList.remove("d-none"), this._showPreview(t, s.provider, s.videoId);
    } else
      e.classList.add("d-none"), this._hidePreview();
  }
  _handleFileSelect(t) {
    this._pendingFile = t;
    const e = this._modal.querySelector(".tiptap-video-file-name");
    e && (e.textContent = t.name, e.classList.remove("d-none"));
    const i = this._modal.querySelector(".tiptap-video-dropzone-label");
    i && (i.textContent = "File selected");
    const s = URL.createObjectURL(t);
    this._showPreview(s, "mp4");
  }
  _showPreview(t, e, i = null) {
    const s = this._modal.querySelector(".tiptap-video-preview"), r = this._modal.querySelector(".tiptap-video-preview-placeholder");
    if (s.innerHTML = "", e === "mp4") {
      const o = document.createElement("video");
      o.controls = !0, o.className = "w-100", o.style.maxHeight = "160px";
      const l = document.createElement("source");
      l.src = t, l.type = "video/mp4", o.appendChild(l), s.appendChild(o);
    } else {
      const o = vn[e];
      if (o && i) {
        const l = document.createElement("iframe");
        l.src = o.embedUrl(i), l.className = "w-100", l.style.height = "160px", l.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", l.allowFullscreen = !0, l.loading = "lazy", l.frameBorder = "0", s.appendChild(l);
      }
    }
    s.childElementCount > 0 && (s.style.display = "", r && (r.style.display = "none"));
  }
  _hidePreview() {
    const t = this._modal.querySelector(".tiptap-video-preview"), e = this._modal.querySelector(".tiptap-video-preview-placeholder");
    t && (t.innerHTML = "", t.style.display = "none"), e && (e.style.display = "");
  }
  async _submit() {
    var p, h, f;
    let t = null, e = null, i = null;
    const s = ((p = this._modal.querySelector(".tiptap-video-tab-btn.active")) == null ? void 0 : p.dataset.tab) || "url";
    if (s === "library" && this._selectedLibraryItem)
      t = this._selectedLibraryItem.url, e = "mp4", i = t;
    else if (s === "upload" && this._pendingFile)
      try {
        const g = this.toolbar._getUploadUrl();
        if (!g) {
          alert("No upload URL configured. Please set data-upload-url on the editor wrapper or add a tiptap-upload-url meta tag.");
          return;
        }
        const m = this._modal.querySelector(".tiptap-video-insert-btn");
        m.disabled = !0, m.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Uploading…', t = (await this.toolbar._uploadFile(this._pendingFile, g)).url, e = "mp4", i = t, m.disabled = !1, m.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>';
      } catch (g) {
        console.error("[TiptapEditor] Video upload failed:", g), alert("Video upload failed. Please try again.");
        const m = this._modal.querySelector(".tiptap-video-insert-btn");
        m.disabled = !1, m.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>';
        return;
      }
    else {
      if (t = this._modal.querySelector(".tiptap-video-url-input").value.trim(), !t) {
        const m = this._modal.querySelector(".tiptap-video-url-input");
        m.classList.add("is-invalid"), m.focus(), setTimeout(() => m.classList.remove("is-invalid"), 2e3);
        return;
      }
      const g = Ar(t);
      if (!g) {
        const m = this._modal.querySelector(".tiptap-video-url-input");
        m.classList.add("is-invalid"), m.focus(), alert("Unsupported video URL. Supported: YouTube, Vimeo, MP4/WebM."), setTimeout(() => m.classList.remove("is-invalid"), 2e3);
        return;
      }
      e = g.provider, i = g.videoId;
    }
    const r = this._modal.querySelector(".tiptap-video-title-input").value.trim(), o = this._modal.querySelector(".tiptap-video-caption-input").value.trim(), l = ((h = this._modal.querySelector(".tiptap-video-ratio-btn.active")) == null ? void 0 : h.dataset.ratio) || "16x9", a = ((f = this._modal.querySelector(".tiptap-video-align-radio:checked")) == null ? void 0 : f.value) || "center";
    let c = this._modal.querySelector(".tiptap-video-width-input").value.trim();
    const d = this._modal.querySelector(".tiptap-video-width-btn.active");
    d && d.dataset.width && (c = d.dataset.width), c && !/^\d+(\.\d+)?(px|%)$/.test(c) && (c = "");
    const u = {
      url: t,
      provider: e,
      videoId: i,
      title: r || "",
      caption: o || "",
      aspectRatio: l,
      alignment: a,
      widthStyle: c || null
    };
    this._editMode ? this.editor.chain().focus().updateCustomVideo(u).run() : this.editor.chain().focus().insertCustomVideo(u).run(), this._bs.hide();
  }
  /* ──────────────── Media Library ──────────────── */
  _bindLibraryEvents() {
    var i, s, r;
    const t = (o) => this._modal.querySelector(o);
    let e = null;
    (i = t(".tiptap-video-library-search")) == null || i.addEventListener("input", (o) => {
      clearTimeout(e), e = setTimeout(() => {
        this._libraryPage = 1, this._loadLibrary(o.target.value.trim());
      }, 300);
    }), (s = t(".tiptap-video-library-refresh")) == null || s.addEventListener("click", () => {
      var l, a;
      this._libraryPage = 1, this._libraryLoaded = !1;
      const o = ((a = (l = t(".tiptap-video-library-search")) == null ? void 0 : l.value) == null ? void 0 : a.trim()) || "";
      this._loadLibrary(o);
    }), (r = t(".tiptap-video-library-more")) == null || r.addEventListener("click", () => {
      var l, a;
      this._libraryPage++;
      const o = ((a = (l = t(".tiptap-video-library-search")) == null ? void 0 : l.value) == null ? void 0 : a.trim()) || "";
      this._loadLibrary(o, !0);
    });
  }
  async _loadLibrary(t = "", e = !1) {
    var l;
    const i = this.toolbar._getBrowseUrl();
    if (!i) {
      this._showLibraryStatus("Media library not available");
      return;
    }
    const s = this._modal.querySelector(".tiptap-video-library-grid"), r = this._modal.querySelector(".tiptap-video-library-more"), o = this._modal.querySelector(".tiptap-video-library-status");
    e || (s.innerHTML = '<div class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>');
    try {
      const a = new URLSearchParams({ type: "video", page: this._libraryPage });
      t && a.set("search", t);
      const c = ((l = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : l.content) || "", d = await fetch(`${i}?${a}`, {
        headers: { Accept: "application/json", "X-CSRF-TOKEN": c }
      });
      if (!d.ok) throw new Error(`HTTP ${d.status}`);
      const u = await d.json(), p = u.data || [], h = u.pagination || {};
      if (e || (s.innerHTML = ""), p.length === 0 && !e) {
        this._showLibraryStatus("No videos found"), r == null || r.classList.add("d-none");
        return;
      }
      o == null || o.classList.add("d-none"), p.forEach((f) => {
        const g = document.createElement("div");
        g.className = "tiptap-video-library-item", g.dataset.url = f.url, g.title = f.filename || "";
        const m = document.createElement("div");
        m.className = "tiptap-video-library-icon", m.innerHTML = '<i class="bi bi-play-btn-fill fs-4"></i>', g.appendChild(m);
        const b = document.createElement("span");
        b.className = "tiptap-video-library-name", b.textContent = f.filename || "", g.appendChild(b), g.addEventListener("click", () => {
          s.querySelectorAll(".tiptap-video-library-item").forEach((y) => y.classList.remove("selected")), g.classList.add("selected"), this._selectedLibraryItem = f, this._showPreview(f.url, "mp4");
        }), s.appendChild(g);
      }), this._libraryHasMore = h.current_page < h.last_page, r == null || r.classList.toggle("d-none", !this._libraryHasMore), this._libraryLoaded = !0;
    } catch (a) {
      console.error("[TiptapEditor] Video library load error:", a), e || (s.innerHTML = ""), this._showLibraryStatus("Failed to load media library");
    }
  }
  _showLibraryStatus(t) {
    const e = this._modal.querySelector(".tiptap-video-library-status");
    e && (e.textContent = t, e.classList.remove("d-none"));
  }
}
class Ty {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._gridRows = 3, this._gridCols = 3, this._isEditMode = !1, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the table modal.
   * @param {Object|null} existingStyles - If provided, opens in edit mode with { bordered, striped, hover, small }
   */
  open(t = null) {
    this._isEditMode = !!t, this._isEditMode ? this._loadEditValues(t) : this._reset(), this._updateModalUI(), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents(), this._renderGrid();
  }
  _reset() {
    this._gridRows = 3, this._gridCols = 3, this._el("rows").value = "3", this._el("cols").value = "3", this._el("headerRow").checked = !0, this._el("bordered").checked = !1, this._el("striped").checked = !1, this._el("hover").checked = !1, this._el("small").checked = !1, this._el("alignMiddle").checked = !1, this._renderGrid(), this._updateGridLabel();
  }
  _el(t) {
    return this._modal.querySelector(`[data-tbl="${t}"]`);
  }
  _bindEvents() {
    this._modal.querySelector('[data-tbl="insertBtn"]').addEventListener("click", () => {
      this._insert();
    });
    const t = this._el("grid");
    t.addEventListener("mouseover", (e) => {
      const i = e.target.closest("[data-r]");
      if (!i) return;
      const s = parseInt(i.dataset.r), r = parseInt(i.dataset.c);
      this._highlightGrid(s, r), this._updateGridLabel(s, r);
    }), t.addEventListener("mouseleave", () => {
      this._highlightGrid(0, 0), this._updateGridLabel();
    }), t.addEventListener("click", (e) => {
      const i = e.target.closest("[data-r]");
      i && (this._gridRows = parseInt(i.dataset.r), this._gridCols = parseInt(i.dataset.c), this._el("rows").value = this._gridRows, this._el("cols").value = this._gridCols, this._updateGridLabel());
    }), this._el("rows").addEventListener("input", (e) => {
      this._gridRows = Math.min(20, Math.max(1, parseInt(e.target.value) || 1));
    }), this._el("cols").addEventListener("input", (e) => {
      this._gridCols = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
    });
  }
  _insert() {
    if (this._isEditMode) {
      const t = {
        bordered: this._el("bordered").checked,
        striped: this._el("striped").checked,
        hover: this._el("hover").checked,
        small: this._el("small").checked,
        alignMiddle: this._el("alignMiddle").checked
      };
      this.editor.chain().focus().updateTableStyles(t).run();
    } else {
      const t = Math.min(20, Math.max(1, parseInt(this._el("rows").value) || 3)), e = Math.min(10, Math.max(1, parseInt(this._el("cols").value) || 3)), i = this._el("headerRow").checked, s = {
        bordered: this._el("bordered").checked,
        striped: this._el("striped").checked,
        hover: this._el("hover").checked,
        small: this._el("small").checked,
        alignMiddle: this._el("alignMiddle").checked
      };
      this.editor.chain().focus().insertTable({ rows: t, cols: e, withHeaderRow: i }).run(), this.editor.chain().focus().updateTableStyles(s).run();
    }
    this._bs.hide();
  }
  _loadEditValues(t) {
    this._el("bordered").checked = !!t.bordered, this._el("striped").checked = !!t.striped, this._el("hover").checked = !!t.hover, this._el("small").checked = !!t.small, this._el("alignMiddle").checked = !!t.alignMiddle;
  }
  _updateModalUI() {
    const t = this._modal.querySelector(".modal-title"), e = this._modal.querySelector('[data-tbl="insertBtn"]'), i = this._el("grid").closest(".text-center"), s = this._el("rows").closest(".col-6"), r = this._el("cols").closest(".col-6"), o = this._el("headerRow").closest(".form-check");
    this._isEditMode ? (t.innerHTML = '<i class="bi bi-table me-2 text-primary"></i>Edit Table Styles', e.innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Styles', i && (i.style.display = "none"), s && (s.style.display = "none"), r && (r.style.display = "none"), o && (o.style.display = "none")) : (t.innerHTML = '<i class="bi bi-table me-2 text-primary"></i>Insert Table', e.innerHTML = '<i class="bi bi-table me-1"></i>Insert Table', i && (i.style.display = ""), s && (s.style.display = ""), r && (r.style.display = ""), o && (o.style.display = ""));
  }
  _renderGrid() {
    const t = this._el("grid");
    t.innerHTML = "";
    const e = 8, i = 8;
    for (let s = 1; s <= e; s++) {
      const r = document.createElement("div");
      r.className = "tiptap-table-grid-row";
      for (let o = 1; o <= i; o++) {
        const l = document.createElement("div");
        l.className = "tiptap-table-grid-cell", l.dataset.r = s, l.dataset.c = o, r.appendChild(l);
      }
      t.appendChild(r);
    }
  }
  _highlightGrid(t, e) {
    this._el("grid").querySelectorAll(".tiptap-table-grid-cell").forEach((i) => {
      const s = parseInt(i.dataset.r), r = parseInt(i.dataset.c);
      i.classList.toggle("highlighted", s <= t && r <= e);
    });
  }
  _updateGridLabel(t, e) {
    const i = this._el("gridLabel");
    t && e ? i.textContent = `${t} × ${e}` : i.textContent = `${this._gridRows} × ${this._gridCols}`;
  }
  _template() {
    return `
<div class="modal fade tiptap-table-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-table me-2 text-primary"></i>Insert Table
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Grid Selector -->
        <div class="text-center mb-3">
          <div class="tiptap-table-grid" data-tbl="grid"></div>
          <small class="text-muted mt-1 d-block" data-tbl="gridLabel">3 × 3</small>
        </div>

        <div class="row g-3">
          <!-- Rows -->
          <div class="col-6">
            <label class="form-label small fw-medium">Rows</label>
            <input type="number" class="form-control form-control-sm" data-tbl="rows"
                   value="3" min="1" max="20">
          </div>
          <!-- Columns -->
          <div class="col-6">
            <label class="form-label small fw-medium">Columns</label>
            <input type="number" class="form-control form-control-sm" data-tbl="cols"
                   value="3" min="1" max="10">
          </div>
        </div>

        <!-- Options -->
        <div class="mt-3">
          <label class="form-label small fw-medium">Options</label>
          <div class="d-flex flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="headerRow" id="tbl-header" checked>
              <label class="form-check-label small" for="tbl-header">Header row</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="bordered" id="tbl-bordered">
              <label class="form-check-label small" for="tbl-bordered">Bordered</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="striped" id="tbl-striped">
              <label class="form-check-label small" for="tbl-striped">Striped</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="hover" id="tbl-hover">
              <label class="form-check-label small" for="tbl-hover">Hover</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="small" id="tbl-small">
              <label class="form-check-label small" for="tbl-small">Small</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="alignMiddle" id="tbl-alignMiddle">
              <label class="form-check-label small" for="tbl-alignMiddle">Align Middle</label>
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-tbl="insertBtn">
          <i class="bi bi-table me-1"></i>Insert Table
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
const Yi = class Yi {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._editMode = !1, this._editPos = null, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   * @param {number|null} pos            – node position for edit mode.
   */
  open(t = null, e = null) {
    this._reset(), this._editMode = !!t, this._editPos = e, t ? (this._populate(t), this._el("titleText").textContent = "Edit Button", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update', this._el("deleteBtn").classList.remove("d-none")) : (this._el("titleText").textContent = "Insert Button", this._el("insertBtn").innerHTML = '<i class="bi bi-hand-index me-1"></i>Insert Button', this._el("deleteBtn").classList.add("d-none")), this._updatePreview(), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _reset() {
    this._editMode = !1, this._editPos = null, this._el("text").value = "Click me", this._el("url").value = "#", this._setVariant("primary"), this._el("sizeDefault").checked = !0, this._el("outline").checked = !1, this._el("targetSelf").checked = !0, this._el("deleteBtn").classList.add("d-none"), this._updatePreview();
  }
  _populate(t) {
    this._el("text").value = t.text || "Button", this._el("url").value = t.url || "#", this._setVariant(t.variant || "primary"), t.size === "sm" ? this._el("sizeSm").checked = !0 : t.size === "lg" ? this._el("sizeLg").checked = !0 : this._el("sizeDefault").checked = !0, this._el("outline").checked = !!t.outline, t.target === "_blank" ? this._el("targetBlank").checked = !0 : this._el("targetSelf").checked = !0, this._updatePreview();
  }
  _setVariant(t) {
    this._modal.querySelectorAll("[data-btn-variant]").forEach((e) => {
      e.classList.toggle("active", e.dataset.btnVariant === t);
    });
  }
  _getVariant() {
    const t = this._modal.querySelector("[data-btn-variant].active");
    return (t == null ? void 0 : t.dataset.btnVariant) || "primary";
  }
  _el(t) {
    return this._modal.querySelector(`[data-btnm="${t}"]`);
  }
  _bindEvents() {
    this._modal.querySelectorAll("[data-btn-variant]").forEach((t) => {
      t.addEventListener("click", () => {
        this._setVariant(t.dataset.btnVariant), this._updatePreview();
      });
    }), ["text", "url"].forEach((t) => {
      this._el(t).addEventListener("input", () => this._updatePreview());
    }), this._el("outline").addEventListener("change", () => this._updatePreview()), this._modal.querySelectorAll('[name="btnSize"]').forEach((t) => {
      t.addEventListener("change", () => this._updatePreview());
    }), this._el("insertBtn").addEventListener("click", () => this._submit()), this._el("deleteBtn").addEventListener("click", () => {
      this._editMode && this._editPos !== null && this.editor.chain().focus().deleteBootstrapButton().run(), this._bs.hide();
    });
  }
  _submit() {
    var e, i;
    const t = {
      text: this._el("text").value || "Button",
      url: this._el("url").value || "#",
      variant: this._getVariant(),
      size: ((e = this._modal.querySelector('[name="btnSize"]:checked')) == null ? void 0 : e.value) || null,
      outline: this._el("outline").checked,
      target: ((i = this._modal.querySelector('[name="btnTarget"]:checked')) == null ? void 0 : i.value) || "_self"
    };
    t.size === "" && (t.size = null), this._editMode && this._editPos !== null ? this.editor.chain().focus().command(({ tr: s }) => (s.setNodeMarkup(this._editPos, void 0, t), !0)).run() : this.editor.chain().focus().insertBootstrapButton(t).run(), this._bs.hide();
  }
  _updatePreview() {
    var a;
    const t = this._el("preview"), e = this._el("text").value || "Button", i = this._getVariant(), s = this._el("outline").checked, r = ((a = this._modal.querySelector('[name="btnSize"]:checked')) == null ? void 0 : a.value) || "";
    let l = `btn ${s ? `btn-outline-${i}` : `btn-${i}`}`;
    r && (l += ` btn-${r}`), t.innerHTML = `<span class="${l}">${this._escHtml(e)}</span>`;
  }
  _escHtml(t) {
    const e = document.createElement("div");
    return e.textContent = t, e.innerHTML;
  }
  _template() {
    return `
<div class="modal fade tiptap-button-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-hand-index me-2 text-primary"></i>
          <span data-btnm="titleText">Insert Button</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Preview -->
        <div class="text-center mb-3 p-3 bg-light rounded" data-btnm="preview">
          <span class="btn btn-primary">Click me</span>
        </div>

        <div class="row g-3">
          <!-- Text -->
          <div class="col-6">
            <label class="form-label small fw-medium">Button Text</label>
            <input type="text" class="form-control form-control-sm" data-btnm="text"
                   value="Click me" placeholder="Button text">
          </div>
          <!-- URL -->
          <div class="col-6">
            <label class="form-label small fw-medium">URL</label>
            <input type="text" class="form-control form-control-sm" data-btnm="url"
                   value="#" placeholder="https://...">
          </div>
        </div>

        <!-- Variant -->
        <div class="mt-3">
          <label class="form-label small fw-medium">Style</label>
          <div class="d-flex flex-wrap gap-1">
            ${Fe.map((e) => {
      const i = Yi.VARIANT_COLORS[e] || "#6c757d", s = e === "light" ? "1px solid #dee2e6" : "none", r = ["light", "warning"].includes(e) ? "#000" : "#fff";
      return `<button type="button" class="tiptap-btn-variant-swatch" data-btn-variant="${e}"
                style="background:${i}; border:${s}; color:${r}" title="${e}">
                ${e.charAt(0).toUpperCase()}
              </button>`;
    }).join("")}
          </div>
        </div>

        <div class="row g-3 mt-1">
          <!-- Size -->
          <div class="col-6">
            <label class="form-label small fw-medium">Size</label>
            <div class="d-flex gap-2">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnSize" value="sm" id="btnSizeSm" data-btnm="sizeSm">
                <label class="form-check-label small" for="btnSizeSm">Small</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnSize" value="" id="btnSizeDefault" data-btnm="sizeDefault" checked>
                <label class="form-check-label small" for="btnSizeDefault">Default</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnSize" value="lg" id="btnSizeLg" data-btnm="sizeLg">
                <label class="form-check-label small" for="btnSizeLg">Large</label>
              </div>
            </div>
          </div>

          <!-- Target -->
          <div class="col-6">
            <label class="form-label small fw-medium">Open in</label>
            <div class="d-flex gap-2">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnTarget" value="_self" id="btnTargetSelf" data-btnm="targetSelf" checked>
                <label class="form-check-label small" for="btnTargetSelf">Same tab</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnTarget" value="_blank" id="btnTargetBlank" data-btnm="targetBlank">
                <label class="form-check-label small" for="btnTargetBlank">New tab</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Outline -->
        <div class="mt-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" data-btnm="outline" id="btnOutline">
            <label class="form-check-label small" for="btnOutline">Outline style</label>
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 d-none" data-btnm="deleteBtn">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-btnm="insertBtn">
          <i class="bi bi-hand-index me-1"></i>Insert Button
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
};
/* ─── Color map for variant swatches ── */
bs(Yi, "VARIANT_COLORS", {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529",
  link: "#6610f2"
});
let Lr = Yi;
const Xi = class Xi {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._editMode = !1, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   */
  open(t = null) {
    this._reset(), this._editMode = !!t, t ? (this._populate(t), this._el("titleText").textContent = "Edit Card", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update', this._el("deleteBtn").classList.remove("d-none")) : (this._el("titleText").textContent = "Insert Card", this._el("insertBtn").innerHTML = '<i class="bi bi-card-heading me-1"></i>Insert Card', this._el("deleteBtn").classList.add("d-none")), this._updatePreview(), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _reset() {
    this._editMode = !1, this._el("headerText").value = "", this._el("footerText").value = "", this._setBorderColor(""), this._el("deleteBtn").classList.add("d-none"), this._updatePreview();
  }
  _populate(t) {
    this._el("headerText").value = t.headerText || "", this._el("footerText").value = t.footerText || "", this._setBorderColor(t.borderColor || ""), this._updatePreview();
  }
  _el(t) {
    return this._modal.querySelector(`[data-cardm="${t}"]`);
  }
  _setBorderColor(t) {
    this._modal.querySelectorAll("[data-card-border]").forEach((e) => {
      e.classList.toggle("active", e.dataset.cardBorder === t);
    });
  }
  _getBorderColor() {
    const t = this._modal.querySelector("[data-card-border].active");
    return (t == null ? void 0 : t.dataset.cardBorder) || null;
  }
  _bindEvents() {
    this._modal.querySelectorAll("[data-card-border]").forEach((t) => {
      t.addEventListener("click", () => {
        this._getBorderColor() === t.dataset.cardBorder ? this._setBorderColor("") : this._setBorderColor(t.dataset.cardBorder), this._updatePreview();
      });
    }), ["headerText", "footerText"].forEach((t) => {
      this._el(t).addEventListener("input", () => this._updatePreview());
    }), this._el("insertBtn").addEventListener("click", () => this._submit()), this._el("deleteBtn").addEventListener("click", () => {
      this._editMode && this.editor.chain().focus().deleteNode("bootstrapCard").run(), this._bs.hide();
    });
  }
  _submit() {
    const t = {
      headerText: this._el("headerText").value || null,
      footerText: this._el("footerText").value || null,
      borderColor: this._getBorderColor()
    };
    this._editMode ? this.editor.chain().focus().updateAttributes("bootstrapCard", t).run() : this.editor.chain().focus().insertBootstrapCard(t).run(), this._bs.hide();
  }
  _updatePreview() {
    const t = this._el("preview"), e = this._el("headerText").value, i = this._el("footerText").value, s = this._getBorderColor();
    let r = "card";
    s && (r += ` border-${s}`);
    let o = `<div class="${r}" style="max-width: 100%;">`;
    e && (o += `<div class="card-header">${this._escHtml(e)}</div>`), o += '<div class="card-body"><p class="card-text text-muted small">Card content goes here...</p></div>', i && (o += `<div class="card-footer text-muted">${this._escHtml(i)}</div>`), o += "</div>", t.innerHTML = o;
  }
  _escHtml(t) {
    const e = document.createElement("div");
    return e.textContent = t, e.innerHTML;
  }
  _template() {
    return `
<div class="modal fade tiptap-card-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-card-heading me-2 text-primary"></i>
          <span data-cardm="titleText">Insert Card</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Preview -->
        <div class="mb-3 p-3 bg-light rounded" data-cardm="preview"></div>

        <!-- Header text -->
        <div class="mb-3">
          <label class="form-label small fw-medium">Header Text <span class="text-muted fw-normal">(optional)</span></label>
          <input type="text" class="form-control form-control-sm" data-cardm="headerText"
                 placeholder="e.g. Card Title">
        </div>

        <!-- Footer text -->
        <div class="mb-3">
          <label class="form-label small fw-medium">Footer Text <span class="text-muted fw-normal">(optional)</span></label>
          <input type="text" class="form-control form-control-sm" data-cardm="footerText"
                 placeholder="e.g. Last updated 3 mins ago">
        </div>

        <!-- Border color -->
        <div>
          <label class="form-label small fw-medium">Border Color <span class="text-muted fw-normal">(optional)</span></label>
          <div class="d-flex flex-wrap gap-1">
            ${ai.map((e) => {
      const i = Xi.BORDER_COLOR_MAP[e] || "#6c757d", s = e === "light" ? "1px solid #dee2e6" : "none", r = ["light", "warning"].includes(e) ? "#000" : "#fff";
      return `<button type="button" class="tiptap-btn-variant-swatch" data-card-border="${e}"
                style="background:${i}; border:${s}; color:${r}" title="${e}">
                ${e.charAt(0).toUpperCase()}
              </button>`;
    }).join("")}
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 d-none" data-cardm="deleteBtn">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-cardm="insertBtn">
          <i class="bi bi-card-heading me-1"></i>Insert Card
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
};
bs(Xi, "BORDER_COLOR_MAP", {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529"
});
let Nr = Xi;
class Ay {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._images = [], this._editMode = !1, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode with gallery attrs + images
   */
  open(t = null) {
    this._reset(), this._editMode = !!t, t ? (this._populate(t), this._el("titleText").textContent = "Edit Gallery", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Gallery') : (this._el("titleText").textContent = "Insert Gallery", this._el("insertBtn").innerHTML = '<i class="bi bi-images me-1"></i>Insert Gallery'), this._updatePreviewGrid(), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _reset() {
    this._images = [], this._editMode = !1;
    const t = this._el("fileInput");
    t && (t.value = ""), this._setColumns(3), this._el("gapRange").value = "2", this._el("gapValue").textContent = "2", this._el("lightbox").checked = !1, this._el("dropzoneLabel").textContent = "Drag & drop images here, or click to browse", this._updatePreviewGrid(), this._updateInsertState();
  }
  _populate(t) {
    this._setColumns(t.columns || 3), this._el("gapRange").value = String(t.gap ?? 2), this._el("gapValue").textContent = String(t.gap ?? 2), this._el("lightbox").checked = !!t.lightbox, t.images && Array.isArray(t.images) && (this._images = t.images.map((e) => ({ src: e.src, alt: e.alt || "" }))), this._updatePreviewGrid(), this._updateInsertState();
  }
  _el(t) {
    return this._modal.querySelector(`[data-galm="${t}"]`);
  }
  _setColumns(t) {
    this._modal.querySelectorAll("[data-gal-col]").forEach((e) => {
      e.classList.toggle("active", parseInt(e.dataset.galCol, 10) === t);
    });
  }
  _getColumns() {
    const t = this._modal.querySelector("[data-gal-col].active");
    return t ? parseInt(t.dataset.galCol, 10) : 3;
  }
  _bindEvents() {
    const t = this._el("dropzone"), e = this._el("fileInput");
    t.addEventListener("dragover", (i) => {
      i.preventDefault(), i.stopPropagation(), t.classList.add("border-primary", "bg-primary", "bg-opacity-10");
    }), t.addEventListener("dragleave", (i) => {
      i.preventDefault(), i.stopPropagation(), t.classList.remove("border-primary", "bg-primary", "bg-opacity-10");
    }), t.addEventListener("drop", (i) => {
      i.preventDefault(), i.stopPropagation(), t.classList.remove("border-primary", "bg-primary", "bg-opacity-10");
      const s = Array.from(i.dataTransfer.files).filter((r) => r.type.startsWith("image/"));
      s.length && this._addFiles(s);
    }), e.addEventListener("change", (i) => {
      const s = Array.from(i.target.files || []);
      s.length && this._addFiles(s), e.value = "";
    }), this._modal.querySelectorAll("[data-gal-col]").forEach((i) => {
      i.addEventListener("click", () => {
        this._setColumns(parseInt(i.dataset.galCol, 10)), this._updatePreviewGrid();
      });
    }), this._el("gapRange").addEventListener("input", (i) => {
      this._el("gapValue").textContent = i.target.value;
    }), this._el("insertBtn").addEventListener("click", () => this._submit()), this._el("clearBtn").addEventListener("click", () => {
      this._images = [], this._updatePreviewGrid(), this._updateInsertState();
    });
  }
  async _addFiles(t) {
    const e = this._el("insertBtn"), i = this._el("dropzoneLabel");
    e.disabled = !0;
    for (const s of t) {
      i.textContent = `Uploading ${s.name}…`;
      try {
        const r = this.toolbar._getUploadUrl();
        let o, l;
        if (r) {
          const a = await this.toolbar._uploadFile(s, r);
          o = a.url, l = a.alt || s.name;
        } else
          o = await this._toBase64(s), l = s.name;
        this._images.push({ src: o, alt: l });
      } catch (r) {
        console.error("[TiptapEditor] Gallery image upload failed:", r);
      }
    }
    i.textContent = "Drag & drop images here, or click to browse", e.disabled = !1, this._updatePreviewGrid(), this._updateInsertState();
  }
  _removeImage(t) {
    this._images.splice(t, 1), this._updatePreviewGrid(), this._updateInsertState();
  }
  _updatePreviewGrid() {
    const t = this._el("previewGrid"), e = this._el("placeholder"), i = this._el("countBadge");
    if (this._images.length === 0) {
      t.innerHTML = "", t.classList.add("d-none"), e.classList.remove("d-none"), i.textContent = "", i.classList.add("d-none");
      return;
    }
    e.classList.add("d-none"), t.classList.remove("d-none"), i.textContent = `${this._images.length} image${this._images.length > 1 ? "s" : ""}`, i.classList.remove("d-none");
    const s = this._getColumns(), r = `col-${Math.floor(12 / s)}`;
    t.innerHTML = this._images.map((o, l) => `
      <div class="${r} mb-2">
        <div class="position-relative tiptap-gallery-thumb">
          <img src="${this._escAttr(o.src)}" alt="${this._escAttr(o.alt)}"
               class="img-fluid rounded" style="width:100%;aspect-ratio:1;object-fit:cover;">
          <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0"
                  style="width:20px;height:20px;line-height:1;font-size:11px"
                  data-gal-remove="${l}" title="Remove">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    `).join(""), t.querySelectorAll("[data-gal-remove]").forEach((o) => {
      o.addEventListener("click", (l) => {
        l.preventDefault(), this._removeImage(parseInt(o.dataset.galRemove, 10));
      });
    });
  }
  _updateInsertState() {
    const t = this._el("insertBtn");
    t.disabled = this._images.length === 0;
  }
  _submit() {
    if (this._images.length === 0) return;
    const t = this._images.map((r) => ({ src: r.src, alt: r.alt })), e = this._getColumns(), i = parseInt(this._el("gapRange").value, 10), s = this._el("lightbox").checked;
    this._editMode ? (this.editor.chain().focus().deleteNode("gallery").run(), this.editor.chain().focus().insertGallery({ images: t, columns: e, gap: i, lightbox: s }).run()) : this.editor.chain().focus().insertGallery({ images: t, columns: e, gap: i, lightbox: s }).run(), this._bs.hide();
  }
  _toBase64(t) {
    return new Promise((e, i) => {
      const s = new FileReader();
      s.onload = (r) => e(r.target.result), s.onerror = i, s.readAsDataURL(t);
    });
  }
  _escAttr(t) {
    const e = document.createElement("div");
    return e.textContent = t || "", e.innerHTML;
  }
  _template() {
    return `
<div class="modal fade tiptap-gallery-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-images me-2 text-primary"></i>
          <span data-galm="titleText">Insert Gallery</span>
          <span class="badge bg-secondary ms-2 d-none" data-galm="countBadge"></span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-3">
        <div class="row g-3">

          <!-- Left: upload + preview -->
          <div class="col-lg-7">
            <!-- Dropzone -->
            <div class="rounded-2 border-2 border-dashed d-flex flex-column align-items-center
                        justify-content-center py-4 px-3 gap-2 text-center position-relative"
                 data-galm="dropzone" style="cursor:pointer;min-height:120px">
              <i class="bi bi-cloud-upload fs-3 text-secondary"></i>
              <p class="mb-0 small text-secondary" data-galm="dropzoneLabel">
                Drag & drop images here, or click to browse
              </p>
              <span class="badge bg-light text-muted border">Supports multiple files</span>
              <input type="file" accept="image/*" multiple data-galm="fileInput"
                     style="position:absolute;inset:0;opacity:0;cursor:pointer">
            </div>

            <!-- Image preview grid -->
            <div class="text-center py-4 text-secondary" data-galm="placeholder">
              <i class="bi bi-images fs-2 d-block mb-1"></i>
              <span class="small">No images added yet</span>
            </div>
            <div class="row g-2 mt-2 d-none" data-galm="previewGrid"></div>
          </div>

          <!-- Right: options -->
          <div class="col-lg-5">
            <!-- Columns -->
            <div class="mb-3">
              <label class="form-label small fw-medium">Columns</label>
              <div class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-outline-secondary" data-gal-col="2">2</button>
                <button type="button" class="btn btn-sm btn-outline-secondary active" data-gal-col="3">3</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-gal-col="4">4</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-gal-col="6">6</button>
              </div>
            </div>

            <!-- Gap -->
            <div class="mb-3">
              <label class="form-label small fw-medium">
                Gap <span class="badge bg-light text-dark border" data-galm="gapValue">2</span>
              </label>
              <input type="range" class="form-range" min="0" max="5" value="2" data-galm="gapRange">
              <div class="d-flex justify-content-between">
                <small class="text-muted">None</small>
                <small class="text-muted">Max</small>
              </div>
            </div>

            <!-- Lightbox -->
            <div class="mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" data-galm="lightbox" id="tiptap-gal-lightbox">
                <label class="form-check-label small fw-medium" for="tiptap-gal-lightbox">
                  Enable Lightbox
                </label>
              </div>
              <div class="form-text">Allow images to open in a fullscreen overlay.</div>
            </div>

            <!-- Clear all -->
            <div>
              <button type="button" class="btn btn-sm btn-outline-secondary w-100" data-galm="clearBtn">
                <i class="bi bi-trash me-1"></i>Clear All Images
              </button>
            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-galm="insertBtn" disabled>
          <i class="bi bi-images me-1"></i>Insert Gallery
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
const Zl = 12, Ly = [
  { key: "lg", label: "Desktop (lg)", prefix: "col-lg" },
  { key: "md", label: "Tablet (md)", prefix: "col-md" },
  { key: "sm", label: "Mobile L (sm)", prefix: "col-sm" },
  { key: "xs", label: "Mobile (xs)", prefix: "col" }
], Ny = [
  { value: "auto", label: "Auto" },
  ...Array.from({ length: 12 }, (n, t) => ({ value: String(t + 1), label: String(t + 1) }))
];
class Oy {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(t) {
    this.toolbar = t, this.editor = t.editor, this._modal = null, this._bs = null, this._editMode = !1, this._columns = [], this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode.
   */
  open(t = null) {
    this._editMode = !!t, t ? (this._el("titleText").textContent = "Edit Layout", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update', this._el("deleteBtn").classList.remove("d-none"), this._populate(t)) : (this._el("titleText").textContent = "Insert Layout", this._el("insertBtn").innerHTML = '<i class="bi bi-layout-split me-1"></i>Insert Layout', this._el("deleteBtn").classList.add("d-none"), this._resetDefaults()), this._updatePreview(), this._bs.show();
  }
  destroy() {
    var t;
    this._bs && this._bs.dispose(), (t = this._modal) == null || t.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const t = document.createElement("div");
    t.innerHTML = this._template(), this._modal = t.firstElementChild, document.body.appendChild(this._modal);
    const e = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = e ? new e(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _el(t) {
    return this._modal.querySelector(`[data-layoutm="${t}"]`);
  }
  _resetDefaults() {
    this._columns = [
      { lg: "auto", md: "6", sm: "auto", xs: "auto" },
      { lg: "auto", md: "6", sm: "auto", xs: "auto" }
    ], this._el("gutter").value = "3", this._setJustify("start"), this._setAlign("stretch"), this._renderColumnsConfig();
  }
  _populate(t) {
    this._columns = [], t.columns && t.columns.length > 0 ? t.columns.forEach((e) => {
      this._columns.push(this._parseColClass(e.colClass || "col"));
    }) : this._columns = [
      { lg: "auto", md: "6", sm: "auto", xs: "auto" },
      { lg: "auto", md: "6", sm: "auto", xs: "auto" }
    ], this._el("gutter").value = String(t.gutter ?? 3), this._setJustify(t.justifyContent || "start"), this._setAlign(t.alignItems || "stretch"), this._renderColumnsConfig();
  }
  /**
   * Parse a colClass string like "col-md-6 col-lg-4" into breakpoint map.
   */
  _parseColClass(t) {
    const e = { lg: "auto", md: "auto", sm: "auto", xs: "auto" };
    return t.split(/\s+/).forEach((s) => {
      const r = s.match(/^col(?:-(sm|md|lg|xl|xxl))?(?:-(\d{1,2}))?$/);
      if (!r) return;
      const o = r[1] || null, l = r[2] || "auto";
      o ? o === "sm" ? e.sm = l === "auto" ? "auto" : l : o === "md" ? e.md = l === "auto" ? "auto" : l : (o === "lg" || o === "xl" || o === "xxl") && (e.lg = l === "auto" ? "auto" : l) : e.xs = l === "auto" ? "auto" : l;
    }), e;
  }
  /**
   * Build colClass from breakpoint map.
   */
  _buildColClass(t) {
    const e = [];
    return t.lg !== "auto" && e.push(`col-lg-${t.lg}`), t.md !== "auto" && e.push(`col-md-${t.md}`), t.sm !== "auto" && e.push(`col-sm-${t.sm}`), t.xs !== "auto" ? e.push(`col-${t.xs}`) : e.length === 0 && e.push("col"), e.join(" ");
  }
  _renderColumnsConfig() {
    const t = this._el("columnsContainer");
    t.innerHTML = "", this._columns.forEach((e, i) => {
      const s = document.createElement("div");
      s.className = "tiptap-layout-column-config", s.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">
            Column ${i + 1}
          </span>
          <button type="button" class="btn btn-sm btn-outline-danger rounded-circle p-0"
                  style="width:22px;height:22px;line-height:1;font-size:11px"
                  data-remove-col="${i}" title="Remove column"
                  ${this._columns.length <= 1 ? "disabled" : ""}>
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="row g-2">
          ${Ly.map((r) => `
            <div class="col-3">
              <label class="form-label" style="font-size:10px;margin-bottom:2px">${r.label}</label>
              <select class="form-select form-select-sm"
                      data-col-bp="${i}-${r.key}" style="font-size:12px">
                ${Ny.map((o) => `<option value="${o.value}" ${e[r.key] === o.value ? "selected" : ""}>${o.label}</option>`).join("")}
              </select>
            </div>
          `).join("")}
        </div>
      `, t.appendChild(s);
    }), this._updateColumnTotal();
  }
  _updateColumnTotal() {
    const t = this._el("colTotal");
    if (!t) return;
    let e = 0, i = !0;
    this._columns.forEach((s) => {
      const r = s.md !== "auto" ? parseInt(s.md, 10) : 0;
      s.md !== "auto" && (e += r, i = !1);
    }), i ? (t.textContent = `${this._columns.length} auto columns`, t.className = "badge bg-secondary-subtle text-secondary-emphasis") : e === Zl ? (t.textContent = `Total: ${e}/12`, t.className = "badge bg-success-subtle text-success-emphasis") : e > Zl ? (t.textContent = `Total: ${e}/12 (overflow!)`, t.className = "badge bg-danger-subtle text-danger-emphasis") : (t.textContent = `Total: ${e}/12`, t.className = "badge bg-warning-subtle text-warning-emphasis");
  }
  _setJustify(t) {
    this._modal.querySelectorAll("[data-layout-justify]").forEach((e) => {
      e.classList.toggle("active", e.dataset.layoutJustify === t);
    });
  }
  _getJustify() {
    const t = this._modal.querySelector("[data-layout-justify].active");
    return (t == null ? void 0 : t.dataset.layoutJustify) || "start";
  }
  _setAlign(t) {
    this._modal.querySelectorAll("[data-layout-align]").forEach((e) => {
      e.classList.toggle("active", e.dataset.layoutAlign === t);
    });
  }
  _getAlign() {
    const t = this._modal.querySelector("[data-layout-align].active");
    return (t == null ? void 0 : t.dataset.layoutAlign) || "stretch";
  }
  _bindEvents() {
    this._el("gutter").addEventListener("input", () => this._updatePreview()), this._modal.querySelectorAll("[data-layout-justify]").forEach((t) => {
      t.addEventListener("click", () => {
        this._setJustify(t.dataset.layoutJustify), this._updatePreview();
      });
    }), this._modal.querySelectorAll("[data-layout-align]").forEach((t) => {
      t.addEventListener("click", () => {
        this._setAlign(t.dataset.layoutAlign), this._updatePreview();
      });
    }), this._modal.querySelectorAll("[data-layout-preset]").forEach((t) => {
      t.addEventListener("click", () => {
        const e = t.dataset.layoutPreset, i = Tr[e];
        i && (this._columns = i.map((s) => this._parseColClass(s)), this._renderColumnsConfig(), this._rebindColumnEvents(), this._updatePreview());
      });
    }), this._el("addColBtn").addEventListener("click", () => {
      this._columns.length >= 6 || (this._columns.push({ lg: "auto", md: "auto", sm: "auto", xs: "auto" }), this._renderColumnsConfig(), this._rebindColumnEvents(), this._updatePreview());
    }), this._el("columnsContainer").addEventListener("click", (t) => {
      const e = t.target.closest("[data-remove-col]");
      if (e && this._columns.length > 1) {
        const i = parseInt(e.dataset.removeCol, 10);
        this._columns.splice(i, 1), this._renderColumnsConfig(), this._rebindColumnEvents(), this._updatePreview();
      }
    }), this._el("columnsContainer").addEventListener("change", (t) => {
      const e = t.target.closest("[data-col-bp]");
      if (e) {
        const [i, s] = e.dataset.colBp.split("-");
        this._columns[parseInt(i, 10)][s] = e.value, this._updateColumnTotal(), this._updatePreview();
      }
    }), this._el("insertBtn").addEventListener("click", () => this._submit()), this._el("deleteBtn").addEventListener("click", () => {
      this._editMode && this.editor.chain().focus().deleteBootstrapRow().run(), this._bs.hide();
    });
  }
  _rebindColumnEvents() {
  }
  _submit() {
    const t = this._columns.map((o) => ({
      colClass: this._buildColClass(o)
    })), e = parseInt(this._el("gutter").value, 10) || 3, i = this._getJustify(), s = this._getAlign(), r = {
      columns: t,
      gutter: e,
      justifyContent: i === "start" ? null : i,
      alignItems: s === "stretch" ? null : s
    };
    this._editMode ? this.editor.chain().focus().updateBootstrapRow(r).run() : this.editor.chain().focus().insertBootstrapRowAdvanced(r).run(), this._bs.hide();
  }
  _updatePreview() {
    const t = this._el("preview");
    if (!t) return;
    const e = this._el("gutter").value || "3", i = this._getJustify(), s = this._getAlign();
    let r = `row g-${e}`;
    i !== "start" && (r += ` justify-content-${i}`), s !== "stretch" && (r += ` align-items-${s}`);
    const o = this._columns.map((l, a) => {
      const c = this._buildColClass(l), d = l.md !== "auto" ? l.md : "auto", u = d !== "auto" ? parseInt(d, 10) / 12 * 100 : 100 / this._columns.length;
      return `<div style="flex:${d === "auto" ? "1" : `0 0 ${u}%`};
                          max-width:${d === "auto" ? "100%" : `${u}%`};
                          padding:0 ${parseInt(e, 10) * 2}px">
        <div class="tiptap-layout-preview-col"
             style="background:rgba(13,110,253,${0.08 + a * 0.04});
                    border:1px solid rgba(13,110,253,0.2);
                    border-radius:4px;padding:8px 6px;text-align:center;
                    font-size:11px;color:#555;min-height:${s === "stretch" ? "50px" : "auto"}">
          <div style="font-weight:600;margin-bottom:2px">${c}</div>
          <div style="font-size:10px;color:#888">${d === "auto" ? "auto" : `${d}/12`}</div>
        </div>
      </div>`;
    }).join("");
    t.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;
                  ${i === "center" ? "justify-content:center;" : ""}
                  ${i === "end" ? "justify-content:flex-end;" : ""}
                  ${i === "between" ? "justify-content:space-between;" : ""}
                  ${i === "around" ? "justify-content:space-around;" : ""}
                  ${i === "evenly" ? "justify-content:space-evenly;" : ""}
                  ${s === "center" ? "align-items:center;" : ""}
                  ${s === "end" ? "align-items:flex-end;" : ""}
                  ${s === "start" ? "align-items:flex-start;" : ""}
                  ${s === "stretch" ? "align-items:stretch;" : ""}
                  margin:-${parseInt(e, 10) * 2}px">
        ${o}
      </div>
      <div class="text-center mt-2" style="font-size:10px;color:#888">
        <code style="font-size:10px">${r}</code>
      </div>
    `;
  }
  _escHtml(t) {
    const e = document.createElement("div");
    return e.textContent = t, e.innerHTML;
  }
  _template() {
    const e = [
      { id: "1-col", icon: "▰▰▰▰▰▰▰▰▰▰▰▰", label: "1 Col" },
      { id: "2-col", icon: "▰▰▰▰▰▰ ▰▰▰▰▰▰", label: "2 Col" },
      { id: "3-col", icon: "▰▰▰▰ ▰▰▰▰ ▰▰▰▰", label: "3 Col" },
      { id: "4-col", icon: "▰▰▰ ▰▰▰ ▰▰▰ ▰▰▰", label: "4 Col" },
      { id: "1-2", icon: "▰▰▰▰ ▰▰▰▰▰▰▰▰", label: "1/3 + 2/3" },
      { id: "2-1", icon: "▰▰▰▰▰▰▰▰ ▰▰▰▰", label: "2/3 + 1/3" }
    ].map(
      (l) => `<button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0"
              data-layout-preset="${l.id}" title="${l.label}" style="font-size:11px;line-height:1.8">
        ${l.label}
      </button>`
    ).join(`
        `), s = [
      { key: "start", icon: "text-left", label: "Start" },
      { key: "center", icon: "text-center", label: "Center" },
      { key: "end", icon: "text-right", label: "End" },
      { key: "between", icon: "distribute-horizontal", label: "Between" },
      { key: "around", icon: "arrows", label: "Around" },
      { key: "evenly", icon: "arrows-expand", label: "Evenly" }
    ].map(
      (l) => `<button type="button" class="tiptap-layout-option-btn" data-layout-justify="${l.key}" title="${l.label}">
        <i class="bi bi-${l.icon}"></i>
        <span>${l.label}</span>
      </button>`
    ).join(`
          `), o = [
      { key: "start", icon: "align-top", label: "Top" },
      { key: "center", icon: "align-middle", label: "Center" },
      { key: "end", icon: "align-bottom", label: "Bottom" },
      { key: "stretch", icon: "arrows-expand", label: "Stretch" }
    ].map(
      (l) => `<button type="button" class="tiptap-layout-option-btn" data-layout-align="${l.key}" title="${l.label}">
        <i class="bi bi-${l.icon}"></i>
        <span>${l.label}</span>
      </button>`
    ).join(`
          `);
    return `
<div class="modal fade tiptap-layout-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-layout-split me-2 text-primary"></i>
          <span data-layoutm="titleText">Insert Layout</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Preview -->
        <div class="p-3 bg-light rounded mb-3" data-layoutm="preview" style="min-height:60px"></div>

        <!-- Presets -->
        <div class="mb-3">
          <label class="form-label small fw-medium">Quick Presets</label>
          <div class="d-flex flex-wrap gap-1">
            ${e}
          </div>
        </div>

        <!-- Columns Configuration -->
        <div class="mb-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label small fw-medium mb-0">
              Columns
              <span data-layoutm="colTotal" class="badge bg-secondary-subtle text-secondary-emphasis ms-2" style="font-size:10px">2 auto columns</span>
            </label>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0"
                    data-layoutm="addColBtn" style="font-size:11px">
              <i class="bi bi-plus me-1"></i>Add Column
            </button>
          </div>
          <div data-layoutm="columnsContainer" class="tiptap-layout-columns-container"></div>
        </div>

        <div class="row g-3">
          <!-- Gutter -->
          <div class="col-md-4">
            <label class="form-label small fw-medium">
              Gutter (Spacing)
              <span class="text-muted fw-normal ms-1" data-layoutm="gutterValue"></span>
            </label>
            <input type="range" class="form-range" min="0" max="5" step="1" value="3"
                   data-layoutm="gutter">
            <div class="d-flex justify-content-between" style="font-size:10px;color:#888;margin-top:-4px">
              <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          <!-- Horizontal Alignment -->
          <div class="col-md-4">
            <label class="form-label small fw-medium">Horizontal Align</label>
            <div class="d-flex flex-wrap gap-1">
              ${s}
            </div>
          </div>

          <!-- Vertical Alignment -->
          <div class="col-md-4">
            <label class="form-label small fw-medium">Vertical Align</label>
            <div class="d-flex flex-wrap gap-1">
              ${o}
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 d-none" data-layoutm="deleteBtn">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-layoutm="insertBtn">
          <i class="bi bi-layout-split me-1"></i>Insert Layout
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
const Ws = {
  // ── Text Formatting ──────────────────
  bold: {
    icon: "type-bold",
    label: "Bold",
    command: "toggleBold",
    isActive: (n) => n.isActive("bold")
  },
  italic: {
    icon: "type-italic",
    label: "Italic",
    command: "toggleItalic",
    isActive: (n) => n.isActive("italic")
  },
  underline: {
    icon: "type-underline",
    label: "Underline",
    command: "toggleUnderline",
    isActive: (n) => n.isActive("underline")
  },
  strike: {
    icon: "type-strikethrough",
    label: "Strikethrough",
    command: "toggleStrike",
    isActive: (n) => n.isActive("strike")
  },
  subscript: {
    icon: "subscript",
    label: "Subscript",
    command: "toggleSubscript",
    isActive: (n) => n.isActive("subscript")
  },
  superscript: {
    icon: "superscript",
    label: "Superscript",
    command: "toggleSuperscript",
    isActive: (n) => n.isActive("superscript")
  },
  // ── Headings ─────────────────────────
  h1: {
    icon: "type-h1",
    label: "Heading 1",
    command: "toggleHeading",
    commandArgs: { level: 1 },
    isActive: (n) => n.isActive("heading", { level: 1 })
  },
  h2: {
    icon: "type-h2",
    label: "Heading 2",
    command: "toggleHeading",
    commandArgs: { level: 2 },
    isActive: (n) => n.isActive("heading", { level: 2 })
  },
  h3: {
    icon: "type-h3",
    label: "Heading 3",
    command: "toggleHeading",
    commandArgs: { level: 3 },
    isActive: (n) => n.isActive("heading", { level: 3 })
  },
  h4: {
    icon: "type-h4",
    label: "Heading 4",
    command: "toggleHeading",
    commandArgs: { level: 4 },
    isActive: (n) => n.isActive("heading", { level: 4 })
  },
  // ── Text Alignment ──────────────────
  alignLeft: {
    icon: "text-left",
    label: "Align Left",
    command: "setTextAlign",
    commandArgs: "left",
    isActive: (n) => n.isActive({ textAlign: "left" })
  },
  alignCenter: {
    icon: "text-center",
    label: "Align Center",
    command: "setTextAlign",
    commandArgs: "center",
    isActive: (n) => n.isActive({ textAlign: "center" })
  },
  alignRight: {
    icon: "text-right",
    label: "Align Right",
    command: "setTextAlign",
    commandArgs: "right",
    isActive: (n) => n.isActive({ textAlign: "right" })
  },
  alignJustify: {
    icon: "justify",
    label: "Justify",
    command: "setTextAlign",
    commandArgs: "justify",
    isActive: (n) => n.isActive({ textAlign: "justify" })
  },
  // ── Lists ────────────────────────────
  bulletList: {
    icon: "list-ul",
    label: "Bullet List",
    command: "toggleBulletList",
    isActive: (n) => n.isActive("bulletList")
  },
  orderedList: {
    icon: "list-ol",
    label: "Ordered List",
    command: "toggleOrderedList",
    isActive: (n) => n.isActive("orderedList")
  },
  // ── Block Elements ───────────────────
  blockquote: {
    icon: "blockquote-left",
    label: "Blockquote",
    command: "toggleBlockquote",
    isActive: (n) => n.isActive("blockquote")
  },
  codeBlock: {
    icon: "code-square",
    label: "Code Block",
    command: "toggleCodeBlock",
    isActive: (n) => n.isActive("codeBlock")
  },
  horizontalRule: {
    icon: "hr",
    label: "Horizontal Rule",
    command: "setHorizontalRule"
  },
  // ── Insert ───────────────────────────
  link: {
    icon: "link-45deg",
    label: "Link",
    command: "_promptLink",
    isActive: (n) => n.isActive("link")
  },
  image: {
    icon: "image",
    label: "Image",
    command: "_promptImage"
  },
  table: {
    icon: "table",
    label: "Table",
    command: "_promptTable"
  },
  // ── History ──────────────────────────
  undo: {
    icon: "arrow-counterclockwise",
    label: "Undo",
    command: "undo"
  },
  redo: {
    icon: "arrow-clockwise",
    label: "Redo",
    command: "redo"
  },
  // ── Format ───────────────────────────
  color: {
    icon: "palette",
    label: "Text Color",
    command: "_promptColor",
    type: "color"
  },
  highlight: {
    icon: "highlighter",
    label: "Highlight",
    command: "toggleHighlight",
    isActive: (n) => n.isActive("highlight")
  },
  // ── Layout ───────────────────────────
  row: {
    icon: "layout-split",
    label: "Insert Layout",
    command: "_showLayoutDropdown",
    type: "dropdown",
    isActive: (n) => n.isActive("bootstrapRow")
  },
  addColumn: {
    icon: "plus-square",
    label: "Add Column",
    command: "addColumnToRow"
  },
  removeColumn: {
    icon: "dash-square",
    label: "Remove Column",
    command: "removeColumn"
  },
  deleteRow: {
    icon: "trash",
    label: "Delete Row",
    command: "deleteBootstrapRow"
  },
  // ── Components ───────────────────────
  alert: {
    icon: "exclamation-triangle",
    label: "Insert Alert",
    command: "_showAlertDropdown",
    type: "dropdown",
    isActive: (n) => n.isActive("bootstrapAlert")
  },
  card: {
    icon: "card-heading",
    label: "Insert Card",
    command: "_insertCard",
    isActive: (n) => n.isActive("bootstrapCard")
  },
  button: {
    icon: "hand-index",
    label: "Insert Button",
    command: "_insertButton"
  },
  // ── Media ────────────────────────────
  video: {
    icon: "play-btn",
    label: "Video",
    command: "_promptVideo"
  },
  gallery: {
    icon: "images",
    label: "Gallery",
    command: "_promptGallery"
  },
  // ── AI ───────────────────────────────
  ai: {
    icon: "stars",
    label: "AI Assistant",
    command: "_toggleAiPanel",
    type: "button"
  },
  // ── Utilities ────────────────────────
  darkMode: {
    icon: "moon-fill",
    label: "Toggle Dark Mode",
    command: "_toggleDarkMode"
  },
  shortcuts: {
    icon: "keyboard",
    label: "Keyboard Shortcuts",
    command: "_showShortcuts"
  }
}, Ry = [
  { id: "1-col", label: "1 Column", icon: "[ 12 ]" },
  { id: "2-col", label: "2 Columns", icon: "[ 6 | 6 ]" },
  { id: "3-col", label: "3 Columns", icon: "[ 4 | 4 | 4 ]" },
  { id: "4-col", label: "4 Columns", icon: "[ 3 | 3 | 3 | 3 ]" },
  { id: "1-2", label: "Sidebar Left", icon: "[ 4 | 8 ]" },
  { id: "2-1", label: "Sidebar Right", icon: "[ 8 | 4 ]" },
  { id: "1-1-2", label: "2 Narrow + Wide", icon: "[ 3 | 3 | 6 ]" },
  { id: "2-1-1", label: "Wide + 2 Narrow", icon: "[ 6 | 3 | 3 ]" }
], Iy = [
  { id: "primary", label: "Primary", color: "#0d6efd" },
  { id: "secondary", label: "Secondary", color: "#6c757d" },
  { id: "success", label: "Success", color: "#198754" },
  { id: "danger", label: "Danger", color: "#dc3545" },
  { id: "warning", label: "Warning", color: "#ffc107" },
  { id: "info", label: "Info", color: "#0dcaf0" },
  { id: "light", label: "Light", color: "#f8f9fa" },
  { id: "dark", label: "Dark", color: "#212529" }
];
class Dy {
  /**
   * @param {HTMLElement} toolbarElement - The [data-tiptap-toolbar] element
   * @param {import('@tiptap/core').Editor} editor - Tiptap editor instance
   * @param {Object} config - Toolbar config with groups
   */
  constructor(t, e, i = {}) {
    this.element = t, this.editor = e, this.config = i, this.buttons = /* @__PURE__ */ new Map(), this.editor._tiptapToolbar = this, this.imageModal = new My(this), this.linkModal = new Ey(this), this.videoModal = new _y(this), this.tableModal = new Ty(this), this.buttonModal = new Lr(this), this.cardModal = new Nr(this), this.galleryModal = new Ay(this), this.layoutModal = new Oy(this), this._render(), this._bindEvents();
  }
  /**
   * Render toolbar buttons into the toolbar element.
   * @private
   */
  _render() {
    const t = this.config.groups || {}, e = this.element.querySelector(".tiptap-toolbar") || this.element;
    e.innerHTML = "";
    const i = Object.keys(t);
    i.forEach((s, r) => {
      const o = t[s];
      if (!o || o.length === 0) return;
      const l = document.createElement("div");
      if (l.className = "tiptap-toolbar__group", l.setAttribute("role", "group"), l.setAttribute("aria-label", s), o.forEach((a) => {
        const c = Ws[a];
        c && (c.type === "color" ? l.appendChild(this._createColorButton(a, c)) : c.type === "dropdown" ? l.appendChild(this._createDropdownButton(a, c)) : l.appendChild(this._createButton(a, c)));
      }), e.appendChild(l), r < i.length - 1) {
        const a = document.createElement("div");
        a.className = "tiptap-toolbar__separator", a.setAttribute("role", "separator"), e.appendChild(a);
      }
    });
  }
  /**
   * Create a single toolbar button element.
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLButtonElement}
   */
  _createButton(t, e) {
    const i = document.createElement("button");
    return i.type = "button", i.className = "tiptap-toolbar__button", i.setAttribute("data-action", t), i.setAttribute("aria-label", e.label), i.setAttribute("title", e.label), i.innerHTML = `<i class="bi bi-${e.icon}"></i>`, this.buttons.set(t, i), i;
  }
  /**
   * Create a color picker toolbar button.
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createColorButton(t, e) {
    const i = document.createElement("span");
    i.className = "tiptap-toolbar__color-wrapper", i.style.position = "relative", i.style.display = "inline-flex";
    const s = document.createElement("button");
    s.type = "button", s.className = "tiptap-toolbar__button", s.setAttribute("data-action", t), s.setAttribute("aria-label", e.label), s.setAttribute("title", e.label), s.innerHTML = `<i class="bi bi-${e.icon}"></i>`;
    const r = document.createElement("input");
    return r.type = "color", r.className = "tiptap-toolbar__color-input", r.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; padding: 0; border: 0; cursor: pointer; opacity: 0.7;", r.value = "#000000", r.addEventListener("input", (o) => {
      this.editor.chain().focus().setColor(o.target.value).run();
    }), s.addEventListener("click", () => {
      r.click();
    }), i.appendChild(s), i.appendChild(r), this.buttons.set(t, s), i;
  }
  /**
   * Create a dropdown toolbar button (e.g., layout presets).
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createDropdownButton(t, e) {
    const i = document.createElement("div");
    i.className = "tiptap-toolbar__dropdown", i.style.position = "relative", i.style.display = "inline-flex";
    const s = document.createElement("button");
    s.type = "button", s.className = "tiptap-toolbar__button", s.setAttribute("data-action", t), s.setAttribute("aria-label", e.label), s.setAttribute("title", e.label), s.setAttribute("aria-haspopup", "true"), s.setAttribute("aria-expanded", "false"), s.innerHTML = `<i class="bi bi-${e.icon}"></i>`;
    const r = document.createElement("div");
    if (r.className = "tiptap-toolbar__dropdown-menu", r.setAttribute("role", "menu"), r.style.display = "none", t === "row") {
      Ry.forEach((a) => {
        const c = document.createElement("button");
        c.type = "button", c.className = "tiptap-toolbar__dropdown-item", c.setAttribute("data-layout-preset", a.id), c.setAttribute("role", "menuitem"), c.innerHTML = `<span class="tiptap-toolbar__preset-icon">${a.icon}</span> <span>${a.label}</span>`, r.appendChild(c);
      });
      const o = document.createElement("div");
      o.className = "tiptap-toolbar__dropdown-separator", r.appendChild(o);
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item tiptap-toolbar__dropdown-item--accent", l.setAttribute("data-layout-advanced", "true"), l.setAttribute("role", "menuitem"), l.innerHTML = '<i class="bi bi-gear me-2"></i><span>Advanced Layout...</span>', r.appendChild(l);
    }
    return t === "alert" && Iy.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-alert-type", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__alert-swatch" style="background:${o.color}"></span> <span>${o.label}</span>`, r.appendChild(l);
    }), s.addEventListener("click", (o) => {
      o.stopPropagation();
      const l = r.style.display !== "none";
      this._closeAllDropdowns(), l || (r.style.display = "block", s.setAttribute("aria-expanded", "true"));
    }), r.addEventListener("click", (o) => {
      if (o.target.closest("[data-layout-advanced]")) {
        o.stopPropagation(), r.style.display = "none", s.setAttribute("aria-expanded", "false"), this.layoutModal.open();
        return;
      }
      const a = o.target.closest("[data-layout-preset]");
      if (a) {
        o.stopPropagation();
        const d = a.getAttribute("data-layout-preset");
        this.editor.chain().focus().insertBootstrapRow(d).run(), r.style.display = "none", s.setAttribute("aria-expanded", "false");
        return;
      }
      const c = o.target.closest("[data-alert-type]");
      if (c) {
        o.stopPropagation();
        const d = c.getAttribute("data-alert-type");
        this.editor.isActive("bootstrapAlert") ? this.editor.chain().focus().setAlertType(d).run() : this.editor.chain().focus().insertBootstrapAlert(d).run(), r.style.display = "none", s.setAttribute("aria-expanded", "false");
      }
    }), i.appendChild(s), i.appendChild(r), this.buttons.set(t, s), i;
  }
  /**
   * Close all open dropdowns in the toolbar.
   * @private
   */
  _closeAllDropdowns() {
    this.element.querySelectorAll(".tiptap-toolbar__dropdown-menu").forEach((t) => {
      t.style.display = "none";
    }), this.element.querySelectorAll("[aria-expanded]").forEach((t) => {
      t.setAttribute("aria-expanded", "false");
    });
  }
  /**
   * Bind click events to toolbar buttons.
   * @private
   */
  _bindEvents() {
    this.element.addEventListener("click", (t) => {
      const e = t.target.closest("[data-action]");
      if (!e) return;
      t.preventDefault();
      const i = e.getAttribute("data-action");
      this._executeAction(i);
    }), document.addEventListener("click", (t) => {
      this.element.contains(t.target) || this._closeAllDropdowns();
    });
  }
  /**
   * Execute a toolbar button action.
   * @private
   * @param {string} actionId
   */
  _executeAction(t) {
    const e = Ws[t];
    if (!e || !this.editor) return;
    const i = e.command;
    if (i === "_promptLink") {
      this._handleLink();
      return;
    }
    if (i === "_promptImage") {
      this._handleImage();
      return;
    }
    if (i === "_promptTable") {
      if (this.editor.isActive("table")) {
        const { $from: r } = this.editor.state.selection;
        let o = null;
        for (let l = r.depth; l > 0; l--) {
          const a = r.node(l);
          if (a.type.name === "table") {
            o = {
              bordered: !!a.attrs.bordered,
              striped: !!a.attrs.striped,
              hover: !!a.attrs.hover,
              small: !!a.attrs.small,
              alignMiddle: !!a.attrs.alignMiddle
            };
            break;
          }
        }
        this.tableModal.open(o);
      } else
        this.tableModal.open();
      return;
    }
    if (i === "_promptColor")
      return;
    if (i === "_showLayoutDropdown") {
      this.editor.isActive("bootstrapRow") && this._handleEditLayout();
      return;
    }
    if (i === "_showAlertDropdown")
      return;
    if (i === "_insertCard") {
      this._handleInsertCard();
      return;
    }
    if (i === "_insertButton") {
      this._handleInsertButton();
      return;
    }
    if (i === "_promptVideo") {
      this._handleVideo();
      return;
    }
    if (i === "_promptGallery") {
      this._handleGallery();
      return;
    }
    if (i === "_toggleAiPanel") {
      this._handleToggleAiPanel();
      return;
    }
    if (i === "_toggleDarkMode") {
      this._handleToggleDarkMode();
      return;
    }
    if (i === "_showShortcuts") {
      this._handleShowShortcuts();
      return;
    }
    const s = this.editor.chain().focus();
    e.commandArgs !== void 0 ? s[i](e.commandArgs).run() : s[i]().run();
  }
  /**
   * Handle link insertion/removal with a prompt.
   * @private
   */
  _handleLink() {
    this.editor.isActive("link") ? this.linkModal.open(this.editor.getAttributes("link")) : this.linkModal.open();
  }
  /**
   * Handle image insertion – opens the ImageModal.
   * @private
   */
  _handleImage() {
    this.imageModal.open();
  }
  /**
   * Get the media upload URL from config or CSRF meta.
   * @private
   * @returns {string|null}
   */
  _getUploadUrl() {
    var s;
    const t = this.element.closest("[data-tiptap-editor]"), e = t == null ? void 0 : t.getAttribute("data-upload-url");
    return e || ((s = document.querySelector('meta[name="tiptap-upload-url"]')) == null ? void 0 : s.content) || null;
  }
  /**
   * Get the media browse URL from config or meta tag.
   * @private
   * @returns {string|null}
   */
  _getBrowseUrl() {
    var s;
    const t = this.element.closest("[data-tiptap-editor]"), e = t == null ? void 0 : t.getAttribute("data-browse-url");
    return e || ((s = document.querySelector('meta[name="tiptap-browse-url"]')) == null ? void 0 : s.content) || null;
  }
  /**
   * Upload a file to the server.
   * @private
   * @param {File} file
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async _uploadFile(t, e) {
    var l;
    const i = new FormData();
    i.append("file", t);
    const s = ((l = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : l.content) || "", r = await fetch(e, {
      method: "POST",
      headers: {
        "X-CSRF-TOKEN": s,
        Accept: "application/json"
      },
      body: i
    });
    if (!r.ok)
      throw new Error(`Upload failed with status ${r.status}`);
    const o = await r.json();
    return o.media || o;
  }
  /**
   * Handle card insertion – opens the CardModal.
   * @private
   */
  _handleInsertCard() {
    this.cardModal.open();
  }
  /**
   * Handle button insertion – opens the ButtonModal.
   * @private
   */
  _handleInsertButton() {
    this.buttonModal.open();
  }
  /**
   * Handle video insertion with URL prompt.
   * @private
   */
  _handleVideo() {
    this.videoModal.open();
  }
  /**
   * Handle gallery insertion – opens the GalleryModal.
   * @private
   */
  _handleGallery() {
    this.galleryModal.open();
  }
  /**
   * Handle editing current layout row – opens LayoutModal with existing attrs.
   * @private
   */
  _handleEditLayout() {
    const { $from: t } = this.editor.state.selection;
    for (let e = t.depth; e > 0; e--) {
      const i = t.node(e);
      if (i.type.name === "bootstrapRow") {
        const s = [];
        i.forEach((r) => {
          r.type.name === "bootstrapCol" && s.push({ colClass: r.attrs.colClass || "col" });
        }), this.layoutModal.open({ ...i.attrs, columns: s });
        return;
      }
    }
  }
  /**
   * Update active states of all toolbar buttons based on current editor state.
   * @param {import('@tiptap/core').Editor} editor
   */
  updateActiveStates(t) {
    this.buttons.forEach((e, i) => {
      const s = Ws[i];
      if (!s || !s.isActive) {
        e.classList.remove("tiptap-toolbar__button--active");
        return;
      }
      try {
        const r = s.isActive(t);
        e.classList.toggle("tiptap-toolbar__button--active", r);
      } catch {
        e.classList.remove("tiptap-toolbar__button--active");
      }
    });
  }
  /**
   * Toggle the AI Assistant panel.
   * Relies on the editor wrapper having an AiPanel instance.
   * @private
   */
  _handleToggleAiPanel() {
    const t = new CustomEvent("tiptap:toggle-ai-panel", { bubbles: !0 });
    this.element.dispatchEvent(t);
  }
  /**
   * Toggle dark mode on the editor.
   * Cycles: auto → dark → light → auto
   * @private
   */
  _handleToggleDarkMode() {
    const t = new CustomEvent("tiptap:toggle-dark-mode", { bubbles: !0 });
    this.element.dispatchEvent(t);
  }
  /**
   * Show keyboard shortcuts help modal.
   * @private
   */
  _handleShowShortcuts() {
    const t = new CustomEvent("tiptap:show-shortcuts", { bubbles: !0 });
    this.element.dispatchEvent(t);
  }
  /**
   * Destroy the toolbar and clean up.
   */
  destroy() {
    var t, e, i, s, r, o, l, a;
    (t = this.imageModal) == null || t.destroy(), this.imageModal = null, (e = this.linkModal) == null || e.destroy(), this.linkModal = null, (i = this.videoModal) == null || i.destroy(), this.videoModal = null, (s = this.tableModal) == null || s.destroy(), this.tableModal = null, (r = this.buttonModal) == null || r.destroy(), this.buttonModal = null, (o = this.cardModal) == null || o.destroy(), this.cardModal = null, (l = this.galleryModal) == null || l.destroy(), this.galleryModal = null, (a = this.layoutModal) == null || a.destroy(), this.layoutModal = null, this.buttons.clear(), this.element.innerHTML = "", this.editor && (this.editor._tiptapToolbar = null), this.editor = null;
  }
}
const sn = {
  generate: {
    label: "Generate",
    icon: "stars",
    description: "Generate new content from a prompt",
    placeholder: "Describe the content you want to generate...",
    requiresContent: !1
  },
  refine: {
    label: "Refine",
    icon: "pencil-square",
    description: "Rewrite or improve existing content",
    placeholder: 'How should the content be improved? (e.g., "make it more formal")',
    requiresContent: !0
  },
  summarize: {
    label: "Summarize",
    icon: "list-columns-reverse",
    description: "Create a concise summary",
    placeholder: "Any specific instructions for the summary?",
    requiresContent: !0
  },
  translate: {
    label: "Translate",
    icon: "translate",
    description: "Translate content to another language",
    placeholder: "Enter target language (e.g., Vietnamese, Japanese, French)",
    requiresContent: !0
  }
}, Py = 10, Ks = "tiptap_ai_recent_prompts";
class By {
  /**
   * @param {import('./Editor').default} editorInstance - The parent TiptapEditor instance
   * @param {AiPanelConfig} config - AI configuration
   */
  constructor(t, e = {}) {
    this.editorInstance = t, this.config = e, this.panelElement = null, this.currentAction = "generate", this.isOpen = !1, this.isLoading = !1, this.previewContent = null, this._abortController = null, this._build();
  }
  /**
   * Build the AI panel DOM structure.
   * @private
   */
  _build() {
    this.panelElement = document.createElement("div"), this.panelElement.className = "tiptap-ai-panel", this.panelElement.setAttribute("role", "dialog"), this.panelElement.setAttribute("aria-label", "AI Content Generation"), this.panelElement.innerHTML = this._getTemplate(), this._els = {
      actionButtons: this.panelElement.querySelectorAll("[data-ai-action]"),
      promptArea: this.panelElement.querySelector("[data-ai-prompt]"),
      submitBtn: this.panelElement.querySelector("[data-ai-submit]"),
      cancelBtn: this.panelElement.querySelector("[data-ai-cancel]"),
      closeBtn: this.panelElement.querySelector("[data-ai-close]"),
      previewArea: this.panelElement.querySelector("[data-ai-preview]"),
      previewContent: this.panelElement.querySelector("[data-ai-preview-content]"),
      insertBtn: this.panelElement.querySelector("[data-ai-insert]"),
      regenerateBtn: this.panelElement.querySelector("[data-ai-regenerate]"),
      discardBtn: this.panelElement.querySelector("[data-ai-discard]"),
      statusArea: this.panelElement.querySelector("[data-ai-status]"),
      statusText: this.panelElement.querySelector("[data-ai-status-text]"),
      inputSection: this.panelElement.querySelector("[data-ai-input-section]"),
      resultSection: this.panelElement.querySelector("[data-ai-result-section]"),
      recentList: this.panelElement.querySelector("[data-ai-recent]"),
      actionDescription: this.panelElement.querySelector("[data-ai-action-desc]")
    }, this._bindEvents(), this.editorInstance.wrapper.appendChild(this.panelElement);
  }
  /**
   * Get the panel HTML template.
   * @private
   * @returns {string}
   */
  _getTemplate() {
    return `
      <div class="tiptap-ai-panel__header">
        <span class="tiptap-ai-panel__title">
          <i class="bi bi-stars"></i> AI Assistant
        </span>
        <button type="button" class="tiptap-ai-panel__close-btn" data-ai-close aria-label="Close AI Panel">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="tiptap-ai-panel__body">
        <div class="tiptap-ai-panel__actions">
          ${Object.entries(sn).map(
      ([e, i]) => `<button type="button" class="tiptap-ai-panel__action-btn${e === "generate" ? " active" : ""}" data-ai-action="${e}" title="${i.description}">
          <i class="bi bi-${i.icon}"></i> ${i.label}
        </button>`
    ).join("")}
        </div>

        <p class="tiptap-ai-panel__action-desc" data-ai-action-desc>
          ${sn.generate.description}
        </p>

        <!-- Input Section -->
        <div class="tiptap-ai-panel__input-section" data-ai-input-section>
          <textarea
            class="tiptap-ai-panel__prompt"
            data-ai-prompt
            rows="4"
            placeholder="${sn.generate.placeholder}"
          ></textarea>

          <div class="tiptap-ai-panel__recent" data-ai-recent></div>

          <div class="tiptap-ai-panel__controls">
            <button type="button" class="btn btn-primary btn-sm" data-ai-submit>
              <i class="bi bi-stars"></i> Generate
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" data-ai-cancel style="display:none;">
              Cancel
            </button>
          </div>
        </div>

        <!-- Status -->
        <div class="tiptap-ai-panel__status" data-ai-status style="display:none;">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span data-ai-status-text>Generating content...</span>
        </div>

        <!-- Result Section -->
        <div class="tiptap-ai-panel__result-section" data-ai-result-section style="display:none;">
          <div class="tiptap-ai-panel__preview" data-ai-preview>
            <div class="tiptap-ai-panel__preview-content" data-ai-preview-content></div>
          </div>
          <div class="tiptap-ai-panel__result-controls">
            <button type="button" class="btn btn-success btn-sm" data-ai-insert>
              <i class="bi bi-check-lg"></i> Insert
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm" data-ai-regenerate>
              <i class="bi bi-arrow-clockwise"></i> Regenerate
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" data-ai-discard>
              <i class="bi bi-trash"></i> Discard
            </button>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Bind DOM event listeners.
   * @private
   */
  _bindEvents() {
    this._els.actionButtons.forEach((t) => {
      t.addEventListener("click", () => {
        this._setAction(t.dataset.aiAction);
      });
    }), this._els.submitBtn.addEventListener("click", () => this._submit()), this._els.cancelBtn.addEventListener("click", () => this._cancelRequest()), this._els.closeBtn.addEventListener("click", () => this.close()), this._els.insertBtn.addEventListener("click", () => this._insertResult()), this._els.regenerateBtn.addEventListener("click", () => this._submit()), this._els.discardBtn.addEventListener("click", () => this._showInput()), this._els.promptArea.addEventListener("keydown", (t) => {
      (t.ctrlKey || t.metaKey) && t.key === "Enter" && (t.preventDefault(), this._submit()), t.key === "Escape" && this.close();
    });
  }
  /**
   * Open the AI panel.
   */
  open() {
    this.isOpen = !0, this.panelElement.classList.add("tiptap-ai-panel--open"), this._showInput(), this._loadRecentPrompts(), this._els.promptArea.focus();
  }
  /**
   * Close the AI panel.
   */
  close() {
    this.isOpen = !1, this.panelElement.classList.remove("tiptap-ai-panel--open"), this._cancelRequest(), this.previewContent = null;
  }
  /**
   * Toggle the AI panel open/close.
   */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  /**
   * Set the active action.
   * @param {string} action
   * @private
   */
  _setAction(t) {
    this.currentAction = t;
    const e = sn[t];
    this._els.actionButtons.forEach((i) => {
      i.classList.toggle("active", i.dataset.aiAction === t);
    }), this._els.promptArea.placeholder = e.placeholder, this._els.actionDescription.textContent = e.description, this._els.submitBtn.innerHTML = `<i class="bi bi-${e.icon}"></i> ${e.label}`, this._showInput();
  }
  /**
   * Submit the AI request.
   * @private
   */
  async _submit() {
    var r;
    const t = this._els.promptArea.value.trim();
    if (!t) {
      this._els.promptArea.classList.add("is-invalid"), this._els.promptArea.focus();
      return;
    }
    this._els.promptArea.classList.remove("is-invalid");
    const e = this.currentAction, i = sn[e];
    let s = { prompt: t, action: e };
    if (i.requiresContent) {
      const o = this.editorInstance.editor, a = this._getSelectedHtml() || o.getHTML();
      if (!a || a === "<p></p>") {
        this._showError("No content available. Please write or select some content first.");
        return;
      }
      s.content = a, e === "translate" && (s.target_lang = t);
    }
    this._saveRecentPrompt(t), this._showLoading();
    try {
      this._abortController = new AbortController();
      const o = this._getEndpointUrl(e), l = await fetch(o, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": this.config.csrfToken || this._getCsrfToken()
        },
        body: JSON.stringify(s),
        signal: this._abortController.signal
      });
      if (!l.ok) {
        const c = await l.json().catch(() => ({})), d = c.error || c.message || `Request failed (${l.status})`;
        throw new Error(d);
      }
      const a = await l.json();
      if (a.success && ((r = a.data) != null && r.content))
        this.previewContent = a.data.content, this._showResult(a.data);
      else
        throw new Error(a.error || "No content received from AI.");
    } catch (o) {
      if (o.name === "AbortError") {
        this._showInput();
        return;
      }
      this._showError(o.message);
    } finally {
      this._abortController = null;
    }
  }
  /**
   * Cancel the current request.
   * @private
   */
  _cancelRequest() {
    this._abortController && (this._abortController.abort(), this._abortController = null), this.isLoading = !1;
  }
  /**
   * Insert the AI-generated result into the editor.
   * @private
   */
  _insertResult() {
    if (!this.previewContent) return;
    const t = this.editorInstance.editor, e = this.currentAction;
    if (e === "refine" || e === "translate") {
      const { from: i, to: s } = t.state.selection;
      i !== s ? t.chain().focus().deleteSelection().insertContent(this.previewContent).run() : t.commands.setContent(this.previewContent);
    } else
      t.chain().focus().insertContent(this.previewContent).run();
    this.previewContent = null, this.close();
  }
  /**
   * Show the input section, hide result.
   * @private
   */
  _showInput() {
    this._els.inputSection.style.display = "", this._els.resultSection.style.display = "none", this._els.statusArea.style.display = "none", this._els.submitBtn.style.display = "", this._els.cancelBtn.style.display = "none", this._els.submitBtn.disabled = !1, this.isLoading = !1;
  }
  /**
   * Show loading state.
   * @private
   */
  _showLoading() {
    this.isLoading = !0, this._els.statusArea.style.display = "flex", this._els.statusText.textContent = "Generating content...", this._els.submitBtn.style.display = "none", this._els.cancelBtn.style.display = "", this._els.resultSection.style.display = "none";
  }
  /**
   * Show the result section with preview.
   * @param {Object} data - Response data from AI
   * @private
   */
  _showResult(t) {
    if (this.isLoading = !1, this._els.statusArea.style.display = "none", this._els.inputSection.style.display = "none", this._els.resultSection.style.display = "", this._els.previewContent.innerHTML = t.content, t.tokens_used) {
      const e = document.createElement("small");
      e.className = "text-muted d-block mt-1", e.textContent = `Tokens used: ${t.tokens_used} | Provider: ${t.provider} | Model: ${t.model}`, this._els.previewContent.appendChild(e);
    }
    if (t.truncated) {
      const e = document.createElement("div");
      e.className = "alert alert-warning alert-sm mt-2 py-1 px-2", e.textContent = "Content may be incomplete due to token limits.", this._els.previewContent.appendChild(e);
    }
  }
  /**
   * Show an error message.
   * @param {string} message
   * @private
   */
  _showError(t) {
    var e;
    this.isLoading = !1, this._els.statusArea.style.display = "flex", (e = this._els.statusArea.querySelector(".spinner-border")) == null || e.remove(), this._els.statusText.textContent = `Error: ${t}`, this._els.statusText.classList.add("text-danger"), this._els.cancelBtn.style.display = "none", this._els.submitBtn.style.display = "", this._els.submitBtn.disabled = !1, setTimeout(() => {
      this._els.statusText.classList.remove("text-danger"), this._showInput();
    }, 5e3);
  }
  /**
   * Get the selected HTML from the editor.
   * @returns {string|null}
   * @private
   */
  _getSelectedHtml() {
    const t = this.editorInstance.editor, { from: e, to: i } = t.state.selection;
    if (e === i) return null;
    const s = t.state.doc.slice(e, i), r = document.createElement("div"), o = t.view.domSerializer.serializeFragment(s.content);
    return r.appendChild(o), r.innerHTML;
  }
  /**
   * Get the endpoint URL for an action.
   * @param {string} action
   * @returns {string}
   * @private
   */
  _getEndpointUrl(t) {
    return {
      generate: this.config.generateUrl,
      refine: this.config.refineUrl,
      summarize: this.config.summarizeUrl,
      translate: this.config.translateUrl
    }[t] || this.config.generateUrl;
  }
  /**
   * Get CSRF token from meta tag.
   * @returns {string}
   * @private
   */
  _getCsrfToken() {
    const t = document.querySelector('meta[name="csrf-token"]');
    return t ? t.getAttribute("content") : "";
  }
  /**
   * Save a prompt to recent prompts in localStorage.
   * @param {string} prompt
   * @private
   */
  _saveRecentPrompt(t) {
    try {
      let e = JSON.parse(localStorage.getItem(Ks) || "[]");
      e = e.filter((i) => i !== t), e.unshift(t), e = e.slice(0, Py), localStorage.setItem(Ks, JSON.stringify(e)), this._loadRecentPrompts();
    } catch {
    }
  }
  /**
   * Load and render recent prompts.
   * @private
   */
  _loadRecentPrompts() {
    try {
      const t = JSON.parse(localStorage.getItem(Ks) || "[]");
      if (t.length === 0) {
        this._els.recentList.innerHTML = "";
        return;
      }
      const e = t.slice(0, 5).map(
        (i) => `<button type="button" class="tiptap-ai-panel__recent-item" title="${this._escapeAttr(i)}">${this._truncate(i, 50)}</button>`
      ).join("");
      this._els.recentList.innerHTML = `
        <div class="tiptap-ai-panel__recent-label">Recent:</div>
        ${e}
      `, this._els.recentList.querySelectorAll(".tiptap-ai-panel__recent-item").forEach((i, s) => {
        i.addEventListener("click", () => {
          this._els.promptArea.value = t[s], this._els.promptArea.focus();
        });
      });
    } catch {
    }
  }
  /**
   * Truncate a string.
   * @param {string} str
   * @param {number} max
   * @returns {string}
   * @private
   */
  _truncate(t, e) {
    return t.length > e ? t.substring(0, e) + "..." : t;
  }
  /**
   * Escape a string for use in an HTML attribute.
   * @param {string} str
   * @returns {string}
   * @private
   */
  _escapeAttr(t) {
    return t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  /**
   * Destroy the AI panel and clean up.
   */
  destroy() {
    this._cancelRequest(), this.panelElement && this.panelElement.parentNode && this.panelElement.parentNode.removeChild(this.panelElement), this.panelElement = null, this._els = null;
  }
}
const Hy = [
  {
    id: "duplicate",
    label: "Duplicate",
    icon: "copy",
    separator: !1
  },
  {
    id: "moveUp",
    label: "Move Up",
    icon: "arrow-up",
    separator: !1
  },
  {
    id: "moveDown",
    label: "Move Down",
    icon: "arrow-down",
    separator: !1
  },
  {
    id: "delete",
    label: "Delete",
    icon: "trash",
    separator: !0,
    danger: !0
  }
], $y = [
  { id: "paragraph", label: "Paragraph", icon: "text-paragraph" },
  { id: "heading1", label: "Heading 1", icon: "type-h1" },
  { id: "heading2", label: "Heading 2", icon: "type-h2" },
  { id: "heading3", label: "Heading 3", icon: "type-h3" },
  { id: "bulletList", label: "Bullet List", icon: "list-ul" },
  { id: "orderedList", label: "Ordered List", icon: "list-ol" },
  { id: "blockquote", label: "Blockquote", icon: "blockquote-left" },
  { id: "codeBlock", label: "Code Block", icon: "code-square" }
];
class zy {
  /**
   * @param {import('./Editor').default} editorInstance - The TiptapEditor instance
   */
  constructor(t) {
    this.editorInstance = t, this.editor = t.editor, this.wrapper = t.wrapper, this.handleEl = null, this.menuEl = null, this.currentBlock = null, this.currentNodePos = null, this._isMenuOpen = !1, this._hideTimeout = null, this._build(), this._bindEvents();
  }
  /**
   * Build the drag handle + context menu DOM.
   * @private
   */
  _build() {
    this.handleEl = document.createElement("button"), this.handleEl.type = "button", this.handleEl.className = "tiptap-block-handle", this.handleEl.innerHTML = '<i class="bi bi-grip-vertical"></i>', this.handleEl.setAttribute("aria-label", "Block actions"), this.handleEl.setAttribute("title", "Block actions"), this.handleEl.style.display = "none", this.menuEl = document.createElement("div"), this.menuEl.className = "tiptap-block-menu", this.menuEl.setAttribute("role", "menu"), this.menuEl.style.display = "none", Hy.forEach((i) => {
      if (i.separator) {
        const r = document.createElement("div");
        r.className = "tiptap-block-menu__separator", this.menuEl.appendChild(r);
      }
      const s = document.createElement("button");
      s.type = "button", s.className = `tiptap-block-menu__item${i.danger ? " tiptap-block-menu__item--danger" : ""}`, s.setAttribute("data-action", i.id), s.setAttribute("role", "menuitem"), s.innerHTML = `<i class="bi bi-${i.icon}"></i> <span>${i.label}</span>`, this.menuEl.appendChild(s);
    });
    const t = document.createElement("div");
    t.className = "tiptap-block-menu__separator", this.menuEl.appendChild(t);
    const e = document.createElement("div");
    e.className = "tiptap-block-menu__group-label", e.textContent = "Turn into", this.menuEl.appendChild(e), $y.forEach((i) => {
      const s = document.createElement("button");
      s.type = "button", s.className = "tiptap-block-menu__item", s.setAttribute("data-turn-into", i.id), s.setAttribute("role", "menuitem"), s.innerHTML = `<i class="bi bi-${i.icon}"></i> <span>${i.label}</span>`, this.menuEl.appendChild(s);
    }), this.wrapper.appendChild(this.handleEl), this.wrapper.appendChild(this.menuEl);
  }
  /**
   * Bind event listeners.
   * @private
   */
  _bindEvents() {
    const t = this.editorInstance.contentElement;
    t && (t.addEventListener("mousemove", (i) => this._onMouseMove(i)), t.addEventListener("mouseleave", () => this._onMouseLeave())), this.handleEl.addEventListener("click", (i) => {
      i.stopPropagation(), this._toggleMenu();
    }), this.handleEl.addEventListener("mousedown", (i) => {
      i.preventDefault();
    }), this.menuEl.addEventListener("click", (i) => {
      i.stopPropagation();
      const s = i.target.closest("[data-action]");
      if (s) {
        this._executeAction(s.getAttribute("data-action"));
        return;
      }
      const r = i.target.closest("[data-turn-into]");
      r && this._executeTurnInto(r.getAttribute("data-turn-into"));
    }), document.addEventListener("click", (i) => {
      !this.menuEl.contains(i.target) && !this.handleEl.contains(i.target) && this._closeMenu();
    }), document.addEventListener("keydown", (i) => {
      i.key === "Escape" && this._isMenuOpen && this._closeMenu();
    });
    const e = (t == null ? void 0 : t.closest(".ProseMirror")) || t;
    e && e.addEventListener("scroll", () => {
      this._hideHandle(), this._closeMenu();
    });
  }
  /**
   * Handle mousemove over editor content to position the block handle.
   * @private
   * @param {MouseEvent} e
   */
  _onMouseMove(t) {
    if (this._isMenuOpen) return;
    const e = this._findTopLevelBlock(t.target);
    !e || e === this.currentBlock || (this.currentBlock = e, this._positionHandle(e));
  }
  /**
   * Handle mouse leaving the editor content area.
   * @private
   */
  _onMouseLeave() {
    this._isMenuOpen || (this._hideTimeout = setTimeout(() => {
      this._isMenuOpen || (this._hideHandle(), this.currentBlock = null);
    }, 300));
  }
  /**
   * Find the top-level ProseMirror node element from a target element.
   * @private
   * @param {HTMLElement} target
   * @returns {HTMLElement|null}
   */
  _findTopLevelBlock(t) {
    var s;
    if (!t || !t.closest) return null;
    const e = (s = this.editorInstance.contentElement) == null ? void 0 : s.querySelector(".ProseMirror");
    if (!e) return null;
    let i = t;
    for (; i && i.parentElement !== e; )
      i = i.parentElement;
    return !i || i === e ? null : i;
  }
  /**
   * Position the block handle to the left of a block element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _positionHandle(t) {
    if (!this.handleEl) return;
    clearTimeout(this._hideTimeout);
    const e = this.wrapper.getBoundingClientRect(), i = t.getBoundingClientRect();
    this.handleEl.style.display = "flex", this.handleEl.style.position = "absolute", this.handleEl.style.left = "-2px", this.handleEl.style.top = `${i.top - e.top}px`, this._resolveNodePos(t);
  }
  /**
   * Resolve the ProseMirror document position of a DOM element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _resolveNodePos(t) {
    try {
      const e = this.editor.view.posAtDOM(t, 0);
      if (e != null) {
        const i = this.editor.state.doc.resolve(e);
        this.currentNodePos = i.before(1);
      }
    } catch {
      this.currentNodePos = null;
    }
  }
  /**
   * Hide the block handle.
   * @private
   */
  _hideHandle() {
    this.handleEl && (this.handleEl.style.display = "none");
  }
  /**
   * Toggle the context menu.
   * @private
   */
  _toggleMenu() {
    this._isMenuOpen ? this._closeMenu() : this._openMenu();
  }
  /**
   * Open the context menu next to the handle.
   * @private
   */
  _openMenu() {
    if (!this.menuEl || !this.handleEl) return;
    this._isMenuOpen = !0;
    const t = this.handleEl.getBoundingClientRect();
    this.menuEl.style.display = "block", this.menuEl.style.position = "fixed", this.menuEl.style.left = `${t.right + 4}px`, this.menuEl.style.top = `${t.top}px`, requestAnimationFrame(() => {
      const e = this.menuEl.getBoundingClientRect();
      e.right > window.innerWidth - 8 && (this.menuEl.style.left = `${t.left - e.width - 4}px`), e.bottom > window.innerHeight - 8 && (this.menuEl.style.top = `${window.innerHeight - e.height - 8}px`);
    });
  }
  /**
   * Close the context menu.
   * @private
   */
  _closeMenu() {
    this.menuEl && (this.menuEl.style.display = "none"), this._isMenuOpen = !1;
  }
  /**
   * Execute a block action.
   * @private
   * @param {string} actionId
   */
  _executeAction(t) {
    if (this.currentNodePos == null) {
      this._closeMenu();
      return;
    }
    const { state: e } = this.editor, i = e.doc.nodeAt(this.currentNodePos);
    if (!i) {
      this._closeMenu();
      return;
    }
    switch (t) {
      case "duplicate":
        this._duplicateBlock(i);
        break;
      case "moveUp":
        this._moveBlock(-1);
        break;
      case "moveDown":
        this._moveBlock(1);
        break;
      case "delete":
        this._deleteBlock(i);
        break;
    }
    this._closeMenu(), this._hideHandle(), this.currentBlock = null;
  }
  /**
   * Duplicate the current block node.
   * @private
   * @param {Object} node - ProseMirror Node
   */
  _duplicateBlock(t) {
    const e = this.currentNodePos + t.nodeSize, i = t.toJSON();
    this.editor.chain().focus().insertContentAt(e, i).run();
  }
  /**
   * Move the current block up or down.
   * @private
   * @param {number} direction - -1 for up, 1 for down
   */
  _moveBlock(t) {
    const { state: e } = this.editor, { doc: i } = e, s = this.currentNodePos, r = i.nodeAt(s);
    if (!r) return;
    const o = s + r.nodeSize;
    if (t === -1) {
      const l = i.resolve(s);
      if (l.index(0) === 0) return;
      const a = l.before(1) - 1, d = i.resolve(a).before(1), u = r.toJSON();
      this.editor.chain().focus().deleteRange({ from: s, to: o }).insertContentAt(d, u).run();
    } else {
      if (o >= i.content.size) return;
      const l = i.nodeAt(o);
      if (!l) return;
      const a = o + l.nodeSize, c = r.toJSON();
      this.editor.chain().focus().deleteRange({ from: s, to: o }).insertContentAt(a - r.nodeSize, c).run();
    }
  }
  /**
   * Delete the current block node.
   * @private
   * @param {Object} node - ProseMirror Node
   */
  _deleteBlock(t) {
    const e = this.currentNodePos + t.nodeSize;
    this.editor.chain().focus().deleteRange({ from: this.currentNodePos, to: e }).run();
  }
  /**
   * Turn the current block into a different type.
   * @private
   * @param {string} typeId
   */
  _executeTurnInto(t) {
    if (this.currentNodePos == null) {
      this._closeMenu();
      return;
    }
    switch (this.editor.commands.setTextSelection(this.currentNodePos + 1), t) {
      case "paragraph":
        this.editor.chain().focus().setParagraph().run();
        break;
      case "heading1":
        this.editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "heading2":
        this.editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "heading3":
        this.editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bulletList":
        this.editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        this.editor.chain().focus().toggleOrderedList().run();
        break;
      case "blockquote":
        this.editor.chain().focus().toggleBlockquote().run();
        break;
      case "codeBlock":
        this.editor.chain().focus().toggleCodeBlock().run();
        break;
    }
    this._closeMenu(), this._hideHandle(), this.currentBlock = null;
  }
  /**
   * Destroy the block menu and clean up.
   */
  destroy() {
    this.handleEl && (this.handleEl.remove(), this.handleEl = null), this.menuEl && (this.menuEl.remove(), this.menuEl = null), this.currentBlock = null, this.currentNodePos = null, this.editor = null, this.editorInstance = null;
  }
}
function nt(n, t = {}, e = []) {
  const i = document.createElement(n);
  return Object.entries(t).forEach(([s, r]) => {
    s === "className" ? i.className = r : s === "style" && typeof r == "object" ? Object.assign(i.style, r) : s.startsWith("on") && typeof r == "function" ? i.addEventListener(s.slice(2).toLowerCase(), r) : s === "dataset" && typeof r == "object" ? Object.entries(r).forEach(([o, l]) => {
      i.dataset[o] = l;
    }) : i.setAttribute(s, r);
  }), e.forEach((s) => {
    typeof s == "string" ? i.appendChild(document.createTextNode(s)) : s instanceof HTMLElement && i.appendChild(s);
  }), i;
}
function Or() {
  var t;
  const n = ((t = navigator.userAgentData) == null ? void 0 : t.platform) || navigator.platform || "";
  return /mac/i.test(n) ? "mac" : /linux/i.test(n) ? "linux" : "windows";
}
function qy(n) {
  const e = Or() === "mac";
  return n.replace(/Mod/g, e ? "⌘" : "Ctrl").replace(/Alt/g, e ? "⌥" : "Alt").replace(/Shift/g, e ? "⇧" : "Shift").replace(/\+/g, e ? "" : "+");
}
const Fy = [
  {
    title: "Text Formatting",
    shortcuts: [
      { label: "Bold", keys: "Mod+B" },
      { label: "Italic", keys: "Mod+I" },
      { label: "Underline", keys: "Mod+U" },
      { label: "Strikethrough", keys: "Mod+Shift+X" },
      { label: "Code", keys: "Mod+E" },
      { label: "Highlight", keys: "Mod+Shift+H" }
    ]
  },
  {
    title: "Paragraphs & Headings",
    shortcuts: [
      { label: "Normal text", keys: "Mod+Alt+0" },
      { label: "Heading 1", keys: "Mod+Alt+1" },
      { label: "Heading 2", keys: "Mod+Alt+2" },
      { label: "Heading 3", keys: "Mod+Alt+3" },
      { label: "Heading 4", keys: "Mod+Alt+4" }
    ]
  },
  {
    title: "Lists & Blocks",
    shortcuts: [
      { label: "Bullet List", keys: "Mod+Shift+8" },
      { label: "Ordered List", keys: "Mod+Shift+7" },
      { label: "Blockquote", keys: "Mod+Shift+B" },
      { label: "Code Block", keys: "Mod+Alt+C" },
      { label: "Horizontal Rule", keys: "Mod+Alt+R" }
    ]
  },
  {
    title: "Editing",
    shortcuts: [
      { label: "Undo", keys: "Mod+Z" },
      { label: "Redo", keys: "Mod+Shift+Z" },
      { label: "Select All", keys: "Mod+A" },
      { label: "Copy", keys: "Mod+C" },
      { label: "Paste", keys: "Mod+V" },
      { label: "Cut", keys: "Mod+X" }
    ]
  },
  {
    title: "Navigation",
    shortcuts: [
      { label: "Slash Commands", keys: "/" },
      { label: "Keyboard Shortcuts", keys: "Mod+/" }
    ]
  }
];
class Vy {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(t) {
    this.editorInstance = t, this._overlay = null, this._visible = !1, this._handleKeyDown = this._handleKeyDown.bind(this), document.addEventListener("keydown", this._handleKeyDown);
  }
  /**
   * Handle global keydown for Ctrl+/ (Cmd+/) shortcut.
   * @private
   * @param {KeyboardEvent} e
   */
  _handleKeyDown(t) {
    (Or() === "mac" ? t.metaKey : t.ctrlKey) && t.key === "/" && (t.preventDefault(), this.toggle()), t.key === "Escape" && this._visible && this.close();
  }
  /**
   * Toggle the shortcuts modal.
   */
  toggle() {
    this._visible ? this.close() : this.open();
  }
  /**
   * Open the shortcuts modal.
   */
  open() {
    if (this._visible) return;
    this._overlay || this._build(), this._visible = !0, this._overlay.offsetHeight, this._overlay.classList.add("tiptap-shortcuts-overlay--visible"), this._overlay.setAttribute("aria-hidden", "false");
    const t = this._overlay.querySelector(".tiptap-shortcuts-modal__close");
    t && t.focus();
  }
  /**
   * Close the shortcuts modal.
   */
  close() {
    var t;
    !this._visible || !this._overlay || (this._visible = !1, this._overlay.classList.remove("tiptap-shortcuts-overlay--visible"), this._overlay.setAttribute("aria-hidden", "true"), (t = this.editorInstance.editor) == null || t.commands.focus());
  }
  /**
   * Build the modal DOM structure.
   * @private
   */
  _build() {
    this._overlay = nt("div", {
      className: "tiptap-shortcuts-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Keyboard Shortcuts",
      "aria-hidden": "true"
    }), this._overlay.addEventListener("click", (s) => {
      s.target === this._overlay && this.close();
    });
    const t = nt("div", { className: "tiptap-shortcuts-modal" }), e = nt("div", { className: "tiptap-shortcuts-modal__header" }, [
      nt("h3", { className: "tiptap-shortcuts-modal__title" }, ["Keyboard Shortcuts"]),
      nt("button", {
        className: "tiptap-shortcuts-modal__close",
        "aria-label": "Close",
        type: "button",
        onClick: () => this.close()
      }, ["×"])
    ]), i = nt("div", { className: "tiptap-shortcuts-modal__body" });
    Fy.forEach((s) => {
      i.appendChild(
        nt("div", { className: "tiptap-shortcuts__group-title" }, [s.title])
      ), s.shortcuts.forEach((r) => {
        const o = qy(r.keys), l = this._splitKeys(o), a = nt("span", { className: "tiptap-shortcuts__keys" });
        l.forEach((c) => {
          a.appendChild(
            nt("kbd", { className: "tiptap-shortcuts__key" }, [c])
          );
        }), i.appendChild(
          nt("div", { className: "tiptap-shortcuts__item" }, [
            nt("span", { className: "tiptap-shortcuts__label" }, [r.label]),
            a
          ])
        );
      });
    }), t.appendChild(e), t.appendChild(i), this._overlay.appendChild(t), document.body.appendChild(this._overlay);
  }
  /**
   * Split a formatted shortcut into individual key parts.
   * For Mac: '⌘B' → ['⌘', 'B'], '⌘⇧H' → ['⌘', '⇧', 'H']
   * For Win: 'Ctrl+Shift+H' → ['Ctrl', 'Shift', 'H']
   * @private
   * @param {string} formatted
   * @returns {string[]}
   */
  _splitKeys(t) {
    if (Or() === "mac") {
      const e = [];
      let i = "";
      for (const s of t)
        "⌘⇧⌥".includes(s) ? (i && e.push(i), e.push(s), i = "") : i += s;
      return i && e.push(i), e.length ? e : [t];
    }
    return t.split("+").map((e) => e.trim()).filter(Boolean);
  }
  /**
   * Clean up DOM and event listeners.
   */
  destroy() {
    document.removeEventListener("keydown", this._handleKeyDown), this._overlay && (this._overlay.remove(), this._overlay = null), this._visible = !1;
  }
}
class jy {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(t) {
    this.editorInstance = t, this.wrapper = t.wrapper, this._liveRegion = null, this._toolbarButtons = [], this._focusedIndex = 0, this._handleToolbarKeyDown = this._handleToolbarKeyDown.bind(this), this._init();
  }
  /**
   * Initialize all accessibility enhancements.
   * @private
   */
  _init() {
    this._setupWrapperAria(), this._setupToolbarAria(), this._setupContentAria(), this._createLiveRegion();
  }
  /**
   * Set ARIA attributes on the editor wrapper.
   * @private
   */
  _setupWrapperAria() {
    this.wrapper.setAttribute("role", "application"), this.wrapper.setAttribute("aria-label", "Rich text editor");
  }
  /**
   * Set up roving tabindex and ARIA for toolbar buttons.
   * @private
   */
  _setupToolbarAria() {
    const t = this.wrapper.querySelector("[data-tiptap-toolbar]");
    t && (t.setAttribute("role", "toolbar"), t.setAttribute("aria-label", "Text formatting"), t.setAttribute("aria-orientation", "horizontal"), this._toolbarButtons = Array.from(
      t.querySelectorAll(".tiptap-toolbar__button")
    ), this._toolbarButtons.length !== 0 && (this._toolbarButtons.forEach((e, i) => {
      e.setAttribute("tabindex", i === 0 ? "0" : "-1");
    }), t.addEventListener("keydown", this._handleToolbarKeyDown)));
  }
  /**
   * Set ARIA attributes on the content/editor area.
   * @private
   */
  _setupContentAria() {
    const t = this.wrapper.querySelector("[data-tiptap-content]");
    if (!t) return;
    t.setAttribute("role", "textbox"), t.setAttribute("aria-multiline", "true"), t.setAttribute("aria-label", "Editor content");
    const e = t.querySelector(".ProseMirror");
    e && e.setAttribute("aria-label", "Editor content area");
  }
  /**
   * Create an ARIA live region for screen reader announcements.
   * @private
   */
  _createLiveRegion() {
    this._liveRegion = nt("div", {
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
      className: "tiptap-sr-only"
    }), this.wrapper.appendChild(this._liveRegion);
  }
  /**
   * Announce a message to screen readers via the live region.
   * @param {string} message
   */
  announce(t) {
    this._liveRegion && (this._liveRegion.textContent = "", requestAnimationFrame(() => {
      this._liveRegion.textContent = t;
    }));
  }
  /**
   * Handle arrow key navigation in toolbar (roving tabindex pattern).
   * @private
   * @param {KeyboardEvent} e
   */
  _handleToolbarKeyDown(t) {
    var s;
    const e = this._toolbarButtons;
    if (e.length === 0) return;
    let i = !1;
    switch (t.key) {
      case "ArrowRight":
      case "ArrowDown": {
        this._focusedIndex = (this._focusedIndex + 1) % e.length, i = !0;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        this._focusedIndex = (this._focusedIndex - 1 + e.length) % e.length, i = !0;
        break;
      }
      case "Home": {
        this._focusedIndex = 0, i = !0;
        break;
      }
      case "End": {
        this._focusedIndex = e.length - 1, i = !0;
        break;
      }
      case "Escape": {
        (s = this.editorInstance.editor) == null || s.commands.focus(), i = !0;
        break;
      }
    }
    i && (t.preventDefault(), e.forEach((r, o) => {
      r.setAttribute("tabindex", o === this._focusedIndex ? "0" : "-1");
    }), e[this._focusedIndex].focus());
  }
  /**
   * Refresh toolbar buttons list (call after toolbar re-render).
   */
  refreshToolbar() {
    const t = this.wrapper.querySelector("[data-tiptap-toolbar]");
    t && (this._toolbarButtons = Array.from(
      t.querySelectorAll(".tiptap-toolbar__button")
    ), this._focusedIndex = 0, this._toolbarButtons.forEach((e, i) => {
      e.setAttribute("tabindex", i === 0 ? "0" : "-1");
    }));
  }
  /**
   * Clean up event listeners and DOM.
   */
  destroy() {
    const t = this.wrapper.querySelector("[data-tiptap-toolbar]");
    t && t.removeEventListener("keydown", this._handleToolbarKeyDown), this._liveRegion && (this._liveRegion.remove(), this._liveRegion = null), this._toolbarButtons = [];
  }
}
const ta = [
  { id: "desktop", label: "Desktop", icon: "bi-display", width: null },
  { id: "tablet", label: "Tablet (768px)", icon: "bi-tablet", width: 768 },
  { id: "mobile", label: "Mobile (375px)", icon: "bi-phone", width: 375 }
];
class Uy {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(t) {
    this.editorInstance = t, this.wrapper = t.wrapper, this.contentEl = this.wrapper.querySelector("[data-tiptap-content]"), this.currentMode = "desktop", this._bar = null, this._buttons = /* @__PURE__ */ new Map(), this._sizeLabel = null, this._build();
  }
  /**
   * Build the preview bar and insert it into the editor wrapper.
   * @private
   */
  _build() {
    this._bar = nt("div", {
      className: "tiptap-preview-bar",
      role: "toolbar",
      "aria-label": "Responsive preview"
    }), this._bar.appendChild(
      nt("span", { className: "tiptap-preview-bar__label" }, ["Preview:"])
    ), ta.forEach((e) => {
      const i = nt("button", {
        className: `tiptap-preview-bar__btn${e.id === "desktop" ? " tiptap-preview-bar__btn--active" : ""}`,
        type: "button",
        "aria-label": e.label,
        title: e.label,
        "aria-pressed": e.id === "desktop" ? "true" : "false",
        dataset: { previewMode: e.id }
      }, [
        nt("i", { className: `bi ${e.icon}` })
      ]);
      i.addEventListener("click", () => this.setMode(e.id)), this._buttons.set(e.id, i), this._bar.appendChild(i);
    }), this._sizeLabel = nt("span", { className: "tiptap-preview-bar__size" }, ["100%"]), this._bar.appendChild(this._sizeLabel);
    const t = this.wrapper.querySelector(".tiptap-editor__footer");
    if (t)
      this.wrapper.insertBefore(this._bar, t);
    else {
      const e = this.wrapper.querySelector("[data-tiptap-input]");
      e ? this.wrapper.insertBefore(this._bar, e) : this.wrapper.appendChild(this._bar);
    }
  }
  /**
   * Set the preview mode.
   * @param {string} modeId - 'desktop', 'tablet', or 'mobile'
   */
  setMode(t) {
    const e = ta.find((i) => i.id === t);
    !e || t === this.currentMode || (this.currentMode = t, this._buttons.forEach((i, s) => {
      const r = s === t;
      i.classList.toggle("tiptap-preview-bar__btn--active", r), i.setAttribute("aria-pressed", r ? "true" : "false");
    }), this.contentEl && (this.contentEl.classList.remove(
      "tiptap-editor__content--preview-tablet",
      "tiptap-editor__content--preview-mobile"
    ), t === "tablet" ? this.contentEl.classList.add("tiptap-editor__content--preview-tablet") : t === "mobile" && this.contentEl.classList.add("tiptap-editor__content--preview-mobile")), this._sizeLabel && (this._sizeLabel.textContent = e.width ? `${e.width}px` : "100%"), this.editorInstance.a11y && this.editorInstance.a11y.announce(`Preview mode: ${e.label}`));
  }
  /**
   * Get current preview mode.
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
  }
  /**
   * Reset to desktop mode.
   */
  reset() {
    this.setMode("desktop");
  }
  /**
   * Clean up DOM.
   */
  destroy() {
    this._bar && (this._bar.remove(), this._bar = null), this.contentEl && this.contentEl.classList.remove(
      "tiptap-editor__content--preview-tablet",
      "tiptap-editor__content--preview-mobile"
    ), this._buttons.clear(), this._sizeLabel = null;
  }
}
class Wy {
  /**
   * @param {HTMLElement} wrapperElement - The .tiptap-editor-wrapper element
   * @param {TiptapEditorConfig} config - Editor configuration from data-config
   */
  constructor(t, e = {}) {
    this.wrapper = t, this.config = e, this.contentElement = t.querySelector("[data-tiptap-content]"), this.inputElement = t.querySelector("[data-tiptap-input]"), this.toolbarElement = t.querySelector("[data-tiptap-toolbar]"), this.editor = null, this.toolbar = null, this.isDisabled = t.hasAttribute("data-disabled"), this.aiPanel = null, this.blockMenu = null, this.shortcuts = null, this.a11y = null, this.responsivePreview = null, this._listeners = {}, this._init();
  }
  /**
   * Initialize the Tiptap editor instance with configured extensions.
   * @private
   */
  _init() {
    var i;
    const t = this._buildExtensions(), e = this._getInitialContent();
    this.editor = new um({
      element: this.contentElement,
      extensions: t,
      content: e,
      editable: !this.isDisabled,
      autofocus: !1,
      editorProps: {
        attributes: {
          class: "ProseMirror"
        }
      },
      onUpdate: ({ editor: s }) => {
        this._syncToInput(), this._emit("change", { json: s.getJSON(), html: s.getHTML() });
      },
      onFocus: ({ editor: s, event: r }) => {
        this.wrapper.classList.add("tiptap-editor--focused"), this._emit("focus", { editor: s, event: r });
      },
      onBlur: ({ editor: s, event: r }) => {
        this.wrapper.classList.remove("tiptap-editor--focused"), this._emit("blur", { editor: s, event: r });
      },
      onSelectionUpdate: ({ editor: s }) => {
        this._emit("selectionUpdate", { editor: s }), this.toolbar && this.toolbar.updateActiveStates(s);
      },
      onTransaction: ({ editor: s }) => {
        this.toolbar && this.toolbar.updateActiveStates(s);
      }
    }), this.toolbarElement && (this.toolbar = new Dy(this.toolbarElement, this.editor, this.config.toolbar || {})), (i = this.config.ai) != null && i.enabled && (this.aiPanel = new By(this, this.config.ai), this.wrapper.addEventListener("tiptap:toggle-ai-panel", () => {
      this.openAiPanel();
    })), this.blockMenu = new zy(this), this.a11y = new jy(this), this.shortcuts = new Vy(this), this.responsivePreview = new Uy(this), this._initTheme(), this.wrapper.addEventListener("tiptap:insert-image", () => {
      this.toolbar && this.toolbar._handleImage();
    }), this.wrapper.addEventListener("tiptap:toggle-dark-mode", () => {
      const s = this.getTheme(), r = s === "auto" ? "dark" : s === "dark" ? "light" : "auto";
      this.setTheme(r);
    }), this.wrapper.addEventListener("tiptap:show-shortcuts", () => {
      this.openShortcuts();
    }), this._applyEditorDimensions(), this._syncToInput();
  }
  /**
   * Build the list of Tiptap extensions based on configuration.
   * @private
   * @returns {Array} Array of Tiptap extensions
   */
  _buildExtensions() {
    var i;
    const t = this.config.extensions || [], e = [];
    return e.push(
      fg.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      })
    ), t.includes("underline") && e.push(mg), t.includes("link") && e.push(
      zg.configure({
        openOnClick: !1,
        HTMLAttributes: {
          rel: null
        }
      })
    ), t.includes("textAlign") && e.push(
      qg.configure({
        types: ["heading", "paragraph"]
      })
    ), e.push(
      Fg.configure({
        placeholder: this.config.placeholder || "Start writing..."
      })
    ), t.includes("characterCount") && e.push(Vg), t.includes("subscript") && e.push(jg), t.includes("superscript") && e.push(Ug), t.includes("color") && (e.push(Kg), e.push(Jg)), t.includes("highlight") && e.push(
      Xg.configure({
        multicolor: !0
      })
    ), t.includes("customImage") && e.push(uy), t.includes("customVideo") && e.push(py), t.includes("table") && (e.push(
      ey.configure({
        resizable: !0
      })
    ), e.push(ny), e.push(iy), e.push(sy)), t.includes("bootstrapRow") && e.push(ry), (t.includes("bootstrapCol") || t.includes("bootstrapRow")) && (e.some((s) => s.name === "bootstrapCol") || e.push(oy)), t.includes("bootstrapAlert") && e.push(ly), t.includes("bootstrapCard") && e.push(ay), t.includes("bootstrapButton") && e.push(cy), t.includes("gallery") && (e.push(hy), e.push(fy)), t.includes("slashCommands") && e.push(Sy.configure({
      commands: ((i = this.config.slashCommands) == null ? void 0 : i.commands) || null
    })), e.push(my), e;
  }
  /**
   * Parse the initial content from the hidden input.
   * @private
   * @returns {Object|string|null}
   */
  _getInitialContent() {
    if (!this.inputElement) return null;
    const t = this.inputElement.value;
    if (!t) return null;
    try {
      const e = JSON.parse(t);
      return e && e.type === "doc", e;
    } catch {
      return t;
    }
  }
  /**
   * Sync editor JSON content to the hidden input element.
   * @private
   */
  _syncToInput() {
    if (!this.inputElement || !this.editor) return;
    const t = this.editor.getJSON();
    this.inputElement.value = JSON.stringify(t);
  }
  // ─── Public API ────────────────────────────────────────────────
  /**
   * Get editor content as Tiptap JSON.
   * @returns {Object}
   */
  getJSON() {
    var t;
    return ((t = this.editor) == null ? void 0 : t.getJSON()) ?? {};
  }
  /**
   * Get editor content as HTML string.
   * @returns {string}
   */
  getHTML() {
    var t;
    return ((t = this.editor) == null ? void 0 : t.getHTML()) ?? "";
  }
  /**
   * Get plain text content.
   * @returns {string}
   */
  getText() {
    var t;
    return ((t = this.editor) == null ? void 0 : t.getText()) ?? "";
  }
  /**
   * Set editor content.
   * @param {Object|string} content - Tiptap JSON object or HTML string
   * @param {boolean} emitUpdate - Whether to trigger update events
   */
  setContent(t, e = !0) {
    this.editor && (this.editor.commands.setContent(t, e), this._syncToInput());
  }
  /**
   * Clear all editor content.
   */
  clearContent() {
    this.editor && (this.editor.commands.clearContent(), this._syncToInput());
  }
  /**
   * Check if the editor content is empty.
   * @returns {boolean}
   */
  isEmpty() {
    var t;
    return ((t = this.editor) == null ? void 0 : t.isEmpty) ?? !0;
  }
  /**
   * Get the character count.
   * @returns {number}
   */
  getCharacterCount() {
    var t, e;
    return ((e = (t = this.editor) == null ? void 0 : t.storage.characterCount) == null ? void 0 : e.characters()) ?? 0;
  }
  /**
   * Enable or disable the editor.
   * @param {boolean} editable
   */
  setEditable(t) {
    this.editor && (this.editor.setEditable(t), this.isDisabled = !t, t ? this.wrapper.removeAttribute("data-disabled") : this.wrapper.setAttribute("data-disabled", ""));
  }
  /**
   * Focus the editor.
   * @param {string} position - 'start', 'end', or 'all'
   */
  focus(t = "end") {
    var e;
    (e = this.editor) == null || e.commands.focus(t);
  }
  /**
   * Open/toggle the AI panel.
   */
  openAiPanel() {
    this.aiPanel && this.aiPanel.toggle();
  }
  /**
   * Toggle dark mode on the editor.
   * @param {'light'|'dark'|'auto'} theme
   */
  setTheme(t = "auto") {
    t === "auto" ? this.wrapper.removeAttribute("data-theme") : this.wrapper.setAttribute("data-theme", t), this._emit("themeChange", { theme: t });
  }
  /**
   * Get current theme setting.
   * @returns {string} 'light', 'dark', or 'auto'
   */
  getTheme() {
    return this.wrapper.getAttribute("data-theme") || "auto";
  }
  /**
   * Initialize theme from config or data attribute.
   * @private
   */
  _initTheme() {
    const t = this.config.theme;
    t && t !== "auto" && this.wrapper.setAttribute("data-theme", t);
  }
  /**
   * Apply editor height, max-height, and resize settings from config.
   *
   * Config options:
   *  - minHeight: CSS value (e.g. '200px', '10rem') – minimum editor height
   *  - maxHeight: CSS value (e.g. '500px', '60vh') – enables scrollbar when exceeded
   *  - height: CSS value (e.g. '400px') – fixed default height
   *  - resizable: boolean – allows user to drag-resize the editor vertically
   *
   * @private
   */
  _applyEditorDimensions() {
    const { minHeight: t, maxHeight: e, height: i, resizable: s } = this.config;
    t && this.wrapper.style.setProperty("--tiptap-min-height", t), e && (this.contentElement.style.maxHeight = e, this.contentElement.style.overflowY = "auto"), i && (this.contentElement.style.height = i, this.contentElement.style.overflowY = "auto"), s && this._addResizeHandle();
  }
  /**
   * Add a drag handle at the bottom of the editor for vertical resizing.
   * @private
   */
  _addResizeHandle() {
    const t = document.createElement("div");
    t.className = "tiptap-editor__resize-handle", t.title = "Drag to resize", this.wrapper.appendChild(t);
    let e = 0, i = 0;
    const s = (o) => {
      const l = i + (o.clientY - e), a = parseInt(getComputedStyle(this.wrapper).getPropertyValue("--tiptap-min-height")) || 100;
      l >= a && (this.contentElement.style.height = l + "px", this.contentElement.style.overflowY = "auto");
    }, r = () => {
      document.removeEventListener("mousemove", s), document.removeEventListener("mouseup", r), this.wrapper.classList.remove("tiptap-editor--resizing"), document.body.style.userSelect = "";
    };
    t.addEventListener("mousedown", (o) => {
      o.preventDefault(), e = o.clientY, i = this.contentElement.offsetHeight, this.wrapper.classList.add("tiptap-editor--resizing"), document.body.style.userSelect = "none", document.addEventListener("mousemove", s), document.addEventListener("mouseup", r);
    });
  }
  /**
   * Open keyboard shortcuts help modal.
   */
  openShortcuts() {
    this.shortcuts && this.shortcuts.open();
  }
  /**
   * Destroy the editor instance and clean up.
   */
  destroy() {
    this.responsivePreview && (this.responsivePreview.destroy(), this.responsivePreview = null), this.shortcuts && (this.shortcuts.destroy(), this.shortcuts = null), this.a11y && (this.a11y.destroy(), this.a11y = null), this.blockMenu && (this.blockMenu.destroy(), this.blockMenu = null), this.aiPanel && (this.aiPanel.destroy(), this.aiPanel = null), this.toolbar && (this.toolbar.destroy(), this.toolbar = null), this.editor && (this.editor.destroy(), this.editor = null), this._listeners = {}, this.wrapper.removeAttribute("data-initialized");
  }
  // ─── Event System ──────────────────────────────────────────────
  /**
   * Register an event listener.
   * @param {string} event - Event name: 'change', 'focus', 'blur', 'selectionUpdate'
   * @param {Function} callback
   * @returns {TiptapEditor} For chaining
   */
  on(t, e) {
    return this._listeners[t] || (this._listeners[t] = []), this._listeners[t].push(e), this;
  }
  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} callback
   * @returns {TiptapEditor}
   */
  off(t, e) {
    return this._listeners[t] ? (this._listeners[t] = this._listeners[t].filter((i) => i !== e), this) : this;
  }
  /**
   * Emit an event to all registered listeners.
   * @private
   * @param {string} event
   * @param {*} data
   */
  _emit(t, e) {
    this._listeners[t] && this._listeners[t].forEach((i) => i(e));
  }
}
class Gy {
  /**
   * @param {Object} options
   * @param {string} options.browseUrl - API endpoint for browsing media
   * @param {string} options.uploadUrl - API endpoint for uploading media
   * @param {Function} options.onSelect - Callback when media is selected
   * @param {string} [options.type] - Filter type: 'image' | 'video' | null (all)
   */
  constructor(t = {}) {
    this.browseUrl = t.browseUrl || null, this.uploadUrl = t.uploadUrl || null, this.onSelect = t.onSelect || (() => {
    }), this.type = t.type || null, this.modal = null, this.currentPage = 1, this.searchQuery = "";
  }
  /**
   * Open the media browser modal.
   */
  open() {
    this.modal && this.modal.remove(), this.modal = this._createModal(), document.body.appendChild(this.modal), document.body.style.overflow = "hidden", this._loadMedia(), setTimeout(() => {
      const t = this.modal.querySelector("[data-media-search]");
      t && t.focus();
    }, 100);
  }
  /**
   * Close the media browser modal.
   */
  close() {
    this.modal && (this.modal.remove(), this.modal = null), document.body.style.overflow = "";
  }
  /**
   * Create the modal DOM structure.
   * @private
   * @returns {HTMLElement}
   */
  _createModal() {
    const t = document.createElement("div");
    t.className = "tiptap-media-browser__overlay", t.innerHTML = `
      <div class="tiptap-media-browser__dialog">
        <div class="tiptap-media-browser__header">
          <h5 class="tiptap-media-browser__title">Media Browser</h5>
          <button type="button" class="tiptap-media-browser__close" data-media-close aria-label="Close">&times;</button>
        </div>
        <div class="tiptap-media-browser__toolbar">
          <input type="text" data-media-search placeholder="Search files..." class="tiptap-media-browser__search">
          <div class="tiptap-media-browser__filters">
            <button type="button" data-media-filter="" class="tiptap-media-browser__filter-btn active">All</button>
            <button type="button" data-media-filter="image" class="tiptap-media-browser__filter-btn">Images</button>
            <button type="button" data-media-filter="video" class="tiptap-media-browser__filter-btn">Videos</button>
          </div>
          <label class="tiptap-media-browser__upload-btn">
            <input type="file" data-media-upload accept="image/*,video/*" style="display:none">
            <span>Upload</span>
          </label>
        </div>
        <div class="tiptap-media-browser__body" data-media-grid>
          <div class="tiptap-media-browser__loading">Loading...</div>
        </div>
        <div class="tiptap-media-browser__footer" data-media-pagination></div>
      </div>
    `, t.querySelector("[data-media-close]").addEventListener("click", () => this.close()), t.addEventListener("click", (o) => {
      o.target === t && this.close();
    });
    const e = (o) => {
      o.key === "Escape" && (this.close(), document.removeEventListener("keydown", e));
    };
    document.addEventListener("keydown", e);
    const i = t.querySelector("[data-media-search]");
    let s;
    i.addEventListener("input", (o) => {
      clearTimeout(s), this.searchQuery = o.target.value, s = setTimeout(() => {
        this.currentPage = 1, this._loadMedia();
      }, 300);
    }), t.querySelectorAll("[data-media-filter]").forEach((o) => {
      o.addEventListener("click", () => {
        t.querySelectorAll("[data-media-filter]").forEach((l) => l.classList.remove("active")), o.classList.add("active"), this.type = o.getAttribute("data-media-filter") || null, this.currentPage = 1, this._loadMedia();
      });
    });
    const r = t.querySelector("[data-media-upload]");
    return r && r.addEventListener("change", (o) => this._handleUpload(o)), t;
  }
  /**
   * Load media from the browse API.
   * @private
   */
  async _loadMedia() {
    if (!this.browseUrl || !this.modal) return;
    const t = this.modal.querySelector("[data-media-grid]");
    t.innerHTML = '<div class="tiptap-media-browser__loading">Loading...</div>';
    try {
      const e = new URLSearchParams();
      e.set("page", String(this.currentPage)), this.type && e.set("type", this.type), this.searchQuery && e.set("search", this.searchQuery);
      const i = await fetch(`${this.browseUrl}?${e.toString()}`, {
        headers: { Accept: "application/json" }
      });
      if (!i.ok) throw new Error("Failed to load media");
      const s = await i.json();
      this._renderGrid(s.data || []), this._renderPagination(s.pagination || {});
    } catch (e) {
      t.innerHTML = '<div class="tiptap-media-browser__error">Failed to load media.</div>', console.error("[MediaBrowser]", e);
    }
  }
  /**
   * Render media items in the grid.
   * @private
   * @param {Array<Object>} items
   */
  _renderGrid(t) {
    var i;
    const e = (i = this.modal) == null ? void 0 : i.querySelector("[data-media-grid]");
    if (e) {
      if (t.length === 0) {
        e.innerHTML = '<div class="tiptap-media-browser__empty">No media found.</div>';
        return;
      }
      e.innerHTML = "", t.forEach((s) => {
        var o;
        const r = document.createElement("div");
        r.className = "tiptap-media-browser__item", r.setAttribute("data-media-id", s.id), (o = s.mime_type) != null && o.startsWith("image/") ? r.innerHTML = `<img src="${s.thumbnail || s.url}" alt="${s.alt || s.filename}" loading="lazy">` : r.innerHTML = '<div class="tiptap-media-browser__video-thumb"><i class="bi bi-play-btn"></i></div>', r.innerHTML += `<div class="tiptap-media-browser__item-name">${s.filename}</div>`, r.addEventListener("click", () => {
          this.onSelect(s), this.close();
        }), e.appendChild(r);
      });
    }
  }
  /**
   * Render pagination controls.
   * @private
   * @param {Object} pagination
   */
  _renderPagination(t) {
    var i;
    const e = (i = this.modal) == null ? void 0 : i.querySelector("[data-media-pagination]");
    if (e && (e.innerHTML = "", !(!t.last_page || t.last_page <= 1)))
      for (let s = 1; s <= t.last_page; s++) {
        const r = document.createElement("button");
        r.type = "button", r.className = "tiptap-media-browser__page-btn", s === t.current_page && r.classList.add("active"), r.textContent = String(s), r.addEventListener("click", () => {
          this.currentPage = s, this._loadMedia();
        }), e.appendChild(r);
      }
  }
  /**
   * Handle file upload from the modal.
   * @private
   */
  async _handleUpload(t) {
    var i, s;
    const e = (i = t.target.files) == null ? void 0 : i[0];
    if (!(!e || !this.uploadUrl)) {
      try {
        const r = new FormData();
        r.append("file", e);
        const o = ((s = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : s.content) || "";
        if (!(await fetch(this.uploadUrl, {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": o,
            Accept: "application/json"
          },
          body: r
        })).ok) throw new Error("Upload failed");
        this._loadMedia();
      } catch (r) {
        console.error("[MediaBrowser] Upload failed:", r), alert("Upload failed. Please try again.");
      }
      t.target.value = "";
    }
  }
}
const Rn = /* @__PURE__ */ new Map();
function ea() {
  const n = document.querySelectorAll("[data-tiptap-editor]"), t = [];
  return n.forEach((e) => {
    if (e.dataset.initialized === "true") return;
    const i = e.dataset.config, s = i ? JSON.parse(i) : {}, r = new Wy(e, s), o = e.id || `tiptap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    e.id = o, e.dataset.initialized = "true", Rn.set(o, r), t.push(r);
  }), t;
}
function Yy(n) {
  return Rn.get(n);
}
function Xy() {
  return Rn;
}
function Qy(n) {
  const t = Rn.get(n);
  t && (t.destroy(), Rn.delete(n));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ea) : ea();
export {
  jy as AccessibilityManager,
  By as AiPanel,
  zy as BlockMenu,
  Vy as KeyboardShortcuts,
  Gy as MediaBrowser,
  Uy as ResponsivePreview,
  Wy as TiptapEditor,
  Qy as destroyEditor,
  Xy as getAllEditors,
  Yy as getEditor,
  ea as initEditors
};
//# sourceMappingURL=tiptap-editor.es.js.map
