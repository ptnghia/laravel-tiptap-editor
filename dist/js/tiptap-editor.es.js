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
    var r = t && t != n ? this.remove(t) : this, i = r.find(n), s = r.content.slice();
    return i == -1 ? s.push(t || n, e) : (s[i + 1] = e, t && (s[i] = t)), new Z(s);
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
    var r = this.remove(e), i = r.content.slice(), s = r.find(n);
    return i.splice(s == -1 ? i.length : s, 0, e, t), new Z(i);
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
  for (let r = 0; ; r++) {
    if (r == n.childCount || r == e.childCount)
      return n.childCount == e.childCount ? null : t;
    let i = n.child(r), s = e.child(r);
    if (i == s) {
      t += i.nodeSize;
      continue;
    }
    if (!i.sameMarkup(s))
      return t;
    if (i.isText && i.text != s.text) {
      for (let o = 0; i.text[o] == s.text[o]; o++)
        t++;
      return t;
    }
    if (i.content.size || s.content.size) {
      let o = Kl(i.content, s.content, t + 1);
      if (o != null)
        return o;
    }
    t += i.nodeSize;
  }
}
function Jl(n, e, t, r) {
  for (let i = n.childCount, s = e.childCount; ; ) {
    if (i == 0 || s == 0)
      return i == s ? null : { a: t, b: r };
    let o = n.child(--i), l = e.child(--s), a = o.nodeSize;
    if (o == l) {
      t -= a, r -= a;
      continue;
    }
    if (!o.sameMarkup(l))
      return { a: t, b: r };
    if (o.isText && o.text != l.text) {
      let c = 0, d = Math.min(o.text.length, l.text.length);
      for (; c < d && o.text[o.text.length - c - 1] == l.text[l.text.length - c - 1]; )
        c++, t--, r--;
      return { a: t, b: r };
    }
    if (o.content.size || l.content.size) {
      let c = Jl(o.content, l.content, t - 1, r - 1);
      if (c)
        return c;
    }
    t -= a, r -= a;
  }
}
class y {
  /**
  @internal
  */
  constructor(e, t) {
    if (this.content = e, this.size = t || 0, t == null)
      for (let r = 0; r < e.length; r++)
        this.size += e[r].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(e, t, r, i = 0, s) {
    for (let o = 0, l = 0; l < t; o++) {
      let a = this.content[o], c = l + a.nodeSize;
      if (c > e && r(a, i + l, s || null, o) !== !1 && a.content.size) {
        let d = l + 1;
        a.nodesBetween(Math.max(0, e - d), Math.min(a.content.size, t - d), r, i + d);
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
  textBetween(e, t, r, i) {
    let s = "", o = !0;
    return this.nodesBetween(e, t, (l, a) => {
      let c = l.isText ? l.text.slice(Math.max(e, a) - a, t - a) : l.isLeaf ? i ? typeof i == "function" ? i(l) : i : l.type.spec.leafText ? l.type.spec.leafText(l) : "" : "";
      l.isBlock && (l.isLeaf && c || l.isTextblock) && r && (o ? o = !1 : s += r), s += c;
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
    let t = this.lastChild, r = e.firstChild, i = this.content.slice(), s = 0;
    for (t.isText && t.sameMarkup(r) && (i[i.length - 1] = t.withText(t.text + r.text), s = 1); s < e.content.length; s++)
      i.push(e.content[s]);
    return new y(i, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, t = this.size) {
    if (e == 0 && t == this.size)
      return this;
    let r = [], i = 0;
    if (t > e)
      for (let s = 0, o = 0; o < t; s++) {
        let l = this.content[s], a = o + l.nodeSize;
        a > e && ((o < e || a > t) && (l.isText ? l = l.cut(Math.max(0, e - o), Math.min(l.text.length, t - o)) : l = l.cut(Math.max(0, e - o - 1), Math.min(l.content.size, t - o - 1))), r.push(l), i += l.nodeSize), o = a;
      }
    return new y(r, i);
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
    let r = this.content[e];
    if (r == t)
      return this;
    let i = this.content.slice(), s = this.size + t.nodeSize - r.nodeSize;
    return i[e] = t, new y(i, s);
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
    for (let t = 0, r = 0; t < this.content.length; t++) {
      let i = this.content[t];
      e(i, r, t), r += i.nodeSize;
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
  findDiffEnd(e, t = this.size, r = e.size) {
    return Jl(this, e, t, r);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return Dn(0, e);
    if (e == this.size)
      return Dn(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let t = 0, r = 0; ; t++) {
      let i = this.child(t), s = r + i.nodeSize;
      if (s >= e)
        return s == e ? Dn(t + 1, s) : Dn(t, r);
      r = s;
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
    let t, r = 0;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      r += s.nodeSize, i && s.isText && e[i - 1].sameMarkup(s) ? (t || (t = e.slice(0, i)), t[t.length - 1] = s.withText(t[t.length - 1].text + s.text)) : t && t.push(s);
    }
    return new y(t || e, r);
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
const ui = { index: 0, offset: 0 };
function Dn(n, e) {
  return ui.index = n, ui.offset = e, ui;
}
function or(n, e) {
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
    for (let r = 0; r < n.length; r++)
      if (!or(n[r], e[r]))
        return !1;
  } else {
    for (let r in n)
      if (!(r in e) || !or(n[r], e[r]))
        return !1;
    for (let r in e)
      if (!(r in n))
        return !1;
  }
  return !0;
}
let P = class Fi {
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
    let t, r = !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      if (this.eq(s))
        return e;
      if (this.type.excludes(s.type))
        t || (t = e.slice(0, i));
      else {
        if (s.type.excludes(this.type))
          return e;
        !r && s.type.rank > this.type.rank && (t || (t = e.slice(0, i)), t.push(this), r = !0), t && t.push(s);
      }
    }
    return t || (t = e.slice()), r || t.push(this), t;
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
    return this == e || this.type == e.type && or(this.attrs, e.attrs);
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
    let r = e.marks[t.type];
    if (!r)
      throw new RangeError(`There is no mark type ${t.type} in this schema`);
    let i = r.create(t.attrs);
    return r.checkAttrs(i.attrs), i;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(e, t) {
    if (e == t)
      return !0;
    if (e.length != t.length)
      return !1;
    for (let r = 0; r < e.length; r++)
      if (!e[r].eq(t[r]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(e) {
    if (!e || Array.isArray(e) && e.length == 0)
      return Fi.none;
    if (e instanceof Fi)
      return [e];
    let t = e.slice();
    return t.sort((r, i) => r.type.rank - i.type.rank), t;
  }
};
P.none = [];
class lr extends Error {
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
  constructor(e, t, r) {
    this.content = e, this.openStart = t, this.openEnd = r;
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
    let r = Yl(this.content, e + this.openStart, t);
    return r && new x(r, this.openStart, this.openEnd);
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
    let r = t.openStart || 0, i = t.openEnd || 0;
    if (typeof r != "number" || typeof i != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new x(y.fromJSON(e, t.content), r, i);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, t = !0) {
    let r = 0, i = 0;
    for (let s = e.firstChild; s && !s.isLeaf && (t || !s.type.spec.isolating); s = s.firstChild)
      r++;
    for (let s = e.lastChild; s && !s.isLeaf && (t || !s.type.spec.isolating); s = s.lastChild)
      i++;
    return new x(e, r, i);
  }
}
x.empty = new x(y.empty, 0, 0);
function Gl(n, e, t) {
  let { index: r, offset: i } = n.findIndex(e), s = n.maybeChild(r), { index: o, offset: l } = n.findIndex(t);
  if (i == e || s.isText) {
    if (l != t && !n.child(o).isText)
      throw new RangeError("Removing non-flat range");
    return n.cut(0, e).append(n.cut(t));
  }
  if (r != o)
    throw new RangeError("Removing non-flat range");
  return n.replaceChild(r, s.copy(Gl(s.content, e - i - 1, t - i - 1)));
}
function Yl(n, e, t, r) {
  let { index: i, offset: s } = n.findIndex(e), o = n.maybeChild(i);
  if (s == e || o.isText)
    return r && !r.canReplace(i, i, t) ? null : n.cut(0, e).append(t).append(n.cut(e));
  let l = Yl(o.content, e - s - 1, t, o);
  return l && n.replaceChild(i, o.copy(l));
}
function nd(n, e, t) {
  if (t.openStart > n.depth)
    throw new lr("Inserted content deeper than insertion position");
  if (n.depth - t.openStart != e.depth - t.openEnd)
    throw new lr("Inconsistent open depths");
  return Xl(n, e, t, 0);
}
function Xl(n, e, t, r) {
  let i = n.index(r), s = n.node(r);
  if (i == e.index(r) && r < n.depth - t.openStart) {
    let o = Xl(n, e, t, r + 1);
    return s.copy(s.content.replaceChild(i, o));
  } else if (t.content.size)
    if (!t.openStart && !t.openEnd && n.depth == r && e.depth == r) {
      let o = n.parent, l = o.content;
      return xt(o, l.cut(0, n.parentOffset).append(t.content).append(l.cut(e.parentOffset)));
    } else {
      let { start: o, end: l } = rd(t, n);
      return xt(s, Zl(n, o, l, e, r));
    }
  else return xt(s, ar(n, e, r));
}
function Ql(n, e) {
  if (!e.type.compatibleContent(n.type))
    throw new lr("Cannot join " + e.type.name + " onto " + n.type.name);
}
function Vi(n, e, t) {
  let r = n.node(t);
  return Ql(r, e.node(t)), r;
}
function St(n, e) {
  let t = e.length - 1;
  t >= 0 && n.isText && n.sameMarkup(e[t]) ? e[t] = n.withText(e[t].text + n.text) : e.push(n);
}
function ln(n, e, t, r) {
  let i = (e || n).node(t), s = 0, o = e ? e.index(t) : i.childCount;
  n && (s = n.index(t), n.depth > t ? s++ : n.textOffset && (St(n.nodeAfter, r), s++));
  for (let l = s; l < o; l++)
    St(i.child(l), r);
  e && e.depth == t && e.textOffset && St(e.nodeBefore, r);
}
function xt(n, e) {
  return n.type.checkContent(e), n.copy(e);
}
function Zl(n, e, t, r, i) {
  let s = n.depth > i && Vi(n, e, i + 1), o = r.depth > i && Vi(t, r, i + 1), l = [];
  return ln(null, n, i, l), s && o && e.index(i) == t.index(i) ? (Ql(s, o), St(xt(s, Zl(n, e, t, r, i + 1)), l)) : (s && St(xt(s, ar(n, e, i + 1)), l), ln(e, t, i, l), o && St(xt(o, ar(t, r, i + 1)), l)), ln(r, null, i, l), new y(l);
}
function ar(n, e, t) {
  let r = [];
  if (ln(null, n, t, r), n.depth > t) {
    let i = Vi(n, e, t + 1);
    St(xt(i, ar(n, e, t + 1)), r);
  }
  return ln(e, null, t, r), new y(r);
}
function rd(n, e) {
  let t = e.depth - n.openStart, i = e.node(t).copy(n.content);
  for (let s = t - 1; s >= 0; s--)
    i = e.node(s).copy(y.from(i));
  return {
    start: i.resolveNoCache(n.openStart + t),
    end: i.resolveNoCache(i.content.size - n.openEnd - t)
  };
}
class bn {
  /**
  @internal
  */
  constructor(e, t, r) {
    this.pos = e, this.path = t, this.parentOffset = r, this.depth = t.length / 3 - 1;
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
    let r = this.pos - this.path[this.path.length - 1], i = e.child(t);
    return r ? e.child(t).cut(r) : i;
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
    let r = this.path[t * 3], i = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let s = 0; s < e; s++)
      i += r.child(s).nodeSize;
    return i;
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
    let r = e.maybeChild(t - 1), i = e.maybeChild(t);
    if (!r) {
      let l = r;
      r = i, i = l;
    }
    let s = r.marks;
    for (var o = 0; o < s.length; o++)
      s[o].type.spec.inclusive === !1 && (!i || !s[o].isInSet(i.marks)) && (s = s[o--].removeFromSet(s));
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
    let r = t.marks, i = e.parent.maybeChild(e.index());
    for (var s = 0; s < r.length; s++)
      r[s].type.spec.inclusive === !1 && (!i || !r[s].isInSet(i.marks)) && (r = r[s--].removeFromSet(r));
    return r;
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
    for (let r = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); r >= 0; r--)
      if (e.pos <= this.end(r) && (!t || t(this.node(r))))
        return new cr(this, e, r);
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
    let r = [], i = 0, s = t;
    for (let o = e; ; ) {
      let { index: l, offset: a } = o.content.findIndex(s), c = s - a;
      if (r.push(o, l, i + a), !c || (o = o.child(l), o.isText))
        break;
      s = c - 1, i += a + 1;
    }
    return new bn(t, r, s);
  }
  /**
  @internal
  */
  static resolveCached(e, t) {
    let r = oo.get(e);
    if (r)
      for (let s = 0; s < r.elts.length; s++) {
        let o = r.elts[s];
        if (o.pos == t)
          return o;
      }
    else
      oo.set(e, r = new id());
    let i = r.elts[r.i] = bn.resolve(e, t);
    return r.i = (r.i + 1) % sd, i;
  }
}
class id {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const sd = 12, oo = /* @__PURE__ */ new WeakMap();
class cr {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(e, t, r) {
    this.$from = e, this.$to = t, this.depth = r;
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
let it = class qi {
  /**
  @internal
  */
  constructor(e, t, r, i = P.none) {
    this.type = e, this.attrs = t, this.marks = i, this.content = r || y.empty;
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
  nodesBetween(e, t, r, i = 0) {
    this.content.nodesBetween(e, t, r, i, this);
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
  textBetween(e, t, r, i) {
    return this.content.textBetween(e, t, r, i);
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
  hasMarkup(e, t, r) {
    return this.type == e && or(this.attrs, t || e.defaultAttrs || od) && P.sameSet(this.marks, r || P.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new qi(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new qi(this.type, this.attrs, this.content, e);
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
  slice(e, t = this.content.size, r = !1) {
    if (e == t)
      return x.empty;
    let i = this.resolve(e), s = this.resolve(t), o = r ? 0 : i.sharedDepth(t), l = i.start(o), c = i.node(o).content.cut(i.pos - l, s.pos - l);
    return new x(c, i.depth - o, s.depth - o);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(e, t, r) {
    return nd(this.resolve(e), this.resolve(t), r);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: r, offset: i } = t.content.findIndex(e);
      if (t = t.maybeChild(r), !t)
        return null;
      if (i == e || t.isText)
        return t;
      e -= i + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(e) {
    let { index: t, offset: r } = this.content.findIndex(e);
    return { node: this.content.maybeChild(t), index: t, offset: r };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(e) {
    if (e == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: t, offset: r } = this.content.findIndex(e);
    if (r < e)
      return { node: this.content.child(t), index: t, offset: r };
    let i = this.content.child(t - 1);
    return { node: i, index: t - 1, offset: r - i.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return bn.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return bn.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, t, r) {
    let i = !1;
    return t > e && this.nodesBetween(e, t, (s) => (r.isInSet(s.marks) && (i = !0), !i)), i;
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
  canReplace(e, t, r = y.empty, i = 0, s = r.childCount) {
    let o = this.contentMatchAt(e).matchFragment(r, i, s), l = o && o.matchFragment(this.content, t);
    if (!l || !l.validEnd)
      return !1;
    for (let a = i; a < s; a++)
      if (!this.type.allowsMarks(r.child(a).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(e, t, r, i) {
    if (i && !this.type.allowsMarks(i))
      return !1;
    let s = this.contentMatchAt(e).matchType(r), o = s && s.matchFragment(this.content, t);
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
      let r = this.marks[t];
      r.type.checkAttrs(r.attrs), e = r.addToSet(e);
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
    let r;
    if (t.marks) {
      if (!Array.isArray(t.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      r = t.marks.map(e.markFromJSON);
    }
    if (t.type == "text") {
      if (typeof t.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return e.text(t.text, r);
    }
    let i = y.fromJSON(e, t.content), s = e.nodeType(t.type).create(t.attrs, i, r);
    return s.type.checkAttrs(s.attrs), s;
  }
};
it.prototype.text = void 0;
class dr extends it {
  /**
  @internal
  */
  constructor(e, t, r, i) {
    if (super(e, t, null, i), !r)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = r;
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
    return e == this.marks ? this : new dr(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new dr(this.type, this.attrs, e, this.marks);
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
    let r = new ld(e, t);
    if (r.next == null)
      return At.empty;
    let i = ta(r);
    r.next && r.err("Unexpected trailing text");
    let s = fd(pd(i));
    return md(s, r), s;
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
  matchFragment(e, t = 0, r = e.childCount) {
    let i = this;
    for (let s = t; i && s < r; s++)
      i = i.matchType(e.child(s).type);
    return i;
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
      for (let r = 0; r < e.next.length; r++)
        if (this.next[t].type == e.next[r].type)
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
  fillBefore(e, t = !1, r = 0) {
    let i = [this];
    function s(o, l) {
      let a = o.matchFragment(e, r);
      if (a && (!t || a.validEnd))
        return y.from(l.map((c) => c.createAndFill()));
      for (let c = 0; c < o.next.length; c++) {
        let { type: d, next: u } = o.next[c];
        if (!(d.isText || d.hasRequiredAttrs()) && i.indexOf(u) == -1) {
          i.push(u);
          let h = s(u, l.concat(d));
          if (h)
            return h;
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
    for (let r = 0; r < this.wrapCache.length; r += 2)
      if (this.wrapCache[r] == e)
        return this.wrapCache[r + 1];
    let t = this.computeWrapping(e);
    return this.wrapCache.push(e, t), t;
  }
  /**
  @internal
  */
  computeWrapping(e) {
    let t = /* @__PURE__ */ Object.create(null), r = [{ match: this, type: null, via: null }];
    for (; r.length; ) {
      let i = r.shift(), s = i.match;
      if (s.matchType(e)) {
        let o = [];
        for (let l = i; l.type; l = l.via)
          o.push(l.type);
        return o.reverse();
      }
      for (let o = 0; o < s.next.length; o++) {
        let { type: l, next: a } = s.next[o];
        !l.isLeaf && !l.hasRequiredAttrs() && !(l.name in t) && (!i.type || a.validEnd) && (r.push({ match: l.contentMatch, type: l, via: i }), t[l.name] = !0);
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
    function t(r) {
      e.push(r);
      for (let i = 0; i < r.next.length; i++)
        e.indexOf(r.next[i].next) == -1 && t(r.next[i].next);
    }
    return t(this), e.map((r, i) => {
      let s = i + (r.validEnd ? "*" : " ") + " ";
      for (let o = 0; o < r.next.length; o++)
        s += (o ? ", " : "") + r.next[o].type.name + "->" + e.indexOf(r.next[o].next);
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
  let e = hd(n);
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
function lo(n) {
  /\D/.test(n.next) && n.err("Expected number, got '" + n.next + "'");
  let e = Number(n.next);
  return n.pos++, e;
}
function dd(n, e) {
  let t = lo(n), r = t;
  return n.eat(",") && (n.next != "}" ? r = lo(n) : r = -1), n.eat("}") || n.err("Unclosed braced range"), { type: "range", min: t, max: r, expr: e };
}
function ud(n, e) {
  let t = n.nodeTypes, r = t[e];
  if (r)
    return [r];
  let i = [];
  for (let s in t) {
    let o = t[s];
    o.isInGroup(e) && i.push(o);
  }
  return i.length == 0 && n.err("No node type or group '" + e + "' found"), i;
}
function hd(n) {
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
function pd(n) {
  let e = [[]];
  return i(s(n, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function r(o, l, a) {
    let c = { term: a, to: l };
    return e[o].push(c), c;
  }
  function i(o, l) {
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
        i(c, l = t());
      }
    else if (o.type == "star") {
      let a = t();
      return r(l, a), i(s(o.expr, a), a), [r(a)];
    } else if (o.type == "plus") {
      let a = t();
      return i(s(o.expr, l), a), i(s(o.expr, a), a), [r(a)];
    } else {
      if (o.type == "opt")
        return [r(l)].concat(s(o.expr, l));
      if (o.type == "range") {
        let a = l;
        for (let c = 0; c < o.min; c++) {
          let d = t();
          i(s(o.expr, a), d), a = d;
        }
        if (o.max == -1)
          i(s(o.expr, a), a);
        else
          for (let c = o.min; c < o.max; c++) {
            let d = t();
            r(a, d), i(s(o.expr, a), d), a = d;
          }
        return [r(a)];
      } else {
        if (o.type == "name")
          return [r(l, void 0, o.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function na(n, e) {
  return e - n;
}
function ao(n, e) {
  let t = [];
  return r(e), t.sort(na);
  function r(i) {
    let s = n[i];
    if (s.length == 1 && !s[0].term)
      return r(s[0].to);
    t.push(i);
    for (let o = 0; o < s.length; o++) {
      let { term: l, to: a } = s[o];
      !l && t.indexOf(a) == -1 && r(a);
    }
  }
}
function fd(n) {
  let e = /* @__PURE__ */ Object.create(null);
  return t(ao(n, 0));
  function t(r) {
    let i = [];
    r.forEach((o) => {
      n[o].forEach(({ term: l, to: a }) => {
        if (!l)
          return;
        let c;
        for (let d = 0; d < i.length; d++)
          i[d][0] == l && (c = i[d][1]);
        ao(n, a).forEach((d) => {
          c || i.push([l, c = []]), c.indexOf(d) == -1 && c.push(d);
        });
      });
    });
    let s = e[r.join(",")] = new At(r.indexOf(n.length - 1) > -1);
    for (let o = 0; o < i.length; o++) {
      let l = i[o][1].sort(na);
      s.next.push({ type: i[o][0], next: e[l.join(",")] || t(l) });
    }
    return s;
  }
}
function md(n, e) {
  for (let t = 0, r = [n]; t < r.length; t++) {
    let i = r[t], s = !i.validEnd, o = [];
    for (let l = 0; l < i.next.length; l++) {
      let { type: a, next: c } = i.next[l];
      o.push(a.name), s && !(a.isText || a.hasRequiredAttrs()) && (s = !1), r.indexOf(c) == -1 && r.push(c);
    }
    s && e.err("Only non-generatable nodes (" + o.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function ra(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let r = n[t];
    if (!r.hasDefault)
      return null;
    e[t] = r.default;
  }
  return e;
}
function ia(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let r in n) {
    let i = e && e[r];
    if (i === void 0) {
      let s = n[r];
      if (s.hasDefault)
        i = s.default;
      else
        throw new RangeError("No value supplied for attribute " + r);
    }
    t[r] = i;
  }
  return t;
}
function sa(n, e, t, r) {
  for (let i in e)
    if (!(i in n))
      throw new RangeError(`Unsupported attribute ${i} for ${t} of type ${i}`);
  for (let i in n) {
    let s = n[i];
    s.validate && s.validate(e[i]);
  }
}
function oa(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let r in e)
      t[r] = new bd(n, r, e[r]);
  return t;
}
let co = class la {
  /**
  @internal
  */
  constructor(e, t, r) {
    this.name = e, this.schema = t, this.spec = r, this.markSet = null, this.groups = r.group ? r.group.split(" ") : [], this.attrs = oa(e, r.attrs), this.defaultAttrs = ra(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(r.inline || e == "text"), this.isText = e == "text";
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
    return !e && this.defaultAttrs ? this.defaultAttrs : ia(this.attrs, e);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(e = null, t, r) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new it(this, this.computeAttrs(e), y.from(t), P.setFrom(r));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, t, r) {
    return t = y.from(t), this.checkContent(t), new it(this, this.computeAttrs(e), t, P.setFrom(r));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(e = null, t, r) {
    if (e = this.computeAttrs(e), t = y.from(t), t.size) {
      let o = this.contentMatch.fillBefore(t);
      if (!o)
        return null;
      t = o.append(t);
    }
    let i = this.contentMatch.matchFragment(t), s = i && i.fillBefore(y.empty, !0);
    return s ? new it(this, e, t.append(s), P.setFrom(r)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(e) {
    let t = this.contentMatch.matchFragment(e);
    if (!t || !t.validEnd)
      return !1;
    for (let r = 0; r < e.childCount; r++)
      if (!this.allowsMarks(e.child(r).marks))
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
    for (let r = 0; r < e.length; r++)
      this.allowsMarkType(e[r].type) ? t && t.push(e[r]) : t || (t = e.slice(0, r));
    return t ? t.length ? t : P.none : e;
  }
  /**
  @internal
  */
  static compile(e, t) {
    let r = /* @__PURE__ */ Object.create(null);
    e.forEach((s, o) => r[s] = new la(s, t, o));
    let i = t.spec.topNode || "doc";
    if (!r[i])
      throw new RangeError("Schema is missing its top node type ('" + i + "')");
    if (!r.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let s in r.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return r;
  }
};
function gd(n, e, t) {
  let r = t.split("|");
  return (i) => {
    let s = i === null ? "null" : typeof i;
    if (r.indexOf(s) < 0)
      throw new RangeError(`Expected value of type ${r} for attribute ${e} on type ${n}, got ${s}`);
  };
}
class bd {
  constructor(e, t, r) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(r, "default"), this.default = r.default, this.validate = typeof r.validate == "string" ? gd(e, t, r.validate) : r.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class Kr {
  /**
  @internal
  */
  constructor(e, t, r, i) {
    this.name = e, this.rank = t, this.schema = r, this.spec = i, this.attrs = oa(e, i.attrs), this.excluded = null;
    let s = ra(this.attrs);
    this.instance = s ? new P(this, s) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new P(this, ia(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, t) {
    let r = /* @__PURE__ */ Object.create(null), i = 0;
    return e.forEach((s, o) => r[s] = new Kr(s, i++, t, o)), r;
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
    for (let i in e)
      t[i] = e[i];
    t.nodes = Z.from(e.nodes), t.marks = Z.from(e.marks || {}), this.nodes = co.compile(this.spec.nodes, this), this.marks = Kr.compile(this.spec.marks, this);
    let r = /* @__PURE__ */ Object.create(null);
    for (let i in this.nodes) {
      if (i in this.marks)
        throw new RangeError(i + " can not be both a node and a mark");
      let s = this.nodes[i], o = s.spec.content || "", l = s.spec.marks;
      if (s.contentMatch = r[o] || (r[o] = At.parse(o, this.nodes)), s.inlineContent = s.contentMatch.inlineContent, s.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!s.isInline || !s.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = s;
      }
      s.markSet = l == "_" ? null : l ? uo(this, l.split(" ")) : l == "" || !s.inlineContent ? [] : null;
    }
    for (let i in this.marks) {
      let s = this.marks[i], o = s.spec.excludes;
      s.excluded = o == null ? [s] : o == "" ? [] : uo(this, o.split(" "));
    }
    this.nodeFromJSON = (i) => it.fromJSON(this, i), this.markFromJSON = (i) => P.fromJSON(this, i), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, t = null, r, i) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof co) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(t, r, i);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, t) {
    let r = this.nodes.text;
    return new dr(r, r.defaultAttrs, e, P.setFrom(t));
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
function uo(n, e) {
  let t = [];
  for (let r = 0; r < e.length; r++) {
    let i = e[r], s = n.marks[i], o = s;
    if (s)
      t.push(s);
    else
      for (let l in n.marks) {
        let a = n.marks[l];
        (i == "_" || a.spec.group && a.spec.group.split(" ").indexOf(i) > -1) && t.push(o = a);
      }
    if (!o)
      throw new SyntaxError("Unknown mark type: '" + e[r] + "'");
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
    let r = this.matchedStyles = [];
    t.forEach((i) => {
      if (yd(i))
        this.tags.push(i);
      else if (kd(i)) {
        let s = /[^=]*/.exec(i.style)[0];
        r.indexOf(s) < 0 && r.push(s), this.styles.push(i);
      }
    }), this.normalizeLists = !this.tags.some((i) => {
      if (!/^(ul|ol)\b/.test(i.tag) || !i.node)
        return !1;
      let s = e.nodes[i.node];
      return s.contentMatch.matchType(s);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, t = {}) {
    let r = new po(this, t, !1);
    return r.addAll(e, P.none, t.from, t.to), r.finish();
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
    let r = new po(this, t, !0);
    return r.addAll(e, P.none, t.from, t.to), x.maxOpen(r.finish());
  }
  /**
  @internal
  */
  matchTag(e, t, r) {
    for (let i = r ? this.tags.indexOf(r) + 1 : 0; i < this.tags.length; i++) {
      let s = this.tags[i];
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
  matchStyle(e, t, r, i) {
    for (let s = i ? this.styles.indexOf(i) + 1 : 0; s < this.styles.length; s++) {
      let o = this.styles[s], l = o.style;
      if (!(l.indexOf(e) != 0 || o.context && !r.matchesContext(o.context) || // Test that the style string either precisely matches the prop,
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
    function r(i) {
      let s = i.priority == null ? 50 : i.priority, o = 0;
      for (; o < t.length; o++) {
        let l = t[o];
        if ((l.priority == null ? 50 : l.priority) < s)
          break;
      }
      t.splice(o, 0, i);
    }
    for (let i in e.marks) {
      let s = e.marks[i].spec.parseDOM;
      s && s.forEach((o) => {
        r(o = fo(o)), o.mark || o.ignore || o.clearMark || (o.mark = i);
      });
    }
    for (let i in e.nodes) {
      let s = e.nodes[i].spec.parseDOM;
      s && s.forEach((o) => {
        r(o = fo(o)), o.node || o.ignore || o.mark || (o.node = i);
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
}, da = { ol: !0, ul: !0 }, yn = 1, Wi = 2, an = 4;
function ho(n, e, t) {
  return e != null ? (e ? yn : 0) | (e === "full" ? Wi : 0) : n && n.whitespace == "pre" ? yn | Wi : t & ~an;
}
class Pn {
  constructor(e, t, r, i, s, o) {
    this.type = e, this.attrs = t, this.marks = r, this.solid = i, this.options = o, this.content = [], this.activeMarks = P.none, this.match = s || (o & an ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let t = this.type.contentMatch.fillBefore(y.from(e));
      if (t)
        this.match = this.type.contentMatch.matchFragment(t);
      else {
        let r = this.type.contentMatch, i;
        return (i = r.findWrapping(e.type)) ? (this.match = r, i) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & yn)) {
      let r = this.content[this.content.length - 1], i;
      if (r && r.isText && (i = /[ \t\r\n\u000c]+$/.exec(r.text))) {
        let s = r;
        r.text.length == i[0].length ? this.content.pop() : this.content[this.content.length - 1] = s.withText(s.text.slice(0, s.text.length - i[0].length));
      }
    }
    let t = y.from(this.content);
    return !e && this.match && (t = t.append(this.match.fillBefore(y.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !ca.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class po {
  constructor(e, t, r) {
    this.parser = e, this.options = t, this.isOpen = r, this.open = 0, this.localPreserveWS = !1;
    let i = t.topNode, s, o = ho(null, t.preserveWhitespace, 0) | (r ? an : 0);
    i ? s = new Pn(i.type, i.attrs, P.none, !0, t.topMatch || i.type.contentMatch, o) : r ? s = new Pn(null, null, P.none, !0, null, o) : s = new Pn(e.schema.topNodeType, null, P.none, !0, null, o), this.nodes = [s], this.find = t.findPositions, this.needsBlock = !1;
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
    let r = e.nodeValue, i = this.top, s = i.options & Wi ? "full" : this.localPreserveWS || (i.options & yn) > 0, { schema: o } = this.parser;
    if (s === "full" || i.inlineContext(e) || /[^ \t\r\n\u000c]/.test(r)) {
      if (s)
        if (s === "full")
          r = r.replace(/\r\n?/g, `
`);
        else if (o.linebreakReplacement && /[\r\n]/.test(r) && this.top.findWrapping(o.linebreakReplacement.create())) {
          let l = r.split(/\r?\n|\r/);
          for (let a = 0; a < l.length; a++)
            a && this.insertNode(o.linebreakReplacement.create(), t, !0), l[a] && this.insertNode(o.text(l[a]), t, !/\S/.test(l[a]));
          r = "";
        } else
          r = r.replace(/\r?\n|\r/g, " ");
      else if (r = r.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(r) && this.open == this.nodes.length - 1) {
        let l = i.content[i.content.length - 1], a = e.previousSibling;
        (!l || a && a.nodeName == "BR" || l.isText && /[ \t\r\n\u000c]$/.test(l.text)) && (r = r.slice(1));
      }
      r && this.insertNode(o.text(r), t, !/\S/.test(r)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, t, r) {
    let i = this.localPreserveWS, s = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let o = e.nodeName.toLowerCase(), l;
    da.hasOwnProperty(o) && this.parser.normalizeLists && Cd(e);
    let a = this.options.ruleFromNode && this.options.ruleFromNode(e) || (l = this.parser.matchTag(e, this, r));
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
    this.localPreserveWS = i;
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
    let r = e.style;
    if (r && r.length)
      for (let i = 0; i < this.parser.matchedStyles.length; i++) {
        let s = this.parser.matchedStyles[i], o = r.getPropertyValue(s);
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
  addElementByRule(e, t, r, i) {
    let s, o;
    if (t.node)
      if (o = this.parser.schema.nodes[t.node], o.isLeaf)
        this.insertNode(o.create(t.attrs), r, e.nodeName == "BR") || this.leafFallback(e, r);
      else {
        let a = this.enter(o, t.attrs || null, r, t.preserveWhitespace);
        a && (s = !0, r = a);
      }
    else {
      let a = this.parser.schema.marks[t.mark];
      r = r.concat(a.create(t.attrs));
    }
    let l = this.top;
    if (o && o.isLeaf)
      this.findInside(e);
    else if (i)
      this.addElement(e, r, i);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((a) => this.insertNode(a, r, !1));
    else {
      let a = e;
      typeof t.contentElement == "string" ? a = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? a = t.contentElement(e) : t.contentElement && (a = t.contentElement), this.findAround(e, a, !0), this.addAll(a, r), this.findAround(e, a, !1);
    }
    s && this.sync(l) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, t, r, i) {
    let s = r || 0;
    for (let o = r ? e.childNodes[r] : e.firstChild, l = i == null ? null : e.childNodes[i]; o != l; o = o.nextSibling, ++s)
      this.findAtPoint(e, s), this.addDOM(o, t);
    this.findAtPoint(e, s);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, t, r) {
    let i, s;
    for (let o = this.open, l = 0; o >= 0; o--) {
      let a = this.nodes[o], c = a.findWrapping(e);
      if (c && (!i || i.length > c.length + l) && (i = c, s = a, !c.length))
        break;
      if (a.solid) {
        if (r)
          break;
        l += 2;
      }
    }
    if (!i)
      return null;
    this.sync(s);
    for (let o = 0; o < i.length; o++)
      t = this.enterInner(i[o], null, t, !1);
    return t;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, t, r) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let s = this.textblockFromContext();
      s && (t = this.enterInner(s, null, t));
    }
    let i = this.findPlace(e, t, r);
    if (i) {
      this.closeExtra();
      let s = this.top;
      s.match && (s.match = s.match.matchType(e.type));
      let o = P.none;
      for (let l of i.concat(e.marks))
        (s.type ? s.type.allowsMarkType(l.type) : mo(l.type, e.type)) && (o = l.addToSet(o));
      return s.content.push(e.mark(o)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, t, r, i) {
    let s = this.findPlace(e.create(t), r, !1);
    return s && (s = this.enterInner(e, t, r, !0, i)), s;
  }
  // Open a node of the given type
  enterInner(e, t, r, i = !1, s) {
    this.closeExtra();
    let o = this.top;
    o.match = o.match && o.match.matchType(e);
    let l = ho(e, s, o.options);
    o.options & an && o.content.length == 0 && (l |= an);
    let a = P.none;
    return r = r.filter((c) => (o.type ? o.type.allowsMarkType(c.type) : mo(c.type, e)) ? (a = c.addToSet(a), !1) : !0), this.nodes.push(new Pn(e, t, a, i, null, l)), this.open++, r;
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
      this.localPreserveWS && (this.nodes[t].options |= yn);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let t = this.open; t >= 0; t--) {
      let r = this.nodes[t].content;
      for (let i = r.length - 1; i >= 0; i--)
        e += r[i].nodeSize;
      t && e++;
    }
    return e;
  }
  findAtPoint(e, t) {
    if (this.find)
      for (let r = 0; r < this.find.length; r++)
        this.find[r].node == e && this.find[r].offset == t && (this.find[r].pos = this.currentPos);
  }
  findInside(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
  }
  findAround(e, t, r) {
    if (e != t && this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].pos == null && e.nodeType == 1 && e.contains(this.find[i].node) && t.compareDocumentPosition(this.find[i].node) & (r ? 2 : 4) && (this.find[i].pos = this.currentPos);
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
    let t = e.split("/"), r = this.options.context, i = !this.isOpen && (!r || r.parent.type == this.nodes[0].type), s = -(r ? r.depth + 1 : 0) + (i ? 0 : 1), o = (l, a) => {
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
          let d = a > 0 || a == 0 && i ? this.nodes[a].type : r && a >= s ? r.node(a - s).type : null;
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
        let r = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
        if (r && r.isTextblock && r.defaultAttrs)
          return r;
      }
    for (let t in this.parser.schema.nodes) {
      let r = this.parser.schema.nodes[t];
      if (r.isTextblock && r.defaultAttrs)
        return r;
    }
  }
}
function Cd(n) {
  for (let e = n.firstChild, t = null; e; e = e.nextSibling) {
    let r = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    r && da.hasOwnProperty(r) && t ? (t.appendChild(e), e = t) : r == "li" ? t = e : r && (t = null);
  }
}
function Sd(n, e) {
  return (n.matches || n.msMatchesSelector || n.webkitMatchesSelector || n.mozMatchesSelector).call(n, e);
}
function fo(n) {
  let e = {};
  for (let t in n)
    e[t] = n[t];
  return e;
}
function mo(n, e) {
  let t = e.schema.nodes;
  for (let r in t) {
    let i = t[r];
    if (!i.allowsMarkType(n))
      continue;
    let s = [], o = (l) => {
      s.push(l);
      for (let a = 0; a < l.edgeCount; a++) {
        let { type: c, next: d } = l.edge(a);
        if (c == e || s.indexOf(d) < 0 && o(d))
          return !0;
      }
    };
    if (o(i.contentMatch))
      return !0;
  }
}
class _t {
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
  serializeFragment(e, t = {}, r) {
    r || (r = hi(t).createDocumentFragment());
    let i = r, s = [];
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
          i = s.pop()[1];
        for (; a < o.marks.length; ) {
          let c = o.marks[a++], d = this.serializeMark(c, o.isInline, t);
          d && (s.push([c, i]), i.appendChild(d.dom), i = d.contentDOM || d.dom);
        }
      }
      i.appendChild(this.serializeNodeInner(o, t));
    }), r;
  }
  /**
  @internal
  */
  serializeNodeInner(e, t) {
    let { dom: r, contentDOM: i } = Qn(hi(t), this.nodes[e.type.name](e), null, e.attrs);
    if (i) {
      if (e.isLeaf)
        throw new RangeError("Content hole not allowed in a leaf node spec");
      this.serializeFragment(e.content, t, i);
    }
    return r;
  }
  /**
  Serialize this node to a DOM node. This can be useful when you
  need to serialize a part of a document, as opposed to the whole
  document. To serialize a whole document, use
  [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
  its [content](https://prosemirror.net/docs/ref/#model.Node.content).
  */
  serializeNode(e, t = {}) {
    let r = this.serializeNodeInner(e, t);
    for (let i = e.marks.length - 1; i >= 0; i--) {
      let s = this.serializeMark(e.marks[i], e.isInline, t);
      s && ((s.contentDOM || s.dom).appendChild(r), r = s.dom);
    }
    return r;
  }
  /**
  @internal
  */
  serializeMark(e, t, r = {}) {
    let i = this.marks[e.type.name];
    return i && Qn(hi(r), i(e, t), null, e.attrs);
  }
  static renderSpec(e, t, r = null, i) {
    return Qn(e, t, r, i);
  }
  /**
  Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
  properties in a schema's node and mark specs.
  */
  static fromSchema(e) {
    return e.cached.domSerializer || (e.cached.domSerializer = new _t(this.nodesFromSchema(e), this.marksFromSchema(e)));
  }
  /**
  Gather the serializers in a schema's node specs into an object.
  This can be useful as a base to build a custom serializer from.
  */
  static nodesFromSchema(e) {
    let t = go(e.nodes);
    return t.text || (t.text = (r) => r.text), t;
  }
  /**
  Gather the serializers in a schema's mark specs into an object.
  */
  static marksFromSchema(e) {
    return go(e.marks);
  }
}
function go(n) {
  let e = {};
  for (let t in n) {
    let r = n[t].spec.toDOM;
    r && (e[t] = r);
  }
  return e;
}
function hi(n) {
  return n.document || window.document;
}
const bo = /* @__PURE__ */ new WeakMap();
function xd(n) {
  let e = bo.get(n);
  return e === void 0 && bo.set(n, e = vd(n)), e;
}
function vd(n) {
  let e = null;
  function t(r) {
    if (r && typeof r == "object")
      if (Array.isArray(r))
        if (typeof r[0] == "string")
          e || (e = []), e.push(r);
        else
          for (let i = 0; i < r.length; i++)
            t(r[i]);
      else
        for (let i in r)
          t(r[i]);
  }
  return t(n), e;
}
function Qn(n, e, t, r) {
  if (typeof e == "string")
    return { dom: n.createTextNode(e) };
  if (e.nodeType != null)
    return { dom: e };
  if (e.dom && e.dom.nodeType != null)
    return e;
  let i = e[0], s;
  if (typeof i != "string")
    throw new RangeError("Invalid array passed to renderSpec");
  if (r && (s = xd(r)) && s.indexOf(e) > -1)
    throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
  let o = i.indexOf(" ");
  o > 0 && (t = i.slice(0, o), i = i.slice(o + 1));
  let l, a = t ? n.createElementNS(t, i) : n.createElement(i), c = e[1], d = 1;
  if (c && typeof c == "object" && c.nodeType == null && !Array.isArray(c)) {
    d = 2;
    for (let u in c)
      if (c[u] != null) {
        let h = u.indexOf(" ");
        h > 0 ? a.setAttributeNS(u.slice(0, h), u.slice(h + 1), c[u]) : u == "style" && a.style ? a.style.cssText = c[u] : a.setAttribute(u, c[u]);
      }
  }
  for (let u = d; u < e.length; u++) {
    let h = e[u];
    if (h === 0) {
      if (u < e.length - 1 || u > d)
        throw new RangeError("Content hole must be the only child of its parent node");
      return { dom: a, contentDOM: a };
    } else {
      let { dom: p, contentDOM: f } = Qn(n, h, t, r);
      if (a.appendChild(p), f) {
        if (l)
          throw new RangeError("Multiple content holes");
        l = f;
      }
    }
  }
  return { dom: a, contentDOM: l };
}
const ua = 65535, ha = Math.pow(2, 16);
function Md(n, e) {
  return n + e * ha;
}
function yo(n) {
  return n & ua;
}
function Ed(n) {
  return (n - (n & ua)) / ha;
}
const pa = 1, fa = 2, Zn = 4, ma = 8;
class ji {
  /**
  @internal
  */
  constructor(e, t, r) {
    this.pos = e, this.delInfo = t, this.recover = r;
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
    return (this.delInfo & (pa | Zn)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (fa | Zn)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & Zn) > 0;
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
    let t = 0, r = yo(e);
    if (!this.inverted)
      for (let i = 0; i < r; i++)
        t += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    return this.ranges[r * 3] + t + Ed(e);
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
  _map(e, t, r) {
    let i = 0, s = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? i : 0);
      if (a > e)
        break;
      let c = this.ranges[l + s], d = this.ranges[l + o], u = a + c;
      if (e <= u) {
        let h = c ? e == a ? -1 : e == u ? 1 : t : t, p = a + i + (h < 0 ? 0 : d);
        if (r)
          return p;
        let f = e == (t < 0 ? a : u) ? null : Md(l / 3, e - a), m = e == a ? fa : e == u ? pa : Zn;
        return (t < 0 ? e != a : e != u) && (m |= ma), new ji(p, m, f);
      }
      i += d - c;
    }
    return r ? e + i : new ji(e + i, 0, null);
  }
  /**
  @internal
  */
  touches(e, t) {
    let r = 0, i = yo(t), s = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? r : 0);
      if (a > e)
        break;
      let c = this.ranges[l + s], d = a + c;
      if (e <= d && l == i * 3)
        return !0;
      r += this.ranges[l + o] - c;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(e) {
    let t = this.inverted ? 2 : 1, r = this.inverted ? 1 : 2;
    for (let i = 0, s = 0; i < this.ranges.length; i += 3) {
      let o = this.ranges[i], l = o - (this.inverted ? s : 0), a = o + (this.inverted ? 0 : s), c = this.ranges[i + t], d = this.ranges[i + r];
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
class kn {
  /**
  Create a new mapping with the given position maps.
  */
  constructor(e, t, r = 0, i = e ? e.length : 0) {
    this.mirror = t, this.from = r, this.to = i, this._maps = e || [], this.ownData = !(e || t);
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
    return new kn(this._maps, this.mirror, e, t);
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
    for (let t = 0, r = this._maps.length; t < e._maps.length; t++) {
      let i = e.getMirror(t);
      this.appendMap(e._maps[t], i != null && i < t ? r + i : void 0);
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
    for (let t = e.maps.length - 1, r = this._maps.length + e._maps.length; t >= 0; t--) {
      let i = e.getMirror(t);
      this.appendMap(e._maps[t].invert(), i != null && i > t ? r - i - 1 : void 0);
    }
  }
  /**
  Create an inverted version of this mapping.
  */
  invert() {
    let e = new kn();
    return e.appendMappingInverted(this), e;
  }
  /**
  Map a position through this mapping.
  */
  map(e, t = 1) {
    if (this.mirror)
      return this._map(e, t, !0);
    for (let r = this.from; r < this.to; r++)
      e = this._maps[r].map(e, t);
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
  _map(e, t, r) {
    let i = 0;
    for (let s = this.from; s < this.to; s++) {
      let o = this._maps[s], l = o.mapResult(e, t);
      if (l.recover != null) {
        let a = this.getMirror(s);
        if (a != null && a > s && a < this.to) {
          s = a, e = this._maps[a].recover(l.recover);
          continue;
        }
      }
      i |= l.delInfo, e = l.pos;
    }
    return r ? e : new ji(e, i, null);
  }
}
const pi = /* @__PURE__ */ Object.create(null);
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
    let r = pi[t.stepType];
    if (!r)
      throw new RangeError(`No step type ${t.stepType} defined`);
    return r.fromJSON(e, t);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(e, t) {
    if (e in pi)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return pi[e] = t, t.prototype.jsonID = e, t;
  }
}
class U {
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
    return new U(e, null);
  }
  /**
  Create a failed step result.
  */
  static fail(e) {
    return new U(null, e);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(e, t, r, i) {
    try {
      return U.ok(e.replace(t, r, i));
    } catch (s) {
      if (s instanceof lr)
        return U.fail(s.message);
      throw s;
    }
  }
}
function xs(n, e, t) {
  let r = [];
  for (let i = 0; i < n.childCount; i++) {
    let s = n.child(i);
    s.content.size && (s = s.copy(xs(s.content, e, s))), s.isInline && (s = e(s, t, i)), r.push(s);
  }
  return y.fromArray(r);
}
class tt extends ae {
  /**
  Create a mark step.
  */
  constructor(e, t, r) {
    super(), this.from = e, this.to = t, this.mark = r;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), r = e.resolve(this.from), i = r.node(r.sharedDepth(this.to)), s = new x(xs(t.content, (o, l) => !o.isAtom || !l.type.allowsMarkType(this.mark.type) ? o : o.mark(this.mark.addToSet(o.marks)), i), t.openStart, t.openEnd);
    return U.fromReplace(e, this.from, this.to, s);
  }
  invert() {
    return new Oe(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1);
    return t.deleted && r.deleted || t.pos >= r.pos ? null : new tt(t.pos, r.pos, this.mark);
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
class Oe extends ae {
  /**
  Create a mark-removing step.
  */
  constructor(e, t, r) {
    super(), this.from = e, this.to = t, this.mark = r;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), r = new x(xs(t.content, (i) => i.mark(this.mark.removeFromSet(i.marks)), e), t.openStart, t.openEnd);
    return U.fromReplace(e, this.from, this.to, r);
  }
  invert() {
    return new tt(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1);
    return t.deleted && r.deleted || t.pos >= r.pos ? null : new Oe(t.pos, r.pos, this.mark);
  }
  merge(e) {
    return e instanceof Oe && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new Oe(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
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
    return new Oe(t.from, t.to, e.markFromJSON(t.mark));
  }
}
ae.jsonID("removeMark", Oe);
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
      return U.fail("No node at mark step's position");
    let r = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
    return U.fromReplace(e, this.pos, this.pos + 1, new x(y.from(r), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let r = this.mark.addToSet(t.marks);
      if (r.length == t.marks.length) {
        for (let i = 0; i < t.marks.length; i++)
          if (!t.marks[i].isInSet(r))
            return new nt(this.pos, t.marks[i]);
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
      return U.fail("No node at mark step's position");
    let r = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
    return U.fromReplace(e, this.pos, this.pos + 1, new x(y.from(r), 0, t.isLeaf ? 0 : 1));
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
  constructor(e, t, r, i = !1) {
    super(), this.from = e, this.to = t, this.slice = r, this.structure = i;
  }
  apply(e) {
    return this.structure && Ui(e, this.from, this.to) ? U.fail("Structure replace would overwrite content") : U.fromReplace(e, this.from, this.to, this.slice);
  }
  getMap() {
    return new me([this.from, this.to - this.from, this.slice.size]);
  }
  invert(e) {
    return new G(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }
  map(e) {
    let t = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1);
    return t.deletedAcross && r.deletedAcross ? null : new G(t.pos, Math.max(t.pos, r.pos), this.slice, this.structure);
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
  constructor(e, t, r, i, s, o, l = !1) {
    super(), this.from = e, this.to = t, this.gapFrom = r, this.gapTo = i, this.slice = s, this.insert = o, this.structure = l;
  }
  apply(e) {
    if (this.structure && (Ui(e, this.from, this.gapFrom) || Ui(e, this.gapTo, this.to)))
      return U.fail("Structure gap-replace would overwrite content");
    let t = e.slice(this.gapFrom, this.gapTo);
    if (t.openStart || t.openEnd)
      return U.fail("Gap is not a flat range");
    let r = this.slice.insertAt(this.insert, t.content);
    return r ? U.fromReplace(e, this.from, this.to, r) : U.fail("Content does not fit in gap");
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
    let t = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1), i = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1), s = this.to == this.gapTo ? r.pos : e.map(this.gapTo, 1);
    return t.deletedAcross && r.deletedAcross || i < t.pos || s > r.pos ? null : new Y(t.pos, r.pos, i, s, this.slice, this.insert, this.structure);
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
function Ui(n, e, t) {
  let r = n.resolve(e), i = t - e, s = r.depth;
  for (; i > 0 && s > 0 && r.indexAfter(s) == r.node(s).childCount; )
    s--, i--;
  if (i > 0) {
    let o = r.node(s).maybeChild(r.indexAfter(s));
    for (; i > 0; ) {
      if (!o || o.isLeaf)
        return !0;
      o = o.firstChild, i--;
    }
  }
  return !1;
}
function Ad(n, e, t, r) {
  let i = [], s = [], o, l;
  n.doc.nodesBetween(e, t, (a, c, d) => {
    if (!a.isInline)
      return;
    let u = a.marks;
    if (!r.isInSet(u) && d.type.allowsMarkType(r.type)) {
      let h = Math.max(c, e), p = Math.min(c + a.nodeSize, t), f = r.addToSet(u);
      for (let m = 0; m < u.length; m++)
        u[m].isInSet(f) || (o && o.to == h && o.mark.eq(u[m]) ? o.to = p : i.push(o = new Oe(h, p, u[m])));
      l && l.to == h ? l.to = p : s.push(l = new tt(h, p, r));
    }
  }), i.forEach((a) => n.step(a)), s.forEach((a) => n.step(a));
}
function Td(n, e, t, r) {
  let i = [], s = 0;
  n.doc.nodesBetween(e, t, (o, l) => {
    if (!o.isInline)
      return;
    s++;
    let a = null;
    if (r instanceof Kr) {
      let c = o.marks, d;
      for (; d = r.isInSet(c); )
        (a || (a = [])).push(d), c = d.removeFromSet(c);
    } else r ? r.isInSet(o.marks) && (a = [r]) : a = o.marks;
    if (a && a.length) {
      let c = Math.min(l + o.nodeSize, t);
      for (let d = 0; d < a.length; d++) {
        let u = a[d], h;
        for (let p = 0; p < i.length; p++) {
          let f = i[p];
          f.step == s - 1 && u.eq(i[p].style) && (h = f);
        }
        h ? (h.to = c, h.step = s) : i.push({ style: u, from: Math.max(l, e), to: c, step: s });
      }
    }
  }), i.forEach((o) => n.step(new Oe(o.from, o.to, o.style)));
}
function vs(n, e, t, r = t.contentMatch, i = !0) {
  let s = n.doc.nodeAt(e), o = [], l = e + 1;
  for (let a = 0; a < s.childCount; a++) {
    let c = s.child(a), d = l + c.nodeSize, u = r.matchType(c.type);
    if (!u)
      o.push(new G(l, d, x.empty));
    else {
      r = u;
      for (let h = 0; h < c.marks.length; h++)
        t.allowsMarkType(c.marks[h].type) || n.step(new Oe(l, d, c.marks[h]));
      if (i && c.isText && t.whitespace != "pre") {
        let h, p = /\r?\n|\r/g, f;
        for (; h = p.exec(c.text); )
          f || (f = new x(y.from(t.schema.text(" ", t.allowedMarks(c.marks))), 0, 0)), o.push(new G(l + h.index, l + h.index + h[0].length, f));
      }
    }
    l = d;
  }
  if (!r.validEnd) {
    let a = r.fillBefore(y.empty, !0);
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
  for (let r = n.depth, i = 0, s = 0; ; --r) {
    let o = n.$from.node(r), l = n.$from.index(r) + i, a = n.$to.indexAfter(r) - s;
    if (r < n.depth && o.canReplace(l, a, t))
      return r;
    if (r == 0 || o.type.spec.isolating || !Nd(o, l, a))
      break;
    l && (i = 1), a < o.childCount && (s = 1);
  }
  return null;
}
function Od(n, e, t) {
  let { $from: r, $to: i, depth: s } = e, o = r.before(s + 1), l = i.after(s + 1), a = o, c = l, d = y.empty, u = 0;
  for (let f = s, m = !1; f > t; f--)
    m || r.index(f) > 0 ? (m = !0, d = y.from(r.node(f).copy(d)), u++) : a--;
  let h = y.empty, p = 0;
  for (let f = s, m = !1; f > t; f--)
    m || i.after(f + 1) < i.end(f) ? (m = !0, h = y.from(i.node(f).copy(h)), p++) : c++;
  n.step(new Y(a, c, o, l, new x(d.append(h), u, p), d.size - u, !0));
}
function Ms(n, e, t = null, r = n) {
  let i = Ld(n, e), s = i && Rd(r, e);
  return s ? i.map(ko).concat({ type: e, attrs: t }).concat(s.map(ko)) : null;
}
function ko(n) {
  return { type: n, attrs: null };
}
function Ld(n, e) {
  let { parent: t, startIndex: r, endIndex: i } = n, s = t.contentMatchAt(r).findWrapping(e);
  if (!s)
    return null;
  let o = s.length ? s[0] : e;
  return t.canReplaceWith(r, i, o) ? s : null;
}
function Rd(n, e) {
  let { parent: t, startIndex: r, endIndex: i } = n, s = t.child(r), o = e.contentMatch.findWrapping(s.type);
  if (!o)
    return null;
  let a = (o.length ? o[o.length - 1] : e).contentMatch;
  for (let c = r; a && c < i; c++)
    a = a.matchType(t.child(c).type);
  return !a || !a.validEnd ? null : o;
}
function Id(n, e, t) {
  let r = y.empty;
  for (let o = t.length - 1; o >= 0; o--) {
    if (r.size) {
      let l = t[o].type.contentMatch.matchFragment(r);
      if (!l || !l.validEnd)
        throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
    }
    r = y.from(t[o].type.create(t[o].attrs, r));
  }
  let i = e.start, s = e.end;
  n.step(new Y(i, s, i, s, new x(r, 0, 0), t.length, !0));
}
function _d(n, e, t, r, i) {
  if (!r.isTextblock)
    throw new RangeError("Type given to setBlockType should be a textblock");
  let s = n.steps.length;
  n.doc.nodesBetween(e, t, (o, l) => {
    let a = typeof i == "function" ? i(o) : i;
    if (o.isTextblock && !o.hasMarkup(r, a) && Dd(n.doc, n.mapping.slice(s).map(l), r)) {
      let c = null;
      if (r.schema.linebreakReplacement) {
        let p = r.whitespace == "pre", f = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
        p && !f ? c = !1 : !p && f && (c = !0);
      }
      c === !1 && ba(n, o, l, s), vs(n, n.mapping.slice(s).map(l, 1), r, void 0, c === null);
      let d = n.mapping.slice(s), u = d.map(l, 1), h = d.map(l + o.nodeSize, 1);
      return n.step(new Y(u, h, u + 1, h - 1, new x(y.from(r.create(a, null, o.marks)), 0, 0), 1, !0)), c === !0 && ga(n, o, l, s), !1;
    }
  });
}
function ga(n, e, t, r) {
  e.forEach((i, s) => {
    if (i.isText) {
      let o, l = /\r?\n|\r/g;
      for (; o = l.exec(i.text); ) {
        let a = n.mapping.slice(r).map(t + 1 + s + o.index);
        n.replaceWith(a, a + 1, e.type.schema.linebreakReplacement.create());
      }
    }
  });
}
function ba(n, e, t, r) {
  e.forEach((i, s) => {
    if (i.type == i.type.schema.linebreakReplacement) {
      let o = n.mapping.slice(r).map(t + 1 + s);
      n.replaceWith(o, o + 1, e.type.schema.text(`
`));
    }
  });
}
function Dd(n, e, t) {
  let r = n.resolve(e), i = r.index();
  return r.parent.canReplaceWith(i, i + 1, t);
}
function Pd(n, e, t, r, i) {
  let s = n.doc.nodeAt(e);
  if (!s)
    throw new RangeError("No node at given position");
  t || (t = s.type);
  let o = t.create(r, null, i || s.marks);
  if (s.isLeaf)
    return n.replaceWith(e, e + s.nodeSize, o);
  if (!t.validContent(s.content))
    throw new RangeError("Invalid content for node type " + t.name);
  n.step(new Y(e, e + s.nodeSize, e + 1, e + s.nodeSize - 1, new x(y.from(o), 0, 0), 1, !0));
}
function je(n, e, t = 1, r) {
  let i = n.resolve(e), s = i.depth - t, o = r && r[r.length - 1] || i.parent;
  if (s < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !o.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount)))
    return !1;
  for (let c = i.depth - 1, d = t - 2; c > s; c--, d--) {
    let u = i.node(c), h = i.index(c);
    if (u.type.spec.isolating)
      return !1;
    let p = u.content.cutByIndex(h, u.childCount), f = r && r[d + 1];
    f && (p = p.replaceChild(0, f.type.create(f.attrs)));
    let m = r && r[d] || u;
    if (!u.canReplace(h + 1, u.childCount) || !m.type.validContent(p))
      return !1;
  }
  let l = i.indexAfter(s), a = r && r[0];
  return i.node(s).canReplaceWith(l, l, a ? a.type : i.node(s + 1).type);
}
function Bd(n, e, t = 1, r) {
  let i = n.doc.resolve(e), s = y.empty, o = y.empty;
  for (let l = i.depth, a = i.depth - t, c = t - 1; l > a; l--, c--) {
    s = y.from(i.node(l).copy(s));
    let d = r && r[c];
    o = y.from(d ? d.type.create(d.attrs, o) : i.node(l).copy(o));
  }
  n.step(new G(e, e, new x(s.append(o), t, t), !0));
}
function ut(n, e) {
  let t = n.resolve(e), r = t.index();
  return ya(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(r, r + 1);
}
function Hd(n, e) {
  e.content.size || n.type.compatibleContent(e.type);
  let t = n.contentMatchAt(n.childCount), { linebreakReplacement: r } = n.type.schema;
  for (let i = 0; i < e.childCount; i++) {
    let s = e.child(i), o = s.type == r ? n.type.schema.nodes.text : s.type;
    if (t = t.matchType(o), !t || !n.type.allowsMarks(s.marks))
      return !1;
  }
  return t.validEnd;
}
function ya(n, e) {
  return !!(n && e && !n.isLeaf && Hd(n, e));
}
function Jr(n, e, t = -1) {
  let r = n.resolve(e);
  for (let i = r.depth; ; i--) {
    let s, o, l = r.index(i);
    if (i == r.depth ? (s = r.nodeBefore, o = r.nodeAfter) : t > 0 ? (s = r.node(i + 1), l++, o = r.node(i).maybeChild(l)) : (s = r.node(i).maybeChild(l - 1), o = r.node(i + 1)), s && !s.isTextblock && ya(s, o) && r.node(i).canReplace(l, l + 1))
      return e;
    if (i == 0)
      break;
    e = t < 0 ? r.before(i) : r.after(i);
  }
}
function zd(n, e, t) {
  let r = null, { linebreakReplacement: i } = n.doc.type.schema, s = n.doc.resolve(e - t), o = s.node().type;
  if (i && o.inlineContent) {
    let d = o.whitespace == "pre", u = !!o.contentMatch.matchType(i);
    d && !u ? r = !1 : !d && u && (r = !0);
  }
  let l = n.steps.length;
  if (r === !1) {
    let d = n.doc.resolve(e + t);
    ba(n, d.node(), d.before(), l);
  }
  o.inlineContent && vs(n, e + t - 1, o, s.node().contentMatchAt(s.index()), r == null);
  let a = n.mapping.slice(l), c = a.map(e - t);
  if (n.step(new G(c, a.map(e + t, -1), x.empty, !0)), r === !0) {
    let d = n.doc.resolve(c);
    ga(n, d.node(), d.before(), n.steps.length);
  }
  return n;
}
function $d(n, e, t) {
  let r = n.resolve(e);
  if (r.parent.canReplaceWith(r.index(), r.index(), t))
    return e;
  if (r.parentOffset == 0)
    for (let i = r.depth - 1; i >= 0; i--) {
      let s = r.index(i);
      if (r.node(i).canReplaceWith(s, s, t))
        return r.before(i + 1);
      if (s > 0)
        return null;
    }
  if (r.parentOffset == r.parent.content.size)
    for (let i = r.depth - 1; i >= 0; i--) {
      let s = r.indexAfter(i);
      if (r.node(i).canReplaceWith(s, s, t))
        return r.after(i + 1);
      if (s < r.node(i).childCount)
        return null;
    }
  return null;
}
function ka(n, e, t) {
  let r = n.resolve(e);
  if (!t.content.size)
    return e;
  let i = t.content;
  for (let s = 0; s < t.openStart; s++)
    i = i.firstChild.content;
  for (let s = 1; s <= (t.openStart == 0 && t.size ? 2 : 1); s++)
    for (let o = r.depth; o >= 0; o--) {
      let l = o == r.depth ? 0 : r.pos <= (r.start(o + 1) + r.end(o + 1)) / 2 ? -1 : 1, a = r.index(o) + (l > 0 ? 1 : 0), c = r.node(o), d = !1;
      if (s == 1)
        d = c.canReplace(a, a, i);
      else {
        let u = c.contentMatchAt(a).findWrapping(i.firstChild.type);
        d = u && c.canReplaceWith(a, a, u[0]);
      }
      if (d)
        return l == 0 ? r.pos : l < 0 ? r.before(o + 1) : r.after(o + 1);
    }
  return null;
}
function Gr(n, e, t = e, r = x.empty) {
  if (e == t && !r.size)
    return null;
  let i = n.resolve(e), s = n.resolve(t);
  return wa(i, s, r) ? new G(e, t, r) : new Fd(i, s, r).fit();
}
function wa(n, e, t) {
  return !t.openStart && !t.openEnd && n.start() == e.start() && n.parent.canReplace(n.index(), e.index(), t.content);
}
class Fd {
  constructor(e, t, r) {
    this.$from = e, this.$to = t, this.unplaced = r, this.frontier = [], this.placed = y.empty;
    for (let i = 0; i <= e.depth; i++) {
      let s = e.node(i);
      this.frontier.push({
        type: s.type,
        match: s.contentMatchAt(e.indexAfter(i))
      });
    }
    for (let i = e.depth; i > 0; i--)
      this.placed = y.from(e.node(i).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, r = this.$from, i = this.close(e < 0 ? this.$to : r.doc.resolve(e));
    if (!i)
      return null;
    let s = this.placed, o = r.depth, l = i.depth;
    for (; o && l && s.childCount == 1; )
      s = s.firstChild.content, o--, l--;
    let a = new x(s, o, l);
    return e > -1 ? new Y(r.pos, e, this.$to.pos, this.$to.end(), a, t) : a.size || r.pos != this.$to.pos ? new G(r.pos, i.pos, a) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, r = 0, i = this.unplaced.openEnd; r < e; r++) {
      let s = t.firstChild;
      if (t.childCount > 1 && (i = 0), s.type.spec.isolating && i <= r) {
        e = r;
        break;
      }
      t = s.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let r = t == 1 ? e : this.unplaced.openStart; r >= 0; r--) {
        let i, s = null;
        r ? (s = fi(this.unplaced.content, r - 1).firstChild, i = s.content) : i = this.unplaced.content;
        let o = i.firstChild;
        for (let l = this.depth; l >= 0; l--) {
          let { type: a, match: c } = this.frontier[l], d, u = null;
          if (t == 1 && (o ? c.matchType(o.type) || (u = c.fillBefore(y.from(o), !1)) : s && a.compatibleContent(s.type)))
            return { sliceDepth: r, frontierDepth: l, parent: s, inject: u };
          if (t == 2 && o && (d = c.findWrapping(o.type)))
            return { sliceDepth: r, frontierDepth: l, parent: s, wrap: d };
          if (s && c.matchType(s.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: t, openEnd: r } = this.unplaced, i = fi(e, t);
    return !i.childCount || i.firstChild.isLeaf ? !1 : (this.unplaced = new x(e, t + 1, Math.max(r, i.size + t >= e.size - r ? t + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: t, openEnd: r } = this.unplaced, i = fi(e, t);
    if (i.childCount <= 1 && t > 0) {
      let s = e.size - t <= t + i.size;
      this.unplaced = new x(nn(e, t - 1, 1), t - 1, s ? t - 1 : r);
    } else
      this.unplaced = new x(nn(e, t, 1), t, r);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: t, parent: r, inject: i, wrap: s }) {
    for (; this.depth > t; )
      this.closeFrontierNode();
    if (s)
      for (let m = 0; m < s.length; m++)
        this.openFrontierNode(s[m]);
    let o = this.unplaced, l = r ? r.content : o.content, a = o.openStart - e, c = 0, d = [], { match: u, type: h } = this.frontier[t];
    if (i) {
      for (let m = 0; m < i.childCount; m++)
        d.push(i.child(m));
      u = u.matchFragment(i);
    }
    let p = l.size + e - (o.content.size - o.openEnd);
    for (; c < l.childCount; ) {
      let m = l.child(c), g = u.matchType(m.type);
      if (!g)
        break;
      c++, (c > 1 || a == 0 || m.content.size) && (u = g, d.push(Ca(m.mark(h.allowedMarks(m.marks)), c == 1 ? a : 0, c == l.childCount ? p : -1)));
    }
    let f = c == l.childCount;
    f || (p = -1), this.placed = rn(this.placed, t, y.from(d)), this.frontier[t].match = u, f && p < 0 && r && r.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let m = 0, g = l; m < p; m++) {
      let b = g.lastChild;
      this.frontier.push({ type: b.type, match: b.contentMatchAt(b.childCount) }), g = b.content;
    }
    this.unplaced = f ? e == 0 ? x.empty : new x(nn(o.content, e - 1, 1), e - 1, p < 0 ? o.openEnd : e - 1) : new x(nn(o.content, e, c), o.openStart, o.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], t;
    if (!e.type.isTextblock || !mi(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
      return -1;
    let { depth: r } = this.$to, i = this.$to.after(r);
    for (; r > 1 && i == this.$to.end(--r); )
      ++i;
    return i;
  }
  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: r, type: i } = this.frontier[t], s = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), o = mi(e, t, i, r, s);
      if (o) {
        for (let l = t - 1; l >= 0; l--) {
          let { match: a, type: c } = this.frontier[l], d = mi(e, l, c, a, !0);
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
    for (let r = t.depth + 1; r <= e.depth; r++) {
      let i = e.node(r), s = i.type.contentMatch.fillBefore(i.content, !0, e.index(r));
      this.openFrontierNode(i.type, i.attrs, s);
    }
    return e;
  }
  openFrontierNode(e, t = null, r) {
    let i = this.frontier[this.depth];
    i.match = i.match.matchType(e), this.placed = rn(this.placed, this.depth, y.from(e.create(t, r))), this.frontier.push({ type: e, match: e.contentMatch });
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
function fi(n, e) {
  for (let t = 0; t < e; t++)
    n = n.firstChild.content;
  return n;
}
function Ca(n, e, t) {
  if (e <= 0)
    return n;
  let r = n.content;
  return e > 1 && (r = r.replaceChild(0, Ca(r.firstChild, e - 1, r.childCount == 1 ? t - 1 : 0))), e > 0 && (r = n.type.contentMatch.fillBefore(r).append(r), t <= 0 && (r = r.append(n.type.contentMatch.matchFragment(r).fillBefore(y.empty, !0)))), n.copy(r);
}
function mi(n, e, t, r, i) {
  let s = n.node(e), o = i ? n.indexAfter(e) : n.index(e);
  if (o == s.childCount && !t.compatibleContent(s.type))
    return null;
  let l = r.fillBefore(s.content, !0, o);
  return l && !Vd(t, s.content, o) ? l : null;
}
function Vd(n, e, t) {
  for (let r = t; r < e.childCount; r++)
    if (!n.allowsMarks(e.child(r).marks))
      return !0;
  return !1;
}
function qd(n) {
  return n.spec.defining || n.spec.definingForContent;
}
function Wd(n, e, t, r) {
  if (!r.size)
    return n.deleteRange(e, t);
  let i = n.doc.resolve(e), s = n.doc.resolve(t);
  if (wa(i, s, r))
    return n.step(new G(e, t, r));
  let o = xa(i, s);
  o[o.length - 1] == 0 && o.pop();
  let l = -(i.depth + 1);
  o.unshift(l);
  for (let h = i.depth, p = i.pos - 1; h > 0; h--, p--) {
    let f = i.node(h).type.spec;
    if (f.defining || f.definingAsContext || f.isolating)
      break;
    o.indexOf(h) > -1 ? l = h : i.before(h) == p && o.splice(1, 0, -h);
  }
  let a = o.indexOf(l), c = [], d = r.openStart;
  for (let h = r.content, p = 0; ; p++) {
    let f = h.firstChild;
    if (c.push(f), p == r.openStart)
      break;
    h = f.content;
  }
  for (let h = d - 1; h >= 0; h--) {
    let p = c[h], f = qd(p.type);
    if (f && !p.sameMarkup(i.node(Math.abs(l) - 1)))
      d = h;
    else if (f || !p.type.isTextblock)
      break;
  }
  for (let h = r.openStart; h >= 0; h--) {
    let p = (h + d + 1) % (r.openStart + 1), f = c[p];
    if (f)
      for (let m = 0; m < o.length; m++) {
        let g = o[(m + a) % o.length], b = !0;
        g < 0 && (b = !1, g = -g);
        let k = i.node(g - 1), w = i.index(g - 1);
        if (k.canReplaceWith(w, w, f.type, f.marks))
          return n.replace(i.before(g), b ? s.after(g) : t, new x(Sa(r.content, 0, r.openStart, p), p, r.openEnd));
      }
  }
  let u = n.steps.length;
  for (let h = o.length - 1; h >= 0 && (n.replace(e, t, r), !(n.steps.length > u)); h--) {
    let p = o[h];
    p < 0 || (e = i.before(p), t = s.after(p));
  }
}
function Sa(n, e, t, r, i) {
  if (e < t) {
    let s = n.firstChild;
    n = n.replaceChild(0, s.copy(Sa(s.content, e + 1, t, r, s)));
  }
  if (e > r) {
    let s = i.contentMatchAt(0), o = s.fillBefore(n).append(n);
    n = o.append(s.matchFragment(o).fillBefore(y.empty, !0));
  }
  return n;
}
function jd(n, e, t, r) {
  if (!r.isInline && e == t && n.doc.resolve(e).parent.content.size) {
    let i = $d(n.doc, e, r.type);
    i != null && (e = t = i);
  }
  n.replaceRange(e, t, new x(y.from(r), 0, 0));
}
function Ud(n, e, t) {
  let r = n.doc.resolve(e), i = n.doc.resolve(t), s = xa(r, i);
  for (let o = 0; o < s.length; o++) {
    let l = s[o], a = o == s.length - 1;
    if (a && l == 0 || r.node(l).type.contentMatch.validEnd)
      return n.delete(r.start(l), i.end(l));
    if (l > 0 && (a || r.node(l - 1).canReplace(r.index(l - 1), i.indexAfter(l - 1))))
      return n.delete(r.before(l), i.after(l));
  }
  for (let o = 1; o <= r.depth && o <= i.depth; o++)
    if (e - r.start(o) == r.depth - o && t > r.end(o) && i.end(o) - t != i.depth - o && r.start(o - 1) == i.start(o - 1) && r.node(o - 1).canReplace(r.index(o - 1), i.index(o - 1)))
      return n.delete(r.before(o), t);
  n.delete(e, t);
}
function xa(n, e) {
  let t = [], r = Math.min(n.depth, e.depth);
  for (let i = r; i >= 0; i--) {
    let s = n.start(i);
    if (s < n.pos - (n.depth - i) || e.end(i) > e.pos + (e.depth - i) || n.node(i).type.spec.isolating || e.node(i).type.spec.isolating)
      break;
    (s == e.start(i) || i == n.depth && i == e.depth && n.parent.inlineContent && e.parent.inlineContent && i && e.start(i - 1) == s - 1) && t.push(i);
  }
  return t;
}
class qt extends ae {
  /**
  Construct an attribute step.
  */
  constructor(e, t, r) {
    super(), this.pos = e, this.attr = t, this.value = r;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return U.fail("No node at attribute step's position");
    let r = /* @__PURE__ */ Object.create(null);
    for (let s in t.attrs)
      r[s] = t.attrs[s];
    r[this.attr] = this.value;
    let i = t.type.create(r, null, t.marks);
    return U.fromReplace(e, this.pos, this.pos + 1, new x(y.from(i), 0, t.isLeaf ? 0 : 1));
  }
  getMap() {
    return me.empty;
  }
  invert(e) {
    return new qt(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new qt(t.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.pos != "number" || typeof t.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new qt(t.pos, t.attr, t.value);
  }
}
ae.jsonID("attr", qt);
class wn extends ae {
  /**
  Construct an attribute step.
  */
  constructor(e, t) {
    super(), this.attr = e, this.value = t;
  }
  apply(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e.attrs)
      t[i] = e.attrs[i];
    t[this.attr] = this.value;
    let r = e.type.create(t, e.content, e.marks);
    return U.ok(r);
  }
  getMap() {
    return me.empty;
  }
  invert(e) {
    return new wn(this.attr, e.attrs[this.attr]);
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
    return new wn(t.attr, t.value);
  }
}
ae.jsonID("docAttr", wn);
let jt = class extends Error {
};
jt = function n(e) {
  let t = Error.call(this, e);
  return t.__proto__ = n.prototype, t;
};
jt.prototype = Object.create(Error.prototype);
jt.prototype.constructor = jt;
jt.prototype.name = "TransformError";
class Es {
  /**
  Create a transform that starts with the given document.
  */
  constructor(e) {
    this.doc = e, this.steps = [], this.docs = [], this.mapping = new kn();
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
    for (let r = 0; r < this.mapping.maps.length; r++) {
      let i = this.mapping.maps[r];
      r && (e = i.map(e, 1), t = i.map(t, -1)), i.forEach((s, o, l, a) => {
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
  replace(e, t = e, r = x.empty) {
    let i = Gr(this.doc, e, t, r);
    return i && this.step(i), this;
  }
  /**
  Replace the given range with the given content, which may be a
  fragment, node, or array of nodes.
  */
  replaceWith(e, t, r) {
    return this.replace(e, t, new x(y.from(r), 0, 0));
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
  replaceRange(e, t, r) {
    return Wd(this, e, t, r), this;
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
  replaceRangeWith(e, t, r) {
    return jd(this, e, t, r), this;
  }
  /**
  Delete the given range, expanding it to cover fully covered
  parent nodes until a valid replace is found.
  */
  deleteRange(e, t) {
    return Ud(this, e, t), this;
  }
  /**
  Split the content in the given range off from its parent, if there
  is sibling content before or after it, and move it up the tree to
  the depth specified by `target`. You'll probably want to use
  [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
  sure the lift is valid.
  */
  lift(e, t) {
    return Od(this, e, t), this;
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
    return Id(this, e, t), this;
  }
  /**
  Set the type of all textblocks (partly) between `from` and `to` to
  the given node type with the given attributes.
  */
  setBlockType(e, t = e, r, i = null) {
    return _d(this, e, t, r, i), this;
  }
  /**
  Change the type, attributes, and/or marks of the node at `pos`.
  When `type` isn't given, the existing node type is preserved,
  */
  setNodeMarkup(e, t, r = null, i) {
    return Pd(this, e, t, r, i), this;
  }
  /**
  Set a single attribute on a given node to a new value.
  The `pos` addresses the document content. Use `setDocAttribute`
  to set attributes on the document itself.
  */
  setNodeAttribute(e, t, r) {
    return this.step(new qt(e, t, r)), this;
  }
  /**
  Set a single attribute on the document to a new value.
  */
  setDocAttribute(e, t) {
    return this.step(new wn(e, t)), this;
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
    let r = this.doc.nodeAt(e);
    if (!r)
      throw new RangeError("No node at position " + e);
    if (t instanceof P)
      t.isInSet(r.marks) && this.step(new Tt(e, t));
    else {
      let i = r.marks, s, o = [];
      for (; s = t.isInSet(i); )
        o.push(new Tt(e, s)), i = s.removeFromSet(i);
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
  split(e, t = 1, r) {
    return Bd(this, e, t, r), this;
  }
  /**
  Add the given mark to the inline content between `from` and `to`.
  */
  addMark(e, t, r) {
    return Ad(this, e, t, r), this;
  }
  /**
  Remove marks from inline nodes between `from` and `to`. When
  `mark` is a single mark, remove precisely that mark. When it is
  a mark type, remove all marks of that type. When it is null,
  remove all marks of any type.
  */
  removeMark(e, t, r) {
    return Td(this, e, t, r), this;
  }
  /**
  Removes all marks and nodes from the content of the node at
  `pos` that don't match the given new parent node type. Accepts
  an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
  third argument.
  */
  clearIncompatible(e, t, r) {
    return vs(this, e, t, r), this;
  }
}
const gi = /* @__PURE__ */ Object.create(null);
class N {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, t, r) {
    this.$anchor = e, this.$head = t, this.ranges = r || [new va(e.min(t), e.max(t))];
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
    let r = t.content.lastChild, i = null;
    for (let l = 0; l < t.openEnd; l++)
      i = r, r = r.lastChild;
    let s = e.steps.length, o = this.ranges;
    for (let l = 0; l < o.length; l++) {
      let { $from: a, $to: c } = o[l], d = e.mapping.slice(s);
      e.replaceRange(d.map(a.pos), d.map(c.pos), l ? x.empty : t), l == 0 && So(e, s, (r ? r.isInline : i && i.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, t) {
    let r = e.steps.length, i = this.ranges;
    for (let s = 0; s < i.length; s++) {
      let { $from: o, $to: l } = i[s], a = e.mapping.slice(r), c = a.map(o.pos), d = a.map(l.pos);
      s ? e.deleteRange(c, d) : (e.replaceRangeWith(c, d, t), So(e, r, t.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(e, t, r = !1) {
    let i = e.parent.inlineContent ? new T(e) : Ht(e.node(0), e.parent, e.pos, e.index(), t, r);
    if (i)
      return i;
    for (let s = e.depth - 1; s >= 0; s--) {
      let o = t < 0 ? Ht(e.node(0), e.node(s), e.before(s + 1), e.index(s), t, r) : Ht(e.node(0), e.node(s), e.after(s + 1), e.index(s) + 1, t, r);
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
    let r = gi[t.type];
    if (!r)
      throw new RangeError(`No selection type ${t.type} defined`);
    return r.fromJSON(e, t);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(e, t) {
    if (e in gi)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return gi[e] = t, t.prototype.jsonID = e, t;
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
N.prototype.visible = !0;
class va {
  /**
  Create a range.
  */
  constructor(e, t) {
    this.$from = e, this.$to = t;
  }
}
let wo = !1;
function Co(n) {
  !wo && !n.parent.inlineContent && (wo = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + n.parent.type.name + ")"));
}
class T extends N {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, t = e) {
    Co(e), Co(t), super(e, t);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(e, t) {
    let r = e.resolve(t.map(this.head));
    if (!r.parent.inlineContent)
      return N.near(r);
    let i = e.resolve(t.map(this.anchor));
    return new T(i.parent.inlineContent ? i : r, r);
  }
  replace(e, t = x.empty) {
    if (super.replace(e, t), t == x.empty) {
      let r = this.$from.marksAcross(this.$to);
      r && e.ensureMarks(r);
    }
  }
  eq(e) {
    return e instanceof T && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new Yr(this.anchor, this.head);
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
    return new T(e.resolve(t.anchor), e.resolve(t.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, t, r = t) {
    let i = e.resolve(t);
    return new this(i, r == t ? i : e.resolve(r));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(e, t, r) {
    let i = e.pos - t.pos;
    if ((!r || i) && (r = i >= 0 ? 1 : -1), !t.parent.inlineContent) {
      let s = N.findFrom(t, r, !0) || N.findFrom(t, -r, !0);
      if (s)
        t = s.$head;
      else
        return N.near(t, r);
    }
    return e.parent.inlineContent || (i == 0 ? e = t : (e = (N.findFrom(e, -r, !0) || N.findFrom(e, r, !0)).$anchor, e.pos < t.pos != i < 0 && (e = t))), new T(e, t);
  }
}
N.jsonID("text", T);
class Yr {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Yr(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return T.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class A extends N {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let t = e.nodeAfter, r = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, r), this.node = t;
  }
  map(e, t) {
    let { deleted: r, pos: i } = t.mapResult(this.anchor), s = e.resolve(i);
    return r ? N.near(s) : new A(s);
  }
  content() {
    return new x(y.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof A && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new As(this.anchor);
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
N.jsonID("node", A);
class As {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: t, pos: r } = e.mapResult(this.anchor);
    return t ? new Yr(r, r) : new As(r);
  }
  resolve(e) {
    let t = e.resolve(this.anchor), r = t.nodeAfter;
    return r && A.isSelectable(r) ? new A(t) : N.near(t);
  }
}
class be extends N {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, t = x.empty) {
    if (t == x.empty) {
      e.delete(0, e.doc.content.size);
      let r = N.atStart(e.doc);
      r.eq(e.selection) || e.setSelection(r);
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
N.jsonID("all", be);
const Kd = {
  map() {
    return this;
  },
  resolve(n) {
    return new be(n);
  }
};
function Ht(n, e, t, r, i, s = !1) {
  if (e.inlineContent)
    return T.create(n, t);
  for (let o = r - (i > 0 ? 0 : 1); i > 0 ? o < e.childCount : o >= 0; o += i) {
    let l = e.child(o);
    if (l.isAtom) {
      if (!s && A.isSelectable(l))
        return A.create(n, t - (i < 0 ? l.nodeSize : 0));
    } else {
      let a = Ht(n, l, t + i, i < 0 ? l.childCount : 0, i, s);
      if (a)
        return a;
    }
    t += l.nodeSize * i;
  }
  return null;
}
function So(n, e, t) {
  let r = n.steps.length - 1;
  if (r < e)
    return;
  let i = n.steps[r];
  if (!(i instanceof G || i instanceof Y))
    return;
  let s = n.mapping.maps[r], o;
  s.forEach((l, a, c, d) => {
    o == null && (o = d);
  }), n.setSelection(N.near(n.doc.resolve(o), t));
}
const xo = 1, Bn = 2, vo = 4;
class Jd extends Es {
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
    return this.curSelection = e, this.curSelectionFor = this.steps.length, this.updated = (this.updated | xo) & ~Bn, this.storedMarks = null, this;
  }
  /**
  Whether the selection was explicitly updated by this transaction.
  */
  get selectionSet() {
    return (this.updated & xo) > 0;
  }
  /**
  Set the current stored marks.
  */
  setStoredMarks(e) {
    return this.storedMarks = e, this.updated |= Bn, this;
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
    return (this.updated & Bn) > 0;
  }
  /**
  @internal
  */
  addStep(e, t) {
    super.addStep(e, t), this.updated = this.updated & ~Bn, this.storedMarks = null;
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
    let r = this.selection;
    return t && (e = e.mark(this.storedMarks || (r.empty ? r.$from.marks() : r.$from.marksAcross(r.$to) || P.none))), r.replaceWith(this, e), this;
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
  insertText(e, t, r) {
    let i = this.doc.type.schema;
    if (t == null)
      return e ? this.replaceSelectionWith(i.text(e), !0) : this.deleteSelection();
    {
      if (r == null && (r = t), !e)
        return this.deleteRange(t, r);
      let s = this.storedMarks;
      if (!s) {
        let o = this.doc.resolve(t);
        s = r == t ? o.marks() : o.marksAcross(this.doc.resolve(r));
      }
      return this.replaceRangeWith(t, r, i.text(e, s)), !this.selection.empty && this.selection.to == t + e.length && this.setSelection(N.near(this.selection.$to)), this;
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
    return this.updated |= vo, this;
  }
  /**
  True when this transaction has had `scrollIntoView` called on it.
  */
  get scrolledIntoView() {
    return (this.updated & vo) > 0;
  }
}
function Mo(n, e) {
  return !e || !n ? n : n.bind(e);
}
class sn {
  constructor(e, t, r) {
    this.name = e, this.init = Mo(t.init, r), this.apply = Mo(t.apply, r);
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
      return n.selection || N.atStart(e.doc);
    },
    apply(n) {
      return n.selection;
    }
  }),
  new sn("storedMarks", {
    init(n) {
      return n.storedMarks || null;
    },
    apply(n, e, t, r) {
      return r.selection.$cursor ? n.storedMarks : null;
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
class bi {
  constructor(e, t) {
    this.schema = e, this.plugins = [], this.pluginsByKey = /* @__PURE__ */ Object.create(null), this.fields = Gd.slice(), t && t.forEach((r) => {
      if (this.pluginsByKey[r.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + r.key + ")");
      this.plugins.push(r), this.pluginsByKey[r.key] = r, r.spec.state && this.fields.push(new sn(r.key, r.spec.state, r));
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
    for (let r = 0; r < this.config.plugins.length; r++)
      if (r != t) {
        let i = this.config.plugins[r];
        if (i.spec.filterTransaction && !i.spec.filterTransaction.call(i, e, this))
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
    let t = [e], r = this.applyInner(e), i = null;
    for (; ; ) {
      let s = !1;
      for (let o = 0; o < this.config.plugins.length; o++) {
        let l = this.config.plugins[o];
        if (l.spec.appendTransaction) {
          let a = i ? i[o].n : 0, c = i ? i[o].state : this, d = a < t.length && l.spec.appendTransaction.call(l, a ? t.slice(a) : t, c, r);
          if (d && r.filterTransaction(d, o)) {
            if (d.setMeta("appendedTransaction", e), !i) {
              i = [];
              for (let u = 0; u < this.config.plugins.length; u++)
                i.push(u < o ? { state: r, n: t.length } : { state: this, n: 0 });
            }
            t.push(d), r = r.applyInner(d), s = !0;
          }
          i && (i[o] = { state: r, n: t.length });
        }
      }
      if (!s)
        return { state: r, transactions: t };
    }
  }
  /**
  @internal
  */
  applyInner(e) {
    if (!e.before.eq(this.doc))
      throw new RangeError("Applying a mismatched transaction");
    let t = new Ft(this.config), r = this.config.fields;
    for (let i = 0; i < r.length; i++) {
      let s = r[i];
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
    let t = new bi(e.doc ? e.doc.type.schema : e.schema, e.plugins), r = new Ft(t);
    for (let i = 0; i < t.fields.length; i++)
      r[t.fields[i].name] = t.fields[i].init(e, r);
    return r;
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
    let t = new bi(this.schema, e.plugins), r = t.fields, i = new Ft(t);
    for (let s = 0; s < r.length; s++) {
      let o = r[s].name;
      i[o] = this.hasOwnProperty(o) ? this[o] : r[s].init(e, i);
    }
    return i;
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
    if (this.storedMarks && (t.storedMarks = this.storedMarks.map((r) => r.toJSON())), e && typeof e == "object")
      for (let r in e) {
        if (r == "doc" || r == "selection")
          throw new RangeError("The JSON fields `doc` and `selection` are reserved");
        let i = e[r], s = i.spec.state;
        s && s.toJSON && (t[r] = s.toJSON.call(i, this[i.key]));
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
  static fromJSON(e, t, r) {
    if (!t)
      throw new RangeError("Invalid input for EditorState.fromJSON");
    if (!e.schema)
      throw new RangeError("Required config field 'schema' missing");
    let i = new bi(e.schema, e.plugins), s = new Ft(i);
    return i.fields.forEach((o) => {
      if (o.name == "doc")
        s.doc = it.fromJSON(e.schema, t.doc);
      else if (o.name == "selection")
        s.selection = N.fromJSON(s.doc, t.selection);
      else if (o.name == "storedMarks")
        t.storedMarks && (s.storedMarks = t.storedMarks.map(e.schema.markFromJSON));
      else {
        if (r)
          for (let l in r) {
            let a = r[l], c = a.spec.state;
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
  for (let r in n) {
    let i = n[r];
    i instanceof Function ? i = i.bind(e) : r == "handleDOMEvents" && (i = Ma(i, e, {})), t[r] = i;
  }
  return t;
}
class j {
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
const yi = /* @__PURE__ */ Object.create(null);
function Ea(n) {
  return n in yi ? n + "$" + ++yi[n] : (yi[n] = 0, n + "$");
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
}, Ut = function(n) {
  let e = n.assignedSlot || n.parentNode;
  return e && e.nodeType == 11 ? e.host : e;
};
let Ki = null;
const qe = function(n, e, t) {
  let r = Ki || (Ki = document.createRange());
  return r.setEnd(n, t ?? n.nodeValue.length), r.setStart(n, e || 0), r;
}, Yd = function() {
  Ki = null;
}, Nt = function(n, e, t, r) {
  return t && (Eo(n, e, t, r, -1) || Eo(n, e, t, r, 1));
}, Xd = /^(img|br|input|textarea|hr)$/i;
function Eo(n, e, t, r, i) {
  for (var s; ; ) {
    if (n == t && e == r)
      return !0;
    if (e == (i < 0 ? 0 : Ce(n))) {
      let o = n.parentNode;
      if (!o || o.nodeType != 1 || Ln(n) || Xd.test(n.nodeName) || n.contentEditable == "false")
        return !1;
      e = te(n) + (i < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      let o = n.childNodes[e + (i < 0 ? -1 : 0)];
      if (o.nodeType == 1 && o.contentEditable == "false")
        if (!((s = o.pmViewDesc) === null || s === void 0) && s.ignoreForSelection)
          e += i;
        else
          return !1;
      else
        n = o, e = i < 0 ? Ce(n) : 0;
    } else
      return !1;
  }
}
function Ce(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function Qd(n, e) {
  for (; ; ) {
    if (n.nodeType == 3 && e)
      return n;
    if (n.nodeType == 1 && e > 0) {
      if (n.contentEditable == "false")
        return null;
      n = n.childNodes[e - 1], e = Ce(n);
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
  for (let r = e == 0, i = e == Ce(n); r || i; ) {
    if (n == t)
      return !0;
    let s = te(n);
    if (n = n.parentNode, !n)
      return !1;
    r = r && s == 0, i = i && s == Ce(n);
  }
}
function Ln(n) {
  let e;
  for (let t = n; t && !(e = t.pmViewDesc); t = t.parentNode)
    ;
  return e && e.node && e.node.isBlock && (e.dom == n || e.contentDOM == n);
}
const Xr = function(n) {
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
      let r = n.caretPositionFromPoint(e, t);
      if (r)
        return { node: r.offsetNode, offset: Math.min(Ce(r.offsetNode), r.offset) };
    } catch {
    }
  if (n.caretRangeFromPoint) {
    let r = n.caretRangeFromPoint(e, t);
    if (r)
      return { node: r.startContainer, offset: Math.min(Ce(r.startContainer), r.startOffset) };
  }
}
const Le = typeof navigator < "u" ? navigator : null, Ao = typeof document < "u" ? document : null, ht = Le && Le.userAgent || "", Ji = /Edge\/(\d+)/.exec(ht), Aa = /MSIE \d/.exec(ht), Gi = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(ht), pe = !!(Aa || Gi || Ji), ot = Aa ? document.documentMode : Gi ? +Gi[1] : Ji ? +Ji[1] : 0, Se = !pe && /gecko\/(\d+)/i.test(ht);
Se && +(/Firefox\/(\d+)/.exec(ht) || [0, 0])[1];
const Yi = !pe && /Chrome\/(\d+)/.exec(ht), re = !!Yi, Ta = Yi ? +Yi[1] : 0, oe = !pe && !!Le && /Apple Computer/.test(Le.vendor), Kt = oe && (/Mobile\/\w+/.test(ht) || !!Le && Le.maxTouchPoints > 2), we = Kt || (Le ? /Mac/.test(Le.platform) : !1), Na = Le ? /Win/.test(Le.platform) : !1, We = /Android \d/.test(ht), Rn = !!Ao && "webkitFontSmoothing" in Ao.documentElement.style, ru = Rn ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function iu(n) {
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
  let e = n.getBoundingClientRect(), t = e.width / n.offsetWidth || 1, r = e.height / n.offsetHeight || 1;
  return {
    left: e.left,
    right: e.left + n.clientWidth * t,
    top: e.top,
    bottom: e.top + n.clientHeight * r
  };
}
function To(n, e, t) {
  let r = n.someProp("scrollThreshold") || 0, i = n.someProp("scrollMargin") || 5, s = n.dom.ownerDocument;
  for (let o = t || n.dom; o; ) {
    if (o.nodeType != 1) {
      o = Ut(o);
      continue;
    }
    let l = o, a = l == s.body, c = a ? iu(s) : su(l), d = 0, u = 0;
    if (e.top < c.top + He(r, "top") ? u = -(c.top - e.top + He(i, "top")) : e.bottom > c.bottom - He(r, "bottom") && (u = e.bottom - e.top > c.bottom - c.top ? e.top + He(i, "top") - c.top : e.bottom - c.bottom + He(i, "bottom")), e.left < c.left + He(r, "left") ? d = -(c.left - e.left + He(i, "left")) : e.right > c.right - He(r, "right") && (d = e.right - c.right + He(i, "right")), d || u)
      if (a)
        s.defaultView.scrollBy(d, u);
      else {
        let p = l.scrollLeft, f = l.scrollTop;
        u && (l.scrollTop += u), d && (l.scrollLeft += d);
        let m = l.scrollLeft - p, g = l.scrollTop - f;
        e = { left: e.left - m, top: e.top - g, right: e.right - m, bottom: e.bottom - g };
      }
    let h = a ? "fixed" : getComputedStyle(o).position;
    if (/^(fixed|sticky)$/.test(h))
      break;
    o = h == "absolute" ? o.offsetParent : Ut(o);
  }
}
function ou(n) {
  let e = n.dom.getBoundingClientRect(), t = Math.max(0, e.top), r, i;
  for (let s = (e.left + e.right) / 2, o = t + 1; o < Math.min(innerHeight, e.bottom); o += 5) {
    let l = n.root.elementFromPoint(s, o);
    if (!l || l == n.dom || !n.dom.contains(l))
      continue;
    let a = l.getBoundingClientRect();
    if (a.top >= t - 20) {
      r = l, i = a.top;
      break;
    }
  }
  return { refDOM: r, refTop: i, stack: Oa(n.dom) };
}
function Oa(n) {
  let e = [], t = n.ownerDocument;
  for (let r = n; r && (e.push({ dom: r, top: r.scrollTop, left: r.scrollLeft }), n != t); r = Ut(r))
    ;
  return e;
}
function lu({ refDOM: n, refTop: e, stack: t }) {
  let r = n ? n.getBoundingClientRect().top : 0;
  La(t, r == 0 ? 0 : r - e);
}
function La(n, e) {
  for (let t = 0; t < n.length; t++) {
    let { dom: r, top: i, left: s } = n[t];
    r.scrollTop != i + e && (r.scrollTop = i + e), r.scrollLeft != s && (r.scrollLeft = s);
  }
}
let Pt = null;
function au(n) {
  if (n.setActive)
    return n.setActive();
  if (Pt)
    return n.focus(Pt);
  let e = Oa(n);
  n.focus(Pt == null ? {
    get preventScroll() {
      return Pt = { preventScroll: !0 }, !0;
    }
  } : void 0), Pt || (Pt = !1, La(e, 0));
}
function Ra(n, e) {
  let t, r = 2e8, i, s = 0, o = e.top, l = e.top, a, c;
  for (let d = n.firstChild, u = 0; d; d = d.nextSibling, u++) {
    let h;
    if (d.nodeType == 1)
      h = d.getClientRects();
    else if (d.nodeType == 3)
      h = qe(d).getClientRects();
    else
      continue;
    for (let p = 0; p < h.length; p++) {
      let f = h[p];
      if (f.top <= o && f.bottom >= l) {
        o = Math.max(f.bottom, o), l = Math.min(f.top, l);
        let m = f.left > e.left ? f.left - e.left : f.right < e.left ? e.left - f.right : 0;
        if (m < r) {
          t = d, r = m, i = m && t.nodeType == 3 ? {
            left: f.right < e.left ? f.right : f.left,
            top: e.top
          } : e, d.nodeType == 1 && m && (s = u + (e.left >= (f.left + f.right) / 2 ? 1 : 0));
          continue;
        }
      } else f.top > e.top && !a && f.left <= e.left && f.right >= e.left && (a = d, c = { left: Math.max(f.left, Math.min(f.right, e.left)), top: f.top });
      !t && (e.left >= f.right && e.top >= f.top || e.left >= f.left && e.top >= f.bottom) && (s = u + 1);
    }
  }
  return !t && a && (t = a, i = c, r = 0), t && t.nodeType == 3 ? cu(t, i) : !t || r && t.nodeType == 1 ? { node: n, offset: s } : Ra(t, i);
}
function cu(n, e) {
  let t = n.nodeValue.length, r = document.createRange(), i;
  for (let s = 0; s < t; s++) {
    r.setEnd(n, s + 1), r.setStart(n, s);
    let o = Je(r, 1);
    if (o.top != o.bottom && Ts(e, o)) {
      i = { node: n, offset: s + (e.left >= (o.left + o.right) / 2 ? 1 : 0) };
      break;
    }
  }
  return r.detach(), i || { node: n, offset: 0 };
}
function Ts(n, e) {
  return n.left >= e.left - 1 && n.left <= e.right + 1 && n.top >= e.top - 1 && n.top <= e.bottom + 1;
}
function du(n, e) {
  let t = n.parentNode;
  return t && /^li$/i.test(t.nodeName) && e.left < n.getBoundingClientRect().left ? t : n;
}
function uu(n, e, t) {
  let { node: r, offset: i } = Ra(e, t), s = -1;
  if (r.nodeType == 1 && !r.firstChild) {
    let o = r.getBoundingClientRect();
    s = o.left != o.right && t.left > (o.left + o.right) / 2 ? 1 : -1;
  }
  return n.docView.posFromDOM(r, i, s);
}
function hu(n, e, t, r) {
  let i = -1;
  for (let s = e, o = !1; s != n.dom; ) {
    let l = n.docView.nearestDesc(s, !0), a;
    if (!l)
      return null;
    if (l.dom.nodeType == 1 && (l.node.isBlock && l.parent || !l.contentDOM) && // Ignore elements with zero-size bounding rectangles
    ((a = l.dom.getBoundingClientRect()).width || a.height) && (l.node.isBlock && l.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(l.dom.nodeName) && (!o && a.left > r.left || a.top > r.top ? i = l.posBefore : (!o && a.right < r.left || a.bottom < r.top) && (i = l.posAfter), o = !0), !l.contentDOM && i < 0 && !l.node.isText))
      return (l.node.isBlock ? r.top < (a.top + a.bottom) / 2 : r.left < (a.left + a.right) / 2) ? l.posBefore : l.posAfter;
    s = l.dom.parentNode;
  }
  return i > -1 ? i : n.docView.posFromDOM(e, t, -1);
}
function Ia(n, e, t) {
  let r = n.childNodes.length;
  if (r && t.top < t.bottom)
    for (let i = Math.max(0, Math.min(r - 1, Math.floor(r * (e.top - t.top) / (t.bottom - t.top)) - 2)), s = i; ; ) {
      let o = n.childNodes[s];
      if (o.nodeType == 1) {
        let l = o.getClientRects();
        for (let a = 0; a < l.length; a++) {
          let c = l[a];
          if (Ts(e, c))
            return Ia(o, e, c);
        }
      }
      if ((s = (s + 1) % r) == i)
        break;
    }
  return n;
}
function pu(n, e) {
  let t = n.dom.ownerDocument, r, i = 0, s = nu(t, e.left, e.top);
  s && ({ node: r, offset: i } = s);
  let o = (n.root.elementFromPoint ? n.root : t).elementFromPoint(e.left, e.top), l;
  if (!o || !n.dom.contains(o.nodeType != 1 ? o.parentNode : o)) {
    let c = n.dom.getBoundingClientRect();
    if (!Ts(e, c) || (o = Ia(n.dom, e, c), !o))
      return null;
  }
  if (oe)
    for (let c = o; r && c; c = Ut(c))
      c.draggable && (r = void 0);
  if (o = du(o, e), r) {
    if (Se && r.nodeType == 1 && (i = Math.min(i, r.childNodes.length), i < r.childNodes.length)) {
      let d = r.childNodes[i], u;
      d.nodeName == "IMG" && (u = d.getBoundingClientRect()).right <= e.left && u.bottom > e.top && i++;
    }
    let c;
    Rn && i && r.nodeType == 1 && (c = r.childNodes[i - 1]).nodeType == 1 && c.contentEditable == "false" && c.getBoundingClientRect().top >= e.top && i--, r == n.dom && i == r.childNodes.length - 1 && r.lastChild.nodeType == 1 && e.top > r.lastChild.getBoundingClientRect().bottom ? l = n.state.doc.content.size : (i == 0 || r.nodeType != 1 || r.childNodes[i - 1].nodeName != "BR") && (l = hu(n, r, i, e));
  }
  l == null && (l = uu(n, o, e));
  let a = n.docView.nearestDesc(o, !0);
  return { pos: l, inside: a ? a.posAtStart - a.border : -1 };
}
function No(n) {
  return n.top < n.bottom || n.left < n.right;
}
function Je(n, e) {
  let t = n.getClientRects();
  if (t.length) {
    let r = t[e < 0 ? 0 : t.length - 1];
    if (No(r))
      return r;
  }
  return Array.prototype.find.call(t, No) || n.getBoundingClientRect();
}
const fu = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function _a(n, e, t) {
  let { node: r, offset: i, atom: s } = n.docView.domFromPos(e, t < 0 ? -1 : 1), o = Rn || Se;
  if (r.nodeType == 3)
    if (o && (fu.test(r.nodeValue) || (t < 0 ? !i : i == r.nodeValue.length))) {
      let a = Je(qe(r, i, i), t);
      if (Se && i && /\s/.test(r.nodeValue[i - 1]) && i < r.nodeValue.length) {
        let c = Je(qe(r, i - 1, i - 1), -1);
        if (c.top == a.top) {
          let d = Je(qe(r, i, i + 1), -1);
          if (d.top != a.top)
            return Qt(d, d.left < c.left);
        }
      }
      return a;
    } else {
      let a = i, c = i, d = t < 0 ? 1 : -1;
      return t < 0 && !i ? (c++, d = -1) : t >= 0 && i == r.nodeValue.length ? (a--, d = 1) : t < 0 ? a-- : c++, Qt(Je(qe(r, a, c), d), d < 0);
    }
  if (!n.state.doc.resolve(e - (s || 0)).parent.inlineContent) {
    if (s == null && i && (t < 0 || i == Ce(r))) {
      let a = r.childNodes[i - 1];
      if (a.nodeType == 1)
        return ki(a.getBoundingClientRect(), !1);
    }
    if (s == null && i < Ce(r)) {
      let a = r.childNodes[i];
      if (a.nodeType == 1)
        return ki(a.getBoundingClientRect(), !0);
    }
    return ki(r.getBoundingClientRect(), t >= 0);
  }
  if (s == null && i && (t < 0 || i == Ce(r))) {
    let a = r.childNodes[i - 1], c = a.nodeType == 3 ? qe(a, Ce(a) - (o ? 0 : 1)) : a.nodeType == 1 && (a.nodeName != "BR" || !a.nextSibling) ? a : null;
    if (c)
      return Qt(Je(c, 1), !1);
  }
  if (s == null && i < Ce(r)) {
    let a = r.childNodes[i];
    for (; a.pmViewDesc && a.pmViewDesc.ignoreForCoords; )
      a = a.nextSibling;
    let c = a ? a.nodeType == 3 ? qe(a, 0, o ? 0 : 1) : a.nodeType == 1 ? a : null : null;
    if (c)
      return Qt(Je(c, -1), !0);
  }
  return Qt(Je(r.nodeType == 3 ? qe(r) : r, -t), t >= 0);
}
function Qt(n, e) {
  if (n.width == 0)
    return n;
  let t = e ? n.left : n.right;
  return { top: n.top, bottom: n.bottom, left: t, right: t };
}
function ki(n, e) {
  if (n.height == 0)
    return n;
  let t = e ? n.top : n.bottom;
  return { top: t, bottom: t, left: n.left, right: n.right };
}
function Da(n, e, t) {
  let r = n.state, i = n.root.activeElement;
  r != e && n.updateState(e), i != n.dom && n.focus();
  try {
    return t();
  } finally {
    r != e && n.updateState(r), i != n.dom && i && i.focus();
  }
}
function mu(n, e, t) {
  let r = e.selection, i = t == "up" ? r.$from : r.$to;
  return Da(n, e, () => {
    let { node: s } = n.docView.domFromPos(i.pos, t == "up" ? -1 : 1);
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
    let o = _a(n, i.pos, 1);
    for (let l = s.firstChild; l; l = l.nextSibling) {
      let a;
      if (l.nodeType == 1)
        a = l.getClientRects();
      else if (l.nodeType == 3)
        a = qe(l, 0, l.nodeValue.length).getClientRects();
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
  let { $head: r } = e.selection;
  if (!r.parent.isTextblock)
    return !1;
  let i = r.parentOffset, s = !i, o = i == r.parent.content.size, l = n.domSelection();
  return l ? !gu.test(r.parent.textContent) || !l.modify ? t == "left" || t == "backward" ? s : o : Da(n, e, () => {
    let { focusNode: a, focusOffset: c, anchorNode: d, anchorOffset: u } = n.domSelectionRange(), h = l.caretBidiLevel;
    l.modify("move", t, "character");
    let p = r.depth ? n.docView.domAfterPos(r.before()) : n.dom, { focusNode: f, focusOffset: m } = n.domSelectionRange(), g = f && !p.contains(f.nodeType == 1 ? f : f.parentNode) || a == f && c == m;
    try {
      l.collapse(d, u), a && (a != d || c != u) && l.extend && l.extend(a, c);
    } catch {
    }
    return h != null && (l.caretBidiLevel = h), g;
  }) : r.pos == r.start() || r.pos == r.end();
}
let Oo = null, Lo = null, Ro = !1;
function yu(n, e, t) {
  return Oo == e && Lo == t ? Ro : (Oo = e, Lo = t, Ro = t == "up" || t == "down" ? mu(n, e, t) : bu(n, e, t));
}
const xe = 0, Io = 1, yt = 2, Re = 3;
class In {
  constructor(e, t, r, i) {
    this.parent = e, this.children = t, this.dom = r, this.contentDOM = i, this.dirty = xe, r.pmViewDesc = this;
  }
  // Used to check whether a given description corresponds to a
  // widget/mark/node.
  matchesWidget(e) {
    return !1;
  }
  matchesMark(e) {
    return !1;
  }
  matchesNode(e, t, r) {
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
    for (let t = 0, r = this.posAtStart; ; t++) {
      let i = this.children[t];
      if (i == e)
        return r;
      r += i.size;
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
  localPosFromDOM(e, t, r) {
    if (this.contentDOM && this.contentDOM.contains(e.nodeType == 1 ? e : e.parentNode))
      if (r < 0) {
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
    let i;
    if (e == this.dom && this.contentDOM)
      i = t > te(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      i = e.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (t == 0)
        for (let s = e; ; s = s.parentNode) {
          if (s == this.dom) {
            i = !1;
            break;
          }
          if (s.previousSibling)
            break;
        }
      if (i == null && t == e.childNodes.length)
        for (let s = e; ; s = s.parentNode) {
          if (s == this.dom) {
            i = !0;
            break;
          }
          if (s.nextSibling)
            break;
        }
    }
    return i ?? r > 0 ? this.posAtEnd : this.posAtStart;
  }
  nearestDesc(e, t = !1) {
    for (let r = !0, i = e; i; i = i.parentNode) {
      let s = this.getDesc(i), o;
      if (s && (!t || s.node))
        if (r && (o = s.nodeDOM) && !(o.nodeType == 1 ? o.contains(e.nodeType == 1 ? e : e.parentNode) : o == e))
          r = !1;
        else
          return s;
    }
  }
  getDesc(e) {
    let t = e.pmViewDesc;
    for (let r = t; r; r = r.parent)
      if (r == this)
        return t;
  }
  posFromDOM(e, t, r) {
    for (let i = e; i; i = i.parentNode) {
      let s = this.getDesc(i);
      if (s)
        return s.localPosFromDOM(e, t, r);
    }
    return -1;
  }
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  descAt(e) {
    for (let t = 0, r = 0; t < this.children.length; t++) {
      let i = this.children[t], s = r + i.size;
      if (r == e && s != r) {
        for (; !i.border && i.children.length; )
          for (let o = 0; o < i.children.length; o++) {
            let l = i.children[o];
            if (l.size) {
              i = l;
              break;
            }
          }
        return i;
      }
      if (e < s)
        return i.descAt(e - r - i.border);
      r = s;
    }
  }
  domFromPos(e, t) {
    if (!this.contentDOM)
      return { node: this.dom, offset: 0, atom: e + 1 };
    let r = 0, i = 0;
    for (let s = 0; r < this.children.length; r++) {
      let o = this.children[r], l = s + o.size;
      if (l > e || o instanceof Ba) {
        i = e - s;
        break;
      }
      s = l;
    }
    if (i)
      return this.children[r].domFromPos(i - this.children[r].border, t);
    for (let s; r && !(s = this.children[r - 1]).size && s instanceof Pa && s.side >= 0; r--)
      ;
    if (t <= 0) {
      let s, o = !0;
      for (; s = r ? this.children[r - 1] : null, !(!s || s.dom.parentNode == this.contentDOM); r--, o = !1)
        ;
      return s && t && o && !s.border && !s.domAtom ? s.domFromPos(s.size, t) : { node: this.contentDOM, offset: s ? te(s.dom) + 1 : 0 };
    } else {
      let s, o = !0;
      for (; s = r < this.children.length ? this.children[r] : null, !(!s || s.dom.parentNode == this.contentDOM); r++, o = !1)
        ;
      return s && o && !s.border && !s.domAtom ? s.domFromPos(0, t) : { node: this.contentDOM, offset: s ? te(s.dom) : this.contentDOM.childNodes.length };
    }
  }
  // Used to find a DOM range in a single parent for a given changed
  // range.
  parseRange(e, t, r = 0) {
    if (this.children.length == 0)
      return { node: this.contentDOM, from: e, to: t, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
    let i = -1, s = -1;
    for (let o = r, l = 0; ; l++) {
      let a = this.children[l], c = o + a.size;
      if (i == -1 && e <= c) {
        let d = o + a.border;
        if (e >= d && t <= c - a.border && a.node && a.contentDOM && this.contentDOM.contains(a.contentDOM))
          return a.parseRange(e, t, d);
        e = o;
        for (let u = l; u > 0; u--) {
          let h = this.children[u - 1];
          if (h.size && h.dom.parentNode == this.contentDOM && !h.emptyChildAt(1)) {
            i = te(h.dom) + 1;
            break;
          }
          e -= h.size;
        }
        i == -1 && (i = 0);
      }
      if (i > -1 && (c > t || l == this.children.length - 1)) {
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
    return { node: this.contentDOM, from: e, to: t, fromOffset: i, toOffset: s };
  }
  emptyChildAt(e) {
    if (this.border || !this.contentDOM || !this.children.length)
      return !1;
    let t = this.children[e < 0 ? 0 : this.children.length - 1];
    return t.size == 0 || t.emptyChildAt(e);
  }
  domAfterPos(e) {
    let { node: t, offset: r } = this.domFromPos(e, 0);
    if (t.nodeType != 1 || r == t.childNodes.length)
      throw new RangeError("No node after pos " + e);
    return t.childNodes[r];
  }
  // View descs are responsible for setting any selection that falls
  // entirely inside of them, so that custom implementations can do
  // custom things with the selection. Note that this falls apart when
  // a selection starts in such a node and ends in another, in which
  // case we just use whatever domFromPos produces as a best effort.
  setSelection(e, t, r, i = !1) {
    let s = Math.min(e, t), o = Math.max(e, t);
    for (let p = 0, f = 0; p < this.children.length; p++) {
      let m = this.children[p], g = f + m.size;
      if (s > f && o < g)
        return m.setSelection(e - f - m.border, t - f - m.border, r, i);
      f = g;
    }
    let l = this.domFromPos(e, e ? -1 : 1), a = t == e ? l : this.domFromPos(t, t ? -1 : 1), c = r.root.getSelection(), d = r.domSelectionRange(), u = !1;
    if ((Se || oe) && e == t) {
      let { node: p, offset: f } = l;
      if (p.nodeType == 3) {
        if (u = !!(f && p.nodeValue[f - 1] == `
`), u && f == p.nodeValue.length)
          for (let m = p, g; m; m = m.parentNode) {
            if (g = m.nextSibling) {
              g.nodeName == "BR" && (l = a = { node: g.parentNode, offset: te(g) + 1 });
              break;
            }
            let b = m.pmViewDesc;
            if (b && b.node && b.node.isBlock)
              break;
          }
      } else {
        let m = p.childNodes[f - 1];
        u = m && (m.nodeName == "BR" || m.contentEditable == "false");
      }
    }
    if (Se && d.focusNode && d.focusNode != a.node && d.focusNode.nodeType == 1) {
      let p = d.focusNode.childNodes[d.focusOffset];
      p && p.contentEditable == "false" && (i = !0);
    }
    if (!(i || u && oe) && Nt(l.node, l.offset, d.anchorNode, d.anchorOffset) && Nt(a.node, a.offset, d.focusNode, d.focusOffset))
      return;
    let h = !1;
    if ((c.extend || e == t) && !(u && Se)) {
      c.collapse(l.node, l.offset);
      try {
        e != t && c.extend(a.node, a.offset), h = !0;
      } catch {
      }
    }
    if (!h) {
      if (e > t) {
        let f = l;
        l = a, a = f;
      }
      let p = document.createRange();
      p.setEnd(a.node, a.offset), p.setStart(l.node, l.offset), c.removeAllRanges(), c.addRange(p);
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
    for (let r = 0, i = 0; i < this.children.length; i++) {
      let s = this.children[i], o = r + s.size;
      if (r == o ? e <= o && t >= r : e < o && t > r) {
        let l = r + s.border, a = o - s.border;
        if (e >= l && t <= a) {
          this.dirty = e == r || t == o ? yt : Io, e == l && t == a && (s.contentLost || s.dom.parentNode != this.contentDOM) ? s.dirty = Re : s.markDirty(e - l, t - l);
          return;
        } else
          s.dirty = s.dom == s.contentDOM && s.dom.parentNode == this.contentDOM && !s.children.length ? yt : Re;
      }
      r = o;
    }
    this.dirty = yt;
  }
  markParentsDirty() {
    let e = 1;
    for (let t = this.parent; t; t = t.parent, e++) {
      let r = e == 1 ? yt : Io;
      t.dirty < r && (t.dirty = r);
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
  constructor(e, t, r, i) {
    let s, o = t.type.toDOM;
    if (typeof o == "function" && (o = o(r, () => {
      if (!s)
        return i;
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
  constructor(e, t, r, i) {
    super(e, [], t, null), this.textDOM = r, this.text = i;
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
class Ot extends In {
  constructor(e, t, r, i, s) {
    super(e, [], r, i), this.mark = t, this.spec = s;
  }
  static create(e, t, r, i) {
    let s = i.nodeViews[t.type.name], o = s && s(t, i, r);
    return (!o || !o.dom) && (o = _t.renderSpec(document, t.type.spec.toDOM(t, r), null, t.attrs)), new Ot(e, t, o.dom, o.contentDOM || o.dom, o);
  }
  parseRule() {
    return this.dirty & Re || this.mark.type.spec.reparseInView ? null : { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
  }
  matchesMark(e) {
    return this.dirty != Re && this.mark.eq(e);
  }
  markDirty(e, t) {
    if (super.markDirty(e, t), this.dirty != xe) {
      let r = this.parent;
      for (; !r.node; )
        r = r.parent;
      r.dirty < this.dirty && (r.dirty = this.dirty), this.dirty = xe;
    }
  }
  slice(e, t, r) {
    let i = Ot.create(this.parent, this.mark, !0, r), s = this.children, o = this.size;
    t < o && (s = Qi(s, t, o, r)), e > 0 && (s = Qi(s, 0, e, r));
    for (let l = 0; l < s.length; l++)
      s[l].parent = i;
    return i.children = s, i;
  }
  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
}
class lt extends In {
  constructor(e, t, r, i, s, o, l, a, c) {
    super(e, [], s, o), this.node = t, this.outerDeco = r, this.innerDeco = i, this.nodeDOM = l;
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
  static create(e, t, r, i, s, o) {
    let l = s.nodeViews[t.type.name], a, c = l && l(t, s, () => {
      if (!a)
        return o;
      if (a.parent)
        return a.parent.posBeforeChild(a);
    }, r, i), d = c && c.dom, u = c && c.contentDOM;
    if (t.isText) {
      if (!d)
        d = document.createTextNode(t.text);
      else if (d.nodeType != 3)
        throw new RangeError("Text must be rendered as a DOM text node");
    } else d || ({ dom: d, contentDOM: u } = _t.renderSpec(document, t.type.spec.toDOM(t), null, t.attrs));
    !u && !t.isText && d.nodeName != "BR" && (d.hasAttribute("contenteditable") || (d.contentEditable = "false"), t.type.spec.draggable && (d.draggable = !0));
    let h = d;
    return d = $a(d, r, t), c ? a = new wu(e, t, r, i, d, u || null, h, c, s, o + 1) : t.isText ? new Qr(e, t, r, i, d, h, s) : new lt(e, t, r, i, d, u || null, h, s, o + 1);
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
        let r = this.children[t];
        if (this.dom.contains(r.dom.parentNode)) {
          e.contentElement = r.dom.parentNode;
          break;
        }
      }
      e.contentElement || (e.getContent = () => y.empty);
    }
    return e;
  }
  matchesNode(e, t, r) {
    return this.dirty == xe && e.eq(this.node) && ur(t, this.outerDeco) && r.eq(this.innerDeco);
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
    let r = this.node.inlineContent, i = t, s = e.composing ? this.localCompositionInfo(e, t) : null, o = s && s.pos > -1 ? s : null, l = s && s.pos < 0, a = new Su(this, o && o.node, e);
    Mu(this.node, this.innerDeco, (c, d, u) => {
      c.spec.marks ? a.syncToMarks(c.spec.marks, r, e, d) : c.type.side >= 0 && !u && a.syncToMarks(d == this.node.childCount ? P.none : this.node.child(d).marks, r, e, d), a.placeWidget(c, e, i);
    }, (c, d, u, h) => {
      a.syncToMarks(c.marks, r, e, h);
      let p;
      a.findNodeMatch(c, d, u, h) || l && e.state.selection.from > i && e.state.selection.to < i + c.nodeSize && (p = a.findIndexWithChild(s.node)) > -1 && a.updateNodeAt(c, d, u, p, e) || a.updateNextNode(c, d, u, e, h, i) || a.addNode(c, d, u, e, i), i += c.nodeSize;
    }), a.syncToMarks([], r, e, 0), this.node.isTextblock && a.addTextblockHacks(), a.destroyRest(), (a.changed || this.dirty == yt) && (o && this.protectLocalComposition(e, o), Ha(this.contentDOM, this.children, e), Kt && Eu(this.dom));
  }
  localCompositionInfo(e, t) {
    let { from: r, to: i } = e.state.selection;
    if (!(e.state.selection instanceof T) || r < t || i > t + this.node.content.size)
      return null;
    let s = e.input.compositionNode;
    if (!s || !this.dom.contains(s.parentNode))
      return null;
    if (this.node.inlineContent) {
      let o = s.nodeValue, l = Au(this.node.content, o, r - t, i - t);
      return l < 0 ? null : { node: s, pos: l, text: o };
    } else
      return { node: s, pos: -1, text: "" };
  }
  protectLocalComposition(e, { node: t, pos: r, text: i }) {
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
    let o = new ku(this, s, t, i);
    e.input.compositionNodes.push(o), this.children = Qi(this.children, r, r + i.length, e, o);
  }
  // If this desc must be updated to match the given node decoration,
  // do so and return true.
  update(e, t, r, i) {
    return this.dirty == Re || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, r, i), !0);
  }
  updateInner(e, t, r, i) {
    this.updateOuterDeco(t), this.node = e, this.innerDeco = r, this.contentDOM && this.updateChildren(i, this.posAtStart), this.dirty = xe;
  }
  updateOuterDeco(e) {
    if (ur(e, this.outerDeco))
      return;
    let t = this.nodeDOM.nodeType != 1, r = this.dom;
    this.dom = za(this.dom, this.nodeDOM, Xi(this.outerDeco, this.node, t), Xi(e, this.node, t)), this.dom != r && (r.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
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
function _o(n, e, t, r, i) {
  $a(r, e, n);
  let s = new lt(void 0, n, e, t, r, r, r, i, 0);
  return s.contentDOM && s.updateChildren(i, 0), s;
}
class Qr extends lt {
  constructor(e, t, r, i, s, o, l) {
    super(e, t, r, i, s, null, o, l, 0);
  }
  parseRule() {
    let e = this.nodeDOM.parentNode;
    for (; e && e != this.dom && !e.pmIsDeco; )
      e = e.parentNode;
    return { skip: e || !0 };
  }
  update(e, t, r, i) {
    return this.dirty == Re || this.dirty != xe && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(t), (this.dirty != xe || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, i.trackWrites == this.nodeDOM && (i.trackWrites = null)), this.node = e, this.dirty = xe, !0);
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
  localPosFromDOM(e, t, r) {
    return e == this.nodeDOM ? this.posAtStart + Math.min(t, this.node.text.length) : super.localPosFromDOM(e, t, r);
  }
  ignoreMutation(e) {
    return e.type != "characterData" && e.type != "selection";
  }
  slice(e, t, r) {
    let i = this.node.cut(e, t), s = document.createTextNode(i.text);
    return new Qr(this.parent, i, this.outerDeco, this.innerDeco, s, s, r);
  }
  markDirty(e, t) {
    super.markDirty(e, t), this.dom != this.nodeDOM && (e == 0 || t == this.nodeDOM.nodeValue.length) && (this.dirty = Re);
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
  constructor(e, t, r, i, s, o, l, a, c, d) {
    super(e, t, r, i, s, o, l, c, d), this.spec = a;
  }
  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  update(e, t, r, i) {
    if (this.dirty == Re)
      return !1;
    if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
      let s = this.spec.update(e, t, r);
      return s && this.updateInner(e, t, r, i), s;
    } else return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, r, i);
  }
  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }
  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }
  setSelection(e, t, r, i) {
    this.spec.setSelection ? this.spec.setSelection(e, t, r.root) : super.setSelection(e, t, r, i);
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
  let r = n.firstChild, i = !1;
  for (let s = 0; s < e.length; s++) {
    let o = e[s], l = o.dom;
    if (l.parentNode == n) {
      for (; l != r; )
        r = Do(r), i = !0;
      r = r.nextSibling;
    } else
      i = !0, n.insertBefore(l, r);
    if (o instanceof Ot) {
      let a = r ? r.previousSibling : n.lastChild;
      Ha(o.contentDOM, o.children, t), r = a ? a.nextSibling : n.firstChild;
    }
  }
  for (; r; )
    r = Do(r), i = !0;
  i && t.trackWrites == n && (t.trackWrites = null);
}
const cn = function(n) {
  n && (this.nodeName = n);
};
cn.prototype = /* @__PURE__ */ Object.create(null);
const kt = [new cn()];
function Xi(n, e, t) {
  if (n.length == 0)
    return kt;
  let r = t ? kt[0] : new cn(), i = [r];
  for (let s = 0; s < n.length; s++) {
    let o = n[s].type.attrs;
    if (o) {
      o.nodeName && i.push(r = new cn(o.nodeName));
      for (let l in o) {
        let a = o[l];
        a != null && (t && i.length == 1 && i.push(r = new cn(e.isInline ? "span" : "div")), l == "class" ? r.class = (r.class ? r.class + " " : "") + a : l == "style" ? r.style = (r.style ? r.style + ";" : "") + a : l != "nodeName" && (r[l] = a));
      }
    }
  }
  return i;
}
function za(n, e, t, r) {
  if (t == kt && r == kt)
    return e;
  let i = e;
  for (let s = 0; s < r.length; s++) {
    let o = r[s], l = t[s];
    if (s) {
      let a;
      l && l.nodeName == o.nodeName && i != n && (a = i.parentNode) && a.nodeName.toLowerCase() == o.nodeName || (a = document.createElement(o.nodeName), a.pmIsDeco = !0, a.appendChild(i), l = kt[0]), i = a;
    }
    Cu(i, l || kt[0], o);
  }
  return i;
}
function Cu(n, e, t) {
  for (let r in e)
    r != "class" && r != "style" && r != "nodeName" && !(r in t) && n.removeAttribute(r);
  for (let r in t)
    r != "class" && r != "style" && r != "nodeName" && t[r] != e[r] && n.setAttribute(r, t[r]);
  if (e.class != t.class) {
    let r = e.class ? e.class.split(" ").filter(Boolean) : [], i = t.class ? t.class.split(" ").filter(Boolean) : [];
    for (let s = 0; s < r.length; s++)
      i.indexOf(r[s]) == -1 && n.classList.remove(r[s]);
    for (let s = 0; s < i.length; s++)
      r.indexOf(i[s]) == -1 && n.classList.add(i[s]);
    n.classList.length == 0 && n.removeAttribute("class");
  }
  if (e.style != t.style) {
    if (e.style) {
      let r = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, i;
      for (; i = r.exec(e.style); )
        n.style.removeProperty(i[1]);
    }
    t.style && (n.style.cssText += t.style);
  }
}
function $a(n, e, t) {
  return za(n, n, kt, Xi(e, t, n.nodeType != 1));
}
function ur(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].type.eq(e[t].type))
      return !1;
  return !0;
}
function Do(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class Su {
  constructor(e, t, r) {
    this.lock = t, this.view = r, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = xu(e.node.content, e);
  }
  // Destroy and remove the children between the given indices in
  // `this.top`.
  destroyBetween(e, t) {
    if (e != t) {
      for (let r = e; r < t; r++)
        this.top.children[r].destroy();
      this.top.children.splice(e, t - e), this.changed = !0;
    }
  }
  // Destroy all remaining children in `this.top`.
  destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  }
  // Sync the current stack of mark descs with the given array of
  // marks, reusing existing mark descs when possible.
  syncToMarks(e, t, r, i) {
    let s = 0, o = this.stack.length >> 1, l = Math.min(o, e.length);
    for (; s < l && (s == o - 1 ? this.top : this.stack[s + 1 << 1]).matchesMark(e[s]) && e[s].type.spec.spanning !== !1; )
      s++;
    for (; s < o; )
      this.destroyRest(), this.top.dirty = xe, this.index = this.stack.pop(), this.top = this.stack.pop(), o--;
    for (; o < e.length; ) {
      this.stack.push(this.top, this.index + 1);
      let a = -1, c = this.top.children.length;
      i < this.preMatch.index && (c = Math.min(this.index + 3, c));
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
        let d = Ot.create(this.top, e[o], t, r);
        this.top.children.splice(this.index, 0, d), this.top = d, this.changed = !0;
      }
      this.index = 0, o++;
    }
  }
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  findNodeMatch(e, t, r, i) {
    let s = -1, o;
    if (i >= this.preMatch.index && (o = this.preMatch.matches[i - this.preMatch.index]).parent == this.top && o.matchesNode(e, t, r))
      s = this.top.children.indexOf(o, this.index);
    else
      for (let l = this.index, a = Math.min(this.top.children.length, l + 5); l < a; l++) {
        let c = this.top.children[l];
        if (c.matchesNode(e, t, r) && !this.preMatch.matched.has(c)) {
          s = l;
          break;
        }
      }
    return s < 0 ? !1 : (this.destroyBetween(this.index, s), this.index++, !0);
  }
  updateNodeAt(e, t, r, i, s) {
    let o = this.top.children[i];
    return o.dirty == Re && o.dom == o.contentDOM && (o.dirty = yt), o.update(e, t, r, s) ? (this.destroyBetween(this.index, i), this.index++, !0) : !1;
  }
  findIndexWithChild(e) {
    for (; ; ) {
      let t = e.parentNode;
      if (!t)
        return -1;
      if (t == this.top.contentDOM) {
        let r = e.pmViewDesc;
        if (r) {
          for (let i = this.index; i < this.top.children.length; i++)
            if (this.top.children[i] == r)
              return i;
        }
        return -1;
      }
      e = t;
    }
  }
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  updateNextNode(e, t, r, i, s, o) {
    for (let l = this.index; l < this.top.children.length; l++) {
      let a = this.top.children[l];
      if (a instanceof lt) {
        let c = this.preMatch.matched.get(a);
        if (c != null && c != s)
          return !1;
        let d = a.dom, u, h = this.isLocked(d) && !(e.isText && a.node && a.node.isText && a.nodeDOM.nodeValue == e.text && a.dirty != Re && ur(t, a.outerDeco));
        if (!h && a.update(e, t, r, i))
          return this.destroyBetween(this.index, l), a.dom != d && (this.changed = !0), this.index++, !0;
        if (!h && (u = this.recreateWrapper(a, e, t, r, i, o)))
          return this.destroyBetween(this.index, l), this.top.children[this.index] = u, u.contentDOM && (u.dirty = yt, u.updateChildren(i, o + 1), u.dirty = xe), this.changed = !0, this.index++, !0;
        break;
      }
    }
    return !1;
  }
  // When a node with content is replaced by a different node with
  // identical content, move over its children.
  recreateWrapper(e, t, r, i, s, o) {
    if (e.dirty || t.isAtom || !e.children.length || !e.node.content.eq(t.content) || !ur(r, e.outerDeco) || !i.eq(e.innerDeco))
      return null;
    let l = lt.create(this.top, t, r, i, s, o);
    if (l.contentDOM) {
      l.children = e.children, e.children = [];
      for (let a of l.children)
        a.parent = l;
    }
    return e.destroy(), l;
  }
  // Insert the node as a newly created node desc.
  addNode(e, t, r, i, s) {
    let o = lt.create(this.top, e, t, r, i, s);
    o.contentDOM && o.updateChildren(i, s + 1), this.top.children.splice(this.index++, 0, o), this.changed = !0;
  }
  placeWidget(e, t, r) {
    let i = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (i && i.matchesWidget(e) && (e == i.widget || !i.widget.type.toDOM.parentNode))
      this.index++;
    else {
      let s = new Pa(this.top, e, t, r);
      this.top.children.splice(this.index++, 0, s), this.changed = !0;
    }
  }
  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  addTextblockHacks() {
    let e = this.top.children[this.index - 1], t = this.top;
    for (; e instanceof Ot; )
      t = e, e = t.children[t.children.length - 1];
    (!e || // Empty textblock
    !(e instanceof Qr) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((oe || re) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", t), this.addHackNode("BR", this.top));
  }
  addHackNode(e, t) {
    if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e))
      this.index++;
    else {
      let r = document.createElement(e);
      e == "IMG" && (r.className = "ProseMirror-separator", r.alt = ""), e == "BR" && (r.className = "ProseMirror-trailingBreak");
      let i = new Ba(this.top, [], r, null);
      t != this.top ? t.children.push(i) : t.children.splice(this.index++, 0, i), this.changed = !0;
    }
  }
  isLocked(e) {
    return this.lock && (e == this.lock || e.nodeType == 1 && e.contains(this.lock.parentNode));
  }
}
function xu(n, e) {
  let t = e, r = t.children.length, i = n.childCount, s = /* @__PURE__ */ new Map(), o = [];
  e: for (; i > 0; ) {
    let l;
    for (; ; )
      if (r) {
        let c = t.children[r - 1];
        if (c instanceof Ot)
          t = c, r = c.children.length;
        else {
          l = c, r--;
          break;
        }
      } else {
        if (t == e)
          break e;
        r = t.parent.children.indexOf(t), t = t.parent;
      }
    let a = l.node;
    if (a) {
      if (a != n.child(i - 1))
        break;
      --i, s.set(l, i), o.push(l);
    }
  }
  return { index: i, matched: s, matches: o.reverse() };
}
function vu(n, e) {
  return n.type.side - e.type.side;
}
function Mu(n, e, t, r) {
  let i = e.locals(n), s = 0;
  if (i.length == 0) {
    for (let c = 0; c < n.childCount; c++) {
      let d = n.child(c);
      r(d, i, e.forChild(s, d), c), s += d.nodeSize;
    }
    return;
  }
  let o = 0, l = [], a = null;
  for (let c = 0; ; ) {
    let d, u;
    for (; o < i.length && i[o].to == s; ) {
      let g = i[o++];
      g.widget && (d ? (u || (u = [d])).push(g) : d = g);
    }
    if (d)
      if (u) {
        u.sort(vu);
        for (let g = 0; g < u.length; g++)
          t(u[g], c, !!a);
      } else
        t(d, c, !!a);
    let h, p;
    if (a)
      p = -1, h = a, a = null;
    else if (c < n.childCount)
      p = c, h = n.child(c++);
    else
      break;
    for (let g = 0; g < l.length; g++)
      l[g].to <= s && l.splice(g--, 1);
    for (; o < i.length && i[o].from <= s && i[o].to > s; )
      l.push(i[o++]);
    let f = s + h.nodeSize;
    if (h.isText) {
      let g = f;
      o < i.length && i[o].from < g && (g = i[o].from);
      for (let b = 0; b < l.length; b++)
        l[b].to < g && (g = l[b].to);
      g < f && (a = h.cut(g - s), h = h.cut(0, g - s), f = g, p = -1);
    } else
      for (; o < i.length && i[o].to < f; )
        o++;
    let m = h.isInline && !h.isLeaf ? l.filter((g) => !g.inline) : l.slice();
    r(h, m, e.forChild(s, h), p), s = f;
  }
}
function Eu(n) {
  if (n.nodeName == "UL" || n.nodeName == "OL") {
    let e = n.style.cssText;
    n.style.cssText = e + "; list-style: square !important", window.getComputedStyle(n).listStyle, n.style.cssText = e;
  }
}
function Au(n, e, t, r) {
  for (let i = 0, s = 0; i < n.childCount && s <= r; ) {
    let o = n.child(i++), l = s;
    if (s += o.nodeSize, !o.isText)
      continue;
    let a = o.text;
    for (; i < n.childCount; ) {
      let c = n.child(i++);
      if (s += c.nodeSize, !c.isText)
        break;
      a += c.text;
    }
    if (s >= t) {
      if (s >= r && a.slice(r - e.length - l, r - l) == e)
        return r - e.length;
      let c = l < r ? a.lastIndexOf(e, r - l - 1) : -1;
      if (c >= 0 && c + e.length + l >= t)
        return l + c;
      if (t == r && a.length >= r + e.length - l && a.slice(r - l, r - l + e.length) == e)
        return r;
    }
  }
  return -1;
}
function Qi(n, e, t, r, i) {
  let s = [];
  for (let o = 0, l = 0; o < n.length; o++) {
    let a = n[o], c = l, d = l += a.size;
    c >= t || d <= e ? s.push(a) : (c < e && s.push(a.slice(0, e - c, r)), i && (s.push(i), i = void 0), d > t && s.push(a.slice(t - c, a.size, r)));
  }
  return s;
}
function Ns(n, e = null) {
  let t = n.domSelectionRange(), r = n.state.doc;
  if (!t.focusNode)
    return null;
  let i = n.docView.nearestDesc(t.focusNode), s = i && i.size == 0, o = n.docView.posFromDOM(t.focusNode, t.focusOffset, 1);
  if (o < 0)
    return null;
  let l = r.resolve(o), a, c;
  if (Xr(t)) {
    for (a = o; i && !i.node; )
      i = i.parent;
    let u = i.node;
    if (i && u.isAtom && A.isSelectable(u) && i.parent && !(u.isInline && eu(t.focusNode, t.focusOffset, i.dom))) {
      let h = i.posBefore;
      c = new A(o == h ? l : r.resolve(h));
    }
  } else {
    if (t instanceof n.dom.ownerDocument.defaultView.Selection && t.rangeCount > 1) {
      let u = o, h = o;
      for (let p = 0; p < t.rangeCount; p++) {
        let f = t.getRangeAt(p);
        u = Math.min(u, n.docView.posFromDOM(f.startContainer, f.startOffset, 1)), h = Math.max(h, n.docView.posFromDOM(f.endContainer, f.endOffset, -1));
      }
      if (u < 0)
        return null;
      [a, o] = h == n.state.selection.anchor ? [h, u] : [u, h], l = r.resolve(o);
    } else
      a = n.docView.posFromDOM(t.anchorNode, t.anchorOffset, 1);
    if (a < 0)
      return null;
  }
  let d = r.resolve(a);
  if (!c) {
    let u = e == "pointer" || n.state.selection.head < l.pos && !s ? 1 : -1;
    c = Os(n, d, l, u);
  }
  return c;
}
function Fa(n) {
  return n.editable ? n.hasFocus() : qa(n) && document.activeElement && document.activeElement.contains(n.dom);
}
function Ue(n, e = !1) {
  let t = n.state.selection;
  if (Va(n, t), !!Fa(n)) {
    if (!e && n.input.mouseDown && n.input.mouseDown.allowDefault && re) {
      let r = n.domSelectionRange(), i = n.domObserver.currentSelection;
      if (r.anchorNode && i.anchorNode && Nt(r.anchorNode, r.anchorOffset, i.anchorNode, i.anchorOffset)) {
        n.input.mouseDown.delayedSelectionSync = !0, n.domObserver.setCurSelection();
        return;
      }
    }
    if (n.domObserver.disconnectSelection(), n.cursorWrapper)
      Nu(n);
    else {
      let { anchor: r, head: i } = t, s, o;
      Po && !(t instanceof T) && (t.$from.parent.inlineContent || (s = Bo(n, t.from)), !t.empty && !t.$from.parent.inlineContent && (o = Bo(n, t.to))), n.docView.setSelection(r, i, n, e), Po && (s && Ho(s), o && Ho(o)), t.visible ? n.dom.classList.remove("ProseMirror-hideselection") : (n.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && Tu(n));
    }
    n.domObserver.setCurSelection(), n.domObserver.connectSelection();
  }
}
const Po = oe || re && Ta < 63;
function Bo(n, e) {
  let { node: t, offset: r } = n.docView.domFromPos(e, 0), i = r < t.childNodes.length ? t.childNodes[r] : null, s = r ? t.childNodes[r - 1] : null;
  if (oe && i && i.contentEditable == "false")
    return wi(i);
  if ((!i || i.contentEditable == "false") && (!s || s.contentEditable == "false")) {
    if (i)
      return wi(i);
    if (s)
      return wi(s);
  }
}
function wi(n) {
  return n.contentEditable = "true", oe && n.draggable && (n.draggable = !1, n.wasDraggable = !0), n;
}
function Ho(n) {
  n.contentEditable = "false", n.wasDraggable && (n.draggable = !0, n.wasDraggable = null);
}
function Tu(n) {
  let e = n.dom.ownerDocument;
  e.removeEventListener("selectionchange", n.input.hideSelectionGuard);
  let t = n.domSelectionRange(), r = t.anchorNode, i = t.anchorOffset;
  e.addEventListener("selectionchange", n.input.hideSelectionGuard = () => {
    (t.anchorNode != r || t.anchorOffset != i) && (e.removeEventListener("selectionchange", n.input.hideSelectionGuard), setTimeout(() => {
      (!Fa(n) || n.state.selection.visible) && n.dom.classList.remove("ProseMirror-hideselection");
    }, 20));
  });
}
function Nu(n) {
  let e = n.domSelection();
  if (!e)
    return;
  let t = n.cursorWrapper.dom, r = t.nodeName == "IMG";
  r ? e.collapse(t.parentNode, te(t) + 1) : e.collapse(t, 0), !r && !n.state.selection.visible && pe && ot <= 11 && (t.disabled = !0, t.disabled = !1);
}
function Va(n, e) {
  if (e instanceof A) {
    let t = n.docView.descAt(e.from);
    t != n.lastSelectedViewDesc && (zo(n), t && t.selectNode(), n.lastSelectedViewDesc = t);
  } else
    zo(n);
}
function zo(n) {
  n.lastSelectedViewDesc && (n.lastSelectedViewDesc.parent && n.lastSelectedViewDesc.deselectNode(), n.lastSelectedViewDesc = void 0);
}
function Os(n, e, t, r) {
  return n.someProp("createSelectionBetween", (i) => i(n, e, t)) || T.between(e, t, r);
}
function $o(n) {
  return n.editable && !n.hasFocus() ? !1 : qa(n);
}
function qa(n) {
  let e = n.domSelectionRange();
  if (!e.anchorNode)
    return !1;
  try {
    return n.dom.contains(e.anchorNode.nodeType == 3 ? e.anchorNode.parentNode : e.anchorNode) && (n.editable || n.dom.contains(e.focusNode.nodeType == 3 ? e.focusNode.parentNode : e.focusNode));
  } catch {
    return !1;
  }
}
function Ou(n) {
  let e = n.docView.domFromPos(n.state.selection.anchor, 0), t = n.domSelectionRange();
  return Nt(e.node, e.offset, t.anchorNode, t.anchorOffset);
}
function Zi(n, e) {
  let { $anchor: t, $head: r } = n.selection, i = e > 0 ? t.max(r) : t.min(r), s = i.parent.inlineContent ? i.depth ? n.doc.resolve(e > 0 ? i.after() : i.before()) : null : i;
  return s && N.findFrom(s, e);
}
function Ge(n, e) {
  return n.dispatch(n.state.tr.setSelection(e).scrollIntoView()), !0;
}
function Fo(n, e, t) {
  let r = n.state.selection;
  if (r instanceof T)
    if (t.indexOf("s") > -1) {
      let { $head: i } = r, s = i.textOffset ? null : e < 0 ? i.nodeBefore : i.nodeAfter;
      if (!s || s.isText || !s.isLeaf)
        return !1;
      let o = n.state.doc.resolve(i.pos + s.nodeSize * (e < 0 ? -1 : 1));
      return Ge(n, new T(r.$anchor, o));
    } else if (r.empty) {
      if (n.endOfTextblock(e > 0 ? "forward" : "backward")) {
        let i = Zi(n.state, e);
        return i && i instanceof A ? Ge(n, i) : !1;
      } else if (!(we && t.indexOf("m") > -1)) {
        let i = r.$head, s = i.textOffset ? null : e < 0 ? i.nodeBefore : i.nodeAfter, o;
        if (!s || s.isText)
          return !1;
        let l = e < 0 ? i.pos - s.nodeSize : i.pos;
        return s.isAtom || (o = n.docView.descAt(l)) && !o.contentDOM ? A.isSelectable(s) ? Ge(n, new A(e < 0 ? n.state.doc.resolve(i.pos - s.nodeSize) : i)) : Rn ? Ge(n, new T(n.state.doc.resolve(e < 0 ? l : l + s.nodeSize))) : !1 : !1;
      }
    } else return !1;
  else {
    if (r instanceof A && r.node.isInline)
      return Ge(n, new T(e > 0 ? r.$to : r.$from));
    {
      let i = Zi(n.state, e);
      return i ? Ge(n, i) : !1;
    }
  }
}
function hr(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function dn(n, e) {
  let t = n.pmViewDesc;
  return t && t.size == 0 && (e < 0 || n.nextSibling || n.nodeName != "BR");
}
function Bt(n, e) {
  return e < 0 ? Lu(n) : Ru(n);
}
function Lu(n) {
  let e = n.domSelectionRange(), t = e.focusNode, r = e.focusOffset;
  if (!t)
    return;
  let i, s, o = !1;
  for (Se && t.nodeType == 1 && r < hr(t) && dn(t.childNodes[r], -1) && (o = !0); ; )
    if (r > 0) {
      if (t.nodeType != 1)
        break;
      {
        let l = t.childNodes[r - 1];
        if (dn(l, -1))
          i = t, s = --r;
        else if (l.nodeType == 3)
          t = l, r = t.nodeValue.length;
        else
          break;
      }
    } else {
      if (Wa(t))
        break;
      {
        let l = t.previousSibling;
        for (; l && dn(l, -1); )
          i = t.parentNode, s = te(l), l = l.previousSibling;
        if (l)
          t = l, r = hr(t);
        else {
          if (t = t.parentNode, t == n.dom)
            break;
          r = 0;
        }
      }
    }
  o ? es(n, t, r) : i && es(n, i, s);
}
function Ru(n) {
  let e = n.domSelectionRange(), t = e.focusNode, r = e.focusOffset;
  if (!t)
    return;
  let i = hr(t), s, o;
  for (; ; )
    if (r < i) {
      if (t.nodeType != 1)
        break;
      let l = t.childNodes[r];
      if (dn(l, 1))
        s = t, o = ++r;
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
          t = l, r = 0, i = hr(t);
        else {
          if (t = t.parentNode, t == n.dom)
            break;
          r = i = 0;
        }
      }
    }
  s && es(n, s, o);
}
function Wa(n) {
  let e = n.pmViewDesc;
  return e && e.node && e.node.isBlock;
}
function Iu(n, e) {
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
function _u(n, e) {
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
    (o = Iu(e, t)) ? (e = o, t = 0) : (s = _u(e, t)) && (e = s, t = s.nodeValue.length);
  }
  let r = n.domSelection();
  if (!r)
    return;
  if (Xr(r)) {
    let s = document.createRange();
    s.setEnd(e, t), s.setStart(e, t), r.removeAllRanges(), r.addRange(s);
  } else r.extend && r.extend(e, t);
  n.domObserver.setCurSelection();
  let { state: i } = n;
  setTimeout(() => {
    n.state == i && Ue(n);
  }, 50);
}
function Vo(n, e) {
  let t = n.state.doc.resolve(e);
  if (!(re || Na) && t.parent.inlineContent) {
    let i = n.coordsAtPos(e);
    if (e > t.start()) {
      let s = n.coordsAtPos(e - 1), o = (s.top + s.bottom) / 2;
      if (o > i.top && o < i.bottom && Math.abs(s.left - i.left) > 1)
        return s.left < i.left ? "ltr" : "rtl";
    }
    if (e < t.end()) {
      let s = n.coordsAtPos(e + 1), o = (s.top + s.bottom) / 2;
      if (o > i.top && o < i.bottom && Math.abs(s.left - i.left) > 1)
        return s.left > i.left ? "ltr" : "rtl";
    }
  }
  return getComputedStyle(n.dom).direction == "rtl" ? "rtl" : "ltr";
}
function qo(n, e, t) {
  let r = n.state.selection;
  if (r instanceof T && !r.empty || t.indexOf("s") > -1 || we && t.indexOf("m") > -1)
    return !1;
  let { $from: i, $to: s } = r;
  if (!i.parent.inlineContent || n.endOfTextblock(e < 0 ? "up" : "down")) {
    let o = Zi(n.state, e);
    if (o && o instanceof A)
      return Ge(n, o);
  }
  if (!i.parent.inlineContent) {
    let o = e < 0 ? i : s, l = r instanceof be ? N.near(o, e) : N.findFrom(o, e);
    return l ? Ge(n, l) : !1;
  }
  return !1;
}
function Wo(n, e) {
  if (!(n.state.selection instanceof T))
    return !0;
  let { $head: t, $anchor: r, empty: i } = n.state.selection;
  if (!t.sameParent(r))
    return !0;
  if (!i)
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
    let r = e.firstChild;
    jo(n, r, "true"), setTimeout(() => jo(n, r, "false"), 20);
  }
  return !1;
}
function Pu(n) {
  let e = "";
  return n.ctrlKey && (e += "c"), n.metaKey && (e += "m"), n.altKey && (e += "a"), n.shiftKey && (e += "s"), e;
}
function Bu(n, e) {
  let t = e.keyCode, r = Pu(e);
  if (t == 8 || we && t == 72 && r == "c")
    return Wo(n, -1) || Bt(n, -1);
  if (t == 46 && !e.shiftKey || we && t == 68 && r == "c")
    return Wo(n, 1) || Bt(n, 1);
  if (t == 13 || t == 27)
    return !0;
  if (t == 37 || we && t == 66 && r == "c") {
    let i = t == 37 ? Vo(n, n.state.selection.from) == "ltr" ? -1 : 1 : -1;
    return Fo(n, i, r) || Bt(n, i);
  } else if (t == 39 || we && t == 70 && r == "c") {
    let i = t == 39 ? Vo(n, n.state.selection.from) == "ltr" ? 1 : -1 : 1;
    return Fo(n, i, r) || Bt(n, i);
  } else {
    if (t == 38 || we && t == 80 && r == "c")
      return qo(n, -1, r) || Bt(n, -1);
    if (t == 40 || we && t == 78 && r == "c")
      return Du(n) || qo(n, 1, r) || Bt(n, 1);
    if (r == (we ? "m" : "c") && (t == 66 || t == 73 || t == 89 || t == 90))
      return !0;
  }
  return !1;
}
function Ls(n, e) {
  n.someProp("transformCopied", (p) => {
    e = p(e, n);
  });
  let t = [], { content: r, openStart: i, openEnd: s } = e;
  for (; i > 1 && s > 1 && r.childCount == 1 && r.firstChild.childCount == 1; ) {
    i--, s--;
    let p = r.firstChild;
    t.push(p.type.name, p.attrs != p.type.defaultAttrs ? p.attrs : null), r = p.content;
  }
  let o = n.someProp("clipboardSerializer") || _t.fromSchema(n.state.schema), l = Ya(), a = l.createElement("div");
  a.appendChild(o.serializeFragment(r, { document: l }));
  let c = a.firstChild, d, u = 0;
  for (; c && c.nodeType == 1 && (d = Ga[c.nodeName.toLowerCase()]); ) {
    for (let p = d.length - 1; p >= 0; p--) {
      let f = l.createElement(d[p]);
      for (; a.firstChild; )
        f.appendChild(a.firstChild);
      a.appendChild(f), u++;
    }
    c = a.firstChild;
  }
  c && c.nodeType == 1 && c.setAttribute("data-pm-slice", `${i} ${s}${u ? ` -${u}` : ""} ${JSON.stringify(t)}`);
  let h = n.someProp("clipboardTextSerializer", (p) => p(e, n)) || e.content.textBetween(0, e.content.size, `

`);
  return { dom: a, text: h, slice: e };
}
function ja(n, e, t, r, i) {
  let s = i.parent.type.spec.code, o, l;
  if (!t && !e)
    return null;
  let a = !!e && (r || s || !t);
  if (a) {
    if (n.someProp("transformPastedText", (h) => {
      e = h(e, s || r, n);
    }), s)
      return l = new x(y.from(n.state.schema.text(e.replace(/\r\n?/g, `
`))), 0, 0), n.someProp("transformPasted", (h) => {
        l = h(l, n, !0);
      }), l;
    let u = n.someProp("clipboardTextParser", (h) => h(e, i, r, n));
    if (u)
      l = u;
    else {
      let h = i.marks(), { schema: p } = n.state, f = _t.fromSchema(p);
      o = document.createElement("div"), e.split(/(?:\r\n?|\n)+/).forEach((m) => {
        let g = o.appendChild(document.createElement("p"));
        m && g.appendChild(f.serializeNode(p.text(m, h)));
      });
    }
  } else
    n.someProp("transformPastedHTML", (u) => {
      t = u(t, n);
    }), o = Fu(t), Rn && Vu(o);
  let c = o && o.querySelector("[data-pm-slice]"), d = c && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(c.getAttribute("data-pm-slice") || "");
  if (d && d[3])
    for (let u = +d[3]; u > 0; u--) {
      let h = o.firstChild;
      for (; h && h.nodeType != 1; )
        h = h.nextSibling;
      if (!h)
        break;
      o = h;
    }
  if (l || (l = (n.someProp("clipboardParser") || n.someProp("domParser") || st.fromSchema(n.state.schema)).parseSlice(o, {
    preserveWhitespace: !!(a || d),
    context: i,
    ruleFromNode(h) {
      return h.nodeName == "BR" && !h.nextSibling && h.parentNode && !Hu.test(h.parentNode.nodeName) ? { ignore: !0 } : null;
    }
  })), d)
    l = qu(Uo(l, +d[1], +d[2]), d[4]);
  else if (l = x.maxOpen(zu(l.content, i), !0), l.openStart || l.openEnd) {
    let u = 0, h = 0;
    for (let p = l.content.firstChild; u < l.openStart && !p.type.spec.isolating; u++, p = p.firstChild)
      ;
    for (let p = l.content.lastChild; h < l.openEnd && !p.type.spec.isolating; h++, p = p.lastChild)
      ;
    l = Uo(l, u, h);
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
    let i = e.node(t).contentMatchAt(e.index(t)), s, o = [];
    if (n.forEach((l) => {
      if (!o)
        return;
      let a = i.findWrapping(l.type), c;
      if (!a)
        return o = null;
      if (c = o.length && s.length && Ka(a, s, l, o[o.length - 1], 0))
        o[o.length - 1] = c;
      else {
        o.length && (o[o.length - 1] = Ja(o[o.length - 1], s.length));
        let d = Ua(l, a);
        o.push(d), i = i.matchType(d.type), s = a;
      }
    }), o)
      return y.from(o);
  }
  return n;
}
function Ua(n, e, t = 0) {
  for (let r = e.length - 1; r >= t; r--)
    n = e[r].create(null, y.from(n));
  return n;
}
function Ka(n, e, t, r, i) {
  if (i < n.length && i < e.length && n[i] == e[i]) {
    let s = Ka(n, e, t, r.lastChild, i + 1);
    if (s)
      return r.copy(r.content.replaceChild(r.childCount - 1, s));
    if (r.contentMatchAt(r.childCount).matchType(i == n.length - 1 ? t.type : n[i + 1]))
      return r.copy(r.content.append(y.from(Ua(t, n, i + 1))));
  }
}
function Ja(n, e) {
  if (e == 0)
    return n;
  let t = n.content.replaceChild(n.childCount - 1, Ja(n.lastChild, e - 1)), r = n.contentMatchAt(n.childCount).fillBefore(y.empty, !0);
  return n.copy(t.append(r));
}
function ts(n, e, t, r, i, s) {
  let o = e < 0 ? n.firstChild : n.lastChild, l = o.content;
  return n.childCount > 1 && (s = 0), i < r - 1 && (l = ts(l, e, t, r, i + 1, s)), i >= t && (l = e < 0 ? o.contentMatchAt(0).fillBefore(l, s <= i).append(l) : l.append(o.contentMatchAt(o.childCount).fillBefore(y.empty, !0))), n.replaceChild(e < 0 ? 0 : n.childCount - 1, o.copy(l));
}
function Uo(n, e, t) {
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
let Ko = null;
function Ya() {
  return Ko || (Ko = document.implementation.createHTMLDocument("title"));
}
let Ci = null;
function $u(n) {
  let e = window.trustedTypes;
  return e ? (Ci || (Ci = e.defaultPolicy || e.createPolicy("ProseMirrorClipboard", { createHTML: (t) => t })), Ci.createHTML(n)) : n;
}
function Fu(n) {
  let e = /^(\s*<meta [^>]*>)*/.exec(n);
  e && (n = n.slice(e[0].length));
  let t = Ya().createElement("div"), r = /<([a-z][^>\s]+)/i.exec(n), i;
  if ((i = r && Ga[r[1].toLowerCase()]) && (n = i.map((s) => "<" + s + ">").join("") + n + i.map((s) => "</" + s + ">").reverse().join("")), t.innerHTML = $u(n), i)
    for (let s = 0; s < i.length; s++)
      t = t.querySelector(i[s]) || t;
  return t;
}
function Vu(n) {
  let e = n.querySelectorAll(re ? "span:not([class]):not([style])" : "span.Apple-converted-space");
  for (let t = 0; t < e.length; t++) {
    let r = e[t];
    r.childNodes.length == 1 && r.textContent == " " && r.parentNode && r.parentNode.replaceChild(n.ownerDocument.createTextNode(" "), r);
  }
}
function qu(n, e) {
  if (!n.size)
    return n;
  let t = n.content.firstChild.type.schema, r;
  try {
    r = JSON.parse(e);
  } catch {
    return n;
  }
  let { content: i, openStart: s, openEnd: o } = n;
  for (let l = r.length - 2; l >= 0; l -= 2) {
    let a = t.nodes[r[l]];
    if (!a || a.hasRequiredAttrs())
      break;
    i = y.from(a.create(r[l + 1], i)), s++, o++;
  }
  return new x(i, s, o);
}
const de = {}, ue = {}, Wu = { touchstart: !0, touchmove: !0 };
class ju {
  constructor() {
    this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = { time: 0, x: 0, y: 0, type: "", button: 0 }, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = /* @__PURE__ */ Object.create(null), this.hideSelectionGuard = null;
  }
}
function Uu(n) {
  for (let e in de) {
    let t = de[e];
    n.dom.addEventListener(e, n.input.eventHandlers[e] = (r) => {
      Ju(n, r) && !Rs(n, r) && (n.editable || !(r.type in ue)) && t(n, r);
    }, Wu[e] ? { passive: !0 } : void 0);
  }
  oe && n.dom.addEventListener("input", () => null), ns(n);
}
function rt(n, e) {
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
      n.input.eventHandlers[t] || n.dom.addEventListener(t, n.input.eventHandlers[t] = (r) => Rs(n, r));
  });
}
function Rs(n, e) {
  return n.someProp("handleDOMEvents", (t) => {
    let r = t[e.type];
    return r ? r(n, e) || e.defaultPrevented : !1;
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
  if (n.input.shiftKey = t.keyCode == 16 || t.shiftKey, !Qa(n, t) && (n.input.lastKeyCode = t.keyCode, n.input.lastKeyCodeTime = Date.now(), !(We && re && t.keyCode == 13)))
    if (t.keyCode != 229 && n.domObserver.forceFlush(), Kt && t.keyCode == 13 && !t.ctrlKey && !t.altKey && !t.metaKey) {
      let r = Date.now();
      n.input.lastIOSEnter = r, n.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
        n.input.lastIOSEnter == r && (n.someProp("handleKeyDown", (i) => i(n, gt(13, "Enter"))), n.input.lastIOSEnter = 0);
      }, 200);
    } else n.someProp("handleKeyDown", (r) => r(n, t)) || Bu(n, t) ? t.preventDefault() : rt(n, "key");
};
ue.keyup = (n, e) => {
  e.keyCode == 16 && (n.input.shiftKey = !1);
};
ue.keypress = (n, e) => {
  let t = e;
  if (Qa(n, t) || !t.charCode || t.ctrlKey && !t.altKey || we && t.metaKey)
    return;
  if (n.someProp("handleKeyPress", (i) => i(n, t))) {
    t.preventDefault();
    return;
  }
  let r = n.state.selection;
  if (!(r instanceof T) || !r.$from.sameParent(r.$to)) {
    let i = String.fromCharCode(t.charCode), s = () => n.state.tr.insertText(i).scrollIntoView();
    !/[\r\n]/.test(i) && !n.someProp("handleTextInput", (o) => o(n, r.$from.pos, r.$to.pos, i, s)) && n.dispatch(s()), t.preventDefault();
  }
};
function Zr(n) {
  return { left: n.clientX, top: n.clientY };
}
function Yu(n, e) {
  let t = e.x - n.clientX, r = e.y - n.clientY;
  return t * t + r * r < 100;
}
function Is(n, e, t, r, i) {
  if (r == -1)
    return !1;
  let s = n.state.doc.resolve(r);
  for (let o = s.depth + 1; o > 0; o--)
    if (n.someProp(e, (l) => o > s.depth ? l(n, t, s.nodeAfter, s.before(o), i, !0) : l(n, t, s.node(o), s.before(o), i, !1)))
      return !0;
  return !1;
}
function Wt(n, e, t) {
  if (n.focused || n.focus(), n.state.selection.eq(e))
    return;
  let r = n.state.tr.setSelection(e);
  r.setMeta("pointer", !0), n.dispatch(r);
}
function Xu(n, e) {
  if (e == -1)
    return !1;
  let t = n.state.doc.resolve(e), r = t.nodeAfter;
  return r && r.isAtom && A.isSelectable(r) ? (Wt(n, new A(t)), !0) : !1;
}
function Qu(n, e) {
  if (e == -1)
    return !1;
  let t = n.state.selection, r, i;
  t instanceof A && (r = t.node);
  let s = n.state.doc.resolve(e);
  for (let o = s.depth + 1; o > 0; o--) {
    let l = o > s.depth ? s.nodeAfter : s.node(o);
    if (A.isSelectable(l)) {
      r && t.$from.depth > 0 && o >= t.$from.depth && s.before(t.$from.depth + 1) == t.$from.pos ? i = s.before(t.$from.depth) : i = s.before(o);
      break;
    }
  }
  return i != null ? (Wt(n, A.create(n.state.doc, i)), !0) : !1;
}
function Zu(n, e, t, r, i) {
  return Is(n, "handleClickOn", e, t, r) || n.someProp("handleClick", (s) => s(n, e, r)) || (i ? Qu(n, t) : Xu(n, t));
}
function eh(n, e, t, r) {
  return Is(n, "handleDoubleClickOn", e, t, r) || n.someProp("handleDoubleClick", (i) => i(n, e, r));
}
function th(n, e, t, r) {
  return Is(n, "handleTripleClickOn", e, t, r) || n.someProp("handleTripleClick", (i) => i(n, e, r)) || nh(n, t, r);
}
function nh(n, e, t) {
  if (t.button != 0)
    return !1;
  let r = n.state.doc;
  if (e == -1)
    return r.inlineContent ? (Wt(n, T.create(r, 0, r.content.size)), !0) : !1;
  let i = r.resolve(e);
  for (let s = i.depth + 1; s > 0; s--) {
    let o = s > i.depth ? i.nodeAfter : i.node(s), l = i.before(s);
    if (o.inlineContent)
      Wt(n, T.create(r, l + 1, l + 1 + o.content.size));
    else if (A.isSelectable(o))
      Wt(n, A.create(r, l));
    else
      continue;
    return !0;
  }
}
function _s(n) {
  return pr(n);
}
const Xa = we ? "metaKey" : "ctrlKey";
de.mousedown = (n, e) => {
  let t = e;
  n.input.shiftKey = t.shiftKey;
  let r = _s(n), i = Date.now(), s = "singleClick";
  i - n.input.lastClick.time < 500 && Yu(t, n.input.lastClick) && !t[Xa] && n.input.lastClick.button == t.button && (n.input.lastClick.type == "singleClick" ? s = "doubleClick" : n.input.lastClick.type == "doubleClick" && (s = "tripleClick")), n.input.lastClick = { time: i, x: t.clientX, y: t.clientY, type: s, button: t.button };
  let o = n.posAtCoords(Zr(t));
  o && (s == "singleClick" ? (n.input.mouseDown && n.input.mouseDown.done(), n.input.mouseDown = new rh(n, o, t, !!r)) : (s == "doubleClick" ? eh : th)(n, o.pos, o.inside, t) ? t.preventDefault() : rt(n, "pointer"));
};
class rh {
  constructor(e, t, r, i) {
    this.view = e, this.pos = t, this.event = r, this.flushed = i, this.delayedSelectionSync = !1, this.mightDrag = null, this.startDoc = e.state.doc, this.selectNode = !!r[Xa], this.allowDefault = r.shiftKey;
    let s, o;
    if (t.inside > -1)
      s = e.state.doc.nodeAt(t.inside), o = t.inside;
    else {
      let d = e.state.doc.resolve(t.pos);
      s = d.parent, o = d.depth ? d.before() : 0;
    }
    const l = i ? null : r.target, a = l ? e.docView.nearestDesc(l, !0) : null;
    this.target = a && a.nodeDOM.nodeType == 1 ? a.nodeDOM : null;
    let { selection: c } = e.state;
    (r.button == 0 && s.type.spec.draggable && s.type.spec.selectable !== !1 || c instanceof A && c.from <= o && c.to > o) && (this.mightDrag = {
      node: s,
      pos: o,
      addAttr: !!(this.target && !this.target.draggable),
      setUneditable: !!(this.target && Se && !this.target.hasAttribute("contentEditable"))
    }), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
      this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
    }, 20), this.view.domObserver.start()), e.root.addEventListener("mouseup", this.up = this.up.bind(this)), e.root.addEventListener("mousemove", this.move = this.move.bind(this)), rt(e, "pointer");
  }
  done() {
    this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => Ue(this.view)), this.view.input.mouseDown = null;
  }
  up(e) {
    if (this.done(), !this.view.dom.contains(e.target))
      return;
    let t = this.pos;
    this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(Zr(e))), this.updateAllowDefault(e), this.allowDefault || !t ? rt(this.view, "pointer") : Zu(this.view, t.pos, t.inside, e, this.selectNode) ? e.preventDefault() : e.button == 0 && (this.flushed || // Safari ignores clicks on draggable elements
    oe && this.mightDrag && !this.mightDrag.node.isAtom || // Chrome will sometimes treat a node selection as a
    // cursor, but still report that the node is selected
    // when asked through getSelection. You'll then get a
    // situation where clicking at the point where that
    // (hidden) cursor is doesn't change the selection, and
    // thus doesn't get a reaction from ProseMirror. This
    // works around that.
    re && !this.view.state.selection.visible && Math.min(Math.abs(t.pos - this.view.state.selection.from), Math.abs(t.pos - this.view.state.selection.to)) <= 2) ? (Wt(this.view, N.near(this.view.state.doc.resolve(t.pos))), e.preventDefault()) : rt(this.view, "pointer");
  }
  move(e) {
    this.updateAllowDefault(e), rt(this.view, "pointer"), e.buttons == 0 && this.done();
  }
  updateAllowDefault(e) {
    !this.allowDefault && (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) && (this.allowDefault = !0);
  }
}
de.touchstart = (n) => {
  n.input.lastTouch = Date.now(), _s(n), rt(n, "pointer");
};
de.touchmove = (n) => {
  n.input.lastTouch = Date.now(), rt(n, "pointer");
};
de.contextmenu = (n) => _s(n);
function Qa(n, e) {
  return n.composing ? !0 : oe && Math.abs(e.timeStamp - n.input.compositionEndedAt) < 500 ? (n.input.compositionEndedAt = -2e8, !0) : !1;
}
const ih = We ? 5e3 : -1;
ue.compositionstart = ue.compositionupdate = (n) => {
  if (!n.composing) {
    n.domObserver.flush();
    let { state: e } = n, t = e.selection.$to;
    if (e.selection instanceof T && (e.storedMarks || !t.textOffset && t.parentOffset && t.nodeBefore.marks.some((r) => r.type.spec.inclusive === !1) || re && Na && sh(n)))
      n.markCursor = n.state.storedMarks || t.marks(), pr(n, !0), n.markCursor = null;
    else if (pr(n, !e.selection.empty), Se && e.selection.empty && t.parentOffset && !t.textOffset && t.nodeBefore.marks.length) {
      let r = n.domSelectionRange();
      for (let i = r.focusNode, s = r.focusOffset; i && i.nodeType == 1 && s != 0; ) {
        let o = s < 0 ? i.lastChild : i.childNodes[s - 1];
        if (!o)
          break;
        if (o.nodeType == 3) {
          let l = n.domSelection();
          l && l.collapse(o, o.nodeValue.length);
          break;
        } else
          i = o, s = -1;
      }
    }
    n.input.composing = !0;
  }
  Za(n, ih);
};
function sh(n) {
  let { focusNode: e, focusOffset: t } = n.domSelectionRange();
  if (!e || e.nodeType != 1 || t >= e.childNodes.length)
    return !1;
  let r = e.childNodes[t];
  return r.nodeType == 1 && r.contentEditable == "false";
}
ue.compositionend = (n, e) => {
  n.composing && (n.input.composing = !1, n.input.compositionEndedAt = e.timeStamp, n.input.compositionPendingChanges = n.domObserver.pendingRecords().length ? n.input.compositionID : 0, n.input.compositionNode = null, n.input.badSafariComposition ? n.domObserver.forceFlush() : n.input.compositionPendingChanges && Promise.resolve().then(() => n.domObserver.flush()), n.input.compositionID++, Za(n, 20));
};
function Za(n, e) {
  clearTimeout(n.input.composingTimeout), e > -1 && (n.input.composingTimeout = setTimeout(() => pr(n), e));
}
function ec(n) {
  for (n.composing && (n.input.composing = !1, n.input.compositionEndedAt = lh()); n.input.compositionNodes.length > 0; )
    n.input.compositionNodes.pop().markParentsDirty();
}
function oh(n) {
  let e = n.domSelectionRange();
  if (!e.focusNode)
    return null;
  let t = Qd(e.focusNode, e.focusOffset), r = Zd(e.focusNode, e.focusOffset);
  if (t && r && t != r) {
    let i = r.pmViewDesc, s = n.domObserver.lastChangedTextNode;
    if (t == s || r == s)
      return s;
    if (!i || !i.isText(r.nodeValue))
      return r;
    if (n.input.compositionNode == r) {
      let o = t.pmViewDesc;
      if (!(!o || !o.isText(t.nodeValue)))
        return r;
    }
  }
  return t || r;
}
function lh() {
  let n = document.createEvent("Event");
  return n.initEvent("event", !0, !0), n.timeStamp;
}
function pr(n, e = !1) {
  if (!(We && n.domObserver.flushingSoon >= 0)) {
    if (n.domObserver.forceFlush(), ec(n), e || n.docView && n.docView.dirty) {
      let t = Ns(n), r = n.state.selection;
      return t && !t.eq(r) ? n.dispatch(n.state.tr.setSelection(t)) : (n.markCursor || e) && !r.$from.node(r.$from.sharedDepth(r.to)).inlineContent ? n.dispatch(n.state.tr.deleteSelection()) : n.updateState(n.state), !0;
    }
    return !1;
  }
}
function ah(n, e) {
  if (!n.dom.parentNode)
    return;
  let t = n.dom.parentNode.appendChild(document.createElement("div"));
  t.appendChild(e), t.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let r = getSelection(), i = document.createRange();
  i.selectNodeContents(e), n.dom.blur(), r.removeAllRanges(), r.addRange(i), setTimeout(() => {
    t.parentNode && t.parentNode.removeChild(t), n.focus();
  }, 50);
}
const Cn = pe && ot < 15 || Kt && ru < 604;
de.copy = ue.cut = (n, e) => {
  let t = e, r = n.state.selection, i = t.type == "cut";
  if (r.empty)
    return;
  let s = Cn ? null : t.clipboardData, o = r.content(), { dom: l, text: a } = Ls(n, o);
  s ? (t.preventDefault(), s.clearData(), s.setData("text/html", l.innerHTML), s.setData("text/plain", a)) : ah(n, l), i && n.dispatch(n.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function ch(n) {
  return n.openStart == 0 && n.openEnd == 0 && n.content.childCount == 1 ? n.content.firstChild : null;
}
function dh(n, e) {
  if (!n.dom.parentNode)
    return;
  let t = n.input.shiftKey || n.state.selection.$from.parent.type.spec.code, r = n.dom.parentNode.appendChild(document.createElement(t ? "textarea" : "div"));
  t || (r.contentEditable = "true"), r.style.cssText = "position: fixed; left: -10000px; top: 10px", r.focus();
  let i = n.input.shiftKey && n.input.lastKeyCode != 45;
  setTimeout(() => {
    n.focus(), r.parentNode && r.parentNode.removeChild(r), t ? Sn(n, r.value, null, i, e) : Sn(n, r.textContent, r.innerHTML, i, e);
  }, 50);
}
function Sn(n, e, t, r, i) {
  let s = ja(n, e, t, r, n.state.selection.$from);
  if (n.someProp("handlePaste", (a) => a(n, i, s || x.empty)))
    return !0;
  if (!s)
    return !1;
  let o = ch(s), l = o ? n.state.tr.replaceSelectionWith(o, r) : n.state.tr.replaceSelection(s);
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
  let r = Cn ? null : t.clipboardData, i = n.input.shiftKey && n.input.lastKeyCode != 45;
  r && Sn(n, tc(r), r.getData("text/html"), i, t) ? t.preventDefault() : dh(n, t);
};
class nc {
  constructor(e, t, r) {
    this.slice = e, this.move = t, this.node = r;
  }
}
const uh = we ? "altKey" : "ctrlKey";
function rc(n, e) {
  let t = n.someProp("dragCopies", (r) => !r(e));
  return t ?? !e[uh];
}
de.dragstart = (n, e) => {
  let t = e, r = n.input.mouseDown;
  if (r && r.done(), !t.dataTransfer)
    return;
  let i = n.state.selection, s = i.empty ? null : n.posAtCoords(Zr(t)), o;
  if (!(s && s.pos >= i.from && s.pos <= (i instanceof A ? i.to - 1 : i.to))) {
    if (r && r.mightDrag)
      o = A.create(n.state.doc, r.mightDrag.pos);
    else if (t.target && t.target.nodeType == 1) {
      let u = n.docView.nearestDesc(t.target, !0);
      u && u.node.type.spec.draggable && u != n.docView && (o = A.create(n.state.doc, u.posBefore));
    }
  }
  let l = (o || n.state.selection).content(), { dom: a, text: c, slice: d } = Ls(n, l);
  (!t.dataTransfer.files.length || !re || Ta > 120) && t.dataTransfer.clearData(), t.dataTransfer.setData(Cn ? "Text" : "text/html", a.innerHTML), t.dataTransfer.effectAllowed = "copyMove", Cn || t.dataTransfer.setData("text/plain", c), n.dragging = new nc(d, rc(n, t), o);
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
    hh(n, e, n.dragging);
  } finally {
    n.dragging = null;
  }
};
function hh(n, e, t) {
  if (!e.dataTransfer)
    return;
  let r = n.posAtCoords(Zr(e));
  if (!r)
    return;
  let i = n.state.doc.resolve(r.pos), s = t && t.slice;
  s ? n.someProp("transformPasted", (p) => {
    s = p(s, n, !1);
  }) : s = ja(n, tc(e.dataTransfer), Cn ? null : e.dataTransfer.getData("text/html"), !1, i);
  let o = !!(t && rc(n, e));
  if (n.someProp("handleDrop", (p) => p(n, e, s || x.empty, o))) {
    e.preventDefault();
    return;
  }
  if (!s)
    return;
  e.preventDefault();
  let l = s ? ka(n.state.doc, i.pos, s) : i.pos;
  l == null && (l = i.pos);
  let a = n.state.tr;
  if (o) {
    let { node: p } = t;
    p ? p.replace(a) : a.deleteSelection();
  }
  let c = a.mapping.map(l), d = s.openStart == 0 && s.openEnd == 0 && s.content.childCount == 1, u = a.doc;
  if (d ? a.replaceRangeWith(c, c, s.content.firstChild) : a.replaceRange(c, c, s), a.doc.eq(u))
    return;
  let h = a.doc.resolve(c);
  if (d && A.isSelectable(s.content.firstChild) && h.nodeAfter && h.nodeAfter.sameMarkup(s.content.firstChild))
    a.setSelection(new A(h));
  else {
    let p = a.mapping.map(l);
    a.mapping.maps[a.mapping.maps.length - 1].forEach((f, m, g, b) => p = b), a.setSelection(Os(n, h, a.doc.resolve(p)));
  }
  n.focus(), n.dispatch(a.setMeta("uiEvent", "drop"));
}
de.focus = (n) => {
  n.input.lastFocus = Date.now(), n.focused || (n.domObserver.stop(), n.dom.classList.add("ProseMirror-focused"), n.domObserver.start(), n.focused = !0, setTimeout(() => {
    n.docView && n.hasFocus() && !n.domObserver.currentSelection.eq(n.domSelectionRange()) && Ue(n);
  }, 20));
};
de.blur = (n, e) => {
  let t = e;
  n.focused && (n.domObserver.stop(), n.dom.classList.remove("ProseMirror-focused"), n.domObserver.start(), t.relatedTarget && n.dom.contains(t.relatedTarget) && n.domObserver.currentSelection.clear(), n.focused = !1);
};
de.beforeinput = (n, e) => {
  if (re && We && e.inputType == "deleteContentBackward") {
    n.domObserver.flushSoon();
    let { domChangeCount: r } = n.input;
    setTimeout(() => {
      if (n.input.domChangeCount != r || (n.dom.blur(), n.focus(), n.someProp("handleKeyDown", (s) => s(n, gt(8, "Backspace")))))
        return;
      let { $cursor: i } = n.state.selection;
      i && i.pos > 0 && n.dispatch(n.state.tr.delete(i.pos - 1, i.pos).scrollIntoView());
    }, 50);
  }
};
for (let n in ue)
  de[n] = ue[n];
function xn(n, e) {
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
class fr {
  constructor(e, t) {
    this.toDOM = e, this.spec = t || vt, this.side = this.spec.side || 0;
  }
  map(e, t, r, i) {
    let { pos: s, deleted: o } = e.mapResult(t.from + i, this.side < 0 ? -1 : 1);
    return o ? null : new ie(s - r, s - r, this);
  }
  valid() {
    return !0;
  }
  eq(e) {
    return this == e || e instanceof fr && (this.spec.key && this.spec.key == e.spec.key || this.toDOM == e.toDOM && xn(this.spec, e.spec));
  }
  destroy(e) {
    this.spec.destroy && this.spec.destroy(e);
  }
}
class at {
  constructor(e, t) {
    this.attrs = e, this.spec = t || vt;
  }
  map(e, t, r, i) {
    let s = e.map(t.from + i, this.spec.inclusiveStart ? -1 : 1) - r, o = e.map(t.to + i, this.spec.inclusiveEnd ? 1 : -1) - r;
    return s >= o ? null : new ie(s, o, this);
  }
  valid(e, t) {
    return t.from < t.to;
  }
  eq(e) {
    return this == e || e instanceof at && xn(this.attrs, e.attrs) && xn(this.spec, e.spec);
  }
  static is(e) {
    return e.type instanceof at;
  }
  destroy() {
  }
}
class Ds {
  constructor(e, t) {
    this.attrs = e, this.spec = t || vt;
  }
  map(e, t, r, i) {
    let s = e.mapResult(t.from + i, 1);
    if (s.deleted)
      return null;
    let o = e.mapResult(t.to + i, -1);
    return o.deleted || o.pos <= s.pos ? null : new ie(s.pos - r, o.pos - r, this);
  }
  valid(e, t) {
    let { index: r, offset: i } = e.content.findIndex(t.from), s;
    return i == t.from && !(s = e.child(r)).isText && i + s.nodeSize == t.to;
  }
  eq(e) {
    return this == e || e instanceof Ds && xn(this.attrs, e.attrs) && xn(this.spec, e.spec);
  }
  destroy() {
  }
}
class ie {
  /**
  @internal
  */
  constructor(e, t, r) {
    this.from = e, this.to = t, this.type = r;
  }
  /**
  @internal
  */
  copy(e, t) {
    return new ie(e, t, this.type);
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
  map(e, t, r) {
    return this.type.map(e, this, t, r);
  }
  /**
  Creates a widget decoration, which is a DOM node that's shown in
  the document at the given position. It is recommended that you
  delay rendering the widget by passing a function that will be
  called when the widget is actually drawn in a view, but you can
  also directly pass a DOM node. `getPos` can be used to find the
  widget's current document position.
  */
  static widget(e, t, r) {
    return new ie(e, e, new fr(t, r));
  }
  /**
  Creates an inline decoration, which adds the given attributes to
  each inline node between `from` and `to`.
  */
  static inline(e, t, r, i) {
    return new ie(e, t, new at(r, i));
  }
  /**
  Creates a node decoration. `from` and `to` should point precisely
  before and after a node in the document. That node, and only that
  node, will receive the given attributes.
  */
  static node(e, t, r, i) {
    return new ie(e, t, new Ds(r, i));
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
    return this.type instanceof fr;
  }
}
const zt = [], vt = {};
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
    return t.length ? mr(t, e, 0, vt) : se;
  }
  /**
  Find all decorations in this set which touch the given range
  (including decorations that start or end directly at the
  boundaries) and match the given predicate on their spec. When
  `start` and `end` are omitted, all decorations in the set are
  considered. When `predicate` isn't given, all decorations are
  assumed to match.
  */
  find(e, t, r) {
    let i = [];
    return this.findInner(e ?? 0, t ?? 1e9, i, 0, r), i;
  }
  findInner(e, t, r, i, s) {
    for (let o = 0; o < this.local.length; o++) {
      let l = this.local[o];
      l.from <= t && l.to >= e && (!s || s(l.spec)) && r.push(l.copy(l.from + i, l.to + i));
    }
    for (let o = 0; o < this.children.length; o += 3)
      if (this.children[o] < t && this.children[o + 1] > e) {
        let l = this.children[o] + 1;
        this.children[o + 2].findInner(e - l, t - l, r, i + l, s);
      }
  }
  /**
  Map the set of decorations in response to a change in the
  document.
  */
  map(e, t, r) {
    return this == se || e.maps.length == 0 ? this : this.mapInner(e, t, 0, 0, r || vt);
  }
  /**
  @internal
  */
  mapInner(e, t, r, i, s) {
    let o;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l].map(e, r, i);
      a && a.type.valid(t, a) ? (o || (o = [])).push(a) : s.onRemove && s.onRemove(this.local[l].spec);
    }
    return this.children.length ? ph(this.children, o || [], e, t, r, i, s) : o ? new F(o.sort(Mt), zt) : se;
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
  addInner(e, t, r) {
    let i, s = 0;
    e.forEach((l, a) => {
      let c = a + r, d;
      if (d = sc(t, l, c)) {
        for (i || (i = this.children.slice()); s < i.length && i[s] < a; )
          s += 3;
        i[s] == a ? i[s + 2] = i[s + 2].addInner(l, d, c + 1) : i.splice(s, 0, a, a + l.nodeSize, mr(d, l, c + 1, vt)), s += 3;
      }
    });
    let o = ic(s ? oc(t) : t, -r);
    for (let l = 0; l < o.length; l++)
      o[l].type.valid(e, o[l]) || o.splice(l--, 1);
    return new F(o.length ? this.local.concat(o).sort(Mt) : this.local, i || this.children);
  }
  /**
  Create a new set that contains the decorations in this set, minus
  the ones in the given array.
  */
  remove(e) {
    return e.length == 0 || this == se ? this : this.removeInner(e, 0);
  }
  removeInner(e, t) {
    let r = this.children, i = this.local;
    for (let s = 0; s < r.length; s += 3) {
      let o, l = r[s] + t, a = r[s + 1] + t;
      for (let d = 0, u; d < e.length; d++)
        (u = e[d]) && u.from > l && u.to < a && (e[d] = null, (o || (o = [])).push(u));
      if (!o)
        continue;
      r == this.children && (r = this.children.slice());
      let c = r[s + 2].removeInner(o, l + 1);
      c != se ? r[s + 2] = c : (r.splice(s, 3), s -= 3);
    }
    if (i.length) {
      for (let s = 0, o; s < e.length; s++)
        if (o = e[s])
          for (let l = 0; l < i.length; l++)
            i[l].eq(o, t) && (i == this.local && (i = this.local.slice()), i.splice(l--, 1));
    }
    return r == this.children && i == this.local ? this : i.length || r.length ? new F(i, r) : se;
  }
  forChild(e, t) {
    if (this == se)
      return this;
    if (t.isLeaf)
      return F.empty;
    let r, i;
    for (let l = 0; l < this.children.length; l += 3)
      if (this.children[l] >= e) {
        this.children[l] == e && (r = this.children[l + 2]);
        break;
      }
    let s = e + 1, o = s + t.content.size;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l];
      if (a.from < o && a.to > s && a.type instanceof at) {
        let c = Math.max(s, a.from) - s, d = Math.min(o, a.to) - s;
        c < d && (i || (i = [])).push(a.copy(c, d));
      }
    }
    if (i) {
      let l = new F(i.sort(Mt), zt);
      return r ? new Qe([l, r]) : l;
    }
    return r || se;
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
    return Ps(this.localsInner(e));
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
    for (let r = 0; r < this.local.length; r++)
      this.local[r].type instanceof at || t.push(this.local[r]);
    return t;
  }
  forEachSet(e) {
    e(this);
  }
}
F.empty = new F([], []);
F.removeOverlap = Ps;
const se = F.empty;
class Qe {
  constructor(e) {
    this.members = e;
  }
  map(e, t) {
    const r = this.members.map((i) => i.map(e, t, vt));
    return Qe.from(r);
  }
  forChild(e, t) {
    if (t.isLeaf)
      return F.empty;
    let r = [];
    for (let i = 0; i < this.members.length; i++) {
      let s = this.members[i].forChild(e, t);
      s != se && (s instanceof Qe ? r = r.concat(s.members) : r.push(s));
    }
    return Qe.from(r);
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
    let t, r = !0;
    for (let i = 0; i < this.members.length; i++) {
      let s = this.members[i].localsInner(e);
      if (s.length)
        if (!t)
          t = s;
        else {
          r && (t = t.slice(), r = !1);
          for (let o = 0; o < s.length; o++)
            t.push(s[o]);
        }
    }
    return t ? Ps(r ? t : t.sort(Mt)) : zt;
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
        return new Qe(e.every((t) => t instanceof F) ? e : e.reduce((t, r) => t.concat(r instanceof F ? r : r.members), []));
    }
  }
  forEachSet(e) {
    for (let t = 0; t < this.members.length; t++)
      this.members[t].forEachSet(e);
  }
}
function ph(n, e, t, r, i, s, o) {
  let l = n.slice();
  for (let c = 0, d = s; c < t.maps.length; c++) {
    let u = 0;
    t.maps[c].forEach((h, p, f, m) => {
      let g = m - f - (p - h);
      for (let b = 0; b < l.length; b += 3) {
        let k = l[b + 1];
        if (k < 0 || h > k + d - u)
          continue;
        let w = l[b] + d - u;
        p >= w ? l[b + 1] = h <= w ? -2 : -1 : h >= d && g && (l[b] += g, l[b + 1] += g);
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
      let d = t.map(n[c] + s), u = d - i;
      if (u < 0 || u >= r.content.size) {
        a = !0;
        continue;
      }
      let h = t.map(n[c + 1] + s, -1), p = h - i, { index: f, offset: m } = r.content.findIndex(u), g = r.maybeChild(f);
      if (g && m == u && m + g.nodeSize == p) {
        let b = l[c + 2].mapInner(t, g, d + 1, n[c] + s + 1, o);
        b != se ? (l[c] = u, l[c + 1] = p, l[c + 2] = b) : (l[c + 1] = -2, a = !0);
      } else
        a = !0;
    }
  if (a) {
    let c = fh(l, n, e, t, i, s, o), d = mr(c, r, 0, o);
    e = d.local;
    for (let u = 0; u < l.length; u += 3)
      l[u + 1] < 0 && (l.splice(u, 3), u -= 3);
    for (let u = 0, h = 0; u < d.children.length; u += 3) {
      let p = d.children[u];
      for (; h < l.length && l[h] < p; )
        h += 3;
      l.splice(h, 0, d.children[u], d.children[u + 1], d.children[u + 2]);
    }
  }
  return new F(e.sort(Mt), l);
}
function ic(n, e) {
  if (!e || !n.length)
    return n;
  let t = [];
  for (let r = 0; r < n.length; r++) {
    let i = n[r];
    t.push(new ie(i.from + e, i.to + e, i.type));
  }
  return t;
}
function fh(n, e, t, r, i, s, o) {
  function l(a, c) {
    for (let d = 0; d < a.local.length; d++) {
      let u = a.local[d].map(r, i, c);
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
  let r = t + e.nodeSize, i = null;
  for (let s = 0, o; s < n.length; s++)
    (o = n[s]) && o.from > t && o.to < r && ((i || (i = [])).push(o), n[s] = null);
  return i;
}
function oc(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    n[t] != null && e.push(n[t]);
  return e;
}
function mr(n, e, t, r) {
  let i = [], s = !1;
  e.forEach((l, a) => {
    let c = sc(n, l, a + t);
    if (c) {
      s = !0;
      let d = mr(c, l, t + a + 1, r);
      d != se && i.push(a, a + l.nodeSize, d);
    }
  });
  let o = ic(s ? oc(n) : n, -t).sort(Mt);
  for (let l = 0; l < o.length; l++)
    o[l].type.valid(e, o[l]) || (r.onRemove && r.onRemove(o[l].spec), o.splice(l--, 1));
  return o.length || i.length ? new F(o, i) : se;
}
function Mt(n, e) {
  return n.from - e.from || n.to - e.to;
}
function Ps(n) {
  let e = n;
  for (let t = 0; t < e.length - 1; t++) {
    let r = e[t];
    if (r.from != r.to)
      for (let i = t + 1; i < e.length; i++) {
        let s = e[i];
        if (s.from == r.from) {
          s.to != r.to && (e == n && (e = n.slice()), e[i] = s.copy(s.from, r.to), Jo(e, i + 1, s.copy(r.to, s.to)));
          continue;
        } else {
          s.from < r.to && (e == n && (e = n.slice()), e[t] = r.copy(r.from, s.from), Jo(e, i, r.copy(s.from, r.to)));
          break;
        }
      }
  }
  return e;
}
function Jo(n, e, t) {
  for (; e < n.length && Mt(t, n[e]) > 0; )
    e++;
  n.splice(e, 0, t);
}
function Si(n) {
  let e = [];
  return n.someProp("decorations", (t) => {
    let r = t(n.state);
    r && r != se && e.push(r);
  }), n.cursorWrapper && e.push(F.create(n.state.doc, [n.cursorWrapper.deco])), Qe.from(e);
}
const mh = {
  childList: !0,
  characterData: !0,
  characterDataOldValue: !0,
  attributes: !0,
  attributeOldValue: !0,
  subtree: !0
}, gh = pe && ot <= 11;
class bh {
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
class yh {
  constructor(e, t) {
    this.view = e, this.handleDOMChange = t, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new bh(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((r) => {
      for (let i = 0; i < r.length; i++)
        this.queue.push(r[i]);
      pe && ot <= 11 && r.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : oe && e.composing && r.some((i) => i.type == "childList" && i.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
    }), gh && (this.onCharData = (r) => {
      this.queue.push({ target: r.target, type: "characterData", oldValue: r.prevValue }), this.flushSoon();
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
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, mh)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
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
    if ($o(this.view)) {
      if (this.suppressingSelectionUpdates)
        return Ue(this.view);
      if (pe && ot <= 11 && !this.view.state.selection.empty) {
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
    let t = /* @__PURE__ */ new Set(), r;
    for (let s = e.focusNode; s; s = Ut(s))
      t.add(s);
    for (let s = e.anchorNode; s; s = Ut(s))
      if (t.has(s)) {
        r = s;
        break;
      }
    let i = r && this.view.docView.nearestDesc(r);
    if (i && i.ignoreMutation({
      type: "selection",
      target: r.nodeType == 3 ? r.parentNode : r
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
    let r = e.domSelectionRange(), i = !this.suppressingSelectionUpdates && !this.currentSelection.eq(r) && $o(e) && !this.ignoreSelectionChange(r), s = -1, o = -1, l = !1, a = [];
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
        let [u, h] = d;
        u.parentNode && u.parentNode.parentNode == h.parentNode ? h.remove() : u.remove();
      } else {
        let { focusNode: u } = this.currentSelection;
        for (let h of d) {
          let p = h.parentNode;
          p && p.nodeName == "LI" && (!u || Ch(e, u) != p) && h.remove();
        }
      }
    }
    let c = null;
    s < 0 && i && e.input.lastFocus > Date.now() - 200 && Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 && Xr(r) && (c = Ns(e)) && c.eq(N.near(e.state.doc.resolve(0), 1)) ? (e.input.lastFocus = 0, Ue(e), this.currentSelection.set(r), e.scrollToSelection()) : (s > -1 || i) && (s > -1 && (e.docView.markDirty(s, o), kh(e)), e.input.badSafariComposition && (e.input.badSafariComposition = !1, Sh(e, a)), this.handleDOMChange(s, o, l, a), e.docView && e.docView.dirty ? e.updateState(e.state) : this.currentSelection.eq(r) || Ue(e), this.currentSelection.set(r));
  }
  registerMutation(e, t) {
    if (t.indexOf(e.target) > -1)
      return null;
    let r = this.view.docView.nearestDesc(e.target);
    if (e.type == "attributes" && (r == this.view.docView || e.attributeName == "contenteditable" || // Firefox sometimes fires spurious events for null/empty styles
    e.attributeName == "style" && !e.oldValue && !e.target.getAttribute("style")) || !r || r.ignoreMutation(e))
      return null;
    if (e.type == "childList") {
      for (let d = 0; d < e.addedNodes.length; d++) {
        let u = e.addedNodes[d];
        t.push(u), u.nodeType == 3 && (this.lastChangedTextNode = u);
      }
      if (r.contentDOM && r.contentDOM != r.dom && !r.contentDOM.contains(e.target))
        return { from: r.posBefore, to: r.posAfter };
      let i = e.previousSibling, s = e.nextSibling;
      if (pe && ot <= 11 && e.addedNodes.length)
        for (let d = 0; d < e.addedNodes.length; d++) {
          let { previousSibling: u, nextSibling: h } = e.addedNodes[d];
          (!u || Array.prototype.indexOf.call(e.addedNodes, u) < 0) && (i = u), (!h || Array.prototype.indexOf.call(e.addedNodes, h) < 0) && (s = h);
        }
      let o = i && i.parentNode == e.target ? te(i) + 1 : 0, l = r.localPosFromDOM(e.target, o, -1), a = s && s.parentNode == e.target ? te(s) : e.target.childNodes.length, c = r.localPosFromDOM(e.target, a, 1);
      return { from: l, to: c };
    } else return e.type == "attributes" ? { from: r.posAtStart - r.border, to: r.posAtEnd + r.border } : (this.lastChangedTextNode = e.target, {
      from: r.posAtStart,
      to: r.posAtEnd,
      // An event was generated for a text change that didn't change
      // any text. Mark the dom change to fall back to assuming the
      // selection was typed over with an identical value if it can't
      // find another change.
      typeOver: e.target.nodeValue == e.oldValue
    });
  }
}
let Go = /* @__PURE__ */ new WeakMap(), Yo = !1;
function kh(n) {
  if (!Go.has(n) && (Go.set(n, null), ["normal", "nowrap", "pre-line"].indexOf(getComputedStyle(n.dom).whiteSpace) !== -1)) {
    if (n.requiresGeckoHackNode = Se, Yo)
      return;
    console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), Yo = !0;
  }
}
function Xo(n, e) {
  let t = e.startContainer, r = e.startOffset, i = e.endContainer, s = e.endOffset, o = n.domAtPos(n.state.selection.anchor);
  return Nt(o.node, o.offset, i, s) && ([t, r, i, s] = [i, s, t, r]), { anchorNode: t, anchorOffset: r, focusNode: i, focusOffset: s };
}
function wh(n, e) {
  if (e.getComposedRanges) {
    let i = e.getComposedRanges(n.root)[0];
    if (i)
      return Xo(n, i);
  }
  let t;
  function r(i) {
    i.preventDefault(), i.stopImmediatePropagation(), t = i.getTargetRanges()[0];
  }
  return n.dom.addEventListener("beforeinput", r, !0), document.execCommand("indent"), n.dom.removeEventListener("beforeinput", r, !0), t ? Xo(n, t) : null;
}
function Ch(n, e) {
  for (let t = e.parentNode; t && t != n.dom; t = t.parentNode) {
    let r = n.docView.nearestDesc(t, !0);
    if (r && r.node.isBlock)
      return t;
  }
  return null;
}
function Sh(n, e) {
  var t;
  let { focusNode: r, focusOffset: i } = n.domSelectionRange();
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
        l.insertBefore(s, l.firstChild), r == s && n.domSelection().collapse(s, i);
      } else
        s.parentNode.removeChild(s);
    }
}
function xh(n, e, t) {
  let { node: r, fromOffset: i, toOffset: s, from: o, to: l } = n.docView.parseRange(e, t), a = n.domSelectionRange(), c, d = a.anchorNode;
  if (d && n.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (c = [{ node: d, offset: a.anchorOffset }], Xr(a) || c.push({ node: a.focusNode, offset: a.focusOffset })), re && n.input.lastKeyCode === 8)
    for (let g = s; g > i; g--) {
      let b = r.childNodes[g - 1], k = b.pmViewDesc;
      if (b.nodeName == "BR" && !k) {
        s = g;
        break;
      }
      if (!k || k.size)
        break;
    }
  let u = n.state.doc, h = n.someProp("domParser") || st.fromSchema(n.state.schema), p = u.resolve(o), f = null, m = h.parse(r, {
    topNode: p.parent,
    topMatch: p.parent.contentMatchAt(p.index()),
    topOpen: !0,
    from: i,
    to: s,
    preserveWhitespace: p.parent.type.whitespace == "pre" ? "full" : !0,
    findPositions: c,
    ruleFromNode: vh,
    context: p
  });
  if (c && c[0].pos != null) {
    let g = c[0].pos, b = c[1] && c[1].pos;
    b == null && (b = g), f = { anchor: g + o, head: b + o };
  }
  return { doc: m, sel: f, from: o, to: l };
}
function vh(n) {
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
const Mh = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function Eh(n, e, t, r, i) {
  let s = n.input.compositionPendingChanges || (n.composing ? n.input.compositionID : 0);
  if (n.input.compositionPendingChanges = 0, e < 0) {
    let M = n.input.lastSelectionTime > Date.now() - 50 ? n.input.lastSelectionOrigin : null, O = Ns(n, M);
    if (O && !n.state.selection.eq(O)) {
      if (re && We && n.input.lastKeyCode === 13 && Date.now() - 100 < n.input.lastKeyCodeTime && n.someProp("handleKeyDown", (ve) => ve(n, gt(13, "Enter"))))
        return;
      let D = n.state.tr.setSelection(O);
      M == "pointer" ? D.setMeta("pointer", !0) : M == "key" && D.scrollIntoView(), s && D.setMeta("composition", s), n.dispatch(D);
    }
    return;
  }
  let o = n.state.doc.resolve(e), l = o.sharedDepth(t);
  e = o.before(l + 1), t = n.state.doc.resolve(t).after(l + 1);
  let a = n.state.selection, c = xh(n, e, t), d = n.state.doc, u = d.slice(c.from, c.to), h, p;
  n.input.lastKeyCode === 8 && Date.now() - 100 < n.input.lastKeyCodeTime ? (h = n.state.selection.to, p = "end") : (h = n.state.selection.from, p = "start"), n.input.lastKeyCode = null;
  let f = Nh(u.content, c.doc.content, c.from, h, p);
  if (f && n.input.domChangeCount++, (Kt && n.input.lastIOSEnter > Date.now() - 225 || We) && i.some((M) => M.nodeType == 1 && !Mh.test(M.nodeName)) && (!f || f.endA >= f.endB) && n.someProp("handleKeyDown", (M) => M(n, gt(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (!f)
    if (r && a instanceof T && !a.empty && a.$head.sameParent(a.$anchor) && !n.composing && !(c.sel && c.sel.anchor != c.sel.head))
      f = { start: a.from, endA: a.to, endB: a.to };
    else {
      if (c.sel) {
        let M = Qo(n, n.state.doc, c.sel);
        if (M && !M.eq(n.state.selection)) {
          let O = n.state.tr.setSelection(M);
          s && O.setMeta("composition", s), n.dispatch(O);
        }
      }
      return;
    }
  n.state.selection.from < n.state.selection.to && f.start == f.endB && n.state.selection instanceof T && (f.start > n.state.selection.from && f.start <= n.state.selection.from + 2 && n.state.selection.from >= c.from ? f.start = n.state.selection.from : f.endA < n.state.selection.to && f.endA >= n.state.selection.to - 2 && n.state.selection.to <= c.to && (f.endB += n.state.selection.to - f.endA, f.endA = n.state.selection.to)), pe && ot <= 11 && f.endB == f.start + 1 && f.endA == f.start && f.start > c.from && c.doc.textBetween(f.start - c.from - 1, f.start - c.from + 1) == "  " && (f.start--, f.endA--, f.endB--);
  let m = c.doc.resolveNoCache(f.start - c.from), g = c.doc.resolveNoCache(f.endB - c.from), b = d.resolve(f.start), k = m.sameParent(g) && m.parent.inlineContent && b.end() >= f.endA;
  if ((Kt && n.input.lastIOSEnter > Date.now() - 225 && (!k || i.some((M) => M.nodeName == "DIV" || M.nodeName == "P")) || !k && m.pos < c.doc.content.size && (!m.sameParent(g) || !m.parent.inlineContent) && m.pos < g.pos && !/\S/.test(c.doc.textBetween(m.pos, g.pos, "", ""))) && n.someProp("handleKeyDown", (M) => M(n, gt(13, "Enter")))) {
    n.input.lastIOSEnter = 0;
    return;
  }
  if (n.state.selection.anchor > f.start && Th(d, f.start, f.endA, m, g) && n.someProp("handleKeyDown", (M) => M(n, gt(8, "Backspace")))) {
    We && re && n.domObserver.suppressSelectionUpdates();
    return;
  }
  re && f.endB == f.start && (n.input.lastChromeDelete = Date.now()), We && !k && m.start() != g.start() && g.parentOffset == 0 && m.depth == g.depth && c.sel && c.sel.anchor == c.sel.head && c.sel.head == f.endA && (f.endB -= 2, g = c.doc.resolveNoCache(f.endB - c.from), setTimeout(() => {
    n.someProp("handleKeyDown", function(M) {
      return M(n, gt(13, "Enter"));
    });
  }, 20));
  let w = f.start, v = f.endA, S = (M) => {
    let O = M || n.state.tr.replace(w, v, c.doc.slice(f.start - c.from, f.endB - c.from));
    if (c.sel) {
      let D = Qo(n, O.doc, c.sel);
      D && !(re && n.composing && D.empty && (f.start != f.endB || n.input.lastChromeDelete < Date.now() - 100) && (D.head == w || D.head == O.mapping.map(v) - 1) || pe && D.empty && D.head == w) && O.setSelection(D);
    }
    return s && O.setMeta("composition", s), O.scrollIntoView();
  }, L;
  if (k)
    if (m.pos == g.pos) {
      pe && ot <= 11 && m.parentOffset == 0 && (n.domObserver.suppressSelectionUpdates(), setTimeout(() => Ue(n), 20));
      let M = S(n.state.tr.delete(w, v)), O = d.resolve(f.start).marksAcross(d.resolve(f.endA));
      O && M.ensureMarks(O), n.dispatch(M);
    } else if (
      // Adding or removing a mark
      f.endA == f.endB && (L = Ah(m.parent.content.cut(m.parentOffset, g.parentOffset), b.parent.content.cut(b.parentOffset, f.endA - b.start())))
    ) {
      let M = S(n.state.tr);
      L.type == "add" ? M.addMark(w, v, L.mark) : M.removeMark(w, v, L.mark), n.dispatch(M);
    } else if (m.parent.child(m.index()).isText && m.index() == g.index() - (g.textOffset ? 0 : 1)) {
      let M = m.parent.textBetween(m.parentOffset, g.parentOffset), O = () => S(n.state.tr.insertText(M, w, v));
      n.someProp("handleTextInput", (D) => D(n, w, v, M, O)) || n.dispatch(O());
    } else
      n.dispatch(S());
  else
    n.dispatch(S());
}
function Qo(n, e, t) {
  return Math.max(t.anchor, t.head) > e.content.size ? null : Os(n, e.resolve(t.anchor), e.resolve(t.head));
}
function Ah(n, e) {
  let t = n.firstChild.marks, r = e.firstChild.marks, i = t, s = r, o, l, a;
  for (let d = 0; d < r.length; d++)
    i = r[d].removeFromSet(i);
  for (let d = 0; d < t.length; d++)
    s = t[d].removeFromSet(s);
  if (i.length == 1 && s.length == 0)
    l = i[0], o = "add", a = (d) => d.mark(l.addToSet(d.marks));
  else if (i.length == 0 && s.length == 1)
    l = s[0], o = "remove", a = (d) => d.mark(l.removeFromSet(d.marks));
  else
    return null;
  let c = [];
  for (let d = 0; d < e.childCount; d++)
    c.push(a(e.child(d)));
  if (y.from(c).eq(n))
    return { mark: l, type: o };
}
function Th(n, e, t, r, i) {
  if (
    // The content must have shrunk
    t - e <= i.pos - r.pos || // newEnd must point directly at or after the end of the block that newStart points into
    xi(r, !0, !1) < i.pos
  )
    return !1;
  let s = n.resolve(e);
  if (!r.parent.isTextblock) {
    let l = s.nodeAfter;
    return l != null && t == e + l.nodeSize;
  }
  if (s.parentOffset < s.parent.content.size || !s.parent.isTextblock)
    return !1;
  let o = n.resolve(xi(s, !0, !0));
  return !o.parent.isTextblock || o.pos > t || xi(o, !0, !1) < t ? !1 : r.parent.content.cut(r.parentOffset).eq(o.parent.content);
}
function xi(n, e, t) {
  let r = n.depth, i = e ? n.end() : n.pos;
  for (; r > 0 && (e || n.indexAfter(r) == n.node(r).childCount); )
    r--, i++, e = !1;
  if (t) {
    let s = n.node(r).maybeChild(n.indexAfter(r));
    for (; s && !s.isLeaf; )
      s = s.firstChild, i++;
  }
  return i;
}
function Nh(n, e, t, r, i) {
  let s = n.findDiffStart(e, t);
  if (s == null)
    return null;
  let { a: o, b: l } = n.findDiffEnd(e, t + n.size, t + e.size);
  if (i == "end") {
    let a = Math.max(0, s - Math.min(o, l));
    r -= o + a - s;
  }
  if (o < s && n.size < e.size) {
    let a = r <= s && r >= o ? s - r : 0;
    s -= a, s && s < e.size && Zo(e.textBetween(s - 1, s + 1)) && (s += a ? 1 : -1), l = s + (l - o), o = s;
  } else if (l < s) {
    let a = r <= s && r >= l ? s - r : 0;
    s -= a, s && s < n.size && Zo(n.textBetween(s - 1, s + 1)) && (s += a ? 1 : -1), o = s + (o - l), l = s;
  }
  return { start: s, endA: o, endB: l };
}
function Zo(n) {
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
    this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new ju(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = t, this.state = t.state, this.directPlugins = t.plugins || [], this.directPlugins.forEach(il), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = nl(this), tl(this), this.nodeViews = rl(this), this.docView = _o(this.state.doc, el(this), Si(this), this.dom, this), this.domObserver = new yh(this, (r, i, s, o) => Eh(this, r, i, s, o)), this.domObserver.start(), Uu(this), this.updatePluginViews();
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
    this._props = e, e.plugins && (e.plugins.forEach(il), this.directPlugins = e.plugins), this.updateStateInner(e.state, t);
  }
  /**
  Update the view by updating existing props object with the object
  given as argument. Equivalent to `view.update(Object.assign({},
  view.props, props))`.
  */
  setProps(e) {
    let t = {};
    for (let r in this._props)
      t[r] = this._props[r];
    t.state = this.state;
    for (let r in e)
      t[r] = e[r];
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
    var r;
    let i = this.state, s = !1, o = !1;
    e.storedMarks && this.composing && (ec(this), o = !0), this.state = e;
    let l = i.plugins != e.plugins || this._props.plugins != t.plugins;
    if (l || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
      let p = rl(this);
      Lh(p, this.nodeViews) && (this.nodeViews = p, s = !0);
    }
    (l || t.handleDOMEvents != this._props.handleDOMEvents) && ns(this), this.editable = nl(this), tl(this);
    let a = Si(this), c = el(this), d = i.plugins != e.plugins && !i.doc.eq(e.doc) ? "reset" : e.scrollToSelection > i.scrollToSelection ? "to selection" : "preserve", u = s || !this.docView.matchesNode(e.doc, c, a);
    (u || !e.selection.eq(i.selection)) && (o = !0);
    let h = d == "preserve" && o && this.dom.style.overflowAnchor == null && ou(this);
    if (o) {
      this.domObserver.stop();
      let p = u && (pe || re) && !this.composing && !i.selection.empty && !e.selection.empty && Oh(i.selection, e.selection);
      if (u) {
        let f = re ? this.trackWrites = this.domSelectionRange().focusNode : null;
        this.composing && (this.input.compositionNode = oh(this)), (s || !this.docView.update(e.doc, c, a, this)) && (this.docView.updateOuterDeco(c), this.docView.destroy(), this.docView = _o(e.doc, c, a, this.dom, this)), f && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (p = !0);
      }
      p || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && Ou(this)) ? Ue(this, p) : (Va(this, e.selection), this.domObserver.setCurSelection()), this.domObserver.start();
    }
    this.updatePluginViews(i), !((r = this.dragging) === null || r === void 0) && r.node && !i.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, i), d == "reset" ? this.dom.scrollTop = 0 : d == "to selection" ? this.scrollToSelection() : h && lu(h);
  }
  /**
  @internal
  */
  scrollToSelection() {
    let e = this.domSelectionRange().focusNode;
    if (!(!e || !this.dom.contains(e.nodeType == 1 ? e : e.parentNode))) {
      if (!this.someProp("handleScrollToSelection", (t) => t(this))) if (this.state.selection instanceof A) {
        let t = this.docView.domAfterPos(this.state.selection.from);
        t.nodeType == 1 && To(this, t.getBoundingClientRect(), e);
      } else
        To(this, this.coordsAtPos(this.state.selection.head, 1), e);
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
        let r = this.directPlugins[t];
        r.spec.view && this.pluginViews.push(r.spec.view(this));
      }
      for (let t = 0; t < this.state.plugins.length; t++) {
        let r = this.state.plugins[t];
        r.spec.view && this.pluginViews.push(r.spec.view(this));
      }
    } else
      for (let t = 0; t < this.pluginViews.length; t++) {
        let r = this.pluginViews[t];
        r.update && r.update(this, e);
      }
  }
  updateDraggedNode(e, t) {
    let r = e.node, i = -1;
    if (this.state.doc.nodeAt(r.from) == r.node)
      i = r.from;
    else {
      let s = r.from + (this.state.doc.content.size - t.doc.content.size);
      (s > 0 && this.state.doc.nodeAt(s)) == r.node && (i = s);
    }
    this.dragging = new nc(e.slice, e.move, i < 0 ? void 0 : A.create(this.state.doc, i));
  }
  someProp(e, t) {
    let r = this._props && this._props[e], i;
    if (r != null && (i = t ? t(r) : r))
      return i;
    for (let o = 0; o < this.directPlugins.length; o++) {
      let l = this.directPlugins[o].props[e];
      if (l != null && (i = t ? t(l) : l))
        return i;
    }
    let s = this.state.plugins;
    if (s)
      for (let o = 0; o < s.length; o++) {
        let l = s[o].props[e];
        if (l != null && (i = t ? t(l) : l))
          return i;
      }
  }
  /**
  Query whether the view has focus.
  */
  hasFocus() {
    if (pe) {
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
    this.domObserver.stop(), this.editable && au(this.dom), Ue(this), this.domObserver.start();
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
    return pu(this, e);
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
    return _a(this, e, t);
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
  posAtDOM(e, t, r = -1) {
    let i = this.docView.posFromDOM(e, t, r);
    if (i == null)
      throw new RangeError("DOM position not inside the editor");
    return i;
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
    return Sn(this, "", e, !1, t || new ClipboardEvent("paste"));
  }
  /**
  Run the editor's paste logic with the given plain-text input.
  */
  pasteText(e, t) {
    return Sn(this, e, null, !0, t || new ClipboardEvent("paste"));
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
    this.docView && (Ku(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], Si(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, Yd());
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
    return e ? oe && this.root.nodeType === 11 && tu(this.dom.ownerDocument) == this.dom && wh(this, e) || e : { focusNode: null, focusOffset: 0, anchorNode: null, anchorOffset: 0 };
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
function el(n) {
  let e = /* @__PURE__ */ Object.create(null);
  return e.class = "ProseMirror", e.contenteditable = String(n.editable), n.someProp("attributes", (t) => {
    if (typeof t == "function" && (t = t(n.state)), t)
      for (let r in t)
        r == "class" ? e.class += " " + t[r] : r == "style" ? e.style = (e.style ? e.style + ";" : "") + t[r] : !e[r] && r != "contenteditable" && r != "nodeName" && (e[r] = String(t[r]));
  }), e.translate || (e.translate = "no"), [ie.node(0, n.state.doc.content.size, e)];
}
function tl(n) {
  if (n.markCursor) {
    let e = document.createElement("img");
    e.className = "ProseMirror-separator", e.setAttribute("mark-placeholder", "true"), e.setAttribute("alt", ""), n.cursorWrapper = { dom: e, deco: ie.widget(n.state.selection.from, e, { raw: !0, marks: n.markCursor }) };
  } else
    n.cursorWrapper = null;
}
function nl(n) {
  return !n.someProp("editable", (e) => e(n.state) === !1);
}
function Oh(n, e) {
  let t = Math.min(n.$anchor.sharedDepth(n.head), e.$anchor.sharedDepth(e.head));
  return n.$anchor.start(t) != e.$anchor.start(t);
}
function rl(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(r) {
    for (let i in r)
      Object.prototype.hasOwnProperty.call(e, i) || (e[i] = r[i]);
  }
  return n.someProp("nodeViews", t), n.someProp("markViews", t), e;
}
function Lh(n, e) {
  let t = 0, r = 0;
  for (let i in n) {
    if (n[i] != e[i])
      return !0;
    t++;
  }
  for (let i in e)
    r++;
  return t != r;
}
function il(n) {
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
}, gr = {
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
}, Rh = typeof navigator < "u" && /Mac/.test(navigator.platform), Ih = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var ne = 0; ne < 10; ne++) ct[48 + ne] = ct[96 + ne] = String(ne);
for (var ne = 1; ne <= 24; ne++) ct[ne + 111] = "F" + ne;
for (var ne = 65; ne <= 90; ne++)
  ct[ne] = String.fromCharCode(ne + 32), gr[ne] = String.fromCharCode(ne);
for (var vi in ct) gr.hasOwnProperty(vi) || (gr[vi] = ct[vi]);
function _h(n) {
  var e = Rh && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || Ih && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? gr : ct)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
const Dh = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), Ph = typeof navigator < "u" && /Win/.test(navigator.platform);
function Bh(n) {
  let e = n.split(/-(?!$)/), t = e[e.length - 1];
  t == "Space" && (t = " ");
  let r, i, s, o;
  for (let l = 0; l < e.length - 1; l++) {
    let a = e[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      i = !0;
    else if (/^s(hift)?$/i.test(a))
      s = !0;
    else if (/^mod$/i.test(a))
      Dh ? o = !0 : i = !0;
    else
      throw new Error("Unrecognized modifier name: " + a);
  }
  return r && (t = "Alt-" + t), i && (t = "Ctrl-" + t), o && (t = "Meta-" + t), s && (t = "Shift-" + t), t;
}
function Hh(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n)
    e[Bh(t)] = n[t];
  return e;
}
function Mi(n, e, t = !0) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t && e.shiftKey && (n = "Shift-" + n), n;
}
function zh(n) {
  return new j({ props: { handleKeyDown: Bs(n) } });
}
function Bs(n) {
  let e = Hh(n);
  return function(t, r) {
    let i = _h(r), s, o = e[Mi(i, r)];
    if (o && o(t.state, t.dispatch, t))
      return !0;
    if (i.length == 1 && i != " ") {
      if (r.shiftKey) {
        let l = e[Mi(i, r, !1)];
        if (l && l(t.state, t.dispatch, t))
          return !0;
      }
      if ((r.altKey || r.metaKey || r.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(Ph && r.ctrlKey && r.altKey) && (s = ct[r.keyCode]) && s != i) {
        let l = e[Mi(s, r)];
        if (l && l(t.state, t.dispatch, t))
          return !0;
      }
    }
    return !1;
  };
}
const Hs = (n, e) => n.selection.empty ? !1 : (e && e(n.tr.deleteSelection().scrollIntoView()), !0);
function ac(n, e) {
  let { $cursor: t } = n.selection;
  return !t || (e ? !e.endOfTextblock("backward", n) : t.parentOffset > 0) ? null : t;
}
const cc = (n, e, t) => {
  let r = ac(n, t);
  if (!r)
    return !1;
  let i = zs(r);
  if (!i) {
    let o = r.blockRange(), l = o && Gt(o);
    return l == null ? !1 : (e && e(n.tr.lift(o, l).scrollIntoView()), !0);
  }
  let s = i.nodeBefore;
  if (yc(n, i, e, -1))
    return !0;
  if (r.parent.content.size == 0 && (Jt(s, "end") || A.isSelectable(s)))
    for (let o = r.depth; ; o--) {
      let l = Gr(n.doc, r.before(o), r.after(o), x.empty);
      if (l && l.slice.size < l.to - l.from) {
        if (e) {
          let a = n.tr.step(l);
          a.setSelection(Jt(s, "end") ? N.findFrom(a.doc.resolve(a.mapping.map(i.pos, -1)), -1) : A.create(a.doc, i.pos - s.nodeSize)), e(a.scrollIntoView());
        }
        return !0;
      }
      if (o == 1 || r.node(o - 1).childCount > 1)
        break;
    }
  return s.isAtom && i.depth == r.depth - 1 ? (e && e(n.tr.delete(i.pos - s.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, $h = (n, e, t) => {
  let r = ac(n, t);
  if (!r)
    return !1;
  let i = zs(r);
  return i ? dc(n, i, e) : !1;
}, Fh = (n, e, t) => {
  let r = hc(n, t);
  if (!r)
    return !1;
  let i = $s(r);
  return i ? dc(n, i, e) : !1;
};
function dc(n, e, t) {
  let r = e.nodeBefore, i = r, s = e.pos - 1;
  for (; !i.isTextblock; s--) {
    if (i.type.spec.isolating)
      return !1;
    let d = i.lastChild;
    if (!d)
      return !1;
    i = d;
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
  let c = Gr(n.doc, s, a, x.empty);
  if (!c || c.from != s || c instanceof G && c.slice.size >= a - s)
    return !1;
  if (t) {
    let d = n.tr.step(c);
    d.setSelection(T.create(d.doc, s)), t(d.scrollIntoView());
  }
  return !0;
}
function Jt(n, e, t = !1) {
  for (let r = n; r; r = e == "start" ? r.firstChild : r.lastChild) {
    if (r.isTextblock)
      return !0;
    if (t && r.childCount != 1)
      return !1;
  }
  return !1;
}
const uc = (n, e, t) => {
  let { $head: r, empty: i } = n.selection, s = r;
  if (!i)
    return !1;
  if (r.parent.isTextblock) {
    if (t ? !t.endOfTextblock("backward", n) : r.parentOffset > 0)
      return !1;
    s = zs(r);
  }
  let o = s && s.nodeBefore;
  return !o || !A.isSelectable(o) ? !1 : (e && e(n.tr.setSelection(A.create(n.doc, s.pos - o.nodeSize)).scrollIntoView()), !0);
};
function zs(n) {
  if (!n.parent.type.spec.isolating)
    for (let e = n.depth - 1; e >= 0; e--) {
      if (n.index(e) > 0)
        return n.doc.resolve(n.before(e + 1));
      if (n.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function hc(n, e) {
  let { $cursor: t } = n.selection;
  return !t || (e ? !e.endOfTextblock("forward", n) : t.parentOffset < t.parent.content.size) ? null : t;
}
const pc = (n, e, t) => {
  let r = hc(n, t);
  if (!r)
    return !1;
  let i = $s(r);
  if (!i)
    return !1;
  let s = i.nodeAfter;
  if (yc(n, i, e, 1))
    return !0;
  if (r.parent.content.size == 0 && (Jt(s, "start") || A.isSelectable(s))) {
    let o = Gr(n.doc, r.before(), r.after(), x.empty);
    if (o && o.slice.size < o.to - o.from) {
      if (e) {
        let l = n.tr.step(o);
        l.setSelection(Jt(s, "start") ? N.findFrom(l.doc.resolve(l.mapping.map(i.pos)), 1) : A.create(l.doc, l.mapping.map(i.pos))), e(l.scrollIntoView());
      }
      return !0;
    }
  }
  return s.isAtom && i.depth == r.depth - 1 ? (e && e(n.tr.delete(i.pos, i.pos + s.nodeSize).scrollIntoView()), !0) : !1;
}, fc = (n, e, t) => {
  let { $head: r, empty: i } = n.selection, s = r;
  if (!i)
    return !1;
  if (r.parent.isTextblock) {
    if (t ? !t.endOfTextblock("forward", n) : r.parentOffset < r.parent.content.size)
      return !1;
    s = $s(r);
  }
  let o = s && s.nodeAfter;
  return !o || !A.isSelectable(o) ? !1 : (e && e(n.tr.setSelection(A.create(n.doc, s.pos)).scrollIntoView()), !0);
};
function $s(n) {
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
const Vh = (n, e) => {
  let t = n.selection, r = t instanceof A, i;
  if (r) {
    if (t.node.isTextblock || !ut(n.doc, t.from))
      return !1;
    i = t.from;
  } else if (i = Jr(n.doc, t.from, -1), i == null)
    return !1;
  if (e) {
    let s = n.tr.join(i);
    r && s.setSelection(A.create(s.doc, i - n.doc.resolve(i).nodeBefore.nodeSize)), e(s.scrollIntoView());
  }
  return !0;
}, qh = (n, e) => {
  let t = n.selection, r;
  if (t instanceof A) {
    if (t.node.isTextblock || !ut(n.doc, t.to))
      return !1;
    r = t.to;
  } else if (r = Jr(n.doc, t.to, 1), r == null)
    return !1;
  return e && e(n.tr.join(r).scrollIntoView()), !0;
}, Wh = (n, e) => {
  let { $from: t, $to: r } = n.selection, i = t.blockRange(r), s = i && Gt(i);
  return s == null ? !1 : (e && e(n.tr.lift(i, s).scrollIntoView()), !0);
}, mc = (n, e) => {
  let { $head: t, $anchor: r } = n.selection;
  return !t.parent.type.spec.code || !t.sameParent(r) ? !1 : (e && e(n.tr.insertText(`
`).scrollIntoView()), !0);
};
function Fs(n) {
  for (let e = 0; e < n.edgeCount; e++) {
    let { type: t } = n.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
const jh = (n, e) => {
  let { $head: t, $anchor: r } = n.selection;
  if (!t.parent.type.spec.code || !t.sameParent(r))
    return !1;
  let i = t.node(-1), s = t.indexAfter(-1), o = Fs(i.contentMatchAt(s));
  if (!o || !i.canReplaceWith(s, s, o))
    return !1;
  if (e) {
    let l = t.after(), a = n.tr.replaceWith(l, l, o.createAndFill());
    a.setSelection(N.near(a.doc.resolve(l), 1)), e(a.scrollIntoView());
  }
  return !0;
}, gc = (n, e) => {
  let t = n.selection, { $from: r, $to: i } = t;
  if (t instanceof be || r.parent.inlineContent || i.parent.inlineContent)
    return !1;
  let s = Fs(i.parent.contentMatchAt(i.indexAfter()));
  if (!s || !s.isTextblock)
    return !1;
  if (e) {
    let o = (!r.parentOffset && i.index() < i.parent.childCount ? r : i).pos, l = n.tr.insert(o, s.createAndFill());
    l.setSelection(T.create(l.doc, o + 1)), e(l.scrollIntoView());
  }
  return !0;
}, bc = (n, e) => {
  let { $cursor: t } = n.selection;
  if (!t || t.parent.content.size)
    return !1;
  if (t.depth > 1 && t.after() != t.end(-1)) {
    let s = t.before();
    if (je(n.doc, s))
      return e && e(n.tr.split(s).scrollIntoView()), !0;
  }
  let r = t.blockRange(), i = r && Gt(r);
  return i == null ? !1 : (e && e(n.tr.lift(r, i).scrollIntoView()), !0);
};
function Uh(n) {
  return (e, t) => {
    let { $from: r, $to: i } = e.selection;
    if (e.selection instanceof A && e.selection.node.isBlock)
      return !r.parentOffset || !je(e.doc, r.pos) ? !1 : (t && t(e.tr.split(r.pos).scrollIntoView()), !0);
    if (!r.depth)
      return !1;
    let s = [], o, l, a = !1, c = !1;
    for (let p = r.depth; ; p--)
      if (r.node(p).isBlock) {
        a = r.end(p) == r.pos + (r.depth - p), c = r.start(p) == r.pos - (r.depth - p), l = Fs(r.node(p - 1).contentMatchAt(r.indexAfter(p - 1))), s.unshift(a && l ? { type: l } : null), o = p;
        break;
      } else {
        if (p == 1)
          return !1;
        s.unshift(null);
      }
    let d = e.tr;
    (e.selection instanceof T || e.selection instanceof be) && d.deleteSelection();
    let u = d.mapping.map(r.pos), h = je(d.doc, u, s.length, s);
    if (h || (s[0] = l ? { type: l } : null, h = je(d.doc, u, s.length, s)), !h)
      return !1;
    if (d.split(u, s.length, s), !a && c && r.node(o).type != l) {
      let p = d.mapping.map(r.before(o)), f = d.doc.resolve(p);
      l && r.node(o - 1).canReplaceWith(f.index(), f.index() + 1, l) && d.setNodeMarkup(d.mapping.map(r.before(o)), l);
    }
    return t && t(d.scrollIntoView()), !0;
  };
}
const Kh = Uh(), Jh = (n, e) => {
  let { $from: t, to: r } = n.selection, i, s = t.sharedDepth(r);
  return s == 0 ? !1 : (i = t.before(s), e && e(n.tr.setSelection(A.create(n.doc, i))), !0);
};
function Gh(n, e, t) {
  let r = e.nodeBefore, i = e.nodeAfter, s = e.index();
  return !r || !i || !r.type.compatibleContent(i.type) ? !1 : !r.content.size && e.parent.canReplace(s - 1, s) ? (t && t(n.tr.delete(e.pos - r.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(s, s + 1) || !(i.isTextblock || ut(n.doc, e.pos)) ? !1 : (t && t(n.tr.join(e.pos).scrollIntoView()), !0);
}
function yc(n, e, t, r) {
  let i = e.nodeBefore, s = e.nodeAfter, o, l, a = i.type.spec.isolating || s.type.spec.isolating;
  if (!a && Gh(n, e, t))
    return !0;
  let c = !a && e.parent.canReplace(e.index(), e.index() + 1);
  if (c && (o = (l = i.contentMatchAt(i.childCount)).findWrapping(s.type)) && l.matchType(o[0] || s.type).validEnd) {
    if (t) {
      let p = e.pos + s.nodeSize, f = y.empty;
      for (let b = o.length - 1; b >= 0; b--)
        f = y.from(o[b].create(null, f));
      f = y.from(i.copy(f));
      let m = n.tr.step(new Y(e.pos - 1, p, e.pos, p, new x(f, 1, 0), o.length, !0)), g = m.doc.resolve(p + 2 * o.length);
      g.nodeAfter && g.nodeAfter.type == i.type && ut(m.doc, g.pos) && m.join(g.pos), t(m.scrollIntoView());
    }
    return !0;
  }
  let d = s.type.spec.isolating || r > 0 && a ? null : N.findFrom(e, 1), u = d && d.$from.blockRange(d.$to), h = u && Gt(u);
  if (h != null && h >= e.depth)
    return t && t(n.tr.lift(u, h).scrollIntoView()), !0;
  if (c && Jt(s, "start", !0) && Jt(i, "end")) {
    let p = i, f = [];
    for (; f.push(p), !p.isTextblock; )
      p = p.lastChild;
    let m = s, g = 1;
    for (; !m.isTextblock; m = m.firstChild)
      g++;
    if (p.canReplace(p.childCount, p.childCount, m.content)) {
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
    let r = e.selection, i = n < 0 ? r.$from : r.$to, s = i.depth;
    for (; i.node(s).isInline; ) {
      if (!s)
        return !1;
      s--;
    }
    return i.node(s).isTextblock ? (t && t(e.tr.setSelection(T.create(e.doc, n < 0 ? i.start(s) : i.end(s)))), !0) : !1;
  };
}
const Yh = kc(-1), Xh = kc(1);
function Qh(n, e = null) {
  return function(t, r) {
    let { $from: i, $to: s } = t.selection, o = i.blockRange(s), l = o && Ms(o, n, e);
    return l ? (r && r(t.tr.wrap(o, l).scrollIntoView()), !0) : !1;
  };
}
function sl(n, e = null) {
  return function(t, r) {
    let i = !1;
    for (let s = 0; s < t.selection.ranges.length && !i; s++) {
      let { $from: { pos: o }, $to: { pos: l } } = t.selection.ranges[s];
      t.doc.nodesBetween(o, l, (a, c) => {
        if (i)
          return !1;
        if (!(!a.isTextblock || a.hasMarkup(n, e)))
          if (a.type == n)
            i = !0;
          else {
            let d = t.doc.resolve(c), u = d.index();
            i = d.parent.canReplaceWith(u, u + 1, n);
          }
      });
    }
    if (!i)
      return !1;
    if (r) {
      let s = t.tr;
      for (let o = 0; o < t.selection.ranges.length; o++) {
        let { $from: { pos: l }, $to: { pos: a } } = t.selection.ranges[o];
        s.setBlockType(l, a, n, e);
      }
      r(s.scrollIntoView());
    }
    return !0;
  };
}
function Vs(...n) {
  return function(e, t, r) {
    for (let i = 0; i < n.length; i++)
      if (n[i](e, t, r))
        return !0;
    return !1;
  };
}
Vs(Hs, cc, uc);
Vs(Hs, pc, fc);
Vs(mc, gc, bc, Kh);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function Zh(n, e = null) {
  return function(t, r) {
    let { $from: i, $to: s } = t.selection, o = i.blockRange(s);
    if (!o)
      return !1;
    let l = r ? t.tr : null;
    return ep(l, o, n, e) ? (r && r(l.scrollIntoView()), !0) : !1;
  };
}
function ep(n, e, t, r = null) {
  let i = !1, s = e, o = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(t) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let a = o.resolve(e.start - 2);
    s = new cr(a, a, e.depth), e.endIndex < e.parent.childCount && (e = new cr(e.$from, o.resolve(e.$to.end(e.depth)), e.depth)), i = !0;
  }
  let l = Ms(s, t, r, e);
  return l ? (n && tp(n, e, l, i, t), !0) : !1;
}
function tp(n, e, t, r, i) {
  let s = y.empty;
  for (let d = t.length - 1; d >= 0; d--)
    s = y.from(t[d].type.create(t[d].attrs, s));
  n.step(new Y(e.start - (r ? 2 : 0), e.end, e.start, e.end, new x(s, 0, 0), t.length, !0));
  let o = 0;
  for (let d = 0; d < t.length; d++)
    t[d].type == i && (o = d + 1);
  let l = t.length - o, a = e.start + t.length - (r ? 2 : 0), c = e.parent;
  for (let d = e.startIndex, u = e.endIndex, h = !0; d < u; d++, h = !1)
    !h && je(n.doc, a, l) && (n.split(a, l), a += 2 * l), a += c.child(d).nodeSize;
  return n;
}
function np(n) {
  return function(e, t) {
    let { $from: r, $to: i } = e.selection, s = r.blockRange(i, (o) => o.childCount > 0 && o.firstChild.type == n);
    return s ? t ? r.node(s.depth - 1).type == n ? rp(e, t, n, s) : ip(e, t, s) : !0 : !1;
  };
}
function rp(n, e, t, r) {
  let i = n.tr, s = r.end, o = r.$to.end(r.depth);
  s < o && (i.step(new Y(s - 1, o, s, o, new x(y.from(t.create(null, r.parent.copy())), 1, 0), 1, !0)), r = new cr(i.doc.resolve(r.$from.pos), i.doc.resolve(o), r.depth));
  const l = Gt(r);
  if (l == null)
    return !1;
  i.lift(r, l);
  let a = i.doc.resolve(i.mapping.map(s, -1) - 1);
  return ut(i.doc, a.pos) && a.nodeBefore.type == a.nodeAfter.type && i.join(a.pos), e(i.scrollIntoView()), !0;
}
function ip(n, e, t) {
  let r = n.tr, i = t.parent;
  for (let p = t.end, f = t.endIndex - 1, m = t.startIndex; f > m; f--)
    p -= i.child(f).nodeSize, r.delete(p - 1, p + 1);
  let s = r.doc.resolve(t.start), o = s.nodeAfter;
  if (r.mapping.map(t.end) != t.start + s.nodeAfter.nodeSize)
    return !1;
  let l = t.startIndex == 0, a = t.endIndex == i.childCount, c = s.node(-1), d = s.index(-1);
  if (!c.canReplace(d + (l ? 0 : 1), d + 1, o.content.append(a ? y.empty : y.from(i))))
    return !1;
  let u = s.pos, h = u + o.nodeSize;
  return r.step(new Y(u - (l ? 1 : 0), h + (a ? 1 : 0), u + 1, h - 1, new x((l ? y.empty : y.from(i.copy(y.empty))).append(a ? y.empty : y.from(i.copy(y.empty))), l ? 0 : 1, a ? 0 : 1), l ? 0 : 1)), e(r.scrollIntoView()), !0;
}
function sp(n) {
  return function(e, t) {
    let { $from: r, $to: i } = e.selection, s = r.blockRange(i, (c) => c.childCount > 0 && c.firstChild.type == n);
    if (!s)
      return !1;
    let o = s.startIndex;
    if (o == 0)
      return !1;
    let l = s.parent, a = l.child(o - 1);
    if (a.type != n)
      return !1;
    if (t) {
      let c = a.lastChild && a.lastChild.type == l.type, d = y.from(c ? n.create() : null), u = new x(y.from(n.create(null, y.from(l.type.create(null, d)))), c ? 3 : 1, 0), h = s.start, p = s.end;
      t(e.tr.step(new Y(h - (c ? 3 : 1), p, h, p, u, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function ei(n) {
  const { state: e, transaction: t } = n;
  let { selection: r } = t, { doc: i } = t, { storedMarks: s } = t;
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
      return r;
    },
    get doc() {
      return i;
    },
    get tr() {
      return r = t.selection, i = t.doc, s = t.storedMarks, t;
    }
  };
}
class ti {
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
    const { rawCommands: e, editor: t, state: r } = this, { view: i } = t, { tr: s } = r, o = this.buildProps(s);
    return Object.fromEntries(Object.entries(e).map(([l, a]) => [l, (...d) => {
      const u = a(...d)(o);
      return !s.getMeta("preventDispatch") && !this.hasCustomState && i.dispatch(s), u;
    }]));
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(e, t = !0) {
    const { rawCommands: r, editor: i, state: s } = this, { view: o } = i, l = [], a = !!e, c = e || s.tr, d = () => (!a && t && !c.getMeta("preventDispatch") && !this.hasCustomState && o.dispatch(c), l.every((h) => h === !0)), u = {
      ...Object.fromEntries(Object.entries(r).map(([h, p]) => [h, (...m) => {
        const g = this.buildProps(c, t), b = p(...m)(g);
        return l.push(b), u;
      }])),
      run: d
    };
    return u;
  }
  createCan(e) {
    const { rawCommands: t, state: r } = this, i = !1, s = e || r.tr, o = this.buildProps(s, i);
    return {
      ...Object.fromEntries(Object.entries(t).map(([a, c]) => [a, (...d) => c(...d)({ ...o, dispatch: void 0 })])),
      chain: () => this.createChain(s, i)
    };
  }
  buildProps(e, t = !0) {
    const { rawCommands: r, editor: i, state: s } = this, { view: o } = i, l = {
      tr: e,
      editor: i,
      view: o,
      state: ei({
        state: s,
        transaction: e
      }),
      dispatch: t ? () => {
      } : void 0,
      chain: () => this.createChain(e, t),
      can: () => this.createCan(e),
      get commands() {
        return Object.fromEntries(Object.entries(r).map(([a, c]) => [a, (...d) => c(...d)(l)]));
      }
    };
    return l;
  }
}
class op {
  constructor() {
    this.callbacks = {};
  }
  on(e, t) {
    return this.callbacks[e] || (this.callbacks[e] = []), this.callbacks[e].push(t), this;
  }
  emit(e, ...t) {
    const r = this.callbacks[e];
    return r && r.forEach((i) => i.apply(this, t)), this;
  }
  off(e, t) {
    const r = this.callbacks[e];
    return r && (t ? this.callbacks[e] = r.filter((i) => i !== t) : delete this.callbacks[e]), this;
  }
  once(e, t) {
    const r = (...i) => {
      this.off(e, r), t.apply(this, i);
    };
    return this.on(e, r);
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
function ni(n) {
  const e = n.filter((i) => i.type === "extension"), t = n.filter((i) => i.type === "node"), r = n.filter((i) => i.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: r
  };
}
function wc(n) {
  const e = [], { nodeExtensions: t, markExtensions: r } = ni(n), i = [...t, ...r], s = {
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
      extensions: i
    }, a = E(o, "addGlobalAttributes", l);
    if (!a)
      return;
    a().forEach((d) => {
      d.types.forEach((u) => {
        Object.entries(d.attributes).forEach(([h, p]) => {
          e.push({
            type: u,
            name: h,
            attribute: {
              ...s,
              ...p
            }
          });
        });
      });
    });
  }), i.forEach((o) => {
    const l = {
      name: o.name,
      options: o.options,
      storage: o.storage
    }, a = E(o, "addAttributes", l);
    if (!a)
      return;
    const c = a();
    Object.entries(c).forEach(([d, u]) => {
      const h = {
        ...s,
        ...u
      };
      typeof (h == null ? void 0 : h.default) == "function" && (h.default = h.default()), h != null && h.isRequired && (h == null ? void 0 : h.default) === void 0 && delete h.default, e.push({
        type: o.name,
        name: d,
        attribute: h
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
function _(...n) {
  return n.filter((e) => !!e).reduce((e, t) => {
    const r = { ...e };
    return Object.entries(t).forEach(([i, s]) => {
      if (!r[i]) {
        r[i] = s;
        return;
      }
      if (i === "class") {
        const l = s ? String(s).split(" ") : [], a = r[i] ? r[i].split(" ") : [], c = l.filter((d) => !a.includes(d));
        r[i] = [...a, ...c].join(" ");
      } else if (i === "style") {
        const l = s ? s.split(";").map((d) => d.trim()).filter(Boolean) : [], a = r[i] ? r[i].split(";").map((d) => d.trim()).filter(Boolean) : [], c = /* @__PURE__ */ new Map();
        a.forEach((d) => {
          const [u, h] = d.split(":").map((p) => p.trim());
          c.set(u, h);
        }), l.forEach((d) => {
          const [u, h] = d.split(":").map((p) => p.trim());
          c.set(u, h);
        }), r[i] = Array.from(c.entries()).map(([d, u]) => `${d}: ${u}`).join("; ");
      } else
        r[i] = s;
    }), r;
  }, {});
}
function rs(n, e) {
  return e.filter((t) => t.type === n.type.name).filter((t) => t.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(n.attrs) || {} : {
    [t.name]: n.attrs[t.name]
  }).reduce((t, r) => _(t, r), {});
}
function Cc(n) {
  return typeof n == "function";
}
function I(n, e = void 0, ...t) {
  return Cc(n) ? e ? n.bind(e)(...t) : n(...t) : n;
}
function lp(n = {}) {
  return Object.keys(n).length === 0 && n.constructor === Object;
}
function ap(n) {
  return typeof n != "string" ? n : n.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(n) : n === "true" ? !0 : n === "false" ? !1 : n;
}
function ol(n, e) {
  return "style" in n ? n : {
    ...n,
    getAttrs: (t) => {
      const r = n.getAttrs ? n.getAttrs(t) : n.attrs;
      if (r === !1)
        return !1;
      const i = e.reduce((s, o) => {
        const l = o.attribute.parseHTML ? o.attribute.parseHTML(t) : ap(t.getAttribute(o.name));
        return l == null ? s : {
          ...s,
          [o.name]: l
        };
      }, {});
      return { ...r, ...i };
    }
  };
}
function ll(n) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(n).filter(([e, t]) => e === "attrs" && lp(t) ? !1 : t != null)
  );
}
function cp(n, e) {
  var t;
  const r = wc(n), { nodeExtensions: i, markExtensions: s } = ni(n), o = (t = i.find((c) => E(c, "topNode"))) === null || t === void 0 ? void 0 : t.name, l = Object.fromEntries(i.map((c) => {
    const d = r.filter((b) => b.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: e
    }, h = n.reduce((b, k) => {
      const w = E(k, "extendNodeSchema", u);
      return {
        ...b,
        ...w ? w(c) : {}
      };
    }, {}), p = ll({
      ...h,
      content: I(E(c, "content", u)),
      marks: I(E(c, "marks", u)),
      group: I(E(c, "group", u)),
      inline: I(E(c, "inline", u)),
      atom: I(E(c, "atom", u)),
      selectable: I(E(c, "selectable", u)),
      draggable: I(E(c, "draggable", u)),
      code: I(E(c, "code", u)),
      whitespace: I(E(c, "whitespace", u)),
      linebreakReplacement: I(E(c, "linebreakReplacement", u)),
      defining: I(E(c, "defining", u)),
      isolating: I(E(c, "isolating", u)),
      attrs: Object.fromEntries(d.map((b) => {
        var k;
        return [b.name, { default: (k = b == null ? void 0 : b.attribute) === null || k === void 0 ? void 0 : k.default }];
      }))
    }), f = I(E(c, "parseHTML", u));
    f && (p.parseDOM = f.map((b) => ol(b, d)));
    const m = E(c, "renderHTML", u);
    m && (p.toDOM = (b) => m({
      node: b,
      HTMLAttributes: rs(b, d)
    }));
    const g = E(c, "renderText", u);
    return g && (p.toText = g), [c.name, p];
  })), a = Object.fromEntries(s.map((c) => {
    const d = r.filter((g) => g.type === c.name), u = {
      name: c.name,
      options: c.options,
      storage: c.storage,
      editor: e
    }, h = n.reduce((g, b) => {
      const k = E(b, "extendMarkSchema", u);
      return {
        ...g,
        ...k ? k(c) : {}
      };
    }, {}), p = ll({
      ...h,
      inclusive: I(E(c, "inclusive", u)),
      excludes: I(E(c, "excludes", u)),
      group: I(E(c, "group", u)),
      spanning: I(E(c, "spanning", u)),
      code: I(E(c, "code", u)),
      attrs: Object.fromEntries(d.map((g) => {
        var b;
        return [g.name, { default: (b = g == null ? void 0 : g.attribute) === null || b === void 0 ? void 0 : b.default }];
      }))
    }), f = I(E(c, "parseHTML", u));
    f && (p.parseDOM = f.map((g) => ol(g, d)));
    const m = E(c, "renderHTML", u);
    return m && (p.toDOM = (g) => m({
      mark: g,
      HTMLAttributes: rs(g, d)
    })), [c.name, p];
  }));
  return new aa({
    topNode: o,
    nodes: l,
    marks: a
  });
}
function Ei(n, e) {
  return e.nodes[n] || e.marks[n] || null;
}
function al(n, e) {
  return Array.isArray(e) ? e.some((t) => (typeof t == "string" ? t : t.name) === n.name) : e;
}
function qs(n, e) {
  const t = _t.fromSchema(e).serializeFragment(n), i = document.implementation.createHTMLDocument().createElement("div");
  return i.appendChild(t), i.innerHTML;
}
const dp = (n, e = 500) => {
  let t = "";
  const r = n.parentOffset;
  return n.parent.nodesBetween(Math.max(0, r - e), r, (i, s, o, l) => {
    var a, c;
    const d = ((c = (a = i.type.spec).toText) === null || c === void 0 ? void 0 : c.call(a, {
      node: i,
      pos: s,
      parent: o,
      index: l
    })) || i.textContent || "%leaf%";
    t += i.isAtom && !i.isText ? d : d.slice(0, Math.max(0, r - s));
  }), t;
};
function Ws(n) {
  return Object.prototype.toString.call(n) === "[object RegExp]";
}
class ri {
  constructor(e) {
    this.find = e.find, this.handler = e.handler;
  }
}
const up = (n, e) => {
  if (Ws(e))
    return e.exec(n);
  const t = e(n);
  if (!t)
    return null;
  const r = [t.text];
  return r.index = t.index, r.input = n, r.data = t.data, t.replaceWith && (t.text.includes(t.replaceWith) || console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".'), r.push(t.replaceWith)), r;
};
function Hn(n) {
  var e;
  const { editor: t, from: r, to: i, text: s, rules: o, plugin: l } = n, { view: a } = t;
  if (a.composing)
    return !1;
  const c = a.state.doc.resolve(r);
  if (
    // check for code node
    c.parent.type.spec.code || !((e = c.nodeBefore || c.nodeAfter) === null || e === void 0) && e.marks.find((h) => h.type.spec.code)
  )
    return !1;
  let d = !1;
  const u = dp(c) + s;
  return o.forEach((h) => {
    if (d)
      return;
    const p = up(u, h.find);
    if (!p)
      return;
    const f = a.state.tr, m = ei({
      state: a.state,
      transaction: f
    }), g = {
      from: r - (p[0].length - s.length),
      to: i
    }, { commands: b, chain: k, can: w } = new ti({
      editor: t,
      state: m
    });
    h.handler({
      state: m,
      range: g,
      match: p,
      commands: b,
      chain: k,
      can: w
    }) === null || !f.steps.length || (f.setMeta(l, {
      transform: f,
      from: r,
      to: i,
      text: s
    }), a.dispatch(f), d = !0);
  }), d;
}
function hp(n) {
  const { editor: e, rules: t } = n, r = new j({
    state: {
      init() {
        return null;
      },
      apply(i, s, o) {
        const l = i.getMeta(r);
        if (l)
          return l;
        const a = i.getMeta("applyInputRules");
        return !!a && setTimeout(() => {
          let { text: d } = a;
          typeof d == "string" ? d = d : d = qs(y.from(d), o.schema);
          const { from: u } = a, h = u + d.length;
          Hn({
            editor: e,
            from: u,
            to: h,
            text: d,
            rules: t,
            plugin: r
          });
        }), i.selectionSet || i.docChanged ? null : s;
      }
    },
    props: {
      handleTextInput(i, s, o, l) {
        return Hn({
          editor: e,
          from: s,
          to: o,
          text: l,
          rules: t,
          plugin: r
        });
      },
      handleDOMEvents: {
        compositionend: (i) => (setTimeout(() => {
          const { $cursor: s } = i.state.selection;
          s && Hn({
            editor: e,
            from: s.pos,
            to: s.pos,
            text: "",
            rules: t,
            plugin: r
          });
        }), !1)
      },
      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(i, s) {
        if (s.key !== "Enter")
          return !1;
        const { $cursor: o } = i.state.selection;
        return o ? Hn({
          editor: e,
          from: o.pos,
          to: o.pos,
          text: `
`,
          rules: t,
          plugin: r
        }) : !1;
      }
    },
    // @ts-ignore
    isInputRules: !0
  });
  return r;
}
function pp(n) {
  return Object.prototype.toString.call(n).slice(8, -1);
}
function zn(n) {
  return pp(n) !== "Object" ? !1 : n.constructor === Object && Object.getPrototypeOf(n) === Object.prototype;
}
function ii(n, e) {
  const t = { ...n };
  return zn(n) && zn(e) && Object.keys(e).forEach((r) => {
    zn(e[r]) && zn(n[r]) ? t[r] = ii(n[r], e[r]) : t[r] = e[r];
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
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = I(E(this, "addOptions", {
      name: this.name
    }))), this.storage = I(E(this, "addStorage", {
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
      addOptions: () => ii(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new fe(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = I(E(t, "addOptions", {
      name: t.name
    })), t.storage = I(E(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
  static handleExit({ editor: e, mark: t }) {
    const { tr: r } = e.state, i = e.state.selection.$from;
    if (i.pos === i.end()) {
      const o = i.marks();
      if (!!!o.find((c) => (c == null ? void 0 : c.type.name) === t.name))
        return !1;
      const a = o.find((c) => (c == null ? void 0 : c.type.name) === t.name);
      return a && r.removeStoredMark(a), r.insertText(" ", i.pos), e.view.dispatch(r), !0;
    }
    return !1;
  }
}
function fp(n) {
  return typeof n == "number";
}
class mp {
  constructor(e) {
    this.find = e.find, this.handler = e.handler;
  }
}
const gp = (n, e, t) => {
  if (Ws(e))
    return [...n.matchAll(e)];
  const r = e(n, t);
  return r ? r.map((i) => {
    const s = [i.text];
    return s.index = i.index, s.input = n, s.data = i.data, i.replaceWith && (i.text.includes(i.replaceWith) || console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".'), s.push(i.replaceWith)), s;
  }) : [];
};
function bp(n) {
  const { editor: e, state: t, from: r, to: i, rule: s, pasteEvent: o, dropEvent: l } = n, { commands: a, chain: c, can: d } = new ti({
    editor: e,
    state: t
  }), u = [];
  return t.doc.nodesBetween(r, i, (p, f) => {
    if (!p.isTextblock || p.type.spec.code)
      return;
    const m = Math.max(r, f), g = Math.min(i, f + p.content.size), b = p.textBetween(m - f, g - f, void 0, "￼");
    gp(b, s.find, o).forEach((w) => {
      if (w.index === void 0)
        return;
      const v = m + w.index + 1, S = v + w[0].length, L = {
        from: t.tr.mapping.map(v),
        to: t.tr.mapping.map(S)
      }, M = s.handler({
        state: t,
        range: L,
        match: w,
        commands: a,
        chain: c,
        can: d,
        pasteEvent: o,
        dropEvent: l
      });
      u.push(M);
    });
  }), u.every((p) => p !== null);
}
let $n = null;
const yp = (n) => {
  var e;
  const t = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  return (e = t.clipboardData) === null || e === void 0 || e.setData("text/html", n), t;
};
function kp(n) {
  const { editor: e, rules: t } = n;
  let r = null, i = !1, s = !1, o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, l;
  try {
    l = typeof DragEvent < "u" ? new DragEvent("drop") : null;
  } catch {
    l = null;
  }
  const a = ({ state: d, from: u, to: h, rule: p, pasteEvt: f }) => {
    const m = d.tr, g = ei({
      state: d,
      transaction: m
    });
    if (!(!bp({
      editor: e,
      state: g,
      from: Math.max(u - 1, 0),
      to: h.b - 1,
      rule: p,
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
  return t.map((d) => new j({
    // we register a global drag handler to track the current drag source element
    view(u) {
      const h = (f) => {
        var m;
        r = !((m = u.dom.parentElement) === null || m === void 0) && m.contains(f.target) ? u.dom.parentElement : null, r && ($n = e);
      }, p = () => {
        $n && ($n = null);
      };
      return window.addEventListener("dragstart", h), window.addEventListener("dragend", p), {
        destroy() {
          window.removeEventListener("dragstart", h), window.removeEventListener("dragend", p);
        }
      };
    },
    props: {
      handleDOMEvents: {
        drop: (u, h) => {
          if (s = r === u.dom.parentElement, l = h, !s) {
            const p = $n;
            p != null && p.isEditable && setTimeout(() => {
              const f = p.state.selection;
              f && p.commands.deleteRange({ from: f.from, to: f.to });
            }, 10);
          }
          return !1;
        },
        paste: (u, h) => {
          var p;
          const f = (p = h.clipboardData) === null || p === void 0 ? void 0 : p.getData("text/html");
          return o = h, i = !!(f != null && f.includes("data-pm-slice")), !1;
        }
      }
    },
    appendTransaction: (u, h, p) => {
      const f = u[0], m = f.getMeta("uiEvent") === "paste" && !i, g = f.getMeta("uiEvent") === "drop" && !s, b = f.getMeta("applyPasteRules"), k = !!b;
      if (!m && !g && !k)
        return;
      if (k) {
        let { text: S } = b;
        typeof S == "string" ? S = S : S = qs(y.from(S), p.schema);
        const { from: L } = b, M = L + S.length, O = yp(S);
        return a({
          rule: d,
          state: p,
          from: L,
          to: { b: M },
          pasteEvt: O
        });
      }
      const w = h.doc.content.findDiffStart(p.doc.content), v = h.doc.content.findDiffEnd(p.doc.content);
      if (!(!fp(w) || !v || w === v.b))
        return a({
          rule: d,
          state: p,
          from: w,
          to: v,
          pasteEvt: o
        });
    }
  }));
}
function wp(n) {
  const e = n.filter((t, r) => n.indexOf(t) !== r);
  return Array.from(new Set(e));
}
class Vt {
  constructor(e, t) {
    this.splittableMarks = [], this.editor = t, this.extensions = Vt.resolve(e), this.schema = cp(this.extensions, t), this.setupExtensions();
  }
  /**
   * Returns a flattened and sorted extension list while
   * also checking for duplicated extensions and warns the user.
   * @param extensions An array of Tiptap extensions
   * @returns An flattened and sorted array of Tiptap extensions
   */
  static resolve(e) {
    const t = Vt.sort(Vt.flatten(e)), r = wp(t.map((i) => i.name));
    return r.length && console.warn(`[tiptap warn]: Duplicate extension names found: [${r.map((i) => `'${i}'`).join(", ")}]. This can lead to issues.`), t;
  }
  /**
   * Create a flattened array of extensions by traversing the `addExtensions` field.
   * @param extensions An array of Tiptap extensions
   * @returns A flattened array of Tiptap extensions
   */
  static flatten(e) {
    return e.map((t) => {
      const r = {
        name: t.name,
        options: t.options,
        storage: t.storage
      }, i = E(t, "addExtensions", r);
      return i ? [t, ...this.flatten(i())] : t;
    }).flat(10);
  }
  /**
   * Sort extensions by priority.
   * @param extensions An array of Tiptap extensions
   * @returns A sorted array of Tiptap extensions by priority
   */
  static sort(e) {
    return e.sort((r, i) => {
      const s = E(r, "priority") || 100, o = E(i, "priority") || 100;
      return s > o ? -1 : s < o ? 1 : 0;
    });
  }
  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
  get commands() {
    return this.extensions.reduce((e, t) => {
      const r = {
        name: t.name,
        options: t.options,
        storage: t.storage,
        editor: this.editor,
        type: Ei(t.name, this.schema)
      }, i = E(t, "addCommands", r);
      return i ? {
        ...e,
        ...i()
      } : e;
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor: e } = this, t = Vt.sort([...this.extensions].reverse()), r = [], i = [], s = t.map((o) => {
      const l = {
        name: o.name,
        options: o.options,
        storage: o.storage,
        editor: e,
        type: Ei(o.name, this.schema)
      }, a = [], c = E(o, "addKeyboardShortcuts", l);
      let d = {};
      if (o.type === "mark" && E(o, "exitable", l) && (d.ArrowRight = () => fe.handleExit({ editor: e, mark: o })), c) {
        const m = Object.fromEntries(Object.entries(c()).map(([g, b]) => [g, () => b({ editor: e })]));
        d = { ...d, ...m };
      }
      const u = zh(d);
      a.push(u);
      const h = E(o, "addInputRules", l);
      al(o, e.options.enableInputRules) && h && r.push(...h());
      const p = E(o, "addPasteRules", l);
      al(o, e.options.enablePasteRules) && p && i.push(...p());
      const f = E(o, "addProseMirrorPlugins", l);
      if (f) {
        const m = f();
        a.push(...m);
      }
      return a;
    }).flat();
    return [
      hp({
        editor: e,
        rules: r
      }),
      ...kp({
        editor: e,
        rules: i
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
    const { editor: e } = this, { nodeExtensions: t } = ni(this.extensions);
    return Object.fromEntries(t.filter((r) => !!E(r, "addNodeView")).map((r) => {
      const i = this.attributes.filter((a) => a.type === r.name), s = {
        name: r.name,
        options: r.options,
        storage: r.storage,
        editor: e,
        type: Q(r.name, this.schema)
      }, o = E(r, "addNodeView", s);
      if (!o)
        return [];
      const l = (a, c, d, u, h) => {
        const p = rs(a, i);
        return o()({
          // pass-through
          node: a,
          view: c,
          getPos: d,
          decorations: u,
          innerDecorations: h,
          // tiptap-specific
          editor: e,
          extension: r,
          HTMLAttributes: p
        });
      };
      return [r.name, l];
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
      const r = {
        name: e.name,
        options: e.options,
        storage: e.storage,
        editor: this.editor,
        type: Ei(e.name, this.schema)
      };
      e.type === "mark" && (!((t = I(E(e, "keepOnSplit", r))) !== null && t !== void 0) || t) && this.splittableMarks.push(e.name);
      const i = E(e, "onBeforeCreate", r), s = E(e, "onCreate", r), o = E(e, "onUpdate", r), l = E(e, "onSelectionUpdate", r), a = E(e, "onTransaction", r), c = E(e, "onFocus", r), d = E(e, "onBlur", r), u = E(e, "onDestroy", r);
      i && this.editor.on("beforeCreate", i), s && this.editor.on("create", s), o && this.editor.on("update", o), l && this.editor.on("selectionUpdate", l), a && this.editor.on("transaction", a), c && this.editor.on("focus", c), d && this.editor.on("blur", d), u && this.editor.on("destroy", u);
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
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = I(E(this, "addOptions", {
      name: this.name
    }))), this.storage = I(E(this, "addStorage", {
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
      addOptions: () => ii(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new K({ ...this.config, ...e });
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = I(E(t, "addOptions", {
      name: t.name
    })), t.storage = I(E(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function Sc(n, e, t) {
  const { from: r, to: i } = e, { blockSeparator: s = `

`, textSerializers: o = {} } = t || {};
  let l = "";
  return n.nodesBetween(r, i, (a, c, d, u) => {
    var h;
    a.isBlock && c > r && (l += s);
    const p = o == null ? void 0 : o[a.type.name];
    if (p)
      return d && (l += p({
        node: a,
        pos: c,
        parent: d,
        index: u,
        range: e
      })), !1;
    a.isText && (l += (h = a == null ? void 0 : a.text) === null || h === void 0 ? void 0 : h.slice(Math.max(r, c) - c, i - c));
  }), l;
}
function xc(n) {
  return Object.fromEntries(Object.entries(n.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
const Cp = K.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new j({
        key: new J("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: n } = this, { state: e, schema: t } = n, { doc: r, selection: i } = e, { ranges: s } = i, o = Math.min(...s.map((d) => d.$from.pos)), l = Math.max(...s.map((d) => d.$to.pos)), a = xc(t);
            return Sc(r, { from: o, to: l }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: a
            });
          }
        }
      })
    ];
  }
}), Sp = () => ({ editor: n, view: e }) => (requestAnimationFrame(() => {
  var t;
  n.isDestroyed || (e.dom.blur(), (t = window == null ? void 0 : window.getSelection()) === null || t === void 0 || t.removeAllRanges());
}), !0), xp = (n = !1) => ({ commands: e }) => e.setContent("", n), vp = () => ({ state: n, tr: e, dispatch: t }) => {
  const { selection: r } = e, { ranges: i } = r;
  return t && i.forEach(({ $from: s, $to: o }) => {
    n.doc.nodesBetween(s.pos, o.pos, (l, a) => {
      if (l.type.isText)
        return;
      const { doc: c, mapping: d } = e, u = c.resolve(d.map(a)), h = c.resolve(d.map(a + l.nodeSize)), p = u.blockRange(h);
      if (!p)
        return;
      const f = Gt(p);
      if (l.type.isTextblock) {
        const { defaultType: m } = u.parent.contentMatchAt(u.index());
        e.setNodeMarkup(p.start, m);
      }
      (f || f === 0) && e.lift(p, f);
    });
  }), !0;
}, Mp = (n) => (e) => n(e), Ep = () => ({ state: n, dispatch: e }) => gc(n, e), Ap = (n, e) => ({ editor: t, tr: r }) => {
  const { state: i } = t, s = i.doc.slice(n.from, n.to);
  r.deleteRange(n.from, n.to);
  const o = r.mapping.map(e);
  return r.insert(o, s.content), r.setSelection(new T(r.doc.resolve(Math.max(o - 1, 0)))), !0;
}, Tp = () => ({ tr: n, dispatch: e }) => {
  const { selection: t } = n, r = t.$anchor.node();
  if (r.content.size > 0)
    return !1;
  const i = n.selection.$anchor;
  for (let s = i.depth; s > 0; s -= 1)
    if (i.node(s).type === r.type) {
      if (e) {
        const l = i.before(s), a = i.after(s);
        n.delete(l, a).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, Np = (n) => ({ tr: e, state: t, dispatch: r }) => {
  const i = Q(n, t.schema), s = e.selection.$anchor;
  for (let o = s.depth; o > 0; o -= 1)
    if (s.node(o).type === i) {
      if (r) {
        const a = s.before(o), c = s.after(o);
        e.delete(a, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, Op = (n) => ({ tr: e, dispatch: t }) => {
  const { from: r, to: i } = n;
  return t && e.delete(r, i), !0;
}, Lp = () => ({ state: n, dispatch: e }) => Hs(n, e), Rp = () => ({ commands: n }) => n.keyboardShortcut("Enter"), Ip = () => ({ state: n, dispatch: e }) => jh(n, e);
function br(n, e, t = { strict: !0 }) {
  const r = Object.keys(e);
  return r.length ? r.every((i) => t.strict ? e[i] === n[i] : Ws(e[i]) ? e[i].test(n[i]) : e[i] === n[i]) : !0;
}
function vc(n, e, t = {}) {
  return n.find((r) => r.type === e && br(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(t).map((i) => [i, r.attrs[i]])),
    t
  ));
}
function cl(n, e, t = {}) {
  return !!vc(n, e, t);
}
function js(n, e, t) {
  var r;
  if (!n || !e)
    return;
  let i = n.parent.childAfter(n.parentOffset);
  if ((!i.node || !i.node.marks.some((d) => d.type === e)) && (i = n.parent.childBefore(n.parentOffset)), !i.node || !i.node.marks.some((d) => d.type === e) || (t = t || ((r = i.node.marks[0]) === null || r === void 0 ? void 0 : r.attrs), !vc([...i.node.marks], e, t)))
    return;
  let o = i.index, l = n.start() + i.offset, a = o + 1, c = l + i.node.nodeSize;
  for (; o > 0 && cl([...n.parent.child(o - 1).marks], e, t); )
    o -= 1, l -= n.parent.child(o).nodeSize;
  for (; a < n.parent.childCount && cl([...n.parent.child(a).marks], e, t); )
    c += n.parent.child(a).nodeSize, a += 1;
  return {
    from: l,
    to: c
  };
}
function pt(n, e) {
  if (typeof n == "string") {
    if (!e.marks[n])
      throw Error(`There is no mark type named '${n}'. Maybe you forgot to add the extension?`);
    return e.marks[n];
  }
  return n;
}
const _p = (n, e = {}) => ({ tr: t, state: r, dispatch: i }) => {
  const s = pt(n, r.schema), { doc: o, selection: l } = t, { $from: a, from: c, to: d } = l;
  if (i) {
    const u = js(a, s, e);
    if (u && u.from <= c && u.to >= d) {
      const h = T.create(o, u.from, u.to);
      t.setSelection(h);
    }
  }
  return !0;
}, Dp = (n) => (e) => {
  const t = typeof n == "function" ? n(e) : n;
  for (let r = 0; r < t.length; r += 1)
    if (t[r](e))
      return !0;
  return !1;
};
function Mc(n) {
  return n instanceof T;
}
function wt(n = 0, e = 0, t = 0) {
  return Math.min(Math.max(n, e), t);
}
function Ec(n, e = null) {
  if (!e)
    return null;
  const t = N.atStart(n), r = N.atEnd(n);
  if (e === "start" || e === !0)
    return t;
  if (e === "end")
    return r;
  const i = t.from, s = r.to;
  return e === "all" ? T.create(n, wt(0, i, s), wt(n.content.size, i, s)) : T.create(n, wt(e, i, s), wt(e, i, s));
}
function dl() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function yr() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function Pp() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const Bp = (n = null, e = {}) => ({ editor: t, view: r, tr: i, dispatch: s }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const o = () => {
    (yr() || dl()) && r.dom.focus(), requestAnimationFrame(() => {
      t.isDestroyed || (r.focus(), Pp() && !yr() && !dl() && r.dom.focus({ preventScroll: !0 }));
    });
  };
  if (r.hasFocus() && n === null || n === !1)
    return !0;
  if (s && n === null && !Mc(t.state.selection))
    return o(), !0;
  const l = Ec(i.doc, n) || t.state.selection, a = t.state.selection.eq(l);
  return s && (a || i.setSelection(l), a && i.storedMarks && i.setStoredMarks(i.storedMarks), o()), !0;
}, Hp = (n, e) => (t) => n.every((r, i) => e(r, { ...t, index: i })), zp = (n, e) => ({ tr: t, commands: r }) => r.insertContentAt({ from: t.selection.from, to: t.selection.to }, n, e), Ac = (n) => {
  const e = n.childNodes;
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const r = e[t];
    r.nodeType === 3 && r.nodeValue && /^(\n\s\s|\n)$/.test(r.nodeValue) ? n.removeChild(r) : r.nodeType === 1 && Ac(r);
  }
  return n;
};
function Fn(n) {
  const e = `<body>${n}</body>`, t = new window.DOMParser().parseFromString(e, "text/html").body;
  return Ac(t);
}
function vn(n, e, t) {
  if (n instanceof it || n instanceof y)
    return n;
  t = {
    slice: !0,
    parseOptions: {},
    ...t
  };
  const r = typeof n == "object" && n !== null, i = typeof n == "string";
  if (r)
    try {
      if (Array.isArray(n) && n.length > 0)
        return y.fromArray(n.map((l) => e.nodeFromJSON(l)));
      const o = e.nodeFromJSON(n);
      return t.errorOnInvalidContent && o.check(), o;
    } catch (s) {
      if (t.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: s });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", n, "Error:", s), vn("", e, t);
    }
  if (i) {
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
      if (t.slice ? st.fromSchema(a).parseSlice(Fn(n), t.parseOptions) : st.fromSchema(a).parse(Fn(n), t.parseOptions), t.errorOnInvalidContent && o)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${l}`) });
    }
    const s = st.fromSchema(e);
    return t.slice ? s.parseSlice(Fn(n), t.parseOptions).content : s.parse(Fn(n), t.parseOptions);
  }
  return vn("", e, t);
}
function $p(n, e, t) {
  const r = n.steps.length - 1;
  if (r < e)
    return;
  const i = n.steps[r];
  if (!(i instanceof G || i instanceof Y))
    return;
  const s = n.mapping.maps[r];
  let o = 0;
  s.forEach((l, a, c, d) => {
    o === 0 && (o = d);
  }), n.setSelection(N.near(n.doc.resolve(o), t));
}
const Fp = (n) => !("type" in n), Vp = (n, e, t) => ({ tr: r, dispatch: i, editor: s }) => {
  var o;
  if (i) {
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
        vn(e, s.schema, {
          parseOptions: c,
          errorOnInvalidContent: !0
        });
      } catch (g) {
        a(g);
      }
    try {
      l = vn(e, s.schema, {
        parseOptions: c,
        errorOnInvalidContent: (o = t.errorOnInvalidContent) !== null && o !== void 0 ? o : s.options.enableContentCheck
      });
    } catch (g) {
      return a(g), !1;
    }
    let { from: d, to: u } = typeof n == "number" ? { from: n, to: n } : { from: n.from, to: n.to }, h = !0, p = !0;
    if ((Fp(l) ? l : [l]).forEach((g) => {
      g.check(), h = h ? g.isText && g.marks.length === 0 : !1, p = p ? g.isBlock : !1;
    }), d === u && p) {
      const { parent: g } = r.doc.resolve(d);
      g.isTextblock && !g.type.spec.code && !g.childCount && (d -= 1, u += 1);
    }
    let m;
    if (h) {
      if (Array.isArray(e))
        m = e.map((g) => g.text || "").join("");
      else if (e instanceof y) {
        let g = "";
        e.forEach((b) => {
          b.text && (g += b.text);
        }), m = g;
      } else typeof e == "object" && e && e.text ? m = e.text : m = e;
      r.insertText(m, d, u);
    } else
      m = l, r.replaceWith(d, u, m);
    t.updateSelection && $p(r, r.steps.length - 1, -1), t.applyInputRules && r.setMeta("applyInputRules", { from: d, text: m }), t.applyPasteRules && r.setMeta("applyPasteRules", { from: d, text: m });
  }
  return !0;
}, qp = () => ({ state: n, dispatch: e }) => Vh(n, e), Wp = () => ({ state: n, dispatch: e }) => qh(n, e), jp = () => ({ state: n, dispatch: e }) => cc(n, e), Up = () => ({ state: n, dispatch: e }) => pc(n, e), Kp = () => ({ state: n, dispatch: e, tr: t }) => {
  try {
    const r = Jr(n.doc, n.selection.$from.pos, -1);
    return r == null ? !1 : (t.join(r, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Jp = () => ({ state: n, dispatch: e, tr: t }) => {
  try {
    const r = Jr(n.doc, n.selection.$from.pos, 1);
    return r == null ? !1 : (t.join(r, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Gp = () => ({ state: n, dispatch: e }) => $h(n, e), Yp = () => ({ state: n, dispatch: e }) => Fh(n, e);
function Tc() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function Xp(n) {
  const e = n.split(/-(?!$)/);
  let t = e[e.length - 1];
  t === "Space" && (t = " ");
  let r, i, s, o;
  for (let l = 0; l < e.length - 1; l += 1) {
    const a = e[l];
    if (/^(cmd|meta|m)$/i.test(a))
      o = !0;
    else if (/^a(lt)?$/i.test(a))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      i = !0;
    else if (/^s(hift)?$/i.test(a))
      s = !0;
    else if (/^mod$/i.test(a))
      yr() || Tc() ? o = !0 : i = !0;
    else
      throw new Error(`Unrecognized modifier name: ${a}`);
  }
  return r && (t = `Alt-${t}`), i && (t = `Ctrl-${t}`), o && (t = `Meta-${t}`), s && (t = `Shift-${t}`), t;
}
const Qp = (n) => ({ editor: e, view: t, tr: r, dispatch: i }) => {
  const s = Xp(n).split(/-(?!$)/), o = s.find((c) => !["Alt", "Ctrl", "Meta", "Shift"].includes(c)), l = new KeyboardEvent("keydown", {
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
    const d = c.map(r.mapping);
    d && i && r.maybeStep(d);
  }), !0;
};
function Mn(n, e, t = {}) {
  const { from: r, to: i, empty: s } = n.selection, o = e ? Q(e, n.schema) : null, l = [];
  n.doc.nodesBetween(r, i, (u, h) => {
    if (u.isText)
      return;
    const p = Math.max(r, h), f = Math.min(i, h + u.nodeSize);
    l.push({
      node: u,
      from: p,
      to: f
    });
  });
  const a = i - r, c = l.filter((u) => o ? o.name === u.node.type.name : !0).filter((u) => br(u.node.attrs, t, { strict: !1 }));
  return s ? !!c.length : c.reduce((u, h) => u + h.to - h.from, 0) >= a;
}
const Zp = (n, e = {}) => ({ state: t, dispatch: r }) => {
  const i = Q(n, t.schema);
  return Mn(t, i, e) ? Wh(t, r) : !1;
}, ef = () => ({ state: n, dispatch: e }) => bc(n, e), tf = (n) => ({ state: e, dispatch: t }) => {
  const r = Q(n, e.schema);
  return np(r)(e, t);
}, nf = () => ({ state: n, dispatch: e }) => mc(n, e);
function si(n, e) {
  return e.nodes[n] ? "node" : e.marks[n] ? "mark" : null;
}
function ul(n, e) {
  const t = typeof e == "string" ? [e] : e;
  return Object.keys(n).reduce((r, i) => (t.includes(i) || (r[i] = n[i]), r), {});
}
const rf = (n, e) => ({ tr: t, state: r, dispatch: i }) => {
  let s = null, o = null;
  const l = si(typeof n == "string" ? n : n.name, r.schema);
  return l ? (l === "node" && (s = Q(n, r.schema)), l === "mark" && (o = pt(n, r.schema)), i && t.selection.ranges.forEach((a) => {
    r.doc.nodesBetween(a.$from.pos, a.$to.pos, (c, d) => {
      s && s === c.type && t.setNodeMarkup(d, void 0, ul(c.attrs, e)), o && c.marks.length && c.marks.forEach((u) => {
        o === u.type && t.addMark(d, d + c.nodeSize, o.create(ul(u.attrs, e)));
      });
    });
  }), !0) : !1;
}, sf = () => ({ tr: n, dispatch: e }) => (e && n.scrollIntoView(), !0), of = () => ({ tr: n, dispatch: e }) => {
  if (e) {
    const t = new be(n.doc);
    n.setSelection(t);
  }
  return !0;
}, lf = () => ({ state: n, dispatch: e }) => uc(n, e), af = () => ({ state: n, dispatch: e }) => fc(n, e), cf = () => ({ state: n, dispatch: e }) => Jh(n, e), df = () => ({ state: n, dispatch: e }) => Xh(n, e), uf = () => ({ state: n, dispatch: e }) => Yh(n, e);
function is(n, e, t = {}, r = {}) {
  return vn(n, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: r.errorOnInvalidContent
  });
}
const hf = (n, e = !1, t = {}, r = {}) => ({ editor: i, tr: s, dispatch: o, commands: l }) => {
  var a, c;
  const { doc: d } = s;
  if (t.preserveWhitespace !== "full") {
    const u = is(n, i.schema, t, {
      errorOnInvalidContent: (a = r.errorOnInvalidContent) !== null && a !== void 0 ? a : i.options.enableContentCheck
    });
    return o && s.replaceWith(0, d.content.size, u).setMeta("preventUpdate", !e), !0;
  }
  return o && s.setMeta("preventUpdate", !e), l.insertContentAt({ from: 0, to: d.content.size }, n, {
    parseOptions: t,
    errorOnInvalidContent: (c = r.errorOnInvalidContent) !== null && c !== void 0 ? c : i.options.enableContentCheck
  });
};
function Nc(n, e) {
  const t = pt(e, n.schema), { from: r, to: i, empty: s } = n.selection, o = [];
  s ? (n.storedMarks && o.push(...n.storedMarks), o.push(...n.selection.$head.marks())) : n.doc.nodesBetween(r, i, (a) => {
    o.push(...a.marks);
  });
  const l = o.find((a) => a.type.name === t.name);
  return l ? { ...l.attrs } : {};
}
function pf(n, e) {
  const t = new Es(n);
  return e.forEach((r) => {
    r.steps.forEach((i) => {
      t.step(i);
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
  const r = [];
  return n.nodesBetween(e.from, e.to, (i, s) => {
    t(i) && r.push({
      node: i,
      pos: s
    });
  }), r;
}
function Oc(n, e) {
  for (let t = n.depth; t > 0; t -= 1) {
    const r = n.node(t);
    if (e(r))
      return {
        pos: t > 0 ? n.before(t) : 0,
        start: n.start(t),
        depth: t,
        node: r
      };
  }
}
function Us(n) {
  return (e) => Oc(e.$from, n);
}
function gf(n, e) {
  const t = {
    from: 0,
    to: n.content.size
  };
  return Sc(n, t, e);
}
function bf(n, e) {
  const t = Q(e, n.schema), { from: r, to: i } = n.selection, s = [];
  n.doc.nodesBetween(r, i, (l) => {
    s.push(l);
  });
  const o = s.reverse().find((l) => l.type.name === t.name);
  return o ? { ...o.attrs } : {};
}
function Lc(n, e) {
  const t = si(typeof e == "string" ? e : e.name, n.schema);
  return t === "node" ? bf(n, e) : t === "mark" ? Nc(n, e) : {};
}
function yf(n, e = JSON.stringify) {
  const t = {};
  return n.filter((r) => {
    const i = e(r);
    return Object.prototype.hasOwnProperty.call(t, i) ? !1 : t[i] = !0;
  });
}
function kf(n) {
  const e = yf(n);
  return e.length === 1 ? e : e.filter((t, r) => !e.filter((s, o) => o !== r).some((s) => t.oldRange.from >= s.oldRange.from && t.oldRange.to <= s.oldRange.to && t.newRange.from >= s.newRange.from && t.newRange.to <= s.newRange.to));
}
function wf(n) {
  const { mapping: e, steps: t } = n, r = [];
  return e.maps.forEach((i, s) => {
    const o = [];
    if (i.ranges.length)
      i.forEach((l, a) => {
        o.push({ from: l, to: a });
      });
    else {
      const { from: l, to: a } = t[s];
      if (l === void 0 || a === void 0)
        return;
      o.push({ from: l, to: a });
    }
    o.forEach(({ from: l, to: a }) => {
      const c = e.slice(s).map(l, -1), d = e.slice(s).map(a), u = e.invert().map(c, -1), h = e.invert().map(d);
      r.push({
        oldRange: {
          from: u,
          to: h
        },
        newRange: {
          from: c,
          to: d
        }
      });
    });
  }), kf(r);
}
function Ks(n, e, t) {
  const r = [];
  return n === e ? t.resolve(n).marks().forEach((i) => {
    const s = t.resolve(n), o = js(s, i.type);
    o && r.push({
      mark: i,
      ...o
    });
  }) : t.nodesBetween(n, e, (i, s) => {
    !i || (i == null ? void 0 : i.nodeSize) === void 0 || r.push(...i.marks.map((o) => ({
      from: s,
      to: s + i.nodeSize,
      mark: o
    })));
  }), r;
}
function er(n, e, t) {
  return Object.fromEntries(Object.entries(t).filter(([r]) => {
    const i = n.find((s) => s.type === e && s.name === r);
    return i ? i.attribute.keepOnSplit : !1;
  }));
}
function ss(n, e, t = {}) {
  const { empty: r, ranges: i } = n.selection, s = e ? pt(e, n.schema) : null;
  if (r)
    return !!(n.storedMarks || n.selection.$from.marks()).filter((u) => s ? s.name === u.type.name : !0).find((u) => br(u.attrs, t, { strict: !1 }));
  let o = 0;
  const l = [];
  if (i.forEach(({ $from: u, $to: h }) => {
    const p = u.pos, f = h.pos;
    n.doc.nodesBetween(p, f, (m, g) => {
      if (!m.isText && !m.marks.length)
        return;
      const b = Math.max(p, g), k = Math.min(f, g + m.nodeSize), w = k - b;
      o += w, l.push(...m.marks.map((v) => ({
        mark: v,
        from: b,
        to: k
      })));
    });
  }), o === 0)
    return !1;
  const a = l.filter((u) => s ? s.name === u.mark.type.name : !0).filter((u) => br(u.mark.attrs, t, { strict: !1 })).reduce((u, h) => u + h.to - h.from, 0), c = l.filter((u) => s ? u.mark.type !== s && u.mark.type.excludes(s) : !0).reduce((u, h) => u + h.to - h.from, 0);
  return (a > 0 ? a + c : a) >= o;
}
function Cf(n, e, t = {}) {
  if (!e)
    return Mn(n, null, t) || ss(n, null, t);
  const r = si(e, n.schema);
  return r === "node" ? Mn(n, e, t) : r === "mark" ? ss(n, e, t) : !1;
}
function hl(n, e) {
  const { nodeExtensions: t } = ni(e), r = t.find((o) => o.name === n);
  if (!r)
    return !1;
  const i = {
    name: r.name,
    options: r.options,
    storage: r.storage
  }, s = I(E(r, "group", i));
  return typeof s != "string" ? !1 : s.split(" ").includes("list");
}
function oi(n, { checkChildren: e = !0, ignoreWhitespace: t = !1 } = {}) {
  var r;
  if (t) {
    if (n.type.name === "hardBreak")
      return !0;
    if (n.isText)
      return /^\s*$/m.test((r = n.text) !== null && r !== void 0 ? r : "");
  }
  if (n.isText)
    return !n.text;
  if (n.isAtom || n.isLeaf)
    return !1;
  if (n.content.childCount === 0)
    return !0;
  if (e) {
    let i = !0;
    return n.content.forEach((s) => {
      i !== !1 && (oi(s, { ignoreWhitespace: t, checkChildren: e }) || (i = !1));
    }), i;
  }
  return !1;
}
function Sf(n) {
  return n instanceof A;
}
function xf(n, e, t) {
  var r;
  const { selection: i } = e;
  let s = null;
  if (Mc(i) && (s = i.$cursor), s) {
    const l = (r = n.storedMarks) !== null && r !== void 0 ? r : s.marks();
    return !!t.isInSet(l) || !l.some((a) => a.type.excludes(t));
  }
  const { ranges: o } = i;
  return o.some(({ $from: l, $to: a }) => {
    let c = l.depth === 0 ? n.doc.inlineContent && n.doc.type.allowsMarkType(t) : !1;
    return n.doc.nodesBetween(l.pos, a.pos, (d, u, h) => {
      if (c)
        return !1;
      if (d.isInline) {
        const p = !h || h.type.allowsMarkType(t), f = !!t.isInSet(d.marks) || !d.marks.some((m) => m.type.excludes(t));
        c = p && f;
      }
      return !c;
    }), c;
  });
}
const vf = (n, e = {}) => ({ tr: t, state: r, dispatch: i }) => {
  const { selection: s } = t, { empty: o, ranges: l } = s, a = pt(n, r.schema);
  if (i)
    if (o) {
      const c = Nc(r, a);
      t.addStoredMark(a.create({
        ...c,
        ...e
      }));
    } else
      l.forEach((c) => {
        const d = c.$from.pos, u = c.$to.pos;
        r.doc.nodesBetween(d, u, (h, p) => {
          const f = Math.max(p, d), m = Math.min(p + h.nodeSize, u);
          h.marks.find((b) => b.type === a) ? h.marks.forEach((b) => {
            a === b.type && t.addMark(f, m, a.create({
              ...b.attrs,
              ...e
            }));
          }) : t.addMark(f, m, a.create(e));
        });
      });
  return xf(r, t, a);
}, Mf = (n, e) => ({ tr: t }) => (t.setMeta(n, e), !0), Ef = (n, e = {}) => ({ state: t, dispatch: r, chain: i }) => {
  const s = Q(n, t.schema);
  let o;
  return t.selection.$anchor.sameParent(t.selection.$head) && (o = t.selection.$anchor.parent.attrs), s.isTextblock ? i().command(({ commands: l }) => sl(s, { ...o, ...e })(t) ? !0 : l.clearNodes()).command(({ state: l }) => sl(s, { ...o, ...e })(l, r)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, Af = (n) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: r } = e, i = wt(n, 0, r.content.size), s = A.create(r, i);
    e.setSelection(s);
  }
  return !0;
}, Tf = (n) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: r } = e, { from: i, to: s } = typeof n == "number" ? { from: n, to: n } : n, o = T.atStart(r).from, l = T.atEnd(r).to, a = wt(i, o, l), c = wt(s, o, l), d = T.create(r, a, c);
    e.setSelection(d);
  }
  return !0;
}, Nf = (n) => ({ state: e, dispatch: t }) => {
  const r = Q(n, e.schema);
  return sp(r)(e, t);
};
function pl(n, e) {
  const t = n.storedMarks || n.selection.$to.parentOffset && n.selection.$from.marks();
  if (t) {
    const r = t.filter((i) => e == null ? void 0 : e.includes(i.type.name));
    n.tr.ensureMarks(r);
  }
}
const Of = ({ keepMarks: n = !0 } = {}) => ({ tr: e, state: t, dispatch: r, editor: i }) => {
  const { selection: s, doc: o } = e, { $from: l, $to: a } = s, c = i.extensionManager.attributes, d = er(c, l.node().type.name, l.node().attrs);
  if (s instanceof A && s.node.isBlock)
    return !l.parentOffset || !je(o, l.pos) ? !1 : (r && (n && pl(t, i.extensionManager.splittableMarks), e.split(l.pos).scrollIntoView()), !0);
  if (!l.parent.isBlock)
    return !1;
  const u = a.parentOffset === a.parent.content.size, h = l.depth === 0 ? void 0 : ff(l.node(-1).contentMatchAt(l.indexAfter(-1)));
  let p = u && h ? [
    {
      type: h,
      attrs: d
    }
  ] : void 0, f = je(e.doc, e.mapping.map(l.pos), 1, p);
  if (!p && !f && je(e.doc, e.mapping.map(l.pos), 1, h ? [{ type: h }] : void 0) && (f = !0, p = h ? [
    {
      type: h,
      attrs: d
    }
  ] : void 0), r) {
    if (f && (s instanceof T && e.deleteSelection(), e.split(e.mapping.map(l.pos), 1, p), h && !u && !l.parentOffset && l.parent.type !== h)) {
      const m = e.mapping.map(l.before()), g = e.doc.resolve(m);
      l.node(-1).canReplaceWith(g.index(), g.index() + 1, h) && e.setNodeMarkup(e.mapping.map(l.before()), h);
    }
    n && pl(t, i.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return f;
}, Lf = (n, e = {}) => ({ tr: t, state: r, dispatch: i, editor: s }) => {
  var o;
  const l = Q(n, r.schema), { $from: a, $to: c } = r.selection, d = r.selection.node;
  if (d && d.isBlock || a.depth < 2 || !a.sameParent(c))
    return !1;
  const u = a.node(-1);
  if (u.type !== l)
    return !1;
  const h = s.extensionManager.attributes;
  if (a.parent.content.size === 0 && a.node(-1).childCount === a.indexAfter(-1)) {
    if (a.depth === 2 || a.node(-3).type !== l || a.index(-2) !== a.node(-2).childCount - 1)
      return !1;
    if (i) {
      let b = y.empty;
      const k = a.index(-1) ? 1 : a.index(-2) ? 2 : 3;
      for (let O = a.depth - k; O >= a.depth - 3; O -= 1)
        b = y.from(a.node(O).copy(b));
      const w = a.indexAfter(-1) < a.node(-2).childCount ? 1 : a.indexAfter(-2) < a.node(-3).childCount ? 2 : 3, v = {
        ...er(h, a.node().type.name, a.node().attrs),
        ...e
      }, S = ((o = l.contentMatch.defaultType) === null || o === void 0 ? void 0 : o.createAndFill(v)) || void 0;
      b = b.append(y.from(l.createAndFill(null, S) || void 0));
      const L = a.before(a.depth - (k - 1));
      t.replace(L, a.after(-w), new x(b, 4 - k, 0));
      let M = -1;
      t.doc.nodesBetween(L, t.doc.content.size, (O, D) => {
        if (M > -1)
          return !1;
        O.isTextblock && O.content.size === 0 && (M = D + 1);
      }), M > -1 && t.setSelection(T.near(t.doc.resolve(M))), t.scrollIntoView();
    }
    return !0;
  }
  const p = c.pos === a.end() ? u.contentMatchAt(0).defaultType : null, f = {
    ...er(h, u.type.name, u.attrs),
    ...e
  }, m = {
    ...er(h, a.node().type.name, a.node().attrs),
    ...e
  };
  t.delete(a.pos, c.pos);
  const g = p ? [
    { type: l, attrs: f },
    { type: p, attrs: m }
  ] : [{ type: l, attrs: f }];
  if (!je(t.doc, a.pos, 2))
    return !1;
  if (i) {
    const { selection: b, storedMarks: k } = r, { splittableMarks: w } = s.extensionManager, v = k || b.$to.parentOffset && b.$from.marks();
    if (t.split(a.pos, 2, g).scrollIntoView(), !v || !i)
      return !0;
    const S = v.filter((L) => w.includes(L.type.name));
    t.ensureMarks(S);
  }
  return !0;
}, Ai = (n, e) => {
  const t = Us((o) => o.type === e)(n.selection);
  if (!t)
    return !0;
  const r = n.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
  if (r === void 0)
    return !0;
  const i = n.doc.nodeAt(r);
  return t.node.type === (i == null ? void 0 : i.type) && ut(n.doc, t.pos) && n.join(t.pos), !0;
}, Ti = (n, e) => {
  const t = Us((o) => o.type === e)(n.selection);
  if (!t)
    return !0;
  const r = n.doc.resolve(t.start).after(t.depth);
  if (r === void 0)
    return !0;
  const i = n.doc.nodeAt(r);
  return t.node.type === (i == null ? void 0 : i.type) && ut(n.doc, r) && n.join(r), !0;
}, Rf = (n, e, t, r = {}) => ({ editor: i, tr: s, state: o, dispatch: l, chain: a, commands: c, can: d }) => {
  const { extensions: u, splittableMarks: h } = i.extensionManager, p = Q(n, o.schema), f = Q(e, o.schema), { selection: m, storedMarks: g } = o, { $from: b, $to: k } = m, w = b.blockRange(k), v = g || m.$to.parentOffset && m.$from.marks();
  if (!w)
    return !1;
  const S = Us((L) => hl(L.type.name, u))(m);
  if (w.depth >= 1 && S && w.depth - S.depth <= 1) {
    if (S.node.type === p)
      return c.liftListItem(f);
    if (hl(S.node.type.name, u) && p.validContent(S.node.content) && l)
      return a().command(() => (s.setNodeMarkup(S.pos, p), !0)).command(() => Ai(s, p)).command(() => Ti(s, p)).run();
  }
  return !t || !v || !l ? a().command(() => d().wrapInList(p, r) ? !0 : c.clearNodes()).wrapInList(p, r).command(() => Ai(s, p)).command(() => Ti(s, p)).run() : a().command(() => {
    const L = d().wrapInList(p, r), M = v.filter((O) => h.includes(O.type.name));
    return s.ensureMarks(M), L ? !0 : c.clearNodes();
  }).wrapInList(p, r).command(() => Ai(s, p)).command(() => Ti(s, p)).run();
}, If = (n, e = {}, t = {}) => ({ state: r, commands: i }) => {
  const { extendEmptyMarkRange: s = !1 } = t, o = pt(n, r.schema);
  return ss(r, o, e) ? i.unsetMark(o, { extendEmptyMarkRange: s }) : i.setMark(o, e);
}, _f = (n, e, t = {}) => ({ state: r, commands: i }) => {
  const s = Q(n, r.schema), o = Q(e, r.schema), l = Mn(r, s, t);
  let a;
  return r.selection.$anchor.sameParent(r.selection.$head) && (a = r.selection.$anchor.parent.attrs), l ? i.setNode(o, a) : i.setNode(s, { ...a, ...t });
}, Df = (n, e = {}) => ({ state: t, commands: r }) => {
  const i = Q(n, t.schema);
  return Mn(t, i, e) ? r.lift(i) : r.wrapIn(i, e);
}, Pf = () => ({ state: n, dispatch: e }) => {
  const t = n.plugins;
  for (let r = 0; r < t.length; r += 1) {
    const i = t[r];
    let s;
    if (i.spec.isInputRules && (s = i.getState(n))) {
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
  const { selection: t } = n, { empty: r, ranges: i } = t;
  return r || e && i.forEach((s) => {
    n.removeMark(s.$from.pos, s.$to.pos);
  }), !0;
}, Hf = (n, e = {}) => ({ tr: t, state: r, dispatch: i }) => {
  var s;
  const { extendEmptyMarkRange: o = !1 } = e, { selection: l } = t, a = pt(n, r.schema), { $from: c, empty: d, ranges: u } = l;
  if (!i)
    return !0;
  if (d && o) {
    let { from: h, to: p } = l;
    const f = (s = c.marks().find((g) => g.type === a)) === null || s === void 0 ? void 0 : s.attrs, m = js(c, a, f);
    m && (h = m.from, p = m.to), t.removeMark(h, p, a);
  } else
    u.forEach((h) => {
      t.removeMark(h.$from.pos, h.$to.pos, a);
    });
  return t.removeStoredMark(a), !0;
}, zf = (n, e = {}) => ({ tr: t, state: r, dispatch: i }) => {
  let s = null, o = null;
  const l = si(typeof n == "string" ? n : n.name, r.schema);
  return l ? (l === "node" && (s = Q(n, r.schema)), l === "mark" && (o = pt(n, r.schema)), i && t.selection.ranges.forEach((a) => {
    const c = a.$from.pos, d = a.$to.pos;
    let u, h, p, f;
    t.selection.empty ? r.doc.nodesBetween(c, d, (m, g) => {
      s && s === m.type && (p = Math.max(g, c), f = Math.min(g + m.nodeSize, d), u = g, h = m);
    }) : r.doc.nodesBetween(c, d, (m, g) => {
      g < c && s && s === m.type && (p = Math.max(g, c), f = Math.min(g + m.nodeSize, d), u = g, h = m), g >= c && g <= d && (s && s === m.type && t.setNodeMarkup(g, void 0, {
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
    }), h && (u !== void 0 && t.setNodeMarkup(u, void 0, {
      ...h.attrs,
      ...e
    }), o && h.marks.length && h.marks.forEach((m) => {
      o === m.type && t.addMark(p, f, o.create({
        ...m.attrs,
        ...e
      }));
    }));
  }), !0) : !1;
}, $f = (n, e = {}) => ({ state: t, dispatch: r }) => {
  const i = Q(n, t.schema);
  return Qh(i, e)(t, r);
}, Ff = (n, e = {}) => ({ state: t, dispatch: r }) => {
  const i = Q(n, t.schema);
  return Zh(i, e)(t, r);
};
var Vf = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: Sp,
  clearContent: xp,
  clearNodes: vp,
  command: Mp,
  createParagraphNear: Ep,
  cut: Ap,
  deleteCurrentNode: Tp,
  deleteNode: Np,
  deleteRange: Op,
  deleteSelection: Lp,
  enter: Rp,
  exitCode: Ip,
  extendMarkRange: _p,
  first: Dp,
  focus: Bp,
  forEach: Hp,
  insertContent: zp,
  insertContentAt: Vp,
  joinBackward: jp,
  joinDown: Wp,
  joinForward: Up,
  joinItemBackward: Kp,
  joinItemForward: Jp,
  joinTextblockBackward: Gp,
  joinTextblockForward: Yp,
  joinUp: qp,
  keyboardShortcut: Qp,
  lift: Zp,
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
  setContent: hf,
  setMark: vf,
  setMeta: Mf,
  setNode: Ef,
  setNodeSelection: Af,
  setTextSelection: Tf,
  sinkListItem: Nf,
  splitBlock: Of,
  splitListItem: Lf,
  toggleList: Rf,
  toggleMark: If,
  toggleNode: _f,
  toggleWrap: Df,
  undoInputRule: Pf,
  unsetAllMarks: Bf,
  unsetMark: Hf,
  updateAttributes: zf,
  wrapIn: $f,
  wrapInList: Ff
});
const qf = K.create({
  name: "commands",
  addCommands() {
    return {
      ...Vf
    };
  }
}), Wf = K.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new j({
        key: new J("tiptapDrop"),
        props: {
          handleDrop: (n, e, t, r) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice: t,
              moved: r
            });
          }
        }
      })
    ];
  }
}), jf = K.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new j({
        key: new J("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
}), Uf = new J("focusEvents"), Kf = K.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: n } = this;
    return [
      new j({
        key: Uf,
        props: {
          handleDOMEvents: {
            focus: (e, t) => {
              n.isFocused = !0;
              const r = n.state.tr.setMeta("focus", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(r), !1;
            },
            blur: (e, t) => {
              n.isFocused = !1;
              const r = n.state.tr.setMeta("blur", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(r), !1;
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
        const { selection: a, doc: c } = l, { empty: d, $anchor: u } = a, { pos: h, parent: p } = u, f = u.parent.isTextblock && h > 0 ? l.doc.resolve(h - 1) : u, m = f.parent.type.spec.isolating, g = u.pos - u.parentOffset, b = m && f.parent.childCount === 1 ? g === u.pos : N.atStart(c).from === h;
        return !d || !p.type.isTextblock || p.textContent.length || !b || b && u.parent.type.name === "paragraph" ? !1 : o.clearNodes();
      }),
      () => o.deleteSelection(),
      () => o.joinBackward(),
      () => o.selectNodeBackward()
    ]), e = () => this.editor.commands.first(({ commands: o }) => [
      () => o.deleteSelection(),
      () => o.deleteCurrentNode(),
      () => o.joinForward(),
      () => o.selectNodeForward()
    ]), r = {
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
    }, i = {
      ...r
    }, s = {
      ...r,
      "Ctrl-h": n,
      "Alt-Backspace": n,
      "Ctrl-d": e,
      "Ctrl-Alt-Backspace": e,
      "Alt-Delete": e,
      "Alt-d": e,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return yr() || Tc() ? s : i;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new j({
        key: new J("clearDocument"),
        appendTransaction: (n, e, t) => {
          if (n.some((m) => m.getMeta("composition")))
            return;
          const r = n.some((m) => m.docChanged) && !e.doc.eq(t.doc), i = n.some((m) => m.getMeta("preventClearDocument"));
          if (!r || i)
            return;
          const { empty: s, from: o, to: l } = e.selection, a = N.atStart(e.doc).from, c = N.atEnd(e.doc).to;
          if (s || !(o === a && l === c) || !oi(t.doc))
            return;
          const h = t.tr, p = ei({
            state: t,
            transaction: h
          }), { commands: f } = new ti({
            editor: this.editor,
            state: p
          });
          if (f.clearNodes(), !!h.steps.length)
            return h;
        }
      })
    ];
  }
}), Gf = K.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new j({
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
      new j({
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
  constructor(e, t, r = !1, i = null) {
    this.currentNode = null, this.actualDepth = null, this.isBlock = r, this.resolvedPos = e, this.editor = t, this.currentNode = i;
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
    let t = this.from, r = this.to;
    if (this.isBlock) {
      if (this.content.size === 0) {
        console.error(`You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`);
        return;
      }
      t = this.from + 1, r = this.to - 1;
    }
    this.editor.commands.insertContentAt({ from: t, to: r }, e);
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
    return this.node.content.forEach((t, r) => {
      const i = t.isBlock && !t.isTextblock, s = t.isAtom && !t.isText, o = this.pos + r + (s ? 0 : 1);
      if (o < 0 || o > this.resolvedPos.doc.nodeSize - 2)
        return;
      const l = this.resolvedPos.doc.resolve(o);
      if (!i && l.depth <= this.depth)
        return;
      const a = new bt(l, this.editor, i, i ? t : null);
      i && (a.actualDepth = this.depth + 1), e.push(new bt(l, this.editor, i, i ? t : null));
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
    let r = null, i = this.parent;
    for (; i && !r; ) {
      if (i.node.type.name === e)
        if (Object.keys(t).length > 0) {
          const s = i.node.attrs, o = Object.keys(t);
          for (let l = 0; l < o.length; l += 1) {
            const a = o[l];
            if (s[a] !== t[a])
              break;
          }
        } else
          r = i;
      i = i.parent;
    }
    return r;
  }
  querySelector(e, t = {}) {
    return this.querySelectorAll(e, t, !0)[0] || null;
  }
  querySelectorAll(e, t = {}, r = !1) {
    let i = [];
    if (!this.children || this.children.length === 0)
      return i;
    const s = Object.keys(t);
    return this.children.forEach((o) => {
      r && i.length > 0 || (o.node.type.name === e && s.every((a) => t[a] === o.node.attrs[a]) && i.push(o), !(r && i.length > 0) && (i = i.concat(o.querySelectorAll(e, t, r))));
    }), i;
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
  const r = document.querySelector("style[data-tiptap-style]");
  if (r !== null)
    return r;
  const i = document.createElement("style");
  return e && i.setAttribute("nonce", e), i.setAttribute("data-tiptap-style", ""), i.innerHTML = n, document.getElementsByTagName("head")[0].appendChild(i), i;
}
class Zf extends op {
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
    }, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.setOptions(e), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("contentError", this.options.onContentError), this.createView(), this.injectCSS(), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: t, slice: r, moved: i }) => this.options.onDrop(t, r, i)), this.on("paste", ({ event: t, slice: r }) => this.options.onPaste(t, r)), window.setTimeout(() => {
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
    const r = Cc(t) ? t(e, [...this.state.plugins]) : [...this.state.plugins, e], i = this.state.reconfigure({ plugins: r });
    return this.view.updateState(i), i;
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
    let r = t;
    if ([].concat(e).forEach((s) => {
      const o = typeof s == "string" ? `${s}$` : s.key;
      r = r.filter((l) => !l.key.startsWith(o));
    }), t.length === r.length)
      return;
    const i = this.state.reconfigure({
      plugins: r
    });
    return this.view.updateState(i), i;
  }
  /**
   * Creates an extension manager.
   */
  createExtensionManager() {
    var e, t;
    const i = [...this.options.enableCoreExtensions ? [
      jf,
      Cp.configure({
        blockSeparator: (t = (e = this.options.coreExtensionOptions) === null || e === void 0 ? void 0 : e.clipboardTextSerializer) === null || t === void 0 ? void 0 : t.blockSeparator
      }),
      qf,
      Kf,
      Jf,
      Yf,
      Wf,
      Gf
    ].filter((s) => typeof this.options.enableCoreExtensions == "object" ? this.options.enableCoreExtensions[s.name] !== !1 : !0) : [], ...this.options.extensions].filter((s) => ["extension", "node", "mark"].includes(s == null ? void 0 : s.type));
    this.extensionManager = new Vt(i, this);
  }
  /**
   * Creates an command manager.
   */
  createCommandManager() {
    this.commandManager = new ti({
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
      t = is(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: this.options.enableContentCheck });
    } catch (o) {
      if (!(o instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(o.message))
        throw o;
      this.emit("contentError", {
        editor: this,
        error: o,
        disableCollaboration: () => {
          this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((l) => l.name !== "collaboration"), this.createExtensionManager();
        }
      }), t = is(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: !1 });
    }
    const r = Ec(t, this.options.autofocus);
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
        selection: r || void 0
      })
    });
    const i = this.state.reconfigure({
      plugins: this.extensionManager.plugins
    });
    this.view.updateState(i), this.createNodeViews(), this.prependClass();
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
    const t = this.state.apply(e), r = !this.state.selection.eq(t.selection);
    this.emit("beforeTransaction", {
      editor: this,
      transaction: e,
      nextState: t
    }), this.view.updateState(t), this.emit("transaction", {
      editor: this,
      transaction: e
    }), r && this.emit("selectionUpdate", {
      editor: this,
      transaction: e
    });
    const i = e.getMeta("focus"), s = e.getMeta("blur");
    i && this.emit("focus", {
      editor: this,
      event: i.event,
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
    return Lc(this.state, e);
  }
  isActive(e, t) {
    const r = typeof e == "string" ? e : null, i = typeof e == "string" ? t : e;
    return Cf(this.state, r, i);
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
    return qs(this.state.doc.content, this.schema);
  }
  /**
   * Get the document as text.
   */
  getText(e) {
    const { blockSeparator: t = `

`, textSerializers: r = {} } = e || {};
    return gf(this.state.doc, {
      blockSeparator: t,
      textSerializers: {
        ...xc(this.schema),
        ...r
      }
    });
  }
  /**
   * Check if there is no content.
   */
  get isEmpty() {
    return oi(this.state.doc);
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
    var r;
    return ((r = this.$doc) === null || r === void 0 ? void 0 : r.querySelector(e, t)) || null;
  }
  $nodes(e, t) {
    var r;
    return ((r = this.$doc) === null || r === void 0 ? void 0 : r.querySelectorAll(e, t)) || null;
  }
  $pos(e) {
    const t = this.state.doc.resolve(e);
    return new bt(t, this);
  }
  get $doc() {
    return this.$pos(0);
  }
}
function Lt(n) {
  return new ri({
    find: n.find,
    handler: ({ state: e, range: t, match: r }) => {
      const i = I(n.getAttributes, void 0, r);
      if (i === !1 || i === null)
        return null;
      const { tr: s } = e, o = r[r.length - 1], l = r[0];
      if (o) {
        const a = l.search(/\S/), c = t.from + l.indexOf(o), d = c + o.length;
        if (Ks(t.from, t.to, e.doc).filter((p) => p.mark.type.excluded.find((m) => m === n.type && m !== p.mark.type)).filter((p) => p.to > c).length)
          return null;
        d < t.to && s.delete(d, t.to), c > t.from && s.delete(t.from + a, c);
        const h = t.from + a + o.length;
        s.addMark(t.from + a, h, n.type.create(i || {})), s.removeStoredMark(n.type);
      }
    }
  });
}
function em(n) {
  return new ri({
    find: n.find,
    handler: ({ state: e, range: t, match: r }) => {
      const i = I(n.getAttributes, void 0, r) || {}, { tr: s } = e, o = t.from;
      let l = t.to;
      const a = n.type.create(i);
      if (r[1]) {
        const c = r[0].lastIndexOf(r[1]);
        let d = o + c;
        d > l ? d = l : l = d + r[1].length;
        const u = r[0][r[0].length - 1];
        s.insertText(u, o + r[0].length - 1), s.replaceWith(d, l, a);
      } else if (r[0]) {
        const c = n.type.isInline ? o : o - 1;
        s.insert(c, n.type.create(i)).delete(s.mapping.map(o), s.mapping.map(l));
      }
      s.scrollIntoView();
    }
  });
}
function ls(n) {
  return new ri({
    find: n.find,
    handler: ({ state: e, range: t, match: r }) => {
      const i = e.doc.resolve(t.from), s = I(n.getAttributes, void 0, r) || {};
      if (!i.node(-1).canReplaceWith(i.index(-1), i.indexAfter(-1), n.type))
        return null;
      e.tr.delete(t.from, t.to).setBlockType(t.from, t.from, n.type, s);
    }
  });
}
function En(n) {
  return new ri({
    find: n.find,
    handler: ({ state: e, range: t, match: r, chain: i }) => {
      const s = I(n.getAttributes, void 0, r) || {}, o = e.tr.delete(t.from, t.to), a = o.doc.resolve(t.from).blockRange(), c = a && Ms(a, n.type, s);
      if (!c)
        return null;
      if (o.wrap(a, c), n.keepMarks && n.editor) {
        const { selection: u, storedMarks: h } = e, { splittableMarks: p } = n.editor.extensionManager, f = h || u.$to.parentOffset && u.$from.marks();
        if (f) {
          const m = f.filter((g) => p.includes(g.type.name));
          o.ensureMarks(m);
        }
      }
      if (n.keepAttributes) {
        const u = n.type.name === "bulletList" || n.type.name === "orderedList" ? "listItem" : "taskList";
        i().updateAttributes(u, s).run();
      }
      const d = o.doc.resolve(t.from - 1).nodeBefore;
      d && d.type === n.type && ut(o.doc, t.from - 1) && (!n.joinPredicate || n.joinPredicate(r, d)) && o.join(t.from - 1);
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
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = I(E(this, "addOptions", {
      name: this.name
    }))), this.storage = I(E(this, "addStorage", {
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
      addOptions: () => ii(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new B(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = I(E(t, "addOptions", {
      name: t.name
    })), t.storage = I(E(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function dt(n) {
  return new mp({
    find: n.find,
    handler: ({ state: e, range: t, match: r, pasteEvent: i }) => {
      const s = I(n.getAttributes, void 0, r, i);
      if (s === !1 || s === null)
        return null;
      const { tr: o } = e, l = r[r.length - 1], a = r[0];
      let c = t.to;
      if (l) {
        const d = a.search(/\S/), u = t.from + a.indexOf(l), h = u + l.length;
        if (Ks(t.from, t.to, e.doc).filter((f) => f.mark.type.excluded.find((g) => g === n.type && g !== f.mark.type)).filter((f) => f.to > u).length)
          return null;
        h < t.to && o.delete(h, t.to), u > t.from && o.delete(t.from + d, u), c = t.from + d + l.length, o.addMark(t.from + d, c, n.type.create(s || {})), o.removeStoredMark(n.type);
      }
    }
  });
}
function tm(n, e) {
  const { selection: t } = n, { $from: r } = t;
  if (t instanceof A) {
    const s = r.index();
    return r.parent.canReplaceWith(s, s + 1, e);
  }
  let i = r.depth;
  for (; i >= 0; ) {
    const s = r.index(i);
    if (r.node(i).contentMatchAt(s).matchType(e))
      return !0;
    i -= 1;
  }
  return !1;
}
function nm(n) {
  return n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
const rm = /^\s*>\s$/, im = B.create({
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
    return ["blockquote", _(this.options.HTMLAttributes, n), 0];
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
      En({
        find: rm,
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
    return ["strong", _(this.options.HTMLAttributes, n), 0];
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
      Lt({
        find: sm,
        type: this.type
      }),
      Lt({
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
}), dm = "listItem", fl = "textStyle", ml = /^\s*([-+*])\s$/, um = B.create({
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
    return ["ul", _(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      toggleBulletList: () => ({ commands: n, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(dm, this.editor.getAttributes(fl)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor.commands.toggleBulletList()
    };
  },
  addInputRules() {
    let n = En({
      find: ml,
      type: this.type
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = En({
      find: ml,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: () => this.editor.getAttributes(fl),
      editor: this.editor
    })), [
      n
    ];
  }
}), hm = /(^|[^`])`([^`]+)`(?!`)/, pm = /(^|[^`])`([^`]+)`(?!`)/g, fm = fe.create({
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
    return ["code", _(this.options.HTMLAttributes, n), 0];
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
      Lt({
        find: hm,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      dt({
        find: pm,
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
      _(this.options.HTMLAttributes, e),
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
        const { state: e } = n, { selection: t } = e, { $from: r, empty: i } = t;
        if (!i || r.parent.type !== this.type)
          return !1;
        const s = r.parentOffset === r.parent.nodeSize - 2, o = r.parent.textContent.endsWith(`

`);
        return !s || !o ? !1 : n.chain().command(({ tr: l }) => (l.delete(r.pos - 2, r.pos), !0)).exitCode().run();
      },
      // exit node on arrow down
      ArrowDown: ({ editor: n }) => {
        if (!this.options.exitOnArrowDown)
          return !1;
        const { state: e } = n, { selection: t, doc: r } = e, { $from: i, empty: s } = t;
        if (!s || i.parent.type !== this.type || !(i.parentOffset === i.parent.nodeSize - 2))
          return !1;
        const l = i.after();
        return l === void 0 ? !1 : r.nodeAt(l) ? n.commands.command(({ tr: c }) => (c.setSelection(N.near(r.resolve(l))), !0)) : n.commands.exitCode();
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
      new j({
        key: new J("codeBlockVSCodeHandler"),
        props: {
          handlePaste: (n, e) => {
            if (!e.clipboardData || this.editor.isActive(this.type.name))
              return !1;
            const t = e.clipboardData.getData("text/plain"), r = e.clipboardData.getData("vscode-editor-data"), i = r ? JSON.parse(r) : void 0, s = i == null ? void 0 : i.mode;
            if (!t || !s)
              return !1;
            const { tr: o, schema: l } = n.state, a = l.text(t.replace(/\r\n?/g, `
`));
            return o.replaceSelectionWith(this.type.create({ language: s }, a)), o.selection.$from.parent.type !== this.type && o.setSelection(T.near(o.doc.resolve(Math.max(0, o.selection.from - 2)))), o.setMeta("paste", !0), n.dispatch(o), !0;
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
  return new j({
    view(e) {
      return new wm(e, n);
    }
  });
}
class wm {
  constructor(e, t) {
    var r;
    this.editorView = e, this.cursorPos = null, this.element = null, this.timeout = -1, this.width = (r = t.width) !== null && r !== void 0 ? r : 1, this.color = t.color === !1 ? void 0 : t.color || "black", this.class = t.class, this.handlers = ["dragover", "dragend", "drop", "dragleave"].map((i) => {
      let s = (o) => {
        this[i](o);
      };
      return e.dom.addEventListener(i, s), { name: i, handler: s };
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
    let e = this.editorView.state.doc.resolve(this.cursorPos), t = !e.parent.inlineContent, r, i = this.editorView.dom, s = i.getBoundingClientRect(), o = s.width / i.offsetWidth, l = s.height / i.offsetHeight;
    if (t) {
      let u = e.nodeBefore, h = e.nodeAfter;
      if (u || h) {
        let p = this.editorView.nodeDOM(this.cursorPos - (u ? u.nodeSize : 0));
        if (p) {
          let f = p.getBoundingClientRect(), m = u ? f.bottom : f.top;
          u && h && (m = (m + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2);
          let g = this.width / 2 * l;
          r = { left: f.left, right: f.right, top: m - g, bottom: m + g };
        }
      }
    }
    if (!r) {
      let u = this.editorView.coordsAtPos(this.cursorPos), h = this.width / 2 * o;
      r = { left: u.left - h, right: u.left + h, top: u.top, bottom: u.bottom };
    }
    let a = this.editorView.dom.offsetParent;
    this.element || (this.element = a.appendChild(document.createElement("div")), this.class && (this.element.className = this.class), this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;", this.color && (this.element.style.backgroundColor = this.color)), this.element.classList.toggle("prosemirror-dropcursor-block", t), this.element.classList.toggle("prosemirror-dropcursor-inline", !t);
    let c, d;
    if (!a || a == document.body && getComputedStyle(a).position == "static")
      c = -pageXOffset, d = -pageYOffset;
    else {
      let u = a.getBoundingClientRect(), h = u.width / a.offsetWidth, p = u.height / a.offsetHeight;
      c = u.left - a.scrollLeft * h, d = u.top - a.scrollTop * p;
    }
    this.element.style.left = (r.left - c) / o + "px", this.element.style.top = (r.top - d) / l + "px", this.element.style.width = (r.right - r.left) / o + "px", this.element.style.height = (r.bottom - r.top) / l + "px";
  }
  scheduleRemoval(e) {
    clearTimeout(this.timeout), this.timeout = setTimeout(() => this.setCursor(null), e);
  }
  dragover(e) {
    if (!this.editorView.editable)
      return;
    let t = this.editorView.posAtCoords({ left: e.clientX, top: e.clientY }), r = t && t.inside >= 0 && this.editorView.state.doc.nodeAt(t.inside), i = r && r.type.spec.disableDropCursor, s = typeof i == "function" ? i(this.editorView, t, e) : i;
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
const Cm = K.create({
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
class q extends N {
  /**
  Create a gap cursor.
  */
  constructor(e) {
    super(e, e);
  }
  map(e, t) {
    let r = e.resolve(t.map(this.head));
    return q.valid(r) ? new q(r) : N.near(r);
  }
  content() {
    return x.empty;
  }
  eq(e) {
    return e instanceof q && e.head == this.head;
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
    return new q(e.resolve(t.pos));
  }
  /**
  @internal
  */
  getBookmark() {
    return new Js(this.anchor);
  }
  /**
  @internal
  */
  static valid(e) {
    let t = e.parent;
    if (t.isTextblock || !Sm(e) || !xm(e))
      return !1;
    let r = t.type.spec.allowGapCursor;
    if (r != null)
      return r;
    let i = t.contentMatchAt(e.index()).defaultType;
    return i && i.isTextblock;
  }
  /**
  @internal
  */
  static findGapCursorFrom(e, t, r = !1) {
    e: for (; ; ) {
      if (!r && q.valid(e))
        return e;
      let i = e.pos, s = null;
      for (let o = e.depth; ; o--) {
        let l = e.node(o);
        if (t > 0 ? e.indexAfter(o) < l.childCount : e.index(o) > 0) {
          s = l.child(t > 0 ? e.indexAfter(o) : e.index(o) - 1);
          break;
        } else if (o == 0)
          return null;
        i += t;
        let a = e.doc.resolve(i);
        if (q.valid(a))
          return a;
      }
      for (; ; ) {
        let o = t > 0 ? s.firstChild : s.lastChild;
        if (!o) {
          if (s.isAtom && !s.isText && !A.isSelectable(s)) {
            e = e.doc.resolve(i + s.nodeSize * t), r = !1;
            continue e;
          }
          break;
        }
        s = o, i += t;
        let l = e.doc.resolve(i);
        if (q.valid(l))
          return l;
      }
      return null;
    }
  }
}
q.prototype.visible = !1;
q.findFrom = q.findGapCursorFrom;
N.jsonID("gapcursor", q);
class Js {
  constructor(e) {
    this.pos = e;
  }
  map(e) {
    return new Js(e.map(this.pos));
  }
  resolve(e) {
    let t = e.resolve(this.pos);
    return q.valid(t) ? new q(t) : N.near(t);
  }
}
function Rc(n) {
  return n.isAtom || n.spec.isolating || n.spec.createGapCursor;
}
function Sm(n) {
  for (let e = n.depth; e >= 0; e--) {
    let t = n.index(e), r = n.node(e);
    if (t == 0) {
      if (r.type.spec.isolating)
        return !0;
      continue;
    }
    for (let i = r.child(t - 1); ; i = i.lastChild) {
      if (i.childCount == 0 && !i.inlineContent || Rc(i.type))
        return !0;
      if (i.inlineContent)
        return !1;
    }
  }
  return !0;
}
function xm(n) {
  for (let e = n.depth; e >= 0; e--) {
    let t = n.indexAfter(e), r = n.node(e);
    if (t == r.childCount) {
      if (r.type.spec.isolating)
        return !0;
      continue;
    }
    for (let i = r.child(t); ; i = i.firstChild) {
      if (i.childCount == 0 && !i.inlineContent || Rc(i.type))
        return !0;
      if (i.inlineContent)
        return !1;
    }
  }
  return !0;
}
function vm() {
  return new j({
    props: {
      decorations: Tm,
      createSelectionBetween(n, e, t) {
        return e.pos == t.pos && q.valid(t) ? new q(t) : null;
      },
      handleClick: Em,
      handleKeyDown: Mm,
      handleDOMEvents: { beforeinput: Am }
    }
  });
}
const Mm = Bs({
  ArrowLeft: Vn("horiz", -1),
  ArrowRight: Vn("horiz", 1),
  ArrowUp: Vn("vert", -1),
  ArrowDown: Vn("vert", 1)
});
function Vn(n, e) {
  const t = n == "vert" ? e > 0 ? "down" : "up" : e > 0 ? "right" : "left";
  return function(r, i, s) {
    let o = r.selection, l = e > 0 ? o.$to : o.$from, a = o.empty;
    if (o instanceof T) {
      if (!s.endOfTextblock(t) || l.depth == 0)
        return !1;
      a = !1, l = r.doc.resolve(e > 0 ? l.after() : l.before());
    }
    let c = q.findGapCursorFrom(l, e, a);
    return c ? (i && i(r.tr.setSelection(new q(c))), !0) : !1;
  };
}
function Em(n, e, t) {
  if (!n || !n.editable)
    return !1;
  let r = n.state.doc.resolve(e);
  if (!q.valid(r))
    return !1;
  let i = n.posAtCoords({ left: t.clientX, top: t.clientY });
  return i && i.inside > -1 && A.isSelectable(n.state.doc.nodeAt(i.inside)) ? !1 : (n.dispatch(n.state.tr.setSelection(new q(r))), !0);
}
function Am(n, e) {
  if (e.inputType != "insertCompositionText" || !(n.state.selection instanceof q))
    return !1;
  let { $from: t } = n.state.selection, r = t.parent.contentMatchAt(t.index()).findWrapping(n.state.schema.nodes.text);
  if (!r)
    return !1;
  let i = y.empty;
  for (let o = r.length - 1; o >= 0; o--)
    i = y.from(r[o].createAndFill(null, i));
  let s = n.state.tr.replace(t.pos, t.pos, new x(i, 0, 0));
  return s.setSelection(T.near(s.doc.resolve(t.pos + 1))), n.dispatch(s), !1;
}
function Tm(n) {
  if (!(n.selection instanceof q))
    return null;
  let e = document.createElement("div");
  return e.className = "ProseMirror-gapcursor", F.create(n.doc, [ie.widget(n.selection.head, e, { key: "gapcursor" })]);
}
const Nm = K.create({
  name: "gapCursor",
  addProseMirrorPlugins() {
    return [
      vm()
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
      allowGapCursor: (e = I(E(n, "allowGapCursor", t))) !== null && e !== void 0 ? e : null
    };
  }
}), Om = B.create({
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
    return ["br", _(this.options.HTMLAttributes, n)];
  },
  renderText() {
    return `
`;
  },
  addCommands() {
    return {
      setHardBreak: () => ({ commands: n, chain: e, state: t, editor: r }) => n.first([
        () => n.exitCode(),
        () => n.command(() => {
          const { selection: i, storedMarks: s } = t;
          if (i.$from.parent.type.spec.isolating)
            return !1;
          const { keepMarks: o } = this.options, { splittableMarks: l } = r.extensionManager, a = s || i.$to.parentOffset && i.$from.marks();
          return e().insertContent({ type: this.name }).command(({ tr: c, dispatch: d }) => {
            if (d && a && o) {
              const u = a.filter((h) => l.includes(h.type.name));
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
}), Lm = B.create({
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
    return [`h${this.options.levels.includes(n.attrs.level) ? n.attrs.level : this.options.levels[0]}`, _(this.options.HTMLAttributes, e), 0];
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
var kr = 200, X = function() {
};
X.prototype.append = function(e) {
  return e.length ? (e = X.from(e), !this.length && e || e.length < kr && this.leafAppend(e) || this.length < kr && e.leafPrepend(this) || this.appendInner(e)) : this;
};
X.prototype.prepend = function(e) {
  return e.length ? X.from(e).append(this) : this;
};
X.prototype.appendInner = function(e) {
  return new Rm(this, e);
};
X.prototype.slice = function(e, t) {
  return e === void 0 && (e = 0), t === void 0 && (t = this.length), e >= t ? X.empty : this.sliceInner(Math.max(0, e), Math.min(this.length, t));
};
X.prototype.get = function(e) {
  if (!(e < 0 || e >= this.length))
    return this.getInner(e);
};
X.prototype.forEach = function(e, t, r) {
  t === void 0 && (t = 0), r === void 0 && (r = this.length), t <= r ? this.forEachInner(e, t, r, 0) : this.forEachInvertedInner(e, t, r, 0);
};
X.prototype.map = function(e, t, r) {
  t === void 0 && (t = 0), r === void 0 && (r = this.length);
  var i = [];
  return this.forEach(function(s, o) {
    return i.push(e(s, o));
  }, t, r), i;
};
X.from = function(e) {
  return e instanceof X ? e : e && e.length ? new Ic(e) : X.empty;
};
var Ic = /* @__PURE__ */ (function(n) {
  function e(r) {
    n.call(this), this.values = r;
  }
  n && (e.__proto__ = n), e.prototype = Object.create(n && n.prototype), e.prototype.constructor = e;
  var t = { length: { configurable: !0 }, depth: { configurable: !0 } };
  return e.prototype.flatten = function() {
    return this.values;
  }, e.prototype.sliceInner = function(i, s) {
    return i == 0 && s == this.length ? this : new e(this.values.slice(i, s));
  }, e.prototype.getInner = function(i) {
    return this.values[i];
  }, e.prototype.forEachInner = function(i, s, o, l) {
    for (var a = s; a < o; a++)
      if (i(this.values[a], l + a) === !1)
        return !1;
  }, e.prototype.forEachInvertedInner = function(i, s, o, l) {
    for (var a = s - 1; a >= o; a--)
      if (i(this.values[a], l + a) === !1)
        return !1;
  }, e.prototype.leafAppend = function(i) {
    if (this.length + i.length <= kr)
      return new e(this.values.concat(i.flatten()));
  }, e.prototype.leafPrepend = function(i) {
    if (this.length + i.length <= kr)
      return new e(i.flatten().concat(this.values));
  }, t.length.get = function() {
    return this.values.length;
  }, t.depth.get = function() {
    return 0;
  }, Object.defineProperties(e.prototype, t), e;
})(X);
X.empty = new Ic([]);
var Rm = /* @__PURE__ */ (function(n) {
  function e(t, r) {
    n.call(this), this.left = t, this.right = r, this.length = t.length + r.length, this.depth = Math.max(t.depth, r.depth) + 1;
  }
  return n && (e.__proto__ = n), e.prototype = Object.create(n && n.prototype), e.prototype.constructor = e, e.prototype.flatten = function() {
    return this.left.flatten().concat(this.right.flatten());
  }, e.prototype.getInner = function(r) {
    return r < this.left.length ? this.left.get(r) : this.right.get(r - this.left.length);
  }, e.prototype.forEachInner = function(r, i, s, o) {
    var l = this.left.length;
    if (i < l && this.left.forEachInner(r, i, Math.min(s, l), o) === !1 || s > l && this.right.forEachInner(r, Math.max(i - l, 0), Math.min(this.length, s) - l, o + l) === !1)
      return !1;
  }, e.prototype.forEachInvertedInner = function(r, i, s, o) {
    var l = this.left.length;
    if (i > l && this.right.forEachInvertedInner(r, i - l, Math.max(s, l) - l, o + l) === !1 || s < l && this.left.forEachInvertedInner(r, Math.min(i, l), s, o) === !1)
      return !1;
  }, e.prototype.sliceInner = function(r, i) {
    if (r == 0 && i == this.length)
      return this;
    var s = this.left.length;
    return i <= s ? this.left.slice(r, i) : r >= s ? this.right.slice(r - s, i - s) : this.left.slice(r, s).append(this.right.slice(0, i - s));
  }, e.prototype.leafAppend = function(r) {
    var i = this.right.leafAppend(r);
    if (i)
      return new e(this.left, i);
  }, e.prototype.leafPrepend = function(r) {
    var i = this.left.leafPrepend(r);
    if (i)
      return new e(i, this.right);
  }, e.prototype.appendInner = function(r) {
    return this.left.depth >= Math.max(this.right.depth, r.depth) + 1 ? new e(this.left, new e(this.right, r)) : new e(this, r);
  }, e;
})(X);
const Im = 500;
class Me {
  constructor(e, t) {
    this.items = e, this.eventCount = t;
  }
  // Pop the latest event off the branch's history and apply it
  // to a document transform.
  popEvent(e, t) {
    if (this.eventCount == 0)
      return null;
    let r = this.items.length;
    for (; ; r--)
      if (this.items.get(r - 1).selection) {
        --r;
        break;
      }
    let i, s;
    t && (i = this.remapping(r, this.items.length), s = i.maps.length);
    let o = e.tr, l, a, c = [], d = [];
    return this.items.forEach((u, h) => {
      if (!u.step) {
        i || (i = this.remapping(r, h + 1), s = i.maps.length), s--, d.push(u);
        return;
      }
      if (i) {
        d.push(new Ae(u.map));
        let p = u.step.map(i.slice(s)), f;
        p && o.maybeStep(p).doc && (f = o.mapping.maps[o.mapping.maps.length - 1], c.push(new Ae(f, void 0, void 0, c.length + d.length))), s--, f && i.appendMap(f, s);
      } else
        o.maybeStep(u.step);
      if (u.selection)
        return l = i ? u.selection.map(i.slice(s)) : u.selection, a = new Me(this.items.slice(0, r).append(d.reverse().concat(c)), this.eventCount - 1), !1;
    }, this.items.length, 0), { remaining: a, transform: o, selection: l };
  }
  // Create a new branch with the given transform added.
  addTransform(e, t, r, i) {
    let s = [], o = this.eventCount, l = this.items, a = !i && l.length ? l.get(l.length - 1) : null;
    for (let d = 0; d < e.steps.length; d++) {
      let u = e.steps[d].invert(e.docs[d]), h = new Ae(e.mapping.maps[d], u, t), p;
      (p = a && a.merge(h)) && (h = p, d ? s.pop() : l = l.slice(0, l.length - 1)), s.push(h), t && (o++, t = void 0), i || (a = h);
    }
    let c = o - r.depth;
    return c > Dm && (l = _m(l, c), o -= c), new Me(l.append(s), o);
  }
  remapping(e, t) {
    let r = new kn();
    return this.items.forEach((i, s) => {
      let o = i.mirrorOffset != null && s - i.mirrorOffset >= e ? r.maps.length - i.mirrorOffset : void 0;
      r.appendMap(i.map, o);
    }, e, t), r;
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
    let r = [], i = Math.max(0, this.items.length - t), s = e.mapping, o = e.steps.length, l = this.eventCount;
    this.items.forEach((h) => {
      h.selection && l--;
    }, i);
    let a = t;
    this.items.forEach((h) => {
      let p = s.getMirror(--a);
      if (p == null)
        return;
      o = Math.min(o, p);
      let f = s.maps[p];
      if (h.step) {
        let m = e.steps[p].invert(e.docs[p]), g = h.selection && h.selection.map(s.slice(a + 1, p));
        g && l++, r.push(new Ae(f, m, g));
      } else
        r.push(new Ae(f));
    }, i);
    let c = [];
    for (let h = t; h < o; h++)
      c.push(new Ae(s.maps[h]));
    let d = this.items.slice(0, i).append(c).append(r), u = new Me(d, l);
    return u.emptyItemCount() > Im && (u = u.compress(this.items.length - r.length)), u;
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
    let t = this.remapping(0, e), r = t.maps.length, i = [], s = 0;
    return this.items.forEach((o, l) => {
      if (l >= e)
        i.push(o), o.selection && s++;
      else if (o.step) {
        let a = o.step.map(t.slice(r)), c = a && a.getMap();
        if (r--, c && t.appendMap(c, r), a) {
          let d = o.selection && o.selection.map(t.slice(r));
          d && s++;
          let u = new Ae(c.invert(), a, d), h, p = i.length - 1;
          (h = i.length && i[p].merge(u)) ? i[p] = h : i.push(u);
        }
      } else o.map && r--;
    }, this.items.length, 0), new Me(X.from(i.reverse()), s);
  }
}
Me.empty = new Me(X.empty, 0);
function _m(n, e) {
  let t;
  return n.forEach((r, i) => {
    if (r.selection && e-- == 0)
      return t = i, !1;
  }), n.slice(t);
}
class Ae {
  constructor(e, t, r, i) {
    this.map = e, this.step = t, this.selection = r, this.mirrorOffset = i;
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
  constructor(e, t, r, i, s) {
    this.done = e, this.undone = t, this.prevRanges = r, this.prevTime = i, this.prevComposition = s;
  }
}
const Dm = 20;
function Pm(n, e, t, r) {
  let i = t.getMeta(Et), s;
  if (i)
    return i.historyState;
  t.getMeta(zm) && (n = new Ye(n.done, n.undone, null, 0, -1));
  let o = t.getMeta("appendedTransaction");
  if (t.steps.length == 0)
    return n;
  if (o && o.getMeta(Et))
    return o.getMeta(Et).redo ? new Ye(n.done.addTransform(t, void 0, r, tr(e)), n.undone, gl(t.mapping.maps), n.prevTime, n.prevComposition) : new Ye(n.done, n.undone.addTransform(t, void 0, r, tr(e)), null, n.prevTime, n.prevComposition);
  if (t.getMeta("addToHistory") !== !1 && !(o && o.getMeta("addToHistory") === !1)) {
    let l = t.getMeta("composition"), a = n.prevTime == 0 || !o && n.prevComposition != l && (n.prevTime < (t.time || 0) - r.newGroupDelay || !Bm(t, n.prevRanges)), c = o ? Ni(n.prevRanges, t.mapping) : gl(t.mapping.maps);
    return new Ye(n.done.addTransform(t, a ? e.selection.getBookmark() : void 0, r, tr(e)), Me.empty, c, t.time, l ?? n.prevComposition);
  } else return (s = t.getMeta("rebased")) ? new Ye(n.done.rebased(t, s), n.undone.rebased(t, s), Ni(n.prevRanges, t.mapping), n.prevTime, n.prevComposition) : new Ye(n.done.addMaps(t.mapping.maps), n.undone.addMaps(t.mapping.maps), Ni(n.prevRanges, t.mapping), n.prevTime, n.prevComposition);
}
function Bm(n, e) {
  if (!e)
    return !1;
  if (!n.docChanged)
    return !0;
  let t = !1;
  return n.mapping.maps[0].forEach((r, i) => {
    for (let s = 0; s < e.length; s += 2)
      r <= e[s + 1] && i >= e[s] && (t = !0);
  }), t;
}
function gl(n) {
  let e = [];
  for (let t = n.length - 1; t >= 0 && e.length == 0; t--)
    n[t].forEach((r, i, s, o) => e.push(s, o));
  return e;
}
function Ni(n, e) {
  if (!n)
    return null;
  let t = [];
  for (let r = 0; r < n.length; r += 2) {
    let i = e.map(n[r], 1), s = e.map(n[r + 1], -1);
    i <= s && t.push(i, s);
  }
  return t;
}
function Hm(n, e, t) {
  let r = tr(e), i = Et.get(e).spec.config, s = (t ? n.undone : n.done).popEvent(e, r);
  if (!s)
    return null;
  let o = s.selection.resolve(s.transform.doc), l = (t ? n.done : n.undone).addTransform(s.transform, e.selection.getBookmark(), i, r), a = new Ye(t ? l : s.remaining, t ? s.remaining : l, null, 0, -1);
  return s.transform.setSelection(o).setMeta(Et, { redo: t, historyState: a });
}
let Oi = !1, bl = null;
function tr(n) {
  let e = n.plugins;
  if (bl != e) {
    Oi = !1, bl = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].spec.historyPreserveItems) {
        Oi = !0;
        break;
      }
  }
  return Oi;
}
const Et = new J("history"), zm = new J("closeHistory");
function $m(n = {}) {
  return n = {
    depth: n.depth || 100,
    newGroupDelay: n.newGroupDelay || 500
  }, new j({
    key: Et,
    state: {
      init() {
        return new Ye(Me.empty, Me.empty, null, 0, -1);
      },
      apply(e, t, r) {
        return Pm(t, r, e, n);
      }
    },
    config: n,
    props: {
      handleDOMEvents: {
        beforeinput(e, t) {
          let r = t.inputType, i = r == "historyUndo" ? Dc : r == "historyRedo" ? Pc : null;
          return !i || !e.editable ? !1 : (t.preventDefault(), i(e.state, e.dispatch));
        }
      }
    }
  });
}
function _c(n, e) {
  return (t, r) => {
    let i = Et.getState(t);
    if (!i || (n ? i.undone : i.done).eventCount == 0)
      return !1;
    if (r) {
      let s = Hm(i, t, n);
      s && r(e ? s.scrollIntoView() : s);
    }
    return !0;
  };
}
const Dc = _c(!1, !0), Pc = _c(!0, !0), Fm = K.create({
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
}), Vm = B.create({
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
    return ["hr", _(this.options.HTMLAttributes, n)];
  },
  addCommands() {
    return {
      setHorizontalRule: () => ({ chain: n, state: e }) => {
        if (!tm(e, e.schema.nodes[this.name]))
          return !1;
        const { selection: t } = e, { $from: r, $to: i } = t, s = n();
        return r.parentOffset === 0 ? s.insertContentAt({
          from: Math.max(r.pos - 1, 0),
          to: i.pos
        }, {
          type: this.name
        }) : Sf(t) ? s.insertContentAt(i.pos, {
          type: this.name
        }) : s.insertContent({ type: this.name }), s.command(({ tr: o, dispatch: l }) => {
          var a;
          if (l) {
            const { $to: c } = o.selection, d = c.end();
            if (c.nodeAfter)
              c.nodeAfter.isTextblock ? o.setSelection(T.create(o.doc, c.pos + 1)) : c.nodeAfter.isBlock ? o.setSelection(A.create(o.doc, c.pos)) : o.setSelection(T.create(o.doc, c.pos));
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
      em({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type
      })
    ];
  }
}), qm = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, Wm = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, jm = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, Um = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, Km = fe.create({
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
    return ["em", _(this.options.HTMLAttributes, n), 0];
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
      Lt({
        find: qm,
        type: this.type
      }),
      Lt({
        find: jm,
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
        find: Um,
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
    return ["li", _(this.options.HTMLAttributes, n), 0];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name)
    };
  }
}), Gm = "listItem", yl = "textStyle", kl = /^(\d+)\.\s$/, Ym = B.create({
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
    return e === 1 ? ["ol", _(this.options.HTMLAttributes, t), 0] : ["ol", _(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      toggleOrderedList: () => ({ commands: n, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(Gm, this.editor.getAttributes(yl)).run() : n.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.commands.toggleOrderedList()
    };
  },
  addInputRules() {
    let n = En({
      find: kl,
      type: this.type,
      getAttributes: (e) => ({ start: +e[1] }),
      joinPredicate: (e, t) => t.childCount + t.attrs.start === +e[1]
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (n = En({
      find: kl,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: (e) => ({ start: +e[1], ...this.editor.getAttributes(yl) }),
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
    return ["p", _(this.options.HTMLAttributes, n), 0];
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
    return ["s", _(this.options.HTMLAttributes, n), 0];
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
      Lt({
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
    return this.options.bold !== !1 && n.push(cm.configure(this.options.bold)), this.options.blockquote !== !1 && n.push(im.configure(this.options.blockquote)), this.options.bulletList !== !1 && n.push(um.configure(this.options.bulletList)), this.options.code !== !1 && n.push(fm.configure(this.options.code)), this.options.codeBlock !== !1 && n.push(bm.configure(this.options.codeBlock)), this.options.document !== !1 && n.push(ym.configure(this.options.document)), this.options.dropcursor !== !1 && n.push(Cm.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && n.push(Nm.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && n.push(Om.configure(this.options.hardBreak)), this.options.heading !== !1 && n.push(Lm.configure(this.options.heading)), this.options.history !== !1 && n.push(Fm.configure(this.options.history)), this.options.horizontalRule !== !1 && n.push(Vm.configure(this.options.horizontalRule)), this.options.italic !== !1 && n.push(Km.configure(this.options.italic)), this.options.listItem !== !1 && n.push(Jm.configure(this.options.listItem)), this.options.orderedList !== !1 && n.push(Ym.configure(this.options.orderedList)), this.options.paragraph !== !1 && n.push(Xm.configure(this.options.paragraph)), this.options.strike !== !1 && n.push(eg.configure(this.options.strike)), this.options.text !== !1 && n.push(tg.configure(this.options.text)), n;
  }
}), rg = fe.create({
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
    return ["u", _(this.options.HTMLAttributes, n), 0];
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
}), ig = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", sg = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", as = "numeric", cs = "ascii", ds = "alpha", un = "asciinumeric", on = "alphanumeric", us = "domain", Bc = "emoji", og = "scheme", lg = "slashscheme", Li = "whitespace";
function ag(n, e) {
  return n in e || (e[n] = []), e[n];
}
function Ct(n, e, t) {
  e[as] && (e[un] = !0, e[on] = !0), e[cs] && (e[un] = !0, e[ds] = !0), e[un] && (e[on] = !0), e[ds] && (e[on] = !0), e[on] && (e[us] = !0), e[Bc] && (e[us] = !0);
  for (const r in e) {
    const i = ag(r, t);
    i.indexOf(n) < 0 && i.push(n);
  }
}
function cg(n, e) {
  const t = {};
  for (const r in e)
    e[r].indexOf(n) >= 0 && (t[r] = !0);
  return t;
}
function he(n = null) {
  this.j = {}, this.jr = [], this.jd = null, this.t = n;
}
he.groups = {};
he.prototype = {
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
    for (let r = 0; r < e.jr.length; r++) {
      const i = e.jr[r][0], s = e.jr[r][1];
      if (s && i.test(n))
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
  ta(n, e, t, r) {
    for (let i = 0; i < n.length; i++)
      this.tt(n[i], e, t, r);
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
  tr(n, e, t, r) {
    r = r || he.groups;
    let i;
    return e && e.j ? i = e : (i = new he(e), t && r && Ct(e, t, r)), this.jr.push([n, i]), i;
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
  ts(n, e, t, r) {
    let i = this;
    const s = n.length;
    if (!s)
      return i;
    for (let o = 0; o < s - 1; o++)
      i = i.tt(n[o]);
    return i.tt(n[s - 1], e, t, r);
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
  tt(n, e, t, r) {
    r = r || he.groups;
    const i = this;
    if (e && e.j)
      return i.j[n] = e, e;
    const s = e;
    let o, l = i.go(n);
    if (l ? (o = new he(), Object.assign(o.j, l.j), o.jr.push.apply(o.jr, l.jr), o.jd = l.jd, o.t = l.t) : o = new he(), s) {
      if (r)
        if (o.t && typeof o.t == "string") {
          const a = Object.assign(cg(o.t, r), t);
          Ct(s, a, r);
        } else t && Ct(s, t, r);
      o.t = s;
    }
    return i.j[n] = o, o;
  }
};
const R = (n, e, t, r, i) => n.ta(e, t, r, i), V = (n, e, t, r, i) => n.tr(e, t, r, i), wl = (n, e, t, r, i) => n.ts(e, t, r, i), C = (n, e, t, r, i) => n.tt(e, t, r, i), Fe = "WORD", hs = "UWORD", Hc = "ASCIINUMERICAL", zc = "ALPHANUMERICAL", An = "LOCALHOST", ps = "TLD", fs = "UTLD", nr = "SCHEME", $t = "SLASH_SCHEME", Gs = "NUM", ms = "WS", Ys = "NL", hn = "OPENBRACE", pn = "CLOSEBRACE", wr = "OPENBRACKET", Cr = "CLOSEBRACKET", Sr = "OPENPAREN", xr = "CLOSEPAREN", vr = "OPENANGLEBRACKET", Mr = "CLOSEANGLEBRACKET", Er = "FULLWIDTHLEFTPAREN", Ar = "FULLWIDTHRIGHTPAREN", Tr = "LEFTCORNERBRACKET", Nr = "RIGHTCORNERBRACKET", Or = "LEFTWHITECORNERBRACKET", Lr = "RIGHTWHITECORNERBRACKET", Rr = "FULLWIDTHLESSTHAN", Ir = "FULLWIDTHGREATERTHAN", _r = "AMPERSAND", Dr = "APOSTROPHE", Pr = "ASTERISK", Xe = "AT", Br = "BACKSLASH", Hr = "BACKTICK", zr = "CARET", Ze = "COLON", Xs = "COMMA", $r = "DOLLAR", Te = "DOT", Fr = "EQUALS", Qs = "EXCLAMATION", ke = "HYPHEN", fn = "PERCENT", Vr = "PIPE", qr = "PLUS", Wr = "POUND", mn = "QUERY", Zs = "QUOTE", $c = "FULLWIDTHMIDDLEDOT", eo = "SEMI", Ne = "SLASH", gn = "TILDE", jr = "UNDERSCORE", Fc = "EMOJI", Ur = "SYM";
var Vc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ALPHANUMERICAL: zc,
  AMPERSAND: _r,
  APOSTROPHE: Dr,
  ASCIINUMERICAL: Hc,
  ASTERISK: Pr,
  AT: Xe,
  BACKSLASH: Br,
  BACKTICK: Hr,
  CARET: zr,
  CLOSEANGLEBRACKET: Mr,
  CLOSEBRACE: pn,
  CLOSEBRACKET: Cr,
  CLOSEPAREN: xr,
  COLON: Ze,
  COMMA: Xs,
  DOLLAR: $r,
  DOT: Te,
  EMOJI: Fc,
  EQUALS: Fr,
  EXCLAMATION: Qs,
  FULLWIDTHGREATERTHAN: Ir,
  FULLWIDTHLEFTPAREN: Er,
  FULLWIDTHLESSTHAN: Rr,
  FULLWIDTHMIDDLEDOT: $c,
  FULLWIDTHRIGHTPAREN: Ar,
  HYPHEN: ke,
  LEFTCORNERBRACKET: Tr,
  LEFTWHITECORNERBRACKET: Or,
  LOCALHOST: An,
  NL: Ys,
  NUM: Gs,
  OPENANGLEBRACKET: vr,
  OPENBRACE: hn,
  OPENBRACKET: wr,
  OPENPAREN: Sr,
  PERCENT: fn,
  PIPE: Vr,
  PLUS: qr,
  POUND: Wr,
  QUERY: mn,
  QUOTE: Zs,
  RIGHTCORNERBRACKET: Nr,
  RIGHTWHITECORNERBRACKET: Lr,
  SCHEME: nr,
  SEMI: eo,
  SLASH: Ne,
  SLASH_SCHEME: $t,
  SYM: Ur,
  TILDE: gn,
  TLD: ps,
  UNDERSCORE: jr,
  UTLD: fs,
  UWORD: hs,
  WORD: Fe,
  WS: ms
});
const ze = /[a-z]/, Zt = new RegExp("\\p{L}", "u"), Ri = new RegExp("\\p{Emoji}", "u"), $e = /\d/, Ii = /\s/, Cl = "\r", _i = `
`, dg = "️", ug = "‍", Di = "￼";
let qn = null, Wn = null;
function hg(n = []) {
  const e = {};
  he.groups = e;
  const t = new he();
  qn == null && (qn = Sl(ig)), Wn == null && (Wn = Sl(sg)), C(t, "'", Dr), C(t, "{", hn), C(t, "}", pn), C(t, "[", wr), C(t, "]", Cr), C(t, "(", Sr), C(t, ")", xr), C(t, "<", vr), C(t, ">", Mr), C(t, "（", Er), C(t, "）", Ar), C(t, "「", Tr), C(t, "」", Nr), C(t, "『", Or), C(t, "』", Lr), C(t, "＜", Rr), C(t, "＞", Ir), C(t, "&", _r), C(t, "*", Pr), C(t, "@", Xe), C(t, "`", Hr), C(t, "^", zr), C(t, ":", Ze), C(t, ",", Xs), C(t, "$", $r), C(t, ".", Te), C(t, "=", Fr), C(t, "!", Qs), C(t, "-", ke), C(t, "%", fn), C(t, "|", Vr), C(t, "+", qr), C(t, "#", Wr), C(t, "?", mn), C(t, '"', Zs), C(t, "/", Ne), C(t, ";", eo), C(t, "~", gn), C(t, "_", jr), C(t, "\\", Br), C(t, "・", $c);
  const r = V(t, $e, Gs, {
    [as]: !0
  });
  V(r, $e, r);
  const i = V(r, ze, Hc, {
    [un]: !0
  }), s = V(r, Zt, zc, {
    [on]: !0
  }), o = V(t, ze, Fe, {
    [cs]: !0
  });
  V(o, $e, i), V(o, ze, o), V(i, $e, i), V(i, ze, i);
  const l = V(t, Zt, hs, {
    [ds]: !0
  });
  V(l, ze), V(l, $e, s), V(l, Zt, l), V(s, $e, s), V(s, ze), V(s, Zt, s);
  const a = C(t, _i, Ys, {
    [Li]: !0
  }), c = C(t, Cl, ms, {
    [Li]: !0
  }), d = V(t, Ii, ms, {
    [Li]: !0
  });
  C(t, Di, d), C(c, _i, a), C(c, Di, d), V(c, Ii, d), C(d, Cl), C(d, _i), V(d, Ii, d), C(d, Di, d);
  const u = V(t, Ri, Fc, {
    [Bc]: !0
  });
  C(u, "#"), V(u, Ri, u), C(u, dg, u);
  const h = C(u, ug);
  C(h, "#"), V(h, Ri, u);
  const p = [[ze, o], [$e, i]], f = [[ze, null], [Zt, l], [$e, s]];
  for (let m = 0; m < qn.length; m++)
    Ke(t, qn[m], ps, Fe, p);
  for (let m = 0; m < Wn.length; m++)
    Ke(t, Wn[m], fs, hs, f);
  Ct(ps, {
    tld: !0,
    ascii: !0
  }, e), Ct(fs, {
    utld: !0,
    alpha: !0
  }, e), Ke(t, "file", nr, Fe, p), Ke(t, "mailto", nr, Fe, p), Ke(t, "http", $t, Fe, p), Ke(t, "https", $t, Fe, p), Ke(t, "ftp", $t, Fe, p), Ke(t, "ftps", $t, Fe, p), Ct(nr, {
    scheme: !0,
    ascii: !0
  }, e), Ct($t, {
    slashscheme: !0,
    ascii: !0
  }, e), n = n.sort((m, g) => m[0] > g[0] ? 1 : -1);
  for (let m = 0; m < n.length; m++) {
    const g = n[m][0], k = n[m][1] ? {
      [og]: !0
    } : {
      [lg]: !0
    };
    g.indexOf("-") >= 0 ? k[us] = !0 : ze.test(g) ? $e.test(g) ? k[un] = !0 : k[cs] = !0 : k[as] = !0, wl(t, g, g, k);
  }
  return wl(t, "localhost", An, {
    ascii: !0
  }), t.jd = new he(Ur), {
    start: t,
    tokens: Object.assign({
      groups: e
    }, Vc)
  };
}
function qc(n, e) {
  const t = pg(e.replace(/[A-Z]/g, (l) => l.toLowerCase())), r = t.length, i = [];
  let s = 0, o = 0;
  for (; o < r; ) {
    let l = n, a = null, c = 0, d = null, u = -1, h = -1;
    for (; o < r && (a = l.go(t[o])); )
      l = a, l.accepts() ? (u = 0, h = 0, d = l) : u >= 0 && (u += t[o].length, h++), c += t[o].length, s += t[o].length, o++;
    s -= u, o -= h, c -= u, i.push({
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
  return i;
}
function pg(n) {
  const e = [], t = n.length;
  let r = 0;
  for (; r < t; ) {
    let i = n.charCodeAt(r), s, o = i < 55296 || i > 56319 || r + 1 === t || (s = n.charCodeAt(r + 1)) < 56320 || s > 57343 ? n[r] : n.slice(r, r + 2);
    e.push(o), r += o.length;
  }
  return e;
}
function Ke(n, e, t, r, i) {
  let s;
  const o = e.length;
  for (let l = 0; l < o - 1; l++) {
    const a = e[l];
    n.j[a] ? s = n.j[a] : (s = new he(r), s.jr = i.slice(), n.j[a] = s), n = s;
  }
  return s = new he(t), s.jr = i.slice(), n.j[e[o - 1]] = s, s;
}
function Sl(n) {
  const e = [], t = [];
  let r = 0, i = "0123456789";
  for (; r < n.length; ) {
    let s = 0;
    for (; i.indexOf(n[r + s]) >= 0; )
      s++;
    if (s > 0) {
      e.push(t.join(""));
      for (let o = parseInt(n.substring(r, r + s), 10); o > 0; o--)
        t.pop();
      r += s;
    } else
      t.push(n[r]), r++;
  }
  return e;
}
const Tn = {
  defaultProtocol: "http",
  events: null,
  format: xl,
  formatHref: xl,
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
function to(n, e = null) {
  let t = Object.assign({}, Tn);
  n && (t = Object.assign(t, n instanceof to ? n.o : n));
  const r = t.ignoreTags, i = [];
  for (let s = 0; s < r.length; s++)
    i.push(r[s].toUpperCase());
  this.o = t, e && (this.defaultRender = e), this.ignoreTags = i;
}
to.prototype = {
  o: Tn,
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
    const r = e != null;
    let i = this.o[n];
    return i && (typeof i == "object" ? (i = t.t in i ? i[t.t] : Tn[n], typeof i == "function" && r && (i = i(e, t))) : typeof i == "function" && r && (i = i(e, t.t, t)), i);
  },
  /**
   * @template {keyof Opts} L
   * @param {L} key Name of options object to use
   * @param {string} [operator]
   * @param {MultiToken} [token]
   * @returns {Opts[L] | any}
   */
  getObj(n, e, t) {
    let r = this.o[n];
    return typeof r == "function" && e != null && (r = r(e, t.t, t)), r;
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
function xl(n) {
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
    const e = this.toString(), t = n.get("truncate", e, this), r = n.get("format", e, this);
    return t && r.length > t ? r.substring(0, t) + "…" : r;
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
  toObject(n = Tn.defaultProtocol) {
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
    const e = this, t = this.toHref(n.get("defaultProtocol")), r = n.get("formatHref", t, this), i = n.get("tagName", t, e), s = this.toFormattedString(n), o = {}, l = n.get("className", t, e), a = n.get("target", t, e), c = n.get("rel", t, e), d = n.getObj("attributes", t, e), u = n.getObj("events", t, e);
    return o.href = r, l && (o.class = l), a && (o.target = a), c && (o.rel = c), d && Object.assign(o, d), {
      tagName: i,
      attributes: o,
      content: s,
      eventListeners: u
    };
  }
};
function li(n, e) {
  class t extends Wc {
    constructor(i, s) {
      super(i, s), this.t = n;
    }
  }
  for (const r in e)
    t.prototype[r] = e[r];
  return t.t = n, t;
}
const vl = li("email", {
  isLink: !0,
  toHref() {
    return "mailto:" + this.toString();
  }
}), Ml = li("text"), fg = li("nl"), jn = li("url", {
  isLink: !0,
  /**
  	Lowercases relevant parts of the domain and adds the protocol if
  	required. Note that this will not escape unsafe HTML characters in the
  	URL.
  		@param {string} [scheme] default scheme (e.g., 'https')
  	@return {string} the full href
  */
  toHref(n = Tn.defaultProtocol) {
    return this.hasProtocol() ? this.v : `${n}://${this.v}`;
  },
  /**
   * Check whether this URL token has a protocol
   * @return {boolean}
   */
  hasProtocol() {
    const n = this.tk;
    return n.length >= 2 && n[0].t !== An && n[1].t === Ze;
  }
}), ye = (n) => new he(n);
function mg({
  groups: n
}) {
  const e = n.domain.concat([_r, Pr, Xe, Br, Hr, zr, $r, Fr, ke, Gs, fn, Vr, qr, Wr, Ne, Ur, gn, jr]), t = [Dr, Ze, Xs, Te, Qs, fn, mn, Zs, eo, vr, Mr, hn, pn, Cr, wr, Sr, xr, Er, Ar, Tr, Nr, Or, Lr, Rr, Ir], r = [_r, Dr, Pr, Br, Hr, zr, $r, Fr, ke, hn, pn, fn, Vr, qr, Wr, mn, Ne, Ur, gn, jr], i = ye(), s = C(i, gn);
  R(s, r, s), R(s, n.domain, s);
  const o = ye(), l = ye(), a = ye();
  R(i, n.domain, o), R(i, n.scheme, l), R(i, n.slashscheme, a), R(o, r, s), R(o, n.domain, o);
  const c = C(o, Xe);
  C(s, Xe, c), C(l, Xe, c), C(a, Xe, c);
  const d = C(s, Te);
  R(d, r, s), R(d, n.domain, s);
  const u = ye();
  R(c, n.domain, u), R(u, n.domain, u);
  const h = C(u, Te);
  R(h, n.domain, u);
  const p = ye(vl);
  R(h, n.tld, p), R(h, n.utld, p), C(c, An, p);
  const f = C(u, ke);
  C(f, ke, f), R(f, n.domain, u), R(p, n.domain, u), C(p, Te, h), C(p, ke, f);
  const m = C(p, Ze);
  R(m, n.numeric, vl);
  const g = C(o, ke), b = C(o, Te);
  C(g, ke, g), R(g, n.domain, o), R(b, r, s), R(b, n.domain, o);
  const k = ye(jn);
  R(b, n.tld, k), R(b, n.utld, k), R(k, n.domain, o), R(k, r, s), C(k, Te, b), C(k, ke, g), C(k, Xe, c);
  const w = C(k, Ze), v = ye(jn);
  R(w, n.numeric, v);
  const S = ye(jn), L = ye();
  R(S, e, S), R(S, t, L), R(L, e, S), R(L, t, L), C(k, Ne, S), C(v, Ne, S);
  const M = C(l, Ze), O = C(a, Ze), D = C(O, Ne), ve = C(D, Ne);
  R(l, n.domain, o), C(l, Te, b), C(l, ke, g), R(a, n.domain, o), C(a, Te, b), C(a, ke, g), R(M, n.domain, S), C(M, Ne, S), C(M, mn, S), R(ve, n.domain, S), R(ve, e, S), C(ve, Ne, S);
  const _e = [
    [hn, pn],
    // {}
    [wr, Cr],
    // []
    [Sr, xr],
    // ()
    [vr, Mr],
    // <>
    [Er, Ar],
    // （）
    [Tr, Nr],
    // 「」
    [Or, Lr],
    // 『』
    [Rr, Ir]
    // ＜＞
  ];
  for (let H = 0; H < _e.length; H++) {
    const [ce, De] = _e[H], ft = C(S, ce);
    C(L, ce, ft), C(ft, De, S);
    const Pe = ye(jn);
    R(ft, e, Pe);
    const Be = ye();
    R(ft, t), R(Pe, e, Pe), R(Pe, t, Be), R(Be, e, Pe), R(Be, t, Be), C(Pe, De, S), C(Be, De, S);
  }
  return C(i, An, k), C(i, Ys, fg), {
    start: i,
    tokens: Vc
  };
}
function gg(n, e, t) {
  let r = t.length, i = 0, s = [], o = [];
  for (; i < r; ) {
    let l = n, a = null, c = null, d = 0, u = null, h = -1;
    for (; i < r && !(a = l.go(t[i].t)); )
      o.push(t[i++]);
    for (; i < r && (c = a || l.go(t[i].t)); )
      a = null, l = c, l.accepts() ? (h = 0, u = l) : h >= 0 && h++, i++, d++;
    if (h < 0)
      i -= d, i < r && (o.push(t[i]), i++);
    else {
      o.length > 0 && (s.push(Pi(Ml, e, o)), o = []), i -= h, d -= h;
      const p = u.t, f = t.slice(i - d, i);
      s.push(Pi(p, e, f));
    }
  }
  return o.length > 0 && s.push(Pi(Ml, e, o)), s;
}
function Pi(n, e, t) {
  const r = t[0].s, i = t[t.length - 1].e, s = e.slice(r, i);
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
  return he.groups = {}, $.scanner = null, $.parser = null, $.tokenQueue = [], $.pluginQueue = [], $.customSchemes = [], $.initialized = !1, $;
}
function El(n, e = !1) {
  if ($.initialized && bg(`linkifyjs: already initialized - will not register custom scheme "${n}" ${yg}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(n))
    throw new Error(`linkifyjs: incorrect scheme format.
1. Must only contain digits, lowercase ASCII letters or "-"
2. Cannot start or end with "-"
3. "-" cannot repeat`);
  $.customSchemes.push([n, e]);
}
function wg() {
  $.scanner = hg($.customSchemes);
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
function no(n) {
  return $.initialized || wg(), gg($.parser.start, n, qc($.scanner.start, n));
}
no.scan = qc;
function jc(n, e = null, t = null) {
  if (e && typeof e == "object") {
    if (t)
      throw Error(`linkifyjs: Invalid link type ${e}; must be a string`);
    t = e, e = null;
  }
  const r = new to(t), i = no(n), s = [];
  for (let o = 0; o < i.length; o++) {
    const l = i[o];
    l.isLink && (!e || l.t === e) && r.check(l) && s.push(l.toFormattedObject(r));
  }
  return s;
}
const ro = "[\0-   ᠎ -\u2029 　]", Cg = new RegExp(ro), Sg = new RegExp(`${ro}$`), xg = new RegExp(ro, "g");
function vg(n) {
  return n.length === 1 ? n[0].isLink : n.length === 3 && n[1].isLink ? ["()", "[]"].includes(n[0].value + n[2].value) : !1;
}
function Mg(n) {
  return new j({
    key: new J("autolink"),
    appendTransaction: (e, t, r) => {
      const i = e.some((c) => c.docChanged) && !t.doc.eq(r.doc), s = e.some((c) => c.getMeta("preventAutolink"));
      if (!i || s)
        return;
      const { tr: o } = r, l = pf(t.doc, [...e]);
      if (wf(l).forEach(({ newRange: c }) => {
        const d = mf(r.doc, c, (p) => p.isTextblock);
        let u, h;
        if (d.length > 1)
          u = d[0], h = r.doc.textBetween(u.pos, u.pos + u.node.nodeSize, void 0, " ");
        else if (d.length) {
          const p = r.doc.textBetween(c.from, c.to, " ", " ");
          if (!Sg.test(p))
            return;
          u = d[0], h = r.doc.textBetween(u.pos, c.to, void 0, " ");
        }
        if (u && h) {
          const p = h.split(Cg).filter(Boolean);
          if (p.length <= 0)
            return !1;
          const f = p[p.length - 1], m = u.pos + h.lastIndexOf(f);
          if (!f)
            return !1;
          const g = no(f).map((b) => b.toObject(n.defaultProtocol));
          if (!vg(g))
            return !1;
          g.filter((b) => b.isLink).map((b) => ({
            ...b,
            from: m + b.start + 1,
            to: m + b.end + 1
          })).filter((b) => r.schema.marks.code ? !r.doc.rangeHasMark(b.from, b.to, r.schema.marks.code) : !0).filter((b) => n.validate(b.value)).filter((b) => n.shouldAutoLink(b.value)).forEach((b) => {
            Ks(b.from, b.to, r.doc).some((k) => k.mark.type === n.type) || o.addMark(b.from, b.to, n.type.create({
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
  return new j({
    key: new J("handleClickLink"),
    props: {
      handleClick: (e, t, r) => {
        var i, s;
        if (r.button !== 0 || !e.editable)
          return !1;
        let o = r.target;
        const l = [];
        for (; o.nodeName !== "DIV"; )
          l.push(o), o = o.parentNode;
        if (!l.find((h) => h.nodeName === "A"))
          return !1;
        const a = Lc(e.state, n.type.name), c = r.target, d = (i = c == null ? void 0 : c.href) !== null && i !== void 0 ? i : a.href, u = (s = c == null ? void 0 : c.target) !== null && s !== void 0 ? s : a.target;
        return c && d ? (window.open(d, u), !0) : !1;
      }
    }
  });
}
function Ag(n) {
  return new j({
    key: new J("handlePasteLink"),
    props: {
      handlePaste: (e, t, r) => {
        const { state: i } = e, { selection: s } = i, { empty: o } = s;
        if (o)
          return !1;
        let l = "";
        r.content.forEach((c) => {
          l += c.textContent;
        });
        const a = jc(l, { defaultProtocol: n.defaultProtocol }).find((c) => c.isLink && c.value === l);
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
  return e && e.forEach((r) => {
    const i = typeof r == "string" ? r : r.scheme;
    i && t.push(i);
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
        El(n);
        return;
      }
      El(n.scheme, n.optionalSlashes);
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
    }) ? ["a", _(this.options.HTMLAttributes, n), 0] : [
      "a",
      _(this.options.HTMLAttributes, { ...n, href: "" }),
      0
    ];
  },
  addCommands() {
    return {
      setLink: (n) => ({ chain: e }) => {
        const { href: t } = n;
        return this.options.isAllowedUri(t, {
          defaultValidate: (r) => !!mt(r, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? e().setMark(this.name, n).setMeta("preventAutolink", !0).run() : !1;
      },
      toggleLink: (n) => ({ chain: e }) => {
        const { href: t } = n;
        return this.options.isAllowedUri(t, {
          defaultValidate: (r) => !!mt(r, this.options.protocols),
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
            const { protocols: t, defaultProtocol: r } = this.options, i = jc(n).filter((s) => s.isLink && this.options.isAllowedUri(s.value, {
              defaultValidate: (o) => !!mt(o, t),
              protocols: t,
              defaultProtocol: r
            }));
            i.length && i.forEach((s) => e.push({
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
      validate: (r) => this.options.isAllowedUri(r, {
        defaultValidate: (i) => !!mt(i, e),
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
}), Og = K.create({
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
      new j({
        key: new J("placeholder"),
        props: {
          decorations: ({ doc: n, selection: e }) => {
            const t = this.editor.isEditable || !this.options.showOnlyWhenEditable, { anchor: r } = e, i = [];
            if (!t)
              return null;
            const s = this.editor.isEmpty;
            return n.descendants((o, l) => {
              const a = r >= l && r <= l + o.nodeSize, c = !o.isLeaf && oi(o);
              if ((a || !this.options.showOnlyCurrent) && c) {
                const d = [this.options.emptyNodeClass];
                s && d.push(this.options.emptyEditorClass);
                const u = ie.node(l, l + o.nodeSize, {
                  class: d.join(" "),
                  "data-placeholder": typeof this.options.placeholder == "function" ? this.options.placeholder({
                    editor: this.editor,
                    node: o,
                    pos: l,
                    hasAnchor: a
                  }) : this.options.placeholder
                });
                i.push(u);
              }
              return this.options.includeChildren;
            }), F.create(n, i);
          }
        }
      })
    ];
  }
}), Lg = K.create({
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
        const r = e.textBetween(0, e.content.size, void 0, " ");
        return this.options.textCounter(r);
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
      new j({
        key: new J("characterCount"),
        appendTransaction: (e, t, r) => {
          if (n)
            return;
          const i = this.options.limit;
          if (i == null || i === 0) {
            n = !0;
            return;
          }
          const s = this.storage.characters({ node: r.doc });
          if (s > i) {
            const o = s - i, l = 0, a = o;
            console.warn(`[CharacterCount] Initial content exceeded limit of ${i} characters. Content was automatically trimmed.`);
            const c = r.tr.deleteRange(l, a);
            return n = !0, c;
          }
          n = !0;
        },
        filterTransaction: (e, t) => {
          const r = this.options.limit;
          if (!e.docChanged || r === 0 || r === null || r === void 0)
            return !0;
          const i = this.storage.characters({ node: t.doc }), s = this.storage.characters({ node: e.doc });
          if (s <= r || i > r && s > r && s <= i)
            return !0;
          if (i > r && s > r && s > i || !e.getMeta("paste"))
            return !1;
          const l = e.selection.$head.pos, a = s - r, c = l - a, d = l;
          return e.deleteRange(c, d), !(this.storage.characters({ node: e.doc }) > r);
        }
      })
    ];
  }
}), Rg = fe.create({
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
    return ["sub", _(this.options.HTMLAttributes, n), 0];
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
}), Ig = fe.create({
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
    return ["sup", _(this.options.HTMLAttributes, n), 0];
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
}), _g = (n) => {
  if (!n.children.length)
    return;
  const e = n.querySelectorAll("span");
  e && e.forEach((t) => {
    var r, i;
    const s = t.getAttribute("style"), o = (i = (r = t.parentElement) === null || r === void 0 ? void 0 : r.closest("span")) === null || i === void 0 ? void 0 : i.getAttribute("style");
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
        getAttrs: (n) => n.hasAttribute("style") ? (this.options.mergeNestedSpanStyles && _g(n), {}) : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: n }) {
    return ["span", _(this.options.HTMLAttributes, n), 0];
  },
  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ tr: n }) => {
        const { selection: e } = n;
        return n.doc.nodesBetween(e.from, e.to, (t, r) => {
          if (t.isTextblock)
            return !0;
          t.marks.filter((i) => i.type === this.type).some((i) => Object.values(i.attrs).some((s) => !!s)) || n.removeMark(r, r + t.nodeSize, this.type);
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
    return ["mark", _(this.options.HTMLAttributes, n), 0];
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
      Lt({
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
  gs = (r) => {
    for (let i = 0; i < n.length; i += 2) if (n[i] == r) return n[i + 1];
  }, bs = (r, i) => (t == 10 && (t = 0), n[t++] = r, n[t++] = i);
}
var W = class {
  constructor(n, e, t, r) {
    this.width = n, this.height = e, this.map = t, this.problems = r;
  }
  findCell(n) {
    for (let e = 0; e < this.map.length; e++) {
      const t = this.map[e];
      if (t != n) continue;
      const r = e % this.width, i = e / this.width | 0;
      let s = r + 1, o = i + 1;
      for (let l = 1; s < this.width && this.map[e + l] == t; l++) s++;
      for (let l = 1; o < this.height && this.map[e + this.width * l] == t; l++) o++;
      return {
        left: r,
        top: i,
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
    const { left: r, right: i, top: s, bottom: o } = this.findCell(n);
    return e == "horiz" ? (t < 0 ? r == 0 : i == this.width) ? null : this.map[s * this.width + (t < 0 ? r - 1 : i)] : (t < 0 ? s == 0 : o == this.height) ? null : this.map[r + this.width * (t < 0 ? s - 1 : o)];
  }
  rectBetween(n, e) {
    const { left: t, right: r, top: i, bottom: s } = this.findCell(n), { left: o, right: l, top: a, bottom: c } = this.findCell(e);
    return {
      left: Math.min(t, o),
      top: Math.min(i, a),
      right: Math.max(r, l),
      bottom: Math.max(s, c)
    };
  }
  cellsInRect(n) {
    const e = [], t = {};
    for (let r = n.top; r < n.bottom; r++) for (let i = n.left; i < n.right; i++) {
      const s = r * this.width + i, o = this.map[s];
      t[o] || (t[o] = !0, !(i == n.left && i && this.map[s - 1] == o || r == n.top && r && this.map[s - this.width] == o) && e.push(o));
    }
    return e;
  }
  positionAt(n, e, t) {
    for (let r = 0, i = 0; ; r++) {
      const s = i + t.child(r).nodeSize;
      if (r == n) {
        let o = e + n * this.width;
        const l = (n + 1) * this.width;
        for (; o < l && this.map[o] < i; ) o++;
        return o == l ? s - 1 : this.map[o];
      }
      i = s;
    }
  }
  static get(n) {
    return gs(n) || bs(n, $g(n));
  }
};
function $g(n) {
  if (n.type.spec.tableRole != "table") throw new RangeError("Not a table node: " + n.type.name);
  const e = Fg(n), t = n.childCount, r = [];
  let i = 0, s = null;
  const o = [];
  for (let c = 0, d = e * t; c < d; c++) r[c] = 0;
  for (let c = 0, d = 0; c < t; c++) {
    const u = n.child(c);
    d++;
    for (let f = 0; ; f++) {
      for (; i < r.length && r[i] != 0; ) i++;
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
        const v = i + w * e;
        for (let S = 0; S < g; S++) {
          r[v + S] == 0 ? r[v + S] = d : (s || (s = [])).push({
            type: "collision",
            row: c,
            pos: d,
            n: g - S
          });
          const L = k && k[S];
          if (L) {
            const M = (v + S) % e * 2, O = o[M];
            O == null || O != L && o[M + 1] == 1 ? (o[M] = L, o[M + 1] = 1) : O == L && o[M + 1]++;
          }
        }
      }
      i += g, d += m.nodeSize;
    }
    const h = (c + 1) * e;
    let p = 0;
    for (; i < h; ) r[i++] == 0 && p++;
    p && (s || (s = [])).push({
      type: "missing",
      row: c,
      n: p
    }), d++;
  }
  (e === 0 || t === 0) && (s || (s = [])).push({ type: "zero_sized" });
  const l = new W(e, t, r, s);
  let a = !1;
  for (let c = 0; !a && c < o.length; c += 2) o[c] != null && o[c + 1] < t && (a = !0);
  return a && Vg(l, o, n), l;
}
function Fg(n) {
  let e = -1, t = !1;
  for (let r = 0; r < n.childCount; r++) {
    const i = n.child(r);
    let s = 0;
    if (t) for (let o = 0; o < r; o++) {
      const l = n.child(o);
      for (let a = 0; a < l.childCount; a++) {
        const c = l.child(a);
        o + c.attrs.rowspan > r && (s += c.attrs.colspan);
      }
    }
    for (let o = 0; o < i.childCount; o++) {
      const l = i.child(o);
      s += l.attrs.colspan, l.attrs.rowspan > 1 && (t = !0);
    }
    e == -1 ? e = s : e != s && (e = Math.max(e, s));
  }
  return e;
}
function Vg(n, e, t) {
  n.problems || (n.problems = []);
  const r = {};
  for (let i = 0; i < n.map.length; i++) {
    const s = n.map[i];
    if (r[s]) continue;
    r[s] = !0;
    const o = t.nodeAt(s);
    if (!o) throw new RangeError(`No cell with offset ${s} found`);
    let l = null;
    const a = o.attrs;
    for (let c = 0; c < a.colspan; c++) {
      const d = e[(i + c) % n.width * 2];
      d != null && (!a.colwidth || a.colwidth[c] != d) && ((l || (l = qg(a)))[c] = d);
    }
    l && n.problems.unshift({
      type: "colwidth mismatch",
      pos: s,
      colwidth: l
    });
  }
}
function qg(n) {
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
      const r = n.nodes[t], i = r.spec.tableRole;
      i && (e[i] = r);
    }
  }
  return e;
}
const et = new J("selectingCells");
function Rt(n) {
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
function ai(n) {
  const e = n.selection;
  if ("$anchorCell" in e && e.$anchorCell) return e.$anchorCell.pos > e.$headCell.pos ? e.$anchorCell : e.$headCell;
  if ("node" in e && e.node && e.node.type.spec.tableRole == "cell") return e.$anchor;
  const t = Rt(e.$head) || jg(e.$head);
  if (t) return t;
  throw new RangeError(`No cell found around position ${e.head}`);
}
function jg(n) {
  for (let e = n.nodeAfter, t = n.pos; e; e = e.firstChild, t++) {
    const r = e.type.spec.tableRole;
    if (r == "cell" || r == "header_cell") return n.doc.resolve(t);
  }
  for (let e = n.nodeBefore, t = n.pos; e; e = e.lastChild, t--) {
    const r = e.type.spec.tableRole;
    if (r == "cell" || r == "header_cell") return n.doc.resolve(t - e.nodeSize);
  }
}
function ys(n) {
  return n.parent.type.spec.tableRole == "row" && !!n.nodeAfter;
}
function Ug(n) {
  return n.node(0).resolve(n.pos + n.nodeAfter.nodeSize);
}
function io(n, e) {
  return n.depth == e.depth && n.pos >= e.start(-1) && n.pos <= e.end(-1);
}
function Uc(n, e, t) {
  const r = n.node(-1), i = W.get(r), s = n.start(-1), o = i.nextCell(n.pos - s, e, t);
  return o == null ? null : n.node(0).resolve(s + o);
}
function It(n, e, t = 1) {
  const r = {
    ...n,
    colspan: n.colspan - t
  };
  return r.colwidth && (r.colwidth = r.colwidth.slice(), r.colwidth.splice(e, t), r.colwidth.some((i) => i > 0) || (r.colwidth = null)), r;
}
function Kc(n, e, t = 1) {
  const r = {
    ...n,
    colspan: n.colspan + t
  };
  if (r.colwidth) {
    r.colwidth = r.colwidth.slice();
    for (let i = 0; i < t; i++) r.colwidth.splice(e, 0, 0);
  }
  return r;
}
function Kg(n, e, t) {
  const r = le(e.type.schema).header_cell;
  for (let i = 0; i < n.height; i++) if (e.nodeAt(n.map[t + i * n.width]).type != r) return !1;
  return !0;
}
var z = class Ve extends N {
  constructor(e, t = e) {
    const r = e.node(-1), i = W.get(r), s = e.start(-1), o = i.rectBetween(e.pos - s, t.pos - s), l = e.node(0), a = i.cellsInRect(o).filter((d) => d != t.pos - s);
    a.unshift(t.pos - s);
    const c = a.map((d) => {
      const u = r.nodeAt(d);
      if (!u) throw new RangeError(`No cell with offset ${d} found`);
      const h = s + d + 1;
      return new va(l.resolve(h), l.resolve(h + u.content.size));
    });
    super(c[0].$from, c[0].$to, c), this.$anchorCell = e, this.$headCell = t;
  }
  map(e, t) {
    const r = e.resolve(t.map(this.$anchorCell.pos)), i = e.resolve(t.map(this.$headCell.pos));
    if (ys(r) && ys(i) && io(r, i)) {
      const s = this.$anchorCell.node(-1) != r.node(-1);
      return s && this.isRowSelection() ? Ve.rowSelection(r, i) : s && this.isColSelection() ? Ve.colSelection(r, i) : new Ve(r, i);
    }
    return T.between(r, i);
  }
  content() {
    const e = this.$anchorCell.node(-1), t = W.get(e), r = this.$anchorCell.start(-1), i = t.rectBetween(this.$anchorCell.pos - r, this.$headCell.pos - r), s = {}, o = [];
    for (let a = i.top; a < i.bottom; a++) {
      const c = [];
      for (let d = a * t.width + i.left, u = i.left; u < i.right; u++, d++) {
        const h = t.map[d];
        if (s[h]) continue;
        s[h] = !0;
        const p = t.findCell(h);
        let f = e.nodeAt(h);
        if (!f) throw new RangeError(`No cell with offset ${h} found`);
        const m = i.left - p.left, g = p.right - i.right;
        if (m > 0 || g > 0) {
          let b = f.attrs;
          if (m > 0 && (b = It(b, 0, m)), g > 0 && (b = It(b, b.colspan - g, g)), p.left < i.left) {
            if (f = f.type.createAndFill(b), !f) throw new RangeError(`Could not create cell with attrs ${JSON.stringify(b)}`);
          } else f = f.type.create(b, f.content);
        }
        if (p.top < i.top || p.bottom > i.bottom) {
          const b = {
            ...f.attrs,
            rowspan: Math.min(p.bottom, i.bottom) - Math.max(p.top, i.top)
          };
          p.top < i.top ? f = f.type.createAndFill(b) : f = f.type.create(b, f.content);
        }
        c.push(f);
      }
      o.push(e.child(a).copy(y.from(c)));
    }
    const l = this.isColSelection() && this.isRowSelection() ? e : o;
    return new x(y.from(l), 1, 1);
  }
  replace(e, t = x.empty) {
    const r = e.steps.length, i = this.ranges;
    for (let o = 0; o < i.length; o++) {
      const { $from: l, $to: a } = i[o], c = e.mapping.slice(r);
      e.replace(c.map(l.pos), c.map(a.pos), o ? x.empty : t);
    }
    const s = N.findFrom(e.doc.resolve(e.mapping.slice(r).map(this.to)), -1);
    s && e.setSelection(s);
  }
  replaceWith(e, t) {
    this.replace(e, new x(y.from(t), 0, 0));
  }
  forEachCell(e) {
    const t = this.$anchorCell.node(-1), r = W.get(t), i = this.$anchorCell.start(-1), s = r.cellsInRect(r.rectBetween(this.$anchorCell.pos - i, this.$headCell.pos - i));
    for (let o = 0; o < s.length; o++) e(t.nodeAt(s[o]), i + s[o]);
  }
  isColSelection() {
    const e = this.$anchorCell.index(-1), t = this.$headCell.index(-1);
    if (Math.min(e, t) > 0) return !1;
    const r = e + this.$anchorCell.nodeAfter.attrs.rowspan, i = t + this.$headCell.nodeAfter.attrs.rowspan;
    return Math.max(r, i) == this.$headCell.node(-1).childCount;
  }
  static colSelection(e, t = e) {
    const r = e.node(-1), i = W.get(r), s = e.start(-1), o = i.findCell(e.pos - s), l = i.findCell(t.pos - s), a = e.node(0);
    return o.top <= l.top ? (o.top > 0 && (e = a.resolve(s + i.map[o.left])), l.bottom < i.height && (t = a.resolve(s + i.map[i.width * (i.height - 1) + l.right - 1]))) : (l.top > 0 && (t = a.resolve(s + i.map[l.left])), o.bottom < i.height && (e = a.resolve(s + i.map[i.width * (i.height - 1) + o.right - 1]))), new Ve(e, t);
  }
  isRowSelection() {
    const e = this.$anchorCell.node(-1), t = W.get(e), r = this.$anchorCell.start(-1), i = t.colCount(this.$anchorCell.pos - r), s = t.colCount(this.$headCell.pos - r);
    if (Math.min(i, s) > 0) return !1;
    const o = i + this.$anchorCell.nodeAfter.attrs.colspan, l = s + this.$headCell.nodeAfter.attrs.colspan;
    return Math.max(o, l) == t.width;
  }
  eq(e) {
    return e instanceof Ve && e.$anchorCell.pos == this.$anchorCell.pos && e.$headCell.pos == this.$headCell.pos;
  }
  static rowSelection(e, t = e) {
    const r = e.node(-1), i = W.get(r), s = e.start(-1), o = i.findCell(e.pos - s), l = i.findCell(t.pos - s), a = e.node(0);
    return o.left <= l.left ? (o.left > 0 && (e = a.resolve(s + i.map[o.top * i.width])), l.right < i.width && (t = a.resolve(s + i.map[i.width * (l.top + 1) - 1]))) : (l.left > 0 && (t = a.resolve(s + i.map[l.top * i.width])), o.right < i.width && (e = a.resolve(s + i.map[i.width * (o.top + 1) - 1]))), new Ve(e, t);
  }
  toJSON() {
    return {
      type: "cell",
      anchor: this.$anchorCell.pos,
      head: this.$headCell.pos
    };
  }
  static fromJSON(e, t) {
    return new Ve(e.resolve(t.anchor), e.resolve(t.head));
  }
  static create(e, t, r = t) {
    return new Ve(e.resolve(t), e.resolve(r));
  }
  getBookmark() {
    return new Jg(this.$anchorCell.pos, this.$headCell.pos);
  }
};
z.prototype.visible = !1;
N.jsonID("cell", z);
var Jg = class Jc {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Jc(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    const t = e.resolve(this.anchor), r = e.resolve(this.head);
    return t.parent.type.spec.tableRole == "row" && r.parent.type.spec.tableRole == "row" && t.index() < t.parent.childCount && r.index() < r.parent.childCount && io(t, r) ? new z(t, r) : N.near(r, 1);
  }
};
function Gg(n) {
  if (!(n.selection instanceof z)) return null;
  const e = [];
  return n.selection.forEachCell((t, r) => {
    e.push(ie.node(r, r + t.nodeSize, { class: "selectedCell" }));
  }), F.create(n.doc, e);
}
function Yg({ $from: n, $to: e }) {
  if (n.pos == e.pos || n.pos < e.pos - 6) return !1;
  let t = n.pos, r = e.pos, i = n.depth;
  for (; i >= 0 && !(n.after(i + 1) < n.end(i)); i--, t++) ;
  for (let s = e.depth; s >= 0 && !(e.before(s + 1) > e.start(s)); s--, r--) ;
  return t == r && /row|table/.test(n.node(i).type.spec.tableRole);
}
function Xg({ $from: n, $to: e }) {
  let t, r;
  for (let i = n.depth; i > 0; i--) {
    const s = n.node(i);
    if (s.type.spec.tableRole === "cell" || s.type.spec.tableRole === "header_cell") {
      t = s;
      break;
    }
  }
  for (let i = e.depth; i > 0; i--) {
    const s = e.node(i);
    if (s.type.spec.tableRole === "cell" || s.type.spec.tableRole === "header_cell") {
      r = s;
      break;
    }
  }
  return t !== r && e.parentOffset === 0;
}
function Qg(n, e, t) {
  const r = (e || n).selection, i = (e || n).doc;
  let s, o;
  if (r instanceof A && (o = r.node.type.spec.tableRole)) {
    if (o == "cell" || o == "header_cell") s = z.create(i, r.from);
    else if (o == "row") {
      const l = i.resolve(r.from + 1);
      s = z.rowSelection(l, l);
    } else if (!t) {
      const l = W.get(r.node), a = r.from + 1, c = a + l.map[l.width * l.height - 1];
      s = z.create(i, a + 1, c);
    }
  } else r instanceof T && Yg(r) ? s = T.create(i, r.from) : r instanceof T && Xg(r) && (s = T.create(i, r.$from.start(), r.$from.end()));
  return s && (e || (e = n.tr)).setSelection(s), e;
}
const Zg = new J("fix-tables");
function Gc(n, e, t, r) {
  const i = n.childCount, s = e.childCount;
  e: for (let o = 0, l = 0; o < s; o++) {
    const a = e.child(o);
    for (let c = l, d = Math.min(i, o + 3); c < d; c++) if (n.child(c) == a) {
      l = c + 1, t += a.nodeSize;
      continue e;
    }
    r(a, t), l < i && n.child(l).sameMarkup(a) ? Gc(n.child(l), a, t + 1, r) : a.nodesBetween(0, a.content.size, r, t + 1), t += a.nodeSize;
  }
}
function Yc(n, e) {
  let t;
  const r = (i, s) => {
    i.type.spec.tableRole == "table" && (t = eb(n, i, s, t));
  };
  return e ? e.doc != n.doc && Gc(e.doc, n.doc, 0, r) : n.doc.descendants(r), t;
}
function eb(n, e, t, r) {
  const i = W.get(e);
  if (!i.problems) return r;
  r || (r = n.tr);
  const s = [];
  for (let a = 0; a < i.height; a++) s.push(0);
  for (let a = 0; a < i.problems.length; a++) {
    const c = i.problems[a];
    if (c.type == "collision") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      const u = d.attrs;
      for (let h = 0; h < u.rowspan; h++) s[c.row + h] += c.n;
      r.setNodeMarkup(r.mapping.map(t + 1 + c.pos), null, It(u, u.colspan - c.n, c.n));
    } else if (c.type == "missing") s[c.row] += c.n;
    else if (c.type == "overlong_rowspan") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      r.setNodeMarkup(r.mapping.map(t + 1 + c.pos), null, {
        ...d.attrs,
        rowspan: d.attrs.rowspan - c.n
      });
    } else if (c.type == "colwidth mismatch") {
      const d = e.nodeAt(c.pos);
      if (!d) continue;
      r.setNodeMarkup(r.mapping.map(t + 1 + c.pos), null, {
        ...d.attrs,
        colwidth: c.colwidth
      });
    } else if (c.type == "zero_sized") {
      const d = r.mapping.map(t);
      r.delete(d, d + e.nodeSize);
    }
  }
  let o, l;
  for (let a = 0; a < s.length; a++) s[a] && (o == null && (o = a), l = a);
  for (let a = 0, c = t + 1; a < i.height; a++) {
    const d = e.child(a), u = c + d.nodeSize, h = s[a];
    if (h > 0) {
      let p = "cell";
      d.firstChild && (p = d.firstChild.type.spec.tableRole);
      const f = [];
      for (let g = 0; g < h; g++) {
        const b = le(n.schema)[p].createAndFill();
        b && f.push(b);
      }
      const m = (a == 0 || o == a - 1) && l == a ? c + 1 : u - 1;
      r.insert(r.mapping.map(m), f);
    }
    c = u;
  }
  return r.setMeta(Zg, { fixTables: !0 });
}
function Ie(n) {
  const e = n.selection, t = ai(n), r = t.node(-1), i = t.start(-1), s = W.get(r);
  return {
    ...e instanceof z ? s.rectBetween(e.$anchorCell.pos - i, e.$headCell.pos - i) : s.findCell(t.pos - i),
    tableStart: i,
    map: s,
    table: r
  };
}
function Xc(n, { map: e, tableStart: t, table: r }, i) {
  let s = i > 0 ? -1 : 0;
  Kg(e, r, i + s) && (s = i == 0 || i == e.width ? null : 0);
  for (let o = 0; o < e.height; o++) {
    const l = o * e.width + i;
    if (i > 0 && i < e.width && e.map[l - 1] == e.map[l]) {
      const a = e.map[l], c = r.nodeAt(a);
      n.setNodeMarkup(n.mapping.map(t + a), null, Kc(c.attrs, i - e.colCount(a))), o += c.attrs.rowspan - 1;
    } else {
      const a = s == null ? le(r.type.schema).cell : r.nodeAt(e.map[l + s]).type, c = e.positionAt(o, i, r);
      n.insert(n.mapping.map(t + c), a.createAndFill());
    }
  }
  return n;
}
function tb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Ie(n);
    e(Xc(n.tr, t, t.left));
  }
  return !0;
}
function nb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Ie(n);
    e(Xc(n.tr, t, t.right));
  }
  return !0;
}
function rb(n, { map: e, table: t, tableStart: r }, i) {
  const s = n.mapping.maps.length;
  for (let o = 0; o < e.height; ) {
    const l = o * e.width + i, a = e.map[l], c = t.nodeAt(a), d = c.attrs;
    if (i > 0 && e.map[l - 1] == a || i < e.width - 1 && e.map[l + 1] == a) n.setNodeMarkup(n.mapping.slice(s).map(r + a), null, It(d, i - e.colCount(a)));
    else {
      const u = n.mapping.slice(s).map(r + a);
      n.delete(u, u + c.nodeSize);
    }
    o += d.rowspan;
  }
}
function ib(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Ie(n), r = n.tr;
    if (t.left == 0 && t.right == t.map.width) return !1;
    for (let i = t.right - 1; rb(r, t, i), i != t.left; i--) {
      const s = t.tableStart ? r.doc.nodeAt(t.tableStart - 1) : r.doc;
      if (!s) throw new RangeError("No table found");
      t.table = s, t.map = W.get(s);
    }
    e(r);
  }
  return !0;
}
function sb(n, e, t) {
  var r;
  const i = le(e.type.schema).header_cell;
  for (let s = 0; s < n.width; s++) if (((r = e.nodeAt(n.map[s + t * n.width])) === null || r === void 0 ? void 0 : r.type) != i) return !1;
  return !0;
}
function Qc(n, { map: e, tableStart: t, table: r }, i) {
  let s = t;
  for (let c = 0; c < i; c++) s += r.child(c).nodeSize;
  const o = [];
  let l = i > 0 ? -1 : 0;
  sb(e, r, i + l) && (l = i == 0 || i == e.height ? null : 0);
  for (let c = 0, d = e.width * i; c < e.width; c++, d++) if (i > 0 && i < e.height && e.map[d] == e.map[d - e.width]) {
    const u = e.map[d], h = r.nodeAt(u).attrs;
    n.setNodeMarkup(t + u, null, {
      ...h,
      rowspan: h.rowspan + 1
    }), c += h.colspan - 1;
  } else {
    var a;
    const u = l == null ? le(r.type.schema).cell : (a = r.nodeAt(e.map[d + l * e.width])) === null || a === void 0 ? void 0 : a.type, h = u == null ? void 0 : u.createAndFill();
    h && o.push(h);
  }
  return n.insert(s, le(r.type.schema).row.create(null, o)), n;
}
function ob(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Ie(n);
    e(Qc(n.tr, t, t.top));
  }
  return !0;
}
function lb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Ie(n);
    e(Qc(n.tr, t, t.bottom));
  }
  return !0;
}
function ab(n, { map: e, table: t, tableStart: r }, i) {
  let s = 0;
  for (let c = 0; c < i; c++) s += t.child(c).nodeSize;
  const o = s + t.child(i).nodeSize, l = n.mapping.maps.length;
  n.delete(s + r, o + r);
  const a = /* @__PURE__ */ new Set();
  for (let c = 0, d = i * e.width; c < e.width; c++, d++) {
    const u = e.map[d];
    if (!a.has(u)) {
      if (a.add(u), i > 0 && u == e.map[d - e.width]) {
        const h = t.nodeAt(u).attrs;
        n.setNodeMarkup(n.mapping.slice(l).map(u + r), null, {
          ...h,
          rowspan: h.rowspan - 1
        }), c += h.colspan - 1;
      } else if (i < e.height && u == e.map[d + e.width]) {
        const h = t.nodeAt(u), p = h.attrs, f = h.type.create({
          ...p,
          rowspan: h.attrs.rowspan - 1
        }, h.content), m = e.positionAt(i + 1, c, t);
        n.insert(n.mapping.slice(l).map(r + m), f), c += p.colspan - 1;
      }
    }
  }
}
function cb(n, e) {
  if (!Ee(n)) return !1;
  if (e) {
    const t = Ie(n), r = n.tr;
    if (t.top == 0 && t.bottom == t.map.height) return !1;
    for (let i = t.bottom - 1; ab(r, t, i), i != t.top; i--) {
      const s = t.tableStart ? r.doc.nodeAt(t.tableStart - 1) : r.doc;
      if (!s) throw new RangeError("No table found");
      t.table = s, t.map = W.get(t.table);
    }
    e(r);
  }
  return !0;
}
function Al(n) {
  const e = n.content;
  return e.childCount == 1 && e.child(0).isTextblock && e.child(0).childCount == 0;
}
function db({ width: n, height: e, map: t }, r) {
  let i = r.top * n + r.left, s = i, o = (r.bottom - 1) * n + r.left, l = i + (r.right - r.left - 1);
  for (let a = r.top; a < r.bottom; a++) {
    if (r.left > 0 && t[s] == t[s - 1] || r.right < n && t[l] == t[l + 1]) return !0;
    s += n, l += n;
  }
  for (let a = r.left; a < r.right; a++) {
    if (r.top > 0 && t[i] == t[i - n] || r.bottom < e && t[o] == t[o + n]) return !0;
    i++, o++;
  }
  return !1;
}
function Tl(n, e) {
  const t = n.selection;
  if (!(t instanceof z) || t.$anchorCell.pos == t.$headCell.pos) return !1;
  const r = Ie(n), { map: i } = r;
  if (db(i, r)) return !1;
  if (e) {
    const s = n.tr, o = {};
    let l = y.empty, a, c;
    for (let d = r.top; d < r.bottom; d++) for (let u = r.left; u < r.right; u++) {
      const h = i.map[d * i.width + u], p = r.table.nodeAt(h);
      if (!(o[h] || !p))
        if (o[h] = !0, a == null)
          a = h, c = p;
        else {
          Al(p) || (l = l.append(p.content));
          const f = s.mapping.map(h + r.tableStart);
          s.delete(f, f + p.nodeSize);
        }
    }
    if (a == null || c == null) return !0;
    if (s.setNodeMarkup(a + r.tableStart, null, {
      ...Kc(c.attrs, c.attrs.colspan, r.right - r.left - c.attrs.colspan),
      rowspan: r.bottom - r.top
    }), l.size > 0) {
      const d = a + 1 + c.content.size, u = Al(c) ? a + 1 : d;
      s.replaceWith(u + r.tableStart, d + r.tableStart, l);
    }
    s.setSelection(new z(s.doc.resolve(a + r.tableStart))), e(s);
  }
  return !0;
}
function Nl(n, e) {
  const t = le(n.schema);
  return ub(({ node: r }) => t[r.type.spec.tableRole])(n, e);
}
function ub(n) {
  return (e, t) => {
    const r = e.selection;
    let i, s;
    if (r instanceof z) {
      if (r.$anchorCell.pos != r.$headCell.pos) return !1;
      i = r.$anchorCell.nodeAfter, s = r.$anchorCell.pos;
    } else {
      var o;
      if (i = Wg(r.$from), !i) return !1;
      s = (o = Rt(r.$from)) === null || o === void 0 ? void 0 : o.pos;
    }
    if (i == null || s == null || i.attrs.colspan == 1 && i.attrs.rowspan == 1) return !1;
    if (t) {
      let l = i.attrs;
      const a = [], c = l.colwidth;
      l.rowspan > 1 && (l = {
        ...l,
        rowspan: 1
      }), l.colspan > 1 && (l = {
        ...l,
        colspan: 1
      });
      const d = Ie(e), u = e.tr;
      for (let p = 0; p < d.right - d.left; p++) a.push(c ? {
        ...l,
        colwidth: c && c[p] ? [c[p]] : null
      } : l);
      let h;
      for (let p = d.top; p < d.bottom; p++) {
        let f = d.map.positionAt(p, d.left, d.table);
        p == d.top && (f += i.nodeSize);
        for (let m = d.left, g = 0; m < d.right; m++, g++)
          m == d.left && p == d.top || u.insert(h = u.mapping.map(f + d.tableStart, 1), n({
            node: i,
            row: p,
            col: m
          }).createAndFill(a[g]));
      }
      u.setNodeMarkup(s, n({
        node: i,
        row: d.top,
        col: d.left
      }), a[0]), r instanceof z && u.setSelection(new z(u.doc.resolve(r.$anchorCell.pos), h ? u.doc.resolve(h) : void 0)), t(u);
    }
    return !0;
  };
}
function hb(n, e) {
  return function(t, r) {
    if (!Ee(t)) return !1;
    const i = ai(t);
    if (i.nodeAfter.attrs[n] === e) return !1;
    if (r) {
      const s = t.tr;
      t.selection instanceof z ? t.selection.forEachCell((o, l) => {
        o.attrs[n] !== e && s.setNodeMarkup(l, null, {
          ...o.attrs,
          [n]: e
        });
      }) : s.setNodeMarkup(i.pos, null, {
        ...i.nodeAfter.attrs,
        [n]: e
      }), r(s);
    }
    return !0;
  };
}
function pb(n) {
  return function(e, t) {
    if (!Ee(e)) return !1;
    if (t) {
      const r = le(e.schema), i = Ie(e), s = e.tr, o = i.map.cellsInRect(n == "column" ? {
        left: i.left,
        top: 0,
        right: i.right,
        bottom: i.map.height
      } : n == "row" ? {
        left: 0,
        top: i.top,
        right: i.map.width,
        bottom: i.bottom
      } : i), l = o.map((a) => i.table.nodeAt(a));
      for (let a = 0; a < o.length; a++) l[a].type == r.header_cell && s.setNodeMarkup(i.tableStart + o[a], r.cell, l[a].attrs);
      if (s.steps.length === 0) for (let a = 0; a < o.length; a++) s.setNodeMarkup(i.tableStart + o[a], r.header_cell, l[a].attrs);
      t(s);
    }
    return !0;
  };
}
function Ol(n, e, t) {
  const r = e.map.cellsInRect({
    left: 0,
    top: 0,
    right: n == "row" ? e.map.width : 1,
    bottom: n == "column" ? e.map.height : 1
  });
  for (let i = 0; i < r.length; i++) {
    const s = e.table.nodeAt(r[i]);
    if (s && s.type !== t.header_cell) return !1;
  }
  return !0;
}
function Nn(n, e) {
  return e = e || { useDeprecatedLogic: !1 }, e.useDeprecatedLogic ? pb(n) : function(t, r) {
    if (!Ee(t)) return !1;
    if (r) {
      const i = le(t.schema), s = Ie(t), o = t.tr, l = Ol("row", s, i), a = Ol("column", s, i), c = (n === "column" ? l : n === "row" && a) ? 1 : 0, d = n == "column" ? {
        left: 0,
        top: c,
        right: 1,
        bottom: s.map.height
      } : n == "row" ? {
        left: c,
        top: 0,
        right: s.map.width,
        bottom: 1
      } : s, u = n == "column" ? a ? i.cell : i.header_cell : n == "row" ? l ? i.cell : i.header_cell : i.cell;
      s.map.cellsInRect(d).forEach((h) => {
        const p = h + s.tableStart, f = o.doc.nodeAt(p);
        f && o.setNodeMarkup(p, u, f.attrs);
      }), r(o);
    }
    return !0;
  };
}
Nn("row", { useDeprecatedLogic: !0 });
Nn("column", { useDeprecatedLogic: !0 });
const fb = Nn("cell", { useDeprecatedLogic: !0 });
function mb(n, e) {
  if (e < 0) {
    const t = n.nodeBefore;
    if (t) return n.pos - t.nodeSize;
    for (let r = n.index(-1) - 1, i = n.before(); r >= 0; r--) {
      const s = n.node(-1).child(r), o = s.lastChild;
      if (o) return i - 1 - o.nodeSize;
      i -= s.nodeSize;
    }
  } else {
    if (n.index() < n.parent.childCount - 1) return n.pos + n.nodeAfter.nodeSize;
    const t = n.node(-1);
    for (let r = n.indexAfter(-1), i = n.after(); r < t.childCount; r++) {
      const s = t.child(r);
      if (s.childCount) return i + 1;
      i += s.nodeSize;
    }
  }
  return null;
}
function Ll(n) {
  return function(e, t) {
    if (!Ee(e)) return !1;
    const r = mb(ai(e), n);
    if (r == null) return !1;
    if (t) {
      const i = e.doc.resolve(r);
      t(e.tr.setSelection(T.between(i, Ug(i))).scrollIntoView());
    }
    return !0;
  };
}
function gb(n, e) {
  const t = n.selection.$anchor;
  for (let r = t.depth; r > 0; r--) if (t.node(r).type.spec.tableRole == "table")
    return e && e(n.tr.delete(t.before(r), t.after(r)).scrollIntoView()), !0;
  return !1;
}
function Un(n, e) {
  const t = n.selection;
  if (!(t instanceof z)) return !1;
  if (e) {
    const r = n.tr, i = le(n.schema).cell.createAndFill().content;
    t.forEachCell((s, o) => {
      s.content.eq(i) || r.replace(r.mapping.map(o + 1), r.mapping.map(o + s.nodeSize - 1), new x(i, 0, 0));
    }), r.docChanged && e(r);
  }
  return !0;
}
function bb(n) {
  if (n.size === 0) return null;
  let { content: e, openStart: t, openEnd: r } = n;
  for (; e.childCount == 1 && (t > 0 && r > 0 || e.child(0).type.spec.tableRole == "table"); )
    t--, r--, e = e.child(0).content;
  const i = e.child(0), s = i.type.spec.tableRole, o = i.type.schema, l = [];
  if (s == "row") for (let a = 0; a < e.childCount; a++) {
    let c = e.child(a).content;
    const d = a ? 0 : Math.max(0, t - 1), u = a < e.childCount - 1 ? 0 : Math.max(0, r - 1);
    (d || u) && (c = ks(le(o).row, new x(c, d, u)).content), l.push(c);
  }
  else if (s == "cell" || s == "header_cell") l.push(t || r ? ks(le(o).row, new x(e, t, r)).content : e);
  else return null;
  return yb(o, l);
}
function yb(n, e) {
  const t = [];
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    for (let o = s.childCount - 1; o >= 0; o--) {
      const { rowspan: l, colspan: a } = s.child(o).attrs;
      for (let c = i; c < i + l; c++) t[c] = (t[c] || 0) + a;
    }
  }
  let r = 0;
  for (let i = 0; i < t.length; i++) r = Math.max(r, t[i]);
  for (let i = 0; i < t.length; i++)
    if (i >= e.length && e.push(y.empty), t[i] < r) {
      const s = le(n).cell.createAndFill(), o = [];
      for (let l = t[i]; l < r; l++) o.push(s);
      e[i] = e[i].append(y.from(o));
    }
  return {
    height: e.length,
    width: r,
    rows: e
  };
}
function ks(n, e) {
  const t = n.createAndFill();
  return new Es(t).replace(0, t.content.size, e).doc;
}
function kb({ width: n, height: e, rows: t }, r, i) {
  if (n != r) {
    const s = [], o = [];
    for (let l = 0; l < t.length; l++) {
      const a = t[l], c = [];
      for (let d = s[l] || 0, u = 0; d < r; u++) {
        let h = a.child(u % a.childCount);
        d + h.attrs.colspan > r && (h = h.type.createChecked(It(h.attrs, h.attrs.colspan, d + h.attrs.colspan - r), h.content)), c.push(h), d += h.attrs.colspan;
        for (let p = 1; p < h.attrs.rowspan; p++) s[l + p] = (s[l + p] || 0) + h.attrs.colspan;
      }
      o.push(y.from(c));
    }
    t = o, n = r;
  }
  if (e != i) {
    const s = [];
    for (let o = 0, l = 0; o < i; o++, l++) {
      const a = [], c = t[l % e];
      for (let d = 0; d < c.childCount; d++) {
        let u = c.child(d);
        o + u.attrs.rowspan > i && (u = u.type.create({
          ...u.attrs,
          rowspan: Math.max(1, i - u.attrs.rowspan)
        }, u.content)), a.push(u);
      }
      s.push(y.from(a));
    }
    t = s, e = i;
  }
  return {
    width: n,
    height: e,
    rows: t
  };
}
function wb(n, e, t, r, i, s, o) {
  const l = n.doc.type.schema, a = le(l);
  let c, d;
  if (i > e.width) for (let u = 0, h = 0; u < e.height; u++) {
    const p = t.child(u);
    h += p.nodeSize;
    const f = [];
    let m;
    p.lastChild == null || p.lastChild.type == a.cell ? m = c || (c = a.cell.createAndFill()) : m = d || (d = a.header_cell.createAndFill());
    for (let g = e.width; g < i; g++) f.push(m);
    n.insert(n.mapping.slice(o).map(h - 1 + r), f);
  }
  if (s > e.height) {
    const u = [];
    for (let f = 0, m = (e.height - 1) * e.width; f < Math.max(e.width, i); f++) {
      const g = f >= e.width ? !1 : t.nodeAt(e.map[m + f]).type == a.header_cell;
      u.push(g ? d || (d = a.header_cell.createAndFill()) : c || (c = a.cell.createAndFill()));
    }
    const h = a.row.create(null, y.from(u)), p = [];
    for (let f = e.height; f < s; f++) p.push(h);
    n.insert(n.mapping.slice(o).map(r + t.nodeSize - 2), p);
  }
  return !!(c || d);
}
function Rl(n, e, t, r, i, s, o, l) {
  if (o == 0 || o == e.height) return !1;
  let a = !1;
  for (let c = i; c < s; c++) {
    const d = o * e.width + c, u = e.map[d];
    if (e.map[d - e.width] == u) {
      a = !0;
      const h = t.nodeAt(u), { top: p, left: f } = e.findCell(u);
      n.setNodeMarkup(n.mapping.slice(l).map(u + r), null, {
        ...h.attrs,
        rowspan: o - p
      }), n.insert(n.mapping.slice(l).map(e.positionAt(o, f, t)), h.type.createAndFill({
        ...h.attrs,
        rowspan: p + h.attrs.rowspan - o
      })), c += h.attrs.colspan - 1;
    }
  }
  return a;
}
function Il(n, e, t, r, i, s, o, l) {
  if (o == 0 || o == e.width) return !1;
  let a = !1;
  for (let c = i; c < s; c++) {
    const d = c * e.width + o, u = e.map[d];
    if (e.map[d - 1] == u) {
      a = !0;
      const h = t.nodeAt(u), p = e.colCount(u), f = n.mapping.slice(l).map(u + r);
      n.setNodeMarkup(f, null, It(h.attrs, o - p, h.attrs.colspan - (o - p))), n.insert(f + h.nodeSize, h.type.createAndFill(It(h.attrs, 0, o - p))), c += h.attrs.rowspan - 1;
    }
  }
  return a;
}
function _l(n, e, t, r, i) {
  let s = t ? n.doc.nodeAt(t - 1) : n.doc;
  if (!s) throw new Error("No table found");
  let o = W.get(s);
  const { top: l, left: a } = r, c = a + i.width, d = l + i.height, u = n.tr;
  let h = 0;
  function p() {
    if (s = t ? u.doc.nodeAt(t - 1) : u.doc, !s) throw new Error("No table found");
    o = W.get(s), h = u.mapping.maps.length;
  }
  wb(u, o, s, t, c, d, h) && p(), Rl(u, o, s, t, a, c, l, h) && p(), Rl(u, o, s, t, a, c, d, h) && p(), Il(u, o, s, t, l, d, a, h) && p(), Il(u, o, s, t, l, d, c, h) && p();
  for (let f = l; f < d; f++) {
    const m = o.positionAt(f, a, s), g = o.positionAt(f, c, s);
    u.replace(u.mapping.slice(h).map(m + t), u.mapping.slice(h).map(g + t), new x(i.rows[f - l], 0, 0));
  }
  p(), u.setSelection(new z(u.doc.resolve(t + o.positionAt(l, a, s)), u.doc.resolve(t + o.positionAt(d - 1, c - 1, s)))), e(u);
}
const Cb = Bs({
  ArrowLeft: Kn("horiz", -1),
  ArrowRight: Kn("horiz", 1),
  ArrowUp: Kn("vert", -1),
  ArrowDown: Kn("vert", 1),
  "Shift-ArrowLeft": Jn("horiz", -1),
  "Shift-ArrowRight": Jn("horiz", 1),
  "Shift-ArrowUp": Jn("vert", -1),
  "Shift-ArrowDown": Jn("vert", 1),
  Backspace: Un,
  "Mod-Backspace": Un,
  Delete: Un,
  "Mod-Delete": Un
});
function rr(n, e, t) {
  return t.eq(n.selection) ? !1 : (e && e(n.tr.setSelection(t).scrollIntoView()), !0);
}
function Kn(n, e) {
  return (t, r, i) => {
    if (!i) return !1;
    const s = t.selection;
    if (s instanceof z) return rr(t, r, N.near(s.$headCell, e));
    if (n != "horiz" && !s.empty) return !1;
    const o = Zc(i, n, e);
    if (o == null) return !1;
    if (n == "horiz") return rr(t, r, N.near(t.doc.resolve(s.head + e), e));
    {
      const l = t.doc.resolve(o), a = Uc(l, n, e);
      let c;
      return a ? c = N.near(a, 1) : e < 0 ? c = N.near(t.doc.resolve(l.before(-1)), -1) : c = N.near(t.doc.resolve(l.after(-1)), 1), rr(t, r, c);
    }
  };
}
function Jn(n, e) {
  return (t, r, i) => {
    if (!i) return !1;
    const s = t.selection;
    let o;
    if (s instanceof z) o = s;
    else {
      const a = Zc(i, n, e);
      if (a == null) return !1;
      o = new z(t.doc.resolve(a));
    }
    const l = Uc(o.$headCell, n, e);
    return l ? rr(t, r, new z(o.$anchorCell, l)) : !1;
  };
}
function Sb(n, e) {
  const t = n.state.doc, r = Rt(t.resolve(e));
  return r ? (n.dispatch(n.state.tr.setSelection(new z(r))), !0) : !1;
}
function xb(n, e, t) {
  if (!Ee(n.state)) return !1;
  let r = bb(t);
  const i = n.state.selection;
  if (i instanceof z) {
    r || (r = {
      width: 1,
      height: 1,
      rows: [y.from(ks(le(n.state.schema).cell, t))]
    });
    const s = i.$anchorCell.node(-1), o = i.$anchorCell.start(-1), l = W.get(s).rectBetween(i.$anchorCell.pos - o, i.$headCell.pos - o);
    return r = kb(r, l.right - l.left, l.bottom - l.top), _l(n.state, n.dispatch, o, l, r), !0;
  } else if (r) {
    const s = ai(n.state), o = s.start(-1);
    return _l(n.state, n.dispatch, o, W.get(s.node(-1)).findCell(s.pos - o), r), !0;
  } else return !1;
}
function vb(n, e) {
  var t;
  if (e.button != 0 || e.ctrlKey || e.metaKey) return;
  const r = Dl(n, e.target);
  let i;
  if (e.shiftKey && n.state.selection instanceof z)
    s(n.state.selection.$anchorCell, e), e.preventDefault();
  else if (e.shiftKey && r && (i = Rt(n.state.selection.$anchor)) != null && ((t = Bi(n, e)) === null || t === void 0 ? void 0 : t.pos) != i.pos)
    s(i, e), e.preventDefault();
  else if (!r) return;
  function s(a, c) {
    let d = Bi(n, c);
    const u = et.getState(n.state) == null;
    if (!d || !io(a, d)) if (u) d = a;
    else return;
    const h = new z(a, d);
    if (u || !n.state.selection.eq(h)) {
      const p = n.state.tr.setSelection(h);
      u && p.setMeta(et, a.pos), n.dispatch(p);
    }
  }
  function o() {
    n.root.removeEventListener("mouseup", o), n.root.removeEventListener("dragstart", o), n.root.removeEventListener("mousemove", l), et.getState(n.state) != null && n.dispatch(n.state.tr.setMeta(et, -1));
  }
  function l(a) {
    const c = a, d = et.getState(n.state);
    let u;
    if (d != null) u = n.state.doc.resolve(d);
    else if (Dl(n, c.target) != r && (u = Bi(n, e), !u))
      return o();
    u && s(u, c);
  }
  n.root.addEventListener("mouseup", o), n.root.addEventListener("dragstart", o), n.root.addEventListener("mousemove", l);
}
function Zc(n, e, t) {
  if (!(n.state.selection instanceof T)) return null;
  const { $head: r } = n.state.selection;
  for (let i = r.depth - 1; i >= 0; i--) {
    const s = r.node(i);
    if ((t < 0 ? r.index(i) : r.indexAfter(i)) != (t < 0 ? 0 : s.childCount)) return null;
    if (s.type.spec.tableRole == "cell" || s.type.spec.tableRole == "header_cell") {
      const o = r.before(i), l = e == "vert" ? t > 0 ? "down" : "up" : t > 0 ? "right" : "left";
      return n.endOfTextblock(l) ? o : null;
    }
  }
  return null;
}
function Dl(n, e) {
  for (; e && e != n.dom; e = e.parentNode) if (e.nodeName == "TD" || e.nodeName == "TH") return e;
  return null;
}
function Bi(n, e) {
  const t = n.posAtCoords({
    left: e.clientX,
    top: e.clientY
  });
  if (!t) return null;
  let { inside: r, pos: i } = t;
  return r >= 0 && Rt(n.state.doc.resolve(r)) || Rt(n.state.doc.resolve(i));
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
function ws(n, e, t, r, i, s) {
  let o = 0, l = !0, a = e.firstChild;
  const c = n.firstChild;
  if (c) {
    for (let u = 0, h = 0; u < c.childCount; u++) {
      const { colspan: p, colwidth: f } = c.child(u).attrs;
      for (let m = 0; m < p; m++, h++) {
        const g = i == h ? s : f && f[m], b = g ? g + "px" : "";
        if (o += g || r, g || (l = !1), a)
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
function Eb({ handleWidth: n = 5, cellMinWidth: e = 25, defaultCellMinWidth: t = 100, View: r = Mb, lastColumnResizable: i = !0 } = {}) {
  const s = new j({
    key: ge,
    state: {
      init(o, l) {
        var a;
        const c = (a = s.spec) === null || a === void 0 || (a = a.props) === null || a === void 0 ? void 0 : a.nodeViews, d = le(l.schema).table.name;
        return r && c && (c[d] = (u, h) => new r(u, t, h)), new Ab(-1, !1);
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
          Tb(o, l, n, i);
        },
        mouseleave: (o) => {
          Nb(o);
        },
        mousedown: (o, l) => {
          Ob(o, l, e, t);
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
var Ab = class ir {
  constructor(e, t) {
    this.activeHandle = e, this.dragging = t;
  }
  apply(e) {
    const t = this, r = e.getMeta(ge);
    if (r && r.setHandle != null) return new ir(r.setHandle, !1);
    if (r && r.setDragging !== void 0) return new ir(t.activeHandle, r.setDragging);
    if (t.activeHandle > -1 && e.docChanged) {
      let i = e.mapping.map(t.activeHandle, -1);
      return ys(e.doc.resolve(i)) || (i = -1), new ir(i, t.dragging);
    }
    return t;
  }
};
function Tb(n, e, t, r) {
  if (!n.editable) return;
  const i = ge.getState(n.state);
  if (i && !i.dragging) {
    const s = Rb(e.target);
    let o = -1;
    if (s) {
      const { left: l, right: a } = s.getBoundingClientRect();
      e.clientX - l <= t ? o = Pl(n, e, "left", t) : a - e.clientX <= t && (o = Pl(n, e, "right", t));
    }
    if (o != i.activeHandle) {
      if (!r && o !== -1) {
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
function Ob(n, e, t, r) {
  var i;
  if (!n.editable) return !1;
  const s = (i = n.dom.ownerDocument.defaultView) !== null && i !== void 0 ? i : window, o = ge.getState(n.state);
  if (!o || o.activeHandle == -1 || o.dragging) return !1;
  const l = n.state.doc.nodeAt(o.activeHandle), a = Lb(n, o.activeHandle, l.attrs);
  n.dispatch(n.state.tr.setMeta(ge, { setDragging: {
    startX: e.clientX,
    startWidth: a
  } }));
  function c(u) {
    s.removeEventListener("mouseup", c), s.removeEventListener("mousemove", d);
    const h = ge.getState(n.state);
    h != null && h.dragging && (Ib(n, h.activeHandle, Bl(h.dragging, u, t)), n.dispatch(n.state.tr.setMeta(ge, { setDragging: null })));
  }
  function d(u) {
    if (!u.which) return c(u);
    const h = ge.getState(n.state);
    if (h && h.dragging) {
      const p = Bl(h.dragging, u, t);
      Hl(n, h.activeHandle, p, r);
    }
  }
  return Hl(n, o.activeHandle, a, r), s.addEventListener("mouseup", c), s.addEventListener("mousemove", d), e.preventDefault(), !0;
}
function Lb(n, e, { colspan: t, colwidth: r }) {
  const i = r && r[r.length - 1];
  if (i) return i;
  const s = n.domAtPos(e);
  let o = s.node.childNodes[s.offset].offsetWidth, l = t;
  if (r)
    for (let a = 0; a < t; a++) r[a] && (o -= r[a], l--);
  return o / l;
}
function Rb(n) {
  for (; n && n.nodeName != "TD" && n.nodeName != "TH"; ) n = n.classList && n.classList.contains("ProseMirror") ? null : n.parentNode;
  return n;
}
function Pl(n, e, t, r) {
  const i = t == "right" ? -r : r, s = n.posAtCoords({
    left: e.clientX + i,
    top: e.clientY
  });
  if (!s) return -1;
  const { pos: o } = s, l = Rt(n.state.doc.resolve(o));
  if (!l) return -1;
  if (t == "right") return l.pos;
  const a = W.get(l.node(-1)), c = l.start(-1), d = a.map.indexOf(l.pos - c);
  return d % a.width == 0 ? -1 : c + a.map[d - 1];
}
function Bl(n, e, t) {
  const r = e.clientX - n.startX;
  return Math.max(t, n.startWidth + r);
}
function ed(n, e) {
  n.dispatch(n.state.tr.setMeta(ge, { setHandle: e }));
}
function Ib(n, e, t) {
  const r = n.state.doc.resolve(e), i = r.node(-1), s = W.get(i), o = r.start(-1), l = s.colCount(r.pos - o) + r.nodeAfter.attrs.colspan - 1, a = n.state.tr;
  for (let c = 0; c < s.height; c++) {
    const d = c * s.width + l;
    if (c && s.map[d] == s.map[d - s.width]) continue;
    const u = s.map[d], h = i.nodeAt(u).attrs, p = h.colspan == 1 ? 0 : l - s.colCount(u);
    if (h.colwidth && h.colwidth[p] == t) continue;
    const f = h.colwidth ? h.colwidth.slice() : _b(h.colspan);
    f[p] = t, a.setNodeMarkup(o + u, null, {
      ...h,
      colwidth: f
    });
  }
  a.docChanged && n.dispatch(a);
}
function Hl(n, e, t, r) {
  const i = n.state.doc.resolve(e), s = i.node(-1), o = i.start(-1), l = W.get(s).colCount(i.pos - o) + i.nodeAfter.attrs.colspan - 1;
  let a = n.domAtPos(i.start(-1)).node;
  for (; a && a.nodeName != "TABLE"; ) a = a.parentNode;
  a && ws(s, a.firstChild, a, r, l, t);
}
function _b(n) {
  return Array(n).fill(0);
}
function Db(n, e) {
  const t = [], r = n.doc.resolve(e), i = r.node(-1);
  if (!i) return F.empty;
  const s = W.get(i), o = r.start(-1), l = s.colCount(r.pos - o) + r.nodeAfter.attrs.colspan - 1;
  for (let c = 0; c < s.height; c++) {
    const d = l + c * s.width;
    if ((l == s.width - 1 || s.map[d] != s.map[d + 1]) && (c == 0 || s.map[d] != s.map[d - s.width])) {
      var a;
      const u = s.map[d], h = o + u + i.nodeAt(u).nodeSize - 1, p = document.createElement("div");
      p.className = "column-resize-handle", !((a = ge.getState(n)) === null || a === void 0) && a.dragging && t.push(ie.node(o + u, o + u + i.nodeAt(u).nodeSize, { class: "column-resize-dragging" })), t.push(ie.widget(h, p));
    }
  }
  return F.create(n.doc, t);
}
function Pb({ allowTableNodeSelection: n = !1 } = {}) {
  return new j({
    key: et,
    state: {
      init() {
        return null;
      },
      apply(e, t) {
        const r = e.getMeta(et);
        if (r != null) return r == -1 ? null : r;
        if (t == null || !e.docChanged) return t;
        const { deleted: i, pos: s } = e.mapping.mapResult(t);
        return i ? null : s;
      }
    },
    props: {
      decorations: Gg,
      handleDOMEvents: { mousedown: vb },
      createSelectionBetween(e) {
        return et.getState(e.state) != null ? e.state.selection : null;
      },
      handleTripleClick: Sb,
      handleKeyDown: Cb,
      handlePaste: xb
    },
    appendTransaction(e, t, r) {
      return Qg(r, Yc(r, t), n);
    }
  });
}
function Cs(n, e) {
  return e ? ["width", `${Math.max(e, n)}px`] : ["min-width", `${n}px`];
}
function zl(n, e, t, r, i, s) {
  var o;
  let l = 0, a = !0, c = e.firstChild;
  const d = n.firstChild;
  if (d !== null)
    for (let u = 0, h = 0; u < d.childCount; u += 1) {
      const { colspan: p, colwidth: f } = d.child(u).attrs;
      for (let m = 0; m < p; m += 1, h += 1) {
        const g = i === h ? s : f && f[m], b = g ? `${g}px` : "";
        if (l += g || r, g || (a = !1), c) {
          if (c.style.width !== b) {
            const [k, w] = Cs(r, g);
            c.style.setProperty(k, w);
          }
          c = c.nextSibling;
        } else {
          const k = document.createElement("col"), [w, v] = Cs(r, g);
          k.style.setProperty(w, v), e.appendChild(k);
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
    this.node = e, this.cellMinWidth = t, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.colgroup = this.table.appendChild(document.createElement("colgroup")), zl(e, this.colgroup, this.table, t), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(e) {
    return e.type !== this.node.type ? !1 : (this.node = e, zl(e, this.colgroup, this.table, this.cellMinWidth), !0);
  }
  ignoreMutation(e) {
    return e.type === "attributes" && (e.target === this.table || this.colgroup.contains(e.target));
  }
}
function Hb(n, e, t, r) {
  let i = 0, s = !0;
  const o = [], l = n.firstChild;
  if (!l)
    return {};
  for (let u = 0, h = 0; u < l.childCount; u += 1) {
    const { colspan: p, colwidth: f } = l.child(u).attrs;
    for (let m = 0; m < p; m += 1, h += 1) {
      const g = t === h ? r : f && f[m];
      i += g || e, g || (s = !1);
      const [b, k] = Cs(e, g);
      o.push([
        "col",
        { style: `${b}: ${k}` }
      ]);
    }
  }
  const a = s ? `${i}px` : "", c = s ? "" : `${i}px`;
  return { colgroup: ["colgroup", {}, ...o], tableWidth: a, tableMinWidth: c };
}
function $l(n, e) {
  return n.createAndFill();
}
function zb(n) {
  if (n.cached.tableNodeTypes)
    return n.cached.tableNodeTypes;
  const e = {};
  return Object.keys(n.nodes).forEach((t) => {
    const r = n.nodes[t];
    r.spec.tableRole && (e[r.spec.tableRole] = r);
  }), n.cached.tableNodeTypes = e, e;
}
function $b(n, e, t, r, i) {
  const s = zb(n), o = [], l = [];
  for (let c = 0; c < t; c += 1) {
    const d = $l(s.cell);
    if (d && l.push(d), r) {
      const u = $l(s.header_cell);
      u && o.push(u);
    }
  }
  const a = [];
  for (let c = 0; c < e; c += 1)
    a.push(s.row.createChecked(null, r && c === 0 ? o : l));
  return s.table.createChecked(null, a);
}
function Fb(n) {
  return n instanceof z;
}
const Gn = ({ editor: n }) => {
  const { selection: e } = n.state;
  if (!Fb(e))
    return !1;
  let t = 0;
  const r = Oc(e.ranges[0].$from, (s) => s.type.name === "table");
  return r == null || r.node.descendants((s) => {
    if (s.type.name === "table")
      return !1;
    ["tableCell", "tableHeader"].includes(s.type.name) && (t += 1);
  }), t === e.ranges.length ? (n.commands.deleteTable(), !0) : !1;
}, Vb = B.create({
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
    const { colgroup: t, tableWidth: r, tableMinWidth: i } = Hb(n, this.options.cellMinWidth), s = [
      "table",
      _(this.options.HTMLAttributes, e, {
        style: r ? `width: ${r}` : `min-width: ${i}`
      }),
      t,
      ["tbody", 0]
    ];
    return this.options.renderWrapper ? ["div", { class: "tableWrapper" }, s] : s;
  },
  addCommands() {
    return {
      insertTable: ({ rows: n = 3, cols: e = 3, withHeaderRow: t = !0 } = {}) => ({ tr: r, dispatch: i, editor: s }) => {
        const o = $b(s.schema, n, e, t);
        if (i) {
          const l = r.selection.from + 1;
          r.replaceSelectionWith(o).scrollIntoView().setSelection(T.near(r.doc.resolve(l)));
        }
        return !0;
      },
      addColumnBefore: () => ({ state: n, dispatch: e }) => tb(n, e),
      addColumnAfter: () => ({ state: n, dispatch: e }) => nb(n, e),
      deleteColumn: () => ({ state: n, dispatch: e }) => ib(n, e),
      addRowBefore: () => ({ state: n, dispatch: e }) => ob(n, e),
      addRowAfter: () => ({ state: n, dispatch: e }) => lb(n, e),
      deleteRow: () => ({ state: n, dispatch: e }) => cb(n, e),
      deleteTable: () => ({ state: n, dispatch: e }) => gb(n, e),
      mergeCells: () => ({ state: n, dispatch: e }) => Tl(n, e),
      splitCell: () => ({ state: n, dispatch: e }) => Nl(n, e),
      toggleHeaderColumn: () => ({ state: n, dispatch: e }) => Nn("column")(n, e),
      toggleHeaderRow: () => ({ state: n, dispatch: e }) => Nn("row")(n, e),
      toggleHeaderCell: () => ({ state: n, dispatch: e }) => fb(n, e),
      mergeOrSplit: () => ({ state: n, dispatch: e }) => Tl(n, e) ? !0 : Nl(n, e),
      setCellAttribute: (n, e) => ({ state: t, dispatch: r }) => hb(n, e)(t, r),
      goToNextCell: () => ({ state: n, dispatch: e }) => Ll(1)(n, e),
      goToPreviousCell: () => ({ state: n, dispatch: e }) => Ll(-1)(n, e),
      fixTables: () => ({ state: n, dispatch: e }) => (e && Yc(n), !0),
      setCellSelection: (n) => ({ tr: e, dispatch: t }) => {
        if (t) {
          const r = z.create(e.doc, n.anchorCell, n.headCell);
          e.setSelection(r);
        }
        return !0;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.goToNextCell() ? !0 : this.editor.can().addRowAfter() ? this.editor.chain().addRowAfter().goToNextCell().run() : !1,
      "Shift-Tab": () => this.editor.commands.goToPreviousCell(),
      Backspace: Gn,
      "Mod-Backspace": Gn,
      Delete: Gn,
      "Mod-Delete": Gn
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
      tableRole: I(E(n, "tableRole", e))
    };
  }
}), qb = B.create({
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
    return ["tr", _(this.options.HTMLAttributes, n), 0];
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
          return e ? e.split(",").map((r) => parseInt(r, 10)) : null;
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
    return ["td", _(this.options.HTMLAttributes, n), 0];
  }
}), jb = B.create({
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
          return e ? e.split(",").map((r) => parseInt(r, 10)) : null;
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
    return ["th", _(this.options.HTMLAttributes, n), 0];
  }
}), Fl = {
  "1-col": ["col-12"],
  "2-col": ["col-md-6", "col-md-6"],
  "3-col": ["col-md-4", "col-md-4", "col-md-4"],
  "4-col": ["col-md-3", "col-md-3", "col-md-3", "col-md-3"],
  "1-2": ["col-md-4", "col-md-8"],
  "2-1": ["col-md-8", "col-md-4"],
  "1-1-2": ["col-md-3", "col-md-3", "col-md-6"],
  "2-1-1": ["col-md-6", "col-md-3", "col-md-3"]
}, Ub = B.create({
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
      _(e, {
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
      insertBootstrapRow: (n = "2-col", e = 3) => ({ commands: t, editor: r }) => {
        const s = (Fl[n] || Fl["2-col"]).map((o) => ({
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
      addColumnToRow: (n = "col") => ({ state: e, commands: t, editor: r }) => {
        const { $from: i } = e.selection;
        let s = null;
        for (let a = i.depth; a > 0; a--)
          if (i.node(a).type.name === "bootstrapRow") {
            s = i.before(a);
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
        const { $from: r } = n.selection;
        let i = null;
        for (let l = r.depth; l > 0; l--)
          if (r.node(l).type.name === "bootstrapCol") {
            i = l;
            break;
          }
        if (i === null) return !1;
        const s = i - 1;
        if (r.node(s).type.name !== "bootstrapRow" || r.node(s).childCount <= 1) return !1;
        if (e) {
          const l = r.before(i), a = r.after(i);
          t.delete(l, a), e(t);
        }
        return !0;
      },
      /**
       * Change the column class of the current column.
       * @param {string} colClass - New Bootstrap column class
       */
      setColumnClass: (n) => ({ state: e, dispatch: t, tr: r }) => {
        const { $from: i } = e.selection;
        for (let s = i.depth; s > 0; s--)
          if (i.node(s).type.name === "bootstrapCol")
            return t && (r.setNodeMarkup(i.before(s), void 0, {
              ...i.node(s).attrs,
              colClass: n
            }), t(r)), !0;
        return !1;
      },
      /**
       * Change the gutter of the current row.
       * @param {number} gutter - Bootstrap gutter value (0-5)
       */
      setRowGutter: (n) => ({ state: e, dispatch: t, tr: r }) => {
        const { $from: i } = e.selection;
        for (let s = i.depth; s > 0; s--)
          if (i.node(s).type.name === "bootstrapRow")
            return t && (r.setNodeMarkup(i.before(s), void 0, {
              ...i.node(s).attrs,
              gutter: Math.max(0, Math.min(5, n))
            }), t(r)), !0;
        return !1;
      },
      /**
       * Delete the entire row.
       */
      deleteBootstrapRow: () => ({ state: n, dispatch: e, tr: t }) => {
        const { $from: r } = n.selection;
        for (let i = r.depth; i > 0; i--)
          if (r.node(i).type.name === "bootstrapRow") {
            if (e) {
              const s = r.before(i), o = r.after(i);
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
        var r, i;
        const { state: e } = n, { $from: t } = e.selection;
        for (let s = t.depth; s > 0; s--)
          if (t.node(s).type.name === "bootstrapCol") {
            const o = t.node(s), l = t.node(s - 1);
            if (o.childCount === 1 && ((r = o.firstChild) == null ? void 0 : r.type.name) === "paragraph" && ((i = o.firstChild) == null ? void 0 : i.content.size) === 0 && l.type.name === "bootstrapRow" && l.childCount === 1)
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
      _(e, {
        "data-type": "bootstrap-col",
        class: t
      }),
      0
    ];
  }
}), Yn = [
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
          for (const t of Yn)
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
    const t = Yn.includes(n.attrs.type) ? n.attrs.type : "info";
    return [
      "div",
      _(e, {
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
        const t = Yn.includes(n) ? n : "info";
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
        const t = Yn.includes(n) ? n : "info";
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
    const { headerText: t, footerText: r, borderColor: i } = n.attrs, s = ["card"];
    i && Vl.includes(i) && s.push(`border-${i}`);
    const o = [];
    return t && o.push([
      "div",
      { class: "card-header", contenteditable: "false" },
      t
    ]), o.push(["div", { class: "card-body" }, 0]), r && o.push([
      "div",
      { class: "card-footer", contenteditable: "false" },
      r
    ]), [
      "div",
      _(e, {
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
        const { headerText: t = null, footerText: r = null, borderColor: i = null } = n;
        return e.insertContent({
          type: this.name,
          attrs: { headerText: t, footerText: r, borderColor: i },
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
          const r = e.node(t);
          if (r.type.name === this.name && r.textContent.length === 0)
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
], Hi = ["sm", "lg"], Yb = B.create({
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
    const { text: t, url: r, variant: i, size: s, outline: o, target: l } = n.attrs, a = en.includes(i) ? i : "primary", d = ["btn", o ? `btn-outline-${a}` : `btn-${a}`];
    return s && Hi.includes(s) && d.push(`btn-${s}`), [
      "span",
      _(e, {
        "data-type": "bootstrap-button",
        "data-url": r || "#",
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
          url: r = "#",
          variant: i = "primary",
          size: s = null,
          outline: o = !1,
          target: l = "_self"
        } = n;
        return e.insertContent({
          type: this.name,
          attrs: { text: t, url: r, variant: i, size: s, outline: o, target: l }
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
      const r = document.createElement("span"), { text: i, variant: s, size: o, outline: l, target: a } = n.attrs, c = en.includes(s) ? s : "primary", d = l ? `btn-outline-${c}` : `btn-${c}`;
      return r.className = `btn ${d}`, o && Hi.includes(o) && r.classList.add(`btn-${o}`), r.setAttribute("data-type", "bootstrap-button"), r.setAttribute("role", "button"), r.textContent = i || "Button", r.style.cursor = "pointer", r.contentEditable = "false", r.addEventListener("dblclick", (u) => {
        u.preventDefault(), u.stopPropagation();
        const h = prompt("Button text:", n.attrs.text || "Button");
        if (h === null) return;
        const p = prompt("Button URL:", n.attrs.url || "#");
        if (p === null) return;
        const f = e();
        typeof f == "number" && t.chain().focus().command(({ tr: m }) => (m.setNodeMarkup(f, void 0, {
          ...n.attrs,
          text: h,
          url: p
        }), !0)).run();
      }), {
        dom: r,
        update(u) {
          if (u.type.name !== "bootstrapButton") return !1;
          const h = en.includes(u.attrs.variant) ? u.attrs.variant : "primary", p = u.attrs.outline ? `btn-outline-${h}` : `btn-${h}`;
          return r.className = `btn ${p}`, u.attrs.size && Hi.includes(u.attrs.size) && r.classList.add(`btn-${u.attrs.size}`), r.textContent = u.attrs.text || "Button", !0;
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
      alt: r,
      title: i,
      caption: s,
      width: o,
      height: l,
      alignment: a,
      mediaId: c,
      loading: d,
      widthStyle: u,
      extraClass: h,
      linkUrl: p,
      linkTarget: f
    } = n.attrs;
    let g = `tiptap-image ${a === "left" ? "text-start" : a === "right" ? "text-end" : "text-center"}`;
    h && (g += " " + h);
    const b = _(e, {
      "data-type": "custom-image",
      class: g
    });
    c && (b["data-media-id"] = c), u && (b["data-width-style"] = u), h && (b["data-extra-class"] = h), p && (b["data-link-url"] = p), u && (b.style = `width:${u}`);
    const k = {
      src: t || "",
      alt: r || "",
      class: "img-fluid",
      loading: d || "lazy"
    };
    i && (k.title = i), o && (k.width = String(o)), l && (k.height = String(l));
    const w = ["img", k], S = [p ? ["a", { href: p, target: f || null, rel: f === "_blank" ? "noopener noreferrer" : null }, w] : w];
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
      const r = document.createElement("figure");
      r.classList.add("tiptap-image"), r.setAttribute("data-type", "custom-image"), r.contentEditable = "false";
      const i = (o) => {
        const {
          src: l,
          alt: a,
          title: c,
          caption: d,
          width: u,
          height: h,
          alignment: p,
          mediaId: f,
          widthStyle: m,
          extraClass: g,
          linkUrl: b,
          linkTarget: k
        } = o;
        r.innerHTML = "", r.classList.remove("text-start", "text-center", "text-end"), r.classList.add(
          p === "left" ? "text-start" : p === "right" ? "text-end" : "text-center"
        ), g && r.setAttribute("data-extra-class", g), m ? (r.style.width = m, r.style.display = "inline-block") : (r.style.width = "", r.style.display = ""), f && r.setAttribute("data-media-id", f);
        const w = document.createElement("img");
        if (w.src = l || "", w.alt = a || "", w.className = "img-fluid", w.loading = "lazy", c && (w.title = c), u && (w.width = u), h && (w.height = h), b) {
          const S = document.createElement("a");
          S.href = b, k && (S.target = k), k === "_blank" && (S.rel = "noopener noreferrer"), S.appendChild(w), r.appendChild(S);
        } else
          r.appendChild(w);
        if (d) {
          const S = document.createElement("figcaption");
          S.className = "figure-caption", S.textContent = d, r.appendChild(S);
        }
        const v = document.createElement("button");
        v.type = "button", v.className = "tiptap-image-edit-btn", v.title = "Edit image (double-click)", v.innerHTML = '<i class="bi bi-pencil-square"></i>', v.addEventListener("click", (S) => {
          S.preventDefault(), S.stopPropagation(), s();
        }), r.appendChild(v);
      }, s = () => {
        const o = e._tiptapToolbar;
        if (o != null && o.imageModal) {
          const l = typeof t == "function" ? t() : null;
          l !== null && e.chain().focus().setNodeSelection(l).run(), o.imageModal.open(n.attrs);
        }
      };
      return r.addEventListener("dblclick", (o) => {
        o.preventDefault(), o.stopPropagation(), s();
      }), i(n.attrs), {
        dom: r,
        update(o) {
          return o.type.name !== "customImage" ? !1 : (i(o.attrs), !0);
        },
        destroy() {
        }
      };
    };
  }
}), sr = {
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
function ql(n) {
  for (const [e, t] of Object.entries(sr)) {
    const r = n.match(t.regex);
    if (r && r[1])
      return { provider: e, videoId: r[1] };
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
      }
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-type="custom-video"]' },
      { tag: "div.ratio.ratio-16x9" }
    ];
  },
  renderHTML({ node: n, HTMLAttributes: e }) {
    const { provider: t, videoId: r, url: i, title: s } = n.attrs, o = _(e, {
      "data-type": "custom-video",
      "data-provider": t,
      "data-video-id": r || "",
      "data-url": i || "",
      class: "ratio ratio-16x9"
    });
    if (t === "mp4")
      return [
        "div",
        o,
        [
          "video",
          {
            controls: "true",
            class: "w-100",
            title: s || ""
          },
          ["source", { src: i || r || "", type: "video/mp4" }]
        ]
      ];
    const l = sr[t], a = l ? l.embedUrl(r) : "";
    return [
      "div",
      o,
      [
        "iframe",
        {
          src: a,
          title: s || "",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
          loading: "lazy",
          frameborder: "0"
        }
      ]
    ];
  },
  addCommands() {
    return {
      /**
       * Insert a custom video from a URL.
       * Auto-detects provider (YouTube, Vimeo, MP4).
       * @param {Object} attrs - { url, title? }
       */
      insertCustomVideo: (n = {}) => ({ commands: e }) => {
        const t = ql(n.url || "");
        return t ? e.insertContent({
          type: this.name,
          attrs: {
            provider: t.provider,
            videoId: t.videoId,
            url: n.url,
            title: n.title || ""
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
      const r = document.createElement("div");
      r.setAttribute("data-type", "custom-video"), r.className = "ratio ratio-16x9 tiptap-video-wrapper", r.contentEditable = "false";
      const { provider: i, videoId: s, url: o, title: l } = n.attrs;
      if (r.setAttribute("data-provider", i), i === "mp4") {
        const a = document.createElement("video");
        a.controls = !0, a.className = "w-100", a.title = l || "";
        const c = document.createElement("source");
        c.src = o || s || "", c.type = "video/mp4", a.appendChild(c), r.appendChild(a);
      } else {
        const a = document.createElement("iframe"), c = sr[i];
        a.src = c ? c.embedUrl(s) : "", a.title = l || "", a.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", a.allowFullscreen = !0, a.loading = "lazy", a.frameBorder = "0", r.appendChild(a);
      }
      return r.addEventListener("dblclick", (a) => {
        a.preventDefault(), a.stopPropagation();
        const c = prompt("Video URL:", n.attrs.url || "");
        if (!c) return;
        const d = ql(c);
        if (!d) {
          alert("Unsupported video URL. Supported: YouTube, Vimeo, MP4.");
          return;
        }
        const u = t();
        typeof u == "number" && e.chain().focus().command(({ tr: h }) => (h.setNodeMarkup(u, void 0, {
          ...n.attrs,
          provider: d.provider,
          videoId: d.videoId,
          url: c
        }), !0)).run();
      }), {
        dom: r,
        update(a) {
          if (a.type.name !== "customVideo") return !1;
          const c = a.attrs.provider, d = a.attrs.videoId;
          if (r.innerHTML = "", r.setAttribute("data-provider", c), c === "mp4") {
            const u = document.createElement("video");
            u.controls = !0, u.className = "w-100";
            const h = document.createElement("source");
            h.src = a.attrs.url || d || "", h.type = "video/mp4", u.appendChild(h), r.appendChild(u);
          } else {
            const u = document.createElement("iframe"), h = sr[c];
            u.src = h ? h.embedUrl(d) : "", u.title = a.attrs.title || "", u.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", u.allowFullscreen = !0, u.loading = "lazy", u.frameBorder = "0", r.appendChild(u);
          }
          return !0;
        },
        destroy() {
        }
      };
    };
  }
}), Xn = 3, Wl = [2, 3, 4, 6], ey = B.create({
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
        default: Xn,
        parseHTML: (n) => {
          const e = parseInt(n.getAttribute("data-columns"), 10);
          return Wl.includes(e) ? e : Xn;
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
      _(n, {
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
        const { images: t = [], columns: r = Xn, gap: i = 2, lightbox: s = !1 } = n;
        if (t.length === 0) return !1;
        const o = Math.floor(12 / r), l = t.map((a) => ({
          type: "galleryImage",
          attrs: {
            src: a.src || "",
            alt: a.alt || "",
            colClass: `col-${o}`
          }
        }));
        return e.insertContent({
          type: this.name,
          attrs: { columns: r, gap: i, lightbox: s },
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
        parseHTML: (n) => n.className.split(" ").find((r) => r.startsWith("col-")) || "col-4"
      }
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="gallery-image"]' }];
  },
  renderHTML({ HTMLAttributes: n }) {
    const { src: e, alt: t, colClass: r } = n;
    return [
      "div",
      {
        "data-type": "gallery-image",
        class: `${r || "col-4"} tiptap-gallery__item`
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
  const { char: t, allowSpaces: r, allowToIncludeChar: i, allowedPrefixes: s, startOfLine: o, $position: l } = n, a = r && !i, c = nm(t), d = new RegExp(`\\s${c}$`), u = o ? "^" : "", h = i ? "" : c, p = a ? new RegExp(`${u}${c}.*?(?=\\s${h}|$)`, "gm") : new RegExp(`${u}(?:^)?${c}[^\\s${h}]*`, "gm"), f = ((e = l.nodeBefore) === null || e === void 0 ? void 0 : e.isText) && l.nodeBefore.text;
  if (!f)
    return null;
  const m = l.pos - f.length, g = Array.from(f.matchAll(p)).pop();
  if (!g || g.input === void 0 || g.index === void 0)
    return null;
  const b = g.input.slice(Math.max(0, g.index - 1), g.index), k = new RegExp(`^[${s == null ? void 0 : s.join("")}\0]?$`).test(b);
  if (s !== null && !k)
    return null;
  const w = m + g.index;
  let v = w + g[0].length;
  return a && d.test(f.slice(v - 1, v + 1)) && (g[0] += " ", v += 1), w < l.pos && v >= l.pos ? {
    range: {
      from: w,
      to: v
    },
    query: g[0].slice(t.length),
    text: g[0]
  } : null;
}
const ry = new J("suggestion");
function iy({ pluginKey: n = ry, editor: e, char: t = "@", allowSpaces: r = !1, allowToIncludeChar: i = !1, allowedPrefixes: s = [" "], startOfLine: o = !1, decorationTag: l = "span", decorationClass: a = "suggestion", decorationContent: c = "", decorationEmptyClass: d = "is-empty", command: u = () => null, items: h = () => [], render: p = () => ({}), allow: f = () => !0, findSuggestionMatch: m = ny }) {
  let g;
  const b = p == null ? void 0 : p(), k = new j({
    key: n,
    view() {
      return {
        update: async (w, v) => {
          var S, L, M, O, D, ve, _e;
          const H = (S = this.key) === null || S === void 0 ? void 0 : S.getState(v), ce = (L = this.key) === null || L === void 0 ? void 0 : L.getState(w.state), De = H.active && ce.active && H.range.from !== ce.range.from, ft = !H.active && ce.active, Pe = H.active && !ce.active, Be = !ft && !Pe && H.query !== ce.query, Yt = ft || De && Be, _n = Be || De, ci = Pe || De && Be;
          if (!Yt && !_n && !ci)
            return;
          const Dt = ci && !Yt ? H : ce, so = w.dom.querySelector(`[data-decoration-id="${Dt.decorationId}"]`);
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
            decorationNode: so,
            // virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            clientRect: so ? () => {
              var Xt;
              const { decorationId: td } = (Xt = this.key) === null || Xt === void 0 ? void 0 : Xt.getState(e.state), di = w.dom.querySelector(`[data-decoration-id="${td}"]`);
              return (di == null ? void 0 : di.getBoundingClientRect()) || null;
            } : null
          }, Yt && ((M = b == null ? void 0 : b.onBeforeStart) === null || M === void 0 || M.call(b, g)), _n && ((O = b == null ? void 0 : b.onBeforeUpdate) === null || O === void 0 || O.call(b, g)), (_n || Yt) && (g.items = await h({
            editor: e,
            query: Dt.query
          })), ci && ((D = b == null ? void 0 : b.onExit) === null || D === void 0 || D.call(b, g)), _n && ((ve = b == null ? void 0 : b.onUpdate) === null || ve === void 0 || ve.call(b, g)), Yt && ((_e = b == null ? void 0 : b.onStart) === null || _e === void 0 || _e.call(b, g));
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
      apply(w, v, S, L) {
        const { isEditable: M } = e, { composing: O } = e.view, { selection: D } = w, { empty: ve, from: _e } = D, H = { ...v };
        if (H.composing = O, M && (ve || e.view.composing)) {
          (_e < v.range.from || _e > v.range.to) && !O && !v.composing && (H.active = !1);
          const ce = m({
            char: t,
            allowSpaces: r,
            allowToIncludeChar: i,
            allowedPrefixes: s,
            startOfLine: o,
            $position: D.$from
          }), De = `id_${Math.floor(Math.random() * 4294967295)}`;
          ce && f({
            editor: e,
            state: L,
            range: ce.range,
            isActive: v.active
          }) ? (H.active = !0, H.decorationId = v.decorationId ? v.decorationId : De, H.range = ce.range, H.query = ce.query, H.text = ce.text) : H.active = !1;
        } else
          H.active = !1;
        return H.active || (H.decorationId = null, H.range = { from: 0, to: 0 }, H.query = null, H.text = null), H;
      }
    },
    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(w, v) {
        var S;
        const { active: L, range: M } = k.getState(w.state);
        return L && ((S = b == null ? void 0 : b.onKeyDown) === null || S === void 0 ? void 0 : S.call(b, { view: w, event: v, range: M })) || !1;
      },
      // Setup decorator on the currently active suggestion.
      decorations(w) {
        const { active: v, range: S, decorationId: L, query: M } = k.getState(w);
        if (!v)
          return null;
        const O = !(M != null && M.length), D = [a];
        return O && D.push(d), F.create(w.doc, [
          ie.inline(S.from, S.to, {
            nodeName: l,
            class: D.join(" "),
            "data-decoration-id": L,
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
    (r) => r.label.toLowerCase().includes(t) || r.description.toLowerCase().includes(t) || r.group.toLowerCase().includes(t)
  );
}
function ay(n) {
  const e = {};
  return n.forEach((t) => {
    const r = t.group || "Other";
    e[r] || (e[r] = []), e[r].push(t);
  }), e;
}
function cy() {
  let n = null, e = 0, t = [], r = null;
  function i() {
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
      for (const [p, f] of Object.entries(c))
        d += `<div class="tiptap-slash-menu__group-label">${p}</div>`, f.forEach((m) => {
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
    n.innerHTML = d, n.querySelectorAll(".tiptap-slash-menu__item").forEach((p) => {
      p.addEventListener("mousedown", (f) => {
        f.preventDefault();
        const m = parseInt(p.getAttribute("data-index"), 10);
        o(m);
      }), p.addEventListener("mouseenter", () => {
        e = parseInt(p.getAttribute("data-index"), 10), s(t);
      });
    });
    const h = n.querySelector(".tiptap-slash-menu__item--selected");
    h && h.scrollIntoView({ block: "nearest" });
  }
  function o(a) {
    const c = t[a];
    c && r && r(c);
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
      n || (n = i()), e = 0, r = (c) => {
        c.command({
          editor: a.editor,
          range: a.range
        });
      }, s(a.items), l(a.clientRect);
    },
    onUpdate(a) {
      e = 0, r = (c) => {
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
      n && (n.style.display = "none"), t = [], r = null;
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
      iy({
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
    var r;
    const e = document.createElement("div");
    e.innerHTML = this._template(), this._modal = e.firstElementChild, document.body.appendChild(this._modal);
    const t = (r = window.bootstrap) == null ? void 0 : r.Modal;
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
    const i = e("#tiptap-img-dropzone-el");
    i.addEventListener("dragover", (s) => {
      s.preventDefault(), i.classList.add("tiptap-img-dragover");
    }), i.addEventListener("dragleave", () => i.classList.remove("tiptap-img-dragover")), i.addEventListener("drop", (s) => {
      var l;
      s.preventDefault(), i.classList.remove("tiptap-img-dragover");
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
    const r = this._modal.querySelector(".tiptap-img-dropzone-label");
    r && (r.textContent = "📎 " + e.name);
    const i = this._modal.querySelector(".tiptap-img-file-name");
    i && (i.textContent = e.name, i.classList.remove("d-none"));
    const s = this._modal.querySelector(".tiptap-img-alt-input");
    s && !s.value && (s.value = e.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }
  _updatePreview(e) {
    const t = this._modal.querySelector(".tiptap-img-preview"), r = this._modal.querySelector(".tiptap-img-preview-placeholder");
    e ? (t.src = e, t.style.display = "", r && (r.style.display = "none")) : (t.src = "", t.style.display = "none", r && (r.style.display = ""));
  }
  _populate(e) {
    var l;
    const t = (a) => this._modal.querySelector(a), r = (a) => this._modal.querySelectorAll(a);
    t('[data-tab="url"]').click(), t(".tiptap-img-url-input").value = e.src || "", t(".tiptap-img-alt-input").value = e.alt || "", t(".tiptap-img-caption-input").value = e.caption || "", t(".tiptap-img-link-input").value = e.linkUrl || "", t(".tiptap-img-link-blank").checked = e.linkTarget === "_blank", t(".tiptap-img-width-input").value = e.widthStyle || "", t(".tiptap-img-class-input").value = e.extraClass || "", e.src && this._updatePreview(e.src);
    const i = e.alignment || "center", s = t(`[name="tiptap-img-align-radio"][value="${i}"]`);
    s && (s.checked = !0, r(".tiptap-align-btn").forEach((a) => a.classList.remove("tiptap-align-active")), (l = s.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active"));
    const o = e.widthStyle || "";
    r(".tiptap-width-btn").forEach((a) => {
      a.classList.toggle("active", a.dataset.width === o);
    }), t(".tiptap-img-modal-title-text").textContent = "Edit Image", t(".tiptap-img-insert-btn-label").textContent = "Update Image";
  }
  async _insert() {
    var g, b;
    const e = (k) => this._modal.querySelector(k), t = (g = this._modal.querySelector(".tiptap-img-tab-btn.active")) == null ? void 0 : g.dataset.tab, r = e(".tiptap-img-alt-input").value.trim(), i = e(".tiptap-img-caption-input").value.trim(), s = e(".tiptap-img-link-input").value.trim(), o = e(".tiptap-img-link-blank").checked, l = e(".tiptap-img-width-input").value.trim(), a = e(".tiptap-img-class-input").value.trim(), c = ((b = e('[name="tiptap-img-align-radio"]:checked')) == null ? void 0 : b.value) || "center";
    let d = null;
    l && (l.endsWith("%") || l.endsWith("px") ? d = l : isNaN(parseFloat(l)) || (d = parseFloat(l) + "px"));
    const u = e(".tiptap-img-insert-btn");
    u.disabled = !0, u.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing…';
    let h = null, p = null, f = null, m = null;
    try {
      if (t === "upload" && this._pendingFile) {
        const w = this.toolbar._getUploadUrl();
        if (w) {
          const v = await this.toolbar._uploadFile(this._pendingFile, w);
          h = v.url, p = v.id || null, f = v.width || null, m = v.height || null;
        } else
          h = await this._toBase64(this._pendingFile);
      } else
        h = e(".tiptap-img-url-input").value.trim();
      if (!h) {
        this._showError("Please provide an image file or URL.");
        return;
      }
      const k = {
        src: h,
        alt: r || "",
        caption: i || null,
        linkUrl: s || null,
        linkTarget: s && o ? "_blank" : null,
        widthStyle: d || null,
        extraClass: a || null,
        alignment: c,
        mediaId: p || null,
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
    return new Promise((t, r) => {
      const i = new FileReader();
      i.onload = (s) => t(s.target.result), i.onerror = r, i.readAsDataURL(e);
    });
  }
  _reset() {
    var l, a, c;
    const e = (d) => this._modal.querySelector(d), t = (d) => this._modal.querySelectorAll(d);
    this._pendingFile = null, this._editMode = !1;
    const r = e(".tiptap-img-file-input");
    r && (r.value = ""), e(".tiptap-img-url-input").value = "", e(".tiptap-img-alt-input").value = "", e(".tiptap-img-caption-input").value = "", e(".tiptap-img-link-input").value = "", e(".tiptap-img-link-blank").checked = !1, e(".tiptap-img-width-input").value = "", e(".tiptap-img-class-input").value = "", this._updatePreview("");
    const i = e(".tiptap-img-dropzone-label");
    i && (i.textContent = "Drag & drop image here, or click to browse");
    const s = e(".tiptap-img-file-name");
    s && s.classList.add("d-none");
    const o = e('[name="tiptap-img-align-radio"][value="center"]');
    o && (o.checked = !0, t(".tiptap-align-btn").forEach((d) => d.classList.remove("tiptap-align-active")), (l = o.closest(".tiptap-align-btn")) == null || l.classList.add("tiptap-align-active")), t(".tiptap-width-btn").forEach((d) => d.classList.remove("active")), (a = e('[data-width=""]')) == null || a.classList.add("active"), (c = e('[data-tab="upload"]')) == null || c.click(), e(".tiptap-img-modal-title-text").textContent = "Insert Image", e(".tiptap-img-insert-btn-label").textContent = "Insert Image";
  }
}
const zi = {
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
}, hy = [
  { id: "1-col", label: "1 Column", icon: "[ 12 ]" },
  { id: "2-col", label: "2 Columns", icon: "[ 6 | 6 ]" },
  { id: "3-col", label: "3 Columns", icon: "[ 4 | 4 | 4 ]" },
  { id: "4-col", label: "4 Columns", icon: "[ 3 | 3 | 3 | 3 ]" },
  { id: "1-2", label: "Sidebar Left", icon: "[ 4 | 8 ]" },
  { id: "2-1", label: "Sidebar Right", icon: "[ 8 | 4 ]" },
  { id: "1-1-2", label: "2 Narrow + Wide", icon: "[ 3 | 3 | 6 ]" },
  { id: "2-1-1", label: "Wide + 2 Narrow", icon: "[ 6 | 3 | 3 ]" }
], py = [
  { id: "primary", label: "Primary", color: "#0d6efd" },
  { id: "secondary", label: "Secondary", color: "#6c757d" },
  { id: "success", label: "Success", color: "#198754" },
  { id: "danger", label: "Danger", color: "#dc3545" },
  { id: "warning", label: "Warning", color: "#ffc107" },
  { id: "info", label: "Info", color: "#0dcaf0" },
  { id: "light", label: "Light", color: "#f8f9fa" },
  { id: "dark", label: "Dark", color: "#212529" }
];
class fy {
  /**
   * @param {HTMLElement} toolbarElement - The [data-tiptap-toolbar] element
   * @param {import('@tiptap/core').Editor} editor - Tiptap editor instance
   * @param {Object} config - Toolbar config with groups
   */
  constructor(e, t, r = {}) {
    this.element = e, this.editor = t, this.config = r, this.buttons = /* @__PURE__ */ new Map(), this.editor._tiptapToolbar = this, this.imageModal = new uy(this), this._render(), this._bindEvents();
  }
  /**
   * Render toolbar buttons into the toolbar element.
   * @private
   */
  _render() {
    const e = this.config.groups || {}, t = this.element.querySelector(".tiptap-toolbar") || this.element;
    t.innerHTML = "";
    const r = Object.keys(e);
    r.forEach((i, s) => {
      const o = e[i];
      if (!o || o.length === 0) return;
      const l = document.createElement("div");
      if (l.className = "tiptap-toolbar__group", l.setAttribute("role", "group"), l.setAttribute("aria-label", i), o.forEach((a) => {
        const c = zi[a];
        c && (c.type === "color" ? l.appendChild(this._createColorButton(a, c)) : c.type === "dropdown" ? l.appendChild(this._createDropdownButton(a, c)) : l.appendChild(this._createButton(a, c)));
      }), t.appendChild(l), s < r.length - 1) {
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
    const r = document.createElement("button");
    return r.type = "button", r.className = "tiptap-toolbar__button", r.setAttribute("data-action", e), r.setAttribute("aria-label", t.label), r.setAttribute("title", t.label), r.innerHTML = `<i class="bi bi-${t.icon}"></i>`, this.buttons.set(e, r), r;
  }
  /**
   * Create a color picker toolbar button.
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createColorButton(e, t) {
    const r = document.createElement("span");
    r.className = "tiptap-toolbar__color-wrapper", r.style.position = "relative", r.style.display = "inline-flex";
    const i = document.createElement("button");
    i.type = "button", i.className = "tiptap-toolbar__button", i.setAttribute("data-action", e), i.setAttribute("aria-label", t.label), i.setAttribute("title", t.label), i.innerHTML = `<i class="bi bi-${t.icon}"></i>`;
    const s = document.createElement("input");
    return s.type = "color", s.className = "tiptap-toolbar__color-input", s.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; padding: 0; border: 0; cursor: pointer; opacity: 0.7;", s.value = "#000000", s.addEventListener("input", (o) => {
      this.editor.chain().focus().setColor(o.target.value).run();
    }), i.addEventListener("click", () => {
      s.click();
    }), r.appendChild(i), r.appendChild(s), this.buttons.set(e, i), r;
  }
  /**
   * Create a dropdown toolbar button (e.g., layout presets).
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createDropdownButton(e, t) {
    const r = document.createElement("div");
    r.className = "tiptap-toolbar__dropdown", r.style.position = "relative", r.style.display = "inline-flex";
    const i = document.createElement("button");
    i.type = "button", i.className = "tiptap-toolbar__button", i.setAttribute("data-action", e), i.setAttribute("aria-label", t.label), i.setAttribute("title", t.label), i.setAttribute("aria-haspopup", "true"), i.setAttribute("aria-expanded", "false"), i.innerHTML = `<i class="bi bi-${t.icon}"></i>`;
    const s = document.createElement("div");
    return s.className = "tiptap-toolbar__dropdown-menu", s.setAttribute("role", "menu"), s.style.display = "none", e === "row" && hy.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-layout-preset", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__preset-icon">${o.icon}</span> <span>${o.label}</span>`, s.appendChild(l);
    }), e === "alert" && py.forEach((o) => {
      const l = document.createElement("button");
      l.type = "button", l.className = "tiptap-toolbar__dropdown-item", l.setAttribute("data-alert-type", o.id), l.setAttribute("role", "menuitem"), l.innerHTML = `<span class="tiptap-toolbar__alert-swatch" style="background:${o.color}"></span> <span>${o.label}</span>`, s.appendChild(l);
    }), i.addEventListener("click", (o) => {
      o.stopPropagation();
      const l = s.style.display !== "none";
      this._closeAllDropdowns(), l || (s.style.display = "block", i.setAttribute("aria-expanded", "true"));
    }), s.addEventListener("click", (o) => {
      const l = o.target.closest("[data-layout-preset]");
      if (l) {
        o.stopPropagation();
        const c = l.getAttribute("data-layout-preset");
        this.editor.chain().focus().insertBootstrapRow(c).run(), s.style.display = "none", i.setAttribute("aria-expanded", "false");
        return;
      }
      const a = o.target.closest("[data-alert-type]");
      if (a) {
        o.stopPropagation();
        const c = a.getAttribute("data-alert-type");
        this.editor.chain().focus().insertBootstrapAlert(c).run(), s.style.display = "none", i.setAttribute("aria-expanded", "false");
      }
    }), r.appendChild(i), r.appendChild(s), this.buttons.set(e, i), r;
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
      const r = t.getAttribute("data-action");
      this._executeAction(r);
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
    const t = zi[e];
    if (!t || !this.editor) return;
    const r = t.command;
    if (r === "_promptLink") {
      this._handleLink();
      return;
    }
    if (r === "_promptImage") {
      this._handleImage();
      return;
    }
    if (r === "_promptColor" || r === "_showLayoutDropdown" || r === "_showAlertDropdown")
      return;
    if (r === "_insertCard") {
      this._handleInsertCard();
      return;
    }
    if (r === "_insertButton") {
      this._handleInsertButton();
      return;
    }
    if (r === "_promptVideo") {
      this._handleVideo();
      return;
    }
    if (r === "_promptGallery") {
      this._handleGallery();
      return;
    }
    if (r === "_toggleAiPanel") {
      this._handleToggleAiPanel();
      return;
    }
    if (r === "_toggleDarkMode") {
      this._handleToggleDarkMode();
      return;
    }
    if (r === "_showShortcuts") {
      this._handleShowShortcuts();
      return;
    }
    const i = this.editor.chain().focus();
    t.commandArgs !== void 0 ? i[r](t.commandArgs).run() : i[r]().run();
  }
  /**
   * Handle link insertion/removal with a prompt.
   * @private
   */
  _handleLink() {
    if (this.editor.isActive("link")) {
      this.editor.chain().focus().unsetLink().run();
      return;
    }
    const e = prompt("Enter URL:");
    e && this.editor.chain().focus().extendMarkRange("link").setLink({ href: e }).run();
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
    var i;
    const e = this.element.closest("[data-tiptap-editor]"), t = e == null ? void 0 : e.getAttribute("data-upload-url");
    return t || ((i = document.querySelector('meta[name="tiptap-upload-url"]')) == null ? void 0 : i.content) || null;
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
    const r = new FormData();
    r.append("file", e);
    const i = ((l = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : l.content) || "", s = await fetch(t, {
      method: "POST",
      headers: {
        "X-CSRF-TOKEN": i,
        Accept: "application/json"
      },
      body: r
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
    const e = prompt("Enter video URL (YouTube, Vimeo, or MP4):");
    e && this.editor.chain().focus().insertCustomVideo({ url: e }).run();
  }
  /**
   * Handle gallery insertion with file picker for multiple images.
   * @private
   */
  _handleGallery() {
    const e = document.createElement("input");
    e.type = "file", e.accept = "image/*", e.multiple = !0, e.style.display = "none", e.addEventListener("change", async (t) => {
      const r = Array.from(t.target.files || []);
      if (r.length !== 0)
        try {
          const i = this._getUploadUrl(), s = [];
          for (const o of r)
            if (i) {
              const l = await this._uploadFile(o, i);
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
        } catch (i) {
          console.error("[TiptapEditor] Gallery upload failed:", i), alert("Gallery upload failed. Please try again.");
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
    this.buttons.forEach((t, r) => {
      const i = zi[r];
      if (!i || !i.isActive) {
        t.classList.remove("tiptap-toolbar__button--active");
        return;
      }
      try {
        const s = i.isActive(e);
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
    var e;
    (e = this.imageModal) == null || e.destroy(), this.imageModal = null, this.buttons.clear(), this.element.innerHTML = "", this.editor && (this.editor._tiptapToolbar = null), this.editor = null;
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
}, my = 10, $i = "tiptap_ai_recent_prompts";
class gy {
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
      ([t, r]) => `<button type="button" class="tiptap-ai-panel__action-btn${t === "generate" ? " active" : ""}" data-ai-action="${t}" title="${r.description}">
          <i class="bi bi-${r.icon}"></i> ${r.label}
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
    this._els.actionButtons.forEach((r) => {
      r.classList.toggle("active", r.dataset.aiAction === e);
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
    const t = this.currentAction, r = tn[t];
    let i = { prompt: e, action: t };
    if (r.requiresContent) {
      const o = this.editorInstance.editor, a = this._getSelectedHtml() || o.getHTML();
      if (!a || a === "<p></p>") {
        this._showError("No content available. Please write or select some content first.");
        return;
      }
      i.content = a, t === "translate" && (i.target_lang = e);
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
        body: JSON.stringify(i),
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
      const { from: r, to: i } = e.state.selection;
      r !== i ? e.chain().focus().deleteSelection().insertContent(this.previewContent).run() : e.commands.setContent(this.previewContent);
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
    const e = this.editorInstance.editor, { from: t, to: r } = e.state.selection;
    if (t === r) return null;
    const i = e.state.doc.slice(t, r), s = document.createElement("div"), o = e.view.domSerializer.serializeFragment(i.content);
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
      let t = JSON.parse(localStorage.getItem($i) || "[]");
      t = t.filter((r) => r !== e), t.unshift(e), t = t.slice(0, my), localStorage.setItem($i, JSON.stringify(t)), this._loadRecentPrompts();
    } catch {
    }
  }
  /**
   * Load and render recent prompts.
   * @private
   */
  _loadRecentPrompts() {
    try {
      const e = JSON.parse(localStorage.getItem($i) || "[]");
      if (e.length === 0) {
        this._els.recentList.innerHTML = "";
        return;
      }
      const t = e.slice(0, 5).map(
        (r) => `<button type="button" class="tiptap-ai-panel__recent-item" title="${this._escapeAttr(r)}">${this._truncate(r, 50)}</button>`
      ).join("");
      this._els.recentList.innerHTML = `
        <div class="tiptap-ai-panel__recent-label">Recent:</div>
        ${t}
      `, this._els.recentList.querySelectorAll(".tiptap-ai-panel__recent-item").forEach((r, i) => {
        r.addEventListener("click", () => {
          this._els.promptArea.value = e[i], this._els.promptArea.focus();
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
const by = [
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
], yy = [
  { id: "paragraph", label: "Paragraph", icon: "text-paragraph" },
  { id: "heading1", label: "Heading 1", icon: "type-h1" },
  { id: "heading2", label: "Heading 2", icon: "type-h2" },
  { id: "heading3", label: "Heading 3", icon: "type-h3" },
  { id: "bulletList", label: "Bullet List", icon: "list-ul" },
  { id: "orderedList", label: "Ordered List", icon: "list-ol" },
  { id: "blockquote", label: "Blockquote", icon: "blockquote-left" },
  { id: "codeBlock", label: "Code Block", icon: "code-square" }
];
class ky {
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
    this.handleEl = document.createElement("button"), this.handleEl.type = "button", this.handleEl.className = "tiptap-block-handle", this.handleEl.innerHTML = '<i class="bi bi-grip-vertical"></i>', this.handleEl.setAttribute("aria-label", "Block actions"), this.handleEl.setAttribute("title", "Block actions"), this.handleEl.style.display = "none", this.menuEl = document.createElement("div"), this.menuEl.className = "tiptap-block-menu", this.menuEl.setAttribute("role", "menu"), this.menuEl.style.display = "none", by.forEach((r) => {
      if (r.separator) {
        const s = document.createElement("div");
        s.className = "tiptap-block-menu__separator", this.menuEl.appendChild(s);
      }
      const i = document.createElement("button");
      i.type = "button", i.className = `tiptap-block-menu__item${r.danger ? " tiptap-block-menu__item--danger" : ""}`, i.setAttribute("data-action", r.id), i.setAttribute("role", "menuitem"), i.innerHTML = `<i class="bi bi-${r.icon}"></i> <span>${r.label}</span>`, this.menuEl.appendChild(i);
    });
    const e = document.createElement("div");
    e.className = "tiptap-block-menu__separator", this.menuEl.appendChild(e);
    const t = document.createElement("div");
    t.className = "tiptap-block-menu__group-label", t.textContent = "Turn into", this.menuEl.appendChild(t), yy.forEach((r) => {
      const i = document.createElement("button");
      i.type = "button", i.className = "tiptap-block-menu__item", i.setAttribute("data-turn-into", r.id), i.setAttribute("role", "menuitem"), i.innerHTML = `<i class="bi bi-${r.icon}"></i> <span>${r.label}</span>`, this.menuEl.appendChild(i);
    }), this.wrapper.appendChild(this.handleEl), this.wrapper.appendChild(this.menuEl);
  }
  /**
   * Bind event listeners.
   * @private
   */
  _bindEvents() {
    const e = this.editorInstance.contentElement;
    e && (e.addEventListener("mousemove", (r) => this._onMouseMove(r)), e.addEventListener("mouseleave", () => this._onMouseLeave())), this.handleEl.addEventListener("click", (r) => {
      r.stopPropagation(), this._toggleMenu();
    }), this.handleEl.addEventListener("mousedown", (r) => {
      r.preventDefault();
    }), this.menuEl.addEventListener("click", (r) => {
      r.stopPropagation();
      const i = r.target.closest("[data-action]");
      if (i) {
        this._executeAction(i.getAttribute("data-action"));
        return;
      }
      const s = r.target.closest("[data-turn-into]");
      s && this._executeTurnInto(s.getAttribute("data-turn-into"));
    }), document.addEventListener("click", (r) => {
      !this.menuEl.contains(r.target) && !this.handleEl.contains(r.target) && this._closeMenu();
    }), document.addEventListener("keydown", (r) => {
      r.key === "Escape" && this._isMenuOpen && this._closeMenu();
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
    var i;
    if (!e || !e.closest) return null;
    const t = (i = this.editorInstance.contentElement) == null ? void 0 : i.querySelector(".ProseMirror");
    if (!t) return null;
    let r = e;
    for (; r && r.parentElement !== t; )
      r = r.parentElement;
    return !r || r === t ? null : r;
  }
  /**
   * Position the block handle to the left of a block element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _positionHandle(e) {
    if (!this.handleEl) return;
    clearTimeout(this._hideTimeout);
    const t = this.wrapper.getBoundingClientRect(), r = e.getBoundingClientRect();
    this.handleEl.style.display = "flex", this.handleEl.style.position = "absolute", this.handleEl.style.left = "-2px", this.handleEl.style.top = `${r.top - t.top}px`, this._resolveNodePos(e);
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
        const r = this.editor.state.doc.resolve(t);
        this.currentNodePos = r.before(1);
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
    const { state: t } = this.editor, r = t.doc.nodeAt(this.currentNodePos);
    if (!r) {
      this._closeMenu();
      return;
    }
    switch (e) {
      case "duplicate":
        this._duplicateBlock(r);
        break;
      case "moveUp":
        this._moveBlock(-1);
        break;
      case "moveDown":
        this._moveBlock(1);
        break;
      case "delete":
        this._deleteBlock(r);
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
    const t = this.currentNodePos + e.nodeSize, r = e.toJSON();
    this.editor.chain().focus().insertContentAt(t, r).run();
  }
  /**
   * Move the current block up or down.
   * @private
   * @param {number} direction - -1 for up, 1 for down
   */
  _moveBlock(e) {
    const { state: t } = this.editor, { doc: r } = t, i = this.currentNodePos, s = r.nodeAt(i);
    if (!s) return;
    const o = i + s.nodeSize;
    if (e === -1) {
      const l = r.resolve(i);
      if (l.index(0) === 0) return;
      const a = l.before(1) - 1, d = r.resolve(a).before(1), u = s.toJSON();
      this.editor.chain().focus().deleteRange({ from: i, to: o }).insertContentAt(d, u).run();
    } else {
      if (o >= r.content.size) return;
      const l = r.nodeAt(o);
      if (!l) return;
      const a = o + l.nodeSize, c = s.toJSON();
      this.editor.chain().focus().deleteRange({ from: i, to: o }).insertContentAt(a - s.nodeSize, c).run();
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
  const r = document.createElement(n);
  return Object.entries(e).forEach(([i, s]) => {
    i === "className" ? r.className = s : i === "style" && typeof s == "object" ? Object.assign(r.style, s) : i.startsWith("on") && typeof s == "function" ? r.addEventListener(i.slice(2).toLowerCase(), s) : i === "dataset" && typeof s == "object" ? Object.entries(s).forEach(([o, l]) => {
      r.dataset[o] = l;
    }) : r.setAttribute(i, s);
  }), t.forEach((i) => {
    typeof i == "string" ? r.appendChild(document.createTextNode(i)) : i instanceof HTMLElement && r.appendChild(i);
  }), r;
}
function Ss() {
  var e;
  const n = ((e = navigator.userAgentData) == null ? void 0 : e.platform) || navigator.platform || "";
  return /mac/i.test(n) ? "mac" : /linux/i.test(n) ? "linux" : "windows";
}
function wy(n) {
  const t = Ss() === "mac";
  return n.replace(/Mod/g, t ? "⌘" : "Ctrl").replace(/Alt/g, t ? "⌥" : "Alt").replace(/Shift/g, t ? "⇧" : "Shift").replace(/\+/g, t ? "" : "+");
}
const Cy = [
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
class Sy {
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
    (Ss() === "mac" ? e.metaKey : e.ctrlKey) && e.key === "/" && (e.preventDefault(), this.toggle()), e.key === "Escape" && this._visible && this.close();
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
    }), this._overlay.addEventListener("click", (i) => {
      i.target === this._overlay && this.close();
    });
    const e = ee("div", { className: "tiptap-shortcuts-modal" }), t = ee("div", { className: "tiptap-shortcuts-modal__header" }, [
      ee("h3", { className: "tiptap-shortcuts-modal__title" }, ["Keyboard Shortcuts"]),
      ee("button", {
        className: "tiptap-shortcuts-modal__close",
        "aria-label": "Close",
        type: "button",
        onClick: () => this.close()
      }, ["×"])
    ]), r = ee("div", { className: "tiptap-shortcuts-modal__body" });
    Cy.forEach((i) => {
      r.appendChild(
        ee("div", { className: "tiptap-shortcuts__group-title" }, [i.title])
      ), i.shortcuts.forEach((s) => {
        const o = wy(s.keys), l = this._splitKeys(o), a = ee("span", { className: "tiptap-shortcuts__keys" });
        l.forEach((c) => {
          a.appendChild(
            ee("kbd", { className: "tiptap-shortcuts__key" }, [c])
          );
        }), r.appendChild(
          ee("div", { className: "tiptap-shortcuts__item" }, [
            ee("span", { className: "tiptap-shortcuts__label" }, [s.label]),
            a
          ])
        );
      });
    }), e.appendChild(t), e.appendChild(r), this._overlay.appendChild(e), document.body.appendChild(this._overlay);
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
    if (Ss() === "mac") {
      const t = [];
      let r = "";
      for (const i of e)
        "⌘⇧⌥".includes(i) ? (r && t.push(r), t.push(i), r = "") : r += i;
      return r && t.push(r), t.length ? t : [e];
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
class xy {
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
    ), this._toolbarButtons.length !== 0 && (this._toolbarButtons.forEach((t, r) => {
      t.setAttribute("tabindex", r === 0 ? "0" : "-1");
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
    var i;
    const t = this._toolbarButtons;
    if (t.length === 0) return;
    let r = !1;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown": {
        this._focusedIndex = (this._focusedIndex + 1) % t.length, r = !0;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        this._focusedIndex = (this._focusedIndex - 1 + t.length) % t.length, r = !0;
        break;
      }
      case "Home": {
        this._focusedIndex = 0, r = !0;
        break;
      }
      case "End": {
        this._focusedIndex = t.length - 1, r = !0;
        break;
      }
      case "Escape": {
        (i = this.editorInstance.editor) == null || i.commands.focus(), r = !0;
        break;
      }
    }
    r && (e.preventDefault(), t.forEach((s, o) => {
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
    ), this._focusedIndex = 0, this._toolbarButtons.forEach((t, r) => {
      t.setAttribute("tabindex", r === 0 ? "0" : "-1");
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
const jl = [
  { id: "desktop", label: "Desktop", icon: "bi-display", width: null },
  { id: "tablet", label: "Tablet (768px)", icon: "bi-tablet", width: 768 },
  { id: "mobile", label: "Mobile (375px)", icon: "bi-phone", width: 375 }
];
class vy {
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
    ), jl.forEach((t) => {
      const r = ee("button", {
        className: `tiptap-preview-bar__btn${t.id === "desktop" ? " tiptap-preview-bar__btn--active" : ""}`,
        type: "button",
        "aria-label": t.label,
        title: t.label,
        "aria-pressed": t.id === "desktop" ? "true" : "false",
        dataset: { previewMode: t.id }
      }, [
        ee("i", { className: `bi ${t.icon}` })
      ]);
      r.addEventListener("click", () => this.setMode(t.id)), this._buttons.set(t.id, r), this._bar.appendChild(r);
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
    const t = jl.find((r) => r.id === e);
    !t || e === this.currentMode || (this.currentMode = e, this._buttons.forEach((r, i) => {
      const s = i === e;
      r.classList.toggle("tiptap-preview-bar__btn--active", s), r.setAttribute("aria-pressed", s ? "true" : "false");
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
class My {
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
    var r;
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
      onUpdate: ({ editor: i }) => {
        this._syncToInput(), this._emit("change", { json: i.getJSON(), html: i.getHTML() });
      },
      onFocus: ({ editor: i, event: s }) => {
        this.wrapper.classList.add("tiptap-editor--focused"), this._emit("focus", { editor: i, event: s });
      },
      onBlur: ({ editor: i, event: s }) => {
        this.wrapper.classList.remove("tiptap-editor--focused"), this._emit("blur", { editor: i, event: s });
      },
      onSelectionUpdate: ({ editor: i }) => {
        this._emit("selectionUpdate", { editor: i }), this.toolbar && this.toolbar.updateActiveStates(i);
      },
      onTransaction: ({ editor: i }) => {
        this.toolbar && this.toolbar.updateActiveStates(i);
      }
    }), this.toolbarElement && (this.toolbar = new fy(this.toolbarElement, this.editor, this.config.toolbar || {})), (r = this.config.ai) != null && r.enabled && (this.aiPanel = new gy(this, this.config.ai), this.wrapper.addEventListener("tiptap:toggle-ai-panel", () => {
      this.openAiPanel();
    })), this.blockMenu = new ky(this), this.a11y = new xy(this), this.shortcuts = new Sy(this), this.responsivePreview = new vy(this), this._initTheme(), this.wrapper.addEventListener("tiptap:insert-image", () => {
      this.toolbar && this.toolbar._handleImage();
    }), this.wrapper.addEventListener("tiptap:toggle-dark-mode", () => {
      const i = this.getTheme(), s = i === "auto" ? "dark" : i === "dark" ? "light" : "auto";
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
    var r;
    const e = this.config.extensions || [], t = [];
    return t.push(
      ng.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      })
    ), e.includes("underline") && t.push(rg), e.includes("link") && t.push(
      Tg.configure({
        openOnClick: !1,
        HTMLAttributes: {
          rel: "noopener noreferrer"
        }
      })
    ), e.includes("textAlign") && t.push(
      Ng.configure({
        types: ["heading", "paragraph"]
      })
    ), t.push(
      Og.configure({
        placeholder: this.config.placeholder || "Start writing..."
      })
    ), e.includes("characterCount") && t.push(Lg), e.includes("subscript") && t.push(Rg), e.includes("superscript") && t.push(Ig), e.includes("color") && (t.push(Dg), t.push(Pg)), e.includes("highlight") && t.push(
      zg.configure({
        multicolor: !0
      })
    ), e.includes("customImage") && t.push(Qb), e.includes("customVideo") && t.push(Zb), e.includes("table") && (t.push(
      Vb.configure({
        resizable: !0
      })
    ), t.push(qb), t.push(Wb), t.push(jb)), e.includes("bootstrapRow") && t.push(Ub), (e.includes("bootstrapCol") || e.includes("bootstrapRow")) && (t.some((i) => i.name === "bootstrapCol") || t.push(Kb)), e.includes("bootstrapAlert") && t.push(Jb), e.includes("bootstrapCard") && t.push(Gb), e.includes("bootstrapButton") && t.push(Yb), e.includes("gallery") && (t.push(ey), t.push(ty)), e.includes("slashCommands") && t.push(dy.configure({
      commands: ((r = this.config.slashCommands) == null ? void 0 : r.commands) || null
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
    return this._listeners[e] ? (this._listeners[e] = this._listeners[e].filter((r) => r !== t), this) : this;
  }
  /**
   * Emit an event to all registered listeners.
   * @private
   * @param {string} event
   * @param {*} data
   */
  _emit(e, t) {
    this._listeners[e] && this._listeners[e].forEach((r) => r(t));
  }
}
class Ay {
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
    const r = e.querySelector("[data-media-search]");
    let i;
    r.addEventListener("input", (o) => {
      clearTimeout(i), this.searchQuery = o.target.value, i = setTimeout(() => {
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
      const r = await fetch(`${this.browseUrl}?${t.toString()}`, {
        headers: { Accept: "application/json" }
      });
      if (!r.ok) throw new Error("Failed to load media");
      const i = await r.json();
      this._renderGrid(i.data || []), this._renderPagination(i.pagination || {});
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
    var r;
    const t = (r = this.modal) == null ? void 0 : r.querySelector("[data-media-grid]");
    if (t) {
      if (e.length === 0) {
        t.innerHTML = '<div class="tiptap-media-browser__empty">No media found.</div>';
        return;
      }
      t.innerHTML = "", e.forEach((i) => {
        var o;
        const s = document.createElement("div");
        s.className = "tiptap-media-browser__item", s.setAttribute("data-media-id", i.id), (o = i.mime_type) != null && o.startsWith("image/") ? s.innerHTML = `<img src="${i.thumbnail || i.url}" alt="${i.alt || i.filename}" loading="lazy">` : s.innerHTML = '<div class="tiptap-media-browser__video-thumb"><i class="bi bi-play-btn"></i></div>', s.innerHTML += `<div class="tiptap-media-browser__item-name">${i.filename}</div>`, s.addEventListener("click", () => {
          this.onSelect(i), this.close();
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
    var r;
    const t = (r = this.modal) == null ? void 0 : r.querySelector("[data-media-pagination]");
    if (t && (t.innerHTML = "", !(!e.last_page || e.last_page <= 1)))
      for (let i = 1; i <= e.last_page; i++) {
        const s = document.createElement("button");
        s.type = "button", s.className = "tiptap-media-browser__page-btn", i === e.current_page && s.classList.add("active"), s.textContent = String(i), s.addEventListener("click", () => {
          this.currentPage = i, this._loadMedia();
        }), t.appendChild(s);
      }
  }
  /**
   * Handle file upload from the modal.
   * @private
   */
  async _handleUpload(e) {
    var r, i;
    const t = (r = e.target.files) == null ? void 0 : r[0];
    if (!(!t || !this.uploadUrl)) {
      try {
        const s = new FormData();
        s.append("file", t);
        const o = ((i = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : i.content) || "";
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
function Ul() {
  const n = document.querySelectorAll("[data-tiptap-editor]"), e = [];
  return n.forEach((t) => {
    if (t.dataset.initialized === "true") return;
    const r = t.dataset.config, i = r ? JSON.parse(r) : {}, s = new My(t, i), o = t.id || `tiptap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    t.id = o, t.dataset.initialized = "true", On.set(o, s), e.push(s);
  }), e;
}
function Ty(n) {
  return On.get(n);
}
function Ny() {
  return On;
}
function Oy(n) {
  const e = On.get(n);
  e && (e.destroy(), On.delete(n));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Ul) : Ul();
export {
  xy as AccessibilityManager,
  gy as AiPanel,
  ky as BlockMenu,
  Sy as KeyboardShortcuts,
  Ay as MediaBrowser,
  vy as ResponsivePreview,
  My as TiptapEditor,
  Oy as destroyEditor,
  Ny as getAllEditors,
  Ty as getEditor,
  Ul as initEditors
};
//# sourceMappingURL=tiptap-editor.es.js.map
