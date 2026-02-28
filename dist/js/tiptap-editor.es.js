var ld = Object.defineProperty;
var ad = (n, e, t) => e in n ? ld(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var ms = (n, e, t) => ad(n, typeof e != "symbol" ? e + "" : e, t);
function Z(n) {
  this.content = n;
}
Z.prototype = {
  constructor: Z,
  find: function(n) {
    for (var e = 0; e < this.content.length; e += 2)
      if (this.content[e] === n) return e;
    return -1;
  },
  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(n) {
    var e = this.find(n);
    return e == -1 ? void 0 : this.content[e + 1];
  },
  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(n, e, t) {
    var i = t && t != n ? this.remove(t) : this, s = i.find(n), r = i.content.slice();
    return s == -1 ? r.push(t || n, e) : (r[s + 1] = e, t && (r[s] = t)), new Z(r);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(n) {
    var e = this.find(n);
    if (e == -1) return this;
    var t = this.content.slice();
    return t.splice(e, 2), new Z(t);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(n, e) {
    return new Z([n, e].concat(this.remove(n).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(n, e) {
    var t = this.remove(n).content.slice();
    return t.push(n, e), new Z(t);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(n, e, t) {
    var i = this.remove(e), s = i.content.slice(), r = i.find(n);
    return s.splice(r == -1 ? s.length : r, 0, e, t), new Z(s);
  },
  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(n) {
    for (var e = 0; e < this.content.length; e += 2)
      n(this.content[e], this.content[e + 1]);
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(n) {
    return n = Z.from(n), n.size ? new Z(n.content.concat(this.subtract(n).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(n) {
    return n = Z.from(n), n.size ? new Z(this.subtract(n).content.concat(n.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(n) {
    var e = this;
    n = Z.from(n);
    for (var t = 0; t < n.content.length; t += 2)
      e = e.remove(n.content[t]);
    return e;
  },
  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var n = {};
    return this.forEach(function(e, t) {
      n[e] = t;
    }), n;
  },
  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1;
  }
};
Z.from = function(n) {
  if (n instanceof Z) return n;
  var e = [];
  if (n) for (var t in n) e.push(t, n[t]);
  return new Z(e);
};
function Ql(n, e, t) {
  for (let i = 0; ; i++) {
    if (i == n.childCount || i == e.childCount)
      return n.childCount == e.childCount ? null : t;
    let s = n.child(i), r = e.child(i);
    if (s == r) {
      t += s.nodeSize;
      continue;
    }
    if (!s.sameMarkup(r))
      return t;
    if (s.isText && s.text != r.text) {
      for (let o = 0; s.text[o] == r.text[o]; o++)
        t++;
      return t;
    }
    if (s.content.size || r.content.size) {
      let o = Ql(s.content, r.content, t + 1);
      if (o != null)
        return o;
    }
    t += s.nodeSize;
  }
}
function Zl(n, e, t, i) {
  for (let s = n.childCount, r = e.childCount; ; ) {
    if (s == 0 || r == 0)
      return s == r ? null : { a: t, b: i };
    let o = n.child(--s), l = e.child(--r), a = o.nodeSize;
    if (o == l) {
      t -= a, i -= a;
      continue;
    }
    if (!o.sameMarkup(l))
      return { a: t, b: i };
    if (o.isText && o.text != l.text) {
      let c = 0, d = Math.min(o.text.length, l.text.length);
      for (; c < d && o.text[o.text.length - c - 1] == l.text[l.text.length - c - 1]; )
        c++, t--, i--;
      return { a: t, b: i };
    }
    if (o.content.size || l.content.size) {
      let c = Zl(o.content, l.content, t - 1, i - 1);
      if (c)
        return c;
    }
    t -= a, i -= a;
  }
}
class y {
  /**
  @internal
  */
  constructor(e, t) {
    if (this.content = e, this.size = t || 0, t == null)
      for (let i = 0; i < e.length; i++)
        this.size += e[i].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(e, t, i, s = 0, r) {
    for (let o = 0, l = 0; l < t; o++) {
      let a = this.content[o], c = l + a.nodeSize;
      if (c > e && i(a, s + l, r || null, o) !== !1 && a.content.size) {
        let d = l + 1;
        a.nodesBetween(Math.max(0, e - d), Math.min(a.content.size, t - d), i, s + d);
      }
      l = c;
    }
  }
  /**
  Call the given callback for every descendant node. `pos` will be
  relative to the start of the fragment. The callback may return
  `false` to prevent traversal of a given node's children.
  */
  descendants(e) {
    this.nodesBetween(0, this.size, e);
  }
  /**
  Extract the text between `from` and `to`. See the same method on
  [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
  */
  textBetween(e, t, i, s) {
    let r = "", o = !0;
    return this.nodesBetween(e, t, (l, a) => {
      let c = l.isText ? l.text.slice(Math.max(e, a) - a, t - a) : l.isLeaf ? s ? typeof s == "function" ? s(l) : s : l.type.spec.leafText ? l.type.spec.leafText(l) : "" : "";
      l.isBlock && (l.isLeaf && c || l.isTextblock) && i && (o ? o = !1 : r += i), r += c;
    }, 0), r;
  }
  /**
  Create a new fragment containing the combined content of this
  fragment and the other.
  */
  append(e) {
    if (!e.size)
      return this;
    if (!this.size)
      return e;
    let t = this.lastChild, i = e.firstChild, s = this.content.slice(), r = 0;
    for (t.isText && t.sameMarkup(i) && (s[s.length - 1] = t.withText(t.text + i.text), r = 1); r < e.content.length; r++)
      s.push(e.content[r]);
    return new y(s, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, t = this.size) {
    if (e == 0 && t == this.size)
      return this;
    let i = [], s = 0;
    if (t > e)
      for (let r = 0, o = 0; o < t; r++) {
        let l = this.content[r], a = o + l.nodeSize;
        a > e && ((o < e || a > t) && (l.isText ? l = l.cut(Math.max(0, e - o), Math.min(l.text.length, t - o)) : l = l.cut(Math.max(0, e - o - 1), Math.min(l.content.size, t - o - 1))), i.push(l), s += l.nodeSize), o = a;
      }
    return new y(i, s);
  }
  /**
  @internal
  */
  cutByIndex(e, t) {
    return e == t ? y.empty : e == 0 && t == this.content.length ? this : new y(this.content.slice(e, t));
  }
  /**
  Create a new fragment in which the node at the given index is
  replaced by the given node.
  */
  replaceChild(e, t) {
    let i = this.content[e];
    if (i == t)
      return this;
    let s = this.content.slice(), r = this.size + t.nodeSize - i.nodeSize;
    return s[e] = t, new y(s, r);
  }
  /**
  Create a new fragment by prepending the given node to this
  fragment.
  */
  addToStart(e) {
    return new y([e].concat(this.content), this.size + e.nodeSize);
  }
  /**
  Create a new fragment by appending the given node to this
  fragment.
  */
  addToEnd(e) {
    return new y(this.content.concat(e), this.size + e.nodeSize);
  }
  /**
  Compare this fragment to another one.
  */
  eq(e) {
    if (this.content.length != e.content.length)
      return !1;
    for (let t = 0; t < this.content.length; t++)
      if (!this.content[t].eq(e.content[t]))
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
  child(e) {
    let t = this.content[e];
    if (!t)
      throw new RangeError("Index " + e + " out of range for " + this);
    return t;
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content[e] || null;
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    for (let t = 0, i = 0; t < this.content.length; t++) {
      let s = this.content[t];
      e(s, i, t), i += s.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(e, t = 0) {
    return Ql(this, e, t);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(e, t = this.size, i = e.size) {
    return Zl(this, e, t, i);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return Bn(0, e);
    if (e == this.size)
      return Bn(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let t = 0, i = 0; ; t++) {
      let s = this.child(t), r = i + s.nodeSize;
      if (r >= e)
        return r == e ? Bn(t + 1, r) : Bn(t, i);
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
    return this.content.length ? this.content.map((e) => e.toJSON()) : null;
  }
  /**
  Deserialize a fragment from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      return y.empty;
    if (!Array.isArray(t))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new y(t.map(e.nodeFromJSON));
  }
  /**
  Build a fragment from an array of nodes. Ensures that adjacent
  text nodes with the same marks are joined together.
  */
  static fromArray(e) {
    if (!e.length)
      return y.empty;
    let t, i = 0;
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      i += r.nodeSize, s && r.isText && e[s - 1].sameMarkup(r) ? (t || (t = e.slice(0, s)), t[t.length - 1] = r.withText(t[t.length - 1].text + r.text)) : t && t.push(r);
    }
    return new y(t || e, i);
  }
  /**
  Create a fragment from something that can be interpreted as a
  set of nodes. For `null`, it returns the empty fragment. For a
  fragment, the fragment itself. For a node or array of nodes, a
  fragment containing those nodes.
  */
  static from(e) {
    if (!e)
      return y.empty;
    if (e instanceof y)
      return e;
    if (Array.isArray(e))
      return this.fromArray(e);
    if (e.attrs)
      return new y([e], e.nodeSize);
    throw new RangeError("Can not convert " + e + " to a Fragment" + (e.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
}
y.empty = new y([], 0);
const gs = { index: 0, offset: 0 };
function Bn(n, e) {
  return gs.index = n, gs.offset = e, gs;
}
function li(n, e) {
  if (n === e)
    return !0;
  if (!(n && typeof n == "object") || !(e && typeof e == "object"))
    return !1;
  let t = Array.isArray(n);
  if (Array.isArray(e) != t)
    return !1;
  if (t) {
    if (n.length != e.length)
      return !1;
    for (let i = 0; i < n.length; i++)
      if (!li(n[i], e[i]))
        return !1;
  } else {
    for (let i in n)
      if (!(i in e) || !li(n[i], e[i]))
        return !1;
    for (let i in e)
      if (!(i in n))
        return !1;
  }
  return !0;
}
let P = class js {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.attrs = t;
  }
  /**
  Given a set of marks, create a new set which contains this one as
  well, in the right position. If this mark is already in the set,
  the set itself is returned. If any marks that are set to be
  [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
  those are replaced by this one.
  */
  addToSet(e) {
    let t, i = !1;
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (this.eq(r))
        return e;
      if (this.type.excludes(r.type))
        t || (t = e.slice(0, s));
      else {
        if (r.type.excludes(this.type))
          return e;
        !i && r.type.rank > this.type.rank && (t || (t = e.slice(0, s)), t.push(this), i = !0), t && t.push(r);
      }
    }
    return t || (t = e.slice()), i || t.push(this), t;
  }
  /**
  Remove this mark from the given set, returning a new set. If this
  mark is not in the set, the set itself is returned.
  */
  removeFromSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t]))
        return e.slice(0, t).concat(e.slice(t + 1));
    return e;
  }
  /**
  Test whether this mark is in the given set of marks.
  */
  isInSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t]))
        return !0;
    return !1;
  }
  /**
  Test whether this mark has the same type and attributes as
  another mark.
  */
  eq(e) {
    return this == e || this.type == e.type && li(this.attrs, e.attrs);
  }
  /**
  Convert this mark to a JSON-serializeable representation.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return e;
  }
  /**
  Deserialize a mark from JSON.
  */
  static fromJSON(e, t) {
    if (!t)
      throw new RangeError("Invalid input for Mark.fromJSON");
    let i = e.marks[t.type];
    if (!i)
      throw new RangeError(`There is no mark type ${t.type} in this schema`);
    let s = i.create(t.attrs);
    return i.checkAttrs(s.attrs), s;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(e, t) {
    if (e == t)
      return !0;
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++)
      if (!e[i].eq(t[i]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(e) {
    if (!e || Array.isArray(e) && e.length == 0)
      return js.none;
    if (e instanceof js)
      return [e];
    let t = e.slice();
    return t.sort((i, s) => i.type.rank - s.type.rank), t;
  }
};
P.none = [];
class ai extends Error {
}
class S {
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
  constructor(e, t, i) {
    this.content = e, this.openStart = t, this.openEnd = i;
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
  insertAt(e, t) {
    let i = ta(this.content, e + this.openStart, t);
    return i && new S(i, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(e, t) {
    return new S(ea(this.content, e + this.openStart, t + this.openStart), this.openStart, this.openEnd);
  }
  /**
  Tests whether this slice is equal to another slice.
  */
  eq(e) {
    return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
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
    let e = { content: this.content.toJSON() };
    return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
  }
  /**
  Deserialize a slice from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      return S.empty;
    let i = t.openStart || 0, s = t.openEnd || 0;
    if (typeof i != "number" || typeof s != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new S(y.fromJSON(e, t.content), i, s);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, t = !0) {
    let i = 0, s = 0;
    for (let r = e.firstChild; r && !r.isLeaf && (t || !r.type.spec.isolating); r = r.firstChild)
      i++;
    for (let r = e.lastChild; r && !r.isLeaf && (t || !r.type.spec.isolating); r = r.lastChild)
      s++;
    return new S(e, i, s);
  }
}
S.empty = new S(y.empty, 0, 0);
function ea(n, e, t) {
  let { index: i, offset: s } = n.findIndex(e), r = n.maybeChild(i), { index: o, offset: l } = n.findIndex(t);
  if (s == e || r.isText) {
    if (l != t && !n.child(o).isText)
      throw new RangeError("Removing non-flat range");
    return n.cut(0, e).append(n.cut(t));
  }
  if (i != o)
    throw new RangeError("Removing non-flat range");
  return n.replaceChild(i, r.copy(ea(r.content, e - s - 1, t - s - 1)));
}
function ta(n, e, t, i) {
  let { index: s, offset: r } = n.findIndex(e), o = n.maybeChild(s);
  if (r == e || o.isText)
    return i && !i.canReplace(s, s, t) ? null : n.cut(0, e).append(t).append(n.cut(e));
  let l = ta(o.content, e - r - 1, t, o);
  return l && n.replaceChild(s, o.copy(l));
}
function cd(n, e, t) {
  if (t.openStart > n.depth)
    throw new ai("Inserted content deeper than insertion position");
  if (n.depth - t.openStart != e.depth - t.openEnd)
    throw new ai("Inconsistent open depths");
  return na(n, e, t, 0);
}
function na(n, e, t, i) {
  let s = n.index(i), r = n.node(i);
  if (s == e.index(i) && i < n.depth - t.openStart) {
    let o = na(n, e, t, i + 1);
    return r.copy(r.content.replaceChild(s, o));
  } else if (t.content.size)
    if (!t.openStart && !t.openEnd && n.depth == i && e.depth == i) {
      let o = n.parent, l = o.content;
      return St(o, l.cut(0, n.parentOffset).append(t.content).append(l.cut(e.parentOffset)));
    } else {
      let { start: o, end: l } = dd(t, n);
      return St(r, sa(n, o, l, e, i));
    }
  else return St(r, ci(n, e, i));
}
function ia(n, e) {
  if (!e.type.compatibleContent(n.type))
    throw new ai("Cannot join " + e.type.name + " onto " + n.type.name);
}
function Ks(n, e, t) {
  let i = n.node(t);
  return ia(i, e.node(t)), i;
}
function xt(n, e) {
  let t = e.length - 1;
  t >= 0 && n.isText && n.sameMarkup(e[t]) ? e[t] = n.withText(e[t].text + n.text) : e.push(n);
}
function an(n, e, t, i) {
  let s = (e || n).node(t), r = 0, o = e ? e.index(t) : s.childCount;
  n && (r = n.index(t), n.depth > t ? r++ : n.textOffset && (xt(n.nodeAfter, i), r++));
  for (let l = r; l < o; l++)
    xt(s.child(l), i);
  e && e.depth == t && e.textOffset && xt(e.nodeBefore, i);
}
function St(n, e) {
  return n.type.checkContent(e), n.copy(e);
}
function sa(n, e, t, i, s) {
  let r = n.depth > s && Ks(n, e, s + 1), o = i.depth > s && Ks(t, i, s + 1), l = [];
  return an(null, n, s, l), r && o && e.index(s) == t.index(s) ? (ia(r, o), xt(St(r, sa(n, e, t, i, s + 1)), l)) : (r && xt(St(r, ci(n, e, s + 1)), l), an(e, t, s, l), o && xt(St(o, ci(t, i, s + 1)), l)), an(i, null, s, l), new y(l);
}
function ci(n, e, t) {
  let i = [];
  if (an(null, n, t, i), n.depth > t) {
    let s = Ks(n, e, t + 1);
    xt(St(s, ci(n, e, t + 1)), i);
  }
  return an(e, null, t, i), new y(i);
}
function dd(n, e) {
  let t = e.depth - n.openStart, s = e.node(t).copy(n.content);
  for (let r = t - 1; r >= 0; r--)
    s = e.node(r).copy(y.from(s));
  return {
    start: s.resolveNoCache(n.openStart + t),
    end: s.resolveNoCache(s.content.size - n.openEnd - t)
  };
}
class vn {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.pos = e, this.path = t, this.parentOffset = i, this.depth = t.length / 3 - 1;
  }
  /**
  @internal
  */
  resolveDepth(e) {
    return e == null ? this.depth : e < 0 ? this.depth + e : e;
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
  node(e) {
    return this.path[this.resolveDepth(e) * 3];
  }
  /**
  The index into the ancestor at the given level. If this points
  at the 3rd node in the 2nd paragraph on the top level, for
  example, `p.index(0)` is 1 and `p.index(1)` is 2.
  */
  index(e) {
    return this.path[this.resolveDepth(e) * 3 + 1];
  }
  /**
  The index pointing after this position into the ancestor at the
  given level.
  */
  indexAfter(e) {
    return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
  }
  /**
  The (absolute) position at the start of the node at the given
  level.
  */
  start(e) {
    return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
  }
  /**
  The (absolute) position at the end of the node at the given
  level.
  */
  end(e) {
    return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
  }
  /**
  The (absolute) position directly before the wrapping node at the
  given level, or, when `depth` is `this.depth + 1`, the original
  position.
  */
  before(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position before the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
  }
  /**
  The (absolute) position directly after the wrapping node at the
  given level, or the original position when `depth` is `this.depth + 1`.
  */
  after(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position after the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
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
    let e = this.parent, t = this.index(this.depth);
    if (t == e.childCount)
      return null;
    let i = this.pos - this.path[this.path.length - 1], s = e.child(t);
    return i ? e.child(t).cut(i) : s;
  }
  /**
  Get the node directly before the position, if any. If the
  position points into a text node, only the part of that node
  before the position is returned.
  */
  get nodeBefore() {
    let e = this.index(this.depth), t = this.pos - this.path[this.path.length - 1];
    return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
  }
  /**
  Get the position at the given index in the parent node at the
  given depth (which defaults to `this.depth`).
  */
  posAtIndex(e, t) {
    t = this.resolveDepth(t);
    let i = this.path[t * 3], s = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let r = 0; r < e; r++)
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
    let e = this.parent, t = this.index();
    if (e.content.size == 0)
      return P.none;
    if (this.textOffset)
      return e.child(t).marks;
    let i = e.maybeChild(t - 1), s = e.maybeChild(t);
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
  marksAcross(e) {
    let t = this.parent.maybeChild(this.index());
    if (!t || !t.isInline)
      return null;
    let i = t.marks, s = e.parent.maybeChild(e.index());
    for (var r = 0; r < i.length; r++)
      i[r].type.spec.inclusive === !1 && (!s || !i[r].isInSet(s.marks)) && (i = i[r--].removeFromSet(i));
    return i;
  }
  /**
  The depth up to which this position and the given (non-resolved)
  position share the same parent nodes.
  */
  sharedDepth(e) {
    for (let t = this.depth; t > 0; t--)
      if (this.start(t) <= e && this.end(t) >= e)
        return t;
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
  blockRange(e = this, t) {
    if (e.pos < this.pos)
      return e.blockRange(this);
    for (let i = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); i >= 0; i--)
      if (e.pos <= this.end(i) && (!t || t(this.node(i))))
        return new di(this, e, i);
    return null;
  }
  /**
  Query whether the given position shares the same parent node.
  */
  sameParent(e) {
    return this.pos - this.parentOffset == e.pos - e.parentOffset;
  }
  /**
  Return the greater of this and the given position.
  */
  max(e) {
    return e.pos > this.pos ? e : this;
  }
  /**
  Return the smaller of this and the given position.
  */
  min(e) {
    return e.pos < this.pos ? e : this;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 1; t <= this.depth; t++)
      e += (e ? "/" : "") + this.node(t).type.name + "_" + this.index(t - 1);
    return e + ":" + this.parentOffset;
  }
  /**
  @internal
  */
  static resolve(e, t) {
    if (!(t >= 0 && t <= e.content.size))
      throw new RangeError("Position " + t + " out of range");
    let i = [], s = 0, r = t;
    for (let o = e; ; ) {
      let { index: l, offset: a } = o.content.findIndex(r), c = r - a;
      if (i.push(o, l, s + a), !c || (o = o.child(l), o.isText))
        break;
      r = c - 1, s += a + 1;
    }
    return new vn(t, i, r);
  }
  /**
  @internal
  */
  static resolveCached(e, t) {
    let i = fo.get(e);
    if (i)
      for (let r = 0; r < i.elts.length; r++) {
        let o = i.elts[r];
        if (o.pos == t)
          return o;
      }
    else
      fo.set(e, i = new ud());
    let s = i.elts[i.i] = vn.resolve(e, t);
    return i.i = (i.i + 1) % pd, s;
  }
}
class ud {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const pd = 12, fo = /* @__PURE__ */ new WeakMap();
class di {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(e, t, i) {
    this.$from = e, this.$to = t, this.depth = i;
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
const hd = /* @__PURE__ */ Object.create(null);
let st = class Js {
  /**
  @internal
  */
  constructor(e, t, i, s = P.none) {
    this.type = e, this.attrs = t, this.marks = s, this.content = i || y.empty;
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
  child(e) {
    return this.content.child(e);
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content.maybeChild(e);
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    this.content.forEach(e);
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
  nodesBetween(e, t, i, s = 0) {
    this.content.nodesBetween(e, t, i, s, this);
  }
  /**
  Call the given callback for every descendant node. Doesn't
  descend into a node when the callback returns `false`.
  */
  descendants(e) {
    this.nodesBetween(0, this.content.size, e);
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
  textBetween(e, t, i, s) {
    return this.content.textBetween(e, t, i, s);
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
  eq(e) {
    return this == e || this.sameMarkup(e) && this.content.eq(e.content);
  }
  /**
  Compare the markup (type, attributes, and marks) of this node to
  those of another. Returns `true` if both have the same markup.
  */
  sameMarkup(e) {
    return this.hasMarkup(e.type, e.attrs, e.marks);
  }
  /**
  Check whether this node's markup correspond to the given type,
  attributes, and marks.
  */
  hasMarkup(e, t, i) {
    return this.type == e && li(this.attrs, t || e.defaultAttrs || hd) && P.sameSet(this.marks, i || P.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new Js(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new Js(this.type, this.attrs, this.content, e);
  }
  /**
  Create a copy of this node with only the content between the
  given positions. If `to` is not given, it defaults to the end of
  the node.
  */
  cut(e, t = this.content.size) {
    return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
  }
  /**
  Cut out the part of the document between the given positions, and
  return it as a `Slice` object.
  */
  slice(e, t = this.content.size, i = !1) {
    if (e == t)
      return S.empty;
    let s = this.resolve(e), r = this.resolve(t), o = i ? 0 : s.sharedDepth(t), l = s.start(o), c = s.node(o).content.cut(s.pos - l, r.pos - l);
    return new S(c, s.depth - o, r.depth - o);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(e, t, i) {
    return cd(this.resolve(e), this.resolve(t), i);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: i, offset: s } = t.content.findIndex(e);
      if (t = t.maybeChild(i), !t)
        return null;
      if (s == e || t.isText)
        return t;
      e -= s + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(e) {
    let { index: t, offset: i } = this.content.findIndex(e);
    return { node: this.content.maybeChild(t), index: t, offset: i };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(e) {
    if (e == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: t, offset: i } = this.content.findIndex(e);
    if (i < e)
      return { node: this.content.child(t), index: t, offset: i };
    let s = this.content.child(t - 1);
    return { node: s, index: t - 1, offset: i - s.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return vn.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return vn.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, t, i) {
    let s = !1;
    return t > e && this.nodesBetween(e, t, (r) => (i.isInSet(r.marks) && (s = !0), !s)), s;
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
    let e = this.type.name;
    return this.content.size && (e += "(" + this.content.toStringInner() + ")"), ra(this.marks, e);
  }
  /**
  Get the content match in this node at the given index.
  */
  contentMatchAt(e) {
    let t = this.type.contentMatch.matchFragment(this.content, 0, e);
    if (!t)
      throw new Error("Called contentMatchAt on a node with invalid content");
    return t;
  }
  /**
  Test whether replacing the range between `from` and `to` (by
  child index) with the given replacement fragment (which defaults
  to the empty fragment) would leave the node's content valid. You
  can optionally pass `start` and `end` indices into the
  replacement fragment.
  */
  canReplace(e, t, i = y.empty, s = 0, r = i.childCount) {
    let o = this.contentMatchAt(e).matchFragment(i, s, r), l = o && o.matchFragment(this.content, t);
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
  canReplaceWith(e, t, i, s) {
    if (s && !this.type.allowsMarks(s))
      return !1;
    let r = this.contentMatchAt(e).matchType(i), o = r && r.matchFragment(this.content, t);
    return o ? o.validEnd : !1;
  }
  /**
  Test whether the given node's content could be appended to this
  node. If that node is empty, this will only return true if there
  is at least one node type that can appear in both nodes (to avoid
  merging completely incompatible nodes).
  */
  canAppend(e) {
    return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
  }
  /**
  Check whether this node and its descendants conform to the
  schema, and raise an exception when they do not.
  */
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let e = P.none;
    for (let t = 0; t < this.marks.length; t++) {
      let i = this.marks[t];
      i.type.checkAttrs(i.attrs), e = i.addToSet(e);
    }
    if (!P.sameSet(e, this.marks))
      throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((t) => t.type.name)}`);
    this.content.forEach((t) => t.check());
  }
  /**
  Return a JSON-serializeable representation of this node.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((t) => t.toJSON())), e;
  }
  /**
  Deserialize a node from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      throw new RangeError("Invalid input for Node.fromJSON");
    let i;
    if (t.marks) {
      if (!Array.isArray(t.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      i = t.marks.map(e.markFromJSON);
    }
    if (t.type == "text") {
      if (typeof t.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return e.text(t.text, i);
    }
    let s = y.fromJSON(e, t.content), r = e.nodeType(t.type).create(t.attrs, s, i);
    return r.type.checkAttrs(r.attrs), r;
  }
};
st.prototype.text = void 0;
class ui extends st {
  /**
  @internal
  */
  constructor(e, t, i, s) {
    if (super(e, t, null, s), !i)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = i;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : ra(this.marks, JSON.stringify(this.text));
  }
  get textContent() {
    return this.text;
  }
  textBetween(e, t) {
    return this.text.slice(e, t);
  }
  get nodeSize() {
    return this.text.length;
  }
  mark(e) {
    return e == this.marks ? this : new ui(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new ui(this.type, this.attrs, e, this.marks);
  }
  cut(e = 0, t = this.text.length) {
    return e == 0 && t == this.text.length ? this : this.withText(this.text.slice(e, t));
  }
  eq(e) {
    return this.sameMarkup(e) && this.text == e.text;
  }
  toJSON() {
    let e = super.toJSON();
    return e.text = this.text, e;
  }
}
function ra(n, e) {
  for (let t = n.length - 1; t >= 0; t--)
    e = n[t].type.name + "(" + e + ")";
  return e;
}
class Tt {
  /**
  @internal
  */
  constructor(e) {
    this.validEnd = e, this.next = [], this.wrapCache = [];
  }
  /**
  @internal
  */
  static parse(e, t) {
    let i = new fd(e, t);
    if (i.next == null)
      return Tt.empty;
    let s = oa(i);
    i.next && i.err("Unexpected trailing text");
    let r = wd(kd(s));
    return xd(r, i), r;
  }
  /**
  Match a node type, returning a match after that node if
  successful.
  */
  matchType(e) {
    for (let t = 0; t < this.next.length; t++)
      if (this.next[t].type == e)
        return this.next[t].next;
    return null;
  }
  /**
  Try to match a fragment. Returns the resulting match when
  successful.
  */
  matchFragment(e, t = 0, i = e.childCount) {
    let s = this;
    for (let r = t; s && r < i; r++)
      s = s.matchType(e.child(r).type);
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
    for (let e = 0; e < this.next.length; e++) {
      let { type: t } = this.next[e];
      if (!(t.isText || t.hasRequiredAttrs()))
        return t;
    }
    return null;
  }
  /**
  @internal
  */
  compatible(e) {
    for (let t = 0; t < this.next.length; t++)
      for (let i = 0; i < e.next.length; i++)
        if (this.next[t].type == e.next[i].type)
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
  fillBefore(e, t = !1, i = 0) {
    let s = [this];
    function r(o, l) {
      let a = o.matchFragment(e, i);
      if (a && (!t || a.validEnd))
        return y.from(l.map((c) => c.createAndFill()));
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
  findWrapping(e) {
    for (let i = 0; i < this.wrapCache.length; i += 2)
      if (this.wrapCache[i] == e)
        return this.wrapCache[i + 1];
    let t = this.computeWrapping(e);
    return this.wrapCache.push(e, t), t;
  }
  /**
  @internal
  */
  computeWrapping(e) {
    let t = /* @__PURE__ */ Object.create(null), i = [{ match: this, type: null, via: null }];
    for (; i.length; ) {
      let s = i.shift(), r = s.match;
      if (r.matchType(e)) {
        let o = [];
        for (let l = s; l.type; l = l.via)
          o.push(l.type);
        return o.reverse();
      }
      for (let o = 0; o < r.next.length; o++) {
        let { type: l, next: a } = r.next[o];
        !l.isLeaf && !l.hasRequiredAttrs() && !(l.name in t) && (!s.type || a.validEnd) && (i.push({ match: l.contentMatch, type: l, via: s }), t[l.name] = !0);
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
  edge(e) {
    if (e >= this.next.length)
      throw new RangeError(`There's no ${e}th edge in this content match`);
    return this.next[e];
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    function t(i) {
      e.push(i);
      for (let s = 0; s < i.next.length; s++)
        e.indexOf(i.next[s].next) == -1 && t(i.next[s].next);
    }
    return t(this), e.map((i, s) => {
      let r = s + (i.validEnd ? "*" : " ") + " ";
      for (let o = 0; o < i.next.length; o++)
        r += (o ? ", " : "") + i.next[o].type.name + "->" + e.indexOf(i.next[o].next);
      return r;
    }).join(`
`);
  }
}
Tt.empty = new Tt(!0);
class fd {
  constructor(e, t) {
    this.string = e, this.nodeTypes = t, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
  }
  get next() {
    return this.tokens[this.pos];
  }
  eat(e) {
    return this.next == e && (this.pos++ || !0);
  }
  err(e) {
    throw new SyntaxError(e + " (in content expression '" + this.string + "')");
  }
}
function oa(n) {
  let e = [];
  do
    e.push(md(n));
  while (n.eat("|"));
  return e.length == 1 ? e[0] : { type: "choice", exprs: e };
}
function md(n) {
  let e = [];
  do
    e.push(gd(n));
  while (n.next && n.next != ")" && n.next != "|");
  return e.length == 1 ? e[0] : { type: "seq", exprs: e };
}
function gd(n) {
  let e = vd(n);
  for (; ; )
    if (n.eat("+"))
      e = { type: "plus", expr: e };
    else if (n.eat("*"))
      e = { type: "star", expr: e };
    else if (n.eat("?"))
      e = { type: "opt", expr: e };
    else if (n.eat("{"))
      e = bd(n, e);
    else
      break;
  return e;
}
function mo(n) {
  /\D/.test(n.next) && n.err("Expected number, got '" + n.next + "'");
  let e = Number(n.next);
  return n.pos++, e;
}
function bd(n, e) {
  let t = mo(n), i = t;
  return n.eat(",") && (n.next != "}" ? i = mo(n) : i = -1), n.eat("}") || n.err("Unclosed braced range"), { type: "range", min: t, max: i, expr: e };
}
function yd(n, e) {
  let t = n.nodeTypes, i = t[e];
  if (i)
    return [i];
  let s = [];
  for (let r in t) {
    let o = t[r];
    o.isInGroup(e) && s.push(o);
  }
  return s.length == 0 && n.err("No node type or group '" + e + "' found"), s;
}
function vd(n) {
  if (n.eat("(")) {
    let e = oa(n);
    return n.eat(")") || n.err("Missing closing paren"), e;
  } else if (/\W/.test(n.next))
    n.err("Unexpected token '" + n.next + "'");
  else {
    let e = yd(n, n.next).map((t) => (n.inline == null ? n.inline = t.isInline : n.inline != t.isInline && n.err("Mixing inline and block content"), { type: "name", value: t }));
    return n.pos++, e.length == 1 ? e[0] : { type: "choice", exprs: e };
  }
}
function kd(n) {
  let e = [[]];
  return s(r(n, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function i(o, l, a) {
    let c = { term: a, to: l };
    return e[o].push(c), c;
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
        s(c, l = t());
      }
    else if (o.type == "star") {
      let a = t();
      return i(l, a), s(r(o.expr, a), a), [i(a)];
    } else if (o.type == "plus") {
      let a = t();
      return s(r(o.expr, l), a), s(r(o.expr, a), a), [i(a)];
    } else {
      if (o.type == "opt")
        return [i(l)].concat(r(o.expr, l));
      if (o.type == "range") {
        let a = l;
        for (let c = 0; c < o.min; c++) {
          let d = t();
          s(r(o.expr, a), d), a = d;
        }
        if (o.max == -1)
          s(r(o.expr, a), a);
        else
          for (let c = o.min; c < o.max; c++) {
            let d = t();
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
function la(n, e) {
  return e - n;
}
function go(n, e) {
  let t = [];
  return i(e), t.sort(la);
  function i(s) {
    let r = n[s];
    if (r.length == 1 && !r[0].term)
      return i(r[0].to);
    t.push(s);
    for (let o = 0; o < r.length; o++) {
      let { term: l, to: a } = r[o];
      !l && t.indexOf(a) == -1 && i(a);
    }
  }
}
function wd(n) {
  let e = /* @__PURE__ */ Object.create(null);
  return t(go(n, 0));
  function t(i) {
    let s = [];
    i.forEach((o) => {
      n[o].forEach(({ term: l, to: a }) => {
        if (!l)
          return;
        let c;
        for (let d = 0; d < s.length; d++)
          s[d][0] == l && (c = s[d][1]);
        go(n, a).forEach((d) => {
          c || s.push([l, c = []]), c.indexOf(d) == -1 && c.push(d);
        });
      });
    });
    let r = e[i.join(",")] = new Tt(i.indexOf(n.length - 1) > -1);
    for (let o = 0; o < s.length; o++) {
      let l = s[o][1].sort(la);
      r.next.push({ type: s[o][0], next: e[l.join(",")] || t(l) });
    }
    return r;
  }
}
function xd(n, e) {
  for (let t = 0, i = [n]; t < i.length; t++) {
    let s = i[t], r = !s.validEnd, o = [];
    for (let l = 0; l < s.next.length; l++) {
      let { type: a, next: c } = s.next[l];
      o.push(a.name), r && !(a.isText || a.hasRequiredAttrs()) && (r = !1), i.indexOf(c) == -1 && i.push(c);
    }
    r && e.err("Only non-generatable nodes (" + o.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function aa(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let i = n[t];
    if (!i.hasDefault)
      return null;
    e[t] = i.default;
  }
  return e;
}
function ca(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let i in n) {
    let s = e && e[i];
    if (s === void 0) {
      let r = n[i];
      if (r.hasDefault)
        s = r.default;
      else
        throw new RangeError("No value supplied for attribute " + i);
    }
    t[i] = s;
  }
  return t;
}
function da(n, e, t, i) {
  for (let s in e)
    if (!(s in n))
      throw new RangeError(`Unsupported attribute ${s} for ${t} of type ${s}`);
  for (let s in n) {
    let r = n[s];
    r.validate && r.validate(e[s]);
  }
}
function ua(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let i in e)
      t[i] = new Cd(n, i, e[i]);
  return t;
}
let bo = class pa {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.name = e, this.schema = t, this.spec = i, this.markSet = null, this.groups = i.group ? i.group.split(" ") : [], this.attrs = ua(e, i.attrs), this.defaultAttrs = aa(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(i.inline || e == "text"), this.isText = e == "text";
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
    return this.contentMatch == Tt.empty;
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
  isInGroup(e) {
    return this.groups.indexOf(e) > -1;
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
    for (let e in this.attrs)
      if (this.attrs[e].isRequired)
        return !0;
    return !1;
  }
  /**
  Indicates whether this node allows some of the same content as
  the given node type.
  */
  compatibleContent(e) {
    return this == e || this.contentMatch.compatible(e.contentMatch);
  }
  /**
  @internal
  */
  computeAttrs(e) {
    return !e && this.defaultAttrs ? this.defaultAttrs : ca(this.attrs, e);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(e = null, t, i) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new st(this, this.computeAttrs(e), y.from(t), P.setFrom(i));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, t, i) {
    return t = y.from(t), this.checkContent(t), new st(this, this.computeAttrs(e), t, P.setFrom(i));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(e = null, t, i) {
    if (e = this.computeAttrs(e), t = y.from(t), t.size) {
      let o = this.contentMatch.fillBefore(t);
      if (!o)
        return null;
      t = o.append(t);
    }
    let s = this.contentMatch.matchFragment(t), r = s && s.fillBefore(y.empty, !0);
    return r ? new st(this, e, t.append(r), P.setFrom(i)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(e) {
    let t = this.contentMatch.matchFragment(e);
    if (!t || !t.validEnd)
      return !1;
    for (let i = 0; i < e.childCount; i++)
      if (!this.allowsMarks(e.child(i).marks))
        return !1;
    return !0;
  }
  /**
  Throws a RangeError if the given fragment is not valid content for this
  node type.
  @internal
  */
  checkContent(e) {
    if (!this.validContent(e))
      throw new RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
  }
  /**
  @internal
  */
  checkAttrs(e) {
    da(this.attrs, e, "node", this.name);
  }
  /**
  Check whether the given mark type is allowed in this node.
  */
  allowsMarkType(e) {
    return this.markSet == null || this.markSet.indexOf(e) > -1;
  }
  /**
  Test whether the given set of marks are allowed in this node.
  */
  allowsMarks(e) {
    if (this.markSet == null)
      return !0;
    for (let t = 0; t < e.length; t++)
      if (!this.allowsMarkType(e[t].type))
        return !1;
    return !0;
  }
  /**
  Removes the marks that are not allowed in this node from the given set.
  */
  allowedMarks(e) {
    if (this.markSet == null)
      return e;
    let t;
    for (let i = 0; i < e.length; i++)
      this.allowsMarkType(e[i].type) ? t && t.push(e[i]) : t || (t = e.slice(0, i));
    return t ? t.length ? t : P.none : e;
  }
  /**
  @internal
  */
  static compile(e, t) {
    let i = /* @__PURE__ */ Object.create(null);
    e.forEach((r, o) => i[r] = new pa(r, t, o));
    let s = t.spec.topNode || "doc";
    if (!i[s])
      throw new RangeError("Schema is missing its top node type ('" + s + "')");
    if (!i.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let r in i.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return i;
  }
};
function Sd(n, e, t) {
  let i = t.split("|");
  return (s) => {
    let r = s === null ? "null" : typeof s;
    if (i.indexOf(r) < 0)
      throw new RangeError(`Expected value of type ${i} for attribute ${e} on type ${n}, got ${r}`);
  };
}
class Cd {
  constructor(e, t, i) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(i, "default"), this.default = i.default, this.validate = typeof i.validate == "string" ? Sd(e, t, i.validate) : i.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class Yi {
  /**
  @internal
  */
  constructor(e, t, i, s) {
    this.name = e, this.rank = t, this.schema = i, this.spec = s, this.attrs = ua(e, s.attrs), this.excluded = null;
    let r = aa(this.attrs);
    this.instance = r ? new P(this, r) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new P(this, ca(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, t) {
    let i = /* @__PURE__ */ Object.create(null), s = 0;
    return e.forEach((r, o) => i[r] = new Yi(r, s++, t, o)), i;
  }
  /**
  When there is a mark of this type in the given set, a new set
  without it is returned. Otherwise, the input set is returned.
  */
  removeFromSet(e) {
    for (var t = 0; t < e.length; t++)
      e[t].type == this && (e = e.slice(0, t).concat(e.slice(t + 1)), t--);
    return e;
  }
  /**
  Tests whether there is a mark of this type in the given set.
  */
  isInSet(e) {
    for (let t = 0; t < e.length; t++)
      if (e[t].type == this)
        return e[t];
  }
  /**
  @internal
  */
  checkAttrs(e) {
    da(this.attrs, e, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(e) {
    return this.excluded.indexOf(e) > -1;
  }
}
class ha {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(e) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let t = this.spec = {};
    for (let s in e)
      t[s] = e[s];
    t.nodes = Z.from(e.nodes), t.marks = Z.from(e.marks || {}), this.nodes = bo.compile(this.spec.nodes, this), this.marks = Yi.compile(this.spec.marks, this);
    let i = /* @__PURE__ */ Object.create(null);
    for (let s in this.nodes) {
      if (s in this.marks)
        throw new RangeError(s + " can not be both a node and a mark");
      let r = this.nodes[s], o = r.spec.content || "", l = r.spec.marks;
      if (r.contentMatch = i[o] || (i[o] = Tt.parse(o, this.nodes)), r.inlineContent = r.contentMatch.inlineContent, r.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!r.isInline || !r.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = r;
      }
      r.markSet = l == "_" ? null : l ? yo(this, l.split(" ")) : l == "" || !r.inlineContent ? [] : null;
    }
    for (let s in this.marks) {
      let r = this.marks[s], o = r.spec.excludes;
      r.excluded = o == null ? [r] : o == "" ? [] : yo(this, o.split(" "));
    }
    this.nodeFromJSON = (s) => st.fromJSON(this, s), this.markFromJSON = (s) => P.fromJSON(this, s), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, t = null, i, s) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof bo) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(t, i, s);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, t) {
    let i = this.nodes.text;
    return new ui(i, i.defaultAttrs, e, P.setFrom(t));
  }
  /**
  Create a mark with the given type and attributes.
  */
  mark(e, t) {
    return typeof e == "string" && (e = this.marks[e]), e.create(t);
  }
  /**
  @internal
  */
  nodeType(e) {
    let t = this.nodes[e];
    if (!t)
      throw new RangeError("Unknown node type: " + e);
    return t;
  }
}
function yo(n, e) {
  let t = [];
  for (let i = 0; i < e.length; i++) {
    let s = e[i], r = n.marks[s], o = r;
    if (r)
      t.push(r);
    else
      for (let l in n.marks) {
        let a = n.marks[l];
        (s == "_" || a.spec.group && a.spec.group.split(" ").indexOf(s) > -1) && t.push(o = a);
      }
    if (!o)
      throw new SyntaxError("Unknown mark type: '" + e[i] + "'");
  }
  return t;
}
function Md(n) {
  return n.tag != null;
}
function Ed(n) {
  return n.style != null;
}
class rt {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(e, t) {
    this.schema = e, this.rules = t, this.tags = [], this.styles = [];
    let i = this.matchedStyles = [];
    t.forEach((s) => {
      if (Md(s))
        this.tags.push(s);
      else if (Ed(s)) {
        let r = /[^=]*/.exec(s.style)[0];
        i.indexOf(r) < 0 && i.push(r), this.styles.push(s);
      }
    }), this.normalizeLists = !this.tags.some((s) => {
      if (!/^(ul|ol)\b/.test(s.tag) || !s.node)
        return !1;
      let r = e.nodes[s.node];
      return r.contentMatch.matchType(r);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, t = {}) {
    let i = new ko(this, t, !1);
    return i.addAll(e, P.none, t.from, t.to), i.finish();
  }
  /**
  Parses the content of the given DOM node, like
  [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
  options. But unlike that method, which produces a whole node,
  this one returns a slice that is open at the sides, meaning that
  the schema constraints aren't applied to the start of nodes to
  the left of the input and the end of nodes at the end.
  */
  parseSlice(e, t = {}) {
    let i = new ko(this, t, !0);
    return i.addAll(e, P.none, t.from, t.to), S.maxOpen(i.finish());
  }
  /**
  @internal
  */
  matchTag(e, t, i) {
    for (let s = i ? this.tags.indexOf(i) + 1 : 0; s < this.tags.length; s++) {
      let r = this.tags[s];
      if (_d(e, r.tag) && (r.namespace === void 0 || e.namespaceURI == r.namespace) && (!r.context || t.matchesContext(r.context))) {
        if (r.getAttrs) {
          let o = r.getAttrs(e);
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
  matchStyle(e, t, i, s) {
    for (let r = s ? this.styles.indexOf(s) + 1 : 0; r < this.styles.length; r++) {
      let o = this.styles[r], l = o.style;
      if (!(l.indexOf(e) != 0 || o.context && !i.matchesContext(o.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      l.length > e.length && (l.charCodeAt(e.length) != 61 || l.slice(e.length + 1) != t))) {
        if (o.getAttrs) {
          let a = o.getAttrs(t);
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
  static schemaRules(e) {
    let t = [];
    function i(s) {
      let r = s.priority == null ? 50 : s.priority, o = 0;
      for (; o < t.length; o++) {
        let l = t[o];
        if ((l.priority == null ? 50 : l.priority) < r)
          break;
      }
      t.splice(o, 0, s);
    }
    for (let s in e.marks) {
      let r = e.marks[s].spec.parseDOM;
      r && r.forEach((o) => {
        i(o = wo(o)), o.mark || o.ignore || o.clearMark || (o.mark = s);
      });
    }
    for (let s in e.nodes) {
      let r = e.nodes[s].spec.parseDOM;
      r && r.forEach((o) => {
        i(o = wo(o)), o.node || o.ignore || o.mark || (o.node = s);
      });
    }
    return t;
  }
  /**
  Construct a DOM parser using the parsing rules listed in a
  schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
  [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
  */
  static fromSchema(e) {
    return e.cached.domParser || (e.cached.domParser = new rt(e, rt.schemaRules(e)));
  }
}
const fa = {
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
}, Td = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, ma = { ol: !0, ul: !0 }, kn = 1, Gs = 2, cn = 4;
function vo(n, e, t) {
  return e != null ? (e ? kn : 0) | (e === "full" ? Gs : 0) : n && n.whitespace == "pre" ? kn | Gs : t & ~cn;
}
class Hn {
  constructor(e, t, i, s, r, o) {
    this.type = e, this.attrs = t, this.marks = i, this.solid = s, this.options = o, this.content = [], this.activeMarks = P.none, this.match = r || (o & cn ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let t = this.type.contentMatch.fillBefore(y.from(e));
      if (t)
        this.match = this.type.contentMatch.matchFragment(t);
      else {
        let i = this.type.contentMatch, s;
        return (s = i.findWrapping(e.type)) ? (this.match = i, s) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & kn)) {
      let i = this.content[this.content.length - 1], s;
      if (i && i.isText && (s = /[ \t\r\n\u000c]+$/.exec(i.text))) {
        let r = i;
        i.text.length == s[0].length ? this.content.pop() : this.content[this.content.length - 1] = r.withText(r.text.slice(0, r.text.length - s[0].length));
      }
    }
    let t = y.from(this.content);
    return !e && this.match && (t = t.append(this.match.fillBefore(y.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !fa.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class ko {
  constructor(e, t, i) {
    this.parser = e, this.options = t, this.isOpen = i, this.open = 0, this.localPreserveWS = !1;
    let s = t.topNode, r, o = vo(null, t.preserveWhitespace, 0) | (i ? cn : 0);
    s ? r = new Hn(s.type, s.attrs, P.none, !0, t.topMatch || s.type.contentMatch, o) : i ? r = new Hn(null, null, P.none, !0, null, o) : r = new Hn(e.schema.topNodeType, null, P.none, !0, null, o), this.nodes = [r], this.find = t.findPositions, this.needsBlock = !1;
  }
  get top() {
    return this.nodes[this.open];
  }
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  addDOM(e, t) {
    e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
  }
  addTextNode(e, t) {
    let i = e.nodeValue, s = this.top, r = s.options & Gs ? "full" : this.localPreserveWS || (s.options & kn) > 0, { schema: o } = this.parser;
    if (r === "full" || s.inlineContext(e) || /[^ \t\r\n\u000c]/.test(i)) {
      if (r)
        if (r === "full")
          i = i.replace(/\r\n?/g, `
`);
        else if (o.linebreakReplacement && /[\r\n]/.test(i) && this.top.findWrapping(o.linebreakReplacement.create())) {
          let l = i.split(/\r?\n|\r/);
          for (let a = 0; a < l.length; a++)
            a && this.insertNode(o.linebreakReplacement.create(), t, !0), l[a] && this.insertNode(o.text(l[a]), t, !/\S/.test(l[a]));
          i = "";
        } else
          i = i.replace(/\r?\n|\r/g, " ");
      else if (i = i.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(i) && this.open == this.nodes.length - 1) {
        let l = s.content[s.content.length - 1], a = e.previousSibling;
        (!l || a && a.nodeName == "BR" || l.isText && /[ \t\r\n\u000c]$/.test(l.text)) && (i = i.slice(1));
      }
      i && this.insertNode(o.text(i), t, !/\S/.test(i)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, t, i) {
    let s = this.localPreserveWS, r = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let o = e.nodeName.toLowerCase(), l;
    ma.hasOwnProperty(o) && this.parser.normalizeLists && Ad(e);
    let a = this.options.ruleFromNode && this.options.ruleFromNode(e) || (l = this.parser.matchTag(e, this, i));
    e: if (a ? a.ignore : Td.hasOwnProperty(o))
      this.findInside(e), this.ignoreFallback(e, t);
    else if (!a || a.skip || a.closeParent) {
      a && a.closeParent ? this.open = Math.max(0, this.open - 1) : a && a.skip.nodeType && (e = a.skip);
      let c, d = this.needsBlock;
      if (fa.hasOwnProperty(o))
        r.content.length && r.content[0].isInline && this.open && (this.open--, r = this.top), c = !0, r.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e, t);
        break e;
      }
      let u = a && a.skip ? t : this.readStyles(e, t);
      u && this.addAll(e, u), c && this.sync(r), this.needsBlock = d;
    } else {
      let c = this.readStyles(e, t);
      c && this.addElementByRule(e, a, c, a.consuming === !1 ? l : void 0);
    }
    this.localPreserveWS = s;
  }
  // Called for leaf DOM nodes that would otherwise be ignored
  leafFallback(e, t) {
    e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode(`
`), t);
  }
  // Called for ignored nodes
  ignoreFallback(e, t) {
    e.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), t, !0);
  }
  // Run any style parser associated with the node's styles. Either
  // return an updated array of marks, or null to indicate some of the
  // styles had a rule with `ignore` set.
  readStyles(e, t) {
    let i = e.style;
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
            if (a.clearMark ? t = t.filter((c) => !a.clearMark(c)) : t = t.concat(this.parser.schema.marks[a.mark].create(a.attrs)), a.consuming === !1)
              l = a;
            else
              break;
          }
      }
    return t;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(e, t, i, s) {
    let r, o;
    if (t.node)
      if (o = this.parser.schema.nodes[t.node], o.isLeaf)
        this.insertNode(o.create(t.attrs), i, e.nodeName == "BR") || this.leafFallback(e, i);
      else {
        let a = this.enter(o, t.attrs || null, i, t.preserveWhitespace);
        a && (r = !0, i = a);
      }
    else {
      let a = this.parser.schema.marks[t.mark];
      i = i.concat(a.create(t.attrs));
    }
    let l = this.top;
    if (o && o.isLeaf)
      this.findInside(e);
    else if (s)
      this.addElement(e, i, s);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((a) => this.insertNode(a, i, !1));
    else {
      let a = e;
      typeof t.contentElement == "string" ? a = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? a = t.contentElement(e) : t.contentElement && (a = t.contentElement), this.findAround(e, a, !0), this.addAll(a, i), this.findAround(e, a, !1);
    }
    r && this.sync(l) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, t, i, s) {
    let r = i || 0;
    for (let o = i ? e.childNodes[i] : e.firstChild, l = s == null ? null : e.childNodes[s]; o != l; o = o.nextSibling, ++r)
      this.findAtPoint(e, r), this.addDOM(o, t);
    this.findAtPoint(e, r);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, t, i) {
    let s, r;
    for (let o = this.open, l = 0; o >= 0; o--) {
      let a = this.nodes[o], c = a.findWrapping(e);
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
      t = this.enterInner(s[o], null, t, !1);
    return t;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, t, i) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let r = this.textblockFromContext();
      r && (t = this.enterInner(r, null, t));
    }
    let s = this.findPlace(e, t, i);
    if (s) {
      this.closeExtra();
      let r = this.top;
      r.match && (r.match = r.match.matchType(e.type));
      let o = P.none;
      for (let l of s.concat(e.marks))
        (r.type ? r.type.allowsMarkType(l.type) : xo(l.type, e.type)) && (o = l.addToSet(o));
      return r.content.push(e.mark(o)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, t, i, s) {
    let r = this.findPlace(e.create(t), i, !1);
    return r && (r = this.enterInner(e, t, i, !0, s)), r;
  }
  // Open a node of the given type
  enterInner(e, t, i, s = !1, r) {
    this.closeExtra();
    let o = this.top;
    o.match = o.match && o.match.matchType(e);
    let l = vo(e, r, o.options);
    o.options & cn && o.content.length == 0 && (l |= cn);
    let a = P.none;
    return i = i.filter((c) => (o.type ? o.type.allowsMarkType(c.type) : xo(c.type, e)) ? (a = c.addToSet(a), !1) : !0), this.nodes.push(new Hn(e, t, a, s, null, l)), this.open++, i;
  }
  // Make sure all nodes above this.open are finished and added to
  // their parents
  closeExtra(e = !1) {
    let t = this.nodes.length - 1;
    if (t > this.open) {
      for (; t > this.open; t--)
        this.nodes[t - 1].content.push(this.nodes[t].finish(e));
      this.nodes.length = this.open + 1;
    }
  }
  finish() {
    return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
  }
  sync(e) {
    for (let t = this.open; t >= 0; t--) {
      if (this.nodes[t] == e)
        return this.open = t, !0;
      this.localPreserveWS && (this.nodes[t].options |= kn);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let t = this.open; t >= 0; t--) {
      let i = this.nodes[t].content;
      for (let s = i.length - 1; s >= 0; s--)
        e += i[s].nodeSize;
      t && e++;
    }
    return e;
  }
  findAtPoint(e, t) {
    if (this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].node == e && this.find[i].offset == t && (this.find[i].pos = this.currentPos);
  }
  findInside(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
  }
  findAround(e, t, i) {
    if (e != t && this.find)
      for (let s = 0; s < this.find.length; s++)
        this.find[s].pos == null && e.nodeType == 1 && e.contains(this.find[s].node) && t.compareDocumentPosition(this.find[s].node) & (i ? 2 : 4) && (this.find[s].pos = this.currentPos);
  }
  findInText(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].node == e && (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
  }
  // Determines whether the given context string matches this context.
  matchesContext(e) {
    if (e.indexOf("|") > -1)
      return e.split(/\s*\|\s*/).some(this.matchesContext, this);
    let t = e.split("/"), i = this.options.context, s = !this.isOpen && (!i || i.parent.type == this.nodes[0].type), r = -(i ? i.depth + 1 : 0) + (s ? 0 : 1), o = (l, a) => {
      for (; l >= 0; l--) {
        let c = t[l];
        if (c == "") {
          if (l == t.length - 1 || l == 0)
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
    return o(t.length - 1, this.open);
  }
  textblockFromContext() {
    let e = this.options.context;
    if (e)
      for (let t = e.depth; t >= 0; t--) {
        let i = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
        if (i && i.isTextblock && i.defaultAttrs)
          return i;
      }
    for (let t in this.parser.schema.nodes) {
      let i = this.parser.schema.nodes[t];
      if (i.isTextblock && i.defaultAttrs)
        return i;
    }
  }
}
function Ad(n) {
  for (let e = n.firstChild, t = null; e; e = e.nextSibling) {
    let i = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    i && ma.hasOwnProperty(i) && t ? (t.appendChild(e), e = t) : i == "li" ? t = e : i && (t = null);
  }
}
function _d(n, e) {
  return (n.matches || n.msMatchesSelector || n.webkitMatchesSelector || n.mozMatchesSelector).call(n, e);
}
function wo(n) {
  let e = {};
  for (let t in n)
    e[t] = n[t];
  return e;
}
function xo(n, e) {
  let t = e.schema.nodes;
  for (let i in t) {
    let s = t[i];
    if (!s.allowsMarkType(n))
      continue;
    let r = [], o = (l) => {
      r.push(l);
      for (let a = 0; a < l.edgeCount; a++) {
        let { type: c, next: d } = l.edge(a);
        if (c == e || r.indexOf(d) < 0 && o(d))
          return !0;
      }
    };
    if (o(s.contentMatch))
      return !0;
  }
}
class It {
  /**
  Create a serializer. `nodes` should map node names to functions
  that take a node and return a description of the corresponding
  DOM. `marks` does the same for mark names, but also gets an
  argument that tells it whether the mark's content is block or
  inline content (for typical use, it'll always be inline). A mark
  serializer may be `null` to indicate that marks of that type
  should not be serialized.
  */
  constructor(e, t) {
    this.nodes = e, this.marks = t;
  }
  /**
  Serialize the content of this fragment to a DOM fragment. When
  not in the browser, the `document` option, containing a DOM
  document, should be passed so that the serializer can create
  nodes.
  */
  serializeFragment(e, t = {}, i) {
    i || (i = bs(t).createDocumentFragment());
    let s = i, r = [];
    return e.forEach((o) => {
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
          let c = o.marks[a++], d = this.serializeMark(c, o.isInline, t);
          d && (r.push([c, s]), s.appendChild(d.dom), s = d.contentDOM || d.dom);
        }
      }
      s.appendChild(this.serializeNodeInner(o, t));
    }), i;
  }
  /**
  @internal
  */
  serializeNodeInner(e, t) {
    let { dom: i, contentDOM: s } = Zn(bs(t), this.nodes[e.type.name](e), null, e.attrs);
    if (s) {
      if (e.isLeaf)
        throw new RangeError("Content hole not allowed in a leaf node spec");
      this.serializeFragment(e.content, t, s);
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
  serializeNode(e, t = {}) {
    let i = this.serializeNodeInner(e, t);
    for (let s = e.marks.length - 1; s >= 0; s--) {
      let r = this.serializeMark(e.marks[s], e.isInline, t);
      r && ((r.contentDOM || r.dom).appendChild(i), i = r.dom);
    }
    return i;
  }
  /**
  @internal
  */
  serializeMark(e, t, i = {}) {
    let s = this.marks[e.type.name];
    return s && Zn(bs(i), s(e, t), null, e.attrs);
  }
  static renderSpec(e, t, i = null, s) {
    return Zn(e, t, i, s);
  }
  /**
  Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
  properties in a schema's node and mark specs.
  */
  static fromSchema(e) {
    return e.cached.domSerializer || (e.cached.domSerializer = new It(this.nodesFromSchema(e), this.marksFromSchema(e)));
  }
  /**
  Gather the serializers in a schema's node specs into an object.
  This can be useful as a base to build a custom serializer from.
  */
  static nodesFromSchema(e) {
    let t = So(e.nodes);
    return t.text || (t.text = (i) => i.text), t;
  }
  /**
  Gather the serializers in a schema's mark specs into an object.
  */
  static marksFromSchema(e) {
    return So(e.marks);
  }
}
function So(n) {
  let e = {};
  for (let t in n) {
    let i = n[t].spec.toDOM;
    i && (e[t] = i);
  }
  return e;
}
function bs(n) {
  return n.document || window.document;
}
const Co = /* @__PURE__ */ new WeakMap();
function Ld(n) {
  let e = Co.get(n);
  return e === void 0 && Co.set(n, e = Nd(n)), e;
}
function Nd(n) {
  let e = null;
  function t(i) {
    if (i && typeof i == "object")
      if (Array.isArray(i))
        if (typeof i[0] == "string")
          e || (e = []), e.push(i);
        else
          for (let s = 0; s < i.length; s++)
            t(i[s]);
      else
        for (let s in i)
          t(i[s]);
  }
  return t(n), e;
}
function Zn(n, e, t, i) {
  if (typeof e == "string")
    return { dom: n.createTextNode(e) };
  if (e.nodeType != null)
    return { dom: e };
  if (e.dom && e.dom.nodeType != null)
    return e;
  let s = e[0], r;
  if (typeof s != "string")
    throw new RangeError("Invalid array passed to renderSpec");
  if (i && (r = Ld(i)) && r.indexOf(e) > -1)
    throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
  let o = s.indexOf(" ");
  o > 0 && (t = s.slice(0, o), s = s.slice(o + 1));
  let l, a = t ? n.createElementNS(t, s) : n.createElement(s), c = e[1], d = 1;
  if (c && typeof c == "object" && c.nodeType == null && !Array.isArray(c)) {
    d = 2;
    for (let u in c)
      if (c[u] != null) {
        let p = u.indexOf(" ");
        p > 0 ? a.setAttributeNS(u.slice(0, p), u.slice(p + 1), c[u]) : u == "style" && a.style ? a.style.cssText = c[u] : a.setAttribute(u, c[u]);
      }
  }
  for (let u = d; u < e.length; u++) {
    let p = e[u];
    if (p === 0) {
      if (u < e.length - 1 || u > d)
        throw new RangeError("Content hole must be the only child of its parent node");
      return { dom: a, contentDOM: a };
    } else {
      let { dom: h, contentDOM: f } = Zn(n, p, t, i);
      if (a.appendChild(h), f) {
        if (l)
          throw new RangeError("Multiple content holes");
        l = f;
      }
    }
  }
  return { dom: a, contentDOM: l };
}
const ga = 65535, ba = Math.pow(2, 16);
function Od(n, e) {
  return n + e * ba;
}
function Mo(n) {
  return n & ga;
}
function Rd(n) {
  return (n - (n & ga)) / ba;
}
const ya = 1, va = 2, ei = 4, ka = 8;
class Ys {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.pos = e, this.delInfo = t, this.recover = i;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & ka) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (ya | ei)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (va | ei)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & ei) > 0;
  }
}
class me {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(e, t = !1) {
    if (this.ranges = e, this.inverted = t, !e.length && me.empty)
      return me.empty;
  }
  /**
  @internal
  */
  recover(e) {
    let t = 0, i = Mo(e);
    if (!this.inverted)
      for (let s = 0; s < i; s++)
        t += this.ranges[s * 3 + 2] - this.ranges[s * 3 + 1];
    return this.ranges[i * 3] + t + Rd(e);
  }
  mapResult(e, t = 1) {
    return this._map(e, t, !1);
  }
  map(e, t = 1) {
    return this._map(e, t, !0);
  }
  /**
  @internal
  */
  _map(e, t, i) {
    let s = 0, r = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? s : 0);
      if (a > e)
        break;
      let c = this.ranges[l + r], d = this.ranges[l + o], u = a + c;
      if (e <= u) {
        let p = c ? e == a ? -1 : e == u ? 1 : t : t, h = a + s + (p < 0 ? 0 : d);
        if (i)
          return h;
        let f = e == (t < 0 ? a : u) ? null : Od(l / 3, e - a), m = e == a ? va : e == u ? ya : ei;
        return (t < 0 ? e != a : e != u) && (m |= ka), new Ys(h, m, f);
      }
      s += d - c;
    }
    return i ? e + s : new Ys(e + s, 0, null);
  }
  /**
  @internal
  */
  touches(e, t) {
    let i = 0, s = Mo(t), r = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? i : 0);
      if (a > e)
        break;
      let c = this.ranges[l + r], d = a + c;
      if (e <= d && l == s * 3)
        return !0;
      i += this.ranges[l + o] - c;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(e) {
    let t = this.inverted ? 2 : 1, i = this.inverted ? 1 : 2;
    for (let s = 0, r = 0; s < this.ranges.length; s += 3) {
      let o = this.ranges[s], l = o - (this.inverted ? r : 0), a = o + (this.inverted ? 0 : r), c = this.ranges[s + t], d = this.ranges[s + i];
      e(l, l + c, a, a + d), r += d - c;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new me(this.ranges, !this.inverted);
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
  static offset(e) {
    return e == 0 ? me.empty : new me(e < 0 ? [0, -e, 0] : [0, 0, e]);
  }
}
me.empty = new me([]);
class wn {
  /**
  Create a new mapping with the given position maps.
  */
  constructor(e, t, i = 0, s = e ? e.length : 0) {
    this.mirror = t, this.from = i, this.to = s, this._maps = e || [], this.ownData = !(e || t);
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
  slice(e = 0, t = this.maps.length) {
    return new wn(this._maps, this.mirror, e, t);
  }
  /**
  Add a step map to the end of this mapping. If `mirrors` is
  given, it should be the index of the step map that is the mirror
  image of this one.
  */
  appendMap(e, t) {
    this.ownData || (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), this.ownData = !0), this.to = this._maps.push(e), t != null && this.setMirror(this._maps.length - 1, t);
  }
  /**
  Add all the step maps in a given mapping to this one (preserving
  mirroring information).
  */
  appendMapping(e) {
    for (let t = 0, i = this._maps.length; t < e._maps.length; t++) {
      let s = e.getMirror(t);
      this.appendMap(e._maps[t], s != null && s < t ? i + s : void 0);
    }
  }
  /**
  Finds the offset of the step map that mirrors the map at the
  given offset, in this mapping (as per the second argument to
  `appendMap`).
  */
  getMirror(e) {
    if (this.mirror) {
      for (let t = 0; t < this.mirror.length; t++)
        if (this.mirror[t] == e)
          return this.mirror[t + (t % 2 ? -1 : 1)];
    }
  }
  /**
  @internal
  */
  setMirror(e, t) {
    this.mirror || (this.mirror = []), this.mirror.push(e, t);
  }
  /**
  Append the inverse of the given mapping to this one.
  */
  appendMappingInverted(e) {
    for (let t = e.maps.length - 1, i = this._maps.length + e._maps.length; t >= 0; t--) {
      let s = e.getMirror(t);
      this.appendMap(e._maps[t].invert(), s != null && s > t ? i - s - 1 : void 0);
    }
  }
  /**
  Create an inverted version of this mapping.
  */
  invert() {
    let e = new wn();
    return e.appendMappingInverted(this), e;
  }
  /**
  Map a position through this mapping.
  */
  map(e, t = 1) {
    if (this.mirror)
      return this._map(e, t, !0);
    for (let i = this.from; i < this.to; i++)
      e = this._maps[i].map(e, t);
    return e;
  }
  /**
  Map a position through this mapping, returning a mapping
  result.
  */
  mapResult(e, t = 1) {
    return this._map(e, t, !1);
  }
  /**
  @internal
  */
  _map(e, t, i) {
    let s = 0;
    for (let r = this.from; r < this.to; r++) {
      let o = this._maps[r], l = o.mapResult(e, t);
      if (l.recover != null) {
        let a = this.getMirror(r);
        if (a != null && a > r && a < this.to) {
          r = a, e = this._maps[a].recover(l.recover);
          continue;
        }
      }
      s |= l.delInfo, e = l.pos;
    }
    return i ? e : new Ys(e, s, null);
  }
}
const ys = /* @__PURE__ */ Object.create(null);
class ae {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return me.empty;
  }
  /**
  Try to merge this step with another one, to be applied directly
  after it. Returns the merged step when possible, null if the
  steps can't be merged.
  */
  merge(e) {
    return null;
  }
  /**
  Deserialize a step from its JSON representation. Will call
  through to the step class' own implementation of this method.
  */
  static fromJSON(e, t) {
    if (!t || !t.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let i = ys[t.stepType];
    if (!i)
      throw new RangeError(`No step type ${t.stepType} defined`);
    return i.fromJSON(e, t);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(e, t) {
    if (e in ys)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return ys[e] = t, t.prototype.jsonID = e, t;
  }
}
class j {
  /**
  @internal
  */
  constructor(e, t) {
    this.doc = e, this.failed = t;
  }
  /**
  Create a successful step result.
  */
  static ok(e) {
    return new j(e, null);
  }
  /**
  Create a failed step result.
  */
  static fail(e) {
    return new j(null, e);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(e, t, i, s) {
    try {
      return j.ok(e.replace(t, i, s));
    } catch (r) {
      if (r instanceof ai)
        return j.fail(r.message);
      throw r;
    }
  }
}
function Lr(n, e, t) {
  let i = [];
  for (let s = 0; s < n.childCount; s++) {
    let r = n.child(s);
    r.content.size && (r = r.copy(Lr(r.content, e, r))), r.isInline && (r = e(r, t, s)), i.push(r);
  }
  return y.fromArray(i);
}
class tt extends ae {
  /**
  Create a mark step.
  */
  constructor(e, t, i) {
    super(), this.from = e, this.to = t, this.mark = i;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), i = e.resolve(this.from), s = i.node(i.sharedDepth(this.to)), r = new S(Lr(t.content, (o, l) => !o.isAtom || !l.type.allowsMarkType(this.mark.type) ? o : o.mark(this.mark.addToSet(o.marks)), s), t.openStart, t.openEnd);
    return j.fromReplace(e, this.from, this.to, r);
  }
  invert() {
    return new Le(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), i = e.mapResult(this.to, -1);
    return t.deleted && i.deleted || t.pos >= i.pos ? null : new tt(t.pos, i.pos, this.mark);
  }
  merge(e) {
    return e instanceof tt && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new tt(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
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
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new tt(t.from, t.to, e.markFromJSON(t.mark));
  }
}
ae.jsonID("addMark", tt);
class Le extends ae {
  /**
  Create a mark-removing step.
  */
  constructor(e, t, i) {
    super(), this.from = e, this.to = t, this.mark = i;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), i = new S(Lr(t.content, (s) => s.mark(this.mark.removeFromSet(s.marks)), e), t.openStart, t.openEnd);
    return j.fromReplace(e, this.from, this.to, i);
  }
  invert() {
    return new tt(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), i = e.mapResult(this.to, -1);
    return t.deleted && i.deleted || t.pos >= i.pos ? null : new Le(t.pos, i.pos, this.mark);
  }
  merge(e) {
    return e instanceof Le && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new Le(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
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
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new Le(t.from, t.to, e.markFromJSON(t.mark));
  }
}
ae.jsonID("removeMark", Le);
class nt extends ae {
  /**
  Create a node mark step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return j.fail("No node at mark step's position");
    let i = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
    return j.fromReplace(e, this.pos, this.pos + 1, new S(y.from(i), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let i = this.mark.addToSet(t.marks);
      if (i.length == t.marks.length) {
        for (let s = 0; s < t.marks.length; s++)
          if (!t.marks[s].isInSet(i))
            return new nt(this.pos, t.marks[s]);
        return new nt(this.pos, this.mark);
      }
    }
    return new At(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new nt(t.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new nt(t.pos, e.markFromJSON(t.mark));
  }
}
ae.jsonID("addNodeMark", nt);
class At extends ae {
  /**
  Create a mark-removing step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return j.fail("No node at mark step's position");
    let i = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
    return j.fromReplace(e, this.pos, this.pos + 1, new S(y.from(i), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    return !t || !this.mark.isInSet(t.marks) ? this : new nt(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new At(t.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new At(t.pos, e.markFromJSON(t.mark));
  }
}
ae.jsonID("removeNodeMark", At);
class G extends ae {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(e, t, i, s = !1) {
    super(), this.from = e, this.to = t, this.slice = i, this.structure = s;
  }
  apply(e) {
    return this.structure && Xs(e, this.from, this.to) ? j.fail("Structure replace would overwrite content") : j.fromReplace(e, this.from, this.to, this.slice);
  }
  getMap() {
    return new me([this.from, this.to - this.from, this.slice.size]);
  }
  invert(e) {
    return new G(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }
  map(e) {
    let t = e.mapResult(this.from, 1), i = e.mapResult(this.to, -1);
    return t.deletedAcross && i.deletedAcross ? null : new G(t.pos, Math.max(t.pos, i.pos), this.slice, this.structure);
  }
  merge(e) {
    if (!(e instanceof G) || e.structure || this.structure)
      return null;
    if (this.from + this.slice.size == e.from && !this.slice.openEnd && !e.slice.openStart) {
      let t = this.slice.size + e.slice.size == 0 ? S.empty : new S(this.slice.content.append(e.slice.content), this.slice.openStart, e.slice.openEnd);
      return new G(this.from, this.to + (e.to - e.from), t, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let t = this.slice.size + e.slice.size == 0 ? S.empty : new S(e.slice.content.append(this.slice.content), e.slice.openStart, this.slice.openEnd);
      return new G(e.from, this.to, t, this.structure);
    } else
      return null;
  }
  toJSON() {
    let e = { stepType: "replace", from: this.from, to: this.to };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new G(t.from, t.to, S.fromJSON(e, t.slice), !!t.structure);
  }
}
ae.jsonID("replace", G);
class Y extends ae {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(e, t, i, s, r, o, l = !1) {
    super(), this.from = e, this.to = t, this.gapFrom = i, this.gapTo = s, this.slice = r, this.insert = o, this.structure = l;
  }
  apply(e) {
    if (this.structure && (Xs(e, this.from, this.gapFrom) || Xs(e, this.gapTo, this.to)))
      return j.fail("Structure gap-replace would overwrite content");
    let t = e.slice(this.gapFrom, this.gapTo);
    if (t.openStart || t.openEnd)
      return j.fail("Gap is not a flat range");
    let i = this.slice.insertAt(this.insert, t.content);
    return i ? j.fromReplace(e, this.from, this.to, i) : j.fail("Content does not fit in gap");
  }
  getMap() {
    return new me([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(e) {
    let t = this.gapTo - this.gapFrom;
    return new Y(this.from, this.from + this.slice.size + t, this.from + this.insert, this.from + this.insert + t, e.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), i = e.mapResult(this.to, -1), s = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1), r = this.to == this.gapTo ? i.pos : e.map(this.gapTo, 1);
    return t.deletedAcross && i.deletedAcross || s < t.pos || r > i.pos ? null : new Y(t.pos, i.pos, s, r, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let e = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number" || typeof t.gapFrom != "number" || typeof t.gapTo != "number" || typeof t.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new Y(t.from, t.to, t.gapFrom, t.gapTo, S.fromJSON(e, t.slice), t.insert, !!t.structure);
  }
}
ae.jsonID("replaceAround", Y);
function Xs(n, e, t) {
  let i = n.resolve(e), s = t - e, r = i.depth;
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
function Id(n, e, t, i) {
  let s = [], r = [], o, l;
  n.doc.nodesBetween(e, t, (a, c, d) => {
    if (!a.isInline)
      return;
    let u = a.marks;
    if (!i.isInSet(u) && d.type.allowsMarkType(i.type)) {
      let p = Math.max(c, e), h = Math.min(c + a.nodeSize, t), f = i.addToSet(u);
      for (let m = 0; m < u.length; m++)
        u[m].isInSet(f) || (o && o.to == p && o.mark.eq(u[m]) ? o.to = h : s.push(o = new Le(p, h, u[m])));
      l && l.to == p ? l.to = h : r.push(l = new tt(p, h, i));
    }
  }), s.forEach((a) => n.step(a)), r.forEach((a) => n.step(a));
}
function Dd(n, e, t, i) {
  let s = [], r = 0;
  n.doc.nodesBetween(e, t, (o, l) => {
    if (!o.isInline)
      return;
    r++;
    let a = null;
    if (i instanceof Yi) {
      let c = o.marks, d;
      for (; d = i.isInSet(c); )
        (a || (a = [])).push(d), c = d.removeFromSet(c);
    } else i ? i.isInSet(o.marks) && (a = [i]) : a = o.marks;
    if (a && a.length) {
      let c = Math.min(l + o.nodeSize, t);
      for (let d = 0; d < a.length; d++) {
        let u = a[d], p;
        for (let h = 0; h < s.length; h++) {
          let f = s[h];
          f.step == r - 1 && u.eq(s[h].style) && (p = f);
        }
        p ? (p.to = c, p.step = r) : s.push({ style: u, from: Math.max(l, e), to: c, step: r });
      }
    }
  }), s.forEach((o) => n.step(new Le(o.from, o.to, o.style)));
}
function Nr(n, e, t, i = t.contentMatch, s = !0) {
  let r = n.doc.nodeAt(e), o = [], l = e + 1;
  for (let a = 0; a < r.childCount; a++) {
    let c = r.child(a), d = l + c.nodeSize, u = i.matchType(c.type);
    if (!u)
      o.push(new G(l, d, S.empty));
    else {
      i = u;
      for (let p = 0; p < c.marks.length; p++)
        t.allowsMarkType(c.marks[p].type) || n.step(new Le(l, d, c.marks[p]));
      if (s && c.isText && t.whitespace != "pre") {
        let p, h = /\r?\n|\r/g, f;
        for (; p = h.exec(c.text); )
          f || (f = new S(y.from(t.schema.text(" ", t.allowedMarks(c.marks))), 0, 0)), o.push(new G(l + p.index, l + p.index + p[0].length, f));
      }
    }
    l = d;
  }
  if (!i.validEnd) {
    let a = i.fillBefore(y.empty, !0);
    n.replace(l, l, new S(a, 0, 0));
  }
  for (let a = o.length - 1; a >= 0; a--)
    n.step(o[a]);
}
function Pd(n, e, t) {
  return (e == 0 || n.canReplace(e, n.childCount)) && (t == n.childCount || n.canReplace(0, t));
}
function Yt(n) {
  let t = n.parent.content.cutByIndex(n.startIndex, n.endIndex);
  for (let i = n.depth, s = 0, r = 0; ; --i) {
    let o = n.$from.node(i), l = n.$from.index(i) + s, a = n.$to.indexAfter(i) - r;
    if (i < n.depth && o.canReplace(l, a, t))
      return i;
    if (i == 0 || o.type.spec.isolating || !Pd(o, l, a))
      break;
    l && (s = 1), a < o.childCount && (r = 1);
  }
  return null;
}
function Bd(n, e, t) {
  let { $from: i, $to: s, depth: r } = e, o = i.before(r + 1), l = s.after(r + 1), a = o, c = l, d = y.empty, u = 0;
  for (let f = r, m = !1; f > t; f--)
    m || i.index(f) > 0 ? (m = !0, d = y.from(i.node(f).copy(d)), u++) : a--;
  let p = y.empty, h = 0;
  for (let f = r, m = !1; f > t; f--)
    m || s.after(f + 1) < s.end(f) ? (m = !0, p = y.from(s.node(f).copy(p)), h++) : c++;
  n.step(new Y(a, c, o, l, new S(d.append(p), u, h), d.size - u, !0));
}
function Or(n, e, t = null, i = n) {
  let s = Hd(n, e), r = s && zd(i, e);
  return r ? s.map(Eo).concat({ type: e, attrs: t }).concat(r.map(Eo)) : null;
}
function Eo(n) {
  return { type: n, attrs: null };
}
function Hd(n, e) {
  let { parent: t, startIndex: i, endIndex: s } = n, r = t.contentMatchAt(i).findWrapping(e);
  if (!r)
    return null;
  let o = r.length ? r[0] : e;
  return t.canReplaceWith(i, s, o) ? r : null;
}
function zd(n, e) {
  let { parent: t, startIndex: i, endIndex: s } = n, r = t.child(i), o = e.contentMatch.findWrapping(r.type);
  if (!o)
    return null;
  let a = (o.length ? o[o.length - 1] : e).contentMatch;
  for (let c = i; a && c < s; c++)
    a = a.matchType(t.child(c).type);
  return !a || !a.validEnd ? null : o;
}
function $d(n, e, t) {
  let i = y.empty;
  for (let o = t.length - 1; o >= 0; o--) {
    if (i.size) {
      let l = t[o].type.contentMatch.matchFragment(i);
      if (!l || !l.validEnd)
        throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
    }
    i = y.from(t[o].type.create(t[o].attrs, i));
  }
  let s = e.start, r = e.end;
  n.step(new Y(s, r, s, r, new S(i, 0, 0), t.length, !0));
}
function Fd(n, e, t, i, s) {
  if (!i.isTextblock)
    throw new RangeError("Type given to setBlockType should be a textblock");
  let r = n.steps.length;
  n.doc.nodesBetween(e, t, (o, l) => {
    let a = typeof s == "function" ? s(o) : s;
    if (o.isTextblock && !o.hasMarkup(i, a) && qd(n.doc, n.mapping.slice(r).map(l), i)) {
      let c = null;
      if (i.schema.linebreakReplacement) {
        let h = i.whitespace == "pre", f = !!i.contentMatch.matchType(i.schema.linebreakReplacement);
        h && !f ? c = !1 : !h && f && (c = !0);
      }
      c === !1 && xa(n, o, l, r), Nr(n, n.mapping.slice(r).map(l, 1), i, void 0, c === null);
      let d = n.mapping.slice(r), u = d.map(l, 1), p = d.map(l + o.nodeSize, 1);
      return n.step(new Y(u, p, u + 1, p - 1, new S(y.from(i.create(a, null, o.marks)), 0, 0), 1, !0)), c === !0 && wa(n, o, l, r), !1;
    }
  });
}
function wa(n, e, t, i) {
  e.forEach((s, r) => {
    if (s.isText) {
      let o, l = /\r?\n|\r/g;
      for (; o = l.exec(s.text); ) {
        let a = n.mapping.slice(i).map(t + 1 + r + o.index);
        n.replaceWith(a, a + 1, e.type.schema.linebreakReplacement.create());
      }
    }
  });
}
function xa(n, e, t, i) {
  e.forEach((s, r) => {
    if (s.type == s.type.schema.linebreakReplacement) {
      let o = n.mapping.slice(i).map(t + 1 + r);
      n.replaceWith(o, o + 1, e.type.schema.text(`
`));
    }
  });
}
function qd(n, e, t) {
  let i = n.resolve(e), s = i.index();
  return i.parent.canReplaceWith(s, s + 1, t);
}
function Vd(n, e, t, i, s) {
  let r = n.doc.nodeAt(e);
  if (!r)
    throw new RangeError("No node at given position");
  t || (t = r.type);
  let o = t.create(i, null, s || r.marks);
  if (r.isLeaf)
    return n.replaceWith(e, e + r.nodeSize, o);
  if (!t.validContent(r.content))
    throw new RangeError("Invalid content for node type " + t.name);
  n.step(new Y(e, e + r.nodeSize, e + 1, e + r.nodeSize - 1, new S(y.from(o), 0, 0), 1, !0));
}
function We(n, e, t = 1, i) {
  let s = n.resolve(e), r = s.depth - t, o = i && i[i.length - 1] || s.parent;
  if (r < 0 || s.parent.type.spec.isolating || !s.parent.canReplace(s.index(), s.parent.childCount) || !o.type.validContent(s.parent.content.cutByIndex(s.index(), s.parent.childCount)))
    return !1;
  for (let c = s.depth - 1, d = t - 2; c > r; c--, d--) {
    let u = s.node(c), p = s.index(c);
    if (u.type.spec.isolating)
      return !1;
    let h = u.content.cutByIndex(p, u.childCount), f = i && i[d + 1];
    f && (h = h.replaceChild(0, f.type.create(f.attrs)));
    let m = i && i[d] || u;
    if (!u.canReplace(p + 1, u.childCount) || !m.type.validContent(h))
      return !1;
  }
  let l = s.indexAfter(r), a = i && i[0];
  return s.node(r).canReplaceWith(l, l, a ? a.type : s.node(r + 1).type);
}
function Ud(n, e, t = 1, i) {
  let s = n.doc.resolve(e), r = y.empty, o = y.empty;
  for (let l = s.depth, a = s.depth - t, c = t - 1; l > a; l--, c--) {
    r = y.from(s.node(l).copy(r));
    let d = i && i[c];
    o = y.from(d ? d.type.create(d.attrs, o) : s.node(l).copy(o));
  }
  n.step(new G(e, e, new S(r.append(o), t, t), !0));
}
function ut(n, e) {
  let t = n.resolve(e), i = t.index();
  return Sa(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(i, i + 1);
}
function Wd(n, e) {
  e.content.size || n.type.compatibleContent(e.type);
  let t = n.contentMatchAt(n.childCount), { linebreakReplacement: i } = n.type.schema;
  for (let s = 0; s < e.childCount; s++) {
    let r = e.child(s), o = r.type == i ? n.type.schema.nodes.text : r.type;
    if (t = t.matchType(o), !t || !n.type.allowsMarks(r.marks))
      return !1;
  }
  return t.validEnd;
}
function Sa(n, e) {
  return !!(n && e && !n.isLeaf && Wd(n, e));
}
function Xi(n, e, t = -1) {
  let i = n.resolve(e);
  for (let s = i.depth; ; s--) {
    let r, o, l = i.index(s);
    if (s == i.depth ? (r = i.nodeBefore, o = i.nodeAfter) : t > 0 ? (r = i.node(s + 1), l++, o = i.node(s).maybeChild(l)) : (r = i.node(s).maybeChild(l - 1), o = i.node(s + 1)), r && !r.isTextblock && Sa(r, o) && i.node(s).canReplace(l, l + 1))
      return e;
    if (s == 0)
      break;
    e = t < 0 ? i.before(s) : i.after(s);
  }
}
function jd(n, e, t) {
  let i = null, { linebreakReplacement: s } = n.doc.type.schema, r = n.doc.resolve(e - t), o = r.node().type;
  if (s && o.inlineContent) {
    let d = o.whitespace == "pre", u = !!o.contentMatch.matchType(s);
    d && !u ? i = !1 : !d && u && (i = !0);
  }
  let l = n.steps.length;
  if (i === !1) {
    let d = n.doc.resolve(e + t);
    xa(n, d.node(), d.before(), l);
  }
  o.inlineContent && Nr(n, e + t - 1, o, r.node().contentMatchAt(r.index()), i == null);
  let a = n.mapping.slice(l), c = a.map(e - t);
  if (n.step(new G(c, a.map(e + t, -1), S.empty, !0)), i === !0) {
    let d = n.doc.resolve(c);
    wa(n, d.node(), d.before(), n.steps.length);
  }
  return n;
}
function Kd(n, e, t) {
  let i = n.resolve(e);
  if (i.parent.canReplaceWith(i.index(), i.index(), t))
    return e;
  if (i.parentOffset == 0)
    for (let s = i.depth - 1; s >= 0; s--) {
      let r = i.index(s);
      if (i.node(s).canReplaceWith(r, r, t))
        return i.before(s + 1);
      if (r > 0)
        return null;
    }
  if (i.parentOffset == i.parent.content.size)
    for (let s = i.depth - 1; s >= 0; s--) {
      let r = i.indexAfter(s);
      if (i.node(s).canReplaceWith(r, r, t))
        return i.after(s + 1);
      if (r < i.node(s).childCount)
        return null;
    }
  return null;
}
function Ca(n, e, t) {
  let i = n.resolve(e);
  if (!t.content.size)
    return e;
  let s = t.content;
  for (let r = 0; r < t.openStart; r++)
    s = s.firstChild.content;
  for (let r = 1; r <= (t.openStart == 0 && t.size ? 2 : 1); r++)
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
function Qi(n, e, t = e, i = S.empty) {
  if (e == t && !i.size)
    return null;
  let s = n.resolve(e), r = n.resolve(t);
  return Ma(s, r, i) ? new G(e, t, i) : new Jd(s, r, i).fit();
}
function Ma(n, e, t) {
  return !t.openStart && !t.openEnd && n.start() == e.start() && n.parent.canReplace(n.index(), e.index(), t.content);
}
class Jd {
  constructor(e, t, i) {
    this.$from = e, this.$to = t, this.unplaced = i, this.frontier = [], this.placed = y.empty;
    for (let s = 0; s <= e.depth; s++) {
      let r = e.node(s);
      this.frontier.push({
        type: r.type,
        match: r.contentMatchAt(e.indexAfter(s))
      });
    }
    for (let s = e.depth; s > 0; s--)
      this.placed = y.from(e.node(s).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, i = this.$from, s = this.close(e < 0 ? this.$to : i.doc.resolve(e));
    if (!s)
      return null;
    let r = this.placed, o = i.depth, l = s.depth;
    for (; o && l && r.childCount == 1; )
      r = r.firstChild.content, o--, l--;
    let a = new S(r, o, l);
    return e > -1 ? new Y(i.pos, e, this.$to.pos, this.$to.end(), a, t) : a.size || i.pos != this.$to.pos ? new G(i.pos, s.pos, a) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, i = 0, s = this.unplaced.openEnd; i < e; i++) {
      let r = t.firstChild;
      if (t.childCount > 1 && (s = 0), r.type.spec.isolating && s <= i) {
        e = i;
        break;
      }
      t = r.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let i = t == 1 ? e : this.unplaced.openStart; i >= 0; i--) {
        let s, r = null;
        i ? (r = vs(this.unplaced.content, i - 1).firstChild, s = r.content) : s = this.unplaced.content;
        let o = s.firstChild;
        for (let l = this.depth; l >= 0; l--) {
          let { type: a, match: c } = this.frontier[l], d, u = null;
          if (t == 1 && (o ? c.matchType(o.type) || (u = c.fillBefore(y.from(o), !1)) : r && a.compatibleContent(r.type)))
            return { sliceDepth: i, frontierDepth: l, parent: r, inject: u };
          if (t == 2 && o && (d = c.findWrapping(o.type)))
            return { sliceDepth: i, frontierDepth: l, parent: r, wrap: d };
          if (r && c.matchType(r.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: t, openEnd: i } = this.unplaced, s = vs(e, t);
    return !s.childCount || s.firstChild.isLeaf ? !1 : (this.unplaced = new S(e, t + 1, Math.max(i, s.size + t >= e.size - i ? t + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: t, openEnd: i } = this.unplaced, s = vs(e, t);
    if (s.childCount <= 1 && t > 0) {
      let r = e.size - t <= t + s.size;
      this.unplaced = new S(sn(e, t - 1, 1), t - 1, r ? t - 1 : i);
    } else
      this.unplaced = new S(sn(e, t, 1), t, i);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: t, parent: i, inject: s, wrap: r }) {
    for (; this.depth > t; )
      this.closeFrontierNode();
    if (r)
      for (let m = 0; m < r.length; m++)
        this.openFrontierNode(r[m]);
    let o = this.unplaced, l = i ? i.content : o.content, a = o.openStart - e, c = 0, d = [], { match: u, type: p } = this.frontier[t];
    if (s) {
      for (let m = 0; m < s.childCount; m++)
        d.push(s.child(m));
      u = u.matchFragment(s);
    }
    let h = l.size + e - (o.content.size - o.openEnd);
    for (; c < l.childCount; ) {
      let m = l.child(c), g = u.matchType(m.type);
      if (!g)
        break;
      c++, (c > 1 || a == 0 || m.content.size) && (u = g, d.push(Ea(m.mark(p.allowedMarks(m.marks)), c == 1 ? a : 0, c == l.childCount ? h : -1)));
    }
    let f = c == l.childCount;
    f || (h = -1), this.placed = rn(this.placed, t, y.from(d)), this.frontier[t].match = u, f && h < 0 && i && i.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let m = 0, g = l; m < h; m++) {
      let b = g.lastChild;
      this.frontier.push({ type: b.type, match: b.contentMatchAt(b.childCount) }), g = b.content;
    }
    this.unplaced = f ? e == 0 ? S.empty : new S(sn(o.content, e - 1, 1), e - 1, h < 0 ? o.openEnd : e - 1) : new S(sn(o.content, e, c), o.openStart, o.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], t;
    if (!e.type.isTextblock || !ks(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
      return -1;
    let { depth: i } = this.$to, s = this.$to.after(i);
    for (; i > 1 && s == this.$to.end(--i); )
      ++s;
    return s;
  }
  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: i, type: s } = this.frontier[t], r = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), o = ks(e, t, s, i, r);
      if (o) {
        for (let l = t - 1; l >= 0; l--) {
          let { match: a, type: c } = this.frontier[l], d = ks(e, l, c, a, !0);
          if (!d || d.childCount)
            continue e;
        }
        return { depth: t, fit: o, move: r ? e.doc.resolve(e.after(t + 1)) : e };
      }
    }
  }
  close(e) {
    let t = this.findCloseLevel(e);
    if (!t)
      return null;
    for (; this.depth > t.depth; )
      this.closeFrontierNode();
    t.fit.childCount && (this.placed = rn(this.placed, t.depth, t.fit)), e = t.move;
    for (let i = t.depth + 1; i <= e.depth; i++) {
      let s = e.node(i), r = s.type.contentMatch.fillBefore(s.content, !0, e.index(i));
      this.openFrontierNode(s.type, s.attrs, r);
    }
    return e;
  }
  openFrontierNode(e, t = null, i) {
    let s = this.frontier[this.depth];
    s.match = s.match.matchType(e), this.placed = rn(this.placed, this.depth, y.from(e.create(t, i))), this.frontier.push({ type: e, match: e.contentMatch });
  }
  closeFrontierNode() {
    let t = this.frontier.pop().match.fillBefore(y.empty, !0);
    t.childCount && (this.placed = rn(this.placed, this.frontier.length, t));
  }
}
function sn(n, e, t) {
  return e == 0 ? n.cutByIndex(t, n.childCount) : n.replaceChild(0, n.firstChild.copy(sn(n.firstChild.content, e - 1, t)));
}
function rn(n, e, t) {
  return e == 0 ? n.append(t) : n.replaceChild(n.childCount - 1, n.lastChild.copy(rn(n.lastChild.content, e - 1, t)));
}
function vs(n, e) {
  for (let t = 0; t < e; t++)
    n = n.firstChild.content;
  return n;
}
function Ea(n, e, t) {
  if (e <= 0)
    return n;
  let i = n.content;
  return e > 1 && (i = i.replaceChild(0, Ea(i.firstChild, e - 1, i.childCount == 1 ? t - 1 : 0))), e > 0 && (i = n.type.contentMatch.fillBefore(i).append(i), t <= 0 && (i = i.append(n.type.contentMatch.matchFragment(i).fillBefore(y.empty, !0)))), n.copy(i);
}
function ks(n, e, t, i, s) {
  let r = n.node(e), o = s ? n.indexAfter(e) : n.index(e);
  if (o == r.childCount && !t.compatibleContent(r.type))
    return null;
  let l = i.fillBefore(r.content, !0, o);
  return l && !Gd(t, r.content, o) ? l : null;
}
function Gd(n, e, t) {
  for (let i = t; i < e.childCount; i++)
    if (!n.allowsMarks(e.child(i).marks))
      return !0;
  return !1;
}
function Yd(n) {
  return n.spec.defining || n.spec.definingForContent;
}
function Xd(n, e, t, i) {
  if (!i.size)
    return n.deleteRange(e, t);
  let s = n.doc.resolve(e), r = n.doc.resolve(t);
  if (Ma(s, r, i))
    return n.step(new G(e, t, i));
  let o = Aa(s, r);
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
    let h = c[p], f = Yd(h.type);
    if (f && !h.sameMarkup(s.node(Math.abs(l) - 1)))
      d = p;
    else if (f || !h.type.isTextblock)
      break;
  }
  for (let p = i.openStart; p >= 0; p--) {
    let h = (p + d + 1) % (i.openStart + 1), f = c[h];
    if (f)
      for (let m = 0; m < o.length; m++) {
        let g = o[(m + a) % o.length], b = !0;
        g < 0 && (b = !1, g = -g);
        let v = s.node(g - 1), k = s.index(g - 1);
        if (v.canReplaceWith(k, k, f.type, f.marks))
          return n.replace(s.before(g), b ? r.after(g) : t, new S(Ta(i.content, 0, i.openStart, h), h, i.openEnd));
      }
  }
  let u = n.steps.length;
  for (let p = o.length - 1; p >= 0 && (n.replace(e, t, i), !(n.steps.length > u)); p--) {
    let h = o[p];
    h < 0 || (e = s.before(h), t = r.after(h));
  }
}
function Ta(n, e, t, i, s) {
  if (e < t) {
    let r = n.firstChild;
    n = n.replaceChild(0, r.copy(Ta(r.content, e + 1, t, i, r)));
  }
  if (e > i) {
    let r = s.contentMatchAt(0), o = r.fillBefore(n).append(n);
    n = o.append(r.matchFragment(o).fillBefore(y.empty, !0));
  }
  return n;
}
function Qd(n, e, t, i) {
  if (!i.isInline && e == t && n.doc.resolve(e).parent.content.size) {
    let s = Kd(n.doc, e, i.type);
    s != null && (e = t = s);
  }
  n.replaceRange(e, t, new S(y.from(i), 0, 0));
}
function Zd(n, e, t) {
  let i = n.doc.resolve(e), s = n.doc.resolve(t), r = Aa(i, s);
  for (let o = 0; o < r.length; o++) {
    let l = r[o], a = o == r.length - 1;
    if (a && l == 0 || i.node(l).type.contentMatch.validEnd)
      return n.delete(i.start(l), s.end(l));
    if (l > 0 && (a || i.node(l - 1).canReplace(i.index(l - 1), s.indexAfter(l - 1))))
      return n.delete(i.before(l), s.after(l));
  }
  for (let o = 1; o <= i.depth && o <= s.depth; o++)
    if (e - i.start(o) == i.depth - o && t > i.end(o) && s.end(o) - t != s.depth - o && i.start(o - 1) == s.start(o - 1) && i.node(o - 1).canReplace(i.index(o - 1), s.index(o - 1)))
      return n.delete(i.before(o), t);
  n.delete(e, t);
}
function Aa(n, e) {
  let t = [], i = Math.min(n.depth, e.depth);
  for (let s = i; s >= 0; s--) {
    let r = n.start(s);
    if (r < n.pos - (n.depth - s) || e.end(s) > e.pos + (e.depth - s) || n.node(s).type.spec.isolating || e.node(s).type.spec.isolating)
      break;
    (r == e.start(s) || s == n.depth && s == e.depth && n.parent.inlineContent && e.parent.inlineContent && s && e.start(s - 1) == r - 1) && t.push(s);
  }
  return t;
}
class Ut extends ae {
  /**
  Construct an attribute step.
  */
  constructor(e, t, i) {
    super(), this.pos = e, this.attr = t, this.value = i;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return j.fail("No node at attribute step's position");
    let i = /* @__PURE__ */ Object.create(null);
    for (let r in t.attrs)
      i[r] = t.attrs[r];
    i[this.attr] = this.value;
    let s = t.type.create(i, null, t.marks);
    return j.fromReplace(e, this.pos, this.pos + 1, new S(y.from(s), 0, t.isLeaf ? 0 : 1));
  }
  getMap() {
    return me.empty;
  }
  invert(e) {
    return new Ut(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Ut(t.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.pos != "number" || typeof t.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new Ut(t.pos, t.attr, t.value);
  }
}
ae.jsonID("attr", Ut);
class xn extends ae {
  /**
  Construct an attribute step.
  */
  constructor(e, t) {
    super(), this.attr = e, this.value = t;
  }
  apply(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let s in e.attrs)
      t[s] = e.attrs[s];
    t[this.attr] = this.value;
    let i = e.type.create(t, e.content, e.marks);
    return j.ok(i);
  }
  getMap() {
    return me.empty;
  }
  invert(e) {
    return new xn(this.attr, e.attrs[this.attr]);
  }
  map(e) {
    return this;
  }
  toJSON() {
    return { stepType: "docAttr", attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.attr != "string")
      throw new RangeError("Invalid input for DocAttrStep.fromJSON");
    return new xn(t.attr, t.value);
  }
}
ae.jsonID("docAttr", xn);
let jt = class extends Error {
};
jt = function n(e) {
  let t = Error.call(this, e);
  return t.__proto__ = n.prototype, t;
};
jt.prototype = Object.create(Error.prototype);
jt.prototype.constructor = jt;
jt.prototype.name = "TransformError";
class Rr {
  /**
  Create a transform that starts with the given document.
  */
  constructor(e) {
    this.doc = e, this.steps = [], this.docs = [], this.mapping = new wn();
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
  step(e) {
    let t = this.maybeStep(e);
    if (t.failed)
      throw new jt(t.failed);
    return this;
  }
  /**
  Try to apply a step in this transformation, ignoring it if it
  fails. Returns the step result.
  */
  maybeStep(e) {
    let t = e.apply(this.doc);
    return t.failed || this.addStep(e, t.doc), t;
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
    let e = 1e9, t = -1e9;
    for (let i = 0; i < this.mapping.maps.length; i++) {
      let s = this.mapping.maps[i];
      i && (e = s.map(e, 1), t = s.map(t, -1)), s.forEach((r, o, l, a) => {
        e = Math.min(e, l), t = Math.max(t, a);
      });
    }
    return e == 1e9 ? null : { from: e, to: t };
  }
  /**
  @internal
  */
  addStep(e, t) {
    this.docs.push(this.doc), this.steps.push(e), this.mapping.appendMap(e.getMap()), this.doc = t;
  }
  /**
  Replace the part of the document between `from` and `to` with the
  given `slice`.
  */
  replace(e, t = e, i = S.empty) {
    let s = Qi(this.doc, e, t, i);
    return s && this.step(s), this;
  }
  /**
  Replace the given range with the given content, which may be a
  fragment, node, or array of nodes.
  */
  replaceWith(e, t, i) {
    return this.replace(e, t, new S(y.from(i), 0, 0));
  }
  /**
  Delete the content between the given positions.
  */
  delete(e, t) {
    return this.replace(e, t, S.empty);
  }
  /**
  Insert the given content at the given position.
  */
  insert(e, t) {
    return this.replaceWith(e, e, t);
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
  replaceRange(e, t, i) {
    return Xd(this, e, t, i), this;
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
  replaceRangeWith(e, t, i) {
    return Qd(this, e, t, i), this;
  }
  /**
  Delete the given range, expanding it to cover fully covered
  parent nodes until a valid replace is found.
  */
  deleteRange(e, t) {
    return Zd(this, e, t), this;
  }
  /**
  Split the content in the given range off from its parent, if there
  is sibling content before or after it, and move it up the tree to
  the depth specified by `target`. You'll probably want to use
  [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
  sure the lift is valid.
  */
  lift(e, t) {
    return Bd(this, e, t), this;
  }
  /**
  Join the blocks around the given position. If depth is 2, their
  last and first siblings are also joined, and so on.
  */
  join(e, t = 1) {
    return jd(this, e, t), this;
  }
  /**
  Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
  The wrappers are assumed to be valid in this position, and should
  probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
  */
  wrap(e, t) {
    return $d(this, e, t), this;
  }
  /**
  Set the type of all textblocks (partly) between `from` and `to` to
  the given node type with the given attributes.
  */
  setBlockType(e, t = e, i, s = null) {
    return Fd(this, e, t, i, s), this;
  }
  /**
  Change the type, attributes, and/or marks of the node at `pos`.
  When `type` isn't given, the existing node type is preserved,
  */
  setNodeMarkup(e, t, i = null, s) {
    return Vd(this, e, t, i, s), this;
  }
  /**
  Set a single attribute on a given node to a new value.
  The `pos` addresses the document content. Use `setDocAttribute`
  to set attributes on the document itself.
  */
  setNodeAttribute(e, t, i) {
    return this.step(new Ut(e, t, i)), this;
  }
  /**
  Set a single attribute on the document to a new value.
  */
  setDocAttribute(e, t) {
    return this.step(new xn(e, t)), this;
  }
  /**
  Add a mark to the node at position `pos`.
  */
  addNodeMark(e, t) {
    return this.step(new nt(e, t)), this;
  }
  /**
  Remove a mark (or all marks of the given type) from the node at
  position `pos`.
  */
  removeNodeMark(e, t) {
    let i = this.doc.nodeAt(e);
    if (!i)
      throw new RangeError("No node at position " + e);
    if (t instanceof P)
      t.isInSet(i.marks) && this.step(new At(e, t));
    else {
      let s = i.marks, r, o = [];
      for (; r = t.isInSet(s); )
        o.push(new At(e, r)), s = r.removeFromSet(s);
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
  split(e, t = 1, i) {
    return Ud(this, e, t, i), this;
  }
  /**
  Add the given mark to the inline content between `from` and `to`.
  */
  addMark(e, t, i) {
    return Id(this, e, t, i), this;
  }
  /**
  Remove marks from inline nodes between `from` and `to`. When
  `mark` is a single mark, remove precisely that mark. When it is
  a mark type, remove all marks of that type. When it is null,
  remove all marks of any type.
  */
  removeMark(e, t, i) {
    return Dd(this, e, t, i), this;
  }
  /**
  Removes all marks and nodes from the content of the node at
  `pos` that don't match the given new parent node type. Accepts
  an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
  third argument.
  */
  clearIncompatible(e, t, i) {
    return Nr(this, e, t, i), this;
  }
}
const ws = /* @__PURE__ */ Object.create(null);
class L {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, t, i) {
    this.$anchor = e, this.$head = t, this.ranges = i || [new _a(e.min(t), e.max(t))];
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
    let e = this.ranges;
    for (let t = 0; t < e.length; t++)
      if (e[t].$from.pos != e[t].$to.pos)
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
  replace(e, t = S.empty) {
    let i = t.content.lastChild, s = null;
    for (let l = 0; l < t.openEnd; l++)
      s = i, i = i.lastChild;
    let r = e.steps.length, o = this.ranges;
    for (let l = 0; l < o.length; l++) {
      let { $from: a, $to: c } = o[l], d = e.mapping.slice(r);
      e.replaceRange(d.map(a.pos), d.map(c.pos), l ? S.empty : t), l == 0 && _o(e, r, (i ? i.isInline : s && s.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, t) {
    let i = e.steps.length, s = this.ranges;
    for (let r = 0; r < s.length; r++) {
      let { $from: o, $to: l } = s[r], a = e.mapping.slice(i), c = a.map(o.pos), d = a.map(l.pos);
      r ? e.deleteRange(c, d) : (e.replaceRangeWith(c, d, t), _o(e, i, t.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(e, t, i = !1) {
    let s = e.parent.inlineContent ? new _(e) : Ht(e.node(0), e.parent, e.pos, e.index(), t, i);
    if (s)
      return s;
    for (let r = e.depth - 1; r >= 0; r--) {
      let o = t < 0 ? Ht(e.node(0), e.node(r), e.before(r + 1), e.index(r), t, i) : Ht(e.node(0), e.node(r), e.after(r + 1), e.index(r) + 1, t, i);
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
  static near(e, t = 1) {
    return this.findFrom(e, t) || this.findFrom(e, -t) || new be(e.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(e) {
    return Ht(e, e, 0, 0, 1) || new be(e);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(e) {
    return Ht(e, e, e.content.size, e.childCount, -1) || new be(e);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(e, t) {
    if (!t || !t.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let i = ws[t.type];
    if (!i)
      throw new RangeError(`No selection type ${t.type} defined`);
    return i.fromJSON(e, t);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(e, t) {
    if (e in ws)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return ws[e] = t, t.prototype.jsonID = e, t;
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
    return _.between(this.$anchor, this.$head).getBookmark();
  }
}
L.prototype.visible = !0;
class _a {
  /**
  Create a range.
  */
  constructor(e, t) {
    this.$from = e, this.$to = t;
  }
}
let To = !1;
function Ao(n) {
  !To && !n.parent.inlineContent && (To = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + n.parent.type.name + ")"));
}
class _ extends L {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, t = e) {
    Ao(e), Ao(t), super(e, t);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(e, t) {
    let i = e.resolve(t.map(this.head));
    if (!i.parent.inlineContent)
      return L.near(i);
    let s = e.resolve(t.map(this.anchor));
    return new _(s.parent.inlineContent ? s : i, i);
  }
  replace(e, t = S.empty) {
    if (super.replace(e, t), t == S.empty) {
      let i = this.$from.marksAcross(this.$to);
      i && e.ensureMarks(i);
    }
  }
  eq(e) {
    return e instanceof _ && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new Zi(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number" || typeof t.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new _(e.resolve(t.anchor), e.resolve(t.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, t, i = t) {
    let s = e.resolve(t);
    return new this(s, i == t ? s : e.resolve(i));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(e, t, i) {
    let s = e.pos - t.pos;
    if ((!i || s) && (i = s >= 0 ? 1 : -1), !t.parent.inlineContent) {
      let r = L.findFrom(t, i, !0) || L.findFrom(t, -i, !0);
      if (r)
        t = r.$head;
      else
        return L.near(t, i);
    }
    return e.parent.inlineContent || (s == 0 ? e = t : (e = (L.findFrom(e, -i, !0) || L.findFrom(e, i, !0)).$anchor, e.pos < t.pos != s < 0 && (e = t))), new _(e, t);
  }
}
L.jsonID("text", _);
class Zi {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Zi(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return _.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class A extends L {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let t = e.nodeAfter, i = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, i), this.node = t;
  }
  map(e, t) {
    let { deleted: i, pos: s } = t.mapResult(this.anchor), r = e.resolve(s);
    return i ? L.near(r) : new A(r);
  }
  content() {
    return new S(y.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof A && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Ir(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new A(e.resolve(t.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(e, t) {
    return new A(e.resolve(t));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
A.prototype.visible = !1;
L.jsonID("node", A);
class Ir {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: t, pos: i } = e.mapResult(this.anchor);
    return t ? new Zi(i, i) : new Ir(i);
  }
  resolve(e) {
    let t = e.resolve(this.anchor), i = t.nodeAfter;
    return i && A.isSelectable(i) ? new A(t) : L.near(t);
  }
}
class be extends L {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, t = S.empty) {
    if (t == S.empty) {
      e.delete(0, e.doc.content.size);
      let i = L.atStart(e.doc);
      i.eq(e.selection) || e.setSelection(i);
    } else
      super.replace(e, t);
  }
  toJSON() {
    return { type: "all" };
  }
  /**
  @internal
  */
  static fromJSON(e) {
    return new be(e);
  }
  map(e) {
    return new be(e);
  }
  eq(e) {
    return e instanceof be;
  }
  getBookmark() {
    return eu;
  }
}
L.jsonID("all", be);
const eu = {
  map() {
    return this;
  },
  resolve(n) {
    return new be(n);
  }
};
function Ht(n, e, t, i, s, r = !1) {
  if (e.inlineContent)
    return _.create(n, t);
  for (let o = i - (s > 0 ? 0 : 1); s > 0 ? o < e.childCount : o >= 0; o += s) {
    let l = e.child(o);
    if (l.isAtom) {
      if (!r && A.isSelectable(l))
        return A.create(n, t - (s < 0 ? l.nodeSize : 0));
    } else {
      let a = Ht(n, l, t + s, s < 0 ? l.childCount : 0, s, r);
      if (a)
        return a;
    }
    t += l.nodeSize * s;
  }
  return null;
}
function _o(n, e, t) {
  let i = n.steps.length - 1;
  if (i < e)
    return;
  let s = n.steps[i];
  if (!(s instanceof G || s instanceof Y))
    return;
  let r = n.mapping.maps[i], o;
  r.forEach((l, a, c, d) => {
    o == null && (o = d);
  }), n.setSelection(L.near(n.doc.resolve(o), t));
}
const Lo = 1, zn = 2, No = 4;
class tu extends Rr {
  /**
  @internal
  */
  constructor(e) {
    super(e.doc), this.curSelectionFor = 0, this.updated = 0, this.meta = /* @__PURE__ */ Object.create(null), this.time = Date.now(), this.curSelection = e.selection, this.storedMarks = e.storedMarks;
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
  setSelection(e) {
    if (e.$from.doc != this.doc)
      throw new RangeError("Selection passed to setSelection must point at the current document");
    return this.curSelection = e, this.curSelectionFor = this.steps.length, this.updated = (this.updated | Lo) & ~zn, this.storedMarks = null, this;
  }
  /**
  Whether the selection was explicitly updated by this transaction.
  */
  get selectionSet() {
    return (this.updated & Lo) > 0;
  }
  /**
  Set the current stored marks.
  */
  setStoredMarks(e) {
    return this.storedMarks = e, this.updated |= zn, this;
  }
  /**
  Make sure the current stored marks or, if that is null, the marks
  at the selection, match the given set of marks. Does nothing if
  this is already the case.
  */
  ensureMarks(e) {
    return P.sameSet(this.storedMarks || this.selection.$from.marks(), e) || this.setStoredMarks(e), this;
  }
  /**
  Add a mark to the set of stored marks.
  */
  addStoredMark(e) {
    return this.ensureMarks(e.addToSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Remove a mark or mark type from the set of stored marks.
  */
  removeStoredMark(e) {
    return this.ensureMarks(e.removeFromSet(this.storedMarks || this.selection.$head.marks()));
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
  addStep(e, t) {
    super.addStep(e, t), this.updated = this.updated & ~zn, this.storedMarks = null;
  }
  /**
  Update the timestamp for the transaction.
  */
  setTime(e) {
    return this.time = e, this;
  }
  /**
  Replace the current selection with the given slice.
  */
  replaceSelection(e) {
    return this.selection.replace(this, e), this;
  }
  /**
  Replace the selection with the given node. When `inheritMarks` is
  true and the content is inline, it inherits the marks from the
  place where it is inserted.
  */
  replaceSelectionWith(e, t = !0) {
    let i = this.selection;
    return t && (e = e.mark(this.storedMarks || (i.empty ? i.$from.marks() : i.$from.marksAcross(i.$to) || P.none))), i.replaceWith(this, e), this;
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
  insertText(e, t, i) {
    let s = this.doc.type.schema;
    if (t == null)
      return e ? this.replaceSelectionWith(s.text(e), !0) : this.deleteSelection();
    {
      if (i == null && (i = t), !e)
        return this.deleteRange(t, i);
      let r = this.storedMarks;
      if (!r) {
        let o = this.doc.resolve(t);
        r = i == t ? o.marks() : o.marksAcross(this.doc.resolve(i));
      }
      return this.replaceRangeWith(t, i, s.text(e, r)), !this.selection.empty && this.selection.to == t + e.length && this.setSelection(L.near(this.selection.$to)), this;
    }
  }
  /**
  Store a metadata property in this transaction, keyed either by
  name or by plugin.
  */
  setMeta(e, t) {
    return this.meta[typeof e == "string" ? e : e.key] = t, this;
  }
  /**
  Retrieve a metadata property for a given name or plugin.
  */
  getMeta(e) {
    return this.meta[typeof e == "string" ? e : e.key];
  }
  /**
  Returns true if this transaction doesn't contain any metadata,
  and can thus safely be extended.
  */
  get isGeneric() {
    for (let e in this.meta)
      return !1;
    return !0;
  }
  /**
  Indicate that the editor should scroll the selection into view
  when updated to the state produced by this transaction.
  */
  scrollIntoView() {
    return this.updated |= No, this;
  }
  /**
  True when this transaction has had `scrollIntoView` called on it.
  */
  get scrolledIntoView() {
    return (this.updated & No) > 0;
  }
}
function Oo(n, e) {
  return !e || !n ? n : n.bind(e);
}
class on {
  constructor(e, t, i) {
    this.name = e, this.init = Oo(t.init, i), this.apply = Oo(t.apply, i);
  }
}
const nu = [
  new on("doc", {
    init(n) {
      return n.doc || n.schema.topNodeType.createAndFill();
    },
    apply(n) {
      return n.doc;
    }
  }),
  new on("selection", {
    init(n, e) {
      return n.selection || L.atStart(e.doc);
    },
    apply(n) {
      return n.selection;
    }
  }),
  new on("storedMarks", {
    init(n) {
      return n.storedMarks || null;
    },
    apply(n, e, t, i) {
      return i.selection.$cursor ? n.storedMarks : null;
    }
  }),
  new on("scrollToSelection", {
    init() {
      return 0;
    },
    apply(n, e) {
      return n.scrolledIntoView ? e + 1 : e;
    }
  })
];
class xs {
  constructor(e, t) {
    this.schema = e, this.plugins = [], this.pluginsByKey = /* @__PURE__ */ Object.create(null), this.fields = nu.slice(), t && t.forEach((i) => {
      if (this.pluginsByKey[i.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + i.key + ")");
      this.plugins.push(i), this.pluginsByKey[i.key] = i, i.spec.state && this.fields.push(new on(i.key, i.spec.state, i));
    });
  }
}
class qt {
  /**
  @internal
  */
  constructor(e) {
    this.config = e;
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
  apply(e) {
    return this.applyTransaction(e).state;
  }
  /**
  @internal
  */
  filterTransaction(e, t = -1) {
    for (let i = 0; i < this.config.plugins.length; i++)
      if (i != t) {
        let s = this.config.plugins[i];
        if (s.spec.filterTransaction && !s.spec.filterTransaction.call(s, e, this))
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
  applyTransaction(e) {
    if (!this.filterTransaction(e))
      return { state: this, transactions: [] };
    let t = [e], i = this.applyInner(e), s = null;
    for (; ; ) {
      let r = !1;
      for (let o = 0; o < this.config.plugins.length; o++) {
        let l = this.config.plugins[o];
        if (l.spec.appendTransaction) {
          let a = s ? s[o].n : 0, c = s ? s[o].state : this, d = a < t.length && l.spec.appendTransaction.call(l, a ? t.slice(a) : t, c, i);
          if (d && i.filterTransaction(d, o)) {
            if (d.setMeta("appendedTransaction", e), !s) {
              s = [];
              for (let u = 0; u < this.config.plugins.length; u++)
                s.push(u < o ? { state: i, n: t.length } : { state: this, n: 0 });
            }
            t.push(d), i = i.applyInner(d), r = !0;
          }
          s && (s[o] = { state: i, n: t.length });
        }
      }
      if (!r)
        return { state: i, transactions: t };
    }
  }
  /**
  @internal
  */
  applyInner(e) {
    if (!e.before.eq(this.doc))
      throw new RangeError("Applying a mismatched transaction");
    let t = new qt(this.config), i = this.config.fields;
    for (let s = 0; s < i.length; s++) {
      let r = i[s];
      t[r.name] = r.apply(e, this[r.name], this, t);
    }
    return t;
  }
  /**
  Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
  */
  get tr() {
    return new tu(this);
  }
  /**
  Create a new state.
  */
  static create(e) {
    let t = new xs(e.doc ? e.doc.type.schema : e.schema, e.plugins), i = new qt(t);
    for (let s = 0; s < t.fields.length; s++)
      i[t.fields[s].name] = t.fields[s].init(e, i);
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
  reconfigure(e) {
    let t = new xs(this.schema, e.plugins), i = t.fields, s = new qt(t);
    for (let r = 0; r < i.length; r++) {
      let o = i[r].name;
      s[o] = this.hasOwnProperty(o) ? this[o] : i[r].init(e, s);
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
  toJSON(e) {
    let t = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
    if (this.storedMarks && (t.storedMarks = this.storedMarks.map((i) => i.toJSON())), e && typeof e == "object")
      for (let i in e) {
        if (i == "doc" || i == "selection")
          throw new RangeError("The JSON fields `doc` and `selection` are reserved");
        let s = e[i], r = s.spec.state;
        r && r.toJSON && (t[i] = r.toJSON.call(s, this[s.key]));
      }
    return t;
  }
  /**
  Deserialize a JSON representation of a state. `config` should
  have at least a `schema` field, and should contain array of
  plugins to initialize the state with. `pluginFields` can be used
  to deserialize the state of plugins, by associating plugin
  instances with the property names they use in the JSON object.
  */
  static fromJSON(e, t, i) {
    if (!t)
      throw new RangeError("Invalid input for EditorState.fromJSON");
    if (!e.schema)
      throw new RangeError("Required config field 'schema' missing");
    let s = new xs(e.schema, e.plugins), r = new qt(s);
    return s.fields.forEach((o) => {
      if (o.name == "doc")
        r.doc = st.fromJSON(e.schema, t.doc);
      else if (o.name == "selection")
        r.selection = L.fromJSON(r.doc, t.selection);
      else if (o.name == "storedMarks")
        t.storedMarks && (r.storedMarks = t.storedMarks.map(e.schema.markFromJSON));
      else {
        if (i)
          for (let l in i) {
            let a = i[l], c = a.spec.state;
            if (a.key == o.name && c && c.fromJSON && Object.prototype.hasOwnProperty.call(t, l)) {
              r[o.name] = c.fromJSON.call(a, e, t[l], r);
              return;
            }
          }
        r[o.name] = o.init(e, r);
      }
    }), r;
  }
}
function La(n, e, t) {
  for (let i in n) {
    let s = n[i];
    s instanceof Function ? s = s.bind(e) : i == "handleDOMEvents" && (s = La(s, e, {})), t[i] = s;
  }
  return t;
}
class W {
  /**
  Create a plugin.
  */
  constructor(e) {
    this.spec = e, this.props = {}, e.props && La(e.props, this, this.props), this.key = e.key ? e.key.key : Na("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const Ss = /* @__PURE__ */ Object.create(null);
function Na(n) {
  return n in Ss ? n + "$" + ++Ss[n] : (Ss[n] = 0, n + "$");
}
class J {
  /**
  Create a plugin key.
  */
  constructor(e = "key") {
    this.key = Na(e);
  }
  /**
  Get the active plugin with this key, if any, from an editor
  state.
  */
  get(e) {
    return e.config.pluginsByKey[this.key];
  }
  /**
  Get the plugin's state from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const te = function(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}, Kt = function(n) {
  let e = n.assignedSlot || n.parentNode;
  return e && e.nodeType == 11 ? e.host : e;
};
let Qs = null;
const Ve = function(n, e, t) {
  let i = Qs || (Qs = document.createRange());
  return i.setEnd(n, t ?? n.nodeValue.length), i.setStart(n, e || 0), i;
}, iu = function() {
  Qs = null;
}, _t = function(n, e, t, i) {
  return t && (Ro(n, e, t, i, -1) || Ro(n, e, t, i, 1));
}, su = /^(img|br|input|textarea|hr)$/i;
function Ro(n, e, t, i, s) {
  for (var r; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (s < 0 ? 0 : we(n))) {
      let o = n.parentNode;
      if (!o || o.nodeType != 1 || Rn(n) || su.test(n.nodeName) || n.contentEditable == "false")
        return !1;
      e = te(n) + (s < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      let o = n.childNodes[e + (s < 0 ? -1 : 0)];
      if (o.nodeType == 1 && o.contentEditable == "false")
        if (!((r = o.pmViewDesc) === null || r === void 0) && r.ignoreForSelection)
          e += s;
        else
          return !1;
      else
        n = o, e = s < 0 ? we(n) : 0;
    } else
      return !1;
  }
}
function we(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function ru(n, e) {
  for (; ; ) {
    if (n.nodeType == 3 && e)
      return n;
    if (n.nodeType == 1 && e > 0) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[e - 1], e = we(n);
    } else if (n.parentNode && !Rn(n))
      e = te(n), n = n.parentNode;
    else
      return null;
  }
}
function ou(n, e) {
  for (; ; ) {
    if (n.nodeType == 3 && e < n.nodeValue.length)
      return n;
    if (n.nodeType == 1 && e < n.childNodes.length) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[e], e = 0;
    } else if (n.parentNode && !Rn(n))
      e = te(n) + 1, n = n.parentNode;
    else
      return null;
  }
}
function lu(n, e, t) {
  for (let i = e == 0, s = e == we(n); i || s; ) {
    if (n == t)
      return !0;
    let r = te(n);
    if (n = n.parentNode, !n)
      return !1;
    i = i && r == 0, s = s && r == we(n);
  }
}
function Rn(n) {
  let e;
  for (let t = n; t && !(e = t.pmViewDesc); t = t.parentNode)
    ;
  return e && e.node && e.node.isBlock && (e.dom == n || e.contentDOM == n);
}
const es = function(n) {
  return n.focusNode && _t(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset);
};
function gt(n, e) {
  let t = document.createEvent("Event");
  return t.initEvent("keydown", !0, !0), t.keyCode = n, t.key = t.code = e, t;
}
function au(n) {
  let e = n.activeElement;
  for (; e && e.shadowRoot; )
    e = e.shadowRoot.activeElement;
  return e;
}
function cu(n, e, t) {
  if (n.caretPositionFromPoint)
    try {
      let i = n.caretPositionFromPoint(e, t);
      if (i)
        return { node: i.offsetNode, offset: Math.min(we(i.offsetNode), i.offset) };
    } catch {
    }
  if (n.caretRangeFromPoint) {
    let i = n.caretRangeFromPoint(e, t);
    if (i)
      return { node: i.startContainer, offset: Math.min(we(i.startContainer), i.startOffset) };
  }
}
const Ne = typeof navigator < "u" ? navigator : null, Io = typeof document < "u" ? document : null, pt = Ne && Ne.userAgent || "", Zs = /Edge\/(\d+)/.exec(pt), Oa = /MSIE \d/.exec(pt), er = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(pt), he = !!(Oa || er || Zs), ot = Oa ? document.documentMode : er ? +er[1] : Zs ? +Zs[1] : 0, xe = !he && /gecko\/(\d+)/i.test(pt);
xe && +(/Firefox\/(\d+)/.exec(pt) || [0, 0])[1];
const tr = !he && /Chrome\/(\d+)/.exec(pt), ie = !!tr, Ra = tr ? +tr[1] : 0, oe = !he && !!Ne && /Apple Computer/.test(Ne.vendor), Jt = oe && (/Mobile\/\w+/.test(pt) || !!Ne && Ne.maxTouchPoints > 2), ke = Jt || (Ne ? /Mac/.test(Ne.platform) : !1), Ia = Ne ? /Win/.test(Ne.platform) : !1, Ue = /Android \d/.test(pt), In = !!Io && "webkitFontSmoothing" in Io.documentElement.style, du = In ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function uu(n) {
  let e = n.defaultView && n.defaultView.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: n.documentElement.clientWidth,
    top: 0,
    bottom: n.documentElement.clientHeight
  };
}
function He(n, e) {
  return typeof n == "number" ? n : n[e];
}
function pu(n) {
  let e = n.getBoundingClientRect(), t = e.width / n.offsetWidth || 1, i = e.height / n.offsetHeight || 1;
  return {
    left: e.left,
    right: e.left + n.clientWidth * t,
    top: e.top,
    bottom: e.top + n.clientHeight * i
  };
}
function Do(n, e, t) {
  let i = n.someProp("scrollThreshold") || 0, s = n.someProp("scrollMargin") || 5, r = n.dom.ownerDocument;
  for (let o = t || n.dom; o; ) {
    if (o.nodeType != 1) {
      o = Kt(o);
      continue;
    }
    let l = o, a = l == r.body, c = a ? uu(r) : pu(l), d = 0, u = 0;
    if (e.top < c.top + He(i, "top") ? u = -(c.top - e.top + He(s, "top")) : e.bottom > c.bottom - He(i, "bottom") && (u = e.bottom - e.top > c.bottom - c.top ? e.top + He(s, "top") - c.top : e.bottom - c.bottom + He(s, "bottom")), e.left < c.left + He(i, "left") ? d = -(c.left - e.left + He(s, "left")) : e.right > c.right - He(i, "right") && (d = e.right - c.right + He(s, "right")), d || u)
      if (a)
        r.defaultView.scrollBy(d, u);
      else {
        let h = l.scrollLeft, f = l.scrollTop;
        u && (l.scrollTop += u), d && (l.scrollLeft += d);
        let m = l.scrollLeft - h, g = l.scrollTop - f;
        e = { left: e.left - m, top: e.top - g, right: e.right - m, bottom: e.bottom - g };
      }
    let p = a ? "fixed" : getComputedStyle(o).position;
    if (/^(fixed|sticky)$/.test(p))
      break;
    o = p == "absolute" ? o.offsetParent : Kt(o);
  }
}
function hu(n) {
  let e = n.dom.getBoundingClientRect(), t = Math.max(0, e.top), i, s;
  for (let r = (e.left + e.right) / 2, o = t + 1; o < Math.min(innerHeight, e.bottom); o += 5) {
    let l = n.root.elementFromPoint(r, o);
    if (!l || l == n.dom || !n.dom.contains(l))
      continue;
    let a = l.getBoundingClientRect();
    if (a.top >= t - 20) {
      i = l, s = a.top;
      break;
    }
  }
  return { refDOM: i, refTop: s, stack: Da(n.dom) };
}
function Da(n) {
  let e = [], t = n.ownerDocument;
  for (let i = n; i && (e.push({ dom: i, top: i.scrollTop, left: i.scrollLeft }), n != t); i = Kt(i))
    ;
  return e;
}
function fu({ refDOM: n, refTop: e, stack: t }) {
  let i = n ? n.getBoundingClientRect().top : 0;
  Pa(t, i == 0 ? 0 : i - e);
}
function Pa(n, e) {
  for (let t = 0; t < n.length; t++) {
    let { dom: i, top: s, left: r } = n[t];
    i.scrollTop != s + e && (i.scrollTop = s + e), i.scrollLeft != r && (i.scrollLeft = r);
  }
}
let Pt = null;
function mu(n) {
  if (n.setActive)
    return n.setActive();
  if (Pt)
    return n.focus(Pt);
  let e = Da(n);
  n.focus(Pt == null ? {
    get preventScroll() {
      return Pt = { preventScroll: !0 }, !0;
    }
  } : void 0), Pt || (Pt = !1, Pa(e, 0));
}
function Ba(n, e) {
  let t, i = 2e8, s, r = 0, o = e.top, l = e.top, a, c;
  for (let d = n.firstChild, u = 0; d; d = d.nextSibling, u++) {
    let p;
    if (d.nodeType == 1)
      p = d.getClientRects();
    else if (d.nodeType == 3)
      p = Ve(d).getClientRects();
    else
      continue;
    for (let h = 0; h < p.length; h++) {
      let f = p[h];
      if (f.top <= o && f.bottom >= l) {
        o = Math.max(f.bottom, o), l = Math.min(f.top, l);
        let m = f.left > e.left ? f.left - e.left : f.right < e.left ? e.left - f.right : 0;
        if (m < i) {
          t = d, i = m, s = m && t.nodeType == 3 ? {
            left: f.right < e.left ? f.right : f.left,
            top: e.top
          } : e, d.nodeType == 1 && m && (r = u + (e.left >= (f.left + f.right) / 2 ? 1 : 0));
          continue;
        }
      } else f.top > e.top && !a && f.left <= e.left && f.right >= e.left && (a = d, c = { left: Math.max(f.left, Math.min(f.right, e.left)), top: f.top });
      !t && (e.left >= f.right && e.top >= f.top || e.left >= f.left && e.top >= f.bottom) && (r = u + 1);
    }
  }
  return !t && a && (t = a, s = c, i = 0), t && t.nodeType == 3 ? gu(t, s) : !t || i && t.nodeType == 1 ? { node: n, offset: r } : Ba(t, s);
}
function gu(n, e) {
  let t = n.nodeValue.length, i = document.createRange(), s;
  for (let r = 0; r < t; r++) {
    i.setEnd(n, r + 1), i.setStart(n, r);
    let o = Je(i, 1);
    if (o.top != o.bottom && Dr(e, o)) {
      s = { node: n, offset: r + (e.left >= (o.left + o.right) / 2 ? 1 : 0) };
      break;
    }
  }
  return i.detach(), s || { node: n, offset: 0 };
}
function Dr(n, e) {
  return n.left >= e.left - 1 && n.left <= e.right + 1 && n.top >= e.top - 1 && n.top <= e.bottom + 1;
}
function bu(n, e) {
  let t = n.parentNode;
  return t && /^li$/i.test(t.nodeName) && e.left < n.getBoundingClientRect().left ? t : n;
}
function yu(n, e, t) {
  let { node: i, offset: s } = Ba(e, t), r = -1;
  if (i.nodeType == 1 && !i.firstChild) {
    let o = i.getBoundingClientRect();
    r = o.left != o.right && t.left > (o.left + o.right) / 2 ? 1 : -1;
  }
  return n.docView.posFromDOM(i, s, r);
}
function vu(n, e, t, i) {
  let s = -1;
  for (let r = e, o = !1; r != n.dom; ) {
    let l = n.docView.nearestDesc(r, !0), a;
    if (!l)
      return null;
    if (l.dom.nodeType == 1 && (l.node.isBlock && l.parent || !l.contentDOM) && // Ignore elements with zero-size bounding rectangles
    ((a = l.dom.getBoundingClientRect()).width || a.height) && (l.node.isBlock && l.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(l.dom.nodeName) && (!o && a.left > i.left || a.top > i.top ? s = l.posBefore : (!o && a.right < i.left || a.bottom < i.top) && (s = l.posAfter), o = !0), !l.contentDOM && s < 0 && !l.node.isText))
      return (l.node.isBlock ? i.top < (a.top + a.bottom) / 2 : i.left < (a.left + a.right) / 2) ? l.posBefore : l.posAfter;
    r = l.dom.parentNode;
  }
  return s > -1 ? s : n.docView.posFromDOM(e, t, -1);
}
function Ha(n, e, t) {
  let i = n.childNodes.length;
  if (i && t.top < t.bottom)
    for (let s = Math.max(0, Math.min(i - 1, Math.floor(i * (e.top - t.top) / (t.bottom - t.top)) - 2)), r = s; ; ) {
      let o = n.childNodes[r];
      if (o.nodeType == 1) {
        let l = o.getClientRects();
        for (let a = 0; a < l.length; a++) {
          let c = l[a];
          if (Dr(e, c))
            return Ha(o, e, c);
        }
      }
      if ((r = (r + 1) % i) == s)
        break;
    }
  return n;
}
function ku(n, e) {
  let t = n.dom.ownerDocument, i, s = 0, r = cu(t, e.left, e.top);
  r && ({ node: i, offset: s } = r);
  let o = (n.root.elementFromPoint ? n.root : t).elementFromPoint(e.left, e.top), l;
  if (!o || !n.dom.contains(o.nodeType != 1 ? o.parentNode : o)) {
    let c = n.dom.getBoundingClientRect();
    if (!Dr(e, c) || (o = Ha(n.dom, e, c), !o))
      return null;
  }
  if (oe)
    for (let c = o; i && c; c = Kt(c))
      c.draggable && (i = void 0);
  if (o = bu(o, e), i) {
    if (xe && i.nodeType == 1 && (s = Math.min(s, i.childNodes.length), s < i.childNodes.length)) {
      let d = i.childNodes[s], u;
      d.nodeName == "IMG" && (u = d.getBoundingClientRect()).right <= e.left && u.bottom > e.top && s++;
    }
    let c;
    In && s && i.nodeType == 1 && (c = i.childNodes[s - 1]).nodeType == 1 && c.contentEditable == "false" && c.getBoundingClientRect().top >= e.top && s--, i == n.dom && s == i.childNodes.length - 1 && i.lastChild.nodeType == 1 && e.top > i.lastChild.getBoundingClientRect().bottom ? l = n.state.doc.content.size : (s == 0 || i.nodeType != 1 || i.childNodes[s - 1].nodeName != "BR") && (l = vu(n, i, s, e));
  }
  l == null && (l = yu(n, o, e));
  let a = n.docView.nearestDesc(o, !0);
  return { pos: l, inside: a ? a.posAtStart - a.border : -1 };
}
function Po(n) {
  return n.top < n.bottom || n.left < n.right;
}
function Je(n, e) {
  let t = n.getClientRects();
  if (t.length) {
    let i = t[e < 0 ? 0 : t.length - 1];
    if (Po(i))
      return i;
  }
  return Array.prototype.find.call(t, Po) || n.getBoundingClientRect();
}
const wu = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function za(n, e, t) {
  let { node: i, offset: s, atom: r } = n.docView.domFromPos(e, t < 0 ? -1 : 1), o = In || xe;
  if (i.nodeType == 3)
    if (o && (wu.test(i.nodeValue) || (t < 0 ? !s : s == i.nodeValue.length))) {
      let a = Je(Ve(i, s, s), t);
      if (xe && s && /\s/.test(i.nodeValue[s - 1]) && s < i.nodeValue.length) {
        let c = Je(Ve(i, s - 1, s - 1), -1);
        if (c.top == a.top) {
          let d = Je(Ve(i, s, s + 1), -1);
          if (d.top != a.top)
            return Zt(d, d.left < c.left);
        }
      }
      return a;
    } else {
      let a = s, c = s, d = t < 0 ? 1 : -1;
      return t < 0 && !s ? (c++, d = -1) : t >= 0 && s == i.nodeValue.length ? (a--, d = 1) : t < 0 ? a-- : c++, Zt(Je(Ve(i, a, c), d), d < 0);
    }
  if (!n.state.doc.resolve(e - (r || 0)).parent.inlineContent) {
    if (r == null && s && (t < 0 || s == we(i))) {
      let a = i.childNodes[s - 1];
      if (a.nodeType == 1)
        return Cs(a.getBoundingClientRect(), !1);
    }
    if (r == null && s < we(i)) {
      let a = i.childNodes[s];
      if (a.nodeType == 1)
        return Cs(a.getBoundingClientRect(), !0);
    }
    return Cs(i.getBoundingClientRect(), t >= 0);
  }
  if (r == null && s && (t < 0 || s == we(i))) {
    let a = i.childNodes[s - 1], c = a.nodeType == 3 ? Ve(a, we(a) - (o ? 0 : 1)) : a.nodeType == 1 && (a.nodeName != "BR" || !a.nextSibling) ? a : null;
    if (c)
      return Zt(Je(c, 1), !1);
  }
  if (r == null && s < we(i)) {
    let a = i.childNodes[s];
    for (; a.pmViewDesc && a.pmViewDesc.ignoreForCoords; )
      a = a.nextSibling;
    let c = a ? a.nodeType == 3 ? Ve(a, 0, o ? 0 : 1) : a.nodeType == 1 ? a : null : null;
    if (c)
      return Zt(Je(c, -1), !0);
  }
  return Zt(Je(i.nodeType == 3 ? Ve(i) : i, -t), t >= 0);
}
function Zt(n, e) {
  if (n.width == 0)
    return n;
  let t = e ? n.left : n.right;
  return { top: n.top, bottom: n.bottom, left: t, right: t };
}
function Cs(n, e) {
  if (n.height == 0)
    return n;
  let t = e ? n.top : n.bottom;
  return { top: t, bottom: t, left: n.left, right: n.right };
}
function $a(n, e, t) {
  let i = n.state, s = n.root.activeElement;
  i != e && n.updateState(e), s != n.dom && n.focus();
  try {
    return t();
  } finally {
    i != e && n.updateState(i), s != n.dom && s && s.focus();
  }
}
function xu(n, e, t) {
  let i = e.selection, s = t == "up" ? i.$from : i.$to;
  return $a(n, e, () => {
    let { node: r } = n.docView.domFromPos(s.pos, t == "up" ? -1 : 1);
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
    let o = za(n, s.pos, 1);
    for (let l = r.firstChild; l; l = l.nextSibling) {
      let a;
      if (l.nodeType == 1)
        a = l.getClientRects();
      else if (l.nodeType == 3)
        a = Ve(l, 0, l.nodeValue.length).getClientRects();
      else
        continue;
      for (let c = 0; c < a.length; c++) {
        let d = a[c];
        if (d.bottom > d.top + 1 && (t == "up" ? o.top - d.top > (d.bottom - o.top) * 2 : d.bottom - o.bottom > (o.bottom - d.top) * 2))
          return !1;
      }
    }
    return !0;
  });
}
const Su = /[\u0590-\u08ac]/;
function Cu(n, e, t) {
  let { $head: i } = e.selection;
  if (!i.parent.isTextblock)
    return !1;
  let s = i.parentOffset, r = !s, o = s == i.parent.content.size, l = n.domSelection();
  return l ? !Su.test(i.parent.textContent) || !l.modify ? t == "left" || t == "backward" ? r : o : $a(n, e, () => {
    let { focusNode: a, focusOffset: c, anchorNode: d, anchorOffset: u } = n.domSelectionRange(), p = l.caretBidiLevel;
    l.modify("move", t, "character");
    let h = i.depth ? n.docView.domAfterPos(i.before()) : n.dom, { focusNode: f, focusOffset: m } = n.domSelectionRange(), g = f && !h.contains(f.nodeType == 1 ? f : f.parentNode) || a == f && c == m;
    try {
      l.collapse(d, u), a && (a != d || c != u) && l.extend && l.extend(a, c);
    } catch {
    }
    return p != null && (l.caretBidiLevel = p), g;
  }) : i.pos == i.start() || i.pos == i.end();
}
let Bo = null, Ho = null, zo = !1;
function Mu(n, e, t) {
  return Bo == e && Ho == t ? zo : (Bo = e, Ho = t, zo = t == "up" || t == "down" ? xu(n, e, t) : Cu(n, e, t));
}
const Se = 0, $o = 1, yt = 2, Oe = 3;
class Dn {
  constructor(e, t, i, s) {
    this.parent = e, this.children = t, this.dom = i, this.contentDOM = s, this.dirty = Se, i.pmViewDesc = this;
  }
  // Used to check whether a given description corresponds to a
  // widget/mark/node.
  matchesWidget(e) {
    return !1;
  }
  matchesMark(e) {
    return !1;
  }
  matchesNode(e, t, i) {
    return !1;
  }
  matchesHack(e) {
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
  stopEvent(e) {
    return !1;
  }
  // The size of the content represented by this desc.
  get size() {
    let e = 0;
    for (let t = 0; t < this.children.length; t++)
      e += this.children[t].size;
    return e;
  }
  // For block nodes, this represents the space taken up by their
  // start/end tokens.
  get border() {
    return 0;
  }
  destroy() {
    this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
    for (let e = 0; e < this.children.length; e++)
      this.children[e].destroy();
  }
  posBeforeChild(e) {
    for (let t = 0, i = this.posAtStart; ; t++) {
      let s = this.children[t];
      if (s == e)
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
  localPosFromDOM(e, t, i) {
    if (this.contentDOM && this.contentDOM.contains(e.nodeType == 1 ? e : e.parentNode))
      if (i < 0) {
        let r, o;
        if (e == this.contentDOM)
          r = e.childNodes[t - 1];
        else {
          for (; e.parentNode != this.contentDOM; )
            e = e.parentNode;
          r = e.previousSibling;
        }
        for (; r && !((o = r.pmViewDesc) && o.parent == this); )
          r = r.previousSibling;
        return r ? this.posBeforeChild(o) + o.size : this.posAtStart;
      } else {
        let r, o;
        if (e == this.contentDOM)
          r = e.childNodes[t];
        else {
          for (; e.parentNode != this.contentDOM; )
            e = e.parentNode;
          r = e.nextSibling;
        }
        for (; r && !((o = r.pmViewDesc) && o.parent == this); )
          r = r.nextSibling;
        return r ? this.posBeforeChild(o) : this.posAtEnd;
      }
    let s;
    if (e == this.dom && this.contentDOM)
      s = t > te(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      s = e.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (t == 0)
        for (let r = e; ; r = r.parentNode) {
          if (r == this.dom) {
            s = !1;
            break;
          }
          if (r.previousSibling)
            break;
        }
      if (s == null && t == e.childNodes.length)
        for (let r = e; ; r = r.parentNode) {
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
  nearestDesc(e, t = !1) {
    for (let i = !0, s = e; s; s = s.parentNode) {
      let r = this.getDesc(s), o;
      if (r && (!t || r.node))
        if (i && (o = r.nodeDOM) && !(o.nodeType == 1 ? o.contains(e.nodeType == 1 ? e : e.parentNode) : o == e))
          i = !1;
        else
          return r;
    }
  }
  getDesc(e) {
    let t = e.pmViewDesc;
    for (let i = t; i; i = i.parent)
      if (i == this)
        return t;
  }
  posFromDOM(e, t, i) {
    for (let s = e; s; s = s.parentNode) {
      let r = this.getDesc(s);
      if (r)
        return r.localPosFromDOM(e, t, i);
    }
    return -1;
  }
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  descAt(e) {
    for (let t = 0, i = 0; t < this.children.length; t++) {
      let s = this.children[t], r = i + s.size;
      if (i == e && r != i) {
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
      if (e < r)
        return s.descAt(e - i - s.border);
      i = r;
    }
  }
  domFromPos(e, t) {
    if (!this.contentDOM)
      return { node: this.dom, offset: 0, atom: e + 1 };
    let i = 0, s = 0;
    for (let r = 0; i < this.children.length; i++) {
      let o = this.children[i], l = r + o.size;
      if (l > e || o instanceof qa) {
        s = e - r;
        break;
      }
      r = l;
    }
    if (s)
      return this.children[i].domFromPos(s - this.children[i].border, t);
    for (let r; i && !(r = this.children[i - 1]).size && r instanceof Fa && r.side >= 0; i--)
      ;
    if (t <= 0) {
      let r, o = !0;
      for (; r = i ? this.children[i - 1] : null, !(!r || r.dom.parentNode == this.contentDOM); i--, o = !1)
        ;
      return r && t && o && !r.border && !r.domAtom ? r.domFromPos(r.size, t) : { node: this.contentDOM, offset: r ? te(r.dom) + 1 : 0 };
    } else {
      let r, o = !0;
      for (; r = i < this.children.length ? this.children[i] : null, !(!r || r.dom.parentNode == this.contentDOM); i++, o = !1)
        ;
      return r && o && !r.border && !r.domAtom ? r.domFromPos(0, t) : { node: this.contentDOM, offset: r ? te(r.dom) : this.contentDOM.childNodes.length };
    }
  }
  // Used to find a DOM range in a single parent for a given changed
  // range.
  parseRange(e, t, i = 0) {
    if (this.children.length == 0)
      return { node: this.contentDOM, from: e, to: t, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
    let s = -1, r = -1;
    for (let o = i, l = 0; ; l++) {
      let a = this.children[l], c = o + a.size;
      if (s == -1 && e <= c) {
        let d = o + a.border;
        if (e >= d && t <= c - a.border && a.node && a.contentDOM && this.contentDOM.contains(a.contentDOM))
          return a.parseRange(e, t, d);
        e = o;
        for (let u = l; u > 0; u--) {
          let p = this.children[u - 1];
          if (p.size && p.dom.parentNode == this.contentDOM && !p.emptyChildAt(1)) {
            s = te(p.dom) + 1;
            break;
          }
          e -= p.size;
        }
        s == -1 && (s = 0);
      }
      if (s > -1 && (c > t || l == this.children.length - 1)) {
        t = c;
        for (let d = l + 1; d < this.children.length; d++) {
          let u = this.children[d];
          if (u.size && u.dom.parentNode == this.contentDOM && !u.emptyChildAt(-1)) {
            r = te(u.dom);
            break;
          }
          t += u.size;
        }
        r == -1 && (r = this.contentDOM.childNodes.length);
        break;
      }
      o = c;
    }
    return { node: this.contentDOM, from: e, to: t, fromOffset: s, toOffset: r };
  }
  emptyChildAt(e) {
    if (this.border || !this.contentDOM || !this.children.length)
      return !1;
    let t = this.children[e < 0 ? 0 : this.children.length - 1];
    return t.size == 0 || t.emptyChildAt(e);
  }
  domAfterPos(e) {
    let { node: t, offset: i } = this.domFromPos(e, 0);
    if (t.nodeType != 1 || i == t.childNodes.length)
      throw new RangeError("No node after pos " + e);
    return t.childNodes[i];
  }
  // View descs are responsible for setting any selection that falls
  // entirely inside of them, so that custom implementations can do
  // custom things with the selection. Note that this falls apart when
  // a selection starts in such a node and ends in another, in which
  // case we just use whatever domFromPos produces as a best effort.
  setSelection(e, t, i, s = !1) {
    let r = Math.min(e, t), o = Math.max(e, t);
    for (let h = 0, f = 0; h < this.children.length; h++) {
      let m = this.children[h], g = f + m.size;
      if (r > f && o < g)
        return m.setSelection(e - f - m.border, t - f - m.border, i, s);
      f = g;
    }
    let l = this.domFromPos(e, e ? -1 : 1), a = t == e ? l : this.domFromPos(t, t ? -1 : 1), c = i.root.getSelection(), d = i.domSelectionRange(), u = !1;
    if ((xe || oe) && e == t) {
      let { node: h, offset: f } = l;
      if (h.nodeType == 3) {
        if (u = !!(f && h.nodeValue[f - 1] == `
`), u && f == h.nodeValue.length)
          for (let m = h, g; m; m = m.parentNode) {
            if (g = m.nextSibling) {
              g.nodeName == "BR" && (l = a = { node: g.parentNode, offset: te(g) + 1 });
              break;
            }
            let b = m.pmViewDesc;
            if (b && b.node && b.node.isBlock)
              break;
          }
      } else {
        let m = h.childNodes[f - 1];
        u = m && (m.nodeName == "BR" || m.contentEditable == "false");
      }
    }
    if (xe && d.focusNode && d.focusNode != a.node && d.focusNode.nodeType == 1) {
      let h = d.focusNode.childNodes[d.focusOffset];
      h && h.contentEditable == "false" && (s = !0);
    }
    if (!(s || u && oe) && _t(l.node, l.offset, d.anchorNode, d.anchorOffset) && _t(a.node, a.offset, d.focusNode, d.focusOffset))
      return;
    let p = !1;
    if ((c.extend || e == t) && !(u && xe)) {
      c.collapse(l.node, l.offset);
      try {
        e != t && c.extend(a.node, a.offset), p = !0;
      } catch {
      }
    }
    if (!p) {
      if (e > t) {
        let f = l;
        l = a, a = f;
      }
      let h = document.createRange();
      h.setEnd(a.node, a.offset), h.setStart(l.node, l.offset), c.removeAllRanges(), c.addRange(h);
    }
  }
  ignoreMutation(e) {
    return !this.contentDOM && e.type != "selection";
  }
  get contentLost() {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
  }
  // Remove a subtree of the element tree that has been touched
  // by a DOM change, so that the next update will redraw it.
  markDirty(e, t) {
    for (let i = 0, s = 0; s < this.children.length; s++) {
      let r = this.children[s], o = i + r.size;
      if (i == o ? e <= o && t >= i : e < o && t > i) {
        let l = i + r.border, a = o - r.border;
        if (e >= l && t <= a) {
          this.dirty = e == i || t == o ? yt : $o, e == l && t == a && (r.contentLost || r.dom.parentNode != this.contentDOM) ? r.dirty = Oe : r.markDirty(e - l, t - l);
          return;
        } else
          r.dirty = r.dom == r.contentDOM && r.dom.parentNode == this.contentDOM && !r.children.length ? yt : Oe;
      }
      i = o;
    }
    this.dirty = yt;
  }
  markParentsDirty() {
    let e = 1;
    for (let t = this.parent; t; t = t.parent, e++) {
      let i = e == 1 ? yt : $o;
      t.dirty < i && (t.dirty = i);
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
  isText(e) {
    return !1;
  }
}
class Fa extends Dn {
  constructor(e, t, i, s) {
    let r, o = t.type.toDOM;
    if (typeof o == "function" && (o = o(i, () => {
      if (!r)
        return s;
      if (r.parent)
        return r.parent.posBeforeChild(r);
    })), !t.type.spec.raw) {
      if (o.nodeType != 1) {
        let l = document.createElement("span");
        l.appendChild(o), o = l;
      }
      o.contentEditable = "false", o.classList.add("ProseMirror-widget");
    }
    super(e, [], o, null), this.widget = t, this.widget = t, r = this;
  }
  matchesWidget(e) {
    return this.dirty == Se && e.type.eq(this.widget.type);
  }
  parseRule() {
    return { ignore: !0 };
  }
  stopEvent(e) {
    let t = this.widget.spec.stopEvent;
    return t ? t(e) : !1;
  }
  ignoreMutation(e) {
    return e.type != "selection" || this.widget.spec.ignoreSelection;
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
class Eu extends Dn {
  constructor(e, t, i, s) {
    super(e, [], t, null), this.textDOM = i, this.text = s;
  }
  get size() {
    return this.text.length;
  }
  localPosFromDOM(e, t) {
    return e != this.textDOM ? this.posAtStart + (t ? this.size : 0) : this.posAtStart + t;
  }
  domFromPos(e) {
    return { node: this.textDOM, offset: e };
  }
  ignoreMutation(e) {
    return e.type === "characterData" && e.target.nodeValue == e.oldValue;
  }
}
class Lt extends Dn {
  constructor(e, t, i, s, r) {
    super(e, [], i, s), this.mark = t, this.spec = r;
  }
  static create(e, t, i, s) {
    let r = s.nodeViews[t.type.name], o = r && r(t, s, i);
    return (!o || !o.dom) && (o = It.renderSpec(document, t.type.spec.toDOM(t, i), null, t.attrs)), new Lt(e, t, o.dom, o.contentDOM || o.dom, o);
  }
  parseRule() {
    return this.dirty & Oe || this.mark.type.spec.reparseInView ? null : { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
  }
  matchesMark(e) {
    return this.dirty != Oe && this.mark.eq(e);
  }
  markDirty(e, t) {
    if (super.markDirty(e, t), this.dirty != Se) {
      let i = this.parent;
      for (; !i.node; )
        i = i.parent;
      i.dirty < this.dirty && (i.dirty = this.dirty), this.dirty = Se;
    }
  }
  slice(e, t, i) {
    let s = Lt.create(this.parent, this.mark, !0, i), r = this.children, o = this.size;
    t < o && (r = ir(r, t, o, i)), e > 0 && (r = ir(r, 0, e, i));
    for (let l = 0; l < r.length; l++)
      r[l].parent = s;
    return s.children = r, s;
  }
  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
}
class lt extends Dn {
  constructor(e, t, i, s, r, o, l, a, c) {
    super(e, [], r, o), this.node = t, this.outerDeco = i, this.innerDeco = s, this.nodeDOM = l;
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
  static create(e, t, i, s, r, o) {
    let l = r.nodeViews[t.type.name], a, c = l && l(t, r, () => {
      if (!a)
        return o;
      if (a.parent)
        return a.parent.posBeforeChild(a);
    }, i, s), d = c && c.dom, u = c && c.contentDOM;
    if (t.isText) {
      if (!d)
        d = document.createTextNode(t.text);
      else if (d.nodeType != 3)
        throw new RangeError("Text must be rendered as a DOM text node");
    } else d || ({ dom: d, contentDOM: u } = It.renderSpec(document, t.type.spec.toDOM(t), null, t.attrs));
    !u && !t.isText && d.nodeName != "BR" && (d.hasAttribute("contenteditable") || (d.contentEditable = "false"), t.type.spec.draggable && (d.draggable = !0));
    let p = d;
    return d = Wa(d, i, t), c ? a = new Tu(e, t, i, s, d, u || null, p, c, r, o + 1) : t.isText ? new ts(e, t, i, s, d, p, r) : new lt(e, t, i, s, d, u || null, p, r, o + 1);
  }
  parseRule() {
    if (this.node.type.spec.reparseInView)
      return null;
    let e = { node: this.node.type.name, attrs: this.node.attrs };
    if (this.node.type.whitespace == "pre" && (e.preserveWhitespace = "full"), !this.contentDOM)
      e.getContent = () => this.node.content;
    else if (!this.contentLost)
      e.contentElement = this.contentDOM;
    else {
      for (let t = this.children.length - 1; t >= 0; t--) {
        let i = this.children[t];
        if (this.dom.contains(i.dom.parentNode)) {
          e.contentElement = i.dom.parentNode;
          break;
        }
      }
      e.contentElement || (e.getContent = () => y.empty);
    }
    return e;
  }
  matchesNode(e, t, i) {
    return this.dirty == Se && e.eq(this.node) && pi(t, this.outerDeco) && i.eq(this.innerDeco);
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
  updateChildren(e, t) {
    let i = this.node.inlineContent, s = t, r = e.composing ? this.localCompositionInfo(e, t) : null, o = r && r.pos > -1 ? r : null, l = r && r.pos < 0, a = new _u(this, o && o.node, e);
    Ou(this.node, this.innerDeco, (c, d, u) => {
      c.spec.marks ? a.syncToMarks(c.spec.marks, i, e, d) : c.type.side >= 0 && !u && a.syncToMarks(d == this.node.childCount ? P.none : this.node.child(d).marks, i, e, d), a.placeWidget(c, e, s);
    }, (c, d, u, p) => {
      a.syncToMarks(c.marks, i, e, p);
      let h;
      a.findNodeMatch(c, d, u, p) || l && e.state.selection.from > s && e.state.selection.to < s + c.nodeSize && (h = a.findIndexWithChild(r.node)) > -1 && a.updateNodeAt(c, d, u, h, e) || a.updateNextNode(c, d, u, e, p, s) || a.addNode(c, d, u, e, s), s += c.nodeSize;
    }), a.syncToMarks([], i, e, 0), this.node.isTextblock && a.addTextblockHacks(), a.destroyRest(), (a.changed || this.dirty == yt) && (o && this.protectLocalComposition(e, o), Va(this.contentDOM, this.children, e), Jt && Ru(this.dom));
  }
  localCompositionInfo(e, t) {
    let { from: i, to: s } = e.state.selection;
    if (!(e.state.selection instanceof _) || i < t || s > t + this.node.content.size)
      return null;
    let r = e.input.compositionNode;
    if (!r || !this.dom.contains(r.parentNode))
      return null;
    if (this.node.inlineContent) {
      let o = r.nodeValue, l = Iu(this.node.content, o, i - t, s - t);
      return l < 0 ? null : { node: r, pos: l, text: o };
    } else
      return { node: r, pos: -1, text: "" };
  }
  protectLocalComposition(e, { node: t, pos: i, text: s }) {
    if (this.getDesc(t))
      return;
    let r = t;
    for (; r.parentNode != this.contentDOM; r = r.parentNode) {
      for (; r.previousSibling; )
        r.parentNode.removeChild(r.previousSibling);
      for (; r.nextSibling; )
        r.parentNode.removeChild(r.nextSibling);
      r.pmViewDesc && (r.pmViewDesc = void 0);
    }
    let o = new Eu(this, r, t, s);
    e.input.compositionNodes.push(o), this.children = ir(this.children, i, i + s.length, e, o);
  }
  // If this desc must be updated to match the given node decoration,
  // do so and return true.
  update(e, t, i, s) {
    return this.dirty == Oe || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, i, s), !0);
  }
  updateInner(e, t, i, s) {
    this.updateOuterDeco(t), this.node = e, this.innerDeco = i, this.contentDOM && this.updateChildren(s, this.posAtStart), this.dirty = Se;
  }
  updateOuterDeco(e) {
    if (pi(e, this.outerDeco))
      return;
    let t = this.nodeDOM.nodeType != 1, i = this.dom;
    this.dom = Ua(this.dom, this.nodeDOM, nr(this.outerDeco, this.node, t), nr(e, this.node, t)), this.dom != i && (i.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
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
function Fo(n, e, t, i, s) {
  Wa(i, e, n);
  let r = new lt(void 0, n, e, t, i, i, i, s, 0);
  return r.contentDOM && r.updateChildren(s, 0), r;
}
class ts extends lt {
  constructor(e, t, i, s, r, o, l) {
    super(e, t, i, s, r, null, o, l, 0);
  }
  parseRule() {
    let e = this.nodeDOM.parentNode;
    for (; e && e != this.dom && !e.pmIsDeco; )
      e = e.parentNode;
    return { skip: e || !0 };
  }
  update(e, t, i, s) {
    return this.dirty == Oe || this.dirty != Se && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(t), (this.dirty != Se || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, s.trackWrites == this.nodeDOM && (s.trackWrites = null)), this.node = e, this.dirty = Se, !0);
  }
  inParent() {
    let e = this.parent.contentDOM;
    for (let t = this.nodeDOM; t; t = t.parentNode)
      if (t == e)
        return !0;
    return !1;
  }
  domFromPos(e) {
    return { node: this.nodeDOM, offset: e };
  }
  localPosFromDOM(e, t, i) {
    return e == this.nodeDOM ? this.posAtStart + Math.min(t, this.node.text.length) : super.localPosFromDOM(e, t, i);
  }
  ignoreMutation(e) {
    return e.type != "characterData" && e.type != "selection";
  }
  slice(e, t, i) {
    let s = this.node.cut(e, t), r = document.createTextNode(s.text);
    return new ts(this.parent, s, this.outerDeco, this.innerDeco, r, r, i);
  }
  markDirty(e, t) {
    super.markDirty(e, t), this.dom != this.nodeDOM && (e == 0 || t == this.nodeDOM.nodeValue.length) && (this.dirty = Oe);
  }
  get domAtom() {
    return !1;
  }
  isText(e) {
    return this.node.text == e;
  }
}
class qa extends Dn {
  parseRule() {
    return { ignore: !0 };
  }
  matchesHack(e) {
    return this.dirty == Se && this.dom.nodeName == e;
  }
  get domAtom() {
    return !0;
  }
  get ignoreForCoords() {
    return this.dom.nodeName == "IMG";
  }
}
class Tu extends lt {
  constructor(e, t, i, s, r, o, l, a, c, d) {
    super(e, t, i, s, r, o, l, c, d), this.spec = a;
  }
  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  update(e, t, i, s) {
    if (this.dirty == Oe)
      return !1;
    if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
      let r = this.spec.update(e, t, i);
      return r && this.updateInner(e, t, i, s), r;
    } else return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, i, s);
  }
  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }
  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }
  setSelection(e, t, i, s) {
    this.spec.setSelection ? this.spec.setSelection(e, t, i.root) : super.setSelection(e, t, i, s);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
  stopEvent(e) {
    return this.spec.stopEvent ? this.spec.stopEvent(e) : !1;
  }
  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
}
function Va(n, e, t) {
  let i = n.firstChild, s = !1;
  for (let r = 0; r < e.length; r++) {
    let o = e[r], l = o.dom;
    if (l.parentNode == n) {
      for (; l != i; )
        i = qo(i), s = !0;
      i = i.nextSibling;
    } else
      s = !0, n.insertBefore(l, i);
    if (o instanceof Lt) {
      let a = i ? i.previousSibling : n.lastChild;
      Va(o.contentDOM, o.children, t), i = a ? a.nextSibling : n.firstChild;
    }
  }
  for (; i; )
    i = qo(i), s = !0;
  s && t.trackWrites == n && (t.trackWrites = null);
}
const dn = function(n) {
  n && (this.nodeName = n);
};
dn.prototype = /* @__PURE__ */ Object.create(null);
const vt = [new dn()];
function nr(n, e, t) {
  if (n.length == 0)
    return vt;
  let i = t ? vt[0] : new dn(), s = [i];
  for (let r = 0; r < n.length; r++) {
    let o = n[r].type.attrs;
    if (o) {
      o.nodeName && s.push(i = new dn(o.nodeName));
      for (let l in o) {
        let a = o[l];
        a != null && (t && s.length == 1 && s.push(i = new dn(e.isInline ? "span" : "div")), l == "class" ? i.class = (i.class ? i.class + " " : "") + a : l == "style" ? i.style = (i.style ? i.style + ";" : "") + a : l != "nodeName" && (i[l] = a));
      }
    }
  }
  return s;
}
function Ua(n, e, t, i) {
  if (t == vt && i == vt)
    return e;
  let s = e;
  for (let r = 0; r < i.length; r++) {
    let o = i[r], l = t[r];
    if (r) {
      let a;
      l && l.nodeName == o.nodeName && s != n && (a = s.parentNode) && a.nodeName.toLowerCase() == o.nodeName || (a = document.createElement(o.nodeName), a.pmIsDeco = !0, a.appendChild(s), l = vt[0]), s = a;
    }
    Au(s, l || vt[0], o);
  }
  return s;
}
function Au(n, e, t) {
  for (let i in e)
    i != "class" && i != "style" && i != "nodeName" && !(i in t) && n.removeAttribute(i);
  for (let i in t)
    i != "class" && i != "style" && i != "nodeName" && t[i] != e[i] && n.setAttribute(i, t[i]);
  if (e.class != t.class) {
    let i = e.class ? e.class.split(" ").filter(Boolean) : [], s = t.class ? t.class.split(" ").filter(Boolean) : [];
    for (let r = 0; r < i.length; r++)
      s.indexOf(i[r]) == -1 && n.classList.remove(i[r]);
    for (let r = 0; r < s.length; r++)
      i.indexOf(s[r]) == -1 && n.classList.add(s[r]);
    n.classList.length == 0 && n.removeAttribute("class");
  }
  if (e.style != t.style) {
    if (e.style) {
      let i = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, s;
      for (; s = i.exec(e.style); )
        n.style.removeProperty(s[1]);
    }
    t.style && (n.style.cssText += t.style);
  }
}
function Wa(n, e, t) {
  return Ua(n, n, vt, nr(e, t, n.nodeType != 1));
}
function pi(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].type.eq(e[t].type))
      return !1;
  return !0;
}
function qo(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class _u {
  constructor(e, t, i) {
    this.lock = t, this.view = i, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = Lu(e.node.content, e);
  }
  // Destroy and remove the children between the given indices in
  // `this.top`.
  destroyBetween(e, t) {
    if (e != t) {
      for (let i = e; i < t; i++)
        this.top.children[i].destroy();
      this.top.children.splice(e, t - e), this.changed = !0;
    }
  }
  // Destroy all remaining children in `this.top`.
  destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  }
  // Sync the current stack of mark descs with the given array of
  // marks, reusing existing mark descs when possible.
  syncToMarks(e, t, i, s) {
    let r = 0, o = this.stack.length >> 1, l = Math.min(o, e.length);
    for (; r < l && (r == o - 1 ? this.top : this.stack[r + 1 << 1]).matchesMark(e[r]) && e[r].type.spec.spanning !== !1; )
      r++;
    for (; r < o; )
      this.destroyRest(), this.top.dirty = Se, this.index = this.stack.pop(), this.top = this.stack.pop(), o--;
    for (; o < e.length; ) {
      this.stack.push(this.top, this.index + 1);
      let a = -1, c = this.top.children.length;
      s < this.preMatch.index && (c = Math.min(this.index + 3, c));
      for (let d = this.index; d < c; d++) {
        let u = this.top.children[d];
        if (u.matchesMark(e[o]) && !this.isLocked(u.dom)) {
          a = d;
          break;
        }
      }
      if (a > -1)
        a > this.index && (this.changed = !0, this.destroyBetween(this.index, a)), this.top = this.top.children[this.index];
      else {
        let d = Lt.create(this.top, e[o], t, i);
        this.top.children.splice(this.index, 0, d), this.top = d, this.changed = !0;
      }
      this.index = 0, o++;
    }
  }
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  findNodeMatch(e, t, i, s) {
    let r = -1, o;
    if (s >= this.preMatch.index && (o = this.preMatch.matches[s - this.preMatch.index]).parent == this.top && o.matchesNode(e, t, i))
      r = this.top.children.indexOf(o, this.index);
    else
      for (let l = this.index, a = Math.min(this.top.children.length, l + 5); l < a; l++) {
        let c = this.top.children[l];
        if (c.matchesNode(e, t, i) && !this.preMatch.matched.has(c)) {
          r = l;
          break;
        }
      }
    return r < 0 ? !1 : (this.destroyBetween(this.index, r), this.index++, !0);
  }
  updateNodeAt(e, t, i, s, r) {
    let o = this.top.children[s];
    return o.dirty == Oe && o.dom == o.contentDOM && (o.dirty = yt), o.update(e, t, i, r) ? (this.destroyBetween(this.index, s), this.index++, !0) : !1;
  }
  findIndexWithChild(e) {
    for (; ; ) {
      let t = e.parentNode;
      if (!t)
        return -1;
      if (t == this.top.contentDOM) {
        let i = e.pmViewDesc;
        if (i) {
          for (let s = this.index; s < this.top.children.length; s++)
            if (this.top.children[s] == i)
              return s;
        }
        return -1;
      }
      e = t;
    }
  }
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  updateNextNode(e, t, i, s, r, o) {
    for (let l = this.index; l < this.top.children.length; l++) {
      let a = this.top.children[l];
      if (a instanceof lt) {
        let c = this.preMatch.matched.get(a);
        if (c != null && c != r)
          return !1;
        let d = a.dom, u, p = this.isLocked(d) && !(e.isText && a.node && a.node.isText && a.nodeDOM.nodeValue == e.text && a.dirty != Oe && pi(t, a.outerDeco));
        if (!p && a.update(e, t, i, s))
          return this.destroyBetween(this.index, l), a.dom != d && (this.changed = !0), this.index++, !0;
        if (!p && (u = this.recreateWrapper(a, e, t, i, s, o)))
          return this.destroyBetween(this.index, l), this.top.children[this.index] = u, u.contentDOM && (u.dirty = yt, u.updateChildren(s, o + 1), u.dirty = Se), this.changed = !0, this.index++, !0;
        break;
      }
    }
    return !1;
  }
  // When a node with content is replaced by a different node with
  // identical content, move over its children.
  recreateWrapper(e, t, i, s, r, o) {
    if (e.dirty || t.isAtom || !e.children.length || !e.node.content.eq(t.content) || !pi(i, e.outerDeco) || !s.eq(e.innerDeco))
      return null;
    let l = lt.create(this.top, t, i, s, r, o);
    if (l.contentDOM) {
      l.children = e.children, e.children = [];
      for (let a of l.children)
        a.parent = l;
    }
    return e.destroy(), l;
  }
  // Insert the node as a newly created node desc.
  addNode(e, t, i, s, r) {
    let o = lt.create(this.top, e, t, i, s, r);
    o.contentDOM && o.updateChildren(s, r + 1), this.top.children.splice(this.index++, 0, o), this.changed = !0;
  }
  placeWidget(e, t, i) {
    let s = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (s && s.matchesWidget(e) && (e == s.widget || !s.widget.type.toDOM.parentNode))
      this.index++;
    else {
      let r = new Fa(this.top, e, t, i);
      this.top.children.splice(this.index++, 0, r), this.changed = !0;
    }
  }
  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  addTextblockHacks() {
    let e = this.top.children[this.index - 1], t = this.top;
    for (; e instanceof Lt; )
      t = e, e = t.children[t.children.length - 1];
    (!e || // Empty textblock
    !(e instanceof ts) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((oe || ie) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", t), this.addHackNode("BR", this.top));
  }
  addHackNode(e, t) {
    if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e))
      this.index++;
    else {
      let i = document.createElement(e);
      e == "IMG" && (i.className = "ProseMirror-separator", i.alt = ""), e == "BR" && (i.className = "ProseMirror-trailingBreak");
      let s = new qa(this.top, [], i, null);
      t != this.top ? t.children.push(s) : t.children.splice(this.index++, 0, s), this.changed = !0;
    }
  }
  isLocked(e) {
    return this.lock && (e == this.lock || e.nodeType == 1 && e.contains(this.lock.parentNode));
  }
}
function Lu(n, e) {
  let t = e, i = t.children.length, s = n.childCount, r = /* @__PURE__ */ new Map(), o = [];
  e: for (; s > 0; ) {
    let l;
    for (; ; )
      if (i) {
        let c = t.children[i - 1];
        if (c instanceof Lt)
          t = c, i = c.children.length;
        else {
          l = c, i--;
          break;
        }
      } else {
        if (t == e)
          break e;
        i = t.parent.children.indexOf(t), t = t.parent;
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
function Nu(n, e) {
  return n.type.side - e.type.side;
}
function Ou(n, e, t, i) {
  let s = e.locals(n), r = 0;
  if (s.length == 0) {
    for (let c = 0; c < n.childCount; c++) {
      let d = n.child(c);
      i(d, s, e.forChild(r, d), c), r += d.nodeSize;
    }
    return;
  }
  let o = 0, l = [], a = null;
  for (let c = 0; ; ) {
    let d, u;
    for (; o < s.length && s[o].to == r; ) {
      let g = s[o++];
      g.widget && (d ? (u || (u = [d])).push(g) : d = g);
    }
    if (d)
      if (u) {
        u.sort(Nu);
        for (let g = 0; g < u.length; g++)
          t(u[g], c, !!a);
      } else
        t(d, c, !!a);
    let p, h;
    if (a)
      h = -1, p = a, a = null;
    else if (c < n.childCount)
      h = c, p = n.child(c++);
    else
      break;
    for (let g = 0; g < l.length; g++)
      l[g].to <= r && l.splice(g--, 1);
    for (; o < s.length && s[o].from <= r && s[o].to > r; )
      l.push(s[o++]);
    let f = r + p.nodeSize;
    if (p.isText) {
      let g = f;
      o < s.length && s[o].from < g && (g = s[o].from);
      for (let b = 0; b < l.length; b++)
        l[b].to < g && (g = l[b].to);
      g < f && (a = p.cut(g - r), p = p.cut(0, g - r), f = g, h = -1);
    } else
      for (; o < s.length && s[o].to < f; )
        o++;
    let m = p.isInline && !p.isLeaf ? l.filter((g) => !g.inline) : l.slice();
    i(p, m, e.forChild(r, p), h), r = f;
  }
}
function Ru(n) {
  if (n.nodeName == "UL" || n.nodeName == "OL") {
    let e = n.style.cssText;
    n.style.cssText = e + "; list-style: square !important", window.getComputedStyle(n).listStyle, n.style.cssText = e;
  }
}
function Iu(n, e, t, i) {
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
    if (r >= t) {
      if (r >= i && a.slice(i - e.length - l, i - l) == e)
        return i - e.length;
      let c = l < i ? a.lastIndexOf(e, i - l - 1) : -1;
      if (c >= 0 && c + e.length + l >= t)
        return l + c;
      if (t == i && a.length >= i + e.length - l && a.slice(i - l, i - l + e.length) == e)
        return i;
    }
  }
  return -1;
}
function ir(n, e, t, i, s) {
  let r = [];
  for (let o = 0, l = 0; o < n.length; o++) {
    let a = n[o], c = l, d = l += a.size;
    c >= t || d <= e ? r.push(a) : (c < e && r.push(a.slice(0, e - c, i)), s && (r.push(s), s = void 0), d > t && r.push(a.slice(t - c, a.size, i)));
  }
  return r;
}
function Pr(n, e = null) {
  let t = n.domSelectionRange(), i = n.state.doc;
  if (!t.focusNode)
    return null;
  let s = n.docView.nearestDesc(t.focusNode), r = s && s.size == 0, o = n.docView.posFromDOM(t.focusNode, t.focusOffset, 1);
  if (o < 0)
    return null;
  let l = i.resolve(o), a, c;
  if (es(t)) {
    for (a = o; s && !s.node; )
      s = s.parent;
    let u = s.node;
    if (s && u.isAtom && A.isSelectable(u) && s.parent && !(u.isInline && lu(t.focusNode, t.focusOffset, s.dom))) {
      let p = s.posBefore;
      c = new A(o == p ? l : i.resolve(p));
    }
  } else {
    if (t instanceof n.dom.ownerDocument.defaultView.Selection && t.rangeCount > 1) {
      let u = o, p = o;
      for (let h = 0; h < t.rangeCount; h++) {
        let f = t.getRangeAt(h);
        u = Math.min(u, n.docView.posFromDOM(f.startContainer, f.startOffset, 1)), p = Math.max(p, n.docView.posFromDOM(f.endContainer, f.endOffset, -1));
      }
      if (u < 0)
        return null;
      [a, o] = p == n.state.selection.anchor ? [p, u] : [u, p], l = i.resolve(o);
    } else
      a = n.docView.posFromDOM(t.anchorNode, t.anchorOffset, 1);
    if (a < 0)
      return null;
  }
  let d = i.resolve(a);
  if (!c) {
    let u = e == "pointer" || n.state.selection.head < l.pos && !r ? 1 : -1;
    c = Br(n, d, l, u);
  }
  return c;
}
function ja(n) {
  return n.editable ? n.hasFocus() : Ja(n) && document.activeElement && document.activeElement.contains(n.dom);
}
function je(n, e = !1) {
  let t = n.state.selection;
  if (Ka(n, t), !!ja(n)) {
    if (!e && n.input.mouseDown && n.input.mouseDown.allowDefault && ie) {
      let i = n.domSelectionRange(), s = n.domObserver.currentSelection;
      if (i.anchorNode && s.anchorNode && _t(i.anchorNode, i.anchorOffset, s.anchorNode, s.anchorOffset)) {
        n.input.mouseDown.delayedSelectionSync = !0, n.domObserver.setCurSelection();
        return;
      }
    }
    if (n.domObserver.disconnectSelection(), n.cursorWrapper)
      Pu(n);
    else {
      let { anchor: i, head: s } = t, r, o;
      Vo && !(t instanceof _) && (t.$from.parent.inlineContent || (r = Uo(n, t.from)), !t.empty && !t.$from.parent.inlineContent && (o = Uo(n, t.to))), n.docView.setSelection(i, s, n, e), Vo && (r && Wo(r), o && Wo(o)), t.visible ? n.dom.classList.remove("ProseMirror-hideselection") : (n.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && Du(n));
    }
    n.domObserver.setCurSelection(), n.domObserver.connectSelection();
  }
}
const Vo = oe || ie && Ra < 63;
function Uo(n, e) {
  let { node: t, offset: i } = n.docView.domFromPos(e, 0), s = i < t.childNodes.length ? t.childNodes[i] : null, r = i ? t.childNodes[i - 1] : null;
  if (oe && s && s.contentEditable == "false")
    return Ms(s);
  if ((!s || s.contentEditable == "false") && (!r || r.contentEditable == "false")) {
    if (s)
      return Ms(s);
    if (r)
      return Ms(r);
  }
}
function Ms(n) {
  return n.contentEditable = "true", oe && n.draggable && (n.draggable = !1, n.wasDraggable = !0), n;
}
function Wo(n) {
  n.contentEditable = "false", n.wasDraggable && (n.draggable = !0, n.wasDraggable = null);
}
function Du(n) {
  let e = n.dom.ownerDocument;
  e.removeEventListener("selectionchange", n.input.hideSelectionGuard);
  let t = n.domSelectionRange(), i = t.anchorNode, s = t.anchorOffset;
  e.addEventListener("selectionchange", n.input.hideSelectionGuard = () => {
    (t.anchorNode != i || t.anchorOffset != s) && (e.removeEventListener("selectionchange", n.input.hideSelectionGuard), setTimeout(() => {
      (!ja(n) || n.state.selection.visible) && n.dom.classList.remove("ProseMirror-hideselection");
    }, 20));
  });
}
function Pu(n) {
  let e = n.domSelection();
  if (!e)
    return;
  let t = n.cursorWrapper.dom, i = t.nodeName == "IMG";
  i ? e.collapse(t.parentNode, te(t) + 1) : e.collapse(t, 0), !i && !n.state.selection.visible && he && ot <= 11 && (t.disabled = !0, t.disabled = !1);
}
function Ka(n, e) {
  if (e instanceof A) {
    let t = n.docView.descAt(e.from);
    t != n.lastSelectedViewDesc && (jo(n), t && t.selectNode(), n.lastSelectedViewDesc = t);
  } else
    jo(n);
}
function jo(n) {
  n.lastSelectedViewDesc && (n.lastSelectedViewDesc.parent && n.lastSelectedViewDesc.deselectNode(), n.lastSelectedViewDesc = void 0);
}
function Br(n, e, t, i) {
  return n.someProp("createSelectionBetween", (s) => s(n, e, t)) || _.between(e, t, i);
}
function Ko(n) {
  return n.editable && !n.hasFocus() ? !1 : Ja(n);
}
function Ja(n) {
  let e = n.domSelectionRange();
  if (!e.anchorNode)
    return !1;
  try {
    return n.dom.contains(e.anchorNode.nodeType == 3 ? e.anchorNode.parentNode : e.anchorNode) && (n.editable || n.dom.contains(e.focusNode.nodeType == 3 ? e.focusNode.parentNode : e.focusNode));
  } catch {
    return !1;
  }
}
function Bu(n) {
  let e = n.docView.domFromPos(n.state.selection.anchor, 0), t = n.domSelectionRange();
  return _t(e.node, e.offset, t.anchorNode, t.anchorOffset);
}
function sr(n, e) {
  let { $anchor: t, $head: i } = n.selection, s = e > 0 ? t.max(i) : t.min(i), r = s.parent.inlineContent ? s.depth ? n.doc.resolve(e > 0 ? s.after() : s.before()) : null : s;
  return r && L.findFrom(r, e);
}
function Ge(n, e) {
  return n.dispatch(n.state.tr.setSelection(e).scrollIntoView()), !0;
}
function Jo(n, e, t) {
  let i = n.state.selection;
  if (i instanceof _)
    if (t.indexOf("s") > -1) {
      let { $head: s } = i, r = s.textOffset ? null : e < 0 ? s.nodeBefore : s.nodeAfter;
      if (!r || r.isText || !r.isLeaf)
        return !1;
      let o = n.state.doc.resolve(s.pos + r.nodeSize * (e < 0 ? -1 : 1));
      return Ge(n, new _(i.$anchor, o));
    } else if (i.empty) {
      if (n.endOfTextblock(e > 0 ? "forward" : "backward")) {
        let s = sr(n.state, e);
        return s && s instanceof A ? Ge(n, s) : !1;
      } else if (!(ke && t.indexOf("m") > -1)) {
        let s = i.$head, r = s.textOffset ? null : e < 0 ? s.nodeBefore : s.nodeAfter, o;
        if (!r || r.isText)
          return !1;
        let l = e < 0 ? s.pos - r.nodeSize : s.pos;
        return r.isAtom || (o = n.docView.descAt(l)) && !o.contentDOM ? A.isSelectable(r) ? Ge(n, new A(e < 0 ? n.state.doc.resolve(s.pos - r.nodeSize) : s)) : In ? Ge(n, new _(n.state.doc.resolve(e < 0 ? l : l + r.nodeSize))) : !1 : !1;
      }
    } else return !1;
  else {
    if (i instanceof A && i.node.isInline)
      return Ge(n, new _(e > 0 ? i.$to : i.$from));
    {
      let s = sr(n.state, e);
      return s ? Ge(n, s) : !1;
    }
  }
}
function hi(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function un(n, e) {
  let t = n.pmViewDesc;
  return t && t.size == 0 && (e < 0 || n.nextSibling || n.nodeName != "BR");
}
function Bt(n, e) {
  return e < 0 ? Hu(n) : zu(n);
}
function Hu(n) {
  let e = n.domSelectionRange(), t = e.focusNode, i = e.focusOffset;
  if (!t)
    return;
  let s, r, o = !1;
  for (xe && t.nodeType == 1 && i < hi(t) && un(t.childNodes[i], -1) && (o = !0); ; )
    if (i > 0) {
      if (t.nodeType != 1)
        break;
      {
        let l = t.childNodes[i - 1];
        if (un(l, -1))
          s = t, r = --i;
        else if (l.nodeType == 3)
          t = l, i = t.nodeValue.length;
        else
          break;
      }
    } else {
      if (Ga(t))
        break;
      {
        let l = t.previousSibling;
        for (; l && un(l, -1); )
          s = t.parentNode, r = te(l), l = l.previousSibling;
        if (l)
          t = l, i = hi(t);
        else {
          if (t = t.parentNode, t == n.dom)
            break;
          i = 0;
        }
      }
    }
  o ? rr(n, t, i) : s && rr(n, s, r);
}
function zu(n) {
  let e = n.domSelectionRange(), t = e.focusNode, i = e.focusOffset;
  if (!t)
    return;
  let s = hi(t), r, o;
  for (; ; )
    if (i < s) {
      if (t.nodeType != 1)
        break;
      let l = t.childNodes[i];
      if (un(l, 1))
        r = t, o = ++i;
      else
        break;
    } else {
      if (Ga(t))
        break;
      {
        let l = t.nextSibling;
        for (; l && un(l, 1); )
          r = l.parentNode, o = te(l) + 1, l = l.nextSibling;
        if (l)
          t = l, i = 0, s = hi(t);
        else {
          if (t = t.parentNode, t == n.dom)
            break;
          i = s = 0;
        }
      }
    }
  r && rr(n, r, o);
}
function Ga(n) {
  let e = n.pmViewDesc;
  return e && e.node && e.node.isBlock;
}
function $u(n, e) {
  for (; n && e == n.childNodes.length && !Rn(n); )
    e = te(n) + 1, n = n.parentNode;
  for (; n && e < n.childNodes.length; ) {
    let t = n.childNodes[e];
    if (t.nodeType == 3)
      return t;
    if (t.nodeType == 1 && t.contentEditable == "false")
      break;
    n = t, e = 0;
  }
}
function Fu(n, e) {
  for (; n && !e && !Rn(n); )
    e = te(n), n = n.parentNode;
  for (; n && e; ) {
    let t = n.childNodes[e - 1];
    if (t.nodeType == 3)
      return t;
    if (t.nodeType == 1 && t.contentEditable == "false")
      break;
    n = t, e = n.childNodes.length;
  }
}
function rr(n, e, t) {
  if (e.nodeType != 3) {
    let r, o;
    (o = $u(e, t)) ? (e = o, t = 0) : (r = Fu(e, t)) && (e = r, t = r.nodeValue.length);
  }
  let i = n.domSelection();
  if (!i)
    return;
  if (es(i)) {
    let r = document.createRange();
    r.setEnd(e, t), r.setStart(e, t), i.removeAllRanges(), i.addRange(r);
  } else i.extend && i.extend(e, t);
  n.domObserver.setCurSelection();
  let { state: s } = n;
  setTimeout(() => {
    n.state == s && je(n);
  }, 50);
}
function Go(n, e) {
  let t = n.state.doc.resolve(e);
  if (!(ie || Ia) && t.parent.inlineContent) {
    let s = n.coordsAtPos(e);
    if (e > t.start()) {
      let r = n.coordsAtPos(e - 1), o = (r.top + r.bottom) / 2;
      if (o > s.top && o < s.bottom && Math.abs(r.left - s.left) > 1)
        return r.left < s.left ? "ltr" : "rtl";
    }
    if (e < t.end()) {
      let r = n.coordsAtPos(e + 1), o = (r.top + r.bottom) / 2;
      if (o > s.top && o < s.bottom && Math.abs(r.left - s.left) > 1)
        return r.left > s.left ? "ltr" : "rtl";
    }
  }
  return getComputedStyle(n.dom).direction == "rtl" ? "rtl" : "ltr";
}
function Yo(n, e, t) {
  let i = n.state.selection;
  if (i instanceof _ && !i.empty || t.indexOf("s") > -1 || ke && t.indexOf("m") > -1)
    return !1;
  let { $from: s, $to: r } = i;
  if (!s.parent.inlineContent || n.endOfTextblock(e < 0 ? "up" : "down")) {
    let o = sr(n.state, e);
    if (o && o instanceof A)
      return Ge(n, o);
  }
  if (!s.parent.inlineContent) {
    let o = e < 0 ? s : r, l = i instanceof be ? L.near(o, e) : L.findFrom(o, e);
    return l ? Ge(n, l) : !1;
  }
  return !1;
}
function Xo(n, e) {
  if (!(n.state.selection instanceof _))
    return !0;
  let { $head: t, $anchor: i, empty: s } = n.state.selection;
  if (!t.sameParent(i))
    return !0;
  if (!s)
    return !1;
  if (n.endOfTextblock(e > 0 ? "forward" : "backward"))
    return !0;
  let r = !t.textOffset && (e < 0 ? t.nodeBefore : t.nodeAfter);
  if (r && !r.isText) {
    let o = n.state.tr;
    return e < 0 ? o.delete(t.pos - r.nodeSize, t.pos) : o.delete(t.pos, t.pos + r.nodeSize), n.dispatch(o), !0;
  }
  return !1;
}
function Qo(n, e, t) {
  n.domObserver.stop(), e.contentEditable = t, n.domObserver.start();
}
function qu(n) {
  if (!oe || n.state.selection.$head.parentOffset > 0)
    return !1;
  let { focusNode: e, focusOffset: t } = n.domSelectionRange();
  if (e && e.nodeType == 1 && t == 0 && e.firstChild && e.firstChild.contentEditable == "false") {
    let i = e.firstChild;
    Qo(n, i, "true"), setTimeout(() => Qo(n, i, "false"), 20);
  }
  return !1;
}
function Vu(n) {
  let e = "";
  return n.ctrlKey && (e += "c"), n.metaKey && (e += "m"), n.altKey && (e += "a"), n.shiftKey && (e += "s"), e;
}
function Uu(n, e) {
  let t = e.keyCode, i = Vu(e);
  if (t == 8 || ke && t == 72 && i == "c")
    return Xo(n, -1) || Bt(n, -1);
  if (t == 46 && !e.shiftKey || ke && t == 68 && i == "c")
    return Xo(n, 1) || Bt(n, 1);
  if (t == 13 || t == 27)
    return !0;
  if (t == 37 || ke && t == 66 && i == "c") {
    let s = t == 37 ? Go(n, n.state.selection.from) == "ltr" ? -1 : 1 : -1;
    return Jo(n, s, i) || Bt(n, s);
  } else if (t == 39 || ke && t == 70 && i == "c") {
    let s = t == 39 ? Go(n, n.state.selection.from) == "ltr" ? 1 : -1 : 1;
    return Jo(n, s, i) || Bt(n, s);
  } else {
    if (t == 38 || ke && t == 80 && i == "c")
      return Yo(n, -1, i) || Bt(n, -1);
    if (t == 40 || ke && t == 78 && i == "c")
      return qu(n) || Yo(n, 1, i) || Bt(n, 1);
    if (i == (ke ? "m" : "c") && (t == 66 || t == 73 || t == 89 || t == 90))
      return !0;
  }
  return !1;
}
function Hr(n, e) {
  n.someProp("transformCopied", (h) => {
    e = h(e, n);
  });
  let t = [], { content: i, openStart: s, openEnd: r } = e;
  for (; s > 1 && r > 1 && i.childCount == 1 && i.firstChild.childCount == 1; ) {
    s--, r--;
    let h = i.firstChild;
    t.push(h.type.name, h.attrs != h.type.defaultAttrs ? h.attrs : null), i = h.content;
  }
  let o = n.someProp("clipboardSerializer") || It.fromSchema(n.state.schema), l = tc(), a = l.createElement("div");
  a.appendChild(o.serializeFragment(i, { document: l }));
  let c = a.firstChild, d, u = 0;
  for (; c && c.nodeType == 1 && (d = ec[c.nodeName.toLowerCase()]); ) {
    for (let h = d.length - 1; h >= 0; h--) {
      let f = l.createElement(d[h]);
      for (; a.firstChild; )
        f.appendChild(a.firstChild);
      a.appendChild(f), u++;
    }
    c = a.firstChild;
  }
  c && c.nodeType == 1 && c.setAttribute("data-pm-slice", `${s} ${r}${u ? ` -${u}` : ""} ${JSON.stringify(t)}`);
  let p = n.someProp("clipboardTextSerializer", (h) => h(e, n)) || e.content.textBetween(0, e.content.size, `

`);
  return { dom: a, text: p, slice: e };
}
function Ya(n, e, t, i, s) {
  let r = s.parent.type.spec.code, o, l;
  if (!t && !e)
    return null;
  let a = !!e && (i || r || !t);
  if (a) {
    if (n.someProp("transformPastedText", (p) => {
      e = p(e, r || i, n);
    }), r)
      return l = new S(y.from(n.state.schema.text(e.replace(/\r\n?/g, `
`))), 0, 0), n.someProp("transformPasted", (p) => {
        l = p(l, n, !0);
      }), l;
    let u = n.someProp("clipboardTextParser", (p) => p(e, s, i, n));
    if (u)
      l = u;
    else {
      let p = s.marks(), { schema: h } = n.state, f = It.fromSchema(h);
      o = document.createElement("div"), e.split(/(?:\r\n?|\n)+/).forEach((m) => {
        let g = o.appendChild(document.createElement("p"));
        m && g.appendChild(f.serializeNode(h.text(m, p)));
      });
    }
  } else
    n.someProp("transformPastedHTML", (u) => {
      t = u(t, n);
    }), o = Ju(t), In && Gu(o);
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
  if (l || (l = (n.someProp("clipboardParser") || n.someProp("domParser") || rt.fromSchema(n.state.schema)).parseSlice(o, {
    preserveWhitespace: !!(a || d),
    context: s,
    ruleFromNode(p) {
      return p.nodeName == "BR" && !p.nextSibling && p.parentNode && !Wu.test(p.parentNode.nodeName) ? { ignore: !0 } : null;
    }
  })), d)
    l = Yu(Zo(l, +d[1], +d[2]), d[4]);
  else if (l = S.maxOpen(ju(l.content, s), !0), l.openStart || l.openEnd) {
    let u = 0, p = 0;
    for (let h = l.content.firstChild; u < l.openStart && !h.type.spec.isolating; u++, h = h.firstChild)
      ;
    for (let h = l.content.lastChild; p < l.openEnd && !h.type.spec.isolating; p++, h = h.lastChild)
      ;
    l = Zo(l, u, p);
  }
  return n.someProp("transformPasted", (u) => {
    l = u(l, n, a);
  }), l;
}
const Wu = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function ju(n, e) {
  if (n.childCount < 2)
    return n;
  for (let t = e.depth; t >= 0; t--) {
    let s = e.node(t).contentMatchAt(e.index(t)), r, o = [];
    if (n.forEach((l) => {
      if (!o)
        return;
      let a = s.findWrapping(l.type), c;
      if (!a)
        return o = null;
      if (c = o.length && r.length && Qa(a, r, l, o[o.length - 1], 0))
        o[o.length - 1] = c;
      else {
        o.length && (o[o.length - 1] = Za(o[o.length - 1], r.length));
        let d = Xa(l, a);
        o.push(d), s = s.matchType(d.type), r = a;
      }
    }), o)
      return y.from(o);
  }
  return n;
}
function Xa(n, e, t = 0) {
  for (let i = e.length - 1; i >= t; i--)
    n = e[i].create(null, y.from(n));
  return n;
}
function Qa(n, e, t, i, s) {
  if (s < n.length && s < e.length && n[s] == e[s]) {
    let r = Qa(n, e, t, i.lastChild, s + 1);
    if (r)
      return i.copy(i.content.replaceChild(i.childCount - 1, r));
    if (i.contentMatchAt(i.childCount).matchType(s == n.length - 1 ? t.type : n[s + 1]))
      return i.copy(i.content.append(y.from(Xa(t, n, s + 1))));
  }
}
function Za(n, e) {
  if (e == 0)
    return n;
  let t = n.content.replaceChild(n.childCount - 1, Za(n.lastChild, e - 1)), i = n.contentMatchAt(n.childCount).fillBefore(y.empty, !0);
  return n.copy(t.append(i));
}
function or(n, e, t, i, s, r) {
  let o = e < 0 ? n.firstChild : n.lastChild, l = o.content;
  return n.childCount > 1 && (r = 0), s < i - 1 && (l = or(l, e, t, i, s + 1, r)), s >= t && (l = e < 0 ? o.contentMatchAt(0).fillBefore(l, r <= s).append(l) : l.append(o.contentMatchAt(o.childCount).fillBefore(y.empty, !0))), n.replaceChild(e < 0 ? 0 : n.childCount - 1, o.copy(l));
}
function Zo(n, e, t) {
  return e < n.openStart && (n = new S(or(n.content, -1, e, n.openStart, 0, n.openEnd), e, n.openEnd)), t < n.openEnd && (n = new S(or(n.content, 1, t, n.openEnd, 0, 0), n.openStart, t)), n;
}
const ec = {
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
let el = null;
function tc() {
  return el || (el = document.implementation.createHTMLDocument("title"));
}
let Es = null;
function Ku(n) {
  let e = window.trustedTypes;
  return e ? (Es || (Es = e.defaultPolicy || e.createPolicy("ProseMirrorClipboard", { createHTML: (t) => t })), Es.createHTML(n)) : n;
}
function Ju(n) {
  let e = /^(\s*<meta [^>]*>)*/.exec(n);
  e && (n = n.slice(e[0].length));
  let t = tc().createElement("div"), i = /<([a-z][^>\s]+)/i.exec(n), s;
  if ((s = i && ec[i[1].toLowerCase()]) && (n = s.map((r) => "<" + r + ">").join("") + n + s.map((r) => "</" + r + ">").reverse().join("")), t.innerHTML = Ku(n), s)
    for (let r = 0; r < s.length; r++)
      t = t.querySelector(s[r]) || t;
  return t;
}
function Gu(n) {
  let e = n.querySelectorAll(ie ? "span:not([class]):not([style])" : "span.Apple-converted-space");
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    i.childNodes.length == 1 && i.textContent == " " && i.parentNode && i.parentNode.replaceChild(n.ownerDocument.createTextNode(" "), i);
  }
}
function Yu(n, e) {
  if (!n.size)
    return n;
  let t = n.content.firstChild.type.schema, i;
  try {
    i = JSON.parse(e);
  } catch {
    return n;
  }
  let { content: s, openStart: r, openEnd: o } = n;
  for (let l = i.length - 2; l >= 0; l -= 2) {
    let a = t.nodes[i[l]];
    if (!a || a.hasRequiredAttrs())
      break;
    s = y.from(a.create(i[l + 1], s)), r++, o++;
  }
  return new S(s, r, o);
}
const de = {}, ue = {}, Xu = { touchstart: !0, touchmove: !0 };
class Qu {
  constructor() {
    this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = { time: 0, x: 0, y: 0, type: "", button: 0 }, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = /* @__PURE__ */ Object.create(null), this.hideSelectionGuard = null;
  }
}
function Zu(n) {
  for (let e in de) {
    let t = de[e];
    n.dom.addEventListener(e, n.input.eventHandlers[e] = (i) => {
      tp(n, i) && !zr(n, i) && (n.editable || !(i.type in ue)) && t(n, i);
    }, Xu[e] ? { passive: !0 } : void 0);
  }
  oe && n.dom.addEventListener("input", () => null), lr(n);
}
function it(n, e) {
  n.input.lastSelectionOrigin = e, n.input.lastSelectionTime = Date.now();
}
function ep(n) {
  n.domObserver.stop();
  for (let e in n.input.eventHandlers)
    n.dom.removeEventListener(e, n.input.eventHandlers[e]);
  clearTimeout(n.input.composingTimeout), clearTimeout(n.input.lastIOSEnterFallbackTimeout);
}
function lr(n) {
  n.someProp("handleDOMEvents", (e) => {
    for (let t in e)
      n.input.eventHandlers[t] || n.dom.addEventListener(t, n.input.eventHandlers[t] = (i) => zr(n, i));
  });
}
function zr(n, e) {
  return n.someProp("handleDOMEvents", (t) => {
    let i = t[e.type];
    return i ? i(n, e) || e.defaultPrevented : !1;
  });
}
function tp(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target; t != n.dom; t = t.parentNode)
    if (!t || t.nodeType == 11 || t.pmViewDesc && t.pmViewDesc.stopEvent(e))
      return !1;
  return !0;
}
function np(n, e) {
  !zr(n, e) && de[e.type] && (n.editable || !(e.type in ue)) && de[e.type](n, e);
}
ue.keydown = (n, e) => {
  let t = e;
  if (n.input.shiftKey = t.keyCode == 16 || t.shiftKey, !ic(n, t) && (n.input.lastKeyCode = t.keyCode, n.input.lastKeyCodeTime = Date.now(), !(Ue && ie && t.keyCode == 13)))
    if (t.keyCode != 229 && n.domObserver.forceFlush(), Jt && t.keyCode == 13 && !t.ctrlKey && !t.altKey && !t.metaKey) {
      let i = Date.now();
      n.input.lastIOSEnter = i, n.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
        n.input.lastIOSEnter == i && (n.someProp("handleKeyDown", (s) => s(n, gt(13, "Enter"))), n.input.lastIOSEnter = 0);
      }, 200);
    } else n.someProp("handleKeyDown", (i) => i(n, t)) || Uu(n, t) ? t.preventDefault() : it(n, "key");
};
ue.keyup = (n, e) => {
  e.keyCode == 16 && (n.input.shiftKey = !1);
};
ue.keypress = (n, e) => {
  let t = e;
  if (ic(n, t) || !t.charCode || t.ctrlKey && !t.altKey || ke && t.metaKey)
    return;
  if (n.someProp("handleKeyPress", (s) => s(n, t))) {
    t.preventDefault();
    return;
  }
  let i = n.state.selection;
  if (!(i instanceof _) || !i.$from.sameParent(i.$to)) {
    let s = String.fromCharCode(t.charCode), r = () => n.state.tr.insertText(s).scrollIntoView();
    !/[\r\n]/.test(s) && !n.someProp("handleTextInput", (o) => o(n, i.$from.pos, i.$to.pos, s, r)) && n.dispatch(r()), t.preventDefault();
  }
};
function ns(n) {
  return { left: n.clientX, top: n.clientY };
}
function ip(n, e) {
  let t = e.x - n.clientX, i = e.y - n.clientY;
  return t * t + i * i < 100;
}
function $r(n, e, t, i, s) {
  if (i == -1)
    return !1;
  let r = n.state.doc.resolve(i);
  for (let o = r.depth + 1; o > 0; o--)
    if (n.someProp(e, (l) => o > r.depth ? l(n, t, r.nodeAfter, r.before(o), s, !0) : l(n, t, r.node(o), r.before(o), s, !1)))
      return !0;
  return !1;
}
function Wt(n, e, t) {
  if (n.focused || n.focus(), n.state.selection.eq(e))
    return;
  let i = n.state.tr.setSelection(e);
  i.setMeta("pointer", !0), n.dispatch(i);
}
function sp(n, e) {
  if (e == -1)
    return !1;
  let t = n.state.doc.resolve(e), i = t.nodeAfter;
  return i && i.isAtom && A.isSelectable(i) ? (Wt(n, new A(t)), !0) : !1;
}
function rp(n, e) {
  if (e == -1)
    return !1;
  let t = n.state.selection, i, s;
  t instanceof A && (i = t.node);
  let r = n.state.doc.resolve(e);
  for (let o = r.depth + 1; o > 0; o--) {
    let l = o > r.depth ? r.nodeAfter : r.node(o);
    if (A.isSelectable(l)) {
      i && t.$from.depth > 0 && o >= t.$from.depth && r.before(t.$from.depth + 1) == t.$from.pos ? s = r.before(t.$from.depth) : s = r.before(o);
      break;
    }
  }
  return s != null ? (Wt(n, A.create(n.state.doc, s)), !0) : !1;
}
function op(n, e, t, i, s) {
  return $r(n, "handleClickOn", e, t, i) || n.someProp("handleClick", (r) => r(n, e, i)) || (s ? rp(n, t) : sp(n, t));
}
function lp(n, e, t, i) {
  return $r(n, "handleDoubleClickOn", e, t, i) || n.someProp("handleDoubleClick", (s) => s(n, e, i));
}
function ap(n, e, t, i) {
  return $r(n, "handleTripleClickOn", e, t, i) || n.someProp("handleTripleClick", (s) => s(n, e, i)) || cp(n, t, i);
}
function cp(n, e, t) {
  if (t.button != 0)
    return !1;
  let i = n.state.doc;
  if (e == -1)
    return i.inlineContent ? (Wt(n, _.create(i, 0, i.content.size)), !0) : !1;
  let s = i.resolve(e);
  for (let r = s.depth + 1; r > 0; r--) {
    let o = r > s.depth ? s.nodeAfter : s.node(r), l = s.before(r);
    if (o.inlineContent)
      Wt(n, _.create(i, l + 1, l + 1 + o.content.size));
    else if (A.isSelectable(o))
      Wt(n, A.create(i, l));
    else
      continue;
    return !0;
  }
}
function Fr(n) {
  return fi(n);
}
const nc = ke ? "metaKey" : "ctrlKey";
de.mousedown = (n, e) => {
  let t = e;
  n.input.shiftKey = t.shiftKey;
  let i = Fr(n), s = Date.now(), r = "singleClick";
  s - n.input.lastClick.time < 500 && ip(t, n.input.lastClick) && !t[nc] && n.input.lastClick.button == t.button && (n.input.lastClick.type == "singleClick" ? r = "doubleClick" : n.input.lastClick.type == "doubleClick" && (r = "tripleClick")), n.input.lastClick = { time: s, x: t.clientX, y: t.clientY, type: r, button: t.button };
  let o = n.posAtCoords(ns(t));
  o && (r == "singleClick" ? (n.input.mouseDown && n.input.mouseDown.done(), n.input.mouseDown = new dp(n, o, t, !!i)) : (r == "doubleClick" ? lp : ap)(n, o.pos, o.inside, t) ? t.preventDefault() : it(n, "pointer"));
};
class dp {
  constructor(e, t, i, s) {
    this.view = e, this.pos = t, this.event = i, this.flushed = s, this.delayedSelectionSync = !1, this.mightDrag = null, this.startDoc = e.state.doc, this.selectNode = !!i[nc], this.allowDefault = i.shiftKey;
    let r, o;
    if (t.inside > -1)
      r = e.state.doc.nodeAt(t.inside), o = t.inside;
    else {
      let d = e.state.doc.resolve(t.pos);
      r = d.parent, o = d.depth ? d.before() : 0;
    }
    const l = s ? null : i.target, a = l ? e.docView.nearestDesc(l, !0) : null;
    this.target = a && a.nodeDOM.nodeType == 1 ? a.nodeDOM : null;
    let { selection: c } = e.state;
    (i.button == 0 && r.type.spec.draggable && r.type.spec.selectable !== !1 || c instanceof A && c.from <= o && c.to > o) && (this.mightDrag = {
      node: r,
      pos: o,
      addAttr: !!(this.target && !this.target.draggable),
      setUneditable: !!(this.target && xe && !this.target.hasAttribute("contentEditable"))
    }), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
      this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
    }, 20), this.view.domObserver.start()), e.root.addEventListener("mouseup", this.up = this.up.bind(this)), e.root.addEventListener("mousemove", this.move = this.move.bind(this)), it(e, "pointer");
  }
  done() {
    this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => je(this.view)), this.view.input.mouseDown = null;
  }
  up(e) {
    if (this.done(), !this.view.dom.contains(e.target))
      return;
    let t = this.pos;
    this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(ns(e))), this.updateAllowDefault(e), this.allowDefault || !t ? it(this.view, "pointer") : op(this.view, t.pos, t.inside, e, this.selectNode) ? e.preventDefault() : e.button == 0 && (this.flushed || // Safari ignores clicks on draggable elements
    oe && this.mightDrag && !this.mightDrag.node.isAtom || // Chrome will sometimes treat a node selection as a
    // cursor, but still report that the node is selected
    // when asked through getSelection. You'll then get a
    // situation where clicking at the point where that
    // (hidden) cursor is doesn't change the selection, and
    // thus doesn't get a reaction from ProseMirror. This
    // works around that.
    ie && !this.view.state.selection.visible && Math.min(Math.abs(t.pos - this.view.state.selection.from), Math.abs(t.pos - this.view.state.selection.to)) <= 2) ? (Wt(this.view, L.near(this.view.state.doc.resolve(t.pos))), e.preventDefault()) : it(this.view, "pointer");
  }
  move(e) {
    this.updateAllowDefault(e), it(this.view, "pointer"), e.buttons == 0 && this.done();
  }
  updateAllowDefault(e) {
    !this.allowDefault && (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) && (this.allowDefault = !0);
  }
}
de.touchstart = (n) => {
  n.input.lastTouch = Date.now(), Fr(n), it(n, "pointer");
};
de.touchmove = (n) => {
  n.input.lastTouch = Date.now(), it(n, "pointer");
};
de.contextmenu = (n) => Fr(n);
function ic(n, e) {
  return n.composing ? !0 : oe && Math.abs(e.timeStamp - n.input.compositionEndedAt) < 500 ? (n.input.compositionEndedAt = -2e8, !0) : !1;
}
const up = Ue ? 5e3 : -1;
ue.compositionstart = ue.compositionupdate = (n) => {
  if (!n.composing) {
    n.domObserver.flush();
    let { state: e } = n, t = e.selection.$to;
    if (e.selection instanceof _ && (e.storedMarks || !t.textOffset && t.parentOffset && t.nodeBefore.marks.some((i) => i.type.spec.inclusive === !1) || ie && Ia && pp(n)))
      n.markCursor = n.state.storedMarks || t.marks(), fi(n, !0), n.markCursor = null;
    else if (fi(n, !e.selection.empty), xe && e.selection.empty && t.parentOffset && !t.textOffset && t.nodeBefore.marks.length) {
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
  sc(n, up);
};
function pp(n) {
  let { focusNode: e, focusOffset: t } = n.domSelectionRange();
  if (!e || e.nodeType != 1 || t >= e.childNodes.length)
    return !1;
  let i = e.childNodes[t];
  return i.nodeType == 1 && i.contentEditable == "false";
}
ue.compositionend = (n, e) => {
  n.composing && (n.input.composing = !1, n.input.compositionEndedAt = e.timeStamp, n.input.compositionPendingChanges = n.domObserver.pendingRecords().length ? n.input.compositionID : 0, n.input.compositionNode = null, n.input.badSafariComposition ? n.domObserver.forceFlush() : n.input.compositionPendingChanges && Promise.resolve().then(() => n.domObserver.flush()), n.input.compositionID++, sc(n, 20));
};
function sc(n, e) {
  clearTimeout(n.input.composingTimeout), e > -1 && (n.input.composingTimeout = setTimeout(() => fi(n), e));
}
function rc(n) {
  for (n.composing && (n.input.composing = !1, n.input.compositionEndedAt = fp()); n.input.compositionNodes.length > 0; )
    n.input.compositionNodes.pop().markParentsDirty();
}
function hp(n) {
  let e = n.domSelectionRange();
  if (!e.focusNode)
    return null;
  let t = ru(e.focusNode, e.focusOffset), i = ou(e.focusNode, e.focusOffset);
  if (t && i && t != i) {
    let s = i.pmViewDesc, r = n.domObserver.lastChangedTextNode;
    if (t == r || i == r)
      return r;
    if (!s || !s.isText(i.nodeValue))
      return i;
    if (n.input.compositionNode == i) {
      let o = t.pmViewDesc;
      if (!(!o || !o.isText(t.nodeValue)))
        return i;
    }
  }
  return t || i;
}
function fp() {
  let n = document.createEvent("Event");
  return n.initEvent("event", !0, !0), n.timeStamp;
}
function fi(n, e = !1) {
  if (!(Ue && n.domObserver.flushingSoon >= 0)) {
    if (n.domObserver.forceFlush(), rc(n), e || n.docView && n.docView.dirty) {
      let t = Pr(n), i = n.state.selection;
      return t && !t.eq(i) ? n.dispatch(n.state.tr.setSelection(t)) : (n.markCursor || e) && !i.$from.node(i.$from.sharedDepth(i.to)).inlineContent ? n.dispatch(n.state.tr.deleteSelection()) : n.updateState(n.state), !0;
    }
    return !1;
  }
}
function mp(n, e) {
  if (!n.dom.parentNode)
    return;
  let t = n.dom.parentNode.appendChild(document.createElement("div"));
  t.appendChild(e), t.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let i = getSelection(), s = document.createRange();
  s.selectNodeContents(e), n.dom.blur(), i.removeAllRanges(), i.addRange(s), setTimeout(() => {
    t.parentNode && t.parentNode.removeChild(t), n.focus();
  }, 50);
}
const Sn = he && ot < 15 || Jt && du < 604;
de.copy = ue.cut = (n, e) => {
  let t = e, i = n.state.selection, s = t.type == "cut";
  if (i.empty)
    return;
  let r = Sn ? null : t.clipboardData, o = i.content(), { dom: l, text: a } = Hr(n, o);
  r ? (t.preventDefault(), r.clearData(), r.setData("text/html", l.innerHTML), r.setData("text/plain", a)) : mp(n, l), s && n.dispatch(n.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function gp(n) {
  return n.openStart == 0 && n.openEnd == 0 && n.content.childCount == 1 ? n.content.firstChild : null;
}
function bp(n, e) {
  if (!n.dom.parentNode)
    return;
  let t = n.input.shiftKey || n.state.selection.$from.parent.type.spec.code, i = n.dom.parentNode.appendChild(document.createElement(t ? "textarea" : "div"));
  t || (i.contentEditable = "true"), i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.focus();
  let s = n.input.shiftKey && n.input.lastKeyCode != 45;
  setTimeout(() => {
    n.focus(), i.parentNode && i.parentNode.removeChild(i), t ? Cn(n, i.value, null, s, e) : Cn(n, i.textContent, i.innerHTML, s, e);
  }, 50);
}
function Cn(n, e, t, i, s) {
  let r = Ya(n, e, t, i, n.state.selection.$from);
  if (n.someProp("handlePaste", (a) => a(n, s, r || S.empty)))
    return !0;
  if (!r)
    return !1;
  let o = gp(r), l = o ? n.state.tr.replaceSelectionWith(o, i) : n.state.tr.replaceSelection(r);
  return n.dispatch(l.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function oc(n) {
  let e = n.getData("text/plain") || n.getData("Text");
  if (e)
    return e;
  let t = n.getData("text/uri-list");
  return t ? t.replace(/\r?\n/g, " ") : "";
}
ue.paste = (n, e) => {
  let t = e;
  if (n.composing && !Ue)
    return;
  let i = Sn ? null : t.clipboardData, s = n.input.shiftKey && n.input.lastKeyCode != 45;
  i && Cn(n, oc(i), i.getData("text/html"), s, t) ? t.preventDefault() : bp(n, t);
};
class lc {
  constructor(e, t, i) {
    this.slice = e, this.move = t, this.node = i;
  }
}
const yp = ke ? "altKey" : "ctrlKey";
function ac(n, e) {
  let t = n.someProp("dragCopies", (i) => !i(e));
  return t ?? !e[yp];
}
de.dragstart = (n, e) => {
  let t = e, i = n.input.mouseDown;
  if (i && i.done(), !t.dataTransfer)
    return;
  let s = n.state.selection, r = s.empty ? null : n.posAtCoords(ns(t)), o;
  if (!(r && r.pos >= s.from && r.pos <= (s instanceof A ? s.to - 1 : s.to))) {
    if (i && i.mightDrag)
      o = A.create(n.state.doc, i.mightDrag.pos);
    else if (t.target && t.target.nodeType == 1) {
      let u = n.docView.nearestDesc(t.target, !0);
      u && u.node.type.spec.draggable && u != n.docView && (o = A.create(n.state.doc, u.posBefore));
    }
  }
  let l = (o || n.state.selection).content(), { dom: a, text: c, slice: d } = Hr(n, l);
  (!t.dataTransfer.files.length || !ie || Ra > 120) && t.dataTransfer.clearData(), t.dataTransfer.setData(Sn ? "Text" : "text/html", a.innerHTML), t.dataTransfer.effectAllowed = "copyMove", Sn || t.dataTransfer.setData("text/plain", c), n.dragging = new lc(d, ac(n, t), o);
};
de.dragend = (n) => {
  let e = n.dragging;
  window.setTimeout(() => {
    n.dragging == e && (n.dragging = null);
  }, 50);
};
ue.dragover = ue.dragenter = (n, e) => e.preventDefault();
ue.drop = (n, e) => {
  try {
    vp(n, e, n.dragging);
  } finally {
    n.dragging = null;
  }
};
function vp(n, e, t) {
  if (!e.dataTransfer)
    return;
  let i = n.posAtCoords(ns(e));
  if (!i)
    return;
  let s = n.state.doc.resolve(i.pos), r = t && t.slice;
  r ? n.someProp("transformPasted", (h) => {
    r = h(r, n, !1);
  }) : r = Ya(n, oc(e.dataTransfer), Sn ? null : e.dataTransfer.getData("text/html"), !1, s);
  let o = !!(t && ac(n, e));
  if (n.someProp("handleDrop", (h) => h(n, e, r || S.empty, o))) {
    e.preventDefault();
    return;
  }
  if (!r)
    return;
  e.preventDefault();
  let l = r ? Ca(n.state.doc, s.pos, r) : s.pos;
  l == null && (l = s.pos);
  let a = n.state.tr;
  if (o) {
    let { node: h } = t;
    h ? h.replace(a) : a.deleteSelection();
  }
  let c = a.mapping.map(l), d = r.openStart == 0 && r.openEnd == 0 && r.content.childCount == 1, u = a.doc;
  if (d ? a.replaceRangeWith(c, c, r.content.firstChild) : a.replaceRange(c, c, r), a.doc.eq(u))
    return;
  let p = a.doc.resolve(c);
  if (d && A.isSelectable(r.content.firstChild) && p.nodeAfter && p.nodeAfter.sameMarkup(r.content.firstChild))
    a.setSelection(new A(p));
  else {
    let h = a.mapping.map(l);
    a.mapping.maps[a.mapping.maps.length - 1].forEach((f, m, g, b) => h = b), a.setSelection(Br(n, p, a.doc.resolve(h)));
  }
  n.focus(), n.dispatch(a.setMeta("uiEvent", "drop"));
}
de.focus = (n) => {
  n.input.lastFocus = Date.now(), n.focused || (n.domObserver.stop(), n.dom.classList.add("ProseMirror-focused"), n.domObserver.start(), n.focused = !0, setTimeout(() => {
    n.docView && n.hasFocus() && !n.domObserver.currentSelection.eq(n.domSelectionRange()) && je(n);
  }, 20));
};
de.blur = (n, e) => {
  let t = e;
  n.focused && (n.domObserver.stop(), n.dom.classList.remove("ProseMirror-focused"), n.domObserver.start(), t.relatedTarget && n.dom.contains(t.relatedTarget) && n.domObserver.currentSelection.clear(), n.focused = !1);
};
de.beforeinput = (n, e) => {
  if (ie && Ue && e.inputType == "deleteContentBackward") {
    n.domObserver.flushSoon();
    let { domChangeCount: i } = n.input;
    setTimeout(() => {
      if (n.input.domChangeCount != i || (n.dom.blur(), n.focus(), n.someProp("handleKeyDown", (r) => r(n, gt(8, "Backspace")))))
        return;
      let { $cursor: s } = n.state.selection;
      s && s.pos > 0 && n.dispatch(n.state.tr.delete(s.pos - 1, s.pos).scrollIntoView());
    }, 50);
  }
};
for (let n in ue)
  de[n] = ue[n];
function Mn(n, e) {
  if (n == e)
    return !0;
  for (let t in n)
    if (n[t] !== e[t])
      return !1;
  for (let t in e)
    if (!(t in n))
      return !1;
  return !0;
}
class mi {
  constructor(e, t) {
    this.toDOM = e, this.spec = t || Ct, this.side = this.spec.side || 0;
  }
  map(e, t, i, s) {
    let { pos: r, deleted: o } = e.mapResult(t.from + s, this.side < 0 ? -1 : 1);
    return o ? null : new se(r - i, r - i, this);
  }
  valid() {
    return !0;
  }
  eq(e) {
    return this == e || e instanceof mi && (this.spec.key && this.spec.key == e.spec.key || this.toDOM == e.toDOM && Mn(this.spec, e.spec));
  }
  destroy(e) {
    this.spec.destroy && this.spec.destroy(e);
  }
}
class at {
  constructor(e, t) {
    this.attrs = e, this.spec = t || Ct;
  }
  map(e, t, i, s) {
    let r = e.map(t.from + s, this.spec.inclusiveStart ? -1 : 1) - i, o = e.map(t.to + s, this.spec.inclusiveEnd ? 1 : -1) - i;
    return r >= o ? null : new se(r, o, this);
  }
  valid(e, t) {
    return t.from < t.to;
  }
  eq(e) {
    return this == e || e instanceof at && Mn(this.attrs, e.attrs) && Mn(this.spec, e.spec);
  }
  static is(e) {
    return e.type instanceof at;
  }
  destroy() {
  }
}
class qr {
  constructor(e, t) {
    this.attrs = e, this.spec = t || Ct;
  }
  map(e, t, i, s) {
    let r = e.mapResult(t.from + s, 1);
    if (r.deleted)
      return null;
    let o = e.mapResult(t.to + s, -1);
    return o.deleted || o.pos <= r.pos ? null : new se(r.pos - i, o.pos - i, this);
  }
  valid(e, t) {
    let { index: i, offset: s } = e.content.findIndex(t.from), r;
    return s == t.from && !(r = e.child(i)).isText && s + r.nodeSize == t.to;
  }
  eq(e) {
    return this == e || e instanceof qr && Mn(this.attrs, e.attrs) && Mn(this.spec, e.spec);
  }
  destroy() {
  }
}
class se {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.from = e, this.to = t, this.type = i;
  }
  /**
  @internal
  */
  copy(e, t) {
    return new se(e, t, this.type);
  }
  /**
  @internal
  */
  eq(e, t = 0) {
    return this.type.eq(e.type) && this.from + t == e.from && this.to + t == e.to;
  }
  /**
  @internal
  */
  map(e, t, i) {
    return this.type.map(e, this, t, i);
  }
  /**
  Creates a widget decoration, which is a DOM node that's shown in
  the document at the given position. It is recommended that you
  delay rendering the widget by passing a function that will be
  called when the widget is actually drawn in a view, but you can
  also directly pass a DOM node. `getPos` can be used to find the
  widget's current document position.
  */
  static widget(e, t, i) {
    return new se(e, e, new mi(t, i));
  }
  /**
  Creates an inline decoration, which adds the given attributes to
  each inline node between `from` and `to`.
  */
  static inline(e, t, i, s) {
    return new se(e, t, new at(i, s));
  }
  /**
  Creates a node decoration. `from` and `to` should point precisely
  before and after a node in the document. That node, and only that
  node, will receive the given attributes.
  */
  static node(e, t, i, s) {
    return new se(e, t, new qr(i, s));
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
    return this.type instanceof at;
  }
  /**
  @internal
  */
  get widget() {
    return this.type instanceof mi;
  }
}
const zt = [], Ct = {};
class F {
  /**
  @internal
  */
  constructor(e, t) {
    this.local = e.length ? e : zt, this.children = t.length ? t : zt;
  }
  /**
  Create a set of decorations, using the structure of the given
  document. This will consume (modify) the `decorations` array, so
  you must make a copy if you want need to preserve that.
  */
  static create(e, t) {
    return t.length ? gi(t, e, 0, Ct) : re;
  }
  /**
  Find all decorations in this set which touch the given range
  (including decorations that start or end directly at the
  boundaries) and match the given predicate on their spec. When
  `start` and `end` are omitted, all decorations in the set are
  considered. When `predicate` isn't given, all decorations are
  assumed to match.
  */
  find(e, t, i) {
    let s = [];
    return this.findInner(e ?? 0, t ?? 1e9, s, 0, i), s;
  }
  findInner(e, t, i, s, r) {
    for (let o = 0; o < this.local.length; o++) {
      let l = this.local[o];
      l.from <= t && l.to >= e && (!r || r(l.spec)) && i.push(l.copy(l.from + s, l.to + s));
    }
    for (let o = 0; o < this.children.length; o += 3)
      if (this.children[o] < t && this.children[o + 1] > e) {
        let l = this.children[o] + 1;
        this.children[o + 2].findInner(e - l, t - l, i, s + l, r);
      }
  }
  /**
  Map the set of decorations in response to a change in the
  document.
  */
  map(e, t, i) {
    return this == re || e.maps.length == 0 ? this : this.mapInner(e, t, 0, 0, i || Ct);
  }
  /**
  @internal
  */
  mapInner(e, t, i, s, r) {
    let o;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l].map(e, i, s);
      a && a.type.valid(t, a) ? (o || (o = [])).push(a) : r.onRemove && r.onRemove(this.local[l].spec);
    }
    return this.children.length ? kp(this.children, o || [], e, t, i, s, r) : o ? new F(o.sort(Mt), zt) : re;
  }
  /**
  Add the given array of decorations to the ones in the set,
  producing a new set. Consumes the `decorations` array. Needs
  access to the current document to create the appropriate tree
  structure.
  */
  add(e, t) {
    return t.length ? this == re ? F.create(e, t) : this.addInner(e, t, 0) : this;
  }
  addInner(e, t, i) {
    let s, r = 0;
    e.forEach((l, a) => {
      let c = a + i, d;
      if (d = dc(t, l, c)) {
        for (s || (s = this.children.slice()); r < s.length && s[r] < a; )
          r += 3;
        s[r] == a ? s[r + 2] = s[r + 2].addInner(l, d, c + 1) : s.splice(r, 0, a, a + l.nodeSize, gi(d, l, c + 1, Ct)), r += 3;
      }
    });
    let o = cc(r ? uc(t) : t, -i);
    for (let l = 0; l < o.length; l++)
      o[l].type.valid(e, o[l]) || o.splice(l--, 1);
    return new F(o.length ? this.local.concat(o).sort(Mt) : this.local, s || this.children);
  }
  /**
  Create a new set that contains the decorations in this set, minus
  the ones in the given array.
  */
  remove(e) {
    return e.length == 0 || this == re ? this : this.removeInner(e, 0);
  }
  removeInner(e, t) {
    let i = this.children, s = this.local;
    for (let r = 0; r < i.length; r += 3) {
      let o, l = i[r] + t, a = i[r + 1] + t;
      for (let d = 0, u; d < e.length; d++)
        (u = e[d]) && u.from > l && u.to < a && (e[d] = null, (o || (o = [])).push(u));
      if (!o)
        continue;
      i == this.children && (i = this.children.slice());
      let c = i[r + 2].removeInner(o, l + 1);
      c != re ? i[r + 2] = c : (i.splice(r, 3), r -= 3);
    }
    if (s.length) {
      for (let r = 0, o; r < e.length; r++)
        if (o = e[r])
          for (let l = 0; l < s.length; l++)
            s[l].eq(o, t) && (s == this.local && (s = this.local.slice()), s.splice(l--, 1));
    }
    return i == this.children && s == this.local ? this : s.length || i.length ? new F(s, i) : re;
  }
  forChild(e, t) {
    if (this == re)
      return this;
    if (t.isLeaf)
      return F.empty;
    let i, s;
    for (let l = 0; l < this.children.length; l += 3)
      if (this.children[l] >= e) {
        this.children[l] == e && (i = this.children[l + 2]);
        break;
      }
    let r = e + 1, o = r + t.content.size;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l];
      if (a.from < o && a.to > r && a.type instanceof at) {
        let c = Math.max(r, a.from) - r, d = Math.min(o, a.to) - r;
        c < d && (s || (s = [])).push(a.copy(c, d));
      }
    }
    if (s) {
      let l = new F(s.sort(Mt), zt);
      return i ? new Qe([l, i]) : l;
    }
    return i || re;
  }
  /**
  @internal
  */
  eq(e) {
    if (this == e)
      return !0;
    if (!(e instanceof F) || this.local.length != e.local.length || this.children.length != e.children.length)
      return !1;
    for (let t = 0; t < this.local.length; t++)
      if (!this.local[t].eq(e.local[t]))
        return !1;
    for (let t = 0; t < this.children.length; t += 3)
      if (this.children[t] != e.children[t] || this.children[t + 1] != e.children[t + 1] || !this.children[t + 2].eq(e.children[t + 2]))
        return !1;
    return !0;
  }
  /**
  @internal
  */
  locals(e) {
    return Vr(this.localsInner(e));
  }
  /**
  @internal
  */
  localsInner(e) {
    if (this == re)
      return zt;
    if (e.inlineContent || !this.local.some(at.is))
      return this.local;
    let t = [];
    for (let i = 0; i < this.local.length; i++)
      this.local[i].type instanceof at || t.push(this.local[i]);
    return t;
  }
  forEachSet(e) {
    e(this);
  }
}
F.empty = new F([], []);
F.removeOverlap = Vr;
const re = F.empty;
class Qe {
  constructor(e) {
    this.members = e;
  }
  map(e, t) {
    const i = this.members.map((s) => s.map(e, t, Ct));
    return Qe.from(i);
  }
  forChild(e, t) {
    if (t.isLeaf)
      return F.empty;
    let i = [];
    for (let s = 0; s < this.members.length; s++) {
      let r = this.members[s].forChild(e, t);
      r != re && (r instanceof Qe ? i = i.concat(r.members) : i.push(r));
    }
    return Qe.from(i);
  }
  eq(e) {
    if (!(e instanceof Qe) || e.members.length != this.members.length)
      return !1;
    for (let t = 0; t < this.members.length; t++)
      if (!this.members[t].eq(e.members[t]))
        return !1;
    return !0;
  }
  locals(e) {
    let t, i = !0;
    for (let s = 0; s < this.members.length; s++) {
      let r = this.members[s].localsInner(e);
      if (r.length)
        if (!t)
          t = r;
        else {
          i && (t = t.slice(), i = !1);
          for (let o = 0; o < r.length; o++)
            t.push(r[o]);
        }
    }
    return t ? Vr(i ? t : t.sort(Mt)) : zt;
  }
  // Create a group for the given array of decoration sets, or return
  // a single set when possible.
  static from(e) {
    switch (e.length) {
      case 0:
        return re;
      case 1:
        return e[0];
      default:
        return new Qe(e.every((t) => t instanceof F) ? e : e.reduce((t, i) => t.concat(i instanceof F ? i : i.members), []));
    }
  }
  forEachSet(e) {
    for (let t = 0; t < this.members.length; t++)
      this.members[t].forEachSet(e);
  }
}
function kp(n, e, t, i, s, r, o) {
  let l = n.slice();
  for (let c = 0, d = r; c < t.maps.length; c++) {
    let u = 0;
    t.maps[c].forEach((p, h, f, m) => {
      let g = m - f - (h - p);
      for (let b = 0; b < l.length; b += 3) {
        let v = l[b + 1];
        if (v < 0 || p > v + d - u)
          continue;
        let k = l[b] + d - u;
        h >= k ? l[b + 1] = p <= k ? -2 : -1 : p >= d && g && (l[b] += g, l[b + 1] += g);
      }
      u += g;
    }), d = t.maps[c].map(d, -1);
  }
  let a = !1;
  for (let c = 0; c < l.length; c += 3)
    if (l[c + 1] < 0) {
      if (l[c + 1] == -2) {
        a = !0, l[c + 1] = -1;
        continue;
      }
      let d = t.map(n[c] + r), u = d - s;
      if (u < 0 || u >= i.content.size) {
        a = !0;
        continue;
      }
      let p = t.map(n[c + 1] + r, -1), h = p - s, { index: f, offset: m } = i.content.findIndex(u), g = i.maybeChild(f);
      if (g && m == u && m + g.nodeSize == h) {
        let b = l[c + 2].mapInner(t, g, d + 1, n[c] + r + 1, o);
        b != re ? (l[c] = u, l[c + 1] = h, l[c + 2] = b) : (l[c + 1] = -2, a = !0);
      } else
        a = !0;
    }
  if (a) {
    let c = wp(l, n, e, t, s, r, o), d = gi(c, i, 0, o);
    e = d.local;
    for (let u = 0; u < l.length; u += 3)
      l[u + 1] < 0 && (l.splice(u, 3), u -= 3);
    for (let u = 0, p = 0; u < d.children.length; u += 3) {
      let h = d.children[u];
      for (; p < l.length && l[p] < h; )
        p += 3;
      l.splice(p, 0, d.children[u], d.children[u + 1], d.children[u + 2]);
    }
  }
  return new F(e.sort(Mt), l);
}
function cc(n, e) {
  if (!e || !n.length)
    return n;
  let t = [];
  for (let i = 0; i < n.length; i++) {
    let s = n[i];
    t.push(new se(s.from + e, s.to + e, s.type));
  }
  return t;
}
function wp(n, e, t, i, s, r, o) {
  function l(a, c) {
    for (let d = 0; d < a.local.length; d++) {
      let u = a.local[d].map(i, s, c);
      u ? t.push(u) : o.onRemove && o.onRemove(a.local[d].spec);
    }
    for (let d = 0; d < a.children.length; d += 3)
      l(a.children[d + 2], a.children[d] + c + 1);
  }
  for (let a = 0; a < n.length; a += 3)
    n[a + 1] == -1 && l(n[a + 2], e[a] + r + 1);
  return t;
}
function dc(n, e, t) {
  if (e.isLeaf)
    return null;
  let i = t + e.nodeSize, s = null;
  for (let r = 0, o; r < n.length; r++)
    (o = n[r]) && o.from > t && o.to < i && ((s || (s = [])).push(o), n[r] = null);
  return s;
}
function uc(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    n[t] != null && e.push(n[t]);
  return e;
}
function gi(n, e, t, i) {
  let s = [], r = !1;
  e.forEach((l, a) => {
    let c = dc(n, l, a + t);
    if (c) {
      r = !0;
      let d = gi(c, l, t + a + 1, i);
      d != re && s.push(a, a + l.nodeSize, d);
    }
  });
  let o = cc(r ? uc(n) : n, -t).sort(Mt);
  for (let l = 0; l < o.length; l++)
    o[l].type.valid(e, o[l]) || (i.onRemove && i.onRemove(o[l].spec), o.splice(l--, 1));
  return o.length || s.length ? new F(o, s) : re;
}
function Mt(n, e) {
  return n.from - e.from || n.to - e.to;
}
function Vr(n) {
  let e = n;
  for (let t = 0; t < e.length - 1; t++) {
    let i = e[t];
    if (i.from != i.to)
      for (let s = t + 1; s < e.length; s++) {
        let r = e[s];
        if (r.from == i.from) {
          r.to != i.to && (e == n && (e = n.slice()), e[s] = r.copy(r.from, i.to), tl(e, s + 1, r.copy(i.to, r.to)));
          continue;
        } else {
          r.from < i.to && (e == n && (e = n.slice()), e[t] = i.copy(i.from, r.from), tl(e, s, i.copy(r.from, i.to)));
          break;
        }
      }
  }
  return e;
}
function tl(n, e, t) {
  for (; e < n.length && Mt(t, n[e]) > 0; )
    e++;
  n.splice(e, 0, t);
}
function Ts(n) {
  let e = [];
  return n.someProp("decorations", (t) => {
    let i = t(n.state);
    i && i != re && e.push(i);
  }), n.cursorWrapper && e.push(F.create(n.state.doc, [n.cursorWrapper.deco])), Qe.from(e);
}
const xp = {
  childList: !0,
  characterData: !0,
  characterDataOldValue: !0,
  attributes: !0,
  attributeOldValue: !0,
  subtree: !0
}, Sp = he && ot <= 11;
class Cp {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  set(e) {
    this.anchorNode = e.anchorNode, this.anchorOffset = e.anchorOffset, this.focusNode = e.focusNode, this.focusOffset = e.focusOffset;
  }
  clear() {
    this.anchorNode = this.focusNode = null;
  }
  eq(e) {
    return e.anchorNode == this.anchorNode && e.anchorOffset == this.anchorOffset && e.focusNode == this.focusNode && e.focusOffset == this.focusOffset;
  }
}
class Mp {
  constructor(e, t) {
    this.view = e, this.handleDOMChange = t, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new Cp(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((i) => {
      for (let s = 0; s < i.length; s++)
        this.queue.push(i[s]);
      he && ot <= 11 && i.some((s) => s.type == "childList" && s.removedNodes.length || s.type == "characterData" && s.oldValue.length > s.target.nodeValue.length) ? this.flushSoon() : oe && e.composing && i.some((s) => s.type == "childList" && s.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
    }), Sp && (this.onCharData = (i) => {
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
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, xp)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
  }
  stop() {
    if (this.observer) {
      let e = this.observer.takeRecords();
      if (e.length) {
        for (let t = 0; t < e.length; t++)
          this.queue.push(e[t]);
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
    if (Ko(this.view)) {
      if (this.suppressingSelectionUpdates)
        return je(this.view);
      if (he && ot <= 11 && !this.view.state.selection.empty) {
        let e = this.view.domSelectionRange();
        if (e.focusNode && _t(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset))
          return this.flushSoon();
      }
      this.flush();
    }
  }
  setCurSelection() {
    this.currentSelection.set(this.view.domSelectionRange());
  }
  ignoreSelectionChange(e) {
    if (!e.focusNode)
      return !0;
    let t = /* @__PURE__ */ new Set(), i;
    for (let r = e.focusNode; r; r = Kt(r))
      t.add(r);
    for (let r = e.anchorNode; r; r = Kt(r))
      if (t.has(r)) {
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
      for (let e of this.observer.takeRecords())
        this.queue.push(e);
    return this.queue;
  }
  flush() {
    let { view: e } = this;
    if (!e.docView || this.flushingSoon > -1)
      return;
    let t = this.pendingRecords();
    t.length && (this.queue = []);
    let i = e.domSelectionRange(), s = !this.suppressingSelectionUpdates && !this.currentSelection.eq(i) && Ko(e) && !this.ignoreSelectionChange(i), r = -1, o = -1, l = !1, a = [];
    if (e.editable)
      for (let d = 0; d < t.length; d++) {
        let u = this.registerMutation(t[d], a);
        u && (r = r < 0 ? u.from : Math.min(u.from, r), o = o < 0 ? u.to : Math.max(u.to, o), u.typeOver && (l = !0));
      }
    if (a.some((d) => d.nodeName == "BR") && (e.input.lastKeyCode == 8 || e.input.lastKeyCode == 46)) {
      for (let d of a)
        if (d.nodeName == "BR" && d.parentNode) {
          let u = d.nextSibling;
          u && u.nodeType == 1 && u.contentEditable == "false" && d.parentNode.removeChild(d);
        }
    } else if (xe && a.length) {
      let d = a.filter((u) => u.nodeName == "BR");
      if (d.length == 2) {
        let [u, p] = d;
        u.parentNode && u.parentNode.parentNode == p.parentNode ? p.remove() : u.remove();
      } else {
        let { focusNode: u } = this.currentSelection;
        for (let p of d) {
          let h = p.parentNode;
          h && h.nodeName == "LI" && (!u || Ap(e, u) != h) && p.remove();
        }
      }
    }
    let c = null;
    r < 0 && s && e.input.lastFocus > Date.now() - 200 && Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 && es(i) && (c = Pr(e)) && c.eq(L.near(e.state.doc.resolve(0), 1)) ? (e.input.lastFocus = 0, je(e), this.currentSelection.set(i), e.scrollToSelection()) : (r > -1 || s) && (r > -1 && (e.docView.markDirty(r, o), Ep(e)), e.input.badSafariComposition && (e.input.badSafariComposition = !1, _p(e, a)), this.handleDOMChange(r, o, l, a), e.docView && e.docView.dirty ? e.updateState(e.state) : this.currentSelection.eq(i) || je(e), this.currentSelection.set(i));
  }
  registerMutation(e, t) {
    if (t.indexOf(e.target) > -1)
      return null;
    let i = this.view.docView.nearestDesc(e.target);
    if (e.type == "attributes" && (i == this.view.docView || e.attributeName == "contenteditable" || // Firefox sometimes fires spurious events for null/empty styles
    e.attributeName == "style" && !e.oldValue && !e.target.getAttribute("style")) || !i || i.ignoreMutation(e))
      return null;
    if (e.type == "childList") {
      for (let d = 0; d < e.addedNodes.length; d++) {
        let u = e.addedNodes[d];
        t.push(u), u.nodeType == 3 && (this.lastChangedTextNode = u);
      }
      if (i.contentDOM && i.contentDOM != i.dom && !i.contentDOM.contains(e.target))
        return { from: i.posBefore, to: i.posAfter };
      let s = e.previousSibling, r = e.nextSibling;
      if (he && ot <= 11 && e.addedNodes.length)
        for (let d = 0; d < e.addedNodes.length; d++) {
          let { previousSibling: u, nextSibling: p } = e.addedNodes[d];
          (!u || Array.prototype.indexOf.call(e.addedNodes, u) < 0) && (s = u), (!p || Array.prototype.indexOf.call(e.addedNodes, p) < 0) && (r = p);
        }
      let o = s && s.parentNode == e.target ? te(s) + 1 : 0, l = i.localPosFromDOM(e.target, o, -1), a = r && r.parentNode == e.target ? te(r) : e.target.childNodes.length, c = i.localPosFromDOM(e.target, a, 1);
      return { from: l, to: c };
    } else return e.type == "attributes" ? { from: i.posAtStart - i.border, to: i.posAtEnd + i.border } : (this.lastChangedTextNode = e.target, {
      from: i.posAtStart,
      to: i.posAtEnd,
      // An event was generated for a text change that didn't change
      // any text. Mark the dom change to fall back to assuming the
      // selection was typed over with an identical value if it can't
      // find another change.
      typeOver: e.target.nodeValue == e.oldValue
    });
  }
}
let nl = /* @__PURE__ */ new WeakMap(), il = !1;
function Ep(n) {
  if (!nl.has(n) && (nl.set(n, null), ["normal", "nowrap", "pre-line"].indexOf(getComputedStyle(n.dom).whiteSpace) !== -1)) {
    if (n.requiresGeckoHackNode = xe, il)
      return;
    console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), il = !0;
  }
}
function sl(n, e) {
  let t = e.startContainer, i = e.startOffset, s = e.endContainer, r = e.endOffset, o = n.domAtPos(n.state.selection.anchor);
  return _t(o.node, o.offset, s, r) && ([t, i, s, r] = [s, r, t, i]), { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: r };
}
function Tp(n, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(n.root)[0];
    if (s)
      return sl(n, s);
  }
  let t;
  function i(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return n.dom.addEventListener("beforeinput", i, !0), document.execCommand("indent"), n.dom.removeEventListener("beforeinput", i, !0), t ? sl(n, t) : null;
}
function Ap(n, e) {
  for (let t = e.parentNode; t && t != n.dom; t = t.parentNode) {
    let i = n.docView.nearestDesc(t, !0);
    if (i && i.node.isBlock)
      return t;
  }
  return null;
}
function _p(n, e) {
  var t;
  let { focusNode: i, focusOffset: s } = n.domSelectionRange();
  for (let r of e)
    if (((t = r.parentNode) === null || t === void 0 ? void 0 : t.nodeName) == "TR") {
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
function Lp(n, e, t) {
  let { node: i, fromOffset: s, toOffset: r, from: o, to: l } = n.docView.parseRange(e, t), a = n.domSelectionRange(), c, d = a.anchorNode;
  if (d && n.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (c = [{ node: d, offset: a.anchorOffset }], es(a) || c.push({ node: a.focusNode, offset: a.focusOffset })), ie && n.input.lastKeyCode === 8)
    for (let g = r; g > s; g--) {
      let b = i.childNodes[g - 1], v = b.pmViewDesc;
      if (b.nodeName == "BR" && !v) {
        r = g;
        break;
      }
      if (!v || v.size)
        break;
    }
  let u = n.state.doc, p = n.someProp("domParser") || rt.fromSchema(n.state.schema), h = u.resolve(o), f = null, m = p.parse(i, {
    topNode: h.parent,
    topMatch: h.parent.contentMatchAt(h.index()),
    topOpen: !0,
    from: s,
    to: r,
    preserveWhitespace: h.parent.type.whitespace == "pre" ? "full" : !0,
    findPositions: c,
    ruleFromNode: Np,
    context: h
  });
  if (c && c[0].pos != null) {
    let g = c[0].pos, b = c[1] && c[1].pos;
    b == null && (b = g), f = { anchor: g + o, head: b + o };
  }
  return { doc: m, sel: f, from: o, to: l };
}
function Np(n) {
  let e = n.pmViewDesc;
  if (e)
    return e.parseRule();
  if (n.nodeName == "BR" && n.parentNode) {
    if (oe && /^(ul|ol)$/i.test(n.parentNode.nodeName)) {
      let t = document.createElement("div");
      return t.appendChild(document.createElement("li")), { skip: t };
    } else if (n.parentNode.lastChild == n || oe && /^(tr|table)$/i.test(n.parentNode.nodeName))
      return { ignore: !0 };
  } else if (n.nodeName == "IMG" && n.getAttribute("mark-placeholder"))
    return { ignore: !0 };
  return null;
}
const Op = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function Rp(n, e, t, i, s) {
  let r = n.input.compositionPendingChanges || (n.composing ? n.input.compositionID : 0);
  if (n.input.compositionPendingChanges = 0, e < 0) {
    let C = n.input.lastSelectionTime > Date.now() - 50 ? n.input.lastSelectionOrigin : null, T = Pr(n, C);
    if (T && !n.state.selection.eq(T)) {
      if (ie && Ue && n.input.lastKeyCode === 13 && Date.now() - 100 < n.input.lastKeyCodeTime && n.someProp("handleKeyDown", (Ce) => Ce(n, gt(13, "Enter"))))
        return;
      let I = n.state.tr.setSelection(T);
      C == "pointer" ? I.setMeta("pointer", !0) : C == "key" && I.scrollIntoView(), r && I.setMeta("composition", r), n.dispatch(I);
    }
    return;
  }
  let o = n.state.doc.resolve(e), l = o.sharedDepth(t);
  e = o.before(l + 1), t = n.state.doc.resolve(t).after(l + 1);
  let a = n.state.selection, c = Lp(n, e, t), d = n.state.doc, u = d.slice(c.from, c.to), p, h;
  n.input.lastKeyCode === 8 && Date.now() - 100 < n.input.lastKeyCodeTime ? (p = n.state.selection.to, h = "end") : (p = n.state.selection.from, h = "start"), n.input.lastKeyCode = null;
  let f = Pp(u.content, c.doc.content, c.from, p, h);
  if (f && n.input.domChangeCount++, (Jt && n.input.lastIOSEnter > Date.now() - 225 || Ue) && s.some((C) => C.nodeType == 1 && !Op.test(C.nodeName)) && (!f || f.endA >= f.endB) && n.someProp("handleKeyDown", (C) => C(n, gt(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (!f)
    if (i && a instanceof _ && !a.empty && a.$head.sameParent(a.$anchor) && !n.composing && !(c.sel && c.sel.anchor != c.sel.head))
      f = { start: a.from, endA: a.to, endB: a.to };
    else {
      if (c.sel) {
        let C = rl(n, n.state.doc, c.sel);
        if (C && !C.eq(n.state.selection)) {
          let T = n.state.tr.setSelection(C);
          r && T.setMeta("composition", r), n.dispatch(T);
        }
      }
      return;
    }
  n.state.selection.from < n.state.selection.to && f.start == f.endB && n.state.selection instanceof _ && (f.start > n.state.selection.from && f.start <= n.state.selection.from + 2 && n.state.selection.from >= c.from ? f.start = n.state.selection.from : f.endA < n.state.selection.to && f.endA >= n.state.selection.to - 2 && n.state.selection.to <= c.to && (f.endB += n.state.selection.to - f.endA, f.endA = n.state.selection.to)), he && ot <= 11 && f.endB == f.start + 1 && f.endA == f.start && f.start > c.from && c.doc.textBetween(f.start - c.from - 1, f.start - c.from + 1) == "  " && (f.start--, f.endA--, f.endB--);
  let m = c.doc.resolveNoCache(f.start - c.from), g = c.doc.resolveNoCache(f.endB - c.from), b = d.resolve(f.start), v = m.sameParent(g) && m.parent.inlineContent && b.end() >= f.endA;
  if ((Jt && n.input.lastIOSEnter > Date.now() - 225 && (!v || s.some((C) => C.nodeName == "DIV" || C.nodeName == "P")) || !v && m.pos < c.doc.content.size && (!m.sameParent(g) || !m.parent.inlineContent) && m.pos < g.pos && !/\S/.test(c.doc.textBetween(m.pos, g.pos, "", ""))) && n.someProp("handleKeyDown", (C) => C(n, gt(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (n.state.selection.anchor > f.start && Dp(d, f.start, f.endA, m, g) && n.someProp("handleKeyDown", (C) => C(n, gt(8, "Backspace")))) {
    Ue && ie && n.domObserver.suppressSelectionUpdates();
    return;
  }
  ie && f.endB == f.start && (n.input.lastChromeDelete = Date.now()), Ue && !v && m.start() != g.start() && g.parentOffset == 0 && m.depth == g.depth && c.sel && c.sel.anchor == c.sel.head && c.sel.head == f.endA && (f.endB -= 2, g = c.doc.resolveNoCache(f.endB - c.from), setTimeout(() => {
    n.someProp("handleKeyDown", function(C) {
      return C(n, gt(13, "Enter"));
    });
  }, 20));
  let k = f.start, M = f.endA, x = (C) => {
    let T = C || n.state.tr.replace(k, M, c.doc.slice(f.start - c.from, f.endB - c.from));
    if (c.sel) {
      let I = rl(n, T.doc, c.sel);
      I && !(ie && n.composing && I.empty && (f.start != f.endB || n.input.lastChromeDelete < Date.now() - 100) && (I.head == k || I.head == T.mapping.map(M) - 1) || he && I.empty && I.head == k) && T.setSelection(I);
    }
    return r && T.setMeta("composition", r), T.scrollIntoView();
  }, N;
  if (v)
    if (m.pos == g.pos) {
      he && ot <= 11 && m.parentOffset == 0 && (n.domObserver.suppressSelectionUpdates(), setTimeout(() => je(n), 20));
      let C = x(n.state.tr.delete(k, M)), T = d.resolve(f.start).marksAcross(d.resolve(f.endA));
      T && C.ensureMarks(T), n.dispatch(C);
    } else if (
      // Adding or removing a mark
      f.endA == f.endB && (N = Ip(m.parent.content.cut(m.parentOffset, g.parentOffset), b.parent.content.cut(b.parentOffset, f.endA - b.start())))
    ) {
      let C = x(n.state.tr);
      N.type == "add" ? C.addMark(k, M, N.mark) : C.removeMark(k, M, N.mark), n.dispatch(C);
    } else if (m.parent.child(m.index()).isText && m.index() == g.index() - (g.textOffset ? 0 : 1)) {
      let C = m.parent.textBetween(m.parentOffset, g.parentOffset), T = () => x(n.state.tr.insertText(C, k, M));
      n.someProp("handleTextInput", (I) => I(n, k, M, C, T)) || n.dispatch(T());
    } else
      n.dispatch(x());
  else
    n.dispatch(x());
}
function rl(n, e, t) {
  return Math.max(t.anchor, t.head) > e.content.size ? null : Br(n, e.resolve(t.anchor), e.resolve(t.head));
}
function Ip(n, e) {
  let t = n.firstChild.marks, i = e.firstChild.marks, s = t, r = i, o, l, a;
  for (let d = 0; d < i.length; d++)
    s = i[d].removeFromSet(s);
  for (let d = 0; d < t.length; d++)
    r = t[d].removeFromSet(r);
  if (s.length == 1 && r.length == 0)
    l = s[0], o = "add", a = (d) => d.mark(l.addToSet(d.marks));
  else if (s.length == 0 && r.length == 1)
    l = r[0], o = "remove", a = (d) => d.mark(l.removeFromSet(d.marks));
  else
    return null;
  let c = [];
  for (let d = 0; d < e.childCount; d++)
    c.push(a(e.child(d)));
  if (y.from(c).eq(n))
    return { mark: l, type: o };
}
function Dp(n, e, t, i, s) {
  if (
    // The content must have shrunk
    t - e <= s.pos - i.pos || // newEnd must point directly at or after the end of the block that newStart points into
    As(i, !0, !1) < s.pos
  )
    return !1;
  let r = n.resolve(e);
  if (!i.parent.isTextblock) {
    let l = r.nodeAfter;
    return l != null && t == e + l.nodeSize;
  }
  if (r.parentOffset < r.parent.content.size || !r.parent.isTextblock)
    return !1;
  let o = n.resolve(As(r, !0, !0));
  return !o.parent.isTextblock || o.pos > t || As(o, !0, !1) < t ? !1 : i.parent.content.cut(i.parentOffset).eq(o.parent.content);
}
function As(n, e, t) {
  let i = n.depth, s = e ? n.end() : n.pos;
  for (; i > 0 && (e || n.indexAfter(i) == n.node(i).childCount); )
    i--, s++, e = !1;
  if (t) {
    let r = n.node(i).maybeChild(n.indexAfter(i));
    for (; r && !r.isLeaf; )
      r = r.firstChild, s++;
  }
  return s;
}
function Pp(n, e, t, i, s) {
  let r = n.findDiffStart(e, t);
  if (r == null)
    return null;
  let { a: o, b: l } = n.findDiffEnd(e, t + n.size, t + e.size);
  if (s == "end") {
    let a = Math.max(0, r - Math.min(o, l));
    i -= o + a - r;
  }
  if (o < r && n.size < e.size) {
    let a = i <= r && i >= o ? r - i : 0;
    r -= a, r && r < e.size && ol(e.textBetween(r - 1, r + 1)) && (r += a ? 1 : -1), l = r + (l - o), o = r;
  } else if (l < r) {
    let a = i <= r && i >= l ? r - i : 0;
    r -= a, r && r < n.size && ol(n.textBetween(r - 1, r + 1)) && (r += a ? 1 : -1), o = r + (o - l), l = r;
  }
  return { start: r, endA: o, endB: l };
}
function ol(n) {
  if (n.length != 2)
    return !1;
  let e = n.charCodeAt(0), t = n.charCodeAt(1);
  return e >= 56320 && e <= 57343 && t >= 55296 && t <= 56319;
}
class pc {
  /**
  Create a view. `place` may be a DOM node that the editor should
  be appended to, a function that will place it into the document,
  or an object whose `mount` property holds the node to use as the
  document container. If it is `null`, the editor will not be
  added to the document.
  */
  constructor(e, t) {
    this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new Qu(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = t, this.state = t.state, this.directPlugins = t.plugins || [], this.directPlugins.forEach(ul), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = cl(this), al(this), this.nodeViews = dl(this), this.docView = Fo(this.state.doc, ll(this), Ts(this), this.dom, this), this.domObserver = new Mp(this, (i, s, r, o) => Rp(this, i, s, r, o)), this.domObserver.start(), Zu(this), this.updatePluginViews();
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
      let e = this._props;
      this._props = {};
      for (let t in e)
        this._props[t] = e[t];
      this._props.state = this.state;
    }
    return this._props;
  }
  /**
  Update the view's props. Will immediately cause an update to
  the DOM.
  */
  update(e) {
    e.handleDOMEvents != this._props.handleDOMEvents && lr(this);
    let t = this._props;
    this._props = e, e.plugins && (e.plugins.forEach(ul), this.directPlugins = e.plugins), this.updateStateInner(e.state, t);
  }
  /**
  Update the view by updating existing props object with the object
  given as argument. Equivalent to `view.update(Object.assign({},
  view.props, props))`.
  */
  setProps(e) {
    let t = {};
    for (let i in this._props)
      t[i] = this._props[i];
    t.state = this.state;
    for (let i in e)
      t[i] = e[i];
    this.update(t);
  }
  /**
  Update the editor's `state` prop, without touching any of the
  other props.
  */
  updateState(e) {
    this.updateStateInner(e, this._props);
  }
  updateStateInner(e, t) {
    var i;
    let s = this.state, r = !1, o = !1;
    e.storedMarks && this.composing && (rc(this), o = !0), this.state = e;
    let l = s.plugins != e.plugins || this._props.plugins != t.plugins;
    if (l || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
      let h = dl(this);
      Hp(h, this.nodeViews) && (this.nodeViews = h, r = !0);
    }
    (l || t.handleDOMEvents != this._props.handleDOMEvents) && lr(this), this.editable = cl(this), al(this);
    let a = Ts(this), c = ll(this), d = s.plugins != e.plugins && !s.doc.eq(e.doc) ? "reset" : e.scrollToSelection > s.scrollToSelection ? "to selection" : "preserve", u = r || !this.docView.matchesNode(e.doc, c, a);
    (u || !e.selection.eq(s.selection)) && (o = !0);
    let p = d == "preserve" && o && this.dom.style.overflowAnchor == null && hu(this);
    if (o) {
      this.domObserver.stop();
      let h = u && (he || ie) && !this.composing && !s.selection.empty && !e.selection.empty && Bp(s.selection, e.selection);
      if (u) {
        let f = ie ? this.trackWrites = this.domSelectionRange().focusNode : null;
        this.composing && (this.input.compositionNode = hp(this)), (r || !this.docView.update(e.doc, c, a, this)) && (this.docView.updateOuterDeco(c), this.docView.destroy(), this.docView = Fo(e.doc, c, a, this.dom, this)), f && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (h = !0);
      }
      h || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && Bu(this)) ? je(this, h) : (Ka(this, e.selection), this.domObserver.setCurSelection()), this.domObserver.start();
    }
    this.updatePluginViews(s), !((i = this.dragging) === null || i === void 0) && i.node && !s.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, s), d == "reset" ? this.dom.scrollTop = 0 : d == "to selection" ? this.scrollToSelection() : p && fu(p);
  }
  /**
  @internal
  */
  scrollToSelection() {
    let e = this.domSelectionRange().focusNode;
    if (!(!e || !this.dom.contains(e.nodeType == 1 ? e : e.parentNode))) {
      if (!this.someProp("handleScrollToSelection", (t) => t(this))) if (this.state.selection instanceof A) {
        let t = this.docView.domAfterPos(this.state.selection.from);
        t.nodeType == 1 && Do(this, t.getBoundingClientRect(), e);
      } else
        Do(this, this.coordsAtPos(this.state.selection.head, 1), e);
    }
  }
  destroyPluginViews() {
    let e;
    for (; e = this.pluginViews.pop(); )
      e.destroy && e.destroy();
  }
  updatePluginViews(e) {
    if (!e || e.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
      this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
      for (let t = 0; t < this.directPlugins.length; t++) {
        let i = this.directPlugins[t];
        i.spec.view && this.pluginViews.push(i.spec.view(this));
      }
      for (let t = 0; t < this.state.plugins.length; t++) {
        let i = this.state.plugins[t];
        i.spec.view && this.pluginViews.push(i.spec.view(this));
      }
    } else
      for (let t = 0; t < this.pluginViews.length; t++) {
        let i = this.pluginViews[t];
        i.update && i.update(this, e);
      }
  }
  updateDraggedNode(e, t) {
    let i = e.node, s = -1;
    if (this.state.doc.nodeAt(i.from) == i.node)
      s = i.from;
    else {
      let r = i.from + (this.state.doc.content.size - t.doc.content.size);
      (r > 0 && this.state.doc.nodeAt(r)) == i.node && (s = r);
    }
    this.dragging = new lc(e.slice, e.move, s < 0 ? void 0 : A.create(this.state.doc, s));
  }
  someProp(e, t) {
    let i = this._props && this._props[e], s;
    if (i != null && (s = t ? t(i) : i))
      return s;
    for (let o = 0; o < this.directPlugins.length; o++) {
      let l = this.directPlugins[o].props[e];
      if (l != null && (s = t ? t(l) : l))
        return s;
    }
    let r = this.state.plugins;
    if (r)
      for (let o = 0; o < r.length; o++) {
        let l = r[o].props[e];
        if (l != null && (s = t ? t(l) : l))
          return s;
      }
  }
  /**
  Query whether the view has focus.
  */
  hasFocus() {
    if (he) {
      let e = this.root.activeElement;
      if (e == this.dom)
        return !0;
      if (!e || !this.dom.contains(e))
        return !1;
      for (; e && this.dom != e && this.dom.contains(e); ) {
        if (e.contentEditable == "false")
          return !1;
        e = e.parentElement;
      }
      return !0;
    }
    return this.root.activeElement == this.dom;
  }
  /**
  Focus the editor.
  */
  focus() {
    this.domObserver.stop(), this.editable && mu(this.dom), je(this), this.domObserver.start();
  }
  /**
  Get the document root in which the editor exists. This will
  usually be the top-level `document`, but might be a [shadow
  DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  root if the editor is inside one.
  */
  get root() {
    let e = this._root;
    if (e == null) {
      for (let t = this.dom.parentNode; t; t = t.parentNode)
        if (t.nodeType == 9 || t.nodeType == 11 && t.host)
          return t.getSelection || (Object.getPrototypeOf(t).getSelection = () => t.ownerDocument.getSelection()), this._root = t;
    }
    return e || document;
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
  posAtCoords(e) {
    return ku(this, e);
  }
  /**
  Returns the viewport rectangle at a given document position.
  `left` and `right` will be the same number, as this returns a
  flat cursor-ish rectangle. If the position is between two things
  that aren't directly adjacent, `side` determines which element
  is used. When < 0, the element before the position is used,
  otherwise the element after.
  */
  coordsAtPos(e, t = 1) {
    return za(this, e, t);
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
  domAtPos(e, t = 0) {
    return this.docView.domFromPos(e, t);
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
  nodeDOM(e) {
    let t = this.docView.descAt(e);
    return t ? t.nodeDOM : null;
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
  posAtDOM(e, t, i = -1) {
    let s = this.docView.posFromDOM(e, t, i);
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
  endOfTextblock(e, t) {
    return Mu(this, t || this.state, e);
  }
  /**
  Run the editor's paste logic with the given HTML string. The
  `event`, if given, will be passed to the
  [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
  */
  pasteHTML(e, t) {
    return Cn(this, "", e, !1, t || new ClipboardEvent("paste"));
  }
  /**
  Run the editor's paste logic with the given plain-text input.
  */
  pasteText(e, t) {
    return Cn(this, e, null, !0, t || new ClipboardEvent("paste"));
  }
  /**
  Serialize the given slice as it would be if it was copied from
  this editor. Returns a DOM element that contains a
  representation of the slice as its children, a textual
  representation, and the transformed slice (which can be
  different from the given input due to hooks like
  [`transformCopied`](https://prosemirror.net/docs/ref/#view.EditorProps.transformCopied)).
  */
  serializeForClipboard(e) {
    return Hr(this, e);
  }
  /**
  Removes the editor from the DOM and destroys all [node
  views](https://prosemirror.net/docs/ref/#view.NodeView).
  */
  destroy() {
    this.docView && (ep(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], Ts(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, iu());
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
  dispatchEvent(e) {
    return np(this, e);
  }
  /**
  @internal
  */
  domSelectionRange() {
    let e = this.domSelection();
    return e ? oe && this.root.nodeType === 11 && au(this.dom.ownerDocument) == this.dom && Tp(this, e) || e : { focusNode: null, focusOffset: 0, anchorNode: null, anchorOffset: 0 };
  }
  /**
  @internal
  */
  domSelection() {
    return this.root.getSelection();
  }
}
pc.prototype.dispatch = function(n) {
  let e = this._props.dispatchTransaction;
  e ? e.call(this, n) : this.updateState(this.state.apply(n));
};
function ll(n) {
  let e = /* @__PURE__ */ Object.create(null);
  return e.class = "ProseMirror", e.contenteditable = String(n.editable), n.someProp("attributes", (t) => {
    if (typeof t == "function" && (t = t(n.state)), t)
      for (let i in t)
        i == "class" ? e.class += " " + t[i] : i == "style" ? e.style = (e.style ? e.style + ";" : "") + t[i] : !e[i] && i != "contenteditable" && i != "nodeName" && (e[i] = String(t[i]));
  }), e.translate || (e.translate = "no"), [se.node(0, n.state.doc.content.size, e)];
}
function al(n) {
  if (n.markCursor) {
    let e = document.createElement("img");
    e.className = "ProseMirror-separator", e.setAttribute("mark-placeholder", "true"), e.setAttribute("alt", ""), n.cursorWrapper = { dom: e, deco: se.widget(n.state.selection.from, e, { raw: !0, marks: n.markCursor }) };
  } else
    n.cursorWrapper = null;
}
function cl(n) {
  return !n.someProp("editable", (e) => e(n.state) === !1);
}
function Bp(n, e) {
  let t = Math.min(n.$anchor.sharedDepth(n.head), e.$anchor.sharedDepth(e.head));
  return n.$anchor.start(t) != e.$anchor.start(t);
}
function dl(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    for (let s in i)
      Object.prototype.hasOwnProperty.call(e, s) || (e[s] = i[s]);
  }
  return n.someProp("nodeViews", t), n.someProp("markViews", t), e;
}
function Hp(n, e) {
  let t = 0, i = 0;
  for (let s in n) {
    if (n[s] != e[s])
      return !0;
    t++;
  }
  for (let s in e)
    i++;
  return t != i;
}
function ul(n) {
  if (n.spec.state || n.spec.filterTransaction || n.spec.appendTransaction)
    throw new RangeError("Plugins passed directly to the view must not have a state component");
}
var ct = {
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
}, bi = {
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
}, zp = typeof navigator < "u" && /Mac/.test(navigator.platform), $p = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var ne = 0; ne < 10; ne++) ct[48 + ne] = ct[96 + ne] = String(ne);
for (var ne = 1; ne <= 24; ne++) ct[ne + 111] = "F" + ne;
for (var ne = 65; ne <= 90; ne++)
  ct[ne] = String.fromCharCode(ne + 32), bi[ne] = String.fromCharCode(ne);
for (var _s in ct) bi.hasOwnProperty(_s) || (bi[_s] = ct[_s]);
function Fp(n) {
  var e = zp && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || $p && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? bi : ct)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
const qp = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), Vp = typeof navigator < "u" && /Win/.test(navigator.platform);
function Up(n) {
  let e = n.split(/-(?!$)/), t = e[e.length - 1];
  t == "Space" && (t = " ");
  let i, s, r, o;
  for (let l = 0; l < e.length - 1; l++) {
    let a = e[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      s = !0;
    else if (/^s(hift)?$/i.test(a))
      r = !0;
    else if (/^mod$/i.test(a))
      qp ? o = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + a);
  }
  return i && (t = "Alt-" + t), s && (t = "Ctrl-" + t), o && (t = "Meta-" + t), r && (t = "Shift-" + t), t;
}
function Wp(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n)
    e[Up(t)] = n[t];
  return e;
}
function Ls(n, e, t = !0) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t && e.shiftKey && (n = "Shift-" + n), n;
}
function jp(n) {
  return new W({ props: { handleKeyDown: Ur(n) } });
}
function Ur(n) {
  let e = Wp(n);
  return function(t, i) {
    let s = Fp(i), r, o = e[Ls(s, i)];
    if (o && o(t.state, t.dispatch, t))
      return !0;
    if (s.length == 1 && s != " ") {
      if (i.shiftKey) {
        let l = e[Ls(s, i, !1)];
        if (l && l(t.state, t.dispatch, t))
          return !0;
      }
      if ((i.altKey || i.metaKey || i.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(Vp && i.ctrlKey && i.altKey) && (r = ct[i.keyCode]) && r != s) {
        let l = e[Ls(r, i)];
        if (l && l(t.state, t.dispatch, t))
          return !0;
      }
    }
    return !1;
  };
}
const Wr = (n, e) => n.selection.empty ? !1 : (e && e(n.tr.deleteSelection().scrollIntoView()), !0);
function hc(n, e) {
  let { $cursor: t } = n.selection;
  return !t || (e ? !e.endOfTextblock("backward", n) : t.parentOffset > 0) ? null : t;
}
const fc = (n, e, t) => {
  let i = hc(n, t);
  if (!i)
    return !1;
  let s = jr(i);
  if (!s) {
    let o = i.blockRange(), l = o && Yt(o);
    return l == null ? !1 : (e && e(n.tr.lift(o, l).scrollIntoView()), !0);
  }
  let r = s.nodeBefore;
  if (Sc(n, s, e, -1))
    return !0;
  if (i.parent.content.size == 0 && (Gt(r, "end") || A.isSelectable(r)))
    for (let o = i.depth; ; o--) {
      let l = Qi(n.doc, i.before(o), i.after(o), S.empty);
      if (l && l.slice.size < l.to - l.from) {
        if (e) {
          let a = n.tr.step(l);
          a.setSelection(Gt(r, "end") ? L.findFrom(a.doc.resolve(a.mapping.map(s.pos, -1)), -1) : A.create(a.doc, s.pos - r.nodeSize)), e(a.scrollIntoView());
        }
        return !0;
      }
      if (o == 1 || i.node(o - 1).childCount > 1)
        break;
    }
  return r.isAtom && s.depth == i.depth - 1 ? (e && e(n.tr.delete(s.pos - r.nodeSize, s.pos).scrollIntoView()), !0) : !1;
}, Kp = (n, e, t) => {
  let i = hc(n, t);
  if (!i)
    return !1;
  let s = jr(i);
  return s ? mc(n, s, e) : !1;
}, Jp = (n, e, t) => {
  let i = bc(n, t);
  if (!i)
    return !1;
  let s = Kr(i);
  return s ? mc(n, s, e) : !1;
};
function mc(n, e, t) {
  let i = e.nodeBefore, s = i, r = e.pos - 1;
  for (; !s.isTextblock; r--) {
    if (s.type.spec.isolating)
      return !1;
    let d = s.lastChild;
    if (!d)
      return !1;
    s = d;
  }
  let o = e.nodeAfter, l = o, a = e.pos + 1;
  for (; !l.isTextblock; a++) {
    if (l.type.spec.isolating)
      return !1;
    let d = l.firstChild;
    if (!d)
      return !1;
    l = d;
  }
  let c = Qi(n.doc, r, a, S.empty);
  if (!c || c.from != r || c instanceof G && c.slice.size >= a - r)
    return !1;
  if (t) {
    let d = n.tr.step(c);
    d.setSelection(_.create(d.doc, r)), t(d.scrollIntoView());
  }
  return !0;
}
function Gt(n, e, t = !1) {
  for (let i = n; i; i = e == "start" ? i.firstChild : i.lastChild) {
    if (i.isTextblock)
      return !0;
    if (t && i.childCount != 1)
      return !1;
  }
  return !1;
}
const gc = (n, e, t) => {
  let { $head: i, empty: s } = n.selection, r = i;
  if (!s)
    return !1;
  if (i.parent.isTextblock) {
    if (t ? !t.endOfTextblock("backward", n) : i.parentOffset > 0)
      return !1;
    r = jr(i);
  }
  let o = r && r.nodeBefore;
  return !o || !A.isSelectable(o) ? !1 : (e && e(n.tr.setSelection(A.create(n.doc, r.pos - o.nodeSize)).scrollIntoView()), !0);
};
function jr(n) {
  if (!n.parent.type.spec.isolating)
    for (let e = n.depth - 1; e >= 0; e--) {
      if (n.index(e) > 0)
        return n.doc.resolve(n.before(e + 1));
      if (n.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function bc(n, e) {
  let { $cursor: t } = n.selection;
  return !t || (e ? !e.endOfTextblock("forward", n) : t.parentOffset < t.parent.content.size) ? null : t;
}
const yc = (n, e, t) => {
  let i = bc(n, t);
  if (!i)
    return !1;
  let s = Kr(i);
  if (!s)
    return !1;
  let r = s.nodeAfter;
  if (Sc(n, s, e, 1))
    return !0;
  if (i.parent.content.size == 0 && (Gt(r, "start") || A.isSelectable(r))) {
    let o = Qi(n.doc, i.before(), i.after(), S.empty);
    if (o && o.slice.size < o.to - o.from) {
      if (e) {
        let l = n.tr.step(o);
        l.setSelection(Gt(r, "start") ? L.findFrom(l.doc.resolve(l.mapping.map(s.pos)), 1) : A.create(l.doc, l.mapping.map(s.pos))), e(l.scrollIntoView());
      }
      return !0;
    }
  }
  return r.isAtom && s.depth == i.depth - 1 ? (e && e(n.tr.delete(s.pos, s.pos + r.nodeSize).scrollIntoView()), !0) : !1;
}, vc = (n, e, t) => {
  let { $head: i, empty: s } = n.selection, r = i;
  if (!s)
    return !1;
  if (i.parent.isTextblock) {
    if (t ? !t.endOfTextblock("forward", n) : i.parentOffset < i.parent.content.size)
      return !1;
    r = Kr(i);
  }
  let o = r && r.nodeAfter;
  return !o || !A.isSelectable(o) ? !1 : (e && e(n.tr.setSelection(A.create(n.doc, r.pos)).scrollIntoView()), !0);
};
function Kr(n) {
  if (!n.parent.type.spec.isolating)
    for (let e = n.depth - 1; e >= 0; e--) {
      let t = n.node(e);
      if (n.index(e) + 1 < t.childCount)
        return n.doc.resolve(n.after(e + 1));
      if (t.type.spec.isolating)
        break;
    }
  return null;
}
const Gp = (n, e) => {
  let t = n.selection, i = t instanceof A, s;
  if (i) {
    if (t.node.isTextblock || !ut(n.doc, t.from))
      return !1;
    s = t.from;
  } else if (s = Xi(n.doc, t.from, -1), s == null)
    return !1;
  if (e) {
    let r = n.tr.join(s);
    i && r.setSelection(A.create(r.doc, s - n.doc.resolve(s).nodeBefore.nodeSize)), e(r.scrollIntoView());
  }
  return !0;
}, Yp = (n, e) => {
  let t = n.selection, i;
  if (t instanceof A) {
    if (t.node.isTextblock || !ut(n.doc, t.to))
      return !1;
    i = t.to;
  } else if (i = Xi(n.doc, t.to, 1), i == null)
    return !1;
  return e && e(n.tr.join(i).scrollIntoView()), !0;
}, Xp = (n, e) => {
  let { $from: t, $to: i } = n.selection, s = t.blockRange(i), r = s && Yt(s);
  return r == null ? !1 : (e && e(n.tr.lift(s, r).scrollIntoView()), !0);
}, kc = (n, e) => {
  let { $head: t, $anchor: i } = n.selection;
  return !t.parent.type.spec.code || !t.sameParent(i) ? !1 : (e && e(n.tr.insertText(`
`).scrollIntoView()), !0);
};
function Jr(n) {
  for (let e = 0; e < n.edgeCount; e++) {
    let { type: t } = n.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
const Qp = (n, e) => {
  let { $head: t, $anchor: i } = n.selection;
  if (!t.parent.type.spec.code || !t.sameParent(i))
    return !1;
  let s = t.node(-1), r = t.indexAfter(-1), o = Jr(s.contentMatchAt(r));
  if (!o || !s.canReplaceWith(r, r, o))
    return !1;
  if (e) {
    let l = t.after(), a = n.tr.replaceWith(l, l, o.createAndFill());
    a.setSelection(L.near(a.doc.resolve(l), 1)), e(a.scrollIntoView());
  }
  return !0;
}, wc = (n, e) => {
  let t = n.selection, { $from: i, $to: s } = t;
  if (t instanceof be || i.parent.inlineContent || s.parent.inlineContent)
    return !1;
  let r = Jr(s.parent.contentMatchAt(s.indexAfter()));
  if (!r || !r.isTextblock)
    return !1;
  if (e) {
    let o = (!i.parentOffset && s.index() < s.parent.childCount ? i : s).pos, l = n.tr.insert(o, r.createAndFill());
    l.setSelection(_.create(l.doc, o + 1)), e(l.scrollIntoView());
  }
  return !0;
}, xc = (n, e) => {
  let { $cursor: t } = n.selection;
  if (!t || t.parent.content.size)
    return !1;
  if (t.depth > 1 && t.after() != t.end(-1)) {
    let r = t.before();
    if (We(n.doc, r))
      return e && e(n.tr.split(r).scrollIntoView()), !0;
  }
  let i = t.blockRange(), s = i && Yt(i);
  return s == null ? !1 : (e && e(n.tr.lift(i, s).scrollIntoView()), !0);
};
function Zp(n) {
  return (e, t) => {
    let { $from: i, $to: s } = e.selection;
    if (e.selection instanceof A && e.selection.node.isBlock)
      return !i.parentOffset || !We(e.doc, i.pos) ? !1 : (t && t(e.tr.split(i.pos).scrollIntoView()), !0);
    if (!i.depth)
      return !1;
    let r = [], o, l, a = !1, c = !1;
    for (let h = i.depth; ; h--)
      if (i.node(h).isBlock) {
        a = i.end(h) == i.pos + (i.depth - h), c = i.start(h) == i.pos - (i.depth - h), l = Jr(i.node(h - 1).contentMatchAt(i.indexAfter(h - 1))), r.unshift(a && l ? { type: l } : null), o = h;
        break;
      } else {
        if (h == 1)
          return !1;
        r.unshift(null);
      }
    let d = e.tr;
    (e.selection instanceof _ || e.selection instanceof be) && d.deleteSelection();
    let u = d.mapping.map(i.pos), p = We(d.doc, u, r.length, r);
    if (p || (r[0] = l ? { type: l } : null, p = We(d.doc, u, r.length, r)), !p)
      return !1;
    if (d.split(u, r.length, r), !a && c && i.node(o).type != l) {
      let h = d.mapping.map(i.before(o)), f = d.doc.resolve(h);
      l && i.node(o - 1).canReplaceWith(f.index(), f.index() + 1, l) && d.setNodeMarkup(d.mapping.map(i.before(o)), l);
    }
    return t && t(d.scrollIntoView()), !0;
  };
}
const eh = Zp(), th = (n, e) => {
  let { $from: t, to: i } = n.selection, s, r = t.sharedDepth(i);
  return r == 0 ? !1 : (s = t.before(r), e && e(n.tr.setSelection(A.create(n.doc, s))), !0);
};
function nh(n, e, t) {
  let i = e.nodeBefore, s = e.nodeAfter, r = e.index();
  return !i || !s || !i.type.compatibleContent(s.type) ? !1 : !i.content.size && e.parent.canReplace(r - 1, r) ? (t && t(n.tr.delete(e.pos - i.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(r, r + 1) || !(s.isTextblock || ut(n.doc, e.pos)) ? !1 : (t && t(n.tr.join(e.pos).scrollIntoView()), !0);
}
function Sc(n, e, t, i) {
  let s = e.nodeBefore, r = e.nodeAfter, o, l, a = s.type.spec.isolating || r.type.spec.isolating;
  if (!a && nh(n, e, t))
    return !0;
  let c = !a && e.parent.canReplace(e.index(), e.index() + 1);
  if (c && (o = (l = s.contentMatchAt(s.childCount)).findWrapping(r.type)) && l.matchType(o[0] || r.type).validEnd) {
    if (t) {
      let h = e.pos + r.nodeSize, f = y.empty;
      for (let b = o.length - 1; b >= 0; b--)
        f = y.from(o[b].create(null, f));
      f = y.from(s.copy(f));
      let m = n.tr.step(new Y(e.pos - 1, h, e.pos, h, new S(f, 1, 0), o.length, !0)), g = m.doc.resolve(h + 2 * o.length);
      g.nodeAfter && g.nodeAfter.type == s.type && ut(m.doc, g.pos) && m.join(g.pos), t(m.scrollIntoView());
    }
    return !0;
  }
  let d = r.type.spec.isolating || i > 0 && a ? null : L.findFrom(e, 1), u = d && d.$from.blockRange(d.$to), p = u && Yt(u);
  if (p != null && p >= e.depth)
    return t && t(n.tr.lift(u, p).scrollIntoView()), !0;
  if (c && Gt(r, "start", !0) && Gt(s, "end")) {
    let h = s, f = [];
    for (; f.push(h), !h.isTextblock; )
      h = h.lastChild;
    let m = r, g = 1;
    for (; !m.isTextblock; m = m.firstChild)
      g++;
    if (h.canReplace(h.childCount, h.childCount, m.content)) {
      if (t) {
        let b = y.empty;
        for (let k = f.length - 1; k >= 0; k--)
          b = y.from(f[k].copy(b));
        let v = n.tr.step(new Y(e.pos - f.length, e.pos + r.nodeSize, e.pos + g, e.pos + r.nodeSize - g, new S(b, f.length, 0), 0, !0));
        t(v.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function Cc(n) {
  return function(e, t) {
    let i = e.selection, s = n < 0 ? i.$from : i.$to, r = s.depth;
    for (; s.node(r).isInline; ) {
      if (!r)
        return !1;
      r--;
    }
    return s.node(r).isTextblock ? (t && t(e.tr.setSelection(_.create(e.doc, n < 0 ? s.start(r) : s.end(r)))), !0) : !1;
  };
}
const ih = Cc(-1), sh = Cc(1);
function rh(n, e = null) {
  return function(t, i) {
    let { $from: s, $to: r } = t.selection, o = s.blockRange(r), l = o && Or(o, n, e);
    return l ? (i && i(t.tr.wrap(o, l).scrollIntoView()), !0) : !1;
  };
}
function pl(n, e = null) {
  return function(t, i) {
    let s = !1;
    for (let r = 0; r < t.selection.ranges.length && !s; r++) {
      let { $from: { pos: o }, $to: { pos: l } } = t.selection.ranges[r];
      t.doc.nodesBetween(o, l, (a, c) => {
        if (s)
          return !1;
        if (!(!a.isTextblock || a.hasMarkup(n, e)))
          if (a.type == n)
            s = !0;
          else {
            let d = t.doc.resolve(c), u = d.index();
            s = d.parent.canReplaceWith(u, u + 1, n);
          }
      });
    }
    if (!s)
      return !1;
    if (i) {
      let r = t.tr;
      for (let o = 0; o < t.selection.ranges.length; o++) {
        let { $from: { pos: l }, $to: { pos: a } } = t.selection.ranges[o];
        r.setBlockType(l, a, n, e);
      }
      i(r.scrollIntoView());
    }
    return !0;
  };
}
function Gr(...n) {
  return function(e, t, i) {
    for (let s = 0; s < n.length; s++)
      if (n[s](e, t, i))
        return !0;
    return !1;
  };
}
Gr(Wr, fc, gc);
Gr(Wr, yc, vc);
Gr(kc, wc, xc, eh);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function oh(n, e = null) {
  return function(t, i) {
    let { $from: s, $to: r } = t.selection, o = s.blockRange(r);
    if (!o)
      return !1;
    let l = i ? t.tr : null;
    return lh(l, o, n, e) ? (i && i(l.scrollIntoView()), !0) : !1;
  };
}
function lh(n, e, t, i = null) {
  let s = !1, r = e, o = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(t) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let a = o.resolve(e.start - 2);
    r = new di(a, a, e.depth), e.endIndex < e.parent.childCount && (e = new di(e.$from, o.resolve(e.$to.end(e.depth)), e.depth)), s = !0;
  }
  let l = Or(r, t, i, e);
  return l ? (n && ah(n, e, l, s, t), !0) : !1;
}
function ah(n, e, t, i, s) {
  let r = y.empty;
  for (let d = t.length - 1; d >= 0; d--)
    r = y.from(t[d].type.create(t[d].attrs, r));
  n.step(new Y(e.start - (i ? 2 : 0), e.end, e.start, e.end, new S(r, 0, 0), t.length, !0));
  let o = 0;
  for (let d = 0; d < t.length; d++)
    t[d].type == s && (o = d + 1);
  let l = t.length - o, a = e.start + t.length - (i ? 2 : 0), c = e.parent;
  for (let d = e.startIndex, u = e.endIndex, p = !0; d < u; d++, p = !1)
    !p && We(n.doc, a, l) && (n.split(a, l), a += 2 * l), a += c.child(d).nodeSize;
  return n;
}
function ch(n) {
  return function(e, t) {
    let { $from: i, $to: s } = e.selection, r = i.blockRange(s, (o) => o.childCount > 0 && o.firstChild.type == n);
    return r ? t ? i.node(r.depth - 1).type == n ? dh(e, t, n, r) : uh(e, t, r) : !0 : !1;
  };
}
function dh(n, e, t, i) {
  let s = n.tr, r = i.end, o = i.$to.end(i.depth);
  r < o && (s.step(new Y(r - 1, o, r, o, new S(y.from(t.create(null, i.parent.copy())), 1, 0), 1, !0)), i = new di(s.doc.resolve(i.$from.pos), s.doc.resolve(o), i.depth));
  const l = Yt(i);
  if (l == null)
    return !1;
  s.lift(i, l);
  let a = s.doc.resolve(s.mapping.map(r, -1) - 1);
  return ut(s.doc, a.pos) && a.nodeBefore.type == a.nodeAfter.type && s.join(a.pos), e(s.scrollIntoView()), !0;
}
function uh(n, e, t) {
  let i = n.tr, s = t.parent;
  for (let h = t.end, f = t.endIndex - 1, m = t.startIndex; f > m; f--)
    h -= s.child(f).nodeSize, i.delete(h - 1, h + 1);
  let r = i.doc.resolve(t.start), o = r.nodeAfter;
  if (i.mapping.map(t.end) != t.start + r.nodeAfter.nodeSize)
    return !1;
  let l = t.startIndex == 0, a = t.endIndex == s.childCount, c = r.node(-1), d = r.index(-1);
  if (!c.canReplace(d + (l ? 0 : 1), d + 1, o.content.append(a ? y.empty : y.from(s))))
    return !1;
  let u = r.pos, p = u + o.nodeSize;
  return i.step(new Y(u - (l ? 1 : 0), p + (a ? 1 : 0), u + 1, p - 1, new S((l ? y.empty : y.from(s.copy(y.empty))).append(a ? y.empty : y.from(s.copy(y.empty))), l ? 0 : 1, a ? 0 : 1), l ? 0 : 1)), e(i.scrollIntoView()), !0;
}
function ph(n) {
  return function(e, t) {
    let { $from: i, $to: s } = e.selection, r = i.blockRange(s, (c) => c.childCount > 0 && c.firstChild.type == n);
    if (!r)
      return !1;
    let o = r.startIndex;
    if (o == 0)
      return !1;
    let l = r.parent, a = l.child(o - 1);
    if (a.type != n)
      return !1;
    if (t) {
      let c = a.lastChild && a.lastChild.type == l.type, d = y.from(c ? n.create() : null), u = new S(y.from(n.create(null, y.from(l.type.create(null, d)))), c ? 3 : 1, 0), p = r.start, h = r.end;
      t(e.tr.step(new Y(p - (c ? 3 : 1), h, p, h, u, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function is(n) {
  const { state: e, transaction: t } = n;
  let { selection: i } = t, { doc: s } = t, { storedMarks: r } = t;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
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
      return i = t.selection, s = t.doc, r = t.storedMarks, t;
    }
  };
}
class ss {
  constructor(e) {
    this.editor = e.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = e.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands: e, editor: t, state: i } = this, { view: s } = t, { tr: r } = i, o = this.buildProps(r);
    return Object.fromEntries(Object.entries(e).map(([l, a]) => [l, (...d) => {
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
  createChain(e, t = !0) {
    const { rawCommands: i, editor: s, state: r } = this, { view: o } = s, l = [], a = !!e, c = e || r.tr, d = () => (!a && t && !c.getMeta("preventDispatch") && !this.hasCustomState && o.dispatch(c), l.every((p) => p === !0)), u = {
      ...Object.fromEntries(Object.entries(i).map(([p, h]) => [p, (...m) => {
        const g = this.buildProps(c, t), b = h(...m)(g);
        return l.push(b), u;
      }])),
      run: d
    };
    return u;
  }
  createCan(e) {
    const { rawCommands: t, state: i } = this, s = !1, r = e || i.tr, o = this.buildProps(r, s);
    return {
      ...Object.fromEntries(Object.entries(t).map(([a, c]) => [a, (...d) => c(...d)({ ...o, dispatch: void 0 })])),
      chain: () => this.createChain(r, s)
    };
  }
  buildProps(e, t = !0) {
    const { rawCommands: i, editor: s, state: r } = this, { view: o } = s, l = {
      tr: e,
      editor: s,
      view: o,
      state: is({
        state: r,
        transaction: e
      }),
      dispatch: t ? () => {
      } : void 0,
      chain: () => this.createChain(e, t),
      can: () => this.createCan(e),
      get commands() {
        return Object.fromEntries(Object.entries(i).map(([a, c]) => [a, (...d) => c(...d)(l)]));
      }
    };
    return l;
  }
}
class hh {
  constructor() {
    this.callbacks = {};
  }
  on(e, t) {
    return this.callbacks[e] || (this.callbacks[e] = []), this.callbacks[e].push(t), this;
  }
  emit(e, ...t) {
    const i = this.callbacks[e];
    return i && i.forEach((s) => s.apply(this, t)), this;
  }
  off(e, t) {
    const i = this.callbacks[e];
    return i && (t ? this.callbacks[e] = i.filter((s) => s !== t) : delete this.callbacks[e]), this;
  }
  once(e, t) {
    const i = (...s) => {
      this.off(e, i), t.apply(this, s);
    };
    return this.on(e, i);
  }
  removeAllListeners() {
    this.callbacks = {};
  }
}
function E(n, e, t) {
  return n.config[e] === void 0 && n.parent ? E(n.parent, e, t) : typeof n.config[e] == "function" ? n.config[e].bind({
    ...t,
    parent: n.parent ? E(n.parent, e, t) : null
  }) : n.config[e];
}
function rs(n) {
  const e = n.filter((s) => s.type === "extension"), t = n.filter((s) => s.type === "node"), i = n.filter((s) => s.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: i
  };
}
function Mc(n) {
  const e = [], { nodeExtensions: t, markExtensions: i } = rs(n), s = [...t, ...i], r = {
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
          e.push({
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
      typeof (p == null ? void 0 : p.default) == "function" && (p.default = p.default()), p != null && p.isRequired && (p == null ? void 0 : p.default) === void 0 && delete p.default, e.push({
        type: o.name,
        name: d,
        attribute: p
      });
    });
  }), e;
}
function Q(n, e) {
  if (typeof n == "string") {
    if (!e.nodes[n])
      throw Error(`There is no node type named '${n}'. Maybe you forgot to add the extension?`);
    return e.nodes[n];
  }
  return n;
}
function D(...n) {
  return n.filter((e) => !!e).reduce((e, t) => {
    const i = { ...e };
    return Object.entries(t).forEach(([s, r]) => {
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
function ar(n, e) {
  return e.filter((t) => t.type === n.type.name).filter((t) => t.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(n.attrs) || {} : {
    [t.name]: n.attrs[t.name]
  }).reduce((t, i) => D(t, i), {});
}
function Ec(n) {
  return typeof n == "function";
}
function R(n, e = void 0, ...t) {
  return Ec(n) ? e ? n.bind(e)(...t) : n(...t) : n;
}
function fh(n = {}) {
  return Object.keys(n).length === 0 && n.constructor === Object;
}
function mh(n) {
  return typeof n != "string" ? n : n.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(n) : n === "true" ? !0 : n === "false" ? !1 : n;
}
function hl(n, e) {
  return "style" in n ? n : {
    ...n,
    getAttrs: (t) => {
      const i = n.getAttrs ? n.getAttrs(t) : n.attrs;
      if (i === !1)
        return !1;
      const s = e.reduce((r, o) => {
        const l = o.attribute.parseHTML ? o.attribute.parseHTML(t) : mh(t.getAttribute(o.name));
        return l == null ? r : {
          ...r,
          [o.name]: l
        };
      }, {});
      return { ...i, ...s };
    }
  };
}
function fl(n) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(n).filter(([e, t]) => e === "attrs" && fh(t) ? !1 : t != null)
  );
}
function gh(n, e) {
  var t;
  const i = Mc(n), { nodeExtensions: s, markExtensions: r } = rs(n), o = (t = s.find((c) => E(c, "topNode"))) === null || t === void 0 ? void 0 : t.name, l = Object.fromEntries(s.map((c) => {
    const d = i.filter((b) => b.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: e
    }, p = n.reduce((b, v) => {
      const k = E(v, "extendNodeSchema", u);
      return {
        ...b,
        ...k ? k(c) : {}
      };
    }, {}), h = fl({
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
        var v;
        return [b.name, { default: (v = b == null ? void 0 : b.attribute) === null || v === void 0 ? void 0 : v.default }];
      }))
    }), f = R(E(c, "parseHTML", u));
    f && (h.parseDOM = f.map((b) => hl(b, d)));
    const m = E(c, "renderHTML", u);
    m && (h.toDOM = (b) => m({
      node: b,
      HTMLAttributes: ar(b, d)
    }));
    const g = E(c, "renderText", u);
    return g && (h.toText = g), [c.name, h];
  })), a = Object.fromEntries(r.map((c) => {
    const d = i.filter((g) => g.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: e
    }, p = n.reduce((g, b) => {
      const v = E(b, "extendMarkSchema", u);
      return {
        ...g,
        ...v ? v(c) : {}
      };
    }, {}), h = fl({
      ...p,
      inclusive: R(E(c, "inclusive", u)),
      excludes: R(E(c, "excludes", u)),
      group: R(E(c, "group", u)),
      spanning: R(E(c, "spanning", u)),
      code: R(E(c, "code", u)),
      attrs: Object.fromEntries(d.map((g) => {
        var b;
        return [g.name, { default: (b = g == null ? void 0 : g.attribute) === null || b === void 0 ? void 0 : b.default }];
      }))
    }), f = R(E(c, "parseHTML", u));
    f && (h.parseDOM = f.map((g) => hl(g, d)));
    const m = E(c, "renderHTML", u);
    return m && (h.toDOM = (g) => m({
      mark: g,
      HTMLAttributes: ar(g, d)
    })), [c.name, h];
  }));
  return new ha({
    topNode: o,
    nodes: l,
    marks: a
  });
}
function Ns(n, e) {
  return e.nodes[n] || e.marks[n] || null;
}
function ml(n, e) {
  return Array.isArray(e) ? e.some((t) => (typeof t == "string" ? t : t.name) === n.name) : e;
}
function Yr(n, e) {
  const t = It.fromSchema(e).serializeFragment(n), s = document.implementation.createHTMLDocument().createElement("div");
  return s.appendChild(t), s.innerHTML;
}
const bh = (n, e = 500) => {
  let t = "";
  const i = n.parentOffset;
  return n.parent.nodesBetween(Math.max(0, i - e), i, (s, r, o, l) => {
    var a, c;
    const d = ((c = (a = s.type.spec).toText) === null || c === void 0 ? void 0 : c.call(a, {
      node: s,
      pos: r,
      parent: o,
      index: l
    })) || s.textContent || "%leaf%";
    t += s.isAtom && !s.isText ? d : d.slice(0, Math.max(0, i - r));
  }), t;
};
function Xr(n) {
  return Object.prototype.toString.call(n) === "[object RegExp]";
}
class ls {
  constructor(e) {
    this.find = e.find, this.handler = e.handler;
  }
}
const yh = (n, e) => {
  if (Xr(e))
    return e.exec(n);
  const t = e(n);
  if (!t)
    return null;
  const i = [t.text];
  return i.index = t.index, i.input = n, i.data = t.data, t.replaceWith && (t.text.includes(t.replaceWith) || console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".'), i.push(t.replaceWith)), i;
};
function $n(n) {
  var e;
  const { editor: t, from: i, to: s, text: r, rules: o, plugin: l } = n, { view: a } = t;
  if (a.composing)
    return !1;
  const c = a.state.doc.resolve(i);
  if (
    // check for code node
    c.parent.type.spec.code || !((e = c.nodeBefore || c.nodeAfter) === null || e === void 0) && e.marks.find((p) => p.type.spec.code)
  )
    return !1;
  let d = !1;
  const u = bh(c) + r;
  return o.forEach((p) => {
    if (d)
      return;
    const h = yh(u, p.find);
    if (!h)
      return;
    const f = a.state.tr, m = is({
      state: a.state,
      transaction: f
    }), g = {
      from: i - (h[0].length - r.length),
      to: s
    }, { commands: b, chain: v, can: k } = new ss({
      editor: t,
      state: m
    });
    p.handler({
      state: m,
      range: g,
      match: h,
      commands: b,
      chain: v,
      can: k
    }) === null || !f.steps.length || (f.setMeta(l, {
      transform: f,
      from: i,
      to: s,
      text: r
    }), a.dispatch(f), d = !0);
  }), d;
}
function vh(n) {
  const { editor: e, rules: t } = n, i = new W({
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
          typeof d == "string" ? d = d : d = Yr(y.from(d), o.schema);
          const { from: u } = a, p = u + d.length;
          $n({
            editor: e,
            from: u,
            to: p,
            text: d,
            rules: t,
            plugin: i
          });
        }), s.selectionSet || s.docChanged ? null : r;
      }
    },
    props: {
      handleTextInput(s, r, o, l) {
        return $n({
          editor: e,
          from: r,
          to: o,
          text: l,
          rules: t,
          plugin: i
        });
      },
      handleDOMEvents: {
        compositionend: (s) => (setTimeout(() => {
          const { $cursor: r } = s.state.selection;
          r && $n({
            editor: e,
            from: r.pos,
            to: r.pos,
            text: "",
            rules: t,
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
        return o ? $n({
          editor: e,
          from: o.pos,
          to: o.pos,
          text: `
`,
          rules: t,
          plugin: i
        }) : !1;
      }
    },
    // @ts-ignore
    isInputRules: !0
  });
  return i;
}
function kh(n) {
  return Object.prototype.toString.call(n).slice(8, -1);
}
function Fn(n) {
  return kh(n) !== "Object" ? !1 : n.constructor === Object && Object.getPrototypeOf(n) === Object.prototype;
}
function as(n, e) {
  const t = { ...n };
  return Fn(n) && Fn(e) && Object.keys(e).forEach((i) => {
    Fn(e[i]) && Fn(n[i]) ? t[i] = as(n[i], e[i]) : t[i] = e[i];
  }), t;
}
class fe {
  constructor(e = {}) {
    this.type = "mark", this.name = "mark", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = R(E(this, "addOptions", {
      name: this.name
    }))), this.storage = R(E(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new fe(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => as(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new fe(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = R(E(t, "addOptions", {
      name: t.name
    })), t.storage = R(E(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
  static handleExit({ editor: e, mark: t }) {
    const { tr: i } = e.state, s = e.state.selection.$from;
    if (s.pos === s.end()) {
      const o = s.marks();
      if (!!!o.find((c) => (c == null ? void 0 : c.type.name) === t.name))
        return !1;
      const a = o.find((c) => (c == null ? void 0 : c.type.name) === t.name);
      return a && i.removeStoredMark(a), i.insertText(" ", s.pos), e.view.dispatch(i), !0;
    }
    return !1;
  }
}
function wh(n) {
  return typeof n == "number";
}
class xh {
  constructor(e) {
    this.find = e.find, this.handler = e.handler;
  }
}
const Sh = (n, e, t) => {
  if (Xr(e))
    return [...n.matchAll(e)];
  const i = e(n, t);
  return i ? i.map((s) => {
    const r = [s.text];
    return r.index = s.index, r.input = n, r.data = s.data, s.replaceWith && (s.text.includes(s.replaceWith) || console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".'), r.push(s.replaceWith)), r;
  }) : [];
};
function Ch(n) {
  const { editor: e, state: t, from: i, to: s, rule: r, pasteEvent: o, dropEvent: l } = n, { commands: a, chain: c, can: d } = new ss({
    editor: e,
    state: t
  }), u = [];
  return t.doc.nodesBetween(i, s, (h, f) => {
    if (!h.isTextblock || h.type.spec.code)
      return;
    const m = Math.max(i, f), g = Math.min(s, f + h.content.size), b = h.textBetween(m - f, g - f, void 0, "￼");
    Sh(b, r.find, o).forEach((k) => {
      if (k.index === void 0)
        return;
      const M = m + k.index + 1, x = M + k[0].length, N = {
        from: t.tr.mapping.map(M),
        to: t.tr.mapping.map(x)
      }, C = r.handler({
        state: t,
        range: N,
        match: k,
        commands: a,
        chain: c,
        can: d,
        pasteEvent: o,
        dropEvent: l
      });
      u.push(C);
    });
  }), u.every((h) => h !== null);
}
let qn = null;
const Mh = (n) => {
  var e;
  const t = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  return (e = t.clipboardData) === null || e === void 0 || e.setData("text/html", n), t;
};
function Eh(n) {
  const { editor: e, rules: t } = n;
  let i = null, s = !1, r = !1, o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, l;
  try {
    l = typeof DragEvent < "u" ? new DragEvent("drop") : null;
  } catch {
    l = null;
  }
  const a = ({ state: d, from: u, to: p, rule: h, pasteEvt: f }) => {
    const m = d.tr, g = is({
      state: d,
      transaction: m
    });
    if (!(!Ch({
      editor: e,
      state: g,
      from: Math.max(u - 1, 0),
      to: p.b - 1,
      rule: h,
      pasteEvent: f,
      dropEvent: l
    }) || !m.steps.length)) {
      try {
        l = typeof DragEvent < "u" ? new DragEvent("drop") : null;
      } catch {
        l = null;
      }
      return o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, m;
    }
  };
  return t.map((d) => new W({
    // we register a global drag handler to track the current drag source element
    view(u) {
      const p = (f) => {
        var m;
        i = !((m = u.dom.parentElement) === null || m === void 0) && m.contains(f.target) ? u.dom.parentElement : null, i && (qn = e);
      }, h = () => {
        qn && (qn = null);
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
            const h = qn;
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
      const f = u[0], m = f.getMeta("uiEvent") === "paste" && !s, g = f.getMeta("uiEvent") === "drop" && !r, b = f.getMeta("applyPasteRules"), v = !!b;
      if (!m && !g && !v)
        return;
      if (v) {
        let { text: x } = b;
        typeof x == "string" ? x = x : x = Yr(y.from(x), h.schema);
        const { from: N } = b, C = N + x.length, T = Mh(x);
        return a({
          rule: d,
          state: h,
          from: N,
          to: { b: C },
          pasteEvt: T
        });
      }
      const k = p.doc.content.findDiffStart(h.doc.content), M = p.doc.content.findDiffEnd(h.doc.content);
      if (!(!wh(k) || !M || k === M.b))
        return a({
          rule: d,
          state: h,
          from: k,
          to: M,
          pasteEvt: o
        });
    }
  }));
}
function Th(n) {
  const e = n.filter((t, i) => n.indexOf(t) !== i);
  return Array.from(new Set(e));
}
class Vt {
  constructor(e, t) {
    this.splittableMarks = [], this.editor = t, this.extensions = Vt.resolve(e), this.schema = gh(this.extensions, t), this.setupExtensions();
  }
  /**
   * Returns a flattened and sorted extension list while
   * also checking for duplicated extensions and warns the user.
   * @param extensions An array of Tiptap extensions
   * @returns An flattened and sorted array of Tiptap extensions
   */
  static resolve(e) {
    const t = Vt.sort(Vt.flatten(e)), i = Th(t.map((s) => s.name));
    return i.length && console.warn(`[tiptap warn]: Duplicate extension names found: [${i.map((s) => `'${s}'`).join(", ")}]. This can lead to issues.`), t;
  }
  /**
   * Create a flattened array of extensions by traversing the `addExtensions` field.
   * @param extensions An array of Tiptap extensions
   * @returns A flattened array of Tiptap extensions
   */
  static flatten(e) {
    return e.map((t) => {
      const i = {
        name: t.name,
        options: t.options,
        storage: t.storage
      }, s = E(t, "addExtensions", i);
      return s ? [t, ...this.flatten(s())] : t;
    }).flat(10);
  }
  /**
   * Sort extensions by priority.
   * @param extensions An array of Tiptap extensions
   * @returns A sorted array of Tiptap extensions by priority
   */
  static sort(e) {
    return e.sort((i, s) => {
      const r = E(i, "priority") || 100, o = E(s, "priority") || 100;
      return r > o ? -1 : r < o ? 1 : 0;
    });
  }
  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
  get commands() {
    return this.extensions.reduce((e, t) => {
      const i = {
        name: t.name,
        options: t.options,
        storage: t.storage,
        editor: this.editor,
        type: Ns(t.name, this.schema)
      }, s = E(t, "addCommands", i);
      return s ? {
        ...e,
        ...s()
      } : e;
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor: e } = this, t = Vt.sort([...this.extensions].reverse()), i = [], s = [], r = t.map((o) => {
      const l = {
        name: o.name,
        options: o.options,
        storage: o.storage,
        editor: e,
        type: Ns(o.name, this.schema)
      }, a = [], c = E(o, "addKeyboardShortcuts", l);
      let d = {};
      if (o.type === "mark" && E(o, "exitable", l) && (d.ArrowRight = () => fe.handleExit({ editor: e, mark: o })), c) {
        const m = Object.fromEntries(Object.entries(c()).map(([g, b]) => [g, () => b({ editor: e })]));
        d = { ...d, ...m };
      }
      const u = jp(d);
      a.push(u);
      const p = E(o, "addInputRules", l);
      ml(o, e.options.enableInputRules) && p && i.push(...p());
      const h = E(o, "addPasteRules", l);
      ml(o, e.options.enablePasteRules) && h && s.push(...h());
      const f = E(o, "addProseMirrorPlugins", l);
      if (f) {
        const m = f();
        a.push(...m);
      }
      return a;
    }).flat();
    return [
      vh({
        editor: e,
        rules: i
      }),
      ...Eh({
        editor: e,
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
    return Mc(this.extensions);
  }
  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews() {
    const { editor: e } = this, { nodeExtensions: t } = rs(this.extensions);
    return Object.fromEntries(t.filter((i) => !!E(i, "addNodeView")).map((i) => {
      const s = this.attributes.filter((a) => a.type === i.name), r = {
        name: i.name,
        options: i.options,
        storage: i.storage,
        editor: e,
        type: Q(i.name, this.schema)
      }, o = E(i, "addNodeView", r);
      if (!o)
        return [];
      const l = (a, c, d, u, p) => {
        const h = ar(a, s);
        return o()({
          // pass-through
          node: a,
          view: c,
          getPos: d,
          decorations: u,
          innerDecorations: p,
          // tiptap-specific
          editor: e,
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
    this.extensions.forEach((e) => {
      var t;
      this.editor.extensionStorage[e.name] = e.storage;
      const i = {
        name: e.name,
        options: e.options,
        storage: e.storage,
        editor: this.editor,
        type: Ns(e.name, this.schema)
      };
      e.type === "mark" && (!((t = R(E(e, "keepOnSplit", i))) !== null && t !== void 0) || t) && this.splittableMarks.push(e.name);
      const s = E(e, "onBeforeCreate", i), r = E(e, "onCreate", i), o = E(e, "onUpdate", i), l = E(e, "onSelectionUpdate", i), a = E(e, "onTransaction", i), c = E(e, "onFocus", i), d = E(e, "onBlur", i), u = E(e, "onDestroy", i);
      s && this.editor.on("beforeCreate", s), r && this.editor.on("create", r), o && this.editor.on("update", o), l && this.editor.on("selectionUpdate", l), a && this.editor.on("transaction", a), c && this.editor.on("focus", c), d && this.editor.on("blur", d), u && this.editor.on("destroy", u);
    });
  }
}
class K {
  constructor(e = {}) {
    this.type = "extension", this.name = "extension", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = R(E(this, "addOptions", {
      name: this.name
    }))), this.storage = R(E(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new K(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => as(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new K({ ...this.config, ...e });
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = R(E(t, "addOptions", {
      name: t.name
    })), t.storage = R(E(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function Tc(n, e, t) {
  const { from: i, to: s } = e, { blockSeparator: r = `

`, textSerializers: o = {} } = t || {};
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
        range: e
      })), !1;
    a.isText && (l += (p = a == null ? void 0 : a.text) === null || p === void 0 ? void 0 : p.slice(Math.max(i, c) - c, s - c));
  }), l;
}
function Ac(n) {
  return Object.fromEntries(Object.entries(n.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
const Ah = K.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new W({
        key: new J("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: n } = this, { state: e, schema: t } = n, { doc: i, selection: s } = e, { ranges: r } = s, o = Math.min(...r.map((d) => d.$from.pos)), l = Math.max(...r.map((d) => d.$to.pos)), a = Ac(t);
            return Tc(i, { from: o, to: l }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: a
            });
          }
        }
      })
    ];
  }
}), _h = () => ({ editor: n, view: e }) => (requestAnimationFrame(() => {
  var t;
  n.isDestroyed || (e.dom.blur(), (t = window == null ? void 0 : window.getSelection()) === null || t === void 0 || t.removeAllRanges());
}), !0), Lh = (n = !1) => ({ commands: e }) => e.setContent("", n), Nh = () => ({ state: n, tr: e, dispatch: t }) => {
  const { selection: i } = e, { ranges: s } = i;
  return t && s.forEach(({ $from: r, $to: o }) => {
    n.doc.nodesBetween(r.pos, o.pos, (l, a) => {
      if (l.type.isText)
        return;
      const { doc: c, mapping: d } = e, u = c.resolve(d.map(a)), p = c.resolve(d.map(a + l.nodeSize)), h = u.blockRange(p);
      if (!h)
        return;
      const f = Yt(h);
      if (l.type.isTextblock) {
        const { defaultType: m } = u.parent.contentMatchAt(u.index());
        e.setNodeMarkup(h.start, m);
      }
      (f || f === 0) && e.lift(h, f);
    });
  }), !0;
}, Oh = (n) => (e) => n(e), Rh = () => ({ state: n, dispatch: e }) => wc(n, e), Ih = (n, e) => ({ editor: t, tr: i }) => {
  const { state: s } = t, r = s.doc.slice(n.from, n.to);
  i.deleteRange(n.from, n.to);
  const o = i.mapping.map(e);
  return i.insert(o, r.content), i.setSelection(new _(i.doc.resolve(Math.max(o - 1, 0)))), !0;
}, Dh = () => ({ tr: n, dispatch: e }) => {
  const { selection: t } = n, i = t.$anchor.node();
  if (i.content.size > 0)
    return !1;
  const s = n.selection.$anchor;
  for (let r = s.depth; r > 0; r -= 1)
    if (s.node(r).type === i.type) {
      if (e) {
        const l = s.before(r), a = s.after(r);
        n.delete(l, a).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, Ph = (n) => ({ tr: e, state: t, dispatch: i }) => {
  const s = Q(n, t.schema), r = e.selection.$anchor;
  for (let o = r.depth; o > 0; o -= 1)
    if (r.node(o).type === s) {
      if (i) {
        const a = r.before(o), c = r.after(o);
        e.delete(a, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, Bh = (n) => ({ tr: e, dispatch: t }) => {
  const { from: i, to: s } = n;
  return t && e.delete(i, s), !0;
}, Hh = () => ({ state: n, dispatch: e }) => Wr(n, e), zh = () => ({ commands: n }) => n.keyboardShortcut("Enter"), $h = () => ({ state: n, dispatch: e }) => Qp(n, e);
function yi(n, e, t = { strict: !0 }) {
  const i = Object.keys(e);
  return i.length ? i.every((s) => t.strict ? e[s] === n[s] : Xr(e[s]) ? e[s].test(n[s]) : e[s] === n[s]) : !0;
}
function _c(n, e, t = {}) {
  return n.find((i) => i.type === e && yi(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(t).map((s) => [s, i.attrs[s]])),
    t
  ));
}
function gl(n, e, t = {}) {
  return !!_c(n, e, t);
}
function Qr(n, e, t) {
  var i;
  if (!n || !e)
    return;
  let s = n.parent.childAfter(n.parentOffset);
  if ((!s.node || !s.node.marks.some((d) => d.type === e)) && (s = n.parent.childBefore(n.parentOffset)), !s.node || !s.node.marks.some((d) => d.type === e) || (t = t || ((i = s.node.marks[0]) === null || i === void 0 ? void 0 : i.attrs), !_c([...s.node.marks], e, t)))
    return;
  let o = s.index, l = n.start() + s.offset, a = o + 1, c = l + s.node.nodeSize;
  for (; o > 0 && gl([...n.parent.child(o - 1).marks], e, t); )
    o -= 1, l -= n.parent.child(o).nodeSize;
  for (; a < n.parent.childCount && gl([...n.parent.child(a).marks], e, t); )
    c += n.parent.child(a).nodeSize, a += 1;
  return {
    from: l,
    to: c
  };
}
function ht(n, e) {
  if (typeof n == "string") {
    if (!e.marks[n])
      throw Error(`There is no mark type named '${n}'. Maybe you forgot to add the extension?`);
    return e.marks[n];
  }
  return n;
}
const Fh = (n, e = {}) => ({ tr: t, state: i, dispatch: s }) => {
  const r = ht(n, i.schema), { doc: o, selection: l } = t, { $from: a, from: c, to: d } = l;
  if (s) {
    const u = Qr(a, r, e);
    if (u && u.from <= c && u.to >= d) {
      const p = _.create(o, u.from, u.to);
      t.setSelection(p);
    }
  }
  return !0;
}, qh = (n) => (e) => {
  const t = typeof n == "function" ? n(e) : n;
  for (let i = 0; i < t.length; i += 1)
    if (t[i](e))
      return !0;
  return !1;
};
function Lc(n) {
  return n instanceof _;
}
function kt(n = 0, e = 0, t = 0) {
  return Math.min(Math.max(n, e), t);
}
function Nc(n, e = null) {
  if (!e)
    return null;
  const t = L.atStart(n), i = L.atEnd(n);
  if (e === "start" || e === !0)
    return t;
  if (e === "end")
    return i;
  const s = t.from, r = i.to;
  return e === "all" ? _.create(n, kt(0, s, r), kt(n.content.size, s, r)) : _.create(n, kt(e, s, r), kt(e, s, r));
}
function bl() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function vi() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function Vh() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const Uh = (n = null, e = {}) => ({ editor: t, view: i, tr: s, dispatch: r }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const o = () => {
    (vi() || bl()) && i.dom.focus(), requestAnimationFrame(() => {
      t.isDestroyed || (i.focus(), Vh() && !vi() && !bl() && i.dom.focus({ preventScroll: !0 }));
    });
  };
  if (i.hasFocus() && n === null || n === !1)
    return !0;
  if (r && n === null && !Lc(t.state.selection))
    return o(), !0;
  const l = Nc(s.doc, n) || t.state.selection, a = t.state.selection.eq(l);
  return r && (a || s.setSelection(l), a && s.storedMarks && s.setStoredMarks(s.storedMarks), o()), !0;
}, Wh = (n, e) => (t) => n.every((i, s) => e(i, { ...t, index: s })), jh = (n, e) => ({ tr: t, commands: i }) => i.insertContentAt({ from: t.selection.from, to: t.selection.to }, n, e), Oc = (n) => {
  const e = n.childNodes;
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const i = e[t];
    i.nodeType === 3 && i.nodeValue && /^(\n\s\s|\n)$/.test(i.nodeValue) ? n.removeChild(i) : i.nodeType === 1 && Oc(i);
  }
  return n;
};
function Vn(n) {
  const e = `<body>${n}</body>`, t = new window.DOMParser().parseFromString(e, "text/html").body;
  return Oc(t);
}
function En(n, e, t) {
  if (n instanceof st || n instanceof y)
    return n;
  t = {
    slice: !0,
    parseOptions: {},
    ...t
  };
  const i = typeof n == "object" && n !== null, s = typeof n == "string";
  if (i)
    try {
      if (Array.isArray(n) && n.length > 0)
        return y.fromArray(n.map((l) => e.nodeFromJSON(l)));
      const o = e.nodeFromJSON(n);
      return t.errorOnInvalidContent && o.check(), o;
    } catch (r) {
      if (t.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: r });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", n, "Error:", r), En("", e, t);
    }
  if (s) {
    if (t.errorOnInvalidContent) {
      let o = !1, l = "";
      const a = new ha({
        topNode: e.spec.topNode,
        marks: e.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: e.spec.nodes.append({
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
      if (t.slice ? rt.fromSchema(a).parseSlice(Vn(n), t.parseOptions) : rt.fromSchema(a).parse(Vn(n), t.parseOptions), t.errorOnInvalidContent && o)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${l}`) });
    }
    const r = rt.fromSchema(e);
    return t.slice ? r.parseSlice(Vn(n), t.parseOptions).content : r.parse(Vn(n), t.parseOptions);
  }
  return En("", e, t);
}
function Kh(n, e, t) {
  const i = n.steps.length - 1;
  if (i < e)
    return;
  const s = n.steps[i];
  if (!(s instanceof G || s instanceof Y))
    return;
  const r = n.mapping.maps[i];
  let o = 0;
  r.forEach((l, a, c, d) => {
    o === 0 && (o = d);
  }), n.setSelection(L.near(n.doc.resolve(o), t));
}
const Jh = (n) => !("type" in n), Gh = (n, e, t) => ({ tr: i, dispatch: s, editor: r }) => {
  var o;
  if (s) {
    t = {
      parseOptions: r.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...t
    };
    let l;
    const a = (g) => {
      r.emit("contentError", {
        editor: r,
        error: g,
        disableCollaboration: () => {
          r.storage.collaboration && (r.storage.collaboration.isDisabled = !0);
        }
      });
    }, c = {
      preserveWhitespace: "full",
      ...t.parseOptions
    };
    if (!t.errorOnInvalidContent && !r.options.enableContentCheck && r.options.emitContentError)
      try {
        En(e, r.schema, {
          parseOptions: c,
          errorOnInvalidContent: !0
        });
      } catch (g) {
        a(g);
      }
    try {
      l = En(e, r.schema, {
        parseOptions: c,
        errorOnInvalidContent: (o = t.errorOnInvalidContent) !== null && o !== void 0 ? o : r.options.enableContentCheck
      });
    } catch (g) {
      return a(g), !1;
    }
    let { from: d, to: u } = typeof n == "number" ? { from: n, to: n } : { from: n.from, to: n.to }, p = !0, h = !0;
    if ((Jh(l) ? l : [l]).forEach((g) => {
      g.check(), p = p ? g.isText && g.marks.length === 0 : !1, h = h ? g.isBlock : !1;
    }), d === u && h) {
      const { parent: g } = i.doc.resolve(d);
      g.isTextblock && !g.type.spec.code && !g.childCount && (d -= 1, u += 1);
    }
    let m;
    if (p) {
      if (Array.isArray(e))
        m = e.map((g) => g.text || "").join("");
      else if (e instanceof y) {
        let g = "";
        e.forEach((b) => {
          b.text && (g += b.text);
        }), m = g;
      } else typeof e == "object" && e && e.text ? m = e.text : m = e;
      i.insertText(m, d, u);
    } else
      m = l, i.replaceWith(d, u, m);
    t.updateSelection && Kh(i, i.steps.length - 1, -1), t.applyInputRules && i.setMeta("applyInputRules", { from: d, text: m }), t.applyPasteRules && i.setMeta("applyPasteRules", { from: d, text: m });
  }
  return !0;
}, Yh = () => ({ state: n, dispatch: e }) => Gp(n, e), Xh = () => ({ state: n, dispatch: e }) => Yp(n, e), Qh = () => ({ state: n, dispatch: e }) => fc(n, e), Zh = () => ({ state: n, dispatch: e }) => yc(n, e), ef = () => ({ state: n, dispatch: e, tr: t }) => {
  try {
    const i = Xi(n.doc, n.selection.$from.pos, -1);
    return i == null ? !1 : (t.join(i, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, tf = () => ({ state: n, dispatch: e, tr: t }) => {
  try {
    const i = Xi(n.doc, n.selection.$from.pos, 1);
    return i == null ? !1 : (t.join(i, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, nf = () => ({ state: n, dispatch: e }) => Kp(n, e), sf = () => ({ state: n, dispatch: e }) => Jp(n, e);
function Rc() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function rf(n) {
  const e = n.split(/-(?!$)/);
  let t = e[e.length - 1];
  t === "Space" && (t = " ");
  let i, s, r, o;
  for (let l = 0; l < e.length - 1; l += 1) {
    const a = e[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      s = !0;
    else if (/^s(hift)?$/i.test(a))
      r = !0;
    else if (/^mod$/i.test(a))
      vi() || Rc() ? o = !0 : s = !0;
    else
      throw new Error(`Unrecognized modifier name: ${a}`);
  }
  return i && (t = `Alt-${t}`), s && (t = `Ctrl-${t}`), o && (t = `Meta-${t}`), r && (t = `Shift-${t}`), t;
}
const of = (n) => ({ editor: e, view: t, tr: i, dispatch: s }) => {
  const r = rf(n).split(/-(?!$)/), o = r.find((c) => !["Alt", "Ctrl", "Meta", "Shift"].includes(c)), l = new KeyboardEvent("keydown", {
    key: o === "Space" ? " " : o,
    altKey: r.includes("Alt"),
    ctrlKey: r.includes("Ctrl"),
    metaKey: r.includes("Meta"),
    shiftKey: r.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), a = e.captureTransaction(() => {
    t.someProp("handleKeyDown", (c) => c(t, l));
  });
  return a == null || a.steps.forEach((c) => {
    const d = c.map(i.mapping);
    d && s && i.maybeStep(d);
  }), !0;
};
function Tn(n, e, t = {}) {
  const { from: i, to: s, empty: r } = n.selection, o = e ? Q(e, n.schema) : null, l = [];
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
  const a = s - i, c = l.filter((u) => o ? o.name === u.node.type.name : !0).filter((u) => yi(u.node.attrs, t, { strict: !1 }));
  return r ? !!c.length : c.reduce((u, p) => u + p.to - p.from, 0) >= a;
}
const lf = (n, e = {}) => ({ state: t, dispatch: i }) => {
  const s = Q(n, t.schema);
  return Tn(t, s, e) ? Xp(t, i) : !1;
}, af = () => ({ state: n, dispatch: e }) => xc(n, e), cf = (n) => ({ state: e, dispatch: t }) => {
  const i = Q(n, e.schema);
  return ch(i)(e, t);
}, df = () => ({ state: n, dispatch: e }) => kc(n, e);
function cs(n, e) {
  return e.nodes[n] ? "node" : e.marks[n] ? "mark" : null;
}
function yl(n, e) {
  const t = typeof e == "string" ? [e] : e;
  return Object.keys(n).reduce((i, s) => (t.includes(s) || (i[s] = n[s]), i), {});
}
const uf = (n, e) => ({ tr: t, state: i, dispatch: s }) => {
  let r = null, o = null;
  const l = cs(typeof n == "string" ? n : n.name, i.schema);
  return l ? (l === "node" && (r = Q(n, i.schema)), l === "mark" && (o = ht(n, i.schema)), s && t.selection.ranges.forEach((a) => {
    i.doc.nodesBetween(a.$from.pos, a.$to.pos, (c, d) => {
      r && r === c.type && t.setNodeMarkup(d, void 0, yl(c.attrs, e)), o && c.marks.length && c.marks.forEach((u) => {
        o === u.type && t.addMark(d, d + c.nodeSize, o.create(yl(u.attrs, e)));
      });
    });
  }), !0) : !1;
}, pf = () => ({ tr: n, dispatch: e }) => (e && n.scrollIntoView(), !0), hf = () => ({ tr: n, dispatch: e }) => {
  if (e) {
    const t = new be(n.doc);
    n.setSelection(t);
  }
  return !0;
}, ff = () => ({ state: n, dispatch: e }) => gc(n, e), mf = () => ({ state: n, dispatch: e }) => vc(n, e), gf = () => ({ state: n, dispatch: e }) => th(n, e), bf = () => ({ state: n, dispatch: e }) => sh(n, e), yf = () => ({ state: n, dispatch: e }) => ih(n, e);
function cr(n, e, t = {}, i = {}) {
  return En(n, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: i.errorOnInvalidContent
  });
}
const vf = (n, e = !1, t = {}, i = {}) => ({ editor: s, tr: r, dispatch: o, commands: l }) => {
  var a, c;
  const { doc: d } = r;
  if (t.preserveWhitespace !== "full") {
    const u = cr(n, s.schema, t, {
      errorOnInvalidContent: (a = i.errorOnInvalidContent) !== null && a !== void 0 ? a : s.options.enableContentCheck
    });
    return o && r.replaceWith(0, d.content.size, u).setMeta("preventUpdate", !e), !0;
  }
  return o && r.setMeta("preventUpdate", !e), l.insertContentAt({ from: 0, to: d.content.size }, n, {
    parseOptions: t,
    errorOnInvalidContent: (c = i.errorOnInvalidContent) !== null && c !== void 0 ? c : s.options.enableContentCheck
  });
};
function Ic(n, e) {
  const t = ht(e, n.schema), { from: i, to: s, empty: r } = n.selection, o = [];
  r ? (n.storedMarks && o.push(...n.storedMarks), o.push(...n.selection.$head.marks())) : n.doc.nodesBetween(i, s, (a) => {
    o.push(...a.marks);
  });
  const l = o.find((a) => a.type.name === t.name);
  return l ? { ...l.attrs } : {};
}
function kf(n, e) {
  const t = new Rr(n);
  return e.forEach((i) => {
    i.steps.forEach((s) => {
      t.step(s);
    });
  }), t;
}
function wf(n) {
  for (let e = 0; e < n.edgeCount; e += 1) {
    const { type: t } = n.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
function xf(n, e, t) {
  const i = [];
  return n.nodesBetween(e.from, e.to, (s, r) => {
    t(s) && i.push({
      node: s,
      pos: r
    });
  }), i;
}
function Dc(n, e) {
  for (let t = n.depth; t > 0; t -= 1) {
    const i = n.node(t);
    if (e(i))
      return {
        pos: t > 0 ? n.before(t) : 0,
        start: n.start(t),
        depth: t,
        node: i
      };
  }
}
function Zr(n) {
  return (e) => Dc(e.$from, n);
}
function Sf(n, e) {
  const t = {
    from: 0,
    to: n.content.size
  };
  return Tc(n, t, e);
}
function Cf(n, e) {
  const t = Q(e, n.schema), { from: i, to: s } = n.selection, r = [];
  n.doc.nodesBetween(i, s, (l) => {
    r.push(l);
  });
  const o = r.reverse().find((l) => l.type.name === t.name);
  return o ? { ...o.attrs } : {};
}
function Pc(n, e) {
  const t = cs(typeof e == "string" ? e : e.name, n.schema);
  return t === "node" ? Cf(n, e) : t === "mark" ? Ic(n, e) : {};
}
function Mf(n, e = JSON.stringify) {
  const t = {};
  return n.filter((i) => {
    const s = e(i);
    return Object.prototype.hasOwnProperty.call(t, s) ? !1 : t[s] = !0;
  });
}
function Ef(n) {
  const e = Mf(n);
  return e.length === 1 ? e : e.filter((t, i) => !e.filter((r, o) => o !== i).some((r) => t.oldRange.from >= r.oldRange.from && t.oldRange.to <= r.oldRange.to && t.newRange.from >= r.newRange.from && t.newRange.to <= r.newRange.to));
}
function Tf(n) {
  const { mapping: e, steps: t } = n, i = [];
  return e.maps.forEach((s, r) => {
    const o = [];
    if (s.ranges.length)
      s.forEach((l, a) => {
        o.push({ from: l, to: a });
      });
    else {
      const { from: l, to: a } = t[r];
      if (l === void 0 || a === void 0)
        return;
      o.push({ from: l, to: a });
    }
    o.forEach(({ from: l, to: a }) => {
      const c = e.slice(r).map(l, -1), d = e.slice(r).map(a), u = e.invert().map(c, -1), p = e.invert().map(d);
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
  }), Ef(i);
}
function eo(n, e, t) {
  const i = [];
  return n === e ? t.resolve(n).marks().forEach((s) => {
    const r = t.resolve(n), o = Qr(r, s.type);
    o && i.push({
      mark: s,
      ...o
    });
  }) : t.nodesBetween(n, e, (s, r) => {
    !s || (s == null ? void 0 : s.nodeSize) === void 0 || i.push(...s.marks.map((o) => ({
      from: r,
      to: r + s.nodeSize,
      mark: o
    })));
  }), i;
}
function ti(n, e, t) {
  return Object.fromEntries(Object.entries(t).filter(([i]) => {
    const s = n.find((r) => r.type === e && r.name === i);
    return s ? s.attribute.keepOnSplit : !1;
  }));
}
function dr(n, e, t = {}) {
  const { empty: i, ranges: s } = n.selection, r = e ? ht(e, n.schema) : null;
  if (i)
    return !!(n.storedMarks || n.selection.$from.marks()).filter((u) => r ? r.name === u.type.name : !0).find((u) => yi(u.attrs, t, { strict: !1 }));
  let o = 0;
  const l = [];
  if (s.forEach(({ $from: u, $to: p }) => {
    const h = u.pos, f = p.pos;
    n.doc.nodesBetween(h, f, (m, g) => {
      if (!m.isText && !m.marks.length)
        return;
      const b = Math.max(h, g), v = Math.min(f, g + m.nodeSize), k = v - b;
      o += k, l.push(...m.marks.map((M) => ({
        mark: M,
        from: b,
        to: v
      })));
    });
  }), o === 0)
    return !1;
  const a = l.filter((u) => r ? r.name === u.mark.type.name : !0).filter((u) => yi(u.mark.attrs, t, { strict: !1 })).reduce((u, p) => u + p.to - p.from, 0), c = l.filter((u) => r ? u.mark.type !== r && u.mark.type.excludes(r) : !0).reduce((u, p) => u + p.to - p.from, 0);
  return (a > 0 ? a + c : a) >= o;
}
function Af(n, e, t = {}) {
  if (!e)
    return Tn(n, null, t) || dr(n, null, t);
  const i = cs(e, n.schema);
  return i === "node" ? Tn(n, e, t) : i === "mark" ? dr(n, e, t) : !1;
}
function vl(n, e) {
  const { nodeExtensions: t } = rs(e), i = t.find((o) => o.name === n);
  if (!i)
    return !1;
  const s = {
    name: i.name,
    options: i.options,
    storage: i.storage
  }, r = R(E(i, "group", s));
  return typeof r != "string" ? !1 : r.split(" ").includes("list");
}
function ds(n, { checkChildren: e = !0, ignoreWhitespace: t = !1 } = {}) {
  var i;
  if (t) {
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
  if (e) {
    let s = !0;
    return n.content.forEach((r) => {
      s !== !1 && (ds(r, { ignoreWhitespace: t, checkChildren: e }) || (s = !1));
    }), s;
  }
  return !1;
}
function _f(n) {
  return n instanceof A;
}
function Lf(n, e, t) {
  var i;
  const { selection: s } = e;
  let r = null;
  if (Lc(s) && (r = s.$cursor), r) {
    const l = (i = n.storedMarks) !== null && i !== void 0 ? i : r.marks();
    return !!t.isInSet(l) || !l.some((a) => a.type.excludes(t));
  }
  const { ranges: o } = s;
  return o.some(({ $from: l, $to: a }) => {
    let c = l.depth === 0 ? n.doc.inlineContent && n.doc.type.allowsMarkType(t) : !1;
    return n.doc.nodesBetween(l.pos, a.pos, (d, u, p) => {
      if (c)
        return !1;
      if (d.isInline) {
        const h = !p || p.type.allowsMarkType(t), f = !!t.isInSet(d.marks) || !d.marks.some((m) => m.type.excludes(t));
        c = h && f;
      }
      return !c;
    }), c;
  });
}
const Nf = (n, e = {}) => ({ tr: t, state: i, dispatch: s }) => {
  const { selection: r } = t, { empty: o, ranges: l } = r, a = ht(n, i.schema);
  if (s)
    if (o) {
      const c = Ic(i, a);
      t.addStoredMark(a.create({
        ...c,
        ...e
      }));
    } else
      l.forEach((c) => {
        const d = c.$from.pos, u = c.$to.pos;
        i.doc.nodesBetween(d, u, (p, h) => {
          const f = Math.max(h, d), m = Math.min(h + p.nodeSize, u);
          p.marks.find((b) => b.type === a) ? p.marks.forEach((b) => {
            a === b.type && t.addMark(f, m, a.create({
              ...b.attrs,
              ...e
            }));
          }) : t.addMark(f, m, a.create(e));
        });
      });
  return Lf(i, t, a);
}, Of = (n, e) => ({ tr: t }) => (t.setMeta(n, e), !0), Rf = (n, e = {}) => ({ state: t, dispatch: i, chain: s }) => {
  const r = Q(n, t.schema);
  let o;
  return t.selection.$anchor.sameParent(t.selection.$head) && (o = t.selection.$anchor.parent.attrs), r.isTextblock ? s().command(({ commands: l }) => pl(r, { ...o, ...e })(t) ? !0 : l.clearNodes()).command(({ state: l }) => pl(r, { ...o, ...e })(l, i)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, If = (n) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: i } = e, s = kt(n, 0, i.content.size), r = A.create(i, s);
    e.setSelection(r);
  }
  return !0;
}, Df = (n) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: i } = e, { from: s, to: r } = typeof n == "number" ? { from: n, to: n } : n, o = _.atStart(i).from, l = _.atEnd(i).to, a = kt(s, o, l), c = kt(r, o, l), d = _.create(i, a, c);
    e.setSelection(d);
  }
  return !0;
}, Pf = (n) => ({ state: e, dispatch: t }) => {
  const i = Q(n, e.schema);
  return ph(i)(e, t);
};
function kl(n, e) {
  const t = n.storedMarks || n.selection.$to.parentOffset && n.selection.$from.marks();
  if (t) {
    const i = t.filter((s) => e == null ? void 0 : e.includes(s.type.name));
    n.tr.ensureMarks(i);
  }
}
const Bf = ({ keepMarks: n = !0 } = {}) => ({ tr: e, state: t, dispatch: i, editor: s }) => {
  const { selection: r, doc: o } = e, { $from: l, $to: a } = r, c = s.extensionManager.attributes, d = ti(c, l.node().type.name, l.node().attrs);
  if (r instanceof A && r.node.isBlock)
    return !l.parentOffset || !We(o, l.pos) ? !1 : (i && (n && kl(t, s.extensionManager.splittableMarks), e.split(l.pos).scrollIntoView()), !0);
  if (!l.parent.isBlock)
    return !1;
  const u = a.parentOffset === a.parent.content.size, p = l.depth === 0 ? void 0 : wf(l.node(-1).contentMatchAt(l.indexAfter(-1)));
  let h = u && p ? [
    {
      type: p,
      attrs: d
    }
  ] : void 0, f = We(e.doc, e.mapping.map(l.pos), 1, h);
  if (!h && !f && We(e.doc, e.mapping.map(l.pos), 1, p ? [{ type: p }] : void 0) && (f = !0, h = p ? [
    {
      type: p,
      attrs: d
    }
  ] : void 0), i) {
    if (f && (r instanceof _ && e.deleteSelection(), e.split(e.mapping.map(l.pos), 1, h), p && !u && !l.parentOffset && l.parent.type !== p)) {
      const m = e.mapping.map(l.before()), g = e.doc.resolve(m);
      l.node(-1).canReplaceWith(g.index(), g.index() + 1, p) && e.setNodeMarkup(e.mapping.map(l.before()), p);
    }
    n && kl(t, s.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return f;
}, Hf = (n, e = {}) => ({ tr: t, state: i, dispatch: s, editor: r }) => {
  var o;
  const l = Q(n, i.schema), { $from: a, $to: c } = i.selection, d = i.selection.node;
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
      let b = y.empty;
      const v = a.index(-1) ? 1 : a.index(-2) ? 2 : 3;
      for (let T = a.depth - v; T >= a.depth - 3; T -= 1)
        b = y.from(a.node(T).copy(b));
      const k = a.indexAfter(-1) < a.node(-2).childCount ? 1 : a.indexAfter(-2) < a.node(-3).childCount ? 2 : 3, M = {
        ...ti(p, a.node().type.name, a.node().attrs),
        ...e
      }, x = ((o = l.contentMatch.defaultType) === null || o === void 0 ? void 0 : o.createAndFill(M)) || void 0;
      b = b.append(y.from(l.createAndFill(null, x) || void 0));
      const N = a.before(a.depth - (v - 1));
      t.replace(N, a.after(-k), new S(b, 4 - v, 0));
      let C = -1;
      t.doc.nodesBetween(N, t.doc.content.size, (T, I) => {
        if (C > -1)
          return !1;
        T.isTextblock && T.content.size === 0 && (C = I + 1);
      }), C > -1 && t.setSelection(_.near(t.doc.resolve(C))), t.scrollIntoView();
    }
    return !0;
  }
  const h = c.pos === a.end() ? u.contentMatchAt(0).defaultType : null, f = {
    ...ti(p, u.type.name, u.attrs),
    ...e
  }, m = {
    ...ti(p, a.node().type.name, a.node().attrs),
    ...e
  };
  t.delete(a.pos, c.pos);
  const g = h ? [
    { type: l, attrs: f },
    { type: h, attrs: m }
  ] : [{ type: l, attrs: f }];
  if (!We(t.doc, a.pos, 2))
    return !1;
  if (s) {
    const { selection: b, storedMarks: v } = i, { splittableMarks: k } = r.extensionManager, M = v || b.$to.parentOffset && b.$from.marks();
    if (t.split(a.pos, 2, g).scrollIntoView(), !M || !s)
      return !0;
    const x = M.filter((N) => k.includes(N.type.name));
    t.ensureMarks(x);
  }
  return !0;
}, Os = (n, e) => {
  const t = Zr((o) => o.type === e)(n.selection);
  if (!t)
    return !0;
  const i = n.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
  if (i === void 0)
    return !0;
  const s = n.doc.nodeAt(i);
  return t.node.type === (s == null ? void 0 : s.type) && ut(n.doc, t.pos) && n.join(t.pos), !0;
}, Rs = (n, e) => {
  const t = Zr((o) => o.type === e)(n.selection);
  if (!t)
    return !0;
  const i = n.doc.resolve(t.start).after(t.depth);
  if (i === void 0)
    return !0;
  const s = n.doc.nodeAt(i);
  return t.node.type === (s == null ? void 0 : s.type) && ut(n.doc, i) && n.join(i), !0;
}, zf = (n, e, t, i = {}) => ({ editor: s, tr: r, state: o, dispatch: l, chain: a, commands: c, can: d }) => {
  const { extensions: u, splittableMarks: p } = s.extensionManager, h = Q(n, o.schema), f = Q(e, o.schema), { selection: m, storedMarks: g } = o, { $from: b, $to: v } = m, k = b.blockRange(v), M = g || m.$to.parentOffset && m.$from.marks();
  if (!k)
    return !1;
  const x = Zr((N) => vl(N.type.name, u))(m);
  if (k.depth >= 1 && x && k.depth - x.depth <= 1) {
    if (x.node.type === h)
      return c.liftListItem(f);
    if (vl(x.node.type.name, u) && h.validContent(x.node.content) && l)
      return a().command(() => (r.setNodeMarkup(x.pos, h), !0)).command(() => Os(r, h)).command(() => Rs(r, h)).run();
  }
  return !t || !M || !l ? a().command(() => d().wrapInList(h, i) ? !0 : c.clearNodes()).wrapInList(h, i).command(() => Os(r, h)).command(() => Rs(r, h)).run() : a().command(() => {
    const N = d().wrapInList(h, i), C = M.filter((T) => p.includes(T.type.name));
    return r.ensureMarks(C), N ? !0 : c.clearNodes();
  }).wrapInList(h, i).command(() => Os(r, h)).command(() => Rs(r, h)).run();
}, $f = (n, e = {}, t = {}) => ({ state: i, commands: s }) => {
  const { extendEmptyMarkRange: r = !1 } = t, o = ht(n, i.schema);
  return dr(i, o, e) ? s.unsetMark(o, { extendEmptyMarkRange: r }) : s.setMark(o, e);
}, Ff = (n, e, t = {}) => ({ state: i, commands: s }) => {
  const r = Q(n, i.schema), o = Q(e, i.schema), l = Tn(i, r, t);
  let a;
  return i.selection.$anchor.sameParent(i.selection.$head) && (a = i.selection.$anchor.parent.attrs), l ? s.setNode(o, a) : s.setNode(r, { ...a, ...t });
}, qf = (n, e = {}) => ({ state: t, commands: i }) => {
  const s = Q(n, t.schema);
  return Tn(t, s, e) ? i.lift(s) : i.wrapIn(s, e);
}, Vf = () => ({ state: n, dispatch: e }) => {
  const t = n.plugins;
  for (let i = 0; i < t.length; i += 1) {
    const s = t[i];
    let r;
    if (s.spec.isInputRules && (r = s.getState(n))) {
      if (e) {
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
}, Uf = () => ({ tr: n, dispatch: e }) => {
  const { selection: t } = n, { empty: i, ranges: s } = t;
  return i || e && s.forEach((r) => {
    n.removeMark(r.$from.pos, r.$to.pos);
  }), !0;
}, Wf = (n, e = {}) => ({ tr: t, state: i, dispatch: s }) => {
  var r;
  const { extendEmptyMarkRange: o = !1 } = e, { selection: l } = t, a = ht(n, i.schema), { $from: c, empty: d, ranges: u } = l;
  if (!s)
    return !0;
  if (d && o) {
    let { from: p, to: h } = l;
    const f = (r = c.marks().find((g) => g.type === a)) === null || r === void 0 ? void 0 : r.attrs, m = Qr(c, a, f);
    m && (p = m.from, h = m.to), t.removeMark(p, h, a);
  } else
    u.forEach((p) => {
      t.removeMark(p.$from.pos, p.$to.pos, a);
    });
  return t.removeStoredMark(a), !0;
}, jf = (n, e = {}) => ({ tr: t, state: i, dispatch: s }) => {
  let r = null, o = null;
  const l = cs(typeof n == "string" ? n : n.name, i.schema);
  return l ? (l === "node" && (r = Q(n, i.schema)), l === "mark" && (o = ht(n, i.schema)), s && t.selection.ranges.forEach((a) => {
    const c = a.$from.pos, d = a.$to.pos;
    let u, p, h, f;
    t.selection.empty ? i.doc.nodesBetween(c, d, (m, g) => {
      r && r === m.type && (h = Math.max(g, c), f = Math.min(g + m.nodeSize, d), u = g, p = m);
    }) : i.doc.nodesBetween(c, d, (m, g) => {
      g < c && r && r === m.type && (h = Math.max(g, c), f = Math.min(g + m.nodeSize, d), u = g, p = m), g >= c && g <= d && (r && r === m.type && t.setNodeMarkup(g, void 0, {
        ...m.attrs,
        ...e
      }), o && m.marks.length && m.marks.forEach((b) => {
        if (o === b.type) {
          const v = Math.max(g, c), k = Math.min(g + m.nodeSize, d);
          t.addMark(v, k, o.create({
            ...b.attrs,
            ...e
          }));
        }
      }));
    }), p && (u !== void 0 && t.setNodeMarkup(u, void 0, {
      ...p.attrs,
      ...e
    }), o && p.marks.length && p.marks.forEach((m) => {
      o === m.type && t.addMark(h, f, o.create({
        ...m.attrs,
        ...e
      }));
    }));
  }), !0) : !1;
}, Kf = (n, e = {}) => ({ state: t, dispatch: i }) => {
  const s = Q(n, t.schema);
  return rh(s, e)(t, i);
}, Jf = (n, e = {}) => ({ state: t, dispatch: i }) => {
  const s = Q(n, t.schema);
  return oh(s, e)(t, i);
};
var Gf = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: _h,
  clearContent: Lh,
  clearNodes: Nh,
  command: Oh,
  createParagraphNear: Rh,
  cut: Ih,
  deleteCurrentNode: Dh,
  deleteNode: Ph,
  deleteRange: Bh,
  deleteSelection: Hh,
  enter: zh,
  exitCode: $h,
  extendMarkRange: Fh,
  first: qh,
  focus: Uh,
  forEach: Wh,
  insertContent: jh,
  insertContentAt: Gh,
  joinBackward: Qh,
  joinDown: Xh,
  joinForward: Zh,
  joinItemBackward: ef,
  joinItemForward: tf,
  joinTextblockBackward: nf,
  joinTextblockForward: sf,
  joinUp: Yh,
  keyboardShortcut: of,
  lift: lf,
  liftEmptyBlock: af,
  liftListItem: cf,
  newlineInCode: df,
  resetAttributes: uf,
  scrollIntoView: pf,
  selectAll: hf,
  selectNodeBackward: ff,
  selectNodeForward: mf,
  selectParentNode: gf,
  selectTextblockEnd: bf,
  selectTextblockStart: yf,
  setContent: vf,
  setMark: Nf,
  setMeta: Of,
  setNode: Rf,
  setNodeSelection: If,
  setTextSelection: Df,
  sinkListItem: Pf,
  splitBlock: Bf,
  splitListItem: Hf,
  toggleList: zf,
  toggleMark: $f,
  toggleNode: Ff,
  toggleWrap: qf,
  undoInputRule: Vf,
  unsetAllMarks: Uf,
  unsetMark: Wf,
  updateAttributes: jf,
  wrapIn: Kf,
  wrapInList: Jf
});
const Yf = K.create({
  name: "commands",
  addCommands() {
    return {
      ...Gf
    };
  }
}), Xf = K.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new W({
        key: new J("tiptapDrop"),
        props: {
          handleDrop: (n, e, t, i) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice: t,
              moved: i
            });
          }
        }
      })
    ];
  }
}), Qf = K.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new W({
        key: new J("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
}), Zf = new J("focusEvents"), em = K.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: n } = this;
    return [
      new W({
        key: Zf,
        props: {
          handleDOMEvents: {
            focus: (e, t) => {
              n.isFocused = !0;
              const i = n.state.tr.setMeta("focus", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(i), !1;
            },
            blur: (e, t) => {
              n.isFocused = !1;
              const i = n.state.tr.setMeta("blur", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(i), !1;
            }
          }
        }
      })
    ];
  }
}), tm = K.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const n = () => this.editor.commands.first(({ commands: o }) => [
      () => o.undoInputRule(),
      // maybe convert first text block node to default node
      () => o.command(({ tr: l }) => {
        const { selection: a, doc: c } = l, { empty: d, $anchor: u } = a, { pos: p, parent: h } = u, f = u.parent.isTextblock && p > 0 ? l.doc.resolve(p - 1) : u, m = f.parent.type.spec.isolating, g = u.pos - u.parentOffset, b = m && f.parent.childCount === 1 ? g === u.pos : L.atStart(c).from === p;
        return !d || !h.type.isTextblock || h.textContent.length || !b || b && u.parent.type.name === "paragraph" ? !1 : o.clearNodes();
      }),
      () => o.deleteSelection(),
      () => o.joinBackward(),
      () => o.selectNodeBackward()
    ]), e = () => this.editor.commands.first(({ commands: o }) => [
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
      Delete: e,
      "Mod-Delete": e,
      "Mod-a": () => this.editor.commands.selectAll()
    }, s = {
      ...i
    }, r = {
      ...i,
      "Ctrl-h": n,
      "Alt-Backspace": n,
      "Ctrl-d": e,
      "Ctrl-Alt-Backspace": e,
      "Alt-Delete": e,
      "Alt-d": e,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return vi() || Rc() ? r : s;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new W({
        key: new J("clearDocument"),
        appendTransaction: (n, e, t) => {
          if (n.some((m) => m.getMeta("composition")))
            return;
          const i = n.some((m) => m.docChanged) && !e.doc.eq(t.doc), s = n.some((m) => m.getMeta("preventClearDocument"));
          if (!i || s)
            return;
          const { empty: r, from: o, to: l } = e.selection, a = L.atStart(e.doc).from, c = L.atEnd(e.doc).to;
          if (r || !(o === a && l === c) || !ds(t.doc))
            return;
          const p = t.tr, h = is({
            state: t,
            transaction: p
          }), { commands: f } = new ss({
            editor: this.editor,
            state: h
          });
          if (f.clearNodes(), !!p.steps.length)
            return p;
        }
      })
    ];
  }
}), nm = K.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new W({
        key: new J("tiptapPaste"),
        props: {
          handlePaste: (n, e, t) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice: t
            });
          }
        }
      })
    ];
  }
}), im = K.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new W({
        key: new J("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
class bt {
  get name() {
    return this.node.type.name;
  }
  constructor(e, t, i = !1, s = null) {
    this.currentNode = null, this.actualDepth = null, this.isBlock = i, this.resolvedPos = e, this.editor = t, this.currentNode = s;
  }
  get node() {
    return this.currentNode || this.resolvedPos.node();
  }
  get element() {
    return this.editor.view.domAtPos(this.pos).node;
  }
  get depth() {
    var e;
    return (e = this.actualDepth) !== null && e !== void 0 ? e : this.resolvedPos.depth;
  }
  get pos() {
    return this.resolvedPos.pos;
  }
  get content() {
    return this.node.content;
  }
  set content(e) {
    let t = this.from, i = this.to;
    if (this.isBlock) {
      if (this.content.size === 0) {
        console.error(`You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`);
        return;
      }
      t = this.from + 1, i = this.to - 1;
    }
    this.editor.commands.insertContentAt({ from: t, to: i }, e);
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
    const e = this.resolvedPos.start(this.resolvedPos.depth - 1), t = this.resolvedPos.doc.resolve(e);
    return new bt(t, this.editor);
  }
  get before() {
    let e = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2));
    return e.depth !== this.depth && (e = this.resolvedPos.doc.resolve(this.from - 3)), new bt(e, this.editor);
  }
  get after() {
    let e = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1));
    return e.depth !== this.depth && (e = this.resolvedPos.doc.resolve(this.to + 3)), new bt(e, this.editor);
  }
  get children() {
    const e = [];
    return this.node.content.forEach((t, i) => {
      const s = t.isBlock && !t.isTextblock, r = t.isAtom && !t.isText, o = this.pos + i + (r ? 0 : 1);
      if (o < 0 || o > this.resolvedPos.doc.nodeSize - 2)
        return;
      const l = this.resolvedPos.doc.resolve(o);
      if (!s && l.depth <= this.depth)
        return;
      const a = new bt(l, this.editor, s, s ? t : null);
      s && (a.actualDepth = this.depth + 1), e.push(new bt(l, this.editor, s, s ? t : null));
    }), e;
  }
  get firstChild() {
    return this.children[0] || null;
  }
  get lastChild() {
    const e = this.children;
    return e[e.length - 1] || null;
  }
  closest(e, t = {}) {
    let i = null, s = this.parent;
    for (; s && !i; ) {
      if (s.node.type.name === e)
        if (Object.keys(t).length > 0) {
          const r = s.node.attrs, o = Object.keys(t);
          for (let l = 0; l < o.length; l += 1) {
            const a = o[l];
            if (r[a] !== t[a])
              break;
          }
        } else
          i = s;
      s = s.parent;
    }
    return i;
  }
  querySelector(e, t = {}) {
    return this.querySelectorAll(e, t, !0)[0] || null;
  }
  querySelectorAll(e, t = {}, i = !1) {
    let s = [];
    if (!this.children || this.children.length === 0)
      return s;
    const r = Object.keys(t);
    return this.children.forEach((o) => {
      i && s.length > 0 || (o.node.type.name === e && r.every((a) => t[a] === o.node.attrs[a]) && s.push(o), !(i && s.length > 0) && (s = s.concat(o.querySelectorAll(e, t, i))));
    }), s;
  }
  setAttribute(e) {
    const { tr: t } = this.editor.state;
    t.setNodeMarkup(this.from, void 0, {
      ...this.node.attrs,
      ...e
    }), this.editor.view.dispatch(t);
  }
}
const sm = `.ProseMirror {
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
function rm(n, e, t) {
  const i = document.querySelector("style[data-tiptap-style]");
  if (i !== null)
    return i;
  const s = document.createElement("style");
  return e && s.setAttribute("nonce", e), s.setAttribute("data-tiptap-style", ""), s.innerHTML = n, document.getElementsByTagName("head")[0].appendChild(s), s;
}
class om extends hh {
  constructor(e = {}) {
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
      onContentError: ({ error: t }) => {
        throw t;
      },
      onPaste: () => null,
      onDrop: () => null
    }, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.setOptions(e), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("contentError", this.options.onContentError), this.createView(), this.injectCSS(), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: t, slice: i, moved: s }) => this.options.onDrop(t, i, s)), this.on("paste", ({ event: t, slice: i }) => this.options.onPaste(t, i)), window.setTimeout(() => {
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
    this.options.injectCSS && document && (this.css = rm(sm, this.options.injectNonce));
  }
  /**
   * Update editor options.
   *
   * @param options A list of options
   */
  setOptions(e = {}) {
    this.options = {
      ...this.options,
      ...e
    }, !(!this.view || !this.state || this.isDestroyed) && (this.options.editorProps && this.view.setProps(this.options.editorProps), this.view.updateState(this.state));
  }
  /**
   * Update editable state of the editor.
   */
  setEditable(e, t = !0) {
    this.setOptions({ editable: e }), t && this.emit("update", { editor: this, transaction: this.state.tr });
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
  registerPlugin(e, t) {
    const i = Ec(t) ? t(e, [...this.state.plugins]) : [...this.state.plugins, e], s = this.state.reconfigure({ plugins: i });
    return this.view.updateState(s), s;
  }
  /**
   * Unregister a ProseMirror plugin.
   *
   * @param nameOrPluginKeyToRemove The plugins name
   * @returns The new editor state or undefined if the editor is destroyed
   */
  unregisterPlugin(e) {
    if (this.isDestroyed)
      return;
    const t = this.state.plugins;
    let i = t;
    if ([].concat(e).forEach((r) => {
      const o = typeof r == "string" ? `${r}$` : r.key;
      i = i.filter((l) => !l.key.startsWith(o));
    }), t.length === i.length)
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
    var e, t;
    const s = [...this.options.enableCoreExtensions ? [
      Qf,
      Ah.configure({
        blockSeparator: (t = (e = this.options.coreExtensionOptions) === null || e === void 0 ? void 0 : e.clipboardTextSerializer) === null || t === void 0 ? void 0 : t.blockSeparator
      }),
      Yf,
      em,
      tm,
      im,
      Xf,
      nm
    ].filter((r) => typeof this.options.enableCoreExtensions == "object" ? this.options.enableCoreExtensions[r.name] !== !1 : !0) : [], ...this.options.extensions].filter((r) => ["extension", "node", "mark"].includes(r == null ? void 0 : r.type));
    this.extensionManager = new Vt(s, this);
  }
  /**
   * Creates an command manager.
   */
  createCommandManager() {
    this.commandManager = new ss({
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
    var e;
    let t;
    try {
      t = cr(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: this.options.enableContentCheck });
    } catch (o) {
      if (!(o instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(o.message))
        throw o;
      this.emit("contentError", {
        editor: this,
        error: o,
        disableCollaboration: () => {
          this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((l) => l.name !== "collaboration"), this.createExtensionManager();
        }
      }), t = cr(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: !1 });
    }
    const i = Nc(t, this.options.autofocus);
    this.view = new pc(this.options.element, {
      ...this.options.editorProps,
      attributes: {
        // add `role="textbox"` to the editor element
        role: "textbox",
        ...(e = this.options.editorProps) === null || e === void 0 ? void 0 : e.attributes
      },
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: qt.create({
        doc: t,
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
  captureTransaction(e) {
    this.isCapturingTransaction = !0, e(), this.isCapturingTransaction = !1;
    const t = this.capturedTransaction;
    return this.capturedTransaction = null, t;
  }
  /**
   * The callback over which to send transactions (state updates) produced by the view.
   *
   * @param transaction An editor state transaction
   */
  dispatchTransaction(e) {
    if (this.view.isDestroyed)
      return;
    if (this.isCapturingTransaction) {
      if (!this.capturedTransaction) {
        this.capturedTransaction = e;
        return;
      }
      e.steps.forEach((o) => {
        var l;
        return (l = this.capturedTransaction) === null || l === void 0 ? void 0 : l.step(o);
      });
      return;
    }
    const t = this.state.apply(e), i = !this.state.selection.eq(t.selection);
    this.emit("beforeTransaction", {
      editor: this,
      transaction: e,
      nextState: t
    }), this.view.updateState(t), this.emit("transaction", {
      editor: this,
      transaction: e
    }), i && this.emit("selectionUpdate", {
      editor: this,
      transaction: e
    });
    const s = e.getMeta("focus"), r = e.getMeta("blur");
    s && this.emit("focus", {
      editor: this,
      event: s.event,
      transaction: e
    }), r && this.emit("blur", {
      editor: this,
      event: r.event,
      transaction: e
    }), !(!e.docChanged || e.getMeta("preventUpdate")) && this.emit("update", {
      editor: this,
      transaction: e
    });
  }
  /**
   * Get attributes of the currently selected node or mark.
   */
  getAttributes(e) {
    return Pc(this.state, e);
  }
  isActive(e, t) {
    const i = typeof e == "string" ? e : null, s = typeof e == "string" ? t : e;
    return Af(this.state, i, s);
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
    return Yr(this.state.doc.content, this.schema);
  }
  /**
   * Get the document as text.
   */
  getText(e) {
    const { blockSeparator: t = `

`, textSerializers: i = {} } = e || {};
    return Sf(this.state.doc, {
      blockSeparator: t,
      textSerializers: {
        ...Ac(this.schema),
        ...i
      }
    });
  }
  /**
   * Check if there is no content.
   */
  get isEmpty() {
    return ds(this.state.doc);
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
      const e = this.view.dom;
      e && e.editor && delete e.editor, this.view.destroy();
    }
    this.removeAllListeners();
  }
  /**
   * Check if the editor is already destroyed.
   */
  get isDestroyed() {
    var e;
    return !(!((e = this.view) === null || e === void 0) && e.docView);
  }
  $node(e, t) {
    var i;
    return ((i = this.$doc) === null || i === void 0 ? void 0 : i.querySelector(e, t)) || null;
  }
  $nodes(e, t) {
    var i;
    return ((i = this.$doc) === null || i === void 0 ? void 0 : i.querySelectorAll(e, t)) || null;
  }
  $pos(e) {
    const t = this.state.doc.resolve(e);
    return new bt(t, this);
  }
  get $doc() {
    return this.$pos(0);
  }
}
function Nt(n) {
  return new ls({
    find: n.find,
    handler: ({ state: e, range: t, match: i }) => {
      const s = R(n.getAttributes, void 0, i);
      if (s === !1 || s === null)
        return null;
      const { tr: r } = e, o = i[i.length - 1], l = i[0];
      if (o) {
        const a = l.search(/\S/), c = t.from + l.indexOf(o), d = c + o.length;
        if (eo(t.from, t.to, e.doc).filter((h) => h.mark.type.excluded.find((m) => m === n.type && m !== h.mark.type)).filter((h) => h.to > c).length)
          return null;
        d < t.to && r.delete(d, t.to), c > t.from && r.delete(t.from + a, c);
        const p = t.from + a + o.length;
        r.addMark(t.from + a, p, n.type.create(s || {})), r.removeStoredMark(n.type);
      }
    }
  });
}
function lm(n) {
  return new ls({
    find: n.find,
    handler: ({ state: e, range: t, match: i }) => {
      const s = R(n.getAttributes, void 0, i) || {}, { tr: r } = e, o = t.from;
      let l = t.to;
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
function ur(n) {
  return new ls({
    find: n.find,
    handler: ({ state: e, range: t, match: i }) => {
      const s = e.doc.resolve(t.from), r = R(n.getAttributes, void 0, i) || {};
      if (!s.node(-1).canReplaceWith(s.index(-1), s.indexAfter(-1), n.type))
        return null;
      e.tr.delete(t.from, t.to).setBlockType(t.from, t.from, n.type, r);
    }
  });
}
function An(n) {
  return new ls({
    find: n.find,
    handler: ({ state: e, range: t, match: i, chain: s }) => {
      const r = R(n.getAttributes, void 0, i) || {}, o = e.tr.delete(t.from, t.to), a = o.doc.resolve(t.from).blockRange(), c = a && Or(a, n.type, r);
      if (!c)
        return null;
      if (o.wrap(a, c), n.keepMarks && n.editor) {
        const { selection: u, storedMarks: p } = e, { splittableMarks: h } = n.editor.extensionManager, f = p || u.$to.parentOffset && u.$from.marks();
        if (f) {
          const m = f.filter((g) => h.includes(g.type.name));
          o.ensureMarks(m);
        }
      }
      if (n.keepAttributes) {
        const u = n.type.name === "bulletList" || n.type.name === "orderedList" ? "listItem" : "taskList";
        s().updateAttributes(u, r).run();
      }
      const d = o.doc.resolve(t.from - 1).nodeBefore;
      d && d.type === n.type && ut(o.doc, t.from - 1) && (!n.joinPredicate || n.joinPredicate(i, d)) && o.join(t.from - 1);
    }
  });
}
class B {
  constructor(e = {}) {
    this.type = "node", this.name = "node", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = R(E(this, "addOptions", {
      name: this.name
    }))), this.storage = R(E(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new B(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => as(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new B(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = R(E(t, "addOptions", {
      name: t.name
    })), t.storage = R(E(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function dt(n) {
  return new xh({
    find: n.find,
    handler: ({ state: e, range: t, match: i, pasteEvent: s }) => {
      const r = R(n.getAttributes, void 0, i, s);
      if (r === !1 || r === null)
        return null;
      const { tr: o } = e, l = i[i.length - 1], a = i[0];
      let c = t.to;
      if (l) {
        const d = a.search(/\S/), u = t.from + a.indexOf(l), p = u + l.length;
        if (eo(t.from, t.to, e.doc).filter((f) => f.mark.type.excluded.find((g) => g === n.type && g !== f.mark.type)).filter((f) => f.to > u).length)
          return null;
        p < t.to && o.delete(p, t.to), u > t.from && o.delete(t.from + d, u), c = t.from + d + l.length, o.addMark(t.from + d, c, n.type.create(r || {})), o.removeStoredMark(n.type);
      }
    }
  });
}
function am(n, e) {
  const { selection: t } = n, { $from: i } = t;
  if (t instanceof A) {
    const r = i.index();
    return i.parent.canReplaceWith(r, r + 1, e);
  }
  let s = i.depth;
  for (; s >= 0; ) {
    const r = i.index(s);
    if (i.node(s).contentMatchAt(r).matchType(e))
      return !0;
    s -= 1;
  }
  return !1;
}
function cm(n) {
  return n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
const dm = /^\s*>\s$/, um = B.create({
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
        find: dm,
        type: this.type
      })
    ];
  }
}), pm = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/, hm = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g, fm = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/, mm = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g, gm = fe.create({
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
      Nt({
        find: pm,
        type: this.type
      }),
      Nt({
        find: fm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: hm,
        type: this.type
      }),
      dt({
        find: mm,
        type: this.type
      })
    ];
  }
}), bm = "listItem", wl = "textStyle", xl = /^\s*([-+*])\s$/, ym = B.create({
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
      toggleBulletList: () => ({ commands: n, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(bm, this.editor.getAttributes(wl)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor.commands.toggleBulletList()
    };
  },
  addInputRules() {
    let n = An({
      find: xl,
      type: this.type
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = An({
      find: xl,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: () => this.editor.getAttributes(wl),
      editor: this.editor
    })), [
      n
    ];
  }
}), vm = /(^|[^`])`([^`]+)`(?!`)/, km = /(^|[^`])`([^`]+)`(?!`)/g, wm = fe.create({
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
      Nt({
        find: vm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: km,
        type: this.type
      })
    ];
  }
}), xm = /^```([a-z]+)?[\s\n]$/, Sm = /^~~~([a-z]+)?[\s\n]$/, Cm = B.create({
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
          var e;
          const { languageClassPrefix: t } = this.options, r = [...((e = n.firstElementChild) === null || e === void 0 ? void 0 : e.classList) || []].filter((o) => o.startsWith(t)).map((o) => o.replace(t, ""))[0];
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    return [
      "pre",
      D(this.options.HTMLAttributes, e),
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
      setCodeBlock: (n) => ({ commands: e }) => e.setNode(this.name, n),
      toggleCodeBlock: (n) => ({ commands: e }) => e.toggleNode(this.name, "paragraph", n)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty: n, $anchor: e } = this.editor.state.selection, t = e.pos === 1;
        return !n || e.parent.type.name !== this.name ? !1 : t || !e.parent.textContent.length ? this.editor.commands.clearNodes() : !1;
      },
      // exit node on triple enter
      Enter: ({ editor: n }) => {
        if (!this.options.exitOnTripleEnter)
          return !1;
        const { state: e } = n, { selection: t } = e, { $from: i, empty: s } = t;
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
        const { state: e } = n, { selection: t, doc: i } = e, { $from: s, empty: r } = t;
        if (!r || s.parent.type !== this.type || !(s.parentOffset === s.parent.nodeSize - 2))
          return !1;
        const l = s.after();
        return l === void 0 ? !1 : i.nodeAt(l) ? n.commands.command(({ tr: c }) => (c.setSelection(L.near(i.resolve(l))), !0)) : n.commands.exitCode();
      }
    };
  },
  addInputRules() {
    return [
      ur({
        find: xm,
        type: this.type,
        getAttributes: (n) => ({
          language: n[1]
        })
      }),
      ur({
        find: Sm,
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
      new W({
        key: new J("codeBlockVSCodeHandler"),
        props: {
          handlePaste: (n, e) => {
            if (!e.clipboardData || this.editor.isActive(this.type.name))
              return !1;
            const t = e.clipboardData.getData("text/plain"), i = e.clipboardData.getData("vscode-editor-data"), s = i ? JSON.parse(i) : void 0, r = s == null ? void 0 : s.mode;
            if (!t || !r)
              return !1;
            const { tr: o, schema: l } = n.state, a = l.text(t.replace(/\r\n?/g, `
`));
            return o.replaceSelectionWith(this.type.create({ language: r }, a)), o.selection.$from.parent.type !== this.type && o.setSelection(_.near(o.doc.resolve(Math.max(0, o.selection.from - 2)))), o.setMeta("paste", !0), n.dispatch(o), !0;
          }
        }
      })
    ];
  }
}), Mm = B.create({
  name: "doc",
  topNode: !0,
  content: "block+"
});
function Em(n = {}) {
  return new W({
    view(e) {
      return new Tm(e, n);
    }
  });
}
class Tm {
  constructor(e, t) {
    var i;
    this.editorView = e, this.cursorPos = null, this.element = null, this.timeout = -1, this.width = (i = t.width) !== null && i !== void 0 ? i : 1, this.color = t.color === !1 ? void 0 : t.color || "black", this.class = t.class, this.handlers = ["dragover", "dragend", "drop", "dragleave"].map((s) => {
      let r = (o) => {
        this[s](o);
      };
      return e.dom.addEventListener(s, r), { name: s, handler: r };
    });
  }
  destroy() {
    this.handlers.forEach(({ name: e, handler: t }) => this.editorView.dom.removeEventListener(e, t));
  }
  update(e, t) {
    this.cursorPos != null && t.doc != e.state.doc && (this.cursorPos > e.state.doc.content.size ? this.setCursor(null) : this.updateOverlay());
  }
  setCursor(e) {
    e != this.cursorPos && (this.cursorPos = e, e == null ? (this.element.parentNode.removeChild(this.element), this.element = null) : this.updateOverlay());
  }
  updateOverlay() {
    let e = this.editorView.state.doc.resolve(this.cursorPos), t = !e.parent.inlineContent, i, s = this.editorView.dom, r = s.getBoundingClientRect(), o = r.width / s.offsetWidth, l = r.height / s.offsetHeight;
    if (t) {
      let u = e.nodeBefore, p = e.nodeAfter;
      if (u || p) {
        let h = this.editorView.nodeDOM(this.cursorPos - (u ? u.nodeSize : 0));
        if (h) {
          let f = h.getBoundingClientRect(), m = u ? f.bottom : f.top;
          u && p && (m = (m + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2);
          let g = this.width / 2 * l;
          i = { left: f.left, right: f.right, top: m - g, bottom: m + g };
        }
      }
    }
    if (!i) {
      let u = this.editorView.coordsAtPos(this.cursorPos), p = this.width / 2 * o;
      i = { left: u.left - p, right: u.left + p, top: u.top, bottom: u.bottom };
    }
    let a = this.editorView.dom.offsetParent;
    this.element || (this.element = a.appendChild(document.createElement("div")), this.class && (this.element.className = this.class), this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;", this.color && (this.element.style.backgroundColor = this.color)), this.element.classList.toggle("prosemirror-dropcursor-block", t), this.element.classList.toggle("prosemirror-dropcursor-inline", !t);
    let c, d;
    if (!a || a == document.body && getComputedStyle(a).position == "static")
      c = -pageXOffset, d = -pageYOffset;
    else {
      let u = a.getBoundingClientRect(), p = u.width / a.offsetWidth, h = u.height / a.offsetHeight;
      c = u.left - a.scrollLeft * p, d = u.top - a.scrollTop * h;
    }
    this.element.style.left = (i.left - c) / o + "px", this.element.style.top = (i.top - d) / l + "px", this.element.style.width = (i.right - i.left) / o + "px", this.element.style.height = (i.bottom - i.top) / l + "px";
  }
  scheduleRemoval(e) {
    clearTimeout(this.timeout), this.timeout = setTimeout(() => this.setCursor(null), e);
  }
  dragover(e) {
    if (!this.editorView.editable)
      return;
    let t = this.editorView.posAtCoords({ left: e.clientX, top: e.clientY }), i = t && t.inside >= 0 && this.editorView.state.doc.nodeAt(t.inside), s = i && i.type.spec.disableDropCursor, r = typeof s == "function" ? s(this.editorView, t, e) : s;
    if (t && !r) {
      let o = t.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        let l = Ca(this.editorView.state.doc, o, this.editorView.dragging.slice);
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
  dragleave(e) {
    this.editorView.dom.contains(e.relatedTarget) || this.setCursor(null);
  }
}
const Am = K.create({
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
      Em(this.options)
    ];
  }
});
class V extends L {
  /**
  Create a gap cursor.
  */
  constructor(e) {
    super(e, e);
  }
  map(e, t) {
    let i = e.resolve(t.map(this.head));
    return V.valid(i) ? new V(i) : L.near(i);
  }
  content() {
    return S.empty;
  }
  eq(e) {
    return e instanceof V && e.head == this.head;
  }
  toJSON() {
    return { type: "gapcursor", pos: this.head };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for GapCursor.fromJSON");
    return new V(e.resolve(t.pos));
  }
  /**
  @internal
  */
  getBookmark() {
    return new to(this.anchor);
  }
  /**
  @internal
  */
  static valid(e) {
    let t = e.parent;
    if (t.isTextblock || !_m(e) || !Lm(e))
      return !1;
    let i = t.type.spec.allowGapCursor;
    if (i != null)
      return i;
    let s = t.contentMatchAt(e.index()).defaultType;
    return s && s.isTextblock;
  }
  /**
  @internal
  */
  static findGapCursorFrom(e, t, i = !1) {
    e: for (; ; ) {
      if (!i && V.valid(e))
        return e;
      let s = e.pos, r = null;
      for (let o = e.depth; ; o--) {
        let l = e.node(o);
        if (t > 0 ? e.indexAfter(o) < l.childCount : e.index(o) > 0) {
          r = l.child(t > 0 ? e.indexAfter(o) : e.index(o) - 1);
          break;
        } else if (o == 0)
          return null;
        s += t;
        let a = e.doc.resolve(s);
        if (V.valid(a))
          return a;
      }
      for (; ; ) {
        let o = t > 0 ? r.firstChild : r.lastChild;
        if (!o) {
          if (r.isAtom && !r.isText && !A.isSelectable(r)) {
            e = e.doc.resolve(s + r.nodeSize * t), i = !1;
            continue e;
          }
          break;
        }
        r = o, s += t;
        let l = e.doc.resolve(s);
        if (V.valid(l))
          return l;
      }
      return null;
    }
  }
}
V.prototype.visible = !1;
V.findFrom = V.findGapCursorFrom;
L.jsonID("gapcursor", V);
class to {
  constructor(e) {
    this.pos = e;
  }
  map(e) {
    return new to(e.map(this.pos));
  }
  resolve(e) {
    let t = e.resolve(this.pos);
    return V.valid(t) ? new V(t) : L.near(t);
  }
}
function Bc(n) {
  return n.isAtom || n.spec.isolating || n.spec.createGapCursor;
}
function _m(n) {
  for (let e = n.depth; e >= 0; e--) {
    let t = n.index(e), i = n.node(e);
    if (t == 0) {
      if (i.type.spec.isolating)
        return !0;
      continue;
    }
    for (let s = i.child(t - 1); ; s = s.lastChild) {
      if (s.childCount == 0 && !s.inlineContent || Bc(s.type))
        return !0;
      if (s.inlineContent)
        return !1;
    }
  }
  return !0;
}
function Lm(n) {
  for (let e = n.depth; e >= 0; e--) {
    let t = n.indexAfter(e), i = n.node(e);
    if (t == i.childCount) {
      if (i.type.spec.isolating)
        return !0;
      continue;
    }
    for (let s = i.child(t); ; s = s.firstChild) {
      if (s.childCount == 0 && !s.inlineContent || Bc(s.type))
        return !0;
      if (s.inlineContent)
        return !1;
    }
  }
  return !0;
}
function Nm() {
  return new W({
    props: {
      decorations: Dm,
      createSelectionBetween(n, e, t) {
        return e.pos == t.pos && V.valid(t) ? new V(t) : null;
      },
      handleClick: Rm,
      handleKeyDown: Om,
      handleDOMEvents: { beforeinput: Im }
    }
  });
}
const Om = Ur({
  ArrowLeft: Un("horiz", -1),
  ArrowRight: Un("horiz", 1),
  ArrowUp: Un("vert", -1),
  ArrowDown: Un("vert", 1)
});
function Un(n, e) {
  const t = n == "vert" ? e > 0 ? "down" : "up" : e > 0 ? "right" : "left";
  return function(i, s, r) {
    let o = i.selection, l = e > 0 ? o.$to : o.$from, a = o.empty;
    if (o instanceof _) {
      if (!r.endOfTextblock(t) || l.depth == 0)
        return !1;
      a = !1, l = i.doc.resolve(e > 0 ? l.after() : l.before());
    }
    let c = V.findGapCursorFrom(l, e, a);
    return c ? (s && s(i.tr.setSelection(new V(c))), !0) : !1;
  };
}
function Rm(n, e, t) {
  if (!n || !n.editable)
    return !1;
  let i = n.state.doc.resolve(e);
  if (!V.valid(i))
    return !1;
  let s = n.posAtCoords({ left: t.clientX, top: t.clientY });
  return s && s.inside > -1 && A.isSelectable(n.state.doc.nodeAt(s.inside)) ? !1 : (n.dispatch(n.state.tr.setSelection(new V(i))), !0);
}
function Im(n, e) {
  if (e.inputType != "insertCompositionText" || !(n.state.selection instanceof V))
    return !1;
  let { $from: t } = n.state.selection, i = t.parent.contentMatchAt(t.index()).findWrapping(n.state.schema.nodes.text);
  if (!i)
    return !1;
  let s = y.empty;
  for (let o = i.length - 1; o >= 0; o--)
    s = y.from(i[o].createAndFill(null, s));
  let r = n.state.tr.replace(t.pos, t.pos, new S(s, 0, 0));
  return r.setSelection(_.near(r.doc.resolve(t.pos + 1))), n.dispatch(r), !1;
}
function Dm(n) {
  if (!(n.selection instanceof V))
    return null;
  let e = document.createElement("div");
  return e.className = "ProseMirror-gapcursor", F.create(n.doc, [se.widget(n.selection.head, e, { key: "gapcursor" })]);
}
const Pm = K.create({
  name: "gapCursor",
  addProseMirrorPlugins() {
    return [
      Nm()
    ];
  },
  extendNodeSchema(n) {
    var e;
    const t = {
      name: n.name,
      options: n.options,
      storage: n.storage
    };
    return {
      allowGapCursor: (e = R(E(n, "allowGapCursor", t))) !== null && e !== void 0 ? e : null
    };
  }
}), Bm = B.create({
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
      setHardBreak: () => ({ commands: n, chain: e, state: t, editor: i }) => n.first([
        () => n.exitCode(),
        () => n.command(() => {
          const { selection: s, storedMarks: r } = t;
          if (s.$from.parent.type.spec.isolating)
            return !1;
          const { keepMarks: o } = this.options, { splittableMarks: l } = i.extensionManager, a = r || s.$to.parentOffset && s.$from.marks();
          return e().insertContent({ type: this.name }).command(({ tr: c, dispatch: d }) => {
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
}), Hm = B.create({
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    return [`h${this.options.levels.includes(n.attrs.level) ? n.attrs.level : this.options.levels[0]}`, D(this.options.HTMLAttributes, e), 0];
  },
  addCommands() {
    return {
      setHeading: (n) => ({ commands: e }) => this.options.levels.includes(n.level) ? e.setNode(this.name, n) : !1,
      toggleHeading: (n) => ({ commands: e }) => this.options.levels.includes(n.level) ? e.toggleNode(this.name, "paragraph", n) : !1
    };
  },
  addKeyboardShortcuts() {
    return this.options.levels.reduce((n, e) => ({
      ...n,
      [`Mod-Alt-${e}`]: () => this.editor.commands.toggleHeading({ level: e })
    }), {});
  },
  addInputRules() {
    return this.options.levels.map((n) => ur({
      find: new RegExp(`^(#{${Math.min(...this.options.levels)},${n}})\\s$`),
      type: this.type,
      getAttributes: {
        level: n
      }
    }));
  }
});
var ki = 200, X = function() {
};
X.prototype.append = function(e) {
  return e.length ? (e = X.from(e), !this.length && e || e.length < ki && this.leafAppend(e) || this.length < ki && e.leafPrepend(this) || this.appendInner(e)) : this;
};
X.prototype.prepend = function(e) {
  return e.length ? X.from(e).append(this) : this;
};
X.prototype.appendInner = function(e) {
  return new zm(this, e);
};
X.prototype.slice = function(e, t) {
  return e === void 0 && (e = 0), t === void 0 && (t = this.length), e >= t ? X.empty : this.sliceInner(Math.max(0, e), Math.min(this.length, t));
};
X.prototype.get = function(e) {
  if (!(e < 0 || e >= this.length))
    return this.getInner(e);
};
X.prototype.forEach = function(e, t, i) {
  t === void 0 && (t = 0), i === void 0 && (i = this.length), t <= i ? this.forEachInner(e, t, i, 0) : this.forEachInvertedInner(e, t, i, 0);
};
X.prototype.map = function(e, t, i) {
  t === void 0 && (t = 0), i === void 0 && (i = this.length);
  var s = [];
  return this.forEach(function(r, o) {
    return s.push(e(r, o));
  }, t, i), s;
};
X.from = function(e) {
  return e instanceof X ? e : e && e.length ? new Hc(e) : X.empty;
};
var Hc = /* @__PURE__ */ (function(n) {
  function e(i) {
    n.call(this), this.values = i;
  }
  n && (e.__proto__ = n), e.prototype = Object.create(n && n.prototype), e.prototype.constructor = e;
  var t = { length: { configurable: !0 }, depth: { configurable: !0 } };
  return e.prototype.flatten = function() {
    return this.values;
  }, e.prototype.sliceInner = function(s, r) {
    return s == 0 && r == this.length ? this : new e(this.values.slice(s, r));
  }, e.prototype.getInner = function(s) {
    return this.values[s];
  }, e.prototype.forEachInner = function(s, r, o, l) {
    for (var a = r; a < o; a++)
      if (s(this.values[a], l + a) === !1)
        return !1;
  }, e.prototype.forEachInvertedInner = function(s, r, o, l) {
    for (var a = r - 1; a >= o; a--)
      if (s(this.values[a], l + a) === !1)
        return !1;
  }, e.prototype.leafAppend = function(s) {
    if (this.length + s.length <= ki)
      return new e(this.values.concat(s.flatten()));
  }, e.prototype.leafPrepend = function(s) {
    if (this.length + s.length <= ki)
      return new e(s.flatten().concat(this.values));
  }, t.length.get = function() {
    return this.values.length;
  }, t.depth.get = function() {
    return 0;
  }, Object.defineProperties(e.prototype, t), e;
})(X);
X.empty = new Hc([]);
var zm = /* @__PURE__ */ (function(n) {
  function e(t, i) {
    n.call(this), this.left = t, this.right = i, this.length = t.length + i.length, this.depth = Math.max(t.depth, i.depth) + 1;
  }
  return n && (e.__proto__ = n), e.prototype = Object.create(n && n.prototype), e.prototype.constructor = e, e.prototype.flatten = function() {
    return this.left.flatten().concat(this.right.flatten());
  }, e.prototype.getInner = function(i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length);
  }, e.prototype.forEachInner = function(i, s, r, o) {
    var l = this.left.length;
    if (s < l && this.left.forEachInner(i, s, Math.min(r, l), o) === !1 || r > l && this.right.forEachInner(i, Math.max(s - l, 0), Math.min(this.length, r) - l, o + l) === !1)
      return !1;
  }, e.prototype.forEachInvertedInner = function(i, s, r, o) {
    var l = this.left.length;
    if (s > l && this.right.forEachInvertedInner(i, s - l, Math.max(r, l) - l, o + l) === !1 || r < l && this.left.forEachInvertedInner(i, Math.min(s, l), r, o) === !1)
      return !1;
  }, e.prototype.sliceInner = function(i, s) {
    if (i == 0 && s == this.length)
      return this;
    var r = this.left.length;
    return s <= r ? this.left.slice(i, s) : i >= r ? this.right.slice(i - r, s - r) : this.left.slice(i, r).append(this.right.slice(0, s - r));
  }, e.prototype.leafAppend = function(i) {
    var s = this.right.leafAppend(i);
    if (s)
      return new e(this.left, s);
  }, e.prototype.leafPrepend = function(i) {
    var s = this.left.leafPrepend(i);
    if (s)
      return new e(s, this.right);
  }, e.prototype.appendInner = function(i) {
    return this.left.depth >= Math.max(this.right.depth, i.depth) + 1 ? new e(this.left, new e(this.right, i)) : new e(this, i);
  }, e;
})(X);
const $m = 500;
class Me {
  constructor(e, t) {
    this.items = e, this.eventCount = t;
  }
  // Pop the latest event off the branch's history and apply it
  // to a document transform.
  popEvent(e, t) {
    if (this.eventCount == 0)
      return null;
    let i = this.items.length;
    for (; ; i--)
      if (this.items.get(i - 1).selection) {
        --i;
        break;
      }
    let s, r;
    t && (s = this.remapping(i, this.items.length), r = s.maps.length);
    let o = e.tr, l, a, c = [], d = [];
    return this.items.forEach((u, p) => {
      if (!u.step) {
        s || (s = this.remapping(i, p + 1), r = s.maps.length), r--, d.push(u);
        return;
      }
      if (s) {
        d.push(new Te(u.map));
        let h = u.step.map(s.slice(r)), f;
        h && o.maybeStep(h).doc && (f = o.mapping.maps[o.mapping.maps.length - 1], c.push(new Te(f, void 0, void 0, c.length + d.length))), r--, f && s.appendMap(f, r);
      } else
        o.maybeStep(u.step);
      if (u.selection)
        return l = s ? u.selection.map(s.slice(r)) : u.selection, a = new Me(this.items.slice(0, i).append(d.reverse().concat(c)), this.eventCount - 1), !1;
    }, this.items.length, 0), { remaining: a, transform: o, selection: l };
  }
  // Create a new branch with the given transform added.
  addTransform(e, t, i, s) {
    let r = [], o = this.eventCount, l = this.items, a = !s && l.length ? l.get(l.length - 1) : null;
    for (let d = 0; d < e.steps.length; d++) {
      let u = e.steps[d].invert(e.docs[d]), p = new Te(e.mapping.maps[d], u, t), h;
      (h = a && a.merge(p)) && (p = h, d ? r.pop() : l = l.slice(0, l.length - 1)), r.push(p), t && (o++, t = void 0), s || (a = p);
    }
    let c = o - i.depth;
    return c > qm && (l = Fm(l, c), o -= c), new Me(l.append(r), o);
  }
  remapping(e, t) {
    let i = new wn();
    return this.items.forEach((s, r) => {
      let o = s.mirrorOffset != null && r - s.mirrorOffset >= e ? i.maps.length - s.mirrorOffset : void 0;
      i.appendMap(s.map, o);
    }, e, t), i;
  }
  addMaps(e) {
    return this.eventCount == 0 ? this : new Me(this.items.append(e.map((t) => new Te(t))), this.eventCount);
  }
  // When the collab module receives remote changes, the history has
  // to know about those, so that it can adjust the steps that were
  // rebased on top of the remote changes, and include the position
  // maps for the remote changes in its array of items.
  rebased(e, t) {
    if (!this.eventCount)
      return this;
    let i = [], s = Math.max(0, this.items.length - t), r = e.mapping, o = e.steps.length, l = this.eventCount;
    this.items.forEach((p) => {
      p.selection && l--;
    }, s);
    let a = t;
    this.items.forEach((p) => {
      let h = r.getMirror(--a);
      if (h == null)
        return;
      o = Math.min(o, h);
      let f = r.maps[h];
      if (p.step) {
        let m = e.steps[h].invert(e.docs[h]), g = p.selection && p.selection.map(r.slice(a + 1, h));
        g && l++, i.push(new Te(f, m, g));
      } else
        i.push(new Te(f));
    }, s);
    let c = [];
    for (let p = t; p < o; p++)
      c.push(new Te(r.maps[p]));
    let d = this.items.slice(0, s).append(c).append(i), u = new Me(d, l);
    return u.emptyItemCount() > $m && (u = u.compress(this.items.length - i.length)), u;
  }
  emptyItemCount() {
    let e = 0;
    return this.items.forEach((t) => {
      t.step || e++;
    }), e;
  }
  // Compressing a branch means rewriting it to push the air (map-only
  // items) out. During collaboration, these naturally accumulate
  // because each remote change adds one. The `upto` argument is used
  // to ensure that only the items below a given level are compressed,
  // because `rebased` relies on a clean, untouched set of items in
  // order to associate old items with rebased steps.
  compress(e = this.items.length) {
    let t = this.remapping(0, e), i = t.maps.length, s = [], r = 0;
    return this.items.forEach((o, l) => {
      if (l >= e)
        s.push(o), o.selection && r++;
      else if (o.step) {
        let a = o.step.map(t.slice(i)), c = a && a.getMap();
        if (i--, c && t.appendMap(c, i), a) {
          let d = o.selection && o.selection.map(t.slice(i));
          d && r++;
          let u = new Te(c.invert(), a, d), p, h = s.length - 1;
          (p = s.length && s[h].merge(u)) ? s[h] = p : s.push(u);
        }
      } else o.map && i--;
    }, this.items.length, 0), new Me(X.from(s.reverse()), r);
  }
}
Me.empty = new Me(X.empty, 0);
function Fm(n, e) {
  let t;
  return n.forEach((i, s) => {
    if (i.selection && e-- == 0)
      return t = s, !1;
  }), n.slice(t);
}
class Te {
  constructor(e, t, i, s) {
    this.map = e, this.step = t, this.selection = i, this.mirrorOffset = s;
  }
  merge(e) {
    if (this.step && e.step && !e.selection) {
      let t = e.step.merge(this.step);
      if (t)
        return new Te(t.getMap().invert(), t, this.selection);
    }
  }
}
class Ye {
  constructor(e, t, i, s, r) {
    this.done = e, this.undone = t, this.prevRanges = i, this.prevTime = s, this.prevComposition = r;
  }
}
const qm = 20;
function Vm(n, e, t, i) {
  let s = t.getMeta(Et), r;
  if (s)
    return s.historyState;
  t.getMeta(jm) && (n = new Ye(n.done, n.undone, null, 0, -1));
  let o = t.getMeta("appendedTransaction");
  if (t.steps.length == 0)
    return n;
  if (o && o.getMeta(Et))
    return o.getMeta(Et).redo ? new Ye(n.done.addTransform(t, void 0, i, ni(e)), n.undone, Sl(t.mapping.maps), n.prevTime, n.prevComposition) : new Ye(n.done, n.undone.addTransform(t, void 0, i, ni(e)), null, n.prevTime, n.prevComposition);
  if (t.getMeta("addToHistory") !== !1 && !(o && o.getMeta("addToHistory") === !1)) {
    let l = t.getMeta("composition"), a = n.prevTime == 0 || !o && n.prevComposition != l && (n.prevTime < (t.time || 0) - i.newGroupDelay || !Um(t, n.prevRanges)), c = o ? Is(n.prevRanges, t.mapping) : Sl(t.mapping.maps);
    return new Ye(n.done.addTransform(t, a ? e.selection.getBookmark() : void 0, i, ni(e)), Me.empty, c, t.time, l ?? n.prevComposition);
  } else return (r = t.getMeta("rebased")) ? new Ye(n.done.rebased(t, r), n.undone.rebased(t, r), Is(n.prevRanges, t.mapping), n.prevTime, n.prevComposition) : new Ye(n.done.addMaps(t.mapping.maps), n.undone.addMaps(t.mapping.maps), Is(n.prevRanges, t.mapping), n.prevTime, n.prevComposition);
}
function Um(n, e) {
  if (!e)
    return !1;
  if (!n.docChanged)
    return !0;
  let t = !1;
  return n.mapping.maps[0].forEach((i, s) => {
    for (let r = 0; r < e.length; r += 2)
      i <= e[r + 1] && s >= e[r] && (t = !0);
  }), t;
}
function Sl(n) {
  let e = [];
  for (let t = n.length - 1; t >= 0 && e.length == 0; t--)
    n[t].forEach((i, s, r, o) => e.push(r, o));
  return e;
}
function Is(n, e) {
  if (!n)
    return null;
  let t = [];
  for (let i = 0; i < n.length; i += 2) {
    let s = e.map(n[i], 1), r = e.map(n[i + 1], -1);
    s <= r && t.push(s, r);
  }
  return t;
}
function Wm(n, e, t) {
  let i = ni(e), s = Et.get(e).spec.config, r = (t ? n.undone : n.done).popEvent(e, i);
  if (!r)
    return null;
  let o = r.selection.resolve(r.transform.doc), l = (t ? n.done : n.undone).addTransform(r.transform, e.selection.getBookmark(), s, i), a = new Ye(t ? l : r.remaining, t ? r.remaining : l, null, 0, -1);
  return r.transform.setSelection(o).setMeta(Et, { redo: t, historyState: a });
}
let Ds = !1, Cl = null;
function ni(n) {
  let e = n.plugins;
  if (Cl != e) {
    Ds = !1, Cl = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].spec.historyPreserveItems) {
        Ds = !0;
        break;
      }
  }
  return Ds;
}
const Et = new J("history"), jm = new J("closeHistory");
function Km(n = {}) {
  return n = {
    depth: n.depth || 100,
    newGroupDelay: n.newGroupDelay || 500
  }, new W({
    key: Et,
    state: {
      init() {
        return new Ye(Me.empty, Me.empty, null, 0, -1);
      },
      apply(e, t, i) {
        return Vm(t, i, e, n);
      }
    },
    config: n,
    props: {
      handleDOMEvents: {
        beforeinput(e, t) {
          let i = t.inputType, s = i == "historyUndo" ? $c : i == "historyRedo" ? Fc : null;
          return !s || !e.editable ? !1 : (t.preventDefault(), s(e.state, e.dispatch));
        }
      }
    }
  });
}
function zc(n, e) {
  return (t, i) => {
    let s = Et.getState(t);
    if (!s || (n ? s.undone : s.done).eventCount == 0)
      return !1;
    if (i) {
      let r = Wm(s, t, n);
      r && i(e ? r.scrollIntoView() : r);
    }
    return !0;
  };
}
const $c = zc(!1, !0), Fc = zc(!0, !0), Jm = K.create({
  name: "history",
  addOptions() {
    return {
      depth: 100,
      newGroupDelay: 500
    };
  },
  addCommands() {
    return {
      undo: () => ({ state: n, dispatch: e }) => $c(n, e),
      redo: () => ({ state: n, dispatch: e }) => Fc(n, e)
    };
  },
  addProseMirrorPlugins() {
    return [
      Km(this.options)
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
}), Gm = B.create({
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
      setHorizontalRule: () => ({ chain: n, state: e }) => {
        if (!am(e, e.schema.nodes[this.name]))
          return !1;
        const { selection: t } = e, { $from: i, $to: s } = t, r = n();
        return i.parentOffset === 0 ? r.insertContentAt({
          from: Math.max(i.pos - 1, 0),
          to: s.pos
        }, {
          type: this.name
        }) : _f(t) ? r.insertContentAt(s.pos, {
          type: this.name
        }) : r.insertContent({ type: this.name }), r.command(({ tr: o, dispatch: l }) => {
          var a;
          if (l) {
            const { $to: c } = o.selection, d = c.end();
            if (c.nodeAfter)
              c.nodeAfter.isTextblock ? o.setSelection(_.create(o.doc, c.pos + 1)) : c.nodeAfter.isBlock ? o.setSelection(A.create(o.doc, c.pos)) : o.setSelection(_.create(o.doc, c.pos));
            else {
              const u = (a = c.parent.type.contentMatch.defaultType) === null || a === void 0 ? void 0 : a.create();
              u && (o.insert(d, u), o.setSelection(_.create(o.doc, d + 1)));
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
      lm({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type
      })
    ];
  }
}), Ym = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, Xm = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, Qm = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, Zm = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, eg = fe.create({
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
      Nt({
        find: Ym,
        type: this.type
      }),
      Nt({
        find: Qm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: Xm,
        type: this.type
      }),
      dt({
        find: Zm,
        type: this.type
      })
    ];
  }
}), tg = B.create({
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
}), ng = "listItem", Ml = "textStyle", El = /^(\d+)\.\s$/, ig = B.create({
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
    const { start: e, ...t } = n;
    return e === 1 ? ["ol", D(this.options.HTMLAttributes, t), 0] : ["ol", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      toggleOrderedList: () => ({ commands: n, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ng, this.editor.getAttributes(Ml)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.commands.toggleOrderedList()
    };
  },
  addInputRules() {
    let n = An({
      find: El,
      type: this.type,
      getAttributes: (e) => ({ start: +e[1] }),
      joinPredicate: (e, t) => t.childCount + t.attrs.start === +e[1]
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = An({
      find: El,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: (e) => ({ start: +e[1], ...this.editor.getAttributes(Ml) }),
      joinPredicate: (e, t) => t.childCount + t.attrs.start === +e[1],
      editor: this.editor
    })), [
      n
    ];
  }
}), sg = B.create({
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
}), rg = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/, og = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g, lg = fe.create({
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
      Nt({
        find: rg,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: og,
        type: this.type
      })
    ];
  }
}), ag = B.create({
  name: "text",
  group: "inline"
}), cg = K.create({
  name: "starterKit",
  addExtensions() {
    const n = [];
    return this.options.bold !== !1 && n.push(gm.configure(this.options.bold)), this.options.blockquote !== !1 && n.push(um.configure(this.options.blockquote)), this.options.bulletList !== !1 && n.push(ym.configure(this.options.bulletList)), this.options.code !== !1 && n.push(wm.configure(this.options.code)), this.options.codeBlock !== !1 && n.push(Cm.configure(this.options.codeBlock)), this.options.document !== !1 && n.push(Mm.configure(this.options.document)), this.options.dropcursor !== !1 && n.push(Am.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && n.push(Pm.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && n.push(Bm.configure(this.options.hardBreak)), this.options.heading !== !1 && n.push(Hm.configure(this.options.heading)), this.options.history !== !1 && n.push(Jm.configure(this.options.history)), this.options.horizontalRule !== !1 && n.push(Gm.configure(this.options.horizontalRule)), this.options.italic !== !1 && n.push(eg.configure(this.options.italic)), this.options.listItem !== !1 && n.push(tg.configure(this.options.listItem)), this.options.orderedList !== !1 && n.push(ig.configure(this.options.orderedList)), this.options.paragraph !== !1 && n.push(sg.configure(this.options.paragraph)), this.options.strike !== !1 && n.push(lg.configure(this.options.strike)), this.options.text !== !1 && n.push(ag.configure(this.options.text)), n;
  }
}), dg = fe.create({
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
}), ug = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", pg = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", pr = "numeric", hr = "ascii", fr = "alpha", pn = "asciinumeric", ln = "alphanumeric", mr = "domain", qc = "emoji", hg = "scheme", fg = "slashscheme", Ps = "whitespace";
function mg(n, e) {
  return n in e || (e[n] = []), e[n];
}
function wt(n, e, t) {
  e[pr] && (e[pn] = !0, e[ln] = !0), e[hr] && (e[pn] = !0, e[fr] = !0), e[pn] && (e[ln] = !0), e[fr] && (e[ln] = !0), e[ln] && (e[mr] = !0), e[qc] && (e[mr] = !0);
  for (const i in e) {
    const s = mg(i, t);
    s.indexOf(n) < 0 && s.push(n);
  }
}
function gg(n, e) {
  const t = {};
  for (const i in e)
    e[i].indexOf(n) >= 0 && (t[i] = !0);
  return t;
}
function pe(n = null) {
  this.j = {}, this.jr = [], this.jd = null, this.t = n;
}
pe.groups = {};
pe.prototype = {
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
    const e = this, t = e.j[n];
    if (t)
      return t;
    for (let i = 0; i < e.jr.length; i++) {
      const s = e.jr[i][0], r = e.jr[i][1];
      if (r && s.test(n))
        return r;
    }
    return e.jd;
  },
  /**
   * Whether the state has a transition for the given input. Set the second
   * argument to true to only look for an exact match (and not a default or
   * regular-expression-based transition)
   * @param {string} input
   * @param {boolean} exactOnly
   */
  has(n, e = !1) {
    return e ? n in this.j : !!this.go(n);
  },
  /**
   * Short for "transition all"; create a transition from the array of items
   * in the given list to the same final resulting state.
   * @param {string | string[]} inputs Group of inputs to transition on
   * @param {Transition<T> | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   */
  ta(n, e, t, i) {
    for (let s = 0; s < n.length; s++)
      this.tt(n[s], e, t, i);
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
  tr(n, e, t, i) {
    i = i || pe.groups;
    let s;
    return e && e.j ? s = e : (s = new pe(e), t && i && wt(e, t, i)), this.jr.push([n, s]), s;
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
  ts(n, e, t, i) {
    let s = this;
    const r = n.length;
    if (!r)
      return s;
    for (let o = 0; o < r - 1; o++)
      s = s.tt(n[o]);
    return s.tt(n[r - 1], e, t, i);
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
  tt(n, e, t, i) {
    i = i || pe.groups;
    const s = this;
    if (e && e.j)
      return s.j[n] = e, e;
    const r = e;
    let o, l = s.go(n);
    if (l ? (o = new pe(), Object.assign(o.j, l.j), o.jr.push.apply(o.jr, l.jr), o.jd = l.jd, o.t = l.t) : o = new pe(), r) {
      if (i)
        if (o.t && typeof o.t == "string") {
          const a = Object.assign(gg(o.t, i), t);
          wt(r, a, i);
        } else t && wt(r, t, i);
      o.t = r;
    }
    return s.j[n] = o, o;
  }
};
const O = (n, e, t, i, s) => n.ta(e, t, i, s), q = (n, e, t, i, s) => n.tr(e, t, i, s), Tl = (n, e, t, i, s) => n.ts(e, t, i, s), w = (n, e, t, i, s) => n.tt(e, t, i, s), Fe = "WORD", gr = "UWORD", Vc = "ASCIINUMERICAL", Uc = "ALPHANUMERICAL", _n = "LOCALHOST", br = "TLD", yr = "UTLD", ii = "SCHEME", $t = "SLASH_SCHEME", no = "NUM", vr = "WS", io = "NL", hn = "OPENBRACE", fn = "CLOSEBRACE", wi = "OPENBRACKET", xi = "CLOSEBRACKET", Si = "OPENPAREN", Ci = "CLOSEPAREN", Mi = "OPENANGLEBRACKET", Ei = "CLOSEANGLEBRACKET", Ti = "FULLWIDTHLEFTPAREN", Ai = "FULLWIDTHRIGHTPAREN", _i = "LEFTCORNERBRACKET", Li = "RIGHTCORNERBRACKET", Ni = "LEFTWHITECORNERBRACKET", Oi = "RIGHTWHITECORNERBRACKET", Ri = "FULLWIDTHLESSTHAN", Ii = "FULLWIDTHGREATERTHAN", Di = "AMPERSAND", Pi = "APOSTROPHE", Bi = "ASTERISK", Xe = "AT", Hi = "BACKSLASH", zi = "BACKTICK", $i = "CARET", Ze = "COLON", so = "COMMA", Fi = "DOLLAR", Ae = "DOT", qi = "EQUALS", ro = "EXCLAMATION", ve = "HYPHEN", mn = "PERCENT", Vi = "PIPE", Ui = "PLUS", Wi = "POUND", gn = "QUERY", oo = "QUOTE", Wc = "FULLWIDTHMIDDLEDOT", lo = "SEMI", _e = "SLASH", bn = "TILDE", ji = "UNDERSCORE", jc = "EMOJI", Ki = "SYM";
var Kc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ALPHANUMERICAL: Uc,
  AMPERSAND: Di,
  APOSTROPHE: Pi,
  ASCIINUMERICAL: Vc,
  ASTERISK: Bi,
  AT: Xe,
  BACKSLASH: Hi,
  BACKTICK: zi,
  CARET: $i,
  CLOSEANGLEBRACKET: Ei,
  CLOSEBRACE: fn,
  CLOSEBRACKET: xi,
  CLOSEPAREN: Ci,
  COLON: Ze,
  COMMA: so,
  DOLLAR: Fi,
  DOT: Ae,
  EMOJI: jc,
  EQUALS: qi,
  EXCLAMATION: ro,
  FULLWIDTHGREATERTHAN: Ii,
  FULLWIDTHLEFTPAREN: Ti,
  FULLWIDTHLESSTHAN: Ri,
  FULLWIDTHMIDDLEDOT: Wc,
  FULLWIDTHRIGHTPAREN: Ai,
  HYPHEN: ve,
  LEFTCORNERBRACKET: _i,
  LEFTWHITECORNERBRACKET: Ni,
  LOCALHOST: _n,
  NL: io,
  NUM: no,
  OPENANGLEBRACKET: Mi,
  OPENBRACE: hn,
  OPENBRACKET: wi,
  OPENPAREN: Si,
  PERCENT: mn,
  PIPE: Vi,
  PLUS: Ui,
  POUND: Wi,
  QUERY: gn,
  QUOTE: oo,
  RIGHTCORNERBRACKET: Li,
  RIGHTWHITECORNERBRACKET: Oi,
  SCHEME: ii,
  SEMI: lo,
  SLASH: _e,
  SLASH_SCHEME: $t,
  SYM: Ki,
  TILDE: bn,
  TLD: br,
  UNDERSCORE: ji,
  UTLD: yr,
  UWORD: gr,
  WORD: Fe,
  WS: vr
});
const ze = /[a-z]/, en = new RegExp("\\p{L}", "u"), Bs = new RegExp("\\p{Emoji}", "u"), $e = /\d/, Hs = /\s/, Al = "\r", zs = `
`, bg = "️", yg = "‍", $s = "￼";
let Wn = null, jn = null;
function vg(n = []) {
  const e = {};
  pe.groups = e;
  const t = new pe();
  Wn == null && (Wn = _l(ug)), jn == null && (jn = _l(pg)), w(t, "'", Pi), w(t, "{", hn), w(t, "}", fn), w(t, "[", wi), w(t, "]", xi), w(t, "(", Si), w(t, ")", Ci), w(t, "<", Mi), w(t, ">", Ei), w(t, "（", Ti), w(t, "）", Ai), w(t, "「", _i), w(t, "」", Li), w(t, "『", Ni), w(t, "』", Oi), w(t, "＜", Ri), w(t, "＞", Ii), w(t, "&", Di), w(t, "*", Bi), w(t, "@", Xe), w(t, "`", zi), w(t, "^", $i), w(t, ":", Ze), w(t, ",", so), w(t, "$", Fi), w(t, ".", Ae), w(t, "=", qi), w(t, "!", ro), w(t, "-", ve), w(t, "%", mn), w(t, "|", Vi), w(t, "+", Ui), w(t, "#", Wi), w(t, "?", gn), w(t, '"', oo), w(t, "/", _e), w(t, ";", lo), w(t, "~", bn), w(t, "_", ji), w(t, "\\", Hi), w(t, "・", Wc);
  const i = q(t, $e, no, {
    [pr]: !0
  });
  q(i, $e, i);
  const s = q(i, ze, Vc, {
    [pn]: !0
  }), r = q(i, en, Uc, {
    [ln]: !0
  }), o = q(t, ze, Fe, {
    [hr]: !0
  });
  q(o, $e, s), q(o, ze, o), q(s, $e, s), q(s, ze, s);
  const l = q(t, en, gr, {
    [fr]: !0
  });
  q(l, ze), q(l, $e, r), q(l, en, l), q(r, $e, r), q(r, ze), q(r, en, r);
  const a = w(t, zs, io, {
    [Ps]: !0
  }), c = w(t, Al, vr, {
    [Ps]: !0
  }), d = q(t, Hs, vr, {
    [Ps]: !0
  });
  w(t, $s, d), w(c, zs, a), w(c, $s, d), q(c, Hs, d), w(d, Al), w(d, zs), q(d, Hs, d), w(d, $s, d);
  const u = q(t, Bs, jc, {
    [qc]: !0
  });
  w(u, "#"), q(u, Bs, u), w(u, bg, u);
  const p = w(u, yg);
  w(p, "#"), q(p, Bs, u);
  const h = [[ze, o], [$e, s]], f = [[ze, null], [en, l], [$e, r]];
  for (let m = 0; m < Wn.length; m++)
    Ke(t, Wn[m], br, Fe, h);
  for (let m = 0; m < jn.length; m++)
    Ke(t, jn[m], yr, gr, f);
  wt(br, {
    tld: !0,
    ascii: !0
  }, e), wt(yr, {
    utld: !0,
    alpha: !0
  }, e), Ke(t, "file", ii, Fe, h), Ke(t, "mailto", ii, Fe, h), Ke(t, "http", $t, Fe, h), Ke(t, "https", $t, Fe, h), Ke(t, "ftp", $t, Fe, h), Ke(t, "ftps", $t, Fe, h), wt(ii, {
    scheme: !0,
    ascii: !0
  }, e), wt($t, {
    slashscheme: !0,
    ascii: !0
  }, e), n = n.sort((m, g) => m[0] > g[0] ? 1 : -1);
  for (let m = 0; m < n.length; m++) {
    const g = n[m][0], v = n[m][1] ? {
      [hg]: !0
    } : {
      [fg]: !0
    };
    g.indexOf("-") >= 0 ? v[mr] = !0 : ze.test(g) ? $e.test(g) ? v[pn] = !0 : v[hr] = !0 : v[pr] = !0, Tl(t, g, g, v);
  }
  return Tl(t, "localhost", _n, {
    ascii: !0
  }), t.jd = new pe(Ki), {
    start: t,
    tokens: Object.assign({
      groups: e
    }, Kc)
  };
}
function Jc(n, e) {
  const t = kg(e.replace(/[A-Z]/g, (l) => l.toLowerCase())), i = t.length, s = [];
  let r = 0, o = 0;
  for (; o < i; ) {
    let l = n, a = null, c = 0, d = null, u = -1, p = -1;
    for (; o < i && (a = l.go(t[o])); )
      l = a, l.accepts() ? (u = 0, p = 0, d = l) : u >= 0 && (u += t[o].length, p++), c += t[o].length, r += t[o].length, o++;
    r -= u, o -= p, c -= u, s.push({
      t: d.t,
      // token type/name
      v: e.slice(r - c, r),
      // string value
      s: r - c,
      // start index
      e: r
      // end index (excluding)
    });
  }
  return s;
}
function kg(n) {
  const e = [], t = n.length;
  let i = 0;
  for (; i < t; ) {
    let s = n.charCodeAt(i), r, o = s < 55296 || s > 56319 || i + 1 === t || (r = n.charCodeAt(i + 1)) < 56320 || r > 57343 ? n[i] : n.slice(i, i + 2);
    e.push(o), i += o.length;
  }
  return e;
}
function Ke(n, e, t, i, s) {
  let r;
  const o = e.length;
  for (let l = 0; l < o - 1; l++) {
    const a = e[l];
    n.j[a] ? r = n.j[a] : (r = new pe(i), r.jr = s.slice(), n.j[a] = r), n = r;
  }
  return r = new pe(t), r.jr = s.slice(), n.j[e[o - 1]] = r, r;
}
function _l(n) {
  const e = [], t = [];
  let i = 0, s = "0123456789";
  for (; i < n.length; ) {
    let r = 0;
    for (; s.indexOf(n[i + r]) >= 0; )
      r++;
    if (r > 0) {
      e.push(t.join(""));
      for (let o = parseInt(n.substring(i, i + r), 10); o > 0; o--)
        t.pop();
      i += r;
    } else
      t.push(n[i]), i++;
  }
  return e;
}
const Ln = {
  defaultProtocol: "http",
  events: null,
  format: Ll,
  formatHref: Ll,
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
function ao(n, e = null) {
  let t = Object.assign({}, Ln);
  n && (t = Object.assign(t, n instanceof ao ? n.o : n));
  const i = t.ignoreTags, s = [];
  for (let r = 0; r < i.length; r++)
    s.push(i[r].toUpperCase());
  this.o = t, e && (this.defaultRender = e), this.ignoreTags = s;
}
ao.prototype = {
  o: Ln,
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
  get(n, e, t) {
    const i = e != null;
    let s = this.o[n];
    return s && (typeof s == "object" ? (s = t.t in s ? s[t.t] : Ln[n], typeof s == "function" && i && (s = s(e, t))) : typeof s == "function" && i && (s = s(e, t.t, t)), s);
  },
  /**
   * @template {keyof Opts} L
   * @param {L} key Name of options object to use
   * @param {string} [operator]
   * @param {MultiToken} [token]
   * @returns {Opts[L] | any}
   */
  getObj(n, e, t) {
    let i = this.o[n];
    return typeof i == "function" && e != null && (i = i(e, t.t, t)), i;
  },
  /**
   * Convert the given token to a rendered element that may be added to the
   * calling-interface's DOM
   * @param {MultiToken} token Token to render to an HTML element
   * @returns {any} Render result; e.g., HTML string, DOM element, React
   *   Component, etc.
   */
  render(n) {
    const e = n.render(this);
    return (this.get("render", null, n) || this.defaultRender)(e, n.t, n);
  }
};
function Ll(n) {
  return n;
}
function Gc(n, e) {
  this.t = "token", this.v = n, this.tk = e;
}
Gc.prototype = {
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
    const e = this.toString(), t = n.get("truncate", e, this), i = n.get("format", e, this);
    return t && i.length > t ? i.substring(0, t) + "…" : i;
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
  toObject(n = Ln.defaultProtocol) {
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
    const e = this, t = this.toHref(n.get("defaultProtocol")), i = n.get("formatHref", t, this), s = n.get("tagName", t, e), r = this.toFormattedString(n), o = {}, l = n.get("className", t, e), a = n.get("target", t, e), c = n.get("rel", t, e), d = n.getObj("attributes", t, e), u = n.getObj("events", t, e);
    return o.href = i, l && (o.class = l), a && (o.target = a), c && (o.rel = c), d && Object.assign(o, d), {
      tagName: s,
      attributes: o,
      content: r,
      eventListeners: u
    };
  }
};
function us(n, e) {
  class t extends Gc {
    constructor(s, r) {
      super(s, r), this.t = n;
    }
  }
  for (const i in e)
    t.prototype[i] = e[i];
  return t.t = n, t;
}
const Nl = us("email", {
  isLink: !0,
  toHref() {
    return "mailto:" + this.toString();
  }
}), Ol = us("text"), wg = us("nl"), Kn = us("url", {
  isLink: !0,
  /**
  	Lowercases relevant parts of the domain and adds the protocol if
  	required. Note that this will not escape unsafe HTML characters in the
  	URL.
  		@param {string} [scheme] default scheme (e.g., 'https')
  	@return {string} the full href
  */
  toHref(n = Ln.defaultProtocol) {
    return this.hasProtocol() ? this.v : `${n}://${this.v}`;
  },
  /**
   * Check whether this URL token has a protocol
   * @return {boolean}
   */
  hasProtocol() {
    const n = this.tk;
    return n.length >= 2 && n[0].t !== _n && n[1].t === Ze;
  }
}), ye = (n) => new pe(n);
function xg({
  groups: n
}) {
  const e = n.domain.concat([Di, Bi, Xe, Hi, zi, $i, Fi, qi, ve, no, mn, Vi, Ui, Wi, _e, Ki, bn, ji]), t = [Pi, Ze, so, Ae, ro, mn, gn, oo, lo, Mi, Ei, hn, fn, xi, wi, Si, Ci, Ti, Ai, _i, Li, Ni, Oi, Ri, Ii], i = [Di, Pi, Bi, Hi, zi, $i, Fi, qi, ve, hn, fn, mn, Vi, Ui, Wi, gn, _e, Ki, bn, ji], s = ye(), r = w(s, bn);
  O(r, i, r), O(r, n.domain, r);
  const o = ye(), l = ye(), a = ye();
  O(s, n.domain, o), O(s, n.scheme, l), O(s, n.slashscheme, a), O(o, i, r), O(o, n.domain, o);
  const c = w(o, Xe);
  w(r, Xe, c), w(l, Xe, c), w(a, Xe, c);
  const d = w(r, Ae);
  O(d, i, r), O(d, n.domain, r);
  const u = ye();
  O(c, n.domain, u), O(u, n.domain, u);
  const p = w(u, Ae);
  O(p, n.domain, u);
  const h = ye(Nl);
  O(p, n.tld, h), O(p, n.utld, h), w(c, _n, h);
  const f = w(u, ve);
  w(f, ve, f), O(f, n.domain, u), O(h, n.domain, u), w(h, Ae, p), w(h, ve, f);
  const m = w(h, Ze);
  O(m, n.numeric, Nl);
  const g = w(o, ve), b = w(o, Ae);
  w(g, ve, g), O(g, n.domain, o), O(b, i, r), O(b, n.domain, o);
  const v = ye(Kn);
  O(b, n.tld, v), O(b, n.utld, v), O(v, n.domain, o), O(v, i, r), w(v, Ae, b), w(v, ve, g), w(v, Xe, c);
  const k = w(v, Ze), M = ye(Kn);
  O(k, n.numeric, M);
  const x = ye(Kn), N = ye();
  O(x, e, x), O(x, t, N), O(N, e, x), O(N, t, N), w(v, _e, x), w(M, _e, x);
  const C = w(l, Ze), T = w(a, Ze), I = w(T, _e), Ce = w(I, _e);
  O(l, n.domain, o), w(l, Ae, b), w(l, ve, g), O(a, n.domain, o), w(a, Ae, b), w(a, ve, g), O(C, n.domain, x), w(C, _e, x), w(C, gn, x), O(Ce, n.domain, x), O(Ce, e, x), w(Ce, _e, x);
  const Ie = [
    [hn, fn],
    // {}
    [wi, xi],
    // []
    [Si, Ci],
    // ()
    [Mi, Ei],
    // <>
    [Ti, Ai],
    // （）
    [_i, Li],
    // 「」
    [Ni, Oi],
    // 『』
    [Ri, Ii]
    // ＜＞
  ];
  for (let H = 0; H < Ie.length; H++) {
    const [ce, De] = Ie[H], ft = w(x, ce);
    w(N, ce, ft), w(ft, De, x);
    const Pe = ye(Kn);
    O(ft, e, Pe);
    const Be = ye();
    O(ft, t), O(Pe, e, Pe), O(Pe, t, Be), O(Be, e, Pe), O(Be, t, Be), w(Pe, De, x), w(Be, De, x);
  }
  return w(s, _n, v), w(s, io, wg), {
    start: s,
    tokens: Kc
  };
}
function Sg(n, e, t) {
  let i = t.length, s = 0, r = [], o = [];
  for (; s < i; ) {
    let l = n, a = null, c = null, d = 0, u = null, p = -1;
    for (; s < i && !(a = l.go(t[s].t)); )
      o.push(t[s++]);
    for (; s < i && (c = a || l.go(t[s].t)); )
      a = null, l = c, l.accepts() ? (p = 0, u = l) : p >= 0 && p++, s++, d++;
    if (p < 0)
      s -= d, s < i && (o.push(t[s]), s++);
    else {
      o.length > 0 && (r.push(Fs(Ol, e, o)), o = []), s -= p, d -= p;
      const h = u.t, f = t.slice(s - d, s);
      r.push(Fs(h, e, f));
    }
  }
  return o.length > 0 && r.push(Fs(Ol, e, o)), r;
}
function Fs(n, e, t) {
  const i = t[0].s, s = t[t.length - 1].e, r = e.slice(i, s);
  return new n(r, t);
}
const Cg = typeof console < "u" && console && console.warn || (() => {
}), Mg = "until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.", $ = {
  scanner: null,
  parser: null,
  tokenQueue: [],
  pluginQueue: [],
  customSchemes: [],
  initialized: !1
};
function Eg() {
  return pe.groups = {}, $.scanner = null, $.parser = null, $.tokenQueue = [], $.pluginQueue = [], $.customSchemes = [], $.initialized = !1, $;
}
function Rl(n, e = !1) {
  if ($.initialized && Cg(`linkifyjs: already initialized - will not register custom scheme "${n}" ${Mg}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(n))
    throw new Error(`linkifyjs: incorrect scheme format.
1. Must only contain digits, lowercase ASCII letters or "-"
2. Cannot start or end with "-"
3. "-" cannot repeat`);
  $.customSchemes.push([n, e]);
}
function Tg() {
  $.scanner = vg($.customSchemes);
  for (let n = 0; n < $.tokenQueue.length; n++)
    $.tokenQueue[n][1]({
      scanner: $.scanner
    });
  $.parser = xg($.scanner.tokens);
  for (let n = 0; n < $.pluginQueue.length; n++)
    $.pluginQueue[n][1]({
      scanner: $.scanner,
      parser: $.parser
    });
  return $.initialized = !0, $;
}
function co(n) {
  return $.initialized || Tg(), Sg($.parser.start, n, Jc($.scanner.start, n));
}
co.scan = Jc;
function Yc(n, e = null, t = null) {
  if (e && typeof e == "object") {
    if (t)
      throw Error(`linkifyjs: Invalid link type ${e}; must be a string`);
    t = e, e = null;
  }
  const i = new ao(t), s = co(n), r = [];
  for (let o = 0; o < s.length; o++) {
    const l = s[o];
    l.isLink && (!e || l.t === e) && i.check(l) && r.push(l.toFormattedObject(i));
  }
  return r;
}
const uo = "[\0-   ᠎ -\u2029 　]", Ag = new RegExp(uo), _g = new RegExp(`${uo}$`), Lg = new RegExp(uo, "g");
function Ng(n) {
  return n.length === 1 ? n[0].isLink : n.length === 3 && n[1].isLink ? ["()", "[]"].includes(n[0].value + n[2].value) : !1;
}
function Og(n) {
  return new W({
    key: new J("autolink"),
    appendTransaction: (e, t, i) => {
      const s = e.some((c) => c.docChanged) && !t.doc.eq(i.doc), r = e.some((c) => c.getMeta("preventAutolink"));
      if (!s || r)
        return;
      const { tr: o } = i, l = kf(t.doc, [...e]);
      if (Tf(l).forEach(({ newRange: c }) => {
        const d = xf(i.doc, c, (h) => h.isTextblock);
        let u, p;
        if (d.length > 1)
          u = d[0], p = i.doc.textBetween(u.pos, u.pos + u.node.nodeSize, void 0, " ");
        else if (d.length) {
          const h = i.doc.textBetween(c.from, c.to, " ", " ");
          if (!_g.test(h))
            return;
          u = d[0], p = i.doc.textBetween(u.pos, c.to, void 0, " ");
        }
        if (u && p) {
          const h = p.split(Ag).filter(Boolean);
          if (h.length <= 0)
            return !1;
          const f = h[h.length - 1], m = u.pos + p.lastIndexOf(f);
          if (!f)
            return !1;
          const g = co(f).map((b) => b.toObject(n.defaultProtocol));
          if (!Ng(g))
            return !1;
          g.filter((b) => b.isLink).map((b) => ({
            ...b,
            from: m + b.start + 1,
            to: m + b.end + 1
          })).filter((b) => i.schema.marks.code ? !i.doc.rangeHasMark(b.from, b.to, i.schema.marks.code) : !0).filter((b) => n.validate(b.value)).filter((b) => n.shouldAutoLink(b.value)).forEach((b) => {
            eo(b.from, b.to, i.doc).some((v) => v.mark.type === n.type) || o.addMark(b.from, b.to, n.type.create({
              href: b.href
            }));
          });
        }
      }), !!o.steps.length)
        return o;
    }
  });
}
function Rg(n) {
  return new W({
    key: new J("handleClickLink"),
    props: {
      handleClick: (e, t, i) => {
        var s, r;
        if (i.button !== 0 || !e.editable)
          return !1;
        let o = i.target;
        const l = [];
        for (; o.nodeName !== "DIV"; )
          l.push(o), o = o.parentNode;
        if (!l.find((p) => p.nodeName === "A"))
          return !1;
        const a = Pc(e.state, n.type.name), c = i.target, d = (s = c == null ? void 0 : c.href) !== null && s !== void 0 ? s : a.href, u = (r = c == null ? void 0 : c.target) !== null && r !== void 0 ? r : a.target;
        return c && d ? (window.open(d, u), !0) : !1;
      }
    }
  });
}
function Ig(n) {
  return new W({
    key: new J("handlePasteLink"),
    props: {
      handlePaste: (e, t, i) => {
        const { state: s } = e, { selection: r } = s, { empty: o } = r;
        if (o)
          return !1;
        let l = "";
        i.content.forEach((c) => {
          l += c.textContent;
        });
        const a = Yc(l, { defaultProtocol: n.defaultProtocol }).find((c) => c.isLink && c.value === l);
        return !l || !a ? !1 : n.editor.commands.setMark(n.type, {
          href: a.href
        });
      }
    }
  });
}
function mt(n, e) {
  const t = [
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
  return e && e.forEach((i) => {
    const s = typeof i == "string" ? i : i.scheme;
    s && t.push(s);
  }), !n || n.replace(Lg, "").match(new RegExp(
    // eslint-disable-next-line no-useless-escape
    `^(?:(?:${t.join("|")}):|[^a-z]|[a-z0-9+.-]+(?:[^a-z+.-:]|$))`,
    "i"
  ));
}
const Dg = fe.create({
  name: "link",
  priority: 1e3,
  keepOnSplit: !1,
  exitable: !0,
  onCreate() {
    this.options.validate && !this.options.shouldAutoLink && (this.options.shouldAutoLink = this.options.validate, console.warn("The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.")), this.options.protocols.forEach((n) => {
      if (typeof n == "string") {
        Rl(n);
        return;
      }
      Rl(n.scheme, n.optionalSlashes);
    });
  },
  onDestroy() {
    Eg();
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
      isAllowedUri: (n, e) => !!mt(n, e.protocols),
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
          const e = n.getAttribute("href");
          return !e || !this.options.isAllowedUri(e, {
            defaultValidate: (t) => !!mt(t, this.options.protocols),
            protocols: this.options.protocols,
            defaultProtocol: this.options.defaultProtocol
          }) ? !1 : null;
        }
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return this.options.isAllowedUri(n.href, {
      defaultValidate: (e) => !!mt(e, this.options.protocols),
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
      setLink: (n) => ({ chain: e }) => {
        const { href: t } = n;
        return this.options.isAllowedUri(t, {
          defaultValidate: (i) => !!mt(i, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? e().setMark(this.name, n).setMeta("preventAutolink", !0).run() : !1;
      },
      toggleLink: (n) => ({ chain: e }) => {
        const { href: t } = n;
        return this.options.isAllowedUri(t, {
          defaultValidate: (i) => !!mt(i, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? e().toggleMark(this.name, n, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run() : !1;
      },
      unsetLink: () => ({ chain: n }) => n().unsetMark(this.name, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run()
    };
  },
  addPasteRules() {
    return [
      dt({
        find: (n) => {
          const e = [];
          if (n) {
            const { protocols: t, defaultProtocol: i } = this.options, s = Yc(n).filter((r) => r.isLink && this.options.isAllowedUri(r.value, {
              defaultValidate: (o) => !!mt(o, t),
              protocols: t,
              defaultProtocol: i
            }));
            s.length && s.forEach((r) => e.push({
              text: r.value,
              data: {
                href: r.href
              },
              index: r.start
            }));
          }
          return e;
        },
        type: this.type,
        getAttributes: (n) => {
          var e;
          return {
            href: (e = n.data) === null || e === void 0 ? void 0 : e.href
          };
        }
      })
    ];
  },
  addProseMirrorPlugins() {
    const n = [], { protocols: e, defaultProtocol: t } = this.options;
    return this.options.autolink && n.push(Og({
      type: this.type,
      defaultProtocol: this.options.defaultProtocol,
      validate: (i) => this.options.isAllowedUri(i, {
        defaultValidate: (s) => !!mt(s, e),
        protocols: e,
        defaultProtocol: t
      }),
      shouldAutoLink: this.options.shouldAutoLink
    })), this.options.openOnClick === !0 && n.push(Rg({
      type: this.type
    })), this.options.linkOnPaste && n.push(Ig({
      editor: this.editor,
      defaultProtocol: this.options.defaultProtocol,
      type: this.type
    })), n;
  }
}), Pg = K.create({
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
              const e = n.style.textAlign;
              return this.options.alignments.includes(e) ? e : this.options.defaultAlignment;
            },
            renderHTML: (n) => n.textAlign ? { style: `text-align: ${n.textAlign}` } : {}
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setTextAlign: (n) => ({ commands: e }) => this.options.alignments.includes(n) ? this.options.types.map((t) => e.updateAttributes(t, { textAlign: n })).every((t) => t) : !1,
      unsetTextAlign: () => ({ commands: n }) => this.options.types.map((e) => n.resetAttributes(e, "textAlign")).every((e) => e),
      toggleTextAlign: (n) => ({ editor: e, commands: t }) => this.options.alignments.includes(n) ? e.isActive({ textAlign: n }) ? t.unsetTextAlign() : t.setTextAlign(n) : !1
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
}), Bg = K.create({
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
      new W({
        key: new J("placeholder"),
        props: {
          decorations: ({ doc: n, selection: e }) => {
            const t = this.editor.isEditable || !this.options.showOnlyWhenEditable, { anchor: i } = e, s = [];
            if (!t)
              return null;
            const r = this.editor.isEmpty;
            return n.descendants((o, l) => {
              const a = i >= l && i <= l + o.nodeSize, c = !o.isLeaf && ds(o);
              if ((a || !this.options.showOnlyCurrent) && c) {
                const d = [this.options.emptyNodeClass];
                r && d.push(this.options.emptyEditorClass);
                const u = se.node(l, l + o.nodeSize, {
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
}), Hg = K.create({
  name: "characterCount",
  addOptions() {
    return {
      limit: null,
      mode: "textSize",
      textCounter: (n) => n.length,
      wordCounter: (n) => n.split(" ").filter((e) => e !== "").length
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
      const e = (n == null ? void 0 : n.node) || this.editor.state.doc;
      if (((n == null ? void 0 : n.mode) || this.options.mode) === "textSize") {
        const i = e.textBetween(0, e.content.size, void 0, " ");
        return this.options.textCounter(i);
      }
      return e.nodeSize;
    }, this.storage.words = (n) => {
      const e = (n == null ? void 0 : n.node) || this.editor.state.doc, t = e.textBetween(0, e.content.size, " ", " ");
      return this.options.wordCounter(t);
    };
  },
  addProseMirrorPlugins() {
    let n = !1;
    return [
      new W({
        key: new J("characterCount"),
        appendTransaction: (e, t, i) => {
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
        filterTransaction: (e, t) => {
          const i = this.options.limit;
          if (!e.docChanged || i === 0 || i === null || i === void 0)
            return !0;
          const s = this.storage.characters({ node: t.doc }), r = this.storage.characters({ node: e.doc });
          if (r <= i || s > i && r > i && r <= s)
            return !0;
          if (s > i && r > i && r > s || !e.getMeta("paste"))
            return !1;
          const l = e.selection.$head.pos, a = r - i, c = l - a, d = l;
          return e.deleteRange(c, d), !(this.storage.characters({ node: e.doc }) > i);
        }
      })
    ];
  }
}), zg = fe.create({
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
}), $g = fe.create({
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
}), Fg = (n) => {
  if (!n.children.length)
    return;
  const e = n.querySelectorAll("span");
  e && e.forEach((t) => {
    var i, s;
    const r = t.getAttribute("style"), o = (s = (i = t.parentElement) === null || i === void 0 ? void 0 : i.closest("span")) === null || s === void 0 ? void 0 : s.getAttribute("style");
    t.setAttribute("style", `${o};${r}`);
  });
}, qg = fe.create({
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
        getAttrs: (n) => n.hasAttribute("style") ? (this.options.mergeNestedSpanStyles && Fg(n), {}) : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["span", D(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ tr: n }) => {
        const { selection: e } = n;
        return n.doc.nodesBetween(e.from, e.to, (t, i) => {
          if (t.isTextblock)
            return !0;
          t.marks.filter((s) => s.type === this.type).some((s) => Object.values(s.attrs).some((r) => !!r)) || n.removeMark(i, i + t.nodeSize, this.type);
        }), !0;
      }
    };
  }
}), Vg = K.create({
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
              var e;
              return (e = n.style.color) === null || e === void 0 ? void 0 : e.replace(/['"]+/g, "");
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
      setColor: (n) => ({ chain: e }) => e().setMark("textStyle", { color: n }).run(),
      unsetColor: () => ({ chain: n }) => n().setMark("textStyle", { color: null }).removeEmptyTextStyle().run()
    };
  }
}), Ug = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))$/, Wg = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))/g, jg = fe.create({
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
      setHighlight: (n) => ({ commands: e }) => e.setMark(this.name, n),
      toggleHighlight: (n) => ({ commands: e }) => e.toggleMark(this.name, n),
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
      Nt({
        find: Ug,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: Wg,
        type: this.type
      })
    ];
  }
});
let kr, wr;
if (typeof WeakMap < "u") {
  let n = /* @__PURE__ */ new WeakMap();
  kr = (e) => n.get(e), wr = (e, t) => (n.set(e, t), t);
} else {
  const n = [];
  let t = 0;
  kr = (i) => {
    for (let s = 0; s < n.length; s += 2) if (n[s] == i) return n[s + 1];
  }, wr = (i, s) => (t == 10 && (t = 0), n[t++] = i, n[t++] = s);
}
var U = class {
  constructor(n, e, t, i) {
    this.width = n, this.height = e, this.map = t, this.problems = i;
  }
  findCell(n) {
    for (let e = 0; e < this.map.length; e++) {
      const t = this.map[e];
      if (t != n) continue;
      const i = e % this.width, s = e / this.width | 0;
      let r = i + 1, o = s + 1;
      for (let l = 1; r < this.width && this.map[e + l] == t; l++) r++;
      for (let l = 1; o < this.height && this.map[e + this.width * l] == t; l++) o++;
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
    for (let e = 0; e < this.map.length; e++) if (this.map[e] == n) return e % this.width;
    throw new RangeError(`No cell with offset ${n} found`);
  }
  nextCell(n, e, t) {
    const { left: i, right: s, top: r, bottom: o } = this.findCell(n);
    return e == "horiz" ? (t < 0 ? i == 0 : s == this.width) ? null : this.map[r * this.width + (t < 0 ? i - 1 : s)] : (t < 0 ? r == 0 : o == this.height) ? null : this.map[i + this.width * (t < 0 ? r - 1 : o)];
  }
  rectBetween(n, e) {
    const { left: t, right: i, top: s, bottom: r } = this.findCell(n), { left: o, right: l, top: a, bottom: c } = this.findCell(e);
    return {
      left: Math.min(t, o),
      top: Math.min(s, a),
      right: Math.max(i, l),
      bottom: Math.max(r, c)
    };
  }
  cellsInRect(n) {
    const e = [], t = {};
    for (let i = n.top; i < n.bottom; i++) for (let s = n.left; s < n.right; s++) {
      const r = i * this.width + s, o = this.map[r];
      t[o] || (t[o] = !0, !(s == n.left && s && this.map[r - 1] == o || i == n.top && i && this.map[r - this.width] == o) && e.push(o));
    }
    return e;
  }
  positionAt(n, e, t) {
    for (let i = 0, s = 0; ; i++) {
      const r = s + t.child(i).nodeSize;
      if (i == n) {
        let o = e + n * this.width;
        const l = (n + 1) * this.width;
        for (; o < l && this.map[o] < s; ) o++;
        return o == l ? r - 1 : this.map[o];
      }
      s = r;
    }
  }
  static get(n) {
    return kr(n) || wr(n, Kg(n));
  }
};
function Kg(n) {
  if (n.type.spec.tableRole != "table") throw new RangeError("Not a table node: " + n.type.name);
  const e = Jg(n), t = n.childCount, i = [];
  let s = 0, r = null;
  const o = [];
  for (let c = 0, d = e * t; c < d; c++) i[c] = 0;
  for (let c = 0, d = 0; c < t; c++) {
    const u = n.child(c);
    d++;
    for (let f = 0; ; f++) {
      for (; s < i.length && i[s] != 0; ) s++;
      if (f == u.childCount) break;
      const m = u.child(f), { colspan: g, rowspan: b, colwidth: v } = m.attrs;
      for (let k = 0; k < b; k++) {
        if (k + c >= t) {
          (r || (r = [])).push({
            type: "overlong_rowspan",
            pos: d,
            n: b - k
          });
          break;
        }
        const M = s + k * e;
        for (let x = 0; x < g; x++) {
          i[M + x] == 0 ? i[M + x] = d : (r || (r = [])).push({
            type: "collision",
            row: c,
            pos: d,
            n: g - x
          });
          const N = v && v[x];
          if (N) {
            const C = (M + x) % e * 2, T = o[C];
            T == null || T != N && o[C + 1] == 1 ? (o[C] = N, o[C + 1] = 1) : T == N && o[C + 1]++;
          }
        }
      }
      s += g, d += m.nodeSize;
    }
    const p = (c + 1) * e;
    let h = 0;
    for (; s < p; ) i[s++] == 0 && h++;
    h && (r || (r = [])).push({
      type: "missing",
      row: c,
      n: h
    }), d++;
  }
  (e === 0 || t === 0) && (r || (r = [])).push({ type: "zero_sized" });
  const l = new U(e, t, i, r);
  let a = !1;
  for (let c = 0; !a && c < o.length; c += 2) o[c] != null && o[c + 1] < t && (a = !0);
  return a && Gg(l, o, n), l;
}
function Jg(n) {
  let e = -1, t = !1;
  for (let i = 0; i < n.childCount; i++) {
    const s = n.child(i);
    let r = 0;
    if (t) for (let o = 0; o < i; o++) {
      const l = n.child(o);
      for (let a = 0; a < l.childCount; a++) {
        const c = l.child(a);
        o + c.attrs.rowspan > i && (r += c.attrs.colspan);
      }
    }
    for (let o = 0; o < s.childCount; o++) {
      const l = s.child(o);
      r += l.attrs.colspan, l.attrs.rowspan > 1 && (t = !0);
    }
    e == -1 ? e = r : e != r && (e = Math.max(e, r));
  }
  return e;
}
function Gg(n, e, t) {
  n.problems || (n.problems = []);
  const i = {};
  for (let s = 0; s < n.map.length; s++) {
    const r = n.map[s];
    if (i[r]) continue;
    i[r] = !0;
    const o = t.nodeAt(r);
    if (!o) throw new RangeError(`No cell with offset ${r} found`);
    let l = null;
    const a = o.attrs;
    for (let c = 0; c < a.colspan; c++) {
      const d = e[(s + c) % n.width * 2];
      d != null && (!a.colwidth || a.colwidth[c] != d) && ((l || (l = Yg(a)))[c] = d);
    }
    l && n.problems.unshift({
      type: "colwidth mismatch",
      pos: r,
      colwidth: l
    });
  }
}
function Yg(n) {
  if (n.colwidth) return n.colwidth.slice();
  const e = [];
  for (let t = 0; t < n.colspan; t++) e.push(0);
  return e;
}
function le(n) {
  let e = n.cached.tableNodeTypes;
  if (!e) {
    e = n.cached.tableNodeTypes = {};
    for (const t in n.nodes) {
      const i = n.nodes[t], s = i.spec.tableRole;
      s && (e[s] = i);
    }
  }
  return e;
}
const et = new J("selectingCells");
function Ot(n) {
  for (let e = n.depth - 1; e > 0; e--) if (n.node(e).type.spec.tableRole == "row") return n.node(0).resolve(n.before(e + 1));
  return null;
}
function Xg(n) {
  for (let e = n.depth; e > 0; e--) {
    const t = n.node(e).type.spec.tableRole;
    if (t === "cell" || t === "header_cell") return n.node(e);
  }
  return null;
}
function Ee(n) {
  const e = n.selection.$head;
  for (let t = e.depth; t > 0; t--) if (e.node(t).type.spec.tableRole == "row") return !0;
  return !1;
}
function ps(n) {
  const e = n.selection;
  if ("$anchorCell" in e && e.$anchorCell) return e.$anchorCell.pos > e.$headCell.pos ? e.$anchorCell : e.$headCell;
  if ("node" in e && e.node && e.node.type.spec.tableRole == "cell") return e.$anchor;
  const t = Ot(e.$head) || Qg(e.$head);
  if (t) return t;
  throw new RangeError(`No cell found around position ${e.head}`);
}
function Qg(n) {
  for (let e = n.nodeAfter, t = n.pos; e; e = e.firstChild, t++) {
    const i = e.type.spec.tableRole;
    if (i == "cell" || i == "header_cell") return n.doc.resolve(t);
  }
  for (let e = n.nodeBefore, t = n.pos; e; e = e.lastChild, t--) {
    const i = e.type.spec.tableRole;
    if (i == "cell" || i == "header_cell") return n.doc.resolve(t - e.nodeSize);
  }
}
function xr(n) {
  return n.parent.type.spec.tableRole == "row" && !!n.nodeAfter;
}
function Zg(n) {
  return n.node(0).resolve(n.pos + n.nodeAfter.nodeSize);
}
function po(n, e) {
  return n.depth == e.depth && n.pos >= e.start(-1) && n.pos <= e.end(-1);
}
function Xc(n, e, t) {
  const i = n.node(-1), s = U.get(i), r = n.start(-1), o = s.nextCell(n.pos - r, e, t);
  return o == null ? null : n.node(0).resolve(r + o);
}
function Rt(n, e, t = 1) {
  const i = {
    ...n,
    colspan: n.colspan - t
  };
  return i.colwidth && (i.colwidth = i.colwidth.slice(), i.colwidth.splice(e, t), i.colwidth.some((s) => s > 0) || (i.colwidth = null)), i;
}
function Qc(n, e, t = 1) {
  const i = {
    ...n,
    colspan: n.colspan + t
  };
  if (i.colwidth) {
    i.colwidth = i.colwidth.slice();
    for (let s = 0; s < t; s++) i.colwidth.splice(e, 0, 0);
  }
  return i;
}
function eb(n, e, t) {
  const i = le(e.type.schema).header_cell;
  for (let s = 0; s < n.height; s++) if (e.nodeAt(n.map[t + s * n.width]).type != i) return !1;
  return !0;
}
var z = class qe extends L {
  constructor(e, t = e) {
    const i = e.node(-1), s = U.get(i), r = e.start(-1), o = s.rectBetween(e.pos - r, t.pos - r), l = e.node(0), a = s.cellsInRect(o).filter((d) => d != t.pos - r);
    a.unshift(t.pos - r);
    const c = a.map((d) => {
      const u = i.nodeAt(d);
      if (!u) throw new RangeError(`No cell with offset ${d} found`);
      const p = r + d + 1;
      return new _a(l.resolve(p), l.resolve(p + u.content.size));
    });
    super(c[0].$from, c[0].$to, c), this.$anchorCell = e, this.$headCell = t;
  }
  map(e, t) {
    const i = e.resolve(t.map(this.$anchorCell.pos)), s = e.resolve(t.map(this.$headCell.pos));
    if (xr(i) && xr(s) && po(i, s)) {
      const r = this.$anchorCell.node(-1) != i.node(-1);
      return r && this.isRowSelection() ? qe.rowSelection(i, s) : r && this.isColSelection() ? qe.colSelection(i, s) : new qe(i, s);
    }
    return _.between(i, s);
  }
  content() {
    const e = this.$anchorCell.node(-1), t = U.get(e), i = this.$anchorCell.start(-1), s = t.rectBetween(this.$anchorCell.pos - i, this.$headCell.pos - i), r = {}, o = [];
    for (let a = s.top; a < s.bottom; a++) {
      const c = [];
      for (let d = a * t.width + s.left, u = s.left; u < s.right; u++, d++) {
        const p = t.map[d];
        if (r[p]) continue;
        r[p] = !0;
        const h = t.findCell(p);
        let f = e.nodeAt(p);
        if (!f) throw new RangeError(`No cell with offset ${p} found`);
        const m = s.left - h.left, g = h.right - s.right;
        if (m > 0 || g > 0) {
          let b = f.attrs;
          if (m > 0 && (b = Rt(b, 0, m)), g > 0 && (b = Rt(b, b.colspan - g, g)), h.left < s.left) {
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
      o.push(e.child(a).copy(y.from(c)));
    }
    const l = this.isColSelection() && this.isRowSelection() ? e : o;
    return new S(y.from(l), 1, 1);
  }
  replace(e, t = S.empty) {
    const i = e.steps.length, s = this.ranges;
    for (let o = 0; o < s.length; o++) {
      const { $from: l, $to: a } = s[o], c = e.mapping.slice(i);
      e.replace(c.map(l.pos), c.map(a.pos), o ? S.empty : t);
    }
    const r = L.findFrom(e.doc.resolve(e.mapping.slice(i).map(this.to)), -1);
    r && e.setSelection(r);
  }
  replaceWith(e, t) {
    this.replace(e, new S(y.from(t), 0, 0));
  }
  forEachCell(e) {
    const t = this.$anchorCell.node(-1), i = U.get(t), s = this.$anchorCell.start(-1), r = i.cellsInRect(i.rectBetween(this.$anchorCell.pos - s, this.$headCell.pos - s));
    for (let o = 0; o < r.length; o++) e(t.nodeAt(r[o]), s + r[o]);
  }
  isColSelection() {
    const e = this.$anchorCell.index(-1), t = this.$headCell.index(-1);
    if (Math.min(e, t) > 0) return !1;
    const i = e + this.$anchorCell.nodeAfter.attrs.rowspan, s = t + this.$headCell.nodeAfter.attrs.rowspan;
    return Math.max(i, s) == this.$headCell.node(-1).childCount;
  }
  static colSelection(e, t = e) {
    const i = e.node(-1), s = U.get(i), r = e.start(-1), o = s.findCell(e.pos - r), l = s.findCell(t.pos - r), a = e.node(0);
    return o.top <= l.top ? (o.top > 0 && (e = a.resolve(r + s.map[o.left])), l.bottom < s.height && (t = a.resolve(r + s.map[s.width * (s.height - 1) + l.right - 1]))) : (l.top > 0 && (t = a.resolve(r + s.map[l.left])), o.bottom < s.height && (e = a.resolve(r + s.map[s.width * (s.height - 1) + o.right - 1]))), new qe(e, t);
  }
  isRowSelection() {
    const e = this.$anchorCell.node(-1), t = U.get(e), i = this.$anchorCell.start(-1), s = t.colCount(this.$anchorCell.pos - i), r = t.colCount(this.$headCell.pos - i);
    if (Math.min(s, r) > 0) return !1;
    const o = s + this.$anchorCell.nodeAfter.attrs.colspan, l = r + this.$headCell.nodeAfter.attrs.colspan;
    return Math.max(o, l) == t.width;
  }
  eq(e) {
    return e instanceof qe && e.$anchorCell.pos == this.$anchorCell.pos && e.$headCell.pos == this.$headCell.pos;
  }
  static rowSelection(e, t = e) {
    const i = e.node(-1), s = U.get(i), r = e.start(-1), o = s.findCell(e.pos - r), l = s.findCell(t.pos - r), a = e.node(0);
    return o.left <= l.left ? (o.left > 0 && (e = a.resolve(r + s.map[o.top * s.width])), l.right < s.width && (t = a.resolve(r + s.map[s.width * (l.top + 1) - 1]))) : (l.left > 0 && (t = a.resolve(r + s.map[l.top * s.width])), o.right < s.width && (e = a.resolve(r + s.map[s.width * (o.top + 1) - 1]))), new qe(e, t);
  }
  toJSON() {
    return {
      type: "cell",
      anchor: this.$anchorCell.pos,
      head: this.$headCell.pos
    };
  }
  static fromJSON(e, t) {
    return new qe(e.resolve(t.anchor), e.resolve(t.head));
  }
  static create(e, t, i = t) {
    return new qe(e.resolve(t), e.resolve(i));
  }
  getBookmark() {
    return new tb(this.$anchorCell.pos, this.$headCell.pos);
  }
};
z.prototype.visible = !1;
L.jsonID("cell", z);
var tb = class Zc {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Zc(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    const t = e.resolve(this.anchor), i = e.resolve(this.head);
    return t.parent.type.spec.tableRole == "row" && i.parent.type.spec.tableRole == "row" && t.index() < t.parent.childCount && i.index() < i.parent.childCount && po(t, i) ? new z(t, i) : L.near(i, 1);
  }
};
function nb(n) {
  if (!(n.selection instanceof z)) return null;
  const e = [];
  return n.selection.forEachCell((t, i) => {
    e.push(se.node(i, i + t.nodeSize, { class: "selectedCell" }));
  }), F.create(n.doc, e);
}
function ib({ $from: n, $to: e }) {
  if (n.pos == e.pos || n.pos < e.pos - 6) return !1;
  let t = n.pos, i = e.pos, s = n.depth;
  for (; s >= 0 && !(n.after(s + 1) < n.end(s)); s--, t++) ;
  for (let r = e.depth; r >= 0 && !(e.before(r + 1) > e.start(r)); r--, i--) ;
  return t == i && /row|table/.test(n.node(s).type.spec.tableRole);
}
function sb({ $from: n, $to: e }) {
  let t, i;
  for (let s = n.depth; s > 0; s--) {
    const r = n.node(s);
    if (r.type.spec.tableRole === "cell" || r.type.spec.tableRole === "header_cell") {
      t = r;
      break;
    }
  }
  for (let s = e.depth; s > 0; s--) {
    const r = e.node(s);
    if (r.type.spec.tableRole === "cell" || r.type.spec.tableRole === "header_cell") {
      i = r;
      break;
    }
  }
  return t !== i && e.parentOffset === 0;
}
function rb(n, e, t) {
  const i = (e || n).selection, s = (e || n).doc;
  let r, o;
  if (i instanceof A && (o = i.node.type.spec.tableRole)) {
    if (o == "cell" || o == "header_cell") r = z.create(s, i.from);
    else if (o == "row") {
      const l = s.resolve(i.from + 1);
      r = z.rowSelection(l, l);
    } else if (!t) {
      const l = U.get(i.node), a = i.from + 1, c = a + l.map[l.width * l.height - 1];
      r = z.create(s, a + 1, c);
    }
  } else i instanceof _ && ib(i) ? r = _.create(s, i.from) : i instanceof _ && sb(i) && (r = _.create(s, i.$from.start(), i.$from.end()));
  return r && (e || (e = n.tr)).setSelection(r), e;
}
const ob = new J("fix-tables");
function ed(n, e, t, i) {
  const s = n.childCount, r = e.childCount;
  e: for (let o = 0, l = 0; o < r; o++) {
    const a = e.child(o);
    for (let c = l, d = Math.min(s, o + 3); c < d; c++) if (n.child(c) == a) {
      l = c + 1, t += a.nodeSize;
      continue e;
    }
    i(a, t), l < s && n.child(l).sameMarkup(a) ? ed(n.child(l), a, t + 1, i) : a.nodesBetween(0, a.content.size, i, t + 1), t += a.nodeSize;
  }
}
function td(n, e) {
  let t;
  const i = (s, r) => {
    s.type.spec.tableRole == "table" && (t = lb(n, s, r, t));
  };
  return e ? e.doc != n.doc && ed(e.doc, n.doc, 0, i) : n.doc.descendants(i), t;
}
function lb(n, e, t, i) {
  const s = U.get(e);
  if (!s.problems) return i;
  i || (i = n.tr);
  const r = [];
  for (let a = 0; a < s.height; a++) r.push(0);
  for (let a = 0; a < s.problems.length; a++) {
    const c = s.problems[a];
    if (c.type == "collision") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      const u = d.attrs;
      for (let p = 0; p < u.rowspan; p++) r[c.row + p] += c.n;
      i.setNodeMarkup(i.mapping.map(t + 1 + c.pos), null, Rt(u, u.colspan - c.n, c.n));
    } else if (c.type == "missing") r[c.row] += c.n;
    else if (c.type == "overlong_rowspan") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      i.setNodeMarkup(i.mapping.map(t + 1 + c.pos), null, {
        ...d.attrs,
        rowspan: d.attrs.rowspan - c.n
      });
    } else if (c.type == "colwidth mismatch") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      i.setNodeMarkup(i.mapping.map(t + 1 + c.pos), null, {
        ...d.attrs,
        colwidth: c.colwidth
      });
    } else if (c.type == "zero_sized") {
      const d = i.mapping.map(t);
      i.delete(d, d + e.nodeSize);
    }
  }
  let o, l;
  for (let a = 0; a < r.length; a++) r[a] && (o == null && (o = a), l = a);
  for (let a = 0, c = t + 1; a < s.height; a++) {
    const d = e.child(a), u = c + d.nodeSize, p = r[a];
    if (p > 0) {
      let h = "cell";
      d.firstChild && (h = d.firstChild.type.spec.tableRole);
      const f = [];
      for (let g = 0; g < p; g++) {
        const b = le(n.schema)[h].createAndFill();
        b && f.push(b);
      }
      const m = (a == 0 || o == a - 1) && l == a ? c + 1 : u - 1;
      i.insert(i.mapping.map(m), f);
    }
    c = u;
  }
  return i.setMeta(ob, { fixTables: !0 });
}
function Re(n) {
  const e = n.selection, t = ps(n), i = t.node(-1), s = t.start(-1), r = U.get(i);
  return {
    ...e instanceof z ? r.rectBetween(e.$anchorCell.pos - s, e.$headCell.pos - s) : r.findCell(t.pos - s),
    tableStart: s,
    map: r,
    table: i
  };
}
function nd(n, { map: e, tableStart: t, table: i }, s) {
  let r = s > 0 ? -1 : 0;
  eb(e, i, s + r) && (r = s == 0 || s == e.width ? null : 0);
  for (let o = 0; o < e.height; o++) {
    const l = o * e.width + s;
    if (s > 0 && s < e.width && e.map[l - 1] == e.map[l]) {
      const a = e.map[l], c = i.nodeAt(a);
      n.setNodeMarkup(n.mapping.map(t + a), null, Qc(c.attrs, s - e.colCount(a))), o += c.attrs.rowspan - 1;
    } else {
      const a = r == null ? le(i.type.schema).cell : i.nodeAt(e.map[l + r]).type, c = e.positionAt(o, s, i);
      n.insert(n.mapping.map(t + c), a.createAndFill());
    }
  }
  return n;
}
function ab(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(nd(n.tr, t, t.left));
  }
  return !0;
}
function cb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(nd(n.tr, t, t.right));
  }
  return !0;
}
function db(n, { map: e, table: t, tableStart: i }, s) {
  const r = n.mapping.maps.length;
  for (let o = 0; o < e.height; ) {
    const l = o * e.width + s, a = e.map[l], c = t.nodeAt(a), d = c.attrs;
    if (s > 0 && e.map[l - 1] == a || s < e.width - 1 && e.map[l + 1] == a) n.setNodeMarkup(n.mapping.slice(r).map(i + a), null, Rt(d, s - e.colCount(a)));
    else {
      const u = n.mapping.slice(r).map(i + a);
      n.delete(u, u + c.nodeSize);
    }
    o += d.rowspan;
  }
}
function ub(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n), i = n.tr;
    if (t.left == 0 && t.right == t.map.width) return !1;
    for (let s = t.right - 1; db(i, t, s), s != t.left; s--) {
      const r = t.tableStart ? i.doc.nodeAt(t.tableStart - 1) : i.doc;
      if (!r) throw new RangeError("No table found");
      t.table = r, t.map = U.get(r);
    }
    e(i);
  }
  return !0;
}
function pb(n, e, t) {
  var i;
  const s = le(e.type.schema).header_cell;
  for (let r = 0; r < n.width; r++) if (((i = e.nodeAt(n.map[r + t * n.width])) === null || i === void 0 ? void 0 : i.type) != s) return !1;
  return !0;
}
function id(n, { map: e, tableStart: t, table: i }, s) {
  let r = t;
  for (let c = 0; c < s; c++) r += i.child(c).nodeSize;
  const o = [];
  let l = s > 0 ? -1 : 0;
  pb(e, i, s + l) && (l = s == 0 || s == e.height ? null : 0);
  for (let c = 0, d = e.width * s; c < e.width; c++, d++) if (s > 0 && s < e.height && e.map[d] == e.map[d - e.width]) {
    const u = e.map[d], p = i.nodeAt(u).attrs;
    n.setNodeMarkup(t + u, null, {
      ...p,
      rowspan: p.rowspan + 1
    }), c += p.colspan - 1;
  } else {
    var a;
    const u = l == null ? le(i.type.schema).cell : (a = i.nodeAt(e.map[d + l * e.width])) === null || a === void 0 ? void 0 : a.type, p = u == null ? void 0 : u.createAndFill();
    p && o.push(p);
  }
  return n.insert(r, le(i.type.schema).row.create(null, o)), n;
}
function hb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(id(n.tr, t, t.top));
  }
  return !0;
}
function fb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(id(n.tr, t, t.bottom));
  }
  return !0;
}
function mb(n, { map: e, table: t, tableStart: i }, s) {
  let r = 0;
  for (let c = 0; c < s; c++) r += t.child(c).nodeSize;
  const o = r + t.child(s).nodeSize, l = n.mapping.maps.length;
  n.delete(r + i, o + i);
  const a = /* @__PURE__ */ new Set();
  for (let c = 0, d = s * e.width; c < e.width; c++, d++) {
    const u = e.map[d];
    if (!a.has(u)) {
      if (a.add(u), s > 0 && u == e.map[d - e.width]) {
        const p = t.nodeAt(u).attrs;
        n.setNodeMarkup(n.mapping.slice(l).map(u + i), null, {
          ...p,
          rowspan: p.rowspan - 1
        }), c += p.colspan - 1;
      } else if (s < e.height && u == e.map[d + e.width]) {
        const p = t.nodeAt(u), h = p.attrs, f = p.type.create({
          ...h,
          rowspan: p.attrs.rowspan - 1
        }, p.content), m = e.positionAt(s + 1, c, t);
        n.insert(n.mapping.slice(l).map(i + m), f), c += h.colspan - 1;
      }
    }
  }
}
function gb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n), i = n.tr;
    if (t.top == 0 && t.bottom == t.map.height) return !1;
    for (let s = t.bottom - 1; mb(i, t, s), s != t.top; s--) {
      const r = t.tableStart ? i.doc.nodeAt(t.tableStart - 1) : i.doc;
      if (!r) throw new RangeError("No table found");
      t.table = r, t.map = U.get(t.table);
    }
    e(i);
  }
  return !0;
}
function Il(n) {
  const e = n.content;
  return e.childCount == 1 && e.child(0).isTextblock && e.child(0).childCount == 0;
}
function bb({ width: n, height: e, map: t }, i) {
  let s = i.top * n + i.left, r = s, o = (i.bottom - 1) * n + i.left, l = s + (i.right - i.left - 1);
  for (let a = i.top; a < i.bottom; a++) {
    if (i.left > 0 && t[r] == t[r - 1] || i.right < n && t[l] == t[l + 1]) return !0;
    r += n, l += n;
  }
  for (let a = i.left; a < i.right; a++) {
    if (i.top > 0 && t[s] == t[s - n] || i.bottom < e && t[o] == t[o + n]) return !0;
    s++, o++;
  }
  return !1;
}
function Dl(n, e) {
  const t = n.selection;
  if (!(t instanceof z) || t.$anchorCell.pos == t.$headCell.pos) return !1;
  const i = Re(n), { map: s } = i;
  if (bb(s, i)) return !1;
  if (e) {
    const r = n.tr, o = {};
    let l = y.empty, a, c;
    for (let d = i.top; d < i.bottom; d++) for (let u = i.left; u < i.right; u++) {
      const p = s.map[d * s.width + u], h = i.table.nodeAt(p);
      if (!(o[p] || !h))
        if (o[p] = !0, a == null)
          a = p, c = h;
        else {
          Il(h) || (l = l.append(h.content));
          const f = r.mapping.map(p + i.tableStart);
          r.delete(f, f + h.nodeSize);
        }
    }
    if (a == null || c == null) return !0;
    if (r.setNodeMarkup(a + i.tableStart, null, {
      ...Qc(c.attrs, c.attrs.colspan, i.right - i.left - c.attrs.colspan),
      rowspan: i.bottom - i.top
    }), l.size > 0) {
      const d = a + 1 + c.content.size, u = Il(c) ? a + 1 : d;
      r.replaceWith(u + i.tableStart, d + i.tableStart, l);
    }
    r.setSelection(new z(r.doc.resolve(a + i.tableStart))), e(r);
  }
  return !0;
}
function Pl(n, e) {
  const t = le(n.schema);
  return yb(({ node: i }) => t[i.type.spec.tableRole])(n, e);
}
function yb(n) {
  return (e, t) => {
    const i = e.selection;
    let s, r;
    if (i instanceof z) {
      if (i.$anchorCell.pos != i.$headCell.pos) return !1;
      s = i.$anchorCell.nodeAfter, r = i.$anchorCell.pos;
    } else {
      var o;
      if (s = Xg(i.$from), !s) return !1;
      r = (o = Ot(i.$from)) === null || o === void 0 ? void 0 : o.pos;
    }
    if (s == null || r == null || s.attrs.colspan == 1 && s.attrs.rowspan == 1) return !1;
    if (t) {
      let l = s.attrs;
      const a = [], c = l.colwidth;
      l.rowspan > 1 && (l = {
        ...l,
        rowspan: 1
      }), l.colspan > 1 && (l = {
        ...l,
        colspan: 1
      });
      const d = Re(e), u = e.tr;
      for (let h = 0; h < d.right - d.left; h++) a.push(c ? {
        ...l,
        colwidth: c && c[h] ? [c[h]] : null
      } : l);
      let p;
      for (let h = d.top; h < d.bottom; h++) {
        let f = d.map.positionAt(h, d.left, d.table);
        h == d.top && (f += s.nodeSize);
        for (let m = d.left, g = 0; m < d.right; m++, g++)
          m == d.left && h == d.top || u.insert(p = u.mapping.map(f + d.tableStart, 1), n({
            node: s,
            row: h,
            col: m
          }).createAndFill(a[g]));
      }
      u.setNodeMarkup(r, n({
        node: s,
        row: d.top,
        col: d.left
      }), a[0]), i instanceof z && u.setSelection(new z(u.doc.resolve(i.$anchorCell.pos), p ? u.doc.resolve(p) : void 0)), t(u);
    }
    return !0;
  };
}
function vb(n, e) {
  return function(t, i) {
    if (!Ee(t)) return !1;
    const s = ps(t);
    if (s.nodeAfter.attrs[n] === e) return !1;
    if (i) {
      const r = t.tr;
      t.selection instanceof z ? t.selection.forEachCell((o, l) => {
        o.attrs[n] !== e && r.setNodeMarkup(l, null, {
          ...o.attrs,
          [n]: e
        });
      }) : r.setNodeMarkup(s.pos, null, {
        ...s.nodeAfter.attrs,
        [n]: e
      }), i(r);
    }
    return !0;
  };
}
function kb(n) {
  return function(e, t) {
    if (!Ee(e)) return !1;
    if (t) {
      const i = le(e.schema), s = Re(e), r = e.tr, o = s.map.cellsInRect(n == "column" ? {
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
      t(r);
    }
    return !0;
  };
}
function Bl(n, e, t) {
  const i = e.map.cellsInRect({
    left: 0,
    top: 0,
    right: n == "row" ? e.map.width : 1,
    bottom: n == "column" ? e.map.height : 1
  });
  for (let s = 0; s < i.length; s++) {
    const r = e.table.nodeAt(i[s]);
    if (r && r.type !== t.header_cell) return !1;
  }
  return !0;
}
function Nn(n, e) {
  return e = e || { useDeprecatedLogic: !1 }, e.useDeprecatedLogic ? kb(n) : function(t, i) {
    if (!Ee(t)) return !1;
    if (i) {
      const s = le(t.schema), r = Re(t), o = t.tr, l = Bl("row", r, s), a = Bl("column", r, s), c = (n === "column" ? l : n === "row" && a) ? 1 : 0, d = n == "column" ? {
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
Nn("row", { useDeprecatedLogic: !0 });
Nn("column", { useDeprecatedLogic: !0 });
const wb = Nn("cell", { useDeprecatedLogic: !0 });
function xb(n, e) {
  if (e < 0) {
    const t = n.nodeBefore;
    if (t) return n.pos - t.nodeSize;
    for (let i = n.index(-1) - 1, s = n.before(); i >= 0; i--) {
      const r = n.node(-1).child(i), o = r.lastChild;
      if (o) return s - 1 - o.nodeSize;
      s -= r.nodeSize;
    }
  } else {
    if (n.index() < n.parent.childCount - 1) return n.pos + n.nodeAfter.nodeSize;
    const t = n.node(-1);
    for (let i = n.indexAfter(-1), s = n.after(); i < t.childCount; i++) {
      const r = t.child(i);
      if (r.childCount) return s + 1;
      s += r.nodeSize;
    }
  }
  return null;
}
function Hl(n) {
  return function(e, t) {
    if (!Ee(e)) return !1;
    const i = xb(ps(e), n);
    if (i == null) return !1;
    if (t) {
      const s = e.doc.resolve(i);
      t(e.tr.setSelection(_.between(s, Zg(s))).scrollIntoView());
    }
    return !0;
  };
}
function Sb(n, e) {
  const t = n.selection.$anchor;
  for (let i = t.depth; i > 0; i--) if (t.node(i).type.spec.tableRole == "table")
    return e && e(n.tr.delete(t.before(i), t.after(i)).scrollIntoView()), !0;
  return !1;
}
function Jn(n, e) {
  const t = n.selection;
  if (!(t instanceof z)) return !1;
  if (e) {
    const i = n.tr, s = le(n.schema).cell.createAndFill().content;
    t.forEachCell((r, o) => {
      r.content.eq(s) || i.replace(i.mapping.map(o + 1), i.mapping.map(o + r.nodeSize - 1), new S(s, 0, 0));
    }), i.docChanged && e(i);
  }
  return !0;
}
function Cb(n) {
  if (n.size === 0) return null;
  let { content: e, openStart: t, openEnd: i } = n;
  for (; e.childCount == 1 && (t > 0 && i > 0 || e.child(0).type.spec.tableRole == "table"); )
    t--, i--, e = e.child(0).content;
  const s = e.child(0), r = s.type.spec.tableRole, o = s.type.schema, l = [];
  if (r == "row") for (let a = 0; a < e.childCount; a++) {
    let c = e.child(a).content;
    const d = a ? 0 : Math.max(0, t - 1), u = a < e.childCount - 1 ? 0 : Math.max(0, i - 1);
    (d || u) && (c = Sr(le(o).row, new S(c, d, u)).content), l.push(c);
  }
  else if (r == "cell" || r == "header_cell") l.push(t || i ? Sr(le(o).row, new S(e, t, i)).content : e);
  else return null;
  return Mb(o, l);
}
function Mb(n, e) {
  const t = [];
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    for (let o = r.childCount - 1; o >= 0; o--) {
      const { rowspan: l, colspan: a } = r.child(o).attrs;
      for (let c = s; c < s + l; c++) t[c] = (t[c] || 0) + a;
    }
  }
  let i = 0;
  for (let s = 0; s < t.length; s++) i = Math.max(i, t[s]);
  for (let s = 0; s < t.length; s++)
    if (s >= e.length && e.push(y.empty), t[s] < i) {
      const r = le(n).cell.createAndFill(), o = [];
      for (let l = t[s]; l < i; l++) o.push(r);
      e[s] = e[s].append(y.from(o));
    }
  return {
    height: e.length,
    width: i,
    rows: e
  };
}
function Sr(n, e) {
  const t = n.createAndFill();
  return new Rr(t).replace(0, t.content.size, e).doc;
}
function Eb({ width: n, height: e, rows: t }, i, s) {
  if (n != i) {
    const r = [], o = [];
    for (let l = 0; l < t.length; l++) {
      const a = t[l], c = [];
      for (let d = r[l] || 0, u = 0; d < i; u++) {
        let p = a.child(u % a.childCount);
        d + p.attrs.colspan > i && (p = p.type.createChecked(Rt(p.attrs, p.attrs.colspan, d + p.attrs.colspan - i), p.content)), c.push(p), d += p.attrs.colspan;
        for (let h = 1; h < p.attrs.rowspan; h++) r[l + h] = (r[l + h] || 0) + p.attrs.colspan;
      }
      o.push(y.from(c));
    }
    t = o, n = i;
  }
  if (e != s) {
    const r = [];
    for (let o = 0, l = 0; o < s; o++, l++) {
      const a = [], c = t[l % e];
      for (let d = 0; d < c.childCount; d++) {
        let u = c.child(d);
        o + u.attrs.rowspan > s && (u = u.type.create({
          ...u.attrs,
          rowspan: Math.max(1, s - u.attrs.rowspan)
        }, u.content)), a.push(u);
      }
      r.push(y.from(a));
    }
    t = r, e = s;
  }
  return {
    width: n,
    height: e,
    rows: t
  };
}
function Tb(n, e, t, i, s, r, o) {
  const l = n.doc.type.schema, a = le(l);
  let c, d;
  if (s > e.width) for (let u = 0, p = 0; u < e.height; u++) {
    const h = t.child(u);
    p += h.nodeSize;
    const f = [];
    let m;
    h.lastChild == null || h.lastChild.type == a.cell ? m = c || (c = a.cell.createAndFill()) : m = d || (d = a.header_cell.createAndFill());
    for (let g = e.width; g < s; g++) f.push(m);
    n.insert(n.mapping.slice(o).map(p - 1 + i), f);
  }
  if (r > e.height) {
    const u = [];
    for (let f = 0, m = (e.height - 1) * e.width; f < Math.max(e.width, s); f++) {
      const g = f >= e.width ? !1 : t.nodeAt(e.map[m + f]).type == a.header_cell;
      u.push(g ? d || (d = a.header_cell.createAndFill()) : c || (c = a.cell.createAndFill()));
    }
    const p = a.row.create(null, y.from(u)), h = [];
    for (let f = e.height; f < r; f++) h.push(p);
    n.insert(n.mapping.slice(o).map(i + t.nodeSize - 2), h);
  }
  return !!(c || d);
}
function zl(n, e, t, i, s, r, o, l) {
  if (o == 0 || o == e.height) return !1;
  let a = !1;
  for (let c = s; c < r; c++) {
    const d = o * e.width + c, u = e.map[d];
    if (e.map[d - e.width] == u) {
      a = !0;
      const p = t.nodeAt(u), { top: h, left: f } = e.findCell(u);
      n.setNodeMarkup(n.mapping.slice(l).map(u + i), null, {
        ...p.attrs,
        rowspan: o - h
      }), n.insert(n.mapping.slice(l).map(e.positionAt(o, f, t)), p.type.createAndFill({
        ...p.attrs,
        rowspan: h + p.attrs.rowspan - o
      })), c += p.attrs.colspan - 1;
    }
  }
  return a;
}
function $l(n, e, t, i, s, r, o, l) {
  if (o == 0 || o == e.width) return !1;
  let a = !1;
  for (let c = s; c < r; c++) {
    const d = c * e.width + o, u = e.map[d];
    if (e.map[d - 1] == u) {
      a = !0;
      const p = t.nodeAt(u), h = e.colCount(u), f = n.mapping.slice(l).map(u + i);
      n.setNodeMarkup(f, null, Rt(p.attrs, o - h, p.attrs.colspan - (o - h))), n.insert(f + p.nodeSize, p.type.createAndFill(Rt(p.attrs, 0, o - h))), c += p.attrs.rowspan - 1;
    }
  }
  return a;
}
function Fl(n, e, t, i, s) {
  let r = t ? n.doc.nodeAt(t - 1) : n.doc;
  if (!r) throw new Error("No table found");
  let o = U.get(r);
  const { top: l, left: a } = i, c = a + s.width, d = l + s.height, u = n.tr;
  let p = 0;
  function h() {
    if (r = t ? u.doc.nodeAt(t - 1) : u.doc, !r) throw new Error("No table found");
    o = U.get(r), p = u.mapping.maps.length;
  }
  Tb(u, o, r, t, c, d, p) && h(), zl(u, o, r, t, a, c, l, p) && h(), zl(u, o, r, t, a, c, d, p) && h(), $l(u, o, r, t, l, d, a, p) && h(), $l(u, o, r, t, l, d, c, p) && h();
  for (let f = l; f < d; f++) {
    const m = o.positionAt(f, a, r), g = o.positionAt(f, c, r);
    u.replace(u.mapping.slice(p).map(m + t), u.mapping.slice(p).map(g + t), new S(s.rows[f - l], 0, 0));
  }
  h(), u.setSelection(new z(u.doc.resolve(t + o.positionAt(l, a, r)), u.doc.resolve(t + o.positionAt(d - 1, c - 1, r)))), e(u);
}
const Ab = Ur({
  ArrowLeft: Gn("horiz", -1),
  ArrowRight: Gn("horiz", 1),
  ArrowUp: Gn("vert", -1),
  ArrowDown: Gn("vert", 1),
  "Shift-ArrowLeft": Yn("horiz", -1),
  "Shift-ArrowRight": Yn("horiz", 1),
  "Shift-ArrowUp": Yn("vert", -1),
  "Shift-ArrowDown": Yn("vert", 1),
  Backspace: Jn,
  "Mod-Backspace": Jn,
  Delete: Jn,
  "Mod-Delete": Jn
});
function si(n, e, t) {
  return t.eq(n.selection) ? !1 : (e && e(n.tr.setSelection(t).scrollIntoView()), !0);
}
function Gn(n, e) {
  return (t, i, s) => {
    if (!s) return !1;
    const r = t.selection;
    if (r instanceof z) return si(t, i, L.near(r.$headCell, e));
    if (n != "horiz" && !r.empty) return !1;
    const o = sd(s, n, e);
    if (o == null) return !1;
    if (n == "horiz") return si(t, i, L.near(t.doc.resolve(r.head + e), e));
    {
      const l = t.doc.resolve(o), a = Xc(l, n, e);
      let c;
      return a ? c = L.near(a, 1) : e < 0 ? c = L.near(t.doc.resolve(l.before(-1)), -1) : c = L.near(t.doc.resolve(l.after(-1)), 1), si(t, i, c);
    }
  };
}
function Yn(n, e) {
  return (t, i, s) => {
    if (!s) return !1;
    const r = t.selection;
    let o;
    if (r instanceof z) o = r;
    else {
      const a = sd(s, n, e);
      if (a == null) return !1;
      o = new z(t.doc.resolve(a));
    }
    const l = Xc(o.$headCell, n, e);
    return l ? si(t, i, new z(o.$anchorCell, l)) : !1;
  };
}
function _b(n, e) {
  const t = n.state.doc, i = Ot(t.resolve(e));
  return i ? (n.dispatch(n.state.tr.setSelection(new z(i))), !0) : !1;
}
function Lb(n, e, t) {
  if (!Ee(n.state)) return !1;
  let i = Cb(t);
  const s = n.state.selection;
  if (s instanceof z) {
    i || (i = {
      width: 1,
      height: 1,
      rows: [y.from(Sr(le(n.state.schema).cell, t))]
    });
    const r = s.$anchorCell.node(-1), o = s.$anchorCell.start(-1), l = U.get(r).rectBetween(s.$anchorCell.pos - o, s.$headCell.pos - o);
    return i = Eb(i, l.right - l.left, l.bottom - l.top), Fl(n.state, n.dispatch, o, l, i), !0;
  } else if (i) {
    const r = ps(n.state), o = r.start(-1);
    return Fl(n.state, n.dispatch, o, U.get(r.node(-1)).findCell(r.pos - o), i), !0;
  } else return !1;
}
function Nb(n, e) {
  var t;
  if (e.button != 0 || e.ctrlKey || e.metaKey) return;
  const i = ql(n, e.target);
  let s;
  if (e.shiftKey && n.state.selection instanceof z)
    r(n.state.selection.$anchorCell, e), e.preventDefault();
  else if (e.shiftKey && i && (s = Ot(n.state.selection.$anchor)) != null && ((t = qs(n, e)) === null || t === void 0 ? void 0 : t.pos) != s.pos)
    r(s, e), e.preventDefault();
  else if (!i) return;
  function r(a, c) {
    let d = qs(n, c);
    const u = et.getState(n.state) == null;
    if (!d || !po(a, d)) if (u) d = a;
    else return;
    const p = new z(a, d);
    if (u || !n.state.selection.eq(p)) {
      const h = n.state.tr.setSelection(p);
      u && h.setMeta(et, a.pos), n.dispatch(h);
    }
  }
  function o() {
    n.root.removeEventListener("mouseup", o), n.root.removeEventListener("dragstart", o), n.root.removeEventListener("mousemove", l), et.getState(n.state) != null && n.dispatch(n.state.tr.setMeta(et, -1));
  }
  function l(a) {
    const c = a, d = et.getState(n.state);
    let u;
    if (d != null) u = n.state.doc.resolve(d);
    else if (ql(n, c.target) != i && (u = qs(n, e), !u))
      return o();
    u && r(u, c);
  }
  n.root.addEventListener("mouseup", o), n.root.addEventListener("dragstart", o), n.root.addEventListener("mousemove", l);
}
function sd(n, e, t) {
  if (!(n.state.selection instanceof _)) return null;
  const { $head: i } = n.state.selection;
  for (let s = i.depth - 1; s >= 0; s--) {
    const r = i.node(s);
    if ((t < 0 ? i.index(s) : i.indexAfter(s)) != (t < 0 ? 0 : r.childCount)) return null;
    if (r.type.spec.tableRole == "cell" || r.type.spec.tableRole == "header_cell") {
      const o = i.before(s), l = e == "vert" ? t > 0 ? "down" : "up" : t > 0 ? "right" : "left";
      return n.endOfTextblock(l) ? o : null;
    }
  }
  return null;
}
function ql(n, e) {
  for (; e && e != n.dom; e = e.parentNode) if (e.nodeName == "TD" || e.nodeName == "TH") return e;
  return null;
}
function qs(n, e) {
  const t = n.posAtCoords({
    left: e.clientX,
    top: e.clientY
  });
  if (!t) return null;
  let { inside: i, pos: s } = t;
  return i >= 0 && Ot(n.state.doc.resolve(i)) || Ot(n.state.doc.resolve(s));
}
var Ob = class {
  constructor(e, t) {
    this.node = e, this.defaultCellMinWidth = t, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.table.style.setProperty("--default-cell-min-width", `${t}px`), this.colgroup = this.table.appendChild(document.createElement("colgroup")), Cr(e, this.colgroup, this.table, t), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(e) {
    return e.type != this.node.type ? !1 : (this.node = e, Cr(e, this.colgroup, this.table, this.defaultCellMinWidth), !0);
  }
  ignoreMutation(e) {
    return e.type == "attributes" && (e.target == this.table || this.colgroup.contains(e.target));
  }
};
function Cr(n, e, t, i, s, r) {
  let o = 0, l = !0, a = e.firstChild;
  const c = n.firstChild;
  if (c) {
    for (let u = 0, p = 0; u < c.childCount; u++) {
      const { colspan: h, colwidth: f } = c.child(u).attrs;
      for (let m = 0; m < h; m++, p++) {
        const g = s == p ? r : f && f[m], b = g ? g + "px" : "";
        if (o += g || i, g || (l = !1), a)
          a.style.width != b && (a.style.width = b), a = a.nextSibling;
        else {
          const v = document.createElement("col");
          v.style.width = b, e.appendChild(v);
        }
      }
    }
    for (; a; ) {
      var d;
      const u = a.nextSibling;
      (d = a.parentNode) === null || d === void 0 || d.removeChild(a), a = u;
    }
    l ? (t.style.width = o + "px", t.style.minWidth = "") : (t.style.width = "", t.style.minWidth = o + "px");
  }
}
const ge = new J("tableColumnResizing");
function Rb({ handleWidth: n = 5, cellMinWidth: e = 25, defaultCellMinWidth: t = 100, View: i = Ob, lastColumnResizable: s = !0 } = {}) {
  const r = new W({
    key: ge,
    state: {
      init(o, l) {
        var a;
        const c = (a = r.spec) === null || a === void 0 || (a = a.props) === null || a === void 0 ? void 0 : a.nodeViews, d = le(l.schema).table.name;
        return i && c && (c[d] = (u, p) => new i(u, t, p)), new Ib(-1, !1);
      },
      apply(o, l) {
        return l.apply(o);
      }
    },
    props: {
      attributes: (o) => {
        const l = ge.getState(o);
        return l && l.activeHandle > -1 ? { class: "resize-cursor" } : {};
      },
      handleDOMEvents: {
        mousemove: (o, l) => {
          Db(o, l, n, s);
        },
        mouseleave: (o) => {
          Pb(o);
        },
        mousedown: (o, l) => {
          Bb(o, l, e, t);
        }
      },
      decorations: (o) => {
        const l = ge.getState(o);
        if (l && l.activeHandle > -1) return qb(o, l.activeHandle);
      },
      nodeViews: {}
    }
  });
  return r;
}
var Ib = class ri {
  constructor(e, t) {
    this.activeHandle = e, this.dragging = t;
  }
  apply(e) {
    const t = this, i = e.getMeta(ge);
    if (i && i.setHandle != null) return new ri(i.setHandle, !1);
    if (i && i.setDragging !== void 0) return new ri(t.activeHandle, i.setDragging);
    if (t.activeHandle > -1 && e.docChanged) {
      let s = e.mapping.map(t.activeHandle, -1);
      return xr(e.doc.resolve(s)) || (s = -1), new ri(s, t.dragging);
    }
    return t;
  }
};
function Db(n, e, t, i) {
  if (!n.editable) return;
  const s = ge.getState(n.state);
  if (s && !s.dragging) {
    const r = zb(e.target);
    let o = -1;
    if (r) {
      const { left: l, right: a } = r.getBoundingClientRect();
      e.clientX - l <= t ? o = Vl(n, e, "left", t) : a - e.clientX <= t && (o = Vl(n, e, "right", t));
    }
    if (o != s.activeHandle) {
      if (!i && o !== -1) {
        const l = n.state.doc.resolve(o), a = l.node(-1), c = U.get(a), d = l.start(-1);
        if (c.colCount(l.pos - d) + l.nodeAfter.attrs.colspan - 1 == c.width - 1) return;
      }
      rd(n, o);
    }
  }
}
function Pb(n) {
  if (!n.editable) return;
  const e = ge.getState(n.state);
  e && e.activeHandle > -1 && !e.dragging && rd(n, -1);
}
function Bb(n, e, t, i) {
  var s;
  if (!n.editable) return !1;
  const r = (s = n.dom.ownerDocument.defaultView) !== null && s !== void 0 ? s : window, o = ge.getState(n.state);
  if (!o || o.activeHandle == -1 || o.dragging) return !1;
  const l = n.state.doc.nodeAt(o.activeHandle), a = Hb(n, o.activeHandle, l.attrs);
  n.dispatch(n.state.tr.setMeta(ge, { setDragging: {
    startX: e.clientX,
    startWidth: a
  } }));
  function c(u) {
    r.removeEventListener("mouseup", c), r.removeEventListener("mousemove", d);
    const p = ge.getState(n.state);
    p != null && p.dragging && ($b(n, p.activeHandle, Ul(p.dragging, u, t)), n.dispatch(n.state.tr.setMeta(ge, { setDragging: null })));
  }
  function d(u) {
    if (!u.which) return c(u);
    const p = ge.getState(n.state);
    if (p && p.dragging) {
      const h = Ul(p.dragging, u, t);
      Wl(n, p.activeHandle, h, i);
    }
  }
  return Wl(n, o.activeHandle, a, i), r.addEventListener("mouseup", c), r.addEventListener("mousemove", d), e.preventDefault(), !0;
}
function Hb(n, e, { colspan: t, colwidth: i }) {
  const s = i && i[i.length - 1];
  if (s) return s;
  const r = n.domAtPos(e);
  let o = r.node.childNodes[r.offset].offsetWidth, l = t;
  if (i)
    for (let a = 0; a < t; a++) i[a] && (o -= i[a], l--);
  return o / l;
}
function zb(n) {
  for (; n && n.nodeName != "TD" && n.nodeName != "TH"; ) n = n.classList && n.classList.contains("ProseMirror") ? null : n.parentNode;
  return n;
}
function Vl(n, e, t, i) {
  const s = t == "right" ? -i : i, r = n.posAtCoords({
    left: e.clientX + s,
    top: e.clientY
  });
  if (!r) return -1;
  const { pos: o } = r, l = Ot(n.state.doc.resolve(o));
  if (!l) return -1;
  if (t == "right") return l.pos;
  const a = U.get(l.node(-1)), c = l.start(-1), d = a.map.indexOf(l.pos - c);
  return d % a.width == 0 ? -1 : c + a.map[d - 1];
}
function Ul(n, e, t) {
  const i = e.clientX - n.startX;
  return Math.max(t, n.startWidth + i);
}
function rd(n, e) {
  n.dispatch(n.state.tr.setMeta(ge, { setHandle: e }));
}
function $b(n, e, t) {
  const i = n.state.doc.resolve(e), s = i.node(-1), r = U.get(s), o = i.start(-1), l = r.colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1, a = n.state.tr;
  for (let c = 0; c < r.height; c++) {
    const d = c * r.width + l;
    if (c && r.map[d] == r.map[d - r.width]) continue;
    const u = r.map[d], p = s.nodeAt(u).attrs, h = p.colspan == 1 ? 0 : l - r.colCount(u);
    if (p.colwidth && p.colwidth[h] == t) continue;
    const f = p.colwidth ? p.colwidth.slice() : Fb(p.colspan);
    f[h] = t, a.setNodeMarkup(o + u, null, {
      ...p,
      colwidth: f
    });
  }
  a.docChanged && n.dispatch(a);
}
function Wl(n, e, t, i) {
  const s = n.state.doc.resolve(e), r = s.node(-1), o = s.start(-1), l = U.get(r).colCount(s.pos - o) + s.nodeAfter.attrs.colspan - 1;
  let a = n.domAtPos(s.start(-1)).node;
  for (; a && a.nodeName != "TABLE"; ) a = a.parentNode;
  a && Cr(r, a.firstChild, a, i, l, t);
}
function Fb(n) {
  return Array(n).fill(0);
}
function qb(n, e) {
  const t = [], i = n.doc.resolve(e), s = i.node(-1);
  if (!s) return F.empty;
  const r = U.get(s), o = i.start(-1), l = r.colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1;
  for (let c = 0; c < r.height; c++) {
    const d = l + c * r.width;
    if ((l == r.width - 1 || r.map[d] != r.map[d + 1]) && (c == 0 || r.map[d] != r.map[d - r.width])) {
      var a;
      const u = r.map[d], p = o + u + s.nodeAt(u).nodeSize - 1, h = document.createElement("div");
      h.className = "column-resize-handle", !((a = ge.getState(n)) === null || a === void 0) && a.dragging && t.push(se.node(o + u, o + u + s.nodeAt(u).nodeSize, { class: "column-resize-dragging" })), t.push(se.widget(p, h));
    }
  }
  return F.create(n.doc, t);
}
function Vb({ allowTableNodeSelection: n = !1 } = {}) {
  return new W({
    key: et,
    state: {
      init() {
        return null;
      },
      apply(e, t) {
        const i = e.getMeta(et);
        if (i != null) return i == -1 ? null : i;
        if (t == null || !e.docChanged) return t;
        const { deleted: s, pos: r } = e.mapping.mapResult(t);
        return s ? null : r;
      }
    },
    props: {
      decorations: nb,
      handleDOMEvents: { mousedown: Nb },
      createSelectionBetween(e) {
        return et.getState(e.state) != null ? e.state.selection : null;
      },
      handleTripleClick: _b,
      handleKeyDown: Ab,
      handlePaste: Lb
    },
    appendTransaction(e, t, i) {
      return rb(i, td(i, t), n);
    }
  });
}
function Mr(n, e) {
  return e ? ["width", `${Math.max(e, n)}px`] : ["min-width", `${n}px`];
}
function jl(n, e, t, i, s, r) {
  var o;
  let l = 0, a = !0, c = e.firstChild;
  const d = n.firstChild;
  if (d !== null)
    for (let u = 0, p = 0; u < d.childCount; u += 1) {
      const { colspan: h, colwidth: f } = d.child(u).attrs;
      for (let m = 0; m < h; m += 1, p += 1) {
        const g = s === p ? r : f && f[m], b = g ? `${g}px` : "";
        if (l += g || i, g || (a = !1), c) {
          if (c.style.width !== b) {
            const [v, k] = Mr(i, g);
            c.style.setProperty(v, k);
          }
          c = c.nextSibling;
        } else {
          const v = document.createElement("col"), [k, M] = Mr(i, g);
          v.style.setProperty(k, M), e.appendChild(v);
        }
      }
    }
  for (; c; ) {
    const u = c.nextSibling;
    (o = c.parentNode) === null || o === void 0 || o.removeChild(c), c = u;
  }
  a ? (t.style.width = `${l}px`, t.style.minWidth = "") : (t.style.width = "", t.style.minWidth = `${l}px`);
}
class Ub {
  constructor(e, t) {
    this.node = e, this.cellMinWidth = t, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.colgroup = this.table.appendChild(document.createElement("colgroup")), jl(e, this.colgroup, this.table, t), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(e) {
    return e.type !== this.node.type ? !1 : (this.node = e, jl(e, this.colgroup, this.table, this.cellMinWidth), !0);
  }
  ignoreMutation(e) {
    return e.type === "attributes" && (e.target === this.table || this.colgroup.contains(e.target));
  }
}
function Wb(n, e, t, i) {
  let s = 0, r = !0;
  const o = [], l = n.firstChild;
  if (!l)
    return {};
  for (let u = 0, p = 0; u < l.childCount; u += 1) {
    const { colspan: h, colwidth: f } = l.child(u).attrs;
    for (let m = 0; m < h; m += 1, p += 1) {
      const g = t === p ? i : f && f[m];
      s += g || e, g || (r = !1);
      const [b, v] = Mr(e, g);
      o.push([
        "col",
        { style: `${b}: ${v}` }
      ]);
    }
  }
  const a = r ? `${s}px` : "", c = r ? "" : `${s}px`;
  return { colgroup: ["colgroup", {}, ...o], tableWidth: a, tableMinWidth: c };
}
function Kl(n, e) {
  return n.createAndFill();
}
function jb(n) {
  if (n.cached.tableNodeTypes)
    return n.cached.tableNodeTypes;
  const e = {};
  return Object.keys(n.nodes).forEach((t) => {
    const i = n.nodes[t];
    i.spec.tableRole && (e[i.spec.tableRole] = i);
  }), n.cached.tableNodeTypes = e, e;
}
function Kb(n, e, t, i, s) {
  const r = jb(n), o = [], l = [];
  for (let c = 0; c < t; c += 1) {
    const d = Kl(r.cell);
    if (d && l.push(d), i) {
      const u = Kl(r.header_cell);
      u && o.push(u);
    }
  }
  const a = [];
  for (let c = 0; c < e; c += 1)
    a.push(r.row.createChecked(null, i && c === 0 ? o : l));
  return r.table.createChecked(null, a);
}
function Jb(n) {
  return n instanceof z;
}
const Xn = ({ editor: n }) => {
  const { selection: e } = n.state;
  if (!Jb(e))
    return !1;
  let t = 0;
  const i = Dc(e.ranges[0].$from, (r) => r.type.name === "table");
  return i == null || i.node.descendants((r) => {
    if (r.type.name === "table")
      return !1;
    ["tableCell", "tableHeader"].includes(r.type.name) && (t += 1);
  }), t === e.ranges.length ? (n.commands.deleteTable(), !0) : !1;
}, Gb = B.create({
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
      View: Ub,
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const { colgroup: t, tableWidth: i, tableMinWidth: s } = Wb(n, this.options.cellMinWidth), r = [
      "table",
      D(this.options.HTMLAttributes, e, {
        style: i ? `width: ${i}` : `min-width: ${s}`
      }),
      t,
      ["tbody", 0]
    ];
    return this.options.renderWrapper ? ["div", { class: "tableWrapper" }, r] : r;
  },
  addCommands() {
    return {
      insertTable: ({ rows: n = 3, cols: e = 3, withHeaderRow: t = !0 } = {}) => ({ tr: i, dispatch: s, editor: r }) => {
        const o = Kb(r.schema, n, e, t);
        if (s) {
          const l = i.selection.from + 1;
          i.replaceSelectionWith(o).scrollIntoView().setSelection(_.near(i.doc.resolve(l)));
        }
        return !0;
      },
      addColumnBefore: () => ({ state: n, dispatch: e }) => ab(n, e),
      addColumnAfter: () => ({ state: n, dispatch: e }) => cb(n, e),
      deleteColumn: () => ({ state: n, dispatch: e }) => ub(n, e),
      addRowBefore: () => ({ state: n, dispatch: e }) => hb(n, e),
      addRowAfter: () => ({ state: n, dispatch: e }) => fb(n, e),
      deleteRow: () => ({ state: n, dispatch: e }) => gb(n, e),
      deleteTable: () => ({ state: n, dispatch: e }) => Sb(n, e),
      mergeCells: () => ({ state: n, dispatch: e }) => Dl(n, e),
      splitCell: () => ({ state: n, dispatch: e }) => Pl(n, e),
      toggleHeaderColumn: () => ({ state: n, dispatch: e }) => Nn("column")(n, e),
      toggleHeaderRow: () => ({ state: n, dispatch: e }) => Nn("row")(n, e),
      toggleHeaderCell: () => ({ state: n, dispatch: e }) => wb(n, e),
      mergeOrSplit: () => ({ state: n, dispatch: e }) => Dl(n, e) ? !0 : Pl(n, e),
      setCellAttribute: (n, e) => ({ state: t, dispatch: i }) => vb(n, e)(t, i),
      goToNextCell: () => ({ state: n, dispatch: e }) => Hl(1)(n, e),
      goToPreviousCell: () => ({ state: n, dispatch: e }) => Hl(-1)(n, e),
      fixTables: () => ({ state: n, dispatch: e }) => (e && td(n), !0),
      setCellSelection: (n) => ({ tr: e, dispatch: t }) => {
        if (t) {
          const i = z.create(e.doc, n.anchorCell, n.headCell);
          e.setSelection(i);
        }
        return !0;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.goToNextCell() ? !0 : this.editor.can().addRowAfter() ? this.editor.chain().addRowAfter().goToNextCell().run() : !1,
      "Shift-Tab": () => this.editor.commands.goToPreviousCell(),
      Backspace: Xn,
      "Mod-Backspace": Xn,
      Delete: Xn,
      "Mod-Delete": Xn
    };
  },
  addProseMirrorPlugins() {
    return [
      ...this.options.resizable && this.editor.isEditable ? [
        Rb({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          defaultCellMinWidth: this.options.cellMinWidth,
          View: this.options.View,
          lastColumnResizable: this.options.lastColumnResizable
        })
      ] : [],
      Vb({
        allowTableNodeSelection: this.options.allowTableNodeSelection
      })
    ];
  },
  extendNodeSchema(n) {
    const e = {
      name: n.name,
      options: n.options,
      storage: n.storage
    };
    return {
      tableRole: R(E(n, "tableRole", e))
    };
  }
}), Yb = Gb.extend({
  addAttributes() {
    var n;
    return {
      ...(n = this.parent) == null ? void 0 : n.call(this),
      bordered: {
        default: !1,
        parseHTML: (e) => e.classList.contains("table-bordered")
      },
      striped: {
        default: !1,
        parseHTML: (e) => e.classList.contains("table-striped")
      },
      hover: {
        default: !1,
        parseHTML: (e) => e.classList.contains("table-hover")
      },
      small: {
        default: !1,
        parseHTML: (e) => e.classList.contains("table-sm")
      }
    };
  },
  renderHTML({ node: n, HTMLAttributes: e }) {
    const t = [];
    return n.attrs.bordered && t.push("table-bordered"), n.attrs.striped && t.push("table-striped"), n.attrs.hover && t.push("table-hover"), n.attrs.small && t.push("table-sm"), ["table", D(this.options.HTMLAttributes, e, {
      class: t.length ? t.join(" ") : void 0
    }), ["tbody", 0]];
  },
  addCommands() {
    var n;
    return {
      ...(n = this.parent) == null ? void 0 : n.call(this),
      /**
       * Update style attributes of the table containing the cursor.
       * @param {Object} styles - { bordered, striped, hover, small }
       */
      updateTableStyles: (e) => ({ tr: t, state: i, dispatch: s }) => {
        const { $from: r } = i.selection;
        for (let o = r.depth; o > 0; o--) {
          const l = r.node(o);
          if (l.type.name === "table") {
            if (s) {
              const a = r.before(o);
              t.setNodeMarkup(a, void 0, { ...l.attrs, ...e });
            }
            return !0;
          }
        }
        return !1;
      },
      /**
       * Get current table style attributes (for edit modal).
       */
      getTableStyles: () => ({ state: e }) => {
        const { $from: t } = e.selection;
        for (let i = t.depth; i > 0; i--) {
          const s = t.node(i);
          if (s.type.name === "table")
            return {
              bordered: !!s.attrs.bordered,
              striped: !!s.attrs.striped,
              hover: !!s.attrs.hover,
              small: !!s.attrs.small
            };
        }
        return null;
      }
    };
  }
}), Xb = B.create({
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
}), Qb = B.create({
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
          const e = n.getAttribute("colwidth");
          return e ? e.split(",").map((i) => parseInt(i, 10)) : null;
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
}), Zb = B.create({
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
          const e = n.getAttribute("colwidth");
          return e ? e.split(",").map((i) => parseInt(i, 10)) : null;
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
}), Jl = {
  "1-col": ["col-12"],
  "2-col": ["col-md-6", "col-md-6"],
  "3-col": ["col-md-4", "col-md-4", "col-md-4"],
  "4-col": ["col-md-3", "col-md-3", "col-md-3", "col-md-3"],
  "1-2": ["col-md-4", "col-md-8"],
  "2-1": ["col-md-8", "col-md-4"],
  "1-1-2": ["col-md-3", "col-md-3", "col-md-6"],
  "2-1-1": ["col-md-6", "col-md-3", "col-md-3"]
}, ey = B.create({
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
          const t = (n.className || "").match(/g-(\d)/);
          return t ? parseInt(t[1], 10) : 3;
        },
        renderHTML: (n) => ({})
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const t = n.attrs.gutter ?? 3;
    return [
      "div",
      D(e, {
        "data-type": "bootstrap-row",
        class: `row g-${t}`
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
      insertBootstrapRow: (n = "2-col", e = 3) => ({ commands: t, editor: i }) => {
        const r = (Jl[n] || Jl["2-col"]).map((o) => ({
          type: "bootstrapCol",
          attrs: { colClass: o },
          content: [
            {
              type: "paragraph"
            }
          ]
        }));
        return t.insertContent({
          type: "bootstrapRow",
          attrs: { gutter: e },
          content: r
        });
      },
      /**
       * Add a column to the current row.
       * @param {string} [colClass='col'] - Bootstrap column class
       */
      addColumnToRow: (n = "col") => ({ state: e, commands: t, editor: i }) => {
        const { $from: s } = e.selection;
        let r = null;
        for (let a = s.depth; a > 0; a--)
          if (s.node(a).type.name === "bootstrapRow") {
            r = s.before(a);
            break;
          }
        if (r === null) return !1;
        const o = e.doc.nodeAt(r);
        if (!o) return !1;
        const l = r + o.nodeSize - 1;
        return t.insertContentAt(l, {
          type: "bootstrapCol",
          attrs: { colClass: n },
          content: [{ type: "paragraph" }]
        });
      },
      /**
       * Remove the current column from its parent row.
       * Won't remove if it's the last column.
       */
      removeColumn: () => ({ state: n, dispatch: e, tr: t }) => {
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
        if (e) {
          const l = i.before(s), a = i.after(s);
          t.delete(l, a), e(t);
        }
        return !0;
      },
      /**
       * Change the column class of the current column.
       * @param {string} colClass - New Bootstrap column class
       */
      setColumnClass: (n) => ({ state: e, dispatch: t, tr: i }) => {
        const { $from: s } = e.selection;
        for (let r = s.depth; r > 0; r--)
          if (s.node(r).type.name === "bootstrapCol")
            return t && (i.setNodeMarkup(s.before(r), void 0, {
              ...s.node(r).attrs,
              colClass: n
            }), t(i)), !0;
        return !1;
      },
      /**
       * Change the gutter of the current row.
       * @param {number} gutter - Bootstrap gutter value (0-5)
       */
      setRowGutter: (n) => ({ state: e, dispatch: t, tr: i }) => {
        const { $from: s } = e.selection;
        for (let r = s.depth; r > 0; r--)
          if (s.node(r).type.name === "bootstrapRow")
            return t && (i.setNodeMarkup(s.before(r), void 0, {
              ...s.node(r).attrs,
              gutter: Math.max(0, Math.min(5, n))
            }), t(i)), !0;
        return !1;
      },
      /**
       * Delete the entire row.
       */
      deleteBootstrapRow: () => ({ state: n, dispatch: e, tr: t }) => {
        const { $from: i } = n.selection;
        for (let s = i.depth; s > 0; s--)
          if (i.node(s).type.name === "bootstrapRow") {
            if (e) {
              const r = i.before(s), o = i.after(s);
              t.delete(r, o), e(t);
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
        const { state: e } = n, { $from: t } = e.selection;
        for (let r = t.depth; r > 0; r--)
          if (t.node(r).type.name === "bootstrapCol") {
            const o = t.node(r), l = t.node(r - 1);
            if (o.childCount === 1 && ((i = o.firstChild) == null ? void 0 : i.type.name) === "paragraph" && ((s = o.firstChild) == null ? void 0 : s.content.size) === 0 && l.type.name === "bootstrapRow" && l.childCount === 1)
              return n.commands.deleteBootstrapRow();
            break;
          }
        return !1;
      }
    };
  }
}), ty = B.create({
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
          const t = (n.className || "").match(/col(?:-(?:sm|md|lg|xl|xxl))?(?:-\d{1,2})?/g);
          return t ? t.join(" ") : "col";
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
          const e = n.className || "";
          return /\bcol\b|\bcol-/.test(e) ? {} : !1;
        }
      }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: e }) {
    const t = n.attrs.colClass || "col";
    return [
      "div",
      D(e, {
        "data-type": "bootstrap-col",
        class: t
      }),
      0
    ];
  }
}), Qn = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark"
], ny = B.create({
  name: "bootstrapAlert",
  group: "block",
  content: "inline*",
  defining: !0,
  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (n) => {
          const e = n.className || "";
          for (const t of Qn)
            if (e.includes(`alert-${t}`))
              return t;
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const t = Qn.includes(n.attrs.type) ? n.attrs.type : "info";
    return [
      "div",
      D(e, {
        "data-type": "bootstrap-alert",
        "data-alert-type": t,
        class: `alert alert-${t}`,
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
      insertBootstrapAlert: (n = "info") => ({ commands: e }) => {
        const t = Qn.includes(n) ? n : "info";
        return e.insertContent({
          type: this.name,
          attrs: { type: t },
          content: [{ type: "text", text: "Alert message..." }]
        });
      },
      /**
       * Set the type of the current Bootstrap Alert.
       * @param {string} type - Alert type
       */
      setAlertType: (n) => ({ commands: e }) => {
        const t = Qn.includes(n) ? n : "info";
        return e.updateAttributes(this.name, { type: t });
      },
      /**
       * Delete the current Bootstrap Alert.
       */
      deleteBootstrapAlert: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      // Delete empty alert on Backspace
      Backspace: ({ editor: n }) => {
        const { $anchor: e } = n.state.selection, t = e.node(e.depth);
        return t.type.name === this.name && t.textContent.length === 0 ? n.commands.deleteBootstrapAlert() : !1;
      }
    };
  }
}), oi = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark"
], iy = B.create({
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
          const e = n.querySelector(".card-header");
          return e ? e.textContent : null;
        },
        renderHTML: () => ({})
        // handled in renderHTML
      },
      footerText: {
        default: null,
        parseHTML: (n) => {
          const e = n.querySelector(".card-footer");
          return e ? e.textContent : null;
        },
        renderHTML: () => ({})
      },
      borderColor: {
        default: null,
        parseHTML: (n) => {
          const e = n.className || "";
          for (const t of oi)
            if (e.includes(`border-${t}`))
              return t;
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const { headerText: t, footerText: i, borderColor: s } = n.attrs, r = ["card"];
    s && oi.includes(s) && r.push(`border-${s}`);
    const o = [];
    return t && o.push([
      "div",
      { class: "card-header", contenteditable: "false" },
      t
    ]), o.push(["div", { class: "card-body" }, 0]), i && o.push([
      "div",
      { class: "card-footer", contenteditable: "false" },
      i
    ]), [
      "div",
      D(e, {
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
      insertBootstrapCard: (n = {}) => ({ commands: e }) => {
        const { headerText: t = null, footerText: i = null, borderColor: s = null } = n;
        return e.insertContent({
          type: this.name,
          attrs: { headerText: t, footerText: i, borderColor: s },
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
      updateBootstrapCard: (n) => ({ commands: e }) => e.updateAttributes(this.name, n),
      /**
       * Delete the current Bootstrap Card.
       */
      deleteBootstrapCard: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor: n }) => {
        const { $anchor: e } = n.state.selection;
        for (let t = e.depth; t > 0; t--) {
          const i = e.node(t);
          if (i.type.name === this.name && i.textContent.length === 0)
            return n.commands.deleteBootstrapCard();
        }
        return !1;
      }
    };
  },
  addNodeView() {
    return ({ node: n, editor: e, getPos: t }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "bootstrap-card"), i.style.position = "relative";
      const s = document.createElement("div");
      s.className = "card-body";
      const r = (l) => {
        const { headerText: a, footerText: c, borderColor: d } = l;
        if (i.innerHTML = "", i.className = "card tiptap-card-editable", d && oi.includes(d) && i.classList.add(`border-${d}`), a) {
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
        const l = e._tiptapToolbar;
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
}), Ft = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "link"
], Vs = ["sm", "lg"], sy = B.create({
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
          const e = n.className || "";
          for (const t of Ft)
            if (e.includes(`btn-outline-${t}`)) return t;
          for (const t of Ft)
            if (e.includes(`btn-${t}`)) return t;
          return "primary";
        },
        renderHTML: () => ({})
      },
      size: {
        default: null,
        parseHTML: (n) => {
          const e = n.className || "";
          return e.includes("btn-sm") ? "sm" : e.includes("btn-lg") ? "lg" : null;
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const { text: t, url: i, variant: s, size: r, outline: o, target: l } = n.attrs, a = Ft.includes(s) ? s : "primary", d = ["btn", o ? `btn-outline-${a}` : `btn-${a}`];
    return r && Vs.includes(r) && d.push(`btn-${r}`), [
      "span",
      D(e, {
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
      t || "Button"
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a Bootstrap Button at the current cursor position.
       * @param {Object} attrs - Button attributes
       */
      insertBootstrapButton: (n = {}) => ({ commands: e }) => {
        const {
          text: t = "Button",
          url: i = "#",
          variant: s = "primary",
          size: r = null,
          outline: o = !1,
          target: l = "_self"
        } = n;
        return e.insertContent({
          type: this.name,
          attrs: { text: t, url: i, variant: s, size: r, outline: o, target: l }
        });
      },
      /**
       * Update the current Bootstrap Button's attributes.
       * @param {Object} attrs - Partial attributes to update
       */
      updateBootstrapButton: (n) => ({ commands: e }) => e.updateAttributes(this.name, n),
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
    return ({ node: n, getPos: e, editor: t }) => {
      const i = document.createElement("span"), { text: s, variant: r, size: o, outline: l, target: a } = n.attrs, c = Ft.includes(r) ? r : "primary", d = l ? `btn-outline-${c}` : `btn-${c}`;
      return i.className = `btn ${d}`, o && Vs.includes(o) && i.classList.add(`btn-${o}`), i.setAttribute("data-type", "bootstrap-button"), i.setAttribute("role", "button"), i.textContent = s || "Button", i.style.cursor = "pointer", i.contentEditable = "false", i.addEventListener("dblclick", (u) => {
        u.preventDefault(), u.stopPropagation();
        const p = e();
        if (typeof p != "number") return;
        const h = t._tiptapToolbar;
        h != null && h.buttonModal && h.buttonModal.open(n.attrs, p);
      }), {
        dom: i,
        update(u) {
          if (u.type.name !== "bootstrapButton") return !1;
          const p = Ft.includes(u.attrs.variant) ? u.attrs.variant : "primary", h = u.attrs.outline ? `btn-outline-${p}` : `btn-${p}`;
          return i.className = `btn ${h}`, u.attrs.size && Vs.includes(u.attrs.size) && i.classList.add(`btn-${u.attrs.size}`), i.textContent = u.attrs.text || "Button", !0;
        },
        destroy() {
        }
      };
    };
  }
}), ry = ["left", "center", "right"], oy = B.create({
  name: "customImage",
  group: "block",
  draggable: !0,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (n) => {
          var e;
          return ((e = n.querySelector("img")) == null ? void 0 : e.getAttribute("src")) || n.getAttribute("src");
        }
      },
      alt: {
        default: "",
        parseHTML: (n) => {
          var e;
          return ((e = n.querySelector("img")) == null ? void 0 : e.getAttribute("alt")) || n.getAttribute("alt") || "";
        }
      },
      title: {
        default: null,
        parseHTML: (n) => {
          var e;
          return ((e = n.querySelector("img")) == null ? void 0 : e.getAttribute("title")) || n.getAttribute("title");
        }
      },
      caption: {
        default: null,
        parseHTML: (n) => {
          const e = n.querySelector("figcaption");
          return e ? e.textContent : null;
        }
      },
      width: {
        default: null,
        parseHTML: (n) => {
          const t = (n.querySelector("img") || n).getAttribute("width");
          return t ? parseInt(t, 10) : null;
        }
      },
      height: {
        default: null,
        parseHTML: (n) => {
          const t = (n.querySelector("img") || n).getAttribute("height");
          return t ? parseInt(t, 10) : null;
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
          var e;
          return ((e = n.style) == null ? void 0 : e.width) || n.getAttribute("data-width-style") || null;
        }
      },
      extraClass: {
        default: null,
        parseHTML: (n) => n.getAttribute("data-extra-class") || null
      },
      linkUrl: {
        default: null,
        parseHTML: (n) => {
          var e;
          return ((e = n.querySelector("a")) == null ? void 0 : e.getAttribute("href")) || n.getAttribute("data-link-url") || null;
        }
      },
      linkTarget: {
        default: null,
        parseHTML: (n) => {
          var e;
          return ((e = n.querySelector("a")) == null ? void 0 : e.getAttribute("target")) || null;
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const {
      src: t,
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
    let g = `tiptap-image ${a === "left" ? "text-start" : a === "right" ? "text-end" : "text-center"}`;
    p && (g += " " + p);
    const b = D(e, {
      "data-type": "custom-image",
      class: g
    });
    c && (b["data-media-id"] = c), u && (b["data-width-style"] = u), p && (b["data-extra-class"] = p), h && (b["data-link-url"] = h), u && (b.style = `width:${u}`);
    const v = {
      src: t || "",
      alt: i || "",
      class: "img-fluid",
      loading: d || "lazy"
    };
    s && (v.title = s), o && (v.width = String(o)), l && (v.height = String(l));
    const k = ["img", v], x = [h ? ["a", { href: h, target: f || null, rel: f === "_blank" ? "noopener noreferrer" : null }, k] : k];
    return r && x.push(["figcaption", { class: "figure-caption" }, r]), ["figure", b, ...x];
  },
  addCommands() {
    return {
      /**
       * Insert a custom image.
       * @param {Object} attrs - Image attributes (src, alt, etc.)
       */
      insertCustomImage: (n = {}) => ({ commands: e }) => e.insertContent({
        type: this.name,
        attrs: {
          src: n.src || "",
          alt: n.alt || "",
          title: n.title || null,
          caption: n.caption || null,
          width: n.width || null,
          height: n.height || null,
          alignment: ry.includes(n.alignment) ? n.alignment : "center",
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
      updateCustomImage: (n) => ({ commands: e }) => e.updateAttributes(this.name, n),
      /**
       * Delete the current custom image.
       */
      deleteCustomImage: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addNodeView() {
    return ({ node: n, editor: e, getPos: t }) => {
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
          widthStyle: m,
          extraClass: g,
          linkUrl: b,
          linkTarget: v
        } = o;
        i.innerHTML = "", i.classList.remove("text-start", "text-center", "text-end"), i.classList.add(
          h === "left" ? "text-start" : h === "right" ? "text-end" : "text-center"
        ), g && i.setAttribute("data-extra-class", g), m ? (i.style.width = m, i.style.display = "inline-block") : (i.style.width = "", i.style.display = ""), f && i.setAttribute("data-media-id", f);
        const k = document.createElement("img");
        if (k.src = l || "", k.alt = a || "", k.className = "img-fluid", k.loading = "lazy", c && (k.title = c), u && (k.width = u), p && (k.height = p), b) {
          const x = document.createElement("a");
          x.href = b, v && (x.target = v), v === "_blank" && (x.rel = "noopener noreferrer"), x.appendChild(k), i.appendChild(x);
        } else
          i.appendChild(k);
        if (d) {
          const x = document.createElement("figcaption");
          x.className = "figure-caption", x.textContent = d, i.appendChild(x);
        }
        const M = document.createElement("button");
        M.type = "button", M.className = "tiptap-image-edit-btn", M.title = "Edit image (double-click)", M.innerHTML = '<i class="bi bi-pencil-square"></i>', M.addEventListener("click", (x) => {
          x.preventDefault(), x.stopPropagation(), r();
        }), i.appendChild(M);
      }, r = () => {
        const o = e._tiptapToolbar;
        if (o != null && o.imageModal) {
          const l = typeof t == "function" ? t() : null;
          l !== null && e.chain().focus().setNodeSelection(l).run(), o.imageModal.open(n.attrs);
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
}), yn = {
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
function Er(n) {
  for (const [e, t] of Object.entries(yn)) {
    const i = n.match(t.regex);
    if (i && i[1])
      return { provider: e, videoId: i[1] };
  }
  return /\.(mp4|webm)(\?|$)/i.test(n) ? { provider: "mp4", videoId: n } : null;
}
const ly = B.create({
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
          const e = n.querySelector("iframe");
          if (e) return e.getAttribute("src");
          const t = n.querySelector("video source");
          return t ? t.getAttribute("src") : n.getAttribute("data-url") || null;
        }
      },
      title: {
        default: "",
        parseHTML: (n) => {
          const e = n.querySelector("iframe");
          return (e == null ? void 0 : e.getAttribute("title")) || "";
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
          const e = n.querySelector("figcaption");
          return (e == null ? void 0 : e.textContent) || "";
        }
      },
      aspectRatio: {
        default: "16x9",
        parseHTML: (n) => {
          const t = (n.className || "").match(/ratio-(\d+x\d+)/);
          return t ? t[1] : "16x9";
        }
      },
      alignment: {
        default: "center",
        parseHTML: (n) => n.getAttribute("data-alignment") || "center"
      },
      widthStyle: {
        default: null,
        parseHTML: (n) => {
          const t = (n.getAttribute("style") || "").match(/width:\s*(\d+(?:\.\d+)?(?:px|%))/);
          return t ? t[1] : null;
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
  renderHTML({ node: n, HTMLAttributes: e }) {
    const { provider: t, videoId: i, url: s, title: r, aspectRatio: o, alignment: l, widthStyle: a, caption: c } = n.attrs, d = o || "16x9", u = l === "left" ? "text-start" : l === "right" ? "text-end" : "text-center", p = a ? `width:${a}` : "", h = `tiptap-video-figure ${u}`, f = D(e, {
      "data-type": "custom-video",
      "data-provider": t,
      "data-video-id": i || "",
      "data-url": s || "",
      "data-alignment": l || "center",
      class: `ratio ratio-${d}`
    });
    let m;
    if (t === "mp4")
      m = [
        "div",
        f,
        [
          "video",
          { controls: "true", class: "w-100", title: r || "" },
          ["source", { src: s || i || "", type: "video/mp4" }]
        ]
      ];
    else {
      const b = yn[t], v = b ? b.embedUrl(i) : "";
      m = [
        "div",
        f,
        [
          "iframe",
          {
            src: v,
            title: r || "",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: "true",
            loading: "lazy",
            frameborder: "0"
          }
        ]
      ];
    }
    const g = { class: h };
    return p && (g.style = p), c ? ["figure", g, m, ["figcaption", {}, c]] : ["figure", g, m];
  },
  addCommands() {
    return {
      /**
       * Insert a custom video from a URL.
       * Auto-detects provider (YouTube, Vimeo, MP4).
       * @param {Object} attrs - { url, title? }
       */
      insertCustomVideo: (n = {}) => ({ commands: e }) => {
        const t = Er(n.url || "");
        return t ? e.insertContent({
          type: this.name,
          attrs: {
            provider: n.provider || t.provider,
            videoId: n.videoId || t.videoId,
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
      updateCustomVideo: (n) => ({ commands: e }) => e.updateAttributes(this.name, n),
      /**
       * Delete the current custom video.
       */
      deleteCustomVideo: () => ({ commands: n }) => n.deleteNode(this.name)
    };
  },
  addNodeView() {
    return ({ node: n, editor: e, getPos: t }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "custom-video"), i.contentEditable = "false";
      const { provider: s, videoId: r, url: o, title: l, aspectRatio: a, alignment: c, widthStyle: d, caption: u } = n.attrs, p = a || "16x9", h = document.createElement("figure");
      h.className = `tiptap-video-figure ${c === "left" ? "text-start" : c === "right" ? "text-end" : "text-center"}`, d && (h.style.width = d);
      const f = document.createElement("div");
      if (f.className = `ratio ratio-${p} tiptap-video-wrapper`, f.setAttribute("data-type", "custom-video"), f.setAttribute("data-provider", s), s === "mp4") {
        const m = document.createElement("video");
        m.controls = !0, m.className = "w-100", m.title = l || "";
        const g = document.createElement("source");
        g.src = o || r || "", g.type = "video/mp4", m.appendChild(g), f.appendChild(m);
      } else {
        const m = document.createElement("iframe"), g = yn[s];
        m.src = g ? g.embedUrl(r) : "", m.title = l || "", m.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", m.allowFullscreen = !0, m.loading = "lazy", m.frameBorder = "0", f.appendChild(m);
      }
      if (h.appendChild(f), u) {
        const m = document.createElement("figcaption");
        m.textContent = u, h.appendChild(m);
      }
      return i.appendChild(h), i.addEventListener("dblclick", (m) => {
        var g;
        m.preventDefault(), m.stopPropagation(), (g = e._tiptapToolbar) != null && g.videoModal && e._tiptapToolbar.videoModal.open(n.attrs);
      }), {
        dom: i,
        update(m) {
          if (m.type.name !== "customVideo") return !1;
          const g = m.attrs.provider, b = m.attrs.videoId, v = m.attrs.aspectRatio || "16x9", k = m.attrs.alignment || "center", M = m.attrs.widthStyle, x = m.attrs.caption || "";
          i.innerHTML = "";
          const N = document.createElement("figure");
          N.className = `tiptap-video-figure ${k === "left" ? "text-start" : k === "right" ? "text-end" : "text-center"}`, M && (N.style.width = M);
          const C = document.createElement("div");
          if (C.className = `ratio ratio-${v} tiptap-video-wrapper`, C.setAttribute("data-provider", g), g === "mp4") {
            const T = document.createElement("video");
            T.controls = !0, T.className = "w-100";
            const I = document.createElement("source");
            I.src = m.attrs.url || b || "", I.type = "video/mp4", T.appendChild(I), C.appendChild(T);
          } else {
            const T = document.createElement("iframe"), I = yn[g];
            T.src = I ? I.embedUrl(b) : "", T.title = m.attrs.title || "", T.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", T.allowFullscreen = !0, T.loading = "lazy", T.frameBorder = "0", C.appendChild(T);
          }
          if (N.appendChild(C), x) {
            const T = document.createElement("figcaption");
            T.textContent = x, N.appendChild(T);
          }
          return i.appendChild(N), !0;
        },
        destroy() {
        }
      };
    };
  }
}), tn = 3, Gl = [2, 3, 4, 6], ay = B.create({
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
        default: tn,
        parseHTML: (n) => {
          const e = parseInt(n.getAttribute("data-columns"), 10);
          return Gl.includes(e) ? e : tn;
        },
        renderHTML: (n) => ({ "data-columns": n.columns })
      },
      gap: {
        default: 2,
        parseHTML: (n) => {
          const e = parseInt(n.getAttribute("data-gap"), 10);
          return e >= 0 && e <= 5 ? e : 2;
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
    const e = n["data-gap"] ?? 2;
    return [
      "div",
      D(n, {
        "data-type": "gallery",
        class: `row g-${e} tiptap-gallery`
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
      insertGallery: (n = {}) => ({ commands: e }) => {
        const { images: t = [], columns: i = tn, gap: s = 2, lightbox: r = !1 } = n;
        if (t.length === 0) return !1;
        const o = Math.floor(12 / i), l = t.map((a) => ({
          type: "galleryImage",
          attrs: {
            src: a.src || "",
            alt: a.alt || "",
            colClass: `col-${o}`
          }
        }));
        return e.insertContent({
          type: this.name,
          attrs: { columns: i, gap: s, lightbox: r },
          content: l
        });
      },
      /**
       * Change the number of columns in the current gallery.
       * @param {number} columns
       */
      setGalleryColumns: (n) => ({ commands: e }) => Gl.includes(n) ? e.updateAttributes(this.name, { columns: n }) : !1,
      /**
       * Toggle lightbox on the current gallery.
       */
      toggleGalleryLightbox: () => ({ commands: n, editor: e }) => {
        const t = e.getAttributes(this.name);
        return n.updateAttributes(this.name, { lightbox: !t.lightbox });
      }
    };
  },
  addNodeView() {
    return ({ node: n, editor: e, getPos: t }) => {
      const i = document.createElement("div");
      i.setAttribute("data-type", "gallery"), i.style.position = "relative";
      const s = document.createElement("div");
      s.className = "row tiptap-gallery";
      const r = (l) => {
        const { columns: a, gap: c, lightbox: d } = l, u = c ?? 2;
        s.className = `row g-${u} tiptap-gallery`, d ? s.setAttribute("data-lightbox", "true") : s.removeAttribute("data-lightbox"), s.setAttribute("data-columns", a || tn), s.setAttribute("data-gap", u);
        const p = i.querySelector(".tiptap-node-edit-btn");
        p && p.remove();
        const h = document.createElement("button");
        h.type = "button", h.className = "tiptap-node-edit-btn", h.title = "Edit gallery (double-click)", h.innerHTML = '<i class="bi bi-pencil-square"></i>', h.contentEditable = "false", h.addEventListener("click", (f) => {
          f.preventDefault(), f.stopPropagation(), o();
        }), i.appendChild(h);
      }, o = () => {
        const l = e._tiptapToolbar;
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
}), cy = B.create({
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
          const e = n.querySelector("img");
          return e ? e.getAttribute("src") : null;
        }
      },
      alt: {
        default: "",
        parseHTML: (n) => {
          const e = n.querySelector("img");
          return e && e.getAttribute("alt") || "";
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
    const { src: e, alt: t, colClass: i } = n;
    return [
      "div",
      {
        "data-type": "gallery-image",
        class: `${i || "col-4"} tiptap-gallery__item`
      },
      [
        "img",
        {
          src: e || "",
          alt: t || "",
          class: "img-fluid rounded",
          loading: "lazy"
        }
      ]
    ];
  }
});
function dy(n) {
  var e;
  const { char: t, allowSpaces: i, allowToIncludeChar: s, allowedPrefixes: r, startOfLine: o, $position: l } = n, a = i && !s, c = cm(t), d = new RegExp(`\\s${c}$`), u = o ? "^" : "", p = s ? "" : c, h = a ? new RegExp(`${u}${c}.*?(?=\\s${p}|$)`, "gm") : new RegExp(`${u}(?:^)?${c}[^\\s${p}]*`, "gm"), f = ((e = l.nodeBefore) === null || e === void 0 ? void 0 : e.isText) && l.nodeBefore.text;
  if (!f)
    return null;
  const m = l.pos - f.length, g = Array.from(f.matchAll(h)).pop();
  if (!g || g.input === void 0 || g.index === void 0)
    return null;
  const b = g.input.slice(Math.max(0, g.index - 1), g.index), v = new RegExp(`^[${r == null ? void 0 : r.join("")}\0]?$`).test(b);
  if (r !== null && !v)
    return null;
  const k = m + g.index;
  let M = k + g[0].length;
  return a && d.test(f.slice(M - 1, M + 1)) && (g[0] += " ", M += 1), k < l.pos && M >= l.pos ? {
    range: {
      from: k,
      to: M
    },
    query: g[0].slice(t.length),
    text: g[0]
  } : null;
}
const uy = new J("suggestion");
function py({ pluginKey: n = uy, editor: e, char: t = "@", allowSpaces: i = !1, allowToIncludeChar: s = !1, allowedPrefixes: r = [" "], startOfLine: o = !1, decorationTag: l = "span", decorationClass: a = "suggestion", decorationContent: c = "", decorationEmptyClass: d = "is-empty", command: u = () => null, items: p = () => [], render: h = () => ({}), allow: f = () => !0, findSuggestionMatch: m = dy }) {
  let g;
  const b = h == null ? void 0 : h(), v = new W({
    key: n,
    view() {
      return {
        update: async (k, M) => {
          var x, N, C, T, I, Ce, Ie;
          const H = (x = this.key) === null || x === void 0 ? void 0 : x.getState(M), ce = (N = this.key) === null || N === void 0 ? void 0 : N.getState(k.state), De = H.active && ce.active && H.range.from !== ce.range.from, ft = !H.active && ce.active, Pe = H.active && !ce.active, Be = !ft && !Pe && H.query !== ce.query, Xt = ft || De && Be, Pn = Be || De, hs = Pe || De && Be;
          if (!Xt && !Pn && !hs)
            return;
          const Dt = hs && !Xt ? H : ce, ho = k.dom.querySelector(`[data-decoration-id="${Dt.decorationId}"]`);
          g = {
            editor: e,
            range: Dt.range,
            query: Dt.query,
            text: Dt.text,
            items: [],
            command: (Qt) => u({
              editor: e,
              range: Dt.range,
              props: Qt
            }),
            decorationNode: ho,
            // virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            clientRect: ho ? () => {
              var Qt;
              const { decorationId: od } = (Qt = this.key) === null || Qt === void 0 ? void 0 : Qt.getState(e.state), fs = k.dom.querySelector(`[data-decoration-id="${od}"]`);
              return (fs == null ? void 0 : fs.getBoundingClientRect()) || null;
            } : null
          }, Xt && ((C = b == null ? void 0 : b.onBeforeStart) === null || C === void 0 || C.call(b, g)), Pn && ((T = b == null ? void 0 : b.onBeforeUpdate) === null || T === void 0 || T.call(b, g)), (Pn || Xt) && (g.items = await p({
            editor: e,
            query: Dt.query
          })), hs && ((I = b == null ? void 0 : b.onExit) === null || I === void 0 || I.call(b, g)), Pn && ((Ce = b == null ? void 0 : b.onUpdate) === null || Ce === void 0 || Ce.call(b, g)), Xt && ((Ie = b == null ? void 0 : b.onStart) === null || Ie === void 0 || Ie.call(b, g));
        },
        destroy: () => {
          var k;
          g && ((k = b == null ? void 0 : b.onExit) === null || k === void 0 || k.call(b, g));
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
      apply(k, M, x, N) {
        const { isEditable: C } = e, { composing: T } = e.view, { selection: I } = k, { empty: Ce, from: Ie } = I, H = { ...M };
        if (H.composing = T, C && (Ce || e.view.composing)) {
          (Ie < M.range.from || Ie > M.range.to) && !T && !M.composing && (H.active = !1);
          const ce = m({
            char: t,
            allowSpaces: i,
            allowToIncludeChar: s,
            allowedPrefixes: r,
            startOfLine: o,
            $position: I.$from
          }), De = `id_${Math.floor(Math.random() * 4294967295)}`;
          ce && f({
            editor: e,
            state: N,
            range: ce.range,
            isActive: M.active
          }) ? (H.active = !0, H.decorationId = M.decorationId ? M.decorationId : De, H.range = ce.range, H.query = ce.query, H.text = ce.text) : H.active = !1;
        } else
          H.active = !1;
        return H.active || (H.decorationId = null, H.range = { from: 0, to: 0 }, H.query = null, H.text = null), H;
      }
    },
    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(k, M) {
        var x;
        const { active: N, range: C } = v.getState(k.state);
        return N && ((x = b == null ? void 0 : b.onKeyDown) === null || x === void 0 ? void 0 : x.call(b, { view: k, event: M, range: C })) || !1;
      },
      // Setup decorator on the currently active suggestion.
      decorations(k) {
        const { active: M, range: x, decorationId: N, query: C } = v.getState(k);
        if (!M)
          return null;
        const T = !(C != null && C.length), I = [a];
        return T && I.push(d), F.create(k.doc, [
          se.inline(x.from, x.to, {
            nodeName: l,
            class: I.join(" "),
            "data-decoration-id": N,
            "data-decoration-content": c
          })
        ]);
      }
    }
  });
  return v;
}
const hy = new J("slashCommands"), fy = [
  // ── Text ──────────────────────────────
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text block",
    icon: "text-paragraph",
    group: "Text",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).setParagraph().run();
    }
  },
  {
    id: "heading1",
    label: "Heading 1",
    description: "Big section heading",
    icon: "type-h1",
    group: "Text",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleHeading({ level: 1 }).run();
    }
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium section heading",
    icon: "type-h2",
    group: "Text",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleHeading({ level: 2 }).run();
    }
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small section heading",
    icon: "type-h3",
    group: "Text",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleHeading({ level: 3 }).run();
    }
  },
  // ── Lists ─────────────────────────────
  {
    id: "bulletList",
    label: "Bullet List",
    description: "Unordered list",
    icon: "list-ul",
    group: "Lists",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleBulletList().run();
    }
  },
  {
    id: "orderedList",
    label: "Ordered List",
    description: "Numbered list",
    icon: "list-ol",
    group: "Lists",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleOrderedList().run();
    }
  },
  // ── Blocks ────────────────────────────
  {
    id: "blockquote",
    label: "Blockquote",
    description: "Quotation block",
    icon: "blockquote-left",
    group: "Blocks",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleBlockquote().run();
    }
  },
  {
    id: "codeBlock",
    label: "Code Block",
    description: "Syntax-highlighted code",
    icon: "code-square",
    group: "Blocks",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).toggleCodeBlock().run();
    }
  },
  {
    id: "horizontalRule",
    label: "Divider",
    description: "Horizontal separator line",
    icon: "hr",
    group: "Blocks",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).setHorizontalRule().run();
    }
  },
  // ── Media ─────────────────────────────
  {
    id: "image",
    label: "Image",
    description: "Upload or embed an image",
    icon: "image",
    group: "Media",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).run();
      const t = new CustomEvent("tiptap:insert-image", { bubbles: !0 });
      n.view.dom.dispatchEvent(t);
    }
  },
  {
    id: "video",
    label: "Video",
    description: "YouTube, Vimeo, or MP4",
    icon: "play-btn",
    group: "Media",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).run();
      const t = prompt("Enter video URL (YouTube, Vimeo, or MP4):");
      t && n.chain().focus().insertCustomVideo({ url: t }).run();
    }
  },
  // ── Table ─────────────────────────────
  {
    id: "table",
    label: "Table",
    description: "3×3 table with header",
    icon: "table",
    group: "Insert",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).insertTable({ rows: 3, cols: 3, withHeaderRow: !0 }).run();
    }
  },
  // ── Layout ────────────────────────────
  {
    id: "row2col",
    label: "2 Columns",
    description: "Two equal columns",
    icon: "layout-split",
    group: "Layout",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).insertBootstrapRow("2-col").run();
    }
  },
  {
    id: "row3col",
    label: "3 Columns",
    description: "Three equal columns",
    icon: "grid-3x3",
    group: "Layout",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).insertBootstrapRow("3-col").run();
    }
  },
  {
    id: "rowSidebarLeft",
    label: "Sidebar Left",
    description: "Narrow + wide column",
    icon: "layout-sidebar",
    group: "Layout",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).insertBootstrapRow("1-2").run();
    }
  },
  // ── Components ────────────────────────
  {
    id: "alert",
    label: "Alert",
    description: "Bootstrap alert box",
    icon: "exclamation-triangle",
    group: "Components",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).insertBootstrapAlert("info").run();
    }
  },
  {
    id: "card",
    label: "Card",
    description: "Bootstrap card with header",
    icon: "card-heading",
    group: "Components",
    command: ({ editor: n, range: e }) => {
      n.chain().focus().deleteRange(e).insertBootstrapCard({ headerText: null }).run();
    }
  }
];
function my(n, e) {
  if (!e) return n;
  const t = e.toLowerCase();
  return n.filter(
    (i) => i.label.toLowerCase().includes(t) || i.description.toLowerCase().includes(t) || i.group.toLowerCase().includes(t)
  );
}
function gy(n) {
  const e = {};
  return n.forEach((t) => {
    const i = t.group || "Other";
    e[i] || (e[i] = []), e[i].push(t);
  }), e;
}
function by() {
  let n = null, e = 0, t = [], i = null;
  function s() {
    const a = document.createElement("div");
    return a.className = "tiptap-slash-menu", a.setAttribute("role", "listbox"), a.style.display = "none", document.body.appendChild(a), a;
  }
  function r(a) {
    if (!n) return;
    t = a;
    const c = gy(a);
    let d = "", u = 0;
    if (a.length === 0)
      d = '<div class="tiptap-slash-menu__empty">No matching commands</div>';
    else
      for (const [h, f] of Object.entries(c))
        d += `<div class="tiptap-slash-menu__group-label">${h}</div>`, f.forEach((m) => {
          const g = u === e;
          d += `
            <button
              type="button"
              class="tiptap-slash-menu__item${g ? " tiptap-slash-menu__item--selected" : ""}"
              data-index="${u}"
              role="option"
              aria-selected="${g}"
            >
              <span class="tiptap-slash-menu__icon"><i class="bi bi-${m.icon}"></i></span>
              <span class="tiptap-slash-menu__text">
                <span class="tiptap-slash-menu__label">${m.label}</span>
                <span class="tiptap-slash-menu__description">${m.description}</span>
              </span>
            </button>
          `, u++;
        });
    n.innerHTML = d, n.querySelectorAll(".tiptap-slash-menu__item").forEach((h) => {
      h.addEventListener("mousedown", (f) => {
        f.preventDefault();
        const m = parseInt(h.getAttribute("data-index"), 10);
        o(m);
      }), h.addEventListener("mouseenter", () => {
        e = parseInt(h.getAttribute("data-index"), 10), r(t);
      });
    });
    const p = n.querySelector(".tiptap-slash-menu__item--selected");
    p && p.scrollIntoView({ block: "nearest" });
  }
  function o(a) {
    const c = t[a];
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
      n || (n = s()), e = 0, i = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, r(a.items), l(a.clientRect);
    },
    onUpdate(a) {
      e = 0, i = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, r(a.items), l(a.clientRect);
    },
    onKeyDown(a) {
      const { event: c } = a;
      return c.key === "ArrowUp" ? (c.preventDefault(), e = (e - 1 + t.length) % t.length, r(t), !0) : c.key === "ArrowDown" ? (c.preventDefault(), e = (e + 1) % t.length, r(t), !0) : c.key === "Enter" ? (c.preventDefault(), o(e), !0) : c.key === "Escape" ? (c.preventDefault(), n && (n.style.display = "none"), !0) : !1;
    },
    onExit() {
      n && (n.style.display = "none"), t = [], i = null;
    }
  };
}
const yy = K.create({
  name: "slashCommands",
  addOptions() {
    return {
      commands: null,
      filterFn: null
    };
  },
  addProseMirrorPlugins() {
    const n = this.options.commands || fy, e = this.options.filterFn || my;
    return [
      py({
        editor: this.editor,
        char: "/",
        pluginKey: hy,
        startOfLine: !1,
        items: ({ query: t }) => e(n, t),
        render: by
      })
    ];
  }
});
class vy {
  /**
   * @param {import('./Toolbar').Toolbar} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._pendingFile = null, this._editMode = !1, this._build();
  }
  /* ─────────────────────────────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   */
  open(e = null) {
    this._reset(), this._editMode = !!e, e && this._populate(e), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ─────────────────────────────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    t || console.warn("[TiptapEditor] Bootstrap Modal not found. Image modal may not work."), this._bs = t ? new t(this._modal) : { show: () => {
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
    const e = (r) => this._modal.querySelector(r), t = (r) => this._modal.querySelectorAll(r);
    t(".tiptap-img-tab-btn").forEach((r) => {
      r.addEventListener("click", () => {
        t(".tiptap-img-tab-btn").forEach((o) => o.classList.remove("active")), t(".tiptap-img-panel").forEach((o) => o.classList.add("d-none")), r.classList.add("active"), e(`[data-panel="${r.dataset.tab}"]`).classList.remove("d-none");
      });
    }), e(".tiptap-img-file-input").addEventListener("change", (r) => {
      var l;
      const o = (l = r.target.files) == null ? void 0 : l[0];
      o && this._handleFileSelected(o);
    });
    const s = e("#tiptap-img-dropzone-el");
    s.addEventListener("dragover", (r) => {
      r.preventDefault(), s.classList.add("tiptap-img-dragover");
    }), s.addEventListener("dragleave", () => s.classList.remove("tiptap-img-dragover")), s.addEventListener("drop", (r) => {
      var l;
      r.preventDefault(), s.classList.remove("tiptap-img-dragover");
      const o = (l = r.dataTransfer.files) == null ? void 0 : l[0];
      o != null && o.type.startsWith("image/") && this._handleFileSelected(o);
    }), e(".tiptap-img-url-input").addEventListener("input", (r) => {
      this._updatePreview(r.target.value.trim());
    }), t(".tiptap-img-align-radio").forEach((r) => {
      r.addEventListener("change", () => {
        var o;
        t(".tiptap-align-btn").forEach((l) => l.classList.remove("tiptap-align-active")), (o = r.closest(".tiptap-align-btn")) == null || o.classList.add("tiptap-align-active");
      });
    }), t(".tiptap-width-btn").forEach((r) => {
      r.addEventListener("click", () => {
        t(".tiptap-width-btn").forEach((o) => o.classList.remove("active")), r.classList.add("active"), e(".tiptap-img-width-input").value = r.dataset.width;
      });
    }), e(".tiptap-img-width-input").addEventListener("input", () => {
      t(".tiptap-width-btn").forEach((r) => r.classList.remove("active"));
    }), e(".tiptap-img-insert-btn").addEventListener("click", () => this._insert()), this._modal.addEventListener("hidden.bs.modal", () => this._reset());
  }
  _handleFileSelected(e) {
    this._pendingFile = e;
    const t = new FileReader();
    t.onload = (o) => this._updatePreview(o.target.result), t.readAsDataURL(e);
    const i = this._modal.querySelector(".tiptap-img-dropzone-label");
    i && (i.textContent = "📎 " + e.name);
    const s = this._modal.querySelector(".tiptap-img-file-name");
    s && (s.textContent = e.name, s.classList.remove("d-none"));
    const r = this._modal.querySelector(".tiptap-img-alt-input");
    r && !r.value && (r.value = e.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }
  _updatePreview(e) {
    const t = this._modal.querySelector(".tiptap-img-preview"), i = this._modal.querySelector(".tiptap-img-preview-placeholder");
    e ? (t.src = e, t.style.display = "", i && (i.style.display = "none")) : (t.src = "", t.style.display = "none", i && (i.style.display = ""));
  }
  _populate(e) {
    var l;
    const t = (a) => this._modal.querySelector(a), i = (a) => this._modal.querySelectorAll(a);
    t('[data-tab="url"]').click(), t(".tiptap-img-url-input").value = e.src || "", t(".tiptap-img-alt-input").value = e.alt || "", t(".tiptap-img-caption-input").value = e.caption || "", t(".tiptap-img-link-input").value = e.linkUrl || "", t(".tiptap-img-link-blank").checked = e.linkTarget === "_blank", t(".tiptap-img-width-input").value = e.widthStyle || "", t(".tiptap-img-class-input").value = e.extraClass || "", e.src && this._updatePreview(e.src);
    const s = e.alignment || "center", r = t(`[name="tiptap-img-align-radio"][value="${s}"]`);
    r && (r.checked = !0, i(".tiptap-align-btn").forEach((a) => a.classList.remove("tiptap-align-active")), (l = r.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active"));
    const o = e.widthStyle || "";
    i(".tiptap-width-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.width === o);
    }), t(".tiptap-img-modal-title-text").textContent = "Edit Image", t(".tiptap-img-insert-btn-label").textContent = "Update Image";
  }
  async _insert() {
    var g, b;
    const e = (v) => this._modal.querySelector(v), t = (g = this._modal.querySelector(".tiptap-img-tab-btn.active")) == null ? void 0 : g.dataset.tab, i = e(".tiptap-img-alt-input").value.trim(), s = e(".tiptap-img-caption-input").value.trim(), r = e(".tiptap-img-link-input").value.trim(), o = e(".tiptap-img-link-blank").checked, l = e(".tiptap-img-width-input").value.trim(), a = e(".tiptap-img-class-input").value.trim(), c = ((b = e('[name="tiptap-img-align-radio"]:checked')) == null ? void 0 : b.value) || "center";
    let d = null;
    l && (l.endsWith("%") || l.endsWith("px") ? d = l : isNaN(parseFloat(l)) || (d = parseFloat(l) + "px"));
    const u = e(".tiptap-img-insert-btn");
    u.disabled = !0, u.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing…';
    let p = null, h = null, f = null, m = null;
    try {
      if (t === "upload" && this._pendingFile) {
        const k = this.toolbar._getUploadUrl();
        if (k) {
          const M = await this.toolbar._uploadFile(this._pendingFile, k);
          p = M.url, h = M.id || null, f = M.width || null, m = M.height || null;
        } else
          p = await this._toBase64(this._pendingFile);
      } else
        p = e(".tiptap-img-url-input").value.trim();
      if (!p) {
        this._showError("Please provide an image file or URL.");
        return;
      }
      const v = {
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
        height: m || null
      };
      this._editMode ? this.editor.chain().focus().updateCustomImage(v).run() : this.editor.chain().focus().insertCustomImage(v).run(), this._bs.hide();
    } catch (v) {
      console.error("[TiptapEditor] Image modal error:", v), this._showError(v.message || "Image operation failed.");
    } finally {
      u.disabled = !1, u.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-img-insert-btn-label">' + (this._editMode ? "Update Image" : "Insert Image") + "</span>";
    }
  }
  _showError(e) {
    let t = this._modal.querySelector(".tiptap-img-error");
    t || (t = document.createElement("div"), t.className = "alert alert-danger alert-sm py-1 px-2 mt-2 small tiptap-img-error", this._modal.querySelector(".modal-body").prepend(t)), t.textContent = e, t.style.display = "", setTimeout(() => {
      t.style.display = "none";
    }, 4e3);
  }
  _toBase64(e) {
    return new Promise((t, i) => {
      const s = new FileReader();
      s.onload = (r) => t(r.target.result), s.onerror = i, s.readAsDataURL(e);
    });
  }
  _reset() {
    var l, a, c;
    const e = (d) => this._modal.querySelector(d), t = (d) => this._modal.querySelectorAll(d);
    this._pendingFile = null, this._editMode = !1;
    const i = e(".tiptap-img-file-input");
    i && (i.value = ""), e(".tiptap-img-url-input").value = "", e(".tiptap-img-alt-input").value = "", e(".tiptap-img-caption-input").value = "", e(".tiptap-img-link-input").value = "", e(".tiptap-img-link-blank").checked = !1, e(".tiptap-img-width-input").value = "", e(".tiptap-img-class-input").value = "", this._updatePreview("");
    const s = e(".tiptap-img-dropzone-label");
    s && (s.textContent = "Drag & drop image here, or click to browse");
    const r = e(".tiptap-img-file-name");
    r && r.classList.add("d-none");
    const o = e('[name="tiptap-img-align-radio"][value="center"]');
    o && (o.checked = !0, t(".tiptap-align-btn").forEach((d) => d.classList.remove("tiptap-align-active")), (l = o.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active")), t(".tiptap-width-btn").forEach((d) => d.classList.remove("active")), (a = e('[data-width=""]')) == null || a.classList.add("active"), (c = e('[data-tab="upload"]')) == null || c.click(), e(".tiptap-img-modal-title-text").textContent = "Insert Image", e(".tiptap-img-insert-btn-label").textContent = "Insert Image";
  }
}
class ky {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._editMode = !1, this._build();
  }
  /* ─────────────────────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode
   */
  open(e = null) {
    this._reset(), this._editMode = !!e;
    const t = this._modal.querySelector(".tiptap-link-modal-title-text");
    t && (t.textContent = this._editMode ? "Edit Link" : "Insert Link");
    const i = this._modal.querySelector(".tiptap-link-unlink-btn");
    i && (i.style.display = this._editMode ? "" : "none"), e && this._populate(e), this._showSelectedText(), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ─────────────────────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    t || console.warn("[TiptapEditor] Bootstrap Modal not found. Link modal may not work."), this._bs = t ? new t(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _template() {
    const e = `tiptap-link-modal-${Date.now()}`;
    return `
<div class="modal fade tiptap-link-modal" id="${e}"
     tabindex="-1" aria-labelledby="${e}-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="${e}-title">
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
                     id="${e}-blank">
              <label class="form-check-label small" for="${e}-blank">
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
                     value="nofollow" id="${e}-nofollow">
              <label class="form-check-label small" for="${e}-nofollow">nofollow</label>
            </div>
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="ugc" id="${e}-ugc">
              <label class="form-check-label small" for="${e}-ugc">ugc</label>
            </div>
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="sponsored" id="${e}-sponsored">
              <label class="form-check-label small" for="${e}-sponsored">sponsored</label>
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
    this._modal.querySelectorAll(".tiptap-link-type-btn").forEach((e) => {
      e.addEventListener("click", () => {
        this._switchType(e.dataset.type);
      });
    }), this._modal.querySelector(".tiptap-link-insert-btn").addEventListener("click", () => this._submit()), this._modal.querySelector(".tiptap-link-unlink-btn").addEventListener("click", () => this._unlink()), this._modal.querySelectorAll("input").forEach((e) => {
      e.addEventListener("keydown", (t) => {
        t.key === "Enter" && (t.preventDefault(), this._submit());
      });
    });
  }
  _switchType(e) {
    this._modal.querySelectorAll(".tiptap-link-type-btn").forEach((t) => {
      t.classList.toggle("active", t.dataset.type === e);
    }), this._modal.querySelectorAll(".tiptap-link-panel").forEach((t) => {
      t.classList.toggle("d-none", t.dataset.panel !== e);
    });
  }
  _reset() {
    this._editMode = !1, this._modal.querySelector(".tiptap-link-href-input").value = "", this._modal.querySelector(".tiptap-link-anchor-input").value = "", this._modal.querySelector(".tiptap-link-email-input").value = "", this._modal.querySelector(".tiptap-link-tel-input").value = "", this._modal.querySelector(".tiptap-link-title-input").value = "", this._modal.querySelector(".tiptap-link-class-input").value = "", this._modal.querySelector(".tiptap-link-blank-check").checked = !1, this._modal.querySelectorAll(".tiptap-link-rel-check").forEach((i) => {
      i.checked = !1;
    }), this._switchType("url");
    const e = this._modal.querySelector(".tiptap-link-insert-btn-text");
    e && (e.textContent = "Insert Link");
    const t = this._modal.querySelector(".tiptap-link-selected-text");
    t && t.classList.add("d-none");
  }
  _showSelectedText() {
    const { from: e, to: t } = this.editor.state.selection, i = this.editor.state.doc.textBetween(e, t, " "), s = this._modal.querySelector(".tiptap-link-selected-text"), r = this._modal.querySelector(".tiptap-link-selected-text-label");
    i && i.trim() && (s && s.classList.remove("d-none"), r && (r.textContent = i.length > 60 ? i.substring(0, 60) + "…" : i));
  }
  _populate(e) {
    const t = e.href || "", i = e.target || "", s = e.rel || "", r = e.title || "", o = e.class || "";
    t.startsWith("mailto:") ? (this._switchType("email"), this._modal.querySelector(".tiptap-link-email-input").value = t.replace("mailto:", "")) : t.startsWith("tel:") ? (this._switchType("tel"), this._modal.querySelector(".tiptap-link-tel-input").value = t.replace("tel:", "")) : t.startsWith("#") ? (this._switchType("anchor"), this._modal.querySelector(".tiptap-link-anchor-input").value = t.replace("#", "")) : (this._switchType("url"), this._modal.querySelector(".tiptap-link-href-input").value = t), this._modal.querySelector(".tiptap-link-title-input").value = r, this._modal.querySelector(".tiptap-link-class-input").value = o, this._modal.querySelector(".tiptap-link-blank-check").checked = i === "_blank";
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
    var t;
    switch (((t = this._modal.querySelector(".tiptap-link-type-btn.active")) == null ? void 0 : t.dataset.type) || "url") {
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
    const e = [];
    return this._modal.querySelector(".tiptap-link-blank-check").checked && e.push("noopener"), this._modal.querySelectorAll(".tiptap-link-rel-check:checked").forEach((i) => {
      e.includes(i.value) || e.push(i.value);
    }), e.join(" ");
  }
  _submit() {
    var l;
    const e = this._getHref();
    if (!e) {
      const a = ((l = this._modal.querySelector(".tiptap-link-type-btn.active")) == null ? void 0 : l.dataset.type) || "url", c = {
        url: ".tiptap-link-href-input",
        anchor: ".tiptap-link-anchor-input",
        email: ".tiptap-link-email-input",
        tel: ".tiptap-link-tel-input"
      }, d = this._modal.querySelector(c[a]);
      d && (d.classList.add("is-invalid"), d.focus(), setTimeout(() => d.classList.remove("is-invalid"), 2e3));
      return;
    }
    const t = this._modal.querySelector(".tiptap-link-blank-check").checked ? "_blank" : null, i = this._getRel() || null, s = this._modal.querySelector(".tiptap-link-title-input").value.trim() || null, r = this._modal.querySelector(".tiptap-link-class-input").value.trim() || null, o = { href: e };
    t && (o.target = t), i && (o.rel = i), s && (o.title = s), r && (o.class = r), this.editor.chain().focus().extendMarkRange("link").setLink(o).run(), this._bs.hide();
  }
  _unlink() {
    this.editor.chain().focus().unsetLink().run(), this._bs.hide();
  }
}
class wy {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._editMode = !1, this._pendingFile = null, this._build();
  }
  /* ─────────────────────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode
   */
  open(e = null) {
    this._reset(), this._editMode = !!e;
    const t = this._modal.querySelector(".tiptap-video-modal-title-text");
    t && (t.textContent = this._editMode ? "Edit Video" : "Insert Video");
    const i = this._modal.querySelector(".tiptap-video-insert-btn-text");
    i && (i.textContent = this._editMode ? "Update Video" : "Insert Video"), e && this._populate(e), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ─────────────────────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    t || console.warn("[TiptapEditor] Bootstrap Modal not found. Video modal may not work."), this._bs = t ? new t(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _template() {
    const e = `tiptap-video-modal-${Date.now()}`;
    return `
<div class="modal fade tiptap-video-modal" id="${e}"
     tabindex="-1" aria-labelledby="${e}-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="${e}-title">
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
                  <input type="radio" name="${e}-align" value="left"
                         class="d-none tiptap-video-align-radio">
                  <i class="bi bi-align-start d-block fs-5"></i>
                  <span style="font-size:10px">Left</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1 tiptap-align-active"
                       title="Align center" style="cursor:pointer">
                  <input type="radio" name="${e}-align" value="center"
                         class="d-none tiptap-video-align-radio" checked>
                  <i class="bi bi-align-center d-block fs-5"></i>
                  <span style="font-size:10px">Center</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align right" style="cursor:pointer">
                  <input type="radio" name="${e}-align" value="right"
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
      s.addEventListener("click", () => this._switchTab(s.dataset.tab));
    });
    const e = this._modal.querySelector(".tiptap-video-url-input");
    e.addEventListener("input", () => this._detectProvider()), e.addEventListener("blur", () => this._detectProvider());
    const t = this._modal.querySelector(".tiptap-video-file-input"), i = this._modal.querySelector(".tiptap-video-dropzone");
    t.addEventListener("change", (s) => {
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
  _switchTab(e) {
    this._modal.querySelectorAll(".tiptap-video-tab-btn").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === e);
    }), this._modal.querySelectorAll(".tiptap-video-panel").forEach((t) => {
      t.classList.toggle("d-none", t.dataset.panel !== e);
    });
  }
  _reset() {
    this._editMode = !1, this._pendingFile = null, this._modal.querySelector(".tiptap-video-url-input").value = "", this._modal.querySelector(".tiptap-video-title-input").value = "", this._modal.querySelector(".tiptap-video-caption-input").value = "", this._modal.querySelector(".tiptap-video-width-input").value = "";
    const e = this._modal.querySelector(".tiptap-video-file-input");
    e && (e.value = "");
    const t = this._modal.querySelector(".tiptap-video-file-name");
    t && (t.textContent = "", t.classList.add("d-none"));
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
  _populate(e) {
    const t = e.url || "", i = e.title || "", s = e.caption || "", r = e.aspectRatio || "16x9", o = e.alignment || "center", l = e.widthStyle || "";
    this._modal.querySelector(".tiptap-video-url-input").value = t, this._detectProvider(), this._modal.querySelector(".tiptap-video-title-input").value = i, this._modal.querySelector(".tiptap-video-caption-input").value = s, this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.ratio === r);
    }), this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((a) => {
      a.checked = a.value === o, a.closest(".tiptap-align-btn").classList.toggle("tiptap-align-active", a.value === o);
    }), l && (this._modal.querySelector(".tiptap-video-width-input").value = l, this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.width === l);
    })), this._showPreview(t, e.provider);
  }
  _detectProvider() {
    const e = this._modal.querySelector(".tiptap-video-url-input").value.trim(), t = this._modal.querySelector(".tiptap-video-provider-badge"), i = this._modal.querySelector(".tiptap-video-provider-name");
    if (!e) {
      t.classList.add("d-none"), this._hidePreview();
      return;
    }
    const s = Er(e);
    if (s) {
      const r = { youtube: "YouTube", vimeo: "Vimeo", mp4: "MP4/WebM" };
      i.textContent = r[s.provider] || s.provider, t.classList.remove("d-none"), this._showPreview(e, s.provider, s.videoId);
    } else
      t.classList.add("d-none"), this._hidePreview();
  }
  _handleFileSelect(e) {
    this._pendingFile = e;
    const t = this._modal.querySelector(".tiptap-video-file-name");
    t && (t.textContent = e.name, t.classList.remove("d-none"));
    const i = this._modal.querySelector(".tiptap-video-dropzone-label");
    i && (i.textContent = "File selected");
    const s = URL.createObjectURL(e);
    this._showPreview(s, "mp4");
  }
  _showPreview(e, t, i = null) {
    const s = this._modal.querySelector(".tiptap-video-preview"), r = this._modal.querySelector(".tiptap-video-preview-placeholder");
    if (s.innerHTML = "", t === "mp4") {
      const o = document.createElement("video");
      o.controls = !0, o.className = "w-100", o.style.maxHeight = "160px";
      const l = document.createElement("source");
      l.src = e, l.type = "video/mp4", o.appendChild(l), s.appendChild(o);
    } else {
      const o = yn[t];
      if (o && i) {
        const l = document.createElement("iframe");
        l.src = o.embedUrl(i), l.className = "w-100", l.style.height = "160px", l.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", l.allowFullscreen = !0, l.loading = "lazy", l.frameBorder = "0", s.appendChild(l);
      }
    }
    s.childElementCount > 0 && (s.style.display = "", r && (r.style.display = "none"));
  }
  _hidePreview() {
    const e = this._modal.querySelector(".tiptap-video-preview"), t = this._modal.querySelector(".tiptap-video-preview-placeholder");
    e && (e.innerHTML = "", e.style.display = "none"), t && (t.style.display = "");
  }
  async _submit() {
    var p, h, f;
    let e = null, t = null, i = null;
    if ((((p = this._modal.querySelector(".tiptap-video-tab-btn.active")) == null ? void 0 : p.dataset.tab) || "url") === "upload" && this._pendingFile)
      try {
        const m = this.toolbar._getUploadUrl();
        if (!m) {
          alert("No upload URL configured. Please set data-upload-url on the editor wrapper or add a tiptap-upload-url meta tag.");
          return;
        }
        const g = this._modal.querySelector(".tiptap-video-insert-btn");
        g.disabled = !0, g.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Uploading…', e = (await this.toolbar._uploadFile(this._pendingFile, m)).url, t = "mp4", i = e, g.disabled = !1, g.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>';
      } catch (m) {
        console.error("[TiptapEditor] Video upload failed:", m), alert("Video upload failed. Please try again.");
        const g = this._modal.querySelector(".tiptap-video-insert-btn");
        g.disabled = !1, g.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>';
        return;
      }
    else {
      if (e = this._modal.querySelector(".tiptap-video-url-input").value.trim(), !e) {
        const g = this._modal.querySelector(".tiptap-video-url-input");
        g.classList.add("is-invalid"), g.focus(), setTimeout(() => g.classList.remove("is-invalid"), 2e3);
        return;
      }
      const m = Er(e);
      if (!m) {
        const g = this._modal.querySelector(".tiptap-video-url-input");
        g.classList.add("is-invalid"), g.focus(), alert("Unsupported video URL. Supported: YouTube, Vimeo, MP4/WebM."), setTimeout(() => g.classList.remove("is-invalid"), 2e3);
        return;
      }
      t = m.provider, i = m.videoId;
    }
    const r = this._modal.querySelector(".tiptap-video-title-input").value.trim(), o = this._modal.querySelector(".tiptap-video-caption-input").value.trim(), l = ((h = this._modal.querySelector(".tiptap-video-ratio-btn.active")) == null ? void 0 : h.dataset.ratio) || "16x9", a = ((f = this._modal.querySelector(".tiptap-video-align-radio:checked")) == null ? void 0 : f.value) || "center";
    let c = this._modal.querySelector(".tiptap-video-width-input").value.trim();
    const d = this._modal.querySelector(".tiptap-video-width-btn.active");
    d && d.dataset.width && (c = d.dataset.width), c && !/^\d+(\.\d+)?(px|%)$/.test(c) && (c = "");
    const u = {
      url: e,
      provider: t,
      videoId: i,
      title: r || "",
      caption: o || "",
      aspectRatio: l,
      alignment: a,
      widthStyle: c || null
    };
    this._editMode ? this.editor.chain().focus().updateCustomVideo(u).run() : this.editor.chain().focus().insertCustomVideo(u).run(), this._bs.hide();
  }
}
class xy {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._gridRows = 3, this._gridCols = 3, this._isEditMode = !1, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the table modal.
   * @param {Object|null} existingStyles - If provided, opens in edit mode with { bordered, striped, hover, small }
   */
  open(e = null) {
    this._isEditMode = !!e, this._isEditMode ? this._loadEditValues(e) : this._reset(), this._updateModalUI(), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = t ? new t(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents(), this._renderGrid();
  }
  _reset() {
    this._gridRows = 3, this._gridCols = 3, this._el("rows").value = "3", this._el("cols").value = "3", this._el("headerRow").checked = !0, this._el("bordered").checked = !1, this._el("striped").checked = !1, this._el("hover").checked = !1, this._el("small").checked = !1, this._renderGrid(), this._updateGridLabel();
  }
  _el(e) {
    return this._modal.querySelector(`[data-tbl="${e}"]`);
  }
  _bindEvents() {
    this._modal.querySelector('[data-tbl="insertBtn"]').addEventListener("click", () => {
      this._insert();
    });
    const e = this._el("grid");
    e.addEventListener("mouseover", (t) => {
      const i = t.target.closest("[data-r]");
      if (!i) return;
      const s = parseInt(i.dataset.r), r = parseInt(i.dataset.c);
      this._highlightGrid(s, r), this._updateGridLabel(s, r);
    }), e.addEventListener("mouseleave", () => {
      this._highlightGrid(0, 0), this._updateGridLabel();
    }), e.addEventListener("click", (t) => {
      const i = t.target.closest("[data-r]");
      i && (this._gridRows = parseInt(i.dataset.r), this._gridCols = parseInt(i.dataset.c), this._el("rows").value = this._gridRows, this._el("cols").value = this._gridCols, this._updateGridLabel());
    }), this._el("rows").addEventListener("input", (t) => {
      this._gridRows = Math.min(20, Math.max(1, parseInt(t.target.value) || 1));
    }), this._el("cols").addEventListener("input", (t) => {
      this._gridCols = Math.min(10, Math.max(1, parseInt(t.target.value) || 1));
    });
  }
  _insert() {
    if (this._isEditMode) {
      const e = {
        bordered: this._el("bordered").checked,
        striped: this._el("striped").checked,
        hover: this._el("hover").checked,
        small: this._el("small").checked
      };
      this.editor.chain().focus().updateTableStyles(e).run();
    } else {
      const e = Math.min(20, Math.max(1, parseInt(this._el("rows").value) || 3)), t = Math.min(10, Math.max(1, parseInt(this._el("cols").value) || 3)), i = this._el("headerRow").checked, s = {
        bordered: this._el("bordered").checked,
        striped: this._el("striped").checked,
        hover: this._el("hover").checked,
        small: this._el("small").checked
      };
      this.editor.chain().focus().insertTable({ rows: e, cols: t, withHeaderRow: i }).run(), this.editor.chain().focus().updateTableStyles(s).run();
    }
    this._bs.hide();
  }
  _loadEditValues(e) {
    this._el("bordered").checked = !!e.bordered, this._el("striped").checked = !!e.striped, this._el("hover").checked = !!e.hover, this._el("small").checked = !!e.small;
  }
  _updateModalUI() {
    const e = this._modal.querySelector(".modal-title"), t = this._modal.querySelector('[data-tbl="insertBtn"]'), i = this._el("grid").closest(".text-center"), s = this._el("rows").closest(".col-6"), r = this._el("cols").closest(".col-6"), o = this._el("headerRow").closest(".form-check");
    this._isEditMode ? (e.innerHTML = '<i class="bi bi-table me-2 text-primary"></i>Edit Table Styles', t.innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Styles', i && (i.style.display = "none"), s && (s.style.display = "none"), r && (r.style.display = "none"), o && (o.style.display = "none")) : (e.innerHTML = '<i class="bi bi-table me-2 text-primary"></i>Insert Table', t.innerHTML = '<i class="bi bi-table me-1"></i>Insert Table', i && (i.style.display = ""), s && (s.style.display = ""), r && (r.style.display = ""), o && (o.style.display = ""));
  }
  _renderGrid() {
    const e = this._el("grid");
    e.innerHTML = "";
    const t = 8, i = 8;
    for (let s = 1; s <= t; s++) {
      const r = document.createElement("div");
      r.className = "tiptap-table-grid-row";
      for (let o = 1; o <= i; o++) {
        const l = document.createElement("div");
        l.className = "tiptap-table-grid-cell", l.dataset.r = s, l.dataset.c = o, r.appendChild(l);
      }
      e.appendChild(r);
    }
  }
  _highlightGrid(e, t) {
    this._el("grid").querySelectorAll(".tiptap-table-grid-cell").forEach((i) => {
      const s = parseInt(i.dataset.r), r = parseInt(i.dataset.c);
      i.classList.toggle("highlighted", s <= e && r <= t);
    });
  }
  _updateGridLabel(e, t) {
    const i = this._el("gridLabel");
    e && t ? i.textContent = `${e} × ${t}` : i.textContent = `${this._gridRows} × ${this._gridCols}`;
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
const Ji = class Ji {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._editMode = !1, this._editPos = null, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   * @param {number|null} pos            – node position for edit mode.
   */
  open(e = null, t = null) {
    this._reset(), this._editMode = !!e, this._editPos = t, e ? (this._populate(e), this._el("titleText").textContent = "Edit Button", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update', this._el("deleteBtn").classList.remove("d-none")) : (this._el("titleText").textContent = "Insert Button", this._el("insertBtn").innerHTML = '<i class="bi bi-hand-index me-1"></i>Insert Button', this._el("deleteBtn").classList.add("d-none")), this._updatePreview(), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = t ? new t(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _reset() {
    this._editMode = !1, this._editPos = null, this._el("text").value = "Click me", this._el("url").value = "#", this._setVariant("primary"), this._el("sizeDefault").checked = !0, this._el("outline").checked = !1, this._el("targetSelf").checked = !0, this._el("deleteBtn").classList.add("d-none"), this._updatePreview();
  }
  _populate(e) {
    this._el("text").value = e.text || "Button", this._el("url").value = e.url || "#", this._setVariant(e.variant || "primary"), e.size === "sm" ? this._el("sizeSm").checked = !0 : e.size === "lg" ? this._el("sizeLg").checked = !0 : this._el("sizeDefault").checked = !0, this._el("outline").checked = !!e.outline, e.target === "_blank" ? this._el("targetBlank").checked = !0 : this._el("targetSelf").checked = !0, this._updatePreview();
  }
  _setVariant(e) {
    this._modal.querySelectorAll("[data-btn-variant]").forEach((t) => {
      t.classList.toggle("active", t.dataset.btnVariant === e);
    });
  }
  _getVariant() {
    const e = this._modal.querySelector("[data-btn-variant].active");
    return (e == null ? void 0 : e.dataset.btnVariant) || "primary";
  }
  _el(e) {
    return this._modal.querySelector(`[data-btnm="${e}"]`);
  }
  _bindEvents() {
    this._modal.querySelectorAll("[data-btn-variant]").forEach((e) => {
      e.addEventListener("click", () => {
        this._setVariant(e.dataset.btnVariant), this._updatePreview();
      });
    }), ["text", "url"].forEach((e) => {
      this._el(e).addEventListener("input", () => this._updatePreview());
    }), this._el("outline").addEventListener("change", () => this._updatePreview()), this._modal.querySelectorAll('[name="btnSize"]').forEach((e) => {
      e.addEventListener("change", () => this._updatePreview());
    }), this._el("insertBtn").addEventListener("click", () => this._submit()), this._el("deleteBtn").addEventListener("click", () => {
      this._editMode && this._editPos !== null && this.editor.chain().focus().deleteBootstrapButton().run(), this._bs.hide();
    });
  }
  _submit() {
    var t, i;
    const e = {
      text: this._el("text").value || "Button",
      url: this._el("url").value || "#",
      variant: this._getVariant(),
      size: ((t = this._modal.querySelector('[name="btnSize"]:checked')) == null ? void 0 : t.value) || null,
      outline: this._el("outline").checked,
      target: ((i = this._modal.querySelector('[name="btnTarget"]:checked')) == null ? void 0 : i.value) || "_self"
    };
    e.size === "" && (e.size = null), this._editMode && this._editPos !== null ? this.editor.chain().focus().command(({ tr: s }) => (s.setNodeMarkup(this._editPos, void 0, e), !0)).run() : this.editor.chain().focus().insertBootstrapButton(e).run(), this._bs.hide();
  }
  _updatePreview() {
    var a;
    const e = this._el("preview"), t = this._el("text").value || "Button", i = this._getVariant(), s = this._el("outline").checked, r = ((a = this._modal.querySelector('[name="btnSize"]:checked')) == null ? void 0 : a.value) || "";
    let l = `btn ${s ? `btn-outline-${i}` : `btn-${i}`}`;
    r && (l += ` btn-${r}`), e.innerHTML = `<span class="${l}">${this._escHtml(t)}</span>`;
  }
  _escHtml(e) {
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
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
            ${Ft.map((t) => {
      const i = Ji.VARIANT_COLORS[t] || "#6c757d", s = t === "light" ? "1px solid #dee2e6" : "none", r = ["light", "warning"].includes(t) ? "#000" : "#fff";
      return `<button type="button" class="tiptap-btn-variant-swatch" data-btn-variant="${t}"
                style="background:${i}; border:${s}; color:${r}" title="${t}">
                ${t.charAt(0).toUpperCase()}
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
ms(Ji, "VARIANT_COLORS", {
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
let Tr = Ji;
const Gi = class Gi {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._editMode = !1, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   */
  open(e = null) {
    this._reset(), this._editMode = !!e, e ? (this._populate(e), this._el("titleText").textContent = "Edit Card", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update', this._el("deleteBtn").classList.remove("d-none")) : (this._el("titleText").textContent = "Insert Card", this._el("insertBtn").innerHTML = '<i class="bi bi-card-heading me-1"></i>Insert Card', this._el("deleteBtn").classList.add("d-none")), this._updatePreview(), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = t ? new t(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _reset() {
    this._editMode = !1, this._el("headerText").value = "", this._el("footerText").value = "", this._setBorderColor(""), this._el("deleteBtn").classList.add("d-none"), this._updatePreview();
  }
  _populate(e) {
    this._el("headerText").value = e.headerText || "", this._el("footerText").value = e.footerText || "", this._setBorderColor(e.borderColor || ""), this._updatePreview();
  }
  _el(e) {
    return this._modal.querySelector(`[data-cardm="${e}"]`);
  }
  _setBorderColor(e) {
    this._modal.querySelectorAll("[data-card-border]").forEach((t) => {
      t.classList.toggle("active", t.dataset.cardBorder === e);
    });
  }
  _getBorderColor() {
    const e = this._modal.querySelector("[data-card-border].active");
    return (e == null ? void 0 : e.dataset.cardBorder) || null;
  }
  _bindEvents() {
    this._modal.querySelectorAll("[data-card-border]").forEach((e) => {
      e.addEventListener("click", () => {
        this._getBorderColor() === e.dataset.cardBorder ? this._setBorderColor("") : this._setBorderColor(e.dataset.cardBorder), this._updatePreview();
      });
    }), ["headerText", "footerText"].forEach((e) => {
      this._el(e).addEventListener("input", () => this._updatePreview());
    }), this._el("insertBtn").addEventListener("click", () => this._submit()), this._el("deleteBtn").addEventListener("click", () => {
      this._editMode && this.editor.chain().focus().deleteNode("bootstrapCard").run(), this._bs.hide();
    });
  }
  _submit() {
    const e = {
      headerText: this._el("headerText").value || null,
      footerText: this._el("footerText").value || null,
      borderColor: this._getBorderColor()
    };
    this._editMode ? this.editor.chain().focus().updateAttributes("bootstrapCard", e).run() : this.editor.chain().focus().insertBootstrapCard(e).run(), this._bs.hide();
  }
  _updatePreview() {
    const e = this._el("preview"), t = this._el("headerText").value, i = this._el("footerText").value, s = this._getBorderColor();
    let r = "card";
    s && (r += ` border-${s}`);
    let o = `<div class="${r}" style="max-width: 100%;">`;
    t && (o += `<div class="card-header">${this._escHtml(t)}</div>`), o += '<div class="card-body"><p class="card-text text-muted small">Card content goes here...</p></div>', i && (o += `<div class="card-footer text-muted">${this._escHtml(i)}</div>`), o += "</div>", e.innerHTML = o;
  }
  _escHtml(e) {
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
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
            ${oi.map((t) => {
      const i = Gi.BORDER_COLOR_MAP[t] || "#6c757d", s = t === "light" ? "1px solid #dee2e6" : "none", r = ["light", "warning"].includes(t) ? "#000" : "#fff";
      return `<button type="button" class="tiptap-btn-variant-swatch" data-card-border="${t}"
                style="background:${i}; border:${s}; color:${r}" title="${t}">
                ${t.charAt(0).toUpperCase()}
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
ms(Gi, "BORDER_COLOR_MAP", {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529"
});
let Ar = Gi;
class Sy {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(e) {
    this.toolbar = e, this.editor = e.editor, this._modal = null, this._bs = null, this._images = [], this._editMode = !1, this._build();
  }
  /* ───────────────────────────────────── public ── */
  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode with gallery attrs + images
   */
  open(e = null) {
    this._reset(), this._editMode = !!e, e ? (this._populate(e), this._el("titleText").textContent = "Edit Gallery", this._el("insertBtn").innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Gallery') : (this._el("titleText").textContent = "Insert Gallery", this._el("insertBtn").innerHTML = '<i class="bi bi-images me-1"></i>Insert Gallery'), this._updatePreviewGrid(), this._bs.show();
  }
  destroy() {
    var e;
    this._bs && this._bs.dispose(), (e = this._modal) == null || e.remove();
  }
  /* ───────────────────────────────────── private ── */
  _build() {
    var i;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (i = window.bootstrap) == null ? void 0 : i.Modal;
    this._bs = t ? new t(this._modal) : { show() {
    }, hide() {
    }, dispose() {
    } }, this._bindEvents();
  }
  _reset() {
    this._images = [], this._editMode = !1;
    const e = this._el("fileInput");
    e && (e.value = ""), this._setColumns(3), this._el("gapRange").value = "2", this._el("gapValue").textContent = "2", this._el("lightbox").checked = !1, this._el("dropzoneLabel").textContent = "Drag & drop images here, or click to browse", this._updatePreviewGrid(), this._updateInsertState();
  }
  _populate(e) {
    this._setColumns(e.columns || 3), this._el("gapRange").value = String(e.gap ?? 2), this._el("gapValue").textContent = String(e.gap ?? 2), this._el("lightbox").checked = !!e.lightbox, e.images && Array.isArray(e.images) && (this._images = e.images.map((t) => ({ src: t.src, alt: t.alt || "" }))), this._updatePreviewGrid(), this._updateInsertState();
  }
  _el(e) {
    return this._modal.querySelector(`[data-galm="${e}"]`);
  }
  _setColumns(e) {
    this._modal.querySelectorAll("[data-gal-col]").forEach((t) => {
      t.classList.toggle("active", parseInt(t.dataset.galCol, 10) === e);
    });
  }
  _getColumns() {
    const e = this._modal.querySelector("[data-gal-col].active");
    return e ? parseInt(e.dataset.galCol, 10) : 3;
  }
  _bindEvents() {
    const e = this._el("dropzone"), t = this._el("fileInput");
    e.addEventListener("dragover", (i) => {
      i.preventDefault(), i.stopPropagation(), e.classList.add("border-primary", "bg-primary", "bg-opacity-10");
    }), e.addEventListener("dragleave", (i) => {
      i.preventDefault(), i.stopPropagation(), e.classList.remove("border-primary", "bg-primary", "bg-opacity-10");
    }), e.addEventListener("drop", (i) => {
      i.preventDefault(), i.stopPropagation(), e.classList.remove("border-primary", "bg-primary", "bg-opacity-10");
      const s = Array.from(i.dataTransfer.files).filter((r) => r.type.startsWith("image/"));
      s.length && this._addFiles(s);
    }), t.addEventListener("change", (i) => {
      const s = Array.from(i.target.files || []);
      s.length && this._addFiles(s), t.value = "";
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
  async _addFiles(e) {
    const t = this._el("insertBtn"), i = this._el("dropzoneLabel");
    t.disabled = !0;
    for (const s of e) {
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
    i.textContent = "Drag & drop images here, or click to browse", t.disabled = !1, this._updatePreviewGrid(), this._updateInsertState();
  }
  _removeImage(e) {
    this._images.splice(e, 1), this._updatePreviewGrid(), this._updateInsertState();
  }
  _updatePreviewGrid() {
    const e = this._el("previewGrid"), t = this._el("placeholder"), i = this._el("countBadge");
    if (this._images.length === 0) {
      e.innerHTML = "", e.classList.add("d-none"), t.classList.remove("d-none"), i.textContent = "", i.classList.add("d-none");
      return;
    }
    t.classList.add("d-none"), e.classList.remove("d-none"), i.textContent = `${this._images.length} image${this._images.length > 1 ? "s" : ""}`, i.classList.remove("d-none");
    const s = this._getColumns(), r = `col-${Math.floor(12 / s)}`;
    e.innerHTML = this._images.map((o, l) => `
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
    `).join(""), e.querySelectorAll("[data-gal-remove]").forEach((o) => {
      o.addEventListener("click", (l) => {
        l.preventDefault(), this._removeImage(parseInt(o.dataset.galRemove, 10));
      });
    });
  }
  _updateInsertState() {
    const e = this._el("insertBtn");
    e.disabled = this._images.length === 0;
  }
  _submit() {
    if (this._images.length === 0) return;
    const e = this._images.map((r) => ({ src: r.src, alt: r.alt })), t = this._getColumns(), i = parseInt(this._el("gapRange").value, 10), s = this._el("lightbox").checked;
    this._editMode ? (this.editor.chain().focus().deleteNode("gallery").run(), this.editor.chain().focus().insertGallery({ images: e, columns: t, gap: i, lightbox: s }).run()) : this.editor.chain().focus().insertGallery({ images: e, columns: t, gap: i, lightbox: s }).run(), this._bs.hide();
  }
  _toBase64(e) {
    return new Promise((t, i) => {
      const s = new FileReader();
      s.onload = (r) => t(r.target.result), s.onerror = i, s.readAsDataURL(e);
    });
  }
  _escAttr(e) {
    const t = document.createElement("div");
    return t.textContent = e || "", t.innerHTML;
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
const Us = {
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
}, Cy = [
  { id: "1-col", label: "1 Column", icon: "[ 12 ]" },
  { id: "2-col", label: "2 Columns", icon: "[ 6 | 6 ]" },
  { id: "3-col", label: "3 Columns", icon: "[ 4 | 4 | 4 ]" },
  { id: "4-col", label: "4 Columns", icon: "[ 3 | 3 | 3 | 3 ]" },
  { id: "1-2", label: "Sidebar Left", icon: "[ 4 | 8 ]" },
  { id: "2-1", label: "Sidebar Right", icon: "[ 8 | 4 ]" },
  { id: "1-1-2", label: "2 Narrow + Wide", icon: "[ 3 | 3 | 6 ]" },
  { id: "2-1-1", label: "Wide + 2 Narrow", icon: "[ 6 | 3 | 3 ]" }
], My = [
  { id: "primary", label: "Primary", color: "#0d6efd" },
  { id: "secondary", label: "Secondary", color: "#6c757d" },
  { id: "success", label: "Success", color: "#198754" },
  { id: "danger", label: "Danger", color: "#dc3545" },
  { id: "warning", label: "Warning", color: "#ffc107" },
  { id: "info", label: "Info", color: "#0dcaf0" },
  { id: "light", label: "Light", color: "#f8f9fa" },
  { id: "dark", label: "Dark", color: "#212529" }
];
class Ey {
  /**
   * @param {HTMLElement} toolbarElement - The [data-tiptap-toolbar] element
   * @param {import('@tiptap/core').Editor} editor - Tiptap editor instance
   * @param {Object} config - Toolbar config with groups
   */
  constructor(e, t, i = {}) {
    this.element = e, this.editor = t, this.config = i, this.buttons = /* @__PURE__ */ new Map(), this.editor._tiptapToolbar = this, this.imageModal = new vy(this), this.linkModal = new ky(this), this.videoModal = new wy(this), this.tableModal = new xy(this), this.buttonModal = new Tr(this), this.cardModal = new Ar(this), this.galleryModal = new Sy(this), this._render(), this._bindEvents();
  }
  /**
   * Render toolbar buttons into the toolbar element.
   * @private
   */
  _render() {
    const e = this.config.groups || {}, t = this.element.querySelector(".tiptap-toolbar") || this.element;
    t.innerHTML = "";
    const i = Object.keys(e);
    i.forEach((s, r) => {
      const o = e[s];
      if (!o || o.length === 0) return;
      const l = document.createElement("div");
      if (l.className = "tiptap-toolbar__group", l.setAttribute("role", "group"), l.setAttribute("aria-label", s), o.forEach((a) => {
        const c = Us[a];
        c && (c.type === "color" ? l.appendChild(this._createColorButton(a, c)) : c.type === "dropdown" ? l.appendChild(this._createDropdownButton(a, c)) : l.appendChild(this._createButton(a, c)));
      }), t.appendChild(l), r < i.length - 1) {
        const a = document.createElement("div");
        a.className = "tiptap-toolbar__separator", a.setAttribute("role", "separator"), t.appendChild(a);
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
  _createButton(e, t) {
    const i = document.createElement("button");
    return i.type = "button", i.className = "tiptap-toolbar__button", i.setAttribute("data-action", e), i.setAttribute("aria-label", t.label), i.setAttribute("title", t.label), i.innerHTML = `<i class="bi bi-${t.icon}"></i>`, this.buttons.set(e, i), i;
  }
  /**
   * Create a color picker toolbar button.
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createColorButton(e, t) {
    const i = document.createElement("span");
    i.className = "tiptap-toolbar__color-wrapper", i.style.position = "relative", i.style.display = "inline-flex";
    const s = document.createElement("button");
    s.type = "button", s.className = "tiptap-toolbar__button", s.setAttribute("data-action", e), s.setAttribute("aria-label", t.label), s.setAttribute("title", t.label), s.innerHTML = `<i class="bi bi-${t.icon}"></i>`;
    const r = document.createElement("input");
    return r.type = "color", r.className = "tiptap-toolbar__color-input", r.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; padding: 0; border: 0; cursor: pointer; opacity: 0.7;", r.value = "#000000", r.addEventListener("input", (o) => {
      this.editor.chain().focus().setColor(o.target.value).run();
    }), s.addEventListener("click", () => {
      r.click();
    }), i.appendChild(s), i.appendChild(r), this.buttons.set(e, s), i;
  }
  /**
   * Create a dropdown toolbar button (e.g., layout presets).
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createDropdownButton(e, t) {
    const i = document.createElement("div");
    i.className = "tiptap-toolbar__dropdown", i.style.position = "relative", i.style.display = "inline-flex";
    const s = document.createElement("button");
    s.type = "button", s.className = "tiptap-toolbar__button", s.setAttribute("data-action", e), s.setAttribute("aria-label", t.label), s.setAttribute("title", t.label), s.setAttribute("aria-haspopup", "true"), s.setAttribute("aria-expanded", "false"), s.innerHTML = `<i class="bi bi-${t.icon}"></i>`;
    const r = document.createElement("div");
    return r.className = "tiptap-toolbar__dropdown-menu", r.setAttribute("role", "menu"), r.style.display = "none", e === "row" && Cy.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-layout-preset", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__preset-icon">${o.icon}</span> <span>${o.label}</span>`, r.appendChild(l);
    }), e === "alert" && My.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-alert-type", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__alert-swatch" style="background:${o.color}"></span> <span>${o.label}</span>`, r.appendChild(l);
    }), s.addEventListener("click", (o) => {
      o.stopPropagation();
      const l = r.style.display !== "none";
      this._closeAllDropdowns(), l || (r.style.display = "block", s.setAttribute("aria-expanded", "true"));
    }), r.addEventListener("click", (o) => {
      const l = o.target.closest("[data-layout-preset]");
      if (l) {
        o.stopPropagation();
        const c = l.getAttribute("data-layout-preset");
        this.editor.chain().focus().insertBootstrapRow(c).run(), r.style.display = "none", s.setAttribute("aria-expanded", "false");
        return;
      }
      const a = o.target.closest("[data-alert-type]");
      if (a) {
        o.stopPropagation();
        const c = a.getAttribute("data-alert-type");
        this.editor.isActive("bootstrapAlert") ? this.editor.chain().focus().setAlertType(c).run() : this.editor.chain().focus().insertBootstrapAlert(c).run(), r.style.display = "none", s.setAttribute("aria-expanded", "false");
      }
    }), i.appendChild(s), i.appendChild(r), this.buttons.set(e, s), i;
  }
  /**
   * Close all open dropdowns in the toolbar.
   * @private
   */
  _closeAllDropdowns() {
    this.element.querySelectorAll(".tiptap-toolbar__dropdown-menu").forEach((e) => {
      e.style.display = "none";
    }), this.element.querySelectorAll("[aria-expanded]").forEach((e) => {
      e.setAttribute("aria-expanded", "false");
    });
  }
  /**
   * Bind click events to toolbar buttons.
   * @private
   */
  _bindEvents() {
    this.element.addEventListener("click", (e) => {
      const t = e.target.closest("[data-action]");
      if (!t) return;
      e.preventDefault();
      const i = t.getAttribute("data-action");
      this._executeAction(i);
    }), document.addEventListener("click", (e) => {
      this.element.contains(e.target) || this._closeAllDropdowns();
    });
  }
  /**
   * Execute a toolbar button action.
   * @private
   * @param {string} actionId
   */
  _executeAction(e) {
    const t = Us[e];
    if (!t || !this.editor) return;
    const i = t.command;
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
              small: !!a.attrs.small
            };
            break;
          }
        }
        this.tableModal.open(o);
      } else
        this.tableModal.open();
      return;
    }
    if (i === "_promptColor" || i === "_showLayoutDropdown" || i === "_showAlertDropdown")
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
    t.commandArgs !== void 0 ? s[i](t.commandArgs).run() : s[i]().run();
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
    const e = this.element.closest("[data-tiptap-editor]"), t = e == null ? void 0 : e.getAttribute("data-upload-url");
    return t || ((s = document.querySelector('meta[name="tiptap-upload-url"]')) == null ? void 0 : s.content) || null;
  }
  /**
   * Upload a file to the server.
   * @private
   * @param {File} file
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async _uploadFile(e, t) {
    var l;
    const i = new FormData();
    i.append("file", e);
    const s = ((l = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : l.content) || "", r = await fetch(t, {
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
   * Update active states of all toolbar buttons based on current editor state.
   * @param {import('@tiptap/core').Editor} editor
   */
  updateActiveStates(e) {
    this.buttons.forEach((t, i) => {
      const s = Us[i];
      if (!s || !s.isActive) {
        t.classList.remove("tiptap-toolbar__button--active");
        return;
      }
      try {
        const r = s.isActive(e);
        t.classList.toggle("tiptap-toolbar__button--active", r);
      } catch {
        t.classList.remove("tiptap-toolbar__button--active");
      }
    });
  }
  /**
   * Toggle the AI Assistant panel.
   * Relies on the editor wrapper having an AiPanel instance.
   * @private
   */
  _handleToggleAiPanel() {
    const e = new CustomEvent("tiptap:toggle-ai-panel", { bubbles: !0 });
    this.element.dispatchEvent(e);
  }
  /**
   * Toggle dark mode on the editor.
   * Cycles: auto → dark → light → auto
   * @private
   */
  _handleToggleDarkMode() {
    const e = new CustomEvent("tiptap:toggle-dark-mode", { bubbles: !0 });
    this.element.dispatchEvent(e);
  }
  /**
   * Show keyboard shortcuts help modal.
   * @private
   */
  _handleShowShortcuts() {
    const e = new CustomEvent("tiptap:show-shortcuts", { bubbles: !0 });
    this.element.dispatchEvent(e);
  }
  /**
   * Destroy the toolbar and clean up.
   */
  destroy() {
    var e, t, i, s, r, o, l;
    (e = this.imageModal) == null || e.destroy(), this.imageModal = null, (t = this.linkModal) == null || t.destroy(), this.linkModal = null, (i = this.videoModal) == null || i.destroy(), this.videoModal = null, (s = this.tableModal) == null || s.destroy(), this.tableModal = null, (r = this.buttonModal) == null || r.destroy(), this.buttonModal = null, (o = this.cardModal) == null || o.destroy(), this.cardModal = null, (l = this.galleryModal) == null || l.destroy(), this.galleryModal = null, this.buttons.clear(), this.element.innerHTML = "", this.editor && (this.editor._tiptapToolbar = null), this.editor = null;
  }
}
const nn = {
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
}, Ty = 10, Ws = "tiptap_ai_recent_prompts";
class Ay {
  /**
   * @param {import('./Editor').default} editorInstance - The parent TiptapEditor instance
   * @param {AiPanelConfig} config - AI configuration
   */
  constructor(e, t = {}) {
    this.editorInstance = e, this.config = t, this.panelElement = null, this.currentAction = "generate", this.isOpen = !1, this.isLoading = !1, this.previewContent = null, this._abortController = null, this._build();
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
          ${Object.entries(nn).map(
      ([t, i]) => `<button type="button" class="tiptap-ai-panel__action-btn${t === "generate" ? " active" : ""}" data-ai-action="${t}" title="${i.description}">
          <i class="bi bi-${i.icon}"></i> ${i.label}
        </button>`
    ).join("")}
        </div>

        <p class="tiptap-ai-panel__action-desc" data-ai-action-desc>
          ${nn.generate.description}
        </p>

        <!-- Input Section -->
        <div class="tiptap-ai-panel__input-section" data-ai-input-section>
          <textarea
            class="tiptap-ai-panel__prompt"
            data-ai-prompt
            rows="4"
            placeholder="${nn.generate.placeholder}"
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
    this._els.actionButtons.forEach((e) => {
      e.addEventListener("click", () => {
        this._setAction(e.dataset.aiAction);
      });
    }), this._els.submitBtn.addEventListener("click", () => this._submit()), this._els.cancelBtn.addEventListener("click", () => this._cancelRequest()), this._els.closeBtn.addEventListener("click", () => this.close()), this._els.insertBtn.addEventListener("click", () => this._insertResult()), this._els.regenerateBtn.addEventListener("click", () => this._submit()), this._els.discardBtn.addEventListener("click", () => this._showInput()), this._els.promptArea.addEventListener("keydown", (e) => {
      (e.ctrlKey || e.metaKey) && e.key === "Enter" && (e.preventDefault(), this._submit()), e.key === "Escape" && this.close();
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
  _setAction(e) {
    this.currentAction = e;
    const t = nn[e];
    this._els.actionButtons.forEach((i) => {
      i.classList.toggle("active", i.dataset.aiAction === e);
    }), this._els.promptArea.placeholder = t.placeholder, this._els.actionDescription.textContent = t.description, this._els.submitBtn.innerHTML = `<i class="bi bi-${t.icon}"></i> ${t.label}`, this._showInput();
  }
  /**
   * Submit the AI request.
   * @private
   */
  async _submit() {
    var r;
    const e = this._els.promptArea.value.trim();
    if (!e) {
      this._els.promptArea.classList.add("is-invalid"), this._els.promptArea.focus();
      return;
    }
    this._els.promptArea.classList.remove("is-invalid");
    const t = this.currentAction, i = nn[t];
    let s = { prompt: e, action: t };
    if (i.requiresContent) {
      const o = this.editorInstance.editor, a = this._getSelectedHtml() || o.getHTML();
      if (!a || a === "<p></p>") {
        this._showError("No content available. Please write or select some content first.");
        return;
      }
      s.content = a, t === "translate" && (s.target_lang = e);
    }
    this._saveRecentPrompt(e), this._showLoading();
    try {
      this._abortController = new AbortController();
      const o = this._getEndpointUrl(t), l = await fetch(o, {
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
    const e = this.editorInstance.editor, t = this.currentAction;
    if (t === "refine" || t === "translate") {
      const { from: i, to: s } = e.state.selection;
      i !== s ? e.chain().focus().deleteSelection().insertContent(this.previewContent).run() : e.commands.setContent(this.previewContent);
    } else
      e.chain().focus().insertContent(this.previewContent).run();
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
  _showResult(e) {
    if (this.isLoading = !1, this._els.statusArea.style.display = "none", this._els.inputSection.style.display = "none", this._els.resultSection.style.display = "", this._els.previewContent.innerHTML = e.content, e.tokens_used) {
      const t = document.createElement("small");
      t.className = "text-muted d-block mt-1", t.textContent = `Tokens used: ${e.tokens_used} | Provider: ${e.provider} | Model: ${e.model}`, this._els.previewContent.appendChild(t);
    }
    if (e.truncated) {
      const t = document.createElement("div");
      t.className = "alert alert-warning alert-sm mt-2 py-1 px-2", t.textContent = "Content may be incomplete due to token limits.", this._els.previewContent.appendChild(t);
    }
  }
  /**
   * Show an error message.
   * @param {string} message
   * @private
   */
  _showError(e) {
    var t;
    this.isLoading = !1, this._els.statusArea.style.display = "flex", (t = this._els.statusArea.querySelector(".spinner-border")) == null || t.remove(), this._els.statusText.textContent = `Error: ${e}`, this._els.statusText.classList.add("text-danger"), this._els.cancelBtn.style.display = "none", this._els.submitBtn.style.display = "", this._els.submitBtn.disabled = !1, setTimeout(() => {
      this._els.statusText.classList.remove("text-danger"), this._showInput();
    }, 5e3);
  }
  /**
   * Get the selected HTML from the editor.
   * @returns {string|null}
   * @private
   */
  _getSelectedHtml() {
    const e = this.editorInstance.editor, { from: t, to: i } = e.state.selection;
    if (t === i) return null;
    const s = e.state.doc.slice(t, i), r = document.createElement("div"), o = e.view.domSerializer.serializeFragment(s.content);
    return r.appendChild(o), r.innerHTML;
  }
  /**
   * Get the endpoint URL for an action.
   * @param {string} action
   * @returns {string}
   * @private
   */
  _getEndpointUrl(e) {
    return {
      generate: this.config.generateUrl,
      refine: this.config.refineUrl,
      summarize: this.config.summarizeUrl,
      translate: this.config.translateUrl
    }[e] || this.config.generateUrl;
  }
  /**
   * Get CSRF token from meta tag.
   * @returns {string}
   * @private
   */
  _getCsrfToken() {
    const e = document.querySelector('meta[name="csrf-token"]');
    return e ? e.getAttribute("content") : "";
  }
  /**
   * Save a prompt to recent prompts in localStorage.
   * @param {string} prompt
   * @private
   */
  _saveRecentPrompt(e) {
    try {
      let t = JSON.parse(localStorage.getItem(Ws) || "[]");
      t = t.filter((i) => i !== e), t.unshift(e), t = t.slice(0, Ty), localStorage.setItem(Ws, JSON.stringify(t)), this._loadRecentPrompts();
    } catch {
    }
  }
  /**
   * Load and render recent prompts.
   * @private
   */
  _loadRecentPrompts() {
    try {
      const e = JSON.parse(localStorage.getItem(Ws) || "[]");
      if (e.length === 0) {
        this._els.recentList.innerHTML = "";
        return;
      }
      const t = e.slice(0, 5).map(
        (i) => `<button type="button" class="tiptap-ai-panel__recent-item" title="${this._escapeAttr(i)}">${this._truncate(i, 50)}</button>`
      ).join("");
      this._els.recentList.innerHTML = `
        <div class="tiptap-ai-panel__recent-label">Recent:</div>
        ${t}
      `, this._els.recentList.querySelectorAll(".tiptap-ai-panel__recent-item").forEach((i, s) => {
        i.addEventListener("click", () => {
          this._els.promptArea.value = e[s], this._els.promptArea.focus();
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
  _truncate(e, t) {
    return e.length > t ? e.substring(0, t) + "..." : e;
  }
  /**
   * Escape a string for use in an HTML attribute.
   * @param {string} str
   * @returns {string}
   * @private
   */
  _escapeAttr(e) {
    return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  /**
   * Destroy the AI panel and clean up.
   */
  destroy() {
    this._cancelRequest(), this.panelElement && this.panelElement.parentNode && this.panelElement.parentNode.removeChild(this.panelElement), this.panelElement = null, this._els = null;
  }
}
const _y = [
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
], Ly = [
  { id: "paragraph", label: "Paragraph", icon: "text-paragraph" },
  { id: "heading1", label: "Heading 1", icon: "type-h1" },
  { id: "heading2", label: "Heading 2", icon: "type-h2" },
  { id: "heading3", label: "Heading 3", icon: "type-h3" },
  { id: "bulletList", label: "Bullet List", icon: "list-ul" },
  { id: "orderedList", label: "Ordered List", icon: "list-ol" },
  { id: "blockquote", label: "Blockquote", icon: "blockquote-left" },
  { id: "codeBlock", label: "Code Block", icon: "code-square" }
];
class Ny {
  /**
   * @param {import('./Editor').default} editorInstance - The TiptapEditor instance
   */
  constructor(e) {
    this.editorInstance = e, this.editor = e.editor, this.wrapper = e.wrapper, this.handleEl = null, this.menuEl = null, this.currentBlock = null, this.currentNodePos = null, this._isMenuOpen = !1, this._hideTimeout = null, this._build(), this._bindEvents();
  }
  /**
   * Build the drag handle + context menu DOM.
   * @private
   */
  _build() {
    this.handleEl = document.createElement("button"), this.handleEl.type = "button", this.handleEl.className = "tiptap-block-handle", this.handleEl.innerHTML = '<i class="bi bi-grip-vertical"></i>', this.handleEl.setAttribute("aria-label", "Block actions"), this.handleEl.setAttribute("title", "Block actions"), this.handleEl.style.display = "none", this.menuEl = document.createElement("div"), this.menuEl.className = "tiptap-block-menu", this.menuEl.setAttribute("role", "menu"), this.menuEl.style.display = "none", _y.forEach((i) => {
      if (i.separator) {
        const r = document.createElement("div");
        r.className = "tiptap-block-menu__separator", this.menuEl.appendChild(r);
      }
      const s = document.createElement("button");
      s.type = "button", s.className = `tiptap-block-menu__item${i.danger ? " tiptap-block-menu__item--danger" : ""}`, s.setAttribute("data-action", i.id), s.setAttribute("role", "menuitem"), s.innerHTML = `<i class="bi bi-${i.icon}"></i> <span>${i.label}</span>`, this.menuEl.appendChild(s);
    });
    const e = document.createElement("div");
    e.className = "tiptap-block-menu__separator", this.menuEl.appendChild(e);
    const t = document.createElement("div");
    t.className = "tiptap-block-menu__group-label", t.textContent = "Turn into", this.menuEl.appendChild(t), Ly.forEach((i) => {
      const s = document.createElement("button");
      s.type = "button", s.className = "tiptap-block-menu__item", s.setAttribute("data-turn-into", i.id), s.setAttribute("role", "menuitem"), s.innerHTML = `<i class="bi bi-${i.icon}"></i> <span>${i.label}</span>`, this.menuEl.appendChild(s);
    }), this.wrapper.appendChild(this.handleEl), this.wrapper.appendChild(this.menuEl);
  }
  /**
   * Bind event listeners.
   * @private
   */
  _bindEvents() {
    const e = this.editorInstance.contentElement;
    e && (e.addEventListener("mousemove", (i) => this._onMouseMove(i)), e.addEventListener("mouseleave", () => this._onMouseLeave())), this.handleEl.addEventListener("click", (i) => {
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
    const t = (e == null ? void 0 : e.closest(".ProseMirror")) || e;
    t && t.addEventListener("scroll", () => {
      this._hideHandle(), this._closeMenu();
    });
  }
  /**
   * Handle mousemove over editor content to position the block handle.
   * @private
   * @param {MouseEvent} e
   */
  _onMouseMove(e) {
    if (this._isMenuOpen) return;
    const t = this._findTopLevelBlock(e.target);
    !t || t === this.currentBlock || (this.currentBlock = t, this._positionHandle(t));
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
  _findTopLevelBlock(e) {
    var s;
    if (!e || !e.closest) return null;
    const t = (s = this.editorInstance.contentElement) == null ? void 0 : s.querySelector(".ProseMirror");
    if (!t) return null;
    let i = e;
    for (; i && i.parentElement !== t; )
      i = i.parentElement;
    return !i || i === t ? null : i;
  }
  /**
   * Position the block handle to the left of a block element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _positionHandle(e) {
    if (!this.handleEl) return;
    clearTimeout(this._hideTimeout);
    const t = this.wrapper.getBoundingClientRect(), i = e.getBoundingClientRect();
    this.handleEl.style.display = "flex", this.handleEl.style.position = "absolute", this.handleEl.style.left = "-2px", this.handleEl.style.top = `${i.top - t.top}px`, this._resolveNodePos(e);
  }
  /**
   * Resolve the ProseMirror document position of a DOM element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _resolveNodePos(e) {
    try {
      const t = this.editor.view.posAtDOM(e, 0);
      if (t != null) {
        const i = this.editor.state.doc.resolve(t);
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
    const e = this.handleEl.getBoundingClientRect();
    this.menuEl.style.display = "block", this.menuEl.style.position = "fixed", this.menuEl.style.left = `${e.right + 4}px`, this.menuEl.style.top = `${e.top}px`, requestAnimationFrame(() => {
      const t = this.menuEl.getBoundingClientRect();
      t.right > window.innerWidth - 8 && (this.menuEl.style.left = `${e.left - t.width - 4}px`), t.bottom > window.innerHeight - 8 && (this.menuEl.style.top = `${window.innerHeight - t.height - 8}px`);
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
  _executeAction(e) {
    if (this.currentNodePos == null) {
      this._closeMenu();
      return;
    }
    const { state: t } = this.editor, i = t.doc.nodeAt(this.currentNodePos);
    if (!i) {
      this._closeMenu();
      return;
    }
    switch (e) {
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
  _duplicateBlock(e) {
    const t = this.currentNodePos + e.nodeSize, i = e.toJSON();
    this.editor.chain().focus().insertContentAt(t, i).run();
  }
  /**
   * Move the current block up or down.
   * @private
   * @param {number} direction - -1 for up, 1 for down
   */
  _moveBlock(e) {
    const { state: t } = this.editor, { doc: i } = t, s = this.currentNodePos, r = i.nodeAt(s);
    if (!r) return;
    const o = s + r.nodeSize;
    if (e === -1) {
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
  _deleteBlock(e) {
    const t = this.currentNodePos + e.nodeSize;
    this.editor.chain().focus().deleteRange({ from: this.currentNodePos, to: t }).run();
  }
  /**
   * Turn the current block into a different type.
   * @private
   * @param {string} typeId
   */
  _executeTurnInto(e) {
    if (this.currentNodePos == null) {
      this._closeMenu();
      return;
    }
    switch (this.editor.commands.setTextSelection(this.currentNodePos + 1), e) {
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
function ee(n, e = {}, t = []) {
  const i = document.createElement(n);
  return Object.entries(e).forEach(([s, r]) => {
    s === "className" ? i.className = r : s === "style" && typeof r == "object" ? Object.assign(i.style, r) : s.startsWith("on") && typeof r == "function" ? i.addEventListener(s.slice(2).toLowerCase(), r) : s === "dataset" && typeof r == "object" ? Object.entries(r).forEach(([o, l]) => {
      i.dataset[o] = l;
    }) : i.setAttribute(s, r);
  }), t.forEach((s) => {
    typeof s == "string" ? i.appendChild(document.createTextNode(s)) : s instanceof HTMLElement && i.appendChild(s);
  }), i;
}
function _r() {
  var e;
  const n = ((e = navigator.userAgentData) == null ? void 0 : e.platform) || navigator.platform || "";
  return /mac/i.test(n) ? "mac" : /linux/i.test(n) ? "linux" : "windows";
}
function Oy(n) {
  const t = _r() === "mac";
  return n.replace(/Mod/g, t ? "⌘" : "Ctrl").replace(/Alt/g, t ? "⌥" : "Alt").replace(/Shift/g, t ? "⇧" : "Shift").replace(/\+/g, t ? "" : "+");
}
const Ry = [
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
class Iy {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(e) {
    this.editorInstance = e, this._overlay = null, this._visible = !1, this._handleKeyDown = this._handleKeyDown.bind(this), document.addEventListener("keydown", this._handleKeyDown);
  }
  /**
   * Handle global keydown for Ctrl+/ (Cmd+/) shortcut.
   * @private
   * @param {KeyboardEvent} e
   */
  _handleKeyDown(e) {
    (_r() === "mac" ? e.metaKey : e.ctrlKey) && e.key === "/" && (e.preventDefault(), this.toggle()), e.key === "Escape" && this._visible && this.close();
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
    const e = this._overlay.querySelector(".tiptap-shortcuts-modal__close");
    e && e.focus();
  }
  /**
   * Close the shortcuts modal.
   */
  close() {
    var e;
    !this._visible || !this._overlay || (this._visible = !1, this._overlay.classList.remove("tiptap-shortcuts-overlay--visible"), this._overlay.setAttribute("aria-hidden", "true"), (e = this.editorInstance.editor) == null || e.commands.focus());
  }
  /**
   * Build the modal DOM structure.
   * @private
   */
  _build() {
    this._overlay = ee("div", {
      className: "tiptap-shortcuts-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Keyboard Shortcuts",
      "aria-hidden": "true"
    }), this._overlay.addEventListener("click", (s) => {
      s.target === this._overlay && this.close();
    });
    const e = ee("div", { className: "tiptap-shortcuts-modal" }), t = ee("div", { className: "tiptap-shortcuts-modal__header" }, [
      ee("h3", { className: "tiptap-shortcuts-modal__title" }, ["Keyboard Shortcuts"]),
      ee("button", {
        className: "tiptap-shortcuts-modal__close",
        "aria-label": "Close",
        type: "button",
        onClick: () => this.close()
      }, ["×"])
    ]), i = ee("div", { className: "tiptap-shortcuts-modal__body" });
    Ry.forEach((s) => {
      i.appendChild(
        ee("div", { className: "tiptap-shortcuts__group-title" }, [s.title])
      ), s.shortcuts.forEach((r) => {
        const o = Oy(r.keys), l = this._splitKeys(o), a = ee("span", { className: "tiptap-shortcuts__keys" });
        l.forEach((c) => {
          a.appendChild(
            ee("kbd", { className: "tiptap-shortcuts__key" }, [c])
          );
        }), i.appendChild(
          ee("div", { className: "tiptap-shortcuts__item" }, [
            ee("span", { className: "tiptap-shortcuts__label" }, [r.label]),
            a
          ])
        );
      });
    }), e.appendChild(t), e.appendChild(i), this._overlay.appendChild(e), document.body.appendChild(this._overlay);
  }
  /**
   * Split a formatted shortcut into individual key parts.
   * For Mac: '⌘B' → ['⌘', 'B'], '⌘⇧H' → ['⌘', '⇧', 'H']
   * For Win: 'Ctrl+Shift+H' → ['Ctrl', 'Shift', 'H']
   * @private
   * @param {string} formatted
   * @returns {string[]}
   */
  _splitKeys(e) {
    if (_r() === "mac") {
      const t = [];
      let i = "";
      for (const s of e)
        "⌘⇧⌥".includes(s) ? (i && t.push(i), t.push(s), i = "") : i += s;
      return i && t.push(i), t.length ? t : [e];
    }
    return e.split("+").map((t) => t.trim()).filter(Boolean);
  }
  /**
   * Clean up DOM and event listeners.
   */
  destroy() {
    document.removeEventListener("keydown", this._handleKeyDown), this._overlay && (this._overlay.remove(), this._overlay = null), this._visible = !1;
  }
}
class Dy {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(e) {
    this.editorInstance = e, this.wrapper = e.wrapper, this._liveRegion = null, this._toolbarButtons = [], this._focusedIndex = 0, this._handleToolbarKeyDown = this._handleToolbarKeyDown.bind(this), this._init();
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
    const e = this.wrapper.querySelector("[data-tiptap-toolbar]");
    e && (e.setAttribute("role", "toolbar"), e.setAttribute("aria-label", "Text formatting"), e.setAttribute("aria-orientation", "horizontal"), this._toolbarButtons = Array.from(
      e.querySelectorAll(".tiptap-toolbar__button")
    ), this._toolbarButtons.length !== 0 && (this._toolbarButtons.forEach((t, i) => {
      t.setAttribute("tabindex", i === 0 ? "0" : "-1");
    }), e.addEventListener("keydown", this._handleToolbarKeyDown)));
  }
  /**
   * Set ARIA attributes on the content/editor area.
   * @private
   */
  _setupContentAria() {
    const e = this.wrapper.querySelector("[data-tiptap-content]");
    if (!e) return;
    e.setAttribute("role", "textbox"), e.setAttribute("aria-multiline", "true"), e.setAttribute("aria-label", "Editor content");
    const t = e.querySelector(".ProseMirror");
    t && t.setAttribute("aria-label", "Editor content area");
  }
  /**
   * Create an ARIA live region for screen reader announcements.
   * @private
   */
  _createLiveRegion() {
    this._liveRegion = ee("div", {
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
  announce(e) {
    this._liveRegion && (this._liveRegion.textContent = "", requestAnimationFrame(() => {
      this._liveRegion.textContent = e;
    }));
  }
  /**
   * Handle arrow key navigation in toolbar (roving tabindex pattern).
   * @private
   * @param {KeyboardEvent} e
   */
  _handleToolbarKeyDown(e) {
    var s;
    const t = this._toolbarButtons;
    if (t.length === 0) return;
    let i = !1;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown": {
        this._focusedIndex = (this._focusedIndex + 1) % t.length, i = !0;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        this._focusedIndex = (this._focusedIndex - 1 + t.length) % t.length, i = !0;
        break;
      }
      case "Home": {
        this._focusedIndex = 0, i = !0;
        break;
      }
      case "End": {
        this._focusedIndex = t.length - 1, i = !0;
        break;
      }
      case "Escape": {
        (s = this.editorInstance.editor) == null || s.commands.focus(), i = !0;
        break;
      }
    }
    i && (e.preventDefault(), t.forEach((r, o) => {
      r.setAttribute("tabindex", o === this._focusedIndex ? "0" : "-1");
    }), t[this._focusedIndex].focus());
  }
  /**
   * Refresh toolbar buttons list (call after toolbar re-render).
   */
  refreshToolbar() {
    const e = this.wrapper.querySelector("[data-tiptap-toolbar]");
    e && (this._toolbarButtons = Array.from(
      e.querySelectorAll(".tiptap-toolbar__button")
    ), this._focusedIndex = 0, this._toolbarButtons.forEach((t, i) => {
      t.setAttribute("tabindex", i === 0 ? "0" : "-1");
    }));
  }
  /**
   * Clean up event listeners and DOM.
   */
  destroy() {
    const e = this.wrapper.querySelector("[data-tiptap-toolbar]");
    e && e.removeEventListener("keydown", this._handleToolbarKeyDown), this._liveRegion && (this._liveRegion.remove(), this._liveRegion = null), this._toolbarButtons = [];
  }
}
const Yl = [
  { id: "desktop", label: "Desktop", icon: "bi-display", width: null },
  { id: "tablet", label: "Tablet (768px)", icon: "bi-tablet", width: 768 },
  { id: "mobile", label: "Mobile (375px)", icon: "bi-phone", width: 375 }
];
class Py {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(e) {
    this.editorInstance = e, this.wrapper = e.wrapper, this.contentEl = this.wrapper.querySelector("[data-tiptap-content]"), this.currentMode = "desktop", this._bar = null, this._buttons = /* @__PURE__ */ new Map(), this._sizeLabel = null, this._build();
  }
  /**
   * Build the preview bar and insert it into the editor wrapper.
   * @private
   */
  _build() {
    this._bar = ee("div", {
      className: "tiptap-preview-bar",
      role: "toolbar",
      "aria-label": "Responsive preview"
    }), this._bar.appendChild(
      ee("span", { className: "tiptap-preview-bar__label" }, ["Preview:"])
    ), Yl.forEach((t) => {
      const i = ee("button", {
        className: `tiptap-preview-bar__btn${t.id === "desktop" ? " tiptap-preview-bar__btn--active" : ""}`,
        type: "button",
        "aria-label": t.label,
        title: t.label,
        "aria-pressed": t.id === "desktop" ? "true" : "false",
        dataset: { previewMode: t.id }
      }, [
        ee("i", { className: `bi ${t.icon}` })
      ]);
      i.addEventListener("click", () => this.setMode(t.id)), this._buttons.set(t.id, i), this._bar.appendChild(i);
    }), this._sizeLabel = ee("span", { className: "tiptap-preview-bar__size" }, ["100%"]), this._bar.appendChild(this._sizeLabel);
    const e = this.wrapper.querySelector(".tiptap-editor__footer");
    if (e)
      this.wrapper.insertBefore(this._bar, e);
    else {
      const t = this.wrapper.querySelector("[data-tiptap-input]");
      t ? this.wrapper.insertBefore(this._bar, t) : this.wrapper.appendChild(this._bar);
    }
  }
  /**
   * Set the preview mode.
   * @param {string} modeId - 'desktop', 'tablet', or 'mobile'
   */
  setMode(e) {
    const t = Yl.find((i) => i.id === e);
    !t || e === this.currentMode || (this.currentMode = e, this._buttons.forEach((i, s) => {
      const r = s === e;
      i.classList.toggle("tiptap-preview-bar__btn--active", r), i.setAttribute("aria-pressed", r ? "true" : "false");
    }), this.contentEl && (this.contentEl.classList.remove(
      "tiptap-editor__content--preview-tablet",
      "tiptap-editor__content--preview-mobile"
    ), e === "tablet" ? this.contentEl.classList.add("tiptap-editor__content--preview-tablet") : e === "mobile" && this.contentEl.classList.add("tiptap-editor__content--preview-mobile")), this._sizeLabel && (this._sizeLabel.textContent = t.width ? `${t.width}px` : "100%"), this.editorInstance.a11y && this.editorInstance.a11y.announce(`Preview mode: ${t.label}`));
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
class By {
  /**
   * @param {HTMLElement} wrapperElement - The .tiptap-editor-wrapper element
   * @param {TiptapEditorConfig} config - Editor configuration from data-config
   */
  constructor(e, t = {}) {
    this.wrapper = e, this.config = t, this.contentElement = e.querySelector("[data-tiptap-content]"), this.inputElement = e.querySelector("[data-tiptap-input]"), this.toolbarElement = e.querySelector("[data-tiptap-toolbar]"), this.editor = null, this.toolbar = null, this.isDisabled = e.hasAttribute("data-disabled"), this.aiPanel = null, this.blockMenu = null, this.shortcuts = null, this.a11y = null, this.responsivePreview = null, this._listeners = {}, this._init();
  }
  /**
   * Initialize the Tiptap editor instance with configured extensions.
   * @private
   */
  _init() {
    var i;
    const e = this._buildExtensions(), t = this._getInitialContent();
    this.editor = new om({
      element: this.contentElement,
      extensions: e,
      content: t,
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
    }), this.toolbarElement && (this.toolbar = new Ey(this.toolbarElement, this.editor, this.config.toolbar || {})), (i = this.config.ai) != null && i.enabled && (this.aiPanel = new Ay(this, this.config.ai), this.wrapper.addEventListener("tiptap:toggle-ai-panel", () => {
      this.openAiPanel();
    })), this.blockMenu = new Ny(this), this.a11y = new Dy(this), this.shortcuts = new Iy(this), this.responsivePreview = new Py(this), this._initTheme(), this.wrapper.addEventListener("tiptap:insert-image", () => {
      this.toolbar && this.toolbar._handleImage();
    }), this.wrapper.addEventListener("tiptap:toggle-dark-mode", () => {
      const s = this.getTheme(), r = s === "auto" ? "dark" : s === "dark" ? "light" : "auto";
      this.setTheme(r);
    }), this.wrapper.addEventListener("tiptap:show-shortcuts", () => {
      this.openShortcuts();
    }), this._syncToInput();
  }
  /**
   * Build the list of Tiptap extensions based on configuration.
   * @private
   * @returns {Array} Array of Tiptap extensions
   */
  _buildExtensions() {
    var i;
    const e = this.config.extensions || [], t = [];
    return t.push(
      cg.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      })
    ), e.includes("underline") && t.push(dg), e.includes("link") && t.push(
      Dg.configure({
        openOnClick: !1,
        HTMLAttributes: {
          rel: null
        }
      })
    ), e.includes("textAlign") && t.push(
      Pg.configure({
        types: ["heading", "paragraph"]
      })
    ), t.push(
      Bg.configure({
        placeholder: this.config.placeholder || "Start writing..."
      })
    ), e.includes("characterCount") && t.push(Hg), e.includes("subscript") && t.push(zg), e.includes("superscript") && t.push($g), e.includes("color") && (t.push(qg), t.push(Vg)), e.includes("highlight") && t.push(
      jg.configure({
        multicolor: !0
      })
    ), e.includes("customImage") && t.push(oy), e.includes("customVideo") && t.push(ly), e.includes("table") && (t.push(
      Yb.configure({
        resizable: !0
      })
    ), t.push(Xb), t.push(Qb), t.push(Zb)), e.includes("bootstrapRow") && t.push(ey), (e.includes("bootstrapCol") || e.includes("bootstrapRow")) && (t.some((s) => s.name === "bootstrapCol") || t.push(ty)), e.includes("bootstrapAlert") && t.push(ny), e.includes("bootstrapCard") && t.push(iy), e.includes("bootstrapButton") && t.push(sy), e.includes("gallery") && (t.push(ay), t.push(cy)), e.includes("slashCommands") && t.push(yy.configure({
      commands: ((i = this.config.slashCommands) == null ? void 0 : i.commands) || null
    })), t;
  }
  /**
   * Parse the initial content from the hidden input.
   * @private
   * @returns {Object|string|null}
   */
  _getInitialContent() {
    if (!this.inputElement) return null;
    const e = this.inputElement.value;
    if (!e) return null;
    try {
      const t = JSON.parse(e);
      return t && t.type === "doc", t;
    } catch {
      return e;
    }
  }
  /**
   * Sync editor JSON content to the hidden input element.
   * @private
   */
  _syncToInput() {
    if (!this.inputElement || !this.editor) return;
    const e = this.editor.getJSON();
    this.inputElement.value = JSON.stringify(e);
  }
  // ─── Public API ────────────────────────────────────────────────
  /**
   * Get editor content as Tiptap JSON.
   * @returns {Object}
   */
  getJSON() {
    var e;
    return ((e = this.editor) == null ? void 0 : e.getJSON()) ?? {};
  }
  /**
   * Get editor content as HTML string.
   * @returns {string}
   */
  getHTML() {
    var e;
    return ((e = this.editor) == null ? void 0 : e.getHTML()) ?? "";
  }
  /**
   * Get plain text content.
   * @returns {string}
   */
  getText() {
    var e;
    return ((e = this.editor) == null ? void 0 : e.getText()) ?? "";
  }
  /**
   * Set editor content.
   * @param {Object|string} content - Tiptap JSON object or HTML string
   * @param {boolean} emitUpdate - Whether to trigger update events
   */
  setContent(e, t = !0) {
    this.editor && (this.editor.commands.setContent(e, t), this._syncToInput());
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
    var e;
    return ((e = this.editor) == null ? void 0 : e.isEmpty) ?? !0;
  }
  /**
   * Get the character count.
   * @returns {number}
   */
  getCharacterCount() {
    var e, t;
    return ((t = (e = this.editor) == null ? void 0 : e.storage.characterCount) == null ? void 0 : t.characters()) ?? 0;
  }
  /**
   * Enable or disable the editor.
   * @param {boolean} editable
   */
  setEditable(e) {
    this.editor && (this.editor.setEditable(e), this.isDisabled = !e, e ? this.wrapper.removeAttribute("data-disabled") : this.wrapper.setAttribute("data-disabled", ""));
  }
  /**
   * Focus the editor.
   * @param {string} position - 'start', 'end', or 'all'
   */
  focus(e = "end") {
    var t;
    (t = this.editor) == null || t.commands.focus(e);
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
  setTheme(e = "auto") {
    e === "auto" ? this.wrapper.removeAttribute("data-theme") : this.wrapper.setAttribute("data-theme", e), this._emit("themeChange", { theme: e });
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
    const e = this.config.theme;
    e && e !== "auto" && this.wrapper.setAttribute("data-theme", e);
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
  on(e, t) {
    return this._listeners[e] || (this._listeners[e] = []), this._listeners[e].push(t), this;
  }
  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} callback
   * @returns {TiptapEditor}
   */
  off(e, t) {
    return this._listeners[e] ? (this._listeners[e] = this._listeners[e].filter((i) => i !== t), this) : this;
  }
  /**
   * Emit an event to all registered listeners.
   * @private
   * @param {string} event
   * @param {*} data
   */
  _emit(e, t) {
    this._listeners[e] && this._listeners[e].forEach((i) => i(t));
  }
}
class $y {
  /**
   * @param {Object} options
   * @param {string} options.browseUrl - API endpoint for browsing media
   * @param {string} options.uploadUrl - API endpoint for uploading media
   * @param {Function} options.onSelect - Callback when media is selected
   * @param {string} [options.type] - Filter type: 'image' | 'video' | null (all)
   */
  constructor(e = {}) {
    this.browseUrl = e.browseUrl || null, this.uploadUrl = e.uploadUrl || null, this.onSelect = e.onSelect || (() => {
    }), this.type = e.type || null, this.modal = null, this.currentPage = 1, this.searchQuery = "";
  }
  /**
   * Open the media browser modal.
   */
  open() {
    this.modal && this.modal.remove(), this.modal = this._createModal(), document.body.appendChild(this.modal), document.body.style.overflow = "hidden", this._loadMedia(), setTimeout(() => {
      const e = this.modal.querySelector("[data-media-search]");
      e && e.focus();
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
    const e = document.createElement("div");
    e.className = "tiptap-media-browser__overlay", e.innerHTML = `
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
    `, e.querySelector("[data-media-close]").addEventListener("click", () => this.close()), e.addEventListener("click", (o) => {
      o.target === e && this.close();
    });
    const t = (o) => {
      o.key === "Escape" && (this.close(), document.removeEventListener("keydown", t));
    };
    document.addEventListener("keydown", t);
    const i = e.querySelector("[data-media-search]");
    let s;
    i.addEventListener("input", (o) => {
      clearTimeout(s), this.searchQuery = o.target.value, s = setTimeout(() => {
        this.currentPage = 1, this._loadMedia();
      }, 300);
    }), e.querySelectorAll("[data-media-filter]").forEach((o) => {
      o.addEventListener("click", () => {
        e.querySelectorAll("[data-media-filter]").forEach((l) => l.classList.remove("active")), o.classList.add("active"), this.type = o.getAttribute("data-media-filter") || null, this.currentPage = 1, this._loadMedia();
      });
    });
    const r = e.querySelector("[data-media-upload]");
    return r && r.addEventListener("change", (o) => this._handleUpload(o)), e;
  }
  /**
   * Load media from the browse API.
   * @private
   */
  async _loadMedia() {
    if (!this.browseUrl || !this.modal) return;
    const e = this.modal.querySelector("[data-media-grid]");
    e.innerHTML = '<div class="tiptap-media-browser__loading">Loading...</div>';
    try {
      const t = new URLSearchParams();
      t.set("page", String(this.currentPage)), this.type && t.set("type", this.type), this.searchQuery && t.set("search", this.searchQuery);
      const i = await fetch(`${this.browseUrl}?${t.toString()}`, {
        headers: { Accept: "application/json" }
      });
      if (!i.ok) throw new Error("Failed to load media");
      const s = await i.json();
      this._renderGrid(s.data || []), this._renderPagination(s.pagination || {});
    } catch (t) {
      e.innerHTML = '<div class="tiptap-media-browser__error">Failed to load media.</div>', console.error("[MediaBrowser]", t);
    }
  }
  /**
   * Render media items in the grid.
   * @private
   * @param {Array<Object>} items
   */
  _renderGrid(e) {
    var i;
    const t = (i = this.modal) == null ? void 0 : i.querySelector("[data-media-grid]");
    if (t) {
      if (e.length === 0) {
        t.innerHTML = '<div class="tiptap-media-browser__empty">No media found.</div>';
        return;
      }
      t.innerHTML = "", e.forEach((s) => {
        var o;
        const r = document.createElement("div");
        r.className = "tiptap-media-browser__item", r.setAttribute("data-media-id", s.id), (o = s.mime_type) != null && o.startsWith("image/") ? r.innerHTML = `<img src="${s.thumbnail || s.url}" alt="${s.alt || s.filename}" loading="lazy">` : r.innerHTML = '<div class="tiptap-media-browser__video-thumb"><i class="bi bi-play-btn"></i></div>', r.innerHTML += `<div class="tiptap-media-browser__item-name">${s.filename}</div>`, r.addEventListener("click", () => {
          this.onSelect(s), this.close();
        }), t.appendChild(r);
      });
    }
  }
  /**
   * Render pagination controls.
   * @private
   * @param {Object} pagination
   */
  _renderPagination(e) {
    var i;
    const t = (i = this.modal) == null ? void 0 : i.querySelector("[data-media-pagination]");
    if (t && (t.innerHTML = "", !(!e.last_page || e.last_page <= 1)))
      for (let s = 1; s <= e.last_page; s++) {
        const r = document.createElement("button");
        r.type = "button", r.className = "tiptap-media-browser__page-btn", s === e.current_page && r.classList.add("active"), r.textContent = String(s), r.addEventListener("click", () => {
          this.currentPage = s, this._loadMedia();
        }), t.appendChild(r);
      }
  }
  /**
   * Handle file upload from the modal.
   * @private
   */
  async _handleUpload(e) {
    var i, s;
    const t = (i = e.target.files) == null ? void 0 : i[0];
    if (!(!t || !this.uploadUrl)) {
      try {
        const r = new FormData();
        r.append("file", t);
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
      e.target.value = "";
    }
  }
}
const On = /* @__PURE__ */ new Map();
function Xl() {
  const n = document.querySelectorAll("[data-tiptap-editor]"), e = [];
  return n.forEach((t) => {
    if (t.dataset.initialized === "true") return;
    const i = t.dataset.config, s = i ? JSON.parse(i) : {}, r = new By(t, s), o = t.id || `tiptap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    t.id = o, t.dataset.initialized = "true", On.set(o, r), e.push(r);
  }), e;
}
function Fy(n) {
  return On.get(n);
}
function qy() {
  return On;
}
function Vy(n) {
  const e = On.get(n);
  e && (e.destroy(), On.delete(n));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Xl) : Xl();
export {
  Dy as AccessibilityManager,
  Ay as AiPanel,
  Ny as BlockMenu,
  Iy as KeyboardShortcuts,
  $y as MediaBrowser,
  Py as ResponsivePreview,
  By as TiptapEditor,
  Vy as destroyEditor,
  qy as getAllEditors,
  Fy as getEditor,
  Xl as initEditors
};
//# sourceMappingURL=tiptap-editor.es.js.map
