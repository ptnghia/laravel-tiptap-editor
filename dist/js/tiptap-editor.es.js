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
    var i = t && t != n ? this.remove(t) : this, r = i.find(n), s = i.content.slice();
    return r == -1 ? s.push(t || n, e) : (s[r + 1] = e, t && (s[r] = t)), new Z(s);
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
    var i = this.remove(e), r = i.content.slice(), s = i.find(n);
    return r.splice(s == -1 ? r.length : s, 0, e, t), new Z(r);
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
function Kl(n, e, t) {
  for (let i = 0; ; i++) {
    if (i == n.childCount || i == e.childCount)
      return n.childCount == e.childCount ? null : t;
    let r = n.child(i), s = e.child(i);
    if (r == s) {
      t += r.nodeSize;
      continue;
    }
    if (!r.sameMarkup(s))
      return t;
    if (r.isText && r.text != s.text) {
      for (let o = 0; r.text[o] == s.text[o]; o++)
        t++;
      return t;
    }
    if (r.content.size || s.content.size) {
      let o = Kl(r.content, s.content, t + 1);
      if (o != null)
        return o;
    }
    t += r.nodeSize;
  }
}
function Jl(n, e, t, i) {
  for (let r = n.childCount, s = e.childCount; ; ) {
    if (r == 0 || s == 0)
      return r == s ? null : { a: t, b: i };
    let o = n.child(--r), l = e.child(--s), a = o.nodeSize;
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
      let c = Jl(o.content, l.content, t - 1, i - 1);
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
  nodesBetween(e, t, i, r = 0, s) {
    for (let o = 0, l = 0; l < t; o++) {
      let a = this.content[o], c = l + a.nodeSize;
      if (c > e && i(a, r + l, s || null, o) !== !1 && a.content.size) {
        let d = l + 1;
        a.nodesBetween(Math.max(0, e - d), Math.min(a.content.size, t - d), i, r + d);
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
  textBetween(e, t, i, r) {
    let s = "", o = !0;
    return this.nodesBetween(e, t, (l, a) => {
      let c = l.isText ? l.text.slice(Math.max(e, a) - a, t - a) : l.isLeaf ? r ? typeof r == "function" ? r(l) : r : l.type.spec.leafText ? l.type.spec.leafText(l) : "" : "";
      l.isBlock && (l.isLeaf && c || l.isTextblock) && i && (o ? o = !1 : s += i), s += c;
    }, 0), s;
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
    let t = this.lastChild, i = e.firstChild, r = this.content.slice(), s = 0;
    for (t.isText && t.sameMarkup(i) && (r[r.length - 1] = t.withText(t.text + i.text), s = 1); s < e.content.length; s++)
      r.push(e.content[s]);
    return new y(r, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, t = this.size) {
    if (e == 0 && t == this.size)
      return this;
    let i = [], r = 0;
    if (t > e)
      for (let s = 0, o = 0; o < t; s++) {
        let l = this.content[s], a = o + l.nodeSize;
        a > e && ((o < e || a > t) && (l.isText ? l = l.cut(Math.max(0, e - o), Math.min(l.text.length, t - o)) : l = l.cut(Math.max(0, e - o - 1), Math.min(l.content.size, t - o - 1))), i.push(l), r += l.nodeSize), o = a;
      }
    return new y(i, r);
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
    let r = this.content.slice(), s = this.size + t.nodeSize - i.nodeSize;
    return r[e] = t, new y(r, s);
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
      let r = this.content[t];
      e(r, i, t), i += r.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(e, t = 0) {
    return Kl(this, e, t);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(e, t = this.size, i = e.size) {
    return Jl(this, e, t, i);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return Pn(0, e);
    if (e == this.size)
      return Pn(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let t = 0, i = 0; ; t++) {
      let r = this.child(t), s = i + r.nodeSize;
      if (s >= e)
        return s == e ? Pn(t + 1, s) : Pn(t, i);
      i = s;
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
    for (let r = 0; r < e.length; r++) {
      let s = e[r];
      i += s.nodeSize, r && s.isText && e[r - 1].sameMarkup(s) ? (t || (t = e.slice(0, r)), t[t.length - 1] = s.withText(t[t.length - 1].text + s.text)) : t && t.push(s);
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
const ur = { index: 0, offset: 0 };
function Pn(n, e) {
  return ur.index = n, ur.offset = e, ur;
}
function oi(n, e) {
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
      if (!oi(n[i], e[i]))
        return !1;
  } else {
    for (let i in n)
      if (!(i in e) || !oi(n[i], e[i]))
        return !1;
    for (let i in e)
      if (!(i in n))
        return !1;
  }
  return !0;
}
let P = class Fr {
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
    for (let r = 0; r < e.length; r++) {
      let s = e[r];
      if (this.eq(s))
        return e;
      if (this.type.excludes(s.type))
        t || (t = e.slice(0, r));
      else {
        if (s.type.excludes(this.type))
          return e;
        !i && s.type.rank > this.type.rank && (t || (t = e.slice(0, r)), t.push(this), i = !0), t && t.push(s);
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
    return this == e || this.type == e.type && oi(this.attrs, e.attrs);
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
    let r = i.create(t.attrs);
    return i.checkAttrs(r.attrs), r;
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
      return Fr.none;
    if (e instanceof Fr)
      return [e];
    let t = e.slice();
    return t.sort((i, r) => i.type.rank - r.type.rank), t;
  }
};
P.none = [];
class li extends Error {
}
class x {
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
    let i = Yl(this.content, e + this.openStart, t);
    return i && new x(i, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(e, t) {
    return new x(Gl(this.content, e + this.openStart, t + this.openStart), this.openStart, this.openEnd);
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
      return x.empty;
    let i = t.openStart || 0, r = t.openEnd || 0;
    if (typeof i != "number" || typeof r != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new x(y.fromJSON(e, t.content), i, r);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, t = !0) {
    let i = 0, r = 0;
    for (let s = e.firstChild; s && !s.isLeaf && (t || !s.type.spec.isolating); s = s.firstChild)
      i++;
    for (let s = e.lastChild; s && !s.isLeaf && (t || !s.type.spec.isolating); s = s.lastChild)
      r++;
    return new x(e, i, r);
  }
}
x.empty = new x(y.empty, 0, 0);
function Gl(n, e, t) {
  let { index: i, offset: r } = n.findIndex(e), s = n.maybeChild(i), { index: o, offset: l } = n.findIndex(t);
  if (r == e || s.isText) {
    if (l != t && !n.child(o).isText)
      throw new RangeError("Removing non-flat range");
    return n.cut(0, e).append(n.cut(t));
  }
  if (i != o)
    throw new RangeError("Removing non-flat range");
  return n.replaceChild(i, s.copy(Gl(s.content, e - r - 1, t - r - 1)));
}
function Yl(n, e, t, i) {
  let { index: r, offset: s } = n.findIndex(e), o = n.maybeChild(r);
  if (s == e || o.isText)
    return i && !i.canReplace(r, r, t) ? null : n.cut(0, e).append(t).append(n.cut(e));
  let l = Yl(o.content, e - s - 1, t, o);
  return l && n.replaceChild(r, o.copy(l));
}
function nd(n, e, t) {
  if (t.openStart > n.depth)
    throw new li("Inserted content deeper than insertion position");
  if (n.depth - t.openStart != e.depth - t.openEnd)
    throw new li("Inconsistent open depths");
  return Xl(n, e, t, 0);
}
function Xl(n, e, t, i) {
  let r = n.index(i), s = n.node(i);
  if (r == e.index(i) && i < n.depth - t.openStart) {
    let o = Xl(n, e, t, i + 1);
    return s.copy(s.content.replaceChild(r, o));
  } else if (t.content.size)
    if (!t.openStart && !t.openEnd && n.depth == i && e.depth == i) {
      let o = n.parent, l = o.content;
      return xt(o, l.cut(0, n.parentOffset).append(t.content).append(l.cut(e.parentOffset)));
    } else {
      let { start: o, end: l } = id(t, n);
      return xt(s, Zl(n, o, l, e, i));
    }
  else return xt(s, ai(n, e, i));
}
function Ql(n, e) {
  if (!e.type.compatibleContent(n.type))
    throw new li("Cannot join " + e.type.name + " onto " + n.type.name);
}
function qr(n, e, t) {
  let i = n.node(t);
  return Ql(i, e.node(t)), i;
}
function St(n, e) {
  let t = e.length - 1;
  t >= 0 && n.isText && n.sameMarkup(e[t]) ? e[t] = n.withText(e[t].text + n.text) : e.push(n);
}
function ln(n, e, t, i) {
  let r = (e || n).node(t), s = 0, o = e ? e.index(t) : r.childCount;
  n && (s = n.index(t), n.depth > t ? s++ : n.textOffset && (St(n.nodeAfter, i), s++));
  for (let l = s; l < o; l++)
    St(r.child(l), i);
  e && e.depth == t && e.textOffset && St(e.nodeBefore, i);
}
function xt(n, e) {
  return n.type.checkContent(e), n.copy(e);
}
function Zl(n, e, t, i, r) {
  let s = n.depth > r && qr(n, e, r + 1), o = i.depth > r && qr(t, i, r + 1), l = [];
  return ln(null, n, r, l), s && o && e.index(r) == t.index(r) ? (Ql(s, o), St(xt(s, Zl(n, e, t, i, r + 1)), l)) : (s && St(xt(s, ai(n, e, r + 1)), l), ln(e, t, r, l), o && St(xt(o, ai(t, i, r + 1)), l)), ln(i, null, r, l), new y(l);
}
function ai(n, e, t) {
  let i = [];
  if (ln(null, n, t, i), n.depth > t) {
    let r = qr(n, e, t + 1);
    St(xt(r, ai(n, e, t + 1)), i);
  }
  return ln(e, null, t, i), new y(i);
}
function id(n, e) {
  let t = e.depth - n.openStart, r = e.node(t).copy(n.content);
  for (let s = t - 1; s >= 0; s--)
    r = e.node(s).copy(y.from(r));
  return {
    start: r.resolveNoCache(n.openStart + t),
    end: r.resolveNoCache(r.content.size - n.openEnd - t)
  };
}
class yn {
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
    let i = this.pos - this.path[this.path.length - 1], r = e.child(t);
    return i ? e.child(t).cut(i) : r;
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
    let i = this.path[t * 3], r = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let s = 0; s < e; s++)
      r += i.child(s).nodeSize;
    return r;
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
    let i = e.maybeChild(t - 1), r = e.maybeChild(t);
    if (!i) {
      let l = i;
      i = r, r = l;
    }
    let s = i.marks;
    for (var o = 0; o < s.length; o++)
      s[o].type.spec.inclusive === !1 && (!r || !s[o].isInSet(r.marks)) && (s = s[o--].removeFromSet(s));
    return s;
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
    let i = t.marks, r = e.parent.maybeChild(e.index());
    for (var s = 0; s < i.length; s++)
      i[s].type.spec.inclusive === !1 && (!r || !i[s].isInSet(r.marks)) && (i = i[s--].removeFromSet(i));
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
        return new ci(this, e, i);
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
    let i = [], r = 0, s = t;
    for (let o = e; ; ) {
      let { index: l, offset: a } = o.content.findIndex(s), c = s - a;
      if (i.push(o, l, r + a), !c || (o = o.child(l), o.isText))
        break;
      s = c - 1, r += a + 1;
    }
    return new yn(t, i, s);
  }
  /**
  @internal
  */
  static resolveCached(e, t) {
    let i = lo.get(e);
    if (i)
      for (let s = 0; s < i.elts.length; s++) {
        let o = i.elts[s];
        if (o.pos == t)
          return o;
      }
    else
      lo.set(e, i = new rd());
    let r = i.elts[i.i] = yn.resolve(e, t);
    return i.i = (i.i + 1) % sd, r;
  }
}
class rd {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const sd = 12, lo = /* @__PURE__ */ new WeakMap();
class ci {
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
const od = /* @__PURE__ */ Object.create(null);
let rt = class Vr {
  /**
  @internal
  */
  constructor(e, t, i, r = P.none) {
    this.type = e, this.attrs = t, this.marks = r, this.content = i || y.empty;
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
  nodesBetween(e, t, i, r = 0) {
    this.content.nodesBetween(e, t, i, r, this);
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
  textBetween(e, t, i, r) {
    return this.content.textBetween(e, t, i, r);
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
    return this.type == e && oi(this.attrs, t || e.defaultAttrs || od) && P.sameSet(this.marks, i || P.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new Vr(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new Vr(this.type, this.attrs, this.content, e);
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
      return x.empty;
    let r = this.resolve(e), s = this.resolve(t), o = i ? 0 : r.sharedDepth(t), l = r.start(o), c = r.node(o).content.cut(r.pos - l, s.pos - l);
    return new x(c, r.depth - o, s.depth - o);
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
    return nd(this.resolve(e), this.resolve(t), i);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: i, offset: r } = t.content.findIndex(e);
      if (t = t.maybeChild(i), !t)
        return null;
      if (r == e || t.isText)
        return t;
      e -= r + 1;
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
    let r = this.content.child(t - 1);
    return { node: r, index: t - 1, offset: i - r.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return yn.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return yn.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, t, i) {
    let r = !1;
    return t > e && this.nodesBetween(e, t, (s) => (i.isInSet(s.marks) && (r = !0), !r)), r;
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
    return this.content.size && (e += "(" + this.content.toStringInner() + ")"), ea(this.marks, e);
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
  canReplace(e, t, i = y.empty, r = 0, s = i.childCount) {
    let o = this.contentMatchAt(e).matchFragment(i, r, s), l = o && o.matchFragment(this.content, t);
    if (!l || !l.validEnd)
      return !1;
    for (let a = r; a < s; a++)
      if (!this.type.allowsMarks(i.child(a).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(e, t, i, r) {
    if (r && !this.type.allowsMarks(r))
      return !1;
    let s = this.contentMatchAt(e).matchType(i), o = s && s.matchFragment(this.content, t);
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
    let r = y.fromJSON(e, t.content), s = e.nodeType(t.type).create(t.attrs, r, i);
    return s.type.checkAttrs(s.attrs), s;
  }
};
rt.prototype.text = void 0;
class di extends rt {
  /**
  @internal
  */
  constructor(e, t, i, r) {
    if (super(e, t, null, r), !i)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = i;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : ea(this.marks, JSON.stringify(this.text));
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
    return e == this.marks ? this : new di(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new di(this.type, this.attrs, e, this.marks);
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
function ea(n, e) {
  for (let t = n.length - 1; t >= 0; t--)
    e = n[t].type.name + "(" + e + ")";
  return e;
}
class At {
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
    let i = new ld(e, t);
    if (i.next == null)
      return At.empty;
    let r = ta(i);
    i.next && i.err("Unexpected trailing text");
    let s = fd(hd(r));
    return md(s, i), s;
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
    let r = this;
    for (let s = t; r && s < i; s++)
      r = r.matchType(e.child(s).type);
    return r;
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
    let r = [this];
    function s(o, l) {
      let a = o.matchFragment(e, i);
      if (a && (!t || a.validEnd))
        return y.from(l.map((c) => c.createAndFill()));
      for (let c = 0; c < o.next.length; c++) {
        let { type: d, next: u } = o.next[c];
        if (!(d.isText || d.hasRequiredAttrs()) && r.indexOf(u) == -1) {
          r.push(u);
          let p = s(u, l.concat(d));
          if (p)
            return p;
        }
      }
      return null;
    }
    return s(this, []);
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
      let r = i.shift(), s = r.match;
      if (s.matchType(e)) {
        let o = [];
        for (let l = r; l.type; l = l.via)
          o.push(l.type);
        return o.reverse();
      }
      for (let o = 0; o < s.next.length; o++) {
        let { type: l, next: a } = s.next[o];
        !l.isLeaf && !l.hasRequiredAttrs() && !(l.name in t) && (!r.type || a.validEnd) && (i.push({ match: l.contentMatch, type: l, via: r }), t[l.name] = !0);
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
      for (let r = 0; r < i.next.length; r++)
        e.indexOf(i.next[r].next) == -1 && t(i.next[r].next);
    }
    return t(this), e.map((i, r) => {
      let s = r + (i.validEnd ? "*" : " ") + " ";
      for (let o = 0; o < i.next.length; o++)
        s += (o ? ", " : "") + i.next[o].type.name + "->" + e.indexOf(i.next[o].next);
      return s;
    }).join(`
`);
  }
}
At.empty = new At(!0);
class ld {
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
function ta(n) {
  let e = [];
  do
    e.push(ad(n));
  while (n.eat("|"));
  return e.length == 1 ? e[0] : { type: "choice", exprs: e };
}
function ad(n) {
  let e = [];
  do
    e.push(cd(n));
  while (n.next && n.next != ")" && n.next != "|");
  return e.length == 1 ? e[0] : { type: "seq", exprs: e };
}
function cd(n) {
  let e = pd(n);
  for (; ; )
    if (n.eat("+"))
      e = { type: "plus", expr: e };
    else if (n.eat("*"))
      e = { type: "star", expr: e };
    else if (n.eat("?"))
      e = { type: "opt", expr: e };
    else if (n.eat("{"))
      e = dd(n, e);
    else
      break;
  return e;
}
function ao(n) {
  /\D/.test(n.next) && n.err("Expected number, got '" + n.next + "'");
  let e = Number(n.next);
  return n.pos++, e;
}
function dd(n, e) {
  let t = ao(n), i = t;
  return n.eat(",") && (n.next != "}" ? i = ao(n) : i = -1), n.eat("}") || n.err("Unclosed braced range"), { type: "range", min: t, max: i, expr: e };
}
function ud(n, e) {
  let t = n.nodeTypes, i = t[e];
  if (i)
    return [i];
  let r = [];
  for (let s in t) {
    let o = t[s];
    o.isInGroup(e) && r.push(o);
  }
  return r.length == 0 && n.err("No node type or group '" + e + "' found"), r;
}
function pd(n) {
  if (n.eat("(")) {
    let e = ta(n);
    return n.eat(")") || n.err("Missing closing paren"), e;
  } else if (/\W/.test(n.next))
    n.err("Unexpected token '" + n.next + "'");
  else {
    let e = ud(n, n.next).map((t) => (n.inline == null ? n.inline = t.isInline : n.inline != t.isInline && n.err("Mixing inline and block content"), { type: "name", value: t }));
    return n.pos++, e.length == 1 ? e[0] : { type: "choice", exprs: e };
  }
}
function hd(n) {
  let e = [[]];
  return r(s(n, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function i(o, l, a) {
    let c = { term: a, to: l };
    return e[o].push(c), c;
  }
  function r(o, l) {
    o.forEach((a) => a.to = l);
  }
  function s(o, l) {
    if (o.type == "choice")
      return o.exprs.reduce((a, c) => a.concat(s(c, l)), []);
    if (o.type == "seq")
      for (let a = 0; ; a++) {
        let c = s(o.exprs[a], l);
        if (a == o.exprs.length - 1)
          return c;
        r(c, l = t());
      }
    else if (o.type == "star") {
      let a = t();
      return i(l, a), r(s(o.expr, a), a), [i(a)];
    } else if (o.type == "plus") {
      let a = t();
      return r(s(o.expr, l), a), r(s(o.expr, a), a), [i(a)];
    } else {
      if (o.type == "opt")
        return [i(l)].concat(s(o.expr, l));
      if (o.type == "range") {
        let a = l;
        for (let c = 0; c < o.min; c++) {
          let d = t();
          r(s(o.expr, a), d), a = d;
        }
        if (o.max == -1)
          r(s(o.expr, a), a);
        else
          for (let c = o.min; c < o.max; c++) {
            let d = t();
            i(a, d), r(s(o.expr, a), d), a = d;
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
function na(n, e) {
  return e - n;
}
function co(n, e) {
  let t = [];
  return i(e), t.sort(na);
  function i(r) {
    let s = n[r];
    if (s.length == 1 && !s[0].term)
      return i(s[0].to);
    t.push(r);
    for (let o = 0; o < s.length; o++) {
      let { term: l, to: a } = s[o];
      !l && t.indexOf(a) == -1 && i(a);
    }
  }
}
function fd(n) {
  let e = /* @__PURE__ */ Object.create(null);
  return t(co(n, 0));
  function t(i) {
    let r = [];
    i.forEach((o) => {
      n[o].forEach(({ term: l, to: a }) => {
        if (!l)
          return;
        let c;
        for (let d = 0; d < r.length; d++)
          r[d][0] == l && (c = r[d][1]);
        co(n, a).forEach((d) => {
          c || r.push([l, c = []]), c.indexOf(d) == -1 && c.push(d);
        });
      });
    });
    let s = e[i.join(",")] = new At(i.indexOf(n.length - 1) > -1);
    for (let o = 0; o < r.length; o++) {
      let l = r[o][1].sort(na);
      s.next.push({ type: r[o][0], next: e[l.join(",")] || t(l) });
    }
    return s;
  }
}
function md(n, e) {
  for (let t = 0, i = [n]; t < i.length; t++) {
    let r = i[t], s = !r.validEnd, o = [];
    for (let l = 0; l < r.next.length; l++) {
      let { type: a, next: c } = r.next[l];
      o.push(a.name), s && !(a.isText || a.hasRequiredAttrs()) && (s = !1), i.indexOf(c) == -1 && i.push(c);
    }
    s && e.err("Only non-generatable nodes (" + o.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function ia(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let i = n[t];
    if (!i.hasDefault)
      return null;
    e[t] = i.default;
  }
  return e;
}
function ra(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let i in n) {
    let r = e && e[i];
    if (r === void 0) {
      let s = n[i];
      if (s.hasDefault)
        r = s.default;
      else
        throw new RangeError("No value supplied for attribute " + i);
    }
    t[i] = r;
  }
  return t;
}
function sa(n, e, t, i) {
  for (let r in e)
    if (!(r in n))
      throw new RangeError(`Unsupported attribute ${r} for ${t} of type ${r}`);
  for (let r in n) {
    let s = n[r];
    s.validate && s.validate(e[r]);
  }
}
function oa(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let i in e)
      t[i] = new bd(n, i, e[i]);
  return t;
}
let uo = class la {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.name = e, this.schema = t, this.spec = i, this.markSet = null, this.groups = i.group ? i.group.split(" ") : [], this.attrs = oa(e, i.attrs), this.defaultAttrs = ia(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(i.inline || e == "text"), this.isText = e == "text";
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
    return this.contentMatch == At.empty;
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
    return !e && this.defaultAttrs ? this.defaultAttrs : ra(this.attrs, e);
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
    return new rt(this, this.computeAttrs(e), y.from(t), P.setFrom(i));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, t, i) {
    return t = y.from(t), this.checkContent(t), new rt(this, this.computeAttrs(e), t, P.setFrom(i));
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
    let r = this.contentMatch.matchFragment(t), s = r && r.fillBefore(y.empty, !0);
    return s ? new rt(this, e, t.append(s), P.setFrom(i)) : null;
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
    sa(this.attrs, e, "node", this.name);
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
    e.forEach((s, o) => i[s] = new la(s, t, o));
    let r = t.spec.topNode || "doc";
    if (!i[r])
      throw new RangeError("Schema is missing its top node type ('" + r + "')");
    if (!i.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let s in i.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return i;
  }
};
function gd(n, e, t) {
  let i = t.split("|");
  return (r) => {
    let s = r === null ? "null" : typeof r;
    if (i.indexOf(s) < 0)
      throw new RangeError(`Expected value of type ${i} for attribute ${e} on type ${n}, got ${s}`);
  };
}
class bd {
  constructor(e, t, i) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(i, "default"), this.default = i.default, this.validate = typeof i.validate == "string" ? gd(e, t, i.validate) : i.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class Ki {
  /**
  @internal
  */
  constructor(e, t, i, r) {
    this.name = e, this.rank = t, this.schema = i, this.spec = r, this.attrs = oa(e, r.attrs), this.excluded = null;
    let s = ia(this.attrs);
    this.instance = s ? new P(this, s) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new P(this, ra(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, t) {
    let i = /* @__PURE__ */ Object.create(null), r = 0;
    return e.forEach((s, o) => i[s] = new Ki(s, r++, t, o)), i;
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
    sa(this.attrs, e, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(e) {
    return this.excluded.indexOf(e) > -1;
  }
}
class aa {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(e) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let t = this.spec = {};
    for (let r in e)
      t[r] = e[r];
    t.nodes = Z.from(e.nodes), t.marks = Z.from(e.marks || {}), this.nodes = uo.compile(this.spec.nodes, this), this.marks = Ki.compile(this.spec.marks, this);
    let i = /* @__PURE__ */ Object.create(null);
    for (let r in this.nodes) {
      if (r in this.marks)
        throw new RangeError(r + " can not be both a node and a mark");
      let s = this.nodes[r], o = s.spec.content || "", l = s.spec.marks;
      if (s.contentMatch = i[o] || (i[o] = At.parse(o, this.nodes)), s.inlineContent = s.contentMatch.inlineContent, s.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!s.isInline || !s.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = s;
      }
      s.markSet = l == "_" ? null : l ? po(this, l.split(" ")) : l == "" || !s.inlineContent ? [] : null;
    }
    for (let r in this.marks) {
      let s = this.marks[r], o = s.spec.excludes;
      s.excluded = o == null ? [s] : o == "" ? [] : po(this, o.split(" "));
    }
    this.nodeFromJSON = (r) => rt.fromJSON(this, r), this.markFromJSON = (r) => P.fromJSON(this, r), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, t = null, i, r) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof uo) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(t, i, r);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, t) {
    let i = this.nodes.text;
    return new di(i, i.defaultAttrs, e, P.setFrom(t));
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
function po(n, e) {
  let t = [];
  for (let i = 0; i < e.length; i++) {
    let r = e[i], s = n.marks[r], o = s;
    if (s)
      t.push(s);
    else
      for (let l in n.marks) {
        let a = n.marks[l];
        (r == "_" || a.spec.group && a.spec.group.split(" ").indexOf(r) > -1) && t.push(o = a);
      }
    if (!o)
      throw new SyntaxError("Unknown mark type: '" + e[i] + "'");
  }
  return t;
}
function yd(n) {
  return n.tag != null;
}
function kd(n) {
  return n.style != null;
}
class st {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(e, t) {
    this.schema = e, this.rules = t, this.tags = [], this.styles = [];
    let i = this.matchedStyles = [];
    t.forEach((r) => {
      if (yd(r))
        this.tags.push(r);
      else if (kd(r)) {
        let s = /[^=]*/.exec(r.style)[0];
        i.indexOf(s) < 0 && i.push(s), this.styles.push(r);
      }
    }), this.normalizeLists = !this.tags.some((r) => {
      if (!/^(ul|ol)\b/.test(r.tag) || !r.node)
        return !1;
      let s = e.nodes[r.node];
      return s.contentMatch.matchType(s);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, t = {}) {
    let i = new fo(this, t, !1);
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
    let i = new fo(this, t, !0);
    return i.addAll(e, P.none, t.from, t.to), x.maxOpen(i.finish());
  }
  /**
  @internal
  */
  matchTag(e, t, i) {
    for (let r = i ? this.tags.indexOf(i) + 1 : 0; r < this.tags.length; r++) {
      let s = this.tags[r];
      if (Sd(e, s.tag) && (s.namespace === void 0 || e.namespaceURI == s.namespace) && (!s.context || t.matchesContext(s.context))) {
        if (s.getAttrs) {
          let o = s.getAttrs(e);
          if (o === !1)
            continue;
          s.attrs = o || void 0;
        }
        return s;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(e, t, i, r) {
    for (let s = r ? this.styles.indexOf(r) + 1 : 0; s < this.styles.length; s++) {
      let o = this.styles[s], l = o.style;
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
    function i(r) {
      let s = r.priority == null ? 50 : r.priority, o = 0;
      for (; o < t.length; o++) {
        let l = t[o];
        if ((l.priority == null ? 50 : l.priority) < s)
          break;
      }
      t.splice(o, 0, r);
    }
    for (let r in e.marks) {
      let s = e.marks[r].spec.parseDOM;
      s && s.forEach((o) => {
        i(o = mo(o)), o.mark || o.ignore || o.clearMark || (o.mark = r);
      });
    }
    for (let r in e.nodes) {
      let s = e.nodes[r].spec.parseDOM;
      s && s.forEach((o) => {
        i(o = mo(o)), o.node || o.ignore || o.mark || (o.node = r);
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
    return e.cached.domParser || (e.cached.domParser = new st(e, st.schemaRules(e)));
  }
}
const ca = {
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
}, wd = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, da = { ol: !0, ul: !0 }, kn = 1, Wr = 2, an = 4;
function ho(n, e, t) {
  return e != null ? (e ? kn : 0) | (e === "full" ? Wr : 0) : n && n.whitespace == "pre" ? kn | Wr : t & ~an;
}
class Bn {
  constructor(e, t, i, r, s, o) {
    this.type = e, this.attrs = t, this.marks = i, this.solid = r, this.options = o, this.content = [], this.activeMarks = P.none, this.match = s || (o & an ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let t = this.type.contentMatch.fillBefore(y.from(e));
      if (t)
        this.match = this.type.contentMatch.matchFragment(t);
      else {
        let i = this.type.contentMatch, r;
        return (r = i.findWrapping(e.type)) ? (this.match = i, r) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & kn)) {
      let i = this.content[this.content.length - 1], r;
      if (i && i.isText && (r = /[ \t\r\n\u000c]+$/.exec(i.text))) {
        let s = i;
        i.text.length == r[0].length ? this.content.pop() : this.content[this.content.length - 1] = s.withText(s.text.slice(0, s.text.length - r[0].length));
      }
    }
    let t = y.from(this.content);
    return !e && this.match && (t = t.append(this.match.fillBefore(y.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !ca.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class fo {
  constructor(e, t, i) {
    this.parser = e, this.options = t, this.isOpen = i, this.open = 0, this.localPreserveWS = !1;
    let r = t.topNode, s, o = ho(null, t.preserveWhitespace, 0) | (i ? an : 0);
    r ? s = new Bn(r.type, r.attrs, P.none, !0, t.topMatch || r.type.contentMatch, o) : i ? s = new Bn(null, null, P.none, !0, null, o) : s = new Bn(e.schema.topNodeType, null, P.none, !0, null, o), this.nodes = [s], this.find = t.findPositions, this.needsBlock = !1;
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
    let i = e.nodeValue, r = this.top, s = r.options & Wr ? "full" : this.localPreserveWS || (r.options & kn) > 0, { schema: o } = this.parser;
    if (s === "full" || r.inlineContext(e) || /[^ \t\r\n\u000c]/.test(i)) {
      if (s)
        if (s === "full")
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
        let l = r.content[r.content.length - 1], a = e.previousSibling;
        (!l || a && a.nodeName == "BR" || l.isText && /[ \t\r\n\u000c]$/.test(l.text)) && (i = i.slice(1));
      }
      i && this.insertNode(o.text(i), t, !/\S/.test(i)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, t, i) {
    let r = this.localPreserveWS, s = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let o = e.nodeName.toLowerCase(), l;
    da.hasOwnProperty(o) && this.parser.normalizeLists && vd(e);
    let a = this.options.ruleFromNode && this.options.ruleFromNode(e) || (l = this.parser.matchTag(e, this, i));
    e: if (a ? a.ignore : wd.hasOwnProperty(o))
      this.findInside(e), this.ignoreFallback(e, t);
    else if (!a || a.skip || a.closeParent) {
      a && a.closeParent ? this.open = Math.max(0, this.open - 1) : a && a.skip.nodeType && (e = a.skip);
      let c, d = this.needsBlock;
      if (ca.hasOwnProperty(o))
        s.content.length && s.content[0].isInline && this.open && (this.open--, s = this.top), c = !0, s.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e, t);
        break e;
      }
      let u = a && a.skip ? t : this.readStyles(e, t);
      u && this.addAll(e, u), c && this.sync(s), this.needsBlock = d;
    } else {
      let c = this.readStyles(e, t);
      c && this.addElementByRule(e, a, c, a.consuming === !1 ? l : void 0);
    }
    this.localPreserveWS = r;
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
      for (let r = 0; r < this.parser.matchedStyles.length; r++) {
        let s = this.parser.matchedStyles[r], o = i.getPropertyValue(s);
        if (o)
          for (let l = void 0; ; ) {
            let a = this.parser.matchStyle(s, o, this, l);
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
  addElementByRule(e, t, i, r) {
    let s, o;
    if (t.node)
      if (o = this.parser.schema.nodes[t.node], o.isLeaf)
        this.insertNode(o.create(t.attrs), i, e.nodeName == "BR") || this.leafFallback(e, i);
      else {
        let a = this.enter(o, t.attrs || null, i, t.preserveWhitespace);
        a && (s = !0, i = a);
      }
    else {
      let a = this.parser.schema.marks[t.mark];
      i = i.concat(a.create(t.attrs));
    }
    let l = this.top;
    if (o && o.isLeaf)
      this.findInside(e);
    else if (r)
      this.addElement(e, i, r);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((a) => this.insertNode(a, i, !1));
    else {
      let a = e;
      typeof t.contentElement == "string" ? a = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? a = t.contentElement(e) : t.contentElement && (a = t.contentElement), this.findAround(e, a, !0), this.addAll(a, i), this.findAround(e, a, !1);
    }
    s && this.sync(l) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, t, i, r) {
    let s = i || 0;
    for (let o = i ? e.childNodes[i] : e.firstChild, l = r == null ? null : e.childNodes[r]; o != l; o = o.nextSibling, ++s)
      this.findAtPoint(e, s), this.addDOM(o, t);
    this.findAtPoint(e, s);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, t, i) {
    let r, s;
    for (let o = this.open, l = 0; o >= 0; o--) {
      let a = this.nodes[o], c = a.findWrapping(e);
      if (c && (!r || r.length > c.length + l) && (r = c, s = a, !c.length))
        break;
      if (a.solid) {
        if (i)
          break;
        l += 2;
      }
    }
    if (!r)
      return null;
    this.sync(s);
    for (let o = 0; o < r.length; o++)
      t = this.enterInner(r[o], null, t, !1);
    return t;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, t, i) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let s = this.textblockFromContext();
      s && (t = this.enterInner(s, null, t));
    }
    let r = this.findPlace(e, t, i);
    if (r) {
      this.closeExtra();
      let s = this.top;
      s.match && (s.match = s.match.matchType(e.type));
      let o = P.none;
      for (let l of r.concat(e.marks))
        (s.type ? s.type.allowsMarkType(l.type) : go(l.type, e.type)) && (o = l.addToSet(o));
      return s.content.push(e.mark(o)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, t, i, r) {
    let s = this.findPlace(e.create(t), i, !1);
    return s && (s = this.enterInner(e, t, i, !0, r)), s;
  }
  // Open a node of the given type
  enterInner(e, t, i, r = !1, s) {
    this.closeExtra();
    let o = this.top;
    o.match = o.match && o.match.matchType(e);
    let l = ho(e, s, o.options);
    o.options & an && o.content.length == 0 && (l |= an);
    let a = P.none;
    return i = i.filter((c) => (o.type ? o.type.allowsMarkType(c.type) : go(c.type, e)) ? (a = c.addToSet(a), !1) : !0), this.nodes.push(new Bn(e, t, a, r, null, l)), this.open++, i;
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
      for (let r = i.length - 1; r >= 0; r--)
        e += i[r].nodeSize;
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
      for (let r = 0; r < this.find.length; r++)
        this.find[r].pos == null && e.nodeType == 1 && e.contains(this.find[r].node) && t.compareDocumentPosition(this.find[r].node) & (i ? 2 : 4) && (this.find[r].pos = this.currentPos);
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
    let t = e.split("/"), i = this.options.context, r = !this.isOpen && (!i || i.parent.type == this.nodes[0].type), s = -(i ? i.depth + 1 : 0) + (r ? 0 : 1), o = (l, a) => {
      for (; l >= 0; l--) {
        let c = t[l];
        if (c == "") {
          if (l == t.length - 1 || l == 0)
            continue;
          for (; a >= s; a--)
            if (o(l - 1, a))
              return !0;
          return !1;
        } else {
          let d = a > 0 || a == 0 && r ? this.nodes[a].type : i && a >= s ? i.node(a - s).type : null;
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
function vd(n) {
  for (let e = n.firstChild, t = null; e; e = e.nextSibling) {
    let i = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    i && da.hasOwnProperty(i) && t ? (t.appendChild(e), e = t) : i == "li" ? t = e : i && (t = null);
  }
}
function Sd(n, e) {
  return (n.matches || n.msMatchesSelector || n.webkitMatchesSelector || n.mozMatchesSelector).call(n, e);
}
function mo(n) {
  let e = {};
  for (let t in n)
    e[t] = n[t];
  return e;
}
function go(n, e) {
  let t = e.schema.nodes;
  for (let i in t) {
    let r = t[i];
    if (!r.allowsMarkType(n))
      continue;
    let s = [], o = (l) => {
      s.push(l);
      for (let a = 0; a < l.edgeCount; a++) {
        let { type: c, next: d } = l.edge(a);
        if (c == e || s.indexOf(d) < 0 && o(d))
          return !0;
      }
    };
    if (o(r.contentMatch))
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
    i || (i = pr(t).createDocumentFragment());
    let r = i, s = [];
    return e.forEach((o) => {
      if (s.length || o.marks.length) {
        let l = 0, a = 0;
        for (; l < s.length && a < o.marks.length; ) {
          let c = o.marks[a];
          if (!this.marks[c.type.name]) {
            a++;
            continue;
          }
          if (!c.eq(s[l][0]) || c.type.spec.spanning === !1)
            break;
          l++, a++;
        }
        for (; l < s.length; )
          r = s.pop()[1];
        for (; a < o.marks.length; ) {
          let c = o.marks[a++], d = this.serializeMark(c, o.isInline, t);
          d && (s.push([c, r]), r.appendChild(d.dom), r = d.contentDOM || d.dom);
        }
      }
      r.appendChild(this.serializeNodeInner(o, t));
    }), i;
  }
  /**
  @internal
  */
  serializeNodeInner(e, t) {
    let { dom: i, contentDOM: r } = Zn(pr(t), this.nodes[e.type.name](e), null, e.attrs);
    if (r) {
      if (e.isLeaf)
        throw new RangeError("Content hole not allowed in a leaf node spec");
      this.serializeFragment(e.content, t, r);
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
    for (let r = e.marks.length - 1; r >= 0; r--) {
      let s = this.serializeMark(e.marks[r], e.isInline, t);
      s && ((s.contentDOM || s.dom).appendChild(i), i = s.dom);
    }
    return i;
  }
  /**
  @internal
  */
  serializeMark(e, t, i = {}) {
    let r = this.marks[e.type.name];
    return r && Zn(pr(i), r(e, t), null, e.attrs);
  }
  static renderSpec(e, t, i = null, r) {
    return Zn(e, t, i, r);
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
    let t = bo(e.nodes);
    return t.text || (t.text = (i) => i.text), t;
  }
  /**
  Gather the serializers in a schema's mark specs into an object.
  */
  static marksFromSchema(e) {
    return bo(e.marks);
  }
}
function bo(n) {
  let e = {};
  for (let t in n) {
    let i = n[t].spec.toDOM;
    i && (e[t] = i);
  }
  return e;
}
function pr(n) {
  return n.document || window.document;
}
const yo = /* @__PURE__ */ new WeakMap();
function xd(n) {
  let e = yo.get(n);
  return e === void 0 && yo.set(n, e = Cd(n)), e;
}
function Cd(n) {
  let e = null;
  function t(i) {
    if (i && typeof i == "object")
      if (Array.isArray(i))
        if (typeof i[0] == "string")
          e || (e = []), e.push(i);
        else
          for (let r = 0; r < i.length; r++)
            t(i[r]);
      else
        for (let r in i)
          t(i[r]);
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
  let r = e[0], s;
  if (typeof r != "string")
    throw new RangeError("Invalid array passed to renderSpec");
  if (i && (s = xd(i)) && s.indexOf(e) > -1)
    throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
  let o = r.indexOf(" ");
  o > 0 && (t = r.slice(0, o), r = r.slice(o + 1));
  let l, a = t ? n.createElementNS(t, r) : n.createElement(r), c = e[1], d = 1;
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
const ua = 65535, pa = Math.pow(2, 16);
function Md(n, e) {
  return n + e * pa;
}
function ko(n) {
  return n & ua;
}
function Ed(n) {
  return (n - (n & ua)) / pa;
}
const ha = 1, fa = 2, ei = 4, ma = 8;
class Ur {
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
    return (this.delInfo & ma) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (ha | ei)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (fa | ei)) > 0;
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
    let t = 0, i = ko(e);
    if (!this.inverted)
      for (let r = 0; r < i; r++)
        t += this.ranges[r * 3 + 2] - this.ranges[r * 3 + 1];
    return this.ranges[i * 3] + t + Ed(e);
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
    let r = 0, s = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? r : 0);
      if (a > e)
        break;
      let c = this.ranges[l + s], d = this.ranges[l + o], u = a + c;
      if (e <= u) {
        let p = c ? e == a ? -1 : e == u ? 1 : t : t, h = a + r + (p < 0 ? 0 : d);
        if (i)
          return h;
        let f = e == (t < 0 ? a : u) ? null : Md(l / 3, e - a), m = e == a ? fa : e == u ? ha : ei;
        return (t < 0 ? e != a : e != u) && (m |= ma), new Ur(h, m, f);
      }
      r += d - c;
    }
    return i ? e + r : new Ur(e + r, 0, null);
  }
  /**
  @internal
  */
  touches(e, t) {
    let i = 0, r = ko(t), s = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? i : 0);
      if (a > e)
        break;
      let c = this.ranges[l + s], d = a + c;
      if (e <= d && l == r * 3)
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
    for (let r = 0, s = 0; r < this.ranges.length; r += 3) {
      let o = this.ranges[r], l = o - (this.inverted ? s : 0), a = o + (this.inverted ? 0 : s), c = this.ranges[r + t], d = this.ranges[r + i];
      e(l, l + c, a, a + d), s += d - c;
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
  constructor(e, t, i = 0, r = e ? e.length : 0) {
    this.mirror = t, this.from = i, this.to = r, this._maps = e || [], this.ownData = !(e || t);
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
      let r = e.getMirror(t);
      this.appendMap(e._maps[t], r != null && r < t ? i + r : void 0);
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
      let r = e.getMirror(t);
      this.appendMap(e._maps[t].invert(), r != null && r > t ? i - r - 1 : void 0);
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
    let r = 0;
    for (let s = this.from; s < this.to; s++) {
      let o = this._maps[s], l = o.mapResult(e, t);
      if (l.recover != null) {
        let a = this.getMirror(s);
        if (a != null && a > s && a < this.to) {
          s = a, e = this._maps[a].recover(l.recover);
          continue;
        }
      }
      r |= l.delInfo, e = l.pos;
    }
    return i ? e : new Ur(e, r, null);
  }
}
const hr = /* @__PURE__ */ Object.create(null);
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
    let i = hr[t.stepType];
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
    if (e in hr)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return hr[e] = t, t.prototype.jsonID = e, t;
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
  static fromReplace(e, t, i, r) {
    try {
      return j.ok(e.replace(t, i, r));
    } catch (s) {
      if (s instanceof li)
        return j.fail(s.message);
      throw s;
    }
  }
}
function Cs(n, e, t) {
  let i = [];
  for (let r = 0; r < n.childCount; r++) {
    let s = n.child(r);
    s.content.size && (s = s.copy(Cs(s.content, e, s))), s.isInline && (s = e(s, t, r)), i.push(s);
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
    let t = e.slice(this.from, this.to), i = e.resolve(this.from), r = i.node(i.sharedDepth(this.to)), s = new x(Cs(t.content, (o, l) => !o.isAtom || !l.type.allowsMarkType(this.mark.type) ? o : o.mark(this.mark.addToSet(o.marks)), r), t.openStart, t.openEnd);
    return j.fromReplace(e, this.from, this.to, s);
  }
  invert() {
    return new _e(this.from, this.to, this.mark);
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
class _e extends ae {
  /**
  Create a mark-removing step.
  */
  constructor(e, t, i) {
    super(), this.from = e, this.to = t, this.mark = i;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), i = new x(Cs(t.content, (r) => r.mark(this.mark.removeFromSet(r.marks)), e), t.openStart, t.openEnd);
    return j.fromReplace(e, this.from, this.to, i);
  }
  invert() {
    return new tt(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), i = e.mapResult(this.to, -1);
    return t.deleted && i.deleted || t.pos >= i.pos ? null : new _e(t.pos, i.pos, this.mark);
  }
  merge(e) {
    return e instanceof _e && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new _e(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
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
    return new _e(t.from, t.to, e.markFromJSON(t.mark));
  }
}
ae.jsonID("removeMark", _e);
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
    return j.fromReplace(e, this.pos, this.pos + 1, new x(y.from(i), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let i = this.mark.addToSet(t.marks);
      if (i.length == t.marks.length) {
        for (let r = 0; r < t.marks.length; r++)
          if (!t.marks[r].isInSet(i))
            return new nt(this.pos, t.marks[r]);
        return new nt(this.pos, this.mark);
      }
    }
    return new Tt(this.pos, this.mark);
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
class Tt extends ae {
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
    return j.fromReplace(e, this.pos, this.pos + 1, new x(y.from(i), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    return !t || !this.mark.isInSet(t.marks) ? this : new nt(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Tt(t.pos, this.mark);
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
    return new Tt(t.pos, e.markFromJSON(t.mark));
  }
}
ae.jsonID("removeNodeMark", Tt);
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
  constructor(e, t, i, r = !1) {
    super(), this.from = e, this.to = t, this.slice = i, this.structure = r;
  }
  apply(e) {
    return this.structure && jr(e, this.from, this.to) ? j.fail("Structure replace would overwrite content") : j.fromReplace(e, this.from, this.to, this.slice);
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
      let t = this.slice.size + e.slice.size == 0 ? x.empty : new x(this.slice.content.append(e.slice.content), this.slice.openStart, e.slice.openEnd);
      return new G(this.from, this.to + (e.to - e.from), t, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let t = this.slice.size + e.slice.size == 0 ? x.empty : new x(e.slice.content.append(this.slice.content), e.slice.openStart, this.slice.openEnd);
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
    return new G(t.from, t.to, x.fromJSON(e, t.slice), !!t.structure);
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
  constructor(e, t, i, r, s, o, l = !1) {
    super(), this.from = e, this.to = t, this.gapFrom = i, this.gapTo = r, this.slice = s, this.insert = o, this.structure = l;
  }
  apply(e) {
    if (this.structure && (jr(e, this.from, this.gapFrom) || jr(e, this.gapTo, this.to)))
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
    let t = e.mapResult(this.from, 1), i = e.mapResult(this.to, -1), r = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1), s = this.to == this.gapTo ? i.pos : e.map(this.gapTo, 1);
    return t.deletedAcross && i.deletedAcross || r < t.pos || s > i.pos ? null : new Y(t.pos, i.pos, r, s, this.slice, this.insert, this.structure);
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
    return new Y(t.from, t.to, t.gapFrom, t.gapTo, x.fromJSON(e, t.slice), t.insert, !!t.structure);
  }
}
ae.jsonID("replaceAround", Y);
function jr(n, e, t) {
  let i = n.resolve(e), r = t - e, s = i.depth;
  for (; r > 0 && s > 0 && i.indexAfter(s) == i.node(s).childCount; )
    s--, r--;
  if (r > 0) {
    let o = i.node(s).maybeChild(i.indexAfter(s));
    for (; r > 0; ) {
      if (!o || o.isLeaf)
        return !0;
      o = o.firstChild, r--;
    }
  }
  return !1;
}
function Ad(n, e, t, i) {
  let r = [], s = [], o, l;
  n.doc.nodesBetween(e, t, (a, c, d) => {
    if (!a.isInline)
      return;
    let u = a.marks;
    if (!i.isInSet(u) && d.type.allowsMarkType(i.type)) {
      let p = Math.max(c, e), h = Math.min(c + a.nodeSize, t), f = i.addToSet(u);
      for (let m = 0; m < u.length; m++)
        u[m].isInSet(f) || (o && o.to == p && o.mark.eq(u[m]) ? o.to = h : r.push(o = new _e(p, h, u[m])));
      l && l.to == p ? l.to = h : s.push(l = new tt(p, h, i));
    }
  }), r.forEach((a) => n.step(a)), s.forEach((a) => n.step(a));
}
function Td(n, e, t, i) {
  let r = [], s = 0;
  n.doc.nodesBetween(e, t, (o, l) => {
    if (!o.isInline)
      return;
    s++;
    let a = null;
    if (i instanceof Ki) {
      let c = o.marks, d;
      for (; d = i.isInSet(c); )
        (a || (a = [])).push(d), c = d.removeFromSet(c);
    } else i ? i.isInSet(o.marks) && (a = [i]) : a = o.marks;
    if (a && a.length) {
      let c = Math.min(l + o.nodeSize, t);
      for (let d = 0; d < a.length; d++) {
        let u = a[d], p;
        for (let h = 0; h < r.length; h++) {
          let f = r[h];
          f.step == s - 1 && u.eq(r[h].style) && (p = f);
        }
        p ? (p.to = c, p.step = s) : r.push({ style: u, from: Math.max(l, e), to: c, step: s });
      }
    }
  }), r.forEach((o) => n.step(new _e(o.from, o.to, o.style)));
}
function Ms(n, e, t, i = t.contentMatch, r = !0) {
  let s = n.doc.nodeAt(e), o = [], l = e + 1;
  for (let a = 0; a < s.childCount; a++) {
    let c = s.child(a), d = l + c.nodeSize, u = i.matchType(c.type);
    if (!u)
      o.push(new G(l, d, x.empty));
    else {
      i = u;
      for (let p = 0; p < c.marks.length; p++)
        t.allowsMarkType(c.marks[p].type) || n.step(new _e(l, d, c.marks[p]));
      if (r && c.isText && t.whitespace != "pre") {
        let p, h = /\r?\n|\r/g, f;
        for (; p = h.exec(c.text); )
          f || (f = new x(y.from(t.schema.text(" ", t.allowedMarks(c.marks))), 0, 0)), o.push(new G(l + p.index, l + p.index + p[0].length, f));
      }
    }
    l = d;
  }
  if (!i.validEnd) {
    let a = i.fillBefore(y.empty, !0);
    n.replace(l, l, new x(a, 0, 0));
  }
  for (let a = o.length - 1; a >= 0; a--)
    n.step(o[a]);
}
function Nd(n, e, t) {
  return (e == 0 || n.canReplace(e, n.childCount)) && (t == n.childCount || n.canReplace(0, t));
}
function Gt(n) {
  let t = n.parent.content.cutByIndex(n.startIndex, n.endIndex);
  for (let i = n.depth, r = 0, s = 0; ; --i) {
    let o = n.$from.node(i), l = n.$from.index(i) + r, a = n.$to.indexAfter(i) - s;
    if (i < n.depth && o.canReplace(l, a, t))
      return i;
    if (i == 0 || o.type.spec.isolating || !Nd(o, l, a))
      break;
    l && (r = 1), a < o.childCount && (s = 1);
  }
  return null;
}
function _d(n, e, t) {
  let { $from: i, $to: r, depth: s } = e, o = i.before(s + 1), l = r.after(s + 1), a = o, c = l, d = y.empty, u = 0;
  for (let f = s, m = !1; f > t; f--)
    m || i.index(f) > 0 ? (m = !0, d = y.from(i.node(f).copy(d)), u++) : a--;
  let p = y.empty, h = 0;
  for (let f = s, m = !1; f > t; f--)
    m || r.after(f + 1) < r.end(f) ? (m = !0, p = y.from(r.node(f).copy(p)), h++) : c++;
  n.step(new Y(a, c, o, l, new x(d.append(p), u, h), d.size - u, !0));
}
function Es(n, e, t = null, i = n) {
  let r = Od(n, e), s = r && Ld(i, e);
  return s ? r.map(wo).concat({ type: e, attrs: t }).concat(s.map(wo)) : null;
}
function wo(n) {
  return { type: n, attrs: null };
}
function Od(n, e) {
  let { parent: t, startIndex: i, endIndex: r } = n, s = t.contentMatchAt(i).findWrapping(e);
  if (!s)
    return null;
  let o = s.length ? s[0] : e;
  return t.canReplaceWith(i, r, o) ? s : null;
}
function Ld(n, e) {
  let { parent: t, startIndex: i, endIndex: r } = n, s = t.child(i), o = e.contentMatch.findWrapping(s.type);
  if (!o)
    return null;
  let a = (o.length ? o[o.length - 1] : e).contentMatch;
  for (let c = i; a && c < r; c++)
    a = a.matchType(t.child(c).type);
  return !a || !a.validEnd ? null : o;
}
function Rd(n, e, t) {
  let i = y.empty;
  for (let o = t.length - 1; o >= 0; o--) {
    if (i.size) {
      let l = t[o].type.contentMatch.matchFragment(i);
      if (!l || !l.validEnd)
        throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
    }
    i = y.from(t[o].type.create(t[o].attrs, i));
  }
  let r = e.start, s = e.end;
  n.step(new Y(r, s, r, s, new x(i, 0, 0), t.length, !0));
}
function Id(n, e, t, i, r) {
  if (!i.isTextblock)
    throw new RangeError("Type given to setBlockType should be a textblock");
  let s = n.steps.length;
  n.doc.nodesBetween(e, t, (o, l) => {
    let a = typeof r == "function" ? r(o) : r;
    if (o.isTextblock && !o.hasMarkup(i, a) && Dd(n.doc, n.mapping.slice(s).map(l), i)) {
      let c = null;
      if (i.schema.linebreakReplacement) {
        let h = i.whitespace == "pre", f = !!i.contentMatch.matchType(i.schema.linebreakReplacement);
        h && !f ? c = !1 : !h && f && (c = !0);
      }
      c === !1 && ba(n, o, l, s), Ms(n, n.mapping.slice(s).map(l, 1), i, void 0, c === null);
      let d = n.mapping.slice(s), u = d.map(l, 1), p = d.map(l + o.nodeSize, 1);
      return n.step(new Y(u, p, u + 1, p - 1, new x(y.from(i.create(a, null, o.marks)), 0, 0), 1, !0)), c === !0 && ga(n, o, l, s), !1;
    }
  });
}
function ga(n, e, t, i) {
  e.forEach((r, s) => {
    if (r.isText) {
      let o, l = /\r?\n|\r/g;
      for (; o = l.exec(r.text); ) {
        let a = n.mapping.slice(i).map(t + 1 + s + o.index);
        n.replaceWith(a, a + 1, e.type.schema.linebreakReplacement.create());
      }
    }
  });
}
function ba(n, e, t, i) {
  e.forEach((r, s) => {
    if (r.type == r.type.schema.linebreakReplacement) {
      let o = n.mapping.slice(i).map(t + 1 + s);
      n.replaceWith(o, o + 1, e.type.schema.text(`
`));
    }
  });
}
function Dd(n, e, t) {
  let i = n.resolve(e), r = i.index();
  return i.parent.canReplaceWith(r, r + 1, t);
}
function Pd(n, e, t, i, r) {
  let s = n.doc.nodeAt(e);
  if (!s)
    throw new RangeError("No node at given position");
  t || (t = s.type);
  let o = t.create(i, null, r || s.marks);
  if (s.isLeaf)
    return n.replaceWith(e, e + s.nodeSize, o);
  if (!t.validContent(s.content))
    throw new RangeError("Invalid content for node type " + t.name);
  n.step(new Y(e, e + s.nodeSize, e + 1, e + s.nodeSize - 1, new x(y.from(o), 0, 0), 1, !0));
}
function Ue(n, e, t = 1, i) {
  let r = n.resolve(e), s = r.depth - t, o = i && i[i.length - 1] || r.parent;
  if (s < 0 || r.parent.type.spec.isolating || !r.parent.canReplace(r.index(), r.parent.childCount) || !o.type.validContent(r.parent.content.cutByIndex(r.index(), r.parent.childCount)))
    return !1;
  for (let c = r.depth - 1, d = t - 2; c > s; c--, d--) {
    let u = r.node(c), p = r.index(c);
    if (u.type.spec.isolating)
      return !1;
    let h = u.content.cutByIndex(p, u.childCount), f = i && i[d + 1];
    f && (h = h.replaceChild(0, f.type.create(f.attrs)));
    let m = i && i[d] || u;
    if (!u.canReplace(p + 1, u.childCount) || !m.type.validContent(h))
      return !1;
  }
  let l = r.indexAfter(s), a = i && i[0];
  return r.node(s).canReplaceWith(l, l, a ? a.type : r.node(s + 1).type);
}
function Bd(n, e, t = 1, i) {
  let r = n.doc.resolve(e), s = y.empty, o = y.empty;
  for (let l = r.depth, a = r.depth - t, c = t - 1; l > a; l--, c--) {
    s = y.from(r.node(l).copy(s));
    let d = i && i[c];
    o = y.from(d ? d.type.create(d.attrs, o) : r.node(l).copy(o));
  }
  n.step(new G(e, e, new x(s.append(o), t, t), !0));
}
function ut(n, e) {
  let t = n.resolve(e), i = t.index();
  return ya(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(i, i + 1);
}
function Hd(n, e) {
  e.content.size || n.type.compatibleContent(e.type);
  let t = n.contentMatchAt(n.childCount), { linebreakReplacement: i } = n.type.schema;
  for (let r = 0; r < e.childCount; r++) {
    let s = e.child(r), o = s.type == i ? n.type.schema.nodes.text : s.type;
    if (t = t.matchType(o), !t || !n.type.allowsMarks(s.marks))
      return !1;
  }
  return t.validEnd;
}
function ya(n, e) {
  return !!(n && e && !n.isLeaf && Hd(n, e));
}
function Ji(n, e, t = -1) {
  let i = n.resolve(e);
  for (let r = i.depth; ; r--) {
    let s, o, l = i.index(r);
    if (r == i.depth ? (s = i.nodeBefore, o = i.nodeAfter) : t > 0 ? (s = i.node(r + 1), l++, o = i.node(r).maybeChild(l)) : (s = i.node(r).maybeChild(l - 1), o = i.node(r + 1)), s && !s.isTextblock && ya(s, o) && i.node(r).canReplace(l, l + 1))
      return e;
    if (r == 0)
      break;
    e = t < 0 ? i.before(r) : i.after(r);
  }
}
function zd(n, e, t) {
  let i = null, { linebreakReplacement: r } = n.doc.type.schema, s = n.doc.resolve(e - t), o = s.node().type;
  if (r && o.inlineContent) {
    let d = o.whitespace == "pre", u = !!o.contentMatch.matchType(r);
    d && !u ? i = !1 : !d && u && (i = !0);
  }
  let l = n.steps.length;
  if (i === !1) {
    let d = n.doc.resolve(e + t);
    ba(n, d.node(), d.before(), l);
  }
  o.inlineContent && Ms(n, e + t - 1, o, s.node().contentMatchAt(s.index()), i == null);
  let a = n.mapping.slice(l), c = a.map(e - t);
  if (n.step(new G(c, a.map(e + t, -1), x.empty, !0)), i === !0) {
    let d = n.doc.resolve(c);
    ga(n, d.node(), d.before(), n.steps.length);
  }
  return n;
}
function $d(n, e, t) {
  let i = n.resolve(e);
  if (i.parent.canReplaceWith(i.index(), i.index(), t))
    return e;
  if (i.parentOffset == 0)
    for (let r = i.depth - 1; r >= 0; r--) {
      let s = i.index(r);
      if (i.node(r).canReplaceWith(s, s, t))
        return i.before(r + 1);
      if (s > 0)
        return null;
    }
  if (i.parentOffset == i.parent.content.size)
    for (let r = i.depth - 1; r >= 0; r--) {
      let s = i.indexAfter(r);
      if (i.node(r).canReplaceWith(s, s, t))
        return i.after(r + 1);
      if (s < i.node(r).childCount)
        return null;
    }
  return null;
}
function ka(n, e, t) {
  let i = n.resolve(e);
  if (!t.content.size)
    return e;
  let r = t.content;
  for (let s = 0; s < t.openStart; s++)
    r = r.firstChild.content;
  for (let s = 1; s <= (t.openStart == 0 && t.size ? 2 : 1); s++)
    for (let o = i.depth; o >= 0; o--) {
      let l = o == i.depth ? 0 : i.pos <= (i.start(o + 1) + i.end(o + 1)) / 2 ? -1 : 1, a = i.index(o) + (l > 0 ? 1 : 0), c = i.node(o), d = !1;
      if (s == 1)
        d = c.canReplace(a, a, r);
      else {
        let u = c.contentMatchAt(a).findWrapping(r.firstChild.type);
        d = u && c.canReplaceWith(a, a, u[0]);
      }
      if (d)
        return l == 0 ? i.pos : l < 0 ? i.before(o + 1) : i.after(o + 1);
    }
  return null;
}
function Gi(n, e, t = e, i = x.empty) {
  if (e == t && !i.size)
    return null;
  let r = n.resolve(e), s = n.resolve(t);
  return wa(r, s, i) ? new G(e, t, i) : new Fd(r, s, i).fit();
}
function wa(n, e, t) {
  return !t.openStart && !t.openEnd && n.start() == e.start() && n.parent.canReplace(n.index(), e.index(), t.content);
}
class Fd {
  constructor(e, t, i) {
    this.$from = e, this.$to = t, this.unplaced = i, this.frontier = [], this.placed = y.empty;
    for (let r = 0; r <= e.depth; r++) {
      let s = e.node(r);
      this.frontier.push({
        type: s.type,
        match: s.contentMatchAt(e.indexAfter(r))
      });
    }
    for (let r = e.depth; r > 0; r--)
      this.placed = y.from(e.node(r).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, i = this.$from, r = this.close(e < 0 ? this.$to : i.doc.resolve(e));
    if (!r)
      return null;
    let s = this.placed, o = i.depth, l = r.depth;
    for (; o && l && s.childCount == 1; )
      s = s.firstChild.content, o--, l--;
    let a = new x(s, o, l);
    return e > -1 ? new Y(i.pos, e, this.$to.pos, this.$to.end(), a, t) : a.size || i.pos != this.$to.pos ? new G(i.pos, r.pos, a) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, i = 0, r = this.unplaced.openEnd; i < e; i++) {
      let s = t.firstChild;
      if (t.childCount > 1 && (r = 0), s.type.spec.isolating && r <= i) {
        e = i;
        break;
      }
      t = s.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let i = t == 1 ? e : this.unplaced.openStart; i >= 0; i--) {
        let r, s = null;
        i ? (s = fr(this.unplaced.content, i - 1).firstChild, r = s.content) : r = this.unplaced.content;
        let o = r.firstChild;
        for (let l = this.depth; l >= 0; l--) {
          let { type: a, match: c } = this.frontier[l], d, u = null;
          if (t == 1 && (o ? c.matchType(o.type) || (u = c.fillBefore(y.from(o), !1)) : s && a.compatibleContent(s.type)))
            return { sliceDepth: i, frontierDepth: l, parent: s, inject: u };
          if (t == 2 && o && (d = c.findWrapping(o.type)))
            return { sliceDepth: i, frontierDepth: l, parent: s, wrap: d };
          if (s && c.matchType(s.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: t, openEnd: i } = this.unplaced, r = fr(e, t);
    return !r.childCount || r.firstChild.isLeaf ? !1 : (this.unplaced = new x(e, t + 1, Math.max(i, r.size + t >= e.size - i ? t + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: t, openEnd: i } = this.unplaced, r = fr(e, t);
    if (r.childCount <= 1 && t > 0) {
      let s = e.size - t <= t + r.size;
      this.unplaced = new x(nn(e, t - 1, 1), t - 1, s ? t - 1 : i);
    } else
      this.unplaced = new x(nn(e, t, 1), t, i);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: t, parent: i, inject: r, wrap: s }) {
    for (; this.depth > t; )
      this.closeFrontierNode();
    if (s)
      for (let m = 0; m < s.length; m++)
        this.openFrontierNode(s[m]);
    let o = this.unplaced, l = i ? i.content : o.content, a = o.openStart - e, c = 0, d = [], { match: u, type: p } = this.frontier[t];
    if (r) {
      for (let m = 0; m < r.childCount; m++)
        d.push(r.child(m));
      u = u.matchFragment(r);
    }
    let h = l.size + e - (o.content.size - o.openEnd);
    for (; c < l.childCount; ) {
      let m = l.child(c), g = u.matchType(m.type);
      if (!g)
        break;
      c++, (c > 1 || a == 0 || m.content.size) && (u = g, d.push(va(m.mark(p.allowedMarks(m.marks)), c == 1 ? a : 0, c == l.childCount ? h : -1)));
    }
    let f = c == l.childCount;
    f || (h = -1), this.placed = rn(this.placed, t, y.from(d)), this.frontier[t].match = u, f && h < 0 && i && i.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let m = 0, g = l; m < h; m++) {
      let b = g.lastChild;
      this.frontier.push({ type: b.type, match: b.contentMatchAt(b.childCount) }), g = b.content;
    }
    this.unplaced = f ? e == 0 ? x.empty : new x(nn(o.content, e - 1, 1), e - 1, h < 0 ? o.openEnd : e - 1) : new x(nn(o.content, e, c), o.openStart, o.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], t;
    if (!e.type.isTextblock || !mr(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
      return -1;
    let { depth: i } = this.$to, r = this.$to.after(i);
    for (; i > 1 && r == this.$to.end(--i); )
      ++r;
    return r;
  }
  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: i, type: r } = this.frontier[t], s = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), o = mr(e, t, r, i, s);
      if (o) {
        for (let l = t - 1; l >= 0; l--) {
          let { match: a, type: c } = this.frontier[l], d = mr(e, l, c, a, !0);
          if (!d || d.childCount)
            continue e;
        }
        return { depth: t, fit: o, move: s ? e.doc.resolve(e.after(t + 1)) : e };
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
      let r = e.node(i), s = r.type.contentMatch.fillBefore(r.content, !0, e.index(i));
      this.openFrontierNode(r.type, r.attrs, s);
    }
    return e;
  }
  openFrontierNode(e, t = null, i) {
    let r = this.frontier[this.depth];
    r.match = r.match.matchType(e), this.placed = rn(this.placed, this.depth, y.from(e.create(t, i))), this.frontier.push({ type: e, match: e.contentMatch });
  }
  closeFrontierNode() {
    let t = this.frontier.pop().match.fillBefore(y.empty, !0);
    t.childCount && (this.placed = rn(this.placed, this.frontier.length, t));
  }
}
function nn(n, e, t) {
  return e == 0 ? n.cutByIndex(t, n.childCount) : n.replaceChild(0, n.firstChild.copy(nn(n.firstChild.content, e - 1, t)));
}
function rn(n, e, t) {
  return e == 0 ? n.append(t) : n.replaceChild(n.childCount - 1, n.lastChild.copy(rn(n.lastChild.content, e - 1, t)));
}
function fr(n, e) {
  for (let t = 0; t < e; t++)
    n = n.firstChild.content;
  return n;
}
function va(n, e, t) {
  if (e <= 0)
    return n;
  let i = n.content;
  return e > 1 && (i = i.replaceChild(0, va(i.firstChild, e - 1, i.childCount == 1 ? t - 1 : 0))), e > 0 && (i = n.type.contentMatch.fillBefore(i).append(i), t <= 0 && (i = i.append(n.type.contentMatch.matchFragment(i).fillBefore(y.empty, !0)))), n.copy(i);
}
function mr(n, e, t, i, r) {
  let s = n.node(e), o = r ? n.indexAfter(e) : n.index(e);
  if (o == s.childCount && !t.compatibleContent(s.type))
    return null;
  let l = i.fillBefore(s.content, !0, o);
  return l && !qd(t, s.content, o) ? l : null;
}
function qd(n, e, t) {
  for (let i = t; i < e.childCount; i++)
    if (!n.allowsMarks(e.child(i).marks))
      return !0;
  return !1;
}
function Vd(n) {
  return n.spec.defining || n.spec.definingForContent;
}
function Wd(n, e, t, i) {
  if (!i.size)
    return n.deleteRange(e, t);
  let r = n.doc.resolve(e), s = n.doc.resolve(t);
  if (wa(r, s, i))
    return n.step(new G(e, t, i));
  let o = xa(r, s);
  o[o.length - 1] == 0 && o.pop();
  let l = -(r.depth + 1);
  o.unshift(l);
  for (let p = r.depth, h = r.pos - 1; p > 0; p--, h--) {
    let f = r.node(p).type.spec;
    if (f.defining || f.definingAsContext || f.isolating)
      break;
    o.indexOf(p) > -1 ? l = p : r.before(p) == h && o.splice(1, 0, -p);
  }
  let a = o.indexOf(l), c = [], d = i.openStart;
  for (let p = i.content, h = 0; ; h++) {
    let f = p.firstChild;
    if (c.push(f), h == i.openStart)
      break;
    p = f.content;
  }
  for (let p = d - 1; p >= 0; p--) {
    let h = c[p], f = Vd(h.type);
    if (f && !h.sameMarkup(r.node(Math.abs(l) - 1)))
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
        let k = r.node(g - 1), w = r.index(g - 1);
        if (k.canReplaceWith(w, w, f.type, f.marks))
          return n.replace(r.before(g), b ? s.after(g) : t, new x(Sa(i.content, 0, i.openStart, h), h, i.openEnd));
      }
  }
  let u = n.steps.length;
  for (let p = o.length - 1; p >= 0 && (n.replace(e, t, i), !(n.steps.length > u)); p--) {
    let h = o[p];
    h < 0 || (e = r.before(h), t = s.after(h));
  }
}
function Sa(n, e, t, i, r) {
  if (e < t) {
    let s = n.firstChild;
    n = n.replaceChild(0, s.copy(Sa(s.content, e + 1, t, i, s)));
  }
  if (e > i) {
    let s = r.contentMatchAt(0), o = s.fillBefore(n).append(n);
    n = o.append(s.matchFragment(o).fillBefore(y.empty, !0));
  }
  return n;
}
function Ud(n, e, t, i) {
  if (!i.isInline && e == t && n.doc.resolve(e).parent.content.size) {
    let r = $d(n.doc, e, i.type);
    r != null && (e = t = r);
  }
  n.replaceRange(e, t, new x(y.from(i), 0, 0));
}
function jd(n, e, t) {
  let i = n.doc.resolve(e), r = n.doc.resolve(t), s = xa(i, r);
  for (let o = 0; o < s.length; o++) {
    let l = s[o], a = o == s.length - 1;
    if (a && l == 0 || i.node(l).type.contentMatch.validEnd)
      return n.delete(i.start(l), r.end(l));
    if (l > 0 && (a || i.node(l - 1).canReplace(i.index(l - 1), r.indexAfter(l - 1))))
      return n.delete(i.before(l), r.after(l));
  }
  for (let o = 1; o <= i.depth && o <= r.depth; o++)
    if (e - i.start(o) == i.depth - o && t > i.end(o) && r.end(o) - t != r.depth - o && i.start(o - 1) == r.start(o - 1) && i.node(o - 1).canReplace(i.index(o - 1), r.index(o - 1)))
      return n.delete(i.before(o), t);
  n.delete(e, t);
}
function xa(n, e) {
  let t = [], i = Math.min(n.depth, e.depth);
  for (let r = i; r >= 0; r--) {
    let s = n.start(r);
    if (s < n.pos - (n.depth - r) || e.end(r) > e.pos + (e.depth - r) || n.node(r).type.spec.isolating || e.node(r).type.spec.isolating)
      break;
    (s == e.start(r) || r == n.depth && r == e.depth && n.parent.inlineContent && e.parent.inlineContent && r && e.start(r - 1) == s - 1) && t.push(r);
  }
  return t;
}
class Vt extends ae {
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
    for (let s in t.attrs)
      i[s] = t.attrs[s];
    i[this.attr] = this.value;
    let r = t.type.create(i, null, t.marks);
    return j.fromReplace(e, this.pos, this.pos + 1, new x(y.from(r), 0, t.isLeaf ? 0 : 1));
  }
  getMap() {
    return me.empty;
  }
  invert(e) {
    return new Vt(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Vt(t.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.pos != "number" || typeof t.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new Vt(t.pos, t.attr, t.value);
  }
}
ae.jsonID("attr", Vt);
class vn extends ae {
  /**
  Construct an attribute step.
  */
  constructor(e, t) {
    super(), this.attr = e, this.value = t;
  }
  apply(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let r in e.attrs)
      t[r] = e.attrs[r];
    t[this.attr] = this.value;
    let i = e.type.create(t, e.content, e.marks);
    return j.ok(i);
  }
  getMap() {
    return me.empty;
  }
  invert(e) {
    return new vn(this.attr, e.attrs[this.attr]);
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
    return new vn(t.attr, t.value);
  }
}
ae.jsonID("docAttr", vn);
let Ut = class extends Error {
};
Ut = function n(e) {
  let t = Error.call(this, e);
  return t.__proto__ = n.prototype, t;
};
Ut.prototype = Object.create(Error.prototype);
Ut.prototype.constructor = Ut;
Ut.prototype.name = "TransformError";
class As {
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
      throw new Ut(t.failed);
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
      let r = this.mapping.maps[i];
      i && (e = r.map(e, 1), t = r.map(t, -1)), r.forEach((s, o, l, a) => {
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
  replace(e, t = e, i = x.empty) {
    let r = Gi(this.doc, e, t, i);
    return r && this.step(r), this;
  }
  /**
  Replace the given range with the given content, which may be a
  fragment, node, or array of nodes.
  */
  replaceWith(e, t, i) {
    return this.replace(e, t, new x(y.from(i), 0, 0));
  }
  /**
  Delete the content between the given positions.
  */
  delete(e, t) {
    return this.replace(e, t, x.empty);
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
    return Wd(this, e, t, i), this;
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
    return Ud(this, e, t, i), this;
  }
  /**
  Delete the given range, expanding it to cover fully covered
  parent nodes until a valid replace is found.
  */
  deleteRange(e, t) {
    return jd(this, e, t), this;
  }
  /**
  Split the content in the given range off from its parent, if there
  is sibling content before or after it, and move it up the tree to
  the depth specified by `target`. You'll probably want to use
  [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
  sure the lift is valid.
  */
  lift(e, t) {
    return _d(this, e, t), this;
  }
  /**
  Join the blocks around the given position. If depth is 2, their
  last and first siblings are also joined, and so on.
  */
  join(e, t = 1) {
    return zd(this, e, t), this;
  }
  /**
  Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
  The wrappers are assumed to be valid in this position, and should
  probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
  */
  wrap(e, t) {
    return Rd(this, e, t), this;
  }
  /**
  Set the type of all textblocks (partly) between `from` and `to` to
  the given node type with the given attributes.
  */
  setBlockType(e, t = e, i, r = null) {
    return Id(this, e, t, i, r), this;
  }
  /**
  Change the type, attributes, and/or marks of the node at `pos`.
  When `type` isn't given, the existing node type is preserved,
  */
  setNodeMarkup(e, t, i = null, r) {
    return Pd(this, e, t, i, r), this;
  }
  /**
  Set a single attribute on a given node to a new value.
  The `pos` addresses the document content. Use `setDocAttribute`
  to set attributes on the document itself.
  */
  setNodeAttribute(e, t, i) {
    return this.step(new Vt(e, t, i)), this;
  }
  /**
  Set a single attribute on the document to a new value.
  */
  setDocAttribute(e, t) {
    return this.step(new vn(e, t)), this;
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
      t.isInSet(i.marks) && this.step(new Tt(e, t));
    else {
      let r = i.marks, s, o = [];
      for (; s = t.isInSet(r); )
        o.push(new Tt(e, s)), r = s.removeFromSet(r);
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
    return Bd(this, e, t, i), this;
  }
  /**
  Add the given mark to the inline content between `from` and `to`.
  */
  addMark(e, t, i) {
    return Ad(this, e, t, i), this;
  }
  /**
  Remove marks from inline nodes between `from` and `to`. When
  `mark` is a single mark, remove precisely that mark. When it is
  a mark type, remove all marks of that type. When it is null,
  remove all marks of any type.
  */
  removeMark(e, t, i) {
    return Td(this, e, t, i), this;
  }
  /**
  Removes all marks and nodes from the content of the node at
  `pos` that don't match the given new parent node type. Accepts
  an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
  third argument.
  */
  clearIncompatible(e, t, i) {
    return Ms(this, e, t, i), this;
  }
}
const gr = /* @__PURE__ */ Object.create(null);
class _ {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, t, i) {
    this.$anchor = e, this.$head = t, this.ranges = i || [new Ca(e.min(t), e.max(t))];
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
  replace(e, t = x.empty) {
    let i = t.content.lastChild, r = null;
    for (let l = 0; l < t.openEnd; l++)
      r = i, i = i.lastChild;
    let s = e.steps.length, o = this.ranges;
    for (let l = 0; l < o.length; l++) {
      let { $from: a, $to: c } = o[l], d = e.mapping.slice(s);
      e.replaceRange(d.map(a.pos), d.map(c.pos), l ? x.empty : t), l == 0 && xo(e, s, (i ? i.isInline : r && r.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, t) {
    let i = e.steps.length, r = this.ranges;
    for (let s = 0; s < r.length; s++) {
      let { $from: o, $to: l } = r[s], a = e.mapping.slice(i), c = a.map(o.pos), d = a.map(l.pos);
      s ? e.deleteRange(c, d) : (e.replaceRangeWith(c, d, t), xo(e, i, t.isInline ? -1 : 1));
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
    let r = e.parent.inlineContent ? new N(e) : Ht(e.node(0), e.parent, e.pos, e.index(), t, i);
    if (r)
      return r;
    for (let s = e.depth - 1; s >= 0; s--) {
      let o = t < 0 ? Ht(e.node(0), e.node(s), e.before(s + 1), e.index(s), t, i) : Ht(e.node(0), e.node(s), e.after(s + 1), e.index(s) + 1, t, i);
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
    let i = gr[t.type];
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
    if (e in gr)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return gr[e] = t, t.prototype.jsonID = e, t;
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
    return N.between(this.$anchor, this.$head).getBookmark();
  }
}
_.prototype.visible = !0;
class Ca {
  /**
  Create a range.
  */
  constructor(e, t) {
    this.$from = e, this.$to = t;
  }
}
let vo = !1;
function So(n) {
  !vo && !n.parent.inlineContent && (vo = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + n.parent.type.name + ")"));
}
class N extends _ {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, t = e) {
    So(e), So(t), super(e, t);
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
      return _.near(i);
    let r = e.resolve(t.map(this.anchor));
    return new N(r.parent.inlineContent ? r : i, i);
  }
  replace(e, t = x.empty) {
    if (super.replace(e, t), t == x.empty) {
      let i = this.$from.marksAcross(this.$to);
      i && e.ensureMarks(i);
    }
  }
  eq(e) {
    return e instanceof N && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new Yi(this.anchor, this.head);
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
    return new N(e.resolve(t.anchor), e.resolve(t.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, t, i = t) {
    let r = e.resolve(t);
    return new this(r, i == t ? r : e.resolve(i));
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
    let r = e.pos - t.pos;
    if ((!i || r) && (i = r >= 0 ? 1 : -1), !t.parent.inlineContent) {
      let s = _.findFrom(t, i, !0) || _.findFrom(t, -i, !0);
      if (s)
        t = s.$head;
      else
        return _.near(t, i);
    }
    return e.parent.inlineContent || (r == 0 ? e = t : (e = (_.findFrom(e, -i, !0) || _.findFrom(e, i, !0)).$anchor, e.pos < t.pos != r < 0 && (e = t))), new N(e, t);
  }
}
_.jsonID("text", N);
class Yi {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Yi(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return N.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class T extends _ {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let t = e.nodeAfter, i = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, i), this.node = t;
  }
  map(e, t) {
    let { deleted: i, pos: r } = t.mapResult(this.anchor), s = e.resolve(r);
    return i ? _.near(s) : new T(s);
  }
  content() {
    return new x(y.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof T && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Ts(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new T(e.resolve(t.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(e, t) {
    return new T(e.resolve(t));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
T.prototype.visible = !1;
_.jsonID("node", T);
class Ts {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: t, pos: i } = e.mapResult(this.anchor);
    return t ? new Yi(i, i) : new Ts(i);
  }
  resolve(e) {
    let t = e.resolve(this.anchor), i = t.nodeAfter;
    return i && T.isSelectable(i) ? new T(t) : _.near(t);
  }
}
class be extends _ {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, t = x.empty) {
    if (t == x.empty) {
      e.delete(0, e.doc.content.size);
      let i = _.atStart(e.doc);
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
    return Kd;
  }
}
_.jsonID("all", be);
const Kd = {
  map() {
    return this;
  },
  resolve(n) {
    return new be(n);
  }
};
function Ht(n, e, t, i, r, s = !1) {
  if (e.inlineContent)
    return N.create(n, t);
  for (let o = i - (r > 0 ? 0 : 1); r > 0 ? o < e.childCount : o >= 0; o += r) {
    let l = e.child(o);
    if (l.isAtom) {
      if (!s && T.isSelectable(l))
        return T.create(n, t - (r < 0 ? l.nodeSize : 0));
    } else {
      let a = Ht(n, l, t + r, r < 0 ? l.childCount : 0, r, s);
      if (a)
        return a;
    }
    t += l.nodeSize * r;
  }
  return null;
}
function xo(n, e, t) {
  let i = n.steps.length - 1;
  if (i < e)
    return;
  let r = n.steps[i];
  if (!(r instanceof G || r instanceof Y))
    return;
  let s = n.mapping.maps[i], o;
  s.forEach((l, a, c, d) => {
    o == null && (o = d);
  }), n.setSelection(_.near(n.doc.resolve(o), t));
}
const Co = 1, Hn = 2, Mo = 4;
class Jd extends As {
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
    return this.curSelection = e, this.curSelectionFor = this.steps.length, this.updated = (this.updated | Co) & ~Hn, this.storedMarks = null, this;
  }
  /**
  Whether the selection was explicitly updated by this transaction.
  */
  get selectionSet() {
    return (this.updated & Co) > 0;
  }
  /**
  Set the current stored marks.
  */
  setStoredMarks(e) {
    return this.storedMarks = e, this.updated |= Hn, this;
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
    return (this.updated & Hn) > 0;
  }
  /**
  @internal
  */
  addStep(e, t) {
    super.addStep(e, t), this.updated = this.updated & ~Hn, this.storedMarks = null;
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
    let r = this.doc.type.schema;
    if (t == null)
      return e ? this.replaceSelectionWith(r.text(e), !0) : this.deleteSelection();
    {
      if (i == null && (i = t), !e)
        return this.deleteRange(t, i);
      let s = this.storedMarks;
      if (!s) {
        let o = this.doc.resolve(t);
        s = i == t ? o.marks() : o.marksAcross(this.doc.resolve(i));
      }
      return this.replaceRangeWith(t, i, r.text(e, s)), !this.selection.empty && this.selection.to == t + e.length && this.setSelection(_.near(this.selection.$to)), this;
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
    return this.updated |= Mo, this;
  }
  /**
  True when this transaction has had `scrollIntoView` called on it.
  */
  get scrolledIntoView() {
    return (this.updated & Mo) > 0;
  }
}
function Eo(n, e) {
  return !e || !n ? n : n.bind(e);
}
class sn {
  constructor(e, t, i) {
    this.name = e, this.init = Eo(t.init, i), this.apply = Eo(t.apply, i);
  }
}
const Gd = [
  new sn("doc", {
    init(n) {
      return n.doc || n.schema.topNodeType.createAndFill();
    },
    apply(n) {
      return n.doc;
    }
  }),
  new sn("selection", {
    init(n, e) {
      return n.selection || _.atStart(e.doc);
    },
    apply(n) {
      return n.selection;
    }
  }),
  new sn("storedMarks", {
    init(n) {
      return n.storedMarks || null;
    },
    apply(n, e, t, i) {
      return i.selection.$cursor ? n.storedMarks : null;
    }
  }),
  new sn("scrollToSelection", {
    init() {
      return 0;
    },
    apply(n, e) {
      return n.scrolledIntoView ? e + 1 : e;
    }
  })
];
class br {
  constructor(e, t) {
    this.schema = e, this.plugins = [], this.pluginsByKey = /* @__PURE__ */ Object.create(null), this.fields = Gd.slice(), t && t.forEach((i) => {
      if (this.pluginsByKey[i.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + i.key + ")");
      this.plugins.push(i), this.pluginsByKey[i.key] = i, i.spec.state && this.fields.push(new sn(i.key, i.spec.state, i));
    });
  }
}
class Ft {
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
        let r = this.config.plugins[i];
        if (r.spec.filterTransaction && !r.spec.filterTransaction.call(r, e, this))
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
    let t = [e], i = this.applyInner(e), r = null;
    for (; ; ) {
      let s = !1;
      for (let o = 0; o < this.config.plugins.length; o++) {
        let l = this.config.plugins[o];
        if (l.spec.appendTransaction) {
          let a = r ? r[o].n : 0, c = r ? r[o].state : this, d = a < t.length && l.spec.appendTransaction.call(l, a ? t.slice(a) : t, c, i);
          if (d && i.filterTransaction(d, o)) {
            if (d.setMeta("appendedTransaction", e), !r) {
              r = [];
              for (let u = 0; u < this.config.plugins.length; u++)
                r.push(u < o ? { state: i, n: t.length } : { state: this, n: 0 });
            }
            t.push(d), i = i.applyInner(d), s = !0;
          }
          r && (r[o] = { state: i, n: t.length });
        }
      }
      if (!s)
        return { state: i, transactions: t };
    }
  }
  /**
  @internal
  */
  applyInner(e) {
    if (!e.before.eq(this.doc))
      throw new RangeError("Applying a mismatched transaction");
    let t = new Ft(this.config), i = this.config.fields;
    for (let r = 0; r < i.length; r++) {
      let s = i[r];
      t[s.name] = s.apply(e, this[s.name], this, t);
    }
    return t;
  }
  /**
  Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
  */
  get tr() {
    return new Jd(this);
  }
  /**
  Create a new state.
  */
  static create(e) {
    let t = new br(e.doc ? e.doc.type.schema : e.schema, e.plugins), i = new Ft(t);
    for (let r = 0; r < t.fields.length; r++)
      i[t.fields[r].name] = t.fields[r].init(e, i);
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
    let t = new br(this.schema, e.plugins), i = t.fields, r = new Ft(t);
    for (let s = 0; s < i.length; s++) {
      let o = i[s].name;
      r[o] = this.hasOwnProperty(o) ? this[o] : i[s].init(e, r);
    }
    return r;
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
        let r = e[i], s = r.spec.state;
        s && s.toJSON && (t[i] = s.toJSON.call(r, this[r.key]));
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
    let r = new br(e.schema, e.plugins), s = new Ft(r);
    return r.fields.forEach((o) => {
      if (o.name == "doc")
        s.doc = rt.fromJSON(e.schema, t.doc);
      else if (o.name == "selection")
        s.selection = _.fromJSON(s.doc, t.selection);
      else if (o.name == "storedMarks")
        t.storedMarks && (s.storedMarks = t.storedMarks.map(e.schema.markFromJSON));
      else {
        if (i)
          for (let l in i) {
            let a = i[l], c = a.spec.state;
            if (a.key == o.name && c && c.fromJSON && Object.prototype.hasOwnProperty.call(t, l)) {
              s[o.name] = c.fromJSON.call(a, e, t[l], s);
              return;
            }
          }
        s[o.name] = o.init(e, s);
      }
    }), s;
  }
}
function Ma(n, e, t) {
  for (let i in n) {
    let r = n[i];
    r instanceof Function ? r = r.bind(e) : i == "handleDOMEvents" && (r = Ma(r, e, {})), t[i] = r;
  }
  return t;
}
class U {
  /**
  Create a plugin.
  */
  constructor(e) {
    this.spec = e, this.props = {}, e.props && Ma(e.props, this, this.props), this.key = e.key ? e.key.key : Ea("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const yr = /* @__PURE__ */ Object.create(null);
function Ea(n) {
  return n in yr ? n + "$" + ++yr[n] : (yr[n] = 0, n + "$");
}
class J {
  /**
  Create a plugin key.
  */
  constructor(e = "key") {
    this.key = Ea(e);
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
}, jt = function(n) {
  let e = n.assignedSlot || n.parentNode;
  return e && e.nodeType == 11 ? e.host : e;
};
let Kr = null;
const Ve = function(n, e, t) {
  let i = Kr || (Kr = document.createRange());
  return i.setEnd(n, t ?? n.nodeValue.length), i.setStart(n, e || 0), i;
}, Yd = function() {
  Kr = null;
}, Nt = function(n, e, t, i) {
  return t && (Ao(n, e, t, i, -1) || Ao(n, e, t, i, 1));
}, Xd = /^(img|br|input|textarea|hr)$/i;
function Ao(n, e, t, i, r) {
  for (var s; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (r < 0 ? 0 : ve(n))) {
      let o = n.parentNode;
      if (!o || o.nodeType != 1 || Ln(n) || Xd.test(n.nodeName) || n.contentEditable == "false")
        return !1;
      e = te(n) + (r < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      let o = n.childNodes[e + (r < 0 ? -1 : 0)];
      if (o.nodeType == 1 && o.contentEditable == "false")
        if (!((s = o.pmViewDesc) === null || s === void 0) && s.ignoreForSelection)
          e += r;
        else
          return !1;
      else
        n = o, e = r < 0 ? ve(n) : 0;
    } else
      return !1;
  }
}
function ve(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function Qd(n, e) {
  for (; ; ) {
    if (n.nodeType == 3 && e)
      return n;
    if (n.nodeType == 1 && e > 0) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[e - 1], e = ve(n);
    } else if (n.parentNode && !Ln(n))
      e = te(n), n = n.parentNode;
    else
      return null;
  }
}
function Zd(n, e) {
  for (; ; ) {
    if (n.nodeType == 3 && e < n.nodeValue.length)
      return n;
    if (n.nodeType == 1 && e < n.childNodes.length) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[e], e = 0;
    } else if (n.parentNode && !Ln(n))
      e = te(n) + 1, n = n.parentNode;
    else
      return null;
  }
}
function eu(n, e, t) {
  for (let i = e == 0, r = e == ve(n); i || r; ) {
    if (n == t)
      return !0;
    let s = te(n);
    if (n = n.parentNode, !n)
      return !1;
    i = i && s == 0, r = r && s == ve(n);
  }
}
function Ln(n) {
  let e;
  for (let t = n; t && !(e = t.pmViewDesc); t = t.parentNode)
    ;
  return e && e.node && e.node.isBlock && (e.dom == n || e.contentDOM == n);
}
const Xi = function(n) {
  return n.focusNode && Nt(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset);
};
function gt(n, e) {
  let t = document.createEvent("Event");
  return t.initEvent("keydown", !0, !0), t.keyCode = n, t.key = t.code = e, t;
}
function tu(n) {
  let e = n.activeElement;
  for (; e && e.shadowRoot; )
    e = e.shadowRoot.activeElement;
  return e;
}
function nu(n, e, t) {
  if (n.caretPositionFromPoint)
    try {
      let i = n.caretPositionFromPoint(e, t);
      if (i)
        return { node: i.offsetNode, offset: Math.min(ve(i.offsetNode), i.offset) };
    } catch {
    }
  if (n.caretRangeFromPoint) {
    let i = n.caretRangeFromPoint(e, t);
    if (i)
      return { node: i.startContainer, offset: Math.min(ve(i.startContainer), i.startOffset) };
  }
}
const Oe = typeof navigator < "u" ? navigator : null, To = typeof document < "u" ? document : null, pt = Oe && Oe.userAgent || "", Jr = /Edge\/(\d+)/.exec(pt), Aa = /MSIE \d/.exec(pt), Gr = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(pt), he = !!(Aa || Gr || Jr), ot = Aa ? document.documentMode : Gr ? +Gr[1] : Jr ? +Jr[1] : 0, Se = !he && /gecko\/(\d+)/i.test(pt);
Se && +(/Firefox\/(\d+)/.exec(pt) || [0, 0])[1];
const Yr = !he && /Chrome\/(\d+)/.exec(pt), ie = !!Yr, Ta = Yr ? +Yr[1] : 0, oe = !he && !!Oe && /Apple Computer/.test(Oe.vendor), Kt = oe && (/Mobile\/\w+/.test(pt) || !!Oe && Oe.maxTouchPoints > 2), we = Kt || (Oe ? /Mac/.test(Oe.platform) : !1), Na = Oe ? /Win/.test(Oe.platform) : !1, We = /Android \d/.test(pt), Rn = !!To && "webkitFontSmoothing" in To.documentElement.style, iu = Rn ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function ru(n) {
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
function su(n) {
  let e = n.getBoundingClientRect(), t = e.width / n.offsetWidth || 1, i = e.height / n.offsetHeight || 1;
  return {
    left: e.left,
    right: e.left + n.clientWidth * t,
    top: e.top,
    bottom: e.top + n.clientHeight * i
  };
}
function No(n, e, t) {
  let i = n.someProp("scrollThreshold") || 0, r = n.someProp("scrollMargin") || 5, s = n.dom.ownerDocument;
  for (let o = t || n.dom; o; ) {
    if (o.nodeType != 1) {
      o = jt(o);
      continue;
    }
    let l = o, a = l == s.body, c = a ? ru(s) : su(l), d = 0, u = 0;
    if (e.top < c.top + He(i, "top") ? u = -(c.top - e.top + He(r, "top")) : e.bottom > c.bottom - He(i, "bottom") && (u = e.bottom - e.top > c.bottom - c.top ? e.top + He(r, "top") - c.top : e.bottom - c.bottom + He(r, "bottom")), e.left < c.left + He(i, "left") ? d = -(c.left - e.left + He(r, "left")) : e.right > c.right - He(i, "right") && (d = e.right - c.right + He(r, "right")), d || u)
      if (a)
        s.defaultView.scrollBy(d, u);
      else {
        let h = l.scrollLeft, f = l.scrollTop;
        u && (l.scrollTop += u), d && (l.scrollLeft += d);
        let m = l.scrollLeft - h, g = l.scrollTop - f;
        e = { left: e.left - m, top: e.top - g, right: e.right - m, bottom: e.bottom - g };
      }
    let p = a ? "fixed" : getComputedStyle(o).position;
    if (/^(fixed|sticky)$/.test(p))
      break;
    o = p == "absolute" ? o.offsetParent : jt(o);
  }
}
function ou(n) {
  let e = n.dom.getBoundingClientRect(), t = Math.max(0, e.top), i, r;
  for (let s = (e.left + e.right) / 2, o = t + 1; o < Math.min(innerHeight, e.bottom); o += 5) {
    let l = n.root.elementFromPoint(s, o);
    if (!l || l == n.dom || !n.dom.contains(l))
      continue;
    let a = l.getBoundingClientRect();
    if (a.top >= t - 20) {
      i = l, r = a.top;
      break;
    }
  }
  return { refDOM: i, refTop: r, stack: _a(n.dom) };
}
function _a(n) {
  let e = [], t = n.ownerDocument;
  for (let i = n; i && (e.push({ dom: i, top: i.scrollTop, left: i.scrollLeft }), n != t); i = jt(i))
    ;
  return e;
}
function lu({ refDOM: n, refTop: e, stack: t }) {
  let i = n ? n.getBoundingClientRect().top : 0;
  Oa(t, i == 0 ? 0 : i - e);
}
function Oa(n, e) {
  for (let t = 0; t < n.length; t++) {
    let { dom: i, top: r, left: s } = n[t];
    i.scrollTop != r + e && (i.scrollTop = r + e), i.scrollLeft != s && (i.scrollLeft = s);
  }
}
let Pt = null;
function au(n) {
  if (n.setActive)
    return n.setActive();
  if (Pt)
    return n.focus(Pt);
  let e = _a(n);
  n.focus(Pt == null ? {
    get preventScroll() {
      return Pt = { preventScroll: !0 }, !0;
    }
  } : void 0), Pt || (Pt = !1, Oa(e, 0));
}
function La(n, e) {
  let t, i = 2e8, r, s = 0, o = e.top, l = e.top, a, c;
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
          t = d, i = m, r = m && t.nodeType == 3 ? {
            left: f.right < e.left ? f.right : f.left,
            top: e.top
          } : e, d.nodeType == 1 && m && (s = u + (e.left >= (f.left + f.right) / 2 ? 1 : 0));
          continue;
        }
      } else f.top > e.top && !a && f.left <= e.left && f.right >= e.left && (a = d, c = { left: Math.max(f.left, Math.min(f.right, e.left)), top: f.top });
      !t && (e.left >= f.right && e.top >= f.top || e.left >= f.left && e.top >= f.bottom) && (s = u + 1);
    }
  }
  return !t && a && (t = a, r = c, i = 0), t && t.nodeType == 3 ? cu(t, r) : !t || i && t.nodeType == 1 ? { node: n, offset: s } : La(t, r);
}
function cu(n, e) {
  let t = n.nodeValue.length, i = document.createRange(), r;
  for (let s = 0; s < t; s++) {
    i.setEnd(n, s + 1), i.setStart(n, s);
    let o = Je(i, 1);
    if (o.top != o.bottom && Ns(e, o)) {
      r = { node: n, offset: s + (e.left >= (o.left + o.right) / 2 ? 1 : 0) };
      break;
    }
  }
  return i.detach(), r || { node: n, offset: 0 };
}
function Ns(n, e) {
  return n.left >= e.left - 1 && n.left <= e.right + 1 && n.top >= e.top - 1 && n.top <= e.bottom + 1;
}
function du(n, e) {
  let t = n.parentNode;
  return t && /^li$/i.test(t.nodeName) && e.left < n.getBoundingClientRect().left ? t : n;
}
function uu(n, e, t) {
  let { node: i, offset: r } = La(e, t), s = -1;
  if (i.nodeType == 1 && !i.firstChild) {
    let o = i.getBoundingClientRect();
    s = o.left != o.right && t.left > (o.left + o.right) / 2 ? 1 : -1;
  }
  return n.docView.posFromDOM(i, r, s);
}
function pu(n, e, t, i) {
  let r = -1;
  for (let s = e, o = !1; s != n.dom; ) {
    let l = n.docView.nearestDesc(s, !0), a;
    if (!l)
      return null;
    if (l.dom.nodeType == 1 && (l.node.isBlock && l.parent || !l.contentDOM) && // Ignore elements with zero-size bounding rectangles
    ((a = l.dom.getBoundingClientRect()).width || a.height) && (l.node.isBlock && l.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(l.dom.nodeName) && (!o && a.left > i.left || a.top > i.top ? r = l.posBefore : (!o && a.right < i.left || a.bottom < i.top) && (r = l.posAfter), o = !0), !l.contentDOM && r < 0 && !l.node.isText))
      return (l.node.isBlock ? i.top < (a.top + a.bottom) / 2 : i.left < (a.left + a.right) / 2) ? l.posBefore : l.posAfter;
    s = l.dom.parentNode;
  }
  return r > -1 ? r : n.docView.posFromDOM(e, t, -1);
}
function Ra(n, e, t) {
  let i = n.childNodes.length;
  if (i && t.top < t.bottom)
    for (let r = Math.max(0, Math.min(i - 1, Math.floor(i * (e.top - t.top) / (t.bottom - t.top)) - 2)), s = r; ; ) {
      let o = n.childNodes[s];
      if (o.nodeType == 1) {
        let l = o.getClientRects();
        for (let a = 0; a < l.length; a++) {
          let c = l[a];
          if (Ns(e, c))
            return Ra(o, e, c);
        }
      }
      if ((s = (s + 1) % i) == r)
        break;
    }
  return n;
}
function hu(n, e) {
  let t = n.dom.ownerDocument, i, r = 0, s = nu(t, e.left, e.top);
  s && ({ node: i, offset: r } = s);
  let o = (n.root.elementFromPoint ? n.root : t).elementFromPoint(e.left, e.top), l;
  if (!o || !n.dom.contains(o.nodeType != 1 ? o.parentNode : o)) {
    let c = n.dom.getBoundingClientRect();
    if (!Ns(e, c) || (o = Ra(n.dom, e, c), !o))
      return null;
  }
  if (oe)
    for (let c = o; i && c; c = jt(c))
      c.draggable && (i = void 0);
  if (o = du(o, e), i) {
    if (Se && i.nodeType == 1 && (r = Math.min(r, i.childNodes.length), r < i.childNodes.length)) {
      let d = i.childNodes[r], u;
      d.nodeName == "IMG" && (u = d.getBoundingClientRect()).right <= e.left && u.bottom > e.top && r++;
    }
    let c;
    Rn && r && i.nodeType == 1 && (c = i.childNodes[r - 1]).nodeType == 1 && c.contentEditable == "false" && c.getBoundingClientRect().top >= e.top && r--, i == n.dom && r == i.childNodes.length - 1 && i.lastChild.nodeType == 1 && e.top > i.lastChild.getBoundingClientRect().bottom ? l = n.state.doc.content.size : (r == 0 || i.nodeType != 1 || i.childNodes[r - 1].nodeName != "BR") && (l = pu(n, i, r, e));
  }
  l == null && (l = uu(n, o, e));
  let a = n.docView.nearestDesc(o, !0);
  return { pos: l, inside: a ? a.posAtStart - a.border : -1 };
}
function _o(n) {
  return n.top < n.bottom || n.left < n.right;
}
function Je(n, e) {
  let t = n.getClientRects();
  if (t.length) {
    let i = t[e < 0 ? 0 : t.length - 1];
    if (_o(i))
      return i;
  }
  return Array.prototype.find.call(t, _o) || n.getBoundingClientRect();
}
const fu = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function Ia(n, e, t) {
  let { node: i, offset: r, atom: s } = n.docView.domFromPos(e, t < 0 ? -1 : 1), o = Rn || Se;
  if (i.nodeType == 3)
    if (o && (fu.test(i.nodeValue) || (t < 0 ? !r : r == i.nodeValue.length))) {
      let a = Je(Ve(i, r, r), t);
      if (Se && r && /\s/.test(i.nodeValue[r - 1]) && r < i.nodeValue.length) {
        let c = Je(Ve(i, r - 1, r - 1), -1);
        if (c.top == a.top) {
          let d = Je(Ve(i, r, r + 1), -1);
          if (d.top != a.top)
            return Qt(d, d.left < c.left);
        }
      }
      return a;
    } else {
      let a = r, c = r, d = t < 0 ? 1 : -1;
      return t < 0 && !r ? (c++, d = -1) : t >= 0 && r == i.nodeValue.length ? (a--, d = 1) : t < 0 ? a-- : c++, Qt(Je(Ve(i, a, c), d), d < 0);
    }
  if (!n.state.doc.resolve(e - (s || 0)).parent.inlineContent) {
    if (s == null && r && (t < 0 || r == ve(i))) {
      let a = i.childNodes[r - 1];
      if (a.nodeType == 1)
        return kr(a.getBoundingClientRect(), !1);
    }
    if (s == null && r < ve(i)) {
      let a = i.childNodes[r];
      if (a.nodeType == 1)
        return kr(a.getBoundingClientRect(), !0);
    }
    return kr(i.getBoundingClientRect(), t >= 0);
  }
  if (s == null && r && (t < 0 || r == ve(i))) {
    let a = i.childNodes[r - 1], c = a.nodeType == 3 ? Ve(a, ve(a) - (o ? 0 : 1)) : a.nodeType == 1 && (a.nodeName != "BR" || !a.nextSibling) ? a : null;
    if (c)
      return Qt(Je(c, 1), !1);
  }
  if (s == null && r < ve(i)) {
    let a = i.childNodes[r];
    for (; a.pmViewDesc && a.pmViewDesc.ignoreForCoords; )
      a = a.nextSibling;
    let c = a ? a.nodeType == 3 ? Ve(a, 0, o ? 0 : 1) : a.nodeType == 1 ? a : null : null;
    if (c)
      return Qt(Je(c, -1), !0);
  }
  return Qt(Je(i.nodeType == 3 ? Ve(i) : i, -t), t >= 0);
}
function Qt(n, e) {
  if (n.width == 0)
    return n;
  let t = e ? n.left : n.right;
  return { top: n.top, bottom: n.bottom, left: t, right: t };
}
function kr(n, e) {
  if (n.height == 0)
    return n;
  let t = e ? n.top : n.bottom;
  return { top: t, bottom: t, left: n.left, right: n.right };
}
function Da(n, e, t) {
  let i = n.state, r = n.root.activeElement;
  i != e && n.updateState(e), r != n.dom && n.focus();
  try {
    return t();
  } finally {
    i != e && n.updateState(i), r != n.dom && r && r.focus();
  }
}
function mu(n, e, t) {
  let i = e.selection, r = t == "up" ? i.$from : i.$to;
  return Da(n, e, () => {
    let { node: s } = n.docView.domFromPos(r.pos, t == "up" ? -1 : 1);
    for (; ; ) {
      let l = n.docView.nearestDesc(s, !0);
      if (!l)
        break;
      if (l.node.isBlock) {
        s = l.contentDOM || l.dom;
        break;
      }
      s = l.dom.parentNode;
    }
    let o = Ia(n, r.pos, 1);
    for (let l = s.firstChild; l; l = l.nextSibling) {
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
const gu = /[\u0590-\u08ac]/;
function bu(n, e, t) {
  let { $head: i } = e.selection;
  if (!i.parent.isTextblock)
    return !1;
  let r = i.parentOffset, s = !r, o = r == i.parent.content.size, l = n.domSelection();
  return l ? !gu.test(i.parent.textContent) || !l.modify ? t == "left" || t == "backward" ? s : o : Da(n, e, () => {
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
let Oo = null, Lo = null, Ro = !1;
function yu(n, e, t) {
  return Oo == e && Lo == t ? Ro : (Oo = e, Lo = t, Ro = t == "up" || t == "down" ? mu(n, e, t) : bu(n, e, t));
}
const xe = 0, Io = 1, yt = 2, Le = 3;
class In {
  constructor(e, t, i, r) {
    this.parent = e, this.children = t, this.dom = i, this.contentDOM = r, this.dirty = xe, i.pmViewDesc = this;
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
      let r = this.children[t];
      if (r == e)
        return i;
      i += r.size;
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
        let s, o;
        if (e == this.contentDOM)
          s = e.childNodes[t - 1];
        else {
          for (; e.parentNode != this.contentDOM; )
            e = e.parentNode;
          s = e.previousSibling;
        }
        for (; s && !((o = s.pmViewDesc) && o.parent == this); )
          s = s.previousSibling;
        return s ? this.posBeforeChild(o) + o.size : this.posAtStart;
      } else {
        let s, o;
        if (e == this.contentDOM)
          s = e.childNodes[t];
        else {
          for (; e.parentNode != this.contentDOM; )
            e = e.parentNode;
          s = e.nextSibling;
        }
        for (; s && !((o = s.pmViewDesc) && o.parent == this); )
          s = s.nextSibling;
        return s ? this.posBeforeChild(o) : this.posAtEnd;
      }
    let r;
    if (e == this.dom && this.contentDOM)
      r = t > te(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      r = e.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (t == 0)
        for (let s = e; ; s = s.parentNode) {
          if (s == this.dom) {
            r = !1;
            break;
          }
          if (s.previousSibling)
            break;
        }
      if (r == null && t == e.childNodes.length)
        for (let s = e; ; s = s.parentNode) {
          if (s == this.dom) {
            r = !0;
            break;
          }
          if (s.nextSibling)
            break;
        }
    }
    return r ?? i > 0 ? this.posAtEnd : this.posAtStart;
  }
  nearestDesc(e, t = !1) {
    for (let i = !0, r = e; r; r = r.parentNode) {
      let s = this.getDesc(r), o;
      if (s && (!t || s.node))
        if (i && (o = s.nodeDOM) && !(o.nodeType == 1 ? o.contains(e.nodeType == 1 ? e : e.parentNode) : o == e))
          i = !1;
        else
          return s;
    }
  }
  getDesc(e) {
    let t = e.pmViewDesc;
    for (let i = t; i; i = i.parent)
      if (i == this)
        return t;
  }
  posFromDOM(e, t, i) {
    for (let r = e; r; r = r.parentNode) {
      let s = this.getDesc(r);
      if (s)
        return s.localPosFromDOM(e, t, i);
    }
    return -1;
  }
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  descAt(e) {
    for (let t = 0, i = 0; t < this.children.length; t++) {
      let r = this.children[t], s = i + r.size;
      if (i == e && s != i) {
        for (; !r.border && r.children.length; )
          for (let o = 0; o < r.children.length; o++) {
            let l = r.children[o];
            if (l.size) {
              r = l;
              break;
            }
          }
        return r;
      }
      if (e < s)
        return r.descAt(e - i - r.border);
      i = s;
    }
  }
  domFromPos(e, t) {
    if (!this.contentDOM)
      return { node: this.dom, offset: 0, atom: e + 1 };
    let i = 0, r = 0;
    for (let s = 0; i < this.children.length; i++) {
      let o = this.children[i], l = s + o.size;
      if (l > e || o instanceof Ba) {
        r = e - s;
        break;
      }
      s = l;
    }
    if (r)
      return this.children[i].domFromPos(r - this.children[i].border, t);
    for (let s; i && !(s = this.children[i - 1]).size && s instanceof Pa && s.side >= 0; i--)
      ;
    if (t <= 0) {
      let s, o = !0;
      for (; s = i ? this.children[i - 1] : null, !(!s || s.dom.parentNode == this.contentDOM); i--, o = !1)
        ;
      return s && t && o && !s.border && !s.domAtom ? s.domFromPos(s.size, t) : { node: this.contentDOM, offset: s ? te(s.dom) + 1 : 0 };
    } else {
      let s, o = !0;
      for (; s = i < this.children.length ? this.children[i] : null, !(!s || s.dom.parentNode == this.contentDOM); i++, o = !1)
        ;
      return s && o && !s.border && !s.domAtom ? s.domFromPos(0, t) : { node: this.contentDOM, offset: s ? te(s.dom) : this.contentDOM.childNodes.length };
    }
  }
  // Used to find a DOM range in a single parent for a given changed
  // range.
  parseRange(e, t, i = 0) {
    if (this.children.length == 0)
      return { node: this.contentDOM, from: e, to: t, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
    let r = -1, s = -1;
    for (let o = i, l = 0; ; l++) {
      let a = this.children[l], c = o + a.size;
      if (r == -1 && e <= c) {
        let d = o + a.border;
        if (e >= d && t <= c - a.border && a.node && a.contentDOM && this.contentDOM.contains(a.contentDOM))
          return a.parseRange(e, t, d);
        e = o;
        for (let u = l; u > 0; u--) {
          let p = this.children[u - 1];
          if (p.size && p.dom.parentNode == this.contentDOM && !p.emptyChildAt(1)) {
            r = te(p.dom) + 1;
            break;
          }
          e -= p.size;
        }
        r == -1 && (r = 0);
      }
      if (r > -1 && (c > t || l == this.children.length - 1)) {
        t = c;
        for (let d = l + 1; d < this.children.length; d++) {
          let u = this.children[d];
          if (u.size && u.dom.parentNode == this.contentDOM && !u.emptyChildAt(-1)) {
            s = te(u.dom);
            break;
          }
          t += u.size;
        }
        s == -1 && (s = this.contentDOM.childNodes.length);
        break;
      }
      o = c;
    }
    return { node: this.contentDOM, from: e, to: t, fromOffset: r, toOffset: s };
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
  setSelection(e, t, i, r = !1) {
    let s = Math.min(e, t), o = Math.max(e, t);
    for (let h = 0, f = 0; h < this.children.length; h++) {
      let m = this.children[h], g = f + m.size;
      if (s > f && o < g)
        return m.setSelection(e - f - m.border, t - f - m.border, i, r);
      f = g;
    }
    let l = this.domFromPos(e, e ? -1 : 1), a = t == e ? l : this.domFromPos(t, t ? -1 : 1), c = i.root.getSelection(), d = i.domSelectionRange(), u = !1;
    if ((Se || oe) && e == t) {
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
    if (Se && d.focusNode && d.focusNode != a.node && d.focusNode.nodeType == 1) {
      let h = d.focusNode.childNodes[d.focusOffset];
      h && h.contentEditable == "false" && (r = !0);
    }
    if (!(r || u && oe) && Nt(l.node, l.offset, d.anchorNode, d.anchorOffset) && Nt(a.node, a.offset, d.focusNode, d.focusOffset))
      return;
    let p = !1;
    if ((c.extend || e == t) && !(u && Se)) {
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
    for (let i = 0, r = 0; r < this.children.length; r++) {
      let s = this.children[r], o = i + s.size;
      if (i == o ? e <= o && t >= i : e < o && t > i) {
        let l = i + s.border, a = o - s.border;
        if (e >= l && t <= a) {
          this.dirty = e == i || t == o ? yt : Io, e == l && t == a && (s.contentLost || s.dom.parentNode != this.contentDOM) ? s.dirty = Le : s.markDirty(e - l, t - l);
          return;
        } else
          s.dirty = s.dom == s.contentDOM && s.dom.parentNode == this.contentDOM && !s.children.length ? yt : Le;
      }
      i = o;
    }
    this.dirty = yt;
  }
  markParentsDirty() {
    let e = 1;
    for (let t = this.parent; t; t = t.parent, e++) {
      let i = e == 1 ? yt : Io;
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
class Pa extends In {
  constructor(e, t, i, r) {
    let s, o = t.type.toDOM;
    if (typeof o == "function" && (o = o(i, () => {
      if (!s)
        return r;
      if (s.parent)
        return s.parent.posBeforeChild(s);
    })), !t.type.spec.raw) {
      if (o.nodeType != 1) {
        let l = document.createElement("span");
        l.appendChild(o), o = l;
      }
      o.contentEditable = "false", o.classList.add("ProseMirror-widget");
    }
    super(e, [], o, null), this.widget = t, this.widget = t, s = this;
  }
  matchesWidget(e) {
    return this.dirty == xe && e.type.eq(this.widget.type);
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
class ku extends In {
  constructor(e, t, i, r) {
    super(e, [], t, null), this.textDOM = i, this.text = r;
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
class _t extends In {
  constructor(e, t, i, r, s) {
    super(e, [], i, r), this.mark = t, this.spec = s;
  }
  static create(e, t, i, r) {
    let s = r.nodeViews[t.type.name], o = s && s(t, r, i);
    return (!o || !o.dom) && (o = It.renderSpec(document, t.type.spec.toDOM(t, i), null, t.attrs)), new _t(e, t, o.dom, o.contentDOM || o.dom, o);
  }
  parseRule() {
    return this.dirty & Le || this.mark.type.spec.reparseInView ? null : { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
  }
  matchesMark(e) {
    return this.dirty != Le && this.mark.eq(e);
  }
  markDirty(e, t) {
    if (super.markDirty(e, t), this.dirty != xe) {
      let i = this.parent;
      for (; !i.node; )
        i = i.parent;
      i.dirty < this.dirty && (i.dirty = this.dirty), this.dirty = xe;
    }
  }
  slice(e, t, i) {
    let r = _t.create(this.parent, this.mark, !0, i), s = this.children, o = this.size;
    t < o && (s = Qr(s, t, o, i)), e > 0 && (s = Qr(s, 0, e, i));
    for (let l = 0; l < s.length; l++)
      s[l].parent = r;
    return r.children = s, r;
  }
  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
}
class lt extends In {
  constructor(e, t, i, r, s, o, l, a, c) {
    super(e, [], s, o), this.node = t, this.outerDeco = i, this.innerDeco = r, this.nodeDOM = l;
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
  static create(e, t, i, r, s, o) {
    let l = s.nodeViews[t.type.name], a, c = l && l(t, s, () => {
      if (!a)
        return o;
      if (a.parent)
        return a.parent.posBeforeChild(a);
    }, i, r), d = c && c.dom, u = c && c.contentDOM;
    if (t.isText) {
      if (!d)
        d = document.createTextNode(t.text);
      else if (d.nodeType != 3)
        throw new RangeError("Text must be rendered as a DOM text node");
    } else d || ({ dom: d, contentDOM: u } = It.renderSpec(document, t.type.spec.toDOM(t), null, t.attrs));
    !u && !t.isText && d.nodeName != "BR" && (d.hasAttribute("contenteditable") || (d.contentEditable = "false"), t.type.spec.draggable && (d.draggable = !0));
    let p = d;
    return d = $a(d, i, t), c ? a = new wu(e, t, i, r, d, u || null, p, c, s, o + 1) : t.isText ? new Qi(e, t, i, r, d, p, s) : new lt(e, t, i, r, d, u || null, p, s, o + 1);
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
    return this.dirty == xe && e.eq(this.node) && ui(t, this.outerDeco) && i.eq(this.innerDeco);
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
    let i = this.node.inlineContent, r = t, s = e.composing ? this.localCompositionInfo(e, t) : null, o = s && s.pos > -1 ? s : null, l = s && s.pos < 0, a = new Su(this, o && o.node, e);
    Mu(this.node, this.innerDeco, (c, d, u) => {
      c.spec.marks ? a.syncToMarks(c.spec.marks, i, e, d) : c.type.side >= 0 && !u && a.syncToMarks(d == this.node.childCount ? P.none : this.node.child(d).marks, i, e, d), a.placeWidget(c, e, r);
    }, (c, d, u, p) => {
      a.syncToMarks(c.marks, i, e, p);
      let h;
      a.findNodeMatch(c, d, u, p) || l && e.state.selection.from > r && e.state.selection.to < r + c.nodeSize && (h = a.findIndexWithChild(s.node)) > -1 && a.updateNodeAt(c, d, u, h, e) || a.updateNextNode(c, d, u, e, p, r) || a.addNode(c, d, u, e, r), r += c.nodeSize;
    }), a.syncToMarks([], i, e, 0), this.node.isTextblock && a.addTextblockHacks(), a.destroyRest(), (a.changed || this.dirty == yt) && (o && this.protectLocalComposition(e, o), Ha(this.contentDOM, this.children, e), Kt && Eu(this.dom));
  }
  localCompositionInfo(e, t) {
    let { from: i, to: r } = e.state.selection;
    if (!(e.state.selection instanceof N) || i < t || r > t + this.node.content.size)
      return null;
    let s = e.input.compositionNode;
    if (!s || !this.dom.contains(s.parentNode))
      return null;
    if (this.node.inlineContent) {
      let o = s.nodeValue, l = Au(this.node.content, o, i - t, r - t);
      return l < 0 ? null : { node: s, pos: l, text: o };
    } else
      return { node: s, pos: -1, text: "" };
  }
  protectLocalComposition(e, { node: t, pos: i, text: r }) {
    if (this.getDesc(t))
      return;
    let s = t;
    for (; s.parentNode != this.contentDOM; s = s.parentNode) {
      for (; s.previousSibling; )
        s.parentNode.removeChild(s.previousSibling);
      for (; s.nextSibling; )
        s.parentNode.removeChild(s.nextSibling);
      s.pmViewDesc && (s.pmViewDesc = void 0);
    }
    let o = new ku(this, s, t, r);
    e.input.compositionNodes.push(o), this.children = Qr(this.children, i, i + r.length, e, o);
  }
  // If this desc must be updated to match the given node decoration,
  // do so and return true.
  update(e, t, i, r) {
    return this.dirty == Le || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, i, r), !0);
  }
  updateInner(e, t, i, r) {
    this.updateOuterDeco(t), this.node = e, this.innerDeco = i, this.contentDOM && this.updateChildren(r, this.posAtStart), this.dirty = xe;
  }
  updateOuterDeco(e) {
    if (ui(e, this.outerDeco))
      return;
    let t = this.nodeDOM.nodeType != 1, i = this.dom;
    this.dom = za(this.dom, this.nodeDOM, Xr(this.outerDeco, this.node, t), Xr(e, this.node, t)), this.dom != i && (i.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
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
function Do(n, e, t, i, r) {
  $a(i, e, n);
  let s = new lt(void 0, n, e, t, i, i, i, r, 0);
  return s.contentDOM && s.updateChildren(r, 0), s;
}
class Qi extends lt {
  constructor(e, t, i, r, s, o, l) {
    super(e, t, i, r, s, null, o, l, 0);
  }
  parseRule() {
    let e = this.nodeDOM.parentNode;
    for (; e && e != this.dom && !e.pmIsDeco; )
      e = e.parentNode;
    return { skip: e || !0 };
  }
  update(e, t, i, r) {
    return this.dirty == Le || this.dirty != xe && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(t), (this.dirty != xe || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, r.trackWrites == this.nodeDOM && (r.trackWrites = null)), this.node = e, this.dirty = xe, !0);
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
    let r = this.node.cut(e, t), s = document.createTextNode(r.text);
    return new Qi(this.parent, r, this.outerDeco, this.innerDeco, s, s, i);
  }
  markDirty(e, t) {
    super.markDirty(e, t), this.dom != this.nodeDOM && (e == 0 || t == this.nodeDOM.nodeValue.length) && (this.dirty = Le);
  }
  get domAtom() {
    return !1;
  }
  isText(e) {
    return this.node.text == e;
  }
}
class Ba extends In {
  parseRule() {
    return { ignore: !0 };
  }
  matchesHack(e) {
    return this.dirty == xe && this.dom.nodeName == e;
  }
  get domAtom() {
    return !0;
  }
  get ignoreForCoords() {
    return this.dom.nodeName == "IMG";
  }
}
class wu extends lt {
  constructor(e, t, i, r, s, o, l, a, c, d) {
    super(e, t, i, r, s, o, l, c, d), this.spec = a;
  }
  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  update(e, t, i, r) {
    if (this.dirty == Le)
      return !1;
    if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
      let s = this.spec.update(e, t, i);
      return s && this.updateInner(e, t, i, r), s;
    } else return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, i, r);
  }
  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }
  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }
  setSelection(e, t, i, r) {
    this.spec.setSelection ? this.spec.setSelection(e, t, i.root) : super.setSelection(e, t, i, r);
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
function Ha(n, e, t) {
  let i = n.firstChild, r = !1;
  for (let s = 0; s < e.length; s++) {
    let o = e[s], l = o.dom;
    if (l.parentNode == n) {
      for (; l != i; )
        i = Po(i), r = !0;
      i = i.nextSibling;
    } else
      r = !0, n.insertBefore(l, i);
    if (o instanceof _t) {
      let a = i ? i.previousSibling : n.lastChild;
      Ha(o.contentDOM, o.children, t), i = a ? a.nextSibling : n.firstChild;
    }
  }
  for (; i; )
    i = Po(i), r = !0;
  r && t.trackWrites == n && (t.trackWrites = null);
}
const cn = function(n) {
  n && (this.nodeName = n);
};
cn.prototype = /* @__PURE__ */ Object.create(null);
const kt = [new cn()];
function Xr(n, e, t) {
  if (n.length == 0)
    return kt;
  let i = t ? kt[0] : new cn(), r = [i];
  for (let s = 0; s < n.length; s++) {
    let o = n[s].type.attrs;
    if (o) {
      o.nodeName && r.push(i = new cn(o.nodeName));
      for (let l in o) {
        let a = o[l];
        a != null && (t && r.length == 1 && r.push(i = new cn(e.isInline ? "span" : "div")), l == "class" ? i.class = (i.class ? i.class + " " : "") + a : l == "style" ? i.style = (i.style ? i.style + ";" : "") + a : l != "nodeName" && (i[l] = a));
      }
    }
  }
  return r;
}
function za(n, e, t, i) {
  if (t == kt && i == kt)
    return e;
  let r = e;
  for (let s = 0; s < i.length; s++) {
    let o = i[s], l = t[s];
    if (s) {
      let a;
      l && l.nodeName == o.nodeName && r != n && (a = r.parentNode) && a.nodeName.toLowerCase() == o.nodeName || (a = document.createElement(o.nodeName), a.pmIsDeco = !0, a.appendChild(r), l = kt[0]), r = a;
    }
    vu(r, l || kt[0], o);
  }
  return r;
}
function vu(n, e, t) {
  for (let i in e)
    i != "class" && i != "style" && i != "nodeName" && !(i in t) && n.removeAttribute(i);
  for (let i in t)
    i != "class" && i != "style" && i != "nodeName" && t[i] != e[i] && n.setAttribute(i, t[i]);
  if (e.class != t.class) {
    let i = e.class ? e.class.split(" ").filter(Boolean) : [], r = t.class ? t.class.split(" ").filter(Boolean) : [];
    for (let s = 0; s < i.length; s++)
      r.indexOf(i[s]) == -1 && n.classList.remove(i[s]);
    for (let s = 0; s < r.length; s++)
      i.indexOf(r[s]) == -1 && n.classList.add(r[s]);
    n.classList.length == 0 && n.removeAttribute("class");
  }
  if (e.style != t.style) {
    if (e.style) {
      let i = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, r;
      for (; r = i.exec(e.style); )
        n.style.removeProperty(r[1]);
    }
    t.style && (n.style.cssText += t.style);
  }
}
function $a(n, e, t) {
  return za(n, n, kt, Xr(e, t, n.nodeType != 1));
}
function ui(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].type.eq(e[t].type))
      return !1;
  return !0;
}
function Po(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class Su {
  constructor(e, t, i) {
    this.lock = t, this.view = i, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = xu(e.node.content, e);
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
  syncToMarks(e, t, i, r) {
    let s = 0, o = this.stack.length >> 1, l = Math.min(o, e.length);
    for (; s < l && (s == o - 1 ? this.top : this.stack[s + 1 << 1]).matchesMark(e[s]) && e[s].type.spec.spanning !== !1; )
      s++;
    for (; s < o; )
      this.destroyRest(), this.top.dirty = xe, this.index = this.stack.pop(), this.top = this.stack.pop(), o--;
    for (; o < e.length; ) {
      this.stack.push(this.top, this.index + 1);
      let a = -1, c = this.top.children.length;
      r < this.preMatch.index && (c = Math.min(this.index + 3, c));
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
        let d = _t.create(this.top, e[o], t, i);
        this.top.children.splice(this.index, 0, d), this.top = d, this.changed = !0;
      }
      this.index = 0, o++;
    }
  }
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  findNodeMatch(e, t, i, r) {
    let s = -1, o;
    if (r >= this.preMatch.index && (o = this.preMatch.matches[r - this.preMatch.index]).parent == this.top && o.matchesNode(e, t, i))
      s = this.top.children.indexOf(o, this.index);
    else
      for (let l = this.index, a = Math.min(this.top.children.length, l + 5); l < a; l++) {
        let c = this.top.children[l];
        if (c.matchesNode(e, t, i) && !this.preMatch.matched.has(c)) {
          s = l;
          break;
        }
      }
    return s < 0 ? !1 : (this.destroyBetween(this.index, s), this.index++, !0);
  }
  updateNodeAt(e, t, i, r, s) {
    let o = this.top.children[r];
    return o.dirty == Le && o.dom == o.contentDOM && (o.dirty = yt), o.update(e, t, i, s) ? (this.destroyBetween(this.index, r), this.index++, !0) : !1;
  }
  findIndexWithChild(e) {
    for (; ; ) {
      let t = e.parentNode;
      if (!t)
        return -1;
      if (t == this.top.contentDOM) {
        let i = e.pmViewDesc;
        if (i) {
          for (let r = this.index; r < this.top.children.length; r++)
            if (this.top.children[r] == i)
              return r;
        }
        return -1;
      }
      e = t;
    }
  }
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  updateNextNode(e, t, i, r, s, o) {
    for (let l = this.index; l < this.top.children.length; l++) {
      let a = this.top.children[l];
      if (a instanceof lt) {
        let c = this.preMatch.matched.get(a);
        if (c != null && c != s)
          return !1;
        let d = a.dom, u, p = this.isLocked(d) && !(e.isText && a.node && a.node.isText && a.nodeDOM.nodeValue == e.text && a.dirty != Le && ui(t, a.outerDeco));
        if (!p && a.update(e, t, i, r))
          return this.destroyBetween(this.index, l), a.dom != d && (this.changed = !0), this.index++, !0;
        if (!p && (u = this.recreateWrapper(a, e, t, i, r, o)))
          return this.destroyBetween(this.index, l), this.top.children[this.index] = u, u.contentDOM && (u.dirty = yt, u.updateChildren(r, o + 1), u.dirty = xe), this.changed = !0, this.index++, !0;
        break;
      }
    }
    return !1;
  }
  // When a node with content is replaced by a different node with
  // identical content, move over its children.
  recreateWrapper(e, t, i, r, s, o) {
    if (e.dirty || t.isAtom || !e.children.length || !e.node.content.eq(t.content) || !ui(i, e.outerDeco) || !r.eq(e.innerDeco))
      return null;
    let l = lt.create(this.top, t, i, r, s, o);
    if (l.contentDOM) {
      l.children = e.children, e.children = [];
      for (let a of l.children)
        a.parent = l;
    }
    return e.destroy(), l;
  }
  // Insert the node as a newly created node desc.
  addNode(e, t, i, r, s) {
    let o = lt.create(this.top, e, t, i, r, s);
    o.contentDOM && o.updateChildren(r, s + 1), this.top.children.splice(this.index++, 0, o), this.changed = !0;
  }
  placeWidget(e, t, i) {
    let r = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (r && r.matchesWidget(e) && (e == r.widget || !r.widget.type.toDOM.parentNode))
      this.index++;
    else {
      let s = new Pa(this.top, e, t, i);
      this.top.children.splice(this.index++, 0, s), this.changed = !0;
    }
  }
  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  addTextblockHacks() {
    let e = this.top.children[this.index - 1], t = this.top;
    for (; e instanceof _t; )
      t = e, e = t.children[t.children.length - 1];
    (!e || // Empty textblock
    !(e instanceof Qi) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((oe || ie) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", t), this.addHackNode("BR", this.top));
  }
  addHackNode(e, t) {
    if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e))
      this.index++;
    else {
      let i = document.createElement(e);
      e == "IMG" && (i.className = "ProseMirror-separator", i.alt = ""), e == "BR" && (i.className = "ProseMirror-trailingBreak");
      let r = new Ba(this.top, [], i, null);
      t != this.top ? t.children.push(r) : t.children.splice(this.index++, 0, r), this.changed = !0;
    }
  }
  isLocked(e) {
    return this.lock && (e == this.lock || e.nodeType == 1 && e.contains(this.lock.parentNode));
  }
}
function xu(n, e) {
  let t = e, i = t.children.length, r = n.childCount, s = /* @__PURE__ */ new Map(), o = [];
  e: for (; r > 0; ) {
    let l;
    for (; ; )
      if (i) {
        let c = t.children[i - 1];
        if (c instanceof _t)
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
      if (a != n.child(r - 1))
        break;
      --r, s.set(l, r), o.push(l);
    }
  }
  return { index: r, matched: s, matches: o.reverse() };
}
function Cu(n, e) {
  return n.type.side - e.type.side;
}
function Mu(n, e, t, i) {
  let r = e.locals(n), s = 0;
  if (r.length == 0) {
    for (let c = 0; c < n.childCount; c++) {
      let d = n.child(c);
      i(d, r, e.forChild(s, d), c), s += d.nodeSize;
    }
    return;
  }
  let o = 0, l = [], a = null;
  for (let c = 0; ; ) {
    let d, u;
    for (; o < r.length && r[o].to == s; ) {
      let g = r[o++];
      g.widget && (d ? (u || (u = [d])).push(g) : d = g);
    }
    if (d)
      if (u) {
        u.sort(Cu);
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
      l[g].to <= s && l.splice(g--, 1);
    for (; o < r.length && r[o].from <= s && r[o].to > s; )
      l.push(r[o++]);
    let f = s + p.nodeSize;
    if (p.isText) {
      let g = f;
      o < r.length && r[o].from < g && (g = r[o].from);
      for (let b = 0; b < l.length; b++)
        l[b].to < g && (g = l[b].to);
      g < f && (a = p.cut(g - s), p = p.cut(0, g - s), f = g, h = -1);
    } else
      for (; o < r.length && r[o].to < f; )
        o++;
    let m = p.isInline && !p.isLeaf ? l.filter((g) => !g.inline) : l.slice();
    i(p, m, e.forChild(s, p), h), s = f;
  }
}
function Eu(n) {
  if (n.nodeName == "UL" || n.nodeName == "OL") {
    let e = n.style.cssText;
    n.style.cssText = e + "; list-style: square !important", window.getComputedStyle(n).listStyle, n.style.cssText = e;
  }
}
function Au(n, e, t, i) {
  for (let r = 0, s = 0; r < n.childCount && s <= i; ) {
    let o = n.child(r++), l = s;
    if (s += o.nodeSize, !o.isText)
      continue;
    let a = o.text;
    for (; r < n.childCount; ) {
      let c = n.child(r++);
      if (s += c.nodeSize, !c.isText)
        break;
      a += c.text;
    }
    if (s >= t) {
      if (s >= i && a.slice(i - e.length - l, i - l) == e)
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
function Qr(n, e, t, i, r) {
  let s = [];
  for (let o = 0, l = 0; o < n.length; o++) {
    let a = n[o], c = l, d = l += a.size;
    c >= t || d <= e ? s.push(a) : (c < e && s.push(a.slice(0, e - c, i)), r && (s.push(r), r = void 0), d > t && s.push(a.slice(t - c, a.size, i)));
  }
  return s;
}
function _s(n, e = null) {
  let t = n.domSelectionRange(), i = n.state.doc;
  if (!t.focusNode)
    return null;
  let r = n.docView.nearestDesc(t.focusNode), s = r && r.size == 0, o = n.docView.posFromDOM(t.focusNode, t.focusOffset, 1);
  if (o < 0)
    return null;
  let l = i.resolve(o), a, c;
  if (Xi(t)) {
    for (a = o; r && !r.node; )
      r = r.parent;
    let u = r.node;
    if (r && u.isAtom && T.isSelectable(u) && r.parent && !(u.isInline && eu(t.focusNode, t.focusOffset, r.dom))) {
      let p = r.posBefore;
      c = new T(o == p ? l : i.resolve(p));
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
    let u = e == "pointer" || n.state.selection.head < l.pos && !s ? 1 : -1;
    c = Os(n, d, l, u);
  }
  return c;
}
function Fa(n) {
  return n.editable ? n.hasFocus() : Va(n) && document.activeElement && document.activeElement.contains(n.dom);
}
function je(n, e = !1) {
  let t = n.state.selection;
  if (qa(n, t), !!Fa(n)) {
    if (!e && n.input.mouseDown && n.input.mouseDown.allowDefault && ie) {
      let i = n.domSelectionRange(), r = n.domObserver.currentSelection;
      if (i.anchorNode && r.anchorNode && Nt(i.anchorNode, i.anchorOffset, r.anchorNode, r.anchorOffset)) {
        n.input.mouseDown.delayedSelectionSync = !0, n.domObserver.setCurSelection();
        return;
      }
    }
    if (n.domObserver.disconnectSelection(), n.cursorWrapper)
      Nu(n);
    else {
      let { anchor: i, head: r } = t, s, o;
      Bo && !(t instanceof N) && (t.$from.parent.inlineContent || (s = Ho(n, t.from)), !t.empty && !t.$from.parent.inlineContent && (o = Ho(n, t.to))), n.docView.setSelection(i, r, n, e), Bo && (s && zo(s), o && zo(o)), t.visible ? n.dom.classList.remove("ProseMirror-hideselection") : (n.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && Tu(n));
    }
    n.domObserver.setCurSelection(), n.domObserver.connectSelection();
  }
}
const Bo = oe || ie && Ta < 63;
function Ho(n, e) {
  let { node: t, offset: i } = n.docView.domFromPos(e, 0), r = i < t.childNodes.length ? t.childNodes[i] : null, s = i ? t.childNodes[i - 1] : null;
  if (oe && r && r.contentEditable == "false")
    return wr(r);
  if ((!r || r.contentEditable == "false") && (!s || s.contentEditable == "false")) {
    if (r)
      return wr(r);
    if (s)
      return wr(s);
  }
}
function wr(n) {
  return n.contentEditable = "true", oe && n.draggable && (n.draggable = !1, n.wasDraggable = !0), n;
}
function zo(n) {
  n.contentEditable = "false", n.wasDraggable && (n.draggable = !0, n.wasDraggable = null);
}
function Tu(n) {
  let e = n.dom.ownerDocument;
  e.removeEventListener("selectionchange", n.input.hideSelectionGuard);
  let t = n.domSelectionRange(), i = t.anchorNode, r = t.anchorOffset;
  e.addEventListener("selectionchange", n.input.hideSelectionGuard = () => {
    (t.anchorNode != i || t.anchorOffset != r) && (e.removeEventListener("selectionchange", n.input.hideSelectionGuard), setTimeout(() => {
      (!Fa(n) || n.state.selection.visible) && n.dom.classList.remove("ProseMirror-hideselection");
    }, 20));
  });
}
function Nu(n) {
  let e = n.domSelection();
  if (!e)
    return;
  let t = n.cursorWrapper.dom, i = t.nodeName == "IMG";
  i ? e.collapse(t.parentNode, te(t) + 1) : e.collapse(t, 0), !i && !n.state.selection.visible && he && ot <= 11 && (t.disabled = !0, t.disabled = !1);
}
function qa(n, e) {
  if (e instanceof T) {
    let t = n.docView.descAt(e.from);
    t != n.lastSelectedViewDesc && ($o(n), t && t.selectNode(), n.lastSelectedViewDesc = t);
  } else
    $o(n);
}
function $o(n) {
  n.lastSelectedViewDesc && (n.lastSelectedViewDesc.parent && n.lastSelectedViewDesc.deselectNode(), n.lastSelectedViewDesc = void 0);
}
function Os(n, e, t, i) {
  return n.someProp("createSelectionBetween", (r) => r(n, e, t)) || N.between(e, t, i);
}
function Fo(n) {
  return n.editable && !n.hasFocus() ? !1 : Va(n);
}
function Va(n) {
  let e = n.domSelectionRange();
  if (!e.anchorNode)
    return !1;
  try {
    return n.dom.contains(e.anchorNode.nodeType == 3 ? e.anchorNode.parentNode : e.anchorNode) && (n.editable || n.dom.contains(e.focusNode.nodeType == 3 ? e.focusNode.parentNode : e.focusNode));
  } catch {
    return !1;
  }
}
function _u(n) {
  let e = n.docView.domFromPos(n.state.selection.anchor, 0), t = n.domSelectionRange();
  return Nt(e.node, e.offset, t.anchorNode, t.anchorOffset);
}
function Zr(n, e) {
  let { $anchor: t, $head: i } = n.selection, r = e > 0 ? t.max(i) : t.min(i), s = r.parent.inlineContent ? r.depth ? n.doc.resolve(e > 0 ? r.after() : r.before()) : null : r;
  return s && _.findFrom(s, e);
}
function Ge(n, e) {
  return n.dispatch(n.state.tr.setSelection(e).scrollIntoView()), !0;
}
function qo(n, e, t) {
  let i = n.state.selection;
  if (i instanceof N)
    if (t.indexOf("s") > -1) {
      let { $head: r } = i, s = r.textOffset ? null : e < 0 ? r.nodeBefore : r.nodeAfter;
      if (!s || s.isText || !s.isLeaf)
        return !1;
      let o = n.state.doc.resolve(r.pos + s.nodeSize * (e < 0 ? -1 : 1));
      return Ge(n, new N(i.$anchor, o));
    } else if (i.empty) {
      if (n.endOfTextblock(e > 0 ? "forward" : "backward")) {
        let r = Zr(n.state, e);
        return r && r instanceof T ? Ge(n, r) : !1;
      } else if (!(we && t.indexOf("m") > -1)) {
        let r = i.$head, s = r.textOffset ? null : e < 0 ? r.nodeBefore : r.nodeAfter, o;
        if (!s || s.isText)
          return !1;
        let l = e < 0 ? r.pos - s.nodeSize : r.pos;
        return s.isAtom || (o = n.docView.descAt(l)) && !o.contentDOM ? T.isSelectable(s) ? Ge(n, new T(e < 0 ? n.state.doc.resolve(r.pos - s.nodeSize) : r)) : Rn ? Ge(n, new N(n.state.doc.resolve(e < 0 ? l : l + s.nodeSize))) : !1 : !1;
      }
    } else return !1;
  else {
    if (i instanceof T && i.node.isInline)
      return Ge(n, new N(e > 0 ? i.$to : i.$from));
    {
      let r = Zr(n.state, e);
      return r ? Ge(n, r) : !1;
    }
  }
}
function pi(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function dn(n, e) {
  let t = n.pmViewDesc;
  return t && t.size == 0 && (e < 0 || n.nextSibling || n.nodeName != "BR");
}
function Bt(n, e) {
  return e < 0 ? Ou(n) : Lu(n);
}
function Ou(n) {
  let e = n.domSelectionRange(), t = e.focusNode, i = e.focusOffset;
  if (!t)
    return;
  let r, s, o = !1;
  for (Se && t.nodeType == 1 && i < pi(t) && dn(t.childNodes[i], -1) && (o = !0); ; )
    if (i > 0) {
      if (t.nodeType != 1)
        break;
      {
        let l = t.childNodes[i - 1];
        if (dn(l, -1))
          r = t, s = --i;
        else if (l.nodeType == 3)
          t = l, i = t.nodeValue.length;
        else
          break;
      }
    } else {
      if (Wa(t))
        break;
      {
        let l = t.previousSibling;
        for (; l && dn(l, -1); )
          r = t.parentNode, s = te(l), l = l.previousSibling;
        if (l)
          t = l, i = pi(t);
        else {
          if (t = t.parentNode, t == n.dom)
            break;
          i = 0;
        }
      }
    }
  o ? es(n, t, i) : r && es(n, r, s);
}
function Lu(n) {
  let e = n.domSelectionRange(), t = e.focusNode, i = e.focusOffset;
  if (!t)
    return;
  let r = pi(t), s, o;
  for (; ; )
    if (i < r) {
      if (t.nodeType != 1)
        break;
      let l = t.childNodes[i];
      if (dn(l, 1))
        s = t, o = ++i;
      else
        break;
    } else {
      if (Wa(t))
        break;
      {
        let l = t.nextSibling;
        for (; l && dn(l, 1); )
          s = l.parentNode, o = te(l) + 1, l = l.nextSibling;
        if (l)
          t = l, i = 0, r = pi(t);
        else {
          if (t = t.parentNode, t == n.dom)
            break;
          i = r = 0;
        }
      }
    }
  s && es(n, s, o);
}
function Wa(n) {
  let e = n.pmViewDesc;
  return e && e.node && e.node.isBlock;
}
function Ru(n, e) {
  for (; n && e == n.childNodes.length && !Ln(n); )
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
function Iu(n, e) {
  for (; n && !e && !Ln(n); )
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
function es(n, e, t) {
  if (e.nodeType != 3) {
    let s, o;
    (o = Ru(e, t)) ? (e = o, t = 0) : (s = Iu(e, t)) && (e = s, t = s.nodeValue.length);
  }
  let i = n.domSelection();
  if (!i)
    return;
  if (Xi(i)) {
    let s = document.createRange();
    s.setEnd(e, t), s.setStart(e, t), i.removeAllRanges(), i.addRange(s);
  } else i.extend && i.extend(e, t);
  n.domObserver.setCurSelection();
  let { state: r } = n;
  setTimeout(() => {
    n.state == r && je(n);
  }, 50);
}
function Vo(n, e) {
  let t = n.state.doc.resolve(e);
  if (!(ie || Na) && t.parent.inlineContent) {
    let r = n.coordsAtPos(e);
    if (e > t.start()) {
      let s = n.coordsAtPos(e - 1), o = (s.top + s.bottom) / 2;
      if (o > r.top && o < r.bottom && Math.abs(s.left - r.left) > 1)
        return s.left < r.left ? "ltr" : "rtl";
    }
    if (e < t.end()) {
      let s = n.coordsAtPos(e + 1), o = (s.top + s.bottom) / 2;
      if (o > r.top && o < r.bottom && Math.abs(s.left - r.left) > 1)
        return s.left > r.left ? "ltr" : "rtl";
    }
  }
  return getComputedStyle(n.dom).direction == "rtl" ? "rtl" : "ltr";
}
function Wo(n, e, t) {
  let i = n.state.selection;
  if (i instanceof N && !i.empty || t.indexOf("s") > -1 || we && t.indexOf("m") > -1)
    return !1;
  let { $from: r, $to: s } = i;
  if (!r.parent.inlineContent || n.endOfTextblock(e < 0 ? "up" : "down")) {
    let o = Zr(n.state, e);
    if (o && o instanceof T)
      return Ge(n, o);
  }
  if (!r.parent.inlineContent) {
    let o = e < 0 ? r : s, l = i instanceof be ? _.near(o, e) : _.findFrom(o, e);
    return l ? Ge(n, l) : !1;
  }
  return !1;
}
function Uo(n, e) {
  if (!(n.state.selection instanceof N))
    return !0;
  let { $head: t, $anchor: i, empty: r } = n.state.selection;
  if (!t.sameParent(i))
    return !0;
  if (!r)
    return !1;
  if (n.endOfTextblock(e > 0 ? "forward" : "backward"))
    return !0;
  let s = !t.textOffset && (e < 0 ? t.nodeBefore : t.nodeAfter);
  if (s && !s.isText) {
    let o = n.state.tr;
    return e < 0 ? o.delete(t.pos - s.nodeSize, t.pos) : o.delete(t.pos, t.pos + s.nodeSize), n.dispatch(o), !0;
  }
  return !1;
}
function jo(n, e, t) {
  n.domObserver.stop(), e.contentEditable = t, n.domObserver.start();
}
function Du(n) {
  if (!oe || n.state.selection.$head.parentOffset > 0)
    return !1;
  let { focusNode: e, focusOffset: t } = n.domSelectionRange();
  if (e && e.nodeType == 1 && t == 0 && e.firstChild && e.firstChild.contentEditable == "false") {
    let i = e.firstChild;
    jo(n, i, "true"), setTimeout(() => jo(n, i, "false"), 20);
  }
  return !1;
}
function Pu(n) {
  let e = "";
  return n.ctrlKey && (e += "c"), n.metaKey && (e += "m"), n.altKey && (e += "a"), n.shiftKey && (e += "s"), e;
}
function Bu(n, e) {
  let t = e.keyCode, i = Pu(e);
  if (t == 8 || we && t == 72 && i == "c")
    return Uo(n, -1) || Bt(n, -1);
  if (t == 46 && !e.shiftKey || we && t == 68 && i == "c")
    return Uo(n, 1) || Bt(n, 1);
  if (t == 13 || t == 27)
    return !0;
  if (t == 37 || we && t == 66 && i == "c") {
    let r = t == 37 ? Vo(n, n.state.selection.from) == "ltr" ? -1 : 1 : -1;
    return qo(n, r, i) || Bt(n, r);
  } else if (t == 39 || we && t == 70 && i == "c") {
    let r = t == 39 ? Vo(n, n.state.selection.from) == "ltr" ? 1 : -1 : 1;
    return qo(n, r, i) || Bt(n, r);
  } else {
    if (t == 38 || we && t == 80 && i == "c")
      return Wo(n, -1, i) || Bt(n, -1);
    if (t == 40 || we && t == 78 && i == "c")
      return Du(n) || Wo(n, 1, i) || Bt(n, 1);
    if (i == (we ? "m" : "c") && (t == 66 || t == 73 || t == 89 || t == 90))
      return !0;
  }
  return !1;
}
function Ls(n, e) {
  n.someProp("transformCopied", (h) => {
    e = h(e, n);
  });
  let t = [], { content: i, openStart: r, openEnd: s } = e;
  for (; r > 1 && s > 1 && i.childCount == 1 && i.firstChild.childCount == 1; ) {
    r--, s--;
    let h = i.firstChild;
    t.push(h.type.name, h.attrs != h.type.defaultAttrs ? h.attrs : null), i = h.content;
  }
  let o = n.someProp("clipboardSerializer") || It.fromSchema(n.state.schema), l = Ya(), a = l.createElement("div");
  a.appendChild(o.serializeFragment(i, { document: l }));
  let c = a.firstChild, d, u = 0;
  for (; c && c.nodeType == 1 && (d = Ga[c.nodeName.toLowerCase()]); ) {
    for (let h = d.length - 1; h >= 0; h--) {
      let f = l.createElement(d[h]);
      for (; a.firstChild; )
        f.appendChild(a.firstChild);
      a.appendChild(f), u++;
    }
    c = a.firstChild;
  }
  c && c.nodeType == 1 && c.setAttribute("data-pm-slice", `${r} ${s}${u ? ` -${u}` : ""} ${JSON.stringify(t)}`);
  let p = n.someProp("clipboardTextSerializer", (h) => h(e, n)) || e.content.textBetween(0, e.content.size, `

`);
  return { dom: a, text: p, slice: e };
}
function Ua(n, e, t, i, r) {
  let s = r.parent.type.spec.code, o, l;
  if (!t && !e)
    return null;
  let a = !!e && (i || s || !t);
  if (a) {
    if (n.someProp("transformPastedText", (p) => {
      e = p(e, s || i, n);
    }), s)
      return l = new x(y.from(n.state.schema.text(e.replace(/\r\n?/g, `
`))), 0, 0), n.someProp("transformPasted", (p) => {
        l = p(l, n, !0);
      }), l;
    let u = n.someProp("clipboardTextParser", (p) => p(e, r, i, n));
    if (u)
      l = u;
    else {
      let p = r.marks(), { schema: h } = n.state, f = It.fromSchema(h);
      o = document.createElement("div"), e.split(/(?:\r\n?|\n)+/).forEach((m) => {
        let g = o.appendChild(document.createElement("p"));
        m && g.appendChild(f.serializeNode(h.text(m, p)));
      });
    }
  } else
    n.someProp("transformPastedHTML", (u) => {
      t = u(t, n);
    }), o = Fu(t), Rn && qu(o);
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
  if (l || (l = (n.someProp("clipboardParser") || n.someProp("domParser") || st.fromSchema(n.state.schema)).parseSlice(o, {
    preserveWhitespace: !!(a || d),
    context: r,
    ruleFromNode(p) {
      return p.nodeName == "BR" && !p.nextSibling && p.parentNode && !Hu.test(p.parentNode.nodeName) ? { ignore: !0 } : null;
    }
  })), d)
    l = Vu(Ko(l, +d[1], +d[2]), d[4]);
  else if (l = x.maxOpen(zu(l.content, r), !0), l.openStart || l.openEnd) {
    let u = 0, p = 0;
    for (let h = l.content.firstChild; u < l.openStart && !h.type.spec.isolating; u++, h = h.firstChild)
      ;
    for (let h = l.content.lastChild; p < l.openEnd && !h.type.spec.isolating; p++, h = h.lastChild)
      ;
    l = Ko(l, u, p);
  }
  return n.someProp("transformPasted", (u) => {
    l = u(l, n, a);
  }), l;
}
const Hu = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function zu(n, e) {
  if (n.childCount < 2)
    return n;
  for (let t = e.depth; t >= 0; t--) {
    let r = e.node(t).contentMatchAt(e.index(t)), s, o = [];
    if (n.forEach((l) => {
      if (!o)
        return;
      let a = r.findWrapping(l.type), c;
      if (!a)
        return o = null;
      if (c = o.length && s.length && Ka(a, s, l, o[o.length - 1], 0))
        o[o.length - 1] = c;
      else {
        o.length && (o[o.length - 1] = Ja(o[o.length - 1], s.length));
        let d = ja(l, a);
        o.push(d), r = r.matchType(d.type), s = a;
      }
    }), o)
      return y.from(o);
  }
  return n;
}
function ja(n, e, t = 0) {
  for (let i = e.length - 1; i >= t; i--)
    n = e[i].create(null, y.from(n));
  return n;
}
function Ka(n, e, t, i, r) {
  if (r < n.length && r < e.length && n[r] == e[r]) {
    let s = Ka(n, e, t, i.lastChild, r + 1);
    if (s)
      return i.copy(i.content.replaceChild(i.childCount - 1, s));
    if (i.contentMatchAt(i.childCount).matchType(r == n.length - 1 ? t.type : n[r + 1]))
      return i.copy(i.content.append(y.from(ja(t, n, r + 1))));
  }
}
function Ja(n, e) {
  if (e == 0)
    return n;
  let t = n.content.replaceChild(n.childCount - 1, Ja(n.lastChild, e - 1)), i = n.contentMatchAt(n.childCount).fillBefore(y.empty, !0);
  return n.copy(t.append(i));
}
function ts(n, e, t, i, r, s) {
  let o = e < 0 ? n.firstChild : n.lastChild, l = o.content;
  return n.childCount > 1 && (s = 0), r < i - 1 && (l = ts(l, e, t, i, r + 1, s)), r >= t && (l = e < 0 ? o.contentMatchAt(0).fillBefore(l, s <= r).append(l) : l.append(o.contentMatchAt(o.childCount).fillBefore(y.empty, !0))), n.replaceChild(e < 0 ? 0 : n.childCount - 1, o.copy(l));
}
function Ko(n, e, t) {
  return e < n.openStart && (n = new x(ts(n.content, -1, e, n.openStart, 0, n.openEnd), e, n.openEnd)), t < n.openEnd && (n = new x(ts(n.content, 1, t, n.openEnd, 0, 0), n.openStart, t)), n;
}
const Ga = {
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
let Jo = null;
function Ya() {
  return Jo || (Jo = document.implementation.createHTMLDocument("title"));
}
let vr = null;
function $u(n) {
  let e = window.trustedTypes;
  return e ? (vr || (vr = e.defaultPolicy || e.createPolicy("ProseMirrorClipboard", { createHTML: (t) => t })), vr.createHTML(n)) : n;
}
function Fu(n) {
  let e = /^(\s*<meta [^>]*>)*/.exec(n);
  e && (n = n.slice(e[0].length));
  let t = Ya().createElement("div"), i = /<([a-z][^>\s]+)/i.exec(n), r;
  if ((r = i && Ga[i[1].toLowerCase()]) && (n = r.map((s) => "<" + s + ">").join("") + n + r.map((s) => "</" + s + ">").reverse().join("")), t.innerHTML = $u(n), r)
    for (let s = 0; s < r.length; s++)
      t = t.querySelector(r[s]) || t;
  return t;
}
function qu(n) {
  let e = n.querySelectorAll(ie ? "span:not([class]):not([style])" : "span.Apple-converted-space");
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    i.childNodes.length == 1 && i.textContent == " " && i.parentNode && i.parentNode.replaceChild(n.ownerDocument.createTextNode(" "), i);
  }
}
function Vu(n, e) {
  if (!n.size)
    return n;
  let t = n.content.firstChild.type.schema, i;
  try {
    i = JSON.parse(e);
  } catch {
    return n;
  }
  let { content: r, openStart: s, openEnd: o } = n;
  for (let l = i.length - 2; l >= 0; l -= 2) {
    let a = t.nodes[i[l]];
    if (!a || a.hasRequiredAttrs())
      break;
    r = y.from(a.create(i[l + 1], r)), s++, o++;
  }
  return new x(r, s, o);
}
const de = {}, ue = {}, Wu = { touchstart: !0, touchmove: !0 };
class Uu {
  constructor() {
    this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = { time: 0, x: 0, y: 0, type: "", button: 0 }, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = /* @__PURE__ */ Object.create(null), this.hideSelectionGuard = null;
  }
}
function ju(n) {
  for (let e in de) {
    let t = de[e];
    n.dom.addEventListener(e, n.input.eventHandlers[e] = (i) => {
      Ju(n, i) && !Rs(n, i) && (n.editable || !(i.type in ue)) && t(n, i);
    }, Wu[e] ? { passive: !0 } : void 0);
  }
  oe && n.dom.addEventListener("input", () => null), ns(n);
}
function it(n, e) {
  n.input.lastSelectionOrigin = e, n.input.lastSelectionTime = Date.now();
}
function Ku(n) {
  n.domObserver.stop();
  for (let e in n.input.eventHandlers)
    n.dom.removeEventListener(e, n.input.eventHandlers[e]);
  clearTimeout(n.input.composingTimeout), clearTimeout(n.input.lastIOSEnterFallbackTimeout);
}
function ns(n) {
  n.someProp("handleDOMEvents", (e) => {
    for (let t in e)
      n.input.eventHandlers[t] || n.dom.addEventListener(t, n.input.eventHandlers[t] = (i) => Rs(n, i));
  });
}
function Rs(n, e) {
  return n.someProp("handleDOMEvents", (t) => {
    let i = t[e.type];
    return i ? i(n, e) || e.defaultPrevented : !1;
  });
}
function Ju(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target; t != n.dom; t = t.parentNode)
    if (!t || t.nodeType == 11 || t.pmViewDesc && t.pmViewDesc.stopEvent(e))
      return !1;
  return !0;
}
function Gu(n, e) {
  !Rs(n, e) && de[e.type] && (n.editable || !(e.type in ue)) && de[e.type](n, e);
}
ue.keydown = (n, e) => {
  let t = e;
  if (n.input.shiftKey = t.keyCode == 16 || t.shiftKey, !Qa(n, t) && (n.input.lastKeyCode = t.keyCode, n.input.lastKeyCodeTime = Date.now(), !(We && ie && t.keyCode == 13)))
    if (t.keyCode != 229 && n.domObserver.forceFlush(), Kt && t.keyCode == 13 && !t.ctrlKey && !t.altKey && !t.metaKey) {
      let i = Date.now();
      n.input.lastIOSEnter = i, n.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
        n.input.lastIOSEnter == i && (n.someProp("handleKeyDown", (r) => r(n, gt(13, "Enter"))), n.input.lastIOSEnter = 0);
      }, 200);
    } else n.someProp("handleKeyDown", (i) => i(n, t)) || Bu(n, t) ? t.preventDefault() : it(n, "key");
};
ue.keyup = (n, e) => {
  e.keyCode == 16 && (n.input.shiftKey = !1);
};
ue.keypress = (n, e) => {
  let t = e;
  if (Qa(n, t) || !t.charCode || t.ctrlKey && !t.altKey || we && t.metaKey)
    return;
  if (n.someProp("handleKeyPress", (r) => r(n, t))) {
    t.preventDefault();
    return;
  }
  let i = n.state.selection;
  if (!(i instanceof N) || !i.$from.sameParent(i.$to)) {
    let r = String.fromCharCode(t.charCode), s = () => n.state.tr.insertText(r).scrollIntoView();
    !/[\r\n]/.test(r) && !n.someProp("handleTextInput", (o) => o(n, i.$from.pos, i.$to.pos, r, s)) && n.dispatch(s()), t.preventDefault();
  }
};
function Zi(n) {
  return { left: n.clientX, top: n.clientY };
}
function Yu(n, e) {
  let t = e.x - n.clientX, i = e.y - n.clientY;
  return t * t + i * i < 100;
}
function Is(n, e, t, i, r) {
  if (i == -1)
    return !1;
  let s = n.state.doc.resolve(i);
  for (let o = s.depth + 1; o > 0; o--)
    if (n.someProp(e, (l) => o > s.depth ? l(n, t, s.nodeAfter, s.before(o), r, !0) : l(n, t, s.node(o), s.before(o), r, !1)))
      return !0;
  return !1;
}
function Wt(n, e, t) {
  if (n.focused || n.focus(), n.state.selection.eq(e))
    return;
  let i = n.state.tr.setSelection(e);
  i.setMeta("pointer", !0), n.dispatch(i);
}
function Xu(n, e) {
  if (e == -1)
    return !1;
  let t = n.state.doc.resolve(e), i = t.nodeAfter;
  return i && i.isAtom && T.isSelectable(i) ? (Wt(n, new T(t)), !0) : !1;
}
function Qu(n, e) {
  if (e == -1)
    return !1;
  let t = n.state.selection, i, r;
  t instanceof T && (i = t.node);
  let s = n.state.doc.resolve(e);
  for (let o = s.depth + 1; o > 0; o--) {
    let l = o > s.depth ? s.nodeAfter : s.node(o);
    if (T.isSelectable(l)) {
      i && t.$from.depth > 0 && o >= t.$from.depth && s.before(t.$from.depth + 1) == t.$from.pos ? r = s.before(t.$from.depth) : r = s.before(o);
      break;
    }
  }
  return r != null ? (Wt(n, T.create(n.state.doc, r)), !0) : !1;
}
function Zu(n, e, t, i, r) {
  return Is(n, "handleClickOn", e, t, i) || n.someProp("handleClick", (s) => s(n, e, i)) || (r ? Qu(n, t) : Xu(n, t));
}
function ep(n, e, t, i) {
  return Is(n, "handleDoubleClickOn", e, t, i) || n.someProp("handleDoubleClick", (r) => r(n, e, i));
}
function tp(n, e, t, i) {
  return Is(n, "handleTripleClickOn", e, t, i) || n.someProp("handleTripleClick", (r) => r(n, e, i)) || np(n, t, i);
}
function np(n, e, t) {
  if (t.button != 0)
    return !1;
  let i = n.state.doc;
  if (e == -1)
    return i.inlineContent ? (Wt(n, N.create(i, 0, i.content.size)), !0) : !1;
  let r = i.resolve(e);
  for (let s = r.depth + 1; s > 0; s--) {
    let o = s > r.depth ? r.nodeAfter : r.node(s), l = r.before(s);
    if (o.inlineContent)
      Wt(n, N.create(i, l + 1, l + 1 + o.content.size));
    else if (T.isSelectable(o))
      Wt(n, T.create(i, l));
    else
      continue;
    return !0;
  }
}
function Ds(n) {
  return hi(n);
}
const Xa = we ? "metaKey" : "ctrlKey";
de.mousedown = (n, e) => {
  let t = e;
  n.input.shiftKey = t.shiftKey;
  let i = Ds(n), r = Date.now(), s = "singleClick";
  r - n.input.lastClick.time < 500 && Yu(t, n.input.lastClick) && !t[Xa] && n.input.lastClick.button == t.button && (n.input.lastClick.type == "singleClick" ? s = "doubleClick" : n.input.lastClick.type == "doubleClick" && (s = "tripleClick")), n.input.lastClick = { time: r, x: t.clientX, y: t.clientY, type: s, button: t.button };
  let o = n.posAtCoords(Zi(t));
  o && (s == "singleClick" ? (n.input.mouseDown && n.input.mouseDown.done(), n.input.mouseDown = new ip(n, o, t, !!i)) : (s == "doubleClick" ? ep : tp)(n, o.pos, o.inside, t) ? t.preventDefault() : it(n, "pointer"));
};
class ip {
  constructor(e, t, i, r) {
    this.view = e, this.pos = t, this.event = i, this.flushed = r, this.delayedSelectionSync = !1, this.mightDrag = null, this.startDoc = e.state.doc, this.selectNode = !!i[Xa], this.allowDefault = i.shiftKey;
    let s, o;
    if (t.inside > -1)
      s = e.state.doc.nodeAt(t.inside), o = t.inside;
    else {
      let d = e.state.doc.resolve(t.pos);
      s = d.parent, o = d.depth ? d.before() : 0;
    }
    const l = r ? null : i.target, a = l ? e.docView.nearestDesc(l, !0) : null;
    this.target = a && a.nodeDOM.nodeType == 1 ? a.nodeDOM : null;
    let { selection: c } = e.state;
    (i.button == 0 && s.type.spec.draggable && s.type.spec.selectable !== !1 || c instanceof T && c.from <= o && c.to > o) && (this.mightDrag = {
      node: s,
      pos: o,
      addAttr: !!(this.target && !this.target.draggable),
      setUneditable: !!(this.target && Se && !this.target.hasAttribute("contentEditable"))
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
    this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(Zi(e))), this.updateAllowDefault(e), this.allowDefault || !t ? it(this.view, "pointer") : Zu(this.view, t.pos, t.inside, e, this.selectNode) ? e.preventDefault() : e.button == 0 && (this.flushed || // Safari ignores clicks on draggable elements
    oe && this.mightDrag && !this.mightDrag.node.isAtom || // Chrome will sometimes treat a node selection as a
    // cursor, but still report that the node is selected
    // when asked through getSelection. You'll then get a
    // situation where clicking at the point where that
    // (hidden) cursor is doesn't change the selection, and
    // thus doesn't get a reaction from ProseMirror. This
    // works around that.
    ie && !this.view.state.selection.visible && Math.min(Math.abs(t.pos - this.view.state.selection.from), Math.abs(t.pos - this.view.state.selection.to)) <= 2) ? (Wt(this.view, _.near(this.view.state.doc.resolve(t.pos))), e.preventDefault()) : it(this.view, "pointer");
  }
  move(e) {
    this.updateAllowDefault(e), it(this.view, "pointer"), e.buttons == 0 && this.done();
  }
  updateAllowDefault(e) {
    !this.allowDefault && (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) && (this.allowDefault = !0);
  }
}
de.touchstart = (n) => {
  n.input.lastTouch = Date.now(), Ds(n), it(n, "pointer");
};
de.touchmove = (n) => {
  n.input.lastTouch = Date.now(), it(n, "pointer");
};
de.contextmenu = (n) => Ds(n);
function Qa(n, e) {
  return n.composing ? !0 : oe && Math.abs(e.timeStamp - n.input.compositionEndedAt) < 500 ? (n.input.compositionEndedAt = -2e8, !0) : !1;
}
const rp = We ? 5e3 : -1;
ue.compositionstart = ue.compositionupdate = (n) => {
  if (!n.composing) {
    n.domObserver.flush();
    let { state: e } = n, t = e.selection.$to;
    if (e.selection instanceof N && (e.storedMarks || !t.textOffset && t.parentOffset && t.nodeBefore.marks.some((i) => i.type.spec.inclusive === !1) || ie && Na && sp(n)))
      n.markCursor = n.state.storedMarks || t.marks(), hi(n, !0), n.markCursor = null;
    else if (hi(n, !e.selection.empty), Se && e.selection.empty && t.parentOffset && !t.textOffset && t.nodeBefore.marks.length) {
      let i = n.domSelectionRange();
      for (let r = i.focusNode, s = i.focusOffset; r && r.nodeType == 1 && s != 0; ) {
        let o = s < 0 ? r.lastChild : r.childNodes[s - 1];
        if (!o)
          break;
        if (o.nodeType == 3) {
          let l = n.domSelection();
          l && l.collapse(o, o.nodeValue.length);
          break;
        } else
          r = o, s = -1;
      }
    }
    n.input.composing = !0;
  }
  Za(n, rp);
};
function sp(n) {
  let { focusNode: e, focusOffset: t } = n.domSelectionRange();
  if (!e || e.nodeType != 1 || t >= e.childNodes.length)
    return !1;
  let i = e.childNodes[t];
  return i.nodeType == 1 && i.contentEditable == "false";
}
ue.compositionend = (n, e) => {
  n.composing && (n.input.composing = !1, n.input.compositionEndedAt = e.timeStamp, n.input.compositionPendingChanges = n.domObserver.pendingRecords().length ? n.input.compositionID : 0, n.input.compositionNode = null, n.input.badSafariComposition ? n.domObserver.forceFlush() : n.input.compositionPendingChanges && Promise.resolve().then(() => n.domObserver.flush()), n.input.compositionID++, Za(n, 20));
};
function Za(n, e) {
  clearTimeout(n.input.composingTimeout), e > -1 && (n.input.composingTimeout = setTimeout(() => hi(n), e));
}
function ec(n) {
  for (n.composing && (n.input.composing = !1, n.input.compositionEndedAt = lp()); n.input.compositionNodes.length > 0; )
    n.input.compositionNodes.pop().markParentsDirty();
}
function op(n) {
  let e = n.domSelectionRange();
  if (!e.focusNode)
    return null;
  let t = Qd(e.focusNode, e.focusOffset), i = Zd(e.focusNode, e.focusOffset);
  if (t && i && t != i) {
    let r = i.pmViewDesc, s = n.domObserver.lastChangedTextNode;
    if (t == s || i == s)
      return s;
    if (!r || !r.isText(i.nodeValue))
      return i;
    if (n.input.compositionNode == i) {
      let o = t.pmViewDesc;
      if (!(!o || !o.isText(t.nodeValue)))
        return i;
    }
  }
  return t || i;
}
function lp() {
  let n = document.createEvent("Event");
  return n.initEvent("event", !0, !0), n.timeStamp;
}
function hi(n, e = !1) {
  if (!(We && n.domObserver.flushingSoon >= 0)) {
    if (n.domObserver.forceFlush(), ec(n), e || n.docView && n.docView.dirty) {
      let t = _s(n), i = n.state.selection;
      return t && !t.eq(i) ? n.dispatch(n.state.tr.setSelection(t)) : (n.markCursor || e) && !i.$from.node(i.$from.sharedDepth(i.to)).inlineContent ? n.dispatch(n.state.tr.deleteSelection()) : n.updateState(n.state), !0;
    }
    return !1;
  }
}
function ap(n, e) {
  if (!n.dom.parentNode)
    return;
  let t = n.dom.parentNode.appendChild(document.createElement("div"));
  t.appendChild(e), t.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let i = getSelection(), r = document.createRange();
  r.selectNodeContents(e), n.dom.blur(), i.removeAllRanges(), i.addRange(r), setTimeout(() => {
    t.parentNode && t.parentNode.removeChild(t), n.focus();
  }, 50);
}
const Sn = he && ot < 15 || Kt && iu < 604;
de.copy = ue.cut = (n, e) => {
  let t = e, i = n.state.selection, r = t.type == "cut";
  if (i.empty)
    return;
  let s = Sn ? null : t.clipboardData, o = i.content(), { dom: l, text: a } = Ls(n, o);
  s ? (t.preventDefault(), s.clearData(), s.setData("text/html", l.innerHTML), s.setData("text/plain", a)) : ap(n, l), r && n.dispatch(n.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function cp(n) {
  return n.openStart == 0 && n.openEnd == 0 && n.content.childCount == 1 ? n.content.firstChild : null;
}
function dp(n, e) {
  if (!n.dom.parentNode)
    return;
  let t = n.input.shiftKey || n.state.selection.$from.parent.type.spec.code, i = n.dom.parentNode.appendChild(document.createElement(t ? "textarea" : "div"));
  t || (i.contentEditable = "true"), i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.focus();
  let r = n.input.shiftKey && n.input.lastKeyCode != 45;
  setTimeout(() => {
    n.focus(), i.parentNode && i.parentNode.removeChild(i), t ? xn(n, i.value, null, r, e) : xn(n, i.textContent, i.innerHTML, r, e);
  }, 50);
}
function xn(n, e, t, i, r) {
  let s = Ua(n, e, t, i, n.state.selection.$from);
  if (n.someProp("handlePaste", (a) => a(n, r, s || x.empty)))
    return !0;
  if (!s)
    return !1;
  let o = cp(s), l = o ? n.state.tr.replaceSelectionWith(o, i) : n.state.tr.replaceSelection(s);
  return n.dispatch(l.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function tc(n) {
  let e = n.getData("text/plain") || n.getData("Text");
  if (e)
    return e;
  let t = n.getData("text/uri-list");
  return t ? t.replace(/\r?\n/g, " ") : "";
}
ue.paste = (n, e) => {
  let t = e;
  if (n.composing && !We)
    return;
  let i = Sn ? null : t.clipboardData, r = n.input.shiftKey && n.input.lastKeyCode != 45;
  i && xn(n, tc(i), i.getData("text/html"), r, t) ? t.preventDefault() : dp(n, t);
};
class nc {
  constructor(e, t, i) {
    this.slice = e, this.move = t, this.node = i;
  }
}
const up = we ? "altKey" : "ctrlKey";
function ic(n, e) {
  let t = n.someProp("dragCopies", (i) => !i(e));
  return t ?? !e[up];
}
de.dragstart = (n, e) => {
  let t = e, i = n.input.mouseDown;
  if (i && i.done(), !t.dataTransfer)
    return;
  let r = n.state.selection, s = r.empty ? null : n.posAtCoords(Zi(t)), o;
  if (!(s && s.pos >= r.from && s.pos <= (r instanceof T ? r.to - 1 : r.to))) {
    if (i && i.mightDrag)
      o = T.create(n.state.doc, i.mightDrag.pos);
    else if (t.target && t.target.nodeType == 1) {
      let u = n.docView.nearestDesc(t.target, !0);
      u && u.node.type.spec.draggable && u != n.docView && (o = T.create(n.state.doc, u.posBefore));
    }
  }
  let l = (o || n.state.selection).content(), { dom: a, text: c, slice: d } = Ls(n, l);
  (!t.dataTransfer.files.length || !ie || Ta > 120) && t.dataTransfer.clearData(), t.dataTransfer.setData(Sn ? "Text" : "text/html", a.innerHTML), t.dataTransfer.effectAllowed = "copyMove", Sn || t.dataTransfer.setData("text/plain", c), n.dragging = new nc(d, ic(n, t), o);
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
    pp(n, e, n.dragging);
  } finally {
    n.dragging = null;
  }
};
function pp(n, e, t) {
  if (!e.dataTransfer)
    return;
  let i = n.posAtCoords(Zi(e));
  if (!i)
    return;
  let r = n.state.doc.resolve(i.pos), s = t && t.slice;
  s ? n.someProp("transformPasted", (h) => {
    s = h(s, n, !1);
  }) : s = Ua(n, tc(e.dataTransfer), Sn ? null : e.dataTransfer.getData("text/html"), !1, r);
  let o = !!(t && ic(n, e));
  if (n.someProp("handleDrop", (h) => h(n, e, s || x.empty, o))) {
    e.preventDefault();
    return;
  }
  if (!s)
    return;
  e.preventDefault();
  let l = s ? ka(n.state.doc, r.pos, s) : r.pos;
  l == null && (l = r.pos);
  let a = n.state.tr;
  if (o) {
    let { node: h } = t;
    h ? h.replace(a) : a.deleteSelection();
  }
  let c = a.mapping.map(l), d = s.openStart == 0 && s.openEnd == 0 && s.content.childCount == 1, u = a.doc;
  if (d ? a.replaceRangeWith(c, c, s.content.firstChild) : a.replaceRange(c, c, s), a.doc.eq(u))
    return;
  let p = a.doc.resolve(c);
  if (d && T.isSelectable(s.content.firstChild) && p.nodeAfter && p.nodeAfter.sameMarkup(s.content.firstChild))
    a.setSelection(new T(p));
  else {
    let h = a.mapping.map(l);
    a.mapping.maps[a.mapping.maps.length - 1].forEach((f, m, g, b) => h = b), a.setSelection(Os(n, p, a.doc.resolve(h)));
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
  if (ie && We && e.inputType == "deleteContentBackward") {
    n.domObserver.flushSoon();
    let { domChangeCount: i } = n.input;
    setTimeout(() => {
      if (n.input.domChangeCount != i || (n.dom.blur(), n.focus(), n.someProp("handleKeyDown", (s) => s(n, gt(8, "Backspace")))))
        return;
      let { $cursor: r } = n.state.selection;
      r && r.pos > 0 && n.dispatch(n.state.tr.delete(r.pos - 1, r.pos).scrollIntoView());
    }, 50);
  }
};
for (let n in ue)
  de[n] = ue[n];
function Cn(n, e) {
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
class fi {
  constructor(e, t) {
    this.toDOM = e, this.spec = t || Ct, this.side = this.spec.side || 0;
  }
  map(e, t, i, r) {
    let { pos: s, deleted: o } = e.mapResult(t.from + r, this.side < 0 ? -1 : 1);
    return o ? null : new re(s - i, s - i, this);
  }
  valid() {
    return !0;
  }
  eq(e) {
    return this == e || e instanceof fi && (this.spec.key && this.spec.key == e.spec.key || this.toDOM == e.toDOM && Cn(this.spec, e.spec));
  }
  destroy(e) {
    this.spec.destroy && this.spec.destroy(e);
  }
}
class at {
  constructor(e, t) {
    this.attrs = e, this.spec = t || Ct;
  }
  map(e, t, i, r) {
    let s = e.map(t.from + r, this.spec.inclusiveStart ? -1 : 1) - i, o = e.map(t.to + r, this.spec.inclusiveEnd ? 1 : -1) - i;
    return s >= o ? null : new re(s, o, this);
  }
  valid(e, t) {
    return t.from < t.to;
  }
  eq(e) {
    return this == e || e instanceof at && Cn(this.attrs, e.attrs) && Cn(this.spec, e.spec);
  }
  static is(e) {
    return e.type instanceof at;
  }
  destroy() {
  }
}
class Ps {
  constructor(e, t) {
    this.attrs = e, this.spec = t || Ct;
  }
  map(e, t, i, r) {
    let s = e.mapResult(t.from + r, 1);
    if (s.deleted)
      return null;
    let o = e.mapResult(t.to + r, -1);
    return o.deleted || o.pos <= s.pos ? null : new re(s.pos - i, o.pos - i, this);
  }
  valid(e, t) {
    let { index: i, offset: r } = e.content.findIndex(t.from), s;
    return r == t.from && !(s = e.child(i)).isText && r + s.nodeSize == t.to;
  }
  eq(e) {
    return this == e || e instanceof Ps && Cn(this.attrs, e.attrs) && Cn(this.spec, e.spec);
  }
  destroy() {
  }
}
class re {
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
    return new re(e, t, this.type);
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
    return new re(e, e, new fi(t, i));
  }
  /**
  Creates an inline decoration, which adds the given attributes to
  each inline node between `from` and `to`.
  */
  static inline(e, t, i, r) {
    return new re(e, t, new at(i, r));
  }
  /**
  Creates a node decoration. `from` and `to` should point precisely
  before and after a node in the document. That node, and only that
  node, will receive the given attributes.
  */
  static node(e, t, i, r) {
    return new re(e, t, new Ps(i, r));
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
    return this.type instanceof fi;
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
    return t.length ? mi(t, e, 0, Ct) : se;
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
    let r = [];
    return this.findInner(e ?? 0, t ?? 1e9, r, 0, i), r;
  }
  findInner(e, t, i, r, s) {
    for (let o = 0; o < this.local.length; o++) {
      let l = this.local[o];
      l.from <= t && l.to >= e && (!s || s(l.spec)) && i.push(l.copy(l.from + r, l.to + r));
    }
    for (let o = 0; o < this.children.length; o += 3)
      if (this.children[o] < t && this.children[o + 1] > e) {
        let l = this.children[o] + 1;
        this.children[o + 2].findInner(e - l, t - l, i, r + l, s);
      }
  }
  /**
  Map the set of decorations in response to a change in the
  document.
  */
  map(e, t, i) {
    return this == se || e.maps.length == 0 ? this : this.mapInner(e, t, 0, 0, i || Ct);
  }
  /**
  @internal
  */
  mapInner(e, t, i, r, s) {
    let o;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l].map(e, i, r);
      a && a.type.valid(t, a) ? (o || (o = [])).push(a) : s.onRemove && s.onRemove(this.local[l].spec);
    }
    return this.children.length ? hp(this.children, o || [], e, t, i, r, s) : o ? new F(o.sort(Mt), zt) : se;
  }
  /**
  Add the given array of decorations to the ones in the set,
  producing a new set. Consumes the `decorations` array. Needs
  access to the current document to create the appropriate tree
  structure.
  */
  add(e, t) {
    return t.length ? this == se ? F.create(e, t) : this.addInner(e, t, 0) : this;
  }
  addInner(e, t, i) {
    let r, s = 0;
    e.forEach((l, a) => {
      let c = a + i, d;
      if (d = sc(t, l, c)) {
        for (r || (r = this.children.slice()); s < r.length && r[s] < a; )
          s += 3;
        r[s] == a ? r[s + 2] = r[s + 2].addInner(l, d, c + 1) : r.splice(s, 0, a, a + l.nodeSize, mi(d, l, c + 1, Ct)), s += 3;
      }
    });
    let o = rc(s ? oc(t) : t, -i);
    for (let l = 0; l < o.length; l++)
      o[l].type.valid(e, o[l]) || o.splice(l--, 1);
    return new F(o.length ? this.local.concat(o).sort(Mt) : this.local, r || this.children);
  }
  /**
  Create a new set that contains the decorations in this set, minus
  the ones in the given array.
  */
  remove(e) {
    return e.length == 0 || this == se ? this : this.removeInner(e, 0);
  }
  removeInner(e, t) {
    let i = this.children, r = this.local;
    for (let s = 0; s < i.length; s += 3) {
      let o, l = i[s] + t, a = i[s + 1] + t;
      for (let d = 0, u; d < e.length; d++)
        (u = e[d]) && u.from > l && u.to < a && (e[d] = null, (o || (o = [])).push(u));
      if (!o)
        continue;
      i == this.children && (i = this.children.slice());
      let c = i[s + 2].removeInner(o, l + 1);
      c != se ? i[s + 2] = c : (i.splice(s, 3), s -= 3);
    }
    if (r.length) {
      for (let s = 0, o; s < e.length; s++)
        if (o = e[s])
          for (let l = 0; l < r.length; l++)
            r[l].eq(o, t) && (r == this.local && (r = this.local.slice()), r.splice(l--, 1));
    }
    return i == this.children && r == this.local ? this : r.length || i.length ? new F(r, i) : se;
  }
  forChild(e, t) {
    if (this == se)
      return this;
    if (t.isLeaf)
      return F.empty;
    let i, r;
    for (let l = 0; l < this.children.length; l += 3)
      if (this.children[l] >= e) {
        this.children[l] == e && (i = this.children[l + 2]);
        break;
      }
    let s = e + 1, o = s + t.content.size;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l];
      if (a.from < o && a.to > s && a.type instanceof at) {
        let c = Math.max(s, a.from) - s, d = Math.min(o, a.to) - s;
        c < d && (r || (r = [])).push(a.copy(c, d));
      }
    }
    if (r) {
      let l = new F(r.sort(Mt), zt);
      return i ? new Qe([l, i]) : l;
    }
    return i || se;
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
    return Bs(this.localsInner(e));
  }
  /**
  @internal
  */
  localsInner(e) {
    if (this == se)
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
F.removeOverlap = Bs;
const se = F.empty;
class Qe {
  constructor(e) {
    this.members = e;
  }
  map(e, t) {
    const i = this.members.map((r) => r.map(e, t, Ct));
    return Qe.from(i);
  }
  forChild(e, t) {
    if (t.isLeaf)
      return F.empty;
    let i = [];
    for (let r = 0; r < this.members.length; r++) {
      let s = this.members[r].forChild(e, t);
      s != se && (s instanceof Qe ? i = i.concat(s.members) : i.push(s));
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
    for (let r = 0; r < this.members.length; r++) {
      let s = this.members[r].localsInner(e);
      if (s.length)
        if (!t)
          t = s;
        else {
          i && (t = t.slice(), i = !1);
          for (let o = 0; o < s.length; o++)
            t.push(s[o]);
        }
    }
    return t ? Bs(i ? t : t.sort(Mt)) : zt;
  }
  // Create a group for the given array of decoration sets, or return
  // a single set when possible.
  static from(e) {
    switch (e.length) {
      case 0:
        return se;
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
function hp(n, e, t, i, r, s, o) {
  let l = n.slice();
  for (let c = 0, d = s; c < t.maps.length; c++) {
    let u = 0;
    t.maps[c].forEach((p, h, f, m) => {
      let g = m - f - (h - p);
      for (let b = 0; b < l.length; b += 3) {
        let k = l[b + 1];
        if (k < 0 || p > k + d - u)
          continue;
        let w = l[b] + d - u;
        h >= w ? l[b + 1] = p <= w ? -2 : -1 : p >= d && g && (l[b] += g, l[b + 1] += g);
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
      let d = t.map(n[c] + s), u = d - r;
      if (u < 0 || u >= i.content.size) {
        a = !0;
        continue;
      }
      let p = t.map(n[c + 1] + s, -1), h = p - r, { index: f, offset: m } = i.content.findIndex(u), g = i.maybeChild(f);
      if (g && m == u && m + g.nodeSize == h) {
        let b = l[c + 2].mapInner(t, g, d + 1, n[c] + s + 1, o);
        b != se ? (l[c] = u, l[c + 1] = h, l[c + 2] = b) : (l[c + 1] = -2, a = !0);
      } else
        a = !0;
    }
  if (a) {
    let c = fp(l, n, e, t, r, s, o), d = mi(c, i, 0, o);
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
function rc(n, e) {
  if (!e || !n.length)
    return n;
  let t = [];
  for (let i = 0; i < n.length; i++) {
    let r = n[i];
    t.push(new re(r.from + e, r.to + e, r.type));
  }
  return t;
}
function fp(n, e, t, i, r, s, o) {
  function l(a, c) {
    for (let d = 0; d < a.local.length; d++) {
      let u = a.local[d].map(i, r, c);
      u ? t.push(u) : o.onRemove && o.onRemove(a.local[d].spec);
    }
    for (let d = 0; d < a.children.length; d += 3)
      l(a.children[d + 2], a.children[d] + c + 1);
  }
  for (let a = 0; a < n.length; a += 3)
    n[a + 1] == -1 && l(n[a + 2], e[a] + s + 1);
  return t;
}
function sc(n, e, t) {
  if (e.isLeaf)
    return null;
  let i = t + e.nodeSize, r = null;
  for (let s = 0, o; s < n.length; s++)
    (o = n[s]) && o.from > t && o.to < i && ((r || (r = [])).push(o), n[s] = null);
  return r;
}
function oc(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    n[t] != null && e.push(n[t]);
  return e;
}
function mi(n, e, t, i) {
  let r = [], s = !1;
  e.forEach((l, a) => {
    let c = sc(n, l, a + t);
    if (c) {
      s = !0;
      let d = mi(c, l, t + a + 1, i);
      d != se && r.push(a, a + l.nodeSize, d);
    }
  });
  let o = rc(s ? oc(n) : n, -t).sort(Mt);
  for (let l = 0; l < o.length; l++)
    o[l].type.valid(e, o[l]) || (i.onRemove && i.onRemove(o[l].spec), o.splice(l--, 1));
  return o.length || r.length ? new F(o, r) : se;
}
function Mt(n, e) {
  return n.from - e.from || n.to - e.to;
}
function Bs(n) {
  let e = n;
  for (let t = 0; t < e.length - 1; t++) {
    let i = e[t];
    if (i.from != i.to)
      for (let r = t + 1; r < e.length; r++) {
        let s = e[r];
        if (s.from == i.from) {
          s.to != i.to && (e == n && (e = n.slice()), e[r] = s.copy(s.from, i.to), Go(e, r + 1, s.copy(i.to, s.to)));
          continue;
        } else {
          s.from < i.to && (e == n && (e = n.slice()), e[t] = i.copy(i.from, s.from), Go(e, r, i.copy(s.from, i.to)));
          break;
        }
      }
  }
  return e;
}
function Go(n, e, t) {
  for (; e < n.length && Mt(t, n[e]) > 0; )
    e++;
  n.splice(e, 0, t);
}
function Sr(n) {
  let e = [];
  return n.someProp("decorations", (t) => {
    let i = t(n.state);
    i && i != se && e.push(i);
  }), n.cursorWrapper && e.push(F.create(n.state.doc, [n.cursorWrapper.deco])), Qe.from(e);
}
const mp = {
  childList: !0,
  characterData: !0,
  characterDataOldValue: !0,
  attributes: !0,
  attributeOldValue: !0,
  subtree: !0
}, gp = he && ot <= 11;
class bp {
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
class yp {
  constructor(e, t) {
    this.view = e, this.handleDOMChange = t, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new bp(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((i) => {
      for (let r = 0; r < i.length; r++)
        this.queue.push(i[r]);
      he && ot <= 11 && i.some((r) => r.type == "childList" && r.removedNodes.length || r.type == "characterData" && r.oldValue.length > r.target.nodeValue.length) ? this.flushSoon() : oe && e.composing && i.some((r) => r.type == "childList" && r.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
    }), gp && (this.onCharData = (i) => {
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
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, mp)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
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
    if (Fo(this.view)) {
      if (this.suppressingSelectionUpdates)
        return je(this.view);
      if (he && ot <= 11 && !this.view.state.selection.empty) {
        let e = this.view.domSelectionRange();
        if (e.focusNode && Nt(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset))
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
    for (let s = e.focusNode; s; s = jt(s))
      t.add(s);
    for (let s = e.anchorNode; s; s = jt(s))
      if (t.has(s)) {
        i = s;
        break;
      }
    let r = i && this.view.docView.nearestDesc(i);
    if (r && r.ignoreMutation({
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
    let i = e.domSelectionRange(), r = !this.suppressingSelectionUpdates && !this.currentSelection.eq(i) && Fo(e) && !this.ignoreSelectionChange(i), s = -1, o = -1, l = !1, a = [];
    if (e.editable)
      for (let d = 0; d < t.length; d++) {
        let u = this.registerMutation(t[d], a);
        u && (s = s < 0 ? u.from : Math.min(u.from, s), o = o < 0 ? u.to : Math.max(u.to, o), u.typeOver && (l = !0));
      }
    if (a.some((d) => d.nodeName == "BR") && (e.input.lastKeyCode == 8 || e.input.lastKeyCode == 46)) {
      for (let d of a)
        if (d.nodeName == "BR" && d.parentNode) {
          let u = d.nextSibling;
          u && u.nodeType == 1 && u.contentEditable == "false" && d.parentNode.removeChild(d);
        }
    } else if (Se && a.length) {
      let d = a.filter((u) => u.nodeName == "BR");
      if (d.length == 2) {
        let [u, p] = d;
        u.parentNode && u.parentNode.parentNode == p.parentNode ? p.remove() : u.remove();
      } else {
        let { focusNode: u } = this.currentSelection;
        for (let p of d) {
          let h = p.parentNode;
          h && h.nodeName == "LI" && (!u || vp(e, u) != h) && p.remove();
        }
      }
    }
    let c = null;
    s < 0 && r && e.input.lastFocus > Date.now() - 200 && Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 && Xi(i) && (c = _s(e)) && c.eq(_.near(e.state.doc.resolve(0), 1)) ? (e.input.lastFocus = 0, je(e), this.currentSelection.set(i), e.scrollToSelection()) : (s > -1 || r) && (s > -1 && (e.docView.markDirty(s, o), kp(e)), e.input.badSafariComposition && (e.input.badSafariComposition = !1, Sp(e, a)), this.handleDOMChange(s, o, l, a), e.docView && e.docView.dirty ? e.updateState(e.state) : this.currentSelection.eq(i) || je(e), this.currentSelection.set(i));
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
      let r = e.previousSibling, s = e.nextSibling;
      if (he && ot <= 11 && e.addedNodes.length)
        for (let d = 0; d < e.addedNodes.length; d++) {
          let { previousSibling: u, nextSibling: p } = e.addedNodes[d];
          (!u || Array.prototype.indexOf.call(e.addedNodes, u) < 0) && (r = u), (!p || Array.prototype.indexOf.call(e.addedNodes, p) < 0) && (s = p);
        }
      let o = r && r.parentNode == e.target ? te(r) + 1 : 0, l = i.localPosFromDOM(e.target, o, -1), a = s && s.parentNode == e.target ? te(s) : e.target.childNodes.length, c = i.localPosFromDOM(e.target, a, 1);
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
let Yo = /* @__PURE__ */ new WeakMap(), Xo = !1;
function kp(n) {
  if (!Yo.has(n) && (Yo.set(n, null), ["normal", "nowrap", "pre-line"].indexOf(getComputedStyle(n.dom).whiteSpace) !== -1)) {
    if (n.requiresGeckoHackNode = Se, Xo)
      return;
    console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), Xo = !0;
  }
}
function Qo(n, e) {
  let t = e.startContainer, i = e.startOffset, r = e.endContainer, s = e.endOffset, o = n.domAtPos(n.state.selection.anchor);
  return Nt(o.node, o.offset, r, s) && ([t, i, r, s] = [r, s, t, i]), { anchorNode: t, anchorOffset: i, focusNode: r, focusOffset: s };
}
function wp(n, e) {
  if (e.getComposedRanges) {
    let r = e.getComposedRanges(n.root)[0];
    if (r)
      return Qo(n, r);
  }
  let t;
  function i(r) {
    r.preventDefault(), r.stopImmediatePropagation(), t = r.getTargetRanges()[0];
  }
  return n.dom.addEventListener("beforeinput", i, !0), document.execCommand("indent"), n.dom.removeEventListener("beforeinput", i, !0), t ? Qo(n, t) : null;
}
function vp(n, e) {
  for (let t = e.parentNode; t && t != n.dom; t = t.parentNode) {
    let i = n.docView.nearestDesc(t, !0);
    if (i && i.node.isBlock)
      return t;
  }
  return null;
}
function Sp(n, e) {
  var t;
  let { focusNode: i, focusOffset: r } = n.domSelectionRange();
  for (let s of e)
    if (((t = s.parentNode) === null || t === void 0 ? void 0 : t.nodeName) == "TR") {
      let o = s.nextSibling;
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
        l.insertBefore(s, l.firstChild), i == s && n.domSelection().collapse(s, r);
      } else
        s.parentNode.removeChild(s);
    }
}
function xp(n, e, t) {
  let { node: i, fromOffset: r, toOffset: s, from: o, to: l } = n.docView.parseRange(e, t), a = n.domSelectionRange(), c, d = a.anchorNode;
  if (d && n.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (c = [{ node: d, offset: a.anchorOffset }], Xi(a) || c.push({ node: a.focusNode, offset: a.focusOffset })), ie && n.input.lastKeyCode === 8)
    for (let g = s; g > r; g--) {
      let b = i.childNodes[g - 1], k = b.pmViewDesc;
      if (b.nodeName == "BR" && !k) {
        s = g;
        break;
      }
      if (!k || k.size)
        break;
    }
  let u = n.state.doc, p = n.someProp("domParser") || st.fromSchema(n.state.schema), h = u.resolve(o), f = null, m = p.parse(i, {
    topNode: h.parent,
    topMatch: h.parent.contentMatchAt(h.index()),
    topOpen: !0,
    from: r,
    to: s,
    preserveWhitespace: h.parent.type.whitespace == "pre" ? "full" : !0,
    findPositions: c,
    ruleFromNode: Cp,
    context: h
  });
  if (c && c[0].pos != null) {
    let g = c[0].pos, b = c[1] && c[1].pos;
    b == null && (b = g), f = { anchor: g + o, head: b + o };
  }
  return { doc: m, sel: f, from: o, to: l };
}
function Cp(n) {
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
const Mp = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function Ep(n, e, t, i, r) {
  let s = n.input.compositionPendingChanges || (n.composing ? n.input.compositionID : 0);
  if (n.input.compositionPendingChanges = 0, e < 0) {
    let C = n.input.lastSelectionTime > Date.now() - 50 ? n.input.lastSelectionOrigin : null, A = _s(n, C);
    if (A && !n.state.selection.eq(A)) {
      if (ie && We && n.input.lastKeyCode === 13 && Date.now() - 100 < n.input.lastKeyCodeTime && n.someProp("handleKeyDown", (Ce) => Ce(n, gt(13, "Enter"))))
        return;
      let I = n.state.tr.setSelection(A);
      C == "pointer" ? I.setMeta("pointer", !0) : C == "key" && I.scrollIntoView(), s && I.setMeta("composition", s), n.dispatch(I);
    }
    return;
  }
  let o = n.state.doc.resolve(e), l = o.sharedDepth(t);
  e = o.before(l + 1), t = n.state.doc.resolve(t).after(l + 1);
  let a = n.state.selection, c = xp(n, e, t), d = n.state.doc, u = d.slice(c.from, c.to), p, h;
  n.input.lastKeyCode === 8 && Date.now() - 100 < n.input.lastKeyCodeTime ? (p = n.state.selection.to, h = "end") : (p = n.state.selection.from, h = "start"), n.input.lastKeyCode = null;
  let f = Np(u.content, c.doc.content, c.from, p, h);
  if (f && n.input.domChangeCount++, (Kt && n.input.lastIOSEnter > Date.now() - 225 || We) && r.some((C) => C.nodeType == 1 && !Mp.test(C.nodeName)) && (!f || f.endA >= f.endB) && n.someProp("handleKeyDown", (C) => C(n, gt(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (!f)
    if (i && a instanceof N && !a.empty && a.$head.sameParent(a.$anchor) && !n.composing && !(c.sel && c.sel.anchor != c.sel.head))
      f = { start: a.from, endA: a.to, endB: a.to };
    else {
      if (c.sel) {
        let C = Zo(n, n.state.doc, c.sel);
        if (C && !C.eq(n.state.selection)) {
          let A = n.state.tr.setSelection(C);
          s && A.setMeta("composition", s), n.dispatch(A);
        }
      }
      return;
    }
  n.state.selection.from < n.state.selection.to && f.start == f.endB && n.state.selection instanceof N && (f.start > n.state.selection.from && f.start <= n.state.selection.from + 2 && n.state.selection.from >= c.from ? f.start = n.state.selection.from : f.endA < n.state.selection.to && f.endA >= n.state.selection.to - 2 && n.state.selection.to <= c.to && (f.endB += n.state.selection.to - f.endA, f.endA = n.state.selection.to)), he && ot <= 11 && f.endB == f.start + 1 && f.endA == f.start && f.start > c.from && c.doc.textBetween(f.start - c.from - 1, f.start - c.from + 1) == "  " && (f.start--, f.endA--, f.endB--);
  let m = c.doc.resolveNoCache(f.start - c.from), g = c.doc.resolveNoCache(f.endB - c.from), b = d.resolve(f.start), k = m.sameParent(g) && m.parent.inlineContent && b.end() >= f.endA;
  if ((Kt && n.input.lastIOSEnter > Date.now() - 225 && (!k || r.some((C) => C.nodeName == "DIV" || C.nodeName == "P")) || !k && m.pos < c.doc.content.size && (!m.sameParent(g) || !m.parent.inlineContent) && m.pos < g.pos && !/\S/.test(c.doc.textBetween(m.pos, g.pos, "", ""))) && n.someProp("handleKeyDown", (C) => C(n, gt(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (n.state.selection.anchor > f.start && Tp(d, f.start, f.endA, m, g) && n.someProp("handleKeyDown", (C) => C(n, gt(8, "Backspace")))) {
    We && ie && n.domObserver.suppressSelectionUpdates();
    return;
  }
  ie && f.endB == f.start && (n.input.lastChromeDelete = Date.now()), We && !k && m.start() != g.start() && g.parentOffset == 0 && m.depth == g.depth && c.sel && c.sel.anchor == c.sel.head && c.sel.head == f.endA && (f.endB -= 2, g = c.doc.resolveNoCache(f.endB - c.from), setTimeout(() => {
    n.someProp("handleKeyDown", function(C) {
      return C(n, gt(13, "Enter"));
    });
  }, 20));
  let w = f.start, M = f.endA, S = (C) => {
    let A = C || n.state.tr.replace(w, M, c.doc.slice(f.start - c.from, f.endB - c.from));
    if (c.sel) {
      let I = Zo(n, A.doc, c.sel);
      I && !(ie && n.composing && I.empty && (f.start != f.endB || n.input.lastChromeDelete < Date.now() - 100) && (I.head == w || I.head == A.mapping.map(M) - 1) || he && I.empty && I.head == w) && A.setSelection(I);
    }
    return s && A.setMeta("composition", s), A.scrollIntoView();
  }, O;
  if (k)
    if (m.pos == g.pos) {
      he && ot <= 11 && m.parentOffset == 0 && (n.domObserver.suppressSelectionUpdates(), setTimeout(() => je(n), 20));
      let C = S(n.state.tr.delete(w, M)), A = d.resolve(f.start).marksAcross(d.resolve(f.endA));
      A && C.ensureMarks(A), n.dispatch(C);
    } else if (
      // Adding or removing a mark
      f.endA == f.endB && (O = Ap(m.parent.content.cut(m.parentOffset, g.parentOffset), b.parent.content.cut(b.parentOffset, f.endA - b.start())))
    ) {
      let C = S(n.state.tr);
      O.type == "add" ? C.addMark(w, M, O.mark) : C.removeMark(w, M, O.mark), n.dispatch(C);
    } else if (m.parent.child(m.index()).isText && m.index() == g.index() - (g.textOffset ? 0 : 1)) {
      let C = m.parent.textBetween(m.parentOffset, g.parentOffset), A = () => S(n.state.tr.insertText(C, w, M));
      n.someProp("handleTextInput", (I) => I(n, w, M, C, A)) || n.dispatch(A());
    } else
      n.dispatch(S());
  else
    n.dispatch(S());
}
function Zo(n, e, t) {
  return Math.max(t.anchor, t.head) > e.content.size ? null : Os(n, e.resolve(t.anchor), e.resolve(t.head));
}
function Ap(n, e) {
  let t = n.firstChild.marks, i = e.firstChild.marks, r = t, s = i, o, l, a;
  for (let d = 0; d < i.length; d++)
    r = i[d].removeFromSet(r);
  for (let d = 0; d < t.length; d++)
    s = t[d].removeFromSet(s);
  if (r.length == 1 && s.length == 0)
    l = r[0], o = "add", a = (d) => d.mark(l.addToSet(d.marks));
  else if (r.length == 0 && s.length == 1)
    l = s[0], o = "remove", a = (d) => d.mark(l.removeFromSet(d.marks));
  else
    return null;
  let c = [];
  for (let d = 0; d < e.childCount; d++)
    c.push(a(e.child(d)));
  if (y.from(c).eq(n))
    return { mark: l, type: o };
}
function Tp(n, e, t, i, r) {
  if (
    // The content must have shrunk
    t - e <= r.pos - i.pos || // newEnd must point directly at or after the end of the block that newStart points into
    xr(i, !0, !1) < r.pos
  )
    return !1;
  let s = n.resolve(e);
  if (!i.parent.isTextblock) {
    let l = s.nodeAfter;
    return l != null && t == e + l.nodeSize;
  }
  if (s.parentOffset < s.parent.content.size || !s.parent.isTextblock)
    return !1;
  let o = n.resolve(xr(s, !0, !0));
  return !o.parent.isTextblock || o.pos > t || xr(o, !0, !1) < t ? !1 : i.parent.content.cut(i.parentOffset).eq(o.parent.content);
}
function xr(n, e, t) {
  let i = n.depth, r = e ? n.end() : n.pos;
  for (; i > 0 && (e || n.indexAfter(i) == n.node(i).childCount); )
    i--, r++, e = !1;
  if (t) {
    let s = n.node(i).maybeChild(n.indexAfter(i));
    for (; s && !s.isLeaf; )
      s = s.firstChild, r++;
  }
  return r;
}
function Np(n, e, t, i, r) {
  let s = n.findDiffStart(e, t);
  if (s == null)
    return null;
  let { a: o, b: l } = n.findDiffEnd(e, t + n.size, t + e.size);
  if (r == "end") {
    let a = Math.max(0, s - Math.min(o, l));
    i -= o + a - s;
  }
  if (o < s && n.size < e.size) {
    let a = i <= s && i >= o ? s - i : 0;
    s -= a, s && s < e.size && el(e.textBetween(s - 1, s + 1)) && (s += a ? 1 : -1), l = s + (l - o), o = s;
  } else if (l < s) {
    let a = i <= s && i >= l ? s - i : 0;
    s -= a, s && s < n.size && el(n.textBetween(s - 1, s + 1)) && (s += a ? 1 : -1), o = s + (o - l), l = s;
  }
  return { start: s, endA: o, endB: l };
}
function el(n) {
  if (n.length != 2)
    return !1;
  let e = n.charCodeAt(0), t = n.charCodeAt(1);
  return e >= 56320 && e <= 57343 && t >= 55296 && t <= 56319;
}
class lc {
  /**
  Create a view. `place` may be a DOM node that the editor should
  be appended to, a function that will place it into the document,
  or an object whose `mount` property holds the node to use as the
  document container. If it is `null`, the editor will not be
  added to the document.
  */
  constructor(e, t) {
    this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new Uu(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = t, this.state = t.state, this.directPlugins = t.plugins || [], this.directPlugins.forEach(sl), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = il(this), nl(this), this.nodeViews = rl(this), this.docView = Do(this.state.doc, tl(this), Sr(this), this.dom, this), this.domObserver = new yp(this, (i, r, s, o) => Ep(this, i, r, s, o)), this.domObserver.start(), ju(this), this.updatePluginViews();
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
    e.handleDOMEvents != this._props.handleDOMEvents && ns(this);
    let t = this._props;
    this._props = e, e.plugins && (e.plugins.forEach(sl), this.directPlugins = e.plugins), this.updateStateInner(e.state, t);
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
    let r = this.state, s = !1, o = !1;
    e.storedMarks && this.composing && (ec(this), o = !0), this.state = e;
    let l = r.plugins != e.plugins || this._props.plugins != t.plugins;
    if (l || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
      let h = rl(this);
      Op(h, this.nodeViews) && (this.nodeViews = h, s = !0);
    }
    (l || t.handleDOMEvents != this._props.handleDOMEvents) && ns(this), this.editable = il(this), nl(this);
    let a = Sr(this), c = tl(this), d = r.plugins != e.plugins && !r.doc.eq(e.doc) ? "reset" : e.scrollToSelection > r.scrollToSelection ? "to selection" : "preserve", u = s || !this.docView.matchesNode(e.doc, c, a);
    (u || !e.selection.eq(r.selection)) && (o = !0);
    let p = d == "preserve" && o && this.dom.style.overflowAnchor == null && ou(this);
    if (o) {
      this.domObserver.stop();
      let h = u && (he || ie) && !this.composing && !r.selection.empty && !e.selection.empty && _p(r.selection, e.selection);
      if (u) {
        let f = ie ? this.trackWrites = this.domSelectionRange().focusNode : null;
        this.composing && (this.input.compositionNode = op(this)), (s || !this.docView.update(e.doc, c, a, this)) && (this.docView.updateOuterDeco(c), this.docView.destroy(), this.docView = Do(e.doc, c, a, this.dom, this)), f && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (h = !0);
      }
      h || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && _u(this)) ? je(this, h) : (qa(this, e.selection), this.domObserver.setCurSelection()), this.domObserver.start();
    }
    this.updatePluginViews(r), !((i = this.dragging) === null || i === void 0) && i.node && !r.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, r), d == "reset" ? this.dom.scrollTop = 0 : d == "to selection" ? this.scrollToSelection() : p && lu(p);
  }
  /**
  @internal
  */
  scrollToSelection() {
    let e = this.domSelectionRange().focusNode;
    if (!(!e || !this.dom.contains(e.nodeType == 1 ? e : e.parentNode))) {
      if (!this.someProp("handleScrollToSelection", (t) => t(this))) if (this.state.selection instanceof T) {
        let t = this.docView.domAfterPos(this.state.selection.from);
        t.nodeType == 1 && No(this, t.getBoundingClientRect(), e);
      } else
        No(this, this.coordsAtPos(this.state.selection.head, 1), e);
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
    let i = e.node, r = -1;
    if (this.state.doc.nodeAt(i.from) == i.node)
      r = i.from;
    else {
      let s = i.from + (this.state.doc.content.size - t.doc.content.size);
      (s > 0 && this.state.doc.nodeAt(s)) == i.node && (r = s);
    }
    this.dragging = new nc(e.slice, e.move, r < 0 ? void 0 : T.create(this.state.doc, r));
  }
  someProp(e, t) {
    let i = this._props && this._props[e], r;
    if (i != null && (r = t ? t(i) : i))
      return r;
    for (let o = 0; o < this.directPlugins.length; o++) {
      let l = this.directPlugins[o].props[e];
      if (l != null && (r = t ? t(l) : l))
        return r;
    }
    let s = this.state.plugins;
    if (s)
      for (let o = 0; o < s.length; o++) {
        let l = s[o].props[e];
        if (l != null && (r = t ? t(l) : l))
          return r;
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
    this.domObserver.stop(), this.editable && au(this.dom), je(this), this.domObserver.start();
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
    return hu(this, e);
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
    return Ia(this, e, t);
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
    let r = this.docView.posFromDOM(e, t, i);
    if (r == null)
      throw new RangeError("DOM position not inside the editor");
    return r;
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
    return yu(this, t || this.state, e);
  }
  /**
  Run the editor's paste logic with the given HTML string. The
  `event`, if given, will be passed to the
  [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
  */
  pasteHTML(e, t) {
    return xn(this, "", e, !1, t || new ClipboardEvent("paste"));
  }
  /**
  Run the editor's paste logic with the given plain-text input.
  */
  pasteText(e, t) {
    return xn(this, e, null, !0, t || new ClipboardEvent("paste"));
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
    return Ls(this, e);
  }
  /**
  Removes the editor from the DOM and destroys all [node
  views](https://prosemirror.net/docs/ref/#view.NodeView).
  */
  destroy() {
    this.docView && (Ku(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], Sr(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, Yd());
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
    return Gu(this, e);
  }
  /**
  @internal
  */
  domSelectionRange() {
    let e = this.domSelection();
    return e ? oe && this.root.nodeType === 11 && tu(this.dom.ownerDocument) == this.dom && wp(this, e) || e : { focusNode: null, focusOffset: 0, anchorNode: null, anchorOffset: 0 };
  }
  /**
  @internal
  */
  domSelection() {
    return this.root.getSelection();
  }
}
lc.prototype.dispatch = function(n) {
  let e = this._props.dispatchTransaction;
  e ? e.call(this, n) : this.updateState(this.state.apply(n));
};
function tl(n) {
  let e = /* @__PURE__ */ Object.create(null);
  return e.class = "ProseMirror", e.contenteditable = String(n.editable), n.someProp("attributes", (t) => {
    if (typeof t == "function" && (t = t(n.state)), t)
      for (let i in t)
        i == "class" ? e.class += " " + t[i] : i == "style" ? e.style = (e.style ? e.style + ";" : "") + t[i] : !e[i] && i != "contenteditable" && i != "nodeName" && (e[i] = String(t[i]));
  }), e.translate || (e.translate = "no"), [re.node(0, n.state.doc.content.size, e)];
}
function nl(n) {
  if (n.markCursor) {
    let e = document.createElement("img");
    e.className = "ProseMirror-separator", e.setAttribute("mark-placeholder", "true"), e.setAttribute("alt", ""), n.cursorWrapper = { dom: e, deco: re.widget(n.state.selection.from, e, { raw: !0, marks: n.markCursor }) };
  } else
    n.cursorWrapper = null;
}
function il(n) {
  return !n.someProp("editable", (e) => e(n.state) === !1);
}
function _p(n, e) {
  let t = Math.min(n.$anchor.sharedDepth(n.head), e.$anchor.sharedDepth(e.head));
  return n.$anchor.start(t) != e.$anchor.start(t);
}
function rl(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    for (let r in i)
      Object.prototype.hasOwnProperty.call(e, r) || (e[r] = i[r]);
  }
  return n.someProp("nodeViews", t), n.someProp("markViews", t), e;
}
function Op(n, e) {
  let t = 0, i = 0;
  for (let r in n) {
    if (n[r] != e[r])
      return !0;
    t++;
  }
  for (let r in e)
    i++;
  return t != i;
}
function sl(n) {
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
}, gi = {
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
}, Lp = typeof navigator < "u" && /Mac/.test(navigator.platform), Rp = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var ne = 0; ne < 10; ne++) ct[48 + ne] = ct[96 + ne] = String(ne);
for (var ne = 1; ne <= 24; ne++) ct[ne + 111] = "F" + ne;
for (var ne = 65; ne <= 90; ne++)
  ct[ne] = String.fromCharCode(ne + 32), gi[ne] = String.fromCharCode(ne);
for (var Cr in ct) gi.hasOwnProperty(Cr) || (gi[Cr] = ct[Cr]);
function Ip(n) {
  var e = Lp && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || Rp && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? gi : ct)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
const Dp = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), Pp = typeof navigator < "u" && /Win/.test(navigator.platform);
function Bp(n) {
  let e = n.split(/-(?!$)/), t = e[e.length - 1];
  t == "Space" && (t = " ");
  let i, r, s, o;
  for (let l = 0; l < e.length - 1; l++) {
    let a = e[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      r = !0;
    else if (/^s(hift)?$/i.test(a))
      s = !0;
    else if (/^mod$/i.test(a))
      Dp ? o = !0 : r = !0;
    else
      throw new Error("Unrecognized modifier name: " + a);
  }
  return i && (t = "Alt-" + t), r && (t = "Ctrl-" + t), o && (t = "Meta-" + t), s && (t = "Shift-" + t), t;
}
function Hp(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n)
    e[Bp(t)] = n[t];
  return e;
}
function Mr(n, e, t = !0) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t && e.shiftKey && (n = "Shift-" + n), n;
}
function zp(n) {
  return new U({ props: { handleKeyDown: Hs(n) } });
}
function Hs(n) {
  let e = Hp(n);
  return function(t, i) {
    let r = Ip(i), s, o = e[Mr(r, i)];
    if (o && o(t.state, t.dispatch, t))
      return !0;
    if (r.length == 1 && r != " ") {
      if (i.shiftKey) {
        let l = e[Mr(r, i, !1)];
        if (l && l(t.state, t.dispatch, t))
          return !0;
      }
      if ((i.altKey || i.metaKey || i.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(Pp && i.ctrlKey && i.altKey) && (s = ct[i.keyCode]) && s != r) {
        let l = e[Mr(s, i)];
        if (l && l(t.state, t.dispatch, t))
          return !0;
      }
    }
    return !1;
  };
}
const zs = (n, e) => n.selection.empty ? !1 : (e && e(n.tr.deleteSelection().scrollIntoView()), !0);
function ac(n, e) {
  let { $cursor: t } = n.selection;
  return !t || (e ? !e.endOfTextblock("backward", n) : t.parentOffset > 0) ? null : t;
}
const cc = (n, e, t) => {
  let i = ac(n, t);
  if (!i)
    return !1;
  let r = $s(i);
  if (!r) {
    let o = i.blockRange(), l = o && Gt(o);
    return l == null ? !1 : (e && e(n.tr.lift(o, l).scrollIntoView()), !0);
  }
  let s = r.nodeBefore;
  if (yc(n, r, e, -1))
    return !0;
  if (i.parent.content.size == 0 && (Jt(s, "end") || T.isSelectable(s)))
    for (let o = i.depth; ; o--) {
      let l = Gi(n.doc, i.before(o), i.after(o), x.empty);
      if (l && l.slice.size < l.to - l.from) {
        if (e) {
          let a = n.tr.step(l);
          a.setSelection(Jt(s, "end") ? _.findFrom(a.doc.resolve(a.mapping.map(r.pos, -1)), -1) : T.create(a.doc, r.pos - s.nodeSize)), e(a.scrollIntoView());
        }
        return !0;
      }
      if (o == 1 || i.node(o - 1).childCount > 1)
        break;
    }
  return s.isAtom && r.depth == i.depth - 1 ? (e && e(n.tr.delete(r.pos - s.nodeSize, r.pos).scrollIntoView()), !0) : !1;
}, $p = (n, e, t) => {
  let i = ac(n, t);
  if (!i)
    return !1;
  let r = $s(i);
  return r ? dc(n, r, e) : !1;
}, Fp = (n, e, t) => {
  let i = pc(n, t);
  if (!i)
    return !1;
  let r = Fs(i);
  return r ? dc(n, r, e) : !1;
};
function dc(n, e, t) {
  let i = e.nodeBefore, r = i, s = e.pos - 1;
  for (; !r.isTextblock; s--) {
    if (r.type.spec.isolating)
      return !1;
    let d = r.lastChild;
    if (!d)
      return !1;
    r = d;
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
  let c = Gi(n.doc, s, a, x.empty);
  if (!c || c.from != s || c instanceof G && c.slice.size >= a - s)
    return !1;
  if (t) {
    let d = n.tr.step(c);
    d.setSelection(N.create(d.doc, s)), t(d.scrollIntoView());
  }
  return !0;
}
function Jt(n, e, t = !1) {
  for (let i = n; i; i = e == "start" ? i.firstChild : i.lastChild) {
    if (i.isTextblock)
      return !0;
    if (t && i.childCount != 1)
      return !1;
  }
  return !1;
}
const uc = (n, e, t) => {
  let { $head: i, empty: r } = n.selection, s = i;
  if (!r)
    return !1;
  if (i.parent.isTextblock) {
    if (t ? !t.endOfTextblock("backward", n) : i.parentOffset > 0)
      return !1;
    s = $s(i);
  }
  let o = s && s.nodeBefore;
  return !o || !T.isSelectable(o) ? !1 : (e && e(n.tr.setSelection(T.create(n.doc, s.pos - o.nodeSize)).scrollIntoView()), !0);
};
function $s(n) {
  if (!n.parent.type.spec.isolating)
    for (let e = n.depth - 1; e >= 0; e--) {
      if (n.index(e) > 0)
        return n.doc.resolve(n.before(e + 1));
      if (n.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function pc(n, e) {
  let { $cursor: t } = n.selection;
  return !t || (e ? !e.endOfTextblock("forward", n) : t.parentOffset < t.parent.content.size) ? null : t;
}
const hc = (n, e, t) => {
  let i = pc(n, t);
  if (!i)
    return !1;
  let r = Fs(i);
  if (!r)
    return !1;
  let s = r.nodeAfter;
  if (yc(n, r, e, 1))
    return !0;
  if (i.parent.content.size == 0 && (Jt(s, "start") || T.isSelectable(s))) {
    let o = Gi(n.doc, i.before(), i.after(), x.empty);
    if (o && o.slice.size < o.to - o.from) {
      if (e) {
        let l = n.tr.step(o);
        l.setSelection(Jt(s, "start") ? _.findFrom(l.doc.resolve(l.mapping.map(r.pos)), 1) : T.create(l.doc, l.mapping.map(r.pos))), e(l.scrollIntoView());
      }
      return !0;
    }
  }
  return s.isAtom && r.depth == i.depth - 1 ? (e && e(n.tr.delete(r.pos, r.pos + s.nodeSize).scrollIntoView()), !0) : !1;
}, fc = (n, e, t) => {
  let { $head: i, empty: r } = n.selection, s = i;
  if (!r)
    return !1;
  if (i.parent.isTextblock) {
    if (t ? !t.endOfTextblock("forward", n) : i.parentOffset < i.parent.content.size)
      return !1;
    s = Fs(i);
  }
  let o = s && s.nodeAfter;
  return !o || !T.isSelectable(o) ? !1 : (e && e(n.tr.setSelection(T.create(n.doc, s.pos)).scrollIntoView()), !0);
};
function Fs(n) {
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
const qp = (n, e) => {
  let t = n.selection, i = t instanceof T, r;
  if (i) {
    if (t.node.isTextblock || !ut(n.doc, t.from))
      return !1;
    r = t.from;
  } else if (r = Ji(n.doc, t.from, -1), r == null)
    return !1;
  if (e) {
    let s = n.tr.join(r);
    i && s.setSelection(T.create(s.doc, r - n.doc.resolve(r).nodeBefore.nodeSize)), e(s.scrollIntoView());
  }
  return !0;
}, Vp = (n, e) => {
  let t = n.selection, i;
  if (t instanceof T) {
    if (t.node.isTextblock || !ut(n.doc, t.to))
      return !1;
    i = t.to;
  } else if (i = Ji(n.doc, t.to, 1), i == null)
    return !1;
  return e && e(n.tr.join(i).scrollIntoView()), !0;
}, Wp = (n, e) => {
  let { $from: t, $to: i } = n.selection, r = t.blockRange(i), s = r && Gt(r);
  return s == null ? !1 : (e && e(n.tr.lift(r, s).scrollIntoView()), !0);
}, mc = (n, e) => {
  let { $head: t, $anchor: i } = n.selection;
  return !t.parent.type.spec.code || !t.sameParent(i) ? !1 : (e && e(n.tr.insertText(`
`).scrollIntoView()), !0);
};
function qs(n) {
  for (let e = 0; e < n.edgeCount; e++) {
    let { type: t } = n.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
const Up = (n, e) => {
  let { $head: t, $anchor: i } = n.selection;
  if (!t.parent.type.spec.code || !t.sameParent(i))
    return !1;
  let r = t.node(-1), s = t.indexAfter(-1), o = qs(r.contentMatchAt(s));
  if (!o || !r.canReplaceWith(s, s, o))
    return !1;
  if (e) {
    let l = t.after(), a = n.tr.replaceWith(l, l, o.createAndFill());
    a.setSelection(_.near(a.doc.resolve(l), 1)), e(a.scrollIntoView());
  }
  return !0;
}, gc = (n, e) => {
  let t = n.selection, { $from: i, $to: r } = t;
  if (t instanceof be || i.parent.inlineContent || r.parent.inlineContent)
    return !1;
  let s = qs(r.parent.contentMatchAt(r.indexAfter()));
  if (!s || !s.isTextblock)
    return !1;
  if (e) {
    let o = (!i.parentOffset && r.index() < r.parent.childCount ? i : r).pos, l = n.tr.insert(o, s.createAndFill());
    l.setSelection(N.create(l.doc, o + 1)), e(l.scrollIntoView());
  }
  return !0;
}, bc = (n, e) => {
  let { $cursor: t } = n.selection;
  if (!t || t.parent.content.size)
    return !1;
  if (t.depth > 1 && t.after() != t.end(-1)) {
    let s = t.before();
    if (Ue(n.doc, s))
      return e && e(n.tr.split(s).scrollIntoView()), !0;
  }
  let i = t.blockRange(), r = i && Gt(i);
  return r == null ? !1 : (e && e(n.tr.lift(i, r).scrollIntoView()), !0);
};
function jp(n) {
  return (e, t) => {
    let { $from: i, $to: r } = e.selection;
    if (e.selection instanceof T && e.selection.node.isBlock)
      return !i.parentOffset || !Ue(e.doc, i.pos) ? !1 : (t && t(e.tr.split(i.pos).scrollIntoView()), !0);
    if (!i.depth)
      return !1;
    let s = [], o, l, a = !1, c = !1;
    for (let h = i.depth; ; h--)
      if (i.node(h).isBlock) {
        a = i.end(h) == i.pos + (i.depth - h), c = i.start(h) == i.pos - (i.depth - h), l = qs(i.node(h - 1).contentMatchAt(i.indexAfter(h - 1))), s.unshift(a && l ? { type: l } : null), o = h;
        break;
      } else {
        if (h == 1)
          return !1;
        s.unshift(null);
      }
    let d = e.tr;
    (e.selection instanceof N || e.selection instanceof be) && d.deleteSelection();
    let u = d.mapping.map(i.pos), p = Ue(d.doc, u, s.length, s);
    if (p || (s[0] = l ? { type: l } : null, p = Ue(d.doc, u, s.length, s)), !p)
      return !1;
    if (d.split(u, s.length, s), !a && c && i.node(o).type != l) {
      let h = d.mapping.map(i.before(o)), f = d.doc.resolve(h);
      l && i.node(o - 1).canReplaceWith(f.index(), f.index() + 1, l) && d.setNodeMarkup(d.mapping.map(i.before(o)), l);
    }
    return t && t(d.scrollIntoView()), !0;
  };
}
const Kp = jp(), Jp = (n, e) => {
  let { $from: t, to: i } = n.selection, r, s = t.sharedDepth(i);
  return s == 0 ? !1 : (r = t.before(s), e && e(n.tr.setSelection(T.create(n.doc, r))), !0);
};
function Gp(n, e, t) {
  let i = e.nodeBefore, r = e.nodeAfter, s = e.index();
  return !i || !r || !i.type.compatibleContent(r.type) ? !1 : !i.content.size && e.parent.canReplace(s - 1, s) ? (t && t(n.tr.delete(e.pos - i.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(s, s + 1) || !(r.isTextblock || ut(n.doc, e.pos)) ? !1 : (t && t(n.tr.join(e.pos).scrollIntoView()), !0);
}
function yc(n, e, t, i) {
  let r = e.nodeBefore, s = e.nodeAfter, o, l, a = r.type.spec.isolating || s.type.spec.isolating;
  if (!a && Gp(n, e, t))
    return !0;
  let c = !a && e.parent.canReplace(e.index(), e.index() + 1);
  if (c && (o = (l = r.contentMatchAt(r.childCount)).findWrapping(s.type)) && l.matchType(o[0] || s.type).validEnd) {
    if (t) {
      let h = e.pos + s.nodeSize, f = y.empty;
      for (let b = o.length - 1; b >= 0; b--)
        f = y.from(o[b].create(null, f));
      f = y.from(r.copy(f));
      let m = n.tr.step(new Y(e.pos - 1, h, e.pos, h, new x(f, 1, 0), o.length, !0)), g = m.doc.resolve(h + 2 * o.length);
      g.nodeAfter && g.nodeAfter.type == r.type && ut(m.doc, g.pos) && m.join(g.pos), t(m.scrollIntoView());
    }
    return !0;
  }
  let d = s.type.spec.isolating || i > 0 && a ? null : _.findFrom(e, 1), u = d && d.$from.blockRange(d.$to), p = u && Gt(u);
  if (p != null && p >= e.depth)
    return t && t(n.tr.lift(u, p).scrollIntoView()), !0;
  if (c && Jt(s, "start", !0) && Jt(r, "end")) {
    let h = r, f = [];
    for (; f.push(h), !h.isTextblock; )
      h = h.lastChild;
    let m = s, g = 1;
    for (; !m.isTextblock; m = m.firstChild)
      g++;
    if (h.canReplace(h.childCount, h.childCount, m.content)) {
      if (t) {
        let b = y.empty;
        for (let w = f.length - 1; w >= 0; w--)
          b = y.from(f[w].copy(b));
        let k = n.tr.step(new Y(e.pos - f.length, e.pos + s.nodeSize, e.pos + g, e.pos + s.nodeSize - g, new x(b, f.length, 0), 0, !0));
        t(k.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function kc(n) {
  return function(e, t) {
    let i = e.selection, r = n < 0 ? i.$from : i.$to, s = r.depth;
    for (; r.node(s).isInline; ) {
      if (!s)
        return !1;
      s--;
    }
    return r.node(s).isTextblock ? (t && t(e.tr.setSelection(N.create(e.doc, n < 0 ? r.start(s) : r.end(s)))), !0) : !1;
  };
}
const Yp = kc(-1), Xp = kc(1);
function Qp(n, e = null) {
  return function(t, i) {
    let { $from: r, $to: s } = t.selection, o = r.blockRange(s), l = o && Es(o, n, e);
    return l ? (i && i(t.tr.wrap(o, l).scrollIntoView()), !0) : !1;
  };
}
function ol(n, e = null) {
  return function(t, i) {
    let r = !1;
    for (let s = 0; s < t.selection.ranges.length && !r; s++) {
      let { $from: { pos: o }, $to: { pos: l } } = t.selection.ranges[s];
      t.doc.nodesBetween(o, l, (a, c) => {
        if (r)
          return !1;
        if (!(!a.isTextblock || a.hasMarkup(n, e)))
          if (a.type == n)
            r = !0;
          else {
            let d = t.doc.resolve(c), u = d.index();
            r = d.parent.canReplaceWith(u, u + 1, n);
          }
      });
    }
    if (!r)
      return !1;
    if (i) {
      let s = t.tr;
      for (let o = 0; o < t.selection.ranges.length; o++) {
        let { $from: { pos: l }, $to: { pos: a } } = t.selection.ranges[o];
        s.setBlockType(l, a, n, e);
      }
      i(s.scrollIntoView());
    }
    return !0;
  };
}
function Vs(...n) {
  return function(e, t, i) {
    for (let r = 0; r < n.length; r++)
      if (n[r](e, t, i))
        return !0;
    return !1;
  };
}
Vs(zs, cc, uc);
Vs(zs, hc, fc);
Vs(mc, gc, bc, Kp);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function Zp(n, e = null) {
  return function(t, i) {
    let { $from: r, $to: s } = t.selection, o = r.blockRange(s);
    if (!o)
      return !1;
    let l = i ? t.tr : null;
    return eh(l, o, n, e) ? (i && i(l.scrollIntoView()), !0) : !1;
  };
}
function eh(n, e, t, i = null) {
  let r = !1, s = e, o = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(t) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let a = o.resolve(e.start - 2);
    s = new ci(a, a, e.depth), e.endIndex < e.parent.childCount && (e = new ci(e.$from, o.resolve(e.$to.end(e.depth)), e.depth)), r = !0;
  }
  let l = Es(s, t, i, e);
  return l ? (n && th(n, e, l, r, t), !0) : !1;
}
function th(n, e, t, i, r) {
  let s = y.empty;
  for (let d = t.length - 1; d >= 0; d--)
    s = y.from(t[d].type.create(t[d].attrs, s));
  n.step(new Y(e.start - (i ? 2 : 0), e.end, e.start, e.end, new x(s, 0, 0), t.length, !0));
  let o = 0;
  for (let d = 0; d < t.length; d++)
    t[d].type == r && (o = d + 1);
  let l = t.length - o, a = e.start + t.length - (i ? 2 : 0), c = e.parent;
  for (let d = e.startIndex, u = e.endIndex, p = !0; d < u; d++, p = !1)
    !p && Ue(n.doc, a, l) && (n.split(a, l), a += 2 * l), a += c.child(d).nodeSize;
  return n;
}
function nh(n) {
  return function(e, t) {
    let { $from: i, $to: r } = e.selection, s = i.blockRange(r, (o) => o.childCount > 0 && o.firstChild.type == n);
    return s ? t ? i.node(s.depth - 1).type == n ? ih(e, t, n, s) : rh(e, t, s) : !0 : !1;
  };
}
function ih(n, e, t, i) {
  let r = n.tr, s = i.end, o = i.$to.end(i.depth);
  s < o && (r.step(new Y(s - 1, o, s, o, new x(y.from(t.create(null, i.parent.copy())), 1, 0), 1, !0)), i = new ci(r.doc.resolve(i.$from.pos), r.doc.resolve(o), i.depth));
  const l = Gt(i);
  if (l == null)
    return !1;
  r.lift(i, l);
  let a = r.doc.resolve(r.mapping.map(s, -1) - 1);
  return ut(r.doc, a.pos) && a.nodeBefore.type == a.nodeAfter.type && r.join(a.pos), e(r.scrollIntoView()), !0;
}
function rh(n, e, t) {
  let i = n.tr, r = t.parent;
  for (let h = t.end, f = t.endIndex - 1, m = t.startIndex; f > m; f--)
    h -= r.child(f).nodeSize, i.delete(h - 1, h + 1);
  let s = i.doc.resolve(t.start), o = s.nodeAfter;
  if (i.mapping.map(t.end) != t.start + s.nodeAfter.nodeSize)
    return !1;
  let l = t.startIndex == 0, a = t.endIndex == r.childCount, c = s.node(-1), d = s.index(-1);
  if (!c.canReplace(d + (l ? 0 : 1), d + 1, o.content.append(a ? y.empty : y.from(r))))
    return !1;
  let u = s.pos, p = u + o.nodeSize;
  return i.step(new Y(u - (l ? 1 : 0), p + (a ? 1 : 0), u + 1, p - 1, new x((l ? y.empty : y.from(r.copy(y.empty))).append(a ? y.empty : y.from(r.copy(y.empty))), l ? 0 : 1, a ? 0 : 1), l ? 0 : 1)), e(i.scrollIntoView()), !0;
}
function sh(n) {
  return function(e, t) {
    let { $from: i, $to: r } = e.selection, s = i.blockRange(r, (c) => c.childCount > 0 && c.firstChild.type == n);
    if (!s)
      return !1;
    let o = s.startIndex;
    if (o == 0)
      return !1;
    let l = s.parent, a = l.child(o - 1);
    if (a.type != n)
      return !1;
    if (t) {
      let c = a.lastChild && a.lastChild.type == l.type, d = y.from(c ? n.create() : null), u = new x(y.from(n.create(null, y.from(l.type.create(null, d)))), c ? 3 : 1, 0), p = s.start, h = s.end;
      t(e.tr.step(new Y(p - (c ? 3 : 1), h, p, h, u, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function er(n) {
  const { state: e, transaction: t } = n;
  let { selection: i } = t, { doc: r } = t, { storedMarks: s } = t;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
    get storedMarks() {
      return s;
    },
    get selection() {
      return i;
    },
    get doc() {
      return r;
    },
    get tr() {
      return i = t.selection, r = t.doc, s = t.storedMarks, t;
    }
  };
}
class tr {
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
    const { rawCommands: e, editor: t, state: i } = this, { view: r } = t, { tr: s } = i, o = this.buildProps(s);
    return Object.fromEntries(Object.entries(e).map(([l, a]) => [l, (...d) => {
      const u = a(...d)(o);
      return !s.getMeta("preventDispatch") && !this.hasCustomState && r.dispatch(s), u;
    }]));
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(e, t = !0) {
    const { rawCommands: i, editor: r, state: s } = this, { view: o } = r, l = [], a = !!e, c = e || s.tr, d = () => (!a && t && !c.getMeta("preventDispatch") && !this.hasCustomState && o.dispatch(c), l.every((p) => p === !0)), u = {
      ...Object.fromEntries(Object.entries(i).map(([p, h]) => [p, (...m) => {
        const g = this.buildProps(c, t), b = h(...m)(g);
        return l.push(b), u;
      }])),
      run: d
    };
    return u;
  }
  createCan(e) {
    const { rawCommands: t, state: i } = this, r = !1, s = e || i.tr, o = this.buildProps(s, r);
    return {
      ...Object.fromEntries(Object.entries(t).map(([a, c]) => [a, (...d) => c(...d)({ ...o, dispatch: void 0 })])),
      chain: () => this.createChain(s, r)
    };
  }
  buildProps(e, t = !0) {
    const { rawCommands: i, editor: r, state: s } = this, { view: o } = r, l = {
      tr: e,
      editor: r,
      view: o,
      state: er({
        state: s,
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
class oh {
  constructor() {
    this.callbacks = {};
  }
  on(e, t) {
    return this.callbacks[e] || (this.callbacks[e] = []), this.callbacks[e].push(t), this;
  }
  emit(e, ...t) {
    const i = this.callbacks[e];
    return i && i.forEach((r) => r.apply(this, t)), this;
  }
  off(e, t) {
    const i = this.callbacks[e];
    return i && (t ? this.callbacks[e] = i.filter((r) => r !== t) : delete this.callbacks[e]), this;
  }
  once(e, t) {
    const i = (...r) => {
      this.off(e, i), t.apply(this, r);
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
function nr(n) {
  const e = n.filter((r) => r.type === "extension"), t = n.filter((r) => r.type === "node"), i = n.filter((r) => r.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: i
  };
}
function wc(n) {
  const e = [], { nodeExtensions: t, markExtensions: i } = nr(n), r = [...t, ...i], s = {
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
      extensions: r
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
              ...s,
              ...h
            }
          });
        });
      });
    });
  }), r.forEach((o) => {
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
        ...s,
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
    return Object.entries(t).forEach(([r, s]) => {
      if (!i[r]) {
        i[r] = s;
        return;
      }
      if (r === "class") {
        const l = s ? String(s).split(" ") : [], a = i[r] ? i[r].split(" ") : [], c = l.filter((d) => !a.includes(d));
        i[r] = [...a, ...c].join(" ");
      } else if (r === "style") {
        const l = s ? s.split(";").map((d) => d.trim()).filter(Boolean) : [], a = i[r] ? i[r].split(";").map((d) => d.trim()).filter(Boolean) : [], c = /* @__PURE__ */ new Map();
        a.forEach((d) => {
          const [u, p] = d.split(":").map((h) => h.trim());
          c.set(u, p);
        }), l.forEach((d) => {
          const [u, p] = d.split(":").map((h) => h.trim());
          c.set(u, p);
        }), i[r] = Array.from(c.entries()).map(([d, u]) => `${d}: ${u}`).join("; ");
      } else
        i[r] = s;
    }), i;
  }, {});
}
function is(n, e) {
  return e.filter((t) => t.type === n.type.name).filter((t) => t.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(n.attrs) || {} : {
    [t.name]: n.attrs[t.name]
  }).reduce((t, i) => D(t, i), {});
}
function vc(n) {
  return typeof n == "function";
}
function R(n, e = void 0, ...t) {
  return vc(n) ? e ? n.bind(e)(...t) : n(...t) : n;
}
function lh(n = {}) {
  return Object.keys(n).length === 0 && n.constructor === Object;
}
function ah(n) {
  return typeof n != "string" ? n : n.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(n) : n === "true" ? !0 : n === "false" ? !1 : n;
}
function ll(n, e) {
  return "style" in n ? n : {
    ...n,
    getAttrs: (t) => {
      const i = n.getAttrs ? n.getAttrs(t) : n.attrs;
      if (i === !1)
        return !1;
      const r = e.reduce((s, o) => {
        const l = o.attribute.parseHTML ? o.attribute.parseHTML(t) : ah(t.getAttribute(o.name));
        return l == null ? s : {
          ...s,
          [o.name]: l
        };
      }, {});
      return { ...i, ...r };
    }
  };
}
function al(n) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(n).filter(([e, t]) => e === "attrs" && lh(t) ? !1 : t != null)
  );
}
function ch(n, e) {
  var t;
  const i = wc(n), { nodeExtensions: r, markExtensions: s } = nr(n), o = (t = r.find((c) => E(c, "topNode"))) === null || t === void 0 ? void 0 : t.name, l = Object.fromEntries(r.map((c) => {
    const d = i.filter((b) => b.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: e
    }, p = n.reduce((b, k) => {
      const w = E(k, "extendNodeSchema", u);
      return {
        ...b,
        ...w ? w(c) : {}
      };
    }, {}), h = al({
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
        var k;
        return [b.name, { default: (k = b == null ? void 0 : b.attribute) === null || k === void 0 ? void 0 : k.default }];
      }))
    }), f = R(E(c, "parseHTML", u));
    f && (h.parseDOM = f.map((b) => ll(b, d)));
    const m = E(c, "renderHTML", u);
    m && (h.toDOM = (b) => m({
      node: b,
      HTMLAttributes: is(b, d)
    }));
    const g = E(c, "renderText", u);
    return g && (h.toText = g), [c.name, h];
  })), a = Object.fromEntries(s.map((c) => {
    const d = i.filter((g) => g.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: e
    }, p = n.reduce((g, b) => {
      const k = E(b, "extendMarkSchema", u);
      return {
        ...g,
        ...k ? k(c) : {}
      };
    }, {}), h = al({
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
    f && (h.parseDOM = f.map((g) => ll(g, d)));
    const m = E(c, "renderHTML", u);
    return m && (h.toDOM = (g) => m({
      mark: g,
      HTMLAttributes: is(g, d)
    })), [c.name, h];
  }));
  return new aa({
    topNode: o,
    nodes: l,
    marks: a
  });
}
function Er(n, e) {
  return e.nodes[n] || e.marks[n] || null;
}
function cl(n, e) {
  return Array.isArray(e) ? e.some((t) => (typeof t == "string" ? t : t.name) === n.name) : e;
}
function Ws(n, e) {
  const t = It.fromSchema(e).serializeFragment(n), r = document.implementation.createHTMLDocument().createElement("div");
  return r.appendChild(t), r.innerHTML;
}
const dh = (n, e = 500) => {
  let t = "";
  const i = n.parentOffset;
  return n.parent.nodesBetween(Math.max(0, i - e), i, (r, s, o, l) => {
    var a, c;
    const d = ((c = (a = r.type.spec).toText) === null || c === void 0 ? void 0 : c.call(a, {
      node: r,
      pos: s,
      parent: o,
      index: l
    })) || r.textContent || "%leaf%";
    t += r.isAtom && !r.isText ? d : d.slice(0, Math.max(0, i - s));
  }), t;
};
function Us(n) {
  return Object.prototype.toString.call(n) === "[object RegExp]";
}
class ir {
  constructor(e) {
    this.find = e.find, this.handler = e.handler;
  }
}
const uh = (n, e) => {
  if (Us(e))
    return e.exec(n);
  const t = e(n);
  if (!t)
    return null;
  const i = [t.text];
  return i.index = t.index, i.input = n, i.data = t.data, t.replaceWith && (t.text.includes(t.replaceWith) || console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".'), i.push(t.replaceWith)), i;
};
function zn(n) {
  var e;
  const { editor: t, from: i, to: r, text: s, rules: o, plugin: l } = n, { view: a } = t;
  if (a.composing)
    return !1;
  const c = a.state.doc.resolve(i);
  if (
    // check for code node
    c.parent.type.spec.code || !((e = c.nodeBefore || c.nodeAfter) === null || e === void 0) && e.marks.find((p) => p.type.spec.code)
  )
    return !1;
  let d = !1;
  const u = dh(c) + s;
  return o.forEach((p) => {
    if (d)
      return;
    const h = uh(u, p.find);
    if (!h)
      return;
    const f = a.state.tr, m = er({
      state: a.state,
      transaction: f
    }), g = {
      from: i - (h[0].length - s.length),
      to: r
    }, { commands: b, chain: k, can: w } = new tr({
      editor: t,
      state: m
    });
    p.handler({
      state: m,
      range: g,
      match: h,
      commands: b,
      chain: k,
      can: w
    }) === null || !f.steps.length || (f.setMeta(l, {
      transform: f,
      from: i,
      to: r,
      text: s
    }), a.dispatch(f), d = !0);
  }), d;
}
function ph(n) {
  const { editor: e, rules: t } = n, i = new U({
    state: {
      init() {
        return null;
      },
      apply(r, s, o) {
        const l = r.getMeta(i);
        if (l)
          return l;
        const a = r.getMeta("applyInputRules");
        return !!a && setTimeout(() => {
          let { text: d } = a;
          typeof d == "string" ? d = d : d = Ws(y.from(d), o.schema);
          const { from: u } = a, p = u + d.length;
          zn({
            editor: e,
            from: u,
            to: p,
            text: d,
            rules: t,
            plugin: i
          });
        }), r.selectionSet || r.docChanged ? null : s;
      }
    },
    props: {
      handleTextInput(r, s, o, l) {
        return zn({
          editor: e,
          from: s,
          to: o,
          text: l,
          rules: t,
          plugin: i
        });
      },
      handleDOMEvents: {
        compositionend: (r) => (setTimeout(() => {
          const { $cursor: s } = r.state.selection;
          s && zn({
            editor: e,
            from: s.pos,
            to: s.pos,
            text: "",
            rules: t,
            plugin: i
          });
        }), !1)
      },
      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(r, s) {
        if (s.key !== "Enter")
          return !1;
        const { $cursor: o } = r.state.selection;
        return o ? zn({
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
function hh(n) {
  return Object.prototype.toString.call(n).slice(8, -1);
}
function $n(n) {
  return hh(n) !== "Object" ? !1 : n.constructor === Object && Object.getPrototypeOf(n) === Object.prototype;
}
function rr(n, e) {
  const t = { ...n };
  return $n(n) && $n(e) && Object.keys(e).forEach((i) => {
    $n(e[i]) && $n(n[i]) ? t[i] = rr(n[i], e[i]) : t[i] = e[i];
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
      addOptions: () => rr(this.options, e)
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
    const { tr: i } = e.state, r = e.state.selection.$from;
    if (r.pos === r.end()) {
      const o = r.marks();
      if (!!!o.find((c) => (c == null ? void 0 : c.type.name) === t.name))
        return !1;
      const a = o.find((c) => (c == null ? void 0 : c.type.name) === t.name);
      return a && i.removeStoredMark(a), i.insertText(" ", r.pos), e.view.dispatch(i), !0;
    }
    return !1;
  }
}
function fh(n) {
  return typeof n == "number";
}
class mh {
  constructor(e) {
    this.find = e.find, this.handler = e.handler;
  }
}
const gh = (n, e, t) => {
  if (Us(e))
    return [...n.matchAll(e)];
  const i = e(n, t);
  return i ? i.map((r) => {
    const s = [r.text];
    return s.index = r.index, s.input = n, s.data = r.data, r.replaceWith && (r.text.includes(r.replaceWith) || console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".'), s.push(r.replaceWith)), s;
  }) : [];
};
function bh(n) {
  const { editor: e, state: t, from: i, to: r, rule: s, pasteEvent: o, dropEvent: l } = n, { commands: a, chain: c, can: d } = new tr({
    editor: e,
    state: t
  }), u = [];
  return t.doc.nodesBetween(i, r, (h, f) => {
    if (!h.isTextblock || h.type.spec.code)
      return;
    const m = Math.max(i, f), g = Math.min(r, f + h.content.size), b = h.textBetween(m - f, g - f, void 0, "￼");
    gh(b, s.find, o).forEach((w) => {
      if (w.index === void 0)
        return;
      const M = m + w.index + 1, S = M + w[0].length, O = {
        from: t.tr.mapping.map(M),
        to: t.tr.mapping.map(S)
      }, C = s.handler({
        state: t,
        range: O,
        match: w,
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
let Fn = null;
const yh = (n) => {
  var e;
  const t = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  return (e = t.clipboardData) === null || e === void 0 || e.setData("text/html", n), t;
};
function kh(n) {
  const { editor: e, rules: t } = n;
  let i = null, r = !1, s = !1, o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, l;
  try {
    l = typeof DragEvent < "u" ? new DragEvent("drop") : null;
  } catch {
    l = null;
  }
  const a = ({ state: d, from: u, to: p, rule: h, pasteEvt: f }) => {
    const m = d.tr, g = er({
      state: d,
      transaction: m
    });
    if (!(!bh({
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
  return t.map((d) => new U({
    // we register a global drag handler to track the current drag source element
    view(u) {
      const p = (f) => {
        var m;
        i = !((m = u.dom.parentElement) === null || m === void 0) && m.contains(f.target) ? u.dom.parentElement : null, i && (Fn = e);
      }, h = () => {
        Fn && (Fn = null);
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
          if (s = i === u.dom.parentElement, l = p, !s) {
            const h = Fn;
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
          return o = p, r = !!(f != null && f.includes("data-pm-slice")), !1;
        }
      }
    },
    appendTransaction: (u, p, h) => {
      const f = u[0], m = f.getMeta("uiEvent") === "paste" && !r, g = f.getMeta("uiEvent") === "drop" && !s, b = f.getMeta("applyPasteRules"), k = !!b;
      if (!m && !g && !k)
        return;
      if (k) {
        let { text: S } = b;
        typeof S == "string" ? S = S : S = Ws(y.from(S), h.schema);
        const { from: O } = b, C = O + S.length, A = yh(S);
        return a({
          rule: d,
          state: h,
          from: O,
          to: { b: C },
          pasteEvt: A
        });
      }
      const w = p.doc.content.findDiffStart(h.doc.content), M = p.doc.content.findDiffEnd(h.doc.content);
      if (!(!fh(w) || !M || w === M.b))
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
function wh(n) {
  const e = n.filter((t, i) => n.indexOf(t) !== i);
  return Array.from(new Set(e));
}
class qt {
  constructor(e, t) {
    this.splittableMarks = [], this.editor = t, this.extensions = qt.resolve(e), this.schema = ch(this.extensions, t), this.setupExtensions();
  }
  /**
   * Returns a flattened and sorted extension list while
   * also checking for duplicated extensions and warns the user.
   * @param extensions An array of Tiptap extensions
   * @returns An flattened and sorted array of Tiptap extensions
   */
  static resolve(e) {
    const t = qt.sort(qt.flatten(e)), i = wh(t.map((r) => r.name));
    return i.length && console.warn(`[tiptap warn]: Duplicate extension names found: [${i.map((r) => `'${r}'`).join(", ")}]. This can lead to issues.`), t;
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
      }, r = E(t, "addExtensions", i);
      return r ? [t, ...this.flatten(r())] : t;
    }).flat(10);
  }
  /**
   * Sort extensions by priority.
   * @param extensions An array of Tiptap extensions
   * @returns A sorted array of Tiptap extensions by priority
   */
  static sort(e) {
    return e.sort((i, r) => {
      const s = E(i, "priority") || 100, o = E(r, "priority") || 100;
      return s > o ? -1 : s < o ? 1 : 0;
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
        type: Er(t.name, this.schema)
      }, r = E(t, "addCommands", i);
      return r ? {
        ...e,
        ...r()
      } : e;
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor: e } = this, t = qt.sort([...this.extensions].reverse()), i = [], r = [], s = t.map((o) => {
      const l = {
        name: o.name,
        options: o.options,
        storage: o.storage,
        editor: e,
        type: Er(o.name, this.schema)
      }, a = [], c = E(o, "addKeyboardShortcuts", l);
      let d = {};
      if (o.type === "mark" && E(o, "exitable", l) && (d.ArrowRight = () => fe.handleExit({ editor: e, mark: o })), c) {
        const m = Object.fromEntries(Object.entries(c()).map(([g, b]) => [g, () => b({ editor: e })]));
        d = { ...d, ...m };
      }
      const u = zp(d);
      a.push(u);
      const p = E(o, "addInputRules", l);
      cl(o, e.options.enableInputRules) && p && i.push(...p());
      const h = E(o, "addPasteRules", l);
      cl(o, e.options.enablePasteRules) && h && r.push(...h());
      const f = E(o, "addProseMirrorPlugins", l);
      if (f) {
        const m = f();
        a.push(...m);
      }
      return a;
    }).flat();
    return [
      ph({
        editor: e,
        rules: i
      }),
      ...kh({
        editor: e,
        rules: r
      }),
      ...s
    ];
  }
  /**
   * Get all attributes from the extensions.
   * @returns An array of attributes
   */
  get attributes() {
    return wc(this.extensions);
  }
  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews() {
    const { editor: e } = this, { nodeExtensions: t } = nr(this.extensions);
    return Object.fromEntries(t.filter((i) => !!E(i, "addNodeView")).map((i) => {
      const r = this.attributes.filter((a) => a.type === i.name), s = {
        name: i.name,
        options: i.options,
        storage: i.storage,
        editor: e,
        type: Q(i.name, this.schema)
      }, o = E(i, "addNodeView", s);
      if (!o)
        return [];
      const l = (a, c, d, u, p) => {
        const h = is(a, r);
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
        type: Er(e.name, this.schema)
      };
      e.type === "mark" && (!((t = R(E(e, "keepOnSplit", i))) !== null && t !== void 0) || t) && this.splittableMarks.push(e.name);
      const r = E(e, "onBeforeCreate", i), s = E(e, "onCreate", i), o = E(e, "onUpdate", i), l = E(e, "onSelectionUpdate", i), a = E(e, "onTransaction", i), c = E(e, "onFocus", i), d = E(e, "onBlur", i), u = E(e, "onDestroy", i);
      r && this.editor.on("beforeCreate", r), s && this.editor.on("create", s), o && this.editor.on("update", o), l && this.editor.on("selectionUpdate", l), a && this.editor.on("transaction", a), c && this.editor.on("focus", c), d && this.editor.on("blur", d), u && this.editor.on("destroy", u);
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
      addOptions: () => rr(this.options, e)
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
function Sc(n, e, t) {
  const { from: i, to: r } = e, { blockSeparator: s = `

`, textSerializers: o = {} } = t || {};
  let l = "";
  return n.nodesBetween(i, r, (a, c, d, u) => {
    var p;
    a.isBlock && c > i && (l += s);
    const h = o == null ? void 0 : o[a.type.name];
    if (h)
      return d && (l += h({
        node: a,
        pos: c,
        parent: d,
        index: u,
        range: e
      })), !1;
    a.isText && (l += (p = a == null ? void 0 : a.text) === null || p === void 0 ? void 0 : p.slice(Math.max(i, c) - c, r - c));
  }), l;
}
function xc(n) {
  return Object.fromEntries(Object.entries(n.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
const vh = K.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new U({
        key: new J("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: n } = this, { state: e, schema: t } = n, { doc: i, selection: r } = e, { ranges: s } = r, o = Math.min(...s.map((d) => d.$from.pos)), l = Math.max(...s.map((d) => d.$to.pos)), a = xc(t);
            return Sc(i, { from: o, to: l }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: a
            });
          }
        }
      })
    ];
  }
}), Sh = () => ({ editor: n, view: e }) => (requestAnimationFrame(() => {
  var t;
  n.isDestroyed || (e.dom.blur(), (t = window == null ? void 0 : window.getSelection()) === null || t === void 0 || t.removeAllRanges());
}), !0), xh = (n = !1) => ({ commands: e }) => e.setContent("", n), Ch = () => ({ state: n, tr: e, dispatch: t }) => {
  const { selection: i } = e, { ranges: r } = i;
  return t && r.forEach(({ $from: s, $to: o }) => {
    n.doc.nodesBetween(s.pos, o.pos, (l, a) => {
      if (l.type.isText)
        return;
      const { doc: c, mapping: d } = e, u = c.resolve(d.map(a)), p = c.resolve(d.map(a + l.nodeSize)), h = u.blockRange(p);
      if (!h)
        return;
      const f = Gt(h);
      if (l.type.isTextblock) {
        const { defaultType: m } = u.parent.contentMatchAt(u.index());
        e.setNodeMarkup(h.start, m);
      }
      (f || f === 0) && e.lift(h, f);
    });
  }), !0;
}, Mh = (n) => (e) => n(e), Eh = () => ({ state: n, dispatch: e }) => gc(n, e), Ah = (n, e) => ({ editor: t, tr: i }) => {
  const { state: r } = t, s = r.doc.slice(n.from, n.to);
  i.deleteRange(n.from, n.to);
  const o = i.mapping.map(e);
  return i.insert(o, s.content), i.setSelection(new N(i.doc.resolve(Math.max(o - 1, 0)))), !0;
}, Th = () => ({ tr: n, dispatch: e }) => {
  const { selection: t } = n, i = t.$anchor.node();
  if (i.content.size > 0)
    return !1;
  const r = n.selection.$anchor;
  for (let s = r.depth; s > 0; s -= 1)
    if (r.node(s).type === i.type) {
      if (e) {
        const l = r.before(s), a = r.after(s);
        n.delete(l, a).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, Nh = (n) => ({ tr: e, state: t, dispatch: i }) => {
  const r = Q(n, t.schema), s = e.selection.$anchor;
  for (let o = s.depth; o > 0; o -= 1)
    if (s.node(o).type === r) {
      if (i) {
        const a = s.before(o), c = s.after(o);
        e.delete(a, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, _h = (n) => ({ tr: e, dispatch: t }) => {
  const { from: i, to: r } = n;
  return t && e.delete(i, r), !0;
}, Oh = () => ({ state: n, dispatch: e }) => zs(n, e), Lh = () => ({ commands: n }) => n.keyboardShortcut("Enter"), Rh = () => ({ state: n, dispatch: e }) => Up(n, e);
function bi(n, e, t = { strict: !0 }) {
  const i = Object.keys(e);
  return i.length ? i.every((r) => t.strict ? e[r] === n[r] : Us(e[r]) ? e[r].test(n[r]) : e[r] === n[r]) : !0;
}
function Cc(n, e, t = {}) {
  return n.find((i) => i.type === e && bi(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(t).map((r) => [r, i.attrs[r]])),
    t
  ));
}
function dl(n, e, t = {}) {
  return !!Cc(n, e, t);
}
function js(n, e, t) {
  var i;
  if (!n || !e)
    return;
  let r = n.parent.childAfter(n.parentOffset);
  if ((!r.node || !r.node.marks.some((d) => d.type === e)) && (r = n.parent.childBefore(n.parentOffset)), !r.node || !r.node.marks.some((d) => d.type === e) || (t = t || ((i = r.node.marks[0]) === null || i === void 0 ? void 0 : i.attrs), !Cc([...r.node.marks], e, t)))
    return;
  let o = r.index, l = n.start() + r.offset, a = o + 1, c = l + r.node.nodeSize;
  for (; o > 0 && dl([...n.parent.child(o - 1).marks], e, t); )
    o -= 1, l -= n.parent.child(o).nodeSize;
  for (; a < n.parent.childCount && dl([...n.parent.child(a).marks], e, t); )
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
const Ih = (n, e = {}) => ({ tr: t, state: i, dispatch: r }) => {
  const s = ht(n, i.schema), { doc: o, selection: l } = t, { $from: a, from: c, to: d } = l;
  if (r) {
    const u = js(a, s, e);
    if (u && u.from <= c && u.to >= d) {
      const p = N.create(o, u.from, u.to);
      t.setSelection(p);
    }
  }
  return !0;
}, Dh = (n) => (e) => {
  const t = typeof n == "function" ? n(e) : n;
  for (let i = 0; i < t.length; i += 1)
    if (t[i](e))
      return !0;
  return !1;
};
function Mc(n) {
  return n instanceof N;
}
function wt(n = 0, e = 0, t = 0) {
  return Math.min(Math.max(n, e), t);
}
function Ec(n, e = null) {
  if (!e)
    return null;
  const t = _.atStart(n), i = _.atEnd(n);
  if (e === "start" || e === !0)
    return t;
  if (e === "end")
    return i;
  const r = t.from, s = i.to;
  return e === "all" ? N.create(n, wt(0, r, s), wt(n.content.size, r, s)) : N.create(n, wt(e, r, s), wt(e, r, s));
}
function ul() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function yi() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function Ph() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const Bh = (n = null, e = {}) => ({ editor: t, view: i, tr: r, dispatch: s }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const o = () => {
    (yi() || ul()) && i.dom.focus(), requestAnimationFrame(() => {
      t.isDestroyed || (i.focus(), Ph() && !yi() && !ul() && i.dom.focus({ preventScroll: !0 }));
    });
  };
  if (i.hasFocus() && n === null || n === !1)
    return !0;
  if (s && n === null && !Mc(t.state.selection))
    return o(), !0;
  const l = Ec(r.doc, n) || t.state.selection, a = t.state.selection.eq(l);
  return s && (a || r.setSelection(l), a && r.storedMarks && r.setStoredMarks(r.storedMarks), o()), !0;
}, Hh = (n, e) => (t) => n.every((i, r) => e(i, { ...t, index: r })), zh = (n, e) => ({ tr: t, commands: i }) => i.insertContentAt({ from: t.selection.from, to: t.selection.to }, n, e), Ac = (n) => {
  const e = n.childNodes;
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const i = e[t];
    i.nodeType === 3 && i.nodeValue && /^(\n\s\s|\n)$/.test(i.nodeValue) ? n.removeChild(i) : i.nodeType === 1 && Ac(i);
  }
  return n;
};
function qn(n) {
  const e = `<body>${n}</body>`, t = new window.DOMParser().parseFromString(e, "text/html").body;
  return Ac(t);
}
function Mn(n, e, t) {
  if (n instanceof rt || n instanceof y)
    return n;
  t = {
    slice: !0,
    parseOptions: {},
    ...t
  };
  const i = typeof n == "object" && n !== null, r = typeof n == "string";
  if (i)
    try {
      if (Array.isArray(n) && n.length > 0)
        return y.fromArray(n.map((l) => e.nodeFromJSON(l)));
      const o = e.nodeFromJSON(n);
      return t.errorOnInvalidContent && o.check(), o;
    } catch (s) {
      if (t.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: s });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", n, "Error:", s), Mn("", e, t);
    }
  if (r) {
    if (t.errorOnInvalidContent) {
      let o = !1, l = "";
      const a = new aa({
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
      if (t.slice ? st.fromSchema(a).parseSlice(qn(n), t.parseOptions) : st.fromSchema(a).parse(qn(n), t.parseOptions), t.errorOnInvalidContent && o)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${l}`) });
    }
    const s = st.fromSchema(e);
    return t.slice ? s.parseSlice(qn(n), t.parseOptions).content : s.parse(qn(n), t.parseOptions);
  }
  return Mn("", e, t);
}
function $h(n, e, t) {
  const i = n.steps.length - 1;
  if (i < e)
    return;
  const r = n.steps[i];
  if (!(r instanceof G || r instanceof Y))
    return;
  const s = n.mapping.maps[i];
  let o = 0;
  s.forEach((l, a, c, d) => {
    o === 0 && (o = d);
  }), n.setSelection(_.near(n.doc.resolve(o), t));
}
const Fh = (n) => !("type" in n), qh = (n, e, t) => ({ tr: i, dispatch: r, editor: s }) => {
  var o;
  if (r) {
    t = {
      parseOptions: s.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...t
    };
    let l;
    const a = (g) => {
      s.emit("contentError", {
        editor: s,
        error: g,
        disableCollaboration: () => {
          s.storage.collaboration && (s.storage.collaboration.isDisabled = !0);
        }
      });
    }, c = {
      preserveWhitespace: "full",
      ...t.parseOptions
    };
    if (!t.errorOnInvalidContent && !s.options.enableContentCheck && s.options.emitContentError)
      try {
        Mn(e, s.schema, {
          parseOptions: c,
          errorOnInvalidContent: !0
        });
      } catch (g) {
        a(g);
      }
    try {
      l = Mn(e, s.schema, {
        parseOptions: c,
        errorOnInvalidContent: (o = t.errorOnInvalidContent) !== null && o !== void 0 ? o : s.options.enableContentCheck
      });
    } catch (g) {
      return a(g), !1;
    }
    let { from: d, to: u } = typeof n == "number" ? { from: n, to: n } : { from: n.from, to: n.to }, p = !0, h = !0;
    if ((Fh(l) ? l : [l]).forEach((g) => {
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
    t.updateSelection && $h(i, i.steps.length - 1, -1), t.applyInputRules && i.setMeta("applyInputRules", { from: d, text: m }), t.applyPasteRules && i.setMeta("applyPasteRules", { from: d, text: m });
  }
  return !0;
}, Vh = () => ({ state: n, dispatch: e }) => qp(n, e), Wh = () => ({ state: n, dispatch: e }) => Vp(n, e), Uh = () => ({ state: n, dispatch: e }) => cc(n, e), jh = () => ({ state: n, dispatch: e }) => hc(n, e), Kh = () => ({ state: n, dispatch: e, tr: t }) => {
  try {
    const i = Ji(n.doc, n.selection.$from.pos, -1);
    return i == null ? !1 : (t.join(i, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Jh = () => ({ state: n, dispatch: e, tr: t }) => {
  try {
    const i = Ji(n.doc, n.selection.$from.pos, 1);
    return i == null ? !1 : (t.join(i, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Gh = () => ({ state: n, dispatch: e }) => $p(n, e), Yh = () => ({ state: n, dispatch: e }) => Fp(n, e);
function Tc() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function Xh(n) {
  const e = n.split(/-(?!$)/);
  let t = e[e.length - 1];
  t === "Space" && (t = " ");
  let i, r, s, o;
  for (let l = 0; l < e.length - 1; l += 1) {
    const a = e[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      r = !0;
    else if (/^s(hift)?$/i.test(a))
      s = !0;
    else if (/^mod$/i.test(a))
      yi() || Tc() ? o = !0 : r = !0;
    else
      throw new Error(`Unrecognized modifier name: ${a}`);
  }
  return i && (t = `Alt-${t}`), r && (t = `Ctrl-${t}`), o && (t = `Meta-${t}`), s && (t = `Shift-${t}`), t;
}
const Qh = (n) => ({ editor: e, view: t, tr: i, dispatch: r }) => {
  const s = Xh(n).split(/-(?!$)/), o = s.find((c) => !["Alt", "Ctrl", "Meta", "Shift"].includes(c)), l = new KeyboardEvent("keydown", {
    key: o === "Space" ? " " : o,
    altKey: s.includes("Alt"),
    ctrlKey: s.includes("Ctrl"),
    metaKey: s.includes("Meta"),
    shiftKey: s.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), a = e.captureTransaction(() => {
    t.someProp("handleKeyDown", (c) => c(t, l));
  });
  return a == null || a.steps.forEach((c) => {
    const d = c.map(i.mapping);
    d && r && i.maybeStep(d);
  }), !0;
};
function En(n, e, t = {}) {
  const { from: i, to: r, empty: s } = n.selection, o = e ? Q(e, n.schema) : null, l = [];
  n.doc.nodesBetween(i, r, (u, p) => {
    if (u.isText)
      return;
    const h = Math.max(i, p), f = Math.min(r, p + u.nodeSize);
    l.push({
      node: u,
      from: h,
      to: f
    });
  });
  const a = r - i, c = l.filter((u) => o ? o.name === u.node.type.name : !0).filter((u) => bi(u.node.attrs, t, { strict: !1 }));
  return s ? !!c.length : c.reduce((u, p) => u + p.to - p.from, 0) >= a;
}
const Zh = (n, e = {}) => ({ state: t, dispatch: i }) => {
  const r = Q(n, t.schema);
  return En(t, r, e) ? Wp(t, i) : !1;
}, ef = () => ({ state: n, dispatch: e }) => bc(n, e), tf = (n) => ({ state: e, dispatch: t }) => {
  const i = Q(n, e.schema);
  return nh(i)(e, t);
}, nf = () => ({ state: n, dispatch: e }) => mc(n, e);
function sr(n, e) {
  return e.nodes[n] ? "node" : e.marks[n] ? "mark" : null;
}
function pl(n, e) {
  const t = typeof e == "string" ? [e] : e;
  return Object.keys(n).reduce((i, r) => (t.includes(r) || (i[r] = n[r]), i), {});
}
const rf = (n, e) => ({ tr: t, state: i, dispatch: r }) => {
  let s = null, o = null;
  const l = sr(typeof n == "string" ? n : n.name, i.schema);
  return l ? (l === "node" && (s = Q(n, i.schema)), l === "mark" && (o = ht(n, i.schema)), r && t.selection.ranges.forEach((a) => {
    i.doc.nodesBetween(a.$from.pos, a.$to.pos, (c, d) => {
      s && s === c.type && t.setNodeMarkup(d, void 0, pl(c.attrs, e)), o && c.marks.length && c.marks.forEach((u) => {
        o === u.type && t.addMark(d, d + c.nodeSize, o.create(pl(u.attrs, e)));
      });
    });
  }), !0) : !1;
}, sf = () => ({ tr: n, dispatch: e }) => (e && n.scrollIntoView(), !0), of = () => ({ tr: n, dispatch: e }) => {
  if (e) {
    const t = new be(n.doc);
    n.setSelection(t);
  }
  return !0;
}, lf = () => ({ state: n, dispatch: e }) => uc(n, e), af = () => ({ state: n, dispatch: e }) => fc(n, e), cf = () => ({ state: n, dispatch: e }) => Jp(n, e), df = () => ({ state: n, dispatch: e }) => Xp(n, e), uf = () => ({ state: n, dispatch: e }) => Yp(n, e);
function rs(n, e, t = {}, i = {}) {
  return Mn(n, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: i.errorOnInvalidContent
  });
}
const pf = (n, e = !1, t = {}, i = {}) => ({ editor: r, tr: s, dispatch: o, commands: l }) => {
  var a, c;
  const { doc: d } = s;
  if (t.preserveWhitespace !== "full") {
    const u = rs(n, r.schema, t, {
      errorOnInvalidContent: (a = i.errorOnInvalidContent) !== null && a !== void 0 ? a : r.options.enableContentCheck
    });
    return o && s.replaceWith(0, d.content.size, u).setMeta("preventUpdate", !e), !0;
  }
  return o && s.setMeta("preventUpdate", !e), l.insertContentAt({ from: 0, to: d.content.size }, n, {
    parseOptions: t,
    errorOnInvalidContent: (c = i.errorOnInvalidContent) !== null && c !== void 0 ? c : r.options.enableContentCheck
  });
};
function Nc(n, e) {
  const t = ht(e, n.schema), { from: i, to: r, empty: s } = n.selection, o = [];
  s ? (n.storedMarks && o.push(...n.storedMarks), o.push(...n.selection.$head.marks())) : n.doc.nodesBetween(i, r, (a) => {
    o.push(...a.marks);
  });
  const l = o.find((a) => a.type.name === t.name);
  return l ? { ...l.attrs } : {};
}
function hf(n, e) {
  const t = new As(n);
  return e.forEach((i) => {
    i.steps.forEach((r) => {
      t.step(r);
    });
  }), t;
}
function ff(n) {
  for (let e = 0; e < n.edgeCount; e += 1) {
    const { type: t } = n.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
function mf(n, e, t) {
  const i = [];
  return n.nodesBetween(e.from, e.to, (r, s) => {
    t(r) && i.push({
      node: r,
      pos: s
    });
  }), i;
}
function _c(n, e) {
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
function Ks(n) {
  return (e) => _c(e.$from, n);
}
function gf(n, e) {
  const t = {
    from: 0,
    to: n.content.size
  };
  return Sc(n, t, e);
}
function bf(n, e) {
  const t = Q(e, n.schema), { from: i, to: r } = n.selection, s = [];
  n.doc.nodesBetween(i, r, (l) => {
    s.push(l);
  });
  const o = s.reverse().find((l) => l.type.name === t.name);
  return o ? { ...o.attrs } : {};
}
function Oc(n, e) {
  const t = sr(typeof e == "string" ? e : e.name, n.schema);
  return t === "node" ? bf(n, e) : t === "mark" ? Nc(n, e) : {};
}
function yf(n, e = JSON.stringify) {
  const t = {};
  return n.filter((i) => {
    const r = e(i);
    return Object.prototype.hasOwnProperty.call(t, r) ? !1 : t[r] = !0;
  });
}
function kf(n) {
  const e = yf(n);
  return e.length === 1 ? e : e.filter((t, i) => !e.filter((s, o) => o !== i).some((s) => t.oldRange.from >= s.oldRange.from && t.oldRange.to <= s.oldRange.to && t.newRange.from >= s.newRange.from && t.newRange.to <= s.newRange.to));
}
function wf(n) {
  const { mapping: e, steps: t } = n, i = [];
  return e.maps.forEach((r, s) => {
    const o = [];
    if (r.ranges.length)
      r.forEach((l, a) => {
        o.push({ from: l, to: a });
      });
    else {
      const { from: l, to: a } = t[s];
      if (l === void 0 || a === void 0)
        return;
      o.push({ from: l, to: a });
    }
    o.forEach(({ from: l, to: a }) => {
      const c = e.slice(s).map(l, -1), d = e.slice(s).map(a), u = e.invert().map(c, -1), p = e.invert().map(d);
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
  }), kf(i);
}
function Js(n, e, t) {
  const i = [];
  return n === e ? t.resolve(n).marks().forEach((r) => {
    const s = t.resolve(n), o = js(s, r.type);
    o && i.push({
      mark: r,
      ...o
    });
  }) : t.nodesBetween(n, e, (r, s) => {
    !r || (r == null ? void 0 : r.nodeSize) === void 0 || i.push(...r.marks.map((o) => ({
      from: s,
      to: s + r.nodeSize,
      mark: o
    })));
  }), i;
}
function ti(n, e, t) {
  return Object.fromEntries(Object.entries(t).filter(([i]) => {
    const r = n.find((s) => s.type === e && s.name === i);
    return r ? r.attribute.keepOnSplit : !1;
  }));
}
function ss(n, e, t = {}) {
  const { empty: i, ranges: r } = n.selection, s = e ? ht(e, n.schema) : null;
  if (i)
    return !!(n.storedMarks || n.selection.$from.marks()).filter((u) => s ? s.name === u.type.name : !0).find((u) => bi(u.attrs, t, { strict: !1 }));
  let o = 0;
  const l = [];
  if (r.forEach(({ $from: u, $to: p }) => {
    const h = u.pos, f = p.pos;
    n.doc.nodesBetween(h, f, (m, g) => {
      if (!m.isText && !m.marks.length)
        return;
      const b = Math.max(h, g), k = Math.min(f, g + m.nodeSize), w = k - b;
      o += w, l.push(...m.marks.map((M) => ({
        mark: M,
        from: b,
        to: k
      })));
    });
  }), o === 0)
    return !1;
  const a = l.filter((u) => s ? s.name === u.mark.type.name : !0).filter((u) => bi(u.mark.attrs, t, { strict: !1 })).reduce((u, p) => u + p.to - p.from, 0), c = l.filter((u) => s ? u.mark.type !== s && u.mark.type.excludes(s) : !0).reduce((u, p) => u + p.to - p.from, 0);
  return (a > 0 ? a + c : a) >= o;
}
function vf(n, e, t = {}) {
  if (!e)
    return En(n, null, t) || ss(n, null, t);
  const i = sr(e, n.schema);
  return i === "node" ? En(n, e, t) : i === "mark" ? ss(n, e, t) : !1;
}
function hl(n, e) {
  const { nodeExtensions: t } = nr(e), i = t.find((o) => o.name === n);
  if (!i)
    return !1;
  const r = {
    name: i.name,
    options: i.options,
    storage: i.storage
  }, s = R(E(i, "group", r));
  return typeof s != "string" ? !1 : s.split(" ").includes("list");
}
function or(n, { checkChildren: e = !0, ignoreWhitespace: t = !1 } = {}) {
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
    let r = !0;
    return n.content.forEach((s) => {
      r !== !1 && (or(s, { ignoreWhitespace: t, checkChildren: e }) || (r = !1));
    }), r;
  }
  return !1;
}
function Sf(n) {
  return n instanceof T;
}
function xf(n, e, t) {
  var i;
  const { selection: r } = e;
  let s = null;
  if (Mc(r) && (s = r.$cursor), s) {
    const l = (i = n.storedMarks) !== null && i !== void 0 ? i : s.marks();
    return !!t.isInSet(l) || !l.some((a) => a.type.excludes(t));
  }
  const { ranges: o } = r;
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
const Cf = (n, e = {}) => ({ tr: t, state: i, dispatch: r }) => {
  const { selection: s } = t, { empty: o, ranges: l } = s, a = ht(n, i.schema);
  if (r)
    if (o) {
      const c = Nc(i, a);
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
  return xf(i, t, a);
}, Mf = (n, e) => ({ tr: t }) => (t.setMeta(n, e), !0), Ef = (n, e = {}) => ({ state: t, dispatch: i, chain: r }) => {
  const s = Q(n, t.schema);
  let o;
  return t.selection.$anchor.sameParent(t.selection.$head) && (o = t.selection.$anchor.parent.attrs), s.isTextblock ? r().command(({ commands: l }) => ol(s, { ...o, ...e })(t) ? !0 : l.clearNodes()).command(({ state: l }) => ol(s, { ...o, ...e })(l, i)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, Af = (n) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: i } = e, r = wt(n, 0, i.content.size), s = T.create(i, r);
    e.setSelection(s);
  }
  return !0;
}, Tf = (n) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: i } = e, { from: r, to: s } = typeof n == "number" ? { from: n, to: n } : n, o = N.atStart(i).from, l = N.atEnd(i).to, a = wt(r, o, l), c = wt(s, o, l), d = N.create(i, a, c);
    e.setSelection(d);
  }
  return !0;
}, Nf = (n) => ({ state: e, dispatch: t }) => {
  const i = Q(n, e.schema);
  return sh(i)(e, t);
};
function fl(n, e) {
  const t = n.storedMarks || n.selection.$to.parentOffset && n.selection.$from.marks();
  if (t) {
    const i = t.filter((r) => e == null ? void 0 : e.includes(r.type.name));
    n.tr.ensureMarks(i);
  }
}
const _f = ({ keepMarks: n = !0 } = {}) => ({ tr: e, state: t, dispatch: i, editor: r }) => {
  const { selection: s, doc: o } = e, { $from: l, $to: a } = s, c = r.extensionManager.attributes, d = ti(c, l.node().type.name, l.node().attrs);
  if (s instanceof T && s.node.isBlock)
    return !l.parentOffset || !Ue(o, l.pos) ? !1 : (i && (n && fl(t, r.extensionManager.splittableMarks), e.split(l.pos).scrollIntoView()), !0);
  if (!l.parent.isBlock)
    return !1;
  const u = a.parentOffset === a.parent.content.size, p = l.depth === 0 ? void 0 : ff(l.node(-1).contentMatchAt(l.indexAfter(-1)));
  let h = u && p ? [
    {
      type: p,
      attrs: d
    }
  ] : void 0, f = Ue(e.doc, e.mapping.map(l.pos), 1, h);
  if (!h && !f && Ue(e.doc, e.mapping.map(l.pos), 1, p ? [{ type: p }] : void 0) && (f = !0, h = p ? [
    {
      type: p,
      attrs: d
    }
  ] : void 0), i) {
    if (f && (s instanceof N && e.deleteSelection(), e.split(e.mapping.map(l.pos), 1, h), p && !u && !l.parentOffset && l.parent.type !== p)) {
      const m = e.mapping.map(l.before()), g = e.doc.resolve(m);
      l.node(-1).canReplaceWith(g.index(), g.index() + 1, p) && e.setNodeMarkup(e.mapping.map(l.before()), p);
    }
    n && fl(t, r.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return f;
}, Of = (n, e = {}) => ({ tr: t, state: i, dispatch: r, editor: s }) => {
  var o;
  const l = Q(n, i.schema), { $from: a, $to: c } = i.selection, d = i.selection.node;
  if (d && d.isBlock || a.depth < 2 || !a.sameParent(c))
    return !1;
  const u = a.node(-1);
  if (u.type !== l)
    return !1;
  const p = s.extensionManager.attributes;
  if (a.parent.content.size === 0 && a.node(-1).childCount === a.indexAfter(-1)) {
    if (a.depth === 2 || a.node(-3).type !== l || a.index(-2) !== a.node(-2).childCount - 1)
      return !1;
    if (r) {
      let b = y.empty;
      const k = a.index(-1) ? 1 : a.index(-2) ? 2 : 3;
      for (let A = a.depth - k; A >= a.depth - 3; A -= 1)
        b = y.from(a.node(A).copy(b));
      const w = a.indexAfter(-1) < a.node(-2).childCount ? 1 : a.indexAfter(-2) < a.node(-3).childCount ? 2 : 3, M = {
        ...ti(p, a.node().type.name, a.node().attrs),
        ...e
      }, S = ((o = l.contentMatch.defaultType) === null || o === void 0 ? void 0 : o.createAndFill(M)) || void 0;
      b = b.append(y.from(l.createAndFill(null, S) || void 0));
      const O = a.before(a.depth - (k - 1));
      t.replace(O, a.after(-w), new x(b, 4 - k, 0));
      let C = -1;
      t.doc.nodesBetween(O, t.doc.content.size, (A, I) => {
        if (C > -1)
          return !1;
        A.isTextblock && A.content.size === 0 && (C = I + 1);
      }), C > -1 && t.setSelection(N.near(t.doc.resolve(C))), t.scrollIntoView();
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
  if (!Ue(t.doc, a.pos, 2))
    return !1;
  if (r) {
    const { selection: b, storedMarks: k } = i, { splittableMarks: w } = s.extensionManager, M = k || b.$to.parentOffset && b.$from.marks();
    if (t.split(a.pos, 2, g).scrollIntoView(), !M || !r)
      return !0;
    const S = M.filter((O) => w.includes(O.type.name));
    t.ensureMarks(S);
  }
  return !0;
}, Ar = (n, e) => {
  const t = Ks((o) => o.type === e)(n.selection);
  if (!t)
    return !0;
  const i = n.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
  if (i === void 0)
    return !0;
  const r = n.doc.nodeAt(i);
  return t.node.type === (r == null ? void 0 : r.type) && ut(n.doc, t.pos) && n.join(t.pos), !0;
}, Tr = (n, e) => {
  const t = Ks((o) => o.type === e)(n.selection);
  if (!t)
    return !0;
  const i = n.doc.resolve(t.start).after(t.depth);
  if (i === void 0)
    return !0;
  const r = n.doc.nodeAt(i);
  return t.node.type === (r == null ? void 0 : r.type) && ut(n.doc, i) && n.join(i), !0;
}, Lf = (n, e, t, i = {}) => ({ editor: r, tr: s, state: o, dispatch: l, chain: a, commands: c, can: d }) => {
  const { extensions: u, splittableMarks: p } = r.extensionManager, h = Q(n, o.schema), f = Q(e, o.schema), { selection: m, storedMarks: g } = o, { $from: b, $to: k } = m, w = b.blockRange(k), M = g || m.$to.parentOffset && m.$from.marks();
  if (!w)
    return !1;
  const S = Ks((O) => hl(O.type.name, u))(m);
  if (w.depth >= 1 && S && w.depth - S.depth <= 1) {
    if (S.node.type === h)
      return c.liftListItem(f);
    if (hl(S.node.type.name, u) && h.validContent(S.node.content) && l)
      return a().command(() => (s.setNodeMarkup(S.pos, h), !0)).command(() => Ar(s, h)).command(() => Tr(s, h)).run();
  }
  return !t || !M || !l ? a().command(() => d().wrapInList(h, i) ? !0 : c.clearNodes()).wrapInList(h, i).command(() => Ar(s, h)).command(() => Tr(s, h)).run() : a().command(() => {
    const O = d().wrapInList(h, i), C = M.filter((A) => p.includes(A.type.name));
    return s.ensureMarks(C), O ? !0 : c.clearNodes();
  }).wrapInList(h, i).command(() => Ar(s, h)).command(() => Tr(s, h)).run();
}, Rf = (n, e = {}, t = {}) => ({ state: i, commands: r }) => {
  const { extendEmptyMarkRange: s = !1 } = t, o = ht(n, i.schema);
  return ss(i, o, e) ? r.unsetMark(o, { extendEmptyMarkRange: s }) : r.setMark(o, e);
}, If = (n, e, t = {}) => ({ state: i, commands: r }) => {
  const s = Q(n, i.schema), o = Q(e, i.schema), l = En(i, s, t);
  let a;
  return i.selection.$anchor.sameParent(i.selection.$head) && (a = i.selection.$anchor.parent.attrs), l ? r.setNode(o, a) : r.setNode(s, { ...a, ...t });
}, Df = (n, e = {}) => ({ state: t, commands: i }) => {
  const r = Q(n, t.schema);
  return En(t, r, e) ? i.lift(r) : i.wrapIn(r, e);
}, Pf = () => ({ state: n, dispatch: e }) => {
  const t = n.plugins;
  for (let i = 0; i < t.length; i += 1) {
    const r = t[i];
    let s;
    if (r.spec.isInputRules && (s = r.getState(n))) {
      if (e) {
        const o = n.tr, l = s.transform;
        for (let a = l.steps.length - 1; a >= 0; a -= 1)
          o.step(l.steps[a].invert(l.docs[a]));
        if (s.text) {
          const a = o.doc.resolve(s.from).marks();
          o.replaceWith(s.from, s.to, n.schema.text(s.text, a));
        } else
          o.delete(s.from, s.to);
      }
      return !0;
    }
  }
  return !1;
}, Bf = () => ({ tr: n, dispatch: e }) => {
  const { selection: t } = n, { empty: i, ranges: r } = t;
  return i || e && r.forEach((s) => {
    n.removeMark(s.$from.pos, s.$to.pos);
  }), !0;
}, Hf = (n, e = {}) => ({ tr: t, state: i, dispatch: r }) => {
  var s;
  const { extendEmptyMarkRange: o = !1 } = e, { selection: l } = t, a = ht(n, i.schema), { $from: c, empty: d, ranges: u } = l;
  if (!r)
    return !0;
  if (d && o) {
    let { from: p, to: h } = l;
    const f = (s = c.marks().find((g) => g.type === a)) === null || s === void 0 ? void 0 : s.attrs, m = js(c, a, f);
    m && (p = m.from, h = m.to), t.removeMark(p, h, a);
  } else
    u.forEach((p) => {
      t.removeMark(p.$from.pos, p.$to.pos, a);
    });
  return t.removeStoredMark(a), !0;
}, zf = (n, e = {}) => ({ tr: t, state: i, dispatch: r }) => {
  let s = null, o = null;
  const l = sr(typeof n == "string" ? n : n.name, i.schema);
  return l ? (l === "node" && (s = Q(n, i.schema)), l === "mark" && (o = ht(n, i.schema)), r && t.selection.ranges.forEach((a) => {
    const c = a.$from.pos, d = a.$to.pos;
    let u, p, h, f;
    t.selection.empty ? i.doc.nodesBetween(c, d, (m, g) => {
      s && s === m.type && (h = Math.max(g, c), f = Math.min(g + m.nodeSize, d), u = g, p = m);
    }) : i.doc.nodesBetween(c, d, (m, g) => {
      g < c && s && s === m.type && (h = Math.max(g, c), f = Math.min(g + m.nodeSize, d), u = g, p = m), g >= c && g <= d && (s && s === m.type && t.setNodeMarkup(g, void 0, {
        ...m.attrs,
        ...e
      }), o && m.marks.length && m.marks.forEach((b) => {
        if (o === b.type) {
          const k = Math.max(g, c), w = Math.min(g + m.nodeSize, d);
          t.addMark(k, w, o.create({
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
}, $f = (n, e = {}) => ({ state: t, dispatch: i }) => {
  const r = Q(n, t.schema);
  return Qp(r, e)(t, i);
}, Ff = (n, e = {}) => ({ state: t, dispatch: i }) => {
  const r = Q(n, t.schema);
  return Zp(r, e)(t, i);
};
var qf = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: Sh,
  clearContent: xh,
  clearNodes: Ch,
  command: Mh,
  createParagraphNear: Eh,
  cut: Ah,
  deleteCurrentNode: Th,
  deleteNode: Nh,
  deleteRange: _h,
  deleteSelection: Oh,
  enter: Lh,
  exitCode: Rh,
  extendMarkRange: Ih,
  first: Dh,
  focus: Bh,
  forEach: Hh,
  insertContent: zh,
  insertContentAt: qh,
  joinBackward: Uh,
  joinDown: Wh,
  joinForward: jh,
  joinItemBackward: Kh,
  joinItemForward: Jh,
  joinTextblockBackward: Gh,
  joinTextblockForward: Yh,
  joinUp: Vh,
  keyboardShortcut: Qh,
  lift: Zh,
  liftEmptyBlock: ef,
  liftListItem: tf,
  newlineInCode: nf,
  resetAttributes: rf,
  scrollIntoView: sf,
  selectAll: of,
  selectNodeBackward: lf,
  selectNodeForward: af,
  selectParentNode: cf,
  selectTextblockEnd: df,
  selectTextblockStart: uf,
  setContent: pf,
  setMark: Cf,
  setMeta: Mf,
  setNode: Ef,
  setNodeSelection: Af,
  setTextSelection: Tf,
  sinkListItem: Nf,
  splitBlock: _f,
  splitListItem: Of,
  toggleList: Lf,
  toggleMark: Rf,
  toggleNode: If,
  toggleWrap: Df,
  undoInputRule: Pf,
  unsetAllMarks: Bf,
  unsetMark: Hf,
  updateAttributes: zf,
  wrapIn: $f,
  wrapInList: Ff
});
const Vf = K.create({
  name: "commands",
  addCommands() {
    return {
      ...qf
    };
  }
}), Wf = K.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new U({
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
}), Uf = K.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new U({
        key: new J("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
}), jf = new J("focusEvents"), Kf = K.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: n } = this;
    return [
      new U({
        key: jf,
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
}), Jf = K.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const n = () => this.editor.commands.first(({ commands: o }) => [
      () => o.undoInputRule(),
      // maybe convert first text block node to default node
      () => o.command(({ tr: l }) => {
        const { selection: a, doc: c } = l, { empty: d, $anchor: u } = a, { pos: p, parent: h } = u, f = u.parent.isTextblock && p > 0 ? l.doc.resolve(p - 1) : u, m = f.parent.type.spec.isolating, g = u.pos - u.parentOffset, b = m && f.parent.childCount === 1 ? g === u.pos : _.atStart(c).from === p;
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
    }, r = {
      ...i
    }, s = {
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
    return yi() || Tc() ? s : r;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new U({
        key: new J("clearDocument"),
        appendTransaction: (n, e, t) => {
          if (n.some((m) => m.getMeta("composition")))
            return;
          const i = n.some((m) => m.docChanged) && !e.doc.eq(t.doc), r = n.some((m) => m.getMeta("preventClearDocument"));
          if (!i || r)
            return;
          const { empty: s, from: o, to: l } = e.selection, a = _.atStart(e.doc).from, c = _.atEnd(e.doc).to;
          if (s || !(o === a && l === c) || !or(t.doc))
            return;
          const p = t.tr, h = er({
            state: t,
            transaction: p
          }), { commands: f } = new tr({
            editor: this.editor,
            state: h
          });
          if (f.clearNodes(), !!p.steps.length)
            return p;
        }
      })
    ];
  }
}), Gf = K.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new U({
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
}), Yf = K.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new U({
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
  constructor(e, t, i = !1, r = null) {
    this.currentNode = null, this.actualDepth = null, this.isBlock = i, this.resolvedPos = e, this.editor = t, this.currentNode = r;
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
      const r = t.isBlock && !t.isTextblock, s = t.isAtom && !t.isText, o = this.pos + i + (s ? 0 : 1);
      if (o < 0 || o > this.resolvedPos.doc.nodeSize - 2)
        return;
      const l = this.resolvedPos.doc.resolve(o);
      if (!r && l.depth <= this.depth)
        return;
      const a = new bt(l, this.editor, r, r ? t : null);
      r && (a.actualDepth = this.depth + 1), e.push(new bt(l, this.editor, r, r ? t : null));
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
    let i = null, r = this.parent;
    for (; r && !i; ) {
      if (r.node.type.name === e)
        if (Object.keys(t).length > 0) {
          const s = r.node.attrs, o = Object.keys(t);
          for (let l = 0; l < o.length; l += 1) {
            const a = o[l];
            if (s[a] !== t[a])
              break;
          }
        } else
          i = r;
      r = r.parent;
    }
    return i;
  }
  querySelector(e, t = {}) {
    return this.querySelectorAll(e, t, !0)[0] || null;
  }
  querySelectorAll(e, t = {}, i = !1) {
    let r = [];
    if (!this.children || this.children.length === 0)
      return r;
    const s = Object.keys(t);
    return this.children.forEach((o) => {
      i && r.length > 0 || (o.node.type.name === e && s.every((a) => t[a] === o.node.attrs[a]) && r.push(o), !(i && r.length > 0) && (r = r.concat(o.querySelectorAll(e, t, i))));
    }), r;
  }
  setAttribute(e) {
    const { tr: t } = this.editor.state;
    t.setNodeMarkup(this.from, void 0, {
      ...this.node.attrs,
      ...e
    }), this.editor.view.dispatch(t);
  }
}
const Xf = `.ProseMirror {
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
function Qf(n, e, t) {
  const i = document.querySelector("style[data-tiptap-style]");
  if (i !== null)
    return i;
  const r = document.createElement("style");
  return e && r.setAttribute("nonce", e), r.setAttribute("data-tiptap-style", ""), r.innerHTML = n, document.getElementsByTagName("head")[0].appendChild(r), r;
}
class Zf extends oh {
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
    }, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.setOptions(e), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("contentError", this.options.onContentError), this.createView(), this.injectCSS(), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: t, slice: i, moved: r }) => this.options.onDrop(t, i, r)), this.on("paste", ({ event: t, slice: i }) => this.options.onPaste(t, i)), window.setTimeout(() => {
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
    this.options.injectCSS && document && (this.css = Qf(Xf, this.options.injectNonce));
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
    const i = vc(t) ? t(e, [...this.state.plugins]) : [...this.state.plugins, e], r = this.state.reconfigure({ plugins: i });
    return this.view.updateState(r), r;
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
    if ([].concat(e).forEach((s) => {
      const o = typeof s == "string" ? `${s}$` : s.key;
      i = i.filter((l) => !l.key.startsWith(o));
    }), t.length === i.length)
      return;
    const r = this.state.reconfigure({
      plugins: i
    });
    return this.view.updateState(r), r;
  }
  /**
   * Creates an extension manager.
   */
  createExtensionManager() {
    var e, t;
    const r = [...this.options.enableCoreExtensions ? [
      Uf,
      vh.configure({
        blockSeparator: (t = (e = this.options.coreExtensionOptions) === null || e === void 0 ? void 0 : e.clipboardTextSerializer) === null || t === void 0 ? void 0 : t.blockSeparator
      }),
      Vf,
      Kf,
      Jf,
      Yf,
      Wf,
      Gf
    ].filter((s) => typeof this.options.enableCoreExtensions == "object" ? this.options.enableCoreExtensions[s.name] !== !1 : !0) : [], ...this.options.extensions].filter((s) => ["extension", "node", "mark"].includes(s == null ? void 0 : s.type));
    this.extensionManager = new qt(r, this);
  }
  /**
   * Creates an command manager.
   */
  createCommandManager() {
    this.commandManager = new tr({
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
      t = rs(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: this.options.enableContentCheck });
    } catch (o) {
      if (!(o instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(o.message))
        throw o;
      this.emit("contentError", {
        editor: this,
        error: o,
        disableCollaboration: () => {
          this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((l) => l.name !== "collaboration"), this.createExtensionManager();
        }
      }), t = rs(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: !1 });
    }
    const i = Ec(t, this.options.autofocus);
    this.view = new lc(this.options.element, {
      ...this.options.editorProps,
      attributes: {
        // add `role="textbox"` to the editor element
        role: "textbox",
        ...(e = this.options.editorProps) === null || e === void 0 ? void 0 : e.attributes
      },
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: Ft.create({
        doc: t,
        selection: i || void 0
      })
    });
    const r = this.state.reconfigure({
      plugins: this.extensionManager.plugins
    });
    this.view.updateState(r), this.createNodeViews(), this.prependClass();
    const s = this.view.dom;
    s.editor = this;
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
    const r = e.getMeta("focus"), s = e.getMeta("blur");
    r && this.emit("focus", {
      editor: this,
      event: r.event,
      transaction: e
    }), s && this.emit("blur", {
      editor: this,
      event: s.event,
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
    return Oc(this.state, e);
  }
  isActive(e, t) {
    const i = typeof e == "string" ? e : null, r = typeof e == "string" ? t : e;
    return vf(this.state, i, r);
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
    return Ws(this.state.doc.content, this.schema);
  }
  /**
   * Get the document as text.
   */
  getText(e) {
    const { blockSeparator: t = `

`, textSerializers: i = {} } = e || {};
    return gf(this.state.doc, {
      blockSeparator: t,
      textSerializers: {
        ...xc(this.schema),
        ...i
      }
    });
  }
  /**
   * Check if there is no content.
   */
  get isEmpty() {
    return or(this.state.doc);
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
function Ot(n) {
  return new ir({
    find: n.find,
    handler: ({ state: e, range: t, match: i }) => {
      const r = R(n.getAttributes, void 0, i);
      if (r === !1 || r === null)
        return null;
      const { tr: s } = e, o = i[i.length - 1], l = i[0];
      if (o) {
        const a = l.search(/\S/), c = t.from + l.indexOf(o), d = c + o.length;
        if (Js(t.from, t.to, e.doc).filter((h) => h.mark.type.excluded.find((m) => m === n.type && m !== h.mark.type)).filter((h) => h.to > c).length)
          return null;
        d < t.to && s.delete(d, t.to), c > t.from && s.delete(t.from + a, c);
        const p = t.from + a + o.length;
        s.addMark(t.from + a, p, n.type.create(r || {})), s.removeStoredMark(n.type);
      }
    }
  });
}
function em(n) {
  return new ir({
    find: n.find,
    handler: ({ state: e, range: t, match: i }) => {
      const r = R(n.getAttributes, void 0, i) || {}, { tr: s } = e, o = t.from;
      let l = t.to;
      const a = n.type.create(r);
      if (i[1]) {
        const c = i[0].lastIndexOf(i[1]);
        let d = o + c;
        d > l ? d = l : l = d + i[1].length;
        const u = i[0][i[0].length - 1];
        s.insertText(u, o + i[0].length - 1), s.replaceWith(d, l, a);
      } else if (i[0]) {
        const c = n.type.isInline ? o : o - 1;
        s.insert(c, n.type.create(r)).delete(s.mapping.map(o), s.mapping.map(l));
      }
      s.scrollIntoView();
    }
  });
}
function ls(n) {
  return new ir({
    find: n.find,
    handler: ({ state: e, range: t, match: i }) => {
      const r = e.doc.resolve(t.from), s = R(n.getAttributes, void 0, i) || {};
      if (!r.node(-1).canReplaceWith(r.index(-1), r.indexAfter(-1), n.type))
        return null;
      e.tr.delete(t.from, t.to).setBlockType(t.from, t.from, n.type, s);
    }
  });
}
function An(n) {
  return new ir({
    find: n.find,
    handler: ({ state: e, range: t, match: i, chain: r }) => {
      const s = R(n.getAttributes, void 0, i) || {}, o = e.tr.delete(t.from, t.to), a = o.doc.resolve(t.from).blockRange(), c = a && Es(a, n.type, s);
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
        r().updateAttributes(u, s).run();
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
      addOptions: () => rr(this.options, e)
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
  return new mh({
    find: n.find,
    handler: ({ state: e, range: t, match: i, pasteEvent: r }) => {
      const s = R(n.getAttributes, void 0, i, r);
      if (s === !1 || s === null)
        return null;
      const { tr: o } = e, l = i[i.length - 1], a = i[0];
      let c = t.to;
      if (l) {
        const d = a.search(/\S/), u = t.from + a.indexOf(l), p = u + l.length;
        if (Js(t.from, t.to, e.doc).filter((f) => f.mark.type.excluded.find((g) => g === n.type && g !== f.mark.type)).filter((f) => f.to > u).length)
          return null;
        p < t.to && o.delete(p, t.to), u > t.from && o.delete(t.from + d, u), c = t.from + d + l.length, o.addMark(t.from + d, c, n.type.create(s || {})), o.removeStoredMark(n.type);
      }
    }
  });
}
function tm(n, e) {
  const { selection: t } = n, { $from: i } = t;
  if (t instanceof T) {
    const s = i.index();
    return i.parent.canReplaceWith(s, s + 1, e);
  }
  let r = i.depth;
  for (; r >= 0; ) {
    const s = i.index(r);
    if (i.node(r).contentMatchAt(s).matchType(e))
      return !0;
    r -= 1;
  }
  return !1;
}
function nm(n) {
  return n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
const im = /^\s*>\s$/, rm = B.create({
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
        find: im,
        type: this.type
      })
    ];
  }
}), sm = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/, om = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g, lm = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/, am = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g, cm = fe.create({
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
      Ot({
        find: sm,
        type: this.type
      }),
      Ot({
        find: lm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: om,
        type: this.type
      }),
      dt({
        find: am,
        type: this.type
      })
    ];
  }
}), dm = "listItem", ml = "textStyle", gl = /^\s*([-+*])\s$/, um = B.create({
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
      toggleBulletList: () => ({ commands: n, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(dm, this.editor.getAttributes(ml)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor.commands.toggleBulletList()
    };
  },
  addInputRules() {
    let n = An({
      find: gl,
      type: this.type
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = An({
      find: gl,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: () => this.editor.getAttributes(ml),
      editor: this.editor
    })), [
      n
    ];
  }
}), pm = /(^|[^`])`([^`]+)`(?!`)/, hm = /(^|[^`])`([^`]+)`(?!`)/g, fm = fe.create({
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
      Ot({
        find: pm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: hm,
        type: this.type
      })
    ];
  }
}), mm = /^```([a-z]+)?[\s\n]$/, gm = /^~~~([a-z]+)?[\s\n]$/, bm = B.create({
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
          const { languageClassPrefix: t } = this.options, s = [...((e = n.firstElementChild) === null || e === void 0 ? void 0 : e.classList) || []].filter((o) => o.startsWith(t)).map((o) => o.replace(t, ""))[0];
          return s || null;
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
        const { state: e } = n, { selection: t } = e, { $from: i, empty: r } = t;
        if (!r || i.parent.type !== this.type)
          return !1;
        const s = i.parentOffset === i.parent.nodeSize - 2, o = i.parent.textContent.endsWith(`

`);
        return !s || !o ? !1 : n.chain().command(({ tr: l }) => (l.delete(i.pos - 2, i.pos), !0)).exitCode().run();
      },
      // exit node on arrow down
      ArrowDown: ({ editor: n }) => {
        if (!this.options.exitOnArrowDown)
          return !1;
        const { state: e } = n, { selection: t, doc: i } = e, { $from: r, empty: s } = t;
        if (!s || r.parent.type !== this.type || !(r.parentOffset === r.parent.nodeSize - 2))
          return !1;
        const l = r.after();
        return l === void 0 ? !1 : i.nodeAt(l) ? n.commands.command(({ tr: c }) => (c.setSelection(_.near(i.resolve(l))), !0)) : n.commands.exitCode();
      }
    };
  },
  addInputRules() {
    return [
      ls({
        find: mm,
        type: this.type,
        getAttributes: (n) => ({
          language: n[1]
        })
      }),
      ls({
        find: gm,
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
      new U({
        key: new J("codeBlockVSCodeHandler"),
        props: {
          handlePaste: (n, e) => {
            if (!e.clipboardData || this.editor.isActive(this.type.name))
              return !1;
            const t = e.clipboardData.getData("text/plain"), i = e.clipboardData.getData("vscode-editor-data"), r = i ? JSON.parse(i) : void 0, s = r == null ? void 0 : r.mode;
            if (!t || !s)
              return !1;
            const { tr: o, schema: l } = n.state, a = l.text(t.replace(/\r\n?/g, `
`));
            return o.replaceSelectionWith(this.type.create({ language: s }, a)), o.selection.$from.parent.type !== this.type && o.setSelection(N.near(o.doc.resolve(Math.max(0, o.selection.from - 2)))), o.setMeta("paste", !0), n.dispatch(o), !0;
          }
        }
      })
    ];
  }
}), ym = B.create({
  name: "doc",
  topNode: !0,
  content: "block+"
});
function km(n = {}) {
  return new U({
    view(e) {
      return new wm(e, n);
    }
  });
}
class wm {
  constructor(e, t) {
    var i;
    this.editorView = e, this.cursorPos = null, this.element = null, this.timeout = -1, this.width = (i = t.width) !== null && i !== void 0 ? i : 1, this.color = t.color === !1 ? void 0 : t.color || "black", this.class = t.class, this.handlers = ["dragover", "dragend", "drop", "dragleave"].map((r) => {
      let s = (o) => {
        this[r](o);
      };
      return e.dom.addEventListener(r, s), { name: r, handler: s };
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
    let e = this.editorView.state.doc.resolve(this.cursorPos), t = !e.parent.inlineContent, i, r = this.editorView.dom, s = r.getBoundingClientRect(), o = s.width / r.offsetWidth, l = s.height / r.offsetHeight;
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
    let t = this.editorView.posAtCoords({ left: e.clientX, top: e.clientY }), i = t && t.inside >= 0 && this.editorView.state.doc.nodeAt(t.inside), r = i && i.type.spec.disableDropCursor, s = typeof r == "function" ? r(this.editorView, t, e) : r;
    if (t && !s) {
      let o = t.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        let l = ka(this.editorView.state.doc, o, this.editorView.dragging.slice);
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
const vm = K.create({
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
      km(this.options)
    ];
  }
});
class V extends _ {
  /**
  Create a gap cursor.
  */
  constructor(e) {
    super(e, e);
  }
  map(e, t) {
    let i = e.resolve(t.map(this.head));
    return V.valid(i) ? new V(i) : _.near(i);
  }
  content() {
    return x.empty;
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
    return new Gs(this.anchor);
  }
  /**
  @internal
  */
  static valid(e) {
    let t = e.parent;
    if (t.isTextblock || !Sm(e) || !xm(e))
      return !1;
    let i = t.type.spec.allowGapCursor;
    if (i != null)
      return i;
    let r = t.contentMatchAt(e.index()).defaultType;
    return r && r.isTextblock;
  }
  /**
  @internal
  */
  static findGapCursorFrom(e, t, i = !1) {
    e: for (; ; ) {
      if (!i && V.valid(e))
        return e;
      let r = e.pos, s = null;
      for (let o = e.depth; ; o--) {
        let l = e.node(o);
        if (t > 0 ? e.indexAfter(o) < l.childCount : e.index(o) > 0) {
          s = l.child(t > 0 ? e.indexAfter(o) : e.index(o) - 1);
          break;
        } else if (o == 0)
          return null;
        r += t;
        let a = e.doc.resolve(r);
        if (V.valid(a))
          return a;
      }
      for (; ; ) {
        let o = t > 0 ? s.firstChild : s.lastChild;
        if (!o) {
          if (s.isAtom && !s.isText && !T.isSelectable(s)) {
            e = e.doc.resolve(r + s.nodeSize * t), i = !1;
            continue e;
          }
          break;
        }
        s = o, r += t;
        let l = e.doc.resolve(r);
        if (V.valid(l))
          return l;
      }
      return null;
    }
  }
}
V.prototype.visible = !1;
V.findFrom = V.findGapCursorFrom;
_.jsonID("gapcursor", V);
class Gs {
  constructor(e) {
    this.pos = e;
  }
  map(e) {
    return new Gs(e.map(this.pos));
  }
  resolve(e) {
    let t = e.resolve(this.pos);
    return V.valid(t) ? new V(t) : _.near(t);
  }
}
function Lc(n) {
  return n.isAtom || n.spec.isolating || n.spec.createGapCursor;
}
function Sm(n) {
  for (let e = n.depth; e >= 0; e--) {
    let t = n.index(e), i = n.node(e);
    if (t == 0) {
      if (i.type.spec.isolating)
        return !0;
      continue;
    }
    for (let r = i.child(t - 1); ; r = r.lastChild) {
      if (r.childCount == 0 && !r.inlineContent || Lc(r.type))
        return !0;
      if (r.inlineContent)
        return !1;
    }
  }
  return !0;
}
function xm(n) {
  for (let e = n.depth; e >= 0; e--) {
    let t = n.indexAfter(e), i = n.node(e);
    if (t == i.childCount) {
      if (i.type.spec.isolating)
        return !0;
      continue;
    }
    for (let r = i.child(t); ; r = r.firstChild) {
      if (r.childCount == 0 && !r.inlineContent || Lc(r.type))
        return !0;
      if (r.inlineContent)
        return !1;
    }
  }
  return !0;
}
function Cm() {
  return new U({
    props: {
      decorations: Tm,
      createSelectionBetween(n, e, t) {
        return e.pos == t.pos && V.valid(t) ? new V(t) : null;
      },
      handleClick: Em,
      handleKeyDown: Mm,
      handleDOMEvents: { beforeinput: Am }
    }
  });
}
const Mm = Hs({
  ArrowLeft: Vn("horiz", -1),
  ArrowRight: Vn("horiz", 1),
  ArrowUp: Vn("vert", -1),
  ArrowDown: Vn("vert", 1)
});
function Vn(n, e) {
  const t = n == "vert" ? e > 0 ? "down" : "up" : e > 0 ? "right" : "left";
  return function(i, r, s) {
    let o = i.selection, l = e > 0 ? o.$to : o.$from, a = o.empty;
    if (o instanceof N) {
      if (!s.endOfTextblock(t) || l.depth == 0)
        return !1;
      a = !1, l = i.doc.resolve(e > 0 ? l.after() : l.before());
    }
    let c = V.findGapCursorFrom(l, e, a);
    return c ? (r && r(i.tr.setSelection(new V(c))), !0) : !1;
  };
}
function Em(n, e, t) {
  if (!n || !n.editable)
    return !1;
  let i = n.state.doc.resolve(e);
  if (!V.valid(i))
    return !1;
  let r = n.posAtCoords({ left: t.clientX, top: t.clientY });
  return r && r.inside > -1 && T.isSelectable(n.state.doc.nodeAt(r.inside)) ? !1 : (n.dispatch(n.state.tr.setSelection(new V(i))), !0);
}
function Am(n, e) {
  if (e.inputType != "insertCompositionText" || !(n.state.selection instanceof V))
    return !1;
  let { $from: t } = n.state.selection, i = t.parent.contentMatchAt(t.index()).findWrapping(n.state.schema.nodes.text);
  if (!i)
    return !1;
  let r = y.empty;
  for (let o = i.length - 1; o >= 0; o--)
    r = y.from(i[o].createAndFill(null, r));
  let s = n.state.tr.replace(t.pos, t.pos, new x(r, 0, 0));
  return s.setSelection(N.near(s.doc.resolve(t.pos + 1))), n.dispatch(s), !1;
}
function Tm(n) {
  if (!(n.selection instanceof V))
    return null;
  let e = document.createElement("div");
  return e.className = "ProseMirror-gapcursor", F.create(n.doc, [re.widget(n.selection.head, e, { key: "gapcursor" })]);
}
const Nm = K.create({
  name: "gapCursor",
  addProseMirrorPlugins() {
    return [
      Cm()
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
}), _m = B.create({
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
          const { selection: r, storedMarks: s } = t;
          if (r.$from.parent.type.spec.isolating)
            return !1;
          const { keepMarks: o } = this.options, { splittableMarks: l } = i.extensionManager, a = s || r.$to.parentOffset && r.$from.marks();
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
}), Om = B.create({
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
    return this.options.levels.map((n) => ls({
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
  return new Lm(this, e);
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
  var r = [];
  return this.forEach(function(s, o) {
    return r.push(e(s, o));
  }, t, i), r;
};
X.from = function(e) {
  return e instanceof X ? e : e && e.length ? new Rc(e) : X.empty;
};
var Rc = /* @__PURE__ */ (function(n) {
  function e(i) {
    n.call(this), this.values = i;
  }
  n && (e.__proto__ = n), e.prototype = Object.create(n && n.prototype), e.prototype.constructor = e;
  var t = { length: { configurable: !0 }, depth: { configurable: !0 } };
  return e.prototype.flatten = function() {
    return this.values;
  }, e.prototype.sliceInner = function(r, s) {
    return r == 0 && s == this.length ? this : new e(this.values.slice(r, s));
  }, e.prototype.getInner = function(r) {
    return this.values[r];
  }, e.prototype.forEachInner = function(r, s, o, l) {
    for (var a = s; a < o; a++)
      if (r(this.values[a], l + a) === !1)
        return !1;
  }, e.prototype.forEachInvertedInner = function(r, s, o, l) {
    for (var a = s - 1; a >= o; a--)
      if (r(this.values[a], l + a) === !1)
        return !1;
  }, e.prototype.leafAppend = function(r) {
    if (this.length + r.length <= ki)
      return new e(this.values.concat(r.flatten()));
  }, e.prototype.leafPrepend = function(r) {
    if (this.length + r.length <= ki)
      return new e(r.flatten().concat(this.values));
  }, t.length.get = function() {
    return this.values.length;
  }, t.depth.get = function() {
    return 0;
  }, Object.defineProperties(e.prototype, t), e;
})(X);
X.empty = new Rc([]);
var Lm = /* @__PURE__ */ (function(n) {
  function e(t, i) {
    n.call(this), this.left = t, this.right = i, this.length = t.length + i.length, this.depth = Math.max(t.depth, i.depth) + 1;
  }
  return n && (e.__proto__ = n), e.prototype = Object.create(n && n.prototype), e.prototype.constructor = e, e.prototype.flatten = function() {
    return this.left.flatten().concat(this.right.flatten());
  }, e.prototype.getInner = function(i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length);
  }, e.prototype.forEachInner = function(i, r, s, o) {
    var l = this.left.length;
    if (r < l && this.left.forEachInner(i, r, Math.min(s, l), o) === !1 || s > l && this.right.forEachInner(i, Math.max(r - l, 0), Math.min(this.length, s) - l, o + l) === !1)
      return !1;
  }, e.prototype.forEachInvertedInner = function(i, r, s, o) {
    var l = this.left.length;
    if (r > l && this.right.forEachInvertedInner(i, r - l, Math.max(s, l) - l, o + l) === !1 || s < l && this.left.forEachInvertedInner(i, Math.min(r, l), s, o) === !1)
      return !1;
  }, e.prototype.sliceInner = function(i, r) {
    if (i == 0 && r == this.length)
      return this;
    var s = this.left.length;
    return r <= s ? this.left.slice(i, r) : i >= s ? this.right.slice(i - s, r - s) : this.left.slice(i, s).append(this.right.slice(0, r - s));
  }, e.prototype.leafAppend = function(i) {
    var r = this.right.leafAppend(i);
    if (r)
      return new e(this.left, r);
  }, e.prototype.leafPrepend = function(i) {
    var r = this.left.leafPrepend(i);
    if (r)
      return new e(r, this.right);
  }, e.prototype.appendInner = function(i) {
    return this.left.depth >= Math.max(this.right.depth, i.depth) + 1 ? new e(this.left, new e(this.right, i)) : new e(this, i);
  }, e;
})(X);
const Rm = 500;
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
    let r, s;
    t && (r = this.remapping(i, this.items.length), s = r.maps.length);
    let o = e.tr, l, a, c = [], d = [];
    return this.items.forEach((u, p) => {
      if (!u.step) {
        r || (r = this.remapping(i, p + 1), s = r.maps.length), s--, d.push(u);
        return;
      }
      if (r) {
        d.push(new Ae(u.map));
        let h = u.step.map(r.slice(s)), f;
        h && o.maybeStep(h).doc && (f = o.mapping.maps[o.mapping.maps.length - 1], c.push(new Ae(f, void 0, void 0, c.length + d.length))), s--, f && r.appendMap(f, s);
      } else
        o.maybeStep(u.step);
      if (u.selection)
        return l = r ? u.selection.map(r.slice(s)) : u.selection, a = new Me(this.items.slice(0, i).append(d.reverse().concat(c)), this.eventCount - 1), !1;
    }, this.items.length, 0), { remaining: a, transform: o, selection: l };
  }
  // Create a new branch with the given transform added.
  addTransform(e, t, i, r) {
    let s = [], o = this.eventCount, l = this.items, a = !r && l.length ? l.get(l.length - 1) : null;
    for (let d = 0; d < e.steps.length; d++) {
      let u = e.steps[d].invert(e.docs[d]), p = new Ae(e.mapping.maps[d], u, t), h;
      (h = a && a.merge(p)) && (p = h, d ? s.pop() : l = l.slice(0, l.length - 1)), s.push(p), t && (o++, t = void 0), r || (a = p);
    }
    let c = o - i.depth;
    return c > Dm && (l = Im(l, c), o -= c), new Me(l.append(s), o);
  }
  remapping(e, t) {
    let i = new wn();
    return this.items.forEach((r, s) => {
      let o = r.mirrorOffset != null && s - r.mirrorOffset >= e ? i.maps.length - r.mirrorOffset : void 0;
      i.appendMap(r.map, o);
    }, e, t), i;
  }
  addMaps(e) {
    return this.eventCount == 0 ? this : new Me(this.items.append(e.map((t) => new Ae(t))), this.eventCount);
  }
  // When the collab module receives remote changes, the history has
  // to know about those, so that it can adjust the steps that were
  // rebased on top of the remote changes, and include the position
  // maps for the remote changes in its array of items.
  rebased(e, t) {
    if (!this.eventCount)
      return this;
    let i = [], r = Math.max(0, this.items.length - t), s = e.mapping, o = e.steps.length, l = this.eventCount;
    this.items.forEach((p) => {
      p.selection && l--;
    }, r);
    let a = t;
    this.items.forEach((p) => {
      let h = s.getMirror(--a);
      if (h == null)
        return;
      o = Math.min(o, h);
      let f = s.maps[h];
      if (p.step) {
        let m = e.steps[h].invert(e.docs[h]), g = p.selection && p.selection.map(s.slice(a + 1, h));
        g && l++, i.push(new Ae(f, m, g));
      } else
        i.push(new Ae(f));
    }, r);
    let c = [];
    for (let p = t; p < o; p++)
      c.push(new Ae(s.maps[p]));
    let d = this.items.slice(0, r).append(c).append(i), u = new Me(d, l);
    return u.emptyItemCount() > Rm && (u = u.compress(this.items.length - i.length)), u;
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
    let t = this.remapping(0, e), i = t.maps.length, r = [], s = 0;
    return this.items.forEach((o, l) => {
      if (l >= e)
        r.push(o), o.selection && s++;
      else if (o.step) {
        let a = o.step.map(t.slice(i)), c = a && a.getMap();
        if (i--, c && t.appendMap(c, i), a) {
          let d = o.selection && o.selection.map(t.slice(i));
          d && s++;
          let u = new Ae(c.invert(), a, d), p, h = r.length - 1;
          (p = r.length && r[h].merge(u)) ? r[h] = p : r.push(u);
        }
      } else o.map && i--;
    }, this.items.length, 0), new Me(X.from(r.reverse()), s);
  }
}
Me.empty = new Me(X.empty, 0);
function Im(n, e) {
  let t;
  return n.forEach((i, r) => {
    if (i.selection && e-- == 0)
      return t = r, !1;
  }), n.slice(t);
}
class Ae {
  constructor(e, t, i, r) {
    this.map = e, this.step = t, this.selection = i, this.mirrorOffset = r;
  }
  merge(e) {
    if (this.step && e.step && !e.selection) {
      let t = e.step.merge(this.step);
      if (t)
        return new Ae(t.getMap().invert(), t, this.selection);
    }
  }
}
class Ye {
  constructor(e, t, i, r, s) {
    this.done = e, this.undone = t, this.prevRanges = i, this.prevTime = r, this.prevComposition = s;
  }
}
const Dm = 20;
function Pm(n, e, t, i) {
  let r = t.getMeta(Et), s;
  if (r)
    return r.historyState;
  t.getMeta(zm) && (n = new Ye(n.done, n.undone, null, 0, -1));
  let o = t.getMeta("appendedTransaction");
  if (t.steps.length == 0)
    return n;
  if (o && o.getMeta(Et))
    return o.getMeta(Et).redo ? new Ye(n.done.addTransform(t, void 0, i, ni(e)), n.undone, bl(t.mapping.maps), n.prevTime, n.prevComposition) : new Ye(n.done, n.undone.addTransform(t, void 0, i, ni(e)), null, n.prevTime, n.prevComposition);
  if (t.getMeta("addToHistory") !== !1 && !(o && o.getMeta("addToHistory") === !1)) {
    let l = t.getMeta("composition"), a = n.prevTime == 0 || !o && n.prevComposition != l && (n.prevTime < (t.time || 0) - i.newGroupDelay || !Bm(t, n.prevRanges)), c = o ? Nr(n.prevRanges, t.mapping) : bl(t.mapping.maps);
    return new Ye(n.done.addTransform(t, a ? e.selection.getBookmark() : void 0, i, ni(e)), Me.empty, c, t.time, l ?? n.prevComposition);
  } else return (s = t.getMeta("rebased")) ? new Ye(n.done.rebased(t, s), n.undone.rebased(t, s), Nr(n.prevRanges, t.mapping), n.prevTime, n.prevComposition) : new Ye(n.done.addMaps(t.mapping.maps), n.undone.addMaps(t.mapping.maps), Nr(n.prevRanges, t.mapping), n.prevTime, n.prevComposition);
}
function Bm(n, e) {
  if (!e)
    return !1;
  if (!n.docChanged)
    return !0;
  let t = !1;
  return n.mapping.maps[0].forEach((i, r) => {
    for (let s = 0; s < e.length; s += 2)
      i <= e[s + 1] && r >= e[s] && (t = !0);
  }), t;
}
function bl(n) {
  let e = [];
  for (let t = n.length - 1; t >= 0 && e.length == 0; t--)
    n[t].forEach((i, r, s, o) => e.push(s, o));
  return e;
}
function Nr(n, e) {
  if (!n)
    return null;
  let t = [];
  for (let i = 0; i < n.length; i += 2) {
    let r = e.map(n[i], 1), s = e.map(n[i + 1], -1);
    r <= s && t.push(r, s);
  }
  return t;
}
function Hm(n, e, t) {
  let i = ni(e), r = Et.get(e).spec.config, s = (t ? n.undone : n.done).popEvent(e, i);
  if (!s)
    return null;
  let o = s.selection.resolve(s.transform.doc), l = (t ? n.done : n.undone).addTransform(s.transform, e.selection.getBookmark(), r, i), a = new Ye(t ? l : s.remaining, t ? s.remaining : l, null, 0, -1);
  return s.transform.setSelection(o).setMeta(Et, { redo: t, historyState: a });
}
let _r = !1, yl = null;
function ni(n) {
  let e = n.plugins;
  if (yl != e) {
    _r = !1, yl = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].spec.historyPreserveItems) {
        _r = !0;
        break;
      }
  }
  return _r;
}
const Et = new J("history"), zm = new J("closeHistory");
function $m(n = {}) {
  return n = {
    depth: n.depth || 100,
    newGroupDelay: n.newGroupDelay || 500
  }, new U({
    key: Et,
    state: {
      init() {
        return new Ye(Me.empty, Me.empty, null, 0, -1);
      },
      apply(e, t, i) {
        return Pm(t, i, e, n);
      }
    },
    config: n,
    props: {
      handleDOMEvents: {
        beforeinput(e, t) {
          let i = t.inputType, r = i == "historyUndo" ? Dc : i == "historyRedo" ? Pc : null;
          return !r || !e.editable ? !1 : (t.preventDefault(), r(e.state, e.dispatch));
        }
      }
    }
  });
}
function Ic(n, e) {
  return (t, i) => {
    let r = Et.getState(t);
    if (!r || (n ? r.undone : r.done).eventCount == 0)
      return !1;
    if (i) {
      let s = Hm(r, t, n);
      s && i(e ? s.scrollIntoView() : s);
    }
    return !0;
  };
}
const Dc = Ic(!1, !0), Pc = Ic(!0, !0), Fm = K.create({
  name: "history",
  addOptions() {
    return {
      depth: 100,
      newGroupDelay: 500
    };
  },
  addCommands() {
    return {
      undo: () => ({ state: n, dispatch: e }) => Dc(n, e),
      redo: () => ({ state: n, dispatch: e }) => Pc(n, e)
    };
  },
  addProseMirrorPlugins() {
    return [
      $m(this.options)
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
}), qm = B.create({
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
        if (!tm(e, e.schema.nodes[this.name]))
          return !1;
        const { selection: t } = e, { $from: i, $to: r } = t, s = n();
        return i.parentOffset === 0 ? s.insertContentAt({
          from: Math.max(i.pos - 1, 0),
          to: r.pos
        }, {
          type: this.name
        }) : Sf(t) ? s.insertContentAt(r.pos, {
          type: this.name
        }) : s.insertContent({ type: this.name }), s.command(({ tr: o, dispatch: l }) => {
          var a;
          if (l) {
            const { $to: c } = o.selection, d = c.end();
            if (c.nodeAfter)
              c.nodeAfter.isTextblock ? o.setSelection(N.create(o.doc, c.pos + 1)) : c.nodeAfter.isBlock ? o.setSelection(T.create(o.doc, c.pos)) : o.setSelection(N.create(o.doc, c.pos));
            else {
              const u = (a = c.parent.type.contentMatch.defaultType) === null || a === void 0 ? void 0 : a.create();
              u && (o.insert(d, u), o.setSelection(N.create(o.doc, d + 1)));
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
      em({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type
      })
    ];
  }
}), Vm = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, Wm = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, Um = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, jm = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, Km = fe.create({
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
      Ot({
        find: Vm,
        type: this.type
      }),
      Ot({
        find: Um,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: Wm,
        type: this.type
      }),
      dt({
        find: jm,
        type: this.type
      })
    ];
  }
}), Jm = B.create({
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
}), Gm = "listItem", kl = "textStyle", wl = /^(\d+)\.\s$/, Ym = B.create({
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
      toggleOrderedList: () => ({ commands: n, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(Gm, this.editor.getAttributes(kl)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.commands.toggleOrderedList()
    };
  },
  addInputRules() {
    let n = An({
      find: wl,
      type: this.type,
      getAttributes: (e) => ({ start: +e[1] }),
      joinPredicate: (e, t) => t.childCount + t.attrs.start === +e[1]
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = An({
      find: wl,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: (e) => ({ start: +e[1], ...this.editor.getAttributes(kl) }),
      joinPredicate: (e, t) => t.childCount + t.attrs.start === +e[1],
      editor: this.editor
    })), [
      n
    ];
  }
}), Xm = B.create({
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
}), Qm = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/, Zm = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g, eg = fe.create({
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
      Ot({
        find: Qm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: Zm,
        type: this.type
      })
    ];
  }
}), tg = B.create({
  name: "text",
  group: "inline"
}), ng = K.create({
  name: "starterKit",
  addExtensions() {
    const n = [];
    return this.options.bold !== !1 && n.push(cm.configure(this.options.bold)), this.options.blockquote !== !1 && n.push(rm.configure(this.options.blockquote)), this.options.bulletList !== !1 && n.push(um.configure(this.options.bulletList)), this.options.code !== !1 && n.push(fm.configure(this.options.code)), this.options.codeBlock !== !1 && n.push(bm.configure(this.options.codeBlock)), this.options.document !== !1 && n.push(ym.configure(this.options.document)), this.options.dropcursor !== !1 && n.push(vm.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && n.push(Nm.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && n.push(_m.configure(this.options.hardBreak)), this.options.heading !== !1 && n.push(Om.configure(this.options.heading)), this.options.history !== !1 && n.push(Fm.configure(this.options.history)), this.options.horizontalRule !== !1 && n.push(qm.configure(this.options.horizontalRule)), this.options.italic !== !1 && n.push(Km.configure(this.options.italic)), this.options.listItem !== !1 && n.push(Jm.configure(this.options.listItem)), this.options.orderedList !== !1 && n.push(Ym.configure(this.options.orderedList)), this.options.paragraph !== !1 && n.push(Xm.configure(this.options.paragraph)), this.options.strike !== !1 && n.push(eg.configure(this.options.strike)), this.options.text !== !1 && n.push(tg.configure(this.options.text)), n;
  }
}), ig = fe.create({
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
}), rg = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", sg = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", as = "numeric", cs = "ascii", ds = "alpha", un = "asciinumeric", on = "alphanumeric", us = "domain", Bc = "emoji", og = "scheme", lg = "slashscheme", Or = "whitespace";
function ag(n, e) {
  return n in e || (e[n] = []), e[n];
}
function vt(n, e, t) {
  e[as] && (e[un] = !0, e[on] = !0), e[cs] && (e[un] = !0, e[ds] = !0), e[un] && (e[on] = !0), e[ds] && (e[on] = !0), e[on] && (e[us] = !0), e[Bc] && (e[us] = !0);
  for (const i in e) {
    const r = ag(i, t);
    r.indexOf(n) < 0 && r.push(n);
  }
}
function cg(n, e) {
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
      const r = e.jr[i][0], s = e.jr[i][1];
      if (s && r.test(n))
        return s;
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
    for (let r = 0; r < n.length; r++)
      this.tt(n[r], e, t, i);
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
    let r;
    return e && e.j ? r = e : (r = new pe(e), t && i && vt(e, t, i)), this.jr.push([n, r]), r;
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
    let r = this;
    const s = n.length;
    if (!s)
      return r;
    for (let o = 0; o < s - 1; o++)
      r = r.tt(n[o]);
    return r.tt(n[s - 1], e, t, i);
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
    const r = this;
    if (e && e.j)
      return r.j[n] = e, e;
    const s = e;
    let o, l = r.go(n);
    if (l ? (o = new pe(), Object.assign(o.j, l.j), o.jr.push.apply(o.jr, l.jr), o.jd = l.jd, o.t = l.t) : o = new pe(), s) {
      if (i)
        if (o.t && typeof o.t == "string") {
          const a = Object.assign(cg(o.t, i), t);
          vt(s, a, i);
        } else t && vt(s, t, i);
      o.t = s;
    }
    return r.j[n] = o, o;
  }
};
const L = (n, e, t, i, r) => n.ta(e, t, i, r), q = (n, e, t, i, r) => n.tr(e, t, i, r), vl = (n, e, t, i, r) => n.ts(e, t, i, r), v = (n, e, t, i, r) => n.tt(e, t, i, r), Fe = "WORD", ps = "UWORD", Hc = "ASCIINUMERICAL", zc = "ALPHANUMERICAL", Tn = "LOCALHOST", hs = "TLD", fs = "UTLD", ii = "SCHEME", $t = "SLASH_SCHEME", Ys = "NUM", ms = "WS", Xs = "NL", pn = "OPENBRACE", hn = "CLOSEBRACE", wi = "OPENBRACKET", vi = "CLOSEBRACKET", Si = "OPENPAREN", xi = "CLOSEPAREN", Ci = "OPENANGLEBRACKET", Mi = "CLOSEANGLEBRACKET", Ei = "FULLWIDTHLEFTPAREN", Ai = "FULLWIDTHRIGHTPAREN", Ti = "LEFTCORNERBRACKET", Ni = "RIGHTCORNERBRACKET", _i = "LEFTWHITECORNERBRACKET", Oi = "RIGHTWHITECORNERBRACKET", Li = "FULLWIDTHLESSTHAN", Ri = "FULLWIDTHGREATERTHAN", Ii = "AMPERSAND", Di = "APOSTROPHE", Pi = "ASTERISK", Xe = "AT", Bi = "BACKSLASH", Hi = "BACKTICK", zi = "CARET", Ze = "COLON", Qs = "COMMA", $i = "DOLLAR", Te = "DOT", Fi = "EQUALS", Zs = "EXCLAMATION", ke = "HYPHEN", fn = "PERCENT", qi = "PIPE", Vi = "PLUS", Wi = "POUND", mn = "QUERY", eo = "QUOTE", $c = "FULLWIDTHMIDDLEDOT", to = "SEMI", Ne = "SLASH", gn = "TILDE", Ui = "UNDERSCORE", Fc = "EMOJI", ji = "SYM";
var qc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ALPHANUMERICAL: zc,
  AMPERSAND: Ii,
  APOSTROPHE: Di,
  ASCIINUMERICAL: Hc,
  ASTERISK: Pi,
  AT: Xe,
  BACKSLASH: Bi,
  BACKTICK: Hi,
  CARET: zi,
  CLOSEANGLEBRACKET: Mi,
  CLOSEBRACE: hn,
  CLOSEBRACKET: vi,
  CLOSEPAREN: xi,
  COLON: Ze,
  COMMA: Qs,
  DOLLAR: $i,
  DOT: Te,
  EMOJI: Fc,
  EQUALS: Fi,
  EXCLAMATION: Zs,
  FULLWIDTHGREATERTHAN: Ri,
  FULLWIDTHLEFTPAREN: Ei,
  FULLWIDTHLESSTHAN: Li,
  FULLWIDTHMIDDLEDOT: $c,
  FULLWIDTHRIGHTPAREN: Ai,
  HYPHEN: ke,
  LEFTCORNERBRACKET: Ti,
  LEFTWHITECORNERBRACKET: _i,
  LOCALHOST: Tn,
  NL: Xs,
  NUM: Ys,
  OPENANGLEBRACKET: Ci,
  OPENBRACE: pn,
  OPENBRACKET: wi,
  OPENPAREN: Si,
  PERCENT: fn,
  PIPE: qi,
  PLUS: Vi,
  POUND: Wi,
  QUERY: mn,
  QUOTE: eo,
  RIGHTCORNERBRACKET: Ni,
  RIGHTWHITECORNERBRACKET: Oi,
  SCHEME: ii,
  SEMI: to,
  SLASH: Ne,
  SLASH_SCHEME: $t,
  SYM: ji,
  TILDE: gn,
  TLD: hs,
  UNDERSCORE: Ui,
  UTLD: fs,
  UWORD: ps,
  WORD: Fe,
  WS: ms
});
const ze = /[a-z]/, Zt = new RegExp("\\p{L}", "u"), Lr = new RegExp("\\p{Emoji}", "u"), $e = /\d/, Rr = /\s/, Sl = "\r", Ir = `
`, dg = "️", ug = "‍", Dr = "￼";
let Wn = null, Un = null;
function pg(n = []) {
  const e = {};
  pe.groups = e;
  const t = new pe();
  Wn == null && (Wn = xl(rg)), Un == null && (Un = xl(sg)), v(t, "'", Di), v(t, "{", pn), v(t, "}", hn), v(t, "[", wi), v(t, "]", vi), v(t, "(", Si), v(t, ")", xi), v(t, "<", Ci), v(t, ">", Mi), v(t, "（", Ei), v(t, "）", Ai), v(t, "「", Ti), v(t, "」", Ni), v(t, "『", _i), v(t, "』", Oi), v(t, "＜", Li), v(t, "＞", Ri), v(t, "&", Ii), v(t, "*", Pi), v(t, "@", Xe), v(t, "`", Hi), v(t, "^", zi), v(t, ":", Ze), v(t, ",", Qs), v(t, "$", $i), v(t, ".", Te), v(t, "=", Fi), v(t, "!", Zs), v(t, "-", ke), v(t, "%", fn), v(t, "|", qi), v(t, "+", Vi), v(t, "#", Wi), v(t, "?", mn), v(t, '"', eo), v(t, "/", Ne), v(t, ";", to), v(t, "~", gn), v(t, "_", Ui), v(t, "\\", Bi), v(t, "・", $c);
  const i = q(t, $e, Ys, {
    [as]: !0
  });
  q(i, $e, i);
  const r = q(i, ze, Hc, {
    [un]: !0
  }), s = q(i, Zt, zc, {
    [on]: !0
  }), o = q(t, ze, Fe, {
    [cs]: !0
  });
  q(o, $e, r), q(o, ze, o), q(r, $e, r), q(r, ze, r);
  const l = q(t, Zt, ps, {
    [ds]: !0
  });
  q(l, ze), q(l, $e, s), q(l, Zt, l), q(s, $e, s), q(s, ze), q(s, Zt, s);
  const a = v(t, Ir, Xs, {
    [Or]: !0
  }), c = v(t, Sl, ms, {
    [Or]: !0
  }), d = q(t, Rr, ms, {
    [Or]: !0
  });
  v(t, Dr, d), v(c, Ir, a), v(c, Dr, d), q(c, Rr, d), v(d, Sl), v(d, Ir), q(d, Rr, d), v(d, Dr, d);
  const u = q(t, Lr, Fc, {
    [Bc]: !0
  });
  v(u, "#"), q(u, Lr, u), v(u, dg, u);
  const p = v(u, ug);
  v(p, "#"), q(p, Lr, u);
  const h = [[ze, o], [$e, r]], f = [[ze, null], [Zt, l], [$e, s]];
  for (let m = 0; m < Wn.length; m++)
    Ke(t, Wn[m], hs, Fe, h);
  for (let m = 0; m < Un.length; m++)
    Ke(t, Un[m], fs, ps, f);
  vt(hs, {
    tld: !0,
    ascii: !0
  }, e), vt(fs, {
    utld: !0,
    alpha: !0
  }, e), Ke(t, "file", ii, Fe, h), Ke(t, "mailto", ii, Fe, h), Ke(t, "http", $t, Fe, h), Ke(t, "https", $t, Fe, h), Ke(t, "ftp", $t, Fe, h), Ke(t, "ftps", $t, Fe, h), vt(ii, {
    scheme: !0,
    ascii: !0
  }, e), vt($t, {
    slashscheme: !0,
    ascii: !0
  }, e), n = n.sort((m, g) => m[0] > g[0] ? 1 : -1);
  for (let m = 0; m < n.length; m++) {
    const g = n[m][0], k = n[m][1] ? {
      [og]: !0
    } : {
      [lg]: !0
    };
    g.indexOf("-") >= 0 ? k[us] = !0 : ze.test(g) ? $e.test(g) ? k[un] = !0 : k[cs] = !0 : k[as] = !0, vl(t, g, g, k);
  }
  return vl(t, "localhost", Tn, {
    ascii: !0
  }), t.jd = new pe(ji), {
    start: t,
    tokens: Object.assign({
      groups: e
    }, qc)
  };
}
function Vc(n, e) {
  const t = hg(e.replace(/[A-Z]/g, (l) => l.toLowerCase())), i = t.length, r = [];
  let s = 0, o = 0;
  for (; o < i; ) {
    let l = n, a = null, c = 0, d = null, u = -1, p = -1;
    for (; o < i && (a = l.go(t[o])); )
      l = a, l.accepts() ? (u = 0, p = 0, d = l) : u >= 0 && (u += t[o].length, p++), c += t[o].length, s += t[o].length, o++;
    s -= u, o -= p, c -= u, r.push({
      t: d.t,
      // token type/name
      v: e.slice(s - c, s),
      // string value
      s: s - c,
      // start index
      e: s
      // end index (excluding)
    });
  }
  return r;
}
function hg(n) {
  const e = [], t = n.length;
  let i = 0;
  for (; i < t; ) {
    let r = n.charCodeAt(i), s, o = r < 55296 || r > 56319 || i + 1 === t || (s = n.charCodeAt(i + 1)) < 56320 || s > 57343 ? n[i] : n.slice(i, i + 2);
    e.push(o), i += o.length;
  }
  return e;
}
function Ke(n, e, t, i, r) {
  let s;
  const o = e.length;
  for (let l = 0; l < o - 1; l++) {
    const a = e[l];
    n.j[a] ? s = n.j[a] : (s = new pe(i), s.jr = r.slice(), n.j[a] = s), n = s;
  }
  return s = new pe(t), s.jr = r.slice(), n.j[e[o - 1]] = s, s;
}
function xl(n) {
  const e = [], t = [];
  let i = 0, r = "0123456789";
  for (; i < n.length; ) {
    let s = 0;
    for (; r.indexOf(n[i + s]) >= 0; )
      s++;
    if (s > 0) {
      e.push(t.join(""));
      for (let o = parseInt(n.substring(i, i + s), 10); o > 0; o--)
        t.pop();
      i += s;
    } else
      t.push(n[i]), i++;
  }
  return e;
}
const Nn = {
  defaultProtocol: "http",
  events: null,
  format: Cl,
  formatHref: Cl,
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
function no(n, e = null) {
  let t = Object.assign({}, Nn);
  n && (t = Object.assign(t, n instanceof no ? n.o : n));
  const i = t.ignoreTags, r = [];
  for (let s = 0; s < i.length; s++)
    r.push(i[s].toUpperCase());
  this.o = t, e && (this.defaultRender = e), this.ignoreTags = r;
}
no.prototype = {
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
  get(n, e, t) {
    const i = e != null;
    let r = this.o[n];
    return r && (typeof r == "object" ? (r = t.t in r ? r[t.t] : Nn[n], typeof r == "function" && i && (r = r(e, t))) : typeof r == "function" && i && (r = r(e, t.t, t)), r);
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
function Cl(n) {
  return n;
}
function Wc(n, e) {
  this.t = "token", this.v = n, this.tk = e;
}
Wc.prototype = {
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
    const e = this, t = this.toHref(n.get("defaultProtocol")), i = n.get("formatHref", t, this), r = n.get("tagName", t, e), s = this.toFormattedString(n), o = {}, l = n.get("className", t, e), a = n.get("target", t, e), c = n.get("rel", t, e), d = n.getObj("attributes", t, e), u = n.getObj("events", t, e);
    return o.href = i, l && (o.class = l), a && (o.target = a), c && (o.rel = c), d && Object.assign(o, d), {
      tagName: r,
      attributes: o,
      content: s,
      eventListeners: u
    };
  }
};
function lr(n, e) {
  class t extends Wc {
    constructor(r, s) {
      super(r, s), this.t = n;
    }
  }
  for (const i in e)
    t.prototype[i] = e[i];
  return t.t = n, t;
}
const Ml = lr("email", {
  isLink: !0,
  toHref() {
    return "mailto:" + this.toString();
  }
}), El = lr("text"), fg = lr("nl"), jn = lr("url", {
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
    return n.length >= 2 && n[0].t !== Tn && n[1].t === Ze;
  }
}), ye = (n) => new pe(n);
function mg({
  groups: n
}) {
  const e = n.domain.concat([Ii, Pi, Xe, Bi, Hi, zi, $i, Fi, ke, Ys, fn, qi, Vi, Wi, Ne, ji, gn, Ui]), t = [Di, Ze, Qs, Te, Zs, fn, mn, eo, to, Ci, Mi, pn, hn, vi, wi, Si, xi, Ei, Ai, Ti, Ni, _i, Oi, Li, Ri], i = [Ii, Di, Pi, Bi, Hi, zi, $i, Fi, ke, pn, hn, fn, qi, Vi, Wi, mn, Ne, ji, gn, Ui], r = ye(), s = v(r, gn);
  L(s, i, s), L(s, n.domain, s);
  const o = ye(), l = ye(), a = ye();
  L(r, n.domain, o), L(r, n.scheme, l), L(r, n.slashscheme, a), L(o, i, s), L(o, n.domain, o);
  const c = v(o, Xe);
  v(s, Xe, c), v(l, Xe, c), v(a, Xe, c);
  const d = v(s, Te);
  L(d, i, s), L(d, n.domain, s);
  const u = ye();
  L(c, n.domain, u), L(u, n.domain, u);
  const p = v(u, Te);
  L(p, n.domain, u);
  const h = ye(Ml);
  L(p, n.tld, h), L(p, n.utld, h), v(c, Tn, h);
  const f = v(u, ke);
  v(f, ke, f), L(f, n.domain, u), L(h, n.domain, u), v(h, Te, p), v(h, ke, f);
  const m = v(h, Ze);
  L(m, n.numeric, Ml);
  const g = v(o, ke), b = v(o, Te);
  v(g, ke, g), L(g, n.domain, o), L(b, i, s), L(b, n.domain, o);
  const k = ye(jn);
  L(b, n.tld, k), L(b, n.utld, k), L(k, n.domain, o), L(k, i, s), v(k, Te, b), v(k, ke, g), v(k, Xe, c);
  const w = v(k, Ze), M = ye(jn);
  L(w, n.numeric, M);
  const S = ye(jn), O = ye();
  L(S, e, S), L(S, t, O), L(O, e, S), L(O, t, O), v(k, Ne, S), v(M, Ne, S);
  const C = v(l, Ze), A = v(a, Ze), I = v(A, Ne), Ce = v(I, Ne);
  L(l, n.domain, o), v(l, Te, b), v(l, ke, g), L(a, n.domain, o), v(a, Te, b), v(a, ke, g), L(C, n.domain, S), v(C, Ne, S), v(C, mn, S), L(Ce, n.domain, S), L(Ce, e, S), v(Ce, Ne, S);
  const Ie = [
    [pn, hn],
    // {}
    [wi, vi],
    // []
    [Si, xi],
    // ()
    [Ci, Mi],
    // <>
    [Ei, Ai],
    // （）
    [Ti, Ni],
    // 「」
    [_i, Oi],
    // 『』
    [Li, Ri]
    // ＜＞
  ];
  for (let H = 0; H < Ie.length; H++) {
    const [ce, De] = Ie[H], ft = v(S, ce);
    v(O, ce, ft), v(ft, De, S);
    const Pe = ye(jn);
    L(ft, e, Pe);
    const Be = ye();
    L(ft, t), L(Pe, e, Pe), L(Pe, t, Be), L(Be, e, Pe), L(Be, t, Be), v(Pe, De, S), v(Be, De, S);
  }
  return v(r, Tn, k), v(r, Xs, fg), {
    start: r,
    tokens: qc
  };
}
function gg(n, e, t) {
  let i = t.length, r = 0, s = [], o = [];
  for (; r < i; ) {
    let l = n, a = null, c = null, d = 0, u = null, p = -1;
    for (; r < i && !(a = l.go(t[r].t)); )
      o.push(t[r++]);
    for (; r < i && (c = a || l.go(t[r].t)); )
      a = null, l = c, l.accepts() ? (p = 0, u = l) : p >= 0 && p++, r++, d++;
    if (p < 0)
      r -= d, r < i && (o.push(t[r]), r++);
    else {
      o.length > 0 && (s.push(Pr(El, e, o)), o = []), r -= p, d -= p;
      const h = u.t, f = t.slice(r - d, r);
      s.push(Pr(h, e, f));
    }
  }
  return o.length > 0 && s.push(Pr(El, e, o)), s;
}
function Pr(n, e, t) {
  const i = t[0].s, r = t[t.length - 1].e, s = e.slice(i, r);
  return new n(s, t);
}
const bg = typeof console < "u" && console && console.warn || (() => {
}), yg = "until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.", $ = {
  scanner: null,
  parser: null,
  tokenQueue: [],
  pluginQueue: [],
  customSchemes: [],
  initialized: !1
};
function kg() {
  return pe.groups = {}, $.scanner = null, $.parser = null, $.tokenQueue = [], $.pluginQueue = [], $.customSchemes = [], $.initialized = !1, $;
}
function Al(n, e = !1) {
  if ($.initialized && bg(`linkifyjs: already initialized - will not register custom scheme "${n}" ${yg}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(n))
    throw new Error(`linkifyjs: incorrect scheme format.
1. Must only contain digits, lowercase ASCII letters or "-"
2. Cannot start or end with "-"
3. "-" cannot repeat`);
  $.customSchemes.push([n, e]);
}
function wg() {
  $.scanner = pg($.customSchemes);
  for (let n = 0; n < $.tokenQueue.length; n++)
    $.tokenQueue[n][1]({
      scanner: $.scanner
    });
  $.parser = mg($.scanner.tokens);
  for (let n = 0; n < $.pluginQueue.length; n++)
    $.pluginQueue[n][1]({
      scanner: $.scanner,
      parser: $.parser
    });
  return $.initialized = !0, $;
}
function io(n) {
  return $.initialized || wg(), gg($.parser.start, n, Vc($.scanner.start, n));
}
io.scan = Vc;
function Uc(n, e = null, t = null) {
  if (e && typeof e == "object") {
    if (t)
      throw Error(`linkifyjs: Invalid link type ${e}; must be a string`);
    t = e, e = null;
  }
  const i = new no(t), r = io(n), s = [];
  for (let o = 0; o < r.length; o++) {
    const l = r[o];
    l.isLink && (!e || l.t === e) && i.check(l) && s.push(l.toFormattedObject(i));
  }
  return s;
}
const ro = "[\0-   ᠎ -\u2029 　]", vg = new RegExp(ro), Sg = new RegExp(`${ro}$`), xg = new RegExp(ro, "g");
function Cg(n) {
  return n.length === 1 ? n[0].isLink : n.length === 3 && n[1].isLink ? ["()", "[]"].includes(n[0].value + n[2].value) : !1;
}
function Mg(n) {
  return new U({
    key: new J("autolink"),
    appendTransaction: (e, t, i) => {
      const r = e.some((c) => c.docChanged) && !t.doc.eq(i.doc), s = e.some((c) => c.getMeta("preventAutolink"));
      if (!r || s)
        return;
      const { tr: o } = i, l = hf(t.doc, [...e]);
      if (wf(l).forEach(({ newRange: c }) => {
        const d = mf(i.doc, c, (h) => h.isTextblock);
        let u, p;
        if (d.length > 1)
          u = d[0], p = i.doc.textBetween(u.pos, u.pos + u.node.nodeSize, void 0, " ");
        else if (d.length) {
          const h = i.doc.textBetween(c.from, c.to, " ", " ");
          if (!Sg.test(h))
            return;
          u = d[0], p = i.doc.textBetween(u.pos, c.to, void 0, " ");
        }
        if (u && p) {
          const h = p.split(vg).filter(Boolean);
          if (h.length <= 0)
            return !1;
          const f = h[h.length - 1], m = u.pos + p.lastIndexOf(f);
          if (!f)
            return !1;
          const g = io(f).map((b) => b.toObject(n.defaultProtocol));
          if (!Cg(g))
            return !1;
          g.filter((b) => b.isLink).map((b) => ({
            ...b,
            from: m + b.start + 1,
            to: m + b.end + 1
          })).filter((b) => i.schema.marks.code ? !i.doc.rangeHasMark(b.from, b.to, i.schema.marks.code) : !0).filter((b) => n.validate(b.value)).filter((b) => n.shouldAutoLink(b.value)).forEach((b) => {
            Js(b.from, b.to, i.doc).some((k) => k.mark.type === n.type) || o.addMark(b.from, b.to, n.type.create({
              href: b.href
            }));
          });
        }
      }), !!o.steps.length)
        return o;
    }
  });
}
function Eg(n) {
  return new U({
    key: new J("handleClickLink"),
    props: {
      handleClick: (e, t, i) => {
        var r, s;
        if (i.button !== 0 || !e.editable)
          return !1;
        let o = i.target;
        const l = [];
        for (; o.nodeName !== "DIV"; )
          l.push(o), o = o.parentNode;
        if (!l.find((p) => p.nodeName === "A"))
          return !1;
        const a = Oc(e.state, n.type.name), c = i.target, d = (r = c == null ? void 0 : c.href) !== null && r !== void 0 ? r : a.href, u = (s = c == null ? void 0 : c.target) !== null && s !== void 0 ? s : a.target;
        return c && d ? (window.open(d, u), !0) : !1;
      }
    }
  });
}
function Ag(n) {
  return new U({
    key: new J("handlePasteLink"),
    props: {
      handlePaste: (e, t, i) => {
        const { state: r } = e, { selection: s } = r, { empty: o } = s;
        if (o)
          return !1;
        let l = "";
        i.content.forEach((c) => {
          l += c.textContent;
        });
        const a = Uc(l, { defaultProtocol: n.defaultProtocol }).find((c) => c.isLink && c.value === l);
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
    const r = typeof i == "string" ? i : i.scheme;
    r && t.push(r);
  }), !n || n.replace(xg, "").match(new RegExp(
    // eslint-disable-next-line no-useless-escape
    `^(?:(?:${t.join("|")}):|[^a-z]|[a-z0-9+.-]+(?:[^a-z+.-:]|$))`,
    "i"
  ));
}
const Tg = fe.create({
  name: "link",
  priority: 1e3,
  keepOnSplit: !1,
  exitable: !0,
  onCreate() {
    this.options.validate && !this.options.shouldAutoLink && (this.options.shouldAutoLink = this.options.validate, console.warn("The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.")), this.options.protocols.forEach((n) => {
      if (typeof n == "string") {
        Al(n);
        return;
      }
      Al(n.scheme, n.optionalSlashes);
    });
  },
  onDestroy() {
    kg();
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
            const { protocols: t, defaultProtocol: i } = this.options, r = Uc(n).filter((s) => s.isLink && this.options.isAllowedUri(s.value, {
              defaultValidate: (o) => !!mt(o, t),
              protocols: t,
              defaultProtocol: i
            }));
            r.length && r.forEach((s) => e.push({
              text: s.value,
              data: {
                href: s.href
              },
              index: s.start
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
    return this.options.autolink && n.push(Mg({
      type: this.type,
      defaultProtocol: this.options.defaultProtocol,
      validate: (i) => this.options.isAllowedUri(i, {
        defaultValidate: (r) => !!mt(r, e),
        protocols: e,
        defaultProtocol: t
      }),
      shouldAutoLink: this.options.shouldAutoLink
    })), this.options.openOnClick === !0 && n.push(Eg({
      type: this.type
    })), this.options.linkOnPaste && n.push(Ag({
      editor: this.editor,
      defaultProtocol: this.options.defaultProtocol,
      type: this.type
    })), n;
  }
}), Ng = K.create({
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
}), _g = K.create({
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
      new U({
        key: new J("placeholder"),
        props: {
          decorations: ({ doc: n, selection: e }) => {
            const t = this.editor.isEditable || !this.options.showOnlyWhenEditable, { anchor: i } = e, r = [];
            if (!t)
              return null;
            const s = this.editor.isEmpty;
            return n.descendants((o, l) => {
              const a = i >= l && i <= l + o.nodeSize, c = !o.isLeaf && or(o);
              if ((a || !this.options.showOnlyCurrent) && c) {
                const d = [this.options.emptyNodeClass];
                s && d.push(this.options.emptyEditorClass);
                const u = re.node(l, l + o.nodeSize, {
                  class: d.join(" "),
                  "data-placeholder": typeof this.options.placeholder == "function" ? this.options.placeholder({
                    editor: this.editor,
                    node: o,
                    pos: l,
                    hasAnchor: a
                  }) : this.options.placeholder
                });
                r.push(u);
              }
              return this.options.includeChildren;
            }), F.create(n, r);
          }
        }
      })
    ];
  }
}), Og = K.create({
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
      new U({
        key: new J("characterCount"),
        appendTransaction: (e, t, i) => {
          if (n)
            return;
          const r = this.options.limit;
          if (r == null || r === 0) {
            n = !0;
            return;
          }
          const s = this.storage.characters({ node: i.doc });
          if (s > r) {
            const o = s - r, l = 0, a = o;
            console.warn(`[CharacterCount] Initial content exceeded limit of ${r} characters. Content was automatically trimmed.`);
            const c = i.tr.deleteRange(l, a);
            return n = !0, c;
          }
          n = !0;
        },
        filterTransaction: (e, t) => {
          const i = this.options.limit;
          if (!e.docChanged || i === 0 || i === null || i === void 0)
            return !0;
          const r = this.storage.characters({ node: t.doc }), s = this.storage.characters({ node: e.doc });
          if (s <= i || r > i && s > i && s <= r)
            return !0;
          if (r > i && s > i && s > r || !e.getMeta("paste"))
            return !1;
          const l = e.selection.$head.pos, a = s - i, c = l - a, d = l;
          return e.deleteRange(c, d), !(this.storage.characters({ node: e.doc }) > i);
        }
      })
    ];
  }
}), Lg = fe.create({
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
}), Rg = fe.create({
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
}), Ig = (n) => {
  if (!n.children.length)
    return;
  const e = n.querySelectorAll("span");
  e && e.forEach((t) => {
    var i, r;
    const s = t.getAttribute("style"), o = (r = (i = t.parentElement) === null || i === void 0 ? void 0 : i.closest("span")) === null || r === void 0 ? void 0 : r.getAttribute("style");
    t.setAttribute("style", `${o};${s}`);
  });
}, Dg = fe.create({
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
        getAttrs: (n) => n.hasAttribute("style") ? (this.options.mergeNestedSpanStyles && Ig(n), {}) : !1
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
          t.marks.filter((r) => r.type === this.type).some((r) => Object.values(r.attrs).some((s) => !!s)) || n.removeMark(i, i + t.nodeSize, this.type);
        }), !0;
      }
    };
  }
}), Pg = K.create({
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
}), Bg = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))$/, Hg = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))/g, zg = fe.create({
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
      Ot({
        find: Bg,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: Hg,
        type: this.type
      })
    ];
  }
});
let gs, bs;
if (typeof WeakMap < "u") {
  let n = /* @__PURE__ */ new WeakMap();
  gs = (e) => n.get(e), bs = (e, t) => (n.set(e, t), t);
} else {
  const n = [];
  let t = 0;
  gs = (i) => {
    for (let r = 0; r < n.length; r += 2) if (n[r] == i) return n[r + 1];
  }, bs = (i, r) => (t == 10 && (t = 0), n[t++] = i, n[t++] = r);
}
var W = class {
  constructor(n, e, t, i) {
    this.width = n, this.height = e, this.map = t, this.problems = i;
  }
  findCell(n) {
    for (let e = 0; e < this.map.length; e++) {
      const t = this.map[e];
      if (t != n) continue;
      const i = e % this.width, r = e / this.width | 0;
      let s = i + 1, o = r + 1;
      for (let l = 1; s < this.width && this.map[e + l] == t; l++) s++;
      for (let l = 1; o < this.height && this.map[e + this.width * l] == t; l++) o++;
      return {
        left: i,
        top: r,
        right: s,
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
    const { left: i, right: r, top: s, bottom: o } = this.findCell(n);
    return e == "horiz" ? (t < 0 ? i == 0 : r == this.width) ? null : this.map[s * this.width + (t < 0 ? i - 1 : r)] : (t < 0 ? s == 0 : o == this.height) ? null : this.map[i + this.width * (t < 0 ? s - 1 : o)];
  }
  rectBetween(n, e) {
    const { left: t, right: i, top: r, bottom: s } = this.findCell(n), { left: o, right: l, top: a, bottom: c } = this.findCell(e);
    return {
      left: Math.min(t, o),
      top: Math.min(r, a),
      right: Math.max(i, l),
      bottom: Math.max(s, c)
    };
  }
  cellsInRect(n) {
    const e = [], t = {};
    for (let i = n.top; i < n.bottom; i++) for (let r = n.left; r < n.right; r++) {
      const s = i * this.width + r, o = this.map[s];
      t[o] || (t[o] = !0, !(r == n.left && r && this.map[s - 1] == o || i == n.top && i && this.map[s - this.width] == o) && e.push(o));
    }
    return e;
  }
  positionAt(n, e, t) {
    for (let i = 0, r = 0; ; i++) {
      const s = r + t.child(i).nodeSize;
      if (i == n) {
        let o = e + n * this.width;
        const l = (n + 1) * this.width;
        for (; o < l && this.map[o] < r; ) o++;
        return o == l ? s - 1 : this.map[o];
      }
      r = s;
    }
  }
  static get(n) {
    return gs(n) || bs(n, $g(n));
  }
};
function $g(n) {
  if (n.type.spec.tableRole != "table") throw new RangeError("Not a table node: " + n.type.name);
  const e = Fg(n), t = n.childCount, i = [];
  let r = 0, s = null;
  const o = [];
  for (let c = 0, d = e * t; c < d; c++) i[c] = 0;
  for (let c = 0, d = 0; c < t; c++) {
    const u = n.child(c);
    d++;
    for (let f = 0; ; f++) {
      for (; r < i.length && i[r] != 0; ) r++;
      if (f == u.childCount) break;
      const m = u.child(f), { colspan: g, rowspan: b, colwidth: k } = m.attrs;
      for (let w = 0; w < b; w++) {
        if (w + c >= t) {
          (s || (s = [])).push({
            type: "overlong_rowspan",
            pos: d,
            n: b - w
          });
          break;
        }
        const M = r + w * e;
        for (let S = 0; S < g; S++) {
          i[M + S] == 0 ? i[M + S] = d : (s || (s = [])).push({
            type: "collision",
            row: c,
            pos: d,
            n: g - S
          });
          const O = k && k[S];
          if (O) {
            const C = (M + S) % e * 2, A = o[C];
            A == null || A != O && o[C + 1] == 1 ? (o[C] = O, o[C + 1] = 1) : A == O && o[C + 1]++;
          }
        }
      }
      r += g, d += m.nodeSize;
    }
    const p = (c + 1) * e;
    let h = 0;
    for (; r < p; ) i[r++] == 0 && h++;
    h && (s || (s = [])).push({
      type: "missing",
      row: c,
      n: h
    }), d++;
  }
  (e === 0 || t === 0) && (s || (s = [])).push({ type: "zero_sized" });
  const l = new W(e, t, i, s);
  let a = !1;
  for (let c = 0; !a && c < o.length; c += 2) o[c] != null && o[c + 1] < t && (a = !0);
  return a && qg(l, o, n), l;
}
function Fg(n) {
  let e = -1, t = !1;
  for (let i = 0; i < n.childCount; i++) {
    const r = n.child(i);
    let s = 0;
    if (t) for (let o = 0; o < i; o++) {
      const l = n.child(o);
      for (let a = 0; a < l.childCount; a++) {
        const c = l.child(a);
        o + c.attrs.rowspan > i && (s += c.attrs.colspan);
      }
    }
    for (let o = 0; o < r.childCount; o++) {
      const l = r.child(o);
      s += l.attrs.colspan, l.attrs.rowspan > 1 && (t = !0);
    }
    e == -1 ? e = s : e != s && (e = Math.max(e, s));
  }
  return e;
}
function qg(n, e, t) {
  n.problems || (n.problems = []);
  const i = {};
  for (let r = 0; r < n.map.length; r++) {
    const s = n.map[r];
    if (i[s]) continue;
    i[s] = !0;
    const o = t.nodeAt(s);
    if (!o) throw new RangeError(`No cell with offset ${s} found`);
    let l = null;
    const a = o.attrs;
    for (let c = 0; c < a.colspan; c++) {
      const d = e[(r + c) % n.width * 2];
      d != null && (!a.colwidth || a.colwidth[c] != d) && ((l || (l = Vg(a)))[c] = d);
    }
    l && n.problems.unshift({
      type: "colwidth mismatch",
      pos: s,
      colwidth: l
    });
  }
}
function Vg(n) {
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
      const i = n.nodes[t], r = i.spec.tableRole;
      r && (e[r] = i);
    }
  }
  return e;
}
const et = new J("selectingCells");
function Lt(n) {
  for (let e = n.depth - 1; e > 0; e--) if (n.node(e).type.spec.tableRole == "row") return n.node(0).resolve(n.before(e + 1));
  return null;
}
function Wg(n) {
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
function ar(n) {
  const e = n.selection;
  if ("$anchorCell" in e && e.$anchorCell) return e.$anchorCell.pos > e.$headCell.pos ? e.$anchorCell : e.$headCell;
  if ("node" in e && e.node && e.node.type.spec.tableRole == "cell") return e.$anchor;
  const t = Lt(e.$head) || Ug(e.$head);
  if (t) return t;
  throw new RangeError(`No cell found around position ${e.head}`);
}
function Ug(n) {
  for (let e = n.nodeAfter, t = n.pos; e; e = e.firstChild, t++) {
    const i = e.type.spec.tableRole;
    if (i == "cell" || i == "header_cell") return n.doc.resolve(t);
  }
  for (let e = n.nodeBefore, t = n.pos; e; e = e.lastChild, t--) {
    const i = e.type.spec.tableRole;
    if (i == "cell" || i == "header_cell") return n.doc.resolve(t - e.nodeSize);
  }
}
function ys(n) {
  return n.parent.type.spec.tableRole == "row" && !!n.nodeAfter;
}
function jg(n) {
  return n.node(0).resolve(n.pos + n.nodeAfter.nodeSize);
}
function so(n, e) {
  return n.depth == e.depth && n.pos >= e.start(-1) && n.pos <= e.end(-1);
}
function jc(n, e, t) {
  const i = n.node(-1), r = W.get(i), s = n.start(-1), o = r.nextCell(n.pos - s, e, t);
  return o == null ? null : n.node(0).resolve(s + o);
}
function Rt(n, e, t = 1) {
  const i = {
    ...n,
    colspan: n.colspan - t
  };
  return i.colwidth && (i.colwidth = i.colwidth.slice(), i.colwidth.splice(e, t), i.colwidth.some((r) => r > 0) || (i.colwidth = null)), i;
}
function Kc(n, e, t = 1) {
  const i = {
    ...n,
    colspan: n.colspan + t
  };
  if (i.colwidth) {
    i.colwidth = i.colwidth.slice();
    for (let r = 0; r < t; r++) i.colwidth.splice(e, 0, 0);
  }
  return i;
}
function Kg(n, e, t) {
  const i = le(e.type.schema).header_cell;
  for (let r = 0; r < n.height; r++) if (e.nodeAt(n.map[t + r * n.width]).type != i) return !1;
  return !0;
}
var z = class qe extends _ {
  constructor(e, t = e) {
    const i = e.node(-1), r = W.get(i), s = e.start(-1), o = r.rectBetween(e.pos - s, t.pos - s), l = e.node(0), a = r.cellsInRect(o).filter((d) => d != t.pos - s);
    a.unshift(t.pos - s);
    const c = a.map((d) => {
      const u = i.nodeAt(d);
      if (!u) throw new RangeError(`No cell with offset ${d} found`);
      const p = s + d + 1;
      return new Ca(l.resolve(p), l.resolve(p + u.content.size));
    });
    super(c[0].$from, c[0].$to, c), this.$anchorCell = e, this.$headCell = t;
  }
  map(e, t) {
    const i = e.resolve(t.map(this.$anchorCell.pos)), r = e.resolve(t.map(this.$headCell.pos));
    if (ys(i) && ys(r) && so(i, r)) {
      const s = this.$anchorCell.node(-1) != i.node(-1);
      return s && this.isRowSelection() ? qe.rowSelection(i, r) : s && this.isColSelection() ? qe.colSelection(i, r) : new qe(i, r);
    }
    return N.between(i, r);
  }
  content() {
    const e = this.$anchorCell.node(-1), t = W.get(e), i = this.$anchorCell.start(-1), r = t.rectBetween(this.$anchorCell.pos - i, this.$headCell.pos - i), s = {}, o = [];
    for (let a = r.top; a < r.bottom; a++) {
      const c = [];
      for (let d = a * t.width + r.left, u = r.left; u < r.right; u++, d++) {
        const p = t.map[d];
        if (s[p]) continue;
        s[p] = !0;
        const h = t.findCell(p);
        let f = e.nodeAt(p);
        if (!f) throw new RangeError(`No cell with offset ${p} found`);
        const m = r.left - h.left, g = h.right - r.right;
        if (m > 0 || g > 0) {
          let b = f.attrs;
          if (m > 0 && (b = Rt(b, 0, m)), g > 0 && (b = Rt(b, b.colspan - g, g)), h.left < r.left) {
            if (f = f.type.createAndFill(b), !f) throw new RangeError(`Could not create cell with attrs ${JSON.stringify(b)}`);
          } else f = f.type.create(b, f.content);
        }
        if (h.top < r.top || h.bottom > r.bottom) {
          const b = {
            ...f.attrs,
            rowspan: Math.min(h.bottom, r.bottom) - Math.max(h.top, r.top)
          };
          h.top < r.top ? f = f.type.createAndFill(b) : f = f.type.create(b, f.content);
        }
        c.push(f);
      }
      o.push(e.child(a).copy(y.from(c)));
    }
    const l = this.isColSelection() && this.isRowSelection() ? e : o;
    return new x(y.from(l), 1, 1);
  }
  replace(e, t = x.empty) {
    const i = e.steps.length, r = this.ranges;
    for (let o = 0; o < r.length; o++) {
      const { $from: l, $to: a } = r[o], c = e.mapping.slice(i);
      e.replace(c.map(l.pos), c.map(a.pos), o ? x.empty : t);
    }
    const s = _.findFrom(e.doc.resolve(e.mapping.slice(i).map(this.to)), -1);
    s && e.setSelection(s);
  }
  replaceWith(e, t) {
    this.replace(e, new x(y.from(t), 0, 0));
  }
  forEachCell(e) {
    const t = this.$anchorCell.node(-1), i = W.get(t), r = this.$anchorCell.start(-1), s = i.cellsInRect(i.rectBetween(this.$anchorCell.pos - r, this.$headCell.pos - r));
    for (let o = 0; o < s.length; o++) e(t.nodeAt(s[o]), r + s[o]);
  }
  isColSelection() {
    const e = this.$anchorCell.index(-1), t = this.$headCell.index(-1);
    if (Math.min(e, t) > 0) return !1;
    const i = e + this.$anchorCell.nodeAfter.attrs.rowspan, r = t + this.$headCell.nodeAfter.attrs.rowspan;
    return Math.max(i, r) == this.$headCell.node(-1).childCount;
  }
  static colSelection(e, t = e) {
    const i = e.node(-1), r = W.get(i), s = e.start(-1), o = r.findCell(e.pos - s), l = r.findCell(t.pos - s), a = e.node(0);
    return o.top <= l.top ? (o.top > 0 && (e = a.resolve(s + r.map[o.left])), l.bottom < r.height && (t = a.resolve(s + r.map[r.width * (r.height - 1) + l.right - 1]))) : (l.top > 0 && (t = a.resolve(s + r.map[l.left])), o.bottom < r.height && (e = a.resolve(s + r.map[r.width * (r.height - 1) + o.right - 1]))), new qe(e, t);
  }
  isRowSelection() {
    const e = this.$anchorCell.node(-1), t = W.get(e), i = this.$anchorCell.start(-1), r = t.colCount(this.$anchorCell.pos - i), s = t.colCount(this.$headCell.pos - i);
    if (Math.min(r, s) > 0) return !1;
    const o = r + this.$anchorCell.nodeAfter.attrs.colspan, l = s + this.$headCell.nodeAfter.attrs.colspan;
    return Math.max(o, l) == t.width;
  }
  eq(e) {
    return e instanceof qe && e.$anchorCell.pos == this.$anchorCell.pos && e.$headCell.pos == this.$headCell.pos;
  }
  static rowSelection(e, t = e) {
    const i = e.node(-1), r = W.get(i), s = e.start(-1), o = r.findCell(e.pos - s), l = r.findCell(t.pos - s), a = e.node(0);
    return o.left <= l.left ? (o.left > 0 && (e = a.resolve(s + r.map[o.top * r.width])), l.right < r.width && (t = a.resolve(s + r.map[r.width * (l.top + 1) - 1]))) : (l.left > 0 && (t = a.resolve(s + r.map[l.top * r.width])), o.right < r.width && (e = a.resolve(s + r.map[r.width * (o.top + 1) - 1]))), new qe(e, t);
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
    return new Jg(this.$anchorCell.pos, this.$headCell.pos);
  }
};
z.prototype.visible = !1;
_.jsonID("cell", z);
var Jg = class Jc {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Jc(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    const t = e.resolve(this.anchor), i = e.resolve(this.head);
    return t.parent.type.spec.tableRole == "row" && i.parent.type.spec.tableRole == "row" && t.index() < t.parent.childCount && i.index() < i.parent.childCount && so(t, i) ? new z(t, i) : _.near(i, 1);
  }
};
function Gg(n) {
  if (!(n.selection instanceof z)) return null;
  const e = [];
  return n.selection.forEachCell((t, i) => {
    e.push(re.node(i, i + t.nodeSize, { class: "selectedCell" }));
  }), F.create(n.doc, e);
}
function Yg({ $from: n, $to: e }) {
  if (n.pos == e.pos || n.pos < e.pos - 6) return !1;
  let t = n.pos, i = e.pos, r = n.depth;
  for (; r >= 0 && !(n.after(r + 1) < n.end(r)); r--, t++) ;
  for (let s = e.depth; s >= 0 && !(e.before(s + 1) > e.start(s)); s--, i--) ;
  return t == i && /row|table/.test(n.node(r).type.spec.tableRole);
}
function Xg({ $from: n, $to: e }) {
  let t, i;
  for (let r = n.depth; r > 0; r--) {
    const s = n.node(r);
    if (s.type.spec.tableRole === "cell" || s.type.spec.tableRole === "header_cell") {
      t = s;
      break;
    }
  }
  for (let r = e.depth; r > 0; r--) {
    const s = e.node(r);
    if (s.type.spec.tableRole === "cell" || s.type.spec.tableRole === "header_cell") {
      i = s;
      break;
    }
  }
  return t !== i && e.parentOffset === 0;
}
function Qg(n, e, t) {
  const i = (e || n).selection, r = (e || n).doc;
  let s, o;
  if (i instanceof T && (o = i.node.type.spec.tableRole)) {
    if (o == "cell" || o == "header_cell") s = z.create(r, i.from);
    else if (o == "row") {
      const l = r.resolve(i.from + 1);
      s = z.rowSelection(l, l);
    } else if (!t) {
      const l = W.get(i.node), a = i.from + 1, c = a + l.map[l.width * l.height - 1];
      s = z.create(r, a + 1, c);
    }
  } else i instanceof N && Yg(i) ? s = N.create(r, i.from) : i instanceof N && Xg(i) && (s = N.create(r, i.$from.start(), i.$from.end()));
  return s && (e || (e = n.tr)).setSelection(s), e;
}
const Zg = new J("fix-tables");
function Gc(n, e, t, i) {
  const r = n.childCount, s = e.childCount;
  e: for (let o = 0, l = 0; o < s; o++) {
    const a = e.child(o);
    for (let c = l, d = Math.min(r, o + 3); c < d; c++) if (n.child(c) == a) {
      l = c + 1, t += a.nodeSize;
      continue e;
    }
    i(a, t), l < r && n.child(l).sameMarkup(a) ? Gc(n.child(l), a, t + 1, i) : a.nodesBetween(0, a.content.size, i, t + 1), t += a.nodeSize;
  }
}
function Yc(n, e) {
  let t;
  const i = (r, s) => {
    r.type.spec.tableRole == "table" && (t = eb(n, r, s, t));
  };
  return e ? e.doc != n.doc && Gc(e.doc, n.doc, 0, i) : n.doc.descendants(i), t;
}
function eb(n, e, t, i) {
  const r = W.get(e);
  if (!r.problems) return i;
  i || (i = n.tr);
  const s = [];
  for (let a = 0; a < r.height; a++) s.push(0);
  for (let a = 0; a < r.problems.length; a++) {
    const c = r.problems[a];
    if (c.type == "collision") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      const u = d.attrs;
      for (let p = 0; p < u.rowspan; p++) s[c.row + p] += c.n;
      i.setNodeMarkup(i.mapping.map(t + 1 + c.pos), null, Rt(u, u.colspan - c.n, c.n));
    } else if (c.type == "missing") s[c.row] += c.n;
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
  for (let a = 0; a < s.length; a++) s[a] && (o == null && (o = a), l = a);
  for (let a = 0, c = t + 1; a < r.height; a++) {
    const d = e.child(a), u = c + d.nodeSize, p = s[a];
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
  return i.setMeta(Zg, { fixTables: !0 });
}
function Re(n) {
  const e = n.selection, t = ar(n), i = t.node(-1), r = t.start(-1), s = W.get(i);
  return {
    ...e instanceof z ? s.rectBetween(e.$anchorCell.pos - r, e.$headCell.pos - r) : s.findCell(t.pos - r),
    tableStart: r,
    map: s,
    table: i
  };
}
function Xc(n, { map: e, tableStart: t, table: i }, r) {
  let s = r > 0 ? -1 : 0;
  Kg(e, i, r + s) && (s = r == 0 || r == e.width ? null : 0);
  for (let o = 0; o < e.height; o++) {
    const l = o * e.width + r;
    if (r > 0 && r < e.width && e.map[l - 1] == e.map[l]) {
      const a = e.map[l], c = i.nodeAt(a);
      n.setNodeMarkup(n.mapping.map(t + a), null, Kc(c.attrs, r - e.colCount(a))), o += c.attrs.rowspan - 1;
    } else {
      const a = s == null ? le(i.type.schema).cell : i.nodeAt(e.map[l + s]).type, c = e.positionAt(o, r, i);
      n.insert(n.mapping.map(t + c), a.createAndFill());
    }
  }
  return n;
}
function tb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(Xc(n.tr, t, t.left));
  }
  return !0;
}
function nb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(Xc(n.tr, t, t.right));
  }
  return !0;
}
function ib(n, { map: e, table: t, tableStart: i }, r) {
  const s = n.mapping.maps.length;
  for (let o = 0; o < e.height; ) {
    const l = o * e.width + r, a = e.map[l], c = t.nodeAt(a), d = c.attrs;
    if (r > 0 && e.map[l - 1] == a || r < e.width - 1 && e.map[l + 1] == a) n.setNodeMarkup(n.mapping.slice(s).map(i + a), null, Rt(d, r - e.colCount(a)));
    else {
      const u = n.mapping.slice(s).map(i + a);
      n.delete(u, u + c.nodeSize);
    }
    o += d.rowspan;
  }
}
function rb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n), i = n.tr;
    if (t.left == 0 && t.right == t.map.width) return !1;
    for (let r = t.right - 1; ib(i, t, r), r != t.left; r--) {
      const s = t.tableStart ? i.doc.nodeAt(t.tableStart - 1) : i.doc;
      if (!s) throw new RangeError("No table found");
      t.table = s, t.map = W.get(s);
    }
    e(i);
  }
  return !0;
}
function sb(n, e, t) {
  var i;
  const r = le(e.type.schema).header_cell;
  for (let s = 0; s < n.width; s++) if (((i = e.nodeAt(n.map[s + t * n.width])) === null || i === void 0 ? void 0 : i.type) != r) return !1;
  return !0;
}
function Qc(n, { map: e, tableStart: t, table: i }, r) {
  let s = t;
  for (let c = 0; c < r; c++) s += i.child(c).nodeSize;
  const o = [];
  let l = r > 0 ? -1 : 0;
  sb(e, i, r + l) && (l = r == 0 || r == e.height ? null : 0);
  for (let c = 0, d = e.width * r; c < e.width; c++, d++) if (r > 0 && r < e.height && e.map[d] == e.map[d - e.width]) {
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
  return n.insert(s, le(i.type.schema).row.create(null, o)), n;
}
function ob(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(Qc(n.tr, t, t.top));
  }
  return !0;
}
function lb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n);
    e(Qc(n.tr, t, t.bottom));
  }
  return !0;
}
function ab(n, { map: e, table: t, tableStart: i }, r) {
  let s = 0;
  for (let c = 0; c < r; c++) s += t.child(c).nodeSize;
  const o = s + t.child(r).nodeSize, l = n.mapping.maps.length;
  n.delete(s + i, o + i);
  const a = /* @__PURE__ */ new Set();
  for (let c = 0, d = r * e.width; c < e.width; c++, d++) {
    const u = e.map[d];
    if (!a.has(u)) {
      if (a.add(u), r > 0 && u == e.map[d - e.width]) {
        const p = t.nodeAt(u).attrs;
        n.setNodeMarkup(n.mapping.slice(l).map(u + i), null, {
          ...p,
          rowspan: p.rowspan - 1
        }), c += p.colspan - 1;
      } else if (r < e.height && u == e.map[d + e.width]) {
        const p = t.nodeAt(u), h = p.attrs, f = p.type.create({
          ...h,
          rowspan: p.attrs.rowspan - 1
        }, p.content), m = e.positionAt(r + 1, c, t);
        n.insert(n.mapping.slice(l).map(i + m), f), c += h.colspan - 1;
      }
    }
  }
}
function cb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Re(n), i = n.tr;
    if (t.top == 0 && t.bottom == t.map.height) return !1;
    for (let r = t.bottom - 1; ab(i, t, r), r != t.top; r--) {
      const s = t.tableStart ? i.doc.nodeAt(t.tableStart - 1) : i.doc;
      if (!s) throw new RangeError("No table found");
      t.table = s, t.map = W.get(t.table);
    }
    e(i);
  }
  return !0;
}
function Tl(n) {
  const e = n.content;
  return e.childCount == 1 && e.child(0).isTextblock && e.child(0).childCount == 0;
}
function db({ width: n, height: e, map: t }, i) {
  let r = i.top * n + i.left, s = r, o = (i.bottom - 1) * n + i.left, l = r + (i.right - i.left - 1);
  for (let a = i.top; a < i.bottom; a++) {
    if (i.left > 0 && t[s] == t[s - 1] || i.right < n && t[l] == t[l + 1]) return !0;
    s += n, l += n;
  }
  for (let a = i.left; a < i.right; a++) {
    if (i.top > 0 && t[r] == t[r - n] || i.bottom < e && t[o] == t[o + n]) return !0;
    r++, o++;
  }
  return !1;
}
function Nl(n, e) {
  const t = n.selection;
  if (!(t instanceof z) || t.$anchorCell.pos == t.$headCell.pos) return !1;
  const i = Re(n), { map: r } = i;
  if (db(r, i)) return !1;
  if (e) {
    const s = n.tr, o = {};
    let l = y.empty, a, c;
    for (let d = i.top; d < i.bottom; d++) for (let u = i.left; u < i.right; u++) {
      const p = r.map[d * r.width + u], h = i.table.nodeAt(p);
      if (!(o[p] || !h))
        if (o[p] = !0, a == null)
          a = p, c = h;
        else {
          Tl(h) || (l = l.append(h.content));
          const f = s.mapping.map(p + i.tableStart);
          s.delete(f, f + h.nodeSize);
        }
    }
    if (a == null || c == null) return !0;
    if (s.setNodeMarkup(a + i.tableStart, null, {
      ...Kc(c.attrs, c.attrs.colspan, i.right - i.left - c.attrs.colspan),
      rowspan: i.bottom - i.top
    }), l.size > 0) {
      const d = a + 1 + c.content.size, u = Tl(c) ? a + 1 : d;
      s.replaceWith(u + i.tableStart, d + i.tableStart, l);
    }
    s.setSelection(new z(s.doc.resolve(a + i.tableStart))), e(s);
  }
  return !0;
}
function _l(n, e) {
  const t = le(n.schema);
  return ub(({ node: i }) => t[i.type.spec.tableRole])(n, e);
}
function ub(n) {
  return (e, t) => {
    const i = e.selection;
    let r, s;
    if (i instanceof z) {
      if (i.$anchorCell.pos != i.$headCell.pos) return !1;
      r = i.$anchorCell.nodeAfter, s = i.$anchorCell.pos;
    } else {
      var o;
      if (r = Wg(i.$from), !r) return !1;
      s = (o = Lt(i.$from)) === null || o === void 0 ? void 0 : o.pos;
    }
    if (r == null || s == null || r.attrs.colspan == 1 && r.attrs.rowspan == 1) return !1;
    if (t) {
      let l = r.attrs;
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
        h == d.top && (f += r.nodeSize);
        for (let m = d.left, g = 0; m < d.right; m++, g++)
          m == d.left && h == d.top || u.insert(p = u.mapping.map(f + d.tableStart, 1), n({
            node: r,
            row: h,
            col: m
          }).createAndFill(a[g]));
      }
      u.setNodeMarkup(s, n({
        node: r,
        row: d.top,
        col: d.left
      }), a[0]), i instanceof z && u.setSelection(new z(u.doc.resolve(i.$anchorCell.pos), p ? u.doc.resolve(p) : void 0)), t(u);
    }
    return !0;
  };
}
function pb(n, e) {
  return function(t, i) {
    if (!Ee(t)) return !1;
    const r = ar(t);
    if (r.nodeAfter.attrs[n] === e) return !1;
    if (i) {
      const s = t.tr;
      t.selection instanceof z ? t.selection.forEachCell((o, l) => {
        o.attrs[n] !== e && s.setNodeMarkup(l, null, {
          ...o.attrs,
          [n]: e
        });
      }) : s.setNodeMarkup(r.pos, null, {
        ...r.nodeAfter.attrs,
        [n]: e
      }), i(s);
    }
    return !0;
  };
}
function hb(n) {
  return function(e, t) {
    if (!Ee(e)) return !1;
    if (t) {
      const i = le(e.schema), r = Re(e), s = e.tr, o = r.map.cellsInRect(n == "column" ? {
        left: r.left,
        top: 0,
        right: r.right,
        bottom: r.map.height
      } : n == "row" ? {
        left: 0,
        top: r.top,
        right: r.map.width,
        bottom: r.bottom
      } : r), l = o.map((a) => r.table.nodeAt(a));
      for (let a = 0; a < o.length; a++) l[a].type == i.header_cell && s.setNodeMarkup(r.tableStart + o[a], i.cell, l[a].attrs);
      if (s.steps.length === 0) for (let a = 0; a < o.length; a++) s.setNodeMarkup(r.tableStart + o[a], i.header_cell, l[a].attrs);
      t(s);
    }
    return !0;
  };
}
function Ol(n, e, t) {
  const i = e.map.cellsInRect({
    left: 0,
    top: 0,
    right: n == "row" ? e.map.width : 1,
    bottom: n == "column" ? e.map.height : 1
  });
  for (let r = 0; r < i.length; r++) {
    const s = e.table.nodeAt(i[r]);
    if (s && s.type !== t.header_cell) return !1;
  }
  return !0;
}
function _n(n, e) {
  return e = e || { useDeprecatedLogic: !1 }, e.useDeprecatedLogic ? hb(n) : function(t, i) {
    if (!Ee(t)) return !1;
    if (i) {
      const r = le(t.schema), s = Re(t), o = t.tr, l = Ol("row", s, r), a = Ol("column", s, r), c = (n === "column" ? l : n === "row" && a) ? 1 : 0, d = n == "column" ? {
        left: 0,
        top: c,
        right: 1,
        bottom: s.map.height
      } : n == "row" ? {
        left: c,
        top: 0,
        right: s.map.width,
        bottom: 1
      } : s, u = n == "column" ? a ? r.cell : r.header_cell : n == "row" ? l ? r.cell : r.header_cell : r.cell;
      s.map.cellsInRect(d).forEach((p) => {
        const h = p + s.tableStart, f = o.doc.nodeAt(h);
        f && o.setNodeMarkup(h, u, f.attrs);
      }), i(o);
    }
    return !0;
  };
}
_n("row", { useDeprecatedLogic: !0 });
_n("column", { useDeprecatedLogic: !0 });
const fb = _n("cell", { useDeprecatedLogic: !0 });
function mb(n, e) {
  if (e < 0) {
    const t = n.nodeBefore;
    if (t) return n.pos - t.nodeSize;
    for (let i = n.index(-1) - 1, r = n.before(); i >= 0; i--) {
      const s = n.node(-1).child(i), o = s.lastChild;
      if (o) return r - 1 - o.nodeSize;
      r -= s.nodeSize;
    }
  } else {
    if (n.index() < n.parent.childCount - 1) return n.pos + n.nodeAfter.nodeSize;
    const t = n.node(-1);
    for (let i = n.indexAfter(-1), r = n.after(); i < t.childCount; i++) {
      const s = t.child(i);
      if (s.childCount) return r + 1;
      r += s.nodeSize;
    }
  }
  return null;
}
function Ll(n) {
  return function(e, t) {
    if (!Ee(e)) return !1;
    const i = mb(ar(e), n);
    if (i == null) return !1;
    if (t) {
      const r = e.doc.resolve(i);
      t(e.tr.setSelection(N.between(r, jg(r))).scrollIntoView());
    }
    return !0;
  };
}
function gb(n, e) {
  const t = n.selection.$anchor;
  for (let i = t.depth; i > 0; i--) if (t.node(i).type.spec.tableRole == "table")
    return e && e(n.tr.delete(t.before(i), t.after(i)).scrollIntoView()), !0;
  return !1;
}
function Kn(n, e) {
  const t = n.selection;
  if (!(t instanceof z)) return !1;
  if (e) {
    const i = n.tr, r = le(n.schema).cell.createAndFill().content;
    t.forEachCell((s, o) => {
      s.content.eq(r) || i.replace(i.mapping.map(o + 1), i.mapping.map(o + s.nodeSize - 1), new x(r, 0, 0));
    }), i.docChanged && e(i);
  }
  return !0;
}
function bb(n) {
  if (n.size === 0) return null;
  let { content: e, openStart: t, openEnd: i } = n;
  for (; e.childCount == 1 && (t > 0 && i > 0 || e.child(0).type.spec.tableRole == "table"); )
    t--, i--, e = e.child(0).content;
  const r = e.child(0), s = r.type.spec.tableRole, o = r.type.schema, l = [];
  if (s == "row") for (let a = 0; a < e.childCount; a++) {
    let c = e.child(a).content;
    const d = a ? 0 : Math.max(0, t - 1), u = a < e.childCount - 1 ? 0 : Math.max(0, i - 1);
    (d || u) && (c = ks(le(o).row, new x(c, d, u)).content), l.push(c);
  }
  else if (s == "cell" || s == "header_cell") l.push(t || i ? ks(le(o).row, new x(e, t, i)).content : e);
  else return null;
  return yb(o, l);
}
function yb(n, e) {
  const t = [];
  for (let r = 0; r < e.length; r++) {
    const s = e[r];
    for (let o = s.childCount - 1; o >= 0; o--) {
      const { rowspan: l, colspan: a } = s.child(o).attrs;
      for (let c = r; c < r + l; c++) t[c] = (t[c] || 0) + a;
    }
  }
  let i = 0;
  for (let r = 0; r < t.length; r++) i = Math.max(i, t[r]);
  for (let r = 0; r < t.length; r++)
    if (r >= e.length && e.push(y.empty), t[r] < i) {
      const s = le(n).cell.createAndFill(), o = [];
      for (let l = t[r]; l < i; l++) o.push(s);
      e[r] = e[r].append(y.from(o));
    }
  return {
    height: e.length,
    width: i,
    rows: e
  };
}
function ks(n, e) {
  const t = n.createAndFill();
  return new As(t).replace(0, t.content.size, e).doc;
}
function kb({ width: n, height: e, rows: t }, i, r) {
  if (n != i) {
    const s = [], o = [];
    for (let l = 0; l < t.length; l++) {
      const a = t[l], c = [];
      for (let d = s[l] || 0, u = 0; d < i; u++) {
        let p = a.child(u % a.childCount);
        d + p.attrs.colspan > i && (p = p.type.createChecked(Rt(p.attrs, p.attrs.colspan, d + p.attrs.colspan - i), p.content)), c.push(p), d += p.attrs.colspan;
        for (let h = 1; h < p.attrs.rowspan; h++) s[l + h] = (s[l + h] || 0) + p.attrs.colspan;
      }
      o.push(y.from(c));
    }
    t = o, n = i;
  }
  if (e != r) {
    const s = [];
    for (let o = 0, l = 0; o < r; o++, l++) {
      const a = [], c = t[l % e];
      for (let d = 0; d < c.childCount; d++) {
        let u = c.child(d);
        o + u.attrs.rowspan > r && (u = u.type.create({
          ...u.attrs,
          rowspan: Math.max(1, r - u.attrs.rowspan)
        }, u.content)), a.push(u);
      }
      s.push(y.from(a));
    }
    t = s, e = r;
  }
  return {
    width: n,
    height: e,
    rows: t
  };
}
function wb(n, e, t, i, r, s, o) {
  const l = n.doc.type.schema, a = le(l);
  let c, d;
  if (r > e.width) for (let u = 0, p = 0; u < e.height; u++) {
    const h = t.child(u);
    p += h.nodeSize;
    const f = [];
    let m;
    h.lastChild == null || h.lastChild.type == a.cell ? m = c || (c = a.cell.createAndFill()) : m = d || (d = a.header_cell.createAndFill());
    for (let g = e.width; g < r; g++) f.push(m);
    n.insert(n.mapping.slice(o).map(p - 1 + i), f);
  }
  if (s > e.height) {
    const u = [];
    for (let f = 0, m = (e.height - 1) * e.width; f < Math.max(e.width, r); f++) {
      const g = f >= e.width ? !1 : t.nodeAt(e.map[m + f]).type == a.header_cell;
      u.push(g ? d || (d = a.header_cell.createAndFill()) : c || (c = a.cell.createAndFill()));
    }
    const p = a.row.create(null, y.from(u)), h = [];
    for (let f = e.height; f < s; f++) h.push(p);
    n.insert(n.mapping.slice(o).map(i + t.nodeSize - 2), h);
  }
  return !!(c || d);
}
function Rl(n, e, t, i, r, s, o, l) {
  if (o == 0 || o == e.height) return !1;
  let a = !1;
  for (let c = r; c < s; c++) {
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
function Il(n, e, t, i, r, s, o, l) {
  if (o == 0 || o == e.width) return !1;
  let a = !1;
  for (let c = r; c < s; c++) {
    const d = c * e.width + o, u = e.map[d];
    if (e.map[d - 1] == u) {
      a = !0;
      const p = t.nodeAt(u), h = e.colCount(u), f = n.mapping.slice(l).map(u + i);
      n.setNodeMarkup(f, null, Rt(p.attrs, o - h, p.attrs.colspan - (o - h))), n.insert(f + p.nodeSize, p.type.createAndFill(Rt(p.attrs, 0, o - h))), c += p.attrs.rowspan - 1;
    }
  }
  return a;
}
function Dl(n, e, t, i, r) {
  let s = t ? n.doc.nodeAt(t - 1) : n.doc;
  if (!s) throw new Error("No table found");
  let o = W.get(s);
  const { top: l, left: a } = i, c = a + r.width, d = l + r.height, u = n.tr;
  let p = 0;
  function h() {
    if (s = t ? u.doc.nodeAt(t - 1) : u.doc, !s) throw new Error("No table found");
    o = W.get(s), p = u.mapping.maps.length;
  }
  wb(u, o, s, t, c, d, p) && h(), Rl(u, o, s, t, a, c, l, p) && h(), Rl(u, o, s, t, a, c, d, p) && h(), Il(u, o, s, t, l, d, a, p) && h(), Il(u, o, s, t, l, d, c, p) && h();
  for (let f = l; f < d; f++) {
    const m = o.positionAt(f, a, s), g = o.positionAt(f, c, s);
    u.replace(u.mapping.slice(p).map(m + t), u.mapping.slice(p).map(g + t), new x(r.rows[f - l], 0, 0));
  }
  h(), u.setSelection(new z(u.doc.resolve(t + o.positionAt(l, a, s)), u.doc.resolve(t + o.positionAt(d - 1, c - 1, s)))), e(u);
}
const vb = Hs({
  ArrowLeft: Jn("horiz", -1),
  ArrowRight: Jn("horiz", 1),
  ArrowUp: Jn("vert", -1),
  ArrowDown: Jn("vert", 1),
  "Shift-ArrowLeft": Gn("horiz", -1),
  "Shift-ArrowRight": Gn("horiz", 1),
  "Shift-ArrowUp": Gn("vert", -1),
  "Shift-ArrowDown": Gn("vert", 1),
  Backspace: Kn,
  "Mod-Backspace": Kn,
  Delete: Kn,
  "Mod-Delete": Kn
});
function ri(n, e, t) {
  return t.eq(n.selection) ? !1 : (e && e(n.tr.setSelection(t).scrollIntoView()), !0);
}
function Jn(n, e) {
  return (t, i, r) => {
    if (!r) return !1;
    const s = t.selection;
    if (s instanceof z) return ri(t, i, _.near(s.$headCell, e));
    if (n != "horiz" && !s.empty) return !1;
    const o = Zc(r, n, e);
    if (o == null) return !1;
    if (n == "horiz") return ri(t, i, _.near(t.doc.resolve(s.head + e), e));
    {
      const l = t.doc.resolve(o), a = jc(l, n, e);
      let c;
      return a ? c = _.near(a, 1) : e < 0 ? c = _.near(t.doc.resolve(l.before(-1)), -1) : c = _.near(t.doc.resolve(l.after(-1)), 1), ri(t, i, c);
    }
  };
}
function Gn(n, e) {
  return (t, i, r) => {
    if (!r) return !1;
    const s = t.selection;
    let o;
    if (s instanceof z) o = s;
    else {
      const a = Zc(r, n, e);
      if (a == null) return !1;
      o = new z(t.doc.resolve(a));
    }
    const l = jc(o.$headCell, n, e);
    return l ? ri(t, i, new z(o.$anchorCell, l)) : !1;
  };
}
function Sb(n, e) {
  const t = n.state.doc, i = Lt(t.resolve(e));
  return i ? (n.dispatch(n.state.tr.setSelection(new z(i))), !0) : !1;
}
function xb(n, e, t) {
  if (!Ee(n.state)) return !1;
  let i = bb(t);
  const r = n.state.selection;
  if (r instanceof z) {
    i || (i = {
      width: 1,
      height: 1,
      rows: [y.from(ks(le(n.state.schema).cell, t))]
    });
    const s = r.$anchorCell.node(-1), o = r.$anchorCell.start(-1), l = W.get(s).rectBetween(r.$anchorCell.pos - o, r.$headCell.pos - o);
    return i = kb(i, l.right - l.left, l.bottom - l.top), Dl(n.state, n.dispatch, o, l, i), !0;
  } else if (i) {
    const s = ar(n.state), o = s.start(-1);
    return Dl(n.state, n.dispatch, o, W.get(s.node(-1)).findCell(s.pos - o), i), !0;
  } else return !1;
}
function Cb(n, e) {
  var t;
  if (e.button != 0 || e.ctrlKey || e.metaKey) return;
  const i = Pl(n, e.target);
  let r;
  if (e.shiftKey && n.state.selection instanceof z)
    s(n.state.selection.$anchorCell, e), e.preventDefault();
  else if (e.shiftKey && i && (r = Lt(n.state.selection.$anchor)) != null && ((t = Br(n, e)) === null || t === void 0 ? void 0 : t.pos) != r.pos)
    s(r, e), e.preventDefault();
  else if (!i) return;
  function s(a, c) {
    let d = Br(n, c);
    const u = et.getState(n.state) == null;
    if (!d || !so(a, d)) if (u) d = a;
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
    else if (Pl(n, c.target) != i && (u = Br(n, e), !u))
      return o();
    u && s(u, c);
  }
  n.root.addEventListener("mouseup", o), n.root.addEventListener("dragstart", o), n.root.addEventListener("mousemove", l);
}
function Zc(n, e, t) {
  if (!(n.state.selection instanceof N)) return null;
  const { $head: i } = n.state.selection;
  for (let r = i.depth - 1; r >= 0; r--) {
    const s = i.node(r);
    if ((t < 0 ? i.index(r) : i.indexAfter(r)) != (t < 0 ? 0 : s.childCount)) return null;
    if (s.type.spec.tableRole == "cell" || s.type.spec.tableRole == "header_cell") {
      const o = i.before(r), l = e == "vert" ? t > 0 ? "down" : "up" : t > 0 ? "right" : "left";
      return n.endOfTextblock(l) ? o : null;
    }
  }
  return null;
}
function Pl(n, e) {
  for (; e && e != n.dom; e = e.parentNode) if (e.nodeName == "TD" || e.nodeName == "TH") return e;
  return null;
}
function Br(n, e) {
  const t = n.posAtCoords({
    left: e.clientX,
    top: e.clientY
  });
  if (!t) return null;
  let { inside: i, pos: r } = t;
  return i >= 0 && Lt(n.state.doc.resolve(i)) || Lt(n.state.doc.resolve(r));
}
var Mb = class {
  constructor(e, t) {
    this.node = e, this.defaultCellMinWidth = t, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.table.style.setProperty("--default-cell-min-width", `${t}px`), this.colgroup = this.table.appendChild(document.createElement("colgroup")), ws(e, this.colgroup, this.table, t), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(e) {
    return e.type != this.node.type ? !1 : (this.node = e, ws(e, this.colgroup, this.table, this.defaultCellMinWidth), !0);
  }
  ignoreMutation(e) {
    return e.type == "attributes" && (e.target == this.table || this.colgroup.contains(e.target));
  }
};
function ws(n, e, t, i, r, s) {
  let o = 0, l = !0, a = e.firstChild;
  const c = n.firstChild;
  if (c) {
    for (let u = 0, p = 0; u < c.childCount; u++) {
      const { colspan: h, colwidth: f } = c.child(u).attrs;
      for (let m = 0; m < h; m++, p++) {
        const g = r == p ? s : f && f[m], b = g ? g + "px" : "";
        if (o += g || i, g || (l = !1), a)
          a.style.width != b && (a.style.width = b), a = a.nextSibling;
        else {
          const k = document.createElement("col");
          k.style.width = b, e.appendChild(k);
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
function Eb({ handleWidth: n = 5, cellMinWidth: e = 25, defaultCellMinWidth: t = 100, View: i = Mb, lastColumnResizable: r = !0 } = {}) {
  const s = new U({
    key: ge,
    state: {
      init(o, l) {
        var a;
        const c = (a = s.spec) === null || a === void 0 || (a = a.props) === null || a === void 0 ? void 0 : a.nodeViews, d = le(l.schema).table.name;
        return i && c && (c[d] = (u, p) => new i(u, t, p)), new Ab(-1, !1);
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
          Tb(o, l, n, r);
        },
        mouseleave: (o) => {
          Nb(o);
        },
        mousedown: (o, l) => {
          _b(o, l, e, t);
        }
      },
      decorations: (o) => {
        const l = ge.getState(o);
        if (l && l.activeHandle > -1) return Db(o, l.activeHandle);
      },
      nodeViews: {}
    }
  });
  return s;
}
var Ab = class si {
  constructor(e, t) {
    this.activeHandle = e, this.dragging = t;
  }
  apply(e) {
    const t = this, i = e.getMeta(ge);
    if (i && i.setHandle != null) return new si(i.setHandle, !1);
    if (i && i.setDragging !== void 0) return new si(t.activeHandle, i.setDragging);
    if (t.activeHandle > -1 && e.docChanged) {
      let r = e.mapping.map(t.activeHandle, -1);
      return ys(e.doc.resolve(r)) || (r = -1), new si(r, t.dragging);
    }
    return t;
  }
};
function Tb(n, e, t, i) {
  if (!n.editable) return;
  const r = ge.getState(n.state);
  if (r && !r.dragging) {
    const s = Lb(e.target);
    let o = -1;
    if (s) {
      const { left: l, right: a } = s.getBoundingClientRect();
      e.clientX - l <= t ? o = Bl(n, e, "left", t) : a - e.clientX <= t && (o = Bl(n, e, "right", t));
    }
    if (o != r.activeHandle) {
      if (!i && o !== -1) {
        const l = n.state.doc.resolve(o), a = l.node(-1), c = W.get(a), d = l.start(-1);
        if (c.colCount(l.pos - d) + l.nodeAfter.attrs.colspan - 1 == c.width - 1) return;
      }
      ed(n, o);
    }
  }
}
function Nb(n) {
  if (!n.editable) return;
  const e = ge.getState(n.state);
  e && e.activeHandle > -1 && !e.dragging && ed(n, -1);
}
function _b(n, e, t, i) {
  var r;
  if (!n.editable) return !1;
  const s = (r = n.dom.ownerDocument.defaultView) !== null && r !== void 0 ? r : window, o = ge.getState(n.state);
  if (!o || o.activeHandle == -1 || o.dragging) return !1;
  const l = n.state.doc.nodeAt(o.activeHandle), a = Ob(n, o.activeHandle, l.attrs);
  n.dispatch(n.state.tr.setMeta(ge, { setDragging: {
    startX: e.clientX,
    startWidth: a
  } }));
  function c(u) {
    s.removeEventListener("mouseup", c), s.removeEventListener("mousemove", d);
    const p = ge.getState(n.state);
    p != null && p.dragging && (Rb(n, p.activeHandle, Hl(p.dragging, u, t)), n.dispatch(n.state.tr.setMeta(ge, { setDragging: null })));
  }
  function d(u) {
    if (!u.which) return c(u);
    const p = ge.getState(n.state);
    if (p && p.dragging) {
      const h = Hl(p.dragging, u, t);
      zl(n, p.activeHandle, h, i);
    }
  }
  return zl(n, o.activeHandle, a, i), s.addEventListener("mouseup", c), s.addEventListener("mousemove", d), e.preventDefault(), !0;
}
function Ob(n, e, { colspan: t, colwidth: i }) {
  const r = i && i[i.length - 1];
  if (r) return r;
  const s = n.domAtPos(e);
  let o = s.node.childNodes[s.offset].offsetWidth, l = t;
  if (i)
    for (let a = 0; a < t; a++) i[a] && (o -= i[a], l--);
  return o / l;
}
function Lb(n) {
  for (; n && n.nodeName != "TD" && n.nodeName != "TH"; ) n = n.classList && n.classList.contains("ProseMirror") ? null : n.parentNode;
  return n;
}
function Bl(n, e, t, i) {
  const r = t == "right" ? -i : i, s = n.posAtCoords({
    left: e.clientX + r,
    top: e.clientY
  });
  if (!s) return -1;
  const { pos: o } = s, l = Lt(n.state.doc.resolve(o));
  if (!l) return -1;
  if (t == "right") return l.pos;
  const a = W.get(l.node(-1)), c = l.start(-1), d = a.map.indexOf(l.pos - c);
  return d % a.width == 0 ? -1 : c + a.map[d - 1];
}
function Hl(n, e, t) {
  const i = e.clientX - n.startX;
  return Math.max(t, n.startWidth + i);
}
function ed(n, e) {
  n.dispatch(n.state.tr.setMeta(ge, { setHandle: e }));
}
function Rb(n, e, t) {
  const i = n.state.doc.resolve(e), r = i.node(-1), s = W.get(r), o = i.start(-1), l = s.colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1, a = n.state.tr;
  for (let c = 0; c < s.height; c++) {
    const d = c * s.width + l;
    if (c && s.map[d] == s.map[d - s.width]) continue;
    const u = s.map[d], p = r.nodeAt(u).attrs, h = p.colspan == 1 ? 0 : l - s.colCount(u);
    if (p.colwidth && p.colwidth[h] == t) continue;
    const f = p.colwidth ? p.colwidth.slice() : Ib(p.colspan);
    f[h] = t, a.setNodeMarkup(o + u, null, {
      ...p,
      colwidth: f
    });
  }
  a.docChanged && n.dispatch(a);
}
function zl(n, e, t, i) {
  const r = n.state.doc.resolve(e), s = r.node(-1), o = r.start(-1), l = W.get(s).colCount(r.pos - o) + r.nodeAfter.attrs.colspan - 1;
  let a = n.domAtPos(r.start(-1)).node;
  for (; a && a.nodeName != "TABLE"; ) a = a.parentNode;
  a && ws(s, a.firstChild, a, i, l, t);
}
function Ib(n) {
  return Array(n).fill(0);
}
function Db(n, e) {
  const t = [], i = n.doc.resolve(e), r = i.node(-1);
  if (!r) return F.empty;
  const s = W.get(r), o = i.start(-1), l = s.colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1;
  for (let c = 0; c < s.height; c++) {
    const d = l + c * s.width;
    if ((l == s.width - 1 || s.map[d] != s.map[d + 1]) && (c == 0 || s.map[d] != s.map[d - s.width])) {
      var a;
      const u = s.map[d], p = o + u + r.nodeAt(u).nodeSize - 1, h = document.createElement("div");
      h.className = "column-resize-handle", !((a = ge.getState(n)) === null || a === void 0) && a.dragging && t.push(re.node(o + u, o + u + r.nodeAt(u).nodeSize, { class: "column-resize-dragging" })), t.push(re.widget(p, h));
    }
  }
  return F.create(n.doc, t);
}
function Pb({ allowTableNodeSelection: n = !1 } = {}) {
  return new U({
    key: et,
    state: {
      init() {
        return null;
      },
      apply(e, t) {
        const i = e.getMeta(et);
        if (i != null) return i == -1 ? null : i;
        if (t == null || !e.docChanged) return t;
        const { deleted: r, pos: s } = e.mapping.mapResult(t);
        return r ? null : s;
      }
    },
    props: {
      decorations: Gg,
      handleDOMEvents: { mousedown: Cb },
      createSelectionBetween(e) {
        return et.getState(e.state) != null ? e.state.selection : null;
      },
      handleTripleClick: Sb,
      handleKeyDown: vb,
      handlePaste: xb
    },
    appendTransaction(e, t, i) {
      return Qg(i, Yc(i, t), n);
    }
  });
}
function vs(n, e) {
  return e ? ["width", `${Math.max(e, n)}px`] : ["min-width", `${n}px`];
}
function $l(n, e, t, i, r, s) {
  var o;
  let l = 0, a = !0, c = e.firstChild;
  const d = n.firstChild;
  if (d !== null)
    for (let u = 0, p = 0; u < d.childCount; u += 1) {
      const { colspan: h, colwidth: f } = d.child(u).attrs;
      for (let m = 0; m < h; m += 1, p += 1) {
        const g = r === p ? s : f && f[m], b = g ? `${g}px` : "";
        if (l += g || i, g || (a = !1), c) {
          if (c.style.width !== b) {
            const [k, w] = vs(i, g);
            c.style.setProperty(k, w);
          }
          c = c.nextSibling;
        } else {
          const k = document.createElement("col"), [w, M] = vs(i, g);
          k.style.setProperty(w, M), e.appendChild(k);
        }
      }
    }
  for (; c; ) {
    const u = c.nextSibling;
    (o = c.parentNode) === null || o === void 0 || o.removeChild(c), c = u;
  }
  a ? (t.style.width = `${l}px`, t.style.minWidth = "") : (t.style.width = "", t.style.minWidth = `${l}px`);
}
class Bb {
  constructor(e, t) {
    this.node = e, this.cellMinWidth = t, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.colgroup = this.table.appendChild(document.createElement("colgroup")), $l(e, this.colgroup, this.table, t), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(e) {
    return e.type !== this.node.type ? !1 : (this.node = e, $l(e, this.colgroup, this.table, this.cellMinWidth), !0);
  }
  ignoreMutation(e) {
    return e.type === "attributes" && (e.target === this.table || this.colgroup.contains(e.target));
  }
}
function Hb(n, e, t, i) {
  let r = 0, s = !0;
  const o = [], l = n.firstChild;
  if (!l)
    return {};
  for (let u = 0, p = 0; u < l.childCount; u += 1) {
    const { colspan: h, colwidth: f } = l.child(u).attrs;
    for (let m = 0; m < h; m += 1, p += 1) {
      const g = t === p ? i : f && f[m];
      r += g || e, g || (s = !1);
      const [b, k] = vs(e, g);
      o.push([
        "col",
        { style: `${b}: ${k}` }
      ]);
    }
  }
  const a = s ? `${r}px` : "", c = s ? "" : `${r}px`;
  return { colgroup: ["colgroup", {}, ...o], tableWidth: a, tableMinWidth: c };
}
function Fl(n, e) {
  return n.createAndFill();
}
function zb(n) {
  if (n.cached.tableNodeTypes)
    return n.cached.tableNodeTypes;
  const e = {};
  return Object.keys(n.nodes).forEach((t) => {
    const i = n.nodes[t];
    i.spec.tableRole && (e[i.spec.tableRole] = i);
  }), n.cached.tableNodeTypes = e, e;
}
function $b(n, e, t, i, r) {
  const s = zb(n), o = [], l = [];
  for (let c = 0; c < t; c += 1) {
    const d = Fl(s.cell);
    if (d && l.push(d), i) {
      const u = Fl(s.header_cell);
      u && o.push(u);
    }
  }
  const a = [];
  for (let c = 0; c < e; c += 1)
    a.push(s.row.createChecked(null, i && c === 0 ? o : l));
  return s.table.createChecked(null, a);
}
function Fb(n) {
  return n instanceof z;
}
const Yn = ({ editor: n }) => {
  const { selection: e } = n.state;
  if (!Fb(e))
    return !1;
  let t = 0;
  const i = _c(e.ranges[0].$from, (s) => s.type.name === "table");
  return i == null || i.node.descendants((s) => {
    if (s.type.name === "table")
      return !1;
    ["tableCell", "tableHeader"].includes(s.type.name) && (t += 1);
  }), t === e.ranges.length ? (n.commands.deleteTable(), !0) : !1;
}, qb = B.create({
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
      View: Bb,
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
    const { colgroup: t, tableWidth: i, tableMinWidth: r } = Hb(n, this.options.cellMinWidth), s = [
      "table",
      D(this.options.HTMLAttributes, e, {
        style: i ? `width: ${i}` : `min-width: ${r}`
      }),
      t,
      ["tbody", 0]
    ];
    return this.options.renderWrapper ? ["div", { class: "tableWrapper" }, s] : s;
  },
  addCommands() {
    return {
      insertTable: ({ rows: n = 3, cols: e = 3, withHeaderRow: t = !0 } = {}) => ({ tr: i, dispatch: r, editor: s }) => {
        const o = $b(s.schema, n, e, t);
        if (r) {
          const l = i.selection.from + 1;
          i.replaceSelectionWith(o).scrollIntoView().setSelection(N.near(i.doc.resolve(l)));
        }
        return !0;
      },
      addColumnBefore: () => ({ state: n, dispatch: e }) => tb(n, e),
      addColumnAfter: () => ({ state: n, dispatch: e }) => nb(n, e),
      deleteColumn: () => ({ state: n, dispatch: e }) => rb(n, e),
      addRowBefore: () => ({ state: n, dispatch: e }) => ob(n, e),
      addRowAfter: () => ({ state: n, dispatch: e }) => lb(n, e),
      deleteRow: () => ({ state: n, dispatch: e }) => cb(n, e),
      deleteTable: () => ({ state: n, dispatch: e }) => gb(n, e),
      mergeCells: () => ({ state: n, dispatch: e }) => Nl(n, e),
      splitCell: () => ({ state: n, dispatch: e }) => _l(n, e),
      toggleHeaderColumn: () => ({ state: n, dispatch: e }) => _n("column")(n, e),
      toggleHeaderRow: () => ({ state: n, dispatch: e }) => _n("row")(n, e),
      toggleHeaderCell: () => ({ state: n, dispatch: e }) => fb(n, e),
      mergeOrSplit: () => ({ state: n, dispatch: e }) => Nl(n, e) ? !0 : _l(n, e),
      setCellAttribute: (n, e) => ({ state: t, dispatch: i }) => pb(n, e)(t, i),
      goToNextCell: () => ({ state: n, dispatch: e }) => Ll(1)(n, e),
      goToPreviousCell: () => ({ state: n, dispatch: e }) => Ll(-1)(n, e),
      fixTables: () => ({ state: n, dispatch: e }) => (e && Yc(n), !0),
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
      Backspace: Yn,
      "Mod-Backspace": Yn,
      Delete: Yn,
      "Mod-Delete": Yn
    };
  },
  addProseMirrorPlugins() {
    return [
      ...this.options.resizable && this.editor.isEditable ? [
        Eb({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          defaultCellMinWidth: this.options.cellMinWidth,
          View: this.options.View,
          lastColumnResizable: this.options.lastColumnResizable
        })
      ] : [],
      Pb({
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
}), Vb = B.create({
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
}), Wb = B.create({
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
}), Ub = B.create({
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
}), ql = {
  "1-col": ["col-12"],
  "2-col": ["col-md-6", "col-md-6"],
  "3-col": ["col-md-4", "col-md-4", "col-md-4"],
  "4-col": ["col-md-3", "col-md-3", "col-md-3", "col-md-3"],
  "1-2": ["col-md-4", "col-md-8"],
  "2-1": ["col-md-8", "col-md-4"],
  "1-1-2": ["col-md-3", "col-md-3", "col-md-6"],
  "2-1-1": ["col-md-6", "col-md-3", "col-md-3"]
}, jb = B.create({
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
        const s = (ql[n] || ql["2-col"]).map((o) => ({
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
          content: s
        });
      },
      /**
       * Add a column to the current row.
       * @param {string} [colClass='col'] - Bootstrap column class
       */
      addColumnToRow: (n = "col") => ({ state: e, commands: t, editor: i }) => {
        const { $from: r } = e.selection;
        let s = null;
        for (let a = r.depth; a > 0; a--)
          if (r.node(a).type.name === "bootstrapRow") {
            s = r.before(a);
            break;
          }
        if (s === null) return !1;
        const o = e.doc.nodeAt(s);
        if (!o) return !1;
        const l = s + o.nodeSize - 1;
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
        let r = null;
        for (let l = i.depth; l > 0; l--)
          if (i.node(l).type.name === "bootstrapCol") {
            r = l;
            break;
          }
        if (r === null) return !1;
        const s = r - 1;
        if (i.node(s).type.name !== "bootstrapRow" || i.node(s).childCount <= 1) return !1;
        if (e) {
          const l = i.before(r), a = i.after(r);
          t.delete(l, a), e(t);
        }
        return !0;
      },
      /**
       * Change the column class of the current column.
       * @param {string} colClass - New Bootstrap column class
       */
      setColumnClass: (n) => ({ state: e, dispatch: t, tr: i }) => {
        const { $from: r } = e.selection;
        for (let s = r.depth; s > 0; s--)
          if (r.node(s).type.name === "bootstrapCol")
            return t && (i.setNodeMarkup(r.before(s), void 0, {
              ...r.node(s).attrs,
              colClass: n
            }), t(i)), !0;
        return !1;
      },
      /**
       * Change the gutter of the current row.
       * @param {number} gutter - Bootstrap gutter value (0-5)
       */
      setRowGutter: (n) => ({ state: e, dispatch: t, tr: i }) => {
        const { $from: r } = e.selection;
        for (let s = r.depth; s > 0; s--)
          if (r.node(s).type.name === "bootstrapRow")
            return t && (i.setNodeMarkup(r.before(s), void 0, {
              ...r.node(s).attrs,
              gutter: Math.max(0, Math.min(5, n))
            }), t(i)), !0;
        return !1;
      },
      /**
       * Delete the entire row.
       */
      deleteBootstrapRow: () => ({ state: n, dispatch: e, tr: t }) => {
        const { $from: i } = n.selection;
        for (let r = i.depth; r > 0; r--)
          if (i.node(r).type.name === "bootstrapRow") {
            if (e) {
              const s = i.before(r), o = i.after(r);
              t.delete(s, o), e(t);
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
        var i, r;
        const { state: e } = n, { $from: t } = e.selection;
        for (let s = t.depth; s > 0; s--)
          if (t.node(s).type.name === "bootstrapCol") {
            const o = t.node(s), l = t.node(s - 1);
            if (o.childCount === 1 && ((i = o.firstChild) == null ? void 0 : i.type.name) === "paragraph" && ((r = o.firstChild) == null ? void 0 : r.content.size) === 0 && l.type.name === "bootstrapRow" && l.childCount === 1)
              return n.commands.deleteBootstrapRow();
            break;
          }
        return !1;
      }
    };
  }
}), Kb = B.create({
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
}), Xn = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark"
], Jb = B.create({
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
          for (const t of Xn)
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
    const t = Xn.includes(n.attrs.type) ? n.attrs.type : "info";
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
        const t = Xn.includes(n) ? n : "info";
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
        const t = Xn.includes(n) ? n : "info";
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
}), Vl = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark"
], Gb = B.create({
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
          for (const t of Vl)
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
    const { headerText: t, footerText: i, borderColor: r } = n.attrs, s = ["card"];
    r && Vl.includes(r) && s.push(`border-${r}`);
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
        class: s.join(" ")
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
        const { headerText: t = null, footerText: i = null, borderColor: r = null } = n;
        return e.insertContent({
          type: this.name,
          attrs: { headerText: t, footerText: i, borderColor: r },
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
  }
}), en = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "link"
], Hr = ["sm", "lg"], Yb = B.create({
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
          for (const t of en)
            if (e.includes(`btn-outline-${t}`)) return t;
          for (const t of en)
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
    const { text: t, url: i, variant: r, size: s, outline: o, target: l } = n.attrs, a = en.includes(r) ? r : "primary", d = ["btn", o ? `btn-outline-${a}` : `btn-${a}`];
    return s && Hr.includes(s) && d.push(`btn-${s}`), [
      "span",
      D(e, {
        "data-type": "bootstrap-button",
        "data-url": i || "#",
        "data-variant": a,
        "data-size": s || "",
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
          variant: r = "primary",
          size: s = null,
          outline: o = !1,
          target: l = "_self"
        } = n;
        return e.insertContent({
          type: this.name,
          attrs: { text: t, url: i, variant: r, size: s, outline: o, target: l }
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
      const i = document.createElement("span"), { text: r, variant: s, size: o, outline: l, target: a } = n.attrs, c = en.includes(s) ? s : "primary", d = l ? `btn-outline-${c}` : `btn-${c}`;
      return i.className = `btn ${d}`, o && Hr.includes(o) && i.classList.add(`btn-${o}`), i.setAttribute("data-type", "bootstrap-button"), i.setAttribute("role", "button"), i.textContent = r || "Button", i.style.cursor = "pointer", i.contentEditable = "false", i.addEventListener("dblclick", (u) => {
        u.preventDefault(), u.stopPropagation();
        const p = prompt("Button text:", n.attrs.text || "Button");
        if (p === null) return;
        const h = prompt("Button URL:", n.attrs.url || "#");
        if (h === null) return;
        const f = e();
        typeof f == "number" && t.chain().focus().command(({ tr: m }) => (m.setNodeMarkup(f, void 0, {
          ...n.attrs,
          text: p,
          url: h
        }), !0)).run();
      }), {
        dom: i,
        update(u) {
          if (u.type.name !== "bootstrapButton") return !1;
          const p = en.includes(u.attrs.variant) ? u.attrs.variant : "primary", h = u.attrs.outline ? `btn-outline-${p}` : `btn-${p}`;
          return i.className = `btn ${h}`, u.attrs.size && Hr.includes(u.attrs.size) && i.classList.add(`btn-${u.attrs.size}`), i.textContent = u.attrs.text || "Button", !0;
        },
        destroy() {
        }
      };
    };
  }
}), Xb = ["left", "center", "right"], Qb = B.create({
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
      title: r,
      caption: s,
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
    const k = {
      src: t || "",
      alt: i || "",
      class: "img-fluid",
      loading: d || "lazy"
    };
    r && (k.title = r), o && (k.width = String(o)), l && (k.height = String(l));
    const w = ["img", k], S = [h ? ["a", { href: h, target: f || null, rel: f === "_blank" ? "noopener noreferrer" : null }, w] : w];
    return s && S.push(["figcaption", { class: "figure-caption" }, s]), ["figure", b, ...S];
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
          alignment: Xb.includes(n.alignment) ? n.alignment : "center",
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
      const r = (o) => {
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
          linkTarget: k
        } = o;
        i.innerHTML = "", i.classList.remove("text-start", "text-center", "text-end"), i.classList.add(
          h === "left" ? "text-start" : h === "right" ? "text-end" : "text-center"
        ), g && i.setAttribute("data-extra-class", g), m ? (i.style.width = m, i.style.display = "inline-block") : (i.style.width = "", i.style.display = ""), f && i.setAttribute("data-media-id", f);
        const w = document.createElement("img");
        if (w.src = l || "", w.alt = a || "", w.className = "img-fluid", w.loading = "lazy", c && (w.title = c), u && (w.width = u), p && (w.height = p), b) {
          const S = document.createElement("a");
          S.href = b, k && (S.target = k), k === "_blank" && (S.rel = "noopener noreferrer"), S.appendChild(w), i.appendChild(S);
        } else
          i.appendChild(w);
        if (d) {
          const S = document.createElement("figcaption");
          S.className = "figure-caption", S.textContent = d, i.appendChild(S);
        }
        const M = document.createElement("button");
        M.type = "button", M.className = "tiptap-image-edit-btn", M.title = "Edit image (double-click)", M.innerHTML = '<i class="bi bi-pencil-square"></i>', M.addEventListener("click", (S) => {
          S.preventDefault(), S.stopPropagation(), s();
        }), i.appendChild(M);
      }, s = () => {
        const o = e._tiptapToolbar;
        if (o != null && o.imageModal) {
          const l = typeof t == "function" ? t() : null;
          l !== null && e.chain().focus().setNodeSelection(l).run(), o.imageModal.open(n.attrs);
        }
      };
      return i.addEventListener("dblclick", (o) => {
        o.preventDefault(), o.stopPropagation(), s();
      }), r(n.attrs), {
        dom: i,
        update(o) {
          return o.type.name !== "customImage" ? !1 : (r(o.attrs), !0);
        },
        destroy() {
        }
      };
    };
  }
}), bn = {
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
function Ss(n) {
  for (const [e, t] of Object.entries(bn)) {
    const i = n.match(t.regex);
    if (i && i[1])
      return { provider: e, videoId: i[1] };
  }
  return /\.(mp4|webm)(\?|$)/i.test(n) ? { provider: "mp4", videoId: n } : null;
}
const Zb = B.create({
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
    const { provider: t, videoId: i, url: r, title: s, aspectRatio: o, alignment: l, widthStyle: a, caption: c } = n.attrs, d = o || "16x9", u = l === "left" ? "text-start" : l === "right" ? "text-end" : "text-center", p = a ? `width:${a}` : "", h = `tiptap-video-figure ${u}`, f = D(e, {
      "data-type": "custom-video",
      "data-provider": t,
      "data-video-id": i || "",
      "data-url": r || "",
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
          { controls: "true", class: "w-100", title: s || "" },
          ["source", { src: r || i || "", type: "video/mp4" }]
        ]
      ];
    else {
      const b = bn[t], k = b ? b.embedUrl(i) : "";
      m = [
        "div",
        f,
        [
          "iframe",
          {
            src: k,
            title: s || "",
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
        const t = Ss(n.url || "");
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
      const { provider: r, videoId: s, url: o, title: l, aspectRatio: a, alignment: c, widthStyle: d, caption: u } = n.attrs, p = a || "16x9", h = document.createElement("figure");
      h.className = `tiptap-video-figure ${c === "left" ? "text-start" : c === "right" ? "text-end" : "text-center"}`, d && (h.style.width = d);
      const f = document.createElement("div");
      if (f.className = `ratio ratio-${p} tiptap-video-wrapper`, f.setAttribute("data-type", "custom-video"), f.setAttribute("data-provider", r), r === "mp4") {
        const m = document.createElement("video");
        m.controls = !0, m.className = "w-100", m.title = l || "";
        const g = document.createElement("source");
        g.src = o || s || "", g.type = "video/mp4", m.appendChild(g), f.appendChild(m);
      } else {
        const m = document.createElement("iframe"), g = bn[r];
        m.src = g ? g.embedUrl(s) : "", m.title = l || "", m.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", m.allowFullscreen = !0, m.loading = "lazy", m.frameBorder = "0", f.appendChild(m);
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
          const g = m.attrs.provider, b = m.attrs.videoId, k = m.attrs.aspectRatio || "16x9", w = m.attrs.alignment || "center", M = m.attrs.widthStyle, S = m.attrs.caption || "";
          i.innerHTML = "";
          const O = document.createElement("figure");
          O.className = `tiptap-video-figure ${w === "left" ? "text-start" : w === "right" ? "text-end" : "text-center"}`, M && (O.style.width = M);
          const C = document.createElement("div");
          if (C.className = `ratio ratio-${k} tiptap-video-wrapper`, C.setAttribute("data-provider", g), g === "mp4") {
            const A = document.createElement("video");
            A.controls = !0, A.className = "w-100";
            const I = document.createElement("source");
            I.src = m.attrs.url || b || "", I.type = "video/mp4", A.appendChild(I), C.appendChild(A);
          } else {
            const A = document.createElement("iframe"), I = bn[g];
            A.src = I ? I.embedUrl(b) : "", A.title = m.attrs.title || "", A.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", A.allowFullscreen = !0, A.loading = "lazy", A.frameBorder = "0", C.appendChild(A);
          }
          if (O.appendChild(C), S) {
            const A = document.createElement("figcaption");
            A.textContent = S, O.appendChild(A);
          }
          return i.appendChild(O), !0;
        },
        destroy() {
        }
      };
    };
  }
}), Qn = 3, Wl = [2, 3, 4, 6], ey = B.create({
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
        default: Qn,
        parseHTML: (n) => {
          const e = parseInt(n.getAttribute("data-columns"), 10);
          return Wl.includes(e) ? e : Qn;
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
        const { images: t = [], columns: i = Qn, gap: r = 2, lightbox: s = !1 } = n;
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
          attrs: { columns: i, gap: r, lightbox: s },
          content: l
        });
      },
      /**
       * Change the number of columns in the current gallery.
       * @param {number} columns
       */
      setGalleryColumns: (n) => ({ commands: e }) => Wl.includes(n) ? e.updateAttributes(this.name, { columns: n }) : !1,
      /**
       * Toggle lightbox on the current gallery.
       */
      toggleGalleryLightbox: () => ({ commands: n, editor: e }) => {
        const t = e.getAttributes(this.name);
        return n.updateAttributes(this.name, { lightbox: !t.lightbox });
      }
    };
  }
}), ty = B.create({
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
function ny(n) {
  var e;
  const { char: t, allowSpaces: i, allowToIncludeChar: r, allowedPrefixes: s, startOfLine: o, $position: l } = n, a = i && !r, c = nm(t), d = new RegExp(`\\s${c}$`), u = o ? "^" : "", p = r ? "" : c, h = a ? new RegExp(`${u}${c}.*?(?=\\s${p}|$)`, "gm") : new RegExp(`${u}(?:^)?${c}[^\\s${p}]*`, "gm"), f = ((e = l.nodeBefore) === null || e === void 0 ? void 0 : e.isText) && l.nodeBefore.text;
  if (!f)
    return null;
  const m = l.pos - f.length, g = Array.from(f.matchAll(h)).pop();
  if (!g || g.input === void 0 || g.index === void 0)
    return null;
  const b = g.input.slice(Math.max(0, g.index - 1), g.index), k = new RegExp(`^[${s == null ? void 0 : s.join("")}\0]?$`).test(b);
  if (s !== null && !k)
    return null;
  const w = m + g.index;
  let M = w + g[0].length;
  return a && d.test(f.slice(M - 1, M + 1)) && (g[0] += " ", M += 1), w < l.pos && M >= l.pos ? {
    range: {
      from: w,
      to: M
    },
    query: g[0].slice(t.length),
    text: g[0]
  } : null;
}
const iy = new J("suggestion");
function ry({ pluginKey: n = iy, editor: e, char: t = "@", allowSpaces: i = !1, allowToIncludeChar: r = !1, allowedPrefixes: s = [" "], startOfLine: o = !1, decorationTag: l = "span", decorationClass: a = "suggestion", decorationContent: c = "", decorationEmptyClass: d = "is-empty", command: u = () => null, items: p = () => [], render: h = () => ({}), allow: f = () => !0, findSuggestionMatch: m = ny }) {
  let g;
  const b = h == null ? void 0 : h(), k = new U({
    key: n,
    view() {
      return {
        update: async (w, M) => {
          var S, O, C, A, I, Ce, Ie;
          const H = (S = this.key) === null || S === void 0 ? void 0 : S.getState(M), ce = (O = this.key) === null || O === void 0 ? void 0 : O.getState(w.state), De = H.active && ce.active && H.range.from !== ce.range.from, ft = !H.active && ce.active, Pe = H.active && !ce.active, Be = !ft && !Pe && H.query !== ce.query, Yt = ft || De && Be, Dn = Be || De, cr = Pe || De && Be;
          if (!Yt && !Dn && !cr)
            return;
          const Dt = cr && !Yt ? H : ce, oo = w.dom.querySelector(`[data-decoration-id="${Dt.decorationId}"]`);
          g = {
            editor: e,
            range: Dt.range,
            query: Dt.query,
            text: Dt.text,
            items: [],
            command: (Xt) => u({
              editor: e,
              range: Dt.range,
              props: Xt
            }),
            decorationNode: oo,
            // virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            clientRect: oo ? () => {
              var Xt;
              const { decorationId: td } = (Xt = this.key) === null || Xt === void 0 ? void 0 : Xt.getState(e.state), dr = w.dom.querySelector(`[data-decoration-id="${td}"]`);
              return (dr == null ? void 0 : dr.getBoundingClientRect()) || null;
            } : null
          }, Yt && ((C = b == null ? void 0 : b.onBeforeStart) === null || C === void 0 || C.call(b, g)), Dn && ((A = b == null ? void 0 : b.onBeforeUpdate) === null || A === void 0 || A.call(b, g)), (Dn || Yt) && (g.items = await p({
            editor: e,
            query: Dt.query
          })), cr && ((I = b == null ? void 0 : b.onExit) === null || I === void 0 || I.call(b, g)), Dn && ((Ce = b == null ? void 0 : b.onUpdate) === null || Ce === void 0 || Ce.call(b, g)), Yt && ((Ie = b == null ? void 0 : b.onStart) === null || Ie === void 0 || Ie.call(b, g));
        },
        destroy: () => {
          var w;
          g && ((w = b == null ? void 0 : b.onExit) === null || w === void 0 || w.call(b, g));
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
      apply(w, M, S, O) {
        const { isEditable: C } = e, { composing: A } = e.view, { selection: I } = w, { empty: Ce, from: Ie } = I, H = { ...M };
        if (H.composing = A, C && (Ce || e.view.composing)) {
          (Ie < M.range.from || Ie > M.range.to) && !A && !M.composing && (H.active = !1);
          const ce = m({
            char: t,
            allowSpaces: i,
            allowToIncludeChar: r,
            allowedPrefixes: s,
            startOfLine: o,
            $position: I.$from
          }), De = `id_${Math.floor(Math.random() * 4294967295)}`;
          ce && f({
            editor: e,
            state: O,
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
      handleKeyDown(w, M) {
        var S;
        const { active: O, range: C } = k.getState(w.state);
        return O && ((S = b == null ? void 0 : b.onKeyDown) === null || S === void 0 ? void 0 : S.call(b, { view: w, event: M, range: C })) || !1;
      },
      // Setup decorator on the currently active suggestion.
      decorations(w) {
        const { active: M, range: S, decorationId: O, query: C } = k.getState(w);
        if (!M)
          return null;
        const A = !(C != null && C.length), I = [a];
        return A && I.push(d), F.create(w.doc, [
          re.inline(S.from, S.to, {
            nodeName: l,
            class: I.join(" "),
            "data-decoration-id": O,
            "data-decoration-content": c
          })
        ]);
      }
    }
  });
  return k;
}
const sy = new J("slashCommands"), oy = [
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
function ly(n, e) {
  if (!e) return n;
  const t = e.toLowerCase();
  return n.filter(
    (i) => i.label.toLowerCase().includes(t) || i.description.toLowerCase().includes(t) || i.group.toLowerCase().includes(t)
  );
}
function ay(n) {
  const e = {};
  return n.forEach((t) => {
    const i = t.group || "Other";
    e[i] || (e[i] = []), e[i].push(t);
  }), e;
}
function cy() {
  let n = null, e = 0, t = [], i = null;
  function r() {
    const a = document.createElement("div");
    return a.className = "tiptap-slash-menu", a.setAttribute("role", "listbox"), a.style.display = "none", document.body.appendChild(a), a;
  }
  function s(a) {
    if (!n) return;
    t = a;
    const c = ay(a);
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
        e = parseInt(h.getAttribute("data-index"), 10), s(t);
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
      n || (n = r()), e = 0, i = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, s(a.items), l(a.clientRect);
    },
    onUpdate(a) {
      e = 0, i = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, s(a.items), l(a.clientRect);
    },
    onKeyDown(a) {
      const { event: c } = a;
      return c.key === "ArrowUp" ? (c.preventDefault(), e = (e - 1 + t.length) % t.length, s(t), !0) : c.key === "ArrowDown" ? (c.preventDefault(), e = (e + 1) % t.length, s(t), !0) : c.key === "Enter" ? (c.preventDefault(), o(e), !0) : c.key === "Escape" ? (c.preventDefault(), n && (n.style.display = "none"), !0) : !1;
    },
    onExit() {
      n && (n.style.display = "none"), t = [], i = null;
    }
  };
}
const dy = K.create({
  name: "slashCommands",
  addOptions() {
    return {
      commands: null,
      filterFn: null
    };
  },
  addProseMirrorPlugins() {
    const n = this.options.commands || oy, e = this.options.filterFn || ly;
    return [
      ry({
        editor: this.editor,
        char: "/",
        pluginKey: sy,
        startOfLine: !1,
        items: ({ query: t }) => e(n, t),
        render: cy
      })
    ];
  }
});
class uy {
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
    const e = (s) => this._modal.querySelector(s), t = (s) => this._modal.querySelectorAll(s);
    t(".tiptap-img-tab-btn").forEach((s) => {
      s.addEventListener("click", () => {
        t(".tiptap-img-tab-btn").forEach((o) => o.classList.remove("active")), t(".tiptap-img-panel").forEach((o) => o.classList.add("d-none")), s.classList.add("active"), e(`[data-panel="${s.dataset.tab}"]`).classList.remove("d-none");
      });
    }), e(".tiptap-img-file-input").addEventListener("change", (s) => {
      var l;
      const o = (l = s.target.files) == null ? void 0 : l[0];
      o && this._handleFileSelected(o);
    });
    const r = e("#tiptap-img-dropzone-el");
    r.addEventListener("dragover", (s) => {
      s.preventDefault(), r.classList.add("tiptap-img-dragover");
    }), r.addEventListener("dragleave", () => r.classList.remove("tiptap-img-dragover")), r.addEventListener("drop", (s) => {
      var l;
      s.preventDefault(), r.classList.remove("tiptap-img-dragover");
      const o = (l = s.dataTransfer.files) == null ? void 0 : l[0];
      o != null && o.type.startsWith("image/") && this._handleFileSelected(o);
    }), e(".tiptap-img-url-input").addEventListener("input", (s) => {
      this._updatePreview(s.target.value.trim());
    }), t(".tiptap-img-align-radio").forEach((s) => {
      s.addEventListener("change", () => {
        var o;
        t(".tiptap-align-btn").forEach((l) => l.classList.remove("tiptap-align-active")), (o = s.closest(".tiptap-align-btn")) == null || o.classList.add("tiptap-align-active");
      });
    }), t(".tiptap-width-btn").forEach((s) => {
      s.addEventListener("click", () => {
        t(".tiptap-width-btn").forEach((o) => o.classList.remove("active")), s.classList.add("active"), e(".tiptap-img-width-input").value = s.dataset.width;
      });
    }), e(".tiptap-img-width-input").addEventListener("input", () => {
      t(".tiptap-width-btn").forEach((s) => s.classList.remove("active"));
    }), e(".tiptap-img-insert-btn").addEventListener("click", () => this._insert()), this._modal.addEventListener("hidden.bs.modal", () => this._reset());
  }
  _handleFileSelected(e) {
    this._pendingFile = e;
    const t = new FileReader();
    t.onload = (o) => this._updatePreview(o.target.result), t.readAsDataURL(e);
    const i = this._modal.querySelector(".tiptap-img-dropzone-label");
    i && (i.textContent = "📎 " + e.name);
    const r = this._modal.querySelector(".tiptap-img-file-name");
    r && (r.textContent = e.name, r.classList.remove("d-none"));
    const s = this._modal.querySelector(".tiptap-img-alt-input");
    s && !s.value && (s.value = e.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }
  _updatePreview(e) {
    const t = this._modal.querySelector(".tiptap-img-preview"), i = this._modal.querySelector(".tiptap-img-preview-placeholder");
    e ? (t.src = e, t.style.display = "", i && (i.style.display = "none")) : (t.src = "", t.style.display = "none", i && (i.style.display = ""));
  }
  _populate(e) {
    var l;
    const t = (a) => this._modal.querySelector(a), i = (a) => this._modal.querySelectorAll(a);
    t('[data-tab="url"]').click(), t(".tiptap-img-url-input").value = e.src || "", t(".tiptap-img-alt-input").value = e.alt || "", t(".tiptap-img-caption-input").value = e.caption || "", t(".tiptap-img-link-input").value = e.linkUrl || "", t(".tiptap-img-link-blank").checked = e.linkTarget === "_blank", t(".tiptap-img-width-input").value = e.widthStyle || "", t(".tiptap-img-class-input").value = e.extraClass || "", e.src && this._updatePreview(e.src);
    const r = e.alignment || "center", s = t(`[name="tiptap-img-align-radio"][value="${r}"]`);
    s && (s.checked = !0, i(".tiptap-align-btn").forEach((a) => a.classList.remove("tiptap-align-active")), (l = s.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active"));
    const o = e.widthStyle || "";
    i(".tiptap-width-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.width === o);
    }), t(".tiptap-img-modal-title-text").textContent = "Edit Image", t(".tiptap-img-insert-btn-label").textContent = "Update Image";
  }
  async _insert() {
    var g, b;
    const e = (k) => this._modal.querySelector(k), t = (g = this._modal.querySelector(".tiptap-img-tab-btn.active")) == null ? void 0 : g.dataset.tab, i = e(".tiptap-img-alt-input").value.trim(), r = e(".tiptap-img-caption-input").value.trim(), s = e(".tiptap-img-link-input").value.trim(), o = e(".tiptap-img-link-blank").checked, l = e(".tiptap-img-width-input").value.trim(), a = e(".tiptap-img-class-input").value.trim(), c = ((b = e('[name="tiptap-img-align-radio"]:checked')) == null ? void 0 : b.value) || "center";
    let d = null;
    l && (l.endsWith("%") || l.endsWith("px") ? d = l : isNaN(parseFloat(l)) || (d = parseFloat(l) + "px"));
    const u = e(".tiptap-img-insert-btn");
    u.disabled = !0, u.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing…';
    let p = null, h = null, f = null, m = null;
    try {
      if (t === "upload" && this._pendingFile) {
        const w = this.toolbar._getUploadUrl();
        if (w) {
          const M = await this.toolbar._uploadFile(this._pendingFile, w);
          p = M.url, h = M.id || null, f = M.width || null, m = M.height || null;
        } else
          p = await this._toBase64(this._pendingFile);
      } else
        p = e(".tiptap-img-url-input").value.trim();
      if (!p) {
        this._showError("Please provide an image file or URL.");
        return;
      }
      const k = {
        src: p,
        alt: i || "",
        caption: r || null,
        linkUrl: s || null,
        linkTarget: s && o ? "_blank" : null,
        widthStyle: d || null,
        extraClass: a || null,
        alignment: c,
        mediaId: h || null,
        // Keep pixel dimensions from upload for img width/height attributes
        width: f || null,
        height: m || null
      };
      this._editMode ? this.editor.chain().focus().updateCustomImage(k).run() : this.editor.chain().focus().insertCustomImage(k).run(), this._bs.hide();
    } catch (k) {
      console.error("[TiptapEditor] Image modal error:", k), this._showError(k.message || "Image operation failed.");
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
      const r = new FileReader();
      r.onload = (s) => t(s.target.result), r.onerror = i, r.readAsDataURL(e);
    });
  }
  _reset() {
    var l, a, c;
    const e = (d) => this._modal.querySelector(d), t = (d) => this._modal.querySelectorAll(d);
    this._pendingFile = null, this._editMode = !1;
    const i = e(".tiptap-img-file-input");
    i && (i.value = ""), e(".tiptap-img-url-input").value = "", e(".tiptap-img-alt-input").value = "", e(".tiptap-img-caption-input").value = "", e(".tiptap-img-link-input").value = "", e(".tiptap-img-link-blank").checked = !1, e(".tiptap-img-width-input").value = "", e(".tiptap-img-class-input").value = "", this._updatePreview("");
    const r = e(".tiptap-img-dropzone-label");
    r && (r.textContent = "Drag & drop image here, or click to browse");
    const s = e(".tiptap-img-file-name");
    s && s.classList.add("d-none");
    const o = e('[name="tiptap-img-align-radio"][value="center"]');
    o && (o.checked = !0, t(".tiptap-align-btn").forEach((d) => d.classList.remove("tiptap-align-active")), (l = o.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active")), t(".tiptap-width-btn").forEach((d) => d.classList.remove("active")), (a = e('[data-width=""]')) == null || a.classList.add("active"), (c = e('[data-tab="upload"]')) == null || c.click(), e(".tiptap-img-modal-title-text").textContent = "Insert Image", e(".tiptap-img-insert-btn-label").textContent = "Insert Image";
  }
}
class py {
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
    const { from: e, to: t } = this.editor.state.selection, i = this.editor.state.doc.textBetween(e, t, " "), r = this._modal.querySelector(".tiptap-link-selected-text"), s = this._modal.querySelector(".tiptap-link-selected-text-label");
    i && i.trim() && (r && r.classList.remove("d-none"), s && (s.textContent = i.length > 60 ? i.substring(0, 60) + "…" : i));
  }
  _populate(e) {
    const t = e.href || "", i = e.target || "", r = e.rel || "", s = e.title || "", o = e.class || "";
    t.startsWith("mailto:") ? (this._switchType("email"), this._modal.querySelector(".tiptap-link-email-input").value = t.replace("mailto:", "")) : t.startsWith("tel:") ? (this._switchType("tel"), this._modal.querySelector(".tiptap-link-tel-input").value = t.replace("tel:", "")) : t.startsWith("#") ? (this._switchType("anchor"), this._modal.querySelector(".tiptap-link-anchor-input").value = t.replace("#", "")) : (this._switchType("url"), this._modal.querySelector(".tiptap-link-href-input").value = t), this._modal.querySelector(".tiptap-link-title-input").value = s, this._modal.querySelector(".tiptap-link-class-input").value = o, this._modal.querySelector(".tiptap-link-blank-check").checked = i === "_blank";
    const l = r.split(/\s+/).filter(Boolean);
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
    const t = this._modal.querySelector(".tiptap-link-blank-check").checked ? "_blank" : null, i = this._getRel() || null, r = this._modal.querySelector(".tiptap-link-title-input").value.trim() || null, s = this._modal.querySelector(".tiptap-link-class-input").value.trim() || null, o = { href: e };
    t && (o.target = t), i && (o.rel = i), r && (o.title = r), s && (o.class = s), this.editor.chain().focus().extendMarkRange("link").setLink(o).run(), this._bs.hide();
  }
  _unlink() {
    this.editor.chain().focus().unsetLink().run(), this._bs.hide();
  }
}
class hy {
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
    this._modal.querySelectorAll(".tiptap-video-tab-btn").forEach((r) => {
      r.addEventListener("click", () => this._switchTab(r.dataset.tab));
    });
    const e = this._modal.querySelector(".tiptap-video-url-input");
    e.addEventListener("input", () => this._detectProvider()), e.addEventListener("blur", () => this._detectProvider());
    const t = this._modal.querySelector(".tiptap-video-file-input"), i = this._modal.querySelector(".tiptap-video-dropzone");
    t.addEventListener("change", (r) => {
      var o;
      const s = (o = r.target.files) == null ? void 0 : o[0];
      s && this._handleFileSelect(s);
    }), i.addEventListener("dragover", (r) => {
      r.preventDefault(), i.classList.add("tiptap-dropzone-active");
    }), i.addEventListener("dragleave", () => {
      i.classList.remove("tiptap-dropzone-active");
    }), i.addEventListener("drop", (r) => {
      var o, l;
      r.preventDefault(), i.classList.remove("tiptap-dropzone-active");
      const s = (l = (o = r.dataTransfer) == null ? void 0 : o.files) == null ? void 0 : l[0];
      s && (s.type === "video/mp4" || s.type === "video/webm") && this._handleFileSelect(s);
    }), this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((r) => {
      r.addEventListener("click", () => {
        this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((s) => s.classList.remove("active")), r.classList.add("active");
      });
    }), this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((r) => {
      r.addEventListener("change", () => {
        this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((s) => {
          s.closest(".tiptap-align-btn").classList.toggle("tiptap-align-active", s.checked);
        });
      });
    }), this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((r) => {
      r.addEventListener("click", () => {
        this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((s) => s.classList.remove("active")), r.classList.add("active"), this._modal.querySelector(".tiptap-video-width-input").value = r.dataset.width || "";
      });
    }), this._modal.querySelector(".tiptap-video-width-input").addEventListener("input", () => {
      this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((r) => r.classList.remove("active"));
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
    const r = this._modal.querySelector(".tiptap-video-provider-badge");
    r && r.classList.add("d-none"), this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((s) => {
      s.classList.toggle("active", s.dataset.ratio === "16x9");
    }), this._modal.querySelectorAll(".tiptap-video-align-radio").forEach((s) => {
      const o = s.value === "center";
      s.checked = o, s.closest(".tiptap-align-btn").classList.toggle("tiptap-align-active", o);
    }), this._modal.querySelectorAll(".tiptap-video-width-btn").forEach((s) => {
      s.classList.toggle("active", s.dataset.width === "");
    }), this._hidePreview(), this._switchTab("url");
  }
  _populate(e) {
    const t = e.url || "", i = e.title || "", r = e.caption || "", s = e.aspectRatio || "16x9", o = e.alignment || "center", l = e.widthStyle || "";
    this._modal.querySelector(".tiptap-video-url-input").value = t, this._detectProvider(), this._modal.querySelector(".tiptap-video-title-input").value = i, this._modal.querySelector(".tiptap-video-caption-input").value = r, this._modal.querySelectorAll(".tiptap-video-ratio-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.ratio === s);
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
    const r = Ss(e);
    if (r) {
      const s = { youtube: "YouTube", vimeo: "Vimeo", mp4: "MP4/WebM" };
      i.textContent = s[r.provider] || r.provider, t.classList.remove("d-none"), this._showPreview(e, r.provider, r.videoId);
    } else
      t.classList.add("d-none"), this._hidePreview();
  }
  _handleFileSelect(e) {
    this._pendingFile = e;
    const t = this._modal.querySelector(".tiptap-video-file-name");
    t && (t.textContent = e.name, t.classList.remove("d-none"));
    const i = this._modal.querySelector(".tiptap-video-dropzone-label");
    i && (i.textContent = "File selected");
    const r = URL.createObjectURL(e);
    this._showPreview(r, "mp4");
  }
  _showPreview(e, t, i = null) {
    const r = this._modal.querySelector(".tiptap-video-preview"), s = this._modal.querySelector(".tiptap-video-preview-placeholder");
    if (r.innerHTML = "", t === "mp4") {
      const o = document.createElement("video");
      o.controls = !0, o.className = "w-100", o.style.maxHeight = "160px";
      const l = document.createElement("source");
      l.src = e, l.type = "video/mp4", o.appendChild(l), r.appendChild(o);
    } else {
      const o = bn[t];
      if (o && i) {
        const l = document.createElement("iframe");
        l.src = o.embedUrl(i), l.className = "w-100", l.style.height = "160px", l.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", l.allowFullscreen = !0, l.loading = "lazy", l.frameBorder = "0", r.appendChild(l);
      }
    }
    r.childElementCount > 0 && (r.style.display = "", s && (s.style.display = "none"));
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
      const m = Ss(e);
      if (!m) {
        const g = this._modal.querySelector(".tiptap-video-url-input");
        g.classList.add("is-invalid"), g.focus(), alert("Unsupported video URL. Supported: YouTube, Vimeo, MP4/WebM."), setTimeout(() => g.classList.remove("is-invalid"), 2e3);
        return;
      }
      t = m.provider, i = m.videoId;
    }
    const s = this._modal.querySelector(".tiptap-video-title-input").value.trim(), o = this._modal.querySelector(".tiptap-video-caption-input").value.trim(), l = ((h = this._modal.querySelector(".tiptap-video-ratio-btn.active")) == null ? void 0 : h.dataset.ratio) || "16x9", a = ((f = this._modal.querySelector(".tiptap-video-align-radio:checked")) == null ? void 0 : f.value) || "center";
    let c = this._modal.querySelector(".tiptap-video-width-input").value.trim();
    const d = this._modal.querySelector(".tiptap-video-width-btn.active");
    d && d.dataset.width && (c = d.dataset.width), c && !/^\d+(\.\d+)?(px|%)$/.test(c) && (c = "");
    const u = {
      url: e,
      provider: t,
      videoId: i,
      title: s || "",
      caption: o || "",
      aspectRatio: l,
      alignment: a,
      widthStyle: c || null
    };
    this._editMode ? this.editor.chain().focus().updateCustomVideo(u).run() : this.editor.chain().focus().insertCustomVideo(u).run(), this._bs.hide();
  }
}
const zr = {
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
    command: "insertTable",
    commandArgs: { rows: 3, cols: 3, withHeaderRow: !0 }
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
}, fy = [
  { id: "1-col", label: "1 Column", icon: "[ 12 ]" },
  { id: "2-col", label: "2 Columns", icon: "[ 6 | 6 ]" },
  { id: "3-col", label: "3 Columns", icon: "[ 4 | 4 | 4 ]" },
  { id: "4-col", label: "4 Columns", icon: "[ 3 | 3 | 3 | 3 ]" },
  { id: "1-2", label: "Sidebar Left", icon: "[ 4 | 8 ]" },
  { id: "2-1", label: "Sidebar Right", icon: "[ 8 | 4 ]" },
  { id: "1-1-2", label: "2 Narrow + Wide", icon: "[ 3 | 3 | 6 ]" },
  { id: "2-1-1", label: "Wide + 2 Narrow", icon: "[ 6 | 3 | 3 ]" }
], my = [
  { id: "primary", label: "Primary", color: "#0d6efd" },
  { id: "secondary", label: "Secondary", color: "#6c757d" },
  { id: "success", label: "Success", color: "#198754" },
  { id: "danger", label: "Danger", color: "#dc3545" },
  { id: "warning", label: "Warning", color: "#ffc107" },
  { id: "info", label: "Info", color: "#0dcaf0" },
  { id: "light", label: "Light", color: "#f8f9fa" },
  { id: "dark", label: "Dark", color: "#212529" }
];
class gy {
  /**
   * @param {HTMLElement} toolbarElement - The [data-tiptap-toolbar] element
   * @param {import('@tiptap/core').Editor} editor - Tiptap editor instance
   * @param {Object} config - Toolbar config with groups
   */
  constructor(e, t, i = {}) {
    this.element = e, this.editor = t, this.config = i, this.buttons = /* @__PURE__ */ new Map(), this.editor._tiptapToolbar = this, this.imageModal = new uy(this), this.linkModal = new py(this), this.videoModal = new hy(this), this._render(), this._bindEvents();
  }
  /**
   * Render toolbar buttons into the toolbar element.
   * @private
   */
  _render() {
    const e = this.config.groups || {}, t = this.element.querySelector(".tiptap-toolbar") || this.element;
    t.innerHTML = "";
    const i = Object.keys(e);
    i.forEach((r, s) => {
      const o = e[r];
      if (!o || o.length === 0) return;
      const l = document.createElement("div");
      if (l.className = "tiptap-toolbar__group", l.setAttribute("role", "group"), l.setAttribute("aria-label", r), o.forEach((a) => {
        const c = zr[a];
        c && (c.type === "color" ? l.appendChild(this._createColorButton(a, c)) : c.type === "dropdown" ? l.appendChild(this._createDropdownButton(a, c)) : l.appendChild(this._createButton(a, c)));
      }), t.appendChild(l), s < i.length - 1) {
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
    const r = document.createElement("button");
    r.type = "button", r.className = "tiptap-toolbar__button", r.setAttribute("data-action", e), r.setAttribute("aria-label", t.label), r.setAttribute("title", t.label), r.innerHTML = `<i class="bi bi-${t.icon}"></i>`;
    const s = document.createElement("input");
    return s.type = "color", s.className = "tiptap-toolbar__color-input", s.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; padding: 0; border: 0; cursor: pointer; opacity: 0.7;", s.value = "#000000", s.addEventListener("input", (o) => {
      this.editor.chain().focus().setColor(o.target.value).run();
    }), r.addEventListener("click", () => {
      s.click();
    }), i.appendChild(r), i.appendChild(s), this.buttons.set(e, r), i;
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
    const r = document.createElement("button");
    r.type = "button", r.className = "tiptap-toolbar__button", r.setAttribute("data-action", e), r.setAttribute("aria-label", t.label), r.setAttribute("title", t.label), r.setAttribute("aria-haspopup", "true"), r.setAttribute("aria-expanded", "false"), r.innerHTML = `<i class="bi bi-${t.icon}"></i>`;
    const s = document.createElement("div");
    return s.className = "tiptap-toolbar__dropdown-menu", s.setAttribute("role", "menu"), s.style.display = "none", e === "row" && fy.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-layout-preset", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__preset-icon">${o.icon}</span> <span>${o.label}</span>`, s.appendChild(l);
    }), e === "alert" && my.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-alert-type", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__alert-swatch" style="background:${o.color}"></span> <span>${o.label}</span>`, s.appendChild(l);
    }), r.addEventListener("click", (o) => {
      o.stopPropagation();
      const l = s.style.display !== "none";
      this._closeAllDropdowns(), l || (s.style.display = "block", r.setAttribute("aria-expanded", "true"));
    }), s.addEventListener("click", (o) => {
      const l = o.target.closest("[data-layout-preset]");
      if (l) {
        o.stopPropagation();
        const c = l.getAttribute("data-layout-preset");
        this.editor.chain().focus().insertBootstrapRow(c).run(), s.style.display = "none", r.setAttribute("aria-expanded", "false");
        return;
      }
      const a = o.target.closest("[data-alert-type]");
      if (a) {
        o.stopPropagation();
        const c = a.getAttribute("data-alert-type");
        this.editor.chain().focus().insertBootstrapAlert(c).run(), s.style.display = "none", r.setAttribute("aria-expanded", "false");
      }
    }), i.appendChild(r), i.appendChild(s), this.buttons.set(e, r), i;
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
    const t = zr[e];
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
    const r = this.editor.chain().focus();
    t.commandArgs !== void 0 ? r[i](t.commandArgs).run() : r[i]().run();
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
    var r;
    const e = this.element.closest("[data-tiptap-editor]"), t = e == null ? void 0 : e.getAttribute("data-upload-url");
    return t || ((r = document.querySelector('meta[name="tiptap-upload-url"]')) == null ? void 0 : r.content) || null;
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
    const r = ((l = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : l.content) || "", s = await fetch(t, {
      method: "POST",
      headers: {
        "X-CSRF-TOKEN": r,
        Accept: "application/json"
      },
      body: i
    });
    if (!s.ok)
      throw new Error(`Upload failed with status ${s.status}`);
    const o = await s.json();
    return o.media || o;
  }
  /**
   * Handle card insertion with prompt for header text.
   * @private
   */
  _handleInsertCard() {
    const e = prompt("Card header (leave empty for no header):") || null;
    this.editor.chain().focus().insertBootstrapCard({ headerText: e }).run();
  }
  /**
   * Handle button insertion with prompts.
   * @private
   */
  _handleInsertButton() {
    const e = prompt("Button text:", "Click me");
    if (e === null) return;
    const t = prompt("Button URL:", "#");
    t !== null && this.editor.chain().focus().insertBootstrapButton({ text: e, url: t }).run();
  }
  /**
   * Handle video insertion with URL prompt.
   * @private
   */
  _handleVideo() {
    this.videoModal.open();
  }
  /**
   * Handle gallery insertion with file picker for multiple images.
   * @private
   */
  _handleGallery() {
    const e = document.createElement("input");
    e.type = "file", e.accept = "image/*", e.multiple = !0, e.style.display = "none", e.addEventListener("change", async (t) => {
      const i = Array.from(t.target.files || []);
      if (i.length !== 0)
        try {
          const r = this._getUploadUrl(), s = [];
          for (const o of i)
            if (r) {
              const l = await this._uploadFile(o, r);
              s.push({ src: l.url, alt: l.alt || o.name });
            } else {
              const l = await new Promise((a) => {
                const c = new FileReader();
                c.onload = () => a(c.result), c.readAsDataURL(o);
              });
              s.push({ src: l, alt: o.name });
            }
          if (s.length > 0) {
            const o = s.length >= 4 ? 4 : s.length >= 3 ? 3 : 2;
            this.editor.chain().focus().insertGallery({ images: s, columns: o }).run();
          }
        } catch (r) {
          console.error("[TiptapEditor] Gallery upload failed:", r), alert("Gallery upload failed. Please try again.");
        } finally {
          e.remove();
        }
    }), document.body.appendChild(e), e.click();
  }
  /**
   * Update active states of all toolbar buttons based on current editor state.
   * @param {import('@tiptap/core').Editor} editor
   */
  updateActiveStates(e) {
    this.buttons.forEach((t, i) => {
      const r = zr[i];
      if (!r || !r.isActive) {
        t.classList.remove("tiptap-toolbar__button--active");
        return;
      }
      try {
        const s = r.isActive(e);
        t.classList.toggle("tiptap-toolbar__button--active", s);
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
    var e, t, i;
    (e = this.imageModal) == null || e.destroy(), this.imageModal = null, (t = this.linkModal) == null || t.destroy(), this.linkModal = null, (i = this.videoModal) == null || i.destroy(), this.videoModal = null, this.buttons.clear(), this.element.innerHTML = "", this.editor && (this.editor._tiptapToolbar = null), this.editor = null;
  }
}
const tn = {
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
}, by = 10, $r = "tiptap_ai_recent_prompts";
class yy {
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
          ${Object.entries(tn).map(
      ([t, i]) => `<button type="button" class="tiptap-ai-panel__action-btn${t === "generate" ? " active" : ""}" data-ai-action="${t}" title="${i.description}">
          <i class="bi bi-${i.icon}"></i> ${i.label}
        </button>`
    ).join("")}
        </div>

        <p class="tiptap-ai-panel__action-desc" data-ai-action-desc>
          ${tn.generate.description}
        </p>

        <!-- Input Section -->
        <div class="tiptap-ai-panel__input-section" data-ai-input-section>
          <textarea
            class="tiptap-ai-panel__prompt"
            data-ai-prompt
            rows="4"
            placeholder="${tn.generate.placeholder}"
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
    const t = tn[e];
    this._els.actionButtons.forEach((i) => {
      i.classList.toggle("active", i.dataset.aiAction === e);
    }), this._els.promptArea.placeholder = t.placeholder, this._els.actionDescription.textContent = t.description, this._els.submitBtn.innerHTML = `<i class="bi bi-${t.icon}"></i> ${t.label}`, this._showInput();
  }
  /**
   * Submit the AI request.
   * @private
   */
  async _submit() {
    var s;
    const e = this._els.promptArea.value.trim();
    if (!e) {
      this._els.promptArea.classList.add("is-invalid"), this._els.promptArea.focus();
      return;
    }
    this._els.promptArea.classList.remove("is-invalid");
    const t = this.currentAction, i = tn[t];
    let r = { prompt: e, action: t };
    if (i.requiresContent) {
      const o = this.editorInstance.editor, a = this._getSelectedHtml() || o.getHTML();
      if (!a || a === "<p></p>") {
        this._showError("No content available. Please write or select some content first.");
        return;
      }
      r.content = a, t === "translate" && (r.target_lang = e);
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
        body: JSON.stringify(r),
        signal: this._abortController.signal
      });
      if (!l.ok) {
        const c = await l.json().catch(() => ({})), d = c.error || c.message || `Request failed (${l.status})`;
        throw new Error(d);
      }
      const a = await l.json();
      if (a.success && ((s = a.data) != null && s.content))
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
      const { from: i, to: r } = e.state.selection;
      i !== r ? e.chain().focus().deleteSelection().insertContent(this.previewContent).run() : e.commands.setContent(this.previewContent);
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
    const r = e.state.doc.slice(t, i), s = document.createElement("div"), o = e.view.domSerializer.serializeFragment(r.content);
    return s.appendChild(o), s.innerHTML;
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
      let t = JSON.parse(localStorage.getItem($r) || "[]");
      t = t.filter((i) => i !== e), t.unshift(e), t = t.slice(0, by), localStorage.setItem($r, JSON.stringify(t)), this._loadRecentPrompts();
    } catch {
    }
  }
  /**
   * Load and render recent prompts.
   * @private
   */
  _loadRecentPrompts() {
    try {
      const e = JSON.parse(localStorage.getItem($r) || "[]");
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
      `, this._els.recentList.querySelectorAll(".tiptap-ai-panel__recent-item").forEach((i, r) => {
        i.addEventListener("click", () => {
          this._els.promptArea.value = e[r], this._els.promptArea.focus();
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
const ky = [
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
], wy = [
  { id: "paragraph", label: "Paragraph", icon: "text-paragraph" },
  { id: "heading1", label: "Heading 1", icon: "type-h1" },
  { id: "heading2", label: "Heading 2", icon: "type-h2" },
  { id: "heading3", label: "Heading 3", icon: "type-h3" },
  { id: "bulletList", label: "Bullet List", icon: "list-ul" },
  { id: "orderedList", label: "Ordered List", icon: "list-ol" },
  { id: "blockquote", label: "Blockquote", icon: "blockquote-left" },
  { id: "codeBlock", label: "Code Block", icon: "code-square" }
];
class vy {
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
    this.handleEl = document.createElement("button"), this.handleEl.type = "button", this.handleEl.className = "tiptap-block-handle", this.handleEl.innerHTML = '<i class="bi bi-grip-vertical"></i>', this.handleEl.setAttribute("aria-label", "Block actions"), this.handleEl.setAttribute("title", "Block actions"), this.handleEl.style.display = "none", this.menuEl = document.createElement("div"), this.menuEl.className = "tiptap-block-menu", this.menuEl.setAttribute("role", "menu"), this.menuEl.style.display = "none", ky.forEach((i) => {
      if (i.separator) {
        const s = document.createElement("div");
        s.className = "tiptap-block-menu__separator", this.menuEl.appendChild(s);
      }
      const r = document.createElement("button");
      r.type = "button", r.className = `tiptap-block-menu__item${i.danger ? " tiptap-block-menu__item--danger" : ""}`, r.setAttribute("data-action", i.id), r.setAttribute("role", "menuitem"), r.innerHTML = `<i class="bi bi-${i.icon}"></i> <span>${i.label}</span>`, this.menuEl.appendChild(r);
    });
    const e = document.createElement("div");
    e.className = "tiptap-block-menu__separator", this.menuEl.appendChild(e);
    const t = document.createElement("div");
    t.className = "tiptap-block-menu__group-label", t.textContent = "Turn into", this.menuEl.appendChild(t), wy.forEach((i) => {
      const r = document.createElement("button");
      r.type = "button", r.className = "tiptap-block-menu__item", r.setAttribute("data-turn-into", i.id), r.setAttribute("role", "menuitem"), r.innerHTML = `<i class="bi bi-${i.icon}"></i> <span>${i.label}</span>`, this.menuEl.appendChild(r);
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
      const r = i.target.closest("[data-action]");
      if (r) {
        this._executeAction(r.getAttribute("data-action"));
        return;
      }
      const s = i.target.closest("[data-turn-into]");
      s && this._executeTurnInto(s.getAttribute("data-turn-into"));
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
    var r;
    if (!e || !e.closest) return null;
    const t = (r = this.editorInstance.contentElement) == null ? void 0 : r.querySelector(".ProseMirror");
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
    const { state: t } = this.editor, { doc: i } = t, r = this.currentNodePos, s = i.nodeAt(r);
    if (!s) return;
    const o = r + s.nodeSize;
    if (e === -1) {
      const l = i.resolve(r);
      if (l.index(0) === 0) return;
      const a = l.before(1) - 1, d = i.resolve(a).before(1), u = s.toJSON();
      this.editor.chain().focus().deleteRange({ from: r, to: o }).insertContentAt(d, u).run();
    } else {
      if (o >= i.content.size) return;
      const l = i.nodeAt(o);
      if (!l) return;
      const a = o + l.nodeSize, c = s.toJSON();
      this.editor.chain().focus().deleteRange({ from: r, to: o }).insertContentAt(a - s.nodeSize, c).run();
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
  return Object.entries(e).forEach(([r, s]) => {
    r === "className" ? i.className = s : r === "style" && typeof s == "object" ? Object.assign(i.style, s) : r.startsWith("on") && typeof s == "function" ? i.addEventListener(r.slice(2).toLowerCase(), s) : r === "dataset" && typeof s == "object" ? Object.entries(s).forEach(([o, l]) => {
      i.dataset[o] = l;
    }) : i.setAttribute(r, s);
  }), t.forEach((r) => {
    typeof r == "string" ? i.appendChild(document.createTextNode(r)) : r instanceof HTMLElement && i.appendChild(r);
  }), i;
}
function xs() {
  var e;
  const n = ((e = navigator.userAgentData) == null ? void 0 : e.platform) || navigator.platform || "";
  return /mac/i.test(n) ? "mac" : /linux/i.test(n) ? "linux" : "windows";
}
function Sy(n) {
  const t = xs() === "mac";
  return n.replace(/Mod/g, t ? "⌘" : "Ctrl").replace(/Alt/g, t ? "⌥" : "Alt").replace(/Shift/g, t ? "⇧" : "Shift").replace(/\+/g, t ? "" : "+");
}
const xy = [
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
class Cy {
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
    (xs() === "mac" ? e.metaKey : e.ctrlKey) && e.key === "/" && (e.preventDefault(), this.toggle()), e.key === "Escape" && this._visible && this.close();
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
    }), this._overlay.addEventListener("click", (r) => {
      r.target === this._overlay && this.close();
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
    xy.forEach((r) => {
      i.appendChild(
        ee("div", { className: "tiptap-shortcuts__group-title" }, [r.title])
      ), r.shortcuts.forEach((s) => {
        const o = Sy(s.keys), l = this._splitKeys(o), a = ee("span", { className: "tiptap-shortcuts__keys" });
        l.forEach((c) => {
          a.appendChild(
            ee("kbd", { className: "tiptap-shortcuts__key" }, [c])
          );
        }), i.appendChild(
          ee("div", { className: "tiptap-shortcuts__item" }, [
            ee("span", { className: "tiptap-shortcuts__label" }, [s.label]),
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
    if (xs() === "mac") {
      const t = [];
      let i = "";
      for (const r of e)
        "⌘⇧⌥".includes(r) ? (i && t.push(i), t.push(r), i = "") : i += r;
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
class My {
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
    var r;
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
        (r = this.editorInstance.editor) == null || r.commands.focus(), i = !0;
        break;
      }
    }
    i && (e.preventDefault(), t.forEach((s, o) => {
      s.setAttribute("tabindex", o === this._focusedIndex ? "0" : "-1");
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
const Ul = [
  { id: "desktop", label: "Desktop", icon: "bi-display", width: null },
  { id: "tablet", label: "Tablet (768px)", icon: "bi-tablet", width: 768 },
  { id: "mobile", label: "Mobile (375px)", icon: "bi-phone", width: 375 }
];
class Ey {
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
    ), Ul.forEach((t) => {
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
    const t = Ul.find((i) => i.id === e);
    !t || e === this.currentMode || (this.currentMode = e, this._buttons.forEach((i, r) => {
      const s = r === e;
      i.classList.toggle("tiptap-preview-bar__btn--active", s), i.setAttribute("aria-pressed", s ? "true" : "false");
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
class Ay {
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
    this.editor = new Zf({
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
      onUpdate: ({ editor: r }) => {
        this._syncToInput(), this._emit("change", { json: r.getJSON(), html: r.getHTML() });
      },
      onFocus: ({ editor: r, event: s }) => {
        this.wrapper.classList.add("tiptap-editor--focused"), this._emit("focus", { editor: r, event: s });
      },
      onBlur: ({ editor: r, event: s }) => {
        this.wrapper.classList.remove("tiptap-editor--focused"), this._emit("blur", { editor: r, event: s });
      },
      onSelectionUpdate: ({ editor: r }) => {
        this._emit("selectionUpdate", { editor: r }), this.toolbar && this.toolbar.updateActiveStates(r);
      },
      onTransaction: ({ editor: r }) => {
        this.toolbar && this.toolbar.updateActiveStates(r);
      }
    }), this.toolbarElement && (this.toolbar = new gy(this.toolbarElement, this.editor, this.config.toolbar || {})), (i = this.config.ai) != null && i.enabled && (this.aiPanel = new yy(this, this.config.ai), this.wrapper.addEventListener("tiptap:toggle-ai-panel", () => {
      this.openAiPanel();
    })), this.blockMenu = new vy(this), this.a11y = new My(this), this.shortcuts = new Cy(this), this.responsivePreview = new Ey(this), this._initTheme(), this.wrapper.addEventListener("tiptap:insert-image", () => {
      this.toolbar && this.toolbar._handleImage();
    }), this.wrapper.addEventListener("tiptap:toggle-dark-mode", () => {
      const r = this.getTheme(), s = r === "auto" ? "dark" : r === "dark" ? "light" : "auto";
      this.setTheme(s);
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
      ng.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      })
    ), e.includes("underline") && t.push(ig), e.includes("link") && t.push(
      Tg.configure({
        openOnClick: !1,
        HTMLAttributes: {
          rel: null
        }
      })
    ), e.includes("textAlign") && t.push(
      Ng.configure({
        types: ["heading", "paragraph"]
      })
    ), t.push(
      _g.configure({
        placeholder: this.config.placeholder || "Start writing..."
      })
    ), e.includes("characterCount") && t.push(Og), e.includes("subscript") && t.push(Lg), e.includes("superscript") && t.push(Rg), e.includes("color") && (t.push(Dg), t.push(Pg)), e.includes("highlight") && t.push(
      zg.configure({
        multicolor: !0
      })
    ), e.includes("customImage") && t.push(Qb), e.includes("customVideo") && t.push(Zb), e.includes("table") && (t.push(
      qb.configure({
        resizable: !0
      })
    ), t.push(Vb), t.push(Wb), t.push(Ub)), e.includes("bootstrapRow") && t.push(jb), (e.includes("bootstrapCol") || e.includes("bootstrapRow")) && (t.some((r) => r.name === "bootstrapCol") || t.push(Kb)), e.includes("bootstrapAlert") && t.push(Jb), e.includes("bootstrapCard") && t.push(Gb), e.includes("bootstrapButton") && t.push(Yb), e.includes("gallery") && (t.push(ey), t.push(ty)), e.includes("slashCommands") && t.push(dy.configure({
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
class Ny {
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
    let r;
    i.addEventListener("input", (o) => {
      clearTimeout(r), this.searchQuery = o.target.value, r = setTimeout(() => {
        this.currentPage = 1, this._loadMedia();
      }, 300);
    }), e.querySelectorAll("[data-media-filter]").forEach((o) => {
      o.addEventListener("click", () => {
        e.querySelectorAll("[data-media-filter]").forEach((l) => l.classList.remove("active")), o.classList.add("active"), this.type = o.getAttribute("data-media-filter") || null, this.currentPage = 1, this._loadMedia();
      });
    });
    const s = e.querySelector("[data-media-upload]");
    return s && s.addEventListener("change", (o) => this._handleUpload(o)), e;
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
      const r = await i.json();
      this._renderGrid(r.data || []), this._renderPagination(r.pagination || {});
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
      t.innerHTML = "", e.forEach((r) => {
        var o;
        const s = document.createElement("div");
        s.className = "tiptap-media-browser__item", s.setAttribute("data-media-id", r.id), (o = r.mime_type) != null && o.startsWith("image/") ? s.innerHTML = `<img src="${r.thumbnail || r.url}" alt="${r.alt || r.filename}" loading="lazy">` : s.innerHTML = '<div class="tiptap-media-browser__video-thumb"><i class="bi bi-play-btn"></i></div>', s.innerHTML += `<div class="tiptap-media-browser__item-name">${r.filename}</div>`, s.addEventListener("click", () => {
          this.onSelect(r), this.close();
        }), t.appendChild(s);
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
      for (let r = 1; r <= e.last_page; r++) {
        const s = document.createElement("button");
        s.type = "button", s.className = "tiptap-media-browser__page-btn", r === e.current_page && s.classList.add("active"), s.textContent = String(r), s.addEventListener("click", () => {
          this.currentPage = r, this._loadMedia();
        }), t.appendChild(s);
      }
  }
  /**
   * Handle file upload from the modal.
   * @private
   */
  async _handleUpload(e) {
    var i, r;
    const t = (i = e.target.files) == null ? void 0 : i[0];
    if (!(!t || !this.uploadUrl)) {
      try {
        const s = new FormData();
        s.append("file", t);
        const o = ((r = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : r.content) || "";
        if (!(await fetch(this.uploadUrl, {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": o,
            Accept: "application/json"
          },
          body: s
        })).ok) throw new Error("Upload failed");
        this._loadMedia();
      } catch (s) {
        console.error("[MediaBrowser] Upload failed:", s), alert("Upload failed. Please try again.");
      }
      e.target.value = "";
    }
  }
}
const On = /* @__PURE__ */ new Map();
function jl() {
  const n = document.querySelectorAll("[data-tiptap-editor]"), e = [];
  return n.forEach((t) => {
    if (t.dataset.initialized === "true") return;
    const i = t.dataset.config, r = i ? JSON.parse(i) : {}, s = new Ay(t, r), o = t.id || `tiptap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    t.id = o, t.dataset.initialized = "true", On.set(o, s), e.push(s);
  }), e;
}
function _y(n) {
  return On.get(n);
}
function Oy() {
  return On;
}
function Ly(n) {
  const e = On.get(n);
  e && (e.destroy(), On.delete(n));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", jl) : jl();
export {
  My as AccessibilityManager,
  yy as AiPanel,
  vy as BlockMenu,
  Cy as KeyboardShortcuts,
  Ny as MediaBrowser,
  Ey as ResponsivePreview,
  Ay as TiptapEditor,
  Ly as destroyEditor,
  Oy as getAllEditors,
  _y as getEditor,
  jl as initEditors
};
//# sourceMappingURL=tiptap-editor.es.js.map
